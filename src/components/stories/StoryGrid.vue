<template>
  <div
    data-testid="story-grid"
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
  >
    <template v-if="loading">
      <!-- Inline skeletons to avoid runtime template compilation warnings -->
      <div
        v-for="n in 12"
        :key="n"
        class="rounded-lg border bg-white dark:bg-gray-900 p-4"
        data-testid="skeleton-card"
      >
        <div class="aspect-[16/9] w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
        <div class="mt-3 h-4 w-3/4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
        <div class="mt-2 h-3 w-1/2 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
      </div>
    </template>

    <template v-else-if="items.length === 0">
      <div class="py-8 text-center text-sm text-muted-foreground" data-testid="empty-state">
        {{ emptyMessage || 'No stories to display.' }}
      </div>
    </template>

    <template v-else>
      <div v-for="item in items" :key="item.id" class="h-full">
        <StoryCard v-bind="item" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StoryCard from '@/components/stories/StoryCard.vue'

interface StoryCardProps {
  id: string
  title: string
  type: 'short_story' | 'movie_summary' | 'tv_commercial'
  isPrivate: boolean
  createdAt: Date | string
  imageUrl?: string | null
  description?: string | null
}

const props = defineProps<{
  items: StoryCardProps[]
  loading: boolean
  emptyMessage?: string
}>()

const items = computed(() => props.items || [])
const loading = computed(() => !!props.loading)
const emptyMessage = computed(() => props.emptyMessage)
</script>

<style scoped>
</style>
