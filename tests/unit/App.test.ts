import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  it('renders without crashing', () => {
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })

  it('contains the Story Starter branding', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Story Starter')
    expect(wrapper.text()).toContain('Welcome to Story Starter!')
  })

  it('has navigation tabs', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Sign In')
    expect(wrapper.text()).toContain('Demo')
  })

  it('shows home view by default', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Welcome to Story Starter!')
    expect(wrapper.text()).toContain('Create amazing stories with AI assistance')
    expect(wrapper.text()).toContain('Get Started Now')
  })

  it('contains Vite and Vue logos in demo view', async () => {
    const wrapper = mount(App)
    
    // Click the Demo button to switch views
    const demoButton = wrapper.find('button:nth-of-type(3)') // Demo is the 3rd button
    await demoButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    const viteLogo = wrapper.find('img[alt="Vite"]')
    const vueLogo = wrapper.find('img[alt="Vue"]')
    
    expect(viteLogo.exists()).toBe(true)
    expect(vueLogo.exists()).toBe(true)
    expect(wrapper.text()).toContain('Vite + Vue')
  })

  it('has feature cards on home view', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('AI-Powered Writing')
    expect(wrapper.text()).toContain('Story Library')
    expect(wrapper.text()).toContain('Multiple Formats')
  })
})
