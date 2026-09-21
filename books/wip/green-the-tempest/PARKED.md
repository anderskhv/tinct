# The Tempest (`the-tempest`, modern-en) — PARKED after round 2

**Round:** 2 of 3 (independent adversarial fidelity verification)
**Reviewer:** Claude Opus (`claude-opus-5`), independent of round 1's
drafting/repair (Claude Sonnet 5)
**Date:** 2026-09-21
**File reviewed:** `candidate.json`, sha256
`14a4fa4f26b9290fc437a4df28153747ce930da70cce7682aced7ecd7d85b38b`
(recomputed here; matches round 1's claimed hash, so the file is exactly
what round 1 certified)
**Verdict:** **NOT ACCEPTED.** No acceptance hash. No
`accepted-paragraph-hashes.tsv` written. `candidate.json` was **not
modified** by this round — the finds below are not narrow/mechanical, they
span five defect classes and include lexical-policy judgment calls, so per
the task's round-10 rule they go to a correction round (3/3) rather than
being patched by the verifier.

---

## 1. What was independently re-derived (not trusted from round 1)

- **Structure, fresh.** Both files parsed directly. 10 chapters; `number`
  and `title` strings identical; per-chapter paragraph counts identical
  (43, 175, 170, 58, 29, 74, 39, 98, 102, 2) = **790 paragraphs** in both;
  no empty/whitespace-only paragraph; JSON valid. **Matches round 1's
  structural claim exactly.**
- **Source completeness, different passages than round 1 checked.**
  "Our revels now are ended" (ch8 ¶47) present and complete through "our
  little life is rounded with a sleep"; Ariel's "Full fathom five" (ch2
  ¶124) present in full including the "sea-change / rich and strange" and
  "Sea-nymphs hourly ring his knell" lines plus the Ding-dong burthen
  (¶125-126); Caliban's "Be not afeard, the isle is full of noises" (ch6
  ¶67) present and complete through "I cried to dream again"; Prospero's
  "Ye elves of hills" abjuration (ch9 ¶11) complete; Epilogue (ch10 ¶2)
  complete through "Let your indulgence set me free". **No
  structural-skip condition. Source is complete.**
- **All 790 paragraph pairs read in full**, source against candidate, by
  chapter, from a freshly generated paired dump (not round 1's
  `*_readable.txt`, which it admits were not regenerated after its fixes).
- **All 14 round-1 fixes re-derived by searching source for the
  distinctive wording**, not by trusting cited indices. All 14 are present
  and correct in the current file: `whoreson` (1.28), `unstanched wench`
  → "a woman who couldn't stop her bleeding" (1.29), `red plague`
  (2.109), `malice` → "you spiteful creature" (2.110), `whores and
  knaves` (3.95), `an apple`/`kernels` (3.61/3.62 — joke logic restored),
  `Ca-Caliban` (4.56), `My mistress` (4.40), `horse piss` (8.66),
  `dropsy` (8.81), `Mars's hot mistress` (8.26), `Hymen` ×2 (8.4, 8.26),
  `Phoebus` (8.5). *(All locations 1-based; round 1's table is 0-based and
  maps consistently.)*
  - **"My mistress" crux (fix 8) judged correct.** Source prints "My
    mistress show'd me thee"; many editions emend to "dam". Restoring the
    source's own printed form is right under the carried-forward rule
    against silently standardizing a printed form.
  - **"Mars's hot minion" (fix 11) judged correct.** `minion` =
    favorite/darling; "mistress" carries it; the earlier "hot-tempered
    mistress" did invent a temper trait.
- **Own instrumentation, built fresh from `source.json`:** a
  **location-keyed** (not count-based) capitalized-token map, paragraph by
  paragraph; a ~110-word charged/crude/violent lexicon with per-paragraph
  presence checks; a speaker-keyed line extraction for all 11 major
  speakers plus minor ones, with per-speaker repeated-token frequency to
  surface tics nobody nominated in advance; and a compression sweep over
  every paragraph ≥12 words including the moderate band (0.85-0.95), not
  just the extremes.

## 2. Why this is parked, not patched

Round 1 ran a whole-book read **plus** a second differently-instrumented
whole-book pass and self-certified clean. Its proper-noun instrument was a
`Counter` **diff of totals** — exactly the count-vs-location failure that
cost Ivan Ilyich a round. Two mythological names are dropped at specific
locations while surviving elsewhere in the book, so a totals diff reports
them as present. This is the Merchant / Merry Wives / Romeo shape: a
"final" round certifying clean, a fresh independent sweep finding a further
crop across the same classes the round claimed to have exhausted. It is
also not one class: 15 items across five classes, several of which need a
written lexical policy (period curse-words, named animals/plants, address
forms) rather than another one-off patch.

