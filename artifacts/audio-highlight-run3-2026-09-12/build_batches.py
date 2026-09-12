"""Cut run-3 pod batches, editions closest to complete first.

Truth for "what is still missing" is this run's own production census
(`missing-timings.json` from audit_production.py); sizing comes from run 2's
survey where it measured the chapter, and from the production manifest
otherwise.

Editions are ordered by how few chapters they still need, so the spend that
fits inside the envelope buys as many *completed editions* as possible.
"""
from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
RUN2 = ROOT / "artifacts/audio-highlight-run2-2026-09-11"
PARAGRAPH_BUDGET = 1000
AUDIO_HOUR_BUDGET = 6.5

SKIP_BOOKS = {"magna-carta", "faust-part-1", "as-you-like-it", "henry-iv-part-2",
              "taming-of-the-shrew"}


def skipped(book: str, edition: str) -> bool:
    return book in SKIP_BOOKS or book.startswith("bible") or not edition.endswith("-en")


def main() -> int:
    missing = json.loads((HERE / "missing-timings.json").read_text())
    survey = {(r["bookId"], r["edition"], r["chapter"]): r
              for r in json.loads((RUN2 / "survey.json").read_text())}
    # Run 1's repair queue and the four missing recordings stay out.
    blocked = set()
    for name in ("p1-repair-queue.json",):
        path = ROOT / "artifacts/audio-highlight-queue-2026-09-11" / name
        if path.exists():
            for row in json.loads(path.read_text()):
                blocked.add((row["bookId"], row["edition"], row["chapter"]))
    # Phaedo's spelled-out-speaker chapters: re-recording, not alignment.
    blocked |= {("phaedo", "original-en", 1), ("phaedo", "original-en", 7)}

    rows, dropped = [], defaultdict(int)
    for row in missing:
        key = (row["bookId"], row["edition"], row["chapter"])
        if skipped(row["bookId"], row["edition"]):
            dropped["skip-list"] += 1
            continue
        if key in blocked:
            dropped["repair/re-record"] += 1
            continue
        if not row.get("manifest") or row.get("manifest") == 404:
            dropped["no recording"] += 1
            continue
        measured = survey.get(key)
        rows.append({
            "bookId": row["bookId"], "edition": row["edition"], "chapter": row["chapter"],
            "spokenParagraphs": (measured or row).get("spokenParagraphs") or row.get("paragraphs") or 40,
            "durationSeconds": (measured or row).get("durationSeconds") or 600.0,
        })

    by_edition = defaultdict(list)
    for row in rows:
        by_edition[(row["bookId"], row["edition"])].append(row)
    order = sorted(by_edition, key=lambda k: (len(by_edition[k]),
                                              sum(r["spokenParagraphs"] for r in by_edition[k])))

    batches, current, load, seconds = [], [], 0, 0.0
    for key in order:
        for row in sorted(by_edition[key], key=lambda r: r["chapter"]):
            over = (load + row["spokenParagraphs"] > PARAGRAPH_BUDGET
                    or seconds + row["durationSeconds"] > AUDIO_HOUR_BUDGET * 3600)
            if current and over:
                batches.append(current)
                current, load, seconds = [], 0, 0.0
            current.append(row)
            load += row["spokenParagraphs"]
            seconds += row["durationSeconds"]
    if current:
        batches.append(current)

    manifest = []
    for index, batch in enumerate(batches, 1):
        path = HERE / f"batch-{index}.json"
        path.write_text(json.dumps([{k: r[k] for k in ("bookId", "edition", "chapter")}
                                    for r in batch], indent=1))
        manifest.append({"batch": index, "file": path.name, "chapters": len(batch),
                         "editions": sorted({r["bookId"] + "/" + r["edition"] for r in batch}),
                         "shortestEditionGap": min(len(by_edition[(r["bookId"], r["edition"])]) for r in batch),
                         "paragraphs": sum(r["spokenParagraphs"] for r in batch),
                         "audioHours": round(sum(r["durationSeconds"] for r in batch) / 3600, 2)})
    (HERE / "batch-manifest.json").write_text(json.dumps(manifest, indent=1))
    (HERE / "targets.json").write_text(json.dumps(rows, indent=1))
    print(f"{len(batches)} batches, {sum(m['chapters'] for m in manifest)} chapters, "
          f"{len(by_edition)} editions; dropped {dict(dropped)}")
    gaps = sorted(((len(v), k) for k, v in by_edition.items()))
    print("editions by chapters still missing:",
          {n: sum(1 for g, _ in gaps if g == n) for n in sorted({g for g, _ in gaps})})
    for row in manifest[:12]:
        print(row["batch"], row["chapters"], row["paragraphs"], row["audioHours"], row["editions"][:3])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
