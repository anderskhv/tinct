#!/usr/bin/env python3
"""Book XI step-1 source check: an INDEPENDENT reconstruction of Long's Book XI
from PG #15877, diffed word for word against the staged original, PLUS an audit
of this script's own rules against the raw text.

Written from scratch for this check and deliberately NOT reusing
build_original_en_from_pg15877.py. Re-running the build script and getting a
byte-identical file proves only that the file matches the script - which is
exactly how the Book IV illustration captions and the Book VII flush-left
footnotes survived the first build. The Book IX round-1 reviewer introduced this
stronger method, Book X used it, and the Book X round-1 reviewer added the
further step this file also performs: a reconstruction that shares a blind spot
with the build proves nothing either, so the RULES are audited class by class
against the raw range before the output is looked at.

Expected result: 39 paragraphs, and the ONLY differences against the staged
Book XI are the three dagger marks (XI.8, XI.15, XI.17) that PROVENANCE.md
section 4 documents as deliberately removed.
"""

import os, re, json, difflib

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
raw = open('source/pg15877-long-1862.txt', 'rb').read().decode('utf-8')
lines = [l.rstrip('\r') for l in raw.split('\n')]

LO, HI = 6376, 6816                 # 1-based, between the XI. and XII. headers
assert lines[LO - 2].strip() == 'XI.' and lines[HI].strip() == 'XII.'
seg = lines[LO - 1:HI]              # seg[i] is 1-based line LO+i
OPENER = re.compile(r'\[[A-D]\]\s')

# ---------------------------------------------------------------------------
# PART 1 - AUDIT OF THIS SCRIPT'S OWN RULES, against the raw range
# ---------------------------------------------------------------------------
print('=' * 72)
print('RULE AUDIT - PG lines %d-%d (Book XI)' % (LO, HI))
print('=' * 72)

# (a) every maximal indented run, with its indentation profile, so that the
#     footnote-consumption rule below cannot silently swallow Long's verse
runs, cur = [], None
for i, l in enumerate(seg):
    n = LO + i
    if l.strip() and l[:1] == ' ':
        ind = len(l) - len(l.lstrip())
        if cur and cur['end'] == n - 1:
            cur['end'] = n; cur['ind'].add(ind); cur['lines'].append(l)
        else:
            cur = {'start': n, 'end': n, 'ind': {ind}, 'lines': [l]}; runs.append(cur)
    elif l.strip():
        cur = None
print('(a) maximal indented runs: %d' % len(runs))
for r in runs:
    r['opener'] = bool(OPENER.match(r['lines'][0].strip()))
    print('    %d-%d indent=%s opener=%s :: %s'
          % (r['start'], r['end'], sorted(r['ind']), r['opener'], r['lines'][0].strip()[:52]))
footnote_runs = [r for r in runs if r['opener']]
other_runs = [r for r in runs if not r['opener']]
print('    footnote runs (indented opener): %d, all indented 4: %s'
      % (len(footnote_runs), all(r['ind'] == {4} for r in footnote_runs)))
print('    non-opener indented runs: %d' % len(other_runs))
for r in other_runs:
    # is this run adjacent to a footnote run with only blank lines between?
    prev = [x for x in runs if x['end'] < r['start']]
    gap_text = [l for l in seg[(prev[-1]['end'] - LO + 1):(r['start'] - LO)] if l.strip()] if prev else ['<none>']
    print('      %d-%d indent=%s : nearest preceding run ends %s, flush-left text between: %s'
          % (r['start'], r['end'], sorted(r['ind']),
             prev[-1]['end'] if prev else None, bool(gap_text)))

# (b) the marker recount: flush-left markers + markers inside indented runs that
#     are NOT footnote openers must equal the number of footnote openers
flush_markers = [(LO + i, m) for i, l in enumerate(seg)
                 if l.strip() and l[:1] != ' ' for m in re.findall(r'\[[A-D]\]', l)]
verse_markers = [(LO + i, m) for i, l in enumerate(seg)
                 if l.strip() and l[:1] == ' ' and not OPENER.match(l.strip())
                 for m in re.findall(r'\[[A-D]\]', l)]
print('(b) in-text markers: %d flush-left + %d inside indented non-footnote lines = %d;'
      ' footnote openers: %d'
      % (len(flush_markers), len(verse_markers),
         len(flush_markers) + len(verse_markers), len(footnote_runs)))
print('    flush-left markers:', flush_markers)
print('    markers inside indented text:', verse_markers)
assert len(flush_markers) + len(verse_markers) == len(footnote_runs), 'marker recount'

# (c) flush-left footnote bodies of the VII.45 class, and illustration captions
#     of the Book IV class
flush_openers = [(LO + i, l) for i, l in enumerate(seg)
                 if l.strip() and l[:1] != ' ' and OPENER.match(l.strip())]
