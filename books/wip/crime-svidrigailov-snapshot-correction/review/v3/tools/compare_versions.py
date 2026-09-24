"""Structural diff between two patched cards (prior accepted vs re-verified), plus a check that the patch files differ only in editorialBasis."""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
sys.argv, extra = sys.argv[:1], sys.argv[1:]
from verify import diff  # noqa: E402
old, new = extra[0], extra[1]
a = json.load(open(old)); b = json.load(open(new))
for d in diff(a, b):
    p = d
    x, y = a, b
    for k in p:
        if isinstance(k, str) and k.startswith('#'):
            x = [z for z in x if z['id'] == k[1:]][0]; y = [z for z in y if z['id'] == k[1:]][0]
        else:
            x = x[k]; y = y[k]
    print('/'.join(map(str, p)))
    print('   OLD:', x)
    print('   NEW:', y)
