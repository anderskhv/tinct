# Acceptance Record — Coriolanus (`coriolanus`, modern-en)

**Book id:** `coriolanus`
**Edition:** `modern-en`
**Status: ACCEPTED (round 4, independent verification).**
See `PARKED-RESOLVED.md` for full history (formerly `PARKED.md`).

Round 1 self-certified clean (wrong). Round 2 (independent adversarial
verification) parked the file with a 12-location, 3-class defect inventory.
Round 3 (this round) fixed every location in that inventory, ran a fresh
sweep for further instances of the same defect class, fixed four additional
minor items, and re-verified every changed paragraph against source fresh.

## Model note

| Round | Model | Role | Outcome |
|---|---|---|---|
| 1 | Claude Sonnet 5 (`claude-sonnet-5`) | drafting-adjacent review + fix, self-certified | Found and fixed 1 defect (ch25 ¶30). Wrongly reported "no other defects found anywhere in the book." |
| 2 | Claude Opus 5 (`claude-opus-5`) | independent adversarial fidelity verification | **PARKED.** 12 blocking locations (24 occurrences) across 3 classes, plus false verification claims in round 1's report. |
| 3 | Claude Sonnet 5 (`claude-sonnet-5`) | fix pass on round 2's inventory + fresh defect-class sweep | Fixed all 12 round-2 locations (24 occurrences) + 4 minor items = **35 paragraphs changed**. Fresh sweep (occurrence map + rare-word cross-reference) found no further instances of the same class. Re-verified every changed paragraph against source fresh after applying. |
| 4 | Claude Opus 5 (`claude-opus-5`) | independent final adversarial verification | **ACCEPTED.** Re-derived structure, hash and all 35 round-3 fixes from source independently. Parked defect class confirmed exhausted by a third, differently-instrumented sweep. Found and directly fixed **3 narrow candidate-introduced additions** (the inverse of the parked class, not evidence of it); no other defect found. |

## Files

- `source.json` — locked, unmodified copy of
  `app/public/data/editions/coriolanus-original-en.json`.
  sha256 `d0381f3053901dbbf81876e9ef4ce8a4dd2829d40c50c3b199a959c5da8468da`
  (unchanged from round 1/2 — this round did not touch it)
- `candidate.json` — **ACCEPTED** sha256
  `012fdaaa359726830d58c6745b9e776891360256de19a0aec008f9831abb829c`
  (round 4's file: round 3's `413459fc…f276c2d17` plus exactly 3 narrow
  fixes applied in round 4; supersedes round 1/2's
  `daabd24d383433a8d906801698ba74b133e2f950316c57b21fb3ae8a50ab5e13`)
- `accepted-paragraph-hashes.tsv` — per-paragraph sha256 of the accepted
  `candidate.json` (`chapter`, `paragraph`, `sha256`; both indices 1-based;
  1,379 data rows). Generated in round 4 from the accepted file.

No app, registry, audio, or deploy action was taken. This directory only.

## What round 3 did

**Fixed all 24 occurrences at the 12 Class A locations** (proper-noun/demonym/
spelling form drift), checking source's actual printed form at each location
individually rather than blanket-replacing:

- `Volsces`↔`Volscians` restored to source's exact form at all 10 flagged
  locations (ch4 ¶24, ch14 ¶3, ch14 ¶6, ch21 ¶57, ch22 ¶28, ch22 ¶31, ch26 ¶7,
  ch26 ¶35, ch26 ¶41 [both occurrences], ch29 ¶42 [first occurrence only —
  source itself uses both forms in that one speech, and the candidate's
  second `Volscians` at ch29 ¶42 already matched source and was left alone].
- `Volsce`→`Volscian` restored at ch19 ¶0 stage direction.
- `VOLSCE`→`VOLSCIAN` speaker tag restored at all 9 occurrences in ch19
  (Act 4 Sc.3).
- `Afric`→`Africa` restored at ch8 ¶2.
- `Dian's`→`Diana's` restored at ch26 ¶24.
- `Pebleians`→`Plebeians` restored at ch13 ¶74 (source's own deliberate
  non-standard spelling at this one spot, correctly spelled `Plebeians`
  elsewhere).
- `Amazonian chin`→`beardless chin` restored at ch12 ¶27.

**Fixed all 5 Class B locations** (deliberate coinage/mangled-diction
erasure), applying one consistent policy across the whole class: restore
source's own printed word/word-order in every case, including the two period
oaths, rather than mixing restoration and modernization. Rationale: `'Sdeath`
and `Hollo me like a hare` are Shakespeare's own diction exactly as much as
`empiricutic` or `Jack guardant` are — singling out the oaths for
modernization while restoring the other three coinages was the "ad-hoc mix"
round 2 asked round 3 to resolve, and this project's own precedent (rejecting
`Abram`→`Abraham`, `Alcides`→`Hercules` in sibling books) already comes down
on the side of preserving source's exact printed form wherever the
alternative is silent normalization.

