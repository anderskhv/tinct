# Acceptance Record — The Merry Wives of Windsor (`merry-wives-of-windsor`, modern-en)

**Book id:** `merry-wives-of-windsor`
**Edition:** `modern-en`
**Accepted:** 2026-09-21

**Model note.** Full pipeline (structure verification, blind accessibility
review, fidelity review, corrections, re-verification, this record) run in
one dispatch by **Claude Sonnet 5** (`claude-sonnet-5`). Artifacts:
`accessibility-review-1.md`, `fidelity-review-1.md`. No independent
second-reviewer pass has yet run against this text — per the dispatching
instruction, a separate Opus verification pass is expected to follow this
record and is what actually confirms independence; this record documents
round 1 only (drafting-pool correction of an existing candidate plus
same-session re-verification, not a second independent reviewer).

**Staged files:** `books/wip/green-merry-wives-of-windsor/source.json`
(unmodified, locked, sha256
`4ee59167c634e42eb81ede9d58ec481aedf55931bfd5fd953b9c0713a2c6b280`),
`books/wip/green-merry-wives-of-windsor/candidate.json` (this round's
corrections, below), `books/wip/green-merry-wives-of-windsor/candidate_readable.txt`
and `source_readable.txt` (regenerated flat dumps used for the side-by-side
read), `evans_caius_pairs.txt` and `post_fix_verify.txt` (the location-keyed
sweep and per-fix source re-verification working files).

**Final file hash (candidate.json, sha256):**
`cbe6b5d2fabd0fcd74c2d11afea6232c2dbe3d07244eba20a0771421dbdfd0f3`

This is pinned to the file's state *after* all 101 corrections in this round
and *after* the post-fix rescans described in `fidelity-review-1.md` (Step 3),
including the two additional misses (Ch8 ¶49, Ch17 ¶38) and the `Horne`/
`Herne` stage-direction fix caught by that rescan, not to an earlier
mid-round state.

No app, registry, audio, or deploy action was taken. This directory only. No
paid API calls.

---

## Structure

- 23 chapters in both `source.json` and `candidate.json`, all real Act/Scene
  reading units (Act 1 Sc.1–4, Act 2 Sc.1–3, Act 3 Sc.1–5, Act 4 Sc.1–6,
  Act 5 Sc.1–5). No apparatus, editorial-note, collation, or scene-crosswalk
  chapters.
- Chapter `number` sequence and `title` strings identical between source and
  candidate; `sections` empty in both.
- Per-chapter paragraph counts identical, chapter by chapter: 147, 4, 48, 69,
  87, 88, 49, 58, 36, 109, 51, 50, 50, 99, 5, 29, 54, 9, 8, 5, 11, 2, 87 —
  **1,155 paragraphs total in both files**, order locked, no empty or
  whitespace-only paragraph on either side.
- JSON valid (`python3 -m json.tool`). Apparatus-pattern scan: 0 hits.

## What round 1 found and fixed (101 paragraphs, all one defect class + small siblings)

The dominant defect, found by a **location-keyed occurrence map of Evans's
and Caius's accent-marker spelling** (not a count-only sweep) plus a
**rare-word/capitalized-token cross-reference** run against every distinctive
word in `source.json`, was a systematic, book-wide erasure of these two
characters' phonetically-spelled dialect:

- **Sir Hugh Evans (Welsh accent):** every one of the accent-marker
  occurrences across his 87 speaking turns had been silently normalized to
  standard spelling (`Got`→`God`, `petter`→`better`, `prain`→`brain`,
  `'oman`→`woman`, `pless`→`bless`, `tevil`/`tam`→`devil`/`dam`, `fery`→`very`,
  and more — restored, all instances, all locations).
- **Doctor Caius (French accent):** his catchphrase oath **"by gar"** (19
  occurrences across the play, his single most repeated verbal tic) had been
  replaced with "by God" in every instance — restored, all 19. Two lines of
  actual French dialogue (Ch4 ¶23, ¶25) had been translated into English
  instead of preserved — restored to source's French. His broken-syntax
  markers (`Vat`, `dat`, `de`, `vill`) had been *inconsistently* preserved
  (some lines kept, others silently corrected) — brought into line with
  source at every location.
- **Two jokes were structurally broken**, not merely flattened, by this
  erasure and are now restored: Ch1 ¶56–57 (Evans's "goot **worts**" setting
  up Falstaff's "Good worts! Good cabbage" pun) and Ch23 ¶44–45 (Evans's
  "**Seese**"/"**putter**"/"**pelly**" setting up Falstaff's explicit taunt
  "'**Cheese**' and '**butter**'!").
