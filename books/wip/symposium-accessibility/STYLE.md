# Style guide and glossary: Symposium Modern English accessibility pass

This guide governs every paragraph changed by this pass. Reviewers check the candidate against it. Paragraphs that are already clear and faithful are kept as they are, even when they sound old-fashioned in places.

## 1. Aim

A first-time reader, or a listener hearing the text read aloud, should understand each sentence on first hearing. That includes:

- who is speaking and to whom;
- what is being claimed;
- how each step of an argument follows from the one before.

At the same time, nothing Plato's speakers say may be lost, strengthened, softened or moralized.

- **Source:** the corrected original-en (Jowett), sha256 `3521a12d…95a6`.
- **Baseline:** the accepted corrected modern-en, sha256 `1e970b7b…374f`.
- **Structure:** 226 paragraphs, the same chapter boundaries and titles, and the same order. Paragraph *n* of the candidate renders paragraph *n* of the source.

## 1a. Source policy: Jowett is the text (added after review, 2026-09-25)

The rendering follows **Jowett**. This applies `books/CLAUDE.md` ("do not silently mix their readings; document substantive source variants"), and it was prompted by Reviews 1A and 1B.

- **No Greek-based departures.** Plato's Greek and other translations are not used to change Jowett's meaning, qualifiers, ages, relationships, connectives or emphasis. Where v1 had followed the Greek instead of Jowett, the change was reverted. Examples: "at least" and "boys" in 5.3, "welcome" in 5.4, "conceived" in 7.48, "my dear Agathon" in 7.44 (`reviews/RESOLUTION.md`).
- **A Jowett softening stays in Jowett's words.** Examples: "true love" in 7.64 and "hearing him tell what he knew" in 8.26. It is not "corrected" from the Greek.
- **What is not a source variant:** modernizing a Jowett word whose Victorian sense is plain from his own text. Examples: "want" as lack; "bully", which in Jowett's usage means an insolent, overbearing person; "ingenuous". Nor is a §5 gloss that identifies what Jowett's words refer to.
- **Documented exceptions.** Where Jowett's pronoun is genuinely ambiguous and the speech's own argument fixes the referent, the referent is named, and the exception is listed in `CHANGES.md`. The only case is 4.1, "under Love's rule": Jowett's "his dominion" follows a sentence about Asclepius, but Eryximachus's thesis (4.0) is Love's rule over all things.

## 2. What is preserved

- **Every argument, example, qualification, image and proper name.** Qualifiers stay: "I think", "perhaps", "as they say", "if I am not mistaken", "so to speak", "as far as may be".
- **The speakers' distinct positions and voices.** No speech is presented as Plato's verdict. Each is one speaker's claim, framed as that speaker frames it.

  | Speaker | Voice to keep |
  |---|---|
  | Phaedrus | Earnest, mythological examples |
  | Pausanias | Legalistic; draws distinctions |
  | Eryximachus | Pedantic physician with technical vocabulary |
  | Aristophanes | Comic, physical and vivid |
  | Agathon | Florid and poetic, fond of balanced, rhyming phrases. His ornament is kept but made intelligible. It is not flattened into plain prose |
  | Socrates | Questioning and ironic |
  | Diotima | Oracular and systematic |
  | Alcibiades | Drunk, rambling, confessional and funny |

- **Historically specific relationships and claims.** Pederastic lover/beloved relations, ages ("youths", "boys", "beardless"), sexual pursuit, slavery ("servant", "attendant", "boy" as an address to a slave), and the speakers' views of women and of other peoples all stay as the source states them. There is no euphemism, no sanitizing, and no added modern judgment.
- **Verse quotations.** The verse-line paragraphs 1.16, 1.18, 1.21, 1.23, 1.45, 2.1, 2.3, 6.1, 6.5, 8.11 and 8.34 are kept as they are.

## 3. Quotation and speaker convention

The dialogue has three levels of narration:

- Apollodorus tells the companion;
- Aristodemus's account, which Apollodorus retells;
- the words spoken at the banquet.

These rules keep the levels apart:

1. **Set speeches** (Phaedrus, Pausanias, Eryximachus, Aristophanes, Agathon, Socrates's account of Diotima, Alcibiades's praise of Socrates) are given without enclosing quotation marks. An explicit tag introduces each one, for example "Pausanias began:". This follows the accepted chapter 3 and 7.0.
2. **Conversational exchanges** go in single quotation marks. A quotation inside a quotation uses double marks.
3. **Past conversations reported inside a set speech** (Socrates with Diotima, Alcibiades with Socrates) go in single quotation marks, because the surrounding speech is unquoted.
4. **A speech interrupted by a verse-line paragraph** closes its quotation before the verse. Where the speech resumes, it reopens the quotation. For example, 1.15 → 1.16 (verse) → 1.17.
5. **Speaker tags.** Where the source's "he" or "I" could be read as the wrong person, name the speaker. The main case is Aristodemus's first-person narration inside Apollodorus's retelling (1.14, 1.26, 1.28, 1.32). Nothing else is added.

