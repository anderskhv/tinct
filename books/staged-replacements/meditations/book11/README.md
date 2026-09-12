# Meditations, Book XI — package (frozen for independent review)

Steps 1–3 of `../WORKFLOW.md` are done for Book XI. `candidate-v1.json`
(sha256 `d0db3918…`) is **frozen**; corrections from the review will go to
`candidate-v2.json`, never to v1. Step 4 (independent review) is the
coordinator's reviewer session, not this agent.

Step 1 verified the source and **did not rebuild** the staged original. The
check was **not** a re-run of the build script, and — following the Book X
round-1 reviewer — the reconstruction's own **rules** were audited against the
raw PG range *before* its output was looked at. Two points from earlier reviewers
govern: byte-identity to a re-run proves only that the file matches the script,
**which is exactly how the Book IV illustration captions and the Book VII
flush-left footnotes survived the first build** (Book IX reviewer); and a
reconstruction that shares a blind spot with the build proves nothing either
(Book X reviewer). `../scripts/verify_book11_source.py`, written from scratch,
does both and prints the audit before the diff.

**It reconstructs 39 paragraphs, matching the staged count, and the only
differences in the whole book are the three dagger marks** at XI.8 (PG 6488),
XI.15 (PG 6544) and XI.17 (PG 6577), which `../PROVENANCE.md` §4 documents as
deliberately removed.

Class by class over PG lines 6376–6816 (after the `XI.` header at 6375, before
the `XII.` header at 6817): **seventeen maximal indented runs**, each printed
with its indentation profile — **eleven footnote runs, all indented four
spaces** (openers at PG 6398, 6401, 6420, 6459, 6461, 6554, 6647, 6702, 6750,
6753, 6757), consumed in seven blocks because notes separated only by a blank
line are consumed together; **three verse runs in XI.6** (PG 6441–6442, 6446,
6450) indented **six** spaces, with flush-left text standing between every verse
run and every footnote run, so no verse can have been swallowed by the footnote
rule; **two verse citations** (PG 6777 indented 26, PG 6780 indented 17), kept
in the staged original under D5 and dropped from the candidate; and **one
unmarked continuation of footnote [A]'s two-paragraph body** (PG 6558–6559),
consumed with the note it belongs to. **Eleven in-text markers — ten in
flush-left text plus one at the end of the indented verse line 6442 —
reconciling exactly with the eleven openers.** **No flush-left footnote opener**
(the VII.45 class), and a flush-left footnote *body* would have shown as a diff;
none did. **No illustration caption** (the Book IV class). Only **three
standalone short flush-left lines**, all of them Long's own connectives in XI.6
("And again,—", "And,—", "And other things of the same kind."), so no running
head, page number or catchword. **No Greek in the body**: all five `[Greek: …]`
spans are inside indented footnote bodies.

**One rule of the build was found undocumented, and is now documented.** The
first run produced a *fourth* diff, at XI.18, where PG line 6645 prints
"present ...[A]" and the staged file has "present...". The build has always
closed up a space before `,` `;` `:` `.` `?` `!`; it fires in exactly **five
lines in the whole translation body** (IV.19, V.29, VII.58, VII.66, XI.18), all
at ellipses marking lacunae in Long's Greek, and it **changes no word**. A
typographic normalisation of the em-dash class, so **no rebuild**: D12's standard
is not engaged, because no paragraph would change. Recorded in
`../PROVENANCE.md` §4 and reproduced in the reconstruction, so that it and the
staged file are compared on the same rules. sha256 still `7798607d…`, 487
paragraphs, twelve chapters, section profile 17, 17, 16, 51, 36, 59, 75, 61, 42,
38, **39**, 36, `git status` clean. **No accepted book is reopened.**

Step 2 fixed the glossary before drafting: **two rows corrected or extended**,
both committed and pushed before any paragraph was written. The rational-being
row **lost "rational soul"** from the variants it collects, because the edition
has never rendered it that way — the accepted Book VI keeps "a rational soul"
at VI.14 and the accepted Book X keeps "an irrational soul" at X.33, which the
Book X reviewer confirmed — so where Long names the soul itself the phrase is
his and is kept, and the row governs his names for the creature; XI.1 is its
third book. The common-good row **gained "the common advantage"** (XI.13),
already rendered "for the common good" in the accepted Book IV at IV.12. No new
rendering row was needed. Book XI is the **third** book drafted under the
"shall" rule and the **first** drafted under **D13**, the ledger row added at
Book X acceptance for Long's bracketed translator's notes — which does not
fire here, because Book XI contains none.

## Files

1. `source-book11.json` — Book 11 (XI.1–XI.39) extracted from
   `../meditations-original-en.staged.json` by `chapter.number == 11`,
   39 paragraphs, byte-identical to the staged original (Long 1862).
