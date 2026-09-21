# Fidelity Review 1 — The Merry Wives of Windsor (`merry-wives-of-windsor`, modern-en)

**Indexing convention:** all paragraph indices in this document are
**0-based** within their chapter — `[chapter.index]` means
`chapters[chapter-1]['paragraphs'][index]` (chapter numbers are 1-based as
printed; paragraph indices are 0-based array positions). This matches the
`[N.M]` labels used in `evans_caius_pairs.txt`, `post_fix_verify.txt`, and the
side-by-side dump generated during this review.

## What was read

Every one of the 1,155 paragraphs in `candidate.json` was compared against
the corresponding paragraph in `source.json`, in full, not sampled — first as
a continuous side-by-side read (all 23 chapters), then a second time via two
targeted sweeps described below, then a third time (whole-book re-read,
Fidelity step C) after fixes were applied.

## Step 0 — structure verification

- 23 chapters in both files, all real Act/Scene units (Act 1 Sc.1–4, Act 2
  Sc.1–3, Act 3 Sc.1–5, Act 4 Sc.1–6, Act 5 Sc.1–5). No apparatus, editorial,
  collation, or scene-crosswalk chapters; titles are clean reader-facing
  labels.
- Per-chapter paragraph counts identical in both files, chapter by chapter:
  147, 4, 48, 69, 87, 88, 49, 58, 36, 109, 51, 50, 50, 99, 5, 29, 54, 9, 8, 5,
  11, 2, 87 — **1,155 paragraphs total in both files**, order locked, no
  empty/whitespace-only paragraph on either side.
- `sections` blocks empty in both files (no hierarchical sub-sections used
  for this play, consistent with prior Shakespeare books in this batch).
- JSON valid throughout (`python3 -m json.tool`).
- Apparatus scan (`] SCENE`, `SCENA`, `Transcriber`, `Pope`, `Rowe`,
  `Hanmer`, `Capell`, `Collier`, `Ff`, `F1–F4`, `conj.`, `om.`) — 0 hits.

## Step 1 — full side-by-side read (round 1)

