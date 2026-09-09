# Awakening character copy revision — September 9

Published the approved baseline-identity rewrite and removed the repeated “young mother whose summer…” sentence from Edna’s Chapter 10 reminder. Its body now starts with learning to swim. Both English editions use the revised copy; source text, exact mentions, and spoiler gates remain unchanged.

Production initially served the previous immutable character asset. The reader now requests revision `2026-09-09.2` explicitly; a regression verifies that request revision against content metadata.

- Full suite: 1,611 passed; after adding the cache regression, focused character suite: 13 passed. Python content suite: 12 passed.
- Build and verify-bundle passed inside the approved `npm run deploy` path.
- Direct deployment succeeded: `e1d941c5-7c45-4cd8-b385-98b524a2cb73`. No GitHub Actions run was used.
- Production bundle: `assets/index-CQYy5UNw.js`.
- SHA256: `3052ad6bc7932a80ff47bbaa8e336f73c482a42c77b1fd868d2a648e6a28bebf`.
- Production `/lab/phone`, mobile WebKit 390×844: Chapter 10 Edna card checked in original and modern English. New first sentence present, deleted sentence absent. Downloaded bundle matches local build bytes; versioned live card asset matches the complete compiled revision.
- Screenshots and machine-readable results: `/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-character-copy-release/`.

The original-English screenshot was visually inspected. The existing release owner was notified to retain the copy and cache correction in subsequent releases.
