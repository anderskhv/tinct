# Jane Eyre — Chapter 27 (modern-en) — Independent Verification

Reviewer: independent (did not draft the repair).
Files checked: `ch27-source.json` (163 ¶), `ch27-current-modern-en.json` (163 ¶),
`ch27-corrected.json` (163 ¶), `ch27-repair-notes.md`.

## 1. Independently confirmed diff set

Script diff of `ch27-current-modern-en.json` vs `ch27-corrected.json`, paragraph by
paragraph (exact string comparison, all 163 indices):

```
DIFF INDICES (0-based): [150, 153, 158, 159, 160, 161]
```

- Exactly 6 paragraphs changed. The other 157 are byte-identical.
- Paragraph count 163 in all three files — alignment with source preserved.
- No merges, splits, reorders, insertions or deletions.
- Drafter's claimed diff set matches independently-derived set exactly. **Confirmed.**

Word-count ratios vs source (CLAUDE.md ≥75% rule):

| ¶ | source wc | pre-repair wc | corrected wc | ratio |
|---|---|---|---|---|
| 150 | 197 | 105 (53%) | 207 | 105% |
| 153 | 159 | 101 (64%) | 155 | 97% |
| 158 | 126 | 106 (84%) | 131 | 104% |
| 159 | 110 | 78 (71%) | 107 | 97% |
| 160 | 402 | 110 (27%) | 439 | 109% |
| 161 | 116 | 96 (83%) | 113 | 97% |

All six now pass the gate; four of six failed or sat marginal before.

## 2. Per-paragraph fidelity table

| ¶ (0-based) | Claim | Verdict | Source evidence |
|---|---|---|---|
| 150 | Red-room dream moon/vision imagery restored | **Confirmed** | Every restored element is in source: "the roof resolved to clouds, high and dim"; "the gleam was such as the moon imparts to vapours she is about to sever"; "I watched her come—watched with the strangest anticipation"; "some word of doom were to be written on her disk"; "a hand first penetrated the sable folds and waved them away"; "not a moon, but a white human form shone in the azure, inclining a glorious brow earthward"; "It gazed and gazed on me". "struck me into a fainting fit" = "struck me into syncope" ✓. Nothing invented. Pre-repair's "ghost-like figure of a gleaming moon… panic of a child" (not in source) is gone. |
| 153 | Packing/locket/pearl-necklace restored; invented "small silk purse" removed | **Confirmed** | Source: "some linen, a locket, a ring"; "the beads of a pearl necklace Mr. Rochester had forced me to accept a few days ago"; "it was the visionary bride's who had melted in air"; "The other articles I made up in a parcel; my purse, containing twenty shillings (it was all I had), I put in my pocket"; "took the parcel and my slippers, which I would not put on yet". All present in corrected, in source order. Fabricated "small silk purse in my drawer" removed. Pre-repair also wrongly had "which I would put on later" (inverts Brontë's "would **not** put on yet") — corrected restores the negative. |
| 158 | Meaning inversion fixed: locked gates + latched wicket | **Confirmed** | Source: "The great gates were closed and locked; but a wicket in one of them was only latched. Through that I departed: it, too, I shut; and now I was out of Thornfield." Corrected: "The great gates were shut and locked, but a wicket set into one of them was only latched. I slipped out through that, and shut it too behind me; and now I was clear of Thornfield." Inversion genuinely fixed; the "and now I was out of Thornfield" beat (dropped pre-repair, replaced by "I slipped through and was gone") is also restored. |
| 159 | Past/future antithesis + Brontë's imagery restored; invented moors line removed | **Confirmed** | Source: "not one glance was to be cast back; not even one forward. Not one thought was to be given either to the past or the future. The first was a page so heavenly sweet—so deadly sad—that to read one line of it would dissolve my courage and break down my energy. The last was an awful blank: something like the world when the deluge was gone by." All four clauses present in corrected. The fabricated "move past the moors and beyond the reach of anyone from Thornfield" is gone. Corrected renders "the first/the last" as "The past/The future" — a clarity choice, not a meaning change. |
| 160 | ~290 omitted words restored; fabricated "drain of blood" removed | **Confirmed** | Every restored element traces to source: scaffold simile in full ("the block and axe-edge; of the disseverment of bone and vein; of the grave gaping at the end"); "I thought of him now—in his room—watching the sunrise"; "I could yet spare him the bitter pang of bereavement"; "his comforter—his pride; his redeemer from misery, perhaps from ruin"; "It was a barbed arrow-head in my breast; it tore me when I tried to extract it; it sickened me when remembrance thrust it farther in"; "birds were faithful to their mates; birds were emblems of love. What was I?"; "I had no solace from self-approbation: none even from self-respect"; "I had injured—wounded—left my master"; "God must have led me on"; "impassioned grief had trampled one and stifled the other"; the fall, "pressing my face to the wet turf", "some fear—or hope—that here I should die", crawling on hands and knees and rising again. The fabricated "drain deep and dark through which a torrent of blood was pouring" has no source basis and is removed. **Nothing invented in the restored text.** |
| 161 | Coach/fare numbers faithful | **Confirmed** | Source: "he said thirty shillings; I answered I had but twenty; well, he would try to make it do. He further gave me leave to get into the inside, as the vehicle was empty." Corrected matches all four facts: 30 asked, 20 offered, driver accepts, coach empty and she rides inside. Invented "I counted out my purse. It came to twenty" removed. Numbers correct. |

## 3. Emotional weight of ¶160 (the collapse)

Checked specifically for flattening. It holds. The paragraph now moves through the
full arc in order: the scaffold simile → "and oh, with what agony I thought of what I
had left behind. I could not help it." → the longing to return → the barbed arrowhead
that tears when pulled and sickens when memory drives it deeper → the faithful birds
and the bare "What was I?" → "I despised myself… I was hateful in my own eyes" →
"Still I could not turn back, could not retrace a single step. God must have been
leading me on." → the weeping, the delirious pace, the collapse face-down in wet
grass, the fear-or-hope of dying there, the crawl, the rise. The dashes, the
em-dashed triplet, the short declaratives and the "or" in "fear—or hope—" are all
preserved. Not flattened; this is the emotional peak of the chapter and it reads as
such.

## 4. New errors introduced by the repair

None material. No garbling, no wrong attribution, no restructuring that reads worse
than source. Three minor observations, none blocking:

1. **¶160, interpretive gloss.** Source: "that fear of his self-abandonment—far worse
   than my abandonment—how it goaded me!" Corrected: "that fear of what he might do to
   himself—far worse than the fear of what I was doing to myself". Brontë's "my
   abandonment" is ambiguous (Jane's own desolation vs. her own self-abandonment); the
   rendering picks the self-abandonment reading and makes it explicit. Defensible and
   parallel-preserving, but it resolves an ambiguity the original leaves open.
2. **¶160, "my master" lost.** Source: "I had injured—wounded—left my master."
   Corrected: "I had injured him—wounded him—abandoned him." The triplet's rhythm
   survives but the word *master* — which carries the whole relational charge and
   echoes ¶146's "my dear master" — is dropped. Optional improvement: "I had injured
   him—wounded him—left my master."
3. **¶160, "eager" dropped.** Source closes "as eager and as determined as ever to
   reach the road"; corrected has only "as determined as ever". Trivial.

### Pre-existing defects NOT introduced by this repair (out of declared scope)

- **¶158** still omits source's "All this I did without one sound." (present in source,
  absent both pre- and post-repair). Small but it is the sentence that makes the
  oiled key and feather pay off. Worth a follow-up touch since ¶158 was already open.
