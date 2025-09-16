<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle>Sign In</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-4">
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
            v-model="email"
            type="email"
            placeholder="Enter your email"
            autocomplete="email"
            required
          />
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
            v-model="password"
            type="password"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
          />
        </div>

        <!-- Auth Messages -->
        <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-md">
          <div class="text-sm text-green-800">
            {{ successMessage }}
          </div>
        </div>

        <!-- Auth error display -->
        <div v-if="authError" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="text-sm text-red-800">
            {{ authError }}
          </div>
        </div>

        <!-- Submit Button - EXACT SAME PATTERN AS TEST AUTH -->
        <Button
          type="submit"
          class="w-full"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign In</span>
        </Button>

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
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

// Define emits
defineEmits<{
  'switch-to-signup': []
}>()

// EXACT SAME PATTERN AS WORKING TEST AUTHENTICATION
const email = ref('')
const password = ref('')
const isLoading = ref(false)

// Direct useAuth import like test authentication
const { signIn } = useAuth()

// Local state for form messages
const authError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// EXACT SAME FUNCTION PATTERN AS TEST AUTH
const handleSubmit = async () => {
  console.log('Sign in form submitted - EXACT COPY of working test pattern')
  console.log('Form data:', { email: email.value, password: password.value ? '[HIDDEN]' : 'empty' })
  
  isLoading.value = true
  authError.value = null
  successMessage.value = null
  
  try {
    console.log('Attempting sign in with useAuth directly (same as working test)...')
    const result = await signIn({
      email: email.value,
      password: password.value
    })

    console.log('Sign in result:', { success: result.success, error: result.error })

    if (result.success) {
      successMessage.value = 'Successfully signed in! Welcome back.'
      console.log('Sign in successful')
      // Clear form data on success
      email.value = ''
      password.value = ''
    } else {
      authError.value = result.error || 'Sign in failed. Please try again.'
      console.log('Sign in failed:', result.error)
    }
  } catch (error) {
    authError.value = 'An unexpected error occurred. Please try again.'
    console.error('Sign in error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
