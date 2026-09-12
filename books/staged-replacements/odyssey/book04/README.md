# The Odyssey, Book 4 — package (frozen at candidate v1)

Steps 1–3 of `../WORKFLOW.md` are done for Book 4, and the step-4 artefacts
(27 packets, manifest, review instructions) are built. **Step 4 itself — the
independent review — has not run**: `candidate-v1.json` is frozen and the
packets are pushed. Book 4 was **not** self-reviewed.

| | |
|---|---|
| Candidate | `candidate-v1.json`, sha256 `9c7d54af4bc6e32fefe5d3946a08565820b76d3d3c58a9fc45ec138b912e6553` — **frozen** |
| Source | `source-book4.json`, sha256 `b4899064632724ca5847868fc28f4261a1693293405af0280911e508889eec70` |
| Paragraphs | 81 — the longest Book the package has drafted, more than Books 1 and 2 together |
| Words | 8,041 against 8,042 — **ratio 0.9999** |
| Butler token retention | **0.960** — the package's highest, and recorded as a **risk**, not a pass |
| Packets | 27, coverage `B04-P001`…`B04-P081` |

**Book 4 was blocked until Book 3's round 1 settled D12's class C.** It is
unblocked, and it carries the poem's **first two class-C brackets**:
B04-P001 (PG 1552, footnote 36, **never closed in the base text**) and
B04-P052 (PG 2067–2070, footnote 49). Mark dropped, every word kept, nothing
recast across the boundaries, both recorded with Butler's notes quoted —
`continuity.md` §3.

## Step 1 — the source, verified by a fourth kind of rule

`../scripts/verify_source_book4.py` uses **no heading, no Book number, no
`FOOTNOTES:` line and no digit** to find Book 4. It takes two needles out of
the **served** text itself, requires **each to occur exactly once** in PG
#1727, cuts paragraphs mechanically **with the apparatus still in** (so 81 is
an *output*), and classifies every difference **before** removing anything.

**81 of 81 paragraphs byte-identical after removing only the 14 classified
footnote markers; 8,042 words compared word for word; 0 mismatches.** Four
negative controls fail as they should. Two classified non-marker differences,
neither a word: B04-P001's Book-opening capitalization, and **marker 44, which
is space-set rather than glued** — the case Book 2's drafter wrote a clause
for and recorded as a no-op there. It fires here.

And one thing the check reports for the drafter rather than failing on:
marker 48's removal left a **line beginning with a space** in the served
B04-P050, which flattens to a doubled space. The candidate prints one.

## Files

1. `source-book4.json` — Book 4 extracted by `chapter.number == 4`, 81
   paragraphs, byte-identical to the served original, Butler's own title.
2. `candidate-v1.json` — the modern-English candidate, 81 paragraphs
   one-to-one with the source. **Frozen**; corrections from review go to
   `candidate-v2.json` (**D10**).
3. `candidate-v1-readable.md` — the same text with `B04-Pnnn` IDs outside the
   prose.
4. `continuity.md` — the verification rule and what it caught; the names,
   including the **three new rows** the closed table gains here; D12 class C;
   the formulas, inside the Book and carried from accepted Books; the
   paragraph-level decisions; the retention figure treated as a risk; D4 at
   the scale of a whole narrative; and the base-text defect.
5. `provenance.json` — branch, hashes, verification record, word counts,
   naming, punctuation, defects, generation setting.
6. `review-packets/packet-01.md … packet-27.md` — 27 packets (27×3 = 81), each
   with one paragraph of context before and after marked `CONTEXT ONLY`. No
   self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim,
   including the **five things put to the reviewer explicitly**.
8. `manifest.json` — packet → paragraph-ID map with a coverage check, plus the
   v1 hash.

## Mechanical checks

