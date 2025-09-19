<template>
  <div>
    <div data-testid="story-card-root">
      <Card class="overflow-hidden shadow-sm hover:shadow transition-shadow bg-white dark:bg-gray-900">
        <div class="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="`Cover image for ${title}`"
            class="h-full w-full object-cover"
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

        <CardContent class="p-4 space-y-2">
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
          <p v-if="description" class="text-sm text-gray-600 dark:text-gray-300 truncate">
            {{ description }}
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import { computed } from 'vue'

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

const typeLabel = computed(() => {
  switch (props.type) {
    case 'movie_summary': return 'Movie Summary'
    case 'tv_commercial': return 'TV Commercial'
    case 'short_story':
    default: return 'Short Story'
  }
})
</script>
