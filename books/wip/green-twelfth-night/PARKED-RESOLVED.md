# PARKED → RESOLVED — Twelfth Night (`twelfth-night`, modern-en)

> **CLOSED 2026-09-21 — the park is lifted.** Round 4 (independent
> adversarial verification, Claude Opus 5) re-derived everything below from
> `source.json` and `candidate.json` without trusting round 3's self-report
> and **ACCEPTED** the book. The recurring defect class documented here has
> no remaining instances; no new defect class was found; round 4 made no
> edits. Final candidate.json sha256
> `2388962f1d10a2619b72d9e47f74f4b695abe9eeb87bb9bd4d235c9e4c8b7374`.
> See `ACCEPTANCE-RECORD.md` for the acceptance and the round-4 findings,
> and the round-4 section at the bottom of this file for how round 3's
> honest "I cannot certify this is the last one" warning was tested.
> Everything below is kept as history.

**Status (historical):** PARKED after round 2 (independent adversarial verification).
**Parked:** 2026-09-21
**Round 1 (drafting/repair + self-review):** Claude Sonnet 5 (`claude-sonnet-5`).
**Round 2 (independent verification, this record):** Claude Opus 5 (`claude-opus-5`).

**Files as parked:**
- `source.json` sha256 `bf69ddee77f588e6032f726a7cb81a18b3d60ca37f380ed2d76a5f9d756baed3` (unmodified, never edited)
- `candidate.json` sha256 `ec5f6ffdceec193c10b578106f90e97a4ac1d7fe3b09431c5f58e55cd00b890c`

The candidate hash **does** match round 1's claimed hash — that part of round 1's
record is accurate, and no edits were made in round 2. Nothing in this directory
was changed except the addition of this file and a superseding banner on
`ACCEPTANCE-RECORD.md`. No app, registry, audio, SEO or deploy action was taken.
No paid API calls were made.

---

## Why parked rather than fixed

Round 2 found **12 fresh defects in a single coherent recurring class** —
*erasure of the source's own printed forms* — spread across 8 chapters, in a
book where round 1 explicitly certified this exact class clean ("no
inconsistent epithet rendering found anywhere in the book," "whole-book
case-sensitive proper-noun/epithet occurrence sweep," and by name: "'Sowter'
— left unglossed"). That claim is false: `Sowter` is not in the candidate at
all.

One of round 1's three fixes was itself a member of this class (Sir Andrew's
`incardinate`). Round 1 fixed the single instance it found and then certified
the class book-wide clean. Round 2 found nine more instances of the *same*
class, including one in the very scene round 1 was reading when it made the
certification (Ch10, the box-tree scene, two paragraphs from the M.O.A.I.
riddle it discussed at length).

This is the documented park shape from this batch — Midsummer (malapropism
erasure surviving two fix rounds, 3 more found in round 3), Gilgamesh
(softening class only partially fixed, 6 more in round 3), Frederick Douglass
(imported wording surviving three rewrites). It is also not narrow or
mechanical: deciding *which* of these to restore verbatim and which are
legitimate modernization (is `coystril`→`wretch` a loss? is `equinoctial`→
`equator` inside a deliberately nonsensical phrase?) is a line-drawing
judgment that has to be made consistently across the whole book by the
editing owner, not patched instance by instance by a verifier. Per the task's
instruction, I did not fix.

---

## Defects found (round 2) — all paragraph numbers 1-based

### Class A — proper nouns replaced by generic descriptors

| # | Loc | Source | Candidate |
|---|---|---|---|
| A1 | Ch10 ¶70 | "**Sowter** will cry upon't for all this, though it be as rank as a fox." | "**The hound** will bay at it anyway…" |
| A2 | Ch10 ¶83 | "…a pension of thousands to be paid from **the Sophy**." | "…paid by **the Shah of Persia**." |
| A3 | Ch14 ¶126 | "They say he has been fencer to **the Sophy**." | "…fencing master to **the Shah of Persia**." |
| A4 | Ch15 ¶28 | "**Rudesby**, be gone!" | "**Rude fellow**, be gone!" |

