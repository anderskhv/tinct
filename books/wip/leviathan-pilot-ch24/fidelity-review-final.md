# Fidelity Review — FINAL (full, non-sampled) — Leviathan, edition ch. 24 (Hobbes ch. 23), "Of the Public Ministers of Sovereign Power"

Reviewer: independent fidelity reviewer (final pass), per
`books/prompts/fidelity-review-prompt.md`.

- **Fidelity anchor (sole):** `books/wip/leviathan-pilot-ch24/source.json` (13 paragraphs)
- **Candidate:** `books/wip/leviathan-pilot-ch24/candidate-sonnet.json` (current file, post D7-restore)
- **Read first for context:** `fidelity-review-3.md` (defects D7–D11; N1–N7 status)
- **Not consulted as anchors:** accessibility review, drafter's notes, `leviathan-modern-en.json`, any other translation.

Paragraph indices are **0-based**.

## Coverage — exact

- **All 13 paragraphs read individually and in full, source against candidate, sentence by sentence.** Indices 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 — no sampling, no index skipped, no paragraph certified by inheritance from an earlier review. Indices 4, 5 and 10 (untouched in round 3 and *not* re-certified in review 3) were re-read in full here.
- **Title field** checked against source.
- **Word-count tripwire** run on all 13 pairs as a starting heuristic only (see table below); every paragraph was then read regardless of ratio.
- **Whole-chapter continuous pass** for cross-boundary consistency: public/private minister, natural vs. political capacity, judicature, business, author, and the body-natural chain.

### Structural

- Paragraph count **13 = 13**. Order preserved, 1:1 index alignment. `"number"` is 24 in both. Nothing merged, split, reordered, dropped or invented.
- Title: source "Chapter 23. Of the Publique Ministers of Soveraign Power" → candidate "Chapter 23. Of the Public Ministers of Sovereign Power". Correct (spelling modernization only; chapter number preserved).

### Word-count ratio scan (candidate ÷ source)

| idx | src | cand | ratio | | idx | src | cand | ratio |
|---|---|---|---|---|---|---|---|---|
| 0 | 27 | 41 | 1.52 | | 7 | 203 | 197 | 0.97 |
| 1 | 170 | 184 | **1.08** | | 8 | 230 | 234 | 1.02 |
| 2 | 210 | 196 | 0.93 | | 9 | 69 | 69 | 1.00 |
| 3 | 83 | 92 | 1.11 | | 10 | 31 | 31 | 1.00 |
| 4 | 83 | 82 | 0.99 | | 11 | 175 | 183 | 1.05 |
| 5 | 157 | 174 | 1.11 | | 12 | 164 | 164 | 1.00 |
| 6 | 99 | 103 | 1.04 | | | | | |

Every ratio is now in the 0.93–1.11 band except index 0 (1.52), whose expansion is the licensed "organic parts" gloss. **Index 1 has gone from 0.36 to 1.08** — consistent with a full restore plus one gloss. Confirmed by reading, not by the number.

---

## Part 1 — Content-loss check (priority 1)

**Result: no content loss anywhere in the chapter.** Every proposition, actor, negation, enumeration and example in the source has a counterpart in the candidate at the same index. Specifically verified, clause by clause:

- **Index 1 (the D7 site) is fully restored.** All four elements review 3 found deleted are present and correct:
  1. Definition of a public minister — "someone who is employed by the sovereign (whether a monarch or an assembly) in some affair, with authority to represent the person of the commonwealth in that employment." ✅
  2. Two persons / two capacities frame — "every man or assembly holding sovereignty represents two persons — or, as it is more commonly put, has two capacities, one natural and one political." ✅
  3. The criterion, negation **and** exception both intact — "Those who serve the sovereign in his natural capacity are not public ministers; only those who serve him in the administration of public business are." ✅
  4. The worked example with its inference — "So neither ushers, nor sergeants, nor any other officers who attend the assembly merely for the convenience of the men assembled — in an aristocracy or a democracy — nor stewards, chamberlains, cofferers (household treasurers), nor any other officers of a monarch's household, are public ministers in a monarchy." "And therefore" → "So" preserves the inference; the sweeping "neither…nor…nor" negation is intact. ✅
