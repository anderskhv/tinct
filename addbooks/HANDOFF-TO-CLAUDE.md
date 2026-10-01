# Tinct Add book pilot — handoff to Claude

Prepared 2026-10-01 from branch `codex/addbooks-reader-pilot`, HEAD
`1d8071105` (`Require Danish edition rights review for Add reader pilot`). The
branch is pushed to `origin`. Continue from this branch and keep the pilot out of
the public library unless Anders explicitly asks for that.

## Catch-up

Anders asked for a working Add flow that opens one real book in Tinct's existing
production reader, while keeping it out of the public library. The pilot uses
the original English **The Time Machine** by H. G. Wells (Gutenberg #35). It has
17 reading units (16 chapters and an epilogue), 306 paragraphs and 32,310 words.
`/reader?add=1` offers **Add and read**; the reader uses the normal measured page
layout and stores/resumes the reading position. This is a local/pushed pilot; it
has not been deployed.

The exact source and converted text are pinned in
`app/public/data/imports/pd-35-provenance.json`. Rebuild with
`python3 addbooks/scripts/build-reader-pilot.py`. The converter accepts only the
reviewed Gutenberg URL and output hash. Danish eligibility is recorded in
`app/src/addbooks/danishRights.json` and explained in `DANISH-RIGHTS.md`. The
record clears only the original English text. It does not clear a translation,
introduction, notes, illustrations, cover, recording, existing catalogue or
every country. The public Tinct catalogue and the separate US-based search index
have not been audited.

## What works and what remains

- **Add/text/reader:** One fixed pilot result loads into the real reader. Retry
  after a failed download, contents/chapter navigation, page turns, epilogue,
  repeat Add and local position resume were checked in desktop and phone
  Chromium. Pagination was corrected to retain the measured page layout.
- **Audio:** Intentionally unavailable. The candidate edition has
  `hasAudio: false`; its validated handoff declares `audio: false`; and
  `LabApp` explicitly excludes unlisted books from narration eligibility. The
  Listen control therefore cannot play this book. This is a deliberate guard,
  not a missing audio-file URL. No Time Machine narration or voice/timing
  manifest has been created.
- **Tinct narration system:** The reader already has a Grok English narration
  path, user-triggered preparation, shared content-addressed audio/timing cache,
  playback/highlighting, cost reservations and authorization checks. Read
  `docs/grok-narration-2026-09-23.md` and the current sections of
  `docs/audiobook-architecture-2026-09-21.md` before changing it. Those docs
  specify existing voices, signed release preparation, Play-only generation,
  spend ceilings and acceptance. Do not make the new book bypass these controls
  or change Talk voices.
- **Explain:** Reader layout/selection and request context were checked with a
  labelled mocked stream in isolated browser QA. That does not prove a live
  provider response. The local `reader-pilot` Vite mode proxies `/api/chat` and
  `/api/lab-chat` to the existing service; plain Vite mode does not provide the
  same guest route. The automated check made no LLM calls.
- **Not built:** Search/catalogue integration, choosing another book, on-demand
  conversion or uploads, a personal/import library, compare editions, modern
  English, unlisted-book onboarding, recording/voice selection, and catalogue
  expansion. Cross-device sync for this unlisted book, offline installation,
  Android, physical-device playback and lock-screen behavior have not been
  accepted. The reader-only text asset is public to anyone who knows its URL.
- **Release:** No deployment. Earlier task instructions prohibit deployment and
  the release decision is unresolved. Do not deploy, merge to main, publish the
  book, or run a paid preparation job; hand the exact change and cost estimate
  back to Anders for release/budget direction.

The last recorded code checks were 2,955 passing tests (1 skipped), production
build and bundle verification, and isolated muted desktop/phone Chromium checks.
QA artifacts are under `addbooks/qa/reader-pilot/`. Explain was mocked. These
checks do not establish live audio playback or physical-device behavior.

## Continue: make pilot audio work

1. Start by reading this handoff, the repository `AGENTS.md` and `app/AGENTS.md`,
   `DANISH-RIGHTS.md`, the Grok narration release and audiobook architecture
   above. Inspect the real reader and server flow instead of assuming that
   changing `hasAudio` is sufficient. Trace catalogue/edition validation,
   narration eligibility, exact text identity, audio and timing storage,
   authorization, spending reservations, pause/seek/highlighting and error
   recovery. Find every allowlist or explicit `isUnlistedReaderBook` exclusion.
2. Preserve the user-owned untracked file
   `addbooks/LIBRARY-EXPANSION-RESEARCH-2026-10-01.md`. Do not reset, clean or
   overwrite it. Keep edits in this project and branch unless Anders directs a
   different destination.
3. Propose and implement the smallest complete, user-initiated narration path
   for this exact imported edition, using the existing supported narration
   architecture. Keep the book out of `BOOKS`, the public catalogue and
   taxonomy. No generation on opening or silent reading. Preserve current
   voice/cache/cost/account policy. Do not add a provider or change Talk.
4. Rights are a prerequisite: the existing record clears text only and
   deliberately rejects `text-and-audio`. Work out and record the applicable
   rights/terms for generated narration and its audio asset before enabling it.
   Keep audio rights separate from the text review; unknown or unclear rights
   must leave audio disabled. Do not claim worldwide clearance from the Danish
   text review.
5. Check the actual source/edition and audio pipeline for every remaining broken
   control in the flow. Give Anders a concise working/not-working list, including
   what was tested live versus mocked. Then verify the end-to-end audio path in
   isolated, muted browser contexts (desktop and phone), including Play,
   playback, word following, pause/resume, seek, chapter/end handling, retries,
   repeat/cache behavior, and account/budget refusal. Do not make paid provider
   requests or prepare audio until the existing authorization/budget workflow
   permits them; if a required spend or rights decision is absent, finish the
   no-spend code/review work and report the precise decision needed.
6. Run the required focused and project checks once implementation is ready.
   Record real provider and cached results separately. Do not claim physical
   iPhone/lock-screen acceptance from headless tests.

## Ready-to-paste prompt

> Continue the Tinct Add book pilot from branch `codex/addbooks-reader-pilot`
> (current handoff baseline `1d8071105`). Read `addbooks/HANDOFF-TO-CLAUDE.md`
> first, then follow the repository and app `AGENTS.md` instructions.
>
> The pilot opens the original English Time Machine in the real reader but has
> no audio. It is intentionally blocked in three places: candidate edition
> `hasAudio: false`, handoff availability `audio: false`, and `LabApp` excludes
> unlisted books from narration. Trace the complete current Grok narration path
> and find every related allowlist before editing. Implement the smallest full
> user-initiated audio path for this exact pilot using existing Tinct playback,
> timings/highlighting, cache, authorization and spend controls. Do not alter
> Talk, change audiobook voices/providers, add the book to the public library,
> or synthesize during open/silent reading.
>
> The Danish rights record clears only the original text and explicitly blocks
> audio scope. Resolve and record the rights/terms needed for a generated
> narration and audio asset before enabling it; if unclear, leave audio blocked
> and give Anders the exact rights decision required. Do not make paid provider
> calls or preparation runs unless the existing authorization/budget permits
> them. Deployment is not authorized; do not deploy, merge to main or publish.
>
> Preserve the unrelated untracked `addbooks/LIBRARY-EXPANSION-RESEARCH-2026-10-01.md`.
> Audit the remaining Add-pilot controls and report what works and what does
> not, distinguishing mocked tests from real provider checks. Verify allowed
> playback in isolated, muted desktop and phone browsers: play, highlighting,
> pause/resume, seeking, chapter boundaries, retry, cache reuse and refusal when
> signed-out or over budget. Do not claim physical-device/lock-screen acceptance
> without testing it. Run the appropriate checks, commit and push the branch,
> then report changed files, test evidence, untested cases and any user decision
> needed for rights, spend or release.
