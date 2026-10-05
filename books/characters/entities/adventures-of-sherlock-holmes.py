"""Sherlock Holmes recognition copy and reviewed bindings; no network or model calls.

All copy, aliases and binding scopes live in ../adventures-of-sherlock-holmes/editorial.json.
Each entity carries:
  chapters    stories (chapter numbers) where its plain aliases may bind;
  aliases     exact, case-sensitive strings bound anywhere in those chapters;
  aliasRules  extra strings bound only in listed paragraphs or a paragraph window
              ({chapter, alias, paragraphs | from/to, editions});
  exclude     paragraphs where an alias of this entity denotes someone else
              ({chapter, paragraph, alias?, editions}).
Paragraph indices are zero-based, chapters one-based. Rebuild the final package with
build_reviewed.compile_package(BOOK_ID, bind); generic compilation is only a baseline.
"""
import json
import re
from pathlib import Path

BOOK_ID = 'adventures-of-sherlock-holmes'
EDITIONS = ['original-en', 'modern-en']
_EDITORIAL = json.loads((Path(__file__).resolve().parents[1] / BOOK_ID / 'editorial.json').read_text())
CONTENT_VERSION = _EDITORIAL['contentVersion']
ENTITIES = [dict(id=e['id'], kind=e['kind'], storyRole=e['category'], displayName=e['name'],
                 aliases=e['aliases'], subtitle=e['subtitle'], body=e['body'])
            for e in _EDITORIAL['entities']]


def _applies(rule, edition, chapter, paragraph_index):
    if rule.get('chapter') != chapter or edition not in rule.get('editions', EDITIONS):
        return False
    if rule.get('paragraphs') is not None:
        return paragraph_index in rule['paragraphs']
    if rule.get('paragraph') is not None:
        return paragraph_index == rule['paragraph']
    return rule.get('from', 0) <= paragraph_index <= rule.get('to', 10 ** 6)


def bind(edition, chapter, paragraph_index, text, entities):
    candidates = []

    def add(alias, identity, how):
        for match in re.finditer(r'(?<!\w)' + re.escape(alias) + r'(?!\w)', text):
            candidates.append((match.start(), match.end(), identity, how))

    for entity in entities:
        excluded = [r for r in entity.get('exclude', []) if _applies(r, edition, chapter, paragraph_index)]
        if any('alias' not in r for r in excluded):
            continue
        skip = {r['alias'] for r in excluded}
        if chapter in entity['chapters']:
            for alias in entity['aliases']:
                if alias not in skip:
                    add(alias, entity['id'], 'reviewed-name')
        for rule in entity.get('aliasRules', []):
            if _applies(rule, edition, chapter, paragraph_index) and rule['alias'] not in skip:
                add(rule['alias'], entity['id'], 'reviewed-context')
    return candidates


if __name__ == '__main__':
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from build_reviewed import main
    main(BOOK_ID, 'The Adventures of Sherlock Holmes', bind)
