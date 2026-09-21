# Acceptance Record — Richard III (`richard-iii`, modern-en)

**Book id:** `richard-iii`
**Edition:** `modern-en`

> **STATUS 2026-09-21: ROUND 3 COMPLETE — READY FOR INDEPENDENT
> VERIFICATION.**
> Round 2 (Claude Opus, `claude-opus-5`) confirmed round 1's structure
> findings and all 9 of round 1's fixes, and found 15 further live
> defects in the "erasure of the source's own printed forms" class (2
> proper nouns silently standardized, 10 `Exeunt` locations partially
> erased, 2 inconsistent `Mistress Shore`→`Mrs. Shore`, 1 dropped `God
> speed`), plus 9 minor items for round 3 to rule on. Round 3 (Claude
> Sonnet 5, `claude-sonnet-5`) independently re-derived and confirmed
> all 15 defects directly against `source.json`, fixed all 15 plus 2 of
> the 9 minors (the other 7 ruled legitimate, with reasoning recorded),
> ran a fresh independently-instrumented sweep for the same defect
> class that found no further instances, and re-verified every one of
> the 17 fixed paragraphs against `source.json` after applying them.
> See `PARKED-RESOLVED.md` for round 2's full finding list and round
> 3's full methodology, defect table, and minor-item rulings.
> **Final acceptance hash below reflects round 3's state.**

