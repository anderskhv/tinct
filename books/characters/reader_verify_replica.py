#!/usr/bin/env python3
"""Replica of the reader's verifyCharacters() gate (characterCards.ts) so a
package that the app would silently reject can be caught offline. Checks
sourceSha256, per-chapter paragraph hashes (reader normalization), card
fields, storyRole vocabulary, point validity, snapshot >= firstMention and
every mention's UTF-16 slice against its text.
Usage: reader_verify_replica.py [BOOK...]  (default: all packages)
"""
import glob, hashlib, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROLES = {'central', 'major', 'supporting', 'reference'}
norm = lambda t: re.sub(' {2,}', ' ', t.replace('\n', ' '))
def u16slice(t, a, b):
    return t.encode('utf-16-le')[a * 2:b * 2].decode('utf-16-le', 'replace')
def check(book):
    pkg = json.load(open(f'{ROOT}/app/public/data/characters/{book}.v1.json'))
    out = []
    for ek, ed in pkg['editions'].items():
        path = f'{ROOT}/app/public/data/editions/{book}-{ek}.json'
        if not os.path.exists(path): continue
        raw = open(path, 'rb').read()
        if hashlib.sha256(raw).hexdigest() != ed['sourceSha256']: out.append((ek, 'sourceSha256 mismatch')); continue
        data = json.loads(raw)
        paras = {}
        for c in data['chapters']:
            texts = [norm(p) for p in c['paragraphs']]
            if [hashlib.sha256(t.encode()).hexdigest() for t in texts] != ed['paragraphHashes'].get(str(c['number'])):
                out.append((ek, f'paragraphHashes mismatch ch{c["number"]}'))
            paras[c['number']] = texts
        def vp(pt):
            return isinstance(pt, dict) and pt.get('paragraphIndex') is not None and pt['chapterNumber'] in paras and 0 <= pt['paragraphIndex'] < len(paras[pt['chapterNumber']]) and 0 <= pt['offset'] <= len(paras[pt['chapterNumber']][pt['paragraphIndex']].encode('utf-16-le')) // 2
        cmp = lambda a, b: (a['chapterNumber'], a['paragraphIndex'], a['offset']) >= (b['chapterNumber'], b['paragraphIndex'], b['offset'])
        ids = set()
        for c in ed['characters']:
            if c['id'] in ids: out.append((ek, f'dup id {c["id"]}'))
            ids.add(c['id'])
            if c.get('storyRole') not in ROLES: out.append((ek, f'{c["id"]}: storyRole {c.get("storyRole")!r}'))
            if not isinstance(c.get('kind'), str): out.append((ek, f'{c["id"]}: kind'))
            if not vp(c.get('firstMention')): out.append((ek, f'{c["id"]}: firstMention invalid'))
            if not vp(c.get('roleVisibleAt')): out.append((ek, f'{c["id"]}: roleVisibleAt invalid'))
            if not c.get('snapshots'): out.append((ek, f'{c["id"]}: no snapshots'))
            for s in c.get('snapshots', []):
                if not vp(s.get('availableAt')): out.append((ek, f'{c["id"]}: snapshot availableAt invalid'))
                elif not cmp(s['availableAt'], c['firstMention']): out.append((ek, f'{c["id"]}: snapshot before firstMention'))
                if not all(isinstance(s.get(k), str) for k in ('name', 'subtitle', 'body')): out.append((ek, f'{c["id"]}: snapshot field not a string'))
        for m in ed['mentions']:
            if m['characterId'] not in ids: out.append((ek, f'mention of unknown {m["characterId"]}')); continue
            t = paras.get(m['chapterNumber'], [None] * 0)
            if m['paragraphIndex'] >= len(t) or m['endOffset'] <= m['startOffset'] or u16slice(t[m['paragraphIndex']], m['startOffset'], m['endOffset']) != m['text']:
                out.append((ek, f'{m["characterId"]}: mention slice mismatch at ({m["chapterNumber"]},{m["paragraphIndex"]})'))
    return out
books = sys.argv[1:] or sorted(os.path.basename(p)[:-8] for p in glob.glob(f'{ROOT}/app/public/data/characters/*.v1.json'))
bad = 0
for b in books:
    for ek, msg in check(b)[:20]:
        bad += 1; print(f'REJECT {b} {ek}: {msg}')
print('reader-gate problems:', bad, 'across', len(books), 'books')
