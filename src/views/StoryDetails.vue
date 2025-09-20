<template>
  <section class="container mx-auto py-8" data-testid="story-details">
    <h1 class="text-2xl font-semibold mb-4">Story</h1>

    <div v-if="loading" data-testid="story-loading">Loading…</div>

    <div v-else-if="error" class="text-red-600" data-testid="story-error">
      {{ error.message || 'Not found or private' }}
    </div>

    <article v-else-if="story" class="space-y-4">
      <!-- Read-only header + action -->
      <header class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold">{{ story.title }}</h2>
          <div class="mt-2 flex gap-2 text-sm">
            <span class="inline-flex items-center rounded px-2 py-0.5 bg-muted">{{ typeLabel }}</span>
            <span class="inline-flex items-center rounded px-2 py-0.5" :class="story.is_private ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
              {{ story.is_private ? 'Private' : 'Public' }}
            </span>
            <span v-if="story.genre" class="inline-flex items-center rounded px-2 py-0.5 bg-muted">{{ story.genre }}</span>
            <span v-if="story.created_at" class="inline-flex items-center rounded px-2 py-0.5 bg-muted">{{ formattedDate }}</span>
          </div>
        </div>

        <!-- Actions: Share for everyone, Edit/Delete for owner when not editing -->
        <div v-if="!editMode" class="flex gap-2">
          <button data-testid="share-btn" class="px-3 py-2 rounded border hover:bg-muted" @click="shareStory">Share</button>
          <template v-if="isOwner">
            <button data-testid="edit-btn" class="px-3 py-2 rounded bg-slate-900 text-white hover:bg-slate-700" @click="enterEdit">Edit</button>
            <button ref="deleteBtnEl" data-testid="delete-btn" class="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700" @click="openDeleteConfirm">Delete</button>
          </template>
        </div>
      </header>

      <!-- Share warning (e.g., attempting to share a private story) -->
      <div v-if="shareWarning" data-testid="share-warning" class="rounded border p-3 bg-amber-50 text-amber-900">
        {{ shareWarning }}
      </div>

      <!-- Delete confirm dialog -->
      <div v-if="showDelete" data-testid="delete-confirm" class="rounded border p-4 bg-red-50 text-red-900" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
        <p id="delete-confirm-title" class="mb-3 font-medium">Delete this story permanently?</p>
        <div class="flex gap-2">
          <button ref="deleteCancelBtnEl" data-testid="confirm-delete-cancel" class="px-3 py-2 rounded border" @click="closeDeleteConfirm">Cancel</button>
          <button data-testid="confirm-delete-confirm" class="px-3 py-2 rounded bg-red-600 text-white" :disabled="pendingDelete" @click="confirmDelete">
            <span v-if="pendingDelete">Deleting…</span>
            <span v-else>Yes, delete</span>
          </button>
        </div>
      </div>

      <!-- Edit form -->
      <form v-if="editMode" data-testid="edit-form" class="space-y-4" @submit.prevent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1" for="title">Title</label>
            <input ref="titleInputEl" name="title" id="title" type="text" class="w-full rounded border px-3 py-2" v-model="form.title" />
            <p v-if="titleError" data-testid="error-title" class="text-sm text-red-600 mt-1">{{ titleError }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" for="story_type">Type</label>
            <select name="story_type" id="story_type" class="w-full rounded border px-3 py-2" v-model="form.story_type">
              <option value="short_story">Short story</option>
              <option value="movie_summary">Movie summary</option>
              <option value="tv_commercial">TV commercial</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" for="genre">Genre</label>
            <input name="genre" id="genre" type="text" class="w-full rounded border px-3 py-2" v-model="form.genre" />
            <p v-if="genreError" data-testid="error-genre" class="text-sm text-red-600 mt-1">{{ genreError }}</p>
          </div>

          <!-- Image controls: mode (URL/upload), validators, preview, remove -->
          <div>
            <label class="block text-sm font-medium mb-2">Image</label>
            <div class="flex items-center gap-4 mb-2">
              <label class="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="image_mode" value="url" data-testid="image-mode-url" v-model="imageMode" />
                URL
              </label>
              <label class="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="image_mode" value="upload" data-testid="image-mode-upload" v-model="imageMode" />
                Upload
              </label>
            </div>

            <div v-if="imageMode === 'url'" class="space-y-1">
              <label class="block text-sm" for="image_url">Image URL</label>
              <input name="image_url" id="image_url" type="url" class="w-full rounded border px-3 py-2" v-model="form.image_url" />
              <p v-if="imageUrlError" data-testid="error-image-url" class="text-sm text-red-600">{{ imageUrlError }}</p>
            </div>

            <div v-else class="space-y-2">
              <!-- Hidden file input so we can show a nicer Upload button -->
              <input ref="fileEl" type="file" accept="image/png, image/jpeg, image/webp" data-testid="image-file" class="hidden" @change="onFileChange" />
              <button type="button" class="px-3 py-2 rounded border hover:bg-muted" @click="fileEl?.click()">Upload</button>
            </div>

            <div v-if="previewUrl" data-testid="image-preview" class="mt-2">
              <img :src="previewUrl" :alt="`Cover image for ${form.title || 'story'}`" class="max-h-48 rounded border object-cover" />
            </div>
            <div class="mt-2">
              <button type="button" data-testid="image-remove" class="px-2 py-1 text-sm rounded border" @click="removeImage">Remove image</button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1" for="description">Description</label>
          <textarea name="description" id="description" rows="3" class="w-full rounded border px-3 py-2" v-model="form.description"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1" for="content">Content</label>
          <textarea name="content" id="content" rows="8" class="w-full rounded border px-3 py-2" v-model="form.content"></textarea>
        </div>

        <div class="flex items-center gap-2">
          <input id="is_private" name="is_private" type="checkbox" class="h-4 w-4" v-model="form.is_private" />
          <label for="is_private" class="text-sm">Private</label>
        </div>

        <div class="flex gap-2">
          <button type="button" data-testid="edit-cancel" class="px-3 py-2 rounded border" @click="cancelEdit">Cancel</button>
          <button type="button" data-testid="edit-save" class="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50" :disabled="!canSave || pendingSave" @click="saveEdit">
            <span v-if="pendingSave">Saving…</span>
            <span v-else>Save</span>
          </button>
        </div>
      </form>

      <!-- Read-only content when not editing -->
      <template v-else>
        <!-- Read-only figure uses resolved URL (public or signed) -->
        <figure v-if="resolvedViewSrc" class="mt-2">
          <img :src="resolvedViewSrc" :alt="`Cover image for ${story.title}`" class="max-h-72 rounded border object-cover" />
        </figure>
        <div v-else-if="story?.image_url" class="mt-2 flex h-36 items-center justify-center rounded border bg-muted text-muted-foreground" data-testid="image-fallback">
          <span class="text-sm">Image unavailable</span>
        </div>

        <p v-if="story.description" class="text-muted-foreground">{{ story.description }}</p>

        <div class="prose max-w-none whitespace-pre-wrap" data-testid="story-content">
          {{ story.content || '—' }}
        </div>
      </template>
    </article>

    <div v-else data-testid="story-empty">Not found or private.</div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStory, type StoryRecord, type StoryResult } from '@/composables/useStory'
