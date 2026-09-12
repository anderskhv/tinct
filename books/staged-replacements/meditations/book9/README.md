# Meditations, Book IX — package (accepted as candidate v2)

All eight steps of `../WORKFLOW.md` are done for Book IX. The accepted text is
`candidate-v2.json` (sha256 `56dd7d13…`), see `ACCEPTANCE.md`.
`candidate-v1.json` (sha256 `b02cf135…`) stays **frozen** and was never edited.
Step 4 (independent review) was the coordinator's reviewer session, not this
agent; its findings are under `review/`: *Accept after corrections*, **1
substantive** (40.1, IX.40's three corrective turns restored to imperatives),
3 minor (1.1, 9.1, 41.1) and 5 optional preferences, with 35 of the 42
paragraphs recorded "No material issue found". Every base-text call in the book
was endorsed, the "shall" audit passed, and **all three flagged decisions are
settled** — IX.34 "poor souls" upheld, IX.29 "insolence" **closed** in PG's
favour on the argument of the meditation rather than on D6 alone, and IX.29's
emphatic "shall" confirmed. Finding 41.1 widened the `../GLOSSARY.md` "shall"
rule to indirect deliberative questions, in its own commit **before Book X was
drafted**.

Step 1 verified the source and **did not rebuild** the staged original — and in
this book that was a live question, not a formality. The file had been rebuilt
twice before (Book IV step 1, three PG illustration captions; Book VII step 1,
three of Long's footnotes printed flush left), and **one of those three captions
was in Book IX**: PG #15877 line 5628 prints `[Illustration: THE FORUM]`,
standing alone between the end of IX.21 and the start of IX.22. The Book VIII
reviewer flagged it. It is **already stripped** by the filter added at Book IV:
IX.21 ends at "a thing to be afraid of." and IX.22 begins at "22.", and no
`[Illustration` survives anywhere in the staged file. PG lines 5419–5864 were
then re-read line by line for every other class: **eight footnotes** (PG 5462,
5515, 5601, 5649, 5680, 5707, 5778, 5858), **all indented** and all already
stripped; **no** flush-left footnote opener, so the VII.45 defect does not
recur; exactly **three** standalone flush-left lines in the whole book (the
`IX.` header, the `X.` header, and the caption at 5628); no running head, no
page number, no catchword; **no verse and no verse citation at all**; and **no
Greek in the body** (every `[Greek: …]` span in the range is inside a footnote
body). Proof rather than assertion:
`../scripts/build_original_en_from_pg15877.py` was re-run from
`../source/pg15877-long-1862.txt` and its output is **byte-identical** to the
file on the branch — `cmp` clean, `git status` clean, sha256 still
`7798607d…`, 487 paragraphs, 12 chapters, section profile 17, 17, 16, 51, 36,
59, 75, 61, **42**, 38, 39, 36 — so nothing changed anywhere in the file and
**no accepted book is reopened**. Three dagger marks in Book IX (IX.6, IX.26,
IX.27), matching `../PROVENANCE.md` §4. Six base-text points recorded, one a
slip in PG (IX.34 "pool souls"), three places where PG is right and Standard
Ebooks is wrong or adds a word (IX.35 ×2, IX.40), one genuinely open variant
(IX.29 "insolence" / "indolence"), and one typographic paragraph break in
Standard Ebooks that is not a section break (IX.28) — each checked by a
word-level diff of the whole book against Standard Ebooks' Long.

Step 2 fixed the glossary before drafting: one row extended (Long's "divinity"
as a modified count noun keeps "divinity" — "the highest divinity", "the same
divinity", IX.1 — while the row's "the divine" governs his bare abstract uses).
Recorded in `../GLOSSARY.md` in its own commit, before any paragraph was
written. No new rendering row was needed. Book IX is also the **first book
drafted under the "shall" rule** added to `../GLOSSARY.md` at Book VIII
acceptance: three plain futures rendered without "shall" (all in IX.3) and eight
"shall" kept, all licensed.

## Files

1. `source-book9.json` — Book 9 (IX.1–IX.42) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 9`,
   42 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 42 paragraphs one-to-one
   with the source, same schema. **Frozen.**
3. `candidate-v1-readable.md` — the same text with `B09-Pnnn` IDs outside the
   prose.
3a. `candidate-v2.json` and `candidate-v2-readable.md` — **the accepted text**,
   v1 with the round-1 corrections applied by `../scripts/build_book9_v2.py`
   (three paragraphs changed: IX.1, IX.9, IX.40).
3b. `changes-v1-to-v2.md` — every change by paragraph ID against the finding it
   answers, plus the four declined findings with their reasons, the reviewer's
   rulings, and the flow read.
3c. `ACCEPTANCE.md` — the step-8 record, with hashes.
4. `continuity.md` — the step-1 source verification class by class, the glossary
   row extended for Book IX, the glossary terms met and how they were rendered,
   paragraph-level decisions, apparatus folded or dropped (six cross-reference
   spans, **no** D11 drops, four folds with the referent supplements named), the
   decisions flagged for the reviewer, and unresolved source issues.
5. `provenance.json` — branch, hashes, source, word ratios, dagger marks,
   generation setting, apparatus counts, the "shall" inventory, base-text
   points, flagged items.
6. `review-packets/packet-01.md … packet-14.md` — fourteen packets of three
   paragraphs (42 = 14×3), each with one paragraph of context before and after
   marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib, re
src=json.load(open('book9/source-book9.json')); cand=json.load(open('book9/candidate-v1.json'))
v2=json.load(open('book9/candidate-v2.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==9)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==42==len(v2['paragraphs'])
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(v2['paragraphs']))
assert [len(c['paragraphs']) for c in st['chapters']]==[17,17,16,51,36,59,75,61,42,38,39,36]
assert not any('[Illustration' in p for c in st['chapters'] for p in c['paragraphs'])
assert not any(re.search(r'^\[[A-Z]\]|Acharnenses|From the Apologia|bad etymology|Butler|Nekuias|Davies and Vaughan', p) for c in st['chapters'] for p in c['paragraphs'])
# the Book IX caption is gone and the two paragraphs it sat between are whole
assert ch['paragraphs'][20].endswith('a thing to be afraid of.')
assert ch['paragraphs'][21].startswith('22. Hasten [to examine]')
man=json.load(open('book9/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B09-P{i:03d}' for i in range(1,43)]
md=open('book9/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
md2=open('book9/candidate-v2-readable.md').read(); assert all(p in md2 for p in v2['paragraphs'])
for e in man['packets']:
    t=open('book9/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
# the three dagger-marked clauses, present in source and candidate
for k,s_,c_ in [(5,'present disposition of contentment with everything which happens',
                   'present disposition of contentment with everything which happens'),
                (25,'But enough','But enough of this.'),
                (26,'towards the attainment of those things on which they set a value.',
                    'towards the attainment of those things on which they set a value.')]:
    assert s_ in src['paragraphs'][k] and c_ in cand['paragraphs'][k], k
    assert c_ in v2['paragraphs'][k], k
# all four brackets folded, all six cross-reference spans dropped
assert sum(p.count('[') for p in src['paragraphs'])==4
assert not any('[' in p for p in cand['paragraphs']) and not any('[' in p for p in v2['paragraphs'])
assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in cand['paragraphs'])
for k,s_ in [(8,'this union'),(21,'to examine'),(23,'such is everything'),(25,'of this')]:
    assert f'[{s_}]' in src['paragraphs'][k] or f'[{s_.capitalize()}]' in src['paragraphs'][k], k
    assert s_ in cand['paragraphs'][k], k
# the "shall" rule: no second-person and no plain-future "shall"; the eight kept are licensed
assert not any(re.search(r'\b(?:you|he|she|it|they|there) shall\b', p) for p in cand['paragraphs'])
assert [i+1 for i,p in enumerate(cand['paragraphs']) if re.search(r'\bshall\b',p)]==[29,40,41]
assert cand['paragraphs'][28].count('They themselves shall judge')==1
assert cand['paragraphs'][39].count('How shall I')==6
assert 'shall be free from disturbances' in cand['paragraphs'][40]
assert 'shall' not in cand['paragraphs'][2]
# the one departure from PG's letters, and the PG readings followed against Standard Ebooks
assert 'pool souls' in src['paragraphs'][33] and 'poor souls' in cand['paragraphs'][33]
assert 'poor souls' in src['paragraphs'][26] and 'poor souls' in cand['paragraphs'][26]
assert 'bound in never ceasing evil' in cand['paragraphs'][34]
assert 'insolence and pride' in cand['paragraphs'][28]
assert 'You pray thus: How shall I not desire to be released?' in cand['paragraphs'][39]
# v2: the three corrections, and only those paragraphs, differ from v1
diff=[i+1 for i,(a,b) in enumerate(zip(cand['paragraphs'],v2['paragraphs'])) if a!=b]
assert diff==[1,9,40], diff
assert 'contrary to truth, for he had received powers' in v2['paragraphs'][0]
assert 'the nature of the things that are; and the things that are have' in v2['paragraphs'][0]
assert v2['paragraphs'][0].count('since ')==4
assert 'and, in a way, loves;' in v2['paragraphs'][8]
# IX.40's three corrective turns are imperatives, and the diminuendo holds
assert 'You, pray thus: How shall I not desire to lie with her?' in v2['paragraphs'][39]
assert 'You, pray: How shall I not desire to be released?' in v2['paragraphs'][39]
assert 'You thus: How shall I not be afraid to lose him?' in v2['paragraphs'][39]
assert 'Do you pray thus' not in v2['paragraphs'][39] and 'You pray thus' not in v2['paragraphs'][39]
assert v2['paragraphs'][39].count('How shall I')==6
# the "shall" rule holds in v2 as in v1
assert not any(re.search(r'\b(?:you|he|she|it|they|there) shall\b', p) for p in v2['paragraphs'])
assert [i+1 for i,p in enumerate(v2['paragraphs']) if re.search(r'\bshall\b',p)]==[29,40,41]
print('OK'); print(hashlib.sha256(open('book9/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book9/candidate-v2.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book9/source-book9.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `b02cf135…` (candidate v1, frozen), `56dd7d13…` (candidate v2, the
accepted text), `aca874d0…` (source-book9.json) and `7798607d…` (the staged
original, unchanged at Book IX step 1).

## Next action

None for Book IX. The thread continues with Book X (`../book10/`).

---

**Superseded by the cross-book v3 pass (2026-09-12).** Book IX's accepted `candidate-v2.json` is unchanged on disk and keeps its hash; the current text of this book is **`candidate-v3.json`, sha256 `00b3a6c4…`**, produced by `../scripts/build_v3_crossbook.py` as part of one change set across the whole work, ordered by class and not by book. `changes-v2-to-v3.md` lists this book's share of it with the class and the reason for each. The pass, its order, all eleven classes and the two it deliberately did not normalise are recorded in `../README.md`; the assembled edition built from the twelve v3 files is `../meditations-modern-en.staged.json`.
