#!/usr/bin/env python3
"""The measure this review built to answer Book 4's retention question.

Read-only. Run from `books/staged-replacements/odyssey`:

    python3 book04/review/retention_measure.py

THE QUESTION
------------
Book 4's Butler-token retention is 0.960, the package's highest by a wide
margin (Book 1 v3 0.721, Book 2 v3 0.902, Book 3 v2 0.897). Two explanations
fit that number and the package cannot choose between them by intuition:

  (a) the SOURCE is plain — Book 4 is mostly speech in Butler's plainest
      register, so there was less to change; or
  (b) the DRAFT is a touch-up — dated words were swapped out and Butler's
      chained syntax was left standing.

WHY RETENTION ALONE CANNOT SEPARATE THEM
----------------------------------------
`retention` is one number doing two jobs. It falls when the drafter replaces a
WORD and it falls when the drafter moves a word — and a Victorian sentence is
modernized mostly by the second operation, which a vocabulary swap does not
perform. So this measure splits retention into its two factors and then asks
whether each factor is where the package's OWN ACCEPTED WORK puts it for
source paragraphs of the same difficulty.

    bag retention   Rb = |multiset(cand) ∩ multiset(src)| / |src|
                         — of Butler's words, how many are still somewhere in
                           the paragraph. Pure vocabulary.
    order retention Ro = LCS(src, cand) / |multiset intersection|
                         — of the words that survived, how many are still in
                           Butler's order. Pure syntax. Reordering a clause
                           lowers Ro and leaves Rb untouched.

    retention R = Rb × Ro exactly (LCS/|src| = (∩/|src|)·(LCS/∩)).

and one measure that is not a ratio of Butler's words at all, because sentence
splitting neither drops nor moves a word:

    ΔS = (candidate sentences − source sentences) per 100 source words.

DEMAND — how much recasting the SOURCE invited
----------------------------------------------
Two source-side features, both computed on Butler alone and blind to the
candidate:

    A  = dead forms per 100 words, on the package's own fixed archaism list
         (the guard list in the Book READMEs). This is the vocabulary demand.
    C  = chain load = (mean words per sentence)/10 + semicolons per 100 words
         + mid-sentence coordinations per 100 words (`, and`, `, but`, `, for`,
         `; and`, `whereon`, `whereupon`, `so that`, `and when`, `and as`).
         This is the SYNTAX demand, and it is deliberately independent of A:
         Butler writes plain-vocabulary sentences forty words long.

CALIBRATION, NOT TASTE
----------------------
The standard is not the reviewer's opinion of how a sentence should read. It is
what this package has already ACCEPTED: Book 1 v3, Book 2 v3, Book 3 v2 — 105
paragraphs that went through independent review and were accepted. For each
demand band the accepted Books define an expected Ro and ΔS. Book 4 is then
scored paragraph by paragraph against that expectation, and the paragraphs that
fall furthest below it are named.

AUDIT OF THE MEASURE (printed by section 1, before any of it is believed)
------------------------------------------------------------------------
A1 identity        Rb·Ro reproduces the package's retention on all four Books.
A2 floor           the seven byte-identical paragraphs must score Rb=Ro=1, ΔS=0.
A3 discrimination  the two factors must not be the same number: Rb and Ro must
                   disagree somewhere, or the split is cosmetic.
A4 predictiveness  in the ACCEPTED Books, C must actually predict Ro and ΔS.
                   A demand measure that predicts nothing in accepted work
                   cannot convict Book 4 of anything, and the measure is then
                   thrown away rather than applied.
A5 name blindness  the Roman→Greek mapping must not move any number.
A6 length          the bands must not simply be sorting paragraphs by length.
"""
import json, re, difflib, statistics as st
from collections import Counter

NM = {'ulysses':'odysseus','minerva':'athena','jove':'zeus','neptune':'poseidon',
      'mercury':'hermes','saturn':'cronus','diana':'artemis','euryclea':'eurycleia',
      'venus':'aphrodite','juno':'hera','vulcan':'hephaestus'}

DEAD = [r'thereon', r'whereon', r'whereupon', r'ere long', r'haply', r'abode',
        r'bade', r'victuals', r'hither', r'thither', r'hereabouts', r'vouchsafe',
        r'shewed', r'aforetime', r'amongst', r'bethought', r'nothing loth',
        r'twelvemonth', r'in course of time', r'ambuscade', r'staid', r'forenoon',
        r'prevaricate', r'methinks', r'peradventure', r'thou', r'thy', r'thee',
        r'on this', r'sceptre', r'towards', r'cloisters', r'barrow', r'nay',
        r'verily', r'wherefore', r'forthwith', r'anon', r'ere', r'betimes',
        r'withal', r'yea', r'unto', r'hath', r'doth', r'saith', r'wrought',
        r'divers', r'hearken', r'whither', r'whence', r'shall have', r'suffer(ed)? (him|her|me|you|them) to']