**A1 is the most serious.** Sowter is a named dog. The candidate deletes the
name and substitutes a category noun. The surrounding dog imagery survives
intact (¶72's "The cur is excellent at faults" → "…at false trails"), so this
is not a systematic de-doggifying — it is specifically the *name* that was
dropped. Round 1's records name Sowter twice as a preserved, deliberately
unglossed allusion.

**A2/A3** are worse than a gloss: rather than clarifying "the Sophy" they
*replace* it, importing an editorial identification into the reading text. The
protocol permits brief clarification of a term the source makes explicit; it
does not permit substituting the identification for the source's own noun.
Both instances render identically, so this was a deliberate book-wide choice,
not a slip — which is exactly why it needs an owner's decision, not a patch.

### Class B — source's own printed forms silently normalized to the standard form

| # | Loc | Source | Candidate |
|---|---|---|---|
| B1 | Ch10 ¶98 | "To the gates of **Tartar**" | "To the gates of **Tartarus**" |
| B2 | Ch18 ¶119 | "he holds **Belzebub** at the stave's end" | "he holds **Beelzebub** at staff's length" |
| B3 | Ch8 ¶37 | "My lady's a **Cataian**" | "My lady is a **Cathayan**" |

This is the batch's first carried-forward lesson verbatim: *"Never silently
'correct' a name/spelling/quotation to a historically standard form —
reproduce the source's own printed form."* Same class as the Bacchae
speaker-tag case and the Medea name correction. All three survived round 1's
"case-sensitive whole-book occurrence sweep," because a count-based or
name-list-based sweep cannot see a form that was replaced by a *different*
spelling of the same referent — the lesson Ivan Ilyich already produced
("round 1's whole-book name audit was count-based and missed a location
mismatch"). A location-keyed map catches these; a count does not.

### Class C — deliberate malapropisms and coinages erased (same class as round 1's own fix #3)

| # | Loc | Source | Candidate |
|---|---|---|---|
| C1 | Ch3 ¶16 | "they are scoundrels and **substractors** that say so" | "…is a scoundrel and a **slanderer**" |
| C2 | Ch14 ¶126 | "I have not seen such a **firago**." | "I have never seen such a **fury**." |
| C3 | Ch5 ¶27 | "**Dexteriously**, good madonna." | "**Skillfully**, good madonna." |
| C4 | Ch8 ¶39 | "**Tilly-vally!** 'Lady'!" | "**Pish!** 'Lady'!" |
| C5 | Ch18 ¶123 | "you must allow **_vox_**." | "you must allow **the proper voice**." |

C1 (`substractors` for "detractors") and C2 (`firago` for "virago") are Sir
Toby's own manglings, structurally identical to Sir Andrew's `incardinate`
that round 1 restored. C3 is Feste's Folio form. C4 substitutes a different
interjection for a distinctive source coinage. C5 drops an italicized Latin
term the source sets off as a term.

Borderline members of the same family, listed for the owner's decision but not
counted as blocking on their own: Ch3 ¶18 `coystril`→"wretch"; Ch8 ¶11
`equinoctial`→"equator"; Ch8 ¶38 `consanguineous`→"her blood-relation";
Ch8 ¶47 `Sneck up!`→"Go hang yourself!".

### Class D — isolated meaning drift (not part of the above pattern)

| # | Loc | Source | Candidate |
|---|---|---|---|
| D1 | Ch13 ¶16 | "SEBASTIAN. **I do remember.**" | "SEBASTIAN. **I'll remember.**" |

Antonio has just said "To th' Elephant" (¶15). Sebastian's "I do remember"
is present recollection of the inn already named in ¶11; the candidate turns
it into a future undertaking. Narrow and mechanically fixable on its own, but
recorded here rather than patched, since the file is parked.

---

## Round 1 record accuracy (for the next owner)

Independently re-derived, not taken from round 1's notes:

- **Structure — round 1 correct.** 18 chapters, all real Act/Scene reading
  units (Act 1 Sc.1-5, Act 2 Sc.1-5, Act 3 Sc.1-4, Act 4 Sc.1-3, Act 5 Sc.1),
  no apparatus/editorial/crosswalk chapters, reader-facing titles identical in
  source and candidate. 1,120 paragraphs in each, per-chapter counts match
  exactly (10/23/70/17/139/14/9/103/50/100/74/32/17/190/35/68/7/162), no empty
  or whitespace-only paragraphs, `sections` key absent in both.
- **All 3 round-1 fixes are genuinely present and genuinely match source** —
  re-derived from `source.json` and read in full paragraph, not headline word:
  `dam'd-colour'd stock` → "damned-colored stocking" (not emended to
  flame/dun/damask); `constancy` restored verbatim in Feste's opal sign-off;
  `incardinate` restored verbatim.
- **Round 1's paragraph numbering is off by one throughout.** Every location
  it cites (Ch3 ¶65, Ch9 ¶32, Ch18 ¶75) is 0-based reported as if 1-based; the
  actual 1-based locations are Ch3 ¶66, Ch9 ¶33, Ch18 ¶76. Documentation-only
  — the text is correct — but it makes the record unusable for re-derivation
  and is the same indexing-mismatch-between-rounds problem that cost Taming of
  the Shrew a round. **The next owner should fix the numbering convention in
  all review artifacts.**
- **Round 1's "no other defects found anywhere in the book" is not reliable.**
  See the 12 above. Its coverage claim (18/18 chapters, 1,120/1,120
  paragraphs, non-sampled) cannot be squared with missing `Sowter` in a scene
  it discusses paragraph by paragraph.

## What round 2 verified clean

These were read word-for-word against source and are clean; the next round
does not need to redo them from scratch, but should re-verify anything it
edits:

- **Willow-cabin speech** (Ch5 ¶116-127) — clean, imagery and rhetorical shape
  intact.
- **Letter-reading / "C's, U's, T's"** (Ch10 ¶44-82) — the bawdy joke is
  reproduced letter for letter including "her great P's"; `M.O.A.I.` riddle,
  `Lucrece` seal, `Jove`, the verse and the prose postscript all intact and
  unsoftened. (The Sowter defect A1 sits inside this range at ¶70.)
- **Box-tree gulling** (Ch10 ¶10-100) — clean apart from A1 and B1.
- **Duel-arrangement scene** (Ch14 ¶108-141) — clean apart from A3 and C2;
  "hob, nob," "unhatched rapier," "on carpet consideration," grey Capilet,
  Viola's "how much I lack of a man" aside all present.
- **Final recognition/reunion** (Ch18 ¶88-115) — clean; the mole, the thirteen
  years, "a maid and man," Messaline all intact.
- **Feste's songs** — "O mistress mine," "Come away, come away, death," "I am
  gone, sir," and the closing "When that I was and a little tiny boy" (all five
  stanzas, Ch18 ¶157-161) — all preserved essentially verbatim; no stanza
  dropped, no refrain flattened.
- **Compression sweep, re-derived from scratch** — word-count ratios computed
  for all 1,120 paragraph pairs. 22 paragraphs of ordinary length (source ≥20
  words) fell below 0.92 and were read in full: all benign, no dropped clause
  or claim. The 45 lowest-ratio paragraphs overall (mostly short lines) and the
  20 highest-ratio (expansion check for invented content) were also read in
  full: no invented content, no omission.
- **Proper-noun / epithet map, location-keyed and case-sensitive** — built
  fresh over Viola/Cesario, Orsino, Olivia, Malvolio, Sir Toby/Belch, Sir
  Andrew/Aguecheek, Maria, Feste/Clown, Sebastian, Antonio, Fabian, Curio,
  Valentine and their ALL-CAPS speaker-tag forms. Speaker-tag sets match
  exactly; no character renamed, merged or normalized; the `SIR ANDREW`/
  `AGUECHEEK` alternation is preserved in its source locations. The only
  location deltas were the Sowter and Tartar losses above, plus benign
  capitalization ("the duke"→"the Duke", Ch4 ¶2) and the legitimate
  "County's man"→"Count's man" (Ch5 ¶135).
- **Book-wide capitalized-token loss sweep** — every capitalized non-sentence-
  initial token in source checked for presence in its own candidate paragraph;
  135 hits triaged, all archaic verb forms and contractions except the Class A
  and Class B losses listed above.

## Recommended next steps for the editing owner

1. Decide the **book-wide policy** first, then apply it once: source's own
   printed proper nouns and coinages are reproduced; a clarification may be
   added beside them but never substituted for them. That single decision
   resolves A1-A4, B1-B3, C1-C5 and the four borderline items consistently.
2. Apply with `content_edit_helpers.safe_replace()` + `assert_only_changed()`
   + `validate_structure()`, per `TRANSLATION_PROTOCOL.md` step D.
3. Fix the 0-based/1-based numbering convention in all review artifacts.
4. Re-run an independent verification round. Note this book has now consumed
   2 of its 3 rounds.


---
---

# ROUND 3 — RESOLUTION (Claude Sonnet 5)

**Round 3 performer:** Claude Sonnet 5 (`claude-sonnet-5`).
**Date:** 2026-09-21.
**Status: READY FOR INDEPENDENT VERIFICATION** — round 3 fixed all 12
defects round 2 found, plus one additional same-class instance found by
round 3's own dedicated sweep. Full disclosure of that 13th instance is
below; this is reported honestly, not hidden, per this round's
instructions.

## What round 3 did

1. Independently re-derived every one of round 2's 12 defect locations
   (plus the 1 isolated meaning-drift item) directly from `source.json`
   before touching anything — given this exact book has already had one
   0-based/1-based indexing bug between round 1 and round 2, no location
   was taken on faith. All 13 locations round 2/the task cited were
   confirmed correct on re-derivation (1-based, matching
   `paragraphs[p-1]` for chapter number `ch`).
2. Applied 13 fixes with `content_edit_helpers.safe_replace()` — one
   target string per fix, each checked for a unique match before
   replacing. Two of the fixes (`firago`→ and `the Sophy`→) landed in
   the same paragraph (Ch14 ¶126), so 13 fixes touched 12 paragraphs.
3. **Caught and corrected its own mid-round error before finishing:** the
   first pass on Ch18 ¶119 (`Belzebub`) accidentally wrote "the stave's
   length" — a hybrid of source's "stave" and the candidate's own
   "length," a string that appears in neither file. Re-read after the
   first round of fixes caught this; corrected to restore only the
   flagged word (`Belzebub`) and leave the candidate's existing
   "staff's length" phrasing untouched, since "stave's end" vs. "staff's
   length" was never part of the flagged defect (only the `Belzebub`/
   `Beelzebub` spelling was) — restoring the whole phrase to source
   would have gone beyond the assigned fix and re-archaized wording the
   translation is entitled to modernize.
