# Shared reader release progress, 23 October 2026

This is the live execution record for the [agreed release plan](shared-reader-consolidation-2026-10-23.md). A checkpoint is not completion. The coordinating agent owns integration, regression repair, and release readiness. Anders must explicitly approve merge and deployment. Paid provider checks require a separate agreed scope and budget.

## Verified starting state for continued implementation

- PR #603 remains draft, targeting main, at `dd83b07725d7a260927df28c2e11e09ab7004e68`.
- PR #604 remains draft, targeting #603's branch, initially at `5f9a46ffb0027e6427d616d920a4163f9cd6c3ea`.
- GitHub Actions run `39926979982` failed only the three `termsPage.test.ts` assertions that still named PDF-only storage after the notice was made accurate for EPUB. The other completed verify jobs passed, including reader panels, library, page layout, and four Margin layout shards. This does not establish acceptance of subsequent changes.
- The privacy regression repair is independently reviewed and saved in #604 as `9925229305eae070a636aa420e666b26123aa8b4`. It retains checks for source/PDF locations, availability-qualified EPUB support, private R2/browser storage, and deletion. The focused terms suites pass 23 tests. The broader initial focused run passes 135 tests across 11 files.
- All four GitHub workflows for `9925229` subsequently passed: verify, cross-chapter highlighting, direct reader audio cache, and Shakespeare speaker acceptance.
- The active remote checkout was reconciled with #604 without discarding worktree files. The remote runtime, GitHub writes, and delegated execution are available. Named Work Cloud attachment and unattended continuation remain unverified.

## Ownership

The user selected Astra High for orchestration. Six bounded subagents were explicitly started with the available `gpt-6-sol`, `high` model controls. This records the requested configuration, not independent attestation of backend routing.

| Work | Exclusive implementation ownership | Independent review |
| --- | --- | --- |
| Continuous reader and location ownership | Reader agent: LabApp and continuous renderer/controller modules | Review agent, integration checks |
| Paste text | Paste agent: library Add flow, new paste converter/UI and tests | Review agent, private-source integration |
| Private storage routes and compatibility | Review agent: userBooks Worker and tests | Test agent |
| Offline test boundary and original PDF services | Test agent: regression harnesses, PDF surface and owner service adapter | Review agent, menu integration |
| Shared selection menu and themes | Menu agent: SelectionPopup/SelectionDeskBar/LabPhoneBar and scoped styles/tests | Review agent |
| Private source entry and adapters | Private-source agent: main/UserBookReader and own-book modules/tests | Review agent |
| Integration, commits, acceptance and durable record | Coordinator | Cross-author review and combined gates |

No agent may merge, deploy, call a paid provider, or independently mutate the integration branch. Shared build output is owned by the coordinator. Authors repair findings; an author does not approve their own change.

## Active implementation

Anders reviewed the initial Paste preview and requested a simpler default:
paste once, let Tinct infer format/metadata, and allow changes later. The actual
flow now has one textarea and **Add to my books**, with optional **Review
details**. Title and author can be edited later without changing source bytes.
The earlier multi-step screenshot is superseded.

- Continuous desktop reading is being connected to the existing `placeRef`/`notePlace` owner with source/edition/chapter/navigation identity guards. Inactive paginators and delayed layout writers must not persist a competing place. Classic/Compare and familiar phone reading remain available.
- Paste text is being implemented in the real library Add flow, gated by the private URL flag, using an EPUB package and the existing private upload/storage lifecycle. HTML is untrusted; saving must preserve source wording and must not fetch remote resources.
- Private entry is being carried to the library and own-book routes. Existing public routing remains the default while this work is developed.
- Selection controls are receiving the agreed provisional Light/Book/Dark palette and shared actions. The saved faithful previews are in [the preview record](shared-reader-previews-2026-10-23.md); actual implementation must receive fresh visual checks.
- Private marks/cards need file-generation isolation. A stale PUT can otherwise recreate a deleted set; a cleanup by content hash can also erase a new upload of the same file. The implementation direction is generation keys within the existing private R2 prefix, legacy reads for pre-existing files, unchanged client route payloads, and explicit export/deletion coverage. No SQL migration, new provider or new data category is proposed.

