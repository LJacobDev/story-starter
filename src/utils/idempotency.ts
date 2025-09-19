// Deterministic idempotency key from a normalized payload string
// Use a stable JSON stringify (sorted keys) then SHA-256

function stableStringify(value: any): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(v => stableStringify(v)).join(',')}]`
  const keys = Object.keys(value).sort()
  const entries = keys.map(k => `${JSON.stringify(k)}:${stableStringify((value as any)[k])}`)
  return `{${entries.join(',')}}`
}

export async function makeIdempotencyKey(obj: any): Promise<string> {
  const input = stableStringify(obj)
  // Try Web Crypto (Node/Web) first, but guard and fallback on any error
  try {
    const cryptoAny: any = (globalThis as any).crypto
    // TextEncoder may be undefined in some environments
    if (cryptoAny?.subtle?.digest && typeof TextEncoder !== 'undefined') {
      const enc = new TextEncoder()
      const data = enc.encode(input)
      const digest = await cryptoAny.subtle.digest('SHA-256', data)
      const bytes = Array.from(new Uint8Array(digest))
      return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
    }
  } catch {
    // fall through to JS hash
  }
  // Fallback: small JS hash
  let h = 2166136261 >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h.toString(16)
}
