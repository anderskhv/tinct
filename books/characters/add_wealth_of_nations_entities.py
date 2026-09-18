#!/usr/bin/env python3
"""Wealth of Nations: clickable-names pass.

The package had only concept cards; every person Smith names gets a
minimal card: the monarchs whose statutes he cites (bound under their
regnal forms — "Elizabeth", "Charles II", "William III", "queen Anne",
"George III"...), the authorities (Hume, Locke, Montesquieu, Quesnai,
Decker, Child, Davenant, Fleetwood, Burn, Ulloa, Columella, Pliny...),
and the historical figures (Columbus, Marco Polo, Gustavus Vasa,
Charlemagne, Philip of Macedon, Servius Tullius).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e

BOOK = 'wealth-of-nations'
P = 'person'


def r(eid, name, subtitle, body, aliases, **kw):
    kw.setdefault('strict_editions', ())
    add_e(BOOK, eid, name, subtitle, body, 'reference', P, aliases, **kw)


def main():
    # monarchs (regnal forms first so bare names do not swallow them)
    r('william-the-conqueror', 'William the Conqueror', '', "", ['William the Conqueror'])
    r('william-iii', 'William III', 'King', "", ['William III.', 'William III', 'King William', 'William and Mary'])
    r('queen-mary', 'Mary', 'Queen', "", ['Philip and Mary'])
    r('elizabeth-i', 'Elizabeth', 'Queen', "Whose statutes — the 5th of Elizabeth above all — Smith cites.", ['Queen Elizabeth', 'Elizabeth'])
    r('queen-anne', 'Anne', 'Queen', "", ['Queen Anne', 'queen Anne', 'Anne'])
    r('charles-i', 'Charles I', 'King', "", ['Charles I.'])
    r('charles-ii', 'Charles II', 'King', "", ['Charles II.', 'Charles II'])
    r('charles-v', 'Charles V', 'Emperor', "", ['Charles V.'])
    r('charles-viii', 'Charles VIII', 'Of France', "", ['Charles VIII.'])
    r('charles-ix', 'Charles IX', 'Of France', "", ['Charles IX.'])
    r('james-i', 'James I', 'King', "", ['James I.', 'James I'])
    r('james-ii', 'James II', 'King', "", ['James II.', 'James II'])
    r('george-i', 'George I', 'King', "", ['George I.', 'George I'])
    r('george-ii', 'George II', 'King', "", ['George II.', 'George II'])
    r('george-iii', 'George III', 'King', "", ['George III.', 'George III'])
    r('edward-i', 'Edward I', 'King', "", ['Edward I.', 'Edward I'])
    r('edward-iii', 'Edward III', 'King', "", ['Edward III.', 'Edward III'])
    r('edward-iv', 'Edward IV', 'King', "", ['Edward IV.', 'Edward IV'])
    r('edward-vi', 'Edward VI', 'King', "", ['Edward VI.', 'Edward VI'])
    r('henry-ii', 'Henry II', 'King', "", ['Henry II.', 'Henry II'])
    r('henry-iii', 'Henry III', 'King', "", ['Henry III.', 'Henry III'])
    r('henry-iv', 'Henry IV', '', "", ['Henry IV.', 'Henry IV'])
    r('henry-vii', 'Henry VII', 'King', "", ['Henry VII.', 'Henry VII'])
    r('henry-viii', 'Henry VIII', 'King', "", ['Henry the VIII.', 'Henry VIII.', 'Henry VIII'])
    r('richard-ii', 'Richard II', 'King', "", ['Richard II.', 'Richard II'])
    r('king-john', 'King John', '', "", ['King John of England', 'King John', 'king John'])
    r('prince-henry', 'Prince Henry', "James I's son", "Whose household accounts fix the price of beef in 1612.", ['Prince Henry'])
    r('philip-of-macedon', 'Philip of Macedon', '', "", ['Philip of Macedon'])
    r('philip-i-of-france', 'Philip I of France', '', "", ['Philip I.'])
    r('alexander-the-great', 'Alexander', 'The Great', "", ['Alexander'], only_paragraphs={(10, 94), (27, 9)})
    r('alexander-i-of-scotland', 'Alexander the First', 'Of Scotland', "", ['Alexander the First'])
    r('alexander-iii-pope', 'Alexander III', 'Pope', "", ['Alexander III.'])
    r('robert-bruce', 'Robert Bruce', '', "", ['Robert Bruce'])
    r('charlemagne', 'Charlemagne', '', "", ['Charlemagne'])
    r('gustavus-vasa', 'Gustavus Vasa', '', "", ['Gustavus Vasa'])
    r('peter-the-great', 'Peter the Great', '', "", ['Peter the Great'])
    r('servius-tullius', 'Servius Tullius', '', "", ['Servius Tullius'])
    r('julius-caesar', 'Julius Caesar', '', "", ['Julius Caesar', 'Caesar'])
    r('augustus', 'Augustus', '', "", ['Augustus'])
    r('cromwell', 'Cromwell', '', "", ['Cromwell'])
    r('thomas-becket', 'Thomas Becket', '', "", ['Thomas Becket'])
    r('columbus', 'Columbus', '', "", ['Columbus'])
    r('marco-polo', 'Marco Polo', '', "", ['Marco Polo'])
    r('pizarro', 'Pizarro', '', "", ['Pizarro'])
    r('raleigh', 'Sir Walter Raleigh', '', "", ['Waiter Raleigh', 'Walter Raleigh', 'Raleigh'])
    r('mahomet', 'Mahomet', '', "", ['Mahomet'])
    r('luther', 'Luther', '', "", ['Luther'])
    r('calvin', 'Calvin', '', "", ['Calvin'])
    r('abraham', 'Abraham', '', "", ['Abraham'])
    r('solomon', 'Solomon', '', "", ['Solomon'])
    # authorities
    r('hume', 'Mr Hume', 'David Hume', "", ['Mr Hume', 'Hume'])
    r('locke', 'Mr Locke', 'John Locke', "", ['Mr Locke', 'Locke'])
    r('montesquieu', 'Montesquieu', '', "", ['Mr Montesquieu', 'Montesquieu'])
    r('quesnai', 'Quesnai', 'Physiocrat', "", ['Quesnai', 'Quesnay'])
    r('mirabeau', 'Mirabeau', '', "", ['Mirabeau'])
    r('voltaire', 'Voltaire', '', "", ['Voltaire'])
    r('hobbes', 'Hobbes', '', "", ['Hobbes'])
    r('machiavel', 'Machiavel', '', "", ['Machiavel'])
    r('colbert', 'Colbert', '', "", ['Colbert'])
    r('mr-law', 'Mr Law', 'John Law', "The Mississippi scheme.", ['Mr Law'])
    r('matthew-decker', 'Sir Matthew Decker', '', "", ['Sir Matthew Decker', 'Matthew Decker', 'Decker'])
    r('josiah-child', 'Sir Josiah Child', '', "", ['Sir Josiah Child', 'Josiah Child'])
    r('davenant', 'Dr Davenant', '', "", ['Dr Davenant', 'Davenant'])
    r('fleetwood', 'Bishop Fleetwood', 'Chronicon Preciosum', "", ['Bishop Fleetwood', 'Fleetwood'])
    r('dr-burn', 'Doctor Burn', 'History of the Poor Laws', "", ['Doctor Burn', 'Burn'])
    r('dr-douglas', 'Dr Douglas', '', "", ['Dr Douglas', 'Doctor Douglas', 'Douglas'])
    r('gregory-king', 'Gregory King', '', "", ['Gregory King'])
    r('lowndes', 'Mr Lowndes', '', "", ['Mr Lowndes', 'Lowndes'])
    r('pelham', 'Mr Pelham', 'Prime minister', "", ['Mr Pelham', 'Pelham'])
    r('walpole', 'Walpole', '', "", ['Walpole'])
    r('blackstone', 'Dr Blackstone', '', "", ['Dr Blackstone', 'Blackstone'])
    r('messance', 'Mr Messance', '', "", ['Mr Messance', 'Messance'])
    r('dupre-de-st-maur', 'Dupré de St Maur', '', "", ['Dupré de St Maur'])
    r('postlethwaite', 'James Postlethwaite', '', "", ['James Postlethwaite', 'Postlethwaite'])
    r('cantillon', 'Mr Cantillon', '', "", ['Mr Cantillon', 'Cantillon'])
    r('meggens', 'Mr Meggens', '', "", ['Mr Meggens', 'Meggens'])
    r('thomas-mun', 'Thomas Mun', '', "", ['Thomas Mun', 'Mun'])
    r('anderson', 'Mr Anderson', 'Historian of commerce', "", ['Mr Anderson', 'Anderson'])
    r('ruddiman', 'Mr Ruddiman', '', "", ['Mr Ruddiman', 'Ruddiman'])
    r('madox', 'Madox', '', "", ['Madox'])
    r('du-cange', 'Du Cange', '', "", ['Du Cange'])
    r('dr-birch', 'Doctor Birch', '', "", ['Doctor Birch'])
    r('john-smith', 'Mr John Smith', 'Memoirs of Wool', "", ['Mr John Smith'])
    r('hales', 'Lord Chief Justice Hales', '', "", ['Hales'])
    r('ulloa', 'Ulloa', '', "", ['Ulloa'])
    r('frezier', 'Frezier', '', "", ['Frezier'])
    r('kalm', 'Kalm', '', "", ['Kalm'])
    r('poivre', 'Poivre', '', "", ['Poivre'])
    r('bernier', 'Bernier', '', "", ['Bernier'])
    r('buffon', 'Buffon', '', "", ['Buffon'])
    r('pfeffel', 'Pfeffel', '', "", ['Pfeffel'])
    r('swift', 'Swift', '', "", ['Swift'])
    r('columella', 'Columella', '', "", ['Columella'])
    r('pliny', 'Pliny', '', "", ['Pliny'])
    r('varro', 'Varro', '', "", ['Varro'])
    r('cato', 'Cato', '', "", ['Cato'])
    r('cicero', 'Cicero', '', "", ['Cicero'])
    r('homer', 'Homer', '', "", ['Homer'])
    r('plato', 'Plato', '', "", ['Plato'])
    r('aristotle', 'Aristotle', '', "", ['Aristotle'])
    r('isocrates', 'Isocrates', '', "", ['Isocrates'])
    r('hippias', 'Hippias', '', "", ['Hippias'])
    r('protagoras', 'Protagoras', '', "", ['Protagoras'])
    r('carneades', 'Carneades', '', "", ['Carneades'])
    r('zeno', 'Zeno', '', "", ['Zeno'])
    r('epicurus', 'Epicurus', '', "", ['Epicurus'])
    r('dionysius', 'Dionysius', '', "", ['Dionysius'])
    r('polybius', 'Polybius', '', "", ['Polybius'])
    r('thucydides', 'Thucydides', '', "", ['Thucydides'])
    r('solon', 'Solon', '', "", ['Solon'])
    r('lycurgus', 'Lycurgus', '', "", ['Lycurgus'])
    r('scipio', 'Scipio', '', "", ['Scipio'])
    r('asinius-celer', 'Asinius Celer', '', "", ['Asinius Celer'])
    r('constantine', 'Constantine', '', "", ['Constantine'])
    r('antoninus', 'Antoninus', '', "", ['Antoninus'])


if __name__ == '__main__':
    main()
