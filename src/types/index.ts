// Database table interfaces
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Story {
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

export interface Profile {
  id: string
  email?: string
  feedback?: string
  story_count: number
  created_at: string
  updated_at: string
}

export interface AnalyticsEvent {
  id: string
  user_id: string
  event_type: string
  event_data?: Record<string, any>
  timestamp: string
}

// UI/Form interfaces
export interface StoryFormData {
  title: string
  description: string
  story_type: string
  characters: Character[]
  themes: string[]
  plot_points: string[]
  is_private: boolean
  image_url?: string
}

export interface Character {
  name: string
  role: string
  description: string
}

// API Response interfaces
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// Story generation interfaces
export interface GenerationRequest {
  story_type: string
  characters: Character[]
  themes: string[]
  plot_points: string[]
  tone?: string
  creativity_level?: number
}

export interface GenerationResponse {
  title: string
  content: string
  genre?: string
  description?: string
}
