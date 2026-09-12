# The Odyssey, Book 5 — package (frozen at candidate v1)

Steps 1–3 of `../WORKFLOW.md` are done for Book 5, and the step-4 artefacts
(13 packets, manifest, review instructions) are built. **Step 4 itself — the
independent review — has not run**: `candidate-v1.json` is frozen and the
packets are pushed. Book 5 was **not** self-reviewed.

| | |
|---|---|
| Candidate | `candidate-v1.json`, sha256 `7acc5c346154e7d23c85eaa3c31ef25654600e4e122f455eb93a1bf3737a59cf` — **frozen** |
| Source | `source-book5.json`, sha256 `c84e4bb2924d89250e4a943721703213bba0530c09641b662c93c4a8de02cd57` |
| Paragraphs | 37 |
| Words | 4,660 against 4,666 — ratio **0.999** |
| Butler token retention | **0.94211** |
| **Splitting rate (D17)** | **153 → 189 sentences, +23.5%; sixty-word 9 → 3, 67% broken** |
| Packets | 13, coverage `B05-P001`…`B05-P037` |

**Two numbers, not one.** Book 4's round 1 established that retention alone
cannot tell a modernization from a touch-up: Book 4 v1 satisfied every
mechanical check in the package while breaking one of its source's seventeen
sixty-word sentences. Book 5 therefore reports its splitting rate beside its
retention, and the figures sit inside the accepted band on both axes.

## Step 1 — the source, verified by a sixth kind of rule that never looks for Book 5

`../scripts/verify_source_book5.py` locates the **other twenty-three** served
chapters in PG, each independently and each required to occur **exactly once in
the whole file**, and identifies Book 5 as the **residue**. The region is an
output of twenty-three alignments none of which can see Book 5, which closes
the one failure mode every search-then-verify rule shares: that the thing being
checked chooses where the check looks.

**37 of 37 paragraphs accounted for; 32 byte-identical; five classified
footnote markers (50–54), one of them space-set; 0 letter-case, 0 whitespace
and 0 other differences; 4,666 words compared word for word, 0 mismatches.**
Eight negative controls fire, including two the token rule is blind to by
construction (a merge and a split, run against the blank-line block count).
Chapter 3 cannot participate and the script **asserts why**: its served
paragraph 38 is the A3 defect and occurs nowhere in PG.

## Files

1. `source-book5.json` — Book 5 extracted by `chapter.number == 5`, 37
   paragraphs, byte-identical to the served original, Butler's own title.
2. `candidate-v1.json` — the modern-English candidate, 37 paragraphs
   one-to-one with the source. **Frozen**; corrections go to
   `candidate-v2.json` (**D10**).
3. `candidate-v1-readable.md` — the same text with `B05-Pnnn` IDs outside the
   prose.
4. `continuity.md` — the verification rule and its audit; the one new name row
   and its corrected warrant; the connectives; the compounds; the paragraph
   decisions; the splitting rate and the three sentences left long; and the
   five questions put to the reviewer.
5. `provenance.json` — branch, hashes, verification record, word counts,
   splitting rate, naming, punctuation, generation setting.
