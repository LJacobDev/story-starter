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

  const validateField = (fieldName: keyof AuthFormData) => {
    const fieldErrors = validateAuthForm(formData, isSignUp)
    errors.value[fieldName] = fieldErrors[fieldName]
  }

  const resetForm = () => {
    formData.email = ''
    formData.password = ''
    if (isSignUp && 'confirmPassword' in formData) {
      formData.confirmPassword = ''
    }
    errors.value = {}
    hasBeenSubmitted.value = false
    isLoading.value = false
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

  return {
    formData,
    errors,
    isLoading,
    hasBeenSubmitted,
    isValid,
    canSubmit,
    validateForm,
    validateField,
    resetForm,
    handleSubmit
  }
}
