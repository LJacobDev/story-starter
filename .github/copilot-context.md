# Copilot Working Memory Reference

## Current Project State
- **Last Known Good State**: All unit/integration tests passing; vue-tsc errors just fixed.
- **Currently Working**: 4.1.4d — implement /generate route and wire form→preview→save.
- **Last Test Results**: Green; mocked E2E happy path passes.
- **Known Issues**: None blocking; optional server-side idempotency still pending.

## Key File Relationships
- `StoryDetails.vue` uses `useStoryImage.upload(file, { userId, storyId })` and `useStory.update/remove`.
- `StoryGenerateForm.vue` emits normalized payload; validates image via `getImageMetadata`.
- `useGeneration.ts` returns discriminated union { ok, data|error }.

## Recent Changes Made
- [Today]: Fixed TS build errors:
  - `StoryDetails.vue`: pass ctx to `uploadImage(file, { userId, storyId })`.
  - `tests/unit/useGeneration.spec.ts`: respect discriminated union; remove unused import.
  - `tests/unit/StoryGenerateForm.prefill.spec.ts`: narrow `prefill.story_type` typing to component union.
  - `src/vite-env.d.ts`: add `declare module '*.vue'` for SFC typing.
- [Today]: Integration test Supabase mock adjusted to support insert→select→single chain.

## Next Steps Plan
1. Start 4.1.4d.1 — add `/generate` route stub and view shell.
2. Wire form submit → generation; then preview + idempotency; then image handling; then save + redirect; finally nav link.
3. Re-run vue-tsc and tests after each subtask.

## Complexity Warning Signs
- [ ] More than 5 files need changes
- [ ] Circular dependencies detected
- [ ] Test failure cascade
- [ ] Can't predict impact of changes

## Assumptions Updated
- TS alias `@/*` is active for both src and tests; `.vue` module declaration required for SFC imports.

## Human-parseable Summary
- Resolved TypeScript build errors by aligning tests with discriminated union shapes, fixing image upload ctx, and adding SFC typings. Ready to implement `/generate` route in small, verifiable steps.

Update timestamp: 2025-09-19.


## Assessment of repo quality and improvements at end of phase 3 to keep in mind for phase 4 (do not edit this section, just be aware of it)

Summarized conversation historyHere’s a concise repo review with concrete, high‑leverage suggestions.

What’s clean and well organized
- Structure: Clear Vue 3 + Vite + TS layout (components, composables, views, utils, router, types). Good separation of concerns.
- Hosting: Hash router configured correctly for GitHub Pages; vite base set per build mode.
- Testing: Vitest set up with UI/coverage; useful unit/integration tests (Home grid, skeletons, show more, a11y checks in plan). Supabase client has a safe test stub to avoid env/network.
- UI: ShadCN-style primitives under components/ui; StoryCard implements accessible fallbacks (aria-hidden SVGs + sr-only text).
- Data flow: Composables pattern for stories/auth; Home.vue cleanly composes data and view with reactivity.
- Docs/plan: Prompt plan + TDD micro-prompts are thorough and actionable.

Improvements to consider
- Standardize Supabase client import
  - Current: supabase.ts and a thin wrapper src/lib/supabase.ts. Pick one canonical import path (e.g., '@/lib/supabase') and update composables for consistency and easier mocking.
- Centralize story type mapping
  - Switches for type → label/icon repeat. Create a single map in utils/types (slug ↔ label, icon component or asset path) and reuse in StoryCard, filters, and future preview.
- Reuse fallback SVGs
  - Inline SVG components in StoryCard duplicate the asset set under src/assets. Prefer importing the shared assets or a small Icons module to avoid drift.
- Tighten search sanitization
  - useStories.buildSearchOr only strips %. Also remove commas/parentheses/quotes (they affect PostgREST or()), or use a safer strategy:
    - Escape/whitelist term characters, or
    - Use text search (fts) or rpc with parameters for safer matching.
