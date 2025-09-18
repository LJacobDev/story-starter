# Copilot Working Memory Reference

## Current Project State
- **Last Known Good State**: All unit tests passing; auth + email verification working on GitHub Pages with hash routing; logout is idempotent and persistent.
- **Currently Working**: Phase 3, task 3.1.1a.2 — StoryCard implementation under TDD; tests are green after stabilizing VerifyEmail no-token spec.
- **Last Test Results**: All tests passing locally (Vitest) after making the VerifyEmail failure test robust.
- **Known Issues**:
  - Some legacy files/tests may be redundant from earlier agent passes; defer cleanup until after Phase 3 MVP is stable.

## Key File Relationships
- `src/lib/supabase.ts` creates client; tests mock via utils/supabase.
- `src/views/VerifyEmail.vue` handles token-based and tokenless success flows.
- `tests/unit/VerifyEmail.failure.spec.ts` now uses fake timers to advance the internal delay and mocks `useAuth.user`.
- `src/components/stories/StoryCard.vue` shows image/SVG fallback and badges via inline spans.

## Recent Changes Made
- Hardened `tests/unit/VerifyEmail.failure.spec.ts`:
  - Use `vi.useFakeTimers()` and `advanceTimersByTimeAsync(60)` to pass the 50ms settle delay.
  - Mock `useAuth` to include a `user: { value: null }` ref-like object.
- All tests pass.

## Next Steps Plan (Phase 3)
1) Proceed to 3.1.1b.1 — write tests for `StoryGrid` (responsive + skeleton + empty).
2) Implement `StoryGrid` to satisfy tests.
3) Wire `Home` per guest vs auth grids.

## Verification Plan
- Keep vitest watch running; add grid tests first.

## Rollback Plan
- Revert test edits if timing assumptions change; or expose a data-testid for the error state and assert that instead.

## Human-parsable summary
- Stabilized a flaky VerifyEmail no-token test by aligning with component timing and state; suite is green. Ready to continue card/grid work.

---

Update timestamp: 2025-09-18. Maintain this file before and after each major task.

# note added by developer

Claude Sonnet 4 had huge problems at around task 2.1.1, 2.1.2, where it couldn't solve an authentication / validation glitch where the sign in fields kept showing 'field required' and disabling the 'sign in' button, even when filled properly.  It took Claude lots of effort and the use of a repomix file set to try to debug this and it still failed to solve it.

It kept saying confidently that it could definitely see the problem, and then it proceeded to apply extensive and various code changes that would have no effect on the problematic UI behaviour.  Claude sonnet 4 was not able to get the true sign in form to work, but it was able to make a 'test authentication' component that was able to sign in.  When asked to make the sign in form work using the same logic as the working test authentication form, it could not achieve this even though it said that they were matching exactly.

I was about to roll back the repo to a prior checkpoint or try deleting all the related files and building them again, but somehow just switching to GPT-5 mini was enough for it to read the repomix and look at the problem, and understand that there was an issue with v-model not connecting the fields to the validator logic properly and the authentication issue was solved.

GPT-5 mini was then far more helpful for being able to troubleshoot further errors with supabase authentication tokens, vite environment variables, and detecting whether github environment secrets were successfully being injected in github action workflows. GPT-5 mini was also able to make the true sign in form work with the same logic as the test authentication component and get the project back on track.

So at this point, the project is switching from having claude Sonnet 4 be the coding agent to having GPT-5 mini be the coding agent for a (currently) much more effective, informative, and time-saving experience.

Claude in agent mode would go ahead and make speculative changes in hopes of them working, and so there are a lot of strange files left over like old .ts files left in place just so that tests that used to expect them can still pass.  Soon, it will be important to look for and clean up such unneeded files and tests.

