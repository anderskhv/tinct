# The Odyssey, Book 1 — package (**accepted at candidate v2**)

All eight steps of `../WORKFLOW.md` are done for Book 1. Round 1 of
independent review returned *Accept after corrections*; every finding was
applied; the corrected book was read straight through; and acceptance is
recorded in `ACCEPTANCE.md`.

**Accepted file: `candidate-v2.json`**, sha256
`f28a13264288079781a8c8c6cf044ae41d288847dc5d7f23378851a44ba7df45`.

Step 1 confirmed the source directly against Project Gutenberg #1727
(Samuel Butler, 1900): 32 paragraphs, byte-identical opening, no boilerplate
(`../PROVENANCE.md`). The round-1 reviewer re-verified it independently, by
its own reconstruction of PG lines 376–740 built from PG's numbered
footnote-entry list rather than from the build's own rule — 32 of 32
paragraphs byte-identical, zero diffs.

**Name forms are Greek** (Odysseus, Athena, Zeus, Poseidon, Hermes, Cronus),
per the reviewer's standing finding **S1**, which reversed ledger decision
**D1**. `candidate-v1.json` used Butler's Roman forms, correctly under the
decision then in force. See `../GLOSSARY.md`.

## Files

1. `source-book1.json` — Book 1 extracted from
   `app/public/data/editions/odyssey-original-en.json` by `chapter.number
   == 1`, 32 paragraphs, byte-identical to the served original.
2. `candidate-v2.json` — **the accepted modern-English text**, 32 paragraphs
   one-to-one with the source, same schema (`number`, `title`, `paragraphs`).
3. `candidate-v2-readable.md` — the same text with `B01-Pnnn` IDs outside the
   prose.
4. `candidate-v1.json` / `candidate-v1-readable.md` — **frozen**, never
   edited, in Butler's Roman forms. The record of what round 1 reviewed.
5. `changes-v1-to-v2.md` — every change from v1 to v2 by paragraph ID against
   the finding it answers, plus how each name-mapping hazard was handled and
   why each optional finding was applied.
6. `review/findings-v1.md`, `review/README.md` — round 1, by an independent
   reviewer session that did not draft the candidate.
7. `continuity.md` — names met in Book 1, paragraph-level decisions (v1 and
   v2 marked), the preserved unclosed-quotation convention, and unresolved
   source issues including the B01-P014 crux.
8. `ACCEPTANCE.md` — the acceptance record: hashes, rounds applied, flow
   read, what remains open.
9. `provenance.json` — branch, all hashes, word counts, naming and
   punctuation decisions, generation setting.
10. `review-packets/packet-01.md … packet-11.md` — eleven packets (10×3 +
    1×2 = 32), each with one paragraph of context before and after marked
    `CONTEXT ONLY`. Built from v1 and **not regenerated**; see `manifest.json`.
11. `review-instructions.md` — the instructions the round-1 reviewer was
    given, verbatim, with a dated note marking the naming paragraph
    superseded.
12. `manifest.json` — packet → paragraph-ID map with a coverage check, plus
    the v1 and v2 hashes.

## Mechanical checks

