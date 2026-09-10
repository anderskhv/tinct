# Discourse on the Origin of Inequality: complete recognition package

Manually authored and source-reviewed for the full local dedication, preface and both parts in original-en and modern-en: four reading units, 170 paragraphs, 45 cards per edition. Original has 68 exact mentions; modern has 69. All cards are Reference, with one short recognition snapshot and no duplicated subtitle. These are cited people and examples in a philosophical discourse, not invented protagonists.

Read cards.md for copy and categories together. No source text or app code is changed.

## Reviewed identities

- Plinys in the preface refers to Pliny the Elder as an example of a natural historian. Pliny speaking to Trajan in 4:42 is Pliny the Younger. Both editions preserve this distinction.
- Alexander of Pheros/Pherae is the Thessalian tyrant, not Alexander the Great. Glaucus is the sea god, not Plato’s conversational partner or a craftsman. Cato is the younger Roman republican; Celsus is the medical writer.
- Isaac Rousseau is supplied as the ordinary identity of the virtuous citizen and father in the dedication. Generic fathers throughout the argument are not bound to him.
- The first man in 2:22 identifies the biblical Adam; generic natural man does not. The imagined judges Plato and Xenocrates remain Reference, not real participants attending Rousseau’s speech.
- The other illustrious/famous philosopher in 3:5 is Montesquieu. The author of The Fable of the Bees in 3:33 is Mandeville. Both are identified from their first implicit reference.
- The satrap remains unnamed. The card for Brasidas says Rousseau attributes the reply to him; it does not silently substitute a different historical speaker or invent the official’s name. Francis Correal is described as the cited travel-account author, without asserting a verified itinerary.
- Ceres and Legislatrix resolve together. The Tarquins are a family reference. Offices such as sultan, hypothetical property founders, institutions, population labels and place names are not given conjectural individual identities.
- Original Puffendorf / modern Pufendorf and Pheros / Pherae retain their actual source bytes. Abbreviated citations to Persius, Juvenal and Lucan are included.

## Source comparison

Local edition paragraphs are authoritative for offsets. Comparison references: [Rousseau’s French discourse](https://www.rousseauonline.ch/Text/discours-sur-l-origine-et-les-fondemens-de-l-inegalite-parmi-les-hommes.php), [Ian Johnston’s translated and annotated discourse](https://web.viu.ca/johnstoi/rousseau/seconddiscourse.htm), and the [University of Chicago Leo Strauss seminar transcript](https://wslamp70.s3.amazonaws.com/leostrauss/s3fs-public/Rousseau%201962_0.pdf) identifying the unnamed illustrious philosopher as Montesquieu. This scope is the complete published local reading text; notes absent from these source editions are not fabricated as source mentions.

## Validation and handoff

Run `python3 books/characters/build_discourse_on_inequality.py --check` and `python3 -m unittest discover -s books/characters -p test_discourse_on_inequality.py`.

Six focused tests check exact UTF-16 spans and fingerprints, saved freshness, both Plinys, implicit first identities, attributed rather than harmonized historical anecdotes, and full reference scope. Both source files byte-match Tinct-reader-title at authoring. This is authoring-agent review, not independent editorial approval. Runtime registration and production verification remain with the existing release owner; register both explicit English pairs and the versioned immutable asset URL, and verify the two Plinys and the implicit Mandeville/Montesquieu examples in production.
