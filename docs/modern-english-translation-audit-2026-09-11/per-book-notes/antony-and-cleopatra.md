# Antony and Cleopatra — modern-en audit (batch B5)

- **Book ID:** `antony-and-cleopatra`
- **Title / author:** Antony and Cleopatra / William Shakespeare
- **Scope:** public (in `BOOKS`)
- **Reviewer:** batch agent B5, 2026-09-11

## Edition snapshot (Phase 1 data)

| Edition | sha256_16 | Chapters | Paragraphs | Words | Label |
|---|---|---|---|---|---|
| original-en | `1e768f7514f9746c` | 42 | 1513 | 25,987 | Shakespeare (1623) |
| modern-en | `6cd4739c60b8cda9` | 42 | 1513 | 26,847 | Modern English |
| modern-da | `97f45e0b01d5a14a` | 42 | 1513 | 27,731 | Moderne Dansk |

Mechanical comparison: mean weighted similarity **0.6462**; identical long paragraphs
**0.2%**; truncation flags **0**; empty paragraphs **0**; no chapter or paragraph
mismatches; `en_editions_aligned: true`. Not on the README's 33-book watchlist.

## Provenance and completeness — structure verified, labels broken

The brief asked specifically whether the 42-chapter structure is real or apparatus
debris. **It is real.** 42 = Act 1 (5 scenes) + Act 2 (7) + Act 3 (13) + Act 4 (15) +
Act 5 (2), which is the canonical Folio scene division, and the `number` field runs
1…42 cleanly. Every chapter has a plausible location subtitle and real dramatic content.
`Shakespeare (1623)` is correct — F1 is the only early text of this play.

**But 8 of the 42 chapter titles are broken.** Every scene numbered 11 or higher renders
as `Scene 0`:

| Chapter idx | Title as shipped | Should be |
|---|---|---|
| 22 | `Act 3, Scene 0 — Alexandria. A Room in the Palace` | Act 3, Scene 11 |
| 23 | `Act 3, Scene 0 — Caesar's camp in Egypt` | Act 3, Scene 12 |
| 24 | `Act 3, Scene 0 — Alexandria. A Room in the Palace` | Act 3, Scene 13 |
| 35 | `Act 4, Scene 0 — Another part of the Ground` | Act 4, Scene 11 |
| 36 | `Act 4, Scene 0 — Another part of the Ground` | Act 4, Scene 12 |
| 37 | `Act 4, Scene 0 — Alexandria. A Room in the Palace` | Act 4, Scene 13 |
| 38 | `Act 4, Scene 0 — Alexandria. Another Room` | Act 4, Scene 14 |
| 39 | `Act 4, Scene 0 — Alexandria. A monument` | Act 4, Scene 15 |

Present identically in **all three editions** (original-en, modern-en, and modern-da,
which renders them `Akt 3, Scene 0` / `Akt 4, Scene 0`), so this is an ingestion/parsing
bug — a scene-number regex that fails on two digits — not a translation defect.

Consequences for the reader: the table of contents shows `Act 3, Scene 0` three times and
`Act 4, Scene 0` five times, so chapter navigation is ambiguous and unusable across the
back half of the play. Note that the chapters affected include **Antony's death (4.14)**
and **Cleopatra in the monument (4.15)** — the play's climactic scenes are the ones with
no findable label. None of the other four plays in this batch is affected (their
scene numbers all stop at 7).

## Samples inspected (5)

### 1. Act 1, Scene 1, paras 0–13 (opening) — strong
Source (para 1): *"Nay, but this dotage of our general's O'erflows the measure. Those his
goodly eyes, That o'er the files and musters of the war Have glowed like plated Mars, now
bend, now turn The office and devotion of their view Upon a tawny front."*
Modern: *"No, this infatuation of our general's has gone way too far. Those magnificent
eyes of his, which used to glow like armored Mars surveying the ranks and assemblies of
war, now bend their gaze and devote their attention to a swarthy face."*

