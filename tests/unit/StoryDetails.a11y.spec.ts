import { describe, it, expect, vi, beforeEach } from 'vitest'
import router from '@/router'
import { mount, flushPromises } from '@vue/test-utils'
import { RouterView } from 'vue-router'
import { axe } from 'vitest-axe'

const mockGetById = vi.fn()
const mockAuth = { isAuthenticated: true, user: { id: 'owner-1' } as null | { id: string } }

vi.mock('@/composables/useStory', () => ({
  useStory: () => ({ getById: mockGetById })
}))

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: { value: mockAuth.isAuthenticated }, user: { value: mockAuth.user } })
}))

async function mountAt(path: string) {
  const wrapper = mount({ components: { RouterView }, template: '<router-view />' }, {
    global: { plugins: [router] },
    attachTo: document.body
  })
  await router.push(path)
  await router.isReady()
  await flushPromises()
  return wrapper
}

function seriousOrCriticalCount(results: any) {
  return results.violations.filter((v: any) => v.impact === 'serious' || v.impact === 'critical').length
}

describe('StoryDetails — a11y + keyboard flows', () => {
  beforeEach(() => {
    mockGetById.mockReset()
    mockAuth.isAuthenticated = true
    mockAuth.user = { id: 'owner-1' }
  })

  it('has proper heading hierarchy and labeled controls in edit mode (axe clean)', async () => {
    const id = 's-1'
    mockGetById.mockResolvedValueOnce({ data: { id, title: 'Accessible Tale', is_private: true, user_id: 'owner-1', story_type: 'short_story' }, error: null })
    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    // Headings
    const h1 = wrapper.get('h1')
    expect(h1.text()).toMatch(/story/i)
    const h2 = wrapper.get('h2')
    expect(h2.text()).toBe('Accessible Tale')

    // Enter edit mode
    await wrapper.get('[data-testid="edit-btn"]').trigger('click')
    await flushPromises()

    // Required labels and their controls
    expect(wrapper.find('label[for="title"]').exists()).toBe(true)
    expect(wrapper.find('#title').exists()).toBe(true)
    expect(wrapper.find('label[for="story_type"]').exists()).toBe(true)
    expect(wrapper.find('#story_type').exists()).toBe(true)
    expect(wrapper.find('label[for="genre"]').exists()).toBe(true)
    expect(wrapper.find('#genre').exists()).toBe(true)
    // Image URL shown by default in edit (URL mode)
    expect(wrapper.find('label[for="image_url"]').exists()).toBe(true)
    expect(wrapper.find('#image_url').exists()).toBe(true)
    expect(wrapper.find('label[for="description"]').exists()).toBe(true)
    expect(wrapper.find('#description').exists()).toBe(true)
    expect(wrapper.find('label[for="content"]').exists()).toBe(true)
    expect(wrapper.find('#content').exists()).toBe(true)
    expect(wrapper.find('label[for="is_private"]').exists()).toBe(true)
    expect(wrapper.find('#is_private').exists()).toBe(true)

    const results = await axe(wrapper.element)
    expect(seriousOrCriticalCount(results)).toBe(0)
  })

  it('manages focus: moves to title on edit; moves to cancel on delete confirm; returns focus to delete on close', async () => {
    const id = 's-2'
    mockGetById.mockResolvedValueOnce({ data: { id, title: 'Focus Tale', is_private: true, user_id: 'owner-1', story_type: 'short_story' }, error: null })
    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    const editBtn = wrapper.get('[data-testid="edit-btn"]')
    await editBtn.trigger('click')
    await flushPromises()

    const titleInput = wrapper.get('#title')
    // EXPECTATION: entering edit sets focus to title
    expect(document.activeElement).toBe(titleInput.element)

    // Exit edit
    await wrapper.get('[data-testid="edit-cancel"]').trigger('click')
    await flushPromises()

    const deleteBtn = wrapper.get('[data-testid="delete-btn"]')
    await deleteBtn.trigger('click')
    await flushPromises()

    const cancelBtn = wrapper.get('[data-testid="confirm-delete-cancel"]')
    // EXPECTATION: opening confirm sets focus to cancel button
    expect(document.activeElement).toBe(cancelBtn.element)

    // Close confirm
    await cancelBtn.trigger('click')
    await flushPromises()

    // EXPECTATION: focus returns to Delete button
    expect(document.activeElement).toBe(deleteBtn.element)
  })

  it('allows closing the delete confirm with Escape', async () => {
    const id = 's-3'
    mockGetById.mockResolvedValueOnce({ data: { id, title: 'Escape Tale', is_private: true, user_id: 'owner-1', story_type: 'short_story' }, error: null })
    const wrapper = await mountAt(`/stories/${id}`)
    await flushPromises()

    await wrapper.get('[data-testid="delete-btn"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="delete-confirm"]').exists()).toBe(true)

    // EXPECTATION: pressing Escape closes the confirm dialog
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()

    expect(wrapper.find('[data-testid="delete-confirm"]').exists()).toBe(false)
  })
})
