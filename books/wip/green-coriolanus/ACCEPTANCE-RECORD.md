# Acceptance Record — Coriolanus (`coriolanus`, modern-en)

**Book id:** `coriolanus`
**Edition:** `modern-en`
**Status: READY FOR INDEPENDENT VERIFICATION (round 3 of 3, fix round complete).**
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

## Files

- `source.json` — locked, unmodified copy of
  `app/public/data/editions/coriolanus-original-en.json`.
  sha256 `d0381f3053901dbbf81876e9ef4ce8a4dd2829d40c50c3b199a959c5da8468da`
  (unchanged from round 1/2 — this round did not touch it)
- `candidate.json` — sha256
  `413459fc87cb2dc43bd82e3aa39d08a1cb4ce0a65853021fc615e90f276c2d17`
  (round 3's fixed file; supersedes round 1/2's
  `daabd24d383433a8d906801698ba74b133e2f950316c57b21fb3ae8a50ab5e13`)

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

## Result

**READY FOR INDEPENDENT VERIFICATION — sha256 `413459fc87cb2dc43bd82e3aa39d08a1cb4ce0a65853021fc615e90f276c2d17`**

Per the three-round protocol, this was the last round before a hard park.
Round 3 fixed every defect in round 2's inventory and found no further
instances on a fresh, differently-instrumented sweep — but per that same
protocol, the actual acceptance decision belongs to an independent verifier
who did not make these fixes, not to this round's own self-check.
