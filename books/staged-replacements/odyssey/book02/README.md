# The Odyssey, Book 2 — package (**accepted at candidate v2**)

All eight steps of `../WORKFLOW.md` are done for Book 2. Round 1 of independent
review returned *Accept after corrections* with **zero substantive findings**;
every paragraph-level finding was applied, minor and optional alike; the four
records findings were answered outside the text; the corrected Book was read
straight through; and acceptance is recorded in `ACCEPTANCE.md`.

**Accepted file: `candidate-v2.json`**, sha256
`71816de3e761932c43a5bc3d5699e5dd2cb8811d0024b1048ca17e76b3445126`.

`candidate-v1.json` is **frozen** at
`2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea` and is the
record of what round 1 reviewed (**D10**); so are `candidate-v1-readable.md`
and the twelve packets, which are deliberately **not** regenerated.

**Step 1 was re-done from scratch for this Book, not inherited from Book 1.**
`../scripts/verify_source_book2.py` reconstructs Book 2 from the raw Project
Gutenberg #1727 text by a rule devised here and audited against the raw lines
before it was trusted, then diffs against the staged original: **35 of 35
paragraphs byte-identical, zero diffs, 4,184 words compared word-for-word.**
Method, audit, the two things the audit caught, and two negative controls are
in `continuity.md` and `provenance.json`.

**Name forms are the Greek ones** (`../GLOSSARY.md`). Book 2 is the first Book
drafted under that decision from the start rather than remapped afterwards.

## Files

1. `source-book2.json` — Book 2 extracted from
   `app/public/data/editions/odyssey-original-en.json` by `chapter.number
   == 2`, 35 paragraphs, byte-identical to the served original, and keeping
   Butler's own chapter title.
2. `candidate-v2.json` — **the accepted modern-English text**, 35 paragraphs
   one-to-one with the source, same schema (`number`, `title`, `paragraphs`),
   with the chapter title mapped to the Greek form.
   `candidate-v2-readable.md` is the same text with `B02-Pnnn` IDs outside the
   prose. `changes-v1-to-v2.md` lists every change by paragraph ID against the
   finding it answers, with a recorded reason for each of the eight optional
   findings and for each of the four records findings.
3. `candidate-v1.json` / `candidate-v1-readable.md` — **frozen**, never
   edited. The record of what round 1 reviewed.
3b. `review/findings-v1.md`, `review/README.md` — round 1, by an independent
   reviewer session that did not draft the candidate.
3c. `ACCEPTANCE.md` — the acceptance record: hashes, rounds applied, the flow
   read, the retention measure, and what remains open.
4. `continuity.md` — the source-verification rule and audit, names met in
   Book 2, the recurring formulas fixed here (including four carried over
   from accepted Book 1), the per-paragraph decisions, the word-ratio note,
   and the base-text defects.
5. `provenance.json` — branch, hashes, the verification record, word counts,
   naming and punctuation, base-text defects, generation setting.
6. `review-packets/packet-01.md … packet-12.md` — twelve packets (11×3 +
   1×2 = 35), each with one paragraph of context before and after marked
   `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus
   the v1 hash.

## Mechanical checks

```bash
cd books/staged-replacements/odyssey
python3 - <<'PY'
import json, hashlib, re
src  = json.load(open('book02/source-book2.json'))
v1   = json.load(open('book02/candidate-v1.json'))
cand = json.load(open('book02/candidate-v2.json'))
orig = json.load(open('../../../app/public/data/editions/odyssey-original-en.json'))
ch   = next(c for c in orig['chapters'] if c['number'] == 2)

# --- source integrity and alignment -----------------------------------------
assert src['paragraphs'] == ch['paragraphs'], 'source extraction not byte-identical'
assert src['title'] == ch['title'], 'source title not byte-identical'
assert len(cand['paragraphs']) == len(v1['paragraphs']) == len(src['paragraphs']) == 35
assert cand['title'] == ch['title'].replace('Minerva', 'Athena'), 'candidate title not mapped'
assert hashlib.sha256(open('book02/candidate-v1.json','rb').read()).hexdigest() == \
    '2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea', 'v1 not frozen'
assert hashlib.sha256(open('book02/candidate-v2.json','rb').read()).hexdigest() == \
    '71816de3e761932c43a5bc3d5699e5dd2cb8811d0024b1048ca17e76b3445126', 'v2 hash'

