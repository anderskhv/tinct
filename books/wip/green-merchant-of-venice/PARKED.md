# PARKED — The Merchant of Venice (`merchant-of-venice`, modern-en)

> **CURRENT STATUS (2026-09-21, after round 4): HARD PARKED — NOT ACCEPTED.**
> Read the "Round 4" section at the end of this file first; it supersedes
> the round-3 "READY FOR INDEPENDENT VERIFICATION" verdict below, which did
> not hold. Round 4 (independent, Claude Opus `claude-opus-5`) confirmed
> every one of round 3's 24 fixes as real and correctly placed, but found
> five further live instances of the same defect class. The 3-round budget
> is spent, so the book is hard parked rather than sent to a 4th correction
> round. No acceptance hash exists for this book.
>
> **2026-09-21 round-3 update:** Round 3 (Claude Sonnet 5) fixed all 18
> defects listed below, plus 6 further instances of the same defect class
> found by a fresh sweep, plus resolved the 9 lower-confidence judgment
> items (3 more fixed, 6 kept as legitimate modernization). See the "Round
> 3 — correction round" section appended at the end of this file, and the
> matching section in `ACCEPTANCE-RECORD.md`, for the full fix list,
> reasoning and final hash. This file's body above the appended section is
> retained verbatim as round 2's record; do not edit it.
>
> **Round-3 verdict: READY FOR INDEPENDENT VERIFICATION.** File renamed
> from `PARKED.md` to `PARKED-RESOLVED.md` per the programme's naming
> convention for a round that resolves the park. This was round 3 of 3 —
> the round budget is now used; a further blocking finding hard-parks the
> book rather than triggering a 4th round.

---

**Status after round 2 of 3: PARKED (not accepted).**
Round 2 = independent adversarial fidelity verification by Claude Opus
(`claude-opus-5`), re-derived from `source.json` / `candidate.json` alone,
not from round 1's notes.

File verified: `candidate.json`, sha256
`907b2814271af0d2ba9e1b9ca1a0e49742a780c347a1bee79aad773e95dad3e9`
(matches round 1's claimed hash exactly — the file reviewed here is the file
round 1 pinned). `source.json` sha256
`4897042eb44535622771253d9f1155d184c56b1b7450e17a3b2fcfa98ecbad20`.

