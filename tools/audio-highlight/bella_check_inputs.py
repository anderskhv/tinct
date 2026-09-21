import hashlib,json,sys
from pathlib import Path
sys.path.insert(0,"tools/audio-highlight")
import prodapi
root=Path("artifacts/bella-sync-pilot-2026-09-21")
co=json.loads(Path("/tmp/bella-cohort/cohort.json").read_text())
old={e["key"]:e for e in json.loads((root/"cohort.json").read_text())}
for e in co:
    assert e["key"] in old
    assert [(p["index"],p["text"],p["sha256"]) for p in e["paragraphs"]]==[(p["index"],p["text"],p["sha256"]) for p in old[e["key"]]["paragraphs"]]
print("Live source text and every audio hash match the original pilot inputs")