**Finding:** Confident untangling of Shakespeare's late syntax — the participial pile-up
is resolved into a readable relative clause without losing a single image. `"plated
Mars"` → `"armored Mars"`, `"files and musters"` → `"ranks and assemblies"`, `"tawny
front"` → `"swarthy face"`. The ethnic register is preserved rather than sanitized:
`"a gipsy's lust"` → `"a gypsy's lust"`, `"a strumpet's fool"` → `"a whore's fool"`.
`"Grates me, the sum."` → `"It annoys me — get to the point."` is a good unlock of a
famously compressed line. Mild register drift in `"has gone way too far"` (slightly
colloquial against the surrounding diction).

### 2. Act 2, Scene 2, paras 78–93 (Enobarbus on the barge) — **the set-piece test; strong**
Source (para 81): *"The barge she sat in, like a burnished throne, Burned on the water.
The poop was beaten gold; Purple the sails, and so perfumed that The winds were love-sick
with them… she did lie In her pavilion, cloth-of-gold of tissue, O'erpicturing that Venus
where we see The fancy outwork nature."*
Modern: *"The barge she sat in, like a burnished throne, burned on the water. The poop
was beaten gold; the sails were purple, and so perfumed that the winds were love-sick
with them… she lay in her pavilion, cloth-of-gold of tissue, outdoing that picture of
Venus where we see the imagination outwork nature."*

**Finding:** This is the best answer in the batch to the brief's question — can the
modernization clarify without over-explaining? Here it can. The famous lines are left
almost intact where they are already clear (`"burned on the water"`, `"what they undid,
did"`, `"Age cannot wither her, nor custom stale her infinite variety"`), and the genuine
obstructions are removed precisely: `"made their bends adornings"` → `"made their bows
ornaments"`, `"yarely frame the office"` → `"briskly handle the office"`, `"riggish"` →
`"wanton"`, `"vilest things Become themselves in her"` → `"the vilest things become
becoming in her"`. `"He ploughed her, and she cropped"` → `"He ploughed her, and she
yielded a crop"` keeps the bawdy.

One over-explanation: *"Whistling to th' air, which, but for vacancy, Had gone to gaze on
Cleopatra too"* → *"whistling to the air — which, **but for the vacuum it would have
left**, would have gone to gaze on Cleopatra too"*. The added clause is not in the
source; it does unlock a genuinely opaque line, but it is the one place I found where the
edition reaches past gloss into explanation.

### 3. Act 2, Scene 7, paras 55–71 (drinking on Pompey's galley) — low register, strong
Source (para 60): *"Ah, this thou shouldst have done And not have spoke on 't! In me 'tis
villainy; In thee 't had been good service… Being done unknown, I should have found it
afterwards well done, But must condemn it now."*
Modern: *"Ah, you should have done this and not spoken of it! In me it would be villainy
— in you it would have been good service… Done in secret, I would have found it well done
afterwards, but I must condemn it now."*

**Finding:** Pompey's self-serving moral logic (the distinction between the deed and the
knowledge of it) is preserved exactly, including the conditional structure that carries
it. `"palled fortunes"` → `"faded fortunes"`, `"Whate'er the ocean pales or sky inclips"`
→ `"Whatever the ocean encloses or the sky surrounds"`.

### 4. Act 4, Scene 14 (file chapter 39, titled "Act 4, Scene 0"), paras 0–17 (Antony's death) — strong
Source (para 3): *"Sometime we see a cloud that's dragonish, A vapour sometime like a
bear or lion, A towered citadel, a pendant rock… They are black vesper's pageants."*
Modern: *"Sometimes we see a cloud that's shaped like a dragon, a vapor sometimes like a
bear or a lion, a towered citadel, an overhanging rock… They are dark evening's
pageants."*

Source (para 5): *"That which is now a horse, even with a thought The rack dislimns and
makes it indistinct As water is in water."*
Modern: *"That which is now a horse, even with a thought the drifting clouds dissolve and
make it as indistinct as water is in water."*

