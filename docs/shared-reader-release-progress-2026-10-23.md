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

## Combined build 7 checkpoint

The complete working graph built and passed bundle verification as
`index-DgdLzuiZ.js`. A frozen 87-file source snapshot was taken before further
repairs. This checkpoint brings continuous React reading, private source entry,
owner/generation-qualified marks and cards, legacy recovery, original PDF
rendering/services, shared Notebook and browser checks together on the draft
integration branch. It is not final acceptance.

The original PDF shell now uses shared appearance preferences and real PDF
outline or verified scan reading units. It reuses existing narration and Talk
services. Talk transcripts remain device-only, owner-qualified and available
through Notebook Copy/Download; no new cloud transcript store was introduced.
Routed narration/Talk/word-follow acceptance and common phone/unit-action parity
are still being completed.

Known findings after this snapshot remain assigned for repair and retest:

- Remote deletion must retain ownership proof whenever a hash-only legacy
  projection survives; otherwise another account could be offered it for
  adoption. Malformed data and failed removal need the same protection.
- A confirmed missing server generation must fence active text controllers;
  offline/transient errors must preserve recoverable local data.
- Distinct human Explain actions must receive distinct card identities while
  duplicate subscribers to one request remain coalesced. The reader owner has
  since repaired this and passed the actual two-action browser regression.
- A PDF unit action must not silently omit a later dense page or text-limit
  overflow and present the answer as covering the whole unit.
- Final quiet six-source performance, routed PDF service checks, full guarded
  tests, visual review and browser rollback coverage must use the final source
  revision. Earlier passing evidence does not accept later changes.

Build 7's isolated Chromium journey passed account A highlight/sync, account B
same-hash isolation and separate highlight, return to A, real Library deletion
of A only, same-hash reupload with a new file ID and no resurrection, and B's
retained highlight. WebKit passed the account-isolation portion. Later cleanup
repairs still require their own combined browser regression.

The compatible-backend rollback candidate is preserved separately on
`codex/shared-reader-compatible-rollback-20261023` at
`2282f8503b4ae84cded60933311422f54d42efc1`. See the
[rollback record](shared-reader-rollback-2026-10-23.md). It is not deployed.
The final release sequence must establish and verify a compatible rollback
floor before new records can be written publicly; the automatic rollback target
must be that floor. Both promotions remain subject to Anders's approval.

After connection recovery, the parent runtime reported Sol as its model. An
explicit `gpt-6-astra` / `high` read-only oversight agent audited release gates;
the existing Sol High implementation and independent review agents resumed.
No named Work Cloud attachment or unattended persistence is inferred from this.

Quiet build 7 performance passed all agreed median targets for six cases, three
runs each, with gzip/cache semantics matching the existing latency harness.
Other agents paused builds, browsers and tests during measurement. Slow-profile
cold first-text medians were 1,573/1,605/1,570/1,687/2,618/2,775 ms for
Frankenstein/War and Peace/Bible/Macbeth/private EPUB/original PDF. Selection
medians were 79/91/82/80/96/30 ms, and card-shell medians were
51/51/53/56/59/46 ms. Desktop warm text medians were
140/306/200/164/274/318 ms. The private EPUB selection maximum was 104 ms in one
run; its median passed at 96 ms. Maximum slow PDF first text was 2,831 ms.
No external HTTP, HTTPS CONNECT or WebSocket attempt was observed. This is
provider-independent evidence for immutable `index-DgdLzuiZ.js`, not acceptance
of subsequent fixes or a real Grok connection.

Pre-existing concurrency hazards in other private auxiliary stores (place,
cover, narration, recap, primer and OCR) are distinguished from changed
marks/cards/metadata. Their historical hash-only keys are not made race-safe by
this work's annotation tests. Do not claim a blanket guarantee for all private
writers. Any new regression or unfulfilled release contract is a blocker;
unrelated baseline deficiencies remain explicit follow-up work.

