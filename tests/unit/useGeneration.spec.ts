import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGeneration } from '@/composables/useGeneration'

vi.mock('@/utils/composePrompt', () => ({
  composePrompt: vi.fn((p: any) => `INSTRUCTIONS...\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nPAYLOAD: ${JSON.stringify(p)}`),
}))

declare const global: any

describe('useGeneration.generateStory', () => {
  const endpoint = '/functions/v1/gemini-proxy'
  const payload = {
    type: 'short-story',
    title: 'Test Title',
    genre: 'fantasy',
    tone: 'whimsical',
    creativity: 0.7,
    themes: ['friendship'],
    plotPoints: ['A mysterious forest'],
    characters: [
      { name: 'Ari', role: 'protagonist', description: 'Curious and brave' },
    ],
    additionalInstructions: 'Keep it light-hearted.',
    isPrivate: true,
  }

  let originalFetch: any

  beforeEach(() => {
    originalFetch = global.fetch
    vi.useFakeTimers()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.resetAllMocks()
    vi.useRealTimers()
  })

  it('calls the Edge Function with { prompt } only and parses fenced JSON on 200', async () => {
    const returned = {
      title: 'Test Title',
      story_type: 'short-story',
      genre: 'fantasy',
      description: 'A brief tale',
      content: 'Once upon a time...',
      image_url: undefined,
    }

    const text = [
      '```json',
      JSON.stringify(returned),
      '```',
    ].join('\n')

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(text),
    })
    global.fetch = fetchMock

    const { generateStory } = useGeneration()
    const res = await generateStory(payload)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(endpoint)
    expect(options.method).toBe('POST')
    const sent = JSON.parse(options.body)
    expect(Object.keys(sent)).toEqual(['prompt'])
    expect(typeof sent.prompt).toBe('string')

    // success shape
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data.story_type).toBe('short-story')
      expect(res.data.title).toBe('Test Title')
    }
  })

  it('maps 400 validation error to structured error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: vi.fn().mockResolvedValue('Bad Request: prompt too long'),
    })
    global.fetch = fetchMock

    const { generateStory } = useGeneration()
    const res = await generateStory(payload)

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error).toEqual(
        expect.objectContaining({
          code: 400,
          message: expect.stringContaining('prompt too long'),
        }),
      )
      expect(res.error.retryAfter).toBeUndefined()
    }
  })

  it('maps 429 rate limit with Retry-After and suggests backoff', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'retry-after' ? '30' : null),
      },
      text: vi.fn().mockResolvedValue('Too Many Requests'),
    })
    global.fetch = fetchMock

    const { generateStory } = useGeneration()
    const res = await generateStory(payload)

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error).toEqual(
        expect.objectContaining({
          code: 429,
          retryAfter: 30,
          message: expect.stringMatching(/try again/i),
        }),
      )
    }
  })

  it('maps 5xx to structured upstream error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: vi.fn().mockResolvedValue('Service Unavailable'),
    })
    global.fetch = fetchMock

    const { generateStory } = useGeneration()
    const res = await generateStory(payload)

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe(503)
      expect(res.error.message).toMatch(/service unavailable/i)
    }
  })

  it('returns parse error when text does not contain valid JSON', async () => {
    const bad = 'nonsense with ```json not closed'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(bad),
    })
    global.fetch = fetchMock

    const { generateStory } = useGeneration()
    const res = await generateStory(bad)

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe('PARSE_ERROR')
      expect(res.error.message).toMatch(/could not parse json/i)
    }
  })
})
