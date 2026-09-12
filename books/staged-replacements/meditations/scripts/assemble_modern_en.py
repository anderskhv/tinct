#!/usr/bin/env python3
"""Assemble the twelve accepted candidates into one modern-en file, and assert
the whole-work invariants that no per-book acceptance can assert.

Written for the cross-book pass (2026-09-12), after Book XII was accepted. It is
deliberately the FIRST thing the pass does, while nothing has been edited, so
that its output is a description of a fixed state and can serve as the worklist
for everything after. Run it again after the v3 pass; it must still pass.

  python3 scripts/assemble_modern_en.py            # assert and report
  python3 scripts/assemble_modern_en.py --write    # also write the assembled file

Asserts, over all 487 paragraphs at once:

1. Structure: twelve chapters numbered 1-12 and titled "Book N"; 487 paragraphs
   in the profile 17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, 36; every paragraph
   n of chapter c opening "n. " with the same n as its source paragraph;
   index-for-index alignment with meditations-original-en.staged.json.
2. Negative invariants over the whole work: no square bracket, no "(vi. 28)"
   cross-reference, no source or verse citation, no dagger, no [Greek:/(Greek:
   outside the three sanctioned places, no thou-form or archaic inflection, no
   [Illustration, no footnote-body string.
3. The apparatus arithmetic for the whole work, RE-DERIVED from an enumerated
   list of every bracket in the staged original rather than from twelve
   separately-asserted numerals: each bracket is classified fold / drop by
   whether its inner words survive in the candidate paragraph, and the totals are
   reconciled against the counts each book's provenance.json records.
"""
import json, os, re, sys, hashlib, collections

HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.join(HERE, '..')
PROFILE = [17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, 36]
STAGED_SHA = '7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830'
OUT = os.path.join(PKG, 'meditations-modern-en.staged.json')

ARCHAIC = (r'\b(thou|thy|thee|thyself|shalt|hast|hath|doth|dost|doest|wilt|wast|wert|hadst|'
           r'shouldst|wouldst|couldst|thine|seest|usest|sayest|mayest|mayst|'
           r'worshippest|creepest|despairest)\b')
# "Perchance" is NOT in that list, and the exclusion is a ruling, not an oversight:
# it stands at exactly two places in the work, IX.3 and XI.34, both inside quoted
# utterances whose FORM is the point (Book XI acceptance, finding 34.1 - the test
# is whether the word is inside a quoted utterance whose form is itself the point,
# not who is speaking). Long's plain "perchance" is modernised everywhere else,
# e.g. XI.16 "perhaps". Asserted positively below rather than left to a regex.
PERCHANCE = [(9, 3), (11, 34)]
XREF = r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. '
# The only Greek Long prints in his own body text, kept under the glossary's
# in-text-Greek exception (VII.13 x2, VII.17; VIII.57's two spans are apparatus).
GREEK_OK = {(7, 13), (7, 17)}


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def load():
    staged = json.load(open(os.path.join(PKG, 'meditations-original-en.staged.json'), encoding='utf-8'))
    books = [json.load(open(os.path.join(PKG, f'book{n}', 'candidate-v2.json'), encoding='utf-8'))
             for n in range(1, 13)]
    return staged, books


def structure(staged, books):
    assert sha(os.path.join(PKG, 'meditations-original-en.staged.json')) == STAGED_SHA
    assert [len(c['paragraphs']) for c in staged['chapters']] == PROFILE
    assert [c['number'] for c in staged['chapters']] == list(range(1, 13))
    assert [b['number'] for b in books] == list(range(1, 13))
    assert [b['title'] for b in books] == [c['title'] for c in staged['chapters']] == \
        [f'Book {n}' for n in range(1, 13)]
    assert [len(b['paragraphs']) for b in books] == PROFILE
    assert sum(len(b['paragraphs']) for b in books) == 487 == sum(PROFILE)
    for b, c in zip(books, staged['chapters']):
        for i, (s_, m_) in enumerate(zip(c['paragraphs'], b['paragraphs'])):
            assert s_.startswith(f'{i+1}. '), (b['number'], i + 1, 'source numbering')
            assert m_.startswith(f'{i+1}. '), (b['number'], i + 1, 'candidate numbering')
    return {'chapters': [{'number': b['number'], 'title': b['title'],
                          'paragraphs': b['paragraphs']} for b in books]}


