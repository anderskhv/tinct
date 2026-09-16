#!/usr/bin/env python3
"""Generate Bible character candidates from TIPNR, bind them, and report gaps.

Pipeline:
1. Load existing bible.v1.json mentions (both editions) as "already covered" spans.
2. For every TIPNR PERSON record, resolve every named-form reference to an
   exact (edition, chapterNumber, paragraphIndex, startOffset, endOffset) span
   using the verse-marker resolver.
3. A resolved span that overlaps an existing mention's span (same chapter+
   paragraph+offset range, either edition) is "already covered" -> skip
   generating a new entity for it, but record the overlap for the ledger.
4. A resolved span with no overlap is a genuine, mechanically-verified gap.
   Emit a new entity: id derived from the TIPNR dStrong code (stable,
   unique, independent of display name), aliases = every distinct surface
   string actually found, subtitle = TIPNR @Briefest, body = TIPNR @Brief
   (short, low-spoiler, matches "concise identification" policy for minor
   figures) with a light trim pass for a few known-risky words.
5. Anything that fails to resolve at all (ref parse failure, verse not
   found, name not found in the verse text) is logged, never silently
   dropped, for manual review.

This does not touch app/public/data/characters/bible.v1.json directly; it
writes a report + a candidate entity list for review before binding.
"""
import json, re, sys
from pathlib import Path
from resolve import Edition, parse_refs
from book_map import TIPNR_TO_TITLE

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]

EDITIONS = ['kjv-en', 'web-en']


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def load_existing():
    pkg = json.loads((ROOT / 'app/public/data/characters/bible.v1.json').read_text())
    spans = {ek: set() for ek in EDITIONS}
    id_names = {}
    for ek in EDITIONS:
        ed = pkg['editions'][ek]
        for m in ed['mentions']:
            spans[ek].add((m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset']))
        for c in ed['characters']:
            id_names[c['id']] = c['snapshots'][0]['name']
    return pkg, spans, id_names


def display_names(translated):
    """Return {edition: [candidate names, longest first]}. TIPNR sometimes
    tags a spelling to a translation family ('Zedekiah =ESV,NIV; Zidkijah
    =KJV') and sometimes just lists comma-separated alternate forms with no
    tag ('Israel,Israelite'); both cases must be tried as candidates rather
    than searched for as one literal (untagged) string."""
    default_candidates = []
    tagged = {'kjv-en': [], 'web-en': []}
    for seg in translated.split(';'):
        seg = seg.strip()
        m = re.match(r'^(.+?)\s*=(.+)$', seg)
        if m:
            nm, tags = m.group(1).strip(), m.group(2)
            if 'KJV' in tags:
                tagged['kjv-en'].append(nm)
            if 'ESV' in tags or 'NIV' in tags:
                tagged['web-en'].append(nm)
        else:
            default_candidates.extend(p.strip() for p in seg.split(',') if p.strip())
    out = {}
    for ek in ('kjv-en', 'web-en'):
        cands = tagged[ek] + default_candidates
        out[ek] = sorted(dict.fromkeys(cands), key=len, reverse=True)
    return out


def strong_id(unified):
    m = re.search(r'=([HG]\w+)$', unified)
    return m.group(1) if m else None


def main():
    persons = json.loads((HERE / 'tipnr_persons.json').read_text())
    pkg, existing_spans, id_names = load_existing()
    editions = {ek: Edition(ek) for ek in EDITIONS}

    report = {'already_covered': [], 'unresolved': [], 'new_entities': []}

    for rec in persons:
        strong = strong_id(rec['unified'])
        if not strong:
            report['unresolved'].append({'record': rec['unified'], 'reason': 'no strong code'})
            continue
        per_edition_mentions = {ek: [] for ek in EDITIONS}
        covered_hit = False
        any_resolved = False
        for nf in rec['named_forms']:
            names = display_names(nf['translated'])
            for tok in parse_refs(nf['refs_raw']):
                if tok is None:
                    report['unresolved'].append({'record': rec['unified'], 'reason': 'unparsed ref', 'raw': nf['refs_raw']})
                    continue
                book, ch, v, letter = tok
                if book not in TIPNR_TO_TITLE:
                    report['unresolved'].append({'record': rec['unified'], 'reason': 'unknown book', 'book': book})
                    continue
                for ek in EDITIONS:
                    ed = editions[ek]
                    candidates = names[ek]
                    gc = ed.chapter_number(book, ch)
                    if gc is None:
                        report['unresolved'].append({'record': rec['unified'], 'reason': 'no chapter', 'ek': ek, 'ref': f'{book}.{ch}.{v}'})
                        continue
                    spans = ed.verses(gc).get(v)
                    if not spans:
                        report['unresolved'].append({'record': rec['unified'], 'reason': 'no verse', 'ek': ek, 'ref': f'{book}.{ch}.{v}'})
                        continue
                    # A trailing letter (2Ch.23.1a / ...1b) means TIPNR itself
                    # distinguishes two different same-named individuals within
                    # one verse; use it as a 0-based occurrence index so each
                    # gets its own word instead of both claiming the first hit.
                    occurrence = (ord(letter) - ord('a')) if letter else 0
                    matched_in_verse = False
                    for pi, text, s, e in spans:
                        seg = text[s:e]
                        found = None
                        for cand in candidates:
                            hits = [m.start() for m in re.finditer(re.escape(cand), seg)]
                            if occurrence < len(hits):
                                found = (cand, hits[occurrence])
                                break
                            if not letter and hits:
                                found = (cand, hits[0])
                                break
                        if found is None:
                            continue
                        name, idx = found
                        matched_in_verse = True
                        start = s + idx
                        end = start + len(name)
                        span_key = (gc, pi, start, end)
                        if span_key in existing_spans[ek]:
                            covered_hit = True
                        else:
                            per_edition_mentions[ek].append({'characterId': None, 'chapterNumber': gc, 'paragraphIndex': pi,
                                                               'startOffset': start, 'endOffset': end, 'text': name,
                                                               'resolution': 'tipnr-verse-scoped'})
                        any_resolved = True
                    if not matched_in_verse:
                        report['unresolved'].append({'record': rec['unified'], 'reason': 'name not in verse text', 'ek': ek, 'ref': f'{book}.{ch}.{v}', 'name': '|'.join(candidates)})
        if not any_resolved:
            continue
        if covered_hit and not (per_edition_mentions['kjv-en'] or per_edition_mentions['web-en']):
            report['already_covered'].append(rec['unified'])
            continue
        # Genuine new candidate (fully or partially uncovered).
        report['new_entities'].append({
            'strong': strong, 'unified': rec['unified'], 'briefest': rec['briefest'],
            'brief': rec['brief'], 'tribe': rec['tribe'], 'partially_covered': covered_hit,
            'mentions': per_edition_mentions,
        })

    (HERE / 'gap_report.json').write_text(json.dumps(report, ensure_ascii=False, indent=1))
    print(f"already_covered: {len(report['already_covered'])}")
    print(f"new_entities (genuine gaps): {len(report['new_entities'])}")
    print(f"unresolved log entries: {len(report['unresolved'])}")


if __name__ == '__main__':
    main()
