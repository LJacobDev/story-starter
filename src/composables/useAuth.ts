import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { 
  AuthState, 
  AuthCredentials, 
  SignUpCredentials, 
  AuthResponse,
  AuthComposable 
} from '@/types/auth'

// Global auth state
const authState = ref<AuthState>({
  user: null,
  session: null,
  loading: true,
  initialized: false
})

// Initialize auth state and set up listener
let authListenerSetup = false

const setupAuthListener = () => {
  if (authListenerSetup) return
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state change:', event, session?.user?.email)
    
    authState.value.session = session
    authState.value.user = session?.user ?? null
    authState.value.loading = false
    
    if (!authState.value.initialized) {
      authState.value.initialized = true
    }
  })
  
  authListenerSetup = true
}

export function useAuth(): AuthComposable {
  // Set up auth listener on first use
  if (!authListenerSetup) {
    setupAuthListener()
  }

  // Initialize auth state if not already done
  onMounted(async () => {
    if (!authState.value.initialized) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error.message)
        }
        
        authState.value.session = session
        authState.value.user = session?.user ?? null
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        authState.value.loading = false
        authState.value.initialized = true
      }
    }
  })

  // Computed properties
  const isAuthenticated = computed(() => {
    return !!authState.value.user && !!authState.value.session
  })

  // Auth methods
  const signUp = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
    try {
      authState.value.loading = true
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return {
          success: false,
          error: error.message,
          user: null
        }
      }

      // Check if user needs email verification
      const needsVerification = !data.user?.email_confirmed_at

      return {
        success: true,
        error: null,
        user: data.user,
        needsVerification
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        user: null
      }
    } finally {
      authState.value.loading = false
    }
  }

  const signIn = async (credentials: AuthCredentials): Promise<AuthResponse> => {
    try {
      authState.value.loading = true
      
      console.log('Attempting sign in with:', { 
        email: credentials.email, 
        hasPassword: !!credentials.password,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase auth error:', error)
        return {
          success: false,
          error: error.message,
          user: null
        }
      }

      return {
        success: true,
        error: null,
        user: data.user
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        user: null
      }
    } finally {
      authState.value.loading = false
    }
  }

  const signOut = async (): Promise<AuthResponse> => {
    try {
      authState.value.loading = true
      
      const { error } = await supabase.auth.signOut()

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        error: null
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    } finally {
      authState.value.loading = false
    }
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error.message)
        return
      }
      
      authState.value.session = session
      authState.value.user = session?.user ?? null
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const resendEmailVerification = async (email: string): Promise<AuthResponse> => {
    try {
      authState.value.loading = true
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        error: null
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    } finally {
      authState.value.loading = false
    }
  }

  return {
    // State (computed refs for reactivity)
    user: computed(() => authState.value.user),
    session: computed(() => authState.value.session),
    loading: computed(() => authState.value.loading),
    initialized: computed(() => authState.value.initialized),
    isAuthenticated,
    
    // Methods
    signUp,
    signIn,
    signOut,
    refreshSession,
    resendEmailVerification
  }
}
