#!/usr/bin/env python3
"""Independent source reconstruction for the Odyssey, Book 4 — reviewer's rule.

Written for the round-1 independent review of `book04/candidate-v1.json`.
Read-only: it opens files and prints; it writes nothing.

Run from `books/staged-replacements/odyssey`:

    python3 book04/review/verify_source_book4_review.py

WHAT KIND OF RULE THIS IS, AND HOW IT DIFFERS FROM THE FOUR ALREADY USED
-----------------------------------------------------------------------
  * Book 2's drafter anchored on PG's footnote-entry list, positionally.
  * Book 3's drafter anchored structurally on the `BOOK III` / `BOOK IV`
    headings and diffed with the apparatus still in.
  * Book 3's reviewer asked whether the served Book occurs as ONE contiguous
    letter-token block in PG, exactly once — anchorless and digit-blind.
  * Book 4's drafter took two needles out of the served text, required each to
    occur exactly once in PG, and derived a region from them.

This rule is a fifth kind: **global per-paragraph fingerprint alignment**.
It never looks for a heading, a Book number, a `FOOTNOTES:` line, a digit or a
needle, and it never derives or assumes a region. It cuts the WHOLE PG file
into blank-line blocks with the apparatus still in, fingerprints every block,
fingerprints each of the 81 served paragraphs the same way, and asks three
questions whose answers are outputs:

  1. does each served paragraph's fingerprint occur EXACTLY ONCE among the
     4,000-odd blocks of the whole file?
  2. are the 81 matched block indices strictly consecutive and ascending?
  3. with the blocks so located, does a character-level diff contain nothing
     but classified footnote markers, whitespace and letter case?

Question 2 is the one the contiguous-token-block rule cannot ask: a single
concatenated block proves the WORDS are PG's and in PG's order, but it is
blind to where the paragraph breaks fall, because the breaks are not tokens.
This rule proves the served file's paragraph DIVISION is PG's own blank-line
division, paragraph by paragraph, which is what the product's alignment
contract (audio, Cast data, saved reading positions) actually rests on.

Digit-blindness is not a way of avoiding the footnote markers: PG's markers are
bare digit runs, so a letters-only tokenizer never sees them and cannot
"strip" them. They are then paid for explicitly in step 4, where every
character-level difference is classified before anything is removed, and every
digit run inside the located region is listed.

Three recorded traps are live and none of them can fire here: `FOOTNOTES:`
occurs twice in PG (no anchor is used), PG #1727 is CRLF throughout (the file
is read as bytes and split on CRLF explicitly, never in universal-newline
mode), and marker 44 in this Book is space-set rather than glued (no
glued-only removal rule exists in this script; removal is per classified
difference).
"""
import json, re, sys, hashlib, pathlib, unicodedata

PG   = 'source-texts/pg1727-butler-1900.txt'
SRC  = 'book04/source-book4.json'
SERV = '../../../app/public/data/editions/odyssey-original-en.json'

ok_count = [0]
def ok(msg):
    ok_count[0] += 1
    print('  ok   ' + msg)
def bad(msg):
    print('  FAIL ' + msg)
    sys.exit(1)

print(__doc__.split('"""')[0].strip() or '')
print('Independent source reconstruction — the Odyssey, Book 4 (reviewer\'s rule)')
print()

# ---------------------------------------------------------------- 0. inputs
raw = open(PG, 'rb').read()
print('0. Inputs, read as bytes')
print('   PG #1727           sha256', hashlib.sha256(raw).hexdigest())
if raw.count(b'\r\n') != raw.count(b'\n') or raw.count(b'\r') != raw.count(b'\r\n'):
    bad('PG is not CRLF throughout — the recorded trap has changed shape')
ok('PG #1727 is CRLF throughout (%d lines); read as bytes, split on CRLF, never '
   'in universal-newline mode' % raw.count(b'\r\n'))
text  = raw.decode('utf-8')
lines = text.split('\r\n')

src = json.load(open(SRC, encoding='utf-8'))
srcb = open(SRC, 'rb').read()
print('   source-book4.json  sha256', hashlib.sha256(srcb).hexdigest())
served = json.load(open(SERV, encoding='utf-8'))
print('   served original-en sha256',
      hashlib.sha256(open(SERV, 'rb').read()).hexdigest())
ch4 = next(c for c in served['chapters'] if c['number'] == 4)
if src['paragraphs'] != ch4['paragraphs'] or src['title'] != ch4['title']:
    bad('source-book4.json is not byte-identical to the served chapter 4')
