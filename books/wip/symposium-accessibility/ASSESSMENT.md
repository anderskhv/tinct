# Assessment: what still blocked a first-time reader

This is the assessment made before rendering. It covers the accepted completeness candidate for modern-en:

- **File:** `books/wip/symposium-completeness-repair/candidate/symposium-modern-en.json`
- **sha256:** `1e970b7b…374f`
- **Commit:** `bebe95b4`

The source is the corrected original-en (Jowett), `3521a12d…95a6`. `assessment/paragraph-assessment.tsv` records the decision for each paragraph and its outcome.

## Method

1. **Read the whole candidate** paragraph by paragraph, beside Jowett. The reading concentrated on chapters 2 and 4–7, as assigned. Chapters 1, 3 and 8 were read in full too.
2. **Scanned for markers**, across all 226 paragraphs:
   - archaic words;
   - false friends (words whose modern meaning misleads);
   - sentences over 45 words;
   - quotation-mark defects.

   The scan found only 47 archaic tokens in the whole book, among them *wherefore* ×5, *nay* ×5, *ribands* ×5, *supped* ×3, *bade* ×3 and *thou* ×3. It found 71 paragraphs with at least one sentence over 45 words. **The main problem was syntax and vocabulary that still reads as Jowett's, not old spellings.**
3. **Measured similarity** to the source for each paragraph, with the repository's metric (the word-token ratio used by `books/classify-modern-en.py`). This showed which chapters had never been re-rendered. Similarity was used only to find paragraphs to read. It was never treated as a defect in itself.
4. **Made a decision for each paragraph:**
   - RETAIN: already clear and faithful;
   - TARGETED: local repairs;
   - RENDER: a fresh sentence-by-sentence rendering from Jowett.

## Baseline profile (before)

| Ch | Title | Paragraphs | Chapter similarity | Paragraphs ≥ 0.85 | Assessment |
|---|---|---|---|---|---|
| 1 | The Gathering | 49 | 0.742 | 17 | The restored opening (1.0–1.8) and 1.9–1.11 are already modern. From 1.12, Jowett's wording largely remains, with speaker confusion in Aristodemus's narration and a few typographic artefacts |
| 2 | Phaedrus's Speech | 8 | 0.914 | 7 | Near-verbatim Jowett. The lover/beloved roles in 2.7 are hard to follow |
| 3 | Pausanias's Speech | 12 | 0.631 | 0 | Genuinely rendered. A few false friends; exchanges unquoted in 3.10–3.11 |
| 4 | Eryximachus's Speech | 10 | 0.909 | 9 | Near-verbatim; dense technical syntax |
| 5 | Aristophanes's Speech | 18 | 0.937 | 17 | Near-verbatim; Victorian euphemism for sexual content |
| 6 | Agathon's Speech | 13 | 0.950 | 11 | Near-verbatim; ornate syntax obscures the meaning |
| 7 | Socrates & Diotima | 69 | 0.901 | 34 | The questioning of Agathon depends on *want* meaning *lack*. Diotima's teaching is near-verbatim, with inconsistent nested quotation marks |
| 8 | Alcibiades | 47 | 0.915 | 31 | Near-verbatim except the final paragraph (8.46) |

## Findings by category

The category codes are used in the ledger and the TSV.

### ARC: archaic words and idioms

