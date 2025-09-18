import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStories } from '@/composables/useStories'

// Query builder mock and helpers
let currentResponse: any
let selectArgs: any
let eqCalls: Array<[string, any]>
let orCalls: string[]
let orderCalls: Array<[string, any]>
let rangeArgs: [number, number] | null

function makeItems(n: number, start = 1) {
  return Array.from({ length: n }, (_, i) => ({
    id: `id-${start + i}`,
    user_id: 'user-1',
    title: `Title ${start + i}`,
    content: '...',
    story_type: 'short_story',
    is_private: false,
    created_at: `2024-01-${String(10 + i).padStart(2, '0')}T00:00:00Z`,
    updated_at: `2024-01-${String(10 + i).padStart(2, '0')}T00:00:00Z`
  }))
}

const queryMock: any = {
  select: vi.fn((cols: string, options?: any) => { selectArgs = { cols, options }; return queryMock }),
  eq: vi.fn((col: string, val: any) => { eqCalls.push([col, val]); return queryMock }),
  or: vi.fn((expr: string) => { orCalls.push(expr); return queryMock }),
  order: vi.fn((col: string, opts?: any) => { orderCalls.push([col, opts]); return queryMock }),
  range: vi.fn((from: number, to: number) => { rangeArgs = [from, to] as [number, number]; return currentResponse })
}

vi.mock('@/utils/supabase', () => ({
  supabase: {
    from: vi.fn(() => queryMock)
  }
}))

describe('useStories (TDD)', () => {
  beforeEach(() => {
    currentResponse = { data: [], error: null, count: 0 }
    selectArgs = null
    eqCalls = []
    orCalls = []
    orderCalls = []
    rangeArgs = null as any
    vi.clearAllMocks()
    // Reset mock function calls
    queryMock.select.mockClear()
    queryMock.eq.mockClear()
    queryMock.or.mockClear()
    queryMock.order.mockClear()
    queryMock.range.mockClear()
  })

  it('initial state is correct', () => {
    const s = useStories()
    expect(s.items.value).toEqual([])
    expect(s.total.value).toBe(0)
    expect(s.page.value).toBe(1)
    expect(s.pageSize.value).toBe(12)
    expect(s.hasMore.value).toBe(false)
    expect(s.loading.value).toBe(false)
    expect(s.error.value).toBe(null)
  })

  it('fetchPublic page 1 returns items, exact count, and hasMore true when total > pageSize', async () => {
    const s = useStories()

    currentResponse = { data: makeItems(12, 1), error: null, count: 14 }

    await s.fetchPublic()

    // Query assertions
    expect(selectArgs.options?.count).toBe('exact')
    expect(eqCalls).toContainEqual(['is_private', false])
    expect(orderCalls[0][0]).toBe('created_at')
    expect(orderCalls[0][1]).toEqual({ ascending: false })
    expect(orderCalls[1][0]).toBe('id')
    expect(orderCalls[1][1]).toEqual({ ascending: false })
    expect(rangeArgs).toEqual([0, 11])

    // State assertions
    expect(s.items.value).toHaveLength(12)
    expect(s.total.value).toBe(14)
    expect(s.page.value).toBe(1)
    expect(s.hasMore.value).toBe(true)
    expect(s.loading.value).toBe(false)
  })

  it('fetchPublic page 2 appends and hasMore false on last page', async () => {
    const s = useStories()

    // first page
    currentResponse = { data: makeItems(12, 1), error: null, count: 14 }
    await s.fetchPublic({ page: 1 })

    // second page
    currentResponse = { data: makeItems(2, 13), error: null, count: 14 }
    await s.fetchPublic({ page: 2 })

    expect(rangeArgs).toEqual([12, 23])
    expect(s.items.value).toHaveLength(14)
    expect(s.page.value).toBe(2)
    expect(s.hasMore.value).toBe(false)
  })

  it('applies search across title, content, genre, description', async () => {
    const s = useStories()
    currentResponse = { data: makeItems(3), error: null, count: 3 }
    await s.fetchPublic({ search: 'adventure' })

    const joined = orCalls.join(' ')
    expect(joined).toContain('title.ilike.%adventure%')
    expect(joined).toContain('content.ilike.%adventure%')
    expect(joined).toContain('genre.ilike.%adventure%')
    expect(joined).toContain('description.ilike.%adventure%')
  })

  it('filters by story_type', async () => {
    const s = useStories()
    currentResponse = { data: makeItems(1), error: null, count: 1 }
    await s.fetchPublic({ type: 'short_story' })

    expect(eqCalls).toContainEqual(['story_type', 'short_story'])
  })

  it('fetchMine filters by user and optional privacy', async () => {
    const s = useStories()
    currentResponse = { data: makeItems(2), error: null, count: 2 }

    await s.fetchMine('user-123', { privacy: 'private' })

    expect(eqCalls).toContainEqual(['user_id', 'user-123'])
    expect(eqCalls).toContainEqual(['is_private', true])
  })

  it('handles errors and exposes error message', async () => {
    const s = useStories()
    currentResponse = { data: null, error: { message: 'DB failed' }, count: null }

    await s.fetchPublic()

    expect(s.error.value).toBe('DB failed')
    expect(s.loading.value).toBe(false)
  })
})
