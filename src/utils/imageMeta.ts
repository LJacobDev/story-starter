// Minimal image metadata helper used by tests; in browser it reads dimensions via Image
export type ImageMeta = { width: number; height: number; type: string; size: number }

export async function getImageMetadata(file: File): Promise<ImageMeta> {
  // In a jsdom test environment, we cannot reliably decode image binaries.
  // Tests will mock this function. In real browser, we can best-effort read via URL.createObjectURL + Image().
  return new Promise<ImageMeta>((resolve, reject) => {
    try {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight, type: file.type, size: file.size })
        URL.revokeObjectURL(url)
      }
      img.onerror = () => {
        // Fallback to unknown dims; callers should treat this as failure
        URL.revokeObjectURL(url)
        reject(new Error('Image decode failed'))
      }
      img.src = url
    } catch (e) {
      reject(e)
    }
  })
}
