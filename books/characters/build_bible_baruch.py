#!/usr/bin/env python3
"""Compile the reviewed, narrowly scoped Baruch identity card; no model calls."""
import hashlib, json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
folder = Path(__file__).resolve().parent
copy = json.loads((folder / 'bible/baruch.json').read_text())
def digest(data): return hashlib.sha256(data).hexdigest()
def normalized(text): return re.sub(' {2,}', ' ', text.replace('\n', ' '))
def utf16(text): return len(text.encode('utf-16-le')) // 2
asset = dict(schemaVersion=1, bookId='bible', language='en', normalization='prose-reader-v1', offsetUnit='utf16', editions={})
for key in ['kjv-en', 'web-en', 'modern-en']:
    raw = (ROOT / f'app/public/data/editions/bible-{key}.json').read_bytes()
    chapters = json.loads(raw)['chapters']
    hashes, mentions = {}, []
    for chapter in chapters:
        texts = list(map(normalized, chapter['paragraphs']))
        hashes[str(chapter['number'])] = [digest(t.encode()) for t in texts]
        if not chapter['title'].startswith('Jeremiah '): continue
        for pi, text in enumerate(texts):
            for match in re.finditer(r'\bBaruch\b', text):
                mentions.append(dict(characterId='baruch-neriah', chapterNumber=chapter['number'], paragraphIndex=pi, startOffset=utf16(text[:match.start()]), endOffset=utf16(text[:match.end()]), text=match.group()))
    first = mentions[0]
    point = dict(chapterNumber=first['chapterNumber'], paragraphIndex=first['paragraphIndex'], offset=first['endOffset'])
    character = dict(id='baruch-neriah', kind='person', storyRole='supporting', firstMention=point, roleVisibleAt=point, snapshots=[dict(availableAt=point, **{k:copy[k] for k in ['name','subtitle','body']})])
    asset['editions'][key] = dict(sourceSha256=digest(raw), paragraphHashes=hashes, characters=[character], mentions=mentions)
    print(key, len(mentions), 'verified source spans')
(ROOT / 'app/public/data/characters/bible.v1.json').write_text(json.dumps(asset, ensure_ascii=False, separators=(',', ':'))+'\n')
