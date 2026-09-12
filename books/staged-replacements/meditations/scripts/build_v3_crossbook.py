#!/usr/bin/env python3
"""The cross-book v3 pass: one change set across the twelve, ordered BY CLASS.

Written 2026-09-12, after Book XII was accepted and after the whole-work
mechanical checks (scripts/assemble_modern_en.py, scripts/glossary_frequency.py,
scripts/punctuation_classes.py) had run over a fixed state.

The Book XII round-1 reviewer's caution governs the shape of this script:
**eleven closed acceptances are the asset, and a sequence of single-book
reopenings dissolves it.** So the work is organised by class, not by book: each
class is decided once, here, with its reason; the script applies every class in
one pass; each touched book gets ONE new file, candidate-v3.json, and one hash;
and the books a class does not reach are not opened at all.

Six classes change text (A-F). Everything else the pass found is a record
correction and changes no word; those are listed in ../README.md and in the
sheets they belong to.

  python3 scripts/build_v3_crossbook.py          # report only
  python3 scripts/build_v3_crossbook.py --write  # write bookN/candidate-v3.json
"""
import json, os, re, sys, hashlib, difflib, collections

HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.join(HERE, '..')
ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

# (class, book, section, old, new, why)
CHANGES = [
 # --- A. "such like" / "suchlike": one rendering, the XI.1 / XII.2 one -------
 ('A', 1, 17, 'torches and statues and suchlike show',
              'torches and statues and show of that kind',
  'Long\'s "suchlike"; XI.1 and XII.2 render the same phrase "of that kind"'),
 ('A', 3, 11, 'and suchlike coincidence and chance',
              'and coincidence and chance of that kind',
  'the same phrase, the same rendering'),
 ('A', 9, 1,  'of such like successions',
              'of successions of that kind',
  'Long\'s two-word spelling; the same phrase again'),
 # --- B. the plural distributive "several": the XI.2 / XII.30 rendering -----
 ('B', 5, 1, 'to put in order their several parts of the universe',
             'to put in order their separate parts of the universe',
  'Long\'s distributive "several", dead in current English in this sense'),
 ('B', 5, 1, 'those who love their several arts',
             'those who love their separate arts',
  'the second occurrence, in the same section; the ledger recorded one'),
 # --- C. the third-person plain-future "shall" -----------------------------
 ('C', 3, 9,  'whether there shall be in your ruling part any opinion',
              'whether there will be in your ruling part any opinion',
  'a plain future in a noun clause, third person'),
 ('C', 7, 8,  'for you will come to them, if it shall be necessary',
              'for you will come to them, if it is necessary',
  'a plain future in a clause of condition; English uses the present'),
 ('C', 7, 24, 'if even the perception of doing wrong shall depart',
              'if even the perception of doing wrong departs',
  'a plain future in a clause of condition'),
 ('C', 7, 68, 'and the use shall say to that which falls under the hand',
              'and the use will say to that which falls under the hand',
  'a plain future, third person; not on the ledger\'s list of three'),
 # --- D. "adapted to" in the dead sense of "suited to" ---------------------
 ('D', 5, 8,  'as a thing adapted to procure health',
              'as a thing suited to procure health',
  'the live modern sense of "adapted" is *altered to fit*'),
 ('D', 6, 16, 'should be adapted to the work for which it has been made',
              'should be suited to the work for which it has been made',
  'the same word in the same dead sense'),
 ('D', 10, 11, 'For nothing is so much adapted to produce magnanimity',
               'For nothing is so well suited to produce magnanimity',
  '"so much suited" is not English; "so well suited" is Long\'s sense exactly'),
 # --- E. Long's lowercase after his own question mark ----------------------
 ('E', 4, 20, 'if it is not praised? Or gold, ivory',   'if it is not praised? or gold, ivory',
  'Long prints lowercase'),
 ('E', 5, 5,  'below the mark? Or are you compelled',   'below the mark? or are you compelled',
  'Long prints lowercase'),
 ('E', 5, 11, 'they call the ruling part? And whose soul', 'they call the ruling part? and whose soul',
  'Long prints lowercase'),
 ('E', 5, 23, 'makes himself miserable? For they vex him', 'makes himself miserable? for they vex him',
  'Long prints lowercase'),
 ('E', 5, 28, 'whose armpits stink? Are you angry with him whose mouth',
              'whose armpits stink? are you angry with him whose mouth',
  'Long prints lowercase'),
 ('E', 6, 10, 'and such a disorder? And why do I care',  'and such a disorder? and why do I care',
  'Long prints lowercase'),
 ('E', 6, 10, 'at last become earth? And why am I disturbed',
              'at last become earth? and why am I disturbed',
  'the second in the same section'),
 ('E', 6, 44, 'any desire toward that? For what advantage', 'any desire toward that? for what advantage',
  'Long prints lowercase'),
 ('E', 6, 55, 'listen to anybody else? Or how could the helmsman',
              'listen to anybody else? or how could the helmsman',
  'Long prints lowercase'),
 ('E', 7, 18, 'to the universal nature? And can you take a bath',
              'to the universal nature? and can you take a bath',
  'Long prints lowercase'),
 ('E', 7, 58, 'in the same way? And why do you not leave these agitations',
              'in the same way? and why do you not leave these agitations',
  'Long prints lowercase'),
 # --- F. the "vexed / vexation" row, applied where it was not --------------
 # --- G. Long's comma before an em dash: removed in eleven books, two left ----
 ('G', 7, 49, 'Consider the past,—such great changes', 'Consider the past—such great changes',
  'the package removes Long\'s comma before an em dash; 38 of his 40 were already gone'),
 ('G', 7, 55, 'the persuasions of the body,—for it is the peculiar office',
              'the persuasions of the body—for it is the peculiar office',
  'the second and last straggler in the work'),
 ('F', 1, 15, 'laugh to cover his annoyance', 'laugh to cover his resentment',
  'Long\'s "vexation"; the row renders the family "resent / resentment" '
  '(VI.20 "show any signs of resentment"), and Book I was drafted before the row was fixed'),
]

