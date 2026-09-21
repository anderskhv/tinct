# Acceptance Record — The Taming of the Shrew (`taming-of-the-shrew`, modern-en)

Book id: `taming-of-the-shrew`. Edition: `modern-en`.
Procedure: `books/TRANSLATION_PROTOCOL.md` steps A–D.
Rounds: 5 (round 1 review + fixes, round 2 fixes, round 3 adversarial
verification → **PARKED**, round 4 unpark/repair + full confirmation,
round 5 narrow epithet-class confirmation and acceptance).

**Accepted:** 2026-09-21

## Files covered

- `source.json` — copied unmodified from
  `app/public/data/editions/taming-of-the-shrew-original-en.json`.
  sha256 `2fa6c01140bd2544025574f3b486668695917743734092cf297cce0ddce72b8e`
- `candidate.json` — derived from
  `app/public/data/editions/taming-of-the-shrew-modern-en.json`, with 15
  paragraph corrections applied across rounds 1–4 and one in round 5
  (all listed below).
- `PARKED-RESOLVED.md` — the park notice from round 3, retained with a
  resolution header.
- `accepted-paragraph-hashes.tsv` — per-paragraph sha256 for all 1021
  accepted paragraphs (1-based chapter/paragraph).

No app, registry, audio, or deploy action was taken in any round. This
directory only. No paid API calls in any round.

## Structure (re-verified independently in this round)

12 chapters, all real Act/Scene units, no apparatus/stub/editorial
chapters. 1021 paragraphs. Chapter count, numbers, titles and
per-chapter paragraph counts match `source.json` exactly; zero
mismatches.

| Chapter | Title | Source ¶ | Candidate ¶ |
|---|---|---|---|
| 1 | Act 1, Sc 1 — Padua. A public place | 80 | 80 |
| 2 | Act 1, Sc 2 — Before Hortensio's house | 96 | 96 |
| 3 | Act 2, Sc 1 — A room in Baptista's house | 170 | 170 |
| 4 | Act 3, Sc 1 — A room in Baptista's house | 45 | 45 |
| 5 | Act 3, Sc 2 — Before Baptista's house | 95 | 95 |
| 6 | Act 4, Sc 1 — Hall in Petruchio's country house | 89 | 89 |
| 7 | Act 4, Sc 2 — Before Baptista's house | 58 | 58 |
| 8 | Act 4, Sc 3 — A room in Petruchio's house | 96 | 96 |
| 9 | Act 4, Sc 4 — Before Baptista's house | 44 | 44 |
| 10 | Act 4, Sc 5 — A public road | 32 | 32 |
| 11 | Act 5, Sc 1 — Before Lucentio's house | 103 | 103 |
| 12 | Act 5, Sc 2 — A room in Lucentio's house | 113 | 113 |
| **Total** | | **1021** | **1021** |

The absent Induction / Christopher Sly frame is a genuine property of the
locked `source.json` (source chapter 1 is "Act 1, Scene 1", opening
"Flourish. Enter Lucentio and Tranio."). Confirmed in rounds 1, 3 and 4.
**Not a candidate defect.**

## Coverage table (all rounds)

