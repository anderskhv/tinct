#!/usr/bin/env python3
"""Build a book's review package from its frozen candidate text.

Usage: python3 scripts/build_book_package.py N
Reads scripts/candidates/bookN.py (BOOK, CANDIDATE), extracts chapter N from the
staged Long original-en, and writes under bookN/: source-bookN.json,
candidate-v1.json, candidate-v1-readable.md, manifest.json, review-packets/.
Prints word ratios and hashes for provenance.json. Same format as book2/.
"""
import json, os, sys, hashlib, importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.join(HERE, '..')

def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()

def main(n):
    spec = importlib.util.spec_from_file_location(f'book{n}', os.path.join(HERE, 'candidates', f'book{n}.py'))
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    assert mod.BOOK == n
    CAND = mod.CANDIDATE
    BD = os.path.join(PKG, f'book{n}'); os.makedirs(os.path.join(BD, 'review-packets'), exist_ok=True)
    PID = lambda i: f'B{n:02d}-P{i+1:03d}'
    staged = os.path.join(PKG, 'meditations-original-en.staged.json')
    data = json.load(open(staged, encoding='utf-8'))
    ch = next(c for c in data['chapters'] if c['number'] == n)
    src = {'number': ch['number'], 'title': ch['title'], 'paragraphs': list(ch['paragraphs'])}
    N = len(src['paragraphs'])
    assert len(CAND) == N, (len(CAND), N)
    for i, (s, c) in enumerate(zip(src['paragraphs'], CAND)):
        assert s.startswith(f'{i+1}. ') and c.startswith(f'{i+1}. '), i
    cand = {'number': n, 'title': ch['title'], 'paragraphs': list(CAND)}
    json.dump(src, open(os.path.join(BD, f'source-book{n}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(cand, open(os.path.join(BD, 'candidate-v1.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    lines = [f'# Meditations, Book {n} — modern-English candidate v1', '', f'**Title:** {ch["title"]}', '',
             f'Paragraph IDs are shown outside the prose, in the form `B{n:02d}-Pxxx`, for review reference only. They are not part of the edition text. Each paragraph is one numbered meditation; the leading number is part of the text.', '']
    for i, c in enumerate(CAND): lines += [f'**[{PID(i)}]**', '', c, '']
    open(os.path.join(BD, 'candidate-v1-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))
    size = 3
    groups = [list(range(k, min(k + size, N))) for k in range(0, N, size)]
    manifest = {'book': n, 'source_paragraph_count': N, 'candidate_paragraph_count': N, 'packet_size': size, 'packets': []}
    roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][n-1]
    def block(i, assigned):
        tag = 'ASSIGNED FOR REVIEW' if assigned else 'CONTEXT ONLY — reviewed in another packet'
        return [f'## {PID(i)} — {tag}', '', '**Source (Long 1862):**', '', f'> {src["paragraphs"][i]}', '',
                '**Candidate (modern English v1):**', '', f'> {CAND[i]}', '', '---', '']
    for pi, g in enumerate(groups, 1):
        first, last = g[0], g[-1]
        out = [f'# Review Packet {pi:02d} — Meditations, Book {n}', '',
               f'Assigned paragraphs: {PID(first)}–{PID(last)} (meditations {roman}.{first+1}–{roman}.{last+1}; source paragraph index {first}–{last}, 0-based).', '',
               f'Source: George Long, 1862 (Project Gutenberg #15877), as staged in `books/staged-replacements/meditations/meditations-original-en.staged.json`, chapter number {n}, one paragraph per numbered meditation.',
               f'Candidate: modern-English reading edition, frozen draft v1 (`book{n}/candidate-v1.json`). Renderings of recurring terms follow `GLOSSARY.md`; per-paragraph decisions are in `book{n}/continuity.md`.', '', '---', '']
        if first > 0: out += block(first - 1, False)
        for i in g: out += block(i, True)
        if last < N - 1: out += block(last + 1, False)
        open(os.path.join(BD, 'review-packets', f'packet-{pi:02d}.md'), 'w', encoding='utf-8').write('\n'.join(out))
        manifest['packets'].append({'packet': f'review-packets/packet-{pi:02d}.md', 'assigned_paragraph_ids': [PID(i) for i in g]})
    ids = [x for p in manifest['packets'] for x in p['assigned_paragraph_ids']]
    assert ids == [PID(i) for i in range(N)]
    manifest['coverage_check'] = {'all_ids_present_exactly_once_in_order': True, 'first_id': ids[0], 'last_id': ids[-1]}
    json.dump(manifest, open(os.path.join(BD, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    sw = sum(len(p.split()) for p in src['paragraphs']); cw = sum(len(p.split()) for p in CAND)
    print(f'book {n}: {N} paragraphs, {len(groups)} packets; words source {sw} candidate {cw} ratio {cw/sw:.3f}')
    for i, (s, c) in enumerate(zip(src['paragraphs'], CAND)):
        r = len(c.split()) / len(s.split())
        print(f'  {PID(i)} src {len(s.split()):4d} cand {len(c.split()):4d} ratio {r:.2f}' + ('  <-- below 0.75' if r < 0.75 else ''))
    print(f'source-book{n}.json', sha(os.path.join(BD, f'source-book{n}.json')))
    print('candidate-v1.json', sha(os.path.join(BD, 'candidate-v1.json')))
    print('staged original-en', sha(staged))

if __name__ == '__main__':
    main(int(sys.argv[1]))
