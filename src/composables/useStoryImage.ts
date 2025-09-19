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
const BUCKET = STORY_IMAGES_BUCKET

// Simple in-memory cache for resolved URLs (bucket+path -> url)
const signedUrlCache = new Map<string, string>()

function detectBucketAndInner(input: string): { bucket: string; inner: string } {
  let s = input.replace(/^\/+/, '')
  if (s.startsWith('story-images/')) return { bucket: 'story-images', inner: s.slice('story-images/'.length) }
  if (s.startsWith('story-covers/')) return { bucket: 'story-covers', inner: s.slice('story-covers/'.length) }
  // No bucket prefix in path: use active bucket
  return { bucket: BUCKET, inner: s }
}

/**
 * Resolve a storage path (e.g., story-images/userId/storyId/file.jpg) or raw inner path
 * into a browser-displayable URL. If already an http/https URL, returns it.
 * Uses public URL when available, otherwise a signed URL (1h).
 */
export async function resolveImageUrl(input?: string | null): Promise<string | null> {
  if (!input) return null
  const raw = String(input).trim()
  if (/^https?:\/\//i.test(raw)) return raw

  const { bucket, inner } = detectBucketAndInner(raw)
  const cacheKey = `${bucket}/${inner}`
  const cached = signedUrlCache.get(cacheKey)
  if (cached) return cached

  try {
    // Try public url first (if bucket is public)
    const { data } = (supabase as any).storage.from(bucket).getPublicUrl(inner)
    const publicUrl = (data as any)?.publicUrl
    if (publicUrl && /^https?:\/\//i.test(publicUrl)) {
      signedUrlCache.set(cacheKey, publicUrl)
      return publicUrl
    }
  } catch {
    // ignore
  }

  try {
    const { data, error } = await (supabase as any).storage
      .from(bucket)
      .createSignedUrl(inner, 60 * 60)
    if (!error && (data as any)?.signedUrl) {
      const url = (data as any).signedUrl as string
      signedUrlCache.set(cacheKey, url)
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

  function fullPath(bucket: string, innerPath: string) {
    return `${bucket}/${innerPath}`
  }

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

    // Upload (upsert true so replace works across sessions)
    const { error: upErr } = await (supabase as any).storage.from(BUCKET).upload(inner, file, { upsert: true })
    if (upErr) {
      return { ok: false, error: { message: upErr.message || 'Upload failed', code: upErr.code } }
    }

    // Signed URL for immediate preview
    const { data: urlData, error: urlErr } = await (supabase as any).storage
      .from(BUCKET)
      .createSignedUrl(inner, 60 * 60)
    if (urlErr) {
      return { ok: false, error: { message: urlErr.message || 'Failed to create signed URL', code: urlErr.code } }
    }

    const signedUrl: string = (urlData as any)?.signedUrl || ''
    return { ok: true, url: signedUrl, path: fullPath(BUCKET, inner) }
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
