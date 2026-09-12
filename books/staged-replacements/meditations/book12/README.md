# Meditations, Book XII — package (accepted as candidate v2)

All eight steps of `../WORKFLOW.md` are done for Book XII. The accepted text is
`candidate-v2.json` (sha256 `8510a04f…`), see `ACCEPTANCE.md`.
`candidate-v1.json` (sha256 `8665adc8…`) stays **frozen** and was never edited.
Step 4 (independent review) was the coordinator's reviewer session, not this
agent; its findings are under `review/`: *Accept after corrections*, **0
substantive**, **11 minor** (1.1, 2.1, 3.2, 4.1, 5.1, 15.1, 23.1, 34.1, 36.1 and
the chapter-level C1, C2) and **6 optional** (3.1, 14.1, 18.1, 26.1, 27.1, C3),
every one of the 36 paragraphs covered exactly once. "Nothing is missing, nothing
is added, nothing is softened, nothing is expanded, nothing is imported, and the
last meditation carries no valedictory colour that Long does not have."
**All eleven minor findings are applied, and all six optional findings are
answered and applied** — three to the text (3.1, 18.1, 26.1) and three to the
record (14.1, 27.1, C3), so none is declined. **All five flagged decisions, the
point offered for confirmation and the two points put with reasons were ruled on,
and every substantive call stands** — "Baiae" and "what" both confirmed on their
own evidence, XII.3's D11 route confirmed, XII.17's whole-clause textual-doubt
application confirmed (and **D13's sentence widened at acceptance to "a word or a
clause"**, finding C3), XII.27's "[or Rufus at Velia]" confirmed under D11,
"pancratiast" confirmed, XII.23's repairs allowed, D13 confirmed to fire nowhere
in the book, and the XII.12 stray "18" confirmed never to reach the candidate.
The one ruling against the draft is **4.1**, which rules a rule rather than
correcting an error: XII.4 now reads "will" in both halves of its comparison, so
the candidate keeps **none** of Long's ten "shall / shalt".

**Book XII is the last book of the Meditations and the last book of this
package. With its acceptance, twelve of twelve are accepted.**

Step 1 verified the source and **did not rebuild** the staged original. The
check was **not** a re-run of the build script; the reconstruction's own **rules**
were audited against the raw PG range *before* its output was looked at; and —
following the Book XI reviewer — **the reconstruction derives the chapter by a
rule of a different kind from the build's**, so that a shared blind spot cannot
hide. Three points from earlier reviewers govern: byte-identity to a re-run
proves only that the file matches the script, **which is exactly how the Book IV
illustration captions and the Book VII flush-left footnotes survived the first
build** (Book IX reviewer); a reconstruction that shares a blind spot with the
build proves nothing either (Book X reviewer); and two rule sets of different
kinds reproducing the same file to the byte is the strongest form the check takes
(Book XI reviewer). `../scripts/verify_book12_source.py`, written from scratch,
does all three and prints the audit before the diff.

The build keys on an `[A-D]` opener and then consumes every following indented
**or blank** line until flush-left text resumes. The reconstruction instead
splits the range into blank-line-separated blocks and classifies each by its
**indentation profile**, with no opener state and no consumption: first line
flush left = body; every line indented four or more = apparatus; every line
indented but minimum indentation below four = verse, joined into the body
paragraph before it.

**It reconstructs 36 paragraphs, matching the staged count, and the only
difference in the whole book is the single dagger mark** at XII.16 (PG 6963),
which `../PROVENANCE.md` §4 documents as deliberately removed. The dagger was
deliberately **left in** the reconstruction so that it would surface as a diff
and be counted; XII.16 differs by that one `+` and by nothing else.

Class by class over PG lines 6818–7174 (after the `XII.` header at 6817, before
`INDEXES.` at 7175): **fourteen maximal indented runs**, each printed with its
indentation profile — **eleven footnote openers, all indented four spaces** (PG
6883, 6888, 6969, 6974, 7017, 7052, 7069, 7079, 7123, 7168, 7170); **two unmarked
continuations of a footnote body**, each checked *by content* to follow the run it
belongs to with only blank lines between (PG 6886, and PG 7092–7102, the second
half of the long note opened at 7079); and **one verse run**, Long's line of
Empedocles at PG 6866, indented **three** spaces. **Eleven in-text markers — ten
in flush-left text (PG 6879, 6964, 6967, 7008, 7046, 7062, 7073, 7111, 7155,
7160) plus one at the end of the indented verse line 6866 — reconciling exactly
with the eleven openers.** **No flush-left footnote opener** (the VII.45 class),
and a flush-left footnote *body* would have shown as a diff; none did. **No
illustration caption** (the Book IV class). **Twenty-four short standalone
flush-left lines**, every one the wrapped tail of a paragraph ending in terminal
punctuation, so no running head, page number or catchword. **No Greek in the
body**: all **four** `[Greek: …]` spans (PG 6886, 6969, 6971, 7069) are inside
indented footnote bodies, and the staged Book XII contains no `(Greek:` at all.
Underscores occur only inside footnote bodies (PG 7087, 7089, 7094).

**One point in the audit is a finding about method, and it is why the rule is
worded as it is.** PG 6886 is the second half of footnote [A]'s body and is
indented **nine** spaces, not four. The Book XI reviewer's own alternative rule
— "classify maximal indented runs by indentation and drop the **four-space**
runs" — would have kept it and leaked `[Greek: Sphairos kykloteres monie
perigethei gaion.]` into **XII.4** (corrected from "XII.3" at Book XII acceptance, finding C1: the round-1 reviewer implemented the alternative rule and ran it, and the block at PG 6886 stands between the end of XII.4 at PG 6881 and the start of XII.5 at PG 6890). The rule used here drops every run
indented four **or more** and then checks each such run by content. **A number
taken from one book does not transfer to the next; the shape of the rule does.**

**D14 checked** (the row added at Book XI acceptance): the space-before-punctuation
rule fires nowhere in Book XII's range, and is reproduced in the reconstruction
regardless, so the two are compared on the same rules. sha256 still `7798607d…`,
487 paragraphs, twelve chapters, section profile 17, 17, 16, 51, 36, 59, 75, 61,
42, 38, 39, **36**, `git status` clean. **No accepted book is reopened.**

Step 2 fixed the glossary before drafting: **two rows corrected or extended**,
both committed and pushed before any paragraph was written. The ***daimōn* row's
left column gained two of Long's own shapes it did not name** — "the divinity
which is planted in his breast" (III.16, already rendered "the god within" in the
accepted Book III) and "the divinity within thee" (XII.1) — a correction of a row
that under-described the edition, not a change of practice. The **beneficence row
gained the adverb "benevolently"** → "kindly" (XII.5, its only occurrence in the
whole work). No new rendering row was needed. Book XII is the **fourth** book
drafted under the "shall" rule, the **second** drafted under **D13** (which fires
in neither), and the **first** drafted under **D14**.

## Files

1. `source-book12.json` — Book 12 (XII.1–XII.36) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 12`,
   36 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 36 paragraphs one-to-one
   with the source, same schema. **Frozen.**
