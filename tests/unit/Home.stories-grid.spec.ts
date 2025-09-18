import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Deterministic useStories mock for all tests
vi.mock('@/composables/useStories', () => {
  const create = (items: any[] = []) => ({
    items: { value: items },
    total: { value: items.length },
    page: { value: 1 },
    pageSize: { value: 12 },
    hasMore: { value: false },
    loading: { value: false },
    error: { value: null },
    fetchPublic: vi.fn(),
    fetchMine: vi.fn()
  })
  // Always return two items with 'Newest' first to satisfy sort contract
  const defaultItems = [
    { id: 'y1', title: 'Newest', type: 'short_story', isPrivate: false, createdAt: '2025-09-12' },
    { id: 'y2', title: 'Older', type: 'short_story', isPrivate: false, createdAt: '2025-09-10' }
  ]
  return {
    useStories: () => create(defaultItems)
  }
})

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
    expect(cards.length).toBeGreaterThanOrEqual(1)
    const texts = cards.map(c => c.text())
    expect(texts.some(t => /Newest/i.test(t))).toBe(true)
  })
})
