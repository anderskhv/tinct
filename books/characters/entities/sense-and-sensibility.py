"""Offline baseline; ambiguous names are bound only in the reviewed build."""
BOOK_ID = "sense-and-sensibility"
LANGUAGE = "en"
CONTENT_VERSION = "2026-10-01.1"
EDITIONS = ["original-en", "modern-en"]

ENTITIES = [{'id': 'elinor-dashwood',
  'kind': 'person',
  'storyRole': 'central',
  'aliases': ['Elinor', 'Elinor Dashwood'],
  'displayName': 'Elinor',
  'subtitle': 'Dashwood sister',
  'body': 'The eldest of Mrs. Dashwood’s three daughters.'},
 {'id': 'marianne-dashwood',
  'kind': 'person',
  'storyRole': 'central',
  'aliases': ['Marianne', 'Miss Marianne', 'Marianne Dashwood'],
  'displayName': 'Marianne',
  'subtitle': 'Dashwood sister',
  'body': 'One of Mrs. Dashwood’s daughters, with strong feelings and a love of music.'},
 {'id': 'margaret-dashwood',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Margaret', 'Miss Margaret', 'Margaret Dashwood'],
  'displayName': 'Margaret',
  'subtitle': 'Dashwood sister',
  'body': 'The youngest of Mrs. Dashwood’s three daughters.'},
 {'id': 'mrs-henry-dashwood',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Mrs. Henry Dashwood'],
  'displayName': 'Mrs. Dashwood',
  'subtitle': 'The Dashwood family',
  'body': 'Henry Dashwood’s wife, mother of his three daughters.'},
 {'id': 'henry-dashwood',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Mr. Henry Dashwood', 'Henry Dashwood'],
  'displayName': 'Henry Dashwood',
  'subtitle': 'The Dashwood family',
  'body': 'The nephew invited to live with his family at Norland.'},
 {'id': 'john-dashwood',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Mr. John Dashwood', 'John Dashwood'],
  'displayName': 'John Dashwood',
  'subtitle': 'The Dashwood family',
  'body': 'Henry Dashwood’s son by his first marriage.'},
 {'id': 'fanny-dashwood',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Mrs. John Dashwood', 'Fanny'],
  'displayName': 'Mrs. John Dashwood',
  'subtitle': 'The Dashwood family',
  'body': 'John Dashwood’s wife.'},
 {'id': 'harry-dashwood',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Harry', 'little Harry'],
  'displayName': 'Harry',
  'subtitle': 'The Dashwood family',
  'body': 'John and Mrs. John Dashwood’s young son.'},
 {'id': 'edward-ferrars',
  'kind': 'person',
  'storyRole': 'major',
  'aliases': ['Edward', 'Mr. Edward Ferrars', 'Edward Ferrars'],
  'displayName': 'Edward Ferrars',
  'subtitle': 'The Ferrars family',
  'body': 'The elder brother of Mrs. John Dashwood.'},
 {'id': 'robert-ferrars',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Robert', 'Mr. Robert Ferrars', 'Robert Ferrars'],
  'displayName': 'Robert Ferrars',
  'subtitle': 'The Ferrars family',
  'body': 'Edward Ferrars’s younger brother.'},
 {'id': 'mrs-ferrars',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': [],
  'displayName': 'Mrs. Ferrars',
  'subtitle': 'The Ferrars family',
  'body': 'The mother of Edward and his younger brother.'},
 {'id': 'sir-john-middleton',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Sir John', 'Sir John Middleton'],
  'displayName': 'Sir John Middleton',
  'subtitle': 'Barton Park',
  'body': 'Mrs. Dashwood’s relative, who offers her a cottage in Devonshire.'},
 {'id': 'lady-middleton',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Lady Middleton'],
  'displayName': 'Lady Middleton',
  'subtitle': 'Barton Park',
  'body': 'A woman at Barton Park whom Mrs. Dashwood has not yet met.'},
 {'id': 'mrs-jennings',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Mrs. Jennings'],
  'displayName': 'Mrs. Jennings',
  'subtitle': 'Barton circle',
  'body': 'Lady Middleton’s mother.'},
 {'id': 'colonel-brandon',
  'kind': 'person',
  'storyRole': 'major',
  'aliases': ['Brandon', 'Colonel Brandon'],
  'displayName': 'Colonel Brandon',
  'subtitle': 'Barton circle',
  'body': 'A friend of Sir John Middleton.'},
 {'id': 'john-willoughby',
  'kind': 'person',
  'storyRole': 'major',
  'aliases': ['Willoughby', 'Mr. Willoughby'],
  'displayName': 'Willoughby',
  'subtitle': 'A visitor at Allenham',
  'body': 'The young man who carries Marianne home after her fall.'},
 {'id': 'charlotte-palmer',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Mrs. Palmer', 'Charlotte'],
  'displayName': 'Mrs. Palmer',
  'subtitle': 'Barton circle',
  'body': 'A visitor to the Dashwoods’ cottage.'},
 {'id': 'mr-palmer',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Mr. Palmer'],
  'displayName': 'Mr. Palmer',
  'subtitle': 'Barton circle',
  'body': 'Mrs. Palmer’s husband.'},
 {'id': 'lucy-steele',
  'kind': 'person',
  'storyRole': 'major',
  'aliases': ['Lucy', 'Miss Lucy', 'Lucy Steele', 'Miss Lucy Steele'],
  'displayName': 'Lucy',
  'subtitle': 'The Steele sisters',
  'body': 'One of the two sisters visiting the Middletons.'},
 {'id': 'anne-steele',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Nancy', 'Anne Steele', 'Anne'],
  'displayName': 'Miss Steele',
  'subtitle': 'The Steele sisters',
  'body': 'The elder of the two Steele sisters.'},
 {'id': 'mrs-smith',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Mrs. Smith'],
  'displayName': 'Mrs. Smith',
  'subtitle': 'Allenham',
  'body': 'The woman living at Allenham, where Marianne has been visiting.'},
 {'id': 'eliza-elder',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': [],
  'displayName': 'Eliza',
  'subtitle': 'Brandon’s recollections',
  'body': 'A woman Colonel Brandon recalls loving in his youth.'},
 {'id': 'eliza-younger',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Miss Williams', 'Eliza Williams'],
  'displayName': 'Miss Williams',
  'subtitle': 'Mentioned at Barton',
  'body': 'A woman Mrs. Jennings mentions in connection with Colonel Brandon.'},
 {'id': 'miss-grey',
  'kind': 'person',
  'storyRole': 'supporting',
  'aliases': ['Miss Grey'],
  'displayName': 'Miss Grey',
  'subtitle': 'Mentioned in London',
  'body': 'A woman Mrs. Jennings discusses in connection with Willoughby.'}]


