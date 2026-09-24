#!/usr/bin/env python3
"""Verify original-da-corrected.json against the raw OCR of Frygt og Bæven (1895).

Checks
  1. Structure: 8 chapters, slot counts 5/13/17/42/32/29/88/6, slot indices,
     note anchors present in their anchor slot, own-slot slots empty.
  2. Raw collation: for every chapter the raw OCR (books/raw/.../raw.txt) is
     tokenised after dropping running heads, page numbers, the garbage lines
     listed in JUNK, and chapter/section heading lines.  Footnote lines are
     split off into one stream per note, using each note's `rawLines`.
     Line-final hyphens are rejoined (hyphen kept only before a capital).
     Every token-level correction documented in the slots' `corrections`
     ("cat: ⟦old⟧→⟦new⟧ (raw N)") is applied to that raw stream; the result
     must be identical to the corrected main text / note text.  difflib is
     then run raw-vs-corrected and every opcode is attributed to a documented
     correction.  Any unexplained opcode = FAIL (lost / duplicated words).
  3. Served comparison: the corrected main text of every slot is compared with
     the served slot (app/public/data/editions/fear-and-trembling-original-da.json)
     to show that content assignment to slots is unchanged.

Usage: python3 check_corrected_source.py   (run from anywhere)
"""
import json, os, re, difflib, collections, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
RAW = os.path.join(ROOT, 'books/raw/fear-and-trembling/raw.txt')
SERVED = os.path.join(ROOT, 'app/public/data/editions/fear-and-trembling-original-da.json')
CORR = os.path.join(HERE, 'original-da-corrected.json')

# chapter number -> (first raw line, last raw line, heading lines dropped)
CHAPTERS = {1: (194, 339, [194]), 2: (340, 553, [340]), 3: (554, 949, [554]),
            4: (950, 2300, [950, 953]), 5: (2301, 2967, [2301, 2304, 2305]),
            6: (2968, 3634, [2968, 2971]), 7: (3635, 5603, [3635, 3638, 3639, 3640]),
            8: (5604, 5735, [5604])}
EXPECTED_SLOTS = [5, 13, 17, 42, 32, 29, 88, 6]
# section numerals printed on their own line (OCR text -> expected sectionHeading)
SECTIONS = {390: ('I.', 'I.'), 455: ('IT.', 'II.'), 484: ('III.', 'III.'), 516: ('IV.', 'IV.')}
# OCR garbage lines: ornaments, printer's signature marks ("3*" read as "3?"),
# library stamps, bleed-through.  Each is printed in the report.
JUNK = {222, 441, 474, 507, 536, 537, 914, 1102, 1200, 1254, 1590, 1717, 2018, 2024,
        2594, 2851, 3265, 3311, 3966, 3969, 4014, 4017, 4172, 4488, 4642, 5339, 5473, 5476}

lines = open(RAW, encoding='utf-8').read().split('\n')
L = lambda n: lines[n - 1]
is_head = lambda s: bool(re.match(r'^\s*Frygt og B.ven\. 3\. Udg\.', s))
is_pnum = lambda s: bool(re.match(r'^\s*\.?\s*\d{1,3}\s*\.?\s*$', s))
FIXRE = re.compile(r'^(?:\[(?P<nid>n[\d.]+[a-z])\] )?(?P<cat>OCR|quote|punct|marker|Greek|Latin|German|name|scan|emend): ⟦(?P<old>.*?)⟧→⟦(?P<new>.*?)⟧ \(raw (?P<line>\d+)\)')


def parse_ranges(s):
    out = []
    for part in s.split(','):
        part = part.strip()
        a, _, b = part.partition('-')
        out.append((int(a), int(b or a)))
    return out


def tokenize(linenos):
    """Tokens (text, line) with line-final hyphens rejoined."""
    toks, pending = [], None
    for n in linenos:
        ws = L(n).split()
        if pending is not None and ws and ws[0] == '-' and len(ws) > 1:
            ws = ws[1:]
        for i, w in enumerate(ws):
            if pending is not None:
                stem = pending[0].rstrip('-')
                tok = ((stem + '-' + w) if w[:1].isupper() else (stem + w), pending[1], True)
                pending = None
            else:
                tok = (w, n, False)
            if i == len(ws) - 1 and not tok[2] and re.search(r'[A-Za-zæøåÆØÅ]-{1,2}$', tok[0]):
                pending = tok
                continue
            toks.append(tok[:2])
    if pending:
        toks.append(pending[:2])
    return toks


