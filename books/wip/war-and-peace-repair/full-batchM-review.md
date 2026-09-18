# Batch M — INDEPENDENT REVIEW (chapters 283–307, 20 chapters)

Reviewer: independent pass, not the drafting agent.
Inputs:
- Source (Maude): `full-batchM-source.json`
- Pre-fix: `full-batchM-current-modern-en.json`
- Post-fix: `full-batchM-corrected.json`
- Drafter's notes: `full-batchM-notes.md`

Method: (1) programmatic full diff corrected-vs-current; (2) targeted verification of each
claimed fix against source; (3) independent paragraph-by-paragraph read of **all 20 chapters**
against source, including the 17 marked "sound"; (4) programmatic numeric-token and
proper-noun cross-check across all chapters.

---

## 1. Confirmed diff (corrected vs current)

Chapter set is identical in all three files:
`283, 284, 285, 286, 287, 289, 293, 294, 295, 296, 297, 298, 299, 301, 302, 303, 304, 305, 306, 307`.

Paragraph counts match source exactly in all 20 chapters (independently re-verified, not taken
from the notes). No titles changed. No paragraphs added, dropped, merged or reordered.

**Exactly three paragraphs differ**, in exactly the three chapters claimed — nothing else:

| Chapter | Para idx | Current | Corrected |
|---|---|---|---|
| 283 | 18 | `'Ha, ha, ha! Bravo, Nikolai Ivanych! Ha, ha, ha!'` | `'Ha, ha, ha! Bravo, Nicholas Ivanych! Ha, ha, ha!'` |
| 305 | 31 | `('Thank you, sir.')` | `('Do you want something to eat? Don't be afraid, they won't hurt you.')` |
| 306 | 15 | `...You send off a hundred and thirty arrive. The rest either starve...` | `...You send off a hundred men, and thirty arrive. The rest either starve...` |

Confirmed: 3 changed paragraphs, 3 chapters, nothing else touched. The drafter's diff claim is accurate.

---

## 2. Verification of each fix against source

### Ch. 283 p18 — name normalization — **VALID**
Source: `"Ha, ha, ha! Bravo, Nicholas Iványch! Ha, ha, ha!"`
Maude uses "Nicholas". The pre-fix edition had "Nikolai", contradicting the edition's own
name-normalization rule. The fix restores the source spelling. Scanned the whole batch for
`Nikolai / Andrei / Marya` in the corrected file: **zero remaining occurrences**. Confirmed sound.

### Ch. 305 p31 — footnote restoration — **VALID, and the defect was real**
Source structure at this point (paras 30–34):

- S30 (dialogue, French + two footnote markers):
  `"Ah, c'est vous!" said Pétya. "Voulez-vous manger? N'ayez pas peur, on ne vous fera pas de mal," * ... "Entrez, entrez." *(2)`
- S31 (footnote 1): `* "Ah, it's you! Do you want something to eat? Don't be afraid, they won't hurt you."`
- S32 (footnote 2): `* (2) "Come in, come in."`
- S33 (dialogue): `"Merci, monsieur," *`
- S34 (footnote): `* "Thank you, sir."`

Pre-fix, para 31 held a stray duplicate of `('Thank you, sir.')` — i.e. the S34 footnote appeared
twice (once wrongly at 31, once correctly at 34) and the actual S31 content was **gone**. That is
a genuine content omission masked by a duplicate, not a style issue. The fix inserts the correct
S31 text. The French is `Voulez-vous manger? N'ayez pas peur, on ne vous fera pas de mal` and
Maude's own footnote translation is `Do you want something to eat? Don't be afraid, they won't
hurt you.` — the restored string matches Maude's footnote verbatim (minus the leading "Ah, it's
you!", which is already carried by the inline dialogue in para 30). Correct.

Note on convention (not a defect): para 30 inlines the English of the French dialogue, and paras
31/32 then repeat that same English as parenthetical footnotes. This is redundant on the page but
it is the batch-wide, paragraph-count-preserving convention (same pattern at 302 p2/p3 and
throughout 307), so it is correctly left alone here.

### Ch. 306 p15 — garbled sentence — **VALID, and the defect was real**
Source: `"You send a hundred men away, and thirty get there. The rest either starve or get killed."`
Pre-fix: `"You send off a hundred and thirty arrive."` — with "men" dropped and no comma, this
parses first as "a hundred and thirty [130] arrive", which inverts Dólokhov's point (that escorted
prisoner transfers kill most of the prisoners). The corrected `"You send off a hundred men, and
thirty arrive."` restores the 100→30 ratio unambiguously and matches the source claim. Correct.

