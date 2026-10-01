"""Minimal, audited paragraph edits. Locate by LIVE unit number + 0-based paragraph index, and
assert the old substring occurs exactly once (never edit by index alone)."""
from common import *


def apply(edits, log=None):
    m = load(MOD)
    for (u, i, old, new) in edits:
        c = m['chapters'][u - 1]
        assert c['number'] == u
        p = c['paragraphs'][i]
        assert p.count(old) == 1, 'live %d:%d old text count %d: %r' % (u, i, p.count(old), old)
        c['paragraphs'][i] = p.replace(old, new)
        if log is not None:
            log.append((u, i, old, new))
    save_mod(m)
    print('applied', len(edits), 'edits')
