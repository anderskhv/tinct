"""Write independent-verdicts.jsonl. Mechanical spans come from align.py (own difflib token
alignment, UTF-16 offsets verified by slicing). Every entry's live/candidate context was read by
the reviewer in views.txt; decisions and non-default evidence are recorded in OVERRIDES."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from align import build, entries, chars, TOK, nt

OUT = os.path.join(os.path.dirname(__file__), '..', 'independent-verdicts.jsonl')
NAME = {c: chars[c]['snapshots'][0]['name'] for c in chars}

def words(s, a, b, n=6):
    left = s[max(0, a - 45):a]; right = s[b:b + 45]
    left = left[left.find(' ') + 1:] if a > 45 else left
    right = right[:right.rfind(' ')] if b + 45 < len(s) else right
    return '…' + left + '[' + s[a:b] + ']' + right + '…'

def win_same(L, ps, pe, C, a, b, w=130):
    f = lambda s, x, y: [nt(t) for t in TOK.findall(s[max(0, x - w):y + w])]
    return f(L, ps, pe) == f(C, a, b)

# Garnett uses a pronoun / "the latter" where modern-en names the person (checked in source.json)
PRONOUN_IN_SOURCE = {
 'R003': "Garnett has no name here ('tried ... to get at her through the landlady' structure); the modern name makes explicit the same person, Sonia.",
 'R103': "Garnett reads 'And she ...' here; the pronoun's antecedent is Dounia, so the named span is the same person.",
 'R156': "Garnett opens 'The latter was at home', the latter being Razumihin, whose building Raskolnikov has just entered.",
 'R179': "Garnett: 'kept his eyes fixed upon him', him being Razumihin, who is speaking.",
 'R194': "Garnett: '“Hm!” said the latter', meaning Razumihin.",
 'R255': "Garnett: 'But that man had some hidden power over him', meaning Svidrigaïlov.",
 'R266': "Garnett uses 'he' here, referring back to Svidrigaïlov in the previous sentence.",
}

OVERRIDES = {
 'M01': dict(decision='drop', cls='drop/removed', span=None,
   ev="Candidate 8.120 ends at 'A fine lot, these writers!\"'. 'He shot a contemptuous glance at Raskolnikov' and the list of scandals were cut as an invented duplicate of source 8.121 (changes.jsonl P0-structure). There is no corresponding span in 8.120.",
   concern="No coverage is lost: the same glance is rendered in 8.121 ('And he cast a contemptuous glance at Raskolnikov'), which already has its own live mention (raskolnikov @37-48), and that sentence is unchanged in the candidate. Do not re-point M01 there, because that would duplicate the mention."),
 'M02': dict(cls='map/same-text', ev="'drew away from [Raskolnikov], whose eyes were glittering' is unchanged at the same offset. The candidate's second 'Raskolnikov' (@141) replaces the live pronoun 'He had gone terribly pale', which is a different, new occurrence."),
 'M03': dict(cls='map/same-text', ev="'And seizing [Raskolnikov] by the shoulder' is unchanged at @12. The new 'Raskolnikov stumbled forward' (@71) replaces the live 'He' and is not this mention."),
 'M04': dict(cls='map/same-text', ev="Luzhin's letter asks that '[Rodion Romanovitch] not be present at our meeting'. The text and offset are unchanged, and it matches the first Garnett occurrence."),
 'M05': dict(cls='map/same-text', ev="Live 'I write in the expectation that [Rodion Romanovitch], who seemed so ill' corresponds to candidate 'I write on the assumption that [Rodion Romanovitch], who seemed so ill' @1226. The occurrence at @1082 ('if ... I meet Rodion Romanovitch') is a restored Garnett sentence absent from live, so this mention is not second by rank but third."),
 'M06': dict(cls='map/same-text', ev="The opening vocative 'Oh, what are you saying, [Dounia]!' is unchanged at @26."),
 'M07': dict(cls='map/same-text', ev="'Why did you say that, [Dounia]?' is the same vocative. It shifts to @90 because '....' was restored. The third candidate occurrence (@374, 'You shouldn't have, Dounia') is new Garnett text."),
 'M08': dict(cls='map/same-text', ev="Sonia's 'I come from [Katerina Ivanovna], and she had no one else to send' shifts to @106. The added 'Katerina Ivanovna told me to beg you' (@158) replaces the live pronoun 'She' and is a separate, new occurrence."),
 'M09': dict(cls='map/same-text', ev="'[Katerina Ivanovna] and I have figured it all out' is unchanged at @84. The second occurrence (@177, 'and Katerina Ivanovna was very anxious') is new and replaces the live 'She'."),
 'M10': dict(cls='map/same-text', ev="'his recent scene with [Porfiry]' is unchanged at @133."),
 'M11': dict(cls='map/same-text', ev="'all of [Porfiry]'s aims' is unchanged at @230. The next candidate 'Porfiry' (@286, 'But Porfiry had already shown') replaces the live 'he' and is new."),
 'M12': dict(cls='map/same-text', ev="'how dangerous [Porfiry]'s gambit had been' moves to @384. By rank it is the fourth candidate occurrence, not the third, because of the inserted 'But Porfiry had already shown'."),
 'M13': dict(cls='map/same-text', ev="Live 'seeing through him ... [Porfiry] had played a bold game' corresponds to candidate '[Porfiry], though playing a bold game, was bound to win' @573, as in Garnett."),
 'M14': dict(cls='map/same-text', ev="'What had [Porfiry] been driving at?' is unchanged in wording at @805."),
 'M15': dict(cls='map/same-text', ev="'not to Katerina Ivanovna but to [Sofya Semyonovna]' is at @989 in Raskolnikov's account at the wake."),
 'M16': dict(cls='map/same-text', ev="Live 'insinuations about my relationship with [Sofya Semyonovna]' corresponds to candidate 'hinted at the character of my relationship with [Sofya Semyonovna]' @1148. The inserted '...character of Sofya Semyonovna' (@1072) is a restored Garnett clause, so rank 2 is the wrong target."),
 'M17': dict(cls='map/same-text', ev="'for the funeral, not to [Sofya Semyonovna]' at @1474. The clause is unchanged, and it is shifted by one inserted occurrence."),
 'M18': dict(cls='map/same-text', ev="'I had no acquaintance with [Sofya Semyonovna]' at @1528 is unchanged."),
 'M19': dict(cls='map/same-text', ev="'wasn't worth [Sofya Semyonovna]'s little finger' at @1661 is unchanged."),
 'M20': dict(cls='map/same-text', ev="'whether I'd seat [Sofya Semyonovna] next to my sister' at @1764 is unchanged."),
 'M21': dict(cls='map/same-text', ev="'in proving [Sofya Semyonovna] was a thief' at @2139 is unchanged."),
 'M22': dict(cls='map/same-text', ev="'putting my sister on a level with [Sofya Semyonovna]' at @2333 is unchanged."),
 'M23': dict(cls='map/same-text', ev="'[Sofya Semyonovna]'s honor and happiness matter greatly to me' at @2639 is unchanged."),
 'M24': dict(cls='map/same-text', ev="'Meanwhile, [Katerina Ivanovna] had caught her breath' is unchanged at @11. The candidate's second occurrence (@239) is later text that does not correspond to this mention."),
 'M25': dict(cls='map/same-text', ev="Porfiry: 'Mr. [Zametov] was tremendously struck by your anger' at @3552. The added 'bowled Zametov over' (@3848) is restored Garnett text later in the speech."),
 'M26': dict(cls='map/same-text', ev="'while at the university, [Raskolnikov] had helped' is at @1141 in the epilogue list of favorable testimony."),
 'M27': dict(cls='map/same-text', ev="'[Raskolnikov]'s landlady also testified' moves to @1460. The candidate inserted 'Raskolnikov had got the old man into a hospital' (@1373) from Garnett, so this is occurrence 3 of 4, not 2."),
 'M28': dict(cls='map/same-text', ev="'[Raskolnikov] had rescued two small children from a burning building' is at @1557, the fourth candidate occurrence."),
 'M29': dict(cls='map/same-text', ev="'[Dounia] finally saw/realized ...' is at @265 with the same subject and clause."),
 'M30': dict(cls='map/same-text', ev="'[Dounia] remembered that her brother had mentioned' moves to @484. The new third occurrence (@558, 'overhearing Dounia talk in her sleep') replaces the live 'her' and is a separate reference."),
 'R026': dict(ev="'Marfa Petrovna -- Mr. [Svidrigaïlov]'s wife' is unchanged except for spelling. The possessive names Svidrigaïlov himself, not his wife, so the binding is correct."),
 'R125': dict(ev="Unchanged apart from spelling: '\"Hey! You, [Svidrigaïlov]! What do you want here?\"', matching Garnett 'Hey! You Svidrigaïlov!'. It is the only occurrence in the paragraph, so the correspondence is certain.",
   concern="The live binding is allusive. Raskolnikov hurls Svidrigaïlov's name as an insult at the stout dandy stalking the drunk girl on the boulevard. The person addressed is that stranger, not Svidrigaïlov, who does not appear until Part 3. The span names Svidrigaïlov (evoking the letter's account of him), so linking his card is defensible, but it is a taunt, not a reference to him. An editor should confirm that allusive uses are kept, or mark this mention allusive. The mapping itself is not in doubt."),
 'R154': dict(ev="Live 'So I haven't come to [Razumikhin] on purpose?' corresponds to candidate 'Why, I've come to [Razumihin]'s without meaning to!' (Garnett 'I have come to Razumihin's of myself'). The sentence was reworded, but it is the same single reference to Razumihin."),
 'R171': dict(ev="'\"And who might you be?\" [Razumihin] asked' is the narrator's tag for Razumihin, respelled and the only narrative occurrence before his 'Vrazumihin' self-correction."),
 'R172': dict(ev="'My name is Vrazumihin ... not [Razumihin], as everyone calls me'. Razumihin names himself in the form he disclaims. The referent is unchanged, and the Garnett joke is preserved in the new spelling."),
 'R402': dict(ev="'\"[Svidrigaïlov],\" someone answered from the other room' is the answer to Raskolnikov's question about who has shot himself, so it names Svidrigaïlov. The text is unchanged apart from spelling."),
}

def main():
    out = []
    for e in entries:
        r = build(e); m = r['mapped']; eid = e['entryId']; cid = e['characterId']
        ov = OVERRIDES.get(eid, {})
        L, C = r['L'], r['C']
        if m:
            a, b = m['py']
            span = {'startOffset': m['startOffset'], 'endOffset': m['endOffset'], 'text': m['text']}
            cls = ov.get('cls') or ('map/same-text' if m['text'] == e['old']['text'] else 'map/spelling-variant')
            if 'ev' in ov:
                ev = ov['ev']
            else:
                lk = [x.start() for x in re.finditer(re.escape(e['old']['text']) + r'(?![\wï])', L)]
                ck = [x.start() for x in re.finditer(re.escape(m['text']) + r'(?![\wï])', C)]
                li = lk.index(r['ps']) + 1 if r['ps'] in lk else '?'
                ci = ck.index(a) + 1 if a in ck else '?'
                same = win_same(L, r['ps'], r['pe'], C, a, b)
                ctx = words(C, a, b)
                ev = (f"'{ctx}': occurrence {li}/{len(lk)} of '{e['old']['text']}' in live and {ci}/{len(ck)} of '{m['text']}' in the candidate, "
                      + ("in an unchanged clause (±130 chars identical apart from the Garnett respelling)" if same
                         else "in the same clause, with nearby wording revised by the fidelity edits but the same subject, action and speaker")
                      + f". It is the same reference to {NAME[cid]}"
                      + (", respelled to the Garnett form." if cls == 'map/spelling-variant' else "."))
                if eid in PRONOUN_IN_SOURCE: ev += ' ' + PRONOUN_IN_SOURCE[eid]
            decision = 'map'
        else:
            span = None; cls = ov['cls']; ev = ov['ev']; decision = ov.get('decision', 'drop')
        out.append({'entryId': eid, 'characterId': cid, 'chapterNumber': e['chapterNumber'], 'paragraphIndex': e['paragraphIndex'],
                    'decision': decision, 'decisionClass': cls, 'finalCandidateSpan': span if decision == 'map' else None,
                    'evidence': ev, 'concern': ov.get('concern')})
    with open(OUT, 'w') as f:
        for o in out: f.write(json.dumps(o, ensure_ascii=False) + '\n')
    from collections import Counter
    print(len(out), Counter(o['decisionClass'] for o in out), 'concerns', [o['entryId'] for o in out if o['concern']])
main()
