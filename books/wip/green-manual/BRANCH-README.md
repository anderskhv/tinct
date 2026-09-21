# The Manual — complete staged repair

Reviewed: 2026-09-17

**Status: all 52 sections / 68 paragraphs completed, independently reviewed and editorially accepted within the stated English-source scope. Staged only; not published.**

Anders explicitly asked Codex to finish The Manual on September 17. This is a bounded exception to Claude's general content ownership, not a change to the Sonnet/Opus programme for other books. Actual author/coordinator and two separate reviewers were Codex agents. No Anthropic APIs or bulk generator were used.

## Read or use

- [Complete candidate](accepted.json)
- [Readable text](readable.md)
- [Locked source](source.json) and [original source bytes](source-original-bytes.json)
- [Prior served-edition baseline](base-modern-en.json)
- [First-half independent review](review-first-half.md)
- [Second-half independent review](review-second-half.md)
- [Validation](validation.json)
- [Exact paragraph change ledger](change-ledger.json)
- [Recovered September 15 evidence](legacy/README.md)

Candidate SHA-256: `d785f2c99c7f628123b976457303d32143782f4e576e8d81671636e2c1e3bd42`.
Source pinned at main commit `42f5e3ce7f442b2335ac692b497b75526a5fc9ea`.
Raw source SHA-256: `23835259e0a0d52214f7554e44b0adaf44c5ec5e8a356bd196d3ccb948dc803e`.
Raw prior edition SHA-256: `2ac0db1347defd5bea73e993f4db672a37136f53bcf69423dab544de20040f35`.
Recovered first-half raw candidate SHA-256: `c4a45bb09c061760c741aefdb62a1cbc72d28b80383d01ad7db7a6849f3e1f51` (matches its earlier acceptance record).
All 68 source and baseline paragraph hashes match the earlier package.

## Work and evidence

Recovered the prior first-half artifact without modifying it. Compared the entire work against George Long's English source. Repaired the remaining sections and reopened first-half issues found by independent review; preserved sound existing passages. Restored missing examples, images, conditions and argument distinctions; retained historical slavery, physical punishment and sexual/social prescriptions rather than silently sanitizing them.

Relative to the earlier partial candidate, 19 first-half and 40 second-half paragraphs changed. Relative to the pinned served-edition baseline, 64 of 68 paragraphs changed. This is a substantial staged repair, not a claim that only isolated words changed.

Reviewers checked all 68 paragraphs across two non-overlapping halves and read each half continuously. They independently verified required corrections on frozen revisions. Candidate-v4 is copied unchanged to accepted.json. Coordinator read the integrated text and checked consistent names, central vocabulary, chapter sequence and the end quotations. Structure validation confirms 52 ordered sections, 68 nonempty paragraphs and preserved paragraph counts/titles. Counts/hashes do not prove fidelity.

## Verification limits

This is modernization of the locked English translation, not a new Greek translation or a specialist certification. No guarantee of zero residual errors. Difficult source ideas remain, especially nature, §27's argument and §§47–48's historical practice/analogy. Further contextual explanation belongs in separately sourced notes, not silent additions to the text.

The local historical documentation checker passed (12 documents, 0 errors, 0 reminders); that does not certify the remote branch's broader documentation. Package links and remote bytes were checked separately.

## Release boundary and next action

The text work is complete and ready for the content/publication owner. The app's served editions, registry, landing pages, defaults, Danish text, audio and timings were not changed. No merge or deploy.

All 64 changed paragraphs are flagged audio_affected in this staged ledger. Before publication, reconcile against current main, move accepted repair records into the production ledger, and replace or withhold stale audio/timings through the separate release pipeline. Do not describe this staged edition as live or its old recording as matching.
