<template>
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-semibold">Generate a Story</h1>

    <div v-if="error" data-testid="gen-error" class="mt-3 rounded border border-red-200 bg-red-50 p-3 text-red-700">
      {{ error }}
    </div>
    <div v-if="pending" data-testid="gen-loading" class="mt-3 text-sm text-muted-foreground">Generating…</div>

    <section v-if="!preview" class="mt-6">
      <StoryGenerateForm @submit="handleSubmit" @edit-prompts="onEdit" @cancel="onCancel" />
      <p class="text-xs text-muted-foreground mt-2">
        Note: The form shows a warning when additional instructions exceed 800 characters.
      </p>
    </section>

    <section v-else class="mt-6 space-y-3">
      <StoryGeneratePreview
        :preview="preview"
        @retry="onRetry"
        @edit="onEdit"
        @discard="onDiscard"
        @save="onSave"
        @undo="onUndo"
      />
    </section>

    <!-- Always render idempotency key element so tests can read it even when empty -->
    <div class="text-xs text-gray-500 mt-3">
      <span>Idempotency:</span>
      <span data-testid="idempotency-key">{{ idempotencyKey }}</span>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StoryGenerateForm from '@/components/generation/StoryGenerateForm.vue'
import StoryGeneratePreview from '@/components/generation/StoryGeneratePreview.vue'
import { useGeneration, type GenerationResult } from '@/composables/useGeneration'
import { makeIdempotencyKey } from '@/utils/idempotency'

// 4.1.4d.3 — Preview wiring + idempotency
const { generateStory } = useGeneration()

const pending = ref(false)
const error = ref<string | null>(null)
const preview = ref<GenerationResult | null>(null)
const previousPreview = ref<GenerationResult | null>(null)
const lastPayload = ref<any | null>(null) // retain normalized payload for idempotency
const idempotencyKey = ref<string>('')
const previousIdempotencyKey = ref<string | null>(null)

function smallHash(input: string): string {
  // Simple deterministic hash for fallback (FNV-1a like)
  let h = 2166136261 >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h.toString(16)
}

async function computePreviewKey(payload: any, story: GenerationResult): Promise<string> {
  // Include both payload and salient story fields so retry with same payload yields new key
  const keyInput = {
    payload,
    story: {
      title: story.title,
      content: story.content,
      story_type: story.story_type,
      description: story.description ?? null,
    },
  }
  try {
    const k = await makeIdempotencyKey(keyInput)
    return k && k.length > 0 ? k : smallHash(JSON.stringify(keyInput))
  } catch {
    return smallHash(JSON.stringify(keyInput))
  }
}

async function generateWith(payload: any) {
  if (pending.value) return
  error.value = null
  pending.value = true
  const res = await generateStory(payload)
  pending.value = false
  if (res.ok) {
    // move current to previous (including key), then set new
    if (preview.value) {
      previousPreview.value = preview.value
      previousIdempotencyKey.value = idempotencyKey.value
    }
    preview.value = res.data
    lastPayload.value = payload
    // Set a provisional key synchronously to avoid empty display
    const provisional = smallHash(JSON.stringify({ payload, story: { title: res.data.title, content: res.data.content } }))
    idempotencyKey.value = provisional
    // Replace with full key when available
    idempotencyKey.value = await computePreviewKey(payload, res.data)
  } else {
    error.value = res.error.message || 'Failed to generate story'
  }
}

async function handleSubmit(payload: any) {
  await generateWith(payload)
}

async function onRetry() {
  if (!lastPayload.value) return
  // For now, retry with the same payload; in edit flow it will change
  await generateWith(lastPayload.value)
}

function onUndo() {
  if (previousPreview.value) {
    // swap previews
    const tmpPrev = preview.value
    preview.value = previousPreview.value
    previousPreview.value = tmpPrev
    // swap keys to keep in sync
    const tmpKey = idempotencyKey.value
    idempotencyKey.value = previousIdempotencyKey.value || idempotencyKey.value
    previousIdempotencyKey.value = tmpKey
  }
}

function clearAll() {
  preview.value = null
  previousPreview.value = null
  lastPayload.value = null
  idempotencyKey.value = ''
  previousIdempotencyKey.value = null
}

function onEdit() {
  clearAll()
}

function onCancel() {
  // same as edit for now
  clearAll()
}

function onDiscard() {
  clearAll()
}

function onSave(_draft: any) {
  // wired in next steps (4.1.4d.5)
}
</script>
