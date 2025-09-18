# Copilot Working Memory Reference

## Current Project State
- **Last Known Good State**: All unit tests passing; auth + email verification working on GitHub Pages with hash routing; logout is idempotent and persistent.
- **Currently Working**: Phase 3 — 3.1.1c done (Home wired with StoryGrid for guest/auth). Next: 3.1.1d (a11y + polish) then 3.1.2 (load stories from Supabase).
- **Last Test Results**: All tests green (132/132). Some expected Vue warnings in tests (router-link injection) but non-fatal.
- **Known Issues**:
  - Some legacy files/tests may be redundant; defer cleanup until after Phase 3 MVP.

## Key File Relationships
- `src/views/Home.vue` uses `useAuth.isAuthenticated` to branch sections and renders `StoryGrid` sections with H1/H2 semantics.
- `src/components/stories/StoryGrid.vue` renders responsive grid, 12 skeletons when loading, and empty state; consumes `StoryCard`.
- `src/components/stories/StoryCard.vue` presentational card with image or SVG fallback and Tailwind badge spans.
- `src/utils/formatDate.ts` formats createdAt for display (used by card/rendering later).

## Recent Changes Made
- [2025-09-18]: Modified `src/views/Home.vue` to:
  - Add page H1 "Stories" and H2 section headings per auth state.
  - Render one grid for guests ("Public Stories").
  - Render two grids for authed users ("Your Stories" then "All Public Stories").
  - Provide placeholder arrays and default sort (newest first) to satisfy tests.
- Prior: Implemented `StoryGrid.vue` and its tests; hardened VerifyEmail failure spec.

## Next Steps Plan (Phase 3)
1. 3.1.1d — A11y and UX polish:
   - Keyboard focus states on cards, aria-labels for badges/icons, section landmark roles, and heading hierarchy tests.
2. 3.1.2 — Data wiring:
   - Replace placeholder arrays with Supabase queries (public + user-owned), loading states, error handling, pagination.
3. 3.1.3 — Filters/search UI (title/genre/type/date/privacy) with composables and tests.

## Verification Plan
- Unit: Home stories-grid specs verify headings, section order, and default sort.
- Manual: Run `npm run dev` →
  - Guest: see H1 "Stories", one section "Public Stories" with grid.
  - Authed: see H1, two sections ordered: "Your Stories" then "All Public Stories".
  - Check newest-first ordering in each section.

## Rollback Plan
- If regressions occur, revert `src/views/Home.vue` to previous version; StoryGrid and tests will guard grid contracts.

## Human-parsable summary
- Home is now wired to present story grids per auth state using StoryGrid and placeholder data, sorted newest-first. Test suite is green (132/132). Ready to proceed with a11y polish and then Supabase data fetching.

---

Update timestamp: 2025-09-18. Maintain this file before and after each major task.

# note added by developer

Claude Sonnet 4 had huge problems at around task 2.1.1, 2.1.2, where it couldn't solve an authentication / validation glitch where the sign in fields kept showing 'field required' and disabling the 'sign in' button, even when filled properly.  It took Claude lots of effort and the use of a repomix file set to try to debug this and it still failed to solve it.

It kept saying confidently that it could definitely see the problem, and then it proceeded to apply extensive and various code changes that would have no effect on the problematic UI behaviour.  Claude sonnet 4 was not able to get the true sign in form to work, but it was able to make a 'test authentication' component that was able to sign in.  When asked to make the sign in form work using the same logic as the working test authentication form, it could not achieve this even though it said that they were matching exactly.

I was about to roll back the repo to a prior checkpoint or try deleting all the related files and building them again, but somehow just switching to GPT-5 mini was enough for it to read the repomix and look at the problem, and understand that there was an issue with v-model not connecting the fields to the validator logic properly and the authentication issue was solved.

GPT-5 mini was then far more helpful for being able to troubleshoot further errors with supabase authentication tokens, vite environment variables, and detecting whether github environment secrets were successfully being injected in github action workflows. GPT-5 mini was also able to make the true sign in form work with the same logic as the test authentication component and get the project back on track.

So at this point, the project is switching from having claude Sonnet 4 be the coding agent to having GPT-5 mini be the coding agent for a (currently) much more effective, informative, and time-saving experience.

Claude in agent mode would go ahead and make speculative changes in hopes of them working, and so there are a lot of strange files left over like old .ts files left in place just so that tests that used to expect them can still pass.  Soon, it will be important to look for and clean up such unneeded files and tests.