ok('source-book4.json is byte-identical to the served original-en chapter 4 '
   '(%d paragraphs) — the reconstruction is run against the SERVED text'
   % len(src['paragraphs']))
paras = src['paragraphs']

# ------------------------------------------- 1. cut the WHOLE file into blocks
print()
print('1. The whole PG file cut into blank-line blocks, apparatus left in')
blocks, cur = [], []
start = 0
for i, ln in enumerate(lines):
    if ln.strip() == '':
        if cur:
            blocks.append((start, cur))
        cur, start = [], i + 1
    else:
        if not cur:
            start = i
        cur.append(ln)
if cur:
    blocks.append((start, cur))
print('   blocks in the whole file: %d  (an OUTPUT — no region is assumed)' % len(blocks))

TOK = re.compile(r'[a-z]+')
def fp(s):
    """Lowercase letters-only token tuple. Digit runs are not tokens at all."""
    s = unicodedata.normalize('NFC', s)
    return tuple(TOK.findall(s.lower()))

block_fp = [fp(' '.join(b[1])) for b in blocks]
index = {}
for i, f in enumerate(block_fp):
    index.setdefault(f, []).append(i)
ok('every block fingerprinted with a letters-only tokenizer (digit runs, and '
   'so every footnote marker, are invisible to it by construction)')

# --------------------------------------- 2. locate each served paragraph globally
print()
print('2. Each served paragraph looked up in the WHOLE file by fingerprint')
hits, ambiguous, missing = [], [], []
for k, p in enumerate(paras):
    f = fp(p)
    m = index.get(f, [])
    if len(m) == 1:
        hits.append(m[0])
    elif len(m) == 0:
        missing.append(k); hits.append(None)
    else:
        ambiguous.append((k, m)); hits.append(m[0])
if missing:
    bad('served paragraphs with NO fingerprint match in PG: %s'
        % [f'B04-P{k+1:03d}' for k in missing])
ok('all 81 served paragraphs have a fingerprint match somewhere in PG')
if ambiguous:
    for k, m in ambiguous:
        print('   note  B04-P%03d matches %d blocks: %s' % (k + 1, len(m), m))
    bad('a served paragraph is not uniquely located')
ok('each of the 81 matches is UNIQUE among the %d blocks of the whole file — '
   'nothing was searched for, so the location is an output' % len(blocks))

runs_ok = all(hits[i + 1] == hits[i] + 1 for i in range(80))
if not runs_ok:
    breaks = [(i, hits[i], hits[i + 1]) for i in range(80) if hits[i + 1] != hits[i] + 1]
    bad('the 81 matched blocks are not consecutive: %s' % breaks[:5])
ok('the 81 matched blocks are STRICTLY CONSECUTIVE, blocks %d..%d — so the '
   'served file\'s paragraph DIVISION is PG\'s own blank-line division, and no '
   'PG block between them was dropped or merged'
   % (hits[0], hits[-1]))
lo_line = blocks[hits[0]][0] + 1
hi_line = blocks[hits[-1]][0] + len(blocks[hits[-1]][1])
print('   region: PG lines %d..%d  (an OUTPUT, never an assumption)' % (lo_line, hi_line))

before = ' '.join(blocks[hits[0] - 1][1])[:70]
after  = ' '.join(blocks[hits[-1] + 1][1])[:70]
print('   block before the run: %r' % before)
print('   block after  the run: %r' % after)

# ------------------------------- 3. character-level diff, apparatus still in
print()
print('3. Character-level diff against those blocks, with the apparatus still in')
import difflib
marker_dels, case_diffs, ws_diffs, other = [], [], [], []
for k, p in enumerate(paras):
    pg = '\n'.join(blocks[hits[k]][1])
    a, b = pg, p
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            continue
        sa, sb = a[i1:i2], b[j1:j2]
        if tag == 'delete' and re.fullmatch(r'\s*\d+\s*', sa):
            marker_dels.append((k, re.search(r'\d+', sa).group(), sa))
        elif tag == 'replace' and sa.lower() == sb.lower() and sa.isalpha():
            case_diffs.append((k, sa, sb))
        elif re.fullmatch(r'\s*', sa) and re.fullmatch(r'\s*', sb):
            ws_diffs.append((k, repr(sa), repr(sb)))
        else:
            other.append((k, tag, repr(sa), repr(sb)))
