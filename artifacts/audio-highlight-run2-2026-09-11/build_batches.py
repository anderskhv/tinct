"""Build run-2 pod batches from the run-1 run-2 queue, sized by paragraph count.

Run 1's lesson: per-paragraph overhead dominates, so a batch is cut by the
number of paragraph diagnostics it carries, not by audio hours. A prose batch
of ~1,170 paragraphs finished inside the 2,100 s worker cap; a drama batch of
3,317 did not. Target is set below the prose figure to leave headroom.

Usage: build_batches.py <targets.json> <prefix> [--budget N]
  targets.json: list of {bookId, edition, chapter} (paragraph counts fetched)
"""
from __future__ import annotations

import concurrent.futures
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "tools/audio-highlight"))
import prodapi  # noqa: E402

PARAGRAPH_BUDGET = 1000
# Run 1 measured 17x realtime for the two arms, so ~9 audio hours is the most a
# pod clears inside the 44-minute launcher deadline. Cut at 6.5 to leave room for
# setup, the cohort download and a slow host.
AUDIO_HOUR_BUDGET = 6.5


def measure(target: dict) -> dict:
    status, manifest = prodapi.chapter_manifest(target["bookId"], target["edition"], target["chapter"])
    entries = (manifest or {}).get("paragraphs") or []
    spoken = [e for e in entries if isinstance(e.get("paragraph"), int) and e["paragraph"] >= 0]
    return {**target, "manifest": status, "paragraphs": len(spoken),
            "durationSeconds": round(sum(e.get("duration") or 0 for e in entries), 2)}


def main() -> int:
    targets = json.loads(Path(sys.argv[1]).read_text())
    prefix = sys.argv[2]
    budget = int(sys.argv[sys.argv.index("--budget") + 1]) if "--budget" in sys.argv else PARAGRAPH_BUDGET

    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        measured = list(pool.map(measure, targets))
    bad = [m for m in measured if m["manifest"] != 200 or not m["paragraphs"]]
    for entry in bad:
        print(f"  no recording manifest, dropped: {entry['bookId']}/{entry['edition']} ch{entry['chapter']}")
    measured = [m for m in measured if m["manifest"] == 200 and m["paragraphs"]]

    # Keep an edition's chapters together so a pod's failure costs one edition,
    # and run the smallest editions first — they are the ones that can complete.
    by_edition: dict[tuple, list] = {}
    for entry in measured:
        by_edition.setdefault((entry["bookId"], entry["edition"]), []).append(entry)
    order = sorted(by_edition, key=lambda k: (len(by_edition[k]), sum(e["paragraphs"] for e in by_edition[k])))

    batches: list[list[dict]] = []
    current: list[dict] = []
    load = seconds = 0
    for key in order:
        for entry in sorted(by_edition[key], key=lambda e: e["chapter"]):
            over = (load + entry["paragraphs"] > budget
                    or seconds + entry["durationSeconds"] > AUDIO_HOUR_BUDGET * 3600)
            if current and over:
                batches.append(current)
                current, load, seconds = [], 0, 0
            current.append(entry)
            load += entry["paragraphs"]
            seconds += entry["durationSeconds"]
    if current:
        batches.append(current)

    manifest = []
    for index, batch in enumerate(batches, 1):
        path = HERE / f"{prefix}-{index}.json"
        path.write_text(json.dumps([{k: b[k] for k in ("bookId", "edition", "chapter")} for b in batch], indent=1))
        rows = {"batch": index, "file": path.name, "chapters": len(batch),
                "paragraphs": sum(b["paragraphs"] for b in batch),
                "audioHours": round(sum(b["durationSeconds"] for b in batch) / 3600, 2)}
        manifest.append(rows)
        print(rows)
    (HERE / f"{prefix}-manifest.json").write_text(json.dumps(
        {"batches": manifest, "dropped": bad, "paragraphBudget": budget,
         "measured": measured}, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
