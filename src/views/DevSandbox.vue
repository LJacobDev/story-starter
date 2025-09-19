<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-semibold">Dev Sandbox</h1>
    <p class="text-sm text-amber-600">This route is available only in development (import.meta.env.DEV).</p>

    <StoryGrid :items="mockItems" :loading="false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StoryGrid from '@/components/stories/StoryGrid.vue'

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
</script>

<style scoped>
</style>
