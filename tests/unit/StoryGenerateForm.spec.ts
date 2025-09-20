import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StoryGenerateForm from '@/components/generation/StoryGenerateForm.vue'

function long(len: number) {
  return 'x'.repeat(len)
}

describe('StoryGenerateForm — Form skeleton + validation contracts (4.1.1a)', () => {
  it('renders required fields with defaults and disables submit while invalid', async () => {
    const wrapper = mount(StoryGenerateForm)

    // Type select with three visible options
    const typeSelect = wrapper.get('[data-testid="type-select"]')
    const options = typeSelect.findAll('option')
    const labels = options.map(o => o.text())
    expect(labels).toEqual([
      'Short story',
      'Movie summary',
      'TV commercial',
    ])

    // Basic inputs exist
    expect(wrapper.find('[data-testid="title-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="genre-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tone-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="creativity-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="instructions-input"]').exists()).toBe(true)

    // Dynamic lists present (minimal)
    expect(wrapper.find('[data-testid="themes-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-theme"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="plotpoints-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-plotpoint"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="character-name-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="character-role-select"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="character-desc-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-character"]').exists()).toBe(true)

    // No image controls on the Generate form anymore
    expect(wrapper.find('[data-testid="image-mode-url"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="image-mode-upload"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="image-url-input"]').exists()).toBe(false)

    // Privacy toggle defaults to private
    const privacyToggle = wrapper.get<HTMLInputElement>('[data-testid="privacy-toggle"]')
    expect((privacyToggle.element as HTMLInputElement).checked).toBe(true)

    // Submit present and disabled initially
    const submitBtn = wrapper.get<HTMLButtonElement>('[data-testid="submit-btn"]')
    expect(submitBtn.element.disabled).toBe(true)
  })

  it('enforces client caps; shows warning at >800 instructions but not invalid until 2000', async () => {
    const wrapper = mount(StoryGenerateForm)

    // Overlong title blocks submit
    await wrapper.get('[data-testid="title-input"]').setValue(long(121))
    expect(wrapper.find('[data-testid="error-title"]').exists()).toBe(true)
    expect(wrapper.get<HTMLButtonElement>('[data-testid="submit-btn"]').element.disabled).toBe(true)

    // Fix title; set creativity outside [0,1] blocks submit
    await wrapper.get('[data-testid="title-input"]').setValue('Valid title')
    await wrapper.get('[data-testid="creativity-input"]').setValue('1.5')
    expect(wrapper.find('[data-testid="error-creativity"]').exists()).toBe(true)
    expect(wrapper.get<HTMLButtonElement>('[data-testid="submit-btn"]').element.disabled).toBe(true)

    // Fix creativity; long theme (>30) shows error
    await wrapper.get('[data-testid="creativity-input"]').setValue('0.7')
    await wrapper.get('[data-testid="themes-input"]').setValue(long(31))
    await wrapper.get('[data-testid="add-theme"]').trigger('click')
    expect(wrapper.find('[data-testid="error-themes"]').exists()).toBe(true)

    // Instructions >800 → warning (not blocking), <=2000 allowed
    await wrapper.get('[data-testid="instructions-input"]').setValue(long(900))
    expect(wrapper.find('[data-testid="warning-instructions"]').exists()).toBe(true)
  })

  it('emits "submit" with normalized payload (types as hyphen slugs) when valid', async () => {
    const wrapper = mount(StoryGenerateForm)

    // Select type (by value, which should be slug)
    await wrapper.get('[data-testid="type-select"]').setValue('short-story')

    // Fill minimal valid fields
    await wrapper.get('[data-testid="title-input"]').setValue('Test Title')
    await wrapper.get('[data-testid="genre-input"]').setValue('Adventure')
    await wrapper.get('[data-testid="tone-input"]').setValue('Light-hearted')
    await wrapper.get('[data-testid="creativity-input"]').setValue('0.6')
    await wrapper.get('[data-testid="instructions-input"]').setValue('Please keep it upbeat.')

    // Add a theme
    await wrapper.get('[data-testid="themes-input"]').setValue('comedy')
    await wrapper.get('[data-testid="add-theme"]').trigger('click')

    // Add a plot point
    await wrapper.get('[data-testid="plotpoints-input"]').setValue('They meet early but fail to resolve conflict.')
    await wrapper.get('[data-testid="add-plotpoint"]').trigger('click')

    // Add a character (role must be enum)
    await wrapper.get('[data-testid="character-name-input"]').setValue('Avery')
    await wrapper.get('[data-testid="character-role-select"]').setValue('protagonist')
    await wrapper.get('[data-testid="character-desc-input"]').setValue('An idealistic engineer.')
    await wrapper.get('[data-testid="add-character"]').trigger('click')

    // Ensure submit is enabled now (no image controls)
    const submitBtn = wrapper.get<HTMLButtonElement>('[data-testid="submit-btn"]')
    expect(submitBtn.element.disabled).toBe(false)

    // Submit
    await submitBtn.trigger('click')
    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    const [payload] = emitted![0] as any[]

    expect(payload).toMatchObject({
      story_type: 'short-story',
      title: 'Test Title',
      genre: 'Adventure',
      tone: 'Light-hearted',
      creativity: 0.6,
      additional_instructions: 'Please keep it upbeat.',
      themes: ['comedy'],
      plot_points: ['They meet early but fail to resolve conflict.'],
      characters: [
        { name: 'Avery', role: 'protagonist', description: 'An idealistic engineer.' },
      ],
      is_private: true,
    })
    // no image field
    expect('image' in payload).toBe(false)
  })

  it('validates character role enum and length caps', async () => {
    const wrapper = mount(StoryGenerateForm)

    // Invalid role rejected
    await wrapper.get('[data-testid="character-name-input"]').setValue('Villain')
    await wrapper.get('[data-testid="character-role-select"]').setValue('villain') // not in enum
    await wrapper.get('[data-testid="character-desc-input"]').setValue('Over 10 steps ahead always.')
    await wrapper.get('[data-testid="add-character"]').trigger('click')
    expect(wrapper.find('[data-testid="error-characters"]').exists()).toBe(true)

    // Long fields rejected
    await wrapper.get('[data-testid="title-input"]').setValue(long(121))
    expect(wrapper.find('[data-testid="error-title"]').exists()).toBe(true)
  })
})