## Resumed final review

The remote workspace was recovered without discarding unfinished files. PR
#604 remains draft at `aac0435a80b2ac69ac78cca248da0726786ebe71`; #603 is
unchanged. The local integration branch was reconciled to that saved head
while preserving its worktree. Production remains untouched.

The complete guarded unit run finished with **7,090 passed, six skipped**
across 567 passing test files and one skipped file. This precedes the final
review repairs below and must not be described as their full-suite result.
The frozen default-ON candidate `index-Dg5WNcFO.js` passed public activation,
explicit opt-out, Classic/Compare and exact word resume, plus Paste save/retry/
reopen/metadata in Chromium and WebKit. Additional browser smoke covered 24
route/viewport combinations at 1440×900, 1280×800, 390×844 and 360×740.

Three Sol High agents resumed bounded acceptance, PDF/private-data review and
independent release review. A fourth Sol High agent owns release-safety
repairs. An explicitly requested Astra High oversight agent checked remaining
scope and independently reviewed the new canonical Talk rollback regression.
These are requested tool configurations, not independent backend attestation.

Independent review found and repaired a multi-page PDF follow-up that supplied
only its terminal page, and an account switch that could relabel a surviving
hash-only Talk projection. Focused service, shell and card-sync tests pass
60 cases. The follow-up now sends its complete cited range or explicitly says
it was not sent when that source cannot be supplied. Final routed acceptance
is extending the PDF journey and the new owner-qualified Talk rollback journey.

Release review also found that the old-UI floor lacked the new workflow gates,
its compatibility proof depended on a sibling checkout and mutable HEAD, and
direct deployment/rollback paths needed exact-version and phase guards. These
remain release blockers until the repaired floor and reader workflow pass
portable tests and independent review. The approved reader phase must bake
`VITE_SHARED_READER_DEFAULT=1`; the floor must keep it off. No release manifest
may invent a production Worker UUID.

Final candidate rebuilding and browser checks are in progress. Mocked services
prove UI/context contracts only; no paid provider check, merge or deployment
has occurred. The next report must name the exact frozen bundle and clearly
separate completed readiness evidence from remaining approval-dependent work.

## Final candidate ledger

This section supersedes earlier candidate status above. None of these candidates
has been merged or deployed. The implementation remains in draft PR #604, the
compatible old-UI floor in draft PR #605, and the original plan in draft PR #603.

| Candidate | Reviewed source | Frozen bundle | Build configuration |
| --- | --- | --- | --- |
| Reader candidate15 | `1ad6d9458e6a2e4bb435323d9f9e0ce1a0589f1a` | `index-tUVfbMdS.js` | `CI=1 VITE_SHARED_READER_DEFAULT=1` |
| Compatible old-UI floor | `eac7e63f65557627652ff6fddeab5c85fab18ce1` | `index-CFF78Pcz.js` | `CI=1 VITE_SHARED_READER_DEFAULT=0` |

Both clean builds and bundle verification passed under Node 24.19.0. GitHub
Actions pins Node 24.13.0. The reader's emitted-file hashes are recorded in
`docs/assets/shared-reader-2026-10-23/candidate15-manifest.json`.

Final review repaired actual static EPUB annotation writers and cleanup paths.
Fresh writes have exact owner proof and a recovery backup; foreign, guest,
unclaimed and divergent surviving raw records retain their identity. The shared
reader uses explicit recovery instead of silently adopting uncertain records.
Account deletion cannot clear another owner's same-hash records or snapshots.
Async deletion and refresh retain the initiating account/token across awaits.

Candidate13 browser acceptance caught a real cold-Library regression: lazy
loading installed the auth bridge after the deletion guard had captured an
empty session. Candidate14 reads the same stored session fingerprint before
loading, then checks it after every await. It permits A-to-A initialization and
aborts A-to-B switches. Independent review accepted the narrow fix; 69 main
Library tests and 120 floor-focused tests passed. The prior full-suite fixture
incorrectly mocked verified Engine cleanup as a no-op; its replacement checks
both verified cleanup and preservation of foreign same-hash state.

