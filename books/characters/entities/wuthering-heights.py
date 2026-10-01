"""Wuthering Heights cards. Generic build is a baseline; run this module for reviewed gates."""
BOOK_ID = 'wuthering-heights'
CONTENT_VERSION = '2026-10-01.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [{'id': 'lockwood',
  'kind': 'person',
  'storyRole': 'central',
  'displayName': 'Mr. Lockwood',
  'aliases': ['Mr. Lockwood', 'Lockwood'],
  'subtitle': 'The visiting tenant',
  'body': 'He rents Thrushcross Grange and calls on his landlord at Wuthering Heights. His account '
          'begins with his own impressions of the place.'},
 {'id': 'ellen-dean',
  'kind': 'person',
  'storyRole': 'central',
  'displayName': 'Mrs. Dean',
  'aliases': ['Mrs. Dean', 'Ellen Dean', 'Nelly Dean', 'Nelly', 'Ellen', 'Nell'],
  'subtitle': 'The housekeeper at the Grange',
  'body': 'Lockwood turns to the housekeeper for company and information about his neighbours.'},
 {'id': 'heathcliff',
  'kind': 'person',
  'storyRole': 'central',
  'displayName': 'Heathcliff',
  'aliases': ['Mr. Heathcliff', 'Heathcliff'],
  'subtitle': 'Lockwood’s landlord',
  'body': 'He owns the house Lockwood rents. Lockwood admires his reserve on their first meeting, '
          'though Heathcliff offers him little welcome.'},
 {'id': 'catherine-earnshaw',
  'kind': 'person',
  'storyRole': 'central',
  'displayName': 'Catherine Earnshaw',
  'aliases': ['Catherine Earnshaw'],
  'subtitle': 'A name in the old bedroom',
  'body': 'Lockwood finds this name scratched on the ledge of a bed enclosed with wooden panels. '
          'Its repetition draws his attention to the room’s earlier occupant.'},
 {'id': 'catherine-linton-younger',
  'kind': 'person',
  'storyRole': 'central',
  'displayName': 'Mrs. Heathcliff',
  'aliases': [],
  'subtitle': 'The young woman at the Heights',
  'body': 'Lockwood addresses the young woman at the house as Mrs. Heathcliff. He has not yet '
          'understood her place in the household.'},
 {'id': 'hindley-earnshaw',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'Hindley Earnshaw',
  'aliases': ['Hindley Earnshaw', 'Mr. Hindley', 'Hindley'],
  'subtitle': 'The master in Catherine’s diary',
  'body': 'Catherine’s diary names Hindley as the person ruling the household in her father’s '
          'absence. She describes his treatment of Heathcliff as atrocious.'},
 {'id': 'hareton-earnshaw',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'Hareton Earnshaw',
  'aliases': ['Hareton Earnshaw', 'Hareton'],
  'subtitle': 'The young man at the Heights',
  'body': 'He gives Lockwood his name angrily after the visitor has repeatedly guessed his '
          'position in the household incorrectly.'},
 {'id': 'edgar-linton',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'Edgar Linton',
  'aliases': ['Edgar Linton', 'Mr. Edgar', 'Edgar'],
  'subtitle': 'A boy at Thrushcross Grange',
  'body': 'Heathcliff describes seeing Edgar in the Grange’s comfortable drawing room with his '
          'sister. Their quarrel over a little dog attracts the watching children’s contempt.'},
 {'id': 'isabella-linton',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'Isabella Linton',
  'aliases': ['Isabella Linton', 'Isabella', 'Isabel'],
  'subtitle': 'Edgar’s sister',
  'body': 'She is one of the children Heathcliff watches through the drawing-room window at '
          'Thrushcross Grange. His hostile description comes from outside her household.'},
 {'id': 'linton-heathcliff',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'Linton',
  'aliases': ['Linton Heathcliff'],
  'subtitle': 'The child named in Isabella’s letters',
  'body': 'Nelly recounts Isabella’s life away from the neighbourhood and the naming of her '
          'child.'},
 {'id': 'joseph',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Joseph',
  'aliases': ['Joseph'],
  'subtitle': 'A servant at Wuthering Heights',
  'body': 'Heathcliff calls on Joseph to take Lockwood’s horse. Lockwood finds the elderly servant '
          'sour and unwelcoming.'},
 {'id': 'frances-earnshaw',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Frances',
  'aliases': ['Frances'],
  'subtitle': 'A woman in Catherine’s diary',
  'body': 'Catherine’s account places Frances beside the man commanding the children. She joins in '
          'his rough treatment of Heathcliff.'},
 {'id': 'mr-earnshaw-elder',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Mr. Earnshaw',
  'aliases': ['old Earnshaw'],
  'subtitle': 'The elder Earnshaw',
  'body': 'Nelly recalls the older master of Wuthering Heights setting off on foot for Liverpool.'},
 {'id': 'mrs-earnshaw-elder',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Mrs. Earnshaw',
  'aliases': [],
  'subtitle': 'The elder Mrs. Earnshaw',
  'body': 'She waits with the children for Mr. Earnshaw to return from his journey to Liverpool.'},
 {'id': 'mr-linton-elder',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Mr. Linton',
  'aliases': [],
  'subtitle': 'The elder Linton',
  'body': 'He belongs to the older generation at Thrushcross Grange. Heathcliff’s account places '
          'the children in the drawing room while the adults are absent.'},
 {'id': 'mrs-linton-elder',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Mrs. Linton',
  'aliases': [],
  'subtitle': 'The elder Mrs. Linton',
  'body': 'She belongs to the older generation at Thrushcross Grange, where Heathcliff and '
          'Catherine watch the children through a window.'},
 {'id': 'kenneth',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Mr. Kenneth',
  'aliases': ['Mr. Kenneth', 'Kenneth'],
  'subtitle': 'The local doctor',
  'body': 'Kenneth is the medical practitioner consulted by the household. His opinions reach the '
          'reader through Nelly’s account.'},
 {'id': 'zillah',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Zillah',
  'aliases': ['Zillah'],
  'subtitle': 'A servant at the Heights',
  'body': 'She comes to Lockwood’s aid after his encounter with the dogs. She serves at Wuthering '
          'Heights, a different household from Mrs. Dean’s at the Grange.'},
 {'id': 'shielders',
  'kind': 'person',
  'storyRole': 'reference',
  'displayName': 'Mr. Shielders',
  'aliases': ['Shielders'],
  'subtitle': 'The curate',
  'body': 'Mr. Linton names Shielders while criticising the children’s upbringing. He is the '
          'parish curate, distinct from the preacher in Lockwood’s dream.'}]


