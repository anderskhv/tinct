# To the Lighthouse — narrow follow-up package

**Status:** content accepted and handed off to the coding agent. Not published.

This is the reviewed successor to the accepted package:

- Branch `claude/beautiful-allen-5llaf8`
- Commit `175a90f02db376a18a994856903a1b21e36f92a3`
- Folder `books/wip/to-the-lighthouse/`

It completes the narrow follow-up that the integration backlog (`docs/integration-backlog-2026-09-25.md` on main) listed as the hold on this book:

- 26.1 "then"
- 25.3 "some illness"
- the Prue card (died the same summer as her wedding)
- 40.10 "cosmogony"
- 27.0 Mrs. McNab's dialect

Start with [RELEASE-PACKET.md](RELEASE-PACKET.md).

| Path | What it holds |
|---|---|
| `RELEASE-PACKET.md` | Every destination artifact, with its source (this folder or the base commit), sha256, changed paragraphs, card impact and verify steps |
| `CHANGES.md` | Change ledger: each edit, before/after, Woolf's words and the reason |
| `edits.json` | The same edits in machine-readable form: exact old → new substrings, each occurring once, plus base pins |
| `editions/` | The successor modern-en edition and its per-paragraph hash list |
| `characters/` | The successor card editorial source, the recompiled sidecar and validation report, and the successor threads file |
| `reviews/independent-verification.md` | Independent verification, rounds 1 and 2, and the lead's disposition |
| `reviews/similarity-gate.txt` | Output of the unchanged `books/classify-modern-en.py` gate on the successor |

Files not listed here (original-en, onboarding, metadata proposal, source provenance, earlier reviews) are unchanged and stay authoritative in the base package at `175a90f0`.

Scope honoured:

- Only the listed paragraphs and the card and threads lines they affect were changed.
- The rest of the accepted edition is byte-identical.
- No app code, registry, live data, shared tooling, audio or Danish work was touched.
- Scratchpad scripts were used to apply the edits and to compile the sidecar. They are described in the release packet and are not committed.
