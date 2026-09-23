# Frankenstein modern-en: fidelity and listenability review, part 4

**Scope:** chapters 22–28 (titled "Chapter 18" to "Chapter 24", ending with Walton's closing letters).

**Files:** source `books/wip/green-frankenstein/source.json` and candidate `candidate.json`. The candidate was read only and not edited.

## What I read
I read every paragraph pair in full, source against candidate, in order, so each paragraph was read with its neighbors on both sides. That is all 288 pairs:
- Chapter 22: paragraphs 0–25 (26 pairs)
- Chapter 23: paragraphs 0–22 (23 pairs)
- Chapter 24: paragraphs 0–36 (37 pairs)
- Chapter 25: paragraphs 0–48 (49 pairs)
- Chapter 26: paragraphs 0–40 (41 pairs)
- Chapter 27: paragraphs 0–29 (30 pairs)
- Chapter 28: paragraphs 0–81 (82 pairs)

Paragraph counts and order match the source in every chapter. Nothing was sampled.

## Proposals
The proposals file is `frank-p4-proposals.json`. It holds **140 proposals, 60 of them blocking**.

A script checked every `old` string. Each one occurs exactly once in its paragraph, and the edits still match when applied in order.

| Category | Count | What it covers |
|---|---|---|
| Epithet | 41 | The main defect in this part. The candidate often replaces the narrators' words for the Creature with the neutral "the creature". This happens with "fiend" (22,12; 23,12; 24,19; 24,22; 25,48 ×2; 26,18; 26,28; 26,32; 27,8; 27,12; 28,8; 28,17 ×2; 28,18), "dæmon" (23,12; 24,1; 24,2; 24,18; 24,22; 28,10; 28,11; 28,21; 28,25; 28,72), "wretch" (24,3; 24,7; 26,3) and "monster" (25,10; 28,29; 28,70). Following the candidate's own convention, I render "dæmon" as "demon". Swaps from "fiend" or "dæmon" to "monster", which is not neutral, are marked non-blocking. In 28,13 the change also loses the present tense and the Creature's direct address ("I doom you, miserable fiend"). In 27,15 it also loses the repeated "Cursed, cursed". |
| Omission | 51 | Blocking ones: Clerval's Fairyland feeling and most of his Lake Lucerne/Uri speech, including the green islands, the waterspout and the legend of the priest and his mistress (22,17). Falkland, Goring, the queen and son, and "Parliament and liberty" (23,6). The Servox/Chamounix collections, which set up Henry saying the name (23,9). "He entreated me to write often" (23,15). The northeast-wind sentence (24,24). The companions' angry faces (24,30). The nurse's "bad qualities of that class" (25,13). "In executing the award of justice, I shall also sink to rest" (25,42). "The monstrous image … mockery of a soul still more monstrous" (25,46). Elizabeth's "disinterested affection … obstacle to your wishes" sentence (26,14). The dæmon "employing every art" on the wedding night (26,18). The land search parties (27,10). The tears and the fish Elizabeth had watched (27,13). The request for a boat (28,24). Walton's "could I, in justice, refuse this demand?" (28,46). Also the ability to hide his harrowing feelings (22,8). The rest are smaller losses of detail or hedges. |
| Meaning | 37 | Blocking ones: "the period of your power is arrived" was turned into "Your power has reached its end" (24,11). "Unplastered" became "bare plaster" (23,18). "Their truth in part relieved" became "their partial truth" (26,3). "Unmingled with disbelief" became "not quite disbelief" (27,21). "Languor" (limpness) became "stiffness" (27,8). "Bridal bier" became "bridal bed" (27,7). "Vulture" became "hawk" (27,1). "Hare" became "rabbit" (28,12). "Perhaps" was dropped from "at the price, perhaps, of…" (24,1). Non-blocking ones include tense shifts (23,7; 28,13), "your parents" becoming "our parents" (26,13), "unfortunate" becoming "innocent" (26,23), and "the breeze blows fairly" becoming "gently" (28,65). |
| Addition | 5 | "Two miles south" (25,1), a "supposed" murderer (25,19), the angel's "sword" (26,19), "seemed to" hover (28,18), and "I admit my motives were base" (28,60). |
| Aloud | 2 | The inscription's broken quotation marks (28,12) and "Nightmares … a kind of nightmare" (25,48). A third problem, "speed up my negligence" (23,12), is fixed inside an epithet proposal. |
| Reference | 1 | "Tartary" had been replaced by "Central Asia". The proposal restores the source name with a brief gloss (28,9). |
| Other | 3 | Restore the diacritics in Mont Salêve and Montalègre (26,35), keep the recurring "sea of ice" (27,23), and keep the repetition in "never, never" (28,34). |

## Considered and rejected
- **Place names.** The candidate modernizes Strasbourg, Chamonix and Le Havre (from Havre-de-Grace) consistently across the whole book. I treated that as a book-level convention and did not flag it. Tartary is different: it is a different name, not a respelling.
- **The Wordsworth verse (22,19).** It is left in its original wording, with "Unborrow'd". It is readable, a recognizable quotation, and its only change was dropping the lead dash. I left it alone.
- **Places where the source says only "he", "object" or "being" and the candidate adds "the creature"** (22,10; 23,21; 28,67; 28,75). This is clarification rather than replacing a charged word, so I accepted it.
- **The Creature's speech** (28,69–80). Modernizing "thee" and "thou" and using contractions is allowed. I found no formalization. I kept "freak of nature" for "abortion".
- **"But death was no evil to me if the loss of Elizabeth were balanced with it" (26,28).** The source is itself ambiguous, so I did not rewrite the candidate's version.
- **Smaller changes left as acceptable modernization:** "the furies" rendered as "frenzy" (28,5), "chamois" as "mountain goat" (27,24), "a little cold and danger" (28,47, where it fits the sarcasm), "apothecary" as "doctor" (25,5), and "sanguinary passions" compressed to "at the monster's mercy" (24,24).
- **Many shorter paragraphs flagged by the screening tool** (for example 22,1; 22,5; 25,9; 26,20; 28,14). I checked each one and found natural compression with no lost content.
