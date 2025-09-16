<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle>Sign In</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleFormSubmit" class="space-y-4">
        <!-- Email Field -->
        <div class="space-y-2">
          <Label 
            for="signin-email" 
            class="text-sm font-medium"
          >
            Email
          </Label>
          <Input
            id="signin-email"
            v-model="formData.email"
            type="email"
            placeholder="Enter your email"
            :class="errors.email ? 'border-destructive' : ''"
            @blur="() => validateField('email')"
            @input="() => validateField('email')"
            :aria-invalid="errors.email ? 'true' : 'false'"
            :aria-describedby="errors.email ? 'signin-email-error' : undefined"
            autocomplete="email"
            required
          />
          <!-- Email error - temporarily disabled for testing -->
          <div 
            v-if="false"
            id="signin-email-error"
            class="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {{ errors.email }}
          </div>
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <Label 
            for="signin-password" 
            class="text-sm font-medium"
          >
            Password
          </Label>
          <Input
            id="signin-password"
            v-model="formData.password"
            type="password"
            placeholder="Enter your password"
            :class="errors.password ? 'border-destructive' : ''"
            @blur="() => validateField('password')"
            @input="() => validateField('password')"
            :aria-invalid="errors.password ? 'true' : 'false'"
            :aria-describedby="errors.password ? 'signin-password-error' : undefined"
            autocomplete="current-password"
            required
          />
          <!-- Password error - temporarily disabled for testing -->
          <div 
            v-if="false"
            id="signin-password-error"
            class="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {{ errors.password }}
          </div>
        </div>

        <!-- Auth Messages -->
        <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-md">
          <div class="text-sm text-green-800">
            {{ successMessage }}
          </div>
        </div>

        <!-- Auth error display - temporarily disabled for testing -->
        <div v-if="false" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="text-sm text-red-800">
            {{ authError }}
          </div>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          class="w-full"
          :disabled="!canSubmit"
        >
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign In</span>
        </Button>

        <!-- Form-level errors - temporarily disabled for testing -->
        <div 
          v-if="false"
          id="signin-form-errors"
          class="text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          Please correct the errors above
        </div>
      </form>

      <!-- Link to Sign Up -->
      <div class="mt-4 text-center text-sm">
        Don't have an account? 
        <button 
          @click="$emit('switch-to-signup')"
          class="text-primary hover:underline focus:outline-none focus:underline"
          type="button"
        >
          Sign up
        </button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useAuthForm } from '@/composables/useAuthForm'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import type { AuthFormData } from '@/utils/validation'

// Define emits
defineEmits<{
  'switch-to-signup': []
}>()

// Auth state and actions
const { signIn } = useAuth()

// Local state for form messages
const authError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Use the auth form composable
const {
  formData,
  errors,
  isLoading,
  hasBeenSubmitted,
  isValid,
  canSubmit,
  validateField,
  handleSubmit,
  cleanup
} = useAuthForm(false) // false = sign in form

// Handle form submission
const handleFormSubmit = () => {
  console.log('Sign in form submitted - starting validation')
  console.log('Form data:', { email: formData.email, password: formData.password ? '[HIDDEN]' : 'empty' })
  console.log('Form valid:', isValid.value)
  console.log('Can submit:', canSubmit.value)
  
  handleSubmit(async (data: AuthFormData) => {
    console.log('Form validation passed, attempting sign in')
    authError.value = null
    successMessage.value = null
    
    try {
      const result = await signIn({
        email: data.email,
        password: data.password
      })

      console.log('Sign in result:', { success: result.success, error: result.error })

      if (result.success) {
        successMessage.value = 'Successfully signed in! Welcome back.'
        console.log('Sign in successful')
        // Clear form data on success
        formData.email = ''
        formData.password = ''
      } else {
        authError.value = result.error || 'Sign in failed. Please try again.'
        console.log('Sign in failed:', result.error)
      }
    } catch (error) {
      authError.value = 'An unexpected error occurred. Please try again.'
      console.error('Sign in error:', error)
    }
  })
}

// Cleanup on unmount
onBeforeUnmount(() => {
  cleanup()
})
</script>
