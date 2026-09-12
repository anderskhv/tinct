# Meditations, Book VIII — package (frozen for independent review)

Steps 1–3 of `../WORKFLOW.md` are done for Book VIII. `candidate-v1.json`
(sha256 `9f42a271…`) is **frozen**; corrections from the review will go to
`candidate-v2.json`, never to v1. Step 4 (independent review) is the
coordinator's reviewer session, not this agent.

Step 1 verified the source and **did not rebuild** the staged original. The
file had been rebuilt twice before (Book IV step 1, three PG illustration
captions; Book VII step 1, three of Long's footnotes printed flush left), so PG
#15877 was re-read line by line for Book VIII — PG lines 4933–5418, the `VIII.`
header to the `IX.` header — for exactly those classes. Book VIII's **nine**
footnotes (PG lines 4969, 5045, 5131, 5160, 5218, 5223, 5277, 5396, 5414) are
**all printed indented** and were already being stripped; there is no flush-left
footnote opener, no illustration caption in the book (the nearest, line 5628, is
in Book IX), no running head, no page number, and **no verse and no verse
citation at all**. Proof rather than assertion:
`../scripts/build_original_en_from_pg15877.py` was re-run from
`../source/pg15877-long-1862.txt` and its output is **byte-identical** to the
file on the branch — `cmp` clean, sha256 still `7798607d…`, 487 paragraphs, 12
chapters — so nothing changed anywhere in the file and **no accepted book is
reopened**. Three dagger marks in Book VIII (VIII.35, VIII.38, VIII.51),
matching `../PROVENANCE.md` §4. Six base-text points recorded, four of them
slips in PG (VIII.1, VIII.6, VIII.37, VIII.45) and two places where PG is right
and Standard Ebooks is wrong (VIII.2, VIII.44), each checked by a word-level
diff of the whole book against Standard Ebooks' Long.

Step 2 fixed the glossary before drafting: one row extended (the
nature-of-the-whole row now covers Long's third shape, "the nature of the
universal", VIII.5, VIII.6, VIII.35). Recorded in `../GLOSSARY.md` in its own
commit, before any paragraph was written. No new rendering row was needed. The
in-text-Greek exception added to `../GLOSSARY.md` at Book VII acceptance governs
VIII.57.

## Files

1. `source-book8.json` — Book 8 (VIII.1–VIII.61) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 8`,
   61 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 61 paragraphs one-to-one
   with the source, same schema. **Frozen.**
3. `candidate-v1-readable.md` — the same text with `B08-Pnnn` IDs outside the
   prose.
4. `continuity.md` — the step-1 source verification class by class, the glossary
   row extended for Book VIII, the glossary terms met and how they were
   rendered, paragraph-level decisions, apparatus folded or dropped (four
   cross-references, nine D11 drops in ten brackets, twelve folds with the
   referent supplements named), the three decisions flagged for the reviewer,
   and unresolved source issues.
5. `provenance.json` — branch, hashes, source, word ratios, dagger marks,
   generation setting, apparatus counts, base-text defects, flagged items.
6. `review-packets/packet-01.md … packet-21.md` — twenty-one packets of three
   paragraphs (61 = 20×3 + 1), each with one paragraph of context before and
   after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib, re
src=json.load(open('book8/source-book8.json')); cand=json.load(open('book8/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==8)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==61
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
assert [len(c['paragraphs']) for c in st['chapters']]==[17,17,16,51,36,59,75,61,42,38,39,36]
assert not any('[Illustration' in p for c in st['chapters'] for p in c['paragraphs'])
assert not any(re.search(r'^\[[A-Z]\]|Acharnenses|From the Apologia|bad etymology|Saumaise|Valkenaer', p) for c in st['chapters'] for p in c['paragraphs'])
man=json.load(open('book8/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B08-P{i:03d}' for i in range(1,62)]
md=open('book8/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
for e in man['packets']:
    t=open('book8/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
# the three dagger-marked clauses, present in source and candidate
for k,s,c in [(34,'all the other powers that it has, so we have received from it this power also',
                  'all the other powers that it has, so we have received from it this power also'),
              (37,'look and judge wisely, says the philosopher.','look and judge wisely, says the philosopher.'),
              (50,'By forming thyself hourly to freedom conjoined with contentment, simplicity, and modesty.',
                  'By forming yourself hourly to freedom joined with contentment, simplicity, and modesty.')]:
    assert s in src['paragraphs'][k], k
    assert c in cand['paragraphs'][k], k
# no bracket and no cross-reference survives in the candidate; Long's Greek does
assert not any('[' in p for p in cand['paragraphs'])
assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in cand['paragraphs'])
assert '(aktines)' in cand['paragraphs'][56] and '(apo tou ekteinesthai)' in cand['paragraphs'][56]
# the one departure from PG's letters, and the four PG slips not reproduced
assert 'Fergamus' in src['paragraphs'][36] and 'Pergamus' in cand['paragraphs'][36]
assert 'comformably' in src['paragraphs'][44] and 'comformably' not in cand['paragraphs'][44]
assert 'to take, them away' in src['paragraphs'][5] and 'to take them away' in cand['paragraphs'][5]
assert 'do not consider' in src['paragraphs'][43] and 'do not consider' in cand['paragraphs'][43]
print('OK'); print(hashlib.sha256(open('book8/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book8/source-book8.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `9f42a271…` (candidate v1, frozen), `c380295d…` (source-book8.json)
and `7798607d…` (the staged original, unchanged at Book VIII step 1).

## Next action

**Waiting on the coordinator: an independent review of Book VIII.** Findings go
under `book8/review/`. Three decisions are flagged there for an explicit ruling
(VIII.37 "Pergamus", VIII.57's Greek, "effusion" at VIII.51 and VIII.57). This
agent does not review its own draft and has not started Book IX.