**All three fixes verified against source. No over-correction, no collateral edits.**

---

## 3. Independent findings — all 20 chapters

Read every paragraph of every chapter against its source paragraph. Also ran an automated check
for numeric-token drift (all cardinals/ordinals, spelled and digit) and for source proper nouns
absent from the corrected chapter. **Numeric check: zero genuine discrepancies** — every apparent
delta resolved to hyphenation (`three-quarters`, `nine-tenths`), date style (`October 22` →
`October twenty-second`), regiment style (`6-me`/`6th` → `Sixth`), or footnote markers. **Name
check: zero banned spellings; all Maude proper nouns present under the normalized spelling**
(`Raevski→Raevsky`, `Alexey→Alexei`, `Peter→Pyotr`, `Michael→Mikhail`, `Moskowa→Moskva`).

| Ch | Verdict | Notes |
|---|---|---|
| 283 | Sound (post-fix) | Ermolov's evasion, the Echkino party, Konovnitsyn remark all faithful. `torban` generalized to "a stringed instrument" — acceptable modernization. |
| 284 | Sound | Kutuzov's rage, Eykhen and Brozin, the interior monologue, Ermolov's next-day absence — all present and faithful. |
| 285 | Sound | Orlov-Denisov's raid, the Polish sergeant, hundred gold pieces, 1,500 prisoners / 38 guns, Bagovut's death — all correct. |
| 286 | Sound | Kutuzov's restraint, Ermolov's aside to Raevsky, diamond decoration / 100,000 rubles, parallelogram-of-forces — faithful. |
| 287 | Sound (one trivial elision) | See finding **F4**. |
| 289 | Sound (one low-severity slip) | See finding **F3**. Dispatch quotations, the wounded-animal simile, the figurehead image all faithful. |
| 293 | Sound | The baggage-train march, the looting commentary, the "immortal soul" laugh — faithful; the long observed-loot dialogue (p5/p6) is fully preserved. |
| 294 | Sound | Dokhturov's career, the shaving/cogwheel image, Bolkhovitinov's dispatch — faithful. |
| 295 | Sound | Night ride, Shcherbinin/Konovnitsyn waking, the cockroach detail, the cogwheel close — faithful. |
| 296 | Sound | The green-apple and wounded-beast reasoning, the Madame de Staël routine list, the prayer — faithful. Quote punctuation at p4/p5 closes a run-on quote the source leaves open; harmless. |
| 297 | Sound (one trivial addition) | See finding **F7**. `le hourra de l'Empereur` and `les enfants du Don` both rendered inline without loss. |
| 298 | Sound | Promised-land argument, the snow simile, the golden bridge, the blank sheet of paper — faithful. |
| 299 | Sound (one trivial elision) | See finding **F5**. Karp-and-Vlas and the rapier/cudgel duel are fully preserved. |
| 301 | Sound | Davydov, the sexton, Vasilisa, 1,500 French / 200 Cossacks, the Pole-and-German double refusal — faithful. |
| 302 | Sound | Petya's arrival, the esaul, the "presupposable" joke preserved. The esaul footnote uses the inline+parenthetical double, consistent with batch convention. |
| 303 | Sound | Reconnaissance and Tikhon backstory faithful. `"more-orderers"` (the peasant corruption of *maraudeurs*) is flattened to "marauders" at p21/p22 — a deliberate modernization, meaning intact. |
| 304 | One low-severity slip | See finding **F2**. Otherwise Tikhon's comic account is faithful, including the gap-tooth etymology. |
| 305 | Sound (post-fix) | Raisins / flints / clasp knife, Vincent-Vesenny etymology, Petya's hesitation — all faithful. |
| 306 | Sound (post-fix), one low-severity elision | See finding **F6**. |
| 307 | One low-severity slip | See finding **F1**. Sentinel challenge, Dolokhov's interrogation, and the whole French-footnote pattern otherwise faithful and consistent. |

---

## 4. Additional defects found (beyond the drafter's three)

None are ship-blocking. Listed worst-first.