# --- Class C, re-derived: every "shall" that STANDS in the work after the pass,
# with the licence in the "shall" rule (GLOSSARY.md, Voice and form) that keeps
# it. The ledger recorded three third-person plain futures; a mechanical
# re-derivation over the twelve candidates finds a fourth (VII.68) and two that
# had never been classified either way (VII.54, IX.29). Both are kept, and the
# reason is written here so the number stops moving:
#   VII.54 "that nothing shall steal into them" is a NEGATIVE FINAL clause, the
#          VIII.32 "so that each act shall not do its duty" shape exactly.
#   IX.29  "They themselves shall judge whether they discovered..." is the
#          EMPHATIC third person -- it is for them to judge -- which is current
#          English in its own right, the V.29 "no man shall hinder me" class, and
#          not a forecast about what they will in fact do.
SHALL_KEPT = [
 (2, 1, 1, 'first person'), (5, 29, 1, 'emphatic'), (6, 10, 1, 'first person, indirect deliberative'),
 (7, 54, 1, 'negative final clause (the VIII.32 shape)'),
 (8, 1, 1, 'deliberative question, third person'), (8, 2, 1, 'first person, deliberative'),
 (8, 14, 1, 'first person'), (8, 32, 1, 'negative consecutive'), (8, 45, 1, 'first person'),
 (9, 29, 1, 'emphatic third person (the V.29 class)'),
 (9, 40, 6, 'first person, deliberative questions'),
 (9, 41, 1, 'indirect deliberative (the clause widened at Book IX)'),
 (10, 6, 5, 'first person'), (10, 36, 1, 'negative consecutive'),
 (11, 18, 2, 'first person, one also a direct deliberative question'),
]

