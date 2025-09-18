# Two-Stage Story Generation With Clarifying Questions

Goal
- Let the LLM ask targeted clarification questions before story generation, while preserving context across requests using the Gemini free tier and a stateless edge function (gemini-proxy).

Constraints
- Edge function requests are stateless today.
- Free tier usage; avoid long conversation threads and large token footprints.
- GitHub Pages frontend + Supabase backend available.

Overview
- Stage A (Clarify): Frontend sends initial tags/brief to gemini-proxy with mode="clarify". The model returns a small list of specific questions in JSON.
- Stage B (Generate): Frontend sends the original brief + the Q&A answers as a compact context object with mode="generate". Model returns the final story JSON. No server-side conversation state is required.

Client State Options (pick 1 now, add others later)
1) Frontend-only state (recommended for free tier):
   - Keep a sessionId (UUID) in memory/localStorage.
   - Maintain { initialBrief, questions[], answers[], contextSummary } and send it with each call.
   - Pros: free, simple, zero DB writes until generation is accepted.
2) Supabase persisted drafts (optional, later):
   - Table story_drafts(id, user_id, session_id, initial_brief, questions, answers, context_summary, status, updated_at).
   - Allows resuming across devices and rate limiting.

Proposed Request Schema (edge function)
- POST /functions/v1/gemini-proxy
- Body
  - mode: "clarify" | "generate"
  - sessionId: string (client generated)
  - userId: optional
  - brief: { title?, description?, type, tags: { themes[], characters[], plot_points[] }, constraints? }
  - qa: { questions: [{id, text}], answers: [{id, text}] }
  - contextSummary: optional short string produced by the client after Q&A (see below)
  - responseFormat: "json" (strict)

Prompting Strategy
- Clarify mode system prompt (summarized):
  - "You are a story editor. Ask up to 3 short, high-impact questions that would materially improve the story given the brief. Do not generate the story. Reply JSON: {questions:[{id,text}]}"
- Generate mode system prompt:
  - "You are a story generator. Use the brief, and the following Q&A context, to produce a story. Respect type/length limits. Reply strictly as JSON per schema."

JSON Schemas (examples)
- Clarify response
  - { "questions": [ { "id": "q1", "text": "What's the protagonist's core flaw?" }, ... ] }
- Generate request extras
  - Include { brief, qa, contextSummary, constraints: { maxWords, type, tone } }
- Generate response (strict)
  - { "title": "...", "type": "short_story", "wordCount": 1200, "summary": "...", "content": "...", "tags": { ... } }

Maintaining Context Without Server Sessions
- Always send both the initial brief and the distilled Q&A.
- After collecting answers, build a compact contextSummary on the client:
  - Example: "Setting: 1980s coastal town; Protagonist: shy diver seeking redemption; Tone: bittersweet adventure; Must-have: near-miss meeting turns to conflict; Ending: hopeful." (<= ~300 chars)
- The edge function includes this in the model prompt. This keeps tokens small while preserving intent.

Error Handling & Resilience
- If clarify returns 0 questions, proceed to generate directly.
- If any JSON parse issues occur, attempt a single retry with a stronger JSON-enforcer instruction and smaller temperature.
- Timeouts: 20–30s; show a retry CTA. Log errors (user_id, sessionId) for triage.

UI Flow
1) User opens "Generate New Story" and fills tags/brief.
2) Frontend calls gemini-proxy(mode=clarify). Show 1–3 questions as a compact stepper.
3) After answers, render a summary chip (contextSummary) for user confirmation.
4) Call gemini-proxy(mode=generate) with brief + qa + contextSummary.
5) Show preview; user can save to DB or retry.

Testing (TDD)
- Unit: clarify parser, contextSummary builder, request payload builder.
- Integration: mock gemini-proxy to return sample questions/stories; assert UI state transitions.
- Property tests (optional): ensure contextSummary never exceeds length budget.

Security & Abuse Controls
- Rate limit clarify/generate per sessionId + user.
- Strip PII from prompts; sanitize answers.
- Enforce max input lengths on tags and answers.

Roadmap Extensions
- Optional server-side conversation memory (short-term cache keyed by sessionId in Supabase) with TTL 10–30 min.
- Multi-turn clarifications (2 rounds) with a strict cap.
- Streaming generation (SSE) for better UX.
