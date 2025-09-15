import { describe, it, expect } from 'vitest'
import {
  emailValidation,
  passwordValidation,
  confirmPasswordValidation,
  requiredValidation,
  validateField,
  validateAuthForm,
  hasFormErrors
} from '@/utils/validation'
import type { AuthFormData } from '@/utils/validation'

describe('Form Validation', () => {
  describe('emailValidation', () => {
    it('should validate correct email addresses', () => {
      expect(emailValidation.test('user@example.com')).toBe(true)
      expect(emailValidation.test('test.email+tag@domain.co.uk')).toBe(true)
      expect(emailValidation.test('valid@email.com')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(emailValidation.test('')).toBe(false)
      expect(emailValidation.test('invalid')).toBe(false)
      expect(emailValidation.test('@domain.com')).toBe(false)
      expect(emailValidation.test('user@')).toBe(false)
      expect(emailValidation.test('user.domain.com')).toBe(false)
      expect(emailValidation.test('user @domain.com')).toBe(false)
    })

    it('should have correct error message', () => {
      expect(emailValidation.message).toBe('Please enter a valid email address')
    })
  })

  describe('passwordValidation', () => {
    it('should validate strong passwords', () => {
      expect(passwordValidation.test('Password123')).toBe(true)
      expect(passwordValidation.test('MyStr0ngP@ss')).toBe(true)
      expect(passwordValidation.test('Test1234')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(passwordValidation.test('')).toBe(false)
      expect(passwordValidation.test('weak')).toBe(false)
      expect(passwordValidation.test('password')).toBe(false) // no uppercase/number
      expect(passwordValidation.test('PASSWORD')).toBe(false) // no lowercase/number
      expect(passwordValidation.test('Password')).toBe(false) // no number
      expect(passwordValidation.test('password123')).toBe(false) // no uppercase
      expect(passwordValidation.test('Passwor')).toBe(false) // too short
    })

    it('should have correct error message', () => {
      expect(passwordValidation.message).toBe(
        'Password must be at least 8 characters with uppercase, lowercase, and number'
      )
    })
  })

  describe('confirmPasswordValidation', () => {
    it('should validate matching passwords', () => {
      const validator = confirmPasswordValidation('Password123')
      expect(validator.test('Password123')).toBe(true)
    })

    it('should reject non-matching passwords', () => {
      const validator = confirmPasswordValidation('Password123')
      expect(validator.test('DifferentPass456')).toBe(false)
      expect(validator.test('')).toBe(false)
    })

    it('should have correct error message', () => {
      const validator = confirmPasswordValidation('test')
      expect(validator.message).toBe('Passwords do not match')
    })
  })

  describe('requiredValidation', () => {
    it('should validate non-empty strings', () => {
      expect(requiredValidation.test('test')).toBe(true)
      expect(requiredValidation.test('  value  ')).toBe(true) // trimmed
    })

    it('should reject empty or whitespace-only strings', () => {
      expect(requiredValidation.test('')).toBe(false)
      expect(requiredValidation.test('   ')).toBe(false)
      expect(requiredValidation.test('\t\n')).toBe(false)
    })

    it('should have correct error message', () => {
      expect(requiredValidation.message).toBe('This field is required')
    })
  })

  describe('validateField', () => {
    it('should return null for valid input', () => {
      const result = validateField('test@example.com', [requiredValidation, emailValidation])
      expect(result).toBeNull()
    })

    it('should return first failing rule message', () => {
      const result = validateField('', [requiredValidation, emailValidation])
      expect(result).toBe('This field is required')
    })

    it('should return email error for invalid email', () => {
      const result = validateField('invalid-email', [requiredValidation, emailValidation])
      expect(result).toBe('Please enter a valid email address')
    })
  })

  describe('validateAuthForm', () => {
    it('should validate correct sign-in form', () => {
      const formData: AuthFormData = {
        email: 'user@example.com',
        password: 'Password123'
      }
      
      const errors = validateAuthForm(formData, false)
      expect(errors.email).toBeNull()
      expect(errors.password).toBeNull()
      expect(errors.confirmPassword).toBeUndefined()
    })

    it('should validate correct sign-up form', () => {
      const formData: AuthFormData = {
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      }
      
      const errors = validateAuthForm(formData, true)
      expect(errors.email).toBeNull()
      expect(errors.password).toBeNull()
      expect(errors.confirmPassword).toBeNull()
    })

    it('should return errors for invalid sign-in form', () => {
      const formData: AuthFormData = {
        email: 'invalid-email',
        password: 'weak'
      }
      
      const errors = validateAuthForm(formData, false)
      expect(errors.email).toBe('Please enter a valid email address')
      expect(errors.password).toBe('Password must be at least 8 characters with uppercase, lowercase, and number')
    })

    it('should return errors for invalid sign-up form', () => {
      const formData: AuthFormData = {
        email: '',
        password: 'Password123',
        confirmPassword: 'DifferentPassword'
      }
      
      const errors = validateAuthForm(formData, true)
      expect(errors.email).toBe('This field is required')
      expect(errors.password).toBeNull()
      expect(errors.confirmPassword).toBe('Passwords do not match')
    })
  })

  describe('hasFormErrors', () => {
    it('should return false when no errors', () => {
      const errors = { email: null, password: null }
      expect(hasFormErrors(errors)).toBe(false)
    })

    it('should return true when errors exist', () => {
      const errors = { email: 'Invalid email', password: null }
      expect(hasFormErrors(errors)).toBe(true)
    })

    it('should return false for empty errors object', () => {
      expect(hasFormErrors({})).toBe(false)
    })
  })
})
