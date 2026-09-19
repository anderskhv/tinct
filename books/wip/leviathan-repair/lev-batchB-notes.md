# Leviathan Batch B — Content-Fidelity Audit Notes

**Scope:** `lev-batchB-current-modern-en.json` vs. `lev-batchB-source.json`, chapters 11–20
(source numbering: Ch.10 Power/Worth/Honour, Ch.11 Manners, Ch.12 Religion, Ch.13 Natural
Condition of Mankind, Ch.14 First/Second Laws of Nature & Contracts, Ch.15 Other Laws of
Nature, Ch.16 Persons/Authors, Ch.17 Causes/Generation/Definition of a Commonwealth,
Ch.18 Rights of Sovereigns by Institution, Ch.19 Kinds of Commonwealth & Succession).

**Method:** Every paragraph of every chapter was read side-by-side against the source
(all 283 paragraphs across the 10 chapters), with special attention to Ch.13–15 (state of
nature, "war of every man against every man," the "nasty, brutish, and short" passage, and
the enumerated Laws of Nature), checking for dropped/invented clauses, negation flips,
compressed argument steps, skipped numbered laws or examples, and terminological drift.

## Result: No content-fidelity defects found.

Every source paragraph has exactly one corresponding modern-English paragraph, and in every
case checked, the modern rendering carries the full clause structure, every premise in
Hobbes's syllogistic chains, every numbered Law of Nature (including the un-numbered
"depends on this law" / "also a Law of Nature" ones between the explicitly ordinal-numbered
ones in Ch.15, which the source itself leaves unnumbered — the modern text correctly
preserves that same unevenness rather than inventing false numbering), every Latin tag with
its gloss, and every named example (Phormio/Scipio, Numa Pompilius, the Golden Calf, Coke's
Commentaries, King James's Union of the Crowns, etc.). No negations were dropped or flipped,
no conditionals reversed, no premises silently skipped.

Per-chapter verdicts:

| Ch (output #) | Source Ch. | Title | Paragraphs | Verdict |
|---|---|---|---|---|
| 11 | 10 | Of Power, Worth, Dignity, Honour and Worthiness | 51 | PASS — faithful |
| 12 | 11 | Of the Difference of Manners | 28 | PASS — faithful |
| 13 | 12 | Of Religion | 32 | PASS — faithful |
| 14 | 13 | Of the Natural Condition of Mankind | 14 | PASS — faithful (state-of-nature material checked at full sentence-level detail; three causes of quarrel, all three defining clauses of War, "nasty, brutish, and short" quotation intact, all preserved) |
| 15 | 14 | Of the First and Second Natural Laws, and of Contracts | 34 | PASS — faithful (both Fundamental Laws, all Right/Law distinctions, all contract/gift/covenant distinctions, all Latin tags with glosses, all invalidity conditions for covenants preserved) |
| 16 | 15 | Of Other Laws of Nature | 43 | PASS — faithful (Laws 3 through 19 all present in the same order and with the same — intentionally uneven — numbering as the source; the Fool passage, Coke/Littleton example, Foro Interno/Externo distinction, and the closing account of moral philosophy all intact) |
| 17 | 16 | Of Persons, Authors, and Things Personated | 18 | PASS — faithful |
| 18 | 17 | Of the Causes, Generation, and Definition of a Commonwealth | 16 | PASS — faithful (the social-contract "I authorise and give up my right..." formula, the definition of Leviathan/"Mortal God," and the six-point comparison to bees and ants are all complete) |
| 19 | 18 | Of the Rights of Sovereigns by Institution | 24 | PASS — faithful (all numbered sovereign rights, first through eleventh, present and complete) |
| 20 | 19 | Of the Several Kinds of Commonwealth by Institution, and of Succession | 23 | PASS — faithful |

## Minor observations (not fidelity defects — no action taken)

- **Ch.14 (source Ch.13), paragraph 7 (0-indexed):** the modern rendering adds a parenthetical
  gloss "(a war of all against all)" immediately after translating "such a warre, as is of
  every man, against every man." This is a redundant restatement of content already present
  in the same sentence (not an invented claim, nothing dropped), so it was left as is.
- A number of Latin/Greek terms in the modern edition carry bracketed transliterations or
  glosses (e.g. Kleronomia (κληρονομία), Prosopon (πρόσωπον)) not present in the 1651 source
  spelling — these are additions of clarifying apparatus, not distortions of Hobbes's
  argument, and were left in place.
- Several sub-heading fragments that appear as run-on marginal notes in the source
  (e.g. "Justice And Propriety Begin With The Constitution of Common-wealth", "The Eighteenth,
  No Man To Be Judge, That Has In Him Cause Of Partiality") are rendered in the modern text
  as bracketed section headers on their own line before the paragraph proper. This is a
  formatting choice consistent across the whole file and does not add or remove content.

## Output files

- `lev-batchB-corrected.json` — identical to `lev-batchB-current-modern-en.json` (no edits
  were required; paragraph counts verified programmatically to match
  `lev-batchB-source.json` exactly, 10 chapters / 283 paragraphs total, one-to-one).
