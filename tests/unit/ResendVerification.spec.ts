import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock useAuth composable
let resendMock = vi.fn()
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    resendEmailVerification: resendMock
  })
}))

// This test suite follows TDD: the component does not exist yet and the tests should fail
// until you implement `src/components/ResendVerification.vue`.

describe('ResendVerification component (TDD) - UX and rate-limit behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls resendEmailVerification with provided email and disables button after click', async () => {
    // Arrange: mocked API resolves with success
    resendMock = vi.fn().mockResolvedValue({ success: true, error: null })

    // Dynamically import the component (will fail until implemented)
    const { default: ResendVerification } = await import('@/components/ResendVerification.vue')

    const wrapper = mount(ResendVerification, {
      props: { email: 'test@example.com' }
    })

    // Act: click the resend button
    const button = wrapper.find('button')
    await button.trigger('click')

    // Allow async
    await new Promise((r) => setTimeout(r, 0))

    // Assert: resend called and button disabled
    expect(resendMock).toHaveBeenCalled()
    expect(resendMock).toHaveBeenCalledWith('test@example.com')
    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Resend available in')
  })

  it('shows rate-limit message and respects retry window when server returns retryAfter', async () => {
    // Arrange: mocked API returns rate-limit with retryAfter seconds
    resendMock = vi.fn().mockResolvedValue({ success: false, error: 'Rate limit exceeded', retryAfter: 120 })

    const { default: ResendVerification } = await import('@/components/ResendVerification.vue')

    const wrapper = mount(ResendVerification, {
      props: { email: 'test@example.com' }
    })

    const button = wrapper.find('button')
    await button.trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    // Expect error message shown and cooldown UI reflecting retry window
    expect(resendMock).toHaveBeenCalledWith('test@example.com')
    expect(wrapper.text()).toContain('Rate limit exceeded')
    expect(wrapper.text()).toMatch(/try again in/i)
  })
})