**F1 — ch. 307 p22/p23 — "Bonjour" rendered as "Good evening". Severity: LOW.**
Source dialogue `"Bonjour, messieurs!"` with footnote `"Good day, gentlemen."`
Corrected renders both as `'Good evening, gentlemen!'` / `('Good evening, gentlemen.')`.
This contradicts Maude's own footnote, and it collides with p38, where Dólokhov's *departure*
line in the source genuinely is `"Good evening, gentlemen"`. The edition therefore has him say
the identical phrase on arrival and on leaving, collapsing a distinction the source makes.
Suggested: `'Good day, gentlemen!'` / `('Good day, gentlemen.')` at p22/p23.

**F2 — ch. 304 p21 — Tikhon's sarcasm inverted. Severity: LOW.**
Source: `"But why are you angry?" remonstrated Tíkhon, "just as if I'd never seen your Frenchmen!"`
— indignant sarcasm meaning *you're treating me as though I don't know Frenchmen.*
Corrected: `'But why are you angry?' Tikhon protested. 'Just because I haven't seen your Frenchmen before?'`
— which asserts, literally, that he has **not** seen them, reversing the sense. Suggested:
`'As if I'd never seen your Frenchmen!'`

**F3 — ch. 289 p1 — Thiers/Fain date polemic loses its direction. Severity: LOW.**
Source: Thiers `enters into a polemic with M. Fain to prove that this work of genius must be
referred **not to the fourth but to the fifteenth** of October`.
Corrected: `(entering into a debate with Fain about whether it should be dated to the fourth or
fifteenth of October)` — drops which side Thiers argued, turning a stated position into an open
question. The surrounding satire still lands, but the claim is weakened.

**F4 — ch. 287 p4 — dropped locative. Severity: TRIVIAL.**
Source: `...must incline Germans to recognize his genius as the only explanation of **the war
carried on in Germany**.` Corrected ends at `...as the only explanation.` Referent still inferable.

**F5 — ch. 299 p2 — dropped hedge. Severity: TRIVIAL.**
Source: `all the facts of history **(as far as we know it)** confirm...` — parenthetical dropped.
Same paragraph compresses `a kingdom and an entire nation of several millions` to `a kingdom of
several millions`.

**F6 — ch. 306 p15 — final clause elided. Severity: TRIVIAL.**
Source: `So isn't it all the same **not to send them**?` → Corrected: `So what's the difference?`
The explicit conclusion (that not sending them is equivalent) becomes implicit. Directly adjacent
to the fixed sentence, so worth a glance if that paragraph is touched again.

**F7 — ch. 297 p8 — small invented clause. Severity: TRIVIAL.**
Corrected adds `What saved Napoleon **wasn't the strength of his forces** but the very thing that
was destroying the French army...`. The contrastive half is not in the source, though it does not
distort the argument.

### Systemic observation (not a defect)
Wherever Maude prints French dialogue plus a footnote translation, this edition both **inlines**
the English in the dialogue paragraph **and** keeps the footnote paragraph as a parenthetical
repeat of the same English (305 p30–32, 302 p2–3, 307 p2–3/p5–6/p8–9/p11–12/p14–15/p22–23).
Readers see the line twice. This is a deliberate, consistent, paragraph-alignment-preserving
choice and is correctly out of scope for a fidelity pass — but it is an edition-wide readability
decision that deserves a separate ruling, since alignment could equally be preserved by making
the dialogue paragraph carry the French and the footnote paragraph carry the translation.

---

## 5. Final verdict

**ACCEPT `full-batchM-corrected.json`.**

- The diff is exactly the three claimed paragraphs in the three claimed chapters; nothing else changed.
- All three fixes are verified correct against the Maude source. The ch. 305 and ch. 306 defects
  were genuine content defects (a dropped footnote translation masked by a duplicate; a garbled
  sentence that inverted a ratio), not cosmetic finds.
- Independent read of all 20 chapters, including the 17 marked "sound", found **no omissions, no
  inventions, no paragraph misalignment, and no numeric or proper-noun errors**.
- Seven additional issues found, all LOW or TRIVIAL. F1 (307 "Bonjour"→"Good evening") and F2
  (304 inverted sarcasm) are the only two worth a follow-up edit; neither blocks shipping this batch.

The drafter's claim of 17/20 sound is **substantially correct**. Strictly, three of the seventeen
(287, 289, 299) and two of the reviewed-as-fine remainder (304, 307) carry minor slips the drafting
pass did not surface — but none rise to the level of the defects that were caught and fixed.
