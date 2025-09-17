import VerifyEmail from '@/views/VerifyEmail.vue'

export const appRoutes = [
  // Public verification callback route
  { path: '/verify-email', component: VerifyEmail },
  // Placeholder for additional app routes; router guards can use meta flags when installing guards
  // { path: '/protected', component: ProtectedComponent, meta: { requireAuth: true } }
]

export default appRoutes