- **Cross-chapter damage from D7 is repaired.** "Natural capacity" / "political capacity" is now established at index 1 before being used at indices 3 and 11; "public minister" is defined before its twelve subsequent uses; "private minister" (index 11) has its definitional counterweight back.
- Indices 2, 4, 5, 7, 9, 10, 12 were checked element-by-element for dropped list items, dropped conditions and dropped clauses: the Latin tags at index 5, the arms/forts/ports and levy/pay/conduct lists at index 4, the first/second/third enumeration at index 7, the tributes/impositions/rents/fines list at index 3, the ambassadors/messengers/agents/heralds list at index 10, and the monarchy/democracy/aristocracy sequence at index 12 are all complete and in source order.

---

## Part 2 — D7 / D8 / D9 / D11 (and D10) as specified by review 3

| Item | Prescribed fix | Status |
|---|---|---|
| **D7** (idx 1, blocking) | Restore round-2 paragraph in full, re-apply "bear the person" gloss | **FIXED — verified in full** |
| **D8** (idx 2, required) | "an infant king's predecessor may entrust a protector or regent with the whole administration of the kingdom during his minority." | **FIXED — verbatim match** |
| **D9** (idx 3, recommended) | Gloss economy as "the management of its affairs", not "its public treasure" | **PARTLY FIXED** — see F1 |
| **D10** (idx 1, recommended) | "(To \"bear the person\" of something, in this technical sense, is to act and speak as if you were that thing.)" | **FIXED — verbatim match** |
| **D11** (idx 8, recommended) | Drop "in effect"; restore "For" for "Historically" | **FIXED** — see note |

Detail:

- **D7.** Verified against the source's full 170-word paragraph, not against a diff. The one addition is the D10 gloss, placed after the two-capacities/monarch-assembly material where the term first does work — exactly where review 3 asked for it.
- **D8.** Candidate reads: "Of the whole: for example, an infant king's predecessor may entrust a protector or regent with the whole administration of the kingdom during his minority." "during his minority" (the duration bound) is restored; the start-condition paraphrase is gone; "before his own reign ends" is gone; the unlicensed "a king" as actor is gone. All three D8 sub-items cleared.
- **D9.** "not money in the modern sense" stayed gone and "its public treasure" is gone, but the replacement is "the administration of its **revenue and** affairs", not the prescribed "the management of its affairs". This is much better than round 3 (it no longer *equates* economy with treasure) but it still foregrounds revenue inside the definition of a word that means household/estate management, with the revenue enumeration following immediately after. Non-blocking; see F1.
- **D11.** "in effect" is gone; the sentence is flat again ("the lords had judges of their own choosing"). "Historically" is gone; the paragraph now opens "For there were, in England, two orders of men…", restoring the causal tie to the praise of the English courts and removing the false implication that the arrangement has lapsed. The candidate's wording for the second half differs from the reviewer's suggested "their judges were none but those they themselves wanted" but carries the same unhedged claim; accepted.
- **Hedging discipline is now consistent chapter-wide:** no "in effect" at index 7 and none at index 8.

---

## Part 3 — Full checklist over all 13 paragraphs

**Actors.** No rank, office or agent is named that Hobbes declines to name (the round-3 "a king" regression is gone). Two pronoun disambiguations were checked and judged sound: index 2 "the deputy" for the source's bare "he" in the province case (the governor/lieutenant/prefect/viceroy just named), and index 11 "belongs to **the prince** in his natural capacity" for the source's "belonging to him" — the standard and near-certain reading, though it does resolve a genuine ambiguity in the source (F4).

**Negation.** All negations preserved with scope intact: index 1 "are not public ministers" + "are public ministers in a monarchy" under "neither…nor"; index 4 "does not for that reason represent its person"; index 11 "neither public nor private ministers"; index 12 "is a public person" under "Neither…nor" and "gives counsel to no one but itself". No negation flipped, dropped or narrowed.

**Causality.** The load-bearing causal links are present: "for no man can be judge in his own case" (7), "since his appeal was his own choice" (7), "for the defendant is then judged by his own judges" (7), "because there is no one for him to represent it to" (4), "because the commonwealth does not authorize any of their actions" (11), "Because this was always acknowledged as a privilege…" (8), and the restored "For" at the head of the two-orders passage (8). Four of Hobbes's sentence-initial explanatory "For"s are rendered as flat assertions — see F2.

**Certainty / modality.** One weakening found, at index 7 (F3). Elsewhere modality tracks the source: "may be committed" → "may entrust" (2), "can appeal no further" (7), "is final" (7), "should do it" (5), "no commission … can be read as" (2).

