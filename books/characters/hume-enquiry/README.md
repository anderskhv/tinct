# An Enquiry Concerning Human Understanding: complete recognition package

Manually authored and source-reviewed across all twelve sections, stored as nineteen reading units, and their notes in original-en and modern-en. 89 cards and 199 exact mentions in each edition; 318 paragraphs per edition. The source files are unchanged and byte-match the Tinct-reader-title release checkout at authoring.

Read cards.md for category and copy together. Most entries are Reference: this is a philosophical enquiry, not a novel with invented protagonists. The two speakers in Section XI’s staged conversation are Supporting. No recurring chapter recaps or duplicated subtitles; each entry has one recognition snapshot. Ordinary names, professions and relationships are available on the first bound encounter.

## Reviewed distinctions

- Alexander in 11:7 and 15:11 is the Macedonian conqueror. Alexander in 15:8–9 is the false prophet described by Lucian. The two are separate entries.
- Latin Catonem in 7:8 is Cato the Elder; Cato in 14:8 and Catonis in its source note refer to Cato the Younger. The italic-ending underscore needs an explicit binding. Scipionem and Laelium retain separate Roman identities. Cicero in the italicized citation is the author, not a staged speaker in Hume’s dialogue.
- Hume’s skeptical friend is bound only in reading unit 16. The first-person author is bound only outside the friend’s imagined Epicurean speech. Epicurus remains a Reference; this is not a transcript of a historical speech by him. Generic friends in other examples are not the interlocutor.
- Abbé Pâris is distinct from Paris the city. The original has Abbe_ Paris across an italic marker; modern English has Abbé Paris. Both resolve to the deacon. His title is not treated as an assertion of priestly ordination.
- The blind man, lame man, Saragossa doorkeeper, Mademoiselle le Franc, Mademoiselle Thibaut, Châtillon’s servant and Pascal’s niece remain distinct. Reported cures are attributed, not asserted as established miracles. The queen-regent’s physician is not merged with De Sylva.
- Marguerite Périer’s ordinary identity as Pascal’s niece is supplied at “niece.” No conjectural full name is supplied for the unnamed bishop, archbishop’s successor or other historical titles.
- Elizabeth I is explicitly the subject of an imaginary resurrection example. No false death date, resurrection or completed succession is turned into a snapshot.
- Original Amaud / modern Arnauld identify Antoine Arnauld. Original De Sylva / modern De Silva, Heraut / Hérault, Due de Chatillon / Duc de Châtillon, Mahomet / Mohammed and Des Cartes / Descartes are reviewed edition variants. The original source spellings are unchanged.
- Causal God references remain separate from Jesus, the Holy Spirit, Serapis, Jupiter and the Devil. Ordinary uppercase “Being” is not a global divine alias.
- School-name adjectives, nations, philosophical concepts, Curia Hostilia, Charing Cross and other places are not made into people. Generic thought-experiment subjects do not receive invented personal identities.

## Source review

Primary comparison: [Hume Texts Online, Of Miracles](https://davidhume.org/texts/e/10). Local bytes remain authoritative for offsets and spelling. Hume’s inherited last heading reads “Part 0”; this is documented and not repaired in this content-only package. It does not affect person bindings.

The Latin quotation’s setting and Roman references were checked against [Cicero, De Finibus V, Loeb text](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cicero/de_Finibus/5%2A.html). The later proverbial Cato is the younger statesman in [Plutarch’s Life of Cato the Younger](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Cato_Minor%2A.html). Pascal’s niece was checked against the [University of Rouen Port-Royal project](https://port-royal.univ-rouen.fr/le-mirace-de-la-sainte-epine-24-mars-1656/).

## Validation and handoff

Run `python3 books/characters/build_hume_enquiry.py --check` and `python3 -m unittest discover -s books/characters -p test_hume_enquiry.py`.

Seven focused tests check saved freshness, exact UTF-16 spans and source hashes, both Alexanders and Catos, the staged dialogue, Paris versus Pâris, separate cure subjects, and hypothetical versus actual history. Source review is by the authoring agent, not independent editorial approval. No app registration, deployment or production verification is claimed here. The release owner should register both explicit edition pairs and versioned asset URLs, verify the namesake examples in production and report live evidence.
