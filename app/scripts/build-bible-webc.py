#!/usr/bin/env python3
"""Publish the accepted WEB Catholic candidate as the Bible edition `webc-en`.

The candidate numbers its 1,328 chapters in its own Catholic reading order.
Every Tinct Bible edition shares one chapter numbering (Genesis 1 = 1 ...
Revelation 22 = 1189) and all saved reader data (places, finished chapters,
conversations, highlights, the cast file) is keyed by it. So the published
edition keeps the Catholic reading order but numbers each chapter by the
passage it is: a chapter the 66-book editions also have gets their number
(Esther (Greek) 4 = Esther 4 = 430), and the chapters only this edition has
(Tobit, Judith, 1-2 Maccabees, Wisdom, Sirach, Baruch, Daniel 13-14) get
1190-1328 in reading order.

The paragraphs of every chapter are the candidate's, byte for byte; only the
chapter numbers and, for shared chapters, the titles (taken from BSB so a
passage is named the same in every edition) change. Book titles in the
contents keep the source's "Esther (Greek)" / "Daniel (Greek)".

Usage:
  python3 scripts/build-bible-webc.py <candidate.json> <chapter-crosswalk.json>
then split into chapter shards:
  node scripts/split-edition-chapters.cjs --write-registry bible-webc-en
"""
import hashlib
import json
import sys
from pathlib import Path

APP = Path(__file__).resolve().parent.parent
CANDIDATE_SHA256 = 'ecaee43e09e68d5411091da3110a5280abe09e0cf5d39f10cc247571f37c5bfb'
CROSSWALK_SHA256 = '42cb12ff4ba8a8c10a18cd92082632a12d5fa5bf0a3d9ca3dfaa08928f939e84'
SHARED_CHAPTERS = 1189
# Greek Esther and Greek Daniel are the books the 66-book editions call
# Esther and Daniel; their chapters correspond by number (the source's own
# numbering follows the Hebrew chapters). Verse-level differences are handled
# in the reader (src/data/bibleEditionChapters.ts), not here.
SAME_BOOK = {'ESG': 'EST', 'DAG': 'DAN'}
# The 66-book order every shared numbering follows.
PROTESTANT_ORDER = (
    'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG '
    'ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL '
    'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'
).split()


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def paragraphs_sha(paragraphs) -> str:
    """Hash of the paragraphs as JavaScript's JSON.stringify writes them (checked by bibleWebCatholic.test.ts)."""
    return hashlib.sha256(json.dumps(paragraphs, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def main() -> None:
    candidate_path, crosswalk_path = map(Path, sys.argv[1:3])
    if sha256(candidate_path) != CANDIDATE_SHA256:
        sys.exit(f'candidate hash mismatch: {candidate_path}')
    if sha256(crosswalk_path) != CROSSWALK_SHA256:
        sys.exit(f'crosswalk hash mismatch: {crosswalk_path}')
    candidate = json.loads(candidate_path.read_text())
    crosswalk = json.loads(crosswalk_path.read_text())
    bsb = json.loads((APP / 'public/data/editions/bible-bsb-en.json').read_text())
    if crosswalk['sourceSha256'] != CANDIDATE_SHA256:
        sys.exit('crosswalk does not describe this candidate')

    # BSB chapter counts per book, in 66-book order, define the shared numbers.
    counts: dict[str, int] = {}
    for row in crosswalk['chapters']:
        code = SAME_BOOK.get(row['bookCode'], row['bookCode'])
        if code in PROTESTANT_ORDER:
            counts[code] = max(counts.get(code, 0), row['biblicalChapter'])
    counts['DAN'] = 12  # Daniel 13-14 (Susanna, Bel and the Dragon) are not in the 66-book Daniel.
    shared: dict[tuple[str, int], int] = {}
    number = 0
    for code in PROTESTANT_ORDER:
        for chapter in range(1, counts[code] + 1):
            number += 1
            shared[(code, chapter)] = number
    if number != SHARED_CHAPTERS or len(bsb['chapters']) != SHARED_CHAPTERS:
        sys.exit(f'shared numbering has {number} chapters')
    bsb_titles = {chapter['number']: chapter['title'] for chapter in bsb['chapters']}

    by_native = {chapter['number']: chapter for chapter in candidate['chapters']}
    renumber: dict[int, int] = {}
    rows = []
    extra = SHARED_CHAPTERS
    for row in crosswalk['chapters']:
        native = row['chapterNumber']
        code = SAME_BOOK.get(row['bookCode'], row['bookCode'])
        target = shared.get((code, row['biblicalChapter']))
        if target is None:
            extra += 1
            target = extra
        renumber[native] = target
        source = by_native[native]
        rows.append({
            'native': native, 'number': target, 'bookCode': row['bookCode'], 'biblicalChapter': row['biblicalChapter'],
            'paragraphsSha256': paragraphs_sha(source['paragraphs']),
        })
    if sorted(renumber.values()) != list(range(1, len(candidate['chapters']) + 1)):
        sys.exit('renumbering is not a bijection')

    chapters = []
    for chapter in candidate['chapters']:
        target = renumber[chapter['number']]
        title = bsb_titles.get(target, chapter['title'])
        chapters.append({**chapter, 'number': target, 'title': title})

    def remap(sections):
        out = []
        for section in sections:
            next_section = dict(section)
            if 'chapters' in section:
                next_section['chapters'] = [renumber[n] for n in section['chapters']]
            if 'sections' in section:
                next_section['sections'] = remap(section['sections'])
            out.append(next_section)
        return out

    edition = {'sections': remap(candidate['sections']), 'chapters': chapters}
    out = APP / 'public/data/editions/bible-webc-en.json'
    out.write_text(json.dumps(edition, ensure_ascii=False, indent=2) + '\n')
    numbering = {
        'note': 'WEB Catholic (webc-en): candidate chapter -> shared Tinct Bible chapter number. Written by scripts/build-bible-webc.py.',
        'candidateSha256': CANDIDATE_SHA256,
        'crosswalkSha256': CROSSWALK_SHA256,
        'sharedChapters': SHARED_CHAPTERS,
        'chapters': rows,
    }
    (APP / 'data/bible-webc-en.numbering.json').write_text(json.dumps(numbering, indent=1) + '\n')
    print(f'wrote {out.relative_to(APP)}: {len(chapters)} chapters, {extra - SHARED_CHAPTERS} beyond the shared {SHARED_CHAPTERS}')


if __name__ == '__main__':
    main()
