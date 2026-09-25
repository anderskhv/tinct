# To the Lighthouse — narrow follow-up: change ledger

Base: the accepted package at `claude/beautiful-allen-5llaf8` commit
`175a90f02db376a18a994856903a1b21e36f92a3`, folder `books/wip/to-the-lighthouse/`.

- The base modern-en has sha256 `17c56b3d069214329a1f636bc7ad0286e38576d70ebe7921affc431f90149205`.
- Paragraph coordinates are `chapter.index`: the chapter is 1-based and the paragraph index is 0-based.
- The machine-readable form of every edit is `edits.json`. Each `old` string occurs exactly once in its target and is replaced by `new`.

## Edition: `to-the-lighthouse-modern-en` (4 paragraphs)

| ID | ¶ | Before | After | Woolf | Why |
|---|---|---|---|---|---|
| LH-FU-1 | 26.1 | Violets came, and then daffodils. | Violets came, and daffodils. | Violets came and daffodils. | "then" invented a sequence Woolf does not state. |
| LH-FU-2 | 25.3 | Prue Ramsay died of an illness connected with childbirth. | Prue Ramsay died of some illness connected with childbirth. | died that summer in some illness connected with childbirth | "some" keeps the report's vagueness about what the illness was. |
| LH-FU-3 | 40.10 | Meddling like this in their cosmos, she drove them into a frenzy of indecision. | Meddling like this in the making of their world, she drove them into a frenzy of indecision. | this interference in their cosmogony | A cosmogony is the making of a world, not the world itself. The plain phrase keeps Lily's mock-creator role over the ants. |
| LH-FU-4a | 27.0 | —well, it would need seeing to, that it would. | —it would need seeing to, it would. | it would want seeing to—it would. | Restores her own echo. "well" and "that it would" amplified the dialect. |
| LH-FU-4b | 27.0 | The books and all were gone moldy, | The books and things were moldy, | The books and things were mouldy | Removes added dialect. |
| LH-FU-4c | 27.0 | the carpet was ruined, clean ruined. | the carpet was ruined, quite ruined. | the carpet was ruined quite. | Her own postposed "quite" replaces the added rustic "clean". |
| LH-FU-4d | 27.0 | But folks should come and see for themselves; | But people should come and see for themselves; | But people should come themselves | "folks" was added. |
| LH-FU-4e | 27.0 | She’d never be wanting _them_ again. Dead, they said she was; years back, in London. | She’d never want _them_ again. She was dead, they said; years ago, in London. | She would never want _them_ again. She was dead, they said; years ago, in London. | Removes the added progressive and inversion. The italics and an ordinary contraction stay. |
| LH-FU-4f | 27.0 | (a pitiful sight the garden was now, run wild, rabbits scuttling out at you from the beds) | (the garden was a pitiful sight now, all run wild, and rabbits scuttling out at you from the beds) | (the garden was a pitiful sight now, all run to riot, and rabbits scuttling at you out of the beds) | Restores her word order and "all". The inversion was added. |
| LH-FU-4g | 27.0 | (Went very sudden at the end, they said.) | (She had died very sudden at the end, they said.) | (She had died very sudden at the end, they said.) | The subjectless euphemism was added. Woolf's own "very sudden" stays as her marker of Mrs. McNab's speech. |
| LH-FU-4h | 27.0 | …just as they left it, oh dear, dear! | …just as they left it, ah dear! | …as they had left them, ah dear! | The doubled "dear, dear" amplified Woolf's single exclamation. Her own "ah" is kept: it is Mrs. McNab's sigh, distinct from Mrs. Ramsay's "Oh dear!" at 40.9. This follows independent verification R1, defect 27.0-1. |

27.0 keeps Mrs. McNab's voice as Woolf marks it: "what with the war", "for all the world as if", "Poor lady!", "very sudden", the "it would" echo, the postposed "quite", ordinary contractions, and the earlier accepted fix that keeps the washing with Mrs. McNab ("as she came up the drive with the washing"). The follow-up's scope was 27.0 only.

**Observed, not changed (out of scope for this narrow follow-up):**

- 27.2 has the same kind of light amplification: "Miss Prue gone too, so they said" (Woolf: "dead too, they said"), "gone up something shocking" ("shamefully"), "But dear me," ("But dear,") and "Oh, she remembered her well" ("She could well remember her"). The original fidelity review F4 judged this within tolerance. A future pass may take it up.
- The edition hyphenates "looking-glass" at 23.0 but writes "looking glass" at 27.0.
- The optional restorations the verifier suggested in 27.0 were not applied, to keep the reviewed scope narrow: "without a soul in it", "Suppose", "beyond one person's strength" and "full of things".

## Character card (`characters/editorial.json`, compiled into `characters.v1.json`)

| ID | Where | Before | After |
|---|---|---|---|
| LH-FU-5 | `prue`, snapshot released after 25.3 (both editions) | A bracketed passage reports that she died the summer after her wedding, of an illness connected with childbirth. | A bracketed passage reports that she died that summer, within months of her May wedding, of some illness connected with childbirth. |
| LH-FU-7 | `contentVersion` | `2026-09-24.1` | `2026-09-25.1` |

- LH-FU-5: Woolf reports the wedding "that May" (25.1) and the death "that summer" (25.3), so both fall in the same year. "The summer after her wedding" could be read as a year later. "within months of her May wedding" states only what the text does, and "some illness" matches LH-FU-2.
- LH-FU-7: the card content changed, so it gets a new content version. The registry revision must equal it.

## Threads (`characters/to-the-lighthouse-threads.json`)

| ID | Where | Before | After |
|---|---|---|---|
| LH-FU-6 | `prue` → chapter 25 → `modern-en` | …Another reports that she died that summer of an illness connected with childbirth. | …Another reports that she died that summer of some illness connected with childbirth. |

This is a consequential consistency edit. The modern-en summary keeps the same vagueness as the corrected text and card.

## Not changed

- `to-the-lighthouse-original-en.json`: Woolf. Byte-identical to the base.
- `onboarding/to-the-lighthouse.json`: no reference to any changed passage. Byte-identical to the base.
- The base package's authoring worksheet `characters/source-review.md` (not a release artifact; it contains spoilers) still quotes the superseded Prue card wording at its line 113. The compiled card and `editorial.json` in this folder are authoritative.
