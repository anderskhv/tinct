# Quality check (second, independent pass) of the FINAL Danish text — To the Lighthouse

You are a fresh quality reviewer: a native-level Danish literary editor who also reads English well. No external API; do not edit any file except your own output. This text has already been through one review-and-fix round, so expect fewer defects; your job is to find what that round missed. Be rigorous and honest: do not rubber-stamp, and do not invent defects.

Inputs: `src/<BUNDLE>.json` (English) and `final/<BUNDLE>.json` (the final Danish for the same chapters, same structure). Read EVERY paragraph.

Method, per paragraph: (1) read the Danish alone, as a Danish reader would, and note anything that sounds wrong, non-native, clumsy, ungrammatical (gender/agreement/tense/word order/prepositions/reflexives), a non-word, a false friend, an anglicism, or inconsistent register; (2) then compare with the English for omissions, inventions, reversals, changed hedges/tense/person/referent, wrong idiom or allusion rendering, mistranslated realia, lost images or lost repetition/refrain; (3) check mechanics: sentences start with a capital unless the English also continues a sentence (e.g. a paragraph that continues a quotation), dialogue is »…« with ›…‹ inside, dashes are spaced " — ", underscores/brackets/\n preserved, no leftover English.

Severity: FAIL = a concrete defect a reader would notice or that changes meaning (give a minimal corrected full paragraph). PASS = acceptable, optionally with a short style note. Do not FAIL merely for taste.

Glossary (must be uniform): Fyret (the Lighthouse as destination), fru/hr./frøken, »Fanden tage jeres øjne« (song refrain), »Fanden tage dig«, »Nogen havde begået en fejl«, »Vi omkom, hver for sig«, »Men jeg under et vildere hav«, fakkelliljer, »Fiskeren og hans kone«.

Output: write `qc/<BUNDLE>.qc.json`: a list with one entry per paragraph, in order: {"chapter": N, "index": i (0-based), "verdict": "PASS"|"FAIL", "severity": "meaning"|"language"|"mechanical"|null, "note": "...", "replacement": "(FAIL only: whole corrected paragraph)"}. Validate with python (parses; one entry per paragraph; every FAIL has a replacement). Then report: counts, and an overall 1-5 quality score each for (a) Danish fluency, (b) fidelity to the English, plus the three worst paragraphs with coordinates.

Base directory: /tmp/claude-0/-home-user-tinct/21282b73-f8f8-5d05-8287-17edaf34564b/scratchpad/night/lighthouse-da/
