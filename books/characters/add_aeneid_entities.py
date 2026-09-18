#!/usr/bin/env python3
"""Add named individuals to the-aeneid (Dryden's translation). Built from
TWO lists: the spaCy PERSON scan, and a hand-checked list of names the
scan missed entirely -- in Dryden's verse spaCy skipped Achates (18),
Neptune (22), Apollo (16), Messapus (21), Euryalus (16), Achilles (15) and
dozens more. Bodies are minimal, from first-mention context.

Epithets folded onto one card: Phoebus -> Apollo, Alcides -> Hercules,
Cynthia -> Diana, Cyllenius -> Mercury, Diomede/Diomedes; Saturnia is Juno
(alias on the existing card); Iulus was already bound to Ascanius.
Skipped: "Abas" (two different Abases, Books 1 and 10), "Atlas" (Titan
and mountain interchangeably), "Mantuan" (an adjective here), the Harpies
and Cyclops as groups, and Dryden's archaic capitalised words the scan
mistook for names (Heav'n, Thro, Thrice, Swoln...).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity
from add_aliases import add_aliases

BOOK = 'the-aeneid'
P = 'person'

E = [
    # Trojans and their allies
    ('achates', 'Achates', "Aeneas's faithful companion.", 'supporting', ['Achates']),
    ('priam', 'Priam', "King of Troy, whom Aeneas finds pictured among the Trojan war's leaders in Carthage.", 'supporting', ['Priam']),
    ('hector', 'Hector', "The noblest of the Trojan dead, by whose side Aeneas wishes he had fallen.", 'supporting', ['Hector']),
    ('cassandra', 'Cassandra', "The Trojan prophetess who foretold the city's fate and was believed by none.", 'reference', ['Cassandra']),
    ('ilioneus', 'Ilioneus', "Captain of one of the Trojan ships in the storm.", 'supporting', ['Ilioneus']),
    ('cloanthus', 'Cloanthus', "One of Aeneas's captains, found alive after the storm.", 'reference', ['Cloanthus']),
    ('sergesthus', 'Sergesthus', "Captain of the Centaur in the ship race, founder of the Sergian line.", 'reference', ['Sergesthus', 'Sergestus']),
    ('antheus', 'Antheus', "One of Aeneas's captains, sought after the storm.", 'reference', ['Antheus']),
    ('capys', 'Capys', "One of Aeneas's captains.", 'reference', ['Capys']),
    ('alethes', 'Alethes', "An old Trojan aboard the ships in the storm.", 'reference', ['Alethes']),
    ('orontes', 'Orontes', "A Trojan captain lost in the storm.", 'reference', ['Orontes']),
    ('gyas', 'Gyas', "One of Aeneas's captains, feared lost in the storm.", 'reference', ['Gyas']),
    ('lycus', 'Lycus', "One of Aeneas's captains, feared lost in the storm.", 'reference', ['Lycus']),
    ('amycus', 'Amycus', "One of Aeneas's captains, feared lost in the storm.", 'reference', ['Amycus']),
    ('pantheus', 'Pantheus', "Apollo's priest, who flees the burning of Troy carrying its relics.", 'reference', ['Pantheus']),
    ('coroebus', 'Coroebus', "A young warrior who joins Aeneas on Troy's last night, drawn by love of Cassandra.", 'reference', ['Coroebus']),
    ('ripheus', 'Ripheus', "A Trojan renowned for valour, fighting beside Aeneas on Troy's last night.", 'reference', ['Ripheus']),
    ('dymas', 'Dymas', "A Trojan who joins Aeneas's band on Troy's last night.", 'reference', ['Dymas']),
    ('hypanis', 'Hypanis', "A Trojan who joins Aeneas's band on Troy's last night.", 'reference', ['Hypanis']),
    ('deiphobus', 'Deiphobus', "A Trojan prince whose palace is among the first to burn.", 'reference', ['Deiphobus']),
    ('ucalegon', 'Ucalegon', "A Trojan whose house burns next to Deiphobus's.", 'reference', ['Ucalegon']),
    ('laocoon', 'Laocoon', "The priest who warns the Trojans against the wooden horse.", 'supporting', ['Laocoon']),
    ('sarpedon', 'Sarpedon', "A hero fallen in the Trojan war, recalled by Aeneas in the storm.", 'reference', ['Sarpedon']),
    ('helenus', 'Helenus', "Priam's son, who survived to reign in Greece.", 'supporting', ['Helenus']),
    ('andromache', 'Andromache', "Hector's widow, restored to a Trojan husband.", 'reference', ['Andromache']),
    ('misenus', 'Misenus', "The trumpeter who sounds the charge against the Harpies.", 'reference', ['Misenus']),
    ('palinurus', 'Palinurus', "Aeneas's helmsman.", 'supporting', ['Palinurus']),
    ('acestes', 'Acestes', "Trojan-descended king in Sicily, host of Aeneas's fleet.", 'supporting', ['Acestes']),
    ('entellus', 'Entellus', "An aged Sicilian champion roused to the boxing match.", 'supporting', ['Entellus']),
    ('dares', 'Dares', "A haughty Trojan boxer who claims the prize unchallenged.", 'supporting', ['Dares']),
    ('eryx', 'Eryx', "A Sicilian boxer and hero, whose gauntlets Entellus bears; the mountain nearby carries his name.", 'reference', ['Eryx']),
    ('nisus', 'Nisus', "A Trojan runner renowned for his friendship to Euryalus.", 'supporting', ['Nisus']),
    ('euryalus', 'Euryalus', "A boy of blooming years, Nisus's beloved friend.", 'supporting', ['Euryalus']),
    ('helymus', 'Helymus', "A Sicilian who joins the funeral games.", 'reference', ['Helymus']),
    ('diores', 'Diores', "A runner of Priam's line in the foot race.", 'reference', ['Diores']),
    ('salius', 'Salius', "A runner in the foot race, tripped by Nisus.", 'reference', ['Salius']),
    ('demoleus', 'Demoleus', "A Greek from whom Aeneas stripped a coat of mail in single combat.", 'reference', ['Demoleus']),
    ('hippocoon', 'Hippocoon', "First drawn to shoot in the archery contest.", 'reference', ['Hippocoon']),
    ('eurytion', 'Eurytion', "An archer in the contest, brother of Pandarus.", 'reference', ['Eurytion']),
    ('pandarus', 'Pandarus', "The Trojan archer, brother of Eurytion.", 'reference', ['Pandarus']),
    ('menoetes', 'Menoetes', "Gyas's over-cautious helmsman in the ship race.", 'reference', ['Menoetes']),
    ('beroe', 'Beroe', "An aged Trojan matron whose form a goddess takes among the women.", 'reference', ['Beroe']),
    ('nautes', 'Nautes', "An old and wise Trojan who counsels Aeneas.", 'reference', ['Nautes']),
    ('achaemenides', 'Achaemenides', "A Greek left behind by Ulysses in the Cyclops's land, rescued by the Trojans.", 'reference', ['Achaemenides']),
    ('silvius', 'Silvius', "Aeneas's last-begotten son, shown among his descendants.", 'reference', ['Silvius']),
    ('dardanus', 'Dardanus', "Ancestor of the Trojans, born in Italy.", 'reference', ['Dardanus']),
    ('glaucus', 'Glaucus', "A Trojan chief seen among the battle-slain in the underworld.", 'reference', ['Glaucus']),
    ('idaeus', 'Idaeus', "Priam's charioteer, seen among the dead.", 'reference', ['Idaeus']),
    ('medon', 'Medon', "A Trojan chief seen among the dead.", 'reference', ['Medon']),
    ('iapis', 'Iapis', "The physician who tends Aeneas's wound.", 'reference', ['Iapis']),
    # Carthage
    ('anna', 'Anna', "Dido's sister and confidante.", 'supporting', ['Anna']),
    ('sichaeus', 'Sichaeus', "Dido's murdered husband.", 'supporting', ['Sichaeus']),
    # Italians
    ('amata', 'Amata', "Queen of Latium, fired with disdain at Turnus being set aside.", 'supporting', ['Amata']),
    ('lausus', 'Lausus', "Mezentius's son, second only to Turnus in grace and bearing.", 'supporting', ['Lausus']),
    ('messapus', 'Messapus', "A sea-born Italian chief in Turnus's cause.", 'supporting', ['Messapus']),
    ('ufens', 'Ufens', "A warlike chief leading mountain troops for Turnus.", 'reference', ['Ufens']),
    ('drances', 'Drances', "A Latin whose animosity with Turnus flares in council.", 'supporting', ['Drances']),
    ('juturna', 'Juturna', "A nymph who warns Turnus of Lausus's danger.", 'supporting', ['Juturna']),
    ('volscens', 'Volscens', "Leader of a troop of Latin horse.", 'reference', ['Volscens']),
    ('tarchon', 'Tarchon', "The Tuscan chief who offers Evander his crown.", 'supporting', ['Tarchon']),
    ('tyrrheus', 'Tyrrheus', "Chief ranger to the Latin king, whose children reared the stag.", 'reference', ['Tyrrheus']),
    ('silvia', 'Silvia', "Tyrrheus's daughter, who tended the tame stag.", 'reference', ['Silvia']),
    ('virbius', 'Virbius', "A warrior reared by Diana's altars, of the line of Hippolytus.", 'reference', ['Virbius']),
    ('aruns', 'Aruns', "An Etruscan who stalks the Volscian maid in battle.", 'reference', ['Aruns']),
    ('opis', 'Opis', "Diana's swift and trusted nymph.", 'reference', ['Opis']),
    ('metabus', 'Metabus', "Camilla's father, driven from Privernum.", 'reference', ['Metabus']),
    ('tolumnius', 'Tolumnius', "An augur on the Italian side.", 'reference', ['Tolumnius']),
    ('camers', 'Camers', "A yellow-locked warrior chased by Aeneas.", 'reference', ['Camers']),
    ('numa', 'Numa', "A strong warrior chased by Aeneas beside Camers.", 'reference', ['Numa']),
    ('numanus', 'Numanus', "Turnus's brother-in-law, slain by Ascanius's arrow.", 'reference', ['Numanus']),
    ('theron', 'Theron', "A giant Italian warrior, first to fall to Aeneas.", 'reference', ['Theron']),
    ('mimas', 'Mimas', "A Trojan born the night Paris was, slain in battle.", 'reference', ['Mimas']),
    ('aconteus', 'Aconteus', "A horseman who meets Tyrrhenus head-on in the cavalry fight.", 'reference', ['Aconteus']),
    ('atinas', 'Atinas', "A Latin captain beside Messapus.", 'reference', ['Atinas']),
    ('faunus', 'Faunus', "Latinus's father.", 'reference', ['Faunus']),
    ('picus', 'Picus', "Faunus's father, descended from Saturn.", 'reference', ['Picus']),
    ('marica', 'Marica', "Latinus's mother, a Laurentian dame.", 'reference', ['Marica']),
    ('cacus', 'Cacus', "A monster, more than half a beast, slain by Hercules.", 'reference', ['Cacus']),
    # Greeks
    ('ulysses', 'Ulysses', "The stern Greek whose stratagems took Troy.", 'supporting', ['Ulysses']),
    ('achilles', 'Achilles', "The fierce Greek hero who defied both kings.", 'reference', ['Achilles']),
    ('agamemnon', 'Agamemnon', "Leader of the Greeks, pictured in Carthage.", 'reference', ['Agamemnon']),
    ('menelaus', 'Menelaus', "The injured Greek king, among those hidden in the horse.", 'reference', ['Menelaus']),
    ('pyrrhus', 'Pyrrhus', "Achilles's son, among those who burst from the horse.", 'supporting', ['Pyrrhus']),
    ('sinon', 'Sinon', "The Greek whose treachery brought the horse into Troy.", 'supporting', ['Sinon']),
    ('sthenelus', 'Sthenelus', "A guide of the Greeks hidden in the horse.", 'reference', ['Sthenelus']),
    ('thoas', 'Thoas', "A Greek hidden in the horse.", 'reference', ['Thoas']),
    ('epeus', 'Epeus', "Framer of the wooden horse.", 'reference', ['Epeus']),
    ('diomede', 'Diomede', "The Greek whose sword slew the sentries by night.", 'reference', ['Diomede', 'Diomedes', 'Tydides']),
    ('idomeneus', 'Idomeneus', "A Cretan king rumoured expelled from his land.", 'reference', ['Idomeneus']),
    ('helen', 'Helen', "The Spartan queen whose flight ruined Troy.", 'reference', ['Helen']),
    ('paris', 'Paris', "The Trojan whose judgement earned Juno's lasting hate.", 'reference', ['Paris']),
    # gods and the divine
    ('neptune', 'Neptune', "God of the sea, who drives off the winds and calms the storm.", 'supporting', ['Neptune']),
    ('aeolus', 'Aeolus', "Keeper of the winds, who raises the storm at Juno's request.", 'supporting', ['Aeolus']),
    ('mercury', 'Mercury', "Jove's messenger, sent to open Carthage to the Trojans.", 'supporting', ['Mercury', 'Cyllenius']),
    ('apollo', 'Apollo', "The god of prophecy, also called Phoebus.", 'supporting', ['Apollo', 'Phoebus']),
    ('diana', 'Diana', "The chaste goddess of the hunt, also called Cynthia.", 'reference', ['Diana', 'Cynthia']),
    ('minerva', 'Minerva', "The goddess by whose aid the Greeks reared the horse.", 'reference', ['Minerva']),
    ('vulcan', 'Vulcan', "The fire-god.", 'reference', ['Vulcan']),
    ('mars', 'Mars', "The war-god.", 'reference', ['Mars']),
    ('saturn', 'Saturn', "The god who ruled the realm of old.", 'reference', ['Saturn']),
    ('vesta', 'Vesta', "The goddess of the hearth, whose relics Aeneas carries from Troy.", 'reference', ['Vesta']),
    ('cupid', 'Cupid', "Venus's son, who takes Ascanius's shape.", 'reference', ['Cupid']),
    ('iris', 'Iris', "Juno's messenger, sent to release Dido from her death-agony.", 'reference', ['Iris']),
    ('bellona', 'Bellona', "The war-goddess.", 'reference', ['Bellona']),
    ('hymen', 'Hymen', "The god of marriage.", 'reference', ['Hymen']),
    ('latona', 'Latona', "Diana's mother.", 'reference', ['Latona']),
    ('cybele', 'Cybele', "The mother of the gods.", 'reference', ['Cybele']),
    ('alecto', 'Alecto', "A Fury sent by Juno to break the treaty.", 'supporting', ['Alecto', 'Allecto']),
    ('tisiphone', 'Tisiphone', "The Fury who keeps the ward of the tower of steel.", 'reference', ['Tisiphone']),
    ('pluto', 'Pluto', "Lord of the underworld.", 'reference', ['Pluto']),
    ('proserpine', 'Proserpine', "Queen of the underworld.", 'reference', ['Proserpine']),
    ('charon', 'Charon', "The sordid god who ferries the dead.", 'reference', ['Charon']),
    ('cerberus', 'Cerberus', "The hound of the underworld.", 'reference', ['Cerberus']),
    ('hercules', 'Hercules', "The hero, also called Alcides.", 'reference', ['Hercules', 'Alcides']),
    ('fame', 'Fame', "Rumour personified, the great ill that grows from small beginnings.", 'reference', ['Fame']),
    ('scylla', 'Scylla', "The monster whose rocks the Trojans have tried.", 'reference', ['Scylla']),
    ('charybdis', 'Charybdis', "The whirlpool that sucks the tides.", 'reference', ['Charybdis']),
    ('celaeno', 'Celaeno', "The Harpy who delivers a dismal prophecy.", 'reference', ['Celaeno']),
    ('typhoeus', 'Typhoeus', "A giant no terror to Hercules.", 'reference', ['Typhoeus']),
    ('hydra', 'Hydra', "The many-headed monster at the underworld's door.", 'reference', ['Hydra']),
    ('theseus', 'Theseus', "The hero who conquered the monster of the labyrinth.", 'reference', ['Theseus']),
    ('orpheus', 'Orpheus', "The lyre-player who moved the ruthless king below.", 'reference', ['Orpheus']),
    ('musaeus', 'Musaeus', "A divine bard among the happy souls.", 'reference', ['Musaeus']),
    ('salmoneus', 'Salmoneus', "Punished for emulating Jove's thunder.", 'reference', ['Salmoneus']),
    ('aegaeon', 'Aegaeon', "The giant who stood in arms against Jove.", 'reference', ['Aegaeon']),
    # Rome foretold
    ('romulus', 'Romulus', "Founder of Rome, foretold.", 'reference', ['Romulus']),
    ('caesar', 'Caesar', "Of the Julian line, whose empire is foretold.", 'reference', ['Caesar']),
    ('augustus', 'Augustus', "Long foretold, sent to restore an age of gold.", 'reference', ['Augustus']),
    ('marcellus', 'Marcellus', "Shown among Rome's future heroes.", 'reference', ['Marcellus']),
    ('tullus', 'Tullus', "A future king of Rome, prone to martial deeds.", 'reference', ['Tullus']),
    ('ancus', 'Ancus', "A future king of Rome, proudly popular.", 'reference', ['Ancus']),
    ('tarquin', 'Tarquin', "The line of kings driven out by Brutus.", 'reference', ['Tarquin']),
    ('brutus', 'Brutus', "Who drew the avenging sword and restored Rome.", 'reference', ['Brutus']),
    ('cato', 'Cato', "Renowned for gravity among Rome's future great.", 'reference', ['Cato']),
]

if __name__ == '__main__':
    for eid, name, body, role, aliases in E:
        add_entity(BOOK, eid, name, '', body, role, P, aliases)
    add_aliases(BOOK, 'juno', ['Saturnia'])
