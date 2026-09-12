# The Odyssey, Book 6 — package (frozen at candidate v1)

Steps 1–3 of `../WORKFLOW.md` are done for Book 6, and the step-4 artefacts
(9 packets, manifest, review instructions) are built. **Step 4 itself — the
independent review — has not run**: `candidate-v1.json` is frozen and the
packets are pushed. Book 6 was **not** self-reviewed.

| | |
|---|---|
| Candidate | `candidate-v1.json`, sha256 `9391ca16778a8225c1710b24296c51a2d3ba33f26ed3ac9fcf7c677c3c0413f0` — **frozen** |
| Source | `source-book6.json`, sha256 `351c2f4647245348450458e2309214b96cf6f6af5e670e9efbc6ddbcdaec5668` |
| Paragraphs | 26 |
| Words | 3,432 against 3,435 — ratio **0.99913** |
| Butler token retention | **0.93669** |
| **Splitting rate (D17)** | **116 → 148 sentences, +27.6%; sixty-word 7 → 1, 86% broken** |
| **Semicolons against Butler's (D19)** | **27 → 4** |
| Packets | 9, coverage `B06-P001`…`B06-P026` |

**Three numbers, not two.** Book 4's round 1 established that retention alone
cannot tell a modernization from a touch-up (**D17**); Book 5's round 1
established that the splitting rate alone cannot either, because a semicolon
rewritten as a period adds a sentence, moves no clause and costs no retention
(**D19**). Book 6 reports all three, and says plainly what its own numbers
mean: **23 of its 32 added sentences are at most a semicolon conversion**, and
what says the rest is real is the retention figure, **0.93669** — below Book 5
v1's 0.94211, which was convicted of doing nothing but convert.

## Step 1 — the source, verified by an EIGHTH kind of rule that asks a new question

`../scripts/verify_source_book6.py`. All seven rules used before establish
**presence**. This one asks the complement — *is there anywhere else in PG that
this chapter could have come from?* — by building a **suffix automaton** over
the served chapter and walking the **whole PG file** through it once, from
token zero, recording a resemblance profile of the entire file against this one
chapter. Nothing is searched for and the served file cannot steer where the
check looks.

**The profile reaches the chapter's full length at exactly one PG position**
(span `[28997, 32456)`, an output), and **the second-best match anywhere in the
file is 37 tokens** — Athena's beautification of Odysseus, which Homer repeats
at Book 23 — **reported with its text, not merely bounded**. 26 of 26
paragraphs accounted for, 24 byte-identical, 2 classified footnote markers
(55, 56), 3,435 words word for word, 0 mismatches.

**The audit failed the rule as first written**, as the last three audits did:
its token-span-to-character-span recovery stopped at the last *letter* of the
chapter and dropped the terminal full stop, so it reported a mismatch on a
byte-clean file. Fixed and named in place. Six controls, both **D18** clauses
each; two blindnesses declared with the checks that carry them.

**Independent corroboration nobody arranged:** the span starts at PG token
**28997**, the same number Book 5's residue rule read out for chapter 6's start
from an alignment that never looked at chapter 6.

## Files

1. `source-book6.json` — Book 6 extracted by `chapter.number == 6`, 26
   paragraphs, byte-identical to the served original, Butler's own title.
2. `candidate-v1.json` — the modern-English candidate, 26 paragraphs
   one-to-one with the source. **Frozen**; corrections go to
   `candidate-v2.json` (**D10**).
3. `candidate-v1-readable.md` — the same text with `B06-Pnnn` IDs outside the
   prose.
4. `continuity.md` — the verification rule and its audit; the names and the
   hazard that did not fire; **D4, which fires twice**; the connectives; the
   compounds and the fourth successor they cost; the paragraph decisions; the
   splitting rate, the semicolon count, and the published near-identical
   report.
5. `provenance.json` — branch, hashes, verification record, word counts,
   splitting rate, semicolons, naming, punctuation, compounds, generation.
6. `word-counts-v1.json` — the 26 per-paragraph word counts, source and
   candidate.
