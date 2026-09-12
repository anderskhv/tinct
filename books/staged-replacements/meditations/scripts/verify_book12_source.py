#!/usr/bin/env python3
"""Book XII step 1: verify the staged original's chapter 12 against the raw PG text.

Written from scratch for Book XII, and deliberately NOT by the build's rules.

Why not a re-run of scripts/build_original_en_from_pg15877.py: byte-identity to a
re-run shows only that the file matches the script, which is exactly how the Book
IV illustration captions and the Book VII flush-left footnotes survived the first
build (Book IX reviewer).  Why not a reconstruction sharing the build's rules: a
reconstruction with the same blind spot proves nothing (Book X reviewer).  So this
script (a) AUDITS ITS OWN RULES against the raw range and prints the audit BEFORE
it reports any diff, and (b) reconstructs the chapter by a rule of a different
KIND from the build's, so that a shared blind spot cannot hide.

The build's footnote rule is a state machine: on a line matching an `[A-D]`
opener, consume every following indented OR BLANK line until flush-left text
resumes.  That rule can silently swallow an indented verse block that follows a
footnote with only blank lines between it.

The rule here is per-block and keys on the INDENTATION PROFILE, with no opener
state and no consumption:

  1. split the range into blocks separated by blank lines;
  2. a block whose first line is flush left is BODY;
  3. a block all of whose lines are indented by >= 4 is APPARATUS (dropped);
  4. a block all of whose lines are indented but whose MINIMUM indentation is
     < 4 is VERSE, and is joined into the body paragraph before it;
  5. a body block opening `N. ` starts a new section; any other body block
     continues the section before it.

That rule reaches the two cases the build's reaches by a different route — and
one of them is the case where the Book XI reviewer's own alternative rule ("drop
the four-space runs") would have FAILED: PG 6886 is the second half of footnote
[A]'s body, indented NINE spaces and carrying no opener, so a rule keyed on the
number four would have leaked `[Greek: Sphairos …]` into XII.3.  Audited below.

Usage:  python3 scripts/verify_book12_source.py
"""
import json, os, re, sys, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
PG = os.path.join(ROOT, 'source', 'pg15877-long-1862.txt')
STAGED = os.path.join(ROOT, 'meditations-original-en.staged.json')

START, END = 6818, 7174          # after the `XII.` header at 6817, before `INDEXES.` at 7175
OPENER = re.compile(r'\s*\[[A-D]\]')
MARKER = re.compile(r'\[[A-D]\]')


def lines():
    return open(PG, encoding='utf-8').read().split('\n')


def blocks(L):
    """Maximal runs of non-blank lines in [START, END], as (first, last, [lines])."""
    out, cur = [], None
    for i in range(START, END + 1):
        l = L[i - 1]
        if l.strip():
            if cur is None:
                cur = [i, i, [l]]
            else:
                cur[1] = i; cur[2].append(l)
        else:
            if cur: out.append(tuple(cur)); cur = None
    if cur: out.append(tuple(cur))
    return out


def indent(l):
    return len(l) - len(l.lstrip())


