# Claude Sonnet 4 Prompt Plan for Story Starter

This document provides a comprehensive, test-driven development plan for building the Story Starter application using Claude Sonnet 4 as the code generation agent. The plan emphasizes incremental progress, strong testing practices, and careful integration of features. Each prompt is designed to build upon previous work while maintaining code quality and functionality.

---

## Phase 1: Project Foundation and Infrastructure

### Chunk 1.1: Project Initialization and Core Setup

#### Prompt 1.1.1
```text
Create a new Vue 3 project using Vite with TypeScript. Install and configure TailwindCSS for styling. Set up a clean, modular project structure with folders for components, composables, types, and utilities. 

Requirements:
- Use Vue 3 Composition API exclusively
- Configure TypeScript with strict mode
- Set up TailwindCSS with proper configuration
- Create basic folder structure: src/components, src/composables, src/types, src/utils
- Write a simple test to verify the project builds and runs
- Include package.json scripts for dev, build, test, and preview

Testing Requirements:
- Set up Vitest for unit testing
- Create a basic test that verifies the app renders without errors
- Ensure all TypeScript types are properly configured

Success Criteria:
- Project starts successfully with `npm run dev`
- Tests pass with `npm run test`
- TypeScript compilation succeeds with no errors
```

#### Prompt 1.1.2
```text
Set up version control and GitHub integration. Configure deployment to GitHub Pages using GitHub Actions.

Requirements:
- Initialize Git repository with proper .gitignore
- Create GitHub repository and connect remote
- Set up GitHub Actions workflow for building and deploying to GitHub Pages
- Configure Vite for GitHub Pages deployment (handle base path)
- Test deployment pipeline

Testing Requirements:
- Verify .gitignore excludes node_modules, .env, dist
- Test GitHub Actions workflow runs successfully
- Confirm deployed site is accessible on GitHub Pages

Success Criteria:
- Repository is properly configured and pushed to GitHub
- GitHub Actions workflow deploys successfully
- Site is accessible at the GitHub Pages URL
```

### Chunk 1.2: Supabase Configuration and Database Setup

#### Prompt 1.2.1
```text
Set up Supabase project and configure the database schema. Create environment variable management.

Requirements:
- Create Supabase project
- Design and implement database schema:
  - users table: id (UUID/PK), email (TEXT/UNIQUE), created_at (TIMESTAMP), feedback (JSONB)
  - stories table: id (UUID/PK), user_id (UUID/FK), title (TEXT), content (TEXT), type (TEXT), is_private (BOOLEAN), image_url (TEXT), created_at (TIMESTAMP), updated_at (TIMESTAMP)
  - analytics table: id (UUID/PK), user_id (UUID/FK), event_type (TEXT), event_data (JSONB), timestamp (TIMESTAMP)
- Set up Row Level Security (RLS) policies
- Create .env file for Supabase credentials
- Add .env to .gitignore

Testing Requirements:
- Write SQL tests to verify schema creation
- Test foreign key relationships
- Verify RLS policies work correctly

Success Criteria:
- Database schema created successfully
- RLS policies enforce proper access control
- Environment variables load correctly in development
```

#### Prompt 1.2.2
```text
Create Supabase client utility and type definitions. Implement basic database operations.

Requirements:
- Install @supabase/supabase-js
- Create TypeScript interfaces for all database tables
- Build a Supabase client utility with proper typing
- Implement basic CRUD operations for each table
- Add error handling and logging
- Create composables for database operations

Testing Requirements:
- Write unit tests for each database operation
- Test error handling scenarios
- Mock Supabase client for testing

Success Criteria:
- All database operations work correctly
- TypeScript types are properly defined
- Error handling provides meaningful feedback
- Tests cover happy path and error scenarios
```

---

## Phase 2: Authentication System

### Chunk 2.1: User Registration and Login

#### Prompt 2.1.1
```text
Install and configure ShadCN UI. Create authentication forms with proper validation.

Requirements:
- Install and configure ShadCN UI components
- Create sign-up form with email/password fields
- Create sign-in form with email/password fields
- Implement client-side validation (email format, password requirements)
- Add proper form accessibility (ARIA labels, error announcements)
- Style forms with TailwindCSS and ShadCN components

Testing Requirements:
- Write unit tests for form validation logic
- Test form submission handling
- Test accessibility features
- Test responsive design

Success Criteria:
- Forms render correctly and are fully accessible
- Validation works on client-side
- Forms are responsive across device sizes
- All tests pass
```

#### Prompt 2.1.2
```text
Implement authentication logic using Supabase Auth. Handle authentication state management.

Requirements:
- Set up Supabase Auth configuration
- Create authentication composables (useAuth)
- Implement sign-up functionality with email verification
- Implement sign-in functionality
- Add authentication state management
- Handle authentication errors gracefully
- Create route guards for protected pages

Testing Requirements:
- Write integration tests for authentication flows
- Test error handling for various scenarios
- Mock authentication for testing components
- Test route protection

Success Criteria:
- Users can successfully register and sign in
- Authentication state is properly managed
- Errors are handled and displayed appropriately
- Protected routes work correctly
```

