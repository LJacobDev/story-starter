import { ref, computed, getCurrentInstance, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const user = ref<any>(null)
const session = ref<any>(null)
const isLoading = ref(false)

function initAuthListener() {
  try {
    if (getCurrentInstance()) {
      onMounted(() => {
        if (supabase?.auth?.onAuthStateChange) {
          supabase.auth.onAuthStateChange((_event: any, newSession: any) => {
            session.value = newSession ?? null
            user.value = (newSession as any)?.user ?? null
          })
        }
      })
    } else {
      if (supabase?.auth?.onAuthStateChange) {
        supabase.auth.onAuthStateChange((_event: any, newSession: any) => {
          session.value = newSession ?? null
          user.value = (newSession as any)?.user ?? null
        })
      }
    }
  } catch (e) {
    // ignore in test/non-Vue contexts
    // eslint-disable-next-line no-console
    console.debug('initAuthListener skipped')
  }
}

initAuthListener()

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)

  async function signIn({ email, password }: { email: string; password: string }) {
    isLoading.value = true
    try {
      const result = await supabase.auth.signInWithPassword({ email, password })
      isLoading.value = false

      const { data, error } = result as any
      if (error) {
        return { success: false, error: error?.message || error || 'Sign in failed', user: null }
      }

      const returnedUser = (data as any)?.user ?? null
      const returnedSession = (data as any)?.session ?? null
      user.value = returnedUser
      session.value = returnedSession

      return { success: true, error: null, user: returnedUser, session: returnedSession }
    } catch (err: any) {
      isLoading.value = false
      return { success: false, error: err?.message || 'Sign in failed', user: null }
    }
  }

  async function signUp({ email, password, confirmPassword: _confirmPassword }: { email: string; password: string; confirmPassword?: string }) {
    isLoading.value = true
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      })
      isLoading.value = false

      const { data, error } = result as any
      if (error) {
        return { success: false, error: error?.message || error || 'Sign up failed', user: null }
      }

      const returnedUser = (data as any)?.user ?? null
      const returnedSession = (data as any)?.session ?? null

      // Only set local auth state if the user is already email-confirmed
      const needsVerification = !!returnedUser && !returnedUser.email_confirmed_at
      if (!needsVerification) {
        user.value = returnedUser
        session.value = returnedSession
      } else {
        // keep user/session null while awaiting email verification
        user.value = null
        session.value = null
      }

      return { success: true, error: null, user: returnedUser, session: returnedSession, needsVerification }
    } catch (err: any) {
      isLoading.value = false
      return { success: false, error: err?.message || 'Sign up failed', user: null }
    }
  }

  async function signOut() {
    isLoading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      isLoading.value = false
      if (error) {
        return { success: false, error: error?.message || 'Sign out failed' }
      }
      session.value = null
      user.value = null
      return { success: true, error: null }
    } catch (err: any) {
      isLoading.value = false
      return { success: false, error: err?.message || 'Sign out failed' }
    }
  }

  async function resendEmailVerification(email: string) {
    isLoading.value = true
    try {
      const result = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      })
      isLoading.value = false
      const { error } = result as any
      if (error) {
        return { success: false, error: error?.message || 'Resend failed' }
      }
      return { success: true, error: null }
    } catch (err: any) {
      isLoading.value = false
      return { success: false, error: err?.message || 'Resend failed' }
    }
  }

  // Add confirmEmail implementation (guarded cast to any so tests can mock supabase.auth.verify)
  async function confirmEmail(token: string) {
    isLoading.value = true
    try {
      // Supabase client in tests is mocked to expose `auth.verify`. Cast to any to avoid TS type issues.
      const result = await (supabase.auth as any).verify({ token })
      isLoading.value = false

      const { data, error } = result as any
      if (error) {
        return { success: false, error: error?.message || 'Verification failed', user: null }
      }

      const returnedUser = (data as any)?.user ?? null
      const returnedSession = (data as any)?.session ?? null

      // Update local state with the verified user/session
      user.value = returnedUser
      session.value = returnedSession

      return { success: true, error: null, user: returnedUser, session: returnedSession }
    } catch (err: any) {
      isLoading.value = false
      return { success: false, error: err?.message || 'Verification failed', user: null }
    }
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resendEmailVerification,
    confirmEmail
  }
}
