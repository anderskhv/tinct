# Acceptance Record — Othello (`othello`, modern-en)

**Book id:** `othello`
**Edition:** `modern-en`
**Accepted:** 2026-09-21

**Model note.**
- Round 1 (drafting/repair + blind accessibility review + first fidelity
  review): **Claude Sonnet 5** (`claude-sonnet-5`). Artifacts:
  `accessibility-review-1.md`, `fidelity-review-1.md`.
- Round 2 (independent adversarial verification, this record): **Claude Opus**
  (`claude-opus-5`). This round did not perform or inherit round 1's edits; it
  re-derived every structural fact, every claimed fix, and the whole-book read
  from `source.json` and `candidate.json` directly, treating round 1's
  self-report as unverified.

**Staged files:** `books/wip/green-othello/source.json` (unmodified),
`books/wip/green-othello/candidate.json` (round-1 corrections + one round-2
correction, below), `books/wip/green-othello/candidate_readable.txt`
(regenerated from the final `candidate.json`).

**Final file hash (candidate.json, sha256):**
`f1795c6e18574a9ffa59bb666366d8810653aa659e86723fdacb4e9eecc4fbb6`

This supersedes round 1's claimed hash
`46bc30c0636030535a680f493e0d3c9ff725c90fe57acc58a20075102538510c`. That hash
was independently confirmed to be the file's correct state *as round 1 left
it* (verified before this round edited anything); it changed only because this
round found and fixed one further defect (Ch3 ¶13, below). The hash above is
pinned to the file's state after that last edit and after re-verifying it
against source.

Source hash (unmodified copy, for reference):
`a8e8ae40b054bce1b60dcba35fcd194f08e74829fcc0faa6665456f962b5d1df`

Per-paragraph hashes of the accepted text: `accepted-paragraph-hashes.tsv`
(1-based `chapter`, `paragraph`, sha256 of the paragraph's UTF-8 text; 1,391
rows).

No app, registry, audio, or deploy action was taken. This directory only. No
paid API calls.

---

## Structure (independently re-derived this round)

Re-derived from the two JSON files, not from round 1's notes:

- 15 chapters in both files, all real Act/Scene reading units: Act 1 Sc.1–3,
  Act 2 Sc.1–3, Act 3 Sc.1–4, Act 4 Sc.1–3, Act 5 Sc.1–2. No apparatus,
  editorial-note, collation, or scene-crosswalk chapters.
- Chapter `number` sequence and `title` strings identical between source and
  candidate; `sections` blocks (5 Acts) identical.
- Per-chapter paragraph counts identical, chapter by chapter: 51, 39, 97, 107,
  3, 132, 36, 6, 179, 106, 169, 119, 51, 97, 199 — **1,391 paragraphs total in
  both files**, order locked, no empty or whitespace-only paragraph on either
  side.
- JSON valid (`python3 -m json.tool`).

(Note on numbering: round 1's review files use 0-based paragraph indices; this
record uses 1-based. Round 1's "Ch9 ¶26" and "Ch9 ¶172" are Ch9 ¶27 and ¶173
here, and its "Ch15 ¶161" is Ch15 ¶162.)

## Round 1's two claimed fixes — re-derived from source

Both re-read in full against `source.json`, whole paragraph, not just the
headline word:

1. **Ch9 ¶27 — "sweet Desdemon".** Source: `OTHELLO. Not now, sweet Desdemon,
   some other time.` Candidate: `OTHELLO. Not now, sweet Desdemon — some other
   time.` Source's affectionate short form is present and correct. Confirmed.
