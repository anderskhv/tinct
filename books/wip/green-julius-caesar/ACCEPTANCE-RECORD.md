# Acceptance Record — Julius Caesar (`julius-caesar`, modern-en)

**Book id:** `julius-caesar`
**Edition:** `modern-en`
**Accepted:** 2026-09-21
**Drafting/repair pass:** Claude Sonnet 5 (model id `claude-sonnet-5`). An
independent Opus verification pass is expected separately, per programme
process notes — this record covers the Sonnet acceptance only.
**Staged files:** `books/wip/green-julius-caesar/source.json` (copied
unmodified from `app/public/data/editions/julius-caesar-original-en.json`),
`books/wip/green-julius-caesar/candidate.json` (copied from
`app/public/data/editions/julius-caesar-modern-en.json`, then corrected in
this round — see below).

**Final file hash (candidate.json, sha256):**
`be475cf9c2b8ed2b85be22d8a1f8cb9bb1a89332e31bf390e1272323c02f52b9`
This hash is the acceptance's fidelity anchor — pinned to the file's state
*after* the round-1 fixes and *after* independent re-verification of those
fixes, per `TRANSLATION_PROTOCOL.md`'s pin-to-hash requirement.

Source hash (unmodified copy, for reference):
`5368eeed767055335f97e708cd163dfb2fa17576a7cf4909844236438d8c087c`

No app, registry, audio, or deploy action was taken at any point. This
directory only.

---

## Structure (verified)

- 18 chapters (Act 1 Sc.1–3, Act 2 Sc.1–4, Act 3 Sc.1–3, Act 4 Sc.1–3, Act 5
  Sc.1–5), all real act/scene units — no apparatus, editorial-note, or
  scene-crosswalk chapters.
- Chapter titles match source exactly (reader-facing `Act N, Scene M —
  location` form), verified against source's own chapter list.
- 997 paragraphs total in both source and candidate; exact per-chapter
  paragraph-count match; paragraph order locked (verified via
  `content_edit_helpers.validate_structure`).
- No empty or whitespace-only paragraphs on either side.
- Apparatus scan (Cambridge/Gutenberg pattern) run: one false-positive
  string match, no actual apparatus content anywhere in the book.

## Coverage table

| Step | What was done | Coverage |
|---|---|---|
| A. Accessibility (blind) | Full read of candidate.json only, no source seen | 18/18 chapters, 997/997 paragraphs, full read not sampled |
| B. Fidelity (packets + context) | Full paragraph-by-paragraph comparison against source, plus targeted whole-book sweeps for the batch's two recurring failure classes (name "correction," violence softening) | 18/18 chapters, 997/997 paragraphs |
| C. Whole-book cross-boundary re-read | Full re-read after fixes, with word-for-word extra scrutiny on the assassination scene (Ch8) and all Act 5 death/suicide scenes (Ch14–18) per task instruction | 18/18 chapters |
| D. Verify in final file + pin hash | Every fixed paragraph independently re-derived from source.json after edit; structure re-validated; `diff_report`/`assert_only_changed`-equivalent check confirmed only the 5 intended paragraphs changed | 5/5 fixed paragraphs re-verified |

## Defects found and fixed (Round 1 — the only round needed)

**5 paragraphs corrected, 2 defect classes, both matching this batch's
documented recurring failure pattern (silent name "correction" and
softened violent content):**

1. **Silently "corrected" name — "Antonius" → "Antony" (4 paragraphs, 5
   occurrences).** Source deliberately mixes "Antonius" (5 occurrences, all
   in Act 1 Sc.2–3) with "Antony" (77 occurrences everywhere else) — this is
   the source's own printed variation, not an error. The candidate had
   silently normalized every "Antonius" to "Antony," including dropping a
   vocative address entirely in one spot (Ch2 ¶8, where "Forget not ...,
   Antonius, / To touch Calphurnia" had lost the name altogether, not just
   its spelling). Fixed: Ch2 ¶6, Ch2 ¶8, Ch2 ¶52, Ch3 ¶6 — all restored to
   source's exact "Antonius" wording.
2. **Softened violent imagery (1 paragraph, 2 word choices).** Ch8 ¶99
   (Antony's prophecy over Caesar's body) had "infants quartered with the
   hands of war" softened to "infants cut to pieces," and "carrion men,
   groaning for burial" softened to "bodies of the dead, groaning for
   burial" — both losing the source's deliberately graphic imagery (a
   historically loaded execution term; corpses explicitly cast as
   scavenger-meat) for neutral euphemism. Both are ordinary modern English
   words, so restoring them cost nothing in accessibility. Fixed: Ch8 ¶99
   (both instances, in the same paragraph).

No other defects found. No actor-misattribution, negation-flip, causality-
reversal, omission, addition, or unmodernized-quotation defects found
anywhere in the book (checked via full read plus a negation-count tripwire
and a word-count-ratio tripwire; all 7 ratio outliers independently read
and confirmed benign short-line compressions, not omissions).

## Independent re-verification of fixes

All 5 corrected paragraphs were re-read against `source.json` after the
edit (see `fidelity-review-1.md` for the full text comparison). All match
source's wording and intent exactly. `assert_only_changed`-equivalent check
confirmed the edit round touched exactly the 5 intended paragraphs (Ch2 ¶6,
¶8, ¶52; Ch3 ¶6; Ch8 ¶99) and no others.

## Deliberately preserved, non-blocking items (with reader-centered reasons)

- **Allusion density in Cassius's Tiber speech (Ch2 ¶41), Brutus's
  serpent's-egg soliloquy (Ch4 ¶7), Antony's funeral oration (Ch9 ¶35), and
  Cassius's "Plutus's mine" line (Ch13 ¶39).** Flagged by the accessibility
  reviewer as places a reader may slow down — not fixed, because the
  difficulty is inherent to the content (historical/mythological allusion,
  political argument, rhetorical irony), not to the wording. Rebuilding
  these further would mean adding explanatory content the source doesn't
  license, which the acceptance procedure explicitly forbids.
- **Messala's "O hateful Error, child of Melancholy" apostrophe (Ch16
  ¶36).** Kept at an elevated register because it is a funeral-oration
  personification in the source itself, not archaic syntax needing
  rebuilding — flattening it would lose the passage's own rhetorical
  register, which the source deploys deliberately at this specific
  emotional beat (immediately after finding Cassius dead).
- **Frank/coarse-register period content kept intact:** Portia's "Portia is
  Brutus's whore, not his wife" (Ch4 ¶89), Cato's "What bastard doesn't?"
  (Ch17 ¶2), the Cobbler's bawdy wordplay (Ch1), the crowd's visceral stink
  ("threw up their sweaty nightcaps... such a stink of foul breath," Ch2
  ¶72) — all preserved as-is; verified present via whole-book scan, not
  softened.

## Verdict

**ACCEPTED.** All structural checks pass, both acceptance reviews (blind
accessibility, packet fidelity + whole-book cross-boundary re-read) are
complete and non-sampled, both rounds' defects were fixed and independently
re-verified against source in the same round, and the final hash above
covers the file's actual final state.
