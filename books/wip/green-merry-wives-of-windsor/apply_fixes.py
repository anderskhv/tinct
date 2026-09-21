import json, sys
sys.path.insert(0, '/home/user/tinct/books')
from content_edit_helpers import validate_structure, diff_report, assert_only_changed

fixes = json.load(open('/tmp/fixes_final.json'))

with open('candidate.json') as f:
    candidate = json.load(f)
with open('source.json') as f:
    source = json.load(f)

before_paragraphs = {}
for ch in candidate['chapters']:
    before_paragraphs[ch['number']] = list(ch['paragraphs'])

chmap = {ch['number']: ch for ch in candidate['chapters']}

errors = []
applied = []
touched = {}
for chn, idx, old, new in fixes:
    ch = chmap[chn]
    paras = ch['paragraphs']
    if idx < 0 or idx >= len(paras):
        errors.append((chn, idx, "index out of range"))
        continue
    actual = paras[idx]
    if actual != old:
        errors.append((chn, idx, f"MISMATCH\n  expected_old={old!r}\n  actual      ={actual!r}"))
        continue
    if actual == new:
        errors.append((chn, idx, "no-op (old==new)"))
        continue
    paras[idx] = new
    applied.append((chn, idx))
    touched.setdefault(chn, set()).add(idx)

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