def bind(edition, ch, pi, text, entities):
    """Conservative names plus paragraph-reviewed contexts; no surname inference."""
    import re
    candidates = []
    for e in entities:
        cid = e['id']
        aliases = list(e['aliases']) + e['contexts'].get(f'{ch}:{pi}', [])
        if cid == 'catherine-linton-younger' and (ch in [2, 3, 4] or ch >= 18):
            aliases += ['Mrs. Heathcliff']
        if cid == 'isabella-linton' and 13 <= ch <= 17:
            aliases += ['Mrs. Heathcliff']
        if cid == 'linton-heathcliff' and ch >= 18:
            aliases += ['Master Heathcliff', 'young Heathcliff', 'Master Linton', 'young Linton']
        for alias in aliases:
            for m in re.finditer(r'(?<![\w])' + re.escape(alias) + r'(?![\w])', text):
                prefix = text[:m.start()]
                if cid == 'hareton-earnshaw' and ch == 1:
                    continue  # 1500 carving, not the living Hareton.
                if cid == 'heathcliff':
                    if re.search(r'(?:Mrs\.?|Miss|Master|young|Linton|Catherine)\s+$', prefix, re.I):
                        continue
                    if (ch, pi) in [(2, 43), (3, 3), (3, 4)]:
                        continue  # Lockwood's false identification; scratched name variants.
                if cid == 'linton-heathcliff':
                    if ch < 17 or re.search(r'Mrs\.?\s+$', prefix):
                        continue
                candidates.append((m.start(), m.end(), cid, 'reviewed-name'))
    return candidates


if __name__ == '__main__':
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from build_reviewed import main
    main(BOOK_ID, 'Wuthering Heights', bind)
