import { ref, reactive, computed } from 'vue'
import type { AuthFormData, FormValidationErrors } from '@/utils/validation'
import { validateAuthForm, hasFormErrors } from '@/utils/validation'

export function useAuthForm(isSignUp: boolean = false) {
  // Form data
  const formData = reactive<AuthFormData>({
    email: '',
    password: '',
    ...(isSignUp && { confirmPassword: '' })
  })

  // Form state
  const isLoading = ref(false)
  const errors = ref<FormValidationErrors>({})
  const hasBeenSubmitted = ref(false)
  const touchedFields = ref<Set<keyof AuthFormData>>(new Set())

  // Debounce timer for real-time validation
  let validationTimeout: NodeJS.Timeout | null = null

  // Computed properties
  const isValid = computed(() => {
    const currentErrors = validateAuthForm(formData, isSignUp)
    return !hasFormErrors(currentErrors)
  })

  const canSubmit = computed(() => {
    return isValid.value && !isLoading.value
  })

  // Methods
  const validateForm = () => {
    errors.value = validateAuthForm(formData, isSignUp)
    return isValid.value
  }

  const validateField = (fieldName: keyof AuthFormData, immediate: boolean = false) => {
    touchedFields.value.add(fieldName)
    
    const doValidation = () => {
      const fieldErrors = validateAuthForm(formData, isSignUp)
      // Always update the field error, whether it's an error or undefined (cleared)
      errors.value[fieldName] = fieldErrors[fieldName]
    }
    
    if (immediate) {
      // Immediate validation (for blur events)
      doValidation()
    } else {
      // Debounced validation (for input events)
      if (validationTimeout) {
        clearTimeout(validationTimeout)
      }
      
      validationTimeout = setTimeout(() => {
        doValidation()
      }, 150) // 150ms debounce for better responsiveness
    }
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
    
    if (!validateForm()) {
      return
    }

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
