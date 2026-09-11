#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book IV.

Reads book4/candidate-v1.json (frozen), applies the substitutions in CHANGES
(each must match exactly once in its paragraph), writes candidate-v2.json,
candidate-v2-readable.md and changes-v1-to-v2.md, and prints a per-paragraph
word diff so every changed passage can be verified against source-book4.json.
Same pattern as scripts/build_book3_v2.py.
"""
import json, os, hashlib, difflib

HERE = os.path.dirname(os.path.abspath(__file__))
B4 = os.path.join(HERE, '..', 'book4')

# (paragraph number, finding id, old text, new text)
CHANGES = [
 (1, '1.1', 'it soon takes over the matter heaped on it, and consumes it',
            'it soon makes its own the matter heaped on it, and consumes it'),
 (3, '3.1', 'which, as soon as you return to them, will be enough to cleanse the soul completely',
            'which, as soon as you turn to them, will be enough to cleanse the soul completely'),
 (4, '4.1', 'a portion given to me from a certain earth', 'a portion given to me from certain earth'),
 (19, '19.1', 'then again those who succeeded them, until the whole remembrance has been extinguished',
              'then again also those who succeeded them, until the whole remembrance has been extinguished'),
 (33, '33.1', 'What, then, is that on which we ought to spend our serious pains?',
              'What, then, is that on which we ought to employ our serious pains?'),
 (40, '40.1', 'the continuous spinning of the thread and the weaving of the web',
              'the continuous spinning of the thread and the weave of the web'),
 (44, '44.1', 'and whatever else delights fools or annoys them',
              'and whatever else delights fools or vexes them'),
 (36, 'flow read (step 7)', 'consider that the nature of the universe loves nothing so much',
                            'consider that the nature of the whole loves nothing so much'),
]

DAGGERS = [
 (17, 'as Agathon says'),
 (18, 'What is praise, except indeed so far as it has a certain utility?'),
 (18, 'clinging to something else....'),
 (29, 'I do not get the means of living out of my learning'),
 (33, 'into whatever things she pleases'),
 (45, 'we ought not to act and speak as if we were asleep, for even in sleep we seem to act and speak'),
 (45, 'like children who learn from their parents, simply to act and speak as we have been taught'),
 (49, 'Do not then consider life a thing of any value.'),
 (50, 'For such a purpose frees a man from trouble, and warfare, and all artifice and ostentatious display.'),
]

NOT_APPLIED = (
 '**Findings not applied:** one of the eight numbered findings was declined, 22.1 (IV.22 "in every impulse"). '
 'Both "worth improving" findings (19.1, 33.1) and five of the six "optional preference" findings (1.1, 3.1, 4.1, 40.1, '
 '44.1) were applied; each restores Long\'s own word or the reviewer\'s proposal. On 1.1 the reviewer\'s phrase "makes '
 '… its own" is used with the object after it ("makes its own the matter heaped on it") rather than before it ("makes '
 'the matter heaped on it its own"), which would have put "on it its own" in a row; the words are the reviewer\'s and the '
 'sense is Long\'s "appropriates to itself". On 4.1 Long\'s own "from certain earth" was preferred to the reviewer\'s '
 'second option "from some earth", which would have made three "some"s in one sentence where Long has two. '
 '**22.1 declined**, for the reason the reviewer allowed ("leave as is, glossary-conformant and recorded"): the glossary '
 'row fixed before drafting renders Long\'s "movement" as "impulse" where the sense is impulse (*hormē*) and keeps '
 '"movement" where he means motion, so IV.22 "in every impulse" and IV.40 "act with one movement" are not one word '
 'rendered two ways but the glossary\'s sense distinction applied, with IV.40 left open by record because that sentence '
 'can be read either way; D10 concerns a dagger-fixed word, which this is not; and Book V meets the same word in the '
 'impulse sense (V.3 "follow their peculiar movement"), where the glossary will again give "impulse", so keeping '
 '"impulse" in IV.22 is the consistent choice across the edition. `continuity.md` records the decision as the reviewer '
 'asked. Of the reviewer\'s "also noted" points (not numbered findings), none was changed: IV.5 "birth" for '
 '"generation" (the plain reading of a sentence about a body composed out of the elements, recorded in `continuity.md`; '
 'no change proposed); IV.12 "what … suggests" for "whatever … may suggest" (the same generic statement in current idiom; '
 'the reviewer noted nothing is lost); IV.21 "their transformations" and IV.29 "the eyes of the understanding" (a '
 'possessive and an article the reviewer called harmless); IV.50 "Do not then" unpunctuated inside the verbatim dagger '
 'sentence (the price of the verbatim rule, as the reviewer says); IV.51 "run by the short way" (the reviewer proposed '
 'no change and called it the more natural modern phrase). Four `continuity.md` entries are superseded and updated '
 'there: IV.1 ("makes its own"), IV.33 ("employ" restored), IV.40 ("the weave"), IV.44 ("vexes" restored, with the '
 'table row corrected), plus IV.3 ("turn to"), IV.4 ("certain earth" restored), IV.19 ("also" restored), IV.22 (the '
 'decision on 22.1) and IV.36 (the flow-read change below).'
)

FLOW = (
 '**Flow read (step 7):** `candidate-v2-readable.md` read continuously IV.1–IV.51 after the first build. One change '
 'made from it, listed last in the table: IV.36 "the nature of the whole loves nothing so much" for v1\'s "the nature '
 'of the universe". The glossary row fixed before Book II renders both of Long\'s variants, "the nature of the whole" '
 'and "the nature of the universe", as "the nature of the whole", and the accepted Book II does so (II.9); v1\'s '
 '`continuity.md` had kept Long\'s phrase in IV.36 on the mistaken ground that it was not a glossary phrase, and the '
 'reviewer\'s chapter-level terminology note repeated that reading. The flow read caught it as a terminology '
 'inconsistency between accepted books; the fix is within the glossary and within Long ("the whole" is his own word in '
 'IV.25 and IV.27). Nothing else changed; see `ACCEPTANCE.md`.'
)

def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()

def main():
    v1 = json.load(open(os.path.join(B4, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B4, 'source-book4.json'), encoding='utf-8'))
    paras = list(v1['paragraphs'])
    log = []
    for n, fid, old, new in CHANGES:
        i = n - 1
        assert paras[i].count(old) == 1, (n, fid, old)
        paras[i] = paras[i].replace(old, new)
        log.append((n, fid, old, new))
    v2 = {'number': v1['number'], 'title': v1['title'], 'paragraphs': paras}
    assert len(paras) == 51 and all(p.startswith(f'{i+1}. ') for i, p in enumerate(paras))
    for k, s in DAGGERS:
        assert s in src['paragraphs'][k] and s in paras[k], (k, s)
    json.dump(v2, open(os.path.join(B4, 'candidate-v2.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 4 — modern-English candidate v2', '', f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see `changes-v1-to-v2.md`). Paragraph IDs `B04-Pxxx` are for reference only; the leading number is part of the text.', '']
    for i, p in enumerate(paras): lines += [f'**[B04-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B4, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    ch = ['# Changes v1 → v2 — Meditations, Book IV', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, with the round-1 finding it answers (`review/findings-v1.md`). Applied mechanically by `scripts/build_book4_v2.py`; each "old" string matched exactly once in its paragraph. Paragraphs not listed are byte-identical between v1 and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B04-P{n:03d} (IV.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of 51 ({", ".join("IV."+str(n) for n in changed)}). Unchanged: ' +
           ', '.join('IV.' + str(n) for n in range(1, 52) if n not in changed) + '.', '',
           NOT_APPLIED, '', FLOW, '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B4, "candidate-v1.json"))}`; candidate-v2.json `{sha(os.path.join(B4, "candidate-v2.json"))}`.']
    open(os.path.join(B4, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n-1].split(); b = paras[n-1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'IV.{n}: ' + ' '.join(d))
    print('v1 sha256', sha(os.path.join(B4, 'candidate-v1.json')))
    print('v2 sha256', sha(os.path.join(B4, 'candidate-v2.json')))
    sw = sum(len(p.split()) for p in src['paragraphs']); cw = sum(len(p.split()) for p in paras)
    print('words source', sw, 'v2', cw, 'ratio %.3f' % (cw/sw))
    print('min paragraph ratio %.2f' % min(len(c.split())/len(s.split()) for s, c in zip(src['paragraphs'], paras)))

if __name__ == '__main__':
    main()
