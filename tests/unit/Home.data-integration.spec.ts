import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// Utility to create a mocked useStories instance
function createStoriesMock(config: {
  items?: any[]
  total?: number
  page?: number
  pageSize?: number
  hasMore?: boolean
  loading?: boolean
  error?: any
  onFetchPublic?: (opts?: any, state?: any) => Promise<void>
  onFetchMine?: (userId: string, opts?: any, state?: any) => Promise<void>
} = {}) {
  const {
    items = [],
    total = 0,
    page = 1,
    pageSize = 12,
    hasMore = false,
    loading = false,
    error = null,
    onFetchPublic,
    onFetchMine
  } = config

  const state = {
    items: ref<any[]>(items),
    total: ref(total),
    page: ref(page),
    pageSize: ref(pageSize),
    hasMore: ref(hasMore),
    loading: ref(loading),
    error: ref(error),
    fetchPublic: vi.fn(async (opts?: any) => {
      if (onFetchPublic) {
        await onFetchPublic(opts, state)
      }
    }),
    fetchMine: vi.fn(async (userId: string, opts?: any) => {
      if (onFetchMine) {
        await onFetchMine(userId, opts, state)
      }
    })
  }
  return state
}

// Make a simple story factory compatible with StoryCard props used by StoryGrid
function makeStories(n: number, prefix = 'p', start = 1) {
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-${start + i}`,
    title: `Story ${start + i}`,
    type: 'short_story',
    isPrivate: false,
    createdAt: `2025-09-${String(10 + i).padStart(2, '0')}`,
    description: 'desc'
  }))
}

// A queue so we can return different useStories instances per invocation (for auth case)
let storiesInstances: any[] = []

vi.mock('@/composables/useStories', () => ({
  useStories: () => {
    if (storiesInstances.length > 0) return storiesInstances.shift()
    return createStoriesMock()
  }
}))

// Default to guest; tests can override with vi.doMock before import
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, isReady: true })
}))

describe('Home data integration (TDD)', () => {
  beforeEach(() => {
    vi.resetModules()
    storiesInstances = []
  })

  it('guest: shows marketing/hero and Public Stories grid together', async () => {
    // guest auth
    vi.doMock('@/composables/useAuth', () => ({ useAuth: () => ({ isAuthenticated: false, isReady: true }) }))

    // Home creates yourStories first, then publicStories
    const dummyYour = createStoriesMock()
    const publicInstance = createStoriesMock({
      items: makeStories(3, 'pub'),
      total: 3,
      hasMore: true,
      loading: false
    })
    storiesInstances.push(dummyYour)
    storiesInstances.push(publicInstance)

    const { default: Home } = await import('@/views/Home.vue')
    const wrapper = mount(Home)

    // Expect hero for guests
    expect(wrapper.find('[data-testid="guest-hero"]').exists()).toBe(true)
    // And Public Stories grid
    expect(wrapper.find('[data-testid="section-public"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="story-grid"]').length).toBeGreaterThan(0)
  })

  it('auth: shows Your Stories then All Public Stories; no hero', async () => {
    vi.doMock('@/composables/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true, isReady: true }) }))

    // mine then public instances
    const mine = createStoriesMock({ items: makeStories(2, 'mine'), total: 2 })
    const pub = createStoriesMock({ items: makeStories(2, 'pub'), total: 2 })
    storiesInstances.push(mine)
    storiesInstances.push(pub)

    const { default: Home } = await import('@/views/Home.vue')
    const wrapper = mount(Home)

    expect(wrapper.find('[data-testid="guest-hero"]').exists()).toBe(false)

    const h2s = wrapper.findAll('h2').map(h => h.text())
    const yourIdx = h2s.indexOf('Your Stories')
    const publicIdx = h2s.indexOf('All Public Stories')
    expect(yourIdx).toBeGreaterThanOrEqual(0)
    expect(publicIdx).toBeGreaterThan(yourIdx)
  })

  it('Show more appends 12 items for Public Stories', async () => {
    // guest scenario for simplicity
    vi.doMock('@/composables/useAuth', () => ({ useAuth: () => ({ isAuthenticated: false, isReady: true }) }))

    const first12 = makeStories(12, 'pub', 1)
    const next12 = makeStories(12, 'pub', 13)

    // yourStories dummy first, then public instance with append behavior
    const dummyYour = createStoriesMock()
    const publicInstance = createStoriesMock({
      items: first12,
      total: 24,
      hasMore: true,
      onFetchPublic: async (opts: any, state: any) => {
        const page = opts?.page ?? 1
        if (page > 1) {
          // simulate append only for subsequent pages
          state.items.value = [...state.items.value, ...next12]
          state.hasMore.value = false
          state.page.value = page
        } else {
          state.page.value = 1
          state.hasMore.value = true
        }
        await Promise.resolve()
      }
    })

    storiesInstances.push(dummyYour)
    storiesInstances.push(publicInstance)
    const { default: Home } = await import('@/views/Home.vue')
    const wrapper = mount(Home)

    // initial 12
    const publicSection = wrapper.find('[data-testid="section-public"]')
    expect(publicSection.findAll('[data-testid="story-card-root"]').length).toBe(12)

    // click show more
    const btn = publicSection.find('[data-testid="show-more-public"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    await nextTick()

    // now 24
    expect(publicSection.findAll('[data-testid="story-card-root"]').length).toBe(24)
  })

  it('renders loading (skeletons) and empty states correctly', async () => {
    // guest
    vi.doMock('@/composables/useAuth', () => ({ useAuth: () => ({ isAuthenticated: false, isReady: true }) }))

    // yourStories dummy, public loading instance
    const dummyYour = createStoriesMock()
    const loadingInstance = createStoriesMock({ items: [], loading: true })
    storiesInstances.push(dummyYour)
    storiesInstances.push(loadingInstance)

    const { default: Home } = await import('@/views/Home.vue')
    const wrapper = mount(Home)

    // skeletons appear in StoryGrid
    expect(wrapper.findAll('[data-testid="skeleton-card"]').length).toBe(12)

    // now switch to empty state
    loadingInstance.loading.value = false
    loadingInstance.items.value = []
    await nextTick()

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })
})