```bash
cd books/staged-replacements/odyssey
python3 - <<'PY'
import json, hashlib, re
src  = json.load(open('book01/source-book1.json'))
v1   = json.load(open('book01/candidate-v1.json'))
v2   = json.load(open('book01/candidate-v2.json'))
orig = json.load(open('../../../app/public/data/editions/odyssey-original-en.json'))
ch   = next(c for c in orig['chapters'] if c['number'] == 1)

# --- source integrity and alignment -----------------------------------------
assert src['paragraphs'] == ch['paragraphs'], 'source extraction not byte-identical'
assert len(v1['paragraphs']) == len(v2['paragraphs']) == len(src['paragraphs']) == 32
assert hashlib.sha256(open('book01/candidate-v1.json','rb').read()).hexdigest() == \
    '8316ff76cdbb5d82a572bc58b9388dc76f8ab70deddec6e0dbf75f406b510db9', 'v1 not frozen'

# --- packets still cover v1 exactly, verbatim -------------------------------
man = json.load(open('book01/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'B01-P{i:03d}' for i in range(1, 33)], 'manifest coverage failed'
for e in man['packets']:
    t = open('book01/' + e['packet'], encoding='utf-8').read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and v1['paragraphs'][k] in t, f'{pid} not verbatim'

# --- both readable copies match their JSON ----------------------------------
for v, md in ((v1, 'book01/candidate-v1-readable.md'), (v2, 'book01/candidate-v2-readable.md')):
    text = open(md, encoding='utf-8').read()
    assert all(p in text for p in v['paragraphs']), f'{md} does not match its JSON'

cand = v2['paragraphs']
joined = '\n'.join(cand)
def n(w): return len(re.findall(r'\b' + w + r'\b', joined))

# --- the name mapping, and every hazard -------------------------------------
assert n('Odysseus') == 17 and n('Athena') == 12 and n('Zeus') == 6
assert n('Poseidon') == 6 and n('Hermes') == 3 and n('Cronus') == 2
for roman in ('Ulysses','Minerva','Jove','Neptune','Mercury','Saturn','Diana','Euryclea'):
    assert n(roman) == 0, f'Roman form survives: {roman}'
assert n('Ops') == 1 and 'daughter of Ops, son of Pisenor' in joined   # hazard 1
assert n('Rhea') == 0                                                  # hazard 1
assert joined.count('son of Cronus, king of kings') == 2 and n('Cronos') == 0   # hazard 2
assert len(re.findall('Odysseus’s', joined)) == 3                 # hazard 3
assert not re.search('Odysseus’(?!s)', joined)                    # hazard 3
assert 'Dulichium, Same, and wooded Zacynthus' in joined               # hazard 4
assert n('heaven') == 10                                               # hazard 5
assert n('Hyperion') == 1 and n('Helios') == 0                         # hazard 6
assert n('Eurycleia') == 1

# --- punctuation and spelling standards -------------------------------------
assert "'" not in joined and '"' not in joined, 'ASCII quote survives'
assert joined.count('’') == 22
assert sum(p.count('“') for p in cand) == 30
assert sum(p.count('”') for p in cand) == 29
assert not cand[17].rstrip().endswith('”')     # D4 preserved
assert cand[18].lstrip().startswith('“')       # D4 preserved
assert 'woolen' in cand[31] and 'woollen' not in joined
assert 'draughts' in cand[7]

# --- the corrections landed --------------------------------------------------
assert 'wrongfully' in cand[3]                       # 4.1  substantive
assert 'blinding the eye of Polyphemus' in cand[5]   # 6.1  substantive
assert 'give your mother in marriage again' in cand[18]   # 19.1 substantive
assert 'his son Polyphemus' not in joined and 'let your mother marry' not in joined
assert 'longer legs rather than a longer purse' in cand[12]      # 13.1
assert 'the sufferings Athena had laid' in cand[22]                # 23.1 (a)
assert 'create the sufferings they sing of' in cand[24]            # 23.1 (b)
assert joined.count('sufferings') == 3   # the third is Butler's own word at B01-P005
assert 'hardships' not in joined and 'misfortunes' not in joined
assert 'nothing but dismay' in cand[16] and 'end there with grief' in cand[16]  # 17.1
assert cand[28].count('chief') == 3 and 'master' not in cand[28]  # 29.1
assert 'you shall be master in your own house' in cand[29]        # 29.1/30.1 contrast
assert 'stout and sturdy and strong' in cand[7]                   # 8.1
assert 'a cloth of damask' in cand[9]                             # 10.1
assert 'outer court' in cand[31]                                  # 32.1
assert 'a great sacrifice of sheep and oxen' in cand[2]           # 3.1
assert 'hundred sheep' not in joined

# --- alignment, newlines, ratio ---------------------------------------------
assert not any('\n' in p for p in cand), 'candidate paragraph contains a newline'
sw = sum(len(p.split()) for p in src['paragraphs'])
cw = sum(len(p.split()) for p in cand)
ratio = cw / sw
assert ratio >= 0.90, f'overall word ratio {ratio:.4f} below 0.90'

print('OK — 32 paragraphs, coverage exact, packets verbatim, all hazards held, ratio', f'{ratio:.4f}')
for f in ('book01/source-book1.json','book01/candidate-v1.json','book01/candidate-v2.json',
          '../../../app/public/data/editions/odyssey-original-en.json'):
    print(hashlib.sha256(open(f,'rb').read()).hexdigest(), f)
PY
```

Expected:

```
OK — 32 paragraphs, coverage exact, packets verbatim, all hazards held, ratio 0.9462
fd364c78c4e87d0c93e529aeaa42e13bc3677f21cc3b7143d1d43df76e64f1c4  book01/source-book1.json
8316ff76cdbb5d82a572bc58b9388dc76f8ab70deddec6e0dbf75f406b510db9  book01/candidate-v1.json
f28a13264288079781a8c8c6cf044ae41d288847dc5d7f23378851a44ba7df45  book01/candidate-v2.json
da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07  ../../../app/public/data/editions/odyssey-original-en.json
```

To reproduce `candidate-v2.json` from the frozen v1:

```bash
cd books/staged-replacements/odyssey
python3 scripts/build_book01_v2.py
```

## Next action

Book 1 is accepted and closed. Nothing here is merged, registered or
deployed. The next Book proceeds in numerical order per `../WORKFLOW.md`;
see `../00-progress-ledger.md`.