print('   footnote-marker deletions : %d' % len(marker_dels))
print('   letter-case differences   : %d %s'
      % (len(case_diffs), [(f'B04-P{k+1:03d}', x, y) for k, x, y in case_diffs]))
print('   whitespace-only diffs     : %d %s'
      % (len(ws_diffs), [(f'B04-P{k+1:03d}', x, y) for k, x, y in ws_diffs]))
print('   every other difference    : %d' % len(other))
for k, tag, x, y in other[:10]:
    print('      B04-P%03d %s %s -> %s' % (k + 1, tag, x, y))
if other:
    bad('a difference that is neither a marker, a case change nor whitespace')
ok('every difference is a footnote marker, a letter-case change or whitespace '
   '— nothing else of any kind, and nothing was removed before classifying')

nums = [int(n) for _, n, _ in marker_dels]
print('   markers: %s' % nums)
if sorted(nums) != nums or len(set(nums)) != len(nums):
    bad('markers do not ascend, or a number repeats')
ok('markers ascend through the Book and no number repeats')
spaced = [(f'B04-P{k+1:03d}', n, raw_) for k, n, raw_ in marker_dels if raw_ != n]
print('   of those, NOT glued to the previous word: %d %s' % (len(spaced), spaced))
ok('the recorded space-set marker is reproduced by a rule that has no '
   'glued-only removal step at all')
if len(case_diffs) != 1 or case_diffs[0][1:] != ('t', 'T'):
    bad('the letter-case difference is not the single recorded one')
ok('the ONE case difference is B04-P001\'s `they` -> `They`: PG opens Book IV '
   'mid-sentence, as it opens Book III')

# every digit run inside the located region is accounted for
region_text = '\n'.join('\n'.join(blocks[i][1]) for i in range(hits[0], hits[-1] + 1))
digit_runs = re.findall(r'\d+', region_text)
print('   digit runs inside the located region: %d -> %s' % (len(digit_runs), digit_runs))
if digit_runs != [str(n) for n in nums]:
    bad('a digit run inside the region is not one of the classified markers')
ok('every digit run inside the located region is one of the classified '
   'markers — digit-blindness is paid for, not waved away')

# ---------------------------------------- 4. word-for-word after removing markers
print()
print('4. Word-for-word comparison after removing ONLY the classified markers')
def words(s):
    return s.split()
tot, bad_p = 0, []
ident = 0
for k, p in enumerate(paras):
    pg = '\n'.join(blocks[hits[k]][1])
    for _, n, rawm in sorted({(k2, n, r) for k2, n, r in marker_dels if k2 == k},
                            key=lambda t: -len(t[2])):
        pg = pg.replace(rawm, ' ' if rawm != n else '', 1)
    wa, wb = words(pg), words(p)
    if k == 0:
        wa[0] = wa[0][0].upper() + wa[0][1:]
    tot += len(wa)
    if wa != wb:
        bad_p.append(k)
    if ' '.join(wa) == ' '.join(wb):
        ident += 1
if bad_p:
    bad('word-for-word mismatch in %s' % [f'B04-P{k+1:03d}' for k in bad_p])
ok('%d of %d paragraphs match PG word for word (only the classified markers '
   'removed, and only B04-P001\'s recorded capital restored)' % (ident, len(paras)))
ok('%d words compared word for word, 0 mismatches' % tot)

# ------------------------------------------------- 5. negative controls
print()
print('5. Negative controls — the rule must be able to FAIL')
def locate(ps):
    out = []
    for p in ps:
        m = index.get(fp(p), [])
        out.append(m[0] if len(m) == 1 else None)
    return out
# Strengthened at Book 5's step 6 under **D18**, the two-clause control rule
# (`../../scripts/controls.py`), which round 1 of Book 5 asked for by name.
# Control C below was written `edited[20].replace('the','teh',1)` and control D
# dropped the sixth word of `paras[30]` -- neither a no-op today, because
# B04-P021 contains `the` and B04-P031 is 72 words long, but neither said so.
# Both are now built from the paragraph's own words, with the precondition
# asserted, and every control asserts BOTH clauses: that its mutation changed
# the input, and that this check's verdict changed with it. The review's
# verdict is unchanged; only the assertions are stronger.
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / 'scripts'))
from controls import (control as two_clause, declare_blind,   # noqa: E402
                      summary as control_summary)


