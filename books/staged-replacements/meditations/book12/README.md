# Meditations, Book XII — package (frozen for independent review)

Steps 1–3 of `../WORKFLOW.md` are done for Book XII. `candidate-v1.json`
(sha256 `8665adc8…`) is **frozen**; corrections from the review will go to
`candidate-v2.json`, never to v1. Step 4 (independent review) is the
coordinator's reviewer session, not this agent.

**Book XII is the last book of the Meditations and the last book of this
package.** Eleven books are accepted before it.

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
perigethei gaion.]` into the body of XII.3. The rule used here drops every run
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

**Waiting on the coordinator: an independent review of Book XII.** Findings go
under `book12/review/`. Five decisions are flagged there for an explicit ruling
(the two departures from PG's letters at XII.27 and XII.29; XII.3's "[to the god
that is within thee]" dropped under D11 where the bracket is the glossary row's
own wording; XII.17's "[For let thy efforts be—]" treated as a mark of textual
doubt, the first application of the XI.26 class to a whole clause; XII.4's
"shall" standing beside "will" in one comparison; XII.27's "[or Rufus at Velia]"
dropped under D11 as an alternative *construal*) and one is offered for
confirmation ("pancratiast" kept untranslated at XII.9). Two further points are
put to the reviewer with reasons: XII.23's two resumptive repairs, and the five
added commas. The reviewer is also asked, **because this is the last book**, to
say what a cross-book pass over all twelve would still owe. This agent does not
review its own draft.
