"""Refill the run-3 queue with everything still missing, completability first.

Truth is the census minus every chapter this run has already published. Batches
are sized larger than the first cut (1,400 paragraphs) because the pod records
show setup is only ~1.6 min of a 16-30 min pod: alignment dominates, so the
lever is concurrency, and slightly larger batches just shave the fixed cost.
"""
import json
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PARAGRAPH_BUDGET = 1400
AUDIO_HOUR_BUDGET = 8.0
START = 401
SKIP_BOOKS = {"magna-carta", "faust-part-1", "as-you-like-it", "henry-iv-part-2",
              "taming-of-the-shrew"}
SKIP_CHAPTERS = {("phaedo", "original-en", 1), ("phaedo", "original-en", 7)}


def main() -> int:
    census = json.loads((HERE / "missing-timings.json").read_text())
    decisions = json.loads((HERE / "replay-run2.json").read_text())["chapter_decisions"]
    repair = {(r["bookId"], r["edition"], r["chapter"])
              for r in json.loads((ROOT / "artifacts/audio-highlight-queue-2026-09-11"
                                   / "p1-repair-queue.json").read_text())}
    published = set()
    for r in json.loads((HERE / "publication-journal.json").read_text()):
        book, edition, chapter, _ = r["key"].split("/")
        published.add((book, edition, int(chapter[2:])))
    # Chapters already attempted by this run (published or not) are not retried.
    attempted = set()
    for path in HERE.glob("batch-*.json"):
        try:
            index = int(path.stem.split("-")[1])
        except ValueError:
            continue
        if index >= START:
            continue
        for r in json.loads(path.read_text()):
            attempted.add((r["bookId"], r["edition"], r["chapter"]))
    dispatched = set()
    for line in (HERE / "dispatch.log").read_text().splitlines():
        if "<- batch-" in line and "launched" in line:
            index = int(line.split("<- batch-")[1].split()[0])
            for r in json.loads((HERE / f"batch-{index}.json").read_text()):
                dispatched.add((r["bookId"], r["edition"], r["chapter"]))
    for r in json.loads((HERE / "batch-1.json").read_text()):
        dispatched.add((r["bookId"], r["edition"], r["chapter"]))

    rows = []
    for r in census:
        key = (r["bookId"], r["edition"], r["chapter"])
        if (r["bookId"] in SKIP_BOOKS or r["bookId"].startswith("bible")
                or not r["edition"].endswith("-en")):
            continue
        if key in SKIP_CHAPTERS or key in repair or key in published or key in dispatched:
            continue
        if not (r.get("spokenParagraphs") or 0):
            continue
        rows.append({"bookId": r["bookId"], "edition": r["edition"], "chapter": r["chapter"],
                     "spokenParagraphs": r["spokenParagraphs"],
                     "durationSeconds": r.get("durationSeconds") or 600.0})

    def verdict(r):
        d = decisions.get(f"{r['bookId']}/{r['edition']}/ch{r['chapter']}")
        return "new" if d is None else ("v3pass" if d["v3"] else "v3fail")

    by = defaultdict(list)
    for r in rows:
        by[(r["bookId"], r["edition"])].append(r)
    tier = {k: (0 if Counter(verdict(r) for r in v)["v3fail"] == 0 else 1) for k, v in by.items()}
    order = sorted(by, key=lambda k: (tier[k], sum(r["spokenParagraphs"] for r in by[k]), len(by[k])))

    batches, current, load, seconds = [], [], 0, 0.0
    for key in order:
        for row in sorted(by[key], key=lambda r: r["chapter"]):
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
    for offset, batch in enumerate(batches):
        index = START + offset
        (HERE / f"batch-{index}.json").write_text(json.dumps(
            [{k: r[k] for k in ("bookId", "edition", "chapter")} for r in batch], indent=1))
        editions = sorted({f"{r['bookId']}/{r['edition']}" for r in batch})
        manifest.append({"batch": index, "chapters": len(batch),
                         "paragraphs": sum(r["spokenParagraphs"] for r in batch),
                         "audioHours": round(sum(r["durationSeconds"] for r in batch) / 3600, 2),
                         "editions": editions})
    (HERE / "batch-manifest-refill.json").write_text(json.dumps(manifest, indent=1))
    existing = json.loads((HERE / "pending.json").read_text())
    (HERE / "pending.json").write_text(json.dumps(existing + [m["batch"] for m in manifest]))
    print(f"{len(batches)} batches, {sum(m['chapters'] for m in manifest)} chapters, "
          f"{len(by)} editions ({sum(1 for k in tier if tier[k]==0)} tier 0), "
          f"{sum(r['spokenParagraphs'] for r in rows)} paragraphs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
