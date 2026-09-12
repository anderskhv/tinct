#!/usr/bin/env python3
"""Reviewer's INDEPENDENT reconstruction of Meditations Book XII from PG #15877.

Written for the Book XII round-1 review, from scratch, BEFORE
`scripts/verify_book12_source.py` was opened, and by a rule of a third kind.

  - the BUILD keys on an `[A-D]` opener and consumes indented-or-blank lines;
  - the DRAFTER'S check classifies blank-line blocks by INDENTATION PROFILE;
  - this check uses NO indentation magnitude at all. It takes every flush-left
    line as body, and decides each indented run by SENTENCE CONTINUITY: a run
    is Long's verse, and is joined into the paragraph before it, only when the
    body text so far breaks off mid-sentence (ends in `,` `;` or `:`).
    Every other indented run is apparatus and is dropped.

Range and headers are located by the script itself (a flush-left line that is a
bare Roman numeral + '.'), not taken from the package's documentation.

D14: the typographic-only build rules are reproduced here (em dash, italic
underscores, `[Greek: …]` → `(Greek: …)`, space-before-punctuation), so that the
reconstruction and the staged file are compared on the same rules. Long's dagger
`+` is deliberately NOT removed, so the one documented dagger surfaces as a diff
and is counted rather than assumed.

Run from `books/staged-replacements/meditations/`:
    python3 book12/review/verify_book12_source_review.py
"""
import json, re, sys, os, difflib

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
PG = os.path.join(ROOT, 'source', 'pg15877-long-1862.txt')
STAGED = os.path.join(ROOT, 'meditations-original-en.staged.json')

lines = [l.rstrip('\r') for l in open(PG, encoding='utf-8').read().split('\n')]

# --- locate the range without trusting the package's line numbers -------------
hdr = {}
for i, l in enumerate(lines):
    m = re.fullmatch(r'((?:X{0,3})(?:IX|IV|V?I{0,3}))\.', l)
    if m and m.group(1):
        hdr.setdefault(m.group(1), i)
start = hdr['XII'] + 1
end = next(i for i, l in enumerate(lines) if l.strip() == 'INDEXES.' and i > hdr['XII'])
print(f"range: PG lines {start+1}..{end} (XII. header at {hdr['XII']+1}, INDEXES. at {end+1})")
seg = lines[start:end]

# --- reconstruct --------------------------------------------------------------
paras, joined, dropped = [], [], []
i = 0
while i < len(seg):
    l = seg[i]
    if not l.strip():
        i += 1
        continue
    if not l.startswith(' '):
        if re.match(r'^\d+\.\s', l) or not paras:
            paras.append([l])
        else:
            paras[-1].append(l)
        i += 1
        continue
    j, run = i, []
    while j < len(seg) and (not seg[j].strip() or seg[j].startswith(' ')):
        if seg[j].strip():
            run.append((start + j + 1, seg[j]))
        j += 1
    prev = re.sub(r'\[[A-D]\]$', '', ' '.join(paras[-1]).rstrip()) if paras else ''
    if paras and re.search(r'[,;:]$', prev):          # the sentence breaks off -> verse
        for ln, txt in run:
            paras[-1].append(txt.strip())
            joined.append(ln)
    else:
        dropped.extend(run)
    i = j

def norm(t):
    t = re.sub(r'\[([A-D])\]', '', t)                 # footnote markers
    t = t.replace('---', '—').replace('--', '—')
    t = re.sub(r'\[Greek:\s*(.*?)\]', r'(Greek: \1)', t)
    t = t.replace('_', '')
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'\s+([,;:.?!])', r'\1', t)            # D14
    return t                                          # NB: '+' daggers left in

out = [norm(' '.join(p)) for p in paras]
if out and not re.match(r'^\d+\.\s', out[0]):
    out[0] = '1. ' + out[0]

# --- audit the rules against the raw range ------------------------------------
openers  = [i + 1 for i in range(start, end) if re.match(r'^\s+\[[A-D]\]', lines[i])]
flushop  = [i + 1 for i in range(start, end) if re.match(r'^\[[A-D]\]', lines[i])]
flushmk  = sum(len(re.findall(r'\[[A-D]\]', lines[i]))
               for i in range(start, end) if lines[i].strip() and not lines[i].startswith(' '))
indmk    = [(i + 1, len(lines[i]) - len(lines[i].lstrip()))
            for i in range(start, end)
            if lines[i].startswith(' ') and re.search(r'\[[A-D]\]', lines[i])
            and not re.match(r'^\s+\[[A-D]\]', lines[i])]
greek    = [(i + 1, len(lines[i]) - len(lines[i].lstrip()))
            for i in range(start, end) if '[Greek:' in lines[i]]
caption  = [i + 1 for i in range(start, end) if '[Illustration' in lines[i]]
dagger   = [(i + 1, lines[i].count('+')) for i in range(start, end) if '+' in lines[i]]
spacepun = [i + 1 for i in range(start, end) if re.search(r'\s+[,;:.?!]', lines[i])]

print(f"indented footnote openers : {len(openers)} at {openers}")
print(f"flush-left footnote openers (the VII.45 class): {len(flushop)}")
print(f"in-text markers           : {flushmk} flush-left + {len(indmk)} indented {indmk}"
      f"  -> {flushmk + len(indmk)} for {len(openers)} openers"
      f"  {'RECONCILES' if flushmk + len(indmk) == len(openers) else 'MISMATCH'}")
print(f"illustration captions (the Book IV class): {len(caption)}")
print(f"[Greek: ...] spans        : {greek}  (flush-left/in body: "
      f"{[g for g in greek if g[1] == 0]})")
print(f"dagger marks              : {dagger}")
print(f"space-before-punctuation (D14) fires at: {spacepun or 'no line'}")
print(f"indented lines JOINED as verse: {joined}")
print(f"indented lines DROPPED as apparatus: {len(dropped)}"
      f"  (indents {sorted({len(t) - len(t.lstrip()) for _, t in dropped})})")
for ln, txt in dropped:
    ind = len(txt) - len(txt.lstrip())
    if ind != 4:
        print(f"    NOT four-space: line {ln} indented {ind}: {txt.strip()[:66]}")

# --- diff ---------------------------------------------------------------------
b12 = json.load(open(STAGED))['chapters'][11]['paragraphs']
print(f"\nreconstructed: {len(out)}   staged: {len(b12)}   "
      f"{'COUNT MATCH' if len(out) == len(b12) else 'COUNT MISMATCH'}")
bad = []
for k, (a, b) in enumerate(zip(out, b12)):
    if a != b:
        bad.append(k + 1)
        ops = [(t, a[i1:i2], b[j1:j2])
               for t, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b).get_opcodes()
               if t != 'equal']
        print(f"  XII.{k+1}: {ops}")
print(f"differing paragraphs: {bad}")
only_dagger = all(
    out[k - 1].replace('+ ', '').replace(' +', '') == b12[k - 1]
    or re.sub(r'\s*\+\s*', ' ', out[k - 1]).strip() == b12[k - 1] for k in bad)
print(f"each differing ONLY by a dagger: {only_dagger}")
print("RESULT:", "staged Book XII reproduced; no rebuild needed"
      if len(out) == len(b12) and bad == [16] and only_dagger else "INVESTIGATE")
