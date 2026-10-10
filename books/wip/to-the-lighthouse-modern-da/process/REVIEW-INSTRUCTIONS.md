# Independent review of a Danish translation bundle — To the Lighthouse

You are an independent reviewer (a fluent Danish literary reader/editor). Do not call any external API; do the review yourself and do not edit any file except your review output.

Inputs: `src/<BUNDLE>.json` (the English text, list of chapters {number,title,paragraphs}) and `out/<BUNDLE>.json` (the Danish translation of the same bundle, same structure). Read EVERY paragraph pair in full.

For each paragraph decide PASS or FAIL. FAIL only for concrete defects:
- omission (a clause, image, hedge or name missing), invention (added content), reversal or change of sense/hedge/tense/person (who thinks or speaks), wrong referent;
- mistranslation of an idiom, an allusion or a quoted verse line so that the sense is lost or garbled;
- ungrammatical, unidiomatic or clearly awkward Danish (anglicism, wrong preposition, agreement or word-order error, a coined word that a Danish reader would not understand);
- leftover English words (other than proper names/titles), a leftover English apostrophe or curly/straight quote, a wrong quote mark (dialogue must be »…« with ›…‹ inside), a changed paragraph structure, a dropped or added underscore/bracket marker, a dropped line break (\n);
- terminology inconsistent with the glossary below.

Glossary (use exactly): the Lighthouse (destination) = Fyret; Mrs./Mr./Miss = fru/hr./frøken; "Damn your eyes" = »Fanden tage jeres øjne« (as in the song refrain, keep the same wording everywhere); "Damn you" = »Fanden tage dig«; "Someone had blundered" = »Nogen havde begået en fejl«; "We perished, each alone" = »Vi omkom, hver for sig«; "But I beneath a rougher sea" = »Men jeg under et vildere hav«; "red-hot poker(s)" = fakkelliljer; "the Fisherman and his Wife" = »Fiskeren og hans kone«; dashes: spaced " — " throughout.
Do not fail a paragraph merely because you would have chosen different words; stylistic preferences go in `note` with verdict PASS. Woolf's long, flowing sentences should stay long and flowing.

For every FAIL give a minimal corrected full paragraph in `replacement` (the whole Danish paragraph, with only the necessary fixes; keep the translator's wording elsewhere).

Output: write `review/<BUNDLE>.review.json` as a list with ONE entry per Danish paragraph, in order: {"chapter": N, "index": i (0-based), "verdict": "PASS"|"FAIL", "category": "...", "note": "...", "replacement": "(only for FAIL)"}. Validate it with python (json parses; entry count equals the paragraph count; every FAIL has a replacement). Finally report counts and the most significant defects.

Base directory for all paths: /tmp/claude-0/-home-user-tinct/21282b73-f8f8-5d05-8287-17edaf34564b/scratchpad/night/lighthouse-da/
