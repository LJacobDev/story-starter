<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <h1 class="text-3xl font-bold text-white mb-6">{{ msg }}</h1>

  <div class="bg-white/20 rounded-lg p-6 mb-6">
    <button 
      type="button" 
      @click="count++" 
      class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mb-4"
    >
      count is {{ count }}
    </button>
    <p class="text-gray-200">
      Edit
      <code class="bg-gray-700 text-green-400 px-2 py-1 rounded">components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p class="text-gray-300 mb-4">
    Check out
    <a 
      href="https://vuejs.org/guide/quick-start.html#local" 
      target="_blank"
      class="text-blue-400 hover:text-blue-300 underline transition-colors"
    >create-vue</a>, the official Vue + Vite starter
  </p>
  <p class="text-gray-300 mb-4">
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      class="text-blue-400 hover:text-blue-300 underline transition-colors"
    >Vue Docs Scaling up Guide</a>.
  </p>
  <p class="text-gray-400 text-sm">Click on the Vite and Vue logos to learn more</p>
</template>
