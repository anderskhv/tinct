#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book VIII.

Reads book8/candidate-v1.json (frozen), applies the substitutions in CHANGES
(each must match exactly once in its paragraph), writes candidate-v2.json,
candidate-v2-readable.md and changes-v1-to-v2.md, and prints a per-paragraph
word diff so every changed passage can be verified against source-book8.json.
Same pattern as scripts/build_book7_v2.py.
"""
import json, os, hashlib, difflib, re

HERE = os.path.dirname(os.path.abspath(__file__))
B8 = os.path.join(HERE, '..', 'book8')
N = 61

# (paragraph number, finding id, old text, new text)
CHANGES = [
 (1, '1.1', 'and be content if you shall live the rest of your life',
             'and be content if you live the rest of your life'),
 (7, '7.1', 'according to its worth—times, substance, cause, activity, and incident',
            'according to its worth, times, substance, cause, activity, and incident'),
 (12, '12.1', 'is also more peculiarly its own',
              'is also more particularly its own'),
 (41, '41.1', 'If indeed you were making this effort absolutely,',
              'If indeed you were making this effort unconditionally,'),
 (51, '1.1', 'How then shall you possess a perpetual fountain',
             'How then will you possess a perpetual fountain'),
 (51, '51.1', 'to freedom joined with contentment, simplicity, and modesty',
              'to freedom conjoined with contentment, simplicity, and modesty'),
 (55, '55.1', 'to be released from it as soon as he shall choose',
               'to be released from it as soon as he chooses'),
 (58, '58.1', 'But if you shall have no sensation',
               'But if you have no sensation'),
 (58, '58.1', 'and if you shall acquire another kind of sensation',
               'and if you acquire another kind of sensation'),
]

# (0-based index, clause in source, clause in candidate v2) — the three dagger clauses
DAGGERS = [
 (34, 'all the other powers that it has, so we have received from it this power also',
      'all the other powers that it has, so we have received from it this power also'),
 (37, 'look and judge wisely, says the philosopher.',
      'look and judge wisely, says the philosopher.'),
 (50, 'By forming thyself hourly to freedom conjoined with contentment, simplicity, and modesty.',
      'By forming yourself hourly to freedom conjoined with contentment, simplicity, and modesty.'),
]

SHALL_RULE = (
 '## The "shall" rule (findings 1.1, 55.1, 58.1 — one decision)\n\n'
 'The three findings are answered together, **applied**, and the rule is written into `../GLOSSARY.md` under Voice '
 'and form so later books follow it without re-deciding:\n\n'
 '> Long\'s "shall / shalt" as a **plain future** — in a statement, or in a subordinate clause of condition or time — '
 'is rendered "will", or the plain present where English uses the present for future time in such a clause. "Shall" '
 'is kept only where it is current English in its own right: the first person ("I shall meet the busybody", II.1; '
 '"there I shall keep my divine part calm", VIII.45), the emphatic or volitional "shall" ("no man shall hinder me", '
 'V.29), and the deliberative "shall" of a direct question in the first or third person ("How then shall a man do '
 'this?", VIII.1). Second-person "shall" in a question ("How then shall you possess…?") is not current and takes '
 '"will".\n\n'
 'That is five changes in Book VIII: VIII.1 "if you shall live" → "if you live", VIII.55 "as soon as he shall '
 'choose" → "as soon as he chooses", VIII.58 "if you shall have" → "if you have" and "if you shall acquire" → "if '
 'you acquire", and — taking the reviewer\'s "also noted" point at VIII.51 with them, since one decision for the '
 'book means one decision — VIII.51 "How then shall you possess" → "How then will you possess".\n\n'
 '**Every "shall" left in Book VIII, classified.** Four remain, and the build asserts that there are exactly these '
 'four and no others, so the rule is mechanically enforced rather than claimed:\n\n'
 '| Where | Long | Kept because |\n|---|---|---|\n'
 '| VIII.1 | "How then shall a man do this?" | Deliberative "shall" in a direct question, third person — current '
 'English ("How shall one live?"). |\n'
 '| VIII.14 | "I shall bear in mind that he is compelled to do so" | First person — current, and the form II.1, '
 'VI.10 and VIII.45 already use. |\n'
 '| VIII.32 | "no one is able to hinder you so that each act shall not do its duty" | **Not a future.** Long\'s '
 '"shall" here is the subjunctive of a negative consecutive clause, where English still admits it; the reviewer '
 'recorded no material issue at VIII.32, and rewriting the construction ("hinder you from making each act do its '
 'duty") would move a clause the findings do not reach. Considered and left, recorded rather than passed over. |\n'
 '| VIII.45 | "there I shall keep my divine part calm" | First person. |\n\n'
 '**A correction to the finding\'s premise, recorded rather than passed over.** The review states that Books I–VI '
 'contain no second- or third-person "shall" future and that Book VII contains one. Checked paragraph by paragraph '
 'across the seven accepted candidates, that is not quite the state of the record. First-person and emphatic "shall" '
 'occur and are right (II.1, V.29, VI.10). But **three third-person plain futures stand in accepted books**: III.9 '
 '"whether there shall be in your ruling part any opinion inconsistent with nature", VII.8 "if it shall be '
 'necessary", and VII.24 "if even the perception of doing wrong shall depart". All three are Long\'s own "shall" in '
 'a subordinate clause and all three would take the present or "will" under the rule above. They are **not** '
 'reopened here — those acceptances are closed, and the divergence is formal rather than semantic — but they are '
 'listed in `../00-progress-ledger.md` under "Open, not blocking" as candidates for a v3 at a later touchpoint, on '
 'the II.5 precedent. The finding\'s conclusion is right and is applied in full; only its count of the precedent was '
 'off, and the record should say so rather than inherit a claim that a later reader would find false.'
)

NOT_APPLIED = (
 '**Findings not applied: one, 1.2, and it is an optional preference.** The four minor findings (1.1, 7.1, 55.1, '
 '58.1) are applied in full, and three of the four optional findings (12.1, 41.1, 51.1) are applied. Every finding '
 'is answered below either way, as step 6 requires.\n\n'
 '**7.1 — applied.** VIII.7\'s em dash is replaced by Long\'s comma: "according to its worth, times, substance, '
 'cause, activity, and incident". The reviewer is right that this is not a punctuation normalisation. Long\'s comma '
 'leaves six things the universal nature apportions; the em dash takes "worth" out of the list and makes the other '
 'five an appositive gloss on it. That is a real reading, and possibly the better one against the Greek, but it '
 'resolves an ambiguity Long left open, in the one direction that silently drops a term — and `continuity.md` had '
 'already defended keeping "Long\'s list … entire, \'incident\' included", which describes six items where the '
 'candidate punctuated five. Where the sheet and the text disagree, the source\'s own punctuation is what should '
 'stand; the candidate now says what the sheet says it says.\n\n'
 '**12.1 — applied.** VIII.12 "more peculiarly its own" → "more particularly its own". Long means *particularly, as '
 'belonging distinctively to it*; the dominant modern sense of the adverb is *oddly*, and this is the one word in '
 'the paragraph a reader can take backwards. The edition already has the precedent both ways and they divide on a '
 'line this case falls the far side of: the fixed collocation "peculiar to X" is current and is **kept** (III.16 '
 '"what is peculiar to the good man", VII.22 "It is peculiar to man to love even those who do wrong", VII.55 "the '
 'peculiar office"), while Long\'s attributive "peculiar" outside it is rendered — V.3 "their peculiar leading '
 'principle" → "their own ruling part", VI.3 "the peculiar quality of anything" → "the particular quality of '
 'anything". VIII.12\'s adverb is not inside the collocation, so it follows VI.3, whose word it takes.\n\n'
 '**41.1 — applied, by a third route.** The reviewer offered two: fold Long\'s bracket ("absolutely, without any '
 'reservation") or leave "absolutely" bare and record that the following sentence carries its force. The candidate '
 'takes neither and renders Long\'s word as **"unconditionally"**. The reviewer\'s diagnosis is accepted entire — '
 'Long\'s "absolutely" is technical here, it means *without the reserve clause*, and to a modern ear bare '
 '"absolutely" is an intensifier ("if you really were making this effort"), which points the sentence away from the '
 'contrast the next sentence turns on. But the fold would put one of Long\'s two alternative renderings back into '
 'the prose as an apposition, which is the thing D11 exists to prevent, and it would do so in the one place in this '
 'book where D11 was applied nine times over; a reader collating would find one bracket of the ten folded with no '
 'principle separating it from the rest. Rendering the primary word as "unconditionally" keeps D11 exactly as it '
 'stands — the bracket is dropped, nothing is folded, no word is added, one word answers one word — and it is '
 'Long\'s own first alternative, so the sense comes from him and not from the drafter. It is the same class of '
 'choice as "inexpugnable" → "impregnable" at VIII.48 and "enlighten" → "light up" at VIII.57: the current English '
 'word for what Long\'s word says. The one cost is recorded: "absolutely" is not archaic, so this is a rendering '
 'chosen for sense rather than for register, and the evidence for the sense is Long\'s own dropped gloss.\n\n'
 '**51.1 — applied.** "Joined" reverts to Long\'s "conjoined". The reviewer\'s ground is the stronger one: '
 '"conjoined with" is formal but current English, not in the class of "affrighted" or "inexpugnable", so the change '
 'bought little; and it was made inside the one clause in the paragraph that Long marks as textually uncertain (the '
 'dagger sits at "By forming +", PG line 5345), where this package\'s practice — VI.50, confirmed at VII.16 and '
 'followed everywhere else in this book — is that the clause stands as Long has it with pronouns modernised and '
 'glossary renderings applied. "Conjoined" → "joined" is neither a pronoun nor a glossary row. If anything Long\'s '
 'word is the stronger one for what Marcus means: freedom fused with contentment, simplicity and modesty rather '
 'than merely accompanied by them. `continuity.md` had listed the change flatly among the paragraph\'s '
 'modernisations without noting that it fell inside a dagger clause; that omission is now corrected there too. '
 '"Potable water" → "drinkable water" stands: it is outside the dagger clause, which begins at "By forming".\n\n'
 '**1.2 — not applied, and recorded as considered.** Long punctuates VIII.1\'s thought as a quoted one ("throw away '
 'the thought, How thou shall seem [to others]"), and the candidate reports it ("throw away the thought of how you '
 'will seem to others"). The reviewer proposed the direct form — *How will I seem to others?* — for uniformity with '
 'VIII.2, VIII.14 and VIII.36, and did not press it. It is declined for a reason the reviewer names and then sets '
 'aside: **Long\'s quoted thought is in the second person**, because Marcus is addressing himself, and every other '
 'quoted thought in this book is in the first ("How is this with respect to me?", VIII.2). Rendering it directly '
 'forces a choice between two wrong things — keep the second person and the quotation reads as someone else '
 'speaking to Marcus ("How will you seem to others?"), or switch to the first person and the candidate has changed '
 'the person of a sentence Long prints in another. The reported form keeps Long\'s person and his object, costs '
 'nothing in sense, and is what the rest of the paragraph\'s syntax (a list of things thrown away) wants. The '
 'uniformity the finding seeks is uniformity with paragraphs whose thoughts Long himself puts in the first person; '
 'it is not a rule this paragraph breaks. Recorded in `continuity.md` at VIII.1 so it is not raised again as '
 'unconsidered.\n\n'
 'Of the reviewer\'s unnumbered "also noted" points, one required a change and it is made: the fourth "shall" at '
 'VIII.51 is taken with 1.1, 55.1 and 58.1 (see the rule above). The rest are confirmations and none required a '
 'change — VIII.7\'s "impulses" for Long\'s "movements" (the *hormē* row, right here because the contrast is with '
 'assent and with desire and aversion), VIII.41\'s "animal nature" kept twice and VIII.12\'s "irrational animals" '
 'kept (Long\'s scale is plant, animal, intelligent, and the rational-being row does not reach the middle term), '
 'VIII.51\'s "[and not a mere well]" rightly folded rather than dropped, VIII.55\'s "[of one man]" rightly folded, '
 'VIII.56\'s "the ruling power" kept as Long\'s own distinct phrase, VIII.59\'s uncommaed "then" kept.'
)

RULINGS = (
 '## The three flagged decisions, all ruled the drafter\'s way and now settled\n\n'
 'None is left open; `continuity.md` moves all three out of the flagged section.\n\n'
 '**1. VIII.37 "Pergamus" for PG\'s "Fergamus" — upheld.** "Fergamus" refers to nothing; F-for-P is the same '
 'mechanical class as the three other PG slips found inside the same 486 lines; Standard Ebooks\' "Pergamus" '
 'restores Long rather than importing an editor; and D6 makes PG the base text for *the text*, not a rule that '
 'typographic damage be reproduced — this same book already declines to reproduce a stray comma (VIII.6) and a '
 'misprint (VIII.45). The departure stays recorded in three places.\n\n'
 '**2. VIII.57\'s transliterated Greek — kept, and the drafter\'s reasoning is corrected as too weak.** The draft '
 'flagged this as a *weaker* case than VII.13 on the ground that "Long\'s English carries the etymology without the '
 'Greek". The reviewer showed that it does not, and the reviewer is right: **"its rays are called Extensions '
 'because they are extended" is a tautology in English, not an etymology.** No English speaker calls rays '
 '"Extensions"; Long coined the capitalised word for this one sentence precisely in order to expose the derivation '
 'of ἀκτῖνες from ἐκτείνεσθαι, and his own footnote on the passage — "A piece of bad etymology" — shows that what '
 'he took himself to be printing was an etymological claim about two Greek words. Without `(aktines)` and '
 '`(apo tou ekteinesthai)` the sentence makes no claim at all. So the case for keeping the Greek here is **stronger '
 'than the drafter claimed, not weaker** — it is the same case as VII.13\'s, where the argument turns on one '
 'letter: in both places Long prints Greek in his body text because his sentence is not a sentence without it. The '
 '`../GLOSSARY.md` exception covers it by its letter and by its rationale. Standard Ebooks\' endnote is a route '
 'open to an edition that has endnotes; this one has none, and an endnote is apparatus, which the package drops. '
 'The corrected reasoning is written into `continuity.md` so a later book does not reopen the question on the '
 'drafter\'s weaker ground.\n\n'
 '**3. "Effusion" / "effused" at VIII.51 and VIII.57 — kept.** Uncommon, not archaic; the VIII.57 argument is a '
 'three-times-repeated antithesis with "extension" that no plain substitute holds against three times, and '
 '"outpouring", the nearest, is already in use in the same sentence for a different word; and rendering the same '
 'Long word two ways across the two paragraphs would break D10 inside one book.\n\n'
 'The reviewer also tested the step-1 no-rebuild finding three ways — re-running the build (`cmp` clean, sha256 '
 'still `7798607d…`), re-reading PG lines 4933–5418 class by class, and recounting the brackets — and upheld it, '
 'including the judgement that the two flush-left bracket lines in VIII.41 (PG 5247, 5249) are Long\'s own wrapped '
 'text and not footnote openers. All six base-text points were located and read at their cited PG lines and all six '
 'upheld, the two PG-over-Standard-Ebooks calls (VIII.2\'s article, VIII.44\'s "not") on what PG prints plus the '
 'internal sense of each passage, without depending on an SE claim.'
)

FLOW = (
 '**Flow read (step 7):** `candidate-v2-readable.md` read continuously VIII.1–VIII.61 after the build. No change '
 'was made from it. The eight corrected clauses read without a snag in place. VIII.1 now runs "throw away the '
 'thought of how you will seem to others, and be content if you live the rest of your life in such a way as your '
 'nature wills", and the deliberative "How then shall a man do this?" four sentences later is the only "shall" left '
 'in the paragraph, so it reads as a question and not as a leftover. VIII.7\'s six-item list is a list again, and '
 'the sentence that follows it — comparing all the parts of one thing with all the parts of another — lands on a '
 'list of parts as it should. VIII.12\'s "more particularly its own, and more suitable to its nature, and indeed '
 'also more agreeable" is three comparatives in one direction, with no word pulling against them. VIII.41\'s "if '
 'you were making this effort unconditionally" now sets up "But if you take into consideration the usual course of '
 'things" as the contrast Long built. VIII.51 keeps Long\'s "conjoined" inside the dagger clause, so the paragraph '
 'ends as uncertainly as his does, and its question now reads "How then will you possess a perpetual fountain and '
 'not a mere well?". VIII.55 closes on "as soon as he chooses", which is the sting of the meditation and is now in '
 'the plain present it needs. VIII.58 sets both conditions in the present against both consequences in the future, '
 'so the sentence no longer runs an archaic "shall" against a current "will" twice in fifty-five words.\n\n'
 'Terminology was checked across the accepted books at the read: "the nature of the whole" for all three of Long\'s '
 'shapes (VIII.5, VIII.6, VIII.35) beside his adjective "the universal nature" (VIII.35, in the same sentence), '
 'kept apart; "the ruling part" (VIII.48, VIII.61) beside Long\'s own distinct "the ruling power" (VIII.56); '
 '"rational being" (VIII.41, VIII.46) beside "animal nature" and "irrational animals" (VIII.12, VIII.41), kept '
 'apart for the reason `continuity.md` gives; "according to nature" (VIII.5, VIII.7, VIII.12, VIII.19, VIII.45, '
 'VIII.46); "impressions" (VIII.13, VIII.26, VIII.29, VIII.49) beside "imagination" (VIII.29); "impulse" (VIII.7, '
 'VIII.41) for the *hormē* sense; "resent" (VIII.8, VIII.17, VIII.47, VIII.50); "feelings" (VIII.1); "the common '
 'good" (VIII.12, VIII.23); "the god within" (VIII.45); "opinion" (VIII.14, VIII.29, VIII.40, VIII.47, VIII.49); '
 '"the elements" and "dissolution" (VIII.18, VIII.25); "calm" (VIII.45, VIII.48) — all as the glossary and the '
 'seven earlier acceptances have them. Long\'s own uncommon but current words stand because they are his '
 '("effusion", "effused", "sphere", "briers", "limpid", "sluggish", "sensuous"), his Greek stands at VIII.57 for '
 'the reason the reviewer ruled, and the three dagger clauses leave their sentences exactly as obscure as Long '
 'leaves them. Nothing else changed; see `ACCEPTANCE.md`.'
)


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def main():
    v1 = json.load(open(os.path.join(B8, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B8, 'source-book8.json'), encoding='utf-8'))
    paras = list(v1['paragraphs'])
    log = []
    for n, fid, old, new in CHANGES:
        i = n - 1
        assert paras[i].count(old) == 1, (n, fid, old)
        paras[i] = paras[i].replace(old, new)
        log.append((n, fid, old, new))
    v2 = {'number': v1['number'], 'title': v1['title'], 'paragraphs': paras}
    assert len(paras) == N and all(p.startswith(f'{i+1}. ') for i, p in enumerate(paras))
    for k, s, c in DAGGERS:
        assert s in src['paragraphs'][k] and c in paras[k], (k, s)
    # Long's in-text Greek survives (the reviewer's ruling on VIII.57)
    assert '(aktines)' in paras[56] and '(apo tou ekteinesthai)' in paras[56]
    # the one departure from PG's letters, and the PG slips not reproduced
    assert 'Fergamus' in src['paragraphs'][36] and 'Pergamus' in paras[36]
    assert 'comformably' not in paras[44]
    assert 'to take them away' in paras[5]
    assert 'do not consider' in paras[43]
    # the "shall" rule: exactly two "shall" left, both licensed
    kept = [(i + 1, p) for i, p in enumerate(paras) if re.search(r'\bshall\b', p)]
    assert [i for i, _ in kept] == [1, 14, 32, 45], kept
    assert 'How then shall a man do this?' in paras[0]
    assert 'I shall bear in mind' in paras[13]
    assert 'each act shall not do its duty' in paras[31]
    assert 'there I shall keep my divine part calm' in paras[44]
    # no second-person and no plain-future "shall" survives
    assert not any(re.search(r'\b(?:you|he|she|it|they|there) shall\b', p) for p in paras)
    # no bracket and no cross-reference survives
    assert not any('[' in p for p in paras)
    assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in paras)
    json.dump(v2, open(os.path.join(B8, 'candidate-v2.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 8 — modern-English candidate v2', '', f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see `changes-v1-to-v2.md`). '
             'Paragraph IDs `B08-Pxxx` are for reference only; the leading number is part of the text.', '']
    for i, p in enumerate(paras):
        lines += [f'**[B08-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B8, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    ch = ['# Changes v1 → v2 — Meditations, Book VIII', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, with the '
          'round-1 finding it answers (`review/findings-v1.md`). Applied mechanically by '
          '`scripts/build_book8_v2.py`; each "old" string matched exactly once in its paragraph. Paragraphs not '
          'listed are byte-identical between v1 and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B08-P{n:03d} (VIII.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of {N} ({", ".join("VIII."+str(n) for n in changed)}). '
           'Unchanged: ' + ', '.join('VIII.' + str(n) for n in range(1, N + 1) if n not in changed) + '.', '',
           SHALL_RULE, '', NOT_APPLIED, '', RULINGS, '', FLOW, '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B8, "candidate-v1.json"))}`; candidate-v2.json '
           f'`{sha(os.path.join(B8, "candidate-v2.json"))}`.']
    open(os.path.join(B8, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n - 1].split()
        b = paras[n - 1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'VIII.{n}: ' + ' '.join(d))
    print('v1 sha256', sha(os.path.join(B8, 'candidate-v1.json')))
    print('v2 sha256', sha(os.path.join(B8, 'candidate-v2.json')))
    sw = sum(len(p.split()) for p in src['paragraphs'])
    cw = sum(len(p.split()) for p in paras)
    print('words source', sw, 'v2', cw, 'ratio %.4f' % (cw / sw))
    print('min paragraph ratio %.2f' % min(len(c.split()) / len(s.split())
                                           for s, c in zip(src['paragraphs'], paras)))


if __name__ == '__main__':
    main()
