# Meditations, Book X — package (accepted as candidate v2)

All eight steps of `../WORKFLOW.md` are done for Book X. The accepted text is
`candidate-v2.json` (sha256 `8ba528dc…`), see `ACCEPTANCE.md`.
`candidate-v1.json` (sha256 `95ce5f7c…`) stays **frozen** and was never edited.
Step 4 (independent review) was the coordinator's reviewer session, not this
agent; its findings are under `review/`: *Accept after corrections*, **0
substantive**, **6 minor** (1.1, 15.1, 21.1, 23.1, 32.1 and the chapter-level
C1) and **5 optional preferences** (9.1, 33.1, 34.1, 36.1, 36.2), with 29 of the
38 paragraphs recorded "No material issue found". The reviewer calls it **"the
cleanest book in the package so far as prose"**: a token-level diff of all
thirty-eight paragraphs shows every difference between Long and the candidate
accounted for by a documented decision, the complete list of words the candidate
uses that occur nowhere in Long's Book X is eleven, and there is no substantive
finding. **All six minor findings are applied and three of the five optional
ones** (33.1, 36.1, 36.2); 9.1 and 34.1 are recorded and left, as the reviewer
proposes. **All four flagged decisions are settled** — X.15 "Let men see"
upheld, X.9 "Mimi" upheld, X.25's dagger comma confirmed, and X.32's vocative
comma **rejected** in favour of the plain imperative, which is finding 32.1.
Finding 23.1 added **D13** to `../00-progress-ledger.md` for translator's notes,
and finding C1 corrected the bracket arithmetic, which the build and the check
block below now assert from an enumerated list.