def bind(edition, chapter, paragraph, text, entities):
    """Reviewed title disambiguation at aligned source paragraph coordinates."""
    import re
    candidates = []

    def add(alias, identity):
        for match in re.finditer(r'(?<!\w)' + re.escape(alias) + r'(?!\w)', text):
            candidates.append((match.start(), match.end(), identity, 'reviewed-name'))

    for entity in entities:
        for alias in entity['aliases']:
            add(alias, entity['id'])
    add('Miss Dashwood', 'marianne-dashwood' if (chapter, paragraph) == (9, 9) else 'elinor-dashwood')
    # London references here concern John's wife, not Henry's widow.
    fanny = {(34, 1), (34, 3), (35, 8), (35, 14), (36, 25), (36, 27), (37, 4), (37, 6), (41, 3)}
    add('Mrs. Dashwood', 'fanny-dashwood' if (chapter, paragraph) in fanny else 'mrs-henry-dashwood')
    # Chapter 48 deliberately sustains a misunderstanding: omit the title there.
    if chapter != 48:
        add('Mrs. Ferrars', 'lucy-steele' if chapter == 47 else 'mrs-ferrars')
    add('Miss Steele', 'lucy-steele' if chapter == 47 else 'anne-steele')
    if chapter == 31:
        add('Eliza', 'eliza-elder' if paragraph == 23 else 'eliza-younger')
        add('Mrs. Brandon', 'eliza-elder')
    elif chapter == 46:
        add('Eliza', 'eliza-elder')
    elif chapter in (44, 47):
        add('Eliza', 'eliza-younger')
    elif chapter == 50:
        add('Mrs. Brandon', 'marianne-dashwood')
    return candidates


if __name__ == '__main__':
    import json
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from build_reviewed import compile_package
    asset, report, _ = compile_package(BOOK_ID, bind)
    directory = Path(__file__).resolve().parents[1] / BOOK_ID
    (directory / 'characters.v1.json').write_text(json.dumps(asset, ensure_ascii=False, indent=2) + '\n')
    (directory / 'validation-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, indent=2))