## 4. Glossary

| Source wording | Rendering | Notes |
|---|---|---|
| Love (the god Eros), with "he" | **Love**, "he" | Capitalized for the god; lowercase for the feeling. Kept as the source distinguishes them |
| lover / beloved; "his love" (meaning the person) | **lover** (the older, pursuing partner) / **beloved** (the younger, pursued one). "His love" becomes **his beloved** where it names the person | The roles are never blurred or swapped. 2.7 states plainly that Patroclus was the lover and Achilles the beloved |
| Heavenly / Common Love and Aphrodite; "vulgar" (for Pandemos) | **Heavenly** and **Common**, capitalized as names | "Vulgar" becomes "common" where it names the Common kind. Where the source means crude or low, "crude" or "base" |
| want (meaning lack); "wanting"; "in want of" | **lack**, **lacking** | Essential to Socrates's argument in 7.x: to desire something is to lack it. "Want" is kept only where it means desire |
| fair, fairer, fairest; "the fair" | **beautiful**, more beautiful, most beautiful; **beautiful people** / **the beautiful** | *Kalos*. "Fair" now suggests justice or pale skin |
| foul | **ugly** / **base** | By context |
| temperance, temperate (a virtue of persons) | **self-control**, self-controlled | *Sophrosyne*. In Eryximachus's physics (seasons, elements) it becomes **moderation** / **balance** |
| God (a particular god) | **the god** / **a god** | Avoids a monotheistic reading. "The gods" where the source means divinity in general |
| Hellas, Hellenes | **Greece**, **Greeks** | |
| Lacedaemon, Lacedaemonians | **Sparta**, **Spartans** | |
| daemon / spirit | **spirit** | Diotima's term, glossed once in 7.x as "a spirit (*daimon*)" |
| Poros or Plenty; Penia or Poverty; Metis or Discretion | **Poros, or Plenty**; **Penia, or Poverty**; **Metis, or Prudence** | "Discretion" now means tact. Prudence keeps Jowett's sense of practical good judgment |
| right opinion | **correct opinion** | Diotima's definition (between wisdom and ignorance) is kept in full |
| encomium, encomiast | **speech of praise** / **to sing his praises** | "Encomium" is kept once, at 7.68, with its meaning clear |
| privy members, parts of generation | **genitals** | Plain terms, as the Greek is plain |
| female companions (Aristophanes's *hetairistriai*) | **women who are attracted to women** | No modern identity labels |
| intercourse (meaning sex) | **sex** | Where "intercourse" means conversation or dealings, it becomes **company** or **dealings** |
| sup, supper, supped | **dine**, dinner, dined | "Supper" is kept where it names the meal |
| ribands | **ribbons** | |
| revellers | **revelers** | |
| hiccough | **hiccups** | As 3.10 |
| Heracleitus, Diomede | **Heraclitus**, **Diomedes** | Standard modern forms. "Diomede" reads as an English name and hides Homer's Diomedes. Other names keep Jowett's forms (Otys, Athene, Kronos, Acusilaus), which are recognizable and are character-card mention texts |
| Myrrhinusian | **of the deme of Myrrhinus** | Matches 1.7 "of the deme of Cydathenaeum" |
| fair (moral sense, of a love or of conduct), foul | **noble**, **base** | Added after Review 1A. "Fair" describing people, bodies or things stays **beautiful** |
| Heavenly / Common (capitals) | Capitalized only when **naming**: the Heavenly Aphrodite, the Common Aphrodite, Common Love | Lowercase when descriptive ("the heavenly love", "the common love", 4.3). 3.0 aligned with 3.1 ("the Heavenly Aphrodite") |
| Love / love | As Jowett capitalizes | Jowett's capital is kept even where the sense may be the feeling, e.g. 6.4 "the Love of the beautiful" (Review 1B) |
| the God of War | **the God of War** | Kept as Jowett's title for Ares |
| beloved (as an address: "beloved Agathon") | **my beloved Agathon** | Kept: a charged address in a dialogue about love (7.44, Review 1B) |

## 5. Explanations

Unfamiliar references get the smallest gloss that makes the sentence work, placed where the reader needs it:

- as an appositive ("Olympus, Marsyas's pupil");
- as a plain-English version of the image ("like a token broken in half, each half matching the other");
- as a phrase attached to a quotation ("as Homer says of Odysseus").

The gloss never becomes a speaker's opinion. No footnotes and no bracketed editorial notes.

## 6. House style

- American spelling.
- Straight quotation marks: `'` for dialogue, `"` nested.
- Spaced em-dashes ` — `, the only non-ASCII character used.
- One paragraph for every source paragraph. No paragraph is added, removed, merged or split.
- **Contractions:**
  - natural in conversation, including remembered dialogue inside a set speech (Socrates and Diotima), and in Alcibiades's drunken speech;
  - avoided in the other set speeches, which keep a fuller register;
  - the accepted wording of 3.0 and 3.4 is left as it was.