```bash
cd books/staged-replacements/odyssey
python3 - <<'PY'
import json, hashlib, re, difflib
src  = json.load(open('book04/source-book4.json'))
cand = json.load(open('book04/candidate-v1.json'))
orig = json.load(open('../../../app/public/data/editions/odyssey-original-en.json'))
ch   = next(c for c in orig['chapters'] if c['number'] == 4)

assert src['paragraphs'] == ch['paragraphs'], 'source extraction not byte-identical'
assert src['title'] == ch['title'] == cand['title'], 'title mismatch'
assert len(cand['paragraphs']) == len(src['paragraphs']) == 81, 'paragraph count'
assert hashlib.sha256(open('book04/candidate-v1.json','rb').read()).hexdigest() == \
    '9c7d54af4bc6e32fefe5d3946a08565820b76d3d3c58a9fc45ec138b912e6553', 'v1 hash'

man = json.load(open('book04/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'B04-P{i:03d}' for i in range(1, 82)], 'manifest coverage failed'
assert len(man['packets']) == 27
for e in man['packets']:
    t = open('book04/' + e['packet'], encoding='utf-8').read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t, f'{pid} not verbatim'
md = open('book04/candidate-v1-readable.md', encoding='utf-8').read()
assert all(p in md for p in cand['paragraphs']), 'readable md does not match the JSON'

ps = cand['paragraphs']
joined = '\n'.join(ps)
s = '\n'.join(p.replace('\n', ' ') for p in src['paragraphs'])
def n(w, t=None):  return len(re.findall(r'\b' + w + r'\b', joined if t is None else t))

# --- names: every count matches the source, including the three new rows ----
for greek, roman, k in (('Odysseus','Ulysses',18), ('Zeus','Jove',11), ('Athena','Minerva',7),
                        ('Poseidon','Neptune',3), ('Aphrodite','Venus',2), ('Artemis','Diana',1),
                        ('Hera','Juno',1), ('Hephaestus','Vulcan',1), ('Eurycleia','Euryclea',1)):
    assert n(greek) == n(roman, s) == k, f'name census: {greek}'
for roman in ('Ulysses','Minerva','Jove','Neptune','Mercury','Saturn','Diana',
              'Euryclea','Venus','Juno','Vulcan'):
    assert n(roman) == 0, f'Roman form survives: {roman}'
assert n('Rhea') == 0 and n('Helios') == 0 and n('Cronos') == 0   # hazard 1: Ops -> Rhea
assert n('Idothea') == 1 and n('Eidothea') == 0        # D8 silent: the Cast has no name
assert n('Diomed') == 2 and n('Diomedes') == 0         # flagged, not corrected
assert n('Apollo') == 1 and n('Hades') == 1 and n('Proteus') == n('Proteus', s)
# the ONE deliberate break in the heaven census, at B04-P034
assert n('heaven') == 15 and n('heaven', s) == 16
assert 'the middle of the sky' in ps[33] and 'mid heaven' in src['paragraphs'][33]

# --- D7 possessives ---------------------------------------------------------
for poss in ('Odysseus’s','Achilles’s','Telemachus’s','Aegisthus’s','Hephaestus’s','Zeus’s'):
    assert poss in joined, f'D7: {poss}'
assert not re.search('(Odysseus|Achilles|Telemachus|Aegisthus|Hephaestus|Zeus)’(?!s)', joined)

# --- punctuation and spelling ----------------------------------------------
assert "'" not in joined and '"' not in joined, 'ASCII quote survives'
assert sum(p.count('“') for p in ps) == sum(p.count('“') for p in src['paragraphs']) == 71
assert sum(p.count('”') for p in ps) == sum(p.count('”') for p in src['paragraphs']) == 50
unbal = [i + 1 for i, p in enumerate(ps) if p.count('“') != p.count('”')]
assert unbal == [i + 1 for i, p in enumerate(src['paragraphs'])
                 if p.count('“') != p.count('”')] == list(range(28, 49)), 'D4 x21'
# B04-P028 opens with narration and the speech starts inside it; the twenty
# CONTINUING paragraphs each open their own mark, as the source does
for i in range(28, 48):
    assert ps[i].lstrip().startswith('“'), f'D4: B04-P{i+1:03d} must open its own mark'
    assert src['paragraphs'][i].lstrip().startswith('“')
# the B04-P040 repair: one opening single mark more than the source, and no other
assert sum(p.count('‘') for p in ps) == sum(p.count('‘') for p in src['paragraphs']) + 1 == 25
assert ps[39].startswith('“‘Then,’ he said,') and src['paragraphs'][39].startswith('“Then,’')
for brit in ('grey','honour','harbour','marvelled','woollen','travelled','travelling','favour',
             'neighbour','colour','sceptre','towards','armour','splendour','humour','levelled'):
    assert n(brit) == 0, f'British spelling survives: {brit}'

# --- D12 class C, the poem's first two instances ----------------------------
assert '[' not in joined and ']' not in joined, "the bracket mark must be dropped"
assert 'and found him in his own house, feasting with his many clansmen' in ps[0]
assert 'and guests kept coming to the king’s house' in ps[51]
assert 'in the courts.' in ps[51]                     # PG 2070's close, all four lines kept
assert '[and found him' in src['paragraphs'][0] and '[and guests' in src['paragraphs'][51]
assert src['paragraphs'][0].count(']') == 0           # PG 1552 never closes

# --- formulas that repeat inside this Book ---------------------------------
assert joined.count('they laid their hands on the good things that were before them') == 2
assert joined.count('my brave and lion-hearted husband, who had every good quality under '
                    'heaven, and whose name was great over all Hellas and middle Argos') == 2
assert joined.count('I will make it all quite clear to you') == 2
assert joined.count('for night was falling, and camped down on the beach') == 2
assert joined.count('thought of another matter') == 2          # Butler's 'bethought her'
assert joined.count('the heaven-fed stream of Egypt') == 2

# --- formulas carried from the accepted Books ------------------------------
b1 = json.load(open('book01/candidate-v3.json'))['paragraphs']
b2 = json.load(open('book02/candidate-v3.json'))['paragraphs']
b3 = json.load(open('book03/candidate-v2.json'))['paragraphs']
assert 'poured it into a silver basin so they could wash their hands' in ps[5] \
   and any('poured it into a silver basin so they could wash their hands' in p for p in b1)
assert ps[24].startswith('When Dawn, the rosy-fingered child of morning, appeared') \
   and any(p.startswith('When Dawn, the rosy-fingered child of morning, appeared') for p in b2 + b3)
assert 'his shoulders' in ps[24] and any('his shoulder,' in p for p in b2)   # Butler's difference
assert 'bear it in mind now in my favor and tell me truly all' in ps[26] \
   and any('bear it in mind now in my favor and tell me truly all' in p for p in b3)
assert 'out of any pity for myself' in ps[26] and any('out of any pity for me,' in p for p in b3)
assert 'raised a mound to the memory of Agamemnon' in ps[47]
assert 'the suitors grew loud throughout the covered gallery' in ps[68] \
   and any('the suitors grew loud throughout the covered gallery' in p for p in b1)
assert joined.count('mixing-bowl') == 2 and 'mixing bowl' not in joined
assert 'tell me truly' in ps[40] and 'tell me true' not in joined      # the Book 3 row
assert not re.search(r'\w+- \w+', joined), 'a hyphenated compound was split by a rewrap'
assert n('hecatomb') == 0 and n('hecatombs') == 0            # D3, three times

# --- no archaism survived (the guard as strengthened at records finding R5) --
low = joined.lower()
for dead in (r'\bthereon\b', r'\bwhereon\b', r'\bwhereupon\b', r'\bere long\b', r'\bhaply\b',
             r'\babode\b', r'\bbade\b', r'\bvictuals\b', r'\bhither\b', r'\bthither\b',
             r'\bhereabouts\b', r'\bvouchsafe\b', r'\bshewed\b', r'\baforetime\b',
             r'\bamongst\b', r'\bbethought\b', r'\bnothing loth\b', r'\btwelvemonth\b',
             r'\btwelve-month\b', r'\bin course of time\b', r'\bambuscade\b', r'\bstaid\b',
             r'\bforenoon\b', r'\bprevaricate\b', r'\bmethinks\b', r'\bperadventure\b',
             r'\bthou\b', r'\bthy\b', r'\bthee\b', r'\bon this\b',
             # inverted pronoun speech tags, which the accepted Books never use
             r'”\s*(said|replied|answered) (he|she|i)\b', r'\b(said|replied) (he|she|i),'):
    assert not re.search(dead, low), f'archaism or superseded form survives: {dead}'
# SEVEN paragraphs are byte-identical to Butler, examined one by one and left:
# they are plain modern English in the source. The list is asserted exactly, so
# a later edit cannot silently add an eighth. See continuity.md section 6.
assert [i + 1 for i in range(81)
        if ps[i] == ' '.join(src['paragraphs'][i].split())] == [39, 54, 61, 63, 70, 79, 80]

# --- alignment, whitespace, ratio, retention -------------------------------
assert not any('\n' in p for p in ps), 'candidate paragraph contains a newline'
assert not any('  ' in p for p in ps), 'doubled space in the candidate'
# the served B04-P050 carries marker 48's artefact: a line that BEGINS with a
# space, which becomes a doubled space the moment the paragraph is flattened
assert '\n None of our islands' in src['paragraphs'][49]
assert '  ' in src['paragraphs'][49].replace('\n', ' ')
sw = [len(p.split()) for p in src['paragraphs']]
cw = [len(p.split()) for p in ps]
ratio = sum(cw) / sum(sw)
assert abs(ratio - 0.9999) < 0.0005 and 0.90 <= min(c/s for c, s in zip(cw, sw)) <= 1.10

NM = {'ulysses':'odysseus','minerva':'athena','jove':'zeus','neptune':'poseidon',
      'mercury':'hermes','saturn':'cronus','diana':'artemis','euryclea':'eurycleia',
      'venus':'aphrodite','juno':'hera','vulcan':'hephaestus'}
def toks(t): return [NM.get(w, w) for w in re.findall(r'[a-z]+', t.replace('\n',' ').lower())]
a, b = toks(s), toks(joined)
ret = sum(x.size for x in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_matching_blocks()) / len(a)
assert abs(ret - 0.960) < 0.001, f'retention {ret:.3f}'

print('OK — 81 paragraphs, coverage exact, packets verbatim, names and hazards held')
print('OK — ratio', f'{ratio:.4f}', '| Butler token retention', f'{ret:.3f}',
      '| D4 unbalanced paragraphs', len(unbal))
for f in ('book04/source-book4.json','book04/candidate-v1.json',
          '../../../app/public/data/editions/odyssey-original-en.json'):
    print(hashlib.sha256(open(f,'rb').read()).hexdigest(), f)
PY
```

