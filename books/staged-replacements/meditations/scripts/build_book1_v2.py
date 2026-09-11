#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book I.

Reads book1/candidate-v1.json (frozen), applies the substitutions in CHANGES
(each must match exactly once in its paragraph), writes candidate-v2.json,
candidate-v2-readable.md and changes-v1-to-v2.md, and prints a per-paragraph
word diff so every changed passage can be verified against source-book1.json.
Same pattern as scripts/build_book2_v2.py.
"""
import json, os, hashlib, difflib

HERE = os.path.dirname(os.path.abspath(__file__))
B1 = os.path.join(HERE, '..', 'book1')

# (paragraph number, finding id, old text, new text)
CHANGES = [
 (3, '3.1', 'piety and generosity,', 'piety and kindness,'),
 (5, '5.1', 'at the races in the Circus', 'at the games in the Circus'),
 (6, '6.2', 'not to believe what miracle-workers and conjurers say about incantations',
            'not to believe what was said by miracle-workers and conjurers about incantations'),
 (6, '6.1', 'a plank bed and a skin to lie on, and whatever else of that kind',
            'a plank bed and a skin, and whatever else of that kind'),
 (7, '7.1', 'From Rusticus I got the impression that my character needed',
            'From Rusticus I received the impression that my character needed'),
 (7, '3.1', 'or as one who does good deeds for display', 'or as one who does kind acts for display'),
 (7, '7 (optional)', 'to be easily appeased and reconciled as soon as',
                     'to be easily disposed to be pacified and reconciled as soon as'),
 (8, '14.1 (consistency)', 'freedom of will and unwavering steadiness of purpose',
                           'freedom of will and undeviating steadiness of purpose'),
 (9, '9 (optional)', 'the example of a household governed in a fatherly way',
                     'the example of a family governed in a fatherly way'),
 (9, '9.1', 'those who form opinions without thought.', 'those who form opinions without consideration.'),
 (9, '9.2', 'entirely free from passion and at the same time most affectionate',
            'entirely free from passion, and also most affectionate'),
 (11, '11.1', 'what envy, duplicity and hypocrisy are in a tyrant', 'what envy and duplicity and hypocrisy are in a tyrant'),
 (12, '12.1', 'the neglect of the duties we owe to those we live with by pleading urgent business',
              'the neglect of the duties our relation to those we live with requires, by pleading urgent business'),
 (14, '14.1', 'consistency and unwavering steadiness in my regard for philosophy',
              'consistency and undeviating steadiness in my regard for philosophy'),
 (14, '14.2', 'and in him I saw no concealment of his opinions', 'and in him I observed no concealment of his opinions'),
 (14, '14.2', 'what he wished or did not wish, for it was quite plain.', 'what he wished or did not wish, but it was quite plain.'),
 (15, '15.2', 'and he never showed astonishment or surprise, was never in a hurry, never put off doing a thing, was never perplexed or dejected, never laughed to cover his annoyance, and, on the other hand, was never passionate or suspicious.',
              'and he never showed astonishment or surprise, and was never in a hurry, and never put off doing a thing, nor was he perplexed or dejected, nor did he ever laugh to cover his annoyance, nor, on the other hand, was he ever passionate or suspicious.'),
 (15, '15.1', 'he gave the impression of a man who could not be turned from the right',
              'he had the appearance of a man who could not be turned from the right'),
 (16, '14.1 (consistency)', 'and unwavering firmness in giving to every man what he deserved',
                            'and undeviating firmness in giving to every man what he deserved'),
 (16, '16.1', 'or to attend him when he went abroad, and that those who had been kept from accompanying him',
              'or to attend him as a matter of course when he went out, and that those who had been kept from accompanying him'),
 (16, '16.2', 'and when he did not have them he did not miss them.', 'and when he did not have them he did not want them.'),
 (16, '16.3', 'a man mature, complete, above flattery', 'a man mature, perfect, above flattery'),
 (16, '16 (optional)', 'but he liked to stay in the same places', 'but he loved to stay in the same places'),
 (17, '17.1', 'in which I might perhaps have been completely absorbed', 'in which I would perhaps have been completely absorbed'),
 (17, '17.2', 'when I took an inclination to philosophy', 'when I had an inclination to philosophy'),
 (17, '17 (optional)', 'against blood-spitting and dizziness…;', 'against blood-spitting and dizziness...;'),
 (12, 'flow read (step 7)', 'the neglect of the duties our relation to those we live with requires, by pleading urgent business',
                            'the neglect of the duties required by our relation to those we live with, by pleading urgent business'),
]

NOT_APPLIED = (
 '**Findings not applied:** none of the nineteen numbered findings was declined. All eleven "worth improving" findings '
 '(3.1, 5.1, 6.1, 7.1, 9.1, 12.1, 15.1, 16.1, 16.2, 16.3, 17.1) and all eight "optional preference" findings '
 '(6.2, 9.2, 11.1, 14.1, 14.2, 15.2, 15.3, 17.2) were applied, 15.3 as a `continuity.md` note only (the reviewer asked for the '
 'record, not a text change; "annoyance" stays). Of the reviewer\'s "also noted, optional" points, four were applied '
 '(I.7 "easily disposed to be pacified", I.9 "family", I.16 "loved to stay", I.17 three-dot ellipsis to match the staged '
 'original) and three were left as v1 has them, each with a reason: I.5 "to endure hard work" (the reviewer accepted it; '
 '"to endure work" is not idiomatic and "labor" already means toil); I.16 "when to act vigorously and when to relax" '
 '(the reviewer called it a fair modernisation of "remission"; "ease off" is no closer in register); I.16 "the smallest '
 'matter" (the reviewer called the supplied noun harmless). On 3.1 only I.3 and I.7 changed; I.9 "kindly disposition" '
 'and I.15 "doing kindnesses" were already in the "kind" family and stand. On 14.1 the drafter took the reviewer\'s first '
 'route (dagger clause restored to Long\'s "undeviating") and, so that Long\'s one word is not rendered two ways in one '
 'book, also restored "undeviating" in the unmarked I.8 and I.16 clauses; recorded in `continuity.md`. Three `continuity.md` '
 'entries are superseded and updated there: I.6 (the four-word expansion removed), I.15 ("appearance" per glossary; '
 '"annoyance" recorded as a departure from the glossary\'s "vexed" family), and the beneficence table row.'
)

def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()

def main():
    v1 = json.load(open(os.path.join(B1, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B1, 'source-book1.json'), encoding='utf-8'))
    paras = list(v1['paragraphs'])
    log = []
    for n, fid, old, new in CHANGES:
        i = n - 1
        assert paras[i].count(old) == 1, (n, fid, old)
        paras[i] = paras[i].replace(old, new)
        log.append((n, fid, old, new))
    v2 = {'number': v1['number'], 'title': v1['title'], 'paragraphs': paras}
    assert len(paras) == 17 and all(p.startswith(f'{i+1}. ') for i, p in enumerate(paras))
    json.dump(v2, open(os.path.join(B1, 'candidate-v2.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 1 — modern-English candidate v2', '', f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see `changes-v1-to-v2.md`). Paragraph IDs `B01-Pxxx` are for reference only; the leading number is part of the text.', '']
    for i, p in enumerate(paras): lines += [f'**[B01-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B1, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    ch = ['# Changes v1 → v2 — Meditations, Book I', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, with the round-1 finding it answers (`review/findings-v1.md`). Applied mechanically by `scripts/build_book1_v2.py`; each "old" string matched exactly once in its paragraph. Paragraphs not listed are byte-identical between v1 and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B01-P{n:03d} (I.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of 17 ({", ".join("I."+str(n) for n in changed)}). Unchanged: ' +
           ', '.join('I.' + str(n) for n in range(1, 18) if n not in changed) + '.', '',
           NOT_APPLIED, '',
           '**Flow read (step 7):** `candidate-v2-readable.md` read continuously I.1–I.17 after the first build. One change made from it, listed last in the table: I.12, where the first rendering of 12.1 ("the duties our relation to those we live with requires, by pleading") stacked a relative clause awkwardly; the final wording follows Long\'s own shape ("duties required by our relation to those with whom we live, by alleging") and is closer to him. Nothing else changed; see `ACCEPTANCE.md`.', '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B1, "candidate-v1.json"))}`; candidate-v2.json `{sha(os.path.join(B1, "candidate-v2.json"))}`.']
    open(os.path.join(B1, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n-1].split(); b = paras[n-1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'I.{n}: ' + ' '.join(d))
    print('v2 sha256', sha(os.path.join(B1, 'candidate-v2.json')))
    sw = sum(len(p.split()) for p in src['paragraphs']); cw = sum(len(p.split()) for p in paras)
    print('words source', sw, 'v2', cw, 'ratio %.3f' % (cw/sw))
    print('min paragraph ratio %.2f' % min(len(c.split())/len(s.split()) for s, c in zip(src['paragraphs'], paras)))

if __name__ == '__main__':
    main()
