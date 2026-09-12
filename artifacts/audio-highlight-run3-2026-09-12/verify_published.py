"""Re-fetch every published sidecar from production and compare SHA-256.

The publisher already verifies the served bytes at upload time; this is the
independent close-out check the brief asks for, run against tinct.app through
the same /api/audio-file path the reader uses.
"""
import hashlib, json, sys
sys.path.insert(0, "/home/user/tinct/tools/audio-highlight")
from prodapi import audio_object

journal = json.load(open("/home/user/tinct/artifacts/audio-highlight-run3-2026-09-12/publication-journal.json"))
ok = bad = 0
for entry in journal:
    if entry["outcome"] != "published":
        continue
    status, body = audio_object(entry["key"])
    served = hashlib.sha256(body).hexdigest() if body else None
    if status == 200 and served == entry["sha256"]:
        ok += 1
    else:
        bad += 1
        print(f"MISMATCH {entry['key']} http={status}")
print(f"{ok} verified, {bad} mismatched")
sys.exit(1 if bad else 0)
