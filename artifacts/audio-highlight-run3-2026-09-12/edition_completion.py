"""Which editions are complete on production, and which ones run 3 completed.

Re-probes production for every English chapter the census found, so the answer
is production truth, not a journal count. An edition is complete when every
chapter that has a recording also has a word sidecar. "Completed this run" means
it was short before run 3 published and is whole now.
"""
import concurrent.futures, json, sys
from collections import defaultdict
from pathlib import Path
ROOT = Path('/home/user/tinct')
sys.path.insert(0, str(ROOT / 'tools/audio-highlight'))
import prodapi
A = ROOT / 'artifacts/audio-highlight-run3-2026-09-12'
SKIP = {'magna-carta', 'faust-part-1', 'as-you-like-it', 'henry-iv-part-2', 'taming-of-the-shrew'}

coverage = json.loads((A / 'coverage.json').read_text())
targets = []
for e in coverage['editions']:
    book, edition = e['bookId'], e['edition']
    if book in SKIP or book.startswith('bible') or not edition.endswith('-en'):
        continue
    for c in e['chapters']:
        if c.get('manifest') == 200 and (c.get('spokenParagraphs') or 0) > 0:
            targets.append((book, edition, c['chapter']))
print(len(targets), 'chapters with a recording', file=sys.stderr)

def probe(t):
    status, _ = prodapi.audio_object_size(f"{t[0]}/{t[1]}/ch{t[2]}/words.json")
    return (*t, status)

with concurrent.futures.ThreadPoolExecutor(max_workers=32) as pool:
    now = list(pool.map(probe, targets))

published_this_run = set()
for r in json.loads((A / 'publication-journal.json').read_text()):
    if r['outcome'] != 'published':
        continue
    book, edition, chapter, _ = r['key'].split('/')
    published_this_run.add((book, edition, int(chapter[2:])))

have = lambda s: s in (200, 206)
by = defaultdict(lambda: {'total': 0, 'timed': 0, 'gainedThisRun': 0})
for book, edition, chapter, status in now:
    e = by[f'{book}/{edition}']
    e['total'] += 1
    e['timed'] += have(status)
    e['gainedThisRun'] += (book, edition, chapter) in published_this_run

complete = {k for k, v in by.items() if v['timed'] == v['total']}
completed_this_run = sorted(k for k in complete if by[k]['gainedThisRun'] > 0)
already = sorted(complete - set(completed_this_run))
out = {'chaptersPublishedThisRun': len(published_this_run),
       'editionsCompleteNow': len(complete),
       'editionsCompletedThisRun': completed_this_run,
       'editionsAlreadyComplete': already,
       'editions': dict(sorted(by.items()))}
(A / 'edition-completion.json').write_text(json.dumps(out, indent=1))
print(f"chapters published this run: {len(published_this_run)}")
print(f"editions complete on production now: {len(complete)}")
print(f"EDITIONS COMPLETED BY RUN 3: {len(completed_this_run)}")
for k in completed_this_run:
    print('  ', k, by[k])
