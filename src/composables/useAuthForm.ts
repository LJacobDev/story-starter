import { ref, computed } from 'vue'

interface AuthFormData {
  email: string
  password: string
  confirmPassword?: string
}

// Minimal lightweight form helper for backward compatibility.
// Prefer using direct refs in the components; this stub provides a tiny
// API similar to the previous composable but with no validation logic.
export function useAuthForm(isSignUp: boolean = false) {
  // form data object (mutable to match test expectations)
  const formData = ref<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: isSignUp ? '' : undefined
  } as AuthFormData)

  // validation error messages
  const errors = ref<Record<string, string | undefined>>({})

  // loading and submission state
  const isLoading = ref(false)
  const hasBeenSubmitted = ref(false)

  // computed validations
  const emailRegex = /^\S+@\S+\.\S+$/
  const passwordStrengthRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/

  const isValid = computed(() => {
    // basic validity: email and password present and valid; confirmPassword if sign up
    if (!formData.value) return false
    if (!formData.value.email || !emailRegex.test(formData.value.email)) return false
    if (!formData.value.password || !passwordStrengthRegex.test(formData.value.password)) return false
    if (isSignUp) {
      if (!formData.value.confirmPassword || formData.value.confirmPassword !== formData.value.password) return false
    }
    return true
  })

  const canSubmit = computed(() => {
    return isValid.value && !isLoading.value
  })

  function setError(field: string, message?: string) {
    if (message) {
      errors.value[field] = message
    } else {
      delete errors.value[field]
    }
  }

  function validateField(fieldName: string, _showError = false) {
    const value = (formData.value as any)[fieldName]
    switch (fieldName) {
      case 'email':
        if (!value) {
          setError('email', 'This field is required')
        } else if (!emailRegex.test(value)) {
          setError('email', 'Please enter a valid email address')
        } else {
          setError('email', undefined)
        }
        break
      case 'password':
        if (!value) {
          setError('password', 'This field is required')
        } else if (!passwordStrengthRegex.test(value)) {
          setError('password', 'Password must be at least 8 characters with uppercase, lowercase, and number')
        } else {
          setError('password', undefined)
        }
        break
      case 'confirmPassword':
        if (isSignUp) {
          if (!value) {
            setError('confirmPassword', 'This field is required')
          } else if (value !== formData.value.password) {
            setError('confirmPassword', 'Passwords do not match')
          } else {
            setError('confirmPassword', undefined)
          }
        }
        break
      default:
        break
    }
  }

  function validateForm() {
    // validate all fields
    validateField('email', true)
    validateField('password', true)
    if (isSignUp) validateField('confirmPassword', true)

    // return overall validity
    return isValid.value
  }

  function resetForm() {
    formData.value.email = ''
    formData.value.password = ''
    if (isSignUp) formData.value.confirmPassword = ''
    errors.value = {}
    hasBeenSubmitted.value = false
    isLoading.value = false
  }

  async function handleSubmit(submitFn: (data: { email: string; password: string; confirmPassword?: string }) => Promise<void>) {
    hasBeenSubmitted.value = true

    // validate before submit
    if (!validateForm()) {
      return
    }

    isLoading.value = true
    try {
      await submitFn({
        email: formData.value.email,
        password: formData.value.password,
        confirmPassword: formData.value.confirmPassword
      })
    } finally {
      isLoading.value = false
    }
  }

  return {
    formData: formData.value as unknown as AuthFormData, // tests expect direct object access
    errors,
    isLoading,
    hasBeenSubmitted,
    isValid,
    canSubmit,
    validateField,
    validateForm,
    resetForm,
    handleSubmit
  }
}
