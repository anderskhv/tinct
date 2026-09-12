# Meditations, Book VII — package (frozen for independent review)

Steps 1–3 of `../WORKFLOW.md` are done for Book VII. `candidate-v1.json`
(sha256 `1823989f…`) is **frozen**; corrections from the review will go to
`candidate-v2.json`, never to v1. Step 4 (independent review) is the
coordinator's reviewer session, not this agent.

Step 1 verified the source and **rebuilt the staged original** (D12): three of
Long's footnotes are printed flush left in PG #15877 (lines 4600, 4602, 4604 —
"See Aristophanes, Acharnenses, v. 661." and "From the Apologia, c. 16." twice)
and the build's footnote filter, which tested for an *indented* `[A]` opener,
had appended all three to VII.45 as if they were Long's translation. The filter
now matches unindented openers as well; staged sha256 `b0ecf3da…` →
`7798607d…`, 487 paragraphs before and after, VII.45 the only paragraph
changed, chapters 1–6 byte-identical, so Books I–VI stand. Seven dagger marks
in Book VII (VII.16 ×2, VII.31 ×2, VII.46 ×2, VII.67), matching
`../PROVENANCE.md` §4. Two base-text defects recorded (VII.5 "what-soever",
VII.58's broken ending), each checked against Standard Ebooks' Long.

Step 2 fixed the glossary before drafting: one row added (imagination →
imagination) and two extended (form / matter now covers Long's "the causal";
resent now covers his reflexive "vex ourselves at"). Recorded in
`../GLOSSARY.md` in its own commit, before any paragraph was written.

## Files

1. `source-book7.json` — Book 7 (VII.1–VII.75) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 7`,
   75 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 75 paragraphs one-to-one
   with the source, same schema. **Frozen.**
3. `candidate-v1-readable.md` — the same text with `B07-Pnnn` IDs outside the
   prose.
4. `continuity.md` — the glossary rows added and extended for Book VII, the
   glossary terms met and how they were rendered, paragraph-level decisions,
   apparatus folded or dropped (seven cross-references, six D11 drops, nine
   folds), the six decisions flagged for the reviewer, and unresolved source
   issues.
5. `provenance.json` — branch, hashes, source, word ratios, dagger marks,
   generation setting, apparatus counts, flagged items.
6. `review-packets/packet-01.md … packet-25.md` — twenty-five packets of three
   paragraphs (75 = 25×3), each with one paragraph of context before and after
   marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib, re
src=json.load(open('book7/source-book7.json')); cand=json.load(open('book7/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==7)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==75
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
assert not any('[Illustration' in p for c in st['chapters'] for p in c['paragraphs'])
assert not any(re.search(r'^\[[A-Z]\]|Acharnenses|From the Apologia', p) for c in st['chapters'] for p in c['paragraphs'])
man=json.load(open('book7/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B07-P{i:03d}' for i in range(1,76)]
md=open('book7/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
for e in man['packets']:
    t=open('book7/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
# the seven dagger-marked clauses, present in source and candidate
for k,s,c in [(15,'does not frighten itself or cause itself pain','does not frighten itself or cause itself pain'),
              (15,'for it will never deviate into such a judgment','for it will never deviate into such a judgment'),
              (30,'The poet says that law rules all','The poet says that law rules all'),
              (30,'And it is enough to remember that law rules all.','And it is enough to remember that law rules all.'),
              (45,'saving and being saved; for','saving and being saved; for'),
              (45,'a thing to be dismissed from the thoughts:','a thing to be dismissed from the thoughts:'),
              (66,'with the composition of the body','with the composition of the body')]:
    assert s in src['paragraphs'][k], k
    assert c in cand['paragraphs'][k], k
# VII.45 ends at the corrected place; VII.58 keeps Long's broken ending
assert src['paragraphs'][44].endswith('deserting his post].')
assert cand['paragraphs'][44].endswith('deserting his post.')
assert src['paragraphs'][57].endswith('remember...') and cand['paragraphs'][57].endswith('remember...')
# no bracket and no cross-reference survives in the candidate; Long's Greek does
assert not any('[' in p for p in cand['paragraphs'])
assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in cand['paragraphs'])
assert '(melos)' in cand['paragraphs'][12] and '(meros)' in cand['paragraphs'][12]
print('OK'); print(hashlib.sha256(open('book7/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `1823989f…` (candidate v1, frozen) and `7798607d…` (the twice-rebuilt
staged original).

## Next action

**Waiting on the coordinator: an independent review of Book VII.** Findings go
under `book7/review/`. This agent does not review its own draft and has not
started Book VIII.
