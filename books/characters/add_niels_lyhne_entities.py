#!/usr/bin/env python3
"""Niels Lyhne: clickable-names pass.

Aliases: bare "Lyhne" -> Niels's father (the Lönborggaard Lyhne) in the
opening chapters and Niels himself later; "Mrs. Lyhne" -> Bartholine;
"Boye" -> Mrs. Boye; "Tema" (her first name); "Refstrup" -> Erik; the
Councillor(s). New cards: Consul Claudi and Aunt Rosalie, Councillor
Neergaard and his wife, Councillor Skinnerup, Madame Odéro, Mikkelsen
the sculptor, Mrs. Refstrup, the Blid and Konneroy families, and the
allusions (Tove and King Valdemar, Vittoria Colonna, Salvator Rosa,
Ganem, the painters).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'niels-lyhne'
P = 'person'
_ED = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
_PARAS = [(c['number'], i, p) for c in _ED['chapters'] for i, p in enumerate(c['paragraphs'])]


def chapters(*chs):
    return {(ch, i) for ch, i, p in _PARAS if ch in chs}


def r(eid, name, subtitle, body, aliases, role='reference', **kw):
    add_e(BOOK, eid, name, subtitle, body, role, P, aliases, **kw)


def main():
    r('lyhne-senior', 'Lyhne', "Niels's father", "Young Lyhne of Lönborggaard, the farmer with a poet's nature who never became one.", ['Young Lyhne', 'Mr. Lyhne', 'Lyhne'], only_paragraphs=chapters(1, 2, 3, 4, 5), role='supporting')
    add_aliases_restricted(BOOK, 'niels', ['Lyhne', 'Mr. Lyhne'], exclude_paragraphs=chapters(1, 2, 3, 4, 5))
    add_aliases(BOOK, 'bartholine', ['Mrs. Lyhne', 'Bartholine Blid'])
    add_aliases(BOOK, 'mrs-boye', ['Tema', 'Boye'])
    add_aliases(BOOK, 'erik', ['Erik Refstrup'])
    add_aliases(BOOK, 'bigum', ['Mr. Bigum'])
    add_aliases(BOOK, 'hjerrild', ['Dr. Hjerrild'])
    add_aliases(BOOK, 'frithjof', ['Frithjof Petersen'])

    r('mrs-refstrup', 'Mrs. Refstrup', "Erik's mother", "Lyhne's widowed cousin, whose son Erik comes to Lönborggaard.", ['Mrs. Refstrup'])
    r('refstrup-senior', 'Mr. Refstrup', '', "", ['Mr. Refstrup', 'Refstrup'], only_paragraphs={(6, 8), (6, 34)})
    r('consul-claudi', 'Consul Claudi', 'Of Fjordby', "Aunt Rosalie's husband, the grain merchant with a wistful look.", ['Consul Claudi', 'Claudi'], role='supporting')
    r('berendt-claudi', 'Berendt Berendtsen Claudi', 'The grandfather', "Who founded the firm.", ['Berendt Berendtsen Claudi', 'Berendt Claudi'])
    r('aunt-rosalie', 'Aunt Rosalie', '', "", ['Aunt Rosalie', 'Rosalie'])
    r('councillor-neergaard', 'Councillor Neergaard', "Niels's uncle", "The Councillor of State in whose Copenhagen home Niels lodges.", ['Councillor of State Neergaard', 'Councillor Neergaard', 'Neergaard'], role='supporting')
    r('mrs-neergaard', 'Mrs. Neergaard', '', "Who looks at Niels with sarcastic pity.", ['Mrs. Neergaard'])
    r('councillor-skinnerup', 'Councillor Skinnerup', 'Of Varde', "The old university friend of Lyhne's, Gerda's father.", ['Councillor Skinnerup'], role='supporting')
    add_aliases_restricted(BOOK, 'councillor-skinnerup', ['Councillor'], only_paragraphs=chapters(13, 14))
    add_aliases_restricted(BOOK, 'councillor-neergaard', ['Councillor'], only_paragraphs=chapters(3, 6, 9, 10))
    r('madame-odero', 'Madame Odéro', 'Opera singer', "The fiery singer at Lake Garda whom Niels shepherds through her melancholy.", ['Madame Odéro', 'Odéro'], role='supporting')
    r('mikkelsen', 'Mikkelsen', 'Sculptor', "In whose studio Erik works and Niels meets Mrs. Boye.", ['Mikkelsen'])
    r('the-blids', 'The Blid family', "Bartholine's people", "Practical folk with black luminous eyes.", ['Blid'])
    r('the-konneroys', 'The Konneroys', "Mrs. Boye's family", "One of the oldest families; old Konneroy is said to have cursed her.", ['Konneroys', 'Konneroy'])
    r('hardenskjold', 'Hardenskjold', "Mrs. Boye's brother", "", ['Hardenskjold'])
    r('jens-overseer', 'Jens Overseer', '', "", ['Jens Overseer'])
    r('duysen', 'Duysen', 'Servant', "", ['Duysen'])
    r('nicolaus', 'Nicolaus', "Fennimore's idealised lover", "", ['Nicolaus'])
    r('traffelini', 'Traffelini', '', "", ['Traffelini'], strict_editions=())
    r('spengler', 'Spengler', 'Art catalogue', "", ['Spengler'])
    r('tove', 'Tove', '', "King Valdemar's mistress, in the boys' games.", ['Tove'])
    r('king-valdemar', 'King Valdemar', '', "", ['King Valdemar'])
    r('vittoria-colonna', 'Vittoria Colonna', '', "", ['Vittoria Colonna'])
    r('laura', 'Laura', "Petrarch's Laura", "", ['Laura'])
    r('beatrice', 'Beatrice', "Dante's Beatrice", "", ['Beatrice'], strict_editions=())
    r('salvator-rosa', 'Salvator Rosa', '', "", ['Salvator Rosa'])
    r('tintoretto', 'Tintoretto', '', "", ['Tintoretto'], strict_editions=())
    r('caravaggio', 'Caravaggio', '', "", ['Caravaggio'], strict_editions=())
    r('guido-reni', 'Guido Reni', '', "", ['Guido Reni'])
    r('raphael', 'Raphael', '', "", ['Raphael'])
    r('andrea-del-sarto', 'Andrea del Sarto', '', "", ['Andrea del Sarto'])
    r('parmigianino', 'Parmigianino', '', "", ['Parmigianino'])
    r('luini', 'Luini', '', "", ['Luini'])
    r('lassen', 'Lassen', 'Hero of the Second of April', "", ['Lassen'])
    r('henrik-magnard', 'Henrik Magnard', '', "", ['Henrik Magnard'])
    r('ganem', 'Ganem', 'The Slave of Love', "", ['Ganem'])
    r('oehlenschlager', 'Oehlenschläger', '', "", ['Oehlenschläger'])
    r('shakespeare', 'Shakespeare', '', "", ['Shakespeare'])
    r('rousseau', 'Rousseau', '', "", ['Rousseau'])
    r('schiller', 'Schiller', '', "", ['Schiller'])
    r('heine', 'Heine', '', "", ['Heine'])
    r('napoleon', 'Napoleon', '', "", ['Napoleon'])
    r('hamlet', 'Hamlet', '', "", ['Hamlet'])
    r('don-juan', 'Don Juan', '', "", ['Don Juan'])
    r('prometheus', 'Prometheus', '', "", ['Prometheus'])
    r('odysseus', 'Odysseus', '', "", ['Odysseus'])
    r('eros', 'Eros', '', "", ['Eros'])
    r('juno', 'Juno', '', "", ['Juno'])
    r('augustus', 'Augustus', 'The Emperor', "", ['Augustus'])
    r('nebuchadnezzar', 'Nebuchadnezzar', '', "", ['Nebuchadnezzar'])
    r('adam', 'Adam', '', "", ['Adam'])
    r('eve', 'Eve', '', "", ['Eve'], strict_editions=())
    r('david', 'David', '', "", ['David'])
    r('goliath', 'Goliath', '', "", ['Goliath'])
    r('joseph', 'Joseph', '', "", ['Joseph'], strict_editions=())
    r('aaron', 'Aaron', '', "", ['Aaron'])
    r('jesus', 'Jesus', '', "", ['Jesus', 'Christ'])
    r('peter-simple', 'Peter Simple', "Marryat's hero", "", ['Peter Simple'])
    r('robinson-crusoe', 'Robinson Crusoe', '', "", ['Robinson Crusoe'])
    r('pamela', 'Pamela', '', "", ['Pamela'])


if __name__ == '__main__':
    main()
