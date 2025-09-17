import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'

let confirmMock = vi.fn()
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ confirmEmail: confirmMock })
}))

describe('VerifyEmail failure modes', () => {
  beforeEach(() => {
    confirmMock = vi.fn()
  })

  it('shows error when no token is provided', async () => {
    // confirmMock should not be called
    const { default: VerifyEmail } = await import('@/views/VerifyEmail.vue')

    const routes = [{ path: '/verify-email', component: VerifyEmail }]
    const router = createRouter({ history: createMemoryHistory(), routes })

    await router.push('/verify-email')
    await router.isReady()

    const wrapper = mount(VerifyEmail, { global: { plugins: [router] } })

    // allow async mounted hook to run
    await nextTick()

    expect(wrapper.text()).toContain('No verification token was provided.')
    expect(confirmMock).not.toHaveBeenCalled()
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
