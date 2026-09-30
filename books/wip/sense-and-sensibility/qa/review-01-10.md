# Chapters 1–10 — author review checkpoint

Paragraph alignment: exact, 190 source/rendered pairs. Every target paragraph has at least 75% of source whitespace-delimited words; minimum 0.761. Sentence-by-sentence author rendering in the conversation; no mechanical replacement pass or external generation API.

Reviewed against source: inheritance chain, seven/thousand/ten-thousand-pound sums, John and Fanny's progressively shrinking promise, Elinor's uncertainty, Cowper/Scott/Pope, Barton house dimensions and domestic arrangements, age and rheumatism jokes, Willoughby's rescue and musical courtship, Brandon's contrasting character. Retained names and dialogue, including the complete farewell to Norland and the complete three-reason speech ending chapter 10. Historical kinship usage “mother-in-law”/“son-in-law” is rendered as stepmother/stepson where required by the relationships. Original wording remains unchanged in original-en.

Gate: `python3 books/classify-modern-en.py /tmp/tinct-sense-and-sensibility/books/wip/sense-and-sensibility/qa/batches/01-10/sense-and-sensibility --gate --per-chapter`.

The batch files are exact chapter 1–10 slices of the staged originals and candidate; they are separate because the existing classifier checks full structural equality before any chapter filter. No placeholder or copied-original chapters fill the unfinished candidate. Full staged original has 50 chapters; partial modern-en has 10. This batch pass is not a whole-book pass or independent editorial acceptance.

Independent accessibility review and a final complete semantic audit remain pending.
