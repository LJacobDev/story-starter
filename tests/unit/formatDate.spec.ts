import { describe, it, expect, vi } from 'vitest'
import { formatStoryDate } from '@/utils/formatDate'

// Helper to freeze time for deterministic tests
const fixedNow = new Date('2025-03-20T12:00:00Z')
vi.setSystemTime?.(fixedNow)

describe('formatStoryDate', () => {
  it('returns "today" for same day', () => {
    expect(formatStoryDate('2025-03-20T01:00:00Z')).toBe('today')
  })

  it('returns "n days ago" when < 10 days', () => {
    expect(formatStoryDate('2025-03-19T12:00:00Z')).toBe('1 day ago')
    expect(formatStoryDate('2025-03-15T12:00:00Z')).toBe('5 days ago')
  })

  it('returns long date when >= 10 days', () => {
    expect(formatStoryDate('2025-03-05T12:00:00Z')).toBe('March 5th 2025')
  })

  it('handles invalid dates', () => {
    expect(formatStoryDate('not-a-date')).toBe('')
  })
})
