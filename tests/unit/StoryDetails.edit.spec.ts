import { describe, it, expect, vi, beforeEach } from 'vitest'
import router from '@/router'
import { mount, flushPromises } from '@vue/test-utils'
import { RouterView } from 'vue-router'

// Mocks
const mockGetById = vi.fn()
const mockAuth = { isAuthenticated: false, user: null as null | { id: string } }

vi.mock('@/composables/useStory', () => ({
  useStory: () => ({ getById: mockGetById })
}))

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: { value: mockAuth.isAuthenticated }, user: { value: mockAuth.user } })
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
    id: 's-1',
    user_id: 'owner-1',
    title: 'Editable Tale',
    story_type: 'short_story',
    genre: 'adventure',
    description: 'A test description',
    image_url: 'https://example.com/cover.png',
    is_private: true,
    content: 'Once upon a time...',
    created_at: '2025-03-10T00:00:00Z',
    ...overrides
  }
}

describe('StoryDetails — Edit permissions + form contract (3.2.1c)', () => {
  beforeEach(() => {
    mockGetById.mockReset()
    mockAuth.isAuthenticated = false
    mockAuth.user = null
  })

  it('shows Edit button only for the owner', async () => {
    const id = 's-1'
    // Guest sees no Edit
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id }), error: null })
    const guestWrapper = await mountAt(`/stories/${id}`)
    await flushPromises()
    expect(guestWrapper.find('[data-testid="edit-btn"]').exists()).toBe(false)

    // Owner sees Edit
    mockGetById.mockReset()
    mockAuth.isAuthenticated = true
    mockAuth.user = { id: 'owner-1' }
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id }), error: null })
    const ownerWrapper = await mountAt(`/stories/${id}`)
    await flushPromises()
    expect(ownerWrapper.find('[data-testid="edit-btn"]').exists()).toBe(true)
  })

  it('entering edit mode shows required fields with initial values', async () => {
    const id = 's-2'
    mockAuth.isAuthenticated = true
    mockAuth.user = { id: 'owner-1' }
    const story = makeStory({ id })
    mockGetById.mockResolvedValueOnce({ data: story, error: null })

    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    const editBtn = wrapper.find('[data-testid="edit-btn"]')
    expect(editBtn.exists()).toBe(true)
    await editBtn.trigger('click')
    await flushPromises()

    // Form root
    expect(wrapper.find('[data-testid="edit-form"]').exists()).toBe(true)

    // Fields present and prefilled
    const title = wrapper.find('input[name="title"]')
    const type = wrapper.find('select[name="story_type"]')
    const genre = wrapper.find('input[name="genre"]')
    const desc = wrapper.find('textarea[name="description"]')
    const img = wrapper.find('input[name="image_url"]')
    const priv = wrapper.find('input[name="is_private"][type="checkbox"]')
    const content = wrapper.find('textarea[name="content"]')

    expect(title.exists()).toBe(true)
    expect(type.exists()).toBe(true)
    expect(genre.exists()).toBe(true)
    expect(desc.exists()).toBe(true)
    expect(img.exists()).toBe(true)
    expect(priv.exists()).toBe(true)
    expect(content.exists()).toBe(true)

    expect((title.element as HTMLInputElement).value).toBe(story.title)
    expect((type.element as HTMLSelectElement).value).toBe(story.story_type)
    expect((genre.element as HTMLInputElement).value).toBe(story.genre)
    expect((desc.element as HTMLTextAreaElement).value).toBe(story.description)
    expect((img.element as HTMLInputElement).value).toBe(story.image_url)
    expect((priv.element as HTMLInputElement).checked).toBe(true)
    expect((content.element as HTMLTextAreaElement).value).toBe(story.content)

    // Buttons
    expect(wrapper.find('[data-testid="edit-save"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="edit-cancel"]').exists()).toBe(true)
  })

  it('validates lengths (title ≤ 120, genre ≤ 60) and disables Save when invalid', async () => {
    const id = 's-3'
    mockAuth.isAuthenticated = true
    mockAuth.user = { id: 'owner-1' }
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id }), error: null })

    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    await wrapper.find('[data-testid="edit-btn"]').trigger('click')
    await flushPromises()

    const title = wrapper.find('input[name="title"]')
    const genre = wrapper.find('input[name="genre"]')
    const save = wrapper.find('[data-testid="edit-save"]')

    // Over-limit values
    const longTitle = 'T'.repeat(121)
    const longGenre = 'G'.repeat(61)

    await title.setValue(longTitle)
    await genre.setValue(longGenre)
    await flushPromises()

    // Field-level error messages (contract)
    const titleErr = wrapper.find('[data-testid="error-title"]')
    const genreErr = wrapper.find('[data-testid="error-genre"]')
    expect(titleErr.text().toLowerCase()).toMatch(/120|max|too long/)
    expect(genreErr.text().toLowerCase()).toMatch(/60|max|too long/)

    // Save disabled while invalid
    expect((save.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('Cancel exits edit mode without saving', async () => {
    const id = 's-4'
    mockAuth.isAuthenticated = true
    mockAuth.user = { id: 'owner-1' }
    mockGetById.mockResolvedValueOnce({ data: makeStory({ id }), error: null })

    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    await wrapper.find('[data-testid="edit-btn"]').trigger('click')
    await flushPromises()

    const cancel = wrapper.find('[data-testid="edit-cancel"]')
    expect(cancel.exists()).toBe(true)
    await cancel.trigger('click')
    await flushPromises()

    // Form hidden; read-only view visible again
    expect(wrapper.find('[data-testid="edit-form"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="story-content"]').exists()).toBe(true)
  })
})
