import json, sys

fixes = json.load(open('/tmp/fixes_final.json'))

with open('candidate.json') as f:
    candidate = json.load(f)

chmap = {ch['number']: ch for ch in candidate['chapters']}

errors = []
applied = []
for chn, idx, old, new in fixes:
    ch = chmap[chn]
    paras = ch['paragraphs']
    # find by content match instead of trusting idx
    matches = [i for i,p in enumerate(paras) if p == old]
    if len(matches) == 0:
        errors.append((chn, idx, "NOT FOUND", old[:80]))
        continue
    if len(matches) > 1:
        errors.append((chn, idx, "AMBIGUOUS", old[:80], matches))
        continue
    real_idx = matches[0]
    paras[real_idx] = new
    applied.append((chn, real_idx))

print("errors:", len(errors))
for e in errors:
    print(" ", e)
print("applied:", len(applied))

if not errors:
    with open('candidate.json','w') as f:
        json.dump(candidate, f, ensure_ascii=False, indent=2)
    print("WROTE candidate.json")
else:
    print("NOT WRITTEN due to errors")
