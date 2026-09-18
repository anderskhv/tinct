#!/usr/bin/env python3
"""Jerusalem (Lagerlöf): clickable-names pass.

The first-generation package bound five of its nine cards with junk
spans ("has borne the name of Ingmar Ingmarsson", "What are you saying,
Storm?", "a Swede named John Hellgum"...). Those are stripped and the
plain names bound: Ingmar (470 bare mentions, the young Ingmar, minus
"Ingmar Farm"), Gertrude, Karin, Hellgum, Storm, Halvor. New cards for
Strong Ingmar, Elof, Hoek Matts Ericsson, Gabriel, Gunhild, Kaisa,
Berger Sven Persson, Bullet Gunner, Dagson, Eva Gunnersdotter, the Dean,
Anna Lisa, the Hellgumists and the village.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'jerusalem'
P = 'person'
JUNK_IDS = {'ingmar-ingmarsson', 'gertrude', 'storm', 'karin', 'hellgum'}


def r(eid, name, subtitle, body, aliases, role='reference', **kw):
    kw.setdefault('strict_editions', ())
    add_e(BOOK, eid, name, subtitle, body, role, P, aliases, **kw)


def strip_junk():
    path = ROOT / f'app/public/data/characters/{BOOK}.v1.json'
    pkg = json.loads(path.read_text())
    for ek, ed in pkg['editions'].items():
        before = len(ed['mentions'])
        ed['mentions'] = [m for m in ed['mentions'] if not (m['characterId'] in JUNK_IDS and 'resolution' not in m and len(m['text'].split()) > 2)]
        print(BOOK, ek, 'removed', before - len(ed['mentions']), 'junk spans')
    path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


def drop_farm():
    path = ROOT / f'app/public/data/characters/{BOOK}.v1.json'
    pkg = json.loads(path.read_text())
    for ek, ed in pkg['editions'].items():
        data = json.loads((ROOT / f'app/public/data/editions/{BOOK}-{ek}.json').read_text())
        paras = {(c['number'], i): p for c in data['chapters'] for i, p in enumerate(c['paragraphs'])}
        before = len(ed['mentions'])
        ed['mentions'] = [m for m in ed['mentions'] if not (m['characterId'] == 'ingmar-ingmarsson' and m['text'] == 'Ingmar' and paras[(m['chapterNumber'], m['paragraphIndex'])][m['endOffset']:m['endOffset'] + 5] == ' Farm')]
        print(BOOK, ek, 'dropped', before - len(ed['mentions']), '"Ingmar Farm" mentions')
    path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


def main():
    strip_junk()
    r('strong-ingmar', 'Strong Ingmar', 'The old fiddler', "The old man of the woods who plays for the dances and has second sight.", ['Strong Ingmar'], role='supporting')
    add_aliases(BOOK, 'big-ingmar', ['big Ingmar'])
    add_aliases(BOOK, 'ingmar-ingmarsson', ['Ingmar Ingmarsson', 'young Ingmar', 'Young Ingmar', 'little Ingmar', 'Ingmar'])
    drop_farm()
    add_aliases(BOOK, 'gertrude', ['Gertrude'])
    add_aliases(BOOK, 'storm', ['Schoolmaster Storm', 'Storm'])
    add_aliases(BOOK, 'karin', ['Karin Ingmarsson', 'Karin'])
    add_aliases(BOOK, 'hellgum', ['John Hellgum', 'Hellgum'])
    add_aliases(BOOK, 'tims-halvor', ['Halvor Halvorsson', 'Halvor'])
    r('elof-ersson', 'Elof Ersson', "Karin's first husband", "The drunkard who dies after his fall.", ['Elof Ersson', 'Elof'], role='supporting')
    r('hoek-matts', 'Hoek Matts Ericsson', 'Hellgumist', "The little man who speaks in church; Gabriel's father.", ['Hoek Matts Ericsson', 'Hoek Matts', 'Matts Ericsson'], role='supporting')
    r('gabriel', 'Gabriel', "Hoek Matts's son", "Jolly Gabriel, who loves Gertrude.", ['Gabriel'], role='supporting')
    r('gunhild', 'Gunhild', "The councilman's daughter", "", ['Gunhild'], role='supporting')
    r('kaisa', 'Kaisa', 'Servant', "", ['Kaisa'])
    r('berger-sven-persson', 'Berger Sven Persson', 'Magistrate', "The richest man in the parish.", ['Berger Sven Persson', 'Bergen Sven Persson', 'Sven Persson'], role='supporting')
    r('bullet-gunner', 'Bullet Gunner', '', "Who first defies the schoolmaster in the mission house.", ['Bullet Gunner', 'Gunner'])
    r('dagson', 'Dagson', '', "", ['Dagson'])
    r('eva-gunnersdotter', 'Eva Gunnersdotter', 'Old Hellgumist', "", ['Eva Gunnersdotter'])
    r('the-dean', 'The Dean', '', "", ['the Dean', 'Dean'])
    r('anna-lisa', 'Anna Lisa', "Strong Ingmar's daughter", "Back from Chicago with Hellgum.", ['Anna Lisa'])
    r('bergskog', 'Bergskog', '', "", ['Bergskog'])
    r('ljung-bjoern', 'Ljung Bjoern', '', "", ['Ljung Bjoern Olofsson', 'Ljung Bjoern Olafsson', 'Ljung Bjoern', 'Bjoern'])
    r('birger-larsson', 'Birger Larsson', '', "", ['Birger Larsson', 'Birger'])
    r('mother-martha', 'Mother Martha', "Big Ingmar's mother", "", ['Mother Martha'])
    r('cowhouse-martha', 'Cowhouse Martha', '', "", ['Cowhouse Martha'])
    r('krister-larsson', 'Krister Larsson', '', "", ['Krister Larsson', 'Krister'])
    r('clementsson', 'Councilman Clementsson', '', "", ['Councilman Lars Clementsson', 'Councillor Clementsson', 'Councilman Clementsson', 'Clementsson'])
    r('edward-gordon', 'Edward Gordon', '', "", ['Edward Gordon'])
    r('mrs-gordon', 'Mrs. Gordon', '', "The young American matron in the shipwreck.", ['Mrs. Gordon'])
    r('eric-clockmaker', 'Eric', 'The clockmaker', "", ['Eric'], only_paragraphs={(4, 48)})
    r('little-eric', 'Little Eric', '', "", ['Eric'], only_paragraphs={(18, 50)})
    r('finne-marit', 'Finne-Marit', '', "", ['Finne-Marit'])
    r('marie-boving', 'Marie Boving', '', "", ['Marie Boving', 'Marie'])
    r('bertil', 'Bertil', '', "", ['Bertil'])
    r('israel-tomasson', 'Israel Tomasson', '', "", ['Israel Tomasson'])
    r('sara-lena', 'Sara Lena', '', "", ['Sara Lena'])
    r('pehr', 'Pehr', '', "", ['Pehr'])
    r('nils-jansson', 'Nils Jansson', '', "", ['Nils Jansson'])
    r('pickaxe-bengt', 'Pickaxe Bengt', '', "", ['Pickaxe Bengt'])
    r('humming-pete', 'Humming Pete', '', "", ['Humming Pete', 'Pete'])
    r('beggar-lina', 'Beggar Lina', '', "", ['Beggar Lina', 'Lina'])
    r('old-lisa', 'Old Lisa', '', "", ['old Lisa'])
    r('kolbjoern', 'Kolbjoern', '', "", ['Kolbjoern'])
    r('jesus', 'Jesus', '', "", ['Jesus'])
    r('luther', 'Luther', '', "", ['Luther'])
    r('melanchton', 'Melanchton', '', "", ['Melanchton'])
    r('noah', 'Noah', '', "", ['Noah'])
    r('jacob', 'Jacob', '', "", ['Jacob'])


if __name__ == '__main__':
    main()
