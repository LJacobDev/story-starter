import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { ComputedRef } from 'vue'

export interface RouteGuardOptions {
  requireAuth?: boolean
  requireEmailVerification?: boolean
  redirectTo?: string
}

export interface RouteGuardResult {
  canAccess: boolean
  redirectTo?: string
  reason?: string
}

/**
 * Simple route guard composable for protecting routes
 * Since we're not using Vue Router yet, this is a utility for manual route protection
 */
export function useRouteGuard(options: RouteGuardOptions = {}): ComputedRef<RouteGuardResult> {
  const { 
    requireAuth = false, 
    requireEmailVerification = false,
    redirectTo = '/auth'
  } = options

  const { isAuthenticated, user } = useAuth()

  return computed(() => {
    // If no auth required, allow access
    if (!requireAuth) {
      return { canAccess: true }
    }

    // Check if user is authenticated
    if (!isAuthenticated.value) {
      return {
        canAccess: false,
        redirectTo: redirectTo,
        reason: 'Authentication required'
      }
    }

    // Check email verification if required
    if (requireEmailVerification && user.value && !user.value.email_confirmed_at) {
      return {
        canAccess: false,
        redirectTo: '/auth/verify',
        reason: 'Email verification required'
      }
    }

    return { canAccess: true }
  })
}

/**
 * Higher-order function to protect views/components
 */
export function withRouteGuard<T extends (...args: any[]) => any>(
  component: T,
  guardOptions: RouteGuardOptions
): T {
  return ((...args: any[]) => {
    const guard = useRouteGuard(guardOptions)
    
    if (!guard.value.canAccess) {
      console.warn(`Access denied: ${guard.value.reason}`)
      // In a real router setup, this would redirect
      // For now, we'll just log and return a access denied component
      return null
    }
    
    return component(...args)
  }) as T
}

/**
 * Simple auth check utility for use in templates
 */
export function canAccess(options: RouteGuardOptions): boolean {
  const guard = useRouteGuard(options)
  return guard.value.canAccess
}
