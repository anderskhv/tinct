# Jane Eyre — Chapter 37 (Ferndean) — Independent Verification

**Reviewer:** independent (did not draft the repair). Adversarial fidelity check.
**Verdict: NOT READY TO ACCEPT — needs a second correction pass.**

The 28 claimed fixes are all real, correctly targeted, and faithfully restored. Nothing
was broken by the repair. But the drafter's detection method (word-count ratio only) is
structurally blind to *equal-length or longer invention*, and at least 5 paragraphs with
exactly the same defect class as the ones repaired were left untouched. Two of them break
setup/payoff pairs. One drops the chapter's recognition beat and Rochester's full name.

---

## 1. Independently-derived diff set

Loaded all three files (`paragraphs` array, 262/262/262 — count preserved), diffed
`ch37-current-modern-en.json` vs `ch37-corrected.json` byte-wise per paragraph:

```
0, 1, 3, 7, 8, 10, 15, 48, 57, 63, 66, 71, 72, 76, 85, 86, 91, 92, 93,
104, 110, 113, 114, 115, 116, 118, 248, 256
```

**Exactly equal to the drafter's claimed set. No extras, no omissions.** 234 paragraphs
byte-identical. Claim confirmed.

I also independently recomputed every cell of the notes' before/after word-ratio table
(source words, before words, after words, for all 28 rows). **All 28 rows match exactly** —
the table is accurate, not reconstructed from memory.

## 2. My own word-ratio scan

Criterion as specified: source paragraph ≥25 words, modern/source ratio <0.85.

**Post-repair, the only paragraphs still below 0.85 are the 8 the drafter declared
verified-fine** (106, 126, 136, 143, 145, 212, 249, 250). Nothing else in the chapter
falls below threshold after repair.

**Pre-repair, the set below 0.85 was exactly the 28 changed + those same 8** — i.e. the
drafter's candidate list was complete *with respect to their own criterion*, and every
candidate was dispositioned. I also swept source paragraphs of 15–24 words at a stricter
0.75 threshold: **no additional hits.**

**On the ratio criterion alone, the drafter missed nothing.**

### But the ratio criterion is the wrong net

I ran a second scan the drafter did not: per-paragraph lexical overlap in both directions —
*recall* (fraction of source content words surviving into the modern text) and *invention
rate* (fraction of modern content words with no source basis). This catches substitution
damage, where invented text replaces source text at equal or greater length so the ratio
looks healthy.

That scan surfaced a cluster of **untouched** paragraphs with recall and invention profiles
indistinguishable from the ones that were repaired. Several were then confirmed by reading.
Details in §6.

## 3. High-stakes fixes — confirm table

| Para | Claim | Verdict |
|---|---|---|
| 85 | emotional core restored | **CONFIRMED** |
| 118 | "mistress" plot distortion fixed | **CONFIRMED** |
| 10 | continuity bug fixed | **CONFIRMED** |

### Para 85 — CONFIRMED

Source: *"There was no harassing restraint, no repressing of glee and vivacity with him; for
with him I was at perfect ease, because I knew I suited him... Delightful consciousness! It
brought to life and light my whole nature: in his presence I thoroughly lived; and he lived
in mine. Blind as he was, smiles played over his face, joy dawned on his forehead: his
lineaments softened and warmed."*

Pre-repair had substituted the entire back half with one invented, *distancing* sentence:
*"He seemed astonished, even a little overwhelmed, at the rapid change from loneliness to
company, from darkness to warmth."* That inverts the paragraph — Brontë's point is Jane's
own unrestrained aliveness, not Rochester's astonishment.

Corrected: *"There was no strain between us, no holding back my liveliness for his
sake—with him I was completely at ease, because I knew I suited him... It woke my whole
nature into light: in his presence I truly lived, and he lived in mine. Blind as he was,
smiles crossed his face, joy rose on his forehead; his features softened and warmed."*

Faithful clause for clause. The reciprocal "in his presence I truly lived, and he lived in
mine" is intact. Minor note: "Delightful consciousness!" is rendered as the flatter "It was
a wonderful thing to feel." Acceptable modernization, slight loss of exclamatory force.

### Para 118 — CONFIRMED (this was the most serious defect in the chapter)

Source: *"I should have confided in him: **he would never have forced me to be his
mistress.**"*

Pre-repair: *"He swore he would never have forced me to **remain at Thornfield**."* — this
is not a compression, it is a factual rewrite that destroys the plot. Jane did not flee to
avoid *staying*; she fled to avoid becoming a bigamous mistress. The pre-repair text also
invented *"He would have found a way to set things right without separation"* and *"He'd
have been happy to know I was safe, even far away"* — both contradict the source, in which
Rochester's whole complaint is that she left.

