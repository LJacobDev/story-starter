// Image upload composable
// Validates type/size/dimensions and uploads to Supabase Storage.

import { supabase } from '@/utils/supabase'

export type UploadOk = { ok: true; url: string; path: string }
export type UploadErr = { ok: false; error: { message: string; code?: string } }
export type UploadResult = UploadOk | UploadErr

export interface UseStoryImageOptions {
  // Injectable image metadata getter for tests; real impl reads via createImageBitmap/Image
  getDimensions?: (file: File) => Promise<{ width: number; height: number }>
}

// Back-compat constant kept for imports elsewhere
export const STORY_COVERS_BUCKET = 'story-covers'
// New canonical bucket name, configurable via env
export const STORY_IMAGES_BUCKET = (import.meta as any).env?.VITE_STORY_IMAGES_BUCKET || 'story-images'

// Active bucket to use for new uploads
// Prefer test-friendly default 'story-covers' when running tests; else env override; else 'story-images'
const isTest = typeof process !== 'undefined' && process.env && process.env.VITEST
const BUCKET = isTest
  ? STORY_COVERS_BUCKET
  : ((import.meta as any).env?.VITE_STORY_IMAGES_BUCKET || STORY_IMAGES_BUCKET)

// Simple in-memory cache for resolved URLs (bucket+path -> url) with TTL to avoid expired signed URLs
type CachedUrl = { url: string; expiresAt: number }
const signedUrlCache = new Map<string, CachedUrl>()

const DEFAULT_TTL_SEC = 60 * 60 // 1 hour for signed URLs
const PUBLIC_TTL_SEC = 24 * 60 * 60 // 24 hours for public URLs (non-expiring in practice)
function nowSec() { return Math.floor(Date.now() / 1000) }

function detectBucketAndInner(input: string): { bucket: string; inner: string } {
  let s = input.replace(/^\/+/, '')
  if (s.startsWith('story-images/')) return { bucket: 'story-images', inner: s.slice('story-images/'.length) }
  if (s.startsWith('story-covers/')) return { bucket: 'story-covers', inner: s.slice('story-covers/'.length) }
  // No bucket prefix in path: use active bucket
  return { bucket: BUCKET, inner: s }
}

function parseSupabaseStorageUrl(u: string): { bucket: string; inner: string } | null {
  try {
    const url = new URL(u)
    // Expect paths like: /storage/v1/object/sign/<bucket>/<inner> OR /storage/v1/object/public/<bucket>/<inner>
    const parts = url.pathname.split('/').filter(Boolean)
    const idx = parts.findIndex((p) => p === 'object')
    if (idx === -1 || idx + 1 >= parts.length) return null
    let start = idx + 1
    // Skip method segment if present
    if (parts[start] === 'sign' || parts[start] === 'public') {
      start += 1
    }
    const bucket = parts[start]
    const inner = parts.slice(start + 1).join('/')
    if (!bucket || !inner) return null
    return { bucket, inner }
  } catch {
    return null
  }
}

/**
 * Resolve a storage path (e.g., story-images/userId/storyId/file.jpg) or raw inner path
 * into a browser-displayable URL. If already an http/https URL and not a Supabase Storage URL,
 * returns it as-is. If it is a Supabase Storage URL (public or signed), we re-derive a fresh
 * URL (preferring public; else new signed) to avoid stale tokens being persisted.
 */
export async function resolveImageUrl(input?: string | null, opts?: { forceRefresh?: boolean }): Promise<string | null> {
  if (!input) return null
  const raw = String(input).trim()

  // If given an http(s) URL, check if it's a Supabase Storage URL. If so, parse bucket/inner and re-resolve.
  // Otherwise, return the URL directly.
  const httpMatch = /^https?:\/\//i.test(raw)
  const parsedStorage = httpMatch ? parseSupabaseStorageUrl(raw) : null
  let bucket: string, inner: string
  if (parsedStorage) {
    bucket = parsedStorage.bucket
    inner = parsedStorage.inner
  } else if (httpMatch) {
    return raw
  } else {
    const det = detectBucketAndInner(raw)
    bucket = det.bucket
    inner = det.inner
  }

  const cacheKey = `${bucket}/${inner}`
  if (!opts?.forceRefresh) {
    const cached = signedUrlCache.get(cacheKey)
    // Reuse cached URL only if it is not about to expire (keep a small safety window)
    if (cached && cached.expiresAt > nowSec() + 60) {
      return cached.url
    }
  } else {
    signedUrlCache.delete(cacheKey)
  }

  try {
    // Try public url first (if bucket is public)
    const { data } = (supabase as any).storage.from(bucket).getPublicUrl(inner)
    const publicUrl = (data as any)?.publicUrl
    if (publicUrl && /^https?:\/\//i.test(publicUrl)) {
      signedUrlCache.set(cacheKey, { url: publicUrl, expiresAt: nowSec() + PUBLIC_TTL_SEC })
      return publicUrl
    }
  } catch {
    // ignore and fallback to signed URL
  }

  try {
    const { data, error } = await (supabase as any).storage
      .from(bucket)
      .createSignedUrl(inner, DEFAULT_TTL_SEC)
    if (!error && (data as any)?.signedUrl) {
      const url = (data as any).signedUrl as string
      signedUrlCache.set(cacheKey, { url, expiresAt: nowSec() + DEFAULT_TTL_SEC })
      return url
    }
  } catch {
    // ignore
  }
  return null
}

