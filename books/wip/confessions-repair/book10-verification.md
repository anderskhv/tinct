# Book 10 — Independent Verification of Corrections

Verifier: independent (did not draft, did not write either review). Re-derived everything from
`book10-source.json` (Pusey 1838, 70 paragraphs, locked ground truth).

Files:
- Source: `book10-source.json`
- Original candidate: `book10-candidate.json` — sha256 `3c37ac38119e956c7b61dede2a39086c35c2a20dfa7813b4aa60ba12f6026795`
- Corrected candidate: `book10-corrected.json` — sha256 `1d3d1861f3b0fe2993f6163c087a5c3b62ba09e60df8c1f39ca4cbea25df3165`

Indices throughout are **0-based** (JSON array positions), matching part 2's convention.
The drafter's log uses the same 0-based numbering, so "paragraph 58" in the log = IDX 58 here.

---

## 1. True diff set (independently derived)

Computed by loading both JSON files and comparing paragraph strings element-wise:

```
[3, 9, 12, 13, 14, 17, 18, 25, 29, 31, 32, 37, 38, 40, 43, 46, 47, 49,
 51, 52, 53, 55, 58, 59, 60, 62, 65, 67, 68]   — 29 paragraphs
```

**This matches the orchestrator's set exactly. Confirmed, no correction needed.**

All 41 other paragraphs are **byte-identical** to the original candidate (that is precisely what
the element-wise comparison establishes: any paragraph not in the set compared equal as a string).
No collateral edits, no whitespace drift, no reflow. Top-level structure is also unchanged:
`{number: 10, title: "Book 10", paragraphs: [...]}`, 70 entries in source, candidate and corrected.

Every changed paragraph corresponds to at least one filed finding. **No paragraph without a
confirmed finding was touched**, which I verified by cross-referencing the diff set against the two
reviews: 3, 9, 12, 13, 14, 17, 18, 25, 29, 31, 32 are part 1's finding paragraphs (minus ¶8, declined);
37, 38, 40, 43, 46, 47, 49, 51, 52, 53, 55, 58, 59, 60, 62, 65, 67, 68 are part 2's (minus 45, 63, 69, declined).

---

## 2. The MAJOR — IDX 58 (F-19), direction inversion

**Source (locked):**
> "…he also is praised, **while Thou dispraisest**; better is he who praised than he who is praised."

**Original candidate:**
> "…he too is being praised **while you are being slighted**; and better is the one who gave the praise than the one who received it."

**Corrected:**
> "…he too is praised **while you find fault with him**; and better is the one who gave the praise than the one who received it."

| Check | Result |
|---|---|
| God is the **agent** of the adverse judgment, not the patient | **CONFIRMED.** "you find fault with him" — God is subject, the man is object. |
| God is no longer the one disapproved of / slighted | **CONFIRMED.** "being slighted" is gone entirely; no passive construction remains. |
| The clash-of-two-verdicts structure restored | **CONFIRMED.** Human praise and divine fault-finding now land on the same man at the same moment, which is what makes the following clause ("better is the one who gave the praise") follow. |
| Consistency with the paragraph's earlier correct clause | **CONFIRMED and strengthened.** The earlier sentence reads "Whoever wants to be praised by men **when you find fault** will not be defended by men when you judge, nor delivered when you condemn." The correction uses the **identical verb phrase**, so the two sentences now read as the deliberate parallel Augustine builds. No contradiction; the repair actively creates the echo that the original candidate broke. |
| Passive "is being praised" → "is praised" | Also corrected, matching source's simple present and the parallel with the earlier clause. |

Also verified within IDX 58 that the correction did not disturb the four passages part 2 had
certified correct: "a joy in it that is no true joy at all" (still a flat denial), "not for your
sake but in your place" (the *for-God's-sake vs. in-God's-stead* distinction intact), "not through
the bonds of love but through the bonds of punishment", and the unswapped closing pair (praiser
delights in God's gift in a man; the praised man prefers the gift of man). All four survive intact.

