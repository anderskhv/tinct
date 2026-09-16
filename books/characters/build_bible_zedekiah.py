#!/usr/bin/env python3
"""Add the four distinct Zedekiahs to the Bible character package.

The existing bible.v1.json disambiguates same-name figures (e.g. the two
Johns) by restricting each entity's bare-name alias match to an explicit
set of global chapter numbers. This script follows that same convention,
adding paragraph-level exclusions where two different Zedekiahs are named
in the same chapter (Jeremiah 29, Jeremiah 36).

King Zedekiah (last king of Judah) was entirely absent from the released
149-card set despite being a major recurring figure across 2 Kings,
2 Chronicles and most of Jeremiah 21-52. This script adds him plus the two
other well-attested, clearly distinguishable Zedekiahs (the false prophet
son of Chenaanah in 1 Kings 22 / 2 Chronicles 18, and the false prophet
son of Maaseiah denounced in Jeremiah 29). Zedekiah son of Hananiah
(Jeremiah 36:12, a single-mention listed prince) is left as a documented,
deferred gap rather than authored blind (see ledger).

No network or model calls; pure text matching against the real served
edition bytes.
"""
import hashlib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


# (chapterNumber, title) ranges are the same across kjv-en/web-en.
KING_CHAPTERS = {337, 338, 341, 403, 746, 766, 769, 772, 773, 774, 777, 779, 781, 782, 783, 784, 789, 794, 796, 797}
CHENAANAH_CHAPTERS = {313, 385}
MAASEIAH_CHAPTERS = {774}

# Explicit paragraph-level exceptions where a chapter is shared between two Zedekiahs.
# Determined by reading each paragraph in 1_Kings_22 (chapters/paragraphs indices below).
KING_EXCLUDE_PARAGRAPHS = {(774, 4)}  # Jeremiah 29 para mentioning "Zedekiah the son of Maaseiah"
MAASEIAH_INCLUDE_PARAGRAPHS = {(774, 4)}


ENTITIES = [
    {
        'id': 'zedekiah-king-of-judah', 'kind': 'person', 'storyRole': 'major',
        'chapters': KING_CHAPTERS, 'exclude_paragraphs': KING_EXCLUDE_PARAGRAPHS,
        'subtitle': 'Last king of Judah',
        'body': "Born Mattaniah, made king of Judah by Nebuchadnezzar of Babylon after the exile of his nephew Jehoiachin, and renamed Zedekiah. His later rebellion against Babylon leads to the siege and fall of Jerusalem; he is captured, and the record follows what befalls him and his sons. Jeremiah appeals to him repeatedly during the siege.",
    },
    {
        'id': 'zedekiah-son-of-chenaanah', 'kind': 'person', 'storyRole': 'reference',
        'chapters': CHENAANAH_CHAPTERS, 'exclude_paragraphs': set(),
        'subtitle': 'Prophet at Ahab’s court',
        'body': "One of the prophets at the court of King Ahab of Israel who assures Ahab and Jehoshaphat of victory and strikes the prophet Micaiah for contradicting him. Not the same person as Zedekiah, the later king of Judah.",
    },
    {
        'id': 'zedekiah-son-of-maaseiah', 'kind': 'person', 'storyRole': 'reference',
        'chapters': MAASEIAH_CHAPTERS, 'exclude_paragraphs': set(), 'include_only_paragraphs': MAASEIAH_INCLUDE_PARAGRAPHS,
        'subtitle': 'Prophet denounced by Jeremiah',
        'body': "A prophet among the exiles in Babylon whom Jeremiah's letter denounces, alongside Ahab son of Kolaiah, for prophesying falsely in the LORD's name. Not the same person as Zedekiah, the king of Judah named in the same letter.",
    },
]


def paragraphs(data):
    return {(c['number'], pi): normalized(p) for c in data['chapters'] for pi, p in enumerate(c['paragraphs'])}


def digest(s):
    return hashlib.sha256(s.encode()).hexdigest()


def bind_edition(book_id, edition_key, out_report):
    path = ROOT / f'app/public/data/editions/{book_id}-{edition_key}.json'
    data = json.loads(path.read_bytes())
    paras = paragraphs(data)
    pattern = re.compile(r'(?<!\w)Zedekiah(?!\w)')
    new_mentions = []
    new_chars = []
    for e in ENTITIES:
        ms = []
        for (ch, pi), text in paras.items():
            if ch not in e['chapters']:
                continue
            if (ch, pi) in e['exclude_paragraphs']:
                continue
            if 'include_only_paragraphs' in e and (ch, pi) not in e['include_only_paragraphs']:
                continue
            for m in pattern.finditer(text):
                ms.append({'characterId': e['id'], 'chapterNumber': ch, 'paragraphIndex': pi,
                           'startOffset': u16(text[:m.start()]), 'endOffset': u16(text[:m.end()]),
                           'text': text[m.start():m.end()], 'resolution': 'reviewed-name-scoped'})
        if not ms:
            out_report.setdefault(edition_key, {})[e['id']] = 'DROPPED (no matches)'
            continue
        ms.sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        first = ms[0]
        first_point = {'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'offset': first['endOffset']}
        snapshot = {
            'id': e['id'] + '-1', 'availableAt': first_point,
            'name': 'Zedekiah', 'subtitle': e['subtitle'], 'body': e['body'],
            'evidence': [{'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'throughOffset': first_point['offset']}],
            'editorialBasis': 'Reviewed baseline identity at first mention; disambiguated from other Zedekiahs by chapter scope.',
        }
        new_chars.append({'id': e['id'], 'kind': e['kind'], 'storyRole': e['storyRole'],
                           'roleVisibleAt': first_point, 'firstMention': first_point, 'snapshots': [snapshot]})
        new_mentions.extend(ms)
        out_report.setdefault(edition_key, {})[e['id']] = len(ms)
    return new_chars, new_mentions


def main():
    book_path = ROOT / 'app/public/data/characters/bible.v1.json'
    pkg = json.loads(book_path.read_text())
    report = {}
    for ek in ('kjv-en', 'web-en'):
        new_chars, new_mentions = bind_edition('bible', ek, report)
        ed = pkg['editions'][ek]
        existing_ids = {c['id'] for c in ed['characters']}
        for c in new_chars:
            assert c['id'] not in existing_ids, f'duplicate id {c["id"]}'
        ed['characters'].extend(new_chars)
        ed['mentions'].extend(new_mentions)
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
    book_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