*nay*, *wherefore*, *bade*/*bidden*, *supped*, *ribands*, *potations*, *carouse*, *encomiast*, *descanted*, *fain*, *marvel not*, *see you not*, *O thou stranger woman, thou sayest well*, *have well drunken*, *Please to see to this*, *in a great strait*.

### FF: false friends, whose modern meaning misleads

- **want** (= lack). Socrates's argument in 7.14–7.42 turns on it: "Love wants and has not beauty". Diotima uses it too (7.46, 7.49, 7.55).
- **fair** (= beautiful), **foul** (= ugly).
- **temperance** (= self-control).
- **God** (a god, or the gods): suggests monotheism.
- **vulgar** (= common, the Common Love).
- **mean** (= base, or a middle point).
- **generous friendship** (= noble).
- **disinterested** (commonly misread as uninterested).
- **ingenuous youth** (now means naive).
- **profane** (= uninitiated).
- **bully** (Greek *hybristes*: insolent).
- **messed together** (= ate in the same mess).
- **by the way** (= on the way).
- **symphony** (= consonance).
- **sciences** (= branches of knowledge).
- **beautiful forms** in the ascent. These are bodies, but readers may take them for Platonic Forms, the ascent's goal.
- **plotting against the fair and good** (= scheming to win them).
- **beloved Agathon**: the book's technical term used as an endearment.

### SYN: archaic or periodic syntax

Inverted and suspended sentences run through chapters 4–6 and 8. Examples:

- "which accordance, as in the former instance, medicine, so in all these other cases, music implants" (4.2);
- "he suffers not by force if he suffers" (6.3);
- "he only of them whom love inspires has the light of fame" (6.4).

Some sentences were fragments: 7.0 ended with "But to answer as you would if I asked…".

### REF: unclear speaker, pronoun or chain of argument

- **Aristodemus's first person.** Apollodorus retells Aristodemus, and Jowett slips into Aristodemus's "I" (1.14, 1.26), so a first-time reader takes the "I" for Apollodorus.
- **Ambiguous "he".** "He said" in 1.28, 3.10 and 6.11 can be read as the wrong person.
- **Pronouns for Old Age and Love** (6.0).
- **The questioning of Agathon** loses its logic wherever *want* is read as *desire*.

### IMG: allusions and images unintelligible without a word of help

- the proverb joke on Agathon's name (1.17);
- Melanippe (1.44);
- Generation (2.2);
- Heraclitus's bow and lyre (4.1);
- Urania and Polyhymnia (4.3);
- the indenture, the tallies and basso-relievo (5.3, 5.6);
- the Gorgias/Gorgon pun (6.9);
- Codrus (7.58);
- Lycurgus's "children" (7.60);
- Corybantian (8.24);
- the palaestra (8.27);
- Diomede's gold for brass (8.29);
- the Satyric or Silenic drama (8.39);
- "the couch below me" (8.41).

### DIST: distinctions and qualifications at risk

- lover and beloved (2.4 "lovers and their loves"; 2.7);
- Heavenly and Common love (3.6 "the vulgar lover"; 4.3);
- lack and desire (7.x);
- love and the beloved (7.49 "the principle of love").

### EUPH: Victorian euphemism

- "privy members" and "parts of generation" (genitals);
- "lover's intercourse" (sex);
- "female companions" (women attracted to women).

### TYP: typography

- doubled quotation marks (1.33);
- a stray `',` (1.20);
- missing quotation marks around exchanges (3.10, 3.11);
- inconsistent nesting in 7.45–7.68;
- quotation marks opened or closed in the wrong paragraph when a speech continues (4.0/4.5, 5.0/5.1/5.2, 8.0/8.1);
- a missing comma (8.17).

## Decisions

| Decision | Assessed before rendering | Final, after all reviews | What it means |
|---|---|---|---|
| RETAIN | 75 | 63 | Already clear and faithful, or protected. See the list below |
| TARGETED | 78 | 90 | Local repairs to otherwise acceptable paragraphs: all of chapters 1 and 3, and the short exchanges and the questioning of Agathon |
| RENDER | 73 | 73 | A fresh sentence-by-sentence rendering from Jowett: the bulk of chapters 2 and 4–6, Diotima's teaching (7.45–7.68) and Alcibiades's speech (8.0–8.6, 8.23–8.39) |

**Changed after review.** 12 paragraphs first retained were changed in response to the reviews. Each is a small targeted repair (`CHANGES.md` gives the reason for each):

- 1.15, 1.16, 1.18, 1.21, 1.45, 8.10 and 8.11: the quotation marks of the verse lines and the lines around them, so that the speaker visibly keeps talking (STYLE §3.4). 1.15 also names its speaker, and 8.10 introduces the quotation ("In Homer's words"). The verse wording is unchanged;
- 1.9: a usage error;
- 3.0: two capitals (STYLE §4);
- 3.2: a false friend, and Jowett's connective restored;
- 6.12: the colon-and-dash;
- 7.8: a capital after a colon.

The 63 retained paragraphs are:

- **1.0–1.8:** the restored opening, accepted in C-02.
- **Verse:** 1.23, 2.1, 2.3, 6.1, 6.5 and 8.34. The other five verse lines (1.16, 1.18, 1.21, 1.45 and 8.11) keep their wording exactly; only their quotation marks changed.
- **Short answers:** short answers and one-line exchanges, such as "'Yes.'", "He assented." and "'For shame,' said Socrates."
- **Already modern:** paragraphs that were already modern and clear, including 1.10–1.11, 3.4, 3.9 and 8.46. Among them, 1.29 keeps "boy" as an address to a slave.
- **After verse:** 8.12, which continues a speech after a verse line.

`assessment/paragraph-assessment.tsv` gives the decision and the reason for every paragraph.

Paragraphs the metric rated as near-verbatim were **not** rewritten merely because of that. The short answers in 7.1–7.43, for example, are identical to Jowett and stay so.

## Constraints carried into rendering

All of these are enforced in `STYLE.md` and checked mechanically:

- 226 paragraphs, same order, same chapter boundaries and titles;
- the restored opening byte-identical;
- the three C-06 corrections kept verbatim;
- the verse lines unchanged;
- no summarizing, merging or splitting;
- every argument, qualification, image and name kept.
