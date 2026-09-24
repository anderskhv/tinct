# FM round 3: independent re-verification

Scope: the 6 paragraphs changed after FM-R1 (ledger rounds FM-R2-fid / FM-R2-acc). For each, the current candidate text hashes (sha256[:16]) to the ledger's `new` value, so the latest edit is what is being verified. Source and candidate were read in full.

- extracts.2: VERIFIED CLEAN. Narrator prose. Every element is kept: poor devil, Sub-Sub, sallow tribe, Pale Sherry "rosy-strong", poor-devilish, convivial over tears, full eyes and empty glasses, Hampton Court, the Tuileries, royal-mast, seven-storied heavens, Gabriel, Michael and Raphael, splintered and unsplinterable. The latest fix, "the more pains you take to please the world, the more you will forever go unthanked", carries the sense of "for ever go thankless" (remain unthanked) exactly. "against your coming" becomes "in readiness for your coming", which is correct.
- extracts.11: VERIFIED CLEAN. "Whales" is capitalized as printed. "beating the sea ahead of him into foam" restores the masculine personification. The ledger asked for "him", and the screening note's "before him" means the pronoun. "This one came" follows the source. The elision "...." is kept. The attribution reads "— Tooke's Lucian. "The True History."" as printed.
- extracts.12: VERIFIED CLEAN. The gloss "(walruses)" is accurate: Ohthere's horse-whales, valued for the bone of their teeth, are the standard identification as walruses. It appears once and is brief. All numbers are kept: forty-eight, fifty yards, six, sixty, two days. "catched" becomes "caught". The attribution "Other or Octher's verbal narrative ... King Alfred, A.D. 890" is as printed.
- extracts.34: VERIFIED CLEAN. The simple past "came in ... in the year 1652" is correct for "Anno 1652". Fife, eighty feet, whalebone kind, the "(as I was informed)" hedge, the vast quantity of oil, 500 weight of baleen, and the jaws as a gate at Pitferren are all kept. The attribution "Sibbald's Fife and Kinross" is as printed.
- extracts.59: VERIFIED CLEAN. "no less than forty years ago" is restored and anchored to the speaker's present. "bespeak" becomes "order", which is correct. "Pacific Ocean" is capitalized, an ordinary normalization. "— Ibid." is kept.
- extracts.70: VERIFIED CLEAN. The source closes the quotation (`inevitable.”`) with no opening mark. That is a source typo, not a multi-paragraph continuation: extracts.69 is self-contained. Adding the opening straight quote to balance the marks is appropriate and matches every other prose extract. Content is complete: the whale he had wounded, fending off with a lance "for some time", the boat rushed, he and his comrades saved only by leaping when the onset was inevitable ("could not be avoided"). The attribution "Missionary Journal of Tyerman and Bennett" is as printed.

## Whole-file sanity scan (front-matter.modern-en.json)

- Paragraph counts: etymology 6 and extracts 86, matching the source. The titles "Etymology" and "Extracts" are correct.
- Curly quotes or apostrophes: none. Underscores: none. Unspaced em dashes: none. Empty paragraphs or stray leading, trailing or doubled whitespace: none.
- Doubled words: one hit, extracts.68 "Aye aye, sir!". It is legitimate and mirrors the source's "Ay ay".
- Unbalanced double quotes: extracts.49 and extracts.64, one unclosed opening mark each. Both mirror the source: each is a quotation that continues into the next paragraph, with the closing mark and attribution at extracts.50 (Cowper) and extracts.65 (Scoresby). This is the edition's convention and was already accepted in round 2.
- Source-unbalanced but candidate-balanced: extracts.70 only, which is intended (see above).

## Overall verdict

PASS. All 6 changed paragraphs are verified clean, and the whole-file scan found no defects. No reverify.json was written.
