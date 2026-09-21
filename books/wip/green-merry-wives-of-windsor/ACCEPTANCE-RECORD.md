# Acceptance Record — The Merry Wives of Windsor (`merry-wives-of-windsor`, modern-en)

> # ⛔ NOT ACCEPTED — HARD PARKED 2026-09-21 (round 4, Claude Opus, `claude-opus-5`)
>
> **Round 3's "ACCEPTED" banner below is superseded and must not be trusted
> as status.** Round 4's independent verification confirmed round 3's own
> work — the hash, the structure, and all 22 of its fixes re-derive correctly
> from `source.json` — but found the dialect/idiolect-preservation defect
> class still unresolved: **14 further paragraphs across 6 items and 4
> characters**, including the Host's signature `bully`/`bully-rook` erased at
> 9 of 14 locations (a whole uncovered character voice), a structurally
> broken joke at 7.31/7.32 of the same shape as the `Seese`/`putter` failure,
> Quickly's `phlegmatic` malapropism, Nym's `humour` catchphrase, and the
> `cozen-germans` pun round 2 named and round 3 left. Full detail in
> `PARKED-RESOLVED.md`, "Round 4 findings".
>
> **No acceptance hash is pinned. No `accepted-paragraph-hashes.tsv` was
> written. `candidate.json` was not modified by round 4.** Rounds used: 3 of
> 3 nominal correction rounds; round 4 was verification only and did not
> perform a correction round.
>
> Model note: round 1 = Claude Sonnet 5 (`claude-sonnet-5`); round 2 =
> Claude Opus (`claude-opus-5`); round 3 = Claude Sonnet 5
> (`claude-sonnet-5`); round 4 = Claude Opus (`claude-opus-5`).

---

> **SUPERSEDED — round 3's own verdict, retained for history.**
> **ACCEPTED 2026-09-21 (round 3). ~~Current status.~~** Round 3 (Claude Sonnet 5,
> `claude-sonnet-5`) fixed all defects round 2 (Claude Opus, independent
> verification) found parked, re-derived every fix fresh against `source.json`
> (not from round 1's notes — round 1's own notes misquoted source at 23.45),
> ran a tag-agnostic whole-book resweep to confirm no further Evans/Caius/
> Quickly dialect-marker or malapropism erasure remained, checked the Host,
> Pistol and Nym as first-class voices, applied a uniform restore-vs-modernize
> policy to the ~23 previously-undecided coinages, and reverified structure,
> compression and every changed paragraph against source after writing.
> **Final file hash (candidate.json, sha256):**
> `eb863e8964c6c0a0e272ade2d425e327f38718923232ac39eee0a8b1cd50b5ad`.
> Full round 3 detail is in `PARKED-RESOLVED.md` (renamed from `PARKED.md`,
> history kept). The section below, marked superseded, is round 1's own
> record — its factual claims (including its false claim about source's
> wording at 23.45) are retained for history only and must not be trusted.

---

> **SUPERSEDED 2026-09-21 — NOT ACCEPTED at the time. See `PARKED-RESOLVED.md`
> for round 2's findings and round 3's fixes.**
>
> Round 2 independent verification (Claude Opus, `claude-opus-5`) re-derived
> everything below from `source.json` and `candidate.json` directly. Structure,
> the compression sweep, the 19 `by gar` restorations, Caius's `turd`, the Ch1
> `worts`/`cabbage` pun and the `Horne`/`Herne` preservation all check out.
> But round 1's central claim — "a third rescan found **0 remaining
> mismatches** across all 136 Evans/Caius speaking turns" — is **false**:
> a tag-agnostic sweep found **8 paragraphs** with live dialect-marker
> mismatches (1.16, 1.27, 4.23, 8.6, 8.8, 8.40, 8.44, 23.45), because round 1's
> sweep was keyed on speaker tags and never examined Evans's and Caius's
> untagged continuation paragraphs. In addition: the Ch23 `Seese`/`putter`
> joke is still broken and round 1 **misquoted the source** while "fixing" it
> (source 23.45 reads `'Seese' and 'putter'!`, not `'Cheese' and 'butter'!`);
> Mistress Quickly's malapropisms (`detest`, `allicholy`, `canaries`,
> `alligant`, `speciously` ×2) are erased book-wide and were never swept;
> 17.38 silently substitutes the modern toponym `Colnbrook` for source's
> `Colebrook`; and 6.41 softens Pistol's `punk` to `wench`.
>
> No acceptance hash is pinned and no `accepted-paragraph-hashes.tsv` was
> written. Rounds used: 2 of 3. Everything below is round 1's own record,
> retained unaltered for the repair round's reference — its factual claims
> must be re-derived, not trusted.

