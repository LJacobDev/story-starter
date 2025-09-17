# Copilot Working Memory Reference

## Current Project State
- **Last Known Good State**: Unit tests pass locally and the auth runtime works in dev. SignIn/SignUp forms correctly submit values (Input v-model fix applied) and local unit tests are green.
- **Currently Working**: CI / GitHub Pages stability: ensure build-time environment variables are injected and the app handles missing or rotated Supabase credentials gracefully.
- **Last Test Results**: Local unit tests: all passing (e.g. 101/101 observed). Vitest setup and test-friendly supabase stubs added earlier.
- **Known Issues**:
  - Email verification flow (Task 2.2.1) remains unimplemented end-to-end.
  - Story generation and story-management features (Phase 3/4) are not started.
  - A runtime "Invalid refresh token" event was observed in Pages builds; this was a client-side session issue (stale/invalid token) and was resolved by signing in again. The underlying cause appears to be sessions/tokens issued for a different project/keys or stale stored tokens.

## Key File Relationships
- `src/utils/supabase.ts` (or `src/lib/supabase.ts`) constructs the Supabase client using import.meta.env.VITE_SUPABASE_URL and `VITE_SUPABASE_KEY` — this must match the names passed from CI at build time.
- `.github/workflows/deploy.yml` Build job must run with access to the `github-pages` environment (or repository-level secrets) so the VITE_* secrets are available during `npm run build`.
- `src/composables/useAuth.ts` and related auth UI depend on the supabase client; handle TOKEN_REFRESH_FAILED and sign-out flows to avoid repeated failed refresh attempts.

## Recent Changes Made
- Added test-friendly stubs and guards so tests do not require real Supabase envs at module load time (makes Vitest stable).
- Normalized environment variable name usage to `VITE_SUPABASE_KEY` across runtime code and types.
- Updated `vite.config.ts` Vitest env to use `VITE_SUPABASE_KEY` for consistency.
- Updated `.github/workflows/deploy.yml` to:
  - pass VITE_SUPABASE_URL and VITE_SUPABASE_KEY into the Build job
  - include `environment: github-pages` on the Build job so environment-scoped secrets are available
  - add a pre-build diagnostic step that fails early if required secrets are missing
- Observed and debugged a runtime invalid refresh token error on Pages; signing in resolved the immediate error.

## What was learned
- Environment secrets scoped to a GitHub Environment (e.g., `github-pages`) are only injected when the job explicitly uses that environment; missing the `environment:` field can make secrets appear present in the repo UI but unavailable to the job.
- YAML key ordering does not affect environment availability — the issue was the environment scope and job configuration, not `run` vs `env` ordering.
- Client-side token refresh failures are a runtime session problem (stale or revoked refresh tokens or mismatched Supabase project keys), not a CI or Vite config setting.
- A production build that lacks required VITE_* variables can throw at module load and produce a blank page; handle this by making client init resilient and surfacing a friendly banner.

## Next Steps Plan
1. Stabilize CI and deployment
   - Keep `environment: github-pages` in the Build job.
   - Keep the pre-build diagnostic step in place to fail early if required secrets are missing.
2. Improve runtime resiliency
   - Add a safe fallback in the Supabase client initialization so missing envs do not throw at module load (export a harmless stub and set a window flag to show a banner).
   - Implement TOKEN_REFRESH_FAILED handling in `useAuth` to clear stale storage and force sign-out so repeated failed refreshes stop.
3. Continue feature work
   - Implement Task 2.2.1 (Email verification flow) next.
   - Begin Phase 3 story-management features in small, test-driven steps.

## Verification Plan
- CI: Trigger GitHub Actions deploy, confirm pre-build diagnostic prints "Secrets present (ok)" and the Build step runs with VITE_* envs set.
- Local: Reproduce production build locally by setting the two VITE_* env vars and running `npm run build` then `npm run preview` to confirm behavior matches Pages.
- Runtime: Test sign-in, then reload the Pages site to verify no "invalid refresh token" errors; run incognito to ensure new sessions behave correctly.
- Tests: Run `npm run test` and ensure Vitest passes without network calls or module-load throws.

## Rollback plan
- If the workflow or runtime changes cause regressions, revert the workflow edits and supabase client edits to the last known commit and re-run CI to isolate the regression.

## Complexity Warning Signs
- [ ] More than 5 files need changes to make tests pass.
- [ ] Tests rely on network access or external service availability.
- [ ] Composables using lifecycle hooks being exercised directly in unit tests without component wrappers.
- [ ] Tests depend on exact validation text strings across multiple files.

## Assumptions about the project that changed

## Human-parsable summary of state and insights

## Outstanding tasks and priorities
- Implement email verification UX and resend flow (Task 2.2.1).
- Make the supabase client initialization tolerant and add a small in-app banner when envs are missing.
- Add TOKEN_REFRESH_FAILED handling in `useAuth` and show a user-friendly message when sessions expire.
- Start Phase 3 story-management implementation with TDD: story cards, fetching/pagination, filters.

---

*This file is updated by GitHub Copilot on 2025-09-16 to reflect the current working memory. Update again after each major task to record the new state.*


# note added by developer

Claude Sonnet 4 had huge problems at around task 2.1.1, 2.1.2, where it couldn't solve an authentication / validation glitch where the sign in fields kept showing 'field required' and disabling the 'sign in' button, even when filled properly.  It took Claude lots of effort and the use of a repomix file set to try to debug this and it still failed to solve it.

It kept saying confidently that it could definitely see the problem, and then it proceeded to apply extensive and various code changes that would have no effect on the problematic UI behaviour.  Claude sonnet 4 was not able to get the true sign in form to work, but it was able to make a 'test authentication' component that was able to sign in.  When asked to make the sign in form work using the same logic as the working test authentication form, it could not achieve this even though it said that they were matching exactly.

I was about to roll back the repo to a prior checkpoint or try deleting all the related files and building them again, but somehow just switching to GPT-5 mini was enough for it to read the repomix and look at the problem, and understand that there was an issue with v-model not connecting the fields to the validator logic properly and the authentication issue was solved.

GPT-5 mini was then far more helpful for being able to troubleshoot further errors with supabase authentication tokens, vite environment variables, and detecting whether github environment secrets were successfully being injected in github action workflows. GPT-5 mini was also able to make the true sign in form work with the same logic as the test authentication component and get the project back on track.

So at this point, the project is switching from having claude Sonnet 4 be the coding agent to having GPT-5 mini be the coding agent for a (currently) much more effective, informative, and time-saving experience.

Claude in agent mode would go ahead and make speculative changes in hopes of them working, and so there are a lot of strange files left over like old .ts files left in place just so that tests that used to expect them can still pass.  Soon, it will be important to look for and clean up such unneeded files and tests.

