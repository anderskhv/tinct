# Montaigne Batch A — Content Fidelity Repair Notes

Scope: `mt-batchA-current-modern-en.json`, chapters 1–11 (the opening 11 essays,
Book I, essays I–XI in the Cotton/Hazlitt numbering), checked paragraph by
paragraph against `mt-batchA-source.json` (locked ground truth).

Method: every paragraph in every chapter was read against its corresponding
source paragraph, checking for dropped/invented clauses, meaning inversions,
compression of classical citations or anecdotes, factual/historical
distortions (names, dates, attributions), and any other content-fidelity
break, while allowing normal modern-English paraphrase/register change.

Paragraph counts verified programmatically before finishing: source and
`mt-batchA-corrected.json` both have 11 chapters and 155 paragraphs total,
with matching chapter numbers, titles, and per-chapter paragraph counts. No
paragraph was merged, split, dropped, or invented.

## Overall verdict

All 11 chapters are **sound**. This modern-en rendering is a genuine,
careful sentence-level paraphrase that preserves Montaigne's argument
structure, sequence of examples, classical citations (Latin quotations with
their bracketed cross-references), historical anecdotes, names, numbers, and
frank treatment of the body/violence/death material (e.g., the Betis/
Alexander torture scene, the Dionysius/Phyton scene, the Emperor Maximilian
bathroom-modesty passage, the Cyrus corpse passage). No dropped sentences,
no meaning inversions, no compressed/summarized anecdotes, and no sanitizing
were found across any of the 11 chapters. Two small defects were found and
fixed (both very minor; neither touches Montaigne's argument or examples).

Per-chapter verdicts:

1. "That men by various ways arrive at the same end" — sound (one defect fixed, see below).
2. "Of sorrow" — sound, no defects found.
3. "That our affections carry themselves beyond us" — sound, no defects found (longest and most citation-dense chapter in the batch; checked with extra care — Bertrand du Guesclin, Bartolommeo d'Alviano, Edward I, John Zizka, Emperor Maximilian, Captain Bayard, Arginusae/Diomedon, Chabrias, and all Latin quotations all check out against source).
4. "That the soul expends its passions upon false objects, where the true are wanting" — sound, no defects found.
5. "Whether the governor of a place besieged ought himself to go out to parley" — sound, no defects found.
6. "That the hour of parley is dangerous" — sound, no defects found.
7. "That the intention is judge of our actions" — sound, no defects found.
8. "Of idleness" — sound, no defects found.
9. "Of liars" — sound, no defects found (Francesco Taverna and Pope Julius II anecdotes both check out in full, including the "delicate nostril" line and the ambassador's fate).
10. "Of quick or slow speech" — sound, no defects found.
11. "Of prognostications" — sound (one defect fixed, see below).

## Defects found and fixed

### Chapter 1, paragraph index 1 — invented epithet

- **Source text:** "Edward, Prince of Wales (the same who so long governed our Guienne, a personage whose condition and fortune have in them a great deal of the most notable and most considerable parts of grandeur), having been highly incensed by the Limousins, ..."
- **Defective text (before fix):** "Edward, Prince of Wales — the Black Prince, who long governed our Guienne, a man whose fortune and character carried much of the most striking grandeur — had been provoked beyond bearing by the Limousins."
- **Issue:** "the Black Prince" is an invented interpolation not present in the source sentence. It happens to be a historically accurate identification of this Edward, Prince of Wales, but it is still added content the source does not contain, and the task instructions flag invented clauses regardless of factual correctness.
- **Fix applied:** removed the interpolated epithet. Corrected text now reads: "Edward, Prince of Wales — who long governed our Guienne, a man whose fortune and character carried much of the most striking grandeur — had been provoked beyond bearing by the Limousins."

### Chapter 11, paragraph index 21 — citation locator changed from source

- **Source text (bracketed citation):** `[“A mind happy, cheerful in the present state, will take good care not to think of what is beyond it.”--Ibid., ii. 25]` — i.e., the Horace quotation "Laetus in praesens animus; quod ultra est, / Oderit curare." is cited as "Ibid., ii. 25" (same author/work as the immediately preceding citation, "Hor., Od., iii. 29", with a new locator of book ii, line 25).
- **Defective text (before fix):** `["A mind happy in the present moment will hate to worry about what lies beyond." — Horace, Odes, ii. 16.]`
- **Issue:** the modern-en rendering silently changed the citation locator from "ii. 25" (as given in source) to "ii. 16." This looks like it may have been an attempt to correct the source's citation to the real-world Horace reference (the line is in fact from Odes II.16), but that is not this task's job — the task is fidelity to the locked source text, not independent fact-checking of the source's own apparatus. Silently altering a citation is exactly the kind of change the brief asks to be caught, since "every citation... is load-bearing."
- **Fix applied:** restored the locator to match source: `["A mind happy in the present moment will hate to worry about what lies beyond." — Horace, Odes, ii. 25.]` (kept the modern-en's spelled-out "Horace, Odes" style rather than reproducing source's abbreviated "Ibid.," since "Ibid." only resolves correctly relative to the immediately preceding citation and the modern-en edition does not use "Ibid." elsewhere; the locator itself — the only substantive content — now matches source exactly.)

## Notes on judgment calls (no fix applied)

- Several Latin epigraph brackets are independently re-translated from the
  Latin rather than copied from the source's English gloss (e.g., ch. 9's
  Pliny tag "Ut externus alieno pene non sit hominis vice," ch. 2's Catullus
  and Petrarch fragments). These are different but substantively equivalent
  renderings of the same Latin, not omissions or distortions of Montaigne's
  own prose, so they were left as-is.
- A few names use modern/variant spellings consistent with the same person
  named in source (e.g., "John Zizka" for source's "John Zisca"; "Giuliano
  Romero" for "Juliano Romero"; "Fabrizio Colonna" for "Fabricio Colonna";
  "Ottaviano Fregoso" for "Ottaviano Fregosa"; "Aemilius" for "AEmilius").
  These are standard orthographic variants of the same historical figures,
  not identity errors, so no fix was applied.
- Ch. 5's disambiguation of the ambiguous source pronoun "he himself" (as
  referring to Monsieur de l'Escut, not Count Guido di Rangone) and the
  parenthetical clarification of "Guicciardini says it was he himself" (as
  "Guicciardini says it was Guicciardini himself") were checked against the
  surrounding sentence logic and are correct readings of the ambiguous
  source syntax, not distortions.

## Files

- `mt-batchA-corrected.json` — full corrected file, same 11-chapter/
  155-paragraph shape as source, with the two fixes above applied. All other
  paragraphs are unchanged from `mt-batchA-current-modern-en.json`.
- This notes file.

No other files were modified. Nothing was committed or pushed.