2. `candidate-v1.json` — the modern-English candidate, 39 paragraphs one-to-one
   with the source, same schema. **Frozen.**
3. `candidate-v1-readable.md` — the same text with `B11-Pnnn` IDs outside the
   prose.
4. `continuity.md` — the step-1 source verification and rule audit class by
   class, the two glossary rows fixed for Book XI, the glossary terms met and how
   they were rendered, the "shall" inventory, paragraph-level decisions,
   apparatus folded or dropped (eleven cross-reference spans, six source
   citations, **six folds, five D11 drops, no D13 drop — 6 + 5 + 0 = 11**), the
   full punctuation tally, the decisions flagged for the reviewer, and unresolved
   source issues.
5. `provenance.json` — branch, hashes, source, word ratios, dagger marks,
   generation setting, apparatus counts, the "shall" inventory, base-text points,
   flagged items.
6. `review-packets/packet-01.md … packet-13.md` — thirteen packets of three
   paragraphs (39 = 13×3), each with one paragraph of context before and after
   marked `CONTEXT ONLY`. No self-review verdicts.
7. `review-instructions.md` — the independent-review instructions, verbatim.
8. `manifest.json` — packet → paragraph-ID map with a coverage check.

## Mechanical checks

```bash
cd books/staged-replacements/meditations
python3 - <<'PY'
import json, hashlib, re
src=json.load(open('book11/source-book11.json')); cand=json.load(open('book11/candidate-v1.json'))
st=json.load(open('meditations-original-en.staged.json'))
ch=next(c for c in st['chapters'] if c['number']==11)
assert src['paragraphs']==ch['paragraphs'] and len(cand['paragraphs'])==39
assert all(p.startswith(f'{i+1}. ') for i,p in enumerate(cand['paragraphs']))
assert [len(c['paragraphs']) for c in st['chapters']]==[17,17,16,51,36,59,75,61,42,38,39,36]
assert not any('[Illustration' in p for c in st['chapters'] for p in c['paragraphs'])
assert not any(re.search(r'^\[[A-Z]\]|Acharnenses|From the Apologia|bad etymology|Saumaise|Gataker|Oedipus Rex|allusion to the fable|defect in the text', p) for c in st['chapters'] for p in c['paragraphs'])
# Long's three XI.6 quotations are inside XI.6; the footnote bodies are not in the file
assert 'Me and my children if the gods neglect' in ch['paragraphs'][5]
assert "Life's harvest reap like the wheat's fruitful ear" in ch['paragraphs'][5]
assert not any('Sophocles, Oedipus Rex' in p for c in st['chapters'] for p in c['paragraphs'])
man=json.load(open('book11/manifest.json'))
ids=[i for p in man['packets'] for i in p['assigned_paragraph_ids']]
assert ids==[f'B11-P{i:03d}' for i in range(1,40)]
md=open('book11/candidate-v1-readable.md').read(); assert all(p in md for p in cand['paragraphs'])
for e in man['packets']:
    t=open('book11/'+e['packet']).read()
    for pid in e['assigned_paragraph_ids']:
        k=int(pid[-3:])-1; assert src['paragraphs'][k] in t and cand['paragraphs'][k] in t
# the three dagger-marked clauses, present in source and candidate, Long's commas kept
for k,s_,c_ in [(7,'it grows with the rest of the tree, but that it has not the same mind with it',
                   'it grows with the rest of the tree, but that it has not the same mind with it'),
                (14,"Such as a man's character is, he immediately shows it in his eyes",
                    "Such as a man's character is, he immediately shows it in his eyes"),
                (16,'and of what it consists, and into what it changes',
                    'and of what it consists, and into what it changes')]:
    assert s_ in src['paragraphs'][k] and c_ in cand['paragraphs'][k], k
# THE BRACKET ARITHMETIC, asserted from the enumerated list rather than a numeral
# (the Book X finding C1 ruling): folds + D11 drops + D13 drops == the source's
# own bracket count.
brackets=sum(p.count('[') for p in src['paragraphs']); assert brackets==11
FOLDS=[(3,'never stop doing such good'),(12,'For the interior parts ought to be such'),
       (17,'If anyone has offended against you, consider first:'),
       (17,'from the leader of the Muses, Apollo'),(19,'in the compound mass, the body'),
       (25,'In the writings of the Ephesians')]
D11=[(9,'[things indifferent]','things indifferent'),(14,'[false friendship]','false friendship'),
     (20,'[social]','social'),(36,'[or rules]','or rules'),(36,'[aversion]','aversion')]
D13=[]
for k,s_ in FOLDS: assert s_ in cand['paragraphs'][k], (k,s_)
for k,in_src,gone in D11:
    assert in_src in src['paragraphs'][k] and gone not in cand['paragraphs'][k], k
assert (len(FOLDS),len(D11),len(D13))==(6,5,0)
assert len(FOLDS)+len(D11)+len(D13)==brackets
assert not any('[' in p for p in cand['paragraphs'])
# every cross-reference and every source citation gone
assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in cand['paragraphs'])
assert not any('Epictetus, iii' in p for p in cand['paragraphs'])
assert 'Odyssey' not in cand['paragraphs'][30] and 'HESIOD' not in cand['paragraphs'][31]
assert 'Odyssey, ix. 413.' in src['paragraphs'][30] and 'HESIOD, Works and Days, 184.' in src['paragraphs'][31]
# the "shall" rule: exactly one paragraph carries "shall"; two occurrences; both licensed
assert sum(len(re.findall(r'\bshal[lt]\b',p,re.I)) for p in src['paragraphs'])==8
assert [i+1 for i,p in enumerate(cand['paragraphs']) if re.search(r'\bshall\b',p,re.I)]==[18]
assert cand['paragraphs'][17].count('shall')==2
assert 'How then shall I take away these opinions?' in cand['paragraphs'][17]
assert 'I shall certainly not be injured' in cand['paragraphs'][17]
assert not any(re.search(r'\b(?:you|he|she|it|they|there) shall\b', p) for p in cand['paragraphs'])
# no thou-forms survive ("art" the noun is Long's own and is not one)
assert not any(re.search(r'\b(thou|thy|thee|thyself|shalt|hast|dost|doest|wilt|wast|wert|hadst|shouldst|thine)\b',p) for p in cand['paragraphs'])
# the one departure from PG's letters, and the PG readings followed against Standard Ebooks
assert 'nattering men' in src['paragraphs'][17] and 'flattering men' in cand['paragraphs'][17]
assert 'resenting them' in cand['paragraphs'][17]          # PG "vexed", not SE "veied"
assert 'again to become a part' in cand['paragraphs'][7]    # PG, not SE "be to come"
assert 'imitate the natures of things' in cand['paragraphs'][9]   # PG plural
assert 'gradually sank down' in cand['paragraphs'][5]
assert 'the skill of art. Now all arts' in cand['paragraphs'][9]  # PG's missing stop supplied
assert 'are all changes' in cand['paragraphs'][34]
assert 'as with the Christians' in cand['paragraphs'][2]
assert 'are present...' in cand['paragraphs'][17]           # Long's broken ending kept
# punctuation: six comma-dashes removed, exactly one comma added in the book
assert sum(p.count(',—') for p in src['paragraphs'])==6
assert sum(p.count(',—') for p in cand['paragraphs'])==0
added=[i+1 for i,(a,b) in enumerate(zip(src['paragraphs'],cand['paragraphs'])) if b.count(',')>a.count(',')]
assert added==[20], added
# seven paragraphs byte-identical to Long
assert [i+1 for i,(a,b) in enumerate(zip(src['paragraphs'],cand['paragraphs'])) if a==b]==[14,22,24,25,28,38,39]
print('OK'); print(hashlib.sha256(open('book11/candidate-v1.json','rb').read()).hexdigest())
print(hashlib.sha256(open('book11/source-book11.json','rb').read()).hexdigest())
print(hashlib.sha256(open('meditations-original-en.staged.json','rb').read()).hexdigest())
PY
```

Expected: `d0db3918…` (candidate v1, frozen), `41ff9b07…` (source-book11.json)
and `7798607d…` (the staged original, unchanged at Book XI step 1).

The step-1 source check is reproducible on its own, and prints its rule audit
before its diff:

```bash
cd books/staged-replacements/meditations
python3 scripts/verify_book11_source.py
```

Expected: seventeen indented runs with their profiles, eleven footnote openers
reconciling with eleven markers, no flush-left opener, no caption; then 39
reconstructed paragraphs, count match, and three differing paragraphs — XI.8,
XI.15, XI.17 — each differing only by the dagger mark.

## Next action

**Waiting on the coordinator: an independent review of Book XI.** Findings go
under `book11/review/`. Five decisions are flagged there for an explicit ruling
(XI.18 "flattering" for PG's "nattering"; XI.18's nine-word bracket folded;
XI.10's "[things indifferent]" dropped under D11 where the primary word is the
less transparent of the two; XI.26's "[Ephesians]" folded as a mark of textual
doubt; XI.15's "at once" for "forthwith" beside the dagger clause) and one is
offered for confirmation ("pancratium" kept untranslated at XI.2). This agent
does not review its own draft and has not started Book XII.