## Release gates still open

| Gate | Required evidence |
| --- | --- |
| Source and layout coverage | Prose, Bible/sub-books, plays, poetry, figures, Gutenberg, own EPUB, PDF text/pages/scans, pasted input; desktop and phone |
| Places and saved data | Exact nonzero-word resume; layout/font/viewport/edition/chapter transitions; one writer; local upgrades; account boundaries; revision conflicts/tombstones |
| Shared interactions | Selection, AI actions and follow-ups, chapter actions, notes/highlights, Notebook, undo/deletion, narration highlighting and Talk contracts |
| Paste import | Actual save/reopen, supported formatting and Unicode, conservative trim, metadata, hostile markup/URLs, no remote fetch |
| Deletion and export | In-flight PUT/delete and same-content re-upload barriers; retained legacy and generation records; account export/deletion compatibility |
| Rollback | A tested backend-compatible rollback floor is required before new text records are written publicly. The exact old Worker cannot export these records correctly. Prepare and test an old-UI/compatible-backend candidate; do not deploy it without approval. |
| Performance | Bounded DOM and loading, measured warm/slow first text and interaction timings under declared conditions |
| Combined verification | Full tests, clean build, verify-bundle, muted isolated Chromium/WebKit checks, independent review and repaired regressions |
| Provider acceptance | No paid check yet. Mocked or blocked providers prove UI contracts only. Request a concrete bounded scope/budget only when provider acceptance is ready and necessary. |
| Public release | Coherent preview and explicit release approval, then serialized deployment and exact-bundle production acceptance |

The original production experience is preserved until the complete release is ready. Remaining gates must be resolved, not relabelled as completed by a passing isolated component test.

## Integration evidence in progress

