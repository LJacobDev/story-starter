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
            :class="errors.email && hasBeenSubmitted ? 'border-destructive' : ''"
            @blur="() => validateField('email')"
            :aria-invalid="errors.email ? 'true' : 'false'"
            :aria-describedby="errors.email ? 'signin-email-error' : undefined"
            autocomplete="email"
            required
          />
          <div 
            v-if="errors.email && hasBeenSubmitted"
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
            :class="errors.password && hasBeenSubmitted ? 'border-destructive' : ''"
            @blur="() => validateField('password')"
            :aria-invalid="errors.password ? 'true' : 'false'"
            :aria-describedby="errors.password ? 'signin-password-error' : undefined"
            autocomplete="current-password"
            required
          />
          <div 
            v-if="errors.password && hasBeenSubmitted"
            id="signin-password-error"
            class="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {{ errors.password }}
          </div>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          class="w-full"
          :disabled="!canSubmit"
          :aria-describedby="!isValid ? 'signin-form-errors' : undefined"
        >
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign In</span>
        </Button>

        <!-- Form-level errors -->
        <div 
          v-if="!isValid && hasBeenSubmitted"
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
  'switch-to-signup': []
  'submit': [data: AuthFormData]
}>()

// Use the auth form composable
const {
  formData,
  errors,
  isLoading,
  hasBeenSubmitted,
  isValid,
  canSubmit,
  validateField,
  handleSubmit
} = useAuthForm(false) // false = sign in form

// Handle form submission
const handleFormSubmit = () => {
  handleSubmit(async (data: AuthFormData) => {
    // For now, just emit the data - actual auth will be implemented in next prompt
    console.log('Sign in form submitted:', data)
    // emit('submit', data)
  })
}
</script>