### Chunk 2.2: Email Verification and User Experience

[don't use this prompt directly, use the text below where things are broken into smaller steps]
#### Prompt 2.2.1
```text
Implement email verification flow and user feedback.

Requirements:
- Configure email verification in Supabase
- Create email verification page/component
- Add "resend verification" functionality
- Implement user feedback for verification status
- Handle verification success/failure states
- Add loading states and user-friendly messages

Testing Requirements:
- Test email verification flow end-to-end
- Test resend functionality with rate limiting
- Test error states and user feedback

Success Criteria:
- Email verification works completely
- Users receive clear feedback at each step
- Rate limiting prevents spam
- All edge cases are handled gracefully
```

Smaller steps for next focus (Phase 2 → Task 2.2.1)
- Implement `EmailVerify` view and route: `/verify-email` to consume callback token.
- Add `confirmEmail(token)` and `resendVerification()` to `useAuth` (TDD-first).
- Unit tests: mock Supabase confirm/resend behaviors (success, invalid, expired).
- UX: loading / success / failure messages; route guard for unverified users.

TDD subtasks for Task 2.2.1
1. Add unit tests for `confirmEmail` and `resendVerification` (mocked).
2. Implement `confirmEmail` in composable and wire `/verify-email` route.
3. Add resend button in SignUp UI and tests.
4. Add route guard for unverified accounts and UI messaging.

Verification plan (summary)
- Unit tests first (Vitest with Supabase mocks), then CI run + Pages verification.
- Success: tests pass, verify route confirms tokens, protected routes respect verification state.



Next major phases (after 2.2.1)
- Phase 3: story CRUD composables, grid and list UI (TDD).
- Phase 4: generator UI incremental steps + Edge function integration (Gemini proxy).
- Phase 5–6: analytics, accessibility audit and polish.

---

## Phase 3: Core Story Management

### Chunk 3.1: Story Display and Grid Layout

#### Prompt 3.1.1 (this prompt is being broken into micro prompts)
```text
Create story card components and grid layout. Implement responsive design.

Requirements:
- Design story card component using ShadCN UI
- Create responsive grid layout
- Add placeholder content and loading states
- Implement proper image handling with fallbacks
- Add accessibility features (alt text, proper headings)
- Create story preview modal

Testing Requirements:
- Test component rendering with various data
- Test responsive behavior
- Test accessibility features
- Test loading and error states

Success Criteria:
- Story cards display correctly in responsive grid
- Images load properly with fallbacks
- Components are fully accessible
- Loading states provide good UX
```


### Prompt 3.1.1 — TDD Micro‑Prompts (card + grid + loading first; modal later)

Note: "Home-level conditional rendering test contract"
- Tests will mock `useAuth()` to simulate guest vs authenticated states and assert:
  - Guest: shows a single "Public Stories" grid
  - Authenticated: shows "Your Stories" grid first, then "All Public Stories" grid
- Ensures Home renders correct sections and ordering based on auth state.

Prompt 3.1.1a.1 — Tests first: StoryCard props and formatting
- Create tests for presentational StoryCard.
- Props: `id`, `title`, `type` (short_story|movie_summary|tv_commercial), `isPrivate`, `createdAt` (Date|string), `imageUrl?`, `description?`.
- Behavior expectations:
  - Renders title (truncate), 1–2 line description, type badge, privacy badge.
  - Date formatting: if < 10 days old → "n days ago"; else → "Month 10th 2025".
  - Image: prefer `imageUrl`; otherwise render type‑specific monochrome SVG fallback:
    - short_story → book (slate/gray), movie_summary → filmstrip (indigo/blue), tv_commercial → clapper/megaphone (emerald/green).
  - Accessible alt text: "Cover image for <title>" or "Story cover image".
- Files to add: `tests/unit/StoryCard.spec.ts`, `src/components/stories/StoryCard.vue` (stub), `src/utils/formatDate.ts` with tests.
- Success: tests fail initially.

Prompt 3.1.1a.2 — Implement StoryCard to satisfy tests
- Implement with ShadCN Card/Badge; truncation via Tailwind; alt handling.
- Add inline SVG fallbacks per type/color scheme.
- Make tests pass.

Prompt 3.1.1b.1 — Tests first: StoryGrid responsive + skeleton + empty
- Component props: `items: StoryCardProps[]`, `loading: boolean`, `emptyMessage?: string`.
- Tests cover:
  - Responsive columns at sm/md/lg/xl → 1/2/3/4.
  - `loading=true` shows 12 skeleton cards.
  - Not loading and empty `items` shows empty message.
- Files: `tests/unit/StoryGrid.spec.ts`, `src/components/stories/StoryGrid.vue` (stub).
- Success: tests fail initially.

Prompt 3.1.1b.2 — Implement StoryGrid and skeletons
- Responsive grid via Tailwind; add SkeletonCard shimmer.
- Make tests pass.

Prompt 3.1.1c.1 — Tests first: Home wiring (guest vs auth)
- Tests:
  - Guest: one grid titled "Public Stories".
  - Auth: two grids titled "Your Stories" (first) and "All Public Stories" (second).
  - Page H1: "Stories"; section headings are H2.
  - Default sort: newest first.
- Files: `tests/unit/Home.stories-grid.spec.ts` (uses placeholder arrays only).
- Success: tests fail initially.

Prompt 3.1.1c.2 — Implement Home sections (placeholder data only)
- Wire Home.vue to render grids per auth state; use placeholder items.
- Make tests pass.

Prompt 3.1.1d.1 — Tests first: image fallback + a11y
- Tests ensure: missing `imageUrl` renders fallback with proper roles/alt; basic axe has no critical violations.
- File: `tests/unit/StoryCard.a11y.spec.ts`.
- Success: tests fail initially.

Prompt 3.1.1d.2 — Implement a11y polish
- Ensure <img> alt, fallback SVG aria-hidden, sr-only text if needed; badge contrast; heading hierarchy.
- Make tests pass.


Assumptions captured
- Date format: "n days ago" under 10 days; else long date like "March 10th 2025".
- Grid columns: 1/2/3/4 at sm/md/lg/xl.
- Page size for 3.1.2: 12; "Show more" appends 12; infinite loads as user scrolls further.
- Placeholder images: monochrome, type‑specific SVGs.
- Default sort: newest first.
- Card includes a short description (or excerpt if missing).
```



carrying on from here

There are some options for how to seed the database with example stories so that pagination can be viewed while working on it

I could seed the database with about 40 sample stories using a sql command but instead of doing that I'd rather move ahead with just making the rest of the app and building stories through ui interaction rather than sql seeding. then things like pagination and so on can be visually checked then. 


#### Prompt 3.1.2   (THIS PROMPT IS BEING BROKEN INTO MICRO PROMPTS BELOW)
```text
Implement story fetching and pagination. Add search and filter functionality.

Requirements:
- Create API functions for fetching stories
- Implement pagination with proper loading states
- Add search functionality (title, content, type)
- Create filter controls (type, date, privacy)
- Implement infinite scroll or pagination UI
- Add proper error handling and empty states

Testing Requirements:
- Test story fetching with various parameters
- Test search and filter functionality
- Test pagination behavior
- Test error handling and empty states

Success Criteria:
- Stories load efficiently with pagination
- Search and filters work correctly
- Performance is optimal with large datasets
- Error states are handled gracefully
```

### 3.1.2 — TDD Micro‑Prompts

3.1.2a.1 — Tests first: useStories composable (fetch + paginate)
- Tests:
  - fetchPublic({ page=1, pageSize=12, search?, type?, privacy? }) returns newest-first and total count
  - fetchMine(...) returns both private and public for current user
  - Pagination math correct (page 1 → first 12; page 2 → next 12)
  - Error bubbles as { message, code }
- Files: tests/unit/useStories.spec.ts, src/composables/useStories.ts (stub)
- Success: tests fail initially

3.1.2a.2 — Implement: useStories
- Implement using Supabase queries with limits/offsets and filters
- Return { items, total, error } and loading helpers
- Make tests pass

3.1.2b.1 — Tests first: Home integration + “Show more” and guest marketing
- Tests:
  - Guest: shows marketing/hero section and “Public Stories” grid together
  - Auth: shows “Your Stories” then “All Public Stories” (no hero for auth)
  - “Show more” appends 12 items per click; simulate near-bottom to continue loading
  - Loading and empty states render correctly
- Files: tests/unit/Home.data-integration.spec.ts
- Success: tests fail initially

3.1.2b.2 — Implement: Home integration
- Wire Home.vue to use useStories; add marketing section for guests
- Add “Show more” and optional intersection-observer for infinite continuation
- Make tests pass

3.1.2c.1 — Tests first: Search and Filters
- Tests: typing search updates results (debounced), selecting type/date/privacy filters queries correctly
- Files: tests/unit/StoryFilters.spec.ts, src/components/stories/StoryFilters.vue (stub)
- Success: tests fail initially

3.1.2c.2 — Implement: StoryFilters
- Implement ShadCN inputs for search and filter controls; emit model to Home
- Wire to useStories queries
- Make tests pass





### Chunk 3.2: Story Details and Management

#### Prompt 3.2.1
```text
Create story detail view and editing functionality.

Requirements:
- Build detailed story view component
- Add edit mode for story owners
- Implement story deletion with confirmation
- Create story sharing functionality
- Add proper permission checks
- Handle image uploads and URL inputs

Testing Requirements:
- Test story detail rendering
- Test edit functionality and permissions
- Test deletion with confirmation flow
- Test sharing functionality

Success Criteria:
- Story details display correctly
- Only story owners can edit/delete
- Sharing generates proper URLs
- All user interactions are smooth
```

3.2.1 — TDD Micro‑Prompts

3.2.1a — Tests first: Route + fetch-by-id
- Goals:
  - Route /stories/:id renders StoryDetails view
  - Loads story by id; guest sees public only; owner sees private+public
- Files:
  - tests/unit/StoryDetails.route.spec.ts
  - src/views/StoryDetails.vue (stub)
  - src/composables/useStory.ts (stub: getById)
- Success: tests fail initially

3.2.1b — Implement: getById + initial view
- Implement useStory.getById(id) with select('*') and RLS-safe behavior
- Render title, badges, type, genre, description, image, content, created_at
- Make tests pass

3.2.1c — Tests first: Edit permissions + form contract
- Only owner sees Edit button
- Entering edit mode shows fields: title, story_type, genre, description, image_url, is_private, content
- Validation mirrors StoryCard constraints (lengths)
- Files: tests/unit/StoryDetails.edit.spec.ts
- Success: tests fail initially

3.2.1d — Implement: Edit mode
- Implement edit toggle, form with ShadCN inputs, client validation, Cancel/Save
- useStory.update(id, patch) → updates allowed fields; disabled while pending; error messaging
- Make tests pass

3.2.1e — Tests first: Delete with confirmation
- Only owner sees Delete; opens confirm dialog; on confirm → calls useStory.remove(id); navigates back to Home
- Files: tests/unit/StoryDetails.delete.spec.ts
- Success: tests fail initially

3.2.1f — Implement: Delete
- Implement confirm dialog; useStory.remove; route push to Home on success; toasts
- Make tests pass

3.2.1g — Tests first: Share link behavior
- Copy link button: uses navigator.share if available; falls back to clipboard
- Private story warning when attempting to share; suggest toggling privacy
- Files: tests/unit/StoryDetails.share.spec.ts
- Success: tests fail initially

3.2.1h — Implement: Share
- Implement share/copy with graceful fallback; user feedback toasts
- Make tests pass

3.2.1i — Tests first: Image handling (URL and upload)
- URL validation (http/https); preview; replace/remove
- Upload flow via useStoryImage: validates type/size/dimensions; returns signed URL
- Files: tests/unit/StoryDetails.image.spec.ts (mocks Storage); src/composables/useStoryImage.ts (reuse/extend)
- Success: tests fail initially

3.2.1j — Implement: Image pipeline integration
- Wire URL/upload modes into edit form; persist image_url on save
- Make tests pass

3.2.1k — Tests first: A11y + keyboard flows
- Heading hierarchy, labeled controls, focus on entering/leaving dialogs, Esc closes confirm
- Files: tests/unit/StoryDetails.a11y.spec.ts
- Success: tests fail initially

3.2.1l — Implement: A11y polish
- Ensure labels/aria, focus management, Esc handling; pass axe rules
- Make tests pass







### PROMPTS 3.2.2.1 AND 3.2.2.2 ARE BEING DEFERRED TO PHASE 4, PHASE 3 IS COMPLETE AT THIS POINT

Prompt 3.2.2.1 — Tests first: Preview modal (optional; can defer)
- Tests for ShadCN Dialog: open/close, focus trap, Esc to close, focus return.
- Files: `tests/unit/StoryPreviewModal.spec.ts`, `src/components/stories/StoryPreviewModal.vue` (stub).

Prompt 3.2.2.2 — Implement Preview modal (optional)
- Implement dialog consuming card props; aria-labelledby.
- Make tests pass.
```

3.2.2 — TDD Micro‑Prompts (optional)

3.2.2a — Tests first: Open/close + focus management
- Open from StoryCard action; focus moves to dialog; Esc and overlay click close; focus returns to trigger
- Files: tests/unit/StoryPreviewModal.spec.ts
- Success: tests fail initially

3.2.2b — Implement: StoryPreviewModal
- ShadCN Dialog; props: title, story_type, genre, description, image_url, content, is_private, created_at
- aria-labelledby ties heading to dialog; trap focus; keyboard accessible actions
- Make tests pass

3.2.2c — Tests first: Content rendering + a11y
- Renders text safely; shows SVG fallback when no image_url (type-specific); axe has no critical violations
- Files: tests/unit/StoryPreviewModal.content.spec.ts
- Success: tests fail initially

3.2.2d — Implement: Content + fallback SVGs
- Implement type-based monochrome SVGs; ensure alt/aria; pass a11y tests
- Make tests pass

---





I'm going to skip the preview modal from phase 3 and take care of it in the phase 4 micro prompts

when the fallback svgs are put in place, I'll prefer to use some images from pexels or similar


## Phase 4: Story Generation System

### (minimize this and use the TDD micro prompts below) Chunk 4.1: Story Generation Form and API Integration

#### Prompt 4.1.1
```text
Create dynamic story generation form with advanced input handling.

Requirements:
- Build form with dynamic character fields (name, role, description)
- Add dynamic theme and plot point inputs
- Implement story type selection (including custom types)
- Add advanced AI customization options (tone, creativity level)
- Include image upload/URL input functionality
- Implement form validation and character limits
- implement any reasonable client side user input sanitization, however since sanitization is better handled inside the edge function, tell the developer an explicit and thorough plan for what to design the edge function like in order to sanitize any user input at any time it is advisable to do so. See docs/improvements/user-input-sanitization.md for ideas.

Testing Requirements:
- Test dynamic field addition/removal
- Test form validation logic
- Test custom story type creation
- Test file upload functionality

Success Criteria:
- Form handles dynamic inputs smoothly
- Validation provides clear feedback
- Custom story types are saved properly
- File uploads work reliably
```

#### Prompt 4.1.2
```text
Create Supabase Edge Function for story generation. Integrate with Gemini API.

Requirements:
- Build Edge Function for Gemini API integration
- Implement proper prompt engineering for different story types
- Add input sanitization and validation
- Handle API errors and rate limiting (429 errors)
- Parse and clean Gemini responses
- Save generated stories to database

Testing Requirements:
- Test Edge Function with various inputs
- Test error handling for API failures
- Test rate limiting scenarios
- Test response parsing and cleaning

Success Criteria:
- Story generation works reliably
- API errors are handled gracefully
- Generated content is properly formatted
- Stories are saved correctly to database
```

#### Prompt 4.1.3
```text
Implement story preview and save functionality. Add retry mechanism.

Requirements:
- Create story preview component
- Add save/discard options
- Implement retry functionality for generation
- Add loading states and progress indicators
- Create gamification features (toast notifications, story count)
- Handle generation errors with user-friendly messages

Testing Requirements:
- Test preview functionality
- Test save/discard flows
- Test retry mechanism
- Test gamification features

Success Criteria:
- Preview displays generated content properly
- Save/discard options work correctly
- Retry generates new content reliably
- Gamification enhances user experience
```

---


### comment:  phase 4 as described above has been completely broken down into TDD micro prompts to do below

do not run the prompts above in phase 4, but paste them in at the start as a reference for the micro prompts to be compared to



TDD Micro‑Prompts for Phase 4 (4.1.1–4.1.4), aligned to “frontend builds prompts; edge only sanitizes and forwards”

General notes
- Follow the Pre‑Task Assessment Protocol before each subtask.
- Write tests first, then implement to satisfy them.
- Include manual verification after tests.

4.1.1 — Story Generation Form

4.1.1a — Tests first: Form skeleton + validation contracts
- Component: StoryGenerateForm.vue (stub).
- Must render:
  - Type select with three options (Short story, Movie summary, TV commercial) mapped to slugs internally.
  - Inputs: title, genre, tone, creativity (0–1), additional instructions.
  - Dynamic lists: themes (tags), plot points, characters (name/role/description).
  - Image input: upload or URL (mode switch).
  - Privacy toggle defaulting to private.
- Client caps:
  - Title ≤ 120; Genre/Tone ≤ 60.
  - Themes ≤ 10 (≤ 30 chars each).
  - Plot points ≤ 10 (≤ 200 chars each).
  - Characters ≤ 6; name ≤ 60; description ≤ 400; role enum only.
  - Additional instructions ≤ 2000; show warning when > 800.
- Submit disabled while invalid; emits “submit” with normalized payload (types as hyphen slugs).
- Files: tests/unit/StoryGenerateForm.spec.ts; src/components/generation/StoryGenerateForm.vue (stub).
- Success: tests fail initially.

4.1.1b — Implement: Form structure and validation
- Implement ShadCN fields to satisfy tests; ensure emit payload normalization.
- Manual verification: caps, warnings, default privacy, submit behavior.

4.1.1c — Tests first: Dynamic list UX
- Add/remove/reorder for themes/plot points/characters.
- Trim inputs, dedupe themes, reject empty items, enforce max counts.
- Keyboard UX for tags (Enter to add).
- Success: tests fail initially.

4.1.1d — Implement: Dynamic lists + polish
- Implement list behaviors and messages.
- Manual verification: enforce limits; pleasant keyboard flow.

4.1.1e — Tests first: Image client validation
- URL mode: only http/https; reject data: URLs.
- Upload mode: png/jpeg/webp; ≤ 2 MB; dimensions within 200–4000 for width and height (mock metadata).
- Emits normalized image descriptor for parent.
- Success: tests fail initially.

4.1.1f — Implement: Image input checks
- Add validators and UI feedback; still no Storage calls here.
- Manual verification: correct accept/reject cases.

4.1.1g — Tests first: Prefill/Reset and “Edit prompts”
- Prefill props populate all fields; Reset returns to defaults; emits “edit-prompts”/“cancel”.
- Success: tests fail initially.

4.1.1h — Implement: Prefill/Reset behavior
- Implement prop‑driven initial values and reset controls.
- Manual verification: edit prompts loop feels natural.

4.1.2 — Prompt Builder + Edge Function + Client Integration

4.1.2a — Tests first: Prompt builder utility (client)
- Utility: composePrompt(formPayload) → string.
- Must include:
  - Human‑readable instructions and constraints tuned per type (client‑only responsibility).
  - A strict “Reply ONLY with JSON matching this schema:” section describing fields: title, description?, content, story_type (slug), genre?, image_url?.
  - Incorporation of themes/plot points/characters/tone/creativity/additional instructions.
  - Internal types as slugs; visible labels never leak into prompt.
  - Enforced length budgeting (truncate excess gracefully when needed).
- Tests assert presence of key sections, slugs used, warnings for long “additional instructions.”
- Files: tests/unit/composePrompt.spec.ts; src/utils/composePrompt.ts (stub).
- Success: tests fail initially.

4.1.2b — Implement: composePrompt
- Implement deterministic prompt assembly with caps and ordering.
- Manual verification: inspect prompt string for a representative form payload.

4.1.2c — Tests first: useGeneration composable (client)
- Contract:
  - generateStory(payload) calls Edge Function with { prompt: string } only.
  - On 200: receives sanitized text; client extracts JSON (tolerates backticks/fences) and validates schema.
  - On 400/429/5xx: returns structured { ok: false, error: { code, message, retryAfter? } }.
  - Maps retry semantics (suggest backoff for 429).
- Files: tests/unit/useGeneration.spec.ts; src/composables/useGeneration.ts (stub).
- Success: tests fail initially.

4.1.2d — Implement: useGeneration composable
- Implement POST to /functions/v1/gemini-proxy; wire JSON extraction/validation and error mapping.
- Manual verification: mock function → happy and error paths.

4.1.2e — Tests first: Edge function contract (black‑box)
- Treat function as a sanitizing proxy:
  - Accepts POST { prompt: string } (optionally { model, maxTokens, temperature } are transparently forwarded; not required by client).
  - Validates total prompt length/budget (~6000 chars) and emptiness; returns 400 when invalid.
  - Moderate per‑user rate limits (e.g., ~8/min, 60/hour, 200/day) → 429 + Retry‑After.
  - Forwards sanitized prompt as‑is to Gemini (no server templating).
  - Returns sanitized text from Gemini without parsing or re‑templating.
  - Adds stable error shapes for upstream failures.
- Files: tests/edge/gemini-proxy.contract.spec.ts (mock Gemini).
- Success: tests fail initially.

4.1.2f — Implement: Edge function (minimal, sanitize + forward)
- Implement input/output sanitization, limits, and rate limits; forward to Gemini; return sanitized text/errors.
- Manual verification: function serve locally; validate 400/429/5xx; confirm it echoes Gemini text (sanitized) and doesn’t inject templates.

4.1.3 — Preview + Save workflow

4.1.3a — Tests first: Preview component
- StoryGeneratePreview.vue:
  - Renders parsed title/description/content; shows image if provided else correct SVG fallback by type.
  - Actions: Save, Discard, Retry, Edit Prompts, Undo (disabled if no previous preview).
  - Emits: save(draft), retry(), edit(), discard(), undo().
- Files: tests/unit/StoryGeneratePreview.spec.ts; src/components/generation/StoryGeneratePreview.vue (stub).
- Success: tests fail initially.

4.1.3b — Implement: Preview with one‑level Undo
- Implement UI and emit contracts; store last preview for Undo.
- Manual verification: retry → preview updates; undo → previous content restored; basic a11y (focus/labels).

4.1.3c — Tests first: Save with RLS + idempotency
- Composable: useSaveStory
  - save(draft, { idempotencyKey }) inserts into story_starter_stories (owner inferred via RLS/trigger).
  - Prevent double‑save in session (same idempotencyKey).
  - Respect is_private from form default (true) unless toggled.
  - Map Supabase errors into user messages.
- Files: tests/unit/useSaveStory.spec.ts; src/composables/useSaveStory.ts (stub).
- Success: tests fail initially.

4.1.3d — Implement: Save composable
- Implement insert + idempotency guard; disable Save while pending; toasts.
- Manual verification: double‑click Save → one record only; story appears in “Your Stories.”

4.1.4 — Image upload pipeline (Storage)

4.1.4a — Tests first: useStoryImage composable
- upload(file) → validates type/size/dimensions; uploads to story-covers/userId/storyId/filename; returns signed URL.
- When URL mode is chosen, validate and pass through URL (no upload).
- Replace/remove helpers.
- Files: tests/unit/useStoryImage.spec.ts; src/composables/useStoryImage.ts (stub).
- Success: tests fail initially.

4.1.4b — Implement: Storage composable
- Wire Supabase Storage; generate signed URLs; handle replace/remove.
- Manual verification: upload 800×500 jpeg, 500 KB → visible in preview; reject 3 MB png or 150×150 png.

4.1.4c — Tests first: End‑to‑end happy path (mocked)
- Flow: fill valid form → composePrompt → generate (edge mocked) → client parses JSON → preview → upload/paste image → save → fetch “mine” shows story.
- Files: tests/integration/generation.e2e.spec.ts (mock network).
- Success: tests fail initially.

4.1.4d — Implement: Wire route/view
- Create /generate route that hosts the form → preview flow using the composables.
- Manual verification checklist:
  - Default privacy private; public only when toggled.
  - Additional instructions warning triggers at > 800 chars.
  - Retry replaces preview; Undo restores prior content.
  - Upload constraints enforced; URL mode accepts https and rejects data:.
  - After Save, story is visible in “Your Stories.”

Proposed Sub-Prompts 

4.1.4d.1 — Implement route stub
Add route '/generate' with lazy-loaded GenerateStory.vue view (stub content).
Verify route resolves and page shell renders.

4.1.4d.2 — View shell + form submit
Render StoryGenerateForm; on submit, call useGeneration.generateStory; store preview state; show warning >800 chars.
Verify: valid form produces preview; invalid shows disabled submit.

4.1.4d.3 — Preview wiring + idempotency
Render StoryGeneratePreview; implement Retry/Edit/Discard/Undo; persist per-preview idempotency key until preview changes.
Verify: retry then undo restores previous preview; idempotency key resets on edit/discard.

4.1.4d.4 — Image handling
URL mode via validateUrl; upload mode via upload(); display signed URL; allow replace/remove.
Verify: accepts https URL; rejects data:; enforces upload constraints.

4.1.4d.5 — Save + redirect
Call useSaveStory.save with idempotency key; on success, navigate to “Your Stories”.
Verify: only one record saved even with delayed second click.

4.1.4d.6 — Navigation link
Add “Generate New Story” to nav.
Verify link goes to /generate.

Exit criteria for Phase 4
- All unit/integration tests pass locally and in CI.
- Manual verification checklist complete.
- No regressions to Phase 3 behavior (grids, RLS).
- Feature discoverable via “Generate New Story,” safe to ship (private by default).



Phase 4 is done in that its tests pass and some of the functionality works to the extend that now everything is visible and able to be manually tested for features, user experience and flows.


Basic features are working,
But lots of UX and other things need correcting

## POST PHASE 4 CLEANUP

This is a list of things noticed while using the app that stand out and need to be fixed before continuing the rest of the prompt plan.

### things that have been solved

stories aren't clickable to view details

images not showing up when uploaded

images not showing up when linked

removing demo view from non dev environment, make sure tests about that are removed
remove 'demo' route and view or more likely change it to dev only route and decide if changing

start a new chat history and see if it's quicker than running on a long one - confirmed - making an 'agent hand off briefing' text and starting a new chat makes agent response rate much higher than when in a long conversation

search and filter features work now

fixing the search and filter somehow resulted in the uploaded images not working anymore
-- it wasn't actually this that did it, it had something to do with the storage paths

pressing generate button doesn't make obvious enough loading indication or explain that it takes about 10 seconds


### things to still fix


signing in with mobile doesn't seem to work yet, but viewing as unauthenticated at least works

get a favicon.svg 

search and filter features work slowly.. they almost look like they're being lazy loaded or something like that because pressing the button shows what looks like an extra network call, then after that they're more responsive




'your stories' appears empty when refreshing page, but clicking to 'generate new story' and then back to 'home' makes them reappear

buttons are not well explained or obvious, some buttons missing, some keypresses behave unintuitively

had issue signing in on mobile, check that

'type' is defaulting to short story when newly created, but can edit it to set it right and then it displays properly

make 'generating story' more visible and say to expect a few seconds waiting


add 'about' section that explains the app, its purpose, scope and current state


add a reset password link to signin

password reset 'works' in that you get a link that takes you to the site as authenticated, but functionality to also set new password needs to be added


there is git history version control but I want to use semgrep version codes

images aren't being saved and it's using the fallback SVGs - I'd rather at least have the fallbacks be stock images like pexels stuff

refreshing the page makes story grid look empty, but then clicking on demo then home again makes them appear


it seemed to make json parsing fail when I included image url, but when I emptied that and did generate again, it worked that time 


MAKE THE GENERATE BUTTON SHOW A RESPONSIVE LOADING STATE / SPINNER AT THE BOTTOM


MOVE THE SIGN UP FORM OFF THE BOTTOM


the search and filter doesn't really seem to work either


seeding the database with stories so I could test filters and pagination during implementation would have been good, want to do that next time



NOTE:  using the dev sandbox to preview unhooked up UI earlier was very helpful - do it sooner to do more manual testing of things so less has to get fixed at the end next time


REMOVE THE DEMO VIEW SOON, it just has vite + vue scaffolding junk in it


clicking on the cards doesn't seem to take to a close up view, and there's no 'edit, delete' ellipse button

the svgs show even when I tried to upload picture

the upload picture button was shown before generate, and before 'save'

the 'save, retry, undo' buttons are just plain text and don't look like buttons (make them nice, or shadcn ui components)

sometimes the json reply from gemini is completely empty, not sure why that is.  it might be happening when there isn't enough instructions to go on


check if there are any tests that should be added to anything

do verifications that were skipped, like manual verification that images over 2mb aren't accepted etc - ask model to try to detect what has not been verified yet, or to create a comprehensive list of what to check from top to bottom just to be sure

do accessibility audit

do keyboard navigation audit

do UX checks, are things smooth, do keypresses do expected things when filling out forms




## Phase 5: User Feedback and Analytics

### Chunk 5.1: Feedback System and Analytics

#### Prompt 5.1.1
```text
Implement user feedback modal and analytics tracking.

Requirements:
- Create feedback modal accessible from navigation
- Add feedback form with validation
- Implement feedback storage in user profile
- Set up analytics event tracking
- Add privacy controls for analytics
- Create user profile page with story count and feedback history

Testing Requirements:
- Test feedback submission and storage
- Test analytics event tracking
- Test privacy controls
- Test user profile functionality

Success Criteria:
- Feedback system works end-to-end
- Analytics track user interactions properly
- Privacy controls function correctly
- User profile displays accurate information
```

---

## Phase 6: Polish and Enhancement Features

### Chunk 6.1: Accessibility and Responsive Design

#### Prompt 6.1.1
```text
Implement comprehensive accessibility features and responsive design improvements.

Requirements:
- Add full keyboard navigation support
- Implement proper ARIA roles and labels
- Create skip links for navigation
- Test with screen readers
- Optimize for mobile devices
- Add focus management for modals and forms

Testing Requirements:
- Run accessibility audits (axe-core)
- Test keyboard navigation flows
- Test screen reader compatibility
- Test mobile responsiveness

Success Criteria:
- App is fully accessible via keyboard
- Screen readers work properly
- Mobile experience is excellent
- Accessibility audits pass
```

### Chunk 6.2: Dark Mode and UI Polish

#### Prompt 6.2.1
```text
Implement dark mode toggle and final UI polish.

Requirements:
- Add dark mode toggle in navigation
- Implement TailwindCSS dark mode classes
- Persist theme preference in localStorage
- Add smooth transitions between themes
- Polish overall visual design
- Implement one or two Easter eggs

Testing Requirements:
- Test dark mode toggle functionality
- Test theme persistence
- Test visual consistency across modes
- Test Easter egg functionality

Success Criteria:
- Dark mode works flawlessly
- Theme preference persists across sessions
- Visual design is polished and professional
- Easter eggs delight users without interfering with functionality
```

---

## Testing and Quality Assurance Strategy

### Unit Testing
- Test individual components in isolation
- Mock external dependencies (Supabase, APIs)
- Test edge cases and error scenarios
- Maintain >80% code coverage

### Integration Testing
- Test component interactions
- Test authentication flows
- Test story generation end-to-end
- Test database operations

### End-to-End Testing
- Test complete user workflows
- Test across different browsers
- Test responsive design
- Test accessibility features

### Performance Testing
- Test with large datasets
- Monitor bundle size
- Test loading performance
- Optimize critical rendering path

---

## Success Metrics

### Technical Metrics
- All tests pass consistently
- TypeScript compilation with no errors
- Accessibility audit scores >95%
- Lighthouse performance score >90%

### User Experience Metrics
- Smooth interactions with no blocking operations
- Clear error messages and loading states
- Responsive design across all device sizes
- Intuitive navigation and workflows

### Code Quality Metrics
- Clean, maintainable TypeScript code
- Proper separation of concerns
- Reusable components and composables
- Comprehensive error handling

---

## Conclusion

This prompt plan ensures a systematic, test-driven approach to building the Story Starter application. Each phase builds upon the previous work while maintaining high code quality and user experience standards. The incremental approach allows for early testing and validation of features, reducing the risk of integration issues and ensuring a polished final product.
