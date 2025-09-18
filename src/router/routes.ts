import VerifyEmail from '@/views/VerifyEmail.vue'
import Protected from '@/views/Protected.vue'
import Auth from '@/views/Auth.vue'

export const appRoutes = [
  // Public verification callback route
  { path: '/verify-email', component: VerifyEmail },
  // Authentication entry point
  { path: '/auth', component: Auth },
  // Protected route example
  { path: '/protected', component: Protected, meta: { requireAuth: true, requireEmailVerification: true } },
  // Placeholder for additional app routes; router guards can use meta flags when installing guards
  // { path: '/protected', component: ProtectedComponent, meta: { requireAuth: true } }
]

export default appRoutes
