import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase minimal PostgREST for stories (no storage used in this e2e; URL mode only)
vi.mock('@/utils/supabase', () => {
  type Row = {
    id: string
    user_id: string
    title: string
    content: string
    story_type: string
    is_private: boolean
    image_url?: string | null
    genre?: string | null
    description?: string | null
    created_at: string
  }
  const rows: Row[] = []
  let idSeq = 1

  function builder(table: string) {
    let filters: any = {}
    let dateGte: string | null = null

    const api: any = {
      select: (_cols: string, _opts?: any) => api,
      eq: (col: string, val: any) => {
        filters[col] = val
        return api
      },
      or: (_expr: string) => api,
      order: (_col: string, _opts?: any) => api,
      gte: (col: string, val: string) => {
        if (col === 'created_at') dateGte = val
        return api
      },
      range: async (from: number, to: number) => {
        if (table !== 'story_starter_stories') {
          return { data: [], error: null, count: 0 }
        }
        let data = rows.slice()
        // filters
        for (const [k, v] of Object.entries(filters)) {
          data = data.filter((r: any) => (r as any)[k] === v)
        }
        if (dateGte) {
          data = data.filter((r) => r.created_at >= (dateGte as string))
        }
        const count = data.length
        const slice = data.slice(from, to + 1)
        return { data: slice, error: null, count }
      },
      insert: (arr: any[]) => {
        if (table !== 'story_starter_stories') {
          return {
            select: () => ({
              single: async () => ({ data: null, error: { message: 'unknown table' } }),
            }),
            single: async () => ({ data: null, error: { message: 'unknown table' } }),
          }
        }
        const now = new Date().toISOString()
        const created = arr.map((r) => ({
          id: `s-${idSeq++}`,
          user_id: 'user-123',
          title: r.title,
          content: r.content,
          story_type: r.story_type,
          is_private: r.is_private ?? true,
          image_url: r.image_url ?? null,
          genre: r.genre ?? null,
          description: r.description ?? null,
          created_at: now,
        })) as Row[]
        rows.push(...created)
        return {
          select: (_s: string) => ({
            single: async () => ({ data: created[0], error: null }),
          }),
          single: async () => ({ data: created[0], error: null }),
        }
      },
      single: async () => ({ data: null, error: null }),
    }
    return api
  }

  return {
    supabase: {
      from: (table: string) => builder(table),
    },
  }
})

// Stub global fetch for the edge function
beforeEach(() => {
  ;(globalThis as any).fetch = vi.fn(async (url: string) => {
    if (typeof url === 'string' && url.includes('/functions/v1/gemini-proxy')) {
      // Return JSON wrapped in code fences as the model might
      const body = '```json\n' + JSON.stringify({
        title: 'E2E Test Story',
        story_type: 'short-story',
        genre: 'adventure',
        description: 'A friendly tale generated in tests',
        content: 'Once upon a test...'
      }) + '\n```'
      return {
        ok: true,
        status: 200,
        text: async () => body,
        headers: { get: (_k: string) => null },
      }
    }
    return { ok: false, status: 404, text: async () => 'Not Found', headers: { get: () => null } }
  })
})

import { useGeneration } from '@/composables/useGeneration'
import { useStoryImage } from '@/composables/useStoryImage'
import { useSaveStory } from '@/composables/useSaveStory'
import { useStories } from '@/composables/useStories'

function genKey() {
  return 'e2e-' + Math.random().toString(36).slice(2)
}

describe('Generation E2E (mocked) — happy path', () => {
  it('fills form → generate → preview → URL image → save → fetch mine shows story', async () => {
    // Form payload (normalized like StoryGenerateForm emits)
    const formPayload = {
      title: 'E2E Test Story',
      story_type: 'short-story',
      genre: 'adventure',
      tone: 'light',
      creativity: 0.6,
      themes: ['friendship'],
      plot_points: ['beginning', 'middle', 'end'],
      characters: [{ name: 'A', role: 'protagonist', description: 'Hero' }],
      additional_instructions: 'Keep it short.'
    }

    // 1) Generate (edge mocked)
    const { generateStory } = useGeneration()
    const genRes = await generateStory(formPayload)
    expect(genRes.ok).toBe(true)
    if (!genRes.ok) return

    const preview = { ...genRes.data }

    // 2) URL image mode (no upload)
    const { validateUrl } = useStoryImage()
    const v = validateUrl('https://example.com/cover.jpg')
    expect(v.ok).toBe(true)
    if (v.ok) preview.image_url = v.url

    // 3) Save
    const { save } = useSaveStory()
    const saveRes = await save(
      {
        title: preview.title,
        content: preview.content,
        story_type: preview.story_type as any,
        genre: preview.genre,
        description: preview.description,
        image_url: (preview as any).image_url ?? undefined,
        is_private: true,
      },
      { idempotencyKey: genKey() }
    )
    expect(saveRes.ok).toBe(true)

    // 4) Fetch mine
    const { items, fetchMine } = useStories()
    await fetchMine('user-123', { page: 1, pageSize: 12 })
    expect(items.value.length).toBeGreaterThanOrEqual(1)
    expect(items.value[0].title).toBe('E2E Test Story')
  })
})
