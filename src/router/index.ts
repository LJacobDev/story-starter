import { createRouter, createWebHashHistory, type Router } from 'vue-router'
import { useRouteGuard } from '@/composables/useRouteGuard'
import appRoutes from './routes'

// Create router using hash history so GH Pages serves index.html for all SPA routes
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: appRoutes as any
})

export function setupRouterGuards(r: Router = router) {
  // Ensure central routes are registered if the app hasn't already registered them
  try {
    for (const rr of appRoutes) {
      // avoid duplicate registration
      if (!r.hasRoute((rr as any).name ?? (rr as any).path)) {
        r.addRoute(rr as any)
      }
    }
  } catch (e) {
    // silent - router may already have routes
  }

  r.beforeEach((to, _from, next) => {
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

export default router
