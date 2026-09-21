# PARKED — Coriolanus (`coriolanus`, modern-en)

**Status:** PARKED at round 2 of 3.
**Date:** 2026-09-21
**Round 1 (draft review + fix):** Claude Sonnet 5 (`claude-sonnet-5`) — self-certified clean.
**Round 2 (independent adversarial fidelity verification):** Claude Opus 5 (`claude-opus-5`) — this document.

**File under review:** `books/wip/green-coriolanus/candidate.json`
sha256 `daabd24d383433a8d906801698ba74b133e2f950316c57b21fb3ae8a50ab5e13`
(matches round 1's claimed hash — re-derived independently, no discrepancy)

**Source anchor:** `books/wip/green-coriolanus/source.json`
sha256 `d0381f3053901dbbf81876e9ef4ce8a4dd2829d40c50c3b199a959c5da8468da`

Scope note: nothing outside this directory was touched. `candidate.json` was
**not** edited in this round — see "Why not fixed here" below.

---

## Why PARKED and not fixed

Round 2 found a **substantive recurring defect class requiring editorial
judgment, not a narrow mechanical slip**: *erasure of the source's own printed
forms* — proper nouns silently swapped for a different-but-related form, the
source's own non-standard spellings normalized to the "correct" modern form,
and deliberate coinages replaced with plain standard words.

This is the **same class that parked Twelfth Night, The Merchant of Venice and
A Midsummer Night's Dream** in this batch (tracker rows 5, 11, 12), and it
reproduces their exact failure pattern: a round-1 single-reviewer pass
certified "zero defects / full coverage", and the class was invisible to it.

It also reproduces the Merchant pattern of a **false verification claim in the
round-1 report itself**: `fidelity-review-1.md` states that "empiricutic" and
"Jack guardant" are "kept, not corrected to plain words" and that "No genuine
proper-noun substitution, case-sensitivity gap, or dropped name [was] found
anywhere in the book." All three statements are false against the file whose
hash that same report pins.

Two further round-1 items are not accidental misses but **defended decisions**
(`Dian`→`Diana`, `Amazonian chin`→`beardless chin`, `VOLSCE`→`VOLSCIAN`) resting
on exactly the "it's just the standard/correct form" rationale that this batch
has already rejected twice (`Abram`→`Abraham`, `Alcides`→`Hercules`). Reversing
a prior round's *reasoned* editorial position, book-wide, across ~26 occurrences
and three sub-classes, is not the narrow mechanical correction that the Bacchae
and Taming precedents allowed a verifier to apply directly. Per the dispatching
instruction and the three-round rule, it is parked for a round-3 fix pass.

---

## Defect inventory

Every location below was derived independently from the two JSON files by
per-paragraph, case-sensitive occurrence mapping — not from round 1's notes.
Indices are **0-based paragraph indices**, chapters 1-based, matching the
files' own array order.

### Class A — proper-noun / demonym form drift (24 occurrences, 12 locations)

**A1. `Volsces` → `Volscians`** — 11 source occurrences at 10 paragraph
locations, replaced. Source uses **both** forms as distinct printed words
(`Volsces` ×23, `Volscians` ×5); the candidate mixes them arbitrarily
(`Volsces` ×13, `Volscians` ×15) and the substitution is **not uniform**, so it
cannot be defended as a documented convention:

| Location | Source | Candidate |
|---|---|---|
| ch4 ¶24 | `Enter the Army of the Volsces...` | `[The Volscian Army enters...]` |
| ch14 ¶3 | `the Volsces stand but as at first` | `the Volscians stand only as at first` |
| ch14 ¶6 | `did curse Against the Volsces` | `cursed the Volscians` |
| ch21 ¶57 | `to all the Volsces` | `to all the Volscians` |
| ch22 ¶28 | `Reports the Volsces with two several powers` | `reports that the Volscians, with two separate forces` |
| ch22 ¶31 | `The Volsces dare break with us` | `the Volscians dare break with us` |
| ch26 ¶7 | `Let the Volsces Plough Rome` | `Let the Volscians plough Rome` |
| ch26 ¶35 | `Aufidius, and you Volsces, mark` | `Aufidius, and you Volscians, mark` |
| ch26 ¶41 (×2) | `destroy The Volsces whom you serve` / `while the Volsces May say` | `destroying the Volscians whom you serve` / `so that the Volscians may say` |
| ch29 ¶42 | `Cut me to pieces, Volsces` | `Cut me to pieces, Volscians` |

Meanwhile the candidate **keeps** `Volsces` at ch1 ¶65/¶69/¶84, ch3 ¶7/¶39,
ch4 ¶26/¶29/¶31/¶40, ch6 ¶8/¶31, ch8 ¶7, ch12 ¶9.

**ch29 ¶42 is the sharpest instance.** Source prints both forms inside one
speech and the candidate flattens the contrast:

> S: `Cut me to pieces, **Volsces**. Men and lads, Stain all your edges on me. ... I Fluttered your **Volscians** in Corioles`
> C: `Cut me to pieces, **Volscians**. ... I fluttered your **Volscians** in Corioles`

**A2. `Volsce` → `Volscian`** — ch19 ¶0 stage direction, `Enter a Roman and a
Volsce.` → `[A Roman and a Volscian enter.]`

**A3. `VOLSCE` → `VOLSCIAN` speaker tag** — 9 occurrences, Act 4 Sc.3 (ch19).
Round 1 explicitly defended this as a uniform demonym-tag expansion. Given A1
and A2, that defence does not hold: the book-wide effect is that source's
printed form `Volsce`/`Volsces` is partially erased, in body text, stage
directions and speaker tags alike. This is the all-caps speaker-tag blind spot
that already cost Bacchae an extra round.

**A4. `Afric` → `Africa`** — ch8 ¶2. `Not Afric owns a serpent I abhor` →
`Africa owns no serpent I loathe`. The sense is right; the source's own
printed place-name form is not.

**A5. `Dian's` → `Diana's`** — ch26 ¶24. `hangs on Dian's temple` → `hanging on
Diana's temple`. Round 1 found this and defended it as "standard modernization
of the goddess's name-form" — the identical rationale rejected for
`Abram`→`Abraham` in Merchant of Venice.

**A6. `Pebleians` → `Plebeians`** — ch13 ¶74. `Enter the Pebleians.` → `[The
Plebeians enter.]`. This is the source's own distinctive non-standard spelling
(it prints `Plebeians` correctly at three other points), silently normalized.
**Round 1 did not report this at all**, despite claiming a dedicated
name-and-spelling sweep.

### Class B — deliberate coinage / mangled-diction erasure (5 locations)

**B1. `empiricutic` → `empirical quackery`** — ch11 ¶41. `The most sovereign
prescription in Galen is but empiricutic` → `is just empirical quackery`.
`fidelity-review-1.md` claims this word was "kept, not corrected to plain
words." It was not.

**B2. `Jack guardant` → `guardian Jack`** — ch25 ¶25. Same false claim in the
round-1 report; the fixed contemptuous compound is reordered into a different
phrase.

**B3. `bisson conspectuities` → `bleary perceptions`** — ch11 ¶25. Menenius's
deliberate double-coinage (both words are the joke) replaced with plain words.

**B4. `Embarquements` → `embargoes`** — ch10 ¶5. Shakespearean coinage
normalized to the standard modern noun.

**B5. `'Sdeath` → `Damn it!`** and `Hollo me like a hare` → `holler after me
like at a hare` — ch1 ¶59, ch8 ¶4. Lower severity (oath modernization is
arguably licensed by the protocol's "modernize formulas" rule), but flagged so
round 3 makes one consistent, documented decision across B1–B5 rather than the
current ad-hoc mix. Note the ch8 ¶4 rendering is also ungrammatical (`like at a
hare`).

### Class C — meaning error (1 location, independent of A and B)

**C1. ch17 ¶5 — `cautelous` mistranslated as `cautious` (false friend).**

> S: `your son Will or exceed the common or be caught With **cautelous** baits and practice.`
> C: `your son will either exceed the common or be caught by **cautious** baits and stratagems.`

`Cautelous` means *deceitful, crafty, treacherous* — not *cautious*. The line is
Coriolanus's vow about being caught by **treachery**, and it is the set-up whose
payoff is Aufidius's conspiracy in Act 4 Sc.7 and Act 5 Sc.6. Rendering it
"cautious baits" makes the sentence close to meaningless and breaks the
cross-scene thread. Round 1's Step-C cross-boundary re-read cites **this exact
line** as verified consistent with its later payoff, which it is not.

### Minor / non-blocking (record for round 3, not parking reasons)

- `Tribunes` capitalization is inconsistent in the candidate: kept capitalized
  at ch16 ¶54, lowercased at ch14 ¶156 and ch22 ¶61 where source capitalizes.
- `Exeunt` (43×) is uniformly rendered `They exit` / `The X exit` — grammatically
  correct plural throughout, so **not** the Merchant defect — but source's own
  `Exit` (20×) is left as literal Latin `Exit`. Inconsistent convention, no
  content loss.
- ch16 ¶54: `our Rome gates` → `our Roman gates`.
- ch29 ¶45: `ALL PEOPLE` gains a period (formatting only).
- ch6 ¶5: `thou speak'st not well` → `you don't speak well of it` adds `of it`.

---

## What round 2 verified as CLEAN

These were re-derived independently from the files and are **not** in dispute;
round 3 should not re-litigate them.

**Structure — exact.** 29 chapters, all real Act/Scene reading units
(Act 1 Sc.1–10, Act 2 Sc.1–3, Act 3 Sc.1–3, Act 4 Sc.1–7, Act 5 Sc.1–6). No
apparatus, editorial-collation, transcriber's-note or scene-crosswalk chapter
on either side. Chapter numbers, titles and per-chapter paragraph counts match
source one-for-one; 1,379 paragraphs total on both sides; zero empty or
whitespace-only paragraphs on either side. Round 1's structural claim holds.

**Round 1's cited fix — independently re-derived and correct.** Re-located by
searching source for the distinctive phrase (not by trusting the cited index):
`Another word, Menenius` occurs exactly once in source, at **ch25 ¶30**, which
matches round 1's citation (no off-by-one, unlike Twelfth Night). Source reads
`Another word, Menenius, I will not hear thee speak.`; the candidate now reads
`Another word, Menenius — I will not hear you speak.` The scholarly-emendation
`Not` is gone and source's ambiguity is preserved. This fix is good.

**Hash — matches.** Independently computed sha256 of `candidate.json` equals
round 1's claimed `daabd24d…ab5e13`. No discrepancy.

**Compression / content-loss sweep — clean.** Word-count ratios computed from
scratch for all 1,379 paragraphs. Full range for paragraphs ≥12 words: **0.80
to 1.36**. No extreme outliers. Per this batch's Cymbeline lesson, the
moderately-compressed band was checked separately: only three paragraphs ≥25
words fall in 0.72–0.85 (ch10 ¶7, ch3 ¶17, ch6 ¶18) and all three were read in
full and are complete. The 20 lowest-ratio and 20 highest-ratio paragraphs of
ordinary length were read in full — no dropped clause, no invented content, no
suspicious expansion.

**Class-contempt and violent content — fully intact, unsoftened.** Read
word-for-word:
- Menenius's belly fable, ch1 ¶28–48 — complete, the "cormorant belly… sink o'
  th' body" insult and the "great toe / lowest, basest, poorest" contempt both
  intact.
- Coriolanus's plebeian-contempt speeches, ch1 ¶51/¶53/¶55/¶57/¶59/¶61 —
  `dissentious rogues… make yourselves scabs`, `you curs, that like nor peace
  nor war`, `thousands of these quartered slaves`, `the rabble`, `you fragments`
  — all preserved, none euphemized.
- ch14 ¶44 `The mutable, rank-scented many` → `the changeable, foul-smelling
  many` — a full modernization of both words, not a softening or a drop.
- Banishment scene, ch16 ¶50–69 — `You common cry of curs, whose breath I hate
  As reek o' th' rotten fens, whose loves I prize As the dead carcasses of
  unburied men That do corrupt my air, I banish you!` complete and unsoftened.
- Gown-of-humility / market-place scene, ch13 ¶20–41 — `Bid them wash their
  faces And keep their teeth clean`, `I have wounds to show you`, the sardonic
  vote-begging — all intact.
- Volumnia's supplication, ch26 ¶36–49 — `tread… on thy mother's womb`, the
  whole escalation, `Down, ladies! Let us shame him with our knees` — complete,
  no dropped clause, no reversed direction.
- Assassination, ch29 ¶35–60 — `Kill, kill, kill, kill, kill him!`, the
  Conspirators' stabbing, `Aufidius stands on him`, `he Hath widowed and
  unchilded many a one` — all intact, correctly attributed.

**Naming transition — correct.** `Martius` before ch9 ¶11, `Coriolanus` from
ch9 ¶14 onward, in both files; the naming ceremony itself (ch9 ¶11,
`call him… Caius Martius Coriolanus!`) is faithful in the candidate.

**Character/place proper nouns — exact, no drift.** Per-paragraph
case-sensitive occurrence maps match one-for-one for: Martius, Marcius, Caius,
Coriolanus, Aufidius, Tullus, Menenius, Agrippa, Sicinius, Velutus, Brutus,
Junius, Volumnia, Virgilia, Valeria, Cominius, Lartius, Titus, Nicanor, Adrian,
Publicola, Antium, Corioles (22/22 — never "Corioli"), Capitol, Tarquin,
Tiber, Antiates, Aedile(s), and the classical allusions Hector, Hecuba,
Penelope, Ithaca, Triton, Neptune, Jove, Juno, Olympus, Mars, Phoebus, Pluto,
Deucalion, Galen, Cato, Censorinus, Hostilius, Ancus, Numa, Lycurguses, Hydra,
Alexander, Hercules. Apparent mismatches on Coriolanus/Sicinius/Brutus/
Virgilia/Valeria/Martius were each opened and confirmed to be italic-markup
(`[_To Valeria_]` → `[To Valeria.]`) normalization only, not name changes —
round 1's finding on that point is correct.

**Coinages that ARE preserved:** `directitude`, `carbonado`, `microcosm`, and
the servingmen's other odd diction in ch21 survive intact. The B-class defects
are therefore inconsistency, not a uniform policy.

---

## Coverage statement for round 2

Independent, source-anchored, not sampled:
- Structural re-derivation of all 29 chapters / 1,379 paragraphs from the JSON.
- Whole-book case-sensitive capitalized-vocabulary diff (source↔candidate),
  every symmetric-difference entry triaged by hand.
- Whole-book per-paragraph, case-sensitive occurrence map for 80+ named
  characters, places, demonyms, classical figures and class-language terms —
  location-keyed, not count-only.
- Whole-book all-caps speaker-tag set diff.
- Whole-book per-paragraph word-count ratio sweep, plus full reads of the
  extreme bands and the moderate-compression band.
- Full word-for-word reads of ch1 ¶28–66, ch9 ¶8–15, ch13 ¶20–41, ch16 ¶50–69,
  ch26 ¶36–52, ch29 ¶35–60, plus every paragraph named in the defect inventory
  and every paragraph flagged by any sweep.

## Next round (3 of 3 — last before hard park)

1. Fix Class A: restore `Volsces`/`Volsce`/`VOLSCE`, `Afric`, `Dian`,
   `Pebleians`, and the `Amazonian chin` allusion (ch12 ¶27 — currently
   `beardless chin`) to the source's own printed forms at the 12 locations
   listed. Gloss, don't replace, where a reader needs help.
2. Fix Class B consistently: restore `empiricutic`, `Jack guardant`, `bisson
   conspectuities`, `Embarquements`; decide and document one policy for period
   oaths (`'Sdeath`), and fix the ch8 ¶4 `like at a hare` grammar.
3. Fix Class C: ch17 ¶5 `cautelous` → *deceitful/treacherous*, not *cautious*.
4. Sweep the minors.
5. Re-verify every changed paragraph against source with neighbouring context,
   re-run structure validation, re-pin a new hash — and have the verification
   done by a session that did not make the fixes.
