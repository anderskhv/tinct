#!/usr/bin/env python3
"""Add named figures to iliad (Butler's prose; original-en uses Roman
divine names, modern-en Greek ones -- so each deity card carries BOTH
spellings as aliases and each edition binds whichever it contains).
Built from the spaCy scan plus a hand-checked list of ~150 expected
names counted directly: the scan had missed Peleus (135), Tydeus (96),
Antilochus (59), Iris (40), Teucer (37), Polydamas (32) and most of the
Catalogue of Ships. "Phoebus" (39) was an unbound alias of the existing
Apollo card.

Homonyms read in full: Xanthus is the river-god (= Scamander, Book 21),
Achilles's talking horse (Books 16, 19) and a Lycian river -- the horse
is bound by paragraph, the rest to the river card; two Helenuses (Priam's
son vs. a Greek son of Oenops); two Amphimachuses; two Medons; Thoas of
Aetolia vs. the Lemnian king; Lycaon the father of Pandarus (patronymic
only) vs. Lycaon the son of Priam (Book 21, bound by paragraph); Sleep
bound only where personified (Book 14). Skipped as unresolvable without
deeper reading: Adrastus/Adrestus, Antiphus (three men -- only Priam's
son bound), Epistrophus, Pisander (only Antimachus's son bound),
Scamandrius (a Trojan AND Astyanax's other name), Pedasus (a youth, a
horse and a city), Acamas, Melanippus, Orestes, Dawn/Folly personified.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity
from add_aliases import add_aliases
from add_histories_helpers import add_entity_excluding as add_e

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'iliad'
P = 'person'


def paras_with(chapter, word):
    """(chapter, paragraphIndex) pairs in the given chapter (original-en) containing word."""
    d = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_bytes())
    out = set()
    for c in d['chapters']:
        if c['number'] != chapter:
            continue
        for pi, p in enumerate(c['paragraphs']):
            if re.search(r'(?<![A-Za-z])' + re.escape(word) + r'(?![A-Za-z])', p):
                out.add((c['number'], pi))
    return out


E = [
    # Achaeans
    ('peleus', 'Peleus', "Father of Achilles.", 'supporting', ['Peleus']),
    ('tydeus', 'Tydeus', "Father of Diomed, by whose name his son is often called.", 'supporting', ['Tydeus']),
    ('antilochus', 'Antilochus', "Nestor's son, first of the Achaeans to slay a Trojan in the battle.", 'supporting', ['Antilochus']),
    ('thrasymedes', 'Thrasymedes', "A son of Nestor.", 'reference', ['Thrasymedes']),
    ('teucer', 'Teucer', "The Achaean archer, half-brother of Ajax.", 'supporting', ['Teucer']),
    ('menoetius', 'Menoetius', "Father of Patroclus, by whose name his son is often called.", 'supporting', ['Menoetius']),
    ('automedon', 'Automedon', "Achilles's charioteer and companion.", 'supporting', ['Automedon']),
    ('machaon', 'Machaon', "Son of Aesculapius, skilled in healing, a leader of the Thessalians.", 'supporting', ['Machaon']),
    ('podalirius', 'Podalirius', "Son of Aesculapius, skilled in healing, brother of Machaon.", 'reference', ['Podalirius']),
    ('sthenelus', 'Sthenelus', "Son of Capaneus, Diomed's companion.", 'supporting', ['Sthenelus']),
    ('capaneus', 'Capaneus', "Father of Sthenelus.", 'reference', ['Capaneus']),
    ('euryalus', 'Euryalus', "Son of Mecisteus, in command with Diomed.", 'reference', ['Euryalus']),
    ('mecisteus', 'Mecisteus', "Father of Euryalus.", 'reference', ['Mecisteus']),
    ('talthybius', 'Talthybius', "Agamemnon's herald and squire.", 'supporting', ['Talthybius']),
    ('eurybates', 'Eurybates', "Agamemnon's herald and squire.", 'reference', ['Eurybates']),
    ('calchas', 'Calchas', "Son of Thestor, wisest of augurs.", 'supporting', ['Calchas']),
    ('chryses', 'Chryses', "Apollo's priest, whose daughter Agamemnon holds.", 'supporting', ['Chryses']),
    ('thersites', 'Thersites', "A monger of sedition, unbridled of tongue.", 'supporting', ['Thersites']),
    ('eurypylus', 'Eurypylus', "Son of Euaemon, an Achaean chieftain.", 'supporting', ['Eurypylus']),
    ('euaemon', 'Euaemon', "Father of Eurypylus.", 'reference', ['Euaemon']),
    ('tlepolemus', 'Tlepolemus', "Son of Hercules, leader of the Rhodians.", 'reference', ['Tlepolemus']),
    ('laertes', 'Laertes', "Father of Ulysses.", 'reference', ['Laertes']),
    ('telemachus', 'Telemachus', "Ulysses's son.", 'reference', ['Telemachus']),
    ('neoptolemus', 'Neoptolemus', "Achilles's son, being brought up in Scyros.", 'reference', ['Neoptolemus']),
    ('meges', 'Meges', "Son of Phyleus, leader of the men of Dulichium.", 'reference', ['Meges']),
    ('phyleus', 'Phyleus', "Father of Meges.", 'reference', ['Phyleus']),
    ('peneleos', 'Peneleos', "A captain of the Boeotians.", 'reference', ['Peneleos']),
    ('leitus', 'Leitus', "A captain of the Boeotians.", 'reference', ['Leitus']),
    ('arcesilaus', 'Arcesilaus', "A captain of the Boeotians.", 'reference', ['Arcesilaus']),
    ('prothoenor', 'Prothoenor', "A captain of the Boeotians.", 'reference', ['Prothoenor']),
    ('clonius', 'Clonius', "A captain of the Boeotians.", 'reference', ['Clonius']),
    ('ascalaphus', 'Ascalaphus', "Son of Mars, a leader from Orchomenus.", 'reference', ['Ascalaphus']),
    ('ialmenus', 'Ialmenus', "Son of Mars, a leader from Orchomenus.", 'reference', ['Ialmenus']),
    ('menestheus', 'Menestheus', "Son of Peteos, commander of the Athenians.", 'reference', ['Menestheus']),
    ('elephenor', 'Elephenor', "Chief of the Abantes.", 'reference', ['Elephenor']),
    ('agapenor', 'Agapenor', "Son of Ancaeus, commander of the Arcadians.", 'reference', ['Agapenor']),
    ('thalpius', 'Thalpius', "A captain of the Epeans.", 'reference', ['Thalpius']),
    ('diores', 'Diores', "Son of Amarynceus, a captain of the Epeans.", 'reference', ['Diores']),
    ('polyxenus', 'Polyxenus', "A captain of the Epeans.", 'reference', ['Polyxenus']),
    ('nireus', 'Nireus', "The handsomest man that came to Ilius after Achilles.", 'reference', ['Nireus']),
    ('philoctetes', 'Philoctetes', "The skilful archer, lying in pain on Lemnos.", 'reference', ['Philoctetes']),
    ('podarces', 'Podarces', "Who marshalled the men of Protesilaus.", 'reference', ['Podarces']),
    ('protesilaus', 'Protesilaus', "First of the Achaeans to fall at Troy.", 'reference', ['Protesilaus']),
    ('eumelus', 'Eumelus', "Son of Admetus and Alcestis, leader from Pherae.", 'reference', ['Eumelus']),
    ('admetus', 'Admetus', "Father of Eumelus.", 'reference', ['Admetus']),
    ('alcestis', 'Alcestis', "Loveliest of the daughters of Pelias, mother of Eumelus.", 'reference', ['Alcestis']),
    ('polypoetes', 'Polypoetes', "Son of Pirithous, a Lapith leader.", 'reference', ['Polypoetes']),
    ('leonteus', 'Leonteus', "A Lapith leader with Polypoetes.", 'reference', ['Leonteus']),
    ('guneus', 'Guneus', "Leader from Cyphus.", 'reference', ['Guneus']),
    ('prothous', 'Prothous', "Commander of the Magnetes.", 'reference', ['Prothous']),
    ('epeus', 'Epeus', "An Achaean boxer at the funeral games.", 'reference', ['Epeus']),
    ('leucus', 'Leucus', "A comrade of Ulysses.", 'reference', ['Leucus']),
    ('simoeisius', 'Simoeisius', "A fair Trojan youth, slain by Ajax.", 'reference', ['Simoeisius']),
    # Trojans and allies
    ('polydamas', 'Polydamas', "A Trojan counsellor and warrior.", 'supporting', ['Polydamas']),
    ('antenor', 'Antenor', "A Trojan elder.", 'supporting', ['Antenor']),
    ('theano', 'Theano', "Antenor's wife, priestess of Minerva.", 'reference', ['Theano']),
    ('deiphobus', 'Deiphobus', "A son of Priam.", 'supporting', ['Deiphobus']),
    ('agenor', 'Agenor', "A Trojan warrior, son of Antenor.", 'supporting', ['Agenor']),
    ('cebriones', 'Cebriones', "Hector's brother and charioteer.", 'supporting', ['Cebriones']),
    ('dolon', 'Dolon', "A Trojan spy caught by Ulysses and Diomed.", 'supporting', ['Dolon']),
    ('rhesus', 'Rhesus', "King of the Thracians.", 'reference', ['Rhesus']),
    ('pandarus', 'Pandarus', "Son of Lycaon, the archer whom Apollo taught.", 'supporting', ['Pandarus']),
    ('asteropaeus', 'Asteropaeus', "A Paeonian leader, valiant among the allies.", 'reference', ['Asteropaeus']),
    ('hippolochus', 'Hippolochus', "Father of Glaucus.", 'reference', ['Hippolochus']),
    ('coon', 'Coon', "Antenor's eldest son.", 'reference', ['Coon']),
    ('iphidamas', 'Iphidamas', "Son of Antenor, brought up in Thrace.", 'reference', ['Iphidamas']),
    ('polites', 'Polites', "A son of Priam, fleet of foot.", 'reference', ['Polites']),
    ('isus', 'Isus', "A bastard son of Priam.", 'reference', ['Isus']),
    ('cassandra', 'Cassandra', "The fairest of Priam's daughters.", 'reference', ['Cassandra']),
    ('astyanax', 'Astyanax', "Hector's infant son.", 'supporting', ['Astyanax']),
    ('laomedon', 'Laomedon', "Priam's father.", 'reference', ['Laomedon']),
    ('tros', 'Tros', "Ancestor of the Trojan kings.", 'reference', ['Tros']),
    ('ganymede', 'Ganymede', "Son of Tros, taken by Jove.", 'reference', ['Ganymede']),
    ('antimachus', 'Antimachus', "A Trojan who opposed restoring Helen.", 'reference', ['Antimachus']),
    ('panthous', 'Panthous', "A Trojan elder.", 'reference', ['Panthous']),
    ('thymoetes', 'Thymoetes', "A Trojan elder.", 'reference', ['Thymoetes']),
    ('lampus', 'Lampus', "A Trojan elder.", 'reference', ['Lampus']),
    ('clytius', 'Clytius', "A Trojan elder.", 'reference', ['Clytius']),
    ('hicetaon', 'Hicetaon', "A Trojan elder.", 'reference', ['Hiketaon', 'Hicetaon']),
    ('ucalegon', 'Ucalegon', "A Trojan elder.", 'reference', ['Ucalegon']),
    ('idaeus', 'Idaeus', "The Trojan herald.", 'supporting', ['Idaeus']),
    ('hippothous', 'Hippothous', "Leader of the Pelasgian spearsmen.", 'reference', ['Hippothous']),
    ('pylaeus', 'Pylaeus', "Leader of the Pelasgian spearsmen.", 'reference', ['Pylaeus']),
    ('peirous', 'Peirous', "A commander of the Thracians.", 'reference', ['Peirous']),
    ('euphemus', 'Euphemus', "Captain of the Ciconian spearsmen.", 'reference', ['Euphemus']),
    ('pyraechmes', 'Pyraechmes', "Leader of the Paeonian archers.", 'reference', ['Pyraechmes']),
    ('pylaemenes', 'Pylaemenes', "Leader of the Paphlagonians.", 'reference', ['Pylaemenes']),
    ('odius', 'Odius', "A captain of the Halizoni.", 'reference', ['Odius']),
    ('chromis', 'Chromis', "A leader of the Mysians.", 'reference', ['Chromis']),
    ('ennomus', 'Ennomus', "The augur who led the Mysians.", 'reference', ['Ennomus']),
    ('phorcys', 'Phorcys', "A leader of the Phrygians.", 'reference', ['Phorcys']),
    ('ascanius', 'Ascanius', "A leader of the Phrygians.", 'reference', ['Ascanius']),
    ('mesthles', 'Mesthles', "A commander of the Meonians.", 'reference', ['Mesthles']),
    ('nastes', 'Nastes', "Leader of the Carians.", 'reference', ['Nastes']),
    ('echepolus', 'Echepolus', "First Trojan slain in the battle.", 'reference', ['Echepolus']),
    ('phereclus', 'Phereclus', "The craftsman who built Paris's ships.", 'reference', ['Phereclus']),
    ('archeptolemus', 'Archeptolemus', "Hector's charioteer.", 'reference', ['Archeptolemus']),
    # gods, spirits, legend
    ('iris', 'Iris', "Messenger of the gods, fleet as the wind.", 'supporting', ['Iris']),
    ('cronos', 'Saturn', "Father of Jove; Cronos in the Greek.", 'reference', ['Saturn', 'Cronos']),
    ('hades', 'Hades', "The god of the dead, and his house below.", 'reference', ['Hades']),
    ('oceanus', 'Oceanus', "The river-god from whom all the gods proceed.", 'reference', ['Oceanus']),
    ('tethys', 'Tethys', "Wife of Oceanus.", 'reference', ['Tethys']),
    ('leto', 'Leto', "Mother of Apollo and Diana; Latona in the Roman.", 'reference', ['Leto', 'Latona']),
    ('artemis', 'Diana', "Goddess of the hunt; Artemis in the Greek.", 'reference', ['Diana', 'Artemis']),
    ('heracles', 'Hercules', "The hero, Jove's son by Alcmena; Heracles in the Greek.", 'reference', ['Hercules', 'Heracles']),
    ('alcmena', 'Alcmena', "Mother of Hercules by Jove.", 'reference', ['Alcmena']),
    ('eurystheus', 'Eurystheus', "Who laid the labours on Hercules.", 'reference', ['Eurystheus']),
    ('dionysus', 'Bacchus', "Son of Semele; Dionysus in the Greek.", 'reference', ['Bacchus', 'Dionysus']),
    ('persephone', 'Proserpine', "Queen of the dead; Persephone in the Greek.", 'reference', ['Proserpine', 'Persephone']),
    ('demeter', 'Ceres', "The goddess of grain; Demeter in the Greek.", 'reference', ['Ceres', 'Demeter']),
    ('hebe', 'Hebe', "Who pours nectar for the gods.", 'reference', ['Hebe']),
    ('themis', 'Themis', "Who greets Juno on Olympus.", 'reference', ['Themis']),
    ('dione', 'Dione', "Mother of Venus.", 'reference', ['Dione']),
    ('charis', 'Charis', "Wife of Vulcan.", 'reference', ['Charis']),
    ('nereus', 'Nereus', "The old man of the sea, father of Thetis.", 'reference', ['Nereus']),
    ('erinys', 'Erinys', "The fury that walks in darkness.", 'reference', ['Erinys']),
    ('discord', 'Discord', "Sent by Jove with the ensign of war.", 'reference', ['Discord']),
    ('muses', 'the Muses', "Who lift their voices on Olympus.", 'reference', ['Muses']),
    ('tithonus', 'Tithonus', "Beside whom Dawn rises.", 'reference', ['Tithonus']),
    ('briareus', 'Briareus', "The hundred-handed monster, called Aegaeon by men.", 'reference', ['Briareus', 'Aegaeon']),
    ('zephyrus', 'Zephyrus', "The west wind.", 'reference', ['Zephyrus']),
    ('boreas', 'Boreas', "The north wind.", 'reference', ['Boreas']),
    ('bellerophon', 'Bellerophon', "The hero whose story Glaucus tells.", 'reference', ['Bellerophon']),
    ('sisyphus', 'Sisyphus', "Craftiest of mankind, ancestor of Glaucus.", 'reference', ['Sisyphus']),
    ('meleager', 'Meleager', "The Aetolian hero whose story Phoenix tells.", 'reference', ['Meleager']),
    ('oeneus', 'Oeneus', "King of the Aetolians, father of Meleager.", 'reference', ['Oeneus']),
    ('cleopatra', 'Cleopatra', "Meleager's wife.", 'reference', ['Cleopatra']),
    ('niobe', 'Niobe', "Whose twelve children were slain.", 'reference', ['Niobe']),
    ('minos', 'Minos', "Son of Jove, chief ruler in Crete.", 'reference', ['Minos']),
    ('rhadamanthus', 'Rhadamanthus', "Son of Jove, brother of Minos.", 'reference', ['Rhadamanthus']),
    ('perseus', 'Perseus', "The famed hero, Jove's son.", 'reference', ['Perseus']),
    ('jason', 'Jason', "Who sailed to Lemnos.", 'reference', ['Jason']),
    ('chrysothemis', 'Chrysothemis', "A daughter of Agamemnon.", 'reference', ['Chrysothemis']),
    ('balius', 'Balius', "One of Achilles's immortal horses.", 'reference', ['Balius']),
    ('podarge', 'Podarge', "The harpy who bore Achilles's horses.", 'reference', ['Podarge']),
]

if __name__ == '__main__':
    add_aliases(BOOK, 'apollo', ['Phoebus'])
    for eid, name, body, role, aliases in E:
        add_entity(BOOK, eid, name, '', body, role, P, aliases)
    horse = {(16, 7), (19, 30)}
    add_e(BOOK, 'xanthus-horse', 'Xanthus', '', "One of Achilles's immortal horses, who speaks to foretell his death.", 'reference', P, ['Xanthus'], only_paragraphs=horse)
    add_e(BOOK, 'scamander', 'Scamander', '', "The river of the Trojan plain, also called Xanthus, and its god.", 'supporting', P, ['Scamander', 'Xanthus'], exclude_paragraphs=horse | {(2, 83)})
    add_e(BOOK, 'helenus', 'Helenus', '', "A son of Priam, a seer.", 'supporting', P, ['Helenus'], exclude_paragraphs={(5, 54)})
    add_e(BOOK, 'amphimachus', 'Amphimachus', '', "Son of Cteatus, a captain of the Epeans.", 'reference', P, ['Amphimachus'], exclude_paragraphs={(2, 82)})
    add_e(BOOK, 'medon', 'Medon', '', "Bastard son of Oileus, who led the men of Philoctetes.", 'reference', P, ['Medon'], only_paragraphs={(2, 56), (13, 46)})
    add_e(BOOK, 'thoas', 'Thoas', '', "Son of Andraemon, leader of the Aetolians.", 'reference', P, ['Thoas'], exclude_paragraphs={(14, 19)})
    add_e(BOOK, 'pisander', 'Pisander', '', "Son of Antimachus, slain by Agamemnon.", 'reference', P, ['Pisander'], only_paragraphs={(11, 8), (11, 10)})
    add_e(BOOK, 'antiphus', 'Antiphus', '', "A son of Priam, slain by Agamemnon.", 'reference', P, ['Antiphus'], only_paragraphs={(11, 7)})
    add_e(BOOK, 'lycaon', 'Lycaon', '', "A son of Priam, who pleads for his life before Achilles.", 'supporting', P, ['Lycaon'], only_paragraphs=paras_with(21, 'Lycaon'))
    add_e(BOOK, 'sleep', 'Sleep', '', "Own brother to Death, whom Juno enlists on Lemnos.", 'reference', P, ['Sleep'], only_paragraphs=paras_with(14, 'Sleep'))
