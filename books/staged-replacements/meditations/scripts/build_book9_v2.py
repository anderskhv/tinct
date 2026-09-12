#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book IX.

Reads book9/candidate-v1.json (frozen), applies the substitutions in CHANGES
(each must match exactly once in its paragraph), writes candidate-v2.json,
candidate-v2-readable.md and changes-v1-to-v2.md, and prints a per-paragraph
word diff so every changed passage can be verified against source-book9.json.
Same pattern as scripts/build_book8_v2.py.
"""
import json, os, hashlib, difflib, re

HERE = os.path.dirname(os.path.abspath(__file__))
B9 = os.path.join(HERE, '..', 'book9')
N = 42

# (paragraph number, finding id, old text, new text) — applied in order
CHANGES = [
 (1, '1.1', 'contrary to truth, since he had received powers from nature',
             'contrary to truth, for he had received powers from nature'),
 (1, '1.2', 'is the nature of the things that are, and the things that are have a relation',
             'is the nature of the things that are; and the things that are have a relation'),
 (9, '9.1', 'the nurture of young birds, and in a way, loves;',
             'the nurture of young birds, and, in a way, loves;'),
 (40, '40.1', 'Do you pray thus: How shall I not desire to lie with her?',
               'You, pray thus: How shall I not desire to lie with her?'),
 (40, '40.1', 'You pray thus: How shall I not desire to be released?',
               'You, pray: How shall I not desire to be released?'),
]

# (0-based index, clause in source, clause in candidate v2) — the three dagger clauses
DAGGERS = [
 (5, 'present disposition of contentment with everything which happens',
     'present disposition of contentment with everything which happens'),
 (25, 'But enough', 'But enough of this.'),
 (26, 'towards the attainment of those things on which they set a value.',
      'towards the attainment of those things on which they set a value.'),
]

SUBSTANTIVE = (
 '## Finding 40.1 — the substantive one, applied\n\n'
 'Long\'s three corrective turns in IX.40 are **imperatives**: "Do thou pray thus:", "Pray thou:", "Thou thus:". '
 'The candidate rendered them "Do you pray thus:", "You pray thus:", "You thus:", and the reviewer is right that '
 'two of the three stopped being imperatives in modern English. "Do you pray thus:" is a yes/no question — the '
 '"do" that makes an emphatic imperative with "thou" makes an interrogative with "you", and only the colon holds '
 'it back. "You pray thus:" is a plain declarative, a statement that the reader already prays that way, which is '
 'the exact reverse of Marcus\'s point. A turn that survives in position and word count but not in **mood** has '
 'not survived, and the defect is the worse for sitting in the one passage whose base text the drafter had '
 'defended precisely on the ground that the alternation must hold (PG\'s "Pray thou" against Standard Ebooks\' '
 '"Another prays").\n\n'
 '**The reviewer\'s repair is taken as proposed**, and nothing better was found. The vocative comma makes all '
 'three turns unambiguously imperative, keeps Long\'s fronted second person — which is the whole rhetorical '
 'device of the passage — keeps the three-word / two-word / two-word diminuendo against Long\'s four / two / two, '
 'and adds no word:\n\n'
 '| Long | v1 | v2 |\n|---|---|---|\n'
 '| Do thou pray thus: | Do you pray thus: | **You, pray thus:** |\n'
 '| Pray thou: | You pray thus: | **You, pray:** |\n'
 '| Thou thus: | You thus: | You thus: *(unchanged)* |\n\n'
 'Two alternatives were weighed and rejected. **"Do pray thus:"** is a real emphatic imperative in modern English '
 'but drops the fronted second person, and the fronting is what sets Marcus\'s turn against the other man\'s. '
 '**The comma alone in both first turns** ("You, pray thus:" twice) saves the mood but flattens the diminuendo, '
 'which the reviewer names as the lesser repair and which the reviewer prefers not to take. The three turns now '
 'read as three commands to himself, shortening as Long\'s shorten, against "One man prays thus:", "Another prays '
 'thus:", "Another thus:".'
)

APPLIED_MINOR = (
 '## The three minor findings\n\n'
 '**1.1 — applied, both halves.** The reviewer found that `continuity.md` records "\'Inasmuch as\' → \'since\' '
 '(four times)" while IX.1 contains only **three** "inasmuch as", and that the fourth "since" silently replaced '
 'Long\'s ordinary "for", unrecorded. Both halves are answered. The sheet is corrected to three. And the fourth '
 'substitution is **undone**: "for he fights against it who is moved of himself to that which is contrary to '
 'truth, **for** he had received powers from nature…". Long\'s "for" is current English and needed no '
 'modernising; the two "for"s mark the two explanatory descents of a sentence that already carries three "since", '
 'and flattening all four connectives into one word levels a structure Long built. The rule the package has '
 'followed since Book I is that Long\'s own current word stands unless something is wrong with it, and nothing '
 'was wrong with this one. (The comma the candidate removed before "who is moved of himself" stays removed; the '
 'reviewer endorsed that separately.)\n\n'
 '**9.1 — applied.** IX.9 "and the nurture of young birds, and in a way, loves" → "and the nurture of young '
 'birds, **and, in a way, loves**". The glossary substitution "in a manner" → "in a way" is right, but it changed '
 'what Long\'s comma placement could carry: "in a manner" read as a set phrase and took the reader past it, while '
 '"in a way, loves" invites a first reading in which "loves" is a **verb** — "and in a way [it] loves" — when it '
 'is the fourth item in the list of what is found among animals. One comma, no word changed, the hedge properly '
 'parenthetical, and "loves" recovered as the noun it is. This is the one place in Book IX where a modern reader '
 'was likely to mis-parse a sentence.\n\n'
 '**41.1 — applied, and it is a rule fix rather than a text change.** IX.41 keeps Long\'s "shall" in "how the '
 'mind … shall be free from disturbances", and the reviewer confirms the rendering and would resist "will" '
 '(Epicurus\'s standing problem, not a forecast). But the "shall" rule as written at Book VIII acceptance '
 'licensed "the deliberative \'shall\' of a **direct** question", and this is an indirect one, inside reported '
 'speech. **`../GLOSSARY.md` is widened** to "the deliberative \'shall\' of a question, **direct or indirect**, '
 'in the first or third person", with IX.41 added beside VIII.1 as the example. Made **before Book X was '
 'drafted**, in its own commit, so the next book is drafted under the corrected rule rather than under a rule a '
 'literal reader would apply against the text. `candidate-v1.json` is untouched by this finding and '
 '`candidate-v2.json` keeps the "shall".'
)

OPTIONAL = (
 '## The five optional findings — one applied, four declined, each with its reason\n\n'
 '**1.2 — applied.** IX.1 "the nature of **the things that are, and the things that are** have a relation" → '
 '"the nature of **the things that are; and the things that are** have a relation". The two definite articles the '
 'candidate added stay: Long\'s anarthrous "things that are" is a technical term (*ta onta*) and the article is '
 'what makes a modern reader hear it as one rather than as a loose plural. The **semicolon comes back**. It was '
 'doing work Long meant it to do — it separates the definition of the universal nature from the consequence drawn '
 'about it — and lowering it left a comma splicing two independent clauses, which is a defect in the candidate\'s '
 'own English and not a modernisation of Long\'s. The two halves of the finding are separable and are separated: '
 'keep what helped, restore what was lost.\n\n'
 '**3.1 — declined, and recorded.** IX.3 Long: "thou wilt **be made** best reconciled to death"; candidate: "you '
 'will **be** best reconciled to death". The reviewer notes the dropped auxiliary carries a shade — the observing '
 '*brings you* to reconciliation — and then says plainly that the repair offered ("you will be brought best to '
 'terms with death") is further from Long than the candidate is, and that the reviewer would sooner see the drop '
 'recorded than undone. That is the right disposition and it is taken. "Be made best reconciled" is not English '
 'anyone writes now; the plain passive is, and the causal shade is still carried by the sentence\'s own '
 '"by observing the objects from which you are going to be removed", which is a means clause and can only mean '
 'that the observing does the work. The drop is now listed at IX.3 in `continuity.md` among the paragraph\'s '
 'decisions, which is the part of the finding that was a real omission.\n\n'
 '**7.1 — declined, and recorded.** IX.7 keeps Long\'s mixed pointing between four coordinate imperatives — '
 '"Wipe out imagination; check desire: extinguish appetite: keep the ruling part in its own power." The reviewer '
 'rates it optional, would not press it, and says consistency with eight accepted books is worth more than the '
 'small gain. It is. Long\'s accidentals are reproduced everywhere else in this package unless they misdirect '
 '(the comma removed at IX.29 "matters political and, as they suppose"), and nothing here misdirects: the four '
 'commands are four commands under any pointing, and no reader can take a colon between two imperatives as a '
 'change of subject. Repointing would also be the first time the edition normalised punctuation Long left uneven '
 'for no reason but evenness, and `../GLOSSARY.md` does not license it. Recorded at IX.7 in `continuity.md` as '
 'considered rather than passed over.\n\n'
 '**28.1 — declined, and recorded.** IX.28 Long: "if chance rules, **do not thou also be** governed by it"; '
 'candidate: "do not **let yourself** also be governed by it"; the reviewer proposes "do not be governed by it '
 '**yourself**." The objection is fair — "let yourself" carries a faint note of permission that Long\'s plain '
 'passive does not — but the repair drops Long\'s **"also"**, and "also" is the hinge of the sentence: chance '
 'rules the universe, and the meditation is that it need not rule **you as well**. Trading a faint shade for a '
 'load-bearing word is the worse exchange. Nor is the shade wrong in this sentence: what Marcus is asserting is '
 'precisely that the ruling part is his to keep, so that being governed by chance is something a man permits. '
 'Every alternative that keeps both the plain passive and "also" is worse English than either candidate — '
 '"do not also be governed by it" splits the verb, "do not be governed by it also" attaches "also" to "it", and '
 '"do not be governed by it yourself as well" adds two words to render one emphatic pronoun that has no modern '
 'form at all. The reviewer\'s own confidence is medium and the finding grants that nobody will misread the '
 'candidate. Kept, with the reasoning added at IX.28 in `continuity.md`.\n\n'
 '**29.1 — declined, and recorded.** IX.29 Long: "**All drivellers.**"; candidate: "**All of them drivel.**" The '
 'reviewer\'s diagnosis is accepted — Long\'s fragment is a nominal *verdict* thrown at the people just '
 'described, and the candidate reports what they do instead — and the reviewer\'s own confidence is low, the '
 'point being one of ear. Both repairs offered cost more than the shape is worth. "Drivellers, all of them." '
 'restores the noun `continuity.md` ruled out as no longer current, which is the whole reason the sentence was '
 'touched. "Drivel, all of it." keeps a nominal fragment with the modern word but **moves the referent** from the '
 'people to their talk: Long\'s verdict is on the men "playing the philosopher", not on what they say, and the '
 'next sentence ("Well then, man: do what nature now requires") turns from those men to Marcus himself. The '
 'candidate keeps Long\'s referent, his three words and his contempt, and pays for it with the grammatical shape '
 'alone, which is the smallest of the three losses available. Recorded at IX.29 in `continuity.md`.'
)

RULINGS = (
 '## The reviewer\'s rulings on the base text and the "shall" audit — all settled\n\n'
 'Every base-text call the draft made was endorsed, and the two decisions flagged for a ruling plus the one '
 'offered for confirmation are now **closed**. `continuity.md` and `provenance.json` move all three out of the '
 'flagged section.\n\n'
 '**1. IX.34 "poor souls" for PG\'s "pool souls" — endorsed without reservation, and settled.** "Pool souls" is '
 'not English; Long writes "approach their **poor** souls" in the same construction seven sections earlier at '
 'IX.27 (PG line 5664), and the reviewer confirmed by grep that those are the **only** two occurrences of the '
 'phrase in the whole PG file, so the internal witness is exact rather than approximate; Standard Ebooks reads '
 '"poor souls". Same shape as VIII.37\'s Fergamus/Pergamus and the same answer. It stays the one departure from '
 'PG\'s letters in Book IX, recorded in three places.\n\n'
 '**2. IX.35 "bound", not Standard Ebooks\' "found" — endorsed.** The verb governed by "condemned to be" has to '
 'express being held fast; "condemned to be found in never ceasing evil" says nearly nothing and looks like an '
 'eye-skip from "no power has ever been **found** in so many gods" eleven words earlier, which is the shape '
 'compositor and OCR errors take. PG followed.\n\n'
 '**3. IX.35, PG\'s ellipsis kept against Standard Ebooks\' added "done" — endorsed.** Long\'s participle is '
 'gapped from the previous clause ("all things are now **done** well, and from eternity have been in like '
 'form"), which is ordinary English and ordinary Long; SE fills the gap, which is an editor\'s improvement and '
 'not a reading. D6 governs and the candidate reproduces the ellipsis.\n\n'
 '**4. IX.40 "Pray thou", not Standard Ebooks\' "Another prays" — endorsed, on internal evidence alone.** SE\'s '
 'reading gives four petitions and two corrections and assigns to "another man" the line "How shall I not desire '
 'to be released?", which is a Stoic corrective and cannot be the prayer of the man who has just asked "How shall '
 'I be released from this?". PG restores the alternation. (The *rendering* of those turns is finding 40.1, '
 'applied above; the base-text call is right and is what makes the passage coherent.)\n\n'
 '**5. IX.29 "insolence" — CLOSED in favour of PG, on grounds stronger than D6.** The draft followed PG under D6 '
 'and recorded the variant as genuinely open. The reviewer closes it on the sense, and the reasoning is adopted '
 'in full: the meditation\'s whole subject is the temptation to grandiosity — the worthless people "playing the '
 'philosopher", the refusal to "expect Plato\'s Republic", being "content if the smallest thing goes on well", '
 'the warning not to act "like tragedy heroes" — and the final clause answers "Simple and modest is the work of '
 'philosophy", whose opposite is *showy and proud*, not *lazy and proud*. **Indolence has no antecedent anywhere '
 'in the meditation** and would introduce a vice Marcus has not been discussing; insolence is the vice he has '
 'spent the paragraph naming and pairs naturally with pride. Separately, "indolence"/"insolence" is a one-letter '
 'confusion of exactly the kind a re-keyed text produces, and SE\'s Long is a re-keying. Recorded as **settled, '
 'not open**, with the reviewer\'s stated limitation kept on the record: the reviewer did not consult a Greek '
 'text, and a reviewer with the Greek could overturn it — but on the English evidence it is not open.\n\n'
 '**6. IX.28, the Standard Ebooks paragraph break correctly ignored — endorsed.** SE breaks typographically '
 'before "Soon will the earth cover us all", so an automatic count of its Book IX returns 43. PG prints §28 '
 'whole, 42 is the standard section count, no text differs on either side of the break, and a section break there '
 'would orphan "In a word, if there is a god, all is well" from the three-way disjunction it concludes. It is '
 'also the only choice compatible with the hard paragraph-alignment constraint in `../WORKFLOW.md`.\n\n'
 '**7. The "shall" audit passed, and IX.29 is confirmed.** Long has eleven "shall/shalt" in Book IX; the '
 'candidate keeps eight; the three removed are all in IX.3 and all are plain futures in clauses of time or '
 'condition. The reviewer classified all eleven independently and matched the drafter\'s report exactly. The '
 'eight kept are licensed: six first-person deliberative questions at IX.40, the indirect deliberative question '
 'at IX.41 (which produced finding 41.1, the rule-wording fix above), and **IX.29 "They themselves shall judge", '
 'confirmed as the emphatic or volitional "shall" and kept** — the reviewer would resist "will" firmly, because '
 'Marcus is not forecasting a verdict on Alexander, Philippus and Demetrius but dismissing the question of their '
 'merits as none of his business, and the next sentence ("But if they acted like tragedy heroes, no one has '
 'condemned me to imitate them") is a rebuttal of a claim on him, not the second half of a prediction. No '
 'second-person and no plain-future "shall" survives anywhere in the book.\n\n'
 '**8. The step-1 no-rebuild finding was tested by the stronger method and upheld.** The reviewer did **not** '
 're-run the build, on the stated ground that byte-identity to a re-run proves only that the file matches the '
 'script — which is how the Book IV captions and the Book VII footnotes survived. PG lines 5419–5864 were '
 're-extracted by a reconstruction written from scratch and diffed word for word against the staged Book IX. '
 '**The only three differences in the whole book are the three documented dagger marks.** The caption at PG 5628 '
 'is gone and IX.21/IX.22 are whole; all eight footnotes are indented and stripped, with no flush-left footnote '
 'opener *or body* (a flush-left body would have shown as a diff and none did); no running head, page number or '
 'catchword; no verse and no verse citation; no Greek in the body. That method is adopted for Book X.'
)

NOT_CHANGED = (
 '**Findings applied: 40.1 (substantive), 1.1, 9.1 and 41.1 (minor), and 1.2 (optional). Declined: four optional '
 'findings — 3.1, 7.1, 28.1, 29.1 — each recorded as considered, with its reason, in `continuity.md`.** Every one '
 'of the nine findings is answered either way, as step 6 requires. Of the reviewer\'s unnumbered "also noted" '
 'points, none required a change: they are confirmations of renderings the glossary or `continuity.md` already '
 'fixes, and the reviewer\'s two book-level observations (the inferential "then" comma pairs, twice in the book; '
 'the four of Long\'s commas silently removed and one added) raise nothing beyond finding 9.1, which is applied.'
)

FLOW = (
 '**Flow read (step 7):** `candidate-v2-readable.md` read continuously IX.1–IX.42 after the build. No change was '
 'made from it. The four corrected clauses read without a snag in place. IX.1 now runs "…he who lies '
 'unintentionally, since he is at variance with the universal nature, and since he disturbs the order by fighting '
 'against the nature of the world; for he fights against it who is moved of himself to that which is contrary to '
 'truth, for he had received powers from nature through the neglect of which he is not able now to distinguish '
 'falsehood from truth" — three "since" for the three descents of the definition, then two "for" for the two '
 'explanatory descents, which is Long\'s shape restored; and earlier in the same paragraph the semicolon again '
 'separates what the universal nature *is* from what follows about it. IX.9\'s list now ends "swarms of bees, and '
 'herds of cattle, and the nurture of young birds, and, in a way, loves", four items and a hedge, with no verb to '
 'stumble over. IX.40\'s three turns are three commands — "You, pray thus: How shall I not desire to lie with '
 'her?", "You, pray: How shall I not desire to be released?", "You thus: How shall I not be afraid to lose him?" '
 '— shortening against "One man prays thus:", "Another prays thus:", "Another thus:", so the alternation the '
 'base-text ruling preserved is now audible in the rendering as well.\n\n'
 'Terminology was checked across the accepted books at the read: "the universal nature" (IX.1 ×7, IX.35) kept as '
 'its own term beside "the common nature" (IX.29), "the common intelligent nature" (IX.9) and "the whole '
 'universe" (IX.19, IX.32); "the ruling part" for both "ruling faculty" and "leading principles" (IX.7, IX.15, '
 'IX.18, IX.22 ×3, IX.26, IX.34, IX.39); "rational being" (IX.1, IX.8, IX.9, IX.16) beside the beasts Long means '
 'by "animals devoid of reason" (IX.8 ×2, IX.9 ×3), kept apart; "intelligent beings" at IX.9 where Long means '
 'men; "divinity" at IX.1 under the row extended for this book; "opinion" (IX.6, IX.13, IX.21, IX.29 ×2, IX.32); '
 '"imagination" (IX.7); "disturbances" (IX.31, IX.41); "impulse" for the *hormē* sense (IX.21, IX.31) beside '
 '"movement" for motion (IX.1, IX.28, IX.41), the line drawn where the glossary draws it; "change" for "mutation" '
 '(IX.19) beside Long\'s own "transformations" (IX.28); "dissolution" (IX.3, IX.32 ×2, IX.33); "commonplace" '
 '(IX.3); "kindness"/"kind" and "the common good" (IX.42); "a name after death" (IX.30); "in a way" (IX.9 ×2, '
 'IX.19, IX.28) — all as the glossary and the eight earlier acceptances have them. Long\'s own uncommon but '
 'current words stand because they are his: "envelope", "ephemeral", "armistices", "apish tricks", "winter '
 'torrent", "recompense", "perchance" inside the quoted cry. The three dagger clauses (IX.6, IX.26, IX.27) leave '
 'their sentences exactly as obscure as Long leaves them. The twelve short meditations are still at Long\'s '
 'length, four of them byte-identical to him. Nothing else changed; see `ACCEPTANCE.md`.'
)


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def main():
    v1 = json.load(open(os.path.join(B9, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B9, 'source-book9.json'), encoding='utf-8'))
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
    # IX.40: all three corrective turns are imperatives, and the diminuendo holds
    assert 'You, pray thus: How shall I not desire to lie with her?' in paras[39]
    assert 'You, pray: How shall I not desire to be released?' in paras[39]
    assert 'You thus: How shall I not be afraid to lose him?' in paras[39]
    assert 'Do you pray thus' not in paras[39] and 'You pray thus' not in paras[39]
    assert paras[39].count('How shall I') == 6
    # IX.1: Long's "for" restored, three "since" left, the semicolon back
    assert 'contrary to truth, for he had received powers' in paras[0]
    # four "since" left: Long's own "For since" plus the three that render his
    # three "inasmuch as"; the fourth, which had replaced his "for", is undone
    assert paras[0].count('since ') == 4 and paras[0].count(', for he') == 1
    assert 'the nature of the things that are; and the things that are have' in paras[0]
    # IX.9: the hedge is parenthetical
    assert 'and, in a way, loves;' in paras[8]
    # the one departure from PG's letters, and the PG readings followed against SE
    assert 'pool souls' in src['paragraphs'][33] and 'poor souls' in paras[33]
    assert 'poor souls' in src['paragraphs'][26] and 'poor souls' in paras[26]
    assert 'bound in never ceasing evil' in paras[34]
    assert 'insolence and pride' in paras[28]
    # the "shall" rule: exactly three paragraphs carry "shall", all licensed
    kept = [i + 1 for i, p in enumerate(paras) if re.search(r'\bshall\b', p)]
    assert kept == [29, 40, 41], kept
    assert paras[28].count('They themselves shall judge') == 1
    assert 'shall be free from disturbances' in paras[40]
    assert not any(re.search(r'\b(?:you|he|she|it|they|there) shall\b', p) for p in paras)
    # no bracket and no cross-reference survives
    assert not any('[' in p for p in paras)
    assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in paras)
    json.dump(v2, open(os.path.join(B9, 'candidate-v2.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 9 — modern-English candidate v2', '', f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see `changes-v1-to-v2.md`). '
             'Paragraph IDs `B09-Pxxx` are for reference only; the leading number is part of the text.', '']
    for i, p in enumerate(paras):
        lines += [f'**[B09-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B9, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    ch = ['# Changes v1 → v2 — Meditations, Book IX', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, with the '
          'round-1 finding it answers (`review/findings-v1.md`). Applied mechanically by '
          '`scripts/build_book9_v2.py`; each "old" string matched exactly once in its paragraph. Paragraphs not '
          'listed are byte-identical between v1 and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B09-P{n:03d} (IX.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of {N} ({", ".join("IX."+str(n) for n in changed)}). '
           'Unchanged: ' + ', '.join('IX.' + str(n) for n in range(1, N + 1) if n not in changed) + '.', '',
           NOT_CHANGED, '', SUBSTANTIVE, '', APPLIED_MINOR, '', OPTIONAL, '', RULINGS, '', FLOW, '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B9, "candidate-v1.json"))}`; candidate-v2.json '
           f'`{sha(os.path.join(B9, "candidate-v2.json"))}`.']
    open(os.path.join(B9, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n - 1].split()
        b = paras[n - 1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'IX.{n}: ' + ' '.join(d))
    print('v1 sha256', sha(os.path.join(B9, 'candidate-v1.json')))
    print('v2 sha256', sha(os.path.join(B9, 'candidate-v2.json')))
    sw = sum(len(p.split()) for p in src['paragraphs'])
    cw = sum(len(p.split()) for p in paras)
    print('words source', sw, 'v2', cw, 'ratio %.4f' % (cw / sw))
    print('min paragraph ratio %.2f' % min(len(c.split()) / len(s.split())
                                           for s, c in zip(src['paragraphs'], paras)))


if __name__ == '__main__':
    main()
