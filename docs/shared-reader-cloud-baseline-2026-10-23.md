# Shared reader cloud baseline, 23 October 2026

## Scope and ownership

This is execution evidence for the saved [consolidation plan](shared-reader-consolidation-2026-10-23.md), not release acceptance. Anders requires explicit approval before merging or deploying this work, and an agreed scope and budget before paid provider tests. Those restrictions supersede repository deploy defaults.

Inspected PR #603: open, draft, three commits, two changed documentation files, 176 additions, no application changes. Its head was `dd83b07725d7a260927df28c2e11e09ab7004e68`; main was `d8b667e659009b590bb5e5c9218081c935f74927`. The existing integration branch is not being used as a concurrent write destination. Claude is stopped according to Anders; this session cannot observe or control the earlier Mac chat.

## Capabilities actually exercised

- The GitHub connector read PR metadata, changed files, source, instructions, and refs. Repository permissions report read/write/admin, but that does not establish shell Git credentials.
- A remote Linux runtime executed commands, cloned the exact integration branch, installed the locked dependencies, and ran Tinct tests and builds. Checkout: `/workspace/scratch/53379a81f123/tinct`. Node `v24.19.0`, Python `3.12.14`, Git `2.51.1`. No Mac checkout was used.
- A delegated child agent independently executed commands in the same runtime. Sol High was requested for coding agents and Astra High for architecture/orchestration review through the model override fields. Neither the parent nor child can independently attest the backend model routing. The parent session cannot change its own model selection.
- Chromium and WebKit both launched and executed actual Tinct browser checks.
- Direct shell `git push --dry-run` failed because no GitHub username credential was available. Preserve reviewed changes through the connected GitHub write tools instead; do not place credentials in the checkout.

This proves a usable remote runtime for this conversation. It does not prove attachment to the environment picker entry named "Tinct cloud", availability of the account's managed Work Cloud launcher, persistent scheduling, or work continuing after the conversation is suspended. No such capabilities should be promised.

## Fresh baseline

| Check | Result |
| --- | --- |
| `npm ci --no-audit --no-fund` | Passed, 307 packages installed |
| `npm test` | 543 test files passed, one skipped; 6,861 tests passed, six skipped; 93.68 seconds |
| Initial plain `npm run build` | Correctly blocked by absent `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AUDIO_BASE_URL` |
| Offline build with documented `SKIP_ENV_CHECK=1` | Compiled, but not a deployment candidate |
| Clean `CI=1 npm run build` | Passed using the repository's existing public client configuration fallback |
| `npm run verify-bundle` after that clean build | Passed; reader bundle `index-Dqtv-ONs.js`, expected public configuration present, no leaked secrets, valid entry tags, no build placeholders |
| Original cross-chapter highlight check | Reproduced exact `Highlight` button locator timeout at line 50 |
| Repaired cross-chapter highlight check | All four Chromium/WebKit forward/reverse cases passed, including exact grouped quote, per-chapter marks, persistence, and reload |
| `READER_MENU_ONLY=1 node scripts/check-reader-panels.mjs` | All 14 Chromium/WebKit desktop/phone checks passed: menus, reveal without losing place, library Continue, and panels near source |

The second build initially found two reader bundles because the previous output remained in `dist`. Removing only generated `app/dist` and rebuilding resolved this environmental ambiguity. No verification assertion was weakened.

Browser setup: the default Playwright CDN returned a 195-byte HTML response for Chromium. The matching official Chrome for Testing storage archive worked. WebKit's official Microsoft download mirror worked. System dependency installation could not write its package cache; packages were downloaded into scratch and extracted for the browser runtime instead. WebKit's package-presence validator does not describe those private library paths, so the successful browser checks used `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`; the actual browsers and all application assertions still ran. No repository dependencies were added.

Cross-chapter test repair changes only the stale button locator to existing `lab-dbar-highlight` and mutes Chromium. The previous exact accessible name `Highlight` no longer matches `Highlight in Gold`. Retained assertions establish that this reproduced failure was selector drift, not evidence that all highlighting behavior is correct.

## Contracts retained

- Catalogue position identity and source chapter/paragraph/word coordinates stay intact. Bible identity maps from library `bible` to its biblical sub-book plus internal chapter and sequential chapter; literal `bible` is not a persisted position key.
- Own text and PDF retain private position keys, revision checks, account ownership, and original-page mapping. The shared shell must delegate to existing storage owners instead of adding another writer.
- Catalogue cards use book-scoped conversations and tombstones. Current React private EPUB cards/highlights are device-local, while static private PDF cards/marks have owned R2 routes and PDF-specific payloads. Shared-looking UI does not imply interchangeable storage.
- EPUB/paste private sync needs a concrete route/type design with export/deletion/privacy coverage. No schema or persistence migration has been introduced.
- A continuous renderer must preserve real structural word anchors, figures, poetry, speakers, verse numbers, and footnotes, and bound the number of mounted chapters.

## Remaining evidence

## First private implementation checkpoint

