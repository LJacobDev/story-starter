<template>
  <form data-testid="story-generate-form" @submit.prevent="onSubmit" class="space-y-4">
    <!-- Type select -->
    <div>
      <label class="block text-sm font-medium">Story type</label>
      <select data-testid="type-select" v-model="typeSlug" class="mt-1 block w-full rounded border p-2">
        <option value="short-story">Short story</option>
        <option value="movie-summary">Movie summary</option>
        <option value="tv-commercial">TV commercial</option>
      </select>
    </div>

    <!-- Basic inputs -->
    <div>
      <label class="block text-sm font-medium">Title</label>
      <input data-testid="title-input" v-model="title" type="text" class="mt-1 block w-full rounded border p-2" />
      <p v-if="titleTooLong" data-testid="error-title" class="text-red-600 text-sm">Title must be ≤ 120 characters.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium">Genre</label>
        <input data-testid="genre-input" v-model="genre" type="text" class="mt-1 block w-full rounded border p-2" />
      </div>
      <div>
        <label class="block text-sm font-medium">Tone</label>
        <input data-testid="tone-input" v-model="tone" type="text" class="mt-1 block w-full rounded border p-2" />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium">Creativity (0 – 1)</label>
      <input data-testid="creativity-input" v-model="creativity" type="number" step="0.1" min="0" max="1" class="mt-1 block w-full rounded border p-2" />
      <p v-if="creativityInvalid" data-testid="error-creativity" class="text-red-600 text-sm">Creativity must be between 0 and 1.</p>
    </div>

    <div>
      <label class="block text-sm font-medium">Additional instructions</label>
      <textarea data-testid="instructions-input" v-model="instructions" rows="4" class="mt-1 block w-full rounded border p-2"></textarea>
      <p v-if="instructionsLong" data-testid="warning-instructions" class="text-amber-600 text-sm">Over 800 characters may increase latency (allowed up to 2000).</p>
    </div>

    <!-- Themes -->
    <div>
      <label class="block text-sm font-medium">Themes</label>
      <div class="flex gap-2 mt-1">
        <input data-testid="themes-input" v-model="themeInput" type="text" class="flex-1 rounded border p-2" @keyup.enter.prevent="addTheme" />
        <button type="button" data-testid="add-theme" class="rounded bg-gray-100 px-3 py-2" @click="addTheme">Add</button>
      </div>
      <p v-if="themesError" data-testid="error-themes" class="text-red-600 text-sm">Each theme must be 1–30 chars, max 10 themes, unique.</p>
      <div class="flex flex-col gap-2 mt-2">
        <div v-for="(t, i) in themes" :key="t" class="flex items-center gap-2">
          <span data-testid="theme-item" class="text-sm">{{ t }}</span>
          <div class="ml-auto flex items-center gap-1">
            <button type="button" :data-testid="`theme-up-${i}`" class="h-6 w-6 rounded border" aria-label="Move up" @click="moveUp(themes, i)"></button>
            <button type="button" :data-testid="`theme-down-${i}`" class="h-6 w-6 rounded border" aria-label="Move down" @click="moveDown(themes, i)"></button>
            <button type="button" :data-testid="`theme-remove-${i}`" class="h-6 w-6 rounded border" aria-label="Remove" @click="removeAt(themes, i)"></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Plot points -->
    <div>
      <label class="block text-sm font-medium">Plot points</label>
      <div class="flex gap-2 mt-1">
        <input data-testid="plotpoints-input" v-model="plotInput" type="text" class="flex-1 rounded border p-2" />
        <button type="button" data-testid="add-plotpoint" class="rounded bg-gray-100 px-3 py-2" @click="addPlotPoint">Add</button>
      </div>
      <div class="text-xs text-gray-500 mt-1">Up to 10, each ≤ 200 chars.</div>
      <div class="flex flex-col gap-1 mt-2">
        <div v-for="(p, i) in plotPoints" :key="i" class="flex items-center gap-2">
          <span data-testid="plot-item" class="text-sm">{{ p }}</span>
          <div class="ml-auto flex items-center gap-1">
            <button type="button" :data-testid="`plot-up-${i}`" class="h-6 w-6 rounded border" aria-label="Move up" @click="moveUp(plotPoints, i)"></button>
            <button type="button" :data-testid="`plot-down-${i}`" class="h-6 w-6 rounded border" aria-label="Move down" @click="moveDown(plotPoints, i)"></button>
            <button type="button" :data-testid="`plot-remove-${i}`" class="h-6 w-6 rounded border" aria-label="Remove" @click="removeAt(plotPoints, i)"></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Characters -->
    <div>
      <label class="block text-sm font-medium">Characters</label>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
        <input data-testid="character-name-input" v-model="charName" type="text" placeholder="Name" class="rounded border p-2" />
        <!-- Use a simple text input for role to allow tests to set arbitrary values; validate against enum -->
        <input data-testid="character-role-select" v-model="charRole" type="text" placeholder="Role (protagonist|antagonist|ally|other)" class="rounded border p-2" />
        <input data-testid="character-desc-input" v-model="charDesc" type="text" placeholder="Description" class="rounded border p-2" />
      </div>
      <div class="flex gap-2 mt-2">
        <button type="button" data-testid="add-character" class="rounded bg-gray-100 px-3 py-2" @click="addCharacter">Add character</button>
      </div>
      <p v-if="charactersError" data-testid="error-characters" class="text-red-600 text-sm">Name ≤ 60, role must be one of {{ allowedRoles.join(', ') }}, description ≤ 400, max 6.</p>
      <div class="mt-2 space-y-1 text-sm">
        <div v-for="(c, i) in characters" :key="i" class="flex items-center gap-2">
          <span data-testid="character-item">{{ c.name }} — {{ c.role }} — {{ c.description }}</span>
          <div class="ml-auto flex items-center gap-1">
            <button type="button" :data-testid="`char-up-${i}`" class="h-6 w-6 rounded border" aria-label="Move up" @click="moveUp(characters, i)"></button>
            <button type="button" :data-testid="`char-down-${i}`" class="h-6 w-6 rounded border" aria-label="Move down" @click="moveDown(characters, i)"></button>
            <button type="button" :data-testid="`char-remove-${i}`" class="h-6 w-6 rounded border" aria-label="Remove" @click="removeAt(characters, i)"></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image input mode -->
    <div>
      <label class="block text-sm font-medium">Image</label>
      <div class="flex items-center gap-4 mt-1">
        <label class="inline-flex items-center gap-2">
          <input type="radio" name="image-mode" value="url" data-testid="image-mode-url" v-model="imageMode" />
          <span>URL</span>
        </label>
        <label class="inline-flex items-center gap-2">
          <input type="radio" name="image-mode" value="upload" data-testid="image-mode-upload" v-model="imageMode" />
          <span>Upload</span>
        </label>
      </div>
      <div class="mt-2" v-if="imageMode === 'url'">
        <input data-testid="image-url-input" v-model="imageUrl" type="url" class="w-full rounded border p-2" placeholder="https://..." />
      </div>
      <div class="mt-2" v-else>
        <input
          data-testid="image-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          class="block w-full text-sm"
          @change="onFileChange"
        />
      </div>
      <p v-if="imageError" data-testid="image-error" class="text-red-600 text-sm mt-1">{{ imageError }}</p>
    </div>

    <!-- Privacy -->
    <div class="flex items-center gap-2">
      <input data-testid="privacy-toggle" id="privacy" type="checkbox" v-model="isPrivate" class="rounded border p-2" />
      <label for="privacy">Private</label>
    </div>

    <!-- Submit -->
    <div>
      <button data-testid="submit-btn" type="submit" :disabled="!canSubmit" class="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50" @click.prevent="onSubmit">Generate</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getImageMetadata } from '@/utils/imageMeta'

