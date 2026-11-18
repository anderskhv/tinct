import json, os
from common import *
m = load(MOD)
d = os.path.join(ROOT, 'app/public/data/editions-chapters/middlemarch-modern-en')
bad = 0
files = sorted(f for f in os.listdir(d) if f.startswith('ch'))
for c in m['chapters']:
    p = os.path.join(d, 'ch%04d.json' % c['number'])
    s = json.load(open(p, encoding='utf-8'))
    if s['number'] != c['number'] or s['paragraphs'] != c['paragraphs'] or s['title'] != c['title']:
        bad += 1
print('shard files', len(files), 'mismatched', bad)