| Round | Step | What was done | Coverage |
|---|---|---|---|
| 1 | A. Accessibility (blind) | Full read of `candidate.json` only, no source seen (`accessibility-review-1.md`) | 12/12 chapters, 1021/1021 ¶ |
| 1 | B. Fidelity (packets + context) | Full paragraph-by-paragraph comparison against source (`fidelity-review-1.md`); 5 defects found and fixed | 12/12 chapters, 1021/1021 ¶ |
| 2 | B′. Independent verification | Re-derivation of round-1 fixes plus a further fidelity sweep; 4 more defects found and fixed | 12/12 chapters; 5/5 round-1 fixes re-derived |
| 3 | C. Adversarial whole-book re-verification | All 4 round-2 fixes re-derived from source; dedicated word-for-word pass over every line of Biondello (38), Grumio (62), Tranio (90), Curtis (20) — 210 ¶; Katherina's submission speech and ch12 ¶82–113 clause by clause; spot-checks in ch1/3/4/5/8/10/11; whole-book mechanical sweeps for numeral/quantity parity, curst/cursed/shrew epithets, speaker tags, stage directions, italic markup | 12/12 chapters; 2 further defects (D1, D2) found, **not** fixed → PARKED |
| 4 | Unpark + repair + confirmation | D1 and D2 repaired; all 9 prior fixes re-confirmed correct; full fidelity/accessibility re-read | 12/12 chapters, 1021/1021 ¶; a 5th, previously-missed epithet occurrence found (ch2 ¶30 1-based) |
| 5 | D. Narrow confirmation + pin hash (this round) | 5th epithet occurrence re-derived from source and confirmed; its neighbour (Grumio's echo) re-confirmed; **third** exhaustive whole-book sweep of the `curst`/`cursed`/`shrew` epithet class in both files with location-keyed 1:1 matching; structure re-validated; final hash pinned | 25 source / 20 candidate epithet-token hits mapped by location; 5/5 title-class occurrences matched 1:1 |

Round 5 deliberately did **not** repeat a full fidelity/accessibility
re-read; rounds 1–4 did that exhaustively and non-sampled. Round 5 is a
narrow confirmation of the epithet-consistency defect class only.

## Full defect list (16 paragraphs corrected across 5 rounds)

### Round 1 — 5 defects, fixed (all re-confirmed in rounds 3–4)

1. A malapropism flattened to its "correct" word.
2. "Dian" modernised away from the source's printed period spelling.
3. "Grissel" likewise.
4. "graceless traitor" (ch12 submission speech) semantically altered.
5. "the veriest shrew" (ch12 ¶44) flattened out of the superlative degree.

### Round 2 — 4 defects, fixed (all re-derived from source in round 3)

1. **ch12 ¶102** — Katherina's submission speech: "froward and unable
   worms" had been softened to "contrary and incapable creatures". Now
   reads "Come, come, you froward and unable worms!"
2. **ch9 ¶38** — Biondello: "I have more to say, but" had been inverted
   to "I've nothing more to say, except". Now reads "I have more to say,
   but bid Bianca farewell for ever and a day."
3. **ch1 ¶25** — Gremio: invented referent "her sister's tongue" removed;
   now "make her pay the price of her tongue".
4. **ch11 ¶34** — Biondello's comic doubled "old" restored: "What, my old
   worshipful old master?"

### Round 3 — 2 defects found, documented not fixed (three-round rule); repaired in round 4

- **D1 — ch2 ¶29, Grumio: a source quantity silently changed.** Source
  "half a score knaves or so" (ten) had become "half a dozen" (six).
  Confirmed repaired: candidate now reads "She may call him half a score
  knaves or so — but that's nothing."
- **D2 — "Katherine the curst": the play's fixed epithet altered and
  rendered three different ways.** Four locations found in round 3
  (ch2 ¶31, ch3 ¶75, ch2 ¶49, ch12 ¶111, 1-based), all repaired in
  round 4.

### Round 4 — 1 further occurrence of D2's class, found and fixed

- **ch2 ¶30 (1-based; chapters[1].paragraphs[29])** — Hortensio's line
  still read "until Katherine the shrew has got a husband" where source
  has "Till Katherine the curst have got a husband". This was the fifth
  and last occurrence of the epithet class; it had been missed by the
  round-3 sweep because it sits one paragraph *before* Grumio's echo,
  which the sweep had keyed on.

## Round 5 — the epithet class, swept a third time

Recomputed from the two JSON files; no prior tool output trusted.

**1. The round-4 fix, re-derived at `chapters[1].paragraphs[29]`.**
Source: *"HORTENSIO. Tarry, Petruchio, I must go with thee, For in
Baptista's keep my treasure is: … That none shall have access unto
Bianca Till Katherine the curst have got a husband."* Candidate now
reads the full line faithfully — Baptista's keeping, the jewel/Bianca
apposition, the withholding from rival suitors, the rehearsed defects,
the impossibility of Katherina being wooed, and the closing order "no
one shall have access to Bianca until **Katherine the curst** has got a
husband." No clause dropped, none added, epithet correct.

**2. Grumio's echo at `chapters[1].paragraphs[30]`** (round-3 fix) still
reads *"GRUMIO. Katherine the curst! Of all titles for a girl, the
worst."* The two adjacent lines are now consistent: Hortensio names the
title, Grumio repeats it verbatim, and the joke — Grumio seizing on the
*title* — works because the word is the same in both.

**3. Exhaustive whole-book sweep.** Every occurrence of `curst`,
`cursed` and `shrew` (all case-insensitive, all inflections) was
extracted from both files with chapter/paragraph coordinates: 25 hits in
source (12 `curst*`, 13 `shrew*`), 20 in candidate (5 `curst*`, 15
`shrew*`). A second, narrower sweep matched any of those tokens within
40 characters of `Katherine`/`Katherina`/`Kate`.

The name-adjacent (title-class) set matches **1:1, same locations, same
wording**, in both files:

| Location (0-based ch/¶) | Source | Candidate |
|---|---|---|
| 1 / 29 | "Katherine the curst" | "Katherine the curst" |
| 1 / 30 | "Katherine the curst" | "Katherine the curst" |
| 1 / 48 | "curst Katherine" | "curst Katherine" |
| 2 / 74 | "Kate the curst" | "Kate the curst" |
| 11 / 110 | "tam'd a curst shrew" | "tamed a curst shrew" |

Zero title-class occurrences remain unmatched in either direction. The
word "cursed" now appears **nowhere** in the candidate — the three-way
rendering that round 3 reported is gone.

The 7 remaining source `curst` tokens are the ordinary archaic
*adjective* (= ill-tempered), not the epithet: ch1 ¶52 "so curst and
shrewd", ch2 ¶23 "as curst and shrewd", ch2 ¶25 "intolerable curst",
ch3 ¶135 "if she be curst", ch3 ¶139 "still be curst in company" and
"the curstest shrew", ch5 ¶57 "Curster than she?". These are rendered
"vicious"/"shrewish"/"play the shrew"/"worst"/"worse" and are
**deliberately modernised, not defects** — "curst" in this sense is dead
in modern English, and the epithet is preserved precisely *because* it
is a name rather than a description. Recorded here so a future pass does
not rediscover the asymmetry as new.

## Accepted non-blocking items (reader-centered reasons)

Carried forward from round 3, each re-affirmed:

- **No Induction / Christopher Sly frame** — a property of the locked
  source, not an omission.
- **"Jacks fair within, the Jills fair without"** (ch6 ¶17) rendered
  "cups clean inside, the girls neat outside". The pun turns on two dead
  senses at once; carrying both in one clause is not available in modern
  English.
- **"you hit the white"** (ch12 ¶108) rendered "you hit the bullseye".
  The Bianca/*bianco* pun is untranslatable; the archery sense is the one
  the joke needs.
- **"faced"/"braved"** (ch8 ¶60–62) mapped to "trimmed"/"faced". The
  doubled tailoring/bravado pun is preserved structurally.
- **ch1 ¶14** — Kate's third-person self-reference ("it is not half way
  to *her* heart") rendered first-person. Reads as a printing error to a
  modern reader; the first-person reading is the standard editorial one.
  Interpretive, below the blocking line.
- **Adjectival "curst" modernised** (see round-5 sweep above).
- Bawdy and violence are **not** softened anywhere checked: "my tongue in
  your tail" (ch3 ¶97), "thy horn is a foot" (ch6 ¶11), "Swinge me them
  soundly forth" (ch12 ¶83), and the whole wasp/sting exchange survive
  intact.
- **Italic markup**: two benign additions (ch3 ¶34 `_Backare!_`, ch8 ¶66
  `_Imprimis_`), matching the source's own italicisation of the same
  Latin/mock-Latin tags elsewhere. Not defects.

## Model/settings note

- **Rounds 1–4** (drafting review, fidelity review, independent
  verification, unpark/repair): Claude Sonnet 5 (`claude-sonnet-5`).
  Round 1's and round 3's sweeps of this epithet class were both
  incomplete — the class needed three sweeps in total before it closed.
- **Round 5** (this narrow confirmation and this record): Claude Opus
  (`claude-opus-5`).

**Programme lesson, carried forward:** a mechanical epithet sweep keyed
on the *most quotable* occurrence of a phrase will miss neighbouring
occurrences of the same phrase. Sweep by extracting every token
occurrence with coordinates from both files and matching them 1:1 by
location, not by reading the places you already know about.

## Final hash

`candidate.json` sha256:

```
51ef8f1b346059713de284d3247c104b5eea7f7294c2ad5e192b64360583462b
```

Computed against the file as it stands after the round-4 correction at
`chapters[1].paragraphs[29]`; no edits were made in round 5.
Per-paragraph hashes for all 1021 accepted paragraphs are in
`accepted-paragraph-hashes.tsv`.

**Date:** 2026-09-21

**Verdict: ACCEPTED.**
