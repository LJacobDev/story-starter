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

    <section v-else class="mt-6 space-y-4">
      <StoryGeneratePreview
        :preview="preview"
        :saving="saving"
        @retry="onRetry"
        @edit="onEdit"
        @discard="onDiscard"
        @save="onSave"
        @undo="onUndo"
      />

      <!-- Image handling controls (URL / Upload) -->
      <div class="rounded border p-3 space-y-2">
        <h3 class="font-medium">Cover image</h3>
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <label class="inline-flex items-center gap-2">
            <input type="radio" name="imgmode" value="url" v-model="imageMode" data-testid="image-mode-url" />
            URL
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="radio" name="imgmode" value="upload" v-model="imageMode" data-testid="image-mode-upload" />
            Upload
          </label>
        </div>

        <!-- URL mode -->
        <div v-if="imageMode === 'url'" class="flex gap-2 items-center">
          <input
            data-testid="image-url-input"
            type="url"
            class="input input-bordered w-full max-w-md"
            placeholder="https://example.com/cover.jpg"
            v-model="imageUrlInput"
          />
          <button type="button" class="btn" data-testid="image-apply-url" @click="applyImageUrl">Apply URL</button>
          <button
            v-if="preview?.image_url"
            type="button"
            class="btn"
            data-testid="image-remove"
            @click="removeImage"
          >Remove</button>
        </div>

        <!-- Upload mode -->
        <div v-else class="flex flex-wrap items-center gap-2">
          <input
            data-testid="image-file-input"
            ref="fileInputRef"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="file-input file-input-bordered"
            @change="onFileChosen"
          />
          <button type="button" class="btn" data-testid="image-upload" @click="uploadOrReplace">
            {{ currentImagePath ? 'Replace' : 'Upload' }}
          </button>
          <button
            v-if="currentImagePath"
            type="button"
            class="btn"
            data-testid="image-remove"
            @click="removeImage"
          >Remove</button>
          <span class="text-xs text-muted-foreground">Allowed: PNG/JPEG/WEBP ≤ 2MB, 200–4000px</span>
        </div>

        <p v-if="imageError" data-testid="image-error" class="text-xs text-red-600">{{ imageError }}</p>
      </div>
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
import { useRouter } from 'vue-router'
import StoryGenerateForm from '@/components/generation/StoryGenerateForm.vue'
import StoryGeneratePreview from '@/components/generation/StoryGeneratePreview.vue'
import { useGeneration, type GenerationResult } from '@/composables/useGeneration'
import { useStoryImage } from '@/composables/useStoryImage'
import { useSaveStory } from '@/composables/useSaveStory'
import { useAuth } from '@/composables/useAuth'
import { makeIdempotencyKey } from '@/utils/idempotency'

// 4.1.4d.3–4.1.4d.5 — Preview wiring + idempotency + image + save
const router = useRouter()
const { user } = useAuth()
const { generateStory } = useGeneration()
const { validateUrl, upload, replace, remove } = useStoryImage()
const { save, saving } = useSaveStory()

const pending = ref(false)
const error = ref<string | null>(null)
const preview = ref<GenerationResult | null>(null)
const previousPreview = ref<GenerationResult | null>(null)
const lastPayload = ref<any | null>(null) // retain normalized payload for idempotency
const idempotencyKey = ref<string>('')
const previousIdempotencyKey = ref<string | null>(null)

// image state
const imageMode = ref<'url' | 'upload'>('url')
const imageUrlInput = ref('')
const imageError = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const currentImagePath = ref<string | null>(null)

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
    // Reset image state on new preview
    imageError.value = null
    imageUrlInput.value = ''
    currentImagePath.value = null
    selectedFile.value = null
    // Set provisional then final key
    const provisional = smallHash(JSON.stringify({ payload, story: { title: res.data.title, content: res.data.content } }))
    idempotencyKey.value = provisional
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
  await generateWith(lastPayload.value)
}

function onUndo() {
  if (previousPreview.value) {
    const tmpPrev = preview.value
    preview.value = previousPreview.value
    previousPreview.value = tmpPrev
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
  imageError.value = null
  imageUrlInput.value = ''
  currentImagePath.value = null
  selectedFile.value = null
}

function onEdit() {
  clearAll()
}

function onCancel() {
  clearAll()
}

function onDiscard() {
  clearAll()
}

// Image handlers
function applyImageUrl() {
  imageError.value = null
  if (!preview.value) return
  const v = validateUrl(imageUrlInput.value)
  if (v.ok) {
    preview.value.image_url = v.url
  } else {
    imageError.value = v.error.message
  }
}

function onFileChosen(e: Event) {
  const input = e.target as HTMLInputElement
  selectedFile.value = input?.files?.[0] ?? null
}

async function uploadOrReplace() {
  imageError.value = null
  if (!preview.value) return
  const file = selectedFile.value
  if (!file) {
    imageError.value = 'Choose an image file first'
    return
  }
  const ctx = {
    userId: user.value?.id || 'anon',
    // Use idempotency key as a temporary draft folder before save
    storyId: idempotencyKey.value || 'draft',
  }
  const res = currentImagePath.value
    ? await replace(currentImagePath.value, file, ctx)
    : await upload(file, ctx)
  if (!res.ok) {
    imageError.value = res.error.message
    return
  }
  currentImagePath.value = res.path || currentImagePath.value
  preview.value.image_url = res.url
  // clear input
  if (fileInputRef.value) fileInputRef.value.value = ''
  selectedFile.value = null
}

async function removeImage() {
  imageError.value = null
  if (!preview.value) return
  if (currentImagePath.value) {
    const r = await remove(currentImagePath.value)
    if (!('ok' in r) || (r as any).ok !== true) {
      imageError.value = (r as any)?.error?.message || 'Failed to remove image'
      return
    }
    currentImagePath.value = null
  }
  preview.value.image_url = undefined as any
}

// Save handler (4.1.4d.5)
async function onSave(draft: any) {
  if (!preview.value) return
  const payload = {
    title: draft.title,
    content: draft.content,
    story_type: draft.story_type as any,
    genre: draft.genre,
    description: draft.description,
    image_url: draft.image_url,
    is_private: (lastPayload.value && lastPayload.value.is_private) ?? true,
  }
  const res = await save(payload, { idempotencyKey: idempotencyKey.value })
  if (!res.ok) {
    error.value = res.error.message || 'Failed to save story'
    return
  }
  // Navigate to Your Stories (Home shows your stories first when authenticated)
  try {
    await router.push('/')
  } catch {
    // ignore
  }
}
</script>
