<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <!-- 🎨 TAILWIND TEST - Very Obvious Visual Indicators -->
  <div class="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-blue-700">
    <div class="container mx-auto px-4 py-8">
      <!-- Header with animated gradient text -->
      <div class="text-center mb-12">
        <h1 class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-pulse mb-4">
          🚀 TAILWIND CSS IS WORKING! 🎉
        </h1>
        <p class="text-2xl text-white font-semibold drop-shadow-lg">
          If you can see colorful gradients, animations, and styled elements, then Tailwind is 100% functional!
        </p>
      </div>

      <!-- Feature showcase grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <!-- Colors & Gradients -->
        <div class="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 hover:scale-105 transform transition-all duration-300">
          <div class="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 animate-spin"></div>
          <h3 class="text-xl font-bold text-white text-center">✅ Colors</h3>
          <p class="text-white/80 text-center mt-2">Gradients & Spinning Animation</p>
        </div>

        <!-- Typography & Spacing -->
        <div class="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 hover:scale-105 transform transition-all duration-300">
          <div class="text-4xl text-center mb-4">📝</div>
          <h3 class="text-xl font-bold text-white text-center">✅ Typography</h3>
          <p class="text-white/80 text-center mt-2">Fonts, Sizes & Spacing</p>
        </div>

        <!-- Layout & Effects -->
        <div class="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 hover:scale-105 transform transition-all duration-300">
          <div class="w-16 h-16 bg-yellow-400 rounded-lg mx-auto mb-4 shadow-lg animate-bounce"></div>
          <h3 class="text-xl font-bold text-white text-center">✅ Effects</h3>
          <p class="text-white/80 text-center mt-2">Shadows, Blur & Bounce</p>
        </div>
      </div>

      <!-- Status badges -->
      <div class="flex flex-wrap justify-center gap-4 mb-12">
        <span class="px-6 py-3 bg-green-500 text-white font-bold rounded-full text-lg shadow-lg animate-pulse">🟢 RESPONSIVE DESIGN</span>
        <span class="px-6 py-3 bg-blue-500 text-white font-bold rounded-full text-lg shadow-lg animate-pulse">🔵 MODERN CSS</span>
        <span class="px-6 py-3 bg-purple-500 text-white font-bold rounded-full text-lg shadow-lg animate-pulse">🟣 UTILITY CLASSES</span>
      </div>

      <!-- Original Vite + Vue content -->
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        <div class="flex justify-center gap-8 mb-8">
          <a href="https://vite.dev" target="_blank" class="hover:scale-110 transition-transform duration-300">
            <img src="/vite.svg" class="w-20 h-20 hover:drop-shadow-[0_0_2em_#646cffaa] transition-all duration-300" alt="Vite logo" />
          </a>
          <a href="https://vuejs.org/" target="_blank" class="hover:scale-110 transition-transform duration-300">
            <img src="./assets/vue.svg" class="w-20 h-20 hover:drop-shadow-[0_0_2em_#42b883aa] transition-all duration-300" alt="Vue logo" />
          </a>
        </div>
        <HelloWorld msg="Vite + Vue" />
      </div>
    </div>
  </div>
</template>
