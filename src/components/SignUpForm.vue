<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle>Sign Up</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email Field -->
        <div class="space-y-2">
          <Label for="signup-email" class="text-sm font-medium">Email</Label>
          <Input id="signup-email" v-model="email" type="email" placeholder="Enter your email" autocomplete="email" required />
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <Label for="signup-password" class="text-sm font-medium">Password</Label>
          <Input id="signup-password" v-model="password" type="password" placeholder="Enter your password" autocomplete="new-password" required />
        </div>

        <!-- Confirm Password Field -->
        <div class="space-y-2">
          <Label for="signup-confirm-password" class="text-sm font-medium">Confirm Password</Label>
          <Input id="signup-confirm-password" v-model="confirmPassword" type="password" placeholder="Confirm your password" autocomplete="new-password" required />
        </div>

        <!-- Messages -->
        <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-md">
          <div class="text-sm text-green-800">{{ successMessage }}</div>
        </div>
        <div v-if="authError" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="text-sm text-red-800">{{ authError }}</div>
        </div>

        <Button type="submit" class="w-full" :disabled="isLoading">
          <span v-if="isLoading">Creating account...</span>
          <span v-else>Sign Up</span>
        </Button>
      </form>

      <div class="mt-4 text-center text-sm">
        Already have an account?
        <button @click="$emit('switch-to-signin')" class="text-primary hover:underline focus:outline-none focus:underline" type="button">Sign in</button>
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
  'switch-to-signin': []
}>()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const authError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const { signUp } = useAuth()

const handleSubmit = async () => {
  isLoading.value = true
  authError.value = null
  successMessage.value = null

  try {
    const result = await signUp({ email: email.value, password: password.value })

    if (result.success) {
      successMessage.value = 'Account created. Please check your email to verify your account.'
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
    } else {
      authError.value = result.error || 'Sign up failed. Please try again.'
    }
  } catch (error) {
    authError.value = 'An unexpected error occurred.'
    console.error('Sign up error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
