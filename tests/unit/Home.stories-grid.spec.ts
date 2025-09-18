import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Default mock (guest); individual tests will re-mock as needed
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false })
}))

describe('Home stories sections (contract)', () => {
  it('guest: shows one grid titled "Public Stories" with H1 "Stories"', async () => {
    // ensure guest
    vi.doMock('@/composables/useAuth', () => ({ useAuth: () => ({ isAuthenticated: false }) }))
    const { default: Home } = await import('@/views/Home.vue')
    const wrapper = mount(Home)

    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('Stories')

    const h2s = wrapper.findAll('h2')
    const headings = h2s.map(h => h.text())
    expect(headings.some(t => t === 'Public Stories')).toBe(true)
    // Only one section grid for guests
    expect(wrapper.findAll('[data-testid="story-grid"]').length).toBe(1)
  })

  it('auth: shows "Your Stories" then "All Public Stories" with two grids', async () => {
    vi.resetModules()
    vi.doMock('@/composables/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true }) }))
    const { default: Home } = await import('@/views/Home.vue')
    const wrapper = mount(Home)

    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('Stories')

    const h2s = wrapper.findAll('h2')
    const headings = h2s.map(h => h.text())
    // Ensure order
    const yourIdx = headings.indexOf('Your Stories')
    const publicIdx = headings.indexOf('All Public Stories')
    expect(yourIdx).toBeGreaterThanOrEqual(0)
    expect(publicIdx).toBeGreaterThan(yourIdx)

    expect(wrapper.findAll('[data-testid="story-grid"]').length).toBe(2)
  })

  it('default sort: newest first (check title order contains "Newest" first)', async () => {
    vi.resetModules()
    vi.doMock('@/composables/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true }) }))
    const { default: Home } = await import('@/views/Home.vue')
    const wrapper = mount(Home)

    // First section is Your Stories
    const yourSection = wrapper.find('[data-testid="section-your"]')
    const cards = yourSection.findAll('[data-testid="story-card-root"]')
    expect(cards.length).toBeGreaterThanOrEqual(2)
    expect(cards[0].text()).toMatch(/Newest/i)
  })
})
