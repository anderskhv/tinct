#!/usr/bin/env python3
"""Add named figures to paradise-lost. As with the-aeneid, spaCy's PERSON
scan was a poor floor for Milton's verse (it missed Uriel, Ithuriel,
Mulciber, Azazel and most of the catalogue of fallen gods in Book 1), so
this is built from a hand-checked list plus the scan. Bodies are minimal,
from first-mention context.

Aliases folded onto existing cards: Tempter, Lucifer -> satan; Jehovah ->
god-the-father; Jesus -> the-son (Messiah was already bound).
"Night" is bound only where Milton personifies her (Chaos's consort in
Books 2-3), not for ordinary nightfall. "Serpent" is its own reference
card rather than a Satan alias: in Book 9 it is Satan's borrowed form, in
Book 10 the cursed brute itself. Skipped: "Iris" (the flower), "Atlas"
(the mountain), "Angel"/"Creator"/"Muse" as generic, and the archaic
capitalised words the scan mistook for names (Hath, Thither, Forthwith).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity
from add_aliases import add_aliases
from add_histories_helpers import add_entity_excluding as add_e

BOOK = 'paradise-lost'
P = 'person'

E = [
    # angels
    ('uriel', 'Uriel', "One of the seven archangels who stand nearest God's throne, regent of the sun.", 'supporting', ['Uriel']),
    ('ithuriel', 'Ithuriel', "A strong and subtle spirit sent with Zephon to search the garden.", 'supporting', ['Ithuriel']),
    ('zephon', 'Zephon', "A strong and subtle spirit sent with Ithuriel to search the garden.", 'supporting', ['Zephon']),
    ('uzziel', 'Uzziel', "Gabriel's next in power, ordered to coast the south with strictest watch.", 'reference', ['Uzziel']),
    ('zophiel', 'Zophiel', "Of the Cherubim the swiftest wing, who brings warning of the rebels' advance.", 'reference', ['Zophiel']),
    ('ramiel', 'Ramiel', "A rebel angel overthrown by Abdiel.", 'reference', ['Ramiel']),
    ('ariel', 'Ariel', "A rebel angel overthrown by Abdiel.", 'reference', ['Ariel']),
    ('arioch', 'Arioch', "A rebel angel overthrown by Abdiel.", 'reference', ['Arioch']),
    ('asmadai', 'Asmadai', "A potent Throne among the rebels, vanquished by Raphael.", 'reference', ['Asmadai']),
    ('adramelech', 'Adramelech', "A potent Throne among the rebels, vanquished by Uriel.", 'reference', ['Adramelech']),
    ('nisroch', 'Nisroch', "Of Principalities the prime, who speaks in the rebels' council after the first day's fight.", 'reference', ['Nisroch']),
    ('azazel', 'Azazel', "A tall Cherub who claims the honour of unfurling Satan's standard.", 'reference', ['Azazel']),
    # the catalogue of fallen gods
    ('mulciber', 'Mulciber', "The architect of Pandemonium, whom Greek fable said angry Jove threw from Heaven.", 'reference', ['Mulciber']),
    ('chemos', 'Chemos', "The obscene dread of Moab's sons.", 'reference', ['Chemos']),
    ('dagon', 'Dagon', "Sea-monster, upward man and downward fish, worshipped in Philistia.", 'reference', ['Dagon']),
    ('rimmon', 'Rimmon', "The god whose seat was fair Damascus.", 'reference', ['Rimmon']),
    ('astoreth', 'Astoreth', "Whom the Phoenicians called Astarte, queen of heaven, with crescent horns.", 'reference', ['Astoreth', 'Astarte', 'Ashtaroth']),
    ('thammuz', 'Thammuz', "Whose yearly wound in Lebanon the Syrian damsels lamented.", 'reference', ['Thammuz']),
    ('osiris', 'Osiris', "Of the crew who abused fanatic Egypt with monstrous shapes.", 'reference', ['Osiris']),
    ('isis', 'Isis', "Of the crew who abused fanatic Egypt with monstrous shapes.", 'reference', ['Isis']),
    ('orus', 'Orus', "Of the crew who abused fanatic Egypt with monstrous shapes.", 'reference', ['Orus']),
    ('belus', 'Belus', "A god enshrined in Babylon's magnificence.", 'reference', ['Belus']),
    ('baalim', 'Baalim', "The general name of the male spirits worshipped from Euphrates to Egypt.", 'reference', ['Baalim']),
    ('ammon', 'Ammon', "Old Cham, whom the Gentiles called Ammon and Libyan Jove.", 'reference', ['Ammon']),
    # Chaos and its court
    ('chaos', 'Chaos', "The abyss of uncreated matter between Heaven and Hell, and its Anarch, enthroned there with Night.", 'supporting', ['Chaos']),
    ('demogorgon', 'Demogorgon', "A dreaded name in the court of Chaos.", 'reference', ['Demogorgon']),
    ('orcus', 'Orcus', "Standing by the throne of Chaos.", 'reference', ['Orcus']),
    ('rumour', 'Rumour', "Personified in the court of Chaos.", 'reference', ['Rumour']),
    ('discord', 'Discord', "With a thousand various mouths, in the court of Chaos.", 'reference', ['Discord']),
    ('the-serpent', 'the Serpent', "The infernal Serpent whose guile deceived the mother of mankind: in Eden the form Satan borrows, afterwards the cursed brute itself.", 'supporting', ['Serpent']),
    # scripture
    ('abraham', 'Abraham', "The faithful patriarch in whom all nations shall trust.", 'reference', ['Abraham']),
    ('moses', 'Moses', "Sent from God with Aaron to claim his people from enthralment.", 'reference', ['Moses']),
    ('aaron', 'Aaron', "Sent from God with Moses to claim his people.", 'reference', ['Aaron']),
    ('david', 'David', "The king of whose royal stock the promised Son shall rise.", 'reference', ['David']),
    ('solomon', 'Solomon', "The wisest heart, led by fraud to build an idol's temple.", 'reference', ['Solomon']),
    ('joshua', 'Joshua', "Whom the Gentiles Jesus call, who shall lead the people into Canaan.", 'reference', ['Joshua']),
    ('josiah', 'Josiah', "Good Josiah, who drove the idols out.", 'reference', ['Josiah']),
    ('ahaz', 'Ahaz', "The sottish king who displaced God's altar for a Syrian one.", 'reference', ['Ahaz']),
    ('jacob', 'Jacob', "Who saw angels ascending and descending when he fled from Esau.", 'reference', ['Jacob']),
    ('esau', 'Esau', "From whom Jacob fled.", 'reference', ['Esau']),
    ('isaac', 'Isaac', "Son of Abraham.", 'reference', ['Isaac']),
    ('pharaoh', 'Pharaoh', "The impious king over whose realm the locusts hung.", 'reference', ['Pharaoh']),
    ('samson', 'Samson', "The Danite strong, waked shorn of his strength.", 'reference', ['Samson']),
    ('ezekiel', 'Ezekiel', "The prophet who saw Judah's idolatries in vision.", 'reference', ['Ezekiel']),
    ('saint-peter', 'Saint Peter', "Who seems to wait at Heaven's wicket with his keys.", 'reference', ['Peter']),
    ('mary', 'Mary', "Second Eve, to whom the angel's salutation was long after used.", 'reference', ['Mary']),
    # classical
    ('jove', 'Jove', "The god the fables say was warred on by Titans.", 'reference', ['Jove']),
    ('juno', 'Juno', "On whom Jupiter smiles.", 'reference', ['Juno']),
    ('neptune', 'Neptune', "Whose ire perplexed the Greek.", 'reference', ['Neptune']),
    ('saturn', 'Saturn', "Who seized Titan's birthright and lost it to Jove.", 'reference', ['Saturn']),
    ('titan', 'Titan', "Heaven's first-born, with his enormous brood.", 'reference', ['Titan']),
    ('rhea', 'Rhea', "Jove's mother, from whose eye young Bacchus was hidden.", 'reference', ['Rhea']),
    ('ceres', 'Ceres', "Who sought Proserpine through the world.", 'reference', ['Ceres']),
    ('proserpine', 'Proserpine', "Gathering flowers in Enna, herself gathered by gloomy Dis.", 'reference', ['Proserpine']),
    ('hermes', 'Hermes', "Volatile Hermes, whom philosophers bind in vain.", 'reference', ['Hermes']),
    ('bacchus', 'Bacchus', "Young Bacchus, hidden from Rhea's eye.", 'reference', ['Bacchus']),
    ('pomona', 'Pomona', "The goddess of orchards, likened to Eve.", 'reference', ['Pomona']),
    ('vertumnus', 'Vertumnus', "From whom Pomona fled.", 'reference', ['Vertumnus']),
    ('adonis', 'Adonis', "The river that ran purple, supposed with Thammuz's blood.", 'reference', ['Adonis']),
    ('alcides', 'Alcides', "Hercules, who tore up Thessalian pines in the pain of the envenomed robe.", 'reference', ['Alcides']),
    ('argus', 'Argus', "Whose many eyes the Cherubim outnumber.", 'reference', ['Argus']),
    ('bellerophon', 'Bellerophon', "Dismounted from his flying steed to wander the Aleian field.", 'reference', ['Bellerophon']),
    ('deucalion', 'Deucalion', "Who with Pyrrha prayed to restore drowned mankind.", 'reference', ['Deucalion']),
    ('pyrrha', 'Pyrrha', "Chaste Pyrrha, who prayed with Deucalion.", 'reference', ['Pyrrha']),
    ('pandora', 'Pandora', "Endowed by the gods with all their gifts, to mankind's sorrow.", 'reference', ['Pandora']),
    ('tantalus', 'Tantalus', "From whose lip the water fled.", 'reference', ['Tantalus']),
    ('medusa', 'Medusa', "Who guards the ford of Lethe with Gorgonian terror.", 'reference', ['Medusa']),
    ('typhon', 'Typhon', "Earth-born monster that warred on Jove.", 'reference', ['Typhon']),
    ('leviathan', 'Leviathan', "The sea-beast, hugest of God's works that swim.", 'reference', ['Leviathan']),
    ('behemoth', 'Behemoth', "Biggest born of earth, upheaved from his mould at creation.", 'reference', ['Behemoth']),
    ('scylla', 'Scylla', "Vexed in the sea between Calabria and Sicily.", 'reference', ['Scylla']),
    ('charybdis', 'Charybdis', "The whirlpool Ulysses shunned.", 'reference', ['Charybdis']),
    ('achilles', 'Achilles', "Whose wrath pursued his foe about Troy's wall.", 'reference', ['Achilles']),
    ('ulysses', 'Ulysses', "Who steered between the whirlpools.", 'reference', ['Ulysses']),
    ('turnus', 'Turnus', "Whose rage for Lavinia the poem claims to surpass.", 'reference', ['Turnus']),
    ('lavinia', 'Lavinia', "For whom Turnus raged.", 'reference', ['Lavinia']),
    ('xerxes', 'Xerxes', "Who bridged the Hellespont to yoke the liberty of Greece.", 'reference', ['Xerxes']),
    ('galileo', 'Galileo', "Whose glass observes imagined lands in the moon.", 'reference', ['Galileo']),
    ('urania', 'Urania', "The heavenly Muse the poet invokes.", 'reference', ['Urania']),
    ('atabalipa', 'Atabalipa', "Whose rich seat was Cusco in Peru.", 'reference', ['Atabalipa']),
    ('montezume', 'Montezume', "Whose seat was rich Mexico.", 'reference', ['Montezume']),
    ('almansor', 'Almansor', "Whose kingdoms stretched from Niger to Atlas.", 'reference', ['Almansor']),
    ('uther', 'Uther', "Whose son, begirt with British knights, fills fable and romance.", 'reference', ['Uther']),
]

if __name__ == '__main__':
    for eid, name, body, role, aliases in E:
        add_entity(BOOK, eid, name, '', body, role, P, aliases)
    add_e(BOOK, 'night', 'Night', '', "Eldest of things, sable-vested consort of Chaos.", 'reference', P, ['Night'],
          only_paragraphs={(2, 11), (2, 76), (2, 79), (2, 80), (2, 81), (3, 2)})
    add_aliases(BOOK, 'satan', ['Tempter', 'Lucifer'])
    add_aliases(BOOK, 'god-the-father', ['Jehovah'])
    add_aliases(BOOK, 'the-son', ['Jesus'])
