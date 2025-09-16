import { ref, computed, getCurrentInstance, onMounted } from 'vue'
import { getSupabaseClient } from '@/utils/supabase'

const _client = getSupabaseClient()

const user = ref<any>(null)
const session = ref<any>(null)
const isLoading = ref(false)

function initAuthListener() {
  try {
    // Only call onMounted if we are in a component context
    if (getCurrentInstance()) {
      onMounted(() => {
        _client.auth.onAuthStateChange((_event: any, newSession: any) => {
          session.value = newSession ?? null
          user.value = (newSession as any)?.user ?? null
        })
      })
    } else {
      // Not in component setup; attempt to initialize listener directly if available
      // Some test stubs may provide a no-op onAuthStateChange implementation
      if (typeof _client.auth.onAuthStateChange === 'function') {
        _client.auth.onAuthStateChange((_event: any, newSession: any) => {
          session.value = newSession ?? null
          user.value = (newSession as any)?.user ?? null
        })
      }
    }
  } catch (e) {
    // Swallow errors in non-runtime contexts (tests) to avoid noisy warnings
    // Developers should mock auth functions in unit tests where needed
    // eslint-disable-next-line no-console
    console.debug('initAuthListener: skipped in this environment')
  }
}

initAuthListener()

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)

  async function signIn({ email, password }: { email: string; password: string }) {
    isLoading.value = true
    try {
      const { data, error } = await _client.auth.signInWithPassword({ email, password })
      isLoading.value = false
      if (error) throw error
      session.value = (data as any)?.session ?? null
      user.value = (data as any)?.user ?? null
      return { user: user.value, session: session.value }
    } catch (err: any) {
      isLoading.value = false
      return { error: err?.message || 'Sign in failed' }
    }
  }

  async function signUp({ email, password }: { email: string; password: string }) {
    isLoading.value = true
    try {
      const { data, error } = await _client.auth.signUp({ email, password })
      isLoading.value = false
      if (error) throw error
      session.value = (data as any)?.session ?? null
      user.value = (data as any)?.user ?? null
      return { user: user.value, session: session.value }
    } catch (err: any) {
      isLoading.value = false
      return { error: err?.message || 'Sign up failed' }
    }
  }

  async function signOut() {
    isLoading.value = true
    try {
      const { error } = await _client.auth.signOut()
      isLoading.value = false
      if (error) throw error
      session.value = null
      user.value = null
      return { success: true }
    } catch (err: any) {
      isLoading.value = false
      return { error: err?.message || 'Sign out failed' }
    }
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut
  }
}