- `empiricutic` restored at ch11 ¶41 (was `empirical quackery`).
- `Jack guardant` restored at ch25 ¶25, source word order (was `guardian Jack`).
- `bisson conspectuities` restored at ch11 ¶25 (was `bleary perceptions`).
- `Embarquements` restored at ch10 ¶5 (was `embargoes`).
- `'Sdeath` restored at ch1 ¶59 (was `Damn it!`).
- `Hollo me like a hare` restored at ch8 ¶4 (was the ungrammatical
  `holler after me like at a hare` — the grammar error is resolved as a
  side effect of the restoration, not patched separately).

**Fixed the Class C meaning error.** ch17 ¶5: `cautelous` (deceitful/crafty/
treacherous) had been mistranslated as `cautious` — a false-friend error that
broke the Coriolanus's-own-prophecy thread paying off in Aufidius's
conspiracy (Act 4 Sc.7, Act 5 Sc.6). Now reads "caught by treacherous baits
and schemes."

**Fixed all four minor items flagged for round 3:**

- ch16 ¶54: `our Roman gates` → `our Rome gates` (source's own noun-as-
  adjective form, not the regular adjective).
- `Tribunes` capitalization: source capitalizes at ch14 ¶156 and ch22 ¶61;
  candidate had lowercased `tribunes` at both. Capitalized to match source
  (ch16 ¶54 already matched source and was untouched).
- ch6 ¶5: dropped the unlicensed `of it` addition — `you don't speak well of
  it` → `you don't speak well` (source has no object here).
- ch29 ¶45 `ALL PEOPLE` period: confirmed non-issue on inspection — it's the
  same speaker-tag punctuation convention (`NAME.`) the candidate applies
  uniformly to every other speaker tag in the book (`MENENIUS.`,
  `CORIOLANUS.`, etc.), source's lack of a period there is a Gutenberg
  formatting quirk, not a content signal. Left as-is.

**Total: 35 paragraphs changed**, matching the sum of 24 Class-A occurrence-
locations + 6 Class-B locations + 1 Class-C location + 4 minors exactly (see
diff verification below).

## Fresh sweep for further instances of the same defect class

Two independent methods, beyond round 2's occurrence-map + capitalized-
vocabulary-diff:

1. **Re-ran the per-paragraph occurrence map** for `Volsces`/`Volscians`/
   `Volsce`/`Volscian`/`VOLSCE`/`VOLSCIAN` after the fixes: source and
   candidate totals now match exactly for every form (`Volsces` 23/23 [see
   note below], `Volscians` 5/5, `Volsce` 3/3, `Volscian` 5/5, `VOLSCE`
   9/9, `VOLSCIAN` 0/0).
2. **Rare-word cross-reference** (the method that caught Twelfth Night's
   "cubiculo" after the occurrence-map method missed it): built a frequency
   table of every word in source that (a) is always capitalized — never
   appears in lowercase form anywhere in source, i.e. a genuine proper noun
   rather than a sentence-initial common word — and (b) occurs 6 times or
   fewer. Checked each for survival (in any case, any suffix form) in the
   candidate. This flagged `Dian` (already fixed) and a handful of
   false positives from apostrophe-tokenization (`Cato's`/`Numa's`/
   `Ulysses's`/`Phoebus's` — all confirmed present and correctly rendered on
   inspection, not defects). **No new genuine instance of the defect class
   was found.**

