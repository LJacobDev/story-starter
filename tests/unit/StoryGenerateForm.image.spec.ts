import { mount, flushPromises } from '@vue/test-utils'
import { expect, test, describe, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import StoryGenerateForm from '@/components/generation/StoryGenerateForm.vue'

vi.mock('@/utils/imageMeta', () => {
  return {
    getImageMetadata: vi.fn(async (file: File) => ({
      width: 800,
      height: 600,
      type: file.type,
      size: file.size,
    })),
  }
})

const S = {
  title: '[data-testid="title-input"]',
  creativity: '[data-testid="creativity-input"]',
  type: '[data-testid="type-select"]',
  submit: '[data-testid="submit-btn"]',
  imageModeUrl: '[data-testid="image-mode-url"]',
  imageModeUpload: '[data-testid="image-mode-upload"]',
  imageUrlInput: '[data-testid="image-url-input"]',
  imageFileInput: '[data-testid="image-file-input"]',
  imageError: '[data-testid="image-error"]',
}

async function makeWrapper() {
  const wrapper = mount(StoryGenerateForm, { attachTo: document.body })
  await wrapper.find(S.title).setValue('My title')
  await wrapper.find(S.creativity).setValue('0.5')
  await wrapper.find(S.type).setValue('short-story')
  return wrapper
}

describe('StoryGenerateForm — Image client validation (4.1.1e)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('URL mode: accepts http/https and emits normalized image descriptor', async () => {
    const wrapper = await makeWrapper()

    await wrapper.find(S.imageModeUrl).setValue(true)
    await wrapper.find(S.imageUrlInput).setValue('https://example.com/cover.jpg')
    await nextTick()

    const submitBtn = wrapper.find(S.submit)
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false)

    await submitBtn.trigger('click')
    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    const [payload] = emitted![0] as any[]
    expect(payload.image).toEqual({ mode: 'url', url: 'https://example.com/cover.jpg' })
  })

  test('URL mode: rejects non-http(s) schemes (data:, ftp), empty allowed as no-image', async () => {
    const wrapper = await makeWrapper()
    await wrapper.find(S.imageModeUrl).setValue(true)

    await wrapper.find(S.imageUrlInput).setValue('data:image/png;base64,abcd')
    await nextTick()
    expect(wrapper.find(S.imageError).text()).toMatch(/must start with http/i)
    expect((wrapper.find(S.submit).element as HTMLButtonElement).disabled).toBe(true)

    await wrapper.find(S.imageUrlInput).setValue('ftp://example.com/cover.png')
    await nextTick()
    expect(wrapper.find(S.imageError).text()).toMatch(/must start with http/i)
    expect((wrapper.find(S.submit).element as HTMLButtonElement).disabled).toBe(true)

    await wrapper.find(S.imageUrlInput).setValue('')
    await nextTick()
    expect(wrapper.find(S.imageError).exists()).toBe(false)
    expect((wrapper.find(S.submit).element as HTMLButtonElement).disabled).toBe(false)
  })

  test('Upload mode: accepts png/jpeg/webp ≤ 2MB with dims 200–4000; emits descriptor with file+meta', async () => {
    const { getImageMetadata } = await import('@/utils/imageMeta')
    const wrapper = await makeWrapper()

    await wrapper.find(S.imageModeUpload).setValue(true)
    await nextTick()

    const file = new File(['hello'], 'cover.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 500_000 })

    ;(getImageMetadata as any).mockResolvedValueOnce({
      width: 1024,
      height: 768,
      type: file.type,
      size: file.size,
    })

    const input = wrapper.find(S.imageFileInput)
    Object.defineProperty(input.element as HTMLInputElement, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await flushPromises()

    const submitBtn = wrapper.find(S.submit)
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false)

    await submitBtn.trigger('click')
    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    const [payload] = emitted![0] as any[]
    expect(payload.image?.mode).toBe('upload')
    expect(payload.image?.file).toBeInstanceOf(File)
    expect(payload.image?.meta).toEqual({ width: 1024, height: 768, type: 'image/png', size: 500_000 })
  })

  test('Upload mode: rejects wrong type', async () => {
    const wrapper = await makeWrapper()
    await wrapper.find(S.imageModeUpload).setValue(true)

    const bad = new File(['x'], 'anim.gif', { type: 'image/gif' })
    Object.defineProperty(bad, 'size', { value: 100_000 })

    const input = wrapper.find(S.imageFileInput)
    Object.defineProperty(input.element as HTMLInputElement, 'files', { value: [bad], configurable: true })
    await input.trigger('change')
    await nextTick()

    expect(wrapper.find(S.imageError).text()).toMatch(/png|jpeg|webp/i)
    expect((wrapper.find(S.submit).element as HTMLButtonElement).disabled).toBe(true)
  })

  test('Upload mode: rejects too large size (> 2 MB)', async () => {
    const wrapper = await makeWrapper()
    await wrapper.find(S.imageModeUpload).setValue(true)

    const big = new File(['x'.repeat(10)], 'big.webp', { type: 'image/webp' })
    Object.defineProperty(big, 'size', { value: 2_500_000 })

    const input = wrapper.find(S.imageFileInput)
    Object.defineProperty(input.element as HTMLInputElement, 'files', { value: [big], configurable: true })
    await input.trigger('change')
    await nextTick()

    expect(wrapper.find(S.imageError).text()).toMatch(/2\s*MB/i)
    expect((wrapper.find(S.submit).element as HTMLButtonElement).disabled).toBe(true)
  })

  test('Upload mode: rejects too small/too large dimensions', async () => {
    const { getImageMetadata } = await import('@/utils/imageMeta')
    const wrapper = await makeWrapper()
    await wrapper.find(S.imageModeUpload).setValue(true)

    const file = new File(['hello'], 'cover.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 400_000 })

    // Too small
    ;(getImageMetadata as any).mockResolvedValueOnce({ width: 150, height: 150, type: file.type, size: file.size })
    let input = wrapper.find(S.imageFileInput)
    Object.defineProperty(input.element as HTMLInputElement, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await flushPromises()
    expect(wrapper.find(S.imageError).text()).toMatch(/200–4000/i)
    expect((wrapper.find(S.submit).element as HTMLButtonElement).disabled).toBe(true)

    // Too large
    ;(getImageMetadata as any).mockResolvedValueOnce({ width: 5000, height: 4100, type: file.type, size: file.size })
    input = wrapper.find(S.imageFileInput)
    Object.defineProperty(input.element as HTMLInputElement, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await flushPromises()
    expect(wrapper.find(S.imageError).text()).toMatch(/200–4000/i)
    expect((wrapper.find(S.submit).element as HTMLButtonElement).disabled).toBe(true)
  })
})
