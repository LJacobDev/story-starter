import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '@/router'
import { RouterView } from 'vue-router'

// Mocks
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

function makeStory(overrides: Partial<any> = {}) {
  return {
    id: 's-share-1',
    user_id: 'owner-1',
    title: 'Sharable Tale',
    story_type: 'short_story',
    is_private: false,
    content: '...'
    , ...overrides
  }
}

describe('StoryDetails — Share link behavior (3.2.1g)', () => {
  beforeEach(() => {
    mockGetById.mockReset()
    mockAuth.isAuthenticated = false
    mockAuth.user = null
    // cleanup share/clipboard between tests
    ;(globalThis.navigator as any).share = undefined
    ;(globalThis.navigator as any).clipboard = undefined
  })

  it('shows a Share button for a loaded story (public, guest)', async () => {
    const id = 's-share-a'
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id, is_private: false }), error: null })

    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    const btn = wrapper.find('[data-testid="share-btn"]')
    expect(btn.exists()).toBe(true)
  })

  it('uses navigator.share when available with a URL containing the story route', async () => {
    const id = 's-share-b'
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id, is_private: false }), error: null })

    const shareSpy = vi.fn().mockResolvedValue(undefined)
    ;(globalThis.navigator as any).share = shareSpy

    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    const btn = wrapper.find('[data-testid="share-btn"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    await flushPromises()

    expect(shareSpy).toHaveBeenCalledTimes(1)
    const arg = shareSpy.mock.calls[0][0]
    expect(arg).toHaveProperty('url')
    expect(String(arg.url)).toContain(`/stories/${id}`)
  })

  it('falls back to clipboard when navigator.share is unavailable', async () => {
    const id = 's-share-c'
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id, is_private: false }), error: null })

    const writeText = vi.fn().mockResolvedValue(undefined)
    ;(globalThis.navigator as any).share = undefined
    ;(globalThis.navigator as any).clipboard = { writeText }

    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    const btn = wrapper.find('[data-testid="share-btn"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledTimes(1)
    const urlArg = writeText.mock.calls[0][0]
    expect(String(urlArg)).toContain(`/stories/${id}`)
  })

  it('for private stories (owner viewing), shows a warning and does not share or copy', async () => {
    const id = 's-share-d'
    mockAuth.isAuthenticated = true
    mockAuth.user = { id: 'owner-1' }
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id, is_private: true }), error: null })

    const shareSpy = vi.fn()
    const writeText = vi.fn()
    ;(globalThis.navigator as any).share = shareSpy
    ;(globalThis.navigator as any).clipboard = { writeText }

    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    const btn = wrapper.find('[data-testid="share-btn"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    await flushPromises()

    // No share/copy
    expect(shareSpy).not.toHaveBeenCalled()
    expect(writeText).not.toHaveBeenCalled()

    // Warning visible
    const warn = wrapper.find('[data-testid="share-warning"]')
    expect(warn.exists()).toBe(true)
    expect(warn.text().toLowerCase()).toMatch(/private|make.*public|toggle/i)
  })
})
