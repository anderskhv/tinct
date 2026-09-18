#!/usr/bin/env python3
"""Frankenstein: clickable-names pass.

Aliases: bare "Frankenstein" -> Victor (except "M. Frankenstein" /
"Alphonse Frankenstein" = father), "Frankenstein" in Walton's frame ->
Victor, "the dæmon" -> the creature, Lavenza/Moritz/Saville/Robert Walton,
"Mr. Kirwin". New cards: Beaufort, Mr. Kirwin, the Turk (Safie's father),
Daniel Nugent, the Genevan schoolfellows, Uncle Thomas, the alchemists
(Agrippa, Paracelsus, Albertus Magnus), Adam/Eve/Satan, Werter, Plutarch,
and the Oxford royalists.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'frankenstein'
P = 'person'


def r(eid, name, subtitle, body, aliases, role='reference', **kw):
    add_e(BOOK, eid, name, subtitle, body, role, P, aliases, **kw)


def main():
    add_aliases(BOOK, 'alphonse-frankenstein', ['Alphonse'])
    add_aliases(BOOK, 'victor', ['Victor Frankenstein', 'Frankenstein'])
    add_aliases(BOOK, 'creature', ['the dæmon', 'dæmon', 'the daemon', 'daemon'])
    add_aliases(BOOK, 'elizabeth', ['Lavenza'])
    add_aliases(BOOK, 'justine', ['Moritz'])
    add_aliases(BOOK, 'margaret-saville', ['Saville'])
    add_aliases(BOOK, 'walton', ['Robert'])
    add_aliases(BOOK, 'william', ['William'])
    add_aliases(BOOK, 'caroline-beaufort', ['Caroline'])
    add_aliases(BOOK, 'krempe', ['Krempe'])
    add_aliases(BOOK, 'waldman', ['Waldman'])

    r('beaufort', 'Beaufort', "Caroline's father", "The ruined merchant, Alphonse Frankenstein's friend, who died in poverty at Lucerne.", ['Beaufort'], role='supporting')
    r('mr-kirwin', 'Mr. Kirwin', 'Irish magistrate', "Who examines Victor after Clerval's murder and treats him kindly.", ['Mr. Kirwin', 'Kirwin'], role='supporting')
    r('the-turk', 'The Turk', "Safie's father", "The Turkish merchant Felix rescued from prison, who then betrayed him.", ['Turk'], exclude_paragraphs={(2, 5)}, role='supporting')
    r('daniel-nugent', 'Daniel Nugent', 'Witness', "", ['Daniel Nugent'])
    r('uncle-thomas', 'Uncle Thomas', '', "Whose library of voyages made Walton a sailor.", ['Uncle Thomas'])
    r('louisa-biron', 'Louisa Biron', '', "", ['Louisa Biron'])
    r('john-melbourne', 'John Melbourne', '', "", ['John Melbourne'])
    r('louis-manoir', 'Louis Manoir', '', "", ['Louis Manoir', 'Manoir'])
    r('manon', 'Manon', '', "", ['Manon'], strict_editions=())
    r('cornelius-agrippa', 'Cornelius Agrippa', 'Occult philosopher', "The first of the alchemists whose books fired Victor's imagination.", ['Cornelius Agrippa', 'Agrippa'])
    r('paracelsus', 'Paracelsus', '', "", ['Paracelsus'])
    r('albertus-magnus', 'Albertus Magnus', '', "", ['Albertus Magnus'])
    r('isaac-newton', 'Isaac Newton', '', "", ['Isaac Newton', 'Newton'])
    r('adam', 'Adam', '', "'I ought to be thy Adam' — the creature's reading of Paradise Lost.", ['Adam'])
    r('eve', 'Eve', '', "", ['Eve'])
    r('satan', 'Satan', '', "", ['Satan'])
    r('werter', 'Werter', "Goethe's hero", "", ['Werter'])
    r('plutarch', 'Plutarch', '', "", ['Plutarch'])
    r('volney', 'Volney', '', "The Ruins of Empires, Felix's textbook for Safie.", ['Volney'])
    r('dante', 'Dante', '', "", ['Dante'])
    r('shakespeare', 'Shakespeare', '', "", ['Shakespeare'])
    r('homer', 'Homer', '', "", ['Homer'])
    r('ariosto', 'Ariosto', '', "", ['Ariosto'])
    r('angelica', 'Angelica', '', "", ['Angelica'])
    r('muhammad', 'Muhammad', '', "", ['Muhammad', 'Mahomet'])
    r('numa', 'Numa', '', "", ['Numa'])
    r('solon', 'Solon', '', "", ['Solon'])
    r('lycurgus', 'Lycurgus', '', "", ['Lycurgus'])
    r('romulus', 'Romulus', '', "", ['Romulus'])
    r('theseus', 'Theseus', '', "", ['Theseus'])
    r('charles-i', 'Charles I', '', "", ['Charles I.', 'Charles I'])
    r('falkland', 'Falkland', '', "", ['Falkland'])
    r('goring', 'Goring', '', "", ['Goring'])
    r('hampden', 'Hampden', '', "", ['Hampden'])
    r('ancient-mariner', 'The Ancient Mariner', '', "", ['Ancient Mariner'])


if __name__ == '__main__':
    main()
