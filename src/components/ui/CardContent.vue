<template>
  <div
    :class="cn('p-6 pt-0', props.class)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface CardContentProps {
  class?: string
}

const props = withDefaults(defineProps<CardContentProps>(), {})
</script>
