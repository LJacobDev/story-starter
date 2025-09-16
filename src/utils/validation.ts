// Form validation types
export interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

export interface FormValidationErrors {
  [field: string]: string | null
}

export interface AuthFormData {
  email: string
  password: string
  confirmPassword?: string
}

// Email validation
export const emailValidation: ValidationRule = {
  test: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  },
  message: 'Please enter a valid email address'
}

// Password validation rules for sign up (strict)
export const passwordValidation: ValidationRule = {
  test: (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(password)
  },
  message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
}

// Simple password validation for sign in (just check not empty)
export const signInPasswordValidation: ValidationRule = {
  test: (password: string) => password.trim().length > 0,
  message: 'Password is required'
}

// Confirm password validation
export const confirmPasswordValidation = (password: string): ValidationRule => ({
  test: (confirmPassword: string) => confirmPassword === password,
  message: 'Passwords do not match'
})

// Required field validation
export const requiredValidation: ValidationRule = {
  test: (value: string) => value.trim().length > 0,
  message: 'This field is required'
}

// Validation utility function
export const validateField = (value: string, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message
    }
  }
  return null
}

// Validate entire form
export const validateAuthForm = (
  data: AuthFormData, 
  isSignUp: boolean = false
): FormValidationErrors => {
  const errors: FormValidationErrors = {}

  // Email validation
  errors.email = validateField(data.email, [requiredValidation, emailValidation])

  // Password validation - use strict validation for sign up, simple for sign in
  const passwordRules = isSignUp 
    ? [requiredValidation, passwordValidation]
    : [requiredValidation, signInPasswordValidation]
  
  errors.password = validateField(data.password, passwordRules)

  // Confirm password validation (only for sign up)
  if (isSignUp && data.confirmPassword !== undefined) {
    errors.confirmPassword = validateField(
      data.confirmPassword, 
      [requiredValidation, confirmPasswordValidation(data.password)]
    )
  }

  return errors
}

// Check if form has any errors
export const hasFormErrors = (errors: FormValidationErrors): boolean => {
  return Object.values(errors).some(error => error !== null)
}
