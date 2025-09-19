<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useStories } from '@/composables/useStories'
import StoryGrid from '@/components/stories/StoryGrid.vue'
import StoryFilters, { type StoryFiltersModel } from '@/components/stories/StoryFilters.vue'

const { isAuthenticated, user, isReady } = useAuth()

// Helper: safely read a Ref or plain value with a fallback (for test mocks)
function getRefVal<T>(maybeRefOrVal: any, fallback: T): T {
  if (maybeRefOrVal && typeof maybeRefOrVal === 'object' && 'value' in maybeRefOrVal) return maybeRefOrVal.value as T
  if (typeof maybeRefOrVal !== 'undefined') return maybeRefOrVal as T
  return fallback
}

const authReady = computed<boolean>(() => getRefVal<boolean>(isReady as any, true))
const authed = computed<boolean>(() => getRefVal<boolean>(isAuthenticated as any, false))
const userId = computed<string | null>(() => {
  const u = getRefVal<any>(user as any, null)
  return u?.id ?? null
})

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
function normalizeFiltersForQuery(src: StoryFiltersModel) {
  const f: any = { ...src }
  // type: null should be undefined for StoriesQuery
  if (f.type == null || f.type === '') delete f.type
  // privacy: UI uses 'all'|'public'; StoriesQuery uses 'public'|'private' for mine; for public fetch, ignore privacy
  if (f.privacy === 'all') delete f.privacy
  return f
}
function showMorePublic() {
  const next = (publicStories.page.value || 1) + 1
  const f = normalizeFiltersForQuery(filters)
  publicStories.fetchPublic({ ...f, page: next })
}

const canShowMoreMine = computed(() => yourStories.hasMore.value)
function showMoreMine() {
  const next = (yourStories.page.value || 1) + 1
  const uid = userId.value
  if (!uid) return
  const f = normalizeFiltersForQuery(filters)
  yourStories.fetchMine(uid, { ...f, page: next })
}

// Filters state shared by both sections; UI default: privacy 'all', date 'newest'
const filters = reactive<StoryFiltersModel>({ search: '', type: null, privacy: 'all', date: 'newest' })

// Ensure parent updates the same reactive object instead of reassigning (works with :model-value/@update)
function onFiltersUpdate(next: StoryFiltersModel) {
  Object.assign(filters, next)
}

watch(
  () => ({ ...filters }),
  () => {
    const f = normalizeFiltersForQuery(filters)
    publicStories.fetchPublic({ ...f, page: 1 })
    if (authed.value) {
      const uid = userId.value
      if (uid) {
        yourStories.fetchMine(uid, { ...f, page: 1 })
      }
    }
  },
  { deep: true }
)

// Refetch when auth becomes ready or changes (robust to test mocks)
watch(
  [() => authReady.value, () => authed.value, () => userId.value],
  () => {
    if (!authReady.value) return
    const f = normalizeFiltersForQuery(filters)
    publicStories.fetchPublic({ ...f, page: 1 })
    const uid = userId.value
    if (authed.value && uid) {
      yourStories.fetchMine(uid, { ...f, page: 1 })
    }
  },
  { immediate: true }
)

onMounted(() => {
  const f = normalizeFiltersForQuery(filters)
  publicStories.fetchPublic({ ...f, page: 1 })
  if (authed.value) {
    const uid = userId.value
    if (uid) yourStories.fetchMine(uid, { ...f, page: 1 })
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Stories</h1>

    <!-- Prevent flicker until auth is hydrated -->
    <div v-if="!authReady" aria-hidden="true" class="h-8 mb-6"></div>
    <template v-else>
      <div class="mb-6">
        <!-- Replace v-model with explicit binding to avoid reassigning the reactive object -->
        <StoryFilters :model-value="filters" @update:modelValue="onFiltersUpdate" />
      </div>

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
        <div
          data-testid="guest-hero"
          class="mb-10 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 shadow-lg"
        >
          <div class="max-w-3xl mx-auto text-center space-y-3">
            <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Kickstart your next great story with AI
            </h2>
            <p class="text-white/90 text-lg">
              Propose characters, themes, and pivotal moments for a short story, movie summary,
              or TV commercial—and let AI draft compelling ideas to jump‑start your writing.
            </p>
            <p class="text-white/90">
              Save, share, and refine your favorites so you can find your next concept faster.
            </p>
            <div class="pt-2">
              <a href="#/auth" class="inline-flex items-center px-5 py-2.5 rounded-lg bg-white text-slate-900 font-medium hover:bg-white/90 transition">
                Get started free
              </a>
            </div>
          </div>
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
    </template>
  </div>
</template>
