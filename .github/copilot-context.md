# Copilot Working Memory Reference

## Current Project State
- **Last Known Good State**: All unit tests passing; auth + email verification working on GitHub Pages with hash routing; logout is idempotent and persistent.
- **Currently Working**: Transition to Phase 3 (Story Grid + Cards). Finishing README notes done.
- **Last Test Results**: Green locally (Vitest). Router-link/view warnings in a couple of tests are expected when run without a router instance.
- **Known Issues**:
  - Some legacy files/tests may be redundant from earlier agent passes; defer cleanup until after Phase 3 MVP is stable.

## Key File Relationships
- `src/lib/supabase.ts` creates client using VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
- `src/main.ts` restores session from hash (access_token), cleans URL to `#/verify-email`, then mounts app and installs router guards.
- `src/router/index.ts` uses createWebHashHistory(); meta flags drive guards via `useRouteGuard`.
- `src/router/routes.ts` defines routes: `/`, `/auth` (guestOnly), `/verify-email`, `/demo`, `/protected` (auth + verified).
- `src/composables/useAuth.ts` auth ops: signIn, signUp (redirect URL uses VITE_PUBLIC_URL + BASE_URL), signOut (tolerates 401/403), resendEmailVerification, confirmEmail.
- `src/views/VerifyEmail.vue` handles both token-in-query and tokenless (post-setSession) success.
- `src/components/*` contains ShadCN-style UI wrappers; `AuthContainer.vue` is layout-only, `Auth.vue` manages spacing.

## Recent Changes Made
- Added Home and Demo routes and views; fixed hash routing for GH Pages.
- Implemented pre-mount token parsing and session restoration with URL cleanup.
- Hardened signOut to treat 401/403/no-session as benign; expanded local token cleanup.
- Fixed SignUp email trim so button enablement is correct.
- Updated VerifyEmail to treat tokenless confirmed sessions as success; switched navigation to router.push.
- README refreshed with Phase 2 notes, envs, routing, and troubleshooting.

## Next Steps Plan (Phase 3)
1) 3.1.1 Story Cards + Grid (UI only)
   - Build ShadCN-based `StoryCard` component with placeholders and loading skeletons
   - Responsive grid in a new `Home` (or `Stories`) section
   - Image handling with fallback; ARIA/alt text; preview modal scaffold
   - Tests: render, responsive classes, placeholder states
2) 3.1.2 Fetch, Pagination, Search/Filters (data layer)
   - Supabase queries for public + user-owned private stories
   - Pagination or infinite scroll; empty/error states
   - Search by title/description and filter by type/date/privacy
   - Tests: composables mocked against supabase client
3) 3.2.1 Story Detail & Management
   - Detail view; edit/delete for owner; share link; image upload/URL
   - Permissions via RLS; optimistic UI
   - Tests: permissions and happy/error paths

## Verification Plan
- Unit tests in watch mode (npm run test) for each new component/composable before implementation (TDD).
- Manual: Confirm grid responsiveness and accessibility (tab order, alt text) early.
- Database: Use seed or fixtures for story queries; mock Supabase in unit tests.

## Rollback Plan
- If story grid changes affect routing or build, revert the UI-only changes and re-run tests; keep auth untouched.

## Complexity Warning Signs
- [ ] More than 5 files modified per subtask without tests
- [ ] Pagination + filters intertwined without composable separation
- [ ] Supabase queries leaking into components instead of composables
- [ ] Image upload flows added before basic grid stability

## Assumptions Updated
- Hash routing is mandatory on Pages; do not set a base in createWebHashHistory().
- Email verification may arrive as tokenless success; VerifyEmail must accept both flows.

## Human-parsable summary
- Auth is stable (sign-in/out, verify, guards). Ready to build story UI.
- Keep TDD cadence and small, testable increments.

---

Update timestamp: 2025-09-18. Maintain this file before and after each major task.

# note added by developer

Claude Sonnet 4 had huge problems at around task 2.1.1, 2.1.2, where it couldn't solve an authentication / validation glitch where the sign in fields kept showing 'field required' and disabling the 'sign in' button, even when filled properly.  It took Claude lots of effort and the use of a repomix file set to try to debug this and it still failed to solve it.

It kept saying confidently that it could definitely see the problem, and then it proceeded to apply extensive and various code changes that would have no effect on the problematic UI behaviour.  Claude sonnet 4 was not able to get the true sign in form to work, but it was able to make a 'test authentication' component that was able to sign in.  When asked to make the sign in form work using the same logic as the working test authentication form, it could not achieve this even though it said that they were matching exactly.

I was about to roll back the repo to a prior checkpoint or try deleting all the related files and building them again, but somehow just switching to GPT-5 mini was enough for it to read the repomix and look at the problem, and understand that there was an issue with v-model not connecting the fields to the validator logic properly and the authentication issue was solved.

GPT-5 mini was then far more helpful for being able to troubleshoot further errors with supabase authentication tokens, vite environment variables, and detecting whether github environment secrets were successfully being injected in github action workflows. GPT-5 mini was also able to make the true sign in form work with the same logic as the test authentication component and get the project back on track.

So at this point, the project is switching from having claude Sonnet 4 be the coding agent to having GPT-5 mini be the coding agent for a (currently) much more effective, informative, and time-saving experience.

Claude in agent mode would go ahead and make speculative changes in hopes of them working, and so there are a lot of strange files left over like old .ts files left in place just so that tests that used to expect them can still pass.  Soon, it will be important to look for and clean up such unneeded files and tests.

