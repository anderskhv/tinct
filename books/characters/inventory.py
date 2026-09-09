"""Record published-library character work from the current BOOKS registry."""
from datetime import date
import hashlib
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from wip_inventory import parse_registry, REGISTRY

base = Path(__file__).resolve().parent
public, staged = parse_registry()
rows = []
for book in public:
    folder = base/book.book_id
    status_path = folder/'status.json'
    status = json.loads(status_path.read_text()) if status_path.exists() else {}
    sources = []
    for path in sorted((REGISTRY.parents[2]/'public/data/editions').glob(f'{book.book_id}-*.json')):
        edition_key = path.stem[len(book.book_id)+1:]
        if not edition_key.endswith('-en') and edition_key != 'kjv':
            continue
        raw = path.read_bytes()
        data = json.loads(raw)
        if not isinstance(data.get('chapters'), list):
            continue
        sources.append({'edition': edition_key, 'path': str(path.relative_to(REGISTRY.parents[3])),
                        'sha256': hashlib.sha256(raw).hexdigest(), 'chapters': len(data['chapters']),
                        'paragraphs': sum(len(c['paragraphs']) for c in data['chapters'])})
    threads_path = REGISTRY.parents[2]/f'public/data/editions/{book.book_id}-threads.json'
    threads = json.loads(threads_path.read_text()) if threads_path.exists() else {}
    candidates = len(threads.get('characters', []))
    rows.append({'bookId':book.book_id, 'title':book.title,
                 'contentStatus': status.get('contentStatus', 'not-started'),
                 'appStatus':status.get('appStatus', 'not-integrated'),
                 'reviewedEditions': status.get('reviewedEditions', []),
                 'sources': sources, 'existingThreadCandidates': candidates,
                 'nextAction':status.get('nextAction', 'Review source, author concise identities and categories, bind mentions and spoiler gates')})
report = {'observedOn':date.today().isoformat(), 'source':'app/src/data/bookRegistry.ts BOOKS',
          'registrySha256':hashlib.sha256(REGISTRY.read_bytes()).hexdigest(),
          'publishedCount':len(public), 'books':rows,
          'excludedStaged':[b.book_id for b in staged]}
(base/'library-inventory.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
lines = ['# Character content: library coverage', '', f'Snapshot: {date.today().isoformat()}. Regenerate with `python3 books/characters/inventory.py`.', '',
         'Only published BOOKS entries are included. Existing Threads content is not evidence of spoiler-safe character readiness.', '',
         '| Book | Content | Next action |', '| --- | --- | --- |']
for r in rows:
    lines.append(f"| {r['title']} (`{r['bookId']}`) | {r['contentStatus']} | {r['nextAction']} |")
(base/'library-coverage.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({'published':len(public),'statuses':{state:sum(r['contentStatus']==state for r in rows) for state in sorted({r['contentStatus'] for r in rows})}},indent=2))
