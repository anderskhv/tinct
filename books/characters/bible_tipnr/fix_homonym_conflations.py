#!/usr/bin/env python3
"""Rebuild the 21 legacy Bible cards found (via TIPNR cross-check) to be
conflating two or more distinct TIPNR-identified people under one card, and
split out the wrongly-absorbed occurrences into their own new cards (or,
for Zerubbabel, deliberately re-merge a same-person OT/NT record split --
see MERGE_AS_SAME below).

For each legacy id: KEEP only mentions belonging to its CORRECT TIPNR
strong code (recomputed from TIPNR ground truth, not just filtered from
the old possibly-wrong mentions -- some legacy mentions may also have
wrong offsets). Every other strong code found under that legacy id's
display name gets its own fresh tipnr-<strong> entity with its own
TIPNR-sourced description, unless it already has a different legacy id
(Herod, James, John, Joseph, Mary handled here too since they were
already partly split but wrongly).
"""
import json, re
from pathlib import Path
from resolve import Edition, parse_refs
from book_map import TIPNR_TO_TITLE

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
EDITIONS = ['kjv-en', 'web-en']
BIBLE_CHARS = ROOT / 'app/public/data/characters/bible.v1.json'

# legacy_id -> correct TIPNR strong code
CORRECT = {
    'ananias-of-damascus': 'G0367H',
    'elijah': 'H0452G',
    'ezra': 'H5830G',
    'gamaliel': 'G1059',
    'herod-the-great': 'G2264G',
    'herod-antipas': 'G2264H',
    'james-zebedee': 'G2385G',
    'james-the-just': 'G2385I',
    'jehoshaphat': 'H3092I',
    'jehu': 'H3058H',
    'jeremiah': 'H3414L',
    'jeroboam': 'H3379G',
    'john-the-baptist': 'G2491G',
    'john-apostle': 'G2491H',
    'joseph-husband-of-mary': 'G2501G',
    'joseph-of-arimathea': 'G2501I',
    'manasseh-king': 'H4519H',
    'mary-mother-of-jesus': 'G3137G',
    'mary-of-bethany': 'G3137J',
    'naaman': 'H5283I',
    'nathan-prophet': 'H5416H',
    'nehemiah': 'H5166H',
    'noah': 'H5146',
    'pharaoh-exodus': 'H6547J',
    'philip-apostle': 'G5376G',
    'zedekiah-king-of-judah': 'H6667H',
}

# Strong codes that are a genuine second TIPNR record for what this app
# treats as the SAME person (a Hebrew/Greek OT->NT genealogy-boundary split
# in TIPNR's own data, not two different individuals) -> merge into the
# named legacy id instead of splitting off.
MERGE_AS_SAME = {
    'G2216G': 'zerubbabel',  # Luke 3:27 NT genealogy form of the same Zerubbabel
}
# Also keep the deliberate Pass-1 judgment call for the 1Ch.3.16 ambiguous
# Zedekiah (folded into the king; see docs/character-coverage-bible-ledger).
MERGE_AS_SAME['H6667I'] = 'zedekiah-king-of-judah'

BASES_TO_SCAN = ["Ananias","Elijah","Ezra","Gamaliel","Herod","James","Jehoshaphat","Jehu",
"Jeremiah","Jeroboam","John","Joseph","Manasseh","Mary","Naaman","Nathan","Nehemiah","Noah",
"Pharaoh","Philip","Zedekiah","Zerubbabel"]


def clean(s):
    return re.sub(r'\s+', ' ', (s or '')).strip()


def tier(n):
    if n >= 100:
        return 'central'
    if n >= 20:
        return 'major'
    if n >= 5:
        return 'supporting'
    return 'reference'


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


def resolve_record(rec, editions):
    """Return {ek: [mention dicts]} for every occurrence of this TIPNR record."""
    out = {ek: [] for ek in EDITIONS}
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
                    out[ek].append({'chapterNumber': gc, 'paragraphIndex': pi,
                                     'startOffset': start, 'endOffset': end, 'text': name})
    return out