def audit(L):
    """Test every rule that can fail silently, against the raw range. Printed first."""
    ok = True
    bl = blocks(L)
    print('=== RULE AUDIT, PG lines %d-%d (Book XII) ===' % (START, END))
    print('Boundaries: %d %r ... %d %r ... %d %r' %
          (6817, L[6816], START + 1, L[START][:44], 7175, L[7174]))
    assert L[6816].strip() == 'XII.' and L[7174].strip() == 'INDEXES.'

    # (1) every maximal INDENTED run, with its indentation profile, so that no
    #     footnote rule can be shown to have swallowed verse by accident.
    runs = [(a, b, sorted({indent(x) for x in ls}), ls)
            for a, b, ls in bl if all(indent(x) > 0 for x in ls)]
    print('\n(1) maximal indented runs: %d' % len(runs))
    for a, b, ind, ls in runs:
        kind = ('footnote-opener' if OPENER.match(ls[0]) else
                'verse' if min(ind) < 4 else 'unmarked indented block')
        print('    %4d-%-4d indent %-9s %-22s %r' % (a, b, ind, kind, ls[0].strip()[:58]))
    verse = [r for r in runs if min(r[2]) < 4]
    deep = [r for r in runs if min(r[2]) >= 4]
    print('    -> %d verse run(s) (min indent < 4), %d apparatus run(s) (min indent >= 4)'
          % (len(verse), len(deep)))

    # (1a) every apparatus run must really be footnote apparatus: it opens with a
    #      marker, or it is the continuation of the run before it with only blank
    #      lines between.  Checked by content, not assumed.
    print('\n(1a) each apparatus run is a footnote opener or a continuation of one:')
    prev_end = None
    for a, b, ind, ls in deep:
        if OPENER.match(ls[0]):
            why = 'opener %s' % MARKER.search(ls[0]).group(0)
        else:
            between = [L[i - 1] for i in range(prev_end + 1, a)] if prev_end else ['?']
            cont = prev_end is not None and all(not x.strip() for x in between)
            why = ('continuation of the run ending %d (only blank lines between)' % prev_end
                   if cont else 'UNEXPLAINED')
            if not cont: ok = False
        print('    %4d-%-4d indent %-9s %s' % (a, b, ind, why))
        prev_end = b
    print('    NOTE: the 9-space run is the second half of footnote [A] at 6883. A rule '
          'keyed on\n          the NUMBER four ("drop the four-space runs") would have '
          'leaked it into XII.3.')

    # (2) in-text footnote markers must reconcile with the openers.
    op = [a for a, b, ind, ls in deep if OPENER.match(ls[0])]
    mk = [(i, L[i - 1]) for i in range(START, END + 1) if MARKER.search(L[i - 1])]
    flush = [i for i, l in mk if not l.startswith(' ')]
    in_verse = [i for i, l in mk if l.startswith(' ') and indent(l) < 4]
    in_note = [i for i, l in mk if l.startswith(' ') and indent(l) >= 4]
    print('\n(2) footnote markers vs openers')
    print('    indented openers: %d at %s' % (len(op), op))
    print('    in-text markers : %d flush-left at %s' % (len(flush), flush))
    print('                      %d at the end of indented VERSE at %s' % (len(in_verse), in_verse))
    print('    marker lines that are themselves openers: %d' % len(in_note))
    print('    -> %d + %d = %d in-text markers for %d openers  %s'
          % (len(flush), len(in_verse), len(flush) + len(in_verse), len(op),
             'RECONCILES' if len(flush) + len(in_verse) == len(op) else 'MISMATCH'))
    if len(flush) + len(in_verse) != len(op): ok = False

    # (3) the Book VII class: a footnote printed FLUSH LEFT would be read as text.
    fl_open = [i for i in range(START, END + 1) if re.match(r'\[[A-D]\]', L[i - 1])]
    print('\n(3) flush-left footnote openers (the VII.45 class): %s' % (fl_open or 'none'))
    if fl_open: ok = False

    # (4) the Book IV class: illustration captions.
    cap = [i for i in range(START, END + 1) if 'Illustration' in L[i - 1]]
    print('(4) illustration captions (the Book IV class): %s' % (cap or 'none'))
    if cap: ok = False

    # (5) short standalone flush-left lines: running heads, page numbers, catchwords?
    short = [(i, L[i - 1]) for i in range(START, END + 1)
             if L[i - 1].strip() and not L[i - 1].startswith(' ') and len(L[i - 1].strip()) < 40]
    bad = [(i, s) for i, s in short
           if not re.search(r'[.?!)\]"]$', s.strip()) and not re.match(r'\d+\.', s.strip())]
    print('(5) short flush-left lines: %d, every one the wrapped tail of a paragraph '
          '(ends in terminal\n    punctuation); running heads / page numbers / catchwords: %s'
          % (len(short), bad or 'none'))
    if bad: ok = False

    # (6) Greek in the body.
    gk = [(i, L[i - 1].count('[Greek:')) for i in range(START, END + 1) if '[Greek:' in L[i - 1]]
    gk_body = [i for i, _ in gk if indent(L[i - 1]) == 0]
    print('(6) [Greek: ...] spans: %d on %d lines %s; flush-left (i.e. in the body): %s'
          % (sum(n for _, n in gk), len(gk), [i for i, _ in gk], gk_body or 'none'))
    if gk_body: ok = False

    # (7) normalisations the build applies. D14: every typographic-only rule of the
    #     build must be reproduced here, or it shows as a diff that is not a defect.
    sp = [i for i in range(START, END + 1) if re.search(r'\s[,;:.?!]', L[i - 1])]
    us = [i for i in range(START, END + 1) if '_' in L[i - 1]]
    dg = [(i, L[i - 1].count('+')) for i in range(START, END + 1) if '+' in L[i - 1]]
    print('(7) build normalisations in range (D14): space-before-punctuation fires at %s; '
          'underscores at\n    %s (all inside footnote bodies: %s); dagger marks at %s'
          % (sp or 'no line', us, all(indent(L[i - 1]) >= 4 for i in us), dg))
    if any(indent(L[i - 1]) == 0 for i in us): ok = False

    print('\n=== AUDIT %s ===\n' % ('PASSED' if ok else 'FAILED'))
    return ok