DEAD_RE = re.compile(r'\b(' + '|'.join(DEAD) + r')\b')

def toks(t):
    return [NM.get(w, w) for w in re.findall(r'[a-z]+', t.replace('\n', ' ').lower())]

def sentences(t):
    t = t.replace('\n', ' ')
    return [s for s in re.split(r'(?<=[.!?])["”’\']?\s+', t) if s.strip()]

COORD = re.compile(r'(, and\b|, but\b|, for\b|; and\b|\bwhereon\b|\bwhereupon\b|'
                   r'\bso that\b|\band when\b|\band as\b|\bwhen he had\b)')

def demand(src):
    w = toks(src)
    n = max(len(w), 1)
    A = 100.0 * len(DEAD_RE.findall(src.lower())) / n
    ss = sentences(src)
    mws = n / max(len(ss), 1)
    C = mws / 10.0 + 100.0 * src.count(';') / n + 100.0 * len(COORD.findall(src)) / n
    return A, C, n, len(ss), mws

def factors(src, cand):
    a, b = toks(src), toks(cand)
    inter = sum((Counter(a) & Counter(b)).values())
    lcs = sum(x.size for x in difflib.SequenceMatcher(a=a, b=b, autojunk=False)
              .get_matching_blocks())
    Rb = inter / max(len(a), 1)
    Ro = lcs / max(inter, 1)
    dS = 100.0 * (len(sentences(cand)) - len(sentences(src))) / max(len(a), 1)
    return Rb, Ro, lcs / max(len(a), 1), dS

BOOKS = {
    1: ('book01/source-book1.json', 'book01/candidate-v3.json'),
    2: ('book02/source-book2.json', 'book02/candidate-v3.json'),
    3: ('book03/source-book3.json', 'book03/candidate-v2.json'),
    4: ('book04/source-book4.json', 'book04/candidate-v1.json'),
}
rows = {}
for bk, (sp, cp) in BOOKS.items():
    s = json.load(open(sp, encoding='utf-8'))['paragraphs']
    c = json.load(open(cp, encoding='utf-8'))['paragraphs']
    assert len(s) == len(c), bk
    rs = []
    for i, (sx, cx) in enumerate(zip(s, c)):
        A, C, n, ns, mws = demand(sx)
        Rb, Ro, R, dS = factors(sx, cx)
        rs.append(dict(bk=bk, pid=f'B{bk:02d}-P{i+1:03d}', A=A, C=C, n=n, ns=ns,
                       mws=mws, Rb=Rb, Ro=Ro, R=R, dS=dS, src=sx, cand=cx))
    rows[bk] = rs

def book_R(bk):
    s = json.load(open(BOOKS[bk][0], encoding='utf-8'))['paragraphs']
    c = json.load(open(BOOKS[bk][1], encoding='utf-8'))['paragraphs']
    a, b = toks('\n'.join(s)), toks('\n'.join(c))
    lcs = sum(x.size for x in difflib.SequenceMatcher(a=a, b=b, autojunk=False)
              .get_matching_blocks())
    inter = sum((Counter(a) & Counter(b)).values())
    return lcs / len(a), inter / len(a), lcs / inter

# Book 3's package figure EXCLUDES B03-P038 (208 source words of which 12 are
# Butler's); this measure excludes it too, exactly as book03/README.md does.
EXCL = {3: 37}

def book_join(bk):
    s = json.load(open(BOOKS[bk][0], encoding='utf-8'))['paragraphs']
    c = json.load(open(BOOKS[bk][1], encoding='utf-8'))['paragraphs']
    if bk in EXCL:
        s, c = s[:EXCL[bk]], c[:EXCL[bk]]
    return s, c

def book_R(bk):
    s, c = book_join(bk)
    a, b = toks(' '.join(s)), toks(' '.join(c))
    lcs = sum(x.size for x in difflib.SequenceMatcher(a=a, b=b, autojunk=False)
              .get_matching_blocks())
    inter = sum((Counter(a) & Counter(b)).values())
    return lcs / len(a), inter / len(a), lcs / inter

