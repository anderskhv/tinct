# Character-card pilot release — September 9, 2026

## Scope and behavior

The Awakening's prepared original and modern English sidecars are integrated in
current `/reader` Read and Compare and the classic reader selection popup. Long
press an unmarked name to see its released name, separately gated story role,
identifying subtitle and reminder. No hint, tutorial, inline name decoration or
runtime model request was added. The initial card does not create a highlight.
Dictionary, highlight, note and copy actions remain available for its selection.

The gallery inherits the initiating mention-end cutoff. It separates entries
mentioned in that paragraph by the cutoff from others introduced by that passage;
it displays no whole-book count or future role ordering. Only released fields
reach the popup. Selecting another gallery entry does not change the dictionary
or highlighting target: return to the selected name for those actions.

The loader checks book, edition, schema, prose normalization, UTF-16 policy,
whole-edition SHA256, every paragraph hash, character gates and mention spans.
The resolver then requires identical current paragraph text and a unique narrowest
containing reviewed span. Word anchors omit surrounding punctuation and a trailing
possessive suffix; identity still requires an exact reviewed span. Nested relationship
phrases retain their full anchors. Existing highlights and selections spanning
unrelated mentions keep ordinary controls. Assets preload outside the reader's
critical render path; late responses never replace or reopen a popup. Unsupported,
missing or stale content fails back to ordinary selection.

Book, chapter, edition and reader-view changes invalidate the frozen popup. Card
state does not navigate, seek audio, change page counts or feed position persistence.
Compare selections use the selected edition's paragraph and word anchors; their
highlights are written under that edition. Keyboard users can select text and use
Shift+F10 in the current reader; the popup contains keyboard focus and supports
Escape. Names remain ordinary prose.

## Verification before release

- Content compilation freshness check and all 10 Python contract tests passed.
- Full app suite: 150 files, 1,611 tests passed, including every pilot span and
  snapshot boundary in both editions, nested names, hidden Arobin role, earlier
  passage return, modern omission, stale source/hash, invalid editions, ambiguous
  spans, late preload/context changes, gallery fields and popup controls.
- Browser checks in WebKit 390×844 and Chromium 1440×950: original and modern
  English, chapters 1, 20 and 39, frozen place, no new highlight on card opening,
  dictionary alternative, gallery, keyboard selection/focus/Escape, Read/Compare,
  existing-highlight precedence and delayed/missing-asset fallback. Browser
  gestures are automated pointer events, not physical device testing.
- `npm run build` and `npm run verify-bundle` passed before release reconciliation.
- Latest verified preface release `ce865b1e` is the reconciled deployment baseline;
  the source project's unrelated uncommitted work is not part of this release.

## Editorial limits

Only The Awakening's two English editions are prepared: 86 original entries and
85 modern entries, across 39 chapters. This is the supplied author-reviewed first
pass, not independent editorial approval. Danish, other books, generic pronouns
and every incidental unnamed person are outside coverage. The original Holy Ghost
reference is intentionally absent in modern English. See the pilot README for
reference/venue omissions and unresolved Gluglu. Gallery entries may be families
or references, so no person totals are shown.

## Deployment and production evidence

Shipped from reconciled commit `7f23fc86` using Node 24 `CI=1 npm run deploy`.
The command rebuilt and passed bundle verification; direct deployment succeeded.
Worker version: `4e62e96f-6bfb-4dc6-be32-558534a437df`.
Bundle: `assets/index-CVpewRY0.js`.
SHA256: `e7af459275e738de978e0af0c687994ad6e9d6d569c7de2e445fff10781b94c0`.
Live bundle and sidecar bytes exactly match the build. All 15 production smoke
checks passed. No GitHub Actions deployment was used for this direct release.

The complete browser matrix above passed on tinct.app, including missing/slow
fallback, keyboard, both editions, Read/Compare and early/middle/late chapters.
Real production audiobook playback was started and paused; its exact source,
clock and reader location survived card, gallery and dismissal. `/lab/phone`
was opened at 390×844 and captured. Independent small-screen WebKit checks at
360×640 in dark mode with large text passed both editions. Context invalidation
uses a layout effect so the prior card clears before the new context paints.

One initial local full-matrix Compare gesture timed out; the isolated case and
complete repeated matrix passed without a product change. Production also passed.
This remains automated browser coverage, not a physical-device guarantee.

Artifacts: `/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-character-release/`
(`local`, `production`, `audio-production`, `bundle.json`, `lab-phone-production.png`).
Additional small-screen evidence: `tinct-character-cards/local-small/` beside it.
