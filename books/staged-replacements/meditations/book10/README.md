# Meditations, Book X — package (frozen for independent review)

Steps 1–3 of `../WORKFLOW.md` are done for Book X. `candidate-v1.json`
(sha256 `95ce5f7c…`) is **frozen**; corrections from the review will go to
`candidate-v2.json`, never to v1. Step 4 (independent review) is the
coordinator's reviewer session, not this agent.

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
   or dropped (four cross-reference spans, sixteen folds, two D11 drops and one
   translator's note dropped), the decisions flagged for the reviewer, and
   unresolved source issues.
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
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==10)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==38
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
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
# eighteen brackets in the source; none survives; the four cross-reference spans are gone
assert sum(p.count('[') for p in src['paragraphs'])==18
assert not any('[' in p for p in cand['paragraphs'])
assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in cand['paragraphs'])
# the two D11 drops and the translator's note dropped
assert '[social]' in src['paragraphs'][1] and 'a political being' in cand['paragraphs'][1] and 'social' not in cand['paragraphs'][1]
assert 'law [order]' in src['paragraphs'][32] and 'order' not in cand['paragraphs'][32]
assert 'omitted in the translation' in src['paragraphs'][22] and 'translation' not in cand['paragraphs'][22]
# the sixteen folds, spot-checked by their folded words
for k,s_ in [(5,'a concourse of'),(5,'is a system'),(6,'as an efficient power'),(6,'the accretion'),
             (6,'of change'),(7,'laudable'),(10,'of philosophy'),(14,'political community'),
             (14,'as men do'),(20,'is wont'),(30,'for your activity'),(31,'you to live'),(32,'our life')]:
    assert s_ in cand['paragraphs'][k], (k,s_)
assert 'a good god within—happiness' in cand['paragraphs'][12]
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
assert 'at least some one' in cand['paragraphs'][35]
assert 'Hadrianus' in cand['paragraphs'][26] and 'Philippus' in cand['paragraphs'][26]
assert 'Mimi' in cand['paragraphs'][8]
assert 'You, only determine' in cand['paragraphs'][31]
print('OK'); print(hashlib.sha256(open('book10/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book10/source-book10.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `95ce5f7c…` (candidate v1, frozen), `db635cde…` (source-book10.json)
and `7798607d…` (the staged original, unchanged at Book X step 1).

The step-1 source check itself is reproducible on its own:

```bash
cd books/staged-replacements/meditations
python3 scripts/verify_book10_source.py
```

Expected: 38 reconstructed paragraphs, count match, and four differing
paragraphs — X.9, X.19, X.25, X.31 — each differing only by the dagger mark.

## Next action

**Waiting on the coordinator: an independent review of Book X.** Findings go
under `book10/review/`. Three decisions are flagged there for an explicit ruling
(X.15 "Let men see" for PG's "Let me see"; X.9 "Mimi" kept untranslated; X.32's
vocative-comma imperative) and one is offered for confirmation (Long's comma
after "afraid" kept inside the X.25 dagger clause). This agent does not review
its own draft and has not started Book XI.
