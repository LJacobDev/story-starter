import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock useAuth to control user state
const userRef = { value: null as any }
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ user: userRef })
}))

// Speed up setTimeout-driven logic in AuthCallback
vi.useFakeTimers()

describe('AuthCallback.vue', () => {
  beforeEach(() => {
    userRef.value = null
  })

  it('shows success when user is verified', async () => {
    const { default: AuthCallback } = await import('@/views/AuthCallback.vue')
    const wrapper = mount(AuthCallback)

    userRef.value = { email_confirmed_at: '2024-01-01T00:00:00Z' }
    await vi.runAllTimersAsync()

    expect(wrapper.text()).toMatch(/Email Verified/i)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('shows guidance when user exists but not confirmed', async () => {
    const { default: AuthCallback } = await import('@/views/AuthCallback.vue')
    const wrapper = mount(AuthCallback)

    userRef.value = { email_confirmed_at: null }
    await vi.runAllTimersAsync()

    expect(wrapper.text()).toMatch(/verification was not completed/i)
  })

  it('shows failure when no user arrives', async () => {
    const { default: AuthCallback } = await import('@/views/AuthCallback.vue')
    const wrapper = mount(AuthCallback)

    userRef.value = null
    await vi.runAllTimersAsync()

    expect(wrapper.text()).toMatch(/Verification failed/i)
  })
})
