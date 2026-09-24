#!/usr/bin/env python3
"""Character-card impact of the replacement package (mapping only; the live card package is not edited).

For every character anchor and mention in app/public/data/characters/fear-and-trembling.v1.json
(editions original-en and modern-en, 232-slot structure), map the served paragraph through
STRUCTURE-MAP.json to the final 184-paragraph structure and locate the mention in the candidate
modern-en text. Writes character-card-impact.json. Offsets are UTF-16, as in the card package.
Usage: python3 build_character_impact.py
"""
import json, os, hashlib
H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(H, '..', '..', '..')
card = json.load(open(os.path.join(ROOT, 'app/public/data/characters/fear-and-trembling.v1.json')))
smap = {tuple(r['served']): r for r in json.load(open(os.path.join(H, 'STRUCTURE-MAP.json')))['map']}
candp = os.path.join(H, 'candidate', 'fear-and-trembling-modern-en.candidate.json')
cand = json.load(open(candp))
cand_sha = hashlib.sha256(open(candp, 'rb').read()).hexdigest()
P = {(c['number'], i): p for c in cand['chapters'] for i, p in enumerate(c['paragraphs'])}
# Preferred search strings in the new text when the card's mention text is not found verbatim.
ALT = {'johannes-de-silentio': ['Johannes de silentio', 'Johannes de Silentio'],
       'sarah': ['Sarah'], 'eliezer': ['Eliezer'], 'isaac': ['Take Isaac', 'Isaac'],
       'abraham': ['Abraham was greater than all', 'Abraham was greater than everyone', 'Abraham'],
       'hegel': ['Understanding Hegel', 'Hegel'], 'knight-of-infinite-resignation': ['knight of infinite resignation', 'infinite resignation'],
       'knight-of-faith': ['knight of faith'], 'the-absurd': ['the absurd'],
       'teleological-suspension-of-the-ethical': ['teleological suspension of the ethical']}
def u16(s): return len(s.encode('utf-16-le')) // 2
def locate(cid, text, served):
    rec = smap[served]
    finals = [tuple(f) for f in rec['final']] or ([tuple(rec['noteInFinal'])] if rec.get('noteInFinal') else [])
    for cand_text in [text] + [a for a in ALT.get(cid, []) if a != text]:
        for f in finals:
            k = P[f].find(cand_text)
            if k >= 0:
                return {'chapterNumber': f[0], 'paragraphIndex': f[1], 'startOffset': u16(P[f][:k]),
                        'endOffset': u16(P[f][:k]) + u16(cand_text), 'text': cand_text,
                        'status': 'found-verbatim' if cand_text == text else 'found-variant'}, rec['relation']
    return {'status': 'not-found', 'searchedFinal': [list(f) for f in finals]}, rec['relation']
out = {'book': 'fear-and-trembling', 'cardPackage': 'app/public/data/characters/fear-and-trembling.v1.json',
       'cardContentVersion': card['contentVersion'], 'candidateModernEnSha256': cand_sha,
       'note': 'Mapping only. The replacement modern-en uses the 184-paragraph printed structure, so every pinned paragraph hash and every mention offset changes. Proposed new anchors below point into the candidate modern-en. original-en is proposed for retirement (EDITION-PLAN.md), so its card edition should be dropped rather than re-anchored; its mentions are mapped too for completeness.',
       'editions': {}}
for ed in ['modern-en', 'original-en']:
    e = card['editions'][ed]
    rows = []
    for m in e['mentions']:
        served = (m['chapterNumber'], m['paragraphIndex'])
        new, rel = locate(m['characterId'], m['text'], served)
        rows.append({'characterId': m['characterId'], 'old': {k: m[k] for k in ('chapterNumber', 'paragraphIndex', 'startOffset', 'endOffset', 'text')},
                     'structureRelation': rel, 'proposed': new})
    chars = []
    for c in e['characters']:
        fm = c['firstMention']; mrow = next(r for r in rows if r['characterId'] == c['id'])
        pr = mrow['proposed']
        anchor = {'chapterNumber': pr.get('chapterNumber'), 'paragraphIndex': pr.get('paragraphIndex'), 'offset': 0}
        chars.append({'id': c['id'], 'oldFirstMention': fm, 'oldRoleVisibleAt': c['roleVisibleAt'],
                      'oldSnapshotsAvailableAt': [s['availableAt'] for s in c['snapshots']],
                      'proposedAnchor (firstMention / roleVisibleAt / snapshot availableAt)': anchor})
    out['editions'][ed] = {'oldSourceSha256': e['sourceSha256'], 'oldParagraphCount': e['paragraphCount'],
                           'mentions': rows, 'characters': chars,
                           'summary': {s: sum(1 for r in rows if r['proposed']['status'] == s) for s in ('found-verbatim', 'found-variant', 'not-found')}}
json.dump(out, open(os.path.join(H, 'character-card-impact.json'), 'w'), ensure_ascii=False, indent=1)
for ed, v in out['editions'].items():
    print(ed, v['summary'])
    for r in v['mentions']:
        print('  ', r['characterId'], (r['old']['chapterNumber'], r['old']['paragraphIndex']), '->', (r['proposed'].get('chapterNumber'), r['proposed'].get('paragraphIndex')), r['proposed']['status'], repr(r['proposed'].get('text')))
