import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GenerateStory from '@/views/GenerateStory.vue'

// Stub the generation form to simplify interactions
vi.mock('@/components/generation/StoryGenerateForm.vue', () => ({
  default: {
    name: 'StoryGenerateForm',
    template: `<div><button data-testid="mock-submit" @click="$emit('submit', { story_type: 'short-story', title: 't', is_private: true })">Submit</button></div>`
  }
}))

// Mock useGeneration to control replies across calls
const mockGenerate = vi.fn()
vi.mock('@/composables/useGeneration', () => ({
  useGeneration: () => ({ generateStory: mockGenerate })
}))

function makeResult(overrides: Partial<any> = {}) {
  return {
    title: 'Title A',
    description: 'Desc A',
    content: 'Content A',
    story_type: 'short-story',
    genre: 'Drama',
    image_url: undefined,
    ...overrides,
  }
}

const SEL = {
  submit: '[data-testid="mock-submit"]',
  preview: '[data-testid="story-generate-preview"]',
  retry: '[data-testid="retry-btn"]',
  undo: '[data-testid="undo-btn"]',
  edit: '[data-testid="edit-btn"]',
  discard: '[data-testid="discard-btn"]',
  idemKey: '[data-testid="idempotency-key"]',
}

describe('GenerateStory view — 4.1.4d.3 Preview wiring + idempotency', () => {
  beforeEach(() => {
    mockGenerate.mockReset()
  })

  it('persists per-preview idempotency key; retry changes it; undo restores it; edit/discard reset it', async () => {
    // First generate → A, second (retry) → B
    mockGenerate
      .mockResolvedValueOnce({ ok: true, data: makeResult({ title: 'Title A', content: 'AAA' }) })
      .mockResolvedValueOnce({ ok: true, data: makeResult({ title: 'Title B', content: 'BBB' }) })

    const wrapper = mount(GenerateStory)

    // Submit to generate first preview
    await wrapper.get(SEL.submit).trigger('click')
    await flushPromises()

    // Preview renders and exposes idempotency key
    expect(wrapper.find(SEL.preview).exists()).toBe(true)
    const key1 = wrapper.find(SEL.idemKey).text()
    expect(key1 && key1.length > 0).toBe(true)

    // Retry → new preview and a new key
    await wrapper.get(SEL.retry).trigger('click')
    await flushPromises()
    const key2 = wrapper.find(SEL.idemKey).text()
    expect(key2 && key2.length > 0).toBe(true)
    expect(key2).not.toBe(key1)

    // Undo → restores previous preview and key1
    await wrapper.get(SEL.undo).trigger('click')
    await flushPromises()
    const key3 = wrapper.find(SEL.idemKey).text()
    expect(key3).toBe(key1)

    // Edit prompts → clears preview and key
    await wrapper.get(SEL.edit).trigger('click')
    await flushPromises()
    expect(wrapper.find(SEL.preview).exists()).toBe(false)
    expect(wrapper.find(SEL.idemKey).text()).toBe('')

    // Generate again (now A then B queued are consumed; add another A for this test)
    mockGenerate.mockResolvedValueOnce({ ok: true, data: makeResult({ title: 'Title C', content: 'CCC' }) })
    await wrapper.get(SEL.submit).trigger('click')
    await flushPromises()
    const keyNew = wrapper.find(SEL.idemKey).text()
    expect(keyNew && keyNew.length > 0).toBe(true)

    // Discard → clears preview and key
    await wrapper.get(SEL.discard).trigger('click')
    await flushPromises()
    expect(wrapper.find(SEL.preview).exists()).toBe(false)
    expect(wrapper.find(SEL.idemKey).text()).toBe('')
  })
})
