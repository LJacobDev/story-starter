export type StoryTypeSlug = 'short-story' | 'movie-summary' | 'tv-commercial'

export interface GenerationFormPayload {
  story_type: StoryTypeSlug
  title: string
  genre?: string
  tone?: string
  creativity: number
  additional_instructions?: string
  themes: string[]
  plot_points: string[]
  characters: Array<{ name: string; role: string; description: string }>
  image?: { mode: 'url'; url?: string } | { mode: 'upload'; file?: File; meta?: { width: number; height: number; type: string; size: number } }
  is_private: boolean
}

function typeContext(slug: StoryTypeSlug): string {
  switch (slug) {
    case 'short-story':
      return '- Target length: up to 2000 words. Focus on narrative arc, character development, and a satisfying ending.'
    case 'movie-summary':
      return '- Provide an outline suitable for screenwriting: logline, acts, key beats, stakes, and resolution.'
    case 'tv-commercial':
      return '- Provide a sequence of brief shots and actions that demonstrate the product benefits clearly within ~30–60s.'
  }
}

function list(lines: string[], header: string, items: string[]): void {
  lines.push(`${header}`)
  if (!items || items.length === 0) {
    lines.push('- none')
  } else {
    for (const it of items) lines.push(`- ${it}`)
  }
}

function listCharacters(lines: string[], header: string, chars: GenerationFormPayload['characters']): void {
  lines.push(`${header}`)
  if (!chars || chars.length === 0) {
    lines.push('- none')
  } else {
    for (const c of chars) lines.push(`- ${c.name} — ${c.role} — ${c.description}`)
  }
}

// Compose a deterministic prompt string with section headers in fixed order.
export function composePrompt(payload: GenerationFormPayload): string {
  const MAX_TOTAL = 6000

  const lines: string[] = []

  // Section 1: INSTRUCTIONS
  lines.push('## INSTRUCTIONS')
  lines.push('You are an expert story generation assistant. Follow all constraints precisely and do not add extra commentary.')
  lines.push('Always produce coherent, high-quality writing appropriate to the requested story type slug.')
  lines.push('')

  // Section 2: CONTEXT (type-tuned guidance)
  lines.push('## CONTEXT')
  lines.push(`- Story type (slug): ${payload.story_type}`)
  lines.push(typeContext(payload.story_type))
  lines.push('- Keep content safe and broadly appropriate; avoid hate speech or disallowed content; avoid excessive graphic violence.')
  lines.push('')

  // Section 3: SCHEMA (strict JSON instruction)
  lines.push('## SCHEMA')
  lines.push('Reply ONLY with JSON matching this schema (no markdown fences, no extra text):')
  lines.push('{')
  lines.push('  "title": string,')
  lines.push('  "description": string | null, // optional short synopsis')
  lines.push('  "content": string, // the main body of the story')
  lines.push('  "story_type": string, // slug: short-story | movie-summary | tv-commercial')
  lines.push('  "genre": string | null, // optional')
  lines.push('  "image_url": string | null // optional')
  lines.push('}')
  lines.push('')

  // Section 4: PAYLOAD (all user-provided fields)
  lines.push('## PAYLOAD')
  lines.push(`Type: ${payload.story_type}`)
  lines.push(`Title: ${payload.title}`)
  lines.push(`Genre: ${payload.genre ?? 'none'}`)
  lines.push(`Tone: ${payload.tone ?? 'none'}`)
  lines.push(`Creativity: ${isFinite(payload.creativity) ? payload.creativity : 0}`)

  list(lines, 'Themes:', payload.themes || [])
  list(lines, 'Plot points:', payload.plot_points || [])
  listCharacters(lines, 'Characters:', payload.characters || [])

  // Image URL (only pass through URL; uploads are handled separately client-side)
  const imageUrl = payload.image && (payload.image as any).url ? String((payload.image as any).url) : ''
  lines.push(`Image: ${imageUrl || 'none'}`)

  // Additional instructions with budgeting
  const prefix = lines.join('\n') + '\n'
  const rawAi = (payload.additional_instructions ?? '').trim()

  // Enforce both a total budget and a hard cap for AI instructions to keep prompts snappy
  const HARD_CAP_AI = 1000
  const SAFETY = 200 // reserve a little space to avoid overflow due to join/newlines
  const availableForAI = Math.max(0, MAX_TOTAL - prefix.length - SAFETY)
  const cap = Math.min(HARD_CAP_AI, availableForAI)

  let aiText = rawAi
  let truncated = false
  if (aiText.length > cap) {
    aiText = aiText.slice(0, Math.max(0, cap))
    truncated = true
  }

  if (aiText.length === 0) {
    lines.push('Additional instructions: none')
  } else {
    const note = truncated ? ' (truncated for length budgeting)' : ''
    lines.push(`Additional instructions: ${aiText}${note}`)
  }

  // Final assembly; if somehow still over budget, trim from the end of additional instructions line conservatively
  let out = lines.join('\n')
  if (out.length > MAX_TOTAL) {
    // Find the last line and trim it
    const lastIdx = out.lastIndexOf('\n')
    if (lastIdx !== -1) {
      const head = out.slice(0, lastIdx + 1)
      let tail = out.slice(lastIdx + 1)
      const overBy = out.length - MAX_TOTAL
      if (overBy > 0 && tail.length > overBy) {
        tail = tail.slice(0, Math.max(0, tail.length - overBy))
        if (!/(truncated for length budgeting)\)$/.test(tail)) tail += ' (truncated for length budgeting)'
      }
      out = head + tail
    } else {
      out = out.slice(0, MAX_TOTAL)
    }
  }

  return out
}
