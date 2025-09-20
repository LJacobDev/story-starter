<template>
  <div>
    <div data-testid="story-card-root">
      <router-link
        :to="{ name: 'story-details', params: { id } }"
        class="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg cursor-pointer"
        :aria-label="`View ${title}`"
        data-testid="story-card-link"
      >
        <Card class="overflow-hidden shadow-sm hover:shadow transition-shadow bg-white dark:bg-gray-900 h-full flex flex-col">
          <div class="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <img
              v-if="resolvedSrc"
              :src="resolvedSrc"
              :alt="`Cover image for ${title}`"
              class="h-full w-full object-cover"
              @error="onImgError"
            />
            <div v-else class="flex flex-col items-center justify-center">
              <!-- Inline fallback SVGs to avoid runtime template compilation -->
              <svg
                v-if="type === 'short_story'"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 text-slate-500"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M4 5a2 2 0 012-2h10a2 2 0 012 2v13a1 1 0 01-1 1H6a2 2 0 00-2 2V5z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 5.5h8M8 9h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <svg
                v-else-if="type === 'movie_summary'"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 text-indigo-500"
                aria-hidden="true"
                focusable="false"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M9 5v14M15 5v14" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6 7h1M6 10h1M6 13h1M6 16h1M17 7h1M17 10h1M17 13h1M17 16h1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 text-emerald-500"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M4 10h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M20 10L18 4l-8 2 2 4 8 0z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 6l2 4M12 5l2 5M16 4l2 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="sr-only">Cover image placeholder for {{ title }}</span>
            </div>
          </div>

          <!-- Lock the body height so total card height is uniform across rows -->
          <CardContent class="p-4 space-y-2 flex flex-col min-h-[7.5rem] max-h-[7.5rem] overflow-hidden">
            <div class="flex items-center gap-2 flex-wrap">
              <CardTitle class="text-base font-semibold truncate">{{ title }}</CardTitle>
              <!-- Badge replacement: type label -->
              <span
                class="inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200"
              >
                {{ typeLabel }}
              </span>
              <!-- Badge replacement: private label -->
              <span
                v-if="isPrivate"
                class="inline-flex items-center rounded border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200"
              >
                Private
              </span>
            </div>
            <!-- Always render description; reserve two lines height; custom clamp to avoid plugin dependency -->
            <p
              class="text-sm text-gray-600 dark:text-gray-300 leading-5 clamp-2 min-h-[2.5rem]"
              :aria-hidden="!description"
            >
              {{ description || '\u00A0' }}
            </p>
          </CardContent>
        </Card>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { resolveImageUrl } from '@/composables/useStoryImage'

interface Props {
  id: string
  title: string
  type: 'short_story' | 'movie_summary' | 'tv_commercial'
  isPrivate: boolean
  createdAt: Date | string
  imageUrl?: string | null
  description?: string | null
}

const props = defineProps<Props>()

function isHttp(url?: string | null): url is string {
  return !!url && /^https?:\/\//i.test(url)
}

function isSupabaseStorageUrl(url?: string | null): boolean {
  if (!url) return false
  try {
    const u = new URL(url)
    return /\/storage\/v1\/object\//.test(u.pathname)
  } catch {
    return false
  }
}

// Keep last good src and attempt limited retries on error
const refreshAttempts = ref(0)
// Initialize synchronously if a direct http(s) non-Supabase URL is provided so tests see <img> immediately
const resolvedSrc = ref<string | null>(
  isHttp(props.imageUrl) && !isSupabaseStorageUrl(props.imageUrl) ? (props.imageUrl as string) : null
)

async function refreshSrc(force = false) {
  const src = props.imageUrl || null
  if (!src) {
    resolvedSrc.value = null
    return
  }
  // For non-Supabase external links, use as-is
  if (isHttp(src) && !isSupabaseStorageUrl(src)) {
    resolvedSrc.value = src
    return
  }
  // For Storage paths or Supabase URLs, resolve (optionally force a re-sign)
  resolvedSrc.value = await resolveImageUrl(src, { forceRefresh: force })
}

function onImgError() {
  if (refreshAttempts.value >= 2) return
  refreshAttempts.value += 1
  void (async () => {
    const fresh = await resolveImageUrl(props.imageUrl || null, { forceRefresh: true })
    if (fresh) {
      const bust = `${fresh}${fresh.includes('?') ? '&' : '?'}t=${Date.now()}`
      resolvedSrc.value = bust
    } else {
      // fall back to SVG
      resolvedSrc.value = null
    }
  })()
}

onMounted(() => {
  // Ensure storage paths resolve after mount
  if (!(isHttp(props.imageUrl) && !isSupabaseStorageUrl(props.imageUrl))) {
    void refreshSrc(true)
  }
})

watch(
  () => props.imageUrl,
  () => {
    refreshAttempts.value = 0
    // Re-evaluate sync init for direct URLs; otherwise resolve storage
    if (isHttp(props.imageUrl) && !isSupabaseStorageUrl(props.imageUrl)) {
      resolvedSrc.value = props.imageUrl as string
    } else {
      void refreshSrc(true)
    }
  }
)

const typeLabel = computed(() => {
  switch (props.type) {
    case 'movie_summary': return 'Movie Summary'
    case 'tv_commercial': return 'TV Commercial'
    case 'short_story':
    default: return 'Short Story'
  }
})
</script>

<style scoped>
/* Two-line clamp without requiring Tailwind line-clamp plugin */
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* standard property for compatibility */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
