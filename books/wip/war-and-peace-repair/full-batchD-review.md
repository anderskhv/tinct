# Batch D — Independent Adversarial Review

Reviewer: independent pass (not the drafting agent).
Scope: 20 chapters — 81–87, 89–93, 95–101, 103 (88, 94, 102 excluded by design).
Method: (1) mechanical diff of `corrected` vs `current`; (2) verification of both claimed
fixes against `full-batchD-source.json`; (3) full paragraph-by-paragraph read of all 20
chapters against source, independently of the drafter's notes; (4) mechanical screens for
digit drift, proper-noun loss, paragraph-length collapse and intra-paragraph sentence drops.

Files:
- Source: `full-batchD-source.json`
- Corrected: `full-batchD-corrected.json`
- Pre-fix: `full-batchD-current-modern-en.json`
- Drafter's notes: `full-batchD-notes.md`

---

## 1. Confirmed diff set

Chapter numbers are identical across all three files (81, 82, 83, 84, 85, 86, 87, 89, 90,
91, 92, 93, 95, 96, 97, 98, 99, 100, 101, 103). Paragraph counts in `corrected` match
`source` exactly in all 20 chapters (script-verified; zero mismatches).

`corrected` differs from `current` in **exactly two paragraphs, in exactly two chapters**:

| Chapter | Paragraph index | Change |
|---|---|---|
| 86 | 37 | `serfs` → `slaves` (one word) |
| 103 | 7 | final clause replaced (see below) |

No other chapter, title, or paragraph changed. No paragraph was added, removed, split,
merged or reordered. **The drafter's claim of "2 fixes, nothing else touched" is accurate.**

---

## 2. Verification of both fixes against source

### Chapter 86, paragraph 37 — "slaves"

Source (Maude), exact wording:

> "Have you ever thought of your tens of thousands of **slaves**?"

Pre-fix candidate: "…your tens of thousands of **serfs**?"
Corrected: "…your tens of thousands of **slaves**?"

**Verified correct.** "slaves" is the source's word at this point, and it is the only
occurrence of "slave*" in the source text for this chapter. The drafter's reading of it as
deliberate rhetorical escalation inside the Mason's rebuke is sound — the surrounding
argument ("You have profited by their labor to lead a dissolute life") depends on the harsher
term. The rest of the paragraph was left untouched and was already faithful.

### Chapter 103, paragraph 7 — courtiers' initial cold reception

Source (Maude), exact wording:

> "…so that the latter knew his face, and all those at court, **far from cold-shouldering him
> as at first when they considered him a newcomer**, would now have been surprised had he
> been absent."

Pre-fix candidate ended: "…and everyone at court would have been surprised if he had been
absent, **rather than noticing his presence**."

Corrected: "…and everyone at court, **far from giving him the cold shoulder as they had at
first when they considered him a newcomer**, would now have been surprised had he been
absent."

**Verified correct.** The pre-fix text did drop a real biographical claim (that courtiers
initially snubbed Boris as a newcomer) and did substitute an invented, non-equivalent tag
("rather than noticing his presence") that has no counterpart in the source. The restoration
is accurate in sense and placement, and the rest of the long paragraph — the raft, the French
Guards, the tavern, the watch, the "one hour and fifty-three minutes" — is faithful and
unchanged.

Sole nit, not a defect: corrected reads "the sovereign knew his face" where source has "the
latter knew his face." Same referent (Alexander); acceptable.

---

## 3. Independent findings, all 20 chapters

Mechanical screens run over all 700+ paragraph pairs: digit sets (all match apart from
verbal-vs-numeral rendering, e.g. "the 4th" → "the fourth" in ch93 p6 — not a defect);
proper-noun retention (all names present; residual flags were curly-apostrophe artifacts);
paragraph length (no paragraph below 65% of source length at ≥20 words); intra-paragraph
sentence collapse (single flag, ch101 p11, benign merge with content intact).

### Chapters confirmed sound on my own read

