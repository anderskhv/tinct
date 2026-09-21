# Fidelity Review — Round 3

**Chapter:** edition ch14 = Hobbes's Chapter 13, "Of the Naturall Condition of Mankind, as Concerning Their Felicity, and Misery"
**Source (locked):** `books/wip/leviathan-pilot-ch14/source.json` — 14 paragraphs
**Candidate:** `books/wip/leviathan-pilot-ch14/candidate-sonnet.json` — 14 paragraphs
**Baseline for diff:** round-2 candidate at commit `b82a968b` (identical on this file to `047e5690`)
**Reviewer:** independent fidelity pass, round 3
**Date:** 2026-09-21

---

## Verdict

**ACCEPT WITH FIXES REQUIRED**

Two mechanical defects in paragraph 10, both introduced by the round-3 restructure of that
paragraph. Neither is a mistranslation and neither requires re-rendering — they are a stray
comma and a dangling coordinate verb. Everything else in the round-3 set is accurate and
licensed. The round-2 blocking issue ("not romance") is **resolved**.

---

## Structural checks

| Check | Result |
| --- | --- |
| JSON valid | PASS |
| Paragraph count 14 vs source 14 | PASS |
| Paragraph order / no merges, splits, drops | PASS |
| `number` = 14, `title` byte-identical to source | PASS |
| Paragraphs changed in round 3 | 1, 3, 4, 7, 8, 10, 11, 12 — **exactly the declared set**, no undeclared edits |
| Paragraphs 0, 2, 5, 6, 9, 13 | Byte-identical to previously certified round-2 text — PASS |

---

## Paragraph 10 — BLOCKING round-2 fix (priority item)

Source:

> For the savage people in many places of America, except the government of small Families, the
> concord whereof dependeth on naturall lust, have no government at all; and live at this day in
> that brutish manner, as I said before. Howsoever, it may be perceived what manner of life there
> would be, where there were no common Power to feare; by the manner of life, which men that have
> formerly lived under a peacefull government, use to degenerate into, in a civill Warre.

Candidate (round 3):

> For the savage people in many places of America, have no government at all, except for the
> government of small families, whose harmony depends on natural lust — that is, natural appetite —
> and live at this day in that brutish manner I described before. In any case, the kind of life
> there would be with no common power to fear can be perceived from the kind of life that men who
> have formerly lived under a peaceful government tend to degenerate into, during a civil war.

### 1. "natural lust" gloss — RESOLVED, licensed

`instinctive desire, not romance` → `natural lust — that is, natural appetite —`.

The unlicensed exclusion is gone. "Natural appetite" is exclusion-free: it neither asserts nor
denies a sexual reading, and it sits inside the semantic range Hobbes himself uses for the term
(appetite/desire is his standing vocabulary for the passions, ch. 6). The gloss is an addition to
the source, but it is a definitional restatement of the glossed phrase rather than a new claim,
and it does not narrow the term. **Accepted.**

### 2. Restructured "except for the government of small families..." sentence

Content coverage is complete and the referents are unchanged:

- subject = the savage people in many places of America (unchanged);
- the claim = they have no government at all (unchanged);
- the exception = the government of small families (unchanged, still an exception to the
  no-government claim, not to anything else);
