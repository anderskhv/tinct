#!/usr/bin/env python3
"""Add named figures to peloponnesian-war (Crawley). Round 2 flagged this
book as exactly the case a frequency scan can't handle -- a huge cast of
commanders named a few times each -- and it is: built from the spaCy scan
plus a hand-checked list of ~160 expected names counted directly.
Bodies minimal, from first-mention context.

Homonyms, read in full: "Leon" (a Spartan founder of Heraclea, a
treaty signatory, a place near Catana, a Spartan with Antisthenes, and
the Athenian general at Samos -- only the last is bound, by paragraph);
"Hippias" (the Pisistratid tyrant vs. a commander of Arcadian
mercenaries); "Hippocrates" (the Athenian general vs. the tyrant of
Gela); "Callias" (only the Athenian general at Potidaea bound);
"Procles" (the general killed in Aetolia, not the later treaty
signatory); "Aristeus" (the Corinthian of Potidaea, not the naval
commander son of Pellichas nor the man with Brasidas); "Pythodorus"
(the general, not the archon); "Timocrates" (only the Lacedaemonian
commissioner who killed himself); "Euthydemus" (only the general in
Sicily); "Clinias" (two fathers -- skipped). Thucydides himself, general
at Amphipolis and author, gets a card.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity
from add_histories_helpers import add_entity_excluding as add_e

BOOK = 'peloponnesian-war'
P = 'person'

E = [
    ('thucydides', 'Thucydides', "An Athenian, the historian of the war, and one of its generals in Thrace.", 'major', ['Thucydides']),
    ('agis', 'Agis', "King of Sparta, son of Archidamus, who leads the invasions of Attica.", 'major', ['Agis']),
    ('astyochus', 'Astyochus', "Lacedaemonian high admiral with supreme command at sea in Ionia.", 'supporting', ['Astyochus']),
    ('perdiccas', 'Perdiccas', "King of the Macedonians, son of Alexander.", 'supporting', ['Perdiccas']),
    ('alexander-of-macedon', 'Alexander', "King of Macedonia, father of Perdiccas.", 'reference', ['Alexander']),
    ('philip-of-macedon', 'Philip', "Perdiccas's brother and rival for the Macedonian throne.", 'reference', ['Philip']),
    ('amyntas', 'Amyntas', "Philip's son, destined by Sitalces for the Macedonian throne.", 'reference', ['Amyntas']),
    ('derdas', 'Derdas', "In league with Philip against Perdiccas.", 'reference', ['Derdas']),
    ('arrhabaeus', 'Arrhabaeus', "King of the Lyncestians.", 'supporting', ['Arrhabaeus']),
    ('eurymedon', 'Eurymedon', "An Athenian general, son of Thucles; also the river of an earlier victory.", 'supporting', ['Eurymedon']),
    ('sitalces', 'Sitalces', "Son of Teres, King of the Thracians.", 'supporting', ['Sitalces']),
    ('teres', 'Teres', "Father of Sitalces, founder of the Odrysian kingdom.", 'reference', ['Teres']),
    ('seuthes', 'Seuthes', "Successor of Sitalces.", 'reference', ['Seuthes']),
    ('sadocus', 'Sadocus', "Sitalces's son, made an Athenian citizen.", 'reference', ['Sadocus']),
    ('nymphodorus', 'Nymphodorus', "An Abderite, Sitalces's brother-in-law, made proxenus of the Athenians.", 'reference', ['Nymphodorus']),
    ('chalcideus', 'Chalcideus', "Sent by the Lacedaemonians to command the ships for Chios.", 'supporting', ['Chalcideus']),
    ('pisander', 'Pisander', "Sent on embassy to Athens to treat for Alcibiades's return and the abolition of the democracy.", 'supporting', ['Pisander']),
    ('pedaritus', 'Pedaritus', "Son of Leon, sent by the Lacedaemonians to command at Chios.", 'supporting', ['Pedaritus']),
    ('harmodius', 'Harmodius', "With Aristogiton, slayer of Hipparchus.", 'reference', ['Harmodius']),
    ('aristogiton', 'Aristogiton', "With Harmodius, slayer of Hipparchus.", 'reference', ['Aristogiton']),
    ('hipparchus', 'Hipparchus', "Brother of Hippias, slain by Harmodius and Aristogiton.", 'reference', ['Hipparchus']),
    ('pisistratus', 'Pisistratus', "Tyrant of Athens, father of Hippias and Hipparchus.", 'reference', ['Pisistratus']),
    ('alcidas', 'Alcidas', "Lacedaemonian high admiral commanding the expedition to Lesbos.", 'supporting', ['Alcidas']),
    ('laches', 'Laches', "Athenian general, son of Melanopus, sent to Sicily.", 'supporting', ['Laches']),
    ('paches', 'Paches', "Athenian general, son of Epicurus, sent to take command at Mitylene.", 'supporting', ['Paches']),
    ('hagnon', 'Hagnon', "An Athenian general.", 'reference', ['Hagnon']),
    ('clearidas', 'Clearidas', "Son of Cleonymus, placed by Brasidas in Amphipolis.", 'supporting', ['Clearidas']),
    ('pasitelidas', 'Pasitelidas', "Son of Hegesander, placed by Brasidas in Torone.", 'reference', ['Pasitelidas']),
    ('cnemus', 'Cnemus', "A Spartan admiral.", 'supporting', ['Cnemus']),
    ('eurylochus', 'Eurylochus', "A Spartan commanding the force from Heraclea.", 'supporting', ['Eurylochus']),
    ('macarius', 'Macarius', "A Spartan accompanying Eurylochus.", 'reference', ['Macarius']),
    ('menedaius', 'Menedaius', "A Spartan accompanying Eurylochus.", 'reference', ['Menedaius']),
    ('strombichides', 'Strombichides', "Athenian commander, son of Diotimus.", 'supporting', ['Strombichides']),
    ('pharnabazus', 'Pharnabazus', "The Persian satrap on the Hellespont.", 'supporting', ['Pharnabazus']),
    ('darius', 'Darius', "The Persian king.", 'reference', ['Darius']),
    ('artaxerxes', 'Artaxerxes', "The Persian king.", 'reference', ['Artaxerxes']),
    ('xerxes', 'Xerxes', "Whose expedition against Hellas is recalled.", 'reference', ['Xerxes']),
    ('cyrus', 'Cyrus', "The first king of the Persians.", 'reference', ['Cyrus']),
    ('cambyses', 'Cambyses', "Son of Cyrus.", 'reference', ['Cambyses']),
    ('polycrates', 'Polycrates', "Tyrant of Samos, with a powerful navy.", 'reference', ['Polycrates']),
    ('lamachus', 'Lamachus', "An Athenian general.", 'supporting', ['Lamachus']),
    ('pleistoanax', 'Pleistoanax', "King of Sparta, son of Pausanias.", 'supporting', ['Pleistoanax']),
    ('nicostratus', 'Nicostratus', "Athenian general, son of Diitrephes.", 'supporting', ['Nicostratus']),
    ('diitrephes', 'Diitrephes', "Father of Nicostratus; an Athenian commander.", 'reference', ['Diitrephes', 'Diotrephes']),
    ('diomedon', 'Diomedon', "An Athenian commander in Ionia.", 'supporting', ['Diomedon']),
    ('lichas', 'Lichas', "Son of Arcesilaus, a Spartan adviser sent to Astyochus.", 'supporting', ['Lichas']),
    ('thrasybulus', 'Thrasybulus', "Son of Lycus, a galley captain who leads the democrats at Samos.", 'supporting', ['Thrasybulus']),
    ('thrasyllus', 'Thrasyllus', "A heavy-infantry officer who leads the democrats at Samos with Thrasybulus.", 'supporting', ['Thrasyllus']),
    ('endius', 'Endius', "A Lacedaemonian envoy, well disposed to Athens.", 'reference', ['Endius']),
    ('mindarus', 'Mindarus', "Who succeeds Astyochus as admiral.", 'supporting', ['Mindarus']),
    ('ramphias', 'Ramphias', "A Lacedaemonian ambassador who brings the ultimatum.", 'reference', ['Ramphias']),
    ('melesippus', 'Melesippus', "A Lacedaemonian ambassador who brings the ultimatum.", 'reference', ['Melesippus']),
    ('agesander', 'Agesander', "A Lacedaemonian ambassador who brings the ultimatum.", 'reference', ['Agesander']),
    ('alcamenes', 'Alcamenes', "Son of Sthenelaidas, sent to take command in Euboea.", 'reference', ['Alcamenes']),
    ('sthenelaidas', 'Sthenelaidas', "An ephor who speaks for war after Archidamus.", 'supporting', ['Sthenelaidas']),
    ('cimon', 'Cimon', "Son of Miltiades, Athenian commander of an earlier generation.", 'reference', ['Cimon']),
    ('xanthippus', 'Xanthippus', "Father of Pericles.", 'reference', ['Xanthippus']),
    ('ischagoras', 'Ischagoras', "A Lacedaemonian starting overland to join Brasidas.", 'reference', ['Ischagoras']),
    ('aristarchus', 'Aristarchus', "The bitter enemy of the commons among the oligarchs.", 'reference', ['Aristarchus']),
    ('charminus', 'Charminus', "An Athenian commander at Samos.", 'reference', ['Charminus']),
    ('euctemon', 'Euctemon', "An Athenian commander at Samos.", 'reference', ['Euctemon']),
    ('sophocles-general', 'Sophocles', "Athenian general, son of Sostratides.", 'reference', ['Sophocles']),
    ('thrasycles', 'Thrasycles', "An Athenian commander.", 'reference', ['Thrasycles']),
    ('xenares', 'Xenares', "An ephor anxious to break off the treaty.", 'reference', ['Xenares']),
    ('cleobulus', 'Cleobulus', "An ephor anxious to break off the treaty.", 'reference', ['Cleobulus']),
    ('alexicles', 'Alexicles', "A general under the oligarchy.", 'reference', ['Alexicles']),
    ('cylon', 'Cylon', "An Athenian Olympic victor who attempted a tyranny.", 'reference', ['Cylon']),
    ('eurystheus', 'Eurystheus', "Killed in Attica by the Heraclids.", 'reference', ['Eurystheus']),
    ('atreus', 'Atreus', "Eurystheus's mother's brother, who gained the kingship of Mycenae.", 'reference', ['Atreus']),
    ('pelops', 'Pelops', "Who arrived from Asia with vast wealth.", 'reference', ['Pelops']),
    ('agamemnon', 'Agamemnon', "Who raised the armament against Troy.", 'reference', ['Agamemnon']),
    ('minos', 'Minos', "The first known to tradition to have established a navy.", 'reference', ['Minos']),
    ('hellen', 'Hellen', "Son of Deucalion, before whom the name Hellas did not exist.", 'reference', ['Hellen']),
    ('homer', 'Homer', "Cited as evidence on the Trojan war.", 'reference', ['Homer']),
    ('gongylus', 'Gongylus', "An Eretrian placed in charge of Byzantium by Pausanias.", 'reference', ['Gongylus']),
    ('hermon', 'Hermon', "Father of Hermocrates.", 'reference', ['Hermon']),
    ('salaethus', 'Salaethus', "A Lacedaemonian sent to Mitylene.", 'reference', ['Salaethus']),
    ('timagoras', 'Timagoras', "A Tegean envoy to the King.", 'reference', ['Timagoras']),
    ('antisthenes', 'Antisthenes', "A Spartan commanding ships for Ionia.", 'reference', ['Antisthenes']),
    ('aristocles', 'Aristocles', "Pleistoanax's brother, accused of bribing the Delphic prophetess.", 'reference', ['Aristocles']),
    ('athenagoras', 'Athenagoras', "Leader of the people at Syracuse.", 'supporting', ['Athenagoras']),
    ('chaereas', 'Chaereas', "An Athenian on the Paralus who took part in the revolution.", 'reference', ['Chaereas']),
    ('euphamidas', 'Euphamidas', "A commander of the force restoring Evarchus.", 'reference', ['Euphamidas']),
    ('euphemus', 'Euphemus', "Athenian envoy who speaks at Camarina.", 'reference', ['Euphemus']),
    ('evarchus', 'Evarchus', "Tyrant of Astacus, expelled by the Athenians.", 'reference', ['Evarchus']),
    ('menander', 'Menander', "An officer given command in Sicily.", 'reference', ['Menander']),
    ('myronides', 'Myronides', "Who led the old and young into the Megarid.", 'reference', ['Myronides']),
    ('tolmides', 'Tolmides', "Who sailed round Peloponnese and burnt the arsenal of Lacedaemon.", 'reference', ['Tolmides']),
    ('androcles', 'Androcles', "Chief leader of the commons, assassinated by the oligarchs.", 'reference', ['Androcles']),
    ('autocles', 'Autocles', "An Athenian commander against Cythera.", 'reference', ['Autocles']),
    ('charoeades', 'Charoeades', "An Athenian commander sent to Sicily with Laches.", 'reference', ['Charoeades']),
    ('cleandridas', 'Cleandridas', "Father of Gylippus.", 'reference', ['Cleandridas']),
    ('cleomenes', 'Cleomenes', "Of Lacedaemon, who drove out the accursed Alcmaeonids.", 'reference', ['Cleomenes']),
    ('cleopompus', 'Cleopompus', "Son of Clinias, an Athenian commander.", 'reference', ['Cleopompus']),
    ('conon', 'Conon', "The Athenian commander at Naupactus.", 'reference', ['Conon']),
    ('eucles', 'Eucles', "The general defending Amphipolis.", 'reference', ['Eucles']),
    ('eurymachus', 'Eurymachus', "Son of Leontiades, a Theban of great influence.", 'reference', ['Eurymachus']),
    ('scironides', 'Scironides', "An Athenian commander at Miletus.", 'reference', ['Scironides']),
    ('epitadas', 'Epitadas', "Son of Molobrus, commander of the Spartans on Sphacteria.", 'supporting', ['Epitadas']),
    ('styphon', 'Styphon', "Son of Pharax, who parleys for the Spartans on Sphacteria.", 'reference', ['Styphon']),
    ('asopius', 'Asopius', "Father of Phormio.", 'reference', ['Asopius']),
    ('tamos', 'Tamos', "The King's lieutenant in Ionia.", 'reference', ['Tamos']),
    ('agesandridas', 'Agesandridas', "A Spartan commanding the squadron for Euboea.", 'reference', ['Agesandridas']),
    ('ameinocles', 'Ameinocles', "A Corinthian shipwright.", 'reference', ['Ameinocles']),
    ('oroedus', 'Oroedus', "King of the Paravaeans.", 'reference', ['Oroedus']),
    ('peithias', 'Peithias', "Volunteer proxenus of the Athenians at Corcyra, leader of the commons.", 'supporting', ['Peithias']),
    ('salynthius', 'Salynthius', "The friendly king of the Agraeans.", 'reference', ['Salynthius']),
    ('charicles', 'Charicles', "Son of Apollodorus, sent with thirty ships round Peloponnese.", 'reference', ['Charicles']),
    ('dorieus', 'Dorieus', "The Rhodian Olympic victor.", 'reference', ['Dorieus']),
    ('clearchus', 'Clearchus', "Son of Ramphias, given command on the Hellespont.", 'reference', ['Clearchus']),
    ('dercyllidas', 'Dercyllidas', "A Spartan sent to the Hellespont.", 'reference', ['Dercyllidas']),
    ('gelo', 'Gelo', "The Syracusan tyrant.", 'reference', ['Gelo']),
    ('melanchridas', 'Melanchridas', "The admiral first named for the Chios expedition.", 'reference', ['Melanchridas']),
    ('lacedaemonius', 'Lacedaemonius', "Son of Cimon, commanding the ships sent to Corcyra.", 'reference', ['Lacedaemonius']),
    ('diotimus', 'Diotimus', "Son of Strombichus, commanding the ships sent to Corcyra.", 'reference', ['Diotimus']),
    ('proteas', 'Proteas', "Son of Epicles, commanding the ships sent to Corcyra.", 'reference', ['Proteas']),
    ('nicomedes', 'Nicomedes', "Son of Cleombrotus, commanding for the minor King Pleistoanax.", 'reference', ['Nicomedes']),
    ('learchus', 'Learchus', "An Athenian ambassador at Sitalces's court.", 'reference', ['Learchus']),
    ('ameiniades', 'Ameiniades', "An Athenian ambassador at Sitalces's court.", 'reference', ['Ameiniades']),
    ('thucles', 'Thucles', "Father of Eurymedon.", 'reference', ['Thucles']),
    ('zeus', 'Zeus', "Whose suppliants at Ithome the oracle bade the Spartans release.", 'reference', ['Zeus']),
    ('hera', 'Hera', "In whose temple the ambassadors sat as suppliants.", 'reference', ['Hera']),
    ('poseidon', 'Poseidon', "From whose temple at Taenarus the Helot suppliants were dragged.", 'reference', ['Poseidon']),
]

if __name__ == '__main__':
    for eid, name, body, role, aliases in E:
        add_entity(BOOK, eid, name, '', body, role, P, aliases)
    add_e(BOOK, 'hippias-tyrant', 'Hippias', '', "Eldest son of Pisistratus, the real tyrant when Hipparchus was slain.", 'supporting', P, ['Hippias'], exclude_paragraphs={(9, 33)})
    add_e(BOOK, 'hippias-arcadian', 'Hippias', '', "Commander of the Arcadian mercenaries at Notium.", 'reference', P, ['Hippias'], only_paragraphs={(9, 33)})
    add_e(BOOK, 'hippocrates', 'Hippocrates', '', "Athenian general, son of Ariphron.", 'supporting', P, ['Hippocrates'], exclude_paragraphs={(18, 4)})
    add_e(BOOK, 'hippocrates-of-gela', 'Hippocrates', '', "Tyrant of Gela.", 'reference', P, ['Hippocrates'], only_paragraphs={(18, 4)})
    add_e(BOOK, 'callias', 'Callias', '', "Athenian general, son of Calliades, at Potidaea.", 'reference', P, ['Callias'], only_paragraphs={(2, 31), (2, 32)})
    add_e(BOOK, 'procles', 'Procles', '', "Athenian general, son of Theodorus, Demosthenes's colleague.", 'reference', P, ['Procles'], only_paragraphs={(11, 4), (11, 12)})
    add_e(BOOK, 'aristeus', 'Aristeus', '', "The Corinthian commander at Potidaea.", 'supporting', P, ['Aristeus'], exclude_paragraphs={(2, 4), (14, 67)})
    add_e(BOOK, 'pythodorus', 'Pythodorus', '', "Athenian general, son of Isolochus.", 'reference', P, ['Pythodorus'], exclude_paragraphs={(6, 1)})
    add_e(BOOK, 'timocrates-lacedaemonian', 'Timocrates', '', "A Lacedaemonian commissioner sent to Cnemus, who killed himself after the defeat.", 'reference', P, ['Timocrates'], only_paragraphs={(8, 14), (8, 21)})
    add_e(BOOK, 'euthydemus', 'Euthydemus', '', "An officer given command in Sicily with Menander.", 'reference', P, ['Euthydemus'], only_paragraphs={(21, 17), (23, 20)})
    add_e(BOOK, 'leon-athenian', 'Leon', '', "An Athenian general at Samos with Diomedon.", 'reference', P, ['Leon'], only_paragraphs={(24, 27), (25, 10), (25, 33)})