## 3. Blocking defects (all locations 1-based, `chapter.paragraph`)

### Class A — meaning alteration / invented content (3)

| # | Loc | Source | Candidate | Problem |
|---|-----|--------|-----------|---------|
| A1 | **3.72** | "in my rate, she too, **Who is so far from Italy removed** I ne'er again shall see her" | "she might as well be too -- **she's so far away in Italy** that I'll never see her again" | **Inversion of a plot fact.** Claribel is in Tunis, *removed from* Italy. The candidate puts her *in* Italy, contradicting the whole Tunis/Naples distance argument this scene (and 3.139-3.141) is built on. |
| A2 | **9.59** | "Now, **blasphemy, That swear'st grace o'erboard, not an oath on shore?** Hast thou no mouth by land?" | "Now, **you blasphemer who swore the ship was done for** -- have you nothing to say on dry land? Have you lost your voice?" | Invents a claim the Boatswain never made ("swore the ship was done for") and erases the actual joke: his swearing drove grace overboard, and now he has no oath left ashore. The oath/blasphemy content is gone. |
| A3 | **6.12** | "was there ever man **a coward** that hath drunk so much sack as I to-day?" | "was there ever a man **as brave as me** who drank as much wine as I have today?" | Rhetorical logic reversed and the charged word `coward` erased. Source: *no coward ever drank this much*. Candidate: a straight boast. (`thou deboshed fish thou` also picks up an added "half-".) |

### Class B — dropped proper noun / mythological allusion (2)

Same class as round-1 fixes 12-14 (Hymen ×2, Phoebus). Both survive
elsewhere in the book, which is why a totals-based diff cleared them.

| # | Loc | Source | Candidate |
|---|-----|--------|-----------|
| B1 | **2.53** | "**Jove's** lightnings, the precursors O' the dreadful thunder-claps" | "Even **the lightning bolts** that precede the terrible thunderclaps" — Jove dropped, though **Neptune is named two lines later in the same paragraph**, and Jove is kept at 9.11. |
| B2 | **9.11** | "do chase the ebbing **Neptune** and do fly him When he comes back" | "chase **the retreating tide** across the sand ... and flee when it comes back" — Neptune dropped, though kept at 2.53 and Jove is kept in this same paragraph. |

### Class C — erasure of source's own printed form (3)

The class that hard-parked Merchant, Merry Wives and Romeo.

| # | Loc | Source | Candidate | Problem |
|---|-----|--------|-----------|---------|
| C1 | **9.74** | "**Coragio, bully-monster, coragio!**" | "**Courage, brave monster, courage!**" | Stephano's Italian exclamation `Coragio` (his one foreign flourish) translated away, **and** `bully-monster` flattened to "brave monster". `bully-` is the exact form whose erasure hard-parked Merry Wives. |
| C2 | **9.53** | "Look down, **you god**" | "Look down, **you gods**" | Silent standardization of the source's own printed singular to the conventional plural — the identical judgment call round 1 correctly *refused* to make at "My mistress" (fix 8). Inconsistent with its own accepted policy. |
| C3 | **4.12** | "Loved **Mall**, Meg and Marian and Margery" | "loved **Moll**, Meg, and Marian, and Margery" | Silent normalization of a printed name spelling to the standard modern form. Carried-forward batch lesson: reproduce the source's printed form. |

### Class D — charged/crude word erased or de-specified (5)

| # | Loc | Source | Candidate | Problem |
|---|-----|--------|-----------|---------|
| D1 | **3.53** | "Widow! **a pox o' that!**" | "Widow! **Don't get me started!**" | The curse is not softened, it is **deleted** and replaced by a neutral modern idiom — while `pox` is kept verbatim at 1.26 ("A pox on your throat"). Round 1's non-blocking note covers pox→plague *substitution*, not pox→no-curse. |
| D2 | **6.40** | "**A murrain** on your monster" | "**A curse** on your monster" | Specific named affliction → the generic word "curse". This is the *same* sub-class round 1 treated as blocking at `red plague` and `dropsy`; its "equivalent force at every occurrence" claim does not hold here. (Same ¶ also turns "the devil take your **fingers**" into "your **fists**".) |
| D3 | **2.80** | "**Thou, my slave**, As thou report'st thyself, wast then her servant" | "**You**, as you yourself have told me, were her servant then" | Prospero's only "my slave" address to *Ariel* is dropped, softening the master/slave framing the scene turns on. `slave` is preserved everywhere it is aimed at Caliban. |
| D4 | **4.27** | "How camest thou to be **the siege** of this moon-calf? can he **vent** Trinculos?" | "How did you end up **underneath** this moon-calf? Can he **produce** Trinculos?" | The scatological joke (`siege` = stool/excrement; `vent` = excrete) is neutralized to a spatial description — the bawdy-softening class that hard-parked Merchant and Romeo. |
| D5 | **2.2** | "The sky ... would pour down **stinking** pitch" | "The sky looks like it would pour down **burning** pitch" | Not a synonym: the source's offensive-smell image is replaced by a different (fire) image, dropping the charged adjective. |

