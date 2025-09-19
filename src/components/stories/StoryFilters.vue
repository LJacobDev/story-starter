<template>
  <form class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end" @submit.prevent>
    <div class="flex flex-col">
      <label for="search" class="text-sm font-medium mb-1">Search</label>
      <input
        id="search"
        data-testid="search-input"
        type="text"
        class="input input-bordered px-3 py-2 rounded border"
        :value="state.search"
        @input="onSearchInput"
        placeholder="Title, description, genre..."
        autocomplete="off"
      />
    </div>

    <div class="flex flex-col">
      <label for="type" class="text-sm font-medium mb-1">Type</label>
      <select id="type" data-testid="type-select" class="select select-bordered px-3 py-2 rounded border" :value="state.type" @change="onType">
        <option :value="null">All types</option>
        <option value="short_story">Short story</option>
        <option value="movie_summary">Movie summary</option>
        <option value="tv_commercial">TV commercial</option>
      </select>
    </div>

    <div class="flex flex-col">
      <label for="privacy" class="text-sm font-medium mb-1">Privacy</label>
      <select id="privacy" data-testid="privacy-select" class="select select-bordered px-3 py-2 rounded border" :value="state.privacy" @change="onPrivacy">
        <option value="all">All</option>
        <option value="public">Public only</option>
      </select>
    </div>

    <div class="flex flex-col">
      <label for="date" class="text-sm font-medium mb-1">Date</label>
      <select id="date" data-testid="date-select" class="select select-bordered px-3 py-2 rounded border" :value="state.date" @change="onDate">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="last7">Last 7 days</option>
        <option value="last30">Last 30 days</option>
        <option value="all">All dates</option>
      </select>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

export interface StoryFiltersModel {
  search?: string
  type?: 'short_story' | 'movie_summary' | 'tv_commercial' | null
  privacy?: 'public' | 'all'
  date?: 'newest' | 'oldest' | 'last7' | 'last30' | 'all'
}

const props = defineProps<{ modelValue: StoryFiltersModel }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: StoryFiltersModel): void
}>()

const state = reactive<StoryFiltersModel>({
  search: props.modelValue?.search ?? '',
  type: props.modelValue?.type ?? null,
  privacy: props.modelValue?.privacy ?? 'all',
  date: props.modelValue?.date ?? 'newest'
})

let timer: number | undefined
function onSearchInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  state.search = val
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    emit('update:modelValue', { ...state })
  }, 300)
}

function onType(e: Event) {
  state.type = ((e.target as HTMLSelectElement).value || null) as any
  emit('update:modelValue', { ...state })
}

function onPrivacy(e: Event) {
  state.privacy = (e.target as HTMLSelectElement).value as any
  emit('update:modelValue', { ...state })
}

function onDate(e: Event) {
  state.date = (e.target as HTMLSelectElement).value as any
  emit('update:modelValue', { ...state })
}
</script>

<style scoped>
</style>
