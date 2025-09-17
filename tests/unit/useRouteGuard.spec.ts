import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useRouteGuard } from '@/composables/useRouteGuard'

// We'll mock the useAuth composable to control auth state for the guard tests
let isAuthenticatedRef = ref(false)
let userRef = ref<any>(null)

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: isAuthenticatedRef,
    user: userRef
  })
}))

describe('useRouteGuard (TDD) - route guard behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // reset default state
    isAuthenticatedRef = ref(false)
    userRef = ref(null)
  })

  it('denies access when authentication is required but user is not authenticated', () => {
    // Arrange: ensure not authenticated
    isAuthenticatedRef.value = false
    userRef.value = null

    // Act
    const guard = useRouteGuard({ requireAuth: true })
    const result = guard.value

    // Assert
    expect(result.canAccess).toBe(false)
    expect(result.redirectTo).toBe('/auth')
    expect(result.reason).toBeDefined()
    expect(result.reason).toMatch(/Authentication required/i)
  })

  it('denies access when email verification is required and user is unverified', () => {
    // Arrange: authenticated but not email confirmed
    isAuthenticatedRef.value = true
    userRef.value = { email: 'test@example.com', email_confirmed_at: null }

    // Act
    const guard = useRouteGuard({ requireAuth: true, requireEmailVerification: true })
    const result = guard.value

    // Assert
    expect(result.canAccess).toBe(false)
    // Updated to match implementation redirect
    expect(result.redirectTo).toBe('/verify-email')
    expect(result.reason).toBeDefined()
    expect(result.reason).toMatch(/Email verification required/i)
  })

  it('allows access when user is authenticated and email verified', () => {
    // Arrange: authenticated and verified
    isAuthenticatedRef.value = true
    userRef.value = { email: 'verified@example.com', email_confirmed_at: new Date().toISOString() }

    // Act
    const guard = useRouteGuard({ requireAuth: true, requireEmailVerification: true })
    const result = guard.value

    // Assert
    expect(result.canAccess).toBe(true)
    expect(result.redirectTo).toBeUndefined()
    expect(result.reason).toBeUndefined()
  })
})
