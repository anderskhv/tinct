#!/usr/bin/env python3
"""Leviathan: clickable-names pass.

Minimal cards for the scriptural and classical figures Hobbes argues
with in Parts III-IV — Moses above all (235 mentions), Christ/"our
Saviour", the apostles under Hobbes's "S. Paul"/"St. Peter" forms, the
patriarchs and kings, the popes and fathers, the ancient authorities
and the gods of the heathen. Bare "John", "Mark", "Luke", "Matthew" are
scripture citations (John 10.20) and are left alone; the apostle forms
("St. John", "John Baptist") are bound. "Innocent" is bound only where
it names the pope (43,122); "Lot" only for the patriarch.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'leviathan'
P = 'person'
D = 'deity'
_ED = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
_PARAS = [(c['number'], i, p) for c in _ED['chapters'] for i, p in enumerate(c['paragraphs'])]


def chapters(*chs):
    return {(ch, i) for ch, i, p in _PARAS if ch in chs}


def r(eid, name, subtitle, body, aliases, kind=P, role='reference', **kw):
    kw.setdefault('strict_editions', ())
    add_e(BOOK, eid, name, subtitle, body, role, kind, aliases, **kw)


def main():
    add_aliases(BOOK, 'aristotle', ['Aristotles'])
    add_aliases(BOOK, 'julius-caesar', ['Caesar'])
    add_aliases(BOOK, 'cardinal-bellarmine', ['Bellarmine', 'Bellarmin'])
    r('christ', 'Christ', 'Our Saviour', "Jesus Christ, whose kingdom Hobbes argues is not of this world — yet.", ['Jesus Christ', 'our Saviour', 'Saviour', 'Christ', 'Jesus'], kind=D, role='major')
    r('moses', 'Moses', '', "God's lieutenant over Israel; the model of Hobbes's sovereign-prophet.", ['Moses'], role='major')
    r('st-paul', 'St. Paul', 'The Apostle', "", ['St. Paul', 'S. Paul', 'St Paul', 'Paul'], role='supporting')
    r('st-peter', 'St. Peter', 'The Apostle', "Simon, surnamed Stone; Bellarmine's rock.", ['Simon Peter', 'St. Peter', 'S. Peter', 'St Peter', 'Peter'], exclude_paragraphs={(5, 5)}, role='supporting')
    r('simon-magus', 'Simon', 'The Apostle Simon', "", ['Simon'], only_paragraphs=chapters(43))
    r('st-john', 'St. John', 'The Evangelist', "", ['St. John', 'S. John', 'St John'])
    r('john-baptist', 'John Baptist', '', "", ['John the Baptist', 'John Baptist'])
    r('st-luke', 'St. Luke', '', "", ['St. Luke', 'S. Luke'])
    r('st-matthew', 'St. Matthew', '', "", ['St. Matthew', 'S. Matthew', 'S. Matth.'])
    r('st-mark', 'St. Mark', '', "", ['St. Mark', 'S. Mark'])
    r('st-james', 'James', 'The Apostle', "", ['James'], only_paragraphs={(45, 18)})
    r('king-james', 'King James', '', "Our most wise King.", ['King James'])
    r('philip-the-deacon', 'Philip', 'The Deacon', "Not Philip the Apostle: the point Hobbes makes about baptism in Samaria.", ['Philip'])
    r('barnabas', 'Barnabas', '', "", ['Barnabas'])
    r('timothy', 'Timothy', '', "", ['Timothy'])
    r('titus', 'Titus', '', "", ['Titus'], exclude_paragraphs={(43, 56)})
    r('matthias', 'Matthias', '', "", ['Matthias'])
    r('judas-iscariot', 'Judas Iscariot', '', "", ['Judas Iscariot', 'Judas'])
    r('lazarus', 'Lazarus', '', "", ['Lazarus'])
    r('virgin-mary', 'The Virgin Mary', '', "", ['Virgin Mary'])
    r('mary-magdalen', 'Mary Magdalen', '', "", ['Mary Magdalen'])
    r('martha', 'Martha', '', "", ['Martha'])
    r('elizabeth', 'Elizabeth', '', "", ['Elizabeth'], exclude_paragraphs=set())
    r('zacharias', 'Zacharias', '', "", ['Zacharias'])
    r('herod', 'Herod', '', "", ['Herod'])
    r('pilate', 'Pilate', '', "", ['Pilate'])
    r('antichrist', 'Antichrist', '', "", ['Antichrist'])
    r('satan', 'Satan', '', "", ['Satan', 'Beelzebub'], kind=D)
    r('gabriel', 'Gabriel', 'Angel', "", ['Gabriel'], kind=D)
    r('michael', 'Michael', 'Angel', "", ['Michael'], kind=D)
    # patriarchs, judges, kings, prophets
    for eid, name, al in [('abraham', 'Abraham', ['Abraham']), ('adam', 'Adam', ['Adam']), ('eve', 'Eve', ['Eve']), ('cain', 'Cain', ['Cain']), ('noah', 'Noah', ['Noah']), ('isaac', 'Isaac', ['Isaac']), ('jacob', 'Jacob', ['Jacob']), ('esau', 'Esau', ['Esau']), ('laban', 'Laban', ['Laban']), ('joseph', 'Joseph', ['Joseph']), ('aaron', 'Aaron', ['Aaron']), ('pharaoh', 'Pharaoh', ['Pharaoh']), ('nadab', 'Nadab', ['Nadab']), ('abihu', 'Abihu', ['Abihu']), ('joshua', 'Joshua', ['Joshua']), ('gideon', 'Gideon', ['Gideon']), ('samson', 'Samson', ['Samson']), ('samuel', 'Samuel', ['Samuel']), ('saul', 'Saul', ['Saul']), ('david', 'David', ['David']), ('nathan', 'Nathan', ['Nathan']), ('uriah', 'Uriah', ['Uriah']), ('zadok', 'Zadok', ['Zadok']), ('abiathar', 'Abiathar', ['Abiathar']), ('solomon', 'Solomon', ['Solomon']), ('rehoboam', 'Rehoboam', ['Rehoboam']), ('jeroboam', 'Jeroboam', ['Jeroboam']), ('ahab', 'Ahab', ['Ahab']), ('jehu', 'Jehu', ['Jehu']), ('hezekiah', 'Hezekiah', ['Hezekiah']), ('josiah', 'Josiah', ['Josiah']), ('elijah', 'Elijah', ['Elijah', 'Elias']), ('elisha', 'Elisha', ['Elisha']), ('isaiah', 'Isaiah', ['Isaiah']), ('jeremiah', 'Jeremiah', ['Jeremiah']), ('ezekiel', 'Ezekiel', ['Ezekiel']), ('daniel', 'Daniel', ['Daniel']), ('job', 'Job', ['Job']), ('naaman', 'Naaman', ['Naaman']), ('esdras', 'Esdras', ['Esdras']), ('nehemiah', 'Nehemiah', ['Nehemiah']), ('esther', 'Esther', ['Esther']), ('judith', 'Judith', ['Judith']), ('levi', 'Levi', ['Levi'])]:
        r(eid, name, '', "", al)
    r('lot', 'Lot', 'The patriarch', "To whom the angels appeared at Sodom.", ['Lot'], only_paragraphs={(35, 21)})
    # popes, fathers, moderns
    r('pope-innocent', 'Pope Innocent', '', "", ['Innocent'], only_paragraphs={(43, 122)})
    r('pope-leo', 'Pope Leo', '', "", ['Leo'])
    r('pope-gregory', 'Pope Gregory', '', "", ['Gregory'])
    r('pope-zachary', 'Pope Zachary', '', "", ['Zachary'])
    r('st-jerome', 'St. Jerome', '', "", ['Jerome'])
    r('st-augustine', 'St. Augustine', '', "", ['Augustine'])
    r('st-ambrose', 'St. Ambrose', '', "", ['Ambrose'])
    r('st-bernard', 'S. Bernard', '', "", ['S. Bernard'])
    r('aquinas', 'Thomas', 'Aquinas', "'An Aristotle, a Cicero, or a Thomas' — the Schoolman.", ['Thomas'], only_paragraphs={(5, 12)})
    r('thomas-beckett', 'Thomas Beckett', '', "", ['Thomas Beckett'])
    r('beza', 'Beza', '', "", ['Beza'])
    r('suarez', 'Suarez', '', "", ['Suarez'])
    r('josephus', 'Josephus', '', "", ['Josephus'])
    r('philo', 'Philo', '', "", ['Philo'])
    r('plato', 'Plato', '', "", ['Plato'])
    r('socrates', 'Socrates', '', "", ['Socrates'])
    r('homer', 'Homer', '', "", ['Homer'])
    r('virgil', 'Virgil', '', "", ['Virgil'])
    r('livy', 'Livy', '', "", ['Livy'])
    r('zeno', 'Zeno', '', "", ['Zeno'])
    r('alexander', 'Alexander', '', "", ['Alexander'])
    r('augustus', 'Augustus', '', "", ['Augustus'])
    r('nero', 'Nero', '', "", ['Nero'])
    r('constantine', 'Constantine', '', "", ['Constantine'])
    r('queen-elizabeth', 'Queen Elizabeth', '', "", ['Queen Elizabeth'])
    r('william-the-conqueror', 'William the Conquerour', '', "", ['William the Conquerour'])
    r('king-john', 'King John', '', "", ['King John'])
    r('mahomet', 'Mahomet', '', "", ['Mahomet'])
    r('numa', 'Numa', '', "", ['Numa'])
    r('romulus', 'Romulus', '', "", ['Romulus'])
    r('solon', 'Solon', '', "", ['Solon'])
    r('cato', 'Cato', '', "", ['Cato'])
    r('pompey', 'Pompey', '', "", ['Pompey'])
    r('tiberius', 'Tiberius', '', "", ['Tiberius'])
    r('caligula', 'Caligula', '', "", ['Caligula'])
    r('domitian', 'Domitian', '', "", ['Domitian'])
    r('julian', 'Julian', '', "", ['Julian'])
    r('theodosius', 'Theodosius', '', "", ['Theodosius'])
    r('justinian', 'Justinian', '', "", ['Justinian'])
    # gods of the heathen
    for eid, name, al in [('jupiter', 'Jupiter', ['Jupiter', 'Jove']), ('mercury', 'Mercury', ['Mercury']), ('saturn', 'Saturn', ['Saturn']), ('venus', 'Venus', ['Venus']), ('apollo', 'Apollo', ['Apollo']), ('neptune', 'Neptune', ['Neptune']), ('bacchus', 'Bacchus', ['Bacchus']), ('ceres', 'Ceres', ['Ceres']), ('diana', 'Diana', ['Diana']), ('cupid', 'Cupid', ['Cupid']), ('priapus', 'Priapus', ['Priapus']), ('aeolus', 'Aeolus', ['Aeolus']), ('pan', 'Pan', ['Pan'])]:
        r(eid, name, '', "", al, kind=D)
    for eid, name, al in [('hercules', 'Hercules', ['Hercules']), ('prometheus', 'Prometheus', ['Prometheus']), ('cerberus', 'Cerberus', ['Cerberus']), ('charon', 'Charon', ['Charon']), ('medea', 'Medea', ['Medea'])]:
        r(eid, name, '', "", al)


if __name__ == '__main__':
    main()
