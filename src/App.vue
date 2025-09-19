<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AuthContainer from '@/components/AuthContainer.vue'
import vueLogo from '@/assets/vue.svg'

// Authentication
const { user, isAuthenticated, signOut } = useAuth()


// Reactive state used when router is not present
const count = ref(0)
const currentView = ref<'home' | 'auth' | 'demo'>('home')

// Detect router availability via app context
const instance = getCurrentInstance()
const hasRouter = !!instance?.appContext.config.globalProperties.$router

// Only access router if installed
const router = hasRouter ? useRouter() : null

// Helpers that work whether or not the router exists
async function navigateTo(path: string) {
  if (hasRouter && router) {
    await router.push(path)
  } else {
    // fallback to internal view switching used in tests
    if (path === '/' || path === '/home') currentView.value = 'home'
    if (path === '/auth') currentView.value = 'auth'
    if (path === '/demo') currentView.value = 'demo'
  }
}

// Handle successful authentication (redirect to home)
const handleAuthSuccess = async () => {
  await navigateTo('/')
}

// Handle sign out
const handleSignOut = async () => {
  try {
    const result = await signOut()
    if (result.success) {
      await navigateTo('/')
    } else {
      console.error('Sign out failed:', result.error)
    }
  } catch (error) {
    console.error('Sign out error:', error)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <!-- Header -->
    <header class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <a href="#/" class="flex items-center space-x-3 group" @click.prevent="() => navigateTo('/')" aria-label="Go to Home" role="link">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition">
              <span class="text-white font-bold text-sm">S</span>
            </div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white group-hover:opacity-90">Story Starter</h1>
          </a>

          <!-- Navigation -->
          <nav class="flex items-center space-x-2 sm:space-x-4">
            <template v-if="hasRouter">
              <router-link 
                to="/" 
                class="px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >Home</router-link>

              <router-link 
                v-if="!isAuthenticated" 
                to="/auth"
                class="px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >Sign In</router-link>

              <div v-else class="flex items-center space-x-2">
                <span class="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline">
                  Welcome, {{ user?.email?.split('@')[0] }}!
                </span>
                <button 
                  @click="handleSignOut"
                  class="px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                >Sign Out</button>
              </div>

              <router-link 
                to="/demo"
                class="px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >Demo</router-link>
            </template>
            <template v-else>
              <button 
                @click="() => navigateTo('/')"
                class="px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >Home</button>
              <button 
                v-if="!isAuthenticated"
                @click="() => navigateTo('/auth')"
                class="px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >Sign In</button>
              <div v-else class="flex items-center space-x-2">
                <span class="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline">
                  Welcome, {{ user?.email?.split('@')[0] }}!
                </span>
                <button 
                  @click="handleSignOut"
                  class="px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                >Sign Out</button>
              </div>
              <button 
                @click="() => navigateTo('/demo')"
                class="px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >Demo</button>
            </template>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- If router is available, render routed views. Otherwise fallback to internal view rendering for tests -->
      <div v-if="hasRouter">
        <router-view />
      </div>

      <div v-else>
        <!-- Home View -->
        <div v-if="currentView === 'home'" class="text-center">
          <div class="mb-8">
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
            <button 
              v-if="!isAuthenticated"
              @click="() => navigateTo('/auth')"
              class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Get Started Now
            </button>
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

        <!-- Demo/Tailwind Test View (restored for tests and exploration) -->
        <div v-else-if="currentView === 'demo'">
          <div class="bg-gradient-to-br from-pink-500 via-purple-600 to-blue-700 rounded-2xl p-8 mb-8">
            <div class="text-center py-8">
              <h1 class="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-pulse mb-4">
                🚀 TAILWIND CSS IS WORKING! 🎉
              </h1>
              <p class="text-white text-lg font-semibold">
                If you can see colorful gradients, animations, and styled elements, then Tailwind is 100% functional!
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white/20 backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-xl border border-white/30">
                <div class="text-center">
                  <div class="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-spin"></div>
                  <h3 class="text-white text-xl font-bold mb-2">✅ Colors</h3>
                  <p class="text-green-200">Gradients & Spinning Animation</p>
                </div>
              </div>

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

              <div class="bg-white/20 backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-xl border border-white/30">
                <div class="text-center">
                  <div class="w-10 h-10 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg animate-bounce"></div>
                  <h3 class="text-white text-xl font-bold mb-2">✅ Effects</h3>
                  <p class="text-purple-200">Shadows, Blur & Bounce</p>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap justify-center gap-4 mt-8">
              <span class="px-4 py-2 bg-green-500 text-white rounded-full font-semibold animate-pulse">🟢 RESPONSIVE DESIGN</span>
              <span class="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold animate-pulse">🔵 MODERN CSS</span>
              <span class="px-4 py-2 bg-purple-500 text-white rounded-full font-semibold animate-pulse">🟣 UTILITY CLASSES</span>
            </div>
          </div>

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
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2025 Story Starter. Built with Vue 3, TypeScript, TailwindCSS, and ShadCN UI.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
