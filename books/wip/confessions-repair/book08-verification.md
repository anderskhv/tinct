# Book 8 — Independent Verification of Corrections

Verifier: independent (did not draft, did not write the original review).
Everything below was re-derived from `book08-source.json` (Pusey, 31 paragraphs) and from
byte-level diffs computed in this session. The drafter's corrections log was read but not
trusted; every claim in it was re-checked.

- Source: `book08-source.json`, 31 paragraphs, key set `{number, title, paragraphs}`.
- Candidate: `book08-candidate.json`, sha256 `50155610c6ac2bf48c8ee5c4b0b0af76ca0b43d209ff8da13d1ff46e9390d946` (matches the hash recorded in the review — the correct base was used).
- Corrected: `book08-corrected.json`, sha256 `55319d3f8939e9e7504eed1e393c0e0a89c86645bb61d9ed5214efd294de6719`, 31 paragraphs, `number: 8`, `title: "Book 8"` (both unchanged from candidate).

---

## 1. True changed-paragraph set

Recomputed independently with an element-wise string comparison of the two `paragraphs` arrays:

```
changed  = [0, 2, 5, 7, 9, 10, 11, 17, 21, 24, 28, 29, 30]   (13 paragraphs)
unchanged= [1, 3, 4, 6, 8, 12, 13, 14, 15, 16, 18, 19, 20, 22, 23, 25, 26, 27]  (18 paragraphs)
13 + 18 = 31. PASS.
```

**The orchestrator's set is confirmed exactly.** The drafter's log claims the same set; confirmed.

Every one of the 18 unchanged paragraphs is **byte-identical** to the original candidate — no
silent collateral edits, no whitespace drift, no re-wrapping. Notably, the review's "no issues"
paragraphs with the highest rewrite temptation (13, 16, 20, 22, 23, 26, 27) are all untouched.

Expected arithmetic: 2 major + 3 moderate + 8 minor-with-text-change = 13 text-bearing findings,
and 1 minor (index 18) was documentation-only. 13 changed paragraphs, one finding each, no
finding spanning two paragraphs and no paragraph carrying two findings except index 10, which
carried two sub-findings from a single review bullet. Consistent.

---

## 2. Majors — both confirmed fixed

| # | Idx | Source (Pusey) | Corrected text | Verdict |
|---|---|---|---|---|
| M1 | 21 | "And therefore are there two wills, **for that one of them is not entire**: and what the one lacketh, the other hath." | "And so there are two wills, **because one of them is not whole and entire** — and what the one lacks, the other has." | **CONFIRMED FIXED** |
| M2 | 30 | "...in a much more precious and purer way **than she erst required, by having grandchildren of my body**." | "...and **far dearer and purer than the joy she had once asked you for, in grandchildren of my body**." | **CONFIRMED FIXED** |

