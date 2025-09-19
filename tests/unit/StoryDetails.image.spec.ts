import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import router from '@/router'
import { RouterView } from 'vue-router'

// Mocks
const mockGetById = vi.fn()
const mockAuth = { isAuthenticated: false, user: null as null | { id: string } }
const mockUpload = vi.fn()

vi.mock('@/composables/useStory', () => ({
  useStory: () => ({ getById: mockGetById })
}))

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: { value: mockAuth.isAuthenticated }, user: { value: mockAuth.user } })
}))

// This module will be used once implementation imports it; tests define its behavior
vi.mock('@/composables/useStoryImage', () => ({
  useStoryImage: () => ({ upload: mockUpload })
}))

async function mountAt(path: string) {
  const wrapper = mount({ components: { RouterView }, template: '<router-view />' }, {
    global: { plugins: [router] }
  })
  await router.push(path)
  await router.isReady()
  await flushPromises()
  return wrapper
}

function makeStory(overrides: Partial<any> = {}) {
  return {
    id: 's-img-1',
    user_id: 'owner-1',
    title: 'Image Tale',
    story_type: 'short_story',
    is_private: true,
    description: 'Desc',
    image_url: 'https://example.com/old.jpg',
    content: '...',
    ...overrides
  }
}

describe('StoryDetails — Image handling (URL and upload) (3.2.1i)', () => {
  beforeEach(() => {
    mockGetById.mockReset()
    mockAuth.isAuthenticated = true
    mockAuth.user = { id: 'owner-1' }
    mockUpload.mockReset()
  })

  it('URL mode: validates http/https only; previews and can remove', async () => {
    const id = 's-img-a'
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id, image_url: 'https://example.com/cover.jpg' }), error: null })

    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    // Enter edit mode
    await wrapper.find('[data-testid="edit-btn"]').trigger('click')
    await flushPromises()

    // URL mode should be selectable or default
    const urlMode = wrapper.find('[data-testid="image-mode-url"]')
    expect(urlMode.exists()).toBe(true)
    if (!(urlMode.element as HTMLInputElement).checked) {
      await urlMode.setValue(true)
      await flushPromises()
    }

    // Initial preview exists based on current image_url
    const initialPreview = wrapper.find('[data-testid="image-preview"] img')
    expect(initialPreview.exists()).toBe(true)
    expect((initialPreview.element as HTMLImageElement).src).toContain('https://example.com/cover.jpg')

    // Invalid URL (data:) shows error
    const urlInput = wrapper.find('input[name="image_url"]')
    await urlInput.setValue('data:image/png;base64,AAAA')
    await flushPromises()
    const err = wrapper.find('[data-testid="error-image-url"]')
    expect(err.exists()).toBe(true)

    // Valid https updates preview
    await urlInput.setValue('https://cdn.example.com/new.jpg')
    await flushPromises()
    const preview = wrapper.find('[data-testid="image-preview"] img')
    expect(preview.exists()).toBe(true)
    expect((preview.element as HTMLImageElement).src).toContain('https://cdn.example.com/new.jpg')

    // Remove clears URL and hides preview
    const removeBtn = wrapper.find('[data-testid="image-remove"]')
    expect(removeBtn.exists()).toBe(true)
    await removeBtn.trigger('click')
    await flushPromises()
    const after = wrapper.find('[data-testid="image-preview"] img')
    expect(after.exists()).toBe(false)
  })

  it('Upload mode: validates via composable and sets signed URL on success', async () => {
    const id = 's-img-b'
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id, image_url: null }), error: null })

    const signed = 'https://signed.example.com/abc.jpg'
    mockUpload.mockResolvedValueOnce({ ok: true, url: signed })

    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    // Enter edit mode
    await wrapper.find('[data-testid="edit-btn"]').trigger('click')
    await flushPromises()

    // Switch to upload mode
    const uploadMode = wrapper.find('[data-testid="image-mode-upload"]')
    expect(uploadMode.exists()).toBe(true)
    await uploadMode.setValue(true)
    await flushPromises()

    // Provide a file
    const file = new File([new Uint8Array([1,2,3])], 'cover.jpg', { type: 'image/jpeg' })
    const input = wrapper.find('input[type="file"][data-testid="image-file"]')
    expect(input.exists()).toBe(true)
    // Set files on the input element and trigger change
    const inputEl = input.element as HTMLInputElement
    Object.defineProperty(inputEl, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await flushPromises()

    // Composable called and preview shows signed URL
    expect(mockUpload).toHaveBeenCalledTimes(1)
    const preview = wrapper.find('[data-testid="image-preview"] img')
    expect(preview.exists()).toBe(true)
    expect((preview.element as HTMLImageElement).src).toContain(signed)
  })
})