Read every paragraph of `candidate.json` next to `source.json`. Found no
dropped content, no actor/speaker misattribution, no reversed meaning, no
invented claims, and confirmed several deliberately preserved items directly
against source: `Custalorum`/`Rato-lorum`/`Armigero` (Ch1), `careires`
(Ch1 ¶82, Bardolph's malapropism), `Cataian` (Ch5 ¶41), `videlicet`→wait,
see below (this one was *not* correctly preserved on first pass — see Step 2),
the full Latin declension scene word-for-word (Ch13), and the bawdy/violent
content at full strength throughout (Ford's jealousy tirades, Falstaff's
buck-basket ordeal, the fairy-pinching scene).

One narrow, mechanical defect found and fixed in this pass (not part of the
class below): Ch6 ¶82 had silently dropped the doublet "assistant, or" from
source's "her assistant, or go-between, parted from me," leaving just
"go-between." Restored to match source's doublet exactly.

## Step 2 — the actual finding: systematic erasure of Evans's and Caius's dialect

This is the book's real, book-wide defect, and it is exactly the failure
class the task named up front. A location-keyed occurrence count of accent
markers turned up something a simple proper-noun sweep would have missed
entirely, because the erasure wasn't of a name — it was of **two characters'
entire comic voice**:

- **Sir Hugh Evans** (Welsh-accented English): source consistently spells his
  accent phonetically — `Got` for God, `petter` for better, `prain` for
  brain, `pless`/`Pless` for bless, `'oman` for woman, `tevil`/`tam` for
  devil/damn, `fery` for very, `peard` for beard, `pody` for body, `pad` for
  bad, `knog` for knock, `goot` for good, `possitable` for positively,
  `fidelicet` for videlicet, `preeches` for breeched, `vlouting-stog(s)` for
  flouting-stock(s), and more — across **87 of his speaking turns**. A
  location-matched scan (`grep`-style, per paragraph, not just a count) found
  that **every single one** of these accent-marker occurrences had been
  silently normalized to standard spelling in the candidate: `Got`→`God`
  (7/7 occurrences), `petter`→`better`, `prain`→`brain`, `'oman`→`woman`
  (0/9 surviving), and so on, with no exceptions found anywhere in the play.
- **Doctor Caius** (French-accented English): source gives him a mix of
  broken-English syntax markers (`Vat`, `dat`, `de`, `vill`, `me have`/`me
  vill`, `tree` for three) *and* his own catchphrase oath, **"by gar"**,
  which recurs **19 times** across the play — his single most repeated verbal
  tic, on the order of Nym's "humour" or Pistol's bombast. The broken-syntax
  markers were partly preserved in the original candidate (inconsistently —
  some lines kept `Vat`/`dat`, others silently corrected them to `What`/
  `that`), but **every one of the 19 "by gar" occurrences had been replaced
  with "by God"** — a total, not partial, erasure of his signature phrase.
  Two lines also had actual **French sentences translated into English**
  (Ch4 ¶23: `ma foi, il fait fort chaud. Je m'en vais à la cour — la grande
  affaire` rendered as plain English; Ch4 ¶25: `Oui; mette le au mon pocket:
  dépêche` likewise) — this is not accent-flattening, it is substituting the
  content of the French-speaking character's actual French for an English
  paraphrase, which erases the source's own deliberate code-switching joke
  (a Frenchman lapsing into French under stress, immediately followed by more
  broken English).
- Two specific **jokes were structurally broken** by this erasure, not just
  stylistically flattened:
  - Ch1 ¶56–57: Evans says "goot **worts**" (his mispronunciation of
    "words"); Falstaff's next line puns on it — "Good **worts**! Good
    cabbage" (a wort being a plant). The candidate had corrected Evans's line
    to "good words," leaving Falstaff's "Good worts! Good cabbage" reply
    referencing a word that was never said — nonsensical without the fix.
  - Ch23 ¶44–45: Evans says "**Seese** is not good to give **putter**; your
    **pelly** is all putter" (cheese/butter/belly); Falstaff's next line is
    an explicit taunt about the mispronunciation itself — "**'Cheese' and
    'butter'!** Have I lived to stand at the taunt of one who makes fritters
    of English?" The candidate's already-corrected Evans line ("Cheese is
    not good to give butter") made Falstaff's quoted taunt refer to words
    Evans had not actually mispronounced.
- Two further, narrower malapropism erasures of the same class, not tied to
  the accent system specifically:
  - Ch6 ¶33: Quickly's own malapropism `fartuous` (for "virtuous") had been
    corrected to `virtuous`.
  - Ch8 ¶32: Evans's malapropism `Hibocrates` (for "Hippocrates") had been
    corrected to `Hippocrates`.
  - Ch10 ¶104: Caius's most famous single mangled word in the whole play —
    `turd` for "third" ("If dere be one or two, I shall make-a the **turd**")
    — had been silently corrected to `third`, deleting what is usually
    flagged as one of the play's most quoted jokes.
- One further case of a **name silently regularized to a "consistent" form
  the source itself does not use**: the stage direction at Ch23 ¶0 reads
  `Enter FALSTAFF disguised as Horne` in source — a known Folio
  inconsistency (`Herne` is used in dialogue throughout, but this one stage
  direction prints `Horne`). The candidate had "corrected" this one
  occurrence to `Herne` for consistency with the rest of the play. Restored
  to `Horne` exactly as source prints it, per this batch's standing rule to
  reproduce the source's own printed form even where it looks like an
  inconsistency or an error.
- A handful of smaller items in the same general vein, also restored:
  Ch1 ¶36 `Cotsall`→`the Cotswolds` (a period place-name spelling silently
  modernized to the current toponym — restored to source's own form);
  Ch14 ¶82 `ronyon`→`nasty creature` (a specific, distinctive period insult
  word replaced with a generic descriptor); Ch6 ¶31 `frampold`→`vexed` (a
  rare but genuine period word replaced with a plain synonym, losing the
  distinctive rare word); Ch1 ¶20/¶23–24/Ch23 ¶53: the recurring nonce
  doublet `pribbles and prabbles` (used twice by Evans, at Ch1 ¶20 and
  Ch23 ¶53) had been rendered two different, inconsistent ways in the two
  locations (`quibbles and quarrels` and `prittles and prattles`) — restored
  to source's own doublet, unchanged, in both places, and the `gifts`/
  `gifts` echo between Slender (Ch1 ¶23) and Evans (Ch1 ¶24) restored
  (candidate had it as `qualities`/`qualities`); Ch3 ¶19 `cony-catch`→`catch
  dupes` (the same verb is correctly kept as `cony-catching` adjectivally at
  Ch1 ¶58 elsewhere in the play — restored the verb form at Ch3 ¶19 for
  internal consistency with the play's own recurring word).

## Method used to find this (both required sweeps, run)

1. **Location-keyed occurrence map**, not count-only: every Evans/Caius
   paragraph was pulled into a side-by-side file (`evans_caius_pairs.txt`,
   136 paragraph pairs), and every accent-marker word was checked at its
   *exact* (chapter, paragraph) coordinate against candidate, not just
   totalled across the book — this is what caught the ~10% of Caius lines
   that had *partially* preserved accent markers next to lines that hadn't
   (a pattern a pure count would average out and miss).
2. **Rare-word/capitalized-token cross-reference**: every token of 5+
   letters in `source.json` was checked for case-insensitive survival
   anywhere in `candidate.json`. This produced 566 non-matches, the large
   majority of which are ordinary, uniform archaic-vocabulary modernization
   (`thine`→`your`, `forsooth`→`indeed`, `to-night`→`tonight`, etc. — legitimate
   and applied consistently to every character, not flagged). Filtering that
   list by hand for genuinely distinctive/rare tokens is what surfaced
   `fartuous`, `frampold`, `ronyon`, `Hibocrates`, and confirmed the Evans/
   Caius accent words already found by the location sweep.

## Step 3 — corrections applied (Step D)

All 101 corrections were applied with exact scoped whole-paragraph
replacement (each `old` string matched against the live candidate text
before substitution; any non-exact match would have raised an error and
blocked the write — none did on the final pass). After applying:

- `validate_structure`-equivalent checks re-run: 23/23 chapters, 1,155/1,155
  paragraphs, titles and chapter numbers unchanged, no empty paragraph, JSON
  valid.
- Before/after diff against the original (pre-review) `candidate.json`
  (recovered from `app/public/data/editions/merry-wives-of-windsor-modern-en.json`,
  which this review never modified) confirms **exactly 101 paragraphs
  changed, in the intended locations, and no others** — no paragraph outside
  the scope of these fixes was touched.
- Every one of the 101 changed paragraphs was independently re-read against
  `source.json` after the edit (see `post_fix_verify.txt` for the full
  side-by-side of every fix against its source line) — not just the specific
  word that was fixed, but the whole paragraph, to check for actor/negation/
  causality drift introduced by the edit itself.
- A second, broader location-keyed accent-marker rescan (case-insensitive,
  over all Evans/Caius paragraphs) was then run against the *post-fix* file
  and found 2 further real misses (Ch8 ¶49 `dat`→`that`; Ch17 ¶38
  `vlouting-stocks`→`laughing-stocks`, a *second* occurrence of the same
  word already fixed once at Ch8 ¶55) — both fixed and re-verified the same
  way, plus the `Horne`/`Herne` stage-direction fix. Final total: **101
  changed paragraphs.**

## Step 4 — proper-noun/epithet sweep (location-matched, whole book)

Ran a location-matched occurrence count for ~45 proper nouns and recurring
epithets (Falstaff, Ford, Page, Anne, Fenton, Slender, Shallow, Evans, Caius,
Quickly, Pistol, Nym, Bardolph, Robin, Rugby, Simple, William, Brook,
Windsor, Datchet, Frogmore, Eton, Herne, Brentford, Garter, Gloucester,
Guiana, Pandarus, Troy, Cataian, Actæon, Amaimon, Lucifer, Barbason,
Ringwood, Sackerson, Prat, Ephesian, Anthropophaginian, Bohemian-Tartar,
Hercules, Kaiser/Keisar, and others). Large raw-count mismatches for the main
character names (Falstaff, Ford, Slender, Shallow, Quickly, etc.) are a false
signal from the file format, not a fidelity issue: source uses abbreviated
italic speaker tags (`_Fal._`, `_Shal._`) while candidate spells the full
name in the speaker tag every time (`FALSTAFF.`, `SHALLOW.`) — a deliberate,
consistent accessibility choice applied uniformly, not name substitution.
After filtering that format effect out, only the `Herne`/`Horne` stage
direction (above, fixed) and two substring false positives (`manner`
matching `Anne`; `prate` matching `Prat`) turned up — no other
proper-noun-form drift found. `Actæon`/`Actaeon` ligature normalization
(2/2 consistent both directions) and `Keisar`/`Kaiser` (the Host's own
invented escalating-list coinage, not a real name) were reviewed and judged
acceptable orthographic modernization, not name substitution to a different
referent.

## Step 5 — whole-book re-read after fixes (Fidelity step C)

Re-read the complete, corrected `candidate.json` end to end
(`candidate_readable.txt`, regenerated from the final file) with particular
attention to:

- Every Evans and Caius line, checking the restored accent reads naturally
  and consistently (it does — Welsh/French phonetic spelling is
  self-decoding to a modern reader the same way source's is, and no new
  inconsistency was introduced: a rescan in Step 3 above confirms 0
  remaining marker mismatches anywhere in either character's dialogue).
- The two joke-dependent lines (Ch1 ¶56–57 "worts"/"cabbage" and Ch23
  ¶44–45 "Seese"/"putter"/"Cheese"/"butter") — both now set up and pay off
  correctly.
- The Latin lesson scene (Ch13) in full — unaffected by this class of defect
  (it was already correctly preserved verbatim in Latin, including the
  "horum"/"hang-hog"/"Jenny's case" obscenity puns).
- Racial/period content (the "Bohemian-Tartar," "Anthropophaginian,"
  "Ethiopian" jesting insults; Ford's jealousy tirades; the sexual innuendo
  around the buck-basket and Falstaff's disguise) — all present at full
  strength, none softened.
- No further defects found on this re-read beyond the 3 caught by the
  targeted rescan in Step 3 (which were fixed before this re-read began).

## Coverage table

| Step | What was checked | Coverage |
|---|---|---|
| Structure | Chapter/paragraph counts, titles, JSON validity, apparatus scan, empty paragraphs | 23/23 chapters, 1,155/1,155 paragraphs |
| Side-by-side read (round 1) | Every paragraph read against source | 1,155/1,155 |
| Location-keyed Evans/Caius accent map | Every Evans (87) and Caius (49) speaking turn, word-level | 136/136 speaker turns |
| Rare-word cross-reference | Every 5+-letter source token checked for survival in candidate | whole book (566 candidates reviewed) |
| Location-matched proper-noun/epithet sweep | ~45 names/epithets, location not just count | whole book |
| Fixes applied + verified | Exact scoped replacement, before/after diff, per-paragraph re-check against source | 101/101 fixed paragraphs |
| Post-fix rescan | Case-insensitive accent-marker rescan over all Evans/Caius lines | 0 remaining mismatches |
| Whole-book re-read (step C) | Full re-read of corrected file | 23/23 chapters, 1,155/1,155 paragraphs |

## Verdict

Structure matches source exactly. One narrow, book-wide defect class found
and fully corrected: systematic erasure of Sir Hugh Evans's Welsh-accented
and Dr. Caius's French-accented English (including two structurally broken
jokes and two French sentences translated to English), plus a small number
of individual malapropism/name-form erasures in the same class found by the
rare-word and location sweeps. All content, sexual/racial/violent material,
and comic mechanisms are otherwise intact and unsoftened. 101 paragraphs
corrected across round 1; final file re-verified clean against source
paragraph by paragraph.
