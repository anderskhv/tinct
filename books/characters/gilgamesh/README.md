# Gilgamesh recognition cards

Twelve tablets, 253 paragraphs per local English edition. Seventy authored entries; 70 original / 69 modern, with 911 / 851 exact mentions. Authoring-agent review, not independent editorial approval. No source changes or runtime registration.

Gilgamesh and Enkidu are Central; Shamash, Humbaba, Ishtar and Utnapishtim are Major. Recurring divine actors and human helpers are Supporting. Cited lovers, genealogical names and funeral invocations are Reference. Categories reflect the whole epic, not first-tablet prominence.

Ordinary identity appears immediately: Ninsun is Gilgamesh's mother; Lugalbanda his divine father; Urshanabi the ferryman; Utnapishtim the immortal ancestor (the mystery is how he obtained immortality, not a concealed identity). Enkidu initially remains the wild man created to match Gilgamesh. His recognition card changes to closest friend only after the friendship is formed at the end of tablet 2, zero-based paragraph 15. No death, monster defeat, plant theft or Flood outcome is added as a running reminder.

## Identity and source review

- Ea, Enki and Nudimmud share an identity. Bel in 1:16 is Enlil; modern prints Enlil. Sin and Namra-sit share an identity. Irkalla is explicitly a goddess in 7:10, hence Ereshkigal here rather than a place match.
- Dumuzi-abzu is distinct from Ishtar's husband. Longest spans prevent the shorter Dumuzi alias from taking ownership.
- Atra-hasis in the local original's Flood account names Utnapishtim; modern substitutes first-person narration and Utnapishtim. No extra unrelated hero is invented.
- Original Imini / modern Irnini refer to the sanctuary name in 5:0. The original spelling appears corrupt. The interpretation of Irnini is disputed, including a reading as plural goddesses. The card states only this translation's divine name, and does not force an identification with Ishtar. Irnina in Ninsun's prayer is also kept separately, without assuming these names are interchangeable.
- Both editions print **mother Ninazu** in 12:2–3, an apparent omission of *of*. Ninazu is a male underworld deity, a son of Ereshkigal in this tradition. Only the name is bound to Ninazu; the entire faulty mother phrase is not bound as if Ninazu were a mother goddess. This source defect remains unresolved and should be considered during integration.
- Modern substitutes Disease for Asakku. The named demon is therefore omitted from modern, rather than binding an ordinary disease word to a named entity.
- The scorpion-man, his wife and the collective guards remain distinct selectable identities. The carpenter's family in tablet 12 are figuratively mother/sister to Gilgamesh, not his actual family. The Flood ship's unnamed carpenter is not assigned to the later carpenter.
- The allallu-bird of Ishtar's former lovers is distinct from the Thunderbird of dreams. Individual lovers are recognized without replaying their transformations. The unnamed dream attacker and Ereshkigal's scribe are not given speculative names.
- Mount Niir, Mashu, Hades, Apsu and temple names are places, not cast entries. Generic dead people in the final question-and-answer catalogue are examples rather than invented named characters.

Editorial cross-checks: [ORACC Ereshkigal](https://oracc.museum.upenn.edu/amgg/listofdeities/erekigal/), [ORACC Ninazu](https://oracc.museum.upenn.edu/amgg/Listofdeities/Ninazu/index.html), [Andrew George's translation and glossary](https://cosmos.art/content/media/pages/library/the-epic-of-gilgamesh/89e2bab851-1598904500/gilgamesh.pdf), and [scholarly discussion of the Irnini reading](https://researchspace.bathspa.ac.uk/17132/1/17132.pdf). Local editions remain the authority for selectable wording and narrative sequence.

## Validation and handoff

Run `python3 books/characters/build_gilgamesh.py --check` and the character test suite. Tests cover source hashes, exact UTF-16 spans and unique resolution, the friendship boundary, aliases, distinct Dumuzi entries, unnamed-role scope and edition-specific omission.

Before enablement, review the two inherited wording issues above, compare source bytes again, explicitly register both supported editions, version the immutable asset URL and verify the ordinary mother identity, before/after friendship cards, Dumuzi-abzu and original-only Asakku in production. Keep authorship, validation and live status separate.
