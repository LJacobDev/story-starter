import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StoryCard from '@/components/stories/StoryCard.vue'
import { axe } from 'vitest-axe'

const baseProps = {
  id: 's-1',
  title: 'A Tale of Testing',
  type: 'short_story' as const,
  isPrivate: false,
  createdAt: '2025-03-10T00:00:00Z',
  description: 'An example description'
}

function seriousOrCriticalCount(results: any) {
  return results.violations.filter((v: any) => v.impact === 'serious' || v.impact === 'critical').length
}

describe('StoryCard a11y and image fallback', () => {
  it('renders <img> with descriptive alt text when imageUrl exists and has no critical a11y violations', async () => {
    const wrapper = mount(StoryCard, {
      props: { ...baseProps, imageUrl: 'https://example.com/cover.jpg' }
    })

    const img = wrapper.get('img')
    expect(img.attributes('alt')).toMatch(/Cover image for A Tale of Testing/i)

    const results = await axe(wrapper.element)
    expect(seriousOrCriticalCount(results)).toBe(0)
  })

  it('renders SVG fallback (aria-hidden) with sr-only text when imageUrl is missing and has no critical a11y violations', async () => {
    const wrapper = mount(StoryCard, {
      props: { ...baseProps, imageUrl: undefined }
    })

    // No <img>
    expect(wrapper.find('img').exists()).toBe(false)

    // Fallback SVG should be present and hidden from AT
    const svg = wrapper.get('svg')
    expect(svg.attributes('aria-hidden')).toBe('true')

    // Provide an offscreen label for screen readers
    const sr = wrapper.find('.sr-only')
    expect(sr.exists()).toBe(true)
    expect(sr.text()).toMatch(/Cover image placeholder for A Tale of Testing/i)

    const results = await axe(wrapper.element)
    expect(seriousOrCriticalCount(results)).toBe(0)
  })
})
