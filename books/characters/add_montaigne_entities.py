#!/usr/bin/env python3
"""Montaigne's Essays: clickable-names pass, first sweep.

The first-generation package bound a handful of authorities with odd
spans ("Seneca, Hippolytus", "Plutarch says of those who", "La Boetie)
called it"); those junk spans are removed and the plain names bound
everywhere. Then ~230 minimal cards for the ancients Montaigne quotes,
the kings and captains of his own century, and the poets of the
epigraphs — every name that recurs, plus the well-known once-named.

Homonyms: Dion of Syracuse vs Dion Cassius (89,2); Antony vs the Antony
in Germany (26,18); "King Philip" (Philip II) vs the other Philips
(bare "Philip" left alone); St. Paul the apostle vs the town (17,2);
Guise the family vs the place (15,5).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'essays-montaigne'
P = 'person'
D = 'deity'
JUNK = {'Seneca, Hippolytus', 'Plutarch says of those who', 'Socrates answer Crito', 'Octavius and Cato', 'La Boetie) called it', 'Montaigne created the expression'}


def r(eid, name, subtitle, body, aliases, kind=P, role='reference', **kw):
    add_e(BOOK, eid, name, subtitle, body, role, kind, aliases, **kw)


def strip_junk():
    path = ROOT / f'app/public/data/characters/{BOOK}.v1.json'
    pkg = json.loads(path.read_text())
    for ek, ed in pkg['editions'].items():
        before = len(ed['mentions'])
        ed['mentions'] = [m for m in ed['mentions'] if m['text'] not in JUNK]
        print(BOOK, ek, 'removed', before - len(ed['mentions']), 'junk spans')
    path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


def main():
    strip_junk()
    add_aliases(BOOK, 'seneca-and-plutarch', ['Seneca', 'Plutarch'])
    add_aliases(BOOK, 'cato-and-roman-exemplars', ['Cato'])
    add_aliases(BOOK, 'etienne-de-la-boetie', ['Estienne de la Boetie', 'Etienne De la Boetie', 'La Boetie', 'Boetie'])
    add_aliases(BOOK, 'montaigne-himself', ['Montaigne'])
    add_aliases(BOOK, 'julius-caesar-montaigne', ['Julius Caesar'])
    add_aliases(BOOK, 'alexander-montaigne', ['Alexander the Great'])

    # splits first
    r('dion-cassius', 'Dion Cassius', 'Historian', "", ['Dion'], only_paragraphs={(89, 2)})
    r('dion', 'Dion', 'Of Syracuse', "Plato's friend.", ['Dion'], exclude_paragraphs={(89, 2)})
    r('mark-antony', 'Mark Antony', '', "", ['Mark Antony', 'Marc Antony', 'Antony'], exclude_paragraphs={(26, 18)})
    r('sextus-pompeius', 'Sextus Pompeius', '', "", ['Sextus Pompeius'])
    r('sextus-peduceus', 'Sextus Peduceus', '', "", ['Sextus Peduceus'])
    r('pompey', 'Pompey', '', "", ['Pompey'])
    r('king-philip', 'King Philip', 'Philip II of Spain', "", ['King Philip'])
    r('philip-augustus', 'Philip Augustus', '', "", ['King Philip Augustus', 'Philip Augustus'])
    r('st-paul', 'St. Paul', '', "", ['St. Paul'], exclude_paragraphs={(17, 2)})
    r('guise', 'The Duc de Guise', '', "", ['Duc de Guise', 'Monsieur de Guise', 'M. de Guise'])
    r('margaret-of-navarre', 'Margaret of Navarre', '', "", ['Queen Margaret of Navarre', 'Margaret de Valois', 'Marguerite'])

    # the ancients: philosophers
    for eid, name, al in [('zeno', 'Zeno', ['Zeno']), ('chrysippus', 'Chrysippus', ['Chrysippus']), ('aristippus', 'Aristippus', ['Aristippus']), ('protagoras', 'Protagoras', ['Protagoras']), ('speusippus', 'Speusippus', ['Speusippus']), ('thales', 'Thales', ['Thales']), ('parmenides', 'Parmenides', ['Parmenides']), ('bias', 'Bias', ['Bias']), ('strato', 'Strato', ['Strato']), ('polemon', 'Polemon', ['Polemon']), ('charondas', 'Charondas', ['Charondas']), ('arcesilaus', 'Arcesilaus', ['Arcesilaus']), ('stilpo', 'Stilpo', ['Stilpo']), ('favorinus', 'Favorinus', ['Favorinus']), ('diogenes', 'Diogenes', ['Diogenes']), ('epicurus', 'Epicurus', ['Epicurus']), ('pyrrho', 'Pyrrho', ['Pyrrho']), ('democritus', 'Democritus', ['Democritus']), ('heraclitus', 'Heraclitus', ['Heraclitus']), ('pythagoras', 'Pythagoras', ['Pythagoras']), ('solon', 'Solon', ['Solon']), ('anaxagoras', 'Anaxagoras', ['Anaxagoras']), ('empedocles', 'Empedocles', ['Empedocles']), ('antisthenes', 'Antisthenes', ['Antisthenes']), ('crates', 'Crates', ['Crates']), ('cleanthes', 'Cleanthes', ['Cleanthes']), ('posidonius', 'Posidonius', ['Posidonius']), ('carneades', 'Carneades', ['Carneades']), ('epictetus', 'Epictetus', ['Epictetus']), ('xenophon', 'Xenophon', ['Xenophon']), ('galen', 'Galen', ['Galen']), ('diogenes-laertius', 'Diogenes Laertius', ['Diogenes Laertius', 'Laertius']), ('varro', 'Varro', ['Varro']), ('lycurgus', 'Lycurgus', ['Lycurgus']), ('numa', 'Numa', ['Numa']), ('hippocrates', 'Hippocrates', ['Hippocrates']), ('archimedes', 'Archimedes', ['Archimedes']), ('theophrastus', 'Theophrastus', ['Theophrastus']), ('xenocrates', 'Xenocrates', ['Xenocrates']), ('metrodorus', 'Metrodorus', ['Metrodorus']), ('hegesias', 'Hegesias', ['Hegesias']), ('anacharsis', 'Anacharsis', ['Anacharsis'])]:
        r(eid, name, 'Philosopher', "", al, strict_editions=())
    # poets and historians
    for eid, name, al in [('virgil', 'Virgil', ['Virgil']), ('homer', 'Homer', ['Homer']), ('ovid', 'Ovid', ['Ovid']), ('livy', 'Livy', ['Livy']), ('lucan', 'Lucan', ['Lucan']), ('martial', 'Martial', ['Martial']), ('juvenal', 'Juvenal', ['Juvenal']), ('catullus', 'Catullus', ['Catullus']), ('propertius', 'Propertius', ['Propertius']), ('tibullus', 'Tibullus', ['Tibullus']), ('persius', 'Persius', ['Persius']), ('claudian', 'Claudian', ['Claudian']), ('tacitus', 'Tacitus', ['Tacitus']), ('sallust', 'Sallust', ['Sallust']), ('suetonius', 'Suetonius', ['Suetonius']), ('herodotus', 'Herodotus', ['Herodotus']), ('thucydides', 'Thucydides', ['Thucydides']), ('terence', 'Terence', ['Terence']), ('plautus', 'Plautus', ['Plautus']), ('manilius', 'Manilius', ['Manilius']), ('silius', 'Silius Italicus', ['Silius']), ('statius', 'Statius', ['Statius']), ('ennius', 'Ennius', ['Ennius']), ('pindar', 'Pindar', ['Pindar']), ('lucilius', 'Lucilius', ['Lucilius']), ('laelius', 'Laelius', ['Laelius']), ('ammianus', 'Ammianus Marcellinus', ['Ammianus Marcellinus', 'Ammianus']), ('quintus-curtius', 'Quintus Curtius', ['Quintus Curtius']), ('aulus-gellius', 'Aulus Gellius', ['Aulus Gellius']), ('valerius-maximus', 'Valerius Maximus', ['Valerius Maximus']), ('pliny', 'Pliny', ['Pliny']), ('petrarch', 'Petrarch', ['Petrarch']), ('boccaccio', 'Boccaccio', ['Boccaccio']), ('ariosto', 'Ariosto', ['Ariosto']), ('tasso', 'Tasso', ['Tasso']), ('dante', 'Dante', ['Dante']), ('erasmus', 'Erasmus', ['Erasmus']), ('machiavelli', 'Machiavelli', ['Machiavelli']), ('guicciardini', 'Guicciardini', ['Guicciardini']), ('commines', 'Commines', ['Commines']), ('froissart', 'Froissart', ['Froissart']), ('ronsard', 'Ronsard', ['Ronsard']), ('du-bellay', 'Du Bellay', ['Du Bellay']), ('amyot', 'Amyot', ['Amyot']), ('turnebus', 'Adrian Turnebus', ['Adrian Turnebus', 'Turnebus']), ('muret', 'Muret', ['Muret']), ('buchanan', 'Buchanan', ['Buchanan']), ('bodin', 'Bodin', ['Bodin']), ('sebond', 'Raymond Sebond', ['Raymond Sebond', 'Sebond']), ('calepin', 'Calepin', ['Calepin']), ('marot', 'Marot', ['Marot']), ('cotton', 'Charles Cotton', ['Cotton']), ('st-augustine', 'St. Augustine', ['St. Augustine', 'Augustine']), ('st-jerome', 'St. Jerome', ['Jerome']), ('aquinas', 'Aquinas', ['Aquinas']), ('chrysostom', 'Chrysostom', ['Chrysostom'])]:
        r(eid, name, '', "", al, strict_editions=())
    # rulers and captains
    for eid, name, al in [('augustus', 'Augustus', ['Augustus']), ('epaminondas', 'Epaminondas', ['Epaminondas']), ('cyrus', 'Cyrus', ['Cyrus']), ('brutus', 'Brutus', ['Brutus']), ('sylla', 'Sylla', ['Sylla', 'Sulla']), ('charles-v', 'Charles V', ['Charles V.', 'Emperor Charles V']), ('charles-viii', 'Charles VIII', ['Charles VIII.']), ('charles-ix', 'Charles IX', ['Charles IX.']), ('darius', 'Darius', ['Darius']), ('julian', 'The Emperor Julian', ['Emperor Julian', 'Julian']), ('crassus', 'Crassus', ['Crassus']), ('francis-i', 'Francis I', ['King Francis I.', 'King Francis', 'Francis I.']), ('metellus', 'Metellus', ['Metellus']), ('pelopidas', 'Pelopidas', ['Pelopidas']), ('lysander', 'Lysander', ['Lysander']), ('henry-ii', 'Henry II', ['Henry II.']), ('henry-vii', 'Henry VII', ['Henry VII.']), ('oppius', 'Oppius', ['Oppius']), ('poris', 'Poris', ['Poris']), ('pope-clement', 'Pope Clement', ['Pope Clement']), ('livia', 'Livia', ['Livia']), ('areteus', 'Areteus', ['Areteus']), ('agis', 'Agis', ['Agis']), ('juba', 'Juba', ['Juba']), ('themistocles', 'Themistocles', ['Themistocles']), ('hannibal', 'Hannibal', ['Hannibal']), ('scipio', 'Scipio', ['Scipio']), ('alcibiades', 'Alcibiades', ['Alcibiades']), ('pericles', 'Pericles', ['Pericles']), ('demosthenes', 'Demosthenes', ['Demosthenes']), ('nero', 'Nero', ['Nero']), ('tiberius', 'Tiberius', ['Tiberius']), ('caligula', 'Caligula', ['Caligula']), ('domitian', 'Domitian', ['Domitian']), ('vespasian', 'Vespasian', ['Vespasian']), ('trajan', 'Trajan', ['Trajan']), ('constantine', 'Constantine', ['Constantine']), ('charlemagne', 'Charlemagne', ['Charlemagne']), ('louis-xi', 'Louis XI', ['Louis XI']), ('coligny', 'Coligny', ['Coligny']), ('conde', 'Condé', ['Conde']), ('xerxes', 'Xerxes', ['Xerxes']), ('octavius', 'Octavius', ['Octavius']), ('cleopatra', 'Cleopatra', ['Cleopatra']), ('cambyses', 'Cambyses', ['Cambyses']), ('croesus', 'Croesus', ['Croesus']), ('dionysius', 'Dionysius', ['Dionysius']), ('lucretia', 'Lucretia', ['Lucretia']), ('marius', 'Marius', ['Marius']), ('marcellus', 'Marcellus', ['Marcellus']), ('fabius', 'Fabius', ['Fabius']), ('regulus', 'Regulus', ['Regulus']), ('camillus', 'Camillus', ['Camillus']), ('tamerlane', 'Tamerlane', ['Tamerlane']), ('bajazet', 'Bajazet', ['Bajazet']), ('bayard', 'Bayard', ['Bayard']), ('montluc', 'Montluc', ['Montluc']), ('montmorency', 'Montmorency', ['Montmorency', 'Constable de Montmorenci']), ('estissac', 'Madame d\'Estissac', ['Estissac']), ('gournay', 'Marie de Gournay', ['Marie de Gournay', 'Gournay']), ('aurelius', 'Marcus Aurelius', ['Aurelius']), ('theodosius', 'Theodosius', ['Theodosius']), ('heliogabalus', 'Heliogabalus', ['Heliogabalus']), ('otho', 'Otho', ['Otho']), ('vitellius', 'Vitellius', ['Vitellius']), ('galba', 'Galba', ['Galba']), ('cinna', 'Cinna', ['Cinna']), ('catiline', 'Catiline', ['Catiline']), ('pyrrhus', 'Pyrrhus', ['Pyrrhus']), ('antigonus', 'Antigonus', ['Antigonus']), ('demetrius', 'Demetrius', ['Demetrius']), ('seleucus', 'Seleucus', ['Seleucus']), ('ptolemy', 'Ptolemy', ['Ptolemy']), ('cleomenes', 'Cleomenes', ['Cleomenes']), ('agesilaus', 'Agesilaus', ['Agesilaus']), ('leonidas', 'Leonidas', ['Leonidas']), ('niger', 'Niger', ['Niger']), ('mahomet', 'Mahomet', ['Mahomet']), ('john-zisca', 'John Zisca', ['John Zisca']), ('don-john-of-austria', 'Don John of Austria', ['Don John of Austria']), ('john-of-portugal', 'John, King of Portugal', ['John, King of Portugal']), ('peter-terrail', 'Peter Terrail', ['Peter Terrail']), ('peter-bunel', 'Peter Bunel', ['Peter Bunel']), ('henry-de-vaux', 'Henry de Vaux', ['Henry de Vaux']), ('flora', 'Flora', ['Flora']), ('saint-francis', 'St. Francis', ['St. Francis']), ('jesus-christ', 'Jesus Christ', ['Jesus Christ', 'Christ'])]:
        r(eid, name, '', "", al, strict_editions=())
    # myth
    for eid, name, al in [('jupiter', 'Jupiter', ['Jupiter', 'Jove']), ('venus', 'Venus', ['Venus']), ('juno', 'Juno', ['Juno']), ('minerva', 'Minerva', ['Minerva', 'Pallas']), ('diana', 'Diana', ['Diana']), ('apollo', 'Apollo', ['Apollo']), ('mercury', 'Mercury', ['Mercury']), ('neptune', 'Neptune', ['Neptune']), ('pluto', 'Pluto', ['Pluto']), ('vulcan', 'Vulcan', ['Vulcan']), ('mars', 'Mars', ['Mars']), ('saturn', 'Saturn', ['Saturn']), ('cupid', 'Cupid', ['Cupid']), ('ceres', 'Ceres', ['Ceres']), ('bacchus', 'Bacchus', ['Bacchus'])]:
        r(eid, name, '', "", al, kind=D, strict_editions=())
    for eid, name, al in [('ulysses', 'Ulysses', ['Ulysses']), ('achilles', 'Achilles', ['Achilles']), ('hector', 'Hector', ['Hector']), ('priam', 'Priam', ['Priam']), ('ajax', 'Ajax', ['Ajax']), ('medea', 'Medea', ['Medea']), ('hippolytus', 'Hippolytus', ['Hippolytus']), ('theseus', 'Theseus', ['Theseus']), ('hercules', 'Hercules', ['Hercules']), ('prometheus', 'Prometheus', ['Prometheus']), ('orpheus', 'Orpheus', ['Orpheus']), ('narcissus', 'Narcissus', ['Narcissus']), ('midas', 'Midas', ['Midas']), ('tantalus', 'Tantalus', ['Tantalus']), ('danae', 'Danae', ['Danae'])]:
        r(eid, name, '', "", al, strict_editions=())


if __name__ == '__main__':
    main()
