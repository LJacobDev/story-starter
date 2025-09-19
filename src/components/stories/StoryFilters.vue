<template>
  <form class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end" @submit.prevent>
    <div class="flex flex-col">
      <Label for="search" class="text-sm font-medium mb-1">Search</Label>
      <Input
        id="search"
        data-testid="search-input"
        type="text"
        v-model="state.search"
        class="px-3 py-2"
        placeholder="Title, description, genre..."
        autocomplete="off"
      />
    </div>

    <div class="flex flex-col">
      <label for="type" class="text-sm font-medium mb-1">Type</label>
      <select id="type" data-testid="type-select" class="select select-bordered px-3 py-2 rounded border" :value="state.type ?? ''" @change="onType">
        <option value="">All types</option>
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
import { reactive, watch } from 'vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

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

// Debounce search via watch on state.search
let timer: number | undefined
watch(
  () => state.search,
  () => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      emit('update:modelValue', { ...state })
    }, 300)
  }
)

function onType(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  state.type = val === '' ? null : (val as any)
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
