import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StoryGenerateForm from '@/components/generation/StoryGenerateForm.vue'

describe('StoryGenerateForm — Dynamic list UX (4.1.1c)', () => {
  it('adds themes with Enter, trims input, dedupes, and enforces max 10', async () => {
    const wrapper = mount(StoryGenerateForm)

    // Add first via Enter
    const input = wrapper.get('[data-testid="themes-input"]')
    await input.setValue('  comedy  ')
    await input.trigger('keyup.enter')
    expect(wrapper.findAll('[data-testid="theme-item"]').map(el => el.text())).toEqual(['comedy'])

    // Deduping same theme should not add another
    await input.setValue('comedy')
    await input.trigger('keyup.enter')
    expect(wrapper.findAll('[data-testid="theme-item"]').length).toBe(1)

    // Add up to 10 themes
    const more = ['thriller','adventure','fantasy','sci-fi','drama','mystery','romance','horror','slice of life']
    for (const t of more) {
      await input.setValue(t)
      await wrapper.get('[data-testid="add-theme"]').trigger('click')
    }
    expect(wrapper.findAll('[data-testid="theme-item"]').length).toBe(10)

    // 11th should be blocked
    await input.setValue('extra')
    await wrapper.get('[data-testid="add-theme"]').trigger('click')
    expect(wrapper.findAll('[data-testid="theme-item"]').length).toBe(10)
  })

  it('can remove and reorder themes (up/down controls)', async () => {
    const wrapper = mount(StoryGenerateForm)
    const input = wrapper.get('[data-testid="themes-input"]')
    for (const t of ['alpha','beta','gamma']) {
      await input.setValue(t)
      await wrapper.get('[data-testid="add-theme"]').trigger('click')
    }
    expect(wrapper.findAll('[data-testid="theme-item"]').map(n => n.text())).toEqual(['alpha','beta','gamma'])

    // Move down first
    await wrapper.get('[data-testid="theme-down-0"]').trigger('click')
    expect(wrapper.findAll('[data-testid="theme-item"]').map(n => n.text())).toEqual(['beta','alpha','gamma'])

    // Move up last
    await wrapper.get('[data-testid="theme-up-2"]').trigger('click')
    expect(wrapper.findAll('[data-testid="theme-item"]').map(n => n.text())).toEqual(['beta','gamma','alpha'])

    // Remove middle (index 1)
    await wrapper.get('[data-testid="theme-remove-1"]').trigger('click')
    expect(wrapper.findAll('[data-testid="theme-item"]').map(n => n.text())).toEqual(['beta','alpha'])
  })

  it('plot points: trim, reject empty/too long, remove and reorder', async () => {
    const wrapper = mount(StoryGenerateForm)
    const input = wrapper.get('[data-testid="plotpoints-input"]')

    // Reject empty
    await input.setValue('   ')
    await wrapper.get('[data-testid="add-plotpoint"]').trigger('click')
    expect(wrapper.findAll('[data-testid="plot-item"]').length).toBe(0)

    // Accept trimmed
    await input.setValue('  meet early  ')
    await wrapper.get('[data-testid="add-plotpoint"]').trigger('click')
    expect(wrapper.findAll('[data-testid="plot-item"]').map(n => n.text())).toEqual(['meet early'])

    // Reject >200 chars
    await input.setValue('x'.repeat(201))
    await wrapper.get('[data-testid="add-plotpoint"]').trigger('click')
    expect(wrapper.findAll('[data-testid="plot-item"]').length).toBe(1)

    // Add two more and reorder/remove
    await input.setValue('inciting incident')
    await wrapper.get('[data-testid="add-plotpoint"]').trigger('click')
    await input.setValue('finale')
    await wrapper.get('[data-testid="add-plotpoint"]').trigger('click')
    expect(wrapper.findAll('[data-testid="plot-item"]').map(n => n.text())).toEqual(['meet early','inciting incident','finale'])

    await wrapper.get('[data-testid="plot-down-0"]').trigger('click')
    expect(wrapper.findAll('[data-testid="plot-item"]').map(n => n.text())).toEqual(['inciting incident','meet early','finale'])

    await wrapper.get('[data-testid="plot-up-2"]').trigger('click')
    expect(wrapper.findAll('[data-testid="plot-item"]').map(n => n.text())).toEqual(['inciting incident','finale','meet early'])

    await wrapper.get('[data-testid="plot-remove-1"]').trigger('click')
    expect(wrapper.findAll('[data-testid="plot-item"]').map(n => n.text())).toEqual(['inciting incident','meet early'])
  })

  it('characters: trim fields, add/remove/reorder; enforce max 6', async () => {
    const wrapper = mount(StoryGenerateForm)

    async function addChar(name: string, role: string, desc: string) {
      await wrapper.get('[data-testid="character-name-input"]').setValue(name)
      await wrapper.get('[data-testid="character-role-select"]').setValue(role)
      await wrapper.get('[data-testid="character-desc-input"]').setValue(desc)
      await wrapper.get('[data-testid="add-character"]').trigger('click')
    }

    // Add two, trimming
    await addChar('  Ava  ', 'protagonist', '  curious engineer  ')
    await addChar(' Ben ', 'ally', ' loyal friend ')
    expect(wrapper.findAll('[data-testid="character-item"]').map(n => n.text())).toEqual([
      'Ava — protagonist — curious engineer',
      'Ben — ally — loyal friend'
    ])

    // Reorder
    await wrapper.get('[data-testid="char-up-1"]').trigger('click')
    expect(wrapper.findAll('[data-testid="character-item"]').map(n => n.text())).toEqual([
      'Ben — ally — loyal friend',
      'Ava — protagonist — curious engineer'
    ])

    // Add up to 6
    await addChar('C','other','')
    await addChar('D','antagonist','')
    await addChar('E','ally','')
    await addChar('F','ally','')
    expect(wrapper.findAll('[data-testid="character-item"]').length).toBe(6)

    // 7th blocked
    await addChar('G','ally','')
    expect(wrapper.findAll('[data-testid="character-item"]').length).toBe(6)

    // Remove one
    await wrapper.get('[data-testid="char-remove-0"]').trigger('click')
    expect(wrapper.findAll('[data-testid="character-item"]').length).toBe(5)
  })
})
