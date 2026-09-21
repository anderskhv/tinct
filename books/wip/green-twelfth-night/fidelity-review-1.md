# Fidelity Review 1 — Twelfth Night (`twelfth-night`, modern-en)

**Reviewer:** Claude Sonnet 5, full pass against `source.json` (locked
fidelity anchor — an unmodified copy of
`twelfth-night-original-en.json`).

**Coverage statement:** All 18 chapters / 1,120 paragraphs read and
compared against source, non-sampled, in sequential order with full
neighboring context (not isolated packets — the whole play was read start
to finish paragraph-by-paragraph against source in one continuous pass,
which exceeds the packet-with-context minimum). This is the same reading
session as `accessibility-review-1.md`. In addition to the paragraph
read, targeted whole-book sweeps were run programmatically for every
defect class this batch's tracker (`SECOND-BATCH-TRACKER.md`) flags as
recurring: silently "corrected" names/spellings (including case-sensitive,
ALL-CAPS speaker-tag forms), imported wording from another edition,
glosses naming what source leaves ambiguous, softened bawdy/frank
content, reversed meaning/direction, and inconsistently-rendered epithets.

Specific checks run and their coverage:
- Structure: 18/18 chapters, all real Act/Scene units, no apparatus or
  editorial-note chapters. 1,120/1,120 paragraphs in both source and
  candidate, exact per-chapter count match, paragraph order locked, no
  empty/whitespace paragraphs (`content_edit_helpers.validate_structure`).
