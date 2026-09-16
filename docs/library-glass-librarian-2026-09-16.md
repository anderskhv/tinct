# Library glass reel and librarian

Status: implementation approved by Anders on September 16, 2026; implementation and release pending.

## Approved visual reference

Use [mobile](design/library-glass-reference-mobile.html) and [desktop](design/library-glass-reference-desktop.html) as the approved visual direction. They are self-contained design fragments, not production components. They preserve existing book descriptions and artwork. The subsequent Explore / Subject dropdown experiment was rejected and must not be implemented.

The approved library has a shallow 3D draggable cover reel, cover-derived ambient lighting, a short existing summary and one estimated reading-time number. Below the time, reveal the first real category and tops of its book covers, flowing naturally into the full Houses -> Shelves -> Books catalogue. Do not restore a See full library link or add a Browse by / Explore menu. Bottom controls are Search, Talk, Chat in that order within one shared Photos-inspired translucent capsule. Covers/content remain visible behind the glass. Keep Safari blur/highlight fallback; Chromium refraction is progressive enhancement, never a reason to lose controls or contrast. Respect reduced motion, keyboard, touch, mobile safe areas and keyboard occlusion. Do not embed the mockup's base64 copies in shipped code: use existing cover assets and current discoverable catalogue.

## Functional completion

- Search expands into an actual search field and searches the full eligible catalogue, with selectable results and the existing reader-entry path. Preserve search draft on close/reopen. Clear and empty states should work.
- Chat expands into a composer and opens an actual librarian conversation. Reuse current authenticated streaming text infrastructure and account/usage policy. Scope its prompt to helping choose a book across the available library; use accurate catalogue descriptions, availability and reading-time estimates, ask at most one useful preference question at a time, and offer a small number of recommendations. Recommendations must resolve to real eligible book IDs with usable cover/title links into the existing entry flow. Do not claim unavailable editions, live popularity, or external sources without evidence. Handle cancellation, streaming, retry, auth/sign-out and stale responses.
- Talk opens the standard current voice surface and provider, with a library-selection prompt and catalogue context. Preserve existing mute/end/reconnect/error states. Start microphone only after an explicit user action. A library conversation must not present reader-specific text such as Ask about this page or mutate any reading position. Offer book choices through existing UI/tool mechanisms where feasible; do not invent a different voice paradigm. The speculative future talking-cover showcase is outside this release.
- Library conversations must not pollute book-scoped chat history or inherit a random reader book. Use an explicit library context and an isolated lifecycle; preserve the current database schema and billing policy. If persistent library history would require a schema/product decision, use an in-memory session for this initial feature and document that limit rather than writing into a book row.
- Preserve returning-reader Reading now / Finished, recaps, account-confirmed boot and saved resume tuples. The mockup only illustrates the new-reader hero. Do not replace returning readers' saved state with demo data.
- Preserve entry/Before you begin and edition defaults: another workstream owns those. No content authoring, translation changes, ranking claims or new dependencies.

## Integration evidence and starting points

Read current main and AGENTS.md before work; static source paths may evolve. The public library is served through app/public/lab/index.html, library-model.js, catalogue-runtime.js, interaction-runtime.js and entry.css, with labLibraryBoot.ts owning the account-scoped first-paint snapshot. It is not the legacy BookStore.tsx alone. Trace the served route before modifying it.

Current main useLabAsk.ts is a reader-centric hook with book-scoped history, passage tools, account gating, streaming typed turns and voice session integration. LabVoiceCall.tsx, labVoiceCall.ts, LabVoiceDesktop.tsx and useVoiceSession provide existing voice UI/session behavior. A plain link to Chat/Talk in an arbitrary book is not a library librarian. Trace worker request validation/prompts/tools and retain auth enforcement. Read the active reader/voice changes before reuse; do not overwrite concurrent changes.

## Verification and release

Work in the configured Tinct cloud coding environment. Historical Documents sources are preservation-only. Keep this branch or preserve these references on the implementation branch. Do not deploy reference-only commits. Reconcile against current main before release and keep deployment serialized.

Add focused regressions covering catalogue search/recommendation eligibility, library-vs-book context/history isolation, sign-out/stale async responses, microphone start/end cleanup, and preservation of returning-reader resume. Run npm test, npm run build and npm run verify-bundle from app on Node 24.13.0; run python3 scripts/check-docs.py. No Anthropic API calls during development; mock typed provider acceptance at its transport boundary. Automated browser checks must be isolated headless and silent, with simulated microphone/provider behavior where needed and no personal browser use. Clearly distinguish mocked provider checks from actual voice-service validation. Physical/audible acceptance requires an agreed testing window.

Release through GitHub Actions using the approved npm run deploy path after gates pass; verify production library on mobile ~390x844 and desktop, actual new bundle and reader entry/resume. Update product-current and this plan with tests, screenshots, bundle hash, run links and honest remaining verification limits. Do not stop at a PR or call a reference-only branch a completed feature.

## Current checkpoint

The exact pre-Explore mobile and desktop references have been copied to the remote implementation branch. No production code has changed and no deployment has occurred. This existing desktop task has no direct cloud shell; explicit creation of a cloud continuation or authorization of the existing Developer fallback was requested because task creation requires an explicit user instruction. Next action: start the authorized execution route with this brief and both references, implement, verify and release.
