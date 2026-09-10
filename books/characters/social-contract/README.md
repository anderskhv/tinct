# The Social Contract: complete recognition package

Manually authored and source-reviewed across all four books and 48 local reading units, including surviving note text, in original-en and modern-en. Each edition has 491 paragraphs, 96 cards and 178 exact mentions. All categories are Reference: named people, historical families and literary/religious examples in a political treatise. Each card has one short recognition snapshot, no repeated plot summaries and no duplicated subtitle. Read cards.md for the complete category/copy review.

## Distinctions

- Three Catos: in 4:14, the first Cato is Marcus Porcius Cato Licinianus, the son serving under Popilius. The next two are Cato the Elder. The Cato in 47:40 is Cato the Younger, the republican opponent of Caesar. The adjective “younger” in the first anecdote does not justify merging the son with the later famous statesman. Compare [Cicero, De Officiis I.36–37](https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A2007.01.0048%3Abook%3D1).
- Cæsar Borgia is Cesare Borgia. Later Cæsar and Julius Cæsar are Julius Caesar; longest exact spans prevent a nested Caesar match inside Borgia’s name.
- Younger Dionysius, his father Dionysius the Elder and the grandfather referred to in the reply at 27:10 are distinct. The grandfather is not given a conjectural name.
- The child of Ishmael at 16:10 is Muhammad, identified from the first implicit reference. Ishmael himself has a separate span. Noah, his sons, Saturn and Saturn’s children likewise remain separate; biblical “king” and “emperor” labels are described as part of Rousseau’s argument, not asserted historical offices.
- Greek Zeus, Roman Jupiter, Saturn, Chronos, Moloch and Baal remain distinct. The paragraph explicitly argues against conflating national gods. Chamos/Chemosh is not replaced with another deity to harmonize the biblical quotation.
- The Sabine Appius Claudius is the early migrant and ancestor, not a later decemvir. Agis is Agis IV, Cleomenes is Cleomenes III, Peter is Peter the Great, William is William III, and Henry IV is the French king. Pliny here is the Elder, unlike the Pliny addressing Trajan in the Inequality package.
- The Count Palatine retains the identifying role visible in the local text. Generic rulers, princes, sultans, offices and assemblies are not assigned speculative personal names. The Tarquins, Medici and Gracchi are historical family references, not arbitrary casts of separately invented members.
- M. d’Alembert and d’Argenson support both straight and curly apostrophes. Livy and Miltiades need bindings beside source italic underscores. Rousseau’s name occurs in editorial quotation notes; no global first-person binding is used.
- Hiero, the Prince, the Institute and other work titles are not given separate fictional roles merely because their titles could name a person. Livy and Miltiades are identifiable explicit historical references in cited titles.

## Inherited incomplete notes — release review required

Both source editions have footnote paragraphs that begin partway through a sentence. Examples include 4:14 (“than any other nation…”), 16:12–14, 25:8 (“Lorraine…”), 27:16–17, 31:15 and 47:38–41. The opening of the Calvin note at 16:13 is missing, leaving “extent of his genius…” and “this great man.” The card identifies Calvin from that surviving phrase, verified against the complete Cole text. The missing start of 25:8 contained the fuller Count Palatine identification. Nothing is inserted into the source or assigned an invented offset.

Primary comparison: [Cole’s Social Contract and Discourses](https://www.gutenberg.org/files/46333/46333-h/46333-h.htm); [Oxford-hosted Social Contract](https://www.some.ox.ac.uk/wp-content/uploads/2022/08/Rousseau_Social-Contract.pdf); and [Rousseau’s French text](https://www.rousseauonline.ch/Text/du-contrat-social-ou-principes-du-droit-politique.php). The local source bytes remain authoritative for bindings. This package covers the entire current published reading text, not a silently reconstructed edition. The release owner should review these inherited source gaps before enablement; any repair requires regeneration against the new fingerprints.

## Validation and handoff

Run `python3 books/characters/build_social_contract.py --check` and `python3 -m unittest discover -s books/characters -p test_social_contract.py`.

Eight focused tests cover exact UTF-16 spans and source fingerprints, freshness, all three Catos, Borgia/Caesar, Dionysius’s family, implicit and italicized references, separate gods and full scope. Both source files byte-match Tinct-reader-title at authoring. This is authoring-agent review, not independent editorial approval. No runtime registration or production deployment is claimed. Integrate both explicit English pairs with versioned asset URLs after source review, verify the namesake examples in production, and return live evidence to update status.