4. Ran a dedicated fresh sweep for other instances of the same defect
   class (proper-noun erasure / standard-spelling normalization /
   malapropism erasure), beyond the 12 round 2 already found. Method:
   - Re-checked round 2's own 4 "borderline, not blocking" items
     (`coystril`→wretch, `equinoctial`→equator, `consanguineous`→her
     blood-relation, `Sneck up!`→Go hang yourself!) — confirmed these are
     ordinary archaic-vocabulary modernizations, not proper nouns or
     character-specific coinages, and left them as round 2 judged
     (documented, not blocking).
   - Checked every source term set off with `_italics_` (Shakespeare/
     Gutenberg convention for stage directions, Latin, and quoted verse)
     for verbatim survival in candidate. ~30 hits, all benign
     (capitalization-only or thee/thou→you modernization inside verse
     and stage directions, e.g. "Exeunt Sir Toby, Sir Andrew and Maria"
     → "Exeunt Sir Toby, Sir Andrew, and Maria").
   - Built a rare-word sweep: every word appearing exactly once in
     `source.json` (1,190 words, length ≥6, stopwords excluded) checked
     for survival anywhere in `candidate.json`. 408 were absent from the
     candidate; each was spot-checked. The overwhelming majority are
     ordinary archaic-English vocabulary legitimately modernized under
     the protocol's "rebuild difficult syntax/vocabulary in ordinary
     words" rule (`wainropes`→wagon-ropes, `staniel`→kestrel,
     `haggard`→wild hawk, `gaskins`→trousers, `bawcock`→fine fellow,
     `clodpole`→clodhopper, `nayword`→byword, `duello`→rules of dueling,
     `cloistress`→cloistered nun, `chantry`→chapel, `peascod`→peapod,
     `testril`→tester, `barricadoes`/`clerestories`→barricades/upper
     windows, `impressure`→impression, `welkin`→sky, `coz`→cousin,
     `Quaffing`→drinking, `'Slid`→By God, `perdy`→by God). None of these
     are proper nouns, non-standard spellings of a *different* word
     (the Tartar/Tartarus, Belzebub/Beelzebub, Cataian/Cathayan class),
     or a specific character's invented/mangled word — they are the
     ordinary business of a modern-English rendering and the protocol
     explicitly permits them.
   - **One genuine new instance of the flagged class found:** Ch12 ¶19,
     Sir Toby's `cubiculo` (his own invented mock-Latin word for
     "chamber," structurally identical to `firago` for "virago,"
     `substractors` for "detractors," and `incardinate` for "incarnate"
     — all fixed elsewhere in this book across rounds 1-3) had been
     replaced outright with "your room." Fixed with a minimal
     `safe_replace`: "We'll call for you in your room." → "We'll call
     for you at the cubiculo." — restoring the coinage while leaving the
     candidate's existing modernized phrasing ("for you," not "thee")
     alone, consistent with how every other fix in this round restored
     only the flagged word/phrase, not the surrounding modernization.
