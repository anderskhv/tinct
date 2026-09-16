#!/usr/bin/env python3
"""Resolve TIPNR verse references against Tinct's Bible edition JSON.

Tinct's Bible paragraphs embed KJV-style verse markers as Unicode
superscript digits (e.g. "¹ In the beginning… ² And the earth…"). This
module splits each chapter's paragraphs into (verseNumber -> (paragraphIndex,
normalizedText, startOffsetInParagraph, endOffsetInParagraph)) so a TIPNR
reference like Gen.4.14 can be turned into an exact paragraph+offset span to
search for a name within, independent of paragraph boundaries (which do not
line up 1:1 with verses).
"""
import json, re
from pathlib import Path
from book_map import TIPNR_TO_TITLE

ROOT = Path(__file__).resolve().parents[3]
SUPER = '0123456789'
SUPER_MAP = {'⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
             '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'}
SUPER_RE = re.compile('[' + ''.join(SUPER_MAP) + ']+')


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def to_ascii_digits(s):
    return ''.join(SUPER_MAP.get(ch, ch) for ch in s)


class Edition:
    def __init__(self, edition_key):
        self.key = edition_key
        self.path = f'app/public/data/editions/bible-{edition_key}.json'
        self.data = json.loads((ROOT / self.path).read_bytes())
        self.title_to_num = {c['title']: c['number'] for c in self.data['chapters']}
        self.chapters_by_num = {c['number']: c for c in self.data['chapters']}
        self._verse_cache = {}

    def chapter_number(self, book_abbrev, chapter):
        title = TIPNR_TO_TITLE[book_abbrev]
        key = f'{title} {chapter}'
        if key in self.title_to_num:
            return self.title_to_num[key]
        if chapter == 1 and title in self.title_to_num:
            return self.title_to_num[title]
        return None

    def verses(self, global_chapter_num):
        """Return {verseNumber: [(paragraphIndex, normText, start, end), ...]}.
        A verse can span into a paragraph without ever finding its end marker
        (last verse of a paragraph) -> end = len(normText). A verse number can
        repeat across paragraphs only if the text itself repeats a marker,
        which does not happen in this corpus (checked at parse time)."""
        if global_chapter_num in self._verse_cache:
            return self._verse_cache[global_chapter_num]
        c = self.chapters_by_num[global_chapter_num]
        out = {}
        for pi, p in enumerate(c['paragraphs']):
            text = normalized(p)
            markers = list(SUPER_RE.finditer(text))
            if not markers:
                continue
            for idx, m in enumerate(markers):
                vnum = int(to_ascii_digits(m.group()))
                start = m.end()
                end = markers[idx + 1].start() if idx + 1 < len(markers) else len(text)
                out.setdefault(vnum, []).append((pi, text, start, end))
        self._verse_cache[global_chapter_num] = out
        return out


REF_RE = re.compile(r'^([1-3]?[A-Za-z]{2,4})\.(\d+)\.(\d+)([a-z]?)$')


def parse_refs(refs_raw):
    """'Exo.4.14; Exo.4.27; 2Ki.25.7a' -> [('Exo',4,14,''), ('Exo',4,27,''), ('2Ki',25,7,'a')]"""
    out = []
    for part in refs_raw.split(';'):
        part = part.strip()
        if not part:
            continue
        m = REF_RE.match(part)
        if m:
            book, ch, v, letter = m.groups()
            out.append((book, int(ch), int(v), letter))
        else:
            out.append(None)  # unparsed, caller should count/report
    return out