print('(c) flush-left footnote openers (the VII.45 class): %d %s'
      % (len(flush_openers), flush_openers))
caps = [(LO + i, l.strip()) for i, l in enumerate(seg) if '[Illustration' in l]
print('    illustration captions (the Book IV class): %d %s' % (len(caps), caps))
assert not flush_openers and not caps
# a flush-left footnote BODY without a bracketed opener cannot be detected by a
# rule; it is detected by the word-for-word diff in part 2, which is the point
# of the method. Short standalone flush-left lines are listed so that running
# heads, page numbers and catchwords can be ruled out by eye.
solo = [(LO + i, l.strip()) for i, l in enumerate(seg)
        if l.strip() and l[:1] != ' ' and len(l.strip()) < 40
        and (i == 0 or not seg[i - 1].strip()) and (i == len(seg) - 1 or not seg[i + 1].strip())]
print('    standalone short flush-left lines: %d %s' % (len(solo), solo))

# (d) the rest of the classes
print('(d) daggers:', [LO + i for i, l in enumerate(seg) if '+' in l])
greek = [(LO + i, l[:1] == ' ') for i, l in enumerate(seg) if '[Greek' in l]
print('    [Greek: ...] spans, (line, indented?):', greek)
print('    all Greek inside indented footnote bodies:', all(ind for _, ind in greek))
print('    underscores:', [(LO + i, l.strip()) for i, l in enumerate(seg) if '_' in l])

# ---------------------------------------------------------------------------
# PART 2 - THE RECONSTRUCTION
# ---------------------------------------------------------------------------
out, i, dropped = [], 0, []
while i < len(seg):
    l = seg[i]
    s = l.strip()
    if s.startswith('[Illustration'):
        dropped.append(('illustration', LO + i, s)); i += 1; continue
    # a footnote begins with an INDENTED bracketed capital; its body runs over
    # every following indented or blank line until flush-left text resumes
    if l[:1] == ' ' and OPENER.match(s):
        j = i
        while j < len(seg) and (not seg[j].strip() or seg[j][:1] == ' '):
            j += 1
        dropped.append(('footnote', LO + i, s[:44]))
        i = j; continue
    out.append(l); i += 1

text = '\n'.join(out)
text = re.sub(r'\[[A-D]\]', '', text)          # footnote reference letters
# daggers are deliberately KEPT so that they show as the only diffs
text = re.sub(r'\[Greek: ([^\]]*)\]', r'(Greek: \1)', text)
text = text.replace('---', '—').replace('--', '—')
text = text.replace('_', '')
# A space before , ; : . ? ! is closed up. This rule was NOT in PROVENANCE.md
# section 4 when this check was written: the first run of this script produced a
# fourth diff, at XI.18, where PG line 6645 prints "present ...[A]" and the
# staged file has "present...". The build has always applied the rule
# (re.sub(r'\s+([,;:.?!])', r'\1', t)); it fires in exactly FIVE lines in the
# whole translation body - 3156 (IV.19), 3779 (V.29), 4712 (VII.58), 4889
# (VII.66) and 6645 (XI.18) - every one of them at an ellipsis marking a
# lacuna in Long's Greek, and it changes no word anywhere. It is a typographic
# normalisation of the same class as the em dashes, so no rebuild is called for;
# it is now documented in PROVENANCE.md section 4, and reproduced here so the
# reconstruction and the staged file are compared on the same rules.
text = re.sub(r'\s+([,;:.?!])', r'\1', text)

paras = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', text)]
paras = [p for p in paras if p]
# a section begins with its number; a block that does not is a continuation of
# the section before it (indented verse, a verse citation, Long's connective
# lines between quotations, or text PG prints after a mid-section footnote),
# and is joined back on with a space
merged = []
for p in paras:
    if merged and not re.match(r'^\d+\. ', p):
        merged[-1] = merged[-1] + ' ' + p
    else:
        merged.append(p)
paras = merged
if not re.match(r'^\d+\. ', paras[0]):         # the first section is unnumbered
    paras[0] = '1. ' + paras[0]

print()
print('=' * 72)
print('RECONSTRUCTION')
print('=' * 72)
print('reconstructed paragraphs:', len(paras))
print('dropped blocks:', len(dropped))
for d in dropped:
    print('   ', d)

staged = json.load(open('meditations-original-en.staged.json'))
ch = next(c for c in staged['chapters'] if c['number'] == 11)
print('staged paragraphs:', len(ch['paragraphs']))
bad = 0
for k, (a, b) in enumerate(zip(paras, ch['paragraphs'])):
    if a != b:
        bad += 1
        d = [x for x in difflib.ndiff(a.split(), b.split()) if x[0] in '+-']
        print('DIFF XI.%d: %s' % (k + 1, ' | '.join(d)))
print('paragraphs differing:', bad)
print('count match:', len(paras) == len(ch['paragraphs']))