**One out-of-scope observation, not fixed:** ch4 ¶40 — source's `FIRST
SOLDIER` line describes "the fliers" fleeing (no demonym named); the
candidate renders it "the fleeing Volsces," naming who the fliers are. This
is the *opposite* of the flagged defect (an interpretive addition where
source prints no demonym at all, not an erasure/substitution of a demonym
source does print), was not in round 2's inventory, and is contextually
accurate (the fliers are in fact Volscian soldiers). Recorded for
completeness; not treated as blocking.

## Re-verification method

After applying all 35 edits, every changed paragraph was re-read against
`source.json` fresh — re-locating each by distinctive source phrase, not by
trusting this round's own edit rationale or any prior round's claims (round
1's fidelity report made false claims about two of these exact locations).
All 35 locations independently confirmed to now contain the source's word/
phrase/meaning. See detail below.

## Structural and diff verification

- `json.tool` parse: valid on both files.
- Chapter count: 29/29, matching source one-for-one by chapter number.
- Paragraph counts: 1,379/1,379 total, matching source per-chapter.
- Zero empty/whitespace-only paragraphs.
- Diff against the round-2 `candidate.json` (git `HEAD`): **exactly 35
  paragraphs changed**, all inside the fix set above — no other paragraph
  touched. Diffed paragraph list: ch1 ¶59; ch4 ¶24; ch6 ¶5; ch8 ¶2, ¶4;
  ch10 ¶5; ch11 ¶25, ¶41; ch12 ¶27; ch13 ¶74; ch14 ¶3, ¶6, ¶156; ch16 ¶54;
  ch17 ¶5; ch19 ¶0, ¶2, ¶4, ¶6, ¶8, ¶10, ¶12, ¶14, ¶16, ¶18; ch21 ¶57;
  ch22 ¶28, ¶31, ¶61; ch25 ¶25; ch26 ¶7, ¶24, ¶35, ¶41; ch29 ¶42.

## What remains true from round 2's clean findings (not re-litigated)

Structure, the round-1 `Another word, Menenius` fix, hash provenance chain,
compression/content-loss sweep, class-contempt/violent-content preservation,
the Martius→Coriolanus naming transition, and the 80+ character/place
proper-noun occurrence map were all independently re-derived in round 2 and
are unaffected by round 3's edits (none of round 3's 35 changed paragraphs
overlap that verified-clean set except where explicitly listed as a fix
above).

---

# Round 4 — independent final verification (Claude Opus 5, 2026-09-21)

Performed by a session that made none of rounds 1–3's fixes. Nothing in
rounds 1–3's self-reports was trusted; everything below was re-derived from
`source.json` and `candidate.json` directly.

## 1. Structure and hash — re-derived, exact

- `candidate.json` sha256 as received: `413459fc87cb2dc43bd82e3aa39d08a1cb4ce0a65853021fc615e90f276c2d17`
  — **matches round 3's claim.** `source.json` `d0381f30…5da8468da` — unchanged.
- 29/29 chapters, 1,379/1,379 paragraphs, per-chapter paragraph counts match
  source one-for-one, chapter numbers and titles identical, zero empty or
  whitespace-only paragraphs on either side.

## 2. All 35 round-3 fixes — independently re-derived from source

Each was re-located by searching `source.json` for its distinctive printed
word or phrase, not by trusting any prior round's cited index. All 35 are
present and correct:

- **`Volsces`/`Volscians`/`Volsce`/`VOLSCE`** — verified by a whole-book,
  per-paragraph, case-sensitive occurrence map for all six forms. Source and
  candidate now agree at **every single location** (not merely in total):
  `Volsces` 23, `Volscians` 5, `Volsce` 3, `Volscian` 5, `VOLSCE` 9,
  `VOLSCIAN` 0. The all-caps speaker tag is restored at all 9 ch19 occurrences.
- **ch29 ¶42 — round 3's sharpest claim, confirmed against source.** Source
  prints `Cut me to pieces, Volsces … I Fluttered your Volscians in Corioles`.
  The candidate now reads `Cut me to pieces, Volsces … I fluttered your
  Volscians in Corioles`. Both of source's forms survive, in source's own
  order. Round 3's claim that only the first occurrence needed changing is
  correct.
- `Afric` (ch8 ¶2), `Dian's` (ch26 ¶24), `Pebleians` (ch13 ¶74),
  `Amazonian chin` (ch12 ¶27) — each present in the candidate in source's
  exact printed form; each confirmed as source's own spelling at that
  location, and `Plebeians` confirmed still correctly spelled at the three
  other places source spells it that way.
- Class B — `empiricutic` (ch11 ¶41), `Jack guardant` (ch25 ¶25, source word
  order), `bisson conspectuities` (ch11 ¶25), `Embarquements` (ch10 ¶5),
  `'Sdeath` (ch1 ¶59), `Hollo me like a hare` (ch8 ¶4) — all restored; the
  `like at a hare` grammar error is gone.
- Class C — ch17 ¶5 now reads `caught by treacherous baits and schemes`.
  `cautelous` occurs exactly once in source and `cautious` now occurs zero
  times in the candidate. The Act 4 Sc.7 / Act 5 Sc.6 payoff was read in full
  and the thread is intact.
- Minors — `our Rome gates` restored (ch16 ¶54); `Tribunes` capitalization now
  matches source at all 20 capitalized and all 19 lowercase occurrences,
  location-keyed; the ch6 ¶5 `of it` addition is gone.