- `sharedReader=1` is an explicit URL-only entry. It bypasses the old preview decision before that code can change a URL, handoff, or sticky opt-in; added-book preparation and content migrations still run. The existing React layout and position owner remain in use. Own-book routing remains unchanged, so PDF pages, scans, and EPUB Margin are not claimed as newly integrated.
- An isolated `ContinuousReaderPrototype` delegates rendering to real `LabPassage`. Its pure forward window is bounded by source words/paragraphs and has an exclusive next anchor. Focused tests cover source coordinates, invalid bounds, exactly-once long-paragraph traversal, large chapter DOM bounds, play/verse/poetry structure, figure tokens, footnotes, and selection coordinates. It is not automatic scroll virtualization or a production-mounted layout.
- The updated full suite passed: 547 test files passed, one skipped; 6,878 tests passed, six skipped. Clean CI build and bundle verification passed with `index-CK6wsnC3.js`.
- Actual isolated muted Chromium checks at 1440x900 and 390x844 opened Frankenstein chapter 2 with both the old sticky Margin preference and `sharedReader=1`, then reloaded. Both kept the private entry, correct book/chapter, sticky preference, and zero legacy Margin iframes. Existing LabApp consumed the explicit place as designed while retaining the private URL flag.
- Architecture review found and corrected two checkpoint issues: Reading now now preserves the private flag for internal reader targets, and source windows avoid leaving a Bible verse number without its first word. Follow-up focused checks passed (37 entry/switcher tests and 10 structural prototype tests). A one-word budget that cannot hold a verse marker and its first word is explicitly rejected rather than exceeding the budget or skipping source words.

The next integration constraint is one active layout location owner. LabApp has
page-map, reflow, navigation, restore, selection, and narration paths; mounting
continuous text while hidden paginator effects can still write `placeRef` is
unsafe. Introduce a source/edition/chapter epoch guard and dispatch accepted
visible anchors through the existing catalogue/private `notePlace` owner before
attaching the prototype.

Private EPUB/paste storage design review recommends an additive text-anchor
variant in existing private R2 marks/cards sets, with current ownership,
revision/ETag conflicts, and tombstones. It needs no SQL migration or new provider.
Do not silently truncate local records, convert ambiguous legacy anchors by a
first quote match, or mix text records into legacy PDF sets. The exact old Worker
cannot read new EPUB text records: the release must prepare a tested rollback
candidate that restores the prior UI while retaining compatible backend reads,
export support, and local compatibility projections. The ordinary automatic
previous-version rollback is not yet a sufficient compatibility proof.

## Private EPUB backend checkpoint

The server-only slice extends existing owned-file marks/cards routes with
validated `text-v1` range/chapter anchors for EPUB. PDF record shapes remain
separate. Existing private keys, revision/ETag conflicts, tombstones, and export
helpers are retained. The new variant preserves grouped marks, rejects oversized
material instead of silently truncating it, fails closed on corrupt stored sets,
and conditionally creates the first record so simultaneous initial writes cannot
both win. No client starts writing this variant yet.

Focused worker tests cover private ownership, EPUB round trips, revision conflicts,
tombstones, grouped notes, invalid source anchors, byte/content limits, concurrent
first writes, corrupt-store protection, and exports. The policy change only makes
existing-provider private PDF/EPUB wording accurate where features are available;
it does not claim that Paste text upload or EPUB client sync has shipped.

The final worker file passed 49 tests. Architecture review additionally found an
orphan-EPUB export case, which was corrected with complete-format discrimination
when file metadata is absent, while retaining orphan PDF and tombstone exports
and rejecting mixed/malformed sets. Owned-book GET/PUT still require file ownership.
The wider six-file checkpoint run passed 93 tests before that additional export
regression was added.

This is provider-independent validation using test storage. It does not prove
real R2 operation, migration of existing client records, or deletion races with
already in-flight writes. The delete-after-ownership-check race needs explicit
acceptance before release; deletion followed by a new request returning 404 is
insufficient evidence of that race being solved.

The Worker module graph also compiled with platform/WASM imports external. That
is a compilation check, not a deployed Worker or provider connection.

## Exact next integration seam

The next slice should keep `placeRef` and `notePlace` as the existing storage
dispatch, and introduce an active-layout/source-epoch guard before accepting any
continuous visible anchor. Audit entry points include:

- `LabApp` restore references and incoming remote restore around the catalogue
  `useLabPositionSync`, plus private `writeUserBookPlace`/`noteOwnPlace` dispatch.
- Chapter/content map, font-budget reflow, measured native/desktop maps, delayed
  landing/overflow effects, and both paginators. Inactive layout callbacks must
  not write a visible location.
- Page/Compare navigation, chapter jumps/Contents, narration seek/follow and
  browsing suspension, overlays, font/edition changes, and late cloud results.

Use source identity, edition/chapter, navigation epoch, readiness and restore
suspension checks. Verify nonzero-word resume after font/viewport changes, stale
outgoing callbacks, exactly one active writer, Bible sub-book mapping, Compare's
primary anchor, narration versus browsing, private revision keys, and PDF
original/text positions. Do not mount continuous mode by merely hiding the old
paginator UI.

Theme and paste previews are isolated from production entry points and require visual review. Faithful selection screenshots use the actual reader with provisional CSS injected only into the isolated browser. The standalone harness uses the real bars but illustrative surrounding pages; its Paste text flow is proposed and saving is disabled. No full reader consolidation, private-source integration, persistence migration, paid narration/Talk check, or production verification is complete.

The historical narration acceptance failure remains unresolved; no real provider test was started. Source inspection explains a possible audio-audit failure: currently held English editions deliberately return manifest 503, and the census includes them and aborts before emitting ledgers. This does not verify the body or cause of the historical failed request. Preserve that distinction and repair the audit deliberately, not by dismissing 503s.

Raw baseline logs and browser runtime files are scratch-only. Durable evidence should include this report and selected screenshots/results on the review branch, excluding generated bundles, private data, credentials, and unrelated files.