2. **Ch9 ¶173 — Iago's "remorse".** Source: `... Let him command, And to obey
   shall be in me remorse, What bloody business ever.` Candidate: `... Let him
   command, and to obey shall be in me an act of pity, whatever bloody
   business it may be.` The antonym ("remorseless") is gone; the Elizabethan
   sense of `remorse` (pity/compunction) is carried, and the rest of the
   paragraph (the ever-burning lights, the elements, Iago naming himself in the
   third person, "wronged Othello's service") matches source clause for clause.
   Confirmed.

## Desdemona name sweep — full case-sensitive, location-matched

Because this batch has twice been bitten by "fixed one instance, missed its
sibling" (Bacchae's all-caps speaker tag, Taming of the Shrew's fifth "curst"),
every form of the name was mapped by **location**, not by count, and compared
1:1:

- Forms found, identical totals in both files: `DESDEMONA` ×165 (speaker tag),
  `Desdemona` ×60, `Desdemon` ×3.
- Per-`(chapter, paragraph)` multiset comparison across all 1,391 paragraphs:
  **zero differences**. No dropped-here/added-there pair can hide behind the
  matching totals.
- The three short-form occurrences sit at exactly the same coordinates in both
  files: Ch9 ¶27 (×1) and Ch15 ¶162 (×2, `O Desdemon! Dead, Desdemon!`). There
  is no third location where source's short form was normalized away.

The same location-matched sweep was run for 30+ other proper nouns (Othello,
Iago, Cassio, Emilia, Bianca, Roderigo, Brabantio, Montano, Gratiano, Lodovico,
Moor, Cyprus, Venice, Barbary, Turk, Ottomite, Aleppo, Rhodes, Dian, Sagittary,
Mauritania, Propontic, Hellespont, Jove, Janus, Cupid, Anthropophagi, Judean,
Spartan, Michael, Marcus, Florentine, Promethean). Results: all match by
location except the four already-known pronoun disambiguations (below), the
consistent `Ottomite`→`Ottoman` modernization (3/3), and Ch4 ¶101's `these of
Cyprus`→`these Cypriots` (same referent, adjectival form).

## Compression / expansion sweep (this round's own, from scratch)

Word-count ratios recomputed candidate:source for all 1,391 paragraphs.

- Distribution is unusually tight. **Zero** paragraphs of 25 words or more fall
  below 0.85 — i.e. the "moderate compression in ordinary-length paragraphs"
  class that this batch's Cymbeline lane proved an extreme-outlier tripwire
  misses simply does not occur here.
- The 40 lowest ratios were each read in full against source. All are very short
  exchanges where a proportional modernization shortens the line ("Why, I pray
  you?" → "Why, please?"; "Thou told'st me, thou didst hold him in thy hate." →
  "You told me you hated him."). No truncation.
- The 20 highest ratios were read likewise: all are short lines where modern
  syntax needs more words ("Say you?" → "What did you say?"). No invented
  content; no paragraph adds a claim, image, actor or fact absent from source.

## Whole-book word-for-word read (this round, not sampled)

Every one of the 1,391 paragraphs was printed side by side with its source
paragraph and read. The passages the task named for dedicated attention were
read with particular care:

- **Senate scene (Ch3 ¶25–¶97)** — Brabantio's accusations of witchcraft
  ("spells and potions bought from charlatans", "the sooty bosom"), Othello's
  courtship narrative in full ("Her father loved me…", the Anthropophagi, "she
  loved me for the dangers I had been through"), Desdemona's divided-duty
  speech, the Duke's "far more fair than black", Brabantio's parting warning,
  and Iago's closing soliloquy. Faithful throughout; nothing softened.
- **Act 3 Scene 3 in full (Ch9, all 179 paragraphs)** — the whole temptation
  sequence: "Ha, I don't like that", the echoing, "green-eyed monster",
  "beware, my lord, of jealousy", Othello's "Perhaps because I am black",
  "Would you, the supervisor, grossly gape on, behold her topped?",
  "as wanton as goats, as hot as monkeys, as lustful as wolves in pride",
  Cassio's dream, "I'll tear her all to pieces", the Pontic Sea vow and Iago's
  answering vow. All faithful; none of the sexual or violent material softened.
- **Willow song and Emilia's speech (Ch13)** — "If I court more women, you'll
  bed with more men" (source's "mo … mo" preserved in sense, not bowdlerized);
  Emilia's "I might do it as well in the dark"; the full closing argument
  ("Let husbands know their wives have sense like them… the ills we do, their
  ills instruct us so") — complete, clause by clause, nothing dropped.
- **Murder, Emilia's death, final speech (Ch15)** — "Put out the light, and
  then put out the light", the smothering, "Out, whore! … Down, whore!",
  "Cassio lay with her" (source "Cassio did top her" — direct, not euphemized),
  Emilia's "the more angel she, and you the blacker devil", her stabbing and
  "Willow, willow, willow" death, Othello's weapon speech with both `Desdemon`
  occurrences intact, and "Speak of me as I am… the base Judean… the
  circumcised dog". All faithful.

## "Judean" / "Indian" textual crux — checked directly against source

`source.json` prints **`Judean`** at Ch15 ¶191 ("like the base Judean, threw a
pearl away Richer than all his tribe"). The candidate prints `Judean` at the
same location. A whole-book case-insensitive search finds **zero** occurrences
of `Indian` or `Judaean` in either file. No scholarly emendation was imported.
`chrysolite` (Ch15 ¶98) likewise kept as source prints it.

## Defect found and fixed this round (1)

**Ch3 ¶13 — conflated clause relation in the First Senator's strategic
argument.**

Source ends: `We must not think the Turk is so unskilful / To leave that latest
which concerns him first, / Neglecting an attempt of ease and gain, / To wake
and wage a danger profitless.` Two opposed actions: the Turk would not neglect
the easy, profitable attempt (Cyprus) **in order to** rouse and wage a profitless
danger (Rhodes).

The candidate read: `…neglecting an easy and profitable attempt to wake up a
worthless danger.` In modern English the infinitive attaches most naturally to
the preceding noun — "an attempt to wake up a worthless danger" — which
collapses the two opposed actions into one and destroys the contrast the whole
speech turns on. `wage` was also dropped from source's doublet "wake and wage".

Fixed to: `…neglecting an easy and profitable attempt in order to rouse and
wage a profitless danger.`

Classification: narrow and mechanical — the fix restores a relation and a verb
that are explicit in source, invents nothing, and required no interpretive
judgment, so it was applied directly rather than parked (consistent with the
Bacchae precedent for mechanical, unambiguous corrections). Verification after
the edit: exact scoped single-occurrence replacement; whole-file before/after
diff confirms **exactly one paragraph changed** (Ch3 ¶13) across all 1,391;
chapter numbers, titles, counts and order unchanged; JSON valid; no empty
paragraph; new ratio 0.98 (109→107 words).

## Reviewed and judged non-blocking (with reasons)

- **Four pronoun-to-name disambiguations** (Ch1 ¶5 "Othello's own eyes", Ch1 ¶11
  "Go after Othello", Ch3 ¶96 "Cassio" ×2, Ch6 ¶125 "the Moor's ear" + "Cassio").
  Independently located by the proper-noun sweep (not taken on round 1's word)
  and each read in context: in every case the referent is a character named
  explicitly in the same speech moments earlier, and verse line-breaks — which
  modern prose punctuation does not reproduce — are what made the pronoun chain
  followable in source. No figure the source leaves unnamed is named.
- **Ch1 ¶5 opens "Hate him? Hold me in contempt if I don't."** Source is
  "Despise me if I do not." The added question makes source's own ellipsis
  ("if I do not [hate him]", answering Roderigo's line immediately before)
  explicit. It supplies no content that isn't in the two lines it sits between.
- **Ch9 ¶67 "that which all slaves are free from"** for source's "that all
  slaves are free to". Checked specifically for imported-emendation risk: this
  is the standard gloss of source's own words (even slaves are not compelled to
  utter their thoughts), rendered into modern English, not wording lifted from
  another edition. Meaning preserved.
- **Ch15 ¶191 "hardened eyes"** for source's "subdu'd eyes". Editors gloss
  "subdued" both as "overcome (by grief)" and as "not naturally soft"; the
  candidate takes the second. The substance the line carries — a man unused to
  weeping now weeping copiously — is preserved exactly by the following
  clause, which candidate keeps ("though unused to weeping"). Recorded as an
  interpretive choice rather than corrected, since "correcting" it would impose
  the other contested reading.
- **Consistent archaic-synonym modernizations**, verified by location sweep to
  be consistent everywhere they occur: `ancient` (military rank) → `ensign`,
  `napkin` → `handkerchief`, `Ottomite` → `Ottoman`. Same referent in each
  case, no meaningful spelling variant at stake.
- **Frank, violent and racially charged content is at full force throughout.**
  Verified word for word, not spot-checked: "the thick-lipped one" (Ch1 ¶10),
  "an old black ram is mounting your white ewe" (Ch1 ¶21), "covered by a
  Barbary stallion" (Ch1 ¶32), "making the beast with two backs" verbatim
  (Ch1 ¶34), "she'll find a white man who'll fit her darkness" (Ch4 ¶66),
  "strangle her in her bed, even the bed she has contaminated" (Ch11 ¶112),
  Othello's "whore"/"strumpet"/"public commoner" scene (Ch12 ¶38–¶48),
  "Cassio lay with her" (Ch15 ¶94), Emilia's infidelity speech (Ch13 ¶49).
  Nothing diluted, nothing euphemized beyond what modern vocabulary requires.
- **Clown's wordplay preserved** ("thereby hangs a tail" / "Whereby hangs a
  tale"; "to invent a lodging… would be to lie in my own throat") — no
  malapropism erasure anywhere in Ch7 or Ch10.

## Coverage table (this round)

| Step | What this round did | Coverage |
|---|---|---|
| Structure | Re-derived chapter set, numbers, titles, sections, per-chapter and total paragraph counts, empties, JSON validity — from the files | 15/15 chapters, 1,391/1,391 paragraphs |
| Claimed fixes | Both round-1 fixes re-derived from source at their exact locations, full paragraphs read | 2/2 |
| Name sweep | Case-sensitive, location-matched occurrence map for every Desdemona form + 30 other proper nouns | whole book |
| Compression/expansion | Own ratio computation for every paragraph; 40 lowest + 20 highest read in full; explicit check of the moderate-compression band | 1,391/1,391 computed |
| Word-for-word read | Every paragraph printed against source and read; named scenes read with dedicated attention | 15/15 chapters, 1,391/1,391 paragraphs |
| Textual crux | `Judean`/`Indian`/`chrysolite` checked directly in source | whole book |
| Verify + pin | Single scoped edit, before/after whole-file diff, structure revalidation, final hash + per-paragraph hashes | 1/1 edited paragraph |

## Verdict

**ACCEPTED.** Structure matches source exactly; both round-1 fixes are real and
correctly applied; the "sweet Desdemon" family is location-matched 1:1 with no
missed sibling; no softening of the play's racial, sexual or violent content; no
imported edition wording at the Judean crux or elsewhere; no invented content;
one further defect (Ch3 ¶13) was found by this round's independent read, fixed
mechanically, and re-verified. Accepted text is pinned to
`f1795c6e18574a9ffa59bb666366d8810653aa659e86723fdacb4e9eecc4fbb6` with
per-paragraph hashes in `accepted-paragraph-hashes.tsv`.
