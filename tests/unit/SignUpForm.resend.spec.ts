import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SignUpForm from '@/components/SignUpForm.vue'
import ResendVerification from '@/components/ResendVerification.vue'

// Mock useAuth composable
let signUpMock = vi.fn()
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    signUp: signUpMock
  })
}))

describe('SignUpForm integration with ResendVerification (TDD-first)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows ResendVerification when signUp reports needsVerification', async () => {
    // Arrange: signUp resolves indicating the user needs verification
    signUpMock = vi.fn().mockResolvedValue({ success: true, error: null, needsVerification: true })

    const wrapper = mount(SignUpForm)

    // Fill form inputs
    const emailInput = wrapper.find('input#signup-email')
    const passwordInput = wrapper.find('input#signup-password')
    const confirmInput = wrapper.find('input#signup-confirm-password')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('Password123')
    await confirmInput.setValue('Password123')

    // Submit the form
    await wrapper.find('form').trigger('submit.prevent')

    // Allow async microtasks to resolve
    await new Promise((r) => setTimeout(r, 0))

    // Assert: signUp called with expected args
    expect(signUpMock).toHaveBeenCalled()
    expect(signUpMock).toHaveBeenCalledWith({ email: 'test@example.com', password: 'Password123' })

    // Assert: success message shown
    expect(wrapper.text()).toContain('Account created. Please check your email to verify your account.')

    // Assert: ResendVerification rendered and receives email prop
    const resendComp = wrapper.findComponent(ResendVerification)
    expect(resendComp.exists()).toBe(true)
    expect(resendComp.props('email')).toBe('test@example.com')
  })
})
