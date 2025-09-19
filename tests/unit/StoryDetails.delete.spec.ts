import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stub Home view BEFORE router import so routes use the stub and avoid data fetching on navigation
vi.mock('@/views/Home.vue', () => ({
  default: { template: '<div data-testid="home-stub">Home</div>' }
}))

import router from '@/router'
import { mount, flushPromises } from '@vue/test-utils'
import { RouterView } from 'vue-router'

// Mocks
const mockGetById = vi.fn()
const mockRemove = vi.fn()
const mockAuth = { isAuthenticated: false, user: null as null | { id: string } }

vi.mock('@/composables/useStory', () => ({
  useStory: () => ({ getById: mockGetById, remove: mockRemove })
}))

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: { value: mockAuth.isAuthenticated }, user: { value: mockAuth.user } })
}))

async function mountAt(path: string) {
  const wrapper = mount({ components: { RouterView }, template: '<router-view />' }, {
    global: { plugins: [router] }
  })
  await router.push(path)
  await router.isReady()
  await flushPromises()
  return wrapper
}

function makeStory(overrides: Partial<any> = {}) {
  return {
    id: 's-del-1',
    user_id: 'owner-1',
    title: 'To Be Deleted',
    story_type: 'short_story',
    is_private: true,
    content: '...',
    ...overrides
  }
}

describe('StoryDetails — Delete with confirmation (3.2.1e)', () => {
  beforeEach(() => {
    mockGetById.mockReset()
    mockRemove.mockReset()
    mockAuth.isAuthenticated = false
    mockAuth.user = null
  })

  it('shows Delete button only for the owner', async () => {
    const id = 's-del-a'
    // Guest: no delete button
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id }), error: null })
    const guest = await mountAt(`/stories/${id}`)
    await flushPromises()
    expect(guest.find('[data-testid="delete-btn"]').exists()).toBe(false)

    // Owner: delete button present
    mockGetById.mockReset()
    mockAuth.isAuthenticated = true
    mockAuth.user = { id: 'owner-1' }
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id }), error: null })
    const owner = await mountAt(`/stories/${id}`)
    await flushPromises()
    expect(owner.find('[data-testid="delete-btn"]').exists()).toBe(true)
  })

  it('opens confirm dialog and calls remove on confirm, then navigates Home', async () => {
    const id = 's-del-b'
    mockAuth.isAuthenticated = true
    mockAuth.user = { id: 'owner-1' }
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id }), error: null })
    mockRemove.mockResolvedValueOnce({ success: true })

    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    // Open confirm
    const delBtn = wrapper.find('[data-testid="delete-btn"]')
    expect(delBtn.exists()).toBe(true)
    await delBtn.trigger('click')
    await flushPromises()

    // Confirm dialog should be visible
    expect(wrapper.find('[data-testid="delete-confirm"]').exists()).toBe(true)

    // Confirm deletion
    const confirmBtn = wrapper.find('[data-testid="confirm-delete-confirm"]')
    expect(confirmBtn.exists()).toBe(true)
    await confirmBtn.trigger('click')
    await flushPromises()

    expect(mockRemove).toHaveBeenCalledWith(id)

    // After success navigate to Home
    expect(router.currentRoute.value.path).toBe('/')
  })
})
