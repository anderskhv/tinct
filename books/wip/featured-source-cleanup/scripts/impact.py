#!/usr/bin/env python3
"""Downstream-coordinate impact of the cleanup, computed from files on the pinned main commit.

Writes <book>/downstream-impact.json.  Reads only; modifies nothing outside the package.
  * character cards: every (chapterNumber, paragraphIndex[, offset]) coordinate in mentions and in
    character anchor fields, classified as unchanged / renumber / merge-shift / drop, with the new
    coordinate for each one;
  * paragraph-hash arrays that must be recomputed;
  * chapter-shard manifests whose paragraphCount changes;
  * modern-da: whether the same structural op applies mechanically (report only; not prepared).
"""
import hashlib, json, os, re, subprocess

ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True, check=True).stdout.strip()
PKG = os.path.join(ROOT, 'books/wip/featured-source-cleanup')
S = json.load(open(os.path.join(PKG, 'build-summary.json')))
MAIN = S['pins']['main']

def show(path):
    return subprocess.run(['git', '-C', ROOT, 'show', f'{MAIN}:{path}'], capture_output=True, check=True).stdout

def u16(s):
    return len(s.encode('utf-16-le')) // 2

def load_map(book):
    m = {}
    for line in open(os.path.join(PKG, book, 'paragraph-map.tsv')):
        if line.startswith('#') or line.startswith('old_'):
            continue
        c, i, nc, ni, op, so, sm = line.rstrip('\n').split('\t')
        m[(int(c), int(i))] = (op, int(ni) if ni else None, int(so) if so else 0, int(sm) if sm else 0)
    return m

def coords(obj, path=''):
    if isinstance(obj, dict):
        if 'chapterNumber' in obj and 'paragraphIndex' in obj:
            yield path, obj
        for k, v in obj.items():
            yield from coords(v, f'{path}.{k}')
    elif isinstance(obj, list):
        for n, v in enumerate(obj):
            yield from coords(v, f'{path}[{n}]')

OD_CLAUSE_LEN = u16('Now when the sun had set and darkness was over the land,')

def classify(book, ed, M, c):
    ch, pi = c['chapterNumber'], c['paragraphIndex']
    off = c.get('offset', c.get('startOffset'))
    if book == 'odyssey':
        if ed == 'original-en' and (ch, pi) == (3, 37) and off is not None and off >= OD_CLAUSE_LEN:
            return 'drop', None
        if ed == 'original-en' and (ch, pi) == (3, 37):
            return 'unchanged-index-text-changed', (ch, pi, off)
        return 'unchanged', (ch, pi, off)
    if (ch, pi) not in M:
        return 'unchanged', (ch, pi, off)
    op, ni, so, sm = M[(ch, pi)]
    if op == 'delete':
        return 'drop', None
    if op == 'merge-tail':
        sh = so if ed == 'original-en' else sm
        return 'merge-shift', (ch, ni, None if off is None else off + sh)
    if op == 'renumber':
        return 'renumber', (ch, ni, off)
    if op == 'merge-head':
        return 'merge-head', (ch, ni, off)
    return 'unchanged', (ch, pi, off)

