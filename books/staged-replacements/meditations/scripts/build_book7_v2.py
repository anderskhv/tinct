#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book VII.

Reads book7/candidate-v1.json (frozen), applies the substitutions in CHANGES
(each must match exactly once in its paragraph), writes candidate-v2.json,
candidate-v2-readable.md and changes-v1-to-v2.md, and prints a per-paragraph
word diff so every changed passage can be verified against source-book7.json.
Same pattern as scripts/build_book6_v2.py.
"""
import json, os, hashlib, difflib, re

HERE = os.path.dirname(os.path.abspath(__file__))
B7 = os.path.join(HERE, '..', 'book7')
N = 75

# (paragraph number, finding id, old text, new text)
CHANGES = [
 (2, '2.1', 'it is in your power to fan these thoughts continually into a flame',
            'it is in your power to fan these thoughts continuously into a flame'),
 (8, '8.1', 'carrying with you the same reason which you now use for present things',
            'having with you the same reason which you now use for present things'),
 (14, '14.1', 'For those parts which have felt it will complain, if they choose.',
              'For those parts which have felt will complain, if they choose.'),
 (20, '20.1', 'One thing only troubles me: that I should do something which the constitution of man does not allow',
              'One thing only troubles me: that I may do something which the constitution of man does not allow'),
 (66, '66.1', 'How do we know that Telauges was not superior in character to Socrates?',
              'How do we know whether Telauges was not superior in character to Socrates?'),
]

# (0-based index, clause in source, clause in candidate) — the seven dagger clauses
DAGGERS = [
 (15, 'does not frighten itself or cause itself pain', 'does not frighten itself or cause itself pain'),
 (15, 'for it will never deviate into such a judgment', 'for it will never deviate into such a judgment'),
 (30, 'The poet says that law rules all', 'The poet says that law rules all'),
 (30, 'And it is enough to remember that law rules all.', 'And it is enough to remember that law rules all.'),
 (45, 'saving and being saved; for', 'saving and being saved; for'),
 (45, 'a thing to be dismissed from the thoughts:', 'a thing to be dismissed from the thoughts:'),
 (66, 'with the composition of the body', 'with the composition of the body'),
]

NOT_APPLIED = (
 '**Findings not applied:** none. All five findings that propose a change to the candidate were applied — the four '
 '"worth improving" wording findings (2.1, 14.1, 20.1, 66.1) and the one "optional preference" finding (8.1) — and the '
 'sixth numbered finding (9.1) proposes no change to the candidate at all, only two records in `continuity.md`, which '
 'have been made.\n\n'
 'On **2.1**, Long wrote "continuously" and the candidate had narrowed it to "continually". The two words are not '
 'synonyms in current English — "continuously" is without a break, "continually" is again and again — and Long\'s image '
 'is a fire kept alight by fanning, not a fire relit. Both words are current, so the substitution bought nothing and '
 'cost the image; the reviewer\'s word is Long\'s own.\n\n'
 'On **8.1**, the optional item, the decision is to **apply** it, under the D8 pattern: a minor finding is applied '
 'unless `continuity.md` already records a considered reason not to, and v1 recorded none — VII.8 is not in the '
 'paragraph-level list at all, which is the sheet\'s way of saying the paragraph is Long with the pronouns modernised. '
 '"Carrying with you" was therefore an unrecorded departure from "having with thee", and it is the kind of departure '
 'the edition exists to avoid: "having with you" is ordinary current English that needs no replacement, while '
 '"carrying" adds a faint physical image (reason as something portable, luggage taken along) that Long does not have '
 'and that the meditation — you will meet future things with the same reason you use now — does not want. This follows '
 'Book V (findings 33.1 and 36.1) and Book VI (finding 15.1), where the optional findings were applied for the same '
 'reason: nothing in the frozen record defended the departure.\n\n'
 'On **14.1**, the inserted "it" supplied an object Long leaves out and created a garden path — "those parts which have '
 'felt it will complain" invites the reading "have felt that it will complain" — so the reader has to back up. Long\'s '
 'absolute "have felt" is grammatical modern English and carries the sense without the ambiguity; the reviewer\'s '
 'alternative ("have felt the fall") was not taken because it adds a word where removing one suffices.\n\n'
 'On **20.1**, "that I should do" after a colon is read first as obligation ("the thing that troubles me is that I '
 'ought to do something the constitution does not allow"), which reverses the meditation: Marcus fears a possibility, '
 'he does not describe a duty. "That I may do" is the fear-of-a-possibility modal and keeps every other word, '
 'including the three-member "or … or …" chain. ("That I might do" would serve equally; "may" is taken as the '
 'reviewer\'s first proposal.)\n\n'
 'On **66.1**, Long\'s "if" is "whether" and the meditation is an open question — we are not placed to know how '
 'Telauges compared with Socrates, which is why the rest of the paragraph sets out what we would have to know. "How do '
 'we know *that* X was not superior" reads in current English as a challenge to someone who has claimed the contrary, '
 'which puts Marcus in an argument he is not having and turns the following "For it is not enough that…" into a '
 'rebuttal instead of the reason the question stays open. Standard Ebooks\' Long has the same "if", so this is Long\'s '
 'word and not a PG variant.\n\n'
 'Of the reviewer\'s "also noted" points (not numbered findings), none required a change: VII.9 "bound up" (the Book VI '
 'VI.38 rendering, confirmed), VII.13 "limbs" for the bodily "members" (confirmed a gain and applied again at VII.68), '
 'VII.14 "Let there fall from outside what will" (Long\'s odd but deliberate construction, kept), VII.17 "I beg you" '
 'and "your old habit" (confirmed plain and in tone), VII.46 "the Deity" → "the divine" and VII.49 "supremacies" → '
 '"power" (both noted as shading the sense very slightly and both left, being the glossary row and a plain current '
 'word for a plural Long\'s English no longer supports), VII.50\'s verse capitals and two-branch disjunction '
 '(confirmed), VII.54\'s "piously to accept" (confirmed), VII.55 "for both are animal" (kept; the reviewer\'s '
 '"for both are animal motions" was offered and not pressed, and folding it would add a noun Long does not have).'
)

FLOW = (
 '**Flow read (step 7):** `candidate-v2-readable.md` read continuously VII.1–VII.75 after the build. No change was '
 'made from it. The five corrected clauses read without a snag in place: VII.2\'s "fan these thoughts continuously '
 'into a flame" keeps the fire alight through the sentence that follows; VII.8\'s "having with you the same reason" '
 'is now plain possession and the meditation\'s point (the reason you meet the future with is the one you have now) '
 'lands without an image of luggage; VII.14\'s "those parts which have felt will complain" is read once and not '
 'twice; VII.20\'s "that I may do something which the constitution of man does not allow" is a fear and not a duty, '
 'and the three "or" members follow it intact; VII.66 opens on an open question and the "For it is not enough that…" '
 'that follows is its reason rather than a rebuttal. Terminology was checked across the accepted books at the read — '
 '"the ruling part" for all of Long\'s phrases (VII.16 ×2, VII.22, VII.33, VII.55 ×2, VII.62) beside "the rational '
 'part which rules" (VII.28) and "the rational and political faculty" (VII.72), which are his own distinct phrases; '
 '"the universal nature" (VII.5, VII.18 ×2, VII.23, VII.55) beside "the nature of the whole" (VII.75) and "the whole" '
 '(VII.9, VII.10, VII.19, VII.25, VII.66); "rational being" and its extensions (VII.9, VII.11, VII.13, VII.55); '
 '"according to nature" / "against nature" / "against reason" (VII.11, VII.24 ×2, VII.53, VII.56, VII.74); "calm" for '
 'every "tranquillity" (VII.28, VII.33, VII.68 ×2, VII.75); "disturbance" (VII.16) beside Long\'s own verb '
 '"disturb"; "resent / resentful" (VII.38, VII.58, VII.66, VII.70) beside "discontented" (VII.64); "feelings" '
 '(VII.2, VII.66); "kindness" (VII.13, VII.63); "impressions" (VII.2) beside "imagination" (VII.17, VII.29, VII.64), '
 'kept apart as Long keeps them; "impulse" (VII.4) beside "motion" (VII.55, VII.60) and "movement" (VII.75) — all as '
 'the glossary and the six earlier acceptances have them. Long\'s own current words stand because they are his '
 '("propriety", "affectation", "circumscribe", "swaggering", "sophists", "dialectician", "hypocrite", "onsets", '
 '"kneaded matter"), the Greek stands at VII.13 and VII.17 for the reason the reviewer ruled, and VII.58 stops where '
 'Long stops. Nothing else changed; see `ACCEPTANCE.md`.'
)


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def main():
    v1 = json.load(open(os.path.join(B7, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B7, 'source-book7.json'), encoding='utf-8'))
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
    # VII.45's corrected ending and VII.58's kept ellipsis survive
    assert paras[44].endswith('deserting his post.')
    assert paras[57].endswith('remember...')
    # Long's in-text Greek survives (the reviewer's ruling on VII.13)
    assert '(melos)' in paras[12] and '(meros)' in paras[12]
    assert 'Eudaemonia' in paras[16]
    # no bracket and no cross-reference survives
    assert not any('[' in p for p in paras)
    assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in paras)
    json.dump(v2, open(os.path.join(B7, 'candidate-v2.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 7 — modern-English candidate v2', '', f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see `changes-v1-to-v2.md`). '
             'Paragraph IDs `B07-Pxxx` are for reference only; the leading number is part of the text.', '']
    for i, p in enumerate(paras):
        lines += [f'**[B07-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B7, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    ch = ['# Changes v1 → v2 — Meditations, Book VII', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, with the round-1 '
          'finding it answers (`review/findings-v1.md`). Applied mechanically by `scripts/build_book7_v2.py`; each '
          '"old" string matched exactly once in its paragraph. Paragraphs not listed are byte-identical between v1 '
          'and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B07-P{n:03d} (VII.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of {N} ({", ".join("VII."+str(n) for n in changed)}). '
           'Unchanged: ' + ', '.join('VII.' + str(n) for n in range(1, N + 1) if n not in changed) + '.', '',
           '**Finding 9.1 (documentation only).** No change to the candidate. Both base-text points are recorded in '
           '`continuity.md` under unresolved source issues: PG ends VII.9 "…and participate in the reason" (line 4395) '
           'where Standard Ebooks\' Long reads "participate in the **same** reason", and PG has lowercase "one god who '
           'pervades all things" (line 4391) where SE capitalises "one God". The candidate follows PG in both, which '
           'is right under D6 (PG #15877 is the base text) and, for the second, under the glossary row that keeps '
           'Long\'s capitals as he has them. Both are recorded on the precedent of the II.14 variant in '
           '`../PROVENANCE.md` §3.', '',
           NOT_APPLIED, '', FLOW, '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B7, "candidate-v1.json"))}`; candidate-v2.json '
           f'`{sha(os.path.join(B7, "candidate-v2.json"))}`.']
    open(os.path.join(B7, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n - 1].split()
        b = paras[n - 1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'VII.{n}: ' + ' '.join(d))
    print('v1 sha256', sha(os.path.join(B7, 'candidate-v1.json')))
    print('v2 sha256', sha(os.path.join(B7, 'candidate-v2.json')))
    sw = sum(len(p.split()) for p in src['paragraphs'])
    cw = sum(len(p.split()) for p in paras)
    print('words source', sw, 'v2', cw, 'ratio %.3f' % (cw / sw))
    print('min paragraph ratio %.2f' % min(len(c.split()) / len(s.split())
                                           for s, c in zip(src['paragraphs'], paras)))


if __name__ == '__main__':
    main()
