#!/usr/bin/env python3
"""Odyssey (Butler's translation, Roman divine names): clickable-names pass.

After rebind_capped_names.py revived the principal names, this adds the
rest of the cast: the suitors, the Phaeacians, Nestor's and Menelaus's
households, the shades in book 11, the Ithacan servants, the gods under
their Roman names, and the one-line genealogical mentions.

Homonyms read in context and split: Polybus (Eurymachus's father /
the Egyptian / the Phaeacian ball-maker / the suitor son of Polyctor);
Antiphus (son of Aegyptius eaten by the Cyclops / the old friend in
book 17); Ajax (Telamonian / the Locrian wrecked by Neptune, book 4);
Castor (the Dioscuri / "Castor son of Hylax", the beggar's invented
father); Leocritus/Leiocritus (one suitor, two spellings). "Noman" is
bound to Odysseus.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'odyssey'
P = 'person'
D = 'deity'
_ED = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
_PARAS = [(c['number'], i, p) for c in _ED['chapters'] for i, p in enumerate(c['paragraphs'])]


def chapters(*chs):
    return {(ch, i) for ch, i, p in _PARAS if ch in chs}


def r(eid, name, subtitle, body, aliases, kind=P, role='reference', loose=False, **kw):
    if loose:
        kw.setdefault('strict_editions', ())
    add_e(BOOK, eid, name, subtitle, body, role, kind, aliases, **kw)


def main():
    add_aliases_restricted(BOOK, 'odysseus', ['Noman'], only_paragraphs=chapters(9))

    # ---- homonym splits first --------------------------------------------
    r('polybus-suitor', 'Polybus', 'Suitor', "Son of Polyctor; killed by Eumaeus in the hall.", ['Polybus'], only_paragraphs=chapters(22))
    r('polybus-egyptian', 'Polybus', 'Of Egyptian Thebes', "Whose wife Alcandra gave Helen the silver work-box.", ['Polybus'], only_paragraphs={(4, 10)})
    r('polybus-phaeacian', 'Polybus', 'Phaeacian craftsman', "Made the red ball the dancers throw.", ['Polybus'], only_paragraphs={(8, 31)})
    r('polybus', 'Polybus', "Eurymachus's father", "", ['Polybus'], exclude_paragraphs=chapters(22) | {(4, 10), (8, 31)})
    r('antiphus-aegyptius', 'Antiphus', "Son of Aegyptius", "Went with Ulysses to Troy and was the last man the Cyclops ate.", ['Antiphus'], only_paragraphs=chapters(2))
    r('antiphus', 'Antiphus', "Old friend of Ulysses' house", "", ['Antiphus'], only_paragraphs=chapters(17))
    r('ajax-lesser', 'Ajax', 'Son of Oileus', "Wrecked by Neptune on the Gyrean rocks for his boast, in Proteus's account.", ['Ajax'], only_paragraphs={(4, 41)})
    r('ajax', 'Ajax', 'Son of Telamon', "The finest and goodliest man of the Danaans after Achilles; his shade will not speak to Ulysses.", ['Ajax'], exclude_paragraphs={(4, 41)}, role='supporting')
    r('castor-hylax', 'Castor son of Hylax', "The beggar's invented father", "", ['Castor'], only_paragraphs={(14, 11)})
    r('castor', 'Castor', 'Dioscuri', "Breaker of horses, twin of Pollux.", ['Castor'], exclude_paragraphs={(14, 11)})
    r('leiocritus', 'Leiocritus', 'Suitor', "Son of Evenor; killed by Telemachus.", ['Leiocritus', 'Leocritus'])

    # ---- gods under Roman names ------------------------------------------
    r('dawn', 'Dawn', 'Eos', "The child of morning, rosy-fingered.", ['Dawn'], kind=D)
    r('diana', 'Diana', 'Artemis', "", ['Diana'], kind=D)
    r('venus', 'Venus', 'Aphrodite', "", ['Venus'], kind=D)
    r('juno', 'Juno', 'Hera', "", ['Juno'], kind=D)
    r('mars', 'Mars', 'Ares', "", ['Mars'], kind=D)
    r('vulcan', 'Vulcan', 'Hephaestus', "", ['Vulcan'], kind=D)
    r('apollo', 'Apollo', '', "", ['Apollo'], kind=D)
    r('ceres', 'Ceres', 'Demeter', "", ['Ceres'], kind=D)
    r('bacchus', 'Bacchus', 'Dionysus', "", ['Bacchus'], kind=D)
    r('aurora', 'Aurora', '', "Carried off Cleitus.", ['Aurora'], kind=D)
    r('proserpine', 'Proserpine', 'Persephone', "", ['Proserpine'], kind=D)
    r('hades', 'Hades', '', "The house of Hades, to which the dead go.", ['Hades'], kind=D)
    r('oceanus', 'Oceanus', '', "", ['Oceanus'], kind=D)
    r('leto', 'Leto', '', "", ['Leto'], kind=D)
    r('atlas', 'Atlas', '', "Calypso's father, who holds the pillars of heaven.", ['Atlas'], kind=D)
    r('muse', 'The Muse', '', "", ['Muse'], kind=D)
    r('ino', 'Ino', 'Leucothea', "Daughter of Cadmus, now a sea goddess; gives Ulysses her veil.", ['Ino', 'Leucothea'], kind=D)
    r('scylla', 'Scylla', '', "", ['Scylla'])
    r('charybdis', 'Charybdis', '', "", ['Charybdis'])
    r('sirens', 'The Sirens', '', "", ['Sirens'])
    r('erinys', 'Erinys', '', "", ['Erinys'], kind=D)
    r('ilithuia', 'Ilithuia', '', "", ['Ilithuia'], kind=D)
    r('hebe', 'Hebe', '', "", ['Hebe'], kind=D)
    r('rumour', 'Rumour', '', "", ['Rumour'], kind=D)
    r('phaethon', 'Phaethon', "Dawn's horse", "", ['Phaethon'])
    r('lampetie', 'Lampetie', "Daughter of the Sun", "", ['Lampetie', 'Phaethusa'])

    # ---- Ithaca ----------------------------------------------------------
    r('medon', 'Medon', 'Herald', "The herald who overhears the suitors' plot and is spared in the slaughter.", ['Medon'], role='supporting')
    r('phemius', 'Phemius', 'Bard', "The bard who sings for the suitors against his will.", ['Phemius'], role='supporting')
    r('halitherses', 'Halitherses', 'Prophet', "Old friend of the house who reads the omen of the eagles.", ['Halitherses'], role='supporting')
    r('mentes', 'Mentes', 'Chief of the Taphians', "Minerva's disguise in book 1.", ['Mentes'])
    r('aegyptius', 'Aegyptius', 'Old Ithacan', "", ['Aegyptius'])
    r('eurynomus', 'Eurynomus', 'Suitor', "Son of Aegyptius.", ['Eurynomus'])
    r('noemon', 'Noemon', 'Son of Phronius', "Lends Telemachus the ship.", ['Noemon'])
    r('amphinomus', 'Amphinomus', 'Suitor', "The one suitor of good understanding, whom Ulysses tries to warn.", ['Amphinomus'], role='supporting')
    r('nisus', 'Nisus', "Amphinomus's father", "", ['Nisus'])
    r('aretias', 'Aretias', '', "", ['Aretias'])
    r('ctesippus', 'Ctesippus', 'Suitor', "The ribald fellow from Same who throws the ox's foot.", ['Ctesippus'])
    r('leiodes', 'Leiodes', 'Suitor', "The soothsayer, first to try the bow; begs for his life in vain.", ['Leiodes'])
    r('agelaus', 'Agelaus', 'Suitor', "Son of Damastor.", ['Agelaus'])
    r('amphimedon', 'Amphimedon', 'Suitor', "Son of Melaneus; his shade tells Agamemnon the story.", ['Amphimedon'])
    r('demoptolemus', 'Demoptolemus', 'Suitor', "", ['Demoptolemus'])
    r('pisander', 'Pisander', 'Suitor', "Son of Polyctor.", ['Pisander'])
    r('eurydamas', 'Eurydamas', 'Suitor', "", ['Eurydamas'])
    r('elatus', 'Elatus', 'Suitor', "", ['Elatus'], loose=True)
    r('euryades', 'Euryades', 'Suitor', "", ['Euryades'], loose=True)
    r('eupeithes', 'Eupeithes', "Antinous's father", "Leads the kinsmen against Ulysses and is killed by Laertes.", ['Eupeithes'], role='supporting')
    r('irus', 'Irus', 'Beggar', "Arnaeus, the public beggar whom Ulysses fells with one blow.", ['Irus', 'Arnaeus'], role='supporting')
    r('melantho', 'Melantho', 'Maid', "Melanthius's insolent sister.", ['Melantho'])
    r('dolius', 'Dolius', 'Old servant', "Father of Melanthius and Melantho; works Laertes' farm.", ['Dolius'])
    r('philoetius', 'Philoetius', 'Stockman', "The loyal cowherd who stands with Ulysses in the hall.", ['Philoetius'], role='supporting')
    r('eurynome', 'Eurynome', 'Housekeeper', "Penelope's waiting woman.", ['Eurynome'])
    r('mesaulius', 'Mesaulius', "Eumaeus's servant", "", ['Mesaulius'])
    r('icarius', 'Icarius', "Penelope's father", "", ['Icarius'])
    r('iphthime', 'Iphthime', "Penelope's sister", "The phantom Minerva sends to comfort her.", ['Iphthime'])
    r('eurymedusa', 'Eurymedusa', "Nausicaa's nurse", "", ['Eurymedusa'])
    r('autolycus', 'Autolycus', "Ulysses' grandfather", "Who named him and took him boar-hunting on Parnassus.", ['Autolycus'], role='supporting')
    r('amphithea', 'Amphithea', "Autolycus's wife", "", ['Amphithea'])
    r('anticlea', 'Anticlea', "Ulysses' mother", "Her shade in the house of Hades.", ['Anticlea'], role='supporting')
    r('arceisius', 'Arceisius', "Laertes' father", "", ['Arceisius'])
    r('ctimene', 'Ctimene', "Ulysses' sister", "", ['Ctimene'])
    r('eurybates', 'Eurybates', "Ulysses' herald", "", ['Eurybates'])
    r('piraeus', 'Piraeus', "Telemachus's friend", "Takes Theoclymenus home.", ['Piraeus'])
    r('theoclymenus', 'Theoclymenus', 'Seer', "The exiled prophet who foresees the suitors' doom.", ['Theoclymenus'], role='supporting')
    r('melampus', 'Melampus', 'Seer', "", ['Melampus'])
    r('polypheides', 'Polypheides', 'Seer', "", ['Polypheides'])
    r('amphiaraus', 'Amphiaraus', 'Seer', "", ['Amphiaraus'])
    r('amphilochus', 'Amphilochus', '', "", ['Amphilochus'])
    r('cleitus', 'Cleitus', '', "", ['Cleitus'], loose=True)
    r('mantius', 'Mantius', '', "", ['Mantius'])
    r('polyctor', 'Polyctor', '', "", ['Polyctor'])
    r('ithacus', 'Ithacus', '', "", ['Ithacus'])
    r('neritus', 'Neritus', '', "", ['Neritus'])
    r('iphitus', 'Iphitus', 'Son of Eurytus', "Gave Ulysses the great bow; killed by Hercules.", ['Iphitus'])
    r('eurytus', 'Eurytus', 'The Oechalian', "", ['Eurytus'])
    r('terpes', 'Terpes', "Phemius's father", "", ['Terpes'])
    r('mulius', 'Mulius', '', "", ['Mulius'])
    r('icmalius', 'Icmalius', 'Craftsman', "", ['Icmalius'])
    r('pandareus', 'Pandareus', '', "", ['Pandareus'])
    r('apheidas', 'Apheidas', '', "", ['Apheidas'])
    r('polypemon', 'Polypemon', '', "", ['Polypemon'], loose=True)
    r('pheidon', 'Pheidon', 'King of the Thesprotians', "", ['Pheidon'])
    r('dmetor', 'Dmetor', '', "", ['Dmetor'], loose=True)
    r('iasus', 'Iasus', '', "", ['Iasus'])
    r('hippodamia', 'Hippodamia', 'Maid', "", ['Hippodamia'])
    r('autonoe', 'Autonoe', 'Maid', "", ['Autonoe'])
    r('melaneus', 'Melaneus', '', "", ['Melaneus'])
    r('damastor', 'Damastor', '', "", ['Damastor'], loose=True)
    r('oenops', 'Oenops', '', "", ['Oenops'], loose=True)
    r('evenor', 'Evenor', '', "", ['Evenor'], loose=True)
    r('mastor', 'Mastor', '', "", ['Mastor'], loose=True)

    # ---- Pylos and Sparta -------------------------------------------------
    r('eurydice', 'Eurydice', "Nestor's wife", "", ['Eurydice'])
    r('thrasymedes', 'Thrasymedes', "Nestor's son", "", ['Thrasymedes'])
    r('perseus', 'Perseus', "Nestor's son", "", ['Perseus'])
    r('echephron', 'Echephron', "Nestor's son", "", ['Echephron'], loose=True)
    r('stratius', 'Stratius', "Nestor's son", "", ['Stratius'], loose=True)
    r('aretus', 'Aretus', "Nestor's son", "", ['Aretus'], loose=True)
    r('neleus', 'Neleus', "Nestor's father", "", ['Neleus'])
    r('diocles', 'Diocles', 'Of Pherae', "Entertains Telemachus and Pisistratus.", ['Diocles'])
    r('ortilochus', 'Ortilochus', '', "", ['Ortilochus', 'Orsilochus'])
    r('megapenthes', 'Megapenthes', "Menelaus's son", "", ['Megapenthes'])
    r('hermione', 'Hermione', "Helen's daughter", "", ['Hermione'])
    r('eteoneus', 'Eteoneus', "Menelaus's steward", "", ['Eteoneus'])
    r('adraste', 'Adraste', "Helen's maid", "", ['Adraste'], loose=True)
    r('alcippe', 'Alcippe', "Helen's maid", "", ['Alcippe'], loose=True)
    r('phylo', 'Phylo', "Helen's maid", "", ['Phylo'], loose=True)
    r('alcandra', 'Alcandra', '', "", ['Alcandra'], loose=True)
    r('thon', 'Thon', '', "", ['Thon'])
    r('polydamna', 'Polydamna', '', "", ['Polydamna'])
    r('proteus', 'Proteus', 'The old man of the sea', "", ['Proteus'], role='supporting')
    r('idothea', 'Idothea', "Proteus's daughter", "", ['Idothea'])
    r('phrontis', 'Phrontis', "Menelaus's helmsman", "", ['Phrontis'], loose=True)

    # ---- Troy and the shades ---------------------------------------------
    r('priam', 'Priam', '', "", ['Priam'])
    r('antilochus', 'Antilochus', "Nestor's son", "Killed at Troy by Memnon, son of Dawn.", ['Antilochus'])
    r('patroclus', 'Patroclus', '', "", ['Patroclus'])
    r('peleus', 'Peleus', '', "", ['Peleus'])
    r('neoptolemus', 'Neoptolemus', "Achilles' son", "", ['Neoptolemus'])
    r('deiphobus', 'Deiphobus', '', "", ['Deiphobus'])
    r('diomed', 'Diomed', '', "", ['Diomed'])
    r('idomeneus', 'Idomeneus', '', "", ['Idomeneus'])
    r('epeus', 'Epeus', '', "Built the wooden horse.", ['Epeus'])
    r('eurypylus', 'Eurypylus', '', "", ['Eurypylus'])
    r('telephus', 'Telephus', '', "", ['Telephus'])
    r('telamon', 'Telamon', '', "", ['Telamon'])
    r('clytemnestra', 'Clytemnestra', '', "", ['Clytemnestra'], role='supporting')
    r('cassandra', 'Cassandra', '', "", ['Cassandra'])
    r('orestes', 'Orestes', '', "", ['Orestes'], role='supporting')
    r('tyndareus', 'Tyndareus', '', "", ['Tyndareus', 'Tyndarus'])
    r('leda', 'Leda', '', "", ['Leda'])
    r('pollux', 'Pollux', '', "", ['Pollux'])
    r('hercules', 'Hercules', '', "", ['Hercules'])
    r('alcmena', 'Alcmena', '', "", ['Alcmena'])
    r('amphitryon', 'Amphitryon', '', "", ['Amphitryon'])
    r('megara', 'Megara', '', "", ['Megara'], loose=True)
    r('creon', 'Creon', '', "", ['Creon'])
    r('tyro', 'Tyro', '', "", ['Tyro'])
    r('salmoneus', 'Salmoneus', '', "", ['Salmoneus'])
    r('cretheus', 'Cretheus', '', "", ['Cretheus'])
    r('pelias', 'Pelias', '', "", ['Pelias'])
    r('aeson', 'Aeson', '', "", ['Aeson'])
    r('jason', 'Jason', '', "", ['Jason'])
    r('antiope', 'Antiope', '', "", ['Antiope'])
    r('zethus', 'Zethus', '', "", ['Zethus', 'Amphion'])
    r('epicaste', 'Epicaste', 'Jocasta', "", ['Epicaste'])
    r('oedipodes', 'Oedipodes', 'Oedipus', "", ['Oedipodes'])
    r('chloris', 'Chloris', '', "", ['Chloris'])
    r('periclymenus', 'Periclymenus', '', "", ['Periclymenus'])
    r('chromius', 'Chromius', '', "", ['Chromius'])
    r('iphimedeia', 'Iphimedeia', '', "", ['Iphimedeia'])
    r('otus', 'Otus', '', "", ['Otus', 'Ephialtes'])
    r('phaedra', 'Phaedra', '', "", ['Phaedra'])
    r('procris', 'Procris', '', "", ['Procris'])
    r('ariadne', 'Ariadne', '', "", ['Ariadne'])
    r('minos', 'Minos', '', "", ['Minos'])
    r('theseus', 'Theseus', '', "", ['Theseus'])
    r('pirithous', 'Pirithous', '', "", ['Pirithous'], loose=True)
    r('maera', 'Maera', '', "", ['Maera'])
    r('clymene', 'Clymene', '', "", ['Clymene'])
    r('eriphyle', 'Eriphyle', '', "", ['Eriphyle'])
    r('tityus', 'Tityus', '', "", ['Tityus'])
    r('tantalus', 'Tantalus', '', "", ['Tantalus'])
    r('sisyphus', 'Sisyphus', '', "", ['Sisyphus'])
    r('orion', 'Orion', '', "", ['Orion'], loose=True)
    r('iasion', 'Iasion', '', "", ['Iasion'], loose=True)
    r('deucalion', 'Deucalion', '', "", ['Deucalion'], loose=True)
    r('cadmus', 'Cadmus', '', "", ['Cadmus'], loose=True)
    r('eumelus', 'Eumelus', '', "", ['Eumelus'])
    r('panopeus', 'Panopeus', '', "", ['Panopeus'])

    # ---- the wanderings --------------------------------------------------
    r('eurylochus', 'Eurylochus', "Ulysses' lieutenant", "Leads the men to Circe's house and urges the killing of the Sun's cattle.", ['Eurylochus'], role='supporting')
    r('elpenor', 'Elpenor', '', "The youth who fell from Circe's roof; his shade begs for burial.", ['Elpenor'])
    r('perimedes', 'Perimedes', '', "", ['Perimedes'])
    r('polites', 'Polites', '', "", ['Polites'])
    r('maron', 'Maron', 'Priest of Apollo', "Gave Ulysses the wine that fells the Cyclops.", ['Maron', 'Euanthes'])
    r('thoosa', 'Thoosa', "Polyphemus's mother", "", ['Thoosa'])
    r('phorcys', 'Phorcys', '', "", ['Phorcys'])
    r('telemus', 'Telemus', 'Prophet', "", ['Telemus', 'Eurymus'], loose=True)
    r('antiphates', 'Antiphates', 'King of the Laestrygonians', "", ['Antiphates'])
    r('perse', 'Perse', "Circe's mother", "", ['Perse'])
    r('nausithous', 'Nausithous', "Alcinous's father", "", ['Nausithous'])
    r('rhexenor', 'Rhexenor', "Arete's father", "", ['Rhexenor'], loose=True)
    r('periboea', 'Periboea', '', "", ['Periboea'])
    r('eurymedon', 'Eurymedon', 'King of the giants', "", ['Eurymedon'], loose=True)
    r('arete', 'Arete', 'Queen of the Phaeacians', "", ['Arete'], role='supporting')
    r('laodamas', 'Laodamas', "Alcinous's son", "", ['Laodamas'])
    r('halius', 'Halius', "Alcinous's son", "", ['Halius'])
    r('clytoneus', 'Clytoneus', "Alcinous's son", "", ['Clytoneus'])
    r('euryalus', 'Euryalus', 'Phaeacian', "Taunts Ulysses and then makes amends with a sword.", ['Euryalus'])
    r('demodocus', 'Demodocus', 'The blind bard', "", ['Demodocus'], role='supporting')
    r('echeneus', 'Echeneus', 'Old Phaeacian', "", ['Echeneus'])
    r('pontonous', 'Pontonous', 'Herald', "", ['Pontonous'])
    r('dymas', 'Dymas', '', "", ['Dymas'])
    r('phaeacian-athletes', 'The Phaeacian athletes', 'Acroneos, Ocyalus, Elatreus and the rest', "", ['Acroneos', 'Ocyalus', 'Elatreus', 'Nauteus', 'Prymneus', 'Anchialus', 'Eretmeus', 'Ponteus', 'Proreus', 'Thoon', 'Anabesineus', 'Amphialus', 'Naubolus'], loose=True)
    r('ctesius', 'Ctesius', "Eumaeus's father", "", ['Ctesius'])
    r('arybas', 'Arybas', '', "", ['Arybas'])
    r('mermerus', 'Mermerus', '', "", ['Mermerus'], loose=True)
    r('ilus', 'Ilus', '', "", ['Ilus'])
    r('andraemon', 'Andraemon', '', "", ['Andraemon'])
    r('thoas', 'Thoas', '', "", ['Thoas'], loose=True)
    r('laerceus', 'Laerceus', 'Goldsmith', "", ['Laerceus'])
    r('phaedimus', 'Phaedimus', 'King of the Sidonians', "", ['Phaedimus'])


if __name__ == '__main__':
    main()