- **¶158** renders "my strength, sorely shaken of late" as "severely tested in the last
  day" — narrows an indefinite period to one day. Untouched text.
- **¶157** (untouched) expands source's "My hand moved towards the lock: I caught it
  back, and glided on" into three sentences ("I stopped myself. I forced myself away. I
  crept on."). Mild embellishment, not a fidelity error.

## 5. Continuity read, ¶145–163

Read straight through. No seams. Specific joins checked:

- ¶149 "Farewell forever!" → ¶150 "That night I never expected to sleep" — clean.
- ¶150 ends mid-sentence on the em-dash into ¶151 "My daughter, flee temptation." /
  ¶152 "Mother, I will." / ¶153 "So I answered after I had woken…" — the three-beat
  dream-voice exchange lands correctly, and the restored ¶150 makes ¶151's "Mother"
  intelligible for the first time (the pre-repair version never established the white
  human form, so "Mother" came from nowhere).
- ¶153 "stole from my room" → ¶154 "Farewell, kind Mrs. Fairfax!… as I slipped past her
  door" — clean.
- ¶157 "I crept on." → ¶158 "In a daze I made my way downstairs." — clean.
- ¶158 "clear of Thornfield" → ¶159 "A mile off, beyond the fields, lay a road" — clean;
  the corrected ¶158 ending now actually sets up ¶159.
- ¶159 → ¶160 → ¶161 → ¶162 ("Gentle reader, may you never feel what I felt then!") —
  the restored ¶160 gives ¶162's apostrophe something to refer back to. Pre-repair,
  ¶162's "such stormy, scalding, heart-wrung tears" had no antecedent because the
  weeping had been cut.

Register is consistent with the untouched surrounding paragraphs throughout — the
restored text does not read more archaic or more modern than its neighbours.

## 6. Verdict

**Ready to accept.**

All six claimed repairs are real, correctly scoped, and faithful to source. No
invention remains in the repaired paragraphs; no new error was introduced. The
meaning inversion at ¶158 is genuinely fixed, ¶161's fare numbers are correct, and
¶160 carries full emotional weight. The drafter's notes are accurate and do not
overstate the work.

Optional (non-blocking) polish if another pass happens anyway:
1. ¶160 — restore "my master" in the triplet.
2. ¶158 — restore "All this I did without one sound."
3. ¶160 — restore "eager" alongside "determined".

None of these justify holding the repair.