---

## 3. The ten MODERATES

| # | IDX | Finding | Source | Corrected text | Verdict |
|---|---|---|---|---|---|
| 1 | 18 | part 1 — numbers contrast self-contradictory | "I have perceived also the numbers of the things with which we number all the senses of my body; but those numbers wherewith we number are different, nor are they the images of these, and therefore they indeed are." | "I have also perceived, **through all the senses of my body, the numbers of the things we count**; but **the numbers by which we count are different**, and they are not images of **those**, and therefore **they truly are**." | **CONFIRMED.** The two sides of the contrast are now distinct terms: (a) numbers *of* sensed things, reached via the body; (b) numbers *by which we count*. The sentence no longer says X differs from X. The added "in their own right" is gone; "therefore they truly are" restores source's bare ontological claim. |
| 2 | 29 | part 1 — altered conditional + wrong referent | "…nor wish to be **the like**, unless they were **thus delighted**" | "…nor would they wish to be like **them** unless **they were so delighted**" | **CONFIRMED on both counts.** Referent: "like it" (eloquence) → "like them" (the eloquent men) ✓. Conditional: the invented "unless that delight came from something within" (which merely restated the first conjunct) is replaced by source's actual condition, delight. The two-step chain — inward knowledge → delight → wish to be like them — is restored as two steps. |
| 3 | 43 | F-07 — self-accusation softened | "In this uncertainty the unhappy soul **rejoiceth**" | "In this uncertainty my unhappy soul **rejoices**" | **CONFIRMED.** "takes a kind of comfort" is gone. The soul is an accomplice delighting in its own cover, not a sufferer. |
| 4 | 46 | F-11 — referent narrowed, breaks the "because" | "because Thine eyes have seen **that of Him** which is imperfect" | "because your eyes have seen **what in him is still imperfect**" | **CONFIRMED.** Restored to the body of Christ, not Augustine personally, so the "because" again explains why he can be numbered among the body's *weak members*. |
| 5 | 53 | F-17 — triad naming | "that **concupiscence of the flesh** which consisteth in the delight of all senses" | "besides the **lust of the flesh**, which lies in the delight of every sense" | **CONFIRMED.** Now matches the candidate's own "lust of the flesh" at IDX 40 and 50, so the reader sees IDX 53 contrasting the new temptation with the *same named* category. |
| 6 | 59 | F-17 — triad naming | "all of **the three concupiscences**" | "all three of **these lusts**" | **CONFIRMED.** |
| 7 | 65 | F-17 — triad naming | "in that **threefold concupiscence**" | "in that **threefold lust**" | **CONFIRMED.** The book's structural summary now names the triad it summarizes. |
| 8 | 58 | F-20 — exclamation flattened | "A miserable life this and a foul boastfulness**!**" | "A miserable life this, and a **foul** kind of boasting**!**" | **CONFIRMED on all three sub-points.** Exclamation restored; "shameless" → "foul" (disgust, not impropriety); the flat declarative frame "This is a miserable life" → source's appositive recoil "A miserable life this". |
| 9 | 62 | F-23 — hedge "truly" | "for it doth not contemn when it glorieth" | "for **in the act of boasting it is not despising empty glory**" | **CONFIRMED.** "truly" is gone; the denial is absolute again. |
| 10 | 62 | F-24 — wrong object of "despise" | (source has no object; the thing not despised is vainglory) | "…it is not despising **empty glory**" | **CONFIRMED.** The incoherent "does not despise what it boasts of" (= does not despise its own contempt) is replaced with the correct target, vainglory, and "in the act of boasting" carries source's *when it glorieth* temporal force. |
| 11 | 65 | F-26 — not-X-but-Y parses backwards | "would **not indeed forego Thee**, but would **with Thee possess a lie**" | "**did not want to lose you — I wanted to possess a lie along with you**" | **CONFIRMED.** Repunctuated with an em-dash so the default reading is greed (keep God *and* a lie), not renunciation. The next sentence ("So then I lost you, because you do not allow yourself to be possessed together with a lie") now follows instead of contradicting. |