Step 1 verified the source and **did not rebuild** the staged original — and the
check deliberately was **not** a re-run of the build script. The file has been
rebuilt twice (Book IV step 1, three PG illustration captions; Book VII step 1,
three of Long's footnotes printed flush left), and the Book IX round-1 reviewer
made the point that governs here: byte-identity to a re-run proves only that the
file matches the script, **which is exactly how the Book IV captions and the
Book VII footnotes survived the first build**. So PG lines 5866–6374 (after the
`X.` header at 5865, before the `XI.` header at 6375) were re-extracted by an
**independent reconstruction written from scratch**,
`../scripts/verify_book10_source.py`, and diffed word for word against the
staged Book X. It reconstructs **38 paragraphs**, matching the staged count, and
**the only four differences in the whole book are the four dagger marks** at X.9
(PG 6038), X.19 (PG 6132), X.25 (PG 6183) and X.31 (PG 6229), which
`../PROVENANCE.md` §4 documents as deliberately removed. Class by class:
**seventeen footnotes** in eleven indented runs (openers at PG 5886, 5968, 6009,
6015, 6050, 6054, 6077, 6082, 6158, 6172, 6188, 6257, 6264, 6268, 6319, 6353,
6370), **all indented**, none flush left, all already stripped, and their
seventeen in-text markers all removed — sixteen from flush-left text and one
from inside Long's indented verse at PG 6306, which is why the counts differ by
one; **no illustration caption**; exactly **one** standalone flush-left line in
the book (the `X.` header); **no running head, no page number, no catchword**;
**verse present and correctly joined** (Long's two-line Homer quotation at PG
6305–6306, indented five spaces, joined into X.34 as `../PROVENANCE.md` §4's
verse rule requires, against the four-line Odyssey quotation at PG 6026–6029,
indented seven spaces *inside* footnote [B] and dropped with it); **no verse
citation in the body**; and **no Greek in the body**. A flush-left footnote body
of the VII.45 kind would have been read by the reconstruction as ordinary text
and would have shown as a diff; none did. The staged file's sha256 is unchanged
at `7798607d…`, 487 paragraphs, twelve chapters, section profile 17, 17, 16, 51,
36, 59, 75, 61, 42, **38**, 39, 36, and `git status` is clean. **No rebuild was
made and no accepted book is reopened.** Confirmation added to
`../PROVENANCE.md` §4.

Step 2 fixed the glossary before drafting: **two rows extended**, both committed
and pushed before any paragraph was written. Long's "political [social] animal"
(X.2) takes **"a political being"** — "animal" becomes "being" as in every other
compound, and the bracket is dropped under D11 — and his "a good daemon
[happiness]" (X.13) takes **"a good god within—happiness"**, on the accepted
Book VII's VII.17 rendering, with Long's own gloss folded as an apposition. No
new rendering row was needed. Book X is the **second** book drafted under the
"shall" rule and the first drafted under its widened wording (Book IX finding
41.1): 23 "shall / shalt" in Long, **six kept** (five first-person at X.6, and
X.36's negative consecutive subjunctive) and **seventeen removed**, all plain
futures.

## Files

1. `source-book10.json` — Book 10 (X.1–X.38) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 10`,
   38 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 38 paragraphs one-to-one
   with the source, same schema. **Frozen.**
3. `candidate-v1-readable.md` — the same text with `B10-Pnnn` IDs outside the
   prose.
4. `continuity.md` — the step-1 source verification class by class, the two
   glossary rows extended for Book X, the glossary terms met and how they were
   rendered, the "shall" inventory, paragraph-level decisions, apparatus folded
   or dropped (four cross-reference spans, **fourteen folds, three D11 drops and
   one translator's note dropped under D13 — 14 + 3 + 1 = 18**), the
   punctuation tally, the settled rulings, and unresolved source issues. Updated
   at acceptance.
4a. `candidate-v2.json` / `candidate-v2-readable.md` — **the accepted text**,
   built from the frozen v1 by `../scripts/build_book10_v2.py`.
4b. `changes-v1-to-v2.md` — every change by paragraph ID against the finding
   it answers, plus every finding not applied and why.
4c. `ACCEPTANCE.md` — the step-8 record, with hashes.
4d. `review/findings-v1.md` — the round-1 independent review.
5. `provenance.json` — branch, hashes, source, word ratios, dagger marks,
   generation setting, apparatus counts, the "shall" inventory, base-text
   points, flagged items.
6. `review-packets/packet-01.md … packet-13.md` — thirteen packets of three
   paragraphs (38 = 12×3 + 2), each with one paragraph of context before and
   after marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib, re
src=json.load(open('book10/source-book10.json')); cand=json.load(open('book10/candidate-v1.json'))
v2=json.load(open('book10/candidate-v2.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==10)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==38
assert len(v2['paragraphs'])==38
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(v2['paragraphs']))
assert [len(c['paragraphs']) for c in st['chapters']]==[17,17,16,51,36,59,75,61,42,38,39,36]
assert not any('[Illustration' in p for c in st['chapters'] for p in c['paragraphs'])
assert not any(re.search(r'^\[[A-Z]\]|Acharnenses|From the Apologia|bad etymology|Butler|Nekuias|Davies and Vaughan|Fortunatae Insulae|Vulcatius|Theaet', p) for c in st['chapters'] for p in c['paragraphs'])
# Long's Homer verse is inside X.34; the Odyssey verse inside footnote [B] is not in the file
assert 'Leaves, some the wind scatters on the ground' in ch['paragraphs'][33]
assert not any('gently breathing gales of Zephyr' in p for c in st['chapters'] for p in c['paragraphs'])
man=json.load(open('book10/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B10-P{i:03d}' for i in range(1,39)]
md=open('book10/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
md2=open('book10/candidate-v2-readable.md').read(); assert all(p in md2 for p in v2['paragraphs'])
for e in man['packets']:
    t=open('book10/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
# the four dagger-marked clauses, present in source and candidate
for k,s_,c_ in [(8,'those holy principles of thine.','those holy principles of yours.'),
                (18,'when they are imperious and arrogant','when they are imperious and arrogant'),
                (24,'who is grieved or angry or afraid, is dissatisfied',
                    'who is grieved or angry or afraid, is discontented'),
                (30,'Satyron the Socratic, think of either','Satyron the Socratic, think of either')]:
    assert s_ in src['paragraphs'][k] and c_ in cand['paragraphs'][k], k
    assert c_ in v2['paragraphs'][k], k
# eighteen brackets in the source; none survives; the four cross-reference spans are gone
brackets=sum(p.count('[') for p in src['paragraphs']); assert brackets==18
for c_ in (cand,v2):
    assert not any('[' in p for p in c_['paragraphs'])
    assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in c_['paragraphs'])
# THE BRACKET ARITHMETIC (finding C1), asserted from the enumerated list rather
# than from a numeral: every fold is named, and folds + D11 drops + the
# translator's note must equal the source's own bracket count. v1 records said
# "sixteen folded, two dropped", which with the note is nineteen; the true v1
# count was fifteen folds, and finding 15.1 moves X.15's "[political community]"
# to the D11 drops, so v2 is fourteen + three + one.
FOLDS_V2=[(5,'a concourse of'),(5,'is a system'),(6,'as an efficient power'),
          (6,'has received the accretion'),(6,'this which your mother brought forth'),
          (6,'particular quality of change'),(7,'laudable'),(10,'this part of philosophy'),
          (12,'a good god within—happiness'),(14,'to live thus, as men do'),(20,'is wont'),
          (30,'for your activity'),(31,'does reason allow you to live'),(32,'our life')]
D11_V2=[(1,'[social]','social'),(14,'[political community]','political community'),
        (32,'law [order]','order')]
NOTE_V2=[(22,'omitted in the translation','translation')]
for k,s_ in FOLDS_V2: assert s_ in v2['paragraphs'][k], (k,s_)
for k,in_src,gone in D11_V2:
    assert in_src in src['paragraphs'][k] and gone not in v2['paragraphs'][k], k
for k,in_src,gone in NOTE_V2:
    assert in_src in src['paragraphs'][k] and gone not in v2['paragraphs'][k], k
assert (len(FOLDS_V2),len(D11_V2),len(NOTE_V2))==(14,3,1)
assert len(FOLDS_V2)+len(D11_V2)+len(NOTE_V2)==brackets
assert 'a political being' in v2['paragraphs'][1] and 'as in a state.' in v2['paragraphs'][14]
# v1's own dispositions, for the record: fifteen folds, two D11 drops, one note
assert 'political community' in cand['paragraphs'][14]
assert len(FOLDS_V2)+1+len(D11_V2)-1+len(NOTE_V2)==brackets
# the "shall" rule: exactly two paragraphs carry "shall"; six occurrences; all licensed
assert not any(re.search(r'\b(?:you|he|she|it|they) shall\b', p) for p in cand['paragraphs'])
assert [i+1 for i,p in enumerate(cand['paragraphs']) if re.search(r'\bshall\b',p)]==[6,36]
assert cand['paragraphs'][5].count('I shall')==5
assert 'that there shall not be by him' in cand['paragraphs'][35]
assert sum(len(re.findall(r'\bshal[lt]\b',p)) for p in src['paragraphs'])==23
# no thou-forms survive
assert not any(re.search(r'\b(thou|thy|thee|thyself|shalt|hast|art|dost|wilt|wast)\b',p) for p in cand['paragraphs'])
# the one departure from PG's letters, and the PG readings followed against Standard Ebooks
assert 'Let me see' in src['paragraphs'][14] and 'Let men see' in cand['paragraphs'][14]
assert 'turn all my efforts' in cand['paragraphs'][5]
assert 'at least some one' in cand['paragraphs'][35] and 'at least someone' in v2['paragraphs'][35]
assert 'Hadrianus' in cand['paragraphs'][26] and 'Philippus' in cand['paragraphs'][26]
assert 'Mimi' in cand['paragraphs'][8]
assert 'You, only determine' in cand['paragraphs'][31]
# v2: the six corrections, and only those five paragraphs, differ from v1
diff=[i+1 for i,(a,b) in enumerate(zip(cand['paragraphs'],v2['paragraphs'])) if a!=b]
assert diff==[15,21,32,33,36], diff
assert 'that "this or that loves"—is wont—"to be produced?"' in v2['paragraphs'][20]
assert 'Only determine to live no longer unless you are such.' in v2['paragraphs'][31]
assert 'You, only determine' not in v2['paragraphs'][31]
assert 'this material—our life—can be done' in v2['paragraphs'][32]
assert 'shall not be beside him when he is dying' in v2['paragraphs'][35]
# findings left as drafted, with the reason recorded
assert 'when gravity' in v2['paragraphs'][8]                     # 9.1
assert 'ground— So is the race of men.' in v2['paragraphs'][33]  # 34.1
assert v2['paragraphs'][33]==cand['paragraphs'][33]
# five paragraphs still byte-identical to Long, in v2 as in v1
assert [i+1 for i,(s_,c_) in enumerate(zip(src['paragraphs'],v2['paragraphs'])) if s_==c_]==[16,17,18,19,35]
# the "shall" inventory holds in v2 as in v1
assert [i+1 for i,p in enumerate(v2['paragraphs']) if re.search(r'\bshall\b',p)]==[6,36]
assert not any(re.search(r'\b(?:you|he|she|it|they) shall\b', p) for p in v2['paragraphs'])
assert not any(re.search(r'\b(thou|thy|thee|thyself|shalt|hast|art|dost|wilt|wast)\b',p) for p in v2['paragraphs'])
print('OK'); print(hashlib.sha256(open('book10/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book10/candidate-v2.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book10/source-book10.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `95ce5f7c…` (candidate v1, frozen), `8ba528dc…` (candidate v2, the
accepted text), `db635cde…` (source-book10.json) and `7798607d…` (the staged
original, unchanged at Book X step 1).

The step-1 source check itself is reproducible on its own:

```bash
cd books/staged-replacements/meditations
python3 scripts/verify_book10_source.py
```

Expected: 38 reconstructed paragraphs, count match, and four differing
paragraphs — X.9, X.19, X.25, X.31 — each differing only by the dagger mark.

## Next action

None for Book X. The thread continues with Book XI (`../book11/`).

---

**Superseded by the cross-book v3 pass (2026-09-12).** Book X's accepted `candidate-v2.json` is unchanged on disk and keeps its hash; the current text of this book is **`candidate-v3.json`, sha256 `d1206f13…`**, produced by `../scripts/build_v3_crossbook.py` as part of one change set across the whole work, ordered by class and not by book. `changes-v2-to-v3.md` lists this book's share of it with the class and the reason for each. The pass, its order, all eleven classes and the two it deliberately did not normalise are recorded in `../README.md`; the assembled edition built from the twelve v3 files is `../meditations-modern-en.staged.json`.
