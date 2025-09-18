# Playwright E2E and Smoke Tests: Options, Effort, and Risks

This document outlines practical ways to adopt Playwright for Story Starter, what each option validates, the approximate effort and risk, and why we’d start with a smoke test.

## Why Playwright

- Cross-browser UI test runner (Chromium, WebKit, Firefox)
- Auto-waits for elements/network idle, robust against flakiness
- Good integration with CI (GitHub Actions)

---

## Test Strategy Options

### 1) Baseline Smoke Test (Recommended First)
Purpose: quick confidence the app loads and core routes/guards work.

Validates:
- App boots without runtime errors
- Auth route renders forms
- Guard redirects unauthenticated users from `/protected` to `/auth`
- `/verify-email` route shows guidance when no token is present

Effort & Risk:
- Effort: 30–60 minutes
- Risk: Low (no secrets, no live external dependencies)

Typical Steps:
- Install Playwright and browsers
- Add a `webServer` entry to start Vite dev server before tests
- Write a single spec with a few page visits and basic assertions

### 2) Callback Smoke Test (Mocked Supabase in Browser)
Purpose: validate the email verification callback flow with a test-only mock (no real Supabase calls).

Validates:
- App processes verification fragment
- Session restoration code executes
- URL tokens are cleaned up
- Authenticated UI appears

Effort & Risk:
- Effort: 2–4 hours
- Risk: Moderate (requires a small test-only injection point to stub `supabase.auth` in the browser build or via feature flag)

Typical Steps:
- Provide a test-only build flag (e.g., `VITE_TEST_E2E=1`) to swap `supabase` with a browser-side mock
- Playwright navigates to `#/verify-email#access_token=...&refresh_token=...`
- Assert that URL is cleaned and UI reflects authenticated state

### 3) Full End-to-End (Live Supabase + Email Delivery)
Purpose: exercise the real signup + email + callback path with a live Supabase project and mail delivery.

Validates:
- Real auth and email round-trip
- Production-grade environment behaviors

Effort & Risk:
- Effort: 1–2 days
- Risk: High (requires secrets, rate-limits, email inbox management, flakiness potential, environment drift)

Typical Steps:
- CI-managed Supabase keys (ephemeral project or dedicated test project)
- Email capture approach (mailbox API, in-memory SMTP, or Supabase magic link extraction)
- Playwright drives browser across the full flow

---

## Why "Smoke Test" vs "End-to-End"

- Smoke Test: fast, shallow checks to ensure the app "doesn’t catch fire" (loads, routes render, guards redirect). Minimal dependencies.
- End-to-End: deep, realistic workflows across all services (auth, DB, email). Higher confidence, but slower and more brittle.

Start with smoke tests to stabilize the UI test harness. Add deeper E2E only where justified by risk.

---

## Implementation Notes (Baseline Smoke Test)

1) Install and initialize Playwright
- `npm i -D @playwright/test`
- `npx playwright install --with-deps`

2) Add `playwright.config.ts` (key bits)
- `use.baseURL` -> `http://localhost:5173`
- `webServer` -> `{ command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: !process.env.CI }`

3) Write a first spec (examples)
- Visit `/#/auth` and assert "Sign In" and "Sign Up" render
- Visit `/#/protected` and assert you’re redirected to `/#/auth`
- Visit `/#/verify-email` (no token) and assert guidance text is visible

4) CI integration (GitHub Actions)
- Add a job that runs `npx playwright install --with-deps` then `npx playwright test`
- Optionally save trace/videos on failure

---

## Implementation Notes (Callback Smoke with Mock)

- Add a test-only flag `VITE_TEST_E2E=1` and in `src/lib/supabase.ts` export a mock client when the flag is set
- Mock `auth.verify`, `auth.setSession` as needed to simulate verified state
- In Playwright, navigate to `/#/verify-email#access_token=fake&refresh_token=fake`
- Assert: URL cleaned (no sensitive tokens), and authenticated UI present

---

## Risks and Mitigations

- Route flakiness: prefer `page.waitForURL` and semantic selectors (getByRole)
- Environment drift: pin `baseURL`, keep tests independent of real services
- Performance: run Chromium headless in CI; shard if needed later

---

## Recommended Path

1) Add baseline smoke test (Option 1) now
2) If desired, add mocked callback smoke (Option 2)
3) Consider a single live E2E for the highest-risk flow later (Option 3)

This balances fast feedback with meaningful coverage.
