Model: opus

# Verification — ch355 (Second Epilogue, Chapter 2)

Independent verification. I did not draft, review or correct this chapter. All
diffs were computed directly from the JSON files with Python; the corrections
log was read only afterwards, to be checked against the computed diff.

Files verified:
- source: `ch355-source.json`
- pre-correction: `ch355-candidate-A.json`
- corrected: `ch355-corrected.json`
- log: `ch355-corrections-log.md`

## 1. Diff vs. log

Computed diff (paragraph indices are 0-based, matching the log's `¶N` headings):

| ¶ | changed | logged |
|---|---------|--------|
| 0 | no | — |
| 1 | yes | yes |
| 2 | yes | yes |
| 3 | yes | yes |
| 4 | yes | yes |
| 5 | yes | yes |
| 6 | yes | yes |
| 7 | yes | yes |
| 8 | yes | yes |
| 9 | yes | yes |
| 10 | yes | yes |
| 11 | yes | yes |
| 12 | yes | yes |

12 paragraphs changed, 12 log entries. **One-to-one at paragraph granularity — no
mismatch.** Two sub-paragraph hygiene notes, neither blocking:

- ¶6 also drops the serial comma in "Chateaubriand, and others" → "Chateaubriand
  and others". Real, unlogged, meaning-neutral. Source has the comma; restoring
  it would be closer.
- The ¶11 "After" quotation in the log is not byte-exact: it still shows
  `ideas — these` where the file has `ideas—these`. The log's parenthetical
  acknowledges the conversion, so this is transcription sloppiness in the log,
  not an unlogged edit.

## 2. Per-change verdicts (re-derived from source, not from the log)

| ¶ | change | verdict |
|---|--------|---------|
| 1 | "flatly"→"quite"; drop "entirely"; drop "at all" | **Correct.** Source: "in quite contradictory ways", "some other person", "furnish no reply". All three removals restore the source. |
| 2 | drop "at once"; drop "really" | **Correct.** Source: "deal with all the nations", "how erroneous is … view". |
| 3 | "flatly"→"plainly"; drop "all by itself"; dashes | **Correct with a reservation.** "plainly say" is the source word. But the source reads "then his power *is itself* a force producing events"; "all by itself" was carrying that "itself", and the corrected "turns into a force producing events" drops it. "turns into" plus the preceding "in its own right" keeps the contradiction legible, so this is acceptable — but it is a removal of source emphasis, not of added emphasis, and the log's rationale ("added emphasis, not in source") is wrong. |
| 4 | drop "just" | **Correct.** Source: "a chain of such contradictions". |
| 5 | em dashes only | **Correct.** `draft.md` line 25 mandates unspaced em dashes. No wording change. |
| 6 | collective gloss; drop "once more", "very", "just"; dashes | **Not correct — see finding V-1.** "very" and "just" are rightly removed (source: "the force he had denied"). "once more" is **not** an added intensifier: the source reads "the historian is **again** obliged to fall back on power". Its removal deletes a source word. |
| 7 | drop "just" | **Correct.** Source: "And in the same way". |
| 8 | em dashes only | **Correct.** |
| 9 | "entirely"→"quite"; drop "at all"; "is contradicted by"→"This view is not confirmed by" | **Correct and complete.** Source: "quite consistent", "any connection", "for that view is not confirmed by". The MODERATE finding is fully answered — the corrector also restored the source's "that view" as the subject rather than leaving a bare "This", so the negation now attaches to the historians' claim, not to the preceding sentence. Best change in the set. |
| 10 | Rousseau gloss; dashes | **Correct** — see gloss ruling below. |
| 11 | drop "in particular"; drop "whatsoever"; restore "and which" | **Correct and complete.** Source: "But why intellectual activity is considered…", "into any theory", and "…a still less definite meaning, **and which** can therefore be readily introduced". Restoring "and" re-opens the antecedent as the log describes; both numbered considerations survive intact. |
| 12 | drop "actually"; dashes | **Correct.** Source: "does not account for what happens in history". |

## 3. Ruling on the two added glosses

**¶6 — "the activity of the statesmen and writers Stein, Metternich, Madame de
Staël, Talleyrand, Fichte, Chateaubriand and others."**

Fact only; no claim added. The six named people were in fact statesmen (Stein,
Metternich, Talleyrand), writers (de Staël, Chateaubriand — Chateaubriand both)
and a philosopher-writer (Fichte), so the collective tag is true of the list as
a whole and "writers" covers Fichte without strain. Crucially it is *categorial,
not causal*: it says who these people were, and says nothing about whether or
how they produced the event. Tolstoy's argument in this paragraph is arithmetic
— that the components summed do not equal the resultant — and the tag neither
inflates nor deflates any component. It also does not pre-empt the sting of the
following paragraph ("writers and ladies as forces producing events"), because
it withholds any suggestion of influence. **Passes.**

**¶10 — "how a book, Rousseau's Le Contrat Social (The Social Contract), had the
effect of…"**

Fact only; no claim added. Rousseau's authorship (1762) and the standard English
title are both uncontested matters of record, and the gloss is bare — no date, no
characterization of the book, no account of what it argued. The argumentative
work of the sentence is done by "cannot be understood without an explanation of
the causal chain", which is untouched. Naming the author does not strengthen the
book's candidacy as a cause; Tolstoy has already named the book, and the reader
who knows the author is no more persuaded that it drowned anyone. **Passes.**

Both glosses stay inside the "identify, do not interpret" line. Neither adds a
proposition Tolstoy would have to defend.

## 4. Content integrity after correction

Checked programmatically against source, whole chapter:

- **Named historians and figures — all present at identical counts:** Thiers (1),
  Lanfrey (1), Gervinus (2), Schlosser (1), Napoleon (11), Alexander (5),
  Stein (1), Metternich (1), Madame de Staël (3), Talleyrand (3), Fichte (1),
  Chateaubriand (4), Bourbons (3), Bonapartist (1), Republican (1),
  Le Contrat Social (1). Rousseau is the only proper noun added (gloss, ruled
  above). Nothing dropped.
- **Examples intact:** Thiers/virtue-and-genius vs. Lanfrey/trickery; the
  Gervinus decomposition of Alexander's power; the A-vs-thousand-times-A
  arithmetic; the peasants and the wind; the cruel murders of the French
  Revolution from the doctrine of equality; the cruel wars and executions from
  the preaching of love; Le Contrat Social and the drownings; the campaign of
  1812 as the case the culture-historians cannot narrate without power.
- **Dates intact:** 1813 (2), 1812 (2), 1789 (2).
- **Both numbered considerations intact:** "(1)" and "(2)" each present once,
  with their full content — learned men writing history / traders, agriculturists
  and soldiers; and the vague-conceptions argument with the restored "and which".
- **Negations and conditionals intact:** "not an accident", "do not treat it as",
  "can no longer … be treated", "never observe this condition", "does not add up
  to the resultant", "does not account for the submission of millions", "if
  historical events can be explained … why not explain them", "only with a
  considerable stretch", "one can never admit", "is not confirmed by", "cannot be
  understood without", "still goes unanswered", "If they do not say so", "do not
  write history", "does not account for", "a power they apparently do not
  recognize". No polarity flips. ¶9 moves in the right direction (from a stronger
  negation to the source's weaker one).
- **Hedges intact:** "it would seem", "in effect", "apparently", "perhaps",
  "involuntarily", "unwittingly".

## 5. Structure

- Paragraph count 13 → 13; source 13. Order unchanged.
- `number` 355 and `title` "Second Epilogue — Chapter 2" identical across all three files.
- No empty or whitespace-only paragraphs.
- Question-mark parity with source in every paragraph (¶0: 1/1, ¶9: 1/1, all
  others 0). Exclamation marks: 0 in source, 0 in corrected.
- Em dashes: 0 spaced, 20 unspaced. Conforms to `draft.md`.
- JSON valid.

## 6. New findings

**V-1 (blocking) — ¶6: the correction deleted a source word.**

Source: "…the historian is **again** obliged to fall back on power—the force he
had denied—and to recognize it as the resultant of the forces…"

Candidate A: "…the historian is forced to fall back **once more** on power. This
is the **very** force he had **just** denied…"

Corrected: "…the historian is forced to fall back on power. This is the force he
had denied…"

"very" and "just" were added emphasis and are rightly gone. "once more" was not
— it rendered the source's "again", and it is now lost. The word matters to the
argument: Tolstoy's point is that the universal historian, having *just*
dismissed power, is driven back to the very thing he dismissed — the recurrence
is the contradiction. Without "again" the sentence reports a move rather than a
relapse.

The A-fidelity review is the proximate cause: its ¶6 row quotes the source as "to
fall back on power—the force he had denied—", silently eliding "again", so the
corrector had no way to see the word in the review and appears to have taken
"once more" as one more item on the intensifier list. The log then records it as
"none in source", which is false and would have passed unchallenged without a
source-anchored re-derivation.

Fix is one word and local, e.g. "…the historian is forced **once again** to fall
back on power." No other part of the paragraph needs touching.

**V-2 (non-blocking) — ¶3: "all by itself" removal.** Same class as V-1, milder.
It rendered the source's "his power **is itself** a force producing events". The
corrected text still carries the transformation via "turns into" and the earlier
"in its own right", so meaning survives; but if ¶6 is reopened, consider whether
"his power is itself a force producing events" is the better line here. The log's
stated rationale for this removal is wrong either way.

**V-3 (non-blocking) — ¶6 serial comma** before "and others", dropped and
unlogged. Restore for source fidelity.

**V-4 (non-blocking) — log hygiene.** The ¶11 "After" excerpt is not byte-exact
(spaced em dash). The log headings are 0-based while the finding references
inside them are the reviews' 1-based numbering ("accessibility hard (¶7…)" for
the paragraph logged as ¶6); harmless here but an easy source of confusion on a
longer chapter.

## 7. Verdict

Eleven of the twelve changes are right, source-anchored and complete, the two
MODERATE fidelity findings are properly discharged (¶9 is exemplary), both glosses
are clean factual identifications that add nothing to Tolstoy's argument, and no
named historian, example, numbered consideration, negation or conditional was
lost. Structure is sound.

But the correction pass introduced one new omission of a source word in ¶6
(V-1), mislogged as the removal of an added intensifier. Per the protocol, a
correction that introduces new drift cannot be accepted on the verifier's
signature, however small the fix. One more round, scoped to V-1 (and V-2/V-3 if
the corrector agrees), then re-verify.

sha256: 166550adf3c9fcd271f8d19bcb84573b9c11251798fabb81147630d9973e40b5

Verification: ANOTHER ROUND
