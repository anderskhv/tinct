"""Cut run-3 pod batches, editions closest to complete first.

Truth for "what is still missing" is a live probe of production for every
chapter run 2 measured (`quick-survey.json`), merged with the full census
(`missing-timings.json`) when that is available. Sizing is run 2's own
measurement of each chapter.

Editions are ordered by how few chapters they still need, so the spend that fits
inside the envelope buys as many *completed editions* as possible.
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
RUN2 = ROOT / "artifacts/audio-highlight-run2-2026-09-11"
PARAGRAPH_BUDGET = 1000
AUDIO_HOUR_BUDGET = 6.5
SKIP_BOOKS = {"magna-carta", "faust-part-1", "as-you-like-it", "henry-iv-part-2",
              "taming-of-the-shrew"}
# Phaedo's two chapters spell the speaker names out loud; they need re-recording,
# not a comparison change.
SKIP_CHAPTERS = {("phaedo", "original-en", 1), ("phaedo", "original-en", 7)}


def skipped(book: str, edition: str) -> bool:
    return book in SKIP_BOOKS or book.startswith("bible") or not edition.endswith("-en")


def main() -> int:
    survey = json.loads((HERE / "quick-survey.json").read_text())
    repair = {(r["bookId"], r["edition"], r["chapter"])
              for r in json.loads((ROOT / "artifacts/audio-highlight-queue-2026-09-11"
                                   / "p1-repair-queue.json").read_text())}
    rows, dropped = [], defaultdict(int)
    for r in survey:
        key = (r["bookId"], r["edition"], r["chapter"])
        if r["wordsStatus"] in (200, 206):
            continue
        if skipped(r["bookId"], r["edition"]):
            dropped["skip-list"] += 1
            continue
        if key in SKIP_CHAPTERS:
            dropped["re-record"] += 1
            continue
        if key in repair:
            dropped["repair queue"] += 1
            continue
        if not (r.get("spokenParagraphs") or 0):
            dropped["no recording"] += 1
            continue
        rows.append({k: r[k] for k in ("bookId", "edition", "chapter",
                                       "spokenParagraphs", "durationSeconds")})

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
        (HERE / f"batch-{index}.json").write_text(json.dumps(
            [{k: r[k] for k in ("bookId", "edition", "chapter")} for r in batch], indent=1))
        manifest.append({"batch": index, "chapters": len(batch),
                         "editions": sorted({f"{r['bookId']}/{r['edition']}" for r in batch}),
                         "editionsCompletedIfAllPass": sorted(
                             {f"{r['bookId']}/{r['edition']}" for r in batch
                              if len(by_edition[(r["bookId"], r["edition"])])
                              == sum(1 for x in batch if (x["bookId"], x["edition"])
                                     == (r["bookId"], r["edition"]))}),
                         "paragraphs": sum(r["spokenParagraphs"] for r in batch),
                         "audioHours": round(sum(r["durationSeconds"] for r in batch) / 3600, 2)})
    (HERE / "batch-manifest.json").write_text(json.dumps(manifest, indent=1))
    (HERE / "targets.json").write_text(json.dumps(rows, indent=1))
    gaps = defaultdict(int)
    for key, v in by_edition.items():
        gaps[len(v)] += 1
    print(f"{len(batches)} batches, {len(rows)} chapters, {len(by_edition)} editions; "
          f"dropped {dict(dropped)}")
    print("editions by chapters still missing:", dict(sorted(gaps.items())))
    for row in manifest[:10]:
        print(row["batch"], row["chapters"], "ch", row["paragraphs"], "para",
              row["audioHours"], "h  completes:", len(row["editionsCompletedIfAllPass"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
