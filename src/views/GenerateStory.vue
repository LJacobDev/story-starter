<template>
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-semibold">Generate a Story</h1>

    <div v-if="error" data-testid="gen-error" class="mt-3 rounded border border-red-200 bg-red-50 p-3 text-red-700">
      {{ error }}
    </div>
    <div v-if="pending" data-testid="gen-loading" class="mt-3 text-sm text-muted-foreground">Generating…</div>

    <section v-if="!preview" class="mt-6">
      <StoryGenerateForm @submit="handleSubmit" />
      <p class="text-xs text-muted-foreground mt-2">
        Note: The form shows a warning when additional instructions exceed 800 characters.
      </p>
    </section>

    <section v-else data-testid="preview-ready" class="mt-6 rounded border p-4">
      <h2 class="text-xl font-semibold">{{ preview.title }}</h2>
      <p v-if="preview.description" class="text-sm text-muted-foreground">{{ preview.description }}</p>
      <pre class="whitespace-pre-wrap mt-2 text-sm">{{ preview.content.slice(0, 200) }}{{ preview.content.length > 200 ? '…' : '' }}</pre>
      <div class="text-xs text-gray-500 mt-2">Preview generated. Full preview and actions will be wired next.</div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StoryGenerateForm from '@/components/generation/StoryGenerateForm.vue'
import { useGeneration, type GenerationResult } from '@/composables/useGeneration'

// 4.1.4d.2 — View shell + form submit
const { generateStory } = useGeneration()

const pending = ref(false)
const error = ref<string | null>(null)
const preview = ref<GenerationResult | null>(null)

async function handleSubmit(payload: any) {
  if (pending.value) return
  error.value = null
  pending.value = true
  const res = await generateStory(payload)
  pending.value = false
  if (res.ok) {
    preview.value = res.data
  } else {
    error.value = res.error.message || 'Failed to generate story'
  }
}
</script>
