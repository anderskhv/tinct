#!/usr/bin/env python3
"""Whole-edition structural and consistency checks for a modern-en (or any) edition.

Usage:
  python3 books/edition_checks.py <book-id> [--edition modern-en] [--source original-en]
                                  [--candidate path.json] [--chapters 274,355] [--json]

BLOCK lines are definite structural failures (acceptance must fail).
FLAG lines are places to inspect; they are not verdicts and must not be "fixed" blindly.

Complements books/classify-modern-en.py (the similarity gate); this script does not replace it.
"""
import argparse, collections, difflib, json, re, statistics as st, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EDITIONS = ROOT / 'app' / 'public' / 'data' / 'editions'
ARCHAIC = re.compile(r"\b(thou|thee|thy|thine|hath|doth|whilst|ere|hither|thither|whence|wherefore|unto|shalt|saith|verily|betwixt|oft|said he|thought he)\b", re.I)
FRENCH = re.compile(r"\b(qu'il|qu'elle|n'est|c'est|vous êtes|je suis|mon cher|ma chère|monsieur|madame)\b", re.I)


def load(path):
    d = json.load(open(path))
    chs = d['chapters'] if isinstance(d, dict) else d
    for c in chs:
        assert isinstance(c.get('paragraphs'), list), f"chapter {c.get('number')} has no paragraphs list"
    return chs


def wc(s):
    return len(s.split())


def sentences(t):
    # split after . ! ? optionally followed by closing quotes/brackets, then whitespace
    return [s for s in re.split(r'(?<=[.!?])["\u201d\u2019\')\]]*\s+', t) if s.strip()]


def norm_name(w):
    w = ''.join(ch for ch in unicodedata.normalize('NFD', w) if unicodedata.category(ch) != 'Mn').lower()
    w = re.sub(r'(sky|ski|skoy|skoi|skii)$', 'ski', w)
    w = re.sub(r'(ov|off|ev|eff)$', 'ov', w)
    return w.replace('y', 'i')


def parse_title(t):
    m = re.match(r'(.*?) — (?:Chapter|Kapitel|Book|Bog|Part) (\d+)', t or '')
    return (m.group(1), int(m.group(2))) if m else (t, None)


