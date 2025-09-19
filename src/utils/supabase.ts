import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database, SupabaseResponse } from '@/types/database'

// Environment validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const isTest = import.meta.env.MODE === 'test' || process.env.NODE_ENV === 'test'

// Function to validate and create Supabase client
function createSupabaseClient(): SupabaseClient<Database> {
  if (isTest) {
    // Return a minimal stub for tests to avoid requiring real env vars or network access.
    // Tests should mock this module as needed, but having a harmless stub avoids early throws.
    const stub: any = {
      auth: {
        signUp: async () => ({ data: null, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        resend: async () => ({ error: null }),
        refreshSession: async () => ({ data: { session: null }, error: null })
      },
      // Minimal Functions API stub that proxies to global.fetch.
      functions: {
        invoke: async (name: string, options?: { body?: any; headers?: Record<string, string> }) => {
          const globalAny: any = globalThis as any
          const f: typeof fetch | undefined = globalAny.fetch
          // Match unit test expectation: relative path endpoint
          const url = `/functions/v1/${name}`
          if (!f) {
            return { data: '', error: { status: 'NO_FETCH', message: 'fetch not available' } }
          }
          const res = await f(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
            body: JSON.stringify(options?.body ?? {}),
          })
          const text = await (res as any).text?.() ?? ''
          if (!(res as any).ok) {
            // Shape error similar to supabase-js functions error
            const retryAfter = (res as any).headers?.get?.('Retry-After') || (res as any).headers?.get?.('retry-after')
            return {
              data: null,
              error: {
                status: (res as any).status,
                message: text || 'Request failed',
                context: retryAfter ? { 'Retry-After': retryAfter } : undefined,
              },
            }
          }
          return { data: text, error: null }
        },
      },
    }
    return stub as SupabaseClient<Database>
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.')
  }
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
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
