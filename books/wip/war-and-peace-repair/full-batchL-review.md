# Batch L — Independent Fidelity Review

Reviewer: independent pass (adversarial), run against the Maude source with no reliance
on the drafter's notes except to verify the claims they make.

Files reviewed:

- Source: `full-batchL-source.json`
- Corrected: `full-batchL-corrected.json`
- Current (pre-fix): `full-batchL-current-modern-en.json`
- Drafter's notes: `full-batchL-notes.md`

Chapters in batch (20): 260, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273,
274, 275, 276, 277, 278, 279, 282.

**Verdict: PASS WITH CORRECTIONS REQUIRED.** The two fixes that were actually applied are
correct and well-judged. One claimed fix was never applied. Three further genuine defects
were found in chapters the drafter marked "sound."

---

## 1. Confirmed diff (corrected vs. current)

Chapter order, chapter numbers, titles and paragraph counts are byte-for-byte identical
between the two files. Exactly **two** paragraphs differ:

| Chapter | Para | Current | Corrected |
|---|---|---|---|
| 264 | 18 | "…looked at him, **not understanding** what he meant." | "…looked at him, **understanding** what he meant." |
| 279 | 45 | "**Little Nikolai** cried…" | "**Little Nicholas** cried…" |

Nothing else changed. File size delta (−3 bytes) is exactly accounted for by these two
edits (−4 for `not `, +1 for `Nicholas` vs `Nikolai`).

### DISCREPANCY WITH THE NOTES

`full-batchL-notes.md` claims **three** chapters were fixed. The ch275 fix
("daughter of a bitch") is **claimed but not present in the corrected file.**

```
SRC 275:51  …you daughter of a bitch!” said Karatáev…
CUR 275:51  …you daughter of a..." said Karataev…
COR 275:51  …you daughter of a..." said Karataev…   <-- unchanged
```

The notes assert "**Fix applied:** restored 'daughter of a bitch!' to match the source's
Maude wording." That is not true of the artifact. Either the edit was lost before the file
was written, or the note was written from intent rather than from the file. This is a
process defect as much as a text defect: the notes cannot be trusted as a record of what
the corrected file contains.

---

## 2. Verification of each claimed fix against source

### ch264 para 18 — meaning inversion — **FIX CORRECT, CONFIRMED**

Source reads: *"Everybody looked at him, **understanding** what he meant."* The drafter's
irony reading is right, and the surrounding text confirms it independently of any
interpretive judgement. The next two sentences are:

> "Prince Hippolyte himself glanced around with amused surprise. He knew no more than the
> others what his words meant."

Tolstoy's joke is that the salon *performed* comprehension of a remark that was empty —
including for its own author. The pre-fix reading ("not understanding") destroys the joke
twice over: it makes the following sentence redundant (if nobody understood, "he knew no
more than the others" is not a reversal but a restatement), and it removes the target of
the satire, which is the salon's reflexive appreciation of nonsense as wit. The passage
then continues to the awkward silence and Anna Pavlovna "shaking a finger at Hippolyte" —
a gesture of amused complicity that only makes sense if the room had just credited him
with a witticism. The fix restores the source wording exactly. **Correct.**

### ch275 para 51 — censored Karataev line — **FIX NOT APPLIED**

Source (Maude, unbowdlerized):

> "Eh, the rascal! Now you've curled up and got warm, you **daughter of a bitch**!" said
> Karatáev, touching the dog that lay at his feet…

Current and corrected both read "you daughter of a**...**". This is a silent content
omission, not a paraphrase: it removes a word Tolstoy wrote and Maude translated, and it
replaces it with an ellipsis that reads on the page as the narrator declining to print
the word. The line matters — the coarse endearment to the dog is one of the small
touches that keeps Karataev from being sanctimonious in the chapter that introduces him.
**This fix must still be applied.**

### ch279 para 45 — name inconsistency — **FIX CORRECT, CONFIRMED**

Source reads "Little **Nicholas** cried…". The chapter and the surrounding chapters
otherwise use "Nicholas" for Prince Andrew's son throughout (278:9, 278:28, 278:31,
278:34, 279:40, 277:1, 277:15). Book-wide the normalized edition has `Nicholas` ×621 and
`Nikolai` ×0, so the pre-fix "Nikolai" was a unique outlier. **Correct**, and correctly
grounded in both the source and the project's own naming convention.