5. Re-ran `validate_structure` per chapter (all 18 pass: correct chapter
   number, matched paragraph count/order, no empty paragraphs) and a
   `diff_report`-equivalent comparison of the current file against the
   round-2 parked state (git commit `bb631250`, whose candidate.json
   sha256 matches `PARKED.md`'s declared round-2 hash exactly, confirming
   no other drift occurred between rounds): **exactly 13 paragraphs
   changed, matching the 13 fixes applied (12 assigned + 1 fresh
   `cubiculo` find), and nothing else.**
6. Independently re-verified all 13 fixed locations fresh against
   `source.json` after all edits were applied (not trusting the fix's
   own stated rationale) — all 13 target words/phrases (`Sowter`, `the
   Sophy` ×2, `firago`, `Rudesby`, `Tartar`, `Belzebub`, `Cataian`,
   `substractor`, `Dexteriously`, `Tilly-vally`, `_vox_`, `I do
   remember`, `cubiculo`) are present at their exact locations, and none
   of the erased forms they replaced (`The hound`, `Shah of Persia`,
   `fury`, `Rude fellow`, `Tartarus`, `Beelzebub`, `Cathayan`,
   `slanderer`, `Skillfully`, `Pish!`, `the proper voice`, `I'll
   remember`, `your room`) remain anywhere in those paragraphs.

