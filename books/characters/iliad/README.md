# The Iliad character package

Both full English editions, all twenty-four books; **750 entries in each**, 7,924
exact mentions in the original and 7,946 in the modern, across 1,137 paragraphs
per edition. No entity is missing from either edition. Content revision
2026-09-11.1. Authoring-agent review, not independent editorial approval.
Validated content, awaiting runtime integration.

This is the largest package in the library. The Iliad names more people than any
other book Tinct carries, and it gives the same name to different men more often
than any other book too.

Achilles and Hector are Central. Agamemnon, Patroclus, Priam, Menelaus, Helen,
Paris, Odysseus, Diomed, Nestor, both Ajaxes, Aeneas, Sarpedon, Idomeneus,
Meriones, Antilochus, Teucer, Briseis, Andromache, Thetis, Zeus, Hera, Athena,
Apollo, Poseidon, Ares and the river Scamander are Major. The rest of the
fighting cast is Supporting; genealogy, myth and the men named once in a
catalogue or a simile are Reference.

## The Roman / Greek divergence

Butler's original uses the Roman names and the modern edition restores the Greek:

| original | modern | original | modern |
|---|---|---|---|
| Jove (475) | Zeus (478) | Vulcan (40) | Hephaestus (40) |
| Minerva (162) | Athena (162) | Venus (33) | Aphrodite (33) |
| Ulysses (128) | Odysseus (128) | Mercury (20) | Hermes (20) |
| Juno (124) | Hera (124) | Diana (15) | Artemis (15) |
| Mars (116) | Ares (116) | Ceres (4) | Demeter (4) |
| Neptune (66) | Poseidon (66) | Saturn | Cronus / Cronos |
| Hercules | Heracles | Proserpine | Persephone |

Plus transliteration pairs: Ilithuia/Eileithyia, Rhaea/Rhea, Cicons/Cicones,
Pelasgi/Pelasgians, Lelegae/Leleges, Lapithae/Lapiths, Pleiads/Pleiades,
Hyads/Hyades, Aesculapius/Asclepius, Hiketaon/Hicetaon, Gerene/Gerenia,
Chimaera/Chimera, Eueneus/Euneus, Bacchus/Dionysus, Rumour/Rumor,
Diomed/Diomedes, Danae/Danaë. Every pair is two aliases on one entity, so one
card serves both editions.

## Editorial checks

**1. Namesakes.** This is the work of the package. Forty-two names belong to more
than one person, animal or thing; each is resolved by paragraph — and, where two
men of the name stand in the same paragraph, by occurrence index — from the text
itself.

**Ajax is the hard one.** The name occurs 175 times. Only 38 are marked "son of
Telamon" and 10 "son of Oileus"; 32 are the plural Ajaxes, and the remaining 95
are bare. Every one was read in context. The result: **157 Telamon, 18 Oileus,
32 the pair**, and the two editions agree on every single slot. The Locrian is
meant at 12:16 (second occurrence), 13:7, 13:46 (second), 13:47 (first), 14:35,
14:40 (second), 15:26, 16:19, and through the chariot-race quarrel with
Idomeneus and the foot race in book 23. The duel with Hector in book 7, the
defence of the ships in books 11 and 15, the fight over Patroclus in book 17,
and the wrestling and armed combat at the games are all Telamon's son. Two of the
bare ones are Oilean only because the text calls Medon "brother of Ajax" while
naming Oileus in the same breath (13:46, 15:26).

Other families, with the count of distinct men:

| Name | Men | How they are told apart |
|---|---:|---|
| Chromius | 5 | Pylian chief (4:23); son of Priam (5:16); Lycian (5:52); killed by Teucer (8:24); Aeneas's companion (book 17) |
| Polybus, Alastor, Thoon | 4 each | Alastor: Pylian chief, Lycian, Greek squire, Tros's father. Thoon: son of Phaenops, killed by Odysseus, in Asius's company, killed by Antilochus |
| Xanthus | 4 | A son of Phaenops (5:15); one of Hector's four horses (8:17); one of Achilles' immortal pair (16:7, book 19); and the river god the gods call Xanthus and men Scamander. The Lycian river of the name is geography and is not cast |
| Melanippus, Mecisteus, Echius, Orestes, Bias, Haemon, Pisander, Epistrophus, Ormenus, Thestor, Actor | 3 each | by paragraph; see the tables in `build_iliad.py` |
| Acamas, Antiphus, Adrestus, Amphimachus, Eurypylus, Helenus, Lycaon, Medon, Schedius, Iphitus, Tlepolemus, Hypsenor, Hippasus, Apisaon, Polyidus, Eetion, Idaeus, Astynous, Phaenops, Orsilochus, Opheltius, Pedasus, Amphius, Periphas, Noemon, Mydon, Otus, Oenomaus, Autonous, Dolops, Agelaus, Pylartes, Mulius, Periphetes, Erymas, Laogonus, Echeclus, Deucalion, Areithous, Oeneus, Hippolochus, Laodice, Laodocus, Caletor, Clytius, Lampus, Dardanus, Tros, Sthenelus, Paeon, Phorbas, Menesthius, Borus, Anchises, Echepolus, Scamandrius | 2 each | by paragraph |