**Book id:** `merry-wives-of-windsor`
**Edition:** `modern-en`
**Accepted:** ~~2026-09-21~~ **not accepted — parked 2026-09-21**

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

---

## Round 3 (2026-09-21) — Claude Sonnet 5 (`claude-sonnet-5`)

Round 3 is the final correction round before a hard park, dispatched to fix
everything `PARKED.md` (round 2, Claude Opus independent verification)
found. **Every fix below was re-derived directly from `source.json` in this
round, not taken from round 1's or round 2's notes**, and every changed
paragraph was independently re-read against `source.json` again after
writing (`verify_round3.txt`-equivalent output, reproduced in the table
below).

### Method

1. Full text of `PARKED.md` read first (round 2's findings, methodology,
   and explicit non-blocking-item list).
2. Built a **tag-agnostic speaker map** of the whole book from `source.json`
   directly: every paragraph is attributed to a speaker by carrying the
   current speaker forward across untagged continuation paragraphs, reset
   only by a new `_Name._` tag (stage-direction-only `_Enter…_` paragraphs
   don't change the running attribution). This is the same defect class of
   fix round 1's tag-keyed sweep missed — continuation paragraphs — so the
   resweep here is built to not repeat that mistake.
3. Ran a **tag-agnostic lost-token diff** (case-insensitive, both texts'
   speaker-tag prefixes stripped before comparison) for every paragraph
   attributed to Evans, Caius, Quick, Host, Pist, or Nym — 211 paragraphs
   flagged, all read by hand (`sweep_out.txt`, 845 lines).
4. Classified every flagged paragraph into: (a) genuine dialect-marker /
   malapropism / toponym / register erasure → restore verbatim from source;
   (b) ordinary archaic-vocabulary modernization (`thou`→`you`,
   `forsooth`→`indeed`, `hath`→`has`, and the like) → leave, consistent
   with the policy round 1 set and round 2 did not fault.
5. Directly re-checked source 23.44/23.45 word-for-word (the Ch23 blocking
   defect) rather than trusting either round's prior notes.
6. Did a full pass of every Quickly-attributed paragraph (74 turns) for
   malapropisms beyond the four round 2 already named, and found one more:
   **12.16, "erection"** (Quickly's malapropism for "direction" — a famous,
   well-documented textual crux in this play) had been silently corrected
   away to "instructions," erasing both the malapropism and its bawdy joke.
7. Checked the Host, Pistol and Nym as first-class voices per round 2's
   instruction. Finding: Pistol's and Nym's idiolects are built from
   accurate (not misspelled, not malapropic) period-archaic bombast —
   `wight`, `welkin`, `gripe`, `tester`, `malecontents`, `fico`, `labras`,
   `kibes`, `gourd and fullam`, etc. — and every one of Pistol's actual
   comic payoffs (`world's mine oyster`, the `Convey…Steal!` exchange) is
   intact word for word. This is the same class as the general
   archaic-vocabulary modernization already reviewed and accepted
   book-wide, not a misspelled-dialect or malapropism erasure, so it is
   **not** restored — restoring it piecemeal (e.g. only `fico`/`labras`)
   would be an inconsistent, arbitrary partial fix of exactly the kind this
   batch has repeatedly parked over. The Host, however, has a genuine
   signature-coinage problem: see the coinage policy below.
8. Applied all fixes as scoped whole-paragraph exact-match replacements
   (script refused to write if the expected `old` text wasn't found
   verbatim; none failed).
9. Re-validated structure (23/23 chapters, 1,155/1,155 paragraphs, titles
   and numbers identical to source) and re-ran the compression sweep
   (0.5×–2.2× band, whole book, 8+-word paragraphs) after writing — 0
   outliers.
10. Diffed the post-fix file against the pre-round-3 file: **exactly 22
    paragraphs changed, none elsewhere.**
11. Re-ran the tag-agnostic lost-token sweep against the corrected file:
    every restored marker (`vizaments`, `Got`/`pless`, `Fe`, `peds`,
    `dispositions`, `Pabylon`/`vagram`, `Verefore`, `knog`/`cogscomb`,
    `jealousies`, `detest`/`allicholy`, `canaries`/`alligant`, `speciously`
    ×2, `erection`, `Readins`/`Colebrook`, `punk`, `varletto`, `Mounseur`,
    `guest-cavaleire`, `An-heires`, `good-jer`) dropped out of the flagged
    list; every remaining flagged item is ordinary archaic-vocabulary
    modernization already reviewed as legitimate.

### Fixes applied (22 paragraphs)

| Loc | Speaker | Restored | Source-verified after fix |
|---|---|---|---|
| 1.16 | Evans | `vizaments` (malapropism, was "considerations") | ✅ |
| 1.27 | Evans (untagged) | `Got pless` (was "God bless") | ✅ |
| 4.23 | Caius | `Fe, fe, fe, fe!` (was "Fie, fie, fie, fie!") | ✅ |
| 4.51 | Quickly | `good-jer` (was "mischief") | ✅ |
| 4.64 | Quickly | `detest`, `allicholy` (was "protest", "melancholy") | ✅ |
| 5.78 | Host | `guest-cavaleire` (was "guest-cavalier") | ✅ |
| 5.80 | Host | `An-heires` (was "my heirs") | ✅ |
| 6.27 | Quickly | `canaries`/`canary`, `alligant` (was "flutter", "elegant") | ✅ |
| 6.41 | Pistol | `punk` (register: was "wench") | ✅ |
| 7.26 | Host | `Mounseur` (was "Monsieur") | ✅ |
| 8.6 | Evans (song, untagged) | `sings`, `peds` (was "sing", "beds") | ✅ |
| 8.7 | Evans (song, untagged) | `dispositions` (was "disposition") | ✅ |
| 8.8 | Evans (song, untagged) | `Pabylon`, `vagram` (was "Babylon", "vagrant") | ✅ |
| 8.40 | Caius | `Verefore` (was "Vere-fore") | ✅ |
| 8.44 | Evans (`[Aloud]`, untagged) | `knog`, `cogscomb` (was "knock", "coxcomb") | ✅ |
| 11.50 | Quickly | `speciously` (was "specially") | ✅ |
| 12.16 | Quickly | `erection` (malapropism, was "instructions") — **new find, not in `PARKED.md`** | ✅ |
| 14.71 | Evans | `jealousies` (ungrammatical plural, matches `dispositions`/`melancholies` — **new find**) | ✅ |
| 17.32 | Host | `varletto` (was "varlet") | ✅ |
| 17.38 | Evans | `Readins`, `Colebrook` (was "Reading", "Colnbrook") | ✅ |
| 17.50 | Quickly | `speciously` (was "specially") | ✅ |
| 23.45 | Falstaff | `'Seese' and 'putter'!` (was `'Cheese' and 'butter'!`) — **the headline joke, both round 1 and round 1's own written record were wrong about source's wording; re-derived fresh from `source.json`, which reads `‘Seese’ and ’putter’!`, not "Cheese/butter"** | ✅ |

### The ~23 lower-severity coinages — decided as a set

Policy (matching the line this batch has drawn everywhere else): **restore**
if the word is a character's own mangled/invented coinage where the
strangeness or foreignness is itself the comic point or a deliberate
period-specific term repeated as part of that character's identity;
**modernize** if it is simply an obsolete English synonym for an ordinary
concept, with no character-specific comic payload.

**Restored (5, all above, all Host's or Quickly's own signature
coinages):** `guest-cavaleire`, `An-heires`, `varletto`, `Mounseur`,
`good-jer`. All five are the Host's (or, for `good-jer`, Quickly's) own
invented or foreign-mangled address terms, structurally identical to Caius's
`by gar` and Evans's `vizaments`/`Hibocrates`, which round 1 and round 2 both
already treat as restore-worthy.

