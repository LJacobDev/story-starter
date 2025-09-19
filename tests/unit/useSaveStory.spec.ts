import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSaveStory } from '@/composables/useSaveStory'

// Shapes used by tests
interface Draft {
  title: string
  content: string
  story_type: 'short-story' | 'movie-summary' | 'tv-commercial'
  genre?: string
  description?: string
  image_url?: string
  is_private?: boolean
}

// Define Supabase mock in a hoist-safe way and expose state on globalThis for assertions
vi.mock('@/utils/supabase', () => {
  const state = {
    lastInsertedRows: null as any[] | null,
    insertCalls: 0,
    selectArg: undefined as string | undefined,
    singleCalled: 0,
    currentInsertResponse: { data: { id: 'new-id-1' }, error: null as any },
  }
  const insertChain: any = {
    select: vi.fn((cols?: string) => { state.selectArg = cols; return insertChain }),
    single: vi.fn(async () => { state.singleCalled++; return state.currentInsertResponse })
  }
  const from = vi.fn(() => ({
    insert: vi.fn((rows: any[]) => {
      state.insertCalls++
      state.lastInsertedRows = rows
      return insertChain
    })
  }))
  ;(globalThis as any).__saveStory = { state, from, insertChain }
  return { supabase: { from } }
})

function makeDraft(overrides: Partial<Draft> = {}): Draft {
  return {
    title: 'My Story',
    content: 'Generated content',
    story_type: 'short-story',
    genre: 'Drama',
    description: 'Desc',
    image_url: undefined,
    is_private: undefined,
    ...overrides,
  }
}

describe('useSaveStory (4.1.3c — tests first)', () => {
  beforeEach(() => {
    const g: any = (globalThis as any).__saveStory
    g.state.lastInsertedRows = null
    g.state.insertCalls = 0
    g.state.selectArg = undefined
    g.state.singleCalled = 0
    g.state.currentInsertResponse = { data: { id: 'new-id-1' }, error: null }
    vi.clearAllMocks()
  })

  it('inserts a story with default is_private=true when not provided; returns id and sets saving flags', async () => {
    const { save, saving, error } = useSaveStory()

    expect(saving.value).toBe(false)
    expect(error.value).toBe(null)

    const draft = makeDraft({ is_private: undefined })
    const res = await save(draft, { idempotencyKey: 'k1' })

    const g: any = (globalThis as any).__saveStory

    expect(res.ok).toBe(true)
    expect(res.ok && (res as any).id).toBe('new-id-1')
    expect(g.state.insertCalls).toBe(1)
    expect(g.from).toHaveBeenCalledWith('story_starter_stories')
    expect(g.state.selectArg).toBe('id')
    expect(g.state.singleCalled).toBe(1)

    // Rows should not include user_id; is_private defaulted to true
    const row = g.state.lastInsertedRows![0]
    expect(row.user_id).toBeUndefined()
    expect(row.is_private).toBe(true)

    // Ensure shape includes fields from draft
    expect(row.title).toBe(draft.title)
    expect(row.content).toBe(draft.content)
    expect(row.story_type).toBe(draft.story_type)
  })

  it('respects provided is_private=false and passes through optional fields', async () => {
    const { save } = useSaveStory()
    const draft = makeDraft({ is_private: false, image_url: 'https://x/y.jpg' })

    await save(draft, { idempotencyKey: 'k2' })

    const g: any = (globalThis as any).__saveStory
    const row = g.state.lastInsertedRows![0]
    expect(row.is_private).toBe(false)
    expect(row.image_url).toBe('https://x/y.jpg')
  })

  it('prevents double-save within session for the same idempotencyKey; returns same id without re-inserting', async () => {
    const { save } = useSaveStory()
    const draft = makeDraft()

    const first = await save(draft, { idempotencyKey: 'dup' })
    const g: any = (globalThis as any).__saveStory
    expect(first.ok).toBe(true)
    expect(g.state.insertCalls).toBe(1)

    const second = await save(draft, { idempotencyKey: 'dup' })
    expect(second.ok).toBe(true)
    expect((second as any).id).toBe((first as any).id)
    expect(g.state.insertCalls).toBe(1) // still 1, no second insert
  })

  it('allows retry with the same key after a failed attempt (idempotency records only on success)', async () => {
    const { save } = useSaveStory()
    const g: any = (globalThis as any).__saveStory

    // First attempt fails
    g.state.currentInsertResponse = { data: null, error: { message: 'DB fail', code: '400' } }
    const fail = await save(makeDraft(), { idempotencyKey: 'retry-key' })
    expect(fail.ok).toBe(false)
    expect(g.state.insertCalls).toBe(1)

    // Second attempt succeeds with same key
    g.state.currentInsertResponse = { data: { id: 'new-id-2' }, error: null }
    const ok = await save(makeDraft(), { idempotencyKey: 'retry-key' })
    expect(ok.ok).toBe(true)
    expect((ok as any).id).toBe('new-id-2')
    expect(g.state.insertCalls).toBe(2)
  })

  it('maps Supabase errors into user-facing messages and codes; saving resets to false', async () => {
    const { save, saving, error } = useSaveStory()
    const g: any = (globalThis as any).__saveStory

    g.state.currentInsertResponse = { data: null, error: { message: 'Insert blocked by RLS', code: '42501' } }

    const p = save(makeDraft(), { idempotencyKey: 'err' })
    expect(saving.value).toBe(true)
    const res = await p

    expect(res.ok).toBe(false)
    expect(error.value?.message).toBe('Insert blocked by RLS')
    expect(error.value?.code).toBe('42501')
    expect(saving.value).toBe(false)
  })
})
