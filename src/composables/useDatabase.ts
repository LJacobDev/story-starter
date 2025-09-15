import { ref } from 'vue'
import { supabase, createSupabaseResponse, handleSupabaseError } from '@/utils/supabase'
import type { 
  StoryStarterProfile, 
  StoryStarterStory, 
  StoryStarterAnalytic,
  SupabaseResponse,
  ProfileInsert,
  ProfileUpdate,
  StoryInsert,
  StoryUpdate,
  AnalyticInsert
} from '@/types/database'

export const useDatabase = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Helper to set loading and error states
  const setLoadingState = (isLoading: boolean, errorMessage: string | null = null) => {
    loading.value = isLoading
    error.value = errorMessage
  }

  // Profile operations
  const createProfile = async (
    profile: ProfileInsert
  ): Promise<SupabaseResponse<StoryStarterProfile>> => {
    setLoadingState(true)

    try {
      const { data, error: supabaseError } = await (supabase as any)
        .from('story_starter_profiles')
        .insert(profile)
        .select()
        .single()

      const response = createSupabaseResponse<StoryStarterProfile>(data, supabaseError)
      setLoadingState(false, response.error)
      return response
    } catch (err) {
      const errorMsg = handleSupabaseError(err)
      setLoadingState(false, errorMsg)
      return createSupabaseResponse<StoryStarterProfile>(null, err)
    }
  }

  const getProfile = async (userId: string): Promise<SupabaseResponse<StoryStarterProfile>> => {
    setLoadingState(true)

    try {
      const { data, error: supabaseError } = await supabase
        .from('story_starter_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const response = createSupabaseResponse<StoryStarterProfile>(data, supabaseError)
      setLoadingState(false, response.error)
      return response
    } catch (err) {
      const errorMsg = handleSupabaseError(err)
      setLoadingState(false, errorMsg)
      return createSupabaseResponse<StoryStarterProfile>(null, err)
    }
  }

  const updateProfile = async (
    userId: string, 
    updates: ProfileUpdate
  ): Promise<SupabaseResponse<StoryStarterProfile>> => {
    setLoadingState(true)

    try {
      const { data, error: supabaseError } = await (supabase as any)
        .from('story_starter_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      const response = createSupabaseResponse<StoryStarterProfile>(data, supabaseError)
      setLoadingState(false, response.error)
      return response
    } catch (err) {
      const errorMsg = handleSupabaseError(err)
      setLoadingState(false, errorMsg)
      return createSupabaseResponse<StoryStarterProfile>(null, err)
    }
  }

  // Story operations
  const createStory = async (
    story: StoryInsert
  ): Promise<SupabaseResponse<StoryStarterStory>> => {
    setLoadingState(true)

    try {
      const { data, error: supabaseError } = await (supabase as any)
        .from('story_starter_stories')
        .insert(story)
        .select()
        .single()

      const response = createSupabaseResponse<StoryStarterStory>(data, supabaseError)
      setLoadingState(false, response.error)
      return response
    } catch (err) {
      const errorMsg = handleSupabaseError(err)
      setLoadingState(false, errorMsg)
      return createSupabaseResponse<StoryStarterStory>(null, err)
    }
  }

  const getStories = async (options?: {
    userId?: string
    isPrivate?: boolean
    limit?: number
    offset?: number
  }): Promise<SupabaseResponse<StoryStarterStory[]>> => {
    setLoadingState(true)

    try {
      let query = supabase
        .from('story_starter_stories')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters based on options
      if (options?.userId && options?.isPrivate !== undefined) {
        if (options.isPrivate) {
          // Show only private stories for the user
          query = query.eq('user_id', options.userId).eq('is_private', true)
        } else {
          // Show only public stories
          query = query.eq('is_private', false)
        }
      } else if (options?.userId) {
        // Show public stories + user's private stories
        query = query.or(`is_private.eq.false,and(is_private.eq.true,user_id.eq.${options.userId})`)
      } else {
        // Show only public stories when no user
        query = query.eq('is_private', false)
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error: supabaseError } = await query

      const response = createSupabaseResponse<StoryStarterStory[]>(data, supabaseError)
      setLoadingState(false, response.error)
      return response
    } catch (err) {
      const errorMsg = handleSupabaseError(err)
      setLoadingState(false, errorMsg)
      return createSupabaseResponse<StoryStarterStory[]>(null, err)
    }
  }

  const getStory = async (storyId: string): Promise<SupabaseResponse<StoryStarterStory>> => {
    setLoadingState(true)

    try {
      const { data, error: supabaseError } = await supabase
        .from('story_starter_stories')
        .select('*')
        .eq('id', storyId)
        .single()

      const response = createSupabaseResponse<StoryStarterStory>(data, supabaseError)
      setLoadingState(false, response.error)
      return response
    } catch (err) {
      const errorMsg = handleSupabaseError(err)
      setLoadingState(false, errorMsg)
      return createSupabaseResponse<StoryStarterStory>(null, err)
    }
  }

  const updateStory = async (
    storyId: string, 
    updates: StoryUpdate
  ): Promise<SupabaseResponse<StoryStarterStory>> => {
    setLoadingState(true)

    try {
      const { data, error: supabaseError } = await (supabase as any)
        .from('story_starter_stories')
        .update(updates)
        .eq('id', storyId)
        .select()
        .single()

      const response = createSupabaseResponse<StoryStarterStory>(data, supabaseError)
      setLoadingState(false, response.error)
      return response
    } catch (err) {
      const errorMsg = handleSupabaseError(err)
      setLoadingState(false, errorMsg)
      return createSupabaseResponse<StoryStarterStory>(null, err)
    }
  }

  const deleteStory = async (storyId: string): Promise<SupabaseResponse<boolean>> => {
    setLoadingState(true)

    try {
      const { error: supabaseError } = await supabase
        .from('story_starter_stories')
        .delete()
        .eq('id', storyId)

      const success = !supabaseError
      const response = createSupabaseResponse<boolean>(success, supabaseError)
      setLoadingState(false, response.error)
      return response
    } catch (err) {
      const errorMsg = handleSupabaseError(err)
      setLoadingState(false, errorMsg)
      return createSupabaseResponse<boolean>(false, err)
    }
  }

  // Analytics operations
  const trackEvent = async (
    event: AnalyticInsert
  ): Promise<SupabaseResponse<StoryStarterAnalytic>> => {
    setLoadingState(true)

    try {
      const { data, error: supabaseError } = await (supabase as any)
        .from('story_starter_analytics')
        .insert(event)
        .select()
        .single()

      const response = createSupabaseResponse<StoryStarterAnalytic>(data, supabaseError)
      setLoadingState(false, response.error)
      return response
    } catch (err) {
      const errorMsg = handleSupabaseError(err)
      setLoadingState(false, errorMsg)
      return createSupabaseResponse<StoryStarterAnalytic>(null, err)
    }
  }

  const getAnalytics = async (
    userId: string, 
    eventType?: string
  ): Promise<SupabaseResponse<StoryStarterAnalytic[]>> => {
    setLoadingState(true)

    try {
      let query = supabase
        .from('story_starter_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (eventType) {
        query = query.eq('event_type', eventType)
      }

      const { data, error: supabaseError } = await query

      const response = createSupabaseResponse<StoryStarterAnalytic[]>(data, supabaseError)
      setLoadingState(false, response.error)
      return response
    } catch (err) {
      const errorMsg = handleSupabaseError(err)
      setLoadingState(false, errorMsg)
      return createSupabaseResponse<StoryStarterAnalytic[]>(null, err)
    }
  }

  return {
    // Reactive state
    loading,
    error,
    
    // Profile operations
    createProfile,
    getProfile,
    updateProfile,
    
    // Story operations
    createStory,
    getStories,
    getStory,
    updateStory,
    deleteStory,
    
    // Analytics operations
    trackEvent,
    getAnalytics
  }
}
