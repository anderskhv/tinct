# Shared reader compatible rollback candidate

Anders explicitly approved the floor-to-reader merge and deployment sequence
on 23 October 2026. The compatible old-reader floor is deployed from
`dcc2dca562b9c05f252a532f6d5e6a839aa5199b` in run `40024003699`, with
bundle `index-CQIECQfJ.js`. All six live acceptance groups and the complete
workflow passed at 21:20:38 UTC. Its actual Worker version
`f9521101-aa25-4d2c-ab44-b0d1c9e149bf` is the accepted rollback target, now
recorded in the reader floor manifest. The earlier candidate inspection and
workflow contract below remain the compatibility evidence and constraints.

The corrected reader release is now accepted: PR #607 merged as
`14314a5d03cf285a548d9c40c2b59fe835b694de`; manual reader run `40035310387`
passed all six live groups, including the exact-bundle 120-case speaker audit,
and the complete first-attempt workflow. The current production Worker is
`1bdaf83e-e30f-44bf-954c-46dc2edf66db`, bundle `index-B_Jdu6u2.js`.
The one approved real voice run `40036966171` and its actual provider/audio
verification passed. The independently guarded continuation `40035289700`
completed successfully. Retain the exact accepted compatible floor above for
rollback; do not substitute the original incompatible Worker. The pending
ordinary-push guard and floor manifest remain unchanged.

The first reader attempt, run `40028070875` at main
`fafc518d8d6284c2e9406aba68c478ff0ad37980`, deployed
`d7ca8cf9-0d69-46a8-8bc0-8c88dd0a00f9` (`index-BkDbfbHd.js`) but failed
two stale desktop Notebook expectations and a featured-preview keyboard
timeout. Four other live groups passed. Automatic rollback job `120676461588`
restored `f9521101-aa25-4d2c-ab44-b0d1c9e149bf` successfully; a fresh internal
GET confirms floor bundle `index-CQIECQfJ.js`. Keep that exact floor pin for
the corrected reader attempt. No paid voice check ran during that failed attempt.

The old Worker alone is not a safe rollback target after new private reader
records have been written. It does not understand revision-bearing annotation
envelopes, file-generation keys, EPUB text/page variants or the distinct PDF
text sets. Keep the compatible storage reader and exporter when reverting UI.

## Candidate inspected

- UI baseline: main `d8b667e659009b590bb5e5c9218081c935f74927`.
- Reviewed floor source: `eac7e63f65557627652ff6fddeab5c85fab18ce1` on
  `codex/shared-reader-compatible-rollback-20261023`. It contains the old UI,
  compatible backend, guarded workflow, and portable format proof.
- Keep the accurate privacy notice and its assertions, plus the offline unit
  test boundary. No migrations, providers or production bindings change.
- The final floor's complete guarded suite passes 6,888 tests with 43 skipped. Of those,
  37 are modern-write cases intentionally inapplicable to the floor's old-write
  policy; the dedicated portable proof exercises old writes, modern reads and
  exports, deletion, revision conflicts and cross-version round trips.
  Its final loader/Library/phone/cache focused group also passes 90 tests. Its clean
  OFF build and bundle verification pass as `index-CFF78Pcz.js`.

The compatibility test runs the shipped static PDF client's real
`TinctMargin.mergeCards`, then writes its result without the new optional file
token. It preserves a new page-only recap beside old geometry cards. Distinct
PDF text marks and legacy EPUB page cards remain intact and account-exportable.
Generation guards, revisions, legacy bare-array reads and deletion are covered
by the same route suites.

## Limits and remaining acceptance

The floor intentionally retains the old static EPUB reader's hash-only raw
visibility. It is a compatibility writer seam, not a claim that old UI gains
the shared reader's account isolation. Fresh/proven writes advance exact owner
proof and backup; foreign, unclaimed or divergent raw records are never newly
claimed. The shared reader requires explicit recovery for uncertain records.

The old static margin column omits a card with no geometry. Its Notebook reads
the complete stored card list, so page-only cards remain accessible there.
This is a temporary presentation difference, not permission to drop records.

The exact final reader/floor pair passes the browser upgrade/rollback/reopen
journey in Chromium and WebKit. It retains new private text annotations,
claimed legacy records and device-only Talk transcripts; returning to the new
reader restores them without duplication or deletion. The proven floor's
fresh A records import directly with exact owner proof and backup; B's
ambiguous same-hash raw records remain isolated for explicit recovery. This
browser evidence supplements the portable account-export/format proof.

The final frozen reader/floor browser pair is reader source
`a2d3d1a8fa5e81d8539483c232276a515a9f67a0` (`index-Co9oahaE.js`) and floor
source `eac7e63f65557627652ff6fddeab5c85fab18ce1`
(`index-CFF78Pcz.js`). Reader source CI passes 7125 tests with six skipped;
the floor passes 6888 with 43 skipped. These are preparation artifacts, not
production Worker UUIDs or approved deployments.

