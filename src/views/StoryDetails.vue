<template>
  <section class="container mx-auto py-8" data-testid="story-details">
    <h1 class="text-2xl font-semibold mb-4">Story</h1>

    <div v-if="loading" data-testid="story-loading">Loading…</div>

    <div v-else-if="error" class="text-red-600" data-testid="story-error">
      {{ error.message || 'Not found or private' }}
    </div>

    <article v-else-if="story" class="space-y-4">
      <header>
        <h2 class="text-xl font-bold">{{ story.title }}</h2>
        <div class="mt-2 flex gap-2 text-sm">
          <span class="inline-flex items-center rounded px-2 py-0.5 bg-muted">{{ typeLabel }}</span>
          <span class="inline-flex items-center rounded px-2 py-0.5" :class="story.is_private ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
            {{ story.is_private ? 'Private' : 'Public' }}
          </span>
          <span v-if="story.genre" class="inline-flex items-center rounded px-2 py-0.5 bg-muted">{{ story.genre }}</span>
          <span v-if="story.created_at" class="inline-flex items-center rounded px-2 py-0.5 bg-muted">{{ formattedDate }}</span>
        </div>
      </header>

      <figure v-if="story.image_url" class="mt-2">
        <img :src="story.image_url" :alt="`Cover image for ${story.title}`" class="max-h-72 rounded border object-cover" />
      </figure>

      <p v-if="story.description" class="text-muted-foreground">{{ story.description }}</p>

      <div class="prose max-w-none whitespace-pre-wrap" data-testid="story-content">
        {{ story.content || '—' }}
      </div>
    </article>

    <div v-else data-testid="story-empty">Not found or private.</div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStory, type StoryRecord, type StoryResult } from '@/composables/useStory'

const route = useRoute()
const { getById } = useStory()

const loading = ref(false)
const error = ref<{ message: string; code?: string | number } | null>(null)
const story = ref<StoryRecord | null>(null)

async function load(id: string) {
  if (!id) return
  loading.value = true
  error.value = null
  try {
    const res = (await getById(id)) as StoryResult | undefined | null
    // If the data source returned nothing (transient), keep current state
    if (res == null) return

    if (res.error) {
      error.value = res.error
      story.value = null
    } else {
      story.value = res.data
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
