import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/router'
import { supabase } from '@/lib/supabase'

// parse fragment (handles cases like /#/verify-email#access_token=... or /#access_token=...)
function parseHashParams() {
  let fragment = window.location.hash || ''
  if (fragment.startsWith('#')) fragment = fragment.slice(1)
  const second = fragment.indexOf('#')
  if (second !== -1) fragment = fragment.slice(second + 1)
  if (fragment.startsWith('/')) fragment = fragment.slice(1)
  return Object.fromEntries(new URLSearchParams(fragment))
}

async function restoreSessionFromHash() {
  try {
    const params = parseHashParams() as any
    const access_token = params['access_token']
    const refresh_token = params['refresh_token']
    if (!access_token) return

    const authAny = (supabase as any).auth
    if (authAny && typeof authAny.setSession === 'function') {
      // supabase-js v2
      await authAny.setSession({ access_token, refresh_token })
    } else if (authAny && typeof authAny.setAuth === 'function') {
      // fallback for older clients
      authAny.setAuth(access_token)
    } else {
      localStorage.setItem('sb-access-token', access_token)
      if (refresh_token) localStorage.setItem('sb-refresh-token', refresh_token)
    }

    // remove tokens from URL for security
    const clean = window.location.pathname + window.location.search + '#'
    history.replaceState(null, '', clean)
  } catch (e) {
    // ignore — app will render unauthenticated
    console.debug('session restore failed', e)
  }
}

// restore session if tokens present before mounting the app
void restoreSessionFromHash().then(() => {
  createApp(App).use(router).mount('#app')
})
