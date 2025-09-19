import { composePrompt } from '@/utils/composePrompt'

export type GenerationResult = {
  title: string
  story_type: string
  genre?: string
  description?: string
  content: string
  image_url?: string | null
}

export type GenerateResponse =
  | { ok: true; data: GenerationResult }
  | { ok: false; error: { code: number | string; message: string; retryAfter?: number } }

const ENDPOINT = '/functions/v1/gemini-proxy'

function stripFences(text: string) {
  // Remove common markdown code fences and stray backticks
  let t = text.replace(/```\s*json\s*/gi, '').replace(/```/g, '')
  t = t.replace(/^`+|`+$/g, '')
  return t
}

function tryExtractJson(text: string): any | null {
  const cleaned = stripFences(text).trim()
  // First attempt: direct parse
  try {
    return JSON.parse(cleaned)
  } catch {}

  // Second attempt: slice from first { to last }
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  if (first >= 0 && last > first) {
    const candidate = cleaned.slice(first, last + 1)
    try {
      return JSON.parse(candidate)
    } catch {}
  }
  return null
}

function validateSchema(obj: any): obj is GenerationResult {
  if (!obj || typeof obj !== 'object') return false
  if (typeof obj.title !== 'string' || !obj.title.trim()) return false
  if (typeof obj.content !== 'string' || !obj.content) return false
  if (typeof obj.story_type !== 'string' || !obj.story_type.trim()) return false
  // Optional fields can be undefined or strings
  if (obj.genre != null && typeof obj.genre !== 'string') return false
  if (obj.description != null && typeof obj.description !== 'string') return false
  if (obj.image_url != null && typeof obj.image_url !== 'string') return false
  return true
}

export function useGeneration() {
  async function generateStory(payload: any): Promise<GenerateResponse> {
    let prompt: string
    try {
      prompt = composePrompt(payload)
    } catch (err: any) {
      return {
        ok: false,
        error: { code: 'PROMPT_ERROR', message: err?.message || 'Failed to compose prompt' },
      }
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const text = await res.text()

      if (!res.ok) {
        if (res.status === 429) {
          // Retry-After in seconds or HTTP-date; parse seconds when possible
          const ra = (res as any).headers?.get?.('Retry-After') || (res as any).headers?.get?.('retry-after')
          const retryAfter = ra ? (isNaN(Number(ra)) ? undefined : Number(ra)) : undefined
          return {
            ok: false,
            error: {
              code: 429,
              message: `Rate limited. Please wait${retryAfter ? ` ~${retryAfter}s` : ''} and try again using exponential backoff. (${text || 'Too Many Requests'})`,
              retryAfter,
            },
          }
        }
        // 400 validation or other upstream errors
        const code = res.status || 'UPSTREAM_ERROR'
        return {
          ok: false,
          error: { code, message: text || 'Request failed' },
        }
      }

      const json = tryExtractJson(text)
      if (!json) {
        return {
          ok: false,
          error: { code: 'PARSE_ERROR', message: 'Could not parse JSON from model response' },
        }
      }

      if (!validateSchema(json)) {
        return {
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Response JSON did not match expected schema' },
        }
      }

      return { ok: true, data: json }
    } catch (err: any) {
      return {
        ok: false,
        error: { code: 'NETWORK_ERROR', message: err?.message || 'Network error' },
      }
    }
  }

  return { generateStory }
}
