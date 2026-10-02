#!/usr/bin/env python3
"""Build editions/discourse-on-inequality-original-en.json from the verified 1761 transcription.

Chapters kept: Dedication, Preface, Exordium (Academy question + introduction), First Part, Second Part.
Excluded: 'Advertisement Concerning the Notes' and the Notes chapter (Rousseau's notes are apparatus; the
note-call markers (1)-(19) are therefore removed from the text). No wording is changed otherwise.
"""
import json, re, os
here = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(here, 'codex-original-en.json'), encoding='utf-8'))
ch = d['chapters']
def clean(p):
    p = re.sub(r'\s*\(\d{1,2}\)', '', p)       # note-call markers
    p = re.sub(r'\s+', ' ', p).strip()
    p = p.replace('â', 'â')
    return p
out = []
def add(title, paras):
    out.append({'number': len(out) + 1, 'title': title, 'paragraphs': [clean(p) for p in paras]})
add('Dedication: To the Republic of Geneva', ch[0]['paragraphs'])
add('Preface', ch[1]['paragraphs'])
add('Exordium', ch[3]['paragraphs'] + ch[4]['paragraphs'])
add('First Part', ch[5]['paragraphs'])
add('Second Part', ch[6]['paragraphs'])
json.dump({'chapters': out, 'sections': []}, open(os.path.join(here, '..', 'editions', 'discourse-on-inequality-original-en.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print([(c['title'], len(c['paragraphs'])) for c in out])
