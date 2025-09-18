# Copilot Working Memory Reference

## Current Project State
- **Last Known Good State**: All unit tests passing; auth + email verification working on GitHub Pages with hash routing; logout is idempotent and persistent.
- **Currently Working**: Phase 3 — 3.1.2a useStories TDD. Initial tests and implementation added.
- **Last Test Results**: All tests green (141/141). Some expected Vue router warnings in unit tests without a router; harmless.
- **Known Issues**:
  - Some legacy files/tests may be redundant; defer cleanup until after Phase 3 MVP.

## Key File Relationships
- `src/components/stories/StoryCard.vue` provides accessible image/fallback.
- `src/components/stories/StoryGrid.vue` consumes StoryCard.
- `src/views/Home.vue` renders sections with StoryGrid (placeholder data for now).
- `src/composables/useStories.ts` now encapsulates story fetching, pagination, filtering, and search.

## Recent Changes Made
- [2025-09-18]: Added `tests/unit/useStories.spec.ts` to drive TDD for data fetching (public/mine, pagination, search across title/content/genre/description, type/privacy filters, exact count, hasMore, error handling).
- [2025-09-18]: Implemented `src/composables/useStories.ts` with `fetchPublic` and `fetchMine`, internal `runQuery` handling ordering, count: 'exact', search OR, and pagination with hasMore logic. All tests pass.

## Next Steps Plan (Phase 3)
1. 3.1.2b — Integrate `useStories` into `Home.vue`:
   - Replace placeholders, wire loading/empty/error states, and add "Show more" to append pages.
   - For guests, include marketing hero beside/above grid per spec.
   - TDD: create Home integration tests (loading, append, error, empty).
2. 3.1.2c — Search and filter UI controls with tests.

## Verification Plan
- Unit: `useStories.spec.ts` asserts exact count, ordered queries, correct range, and hasMore computation; search/type/privacy filters; error propagation.
- Manual (later when integrated): navigate Home and verify paging and states.

## Rollback Plan
- If regressions occur, revert `useStories.ts` and tests, and restore placeholder data in Home.

## Human-parsable summary
- Added a tested `useStories` composable using Supabase query builder with exact counts and pagination. Suite now 141/141 passing. Ready to integrate into Home with "Show more" and marketing content for guests.

---

Update timestamp: 2025-09-18. Maintain this file before and after each major task.

# note added by developer

Claude Sonnet 4 had huge problems at around task 2.1.1, 2.1.2, where it couldn't solve an authentication / validation glitch where the sign in fields kept showing 'field required' and disabling the 'sign in' button, even when filled properly.  It took Claude lots of effort and the use of a repomix file set to try to debug this and it still failed to solve it.

It kept saying confidently that it could definitely see the problem, and then it proceeded to apply extensive and various code changes that would have no effect on the problematic UI behaviour.  Claude sonnet 4 was not able to get the true sign in form to work, but it was able to make a 'test authentication' component that was able to sign in.  When asked to make the sign in form work using the same logic as the working test authentication form, it could not achieve this even though it said that they were matching exactly.

I was about to roll back the repo to a prior checkpoint or try deleting all the related files and building them again, but somehow just switching to GPT-5 mini was enough for it to read the repomix and look at the problem, and understand that there was an issue with v-model not connecting the fields to the validator logic properly and the authentication issue was solved.

GPT-5 mini was then far more helpful for being able to troubleshoot further errors with supabase authentication tokens, vite environment variables, and detecting whether github environment secrets were successfully being injected in github action workflows. GPT-5 mini was also able to make the true sign in form work with the same logic as the test authentication component and get the project back on track.

So at this point, the project is switching from having claude Sonnet 4 be the coding agent to having GPT-5 mini be the coding agent for a (currently) much more effective, informative, and time-saving experience.

Claude in agent mode would go ahead and make speculative changes in hopes of them working, and so there are a lot of strange files left over like old .ts files left in place just so that tests that used to expect them can still pass.  Soon, it will be important to look for and clean up such unneeded files and tests.

