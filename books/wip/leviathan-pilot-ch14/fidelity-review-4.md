# Fidelity Review — Round 4

**Work:** Hobbes, *Leviathan*, edition chapter 14 (Hobbes's chapter 13, "Of the Natural Condition of Mankind")
**Source (locked):** `books/wip/leviathan-pilot-ch14/source.json` — 14 paragraphs
**Candidate:** `books/wip/leviathan-pilot-ch14/candidate-sonnet.json` — 14 paragraphs
**Baseline for round-4 delta:** candidate as of commit `0aac1c66` (round-3 state)
**Date:** 2026-09-21

---

## Verdict

**ACCEPT WITH FIXES REQUIRED** — one (1) mandatory word-choice fix, in paragraph 8.

Everything else in round 4 is accepted. All nine touched paragraphs are meaning-preserving
restructures; the two famous sentences are intact; the five untouched paragraphs are
byte-identical to their previously-certified state. This is the smallest fix list the
chapter has carried, and the single remaining item is mechanical.

---

## Coverage

| Scope | Method | Result |
|---|---|---|
| Paragraph count | source 14 vs candidate 14 | match |
| Paragraph order/indices | index-by-index | match, nothing merged/split/reordered |
| Changed-paragraph set | mechanical diff vs `0aac1c66` | exactly 1, 2, 3, 4, 7, 8, 10, 12, 13 — no out-of-scope edits |
| Untouched-paragraph set | mechanical diff vs `0aac1c66` | 0, 5, 6, 9, 11 byte-identical |
| Touched paragraphs | full read against source, clause by clause | 8 of 9 clean; 1 defect (para 8) |
| Famous sentences | literal comparison | both intact |

Verified mechanically that the round-4 delta contains **no edits beyond the nine
paragraphs listed in the change brief**, and that within those nine paragraphs no
change occurred beyond the edits the brief described. No silent drive-by edits.

---

## Paragraph-by-paragraph findings (touched)

### Paragraph 1 — parenthetical extraction — **ACCEPT**

Source: `And as to the faculties of the mind, (setting aside the arts grounded upon words,
and especially that skill of proceeding upon generall, and infallible rules, called Science;
which very few have, and but in few things; as being not a native faculty, born with us;
nor attained, (as Prudence,) while we look after somewhat els,) I find yet a greater
equality amongst men, than that of strength.`

Content audit of the restructure — every element of the parenthetical survives, in order:

- "arts grounded upon words" → "skills that depend on the use of words" ✓
- "that skill of proceeding upon generall, and infallible rules, called Science" ✓
- "which very few have, and but in few things" ✓
- "not a native faculty, born with us" ✓
- "nor attained, (as Prudence,) while we look after somewhat els" → "nor is it acquired,
  as Prudence is, while pursuing something else" ✓
- Main clause: "I find yet a greater equality among men than there is in strength" ✓

Nothing dropped, nothing added. **No content delta.**

On the false-contrast question: "As for the rest of the faculties of the mind" introduces
"the rest of," which is not literally in the source. It is **not** a false contrast. The
source's parenthetical is an explicit *exclusion* from the set under discussion — Hobbes
sets the word-grounded arts aside and then judges what remains. "The rest of" states that
exclusion rather than implying a new opposition, and it reads as continuous with the
set-aside sentence, not against it. Accepted as a faithful consequence of the restructure.

Incidental improvement worth recording: round 3 had "acquired incidentally, the way Prudence
is, in the course of pursuing something else." Round 4's "acquired, as Prudence is, while
pursuing something else" drops the interpolated "incidentally," which had no source warrant.
This moves *closer* to the source.

### Paragraph 2 — "like" → "same" — **ACCEPT**

Source: `And the Invader again is in the like danger of another.`
Candidate: "And the invader, in turn, is in the same danger from another."
"Like danger" = danger of the same kind; "same danger from another" carries it with the
modern preposition. Meaning unchanged.

### Paragraph 3 — conditional restructure — **ACCEPT**

Source: `if others, that otherwise would be glad to be at ease within modest bounds, should
not by invasion increase their power, they would not be able, long time, by standing only
on their defence, to subsist.`

Candidate: "if others did not increase their own power through invasion, though they would
otherwise be glad to remain at ease within modest bounds, they would not be able to survive
for long by relying on defense alone."

- Conditional logic: **unchanged** — antecedent is still "others do not expand by invasion,"
  consequent is still "they cannot subsist."
- Subject of "would not be able to survive": still **"others"** — the moderate party, the
  same referent as the source's "they." No subject slippage; the "others" who would be glad
  of modest bounds are the same ones who cannot survive on defense alone. This is the
  load-bearing point of the paragraph (it is what licenses pre-emptive expansion as
  self-preservation) and it is preserved.
- "that otherwise would be glad" → concessive "though they would otherwise be glad" ✓
- "long time" → "for long" ✓; "standing only on their defence" → "relying on defense alone" ✓

### Paragraph 4 — elliptical construction spelled out — **ACCEPT**

Source: `to extort a greater value from his contemners, by dommage; and from others, by the example.`
Candidate: "...from those who show him contempt, by doing them harm, and from others by making
an example of them."

Hobbes's ellipsis is "by the example [of that damage]." "By making an example of them" — "them"
being the contemners just harmed — is exactly that sense, and preserves the two-audience
structure (the contemners are coerced by the harm itself; third parties by the demonstration).
Accurate expansion, no overreach.

### Paragraph 7 — "awe" gloss — **ACCEPT** (with a non-blocking note)

Candidate: "to keep them all in awe — that is, in fear and subjection —".

Accurate to Hobbes's sense. "Awe" in Hobbes is not modern reverential wonder; it is the
dread of a superior power sufficient to restrain action, and the gloss correctly blocks the
modern misreading. Inline glosses of this kind are already an established pattern in this
rendering (paragraph 5: "Diffidence (that is, mutual distrust)"; paragraph 10: "natural
lust — that is, natural appetite"), so it is consistent in register.

*Non-blocking note:* "fear" is the affect; "subjection" is its political result rather than
part of the word's meaning, so the gloss is very slightly expansive. It stays inside Hobbes's
argument — the whole point of the common power is that awe produces submission — so it is
not a fidelity error, but "that is, in fear of a power above them" would be tighter if a
later pass touches this paragraph anyway. Do **not** change it on its own account.

*Consistency note, also non-blocking:* "over-awe" in paragraph 4 and "no common Power to feare"
in paragraph 10 are left unglossed. That is fine — one gloss at first substantive use is the
right density; repeating it would be worse.

### Paragraph 8 — **FIX REQUIRED** (one item)

- "invention" → "resourcefulness" — **ACCEPT.** Hobbes's "invention" is inventiveness/ingenuity,
  not modern "an invention." "Resourcefulness" carries it without drift.
- "commodious Building" → "convenient building" — **FIX REQUIRED.**

  Source `commodious` here means *roomy, comfortable, well-appointed*. Modern "convenient"
  means *handy / close at hand*, which is a different property. Two problems compound:

  1. **Semantic drift.** "No convenient building" reads as buildings being inconveniently
     located, not as the absence of comfortable dwellings, which is what Hobbes is listing.
  2. **Internal collision.** This rendering already uses "convenient" to render the source's
     own word `convenient` — paragraph 2, "a convenient Seat" → "a convenient spot." And it
     already renders the same root correctly elsewhere: paragraph 13, "commodious living" →
     "a comfortable life." So round 4 now has *commodious* → "convenient" in one paragraph
     and *commodious* → "comfortable" in another, while "convenient" is simultaneously doing
     duty for the source's "convenient."

  **Required fix:** paragraph 8, `no convenient building` → `no comfortable building`.
  (`no comfortable housing` is equally acceptable if a later reader prefers it; the
  requirement is only that it stop being "convenient" and match paragraph 13's treatment
  of the same word.)

  Round 3's "commodious" was accurate but archaic; the accessibility direction to modernize
  it was right, the landing word was not.

**Famous sentence check — PASS.**
Source: `And the life of man, solitary, poore, nasty, brutish, and short.`
Candidate: `and the life of man, solitary, poor, nasty, brutish, and short.`
The only delta is the modernized spelling of *poore*. Word order, the five adjectives, the
comma series, and the "and the life of man" lead-in are all exactly as Hobbes has them.
Untouched by round 4 (confirmed against the round-3 baseline diff). Unsoftened.

### Paragraph 10 — mechanical fixes + inference restructure — **ACCEPT**

- Stray comma removed: "America, have no government" → "America have no government" ✓
  (confirmed in the file; the subject-verb break is gone).
- Dangling subject fixed: "and they live at this day in that brutish manner" ✓ — "they" now
  explicitly resumes "the savage people," where before the verb hung off the intervening
  "small families / natural lust" clause.
- **Inference direction: PRESERVED.** Source: `it may be perceived what manner of life there
  would be, where there were no common Power to feare; by the manner of life, which men that
  have formerly lived under a peacefull government, use to degenerate into, in a civill Warre.`
  Candidate: "the kind of life men tend to degenerate into during a civil war — after formerly
  having lived under a peaceful government — shows what kind of life there would be with no
  common power to fear."

  Observed evidence (civil-war degeneration) is the **subject/premise**; the state of nature
  is the **object/conclusion**. The restructure moves the evidence to the front of the sentence
  and makes "shows" the verb, which is the same inference running in the same direction, now
  in the order a modern reader parses. The "formerly having lived under a peaceful government"
  qualifier stays attached to the men who degenerate — which matters, because it is what makes
  the observation evidential rather than merely descriptive. Not reversed.

### Paragraph 12 — four edits — **ACCEPT**

- "this also is consequent" → "this also follows" ✓
- "are none of the faculties" → "are not among the faculties" ✓ (source: `are none of the
  Faculties neither of the Body, nor Mind`; the candidate's "not among the faculties either
  of the body or of the mind" resolves the double negative correctly — Hobbes means they are
  *not* faculties, and that is what the candidate says).
- "no Mine and Thine distinct" → "no distinction between mine and thine" ✓ — preserves the
  technical sense (no distinct property claims), and the follow-on clause "but only that
  whatever a man can get is his, for as long as he can keep it" correctly renders `but onely
  that to be every mans that he can get; and for so long, as he can keep it`.
- Dangling modifier fix: `though with a possibility to come out of it, consisting partly in
  the Passions, partly in his Reason` → "though there is a possibility of coming out of it —
  a possibility that lies partly in the passions and partly in his reason." The appositive
  now unambiguously modifies *possibility*, which is what "consisting" attaches to in the
  source. Correct fix.

  *Non-blocking style note:* the sentence now runs "...placed by mere nature — though there
  is a possibility of coming out of it — a possibility that lies partly in..." Three em dashes
  in close sequence, where the second reads as closing a parenthetical but actually opens an
  appositive. A comma in place of the second dash would read more cleanly. Fidelity is
  unaffected; do not change it on its own account.

**Famous sentence check — PASS.**
Source: `Where there is no common Power, there is no Law: where no Law, no Injustice.`
Candidate: `Where there is no common power, there is no law; where no law, no injustice.`
Wording, clause order, and the elliptical second half are exactly preserved. The only deltas
are capitalization normalization and a semicolon for Hobbes's colon — both within this
rendering's established house style and neither touching sense. Untouched by round 4
(confirmed against the round-3 baseline diff).

### Paragraph 13 — **ACCEPT**

`Desire of such things as are necessary to commodious living` → "desire for things that are
necessary for a comfortable life." Correct on both counts; "comfortable" is the right
treatment of *commodious* (and is the treatment paragraph 8 should adopt).

---

## Untouched paragraphs — byte-identity confirmed

Mechanically compared against commit `0aac1c66`:

| Para | Content | Status |
|---|---|---|
| 0 | Natural equality of body and mind; the weakest can kill the strongest | **byte-identical** |
| 5 | Three principal causes of quarrel (Competition / Diffidence / Glory) | **byte-identical** |
| 6 | Gain / Safety / Reputation; violence over trifles | **byte-identical** |
| 9 | The traveller who arms himself, locks his doors and chests | **byte-identical** |
| 11 | Kings in the posture of gladiators | **byte-identical** |

No drift, no incidental reflow, no whitespace or punctuation churn. All five remain in their
previously-certified state.

---

## Structural integrity

- JSON valid; 14 paragraphs in, 14 out.
- Paragraph indices aligned 1:1 with source. Nothing merged, split, reordered, dropped, or invented.
- Proper nouns preserved: Science, Prudence, America, Nature, Laws of Nature, War/Peace
  small-caps emphasis (WAR, PEACE) retained where Hobbes has it.
- No softening of the America passage (still "savage people," "brutish manner") and no
  softening of the state-of-nature verdict — consistent with the round-1 decision to render
  faithfully and flag for editorial context rather than silently correct.

---

## Fix list (complete)

1. **Paragraph 8:** `no convenient building` → `no comfortable building`.

That is the entire required change set. Nothing else is blocking.

---

## Readiness for a final full non-sampled pass

Not yet — but one fix away. Apply the single paragraph-8 word change, then this chapter is
ready for the final full non-sampled read.

Rationale: round 4's defect rate is one word in fourteen paragraphs, the defect is mechanical
rather than interpretive, and the three structurally risky restructures this round (the
paragraph-1 parenthetical extraction, the paragraph-3 conditional inversion, and the
paragraph-10 inference reversal-risk) all came through clean. Those were the passages where
meaning was most likely to shift, and none did. The chapter has converged.

Recommend: apply fix, then go straight to the full non-sampled pass — a round 5 sampled
re-check would not earn its cost over a single word replacement.
