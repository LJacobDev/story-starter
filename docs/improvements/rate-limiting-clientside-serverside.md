# Rate limiting — practical guidance (client-side & server-side)

Purpose
- Practical, implementation-focused guidance for protecting endpoints that can be abused by repeated requests (resend verification, AI generation, etc.).

Principles
- Enforce limits closest to the resource owner (server-side authoritative limits).
- Use client-side controls for good UX and to reduce accidental retries.
- Fail gracefully: show clear UI messages and a cooldown indicator rather than raw errors.

Client-side strategies
- Immediate UX controls
  - Disable the action button after click and show a countdown (e.g., "Resend available in 59s").
  - Provide optimistic success/failure messaging and an explicit error message if a 429 is returned.
- Local rate-smoothing
  - Debounce rapid clicks (300–500ms) to avoid accidental duplicate calls.
  - Limit retries client-side with exponential backoff (e.g., wait 1s, 2s, 4s, 8s), capped at a small number (3 attempts).
- Persistent cooldown
  - If server returns a cooldown window, persist it in memory and optionally in localStorage so page reloads still reflect the cooldown.
- Idempotency and deduplication
  - Coalesce concurrent UI attempts into a single request.
- Throttling UI heuristics
  - If the user reaches client-side attempt limits, show actionable guidance (wait, check email, contact support).

Server-side strategies (authoritative)
- Use per-identity and global limits
  - Per-user (by user ID / email) limit: e.g., 3 resends per hour, 10 per day.
  - Per-IP limit: guard against anonymous abuse (e.g., 30 requests/hour).
  - Per-endpoint limits: generation endpoints often need stricter controls.
- Fast path rejection
  - On limit hit, return 429 with a Retry-After header (seconds or HTTP-date). Include a machine-readable JSON body with reason and retry window.
- Persistent counters
  - Store counters with TTL in a fast store (Redis) or in a DB table with timestamped events. For serverless, prefer a managed store (Redis, Cloudflare Workers KV, or Postgres table with efficient indexing).
- Sliding window vs fixed window
  - Sliding-window counters (token bucket/leaky bucket) give smoother behavior for burst tolerance; fixed window is simpler and acceptable for coarse limits.
- Global circuit breaker
  - If the endpoint experiences sustained high failure or abuse, flip a temporary hard limit and surface a maintenance message to clients.
- Backoff guidance
  - Prefer exponential backoff + jitter server-side for retryable errors; do not ask clients to retry rapidly when 429 is returned.

Security considerations
- Require authenticated requests where possible for expensive operations.
- Do not ship sensitive service keys to the browser — perform privileged operations (resend using a key) from a server/edge function.

UX & messaging
- Humans-first messages: "Verification email resent. Check your inbox. If you don't see it, try again in 5 minutes." or on 429: "You’ve requested too many emails. Try again in X minutes.".
- Show cooldown timers and an optional "Contact support" link when limits are reached.
- Make the resend action discoverable but not prominent enough to encourage abuse.

Testing
- Unit tests: mock 429 responses and ensure client shows cooldown UI and disables actions.
- Integration tests: simulate many requests to ensure server counters increment and 429s are returned.
- Load tests: for expensive endpoints (AI generation) run synthetic traffic to validate autoscaling + rate limits.

Recommended default limits (example starting points)
- Resend verification: 3 per hour, 10 per day.
- Authentication attempts: 5 per 10 minutes (with CAPTCHA after threshold).
- AI generation (anonymous): 10 requests/day per IP; authenticated users: 100/day per user (adjust per cost).

Implementation notes (Supabase & Edge Functions)
- Avoid calling Supabase server-only APIs directly from the browser when a service key is required. Use an Edge function (e.g., `resend-verification`) that authenticates with a server key and enforces limits.
- In Edge functions, use a Redis-like store or a Postgres table to record request timestamps and compute limits.
- For Gemini/API calls: implement server-side request queueing/batching and a strict per-user rate limiter; surface 429s and Retry-After to the client.

Monitoring & observability
- Log limit hits, 429 responses, and blocked IPs.
- Create alerts for sudden spikes in limit hits.
- Expose metrics: requests, allowed, blocked, average wait time.

Rollout & tuning
- Start conservative, monitor usage, then loosen limits if legitimate users are blocked.
- Provide a way for support to whitelist or investigate blocked accounts.

This guidance is intended to be concrete and implementable; adjust numeric limits to match your product's risk and cost model.
