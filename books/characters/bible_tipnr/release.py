#!/usr/bin/env python3
"""Turn gap_report.json's new_entities into released bible.v1.json entries.

Tiering (mechanical, not hand-reviewed per entity — see ledger for what
that means as a limit):
  - storyRole by total mention count (both editions combined):
      >=100 -> central, >=20 -> major, >=5 -> supporting, else reference.
  - subtitle = TIPNR @Briefest always (short role/relation tag, low spoiler
    risk by construction).
  - body = TIPNR @Briefest for reference-tier (the vast majority — single
    or few-mention figures), TIPNR @Brief for supporting/major/central
    (fuller one-sentence identity, matches how existing central/major
    Bible cards already read).
  - id = 'tipnr-' + dStrong code (e.g. tipnr-h6667h) — stable, unique,
    independent of display name, never collides with a pre-existing
    hand-authored id (those don't use this prefix).

Content is TIPNR (STEPBible.org / Tyndale House Cambridge, CC BY 4.0) text,
reused under that license; the released package's reviewStatus/contentVersion
metadata records this, and docs/character-coverage-bible-ledger notes the
attribution requirement for Codex's publication step.

Validates: no id collisions with existing cards, no span overlap between
any two new entities in the same edition, then merges into
app/public/data/characters/bible.v1.json and writes an updated package.
"""
import json, re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BIBLE_CHARS = ROOT / 'app/public/data/characters/bible.v1.json'


def tier(n):
    if n >= 100:
        return 'central'
    if n >= 20:
        return 'major'
    if n >= 5:
        return 'supporting'
    return 'reference'


def main():
    report = json.loads((HERE / 'gap_report.json').read_text())
    pkg = json.loads(BIBLE_CHARS.read_text())

    existing_ids = set()
    for ek in ('kjv-en', 'web-en'):
        existing_ids |= {c['id'] for c in pkg['editions'][ek]['characters']}

    all_new_spans = {'kjv-en': set(), 'web-en': set()}
    skipped_no_mentions = 0
    id_clashes = []
    span_overlaps = []
    added = {'kjv-en': 0, 'web-en': 0}
    entity_count = 0

    for rec in report['new_entities']:
        eid = 'tipnr-' + rec['strong']
        if eid in existing_ids:
            id_clashes.append(eid)
            continue
        total_mentions = len(rec['mentions']['kjv-en']) + len(rec['mentions']['web-en'])
        if total_mentions == 0:
            skipped_no_mentions += 1
            continue
        role = tier(total_mentions)
        def clean(s):
            return re.sub(r'\s+', ' ', (s or '')).strip()
        body = rec['brief'] if role in ('central', 'major', 'supporting') else rec['briefest']
        body = clean(body) or clean(rec['briefest']) or clean(rec['brief']) or 'Named in the text; no further description available.'
        if not body.endswith(('.', '!', '?')):
            body += '.'
        subtitle = clean(rec['briefest'])

        any_edition_used = False
        per_edition_snapshot = {}
        for ek in ('kjv-en', 'web-en'):
            ms = sorted(rec['mentions'][ek], key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
            if not ms:
                continue
            clean_ms = []
            conflict = False
            for m in ms:
                key = (m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset'])
                if key in all_new_spans[ek]:
                    span_overlaps.append((eid, ek, key))
                    conflict = True
                    continue
                all_new_spans[ek].add(key)
                clean_ms.append(m)
            if not clean_ms:
                continue
            first = clean_ms[0]
            first_point = {'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'offset': first['endOffset']}
            for m in clean_ms:
                m['characterId'] = eid
            per_edition_snapshot[ek] = {
                'mentions': clean_ms,
                'character': {
                    'id': eid, 'kind': 'person', 'storyRole': role,
                    'roleVisibleAt': first_point, 'firstMention': first_point,
                    'snapshots': [{
                        'id': eid + '-1', 'availableAt': first_point, 'name': first['text'],
                        'subtitle': subtitle, 'body': body,
                        'evidence': [{'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'throughOffset': first_point['offset']}],
                        'editorialBasis': 'STEPBible TIPNR identity (CC BY 4.0), mechanically bound to verse-scoped mentions; not individually hand-reviewed for spoiler content beyond automated tiering.',
                    }],
                },
            }
            any_edition_used = True
            added[ek] += 1
        if not any_edition_used:
            continue
        entity_count += 1
        for ek, data in per_edition_snapshot.items():
            pkg['editions'][ek]['characters'].append(data['character'])
            pkg['editions'][ek]['mentions'].extend(data['mentions'])
        existing_ids.add(eid)

    for ek in ('kjv-en', 'web-en'):
        pkg['editions'][ek]['mentions'].sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))

    pkg['contentVersion'] = '2026-09-16-tipnr.1'
    pkg['reviewStatus'] = 'agent-drafted-2026-09-16-tipnr-mechanical-pending-independent-review'
    pkg.setdefault('sourceNotices', []).append(
        'Character identities and descriptions for entries with id prefix "tipnr-" are derived from '
        'STEPBible TIPNR (Translators Individualised Proper Names with all References), '
        '© Tyndale House Cambridge, curated by STEPBible.org, licensed CC BY 4.0. '
        'https://github.com/STEPBible/STEPBible-Data'
    )

    BIBLE_CHARS.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')

    print(f'entities added: {entity_count}')
    print(f'mentions added: kjv-en={added["kjv-en"]} web-en={added["web-en"]}')
    print(f'id clashes skipped: {len(id_clashes)} {id_clashes[:5]}')
    print(f'span overlaps dropped (kept first claimant): {len(span_overlaps)}')
    print(f'entities with zero resolved mentions skipped: {skipped_no_mentions}')


if __name__ == '__main__':
    main()
