# Jane Eyre — Chapter 38 (Conclusion), modern-en repair notes

Source of truth: `ch38-source.json` (1847 original, 24 paragraphs).
Repaired: `ch38-current-modern-en.json` (defective) → `ch38-corrected.json` (fixed).

**Diff verification (script-run):** comparing `ch38-current-modern-en.json` against
`ch38-corrected.json` paragraph-by-paragraph shows exactly **4 paragraphs changed**,
all others byte-identical:

- Changed (0-based indices): **1, 10, 12, 13**
- Changed (1-based / human-count): **2, 11, 13, 14**

All 24 paragraphs present in both files; paragraph count unchanged (24 → 24).

## Paragraph 1 (0-based) — the kitchen scene with Mary

**Wrong:** Omitted "John's knives also had rest from the polishing process" (the
detail that John pauses too, not just Mary). Invented "Then, without comment, she
resumed her basting. When she had finished and put the ladle down, she said—",
which relocates Mary's line to *after* she finishes basting and sets the ladle
down — contradicting the source, where she speaks *while still bending over the
roast*, ladle still in hand.

**Fixed:** Restored the parallel detail that John's knives "went still, resting
from their polishing" during the same three minutes as Mary's suspended ladle,
and restored the source's actual staging: "But Mary, bending again over the
roast, said only—" (she speaks mid-task, not after finishing).

## Paragraph 10 (0-based) — Adèle's epilogue

**Wrong:** Gutted. Missing: Jane's reason for not keeping Adèle as her pupil
("my time and care were now required by another—my husband needed them all");
the detail that the replacement school was near enough for regular visits and
bringing her home; "I took care she should never want for anything" (rendered
as comfort); Adèle's character description ("docile, good-tempered, and
well-principled"); and the closing line about Adèle repaying Jane's kindness
with grateful attention. The gutted version substituted vaguer, flatter lines
("realized that was impractical... found a school... eventually grew into a
pleasant and kind young woman... a faithful and agreeable companion") that
drop essentially every concrete claim in the source paragraph.

**Fixed:** Restored all omitted content: Jane's marital reason for not
resuming as governess, the school's proximity enabling regular visits and
occasional homecomings, the explicit assurance Adèle wanted for nothing,
the full character description (docile, good-tempered, well-principled),
and the closing sentence crediting Adèle's grateful attentiveness as
repayment for Jane's kindness.

## Paragraph 12 (0-based) — "bone of his bone" marriage-summary passage

**Wrong:** Two defects. (a) The ending was replaced with invented text: the
source's "All my confidence is bestowed on him, all his confidence is
devoted to me; we are precisely suited in character—perfect concord is the
result" was dropped and substituted with the invented "His presence is all I
need. Mine, he says, is all he needs." — a different (and much thinner)
claim that isn't in Brontë's text at all. (b) A pronoun-agreement break:
"We are truly bone of his bone and flesh of his flesh" mixes plural "we"
with singular "his," which is not how the source phrases it — the source
keeps this as Jane's first-person claim about herself relative to him ("...
ever more absolutely bone of his bone and flesh of his flesh," i.e., "I am").

**Fixed:** Restored the full closing sentence about mutual confidence and
"perfect harmony/concord" as the paragraph's actual ending. Corrected the
bone-of-his-bone line to stay in Jane's first person ("never was any woman
more truly bone of his bone and flesh of his flesh") rather than shifting
to the ungrammatical "we... his" construction.

## Paragraph 13 (0-based) — the reciprocity/services passage (novel's thematic resolution)

**Wrong:** Cut mid-thought, roughly halved. The current modern-en text stops
after "...what light could no longer stamp upon his eyes." and drops the
entire second half of the source paragraph: "Never did I weary of reading to
him; never did I weary of conducting him where he wished to go: of doing for
him what he wished to be done. And there was a pleasure in my services, most
full, most exquisite, even though sad—because he claimed these services
without painful shame or damping humiliation. He loved me so truly, that he
knew no reluctance in profiting by my attendance: he felt I loved him so
fondly, that to yield that attendance was to indulge my sweetest wishes."
This is the paragraph that resolves the novel's argument about mutual
dependence vs. domination in marriage, so truncating it cuts the book's
actual thematic payoff.

**Fixed:** Restored the full second half: reading to him, leading him
wherever he wished, doing whatever he wished done; the "full and exquisite,
even though tinged with sadness" pleasure in serving him because he accepted
her care without shame or humiliation; and the closing reciprocity claim —
he felt no reluctance in relying on her care because he knew she loved him
fondly enough that giving that care indulged her own dearest wishes.

## Untouched

All other 20 paragraphs (0-based indices 0, 2–9, 11, 14–23) are output
byte-identical to `ch38-current-modern-en.json`, per the diff script above —
no unflagged content was altered.