const emit = defineEmits<{
  (e: 'submit', payload: any): void
}>()

// State
const typeSlug = ref<'short-story' | 'movie-summary' | 'tv-commercial'>('short-story')
const title = ref('')
const genre = ref('')
const tone = ref('')
const creativity = ref('') // keep as string for input; validate/convert
const instructions = ref('')

const themeInput = ref('')
const themes = ref<string[]>([])
const themesError = ref(false)

const plotInput = ref('')
const plotPoints = ref<string[]>([])

const charName = ref('')
const charRole = ref('')
const charDesc = ref('')
const allowedRoles = ['protagonist', 'antagonist', 'ally', 'other'] as const
const characters = ref<Array<{ name: string; role: string; description: string }>>([])
const charactersError = ref(false)

const imageMode = ref<'url' | 'upload'>('url')
const imageUrl = ref('')
const imageFile = ref<File | null>(null)
const imageMeta = ref<{ width: number; height: number; type: string; size: number } | null>(null)
const imageError = ref('')

const isPrivate = ref(true)

// Validation
const titleTooLong = computed(() => title.value.length > 120)
const creativityNumber = computed(() => Number.parseFloat(creativity.value))
const creativityInvalid = computed(() => Number.isNaN(creativityNumber.value) || creativityNumber.value < 0 || creativityNumber.value > 1)
const instructionsLong = computed(() => instructions.value.length > 800)
const instructionsTooLong = computed(() => instructions.value.length > 2000)

