# Fidelity Review 1 — Richard III (`richard-iii`, modern-en)

**Reviewer:** Claude Sonnet 5 (`claude-sonnet-5`)
**Indexing:** all paragraph numbers in this document are **0-based**,
matching Python's `paragraphs[i]` indexing and `content_edit_helpers.py`'s
`safe_replace(paragraphs, index, ...)` signature, which is how every fix
below was actually applied and verified. Chapter numbers are the JSON
`"number"` field (1–25, matching Act/Scene order), not 0-based.

## What was read

Every one of the 25 chapters' 1,420 paragraphs was compared directly
against the matching paragraph in the locked `source.json`, with the
surrounding chapter as context (not scored in isolated 5–10 paragraph
packets in this pass — the whole play was read scene-by-scene, source
line against candidate line, using generated side-by-side files at
`/tmp/.../scratchpad/richard-iii-review/ch01.txt` … `ch25.txt`, one file
per chapter, every paragraph pair present). This is the packet-based
comparison (step B) and the whole-chapter cross-boundary re-read (step C)
done together per chapter, then a second whole-book pass (below) for
cross-chapter recurring terms. No paragraph was skipped or sampled.

## Step 1 — Structure verification

- 25 chapters in both files, all real Act/Scene reading units (Act 1
  Sc.1–4, Act 2 Sc.1–4, Act 3 Sc.1–7, Act 4 Sc.1–5, Act 5 Sc.1–5). No
  apparatus, editorial-note, collation, or scene-crosswalk chapters —
  confirmed by both a manual title read and the apparatus-scan regex from
  `books/AGENTS.md` (0 suspects in either edition).
- Chapter `number`/`title` identical between source and candidate.
- Paragraph counts identical per chapter (40, 105, 133, 109, 43, 48, 25,
  40, 97, 66, 11, 40, 36, 3, 61, 41, 78, 20, 219, 7, 7, 7, 167, 8, 9 —
  1,420 total), order locked, no empty/whitespace-only paragraph either
  side.
- JSON valid on both files (`python3 -m json.tool`).

## Step 2 — Mandatory register-check (charged/crude/insulting words)

Built a curated list of every emotionally charged, insulting, sexually
frank, or deliberately blunt word class known to appear in this play —
`whore`, `strumpet`, `harlot`, `witch`, `hag`, `cur`, `dog`, `toad`,
`spider`, `hog`, `devil`, `hell-hound`, `bastard`, `bunch-back`, `elvish`,
`poisonous`, `carnal`, `damned`, `wanton`, `fiend`, `bloody`, `murderer`,
`villain`, `tyrant`, `cacodemon`, `abortive`, `foul`, `whoreson`, `viper`,
`boar` — and mechanically located every source paragraph containing one,
then read that paragraph's candidate rendering side by side (178 hits,
full list at `/tmp/.../scratchpad/charged_words.txt`, all 178 read in
full). This is the check the task specifically called out as needing its
own dedicated pass, since a name/proper-noun sweep would never catch a
register-softening substitution.

**Result: no register-softening found anywhere in the book.** Every
charged word Richard, Margaret, Anne, Elizabeth, and the Duchess use lands
at the same force in the candidate as in the source:

- `strumpet` (Ch12 ¶30, ¶32) stays `strumpet` — not softened to `wanton`
  or any milder term, the exact failure that hard-parked Merchant of
  Venice.
- `harlot` (Ch12 ¶30) stays `harlot`.
- `witch`/`hag`/`cacodemon` (Ch3 ¶59, ¶68, ¶79; Ch12 ¶28, ¶30) all
  preserved literally — `cacodemon` in particular is kept as the exact
  archaic word rather than glossed or softened.
- Margaret's full extended curse (Ch3 ¶80, "elvish-marked, abortive,
  rooting hog... slave of nature and the son of hell... rag of honour")
  is rendered with every insult at full force, word for word in sequence.