def consecutive(ps):
    h = locate(ps)
    return all(h[i + 1] == h[i] + 1 for i in range(len(ps) - 1)
               if h[i] is not None and h[i + 1] is not None)


def located(k):
    return lambda ps: locate(ps)[k] is not None


swapped = paras[:]; swapped[10], swapped[11] = swapped[11], swapped[10]
two_clause('A: two paragraphs swapped', paras, swapped, consecutive)
ok('control A: two paragraphs swapped breaks consecutiveness')

merged = paras[:2] + [paras[2] + ' ' + paras[3]] + paras[4:]
two_clause('B: two paragraphs merged', paras, merged, located(2))
ok('control B: two paragraphs MERGED is detected — the fingerprint no longer '
   'matches any single block (this is the question a contiguous-token-block '
   'rule cannot ask)')

edited = paras[:]
# The word is taken from the paragraph's OWN letters, and it must be a letter
# run: the first version of this took the longest whitespace token, which was
# `understanding.”` -- and doubling its final character changed only
# punctuation, which fp() normalizes away. Clause (b) caught that: the
# mutation was real and the verdict did not move. That is R-2 happening live,
# in the control that was written to demonstrate R-1.
_w = max(re.findall(r'[A-Za-z]{6,}', edited[20]), key=len)
edited[20] = edited[20].replace(_w, _w[:-1] + _w[-1] * 2, 1)
two_clause('C: one letter changed (%r)' % _w, paras, edited, located(20))
ok('control C: one letter changed in one word is detected')

dropped = paras[:]; ws = dropped[30].split()
if len(ws) < 7:
    bad('control D precondition: B04-P031 has only %d words' % len(ws))
dropped[30] = ' '.join(ws[:5] + ws[6:])
two_clause('D: one word dropped (of %d)' % len(ws), paras, dropped, located(30))
ok('control D: one word dropped is detected')

invented = 'Telemachus put on his sandals of gleaming titanium and rang the bell.'
two_clause('E: an invented paragraph', paras, paras[:30] + [invented] + paras[31:],
           located(30))
if index.get(fp(invented)):
    bad('control E: an invented paragraph was found in PG')
ok('control E: an invented paragraph occurs zero times')

# the declared limit of a digit-blind fingerprint, and what it costs HERE
probe = paras[:]
ki = next(i for i, p_ in enumerate(paras) if re.search(r'\btwenty\b', p_))
probe[ki] = re.sub(r'\btwenty\b', 'thirty', probe[ki], count=1)
two_clause('F: a changed number-word', paras, probe, located(ki))
if locate(probe)[ki] is not None:
    bad('control F: a changed number-word was NOT detected')
ok('control F: a changed NUMBER-WORD is detected — and it is the only kind of '
   'number this Book has: every digit run in the located region is a footnote '
   'marker (step 3), so Butler writes all %d of Book 4\'s quantities in words '
   'and the fingerprint\'s numeral-blindness costs nothing here'
   % len(re.findall(r'\b(one|two|three|four|ten|twelve|twenty)\b',
                    ' '.join(paras).lower())))
# the blindness this rule keeps, declared rather than waved away
declare_blind('a change inside ONE paragraph that PG also carries',
              because='the fingerprint compares the served file against PG, '
                      'so a defect they share moves neither side',
              carried_by='the four unlike source rules used across Books 2-5')
print(control_summary())

# --------------------------------------------------- 6. brackets, reported
print()
print('6. Butler\'s square brackets in this Book (D12), reported not touched')
for k, p in enumerate(paras):
    for m in re.finditer(r'[\[\]]', p):
        print('   B04-P%03d %s …%s…' % (k + 1, m.group(),
              p[max(0, m.start() - 55):m.start() + 25].replace('\n', ' ')))
opens  = sum(p.count('[') for p in paras)
closes = sum(p.count(']') for p in paras)
print('   opening brackets %d, closing brackets %d' % (opens, closes))
if (opens, closes) != (2, 1):
    bad('the bracket count in Book 4 is not 2 open / 1 close')
ok('two opening brackets and one closing: the first never closes (D12 class C)')

print()
print('OK — the served Book 4 is Butler\'s text, and its PARAGRAPH DIVISION is')
print('     PG\'s own. Nothing was anchored, searched for or assumed: every')
print('     served paragraph was located by fingerprint in the whole file, each')
print('     uniquely, the 81 hits are consecutive, every character-level')
print('     difference was classified before anything was removed, and six')
print('     controls behave as they must.  (%d checks passed)' % ok_count[0])