---

## 3. Independent findings — all 20 chapters

I read every paragraph of all twenty chapters against the source, including the seventeen
marked "sound." Summary: the modernization is of consistently high quality. Paragraph
alignment is exact everywhere (counts verified independently). No summarizing, no dropped
sentences, no reordering, no invented content of substance. Dialogue, proper nouns,
numbers, dates, military and topographic detail all check out. Tolstoy's argumentative
essays (267, 272:4, 282) survive intact, including the difficult abstractions.

Three genuine defects were found that the drafter did not report. All three are of the
same *class* the drafter was already looking for (internal inconsistency, silent content
loss), which makes the misses notable.

### NEW DEFECT L-A — Orphaned/duplicated footnote paragraphs (7 instances, 5 chapters) — MEDIUM

In the Maude source, a passage of French in the body is followed by a separate
translator's-footnote paragraph carrying the English. The modernization translated the
French **inline in the body paragraph** but left the footnote paragraph untouched. The
reader therefore sees the same English sentence twice in a row, the second time prefixed
with a stray asterisk.

| Chapter | Body para | Orphan footnote para |
|---|---|---|
| 262 | 21 `"You can't pass!" cried a voice.` | 22 `* "You can't pass!"` |
| 263 | 19 `"Look here, no nonsense!" he cried.` | 20 `* "Look here, no nonsense!"` |
| 266 | 0 (…"though a foreigner, Russian in heart and soul.") | 1 `* Though a foreigner, Russian in heart and soul.` |
| 266 | 2 (…"our most gracious sovereign"…"whose flames illumined his route.") | 3, 4 (both footnotes) |
| 277 | 17 `"My child!" she murmured, "I love you and have known you a long time."` | 18 `* "My child! I love you and have known you a long time."` |
| 278 | 12 `"Thank you for coming, my dear."` | 13 `* "Thank you for coming, my dear."` |

The 277 and 278 cases are the worst: an identical sentence repeated verbatim on
consecutive lines, in the arrival scene and in Prince Andrew's deathbed scene
respectively. 278:12–13 sits four paragraphs before the Gospel passage — a bad place for a
visible formatting artifact.

Note this is a book-wide pattern, not a batch-L invention: across the whole normalized
`modern-en` there are 70 footnote paragraphs, of which **21 are now redundant** because
their body paragraph was translated inline. Batch L contributes 7 of the 21.

**Recommended fix (preserves alignment, higher fidelity):** keep Tolstoy's French in the
body paragraph and let the footnote paragraph do its job. The code-switching is
characterization — the countess greeting Princess Mary in French, Prince Andrew thanking
his sister in French while already estranged from the living, the French sentry's
`"On ne passe pas!"` — and flattening it to English loses something the footnote was
there to protect. Failing that, the footnote paragraph must be re-purposed rather than
left as a duplicate; deleting it is not an option, since paragraph counts are load-bearing
for the split-pane alignment.

### NEW DEFECT L-B — "Michael" / "Mikhail" inconsistency within the batch — LOW/MEDIUM

The source spells the name **Michael** in all five occurrences in this batch. The
candidate renders it inconsistently:

| Chapter | Para | Source | Candidate |
|---|---|---|---|
| 265 | 13 | Prince **Michael** Ilarionovich! | Prince **Michael** Ilarionovich! |
| 275 | 43 | **Michael** the youngest (×3) | **Mikhail** (×3) |
| 282 | 3 | Prince **Michael** Ilarionovich! | Prince **Mikhail** Ilarionovich! |

