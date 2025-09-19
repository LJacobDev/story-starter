import { describe, it, expect } from 'vitest'
import { composePrompt, type GenerationFormPayload } from '@/utils/composePrompt'

function makePayload(overrides: Partial<GenerationFormPayload> = {}): GenerationFormPayload {
  return {
    story_type: 'movie-summary',
    title: 'The Lost City',
    genre: 'adventure',
    tone: 'light-hearted',
    creativity: 0.6,
    additional_instructions: 'Please keep it under 1500 words and avoid excessive violence. '.repeat(30),
    themes: ['friendship', 'discovery', 'resilience'],
    plot_points: [
      'Protagonist meets antagonist early and misses chance to avoid conflict',
      'A mid-journey betrayal that turns into a reveal',
    ],
    characters: [
      { name: 'Ava', role: 'protagonist', description: 'Curious explorer and linguist' },
      { name: 'Rook', role: 'antagonist', description: 'Treasure hunter with secret motives' },
      { name: 'Maya', role: 'ally', description: 'Local guide with deep knowledge of the ruins' },
    ],
    image: { mode: 'url', url: 'https://example.com/image.jpg' },
    is_private: true,
    ...overrides,
  }
}

describe('composePrompt (4.1.2a)', () => {
  it('includes a human-readable instruction section and a strict JSON schema section', () => {
    const out = composePrompt(makePayload())
    expect(out).toMatch(/You are an expert/i)
    expect(out).toMatch(/Reply ONLY with JSON matching this schema/i)
    expect(out).toMatch(/"title"\s*:\s*string/i)
    expect(out).toMatch(/"content"\s*:\s*string/i)
    expect(out).toMatch(/"story_type"\s*:\s*string/i)
  })

  it('uses internal type slugs (no UI labels) and incorporates all sections', () => {
    const out = composePrompt(makePayload({ story_type: 'tv-commercial' }))
    // slug appears
    expect(out).toContain('tv-commercial')
    // visible labels should not leak — ensure the capitalized label text is absent
    expect(out).not.toMatch(/TV commercial\b(?! schema)/)
    // includes themes, plot points, characters, tone, creativity, genre, image url, and additional instructions
    expect(out).toMatch(/Themes:/)
    expect(out).toMatch(/Plot points:/)
    expect(out).toMatch(/Characters:/)
    expect(out).toMatch(/Tone:/)
    expect(out).toMatch(/Creativity:/)
    expect(out).toMatch(/Genre:/)
    expect(out).toMatch(/Image:/)
    expect(out).toMatch(/Additional instructions:/)
  })

  it('enforces a length budget and truncates additional instructions if needed with a visible note', () => {
    const out = composePrompt(makePayload())
    // The test payload has long additional instructions — expect a truncation note
    expect(out).toMatch(/\(truncated for length budgeting\)/)
    // And ensure the total prompt length stays within a reasonable budget (<= 6000 chars)
    expect(out.length).toBeLessThanOrEqual(6000)
  })

  it('deterministically orders sections', () => {
    const out = composePrompt(makePayload())
    const order = [
      'INSTRUCTIONS',
      'CONTEXT',
      'SCHEMA',
      'PAYLOAD',
    ]
    // Check each section header appears and in order
    let lastIndex = -1
    for (const header of order) {
      const idx = out.indexOf(`## ${header}`)
      expect(idx).toBeGreaterThan(-1)
      expect(idx).toBeGreaterThan(lastIndex)
      lastIndex = idx
    }
  })
})
