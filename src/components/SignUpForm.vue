<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle>Sign Up</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleFormSubmit" class="space-y-4">
        <!-- Email Field -->
        <div class="space-y-2">
          <Label 
            for="signup-email" 
            class="text-sm font-medium"
          >
            Email
          </Label>
          <Input
            id="signup-email"
            v-model="formData.email"
            type="email"
            placeholder="Enter your email"
            :class="errors.email ? 'border-destructive' : ''"
            @blur="() => validateField('email', true)"
            @input="() => validateField('email')"
            :aria-invalid="errors.email ? 'true' : 'false'"
            :aria-describedby="errors.email ? 'signup-email-error' : undefined"
            autocomplete="email"
            required
          />
          <div 
            v-if="errors.email"
            id="signup-email-error"
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
            for="signup-password" 
            class="text-sm font-medium"
          >
            Password
          </Label>
          <Input
            id="signup-password"
            v-model="formData.password"
            type="password"
            placeholder="Enter your password"
            :class="errors.password ? 'border-destructive' : ''"
            @blur="() => validateField('password', true)"
            @input="() => validateField('password')"
            :aria-invalid="errors.password ? 'true' : 'false'"
            :aria-describedby="errors.password ? 'signup-password-error' : 'signup-password-help'"
            autocomplete="new-password"
            required
          />
          <div 
            id="signup-password-help"
            class="text-xs text-muted-foreground"
          >
            Must be at least 8 characters with uppercase, lowercase, and number
          </div>
          <div 
            v-if="errors.password"
            id="signup-password-error"
            class="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {{ errors.password }}
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="space-y-2">
          <Label 
            for="signup-confirm-password" 
            class="text-sm font-medium"
          >
            Confirm Password
          </Label>
          <Input
            id="signup-confirm-password"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            :class="errors.confirmPassword ? 'border-destructive' : ''"
            @blur="() => validateField('confirmPassword', true)"
            @input="() => validateField('confirmPassword')"
            :aria-invalid="errors.confirmPassword ? 'true' : 'false'"
            :aria-describedby="errors.confirmPassword ? 'signup-confirm-password-error' : undefined"
            autocomplete="new-password"
            required
          />
          <div 
            v-if="errors.confirmPassword"
            id="signup-confirm-password-error"
            class="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {{ errors.confirmPassword }}
          </div>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          class="w-full"
          :disabled="!canSubmit"
          :aria-describedby="!isValid ? 'signup-form-errors' : undefined"
        >
          <span v-if="isLoading">Creating account...</span>
          <span v-else>Sign Up</span>
        </Button>

        <!-- Form-level errors -->
        <div 
          v-if="!isValid && hasBeenSubmitted"
          id="signup-form-errors"
          class="text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          Please correct the errors above
        </div>
      </form>

      <!-- Link to Sign In -->
      <div class="mt-4 text-center text-sm">
        Already have an account? 
        <button 
          @click="$emit('switch-to-signin')"
          class="text-primary hover:underline focus:outline-none focus:underline"
          type="button"
        >
          Sign in
        </button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useAuthForm } from '@/composables/useAuthForm'
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
  'switch-to-signin': []
  'submit': [data: AuthFormData]
}>()

// Use the auth form composable for sign up
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
} = useAuthForm(true) // true = sign up form

// Handle form submission
const handleFormSubmit = () => {
  handleSubmit(async (data: AuthFormData) => {
    // For now, just emit the data - actual auth will be implemented in next prompt
    console.log('Sign up form submitted:', data)
    // emit('submit', data)
  })
}

// Cleanup on unmount
onBeforeUnmount(() => {
  cleanup()
})
</script>