265:13 and 282:3 are **the same formula** — the Emperor's salutation opening a rebuking
letter to Kutuzov — rendered two different ways seventeen chapters apart. This is exactly
the defect class the drafter fixed in ch279 (Nikolai→Nicholas), applied to the identical
kind of evidence, and it was missed. Book-wide the split is Michael ×27 / Mikhail ×24,
so a batch-local fix will not resolve it; but at minimum the two Kutuzov salutations
should agree, and the batch should be internally consistent.

Recommendation: normalize batch L to **Michael** (matches the source, matches 265:13,
matches the Nicholas/Mary anglicizing convention the edition already follows), and log the
book-wide Michael/Mikhail split as a separate cleanup item.

### NEW DEFECT L-C — Chapters 279 and 282 use single quotation marks throughout — MEDIUM

Every other chapter in the batch punctuates speech and quoted matter with double quotes.
Chapters 279 and 282 contain **zero** double quotes; all dialogue, interior monologue and
the Emperor's letter are set in single quotes.

```
260 dq=40   …  277 dq=60   278 dq=61
279 dq=0  (20 single-quoted openings)
282 dq=0  (3 single-quoted openings)
```

This is the chapter in which Prince Andrew dies. Natasha's "I'm sure of it, sure!", Prince
Andrew's "Love holds death back. Love is life…", Princess Mary's "Is it over?", and
"Where has he gone? Where is he now?..." all render in a different typographic register
from the rest of the book — visibly so on a paginated multi-column page and in split-pane
against `original-en`, which uses curly doubles. There is no source warrant: Maude uses
double quotes in these chapters exactly as elsewhere.

Book-wide this affects 40 of 365 chapters (a contiguous tail: 279–301, 307–310, 315, 331,
340, 359–364, plus stragglers at 42, 209, 217, 223, 231), which suggests a generation-run
boundary rather than a deliberate choice. Batch L contributes 279 and 282.

Recommendation: convert 279 and 282 to double quotes as part of this batch, and open a
book-wide normalization item for the other 38 chapters. Care needed on nested quotation
(279:29 contains no nesting; 282:3 is a letter-block and could reasonably be set without
outer quotes at all, as Maude does — see 265:11 and 265:13, which the candidate correctly
leaves unquoted).

---

## 4. Chapter-by-chapter notes

Ratings: **SOUND** = no defect. **SOUND***= no meaning defect, but carries one of the
batch-level defects above.

