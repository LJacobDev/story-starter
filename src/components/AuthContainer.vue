<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-md">
      <Transition 
        name="auth-form" 
        mode="out-in"
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-300 ease-in"
        enter-from-class="opacity-0 transform translate-y-4"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform translate-y-4"
      >
        <SignInForm
          v-if="currentForm === 'signin'"
          @switch-to-signup="switchToSignUp"
          @submit="handleSignIn"
        />
        <SignUpForm
          v-else
          @switch-to-signin="switchToSignIn"
          @submit="handleSignUp"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SignInForm from '@/components/SignInForm.vue'
import SignUpForm from '@/components/SignUpForm.vue'
import type { AuthFormData } from '@/utils/validation'

// Form state
const currentForm = ref<'signin' | 'signup'>('signin')

// Form switching methods
const switchToSignUp = () => {
  currentForm.value = 'signup'
}

const switchToSignIn = () => {
  currentForm.value = 'signin'
}

// Handle form submissions (will be enhanced with actual auth in next prompt)
const handleSignIn = (data: AuthFormData) => {
  console.log('Sign in submitted:', data)
}

const handleSignUp = (data: AuthFormData) => {
  console.log('Sign up submitted:', data)
}
</script>

<style scoped>
.auth-form-enter-active,
.auth-form-leave-active {
  transition: all 0.3s ease;
}

.auth-form-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.auth-form-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