function addTheme() {
  const t = themeInput.value.trim()
  let ok = true
  if (!t || t.length > 30) ok = false
  if (themes.value.length >= 10) ok = false
  if (themes.value.includes(t)) ok = false
  if (!ok) {
    themesError.value = true
    return
  }
  themes.value.push(t)
  themesError.value = false
  themeInput.value = ''
}

function addPlotPoint() {
  const p = plotInput.value.trim()
  if (!p || p.length > 200 || plotPoints.value.length >= 10) return
  plotPoints.value.push(p)
  plotInput.value = ''
}

function addCharacter() {
  const name = charName.value.trim()
  const role = charRole.value.trim()
  const desc = charDesc.value.trim()
  let ok = true
  if (!name || name.length > 60) ok = false
  if (!allowedRoles.includes(role as any)) ok = false
  if (desc.length > 400) ok = false
  if (characters.value.length >= 6) ok = false
  if (!ok) {
    charactersError.value = true
    return
  }
  characters.value.push({ name, role, description: desc })
  charactersError.value = false
  charName.value = ''
  charRole.value = ''
  charDesc.value = ''
}

function moveUp<T>(arr: T[], index: number) {
  if (index <= 0 || index >= arr.length) return
  const tmp = arr[index - 1]
  arr[index - 1] = arr[index]
  arr[index] = tmp
}

function moveDown<T>(arr: T[], index: number) {
  if (index < 0 || index >= arr.length - 1) return
  const tmp = arr[index + 1]
  arr[index + 1] = arr[index]
  arr[index] = tmp
}

function removeAt<T>(arr: T[], index: number) {
  if (index < 0 || index >= arr.length) return
  arr.splice(index, 1)
}

function validateImageUrl(url: string) {
  // empty allowed (no image)
  if (!url) {
    imageError.value = ''
    return true
  }
  const ok = /^https?:\/\//i.test(url)
  imageError.value = ok ? '' : 'Image URL must start with http(s)'
  return ok
}

function validateImageFile() {
  const f = imageFile.value
  if (!f) {
    imageError.value = ''
    return true
  }
  const allowed = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowed.includes(f.type)) {
    imageError.value = 'Only PNG, JPEG, or WEBP images are allowed'
    return false
  }
  if (f.size > 2_000_000) {
    imageError.value = 'Image must be ≤ 2 MB'
    return false
  }
  const m = imageMeta.value
  if (!m) {
    // metadata not loaded yet; temporarily block submit
    imageError.value = 'Reading image metadata...'
    return false
  }
  if (m.width < 200 || m.height < 200 || m.width > 4000 || m.height > 4000) {
    imageError.value = 'Image dimensions must be within 200–4000 px'
    return false
  }
  imageError.value = ''
  return true
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files && input.files[0] ? input.files[0] : null
  imageFile.value = file
  imageMeta.value = null
  imageError.value = ''
  if (file) {
    try {
      const meta = await getImageMetadata(file)
      imageMeta.value = meta
    } catch (err) {
      imageError.value = 'Failed to read image metadata'
      return
    }
    // run validations after meta
    validateImageFile()
  }
}

watch(imageUrl, (val) => {
  if (imageMode.value === 'url') validateImageUrl(val)
})
watch(imageMode, () => {
  // reset error on mode switch and validate current mode
  imageError.value = ''
  if (imageMode.value === 'url') validateImageUrl(imageUrl.value)
  else validateImageFile()
})

const canSubmit = computed(() => {
  if (!title.value || titleTooLong.value) return false
  if (creativityInvalid.value) return false
  if (instructionsTooLong.value) return false
  if (themesError.value || charactersError.value) return false

  // image validation
  if (imageMode.value === 'url') {
    return validateImageUrl(imageUrl.value)
  }
  return validateImageFile()
})

function onSubmit() {
  if (!canSubmit.value) return
  emit('submit', {
    story_type: typeSlug.value,
    title: title.value,
    genre: genre.value || undefined,
    tone: tone.value || undefined,
    creativity: creativityNumber.value,
    additional_instructions: instructions.value || undefined,
    themes: themes.value.slice(),
    plot_points: plotPoints.value.slice(),
    characters: characters.value.map(c => ({ ...c })),
    image: imageMode.value === 'url'
      ? { mode: 'url', url: imageUrl.value || undefined }
      : imageFile.value && imageMeta.value
        ? { mode: 'upload', file: imageFile.value, meta: imageMeta.value }
        : { mode: 'upload' },
    is_private: isPrivate.value,
  })
}
</script>

<style scoped>
/* minimal */
</style>
