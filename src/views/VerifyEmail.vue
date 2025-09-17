<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="text-center">
          <div v-if="loading" class="space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Verifying your email...</h2>
            <p class="text-gray-600 dark:text-gray-300">Please wait while we confirm your email address.</p>
          </div>

          <div v-else-if="error" class="space-y-4">
            <div class="rounded-full h-12 w-12 bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto">
              <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Verification Failed</h2>
            <p class="text-gray-600 dark:text-gray-300">{{ error }}</p>
            <button @click="goHome" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Return to Home</button>
          </div>

          <div v-else class="space-y-4">
            <div class="rounded-full h-12 w-12 bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
              <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Email Verified!</h2>
            <p class="text-gray-600 dark:text-gray-300">Your email has been successfully verified. You can now access all features.</p>
            <button @click="goHome" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Continue to App</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { confirmEmail } = useAuth()

const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const rawToken = route.query.token
    const token = Array.isArray(rawToken) ? rawToken[0] : (rawToken as string | undefined)

    if (!token) {
      error.value = 'No verification token was provided.'
      loading.value = false
      return
    }

    const result = await (confirmEmail as any)(token)

    if (!result || !result.success) {
      error.value = result?.error || 'Verification failed. Please try again.'
      loading.value = false
      return
    }

    // success
    loading.value = false
    error.value = null
  } catch (err: any) {
    error.value = err?.message || 'An unexpected error occurred during verification.'
    loading.value = false
  }
})

const goHome = () => {
  window.location.href = '/'
}
</script>
