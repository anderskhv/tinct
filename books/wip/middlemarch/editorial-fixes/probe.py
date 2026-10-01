from common import *
m = load(MOD); o = load(ORG)
raw = open(MOD, encoding='utf-8').read()
print('compact roundtrip', raw == json.dumps(m, ensure_ascii=False, indent=2) + RAW_TAIL)
print('default roundtrip', raw == json.dumps(m, ensure_ascii=False))
for i in [1, 2, 19, 20, 45]:
    print(i, [p[:90] for p in o['chapters'][i]['paragraphs'][:3]])
    print(i, [p[:90] for p in m['chapters'][i]['paragraphs'][:3]])
