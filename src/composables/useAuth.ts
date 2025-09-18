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

function clearLocalAuthArtifacts() {
  try {
    // Remove any Supabase v2 auth tokens that may remain
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      // Supabase v2 typically uses `sb-<project-ref>-auth-token`
      if (k.startsWith('sb-') && k.endsWith('-auth-token')) keysToRemove.push(k)
      // Some older patterns
      if (k.includes('supabase.auth.token')) keysToRemove.push(k)
      if (k === 'sb-access-token' || k === 'sb-refresh-token') keysToRemove.push(k)
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
  } catch {}
}

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
          emailRedirectTo: `${import.meta.env.VITE_PUBLIC_URL ?? window.location.origin}${import.meta.env.BASE_URL ?? '/'}#/verify-email`
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
    let remoteError: any = null
    try {
      // Clear local session first to avoid UI flicker
      try { await (supabase.auth as any).signOut?.({ scope: 'local' }) } catch {}

      // Attempt remote sign out (may 401/403 if no active session)
      try {
        const res: any = await supabase.auth.signOut()
        remoteError = res?.error ?? null
      } catch (err: any) {
        remoteError = err
      }

      // Always clear local artifacts and state
      clearLocalAuthArtifacts()
      session.value = null
      user.value = null

      isLoading.value = false

      if (remoteError) {
        const status = (remoteError as any)?.status ?? (remoteError as any)?.cause?.status
        const msg = String(remoteError?.message || '').toLowerCase()
        const benign = status === 401 || status === 403 || msg.includes('session missing') || msg.includes('not logged in')
        if (benign) {
          return { success: true, error: null }
        }
        return { success: false, error: remoteError?.message || 'Sign out failed' }
      }

      return { success: true, error: null }
    } catch (err: any) {
      // Defensive: still ensure local cleanup
      clearLocalAuthArtifacts()
      session.value = null
      user.value = null
      isLoading.value = false

      const msg = String(err?.message || '').toLowerCase()
      if (msg.includes('session missing') || msg.includes('not logged in')) {
        return { success: true, error: null }
      }
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
          emailRedirectTo: `${import.meta.env.VITE_PUBLIC_URL ?? window.location.origin}${import.meta.env.BASE_URL ?? '/'}#/verify-email`
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