**Model note.** Round 1 (structure check, blind accessibility review,
full-book fidelity review including mandatory register-check, defect
fixes, and this record) was performed entirely by **Claude Sonnet 5**
(`claude-sonnet-5`). Round 2 (independent adversarial fidelity
verification) was performed by **Claude Opus** (`claude-opus-5`) and is
recorded in `PARKED-RESOLVED.md`. Round 3 (independent re-derivation of
round 2's 15 defects, fixes, a fresh independently-instrumented sweep
for the same defect class, and ruling on round 2's 9 minor items) was
performed by **Claude Sonnet 5** (`claude-sonnet-5`) and is recorded in
the round-3 preamble of `PARKED-RESOLVED.md`.

**Staged files:** `books/wip/green-richard-iii/source.json` (unmodified,
locked, kept read-only throughout all three rounds),
`books/wip/green-richard-iii/candidate.json` (round-1 and round-3
corrections applied and verified below; round 2 made no edits).

**Final file hash (candidate.json, sha256):**
`1eb6085c1901b978283aa6b466931d4e8944c1bc83266f4398c86058e89318e0`

Source hash (unmodified copy, for reference):
`891ead74f6cbcfa6acd05afc92b3e7798c4aa2105a1e7011086e8b2853e3a449`

No app, registry, audio, or deploy action was taken. This directory only.
No paid API calls.

---

## Structure

- 25 chapters in both files, all real Act/Scene reading units: Act 1
  Sc.1–4, Act 2 Sc.1–4, Act 3 Sc.1–7, Act 4 Sc.1–5, Act 5 Sc.1–5. No
  apparatus, editorial-note, collation, or scene-crosswalk chapters —
  confirmed by title inspection and the `books/AGENTS.md` apparatus-scan
  regex (0 suspects in either edition).
- Chapter `number`/`title` sequence identical between source and
  candidate.
- Per-chapter paragraph counts identical, chapter by chapter: 40, 105,
  133, 109, 43, 48, 25, 40, 97, 66, 11, 40, 36, 3, 61, 41, 78, 20, 219, 7,
  7, 7, 167, 8, 9 — **1,420 paragraphs total in both files**, order
  locked, no empty or whitespace-only paragraph on either side.
- JSON valid (`python3 -m json.tool`) on both files.

## Coverage table

**Round 1 coverage (below), unedited.** Round 2's independent coverage
(structure, register, proper-noun, and capitalized-token re-derivation,
which found the 15 defects this table's row D missed) and round 3's
coverage (re-derivation, fixes, a fresh independent sweep, and
verification of the fixes) are in `PARKED-RESOLVED.md`; see "Defect
counts by round" above for the consolidated summary.

| Step | Scope | Paragraphs covered | Result |
|---|---|---|---|
| A. Blind accessibility review | Candidate only, all 25 chapters | 1,420 / 1,420 (100%) | 0 blocking defects (see `accessibility-review-1.md`) |
| B. Fidelity review vs. source, with context | All 25 chapters, source-vs-candidate side by side | 1,420 / 1,420 (100%) | 3 defect classes, 9 paragraphs, found and fixed |
| — Mandatory register-check | Every source paragraph containing a curated charged/crude/insulting word | 178 / 178 flagged paragraphs, read in full | 0 register-softening instances |
| — Location-keyed proper-noun/epithet map | 45 names/epithets, checked paragraph-by-paragraph, not by count | full book | 3 real defects (below); several count-only false positives resolved by case-insensitive re-check |
| — Rare-word/capitalized-token cross-reference sweep | Whole-book capitalized-token frequency diff | full book | No defects beyond the 3 already found |
| C. Whole-book re-read (cross-boundary) | Done together with step B, chapter by chapter, plus this dedicated cross-chapter name/register sweep | full book | Confirms B's findings; no additional cross-boundary issues |
| D. Verify fixes against source, pin hash | 9 edited paragraphs across 6 chapters | 9 / 9 independently re-read against `source.json` after the fix script ran | All 9 now match source's exact printed wording; hash computed after last edit |

## Defect counts by round

**Round 1: 3 defect classes, 9 paragraph edits, all in the "erasure of
source's own printed forms" class.**

1. **Tewksbury → Tewkesbury** (silent spelling standardization to the
   historically "correct" form) — 5 occurrences: Ch2 ¶103, Ch3 ¶46, Ch4
   ¶8, Ch5 ¶38, Ch23 ¶54 (0-based indices). Fixed: restored source's own
   "Tewksbury" spelling in all 5.
2. **Harry → Henry** (partial fix — 2 of 5 occurrences correctly kept
   "Harry," the other 3, all in Ch23's ghost-of-Henry-VI scene, silently
   swapped to "Henry") — Ch23 ¶51, ¶61, ¶63. Fixed: restored "Harry" in
   all 3.
3. **Tyrrel/Tyrell over-regularization** (source is itself inconsistent —
   "Tyrrel" ×9, "Tyrell" ×1 at Ch17 ¶45 — candidate normalized the one
   "Tyrell" instance to match the other nine) — Ch17 ¶45. Fixed: restored
   source's own "Tyrell" spelling at that one location only.

**Round 2 (Claude Opus, independent verification, no edits made): found
15 further live defects in the same "erasure of source's own printed
forms" class, in 4 sub-patterns, plus 9 minor items for round 3 to rule
on. Full detail in `PARKED-RESOLVED.md`.** Summary:

4. **Proper nouns silently standardized** — `Rougemount` → `Rougemont`
   (Ch17 ¶64) and `Ha'rfordwest` → `Haverfordwest` (Ch20 ¶2).
5. **`Exeunt` partially erased**, inconsistently — kept at 29 locations,
   silently dropped to `Exit`/`They exit.` at 10 (all in Ch23–25),
   including 2 that also broke plural→singular agreement.
6. **`Mistress Shore` → `Mrs. Shore`**, partial and inconsistent —
   `Mistress` correctly kept (and once added) in Ch1, silently switched
   to `Mrs.` in Ch9 ¶85 and Ch13 ¶20.
7. **Dropped religious invocation** — Ch7 ¶6, `Neighbours, God speed.` →
   `Good day, neighbors.`, the only one of 108 `God` references lost.

**Round 3 (Claude Sonnet 5): independently re-derived and confirmed all
15 of round 2's defects directly against `source.json`, fixed all 15
plus 2 of round 2's 9 minor items (ruled the other 7 legitimate, with
reasoning), ran a fresh independently-instrumented sweep for the same
defect class (location-keyed name/place map + rare/capitalized-token
cross-reference, built from scratch) that found no further instances,
and independently re-verified every one of the 17 fixed paragraphs
against `source.json` after applying them. Full methodology, fix table,
and minor-item rulings in the round-3 preamble of
`PARKED-RESOLVED.md`.**

8. Fixed: Defects 4–7 above (15 paragraphs).
9. Fixed: **`abortive be it` → `may it be aborted`** (Ch2 ¶1) — restored
   source's own `abortive`, a missed sibling of the correctly-preserved
   `abortive` at Ch3 ¶80; the modern "aborted" phrasing contradicted the
   surrounding "brought to light... may fright the hopeful mother"
   context.
10. Fixed: **`pursuivant-at-arms` → `herald-at-arms`** (Ch23 ¶32) —
    restored source's own term, consistent with the untouched
    `pursuivant` at Ch12 ¶34 (a related but distinct period rank, kept
    inconsistently before this fix).

No register-softening, no meaning reversal, no actor misattribution, no
dropped clause, and no imported external fact were found anywhere in the
book across all three rounds — the failure sub-classes that most
severely hit Merchant of Venice, Coriolanus, and Gilgamesh earlier in
this batch. The defects that *were* found and fixed (rounds 1–3, 26
paragraphs total) were entirely in the narrower "erasure/inconsistent
handling of the source's own printed forms" class — proper-noun
spellings, a Latin stage-direction convention, and a period title —
never a meaning change.

## Deliberately preserved, non-blocking items (reader-centered reasoning)

- **Ch1 ¶11, "Mistress Shore herself" added where source has only
  "herself."** The referent is named explicitly by the source itself two
  paragraphs earlier in the same continuous exchange (Ch1 ¶10, "the King
  and Mistress Shore"). This clarifies an anaphora the source's own words
  already resolve, rather than naming something the source deliberately
  leaves ambiguous or importing an outside fact — kept as a legitimate
  accessibility aid, not a defect.
- **"bunch-backed" → "hunch-backed"** (Ch3 ¶89, Ch19 ¶28). A same-register
  modernization of an archaic compound spelling; the insult (Richard's
  hunched back) lands at identical force. Not a softening, not a name.
- ~~**"pursuivant-at-arms" → "herald-at-arms"** (Ch23 ¶32)~~ — round 1
  judged this non-blocking; round 2 flagged it as internally inconsistent
  (the untouched `pursuivant` at Ch12 ¶34 shows the candidate keeps the
  term once and changes it once); round 3 fixed it by restoring
  `pursuivant-at-arms`. No longer a preserved item — see "Defect counts
  by round," round 3, item 10.
- **Two different modern renderings of "Zounds"** ("By God's wounds" in
  Ch4 ¶39/¶46, "Damn!" in Ch23 ¶117). Both preserve the oath's
  exclamatory force in context; treated as natural variation in a
  repeated interjection rather than an inconsistency, since nothing about
  plot, character, or meaning depends on the two instances matching each
  other verbatim.
- **Formal set-piece speeches remain long** (Buckingham's citizens'
  oration, Richmond's two battle orations, Margaret's extended curses).
  This is inherent to Shakespearean rhetorical set-pieces and to the
  locked paragraph-count constraint; breaking them into short, list-like
  sentences would itself be a fidelity defect (flattening the rhetoric),
  so length here is a structural/genre constraint, not a modernization
  shortfall.
- **Round-3-ruled minors (6 items, all left as-is; full reasoning in the
  round-3 preamble of `PARKED-RESOLVED.md`):** `Hoyday` → `Heyday`
  (Ch19 ¶181, same-register interjection spelling, single occurrence,
  parallel to the accepted `bunch-backed` call); `a score or two of
  tailors` → `twenty or so tailors` (Ch2 ¶103, idiom-to-idiom
  modernization of a deliberately vague comic quantity); `such little
  pretty one` → `such little pretty ones` (Ch16 ¶39, grammatical-clarity
  pluralization of source's own non-standard singular, no meaning
  change); `most replenished sweet work of nature` → `most
  well-furnished` (Ch18 ¶1, accurate gloss of "replenished" =
  complete/perfect); `malmsey-butt within` → `malmsey cask in the next
  room` (Ch4 ¶100, reasonable staging gloss, contradicts nothing); two
  renderings of `Zounds` (Ch4 ¶39/¶46 "By God's wounds," Ch23 ¶117
  "Damn!" — translated-oath variance, not a proper noun or stage-
  direction convention, so consistency isn't required the way it was for
  `Exeunt`/`Mistress`); `King Henry the Sixth` → `King Henry VI` and
  `Paul's` → `St. Paul's` (Ch2 ¶0–¶1, regnal-numeral/abbreviation
  formatting, not an erasure of a distinctive source spelling).

## Register-check methodology (summary; full detail in fidelity-review-1.md)

A curated list of every charged/crude/insulting/sexually frank word class
attested in this play (`strumpet`, `harlot`, `witch`, `hag`, `cur`, `dog`,
`toad`, `spider`, `hog`, `devil`, `hell-hound`, `bastard`, `bunch-back`,
`elvish`, `poisonous`, `carnal`, `damned`, `wanton`, `fiend`, `bloody`,
`murderer`, `villain`, `tyrant`, `cacodemon`, `abortive`, `foul`,
`whoreson`, `viper`, `boar`, etc.) was matched against every source
paragraph; all 178 matching paragraphs were read side by side against
their candidate rendering in full. Result: zero instances of
register-softening anywhere in the book, including Richard's own
villainous/mocking language and Margaret's full extended curses, which
the dispatch specifically flagged as most at risk. `strumpet` stays
`strumpet` (not `wanton`, the exact Merchant of Venice failure);
`cacodemon` is preserved literally rather than glossed or diluted; the
full "elvish-marked, abortive, rooting hog... slave of nature and the son
of hell... rag of honour" sequence lands at full force.

## Sign-off

- Structure: clean, verified independently against `source.json` in all
  three rounds; 25/25 chapters, 1,420/1,420 paragraphs, order and counts
  unchanged end to end.
- Accessibility: 0 blocking defects, full 1,420/1,420 coverage (round 1).
- Fidelity, round 1: 3 defect classes / 9 paragraphs found and fixed on a
  full, non-sampled read, all 9 independently re-verified against source
  after fixing.
- Fidelity, round 2 (independent adversarial verification, Claude Opus,
  no edits made): confirmed round 1's structure findings and all 9 of
  its fixes; found 15 further live defects in 4 sub-patterns plus 9
  minor items. Parked, not fixed, per the dispatch rule against a
  verifier patching a recurring pattern it finds. Full detail in
  `PARKED-RESOLVED.md`.
- Fidelity, round 3 (Claude Sonnet 5): independently re-derived and
  confirmed all 15 of round 2's defects directly against `source.json`
  (not trusted from the report); fixed all 15 plus 2 of the 9 minors
  (`abortive`, `pursuivant-at-arms`) with `content_edit_helpers
  .safe_replace()`; ruled the other 7 minors legitimate with recorded
  reasoning; ran a fresh, differently-instrumented sweep for the same
  "erasure of source's own printed forms" defect class (location-keyed
  name/place map + rare/capitalized-token cross-reference) that found no
  further instances; confirmed via `validate_structure()` that all 25
  chapters remain structurally valid; confirmed via `diff_report()` /
  `assert_only_changed()` that exactly the 17 intended paragraphs
  changed and nothing else; independently re-verified each of the 17
  fixed paragraphs against `source.json` after applying them; confirmed
  the whole-book `Exeunt` location set now matches source exactly (39/39,
  symmetric difference empty, not merely a matching count).
- Hash pinned to the file's state after round 3's last edit and after
  that edit's verification: `candidate.json` sha256
  `1eb6085c1901b978283aa6b466931d4e8944c1bc83266f4398c86058e89318e0`.

**READY FOR INDEPENDENT VERIFICATION.**