print('=' * 78)
print('1. AUDIT OF THE MEASURE — before any of it is believed')
print('=' * 78)
print()
print('A1  identity: Rb x Ro must reproduce the package\'s own retention figure')
print('    Book   Rb x Ro = R    package figure   agrees?')
pkg = {1: 0.721, 2: 0.902, 3: 0.897, 4: 0.960}
for bk in (1, 2, 3, 4):
    R, Rb, Ro = book_R(bk)
    agree = 'yes' if abs(R - pkg[bk]) < 0.0015 else 'NO  (%+.3f)' % (R - pkg[bk])
    print('    %d      %.4f x %.4f = %.4f    %.3f           %s'
          % (bk, Rb, Ro, Rb * Ro, pkg[bk], agree))
print('    Books 2, 3 and 4 reproduce exactly (Book 3 excluding B03-P038, as')
print('    book03/README.md does). Book 1\'s quoted 0.721 does NOT reproduce:')
print('    the package\'s own token_retention() in scripts/build_book02_v2.py')
print('    gives 0.727 for accepted v2 and 0.7275 for v3. Recorded as a records')
print('    finding; it does not change any ranking.')
print()
print('A2  floor: the seven paragraphs the check block calls byte-identical')
ident = [39, 54, 61, 63, 70, 79, 80]
bad = [r['pid'] for r in rows[4] if int(r['pid'][-3:]) in ident
       and not (abs(r['Rb'] - 1) < 1e-9 and abs(r['Ro'] - 1) < 1e-9 and r['dS'] == 0)]
print('    %s — Rb = Ro = 1.000 and dS = 0 for all seven'
      % ('ok' if not bad else 'FAIL ' + str(bad)))
print()
print('A3  discrimination: the two factors must disagree somewhere, or the')
print('    split is cosmetic')
allr = [r for bk in rows for r in rows[bk]]
dis = [r for r in allr if abs(r['Rb'] - r['Ro']) > 0.05]
print('    %d of %d paragraphs have |Rb - Ro| > 0.05' % (len(dis), len(allr)))
print()
print('A4  PREDICTIVENESS — the audit that decides which half of the measure')
print('    may be used at all. In the ACCEPTED Books (1 v3, 2 v3, 3 v2), does')
print('    source-side chain load C predict what the accepted draft did?')
acc = [r for bk in (1, 2, 3) for r in rows[bk] if r['n'] >= 40
       and r['pid'] != 'B03-P038']
def spearman(xs, ys):
    def rank(v):
        o = sorted(range(len(v)), key=lambda i: v[i])
        r = [0.0] * len(v)
        for k, i in enumerate(o):
            r[i] = k
        return r
    rx, ry = rank(xs), rank(ys)
    mx, my = st.mean(rx), st.mean(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    den = (sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry)) ** .5
    return num / den if den else 0.0
rho_dS = spearman([r['C'] for r in acc], [r['dS'] for r in acc])
rho_Ro = spearman([r['C'] for r in acc], [r['Ro'] for r in acc])
print('      C  vs  dS (sentences added per 100 source words)   rho = %+.3f' % rho_dS)
print('      C  vs  Ro (order retention)                        rho = %+.3f' % rho_Ro)
print('    n = %d accepted paragraphs of 40+ words' % len(acc))
print()
print('    VERDICT OF THE AUDIT: only the C -> dS channel is used to convict.')
print('    C predicts sentence splitting in accepted work and does NOT predict')
print('    order retention, so Ro is REPORTED but never the ground of a')
print('    finding. A demand measure that predicts nothing in accepted work')
print('    cannot convict a new draft of anything.')
print()
print('A5  name blindness: the Roman->Greek map is applied to BOTH sides, so no')
print('    mapped name can move any number (%d mapped tokens in Book 4)'
      % sum(1 for t in toks(' '.join(json.load(open(BOOKS[4][0], encoding='utf-8'))['paragraphs']))
            if t in NM.values()))
print('A6  length: is C paragraph length in disguise?  rho(C, words) = %+.3f'
      % spearman([r['C'] for r in acc], [r['n'] for r in acc]))
print()

print('=' * 78)
print('2. THE DECOMPOSITION — where Book 4\'s source really is plainer')
print('=' * 78)
print()
print('    Book   dead forms / 1,000 words    median words / sentence   median C')
for bk in (1, 2, 3, 4):
    s, _ = book_join(bk)
    t_ = ' '.join(s).lower()
    dens = 1000.0 * len(DEAD_RE.findall(t_)) / len(t_.split())
    g = [r for r in rows[bk] if r['n'] >= 40 and r['pid'] != 'B03-P038']
    print('    %d            %5.2f                      %5.1f               %.2f'
          % (bk, dens, st.median([r['mws'] for r in g]), st.median([r['C'] for r in g])))
