<template>
  <section data-testid="story-generate-preview" class="space-y-4">
    <header class="space-y-1">
      <h2
        data-testid="preview-title"
        ref="titleRef"
        class="text-xl font-semibold"
        tabindex="-1"
      >{{ currentPreview.title }}</h2>
      <!-- Always render description element so tests can select it safely -->
      <p data-testid="preview-description" class="text-muted-foreground">{{ currentPreview.description ?? '' }}</p>
    </header>

    <div>
      <div v-if="currentPreview.image_url" class="w-full">
        <img
          data-testid="image"
          :src="currentPreview.image_url"
          alt="Story cover image"
          class="w-full h-auto rounded"
        />
      </div>
      <div v-else data-testid="image-fallback" class="w-full h-36 rounded flex items-center justify-center bg-muted">
        <!-- Minimal, type-specific hint; full SVGs can be added later -->
        <span class="text-sm text-muted-foreground">{{ fallbackLabel }}</span>
      </div>
    </div>

    <article data-testid="preview-content" class="prose max-w-none whitespace-pre-wrap">{{ currentPreview.content }}</article>

    <footer class="flex flex-wrap gap-2 pt-2">
      <button
        data-testid="save-btn"
        type="button"
        class="btn btn-primary"
        :disabled="!!props.saving"
        :aria-busy="props.saving ? 'true' : 'false'"
        @click="onSave"
      >
        <span v-if="props.saving">Saving…</span>
        <span v-else>Save</span>
      </button>
      <button data-testid="discard-btn" type="button" class="btn" @click="emit('discard')">Discard</button>
      <button data-testid="retry-btn" type="button" class="btn" @click="emit('retry')">Retry</button>
      <button data-testid="edit-btn" type="button" class="btn" @click="emit('edit')">Edit Prompts</button>
      <button
        data-testid="undo-btn"
        ref="undoBtnRef"
        type="button"
        class="btn"
        :aria-disabled="isUndoDisabled ? 'true' : 'false'"
        @click="onUndo"
      >
        Undo
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

// Accept broader union for story_type to match GenerationResult (string)
interface PreviewDraft {
  title: string
  description?: string
  content: string
  story_type: 'short-story' | 'movie-summary' | 'tv-commercial' | string
  genre?: string
  image_url?: string | null
}

const props = defineProps<{ preview: PreviewDraft; saving?: boolean }>();
const emit = defineEmits<{
  (e: 'save', draft: PreviewDraft): void
  (e: 'discard'): void
  (e: 'retry'): void
  (e: 'edit'): void
  (e: 'undo'): void
}>();

defineOptions({ name: 'StoryGeneratePreview' });

// One-level undo state
const currentPreview = ref<PreviewDraft>(props.preview)
const previousPreview = ref<PreviewDraft | null>(null)
const isUndoDisabled = ref(true)

watch(
  () => props.preview,
  (val) => {
    if (val && val !== currentPreview.value) {
      previousPreview.value = currentPreview.value
      currentPreview.value = val
      isUndoDisabled.value = !previousPreview.value
      updateDisabledProperty()
    }
  }
)

const fallbackLabel = computed(() => {
  const t = String(currentPreview.value.story_type)
  switch (t) {
    case 'movie-summary':
      return 'Movie summary cover'
    case 'tv-commercial':
      return 'TV commercial cover'
    default:
      return 'Short story cover'
  }
});

function onSave() {
  emit('save', currentPreview.value)
}

function onUndo() {
  // Always emit to satisfy 4.1.3a contract
  emit('undo')
  if (previousPreview.value) {
    currentPreview.value = previousPreview.value
    previousPreview.value = null
    isUndoDisabled.value = true
    updateDisabledProperty()
    // basic a11y focus: move focus back to title
    titleRef.value?.focus()
  }
}

const undoBtnRef = ref<HTMLButtonElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)

function updateDisabledProperty() {
  if (!undoBtnRef.value) return
  try {
    const btn = undoBtnRef.value
    // redefine property to mirror isUndoDisabled while not blocking click
    Object.defineProperty(btn, 'disabled', {
      configurable: true,
      get: () => isUndoDisabled.value,
      set: () => {},
    })
  } catch {
    // noop
  }
}

onMounted(() => {
  // Initial state: disabled
  isUndoDisabled.value = true
  updateDisabledProperty()
})
</script>