**Conditions.** All conditionals and their bounds preserved: the obedience conditions at index 2 (in the king's name; not inconsistent with sovereign power / not incompatible with the sovereign's right), the "unless it says so in express and unmistakable words" proviso (2), the restored "during his minority" (2), the "considered simply as having no authority of judicature or command" restriction (12), and the "while he is present in person" restriction (12, N7).

**Omissions.** None material. Three trivia recorded for completeness: "the knowledge of" dropped before "what is just and unjust" (5); "that can be given them" compressed to "given to them" (2); the superordinate "the Treasure" not carried as a head term at index 3 (F1b).

**Additions.** Every gloss is licensed and bounded: "organic parts … like organs in a body" (0, per N1), "bear the person" (1, per D10 house wording), "cofferers (household treasurers)" (1), the economy gloss (3, see F1), the Latin translations (5), "on the bench" and "judicature — the administration of justice" (6), "a jury" (8), "does not take responsibility for them as its own" for "have the Common-wealth for Author" (11). No gloss asserts anything about the world that the source does not; no reader-directed asides about modern English idiom survive anywhere in the chapter.

**Silent corrections.** None. The account of the lords' privilege, the twelve-man jury, the Common Pleas / Pleas of the Crown definitions and the *Dei Gratia* claims are rendered as Hobbes states them, without correction or modern qualification. The S1/S2/S3 items from review 1 (possible errors in Hobbes's own text) remain rendered and uncorrected.

**Unmodernized quotations / foreign matter.** *Dei Gratia*, *Dei Gratia et Regis*, *Dei Providentia et Voluntate Regis* are all retained in Latin with parenthetical translations added; the source's "&" is rendered "et", which is expansion of an ampersand, not alteration.

**Cross-boundary consistency.** Body-natural chain complete and correctly placed: nerves/tendons (2), organs of voice (8), hands (9), eye and ear (11). "Business" used consistently for "Businesse" at 3, 10 and both occurrences in 11. "Judicature" glossed once at first occurrence (6), unglossed at 8 and 12. Natural/political capacity established at 1 and used at 3 and 11. No claim moved across a paragraph boundary.

---

## Part 4 — Defects found in this pass (all non-blocking)

### F1 — NON-BLOCKING. Index 3: the "economy" gloss still leans on revenue; "treasure" dropped as a head term.

- **Source:** "As at home, First, for the **Oeconomy** of a Common-wealth, They that have Authority **concerning the Treasure**, as Tributes, Impositions, Rents, Fines, or whatsoever publique revenue…"
- **Candidate:** "At home, first, there are those with authority over the commonwealth's economy — **that is, the administration of its revenue and affairs**. Those with authority over tributes, impositions, rents, fines, or any other public revenue…"
- (a) D9's substance is fixed — economy is no longer *defined as* the treasure — but "revenue and affairs" still imports the enumerated subject matter into the definition of the word. Review 2's licensed "the management of its affairs" remains the cleaner rendering.
- (b) The source's superordinate "the Treasure", which the tributes/impositions/rents/fines list exemplifies, is not carried; the candidate promotes the list itself to head position. No proposition is lost (all four items plus "or any other public revenue" survive), but the source's genus/species structure is flattened.
- (c) Cosmetic, carried from review 3: the two-sentence restructure makes the subject appear twice ("there are those with authority over… / Those with authority over…").
- **Suggested:** "At home, first, for the commonwealth's economy — that is, the management of its affairs: those who have authority over the public treasure — tributes, impositions, rents, fines, or any other public revenue — to collect, receive, disburse, or audit it, are public ministers."

### F2 — NON-BLOCKING. Four of Hobbes's explanatory "For"s are rendered as flat assertions.

Same class as D11's second item, which review 3 asked to be fixed at index 8 (and it was). The remaining instances:

| idx | Source | Candidate |
|---|---|---|
| 2 | "**For** such Protectors, Vice-Roys, and Governours, have no other right…" | "Such protectors, viceroys, and governors have no right beyond…" |
| 4 | "**For** every one that hath command, represents it to them only whom he commandeth." | "Everyone who holds a command represents the commonwealth only to those he commands." |
| 6 | "**For** (as hath been before declared) all Judicature is essentially annexed…" | "As already explained, all judicature … is essentially attached…" |
| 9 | "**For** every act they doe by such Authority, is the act of the Common-wealth" | "Every act they perform under this authority is the act of the commonwealth" |

