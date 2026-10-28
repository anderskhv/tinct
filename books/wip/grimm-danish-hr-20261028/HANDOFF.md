# Danish title abbreviation correction

User-requested replacement of both `herr` occurrences with `Hr.` in chapter 11, Gærdesmutten og bjørnen, paragraph 0. The resulting phrases are `Hr. kongen` and `Hr. konge`; surrounding wording is preserved.

Owned path: books/wip/grimm-danish-hr-20261028/. Instructions and source pinned to 58e631dcca524d2b265bccd9f7d43a94aebd6ebe. Only this paragraph was reviewed for the requested spelling correction; this is not a whole-book review.

Validated: two substitutions only, same whitespace word count, paragraph identity unchanged, exact before/after SHA-256 recorded. No chapter/paragraph mapping changes. Integration must check the pinned source, affected character references and text-keyed narration cache compatibility. No audio generation authorized. Original runtime and existing staging editions remain unchanged.

## Integration verification

Integrated separately in commit 759190d9c. The runtime diff contains exactly the two requested replacements in paragraph 11:0. No chapter, paragraph, or whitespace-word-count changes. No applicable Grimm character release or Danish edition shard was found; narration reuse remains guarded by the existing text hash. No audio generated.

Build and verify-bundle passed (index-B_n6znpa.js). Isolated Chromium and WebKit reader checks rendered both Hr. occurrences, rejected the old spelling, and preserved position after reload. The WebKit screenshot was visually inspected. These checks used local built assets and synthetic API responses, not production acceptance. Logs: /tmp/tinct-grimm-hr-build.log, /tmp/tinct-grimm-hr-verify.log, /tmp/tinct-grimm-hr-browser-final.log.

CI integration follow-up: packageDanishEditions.test.ts caught that the canonical package copy also requires the exact two replacements. Updated books/wip/grimms-fairy-tales/editions/grimms-fairy-tales-modern-da.json to match runtime byte-for-byte; the parity/alignment assertion is unchanged.
