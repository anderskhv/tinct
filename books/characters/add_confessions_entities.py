#!/usr/bin/env python3
"""Augustine's Confessions: clickable-names pass.

Everyone the text names: Christ, the patriarchs and prophets, the Roman
gods and Virgilian figures of the schoolroom, the friends and teachers
(Vindicianus, Firminus, Hierius, Euodius, Helpidius, Symmachus), the
Manichee founder, the Milanese martyrs, the philosophers.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases

BOOK = 'confessions'
P = 'person'
D = 'deity'


def r(eid, name, subtitle, body, aliases, kind=P, role='reference', **kw):
    add_e(BOOK, eid, name, subtitle, body, role, kind, aliases, **kw)


def main():
    add_aliases(BOOK, 'monnica', ['Monica'])
    add_aliases(BOOK, 'the-manichees', ['Manichee', 'Manichean', 'Manicheans'])
    r('christ', 'Jesus Christ', '', "", ['Jesus Christ', 'Christ', 'Jesus'], kind=D, role='major')
    r('paul', 'Paul', 'The Apostle', "Whose Epistles Augustine took up in the garden.", ['Apostle Paul', 'Paul', 'Saul'], role='supporting')
    r('virgin-mary', 'The Virgin Mary', '', "", ['Virgin Mary', 'Mary'])
    r('adam', 'Adam', '', "", ['Adam'])
    r('eve', 'Eve', '', "", ['Eve'])
    r('abraham', 'Abraham', '', "", ['Abraham'])
    r('isaac', 'Isaac', '', "", ['Isaac'])
    r('jacob', 'Jacob', '', "", ['Jacob'])
    r('esau', 'Esau', '', "", ['Esau'])
    r('joseph', 'Joseph', '', "", ['Joseph'])
    r('noah', 'Noah', '', "", ['Noah'])
    r('david', 'David', '', "Whose Psalms Augustine read at Cassiciacum.", ['David'])
    r('solomon', 'Solomon', '', "", ['Solomon'])
    r('elijah', 'Elijah', '', "", ['Elijah'])
    r('isaiah', 'Isaiah', '', "", ['Isaiah'])
    r('manichaeus', 'Manichaeus', 'Founder of the Manichees', "", ['Manichaeus', 'Manichæus', 'Mani'])
    r('vindicianus', 'Vindicianus', 'Physician', "The acute old man who tried to turn Augustine from astrology.", ['Vindicianus'])
    r('firminus', 'Firminus', 'Friend', "Whose birth-story, told with a slave-child born at the same hour, broke Augustine's belief in the stars.", ['Firminus'], role='supporting')
    r('hierius', 'Hierius', 'Orator of Rome', "To whom Augustine dedicated his first book.", ['Hierius'])
    r('euodius', 'Euodius', 'Friend', "Who sang the Psalter at Monnica's death.", ['Euodius', 'Evodius'])
    r('helpidius', 'Helpidius', '', "", ['Helpidius'])
    r('symmachus', 'Symmachus', 'Prefect of Rome', "Who sent Augustine to Milan.", ['Symmachus'])
    r('julian', 'Julian', 'The Emperor', "", ['Julian'])
    r('hortensius', 'Hortensius', "Cicero's book", "The exhortation to philosophy that first turned Augustine.", ['Hortensius'])
    r('aristotle', 'Aristotle', '', "", ['Aristotle'])
    r('epicurus', 'Epicurus', '', "", ['Epicurus'])
    r('platonists', 'The Platonists', '', "", ['Platonists', 'Plato'])
    r('homer', 'Homer', '', "", ['Homer'])
    r('virgil', 'Virgil', '', "", ['Virgil'])
    r('terence', 'Terence', '', "", ['Terence'])
    r('aeneas', 'Aeneas', '', "Whose wanderings Augustine was made to learn while forgetting his own.", ['Aeneas', 'Æneas'])
    r('dido', 'Dido', '', "", ['Dido'])
    r('creusa', 'Creusa', '', "", ['Creusa'])
    r('jove', 'Jove', '', "", ['Jove'], kind=D)
    r('juno', 'Juno', '', "", ['Juno'], kind=D)
    r('venus', 'Venus', '', "", ['Venus'], kind=D)
    r('minerva', 'Minerva', '', "", ['Minerva'], kind=D)
    r('neptune', 'Neptune', '', "", ['Neptune'], kind=D)
    r('saturn', 'Saturn', '', "", ['Saturn'], kind=D)
    r('mars', 'Mars', '', "", ['Mars'], kind=D)
    r('anubis', 'Anubis', '', "", ['Anubis'], kind=D)
    r('danae', 'Danae', '', "", ['Danae', 'Danaë'])
    r('medea', 'Medea', '', "", ['Medea'])
    r('cyprian', 'Cyprian', '', "", ['Cyprian'])
    r('athanasius', 'Athanasius', '', "", ['Athanasius'])
    r('photinus', 'Photinus', '', "", ['Photinus'])
    r('gervasius', 'Gervasius', 'Martyr', "", ['Gervasius'])
    r('protasius', 'Protasius', 'Martyr', "", ['Protasius'])
    r('justina', 'Justina', 'Empress', "", ['Justina'])
    r('valentinian', 'Valentinian', 'Emperor', "", ['Valentinian'])


if __name__ == '__main__':
    main()