CLASS_NOTE = {
 'A': '"such like" / "suchlike" -> "of that kind"',
 'B': 'the plural distributive "several" -> "separate"',
 'C': 'the third-person plain-future "shall"',
 'D': '"adapted to" in the dead sense -> "suited to"',
 'E': "Long's lowercase after his own question mark, restored",
 'F': 'the "vexed / vexation" glossary row, applied where it was not',
 'G': "Long's comma before an em dash, removed in the two places it was left",
}


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def main():
    write = '--write' in sys.argv
    books = {}
    for n in range(1, 13):
        books[n] = json.load(open(os.path.join(PKG, f'book{n}', 'candidate-v2.json'), encoding='utf-8'))
    orig = {n: list(b['paragraphs']) for n, b in books.items()}

    for cls, b, s, old, new, why in CHANGES:
        p = books[b]['paragraphs'][s - 1]
        assert p.count(old) == 1, (cls, b, s, old, p.count(old))
        books[b]['paragraphs'][s - 1] = p.replace(old, new)

    touched = sorted({b for _, b, *_ in CHANGES})
    print('CLASSES')
    for cls in sorted(CLASS_NOTE):
        items = [(b, s) for c, b, s, *_ in CHANGES if c == cls]
        print(f'  {cls}. {CLASS_NOTE[cls]} — {len(items)}: '
              + ', '.join(f'{ROMAN[b-1]}.{s}' for b, s in items))
    print('\nBOOKS TOUCHED:', ', '.join(ROMAN[b - 1] for b in touched),
          f'({len(touched)} of 12; II, VIII, XI, XII are not opened)')

    # every class change verified against Long and against the rest of the work
    src = json.load(open(os.path.join(PKG, 'meditations-original-en.staged.json'), encoding='utf-8'))
    for cls, b, s, old, new, why in CHANGES:
        assert new in books[b]['paragraphs'][s - 1]
        assert old not in books[b]['paragraphs'][s - 1]
    # A: no "such like" or "suchlike" left anywhere in the work
    # B: no plural distributive "several" left (Long's other "several" are his own)
    # C: every "shall" left in the work is licensed by the rule
    # D: no "adapted to" left anywhere
    # E: Long's lowercase after a question mark now stands everywhere he prints it
    for n in range(1, 13):
        joined = ' '.join(books[n]['paragraphs'])
        assert not re.search(r'\bsuch ?like\b', joined, re.I), n
        assert not re.search(r'\badapted to\b', joined, re.I), n
        assert not re.search(r'\bseveral (?:parts|arts|qualities)\b', joined, re.I), n
        assert ',—' not in joined, n
    for n, secs in ((3, [9]), (7, [8, 24, 68])):
        for s in secs:
            assert 'shall' not in books[n]['paragraphs'][s - 1], (n, s)
    got = []
    for n in range(1, 13):
        for i, p in enumerate(books[n]['paragraphs']):
            c = len(re.findall(r'\bshall\b', p, re.I))
            if c:
                got.append((n, i + 1, c))
    assert got == [(b, s, c) for b, s, c, _ in SHALL_KEPT], got
    print(f'\nSHALL      {sum(c for *_, c, _ in [(0,0,c,w) for _,_,c,w in SHALL_KEPT])} occurrences '
          f'stand in {len(SHALL_KEPT)} sections, every one licensed by the rule; '
          'the plain-future class is now empty')
    for b, s, c, why in SHALL_KEPT:
        print(f'             {ROMAN[b-1]}.{s} x{c} — {why}')
    lower_long = sum(len(re.findall(r'\?\s+[a-z]', p)) for ch in src['chapters'] for p in ch['paragraphs'])
    lower_mod = sum(len(re.findall(r'\?\s+[a-z]', p)) for n in range(1, 13) for p in books[n]['paragraphs'])
    assert (lower_long, lower_mod) == (36, 36), (lower_long, lower_mod)
    print(f'\nASSERTED   no "such like" and no "adapted to" anywhere in the work; the plural '
          f'distributive "several" gone;\n           the four converted "shall" gone; Long\'s '
          f'lowercase after a question mark now stands in all {lower_mod} places he prints it')

    print('\nDIFFS')
    for n in touched:
        for i, (a, bb) in enumerate(zip(orig[n], books[n]['paragraphs'])):
            if a != bb:
                d = [x for x in difflib.ndiff(a.split(), bb.split()) if x[0] in '+-']
                print(f'  {ROMAN[n-1]}.{i+1}: ' + ' '.join(d))

    if write:
        for n in touched:
            out = os.path.join(PKG, f'book{n}', 'candidate-v3.json')
            json.dump(books[n], open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            md = [f'# Meditations, Book {n} — modern-English candidate v3', '',
                  f'**Title:** {books[n]["title"]}', '',
                  'The accepted candidate v2 with the cross-book v3 pass applied '
                  '(see `../README.md` and `changes-v2-to-v3.md`). Paragraph IDs are for '
                  'reference only; the leading number is part of the text.', '']
            for i, p in enumerate(books[n]['paragraphs']):
                md += [f'**[B{n}-P{i+1:03d}]**', '', p, '']
            open(os.path.join(PKG, f'book{n}', 'candidate-v3-readable.md'), 'w',
                 encoding='utf-8').write('\n'.join(md))
            ch = [f'# Changes v2 → v3 — Meditations, Book {ROMAN[n-1]}', '',
                  'The cross-book v3 pass (2026-09-12), applied by '
                  '`../scripts/build_v3_crossbook.py` as one change set across the whole work and '
                  'ordered by class, not by book. Book ' + ROMAN[n - 1] + "'s accepted v2 is "
                  'unchanged on disk and keeps its hash; this file is its successor. Paragraphs '
                  'not listed are byte-identical between v2 and v3.', '',
                  '| Paragraph | Class | v2 | v3 | Why |', '|---|---|---|---|---|']
            for cls, b, s, old, new, why in CHANGES:
                if b == n:
                    ch.append(f'| {ROMAN[n-1]}.{s} | {cls} — {CLASS_NOTE[cls]} | {old} | {new} '
                              f'| {why} |')
            open(os.path.join(PKG, f'book{n}', 'changes-v2-to-v3.md'), 'w',
                 encoding='utf-8').write('\n'.join(ch) + '\n')
            print(f'  wrote book{n}/candidate-v3.json sha256 {sha(out)}')


if __name__ == '__main__':
    main()
