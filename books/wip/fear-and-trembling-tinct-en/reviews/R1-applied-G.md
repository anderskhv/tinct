# R1 applied — Part G (ch7 ¶15–21, notes n7.19a, n7.27a)

- **Starting point:** draft r0, preserved at `drafts/history/G-ch7.r0.json`.
- **Revised draft:** `drafts/G-ch7.json`.
- **Outcome:** 1 MAJOR applied; 21 of 22 MINOR applied, 1 declined.

Every change was re-checked against the Danish in `source/original-da-final.json`.

| # | Slot | Finding | Decision | New wording |
|---|---|---|---|---|
| M1 | ¶18 | Gloss on "the demonic" is unsupported | **APPLIED** (editorial decision: the term is bare throughout the book) | "Now I will follow this with a sketch in the direction of the demonic." |
| 15.1 | ¶15 | *vel*: "surely" overstates the hedge | APPLIED | "she would presumably never have agreed to such a match" |
| 15.2 | ¶15 | Tense: *styres* is present | APPLIED | "as those slender lovers, men and women alike, are." |
| 15.3 | ¶15 | *dem selv* was dropped | APPLIED | "but leaves it to the lovers themselves". "The lovers" resolves the pronoun; "themselves" carries *selv*. |
| 15.4 | ¶15 | *Difficile* is flattened | **DECLINED** | Kept "what is so very difficult". *Difficile* is a naturalised Danish loan, not a foreign insertion under §A.6. Italicising or glossing it would add friction for the newcomer without adding meaning. The reviewer marked this optional. |
| 15.5 | ¶15 + n7.19a | "lade være at holde Bryllup" is rendered two ways | APPLIED | *holde Bryllup* is now "hold the wedding" everywhere: ¶15 "1) Should he keep silent and hold the wedding", "2) Should he keep silent and refrain from holding the wedding?"; n7.19a "refrain from holding the wedding". "Call off" is removed because it presupposes a fixed date. |
| 19a.1 | n7.19a | "hører man" is the subject | APPLIED | "Over and over, after all, one hears this story in poetry:" |
| 19a.2 | n7.19a | *een* is emphatic | APPLIED | "a man is tied to one girl he once loved" |
| 19a.3 | n7.19a | *Enkelthedernes Rumsteren* | APPLIED | "not this rattling-about of particularities within one and the same passion" (*Enkelthed* → "particularity", per the table) |
| 19a.4 | n7.19a | Laban gloss | APPLIED (coordinator wording) | "every such man is a Laban (a boor) who may be…" |
| 17.1 | ¶17 | "word by word" was added | APPLIED | "can understand its content lexically;" |
| 17.2 | ¶17 | *privatissimum* gloss anticipated "to him alone" | APPLIED | "or is it a privatissimum — a private lesson?" |
| 17.3 | ¶17 | *foregøgle sig selv* means self-deception | APPLIED | "wants to delude himself with all kinds of fantastic notions about how she will soon forget this business, and so on" |
| 17.4 | ¶17 | Scope of *ogsaa* | APPLIED | "He would then also be able to find rest in it, as far as I can imagine," |
| 18.1 | ¶18 | *Susen* collides with *Suk* ("sigh") | APPLIED | "bowing her head to the murmur of the sea" |
| 18.2 | ¶18 | Echo of *Forandring* | APPLIED | "Let us make a change." |
| 18.3 | ¶18 | Anaphora *men … men* | APPLIED | "but in absolute faith, but in absolute humility," |
| 18.4 | ¶18 | *synker sammen* | APPLIED | "Then the merman collapses." |
| 18.5 | ¶18 | *Lefleri* | APPLIED | "nonsense and gallantry and an offense against womankind" |
| 18.6 | ¶18 | Stranded preposition; "used to" added a habitual sense | APPLIED | "what she had been staring down at the bottom of the sea to find." |
| 27a.1 | n7.27a | *da* means "then" | APPLIED | "— then she inflames the merman." |
| 27a.2 | n7.27a | *Stoltheden* has the definite article | APPLIED | "now pride awakes." The owner is left as open as the Danish leaves it. |
| X.1 | ¶15, n7.19a, ¶17, ¶18 | *Fornærmelse / fornærme* is inconsistent | APPLIED | One rendering throughout: ¶15 "he has offended against the girl", "an offense against the girl and the reality of her love"; n7.19a "an offense against the girl"; ¶17 "personal offense"; ¶18 "an offense against womankind". |

## Screen after revision

Command: `screen.py drafts/G-ch7.json 14`

```
7.15 [14] an offense against the girl and the reality of her love should he speak
7.18 [15] now let us make a change the merman was a seducer he has called to
7.21 [15] torment for this is the profound contradiction in the demonic and in a certain sense
TOTAL words 2980; in shared 8-word runs 22.8%; in runs>=12 6.0%; in runs>=16 0.0%
```

**Re-rendered.** The revision created two new runs, and I re-rendered both from the Danish:

- **¶15:** "…and against the reality of her love" became "…and the reality of her love". This is closer to the Danish, which has a single *mod*.
- **n7.19a:** "because in his love for her he does not express…" became "because he does not, in his love for her, express the universal". This removed the n7.19a run entirely.

**Kept as forced.** Three runs remain:

- **¶15 (14 words):** a short clause, "en Fornærmelse mod Pigen og Realiteten af hendes Kjærlighed", followed by the three-word "3) Skal han tale?". The wording "offense" was requested by the review.
- **¶18:** three short Danish sentences, "Lad os gjøre en Forandring. Havmanden var en Forfører. Han har kaldt paa Agnete". "Make a change" was requested by the review.
- **¶21:** a fixed term plus a standard hedge. It was already kept in r0, and the reviewer passed it.

**Anchors.** Both anchors are unchanged and still valid. Each occurs exactly once in its paragraph: "in the same style as Axel and Valborg." (¶15) and "I have allowed myself a small change" (¶18).
