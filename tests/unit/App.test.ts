import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  it('renders without crashing', () => {
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })

  it('contains the Vite logo', () => {
    const wrapper = mount(App)
    const viteLogo = wrapper.find('img[alt="Vite logo"]')
    expect(viteLogo.exists()).toBe(true)
  })

  it('contains the Vue logo', () => {
    const wrapper = mount(App)
    const vueLogo = wrapper.find('img[alt="Vue logo"]')
    expect(vueLogo.exists()).toBe(true)
  })

  it('renders the HelloWorld component', () => {
    const wrapper = mount(App)
    expect(wrapper.html()).toContain('Vite + Vue')
  })
})
