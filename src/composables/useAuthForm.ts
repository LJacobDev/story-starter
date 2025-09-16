import { ref, reactive, computed } from 'vue'

// Simplified form types without validation
interface AuthFormData {
  email: string
  password: string
  confirmPassword?: string
}

interface FormErrors {
  [field: string]: string | null
}

export function useAuthForm(isSignUp: boolean = false) {
  // Form data
  const formData = reactive<AuthFormData>({
    email: '',
    password: '',
    ...(isSignUp && { confirmPassword: '' })
  })

  // Form state - no validation for testing
  const isLoading = ref(false)
  const errors = ref<FormErrors>({}) // Always empty for testing
  const hasBeenSubmitted = ref(false)
  const touchedFields = ref<Set<keyof AuthFormData>>(new Set())

  // Clear errors immediately - no validation during testing
  setInterval(() => {
    errors.value = {}
  }, 100)

  // Debounce timer for real-time validation
  let validationTimeout: NodeJS.Timeout | null = null

  // Computed properties - no validation for testing
  const isValid = computed(() => {
    // Always return true - no validation
    return true
  })

  const canSubmit = computed(() => {
    // For testing: allow submission unless currently loading
    return !isLoading.value
  })

  // Methods - validation disabled for testing
  const validateForm = () => {
    // No validation - always return true
    return true
  }

  const validateField = (fieldName: keyof AuthFormData) => {
    // No validation - just mark field as touched
    touchedFields.value.add(fieldName)
  }

  const resetForm = () => {
    formData.email = ''
    formData.password = ''
    if (isSignUp && 'confirmPassword' in formData) {
      formData.confirmPassword = ''
    }
    errors.value = {}
    hasBeenSubmitted.value = false
    touchedFields.value.clear()
    isLoading.value = false
    
    // Clear any pending validation
    if (validationTimeout) {
      clearTimeout(validationTimeout)
      validationTimeout = null
    }
  }

  const handleSubmit = async (submitFn: (data: AuthFormData) => Promise<void>) => {
    hasBeenSubmitted.value = true
    
    console.log('Form submitted - skipping validation for testing')
    console.log('Form data:', { email: formData.email, password: formData.password ? '[HIDDEN]' : 'empty' })
    
    isLoading.value = true
    
    try {
      await submitFn(formData)
    } catch (error) {
      console.error('Form submission error:', error)
      // Handle submission errors (will be enhanced in next prompt with actual auth)
    } finally {
      isLoading.value = false
    }
  }

  // Cleanup function for pending timeouts
  const cleanup = () => {
    if (validationTimeout) {
      clearTimeout(validationTimeout)
      validationTimeout = null
    }
  }

  return {
    formData,
    errors,
    isLoading,
    hasBeenSubmitted,
    touchedFields,
    isValid,
    canSubmit,
    validateForm,
    validateField,
    resetForm,
    handleSubmit,
    cleanup
  }
}
