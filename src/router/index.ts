import { createRouter, createWebHashHistory, type Router } from 'vue-router'
import { useRouteGuard } from '@/composables/useRouteGuard'
import { useAuth } from '@/composables/useAuth'
import appRoutes from './routes'

// Create router using hash history. IMPORTANT: don't pass import.meta.env.BASE_URL here.
// With hash routing, the path after # should start with '/', e.g. '#/verify-email'.
// Passing a base like '/story-starter/' would break matching (URLs look like '#/').
const router = createRouter({
  history: createWebHashHistory(),
  routes: appRoutes as any
})

export function setupRouterGuards(r: Router = router) {
  // Install guards
  r.beforeEach((to, _from, next) => {
    const requireAuth = !!to.meta?.requireAuth
    const requireEmailVerification = !!to.meta?.requireEmailVerification
    const guestOnly = !!to.meta?.guestOnly

    // Use the existing composable to compute guard result for protected routes
    const guard = useRouteGuard({
      requireAuth,
      requireEmailVerification
    })

    // Guest-only: if already authenticated, send to home
    if (guestOnly) {
      const { isAuthenticated } = useAuth()
      if (isAuthenticated.value) {
        next({ path: '/' })
        return
      }
      // Not authenticated -> allow access to guest page
      next()
      return
    }

    const result = guard.value

    if (!result.canAccess) {
      const redirect = result.redirectTo ?? '/auth'
      next({ path: redirect })
      return
    }

    next()
  })
}

export default router
