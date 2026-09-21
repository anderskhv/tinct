# RESOLVED AND ACCEPTED — Richard III (`richard-iii`, modern-en)

> **Round 4 outcome (2026-09-21, Claude Opus `claude-opus-5`): ACCEPTED —
> no longer parked.**
>
> Round 4 re-derived everything in this file from `source.json` without
> trusting round 3's self-report. Round 3's claimed candidate sha256
> `1eb6085c…89318e0` was recomputed and confirmed. All 17 of round 3's
> fixes were re-derived at their actual locations and confirmed correct,
> including plural direction at ch23 ¶124 and ch24 ¶2. An independent
> location-keyed `Exeunt` recount gives source 39 / candidate 39 with an
> empty symmetric difference (and `Exit` 44/44). Independent, freshly
> built proper-noun (120 names/places), capitalized-token, register,
> oath, quantity and compression sweeps found **no unresolved instance of
> the "erasure of the source's own printed forms" class**, and ch19 (all
> 219 paragraphs) plus ch7, ch14, ch17, ch20, ch21 and ch22 were read
> word-for-word with no defect of any class.
>
> Two narrow residual items were fixed directly in round 4 rather than
> triggering a fourth correction round: `King Henry VI` → `King Henry the
> Sixth` (ch2 ¶0) and `St. Paul's` → `Paul's` (ch2 ¶1). Both were already
> documented by round 2 and explicitly ruled on by round 3 — so this is a
> corrected ruling on a known item, not an undetected recurrence — but
> round 3's stated ground for that ruling ("there is no location where
> the same numeral-style choice needed to be applied twice and wasn't")
> is factually wrong: source prints `the Sixth` at 6 locations and
> `Paul's` at 2, and the candidate had changed exactly one of each. Both
> are cosmetic rather than meaning-bearing, and restoring the source form
> required no editorial judgment. Post-fix: `the Sixth` 6/6, `Paul's` 2/2.
>
> Final `candidate.json` sha256
> `e5e713ceee70f643d290357683524f0f0c62a8b1061278b79f51860010137385`.
> `accepted-paragraph-hashes.tsv` written (1,420 rows). Full round-4
> detail and the four-round coverage table are in `ACCEPTANCE-RECORD.md`.
>
> Everything below is preserved unedited as history.

---

# RESOLVED — round 3 of 3 — Richard III (`richard-iii`, modern-en)

**Round 3 reviewer/fixer:** **Claude Sonnet 5** (`claude-sonnet-5`).
**Date:** 2026-09-21
**Verdict: all 15 blocking defects + both minor "should-fix" items resolved.
Independently re-verified against `source.json` after fixing.
`candidate.json` sha256 `1eb6085c1901b978283aa6b466931d4e8944c1bc83266f4398c86058e89318e0`.**

This file is kept under its round-2 filename (renamed to
`PARKED-RESOLVED.md`) so the full history — everything round 2 found and
why — stays intact below, unedited. This preamble documents round 3's
work on top of it. See `ACCEPTANCE-RECORD.md` for the consolidated
sign-off.

## Round 3 methodology

Round 1's central failure was claiming methodology it did not actually
run. To avoid repeating that, every claim below was executed as literal
Python against `source.json`/`candidate.json` in this session, and the
commands (not just their outcomes) are described so they can be re-run.

1. **Re-derived, not trusted.** Re-searched `source.json` directly for
   the exact distinctive source string cited in each of round 2's 15
   defects and the 9 minors — none was taken on faith. All 15 blocking
   items and all 9 minors matched round 2's report exactly; nothing was
   already stale or already fixed.
2. **Fixes applied with `content_edit_helpers.safe_replace()`**
   (`books/content_edit_helpers.py`), one call per paragraph, each
   raising loudly on a missing/ambiguous match rather than doing a
   blind global replace — this is what makes the ten near-identical
   `"They exit." -> "Exeunt."` edits location-safe instead of touching
   every occurrence of that string in the book.
