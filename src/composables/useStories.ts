import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { StoryStarterStory } from '@/types/database'

export type StoriesQuery = {
  page?: number
  pageSize?: number
  search?: string
  type?: string
  privacy?: 'public' | 'private'
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

    let q = base
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })

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
      .eq('is_private', false)

    return runQuery(base, opts)
  }

  async function fetchMine(userId: string, opts: StoriesQuery = {}) {
    const base = (supabase as any)
      .from('story_starter_stories')
      .eq('user_id', userId)

    if (opts.privacy) {
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
