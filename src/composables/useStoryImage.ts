// Image upload composable
// Validates type/size/dimensions and uploads to Supabase Storage.

import { supabase } from '@/utils/supabase'

export type UploadOk = { ok: true; url: string; path: string }
export type UploadErr = { ok: false; error: { message: string; code?: string } }
export type UploadResult = UploadOk | UploadErr

export interface UseStoryImageOptions {
  // Injectable image metadata getter for tests; real impl can read via ImageBitmap or HTMLImage
  getDimensions?: (file: File) => Promise<{ width: number; height: number }>
}

const BUCKET = 'story-covers'

export function useStoryImage(opts?: UseStoryImageOptions) {
  const constraints = {
    allowedMime: ['image/png', 'image/jpeg', 'image/webp'],
    maxBytes: 2 * 1024 * 1024,
    minDim: 200,
    maxDim: 4000,
  }

  const getDimensions = opts?.getDimensions ?? (async (_file: File) => {
    // Fallback: unknown dimensions; force caller to inject in tests
    return { width: 0, height: 0 }
  })

  function fullPath(innerPath: string) {
    return `${BUCKET}/${innerPath}`
  }

  function toInnerPath(path: string) {
    return path.startsWith(`${BUCKET}/`) ? path.substring(BUCKET.length + 1) : path
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
    // Validate dimensions
    try {
      const { width, height } = await getDimensions(file)
      if (
        width < constraints.minDim ||
        height < constraints.minDim ||
        width > constraints.maxDim ||
        height > constraints.maxDim
      ) {
        return { ok: false, error: { message: 'Image dimensions out of bounds' } }
      }
    } catch (e: any) {
      return { ok: false, error: { message: e?.message || 'Unable to read image dimensions' } }
    }

    // Build storage path
    const safeName = file.name || 'image'
    const inner = `${ctx.userId}/${ctx.storyId}/${safeName}`

    // Upload
    const { error: upErr } = await (supabase as any).storage.from(BUCKET).upload(inner, file)
    if (upErr) {
      return { ok: false, error: { message: upErr.message || 'Upload failed', code: upErr.code } }
    }

    // Signed URL
    const { data: urlData, error: urlErr } = await (supabase as any).storage
      .from(BUCKET)
      .createSignedUrl(inner, 60 * 60) // 1h expiry for preview
    if (urlErr) {
      return { ok: false, error: { message: urlErr.message || 'Failed to create signed URL', code: urlErr.code } }
    }

    const signedUrl: string = (urlData as any)?.signedUrl || ''
    return { ok: true, url: signedUrl, path: fullPath(inner) }
  }

  async function replace(oldPath: string, file: File, ctx: { userId: string; storyId: string }): Promise<UploadResult> {
    const innerOld = toInnerPath(oldPath)
    // Best-effort remove; ignore remove errors to allow overwrite via new upload
    await (supabase as any).storage.from(BUCKET).remove([innerOld])
    return upload(file, ctx)
  }

  async function remove(path: string): Promise<{ ok: true } | UploadErr> {
    const inner = toInnerPath(path)
    const { error } = await (supabase as any).storage.from(BUCKET).remove([inner])
    if (error) return { ok: false, error: { message: error.message || 'Remove failed', code: error.code } }
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