| Ch | Content | Finding |
|---|---|---|
| 260 | Natasha's vigil; the family beds down; she goes to Prince Andrew | SOUND. See close-read below. |
| 262 | Pierre's morning; the assassination plan; rescuing the child | SOUND* (L-A: orphan footnote 22) |
| 263 | Returning the child; the Armenian family; Pierre's arrest | SOUND* (L-A: orphan footnote 20) |
| 264 | Anna Pavlovna's soiree; Helene's illness; the Bishop's letter | Fixed (irony inversion). Residual trivia: 264:1 drops "service interests" from "court interests and service interests and intrigues." |
| 265 | Borodino news reaches Petersburg; Helene's death; Rostopchin | SOUND. Note 265:13 renders "Prince Michael Ilarionovich" — see L-B. |
| 266 | Michaud reports the fall of Moscow to Alexander | SOUND* (L-A: three orphan footnotes, 1/3/4) |
| 267 | Private vs. public interest in wartime; Nicholas to Voronezh | SOUND. Trivia: 267:18 "cordially though with dignity and restraint" → "with gracious dignity and restraint" loses the concessive. |
| 268 | The governor's party; the matchmaking; Nicholas on Sonya | SOUND. Trivia: 268:32 drops "I will tell you the truth." |
| 269 | Princess Mary's inner conflict; first meeting with Nicholas | SOUND |
| 270 | The thanksgiving service; Sonya's releasing letter | SOUND |
| 271 | Background to Sonya's letter; the mirror prophecy | SOUND. 271:4 "within the prohibited degrees of affinity" → "too closely connected by family ties" — acceptable, loses canon-law precision. |
| 272 | Pierre in custody; the first interrogation | SOUND |
| 273 | Ruined Moscow; Davout; "It was a system" | SOUND. See close-read below. |
| 274 | The execution of the five | SOUND. See close-read below. |
| 275 | The shed; Platon Karataev's introduction | **DEFECTIVE — claimed fix not applied** (275:51). Also L-B (Mikhail ×3). Trivia: 275:30 "maggot" → "worm"; 275:43 "that's not well—that's not right" → "that's not right, this isn't fair" (mild invention); "dragnet" → "net". |
| 276 | Karataev described — roundness, speech, proverbs | SOUND |
| 277 | Princess Mary's journey; arrival at the Rostovs'; Natasha | SOUND* (L-A: duplicated line 17/18) |
| 278 | Princess Mary at the bedside; Prince Andrew's estrangement | SOUND* (L-A: duplicated line 12/13). See close-read below. |
| 279 | Prince Andrew's death | Fixed (Nicholas). Plus **L-C** (single quotes throughout). See close-read below. |
| 282 | Staff reorganization; the Emperor's letter; the Cossack's hare | **L-B** (Mikhail) + **L-C** (single quotes). |

Paragraph counts independently re-verified: all 20 chapters match source exactly
(37/43/38/27/14/32/22/40/16/28/31/10/31/19/53/12/49/45/47/9). Both JSON files parse clean.
One paragraph in the batch has an odd double-quote count (278:40) — this is correct, and
matches Maude: Prince Andrew's interior monologue opens a quotation that continues into
278:41.

---

## 5. Close-reads of the high-stakes passages

### Prince Andrew's death (278–279)

I gave this the heaviest scrutiny in the batch. The theological and psychological spine
survives intact, which is what matters most:

- **278:4** — "Because you are alive and thinking of the living, while I…" — the accusation
  in the look is preserved exactly, including the broken-off sentence.