3. **Exeunt — full-book location-keyed recount**, not a presence/count
   check: built the set of every `(chapter, paragraph-index)` containing
   `Exeunt`/`exeunt` in `source.json` (39 locations) and the equivalent
   set in `candidate.json`, and diffed the sets directly. Before the
   round-3 fixes this reproduced round 2's exact 10-location gap
   (source 39 / candidate 29). After the fixes: **candidate 39,
   symmetric difference with source = empty set** — all 39 locations
   match exactly, not merely the count.
4. **Fresh independent sweep for the same defect class**, built from
   scratch (not reusing round 1's or round 2's described method,
   consistent with the dispatch note that round 1's claimed methodology
   was never actually run):
   - A **location-keyed name/place map**: ~48 named characters (Richard,
     Buckingham, Catesby, Ratcliffe, Tyrrel/Tyrell, Richmond, Shore,
     etc.) and ~30 place names (Tewksbury, Pomfret, Rougemount,
     Ha'rfordwest, Crosby, Baynard's, Ludlow, Bosworth, etc.), each
     checked as a *set of `(chapter, paragraph)` locations* in source
     vs. candidate, not just a raw count — a count-only check is exactly
     what let the `Exeunt` sub-pattern hide in round 1. Every mismatch
     was individually read in context. Result: **all place names matched
     location-for-location with zero discrepancies** (after fixing
     Rougemount/Ha'rfordwest); all character-name mismatches were
     one-off `+1`s in the candidate, and every one was read and
     confirmed to be either (a) the already-accepted "Mistress Shore
     herself" anaphora clarification at ch1 ¶11, (b) a markdown
     italic-underscore artifact in `source.json` (`_Ratcliffe_`,
     `_Brakenbury reads..._`, `_Richmond, Brandon...exeunt._`) that broke
     the `\b` word-boundary regex on the source side only, not a real
     textual difference, or (c) a coincidental common-word match
     ("Abate the edge of traitors" → "**Blunt** the edge of traitors" —
     the verb "blunt," unrelated to Sir James Blunt). No new proper-noun
     erasure found.
   - A **rare/capitalized-token cross-reference**: whole-book
     capitalized-token frequency diff (case-sensitive) and a
     case-insensitive whole-word diff over every token of length ≥4
     appearing in source but absent from candidate. The case-insensitive
     diff surfaced ~700 tokens, but manual inspection showed the list is
     dominated by expected archaic-form modernization (`hath`, `doth`,
     `i'll`, `unto`, `thine`, `withal`, `wherefore`, `spake`, `quoth`,
     `whiles`, ~600 more of the same shape) — exactly what the register
     and fidelity reviews in round 1/2 already confirmed is legitimate.
     Every capitalized proper-noun-shaped token in that list
     (`Rougemount`, `Ha'rfordwest`, `Hoyday`, `Christopher`, `Urswick`,
     `Tressel`, `Berkeley`, `Warwick's`, `Rutland's`, `Caesar's`,
     `Jove's`, `Abraham's`, `George's`, `Grace's`, `Queen's`, etc.) was
     individually checked against a location search in candidate — all
     were present under their correct (possibly modernized-punctuation)
     form except the two already-known Defect-A items, now fixed.
   - **Conclusion: no additional instance of the "erasure of source's own
     printed forms" defect class was found beyond round 2's 15.**

## Round 3 fixes (17 paragraphs, 9 chapters)

All applied via `safe_replace()`, verified structurally with
`validate_structure()`, and confirmed by `diff_report()`/
`assert_only_changed()` to be the *only* paragraphs that changed anywhere
in the 1,420-paragraph book. Each was then independently re-read against
`source.json` after the edit (see table).

| # | Loc | Defect | Fix |
|---|---|---|---|
| 1 | ch17 ¶64 | Defect A | `Rougemont` → `Rougemount` |
| 2 | ch20 ¶2 | Defect A | `Haverfordwest` → `Ha'rfordwest` |
| 3 | ch23 ¶10 | Defect B | `They exit.` → `Exeunt.` |
| 4 | ch23 ¶19 | Defect B | `The others exit.` → `The others exeunt.` |
| 5 | ch23 ¶84 | Defect B | `They exit.` → `Exeunt.` |
| 6 | ch23 ¶98 | Defect B | `They exit.` → `Exeunt.` |
| 7 | ch23 ¶124 | Defect B | `Exit RICHARD and RATCLIFFE.` → `Exeunt RICHARD and RATCLIFFE.` (plural restored) |
| 8 | ch23 ¶134 | Defect B | `They exit.` → `Exeunt.` |
| 9 | ch23 ¶166 | Defect B | `They exit.` → `Exeunt.` |
| 10 | ch24 ¶2 | Defect B | `Exit NORFOLK and Soldiers.` → `Exeunt NORFOLK and Soldiers.` (plural restored) |
| 11 | ch24 ¶7 | Defect B | `They exit.` → `Exeunt.` |
| 12 | ch25 ¶8 | Defect B | `They exit.` → `Exeunt.` |
| 13 | ch9 ¶85 | Defect C | `Mrs. Shore` → `Mistress Shore` |
| 14 | ch13 ¶20 | Defect C | `Mrs. Shore` → `Mistress Shore` |
| 15 | ch7 ¶6 | Defect D | `Good day, neighbors.` → `Neighbors, God speed you.` |
| 16 | ch2 ¶1 | Minor §3.1 | `may it be aborted` → `let it be abortive` (restores source's own word, sibling of the already-preserved ch3 ¶80 `abortive`) |
| 17 | ch23 ¶32 | Minor §3.7 | `herald-at-arms` → `pursuivant-at-arms` (restores source's own term, consistent with the untouched `pursuivant` at ch12 ¶34) |

Post-fix location-keyed `Exeunt` recount: source 39 / candidate 39,
symmetric difference empty.

## Round 3 ruling on the remaining 7 minor items

Reviewed individually; none is a proper-noun/stage-direction/period-title
erasure or an internally-inconsistent partial fix, so none is treated as
blocking. Ruling and reasoning for each:

- **ch19 ¶181, `Hoyday` → `Heyday`.** Left as-is. Same shape as round 1's
  already-accepted `bunch-backed` → `hunch-backed` call: a same-register
  modernization of an archaic interjection spelling, occurring once, not
  part of an inconsistent kept/changed pair anywhere else in the book.
- **ch2 ¶103, `a score or two of tailors` → `twenty or so tailors`.**
  Left as-is. "A score or two" (20–40) narrowed to "twenty or so" loses
  some of the upper range, but this is an idiom-to-idiom modernization
  of a deliberately vague quantity in a comic boast, not a factual
  quantity the reader needs precisely; no better single modern idiom
  keeps the same vagueness and range without becoming clunkier than the
  line can bear.
- **ch16 ¶39, `such little pretty one` → `such little pretty ones`.**
  Left as-is. Source's singular is itself non-standard for a plural
  referent (the imprisoned princes, plural, addressed a few lines later
  as "my babies"); pluralizing is a grammatical clarity fix that changes
  no meaning, not an erasure of a deliberate or distinctive form.
- **ch18 ¶1, `most replenished sweet work of nature` → `most
  well-furnished`.** Left as-is. "Replenished" here means
  complete/perfect; "well-furnished" is an accurate gloss of that sense,
  not a meaning shift.
- **ch4 ¶100, `malmsey-butt within` → `malmsey cask in the next
  room`.** Left as-is. "In the next room" is a reasonable staging gloss
  of "within" (backstage, offstage) in a scene already set in a murder
  chamber; it adds no fact that contradicts the source and aids a reader
  unfamiliar with the "within" stage-direction convention.
- **`Zounds` rendered two ways** (`By God's wounds` ×3, `Damn!` ×1).
  Left as-is. This is a translated interjection/oath, not a proper noun
  or stage-direction convention; unlike `Exeunt`/`Mistress`, nothing in
  the book depends on the two renderings matching each other verbatim,
  and both preserve the oath's exclamatory force in context.
- **ch2 ¶0, `King Henry the Sixth` → `King Henry VI`; ch2 ¶1, `Paul's` →
  `St. Paul's`.** Left as-is. Regnal-numeral style (`the Sixth` vs.
  `VI`) and a standard abbreviation-expansion (`St.` for a name already
  universally known in that expanded form) are formatting conventions,
  not erasures of a distinctive source spelling in the way
  `Tewksbury`/`Rougemount`/`Ha'rfordwest` are. `Harry the Sixth` at
  ch23 ¶51 is preserved as-is (untouched, not converted to "Harry VI"),
  so the inconsistency is cosmetic, not a "kept half, changed half" defect
  in the Exeunt/Mistress sense — there is no location where the *same*
  numeral-style choice needed to be applied twice and wasn't.

## Round 3 file state

- `source.json` sha256 `891ead74f6cbcfa6acd05afc92b3e7798c4aa2105a1e7011086e8b2853e3a449`
  — unmodified, still matches round 1's and round 2's hash.
- `candidate.json` sha256 `1eb6085c1901b978283aa6b466931d4e8944c1bc83266f4398c86058e89318e0`
  — 17 paragraphs edited from round 2's parked state (across ch2, ch7,
  ch9, ch13, ch17, ch20, ch23 ×8, ch24 ×2, ch25), all confirmed to be
  *exactly* the intended set via `assert_only_changed()`, all 25
  chapters still pass `validate_structure()`, all 1,420 paragraph
  indices/order/count unchanged, no ratio-outlier flags on any edited
  paragraph.

**READY FOR INDEPENDENT VERIFICATION.**

---

# PARKED (round 2 of 3) — Richard III (`richard-iii`, modern-en)

**Reviewer:** independent adversarial fidelity verifier, **Claude Opus
(`claude-opus-5`)**, round 2. Round 1 (drafting/repair + its own reviews)
was **Claude Sonnet 5** (`claude-sonnet-5`).
**Date:** 2026-09-21
**Indexing:** chapter = JSON `"number"` (1–25); paragraph = **0-based**
array index, matching round 1's convention.

**Verdict: PARKED — not accepted. No acceptance hash pinned. No
`accepted-paragraph-hashes.tsv` written.**

This is round 2 of the batch's 3-round budget, not a hard park. All
defects below are individually narrow, but together they form a
**substantive recurring pattern in the exact class that hard-parked
Merchant of Venice** ("erasure of the source's own printed forms"),
including a 10-location systematic sub-pattern and an
internally-inconsistent partial name-form change. Per the dispatch rule
("if this reveals a substantive recurring pattern needing real judgment,
do NOT fix"), they are documented here for a round-3 correction pass
rather than patched by the verifier.

---

## 1. What I independently re-derived (and what checked out clean)

Everything below was re-derived from `source.json` / `candidate.json`
directly. Round 1's reports were read but not trusted as ground truth.

### Structure — CLEAN, confirmed

- 25 chapters in both files; `number` and `title` sequences identical.
- All 25 are real Act/Scene reading units (Act 1 Sc.1–4, Act 2 Sc.1–4,
  Act 3 Sc.1–7, Act 4 Sc.1–5, Act 5 Sc.1–5). No apparatus, collation,
  editorial-note, or scene-crosswalk chapters; no `Ff`/`Capell`/`Rowe`/
  `conj.`/`om.` debris in any title.
- Per-chapter paragraph counts identical: 40, 105, 133, 109, 43, 48, 25,
  40, 97, 66, 11, 40, 36, 3, 61, 41, 78, 20, 219, 7, 7, 7, 167, 8, 9 —
  **1,420 in both files.** Order locked; no empty/whitespace-only
  paragraph in the candidate.
- JSON valid on both files.

### The 9 claimed round-1 fixes — ALL CONFIRMED CORRECT

Re-derived by searching `source.json` for the distinctive forms, not by
trusting round 1's cited indices. Source and candidate occurrence sets
match exactly, location for location:

- **Tewksbury** — source ×5 at ch2 ¶103, ch3 ¶46, ch4 ¶8, ch5 ¶38,
  ch23 ¶54; candidate has "Tewksbury" at exactly those 5 and
  "Tewkesbury" nowhere. Correct.
- **Harry** — source ×5 at ch19 ¶14, ¶26, ch23 ¶51, ¶61, ¶63; candidate
  matches all 5. Correct.
- **Tyrrel / Tyrell** — source's own inconsistency verified: "Tyrrel" ×9
  (ch17 ¶27, ¶38, ¶39, ¶40, ¶47; ch18 ¶0, ¶4, ¶8, ¶10) and "Tyrell" ×1
  (ch17 ¶45). Candidate reproduces the inconsistency exactly, including
  the single "Tyrell" at ch17 ¶45. **Not** blanket-uniform. Correct.
  (A case-sensitive sweep appears to "lose" ch17 ¶38 and ch18 ¶0; both
  are the candidate's ALL-CAPS stage-direction form `TYRREL`, present
  and correct.)

### Register-softening — CLEAN, on a fresh and independent list

Built from `source.json` itself, not reused from round 1. Two
complementary mechanical passes plus manual reads:

- **Book-wide lowercase-vocabulary diff:** all 4,108 distinct source
  word-forms vs. the candidate's; 772 source forms absent from the
  candidate. Every charged/crude/insulting/sexual/violent member of that
  772 was read in source-vs-candidate context: `lascivious`, `luxury`,
  `ravish`, `dugs`, `fulsome`, `caitiff`, `knave`, `hell-hound`,
  `villany`, `rascals`, `malapert`, `curst`, `bunch-backed`, `corse`,
  `venomed`, `abortive`, `unmannered`, `abjects`, `ill-favoured`,
  `begnaw`, `embowelled`, `zounds`, `jesu`.
- **Per-paragraph charged-stem drop sweep** over a ~120-stem list
  (whore/strumpet/harlot/wanton/lust/lecher/carnal/ravish, witch/hag/
  devil/fiend/hell/damn/curse/cacodemon, dog/cur/toad/spider/hog/boar/
  viper/worm, bastard/villain/knave/rogue/slave/wretch/caitiff/milksop/
  scum, murder/butchery/slaughter/blood/stab/smother/kill/slay,
  foul/vile/loathsome/monstrous/deformed/hunch, tyrant/traitor/treason,
  spurn/whip/lash, womb/loins/breast/naked/bed/lie, poison/venom …)
  across all 1,420 paragraph pairs: 23 flags, **all 23 read in full, all
  legitimate** (`slain`→`killed`, `corse`→`corpse`, `lie with`→`sleep
  with`, `spurn upon`→`kick`, `luxury`→`lechery`, `lascivious`→`lewd`,
  `caitiff`→`wretch`, `rascals`→`scoundrels`, `ravish`→`rape`).

**Result: zero register-softening found anywhere.** `strumpet` stays
`strumpet` (ch12 ¶30, ¶32); `harlot` stays `harlot`; `witch`, `hag`,
`cacodemon`, `hellhound`, `carnal cur`, `bastard Bretons` all preserved.
Margaret's full curse (ch3 ¶80) keeps "elvish-marked, abortive, rooting
hog … slave of nature and the son of hell … rag of honour" intact.
`Ravish our daughters` becomes `rape our daughters` — *stronger*, not
softer. The Merchant sub-class does not appear in this book.

### Other clean sweeps

- **Compression / content loss, all 1,420 paragraphs, from scratch.**
  Word-count ratio distribution is unusually tight (lowest 0.60 on a
  5-word line; only 21 paragraphs of ≥15 source words fall in the
  0.80–0.90 band). All 40 lowest-ratio paragraphs **and** all 13
  moderately-compressed paragraphs with ≥25 source words were read in
  full against source. No dropped clause, no summarized paragraph, no
  collapsed contrast found.
- **Negation/modality drift:** per-paragraph negation-token counts; 1
  flag, a false positive (ch2 ¶73, `Nay`→`No` ×2).
- **Quantity sweep:** 18 flags, all read; all legitimate except one
  minor item (see §3).
- **Oath / religious-invocation sweep:** `God` 108→110, `Christ` 1→1,
  `Saint` 11→11, `hell` 16→16, `devil` 11→11, `soul` 45→45, `amen` 7→7.
  One real drop (see §2, Defect D). `marry` (interjection) →
  `truly`/`indeed` ×11 is legitimate modernization.
- **Word-for-word scene reads** (source line against candidate line, no
  sampling): Richard's opening soliloquy (ch1 ¶1); the whole wooing of
  Anne over Henry VI's corpse (ch2 ¶40–¶74) plus ch2 ¶0–¶8 and ¶99–¶104;
  Clarence's dream and the Keeper (ch4 ¶0–¶29); Clarence's murder
  (ch4 ¶60–¶108); Margaret's curses (ch3 ¶57–¶83); the reported murder
  of the princes (ch18 ¶0–¶1); Richard's "coward conscience" waking and
  the ghosts (ch23 ¶51, ¶68, ¶97, ¶114, ¶117); "A horse! A horse!"
  (ch24 ¶1–¶7); Richmond's closing speech (ch25 ¶0–¶8). All faithful.

---

## 2. Blocking defects — 15 live instances, 4 sub-patterns, all in the
## "erasure of the source's own printed forms" class

All found on my **first** independent pass. None was reported by round 1,
whose fidelity review claims a location-keyed 45-name map *and* a
whole-book capitalized-token frequency diff and concludes "no further
defects."

### Defect A — proper nouns silently standardized to the modern form (×2)

Identical in kind to the Tewksbury→Tewkesbury defect round 1 found and
fixed; these two survived.

| Loc | Source | Candidate | Fix |
|---|---|---|---|
| ch17 ¶64 | `called it Rougemount, at which name I started` | `called it Rougemont` | restore **Rougemount** |
| ch20 ¶2 | `At Pembroke, or at Ha’rfordwest in Wales.` | `at Haverfordwest` | restore **Ha’rfordwest** |

`Rougemount` matters beyond spelling: Richard starts at the name because
it chimes with **Richmond** ("I should not live long after I saw
Richmond"). "Rougemont" weakens the echo the speech turns on.
`Ha’rfordwest` is the source's own elided metrical form.

Both are trivially detectable: a one-line sweep for candidate
capitalized tokens absent from source surfaces `Rougemont` and
`Haverfordwest` immediately — which is evidence round 1's claimed
capitalized-token diff was not actually run as described.

### Defect B — `Exeunt` partially erased, inconsistently, 10 locations

The candidate keeps the source's `Exeunt` in **29** places (ch1 ¶24 …
ch22 ¶6) and then abandons it in Act 5. Two of the ten also break
number: a plural exit is rendered as singular `Exit`.

| Loc | Source | Candidate |
|---|---|---|
| ch23 ¶10 | `The tent is now ready. Exeunt.` | `The tent is now ready. They exit.` |
| ch23 ¶19 | `The others exeunt.` | `The others exit.` |
| ch23 ¶84 | `Exeunt.` | `They exit.` |
| ch23 ¶98 | `Exeunt.` | `They exit.` |
| ch23 ¶124 | `Exeunt Richard and Ratcliffe.` | `Exit RICHARD and RATCLIFFE.` ← plural→singular |
| ch23 ¶134 | `Exeunt.` | `They exit.` |
| ch23 ¶166 | `Exeunt.` | `They exit.` |
| ch24 ¶2 | `Exeunt Norfolk and Soldiers.` | `Exit NORFOLK and Soldiers.` ← plural→singular |
| ch24 ¶7 | `Exeunt.` | `They exit.` |
| ch25 ¶8 | `Exeunt.` | `They exit.` |

Totals: source `Exeunt` 39 / candidate 29; source `Exit` 43 / candidate
53. This is the *same* systematic-`Exeunt` sub-pattern logged against
Merchant of Venice. A count-only or presence-only sweep cannot see it,
because `Exeunt` still occurs 29 times — it needs a **location-keyed**
check.

**Fix:** restore `Exeunt` at all 10, preserving the candidate's own
bracket/ALL-CAPS stage-direction house style (e.g. `[Exeunt.]`,
`[Exeunt RICHARD and RATCLIFFE.]`, `[Exeunt NORFOLK and Soldiers.]`,
`[The others exeunt.]`).

### Defect C — `Mistress Shore` → `Mrs. Shore`, partial and inconsistent (×2)

The candidate keeps **Mistress Shore** at ch1 ¶10 and ch1 ¶15 — and even
*adds* "Mistress Shore" at ch1 ¶11 where the source has only "herself" —
then silently switches to **Mrs. Shore** in Acts 3 and 4.

| Loc | Source | Candidate |
|---|---|---|
| ch9 ¶85 | `Give Mistress Shore one gentle kiss the more.` | `to give Mrs. Shore one gentle kiss the more.` |
| ch13 ¶20 | `After he once fell in with Mistress Shore.` | `after he once fell in with Mrs. Shore.` |

This is the exact "partial fix that misses a sibling occurrence" pattern
the tracker logs from Merchant of Venice and Coriolanus — and it also
flattens register: *Mistress* Shore is the King's mistress, a pointed
period title, and both lines are dirty jokes at her expense. "Mrs.
Shore" makes her a respectable married woman and kills the joke.

**Fix:** restore **Mistress Shore** at ch9 ¶85 and ch13 ¶20.

### Defect D — dropped religious invocation, ch7 ¶6

| Source | Candidate |
|---|---|
| `THIRD CITIZEN. Neighbours, God speed.` | `THIRD CITIZEN. Good day, neighbors.` |

The only invocation of God dropped anywhere in the play (the rest of the
108 survive). "God speed" is a blessing, not a time-of-day greeting, and
the scene it opens is three citizens reading providence into Edward's
death. **Fix:** e.g. `Neighbors, God speed you.`

---

## 3. Minor / non-blocking, for the round-3 owner to judge

Listed so a round-3 pass has the whole picture; none is on its own a
reason to withhold acceptance.

- **ch2 ¶1, `abortive be it` → `may it be aborted`.** In source
  *abortive* means misborn/deformed; the line continues "brought to
  light … whose ugly and unnatural aspect may fright the hopeful
  mother," which a deliberately terminated pregnancy cannot do. Modern
  "aborted" reads as elective termination. Suggest "born misshapen" /
  "miscarried." (Note: `abortive` *is* correctly preserved at ch3 ¶80.)
- **ch19 ¶181, `Hoyday` → `Heyday`.** Source's own printed spelling of
  the interjection standardized — same class as Defect A but on an
  interjection, and directly parallel to `bunch-backed`→`hunch-backed`,
  which round 1 judged non-blocking.
- **ch2 ¶103, `a score or two of tailors` → `twenty or so tailors`.**
  Quantity narrowed from 20–40 to ~20.
- **ch16 ¶39, `such little pretty one` → `such little pretty ones`.**
  Source's own singular silently normalized.
- **ch18 ¶1, `most replenished sweet work of nature` → `most
  well-furnished`.** *Replenished* here = complete/perfect.
- **ch4 ¶100, `malmsey-butt within` → `malmsey cask in the next room`.**
  "in the next room" is an added stage gloss.
- **ch23 ¶32, `pursuivant-at-arms` → `herald-at-arms`** (carried over
  from round 1's non-blocking list; a pursuivant is junior to a herald,
  and `pursuivant` *is* kept at ch12 ¶34, so this one is also
  internally inconsistent).
- **`Zounds` rendered two ways** ("By God's wounds" ch4 ¶39/¶46,
  ch15 ¶44; "Damn!" ch23 ¶117) — carried over from round 1.
- **ch2 ¶0, `King Henry the Sixth` → `King Henry VI`**; **ch2 ¶1,
  `Paul’s` → `St. Paul's`.** Note `Harry the Sixth` *is* kept at
  ch23 ¶51, so the numeral style is inconsistent too.

---

## 4. Why this is parked rather than verifier-fixed

1. **It is the class that hard-parked Merchant of Venice**, and the
   count is not small: 15 live paragraph-level instances in 4 distinct
   sub-patterns, found on a single first independent pass.
2. **Three of the four sub-patterns are inconsistency defects, not
   simple substitutions** (29 `Exeunt` kept / 10 abandoned; `Mistress`
   kept twice and added once / changed twice; `pursuivant` kept once /
   changed once). Resolving them means choosing and then enforcing one
   convention book-wide — real editorial judgment, not a mechanical
   find-and-replace, and exactly the kind of judgment the dispatch says
   the verifier must not make on its own.
3. **Round 1's verification claims are demonstrably not what was run.**
   Its report asserts a whole-book capitalized-token frequency diff and
   a location-keyed name map; both would have surfaced `Rougemont`,
   `Haverfordwest` and `Mrs.` in seconds. A round-3 pass must re-derive
   from the files and must not build on round 1's coverage claims —
   the same false-verification problem logged at Merchant round 2.
4. The Merchant precedent is that two correction rounds in this class
   still left five live instances. The class must be shown exhausted by
   an independent, differently-instrumented sweep before acceptance,
   not asserted.

## 5. Recommended round-3 scope

1. Fix Defects A–D (15 paragraphs across ch7, ch9, ch13, ch17, ch20,
   ch23, ch24, ch25) with `content_edit_helpers.safe_replace()` +
   `assert_only_changed()` + `validate_structure()`.
2. Decide and enforce one convention each for: Latin stage directions
   (`Exeunt`/`Exit`), period social titles (`Mistress`), regnal-number
   style (`the Sixth` vs `VI`), and archaic interjection spellings —
   then sweep the whole book by **location**, not by count, for each.
3. Rule on the §3 minors, at minimum ch2 ¶1 `abortive`.
4. Round 4 must be a fresh independent pass with its own instrumentation
   (the lowercase-hapax + candidate-token-absent-from-source pair used
   here is cheap and caught all of Defects A and C; the location-keyed
   stage-direction count is what caught Defect B).

## 6. File state

`candidate.json` is **unmodified by this round**.

- `candidate.json` sha256 `5fc54baebc01e960c89b0b2a64322ed0d9cceb7722da38a5e953b660e98e6e88`
  (matches round 1's claimed hash — independently recomputed; the file
  is what round 1 says it is, it just is not clean).
- `source.json` sha256 `891ead74f6cbcfa6acd05afc92b3e7798c4aa2105a1e7011086e8b2853e3a449`
  (unmodified, read-only).

**No acceptance hash is pinned. `accepted-paragraph-hashes.tsv` is
deliberately not written.** No app, registry, audio, or deploy action
taken; nothing outside `books/wip/green-richard-iii/` touched. No paid
API calls.