## 3. Round 3's flagged non-fix — confirmed real, and fixed in round 4

ch4 ¶40 (0-based). Source: `Following the fliers at the very heels`. The
candidate read `Following the fleeing Volsces right at their heels` — naming
a demonym source does not name there. Confirmed against source. This is the
**inverse** of the parked class (an addition, not an erasure), single-word,
and mechanically removable, so it was fixed directly in this round rather
than parked: now `Following the fleeing men right at their heels`.

## 4. Independent defect-class sweep — third methodology

Rounds 2 and 3 used a per-paragraph occurrence map, an all-caps speaker-tag
diff, a **capitalized**-vocabulary symmetric-difference diff, and a proper-noun
rare-word cross-reference. All of those instruments are blind to **lowercase,
mid-line** vocabulary. Round 4 therefore ran, in addition to re-running the
name maps:

1. **Full bidirectional token-set diff, both directions**, apostrophe- and
   dash-normalized, with a proper-noun filter that keeps only words never
   appearing in lowercase anywhere in source (272 candidates), each then
   checked **location-keyed**, not count-only. Plus an explicit 100-entry
   named-entity/demonym/speaker-tag list checked per paragraph. Result:
   21 paragraph-level differences, every one opened by hand. 18 are
   italic-markup artifacts (`[_To Valeria_]` → `[To Valeria.]`) or
   possessive-style normalization (`Martius'` → `Martius's`); 1 is a
   capitalization-only change (`the senate's` → `the Senate's`, ch14 ¶61);
   1 is a licensed paraphrase (`they of Rome` → `the Romans`, ch2 ¶1);
   and 1 was a genuine addition — see §5.
2. **Lowercase hapax sweep** — every source word occurring exactly once
   book-wide and absent from the candidate in any form (913 entries after
   prefix artifacts, hand-scanned). This is the instrument neither prior round
   had. It surfaced ~35 obsolete/rare words rendered into modern equivalents
   (`mammocked`→`mangled`, `foxship`→`the cunning of a fox`,
   `undercrest`→`live up to`, `godded`→`made a god of me`,
   `unhearts`→`disheartens`, `inshelled`→`shelled away`, `o'erpeer`→`see
   over`, `dotant`→`old dotard`, `lockram`, `reechy`, `malkin`, `provand`,
   `fatigate`, `shunless`, `traducement`, `unbuild`, `empoisoned`,
   `virgined`, `cranks`, `potch`, `coign`, `budger`, `factionary`,
   `seamark`, `unactive`, `unvulnerable`, `unproperly` …).

   **Ruled not defects.** Each was opened in context and the meaning is fully
   and accurately carried over in every case. Modernizing obsolete *ordinary*
   vocabulary is the licensed core operation of a `modern-en` edition; round
   2's Class B was scoped to words whose strangeness is itself the point —
   nonce-coinages and mock-jargon. That boundary is now held consistently:
   `directitude`, `carbonado`, `microcosm`, `empiricutic`, `bisson
   conspectuities`, `Jack guardant`, `Embarquements`, `'Sdeath` and
   `Hollo me like a hare` all survive verbatim, while ordinary obsolete
   diction is rendered. After three rounds this is a coherent, defensible,
   uniformly applied policy rather than round 2's "ad-hoc mix."

