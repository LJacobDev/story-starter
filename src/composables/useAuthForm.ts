import { ref } from 'vue'

// Minimal lightweight form helper for backward compatibility.
// Prefer using direct refs in the components; this stub provides a tiny
// API similar to the previous composable but with no validation logic.
export function useAuthForm(isSignUp: boolean = false) {
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref(isSignUp ? '' : undefined)
  const isLoading = ref(false)

  const handleSubmit = async (submitFn: (data: { email: string; password: string; confirmPassword?: string }) => Promise<void>) => {
    isLoading.value = true
    try {
      await submitFn({ email: email.value, password: password.value, confirmPassword: confirmPassword?.value })
    } finally {
      isLoading.value = false
    }
  }

  const validateField = (_fieldName: string) => {
    // no-op
  }

  return {
    email,
    password,
    confirmPassword,
    isLoading,
    handleSubmit,
    validateField
  }
}
