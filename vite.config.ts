/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/story-starter/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    env: {
      VITE_SUPABASE_URL: 'http://localhost:3000',
      VITE_SUPABASE_KEY: 'test-key'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'postcss.config.js',
        'tailwind.config.js',
        'src/main.ts',
        'src/vite-env.d.ts',
        'src/types/**',
        'src/components/HelloWorld.vue'
      ],
      thresholds: { statements: 80, branches: 70, functions: 75, lines: 80 }
    }
  }
}))
