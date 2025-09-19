import { composePrompt } from '@/utils/composePrompt'
import { supabase } from '@/utils/supabase'

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

function scanForJsonObject(text: string): any | null {
  const s = stripFences(text)
  const n = s.length
  for (let i = 0; i < n; i++) {
    if (s[i] !== '{') continue
    let depth = 0
    for (let j = i; j < n; j++) {
      const ch = s[j]
      if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) {
          const cand = s.slice(i, j + 1)
          try {
            return JSON.parse(cand)
          } catch {}
        }
      }
    }
  }
  return null
}

function deepUnwrapJson(value: any): any | null {
  if (value && typeof value === 'object') {
    const gt = (value as any).generatedText
    if (typeof gt === 'string') {
      const inner = tryExtractJson(gt) || scanForJsonObject(gt)
      if (inner) return inner
    }
    const txt = (value as any).text
    if (typeof txt === 'string') {
      const inner = tryExtractJson(txt) || scanForJsonObject(txt)
      if (inner) return inner
    }
  }
  if (typeof value === 'string') {
    const trimmed = stripFences(value).trim()
    return tryExtractJson(trimmed) || scanForJsonObject(trimmed)
  }
  return null
}

function validateSchema(obj: any): obj is GenerationResult {
  if (!obj || typeof obj !== 'object') return false
  if (typeof obj.title !== 'string' || !obj.title.trim()) return false
  if (typeof obj.content !== 'string' || !obj.content) return false
  if (typeof obj.story_type !== 'string' || !obj.story_type.trim()) return false
  if (obj.genre != null && typeof obj.genre !== 'string') return false
  if (obj.description != null && typeof obj.description !== 'string') return false
  if (obj.image_url != null && typeof obj.image_url !== 'string') return false
  return true
}

// NEW: Coerce partial model JSON into GenerationResult by filling from payload
function coerceToGenerationResult(json: any, payload: any): GenerationResult | null {
  if (!json || typeof json !== 'object') return null
  const content = typeof json.content === 'string' && json.content.trim() ? json.content : null
  const title = typeof json.title === 'string' && json.title.trim() ? json.title : (typeof payload?.title === 'string' ? payload.title : 'Generated Story')
  const story_type = typeof json.story_type === 'string' && json.story_type.trim()
    ? json.story_type
    : String(payload?.story_type || payload?.type || 'short-story')
  if (!content) return null
  const result: GenerationResult = {
    title,
    story_type,
    content,
    description: typeof json.description === 'string' ? json.description : (typeof payload?.description === 'string' ? payload.description : undefined),
    genre: typeof json.genre === 'string' ? json.genre : (typeof payload?.genre === 'string' ? payload.genre : undefined),
    image_url: typeof json.image_url === 'string' ? json.image_url : null,
  }
  return result
}

function ensureTextFromUnknown(input: any): string {
  if (typeof input === 'string') return input
  if (input && typeof input === 'object') {
    try {
      const out = (input as any).output_text || (input as any).outputText
      if (typeof out === 'string' && out.trim()) return out
      const cands: any[] | undefined = (input as any).candidates
      if (Array.isArray(cands) && cands.length) {
        for (const c of cands) {
          const parts: any[] | undefined = c?.content?.parts
          if (Array.isArray(parts)) {
            const p = parts.find((p: any) => typeof p?.text === 'string' && p.text.trim())
            if (p?.text) return p.text
          }
          if (typeof c?.content === 'string' && c.content.trim()) return c.content
        }
      }
      const partsTop: any[] | undefined = (input as any).content?.parts
      if (Array.isArray(partsTop)) {
        const p = partsTop.find((p: any) => typeof p?.text === 'string' && p.text.trim())
        if (p?.text) return p.text
      }
      const choices: any[] | undefined = (input as any).choices
      if (Array.isArray(choices) && choices.length) {
        const m = choices[0]?.message
        if (typeof m?.content === 'string' && m.content.trim()) return m.content
        if (typeof choices[0]?.text === 'string' && choices[0].text.trim()) return choices[0].text
      }
      const candidates = ['generatedText', 'text', 'body', 'content', 'result', 'message', 'raw', 'data']
      for (const key of candidates) {
        const v = (input as any)[key]
        if (typeof v === 'string' && v.trim()) return v
      }
    } catch {/* ignore */}
    try {
      return JSON.stringify(input)
    } catch {
      return String(input)
    }
  }
  return String(input ?? '')
}

function extractFromAnyStringField(obj: any): any | null {
  const seen = new Set<any>()
  function walk(node: any): any | null {
    if (!node || typeof node !== 'object' || seen.has(node)) return null
    seen.add(node)
    for (const key of Object.keys(node)) {
      const v = (node as any)[key]
      if (typeof v === 'string') {
        const cand = tryExtractJson(v) || scanForJsonObject(v)
        if (cand) return cand
      } else if (v && typeof v === 'object') {
        const inner = walk(v)
        if (inner) return inner
      }
    }
    return null
  }
  return walk(obj)
}

