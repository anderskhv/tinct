# Hyphenation hardening release, 2026-09-18

## Scope

The reader may use a discretionary hyphen only at the edge of a measured page.
The opening fragment is display-only. The complete logical word belongs to the
following page and retains the only paragraph/word identity used by position,
selection, highlighting, accessibility and audiobook follow.

English and Danish pattern data load only when the selected edition requires
them. A late load for an edition the reader has left cannot repaginate the new
edition. Until the requested patterns are ready, pagination safely falls back
to whole-word page boundaries.

This release does not change editions, book text, audio providers, dependencies
beyond the approved hyphenation packages, schema, pricing, authentication or
the Before you begin flow.

## Acceptance contract

The durable browser acceptance is
[`app/scripts/check-hyphenation-hardening.mjs`](../app/scripts/check-hyphenation-hardening.mjs).
It runs headlessly with Chromium audio muted, microphone access disabled and no
AI requests. It covers desktop and phone using the real built reader:

- locate a naturally measured page-edge split and reconstruct the source word;
- prove the fragment has no word identity, is `aria-hidden` and unselectable,
  and adds no synthetic hyphen to selected, copied or accessible text;
- turn forward and back, then reload, while preserving the logical page/word;
- follow real audiobook timing from the word before the split through the word
  that owns the remainder, recording an explicit service limit if production
  audio is unavailable;
- switch the reader from English to Danish and back through Settings while the
  first English pattern request is held, proving lazy loading, stale-load
  cancellation, repagination in the selected language and stable position.

Pull-request verification runs this acceptance against the candidate build.
The serialized production deploy repeats it against `https://tinct.app`, checks
the exact deployed bundle, and uploads JSON plus desktop and phone screenshots
under `app/artifacts/hyphenation-hardening`.

## Required release gates

- Node.js 24.13.0
- focused hyphenation, pagination, selection, hearing and audio tests
- full `npm test`
- `npm run build`
- `npm run verify-bundle`
- `python3 scripts/check-docs.py`
- candidate and production headless browser acceptance

Physical iOS remains a post-deploy observational check. It is not substituted
for the deterministic phone viewport acceptance and is not a release blocker.
