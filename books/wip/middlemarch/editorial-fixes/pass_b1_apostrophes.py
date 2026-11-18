"""Pass B1: straight apostrophes -> curly in the modern edition (the original has none)."""
from common import *
m = load(MOD)
n = 0
for c in m['chapters']:
    for i, p in enumerate(c['paragraphs']):
        if "'" in p:
            n += p.count("'")
            c['paragraphs'][i] = p.replace("'", '’')
save_mod(m)
print('replaced', n)
