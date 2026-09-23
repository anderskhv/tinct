# Frankenstein modern-en, fidelity and listenability review, part 2 (chapters 7–14)

Source: `books/wip/green-frankenstein/source.json`. Candidate: `candidate.json` (read-only, not edited).
Proposals: `frank-p2-proposals.json`. There are 111 entries. Every `old` string was checked with Python to be an exact, unique substring of its paragraph. All 111 were also applied one after another to a copy in memory, and every one applied cleanly.

## What was read

I read every paragraph pair in full, source against candidate, in order. That meant the neighboring paragraphs were read as context too.

| Chapter (reader title) | Paragraphs read |
|---|---|
| 7 ("Chapter 3") | 0–20 (21) |
| 8 ("Chapter 4") | 0–13 (14) |
| 9 ("Chapter 5") | 0–27 (28) |
| 10 ("Chapter 6") | 0–22 (23) |
| 11 ("Chapter 7") | 0–50 (51) |
| 12 ("Chapter 8") | 0–32 (33) |
| 13 ("Chapter 9") | 0–15 (16) |
| 14 ("Chapter 10") | 0–16 (17) |

That is 203 paragraphs, all read in full, with none sampled. Paragraph counts match the source in all eight chapters.

## Findings by category

| Category | Count | Blocking |
|---|---|---|
| meaning | 43 | 9 |
| omission | 39 | 5 |
| epithet | 11 | 6 |
| other (diacritics, names, quotation marks) | 9 | 0 |
| aloud | 5 | 0 |
| reference | 3 | 0 |
| addition | 1 | 0 |
| **Total** | **111** | **20** |

### Blocking items (most important)
- **Content dropped or distorted:**
  - (14,13): the Creature's threat that "thousands of others shall be swallowed up in the whirlwinds of its rage" is missing.
  - (10,21): the clause "he exerted himself to amuse me, while he expressed the sensations that filled his soul" is missing.
  - (13,2): the sentences "not augment their unhappiness" and "a duty owed to yourself" are missing.
  - (7,9): "the Angel of Destruction … omnipotent sway" is missing.
  - (11,9): "accuses herself *unjustly*" loses "unjustly".
- **Meaning changed:**
  - (10,7): the candidate says "constant emotional abuse" caused Madame Moritz's decline. The source says it was her own "perpetual fretting".
  - (8,11): "I *then* thought" became "I *later* thought".
  - (13,8): "Have we lost…" became "Haven't we lost…", which flips the question.
  - (9,18): "strangely turned to bitterness" became "turned suddenly to bewilderment".
  - (7,12): the narrator's comment on his own earlier account was rewritten as a different claim.
  - (11,46): the condition "unless his senses convinced him" is lost.
  - (12,10): "my unhappy victim" was neutralized.
  - (14,11): "joints more supple" became "stronger".
- **Epithets for the Creature neutralized:**
  - 9,2: demoniacal → monstrous
  - 11,28: devil → monster
  - 13,4: fiend → monster
  - 13,5: fiend → creature
  - 14,7: dæmon → creature
  - 14,11: the Creature calls himself a fiend → monster
  - 14,16: fiend → creature
- Non-blocking epithet items: 9,3 (the source switches from "he" to "it became a thing"), 11,31 ("the animal"), 13,9 ("fiend" used as a metaphor) and 14,6 ("diabolically").

### Note that applies to the whole book
The candidate strips diacritics and standardizes place names across the book: Salêve→Saleve, Copêt→Copet, Môle→Mole, Chêne→Chene, Pélissier→Pelissier, Chamounix→Chamonix. I proposed fixes inside chapters 7–14. The same normalization also appears **outside my scope**, at (21,20), (23,9) and (26,35), and whoever owns those chapters should fix it. On "Mole": aloud it sounds like the animal.

## Considered and rejected
- **"M. Krempe/M. Waldman" rendered as "Professor Krempe/Waldman", and "Monsieur" for M.:** this is the candidate's own consistent choice. It is a title, not a name change, so I did not churn it.
- **Coleridge verse (9,7) and Shelley verse (14,3) left archaic ("Doth", "ne'er", "Nought"):** under the protocol these are candidates for modernizing. I did not propose it, because both are quotations from real poems (one attributed in the source), the archaisms are mild, and modernizing would break the rhymes (dread/head/tread, sorrow/morrow). I'm flagging this for the lead to decide book-wide.
- **Dante (9,3), the Vicar of Wakefield (9,10) and Albertus Magnus/Paracelsus/Agrippa:** the context already makes these clear enough. No gloss needed.
- **"the caves of ice, which I only do not fear" (14,13):** the source is ambiguous between "the only things I don't fear" and "only I don't fear them". The candidate's reading is a plausible one, so I left it.
- **The screening tool's "shortened" flags (for example 8,1, 8,2, 10,14, 11,5, 12,5, 13,0 and 14,0):** where these are just compression and nothing is lost, I made no proposal. League to mile conversions (11,26; 12,5) were checked and are accurate.
- **Small register changes:** examples are "uncouth"→"rough", "panegyric"→"tribute", "diligence"→"coach", "cabriolet"→"carriage", "ballots all black"→"all guilty", "narrow beds"→"narrow graves" and "exploded systems"→"discredited theories". Each is faithful enough, so I did not propose changes.
- **(8,0) "not on that account the less valuable" and (11,21) "made me tremble":** these are implied by the surrounding wording, and I judged restoring them to be churn.
- **The mix of "thou" and "you" in the Creature's speech, normalized to "you":** the voice survives and his contractions were kept. This is acceptable under RULES.
