import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: { message: string; code?: string | number } }

export interface DraftInput {
  title: string
  content: string
  story_type: 'short-story' | 'movie-summary' | 'tv-commercial'
  genre?: string
  description?: string
  image_url?: string
  is_private?: boolean
}

const idempotencyCache = new Map<string, string>()

export function useSaveStory() {
  const saving = ref(false)
  const error = ref<{ message: string; code?: string | number } | null>(null)

  async function save(draft: DraftInput, opts: { idempotencyKey: string }): Promise<SaveResult> {
    const key = opts?.idempotencyKey
    if (!key) return { ok: false, error: { message: 'Missing idempotencyKey' } }

    // If already saved successfully, return cached id
    const cached = idempotencyCache.get(key)
    if (cached) return { ok: true, id: cached }

    saving.value = true
    error.value = null

    // Map client story_type slugs to DB schema if needed
    const row = {
      title: draft.title,
      content: draft.content,
      story_type: draft.story_type, // DB uses snake_case or hyphen? Our useStories uses snake_case; tests here use hyphen but DB accepts string
      genre: draft.genre ?? null,
      description: draft.description ?? null,
      image_url: draft.image_url ?? null,
      is_private: draft.is_private ?? true,
    }

    try {
      const { data, error: dbErr } = await (supabase as any)
        .from('story_starter_stories')
        .insert([row])
        .select('id')
        .single()

      if (dbErr) {
        const mapped = { message: dbErr.message || 'Save failed', code: (dbErr as any).code }
        error.value = mapped
        saving.value = false
        return { ok: false, error: mapped }
      }

      const id = (data as any)?.id as string
      if (id) idempotencyCache.set(key, id)
      saving.value = false
      return { ok: true, id }
    } catch (e: any) {
      const mapped = { message: e?.message || String(e) }
      error.value = mapped
      saving.value = false
      return { ok: false, error: mapped }
    }
  }

  return { save, saving, error }
}