The PDF follow-up now supplies its whole cited reading unit within the declared
20-page, 6,000-character/page and 36,000-character total bounds, or explicitly
refuses before requesting an answer. Its focused service/shell/card tests pass
60 cases. A surviving hash-only Talk projection cannot be relabelled on an
account switch.

Release guards are independently reviewed. Both branches stop ordinary main
pushes before mutation. An approved exact-main floor dispatch keeps the old UI
and runs the portable, repository-pinned compatibility proof. Only after its
actual deployment and acceptance may the release owner record the real Worker
UUID in the floor manifest. The approved reader dispatch requires that exact
floor to serve 100% before upload and again before traffic changes. Direct
deploy records the new UUID; rollback refuses an unrelated or missing current
UUID. No floor UUID has been invented and no pending gate has been bypassed.

The preceding candidate14 full guarded suite passes **7,117 tests, six skipped**, across
567 passing files and one skipped file, both locally and in the exact source's
GitHub Actions app job. The local run used `npm test -- --maxWorkers=2` and
finished in 276.17 seconds with no unmocked network access. Browser, visual and
quiet performance results are being collected against these frozen candidates.
The floor's exact-source GitHub Actions app job passes **6,887 tests, 43
skipped**, then build and bundle verification. Of the skips, 37 modern-write
cases are intentionally inapplicable to old-UI writes; the portable proof
covers modern read/export compatibility.

The candidate14/floor pair passed the complete targeted loopback browser batch:

- Default ON, explicit opt-out, Classic/Compare and exact nonzero-word resume.
- Chromium A/B isolation, actual fresh-Library A deletion, same-content
  re-upload without resurrected marks, and retained B backup; WebKit A/B
  isolation.
- Chromium and WebKit upgrade/rollback/reopen, including proven floor writes,
  direct owned legacy import, ambiguous B raw recovery and device-only Talk.
- Paste save/retry/reopen/metadata editing with immutable source bytes in
  Chromium and WebKit on desktop and phone.
- Original PDF normal, success and dense-source paths in both engines:
  complete-page Recap/Quiz/Note, saved follow-up and Notebook, source-grounded
  mocked narration/word-follow/Talk, scans and explicit dense/incomplete-source
  refusal without a chat request.

All browser sessions were isolated and muted, with external HTTP/CONNECT/socket
traffic blocked. Candidate15 repeats the full targeted browser batch after the cache-only runtime change. Its final evidence is recorded below.
Real-provider narration/Talk remains
unverified: all candidate UI journeys use mocked or blocked providers. No paid
call, merge or deployment has occurred. The approved scope requires explicit
merge/deployment approval and a separately agreed paid-provider scope/budget.

### Final cache and compatibility preparation

Emitted-cache inspection found a real returning-reader gap after candidate14:
the Library requested the changed Engine under the old cacheable
`20261019batch` URL. Candidate15's reader and floor use distinct new
`20261023readerown1` and `20261023floorown1` URLs. Browser checks on the frozen
builds observe those actual cold-Library requests and boot the shipped API,
EPUB and owner-aware Engine. The content-derived Library module chain itself
already had coherent tags. Main loader/Library tests pass 70 cases; floor
loader/Library/phone/cache tests pass 90 cases.

The reader now carries a portable compatibility proof using SHA-256-pinned old,
modern and floor route snapshots, with the current reader route tested as
modern. All four cases pass. The floor continues to test its actual shipped
route as floor. Its source and dependencies remain auditable after integration;
the reader does not accidentally label its new route as the old floor.

The complete final15/floor15 browser batch passes default ON, native account
isolation/deletion/re-upload, Chromium/WebKit upgrade/rollback, four
desktop/phone Paste modes, and six Original PDF variants. All sessions closed
before final performance measurement. Fresh screenshots use these actual
frozen bytes and synthetic fixtures.