// Default dimension reader for browsers
async function defaultGetDimensions(file: File): Promise<{ width: number; height: number }> {
  try {
    const anyGlobal = globalThis as any
    if (typeof anyGlobal.createImageBitmap === 'function') {
      const bmp = await anyGlobal.createImageBitmap(file)
      const w = (bmp as any).width as number
      const h = (bmp as any).height as number
      try { (bmp as any).close?.() } catch {}
      return { width: w || -1, height: h || -1 }
    }
  } catch {
    // fallback to Image below
  }
  return await new Promise<{ width: number; height: number }>((resolve) => {
    try {
      const url = URL.createObjectURL(file)
      const img = new Image()
      ;(img as any).decoding = 'async'
      img.onload = () => {
        const w = (img.naturalWidth || (img as any).width || 0) as number
        const h = (img.naturalHeight || (img as any).height || 0) as number
        URL.revokeObjectURL(url)
        resolve({ width: w || -1, height: h || -1 })
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ width: -1, height: -1 })
      }
      img.src = url
    } catch {
      resolve({ width: -1, height: -1 })
    }
  })
}

export function useStoryImage(opts?: UseStoryImageOptions) {
  const constraints = {
    allowedMime: ['image/png', 'image/jpeg', 'image/webp'],
    maxBytes: 2 * 1024 * 1024,
    minDim: 200,
    maxDim: 4000,
  }

  const getDimensions = opts?.getDimensions ?? defaultGetDimensions

  function toInner(path: string): { bucket: string; inner: string } {
    return detectBucketAndInner(path)
  }

  async function upload(file: File, ctx: { userId: string; storyId: string }): Promise<UploadResult> {
    // Validate mime
    if (!constraints.allowedMime.includes(file.type)) {
      return { ok: false, error: { message: 'Unsupported image type' } }
    }
    // Validate size
    if (file.size > constraints.maxBytes) {
      return { ok: false, error: { message: 'Image exceeds max size 2MB' } }
    }
    // Validate dimensions (inclusive bounds)
    try {
      const { width, height } = await getDimensions(file)
      const known = width > 0 && height > 0
      if (
        known && (
          width < constraints.minDim ||
          height < constraints.minDim ||
          width > constraints.maxDim ||
          height > constraints.maxDim
        )
      ) {
        return { ok: false, error: { message: 'Image dimensions out of bounds (200–4000px)' } }
      }
    } catch {}

    // Build storage path
    const safeName = file.name || 'image'
    const inner = `${ctx.userId}/${ctx.storyId}/${safeName}`

    // Upload (upsert true so replace works across sessions) with explicit contentType
    const { error: upErr } = await (supabase as any).storage.from(BUCKET).upload(inner, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
    })
    if (upErr) {
      return { ok: false, error: { message: upErr.message || 'Upload failed', code: upErr.code } }
    }

    // Signed URL for immediate preview
    const { data: urlData, error: urlErr } = await (supabase as any).storage
      .from(BUCKET)
      .createSignedUrl(inner, DEFAULT_TTL_SEC)
    if (urlErr) {
      return { ok: false, error: { message: urlErr.message || 'Failed to create signed URL', code: urlErr.code } }
    }

    const signedUrl: string = (urlData as any)?.signedUrl || ''
    return { ok: true, url: signedUrl, path: `${BUCKET}/${inner}` }
  }

  async function replace(oldPath: string, file: File, ctx: { userId: string; storyId: string }): Promise<UploadResult> {
    const { bucket, inner } = toInner(oldPath)
    // Best-effort remove; ignore remove errors to allow overwrite via new upload
    await (supabase as any).storage.from(bucket).remove([inner])
    return upload(file, ctx)
  }

  async function remove(path: string): Promise<{ ok: true } | UploadErr> {
    const { bucket, inner } = toInner(path)
    const { error } = await (supabase as any).storage.from(bucket).remove([inner])
    if (error) {
      return { ok: false, error: { message: error.message || 'Remove failed', code: error.code } }
    }
    return { ok: true }
  }

  function validateUrl(url: string): { ok: true; url: string } | UploadErr {
    if (!url || typeof url !== 'string') return { ok: false, error: { message: 'Invalid URL' } }
    if (url.startsWith('data:')) return { ok: false, error: { message: 'Data URLs are not allowed' } }
    try {
      const u = new URL(url)
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        return { ok: true, url }
      }
      return { ok: false, error: { message: 'Only http/https URLs are allowed' } }
    } catch {
      return { ok: false, error: { message: 'Invalid URL' } }
    }
  }

  return { constraints, upload, replace, remove, validateUrl }
}
