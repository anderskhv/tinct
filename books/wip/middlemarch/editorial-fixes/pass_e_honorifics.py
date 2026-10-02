"""Pass E: restore dropped honorifics (Mr./Mrs.) before a surname.

For every original sentence containing 'Mr. X' / 'Mrs. X', find the best-matching modern sentence
(word overlap); where the modern sentence has fewer 'Mr. X' than the original sentence and a bare,
untitled 'X' (not preceded by a title or a first name) exists, prefix the title to that bare 'X'.
Usage: pass_e_honorifics.py            -> dry run, prints every proposed change
       pass_e_honorifics.py --write    -> apply
Anything the heuristic cannot place is listed as UNPLACED and fixed by hand in pass_e_hand.py.
"""
import re, sys, collections
from common import *

TITLE_RE = re.compile(r'\b(Mr\.|Mrs\.)\s+([A-Z][A-Za-z]+)')
SENT_SPLIT = re.compile(r'(?<=[.!?:;])[”’]?\s+|(?<=[.!?])[”’]\s+')
NON_NAME_PREV = {'Mr.', 'Mrs.', 'Miss', 'Sir', 'Dr.', 'Lady', 'Captain', 'Rev.', 'Mister', 'Lord', 'Old', 'Young'}


ABBR = re.compile(r'\b(Mr|Mrs|Dr|St|Rev|Esq|Messrs)\.\s')


def sents(t):
    t = ABBR.sub(lambda mm: mm.group(1) + '.\x01', t)
    return [s.replace('\x01', ' ') for s in SENT_SPLIT.split(t) if s]


def words(s):
    return set(re.findall(r"[a-z]+", s.lower()))


DET_PREV = {'the', 'The', 'a', 'an', 'A', 'An', 'these', 'those', 'These', 'Those', 'his', 'her', 'their', 'our',
            'your', 'my', 'whole', 'all'}
NOUNS_AFTER = {'family', 'children', 'household', 'pew', 'house', 'girls', 'boys', 'sisters', 'party', 'side',
               'faction', 'connection'}
STOP_CAP = set("""Then But And When So Yet Now While After Before Still Since As If Even Only Perhaps Instead Meanwhile
Besides Both Neither Either Not Why What How Where Who Does Did Is Was Would Could Should Let Poor Dear Old The This That
These Those With For From In On At To Of By Like Though Although Because Once Soon Later Here There Oh Ah Well Yes No Or
Between Among About Against Until Whether Whatever Whenever Without Within Upon Over Under Through Into Onto Towards Toward
Himself Herself Itself Unlike Despite Despite During Per Than Whom Whose Which Everyone Someone Nobody Anyone Mr. Mrs.""".split())


def bare_positions(s, name):
    """positions of untitled `name` in s (preceded neither by a title nor a first name / other capitalised word)."""
    out = []
    for mm in re.finditer(r'(?<![A-Za-z])' + re.escape(name) + r'(?![A-Za-z])', s):
        pre = s[:mm.start()].rstrip()
        toks = pre.split()
        prev = toks[-1] if toks else ''
        prevc = prev.lstrip('“‘"(—')
        if prev in NON_NAME_PREV or prevc in NON_NAME_PREV:
            continue
        if prevc in DET_PREV:
            continue
        if prevc and prevc[0].isupper() and prevc not in STOP_CAP and prevc[-1] not in ',;:—':
            continue
        after = s[mm.end():mm.end() + 20].lstrip('’s ').split()
        nxt = after[0] if after else ''
        if nxt.strip('.,;:!?”’') in NOUNS_AFTER:
            continue
        out.append(mm.start())
    return out


def process(oc_par, mc_par, tag):
    # NB: `oc_par` is the original paragraph, `mc_par` the modern one
    """return (new_modern_text, list of applied changes, list of unplaced)"""
    os_ = sents(oc_par)
    ms = sents(mc_par)
    new_ms = list(ms)
    applied, unplaced = [], []
    used = collections.Counter()
    for osent in os_:
        found = collections.Counter((t, n) for t, n in TITLE_RE.findall(osent))
        if not found:
            continue
        ws = words(osent)
        idx = max(range(len(ms)), key=lambda k: len(ws & words(ms[k])) / (len(words(ms[k])) + 1)) if ms else None
        if idx is None:
            continue
        for (title, name), n_o in found.items():
            cur = new_ms[idx]
            n_m = len(re.findall(re.escape(title) + r'\s+' + re.escape(name) + r'(?![A-Za-z])', cur))
            deficit = n_o - n_m
            while deficit > 0:
                pos = bare_positions(cur, name)
                if not pos:
                    break
                p = pos[0]
                cur = cur[:p] + title + ' ' + cur[p:]
                applied.append((title, name, cur[max(0, p - 30):p + len(title) + len(name) + 30]))
                deficit -= 1
            new_ms[idx] = cur
    # paragraph-level fallback: modern may have split/merged sentences
    cur_par = mc_par
    if new_ms != ms:
        for old, new in zip(ms, new_ms):
            if old != new:
                cur_par = cur_par.replace(old, new, 1)
    allo = collections.Counter((t, n) for t, n in TITLE_RE.findall(oc_par))
    for (title, name), n_o in allo.items():
        n_m = len(re.findall(re.escape(title) + r'\s+' + re.escape(name) + r'(?![A-Za-z])', cur_par))
        deficit = n_o - n_m
        while deficit > 0:
            pos = bare_positions(cur_par, name)
            if not pos:
                break
            p = pos[0]
            cur_par = cur_par[:p] + title + ' ' + cur_par[p:]
            applied.append((title, name, cur_par[max(0, p - 30):p + len(title) + len(name) + 30]))
            deficit -= 1
        if deficit > 0:
            unplaced.append((title, name, 'deficit %d' % deficit))
    return cur_par, applied, unplaced


def main(write):
    m = load(MOD); o = load(ORG)
    napplied = nun = npar = 0
    unplaced_all = []
    for oc, mc in zip(o['chapters'], m['chapters']):
        for i, (a, b) in enumerate(zip(oc['paragraphs'], mc['paragraphs'])):
            new, applied, unplaced = process(a, b, (oc['number'], i))
            if applied:
                npar += 1
                napplied += len(applied)
                for t, n, ctx in applied:
                    print('live %d:%d  ...%s...' % (oc['number'], i, ctx.replace('\n', ' ')))
                if write:
                    mc['paragraphs'][i] = new
            for t, n, s in unplaced:
                unplaced_all.append((oc['number'], i, t, n, s))
    print('applied', napplied, 'in', npar, 'paragraphs; unplaced', len(unplaced_all))
    for u in unplaced_all:
        print('UNPLACED', u)
    if write:
        save_mod(m)


if __name__ == '__main__':
    main('--write' in sys.argv)