Private ordinary Ask/Talk is device-only in the existing implementation. The
shared release preserves that contract using an owner-qualified journal and
Notebook Copy/Download. Account export covers data held by the account service;
it does not claim to contain an unsynced browser transcript. Sign-out and book
deletion must honor the existing cleanup contract.

The release owner must select a tested compatible rollback version when the
eventual deployment is approved. Never let the automatic rollback choose an
incompatible pre-floor Worker after new records can be written publicly.

## Release workflow contract

The old-UI floor source carries `app/release/shared-reader-rollout.json` with
`phase: floor-pending`; the reader source carries it with `phase: pending`.
Both states stop ordinary pushes to `main` before upload, including the floor
merge push. The npm deploy/upload commands also refuse pending states outside
an explicitly approved matching GitHub Actions dispatch. The source guard
requires exact current `origin/main`, so merge the reviewed floor before
dispatching it. Do not change a pending gate merely to bypass it; a subsequent
reviewed release change must define when normal deploys resume.

After explicit approval of this release sequence, merge the backend-only,
old-UI floor commit to main,
confirm its push stopped at the pending gate, then dispatch `deploy` at that
exact main commit with `release_phase: floor` and
`approved_reader_release: true`. The
workflow checks that the old reader entry point is still in source and runs
`src/worker.rollbackFloor.test.ts` together with the Worker route/account
suites before any upload or traffic change. This proof must demonstrate that
old clients still write the old format while the backend reads and exports the
new format. Old and modern route snapshots are SHA-256-pinned repository-owned
fixtures, independent of sibling worktrees and the moving floor `HEAD`.
Build and production acceptance still run normally. A floor
dispatch from the new reader checkout is rejected.

Record the floor's actual 100%-serving Cloudflare Worker Version UUID only
after its approved deployment and acceptance. Then add a reviewed
`app/release/shared-reader-floor.json` with exactly:

```json
{
  "v": 1,
  "floorVersionId": "<actual Worker Version UUID>",
  "floorCommit": "<40-character reviewed floor commit SHA>",
  "proof": "src/worker.rollbackFloor.test.ts"
}
```

No placeholder UUID is checked in. The explicit `release_phase: reader`
dispatch requires its own release approval input and this manifest. It checks
that production serves the pinned floor at 100% before upload and again
immediately before direct deploy or staged promotion. If production changes,
the workflow stops before changing traffic. The recorded UUID is the exact
automatic rollback target; it does not, by itself, prove format compatibility.
The reviewed floor source and its format test establish that separate proof.
The reader dispatch bakes `VITE_SHARED_READER_DEFAULT=1` into React and the
static Library activation; floor dispatch sets it to `0`. The npm release
commands check the emitted reader activation before Worker mutation. Direct
deployment records its new Worker Version UUID, and automatic rollback refuses
an unrelated current UUID instead of guessing.
The proposed sequence is one old-UI/OFF floor and one ON reader cutover with
verified exact source and production versions. One explicit user approval can
cover both steps when it names this sequence; the dispatch approval input must
then be set for each approved step. A subsequent release needs a new reviewed
compatibility/rollback decision.

## Prepared floor-to-reader integration

The floor and reader branches have overlapping implementation histories; their
combination is not an automatic conflict-free merge. Read-only projection used
the actual main source `d8b667e659009b590bb5e5c9218081c935f74927` as the
explicit base because the local plan commit is a shallow boundary. That plan
commit differs from main only in the plan and DECISIONS.md. This is a source
projection, not a claim that GitHub has merged either PR.

After approval, preserve floor ancestry with a real merge commit. Retain the
reviewed reader versions of `add-engine.js`, `reader.js`, Library
`add-to-tinct.js`, `app.js`, `catalogue.js`, `index.html`, reader rollout
`phase: pending`, and their corresponding Engine, Library, phone-rule,
cache-tag, release-tools and Worker tests. Retain the reader's modern
`worker/routes/userBooks.ts`; replacing it with the floor's old-write policy
would break the new client. Keep the Library import/preload URLs coherent.
The emitted build derives a single content tag for the shared module chain.

The floor's portable proof and pinned old/modern route fixtures must also
survive reader integration. Its reader variant additionally pins the reviewed
floor route and tests that fixture against the current modern route. The floor
variant continues to prove the actual shipped floor route. A proof that calls
the modern route "floor" after the cutover is invalid.

Verify the resolved tree and required tests/build before either approved
dispatch. These are routine integration steps within an approved sequence;
they do not authorize an unrelated source change or bypass the exact-main and
actual-floor-UUID guards.
