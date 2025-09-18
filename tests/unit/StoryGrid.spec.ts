import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StoryGrid from '@/components/stories/StoryGrid.vue'

const makeItem = (id: number) => ({
  id: `s-${id}`,
  title: `Story ${id}`,
  type: 'short_story' as const,
  isPrivate: false,
  createdAt: '2025-03-10T00:00:00Z',
  description: 'desc'
})

describe('StoryGrid (contract)', () => {
  it('applies responsive grid classes 1/2/3/4 at base/sm/md/lg (xl can remain 4)', () => {
    const wrapper = mount(StoryGrid, {
      props: {
        items: [makeItem(1), makeItem(2)],
        loading: false
      }
    })

    const grid = wrapper.get('[data-testid="story-grid"]')
    const cls = grid.attributes('class') || ''
    expect(cls).toContain('grid')
    expect(cls).toContain('grid-cols-1')
    expect(cls).toContain('sm:grid-cols-2')
    expect(cls).toContain('md:grid-cols-3')
    expect(cls).toContain('lg:grid-cols-4')
  })

  it('renders 12 skeleton cards when loading=true', () => {
    const wrapper = mount(StoryGrid, {
      props: { items: [], loading: true }
    })

    const skels = wrapper.findAll('[data-testid="skeleton-card"]')
    expect(skels.length).toBe(12)
  })

  it('shows empty message when not loading and items empty', () => {
    const wrapper = mount(StoryGrid, {
      props: { items: [], loading: false, emptyMessage: 'No stories yet' }
    })

    const empty = wrapper.get('[data-testid="empty-state"]')
    expect(empty.text()).toContain('No stories yet')
  })
})
