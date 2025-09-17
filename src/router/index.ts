import type { Router } from 'vue-router'
import { useRouteGuard } from '@/composables/useRouteGuard'
import appRoutes from './routes'

export function setupRouterGuards(router: Router) {
  // Ensure central routes are registered if the app hasn't already registered them
  try {
    for (const r of appRoutes) {
      // avoid duplicate registration
      if (!router.hasRoute((r as any).name ?? (r as any).path)) {
        router.addRoute(r as any)
      }
    }
  } catch (e) {
    // silent - router may already have routes
  }

  router.beforeEach((to, _from, next) => {
    const requireAuth = !!to.meta?.requireAuth
    const requireEmailVerification = !!to.meta?.requireEmailVerification

    // Use the existing composable to compute guard result
    const guard = useRouteGuard({
      requireAuth,
      requireEmailVerification
    })

    const result = guard.value

    if (!result.canAccess) {
      const redirect = result.redirectTo ?? '/auth'
      next({ path: redirect })
      return
    }

    next()
  })
}
