#!/usr/bin/env python3
"""Add real, previously-uncarded named individuals found in the-histories
via spaCy PERSON-NER (see the clickable-names plan). Bodies are minimal,
drawn from first-mention context, per the agreed card-depth decision.
Several homonym pairs (two Aristodemoi, two Lycurgoi, two Hegesistratoi,
etc. -- Herodotus reuses names heavily) were disambiguated separately in
add_histories_helpers.py calls; this file covers the remaining
unambiguous real figures. Pure place names (Moiris, Hyllos, Melas, Doris
all used geographically here despite matching a person's name elsewhere
in Greek myth) and one deliberately skipped case (Labynetos -- the text
itself notes two Babylonian rulers shared this name, and distinguishing
them isn't safe without deeper reading) are excluded.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity

BOOK = 'the-histories'

ENTITIES = [
    ('ariston', 'Ariston', "A king of Sparta in the time of Croesus, contemporary with the Spartan victory over Tegea.", 'reference', ['Ariston']),
    ('leotychides', 'Leotychides', "A Spartan of the same royal house as Demaratos, installed as king in his place.", 'supporting', ['Leotychides']),
    ('megabazos', 'Megabazos', "A Persian left by Dareios to command the army in Europe.", 'supporting', ['Megabazos']),
    ('otanes', 'Otanes', "A Persian noble of great repute, the first to suspect that the reigning \"Smerdis\" was an impostor.", 'supporting', ['Otanes']),
    ('battos', 'Battos', "A king in the line of the founders of Kyrene.", 'reference', ['Battos']),
    ('syloson', 'Syloson', "Brother of Polycrates, driven from Samos by him and later restored to power there with Persian help.", 'supporting', ['Syloson']),
    ('hippias', 'Hippias', "The exiled despot of Athens, son of Peisistratos, who seeks to win back power.", 'supporting', ['Hippias']),
    ('kypselos', 'Kypselos', "A despot of Corinth, father of Periander.", 'reference', ['Kypselos']),
    ('adrastos', 'Adrastos', "Son of Gordias and grandson of Midas, who took refuge with Croesus after accidentally killing his own brother.", 'supporting', ['Adrastos']),
    ('onesilos', 'Onesilos', "Younger brother of Gorgos, king of Salamis in Cyprus, who leads the Cyprians in revolt from Persian rule.", 'supporting', ['Onesilos']),
    ('kyaxares', 'Kyaxares', "A Median king, descendant of Deïokes, against whom Alyattes made war.", 'reference', ['Kyaxares']),
    ('periander', 'Periander', "Son of Kypselos and despot of Corinth, a guest-friend of Thrasybulos of Miletos.", 'supporting', ['Periander']),
    ('psammetichos', 'Psammetichos', "A king of Egypt who turns back an invading force by gifts and entreaties.", 'reference', ['Psammetichos']),
    ('eurybiades', 'Eurybiades', "The Spartan commander given supreme command of the allied Hellenic fleet.", 'supporting', ['Eurybiades']),
    ('hystaspes', 'Hystaspes', "Father of Dareios.", 'reference', ['Hystaspes']),
    ('atossa', 'Atossa', "Daughter of Cyrus and wife of Dareios.", 'supporting', ['Atossa']),
    ('tomyris', 'Tomyris', "Queen of the Massagetai after her husband's death, whom Cyrus unsuccessfully sought to marry.", 'supporting', ['Tomyris']),
    ('skyles', 'Skyles', "A king of the Scythians who adopted Greek customs, ultimately killed by his own people for it.", 'supporting', ['Skyles']),
    ('cleombrotos', 'Cleombrotos', "Father of Pausanias, the Spartan regent.", 'reference', ['Cleombrotos']),
    ('theras', 'Theras', "A descendant of Cadmos who served as guardian to the sons of Aristodemos and later led a settlement from Lacedemon.", 'supporting', ['Theras']),
    ('epialtes', 'Epialtes', "A Malian who shows the Persians the mountain path around Thermopylai, betraying the Hellenes defending it.", 'supporting', ['Epialtes']),
    ('alyattes', 'Alyattes', "A Lydian king, father of Croesus, who made war against the Medes.", 'supporting', ['Alyattes']),
    ('rhodopis', 'Rhodopis', "A courtesan wrongly credited by some Hellenes with building one of the pyramids.", 'reference', ['Rhodopis']),
    ('callias', 'Callias', "A diviner of Elis, of the descendants of Iamos, who helps the Crotoniates against the Sybarites.", 'reference', ['Callias']),
    ('sesostris', 'Sesostris', "An Egyptian king said to have set out with ships of war and subdued peoples along the Red Sea coast.", 'reference', ['Sesostris']),
    ('proteus', 'Proteus', "A king of Memphis who succeeded to the Egyptian throne, for whom a sacred enclosure stands at Memphis.", 'reference', ['Proteus']),
    ('melissa', 'Melissa', "Periander's wife.", 'reference', ['Melissa']),
    ('sitalkes', 'Sitalkes', "A Thracian king who marches against the Scythians.", 'reference', ['Sitalkes']),
    ('isagoras', 'Isagoras', "An Athenian of a highly reputed family, rival to Cleisthenes for power in Athens.", 'supporting', ['Isagoras']),
    ('pactyas', 'Pactyas', "A Lydian entrusted with Croesus's gold, who later revolts.", 'supporting', ['Pactyas']),
    ('achaimenes', 'Achaimenes', "A son of Dareios, killed by Inaros the Libyan.", 'reference', ['Achaimenes']),
    ('ariapeithes', 'Ariapeithes', "A Scythian king, father of Skyles and Octamasades.", 'reference', ['Ariapeithes']),
    ('octamasades', 'Octamasades', "A Scythian king, half-brother and rival of Skyles.", 'supporting', ['Octamasades']),
    ('salmoxis', 'Salmoxis', "A divinity of the Getai, to whom the dead are believed to go, and to whom a messenger is periodically sent.", 'reference', ['Salmoxis']),
    ('megabates', 'Megabates', "A Persian of the Achaimenidai, cousin to Dareios, appointed commander of an expedition.", 'reference', ['Megabates']),
    ('melanippos', 'Melanippos', "A hero whose cult Cleisthenes of Sikyon introduces to displace the honors paid to Adrastos.", 'reference', ['Melanippos']),
    ('cleander', 'Cleander', "A prophet from Arcadia who persuades slaves to attack their masters at Tiryns.", 'reference', ['Cleander']),
    ('hermotimos', 'Hermotimos', "A eunuch of Pedasa, second to none in the king's estimation, placed in charge of the king's sons.", 'supporting', ['Hermotimos']),
    ('alcaios', 'Alcaios', "A legendary ancestor of the Lydian royal line, son of Heracles.", 'reference', ['Alcaios']),
    ('gordias', 'Gordias', "King of Phrygia, father of Midas.", 'reference', ['Gordias']),
    ('sadyattes', 'Sadyattes', "A Lydian king, father of Alyattes.", 'reference', ['Sadyattes']),
    ('bias', 'Bias', "A sage of Priene who advises Croesus against building ships to attack the islanders.", 'reference', ['Bias']),
    ('leon', 'Leon', "A king of Sparta, in whose reign the Lacedemonians finally prevailed over Tegea.", 'reference', ['Leon']),
    ('mandane', 'Mandane', "Daughter of Astyages, whose son is Cyrus.", 'supporting', ['Mandane']),
    ('mazares', 'Mazares', "A Mede whom Cyrus charges to proclaim terms to the Lydians and pursue Pactyas.", 'reference', ['Mazares']),
    ('megabyzos', 'Megabyzos', "One of the seven Persians who slew the Magian usurper.", 'supporting', ['Megabyzos']),
    ('zopyros', 'Zopyros', "Son of Megabyzos, to whom a strange prodigy occurs during the siege of Babylon.", 'supporting', ['Zopyros']),
    ('stesagoras', 'Stesagoras', "Miltiades the Elder's nephew, who inherits his rule of the Chersonese and dies without a son.", 'supporting', ['Stesagoras']),
    ('zeuxidemos', 'Zeuxidemos', "Son of Leotychides, who died before his father, never becoming king.", 'reference', ['Zeuxidemos']),
    ('nicodromos', 'Nicodromos', "A man of repute in Egina who conspires with the Athenians against his own countrymen.", 'reference', ['Nicodromos']),
    ('callimachos', 'Callimachos', "The Athenian polemarch at Marathon, persuaded by Miltiades to give battle.", 'supporting', ['Callimachos']),
    ('agariste', 'Agariste', "Daughter of Cleisthenes of Sicyon, sought in marriage by suitors from across Hellas.", 'supporting', ['Agariste']),
    ('amestris', 'Amestris', "Wife of Xerxes.", 'supporting', ['Amestris']),
    ('timoxeinos', 'Timoxeinos', "Commander of the troops from Skione, who conspires to betray Potidaia by treachery.", 'reference', ['Timoxeinos']),
    ('midas', 'Midas', "A king of Phrygia, son of Gordias, who dedicated his royal throne as an offering at Delphi.", 'reference', ['Midas']),
    ('tellos', 'Tellos', "An Athenian whom Solon names as the happiest of men he has known.", 'reference', ['Tellos']),
    ('deiokes', 'Deïokes', "A Median ruler, ancestor referenced in the line of Kyaxares.", 'reference', ['Deïokes']),
    ('artembares', 'Artembares', "A man of repute among the Medes whose son is roughly treated by the young Cyrus in a game.", 'reference', ['Artembares']),
    ('mykerinos', 'Mykerinos', "A king of Egypt, son of Cheops, who reopens the temples and frees the people from their burdens.", 'reference', ['Mykerinos']),
    ('ladike', 'Ladike', "Wife of Amasis, king of Egypt.", 'reference', ['Ladike']),
    ('psammenitos', 'Psammenitos', "Son of Amasis, king of Egypt when Cambyses invades.", 'supporting', ['Psammenitos']),
    ('mitrobates', 'Mitrobates', "A Persian ruler of the province of Daskyleion, whose rivalry with Oroites leads to his death.", 'reference', ['Mitrobates']),
    ('idanthyrsos', 'Idanthyrsos', "A king of the Scythians.", 'reference', ['Idanthyrsos']),
    ('badres', 'Badres', "A Persian appointed to command the fleet sent against Barca.", 'reference', ['Badres']),
    ('artoxerxes', 'Artoxerxes', "Son of Xerxes, one of three successive Persian kings named in a chain of Persian rulers.", 'reference', ['Artoxerxes']),
    ('ariphron', 'Ariphron', "Father of Xanthippos, and so grandfather of Pericles.", 'reference', ['Ariphron']),
    ('timo', 'Timo', "A Parian under-priestess of the Earth goddesses who counsels Miltiades.", 'reference', ['Timo']),
    ('kepheus', 'Kepheus', "Son of Belos, whose daughter Andromeda is taken to wife by Perseus.", 'reference', ['Kepheus']),
    ('tigranes', 'Tigranes', "An Achaimenid who commands the Medes in Xerxes' army.", 'reference', ['Tigranes']),
    ('masistios', 'Masistios', "The commander of the Persian cavalry, killed before Plataea.", 'supporting', ['Masistios']),
    ('sperthias', 'Sperthias', "A Spartan of noble birth who volunteers, with Bulis, to be put to death by Xerxes to atone for the killing of Persian heralds.", 'supporting', ['Sperthias']),
    ('terillos', 'Terillos', "The despot of Himera, driven out by Theron, who brings an army of Carthage's allies into Sicily.", 'reference', ['Terillos']),
    ('leontiades', 'Leontiades', "Commander of the Thebans at Thermopylai, held on suspicion of favoring the Persians.", 'reference', ['Leontiades']),
    ('megistias', 'Megistias', "The soothsayer at Thermopylai who foretells the Hellenes' coming death and chooses to stay with them.", 'supporting', ['Megistias']),
    ('sikinnos', 'Sikinnos', "A servant of Themistocles and tutor to his children, sent to mislead the Persians before Salamis.", 'supporting', ['Sikinnos']),
    ('mys', 'Mys', "A man of Europos sent by Mardonios to consult the oracles.", 'reference', ['Mys']),
    ('amonpharetos', 'Amonpharetos', "A Lacedemonian commander who at first refuses to retreat with the rest of the army before Plataea.", 'reference', ['Amonpharetos']),
    ('deiphonos', 'Deïphonos', "Son of Euenios of Apollonia, diviner for the Hellenes before Mykale.", 'reference', ['Deïphonos']),
    ('xeinagoras', 'Xeinagoras', "A man of Halicarnassos who intervenes to save Masistes from an attack.", 'reference', ['Xeinagoras']),
    ('masistes', 'Masistes', "Son of Dareios and Atossa, and brother of Xerxes.", 'supporting', ['Masistes']),
    ('tyndareus', 'Tyndareus', "Father of Helen, in the mythical genealogy Herodotus references at Memphis.", 'reference', ['Tyndareus']),
]

if __name__ == '__main__':
    for eid, name, body, role, aliases in ENTITIES:
        add_entity(BOOK, eid, name, '', body, role, 'person', aliases)