- `bloody`, `foul`, `devil`, `dog`/`cur`, `villain`, `damned`, `tyrant`,
  `boar` (Richard's running epithet through Acts 3–5) all appear as many
  times, at the same charge, in the same locations, with no diluting
  paraphrase.
- The one wording change inside this word class — `bunch-backed` (Ch3
  ¶89, Ch19 ¶28) → `hunch-backed` — is a same-register synonym swap (an
  archaic compound spelling to its modern equivalent), not a softening;
  the insult (Richard's hunched back) lands with identical force. Judged
  non-blocking.

## Step 3 — Location-keyed proper-noun / epithet occurrence map

Rather than compare raw counts (which the second batch's own lessons flag
as insufficient — see Twelfth Night/Merchant/Coriolanus rounds), every
name below was checked **paragraph by paragraph**, not just by total:
Gloucester, Shore, Rivers, Grey, Dorset, Hastings, Buckingham, Norfolk,
Surrey, Oxford, Stanley, Derby, Catesby, Ratcliffe, Lovell, Brakenbury,
Tyrrel, Anne, Elizabeth, Margaret, Warwick, Richmond, Blunt, Herbert,
Urswick, Christopher, Plantagenet, Rutland, Bourchier, Ely, Exeter,
Courtney, Vaughan, York, Lancaster, Pembroke, Harry, Tewksbury, Grandam,
Halberds, Bishop, Cardinal, Tressel, Berkeley, Zounds, Ghost. A first
count-only pass flagged apparent mismatches on Ratcliffe, Lovell,
Brakenbury, Blunt, Richmond and Tyrrel; every one of those turned out to
be a false positive caused by the sweep script itself not being
case-insensitive against the ALL-CAPS stage-direction speaker-tag
convention (`RATCLIFFE.` vs `Ratcliffe`) — re-run case-insensitively, all
of those matched exactly. Three **real** defects were found this way, all
in the documented "erasure of source's own printed forms" class:

### Defect A — "Tewksbury" silently standardized to "Tewkesbury"

Source spells the battle consistently **"Tewksbury"** in all 5 of its
occurrences (Ch2 ¶103, Ch3 ¶46, Ch4 ¶8, Ch5 ¶38, Ch23 ¶54). The candidate
had silently modernized the spelling to the historically standard
"Tewkesbury" in every one of the 5 — a textbook instance of the
documented failure "never silently correct a name/spelling to its
historically standard form; reproduce the source's own printed form."
**Fixed**, all 5 instances, restoring source's own "Tewksbury" spelling.

### Defect B — "Harry" partially swapped to "Henry" (missed sibling occurrences)

Source uses the familiar name **"Harry"** for Henry VI in 5 places (Ch19
¶14, ¶26; Ch23 ¶51, ¶61, ¶63). The candidate correctly preserved "Harry"
in the two Ch19 occurrences but silently swapped it to "Henry" in all
three Ch23 occurrences (the ghost-of-Henry-VI scene) — the exact
"partial fix that misses a sibling occurrence" pattern the batch tracker
calls out from Merchant of Venice and Coriolanus. **Fixed**, all 3 Ch23
instances, restoring "Harry."

### Defect C — Source's own spelling inconsistency ("Tyrrel"/"Tyrell") erased

Source itself is internally inconsistent about this character's name: it
spells it "Tyrrel" nine times and "Tyrell" once, at Ch17 ¶45 (`"Tyrell, I
mean those bastards in the Tower."`). The candidate normalized all ten
occurrences to the single spelling "Tyrrel," erasing the source's own
(likely accidental) variant spelling at that one location. Per the rule
that the candidate must reproduce **the source's own printed form
exactly, even where it looks like an error or inconsistency**, this
counts as the same defect class even though it runs opposite to Defects
A/B (here the candidate over-regularized the source rather than importing
an external "corrected" spelling). **Fixed**, restoring "Tyrell" at Ch17
¶45 only, leaving the other 9 "Tyrrel" instances untouched (they already
match source).

### One reviewed-and-accepted addition (not a defect)

Ch1 ¶11: candidate reads "...The jealous worn-out widow and **Mistress
Shore herself**..." where source has only "...and herself...". This adds
a name the source itself leaves as a pronoun at that exact point. However
the referent ("Mistress Shore") is explicitly named by the source itself
two paragraphs earlier, in the same continuous exchange (Ch1 ¶10:
"night-walking heralds / That trudge betwixt the King and Mistress
Shore"). Per the rule that a gloss may name something "already explicit
in source's own words," this is judged an acceptable anaphora
clarification, not an imported fact or a name the source deliberately
withholds. Left as is.

### Rare-word / capitalized-token cross-reference sweep

Ran a mechanical capitalized-token frequency diff across the whole book
(every `[A-Z][A-Za-z']+` token, source vs. candidate counts) as an
additional net beyond the curated name list. Beyond the archaic function
words expected to drop out under modernization (Thou/Hath/Tis/Nay/etc.,
all correctly modernized away), this surfaced Grandam→Grandmother
(legitimate common-noun modernization, not a name), Halberds→halberdiers
(legitimate — modernizes an archaic weapon-as-stand-in-for-bearer noun),
Ghost/Bishop/Cardinal/Berkeley/Tressel casing differences (all resolved
as the ALL-CAPS stage-direction convention, confirmed correct in context)
— no further defects beyond A/B/C above.

## Step 4 — Meaning/actor/negation/condition spot-checks

Across the full read, specifically watched for: actor misattribution,
negation flips, condition/certainty changes, dropped clauses, and
imported facts not present in source (the Merchant of Venice "angel
coin" failure mode). None found. Representative spot-checks:
- Ch2 ¶26 "Why then he is alive." → "Why then he must be alive." — a
  slight rhetorical-emphasis shift ("must be" reads as inference rather
  than flat assertion) but Anne's overall move (probing Richard's denial
  ironically) and the scene's logic are unchanged; judged non-blocking
  stylistic variance, not a meaning change.
- Ch23 ¶32 "pursuivant-at-arms" → "herald-at-arms" — a related but
  technically distinct period military-rank term (a pursuivant is junior
  to a herald). Not a proper noun, doesn't erase a deliberate ambiguity,
  and doesn't import an external invented fact; judged a minor imprecise
  synonym, non-blocking, since the plot-relevant content (send a rider to
  Stanley's regiment) is intact either way.
- All oath/curse translations (`Zounds` → `By God's wounds` / `Damn!`)
  preserve the exclamatory force and are consistent within each
  occurrence's own context; the two different renderings of `Zounds`
  reflect natural variation in modern equivalents for an oath repeated
  in different emotional registers, not an inconsistency that changes
  meaning.

No actor-misattribution, meaning-reversal, or imported-fact defects were
found anywhere in the book.

## Step 5 — Fixes applied and independently re-verified

All 3 defect classes above (9 total paragraph edits across 6 chapters)
were applied with `books/content_edit_helpers.py`'s `safe_replace()`
(exact-match, fails on ambiguous/missing target), `validate_structure()`
(re-run before and after edits), and `assert_only_changed()` (confirms
exactly the intended paragraph indices changed, no more, no fewer, per
chapter). After the edit script ran, every one of the 9 fixed paragraphs
was independently re-read directly against `source.json` (not against the
fix script's own claim) to confirm the exact source wording now appears.
A whole-book re-sweep for `Tewkesbury`, residual `Henry`-for-`Harry`
mismatches, and `Tyrrel`/`Tyrell` location mismatches after the fix
confirmed zero remaining instances of any of the three defects.

## Conclusion

Three real, narrow defects found and fixed, all in the "erasure of
source's own printed forms" class the batch has repeatedly hit — none in
the register-softening sub-class that hard-parked Merchant of Venice.
Whole-book re-read after fixes found no further instances. See
`ACCEPTANCE-RECORD.md` for the full coverage table and final hash.