**M1 evidence.** The candidate's "because *neither* one is whole and entire" asserted a universal
deficiency; the source asserts a particular one ("one of them"). The corrected text restores the
particular quantifier, and the following clause "what the one lacks, the other has" now follows
from it instead of contradicting it — under "neither is whole", the asymmetric lack/have clause
was incoherent. I re-read the whole of index 21 against the source: the logical chain leading in
("it does not will entirely; therefore it does not command entirely... if the will were whole and
entire, it would not even need to command itself to exist") now terminates correctly, and the
anti-Manichee premise that indices 22–24 depend on ("not some monstrous split... a disease of the
mind") is intact and unmodified. Word ratio for this paragraph dropped from 1.24 to 1.23 — a
one-word net change, no collateral rewriting.

**M2 evidence.** The Pusey ellipsis is "purer way *than* [the way] she erst required, *by having*
grandchildren". The candidate attached "through grandchildren" to the joy actually given, which
contradicted the clause two sentences earlier in the same paragraph ("so that I no longer sought a
wife or any hope in this world") and, by extension, the entire conversion. The corrected text makes
the grandchildren the *comparandum* — the joy she used to ask for — not the vehicle. Adversarial
re-read for residual ambiguity: the comma before "in grandchildren of my body" binds that phrase to
"the joy she had once asked you for", which is the nearest and only sensible antecedent; the
sentence cannot now be read as the joy arriving via grandchildren. One small note (not a defect):
the source compares *manners* ("in a much more precious and purer way"), the correction compares
*joys*. This is a defensible simplification of an elliptical construction and is the review's own
proposed wording. Accepted.

---

## 3. Moderates — all three confirmed fixed

| # | Idx | Issue | Corrected text | Verdict |
|---|---|---|---|---|
| Mo1 | 29 | "certainty" (epistemic) for Pusey's "serenity" (*securitas*) | "it was as though **a light of peace** had been poured into my heart, and every shadow of doubt melted away" | **CONFIRMED FIXED** |
| Mo2 | 17 | garbled *a fortiori* | "that wisdom, **of which not the finding only but the very search** was worth more than the treasures and kingdoms of the world, even if already found" | **CONFIRMED FIXED** |
| Mo3 | 7 | invented clause + dropped clause | "whenever we hear **with what joy** the sheep that had strayed is carried home on the shepherd's shoulders; and how the lost coin..." | **CONFIRMED FIXED** |

**Mo1, checked against the review's specific worry.** "Peace" is affective/security-register, not
epistemic — it is the correct class of word for *securitas*. Checked for the two failure modes the
task names:

- *Does it contradict the book's stated position?* No. Indices 0, 12 and 18 all assert that
  intellectual certainty was already possessed ("Of your eternal life I was now certain"; "for now
  it was certain"; "well, now it is certain, and that burden still weighs you down"). Those three
  paragraphs are unchanged, and "a light of peace" no longer hands Augustine at the climax the one
  thing he has said three times he already had.
- *Does it duplicate or contradict the neighbouring clause?* No. The sentence now reads
  "a light of peace had been poured into my heart, **and** every shadow of doubt melted away" —
  two distinct contributions (peace supplied; doubt departed) joined by "and". Under "certainty"
  the two halves were partly tautological. The doubt clause itself is byte-unchanged, as the log
  claims; confirmed by diff (the only edit in index 29 is the single word).

**Mo2.** The corrected construction is "not X only, but Y" with Y as the included, surprising term
— matching Pusey's "not the finding only, but the very search". The candidate's em-dash
parenthetical "— not even the finding of it —" read as exclusion. Fixed, and the trailing
"even if already found" (Pusey's "though already found") survives, still attached to the
treasures/kingdoms, as in the source.

**Mo3.** The invented "to the joy of all the angels" is gone; "with what joy" is restored. Checked
that the angels' genuine appearance later in the same paragraph survives — it does, unchanged:
"For you rejoice in us, and in your holy angels, holy through holy love." The beat the source saves
for its close is no longer pre-empted. The semicolon splice after "shoulders" is clean.

---

## 4. Minors — spot-check (8 applied, 1 declined)

Each checked against the source sentence, not against the log.

| Idx | Fix | Source evidence | Verdict |
|---|---|---|---|
| 0 | "reality" → **"substance"** (×2) | "an incorruptible **substance**, whence was all other **substance**" | Applied, correct. Now consistent with index 24's "two opposing substances" and with Books 3–6. |
| 2 | "the man through whose hand" → **"who was father to Ambrose... in his receiving of your grace"** | "the father of Ambrose (a Bishop now) **in receiving Thy grace**" | Applied, correct. Supplied sacramental mechanism removed; source's bare phrasing restored. |
| 5 | "find your way into that man's chest" → **"carry yourself into that man's heart"** | "by what means didst Thou **convey Thyself** into **that breast**?" | Applied, correct. Active verb and devotional register restored; still a question (mark preserved). |
| 9 | "pleasure" → **"joy"** (×2) | "in foul and accursed **joy**; this in permitted and lawful **joy**" | Applied, correct. Corrected now has exactly 3 occurrences of "joy" in this paragraph, matching the source's 3 (two in the list, one in the concluding law). Note: the review's bullet said "all four clauses", but the source has no "joy" in the friendship or dead-and-alive clauses — **the applied fix tracks the source more exactly than the review's own phrasing did.** Correct call. |
| 10 | "his weapons" → **"the vessels"**; doubled intensifier collapsed | "they saw his **vessels** taken from him and **cleansed, and made meet for Thy honour**"; "so much the **more abundantly** ought Thy sons to rejoice" | Applied, correct. The Mark 3:27 / 2 Tim 2:21 image is restored and no longer collides with "that mighty and sharp weapon" (the tongue) earlier in the same sentence. The editing artifact "all the more... all the more abundantly" is gone; reads cleanly now. Trivial residue: source's "**his** vessels" became "**the** vessels"; "taken from him" carries the possessor. Below threshold. |
| 11 | "one old and one new" → **"one new and one old"** | "my two wills, **one new, and the other old, one carnal, the other spiritual**" | Applied, correct. The chiasmus (new↔spiritual) is restored. |
| 24 | "sources" → **"principles"** | "from two **contrary principles**" | Applied, correct. The Manichee triad souls / substances / principles is now uniformly technical. |
| 28 | "offering" → **"sacrifice"** | "the floods of mine eyes gushed out an acceptable **sacrifice** to Thee" | Applied, correct. Psalm 51 word restored; the sentence's force is stronger, not weaker. |
| 18 | **declined — "ten years" kept, emendation documented** | Locked source reads "nor for **often** years and more"; standard Pusey is "ten years" | **Review's own recommendation followed exactly.** The review said: "Recommend: keep 'ten years', note the emendation in the corrections log." The corrected file keeps "who have not spent ten years or more thinking about it" (index 18 is byte-identical to candidate — verified), and the corrections log records the emendation under a dedicated heading. Correct handling: silently propagating the locked file's likely corruption would have been the worse error, and the departure is now on the record rather than invisible. |

No finding was declined that should have been applied; no unrequested edit was made.

---

## 5. Mechanical gates (all re-run from scratch)

| Gate | Result |
|---|---|
| Paragraph count | source 31 / candidate 31 / corrected 31. **PASS** |
| JSON validity | `python3 -m json.tool` clean; key set `{number, title, paragraphs}` identical to candidate. **PASS** |
| Question-mark parity, per paragraph | 0 mismatches across all 31 paragraphs. **PASS** |
| Question-mark totals | source **54** / corrected **54**. **PASS** |
| Archaism scan (thee/thou/thy/thine/hath/hast/doth/dost/wilt/shalt/unto/whence/thereof/wherein/whereby/nay/yea/betwixt/ye/saith/erst/hither/thither) | **zero hits** across all 31 paragraphs. **PASS** |
| Quote balance | every paragraph has an even count of `"`. **PASS** |
| Curly quotes / smart apostrophes | zero occurrences of `“ ” ‘ ’`. Straight quotes throughout, matching `book06-accepted.json`. **PASS** |
| Empty / truncated paragraphs | none under 40 characters. **PASS** |
| Word-count ratio vs source | range 0.984 (index 0) to 1.229 (index 21); no paragraph below 98%. **PASS** |
| Metadata drift | `number` and `title` unchanged from candidate. **PASS** |

Note on the question-mark gate specifically: none of the 13 edits touched a `?`. Index 5's edit is
inside a question and the mark survives; index 21's edit is in a declarative clause after the three
doubled "Where does this monstrous condition come from? And to what end?" pairs, all six marks
intact.

---

## 6. Whole-chapter read (corrected file, 1–31 straight through)

Read end to end, not collated, looking for new seams and for flattening.

**The corrections do not show.** All 13 are word- or clause-level and sit inside sentences whose
rhythm is unchanged. The two most invasive (indices 17 and 30) were the two places where the
candidate's prose already tripped — index 17's em-dash parenthetical was a genuine stumble on a
straight read, and the replacement "of which not the finding only but the very search was worth
more than..." runs smoothly; index 30's final clause no longer makes the reader double back.
Index 10's collapsed "all the more abundantly should your children rejoice" removes the one
visible editing artifact in the book. Net effect: three of the review's "blemishes visible on a
straight read" are gone and no new ones appeared.

**Garden weeping (index 28) — intact at full intensity.** Untouched apart from one word.
"a huge storm rose up in me, bringing with it a huge downpour of tears", the retreat from Alypius,
"the tones of my voice already sounded choked with weeping", "I threw myself down, somehow, under
a certain fig tree", and the closing five questions with the repeated "How long, how long" and
"tomorrow, and tomorrow". The "offering" → "sacrifice" change raises the temperature slightly;
it does not calm anything.

**Two-wills storm and chains imagery — intact.** Index 11 keeps the forged-chain sequence
("out of a perverse will, desire had been made; and desire indulged became habit; and habit not
resisted became necessity... By these links, joined one to another"), and the un-crossing fix
restores the chiasmus without altering the sentence's fall. Index 21's argument now lands on a
conclusion that actually follows. Index 25 ("twisting and turning in my chain", "doubling the
lashes of fear and shame", "I very nearly did it, and did not do it") is byte-unchanged and still
the most physically agitated paragraph in the book. Index 26's mistresses and index 27's
Continence are both untouched; her "persuasive mockery" still taunts rather than consoles.

**Tolle-lege (index 29) — intact, and improved.** The single "peace" substitution is the only edit
in the paragraph. Everything the review verified is still there: the chanting voice with gender
left open, the search of memory, the checking of tears, the Antony precedent quoted in full,
Romans 13:13–14 with all three vice-pairs and both halves of the positive command. With "peace"
in place, the ending now reads as the stilling of a storm rather than the settling of an argument
— which is what the preceding paragraph set up. This is the single largest qualitative gain in the
round.

**Arc.** Unchanged and legible: certain-but-not-steady → Victorinus's shame reversed into boldness
→ why recovered things are loved more → the chain forged link by link → Ponticianus detonating it
→ self-confrontation → the philosophical crisis → the garden. Voice is consistent with accepted
Books 3–6 throughout; nothing was smoothed, no repetition was tidied away, and no paragraph was
rewritten beyond its finding.

---

## 7. Verdict

**READY — Book 8 can be marked "editorially accepted."**

- True diff set confirmed: `[0, 2, 5, 7, 9, 10, 11, 17, 21, 24, 28, 29, 30]`, 13 paragraphs, 18 byte-identical.
- Both majors **confirmed fixed** against source, in the exact clauses the review named.
- All three moderates **confirmed fixed**; the "certainty" → "peace" restoration is affective, not epistemic, and neither duplicates nor contradicts the adjacent doubt clause.
- 8 minors applied and correct against source; the 1 declined minor follows the review's own written recommendation and is documented.
- All mechanical gates pass, including 54/54 question marks with zero per-paragraph mismatches.
- No unrequested edits, no collateral drift, no new seams, no flattening.

**Remaining issues: none blocking.** Two observations recorded for the record, neither requiring
another round:

1. **Index 18, "ten years" (documented emendation).** The corrected file departs from the locked
   source file, which reads "often years". This is almost certainly a source-file corruption and
   the departure is the right call, but it is a knowing divergence from ground truth and should
   travel with the book — the corrections log entry is sufficient. If the repair sequence ever
   re-derives `book08-source.json`, fix "often" → "ten" there.
2. **Index 10, "the vessels" for source's "his vessels".** Sub-threshold; possession is carried by
   "taken from him" in the same clause. No action.

One correction to the drafter's log for accuracy: its section-header arithmetic note ("Matches the
12 text-bearing findings — wait, that's 13") contains a visible self-correction left in the prose.
The arithmetic it lands on (2 + 3 + 8 = 13) is right and matches my independent count; only the
editorial stutter should be tidied if the log is kept as a permanent artifact. Not a content defect.
