#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book II.

Reads book2/candidate-v1.json (frozen), applies the substitutions in CHANGES
(each must match exactly once in its paragraph), writes candidate-v2.json,
candidate-v2-readable.md and changes-v1-to-v2.md, and prints a per-paragraph
word diff so every changed passage can be verified against source-book2.json.
"""
import json, os, hashlib, difflib

HERE = os.path.dirname(os.path.abspath(__file__))
B2 = os.path.join(HERE, '..', 'book2')

# (paragraph number, finding id, old text, new text)
CHANGES = [
 (1, '1.3', 'and the nature of the wrongdoer himself, that he is akin to me',
            'and the nature of the wrongdoer, that he is akin to me'),
 (1, '1.2', 'but sharing the same intelligence and the same portion of the divine',
            'but partaking in the same intelligence and the same share of the divine'),
 (1, '1.1', 'We were made for cooperation,', 'For we are made for cooperation,'),
 (1, '1.3', 'and to resent someone and turn away from him is acting against one another.',
            'and to be resentful and to turn away is acting against one another.'),
 (2, '2 (optional)', 'as if you were dying right now,', 'as if you were dying now,'),
 (2, '2.1', 'air, and never the same air, but every moment breathed out and sucked in again.',
            'air, and not always the same, but every moment breathed out and sucked in again.'),
 (2, '2.2 + 2.3', 'No longer let this part be a slave; no longer let it be pulled by strings, like a puppet, toward unsocial impulses; no longer let it either resent your present lot or shrink from the future.',
            'No longer let this part be a slave; no longer be pulled by strings, like a puppet, toward unsocial impulses; no longer be either discontented with your present lot or shrink from the future.'),
 (3, '3.1', 'Whatever the nature of the whole brings,', 'But whatever the nature of the whole brings,'),
 (3, '3 (optional)', 'let them always be your fixed opinions.', 'let them always be fixed opinions.'),
 (5, '5.1', 'with complete and simple dignity,', 'with perfect and simple dignity,'),
 (5, '5.2', 'which, if a man lays hold of them, let him live a life that flows in quiet',
            'which, if a man lays hold of them, he can live a life that flows in quiet'),
 (6, '6.1', 'but you will not have the chance to honor yourself much longer.',
            'but you will no longer have the chance to honor yourself.'),
 (7, '7.1', 'for they too are triflers who have worn themselves out in life with activity,',
            'for those too are triflers who have worn themselves out in life with activity,'),
 (10, '10.1', 'with a certain pain and an involuntary contraction;',
              'with a certain pain and an unconscious contraction;'),
 (10, '10.2', 'seems somehow more intemperate and more womanish in his offenses.',
              'seems in a way more intemperate and more womanish in his offenses.'),
 (10, '10.3', 'carried toward the act by desire.', 'carried toward doing something by desire.'),
 (12, '12 (optional) + 12.1', 'What the nature is of all the things the senses perceive, especially those that lure with the bait of pleasure or terrify with pain, or are trumpeted about by empty fame; how worthless, contemptible, sordid, perishable and dead they are—all this it is the task of the intellectual faculty to observe.',
              'The nature of all the things the senses perceive, especially those that lure with the bait of pleasure or terrify with pain, or are trumpeted about by vaporous fame; how worthless, contemptible, sordid, perishable and dead they are—all this it is the task of the intellectual faculty to observe.'),
 (12, '12.3', 'And death is not only an operation of nature, but a thing that serves nature\'s purposes.',
              'This, however, is not only an operation of nature, but also a thing that serves nature\'s purposes.'),
 (12, '12.2', 'and through what part of himself, and how that part of him is disposed when it does.',
              'and through what part of himself, and when that part of him is so disposed.'),
 (14, '14.2', 'three thousand years, or ten thousand times as many,', 'three thousand years, and ten thousand times as many,'),
 (14, '14.1', 'and so what is lost turns out to be a mere moment.', 'and so what is lost appears to be a mere moment.'),
 (15, '15.1', 'What the Cynic Monimus said is plain enough, and so is the use of it,',
              'For what the Cynic Monimus said is plain, and so is the use of it,'),
 (16, '16.1', 'is to separate yourself from nature,', 'is to separate ourselves from nature,'),
 (16, '16 (optional)', 'or even moves against him meaning to injure him,', 'or even moves toward him meaning to injure him,'),
 (16, '16.2', 'without considering what it is doing;', 'without considering what it is;'),
 (17, '17.2', 'the whole composition of the body liable to rot,', 'the composition of the whole body liable to rot,'),
 (17, '17.3', "life is a war and a stranger's stay,", "life is a war and a stranger's sojourn,"),
 (2, 'flow read (step 7)', 'no longer be either discontented with your present lot or shrink from the future.',
            'no longer either be discontented with your present lot or shrink from the future.'),
 (14, 'flow read (step 7), per chapter-level finding 1', 'A man cannot lose the past or the future:', 'For a man cannot lose the past or the future:'),
 (17, '17.1', 'It is according to nature, and nothing that is according to nature is evil.',
              'For it is according to nature, and nothing that is according to nature is evil.'),
]

def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()

def main():
    v1 = json.load(open(os.path.join(B2, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B2, 'source-book2.json'), encoding='utf-8'))
    paras = list(v1['paragraphs'])
    log = []
    for n, fid, old, new in CHANGES:
        i = n - 1
        assert paras[i].count(old) == 1, (n, fid, old)
        paras[i] = paras[i].replace(old, new)
        log.append((n, fid, old, new))
    v2 = {'number': v1['number'], 'title': v1['title'], 'paragraphs': paras}
    assert len(paras) == 17 and all(p.startswith(f'{i+1}. ') for i, p in enumerate(paras))
    json.dump(v2, open(os.path.join(B2, 'candidate-v2.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 2 — modern-English candidate v2', '', f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see `changes-v1-to-v2.md`). Paragraph IDs `B02-Pxxx` are for reference only; the leading number is part of the text.', '']
    for i, p in enumerate(paras): lines += [f'**[B02-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B2, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    ch = ['# Changes v1 → v2 — Meditations, Book II', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, with the round-1 finding it answers (`review/findings-v1.md`). Applied mechanically by `scripts/build_book2_v2.py`; each "old" string matched exactly once in its paragraph. Paragraphs not listed are byte-identical between v1 and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B02-P{n:03d} (II.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of 17 ({", ".join("II."+str(n) for n in changed)}). Unchanged: ' +
           ', '.join('II.' + str(n) for n in range(1, 18) if n not in changed) + '.', '',
           '**Findings not applied:** none. All five substantive findings (2.1, 6.1, 12.1, 12.2, 14.1) and all twenty minor findings were applied, plus the four "also noted, optional" points (II.2 "right now" → "now"; II.3 "your fixed opinions" → "fixed opinions"; II.12 word order of the first clause; II.16 "moves against him" → "moves toward him"), plus two changes from the drafter\'s flow read (step 7): II.2 verb order "either be discontented … or shrink" so the two verbs are parallel, and II.14 "For a man cannot lose…", restoring the inference the review\'s chapter-level finding 1 describes. Two `continuity.md` entries are superseded and updated there: II.1 (glossary rendering "share of the divine" now followed) and II.16 (Long\'s "ourselves" now kept).', '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B2, "candidate-v1.json"))}`; candidate-v2.json `{sha(os.path.join(B2, "candidate-v2.json"))}`.']
    open(os.path.join(B2, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n-1].split(); b = paras[n-1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'II.{n}: ' + ' '.join(d))
    print('v2 sha256', sha(os.path.join(B2, 'candidate-v2.json')))
    sw = sum(len(p.split()) for p in src['paragraphs']); cw = sum(len(p.split()) for p in paras)
    print('words source', sw, 'v2', cw, 'ratio %.3f' % (cw/sw))

if __name__ == '__main__':
    main()
