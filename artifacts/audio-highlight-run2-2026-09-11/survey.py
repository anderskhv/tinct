"""Survey production for exactly the chapters run 2 might touch.

The full census (audit_production.py) walks every English edition chapter by
chapter and took ~30 minutes for 200 editions; run 2 only needs the candidate
set, so this asks production directly about those chapters in parallel:
per chapter, the recording manifest (paragraph count, duration) and whether a
words.json sidecar is already published.

Read-only, credential-free. Output: survey.json.
"""
from __future__ import annotations

import concurrent.futures
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools/audio-highlight"))
import prodapi  # noqa: E402

OUT = Path(__file__).resolve().parent / "survey.json"

SKIP_BOOKS = {"magna-carta", "faust-part-1", "as-you-like-it", "henry-iv-part-2",
              "taming-of-the-shrew"}


def candidates() -> list[dict]:
    seen, rows = set(), []
    run2 = json.loads((ROOT / "artifacts/audio-highlight-run1-2026-09-11/run2-queue.json").read_text())
    for entry in run2["chapters"]:
        key = (entry["bookId"], entry["edition"], entry["chapter"])
        seen.add(key)
        rows.append({"bookId": entry["bookId"], "edition": entry["edition"], "chapter": entry["chapter"],
                     "source": "run2-queue", "blocker": entry["blocker"]})
    p1 = json.loads((ROOT / "artifacts/audio-highlight-queue-2026-09-11/p1-processing-queue.json").read_text())
    for entry in p1:
        key = (entry["bookId"], entry["edition"], entry["chapter"])
        if key in seen:
            continue
        seen.add(key)
        rows.append({**entry, "source": "p1-processing-queue", "blocker": None})
    return [r for r in rows
            if r["bookId"] not in SKIP_BOOKS
            and not r["bookId"].startswith("bible")
            and r["edition"].endswith("-en")]


def probe(row: dict) -> dict:
    book, edition, chapter = row["bookId"], row["edition"], row["chapter"]
    status, manifest = prodapi.chapter_manifest(book, edition, chapter)
    out = {**row, "manifest": status}
    if status == 200 and manifest:
        entries = manifest.get("paragraphs") or []
        spoken = [e for e in entries if isinstance(e.get("paragraph"), int) and e["paragraph"] >= 0]
        out["paragraphs"] = len(entries)
        out["spokenParagraphs"] = len(spoken)
        out["durationSeconds"] = round(sum(e.get("duration") or 0 for e in entries), 2)
    words_status, words_bytes = prodapi.audio_object_size(f"{book}/{edition}/ch{chapter}/words.json")
    out["words"] = words_status
    out["wordsBytes"] = words_bytes
    return out


def main() -> int:
    rows = candidates()
    print(f"probing {len(rows)} candidate chapters", file=sys.stderr, flush=True)
    results, done = [], 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
        for result in pool.map(probe, rows):
            results.append(result)
            done += 1
            if done % 100 == 0:
                print(f"  {done}/{len(rows)}", file=sys.stderr, flush=True)
    results.sort(key=lambda r: (r["bookId"], r["edition"], r["chapter"]))
    OUT.write_text(json.dumps(results, indent=1))
    published = sum(1 for r in results if r["words"] in (200, 206))
    print(f"{len(results)} chapters: {published} already have words.json, "
          f"{sum(1 for r in results if r['manifest'] != 200)} have no recording manifest")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
