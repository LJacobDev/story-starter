<template>
  <div data-testid="story-card-root">
    <!-- Stub: Implementation will follow in 3.1.1a.2 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: string
  title: string
  type: 'short_story' | 'movie_summary' | 'tv_commercial'
  isPrivate: boolean
  createdAt: Date | string
  imageUrl?: string | null
  description?: string | null
}

// Props only for now (TDD step). No implementation yet.
defineProps<Props>()
</script>