- Apparatus scan (Cambridge/Gutenberg pattern): one false-positive
  substring match ("bosom." containing "om." — Viola's line "In Orsino's
  bosom"), no actual apparatus content anywhere in the book.
- Speaker-tag set comparison, case-sensitive: source and candidate
  speaker-tag sets match exactly, including the mixed forms `SIR TOBY`,
  `SIR ANDREW`, `AGUECHEEK` (used interchangeably with `SIR ANDREW` in the
  source's own printed text) and `CLOWN` — no character silently renamed,
  merged, or normalized.
- **Whole-book, case-sensitive occurrence count for every named character
  and recurring epithet**, checked in both mixed-case and ALL-CAPS forms
  (this batch's specific documented gap from earlier books): Malvolio,
  Sir Toby/Belch, Sir Andrew/Aguecheek, Feste, Fabian, Maria, Olivia,
  Viola, Cesario, Orsino, Sebastian, Antonio, Curio, Valentine, Illyria,
  Messaline, cross-gartered. Only two count deltas turned up, both
  investigated directly: (a) one extra "Duke" instance, traced to a
  legitimate added line-internal reference in Ch4 ¶1, not a name issue;
  (b) a "cross-gartered"/"Cross-gartered" case split that was a counting
  artifact of the sweep script's case sensitivity, not a real
  discrepancy (confirmed by direct inspection — all 7 source occurrences,
  in both cases, are present and correctly placed in the candidate).
- **Whole-book scan for bawdy/frank-content vocabulary and set-piece
  jokes** (the "C's, U's, and T's" letter-hand joke, "codling,"
  "maidenhead"/"virginity," "gelding"/"cut," "tup," "whore," "wench,"
  "cuckold," Sir Toby's "take thee between her legs" line, Maria's "now I
  let go your hand, I am barren" jest) — every instance present and
  unsoftened in the candidate; the central bawdy joke ("these be her
  very C's, her U's, and her T's... her great P's") is reproduced
  verbatim, letter for letter.
- Word-count ratio tripwire (`content_edit_helpers.word_count_ratios`) on
  every paragraph — 1 flagged (Ch3 ¶31, "Fare you well, gentlemen." →
  "Farewell, gentlemen.", ratio 0.6), read directly and confirmed a benign
  short-line compression, not an omission.

## Defects found (Round 1) — all 3 fixed in this same round

### Defect 1: imported scholarly-edition emendation for a textual crux — Ch3 (Act 1, Scene 3) ¶65

Source prints **"dam'd-colour'd stock"** — a famous Shakespeare textual
crux (the First Folio's own unusual spelling; different modern scholarly
editions variously emend this to "flame-coloured," "dun-coloured," or
"damask-coloured," none of which is what this locked source itself
prints). The candidate had rendered this as "flame-colored stocking,"
silently substituting a specific scholarly emendation for the source's
own (deliberately odd) printed wording — exactly the forbidden class of
importing wording from a different edition instead of translating the
locked source's own text.

**Fix applied:** rendered literally as source prints it — "damned-colored
stocking" — preserving the source's own odd/crux wording rather than
adopting any editor's guess at what Shakespeare "really" wrote.

### Defect 2: reversed meaning — Ch9 (Act 2, Scene 4) ¶32

Source: "I would have men of such **constancy** put to sea..." (Feste's
ironic sign-off, immediately after calling the Duke's mind "a very
opal" — changeable — the irony is the source's own, deliberately using
"constancy" to mean the opposite of what he's just described). Candidate
had: "I would have men of such **inconstancy** put to sea..." — the word
was silently flipped to its opposite, removing the irony the source's own
wording depends on and replacing the source's actual printed word with
its antonym.

**Fix applied:** restored "constancy" verbatim, matching source exactly.

### Defect 3: silently "corrected" a deliberate malapropism — Ch18 (Act 5, Scene 1) ¶75

Source: Sir Andrew says "...he's the very devil **incardinate**." This is
one of Sir Andrew's characteristic malapropisms (a garbled form of
"incarnate," consistent with his established pattern of getting words
slightly wrong throughout the play — see also his confusions over
"pourquoy," "Taurus," and "accost"). The candidate had silently corrected
this to "the very devil **incarnate**," erasing the deliberate mangling —
exactly the failure class this batch's tracker flags as recurring
(Midsummer's "deflower'd" correction, this book's own gate-screening
note about Aguecheek's malapropisms).

**Fix applied:** restored "incardinate" verbatim, matching source's
deliberate malapropism exactly.

## Cross-boundary / whole-book re-read (Step C)

After the three fixes above, the whole play was re-read once more against
source with a dedicated, coordinate-matched (not count-only) sweep for
recurring epithets and proper nouns across chapter boundaries — checking
that every character's name/title is rendered consistently in every
appearance, in both mixed-case dialogue and ALL-CAPS speaker-tag form,
across all 18 chapters. No further discrepancies found. The
`safe_replace`/`assert_only_changed` check confirmed the edit round
touched exactly the 3 intended paragraphs (Ch3 ¶65, Ch9 ¶32, Ch18 ¶75)
and no others; `validate_structure` re-confirmed all 18 chapters
structurally intact (1,120/1,120 paragraphs, correct order, no
empty/whitespace paragraphs) after the edit.

## Independent re-verification of fixes

All 3 corrected paragraphs were re-read directly against `source.json`
after the edit (not trusting the fix's own stated rationale):

- Ch3 ¶65 candidate now reads "...it looks tolerably well in a
  damned-colored stocking..." — matches source's "dam'd-colour'd stock"
  exactly (translated, not emended).
- Ch9 ¶32 candidate now reads "I would have men of such constancy put to
  sea..." — matches source's "constancy" exactly (word restored, not
  flipped).
- Ch18 ¶75 candidate now reads "...he's the very devil incardinate." —
  matches source's "incardinate" exactly (malapropism restored, not
  corrected).

No other defects found anywhere in the book: no actor-misattribution,
negation-flip, causality-reversal, content omission/addition, softened
bawdy content, or inconsistent epithet rendering found in the full
paragraph-by-paragraph read plus the targeted sweeps described above.

## Deliberately preserved, non-blocking items (with reader-centered reasons)

- **Dense wordplay in Feste's set-piece jokes** (the "cuckold"/"beauty's a
  flower" syllogism, "cucullus non facit monachum," the chev'ril-glove
  metaphor) — kept exactly as translated, difficulty is inherent to the
  character's design as a professional wit, not a wording problem;
  flagged in the accessibility review for the reader's awareness only.
- **Sir Andrew's confusions and garbled logic throughout** (beyond the
  one corrected malapropism) — all preserved as source's own deliberate
  characterization; verified present via the full read, not softened or
  clarified.
- **Unglossed period/nonsense allusions** ("Pigrogromitus," "the
  equinoctial of Queubus," "the bed of Ware," "Sowter") — left unglossed,
  since inventing an explanation for a reference the source itself uses
  as deliberate nonsense (Sir Andrew's own dialogue frames these as
  absurd) would violate the rule against glossing what source leaves
  unnamed/ambiguous.
- **All bawdy and frank content** (the letter-hand joke, Sir Toby's crude
  jokes about Sir Andrew's legs, Maria's "barren" jest, "gelding"/"cut,"
  the general drunken-carousing register of the Sir Toby/Sir Andrew/Feste
  scenes) — verified present and unsoftened via the whole-book scan
  described above; no euphemism substitutions found.
