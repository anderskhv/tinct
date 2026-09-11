#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book III.

Reads book3/candidate-v1.json (frozen), applies the substitutions in CHANGES
(each must match exactly once in its paragraph), writes candidate-v2.json,
candidate-v2-readable.md and changes-v1-to-v2.md, and prints a per-paragraph
word diff so every changed passage can be verified against source-book3.json.
Same pattern as scripts/build_book2_v2.py and scripts/build_book1_v2.py.
"""
import json, os, hashlib, difflib

HERE = os.path.dirname(os.path.abspath(__file__))
B3 = os.path.join(HERE, '..', 'book3')

# (paragraph number, finding id, old text, new text)
CHANGES = [
 (2, '2.1', 'are beautiful in a way, and in a peculiar way excite a desire to eat',
            'are in a way beautiful, and in a peculiar way excite a desire to eat'),
 (4, '4.1', '; and that a man should hold to the opinion not of all, but only of those who confessedly live according to nature.',
            '; and a man should hold to the opinion not of all, but only of those who confessedly live according to nature.'),
 (4, '4.2', 'What is in your thoughts now?, you could at once answer', 'What is in your thoughts now? you could at once answer'),
 (5, '5.1', 'nor let studied ornament dress up your thoughts', 'nor let studied ornament set off your thoughts'),
 (5, '5 (also noted)', 'manly and of ripe age, engaged in political matters, and a Roman, and a ruler',
                       'manly and of ripe age, and engaged in political matters, and a Roman, and a ruler'),
 (6, '6.1', "your own mind's contentment with itself in the things it enables you to do",
            "your own mind's satisfaction with itself in the things it enables you to do"),
 (6, '6.2', 'But do you, I say, simply and freely choose the better, and hold to it.',
            'But you, I say, simply and freely choose the better, and hold to it.'),
 (6, '6.3', 'should come into competition with what is rationally and politically, or practically, good.',
            'should come into competition with what is rationally and politically good.'),
 (6, '6 (also noted)', 'say so, and hold to your judgment without arrogance', 'say so, and maintain your judgment without arrogance'),
 (7, '7.1', 'he cares not at all:', 'he does not care at all:'),
 (8, '8 (also noted)', 'In the mind of one who is disciplined and purified', 'In the mind of one who is chastened and purified'),
 (11, '11.1', 'every object that presents itself to you in life', 'every object that is presented to you in life'),
 (15, '15.1', 'for this is not done by the eyes, but by another kind of vision.',
              'for this is not accomplished by the eyes, but by another kind of vision.'),
 (16, '16.1', 'nor does he turn aside from the road that leads to the end of life',
              'nor does he turn aside from the way that leads to the end of life'),
 (16, '16.2', 'a simple, modest and contented life', 'a simple, modest, and contented life'),
 (16, '16 (also noted)', 'do their impure deeds once they have shut the doors', 'do their impure deeds when they have shut the doors'),
 (11, 'flow read (step 7)', 'But I know; and for this reason I behave toward him', 'But I know; for this reason I behave toward him'),
]

NOT_APPLIED = (
 '**Findings not applied:** none of the twelve numbered findings was declined. All five "worth improving" findings '
 '(4.1, 6.1, 6.2, 7.1, 15.1) and all seven "optional preference" findings (2.1, 4.2, 5.1, 6.3, 11.1, 16.1, 16.2) were '
 'applied. On 6.3 the drafter took the first of the reviewer\'s two clean options and dropped Long\'s "[or, practically]": '
 'it is an alternative rendering of one Greek adverb, not a supplement to the sense, so it belongs with the '
 'cross-references and citations the glossary classes as apparatus; "politically good" stands on its own beside '
 '"political matters" (III.5), "political community" and "member of a community" (III.7), all of which the edition '
 'already asks the reader to take in Marcus\'s sense. Recorded in `continuity.md`. Of the reviewer\'s "also noted, '
 'optional" points, four were applied, each restoring Long\'s own word where it is already modern (the reviewer\'s '
 'chapter-level finding 4): III.5 "and engaged in political matters" (the "and … and … and" chain restored, as in Book I); '
 'III.6 "maintain your judgment" (Long\'s verb; avoids a third "hold to / keep to" in two lines); III.8 "chastened and '
 'purified" (Long\'s word, current English, and it removes an echo of III.1 "a disciplined reason" that Long does not '
 'have); III.16 "when they have shut the doors" (Long\'s plain "when"). Four were left as v1 has them, each with a '
 'reason: III.11 "how long it is the nature of this thing to endure that now makes an impression on me" keeps Long\'s '
 'order, because the reordering ("the nature of this thing that now makes an impression on me to endure") separates '
 '"the nature of this thing" from "to endure" by a nine-word clause and is no clearer; III.1 "his understanding" and '
 'III.13 "your principles" supply a possessive the reviewer called harmless and the obvious reading; III.2 "ears of '
 'corn" is Long\'s word, the reviewer proposed no change, and `continuity.md` already records it. The reviewer\'s '
 'optional note that "and for this reason" (III.11) adds an "and" Long does not have was taken up at the flow read '
 '(last row of the table). Five `continuity.md` entries are superseded and updated there: III.5 ("set off" restored), '
 'III.6 ("satisfaction with itself"; the bracket dropped), III.8 ("chastened"), III.15 ("accomplished") and III.16 '
 '("the way"; "when").'
)

FLOW = (
 '**Flow read (step 7):** `candidate-v2-readable.md` read continuously III.1–III.16 after the first build. One change '
 'made from it, listed last in the table: III.11, where "But I know; and for this reason I behave toward him" carried '
 'an "and" that Long does not have ("But I know; for this reason I behave towards him"); the reviewer had noted it as '
 'harmless, and the read confirmed that Long\'s bare semicolon gives the turn more force. Nothing else changed; see '
 '`ACCEPTANCE.md`.'
)

def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()

def main():
    v1 = json.load(open(os.path.join(B3, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B3, 'source-book3.json'), encoding='utf-8'))
    paras = list(v1['paragraphs'])
    log = []
    for n, fid, old, new in CHANGES:
        i = n - 1
        assert paras[i].count(old) == 1, (n, fid, old)
        paras[i] = paras[i].replace(old, new)
        log.append((n, fid, old, new))
    v2 = {'number': v1['number'], 'title': v1['title'], 'paragraphs': paras}
    assert len(paras) == 16 and all(p.startswith(f'{i+1}. ') for i, p in enumerate(paras))
    for k, s in [(2, 'which is as much inferior as that which serves it is superior'),
                 (3, 'For the lot which is assigned to each man is carried along with him and carries him along with it.'),
                 (10, 'apportionment and spinning of the thread of destiny')]:
        assert s in src['paragraphs'][k] and s in paras[k], k
    json.dump(v2, open(os.path.join(B3, 'candidate-v2.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 3 — modern-English candidate v2', '', f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see `changes-v1-to-v2.md`). Paragraph IDs `B03-Pxxx` are for reference only; the leading number is part of the text.', '']
    for i, p in enumerate(paras): lines += [f'**[B03-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B3, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    ch = ['# Changes v1 → v2 — Meditations, Book III', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, with the round-1 finding it answers (`review/findings-v1.md`). Applied mechanically by `scripts/build_book3_v2.py`; each "old" string matched exactly once in its paragraph. Paragraphs not listed are byte-identical between v1 and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B03-P{n:03d} (III.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of 16 ({", ".join("III."+str(n) for n in changed)}). Unchanged: ' +
           ', '.join('III.' + str(n) for n in range(1, 17) if n not in changed) + '.', '',
           NOT_APPLIED, '', FLOW, '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B3, "candidate-v1.json"))}`; candidate-v2.json `{sha(os.path.join(B3, "candidate-v2.json"))}`.']
    open(os.path.join(B3, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n-1].split(); b = paras[n-1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'III.{n}: ' + ' '.join(d))
    print('v1 sha256', sha(os.path.join(B3, 'candidate-v1.json')))
    print('v2 sha256', sha(os.path.join(B3, 'candidate-v2.json')))
    sw = sum(len(p.split()) for p in src['paragraphs']); cw = sum(len(p.split()) for p in paras)
    print('words source', sw, 'v2', cw, 'ratio %.3f' % (cw/sw))
    print('min paragraph ratio %.2f' % min(len(c.split())/len(s.split()) for s, c in zip(src['paragraphs'], paras)))

if __name__ == '__main__':
    main()
