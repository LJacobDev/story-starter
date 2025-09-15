<template>
  <div
    :class="cn('rounded-xl border bg-card text-card-foreground shadow', props.class)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface CardProps {
  class?: string
}

const props = withDefaults(defineProps<CardProps>(), {})
</script>
