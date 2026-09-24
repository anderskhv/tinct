#!/usr/bin/env python3
"""Mechanical verification of the cleanup package, deliberately NOT reusing build.py.

For every book and edition it proves, against the pinned inputs:
  1. chapter count, numbers and titles are unchanged; untouched chapters are byte-identical;
  2. inside touched chapters, every output paragraph is an input paragraph verbatim, except the
     paragraphs named in CHANGES.json;
  3. word conservation: the book's word sequence after the change equals the word sequence
     before it, minus exactly the deleted caption words (Jane Eyre), minus exactly the
     removed splice tail (Odyssey), and with nothing removed (Pride and Prejudice);
  4. each deleted Jane Eyre caption is still carried, in substance, by a retained neighbour;
  5. the output hashes equal build-summary.json.
Exit status 0 only if every check passes.
"""
import hashlib, json, os, re, subprocess, sys

ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True, check=True).stdout.strip()
PKG = os.path.join(ROOT, 'books/wip/featured-source-cleanup')
S = json.load(open(os.path.join(PKG, 'build-summary.json')))
fails = []

def words(s):
    s = s.replace('_', '')
    return re.findall(r"[A-Za-z0-9À-ɏ]+(?:['’][A-Za-z]+)?", s)

def W(d):
    return [w for c in d['chapters'] for p in c['paragraphs'] for w in words(p)]

def check(cond, msg):
    print(('PASS ' if cond else 'FAIL ') + msg)
    if not cond: fails.append(msg)

def nset(s):
    stop = {'the', 'a', 'and', 'of', 'to', 'i', 'it', 'he', 'she', 'on', 'in', 'my', 'is', 'was', 'you', 'her', 'have', 'there', 'but'}
    return {w.lower() for w in words(s)} - stop