Candidate14's preliminary speed run is not a passing final result. Its slow
War and Peace selection median was 101 ms against the 100 ms limit, and the
PDF fixture still searched for a removed phone toolbar class. Diagnostic event
traces found no unintended click or AI request in either source. The benchmark
now measures the actual shared `.lab-pbar` using the same painted-frame timing
contract; a bounded PDF check passed. Profiled/instrumented War timings are
diagnostics, not substitute gate samples. Long-selection popup placement is
preserved. Candidate15 receives a fresh, complete, unprofiled quiet matrix.

### Approval-dependent execution

The prepared sequence is one old-UI/OFF compatible floor, followed by one ON
reader cutover. After explicit approval, preserve merge ancestry, use the
documented conflict resolutions, run the resolved-tree checks, and dispatch the
guarded floor release at exact main. Only after successful exact-bundle
production acceptance may the actual floor Worker UUID be recorded. The
reader release then requires that pinned floor at 100%, followed by its own
exact-bundle production acceptance and automatic rollback protection.

Paid checks remain off. A separate proposed bounded provider check is one
manual `voice-lab-acceptance` guest Talk session after exact reader production
verification, using synthetic microphone input and muted output, no retry,
with a 120-second server limit and a proposed $0.25 budget. Tinct's checked-in
ledger reserves $0.16 for that maximum duration; this is its accounting
estimate, not a provider invoice guarantee. No new narration generation is
included. The existing workflow's approval input defaults to false. This
proposal is not approval and has not been run.

### Candidate15 completed gates and remaining performance work

The exact reader source's GitHub Actions app job passes **7,122 tests, six
skipped**, across 569 passing files and one skipped file, then build and bundle
verification. The exact floor source passes **6,888 tests, 43 skipped** and its
complete verify workflow. Reader verify, device sync, cross-chapter, audio cache
and Shakespeare workflows also passed at this checkpoint; auxiliary workflows
still in progress are not described as passed.

The final15 unprofiled quiet matrix completed all 36 samples. The declared
gzip/cache, 4x CPU, 60 ms RTT, 9 Mbps and painted-frame semantics remain
unchanged; own sources start with empty IndexedDB and a synthetic account
download. Its complete results are saved as `candidate15-speed.json`.

| Slow phone case | Cold text median, ms | Selection median, ms | Card median, ms |
| --- | ---: | ---: | ---: |
| Frankenstein | 1831 | 120 | 68 |
| War and Peace | 1759 | 101 | 71 |
| Bible | 1931 | 137 | 95 |
| Macbeth | 1758 | 100 | 65 |
| Private EPUB | 3243 | 81 | 67 |
| Original PDF | 2687 | 43 | 36 |

Targets remain cold text <=3000 ms, selection <=100 ms and card <=150 ms.
Desktop warm text medians are all <=339 ms. Candidate15 therefore **does not
pass the performance gate**: three selection medians and cold EPUB opening
miss it. No threshold is relaxed and no passing run is selected in its place.
The comparable remote-empty-IDB EPUB baseline was 2841 ms in build7 and
2886 ms in candidate14; build7's 2618 ms figure above used a seeded local
record and is a different condition.

The next narrow fixes are in progress: avoid the popup observer's duplicate
initial geometry measurement while preserving long-selection placement, and
overlap independent owned marks/cards opening plus public EPUB converter
loading with the source download. Owner, token, generation, late-response and
first-paint safety checks must remain. These changes require their own tests,
frozen build and performance verification; they are not accepted by the
candidate15 results.

Anders was told the overall task is approximately 90% complete, an effort
estimate rather than a measured completion metric. Implementation and
functional acceptance are substantially complete. Performance, approved
deployment and live provider acceptance remain. No unattended execution
guarantee was made when he said he would be offline.
