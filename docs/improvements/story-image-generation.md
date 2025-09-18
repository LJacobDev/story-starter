# Story Image Generation Options (Free/Low-Cost)

Goal
- Provide users with cover art and optional character images for their stories with minimal friction and free-tier friendly usage.

Current Baseline
- Users can upload an image or provide a URL.
- The app intends to support text-to-image later; planning now helps shape the data model and UI.

Practical Paths

1) Bring-Your-Own (BYO) Image, Polished UX (immediate)
- Keep upload/URL input in the form and the story edit view.
- Add client-side image validation (type/size/dimensions) and a visual cropper (optional later).
- Store URLs in `stories.image_url`; for uploads, consider Supabase Storage with a `public` bucket and signed URLs for private images.

2) Public/Free-Tier Text-to-Image Integrations (phaseable)
- Strategy: Offer 1–2 providers with generous free tiers, abstracted behind a single edge function endpoint.
- Candidates (check current free tier limits and ToS before shipping):
  - Stability AI (Stable Image Ultra/ Core) — has free/dev credits periodically.
  - Replicate models — pay-per-use; can cap usage with server-side limits.
  - Hugging Face Inference Endpoints / free Spaces — limited but workable for demos.
  - OpenRouter-compatible diffusion models — meta-gateway to several models (mind rate limits).
- Edge function `image-proxy` responsibilities:
  - Input sanitization (prompts, safety filters), size caps, and rate limiting.
  - Normalized request: { prompt, negativePrompt?, style?, width?, height?, seed? }.
  - Provider switch via config; returns a normalized payload { image_url, provider, costEstimate }.
  - Optional: generate multiple candidates (n<=2) on free tier.

3) Character Portraits from Story Metadata (later)
- Build a small prompt composer that extracts character traits from the story tags/brief.
- Example: "portrait, 25yo courageous biologist, short curly brown hair, denim jacket, windswept beach, cinematic lighting".
- Provide styles: realistic, comic, watercolor. Constrain to safe content.

UI/UX Considerations
- In the story create/edit form: a tabbed selector — Upload | URL | Generate.
- Show small usage badges: "Free-tier, slow" or "Limited credits".
- Progressive disclosure: advanced params (size/seed/style) hidden by default.
- Respect accessibility: alt text from the story title or user-provided description.

Data Model Notes
- stories.image_url (string, nullable) already exists.
- If adding generated variants: a `story_images` table (id, story_id, url, provider, prompt, created_at, is_cover) to keep history.

TDD & Ops
- Unit: prompt builder from character/theme tags; validator for image params.
- Integration: mock `image-proxy` edge function; assert happy/error states.
- Ops: add per-user/day cap in edge function and simple admin analytics.

Risks & Mitigations
- Free-tier instability: implement provider fallback and clear messaging.
- Safety: filter prompts, block NSFW terms; respect provider policies.
- Cost spikes: cap requests, add cooldowns, log usage.

Rollout Plan
- Phase 1: BYO image polish + placeholders and fallbacks.
- Phase 2: Single provider via `image-proxy` with strict caps.
- Phase 3: Character portraits and variant gallery.
