import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { ref } from 'vue'

// Mock useAuth composable to control authentication state
let isAuthenticatedRef = ref(false)
let userRef = ref<any>(null)
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: isAuthenticatedRef,
    user: userRef
  })
}))

// Note: This test is TDD-first. It expects a function `setupRouterGuards(router)`
// to exist in `src/router/index.ts` (or similar) and to install a global
// beforeEach guard that redirects based on auth/email verification.

describe('Router-level guards (TDD) - redirects based on auth and verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isAuthenticatedRef = ref(false)
    userRef = ref(null)
  })

  it('redirects unauthenticated users to /auth when route requires auth', async () => {
    // Arrange
    const routes = [
      { path: '/auth', component: { template: '<div>auth</div>' } },
      { path: '/protected', component: { template: '<div>protected</div>' }, meta: { requireAuth: true } }
    ]

    const router = createRouter({ history: createMemoryHistory(), routes })

    // Act - install guards (expected to be implemented)
    const { setupRouterGuards } = await import('@/router')
    setupRouterGuards(router)

    await router.push('/protected')
    await router.isReady()

    // Assert - should be redirected to /auth
    expect(router.currentRoute.value.fullPath).toBe('/auth')
  })

  it('redirects unverified authenticated users to /verify-email when route requires email verification', async () => {
    // Arrange: authenticated but not email confirmed
    isAuthenticatedRef.value = true
    userRef.value = { email: 'test@example.com', email_confirmed_at: null }

    const routes = [
      { path: '/verify-email', component: { template: '<div>verify</div>' } },
      { path: '/protected', component: { template: '<div>protected</div>' }, meta: { requireAuth: true, requireEmailVerification: true } }
    ]

    const router = createRouter({ history: createMemoryHistory(), routes })

    // Act
    const { setupRouterGuards } = await import('@/router')
    setupRouterGuards(router)

    await router.push('/protected')
    await router.isReady()

    // Assert - should be redirected to /verify-email
    expect(router.currentRoute.value.fullPath).toBe('/verify-email')
  })

  it('allows access when user is authenticated and email verified', async () => {
    // Arrange: authenticated and verified
    isAuthenticatedRef.value = true
    userRef.value = { email: 'verified@example.com', email_confirmed_at: new Date().toISOString() }

    const routes = [
      { path: '/protected', component: { template: '<div>protected</div>' }, meta: { requireAuth: true, requireEmailVerification: true } }
    ]

    const router = createRouter({ history: createMemoryHistory(), routes })

    // Act
    const { setupRouterGuards } = await import('@/router')
    setupRouterGuards(router)

    await router.push('/protected')
    await router.isReady()

    // Assert - should remain on /protected
    expect(router.currentRoute.value.fullPath).toBe('/protected')
  })
})
