import { vi } from 'vitest'

// Default mock for '@/lib/supabase' to prevent real network calls during tests
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      resend: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      refreshSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null })
    }
  }
}))

// Make sure window.location.origin is defined in the JSDOM environment
if (typeof window !== 'undefined' && !window.location.origin) {
  // some test environments might not have origin set
  Object.defineProperty(window.location, 'origin', {
    configurable: true,
    value: 'http://localhost'
  })
}

export {} // module augmentation