def run(src, cand, chapters=None):
    out = {'block': [], 'flag': [], 'summary': {}}
    B, F = out['block'].append, out['flag'].append
    if len(src) != len(cand):
        B(f"chapter count {len(cand)} != source {len(src)}")
        return out
    sel = [i for i in range(len(src)) if not chapters or src[i]['number'] in chapters]

    # --- structure (blocking)
    for i in sel:
        s, c = src[i], cand[i]
        if s['number'] != c['number']:
            B(f"ch{c['number']}: number mismatch with source {s['number']}")
        if len(s['paragraphs']) != len(c['paragraphs']):
            B(f"ch{s['number']}: paragraph count {len(c['paragraphs'])} != source {len(s['paragraphs'])}")
        for j, p in enumerate(c['paragraphs']):
            if not isinstance(p, str) or not p.strip():
                B(f"ch{s['number']} p{j}: empty or non-string paragraph")

    # --- titles (flag; source itself may be defective)
    prev = None
    for i in range(len(src)):
        b, n = parse_title(src[i]['title'])
        if prev and n is not None and not ((b == prev[0] and n == prev[1] + 1) or (b != prev[0] and n == 1)):
            F(f"title-sequence ch{src[i]['number']}: source title {src[i]['title']!r} breaks sequence after {prev}")
        prev = (b, n)
        if i in sel and cand[i]['title'] != src[i]['title']:
            F(f"title-diff ch{src[i]['number']}: candidate {cand[i]['title']!r} != source {src[i]['title']!r}")
    dup = collections.Counter(c['title'] for c in cand)
    for t, k in dup.items():
        if k > 1:
            F(f"title-duplicate: {t!r} x{k}")

    # --- per-paragraph content flags
    ratios_low, ratios_high, qm, long_sent, verbatim, arch, fr_kept = [], [], [], [], [], collections.Counter(), []
    slot_bare, orphan_star, tags = [], [], []
    for i in sel:
        s, c = src[i], cand[i]
        if len(s['paragraphs']) != len(c['paragraphs']):
            continue
        n = s['number']
        for j, (a, b) in enumerate(zip(s['paragraphs'], c['paragraphs'])):
            wa, wb = wc(a), wc(b)
            if wa >= 40:
                r = wb / wa
                if r < 0.70: ratios_low.append((n, j, wa, wb, round(r, 2)))
                if r > 1.50: ratios_high.append((n, j, wa, wb, round(r, 2)))
            if abs(a.count('?') - b.count('?')) >= 2 or abs(a.count('!') - b.count('!')) >= 3:
                qm.append((n, j, a.count('?'), b.count('?'), a.count('!'), b.count('!')))
            for sent in sentences(b):
                if wc(sent) > 50: long_sent.append((n, j, wc(sent)))
            if wa >= 30 and difflib.SequenceMatcher(None, a, b).ratio() > 0.85:
                verbatim.append((n, j))
            for m in ARCHAIC.findall(b): arch[m.lower()] += 1
            if len(FRENCH.findall(b)) >= 3 and len(FRENCH.findall(a)) >= 3: fr_kept.append((n, j))
            # footnote remnants
            if a.lstrip().startswith('*'):
                if not b.lstrip().startswith('*') and not b.lstrip().startswith(('(', '[')) and wc(b) <= 12:
                    slot_bare.append((n, j, b[:60]))
            elif re.search(r'(?<!\w)\*(?!\*)', b):
                nxt = c['paragraphs'][j + 1] if j + 1 < len(c['paragraphs']) else ''
                if not nxt.lstrip().startswith('*'): orphan_star.append((n, j))
            if re.search(r'\[(speaking in|på |note|translator|editor)', b, re.I): tags.append((n, j, b[:50]))

    for x in ratios_low: F(f"ratio-low ch{x[0]} p{x[1]}: {x[2]}->{x[3]} words ({x[4]})")
    for x in ratios_high: F(f"ratio-high ch{x[0]} p{x[1]}: {x[2]}->{x[3]} words ({x[4]})")
    for x in qm: F(f"punct-parity ch{x[0]} p{x[1]}: ? {x[2]}->{x[3]}, ! {x[4]}->{x[5]}")
    for x in long_sent: F(f"long-sentence ch{x[0]} p{x[1]}: {x[2]} words")
    for x in slot_bare: F(f"footnote-slot-bare ch{x[0]} p{x[1]}: {x[2]!r}")
    for x in orphan_star: F(f"footnote-orphan-marker ch{x[0]} p{x[1]}")
    for x in tags: F(f"bracket-tag ch{x[0]} p{x[1]}: {x[2]!r}")
    by_ch = collections.Counter(x[0] for x in verbatim)
    for i in sel:
        n = src[i]['number']
        tot = sum(1 for a in src[i]['paragraphs'] if wc(a) >= 30)
        if tot and by_ch[n] / tot >= 0.5:
            F(f"near-verbatim ch{n}: {by_ch[n]}/{tot} long paragraphs >0.85 similar to source")

    # --- quote style per chapter
    for i in sel:
        c = cand[i]
        dq = sum(p.count('"') for p in c['paragraphs'])
        sq = sum(len(re.findall(r"(^|\s)'", p)) for p in c['paragraphs'])
        if dq < 5 and sq > 5:
            F(f"quote-style ch{c['number']}: single-quote dialogue ({sq} openers, {dq} double quotes)")

    # --- name variants (whole edition, flag only)
    cnt, chap = collections.Counter(), collections.defaultdict(set)
    for c in cand:
        for p in c['paragraphs']:
            for w in re.findall(r"\b[A-ZÉ][a-zéèëáíóúý]+(?:ov|ev|in|sky|ski|skoy|skoi|ich|vna|aya|ène|ene)\b", p):
                cnt[w] += 1; chap[w].add(c['number'])
    groups = collections.defaultdict(list)
    for w, k in cnt.items(): groups[norm_name(w)].append((w, k))
    for key, vs in groups.items():
        if len(vs) > 1 and sum(k for _, k in vs) >= 6:
            vs = sorted(vs, key=lambda x: -x[1])
            F("name-variant " + " / ".join(f"{w}={k} (ch {sorted(chap[w])[:6]})" for w, k in vs))

    out['summary'] = {
        'chapters_checked': len(sel),
        'paragraphs_checked': sum(len(src[i]['paragraphs']) for i in sel),
        'ratio_low': len(ratios_low), 'long_sentences_gt50': len(long_sent),
        'near_verbatim_paragraphs': len(verbatim), 'archaic_tokens': dict(arch.most_common(8)),
        'french_kept_paragraphs': len(fr_kept), 'blocks': len(out['block']), 'flags': len(out['flag']),
    }
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('book')
    ap.add_argument('--edition', default='modern-en')
    ap.add_argument('--source', default='original-en')
    ap.add_argument('--candidate', help='path to a candidate edition file (whole book) or a single-chapter JSON')
    ap.add_argument('--chapters', help='comma-separated chapter numbers to restrict content checks')
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args()
    src = load(EDITIONS / f'{a.book}-{a.source}.json')
    if a.candidate:
        d = json.load(open(a.candidate))
        if isinstance(d, dict) and 'paragraphs' in d and 'chapters' not in d:
            # single chapter: splice into the live edition for whole-book context
            cand = load(EDITIONS / f'{a.book}-{a.edition}.json')
            idx = next(i for i, c in enumerate(cand) if c['number'] == d['number'])
            cand[idx] = d
            a.chapters = str(d['number'])
        else:
            cand = load(a.candidate)
    else:
        cand = load(EDITIONS / f'{a.book}-{a.edition}.json')
    chapters = {int(x) for x in a.chapters.split(',')} if a.chapters else None
    out = run(src, cand, chapters)
    if a.json:
        print(json.dumps(out, indent=1, ensure_ascii=False)); return
    for b in out['block']: print('BLOCK', b)
    for f in out['flag']: print('FLAG ', f)
    print('SUMMARY', json.dumps(out['summary'], ensure_ascii=False))
    sys.exit(1 if out['block'] else 0)


if __name__ == '__main__':
    main()