def main():
    for book, info in S['books'].items():
        M = load_map(book)
        card = json.loads(show(f'app/public/data/characters/{book}.v1.json'))
        out = {'card': f'app/public/data/characters/{book}.v1.json', 'card_contentVersion': card['contentVersion'],
               'card_offsetUnit': card.get('offsetUnit'), 'editions': {}}
        for ed, E in card['editions'].items():
            new_sha = info['files'][ed]['sha256'] if ed in info['files'] else None
            rec = {'card_sourceSha256': E['sourceSha256'], 'package_input_sha256': info['files'][ed]['input_sha256'],
                   'card_pinned_to_package_input': E['sourceSha256'] == info['files'][ed]['input_sha256'],
                   'new_sourceSha256': new_sha,
                   'paragraphCount': [E['paragraphCount'], info['files'][ed]['paragraphs']],
                   'paragraphHashes_chapters_to_recompute': sorted({k for k, _ in M} | ({3} if book == 'odyssey' and ed == 'original-en' else set())),
                   'counts': {}, 'moves': []}
            for kind, items in (('mention', [(f'mentions[{n}]', m) for n, m in enumerate(E['mentions'])]),
                                ('anchor', list(coords(E['characters'], 'characters')))):
                for path, c in items:
                    cl, new = classify(book, ed, M, c)
                    rec['counts'][f'{kind}:{cl}'] = rec['counts'].get(f'{kind}:{cl}', 0) + 1
                    if cl not in ('unchanged',):
                        old = (c['chapterNumber'], c['paragraphIndex'], c.get('offset', c.get('startOffset')))
                        rec['moves'].append({'path': path, 'kind': kind, 'class': cl, 'old': old, 'new': new,
                                             'text': c.get('text'), 'characterId': c.get('characterId')})
            out['editions'][ed] = rec
        # chapter shards
        shards = []
        for ed in ('original-en', 'modern-en', 'modern-da'):
            p = f'app/public/data/editions-chapters/{book}-{ed}/manifest.json'
            try:
                man = json.loads(show(p))
            except subprocess.CalledProcessError:
                continue
            chg = sorted({k for k, _ in M})
            shards.append({'manifest': p, 'chapters_to_regenerate': chg or ([3] if book == 'odyssey' and ed == 'original-en' else [])})
        out['chapter_shards'] = shards
        # modern-da mechanical feasibility (report only)
        da = json.loads(show(f'app/public/data/editions/{book}-modern-da.json'))
        chk = []
        recs = json.load(open(os.path.join(PKG, book, 'CHANGES.json')))
        for r in recs:
            if r['edition'] != 'original-en':
                continue
            c, i = int(r['at'].split('.')[0]), int(r['at'].split('.')[1].split('+')[0])
            P = da['chapters'][c - 1]['paragraphs']
            if r['op'] == 'delete':
                chk.append({'at': r['at'], 'op': 'delete', 'da': P[i], 'prev': P[i - 1][-160:], 'next': P[i + 1][:160]})
            elif r['op'] == 'merge':
                chk.append({'at': r['at'], 'op': 'merge', 'da_tail': P[i][-80:], 'da_head': P[i + 1][:80],
                            'clean_join': (P[i][-1:] not in '.!?»"”') and P[i + 1][:1].islower()})
            else:
                chk.append({'at': r['at'], 'op': 'edit', 'da': P[i][:300], 'da_words': len(P[i].split())})
        out['modern_da_report_only'] = {'file': f'app/public/data/editions/{book}-modern-da.json',
                                        'sha256': hashlib.sha256(show(f'app/public/data/editions/{book}-modern-da.json')).hexdigest(),
                                        'paragraphs': sum(len(c['paragraphs']) for c in da['chapters']), 'ops': chk}
        json.dump(out, open(os.path.join(PKG, book, 'downstream-impact.json'), 'w'), indent=2, ensure_ascii=False)
        print(book, json.dumps({ed: {'pinned': v['card_pinned_to_package_input'], 'counts': v['counts']} for ed, v in out['editions'].items()}))

if __name__ == '__main__':
    main()


def validate_original_moves():
    """For card editions pinned to the package input (original-en), every remapped mention must
    land on its own text in the corrected file.  modern-en cards are pinned to the pre-repair live
    baseline and must first be re-anchored per the accepted Modern English packets."""
    bad = 0
    for book, info in S['books'].items():
        imp = json.load(open(os.path.join(PKG, book, 'downstream-impact.json')))
        new = json.load(open(os.path.join(PKG, info['files']['original-en']['file'])))
        card = json.loads(show(f'app/public/data/characters/{book}.v1.json'))['editions']['original-en']
        mv = {m['path']: m for m in imp['editions']['original-en']['moves']}
        n = 0
        for k, m in enumerate(card['mentions']):
            p = f'mentions[{k}]'
            if p in mv and mv[p]['class'] == 'drop':
                continue
            c, i, off = mv[p]['new'] if p in mv else (m['chapterNumber'], m['paragraphIndex'], m['startOffset'])
            para = new['chapters'][c - 1]['paragraphs'][i]
            u = para.encode('utf-16-le')
            got = u[2 * off: 2 * (off + (m['endOffset'] - m['startOffset']))].decode('utf-16-le')
            if got != m['text']:
                bad += 1
                print('MISMATCH', book, p, m['text'], got)
            n += 1
        print(f'{book} original-en: {n} surviving mentions re-resolve to their exact text in the corrected file')
    return bad

if __name__ == '__main__':
    raise SystemExit(1 if validate_original_moves() else 0)
