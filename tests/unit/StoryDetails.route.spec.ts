import { describe, it, expect, vi, beforeEach } from 'vitest'
import router from '@/router'
import { mount, flushPromises } from '@vue/test-utils'
import { RouterView } from 'vue-router'

const mockGetById = vi.fn()
const mockAuth = { isAuthenticated: false, user: null as null | { id: string } }

vi.mock('@/composables/useStory', () => ({
  useStory: () => ({ getById: mockGetById })
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

describe('Route /stories/:id → StoryDetails', () => {
  beforeEach(() => {
    mockGetById.mockReset()
    mockAuth.isAuthenticated = false
    mockAuth.user = null
  })

  it('router registers /stories/:id named story-details', () => {
    const r = router.getRoutes().find(r => r.path === '/stories/:id')
    expect(r).toBeTruthy()
    expect(r?.name).toBe('story-details')
  })

  it('guest can load a public story', async () => {
    const id = 'pub-1'
    mockGetById.mockResolvedValueOnce({ data: { id, title: 'Public Tale', is_private: false }, error: null })
    const wrapper = await mountAt(`/stories/${id}`)
    expect(mockGetById).toHaveBeenCalledWith(id)
    await flushPromises()
    expect(wrapper.html()).toMatch(/Public Tale/)
  })

  it('owner can load a private story', async () => {
    const id = 'priv-1'
    mockAuth.isAuthenticated = true
    mockAuth.user = { id: 'owner-1' }
    mockGetById.mockResolvedValueOnce({ data: { id, title: 'Private Notes', is_private: true, user_id: 'owner-1' }, error: null })
    const wrapper = await mountAt(`/stories/${id}`)
    expect(mockGetById).toHaveBeenCalledWith(id)
    await flushPromises()
    expect(wrapper.html()).toMatch(/Private Notes/)
  })

  it('guest hitting a private story gets not-found/private message', async () => {
    const id = 'priv-guest'
    mockGetById.mockResolvedValueOnce({ data: null, error: { message: 'Not found or private', code: '403' } })
    const wrapper = await mountAt(`/stories/${id}`)
    expect(mockGetById).toHaveBeenCalledWith(id)
    await flushPromises()
    expect(wrapper.text()).toMatch(/not found|private/i)
  })
})
