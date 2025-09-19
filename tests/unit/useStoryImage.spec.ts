import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock supabase storage API at module level
vi.mock('@/utils/supabase', () => {
  const storageApi = {
    from: vi.fn().mockReturnThis(),
    upload: vi.fn(async (_path: string, _file: File) => ({ data: { path: _path }, error: null })),
    remove: vi.fn(async (_paths: string[]) => ({ data: null, error: null })),
    createSignedUrl: vi.fn(async (_path: string, _expiresIn: number) => ({ data: { signedUrl: `https://signed/${_path}` }, error: null })),
  }
  return {
    supabase: {
      storage: storageApi,
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: 'user-123' } }, error: null }))
      }
    }
  }
})

import { useStoryImage } from '@/composables/useStoryImage'

function makeFile(name: string, type: string, size: number) {
  const blob = new Blob([new Uint8Array(size)], { type })
  return new File([blob], name, { type })
}

describe('useStoryImage (tests first)', () => {
  let getDimensions: (file: File) => Promise<{ width: number; height: number }>
  beforeEach(() => {
    getDimensions = async (_f: File) => ({ width: 800, height: 500 })
  })

  it('rejects unsupported mime types and oversize files', async () => {
    const { upload } = useStoryImage({ getDimensions })
    const badType = makeFile('x.gif', 'image/gif', 1000)
    const tooBig = makeFile('x.png', 'image/png', 2 * 1024 * 1024 + 1)

    expect((await upload(badType, { userId: 'u', storyId: 's' })).ok).toBe(false)
    expect((await upload(tooBig, { userId: 'u', storyId: 's' })).ok).toBe(false)
  })

  it('rejects images with small or huge dimensions', async () => {
    const { upload } = useStoryImage({ getDimensions: async () => ({ width: 150, height: 150 }) })
    const f = makeFile('small.jpg', 'image/jpeg', 1000)
    const res = await upload(f, { userId: 'u', storyId: 's' })
    expect(res.ok).toBe(false)
  })

  it('uploads valid image and returns signed URL', async () => {
    const { upload } = useStoryImage({ getDimensions })
    const f = makeFile('cover.webp', 'image/webp', 500 * 1024)
    const res = await upload(f, { userId: 'user-123', storyId: 'story-456' })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.url).toMatch(/^https:\/\/signed\//)
      expect(res.path).toMatch(/^story-covers\/user-123\/story-456\//)
    }
  })

  it('validateUrl accepts https and rejects data: URLs', () => {
    const { validateUrl } = useStoryImage()
    expect(validateUrl('https://example.com/img.jpg').ok).toBe(true)
    expect(validateUrl('data:image/png;base64,AAA').ok).toBe(false)
    expect(validateUrl('http://example.com/x.png').ok).toBe(true)
  })

  it('replace removes old and uploads new, returning new signed URL', async () => {
    const { replace } = useStoryImage({ getDimensions })
    const f = makeFile('new.png', 'image/png', 300 * 1024)
    const res = await replace('story-covers/user-123/story-456/old.png', f, { userId: 'user-123', storyId: 'story-456' })
    expect(res.ok).toBe(true)
  })

  it('remove deletes the object', async () => {
    const { remove } = useStoryImage()
    const res = await remove('story-covers/user-123/story-456/old.png')
    expect(res.ok).toBe(true)
  })
})