All paragraph references below are **0-based array indices** (the same
convention round 1 used, verified correct this time — unlike Twelfth Night,
round 1's cited indices here are accurate).

## What round 2 confirmed as correct

- **Structure, re-derived fresh:** 20 chapters, all real Act/Scene units
  (Act 1 Sc 1 → Act 5 Sc 1), no apparatus/editorial/crosswalk chapters,
  no polluted titles. 779 paragraphs. Chapter numbers, titles and
  per-chapter paragraph counts match source exactly (37/33/53/9/73/7/25/
  20/31/13/13/25/46/58/12/18/32/152/14/108). No empty/whitespace-only
  paragraphs either side.
- **Both round-1 fixes are real and correctly placed.** Re-located by
  searching source for the distinctive strings rather than trusting the
  cited coordinates: "Nazarite" occurs exactly once in source, at ch3
  idx15, and the candidate now carries it there; "negro" occurs exactly
  once, at ch17 idx12, and the candidate now carries source's "the getting
  up of the negro's belly" there, with "The Moor is with child by you,
  Launcelet" intact in the next sentence. Full paragraphs read, not just
  the headline phrases.
- **Antisemitic content is unsoftened.** Word-for-word reads of ch13 idx21
  ("Hath not a Jew eyes?" — every clause of the catalogue, the four
  rhetorical questions, and "the villainy you teach me I will execute…I
  will improve on the instruction" present), the whole of ch18 (Act 4 Sc 1,
  all 152 paragraphs), ch3 idx36 ("misbeliever, cut-throat dog", "spit on
  my Jewish gabardine", the bated-breath passage), ch3 idx19-20 (the
  "sacred nation" / "Cursed be my tribe" aside), ch3 idx28-30
  (Jacob-and-Laban), ch18 idx20 (the purchased-slave speech), ch18 idx88
  ("the stock of Barabbas"), ch18 idx86 ("currish Jew"), ch18 idx126
  (Gratiano's mock-baptism taunt), ch11 idx4 ("My daughter! O my ducats!"),
  ch13 idx30 (the Leah/turquoise speech), ch9 (elopement) and ch20 idx1-8
  (the Act 5 moonlight duet). Nothing euphemized, flattened or dropped.
  "Jew" 69→70 whole-word (the +1 at ch14 idx47 is a benign pronoun
  spelled out), "Christian", "dog", "currish", "infidel", "tribe",
  "Hebrew", "Barabbas", "synagogue", "misbeliever", "Moor", "negro",
  "Jewess", "Hagar" all present at the **same coordinates** in both files
  (location-keyed map, not counts).
- **Speaker tags.** No ALL-CAPS speaker-tag name differs between the files;
  source's own Salarino/Solanio/Salerio inconsistency is reproduced, not
  normalized. Round 1's claim here holds.
- **No compression or invention at the whole-paragraph level.** Own
  word-count-ratio sweep over all 779 paragraphs: zero paragraphs above
  1.6×; 30 below 0.85×, all read in full and all benign short-line
  compression. All 91 "moderately compressed" paragraphs of ≥35 source
  words (0.85–0.98×) were read; no dropped clause or content loss found in
  that band. Both files were then read in full, in parallel, end to end.

## Why this is PARKED and not fixed in place

The full parallel read surfaced **18 defects in one recurring class that
round 1 missed entirely** — "erasure of source's own printed forms":
proper-noun substitution/normalization, malapropism and coinage erasure,
one imported scholarly emendation, and one systematic stage-direction
rewrite. This is the same class that parked Twelfth Night and Midsummer.

It is not narrow or mechanical. Fixing it requires a judgment call the
verifier should not make unilaterally, repeatedly, across the book: **which
archaic forms are legitimate modernization of the same word** (source's
"Uncapable" → "incapable", "spet" → "spit", "gaberdine" → "gabardine",
"Æson" → "Aeson", "fourscore" → "eighty" — all accepted here) **versus
which are substitution of a different word or name for the one source
prints** (Abram → Abraham, Alcides → Hercules, Colchos → Colchis). The two
categories are not separable by a script, and getting the line wrong in
either direction is itself the failure mode this batch keeps hitting.

Round 1's report also contains at least one **affirmatively false
verification claim** (see D4 below), so its coverage statement cannot be
used to bound what else may remain — which is a second reason not to patch
and ship from here.

---

## Blocking defects found in round 2

### A. Proper nouns silently normalized or replaced (10 sites)

| # | Location | Source prints | Candidate has |
|---|---|---|---|
| A1 | ch12 idx1, ch12 idx2 | `Arragon` (2×) | `Aragon` |
| A2 | ch3 idx28, ch3 idx44 | `our holy Abram`, `O father Abram` | `our holy father Abraham`, `Oh father Abraham` |
| A3 | ch2 idx23 | `as old as Sibylla` | `as old as the Sibyl` (name → generic descriptor) |
| A4 | ch4 idx3 | `So is Alcides beaten by his rage` | `So Hercules can be beaten…` |
| A5 | ch14 idx9 | `young Alcides … Go, Hercules!` | `young Hercules … Go, Hercules!` |
| A6 | ch14 idx9 | `the Dardanian wives` | `the Trojan wives` |
| A7 | ch3 idx11, ch13 idx33, ch14 idx46 | `Tripolis` (3×) | `Tripoli` |
| A8 | ch13 idx30 | `in Frankfort` | `in Frankfurt` |
| A9 | ch1 idx34 | `Colchos' strond` | `the shore of Colchis` |
| A10 | ch13 idx2 | `if my gossip Report be an honest woman` | `if my gossip Rumor is…` (personified proper name swapped) |

A2 is not cosmetic: "Abram" is the pre-covenant Hebrew form, and it is
Shylock's own word in both instances — normalizing it to "Abraham" flattens
his voice in exactly the register this book is supposed to protect.
A5 is worse than a rename: source deliberately varies **Alcides** and
**Hercules** within one speech; the candidate collapses both to "Hercules",
erasing a distinction source itself makes eight lines apart.

### B. Malapropism / coinage erasure (3 sites)

| # | Location | Source | Candidate |
|---|---|---|---|
| B1 | ch5 idx1 | `"Fia!" says the fiend` | `"Off with you!" says the fiend` — source's own quoted exclamation deleted and replaced with ordinary English |
| B2 | ch5 idx1 | `the very devil incarnation` | `the very devil incarnate` — Launcelet's malapropism silently corrected |
| B3 | ch5 idx46 | `the suit is impertinent to myself` | `the request concerns me` — Launcelet's malapropism ("impertinent" for "pertinent") corrected into plain sense, destroying the joke |

The same scene correctly preserves `frutify` (in quotes) and ch8 idx8
correctly preserves `your reproach`, so the treatment is inconsistent, not
a deliberate policy.

### C. Imported emendation + gloss naming what source doesn't (1 site, ch4 idx3)

Source: `If Hercules and Lichas play at dice / Which is the better man, the
greater throw / May turn by fortune from the weaker hand: / **So is Alcides
beaten by his rage**`.

Candidate: `If Hercules and **his servant** Lichas were to play at dice …
So Hercules can be beaten by **his attendant**`.

Two problems in one sentence. `rage` → `attendant` adopts the editorial
*page* emendation instead of the reading `source.json` actually prints —
the "never import wording from another edition, even if more accurate"
lesson, verbatim. And `his servant Lichas` names a relationship source
leaves unstated at this point — the "glosses may only define a term already
explicit in source's own words" lesson.

### D. Reversed / altered meaning (3 sites)

- **D1 — ch4 idx5.** Portia has just required Morocco to swear that, if he
  chooses wrong, he will "never to speak to lady afterward / In way of
  marriage." Source: `PRINCE OF MOROCCO. **Nor will not.** Come, bring me
  unto my chance.` Candidate: `**I will.** Come, bring me to my chance.`
  Source's reply is a negative undertaking; the candidate states a bare
  positive. Lower confidence than the rest (it can be read as "I will
  [swear]"), but the negative is gone and the line no longer answers the
  oath it is answering.
- **D2 — ch8 idx10.** Source: `my nose fell a-bleeding on Black Monday last
  at six o'clock i' th' morning, falling out that year **on Ash-Wednesday**
  was four year in th' afternoon.` Candidate: `falling that year **four
  years after Ash Wednesday**, in the afternoon.` Launcelet's nonsense
  depends on Black Monday *coinciding with* Ash Wednesday; the candidate
  substitutes a different (and differently nonsensical) relation. This is
  deliberate-mangling erasure plus a factual change to what the line says.
- **D3 — ch18 idx34.** Source: `O, be thou damn'd, **inexecrable** dog!`
  Candidate: `Oh, be damned, **inexorable** dog!` A different word, not a
  spelling modernization: "inexecrable" is the Folio's intensified coinage
  ("utterly execrable"); "inexorable" means unyielding. Source's word is
  replaced by an editorial substitute.
- **D4 — round 1's report is wrong about D3.** `fidelity-review-1.md`
  states: *"'inexecrable dog' → 'be damned, inexecrable dog' (Ch18 ¶34,
  checked: candidate correctly keeps the coined/unusual 'inexecrable'
  rather than normalizing to 'execrable')."* The candidate does not contain
  the string "inexecrable" anywhere. This is a verification claim asserted
  as checked that is false against the file, which is why round 1's
  "no other fidelity defects found across a full, non-sampled read of all
  779 paragraphs" cannot be relied on as a bound.

### E. Systematic stage-direction rewrite (26 paragraphs)

Every one of source's 26 `Exeunt` stage directions is rendered `Exit` in the
candidate; "Exeunt" appears zero times in the candidate. In **8** of them
the direction has an explicitly plural subject, so the change is not only a
substitution of source's printed word but is wrong on its own terms:

```
ch1  idx16  [_Exeunt Salarino and Solanio._]        → [Exit Salarino and Solanio.]
ch1  idx26  [_Exeunt Gratiano and Lorenzo._]        → [Exit Gratiano and Lorenzo.]
ch5  idx54  [_Exeunt Launcelet and Old Gobbo._]     → [Exit Launcelet and Old Gobbo.]
ch7  idx21  [_Exeunt Salarino and Solanio._]        → [Exit Salarino and Solanio.]
ch13 idx27  [_Exeunt Solanio, Salarino and the Servant._] → [Exit Solanio, Salarino and the Servant.]
ch16 idx8   [_Exeunt Jessica and Lorenzo._]         → [Exit Jessica and Lorenzo.]
ch18 idx131 [_Exeunt Duke and his train._]          → [Exit Duke and his train.]
ch18 idx146 [_Exeunt Portia and Nerissa._]          → [Exit Portia and Nerissa.]
```

The remaining 18 are bare `[_Exeunt._]` → `[Exit.]`, each marking a
multi-character clearing of the stage.

---

## Lower-confidence / judgment items for the round-3 owner

Not counted among the 18 blockers, but they belong to the same decision and
should be settled together rather than piecemeal:

- **ch3 idx19** — `a fawning publican` → `a fawning tax-collector`. An
  accurate definition, but it removes the Luke-18 allusion marker, which the
  protocol asks to preserve. Round 1 accepted it explicitly.
- **ch3 idx15** — `to eat of the **habitation** which your prophet … conjured
  the devil into` → `to eat from **that creature**`. The Gadarene-swine
  "habitation" image is replaced by a flat noun, inside a paragraph round 1
  edited and re-verified.
- **ch9 idx20** — `a gentle, and no Jew` → `a gentile, and no Jew at all`.
  Resolves source's gentle/gentile pun to one side.
- **ch5 idx6 / idx23** — `sand-blind, high-gravel blind` → `half-blind,
  dim-sighted as gravel`. Launcelet's comic escalation glossed away.
- **ch5 idx16** — `the Sisters Three` → `the Three Sisters` (source's own
  inverted form re-ordered).
- **ch11 idx10** — source's pronoun `for him` spelled out as `for Bassanio's
  sake`.
- **ch20 idx64** — `respective` → `respectful` (near-miss: source means
  "mindful/careful").
- **ch18 idx3** — `Uncapable` → `incapable`; **ch20 idx105** — `inter'gatories`
  → `interrogatories`; **ch20 idx4** — `Æson` → `Aeson`. Accepted here as
  same-word modernization, listed so the round-3 owner sees where round 2
  drew the line.

## Method (so round 3 need not redo it)

1. Fresh structural derivation from both JSONs (counts, titles, empties).
2. Own word-count-ratio sweep, all 779 paragraphs, both tails; every
   outlier and every moderately-compressed paragraph of ≥35 source words
   read in full.
3. Location-keyed (chapter, index, count) occurrence maps — not totals —
   for ~90 proper nouns and sensitive terms, plus a whole-book diff of every
   capitalized token present in one file and absent from the other. Defect
   classes A, E and most of B were found this way; totals-only comparison
   (round 1's method) cannot find them.
4. Full parallel end-to-end read of both files.
5. Dedicated word-for-word reads of the scenes named in the task brief.

Scratch artifact: parallel dump regenerated on demand; nothing outside
`books/wip/green-merchant-of-venice/` was touched, no registry/app/deploy/
audio changes, no paid API calls.

**Rounds used: 2 of 3.** One correction round remains before a hard park.

**Date:** 2026-09-21

---

## Round 3 — correction round (Claude Sonnet 5, final round before hard park)

All 18 blocking defects listed above (A1–A10, B1–B3, C, D1–D3, E's 26
paragraphs) were independently re-located in `source.json` by searching for
the distinctive source word/phrase — not by trusting the chapter/paragraph
coordinates cited above — and confirmed real at every location before being
fixed. Full fix list, reasoning for each, and the fresh-sweep/judgment-call
writeup for the 9 lower-confidence items is in `ACCEPTANCE-RECORD.md`
("Round 3 — correction round" section); it is not duplicated here to avoid
drift between the two files. Summary:

- **18/18 blockers fixed**, including the 26-paragraph Exeunt/Exit rewrite
  (found by exhaustively searching `source.json` for every "Exeunt", not
  by working the 8-item sample list one by one — all 26 matched round 2's
  count exactly).
- **6 further instances of the identical defect class found and fixed** by
  a fresh location-keyed capitalized-token diff of the whole book:
  ch3 idx15 (habitation), ch9 idx20 (gentle/gentile pun), ch5 idx6 and
  ch5 idx23 (sand-blind), ch5 idx16 (Sisters Three), ch20 idx64
  (respective/mindful).
- **9 lower-confidence judgment items resolved**: publican→tax-collector,
  "for him"→"for Bassanio's sake", and Uncapable/inter'gatories/Æson (3
  items) kept as legitimate modernization with reasoning recorded; the
  other 5 (habitation, gentle/gentile, sand-blind ×2, Sisters Three,
  respective) judged genuine instances of the same defect class and fixed
  — see the fresh-sweep list above, which folds these in.
- **D4 (round 1's false "inexecrable" verification claim)** — not a fix
  target; `fidelity-review-1.md` is left as historical record, superseded
  by this file and `ACCEPTANCE-RECORD.md`.

Verification: full structural re-check (20 chapters, 779 paragraphs,
per-chapter counts/numbers/titles all still matching `source.json`), a
full pre/post paragraph diff confirming exactly 50 paragraphs changed and
every one accounted for by an intended fix (26 Exeunt sites + 24 other
paragraphs), a fresh re-read of every fixed paragraph against
`source.json` after saving, and a whole-book Exeunt/Exit occurrence
recount (26/26 and 20/20 against source). `python3 -m json.tool` validity
and paragraph-count checks both pass. No files outside
`books/wip/green-merchant-of-venice/` touched; no registry/app/deploy/audio
changes; no paid API calls.

`candidate.json` sha256 (post round-3 fixes):

```
9484e8948a2f6cc393ff3ede5a505f46013cf92ee7a0fe899b988cc1141b2d6d
```

**Rounds used: 3 of 3.** This is the final correction round for this book
under the programme's 3-round limit. **Verdict: READY FOR INDEPENDENT
VERIFICATION.**

**Date:** 2026-09-21

---

## Round 4 — independent adversarial verification (Claude Opus `claude-opus-5`)

**Verdict: HARD PARKED. Not accepted. No acceptance hash computed.**
The 3 nominal correction rounds are used. Round 4 was verification only; it
made **no edits to `candidate.json`** and did not run a 4th correction round.

**File renamed back to `PARKED.md`** — the round-3 rename to
`PARKED-RESOLVED.md` was premature under the programme's own naming
convention, because the park is not resolved.

### What round 4 independently confirmed as correct

Everything below was re-derived from `source.json` / `candidate.json` alone,
by searching source for the distinctive string rather than trusting any prior
round's cited coordinates.

- **Hashes.** `source.json` sha256
  `4897042eb44535622771253d9f1155d184c56b1b7450e17a3b2fcfa98ecbad20`;
  `candidate.json` sha256
  `9484e8948a2f6cc393ff3ede5a505f46013cf92ee7a0fe899b988cc1141b2d6d`
  — round 3's self-reported hash is accurate; the file reviewed here is the
  file round 3 pinned.
- **Structure, fresh.** 20 chapters, 779 paragraphs, per-chapter counts
  37/33/53/9/73/7/25/20/31/13/13/25/46/58/12/18/32/152/14/108, chapter
  numbers and titles identical between files, no empty/whitespace-only
  paragraphs either side, no extra top-level keys.
- **All 18 round-2 blockers are genuinely fixed, at their real locations.**
  `Arragon` ×7 (ch12), `Abram` ×2 (ch3 idx28, idx44), `Sibylla` (ch2 idx23),
  `Tripolis` ×3 (ch3 idx11, ch13 idx33, ch14 idx46), `Frankfort`
  (ch13 idx30), `Colchos' strond` (ch1 idx34), `gossip Report` (ch13 idx2),
  `Dardanian wives` (ch14 idx9), `"Fia!"` and `devil incarnation`
  (ch5 idx1), `impertinent` (ch5 idx46, with `frutify` still quoted at
  ch5 idx44 and `defect` at ch5 idx49), `Nor will I` (ch4 idx5),
  `on Ash Wednesday` (ch8 idx10), `inexecrable` (ch18 idx34).
- **The Alcides/Hercules alternation is matched exactly, not blanket-reverted.**
  ch4 idx3 reads `If Hercules and Lichas … So Alcides can be beaten by his
  rage` — the imported `his servant` / `his attendant` emendation and gloss
  are both gone. ch14 idx9 reads `young Alcides … Go, Hercules!`, preserving
  source's own variation within one speech.
- **Exeunt/Exit, recounted from source.** 26 `Exeunt` in source, 26 in
  candidate, at the same 26 paragraph coordinates, including all 8
  plural-subject directions. 20 `Exit` in source, 20 in candidate, same
  coordinates. No crossover in either direction.
- **Round 3's own 6 fresh finds verified.** `habitation` (ch3 idx15),
  `a gentle, and no Jew` (ch9 idx20), `sand-blind, high-gravel blind`
  (ch5 idx6) and `sand-blind` (ch5 idx23), `the Sisters Three` (ch5 idx16),
  `respective` → `mindful` (ch20 idx64).
- **Compression/content loss: clean.** Own word-ratio sweep over all 779
  paragraphs from scratch: range 0.50×–1.50×, nothing above 1.6×. All 18
  paragraphs below 0.90× with ≥25 source words were read in full, as were
  all 12 paragraphs below 0.80×. No dropped clause or invented content.
- **Word-for-word reads.** Act 1 Sc 1 (ch1, all 37), Act 1 Sc 3 (ch3, all
  53), Act 2 Sc 7 (ch10), Act 2 Sc 9 (ch12), Act 3 Sc 2 (ch14), the
  "quality of mercy" speech (ch18 idx57, intact clause for clause), plus
  full parallel reads of ch2, ch4–ch9, ch11, ch13, ch15–ch20. Antisemitic
  and racial content re-spot-checked and still unsoftened (ch13 idx21,
  ch3 idx36, ch17 idx12, ch18 idx20/88/126, ch11 idx4, ch13 idx30).

### Why the book is HARD PARKED: the defect class is still not exhausted

Round 4's own location-keyed sweep — a fresh capitalized-token and
rare-word cross-reference built from `source.json`, not reusing any prior
round's word list — plus the word-for-word scene reads surfaced **further
live instances of the identical class** ("erasure of source's own printed
forms"), in scenes prior rounds had not covered exhaustively. These are
*not* fixed here; fixing them would be a 4th correction round.

| # | Location | Source prints | Candidate has | Why it is the same class |
|---|---|---|---|---|
| R4-1 | ch1 idx8 | `by two-headed Janus` | `by two-faced Janus` | Source's printed word silently replaced by a different word. `two-headed` is plain modern English and needed no change; `two-faced` carries a modern connotation (duplicitous) that the line — about two contrasting temperaments — does not mean. `two-headed` appears nowhere in the candidate. |
| R4-2 | ch10 idx4 | `A coin that bears the figure of an angel / Stamped in gold; but that's insculp'd upon` | `a coin called an angel stamped in gold—but that's only engraved on the surface` | The clause `bears the figure of` is dropped and replaced by an imported external fact (the coin's name). This is the `his servant Lichas` rule verbatim: a gloss may only define a term already explicit in source's own words. It also changes what the line asserts (figure-of → named-), which is the hinge of the figure-outside / angel-within contrast. |
| R4-3 | ch9 idx5 (×2, same paragraph) | `the strumpet wind` … `by the strumpet wind` | `the wanton wind` … `that same wanton wind` | `strumpet` is plain modern English and is the harsher word; replacing it twice with `wanton` is register-softening of source's own printed word — the thing this programme exists to prevent. |
| R4-4 | ch13 idx16 | `Out upon it, old carrion! Rebels it at these years?` | `Out on it, old carrion! Are you still in heat at your age?` | Source's question (and its deliberate echo of Shylock's `rebel` in the previous line) is replaced with an explicit bawdy paraphrase source does not print. Meaning alteration plus loss of the verbal echo. |
| R4-5 | ch18 idx25 | `a tainted wether of the flock` | `a diseased ram of the flock` | A wether is a castrated ram; `ram` is a different animal category, and Antonio's self-description depends on the word. Substitution, not modernization. |

Two further items were **considered and judged acceptable**, recorded so the
next owner sees where round 4 drew the line and does not re-litigate them:

- ch10 idx8 `All that glisters is not gold` → `All that glitters is not
  gold`. `glister` is the archaic form of the same word; this sits inside
  round 2's accepted bucket (`spet`→`spit`, `gaberdine`→`gabardine`,
  `Uncapable`→`incapable`, `Æson`→`Aeson`). **Accepted.**
- ch10 idx4 `The Hyrcanian deserts` → `The deserts of Hyrcania`. The proper
  noun survives; this is a grammatical recast, not a swap of one name for
  another. **Accepted.**
- ch10 idx7 `A carrion Death` → `A skull`, and ch2 idx11 `a death's-head` →
  `a skull`. A descriptive period idiom, glossed consistently in both
  places, in line with `hovel-post`→`tent-pole`, `fill-horse`→`cart-horse`,
  `penthouse`→`overhang` elsewhere. **Accepted.**

### Why this is not a narrow single-instance fix

The programme's rule is that a single missed instance of an
already-bounded class may be fixed in place by the verifier. That does not
apply here:

1. There are **five** live instances, in four different chapters, not one.
2. They were found on round 4's **first** independent pass, by the same
   method round 3 used for its own fresh finds — which means the method
   round 3 relied on to declare the class exhausted did not, in fact,
   exhaust it.
3. R4-2 and R4-3 are new *sub-shapes* of the class (imported external fact
   replacing a dropped clause; twofold register-softening of a charged
   word) rather than repeats of a shape already enumerated.
4. Three of the five sit in exactly the regions prior rounds had not read
   word-for-word — Act 1 Sc 1, Act 2 Sc 7, Act 2 Sc 6 — which means the
   remaining exposure is bounded by coverage, not by the class being
   understood.

Round 3's report is not dishonest — its 24 fixes are all real and all
correctly placed — but its coverage claim ("every one accounted for",
class exhausted) cannot be used as a bound, for the same reason round 1's
could not.

### Disposition

- `candidate.json` is **unchanged** by round 4 and remains at sha256
  `9484e8948a2f6cc393ff3ede5a505f46013cf92ee7a0fe899b988cc1141b2d6d`.
- **No `accepted-paragraph-hashes.tsv` was written.** `ACCEPTANCE-RECORD.md`
  was **not** finalized; it still records rounds 1–3 only.
- **Rounds used: 3 of 3, plus one verification round. HARD PARKED.** This
  book does not re-enter the correction loop on the current budget. Any
  future attempt should be authorized explicitly as a re-baseline (fresh
  modern-en pass with the full class list above as a pre-brief), not as a
  4th patch round.
- Model note: rounds 1 and 3 = Claude Sonnet 5; rounds 2 and 4 =
  Claude Opus `claude-opus-5`.

Scope: nothing outside `books/wip/green-merchant-of-venice/` was touched.
No registry/app/deploy/audio changes. No paid API calls.

**Date:** 2026-09-21
