# Nine reviewed Shakespeare character packages — 2026-09-10

Production integration of Claude Opus content at 2cec3d12, based on 607ab9b1.
Content import/corrections: 20b4d7bc. App integration: f8ee1ec8.
Preserves audio token-group fix eb7f592c, edition availability b9706eff and the compact highlight menu.

## Scope

Both original and modern English editions: Measure for Measure, Henry V,
The Winter’s Tale, Cymbeline, Coriolanus, Antony and Cleopatra, Richard III,
Henry IV Part 2, and The Merry Wives of Windsor.
This batch does not imply the remaining authored library is live.
Measure for Measure and Merry Wives remain held from new discovery by the
independent audio availability policy; saved/direct text access remains.

Every source fingerprint matched the current shipping edition (18 files).
All nine editorial READMEs were reviewed, including revelation gates, namesakes,
source defects and deliberately omitted modern references. No edition prose changed.
Cymbeline 13:8 bare Caesar is left unbound. Richard III 19:10 Plantagenet and
19:11 Edward pairs are left unbound. These supersede tentative author assignments;
builders, sidecars, tests and README addenda agree. Merry Wives 5:17 ambiguity was
already omitted. Coordinator was notified to carry corrections back to authorship.

A browser-discovered selection bug was fixed: edge underscores around italic
names now trim like punctuation when resolving a click. Source offsets remain intact.

## Verification

Original content return: 434 tests passed independently. Imported release content:
122 tests passed; nine builder --check runs passed. App: 1,663 tests in 153 files,
including exact snapshot boundaries, backwards lookup, source hashes, mention
resolution and saved-highlight precedence. Build and verify-bundle passed.
Local browser: 144 card cases and 16 deliberate omission cases passed on WebKit
390×844 and Chromium 1440×950, both editions. Cards preserve reader place and do
not create a saved highlight. Representative screenshots inspected.

Direct npm deploy succeeded (no GitHub Actions run used).
Worker: bf3c55cd-0c42-47c7-b33e-341130e26532.
Bundle: index-DzgT0SMy.js.
SHA256: 26ead3168c73a508ff9bb115307a6dfbab2bd4c3f2d79572f409c9172d315553.
Live /lab/phone references this bundle; bundle and all nine live assets match
local build bytes. All 15 production smoke checks passed.
Production browser: all 144 card scenarios and 16 omission checks passed. The
Measure for Measure batch was rerun in full after the initial failure below.

Artifacts: /Users/andershvelplund/.codex/visualizations/2026/09/10/tinct-characters-nine/
Each book contains phone/desktop screenshots and results.json; omissions contains
16 negative checks. asset-verification.json records hashes; lab-phone.png records
the production entry point. Browser automation is not physical-device certification.

## Remaining limits

One first live Measure for Measure click opened dictionary information instead of
a character card; an isolated repeat passed. Possible cold character-asset readiness
is not yet root-caused. Keep this observation separate from editorial coverage.
Source transcription defects described in package READMEs remain unchanged.
No audio/R2 generation or publication was performed for this release.
