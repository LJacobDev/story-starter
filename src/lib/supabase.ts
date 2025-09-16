// Compatibility export for tests and app code.
// Prefer importing from '@/lib/supabase' in composables so Vitest module mocks work reliably.
import { getSupabaseClient, resetSupabaseClient } from '@/utils/supabase'

export const supabase = getSupabaseClient()
export { getSupabaseClient, resetSupabaseClient }