def apply_fixes(toks, fixes, report):
    toks = list(toks)
    applied = []
    for f in fixes:
        old, new, line = f['old'].split(), f['new'].split(), f['line']
        hit = None
        for i in range(len(toks)):
            if toks[i][1] == line and [t[0] for t in toks[i:i + len(old)]] == old:
                hit = i
                break
        if hit is None:
            report.append(f"  FAIL documented correction not found in raw: {f['raw']}")
            continue
        toks[hit:hit + len(old)] = [(w, line) for w in new]
        applied.append(f)
    return toks, applied


def main():
    out = []
    P = out.append
    ok = True
    corr = json.load(open(CORR, encoding='utf-8'))
    served = json.load(open(SERVED, encoding='utf-8'))

    # ---------------- 1. structure ----------------
    P('== 1. Structure')
    counts = [len(c['slots']) for c in corr['chapters']]
    P(f"chapters: {len(corr['chapters'])} (expected 8); slots: {counts} (expected {EXPECTED_SLOTS})")
    if len(corr['chapters']) != 8 or counts != EXPECTED_SLOTS:
        ok = False; P('  FAIL structure')
    for c, sc in zip(corr['chapters'], served['chapters']):
        assert c['title'] == sc['title'], c['number']
        for i, s in enumerate(c['slots']):
            if s['index'] != i:
                ok = False; P(f"  FAIL ch{c['number']} slot index {s['index']} != {i}")
            for n in s['notes']:
                anchor_slot = c['slots'][n['anchorSlot']]
                if n['anchorAfter'] not in anchor_slot['text']:
                    ok = False; P(f"  FAIL anchor of {n['id']} not in slot {n['anchorSlot']}")
                if n['ownSlot'] and s['text'] != '':
                    ok = False; P(f"  FAIL own-slot note {n['id']} but slot {i} has text")
    nnotes = collections.Counter()
    ids = collections.OrderedDict()
    for c in corr['chapters']:
        for s in c['slots']:
            for n in s['notes']:
                ids.setdefault(n['id'], n['status'])
    for st in ids.values():
        nnotes[st] += 1
    P(f"footnotes: {len(ids)} distinct ids; served handling: {dict(nnotes)}")
    P(f"section headings: {[(c['number'], s['index'], s['sectionHeading']) for c in corr['chapters'] for s in c['slots'] if s['sectionHeading']]}")
    P('slot counts and indices OK' if ok else 'STRUCTURE PROBLEMS ABOVE')

    # ---------------- 2. raw collation ----------------
    P('')
    P('== 2. Raw collation (raw OCR minus junk + documented corrections == corrected text)')
    grand = collections.Counter()
    for c in corr['chapters']:
        num = c['number']
        a, b, heads = CHAPTERS[num]
        # note line ranges from the JSON
        note_lines = {}
        note_parts = collections.defaultdict(list)
        for s in c['slots']:
            for n in s['notes']:
                note_parts[n['id']].append((n.get('part', 1), n['text']))
                for x, y in parse_ranges(n['rawLines']):
                    for ln in range(x, y + 1):
                        note_lines[ln] = n['id']
        dropped = collections.Counter(); junk_seen = []
        main_lines, nl = [], collections.defaultdict(list)
        for n in range(a, b + 1):
            s = L(n)
            if not s.strip():
                continue
            if n in heads:
                dropped['heading'] += 1; continue
            if is_head(s):
                dropped['running head'] += 1; continue
            if is_pnum(s):
                dropped['page number'] += 1; continue
            if n in JUNK:
                dropped['garbage line'] += 1; junk_seen.append(f"{n}:{s.strip()!r}"); continue
            if n in SECTIONS:
                dropped['section numeral'] += 1
                ocr, exp = SECTIONS[n]
                nxt = None
                if s.strip() != ocr:
                    ok = False; P(f"  FAIL section line {n}")
                continue
            if n in note_lines:
                nl[note_lines[n]].append(n)
            else:
                main_lines.append(n)
        # documented token corrections
        fixes = collections.defaultdict(list)
        for s in c['slots']:
            for x in s['corrections']:
                m = FIXRE.match(x)
                if m:
                    fixes[m.group('nid') or 'main'].append(dict(old=m.group('old'), new=m.group('new'),
                                                              line=int(m.group('line')), cat=m.group('cat'), raw=x))
        streams = [('main', main_lines, [w for s in c['slots'] for w in s['text'].split()])]
        for nid, parts in note_parts.items():
            streams.append((nid, nl[nid], [w for _, t in sorted(parts) for w in t.split()]))
        # every note-line assignment must be used, notes with prefix must exist
        for key in fixes:
            if key != 'main' and key not in note_parts:
                ok = False; P(f"  FAIL corrections for unknown note {key}")
        chap_ok = True; stats = collections.Counter()
        rep = []
        for name, lns, corrected in streams:
            raw = tokenize(lns)
            fixed, applied = apply_fixes(raw, fixes.get(name, []), rep)
            if [t[0] for t in fixed] != corrected:
                chap_ok = False
                sm = difflib.SequenceMatcher(None, [t[0] for t in fixed], corrected, autojunk=False)
                for op, i1, i2, j1, j2 in sm.get_opcodes():
                    if op != 'equal':
                        rep.append(f"  FAIL {name}: unexplained {op}: raw+fixes ⟦{' '.join(t[0] for t in fixed[i1:i2])}⟧ vs corrected ⟦{' '.join(corrected[j1:j2])}⟧ (raw line {fixed[i1][1] if i1 < len(fixed) else '?'})")
            # raw vs corrected difflib, attribute each opcode to documented corrections
            sm = difflib.SequenceMatcher(None, [t[0] for t in raw], corrected, autojunk=False)
            doc_lines = collections.defaultdict(list)
            for f in applied:
                doc_lines[f['line']].append(f)
            for op, i1, i2, j1, j2 in sm.get_opcodes():
                if op == 'equal':
                    stats['equal_tokens'] += i2 - i1
                    continue
                span = [t[1] for t in raw[i1:i2]] or [raw[i1 - 1][1] if i1 else raw[0][1]]
                lo, hi = min(span) - 1, max(span) + 1
                cands = [f for ln in range(lo, hi + 1) for f in doc_lines.get(ln, [])]
                if cands:
                    stats['opcodes_explained'] += 1
                    for f in cands:
                        stats['cat_' + f['cat']] += 0
                else:
                    stats['opcodes_UNEXPLAINED'] += 1
                    chap_ok = False
                    rep.append(f"  FAIL {name}: {op} raw ⟦{' '.join(t[0] for t in raw[i1:i2])}⟧ → ⟦{' '.join(corrected[j1:j2])}⟧ not documented")
            stats['raw_tokens'] += len(raw); stats['corrected_tokens'] += len(corrected)
            for f in applied:
                stats['fix_' + f['cat']] += 1
            if len(applied) != len(fixes.get(name, [])):
                chap_ok = False
        ok = ok and chap_ok
        grand.update(stats)
        P(f"ch{num} [{c['title'][:40]}] raw lines {a}-{b}: {'OK' if chap_ok else 'FAIL'}; "
          f"streams: main + {len(note_parts)} note(s); raw tokens {stats['raw_tokens']}, corrected tokens {stats['corrected_tokens']}, "
          f"identical tokens {stats['equal_tokens']}, difflib opcodes {stats['opcodes_explained']} all explained by documented corrections"
          + (f", UNEXPLAINED {stats['opcodes_UNEXPLAINED']}" if stats['opcodes_UNEXPLAINED'] else ''))
        P(f"    dropped raw lines: {dict(dropped)}")
        if junk_seen:
            P(f"    garbage lines: {'; '.join(junk_seen)}")
        P(f"    documented token corrections applied: " + ', '.join(f"{k[4:]}={v}" for k, v in sorted(stats.items()) if k.startswith('fix_')))
        for r in rep:
            P(r)
    P(f"TOTAL raw tokens {grand['raw_tokens']}, corrected tokens {grand['corrected_tokens']}, identical {grand['equal_tokens']}, "
      f"explained opcodes {grand['opcodes_explained']}, unexplained {grand['opcodes_UNEXPLAINED']}; corrections by category: "
      + ', '.join(f"{k[4:]}={v}" for k, v in sorted(grand.items()) if k.startswith('fix_')))

    # ---------------- 3. served comparison ----------------
    P('')
    P('== 3. Served comparison (content assignment per slot)')
    norm = lambda w: re.sub(r'[^\wæøåÆØÅ]', '', w.lower())
    low = []
    for c, sc in zip(corr['chapters'], served['chapters']):
        for i, (s, sp) in enumerate(zip(c['slots'], sc['paragraphs'])):
            ct = [norm(w) for w in s['text'].split() if norm(w)]
            st = collections.Counter(norm(w) for w in sp.split() if norm(w))
            if not ct:
                continue
            found = sum(1 for w in ct if st[w] > 0)
            r = found / len(ct)
            if r < 0.97:
                low.append(f"  ch{c['number']} slot {i}: {r:.3f} of corrected main-text words occur in the served slot "
                           f"(explained by: {'; '.join(x.split(':')[0] for x in s['corrections'] if not FIXRE.match(x)) or 'OCR corrections'})")
    P('every slot with main text: >=97% of its corrected words occur in the same served slot, except:' if low else 'every slot with main text: >=97% of its corrected words occur in the same served slot')
    for x in low:
        P(x)
    P('')
    P('RESULT: ' + ('PASS' if ok else 'FAIL'))
    text = '\n'.join(out) + '\n'
    open(os.path.join(HERE, 'check-output.txt'), 'w', encoding='utf-8').write(text)
    sys.stdout.write(text)
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
