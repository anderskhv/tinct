"""Ask production which character sidecars it actually serves.

Integration status is not something the authoring lane can assert. This asks
the deployed site instead: a package is being served only if
https://tinct.app/data/characters/<id>.v1.json returns 200 with matching JSON book identity. Asset availability is not runtime registration. Writes
serving-check.json next to this file and prints a short summary.

    python3 books/characters/serving_check.py
"""
import json, pathlib, subprocess, datetime, sys

ROOT = pathlib.Path(__file__).parent
HOST = sys.argv[1] if len(sys.argv) > 1 else 'https://tinct.app'

def probe(url, book):
    r = subprocess.run(['curl', '-s', '-w', '\n%{http_code}',
                        '--max-time', '30', url], capture_output=True, text=True)
    body, _, code = r.stdout.rpartition('\n')
    try:
        asset = json.loads(body)
        valid = asset.get('bookId') == book and asset.get('schemaVersion') == 1 and isinstance(asset.get('editions'), dict)
    except (ValueError, AttributeError):
        valid = False
    return code.strip(), valid

rows = []
for status_path in sorted(ROOT.glob('*/status.json')):
    book = status_path.parent.name
    status = json.loads(status_path.read_text())
    revision = status.get('releaseEvidence', {}).get('revision', '2026-09-09.2' if book in ('bible', 'the-awakening') else '2026-09-10.1')
    url = f'{HOST}/data/characters/{book}.v1.json?v={revision}'
    code, valid = probe(url, book)
    rows.append({'book': book, 'appStatus': status.get('appStatus', 'not-integrated'),
                 'url': url, 'httpStatus': code, 'validAsset': valid, 'served': code == '200' and valid})

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
