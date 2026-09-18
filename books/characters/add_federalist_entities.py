#!/usr/bin/env python3
"""Federalist Papers: clickable-names pass.

Publius was the only person card. Minimal cards for the authorities and
examples Hamilton, Madison and Jay cite: Montesquieu, Blackstone, Mably,
Grotius, Sir William Temple, De Lolme, Hume, Plutarch, Polybius; the
ancient lawgivers and captains (Solon, Lycurgus, Draco, Minos, Zaleucus,
Pericles, Aratus, Cleomenes, Philip of Macedon, Alexander); the European
monarchs (Charles V, Charles VII, Charles II, James II, William III,
George II, Louis XIV, Henry VIII, Charlemagne); and Shays.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e

BOOK = 'federalist-papers'
P = 'person'


def r(eid, name, subtitle, body, aliases, **kw):
    kw.setdefault('strict_editions', ())
    add_e(BOOK, eid, name, subtitle, body, 'reference', P, aliases, **kw)


def main():
    r('montesquieu', 'Montesquieu', '', "The celebrated Montesquieu, on the separation of powers and confederate republics.", ['Montesquieu'])
    r('blackstone', 'Blackstone', '', "", ['Blackstone'])
    r('mably', 'Abbe Mably', '', "", ['Abbe Mably', 'Mably'])
    r('grotius', 'Grotius', '', "", ['Grotius'])
    r('william-temple', 'Sir William Temple', '', "", ['Sir William Temple', 'William Temple'])
    r('de-lolme', 'De Lolme', '', "", ['De Lolme'])
    r('hume', 'Hume', '', "", ['Hume'])
    r('neckar', 'Neckar', '', "", ['Neckar'])
    r('junius', 'Junius', '', "", ['Junius'])
    r('plutarch', 'Plutarch', '', "", ['Plutarch'])
    r('polybius', 'Polybius', '', "", ['Polybius'])
    r('homer', 'Homer', '', "", ['Homer'])
    r('pope', 'Pope', 'The poet', "", ['Pope'])
    r('plato', 'Plato', '', "", ['Plato'])
    r('socrates', 'Socrates', '', "", ['Socrates'])
    r('demosthenes', 'Demosthenes', '', "", ['Demosthenes'])
    r('solon', 'Solon', '', "", ['Solon'])
    r('lycurgus', 'Lycurgus', '', "", ['Lycurgus'])
    r('draco', 'Draco', '', "", ['Draco'])
    r('minos', 'Minos', '', "", ['Minos'])
    r('zaleucus', 'Zaleucus', '', "", ['Zaleucus'])
    r('theseus', 'Theseus', '', "", ['Theseus'])
    r('romulus', 'Romulus', '', "", ['Romulus'])
    r('numa', 'Numa', '', "", ['Numa'])
    r('pericles', 'Pericles', '', "", ['Pericles'])
    r('aspasia', 'Aspasia', '', "", ['Aspasia'])
    r('aratus', 'Aratus', '', "", ['Aratus'])
    r('cleomenes', 'Cleomenes', '', "", ['Cleomenes'])
    r('philip-of-macedon', 'Philip of Macedon', '', "", ['Philip of Macedon', 'Philip'])
    r('alexander', 'Alexander', '', "", ['Alexander'])
    r('xerxes', 'Xerxes', '', "", ['Xerxes'])
    r('caesar', 'Caesar', '', "", ['Caesar'])
    r('brutus', 'Brutus', '', "", ['Brutus'])
    r('scipio', 'Scipio', '', "", ['Scipio'])
    r('hannibal', 'Hannibal', '', "", ['Hannibal'])
    r('charlemagne', 'Charlemagne', '', "", ['Charlemagne'])
    r('charles-v', 'Charles V', 'Emperor', "", ['Charles V.'])
    r('charles-vii', 'Charles VII', 'Of France', "Who introduced standing armies.", ['Charles VII.'])
    r('charles-ii', 'Charles II', '', "", ['Charles II.', 'Charles II'])
    r('james-ii', 'James II', '', "", ['James II.', 'James II'])
    r('william-iii', 'William III', '', "", ['William III'])
    r('george-ii', 'George II', '', "", ['George II.', 'George II'])
    r('king-john', 'King John', '', "", ['King John'])
    r('henry-viii', 'Henry VIII', '', "", ['Henry VIII.', 'Henry VIII'])
    r('wolsey', 'Wolsey', '', "", ['Wolsey'])
    r('louis-xiv', 'Louis XIV', '', "", ['Louis XIV.', 'Louis XIV'])
    r('maximilian', 'Maximilian', '', "", ['Maximilian'])
    r('cromwell', 'Cromwell', '', "", ['Cromwell'])
    r('fox', 'Fox', '', "", ['Fox'])
    r('shays', 'Shays', "Shays's rebellion", "", ['Shays'])
    r('jefferson', 'Jefferson', '', "", ['Jefferson'])
    r('yates', 'Yates', '', "", ['Yates'])


if __name__ == '__main__':
    main()