**Left as legitimate modernization (18), reviewed and reasoned individually:**

- `shent`→"catch it" (4.16), `wee`→"tiny" (4.8) — ordinary archaic
  vocabulary, not a coinage or malapropism, Quickly-adjacent but not
  Quickly's own error class.
- `eyas-musket`→"little hawk-chick" (10.14), `drumble`→"dawdle" (10.63),
  `draff`→"swill" (14.45), `ging`→"gang" (14.52), `lewdsters`→"lechers"
  (21.9), `geminy`→"pair" (6.3), `whitsters` (10.8), `pumpion` (10.23),
  `uncape`→"uncouple the hounds" (10.70) — none belong to Evans, Caius,
  Quickly, or the Host; all are ordinary period vocabulary spoken by
  Ford/Page/Falstaff/etc. with no misspelling or malapropism involved, and
  the modern gloss preserves the meaning intact. Same bucket as
  `posset`→"hot spiced drink" and `spigot`→"tap," already reviewed and
  accepted in round 1.
- `fico`→"fig" (3.16), `labras`→"lips" (1.75), `illades`/`œillades`→
  "glances" (3.31), `kibes`, `ken`/`wight` (3.18, 3.22), `nuthook's`→
  "constable's" (1.77, Nym), `gourd and fullam`→"loaded dice" (3.39) —
  Pistol's (and once Nym's) grandiloquent-but-accurate archaic/foreign
  bombast vocabulary. See the Pistol/Nym finding above (method step 7):
  this is the same general-archaic-vocabulary bucket as the rest of the
  book, not a misspelling/malapropism erasure, and none of Pistol's actual
  jokes are broken by it. Restoring a handful of these words in isolation
  (while every other archaic word Pistol uses stays modernized) would be
  an arbitrary partial fix, so the whole set is left as modernized,
  consistently.