## Fix table (all 13 changes, final)

| # | Loc | Restored to | Judgment note |
|---|---|---|---|
| 1 | Ch10 ¶70 | "Sowter" | Named hound restored verbatim. |
| 2 | Ch10 ¶83 | "the Sophy" | Editorial identification removed; source's own title restored. |
| 3 | Ch14 ¶126 | "the Sophy" | Same, second occurrence. |
| 4 | Ch15 ¶28 | "Rudesby" | Proper epithet restored. |
| 5 | Ch10 ¶98 | "Tartar" | Not "Tartarus" — a different referent (Central Asia vs. the Greek underworld); source's own word restored. |
| 6 | Ch18 ¶119 | "Belzebub" | Source's own spelling restored; "staff's length" (candidate's existing modernization of "stave's end") deliberately left alone — round 3 initially over-corrected this and caught/fixed its own error (see above). |
| 7 | Ch8 ¶37 | "Cataian" | Source's own spelling restored (distinct historical/ethnic term from "Cathayan"). |
| 8 | Ch3 ¶16 | "substractor" | Sir Toby's own coinage restored. |
| 9 | Ch14 ¶126 | "firago" | Sir Toby's own coinage restored. |
| 10 | Ch5 ¶27 | "Dexteriously" | Feste's Folio-form coinage restored. |
| 11 | Ch8 ¶39 | "Tilly-vally!" | **Judgment call, restored as-is.** The exclamation's comic force doesn't depend on being parsed literally (it's a nonsense interjection even to the source's own first readers) — plain restoration keeps it legible without needing a gloss, matching how `Pigrogromitus`/`Queubus` are left unglossed elsewhere in this book. |
| 12 | Ch18 ¶123 | "_vox_" | **Judgment call, restored as-is.** This is inside the specific "vox" wordplay mechanism (Feste demanding to be "allowed vox" — a specific performative/Latin term — before reading the mad letter "as it ought to be"), a term-of-art the surrounding joke depends on, not decorative flavor. Restoring it (with its italic marking, matching source) is necessary for the joke to survive as a joke rather than flattening it into a generic request. |
| 13 | Ch12 ¶19 | "cubiculo" | **Fresh find, round 3's own sweep, not in the assigned 12.** Same class as #8-10 (Sir Toby's own invented mock-Latin coinage for "chamber"). Restored with a minimal edit, leaving the candidate's surrounding modernized phrasing intact. |

