#!/usr/bin/env python3
"""Structural validation for a character package against its live editions.
Run after any binding/pruning step and before real-browser verification.

Checks, per edition:
- every mention's [startOffset, endOffset) slice of the normalized
  paragraph (UTF-16 units) equals its stored text
- no duplicate character ids; no duplicate mention spans
- no two mentions with DIFFERENT characterIds overlapping in a paragraph
  (the reader falls through to dictionary lookup on ambiguity)
- for every character: no mention earlier than firstMention; no snapshot
  availableAt earlier than firstMention; the earliest snapshot sits
  exactly at firstMention; roleVisibleAt == firstMention
- every mention is tappable under the reader's word-trimming rules
  (curly-single-quote-only cases are reported separately, not failed)

Exit code 1 on any hard failure. Usage: validate_package.py BOOK [BOOK...]
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from prune_untappable import trimmed_tokens, tappable, LEAD_CURLY, TRAIL_CURLY, normalized  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]


def pk(p):
    return (p['chapterNumber'], p['paragraphIndex'], p['offset'])


def validate(book):
    pkg = json.loads((ROOT / f'app/public/data/characters/{book}.v1.json').read_text())
    ok = True
    for ek, ed in pkg['editions'].items():
        ed_path = ROOT / f'app/public/data/editions/{book}-{ek}.json'
        if not ed_path.exists():
            continue
        data = json.loads(ed_path.read_bytes())
        paras = {(c['number'], pi): normalized(p) for c in data['chapters'] for pi, p in enumerate(c['paragraphs'])}
        toks = {k: trimmed_tokens(t) for k, t in paras.items()}
        toks_curly = {k: trimmed_tokens(t, LEAD_CURLY, TRAIL_CURLY) for k, t in paras.items()}
        errors = dup_spans = overlaps = dead = curly = 0
        seen = set()
        by_para = {}
        for m in ed['mentions']:
            key = (m['chapterNumber'], m['paragraphIndex'])
            span = key + (m['startOffset'], m['endOffset'])
            if span in seen:
                dup_spans += 1
            seen.add(span)
            text = paras.get(key)
            if text is None:
                errors += 1
                continue
            u = text.encode('utf-16-le')
            if u[m['startOffset'] * 2:m['endOffset'] * 2].decode('utf-16-le') != m['text']:
                errors += 1
            by_para.setdefault(key, []).append((m['startOffset'], m['endOffset'], m['characterId']))
            if not tappable(m, toks.get(key, [])):
                if tappable(m, toks_curly.get(key, [])):
                    curly += 1
                else:
                    dead += 1
        for spans in by_para.values():
            spans.sort()
            for (a1, b1, c1), (a2, b2, c2) in zip(spans, spans[1:]):
                if a2 < b1 and c1 != c2:
                    overlaps += 1
        ids = [c['id'] for c in ed['characters']]
        dup_ids = len(ids) - len(set(ids))
        invariant = 0
        for c in ed['characters']:
            fm = pk(c['firstMention'])
            ms = [m for m in ed['mentions'] if m['characterId'] == c['id']]
            if ms and min((m['chapterNumber'], m['paragraphIndex'], m['endOffset']) for m in ms) < fm:
                invariant += 1
            snaps = [pk(s['availableAt']) for s in c['snapshots']]
            if any(s < fm for s in snaps) or (snaps and min(snaps) != fm) or pk(c['roleVisibleAt']) != fm:
                invariant += 1
        hard = errors + dup_spans + overlaps + dup_ids + invariant + dead
        status = 'OK ' if hard == 0 else 'FAIL'
        print(f'{status} {book:28s} {ek:12s} chars={len(ids):4d} mentions={len(ed["mentions"]):6d} '
              f'offset_errors={errors} dup_ids={dup_ids} dup_spans={dup_spans} cross_id_overlaps={overlaps} '
              f'invariant={invariant} untappable={dead} curly_quote_only={curly}')
        ok = ok and hard == 0
    return ok


if __name__ == '__main__':
    results = [validate(b) for b in sys.argv[1:]]
    sys.exit(0 if all(results) else 1)
