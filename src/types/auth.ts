import type { User, Session } from '@supabase/supabase-js'
import type { ComputedRef } from 'vue'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends AuthCredentials {
  confirmPassword?: string
}

export interface AuthResponse {
  success: boolean
  error: string | null
  user?: User | null
  needsVerification?: boolean
}

export interface AuthComposable {
  // State
  user: ComputedRef<User | null>
  session: ComputedRef<Session | null>
  loading: ComputedRef<boolean>
  initialized: ComputedRef<boolean>
  isAuthenticated: ComputedRef<boolean>
  
  // Methods
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse>
  signIn: (credentials: AuthCredentials) => Promise<AuthResponse>
  signOut: () => Promise<AuthResponse>
  refreshSession: () => Promise<void>
  resendEmailVerification: (email: string) => Promise<AuthResponse>
}