# --- packets still cover v1 exactly, verbatim -------------------------------
man = json.load(open('book02/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'B02-P{i:03d}' for i in range(1, 36)], 'manifest coverage failed'
for e in man['packets']:
    t = open('book02/' + e['packet'], encoding='utf-8').read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and v1['paragraphs'][k] in t, f'{pid} not verbatim'

for v, mdp in ((v1, 'book02/candidate-v1-readable.md'), (cand, 'book02/candidate-v2-readable.md')):
    md = open(mdp, encoding='utf-8').read()
    assert all(p in md for p in v['paragraphs']), f'{mdp} does not match its JSON'

ps = cand['paragraphs']
# --- exactly the 15 paragraphs the change list names differ from v1 ---------
assert [i + 1 for i in range(35) if ps[i] != v1['paragraphs'][i]] == \
    [1, 2, 4, 6, 7, 9, 10, 11, 13, 15, 20, 23, 26, 31, 34], 'v1→v2 diff set'
joined = '\n'.join(ps)
def n(w): return len(re.findall(r'\b' + w + r'\b', joined))

# --- names: every count matches the source, and every hazard holds ----------
s = '\n'.join(src['paragraphs'])
def sn(w): return len(re.findall(r'\b' + w + r'\b', s))
assert (n('Odysseus'), n('Athena'), n('Zeus'), n('Eurycleia')) == (17, 8, 6, 2)
assert (sn('Ulysses'), sn('Minerva'), sn('Jove'), sn('Euryclea')) == (17, 8, 6, 2)
for roman in ('Ulysses','Minerva','Jove','Neptune','Mercury','Saturn','Diana','Euryclea'):
    assert n(roman) == 0, f'Roman form survives: {roman}'
assert n('Ops') == 1 and 'daughter of Ops, son of Pisenor' in joined   # hazard 1
assert n('Rhea') == 0 and n('Helios') == 0
assert n('Ilius') == 1 and n('Troy') == 1      # Butler's own two forms, both kept
assert n('Mycene') == 1 and n('Mycenae') == 0  # D13: the woman; the city (Bk 3, Bk 21) is Mycenae
assert 'Tyro, Alcmena, Mycene' in joined

# --- punctuation and spelling standards -------------------------------------
assert "'" not in joined and '"' not in joined, 'ASCII quote survives'
assert sum(p.count('“') for p in ps) == sum(p.count('“') for p in src['paragraphs']) == 29
assert sum(p.count('”') for p in ps) == sum(p.count('”') for p in src['paragraphs']) == 28
unbal = [i for i, p in enumerate(ps) if p.count('“') != p.count('”')]
assert unbal == [5], 'D4: the only unbalanced paragraph must be B02-P006'
assert src['paragraphs'][5].count('“') != src['paragraphs'][5].count('”')
assert ps[6].lstrip().startswith('“'), 'D4: B02-P007 must open with its own mark'
assert ps[5].rstrip().endswith('’'), "Butler closes Penelope's inner quotation"
for brit in ('grey', 'honour', 'harbour', 'marvelled', 'woollen', 'travelled'):
    assert n(brit) == 0, f'British spelling survives: {brit}'
assert 'gray-eyed daughter of Zeus' in ps[33]

# --- D12 class A: the bracket mark dropped, Butler's supplied words kept ----
assert '[' not in joined and ']' not in joined, "Butler's bracket mark must be dropped"
assert 'councils: do not hold back, my friends' in ps[3], "…words kept, colon supplied"
assert 'the Erinyes—the spirits of vengeance—to avenge her' in ps[7]

# --- formulas shared with Book 1, now at its candidate-v3 -------------------
b1 = json.load(open('book01/candidate-v3.json'))['paragraphs']
for frag in ('feeding off one man',
             'will settle the account with you in full',
             'there will be no one to avenge you',
             'a crew of twenty men',
             'raise a mound to his memory',
             'all the marriage gifts a beloved daughter may expect',   # 11.1
             'in low spirits',
             'outer court'):
    assert any(frag in p for p in b1), f'not in Book 1 v3: {frag}'
    assert any(frag in p for p in ps), f'not in Book 2 v2: {frag}'
assert 'deserves' not in joined and not any('deserves' in p for p in b1)

# --- no archaism survived ----------------------------------------------------
# A regression guard, NOT a check (records finding R3): an assert-list of exact
# dead words cannot catch a dead word respelled — v1 asserted 'whereon' and
# 'whereupon' walked through it. 'whereupon' added; 'comeliness' removed,
# because finding 1.1 restores it deliberately at B02-P001.
low = joined.lower()
for dead in ('thereon','ere long','whereon','whereupon','spunging','victuals',
             'naughtiness','prating','hither and thither','abode','save only',
             'bade','moodily','endowed','tambour','singlehanded','unblended',
             'steeds','amongst','bethought','fuddle'):
    assert dead not in low, f'archaism survives: {dead}'
assert 'comely feet' in ps[0] and 'divine comeliness of presence' in ps[0]   # 1.1
assert not any(ps[i] == src['paragraphs'][i].replace('\n', ' ') for i in range(35))

# --- the corrections landed --------------------------------------------------
assert 'land of noble horses' in ps[1] and 'of infinite experience' in ps[1]   # 2.1 2.2
assert 'the most aggrieved' in ps[3] and 'My grievance' in ps[3]               # 4.1
assert 'sacrificing our oxen, sheep and fat goats' in ps[3]                    # 4.2
assert 'sailing side by side' in ps[8]                                         # 9.1
assert 'better for them, for I am not prophesying' in ps[9]                    # 10.1
assert 'these omens myself far better' in ps[10]                               # 11.2
assert 'He then spoke to them plainly and in all honesty' in ps[12]            # 13.1
assert 'fight with many over his food' in ps[14]                               # 15.1
assert 'were to set upon us' in ps[14]                                         # 15.2
assert 'let his father’s old friends' in ps[14] and 'speed the boy' in ps[14]  # 15.3
assert 'at once and laughed as he took his hand' in ps[19]                     # 20.1
assert 'or else from Sparta, where' in ps[22]                                  # 23.1
assert 'apart from what you are keeping' in ps[25]                             # 26.1
assert 'Next she went to the house' in ps[30]                                  # 31.1
assert 'brought the things as he told them' in ps[33]                          # 34.2
assert 'deep blue waves, and then Telemachus' in ps[33]                        # 34.1
assert ps[0].startswith('When Dawn, the rosy-fingered child of morning, appeared, '
                        'Telemachus rose and dressed.')                        # 1.2
assert 'I would not have skill in needlework' in ps[5]                         # 6.1
assert 'so long shall we go on eating up your estate' in ps[6]                 # 7.1

# --- alignment, newlines, ratio ---------------------------------------------
assert not any('\n' in p for p in ps), 'candidate paragraph contains a newline'
sw = sum(len(p.split()) for p in src['paragraphs'])
cw = sum(len(p.split()) for p in ps)
ratio = cw / sw
assert 0.90 <= ratio <= 1.10, f'word ratio {ratio:.4f} outside 0.90-1.10'

# --- the retention measure: Butler tokens carried over unchanged, in order --
import difflib
NM = {'ulysses':'odysseus','minerva':'athena','jove':'zeus','neptune':'poseidon',
      'mercury':'hermes','saturn':'cronus','diana':'artemis','euryclea':'eurycleia'}
def toks(t): return [NM.get(w, w) for w in re.findall(r'[a-z]+', t.replace('\n',' ').lower())]
st, ct = toks(' '.join(src['paragraphs'])), toks(' '.join(ps))
ret = sum(b.size for b in difflib.SequenceMatcher(a=st, b=ct, autojunk=False).get_matching_blocks()) / len(st)
assert abs(ret - 0.902) < 0.001, f'retention {ret:.3f}'

print('OK — 35 paragraphs, coverage exact, packets verbatim, names and hazards held, ratio', f'{ratio:.4f}')
print('OK — accepted at v2: 15 paragraphs differ from v1, Butler token retention', f'{ret:.3f}')
for f in ('book02/source-book2.json','book02/candidate-v1.json','book02/candidate-v2.json',
          '../../../app/public/data/editions/odyssey-original-en.json'):
    print(hashlib.sha256(open(f,'rb').read()).hexdigest(), f)
PY
```

Expected:

```
OK — 35 paragraphs, coverage exact, packets verbatim, names and hazards held, ratio 1.0002
OK — accepted at v2: 15 paragraphs differ from v1, Butler token retention 0.902
3cc4f38c171e0e1d72ad741e75c745b31c7f330dfb3ed79910832ae4d04714c7  book02/source-book2.json
2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea  book02/candidate-v1.json
71816de3e761932c43a5bc3d5699e5dd2cb8811d0024b1048ca17e76b3445126  book02/candidate-v2.json
da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07  ../../../app/public/data/editions/odyssey-original-en.json
```

And the independent source check, which prints its whole audit:

```bash
cd books/staged-replacements/odyssey
python3 scripts/verify_source_book2.py
# ends: OK — all 35 paragraphs byte-identical, zero diffs; 4184 words compared word-for-word
```

To reproduce the package deterministically — the v1 artefacts from the frozen
candidate text, then v2 from v1:

```bash
cd books/staged-replacements/odyssey
python3 scripts/build_book_package.py 2
python3 scripts/build_book02_v2.py
```

(The build refuses to rebuild Book 1 without `--force`: its `candidate-v1.json`
is frozen at `8316ff76…` and is the record of what its review round reviewed.)

## Next action

Book 2 is accepted and closed. Nothing here is merged, registered or deployed.
Book 3 proceeds in numerical order; see `../00-progress-ledger.md`.

**One thing carried forward out of Book 2's review and not settled here:**
Butler's **class-C brackets** — passages he marks as afterthoughts or
interpolations — are **open** under decision **D12** and need a coordinator
decision **before Book 4 is drafted**. Books 1–3 contain none.