- **278:14** — the key diagnostic sentence ("he failed to understand not because he lacked
  the ability, but because he understood something else — something the living did not and
  could not understand") is rendered faithfully and does not soften "terrible in one who is
  alive."
- **278:29** — the "quiet, gentle irony" at the mention of his son, and Princess Mary's
  horror at recognizing it, are preserved.
- **278:41** — "The birds of the air neither sow nor reap, yet your Father feeds them" —
  modernized from Maude's "fowls of the air sow not, neither do they reap," retaining
  Tolstoy's paraphrase of Matthew 6:26 and the unresolved "We cannot understand one
  another." The open-quote continuation into the next paragraph is correctly kept.
- **279:29–33** — the central passage ("Love is God, and to die means that I, a particle of
  love, will return to the universal, eternal source"), its immediate undercutting
  ("But they were only thoughts. Something was missing"), the door-dream, and the waking
  ("Yes, death is an awakening!") are all rendered without loss. "brain-spun" becomes
  "too cerebral," which is the right register and does not lose the sense.
- **279:38** — the crucial distinction that the two women were no longer tending *him* but
  *his body* is preserved, as is "they didn't feel the need to feed their grief."
- **279:41–46** — the death itself, Natasha closing the eyes without kissing them, and the
  four-way accounting of who wept and why, are all exact. This is where the Nikolai/Nicholas
  fix lands, and it was the right call: 279:40 six paragraphs earlier already says
  "Nicholas."

Residual trivia only: 279:2 drops "fallow" from "the fallow field"; 279:40 renders "he
pressed his lips to the boy's" as "to the boy's face," a small specification the source
leaves elliptical. Neither is worth an edit.

The one real problem in this chapter is typographic, not semantic: **L-C**. Having the
death scene punctuated differently from the rest of the novel is a visible quality defect
in the single most-quoted chapter of the book.

### Pierre's arrest and near-execution (263, 272–274)

- **263:12–21** — the Armenian girl, the marauder in the frieze gown, and Pierre's rage are
  complete; "frieze" is modernized to "rough cloth" consistently within the chapter, which
  is fine.
- **272:4** — the long analysis of the trial ("a channel through which the judges wished the
  answers to flow… As soon as Pierre began to say anything that didn't fit that aim, the
  channel was removed and the water flowed to waste") is preserved argument-for-argument,
  including every one of the six interrogation exchanges.
- **273:17–18** — the look that saves Pierre, "they were both children of humanity and were
  brothers," and Davout's shift from seeing "a case" to seeing "a human being," are exact.
  Note "Pierre was merely a circumstance" → "merely a case": a defensible modernization
  that keeps the bureaucratic sense.
- **273:28–30** — "And Pierre felt that it was no one. / It was a system — a convergence of
  circumstances. / A system of some sort was killing him." Faithful; "concurrence" →
  "convergence" is acceptable.
- **274 entire** — the execution reads correctly throughout: the pairing order, the sacks,
  the factory boy adjusting the blindfold knot himself and then leaning back "more
  comfortably," the shoulder rising and falling under the spadefuls of earth, the young
  sharpshooter swaying by the pit, and "That will teach them to start fires." The pivotal
  sentence — "They could not believe it because they alone knew what their lives meant to
  them" — is intact. 274:13 ("They all plainly and unmistakably knew that they were
  criminals who must hide the traces of their guilt") is preserved, which is the moral
  hinge of the chapter.
  One trivial inconsistency: 274:0 keeps "shakos," 274:16 renders the same word "cap."

### Natasha's vigil (260)

Faithful throughout, including the small physical beats that carry the chapter: the
adjutant's moaning three houses away, Natasha's bare foot going cold outside the quilt,
the cricket "as if to celebrate a victory over everybody," the run "like a kitten" to the
door, and the mistaking of his raised knees for shoulders. The closing image — the neck
"delicate as a child's" giving him "a peculiarly innocent, childlike look, such as she had
never seen on him before" — is exact. "Chemise" → "nightdress" is appropriate.

### Platon Karataev's introduction (275–276)

276 is faithful in full, including the roundness motif, "Lay me down as a stone and raise
me up as a loaf," the singing "like the birds," and the closing formulation that his life
"had meaning only as part of a whole of which he was always conscious." The only defects
in this pair are 275:51 (unapplied fix) and the Mikhail spelling.

---

## 6. Final verdict

**PASS WITH CORRECTIONS REQUIRED.** Batch L is not clean and should not be accepted as-is.

Blocking before accept:

1. **Apply the ch275:51 fix that the notes claim was already made** — restore
   "you daughter of a bitch!". (Claimed fix, not present in the artifact.)
2. **Fix the seven orphaned footnote paragraphs** (L-A) in 262, 263, 266 ×3, 277, 278 —
   preferably by restoring the French to the body paragraph so the footnote reads correctly.
3. **Normalize Michael/Mikhail within the batch** (L-B): 275:43 ×3 and 282:3 → "Michael",
   matching the source and 265:13.
4. **Convert chapters 279 and 282 to double quotation marks** (L-C).

Already correct, no further action:

- ch264:18 irony inversion — verified against source and against the surrounding logic.
- ch279:45 Nicholas — verified against source and against the chapter's own usage.

Recommended follow-up items outside this batch (book-wide, out of scope here but worth
logging): 21 redundant footnote paragraphs across the whole edition; the Michael/Mikhail
27/24 split; and 40 chapters set in single quotation marks (a contiguous tail beginning at
279, which suggests the generation run changed convention mid-book).

Notes-vs-artifact reliability: the ch275 claim was false. Future batches should be
validated by diffing the corrected file rather than by reading the notes.