**Finding:** `"the rack dislimns"` → `"the drifting clouds dissolve"` is exactly the right
move: two dead words replaced with their actual sense, the image untouched.
`"black vesper's pageants"` → `"dark evening's pageants"` keeps the phrase's shape.
`"Packed cards with Caesar, and false-played my glory"` → `"stacked the cards with
Caesar, and falsely played my glory away"` keeps the card metaphor alive. This is the
climax of the play and the writing holds up — which makes the broken chapter label on
this exact scene more costly, not less.

### 5. Act 5, Scene 2, paras 100–129 (Cleopatra's death and the Clown) — mixed
Source (para 123): *"Truly she makes a very good report o' th' worm; but he that will
believe all that they say shall never be saved by half that they do. But this is most
**falliable**, the worm's an odd worm."*
Modern: *"Truly she gives a very good report of the worm; but he who would believe all
that they say shall never be saved by half that they do. But this is most **fallible** —
the worm is an odd worm."*

**Finding: a flattened joke.** `"falliable"` is the Clown's malapropism (for
"infallible"); normalizing it to the correct word `"fallible"` removes the error that is
the joke, and inverts the sense. Meanwhile the Clown's *other* malapropism in the same
speech — `"his biting is immortal"` (for "mortal") — is correctly preserved. So the
edition knows how to handle these; it just missed one. Worth noting the inconsistency
with Much Ado, where Dogberry's `"dissembly"` and `"eftest"` both survive.

