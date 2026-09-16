#!/usr/bin/env python3
"""Cross-check the 46 legacy (pre-existing, non-tipnr-*) character names that
are also TIPNR homonym families (2+ distinct people), against the CURRENT
bible.v1.json (after the Herod/James/Mary manual fixes and the tipnr-* bulk
add). For each TIPNR-resolved span under one of these names:
  - if a legacy (non-tipnr-*) mention already claims that exact span, record
    which TIPNR record that span belongs to vs which legacy id claims it.
  - if unclaimed, it's a gap the bulk pass silently skipped (because some
    *other* wrong mention made it look "already covered").
Does not write anything; produces a report for manual/scripted follow-up.
"""
import json, re
from pathlib import Path
from resolve import Edition, parse_refs
from book_map import TIPNR_TO_TITLE

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
EDITIONS = ['kjv-en', 'web-en']

LEGACY_NAMES = ["Ahab","Amos","Ananias","Asa","Baruch","Benjamin","Caleb","Daniel","Deborah",
"Elijah","Ezra","Gamaliel","Herod","Hezekiah","Ishmael","James","Jehoshaphat","Jehu","Jeremiah",
"Jeroboam","Joab","Joel","John","Jonathan","Joseph","Joshua","Josiah","Judah","Lazarus","Manasseh",
"Mary","Micah","Miriam","Mordecai","Naaman","Nahum","Nathan","Nehemiah","Noah","Obadiah","Pharaoh",
"Philip","Zechariah","Zedekiah","Zephaniah","Zerubbabel"]


def display_names(translated):
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


def main():
    tipnr = json.loads((HERE / 'tipnr_persons.json').read_text())
    pkg = json.loads((ROOT / 'app/public/data/characters/bible.v1.json').read_text())
    editions = {ek: Edition(ek) for ek in EDITIONS}

    legacy_span_owner = {ek: {} for ek in EDITIONS}  # span -> characterId, for non-tipnr- ids only
    any_span_owner = {ek: {} for ek in EDITIONS}  # span -> characterId, everyone (incl. tipnr-*)
    for ek in EDITIONS:
        for m in pkg['editions'][ek]['mentions']:
            key = (m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset'])
            any_span_owner[ek][key] = m['characterId']
            if not m['characterId'].startswith('tipnr-'):
                legacy_span_owner[ek][key] = m['characterId']

    fam = {}
    for r in tipnr:
        base = r['unified'].split('@')[0]
        if base in LEGACY_NAMES:
            fam.setdefault(base, []).append(r)

    report = {'mismatches': [], 'unclaimed_gaps': [], 'clean_matches': 0}
    for base, records in fam.items():
        for rec in records:
            strong = re.search(r'=([HG]\w+)$', rec['unified']).group(1)
            for nf in rec['named_forms']:
                names = display_names(nf['translated'])
                for tok in parse_refs(nf['refs_raw']):
                    if tok is None:
                        continue
                    book, ch, v, letter = tok
                    if book not in TIPNR_TO_TITLE:
                        continue
                    occurrence = (ord(letter) - ord('a')) if letter else 0
                    for ek in EDITIONS:
                        ed = editions[ek]
                        gc = ed.chapter_number(book, ch)
                        if gc is None:
                            continue
                        spans = ed.verses(gc).get(v)
                        if not spans:
                            continue
                        for pi, text, s, e in spans:
                            seg = text[s:e]
                            found = None
                            for cand in names[ek]:
                                hits = [m.start() for m in re.finditer(re.escape(cand), seg)]
                                if occurrence < len(hits):
                                    found = (cand, hits[occurrence]); break
                                if not letter and hits:
                                    found = (cand, hits[0]); break
                            if not found:
                                continue
                            name, idx = found
                            start, end = s + idx, s + idx + len(name)
                            key = (gc, pi, start, end)
                            legacy_owner = legacy_span_owner[ek].get(key)
                            any_owner = any_span_owner[ek].get(key)
                            entry = {'base': base, 'tipnr': rec['unified'], 'strong': strong, 'ek': ek,
                                      'ref': f'{book}.{ch}.{v}{letter}', 'chapter': gc, 'para': pi, 'span': [start, end], 'text': name}
                            if any_owner is None:
                                report['unclaimed_gaps'].append(entry)
                            elif legacy_owner is not None:
                                entry['legacy_owner'] = legacy_owner
                                report['mismatches'].append(entry)
                            else:
                                report['clean_matches'] += 1  # already correctly owned by a tipnr-* entity

    (HERE / 'homonym_audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=1))
    print('unclaimed_gaps:', len(report['unclaimed_gaps']))
    print('legacy-claimed spans (need id-consistency check):', len(report['mismatches']))


if __name__ == '__main__':
    main()
