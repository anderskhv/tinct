#!/usr/bin/env python3
"""Release artifacts: accepted-paragraph-hashes.tsv, CHANGED-PARAGRAPHS.md, HASHES.txt.
Run after assemble.py. Usage: python3 build_release.py"""
import json, os, hashlib, collections
H = os.path.dirname(os.path.abspath(__file__))
def sha(p): return hashlib.sha256(open(os.path.join(H, p), 'rb').read()).hexdigest()
def h16(s): return hashlib.sha256(s.encode()).hexdigest()[:16]
cand = json.load(open(os.path.join(H, 'candidate/fear-and-trembling-modern-en.candidate.json')))
da = json.load(open(os.path.join(H, 'candidate/fear-and-trembling-original-da.candidate.json')))
fin = json.load(open(os.path.join(H, 'source/original-da-final.json')))
smap = json.load(open(os.path.join(H, 'STRUCTURE-MAP.json')))['map']
notes = json.load(open(os.path.join(H, 'candidate/footnotes.json')))['footnotes']
f2s = collections.defaultdict(list); rel = collections.defaultdict(set)
for r in smap:
    for f in r['final']:
        f2s[tuple(f)].append(tuple(r['served'])); rel[tuple(f)].add(r['relation'])
    if r['relation'] == 'removed':
        f2s[tuple(r['noteInFinal'])].append(tuple(r['served'])); rel[tuple(r['noteInFinal'])].add('absorbs-footnote-slot')
with open(os.path.join(H, 'accepted-paragraph-hashes.tsv'), 'w') as t:
    t.write('key\tmodern_en_sha256_16\toriginal_da_sha256_16\tserved_slots\n')
    for c, dc in zip(cand['chapters'], da['chapters']):
        for i, (p, q) in enumerate(zip(c['paragraphs'], dc['paragraphs'])):
            t.write(f"{c['number']}.{i}\t{h16(p)}\t{h16(q)}\t{','.join(f'{a}.{b}' for a, b in sorted(f2s[(c['number'], i)]))}\n")
L = ['# Changed paragraphs: Fear and Trembling replacement package', '',
     '**Every paragraph of `modern-en` is new.** The edition is a fresh translation from the Danish, not a repair of the served text. The paragraph structure also changes from 232 served slots to the 184 printed paragraphs (`STRUCTURE-MAP.md`). So this record lists, for every final paragraph, the served slots it replaces and any restoration or footnote it carries. Hashes (first 16 hex characters of sha256) are in `accepted-paragraph-hashes.tsv`.', '',
     '## A. Restored omissions (text absent from every served edition)', '',
     '| Final ¶ | Restored | Served location | Evidence |', '|---|---|---|---|',
     '| 2.7 | Attunement: the weaning passage after variation II ("When the child has grown big and it is time to wean it …"), 29 Danish words | lost from served slot 2.6 | raw 475-478, scans (`source/CORRECTIONS.md` §2, `SCAN-VERIFICATION.md`) |',
     '| 2.10 | Attunement: the weaning passage after variation III ("When it is time to wean the child, the mother is not without sorrow either …"), 61 Danish words | lost from served slot 2.8 | raw 508-513, scans |',
     '| 6.6 | Problema II: the final word *fatte* ("comprehend"), lost at a page break. The served original-en misplaced it at the start of the next slot | served 6.7/6.8 | raw 3165 |',
     '| 7.18 | P-III: the conjectural *i* in "en Havmand i Nærheden" (the sentence needs it; medium-high confidence) | served 7.27 | raw 4337/4377 |',
     '| 2.3, 2.6, 2.8, 2.11 | the section numerals I.–IV. of the Attunement (structural fields, `candidate/structure.json`) | dropped in served | raw 390, 455, 484, 516 |', '',
     '## B. Footnotes (18): served status and new placement', '',
     'Every note is now a separate record in `candidate/footnotes.json`, with its exact anchor. The main text carries no markers. Five notes were missing entirely from the served editions and two were partly missing. Five had been spliced into the running text and eight stood as body paragraphs.', '',
     '| Note | Final ¶ | English anchor (marker goes after) | Served status |', '|---|---|---|---|']
served_status = {}
for line in open(os.path.join(H, 'source/CORRECTIONS.md')):
    if line.startswith('| n') and '|' in line:
        cells = [x.strip() for x in line.strip().strip('|').split('|')]
        if len(cells) >= 5 and cells[0].startswith('n'): served_status[cells[0]] = cells[4]
for n in notes:
    L.append(f"| {n['id']} | {n['chapter']}.{n['paragraph']} | “{n['anchorAfterEn']}” | {served_status.get(n['id'], '')} |")
L += ['', '## C. Every final paragraph', '', '| Final ¶ | Replaces served slot(s) | Relation | Notes | modern-en hash |', '|---|---|---|---|---|']
nb = collections.defaultdict(list)
for n in notes: nb[(n['chapter'], n['paragraph'])].append(n['id'])
for c in cand['chapters']:
    for i, p in enumerate(c['paragraphs']):
        k = (c['number'], i); fp = fin['chapters'][c['number'] - 1]['paragraphs'][i]
        r = ', '.join(sorted(rel[k])) + (' + restored passage' if fp.get('restored') else '')
        L.append(f"| {k[0]}.{i} | {', '.join(f'{a}.{b}' for a, b in sorted(f2s[k]))} | {r} | {', '.join(nb[k])} | {h16(p)} |")
open(os.path.join(H, 'CHANGED-PARAGRAPHS.md'), 'w').write('\n'.join(L) + '\n')
hs = {p: sha(p) for p in ['candidate/fear-and-trembling-modern-en.candidate.json', 'candidate/fear-and-trembling-original-da.candidate.json',
                          'candidate/footnotes.json', 'candidate/structure.json', 'front-matter.json', 'STRUCTURE-MAP.json', 'character-card-impact.json']}
open(os.path.join(H, 'HASHES.txt'), 'w').write(''.join(f'{v}  {k}\n' for k, v in hs.items()))
for k, v in hs.items(): print(v, k)