- Independently reviewed storage/menu changes were saved as `a22f42a0b91479c2a2e19ed1dc1cfdd94db8d7bb`. Marks/cards now use owned file generations, with legacy reads, revision conflicts, tombstones, dual-generation export and delete/re-upload race tests. Later title/author edits use a small versioned metadata object, leaving source bytes immutable. Two simultaneous edits cannot both win the same revision. Focused Worker tests: 58 passed at that review.
- A combined clean build and bundle verification passed with `index-CsEacs8W.js`. More changes followed, so this is an integration snapshot rather than the final release bundle.
- The new menu browser check exercised actual private selection controls: Light/Book/Dark computed colours, More keyboard navigation, 440px Ask and Escape, selected passage in a mocked chat request, a contained desktop Quiz, and phone/e-ink actions. Providers were mocked or blocked.
- Automatic approval review blocked collection of an earlier full-test result, reporting potential external Supabase contact. Inspection found the production URL in an explicitly mocked internal-traffic fixture; that is not proof of what the blocked run did. A persistent unit-test boundary now rejects real fetch/socket connections while allowing explicit mocks. The first guarded full run had 6,926 passing tests, six skipped and four integration failures, with no unmocked network attempts. Authors are repairing these failures before the next combined run.
- Review found and sent back real issues: narration using stale paged coordinates in continuous view, invalid window rebases, programmatic scrolling overwriting a restored word, owner-scoped private mark migration under quota failure, and preserving another account's local data when deleting the same-content book. Passing isolated checks do not close these findings; regression and combined evidence are required.
- Commit `90486f8e286660d77b60899ae1112995709f3fec` saves the reviewed simple Paste implementation and latest private Worker/storage compatibility. The Paste browser check passed Chromium and WebKit on desktop and phone against loopback fixtures: actual React reader open, identical-byte upload retry, reload, metadata conflict and successful edit, source-byte preservation, and signed-out rejection. Worker/fake-bucket/export checks passed 142 tests in independent review. Realistic body-derived ETags exposed a concurrency flaw; explicit revision-bearing bodies now protect unchanged annotation and place writes, with legacy reads preserved.
- Commit `eba67da6c0e61ef3e489261f9956308bd802273b` passed all four GitHub workflows: verify, cross-chapter highlighting, direct reader audio cache, and Shakespeare speaker acceptance. Later saved changes require their own CI result.
- Continuous-reader browser acceptance currently passes 16 observations: exact nonzero-word resume/reload, font and viewport changes, Classic/Margin round trips, Genesis/Exodus boundary, KJV/WEB Compare return, original Macbeth verse, a source figure, and long forward/reverse scroll. The column and footer were visually inspected. Saved-card, narration/Talk and full private-source journeys remain open.
- Latest combined build and bundle check passed with `index-C8P-XSFH.js`; subsequent reader/private changes are not covered by that build. The latest guarded full test run had 6,934 passes, six skips and one in-flight metadata-helper failure. That helper now passes its 25 focused tests; a new full combined run is still required.
- Private client review is actively checking owner-qualified canonical state, quota/partial-write behavior, legacy annotation recovery and explicit card tombstones. A passing earlier review does not accept later controller edits. Original PDF controls, persisted geometry and provider-independent narration/Talk integration are still being completed.
- Saved component commit `452725d3becba529966fe2509a67e2dd3a0016b5` shares card/Notebook rendering, complete exports and the pure chat append helper. Later integration and Undo failure handling remain in the working checkout until reviewed together.
- Saved backend commit `986c7d3a68e97b62f631c4fd56a85151861b946a` preserves claimed legacy EPUB page anchors, adds file-generation tokens for new clients, and supports honest page-only PDF recap cards. The independent combined Worker/admin/PDF checks passed 121 tests. New clients must send the captured file ID and stop on generation mismatch rather than merge into a re-upload.
- The next guarded full run passed 7,007 tests, skipped six, and failed two PDF tests during active integration. Both failures were reproduced and repaired in the owning agent's focused checks: the PDF-engine caller inventory now distinguishes conversion from original-page rendering, and the new page-text narration method is present. A stable final full run remains required.
- Clean build 5 and bundle verification passed with `index-BVQpkkUi.js`. Performance uses an immutable copy so subsequent builds cannot change a measurement mid-run. A separate old-UI/main plus compatible-backend candidate passed 113 focused tests, build and bundle verification (`index-By9mGwgg.js`); it still needs the final backend variants and rollback round-trip acceptance. It has not been deployed.
- Performance instrumentation found repeated word geometry measurement during selection. The first fix reduced War and Peace's slow-phone selection median from 588 ms to 110 ms. The initial local server served uncompressed assets, unlike the existing #581 harness; those numbers are retained as an uncompressed stress test. With #581's gzip/cache semantics on the same build, cold slow-profile first text medians were 1,488/1,779/1,682/1,657 ms for Frankenstein/War and Peace/Bible/Macbeth. Warm desktop and card-shell medians passed. Selection medians were 102/95/100/79 ms; Frankenstein still missed the 100 ms target, and a second geometry fix awaits measurement. Each profile used three runs, 4x CPU/60 ms/9 Mbps for slow phone, and a painted-frame opportunity; HTTP, HTTPS CONNECT and WebSocket requests outside loopback were blocked. No external requests were observed.

## Related PR continuity

PRs #598, #581, #602 and #521 remain open and unmerged at this inspection.
The shared React reader reuses the existing Grok Talk path and desktop panel;
#598's separate iframe bridge is reference evidence, not a shortcut to launch.
The latency check follows #581's distinction between warm desktop and throttled
cold first text, and measures painted controls separately from AI response.
#602's readiness repair is limited to a browser check and is not a release
dependency unless the relevant failure reproduces. #521's provider budget and
automatic continuation changes are outside this implementation; interrupted
answers must still remain visibly incomplete and must not be lost by new cards.

Pre-existing concurrency hazards in other private auxiliary stores (place,
cover, narration, recap, primer and OCR) are distinguished from changed
marks/cards/metadata. Their historical hash-only keys are not made race-safe by
this work's annotation tests. Do not claim a blanket guarantee for all private
writers. Any new regression or unfulfilled release contract is a blocker;
unrelated baseline deficiencies remain explicit follow-up work.