6. `word-counts-v1.json` — the 37 per-paragraph word counts, source and
   candidate (records finding **R5** of Book 4's round 1).
7. `review-packets/packet-01.md … packet-13.md` — 13 packets (13×3 = 39 slots,
   37 used), each with one paragraph of context before and after marked
   `CONTEXT ONLY`. No self-review verdicts.
8. `review-instructions.md` — the independent-review instructions, including
   the **five things put to the reviewer explicitly**.
9. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/odyssey
python3 - <<'PY'
import json, hashlib, re, difflib
src  = json.load(open('book05/source-book5.json'))
cand = json.load(open('book05/candidate-v1.json'))
orig = json.load(open('../../../app/public/data/editions/odyssey-original-en.json'))
ch   = next(c for c in orig['chapters'] if c['number'] == 5)

assert src['paragraphs'] == ch['paragraphs'], 'source extraction not byte-identical'
assert src['title'] == ch['title'], 'title mismatch'
assert cand['title'] == 'Book 5 — Calypso—Odysseus reaches Scheria on a raft'
assert len(cand['paragraphs']) == len(src['paragraphs']) == 37, 'paragraph count'
assert hashlib.sha256(open('book05/candidate-v1.json','rb').read()).hexdigest() == \
    '7acc5c346154e7d23c85eaa3c31ef25654600e4e122f455eb93a1bf3737a59cf', 'v1 hash'

man = json.load(open('book05/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'B05-P{i:03d}' for i in range(1, 38)], 'manifest coverage failed'
assert len(man['packets']) == 13
for e in man['packets']:
    t = open('book05/' + e['packet'], encoding='utf-8').read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t, f'{pid} not verbatim'
md = open('book05/candidate-v1-readable.md', encoding='utf-8').read()
assert all(p in md for p in cand['paragraphs']), 'readable md does not match the JSON'

ps = cand['paragraphs']
joined = '\n'.join(ps)
sp = [' '.join(p.split()) for p in src['paragraphs']]
s  = '\n'.join(sp)
def n(w, t=None):  return len(re.findall(r'\b' + w + r'\b', joined if t is None else t))

# --- names: every count matches the source, including the ONE new row --------
for greek, roman, k in (('Odysseus','Ulysses',29), ('Zeus','Jove',12), ('Hermes','Mercury',9),
                        ('Athena','Minerva',6), ('Poseidon','Neptune',6),
                        ('Artemis','Diana',1), ('Demeter','Ceres',1)):
    assert n(greek) == n(roman, s) == k, f'name census: {greek}'
for roman in ('Ulysses','Minerva','Jove','Neptune','Mercury','Saturn','Diana',
              'Euryclea','Venus','Juno','Vulcan','Ceres'):
    assert n(roman) == 0, f'Roman form survives: {roman}'
assert n('Rhea') == 0 and n('Helios') == 0 and n('Cronos') == 0   # hazard 1: Ops -> Rhea
assert n('Ops') == 0 and n('Ops', s) == 0        # the hazard that fires elsewhere is absent here
assert n('Same') == 0 and n('Same', s) == 0      # hazard 4 could not have fired here
for greek in ('Calypso','Tithonus','Telemachus','Penelope','Laertes','Scheria','Orion',
              'Ortygia','Iasion','Styx','Bootes','Oceanus','Amphitrite','Cadmus',
              'Leucothea','Ino','Aegae','Priam','Achilles','Argus','Pieria'):
    assert n(greek) == n(greek, s), f'an already-Greek name moved: {greek}'

# --- D7 possessives ---------------------------------------------------------
assert joined.count('Odysseus’s') == 3 and s.count('Ulysses’ ') == 3
for poss in ('Zeus’s','Calypso’s','Ino’s'):
    assert poss in joined, f'D7: {poss}'
assert not re.search('(Odysseus|Zeus|Calypso|Ino|Achilles)’(?!s)', joined)

# --- D4 does NOT fire in this Book, and the absence is asserted --------------
assert sum(p.count('“') for p in ps) == sum(p.count('“') for p in src['paragraphs']) == 31
assert sum(p.count('”') for p in ps) == sum(p.count('”') for p in src['paragraphs']) == 31
assert [i for i, p in enumerate(ps) if p.count('“') != p.count('”')] == []
assert [i for i, p in enumerate(src['paragraphs']) if p.count('“') != p.count('”')] == []
assert "'" not in joined and '"' not in joined, 'ASCII quote survives'
# D16: Butler prints the period OUTSIDE the closing mark; repaired, totals unchanged
assert 'punish you.”' in ps[10] and 'punish you”.' in sp[10]
# the defective clause at B05-P012: ONE word supplied
assert 'Calypso then went close up to him said' in sp[11]
assert 'Then Calypso went close up to him and said' in ps[11]

# --- D12 and D14 do not fire; D3 does, once --------------------------------
assert '[' not in joined and ']' not in joined and '[' not in s and ']' not in s
assert n('hecatomb') == 0 and n('hecatombs') == 0 and n('hecatombs', s) == 1
assert 'sacrifices or choice offerings' in ps[8]      # D3: no quantity supplied

# --- the heaven census is UNBROKEN in this Book -----------------------------
assert n('heaven') == n('heaven', s) == 4
assert 'How black Zeus is making heaven with his clouds' in ps[22]

# --- connectives: one Butler form, one rendering (Book 4 finding 64.2) ------
assert len(re.findall(r'\bThereon\b', s)) == 3 and n('Thereon') == 0
assert len(re.findall(r'\bOn this\b', s)) == 2 and n('On this') == 0
assert len(re.findall(r'\bwhereon\b', s)) == 2 and n('whereon') == 0
assert len(re.findall(r'\bAt this\b', joined)) == 2       # Butler's On this
assert len(re.findall(r'\bAt that\b', joined)) == 2       # Butler's whereon
assert n('at which') == 0 and n('on which') == 0

# --- formulas carried from the accepted Books ------------------------------
b1 = json.load(open('book01/candidate-v3.json'))['paragraphs']
b4 = json.load(open('book04/candidate-v2.json'))['paragraphs']
assert ps[19].startswith('When Dawn, the rosy-fingered child of morning, appeared')
assert any(p.startswith('When Dawn, the rosy-fingered child of morning, appeared') for p in b4)
assert 'they laid their hands on the good things that were before them' in ps[15]
assert any('they laid their hands on the good things that were before them' in p for p in b1 + b4)
assert joined.count('still undecided') == 2 and s.count('thus in two minds') == 2
assert any('While he was still undecided' in p for p in b4)
assert 'sorely against my will' in ps[30] and any('sorely against his will' in p for p in b4)
assert 'sea shore' in joined and 'seashore' not in joined      # matches accepted Book 4
assert any('sea shore' in p for p in b4)                       # ...and Book 4 has it open

# --- compounds under D15 ---------------------------------------------------
for closed, open_in_src in (('sandalwood','sandal wood'), ('homesickness','home sickness'),
                            ('seagull','sea-gull'), ('goatskin','goat skin'),
                            ('yardarm','yard arm'), ('foothold','foot hold'),
                            ('hillside','hill side'), ('daytime','day time')):
    assert closed in joined and open_in_src in s, f'compound: {closed}'
assert 'well-found ship' in joined and 'well found ship' in s
for kept in ('sea-crows','olive-wood','fire-seed','mid ocean','river bed'):
    assert kept in joined and kept in s, f'Butler setting disturbed: {kept}'

# --- D9, American spelling --------------------------------------------------
for brit in ('grey','honour','harbour','marvelled','woollen','travelled','travelling','favour',
             'neighbour','colour','sceptre','towards','armour','splendour','humour','levelled',
             'skilfully','ploughed'):
    assert n(brit) == 0, f'British spelling survives: {brit}'
assert 'thrice-plowed' in joined and 'thrice-ploughed' in s
assert 'autumn winds' in joined and 'Autumn winds' in s        # seasons are lower case

# --- no archaism survived ---------------------------------------------------
low = joined.lower()
for dead in (r'\bthereon\b', r'\bwhereon\b', r'\bwhereupon\b', r'\bere long\b', r'\bhaply\b',
             r'\babode\b', r'\bbade\b', r'\bvictuals\b', r'\bhither\b', r'\bthither\b',
             r'\bhereabouts\b', r'\bvouchsafe\b', r'\bshewed\b', r'\baforetime\b',
             r'\bamongst\b', r'\bbethought\b', r'\bnothing loth\b', r'\btwelvemonth\b',
             r'\bin course of time\b', r'\bambuscade\b', r'\bstaid\b', r'\bforenoon\b',
             r'\bprevaricate\b', r'\bmethinks\b', r'\bperadventure\b', r'\bthou\b',
             r'\bthy\b', r'\bthee\b', r'\bon this\b', r'\bat which\b', r'\bfor all which\b',
             r'\bforthwith\b', r'\bdeemed\b', r'\bwherefore\b', r'\bharbinger\b',
             r'\bno whit\b', r'\bpolypus\b', r'\bwherein\b', r'\bequitably\b',
             r'\braiment\b', r'\bconvoyed\b', r'\bbattledore\b', r'\bshuttlecock\b',
             r'”\s*(said|replied|answered) (he|she|i)\b', r'\b(said|replied) (he|she|i),'):
    assert not re.search(dead, low), f'archaism or superseded form survives: {dead}'
# and the words that replaced the two dead ones are where they should be
assert 'trimmed them smooth' in ps[19] and 'a sharp adze' in ps[19]
assert 'batting it back and forth between them' in ps[23]
assert 'the suckers of an octopus' in ps[31]
assert 'riverhood' in ps[33] and 'riverhood' in sp[33]          # Butler's coinage, KEPT
assert 'For seventeen days he sailed' in ps[20] and 'Days seven and ten' in sp[20]

# --- NO paragraph is byte-identical to Butler, and the list is asserted -----
assert [i + 1 for i in range(37) if ps[i] == sp[i]] == []

# --- alignment, whitespace, per-paragraph word counts, ratio ----------------
assert not any('\n' in p for p in ps) and not any('  ' in p for p in ps)
assert not any(p != p.strip() for p in ps)
assert not re.search(r'\w+- \w+', joined), 'a hyphenated compound was split by a rewrap'
wc = json.load(open('book05/word-counts-v1.json'))
sw = [len(p.split()) for p in sp]
cw = [len(p.split()) for p in ps]
assert wc['source'] == sw and wc['candidate'] == cw, 'R5: stored word counts do not match'
ratio = sum(cw) / sum(sw)
assert abs(ratio - 0.9987) < 0.0005 and min(c/s for c, s in zip(cw, sw)) >= 0.90

# --- retention, in the canonical aggregate-join form -----------------------
NM = {'ulysses':'odysseus','minerva':'athena','jove':'zeus','neptune':'poseidon',
      'mercury':'hermes','saturn':'cronus','diana':'artemis','euryclea':'eurycleia',
      'venus':'aphrodite','juno':'hera','vulcan':'hephaestus','ceres':'demeter'}
def toks(t): return [NM.get(w, w) for w in re.findall(r'[a-z]+', t.replace('\n',' ').lower())]
a, b = toks(s), toks(joined)
ret = sum(x.size for x in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_matching_blocks()) / len(a)
assert abs(ret - 0.94211) < 0.000005, f'retention {ret:.5f}'

# --- D17: the splitting rate, the second number ---------------------------
def sentences(t):
    t = t.replace('\n', ' ')
    return [x for x in re.split(r'(?<=[.!?])["”’\']?\s+', t) if x.strip()]
def profile(paras):
    ss = [x for p in paras for x in sentences(p)]
    return len(ss), sum(1 for x in ss if len(x.split()) >= 60)
sn, s60 = profile(sp)
cn, c60 = profile(ps)
pct = 100.0 * (cn - sn) / sn
broken = 100.0 * (s60 - c60) / s60
assert (sn, cn, s60, c60) == (153, 189, 9, 3)
assert pct >= 5.5 * 0.5 and c60 <= s60 * 0.75, 'D17 gate'
# the three left long, each on purpose (continuity.md section 10)
long_in = sorted({i + 1 for i, p in enumerate(ps) for x in sentences(p) if len(x.split()) >= 60})
assert long_in == [17, 30, 37], long_in

print('OK — 37 paragraphs, coverage exact, packets verbatim, names and hazards held')
print('OK — ratio', f'{ratio:.4f}', '| Butler token retention', f'{ret:.5f}',
      '| D4 unbalanced paragraphs', 0)
print('OK — sentences', f'{sn} -> {cn} ({pct:+.1f}%)', '| 60+ word',
      f'{s60} -> {c60} ({broken:.0f}% broken)')
for f in ('book05/source-book5.json','book05/candidate-v1.json',
          '../../../app/public/data/editions/odyssey-original-en.json'):
    print(hashlib.sha256(open(f,'rb').read()).hexdigest(), f)
PY
```

Expected:

```
OK — 37 paragraphs, coverage exact, packets verbatim, names and hazards held
OK — ratio 0.9987 | Butler token retention 0.94211 | D4 unbalanced paragraphs 0
OK — sentences 153 -> 189 (+23.5%) | 60+ word 9 -> 3 (67% broken)
c84e4bb2924d89250e4a943721703213bba0530c09641b662c93c4a8de02cd57  book05/source-book5.json
7acc5c346154e7d23c85eaa3c31ef25654600e4e122f455eb93a1bf3737a59cf  book05/candidate-v1.json
da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07  ../../../app/public/data/editions/odyssey-original-en.json
```

And the source check, which prints its whole audit:

```bash
python3 scripts/verify_source_book5.py
# ends: OK — the served Book 5 is Butler's text, identified as the residue …
```

## Next action

Independent review of `candidate-v1.json` (step 4), by a separate reviewer
session, following `review-instructions.md`. Findings go under `book05/review/`.
On findings: `candidate-v2.json` via a change script in the established
pattern, verification, flow read, `ACCEPTANCE.md` — steps 5–8.

**Five things are put to that reviewer explicitly** — see
`review-instructions.md` and `continuity.md`: the open `sea shore` and the
cross-Book hazard behind it, the one word supplied at B05-P012, the unbroken
`heaven` census, `battledore and shuttlecock` → `batting it back and forth`,
and the 62-word sentence left standing at B05-P017.