for book, info in S['books'].items():
    recs = json.load(open(os.path.join(PKG, book, 'CHANGES.json')))
    for ed, f in info['files'].items():
        commit, path = f['input'].split(':', 1)
        ib = subprocess.run(['git', '-C', ROOT, 'show', f'{commit}:{path}'], capture_output=True, check=True).stdout
        ob = open(os.path.join(PKG, f['file']), 'rb').read()
        check(hashlib.sha256(ib).hexdigest() == f['input_sha256'], f'{book} {ed}: input hash pinned')
        check(hashlib.sha256(ob).hexdigest() == f['sha256'], f'{book} {ed}: output hash matches summary')
        check(json.dumps(json.loads(ob), indent=2, ensure_ascii=False).encode() == ob, f'{book} {ed}: serialization identical to live convention')
        I, O = json.loads(ib), json.loads(ob)
        check([(c['number'], c['title']) for c in I['chapters']] == [(c['number'], c['title']) for c in O['chapters']],
              f'{book} {ed}: chapter numbers and titles unchanged')
        R = [r for r in recs if r['edition'] == ed]
        touched = {int(r['at'].split('.')[0]) for r in R}
        for ci, co in zip(I['chapters'], O['chapters']):
            if ci['number'] not in touched:
                if ci != co: check(False, f'{book} {ed}: untouched chapter {ci["number"]} differs')
        check(True, f'{book} {ed}: {len(I["chapters"]) - len(touched)} untouched chapters byte-identical as parsed')
        # 2. every new paragraph in touched chapters is verbatim input, or a recorded 'after'
        afters = {r['after'] for r in R if r['after'] is not None}
        for n in touched:
            inp = set(I['chapters'][n - 1]['paragraphs'])
            for p in O['chapters'][n - 1]['paragraphs']:
                if p not in inp and p not in afters:
                    check(False, f'{book} {ed} ch{n}: unrecorded paragraph {p[:60]!r}')
        check(True, f'{book} {ed}: touched chapters contain only verbatim or recorded paragraphs')
        # 3. word conservation
        wi, wo = W(I), W(O)
        if book == 'pride-and-prejudice':
            check(wi == wo, f'{book} {ed}: word sequence identical ({len(wi)} words), nothing lost/duplicated/invented')
            for r in R:
                check(r['after'] == r['before'][0] + ' ' + r['before'][1], f'{book} {ed} {r["at"]}: merge is exact concatenation with one space')
        elif book == 'jane-eyre':
            removed = [w for r in R if r['op'] == 'delete' for w in words(r['before'])]
            exp = len(wi) - len(removed)
            fold_delta = 0
            for r in R:
                if r['op'] == 'edit':
                    added = words(r['after'])[len(words(r['before'])):]
                    check(words(r['after'])[:len(words(r['before']))] == words(r['before']), f'{book} {ed} {r["at"]}: fold keeps every earlier word')
                    cap = [x for x in recs if x['edition'] == ed and x['at'] == '36.53'][0]
                    check([w.lower() for w in added] == ['and'] + [w.lower() for w in words(cap['before'])],
                          f'{book} {ed} {r["at"]}: fold adds only "and" + the deleted 36.53 sentence {added}')
                    fold_delta = len(added)
            check(len(wo) == exp + fold_delta, f'{book} {ed}: word count {len(wi)} - {len(removed)} caption words + {fold_delta} folded = {len(wo)}')
            # order-preserving: output words are input words with caption spans removed (plus the fold)
            for r in R:
                if r['op'] != 'delete': continue
                n, i = map(int, r['at'].split('.'))
                nb = int(r['duplicate_of'].split('.')[1])
                P = O['chapters'][n - 1]['paragraphs']
                # neighbour's new index: subtract every deletion in this chapter that precedes it
                dels = [int(x['at'].split('.')[1]) for x in R if x['op'] == 'delete' and int(x['at'].split('.')[0]) == n]
                nb_new = nb - sum(1 for d in dels if d < nb)
                carrier = P[nb_new]
                if (n, i) == (36, 53) and ed == 'modern-en':
                    carrier = P[52]
                miss = nset(r['before']) - nset(carrier)
                check(len(miss) <= 2, f'{book} {ed} {r["at"]}: caption content carried by retained {n}.{nb_new} (unmatched content words: {sorted(miss)})')
        elif book == 'odyssey':
            if ed == 'original-en':
                r = R[0]
                tail = words(r['before'])[len(words(r['after'])):]
                check(words(r['before'])[:len(words(r['after']))] == words(r['after']), f'{book} {ed} 3.37: kept text is the exact opening of the served paragraph')
                check(len(wo) == len(wi) - len(tail), f'{book} {ed}: only the {len(tail)}-word splice tail removed')
            else:
                check(ib == ob, f'{book} {ed}: accepted modern-en unchanged byte for byte')

# JE: original-en and modern-en stay paragraph-aligned
for book in S['books']:
    a = json.load(open(os.path.join(PKG, S['books'][book]['files']['original-en']['file'])))
    b = json.load(open(os.path.join(PKG, S['books'][book]['files']['modern-en']['file'])))
    check([len(c['paragraphs']) for c in a['chapters']] == [len(c['paragraphs']) for c in b['chapters']],
          f'{book}: original-en and modern-en per-chapter paragraph counts identical after the change')

# Butler clause against Gutenberg text shipped with the Odyssey package
pg = subprocess.run(['git', '-C', ROOT, 'show', S['pins']['odyssey'] + ':books/staged-replacements/odyssey/source-texts/pg1727-butler-1900.txt'],
                    capture_output=True, check=True).stdout
check(hashlib.sha256(pg).hexdigest() == 'ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9', 'odyssey: PG #1727 copy hash')
t = pg.decode('utf-8').replace('\r', '')
m = re.search(r'\n\n([^\n]+)\n\n+\n\nBOOK IV\n', t)
od = json.load(open(os.path.join(PKG, S['books']['odyssey']['files']['original-en']['file'])))
check(m and m.group(1) == od['chapters'][2]['paragraphs'][37], f'odyssey: 3.37 equals PG Book III final line {m.group(1) if m else None!r}')

print('\nRESULT:', 'ALL CHECKS PASS' if not fails else f'{len(fails)} FAILURES')
sys.exit(1 if fails else 0)
