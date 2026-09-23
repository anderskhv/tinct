# Jane Eyre — Chapter 35 — Independent Verification of Paragraph 83 Repair

Reviewer: independent (did not draft the repair). Adversarial fidelity check against
`ch35-source.json` (1847 original).

**Verdict: ACCEPT.** The inversion is genuinely fixed, no new errors introduced in the
repaired paragraph, and the 82→85 sequence now reads coherently. Two *pre-existing*
defects elsewhere in the chapter (paragraphs 80 and 87) were found during the continuity
read; they are out of scope for this repair but should be queued.

---

## 1. Independently confirmed diff set

Re-diffed `ch35-current-modern-en.json` vs `ch35-corrected.json` myself
(paragraph-by-paragraph string equality, plus top-level field comparison):

- Paragraph counts: source 98 / current 98 / corrected 98 — match.
- Top-level fields identical: `number` = 35, `title` = "Chapter 35" in all three.
- **Changed paragraph indices (0-based): `[83]` — exactly one.** All other 97 paragraphs
  are byte-identical between current and corrected.
- `python3 -m json.tool ch35-corrected.json` — valid JSON.

The drafter's claim of a single-paragraph change is **confirmed**.

---

## 2. Fidelity of corrected paragraph 83

### Source (ground truth), final third

> "I felt veneration for St. John—veneration so strong that its impetus thrust me at once
> to the point I had so long shunned. I was tempted to cease struggling with him—to rush
> down the torrent of his will into the gulf of his existence, and there lose my own. I was
> almost as hard beset by him now as I had been once before, in a different way, by another.
> I was a fool both times. To have yielded then would have been an error of principle; to
> have yielded now would have been an error of judgment. So I think at this hour, when I
> look back to the crisis through the quiet medium of time: I was unconscious of folly at
> the instant."

### Pre-repair (defective)

> "I felt reverence for St. John. I felt his power. But the power was not mine to submit to.
> I would follow him to the ends of the earth. I would not give him my hand."

Confirmed inversion: source has admitted temptation to surrender; pre-repair text asserts
settled refusal. Nothing in the source supports "the power was not mine to submit to" or
"I would not give him my hand" — both are invented, and the second flatly contradicts
paragraph 86, where Jane says she *could* vow to marry him here and now.

### Corrected

> "I felt reverence for St. John—reverence so strong that its force drove me at once toward
> the point I had so long avoided. I was tempted to stop struggling with him—to be swept down
> the torrent of his will into the gulf of his existence, and lose my own there. I was almost
> as hard pressed by him now as I had once been, in a different way, by someone else. I was a
> fool both times. To have yielded then would have been an error of principle; to yield now
> would be an error of judgment. So I think at this hour, looking back on the crisis through
> the calm distance of time. At the moment, I was unaware of my own folly."

Element-by-element check:

| Source element | Restored? | Note |
|---|---|---|
| Veneration so strong its impetus thrusts her to the shunned point | Yes | "reverence so strong that its force drove me at once toward the point I had so long avoided" — direction of force preserved (*toward* surrender, not away) |
| "tempted to cease struggling with him" | Yes | "tempted to stop struggling with him" — temptation explicit |
| Torrent-of-will / gulf-of-existence / lose my own | Yes | Metaphor intact and in correct order; the self being lost is hers |
| Parallel to the earlier crisis "by another" (Rochester) | Yes | "as I had once been, in a different way, by someone else" — correctly keeps Rochester unnamed, as the source does |
| "I was a fool both times" | Yes | Verbatim; self-criticism present |
| Error of principle (then) vs error of judgment (now) | Yes, correctly assigned | *then* = principle, *now* = judgment — matches source exactly; not swapped, not merged, not flattened into one category |
| Retrospective framing through "the quiet medium of time" | Yes | "through the calm distance of time" |
| "I was unconscious of folly at the instant" | Yes | "At the moment, I was unaware of my own folly" |

**Ambivalence left unresolved:** Yes. The corrected paragraph ends on the retrospective
admission of unrecognized folly, not on a decision. Jane is neither refusing nor consenting
at this point — she is *hard pressed* and tempted. That is exactly the source's state.

