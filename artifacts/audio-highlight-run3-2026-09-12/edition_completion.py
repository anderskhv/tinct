"""Which editions are now complete on production, and which run 3 completed.

Re-probes production for every chapter of every edition run 3 touched, so the
answer is production truth rather than a journal count. An edition is complete
when every chapter that has a recording also has a word sidecar.
"""
import concurrent.futures, json, sys
from collections import defaultdict
from pathlib import Path
ROOT = Path('/home/user/tinct')
sys.path.insert(0, str(ROOT / 'tools/audio-highlight'))
import prodapi
A = ROOT / 'artifacts/audio-highlight-run3-2026-09-12'
RUN2 = ROOT / 'artifacts/audio-highlight-run2-2026-09-11'

survey = json.loads((RUN2 / 'survey.json').read_text())
rows = [r for r in survey if r.get('manifest') == 200 and (r.get('spokenParagraphs') or 0) > 0]

def probe(r):
    status, _ = prodapi.audio_object_size(f"{r['bookId']}/{r['edition']}/ch{r['chapter']}/words.json")
    return {**r, 'wordsStatus': status}

now = []
with concurrent.futures.ThreadPoolExecutor(max_workers=24) as pool:
    now = list(pool.map(probe, rows))
(A / 'edition-completion-probe.json').write_text(json.dumps(now, indent=1))

before = {(r['bookId'], r['edition'], r['chapter']): r['wordsStatus']
          for r in json.loads((A / 'quick-survey.json').read_text())}
have = lambda s: s in (200, 206)
by = defaultdict(lambda: {'total': 0, 'before': 0, 'after': 0})
for r in now:
    k = f"{r['bookId']}/{r['edition']}"
    by[k]['total'] += 1
    by[k]['before'] += have(before.get((r['bookId'], r['edition'], r['chapter']), 404))
    by[k]['after'] += have(r['wordsStatus'])
completed = sorted(k for k, v in by.items() if v['after'] == v['total'] and v['before'] < v['total'])
already = sorted(k for k, v in by.items() if v['after'] == v['total'] and v['before'] == v['total'])
gained = sum(v['after'] - v['before'] for v in by.values())
out = {'chaptersGained': gained, 'editionsCompletedThisRun': completed,
       'editionsAlreadyComplete': already,
       'editions': {k: v for k, v in sorted(by.items())}}
(A / 'edition-completion.json').write_text(json.dumps(out, indent=1))
print(f"chapters gained: {gained}")
print(f"editions completed this run: {len(completed)}")
for k in completed: print('  ', k)
