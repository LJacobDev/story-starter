import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StoryCard from '@/components/stories/StoryCard.vue'

const base = {
  id: 's1',
  title: 'A Tale of Two Cities in Space',
  type: 'short_story' as const,
  isPrivate: false,
  createdAt: '2025-03-10T00:00:00Z',
  description: 'An epic adventure among the stars.'
}

describe('StoryCard (contract)', () => {
  it('renders basic fields and prefers imageUrl when provided', () => {
    const wrapper = mount(StoryCard, {
      props: { ...base, imageUrl: 'https://example.com/cover.png' }
    })

    expect(wrapper.attributes('data-testid')).toBeUndefined()
    // Root exists
    expect(wrapper.find('[data-testid="story-card-root"]').exists()).toBe(true)

    // Expectations that will fail until implemented in 3.1.1a.2:
    expect(wrapper.text()).toContain(base.title)
    expect(wrapper.text().toLowerCase()).toContain('short story')
    expect(wrapper.text().toLowerCase()).not.toContain('private')

    // Prefer image url for cover when present
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/cover.png')
    expect(img.attributes('alt')?.toLowerCase()).toContain('cover image')
  })

  it('shows type-specific SVG fallback when no imageUrl', () => {
    const wrapper = mount(StoryCard, { props: { ...base, imageUrl: undefined } })
    // Should render an inline svg fallback while still having accessible text nearby
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('renders a private badge when isPrivate=true', () => {
    const wrapper = mount(StoryCard, { props: { ...base, isPrivate: true } })
    expect(wrapper.text().toLowerCase()).toContain('private')
  })
})