**Nothing was resolved by guessing.** Where a paragraph names a man the text
never distinguishes, the table names the man the surrounding scene identifies,
and the tables are printed in full in the builder so a reviewer can check every
one against the source.

**2. Person or not.** Places, mountains, islands, rivers as geography, ships and
the adjectival forms of place names are excluded — Troy, Ilius/Ilium, Olympus,
Argos, Ida, Lycia, Phthia, Crete, Thebes, Lemnos, Simois, the Lycian Xanthus.
A river that speaks or fights is included as a person: Scamander, who rises
against Achilles, and Spercheius and Axius, named as fathers. Nine horses are
cast as animals: Achilles' immortal Xanthus and Balius and the mortal Pedasus,
Hector's Xanthus, Podargus, Aethon and Lampus, Agamemnon's mare Aethe, and
Adrastus's Arion.

**3. Mythological and genealogical references.** The Trojan royal line from
Dardanus down, Glaucus's Bellerophon story, Phoenix's Meleager story, Nestor's
recollections, Dione's list of gods wounded by men, and the thirty-three Nereids
who gather round Thetis in book 18 are all covered figure by figure.

**4. Ambiguous references, and what is deliberately unbound.** In Phoenix's
parable at 9:23 the Prayers and Sin are personified but spelled in lower case
throughout; they are **not** bound, because binding them would mean binding the
common nouns "prayers" and "sin" wherever they appear. That decision is recorded
here rather than hidden. Epithets that stand for a god without naming him —
"the slayer of Argus", "the Trito-born", "lord of the earthquake" — are bound
only where the god's name itself is in the span; Argus, the watcher Hermes
killed, has his own reference card because his name is the one printed.

**5. Spot-read.** Twelve mentions were drawn at random from each edition and read
in context; all twenty-four bound the right person.

**6. Both editions independently.** Zero omissions on either side. The mention
counts differ by 22 (7,924 against 7,946) only because the modern edition writes
a name where the original writes a pronoun or an epithet in a handful of places.

## Source defects, recorded not repaired

| Defect | Effect |
|---|---|
| `original-en` writes **Zeus** once, at 16:51, in a text that otherwise says Jove throughout | Both forms are aliases of one entity; the slip binds correctly |
| `original-en` writes **Jupiter** once and **Alexandria** once (for Alexandrus, in the book 3 argument) | Both bound to the right figure as aliases |
| `original-en` writes **Fandarus** for Pandarus once | Recorded; the misprint is left unbound rather than repaired, because binding a misspelling would imply the text is corrected |
| Alcimedon's father is **Laerceus** at 16:10 and **Laerces** at 17:29 in both editions | One entity, both spellings as aliases |
| Pylaemenes is spelled **Pylaemanes** at his first appearance in the original | One entity, both spellings as aliases |
| The Ajax tables depend on paragraph alignment between the editions | Verified: both editions place all 175 occurrences in the same paragraphs, and the test asserts the two editions agree on every slot |

No edition file was changed. Any repair to these bytes invalidates the recorded
fingerprints and requires a restored-text review and a rebuild.

## Validation

`python3 books/characters/build_iliad.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Twelve focused
tests for this book. Compiler assembly in `build_reviewed.py` is shared and
deterministic; all identity prose and every namesake table is manually authored.
No edition changes, no network generation.

## Integration

Compare both fingerprints against the shipping checkout, register both English
editions, publish the versioned sidecar, and verify in production: Zeus and Jove
serving one card; the two Ajaxes at 7:18 (Telamon, the duel) against 23:55
(Oileus, the foot race); the four things called Xanthus; the five men called
Chromius; and that no card appears on Troy, Ida or the Lycian Xanthus.
