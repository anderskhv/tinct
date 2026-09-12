import re, json, difflib
#!/usr/bin/env python3
"""Book X step-1 source check: an INDEPENDENT reconstruction of Long's Book X
from PG #15877, diffed word for word against the staged original.

Written from scratch for this check and deliberately NOT reusing
build_original_en_from_pg15877.py. Re-running the build script and getting a
byte-identical file proves only that the file matches the script - which is
exactly how the Book IV illustration captions and the Book VII flush-left
footnotes survived the first build. The Book IX round-1 reviewer used this
stronger method instead, and it is adopted here.

Expected result: 38 paragraphs, and the ONLY differences against the staged
Book X are the four dagger marks (X.9, X.19, X.25, X.31) that PROVENANCE.md
section 4 documents as deliberately removed.
"""

import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
raw = open('source/pg15877-long-1862.txt','rb').read().decode('utf-8')
lines = [l.rstrip('\r') for l in raw.split('\n')]
seg = lines[5865:6374]          # 1-based 5866..6374 : after the "X." header, before "XI."
assert lines[5864].strip()=='X.' and lines[6374].strip()=='XI.'

out, i, dropped = [], 0, []
while i < len(seg):
    l = seg[i]
    s = l.strip()
    if s.startswith('[Illustration'):
        dropped.append(('illustration', 5866+i, s)); i += 1; continue
    # a footnote begins with an INDENTED bracketed capital; its body runs over
    # every following indented or blank line until flush-left text resumes
    if l[:1]==' ' and re.match(r'\[[A-D]\]\s', s):
        j = i
        while j < len(seg) and (not seg[j].strip() or seg[j][:1]==' '):
            j += 1
        dropped.append(('footnote', 5866+i, s[:40]))
        i = j; continue
    out.append(l); i += 1

text = '\n'.join(out)
text = re.sub(r'\[[A-D]\]', '', text)          # footnote reference letters
#text = text.replace('+', '')   # daggers KEPT so they show as the only diffs
text = re.sub(r'\[Greek: ([^\]]*)\]', r'(Greek: \1)', text)
text = text.replace('---', '—').replace('--', '—')
text = text.replace('_', '')

paras = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', text)]
paras = [p for p in paras if p]
# a section begins with its number; a block that does not is a continuation of
# the section before it (an indented verse quotation, or text after a footnote
# that PG prints mid-section), and is joined back on with a space
merged = []
for p in paras:
    if merged and not re.match(r'^\d+\. ', p):
        merged[-1] = merged[-1] + ' ' + p
    else:
        merged.append(p)
paras = merged
# the first section is unnumbered in Long's layout
if not re.match(r'^\d+\. ', paras[0]):
    paras[0] = '1. ' + paras[0]
print('reconstructed paragraphs:', len(paras))
print('dropped blocks:', len(dropped))
for d in dropped: print('   ', d)

staged = json.load(open('meditations-original-en.staged.json'))
ch = next(c for c in staged['chapters'] if c['number']==10)
print('staged paragraphs:', len(ch['paragraphs']))
bad = 0
for k,(a,b) in enumerate(zip(paras, ch['paragraphs'])):
    if a != b:
        bad += 1
        d = [x for x in difflib.ndiff(a.split(), b.split()) if x[0] in '+-']
        print(f'DIFF X.{k+1}: ' + ' | '.join(d))
print('paragraphs differing:', bad)
print('count match:', len(paras)==len(ch['paragraphs']))
