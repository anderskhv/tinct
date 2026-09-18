# Batch O — Independent Review (chapters 330–332)

Reviewer: independent pass, separate from the drafting pass.
Files: `full-batchO-source.json` (Maude), `full-batchO-current-modern-en.json` (pre-fix),
`full-batchO-corrected.json` (candidate), `full-batchO-notes.md` (drafter).

## 1. Confirmed diff (corrected vs current)

Structural check, script-verified independently:

| Chapter | Title | Source paras | Current | Corrected | Titles match |
|---|---|---|---|---|---|
| 330 | Book Fifteen — Ch. 13 | 31 | 31 | 31 | yes |
| 331 | Book Fifteen — Ch. 14 | 9 | 9 | 9 | yes |
| 332 | Book Fifteen — Ch. 15 | 24 | 24 | 24 | yes |

Paragraph-level diff: **exactly two paragraphs changed, both in chapter 331** —
index 6 and index 8 (the 7th and 9th/final paragraphs). Chapters 330 and 332 are
byte-identical between current and corrected. This matches the drafter's claim.

## 2. Verification of the two ch331 fixes

### Fix 1 — fabricated "dry sponge" simile (ch331, para idx 6)

Source: *"The more the plundering by the French continued, the more both the wealth
of Moscow and the strength of its plunderers was destroyed. But plundering by the
Russians, with which the reoccupation of the city began, had an opposite effect:
the longer it continued and the greater the number of people taking part in it the
more rapidly was the wealth of the city and its regular life restored."*

Pre-fix text appended: *"And just as water seeping into a dry sponge does not flow
freely anymore, neither separately nor as a pool, so the army and population
flooding into Moscow simply spread through the ruined city, which soaked them up,
and the process of restoration began."*

