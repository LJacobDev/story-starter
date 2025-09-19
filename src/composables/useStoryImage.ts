// Minimal composable stub for image upload; tests will mock this module.
// Real implementation will validate type/size/dimensions and upload to Supabase Storage.
export type UploadResult = { ok: true; url: string } | { ok: false; error: string }

export function useStoryImage() {
  async function upload(_file: File): Promise<UploadResult> {
    // Placeholder; actual logic implemented later. Returning failure by default.
    return { ok: false, error: 'Not implemented' }
  }
  return { upload }
}
