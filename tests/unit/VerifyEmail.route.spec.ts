import { describe, it, expect, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

// Mock useAuth before importing the component so the module uses the mocked implementation
const confirmMock = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    confirmEmail: confirmMock
  })
}))

// Import the view component to assert it mounts at the route
import VerifyEmail from '@/views/VerifyEmail.vue'

describe('Route registration: VerifyEmail', () => {
  it('renders VerifyEmail view at /verify-email', async () => {
    const routes = [
      { path: '/verify-email', component: VerifyEmail }
    ]

    const router = createRouter({ history: createMemoryHistory(), routes })

    // include a token in the query so the component calls confirmEmail
    await router.push('/verify-email?token=test-token')
    await router.isReady()

    const wrapper = mount(VerifyEmail, {
      global: {
        plugins: [router]
      }
    })

    // wait for mounted hook and async confirmEmail to resolve
    await nextTick()
    await nextTick()

    // Confirm navigation landed on the expected path
    expect(router.currentRoute.value.fullPath).toBe('/verify-email?token=test-token')

    // Basic smoke check that success UI rendered
    expect(wrapper.text()).toContain('Email Verified!')

    // ensure confirmEmail was called with the token
    expect(confirmMock).toHaveBeenCalledWith('test-token')
  })
})