**81, 82, 83, 84, 85, 87, 89, 90, 91, 92, 93, 96, 98, 99, 100, 101** — read in full against
source. All plot beats, sums (800 / 1,600 / 43,000 / 21 rubles / 2,000 / 10,000 / two thousand
for five years), names, dates (26 Feb 1807, 13 June, 24 June, 1 May), places (Torzhok,
Sokolniki, Olmütz, Glogau, Pultusk, Preussisch-Eylau, Bartenstein, Korchevo, Yukhnovo,
Molliten, Bogucharovo, Bald Hills, Tilsit, Niemen) and dialogue preserved. Specifically
re-checked and clean: Bilibin's satirical letter (ch93 p1–11 — Buxhöwden, Bennigsen, the
field marshal's order of the day, the saddle sore, the burnt bridges, the marauders, the
stolen portmanteau/dressing gown, the "shoot half the army" closer, all intact); the Masonic
initiation (ch87 — skull, coffin, Gospel, seven virtues, the Rhetor's catechism, all intact);
the hospital scene (ch101 — the flippant doctor, the typhus boast, the Cossack begging for
water, the amputee, the young soldier dead since morning, "we're men, not dogs" — rendered
in full with no softening); Denisov and the seized transport (ch100 — all intact).

### Chapters where I found defects the first pass missed

**D1 — Chapter 97, paragraph 44. Dropped clause + dropped gesture. Severity: MINOR (genuine
omission, same class as the ch103 defect the drafter did fix).**

Source:

> "Master, what have you said? God forgive you!" **And she crossed herself. "Lord forgive
> him!** My dear, what does it mean?…" she asked, turning to Princess Mary.

Corrected (unchanged from pre-fix):

> "Sir, what have you said? God forgive you! My dear, what does it mean?" she asked, turning
> to Princess Mary.

Lost: the narrative gesture "And she crossed herself" and the separate exclamation "Lord
forgive him!". This is Pelageya's most characteristic moment — the reflexive sign of the cross
is exactly the piety Pierre has just offended, and the shift from "God forgive **you**" (to
Pierre) to "Lord forgive **him**" (to God, about Pierre) is a real beat. Its removal also
silently welds two separate speeches into one. Note that ch97 is one of the chapters the
drafter explicitly claims to have read closely and declared sound.

Recommended fix (restore in place, no other change to the paragraph):

> …"Sir, what have you said? God forgive you!" And she crossed herself. "Lord forgive him!
> My dear, what does it mean?" she asked, turning to Princess Mary. …

**D2 — Chapter 95, paragraph 53. Dropped emphatic repetition. Severity: MINOR (rhetorical
flattening, no factual loss).**

Source:

> "I have promised myself not to serve again in the active Russian army. **And I won't**—not
> even if Bonaparte were here at Smolénsk threatening Bald Hills—**even then I wouldn't serve
> in the Russian army!**"

Corrected: "I've promised myself never to serve in the active Russian army again. Not even if
Bonaparte were here at Smolensk, threatening Bald Hills."

The closing repetition is dropped entirely. Tolstoy's doubling is deliberate — it is the
strongest statement of Andrew's post-Austerlitz refusal, and the Smolensk/Bald Hills clause is
a load-bearing piece of foreshadowing that the repetition drives home. This is the same defect
class as the ch86 "slaves" softening: no fact lost, but the rhetorical force is blunted.

**D3 — Chapters 97 and 103. Orphaned/duplicated footnote paragraphs. Severity: MINOR
(reader-facing artifact; also an internal inconsistency within this same batch).**

The source carries inline French with starred footnote paragraphs holding the English gloss.
Within batch D the candidate handles this two different ways:

- **ch85 p13/14, ch90 p16/17** — French kept inline, footnote paragraph kept. Correct; the
  footnote does its job.
- **ch97 p11/12, p14/16, p15/17, p19/20, p46/47 and ch103 p13/14** — the French is translated
  to English *inline*, but the footnote paragraph (which is the same gloss) is still kept as
  its own paragraph. The reader therefore sees the same sentence twice in a row, e.g.:

  > "Delighted to see you. I'm very glad to see you," she said to Pierre…
  > "Delighted to see you. I am very glad to see you."

  and

  > "…I'll be with you in a moment," he said, answering someone who called him.
  > "In a minute I shall be at your disposal."

Six instances (five in ch97, one in ch103). No content is lost, and paragraph counts are
preserved, so this does not break alignment — but it reads as a stutter, and the policy is
inconsistent with ch85/ch90 two chapters earlier. The drafter's notes dismiss this class
("mirror the source's own footnote formatting and are not a defect"); that is true only where
the French was kept, which is not the case in ch97/ch103. Fixing it means choosing one policy:
either restore the French inline in ch97/ch103, or convert the orphaned footnote paragraphs
into something non-duplicative. Either way it is an alignment-safe, paragraph-count-preserving
edit.

### Low-level observations (not defects; recorded so a later pass does not re-litigate them)

- **ch92 p1** — "was pedantic in the fulfillment of his duties, severe to cruel with his
  subordinates" is compressed into a single trait ("meticulous to the point of tyranny with
  his subordinates"). Two distinct characterizations collapse into one. Borderline; below the
  fix threshold.
- **ch86 p50** — "brotherhood of men united in the aim of supporting one another in the path
  of virtue" → "united in the pursuit of virtue" drops the mutual-support element, which is
  the specifically Masonic part of Pierre's conception. Borderline.
- **ch87 p46–48** — the Rhetor's "chief passion" is rendered "chief weakness" throughout the
  exchange. Pierre's answer ("Women") still lands, but "passion" is the ritual term. Stylistic.
- **ch101 p32** — the orderly answers "complacently" in source, "with gusto" in candidate; the
  smug non-compliance still reads because "but not moving" is preserved. Stylistic.
- **ch100 p1** — "four feet eight inches deep" → "nearly five feet deep". Acceptable rounding.
- **ch100 p10** — "sváyka" → "a throwing game". Acceptable modernization (glossed, not dropped).
- **Denisov's lisp** — the candidate de-lisps Denisov almost everywhere (ch99 p17, ch100 p4,
  p20, p24, p25, p31, p33), keeping it only at ch83 p12 and ch84 p44. This is **edition-wide
  policy, not a batch-D defect**: a grep over `modern-en-name-normalized.json` (all 365
  chapters) finds zero `wobbewy`/`thwash`/`Empewo` and only 5 residual `vewy`. Flagging it
  here so it is decided once, globally, rather than patched chapter by chapter — but it is out
  of scope for this batch.