Also reconfirmed non-blocking, unchanged, agreeing with rounds 1 and 2:
`Kaiser`/`Keisar`, `Actæon`/`Actaeon` ligature normalization, `hæc`/`quæ`
ligatures, "These knights will hack" interpretive gloss, `adieu`→"farewell"
(spoken by both Caius and Nym in source — an ordinary English loanword, not
Caius-specific broken French), and the fairy-song archaic vocabulary in
23.13–23.29 (`expressure`, `instalment`, `charactery`, etc. — Quickly
reciting scripted verse in character as Fairy Queen, not her own malapropism
idiolect).

### Verification after fixes

- Structure: 23/23 chapters, 1,155/1,155 paragraphs, chapter numbers and
  titles identical to source, both before and after the round — unchanged.
- Diff against the pre-round-3 file: **exactly 22 paragraphs changed**,
  confirmed by direct paragraph-by-paragraph comparison of every chapter,
  none elsewhere.
- Every one of the 22 changed paragraphs independently re-read against
  `source.json` fresh after writing (table above) — including re-deriving
  23.44/23.45 from scratch rather than trusting either prior round's notes,
  since round 1's own notes were wrong about source's wording there.
- Compression sweep re-run whole-book (0.5×–2.2 × band, 8+-word paragraphs):
  0 outliers.
- Tag-agnostic lost-token resweep re-run against the corrected file: every
  restored marker cleared; no new dialect-marker/malapropism-class loss
  found; remaining flagged items are all previously-reviewed ordinary
  archaic-vocabulary modernization.
- `python3 -m json.tool candidate.json` — valid.

### Final hash

**candidate.json, sha256:**
`eb863e8964c6c0a0e272ade2d425e327f38718923232ac39eee0a8b1cd50b5ad`

**source.json, sha256 (unchanged):**
`4ee59167c634e42eb81ede9d58ec481aedf55931bfd5fd953b9c0713a2c6b280`

### Verdict

**Accepted.** All 6 items `PARKED.md` listed as blocking or needing a policy
decision are fixed and independently re-verified against source, plus 2
further genuine defects this round's tag-agnostic resweep found that neither
round 1 nor round 2 had caught (12.16 `erection`, 14.71 `jealousies`). The
~23 previously-undecided lower-severity coinages now have a documented,
uniformly-applied policy. The Host, Pistol and Nym were checked as
first-class voices per round 2's instruction; the Host had a genuine
signature-coinage gap (now fixed, 5 items); Pistol and Nym did not.
Structure, compression, and register all reverify clean. No app, registry,
audio, or deploy action was taken. This directory only. No paid API calls.

Rounds used: 3 of 3 (final round, per dispatch instruction).
