import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/lib/supabase'

// Mock the supabase client for these tests
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      verify: vi.fn()
    }
  }
}))

const createMockUser = (overrides = {}) => ({
  id: '123',
  email: 'verify@example.com',
  email_confirmed_at: new Date().toISOString(),
  ...overrides
})

const createMockSession = () => ({
  access_token: 'access',
  refresh_token: 'refresh',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
})

const createMockError = (message: string) => ({
  message,
  code: 'auth_error',
  status: 400,
  name: 'AuthError'
})

describe('Email confirmation (TDD) - confirmEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should confirm email when token is valid', async () => {
    const mockUser = createMockUser()
    const mockSession = createMockSession()

    vi.mocked(supabase.auth.verify).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null
    } as any)

    const { confirmEmail } = useAuth()

    // This test is expected to fail until confirmEmail(token) is implemented
    const result = await (confirmEmail as any)('VALID_TOKEN')

    expect(result.success).toBe(true)
    expect(result.error).toBeNull()
    expect(result.user).toEqual(mockUser)
    expect(supabase.auth.verify).toHaveBeenCalledWith({ token: 'VALID_TOKEN' })
  })

  it('should return an error for invalid or expired token', async () => {
    vi.mocked(supabase.auth.verify).mockResolvedValue({
      data: null,
      error: createMockError('Invalid or expired token')
    } as any)

    const { confirmEmail } = useAuth()

    const result = await (confirmEmail as any)('BAD_TOKEN')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid or expired token')
  })
})
