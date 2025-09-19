import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Import the edge handler (to be implemented)
import { handleRequest } from '../../supabase/functions/gemini-proxy/index'

declare const global: any

function makeReq(body: any, headers: Record<string, string> = {}) {
  return new Request('http://localhost/functions/v1/gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

describe('Edge: gemini-proxy contract', () => {
  let originalFetch: any

  beforeEach(() => {
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.resetAllMocks()
  })

  it('400 when prompt missing/empty', async () => {
    const r1 = await handleRequest(makeReq({}))
    expect(r1.status).toBe(400)

    const r2 = await handleRequest(makeReq({ prompt: '' }))
    expect(r2.status).toBe(400)
  })

  it('400 when prompt exceeds ~6000 chars', async () => {
    const long = 'a'.repeat(6001)
    const r = await handleRequest(makeReq({ prompt: long }))
    expect(r.status).toBe(400)
    const t = await r.text()
    expect(t.toLowerCase()).toContain('too long')
  })

  it('forwards sanitized prompt as-is to Gemini and returns upstream text unchanged', async () => {
    const raw = '  hello\u0000 world  '
    const upstreamText = '```json\n{"title":"T","story_type":"short-story","content":"..."}\n```'

    const fetchMock = vi.fn().mockImplementation(async (_url: string, init?: any) => {
      // assert body passed to Gemini contains sanitized prompt without extra templating
      const body = JSON.parse(init?.body || '{}')
      expect(body.prompt).toBe('hello world')
      expect(JSON.stringify(body).toLowerCase()).not.toContain('reply only with json')
      return new Response(upstreamText, { status: 200, headers: { 'Content-Type': 'text/plain' } })
    })
    global.fetch = fetchMock

    const res = await handleRequest(makeReq({ prompt: raw }))
    expect(res.status).toBe(200)
    const txt = await res.text()
    expect(txt).toBe(upstreamText)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('adds rate limits (429 + Retry-After) for repeated calls', async () => {
    // Ensure fetch is defined and mocked
    global.fetch = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }))

    const headers = { 'x-forwarded-for': '1.2.3.4' }

    // 8 allowed within the minute window
    for (let i = 0; i < 8; i++) {
      const r = await handleRequest(makeReq({ prompt: 'ok' }, headers))
      expect(r.status).toBe(200)
    }

    // 9th should be rate-limited
    const r9 = await handleRequest(makeReq({ prompt: 'ok' }, headers))
    expect(r9.status).toBe(429)
    const ra = r9.headers.get('Retry-After')
    expect(ra).toBeTruthy()
    expect(Number(ra)).toBeGreaterThan(0)
  })

  it('propagates upstream failures as stable errors', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('Service Unavailable', { status: 503 }))

    const res = await handleRequest(makeReq({ prompt: 'ok' }))
    expect(res.status).toBe(503)
    const txt = await res.text()
    expect(txt.toLowerCase()).toContain('service unavailable')
  })
})
