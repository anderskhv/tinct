"""Pass A (cont.): Will's own verse, live unit 48 paragraphs 12-14 (0-based), restored verbatim."""
from common import *
m = load(MOD); o = load(ORG)
u = 48
for i in (12, 13, 14):
    assert o['chapters'][u - 1]['paragraphs'][i].startswith(('“O me', '“A dream', '“The tremor'))
    m['chapters'][u - 1]['paragraphs'][i] = o['chapters'][u - 1]['paragraphs'][i]
save_mod(m)
print('restored 3 verse paragraphs in unit 48')