- **Caius's single most-quoted mangled word in the play**, Ch10 ¶104's
  `turd` (for "third"), had been corrected to `third` — restored.
- Smaller siblings of the same class, all restored: Quickly's malapropism
  `fartuous`→`virtuous` (Ch6 ¶33); Evans's malapropism `Hibocrates`→
  `Hippocrates` (Ch8 ¶32); a Folio stage-direction inconsistency (`Horne`
  vs. `Herne` for Falstaff's disguise) silently regularized away at Ch23 ¶0
  — restored to source's own printed `Horne`; `Cotsall` silently modernized
  to `the Cotswolds` (Ch1 ¶36) — restored; a specific insult word `ronyon`
  replaced by a generic "nasty creature" (Ch14 ¶82) — restored; a rare
  period word `frampold` replaced by plain `vexed` (Ch6 ¶31) — restored; the
  recurring nonce doublet `pribbles and prabbles` (Evans, used twice) had
  been rendered two different, inconsistent ways in its two locations —
  brought to a single consistent form matching source in both places (Ch1
  ¶20, Ch23 ¶53), and the `gifts`/`gifts` verbal echo between Slender and
  Evans (Ch1 ¶23–24) restored from an inconsistent `qualities`/`qualities`;
  the verb `cony-catch` rendered inconsistently against its own adjectival
  form `cony-catching` used elsewhere in the same play — brought into line
  (Ch3 ¶19); and one dropped doublet, "assistant, or" (Ch6 ¶82).

Full paragraph-by-paragraph detail, including the exact source and candidate
text for every one of the 101 fixes, is in `fidelity-review-1.md` and
`post_fix_verify.txt`.

## Verification of the applied fixes

- Every fix applied as an exact-match, scoped whole-paragraph replacement
  (each intended `old` text checked against the live file before
  substitution; the apply script refuses to write if any `old` string is not
  found exactly once — none failed on the final pass).
- Before/after diff against the pre-review file (recovered from
  `app/public/data/editions/merry-wives-of-windsor-modern-en.json`, untouched
  by this review) confirms **exactly 101 paragraphs changed** across the
  whole book, all at the intended locations, none elsewhere.
- Every one of the 101 changed paragraphs was independently re-read in full
  against `source.json` after the edit (`post_fix_verify.txt`), not just the
  specific word that was fixed.
- A second, broader case-insensitive accent-marker rescan was then run
  against the *post-fix* file and found 2 further real misses (Ch8 ¶49, Ch17
  ¶38, both instances of accent markers this round's first pass hadn't
  caught) — fixed and re-verified the same way. A third rescan after those
  fixes found **0 remaining mismatches** across all 136 Evans/Caius speaking
  turns.
- Structure revalidated after every edit round: chapter numbers, titles,
  paragraph counts and order, JSON validity, no empty paragraph — unchanged
  throughout.

## Other checks run (whole book, not sampled)

- **Compression/expansion ratio sweep:** word-count ratio computed for every
  paragraph of 8+ source words. **Zero** paragraphs fall outside a 0.55×–2.2×
  band — no truncation or invention outliers anywhere in the book.
- **Location-matched proper-noun/epithet sweep:** ~45 names and recurring
  epithets checked by (chapter, paragraph) coordinate, not just raw count,
  across the whole book (Falstaff, Ford, Page, Anne, Fenton, Slender,
  Shallow, Evans, Caius, Quickly, Pistol, Nym, Bardolph, Robin, Rugby,
  Simple, William, Brook, Windsor, Datchet, Frogmore, Eton, Herne, Brentford,
  Garter, Gloucester, Guiana, Pandarus, Troy, Cataian, Actæon, Amaimon,
  Lucifer, Barbason, Ringwood, Sackerson, Prat, Ephesian, Anthropophaginian,
  Bohemian-Tartar, Hercules, Kaiser/Keisar, and others). Large raw-count
  differences for the principal character names are a file-format artifact,
  not a fidelity issue: source uses abbreviated italic speaker tags
  (`_Fal._`) while candidate spells the full name in every speaker tag
  (`FALSTAFF.`) — a deliberate, uniform accessibility choice, not name
  substitution. After filtering that out, only the `Horne`/`Herne` case
  (above, fixed) and two harmless substring false positives (`manner`
  matching `Anne`; `prate` matching `Prat`) turned up.
- **Whole-book re-read after fixes** (`candidate_readable.txt`, regenerated
  from the final file): confirmed the restored Evans/Caius dialect reads
  naturally and consistently everywhere it appears; confirmed both
  previously-broken jokes now set up and pay off; confirmed the Latin lesson
  scene (Ch13) was already correct and unaffected; confirmed no softening of
  racial/sexual/violent content anywhere (the "Bohemian-Tartar,"
  "Anthropophaginian," "Ethiopian" jesting insults, Ford's jealousy tirades,
  and the buck-basket/disguise sexual innuendo are all present at full
  strength).

## Reviewed and judged non-blocking (with reasons)

- **`Kaiser`/`Keisar` (Ch3 ¶6)** — the Host's own invented escalating comic
  list ("Caesar, Keisar, and Pheezar"), not a real historical name or title
  with a fixed correct form; candidate's spelling modernization doesn't
  change the referent or the joke's structure. Left as is.
- **`Actæon`/`Actaeon` ligature spelling** — a pure orthographic
  modernization of the ligature, applied consistently in both of its
  occurrences (Ch5 ¶32, Ch9 ¶17); the name and its mythological reference are
  unchanged. Left as is.
- **5.15 "These knights will hack"** rendered as "These knights will turn
  out badly" — an interpretive gloss of a genuinely obscure archaic sense of
  "hack" (roughly: knighthoods becoming devalued/common through overuse).
  Reviewed specifically for imported-emendation risk: this is a plausible
  reading of source's own words, not wording lifted from another edition,
  and the surrounding sentence's sense (don't bother changing your title) is
  preserved either way. Recorded as an interpretive choice rather than
  corrected, consistent with this batch's precedent (Othello's "subdu'd
  eyes") for genuinely ambiguous archaic vocabulary.
