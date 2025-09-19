import VerifyEmail from '@/views/VerifyEmail.vue'
import Protected from '@/views/Protected.vue'
import Auth from '@/views/Auth.vue'
import Home from '@/views/Home.vue'
// Removed static Demo import so demo stays out of production bundles
import StoryDetails from '@/views/StoryDetails.vue'

export const appRoutes = [
  // Home route
  { path: '/', component: Home },
  // Public verification callback route
  { path: '/verify-email', component: VerifyEmail },
  // Authentication entry point (guest only)
  { path: '/auth', component: Auth, meta: { guestOnly: true } },
  // Story generation route (Phase 4) — now protected
  { path: '/generate', component: () => import('@/views/GenerateStory.vue'), meta: { requireAuth: true } },
  // Story details
  { path: '/stories/:id', name: 'story-details', component: StoryDetails },
  // Protected route example
  { path: '/protected', component: Protected, meta: { requireAuth: true, requireEmailVerification: true } },
  // Catch-all -> redirect to home
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

// Dev-only route registration (kept together for clarity)
if (import.meta && import.meta.env && import.meta.env.DEV) {
  // Lazy-load demo only in dev so it is not part of production bundles
  ;(appRoutes as any).splice((appRoutes as any).length - 1, 0, {
    path: '/demo',
    component: () => import('@/views/Demo.vue')
  })

  // /dev sandbox
  ;(appRoutes as any).splice((appRoutes as any).length - 1, 0, {
    path: '/dev',
    component: () => import('@/views/DevSandbox.vue')
  })
  // /dev/details -> redirect to mock story id for StoryDetails demo
  ;(appRoutes as any).splice((appRoutes as any).length - 1, 0, {
    path: '/dev/details',
    redirect: '/stories/mock-1'
  })
}

export default appRoutes
