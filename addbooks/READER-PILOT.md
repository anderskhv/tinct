# Add a book → production-reader pilot

This branch implements one complete source-to-reader pilot for **The Time Machine**, H. G. Wells (1895), Gutenberg #35. Open `/reader?add=1` and select **Add and read**. The complete converted edition opens in the existing `LabApp` reader. Its chapters, pagination and reading position use the existing reader mechanisms.

The book does not enter `BOOKS`, the public catalogue, taxonomy, search, covers, SEO pages or sitemap. The reader has a separate, explicit allowlist (`pd-35`) and uses the existing validated one-use handoff. Repeating Add resumes the saved place. A failed download leaves a Retry button and creates no handoff.

**Release status:** implemented and verified against a locally served production build; not deployed. Earlier instructions prohibited deployment, and a live-release clarification is pending. Instruction baseline: `origin/main` at `5b1d90496` (2026-10-01 task). Branch: `codex/addbooks-reader-pilot`.

## Source and conversion

- Catalogue and US public-domain designation: https://www.gutenberg.org/ebooks/35
- Pinned HTML source: https://www.gutenberg.org/cache/epub/35/pg35-images.html
- Gutenberg terms: https://www.gutenberg.org/policy/license.html
- Source hash, output hash, counts and limitations: `app/public/data/imports/pd-35-provenance.json`.
- Output: `app/public/data/editions/pd-35-original-en.json`.
- 17 reading units (16 chapters + epilogue), 306 paragraphs, 32,310 whitespace-delimited words, 181,843 UTF-8 bytes (67,667 gzipped).

The converter uses Python's standard HTML parser. It keeps source chapter and paragraph order and wording, normalizes whitespace, decodes entities and removes the duplicated contents/title page and Gutenberg boilerplate. It explicitly removes a stray `>` after chapter IV's heading in the pinned source. All 23 italic spans retain their words but lose emphasis; restoring that formatting requires a supported reader representation. No modern-English edition, translation, character copy, narration or LLM generation is included.

The converter checks title, author, language, source checksum, every supported chapter tag, opening and closing text and chapter completeness. Changed upstream bytes fail closed until someone inspects and updates the source pin. This source-specific pilot uses HTML because the Gutenberg EPUB endpoint failed during acquisition. A general EPUB importer remains future work.

The original English text passes the conservative [Danish rights eligibility policy](DANISH-RIGHTS.md): Wells died in 1946 and the ordinary Danish economic term ended on 2016-12-31. Both the builder and the reader-only list require a documented edition review; missing or unresolved evidence excludes an edition. Source and converted bytes are pinned to that review. Gutenberg's US designation alone is never sufficient. This covers the original text only, not arbitrary translations, added material, covers or audio. The existing public library and separate US-based search dataset have not been audited by this change.

## Reproduce

From the repository root:

```sh
python3 addbooks/scripts/build-reader-pilot.py
```

The raw source cache is ignored at `addbooks/.cache/`. A fresh build downloads only the pinned, allowlisted source. No arbitrary URL, user upload or server fetch endpoint is exposed.

From `app/`, using Node 24.13.0:

```sh
npm ci
npm test
CI=true npm run build
npm run verify-bundle
node ../addbooks/scripts/verify-reader-pilot.mjs
npm run dev -- --mode reader-pilot --host 127.0.0.1 --port 4174 --strictPort
```

`CI=true` uses the repository's existing public client configuration for the production build. Local preview: http://127.0.0.1:4174/reader?add=1

The browser test starts an ephemeral localhost server for `app/dist`, launches isolated headless Chromium with muted audio, and blocks all API/external requests. If Chromium is not installed, install the browser required by the repository's existing Playwright dependency. Screenshots and the machine-readable browser report are in `addbooks/qa/reader-pilot/`.

## Verification record

- Baseline: 2,929 tests passed, one skipped.
- Final including Danish eligibility: 2,955 tests passed, one skipped; production build and `verify-bundle` passed.
- Danish gate: 22 regression checks cover term boundaries, joint contributors, translators, missing evidence, source substitution, artifact integrity, Python/browser agreement and revoked handoffs.
- Verified bundle: `index-CNOce9vu.js`.
- Desktop 1365×900 and phone 390×844: Add, failed-download retry, complete contents, chapter selection, page turns with consecutive source-word boundaries, short paragraphs sharing a page, reload/resume, repeated Add and epilogue. Explain selection was exercised with a labelled mock streaming response. No horizontal overflow or page errors.
- Screenshots capture the actual reader from the locally served production build. No LLM requests were made. The production companion routes were checked with GET requests (405 Method not allowed), which return before provider invocation.

