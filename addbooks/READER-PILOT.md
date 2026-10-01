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

The underlying English text is public domain in the USA according to Gutenberg. Publication year is 1895; Wells died in 1946. Gutenberg's US designation alone is not a worldwide rights policy. Further catalogue expansion needs explicit jurisdiction/edition checks and source terms review. The source link and provenance accompany this pilot.

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
npm run dev -- --host 127.0.0.1 --port 4174 --strictPort
```

`CI=true` uses the repository's existing public client configuration for the production build. Local preview: http://127.0.0.1:4174/reader?add=1

The browser test starts an ephemeral localhost server for `app/dist`, launches isolated headless Chromium with muted audio, and blocks all API/external requests. If Chromium is not installed, install the browser required by the repository's existing Playwright dependency. Screenshots and the machine-readable browser report are in `addbooks/qa/reader-pilot/`.

## Verification record

- Baseline: 2,929 tests passed, one skipped.
- Final: 2,933 tests passed, one skipped; production build and `verify-bundle` passed.
- Verified bundle: `index-C16r94Pg.js`.
- Desktop 1365×900 and phone 390×844: Add, failed-download retry, complete contents, chapter selection, page turn, reload/resume, repeated Add and epilogue. No horizontal overflow or page errors.
- Screenshots capture the actual reader from the locally served production build. No production API or LLM requests were made.

## Boundaries and follow-up

This proves a single book can pass through conversion and into the real reader without public-library publication. Runtime Add loads the already converted edition; it does not convert a new catalogue selection on demand. The large standalone search prototype remains on `codex/addbooks-search-prototype` and is not wired into this first import pilot.

Unlisted assets are accessible to anyone who knows their URL. This is not private file storage or an authenticated private library. Existing reading-position storage is reused; no Supabase schema, Worker, API, CI, dependency, taxonomy or registry changes were required. Browser QA verifies guest/local position persistence. Signed-in cross-device sync, offline installation, native Android and AI companion behavior were not tested. Narration is explicitly unavailable for the unlisted book, and its contents menu does not link to a nonexistent library introduction.

Next: approve and verify the unlisted live release; connect one search result to this flow; generalize the converter with source-specific structural checks and immutable source/edition IDs. Only then add durable import jobs, private ownership where needed, source-rights gating and broader book formats. Public-library publication remains a separate decision.
