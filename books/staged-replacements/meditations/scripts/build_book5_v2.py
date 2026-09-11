#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book V.

Reads book5/candidate-v1.json (frozen), applies the substitutions in CHANGES
(each must match exactly once in its paragraph), writes candidate-v2.json,
candidate-v2-readable.md and changes-v1-to-v2.md, and prints a per-paragraph
word diff so every changed passage can be verified against source-book5.json.
Same pattern as scripts/build_book4_v2.py.
"""
import json, os, hashlib, difflib

HERE = os.path.dirname(os.path.abspath(__file__))
B5 = os.path.join(HERE, '..', 'book5')

# (paragraph number, finding id, old text, new text)
CHANGES = [
 (1, '1.1', 'or the lover of money values his money, or the vain man his little glory',
            'or the lover of money values his money, or the vainglorious man his little glory'),
 (10, '10.1', 'Things are so wrapped up that they have seemed to philosophers',
              'Things are so enveloped that they have seemed to philosophers'),
 (26, '26.1', 'but let the ruling part not of itself add to the sensation the opinion that it is either good or bad',
              'but do not let the ruling part, of itself, add to the sensation the opinion that it is either good or bad'),
 (33, '33.1', 'and either a name or not even a name; but a name is sound and echo',
              'and either a name or not even a name; but name is sound and echo'),
 (36, '36.1', 'I was once a fortunate man, but I lost it, I know not how.',
              'I was once a fortunate man, but I lost it, I do not know how.'),
]

# (0-based index, clause in source, clause in candidate) — the four dagger clauses
DAGGERS = [
 (8, 'fail to obey reason, and thou wilt repose in it', 'fail to obey reason, and you will repose in it'),
 (11, 'anything which should not be in harmony with what is really good', 'anything which should not be in harmony with what is really good'),
 (11, 'Thus even the many perceive the difference.', 'Thus even the many perceive the difference.'),
 (27, 'Neither tragic actor nor whore.', 'Neither tragic actor nor whore.'),
]

NOT_APPLIED = (
 '**Findings not applied:** none. All five numbered findings were applied: the three "worth improving" findings (1.1, '
 '26.1, 36.1) and both "optional preference" findings (10.1, 33.1). Each restores Long\'s own word or takes the '
 'reviewer\'s first proposal. On 1.1 "vainglorious" is Long\'s "vain-glorious" spelled solid, restoring the fourth of '
 'his four cognate pairs (turner / turning art, dancer / dancing art, lover of money / money, vainglorious man / glory); '
 'the `continuity.md` line that had preferred "vain man" on the precedent of Book I\'s "vanity" (I.16) is superseded, '
 'since I.16 has no paired object and Book V has only this occurrence. On 10.1 "enveloped" is Long\'s own root '
 '("envelopment"), current, and without the competing idiom of "so wrapped up" (absorbed, engrossed) that the reviewer '
 'heard; the drafter\'s v1 reason ("the plain verb keeps the image") did not weigh that idiom, so the finding is applied '
 'under the D8 pattern. On 26.1 the reviewer\'s first proposal is taken: "do not let" is the modern form of Long\'s '
 '"let not", and the commas keep "of itself" as the aside it is, so the prohibition (the ruling part must not add the '
 'opinion) is read at first sight instead of "not of itself" being taken as a unit. On 33.1 Long\'s bare "name" is '
 'restored: the sentence moves from the countable "a name … not even a name" to name as such, and it is the abstraction '
 'he calls "sound and echo"; "a name" had made the countable noun a third time. On 36.1 "I do not know how" is the '
 'edition\'s own standard applied to the one "not"-after-verb form left in the book; the set phrase was not judged worth '
 'an exception. Of the reviewer\'s "also noted" points (not numbered findings), none was changed: V.1 "hurry" for "make '
 'haste" (the reviewer proposed no change); V.8 "as we receive those that Aesculapius prescribes" (the reviewer endorsed '
 'the recorded interpretive decision; the alternative "as well as we receive" was offered only for a drafter who wants '
 'to keep the ambiguity, and the sentences before and after make the comparison the point); V.19\'s last clause, kept in '
 'Long\'s construction (the reviewer proposed no change); V.28 "I wish you well of your discovery" (Long\'s idiom, left; '
 'no change within Long\'s words was proposed). Six `continuity.md` entries are updated: V.1 ("vainglorious", and the '
 '"rather than to perfect" note corrected per the reviewer\'s ruling — the sentence reads as "prefer neither X nor Y to '
 'Z" and is not defective), V.10 ("enveloped"), V.26 ("do not let … , of itself,"), V.33 ("name" restored), V.36 ("I do '
 'not know how"), and the unresolved-source-issues line on V.1.'
)

FLOW = (
 '**Flow read (step 7):** `candidate-v2-readable.md` read continuously V.1–V.36 after the build. No change was made '
 'from it. The five corrected clauses read without a snag in place: V.1\'s four pairs now close on the vainglorious man '
 'and his little glory; V.10 opens on "so enveloped" with nothing to mis-hear; V.26\'s last clause is a plain '
 'prohibition; V.33 moves from "a name" to bare "name" as Long does; V.36\'s complaint is in an ordinary man\'s current '
 'English. Terminology was checked across the accepted books at the read: "the ruling part" (V.3, V.11, V.26), "the god '
 'within" (V.10, V.27), "the nature of the whole" (V.8, V.10, as II.9 and IV.36 v2), "rational being" (V.16, V.34), '
 '"social being" (V.6, V.29), "the common good" (V.35), "discontented" (V.1, V.8, V.9), "calm" (V.2, V.33), "in a way" '
 '(V.6, V.8), "feelings" (V.20, V.26) beside Long\'s own "emotions" (V.36), "impulse" (V.3) beside "the movements in the '
 'flesh" (V.26), "vex" (V.23, as IV.44 v2), "resent" (V.10) — all as the glossary and the earlier acceptances have them. '
 'Long\'s own redundancy "return back again" (V.9) and his "get away out of life" (V.29) stand, as they are his. '
 'Nothing else changed; see `ACCEPTANCE.md`.'
)

def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()

def main():
    v1 = json.load(open(os.path.join(B5, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B5, 'source-book5.json'), encoding='utf-8'))
    paras = list(v1['paragraphs'])
    log = []
    for n, fid, old, new in CHANGES:
        i = n - 1
        assert paras[i].count(old) == 1, (n, fid, old)
        paras[i] = paras[i].replace(old, new)
        log.append((n, fid, old, new))
    v2 = {'number': v1['number'], 'title': v1['title'], 'paragraphs': paras}
    assert len(paras) == 36 and all(p.startswith(f'{i+1}. ') for i, p in enumerate(paras))
    for k, s, c in DAGGERS:
        assert s in src['paragraphs'][k] and c in paras[k], (k, s)
    assert 'gone out,...' in src['paragraphs'][28] and 'gone out,...' in paras[28]
    json.dump(v2, open(os.path.join(B5, 'candidate-v2.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 5 — modern-English candidate v2', '', f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see `changes-v1-to-v2.md`). Paragraph IDs `B05-Pxxx` are for reference only; the leading number is part of the text.', '']
    for i, p in enumerate(paras): lines += [f'**[B05-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B5, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    ch = ['# Changes v1 → v2 — Meditations, Book V', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, with the round-1 finding it answers (`review/findings-v1.md`). Applied mechanically by `scripts/build_book5_v2.py`; each "old" string matched exactly once in its paragraph. Paragraphs not listed are byte-identical between v1 and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B05-P{n:03d} (V.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of 36 ({", ".join("V."+str(n) for n in changed)}). Unchanged: ' +
           ', '.join('V.' + str(n) for n in range(1, 37) if n not in changed) + '.', '',
           NOT_APPLIED, '', FLOW, '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B5, "candidate-v1.json"))}`; candidate-v2.json `{sha(os.path.join(B5, "candidate-v2.json"))}`.']
    open(os.path.join(B5, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n-1].split(); b = paras[n-1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'V.{n}: ' + ' '.join(d))
    print('v1 sha256', sha(os.path.join(B5, 'candidate-v1.json')))
    print('v2 sha256', sha(os.path.join(B5, 'candidate-v2.json')))
    sw = sum(len(p.split()) for p in src['paragraphs']); cw = sum(len(p.split()) for p in paras)
    print('words source', sw, 'v2', cw, 'ratio %.3f' % (cw/sw))
    print('min paragraph ratio %.2f' % min(len(c.split())/len(s.split()) for s, c in zip(src['paragraphs'], paras)))

if __name__ == '__main__':
    main()
