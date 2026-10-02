"""Structural verification: 88 units / 4674 paragraphs aligned, short paragraphs, epigraph identity, '!' check."""
import re
from common import *
from pass_a_epigraphs import epigraph_count

m = load(MOD); o = load(ORG)
assert len(m['chapters']) == 88 == len(o['chapters'])
tot = 0
short = []
epi_bad = []
for mc, oc in zip(m['chapters'], o['chapters']):
    assert mc['number'] == oc['number'] and mc['title'] == oc['title']
    assert len(mc['paragraphs']) == len(oc['paragraphs'])
    tot += len(mc['paragraphs'])
    k = epigraph_count(oc['number'], oc['paragraphs'])
    for i, (a, b) in enumerate(zip(oc['paragraphs'], mc['paragraphs'])):
        wa, wb = len(a.split()), len(b.split())
        if wa >= 20 and wb / wa < 0.70:
            short.append((oc['number'], i, round(wb / wa, 2)))
        if i < k and a != b:
            epi_bad.append((oc['number'], i))
print('units', len(m['chapters']), 'paragraphs', tot)
print('short (<0.70 words, source>=20 words):', len(short), short)
print('epigraph mismatches:', epi_bad)
miss = []
for mc, oc in zip(m['chapters'], o['chapters']):
    for i, (a, b) in enumerate(zip(oc['paragraphs'], mc['paragraphs'])):
        if b.count('!') < a.count('!'):
            miss.append((oc['number'], i, a.count('!'), b.count('!')))
print('paragraphs with fewer "!":', len(miss))