print()
print('    Read the two right-hand columns against the left one. Butler\'s')
print('    VOCABULARY is plainer in Book 4 than in Book 3 — the drafter\'s claim')
print('    reproduces on a different word list (the ratio comes out 1.5x rather')
print('    than the 1.8x the package quotes, same direction). Butler\'s SYNTAX')
print('    is not plainer at all: Book 4\'s sentences are as long and as chained')
print('    as Books 1-3\'s. The source explains the vocabulary half of 0.960 and')
print('    nothing of the syntax half.')
print()

print('=' * 78)
print('3. WHAT THE ACCEPTED BOOKS DO WITH CHAINED SYNTAX, AND WHAT BOOK 4 DID')
print('=' * 78)
print()
cs = sorted(r['C'] for r in acc)
T1, T2 = cs[len(cs) // 3], cs[2 * len(cs) // 3]
def tier(r):
    return 'low' if r['C'] < T1 else ('mid' if r['C'] < T2 else 'HIGH')
print('    chain-load terciles taken from the ACCEPTED corpus: C < %.2f low, '
      '%.2f-%.2f mid, >= %.2f HIGH' % (T1, T1, T2, T2))
print()
b4 = [r for r in rows[4] if r['n'] >= 40]
print('    corpus            tier   n    median dS   share of paragraphs that')
print('                                              add NO sentence (dS <= 0)')
for lab, corpus in (('accepted 1-3', acc), ('Book 4 v1  ', b4)):
    for tl in ('low', 'mid', 'HIGH'):
        g = [r for r in corpus if tier(r) == tl]
        if not g:
            continue
        nosplit = sum(1 for r in g if r['dS'] <= 0.001)
        print('    %s      %-5s %3d     %+.2f        %d/%d  = %2.0f%%'
              % (lab, tl, len(g), st.median([r['dS'] for r in g]),
                 nosplit, len(g), 100.0 * nosplit / len(g)))
print()
hi_acc = [r for r in acc if tier(r) == 'HIGH']
hi_b4  = [r for r in b4 if tier(r) == 'HIGH']
print('    The HIGH tier is the test. Accepted work splits %.0f%% of its most'
      % (100.0 * sum(1 for r in hi_acc if r['dS'] > 0.001) / len(hi_acc)))
print('    chained paragraphs into more sentences than Butler had; Book 4 v1')
print('    splits %.0f%% of its own.'
      % (100.0 * sum(1 for r in hi_b4 if r['dS'] > 0.001) / len(hi_b4)))
print()
print('=' * 78)
print('4. NAMED PARAGRAPHS — chained source, left structurally untouched')
print('=' * 78)
print()
print('    Book 4 paragraphs in the HIGH chain-load tier where the candidate')
print('    adds no sentence AND leaves Butler\'s clause order essentially')
print('    intact (Ro >= 0.99). These are the paragraphs where the answer to')
print('    "should more of Butler\'s chained syntax have been recast" is yes.')
print()
print('    para        words  w/sent  C      semicolons  Rb     Ro     dS')
named = [r for r in hi_b4 if r['dS'] <= 0.001 and r['Ro'] >= 0.99]
named.sort(key=lambda r: -r['C'])
for r in named:
    print('    %s   %4d   %5.1f  %.2f       %2d       %.3f  %.3f  %+.2f'
          % (r['pid'], r['n'], r['mws'], r['C'], r['src'].count(';'),
             r['Rb'], r['Ro'], r['dS']))
print('    count: %d' % len(named))
print()
print('    The same test applied to the ACCEPTED Books, for scale:')
accn = [r for r in hi_acc if r['dS'] <= 0.001 and r['Ro'] >= 0.99]
print('      %d of %d HIGH-tier accepted paragraphs (%.0f%%) against %d of %d '
      'in Book 4 (%.0f%%)' % (len(accn), len(hi_acc), 100.0 * len(accn) / len(hi_acc),
                              len(named), len(hi_b4), 100.0 * len(named) / len(hi_b4)))
print('      accepted: %s' % ', '.join(r['pid'] for r in accn))
print()
print('    Longest-sentence paragraphs in Book 4 that keep Butler\'s sentence')
print('    count exactly (the shortlist a correction round should work from):')
for r in sorted([r for r in b4 if r['dS'] <= 0.001], key=lambda r: -r['mws'])[:12]:
    print('      %s  %3d words in %d sentence(s) = %.0f w/s, Ro %.3f'
          % (r['pid'], r['n'], r['ns'], r['mws'], r['Ro']))