def make_character(eid, role, subtitle, body, mentions_by_ek):
    per_ek = {}
    for ek, ms in mentions_by_ek.items():
        if not ms:
            continue
        ms = sorted({(m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset'], m['text']) for m in ms})
        ms = [{'chapterNumber': c, 'paragraphIndex': p, 'startOffset': s, 'endOffset': e, 'text': t, 'characterId': eid, 'resolution': 'tipnr-verse-scoped'} for c, p, s, e, t in ms]
        first = min(ms, key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        point = {'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'offset': first['endOffset']}
        per_ek[ek] = {
            'mentions': ms,
            'character': {
                'id': eid, 'kind': 'person', 'storyRole': role,
                'roleVisibleAt': point, 'firstMention': point,
                'snapshots': [{
                    'id': eid + '-1', 'availableAt': point, 'name': first['text'],
                    'subtitle': subtitle, 'body': body,
                    'evidence': [{'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'throughOffset': point['offset']}],
                    'editorialBasis': 'TIPNR-verified identity (CC BY 4.0); rebuilt to correct a same-name conflation found by cross-checking the prior hand-authored card against STEPBible TIPNR.',
                }],
            },
        }
    return per_ek


def main():
    tipnr = json.loads((HERE / 'tipnr_persons.json').read_text())
    pkg = json.loads(BIBLE_CHARS.read_text())
    editions = {ek: Edition(ek) for ek in EDITIONS}

    fam = {}
    for r in tipnr:
        base = r['unified'].split('@')[0]
        if base in BASES_TO_SCAN:
            fam.setdefault(base, []).append(r)

    # Wipe mentions for every legacy id we're rebuilding.
    rebuild_ids = set(CORRECT.keys())
    for ek in EDITIONS:
        ed = pkg['editions'][ek]
        ed['mentions'] = [m for m in ed['mentions'] if m['characterId'] not in rebuild_ids]

    existing_ids = set()
    for ek in EDITIONS:
        existing_ids |= {c['id'] for c in pkg['editions'][ek]['characters']}

    strong_to_legacy = {v: k for k, v in CORRECT.items()}
    new_entities_log = []
    rebuilt_log = []

    for base, records in fam.items():
        for rec in records:
            strong = re.search(r'=([HG]\w+)$', rec['unified']).group(1)
            mentions = resolve_record(rec, editions)
            total = sum(len(v) for v in mentions.values())
            if total == 0:
                continue
            if strong in strong_to_legacy:
                eid = strong_to_legacy[strong]
                # Preserve the existing hand-authored subtitle/body for this id.
                old_char = next((c for c in pkg['editions']['kjv-en']['characters'] if c['id'] == eid), None)
                subtitle = old_char['snapshots'][0]['subtitle'] if old_char else clean(rec['briefest'])
                body = old_char['snapshots'][0]['body'] if old_char else clean(rec['brief'])
                role = old_char['storyRole'] if old_char else tier(total)
                rebuilt_log.append((eid, strong, total))
            elif strong in MERGE_AS_SAME:
                eid = MERGE_AS_SAME[strong]
                old_char = next((c for c in pkg['editions']['kjv-en']['characters'] if c['id'] == eid), None)
                if old_char is None:
                    continue  # merge target not in this batch's CORRECT map; leave for tipnr-* bulk pass
                subtitle = old_char['snapshots'][0]['subtitle']
                body = old_char['snapshots'][0]['body']
                role = old_char['storyRole']
                rebuilt_log.append((eid, strong, total))
            else:
                eid = 'tipnr-' + strong
                if eid in existing_ids and eid not in rebuild_ids:
                    continue  # already exists from the earlier bulk pass, don't touch
                subtitle = clean(rec['briefest'])
                role = tier(total)
                body = rec['brief'] if role in ('central', 'major', 'supporting') else rec['briefest']
                body = clean(body) or subtitle or 'Named in the text; no further description available.'
                if not body.endswith(('.', '!', '?')):
                    body += '.'
                new_entities_log.append((eid, strong, base, total))

            per_ek = make_character(eid, role, subtitle, body, mentions)
            for ek, data in per_ek.items():
                ed = pkg['editions'][ek]
                ed['characters'] = [c for c in ed['characters'] if c['id'] != eid]
                ed['characters'].append(data['character'])
                ed['mentions'].extend(data['mentions'])
            existing_ids.add(eid)

    for ek in EDITIONS:
        pkg['editions'][ek]['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))

    BIBLE_CHARS.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')

    print(f'Rebuilt {len(set(x[0] for x in rebuilt_log))} legacy ids with correct TIPNR-bound mentions:')
    for eid, strong, total in sorted(set(rebuilt_log)):
        print(f'  {eid} <- {strong} ({total} mentions)')
    print(f'\nSplit off {len(new_entities_log)} new entities for wrongly-absorbed people:')
    for eid, strong, base, total in new_entities_log:
        print(f'  {eid} ({base}, {total} mentions)')


if __name__ == '__main__':
    main()
