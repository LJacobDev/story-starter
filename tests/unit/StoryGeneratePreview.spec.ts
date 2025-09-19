import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
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
  description: '[data-testid="preview-description"]',
  content: '[data-testid="preview-content"]',
  image: '[data-testid="image"]',
  imageFallback: '[data-testid="image-fallback"]',
  save: '[data-testid="save-btn"]',
  discard: '[data-testid="discard-btn"]',
  retry: '[data-testid="retry-btn"]',
  edit: '[data-testid="edit-btn"]',
  undo: '[data-testid="undo-btn"]',
}

function makePreview(overrides: Partial<PreviewDraft> = {}): PreviewDraft {
  return {
    title: 'Mock Short Story',
    description: 'A tiny preview description',
    content: 'Once upon a time...',
    story_type: 'short-story',
    genre: 'Drama',
    image_url: undefined,
    ...overrides,
  }
}

describe('StoryGeneratePreview — Preview component (4.1.3a)', () => {
  it('renders title, description, and content', () => {
    const preview = makePreview()
    const wrapper = mount(StoryGeneratePreview, {
      props: { preview },
    })
    expect(wrapper.find(S.title).text()).toContain(preview.title)
    expect(wrapper.find(S.description).text()).toContain(preview.description!)
    expect(wrapper.find(S.content).text()).toContain(preview.content)
  })

  it('shows image when image_url provided, otherwise shows type-specific SVG fallback', () => {
    const withImage = mount(StoryGeneratePreview, {
      props: { preview: makePreview({ image_url: 'https://example.com/img.jpg' }) },
    })
    expect(withImage.find(S.image).exists()).toBe(true)
    expect(withImage.find(S.imageFallback).exists()).toBe(false)

    const noImage = mount(StoryGeneratePreview, {
      props: { preview: makePreview({ image_url: undefined }) },
    })
    expect(noImage.find(S.image).exists()).toBe(false)
    expect(noImage.find(S.imageFallback).exists()).toBe(true)
  })

  it('renders action buttons and emits expected events; Undo disabled initially', async () => {
    const preview = makePreview()
    const wrapper = mount(StoryGeneratePreview, { props: { preview } })

    const btnSave = wrapper.find(S.save)
    const btnDiscard = wrapper.find(S.discard)
    const btnRetry = wrapper.find(S.retry)
    const btnEdit = wrapper.find(S.edit)
    const btnUndo = wrapper.find(S.undo)

    expect(btnSave.exists()).toBe(true)
    expect(btnDiscard.exists()).toBe(true)
    expect(btnRetry.exists()).toBe(true)
    expect(btnEdit.exists()).toBe(true)
    expect(btnUndo.exists()).toBe(true)
    expect((btnUndo.element as HTMLButtonElement).disabled).toBe(true)

    await btnSave.trigger('click')
    await btnDiscard.trigger('click')
    await btnRetry.trigger('click')
    await btnEdit.trigger('click')
    await btnUndo.trigger('click')

    const emitted = wrapper.emitted() as any
    expect(emitted.save?.[0]?.[0]).toEqual(preview)
    expect(emitted.discard).toBeTruthy()
    expect(emitted.retry).toBeTruthy()
    expect(emitted.edit).toBeTruthy()
    expect(emitted.undo).toBeTruthy()
  })
})