def negatives(modern):
    bad = collections.defaultdict(list)
    for ch in modern['chapters']:
        for i, p in enumerate(ch['paragraphs']):
            where = (ch['number'], i + 1)
            if '[' in p or ']' in p:
                bad['bracket'].append(where)
            if re.search(XREF, p):
                bad['cross-reference'].append(where)
            if re.search(r'\bHESIOD\b|\bOdyssey\b, [ivx]+|Epictetus, [ivx]+|_', p):
                bad['citation'].append(where)
            if '+' in p:
                bad['dagger'].append(where)
            if ('(Greek:' in p or '[Greek:' in p) and where not in GREEK_OK:
                bad['greek'].append(where)
            if re.search(ARCHAIC, p):
                bad['archaic'].append((where, re.findall(ARCHAIC, p)))
            if '[Illustration' in p:
                bad['illustration'].append(where)
            for s_ in ('Acharnenses', 'From the Apologia', 'The interpreters translate',
                       'There is something wrong here', 'Gataker', 'Saumaise',
                       'Sophocles, Oedipus Rex', 'Sphairos'):
                if s_ in p:
                    bad['footnote-body'].append((where, s_))
    return dict(bad)


SUB = [('thyself', 'yourself'), ('thou art', 'you are'), ('thou', 'you'), ('thy', 'your'),
       ('thee', 'you'), ('hast', 'have'), ('shalt', 'will'), ('wilt', 'will'), ('dost', 'do')]


def norm(s):
    s = s.lower()
    for a, b in SUB:
        s = re.sub(r'\b%s\b' % a, b, s)
    return ' '.join(re.sub(r'[^a-z0-9 ]', ' ', s).split())


# --- the apparatus arithmetic for the WHOLE WORK, re-derived --------------
#
# Each bracket in the staged original is screened mechanically: its inner text,
# with Long's thou-forms normalised, either survives in the candidate paragraph
# or it does not. The screen is a signal, not the classification -- it cannot see
# a supplement folded with its wording changed ("[the wrong-doer]" -> "the
# wrongdoer"), and it counts a dropped bracket as surviving when its word happens
# to occur elsewhere in the same paragraph ("[life]" at XII.3). Every such
# disagreement is enumerated below with its reason and the book record that
# settles it, so the screen and the record are reconciled bracket by bracket
# rather than either being taken on trust.
#
# (book, section, inner text) -> (true class, why the screen disagrees)
SCREEN_EXCEPTIONS = {
 (3, 4, 'deity'): ('kept', 'folded into the glossary rendering "the god within", so the '
                           'bracket\'s own word does not survive (book3/continuity.md)'),
 (3, 6, 'to the better things'): ('kept', 'folded as "fit in with the better things"'),
 (3, 8, 'from other things'): ('kept', 'folded with its preposition reworded'),
 (4, 3, 'fortuitous concurrence of things'): ('kept', 'folded as Long\'s gloss on "atoms", '
                                                      '"a chance concurrence of things"'),
 (5, 8, 'necessity, destiny'): ('kept', 'folded as an apposition to "It"'),
 (5, 8, 'destiny'): ('dropped', 'D11 alternative label; the word occurs elsewhere in V.8'),
 (5, 8, 'the universe'): ('dropped', 'D11 alternative label for "Zeus"; the phrase occurs '
                                     'elsewhere in V.8'),
 (6, 6, 'the wrong-doer'): ('kept', 'folded as "the wrongdoer", one word for Long\'s hyphen'),
 (6, 31, 'the things about thee'): ('kept', 'folded as "these things about you"'),
 (6, 31, 'the dreams'): ('kept', 'folded as "those dreams"'),
 (7, 72, 'social'): ('dropped', 'D11 second rendering of "political"; the word occurs '
                                'elsewhere in VII.72'),
 (8, 17, 'that which is the cause'): ('kept', 'folded as a referent, the object of "correct"'),
 (11, 18, 'If any have offended against thee, consider first'): (
     'kept', 'folded as "If anyone has offended against you, consider first:"'),
 (12, 3, 'life'): ('dropped', 'D11 second rendering of "a little breath", twice; the word '
                              'occurs elsewhere in XII.3'),
}

# What each book's own record says: (brackets, whose words stand, dropped).
# Books I-V were drafted before the enumerate-the-list discipline was introduced
# (Book X, finding C1), so their triples are derived here from the enumerated
# bracket lists in their continuity sheets rather than from a recorded numeral --
# which is one of the things this pass owed the package.
RECORD = {1: (4, 4, 0), 2: (3, 3, 0), 3: (6, 5, 1), 4: (14, 12, 2), 5: (13, 7, 6),
          6: (13, 8, 5), 7: (15, 9, 6), 8: (22, 12, 10), 9: (4, 4, 0), 10: (18, 14, 4),
          11: (11, 6, 5), 12: (12, 5, 7)}