- **General archaic-vocabulary modernization** (`thine`→`your`,
  `forsooth`→`indeed`, `to-night`→`tonight`, `posset`→`hot spiced drink`,
  `nay-word`→`code-word`, `grandsire`→`grandfather`, `spigot`→`tap`, and
  several hundred similar items surfaced by the rare-word cross-reference)
  — reviewed and judged legitimate, uniform modernization of period
  vocabulary that isn't itself a malapropism, dialect marker, or proper
  noun, applied consistently across all characters. Not corrected.

## Coverage table

| Step | What this round did | Coverage |
|---|---|---|
| Structure | Chapter/paragraph counts, titles, JSON validity, apparatus scan, empty paragraphs | 23/23 chapters, 1,155/1,155 paragraphs |
| Accessibility review (blind) | Full candidate-only read, no source reference | 23/23 chapters, 1,155/1,155 paragraphs |
| Fidelity side-by-side read | Every paragraph read against source | 1,155/1,155 |
| Location-keyed Evans/Caius accent map | Every Evans (87) and Caius (49) speaking turn, word-level, by coordinate | 136/136 speaker turns |
| Rare-word cross-reference | Every 5+-letter source token checked for candidate survival | whole book (566 candidates reviewed) |
| Location-matched proper-noun/epithet sweep | ~45 names/epithets, by coordinate not count | whole book |
| Compression/expansion ratio sweep | Every paragraph of 8+ source words | 1,155/1,155 computed, 0 outliers |
| Fixes applied + verified | Exact scoped replacement, before/after diff, per-paragraph re-check against source | 101/101 fixed paragraphs |
| Post-fix rescan | Case-insensitive accent-marker rescan, 2 further rounds until clean | 0 remaining mismatches |
| Whole-book re-read (step C) | Full re-read of corrected file | 23/23 chapters, 1,155/1,155 paragraphs |

## Verdict

**Round 1 complete, defects found and fixed, re-verified clean by this
round's own methods.** Structure matches source exactly. The book's one real
defect class — systematic erasure of Sir Hugh Evans's Welsh-accented and
Dr. Caius's French-accented dialect, including two structurally broken jokes,
two French sentences translated to English, and Caius's most-quoted mangled
word — is fully restored across all 101 affected paragraphs and independently
re-verified against source. No softening of content found anywhere. No
gross truncation or invention found by the ratio sweep. This record does
**not** itself constitute the independent verification this batch's
protocol requires before a book is treated as fully accepted — see the next
section of the dispatching instruction for the required Opus pass.

Per-paragraph hashes (`accepted-paragraph-hashes.tsv`) and the release
packet are intentionally **not** produced by this round, per the dispatching
instruction — they are the independent verification pass's responsibility
once it confirms this text clean.
