<template>
  <div class="min-h-[60vh] flex items-start md:items-center justify-center py-8 md:py-16">
    <div class="w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-2">Join Story Starter</h2>
      <p class="text-center text-sm text-muted-foreground mb-6">Sign in to your account or create a new one</p>
      <AuthContainer />
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthContainer from '@/components/AuthContainer.vue'
</script>

<style scoped>
</style>