Everything else in the scene is strong: Cleopatra's *"I am marble-constant"*, the
*"squeaking Cleopatra boy my greatness"* speech (*"some squeaking Cleopatra-boy play my
greatness in the posture of a whore"*), *"the pretty worm of Nilus"* → *"the pretty worm
of the Nile"*.

## Phase 1 flags: confirmed vs. disconfirmed

- **0 truncation / 0 empty / 0 mismatches** — confirmed; all 42 scenes present and
  paragraph-matched 1513/1513, including the many very short scenes (3.8 at 44 words, 3.9
  at 36 words, 4.11 at 40 words) that a truncation heuristic might have flagged.
- **0.2% identical long paragraphs** — confirmed benign. Ranking all 317 source paragraphs
  ≥25 words: only 3 (0.9%) exceed 0.90, and all three are already-plain prose (the Clown's
  *"the worm is not to be trusted"*, Enobarbus on Menas, Menas *"No, to my cabin"*).
- **Mean similarity 0.646, median 0.641; 36% of long paragraphs below 0.60** — second-most
  thoroughly rewritten in the batch after Shrew. Consistent with what I read: the dense
  late-Shakespeare verse genuinely got worked on.
- **Archaic-token sweep:** 674 source instances of thou/thee/thy/hath/doth/ere/'tis/etc.
  → **3** in modern-en (**0% retained**, the cleanest in the batch).
- **Spelling house style:** consistent (no honour/honor or favour/favor mixing) — the
  only book in this batch that is clean on this.

## Additional defects found (not in Phase 1 data)

1. **8 broken chapter titles** (`Scene 0`, with duplicates) — see table above. All three
   editions. Highest-impact defect in this book.
2. **Stage-direction convention is internally inconsistent in modern-en.** Source: 152
   bracketed / 101 bare. Modern: 268 bracketed / 0 bare — but **147 of the 268** use
   ALL-CAPS character names (`[Enter ANTONY and EROS.]`, `[Exit MARDIAN.]`) while the
   other 121 use mixed case (`[Enter a Guardsman.]`). Two conventions in one file.
   (Same pattern as king-lear; othello, much-ado and shrew are internally consistent.)
3. **Clown's malapropism normalized** at 5.2 para 123 (above).
4. Minor: `marry` appears 3× in source but **4× in modern-en** — one instance was
   introduced rather than removed. Trivial, but symptomatic of the batch-wide lack of a
   policy for this word.

## Phase 3 — human-edition research

Antony and Cleopatra is an English original, but this is the densest, most elliptical
verse in the batch — SOURCE + GLOSSES would not remove the barrier. A modernization is
clearly justified here, and this one earns its place.

Candidates checked (full table in `othello.md`):

- **Standard Ebooks** — **not published** (histories + *The Winter's Tale* only), and
  original-language anyway. CC0. [standardebooks.org/ebooks/william-shakespeare](https://standardebooks.org/ebooks/william-shakespeare)
- **Wikisource / PG #100 / Globe-Moby** — complete, **public domain**, commercial reuse
  permitted ([Wikisource: Reusing content](https://en.wikisource.org/wiki/Wikisource:Reusing_Wikisource_content)).
  Original language — this is what `original-en` already is. *Useful for one thing: it is
  a rights-clear source for correcting the 8 scene numbers.*
- **Folger digital texts** — **CC BY-NC**, noncommercial only ([Folger](https://www.folger.edu/blogs/collation/free-cultural-works-come-get-your-free-cultural-works/)). Rights-blocked.
- **Internet Shakespeare Editions** — educational/non-profit only; editor holds copyright
  ([ISE copyright](https://internetshakespeare.uvic.ca/Foyer/copyright.html)). Rights-blocked.
- **Open Source Shakespeare** — CC BY-NC 4.0. Rights-blocked.
- **No Fear Shakespeare / Shakescleare / NoSweatShakespeare / Durband / OSF *Play On!*** —
  complete modern-English translations, all copyrighted; permission required.
- **Lamb, *Tales from Shakespeare*** — **Antony and Cleopatra is not among the 20 tales**
  (verified against [PG #573](https://www.gutenberg.org/cache/epub/573/pg573.txt)), so
  even the abridged public-domain fallback does not exist for this play.

**No complete, human-authored, rights-clear modern-English Antony and Cleopatra found in
this search** — and for this title the public-domain retelling option is absent as well.
Our own modern-en is, as far as this search goes, the only rights-clear modern-English
Antony and Cleopatra available to us at all.

## Phase 4 — rating

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 4 |
| First-read clarity | 25% | 4 |
| Literary voice | 20% | 5 |
| Restraint / no invention | 10% | 4 |
| Naturalness | 5% | 4 |

**Weighted score: 4.2 — band: Good with fixes.**

Fidelity is 4 rather than 5 for the flattened malapropism; clarity is 4 rather than 5
because 8 broken chapter titles materially damage navigation through Acts 3–4, including
both climactic scenes.

**Recommendation: LIGHT EDIT.**
The prose itself is close to the best in the batch — this is the hardest text of the five
and it is handled with real skill. The defects are structural and mechanical, not
editorial.

1. **Fix the 8 `Scene 0` chapter titles** in all three editions (parser bug on two-digit
   scene numbers — worth checking whether any other multi-scene play in the library is
   affected).
2. Restore the Clown's `falliable` at 5.2 para 123.
3. Normalize the stage-direction capitalization (147 ALL-CAPS vs 121 mixed-case).
4. Consider softening `"has gone way too far"` at 1.1 and trimming the added `"but for the
   vacuum it would have left"` at 2.2.

- **Confidence:** medium-high. 5 passages / roughly 1,500 source words read closely,
  spread one per act, plus a full-text similarity ranking and archaic-token sweep over
  all 1,513 paragraphs. The `Scene 0` defect is verified exhaustively across all three
  edition files, so confidence on that is high.
- **Correction scope:** local.

## Limitations of this review

- Act 3 was sampled only through the similarity ranking and the chapter-title audit, not
  read closely — the Actium sequence (3.7–3.10) and Enobarbus's defection (4.6, 4.9) are
  unexamined.
- I verified that the 42 scenes are canonically correct in *count and division*, but I
  did not collate the text against a Folio transcript line by line.
- `modern-da` not evaluated beyond confirming the same 8 broken titles.
- Threads/onboarding/audio JSON not checked. Note that if chapter titles are corrected,
  audio manifests keyed on title strings (if any) may need regeneration.
- Rights conclusions are research summaries, not legal advice.