def bracket_arithmetic(staged, modern):
    rows, mismatches = [], []
    for ch, mch in zip(staged['chapters'], modern['chapters']):
        for i, (s_, m_) in enumerate(zip(ch['paragraphs'], mch['paragraphs'])):
            for inner in re.findall(r'\[([^\]]*)\]', s_):
                screen = 'kept' if norm(inner) in norm(m_) else 'dropped'
                key = (ch['number'], i + 1, inner)
                if key in SCREEN_EXCEPTIONS:
                    true, why = SCREEN_EXCEPTIONS[key]
                    assert true != screen, ('stale exception', key)
                    mismatches.append((key, screen, true, why))
                else:
                    true = screen
                rows.append((ch['number'], i + 1, inner, true))
    return rows, mismatches
def main():
    staged, books = load()
    modern = structure(staged, books)
    print('STRUCTURE  12 chapters, 487 paragraphs, profile', PROFILE, '- OK')
    print('ALIGNMENT  every paragraph numbered n. and index-aligned 1:1 to the staged original - OK')

    got = [(ch['number'], i + 1) for ch in modern['chapters']
           for i, p in enumerate(ch['paragraphs']) if 'perchance' in p.lower()]
    assert got == PERCHANCE, got

    bad = negatives(modern)
    if bad:
        for k, v in bad.items():
            print('NEGATIVE INVARIANT FAILED:', k, v[:10])
        sys.exit(1)
    print('NEGATIVES  no bracket, cross-reference, citation, dagger, stray Greek, archaic form,')
    print('           illustration caption or footnote-body string in 487 paragraphs - OK')
    print('           ("perchance" at IX.3 and XI.34 only, both ruled keeps - OK)')

    rows, mismatches = bracket_arithmetic(staged, modern)
    brackets = sum(p.count('[') for ch in staged['chapters'] for p in ch['paragraphs'])
    assert len(rows) == brackets == 135, (len(rows), brackets)
    per = collections.defaultdict(collections.Counter)
    for b, s_, inner, kind in rows:
        per[b][kind] += 1
    for b in range(1, 13):
        tot, kept, dropped = RECORD[b]
        got = (per[b]['kept'] + per[b]['dropped'], per[b]['kept'], per[b]['dropped'])
        assert got == (tot, kept, dropped), (b, got, RECORD[b])
    kept = sum(per[b]['kept'] for b in per)
    dropped = sum(per[b]['dropped'] for b in per)
    assert kept + dropped == brackets
    # The whole-work statement, from the rows rather than from twelve numerals:
    # 86 supplements folded + 1 bracketed fragment of Marcus kept verbatim (V.28)
    # + 2 textual-doubt marks whose words stand (XI.26, XII.17) = 89 whose words
    # stand; 45 D11 alternative renderings or construals + 1 D13 translator's
    # note (X.23, its only instance in the work) = 46 dropped.
    assert (kept, dropped) == (89, 46), (kept, dropped)
    assert ('Neither tragic actor nor whore.' in modern['chapters'][4]['paragraphs'][27])   # V.28
    assert ('In the writings of the Ephesians' in modern['chapters'][10]['paragraphs'][25])  # XI.26
    assert ('For let your efforts be' in modern['chapters'][11]['paragraphs'][16])           # XII.17
    assert not any('three last words are omitted' in p                                       # X.23
                   for ch in modern['chapters'] for p in ch['paragraphs'])
    print(f'BRACKETS   {brackets} in Long: {kept} whose words stand '
          '(86 supplements folded + V.28\'s bracketed fragment + the two textual-doubt marks '
          'XI.26 and XII.17)')
    print(f'           and {dropped} dropped (45 under D11 + 1 under D13, X.23, its only '
          'instance in the work) - reconciled book by book against each book\'s record')
    print(f'           screen vs record: {len(mismatches)} brackets where the mechanical '
          'survival screen disagrees, each enumerated with its reason')
    for (b, s_, inner), screen, true, why in mismatches:
        print(f'             {b}.{s_} [{inner}] screen={screen} record={true} - {why}')

    sw = sum(len(p.split()) for ch in staged['chapters'] for p in ch['paragraphs'])
    cw = sum(len(p.split()) for ch in modern['chapters'] for p in ch['paragraphs'])
    print(f'WORDS      Long {sw}, modern {cw}, ratio {cw/sw:.4f}')
    ident = [(ch['number'], i + 1) for ch, mch in zip(staged['chapters'], modern['chapters'])
             for i, (s_, m_) in enumerate(zip(ch['paragraphs'], mch['paragraphs'])) if s_ == m_]
    print(f'IDENTICAL  {len(ident)} paragraphs byte-identical to Long')

    if '--write' in sys.argv:
        json.dump(modern, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('WROTE     ', os.path.relpath(OUT, PKG), 'sha256', sha(OUT))
    else:
        print('ASSEMBLED  (not written; pass --write)',
              'sha256', hashlib.sha256(json.dumps(modern, ensure_ascii=False, indent=1)
                                       .encode('utf-8')).hexdigest())
    return rows


if __name__ == '__main__':
    main()
