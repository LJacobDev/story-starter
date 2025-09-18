<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import StoryGrid from '@/components/stories/StoryGrid.vue'

const { isAuthenticated } = useAuth()

interface StoryCardProps {
  id: string
  title: string
  type: 'short_story' | 'movie_summary' | 'tv_commercial'
  isPrivate: boolean
  createdAt: Date | string
  imageUrl?: string | null
  description?: string | null
}

// Placeholder data only; will be replaced by Supabase queries in 3.1.2
const yourStoriesRaw: StoryCardProps[] = [
  { id: 'y2', title: 'My Newest Story', type: 'short_story', isPrivate: false, createdAt: '2025-09-15', description: 'Newest entry' },
  { id: 'y1', title: 'Older Tale', type: 'short_story', isPrivate: false, createdAt: '2025-08-30', description: 'Older entry' }
]

const publicStoriesRaw: StoryCardProps[] = [
  { id: 'p3', title: 'Public Fresh', type: 'movie_summary', isPrivate: false, createdAt: '2025-09-12', description: 'Recent public' },
  { id: 'p2', title: 'Public Mid', type: 'short_story', isPrivate: false, createdAt: '2025-09-05', description: 'Mid public' },
  { id: 'p1', title: 'Public Old', type: 'tv_commercial', isPrivate: false, createdAt: '2025-08-20', description: 'Older public' }
]

const sortNewestFirst = (items: StoryCardProps[]) =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

const yourStories = computed(() => sortNewestFirst(yourStoriesRaw))
const publicStories = computed(() => sortNewestFirst(publicStoriesRaw))
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Stories</h1>

    <!-- Authenticated: Your Stories then All Public Stories -->
    <section v-if="isAuthenticated" data-testid="section-your" class="mb-10">
      <h2 class="text-xl font-semibold mb-3">Your Stories</h2>
      <StoryGrid :items="yourStories" :loading="false" />
    </section>

    <section v-if="isAuthenticated" data-testid="section-public" class="mb-10">
      <h2 class="text-xl font-semibold mb-3">All Public Stories</h2>
      <StoryGrid :items="publicStories" :loading="false" />
    </section>

    <!-- Guest: only Public Stories -->
    <section v-else data-testid="section-public" class="mb-10">
      <h2 class="text-xl font-semibold mb-3">Public Stories</h2>
      <StoryGrid :items="publicStories" :loading="false" />
    </section>
  </div>
</template>
