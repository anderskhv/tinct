# Meditations, Book VIII — package (accepted as candidate v2)

All eight steps of `../WORKFLOW.md` are done for Book VIII. The accepted text is
`candidate-v2.json` (sha256 `dbc4598c…`), see `ACCEPTANCE.md`.
`candidate-v1.json` (sha256 `9f42a271…`) stays **frozen** and was never edited.
Step 4 (independent review) was the coordinator's reviewer session, not this
agent; its findings are under `review/`: *Accept after corrections*, 0
substantive, 4 minor and 4 optional preferences, and all three of the drafter's
flagged decisions ruled the drafter's way — VIII.57's Greek on **stronger**
grounds than the drafter claimed.

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
   prose. `candidate-v2.json` and `candidate-v2-readable.md` are the accepted
   text, built from v1 by `../scripts/build_book8_v2.py`;
   `changes-v1-to-v2.md` lists every change by paragraph ID against the finding
   it answers, with the "shall" rule, the one finding not applied (1.2) and
   why, the round-1 rulings, and the flow read.
4. `continuity.md` — the step-1 source verification class by class, the glossary
   row extended for Book VIII, the glossary terms met and how they were
   rendered, paragraph-level decisions, apparatus folded or dropped (four
   cross-references, nine D11 drops in ten brackets, twelve folds with the
   referent supplements named), the three decisions flagged for the reviewer,
   and unresolved source issues; updated at acceptance with the seven corrected
   paragraphs (marked **[v2]**), the "shall" rule and its four licensed
   survivals, the three flagged decisions moved to settled, and VIII.57's
   reasoning corrected to the stronger ground.
5. `provenance.json` — branch, hashes (v1 and v2), source, word ratios, dagger
   marks, generation setting, apparatus counts, base-text defects, the round-1
   record, the rulings on the flagged items, the glossary rule added at
   acceptance, and the acceptance.
6. `review-packets/packet-01.md … packet-21.md` — twenty-one packets of three
   paragraphs (61 = 20×3 + 1), each with one paragraph of context before and
   after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus the
   v1 and v2 hashes and the accepted file.
9. `review/findings-v1.md` — the independent review of v1 (0 substantive, 4
   minor, 4 optional; *Accept after corrections*; rulings on all three flagged
   decisions, on the six base-text points and on the no-rebuild finding), with
   `review/README.md`.
10. `ACCEPTANCE.md` — the step-8 record: accepted hash, the round applied, the
    corrections and their verification, the flow read, and what remains open.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib, re
src=json.load(open('book8/source-book8.json')); cand=json.load(open('book8/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==8)
v2=json.load(open('book8/candidate-v2.json'))
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==61 and len(v2['paragraphs'])==61
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(v2['paragraphs']))
assert [len(c['paragraphs']) for c in st['chapters']]==[17,17,16,51,36,59,75,61,42,38,39,36]
assert not any('[Illustration' in p for c in st['chapters'] for p in c['paragraphs'])
assert not any(re.search(r'^\[[A-Z]\]|Acharnenses|From the Apologia|bad etymology|Saumaise|Valkenaer', p) for c in st['chapters'] for p in c['paragraphs'])
man=json.load(open('book8/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B08-P{i:03d}' for i in range(1,62)]
md=open('book8/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
md2=open('book8/candidate-v2-readable.md').read(); assert all(p in md2 for p in v2['paragraphs'])
for e in man['packets']:
    t=open('book8/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
# the three dagger-marked clauses, in source, v1 and v2 (VIII.51 with Long's "conjoined" restored at v2)
for k,s_,c1,c2 in [(34,'all the other powers that it has, so we have received from it this power also',
                       'all the other powers that it has, so we have received from it this power also',
                       'all the other powers that it has, so we have received from it this power also'),
                   (37,'look and judge wisely, says the philosopher.',
                       'look and judge wisely, says the philosopher.',
                       'look and judge wisely, says the philosopher.'),
                   (50,'By forming thyself hourly to freedom conjoined with contentment, simplicity, and modesty.',
                       'By forming yourself hourly to freedom joined with contentment, simplicity, and modesty.',
                       'By forming yourself hourly to freedom conjoined with contentment, simplicity, and modesty.')]:
    assert s_ in src['paragraphs'][k] and c1 in cand['paragraphs'][k] and c2 in v2['paragraphs'][k], k
for cc in (cand, v2):
    # no bracket and no cross-reference survives in the candidate; Long's Greek does
    assert not any('[' in p for p in cc['paragraphs'])
    assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in cc['paragraphs'])
    assert '(aktines)' in cc['paragraphs'][56] and '(apo tou ekteinesthai)' in cc['paragraphs'][56]
    # the one departure from PG's letters, and the four PG slips not reproduced
    assert 'Pergamus' in cc['paragraphs'][36] and 'comformably' not in cc['paragraphs'][44]
    assert 'to take them away' in cc['paragraphs'][5] and 'do not consider' in cc['paragraphs'][43]
assert 'Fergamus' in src['paragraphs'][36] and 'comformably' in src['paragraphs'][44]
assert 'to take, them away' in src['paragraphs'][5]
# the "shall" rule: no second-person and no plain-future "shall" in v2; exactly four licensed survivals
assert not any(re.search(r'\b(?:you|he|she|it|they|there) shall\b', p) for p in v2['paragraphs'])
assert [i+1 for i,p in enumerate(v2['paragraphs']) if re.search(r'\bshall\b',p)]==[1,14,32,45]
# the seven v2 corrections, and only those paragraphs, differ from v1
diff=[i+1 for i,(a,b) in enumerate(zip(cand['paragraphs'],v2['paragraphs'])) if a!=b]
assert diff==[1,7,12,41,51,55,58], diff
print('OK'); print(hashlib.sha256(open('book8/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book8/candidate-v2.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book8/source-book8.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `9f42a271…` (candidate v1, frozen), `dbc4598c…` (candidate v2, the
accepted text), `c380295d…` (source-book8.json) and `7798607d…` (the staged
original, unchanged at Book VIII step 1).

## Next action

None for Book VIII. The thread continues with Book IX (`../book9/`).
