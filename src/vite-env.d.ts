/// <reference types="vite/client" />

// Allow importing .vue SFCs with proper typing
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
