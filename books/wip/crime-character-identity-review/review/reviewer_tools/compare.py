import json, os
B = os.path.join(os.path.dirname(__file__), '..', '..')
mine = {j['entryId']: j for j in map(json.loads, open(os.path.join(B, 'review/independent-verdicts.jsonl')))}
lead = {j['entryId']: j for j in map(json.loads, open(os.path.join(B, 'ledger/decisions.jsonl')))}
EQ = {'spelling-variant': 'map/spelling-variant', 'same-text': 'map/same-text', 'removed-with-duplicate-text': 'drop/removed'}
assert set(mine) == set(lead)
dis = []
for k in mine:
    m, l = mine[k], lead[k]
    diffs = []
    if m['decision'] != l['decision']: diffs.append(('decision', m['decision'], l['decision']))
    if m['decisionClass'] != EQ.get(l['decisionClass'], l['decisionClass']): diffs.append(('class', m['decisionClass'], l['decisionClass']))
    if m['finalCandidateSpan'] != l['finalCandidateSpan']: diffs.append(('span', m['finalCandidateSpan'], l['finalCandidateSpan']))
    for f in ('characterId', 'chapterNumber', 'paragraphIndex'):
        if m[f] != l[f]: diffs.append((f, m[f], l[f]))
    if diffs: dis.append((k, diffs))
print('field disagreements:', len(dis))
for d in dis: print(d)
print('lead identityNotes:')
for k, l in lead.items():
    if l.get('identityNote'): print(k, '|', l['identityNote'])
import collections
print(collections.Counter(l['rationale'][:60] for l in lead.values()).most_common(8))
for k in ('M01','R125','M05','M16','M12','M27','R154','R172','R026','R402'):
    print(k, '|', lead[k]['rationale'], '|', lead[k].get('referent'))
