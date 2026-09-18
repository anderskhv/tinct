# Batch J — Independent Fidelity Review (chapters 212–233, excl. 222/231)

Reviewer: independent pass, run against the Maude source with no reliance on the
drafter's notes. Every paragraph of all 20 chapters was read pairwise against
the source, including the 18 chapters the drafting pass marked "sound."

Files reviewed:
- `full-batchJ-source.json` (Maude)
- `full-batchJ-current-modern-en.json` (pre-fix)
- `full-batchJ-corrected.json` (post-fix)
- `full-batchJ-notes.md` (drafter's notes)

---

## 1. Diff: corrected vs. current — CONFIRMED

Machine diff of every chapter and every paragraph.

- Chapter sets are identical across source / current / corrected: 212–221,
  223–230, 232, 233 (20 chapters).
- Paragraph counts match the source exactly in all 20 chapters (independently
  recomputed; the drafter's table is accurate).
- Chapter titles unchanged.
- **Exactly two paragraphs differ** between current and corrected:
  - `214 ¶7` — "company commander" → "squadron commander"
  - `221 ¶23` — "left foreleg" → "right foreleg"

Nothing else changed. No merges, splits, drops, additions, or reorderings.

---

## 2. Verification of the two applied fixes

### Fix A — 214 ¶7, "squadron commander" — CORRECT

Source: *"The red-nosed Captain Timókhin, formerly Dólokhov's **squadron**
commander, but now from lack of officers a battalion commander…"*

The source reads "squadron commander" verbatim. The pre-fix text said "company
commander." The fix restores the source wording exactly. **Accept.**

Reviewer note (not a blocker): "squadron" is a cavalry sub-unit, whereas
Timokhin is established earlier in the novel as an *infantry* company commander
(Dolokhov served as a ranker in his company at Schön Grabern). So Maude's own
wording here sits oddly with earlier chapters. That is Maude's problem, not
ours: under a fidelity check the source governs, and the fix is right. But if a
later pass normalizes Timokhin's unit type across the whole book, this is the
paragraph that will need revisiting — and the decision should be made book-wide,
not here.

### Fix B — 221 ¶23, "off foreleg" → "right foreleg" — CORRECT

Source: *"'Why… she's wounded!' said the adjutant. 'In the **off** foreleg above
the knee. A bullet, no doubt…'"*

In period (and current) horsemanship, a horse's **near** side is its **left**
(the side from which a rider mounts) and its **off** side is its **right**. This
is standard and unambiguous. "Off foreleg" = right foreleg. The pre-fix text
said "left," which reversed the side; the fix says "right," which is the correct
plain-English equivalent. **Accept.**

---

## 3. Independent findings, chapter by chapter

Read in full, adversarially, against the source. Heuristic sweeps were also run
over all 594 paragraph pairs for: word-count collapse, dropped/added numerals,
directional-word flips (left/right/front/rear/near/off/above/below), negation
count deltas, and dropped proper nouns. Every flag was then inspected by hand.

| Ch | Verdict | Note |
|---|---|---|
| 212 | Sound | Kutuzov's review, Boris, Dolokhov's reconciliation. ¶16's "no one else could so create an impression" comparative is flattened to "he skillfully created the impression" — gist preserved. "Kirílovich" → "Kirilych" is a register shift (formal patronymic → colloquial contraction), cosmetic. |
| 213 | Sound | Bennigsen's ride, the hare, the ambush troops. The key point — Bennigsen, not Kutuzov, moved the ambush troops without authorization — is preserved uninverted. |
| 214 | Fixed | See Fix A. Remainder faithful. |
| 215 | **Defect (D1)** | See §4. Long Barclay/chess/Germans dialogue is otherwise accurate; the "left flank weak, right flank overextended" summary is preserved correctly. |
| 216 | Sound | Napoleon's toilette, de Beausset, the King of Rome portrait, the proclamation. All details and the proclamation text match. |
| 217 | Minor (D5, D6) | Gun counts verified digit by digit: 24 + 30 + 8 = 62; 16 howitzers; 40 guns; 102 total — all correct. Four numbered orders and the four-part refutation all match. |
| 218 | Sound | The "Napoleon's cold" digression. The source's own internal date slip (24th vs 26th August) is preserved rather than silently "corrected" — right call. |
| 219 | Sound | Rapp, the chessboard remark, the medicine monologue, "the wine is drawn and must be drunk." |
| 220 | Sound | Pierre wakes, the panorama. Checked closely for dropped imagery; the long descriptive paragraphs (¶8, ¶9, ¶13) are rendered in full. |
| 221 | Fixed | See Fix B. Rest of this 89-paragraph chapter read in full — the battery scenes, the young officer, the ammunition-wagon explosion — and is faithful. "Shako" → "cap" throughout (see D4). |
| 223 | Minor (D2) | Historiographic account of the main action. Davout-reported-killed / actually-alive detail preserved. ¶11 drops one clause: source says the movements "did not improve or alter the position of the troops" *and* did little harm; only the second claim survives. |
| 224 | **Defect (D0)** | See §4. Otherwise accurate, including "At eight hundred leagues from France, I will not have my Guard destroyed." |
| 225 | Minor (D3) | Wolzogen confrontation, Raevsky, the order to attack. The "spirit of the army" passage and the false-but-effective rumor mechanism are intact. |
| 226 | Sound | The regiment under bombardment; the trace horse, the little dog, "It's shameful, sir!", the wound to the right side of the abdomen. All present. |
| 227 | Sound | Dressing station, the amputations, recognition of Anatole, the realization about love. ¶4's French "chair à canon" is rendered as "cannon fodder" (consistent with the batch's de-jargoning policy). |
| 228 | Sound | Every figure in the St. Helena passage checked: 400,000 across the Vistula, one-third composition, ~140,000 French-speakers, <50,000 French losses, 100,000 Russian dead, 50,000 at Vilna, <18,000 at Kalisch. All correct. |
| 229 | Minor (D2) | Aftermath and "moral victory" analysis. ONE HALF / HALF capitalization preserved. ¶5 drops "all the Russian troops had been broken up" while keeping the parallel clause. |
| 230 | Sound | Achilles-and-the-tortoise / calculus-of-history chapter. Checked for softened or inverted philosophical claims — none. The clock, locomotive, and oak-bud examples all keep their logical force. |
| 232 | Minor (D7) | Poklonny Hill council. Kutuzov's internal anguish and Bennigsen's motives preserved. |
| 233 | Sound | Council of Fili, Malasha's-eye view, the Friedland rebuttal, "I order a retreat," "They shall eat horseflesh yet, like the Turks!" All figures, quotes, and seating positions match. ¶1 drops "arms folded on his stomach" → "folded arms" (trivial). |

---

## 4. Additional defects found (not in the drafter's notes)

### D0 — 224 ¶25 — garbled inversion — **MODERATE** (recommend fixing)

- Source: *"…M. de Beausset ventured with respectful jocularity to remark that
  there is no reason for not having lunch **when one can get it**."*
- Candidate: *"…Monsieur de Beausset respectfully and playfully observed that
  there was no reason to skip a meal **just because one couldn't get one**."*

The candidate is self-contradictory — "no reason to skip a meal because one
couldn't get one" is not a sentence that means anything. The source's joke is
the opposite and perfectly clear: lunch is available, so there is no reason not
to eat it. This is the only genuine semantic break I found that the drafting
pass missed, and it is reader-visible as nonsense.

Suggested: *"…observed that there was no reason to skip lunch when one could
have it."*

### D1 — 215 ¶30 and ¶32 — German dialogue translated inline, leaving the footnotes as duplicates — **LOW–MODERATE**

The source has Wolzogen and Clausewitz speaking German, with Tolstoy's asterisked
footnote translations in the following paragraphs (¶31, ¶33). The candidate
translates the German *into English in the dialogue itself* but **keeps the
footnote paragraphs**, so the reader now gets:

> "The war must be extended across a wide area. I cannot praise that view highly enough," said one of them.
> \* "The war must be extended widely. I cannot sufficiently commend that view."

— the same sentence twice, the second one footnoted as though it were a
translation of something. Same pattern at ¶32/¶33.

Two secondary costs: the dramatic point of the scene is that these are *Germans
speaking German* (Prince Andrew's tirade in ¶35 turns on it), and ¶35's
"Extend widely!" now echoes a line the reader already read in English.

Either restore the German in ¶30/¶32, or drop the now-redundant footnote
paragraphs — but dropping them breaks the paragraph-count invariant, so
restoring the German is the correct fix.

### D2 — dropped clauses in two long analytical paragraphs — **LOW**

- `223 ¶11`: source makes two claims — the forward/backward movements "did not
  improve or alter the position of the troops," *and* the men's rushing at each
  other "did little harm." The candidate collapses to the second only.
- `229 ¶5`: source gives two reasons the Russians could not make the final
  effort — "all the Russian troops had been broken up" and "there was no part of
  the Russian army that had not suffered." The candidate keeps only the second.

Both are argument-thinning rather than inversions.

### D3 — "Campan" vs. "Compans" — same general, two names in one batch — **LOW–MODERATE**

The source uses "Campan" 8 times. The candidate renders 6 as "Campan"
(217 ¶2, ¶7, ¶14, ¶24 ×2) and 2 as "Compans" (223 ¶2, ¶10). "Compans" is the
historically correct spelling, so the emendation is defensible — but it was
applied to only a quarter of the occurrences, so the reader meets two different
names for the same divisional commander within a dozen chapters. Pick one and
apply it to all 8.

(By contrast, the `Gibrard` → `Gerard` change in 217 ¶17 is benign: Maude itself
writes "Gérard" three paragraphs later, so this normalizes Maude's own
inconsistency rather than creating one. Likewise `Kaysárov` → `Kaisarov` and
`Scherbínin` → `Shcherbinin` are applied consistently throughout.)

### D4 — "flèches" rendered inconsistently, and colliding with "fortification" — **LOW**

The source uses "flèches" 20 times (with an explanatory footnote at 213 ¶2:
"A kind of entrenchment") and "fortification" 3 times, as distinct terms. The
candidate keeps "fleches" in 213 and 217 — including the footnote defining it —
then switches to "fortifications" from 221 onward (221 ¶49, 223 ¶0/¶3/¶4/¶8/¶10,
224 ¶32, 225 ¶3/¶10). A reader taught the word "fleches" in chapter 213 loses it
in chapter 221, and the substitute collides with the source's own separate use of
"fortification" in the battle orders (217 ¶14, "seize the first fortification").

Same category, lower stakes: "shako" is rendered "cap" at all 3 occurrences
(221 ¶18, ¶70; 226 ¶2) — consistent, so acceptable, but it flattens a period
detail.

### D5 — 217 ¶18 — dropped quotation — **LOW**

Source: *"All this must be done in good order **(le tout se fera avec ordre et
méthode)** as far as possible retaining troops in reserve."* The French
parenthetical — a direct quotation from Napoleon's disposition, and part of why
Tolstoy is quoting the document at all — is dropped. Under the project's
"preserve quotations" rule this should be restored.

### D6 — 217 ¶22 — dropped clause — **LOW**

Source: *"…with the guns of Pernetti and Fouché; **which were to come in line
with them**, 102 guns in all…"* The candidate gives "together with Pernetti's and
Fouche's guns (102 in all)" and loses the instruction that those guns were to
come into line. Small, but it is part of an order whose unworkability is the
paragraph's whole point.

### D7 — 232 ¶3 — broken enumeration — **LOW**

The source enumerates the knots of officers: "a fourth group… A fifth group… A
sixth group." The candidate renders the fourth as "another group" but keeps
"A fifth group" and "A sixth group," so the count no longer has a fourth.
Restore "a fourth group."

---

## 5. Things checked and found clean

- **Numerals:** every digit and spelled-out figure in 217 (gun counts), 228
  (St. Helena memoir), and 229 (half-army losses) verified against the source.
  No dropped, added, or altered numbers anywhere in the batch.
- **Directional inversions:** all left/right/front/rear/near/off/above/below
  deltas across all 594 paragraph pairs were inspected by hand. The only genuine
  reversal was 221 ¶23, already fixed. The rest are rephrasings (e.g. "guns of
  the right wing" → "guns on the right wing").
- **Negation inversions:** all paragraphs with a negation-count delta ≥2 were
  read in full. No inverted claims; the deltas are contraction and rephrasing
  artifacts.
- **Character names:** normalization (Andrew, Kutuzov, Mary, no accents) is
  applied consistently; no name is dropped or swapped between characters.
- **Paragraph alignment:** paragraph N begins with content equivalent to source
  paragraph N in all 594 pairs. No merges, splits, drops, or inventions.
- **Preserved source oddities:** the 24th/26th August date inconsistency (218),
  the sentence fragment at 221 ¶70 ("Pierre standing beside the commanding
  officer," repaired to a full sentence — acceptable), and the ONE HALF / HALF
  capitalization (229) are all handled correctly.

---

## 6. Verdict

**The diff is exactly as claimed, and both applied fixes are correct and
correctly targeted.** The drafting pass's two findings are genuine, its
paragraph-count table is accurate, and its two corrections are the right
corrections.

**However, "18/20 sound" is overstated.** An independent read turns up one
additional moderate defect the pass missed (D0, 224 ¶25 — a garbled sentence
that reads as nonsense), one reader-visible structural defect (D1, 215 ¶30/¶32 —
duplicated footnote translations), and five low-severity issues (D2–D7:
dropped clauses, a dropped French quotation, split naming of General
Campan/Compans, inconsistent handling of "flèches," and a broken enumeration).

Recommendation: **do not ship as-is.** Apply D0 and D1 before acceptance; D3
(pick one spelling for Campan/Compans) and D5 (restore the French quotation) are
cheap and worth doing in the same pass. D2, D4, D6, D7 can be batched into a
later consistency sweep if time is short, but D4 in particular will read as an
inconsistency to anyone reading these chapters in sequence.

Revised count: **16/20 clean, 2 fixed correctly, 2 chapters (215, 224) still
carrying defects**, plus cross-chapter consistency issues in 217/221/223/225/232.
