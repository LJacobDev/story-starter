# Copilot Working Memory Reference

## Current Project State
- **Last Known Good State**: N/A (no commit hash recorded in workspace snapshot). Last functional checkpoint: runtime auth UI fixed so SignIn/SignUp submit real values (Input v-model fix applied); many unit tests still failing in CI/local test runs.
- **Currently Working**: Stabilize unit tests and test environment (Option B): make supabase utilities test-friendly, guard composables that use Vue lifecycle hooks, and provide mocks/setup for Vitest so tests do not depend on real network or missing environment variables.
- **Last Test Results**: 89 tests run, 70 passed, 19 failed (observed during most recent test execution). Key failures were caused by missing Supabase env vars, lifecycle hook warnings from composables, and some assertion mismatches.
- **Known Issues**:
  - `src/utils/supabase.ts` threw when VITE env vars were missing; tests depended on that module at load time.
  - Composables (e.g., `useAuth`) called `onMounted` unguarded, producing warnings/errors when invoked in pure unit tests outside component setup.
  - Some tests expected a previous `useAuthForm` API shape; this was restored but some message/validation string mismatches remain.
  - Some tests attempted network requests to Supabase causing ECONNREFUSED or flaky failures.

## Key File Relationships
- `src/components/ui/Input.vue` depends on: native input props/attributes; must implement Vue 3 v-model contract (`modelValue` + `update:modelValue`).
- `SignInForm.vue` / `SignUpForm.vue` use: `useAuth()` composable and `Input.vue` components; they expect `useAuth` to expose `signIn` and `signUp` methods and `isLoading` state.
- `src/composables/useAuth.ts` depends on: `src/utils/supabase.ts` client; sets up auth state and exposes `signIn`, `signUp`, `signOut`, `user`, `session`, `isLoading`.
- `src/composables/useAuthForm.ts` is used by form tests and components; tests expect an API containing: `formData` object, `errors` ref, `isLoading`, `hasBeenSubmitted`, `isValid`, `canSubmit`, `validateField`, `validateForm`, `resetForm`, `handleSubmit`.
- `src/utils/supabase.ts` is the single place constructing or returning the Supabase client; tests import this indirectly via composables and utilities.

## Recent Changes Made
- 2025-09-16: Edited `src/components/ui/Input.vue` to implement Vue 3 v-model binding (ensures parent receives typed input values).
- 2025-09-16: Updated `src/components/SignInForm.vue` and `src/components/SignUpForm.vue` to use local refs, added basic client-side validation, and removed noisy debug logs.
- 2025-09-16: Removed temporary test-auth UI from `src/App.vue`.
- 2025-09-16: Restored `src/composables/useAuthForm.ts` API to match test expectations (formData, errors ref, validation helpers).
- 2025-09-16: Edited `src/utils/supabase.ts` to avoid throwing during test runs: returns a harmless stub client when running in test mode and exposes `getSupabaseClient()` and `resetSupabaseClient()`.
- 2025-09-16: Edited `src/composables/useAuth.ts` to guard `onMounted` usage (uses `getCurrentInstance()` to decide whether to call `onMounted` or register a listener directly) so it is safe in unit tests.

## Next Steps Plan
1. Add a Vitest setup/mocks file to provide stable test-time Supabase mocks:
   - Create `tests/setup` or `tests/mocks/supabase.ts` and register it in `vitest.config.ts` `setupFiles` so tests get a predictable mock of `supabase.auth` methods.
   - Alternatively, add module mocks in `tests/__mocks__` or use Vitest `vi.mock()` in test suites to replace the network calls.
2. Re-run the test suite and capture failing assertions:
   - Fix message/validation string mismatches in `useAuthForm` or in tests depending on intended behavior.
   - Where tests intentionally exercise auth flows, provide per-test mocks that return expected shapes (user/session or errors).
3. Ensure `src/utils/supabase.ts` behavior is compatible with both development and test environments:
   - Keep strict environment checks in non-test modes (throw when required env vars are missing).
   - In test mode, allow injection of test doubles via `resetSupabaseClient()`.
4. Iterate until all tests pass; if tests depend on lifecycle, prefer running composable code inside test fixture components or rely on guarded logic implemented already.

## Verification Plan
- How I will test changes:
  - Run `npm run test` locally (Vitest) and verify no module-load errors related to Supabase env vars and no lifecycle warnings from composables.
  - Confirm the `Input.vue` v-model unit test passes and that SignIn/SignUp components send non-empty values to `useAuth` methods when used in the browser.
- Manual test checklist for developer:
  1. Run `npm run test` and note any failing tests and stack traces.
  2. If tests attempt network calls, run `npm run test` after adding the Vitest setup mock and verify network calls are replaced by stubs.
  3. Start the dev server `npm run dev` and exercise authentication UI: fill in email/password fields and submit — ensure Supabase calls are made (in dev mode they will reach Supabase if env vars are configured) and no console exceptions appear.
- Success criteria:
  - No tests fail due to missing env vars or onMounted lifecycle warnings.
  - Unit test pass count increases and network-related flakiness is eliminated.

## Rollback plan
- If these changes cause regressions, revert the edited files:
  - `git checkout -- src/utils/supabase.ts src/composables/useAuth.ts` (or restore from previous commit).
- Alternatively, create a short patch that reverts only the test-mode fallback and re-run tests to compare.

## Complexity Warning Signs
- [ ] More than 5 files need changes to make tests pass.
- [ ] Tests rely on network access or external service availability.
- [ ] Composables using lifecycle hooks being exercised directly in unit tests without component wrappers.
- [ ] Tests depend on exact validation text strings across multiple files.

## Assumptions about the project that changed
- Initial assumption: tests only needed UI fixes (Input v-model).  
- New information learned: tests also depend on module-level Supabase client creation (which threw when env vars are missing) and the composables used lifecycle hooks in ways that caused warnings in tests.

## Human-parsable summary of state and insights
- The runtime bug that caused empty auth fields was fixed by implementing v-model in the custom `Input` component and updating the form components to use local refs.  
- The test suite still fails due to environment and lifecycle issues: `src/utils/supabase.ts` needs to be test-friendly and `useAuth` needs to avoid unguarded `onMounted` calls — both have been addressed with conservative edits that provide test-mode stubs and guarded initialization logic.  
- Next immediate work is to add controlled Vitest mocks for Supabase and re-run tests; this will likely surface the remaining assertion-level failures that should be resolved by aligning validation messages or adjusting tests.


---

*This file is updated by GitHub Copilot on 2025-09-16 to reflect the current working memory. Update again after each major task to record the new state.*