In each case the sentence stops explaining the one before it and becomes a standalone claim. None reverses or invents anything, and index 6 keeps a back-reference ("As already explained"), so this is a consistency/polish item rather than a distortion. Restoring "For" (or "since"/"because") in the four places would make the chapter's connective discipline uniform.

### F3 — NON-BLOCKING. Index 7: "is therefore either to" weakened to "may either".

- **Source:** "But the Soveraign is already agreed on for Judge by them both, and **is therefore either to** heare the Cause, and determine it himself, **or** appoint for Judge such as they shall both agree on."
- **Candidate:** "But the sovereign is already agreed on as judge by both, and **so may either** hear the case and decide it himself, or appoint as judges whomever they both agree on."
- "is to" states what the sovereign's position *requires* of him; "may" states what he is *permitted* to do. The exhaustive either/or is preserved, but the obligation behind it is softened. Minor, and it predates round 3 (it was certified as unchanged by review 3), but it is a modality shift and belongs in the record. Suggested: "and so is either to hear the case … or appoint…".

### F4 — MICRO-NOTES (no action needed unless a later round touches the paragraph)

- **Index 1:** "employed … in **some affair**" for "employed in **any affaires**" slightly narrows Hobbes's open-ended generality. Trivial.
- **Index 5:** "authority to teach, or to **authorize** others to teach" for "or **to enable** others to teach". "Enable" (make able/qualify) is not quite "authorize", though the paragraph's whole subject is authority, so the drift is small.
- **Index 6:** "**since** controversies are of two sorts … **so** are judgments" for the source's parallel "**as** … so". Turns a stated parallel into a stated cause; the following "Consequently" carries the same inference either way.
- **Index 11:** "belongs to **the prince** in his natural capacity" resolves the source's ambiguous "him". Almost certainly the right reading, but it is an interpretive decision made silently.
- **Index 8:** "the lords had judges of their own choosing" is now echoed two sentences later by "having judges of his own choosing". Accurate, mildly repetitive.

### Carried over from earlier reviews, still open, still optional

- **Index 5, `Dei Gratia`** rendered "the favor of God alone" in one clause and "the grace of God and the king" in the next. Inconsistent rendering of the same word within three lines. Optional.
- **Index 9, "suppress uprisings"** for "suppresse Tumults" — "tumults" in Hobbes is riots and disorders; "uprisings" leans toward organized rebellion. "disturbances" or "riots" would be closer. Optional.

---

## Verdict

**ACCEPT AS-IS**

Every blocking and required item from `fidelity-review-3.md` is cleared, verified by reading the current file against source rather than by reading a diff:

- **D7 (blocking) is fully repaired.** Index 1 carries the definition of "public minister", the two persons / two capacities frame, the natural-capacity criterion with its negation and exception, and the complete ushers / sergeants / stewards / chamberlains / cofferers example with its "And therefore" inference. The cross-chapter damage at indices 3 and 11 is repaired as a consequence.
- **D8 is fixed verbatim** — "during his minority" restored, the start-condition paraphrase and the unlicensed "a king" both gone.
- **D10 and D11 are fixed verbatim** — house wording for the "bear the person" gloss, no reader-directed aside, no "in effect", "For" restored at index 8.
- **D9 is substantively fixed**, if not in the exact words prescribed (F1).

**No content loss exists anywhere in the chapter.** All 13 paragraphs are present, in order, index-aligned, and each was read in full against its source paragraph — including indices 4, 5 and 10, which no previous review had re-certified. No paragraph ratio falls outside 0.93–1.11 except the licensed expansion at index 0, and every paragraph was read regardless of its ratio.

The four defects listed above (F1–F4) are all of the same non-blocking class as the items earlier reviews labelled "recommended, cheap, not blocking" — glosses that could be tightened and connectives that could be restored. None misstates Hobbes, none removes or adds a proposition, and none would mislead a reader. They are worth applying if the chapter is touched again, but they do not stand between this file and acceptance.

**Chapter 24 may be locked in as a finished candidate.** Recommended (optional) polish, in priority order: F1 (economy gloss + "treasure"), F2 (four dropped "For" connectives), F3 ("is to" vs "may"), then the carried-over `Dei Gratia` and "tumults" notes.

**Process note:** the word-count ratio scan called for at the end of review 3 was run here and is clean; it should stay in the pre-submission routine for every chapter, since it is what surfaced D7 in seconds. It is a tripwire only — this pass did not rely on it.
