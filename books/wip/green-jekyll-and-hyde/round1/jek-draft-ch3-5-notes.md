# Jekyll & Hyde — modern-en draft notes (chapters 3-5)

## Method

Rendered each of the 38+18+17 = 73 source paragraphs individually, sentence
by sentence, against `source.json` only (never referencing the lightly-touched
candidate.json text for chapters 3-5, and never importing wording from any
other edition). Matched the register and house style established in the
candidate's chapters 1-2 (curly quotes, em dashes, British forms like "Mr.",
contractions in dialogue where natural). Validated programmatically: JSON
parses, chapter numbers/titles match source, paragraph counts match source
exactly (17/18/38), no empty paragraphs, and word-count ratio per paragraph
stayed within a normal band (0.7-1.6x source) as a sanity check — no outliers
flagged.

Then did a second, full paragraph-by-paragraph re-read against the source
text side by side, checking: every proper noun, number, date, and named
figure preserved (Sir Danvers Carew, Cavendish/Soho references carried from
ch. 2 context, "18—", "quarter of a million," "several thousand pounds,"
"nearly two months," "two o'clock," "nine in the morning"); every hedge and
qualifier kept ("no doubt," "I fear," "as far as I could tell"-type phrasing
where present); dialogue actor attribution unchanged in every exchange
(care taken in the fast Utterson/Guest and Utterson/Jekyll exchanges in ch.
5 not to swap who says what); no resolution of Stevenson's deliberate
ambiguity or held-back detail (e.g., Jekyll's unexplained "I have grounds for
certainty that I cannot share with any one" is kept exactly as a withheld
reason, not filled in; the maid's inability to say what the two men were
discussing is preserved; Utterson never learns why Jekyll trusts Hyde will
vanish, and the draft does not supply a reason).

## Glosses added

None. Rereading all three chapters, I found no term or reference that would
stop a first-time adult listener and that a reference work would need to
confirm — no mythological names, obscure legal doctrines, or historical
events requiring a clarification, unlike some other chapters/books in this
project. Chapter 4's "Scotland Yard," "M.P.," and "Coutts's"-type references
(none appear in ch. 3-5 specifically) are either already plain in context or
not present here. "pede claudo" (Latin, "with limping foot") appears in
chapter 2, not in my assigned range, so it was not addressed.

## Passages where source wording/structure was kept close on purpose

- Ch. 3, para 0 and Ch. 4, para 0 (the two longest paragraphs): these are
  single long descriptive/narrative periods in the source. I split some of
  the longest run-on sentences into two for read-aloud clarity (e.g. the
  opening sentence of ch. 4 para 0, and the "chocolate-coloured pall" weather
  description in ch. 4 para 9), but kept the overall paragraph as one block
  matching the source's own paragraphing, per the "never merge/split
  paragraphs" rule (that rule applies to the paragraph array, not internal
  sentences).
- Dialogue-heavy paragraphs throughout (ch. 3 almost entirely, ch. 5 largely)
  were already close to natural spoken English in the source once archaic
  verb forms and inversions were removed; I kept sentence order and phrasing
  close where the original wording was already clear, per "similarity is not
  a defect" — e.g. Utterson's "I promise," Jekyll's "I have had a lesson,"
  and the closing "Henry Jekyll forge for a murderer!" line (rendered "forge
  a letter for a murderer" only to supply the implied object smoothly aloud;
  no meaning added).
- Archaic vocabulary modernized throughout: "cronies" → "old friends" (ch.
  3.0), "hide-bound pedant" → "rigid pedant" (ch. 3.2), "ay" → "yes" (ch.
  3.10), "give you my hand upon that" → "give you my word on that" (ch.
  3.10, same solemn-promise meaning), "narrated" → "told the story" (ch.
  4.0), "disinterred" → "dug out" (ch. 4.15), "sedulously" → "carefully"
  (ch. 5.30), "insensibly" → "little by little" (ch. 5.21), "quailed" →
  "flinched" (ch. 4.5), "ruminated" → "mulled this over" (ch. 5.9).
- Named epithets/characterizations of Hyde and the crime kept exactly as the
  source frames them (e.g. "ape-like fury," "wicked-looking," "murderous,"
  "the fugitive") — not softened, per the character-voice/epithet rule.
- "quarter of a million sterling" rendered "quarter of a million pounds" —
  a plain-English equivalent of the same figure and currency, not a meaning
  change.

## Validation run

```
python3 -c "... json.load + paragraph-count/title/empty checks ..."
```
Result: all three chapters (3, 4, 5) have valid JSON, matching titles,
matching paragraph counts (17, 18, 38), no empty paragraphs, and no
word-count-ratio outliers outside 0.7-1.6x source length.
