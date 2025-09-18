import '@supabase/supabase-js'

// Module augmentation for @supabase/supabase-js so test helper `auth.verify` is recognized by TypeScript.
// Placing this in a .ts file under src ensures it's included by the project's tsconfig "include" patterns.

declare module '@supabase/supabase-js' {
  export interface SupabaseAuthClient {
    /** Optional test helper used by unit tests to simulate email verification */
    verify?: (args: { token: string }) => Promise<any>
  }
}

export {}
