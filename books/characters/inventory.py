"""Record published-library character work from the current BOOKS registry."""
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
    pilot = book.book_id == 'the-awakening'
    rows.append({'bookId':book.book_id, 'title':book.title,
                 'contentStatus':'source-reviewed-pilot' if pilot else 'not-started',
                 'appStatus':'not-integrated',
                 'reviewedEditions':['original-en','modern-en'] if pilot else [],
                 'nextAction':'Integrate and review pilot in reader' if pilot else 'Review actual text, classify entity types, author and validate position-gated cards'})
report = {'observedOn':'2026-09-09', 'source':'app/src/data/bookRegistry.ts BOOKS',
          'registrySha256':hashlib.sha256(REGISTRY.read_bytes()).hexdigest(),
          'publishedCount':len(public), 'books':rows,
          'excludedStaged':[b.book_id for b in staged]}
(base/'library-inventory.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
lines = ['# Character content: library coverage', '', 'Snapshot: 2026-09-09. Regenerate with `python3 books/characters/inventory.py`.', '',
         'Only published BOOKS entries are included. Existing Threads content is not evidence of spoiler-safe character readiness.', '',
         '| Book | Content | Next action |', '| --- | --- | --- |']
for r in rows:
    lines.append(f"| {r['title']} (`{r['bookId']}`) | {r['contentStatus']} | {r['nextAction']} |")
(base/'library-coverage.md').write_text('\n'.join(lines)+'\n')
print(f'{len(public)} published books; one authored pilot; {len(public)-1} pending.')
