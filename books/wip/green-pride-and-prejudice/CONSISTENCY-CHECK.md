# Whole-book consistency and coverage check: final candidate

Candidate sha256: `5ba867fe5e13a7c7c1f1f94946c6b6a575f342951467245a0d816723dd3f4c77`. The lead ran these checks programmatically on the assembled book after all rounds.

| Check | Result |
|---|---|
| Structure | 61 chapters and 2,060 paragraphs. Numbers, titles and per-chapter counts are identical to the source and to live |
| Serialization | Same JSON form as live, so unchanged paragraphs are byte-identical. There are no characters outside the BMP, so the character cards' UTF-16 offsets are code-point equal |
| Coverage | Every paragraph was reviewed against the source in round 1 (9 reports) and read by a candidate-only reader in round 2 (5 reports). Every changed paragraph was verified in its final form in round 4 (3 reports, plus the 4b check) |
| Quote balance | No candidate paragraph has an open double quote that the source does not also have. The multi-paragraph letters stay open exactly as in the source |
| Italics (`_x_`) | Balanced in every paragraph |
| Dashes | No spaced em dashes other than the source's "——shire" and "——" name blanks. No doubled punctuation and no doubled words |
| Proper names against the source | Every source name is present in its aligned paragraph, except these expected cases: <ul><li>spelling modernizations (Honourable/Honorable, Scotch/Scottish, Lakes/Lake District, Lizzie/Lizzy, Mamma/Mama);</li><li>"Miss Bennet" rendered "Jane" in narration, the live edition's existing clarity convention (8 paragraphs; dialogue forms of address are kept);</li><li>pronoun substitutions that the reviewers checked;</li><li>35.4 "Mr. Darcy" becoming "my father", an intended referent fix, because in the letter "Mr. Darcy" is Darcy's father</li></ul> |
| Numbers | Every source number is present, except 19.9 "the 4 per cents", which becomes "government bonds". That is accepted, because the 4 per cents were government stock and the sum of one thousand pounds is kept |
| Key terms | <ul><li>"parish" is the church sense throughout (18 uses); "living" is used only in its ordinary sense (14 uses)</li><li>"entail" appears in 12 paragraphs and is glossed at its first appearance (7.0)</li><li>"de Bourgh" appears 34 times, consistently</li><li>"condescension" is kept in Mr. Collins's and the narrator's ironic uses (6.0, 14.0, 28.6, 29.0, 29.9, 37.19)</li><li>"sensible" is aligned across 13.20, 15.0 and 22.4</li><li>"tolerable" is aligned across 3.13 and 5.8</li><li>"disguise" is aligned across 34.21 and 35.4</li></ul> |
| Anachronisms | No "OK", "okay", "guy", "kid(s)", "mom" or "dad". "Carsick" (39.21) and "God" (18.74) were removed; both came from the baseline |
| `books/audit-truncation.py` (modern-en against original-en, 0.75 ratio) | 5 flags (the baseline had 8): 6.38, 33.25, 48.6, 53.41 and 55.8. The lead read each one against the source, and each is concise modern phrasing with nothing omitted. They were also inside the round-1 full review |
| `books/classify-modern-en.py --gate` (mandatory modern-en similarity gate; run with local paths) | **GATE PASS**. Weighted similarity 0.672 against the 0.75 limit; 61/61 chapters REAL; 0 light or mechanical chapters; 0 identical long paragraphs; 0 wrapped scaffolding; 0 truncated quotations |
| `books/content-verify.py` | 758 eligible paragraphs checked: CLEAN, no fabrication suspects |

**Known structural issue:** seven mid-sentence paragraph breaks are inherited from the source. They are documented in `ACCEPTANCE-RECORD.md` and left in place so that alignment is kept.
