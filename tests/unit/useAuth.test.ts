import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/lib/supabase'

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(),
      resend: vi.fn(),
      refreshSession: vi.fn()
    }
  }
}))

// Helper to create mock user
const createMockUser = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  phone_confirmed_at: null,
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
  ...overrides
})

// Helper to create mock error
const createMockError = (message: string) => ({
  message,
  code: 'auth_error',
  status: 400,
  __isAuthError: true,
  name: 'AuthError'
})

describe('useAuth Composable Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Sign In Functionality', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockUser = createMockUser()

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: mockUser,
          session: {
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: mockUser
          }
        },
        error: null
      } as any)

      const { signIn } = useAuth()

      const result = await signIn({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(result.user).toEqual(mockUser)
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should handle sign in errors', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: createMockError('Invalid credentials')
      } as any)

      const { signIn } = useAuth()

      const result = await signIn({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
      expect(result.user).toBeNull()
    })
  })

  describe('Sign Up Functionality', () => {
    it('should successfully sign up with valid credentials', async () => {
      const mockUser = createMockUser({
        email_confirmed_at: null // Not confirmed yet
      })

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: mockUser,
          session: null
        },
        error: null
      } as any)

      const { signUp } = useAuth()

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(result.user).toEqual(mockUser)
      expect(result.needsVerification).toBe(true)
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: `${import.meta.env.VITE_PUBLIC_URL ?? window.location.origin}${import.meta.env.BASE_URL ?? '/'}#/verify-email`
        }
      })
    })

    it('should handle sign up errors', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: createMockError('Email already exists')
      } as any)

      const { signUp } = useAuth()

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already exists')
      expect(result.user).toBeNull()
    })
  })

  describe('Sign Out Functionality', () => {
    it('should successfully sign out', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null
      } as any)

      const { signOut } = useAuth()

      const result = await signOut()

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: createMockError('Sign out failed')
      } as any)

      const { signOut } = useAuth()

      const result = await signOut()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Sign out failed')
    })
  })

  describe('Email Verification', () => {
    it('should resend email verification', async () => {
      vi.mocked(supabase.auth.resend).mockResolvedValue({
        data: { user: null, session: null },
        error: null
      } as any)

      const { resendEmailVerification } = useAuth()

      const result = await resendEmailVerification('test@example.com')

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(supabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
        options: {
          emailRedirectTo: `${import.meta.env.VITE_PUBLIC_URL ?? window.location.origin}${import.meta.env.BASE_URL ?? '/'}#/verify-email`
        }
      })
    })

    it('should handle resend email verification errors', async () => {
      vi.mocked(supabase.auth.resend).mockResolvedValue({
        data: { user: null, session: null },
        error: createMockError('Rate limit exceeded')
      } as any)

      const { resendEmailVerification } = useAuth()

      const result = await resendEmailVerification('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rate limit exceeded')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors during sign in', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(new Error('Network error'))

      const { signIn } = useAuth()

      const result = await signIn({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(result.user).toBeNull()
    })

    it('should handle network errors during sign up', async () => {
      vi.mocked(supabase.auth.signUp).mockRejectedValue(new Error('Connection failed'))

      const { signUp } = useAuth()

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Connection failed')
      expect(result.user).toBeNull()
    })
  })
})