Corrected: *"I should have confided in him—he would never have forced me to become his
mistress. Violent as he'd seemed in his despair, he in truth loved me far too well and too
tenderly to make himself my tyrant. He would have given me half his fortune, without asking
so much as a kiss in return, rather than let me throw myself, friendless, on the wide world.
He was certain I had suffered more than I'd admitted to him."*

All three claimed restorations present: "mistress", the half-fortune/without-a-kiss clause,
and the endured-more-than-confessed clause. Correct.

### Para 10 — CONFIRMED

Pre-repair ended: *"He let his hand fall, then turned and **went back inside**."* Para 13
then reads *"He groped his way back to the house and re-entered it"* — Rochester enters
twice. Real continuity bug.

Source ends: *"He relinquished the endeavour, folded his arms, and stood quiet and mute in
the rain... **At this moment John approached him from some quarter.**"*

Corrected ends: *"He gave up the attempt, folded his arms, and stood quiet and silent in the
rain, now falling fast on his bare head. **At this moment John came toward him from somewhere
nearby.**"* Para 11–12 are the John dialogue; para 13 (untouched) is now his single entry.
Bug fixed, and the fix also restores the mutilated-left-arm parenthetical and the
straining-blank-gaze passage the pre-repair text had dropped. Correct.

## 4. Spot-checks of other changed paragraphs (12 read in full against source)

| Para | Result |
|---|---|
| 57 | **Good.** "What, Janet! Are you an independent woman? A rich woman?" restored verbatim in sense; para 58 "Quite rich, sir" now has its question. |
| 63 | **Good.** St. John comparison, the unexpressed-expectation clause, and the critical "I began gently to draw back from his arms—but he caught me and pulled me close again" all restored. |
| 76 | **Good.** "Can you tell when there's a good fire?" restored; also restores "have the hearth swept up", which pre-repair had replaced with an invented "this dead pile of ashes". |
| 86 | **Good.** Full restoration incl. the "Jane" dialogue cue. |
| 91 | **Good.** Months-of-despair account restored: night blurring into day, cold from the unattended fire, hunger from forgotten meals, longing for her return above his lost sight. |
| 92 | **Good.** Scorched-eyebrows detail restored. |
| 93 | **Good.** "gone I don't know where or how, and afterward impossible for me to find" restored. |
| 104 | **Good.** Egg-and-fried-ham callback restored. |
| 110 | **Good.** Quenched-lamp / dependent-on-another-to-relight imagery restored; the invented Pilot business removed. |
| 113 | **Good.** "(and I'm glad it's not naturally a silent one)" restored. |
| 114 | **Good.** Concrete "I wiped them away and busied myself with preparing breakfast" restored; chained-eagle/sparrow simile intact. |
| 115 | **Good.** Dry tree stump, pulled onto his knee, Pilot lying beside them, and the closing "holding me in his arms—" all restored; para 116 outburst now has its physical trigger. |
| 116 | **Good.** Pearl necklace in its box, corded and locked trunks, and "Let me hear it now" restored — which is what para 117 is responding to. |
| 248 | **Good.** "what is it now, when I must give it over to foreign guidance, as a child does its weakness" and the acknowledgment of the hand of God restored. |
| 256 | **Good.** "for those were your accents—as certain as I live—they were yours!" restored; the vague "must have felt it at the same moment" removed. |

No regressions introduced in any changed paragraph. Quality of the restorations is high —
they read as modern English, not as light-touched Victorian.

## 5. The 8 "legitimate tightening, no change needed" calls

Read each clause-by-clause against source.

| Para | Call | My finding |
|---|---|---|
| 106 | fine | **Agree.** "redd up" → "tidied up" etc. Nothing lost. |
| 136 | fine | **Agree.** Raw curate, white neckcloth, thick-soled boots all present. |
| 143 | fine | **Agree.** Apollo/Vulcan contrast fully intact, incl. "blind and lame into the bargain". |
| 145 | fine | **Agree.** Firmer grip, the question or two, the pause — all present. |
| 212 | fine | **Agree.** |
| 249 | fine | **Agree.** Four days, last Monday night, grief-replaces-frenzy, the prayer to be taken. Intact. |
| 126 | **borderline** | The French tag *"'Jeune encore,' as the French say"* is silently dropped — rendered as bare "Still young, then." Book rules require preserving quotations and allusions, and this one characterizes Rochester's register. Also "phlegmatic" flattened to "dull". Lowest recall in the chapter (0.28). Not a plot defect, but it is a quotation loss, not pure tightening. |
| 250 | **DISAGREE — real loss** | Source: *"That I merited all I endured, I acknowledged—**that I could scarcely endure more, I pleaded**; and **the alpha and omega of my heart's wishes broke involuntarily from my lips** in the words—'Jane! Jane! Jane!'"* Corrected: *"I admitted I deserved everything I'd endured. **I could hardly expect mercy.** But I begged for it—urgently. Then I cried out: 'Jane! Jane! Jane!'"* Two problems: (a) "I could scarcely endure *more*" is turned into "I could hardly expect *mercy*" — a different proposition; (b) the *involuntary* breaking-out is made deliberate ("Then I cried out"), which weakens the supernatural-call beat that paras 251–257 depend on. This is substitution, not tightening. |

