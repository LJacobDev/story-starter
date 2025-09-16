import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database, SupabaseResponse } from '@/types/database'

// Environment validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY
const isTest = import.meta.env.MODE === 'test' || process.env.NODE_ENV === 'test'

// Function to validate and create Supabase client
function createSupabaseClient(): SupabaseClient<Database> {
  if (isTest) {
    // Return a minimal stub for tests to avoid requiring real env vars or network access.
    // Tests should mock this module as needed, but having a harmless stub avoids early throws.
    return {
      auth: {
        signUp: async () => ({ data: null, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        resend: async () => ({ error: null }),
        refreshSession: async () => ({ data: { session: null }, error: null })
      }
    } as unknown as SupabaseClient<Database>
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.')
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

// Lazy initialization of Supabase client
let supabaseClient: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient()
  }
  return supabaseClient
}

// For testing - allows resetting the client
export function resetSupabaseClient(): void {
  supabaseClient = null
}

// Backward compatibility - export the client getter as supabase
export const supabase = getSupabaseClient()

// Utility function to create consistent response format
export const createSupabaseResponse = <T>(
  data: T | null,
  error: any = null
): SupabaseResponse<T> => {
  const errorMessage = error?.message || error || null
  
  // Log errors for debugging (could be expanded with proper logging service)
  if (error) {
    console.error('Supabase operation error:', error)
  }

  return {
    data,
    error: errorMessage,
    success: !error && data !== null
  }
}

// Helper function to handle Supabase PostgrestError
export const handleSupabaseError = (error: any): string => {
  // Handle string errors directly
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return 'No data found'
      case '23505':
        return 'A record with this data already exists'
      case '23503':
        return 'Referenced record does not exist'
      default:
        return error.message || 'Database operation failed'
    }
  }
  return error?.message || 'An unexpected error occurred'
}