---

## 4. Verdict

**The drafting pass is verified on what it claimed, and incomplete on what it did not.**

- Diff set is exactly as claimed: ch86 and ch103, one paragraph each, nothing else touched. ✅
- Both fixes are genuine, correct against the Maude source, and correctly scoped. ✅
- Paragraph alignment is intact in all 20 chapters. ✅
- **"18 of 20 chapters sound" does not hold.** Chapter 97 contains a genuine dropped clause
  and gesture (D1) of the same kind the drafter caught in ch103 — and ch97 is a chapter the
  notes single out as closely checked. Chapter 95 contains a dropped emphatic repetition (D2).
  Chapters 97 and 103 carry six orphaned/duplicated footnote paragraphs (D3).

Corrected count: **17 of 20 chapters clean; 3 chapters (95, 97, 103) still need work**, plus
the two already-applied fixes standing.

**Recommendation: do not accept batch D as final.** Apply D1 (required — it is a content
omission), D2 (recommended), and D3 (recommended, and settle the French/footnote policy for
the whole edition while doing it). All three are in-paragraph edits that preserve paragraph
counts and alignment. Re-run the diff after the fixes and confirm the change set is exactly
ch95 p53, ch97 p44, ch97 p12/16/17/20/47 and ch103 p13/14 before promoting to `accepted`.
