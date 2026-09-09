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
- Full app suite: 150 files, 1,610 tests passed, including every pilot span and
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

Pending final reconciled build, deployment and live verification. Do not interpret
local browser checks as production evidence. The agent will append the deployed
Worker version, exact bundle hash, smoke-test result and artifact directory here.
