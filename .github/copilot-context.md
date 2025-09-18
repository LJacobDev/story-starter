# Copilot Working Memory Reference

## Current Project State
- **Last Known Good State**: All unit tests passing; auth + email verification working on GitHub Pages with hash routing; logout is idempotent and persistent.
- **Currently Working**: Phase 3 — 3.1.1d done (StoryCard image fallback + a11y). Next: 3.1.2 data wiring to Supabase.
- **Last Test Results**: All tests green (134/134). Some expected Vue router warnings in unit tests without a router; harmless.
- **Known Issues**:
  - Some legacy files/tests may be redundant; defer cleanup until after Phase 3 MVP.

## Key File Relationships
- `src/components/stories/StoryCard.vue` now provides:
  - <img> with descriptive alt when imageUrl exists.
  - SVG fallback wrapped in a container with `aria-hidden="true"` on the SVG and an `sr-only` text label.
- `src/components/stories/StoryGrid.vue` consumes StoryCard.
- `src/views/Home.vue` renders `StoryGrid` sections by auth state.

## Recent Changes Made
- [2025-09-18]: Added `tests/unit/StoryCard.a11y.spec.ts` covering fallback rendering and basic axe scan (serious/critical violations only). Installed `vitest-axe` and `axe-core`.
- [2025-09-18]: Updated `StoryCard.vue` to set `aria-hidden` on fallback SVGs, added `sr-only` text on placeholder, preserved alt text on images. Tests now pass.
- [2025-09-18]: Previously wired `Home.vue` to render H1/H2 sections and grids per auth state, sorted newest-first.

## Next Steps Plan (Phase 3)
1. 3.1.2 — Replace Home placeholder arrays with Supabase queries:
   - Public stories (is_private=false), and user-owned stories.
   - Loading/error states, pagination (page size 12), "Show more".
   - TDD: tests for composables fetching, Home integration with loading and empty states.
2. 3.1.3 — Search and filter UI (title/type/date/privacy) with tests.

## Verification Plan
- Unit: `StoryCard.a11y.spec.ts` asserts image alt, fallback SVG `aria-hidden`, presence of `sr-only` label, and no serious/critical axe violations.
- Manual: Inspect a StoryCard with and without image; verify screen readers ignore SVG and announce placeholder text.

## Rollback Plan
- If a11y regressions appear, revert `StoryCard.vue` to prior commit; tests will flag violations.

## Human-parsable summary
- A11y for StoryCard is in place: descriptive alt for images, hidden SVG fallback with screen-reader label. Test suite is green (134/134). Ready to wire real data to grids.

---

Update timestamp: 2025-09-18. Maintain this file before and after each major task.

# note added by developer

Claude Sonnet 4 had huge problems at around task 2.1.1, 2.1.2, where it couldn't solve an authentication / validation glitch where the sign in fields kept showing 'field required' and disabling the 'sign in' button, even when filled properly.  It took Claude lots of effort and the use of a repomix file set to try to debug this and it still failed to solve it.

It kept saying confidently that it could definitely see the problem, and then it proceeded to apply extensive and various code changes that would have no effect on the problematic UI behaviour.  Claude sonnet 4 was not able to get the true sign in form to work, but it was able to make a 'test authentication' component that was able to sign in.  When asked to make the sign in form work using the same logic as the working test authentication form, it could not achieve this even though it said that they were matching exactly.

I was about to roll back the repo to a prior checkpoint or try deleting all the related files and building them again, but somehow just switching to GPT-5 mini was enough for it to read the repomix and look at the problem, and understand that there was an issue with v-model not connecting the fields to the validator logic properly and the authentication issue was solved.

GPT-5 mini was then far more helpful for being able to troubleshoot further errors with supabase authentication tokens, vite environment variables, and detecting whether github environment secrets were successfully being injected in github action workflows. GPT-5 mini was also able to make the true sign in form work with the same logic as the test authentication component and get the project back on track.

So at this point, the project is switching from having claude Sonnet 4 be the coding agent to having GPT-5 mini be the coding agent for a (currently) much more effective, informative, and time-saving experience.

Claude in agent mode would go ahead and make speculative changes in hopes of them working, and so there are a lot of strange files left over like old .ts files left in place just so that tests that used to expect them can still pass.  Soon, it will be important to look for and clean up such unneeded files and tests.

