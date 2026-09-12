#!/usr/bin/env python3
"""The glossary frequency table across all twelve accepted candidates.

Written for the cross-book pass (2026-09-12). A glossary row extended at Book X
or XI cannot have been applied in Books I-IX, and no check has ever run a row's
left column over the whole work. This does that: for every row, it finds each
occurrence of LONG'S wording in the staged original and reports whether the
candidate paragraph carries the row's rendering, so that a row that
under-describes the edition, or an unapplied extension, shows as a row of hits
rather than as a reviewer's hunch.

It also scans for the dead-usage classes the pass is closing (such like,
plural distributive "several", "adapted to" in the sense of "suited to"), and
re-derives the third-person plain-future "shall" class from scratch.

  python3 scripts/glossary_frequency.py            # the whole report
  python3 scripts/glossary_frequency.py --terse    # only the rows with hits
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.join(HERE, '..')
ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

# (row name, Long's wording as a regex, the rendering(s) expected in the candidate)
ROWS = [
 ('nature / according to nature', r'\bconformably to nature\b|\bconformable to nature\b',
  [r'according to nature']),
 ('the nature of the whole', r'\bthe nature of the (?:whole|universe|universal)\b',
  [r'the nature of the whole']),
 ('the universal (bare noun)', r'\bthe universal\b(?!\s+(?:nature|substance|cause|reason|soul|intelligence))',
  [r'\bthe whole\b']),
 ('rational / reasonable animal', r'\b(?:rational|reasonable) animal\b', [r'rational being']),
 ('social / political animal', r'\b(?:social|political) animal\b', [r'social being', r'political being']),
 ('the ruling faculty / part / principle', r'\bruling (?:faculty|principle)\b|\bleading principle\b',
  [r'the ruling part', r'ruling part']),
 ('the daemon / the divinity within', r'\bdaemon\b|\bdivinity which is planted\b|\bdivinity within\b',
  [r'god within']),
 ('the Deity / the divinity (bare abstract)', r'\bthe Deity\b', [r'the divine']),
 ('common interest / weal / advantage', r'\bcommon (?:weal|advantage)\b|\bgeneral interest\b',
  [r'the common good']),
 ('impressions / appearances', r'\bappearances?\b', [r'impression', r'appearance']),
 ('movements (impulse)', r'\bmovements? \(in the sense', [r'impulse']),
 ('vexed / vexation', r'\bvexed\b|\bvexation\b', [r'resent', r'discontent']),
 ('tranquillity', r'\btranquill?(?:ity|)\b', [r'calm']),
 ('perturbation(s)', r'\bperturbation', [r'disturbance']),
 ('seminal principle', r'\bseminal\b', [r'generative']),
 ('mutation / transmutation', r'\b(?:trans)?mutation\b|\btransmuted\b', [r'chang', r'transform']),
 ('vulgar', r'\bvulgar\b', [r'commonplace', r'common sort of men']),
 ('affects (pathe)', r'\baffects\b', [r'feelings']),
 ('the formal / the material / the causal', r'\bthe (?:formal|material|causal)\b',
  [r'\bform\b', r'\bmatter\b', r'\bcause\b']),
 ('beneficence / benevolence', r'\bbenevolen|\bbeneficen', [r'kind']),
 ('felicity', r'\bfelicity\b', [r'happiness']),
 ('dissatisfied', r'\bdissatisf', [r'discontent']),
 ('in a manner', r'\bin a manner\b', [r'in a way']),
]

# Dead-usage classes the cross-book pass is closing.
CLASSES = [
 ('"such like" / "suchlike"', r'\bsuch ?like\b'),
 ('plural distributive "several"', r'\bseveral\b'),
 ('"adapted to" (= suited to)', r'\badapted to\b'),
 ('"forthwith"', r'\bforthwith\b'),
 ('"perchance"', r'\bperchance\b'),
 ('"in fine"', r'\bin fine\b'),
 ('"vesture" / "raiment"', r'\bvesture\b|\braiment\b'),
 ('"efflux"', r'\befflux\b'),
 ('"circumfluent"', r'\bcircumfluent\b'),
 ('finite negative without do-support', r'\b(?:regards?|comes?|differs?|knows?|seems?) not\b'),
]


def accepted(n):
    """The accepted candidate for book n: v3 where the cross-book pass touched it,
    otherwise v2. Books II, VIII, XI and XII have no v3 and are not opened."""
    for v in ('candidate-v3.json', 'candidate-v2.json'):
        f = os.path.join(PKG, f'book{n}', v)
        if os.path.exists(f):
            return json.load(open(f, encoding='utf-8'))
    raise SystemExit(f'no accepted candidate for book {n}')


def load():
    staged = json.load(open(os.path.join(PKG, 'meditations-original-en.staged.json'), encoding='utf-8'))
    cand = [accepted(n) for n in range(1, 13)]
    return staged, cand


def main():
    staged, cand = load()
    terse = '--terse' in sys.argv
    print('# Glossary frequency table — all twelve accepted candidates\n')
    print('Long\'s wording, where it occurs, and whether the candidate paragraph carries the')
    print('row\'s rendering. A "MISS" is not a defect by itself — a row may not govern every')
    print('occurrence — but every MISS is a place the row does not describe the edition.\n')
    for name, src_re, rends in ROWS:
        hits, miss = [], []
        for ch, cc in zip(staged['chapters'], cand):
            for i, (s_, m_) in enumerate(zip(ch['paragraphs'], cc['paragraphs'])):
                if re.search(src_re, s_, re.I):
                    ref = f'{ROMAN[ch["number"]-1]}.{i+1}'
                    hits.append(ref)
                    if not any(re.search(r, m_, re.I) for r in rends):
                        miss.append(ref)
        if terse and not miss:
            continue
        print(f'## {name}\n  Long: {len(hits)} paragraphs — {", ".join(hits) if hits else "none"}')
        print(f'  rendering missing in: {", ".join(miss) if miss else "none"}\n')

    print('\n# Dead-usage classes across the twelve\n')
    for name, rx in CLASSES:
        src_hits, cand_hits = [], []
        for ch, cc in zip(staged['chapters'], cand):
            for i, (s_, m_) in enumerate(zip(ch['paragraphs'], cc['paragraphs'])):
                ref = f'{ROMAN[ch["number"]-1]}.{i+1}'
                if re.search(rx, s_, re.I):
                    src_hits.append(ref)
                if re.search(rx, m_, re.I):
                    cand_hits.append(ref)
        print(f'## {name}\n  in Long: {", ".join(src_hits) or "none"}')
        print(f'  STILL IN THE CANDIDATE: {", ".join(cand_hits) or "none"}\n')

    print('\n# The "shall" class, re-derived from the twelve candidates\n')
    for ch, cc in zip(staged['chapters'], cand):
        for i, m_ in enumerate(cc['paragraphs']):
            for mt in re.finditer(r'\b\w+\s+shall\b|\bshall\b', m_, re.I):
                a = max(0, mt.start() - 60)
                print(f'  {ROMAN[ch["number"]-1]}.{i+1}: …{m_[a:mt.end()+50]}…')


if __name__ == '__main__':
    main()
