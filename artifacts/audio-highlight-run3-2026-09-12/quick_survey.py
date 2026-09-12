"""Ask production, for run 2's whole candidate set, which chapters still lack a
word sidecar. Faster than the full census because it probes only those chapters;
the census (missing-timings.json) is the authority and is merged in when ready.
"""
import concurrent.futures, json, sys
from pathlib import Path
ROOT = Path('/home/user/tinct')
sys.path.insert(0, str(ROOT / 'tools/audio-highlight'))
import prodapi
A = ROOT / 'artifacts/audio-highlight-run3-2026-09-12'
RUN2 = ROOT / 'artifacts/audio-highlight-run2-2026-09-11'

survey = json.loads((RUN2 / 'survey.json').read_text())
rows = [r for r in survey if r.get('manifest') == 200 and (r.get('spokenParagraphs') or 0) > 0]
print(len(rows), 'candidates measured by run 2', file=sys.stderr)

def probe(r):
    status, _ = prodapi.audio_object_size(f"{r['bookId']}/{r['edition']}/ch{r['chapter']}/words.json")
    return {**r, 'wordsStatus': status}

out = []
with concurrent.futures.ThreadPoolExecutor(max_workers=24) as pool:
    for n, res in enumerate(pool.map(probe, rows)):
        out.append(res)
        if n % 200 == 0: print(' ', n, file=sys.stderr, flush=True)
(A / 'quick-survey.json').write_text(json.dumps(out, indent=1))
missing = [r for r in out if r['wordsStatus'] != 200]
print(f"{len(missing)} of {len(out)} still have no sidecar")