**Confirmed fabricated.** No sponge/water imagery exists anywhere in the source for
this chapter (the chapter's only extended analogy is the ant-hill in para 0). It
also silently substituted a *different* causal claim ("since it was carried out by
such vast numbers... quickly brought Moscow back to life") for the source's precise
comparative ("the longer it continued and the greater the number of people taking
part in it").

**Confirmed removed.** Corrected text now reads: *"But the Russian plundering that
accompanied the reoccupation of the capital had the opposite effect: the longer it
continued and the more people took part in it, the more rapidly Moscow's wealth and
its ordinary life were restored."* This is a faithful, complete rendering of both
sentences of the source paragraph — the comparative structure, the "opposite effect"
hinge, and both restored objects (wealth, regular life) are all present. No residue
of the simile remains anywhere in the file (grep for "sponge"/"soaked": zero hits).
**PASS.**

### Fix 2 — fabricated closing line + Rostopchin/Rostov confusion (ch331, para idx 8, final paragraph)

Source closing sentence: *"And Count Rostopchín wrote proclamations."*

Pre-fix text: *"The old count's Rostov spirit was alive, regenerating the city."*

**Confirmed a compound defect.** It (a) invented a sentence with no source basis,
(b) misidentified the subject — Count Rostopchín, the real historical military
governor of Moscow, was conflated with the fictional Rostóv family (and specifically
with "the old count," i.e. Ilyá Rostóv, who is dead by this point in the novel and
has no connection whatsoever to this passage), and (c) replaced Tolstoy's dry ironic
deflation with sentimental uplift, inverting the paragraph's tone.

**Confirmed restored.** Corrected final sentence: *"And Count Rostopchin wrote
proclamations."* — exact semantic match to the source. The name is spelled
"Rostopchin" (diacritic dropped, consistent with the edition's house style elsewhere
in the batch, e.g. "Orel", "Natasha", "Karataev" — not a defect). No "Rostov spirit"
or "regenerating" text remains in the file. The historical-figure/fictional-family
confusion is fully resolved: the sentence now names Rostopchin performing the act
the source attributes to him, and the Rostóv family is not referenced in ch331 at
all in the corrected version. **PASS.**

Continuity note: this is the last narrative beat before the ch333+ essay zone, and
the restored line is exactly the ironic hinge that sets up the historiographic
argument that follows. Restoring it is materially correct, not cosmetic.

## 3. Independent adversarial read — all 3 chapters

I read all 64 paragraphs of the corrected file against the source line by line, plus
a word-count-ratio screen to surface silent compressions.

### Chapter 330 — SOUND (concur with drafter)

All 31 paragraphs render the source completely: Pierre's outward sameness and inward
change, the princess's grudging affection, Terénty and Váska, the doctor, the Italian
officer, Willarski's visit and Pierre's new tolerance of other people's viewpoints,
the new inner "judge," the French colonel's four thousand francs, the steward's
estimate, Savélich and the architect, the journey with Willarski. Compressions
flagged by the ratio screen (paras 8, 14, 15, 24, 26, 30) were each checked by hand;
all retain every claim, name, number and dialogue turn — the loss is Maude's Edwardian
padding, not content. No inventions, no omissions, no distortions found.

### Chapter 331 — SOUND after the two fixes, with minor residual drift (below)

The ant-hill analogy, the waves of plunderers, the population figures, the inventory
of Moscow's surviving institutions, the blood-to-the-heart image, and the closing
catalogue of the city's revival are all present and correctly ordered.

### Chapter 332 — **NOT sound.** One genuine omission the drafting pass missed.

Everything else in the chapter is faithful — Pierre's arrival, the guarded "Yes,
perhaps," the Drubetskóys' news, the drive to the old prince's house, the footman,
Dessalles, the candle-lit room, Princess Mary's embarrassment, the rusty-hinge smile,
the recognition of Natásha, and her changed face. But see Defect A.

## 4. Additional defects found

### A. Dropped sentence — ch332, para idx 21 (MODERATE)

Source ends the paragraph: *"He became confused in his speech and stopped in the
middle of what he was saying."*

Corrected/current ends at: *"...and an even stronger wave of joy and agitation seized
his heart."* The final clause is **absent from both current and corrected** — it was
never flagged and is not fixed. Word ratio 0.74, the lowest unexplained figure in the
batch.

This is not stylistic trimming: the dropped sentence is the observable behaviour that
makes the next paragraph's explanation land, and it is the outward symptom Princess
Mary and Natásha react to. Recommend restoring, e.g. append: *"He stumbled over his
words and broke off in the middle of a sentence."*

This also means the drafter's "332 — SOUND" verdict is wrong, and the batch summary
"2 sound, 1 defective" is inaccurate.

### B. Invented detail — ch331, para idx 8 (MINOR)

Source: peasants *"came to town bringing rye, oats, and hay."* Corrected: *"brought
in cartloads of grain, hay, and charcoal."* "Charcoal" has no source basis, and the
rye/oats distinction is collapsed into "grain." Small, but it is the same class of
invention as the sponge simile — recommend "rye, oats, and hay."

### C. Distorted claim — ch331, para idx 8 (MINOR)

Source: *"made out estimates at ten times their value for government stores that had
perished in the fire."* Corrected: *"estimates for the rebuilding of government
buildings were drawn up ten times their real cost."* The source is about fraudulent
valuation of *destroyed government stores* (a claim for losses), not about inflated
*construction* estimates. Different graft, different object.

### D. Dropped locator — ch331, para idx 8 (TRIVIAL)

*"the Faceted Palace in the Krémlin"* → *"the Faceted Palace."* Loses the location for
a reader who won't know the reference.

### E. Internal contradiction in the ant-hill analogy — ch331, para idx 0 (MINOR)

Source: *"despite the destruction of the heap, something indestructible... which is
the real strength of the colony, still exists."* Corrected: *"despite the complete
destruction of the colony... everything has been destroyed except something
indestructible and immaterial—the spirit of the colony."* The source destroys the
*heap* and preserves the *colony*; the corrected destroys the *colony* and then
preserves *the colony's spirit*, which reads as self-contradictory and blunts the
analogy that the whole chapter (and the essay zone that follows) rests on.

### F. Date drift — ch331, para idx 2 (TRIVIAL)

Source: *"exceeded what it had been in 1812."* Corrected: *"exceeded what it had been
before 1812."*

### G. Meaning shift — ch332, para idx 1 (TRIVIAL)

Source: *"free... from that feeling which, it seemed to him, he had aroused in
himself."* Corrected: *"from the feeling that he had chosen to impose on himself."*
"Chosen to impose" asserts deliberateness the source hedges ("it seemed to him").

## 5. Verdict

**The two claimed ch331 fixes are both genuine, correct, and complete — PASS.** The
fabricated sponge simile is fully gone and replaced with a faithful rendering; the
closing line is exactly restored and the Rostopchin/Rostov confusion is resolved.
The diff is exactly as claimed: two paragraphs, ch331 only, nothing else touched.

**But the batch is not ready to accept as-is.** Chapter 332 carries an unflagged
moderate omission (Defect A) that the drafting pass declared sound, and chapter 331's
final paragraph — the very paragraph that was reopened for Fix 2 — still contains an
invented detail (B) and a distorted claim (C) that should have been caught in the
same edit.

**Recommendation: ACCEPT the two ch331 fixes, then apply Defects A, B, C before
promoting to `accepted`.** D–G are optional polish; E is worth taking given that the
ant-hill analogy is load-bearing for the ch333+ essay zone.
