<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useStories } from '@/composables/useStories'
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

const yourStories = useStories()
const publicStories = useStories()

function toCard(item: any): StoryCardProps {
  return {
    id: item.id,
    title: item.title,
    type: (item.story_type || item.type) as StoryCardProps['type'],
    isPrivate: item.is_private ?? item.isPrivate ?? false,
    createdAt: item.created_at || item.createdAt,
    imageUrl: item.image_url ?? item.imageUrl ?? null,
    description: item.description ?? null
  }
}

const yourItems = computed<StoryCardProps[]>(() => (yourStories.items.value || []).map(toCard))
const publicItems = computed<StoryCardProps[]>(() => (publicStories.items.value || []).map(toCard))

const canShowMorePublic = computed(() => publicStories.hasMore.value)
function showMorePublic() {
  const next = (publicStories.page.value || 1) + 1
  publicStories.fetchPublic({ page: next })
}

const canShowMoreMine = computed(() => yourStories.hasMore.value)
function showMoreMine() {
  const next = (yourStories.page.value || 1) + 1
  yourStories.fetchMine('me', { page: next })
}

onMounted(() => {
  publicStories.fetchPublic({ page: 1 })
  if (isAuthenticated) {
    yourStories.fetchMine('me', { page: 1 })
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Stories</h1>

    <!-- Authenticated: Your Stories then All Public Stories -->
    <section v-if="isAuthenticated" data-testid="section-your" class="mb-10">
      <h2 class="text-xl font-semibold mb-3">Your Stories</h2>
      <StoryGrid :items="yourItems" :loading="yourStories.loading.value" />
      <div v-if="canShowMoreMine" class="mt-4 text-center">
        <button
          type="button"
          class="px-4 py-2 rounded bg-primary text-white hover:opacity-90"
          data-testid="show-more-mine"
          @click="showMoreMine"
        >Show more</button>
      </div>
    </section>

    <section v-if="isAuthenticated" data-testid="section-public" class="mb-10">
      <h2 class="text-xl font-semibold mb-3">All Public Stories</h2>
      <StoryGrid :items="publicItems" :loading="publicStories.loading.value" />
      <div v-if="canShowMorePublic" class="mt-4 text-center">
        <button
          type="button"
          class="px-4 py-2 rounded bg-primary text-white hover:opacity-90"
          data-testid="show-more-public"
          @click="showMorePublic"
        >Show more</button>
      </div>
    </section>

    <!-- Guest: marketing hero + Public Stories -->
    <section v-else class="mb-10">
      <div data-testid="guest-hero" class="mb-8 rounded-lg border p-6 bg-muted">
        <h2 class="text-xl font-semibold mb-2">Create and share stories</h2>
        <p class="text-muted-foreground">Sign up to generate, save, and manage your own stories. Explore what others have made below.</p>
      </div>

      <div data-testid="section-public">
        <h2 class="text-xl font-semibold mb-3">Public Stories</h2>
        <StoryGrid :items="publicItems" :loading="publicStories.loading.value" />
        <div v-if="canShowMorePublic" class="mt-4 text-center">
          <button
            type="button"
            class="px-4 py-2 rounded bg-primary text-white hover:opacity-90"
            data-testid="show-more-public"
            @click="showMorePublic"
          >Show more</button>
        </div>
      </div>
    </section>
  </div>
</template>