**Conclusion: the parked defect class (erasure of source's own printed forms)
has zero remaining instances.**

## 5. Independent compression / content-loss sweep — clean

Word-count ratios recomputed from scratch for all 1,379 paragraphs. For the
663 paragraphs of ≥12 words the **full** range is **0.80 – 1.29**; no
paragraph anywhere is a summary or an invention. Read in full, against
source: the 25 lowest-ratio and 25 highest-ratio paragraphs of ordinary
length, and — per this batch's Cymbeline lesson — every paragraph of ≥25
words in the moderate 0.70–0.88 band (ch10 ¶7, ch3 ¶17, ch6 ¶18, ch1 ¶56,
ch11 ¶19, ch13 ¶41). All complete: no dropped clause, no merged sentence, no
invented content, no softening. Numbers are preserved throughout (`seven`,
`nine`, `twenty-five`, `twenty-seven` wounds at ch11 ¶55–58; `seventeen
battles` at ch12 ¶27).

## 6. Word-for-word reads of scenes prior rounds had NOT covered

Round 2 read ch1 ¶28–66, ch9 ¶8–15, ch13 ¶20–41, ch16 ¶50–69, ch26 ¶36–52 and
ch29 ¶35–60 in full. Round 4 read, in full and line-by-line against source,
scenes outside that set:

- **ch12 — Act 2 Sc.2** (Capitol / Cominius's oration / Coriolanus refuses the
  gown), all 51 paragraphs.
- **ch15 — Act 3 Sc.2** (Volumnia persuades him to dissemble), all 50
  paragraphs.
- **ch14 — Act 3 Sc.1** (the riot and arrest), ¶0–85, including the
  `rank-scented many`, the Triton-of-the-minnows and Hydra speeches, and the
  `double worship` speech.
- **ch23 — Act 4 Sc.7** (Aufidius and his Lieutenant; the conspiracy's
  germ and the osprey speech), all 9 paragraphs.
- **ch20 — Act 4 Sc.4** (Coriolanus disguised in Antium; `O world, thy
  slippery turns`), all 13 paragraphs.
- **ch11 — Act 2 Sc.1** (Menenius baits the tribunes), ¶20–60.

All clean. Nothing softened, nothing dropped, nothing invented, speaker
attribution correct throughout.

## 7. Round 4's own fixes — 3 paragraphs

All three are the **inverse** of the parked class: small interpretive
*additions* of material source does not contain. Three instances across 1,379
paragraphs, each removable by deleting one word or one bracket, found by an
instrument no prior round had run — narrow and mechanical, not evidence of an
unresolved pattern, so fixed directly under the same precedent that allowed
direct correction in Bacchae and Taming.

| Location | Source | Was | Now |
|---|---|---|---|
| ch4 ¶40 | `Following the fliers at the very heels` | `the fleeing Volsces` | `the fleeing men` |
| ch12 ¶27 | `He stopped the flyers` | `the fleeing Romans` | `the fleeing men` |
| ch1 ¶79 | `Lead you on. Follow Cominius.` (no stage direction) | `Lead on. [To Cominius.] Follow Cominius.` | `Lead on. Follow Cominius.` |

Verified after the edits: `git diff` shows **exactly 3 changed lines**, all
three inside the table above, no other paragraph touched. `json.tool` parses.
Structure re-validated at 29/29 chapters and 1,379/1,379 paragraphs. The
six-form Volsce occurrence map and the inline-bracket-addition sweep both
re-run to zero differences on the final file.

## 8. Coverage table across all four rounds

| Check | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| Structure / paragraph-count re-derivation | claimed | ✅ derived | ✅ re-derived | ✅ re-derived |
| sha256 provenance chain | claimed | ✅ verified | ✅ re-pinned | ✅ re-verified + re-pinned |
| Named-entity occurrence map (location-keyed) | ✗ missed class | ✅ capitalized set | ✅ ≤6-occurrence proper nouns | ✅ 272-name auto set + 100-name explicit list |
| All-caps speaker-tag diff | ✗ defended as correct | ✅ found `VOLSCE` | ✅ fixed 9× | ✅ re-verified 9/9 |
| Volsce(s)/Volscian(s) six-form map | ✗ | ✅ found 12 locations | ✅ fixed, per-location | ✅ zero diffs at every location |
| Coinage / mangled-diction sweep | ✗ false claim | ✅ capitalized-word based | ✅ fixed 5 locations | ✅ **lowercase hapax sweep** (new instrument) — clean |
| Compression / content-loss sweep | claimed | ✅ from scratch | — | ✅ from scratch, incl. moderate band |
| Candidate-introduced-addition sweep | ✗ | ✗ | partial (1 flagged, unfixed) | ✅ full — 3 found, all 3 fixed |
| Inline stage-direction addition sweep | ✗ | ✗ | ✗ | ✅ full — 1 found, fixed |
| Word-for-word scene reads | partial | Act 1 Sc.1, 1.9, 3.2 mkt, 3.3, 5.3, 5.6 | changed paragraphs only | Act 2 Sc.1–2, Act 3 Sc.1–2, Act 4 Sc.4, Act 4 Sc.7 |
| Per-paragraph accepted hashes | ✗ | ✗ | ✗ | ✅ `accepted-paragraph-hashes.tsv` |

## Result

**ACCEPTED — `candidate.json` sha256
`012fdaaa359726830d58c6745b9e776891360256de19a0aec008f9831abb829c`**
(`source.json` unchanged: `d0381f3053901dbbf81876e9ef4ce8a4dd2829d40c50c3b199a959c5da8468da`)

Per-paragraph hashes of the accepted file are pinned in
`accepted-paragraph-hashes.tsv` (1,379 rows, 1-based chapter and paragraph
indices). Any future change to this edition must re-open acceptance.

Scope: nothing outside `books/wip/green-coriolanus/` was touched. No app,
registry, audio, deploy or API action was taken.
