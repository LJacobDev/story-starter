import VerifyEmail from '@/views/VerifyEmail.vue'
import Protected from '@/views/Protected.vue'
import Auth from '@/views/Auth.vue'
import Home from '@/views/Home.vue'
import Demo from '@/views/Demo.vue'
import StoryDetails from '@/views/StoryDetails.vue'

export const appRoutes = [
  // Home route
  { path: '/', component: Home },
  // Public verification callback route
  { path: '/verify-email', component: VerifyEmail },
  // Authentication entry point (guest only)
  { path: '/auth', component: Auth, meta: { guestOnly: true } },
  // Demo route
  { path: '/demo', component: Demo },
  // Story details
  { path: '/stories/:id', name: 'story-details', component: StoryDetails },
  // Protected route example
  { path: '/protected', component: Protected, meta: { requireAuth: true, requireEmailVerification: true } },
  // Catch-all -> redirect to home
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default appRoutes
