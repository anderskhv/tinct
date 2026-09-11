# Production release recovery — September 11, 2026

Reviewed: 2026-09-11

## Cause and recovery

Main was reconciled to stale release 93f7b9d9, then deployed by CI. It omitted
later verified character packages, edition audio holds, the token-group follow
fix and public About assets. The claim in the cloud handoff that 93f7b9d9 was
current was stale. Main registered only four character scopes before recovery;
current live index-BgUf4leU.js was observed during the regression.

Recovery merge 95029ffe2 preserves verified release 68e7d1d0 (including 240dc0f3)
and the newer main audio tooling, census, guard workflows and concurrent smoke
retry changes. App source/assets match 68e7d1d0, apart from the preserved new
smoke tooling. No user checkout was reset. The corrected main is pushed.
CI now uses Node 24 and npm run deploy, and checks the actual post-deploy build
against both served reader HTML and complete bundle bytes. This closes a stale
asset smoke-test gap; it does not replace branch/release coordination.

## Evidence

1,664 app tests, build and verify-bundle passed. Direct recovery deploy succeeded
with Worker 0c22d4a1-d5a6-4e18-b60e-18230be44cfe. The same-commit GitHub deploy then
succeeded: https://github.com/anderskhv/tinct/actions/runs/34579232785
Its final Worker is 2afbdd92-12a7-4ad3-bf8e-087ef9bd3731; bundle
index-DnUXeTyY.js; SHA256
20780c04877b489c909e17387b78ad7fec746bdb09da790558fcc78d21a7bee8.
CI verified this bundle byte-for-byte against its build and all 15 smoke checks
passed. The local build used a different bundle hash; CI's recorded build is the
final production byte comparison, not an asserted local byte match.

All 17 versioned character assets match released files. Unversioned immutable
URLs can return older content, so the verification uses actual runtime revisions.
Rechecked 144 nine-play card scenarios plus the four-book browser suite (64
records, including four deliberate modern omissions) on live phone WebKit and
desktop Chromium. Read and Compare highlight menus passed explicit save,
recolour, note, dismissal and Ask-draft checks. Modern Apology stays held for
audio while saved paragraph61 and the original default survive; discovery stays
90 books. Public About desktop/mobile browser checks passed. Token-group follow
source and regression tests are restored; this was not a new full audio census.

Artifacts: /Users/andershvelplund/.codex/visualizations/2026/09/11/tinct-production-recovery/
Includes per-book results, highlights, audio, About screenshots,
asset-verification.json and workflow-evidence.txt. Browser tests are not physical
hardware certification. No account data or audio assets were changed.

## Next action

Keep main as the shared release base. Never use an older bundle observation as
proof that newer verified commits can be omitted. Character queue reconciliation
continues from this restored baseline; the external authoring routines are unchanged.
