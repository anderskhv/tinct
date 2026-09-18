#!/usr/bin/env python3
"""Add ONE new entity to an existing character package via bare-name regex
binding in every edition, without touching any existing character or
mention. Safe for books whose released package uses per-edition alias
sets that build_generic.py's single shared-alias-per-entity model can't
reproduce (rebuilding the whole file risks silently dropping entities
whose only alias differs by edition -- see iliad's Roman/Greek divine
names for a real example this session hit).

Usage: define BOOK, ID, NAME, ROLE, KIND, BODY, ALIASES below and run.
Only binds bare-word matches of each alias; does not touch existing
mentions/characters; asserts no id or span collision before writing.
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def bind(book_id, edition_key, aliases):
    """Bind every alias, then drop shorter matches that overlap a longer
    one at the same position (multiple aliases for one entity, e.g. a
    full name and its shortened form, otherwise create two mentions for
    the same word span -- ambiguous at read time, since the live reader's
    resolveCharacter() picks the *narrowest* overlapping mention and only
    resolves if all narrowest matches agree on character id; two mentions
    for the same id at different widths are themselves harmless there,
    but this keeps the compiled data equivalent to what build_generic.py
    would produce and avoids the redundancy entirely)."""
    path = ROOT / f'app/public/data/editions/{book_id}-{edition_key}.json'
    if not path.exists():
        return None
    data = json.loads(path.read_bytes())
    patterns = [re.compile(r'(?<!\w)' + re.escape(a) + r'(?!\w)') for a in aliases]
    mentions = []
    for c in data['chapters']:
        for pi, p in enumerate(c['paragraphs']):
            text = normalized(p)
            candidates = []
            for pat in patterns:
                for m in pat.finditer(text):
                    candidates.append((m.start(), m.end()))
            chosen = []
            for a, b in sorted(set(candidates), key=lambda z: (-(z[1] - z[0]), z[0])):
                if any(a < cb and b > ca for ca, cb in chosen):
                    continue  # overlaps an already-chosen, longer-or-equal span
                chosen.append((a, b))
            for a, b in sorted(chosen):
                mentions.append({'chapterNumber': c['number'], 'paragraphIndex': pi,
                                  'startOffset': u16(text[:a]), 'endOffset': u16(text[:b]),
                                  'text': text[a:b], 'resolution': 'reviewed-name'})
    mentions.sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
    return mentions


def add_entity(book, eid, name, subtitle, body, role, kind, aliases, editions=('original-en', 'modern-en'), strict_editions=('original-en',)):
    char_path = ROOT / f'app/public/data/characters/{book}.v1.json'
    pkg = json.loads(char_path.read_text())
    for ek in editions:
        if ek not in pkg['editions']:
            continue
        ed = pkg['editions'][ek]
        assert eid not in {c['id'] for c in ed['characters']}, f'{eid} already exists in {ek}'
        existing_spans = {(m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset']) for m in ed['mentions']}
        mentions = bind(book, ek, aliases)
        if mentions is None:
            continue
        if not mentions:
            if ek in strict_editions:
                assert mentions, f'no matches for {eid} in {ek}'
            print(book, ek, eid, 'WARNING: no matches, skipping this edition (aliases may not match this translation\'s spelling)')
            continue
        # Skip any match that overlaps an existing mention of ANOTHER character
        # (not just exact-span collisions): a bare "PAGE" bound inside an
        # existing "MISTRESS PAGE" made the reader's narrowest-match rule
        # resolve her lines to her husband (merry-wives-of-windsor, caught by
        # validate_package.py's cross-id overlap check).
        by_para = {}
        for (chn, pi, a, b) in existing_spans:
            by_para.setdefault((chn, pi), []).append((a, b))
        clean = []
        skipped = 0
        for m in mentions:
            spans = by_para.get((m['chapterNumber'], m['paragraphIndex']), [])
            if any(m['startOffset'] < b and m['endOffset'] > a for a, b in spans):
                skipped += 1
            else:
                clean.append(m)
        if skipped:
            print(book, ek, eid, f'skipped {skipped} match(es) overlapping existing mentions of other characters')
        mentions = clean
        if not mentions:
            print(book, ek, eid, 'WARNING: every match overlapped an existing mention; nothing added for this edition')
            continue
        for m in mentions:
            m['characterId'] = eid
        first = mentions[0]
        point = {'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'offset': first['endOffset']}
        ed['characters'].append({
            'id': eid, 'kind': kind, 'storyRole': role,
            'roleVisibleAt': point, 'firstMention': point,
            'snapshots': [{
                'id': eid + '-1', 'availableAt': point, 'name': name, 'subtitle': subtitle, 'body': body,
                'evidence': [{'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'throughOffset': point['offset']}],
                'editorialBasis': 'Reviewed baseline identity at first mention; no concealed identity or later plot development.',
            }],
        })
        ed['mentions'].extend(mentions)
        ed['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        print(book, ek, eid, len(mentions), 'mentions added')
    char_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')