Note: the task brief lists ten moderates; the reviews actually filed twelve moderate *findings*
(part 1: 2; part 2: 8, with F-17 spanning three paragraphs). Counted as the brief does — 58 as one,
62 as two, 53/59/65 as one — that is **10 of 10 confirmed fixed**. Counted per paragraph-edit,
all twelve sites are repaired. Either way: **no moderate is outstanding.**

---

## 4. Minor spot-check

27 of the 31 filed minors were applied; 4 were declined. I checked each applied one against source.

**Part 1 (9 applied, 1 declined):**

| IDX | Source | Corrected | OK |
|---|---|---|---|
| 3 | "that Thou mightest **bless** me in Thee" | "so that you might **bless** me in you" | ✓ ("make me happy" removed; no longer pre-echoes the ¶28 happy-life vocabulary) |
| 9 | `"**They** are a mass; a mass is less in a part thereof…"` | `"**They** are a mass, and a mass is smaller in a part of itself…"` | ✓ (third person restored inside the quotation; nature reports about the bodies, they do not speak for themselves) |
| 12 | "hot or cold; **or rugged**; heavy or light" | "hot or cold, **or rough**, heavy or light" | ✓ (unpaired "or smooth" removed, matching source's asymmetry) |
| 13 | "images of things **so many and so great**" | "images of **things so many and so great**" | ✓ (both coordinate attributes restored) |
| 14 | "and **pass themselves by**; nor wonder that when I spake of all these things" | "and they **pass themselves by**; nor are they amazed that when I spoke of all these things" | ✓ (redundant "without wondering" removed; added "just now" removed) |
| 17 | "not what is collected **any how**" | "not whatever is gathered **in just any way**" | ✓ (manner, not place) |
| 25 | "arrive at Thee, **whence** Thou mayest be arrived at" | "reach you **by the way in which** you can be reached" | ✓ (means, not an appositive naming God as the means; both limbs corrected) |
| 31 | "Yet is not their will turned away from some semblance of joy." | "Yet their will is not turned away from some semblance of joy." | ✓ ("entirely" removed; flat claim restored) |
| 32 | "than **that which** they so faintly remember" | "than **that which** they so faintly remember" | ✓ (supplied referent "the truth" removed) |
| 8 | — | unchanged | Declined; the review itself proposed "leave as is, or…". Legitimate. |

**Part 2 (18 applied, 3 declined):** all verified against source. Highlights:

- IDX 37: "so ancient and so new**!** Too late I loved you!" (F-03, two hammer-blows restored);
  "You were with me, **but** I was not with you" (F-01, adversative restored);
  "I **panted** for you" (F-02, tense made consistent with "I tasted").
- IDX 38: "Woe is me**!** Look**!** I do not hide my wounds" (F-04 — source has two `!` here, both restored);
  "and **for fear that** it may shatter endurance" (F-05, fear-clause restored, not asserted causation).
- IDX 40/46: "**sex outside marriage**" in both (F-06 — the IDX 46 back-reference "as I could of
  concubinage" now points at the same phrase the reader saw at IDX 40). Verified: "illicit sex"
  appears nowhere in the corrected file.
- IDX 43: "what I say I am doing — **or mean to be doing** —" (F-08, intention not belief);
  "no settled **counsel in this matter**" (F-09, "policy" removed).
- IDX 47: "could **in the same way** be changed" (F-12, probability claim removed).
- IDX 49: "the proven benefit **of the practice**" (F-13, antecedent disambiguated away from pleasure).
- IDX 51: "**Tobias**" (F-14, source proper noun restored); "for they **are caught**" (F-15, "constantly" removed).
- IDX 52: "**but** not their rule for using them" (F-16 — "rightly" removed; the flat denial is a denial again).
- IDX 55: "far from me**,** so may it be pushed ever further" (F-18, "now" removed).
- IDX 59: "how **much further** I have been cleansed" (F-21, comparative restored — the paragraph is about *progress*).
- IDX 60: "troubled by this **misery** of mine" (F-22 — *miseria* no longer collapsed into the
  file's standing rendering of *infirmitas*; verified "weakness" still renders *infirmity* at IDX 57, 68, 69).
- IDX 62: "excellence **of our own**" (F-30, the confessing "I" is implicated again).
- IDX 67: "he was a **Mediator**" (F-27). Verified file-wide: IDX 66 (false mediator) now has 4×
  lowercase and IDX 67 has 3× capitalized — **exactly matching source's casing in both paragraphs.**
- IDX 68: "making us **your sons instead of servants**" (F-28, "to you" no longer attaches to "servants").

**Declined (4), all with reviewer sanction:**

| IDX | Finding | Reviewer's own position | Assessment |
|---|---|---|---|
| 8 | added "that I love"; Pusey's soul/body ordering | "leave as is, or…" / explicitly "no change recommended" | Legitimate decline. |
| 45 | F-10, "John the Baptist" supplied for source's unstated subject | "No objection if accepted knowingly." | Legitimate — but it is now a **knowing, logged** addition to the locked source. Recorded here so it is on the record for the accepted file. |
| 63 | F-25, "if they credit them to you" paraphrase | "No change needed." | Legitimate decline. |
| 69 | F-29, present "I long" for source's past "desired" | "could be accepted deliberately" | Legitimate decline. |

One reviewer *preference* (not a defect) was also not taken: "empty glory" was kept rather than
switched to "vainglory" at IDX 62. Part 2 explicitly labelled this "a preference call, not a
defect." Not an outstanding issue.

### The pride/confession paradox (IDX 62) — dedicated check

Full corrected paragraph:

> "Yet the word that comes out of the mouth, and deeds known to men, carry with them a most
> dangerous temptation through the love of praise, which, in order to build up some excellence **of
> our own**, courts and collects the votes of men. It tempts even when it is rebuked by myself in
> myself, on the very ground that it is rebuked, and it often boasts more emptily of the very
> contempt of empty glory — and so it is no longer contempt of empty glory that it boasts of, **for
> in the act of boasting it is not despising empty glory.**"

- **Three-beat self-cancelling loop intact and in order:** (1) the temptation feeds on the very act
  of being rebuked; (2) it boasts of despising boasting; (3) therefore what it boasts of is not
  contempt at all. ✓
- **Not flattened into false confidence.** Nothing was added along the lines of "and so, having
  noticed it, I am safe." The paragraph ends on the contradiction, mid-loop. ✓
- **Not flattened into false despair.** No "therefore all confession is pride" verdict was
  inserted. ✓
- **The hedge is gone.** "does not *truly* despise" had opened a half-despising gap; "in the act of
  boasting it is not despising empty glory" is the absolute denial Pusey's "it doth not contemn when
  it glorieth" states. The correction made the paradox *sharper*, not softer. ✓
- **No resolution supplied at the seam.** IDX 63 still opens on a *different* vanity ("Within, too —
  within is another evil"), exactly as source does, rather than closing the loop. ✓
- **"our own" restores the implication of the confessing I.** With "its own", the love of praise was
  a freestanding agent with its own agenda; "our own" puts Augustine inside the indictment — which
  is what makes the next sentence's "rebuked by myself in myself" bite. ✓

**Verdict: the paradox is genuinely unresolved, and is more unsparing after correction than before.**

---

## 5. Mechanical gates (all re-run independently on `book10-corrected.json`)

| Gate | Result |
|---|---|
| Valid JSON | **PASS** (`json.tool` clean; loads without error) |
| Paragraph count | **PASS** — 70 source / 70 corrected, one-to-one, all non-empty strings |
| Top-level keys | **PASS** — `number` = 10, `title` = "Book 10", identical to source and candidate |
| Question-mark parity, per paragraph | **PASS — 132 / 132, zero mismatching paragraphs across all 70.** Counted per-paragraph, not just in aggregate. |
| **Exclamation-mark parity, per paragraph** | **PASS — 19 / 19, zero mismatching paragraphs.** Was 15/19 in the original candidate with mismatches at IDX 37, 38, 58 — the three the bonus finding named. All three now match, and no other paragraph regressed. (Part 2 counted 16 in its 35–69 range; the file-wide figure of 19 adds three in 0–34 that already matched.) |
| Archaisms | **PASS** — zero hits for `thee\|thou\|thy\|thine\|hath\|doth\|saith\|unto\|whilst\|betwixt\|yea\|nay\|wilt\|dost\|shalt\|perchance\|fain\|divers\|slothful\|ere\|whereof\|thither\|verily\|wert\|oft` |
| Single-quote-as-quotation-mark | **PASS** — zero. Every `'` in the file is an intra-word apostrophe. |
| Curly quotes (U+2018/19/201C/201D) | **PASS** — zero occurrences |
| Double-quote balance | **PASS** — even count of `"` in every one of the 70 paragraphs; 90 total |
| Compression check | **PASS** — corrected/source word-count ratio, min 1.00 (IDX 1), max 1.21 (IDX 37); changed paragraphs range 1.03–1.21. No paragraph compressed below source; no runaway expansion. |
| Triad naming consistency | **PASS** — source's six `concupiscence` sites: 41, 43, 46 render as freestanding "desire" (reviewer-approved); 53, 59, 65 now render as "lust of the flesh" / "these lusts" / "threefold lust". "lust of the eyes" at 40, 53 matches source. |
| Proper nouns | **PASS** — "Tobias" restored at IDX 51; "Tobit" appears nowhere. Mediator capitalization matches source exactly in both IDX 66 (4× lower) and IDX 67 (3× upper). |

---

## 6. Flow, tone, and seam check around the changed paragraphs

I read each changed paragraph with its neighbours (and 57–68 continuously, since that stretch
carries nine of the twenty-nine edits and the book's two hardest passages).

**No new seams.** Every correction is a within-sentence substitution or repunctuation; none
required a new connective, none leaves a rhythm break. The two largest edits are IDX 18 (the
numbers clause, rebuilt) and IDX 65 (the em-dash repunctuation), and both read as single periods
rather than as patches:

- IDX 18: "I have also perceived, through all the senses of my body, the numbers of the things we
  count; but the numbers by which we count are different…" — the appositive now sits where Pusey's
  does, and the semicolon carries the contrast. The paragraph that previously stopped a reader dead
  now runs, and runs the way source runs.
- IDX 65: "…did not want to lose you — I wanted to possess a lie along with you — just as no one
  wants to speak falsely…" — the dash pair is consistent with the file's established em-dash habit,
  and the following sentence ("So then I lost you, because you do not allow yourself to be possessed
  together with a lie") now lands as the consequence it is.

**No flattening; the unsparing tone is measurably restored, not merely preserved.** Part 2 named
three places where the edge was dulling. All three are sharpened:

1. IDX 43 — "takes a kind of comfort" → "**rejoices**". The soul is complicit again.
2. IDX 58 — "This is a miserable life, and a shameless kind of boasting." → "**A miserable life
   this, and a foul kind of boasting!**" A recoil, not a classification.
3. IDX 62 — "does not truly despise" → "**is not despising empty glory**". No gap left.

Add to these the restored exclamations at IDX 37 ("so ancient and so new! Too late I loved you!")
and IDX 38 ("Woe is me! Look!"), the restored comparative at IDX 59 ("how much further"), the
restored "misery" at IDX 60, and the restored "of our own" at IDX 62 — and the direction of the
whole correction pass is consistently *toward* Augustine's self-accusation, never away from it.
I found no instance where a correction softened anything.

**No over-correction.** I checked specifically for the opposite failure — corrections that overshoot
into archaism or stiffness. "counsel in this matter" (IDX 43), "by the way in which" (IDX 25) and
"in just any way" (IDX 17) are the three most at risk; all three read as plain modern English, and
the archaism sweep returns zero hits. "A miserable life this, and a foul kind of boasting!" is the
most inverted construction introduced, and it is an exclamatory appositive that modern English
still permits; it matches Pusey's own shape without sounding like Pusey.

**Cross-paragraph consistency after the edits**, spot-checked:
- IDX 58's two "when you find fault" clauses now echo each other deliberately (see §2).
- IDX 40 ↔ 46: "sex outside marriage" in both, so the back-reference works.
- IDX 40/50/53: "lust of the flesh" in all three; IDX 40/53: "lust of the eyes"; IDX 65 summarizes
  as "threefold lust". The triad is now a visible structure across the book, which it was not.
- IDX 66 ↔ 67: lowercase false mediator, capitalized true Mediator — the downgrade at the wrong
  moment is gone.
- IDX 25 ↔ 34: the in-memory / outside-memory axis is untouched by the ¶25 edit (only the "whence"
  clause changed), so the nine-paragraph payoff at IDX 34 still lands.

---

## 7. Drafter's log — independent audit

`book10-corrections-log.md` is accurate. Every edit it claims, I found in the file; every edit I
found in the file, it claims. No undisclosed changes. Its four declines are each backed by the
reviewer's own "optional / no change needed / accept knowingly" language.

One bookkeeping nit, not a content issue: the log's minor section is headed "MINOR (18 applied,
4 declined)" and the summary says "18 of 21", which are part-2 figures applied to a section that
also lists part-1 paragraphs. The true totals across both reviews are **31 minors filed, 27 applied,
4 declined**. The edits themselves are correct; only the tally line is under-counted.

---

## 8. Findings of my own (new, not in either review)

**None material.** I looked specifically for (a) corrections that introduced a new defect, (b)
collateral edits to untouched paragraphs, (c) regressions in parity counts, (d) over-correction into
archaism, and (e) any softening introduced by the repair pass. All five came back clean.

Two items I am recording rather than raising:
1. IDX 45's "John the Baptist" remains a knowing addition to a gap in the locked Pusey text. The
   reviewer sanctioned it; it should be accepted as a deliberate editorial call, on the record.
2. "empty glory" rather than "vainglory" at IDX 62 remains a live style preference. Not a defect.

---

## 9. Verdict

| Category | Filed | Fixed | Declined (with reviewer sanction) | Outstanding |
|---|---|---|---|---|
| Major | 1 | 1 | 0 | **0** |
| Moderate | 10 (12 findings) | 10 (12) | 0 | **0** |
| Minor | 31 | 27 | 4 | **0** |
| Bonus (exclamation parity) | 3 paragraphs | 3 | 0 | **0** |

All mechanical gates pass, including the exclamation-mark gate that the original candidate failed.
The single major direction inversion is genuinely repaired, with God as the agent of the adverse
judgment and the paragraph's internal parallel restored rather than broken. Every moderate is
repaired at the exact clause the review named. The pride/confession paradox is intact and left
unresolved, and is sharper than it was. The diff is confined to flagged paragraphs; the other 41
are byte-identical.

**READY — recommend marking Book 10 "editorially accepted". No further round required.**

Suggested next step: promote `book10-corrected.json` to `book10-accepted.json` on the same basis as
Books 3–6, 8 and 9, and record the two declared editorial calls (IDX 45 "John the Baptist";
"empty glory" at IDX 62) in the accepted-file notes.
