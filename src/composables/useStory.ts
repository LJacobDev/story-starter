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
    // Dev-only mock to support /dev/details without a database
    if (import.meta && import.meta.env && import.meta.env.DEV && id === 'mock-1') {
      const mock: StoryRecord = {
        id: 'mock-1',
        user_id: 'dev-user-1',
        title: 'Mock Short Story',
        content: 'This is a mock story content used only in development for UI verification.\n\nIt demonstrates the StoryDetails layout.',
        story_type: 'short_story',
        genre: 'Adventure',
        description: 'A mock story record returned by a dev-only branch.',
        image_url: null,
        is_private: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return { data: mock, error: null }
    }

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

  async function remove(id: string): Promise<{ success: boolean; error?: { message: string; code?: string | number } }> {
    try {
      const { error } = await (supabase as any)
        .from('story_starter_stories')
        .delete()
        .eq('id', id)

      if (error) {
        return { success: false, error: { message: error.message || 'Delete failed', code: (error as any).code } }
      }
      return { success: true }
    } catch (e: any) {
      return { success: false, error: { message: e?.message || String(e) } }
    }
  }

  async function update(
    id: string,
    patch: Partial<Pick<StoryRecord, 'title' | 'story_type' | 'genre' | 'description' | 'image_url' | 'is_private' | 'content'>>
  ): Promise<{ success: boolean; data?: StoryRecord; error?: { message: string; code?: string | number } }> {
    try {
      const { data, error } = await (supabase as any)
        .from('story_starter_stories')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        return { success: false, error: { message: error.message || 'Update failed', code: (error as any).code } }
      }
      return { success: true, data }
    } catch (e: any) {
      return { success: false, error: { message: e?.message || String(e) } }
    }
  }

  return { getById, remove, update }
}
