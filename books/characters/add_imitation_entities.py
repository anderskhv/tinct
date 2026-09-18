#!/usr/bin/env python3
"""Imitation of Christ: clickable-names pass.

The jesus-christ card was bound to "Jesus Christ"/"Christ" only, leaving
"Jesus" x85 and "Jesu" untapped; st-paul to "St. Paul" only. Minimal
cards for the scriptural figures Thomas names in the running text
(Moses, Peter the Apostle, David, Abraham, Noah, Adam, Eve, Martha,
Lazarus, Zacchaeus, the Virgin, Mary of Bethany, St. Francis, the martyr
Laurence, Satan, the Evangelist Luke). Bare "John", "Matthew", "Luke",
"Mark", "Peter", "Samuel", "Isaiah", "Jeremiah" are otherwise scripture
citations ("John xiv. 23") and are left alone.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases

BOOK = 'imitation-of-christ'
P, D = 'person', 'deity'


def r(eid, name, subtitle, body, aliases, kind=P, **kw):
    kw.setdefault('strict_editions', ())
    add_e(BOOK, eid, name, subtitle, body, 'reference', kind, aliases, **kw)


def main():
    add_aliases(BOOK, 'jesus-christ', ['Jesus', 'Jesu'])
    add_aliases(BOOK, 'st-paul', ['Paul'])
    add_aliases(BOOK, 'mary-magdalene', ['Magdalene'])
    r('moses', 'Moses', '', "", ['Moses'])
    r('st-peter', 'Peter', 'The Apostle', "", ['Apostle Peter', 'Peter'], only_paragraphs={(90, 1)})
    r('david', 'David', 'The king', "", ['David'])
    r('abraham', 'Abraham', '', "", ['Abraham'])
    r('noah', 'Noah', '', "", ['Noah'])
    r('adam', 'Adam', '', "", ['Adam'])
    r('eve', 'Eve', '', "", ['Eve'])
    r('martha', 'Martha', '', "", ['Martha'])
    r('mary-of-bethany', 'Mary', 'Sister of Martha and Lazarus', "", ['Mary'], only_paragraphs={(70, 2)})
    r('virgin-mary', 'The Virgin Mary', '', "", ['Virgin Mary'], only_paragraphs={(113, 3)})
    r('lazarus', 'Lazarus', '', "", ['Lazarus'])
    r('zacchaeus', 'Zacchaeus', '', "", ['Zacchaeus'])
    r('st-francis', 'St. Francis', '', "", ['St. Francis'])
    r('st-laurence', 'Laurence', 'The martyr', "", ['Laurence'])
    r('st-luke', 'Luke', 'The Evangelist', "", ['Luke'], only_paragraphs={(19, 7)})
    r('satan', 'Satan', '', "", ['Satan'], kind=D)


if __name__ == '__main__':
    main()
