// Database table interfaces based on the created schema

export interface StoryStarterProfile {
  id: string
  email?: string
  feedback?: Record<string, any>
  story_count: number
  created_at: string
  updated_at: string
}

export interface StoryStarterStory {
  id: string
  user_id: string
  title: string
  content: string
  story_type: string
  is_private: boolean
  image_url?: string
  genre?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface StoryStarterAnalytic {
  id: string
  user_id: string
  event_type: string
  event_data?: Record<string, any>
  timestamp: string
}

// Insert and Update types for each table
export type ProfileInsert = Omit<StoryStarterProfile, 'id' | 'created_at' | 'updated_at'>
export type ProfileUpdate = Partial<Omit<StoryStarterProfile, 'id' | 'created_at' | 'updated_at'>>

export type StoryInsert = Omit<StoryStarterStory, 'id' | 'created_at' | 'updated_at'>
export type StoryUpdate = Partial<Omit<StoryStarterStory, 'id' | 'created_at' | 'updated_at'>>

export type AnalyticInsert = Omit<StoryStarterAnalytic, 'id' | 'timestamp'>
export type AnalyticUpdate = Partial<Omit<StoryStarterAnalytic, 'id' | 'timestamp'>>

// Database interface for Supabase typing
export interface Database {
  public: {
    Tables: {
      story_starter_profiles: {
        Row: StoryStarterProfile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      story_starter_stories: {
        Row: StoryStarterStory
        Insert: StoryInsert
        Update: StoryUpdate
      }
      story_starter_analytics: {
        Row: StoryStarterAnalytic
        Insert: AnalyticInsert
        Update: AnalyticUpdate
      }
    }
  }
}

// Response wrapper type for consistent error handling
export interface SupabaseResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}
