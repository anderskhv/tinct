# Acceptance Record — Heart of Darkness, modern-da Part III translation

**Status: ACCEPTED, ready for Codex integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/heart-of-darkness-modern-da-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| Candidate sha256 | `2bc45f4bf5a3280a1c86099e9f83357a9fdfdc09492b62f5936233d4e13074c9` |
| Replaces live sha256 | `b0d43952a120819a451538113d82947f922ddaba0535257fb19bd909ba834444` |
| Independent reviewer | A separate Claude agent instance, working from the English baseline and candidate JSON, plus the live-served chapters 1–2 for the slur-consistency check |
| Review verdict | **ACCEPT**, with one flag resolved and one copyedit fixed below |

## Independent review summary

Confirmed 87/87 paragraphs, 1:1; chapters 1–2 and the `sections` key
byte-identical to the live file — only chapter 3 touched. Sampled 30+
paragraphs across the whole chapter (harlequin scene, stake-heads, the
tribal woman, the bush confrontation, Kurtz's death, the full Brussels/
Intended scene): every plot beat, dialogue line, character and image
present, no flattening. Length-ratio scan across all 87 found no dropped-
content outliers. The ending was verified complete and at full weight: all
4 recurrences of "The horror! The horror!" → "Rædslen! Rædslen!", the
manager's boy's broken-grammar line preserved, and the full Intended scene
including Marlow's lie and her exultant/grieving reaction.

**Found and fixed:**
1. **Slur-consistency error.** The first draft rendered Conrad's one
   chapter-3 use of a period racial slur as "de sorte," on the mistaken
   assumption that already-accepted chapters 1–2 use that same neutral
   wording. Review found chapters 1–2 in fact use the direct calque
   "nigger"/"niggere" at 7 locations. Fixed: chapter 3 now uses "niggerne"
   at the one location, matching the book's actual established,
   edition-wide convention rather than introducing an inconsistency.
2. **Minor word-order slip.** "manageren drengs" → corrected to "managerens
   drengs" (paragraph 43).

Prose judged fluent, idiomatic, correctly literary/atmospheric — not a
calque, not machine-translation style.

## What "accepted" does not mean

Accepted for integration; not published, not live. This package does not
decide whether the book's use of a period slur should be revisited
book-wide — it only avoids introducing a new inconsistency into an
existing, already-accepted choice. Codex owns integration and the
serialized release process per `books/BOOK-TASK-WORKFLOW.md`.