So **6 of 8 calls correct, 1 borderline (126), 1 wrong (250).**

## 6. NEW DEFECTS THE DRAFTER MISSED

These are untouched paragraphs carrying the *same defect class* the repair was commissioned
to fix. They pass the ratio test because the invented text is as long as, or longer than,
what it replaced.

### P1 — must fix

**Para 6 — recognition beat and Rochester's full name destroyed** (src 49w → 79w, ratio 1.61)
Source: *"Dusk as it was, I had recognised him—**it was my master, Edward Fairfax Rochester,
and no other.**"*
Current/corrected: *"Dark as it was, I recognized his strong shape and features. **I nearly
revealed myself—but I held back. I was not yet ready to meet him. I had still a thing or two
to think through. I needed to prepare myself for the shock—and to prepare him.**"*
Four invented sentences replace the chapter's naming moment. "Edward Fairfax Rochester" — the
only full-name appearance here — is gone. Comparable in severity to para 85.

**Para 9 — kiss-on-the-brow passage replaced wholesale** (src 57w)
Source: *"A soft hope blent with my sorrow that soon I should dare to drop a kiss on that brow
of rock, and on those lips so sternly sealed beneath it: but not yet. **I would not accost him
yet.**"*
Current/corrected: *"A gentle hope blended with my sorrow. **I could feel his heart was still
warm, still beating, still mighty. I was sure I could bring him comfort. I just needed to find
the right approach.**"*
The entire image is invented away, and the deliberate "not yet" — which motivates Jane's
concealment through paras 10–15 — is reduced to vague stage business. Lowest recall in the
chapter after 126 (0.33).

**Para 194 → 195 — SETUP/PAYOFF BREAK, unrepaired** (src 94w)
Source ends: *"But it is useless grieving. **Jane, leave me: go and marry Rivers.**"*
Current/corrected ends: *"But it's only natural enough. **You said he was young, handsome,
talented. And I—what am I now?**"*
Para 195 (untouched) replies: *"Shake me off, then, sir—push me away. I won't leave on my
own."* — "Shake me off" and "I won't leave" only answer a *command to leave*. With that
command deleted, 195 is a non-sequitur. This is structurally identical to the 57→58 and
63→64 breaks the drafter did fix, and it was missed.

**Para 117 — invented tail** (src 52w → 62w, ratio 1.19)
Source ends: *"**the little I did say lacerated his faithful heart deeper than I wished.**"*
Current/corrected ends: *"**The hunger, the cold, the exhaustion—I touched on them lightly,
emphasizing instead my rescue.**"*
Rochester's wounded reaction — which is what para 118 is the continuation of — is replaced by
a restatement of what Jane omitted. Note this sits directly between two repaired paragraphs
(116 and 118); the drafter repaired both sides of it and didn't look at the middle.

**Para 201 — Jane's closing question deleted** (src 123w)
Source ends: *"He sees nothing attractive in me; not even youth—only a few useful mental
points.**—Then I must leave you, sir, to go to him?**"*
Current/corrected ends: *"**He has no hold on my sympathy or warmth. I do not long for his
company. I am not drawn to his approval. No warmth rises in me at his approach.**"*
Four invented sentences of padding replace the pointed question that provokes 202–203. 202/203
still just about read, so this is a degradation rather than an outright break — but it is
invention, not translation.

### P2 — should fix

**Para 30** — drops *"'Answer me—speak again!' he ordered, imperiously and aloud"*, replacing
it with the invented *"An expression of pain and bewilderment crossed his face."* Para 31 is
Jane answering, so no hard break, but a dialogue command is deleted and stage direction
invented.

**Para 50** — *"the conviction of the reality of all this seized him"* replaced by the invented
*"A look of grateful joy broke over his worn face."* Interiority swapped for exterior
description.