3. `candidate-v1-readable.md` — the same text with `B12-Pnnn` IDs outside the
   prose.
4. `continuity.md` — the step-1 source verification and rule audit class by
   class, the two glossary rows fixed for Book XII, the glossary terms met and
   how they were rendered, the "shall" inventory, paragraph-level decisions,
   apparatus folded or dropped (six cross-reference spans, **four folds, seven
   D11 drops, one textual-doubt mark — 4 + 7 + 1 = 12**), the full punctuation
   tally, the base-text points, two cross-book inconsistencies noticed and not
   reopened, the decisions flagged for the reviewer, and unresolved source issues.
5. `provenance.json` — branch, hashes, source, word ratios, the dagger mark,
   generation setting, apparatus counts, the "shall" inventory, base-text points,
   flagged items.
6. `review-packets/packet-01.md … packet-12.md` — twelve packets of three
   paragraphs (36 = 12×3), each with one paragraph of context before and after
   marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib, re
src=json.load(open('book12/source-book12.json')); cand=json.load(open('book12/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==12)
sp=src['paragraphs']; cp=cand['paragraphs']
assert sp==ch['paragraphs'] and len(cp)==36
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cp))
assert [len(c['paragraphs']) for c in st['chapters']]==[17,17,16,51,36,59,75,61,42,38,39,36]
assert not any('[Illustration' in p for c in st['chapters'] for p in c['paragraphs'])
assert not any(re.search(r'^\[[A-Z]\]|Acharnenses|From the Apologia|The interpreters translate|There is something wrong here|Gataker, whose notes|The verse of Empedocles', p) for c in st['chapters'] for p in c['paragraphs'])
# Long's Empedocles line is inside XII.3; the footnote bodies are not in the file
assert '"All round and in its joyous rest reposing;"' in ch['paragraphs'][2]
assert not any('Sphairos' in p for c in st['chapters'] for p in c['paragraphs'])
man=json.load(open('book12/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B12-P{i:03d}' for i in range(1,37)]
md=open('book12/candidate-v1-readable.md').read(); assert all(p in md for p in cp)
for e in man['packets']:
    t=open('book12/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert sp[k] in t and cp[k] in t
# the one dagger-marked clause, present in source and candidate, Long's comma kept
assert 'If then thou art irritable, cure this man' in sp[15]
assert 'If then you are irritable, cure this man' in cp[15]
# THE BRACKET ARITHMETIC, asserted from the enumerated list rather than a numeral
# (the Book X finding C1 ruling): folds + D11 drops + textual marks == the
# source's own bracket count.
brackets=sum(p.count('[') for p in sp); assert brackets==12, brackets
FOLDS=[(14,'be extinguished before your death?'),
       (15,'having done wrong, say, How then do I know'),
       (35,'a citizen in this great state, the world'),
       (35,'whether for five years or three?')]
D11=[(1,'[ruling principles]','ruling principles'),
     (2,'a little breath [life], intelligence','[life]'),
     (2,'in the breath [life], which is by nature','[life]'),
     (2,'[to the god that is within thee]','that is within'),
     (7,'[forms]','forms'),
     (26,'[or Rufus at Velia]','Velia'),
     (29,'[or individuals]','individuals')]
MARKS=[(16,'[For let thy efforts be—]','For let your efforts be—')]
for k,s_ in FOLDS: assert s_ in cp[k], (k,s_)
for k,in_src,gone in D11:
    assert in_src in sp[k] and gone not in cp[k], (k,in_src)
for k,in_src,stands in MARKS:
    assert in_src in sp[k] and stands in cp[k] and '[' not in cp[k], k
assert (len(FOLDS),len(D11),len(MARKS))==(4,7,1)
assert len(FOLDS)+len(D11)+len(MARKS)==brackets
assert not any('[' in p for p in cp)
# every cross-reference gone; there is no verse or source citation in this book
assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in cp)
assert [i+1 for i,p in enumerate(sp) if re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ',p)]==[3,12,14,19,21,35]
# the "shall" rule: Long has ten, the candidate keeps exactly one, at XII.4, first person
assert sum(len(re.findall(r'\bshal[lt]\b',p,re.I)) for p in sp)==10
assert [i+1 for i,p in enumerate(cp) if re.search(r'\bshall\b',p,re.I)]==[4]
assert cp[3].count('shall')==1 and 'what we shall think of ourselves' in cp[3]
assert 'our neighbors will think of us' in cp[3]
assert not any(re.search(r'\b(?:you|he|she|it|they|there) shall\b', p) for p in cp)
# no thou-forms and no archaic inflections survive
assert not any(re.search(r'\b(thou|thy|thee|thyself|shalt|hast|dost|doest|wilt|wast|wert|hadst|shouldst|thine|seest|usest|sayest|mayest|mayst|worshippest|creepest|despairest)\b',p) for p in cp)
# the two departures from PG's letters, and the PG readings followed against SE
assert 'Stertinius at Briae' in sp[26] and 'Stertinius at Baiae' in cp[26]
assert 'that is its material' in sp[28] and 'what is its matter' in cp[28]
assert 'Fabius Catellinus' in sp[26] and 'Fabius Catellinus' in cp[26]   # PG kept, D6
assert 'disputing with the divine' in cp[4]                              # PG "Deity", not SE "diety"
assert 'without a governor' in cp[13]                                    # PG, not SE
assert 'who dwell all around in the air' in cp[23]                       # PG, not SE
assert 'the same thing in his mind' in cp[22]                            # PG singular, D6
assert 'fig tree' in cp[15] and 'fig-tree' in sp[15]                     # X.36.2 normalisation
assert 'Practice yourself' in cp[5] and 'practiced in this' in cp[5]
# punctuation: two comma-dashes removed; five commas added; the dagger comma kept
assert sum(p.count(',—') for p in sp)==2 and sum(p.count(',—') for p in cp)==0
added=[(i+1,b.count(',')-a.count(',')) for i,(a,b) in enumerate(zip(sp,cp)) if b.count(',')>a.count(',')]
assert added==[(1,1),(15,2),(30,1),(36,1)], added   # XII.16 nets to zero: +1 fold, -1 subject-verb
assert 'In accordance with piety, that you may be content' in cp[0]
assert 'holds together, and the gravitation' in cp[29]
# five paragraphs byte-identical to Long
assert [i+1 for i,(a,b) in enumerate(zip(sp,cp)) if a==b]==[7,10,11,13,34]
print('OK'); print(hashlib.sha256(open('book12/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book12/source-book12.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `8665adc8…` (candidate v1, frozen), `1e7a003b…` (source-book12.json)
and `7798607d…` (the staged original, unchanged at Book XII step 1).

**The accepted v2, and the ten round-1 substitutions.** Note that the punctuation
assertion above compares *net* comma counts per paragraph and so cannot see a
paragraph that removes one comma and adds another — Book XII has one, XII.2
(finding 2.1). The block below compares comma **positions** instead, which is the
check `../scripts/build_book12_v2.py` now runs.

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib, re, difflib
src=json.load(open('book12/source-book12.json'))['paragraphs']
v1=json.load(open('book12/candidate-v1.json'))['paragraphs']
p2=json.load(open('book12/candidate-v2.json'))['paragraphs']
assert len(p2)==36 and all(p.startswith(f'{i+1}. ') for i,p in enumerate(p2))
md2=open('book12/candidate-v2-readable.md').read(); assert all(p in md2 for p in p2)
assert [i+1 for i,(a,b) in enumerate(zip(v1,p2)) if a!=b]==[3,4,5,15,18,26,34,36]
assert 'the vortex that flows round from outside' in p2[2]          # 3.1
assert 'if you separate, I say, from this ruling part' in p2[2]     # 1.1 / 3.2
assert "and make yourself like Empedocles' sphere" in p2[2]
assert 'than for what we will think of ourselves' in p2[3]          # 4.1
assert 'you see for yourself that in this inquiry' in p2[4]         # 5.1
assert 'and justice and temperance be extinguished' in p2[14]       # 15.1
assert 'into the form, the matter, the purpose, and the time' in p2[17]   # 18.1
assert 'is a god and an outflow from the divine' in p2[25]          # 26.1
assert 'is best suited to move us to contempt of death' in p2[33]   # 34.1
assert 'or three? for that which is in accordance' in p2[35]        # 36.1
assert 'into it? the same as if a praetor' in p2[35]
for gone in ('flows round you from outside','if you will separate','and will make yourself',
             'we shall think','see even of yourself','and temperance, be extinguished',
             'into its form','flows out from the divine','most adapted','? For that','? The same'):
    assert not any(gone in p for p in p2), gone
# v2 keeps every v1 invariant; and after finding 4.1 the candidate keeps NO "shall"
assert not any('[' in p for p in p2)
assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ',p) for p in p2)
assert [i+1 for i,p in enumerate(p2) if re.search(r'\bshall\b',p,re.I)]==[]
assert not any(re.search(r'\b(thou|thy|thee|thyself|shalt|hast|dost|wilt|wast|thine)\b',p) for p in p2)
assert [i+1 for i,(a,b) in enumerate(zip(src,p2)) if a==b]==[7,10,11,13]   # XII.34 no longer
assert 'If then you are irritable, cure this man' in p2[15]                # the dagger clause
assert 'For let your efforts be—' in p2[16]                                # XII.17 stands
assert 'Stertinius at Baiae' in p2[26] and 'what is its matter' in p2[28]
# PUNCTUATION BY POSITION (finding 2.1): align word by word, compare the comma
# that follows each aligned pair. Ten differences, all enumerated.
def ct(t):
    return [(w.rstrip().rstrip(',').rstrip(), w.rstrip().endswith(',') or w.rstrip().endswith(',—'))
            for w in t.split()]
diff=[]
for i,(s_,c_) in enumerate(zip(src,p2)):
    st,cc=ct(s_),ct(c_)
    sm=difflib.SequenceMatcher(a=[w for w,_ in st],b=[w for w,_ in cc],autojunk=False)
    for i1,j1,n in sm.get_matching_blocks():
        diff+=[(i+1,'removed' if st[i1+k][1] else 'added',st[i1+k][0])
               for k in range(n) if st[i1+k][1]!=cc[j1+k][1]]
assert diff==[(1,'added','piety'),(2,'removed','him'),(3,'added','breath'),(3,'added','breath'),
              (16,'added','wrong'),(16,'removed','wrong'),(23,'removed','act'),
              (23,'removed','time'),(30,'added','together'),(36,'added','state')], diff
# the two added commas inside modernised wording, enumerated separately
assert 'the truth which is in thee and justice' in src[14] and 'the truth which is in you, and justice' in p2[14]
assert 'and such like externals and show' in src[1] and 'and externals of that kind, and show' in p2[1]
assert sum(p.count(',—') for p in src)==2 and sum(p.count(',—') for p in p2)==0
print('OK v2'); print(hashlib.sha256(open('book12/candidate-v2.json','rb').read()).hexdigest())
PY
```

Expected: `OK v2` and `8510a04f…`.

The step-1 source check is reproducible on its own, and prints its rule audit
before its diff:

```bash
cd books/staged-replacements/meditations
python3 scripts/verify_book12_source.py
```

Expected: fourteen indented runs with their profiles, eleven footnote openers
reconciling with eleven markers, both unmarked continuations explained by
content, no flush-left opener, no caption; then 36 reconstructed paragraphs,
count match, and one differing paragraph — XII.16 — differing only by the
dagger mark.

## Next action

**None for Book XII: it is accepted** (`ACCEPTANCE.md`), and it is the last book
of the work. **Twelve of twelve are accepted.** What follows the twelfth
acceptance is the whole-work pass — recorded in `../README.md` as the package's
completion record, and in `../00-progress-ledger.md` under "Next".