### Class E — dropped clause / de-specified concrete noun (2)

| # | Loc | Source | Candidate | Problem |
|---|-----|--------|-----------|---------|
| E1 | **3.135** | "even Ambition cannot pierce a wink beyond, **But doubt discovery there.**" | "even ambition can't see beyond it." | Whole clause dropped (Cymbeline's dropped-clause class). |
| E2 | **4.52** | "snare the nimble **marmoset**" / "dig thee **pignuts**" | "trap the nimble **monkey**" / "dig up **peanuts**" | `marmoset` is a specific, still-recognizable animal generalized to "monkey" (the `red plague`→`plague` shape). `pignuts` (earthnuts, *Conopodium*) become `peanuts`, a different, New-World plant — an animal/plant-category substitution of the `wether`→`ram` kind that was blocking in Merchant. |

## 4. Non-blocking observations (for the correction round's lexical policy)

Not counted among the 15 above; listed because a round-3 policy should
decide them explicitly rather than case-by-case:

- `scurvy` rendered three different ways (4.9/4.12 "terrible", 4.47
  "revolting", 6.32 "pathetic") — no loss, but no policy either.
- `sirrah` dropped at 9.87 and 9.91 (contemptuous address form).
- Ferdinand's recurring `mistress` address to Miranda survives 1 of 5
  times (5.2 ×2, 5.5, 5.11, 5.22) — the servant/mistress framing is kept
  in sense each time, but the recurring wording is not.
- `Prospero. "Poor worm, thou art infected!"` (5.9) → "Poor thing, you're
  lovesick!" — the worm image is dropped.
- `stripes` (2.106) → "punishment"; `mop and mow` (8.12) → "bows and
  gestures" (the word means *grimaces*); `my hearts` (1.7) kept once of
  twice.
- 3.139 "dwells **Ten leagues** beyond man's life" → "lives **ten times**
  farther away than a man could travel in a lifetime" — the figure is
  changed in kind (distance → multiplier).
- Round 1's accepted non-blocking calls (Argier→Algiers,
  Bermoothes→Bermudas, Poor-John→dried cod, flesh-fly, nautical jargon)
  were re-checked and are reasonable as written; they are *not* the
  problem here. Note, though, that C3 (Mall→Moll) is the same
  normalization instinct applied to a name, where it is not allowed.
- `Full fathom five` (2.124) and `Where the bee sucks` (9.16) are left
  almost entirely in the source's archaic wording. That is an
  accessibility question (the protocol says not to leave archaic language
  merely because it sits inside a song), not a fidelity defect — flagged
  for Reviewer A, not counted above.

## 5. What round 3 needs

1. Fix all 15 items above, verifying each against `source.json` directly.
2. Before fixing, write an explicit **lexical policy** covering: period
   curse-words (`pox`, `murrain`, `plague`, `dropsy`, `scurvy`) — when a
   swap is allowed and when the named affliction must survive; named
   animals/plants; foreign exclamations (`Coragio`); address/insult forms
   (`bully-`, `sirrah`, `my slave`, `mistress`); and printed-form
   normalization (names, singular/plural crux readings). Romeo's round-4
   recommendation was exactly this, and the absence of such a policy is
   why these items were decided inconsistently across the book.
3. Re-run proper-noun checking **location-keyed, never count-keyed** —
   both B-class finds are invisible to a totals diff.
4. Re-sweep the moderate compression band (ratio 0.85-0.95), where E1
   sits; the extremes were already clean.
5. Round 3 is the last correction round under the three-round rule. If a
   round-4 independent pass again finds live instances of classes A-D,
   this book hard-parks like Merchant, Merry Wives and Romeo.
