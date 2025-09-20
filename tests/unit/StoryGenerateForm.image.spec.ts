import { mount } from '@vue/test-utils'
import { describe, test, expect } from 'vitest'
import StoryGenerateForm from '@/components/generation/StoryGenerateForm.vue'

const S = {
  title: '[data-testid="title-input"]',
  creativity: '[data-testid="creativity-input"]',
  type: '[data-testid="type-select"]',
  submit: '[data-testid="submit-btn"]',
  imageModeUrl: '[data-testid="image-mode-url"]',
  imageModeUpload: '[data-testid="image-mode-upload"]',
  imageUrlInput: '[data-testid="image-url-input"]',
  imageFileInput: '[data-testid="image-file-input"]',
}

async function makeWrapper() {
  const wrapper = mount(StoryGenerateForm)
  await wrapper.find(S.title).setValue('My title')
  await wrapper.find(S.creativity).setValue('0.5')
  await wrapper.find(S.type).setValue('short-story')
  return wrapper
}

describe('StoryGenerateForm — Image controls removed', () => {
  test('no image controls are rendered and submit emits without image field', async () => {
    const wrapper = await makeWrapper()
    expect(wrapper.find(S.imageModeUrl).exists()).toBe(false)
    expect(wrapper.find(S.imageModeUpload).exists()).toBe(false)
    expect(wrapper.find(S.imageUrlInput).exists()).toBe(false)
    expect(wrapper.find(S.imageFileInput).exists()).toBe(false)

    await wrapper.find(S.submit).trigger('click')
    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    const [payload] = emitted![0] as any[]
    expect('image' in payload).toBe(false)
  })
})
