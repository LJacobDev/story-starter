import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import StoryFilters from '@/components/stories/StoryFilters.vue'

function makeWrapper(initial?: any) {
  return mount(StoryFilters, {
    props: {
      modelValue: {
        search: '',
        type: null,
        privacy: 'all',
        date: 'newest',
        ...(initial || {})
      }
    }
  })
}

describe('StoryFilters (tests first)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces search input and emits latest value', async () => {
    const wrapper = makeWrapper()
    const input = wrapper.get('[data-testid="search-input"]')

    await input.setValue('a')
    await input.setValue('ab')
    vi.advanceTimersByTime(200)
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    await input.setValue('abc')
    vi.advanceTimersByTime(300)

    const emits = wrapper.emitted('update:modelValue') as any[]
    expect(emits).toBeTruthy()
    const last = emits[emits.length - 1][0]
    expect(last.search).toBe('abc')
    // preserves other fields
    expect(last.type).toBe(null)
    expect(last.privacy).toBe('all')
    expect(last.date).toBe('newest')
  })

  it('emits immediately when selecting type with normalized slug', async () => {
    const wrapper = makeWrapper()
    const sel = wrapper.get('[data-testid="type-select"]')
    await sel.setValue('movie_summary')

    const emits = wrapper.emitted('update:modelValue') as any[]
    expect(emits).toBeTruthy()
    const last = emits[emits.length - 1][0]
    expect(last.type).toBe('movie_summary')
  })

  it('emits immediately when selecting privacy', async () => {
    const wrapper = makeWrapper()
    const sel = wrapper.get('[data-testid="privacy-select"]')
    await sel.setValue('public')
    const last = (wrapper.emitted('update:modelValue') as any[]).pop()[0]
    expect(last.privacy).toBe('public')
  })

  it('emits immediately when selecting date preset', async () => {
    const wrapper = makeWrapper()
    const sel = wrapper.get('[data-testid="date-select"]')
    await sel.setValue('last7')
    const last = (wrapper.emitted('update:modelValue') as any[]).pop()[0]
    expect(last.date).toBe('last7')
  })
})
