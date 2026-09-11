"""Ask production which character sidecars it actually serves.

Integration status is not something the authoring lane can assert. This asks
the deployed site instead: a package is being served only if
https://tinct.app/data/characters/<id>.v1.json returns 200. Writes
serving-check.json next to this file and prints a short summary.

    python3 books/characters/serving_check.py
"""
import json, pathlib, subprocess, datetime, sys

ROOT = pathlib.Path(__file__).parent
HOST = sys.argv[1] if len(sys.argv) > 1 else 'https://tinct.app'

def probe(url):
    r = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}',
                        '--max-time', '30', url], capture_output=True, text=True)
    return r.stdout.strip()

rows = []
for status_path in sorted(ROOT.glob('*/status.json')):
    book = status_path.parent.name
    status = json.loads(status_path.read_text())
    code = probe(f'{HOST}/data/characters/{book}.v1.json')
    rows.append({'book': book, 'appStatus': status.get('appStatus', 'not-integrated'),
                 'httpStatus': code, 'served': code == '200'})

served = [r['book'] for r in rows if r['served']]
mismatch = [r for r in rows if r['served'] != (r['appStatus'] in ('live', 'production-verified',
                                                                 'production-verified-partial'))]
report = {'checkedAt': datetime.date.today().isoformat(), 'host': HOST,
          'packages': len(rows), 'servedCount': len(served), 'served': served,
          'statusMismatches': mismatch, 'results': rows}
(ROOT / 'serving-check.json').write_text(json.dumps(report, indent=2) + '\n')

print(f'{len(served)}/{len(rows)} packages served by {HOST}: {", ".join(served)}')
for row in mismatch:
    print(f"  mismatch: {row['book']} status={row['appStatus']} http={row['httpStatus']}")
