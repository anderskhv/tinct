# Fidelity Review — Round 5

**Chapter:** Leviathan, edition chapter 27 (Hobbes's Chapter 26, "Of Civil Laws")
**Source (locked):** `books/wip/leviathan-pilot-ch27/source.json` — 48 paragraphs
**Candidate:** `books/wip/leviathan-pilot-ch27/candidate-sonnet.json` — 48 paragraphs
**Round-4 certified baseline:** `candidate-sonnet.json` at commit `b67f8214`
("content: ch27 round-4 fidelity re-check - ACCEPT AS-IS")
**Round-5 state under review:** working tree == commit `03bd5e6d`
("content: round-5 fixes for Leviathan ch14 and ch27"); tree clean for this path.

## Verdict

**ACCEPT AS-IS.**

No blocking issues. No required fixes. Two non-blocking observations are recorded
below; neither warrants another fix/reverify round.

---

## 0. Structural / containment check

- Paragraph count: source 48, round-4 48, round-5 48. Aligned 1:1 by index.
- `title` and `number` unchanged from round 4 (`Chapter 26. Of Civil Laws`, 27).
- Full index-by-index diff round-4 → round-5 yields **exactly** the changed set
  `[9, 12, 14, 27]` — precisely the declared round-5 scope. **No paragraph
  outside the declared set changed**, byte-for-byte.

---

## 1. Paragraph 9 — Parliament / Common Law (force vs. justice)

Source (final sentence): *"As if a Common-wealth could consist, where the Force
were in any hand, which Justice had not the Authority to command and govern."*

- R4: "…as if a commonwealth could subsist in which the force lay in any hand which justice had not the authority to command and to govern."
- R5: "…as if a commonwealth could subsist in which force were held by a hand that justice had no authority to command and govern."

**Logical claim verified unchanged.** Both renderings state the same
counterfactual-reductio: a commonwealth cannot subsist if the holder of force is
not subject to justice's authority to command and govern it. Subject, predicate,
negation scope and the "as if… could subsist" ironic framing are all preserved;
the doubly-stacked relative ("in any hand which justice had not…") is un-nested
into a single relative clause. "had not the authority" → "had no authority" is a
pure register equivalence. R5 also restores the source's "command and govern"
(R4 had "command and to govern"), so this is marginally closer to Hobbes.

Non-blocking observation: "in any hand" → "by a hand" shades a universal-ish
quantifier into an indefinite. Inside a counterfactual of this shape the two are
truth-functionally equivalent and the reductio force is unaffected. Not a defect.

**PASS.**

## 2. Paragraph 12 — the golden rule quotation

Source: *"Do not that to another, which thou thinkest unreasonable to be done by
another to thy selfe."*

- R4: "'Do not that to another which you would think it unreasonable to be done by another to yourself.'"
- R5: "'Do not do that to another which you would think it unreasonable to have done to yourself by another.'"

Element-by-element check — every element present, none added:

| Element | Source | R5 |
|---|---|---|
| prohibition of an act | "Do not that" | "Do not do that" |
| toward a second party | "to another" | "to another" |
| the reasonableness test | "which thou thinkest unreasonable" | "which you would think it unreasonable" |
| the act done in reverse | "to be done" | "to have done" |
| by the second party | "by another" | "by another" |
| to oneself | "to thy selfe" | "to yourself" |

Only the order of the two final adjuncts is swapped ("done by another to yourself"
→ "done to yourself by another"), which does not change who does what to whom.
Nothing is added or dropped; the rule's content is identical. Confirmed that this
quotation is itself a modernized rendering of Hobbes's own one-sentence
formulation, not a verbatim historical quote requiring preservation — so the
grammar repair ("Do not do that…", supplying the missing verb) is legitimate.
Its framing in the surrounding sentence ("contained in this single sentence,
approved by all the world") is unchanged.

**PASS.**

## 3. Paragraph 14 — "Except for the law of nature"

Source: *"The Law of Nature excepted, it belongeth to the essence of all other
Lawes, to be made known, to every man that shall be obliged to obey them…"*

- R4: "The law of nature excepted, it belongs to the essence of all other laws to be made known to every man who shall be obliged to obey them"
- R5: "Except for the law of nature, it belongs to the essence of all other laws to be made known to every man who shall be obliged to obey them"

**Pure syntactic swap, no scope change.** The exception still attaches to the
subject of the essence-claim ("all other laws"), exempting the law of nature and
nothing else from the must-be-made-known requirement. The rest of the sentence —
"either by word, by writing, or by some other act known to proceed from the
sovereign authority" — is byte-identical to round 4. Nothing else in the
paragraph (Prov. 7:3, Deut. 11:19, Deut. 31:12, the verse-memorization passage)
was touched.

**PASS.**

## 4. Paragraph 27 — judge / tittle / fleeing-felon case study

Three declared edits; all three verified as localized, with no change to the
surrounding legal reasoning (innocence-by-judicial-acquittal, the presumption
argument, the Coke quotation, the "refuse to hear proof, refuse to do justice"
argument, and the closing precedent conclusion are all byte-identical to round 4
except at the three edit points).

**(a)** Source: *"Put the case now, that a man is accused of a capitall crime…"*
R4 "Put the case now that a man is accused…" → R5 "Suppose that a man is
accused…". The hypothetical-introducing force is preserved; only the archaic
idiom is modernized. Loss of discourse-marker "now" is immaterial. **PASS.**

**(b)** Source: *"Princes succeed one another; and one Judge passeth, another
commeth; nay, Heaven and Earth shall passe; but not one title of the Law of
Nature shall passe…"* R4 "nay" → R5 "indeed".

Hobbes's "nay" here is the escalating/corrective "nay" — *more than that* — not
simple assent: the series climbs from princes, to judges, to heaven and earth,
against which the law of nature is set. "Indeed", positioned at the head of the
third, climactic member of that series and immediately before the adversative
"but not one tittle", does carry intensifying/contrastive force and reads as
"more than that" rather than as bare agreement. The asymmetry that carries the
argument (everything else passes / the law of nature does not) is fully intact.

Non-blocking observation: "indeed" is a slightly flatter intensifier than "nay";
"more than that" or "yes, even" would be marginally stronger. This is a stylistic
preference, not a fidelity defect, and does not justify a further round.
The Matthew 5:18 allusion ("not one tittle — that is, not the smallest stroke")
is unchanged from its earlier-certified state. **PASS.**

**(c)** Source: *"if the presumption were not of the Fact, for what then ought he
to lose his goods?"* R4 "then for what should he lose his goods?" → R5 "then for
what reason should he lose his goods?". The rhetorical question, its conditional
antecedent, and its deontic force ("ought"/"should") are unchanged; "reason"
merely completes the interrogative phrase that Hobbes carries with "for what
then". No content added. **PASS.**

## 5. Paragraph 30 — "not only of the fact … but also of the right" (unchanged, verified correct)

Confirmed **unchanged** this round (byte-identical to round 4).

The doubling is Hobbes's own. Source, paragraph 30: *"…Twelve men of the common
People, are the Judges, and give Sentence, not onely of the Fact, but of the
Right; and pronounce simply for the Complaynant, or for the Defendant; that is to
say, are Judges not onely of the Fact, but also of the Right…"* The candidate
renders: *"…twelve men of the common people are the judges, and give sentence,
not only of the fact but of the right, pronouncing simply for the complainant or
for the defendant — that is, they are judges not only of the fact but also of the
right…"*

The near-verbatim restatement, including the added "also" on the second pass, is
a direct mirror of the source's own "that is to say" restatement. Removing or
varying it to avoid repetition would flatten an intentional authorial gloss.
**The round-4/round-5 decision to leave it alone is verified correct** against
source by this reviewer independently.

(Note on numbering: the request referred to "paragraph 30/31". The passage sits
at 0-indexed paragraph **30** in both source and candidate — index 31 1-indexed.
There is no second occurrence elsewhere in the chapter.)

## 6. Paragraph 43 — "lest we die" scripture quotation (unchanged)

Confirmed **unchanged** (byte-identical to round 4). Source: *"Speak thou to us,
and we will heare thee; but let not God speak to us, lest we dye?"* Candidate
retains "lest we die" inside the quotation.

(Note on numbering: the request referred to "paragraph 46". The scripture
quotation containing "lest we die" is at 0-indexed paragraph **43**, and it is
the only occurrence in the chapter. Paragraph 46 was not among the changed set
either, so nothing turns on the discrepancy.)

## 7. Round-4 spot-check set — byte-identical confirmation

Verified byte-identical to their round-4-certified state (`b67f8214`):

| Para | Status | SHA-256 (first 12) | Chars |
|---|---|---|---|
| 4 | identical | `1a091fab1a84` | 684 |
| 8 | identical | `81abc42d87f1` | 1123 |
| 17 | identical | `63db7f07da59` | 451 |
| 20 | identical | `35fd3f26eb30` | 743 |
| 21 | identical | `e653363b88ea` | 1151 |
| 30 | identical | `96f8f0bafc32` | 2601 |
| 33 | identical | `82710cc41f35` | 448 |
| 34 | identical | `0e30911d74b4` | 275 |
| 43 | identical | `c48bc57666b7` | 3616 |
| 47 | identical | `b8e943aa5cf1` | 707 |

---

## Coverage statement

- Full 48/48 index-by-index diff, round-4 baseline vs. round-5 candidate (change
  set isolation).
- Full close read against source of paragraphs 9, 12, 14, 27 (all four round-5
  edits, all six discrete edit points).
- Full close read against source of paragraphs 30 and 43 (leave-alone decisions
  re-derived independently).
- Byte-identity verification of the round-4 spot-check set 4, 8, 17, 20, 21, 30,
  33, 34, 47 (plus 43).
- Paragraph count and alignment check source vs. candidate.
- **Not covered:** the remaining paragraphs were not re-read in full this round
  (they are unchanged since round 4 and carry round-4's certification).

## Readiness

The chapter is **ready for the final full non-sampled pass**. All round-5 edits
are accessibility/grammar repairs that leave the propositional content, the
argument structure, and the quotation content untouched; the two deliberate
leave-alone decisions (paragraph 30's doubling, paragraph 43's scripture wording)
are independently confirmed correct. There are no outstanding fidelity items to
resolve first, and no reason to run a round 6 of the sampled fix/reverify cycle.
