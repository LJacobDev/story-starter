<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()
</script>

<template>
  <div>
    <div class="text-center mb-8">
      <h2 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">
        <span v-if="isAuthenticated">Welcome back to Story Starter!</span>
        <span v-else>Welcome to Story Starter!</span>
      </h2>
      <p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        <span v-if="isAuthenticated">
          You're signed in and ready to create amazing stories with AI assistance.
        </span>
        <span v-else>
          Create amazing stories with AI assistance. Sign up to get started!
        </span>
      </p>
    </div>

    <!-- Feature Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">✍️</span>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">AI-Powered Writing</h3>
        <p class="text-slate-600 dark:text-slate-400">Generate unique stories using advanced AI technology</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">📚</span>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Story Library</h3>
        <p class="text-slate-600 dark:text-slate-400">Browse and discover stories from the community</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">🎭</span>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Multiple Formats</h3>
        <p class="text-slate-600 dark:text-slate-400">Create short stories, movie summaries, and more</p>
      </div>
    </div>

    <!-- CTA Button -->
    <div class="flex justify-center">
      <router-link
        v-if="!isAuthenticated"
        to="/auth"
        class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
      >
        Get Started Now
      </router-link>
      <div v-else class="space-x-4">
        <button 
          class="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          disabled
        >
          🎉 Ready to Create Stories! (Coming Soon)
        </button>
      </div>
    </div>
  </div>
</template>
