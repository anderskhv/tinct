#!/usr/bin/env python3
"""Reviewer's independent source verification of the Odyssey Book 3 source.

A THIRD rule, deliberately unlike both earlier ones:

  * the Book 2 drafter anchored on PG's footnote-entry list, positionally;
  * the Book 3 drafter anchored structurally on the `BOOK III` / `BOOK IV`
    headings, read bytes, and diffed with the apparatus still in.

This one is ANCHORLESS and DIGIT-BLIND. It never looks for a heading, a Book
number, or a `FOOTNOTES:` line to decide where Book 3 is. It reduces both
texts to a stream of lowercase LETTER-ONLY tokens (so PG's footnote markers,
which are bare digit runs, cannot survive to be "stripped" -- they simply are
not tokens), and then asks a question that identifies nothing in advance:

    does the served Book 3, read as one token stream, occur as an EXACT
    CONTIGUOUS BLOCK somewhere in PG #1727, exactly once?

If it does, the served text is PG's text, in PG's order, with PG's words and
no others -- and the location it is found at is an OUTPUT, not an input.
Where a paragraph does NOT occur, the script reports it and then locates the
longest prefix of it that does, so the divergence point is a measurement.

Digit-blindness is paid for separately rather than waved away: every digit
run inside the located region is listed with its context, so a genuine
numeral in Butler's text would be reported rather than silently dropped.

Read-only. Modifies nothing.
"""
import json, re, pathlib, sys

HERE = pathlib.Path(__file__).resolve()
ROOT = HERE.parents[2]                      # .../staged-replacements/odyssey
PG = ROOT / 'source-texts' / 'pg1727-butler-1900.txt'
SERVED = (ROOT.parents[2] / 'app' / 'public' / 'data' / 'editions'
          / 'odyssey-original-en.json')

raw = PG.read_bytes().decode('utf-8')
served = json.load(open(SERVED, encoding='utf-8'))
bk3 = next(c for c in served['chapters'] if c['number'] == 3)['paragraphs']
print(f'served Book 3: {len(bk3)} paragraphs')

WORD = re.compile(r'[a-z]+')


def toks(t):
    return WORD.findall(t.lower())


pg_tok = toks(raw)
pg_pos = [m.start() for m in WORD.finditer(raw.lower())]


def find_all(hay, needle):
    out, i, n = [], 0, len(needle)
    while True:
        try:
            i = hay.index(needle[0], i)
        except ValueError:
            return out
        if hay[i:i + n] == needle:
            out.append(i)
        i += 1


# --- 1. the whole Book, minus the last paragraph, as ONE contiguous block ---
body = toks(' '.join(bk3[:-1]))
hits = find_all(pg_tok, body)
print(f'B03-P001..P037 as one contiguous token block: {len(body)} tokens, '
      f'{len(hits)} occurrence(s) in PG')
assert len(hits) == 1, 'not found exactly once'
start = hits[0]
end = start + len(body)
print(f'  found at PG token {start}..{end}, char offset {pg_pos[start]}, '
      f'PG lines {raw.count(chr(10), 0, pg_pos[start]) + 1}'
      f'..{raw.count(chr(10), 0, pg_pos[end - 1]) + 1}')

# --- 2. per paragraph, in order, contiguous and adjacent -------------------
cur, bad = start, []
for i, p in enumerate(bk3, 1):
    t = toks(p)
    if pg_tok[cur:cur + len(t)] == t:
        cur += len(t)
        continue
    lo, hi = 0, len(t)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if pg_tok[cur:cur + mid] == t[:mid]:
            lo = mid
        else:
            hi = mid - 1
    bad.append((i, len(t), lo, ' '.join(t[lo:lo + 12])))
    cur += lo
print(f'paragraphs matching PG exactly, in order, with no gap: '
      f'{len(bk3) - len(bad)}/{len(bk3)}')
for i, n, pref, tail in bad:
    print(f'  MISMATCH B03-P{i:03d}: {n} tokens, first {pref} match PG, then '
          f'PG has no more; served continues: "{tail} ..."')

# --- 3. what PG actually has where P038 should be -------------------------
after = pg_tok[cur:cur + 40]
print('PG continues, after the last served token that matched: '
      f'"{" ".join(after[:25])} ..."')

# --- 4. pay for digit-blindness: every digit run in the located region ----
lo_c, hi_c = pg_pos[start], pg_pos[end - 1] + 40
region = raw[lo_c:hi_c]
runs = [(m.group(), region[max(0, m.start() - 40):m.start()].replace('\n', ' '))
        for m in re.finditer(r'\d+', region)]
nums = [int(r[0]) for r in runs]
print(f'digit runs inside the located region: {len(runs)} -> {nums}')
print(f'  strictly ascending, no repeats: '
      f'{nums == sorted(nums) and len(nums) == len(set(nums))}')
glued = [r for r in runs if r[1] and not r[1][-1].isspace()]
print(f'  glued to the preceding character (footnote-marker shape): '
      f'{len(glued)}/{len(runs)}')
for n, ctx in runs:
    print(f'    {n:>4}  ...{ctx[-40:]}|')

# --- 5. capitalization of the Book opening, checked directly --------------
print()
print(('PG at the located start: "' + raw[lo_c - 2:lo_c + 58] + '"')
      .replace('\n', ' '))
print(f'served B03-P001 opens:   "{bk3[0][:58]}"')

# --- 6. negative controls: the check must be able to FAIL -----------------
# Strengthened at Book 5's step 6 under **D18**, the two-clause control rule
# (`../../scripts/controls.py`), which round 1 of Book 5 asked for by name:
# control C was written `.replace('Nestor', 'Nestorr', 1)` -- not a no-op
# today, because `Nestor` does occur in Book 3, but nothing said so, and a
# control that is sound by luck is not sound. The mutation is now built from
# the text's own longest word, and each control asserts BOTH clauses: that the
# mutation changed the input, and that this check's verdict changed with it.
# The review's verdict is unchanged; only the assertions are stronger.
print()
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / 'scripts'))
from controls import control, summary as control_summary   # noqa: E402

baseline = ' '.join(bk3[:-1])


def verdict(text):
    return len(find_all(pg_tok, toks(text)))


control('A: all 38 paragraphs as one block (the splice included)',
        baseline, ' '.join(bk3), verdict)
control('B: first two paragraphs swapped',
        baseline, ' '.join([bk3[1], bk3[0]] + list(bk3[2:-1])), verdict)
w = max(re.findall(r'[A-Za-z]{6,}', baseline), key=len)   # its OWN letters
assert baseline.count(w) >= 1, 'control C precondition: the word is present'
control('C: one letter added to one word (%r)' % w,
        baseline, baseline.replace(w, w + w[-1], 1), verdict)
print(control_summary())

# --- 7. the served file's own fingerprint of the splice -------------------
print()
all_para = [p for c in served['chapters'] for p in c['paragraphs']]
ascii_dq = [(c['number'], i + 1) for c in served['chapters']
            for i, p in enumerate(c['paragraphs']) if '"' in p]
print(f'served original-en: {len(all_para)} paragraphs; paragraphs containing '
      f'an ASCII double quote: {ascii_dq}')
print('  (the file is typographic throughout -- the ASCII quotes are the '
      'splice\'s own fingerprint, independent of PG)')