def reconstruct(L):
    """Rebuild chapter 12 by the block/indentation-profile rule described above."""
    paras = []
    for a, b, ls in blocks(L):
        inds = [indent(x) for x in ls]
        if inds[0] == 0:                                  # BODY
            text = ' '.join(x.strip() for x in ls)
            if re.match(r'\d+\.\s', text):
                paras.append(text)
            elif paras:
                paras[-1] += ' ' + text
            else:
                paras.append(text)
        elif min(inds) >= 4:                              # APPARATUS
            continue
        else:                                             # VERSE
            assert paras, (a, b)
            paras[-1] += ' ' + ' '.join(x.strip() for x in ls)
    out = []
    for k, p in enumerate(paras):
        t = MARKER.sub('', p)                 # footnote reference letters
        # Long's dagger marks are deliberately LEFT IN, so that each one the staged
        # file removed surfaces as a diff and can be counted (PROVENANCE.md section 4).
        t = t.replace('---', '—').replace('--', '—')
        t = t.replace('_', '')                # PG italic underscores
        t = re.sub(r'\s+', ' ', t).strip()
        t = re.sub(r'\s+([,;:.?!])', r'\1', t)            # D14
        if k == 0 and not re.match(r'\d+\.\s', t):
            t = '1. ' + t
        out.append(t)
    return out


def main():
    L = lines()
    ok = audit(L)
    mine = reconstruct(L)
    staged = json.load(open(STAGED, encoding='utf-8'))
    ch = next(c for c in staged['chapters'] if c['number'] == 12)
    theirs = ch['paragraphs']
    print('reconstructed paragraphs: %d   staged: %d   %s'
          % (len(mine), len(theirs), 'COUNT MATCH' if len(mine) == len(theirs) else 'COUNT MISMATCH'))
    print('staged file sha256:', hashlib.sha256(open(STAGED, 'rb').read()).hexdigest())
    print('PG file sha256    :', hashlib.sha256(open(PG, 'rb').read()).hexdigest())
    diffs = [k + 1 for k, (x, y) in enumerate(zip(mine, theirs)) if x != y]
    print('differing paragraphs:', diffs or 'none')
    for k in diffs:
        import difflib
        a, b = mine[k - 1].split(), theirs[k - 1].split()
        print('  XII.%d: %s' % (k, ' '.join(x for x in difflib.ndiff(a, b) if x[0] in '+-')))
    # the expected diff: exactly the dagger marks PROVENANCE.md section 4 documents
    expected = [16]
    dagger_only = all(
        mine[k - 1].replace('+', '').replace('  ', ' ').strip() == theirs[k - 1]
        for k in diffs)
    good = ok and len(mine) == len(theirs) and diffs == expected and dagger_only
    print('\nexpected diffs (documented dagger marks): %s -- each differing ONLY by a "+": %s'
          % (expected, dagger_only))
    print('\nRESULT:', 'no rebuild needed' if good else 'INVESTIGATE')
    return 0 if good else 1


if __name__ == '__main__':
    sys.exit(main())
