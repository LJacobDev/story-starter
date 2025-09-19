import { mount } from '@vue/test-utils'
import { describe, test, expect } from 'vitest'
import StoryGenerateForm from '@/components/generation/StoryGenerateForm.vue'

const S = {
  type: '[data-testid="type-select"]',
  title: '[data-testid="title-input"]',
  genre: '[data-testid="genre-input"]',
  tone: '[data-testid="tone-input"]',
  creativity: '[data-testid="creativity-input"]',
  instructions: '[data-testid="instructions-input"]',
  themesInput: '[data-testid="themes-input"]',
  themeItem: '[data-testid="theme-item"]',
  plotInput: '[data-testid="plotpoints-input"]',
  plotItem: '[data-testid="plot-item"]',
  charName: '[data-testid="character-name-input"]',
  charRole: '[data-testid="character-role-select"]',
  charDesc: '[data-testid="character-desc-input"]',
  charItem: '[data-testid="character-item"]',
  imageModeUrl: '[data-testid="image-mode-url"]',
  imageUrlInput: '[data-testid="image-url-input"]',
  privacy: '[data-testid="privacy-toggle"]',
  resetBtn: '[data-testid="reset-btn"]',
  editPromptsBtn: '[data-testid="edit-prompts-btn"]',
  cancelBtn: '[data-testid="cancel-btn"]',
}

describe('StoryGenerateForm — Prefill/Reset & Edit Prompts (4.1.1g)', () => {
  const prefill = {
    story_type: 'movie-summary',
    title: 'Seeded Title',
    genre: 'Adventure',
    tone: 'Light',
    creativity: 0.7,
    additional_instructions: 'Keep it upbeat',
    themes: ['courage', 'friendship'],
    plot_points: ['Meet mentor', 'Refuse call'],
    characters: [
      { name: 'Ava', role: 'protagonist', description: 'Explorer' },
      { name: 'Rex', role: 'ally', description: 'Guide' },
    ],
    image: { mode: 'url', url: 'https://example.com/cover.jpg' },
    is_private: false,
  }

  test('prefill props populate all fields and lists', async () => {
    const wrapper = mount(StoryGenerateForm, { props: { prefill } })

    expect((wrapper.find(S.type).element as HTMLSelectElement).value).toBe('movie-summary')
    expect((wrapper.find(S.title).element as HTMLInputElement).value).toBe('Seeded Title')
    expect((wrapper.find(S.genre).element as HTMLInputElement).value).toBe('Adventure')
    expect((wrapper.find(S.tone).element as HTMLInputElement).value).toBe('Light')
    expect((wrapper.find(S.creativity).element as HTMLInputElement).value).toBe('0.7')
    expect((wrapper.find(S.instructions).element as HTMLTextAreaElement).value).toBe('Keep it upbeat')

    expect(wrapper.findAll(S.themeItem)).toHaveLength(2)
    expect(wrapper.findAll(S.plotItem)).toHaveLength(2)
    expect(wrapper.findAll(S.charItem)).toHaveLength(2)

    // URL mode and value
    expect((wrapper.find(S.imageModeUrl).element as HTMLInputElement).checked).toBe(true)
    expect((wrapper.find(S.imageUrlInput).element as HTMLInputElement).value).toBe('https://example.com/cover.jpg')

    // privacy off
    expect((wrapper.find(S.privacy).element as HTMLInputElement).checked).toBe(false)
  })

  test('reset returns to defaults (not to prefill)', async () => {
    const wrapper = mount(StoryGenerateForm, { props: { prefill } })

    await wrapper.find(S.title).setValue('Changed')
    await wrapper.find(S.resetBtn).trigger('click')

    // Defaults
    expect((wrapper.find(S.type).element as HTMLSelectElement).value).toBe('short-story')
    expect((wrapper.find(S.title).element as HTMLInputElement).value).toBe('')
    expect((wrapper.find(S.genre).element as HTMLInputElement).value).toBe('')
    expect((wrapper.find(S.tone).element as HTMLInputElement).value).toBe('')
    expect((wrapper.find(S.creativity).element as HTMLInputElement).value).toBe('')
    expect((wrapper.find(S.instructions).element as HTMLTextAreaElement).value).toBe('')
    expect(wrapper.findAll(S.themeItem)).toHaveLength(0)
    expect(wrapper.findAll(S.plotItem)).toHaveLength(0)
    expect(wrapper.findAll(S.charItem)).toHaveLength(0)
    expect((wrapper.find(S.imageUrlInput).element as HTMLInputElement).value).toBe('')
    expect((wrapper.find(S.privacy).element as HTMLInputElement).checked).toBe(true)
  })

  test('emits edit-prompts and cancel', async () => {
    const wrapper = mount(StoryGenerateForm, { props: { prefill } })

    await wrapper.find(S.editPromptsBtn).trigger('click')
    await wrapper.find(S.cancelBtn).trigger('click')

    expect(wrapper.emitted('edit-prompts')).toBeTruthy()
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })
})