- the families' concord/harmony depends on natural lust (unchanged);
- they live at this day in that brutish manner, as previously said (unchanged, "as I said
  before" → "I described before" is a neutral rewording).

Nothing was added, dropped, or re-attributed. **Content fidelity: PASS.** However the new word
order produces two defects:

**FIX 1 (required, mechanical).** `the savage people in many places of America, have no government`
— the comma now sits between subject and verb. In the source that comma opened the "except..."
insertion; with the insertion moved, the comma is stranded and ungrammatical. Delete it.

**FIX 2 (required, mechanical).** `and live at this day in that brutish manner` now follows the
entire except-clause, so its subject is ambiguous: the nearest candidates are "small families" and
"harmony", not "the savage people". The source kept "have no government at all; and live at this
day..." adjacent, with a semicolon. The restructure removed one separation problem and created
another. Recommended repair — either insert an explicit subject or restore a stronger break:

> ...have no government at all except for the government of small families, whose harmony depends
> on natural lust — that is, natural appetite — and they live at this day in that brutish manner I
> described before.

This is attribution, not meaning: the paragraph's claims are correct as written, but a reader can
misparse who lives in the brutish manner, which in this specific passage is the whole point.

### 3. "it may be perceived..." final sentence — PASS

Reordered to put the subject before the verb: "the kind of life there would be with no common power
to fear **can be perceived from** the kind of life that men ... tend to degenerate into, during a
civil war." All source elements survive: the counterfactual (no common power to fear), the
evidentiary move (perceived from), the comparison class (men formerly under a peaceful government),
the habitual "use to degenerate into" (correctly rendered "tend to degenerate into"), and the
setting (a civil war). "Howsoever" → "In any case" is an accurate discourse-marker equivalent.
No meaning change.

---

## Other round-3 paragraphs

### Paragraph 1 — PASS (one advisory)

- `the arts grounded upon words` → `skills that depend on the use of words`: accurate; "arts" in
  Hobbes's sense here is skills/disciplines.
- `nor attained, (as Prudence,) while we look after somewhat els` → `nor is it acquired
  incidentally, the way Prudence is, in the course of pursuing something else`: accurate. Advisory
  only — "incidentally" and "in the course of pursuing something else" render the same clause
  twice; the meaning is right but slightly padded. Non-blocking.
- `whom by Fame, or for concurring with themselves, they approve` → `whom they approve of — either
  by reputation, or because those others agree with them`: both grounds of approval preserved, and
  the direction of "concurring with themselves" (the others agree with the self-approving man) is
  correct.

### Paragraph 3 — PASS (one advisory)

- Conditional restructure: `should not by invasion increase their power` → `did not increase their
  own power through invasion`; `not be able, long time, by standing only on their defence, to
  subsist` → `not be able to survive for long by relying on defense alone`. Logical shape of the
  counterfactual, its subject ("others, who would otherwise be glad..."), and its conclusion are
  intact.
- `allowed him` → `allowed to him`: PASS, grammatical modernization only.
- Advisory: `be at ease within modest bounds` → `stay safely within modest bounds` imports a
  safety claim the source does not make — and the sentence goes on to say precisely that such men
  could *not* subsist that way, so "safely" works slightly against the argument. Suggest "stay at
  ease within modest bounds". Non-blocking.

### Paragraph 4 — PASS

The parenthetical no longer sits between verb and object. All elements retained and correctly
attached: the man endeavors to extort a greater value from his contemners by damage ("by doing them
harm") and from others by the example; "as far as he dares" is retained as "going as far as he
dares"; the qualifier (among those with no common power to keep them quiet, that is far enough to
make them destroy one another) is preserved verbatim in force. No content added or lost.

### Paragraph 7 — PASS

`such a war as is of every man against every man` → `a war of every man against every man`. Only
the intensive `such ... as is` construction is dropped; the proposition is unchanged, and the
canonical phrase "a war of every man against every man" is preserved intact.

### Paragraph 8 — PASS (one advisory); famous sentence UNTOUCHED

`the same is consequent to the time` → `the same follows equally from the time`. Correct: Hobbes's
"is consequent to" = "follows from", and the parallel with the paragraph's opening "Whatever
therefore follows from a time of war" is now explicit. Advisory: "equally" is an added emphasis not
in the source, though it is close to what "the same is consequent" already implies. Non-blocking.

**Famous sentence check:** `and the life of man, solitary, poor, nasty, brutish, and short.` —
byte-identical to the round-2 certified text; the round-3 diff on this paragraph is confined to the
`is consequent to` → `follows equally from` clause. **UNTOUCHED, CONFIRMED.**

### Paragraph 11 — PASS (full first-time scrutiny)

This paragraph had not been edited in any prior round, so it was reviewed whole against the source,
not just at the edit site.

Clause-by-clause coverage: counterfactual concession ("though there had never been any time in
which individual men were in a condition of war against one another") — present; "yet at all times"
— present; "kings and persons of sovereign authority" — present; "because of their independence" —
present; "continual jealousies" — present; "the state and posture of gladiators" — present;
"weapons pointing and their eyes fixed on one another" — present; the gloss "that is, their forts,
garrisons, and guns upon the frontiers of their kingdoms" — present; "continual spies upon their
neighbors" — present; "which is a posture of war" — present.

The round-3 edit: `there does not follow from it that misery which accompanies the liberty of
individual men` → `that misery which accompanies the liberty of individual men does not follow from
it`. Pure reordering of an expletive-subject construction; the negation, its scope, and the
referent of "it" (the kings' upholding of their subjects' industry) are unchanged. The causal
because-clause `because by this they uphold the industry of their subjects` is correctly retained
as the reason the misery does *not* follow. No inversion of the argument.

`particular men` → `individual men` is correct for Hobbes's sense (private persons as against
sovereigns) and is used consistently in this paragraph.

### Paragraph 12 — PASS; famous sentence UNTOUCHED

`but only that to be every man's which he can get` → `but only that whatever a man can get is his`.
Accurate and complete; the trailing condition "for as long as he can keep it" is retained and still
attaches to the same claim.

**Famous sentence check:** `Where there is no common power, there is no law; where no law, no
injustice.` — byte-identical to the round-2 certified text; the round-3 diff on this paragraph is
confined to the property clause near the end. **UNTOUCHED, CONFIRMED.**

---

## Unchanged paragraphs — confirmation

Paragraphs **0, 2, 5, 6, 9, 13** are byte-identical to the previously certified round-2 text
(verified against both `b82a968b` and `047e5690`). No drift, no whitespace or punctuation changes.

---

## Required fixes (both in paragraph 10, both mechanical)

1. Delete the comma after "in many places of America" (stray subject/verb comma left behind by the
   restructure).
2. Disambiguate the subject of "and live at this day in that brutish manner" — e.g. "and **they**
   live at this day..." — so it reads off "the savage people" and not "small families" / "harmony".

## Advisory (non-blocking, reviewer's discretion)

- P1: "acquired incidentally ... in the course of pursuing something else" is doubled.
- P3: "stay safely within modest bounds" — prefer "stay at ease"; "safely" is an added claim the
  sentence then contradicts.
- P8: "follows equally from" — "equally" is added emphasis.

No re-rendering required. After fixes 1 and 2, this chapter is fidelity-clean.
