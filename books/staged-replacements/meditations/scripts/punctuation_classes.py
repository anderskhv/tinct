#!/usr/bin/env python3
"""Every punctuation change in the whole work, derived from the texts.

Written for the cross-book pass (2026-09-12). Eleven `continuity.md` files each
record their own book's punctuation tally in prose; no single place holds the
classes, and nothing has ever checked one book's practice against another's. This
derives the whole-work table from the 487 paragraph pairs themselves, so that the
classes can be compared rather than trusted, and prints it grouped by class.

Method: align each candidate paragraph with its source word by word (punctuation
stripped) and report every difference in the punctuation that follows an aligned
pair. Differences inside a span whose wording changed cannot be aligned and are
not reported -- those are the changes each book's sheet records at its paragraph.

  python3 scripts/punctuation_classes.py            # the table
  python3 scripts/punctuation_classes.py --counts   # counts per class per book
"""
import json, os, re, sys, difflib, collections

HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.join(HERE, '..')
ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
MARKS = ',;:.?!—'


def accepted(n):
    """The accepted candidate for book n: v3 where the cross-book pass touched it,
    otherwise v2."""
    for v in ('candidate-v3.json', 'candidate-v2.json'):
        f = os.path.join(PKG, f'book{n}', v)
        if os.path.exists(f):
            return json.load(open(f, encoding='utf-8'))
    raise SystemExit(f'no accepted candidate for book {n}')


def marks_after(w):
    w = w.rstrip()
    out = ''
    while w and w[-1] in MARKS:
        out = w[-1] + out
        w = w[:-1]
    return w, out


def pairs(text):
    return [marks_after(w) for w in text.split()]


def diff(source, candidate):
    sp, cp = pairs(source), pairs(candidate)
    sm = difflib.SequenceMatcher(a=[w for w, _ in sp], b=[w for w, _ in cp], autojunk=False)
    out = []
    for i1, j1, n in sm.get_matching_blocks():
        # Only inside a run of identical words: a mark that sits three words deep
        # in a seven-word match is a punctuation decision; one that sits at the
        # edge of a two-word match is a by-product of the wording changing round
        # it, which is what the book's own sheet records at its paragraph.
        if n < 7:
            continue
        for k in range(3, n - 3):
            (w, a), (_, b) = sp[i1 + k], cp[j1 + k]
            if a != b:
                out.append((w, a, b, ' '.join(x for x, _ in sp[max(0, i1 + k - 3):i1 + k + 4])))
    return out


def classify(before, after):
    if before == ',—' and after == '—':
        return "Long's comma before an em dash removed"
    if before == ',' and after == '':
        return "one of Long's commas removed"
    if before == '' and after == ',':
        return 'a comma added'
    if before == ',' and after == ';':
        return "a comma raised to a semicolon"
    if before == ',' and after == ':':
        return "a comma raised to a colon"
    if before == ',' and after == '—':
        return "a comma replaced by an em dash"
    if before == '.' and after == ',':
        return "a PG full stop corrected to a comma"
    return f'other: {before!r} -> {after!r}'


def main():
    staged = json.load(open(os.path.join(PKG, 'meditations-original-en.staged.json'), encoding='utf-8'))
    cand = [accepted(n) for n in range(1, 13)]
    rows = []
    for ch, cc in zip(staged['chapters'], cand):
        for i, (s_, m_) in enumerate(zip(ch['paragraphs'], cc['paragraphs'])):
            ref = f'{ROMAN[ch["number"]-1]}.{i+1}'
            for w, a, b, ctx in diff(s_, m_):
                rows.append((classify(a, b), ch['number'], ref, w, ctx))

    # Capitalisation after Long's own question mark, the other class the pass collates.
    cap = []
    for ch, cc in zip(staged['chapters'], cand):
        for i, (s_, m_) in enumerate(zip(ch['paragraphs'], cc['paragraphs'])):
            ref = f'{ROMAN[ch["number"]-1]}.{i+1}'
            low = len(re.findall(r'\?\s+[a-z]', s_))
            if low:
                cap.append((ref, low, len(re.findall(r'\?\s+[a-z]', m_))))

    by = collections.defaultdict(list)
    for cls, b, ref, w, ctx in rows:
        by[cls].append((b, ref, w, ctx))
    if '--counts' in sys.argv:
        for cls, items in sorted(by.items(), key=lambda kv: -len(kv[1])):
            per = collections.Counter(ROMAN[b - 1] for b, *_ in items)
            print(f'{len(items):4d}  {cls}')
            print('      ', dict(per))
    else:
        for cls, items in sorted(by.items(), key=lambda kv: -len(kv[1])):
            print(f'\n## {cls} — {len(items)}\n')
            for b, ref, w, ctx in items:
                print(f'  {ref:8s} after "{w}"   …{ctx}…')
    print('\n## Long\'s lowercase after his own question mark — kept everywhere\n')
    tot = sum(l for _, l, _ in cap)
    kept = sum(k for _, _, k in cap)
    for ref, l, k in cap:
        print(f'  {ref:8s} Long {l}, candidate {k}' + ('' if l == k else '   <-- DIVERGENCE'))
    print(f'  total: Long {tot}, candidate {kept}')
    assert tot == kept, 'a lowercase after a question mark has been capitalised somewhere'


if __name__ == '__main__':
    main()
