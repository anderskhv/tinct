#!/usr/bin/env python3
"""Rebind every existing character's known name forms across the whole text.

The first-generation packages for the epics and histories bound at most 30
mentions per character (Odysseus/"Ulysses" ×30, Zeus/"Jove" ×30, ...), so
every later occurrence was dead. For each character this takes the
distinct `text` forms already bound to it and binds all remaining
occurrences, longest form first, skipping any span that overlaps an
existing mention of any character. Forms shared by two characters (a
bare "Ajax" bound to both Ajaxes) are left alone and reported.

Usage: rebind_capped_names.py BOOK... [--dry-run]
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_aliases import point_key, mention_end_point

ROOT = Path(__file__).resolve().parents[2]


def normalized(text):
    return text.replace('\r\n', '\n')


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def process(book, dry_run=False):
    char_path = ROOT / f'app/public/data/characters/{book}.v1.json'
    pkg = json.loads(char_path.read_text())
    for ek, ed in pkg['editions'].items():
        ed_path = ROOT / f'app/public/data/editions/{book}-{ek}.json'
        if not ed_path.exists():
            continue
        data = json.loads(ed_path.read_bytes())
        paras = {(c['number'], pi): normalized(p) for c in data['chapters'] for pi, p in enumerate(c['paragraphs'])}
        # Only characters from the first-generation package (their mentions
        # carry no `resolution` field). Later batch-added characters are
        # often paragraph-restricted homonym splits and must not be expanded.
        # Concept cards ("friendship", "the-sovereign") keep their curated
        # 30: expanding a common noun everywhere is a different product call.
        person_ids = {c['id'] for c in ed['characters'] if c.get('kind') in ('person', 'deity')}
        original_ids = {m['characterId'] for m in ed['mentions'] if 'resolution' not in m and m['characterId'] in person_ids}
        forms = {}
        for m in ed['mentions']:
            if m['characterId'] in original_ids:
                forms.setdefault(m['characterId'], set()).add(m['text'])
        owners = {}
        for cid, fs in forms.items():
            for f in fs:
                owners.setdefault(f, set()).add(cid)
        shared = {f for f, o in owners.items() if len(o) > 1}
        if shared:
            print(book, ek, 'shared forms left alone:', sorted(shared))
        taken = {}
        for m in ed['mentions']:
            taken.setdefault((m['chapterNumber'], m['paragraphIndex']), []).append((m['startOffset'], m['endOffset']))
        # longest forms first across all characters
        jobs = sorted(((f, cid) for cid, fs in forms.items() for f in fs if f not in shared and len(f) >= 3), key=lambda z: -len(z[0]))
        added = {}
        new_mentions = []
        for form, cid in jobs:
            pat = re.compile(r'(?<!\w)' + re.escape(form) + r'(?!\w)')
            for key, text in paras.items():
                for m in pat.finditer(text):
                    a, b = u16(text[:m.start()]), u16(text[:m.end()])
                    if any(a < tb and b > ta for ta, tb in taken.get(key, [])):
                        continue
                    taken.setdefault(key, []).append((a, b))
                    new_mentions.append({'chapterNumber': key[0], 'paragraphIndex': key[1], 'startOffset': a, 'endOffset': b,
                                         'text': m.group(), 'characterId': cid, 'resolution': 'reviewed-name'})
                    added[cid] = added.get(cid, 0) + 1
        if dry_run:
            print(book, ek, 'would add', sum(added.values()), dict(sorted(added.items(), key=lambda z: -z[1])[:12]))
            continue
        ed['mentions'].extend(new_mentions)
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        moved = []
        for c in ed['characters']:
            ms = [m for m in ed['mentions'] if m['characterId'] == c['id']]
            if not ms:
                continue
            earliest = min(ms, key=mention_end_point)
            if mention_end_point(earliest) < point_key(c['firstMention']):
                pt = {'chapterNumber': earliest['chapterNumber'], 'paragraphIndex': earliest['paragraphIndex'], 'offset': earliest['endOffset']}
                c['firstMention'] = pt
                c['roleVisibleAt'] = dict(pt)
                snap = min(c['snapshots'], key=lambda s: point_key(s['availableAt']))
                snap['availableAt'] = dict(pt)
                moved.append(c['id'])
        print(book, ek, 'added', sum(added.values()), 'mentions;', dict(sorted(added.items(), key=lambda z: -z[1])[:12]), 'firstMention moved:', moved)
    if not dry_run:
        char_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry-run' in sys.argv
    for b in args:
        process(b, dry)
