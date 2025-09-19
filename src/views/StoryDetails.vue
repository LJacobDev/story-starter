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

        <div v-if="isOwner && !editMode" class="flex gap-2">
          <button data-testid="edit-btn" class="px-3 py-2 rounded bg-slate-900 text-white hover:bg-slate-700" @click="enterEdit">Edit</button>
          <button data-testid="delete-btn" class="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700" @click="openDeleteConfirm">Delete</button>
        </div>
      </header>

      <!-- Delete confirm dialog -->
      <div v-if="showDelete" data-testid="delete-confirm" class="rounded border p-4 bg-red-50 text-red-900">
        <p class="mb-3 font-medium">Delete this story permanently?</p>
        <div class="flex gap-2">
          <button data-testid="confirm-delete-cancel" class="px-3 py-2 rounded border" @click="closeDeleteConfirm">Cancel</button>
          <button data-testid="confirm-delete-confirm" class="px-3 py-2 rounded bg-red-600 text-white" @click="confirmDelete">Yes, delete</button>
        </div>
      </div>

      <!-- Edit form -->
      <form v-if="editMode" data-testid="edit-form" class="space-y-4" @submit.prevent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1" for="title">Title</label>
            <input name="title" id="title" type="text" class="w-full rounded border px-3 py-2" v-model="form.title" />
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

          <div>
            <label class="block text-sm font-medium mb-1" for="image_url">Image URL</label>
            <input name="image_url" id="image_url" type="url" class="w-full rounded border px-3 py-2" v-model="form.image_url" />
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
          <button type="button" data-testid="edit-save" class="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50" :disabled="!canSave" @click="saveEdit">Save</button>
        </div>
      </form>

      <!-- Read-only content when not editing -->
      <template v-else>
        <figure v-if="story.image_url" class="mt-2">
          <img :src="story.image_url" :alt="`Cover image for ${story.title}`" class="max-h-72 rounded border object-cover" />
        </figure>

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
import { ref, computed, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStory, type StoryRecord, type StoryResult } from '@/composables/useStory'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { getById, remove } = useStory()
const { user, isAuthenticated } = useAuth()

const loading = ref(false)
const error = ref<{ message: string; code?: string | number } | null>(null)
const story = ref<StoryRecord | null>(null)

// Delete confirmation state
const showDelete = ref(false)
function openDeleteConfirm() {
  showDelete.value = true
}
function closeDeleteConfirm() {
  showDelete.value = false
}
async function confirmDelete() {
  if (!story.value) return
  const id = story.value.id
  const res = await remove(id)
  if (res.success) {
    await router.push('/')
  } else {
    // simple inline error; could be replaced with toast later
    error.value = res.error || { message: 'Delete failed' }
  }
}

// Edit mode state
const editMode = ref(false)
const form = reactive<{ title: string; story_type: string; genre: string | null; description: string | null; image_url: string | null; is_private: boolean; content: string | undefined }>({
  title: '',
  story_type: 'short_story',
  genre: '',
  description: '',
  image_url: '',
  is_private: true,
  content: ''
})

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

function enterEdit() {
  if (story.value) {
    hydrateForm(story.value)
    editMode.value = true
  }
}

function cancelEdit() {
  editMode.value = false
}

function saveEdit() {
  // Implementation of persistence will be done in 3.2.1d; for now this is a noop to satisfy UI contract
}

const titleError = computed(() => (form.title?.length ?? 0) > 120 ? 'Max 120 characters' : null)
const genreError = computed(() => (form.genre?.length ?? 0) > 60 ? 'Max 60 characters' : null)
const canSave = computed(() => !titleError.value && !genreError.value)

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
</script>
