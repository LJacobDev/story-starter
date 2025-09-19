import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { StoryStarterStory } from '@/types/database'

export type StoriesQuery = {
  page?: number
  pageSize?: number
  search?: string
  type?: string
  privacy?: 'public' | 'private'
  date?: 'newest' | 'oldest' | 'last7' | 'last30' | 'all'
}

export function useStories() {
  const items = ref<StoryStarterStory[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(12)
  const hasMore = ref(false)
  const loading = ref(false)
  const error = ref<{ message: string; code?: string } | null>(null)

  function buildSearchOr(search: string) {
    const term = search.trim()
    if (!term) return null
    const encoded = term.replace(/%/g, '')
    return [
      `title.ilike.%${encoded}%`,
      `content.ilike.%${encoded}%`,
      `genre.ilike.%${encoded}%`,
      `description.ilike.%${encoded}%`
    ].join(',')
  }

  async function runQuery(base: any, opts: StoriesQuery = {}) {
    const p = opts.page ?? 1
    const size = opts.pageSize ?? pageSize.value
    const from = (p - 1) * size
    const to = from + size - 1

    loading.value = true
    error.value = null

    // Assume base is already a PostgrestFilterBuilder (i.e., after .select())
    // Apply ordering based on date preset
    const ascending = opts.date === 'oldest'
    let q = base
      .order('created_at', { ascending })
      .order('id', { ascending })

    // Date range presets
    if (opts.date === 'last7' || opts.date === 'last30') {
      const days = opts.date === 'last7' ? 7 : 30
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      q = q.gte('created_at', cutoff)
    }

    if (opts.type) {
      q = q.eq('story_type', opts.type)
    }

    if (opts.search) {
      const orExpr = buildSearchOr(opts.search)
      if (orExpr) q = q.or(orExpr)
    }

    const { data, error: e, count } = await q.range(from, to)

    if (e) {
      error.value = { message: e.message || String(e), code: (e as any).code }
      loading.value = false
      return
    }

    if (p === 1) items.value = data || []
    else items.value = [...items.value, ...(data || [])]

    total.value = count || 0
    page.value = p
    pageSize.value = size
    hasMore.value = p * size < (count || 0)
    loading.value = false
  }

  async function fetchPublic(opts: StoriesQuery = {}) {
    const base = (supabase as any)
      .from('story_starter_stories')
      .select('*', { count: 'exact' })
      .eq('is_private', false)

    return runQuery(base, opts)
  }

  async function fetchMine(userId: string, opts: StoriesQuery = {}) {
    const base = (supabase as any)
      .from('story_starter_stories')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (opts.privacy) {
      // Apply privacy filter to the base before ordering/range
      base.eq('is_private', opts.privacy === 'private')
    }

    return runQuery(base, opts)
  }

  return {
    items,
    total,
    page,
    pageSize,
    hasMore,
    loading,
    error,
    fetchPublic,
    fetchMine
  }
}