import { useAuth } from '@/composables/useAuth'
import { useStoryImage, resolveImageUrl } from '@/composables/useStoryImage'

const route = useRoute()
const router = useRouter()
const { getById, remove, update } = useStory()
const { user, isAuthenticated } = useAuth()
const { upload: uploadImage } = useStoryImage()

const loading = ref(false)
const error = ref<{ message: string; code?: string | number } | null>(null)
const story = ref<StoryRecord | null>(null)

// Element refs for a11y/keyboard flows
const titleInputEl = ref<HTMLInputElement | null>(null)
const deleteBtnEl = ref<HTMLButtonElement | null>(null)
const deleteCancelBtnEl = ref<HTMLButtonElement | null>(null)
const fileEl = ref<HTMLInputElement | null>(null)

// Global Escape handling for delete confirm
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && showDelete.value && !pendingDelete.value) {
    closeDeleteConfirm()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Share state
const shareWarning = ref<string | null>(null)
async function shareStory() {
  shareWarning.value = null
  if (!story.value) return

  // If private, show warning and do not share/copy
  if (story.value.is_private) {
    shareWarning.value = 'This story is private. Make it public before sharing (toggle the privacy in Edit).'
    return
  }

  const path = `#/stories/${story.value.id}`
  const url = path // Contains '/stories/:id' which tests assert
  const n = navigator as any
  try {
    if (typeof n.share === 'function') {
      await n.share({ title: story.value.title, text: 'Check out this story', url })
      // TODO: replace with real toast
      console.info('Shared via native share')
    } else if (n.clipboard?.writeText) {
      await n.clipboard.writeText(url)
      // TODO: replace with real toast
      console.info('Link copied to clipboard')
    } else {
      shareWarning.value = 'Sharing is not supported in this environment.'
    }
  } catch (e) {
    // Swallow errors and optionally notify
    console.warn('Share failed', e)
  }
}

// Delete confirmation state
const showDelete = ref(false)
const pendingDelete = ref(false)
function openDeleteConfirm() {
  showDelete.value = true
  void nextTick(() => {
    deleteCancelBtnEl.value?.focus()
  })
}
function closeDeleteConfirm() {
  if (pendingDelete.value) return
  showDelete.value = false
  void nextTick(() => {
    deleteBtnEl.value?.focus()
  })
}
async function confirmDelete() {
  if (!story.value || pendingDelete.value) return
  pendingDelete.value = true
  const id = story.value.id
  const res = await remove(id)
  if (res.success) {
    // TODO: replace with real toast
    console.info('Story deleted')
    await router.push('/')
  } else {
    error.value = res.error || { message: 'Delete failed' }
  }
  pendingDelete.value = false
}

// Edit mode state
const editMode = ref(false)
const pendingSave = ref(false)
const form = reactive<{ title: string; story_type: string; genre: string | null; description: string | null; image_url: string | null; is_private: boolean; content: string | undefined }>(
  { title: '', story_type: 'short_story', genre: '', description: '', image_url: '', is_private: true, content: '' }
)

const isOwner = computed(() => {
  return !!(isAuthenticated?.value && user?.value && story.value && story.value.user_id && story.value.user_id === (user.value as any).id)
})

function hydrateForm(s: StoryRecord) {
  form.title = s.title || ''
  form.story_type = (s.story_type as string) || 'short_story'
  form.genre = (s.genre as any) ?? ''
  form.description = (s.description as any) ?? ''
  form.image_url = (s.image_url as any) ?? ''
  form.is_private = !!s.is_private
  form.content = s.content
}

const titleError = computed(() => (form.title?.length ?? 0) > 120 ? 'Max 120 characters' : null)
const genreError = computed(() => (form.genre?.length ?? 0) > 60 ? 'Max 60 characters' : null)
const canSave = computed(() => !titleError.value && !genreError.value)

// Image edit state
const imageMode = ref<'url' | 'upload'>('url')
const previewUrl = ref<string | null>(null)
// Resolved URL for read-only view
const resolvedViewSrc = ref<string | null>(null)

const imageUrlError = computed(() => {
  if (imageMode.value !== 'url') return null
  const val = (form.image_url || '').trim()
  if (!val) return null
  const ok = /^https?:\/\//i.test(val)
  return ok ? null : 'Enter a valid http/https URL'
})

function removeImage() {
  form.image_url = ''
  previewUrl.value = null
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const uid = (story.value?.user_id as any) || (user?.value as any)?.id || 'unknown-user'
  const sid = (story.value?.id as any) || 'unknown-story'
  const res = await uploadImage(file, { userId: String(uid), storyId: String(sid) })
  if (res && (res as any).ok) {
    // Set preview first so DOM updates immediately
    previewUrl.value = (res as any).url as string
    // Persist durable path if provided; otherwise persist URL (external link case)
    const durable = (res as any).path || (res as any).url
    form.image_url = durable as string
    // Update read-only resolved too (in case we immediately exit edit)
    resolvedViewSrc.value = (res as any).url as string
  }
}

async function updateResolvedView() {
  const raw = story.value?.image_url
  if (!raw) { resolvedViewSrc.value = null; return }
  // If already a direct URL, keep; else resolve storage path
  if (/^https?:\/\//i.test(String(raw))) {
    // If it is a Supabase Storage URL, re-resolve to refresh token; else use as-is
    const refreshed = await resolveImageUrl(String(raw))
    resolvedViewSrc.value = refreshed || String(raw)
  } else {
    resolvedViewSrc.value = await resolveImageUrl(String(raw))
  }
}

async function updatePreviewFromForm() {
  const mode = imageMode.value
  const val = (form.image_url || '').trim()
  if (!val) { previewUrl.value = null; return }
  if (mode === 'url') {
    if (/^https?:\/\//i.test(val)) {
      // If it’s a Supabase Storage URL, derive a fresh view URL; else use as-is
      const maybe = await resolveImageUrl(val)
      previewUrl.value = maybe || val
    } else {
      // Treat as storage path; resolve to display URL
      previewUrl.value = await resolveImageUrl(val)
    }
  } else {
    // Upload mode sets previewUrl on upload; no-op here
  }
}

watch(
  () => ({ mode: imageMode.value, url: form.image_url }),
  () => { void updatePreviewFromForm() },
  { immediate: true, deep: true }
)

watch(
  () => story.value?.image_url,
  () => { void updateResolvedView() },
  { immediate: true }
)

async function load(id: string) {
  if (!id) return
  loading.value = true
  error.value = null
  try {
    const res = (await getById(id)) as StoryResult | undefined | null
    if (res != null) {
      if ((res as any).error) {
        error.value = (res as any).error
        story.value = null
      } else {
        story.value = (res as any).data
      }
    }
  } catch (e: any) {
    error.value = { message: e?.message || 'Failed to load story' }
    story.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.id,
  (val) => {
    const id = String(val || '')
    void load(id)
  },
  { immediate: true }
)

const typeLabel = computed(() => {
  const t = story.value?.story_type || ''
  if (t === 'short_story') return 'Short story'
  if (t === 'movie_summary') return 'Movie summary'
  if (t === 'tv_commercial') return 'TV commercial'
  return t || 'Story'
})

const formattedDate = computed(() => {
  const d = story.value?.created_at
  if (!d) return ''
  try {
    const date = new Date(d)
    return date.toLocaleDateString()
  } catch {
    return String(d)
  }
})

function enterEdit() {
  if (story.value) {
    hydrateForm(story.value)
    // Initialize image mode/preview from current data
    imageMode.value = 'url'
    const u = (form.image_url || '').trim()
    previewUrl.value = /^https?:\/\//i.test(u) ? u : null
    editMode.value = true
    void nextTick(() => {
      titleInputEl.value?.focus()
    })
  }
}

function cancelEdit() {
  if (pendingSave.value) return
  editMode.value = false
}

async function saveEdit() {
  if (!story.value || !canSave.value || pendingSave.value) return
  pendingSave.value = true
  const id = story.value.id
  const res = await update(id, {
    title: form.title,
    story_type: form.story_type,
    genre: form.genre || null,
    description: form.description || null,
    image_url: form.image_url || null,
    is_private: !!form.is_private,
    content: form.content
  })
  if (res.success && res.data) {
    story.value = res.data
    editMode.value = false
    // TODO: replace with real toast
    console.info('Story updated')
  } else if (res.error) {
    error.value = res.error
  }
  pendingSave.value = false
}
</script>
