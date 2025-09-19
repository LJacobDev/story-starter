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

    <!-- New: Preview + Save wiring sandbox -->
    <section class="space-y-3">
      <h2 class="text-lg font-medium">Preview + Save Wiring</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div class="border rounded p-4 bg-white/50">
          <p class="text-xs text-gray-600 mb-2">This uses a mock preview and the real useSaveStory composable. Save will call Supabase in dev if configured.</p>
          <StoryGeneratePreview
            v-if="mockPreview"
            :preview="mockPreview"
            :saving="saving"
            @save="onSave"
            @retry="onRetry"
            @discard="onDiscard"
            @edit="onEdit"
            @undo="onUndo"
          />
          <div v-else class="text-sm text-gray-500">Generate a preview to show here.</div>
        </div>
        <div class="border rounded p-4 bg-gray-50">
          <h3 class="font-medium mb-2">Events log</h3>
          <ul class="text-xs space-y-1 max-h-[50vh] overflow-auto">
            <li v-for="(e, i) in logs" :key="i" class="font-mono">{{ e }}</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import StoryGrid from '@/components/stories/StoryGrid.vue'
import StoryGenerateForm from '@/components/generation/StoryGenerateForm.vue'
import StoryGeneratePreview from '@/components/generation/StoryGeneratePreview.vue'
import { composePrompt } from '@/utils/composePrompt'
import { useSaveStory } from '@/composables/useSaveStory'

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

// Persist a per-preview idempotency key; cleared whenever preview changes
const previewKey = ref<string | null>(null)

function handleSubmit(payload: any) {
  lastPayload.value = payload
  // For demo purposes, construct a mock preview from the payload
  mockPreview.value = {
    title: payload.title || 'Untitled',
    description: payload.additional_instructions || '—',
    content: 'This is a mock generated story preview based on your inputs.',
    story_type: payload.story_type || 'short-story',
    genre: payload.genre || undefined,
    image_url: payload.image?.mode === 'url' ? (payload.image.url || undefined) : undefined,
  }
  // New preview → reset idempotency key so first Save establishes it
  previewKey.value = null
}
function pretty(v: any) {
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

// Preview + Save wiring state
const mockPreview = ref<{
  title: string
  description?: string
  content: string
  story_type: 'short-story' | 'movie-summary' | 'tv-commercial'
  genre?: string
  image_url?: string
} | null>(null)

const logs = ref<string[]>([])
const { save, saving } = useSaveStory()

function log(msg: string) {
  logs.value.unshift(new Date().toLocaleTimeString() + ' — ' + msg)
}

function toast(msg: string) {
  // Minimal placeholder toast (replace with real UI later)
  console.info('[toast]', msg)
  log('[toast] ' + msg)
}

function genIdempotencyKey() {
  return (globalThis.crypto && 'randomUUID' in globalThis.crypto)
    ? (globalThis.crypto as any).randomUUID()
    : Math.random().toString(36).slice(2)
}

async function onSave(draft: any) {
  log('save clicked')
  // Reuse the same key for the current preview; create once lazily
  if (!previewKey.value) previewKey.value = genIdempotencyKey()
  const key = previewKey.value
  const res = await save(
    {
      title: draft.title,
      content: draft.content,
      story_type: draft.story_type.replace('-', '_'),
      genre: draft.genre,
      description: draft.description,
      image_url: draft.image_url,
      is_private: true,
    },
    { idempotencyKey: key! }
  )
  if (res.ok) {
    toast('Story saved with id ' + res.id)
  } else {
    toast('Save failed: ' + (res.error?.message || 'Unknown error'))
  }
}

function onRetry() {
  log('retry clicked')
  // New generation would produce a new preview → clear key to allow a new save
  previewKey.value = null
}
function onDiscard() {
  log('discard clicked')
  previewKey.value = null
}
function onEdit() {
  log('edit clicked')
  // Editing prompts is expected to change preview afterward → clear key preemptively
  previewKey.value = null
}
function onUndo() {
  log('undo clicked')
  // Undo swaps preview content; to be safe, force a new key on next save
  previewKey.value = null
}
</script>

<style scoped>
</style>
