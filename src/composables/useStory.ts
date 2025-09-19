import { supabase } from '@/utils/supabase'

export type StoryRecord = {
  id: string
  user_id?: string
  title: string
  content?: string
  story_type?: string
  genre?: string | null
  description?: string | null
  image_url?: string | null
  is_private?: boolean
  created_at?: string
  updated_at?: string
}

export type StoryResult =
  | { data: StoryRecord; error: null }
  | { data: null; error: { message: string; code?: string | number } }

export function useStory() {
  async function getById(id: string): Promise<StoryResult> {
    try {
      const { data, error } = await (supabase as any)
        .from('story_starter_stories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error: { message: error.message || 'Not found', code: (error as any).code } }
      }

      if (!data) {
        return { data: null, error: { message: 'Not found', code: '404' } }
      }

      // RLS enforces access: anon can only read public; owner can read their private stories
      return { data, error: null }
    } catch (e: any) {
      return { data: null, error: { message: e?.message || String(e) } }
    }
  }

  return { getById }
}
