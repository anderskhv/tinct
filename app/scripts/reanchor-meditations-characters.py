#!/usr/bin/env python3
"""Re-anchor the Meditations character package onto the re-based text.

The 2026-09-12 re-basing replaced the served Meditations from Meric Casaubon
1634 (412 paragraphs) with George Long 1862 (487), and rebuilt `modern-en`
against it. The character package is bound to the OLD bytes — source hash,
per-paragraph hashes, and every mention offset — so `verifyCharacters` fails
closed and the reader shows no cards at all.

The figures and their descriptions are unchanged and are carried over verbatim;
this script recomputes only what the new text decides: the source hash, the
paragraph hashes, the paragraph count, the mention offsets, and the spellings.

TWO SPELLINGS CHANGED, both because Long writes the name differently:

  * `alexander-grammarian` — "Alexander the Grammarian" -> "Alexander the
    grammarian". Long lowercases the epithet, and the modern edition follows
    him. The old capitalised spelling appears nowhere in the new text.
  * `claudius-maximus` — "Claudius Maximus" -> "Maximus". Long never gives the
    nomen; the figure is simply "Maximus" throughout.

ANCHORING IS PER-INSTANCE, NOT PER-NAME. Several of these names denote more
than one person in the work, and a card attached to the wrong one is worse than
no card, so an occurrence is anchored only where the referent is certain and
the doubtful ones are listed and skipped below. The rule is to under-anchor:
a missing card costs a reader a tap, a wrong card tells them something false.
"""
import hashlib
import json
import re
import sys

EDITIONS = ('original-en', 'modern-en')
REVISION = '2026-09-12.2'

# Spelling to search for, per figure and per edition where they differ.
SPELLINGS = {
    'verus': 'Verus',
    'diognetus': 'Diognetus',
    'rusticus': 'Rusticus',
    'apollonius': 'Apollonius',
    'sextus': 'Sextus',
    'alexander-grammarian': 'Alexander the grammarian',
    'fronto': 'Fronto',
    'alexander-platonist': {'original-en': 'Alexander the Platonic', 'modern-en': 'Alexander the Platonist'},
    'catulus': 'Catulus',
    'severus': 'Severus',
    'claudius-maximus': 'Maximus',
    'antoninus': 'Antoninus',
    'epictetus': 'Epictetus',
    'chrysippus': 'Chrysippus',
    'theophrastus': 'Theophrastus',
    'plato': 'Plato',
    'socrates': 'Socrates',
    'the-ruling-part': 'ruling part',
}

# (chapterNumber, paragraphIndex) pairs where the name occurs but denotes
# someone other than the figure on the card. Each is a reading of the passage,
# not a heuristic.
EXCLUDED = {
    # VIII.25 "Lucilla saw Verus die" and VIII.37 "the tomb of Verus" are Lucius
    # Verus the co-emperor — Lucilla's husband — not Marcus's grandfather, who
    # is the figure the card describes and who appears only at I.1.
    'verus': {(8, 24), (8, 36)},
    # VI.26 "how the name Antoninus is written" and VI.44 "so far as I am
    # Antoninus" are Marcus speaking of HIMSELF. The other five are Antoninus
    # Pius, his adoptive father, who is the figure on the card.
    'antoninus': {(6, 25), (6, 43)},
    # X.31 "think of Crito or Severus" is a different Severus in a list of
    # historical parallels; the card is Marcus's brother, at I.14.
    'severus': {(10, 30)},
    # VIII.25 "Secunda saw Maximus die" belongs to the same catalogue of the
    # dead as the Verus above and is not the teacher of I.15-I.17.
    'claudius-maximus': {(8, 24)},
}


def normalize(text):
    """`normalizeParagraph` in characterCards.ts, exactly."""
    return re.sub(r' {2,}', ' ', text.replace('\n', ' '))


def sha256_hex(data):
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha256(data).hexdigest()


def spelling_for(character_id, edition_key):
    value = SPELLINGS[character_id]
    return value[edition_key] if isinstance(value, dict) else value


def anchor(asset_path, editions_dir):
    asset = json.load(open(asset_path))
    report = []
    for edition_key in EDITIONS:
        source_path = f'{editions_dir}/meditations-{edition_key}.json'
        raw = open(source_path, 'rb').read()
        source = json.loads(raw)
        block = asset['editions'][edition_key]

        paragraphs = {}
        hashes = {}
        for chapter in source['chapters']:
            texts = [normalize(p) for p in chapter['paragraphs']]
            paragraphs[chapter['number']] = texts
            hashes[str(chapter['number'])] = [sha256_hex(t) for t in texts]

        mentions = []
        first = {}
        for character in block['characters']:
            cid = character['id']
            needle = spelling_for(cid, edition_key)
            excluded = EXCLUDED.get(cid, set())
            found = 0
            for number in sorted(paragraphs):
                for index, text in enumerate(paragraphs[number]):
                    if (number, index) in excluded:
                        continue
                    for match in re.finditer(r'(?<![\w])' + re.escape(needle) + r'(?![\w])', text):
                        start, end = match.start(), match.end()
                        assert text[start:end] == needle
                        mentions.append({
                            'characterId': cid,
                            'chapterNumber': number,
                            'paragraphIndex': index,
                            'startOffset': start,
                            'endOffset': end,
                            'text': needle,
                        })
                        found += 1
                        if cid not in first:
                            first[cid] = {'chapterNumber': number, 'paragraphIndex': index, 'offset': start}
            if not found:
                sys.exit(f'FATAL: {edition_key}: no anchor for {cid} ("{needle}")')
            report.append((edition_key, cid, needle, found))

        for character in block['characters']:
            point = first[character['id']]
            character['firstMention'] = dict(point)
            character['roleVisibleAt'] = dict(point)
            for snapshot in character['snapshots']:
                snapshot['availableAt'] = dict(point)

        mentions.sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
        block['sourcePath'] = f'public/data/editions/meditations-{edition_key}.json'
        block['sourceSha256'] = sha256_hex(raw)
        block['chapterCount'] = len(source['chapters'])
        block['paragraphCount'] = sum(len(c['paragraphs']) for c in source['chapters'])
        block['paragraphHashes'] = hashes
        block['mentions'] = mentions

    asset['contentVersion'] = REVISION
    with open(asset_path, 'w') as handle:
        json.dump(asset, handle, indent=1, ensure_ascii=False)
        handle.write('\n')
    for row in report:
        print('  %-12s %-22s %-26s %d' % row)
    return asset


if __name__ == '__main__':
    result = anchor('public/data/characters/meditations.v1.json', 'public/data/editions')
    for key in EDITIONS:
        block = result['editions'][key]
        print(f'{key}: {block["paragraphCount"]} paragraphs, '
              f'{len(block["characters"])} figures, {len(block["mentions"])} mentions, '
              f'sha256 {block["sourceSha256"]}')
