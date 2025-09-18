<script setup lang="ts">
import { ref } from 'vue'
import vueLogo from '@/assets/vue.svg'
const count = ref(0)
</script>

<template>
  <div>
    <!-- SUPER OBVIOUS TAILWIND TEST -->
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
</template>