7. `review-packets/packet-01.md … packet-09.md` — 9 packets (9×3 = 27 slots,
   26 used), each with one paragraph of context before and after marked
   `CONTEXT ONLY`. No self-review verdicts.
8. `review-instructions.md` — the independent-review instructions, including
   the **five things put to the reviewer explicitly**.
9. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/odyssey
python3 - <<'PY'
import json, hashlib, re, difflib
src  = json.load(open('book06/source-book6.json'))
cand = json.load(open('book06/candidate-v1.json'))
orig = json.load(open('../../../app/public/data/editions/odyssey-original-en.json'))
ch   = next(c for c in orig['chapters'] if c['number'] == 6)

assert src['paragraphs'] == ch['paragraphs'], 'source extraction not byte-identical'
assert src['title'] == ch['title'], 'title mismatch'
assert cand['title'] == 'Book 6 — The meeting between Nausicaa and Odysseus'
assert len(cand['paragraphs']) == len(src['paragraphs']) == 26, 'paragraph count'
assert hashlib.sha256(open('book06/candidate-v1.json','rb').read()).hexdigest() == \
    '9391ca16778a8225c1710b24296c51a2d3ba33f26ed3ac9fcf7c677c3c0413f0', 'v1 hash'

man = json.load(open('book06/manifest.json'))
ids = [i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids == [f'B06-P{i:03d}' for i in range(1, 27)], 'manifest coverage failed'
assert len(man['packets']) == 9
for e in man['packets']:
    t = open('book06/' + e['packet'], encoding='utf-8').read()
    for pid in e['assigned_paragraph_ids']:
        k = int(pid[-3:]) - 1
        assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t, f'{pid} not verbatim'
md = open('book06/candidate-v1-readable.md', encoding='utf-8').read()
assert all(p in md for p in cand['paragraphs']), 'readable md does not match the JSON'

ps = cand['paragraphs']
joined = '\n'.join(ps)
sp = [' '.join(p.split()) for p in src['paragraphs']]
s  = '\n'.join(sp)
def n(w, t=None):  return len(re.findall(r'\b' + w + r'\b', joined if t is None else t))

# --- names: every count matches the source, and the table gains NO row ------
for greek, roman, k in (('Odysseus','Ulysses',14), ('Athena','Minerva',11), ('Zeus','Jove',6),
                        ('Poseidon','Neptune',3), ('Artemis','Diana',2), ('Hephaestus','Vulcan',1)):
    assert n(greek) == n(roman, s) == k, f'name census: {greek}'
for roman in ('Ulysses','Minerva','Jove','Neptune','Mercury','Saturn','Diana',
              'Euryclea','Venus','Juno','Vulcan','Ceres','Latona'):
    assert n(roman) == 0, f'Roman form survives: {roman}'
assert n('Rhea') == 0 and n('Helios') == 0 and n('Cronos') == 0   # hazard 1
assert n('Ops') == 0 and n('Ops', s) == 0 and n('Same') == 0 and n('Same', s) == 0
# the hazard that did NOT fire, asserted rather than passed over
assert n('Leto') == n('Leto', s) == 1 and n('Latona', s) == 0
for greek in ('Alcinous','Nausithous','Dymas','Phaeacians','Hypereia','Cyclopes','Scheria',
              'Olympus','Taygetus','Erymanthus','Delos','Ogygian','Apollo','Hades'):
    assert n(greek) == n(greek, s), f'an already-Greek name moved: {greek}'
# the ONE count that does not match, by name (continuity.md section 5)
assert n('Nausicaa') == 11 and n('Nausicaa', s) == 10
assert 'Nausicaa happened to catch her father' in ps[4]

# --- D7 possessives ---------------------------------------------------------
assert joined.count('Zeus’s') == 2 and s.count('Jove’s') == 2
assert 'Dymas’s' in joined and 'Dymas’s' in s
assert not re.search('(Odysseus|Zeus|Dymas|Alcinous)’(?!s)', joined)

# --- D4 FIRES TWICE, and the shape is the source's --------------------------
assert sum(p.count('“') for p in ps) == sum(p.count('“') for p in src['paragraphs']) == 18
assert sum(p.count('”') for p in ps) == sum(p.count('”') for p in src['paragraphs']) == 15
unbal = [i + 1 for i, p in enumerate(ps) if p.count('“') != p.count('”')]
assert unbal == [i + 1 for i, p in enumerate(src['paragraphs'])
                 if p.count('“') != p.count('”')] == [13, 21, 22]
for k in (12, 13, 20, 21, 22):
    assert ps[k].lstrip().startswith('“'), f'D4: B06-P{k+1:03d} must open its own mark'
assert ps[13].rstrip().endswith('”') and ps[22].rstrip().endswith('”')
assert sum(p.count('‘') for p in ps) == sum(p.count('‘') for p in src['paragraphs']) == 1
assert "'" not in joined and '"' not in joined, 'ASCII quote survives'

# --- D3, D12, D14 do not fire ----------------------------------------------
assert n('hecatomb') == 0 and n('hecatombs') == 0 and n('hecatomb', s) == 0
assert '[' not in joined and ']' not in joined and '[' not in s and ']' not in s

# --- the heaven census is UNBROKEN, and Butler's own difference is kept -----
assert n('heaven') == n('heaven', s) == 7
assert joined.count('live in heaven') == s.count('live in heaven') == 1
assert joined.count('dwell in heaven') == s.count('dwell in heaven') == 2

# --- connectives: one Butler form, one rendering ---------------------------
assert len(re.findall(r'\bOn this\b', s)) == 3 and n('On this') == 0
assert len(re.findall(r'\bwhereon\b', s)) == 1 and n('whereon') == 0
assert len(re.findall(r'\bAt this\b', joined)) == 3      # Butler's On this
assert len(re.findall(r'\bAt that\b', joined)) == 1      # Butler's whereon
assert n('Thereon') == 0 and n('at which') == 0 and n('on which') == 0
# the ordinary preposition is NOT the connective, and is asserted by name so
# the connective guard cannot swallow it (the accepted B04-P042 precedent)
assert 'fate has flung me on this coast' in ps[12]
assert len(re.findall(r'\bon this\b', joined)) == 1

# --- formulas carried from the accepted Books ------------------------------
b4 = json.load(open('book04/candidate-v3.json'))['paragraphs']
b5 = json.load(open('book05/candidate-v2.json'))['paragraphs']
assert joined.count('aegis-bearing Zeus') == 2
assert any('aegis-bearing Zeus' in p for p in b4)
assert '“Hear me,” he cried, “daughter of aegis-bearing Zeus, unwearying' in ps[24]
assert any('daughter of aegis-bearing Zeus, unwearying' in p for p in b4)
assert 'thought of another matter' in ps[19]
assert any('thought of another matter' in p for p in b4)
assert joined.count('as I tell you') == 2 and any('as I tell you' in p for p in b5)
assert 'In the end he thought it best' in ps[11]
assert any('In the end he thought it best' in p for p in b5)
# the rendering deliberately NOT used here, because it is Butler's OTHER phrase
assert 'still undecided' not in joined and 'in two minds' not in joined
assert any('still undecided' in p for p in b4 + b5)

# --- compounds under D15 ---------------------------------------------------
for closed, open_in_src in (('maidservants','maid servants'), ('goatskin','goat skin'),
                            ('marketplace','market place'), ('roadside','road side'),
                            ('waterside','water side'), ('seaside','sea side'),
                            ('seafaring','sea-faring'), ('farmlands','farm lands')):
    assert closed in joined and open_in_src in s, f'compound: {closed}'
for hyph, open_in_src in (('well-made','well made'), ('well-fenced','well fenced'),
                          ('good-looking','good looking')):
    assert hyph in joined and open_in_src in s, f'compound: {hyph}'
for kept in ('sea captain','linen room','washing day','salt water','mountain tops',
             'bearing-posts','fine-looking','ill-natured','well-disposed'):
    assert kept in joined and kept in s, f'Butler setting disturbed: {kept}'
# `Aegis-bearing` keeps Butler's hyphen and loses his capital, per the Book 3 row
assert 'Aegis-bearing' in s and 'Aegis-bearing' not in joined
# Butler sets this one BOTH ways in one Book; the edition uses one form twice
assert joined.count('washing cisterns') == 2 and 'washing-cisterns' not in joined
assert 'washing-cisterns' in s and 'washing cisterns' in s
# and the cross-Book row the closed axis of compound_drift() forced
assert any('waterside' in p for p in json.load(open('book02/candidate-v5.json'))['paragraphs'])

# --- D9, American spelling --------------------------------------------------
for brit in ('grey','honour','harbour','marvelled','woollen','travelled','travelling','favour',
             'neighbour','neighbours','colour','sceptre','towards','armour','splendour','humour',
             'skilful','ploughed','judgement','uncivilised','scandalised','waggon'):
    assert n(brit) == 0, f'British spelling survives: {brit}'
assert n('wagon') == 11 and n('waggon', s) == 11

# --- no archaism survived ---------------------------------------------------
low = joined.lower()
for dead in (r'\bthereon\b', r'\bwhereon\b', r'\bwhereupon\b', r'\bere long\b', r'\bhaply\b',
             r'\babode\b', r'\bbade\b', r'\bvictuals\b', r'\bhither\b', r'\bthither\b',
             r'\bthence\b', r'\bvouchsafe\b', r'\bshewed\b', r'\baforetime\b', r'\bamongst\b',
             r'\bbethought\b', r'\bnothing loth\b', r'\btwelvemonth\b', r'\bin course of time\b',
             r'\bambuscade\b', r'\bstaid\b', r'\bforenoon\b', r'\bprevaricate\b', r'\bmethinks\b',
             r'\bperadventure\b', r'\bthou\b', r'\bthy\b', r'\bthee\b',
             r'\bat which\b', r'\bfor all which\b', r'\bforthwith\b', r'\bdeemed\b',
             r'\bwherefore\b', r'\bwherein\b', r'\bhie\b', r'\bin quest of\b', r'\btopes\b',
             r'\bscion\b', r'\bdiscomfits\b', r'\bcruse\b', r'\bbegrimed\b', r'\billumined\b',
             r'\babides\b', r'\bconjecture\b', r'\bany one\b', r'\bevery one\b', r'\bsome one\b',
             r'”\s*(said|replied|answered) (he|she|i)\b', r'\b(said|replied) (he|she|i),'):
    assert not re.search(dead, low), f'archaism or superseded form survives: {dead}'
# and the words that replaced them are where they should be
assert 'Athena made her way, to help bring Odysseus home' in ps[0]
assert 'a golden flask of oil' in ps[7] and 'the little golden flask of oil' in ps[16]
assert 'so fair a young woman as yourself' in ps[12]
assert 'It thwarts their enemies' in ps[13]
assert 'he sits and drinks like an immortal god' in ps[22]
assert 'a skillful workman' in ps[17] and any('a skilled shipwright' in p for p in b5)
assert 'remain unmarried much longer' in ps[2]
assert 'aldermen' in ps[4] and 'Papa dear' in ps[5]      # kept, with reasons recorded
assert 'riverhood' not in joined

# --- NO paragraph is byte-identical to Butler, and the list is asserted -----
assert [i + 1 for i in range(26) if ps[i] == sp[i]] == []

# --- alignment, whitespace, per-paragraph word counts, ratio ----------------
assert not any('\n' in p for p in ps) and not any('  ' in p for p in ps)
assert not any(p != p.strip() for p in ps)
assert not re.search(r'\w+- \w+', joined), 'a hyphenated compound was split by a rewrap'
wc = json.load(open('book06/word-counts-v1.json'))
sw = [len(p.split()) for p in sp]
cw = [len(p.split()) for p in ps]
assert wc['source'] == sw and wc['candidate'] == cw, 'stored word counts do not match'
ratio = sum(cw) / sum(sw)
assert abs(ratio - 0.99913) < 0.00005 and min(c/s for c, s in zip(cw, sw)) >= 0.90

# --- retention, in the canonical aggregate-join form -----------------------
NM = {'ulysses':'odysseus','minerva':'athena','jove':'zeus','neptune':'poseidon',
      'mercury':'hermes','saturn':'cronus','diana':'artemis','euryclea':'eurycleia',
      'venus':'aphrodite','juno':'hera','vulcan':'hephaestus','ceres':'demeter'}
def toks(t): return [NM.get(w, w) for w in re.findall(r'[a-z]+', t.replace('\n',' ').lower())]
a, b = toks(s), toks(joined)
ret = sum(x.size for x in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_matching_blocks()) / len(a)
assert abs(ret - 0.93669) < 0.000005, f'retention {ret:.5f}'

# --- D17 and D19: the splitting rate AND the semicolon count ---------------
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
assert (sn, cn, s60, c60) == (116, 148, 7, 1)
assert pct >= 5.5 * 0.5 and c60 <= s60 * 0.75, 'D17 gate'
semi_src = sum(p.count(';') for p in sp)
semi_cand = sum(p.count(';') for p in ps)
assert (semi_src, semi_cand) == (27, 4), 'D19'
# the one left long, and it is SHORTER than Butler's (Book 5 finding 30.2)
long_in = sorted({i + 1 for i, p in enumerate(ps) for x in sentences(p) if len(x.split()) >= 60})
assert long_in == [9], long_in
assert max(len(x.split()) for x in sentences(ps[8])) == 60
assert max(len(x.split()) for x in sentences(sp[8])) == 67
# no recast grows a LONG sentence of Butler's
grew = [(i + 1, max(len(x.split()) for x in sentences(sp[i])),
         max(len(x.split()) for x in sentences(ps[i]))) for i in range(26)
        if max(len(x.split()) for x in sentences(ps[i])) >
        max(len(x.split()) for x in sentences(sp[i]))]
assert not [g for g in grew if g[2] >= 50], grew

print('OK — 26 paragraphs, coverage exact, packets verbatim, names and hazards held')
print('OK — ratio', f'{ratio:.5f}', '| Butler token retention', f'{ret:.5f}',
      '| D4 unbalanced paragraphs', unbal)
print('OK — sentences', f'{sn} -> {cn} ({pct:+.1f}%)', '| 60+ word',
      f'{s60} -> {c60} ({broken:.0f}% broken)', '| semicolons', f'{semi_src} -> {semi_cand}')
for f in ('book06/source-book6.json','book06/candidate-v1.json',
          '../../../app/public/data/editions/odyssey-original-en.json'):
    print(hashlib.sha256(open(f,'rb').read()).hexdigest(), f)
PY
```

Expected:

```
OK — 26 paragraphs, coverage exact, packets verbatim, names and hazards held
OK — ratio 0.99913 | Butler token retention 0.93669 | D4 unbalanced paragraphs [13, 21, 22]
OK — sentences 116 -> 148 (+27.6%) | 60+ word 7 -> 1 (86% broken) | semicolons 27 -> 4
351c2f4647245348450458e2309214b96cf6f6af5e670e9efbc6ddbcdaec5668  book06/source-book6.json
9391ca16778a8225c1710b24296c51a2d3ba33f26ed3ac9fcf7c677c3c0413f0  book06/candidate-v1.json
da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07  ../../../app/public/data/editions/odyssey-original-en.json
```

And the source check and the cross-Book compound check, which print their own
audits:

```bash
python3 scripts/verify_source_book6.py
# ends: OK — the served Book 6 is Butler's text. The chapter occurs entire, …
python3 scripts/compound_drift.py
# ends: no compound carries more than one setting across the Books
```

## Next action

Independent review of `candidate-v1.json` (step 4), by a separate reviewer
session, following `review-instructions.md`. Findings go under `book06/review/`.
On findings: `candidate-v2.json` via a change script in the established
pattern, verification, flow read, `ACCEPTANCE.md` — steps 5–8.

**Five things are put to that reviewer explicitly** — see
`review-instructions.md` and `continuity.md`: the name supplied at B06-P005,
`herbage` rendered two ways across Books, the Artemis simile left at 60 words,
the three `heaven`/`dwell`/`live` distinctions kept, and whether 23 semicolon
conversions out of 32 added sentences is the S-1 defect again.
