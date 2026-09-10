# Hamlet character cards — September 10

First completed batch of the approved whole-library rollout. Content supplied by
`codex/character-cards-pilot` commit `88ce4437`; integrated independently into the
reconciled reader release checkout. Other library batches remain in progress.

## Scope and invariants

Both English editions cover all 20 scenes and 1,391 paragraphs: original has
80 entries and 1,851 bound mentions; modern has 67 entries and 1,847 mentions.
These are reference entries, not a count of individual people. Stage directions,
speaker labels, performed roles, and father/son name collisions are handled by
exact spans. Thirteen references absent from modern text are intentionally omitted.
The Ghost's later identification is passage-gated and attributed as a claim.
No book text or pagination changes. Existing Awakening and Bible/Baruch assets
and cache versions are preserved. Bible coverage remains limited to Baruch.

The loader requires edition hashes and verified spans. No per-selection model
request is introduced. Source review and omissions are in `books/characters/hamlet/`.

## Validation before deployment

- Compiler freshness check and 22 Python character-package tests passed.
- 1,629 app tests passed; build and bundle verification passed.
- 20 browser cases passed: phone WebKit and desktop Chromium, both editions,
  stage direction, speaker, father Hamlet, performed King, and late Horatio.
- Every browser case checks exact card identity/body, unchanged reader position,
  and no persisted highlight. Requests to model APIs were blocked.
- Settled screenshots inspected. An initial screenshot captured the popup's
  150 ms opening fade; a 350 ms screenshot wait confirms readable opaque cards.
  No speculative CSS change made.

Deployment and production verification pending below.
