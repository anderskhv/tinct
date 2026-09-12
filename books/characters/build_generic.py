#!/usr/bin/env python3
"""Generic offline compiler for novel/prose character packages.

Takes a per-book Python module (books/characters/entities/<book>.py) exposing
BOOK_ID, LANGUAGE (default 'en'), CONTENT_VERSION, EDITIONS (list of edition
keys to compile, e.g. ['original-en','modern-en']) and ENTITIES: a list of
dicts {id, kind, storyRole, aliases: [str,...], subtitle, body}.

For each edition, every alias is matched with word-boundary regex against the
normalized paragraph text (same normalization as the reader). Overlapping
matches are resolved by preferring the longest span; an unresolved overlap
between two different character ids raises, so ambiguous aliases must be
fixed by hand (narrowed or removed) rather than silently guessed.

A character with zero matches in a given edition is simply omitted from that
edition's compiled character list (mirrors the existing bible/awakening
packages, where modern editions can omit an entity presolutely reviewed out).

No network or model calls. Pure text matching against the real served edition
bytes, so the compiled package binds to the actual production JSON.
"""
import hashlib, importlib, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = Path(__file__).resolve().parent


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def u16(text):
    return len(text.encode('utf-16-le')) // 2


def point(ch, pi, offset):
    return {'chapterNumber': ch, 'paragraphIndex': pi, 'offset': offset}


def key(p):
    return p['chapterNumber'], p['paragraphIndex'], p['offset']


def digest(s):
    return hashlib.sha256(s.encode()).hexdigest()


def paragraphs(data):
    return {(c['number'], pi): normalized(p) for c in data['chapters'] for pi, p in enumerate(c['paragraphs'])}


def alias_pattern(alias):
    return re.compile(r'(?<!\w)' + re.escape(alias) + r'(?!\w)')


def match_all(entities, paras):
    mentions = []
    for (ch, pi), text in paras.items():
        candidates = []
        for e in entities:
            for alias in e['aliases']:
                for m in alias_pattern(alias).finditer(text):
                    candidates.append((m.start(), m.end(), e['id']))
        chosen = []
        for a, b, cid in sorted(set(candidates), key=lambda z: (-(z[1] - z[0]), z[0])):
            overlap = [c for c in chosen if a < c[1] and b > c[0]]
            if overlap:
                if any(c[2] != cid for c in overlap):
                    raise ValueError(f'Ambiguous match {ch}:{pi} {text[a:b]!r} -> {cid} vs {[c[2] for c in overlap]}')
                continue
            chosen.append((a, b, cid))
        for a, b, cid in sorted(chosen):
            mentions.append({'characterId': cid, 'chapterNumber': ch, 'paragraphIndex': pi,
                              'startOffset': u16(text[:a]), 'endOffset': u16(text[:b]),
                              'text': text[a:b], 'resolution': 'reviewed-name'})
    return mentions


def compile_edition(book_id, edition_key, entities):
    path = ROOT / f'app/public/data/editions/{book_id}-{edition_key}.json'
    raw = path.read_bytes()
    data = json.loads(raw)
    paras = paragraphs(data)
    mentions = match_all(entities, paras)
    by_char = {}
    for m in mentions:
        by_char.setdefault(m['characterId'], []).append(m)
    compiled_chars = []
    dropped = []
    for e in entities:
        ms = by_char.get(e['id'])
        if not ms:
            dropped.append(e['id'])
            continue
        first = min(ms, key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        first_point = point(first['chapterNumber'], first['paragraphIndex'], first['endOffset'])
        snapshot = {
            'id': e['id'] + '-1', 'availableAt': first_point,
            'name': e.get('displayName', first['text']),
            'subtitle': e['subtitle'], 'body': e['body'],
            'evidence': [{'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'throughOffset': first_point['offset']}],
            'editorialBasis': 'Reviewed baseline identity at first mention; no concealed identity or later plot development.',
        }
        compiled_chars.append({
            'id': e['id'], 'kind': e['kind'], 'storyRole': e['storyRole'],
            'roleVisibleAt': first_point, 'firstMention': first_point,
            'snapshots': [snapshot],
        })
    hashes = {str(c['number']): [digest(paras[c['number'], pi]) for pi in range(len(c['paragraphs']))] for c in data['chapters']}
    edition = {
        'sourcePath': str(path.relative_to(ROOT)),
        'sourceSha256': digest(raw.decode()) if False else hashlib.sha256(raw).hexdigest(),
        'chapterCount': len(data['chapters']),
        'paragraphCount': len(paras),
        'paragraphHashes': hashes,
        'characters': compiled_chars,
        'mentions': [m for m in mentions if m['characterId'] not in dropped],
        'ignoredContextMatches': [],
    }
    return edition, dropped


def compile_book(module_name):
    mod = importlib.import_module(f'entities.{module_name}')
    book_id = mod.BOOK_ID
    language = getattr(mod, 'LANGUAGE', 'en')
    content_version = mod.CONTENT_VERSION
    edition_keys = mod.EDITIONS
    entities = mod.ENTITIES
    ids = [e['id'] for e in entities]
    assert len(ids) == len(set(ids)), 'duplicate id'
    assert all(e['storyRole'] in {'central', 'major', 'supporting', 'reference'} for e in entities)
    editions = {}
    all_dropped = {}
    for ek in edition_keys:
        editions[ek], dropped = compile_edition(book_id, ek, entities)
        all_dropped[ek] = dropped
    compiled = {
        'schemaVersion': 1, 'bookId': book_id, 'language': language,
        'contentVersion': content_version, 'normalization': 'prose-reader-v1',
        'offsetUnit': 'utf16', 'reviewStatus': 'authoring-agent-reviewed',
        'editions': editions,
    }
    report = {ek: {'characters': len(editions[ek]['characters']), 'mentions': len(editions[ek]['mentions']), 'dropped': all_dropped[ek]} for ek in edition_keys}
    return compiled, report


def main():
    book = sys.argv[1]
    out_dir = BASE / book
    out_dir.mkdir(parents=True, exist_ok=True)
    compiled, report = compile_book(book)
    (out_dir / 'characters.v1.json').write_text(json.dumps(compiled, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
