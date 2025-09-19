<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Dev Sandbox</h1>
      <p class="text-sm text-amber-600">This route is available only in development (import.meta.env.DEV).</p>
    </div>

    <!-- Existing mock grid -->
    <section class="space-y-2">
      <h2 class="text-lg font-medium">Mock Grid</h2>
      <StoryGrid :items="mockItems" :loading="false" />
    </section>

    <hr class="border-t" />

    <!-- New: Generation Form Playground -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium">Generation Form Playground</h2>
        <p class="text-xs text-gray-500">Try: type a theme and press Enter; add/remove/reorder items; test validation caps.</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div class="border rounded p-4 bg-white/50">
          <StoryGenerateForm @submit="handleSubmit" />
        </div>
        <div class="border rounded p-4 bg-gray-50">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-medium">Last submitted payload</h3>
            <label v-if="lastPayload" class="inline-flex items-center gap-2 text-xs">
              <input type="checkbox" v-model="showPrompt" />
              <span>Show composed prompt</span>
            </label>
          </div>
          <div v-if="lastPayload" class="text-xs overflow-auto max-h-[70vh]">
            <div v-if="showPrompt" class="mb-2 text-gray-500">Prompt length: {{ composedPrompt.length }}</div>
            <pre v-if="!showPrompt" class="whitespace-pre-wrap">{{ pretty(lastPayload) }}</pre>
            <pre v-else class="whitespace-pre-wrap">{{ composedPrompt }}</pre>
          </div>
          <div v-else class="text-sm text-gray-500">Fill the form and click Generate to see the normalized payload here.</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import StoryGrid from '@/components/stories/StoryGrid.vue'
import StoryGenerateForm from '@/components/generation/StoryGenerateForm.vue'
import { composePrompt } from '@/utils/composePrompt'

const mockItems = ref([
  {
    id: 'mock-1',
    title: 'Mock Short Story',
    type: 'short_story' as const,
    isPrivate: true,
    createdAt: new Date().toISOString(),
    imageUrl: undefined,
    description: 'A tiny preview of a mock short story used only for development.'
  }
])

const lastPayload = ref<any | null>(null)
const showPrompt = ref(false)
const composedPrompt = computed(() => (lastPayload.value ? composePrompt(lastPayload.value) : ''))

function handleSubmit(payload: any) {
  lastPayload.value = payload
}
function pretty(v: any) {
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}
</script>

<style scoped>
</style>