## Local companion service and corrected pagination

Use the `reader-pilot` Vite mode in the command above. It forwards only `/api/chat` and `/api/lab-chat` to the existing service at `https://tinct.app`, preserving streaming. Plain Vite mode has a legacy chat handler and no guest companion endpoint, which caused Explain to fail in the initial preview. No API keys are placed in browser code; production retains its usual authentication, rate limits and usage charging. User-triggered companion requests use that service and its normal allowance. Automated QA substitutes labelled responses and does not invoke an LLM. This mode does not enable narration, voice sessions or unavailable editions.

The initial Add handoff incorrectly set `startAtSavedPlace`, a legacy exact-passage mode that replaced measured pages with rough budget estimates. At startup those estimates could be one paragraph per page. Unlisted handoffs now keep the normal measured page map and restore by saved source word. This also normalizes old handoffs and unlisted chapter links. Existing published-book passage behavior remains unchanged.

## Boundaries and follow-up

This proves a single book can pass through conversion and into the real reader without public-library publication. Runtime Add loads the already converted edition; it does not convert a new catalogue selection on demand. The large standalone search prototype remains on `codex/addbooks-search-prototype` and is not wired into this first import pilot.

Unlisted assets are accessible to anyone who knows their URL. This is not private file storage or an authenticated private library. Existing reading-position storage is reused; no Supabase schema, Worker, API, CI, dependency, taxonomy or registry changes were required. Browser QA verifies guest/local position persistence. Signed-in cross-device sync, offline installation, native Android and live AI generation were not tested. Explain UI and structured request context were checked with mocked provider responses. Narration is available on Play through the existing Grok path, gated by a separate narration-rights record (see the section below); its contents menu does not link to a nonexistent library introduction.

Next: approve and verify the unlisted live release; apply the Danish edition review to search candidates before connecting search to this flow; generalize the converter with source-specific structural checks and immutable source/edition IDs. Only then add durable import jobs, private ownership where needed, a separate licence-based eligibility path and broader book formats. Public-library publication remains a separate decision.

## Narration and feature audit — 2026-10-01 (Claude)

Narration for `pd-35/original-en` now uses the existing Grok path, gated by a separate record ([NARRATION-RIGHTS.md](NARRATION-RIGHTS.md)) in the reader and the Worker. `hasAudio: false` and the handoff's `audio: false` are unchanged: they describe pre-recorded editions, which this book does not have.

**Fixed:** the Worker's `/data/editions/` gate returned 404 for `pd-35-original-en.json` (not in `CONTENT_BOOK_IDS`), so the deployed reader would have shown "This edition is temporarily unavailable". The earlier QA used a plain static server, which hid this. Exact, currently eligible reviewed import files now pass.

**Verified locally (muted headless Chromium, desktop 1365×900 and phone 390×844; built app on `wrangler dev --local`; mock xAI and Supabase auth; no real provider):** no narration request on open or silent reading; Play; word highlighting advances; pause (no further requests) and resume from the start of the paused sentence; tap-a-word seek; back 15 s; timeline seek (desktop) and forward 15 s (phone); chapter end hands off to the next chapter while playing; a provider failure shows Retry and Retry recovers; a guest replays cached audio with zero provider calls; a guest on an uncached chapter gets the account prompt with zero calls; a signed-in reader over a tiny daily ceiling sees "Daily narration limit reached." with zero calls. Evidence: `addbooks/qa/pilot-narration/`. Re-run with `addbooks/scripts/narration-mock-server.mjs` and `verify-pilot-narration.mjs`.

**Not verified:** real xAI audio quality, latency or timing alignment; production deployment; WebKit; physical phones, lock screen, AirPods, Android.

**Code review only (no live check):** position sync, Explain/Ask, Primer, recap, catch-up, issue reports, listen/usage reporting and chat history accept `pd-35`. They read the edition through ASSETS and have no catalogue check.

**Known gaps:** no `covers/v2/pd-35.webp`, so Media Session artwork and the book-switcher cover are missing. The library has no Continue/Reading-now row for the book. Code reading suggests that in some states the place could fall into the Bible row; this is unverified. Talk's reading history leaves the book out. Approved text fixes would never apply, because patches are skipped by design for pinned imports. If the text review lapses, the reader gets 404 but Worker-side ASSETS readers (chat, recap) can still read the file.
