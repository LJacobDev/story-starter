import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router, { setupRouterGuards } from '@/router'
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

    // Build a canonical clean URL (prefer VITE_PUBLIC_URL when available)
    const publicBase = (import.meta.env.VITE_PUBLIC_URL as string | undefined) || `${window.location.origin}${import.meta.env.BASE_URL ?? '/'}`
    // Ensure there is a single slash before the hash so the URL becomes '/#/' rather than '#'
    const baseNoSlash = publicBase.replace(/\/$/, '')
    const cleanUrl = baseNoSlash + '/#/verify-email'

    // Replace the history entry immediately to remove tokens from the address bar
    try {
      history.replaceState(null, '', cleanUrl)
    } catch (_e) {
      // ignore
    }

    // Defensive: also set the hash directly (some browsers may not update immediately)
    try { window.location.hash = '#/verify-email' } catch (_e) {}

    // Short delayed cleanup to handle race conditions (e.g., new window opened before cleanup)
    setTimeout(() => {
      try {
        const href = location.href
        if (href.includes('access_token') || (window.location.hash || '').includes('access_token')) {
          history.replaceState(null, '', cleanUrl)
          try { window.location.hash = '#/verify-email' } catch (_e) {}
        }
      } catch (_e) {
        // ignore
      }
    }, 350)
  } catch (e) {
    // ignore — app will render unauthenticated
    console.debug('session restore failed', e)
  }
}

// restore session if tokens present before mounting the app
void restoreSessionFromHash().then(() => {
  // install router guards
  try { setupRouterGuards(router) } catch (e) { console.warn('failed to setup router guards', e) }
  createApp(App).use(router).mount('#app')
})
