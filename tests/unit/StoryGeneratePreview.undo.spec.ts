import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import StoryGeneratePreview from '@/components/generation/StoryGeneratePreview.vue'

type PreviewDraft = {
  title: string
  description?: string
  content: string
  story_type: 'short-story' | 'movie-summary' | 'tv-commercial'
  genre?: string
  image_url?: string
}

const S = {
  title: '[data-testid="preview-title"]',
  content: '[data-testid="preview-content"]',
  undo: '[data-testid="undo-btn"]',
}

function makePreview(overrides: Partial<PreviewDraft> = {}): PreviewDraft {
  return {
    title: 'A',
    description: 'desc',
    content: 'Content A',
    story_type: 'short-story',
    genre: 'Drama',
    image_url: undefined,
    ...overrides,
  }
}

describe('StoryGeneratePreview — one-level Undo (4.1.3b)', () => {
  it('enables Undo when preview prop changes and restores previous content on Undo', async () => {
    const A = makePreview({ title: 'First', content: 'Content A' })
    const B = makePreview({ title: 'Second', content: 'Content B' })
    const wrapper = mount(StoryGeneratePreview, { props: { preview: A }, attachTo: document.body })

    // Initially disabled
    const undoBtn = wrapper.get(S.undo)
    expect((undoBtn.element as HTMLButtonElement).disabled).toBe(true)

    // Simulate retry completion: parent replaces preview with B
    await wrapper.setProps({ preview: B })
    await nextTick()

    // Undo now enabled and content shows B
    expect((undoBtn.element as HTMLButtonElement).disabled).toBe(false)
    expect(wrapper.get(S.content).text()).toContain('Content B')

    // Undo restores A and disables again
    await undoBtn.trigger('click')
    await nextTick()
    expect(wrapper.get(S.content).text()).toContain('Content A')
    expect((undoBtn.element as HTMLButtonElement).disabled).toBe(true)

    // Emits undo
    const emitted = wrapper.emitted()
    expect(emitted.undo).toBeTruthy()

    // Focus moves to title (basic a11y)
    const titleEl = wrapper.get(S.title).element as HTMLElement
    expect(document.activeElement === titleEl).toBe(true)
  })
})
