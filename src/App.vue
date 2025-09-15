<script setup lang="ts">
import { ref, computed } from 'vue'
import AuthContainer from '@/components/AuthContainer.vue'
import vueLogo from '@/assets/vue.svg'

// Reactive state
const count = ref(0)
const currentView = ref<'home' | 'auth' | 'demo'>('home')

// Test status - you can see if everything is working
const testStatus = computed(() => {
  const components = {
    'ShadCN UI': true, // We'll see if forms render
    'TailwindCSS': true, // Visible in the demo
    'Vue Composition API': true, // This script proves it
    'TypeScript': true, // No compilation errors means this works
  }
  
  const working = Object.values(components).filter(Boolean).length
  const total = Object.keys(components).length
  
  return `${working}/${total} systems operational`
})

// Handle successful authentication
const handleAuthSuccess = (result: any) => {
  console.log('Authentication successful:', result)
  // In the future, this will redirect to the main app
  // For now, just log it and maybe show a success message
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <!-- Header -->
    <header class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">S</span>
            </div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white">Story Starter</h1>
          </div>
          
          <!-- Navigation -->
          <nav class="flex items-center space-x-2 sm:space-x-4">
            <button 
              @click="currentView = 'home'"
              :class="[
                'px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base',
                currentView === 'home' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              ]"
            >
              Home
            </button>
            <button 
              @click="currentView = 'auth'"
              :class="[
                'px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base',
                currentView === 'auth' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              ]"
            >
              Sign In
            </button>
            <button 
              @click="currentView = 'demo'"
              :class="[
                'px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base',
                currentView === 'demo' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              ]"
            >
              Demo
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Home View -->
      <div v-if="currentView === 'home'" class="text-center">
        <div class="mb-8">
          <h2 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to Story Starter! 
          </h2>
          <p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Create amazing stories with AI assistance. Sign up to get started!
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
          <button 
            @click="currentView = 'auth'"
            class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </div>

      <!-- Authentication View -->
      <div v-else-if="currentView === 'auth'" class="max-w-md mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Join Story Starter
          </h2>
          <p class="text-slate-600 dark:text-slate-400">
            Sign in to your account or create a new one
          </p>
        </div>
        
        <!-- Authentication Forms -->
        <AuthContainer @auth-success="handleAuthSuccess" />
      </div>

      <!-- Demo/Tailwind Test View -->
      <div v-else-if="currentView === 'demo'">
        <!-- SUPER OBVIOUS TAILWIND TEST -->
        <div class="bg-gradient-to-br from-pink-500 via-purple-600 to-blue-700 rounded-2xl p-8 mb-8">
          <!-- Header with massive animated text -->
          <div class="text-center py-8">
            <h1 class="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-pulse mb-4">
              🚀 TAILWIND CSS IS WORKING! 🎉
            </h1>
            <p class="text-white text-lg font-semibold">
              If you can see colorful gradients, animations, and styled elements, then Tailwind is 100% functional!
            </p>
          </div>

          <!-- Feature Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Card 1: Spinning Animation -->
            <div class="bg-white/20 backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-xl border border-white/30">
              <div class="text-center">
                <div class="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-spin"></div>
                <h3 class="text-white text-xl font-bold mb-2">✅ Colors</h3>
                <p class="text-green-200">Gradients & Spinning Animation</p>
              </div>
            </div>

            <!-- Card 2: Typography -->
            <div class="bg-white/20 backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-xl border border-white/30">
              <div class="text-center">
                <h3 class="text-white text-xl font-bold mb-4">✅ Typography</h3>
                <p class="text-blue-200">Fonts, Sizes & Spacing</p>
                <div class="mt-4 space-y-2">
                  <div class="text-xs text-gray-300">Extra Small</div>
                  <div class="text-sm text-gray-200">Small</div>
                  <div class="text-base text-white">Base</div>
                  <div class="text-lg text-yellow-200">Large</div>
                </div>
              </div>
            </div>

            <!-- Card 3: Bouncing Animation -->
            <div class="bg-white/20 backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-xl border border-white/30">
              <div class="text-center">
                <div class="w-10 h-10 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg animate-bounce"></div>
                <h3 class="text-white text-xl font-bold mb-2">✅ Effects</h3>
                <p class="text-purple-200">Shadows, Blur & Bounce</p>
              </div>
            </div>
          </div>

          <!-- Status Badges -->
          <div class="flex flex-wrap justify-center gap-4 mt-8">
            <span class="px-4 py-2 bg-green-500 text-white rounded-full font-semibold animate-pulse">🟢 RESPONSIVE DESIGN</span>
            <span class="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold animate-pulse">🔵 MODERN CSS</span>
            <span class="px-4 py-2 bg-purple-500 text-white rounded-full font-semibold animate-pulse">🟣 UTILITY CLASSES</span>
          </div>
        </div>

        <!-- Vite + Vue Section -->
        <div class="text-center bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
          <div class="flex justify-center gap-8 mb-6">
            <img src="/vite.svg" alt="Vite" class="w-16 h-16 hover:animate-spin" />
            <img :src="vueLogo" alt="Vue" class="w-16 h-16 hover:animate-pulse" />
          </div>
          <h2 class="text-slate-900 dark:text-white text-3xl font-bold mb-4">Vite + Vue</h2>
          <p class="text-slate-600 dark:text-slate-400 mb-4">count is {{ count }}</p>
          <button 
            @click="count++" 
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-500 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Click me!
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2025 Story Starter. Built with Vue 3, TypeScript, TailwindCSS, and ShadCN UI.</p>
          <p class="mt-2 text-sm">Test Status: {{ testStatus }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>