Expected:

```
OK — 81 paragraphs, coverage exact, packets verbatim, names and hazards held
OK — ratio 0.9999 | Butler token retention 0.960 | D4 unbalanced paragraphs 21
b4899064632724ca5847868fc28f4261a1693293405af0280911e508889eec70  book04/source-book4.json
9c7d54af4bc6e32fefe5d3946a08565820b76d3d3c58a9fc45ec138b912e6553  book04/candidate-v1.json
da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07  ../../../app/public/data/editions/odyssey-original-en.json
```

And the source check, which prints its whole audit:

```bash
python3 scripts/verify_source_book4.py
# ends: OK — the served Book 4 is Butler's text. …
```

To reproduce the package deterministically:

```bash
python3 scripts/build_book_package.py 4
```

## Next action

Independent review of `candidate-v1.json` (step 4), by a separate reviewer
session, following `review-instructions.md`. Findings go under `book04/review/`.
On findings: `candidate-v2.json` via a change script in the established
pattern, verification, flow read, `ACCEPTANCE.md` — steps 5–8.

**The first thing to put to that reviewer is the retention figure, 0.960.** It
is the highest in the package, the drafter says so rather than defending it,
and `continuity.md` §6 sets out the evidence on both sides — including the
archaism-density measure (Book 4 is 3.98 dead forms per 1,000 words against
Book 3's 7.15) and the fact that Book 1 has the lowest density of the four and
the lowest retention, so the source does not explain the number by itself.
