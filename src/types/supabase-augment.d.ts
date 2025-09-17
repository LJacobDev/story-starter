// Augment Supabase client types in order to allow test-time helpers like `auth.verify` used in TDD tests
// This keeps TypeScript happy during CI builds where tests compile with tsc

import '@supabase/supabase-js'

declare module '@supabase/supabase-js' {
  export interface SupabaseAuthClient {
    // optional test helper used by unit tests to simulate email verification
    verify?: (args: { token: string }) => Promise<any>
    // keep this open for other possible test-only helpers
    [key: string]: any
  }
}
