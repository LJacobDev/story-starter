<template>
  <div>
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="story-grid">
      <SkeletonCard v-for="n in 12" :key="n" />
    </div>

    <div v-else-if="items.length === 0" class="py-8 text-center text-sm text-muted-foreground" data-testid="empty-state">
      {{ emptyMessage || 'No stories to display.' }}
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="story-grid">
      <StoryCard v-for="item in items" :key="item.id" v-bind="item" />
    </div>
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

const SkeletonCard = {
  name: 'SkeletonCard',
  template: `
    <div class="rounded-lg border bg-white dark:bg-gray-900 p-4" data-testid="skeleton-card">
      <div class="aspect-[16/9] w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
      <div class="mt-3 h-4 w-3/4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
      <div class="mt-2 h-3 w-1/2 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
    </div>
  `
}
</script>

<style scoped>
</style>
