import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'

let confirmMock = vi.fn()
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    confirmEmail: confirmMock,
    // Provide a minimal ref-like object for user used by VerifyEmail.vue
    user: { value: null }
  })
}))

describe('VerifyEmail failure modes', () => {
  beforeEach(() => {
    confirmMock = vi.fn()
  })

  it('shows error when no token is provided', async () => {
    vi.useFakeTimers()

    const { default: VerifyEmail } = await import('@/views/VerifyEmail.vue')

    const routes = [{ path: '/verify-email', component: VerifyEmail }]
    const router = createRouter({ history: createMemoryHistory(), routes })

    await router.push('/verify-email')
    await router.isReady()

    const wrapper = mount(VerifyEmail, { global: { plugins: [router] } })

    // Advance past the internal 50ms delay and flush pending updates
    await vi.advanceTimersByTimeAsync(60)
    await nextTick()
    await Promise.resolve()
    await nextTick()

    expect(wrapper.text()).toContain('No verification token was provided.')
    expect(confirmMock).not.toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('shows invalid token message when confirmEmail reports error', async () => {
    confirmMock = vi.fn().mockResolvedValue({ success: false, error: 'Invalid token' })

    const { default: VerifyEmail } = await import('@/views/VerifyEmail.vue')

    const routes = [{ path: '/verify-email', component: VerifyEmail }]
    const router = createRouter({ history: createMemoryHistory(), routes })

    await router.push({ path: '/verify-email', query: { token: 'BAD_TOKEN' } })
    await router.isReady()

    const wrapper = mount(VerifyEmail, { global: { plugins: [router] } })

    // wait for async confirmation
    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('Verification Failed')
    expect(wrapper.text()).toContain('Invalid token')
    expect(confirmMock).toHaveBeenCalledWith('BAD_TOKEN')
  })

  it('shows expired token message when confirmEmail reports expired error', async () => {
    confirmMock = vi.fn().mockResolvedValue({ success: false, error: 'Token expired' })

    const { default: VerifyEmail } = await import('@/views/VerifyEmail.vue')

    const routes = [{ path: '/verify-email', component: VerifyEmail }]
    const router = createRouter({ history: createMemoryHistory(), routes })

    await router.push({ path: '/verify-email', query: { token: 'EXPIRED' } })
    await router.isReady()

    const wrapper = mount(VerifyEmail, { global: { plugins: [router] } })

    // wait for async confirmation
    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('Verification Failed')
    expect(wrapper.text()).toContain('Token expired')
    expect(confirmMock).toHaveBeenCalledWith('EXPIRED')
  })
})
