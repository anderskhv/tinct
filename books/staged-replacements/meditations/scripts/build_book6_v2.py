#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book VI.

Reads book6/candidate-v1.json (frozen), applies the substitutions in CHANGES
(each must match exactly once in its paragraph), writes candidate-v2.json,
candidate-v2-readable.md and changes-v1-to-v2.md, and prints a per-paragraph
word diff so every changed passage can be verified against source-book6.json.
Same pattern as scripts/build_book5_v2.py.
"""
import json, os, hashlib, difflib, re

HERE = os.path.dirname(os.path.abspath(__file__))
B6 = os.path.join(HERE, '..', 'book6')
N = 59

# (paragraph number, finding id, old text, new text)
CHANGES = [
 (9, '9.1', 'either a nature that externally comprehends this, or a nature that is comprehended within this nature, or a nature external to and independent of this',
            'either a nature that contains this from outside, or a nature that is contained within this nature, or a nature external to and independent of this'),
 (15, '15.1', 'like the exhalation of the blood and the breathing in of the air',
              'like the exhalation of the blood and the breathing of the air'),
 (50, '50.1', 'Let us try to persuade them. But act even against their will',
              'Let us try to persuade men. But act even against their will'),
]

# (0-based index, clause in source, clause in candidate) — the three dagger clauses
DAGGERS = [
 (37, 'by virtue of the active movement and mutual conspiration and the unity of the substance',
      'by virtue of the active movement and mutual conspiration and the unity of the substance'),
 (40, 'we do much injustice because we make a difference between these things',
      'we do much injustice because we make a difference between these things'),
 (49, 'if the things to which thou wast moved are [not] accomplished.',
      'if the things to which you were moved are not accomplished.'),
]

NOT_APPLIED = (
 '**Findings not applied:** none. All three numbered findings were applied: the two "worth improving" findings (9.1, '
 '50.1) and the one "optional preference" finding (15.1). On 9.1 the reviewer\'s first proposal is taken: Long\'s '
 '"comprehends / comprehended" is the older sense *includes, encloses*, and "contains this from outside / is contained '
 'within this nature" says that in the current word, so the three-way distinction the meditation turns on (a nature '
 'that contains this one from outside; a nature contained inside it; a nature outside and independent of it) is read '
 'at first sight instead of as "understands"; this is the same class as the edition\'s own "involution" → '
 '"entanglement" (VI.10) and "implicated" → "bound up" (VI.38). On 50.1 Long\'s "[men]" is a referent supplement of the '
 'VI.6 "[the wrong-doer]" / VI.47 "[of men]" class, not a second rendering of a word already rendered, and the rule '
 'folds supplements; "Let us try to persuade men." gives the new meditation its subject in Long\'s own word instead of '
 'opening on a pronoun with nothing before it. The v1 `continuity.md` line that had classed it as a D11 label and '
 'dropped it is reclassified: it moves from the "Alternative renderings and labels (D11)" list to the "supplements '
 'folded" list. On 15.1, the optional item, the decision is to apply it under the D8 pattern (a minor finding is applied '
 'unless `continuity.md` already records a considered reason not to, and v1 recorded none): Long\'s "respiration" '
 'names the whole cycle and the next sentence spells out both directions ("to have once drawn in the air and to have '
 'given it back"), so "the breathing of the air" is the whole of what Long names, in the word the candidate already '
 'uses for his "respiration" at VI.16; Long\'s own "respiration" was not kept because the edition rendered it '
 '"breathing" at VI.16 and one word for one Long word is the pattern (D10). Of the reviewer\'s "also noted" points (not '
 'numbered findings), none was changed: VI.3 "particular quality" (the reviewer proposed no change; "particular" is what '
 'V.3 used for the same Long word); VI.35 "do not endure to depart from it" (Long\'s, stiff but clear; the reviewer said '
 'no change is needed); VI.40 "is well" (Long\'s, recoverable from the sentence; any substitute would add a word). Three '
 '`continuity.md` entries are updated (VI.9, VI.15, VI.50) and the apparatus lists adjusted; the "[men]" ruling is '
 'recorded with the reviewer\'s other rulings under unresolved source issues.'
)

FLOW = (
 '**Flow read (step 7):** `candidate-v2-readable.md` read continuously VI.1–VI.59 after the build. No change was made '
 'from it. The three corrected clauses read without a snag in place: VI.9\'s three alternatives are now three plain '
 'containment relations; VI.15\'s "the breathing of the air" runs straight into the next sentence\'s drawing in and '
 'giving back; VI.50 opens on "Let us try to persuade men." and "their will" in the next sentence has its antecedent. '
 'Terminology was checked across the accepted books at the read: "the ruling part" (VI.8), "the reason that governs" '
 '(VI.1, VI.5), "the nature of the whole" (VI.9, as II.9, IV.36 v2, V.8, V.10), "the universal nature" (VI.58), '
 '"the whole" for Long\'s noun "the universal" (VI.45), "according to" for all of Long\'s "conformable / in conformity '
 'to" with nature, reason and constitution (VI.9, VI.14, VI.16, VI.19, VI.30, VI.44) beside "in conformity with '
 'intelligence" (VI.40, Long\'s distinct phrase), "against nature" (VI.33, VI.58), "providence" (VI.10, VI.44), '
 '"impressions" (VI.13, VI.16, VI.28), "opinion" (VI.36, VI.52, VI.57), "indifferent" (VI.32, VI.45), "generative '
 'principles" (VI.24), "disturbance" (VI.16) beside Long\'s own verb "disturbed", "resentment / resentful" (VI.20, '
 'VI.27), "discontented" (VI.49), "calm" (VI.50), "kind" (VI.47), "in a way" (VI.11, VI.27, VI.38) — all as the '
 'glossary and the earlier acceptances have them. Long\'s "Short is life." (VI.30) and "transpiration" (VI.16) stand, '
 'as they are his. Nothing else changed; see `ACCEPTANCE.md`.'
)

def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()

def main():
    v1 = json.load(open(os.path.join(B6, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B6, 'source-book6.json'), encoding='utf-8'))
    paras = list(v1['paragraphs'])
    log = []
    for n, fid, old, new in CHANGES:
        i = n - 1
        assert paras[i].count(old) == 1, (n, fid, old)
        paras[i] = paras[i].replace(old, new)
        log.append((n, fid, old, new))
    v2 = {'number': v1['number'], 'title': v1['title'], 'paragraphs': paras}
    assert len(paras) == N and all(p.startswith(f'{i+1}. ') for i, p in enumerate(paras))
    for k, s, c in DAGGERS:
        assert s in src['paragraphs'][k] and c in paras[k], (k, s)
    assert not any('[' in p or re.search(r'\((?:i|ii|iv|vi|vii|viii|ix|xi)\. ', p) for p in paras)
    json.dump(v2, open(os.path.join(B6, 'candidate-v2.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 6 — modern-English candidate v2', '', f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see `changes-v1-to-v2.md`). Paragraph IDs `B06-Pxxx` are for reference only; the leading number is part of the text.', '']
    for i, p in enumerate(paras): lines += [f'**[B06-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B6, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    ch = ['# Changes v1 → v2 — Meditations, Book VI', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, with the round-1 finding it answers (`review/findings-v1.md`). Applied mechanically by `scripts/build_book6_v2.py`; each "old" string matched exactly once in its paragraph. Paragraphs not listed are byte-identical between v1 and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B06-P{n:03d} (VI.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of {N} ({", ".join("VI."+str(n) for n in changed)}). Unchanged: ' +
           ', '.join('VI.' + str(n) for n in range(1, N+1) if n not in changed) + '.', '',
           NOT_APPLIED, '', FLOW, '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B6, "candidate-v1.json"))}`; candidate-v2.json `{sha(os.path.join(B6, "candidate-v2.json"))}`.']
    open(os.path.join(B6, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n-1].split(); b = paras[n-1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'VI.{n}: ' + ' '.join(d))
    print('v1 sha256', sha(os.path.join(B6, 'candidate-v1.json')))
    print('v2 sha256', sha(os.path.join(B6, 'candidate-v2.json')))
    sw = sum(len(p.split()) for p in src['paragraphs']); cw = sum(len(p.split()) for p in paras)
    print('words source', sw, 'v2', cw, 'ratio %.3f' % (cw/sw))
    print('min paragraph ratio %.2f' % min(len(c.split())/len(s.split()) for s, c in zip(src['paragraphs'], paras)))

if __name__ == '__main__':
    main()
