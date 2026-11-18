"""Pass C: spelling consistency in the modern edition.

Rule: every British variant in the modern text is normalised to US spelling (-our, -ise, grey,
-re, -ce, -ll- doubling, etc.), the policy decided for this edition. Note the source itself is
mixed (it keeps centre, defence, offence, pretence, jewellery, travelled ...); the modern text
follows the US policy, not the source's mixed forms. Epigraph/verse paragraphs (verbatim from the
original) are skipped. Whole words only, case preserved.
"""
import re, collections, sys
from common import *
from pass_a_epigraphs import epigraph_count

OUR_STEMS = ['colour', 'favour', 'honour', 'neighbour', 'labour', 'behaviour', 'humour', 'parlour',
             'rumour', 'splendour', 'fervour', 'flavour', 'ardour', 'candour', 'vapour', 'tumour',
             'harbour', 'savour', 'endeavour', 'demeanour', 'vigour', 'rigour', 'odour', 'valour',
             'clamour', 'saviour', 'armour', 'glamour']
WORDS = {  # exact words (lower-case keys), case is carried over
    'recognised': 'recognized', 'recognising': 'recognizing', 'recognise': 'recognize',
    'realise': 'realize', 'realised': 'realized', 'realising': 'realizing',
    'itemised': 'itemized', 'patronise': 'patronize',
    'grey': 'gray', 'greyer': 'grayer', 'greyish': 'grayish', 'greying': 'graying',
    # -re / -ce / -l doubling and other British variants -> US
    'centre': 'center', 'centred': 'centered', 'centres': 'centers',
    'defence': 'defense', 'offence': 'offense', 'offences': 'offenses', 'pretence': 'pretense',
    'mould': 'mold', 'moulded': 'molded', 'sombre': 'somber', 'jewellery': 'jewelry',
    'fulfil': 'fulfill', 'fulfilment': 'fulfillment', 'skilful': 'skillful',
    'sceptical': 'skeptical', 'sceptic': 'skeptic',
    'travelled': 'traveled', 'travelling': 'traveling', 'traveller': 'traveler',
    'quarrelled': 'quarreled', 'fibre': 'fiber', 'lustre': 'luster', 'manoeuvre': 'maneuver',
    'outmanoeuvred': 'outmaneuvered',
    'practise': 'practice', 'practised': 'practiced', 'practising': 'practicing',
    'marvelled': 'marveled', 'panelled': 'paneled', 'signalling': 'signaling', 'marshalled': 'marshaled',
    'equalled': 'equaled', 'channelled': 'channeled',
}
# words where the generic 'mold'/'program'/'center' etc. must not be touched because they are
# different words or the source differs; checked against context counts below.
SKIP_WORDS = set()


def carry(src, dst):
    if src.isupper() and len(src) > 1:
        return dst.upper()
    if src[0].isupper():
        return dst[0].upper() + dst[1:]
    return dst


our_re = re.compile(r'\b(\w*?)(' + '|'.join(OUR_STEMS) + r')(\w*)\b', re.I)
word_re = re.compile(r"\b[A-Za-z]+\b")


def fix_text(t, stats):
    def our_sub(mm):
        pre, stem, post = mm.group(1), mm.group(2), mm.group(3)
        new = stem[:-2] + stem[-2:].replace('ur', 'r') if False else stem.replace('our', 'or')
        if stem.isupper():
            new = new.upper()
        elif stem[0].isupper():
            new = new[0].upper() + new[1:]
        out = pre + new + post
        stats[(mm.group(0).lower(), out.lower())] += 1
        return out
    t = our_re.sub(our_sub, t)

    def w_sub(mm):
        w = mm.group(0)
        lw = w.lower()
        if lw in WORDS and lw not in SKIP_WORDS:
            out = carry(w, WORDS[lw])
            stats[(lw, WORDS[lw])] += 1
            return out
        return w
    return word_re.sub(w_sub, t)


def main(write):
    m = load(MOD); o = load(ORG)
    stats = collections.Counter()
    npar = 0
    for oc, mc in zip(o['chapters'], m['chapters']):
        u = oc['number']
        k = epigraph_count(u, oc['paragraphs'])
        for i, p in enumerate(mc['paragraphs']):
            if i < k or (u == 48 and i in (12, 13, 14)):
                continue
            q = fix_text(p, stats)
            if q != p:
                npar += 1
                if write:
                    mc['paragraphs'][i] = q
    for (a, b), n in sorted(stats.items()):
        print('%-16s -> %-16s %d' % (a, b, n))
    print('paragraphs changed:', npar, 'replacements:', sum(stats.values()))
    if write:
        save_mod(m)


if __name__ == '__main__':
    main('--write' in sys.argv)
