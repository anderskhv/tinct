# Status: gilgamesh-thompson

**STATUS: content accepted with Anders's decisions of 17 Nov 2026; integrated on branch `integrate/gilgamesh-thompson` (18 Nov 2026), not yet released.**

Decisions applied at integration (Anders, 17 Nov 2026):
- **Friedrich paragraphs dropped.** Tablet V paragraphs 6 and 7 (the Sun-god's winds; Humbaba's surrender and plea) and Tablet VII paragraph 2 (the gods' council: "Enkidu shall die"), Thompson's English of the Hittite version credited to J. Friedrich (d. 1972) and A. Ungnad, are removed from original-en, modern-en and modern-da at the same index. 161 -> 158 paragraphs; Tablet V 8 -> 6, Tablet VII 9 -> 8. Recorded in `provenance-map.json` under `droppedParagraphs`. Gates rerun on the final files: classify gate PASS (0.328), structure, alignment and `!` parity pass; VII.2 (formerly VII.3, a printed note) is still the only paragraph under 75%.
- **modern-da published without a native-speaker read** (explicit owner waiver). The independent fidelity spot-check is also not done. Both remain open quality steps, not release blockers.
- `structure-map.json`: counts-only proportional map from the old 253-paragraph text, input to `app/scripts/build-replacement-migration.py`.

Final sha256: original-en `13a06194f842eece71b770b4557bbcf6eca5c251610c5a83140b36c1a5c769ce`, modern-en `1641d807941a9480512f1324869e8abcb635fb31aaff0d2d659eb88985d896d0`, modern-da `3469ed8fc8cc6ccc3f832e01bcf9fa81dfaaa9edac39ddc16c40983535d3aa56`.

Original package status (16 Nov):

| Edition | State |
|---|---|
| original-en (Thompson 1928, as printed) | Complete: 12 tablets, 161 paragraphs. Transcribed from the page images; 99.0% OCR trigram agreement. |
| modern-en | Complete. classify gate PASS (0.329). Overlap vs old live text: 0/161 at both n=10 and n=8. |
| modern-da | Complete; published 18 Nov 2026 on the owner's waiver. Structural checks, danish-lint (0 findings) and the overlap check vs the old live Danish (0/161) all pass. Native Danish read and independent review are pending. |
| Threads / characters / onboarding / SEO / narration | Not touched. These are for the integration step (see HANDOFF.md). |

Decisions (settled 17 Nov 2026):
- The three Friedrich-derived Hittite paragraphs (V.6, V.7, VII.2) are dropped.
- The recension mix and the missing Humbaba fight are explained in the onboarding "about" text (English and Danish).

No TODO passages: nothing was blocked, and every paragraph is rendered in both modern editions.

History: the session's original worktree was removed mid-task. The package was rebuilt from scratch-pad working files into a new worktree on the same branch. Nothing was lost; all gates were rerun on the final files.