D1 (Ch13 ¶16, "I do remember" vs. "I'll remember") — confirmed and fixed
as an isolated tense/meaning drift, not part of the erasure pattern, per
the task's own classification.

## Honest disclosure — a 4th wave, not a 3rd

The task instructions asked for honesty if round 3's own sweep turned up
*more* fresh instances of this defect class beyond what round 2 already
found, since that would mean the pattern is not yet under control. It
did: `cubiculo` (Ch12 ¶19) is a genuine, uncontested member of the same
class (a Sir Toby-invented mock-Latin coinage, parallel to `firago`,
`substractors`, and round 1's own `incardinate`) that neither round 1 nor
round 2 found, in a chapter (Ch12, Act 3 Sc.2) neither round's sweep
notes specifically call out as fully read.

This is the third time in three rounds that this exact failure class
(erasure of source's own printed proper nouns / non-standard spellings /
character-specific coinages) has produced at least one previously-missed
instance:
- Round 1: fixed 1 instance (`incardinate`), certified the class clean
  book-wide, and was wrong — round 2 found 9 more instances of the exact
  same sub-pattern (character coinages/malapropisms silently corrected)
  plus the proper-noun and spelling sub-patterns round 1 never
  distinguished.
- Round 2: found 12 fresh instances via a systematic location-keyed
  sweep and explicitly declined to fix them (task-scoped to verification
  only), documenting 4 further borderline items for an owner decision.
- Round 3 (this round): fixed all 12 of round 2's + round 1's earlier
  fix, and its own dedicated sweep (rare-word cross-check, italic-term
  cross-check, direct re-check of round 2's borderline items) turned up
  **one more**, previously unflagged by either prior round.

**What this means, stated plainly:** the underlying cause — the
drafting/repair pass's tendency to silently normalize a source's
deliberately non-standard, invented, or historically specific wording
into a "cleaner"-looking modern equivalent — is a systematic tendency of
how this class of edit gets made, not a fully enumerable finite list of
mistakes that gets shorter each round by a fixed amount. Three
consecutive rounds have each found at least one instance the previous
round(s) missed, using progressively more systematic sweep methods (round
1: none stated; round 2: location-keyed proper-noun/epithet map,
count-based; round 3: rare-word cross-reference across the whole source
vocabulary, italic-term cross-check).

Per the task's explicit instruction, this is **not** grounds for an
automatic re-park — it is the same already-identified narrow/mechanical
class, round 3 fixed what it found, and the book has now used its
nominal 3 rounds. But the honest state of confidence for the next
verifier is: round 3's sweep is more exhaustive than round 2's (it adds
a full rare-word cross-reference that round 2's method — a curated
proper-noun/epithet map — could not have caught, since `cubiculo` is not
a proper noun or an epithet), but "no further sweep would find another
instance" is not something round 3 can certify with confidence given the
track record. An independent round-4-equivalent verifier should treat
the rare-word cross-reference method above (every source word appearing
exactly once, checked for survival in candidate, triaged by hand) as the
higher-recall method going forward, and should not assume 13/13 is
necessarily the true final count.

## Final verification

- `validate_structure`: all 18 chapters pass (correct chapter numbers,
  matched paragraph count 1,120/1,120, matched order, no empty/
  whitespace-only paragraphs on either side).
- Word-count ratio tripwire: 1 flagged paragraph book-wide (Ch3 ¶32,
  "Fare you well, gentlemen." → "Farewell, gentlemen.", ratio 0.60) —
  pre-existing, untouched by any round-3 edit, read and confirmed benign
  (a short line legitimately compresses further in modern idiom; no
  content lost).
- Diff against the round-2 parked state (git commit `bb631250`, hash-
  verified to match `PARKED.md`'s declared candidate hash exactly):
  **exactly 13 paragraphs changed** — Ch3 ¶16, Ch5 ¶27, Ch8 ¶37, Ch8 ¶39,
  Ch10 ¶70, Ch10 ¶83, Ch10 ¶98, Ch12 ¶19, Ch13 ¶16, Ch14 ¶126, Ch15 ¶28,
  Ch18 ¶119, Ch18 ¶123. The 12 assigned fixes touch 12 distinct
  paragraphs (two of the 12 fix operations — `firago`→ and `the Sophy`→
  — both landed in Ch14 ¶126), plus 1 more paragraph (Ch12 ¶19) for the
  fresh `cubiculo` find, giving 13 paragraphs changed for 13 fix
  locations total. No paragraph outside this set changed.
- All 13 fixed locations independently re-read against `source.json`
  fresh, after all edits: all match source's exact wording; none of the
  erased forms they replaced remain.

**Final candidate.json sha256:**
`2388962f1d10a2619b72d9e47f74f4b695abe9eeb87bb9bd4d235c9e4c8b7374`
**Source.json sha256 (unchanged, still never edited):**
`bf69ddee77f588e6032f726a7cb81a18b3d60ca37f380ed2d76a5f9d756baed3`

## Status

**READY FOR INDEPENDENT VERIFICATION.** No app, registry, audio, SEO, or
deploy action was taken. No paid API calls were made. This directory
only. This book has now used all 3 of its nominal rounds — the next
verifier should read the honest-disclosure section above before treating
a clean pass as final, and is encouraged to run the rare-word
cross-reference sweep method described above rather than relying solely
on a proper-noun/epithet map, given that method is what caught the one
instance (`cubiculo`) that a proper-noun-shaped sweep structurally
cannot catch.


---
---

# ROUND 4 — INDEPENDENT VERIFICATION: ACCEPTED (Claude Opus 5)

**Round 4 performer:** Claude Opus 5 (`claude-opus-5`).
**Date:** 2026-09-21. **Verdict: ACCEPTED. Park lifted.**
**Edits made in round 4: none.** `source.json` and `candidate.json` are
byte-for-byte as round 3 left them.

## What round 4 re-derived rather than trusted

- **Both file hashes**, recomputed: candidate
  `2388962f…4c8b7374` and source `bf69ddee…9d756baed3` — both match round
  3's declared values exactly.
- **Structure**, re-derived fresh from both files: 18 chapters, 1,120
  paragraphs, per-chapter counts, chapter numbers, reader-facing titles,
  top-level keys, absence of empty paragraphs, and the full speaker-tag
  set with per-tag counts — all exact matches.
- **All 13 round-3 fixes**, each located by searching `source.json` for
  the distinctive term rather than by trusting any cited paragraph number
  (this book has already lost a round to a 0/1-based mismatch). All 13
  confirmed at their stated 1-based locations, all restoring source's
  exact wording, and none of the 13 replaced forms surviving anywhere.
  Round 1's 3 fixes were re-confirmed too.

## How round 3's honest warning was tested

Round 3 stated plainly that it could not certify 13/13 as the true final
count, since each of rounds 1-3 had found at least one instance every
earlier round missed. Round 4 attacked that directly with methods no
earlier round had run in this combination:

1. **Reverse capitalized-token sweep** — every capitalized token the
   *candidate* introduces that is absent from its own source paragraph.
   This is the only method that structurally catches an *imported*
   editorial identification (the `the Sophy`→"Shah of Persia" shape), as
   opposed to a *lost* source form. 55 hits, all contractions or ordinary
   word choices. **None anywhere in the book.**
2. **Near-variant normalization sweep** — for every source word missing
   from its own candidate paragraph, look for a close spelling-variant
   present in that same paragraph. This is the precise signature of
   `Cataian`→`Cathayan` / `Belzebub`→`Beelzebub` / `Tartar`→`Tartarus`,
   and unlike a name list or a hapax cross-reference it finds them without
   knowing in advance what to look for. 262 hits, all read in context.
3. **Named-entity count check** over 47 proper nouns, foreign phrases and
   coinages — every count matches source exactly.
4. **Whole-vocabulary missing-word sweep** (3,138 source types, 840 absent
   from the candidate, hand-triaged) — a superset of round 3's hapax
   method.
5. **Location-keyed capitalized-token loss sweep** — 419 raw hits filtered
   to 79 genuine proper-noun candidates, each read in full.
6. **Italic-marker parity check** on all 1,120 pairs — 108 deltas, every
   one the consistent stage-direction convention; all sung verse, letter
   text and Latin terms keep their marking.
7. **Compression/content-loss sweep** recomputed from scratch over all
   1,120 pairs (mean ratio 1.02); every outlier read in full — no dropped
   clause, no dropped claim, no invented content.
8. **257 paragraphs read word-for-word across 9 chapters deliberately
   chosen for being outside the known hot spots** — Ch1, 2, 4, 7, 11
   (the Feste/Viola wit duel), 12, 13, 16 (Sir Topas dark house), 17.

**Result: no remaining instance of the class, and no new class of
defect.** The coinages this book kept losing are all present and correct —
and Feste's `impeticos` and `gratillity` (Ch8 ¶12), which no round had
specifically checked, survive verbatim. The songs were re-read in full and
are verbatim, including all five stanzas of the closing song.

## Closest surviving relatives — judged permitted, recorded for the owner

`Signior`→`Signor` (Ch10 ¶2, Ch14 ¶117) · `viol-de-gamboys`→`viol-da-gamba`
(Ch3 ¶14) · `sink-a-pace`→`cinquepace` (Ch3 ¶65) · `renegado`→`renegade`
(Ch12 ¶28) · `huswife`→`housewife` (Ch3 ¶55) · `Hallow`→`halloo` (Ch5 ¶126)
· `triplex`→`triple` (Ch18 ¶23) · `cockatrices`→`basilisks` (Ch14 ¶93) ·
`kick-shawses`→`fancy moves` (Ch3 ¶59).

Every one is an orthographic or common-noun modernization, not a proper
noun, a referent swap, or a character-specific coinage — the same line
rounds 2 and 3 drew when they explicitly permitted `barricadoes`,
`wainropes`, `staniel`, `bawcock` and `coystril`. The candidate applies
that line consistently across the whole book; **no referent is changed
anywhere.** Recorded here so a future owner can revisit the line itself if
they want to, not as unfixed defects.

## Why this is a genuine close and not a fourth "clean" self-certification

The two earlier clean claims that turned out wrong were both made by the
round that had just done the editing, about a class it had just touched.
Round 4 did no editing, had no stake in the fix list, located every claim
by independent search, and — most importantly — used two sweep shapes
(reverse-direction and near-variant) that would have surfaced the
previously-missed instances (`Sowter`, `the Sophy`, `Cataian`, `cubiculo`)
from a cold start, without any prior round's findings as input. That is
the property earlier sweeps lacked.

No app, registry, audio, SEO, or deploy action was taken. No paid API
calls. This directory only. Deliverables: `ACCEPTANCE-RECORD.md`
(finalized) and `accepted-paragraph-hashes.tsv` (1,120 rows, 1-based,
sha256 `a5d14b0df7ab7f91d0f2d1ed19b92d3d7a9e1d629152b77b615151ad53ce8bf4`).
