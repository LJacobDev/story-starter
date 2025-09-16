import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Input from '@/components/ui/Input.vue'

describe('Input.vue v-model', () => {
  it('supports v-model binding', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'hello'
      }
    })

    // initial value should be set on the input element
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('hello')

    // emit input and expect update:modelValue
    await input.setValue('world')
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    const events = wrapper.emitted('update:modelValue')
    expect(events?.[0]).toEqual(['world'])
  })
})