- Unify tests location
  - You have tests co-located (src/components/*.test.ts) and under tests/unit. Pick one convention (prefer tests/…) for consistency and tooling.
- Add linting/formatting
  - Introduce ESLint + Prettier (Vue/TS configs), add npm scripts and CI step to enforce style and catch issues early.
- Strengthen types and DTOs
  - Define StoryCardProps and Story entity DTOs in src/types and reuse across components/composables. Add explicit mappers (DB → UI) to remove ad‑hoc field aliasing in Home.vue.
- Router guards cohesion
  - setupRouterGuards is solid; consider extracting route meta keys and guard options to a small helper to reduce inline boolean casting and improve testability.
- Vitest config polish
  - Set coverage thresholds, include/exclude globs, and ensure CI enforces coverage. Consider using vitest-axe in a11y test files now that it’s in devDeps.
- Path aliases in TS
  - Vite alias @ is configured; ensure tsconfig paths mirrors it (tsconfig.app.json). If missing, add "paths" to avoid TS import friction in IDEs.
- Performance and queries
  - For ilike across multiple columns, consider indices or trgm for title/description to keep performance with larger datasets.
- UI cohesion
  - Leverage lucide-vue-next for consistent iconography, or move all custom icons under components/icons with a single API.

Overall: The repo is already in good shape. Prioritize standardizing Supabase imports, centralizing story type/icon logic, tightening search sanitization, and adding lint/format. These will pay off quickly in maintainability and testability as Phase 4 progresses.


## Context Section about Phase 4 Planning (Generated by another model in ask mode — agents, don’t directly edit this section but be aware of it)

Purpose
- Deliver LLM-based story generation via a minimal Supabase Edge Function proxy (“gemini-proxy”) that only sanitizes inputs/outputs and enforces basic limits/rate‑limits. All prompt engineering and output parsing happen on the frontend.
- Phase 4 is the MVP for generation; Phase 6 adds advanced controls (seed lock, custom types, richer undo, metadata persistence).

User journey
- User clicks “Generate New Story.”
- A form collects structured prompts:
  - Story type: short-story | movie-summary | tv-commercial. Internally stored as hyphen‑slugs; UI displays labels with spaces (“Short story,” “Movie summary,” “TV commercial”).
  - Optional title, genre, tone, creativity.
  - Dynamic tags: themes, plot points.
  - Dynamic characters: name, role (protagonist/antagonist/ally/other), optional description.
  - Free‑text “additional instructions” (warn if > 800 chars; allow up to 2000).
  - Optional image (upload to Supabase Storage or paste URL).
  - Privacy toggle (default private; user can opt‑in to public).
- Submit:
  - Frontend constructs the full model prompt string (prompt engineering lives entirely in the client).
  - Frontend instructs Gemini to return strict JSON (via prompt content).
  - Frontend POSTs that final prompt string to the gemini‑proxy Edge Function.
- Edge Function behavior:
  - Validates request size and rate limits.
  - Sanitizes the incoming prompt (trim/collapse whitespace, strip obvious HTML/scripts/control characters).
  - Forwards the sanitized prompt to Gemini as‑is (no server-side templating or schema instructions).
  - Receives Gemini text, sanitizes it (remove BOM, dangerous tags, normalize whitespace; optionally pass through code‑fences untouched).
  - Returns sanitized text to the frontend without parsing or reformatting.
- Frontend then:
  - Cleans fences/backticks if needed, extracts JSON, validates against the client schema, and shows a preview.
  - From preview: Save (persist), Retry (fresh sample) with Undo to restore previous preview, Edit prompts (return to form), or Discard (no persistence).
  - Drafts remain in memory only until Save (no “draft” rows in DB for Phase 4).

Data conventions and limits
- Story types: hyphen slugs in DB/APIs; space‑separated labels in UI.
- Images:
  - Allowed types: png, jpeg, webp.
  - Max size: 2 MB.
  - Dimensions: min 200×200, max 4000×4000; any aspect ratio.
  - Stored in bucket story-covers with owner‑only RLS; display via signed URLs.
  - If none, show type‑specific monochrome SVG fallback (decorative, aria‑hidden):
    - Short story → open book (slate/gray).
    - Movie summary → filmstrip (indigo/blue).
    - TV commercial → clapperboard or megaphone (emerald/green).
- Input validation (client) and guidance:
  - Title ≤ 120; Genre ≤ 60; Tone ≤ 60.
  - Themes ≤ 10, each ≤ 30.
  - Plot points ≤ 10, each ≤ 200.
  - Characters ≤ 6; name ≤ 60; description ≤ 400; role is enum.
  - Additional instructions ≤ 2000; warn when > 800 (latency hint).
- Server safeguards (edge):
  - Enforce reasonable total input budget (~6000 chars) and moderate rate limits.
  - Return sanitized model text; do not attempt JSON parsing.

Privacy and access control
- Default is_private = true on the form; Save preserves user choice.
- RLS: anon can read public; authenticated can read public + own; writes are owner‑only with WITH CHECK.

Retry/Undo semantics
- Retry always requests a fresh sample (no deterministic seed in Phase 4).
- When a retry completes, the preview is replaced; Undo restores the prior preview (single‑level undo).
- Phase 6 will add a visible “Lock seed” toggle for deterministic generations, and deeper undo for text fields.

Responsibilities split
- Frontend:
  - Prompt builder: composes final model prompt, includes strict “respond only with JSON” instructions and the JSON schema description.
  - Calls gemini‑proxy with the prompt string.
  - Extracts and parses JSON from the sanitized text; validates schema; handles user‑visible errors.
  - Image validation/upload, preview, save flow, idempotency on Save, toasts.
- Edge function:
  - Safety and hygiene only: input/output sanitization, size caps, moderate per‑user rate limits (e.g., default: ~8/min, 60/hour, 200/day — adjustable via env).
  - Transparent pass‑through to Gemini; no server‑side templating or response shaping beyond sanitization.
  - Clear error taxonomy: 400 validation, 429 rate limit with Retry‑After, 5xx transient.

Out of scope for Phase 4 (defer to Phase 6+)
- Custom story types authored by users.
- Persisting generation request metadata (prompts/settings) in DB.
- Deterministic seed controls (add visible “Lock seed” toggle later).
- Multi‑level undo for form editors.
- AI image generation.

Quality gates for Phase 4
- TDD for form behavior, prompt builder, client parsing, preview/save/undo, image pipeline, and edge function contract (sanitization + rate limit).
- Manual checklist includes privacy default, length caps/warnings, upload constraints, retry→undo, 429 handling UX, and basic a11y.

Key risks and mitigations
- Non‑JSON model replies → robust client extraction and schema validation; friendly parse errors.
- Latency → input caps and 800‑char warning; visible progress; no server templating to keep flow simple.
- Duplicate saves → client idempotency key; disable Save while pending.
- Storage misuse → client/type/size/dimension checks + bucket RLS; signed URLs only.

Here’s the append-only update block for the Phase 4 section.

## Phase 4 Addendum — New Decisions and Execution Details (since last update)

- Model default: gemini-2.5-flash.
- Edge function request shape confirmed: POST { prompt: string } only; proxy sanitizes input/output and forwards as-is; frontend owns prompt engineering and JSON parsing.
- Rate-limit/env knobs finalized: RL_BURST, RL_PER_HOUR, RL_PER_DAY, MAX_PROMPT_CHARS (~6000). Moderate defaults; adjustable via env.
- Storage confirmed: bucket story-covers; path userId/storyId/filename; owner-only RLS; signed-URL viewing.
- Test strategy (TDD) options:
  - Option A (parallel-safe): place Phase 4 specs under tests/phase4 and gate them so CI/Phase 3 aren’t affected. Local run:
    ````bash
    RUN_PHASE4=1 vitest --include "tests/phase4/**/*.spec.ts" --watch
    ````
    Gate each spec:
    ````ts
    const RUN_PHASE4 = process.env.RUN_PHASE4 === '1';
    (RUN_PHASE4 ? describe : describe.skip)('Phase 4 — <suite>', () => { /* … */ });
    ````
  - Option B (single-stream): when Phase 3 wraps or if the same agent continues, place tests in the normal locations immediately (tests/unit, tests/integration, tests/edge) without gating.
- Branching to avoid collisions with Phase 3: work on a phase4-prep branch; separate VS Code window optional. Do not touch:
  - src/components/stories/*, src/views/Home.vue, src/composables/useStories.ts, or existing Phase 3 tests.
- Safe, additive deliverables to start now (unreferenced by Phase 3):
  - docs/phase4/: gemini-proxy contract + runbook, image pipeline guide, prompt-builder notes, a11y/UX checklist.
  - supabase/functions/gemini-proxy/: sanitize-and-forward scaffold with env-driven limits (not wired to UI).
  - src/utils/: extractJson, slugify/humanize story type, imageValidation, idempotencyKey (+ gated tests).
  - src/types/generation.ts; src/composables/useGeneration.ts (stub; not imported yet).
- Execution note: test gating is optional. If the current Phase 3 agent proceeds to Phase 4 next, use Option B and place tests in the standard folders.


## Phase 4 Addendum — Optional “Revise with AI” for Existing Stories (post‑Phase‑4)

Summary
- Feature: add a “Revise with AI” action available on any story the current user owns.
- Flow:
  1. Owner clicks “Revise with AI”.
  2. a form with the story's body appears in a read only view
  3. a free-text box exists that the user can write instructions in about how to change the story
  4. the user presses 'submit' or 'refine story' and it gets sent to gemini as a prompt asking to refine the story according to the instructions found in the free-text box
  5. the story body populates with the reply, and the user can either save over the old story, or save as a new story, or cancel the changes

