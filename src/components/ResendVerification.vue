<template>
  <div>
    <!-- center the button -->
    <div class="flex justify-center">
      <button
        :disabled="disabled || isLoading"
        @click="handleResend"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        type="button"
      >
        <span v-if="isLoading">Sending…</span>
        <span v-else>Resend verification email</span>
      </button>
    </div>

    <!-- Single message element: shows either error+cooldown or message (countdown/info) -->
    <p v-if="displayMessage" :class="displayClass" role="status">{{ displayMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{ email: string }>()

const { resendEmailVerification } = useAuth()

const isLoading = ref(false)
const disabled = ref(false)
const cooldown = ref(0)
const message = ref('')
const errorMsg = ref<string | null>(null)
let timer: number | null = null

// computed single message and class to avoid duplicate lines
const displayMessage = computed(() => {
  if (errorMsg.value) {
    const suffix = cooldown.value > 0 ? ` Try again in ${cooldown.value}s` : ''
    return `${errorMsg.value}${suffix}`
  }
  return message.value || ''
})

const displayClass = computed(() => {
  return errorMsg.value ? 'mt-2 text-sm text-destructive' : 'mt-2 text-sm text-gray-600'
})

function clearTimer() {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

function updateMessage() {
  if (cooldown.value > 0) {
    if (!errorMsg.value) {
      message.value = `Resend available in ${cooldown.value}s`
    } else {
      // error path: message text is derived in displayMessage via cooldown suffix
      message.value = ''
    }
  } else {
    message.value = ''
  }
}

function startCooldown(seconds: number) {
  cooldown.value = Math.max(0, Math.floor(seconds))
  disabled.value = true
  updateMessage()

  clearTimer()
  timer = window.setInterval(() => {
    if (cooldown.value > 0) {
      cooldown.value -= 1
      updateMessage()
    } else {
      clearTimer()
      disabled.value = false
      message.value = ''
      errorMsg.value = null
    }
  }, 1000)
}

async function handleResend() {
  if (!props.email) return
  isLoading.value = true
  errorMsg.value = null
  message.value = ''

  try {
    const result: any = await resendEmailVerification(props.email)

    // If API returned retryAfter, use it; otherwise fall back to a modest cooldown
    const retry = result?.retryAfter ?? result?.retry_after ?? 60

    if (result?.success) {
      // show confirmation and start cooldown
      message.value = 'Verification email sent. Check your inbox.'
      startCooldown(retry)
    } else {
      // show error and start cooldown reflecting server guidance
      errorMsg.value = result?.error || 'Resend failed'
      startCooldown(retry)
    }
  } catch (err: any) {
    errorMsg.value = err?.message || 'Resend failed'
    // defensive cooldown
    startCooldown(60)
  } finally {
    isLoading.value = false
  }
}

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<style scoped>
/* minimal styling provided by Tailwind classes in template */
</style>