**Para 111** — *"you shall have a walk soon"* replaced by invented *"You should feel it through
the open window. **Can you see the light?**"* This invents a question to a blind man that is
never answered (112 is narration), and deletes the walk promise that para 115 ("Most of the
morning was spent outdoors") pays off.

**Para 250** — see §5.

### P3 — minor, optional

**Para 62** — *"you shall not be left desolate, so long as I live"* → *"I will not let you be
sad."* Loses the lifelong vow.
**Para 126** — dropped French tag, see §5.
**Para 252** — *"I pronounced them with such frantic energy"* → *"I said them with such
desperate force."* Acceptable.

## 7. Setup/payoff continuity

| Pair | Status |
|---|---|
| 57 → 58 | **PASS.** Question restored; "Quite rich, sir" lands. |
| 63 → 64 | **PASS.** Withdrawal beat restored; "No—no—Jane; you must not go" now has its trigger. |
| 76 → 77 | **PASS.** Fire question restored; "with the right eye I see a glow" lands. |
| 86 → 87 | **PASS.** "Jane" cue restored; "You are altogether a human being, Jane?" follows naturally. |
| 92 → 94/96 | **PASS.** Scorched eyebrows restored at 92; 94 "Have you a pocket comb about you, sir?" and 96 "Just to comb out this shaggy black mane" are intact and no longer arrive cold. |
| 115 → 116 | **PASS.** "holding me in his arms—" → "Cruel, cruel deserter!" |
| 116 → 117 | **PASS** on the prompt ("Let me hear it now" → "Prompted by his urgency"), though 117's own tail is defective (§6). |
| **194 → 195** | **FAIL — unrepaired.** See §6. |
| 111 → 115 | **WEAK — unrepaired.** Walk promise deleted at 111. |

## 8. Whole-scene flow, paragraphs 80–120

Read continuously. The repaired zone now works as a reunion scene. Specifically:

- The emotional arc 84 → 85 → 86 is restored and sequenced correctly: Jane takes charge of
  the room, the supper conversation opens her whole nature, and the restlessness/"Jane" cue
  sets up Rochester's need for repeated proof she is real.
- 87–93 now form a coherent unit: is she human → how did she appear → his months of despair →
  her deliberately commonplace reply (eyebrows) → his fear of her vanishing. Before the
  repair, 91 and 92 were gutted and the unit had no middle.
- 94–106 (the comb/teasing sequence) was largely undamaged and now has its setup; the banter
  reads with the right lightness against 91's despair.
- 109–116 (next morning, quenched-lamp, the fields, the outburst) flows properly with 110, 113,
  114, 115 restored. The lamp image at 110 is the thematic hinge of the chapter and is now present.
- 118 is the emotional and moral payoff of the whole scene and is now correct.

**Two flat spots remain in this zone:** 111 (invented unanswered question, deleted walk
promise) and 117 (invented tail where Rochester's wounded reaction should be). Neither is
fatal to the scene, but 117 in particular sits at the hinge between the narration and
Rochester's reproach.

The reunion *before* the scene — paragraphs 6, 9, 30 — is measurably weaker than the repaired
middle, because the drafter's net never caught those. A reader moving 1 → 120 will feel the
approach and recognition as thin, then the reunion proper as rich.

## 9. Verdict

**NOT READY TO ACCEPT.** One more correction pass required.

What is settled and needs no further work:
- Paragraph count preserved 262/262.
- Diff set is exactly the 28 claimed; word-ratio table is accurate in every cell.
- All 28 repairs are faithful, well-written, and introduce no regressions.
- The three high-stakes fixes (85, 118, 10) are confirmed correct, and 118 in particular was a
  genuine plot-level distortion correctly identified and correctly fixed.
- 5 setup/payoff pairs repaired and verified working, incl. the pocket-comb chain.
- 6 of the 8 "no change needed" calls are correct.

What must be fixed before this ships:
- **P1:** paragraphs **6, 9, 117, 194, 201** — restore from source. 194 is a setup/payoff break
  of the same kind already fixed elsewhere; 6 loses the recognition beat and Rochester's full
  name; 9 and 117 and 201 are invented substitutions.
- **P2:** paragraphs **30, 50, 111, 250** — restore dropped dialogue/interiority; 250's
  "scarcely endure more" and the *involuntary* cry both need correcting.
- **P3 (optional):** 62, 126.

Process note for the next pass: **do not re-run the word-count-ratio scan as the detection
method.** It has already been run to exhaustion and is clean — every remaining defect in this
chapter is invisible to it, because invented text is length-neutral. Use source-recall
(fraction of source content words surviving) instead, and read every paragraph under ~0.65
recall regardless of its length ratio. That is how 6, 9, 117, 194 and 201 surfaced.
