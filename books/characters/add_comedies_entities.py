#!/usr/bin/env python3
"""As You Like It, The Taming of the Shrew, The Tempest: clickable-names pass.

The three comedies had only their speaking principals carded. Added:
the unnamed-but-speaking parts (Pedant, Tailor, Widow, Haberdasher,
Sly, the Page; Iris, Ceres, Juno and the masque spirits; Hymen, the
Lords and Pages), the named servants of Petruchio's house, the disguise
names bound onto the cards they belong to (Kate/Katherine → Katherina,
Cambio → Lucentio, Licio → Hortensio, Ganymede → Rosalind, Aliena →
Celia, King of Naples → Alonso), and every classical allusion.

Mis-binding fixed: "Sir Oliver" x4 (Martext, the vicar) sat on Orlando's
brother Oliver's card.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases

ROOT = Path(__file__).resolve().parents[2]
P, D, G, C = 'person', 'deity', 'group', 'personification'


def maker(book):
    def r(eid, name, subtitle, body, aliases, kind=P, role='reference', **kw):
        kw.setdefault('strict_editions', ())
        add_e(book, eid, name, subtitle, body, role, kind, aliases, **kw)
    return r


def drop(book, cid, pred):
    path = ROOT / f'app/public/data/characters/{book}.v1.json'
    pkg = json.loads(path.read_text())
    for ek, ed in pkg['editions'].items():
        before = len(ed['mentions'])
        ed['mentions'] = [m for m in ed['mentions'] if not (m['characterId'] == cid and pred(m))]
        print(book, ek, cid, 'dropped', before - len(ed['mentions']))
    path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


def shrew():
    B = 'taming-of-the-shrew'; r = maker(B)
    add_aliases(B, 'katherina', ['Katherine', 'Kate'])
    add_aliases(B, 'lucentio', ['Cambio'])
    add_aliases(B, 'hortensio', ['Licio'])
    add_aliases(B, 'baptista', ['Baptista Minola', 'Minola'])
    r('pedant', 'The Pedant', 'Passes for Vincentio', "", ['PEDANT', 'Pedant'], role='supporting')
    r('tailor', 'The Tailor', '', "", ['TAILOR', 'Tailor'], role='supporting')
    r('haberdasher', 'The Haberdasher', '', "", ['HABERDASHER', 'Haberdasher'])
    r('widow', 'The Widow', "Hortensio's wife", "", ['WIDOW', 'Widow'], role='supporting')
    r('christopher-sly', 'Christopher Sly', 'The tinker of the Induction', "", ['Christopher Sly', 'SLY', 'Sly'], role='supporting')
    r('hostess', 'The Hostess', '', "", ['HOSTESS', 'Hostess'])
    r('the-lord', 'The Lord', 'Of the Induction', "", ['LORD'])
    r('page', 'The Page', "Dressed as Sly's wife", "", ['PAGE'])
    r('antonio', 'Antonio', "Petruchio's father", "", ['Antonio'])
    for eid, name in [('nathaniel', 'Nathaniel'), ('philip', 'Philip'), ('joseph', 'Joseph'), ('nicholas', 'Nicholas'), ('peter', 'Peter'), ('walter', 'Walter'), ('gabriel', 'Gabriel'), ('ralph', 'Ralph'), ('adam', 'Adam'), ('gregory', 'Gregory'), ('sugarsop', 'Sugarsop')]:
        r(eid, name, "Petruchio's servant", "", [name.upper(), name])
    for eid, name, al in [('ovid', 'Ovid', ['Ovid']), ('aristotle', 'Aristotle', ['Aristotle']), ('socrates', 'Socrates', ['Socrates']), ('xanthippe', 'Xanthippe', ['Xanthippe']), ('hercules', 'Hercules', ['Hercules', 'Alcides']), ('lucrece', 'Lucrece', ['Lucrece']), ('grissel', 'Grissel', ['Grissel']), ('florentius', 'Florentius', ['Florentius']), ('sibyl', 'Sibyl', ['Sibyl']), ('saint-george', 'Saint George', ['Saint George']), ('saint-jamy', 'Saint Jamy', ['Saint Jamy']), ('saint-anne', 'Saint Anne', ['Saint Anne']), ('ajax', 'Ajax', ['Ajax']), ('leda', 'Leda', ['Leda']), ('anna', 'Anna', ['Anna']), ('agenor', 'Agenor', ['Agenor'])]:
        r(eid, name, '', "", al)
    for eid, name, al in [('minerva', 'Minerva', ['Minerva']), ('jove', 'Jove', ['Jove']), ('dian', 'Dian', ['Dian', 'Diana'])]:
        r(eid, name, '', "", al, kind=D)


def tempest():
    B = 'the-tempest'; r = maker(B)
    add_aliases(B, 'alonso', ['King of Naples'])
    r('iris', 'Iris', 'Spirit of the masque', "", ['IRIS', 'Iris'], kind=D, role='supporting')
    r('ceres', 'Ceres', 'Spirit of the masque', "", ['CERES', 'Ceres'], kind=D, role='supporting')
    r('juno', 'Juno', 'Spirit of the masque', "", ['JUNO', 'Juno'], kind=D, role='supporting')
    r('nymphs', 'The Nymphs', 'Of the masque', "", ['NYMPHS', 'Nymphs', 'Naiads'], kind=G)
    r('reapers', 'The Reapers', 'Of the masque', "", ['REAPERS', 'Reapers'], kind=G)
    r('mariners', 'The Mariners', '', "", ['MARINERS', 'Mariners'], kind=G)
    r('ship-master', 'The Master', 'Of the ship', "", ['MASTER', 'Master'], only_paragraphs={(1, 0), (1, 1), (1, 3)})
    r('claribel', 'Claribel', "Alonso's daughter, Queen of Tunis", "", ['Claribel'])
    r('setebos', 'Setebos', "Sycorax's god", "", ['Setebos'], kind=D)
    r('dido', 'Dido', 'Widow Dido', "", ['widow Dido', 'Widow Dido', 'Dido'])
    for eid, name in [('jove', 'Jove'), ('hymen', 'Hymen'), ('venus', 'Venus'), ('cupid', 'Cupid'), ('neptune', 'Neptune'), ('phoebus', 'Phoebus')]:
        r(eid, name, '', "", [name], kind=D)


def ayli():
    B = 'as-you-like-it'; r = maker(B)
    drop(B, 'oliver', lambda m: m['chapterNumber'] in (10, 14))
    r('sir-oliver-martext', 'Sir Oliver Martext', 'The vicar', "", ['SIR OLIVER MARTEXT', 'Sir Oliver Martext', 'Sir Oliver', 'MARTEXT', 'Martext'], role='supporting')
    add_aliases(B, 'rosalind', ['Master Ganymede', 'Cousin Ganymede', 'Ganymede', 'Rosalinda', 'Rosalinde'])
    add_aliases(B, 'celia', ['Aliena'])
    add_aliases(B, 'duke-frederick', ['Frederick'])
    r('hymen', 'Hymen', 'God of marriage', "", ['HYMEN', 'Hymen'], kind=D, role='supporting')
    r('jaques-de-boys', 'Jaques de Boys', "Sir Rowland's second son", "", ['JAQUES DE BOYS', 'Jaques de Boys', 'SECOND BROTHER'], role='supporting')
    r('dennis', 'Dennis', "Oliver's servant", "", ['DENNIS', 'Dennis'])
    r('sir-rowland', 'Sir Rowland de Boys', "Orlando's father", "", ['Sir Rowland de Boys', 'Rowland de Boys', 'Sir Rowland', 'Rowland'])
    r('hisperia', 'Hisperia', "The Princess' gentlewoman", "", ['Hisperia'])
    r('jane-smile', 'Jane Smile', '', "", ['Jane Smile'])
    r('first-lord', 'First Lord', '', "", ['FIRST LORD'])
    r('second-lord', 'Second Lord', '', "", ['SECOND LORD'])
    r('first-page', 'First Page', '', "", ['FIRST PAGE'])
    r('second-page', 'Second Page', '', "", ['SECOND PAGE'])
    r('forester', 'Forester', '', "", ['FORESTER'])
    for eid, name in [('judas', 'Judas'), ('cleopatra', 'Cleopatra'), ('lucretia', 'Lucretia'), ('pythagoras', 'Pythagoras'), ('gargantua', 'Gargantua'), ('ovid', 'Ovid'), ('leander', 'Leander'), ('hero', 'Hero'), ('troilus', 'Troilus'), ('helen', 'Helen'), ('atalanta', 'Atalanta'), ('hercules', 'Hercules'), ('caesar', 'Caesar'), ('robin-hood', 'Robin Hood')]:
        r(eid, name, '', "", [name])
    for eid, name in [('jove', 'Jove'), ('juno', 'Juno'), ('diana', 'Diana'), ('cupid', 'Cupid'), ('venus', 'Venus')]:
        r(eid, name, '', "", [name], kind=D)
    r('fortune', 'Fortune', 'The goddess', "", ['Fortune'], kind=C)


if __name__ == '__main__':
    shrew(); tempest(); ayli()