**Bonus fix inside the same paragraph:** the pre-repair text listed "zealots or despots",
silently dropping the source's middle term. The corrected text restores "zealots, aspirants,
or despots". Minor, in-scope, and an improvement.

**Assessment: CONFIRMED.** The temptation and ambivalence are genuinely restored; the
principle/judgment distinction is correct and ungarbled; the self-criticism is present.

---

## 3. Continuity read, paragraphs 82–85

- **82** — St. John's appeal: two weeks to reflect, "Repent—decide, while there's still time."
  Pressure applied, decision left open.
- **83 (repaired)** — His hand on her head; reverence; **temptation to stop struggling and be
  swept into his will**; the retrospective "I was a fool both times."
- **84 (untouched)** — "I stood motionless under my guide's touch. My refusals were
  forgotten—my fears overcome—my resistance paralyzed. The impossible—my marriage to St.
  John—was rapidly becoming possible."
- **85 (untouched)** — "I could resist St. John's anger. But I grew soft as a reed under his
  kindness."

The transition now works. Pre-repair, paragraph 83 ended on "I would not give him my hand"
and paragraph 84 opened with refusals forgotten and resistance paralyzed — a hard,
unbridged contradiction. Post-repair the arc is continuous: reverence → temptation to
surrender → paralysis of resistance → the impossible becoming possible → yielding to
gentleness where she could resist wrath. Paragraph 84's "My refusals were forgotten" now has
an antecedent (the temptation in 83) instead of contradicting one. Paragraph 86's "I could
decide if I were only sure... I could vow to do it here and now" is also no longer
unmotivated.

---

## 4. New issues introduced by the repair

None material. Two stylistic observations, neither a fidelity error:

1. **Tense parallelism, minor.** Source uses past perfect for both halves: "To have yielded
   then... to have yielded now would have been..." The corrected text shifts the second
   half to present: "to yield now would be an error of judgment." This slightly reduces the
   symmetry of the two clauses but is arguably clearer for a modern reader, and the
   *assignment* of each error type is untouched. Not worth another pass.
2. **Colon split, minor.** Source joins the retrospective judgment to the admission with a
   colon ("...through the quiet medium of time: I was unconscious of folly at the instant").
   The corrected text splits into two sentences. "At the moment" carries the contrast, so
   the sense survives.

No garbled restructuring, no lost clause, nothing reading worse than source.

---

## 5. Pre-existing defects found during the continuity read (OUT OF SCOPE — not caused by this repair)

Both paragraphs below are byte-identical between `ch35-current-modern-en.json` and
`ch35-corrected.json`, i.e. the drafter did not touch them. Flagging for a separate pass:

- **Paragraph 80 — invented content / dropped source content.** Source ends: "He felt the
  greatness and goodness of his purpose so sincerely: others who heard him plead for it,
  could not but feel it too." The modern-en instead ends with invented interiority: "Was this
  prayer for me? Was I the one being prayed for? A shiver ran through me." Also drops "He
  asked, he urged, he claimed" and rewrites "I wondered at his; then... I was touched by it,
  and at last awed" into a different emotional sequence ("I was moved... I felt troubled").
  This is fabrication in the same family as the paragraph-83 defect.
- **Paragraph 87 — truncation.** The modern-en drops the source's final sentence entirely:
  "I was excited more than I had ever been; and whether what followed was the effect of
  excitement the reader shall judge." This is a load-bearing line — it is Brontë's explicit
  framing of the supernatural call that follows, and its loss removes the narrator's hedge
  about the voice Jane is about to hear. It also slightly garbles "before which clouds yet
  rolled" into "behind which something still churned."

Word-count screen against source (paragraphs ≥25 source words rendering under 75% of source
length) also flags indices **3, 6, 9, 40, 75** for a compression check. Paragraph 83 is not
flagged — the repaired paragraph is at full length.

---

## 6. Final verdict

**Ready to accept.** `ch35-corrected.json` may replace the chapter-35 block in
`jane-eyre-modern-en.json`. Exactly one paragraph changed, the change is faithful to source,
it removes a meaning inversion and its downstream contradiction, and it introduces no new
error. No further correction pass is needed *for paragraph 83*.

Recommend a follow-up scoped to paragraphs 80 and 87 (and a compression check on 3, 6, 9,
40, 75) as separate work.
