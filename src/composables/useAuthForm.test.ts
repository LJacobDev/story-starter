import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthForm } from '@/composables/useAuthForm'

describe('useAuthForm', () => {
  describe('Sign In Form', () => {
    let authForm: ReturnType<typeof useAuthForm>

    beforeEach(() => {
      authForm = useAuthForm(false) // sign in form
    })

    it('should initialize with empty form data', () => {
      expect(authForm.formData.email).toBe('')
      expect(authForm.formData.password).toBe('')
      expect(authForm.formData.confirmPassword).toBeUndefined()
    })

    it('should initialize with no errors', () => {
      expect(Object.keys(authForm.errors.value)).toHaveLength(0)
    })

    it('should not be valid initially', () => {
      expect(authForm.isValid.value).toBe(false)
    })

    it('should not be submittable initially', () => {
      expect(authForm.canSubmit.value).toBe(false)
    })

    it('should validate individual fields', () => {
      authForm.formData.email = 'invalid-email'
      authForm.validateField('email')
      
      expect(authForm.errors.value.email).toBe('Please enter a valid email address')
    })

    it('should be valid with correct data', () => {
      authForm.formData.email = 'user@example.com'
      authForm.formData.password = 'Password123'
      
      expect(authForm.isValid.value).toBe(true)
      expect(authForm.canSubmit.value).toBe(true)
    })

    it('should reset form correctly', () => {
      authForm.formData.email = 'test@example.com'
      authForm.formData.password = 'Password123'
      authForm.errors.value = { email: 'Some error' }
      authForm.hasBeenSubmitted.value = true
      
      authForm.resetForm()
      
      expect(authForm.formData.email).toBe('')
      expect(authForm.formData.password).toBe('')
      expect(authForm.errors.value).toEqual({})
      expect(authForm.hasBeenSubmitted.value).toBe(false)
      expect(authForm.isLoading.value).toBe(false)
    })
  })

  describe('Sign Up Form', () => {
    let authForm: ReturnType<typeof useAuthForm>

    beforeEach(() => {
      authForm = useAuthForm(true) // sign up form
    })

    it('should initialize with confirmPassword field', () => {
      expect(authForm.formData.confirmPassword).toBe('')
    })

    it('should validate confirm password field', () => {
      authForm.formData.password = 'Password123'
      authForm.formData.confirmPassword = 'DifferentPassword'
      authForm.validateField('confirmPassword')
      
      expect(authForm.errors.value.confirmPassword).toBe('Passwords do not match')
    })

    it('should be valid with all correct data', () => {
      authForm.formData.email = 'user@example.com'
      authForm.formData.password = 'Password123'
      authForm.formData.confirmPassword = 'Password123'
      
      expect(authForm.isValid.value).toBe(true)
      expect(authForm.canSubmit.value).toBe(true)
    })

    it('should validate complete form', () => {
      authForm.formData.email = 'invalid'
      authForm.formData.password = 'weak'
      authForm.formData.confirmPassword = 'different'
      
      const isValid = authForm.validateForm()
      
      expect(isValid).toBe(false)
      expect(authForm.errors.value.email).toBe('Please enter a valid email address')
      expect(authForm.errors.value.password).toBe('Password must be at least 8 characters with uppercase, lowercase, and number')
      expect(authForm.errors.value.confirmPassword).toBe('Passwords do not match')
    })

    it('should reset confirm password in reset', () => {
      authForm.formData.confirmPassword = 'test'
      authForm.resetForm()
      expect(authForm.formData.confirmPassword).toBe('')
    })
  })

  describe('Form Submission', () => {
    let authForm: ReturnType<typeof useAuthForm>

    beforeEach(() => {
      authForm = useAuthForm(false)
    })

    it('should not submit invalid form', async () => {
      let submitted = false
      const mockSubmit = async () => {
        submitted = true
      }

      authForm.formData.email = 'invalid'
      await authForm.handleSubmit(mockSubmit)
      
      expect(submitted).toBe(false)
      expect(authForm.hasBeenSubmitted.value).toBe(true)
    })

    it('should submit valid form', async () => {
      let submittedData: any = null
      const mockSubmit = async (data: any) => {
        submittedData = data
      }

      authForm.formData.email = 'user@example.com'
      authForm.formData.password = 'Password123'
      
      await authForm.handleSubmit(mockSubmit)
      
      expect(submittedData).toEqual({
        email: 'user@example.com',
        password: 'Password123'
      })
      expect(authForm.hasBeenSubmitted.value).toBe(true)
    })

    it('should handle loading states during submission', async () => {
      const mockSubmit = async () => {
        expect(authForm.isLoading.value).toBe(true)
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      authForm.formData.email = 'user@example.com'
      authForm.formData.password = 'Password123'
      
      expect(authForm.isLoading.value).toBe(false)
      
      const promise = authForm.handleSubmit(mockSubmit)
      expect(authForm.isLoading.value).toBe(true)
      
      await promise
      expect(authForm.isLoading.value).toBe(false)
    })
  })
})
