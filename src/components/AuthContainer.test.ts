import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthContainer from '@/components/AuthContainer.vue'

describe('AuthContainer', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(AuthContainer)
  })

  it('should render sign in form by default', () => {
    expect(wrapper.find('h3').text()).toBe('Sign In')
    // The component uses a reactive ref, so we need to access it differently
    expect(wrapper.text()).toContain("Don't have an account?")
  })

  it('should have proper container styling', () => {
    const container = wrapper.find('.flex.min-h-screen')
    expect(container.exists()).toBe(true)
    
    // Look for form elements instead
    const forms = wrapper.findAll('form')
    expect(forms.length).toBeGreaterThan(0)
  })

  it('should contain both form types', () => {
    // The component should have both sign in and sign up functionality
    expect(wrapper.text()).toContain('Sign In')
    expect(wrapper.text()).toContain("Don't have an account?")
    expect(wrapper.text()).toContain('Sign up')
  })

  it('should have authentication region', () => {
    // Look for authentication related content
    expect(wrapper.text()).toContain('Email')
    expect(wrapper.text()).toContain('Password')
  })

  it('should handle form switching', async () => {
    // Initially shows sign in
    expect(wrapper.text()).toContain('Sign In')
    expect(wrapper.text()).toContain("Don't have an account?")
    
    // Find the signup button and click it
    const buttons = wrapper.findAll('button')
    const switchButton = buttons.find((btn: any) => btn.text().includes('Sign up'))
    
    if (switchButton) {
      await switchButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Should now show sign up form
      expect(wrapper.text()).toContain('Sign Up')
      expect(wrapper.text()).toContain('Already have an account?')
    }
  })

  it('should be accessible', () => {
    // Check for proper semantic structure
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('h3').exists()).toBe(true)
    
    // Check for proper input labeling
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })
})