// Safe stringify to log entire objects in DEV without crashing on cycles
function safeStringify(value: any) {
  const seen = new WeakSet<any>()
  return JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === 'bigint') return val.toString()
      if (typeof val === 'function') return `[Function ${val.name || 'anonymous'}]`
      if (typeof val === 'symbol') return val.toString()
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]'
        seen.add(val)
      }
      return val
    },
    2
  )
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
      let text: string | null = null
      let raw: any = null
      let debugMeta: any = null

      if ((supabase as any)?.functions?.invoke) {
        const invokeRes = await (supabase as any).functions.invoke('gemini-proxy', { body: { prompt } })
        const { data, error } = invokeRes
        debugMeta = { transport: 'supabase.functions.invoke', status: (error as any)?.status ?? 200 }
        if (error) {
          const rawStatus = (error as any)?.status ?? 'FUNCTION_ERROR'
          const statusNum = Number(rawStatus)
          const code = Number.isFinite(statusNum) ? statusNum : rawStatus
          let retryAfter: number | undefined
          const ctx: any = (error as any)?.context
          if (code === 429 && ctx) {
            const ra = ctx['Retry-After'] || ctx['retry-after'] || ctx['retryAfter']
            if (ra && !isNaN(Number(ra))) retryAfter = Number(ra)
          }
          const message = code === 429
            ? `Rate limited. Please try again${retryAfter ? ` in ${retryAfter} seconds` : ''}.`
            : (error as any)?.message || 'Request failed'
          return { ok: false, error: { code, message, retryAfter } }
        }
        raw = data
        text = ensureTextFromUnknown(data)
      } else {
        const res = await fetch('/functions/v1/gemini-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })
        const bodyText = await (res as any).text?.()
        debugMeta = { transport: 'fetch', status: (res as any).status }
        if (!(res as any).ok) {
          const status: number = (res as any).status
          const retryAfterHeader = (res as any).headers?.get?.('Retry-After') || (res as any).headers?.get?.('retry-after')
          const retryAfter = retryAfterHeader && !isNaN(Number(retryAfterHeader)) ? Number(retryAfterHeader) : undefined
          const normalizedMsg = status === 429
            ? `Rate limited. Please try again${retryAfter ? ` in ${retryAfter} seconds` : ''}.`
            : (bodyText || 'Request failed')
          return { ok: false, error: { code: status, message: normalizedMsg, retryAfter } }
        }
        raw = bodyText
        text = String(bodyText ?? '')
      }

      // FULL debug logging in DEV (no truncation)
      if (import.meta.env?.DEV) {
        console.group('[useGeneration] gemini-proxy FULL debug')
        try {
          console.debug('meta:', safeStringify(debugMeta))
        } catch { /* ignore */ }
        const isObj = raw && typeof raw === 'object'
        const keys = isObj ? Object.keys(raw) : []
        console.debug('raw typeof:', typeof raw, 'isArray:', Array.isArray(raw), 'keys:', keys.join(','))
        try { console.debug('raw FULL:', safeStringify(raw)) } catch { console.debug('raw toString:', String(raw)) }
        if (isObj && 'generatedText' in (raw as any)) {
          const gt = (raw as any).generatedText
          console.debug('generatedText typeof:', typeof gt, 'length:', typeof gt === 'string' ? gt.length : '(n/a)')
          if (typeof gt === 'string') console.debug('generatedText FULL:', gt)
        }
        console.debug('derived text typeof:', typeof text, 'length:', (text || '').length)
        console.debug('derived text FULL:', text)
        console.groupEnd()
      }

      // Extraction attempts
      let json = tryExtractJson(text || '')
      if (json && typeof json === 'object' && !validateSchema(json)) {
        const inner = deepUnwrapJson(json)
        if (inner) json = inner
      }
      if (!json && raw) {
        const inner = deepUnwrapJson(raw)
        if (inner) json = inner
      }
      if (!json) {
        json = scanForJsonObject(text || '')
      }
      if (!json && typeof raw === 'string') {
        json = scanForJsonObject(raw)
      }
      if (!json && raw && typeof raw === 'object') {
        const cand = extractFromAnyStringField(raw)
        if (cand) json = cand
      }

      if (import.meta.env?.DEV && json && !validateSchema(json)) {
        console.warn('[useGeneration] Extracted JSON does not match schema after unwrapping attempts.')
      }

      // Dev-friendly fallback when generatedText is prose only
      if (!json && raw && typeof raw === 'object') {
        const gt = (raw as any).generatedText
        if (typeof gt === 'string' && gt.trim()) {
          console.warn('[useGeneration] Synthesizing schema from generatedText fallback (dev only path).')
          const fallback: GenerationResult = {
            title: String(payload?.title || 'Generated Story'),
            story_type: String(payload?.story_type || payload?.type || 'short-story'),
            genre: payload?.genre || undefined,
            description: payload?.description || undefined,
            content: gt,
            image_url: null,
          }
          return { ok: true, data: fallback }
        }
      }

      if (!json) {
        return {
          ok: false,
          error: { code: 'PARSE_ERROR', message: 'Could not parse JSON from model response' },
        }
      }

      if (!validateSchema(json)) {
        // Last-chance: if JSON is an envelope like { generatedText: '```json ...```' }
        if (json && typeof json === 'object' && typeof (json as any).generatedText === 'string') {
          const inner = tryExtractJson((json as any).generatedText) || scanForJsonObject((json as any).generatedText)
          if (inner && validateSchema(inner)) {
            if (import.meta.env?.DEV) {
              console.warn('[useGeneration] Parsed inner generatedText JSON envelope.')
            }
            return { ok: true, data: inner }
          }
        }
        // NEW: attempt to coerce missing fields (e.g., story_type) from payload
        const coerced = coerceToGenerationResult(json, payload)
        if (coerced) {
          if (import.meta.env?.DEV) {
            console.warn('[useGeneration] Coerced model JSON to expected schema (filled missing fields).')
          }
          return { ok: true, data: coerced }
        }
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
