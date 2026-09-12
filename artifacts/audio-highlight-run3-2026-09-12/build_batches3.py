"""Re-cut the remaining run-3 queue from the FULL production census.

The first cut used run 2's candidate set, which is `original-en` only. The
census (`audit_production.py`) shows the `modern-en` editions are in the same
state and several are one or two chapters from complete — and none of them has
ever been attempted, so they carry no known blocker. They are English, they have
recordings, and they are not on the skip list, so they belong in the queue.

Ordering, as before, is by completability: an edition is tier 0 when every
chapter it still needs either was never attempted or the replay says v3 passes
it. Batches already dispatched are excluded chapter by chapter.

Batch numbering starts at 201.
"""
import json
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PARAGRAPH_BUDGET = 1000
AUDIO_HOUR_BUDGET = 6.5
START = 201
SKIP_BOOKS = {"magna-carta", "faust-part-1", "as-you-like-it", "henry-iv-part-2",
              "taming-of-the-shrew"}
SKIP_CHAPTERS = {("phaedo", "original-en", 1), ("phaedo", "original-en", 7)}


def main() -> int:
    census = json.loads((HERE / "missing-timings.json").read_text())
    decisions = json.loads((HERE / "replay-run2.json").read_text())["chapter_decisions"]
    repair = {(r["bookId"], r["edition"], r["chapter"])
              for r in json.loads((ROOT / "artifacts/audio-highlight-queue-2026-09-11"
                                   / "p1-repair-queue.json").read_text())}
    dispatched = set()
    for path in HERE.glob("batch-*.json"):
        try:
            index = int(path.stem.split("-")[1])
        except ValueError:
            continue
        if index >= START:
            continue
        if index != 1 and index not in range(101, 201):
            continue
        for r in json.loads(path.read_text()):
            dispatched.add((r["bookId"], r["edition"], r["chapter"]))
    launched = set()
    for line in (HERE / "dispatch.log").read_text().splitlines():
        if "launched" in line and "<- batch-" in line:
            index = int(line.split("<- batch-")[1].split()[0])
            for r in json.loads((HERE / f"batch-{index}.json").read_text()):
                launched.add((r["bookId"], r["edition"], r["chapter"]))
    for r in json.loads((HERE / "batch-1.json").read_text()):
        launched.add((r["bookId"], r["edition"], r["chapter"]))

    rows = []
    for r in census:
        key = (r["bookId"], r["edition"], r["chapter"])
        if (r["bookId"] in SKIP_BOOKS or r["bookId"].startswith("bible")
                or not r["edition"].endswith("-en")):
            continue
        if key in SKIP_CHAPTERS or key in repair:
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
            if (row["bookId"], row["edition"], row["chapter"]) in launched:
                continue
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
        editions = {f"{r['bookId']}/{r['edition']}" for r in batch}
        completes = sorted(
            e for e in editions
            if tier[tuple(e.split("/"))] == 0
            and sum(1 for r in batch if f"{r['bookId']}/{r['edition']}" == e)
            == sum(1 for r in by[tuple(e.split("/"))]
                   if (r["bookId"], r["edition"], r["chapter"]) not in launched))
        manifest.append({"batch": index, "chapters": len(batch),
                         "paragraphs": sum(r["spokenParagraphs"] for r in batch),
                         "audioHours": round(sum(r["durationSeconds"] for r in batch) / 3600, 2),
                         "tier": min(tier[tuple(e.split("/"))] for e in editions),
                         "editions": sorted(editions), "completesIfAllPass": completes})
    (HERE / "batch-manifest-census.json").write_text(json.dumps(manifest, indent=1))
    (HERE / "pending.json").write_text(json.dumps([m["batch"] for m in manifest]))
    print(f"{len(batches)} batches, {sum(m['chapters'] for m in manifest)} chapters; "
          f"{sum(1 for k in tier if tier[k] == 0)} tier-0 editions of {len(by)}")
    for m in manifest[:10]:
        print(f"  {m['batch']} t{m['tier']} {m['chapters']:4d} ch {m['paragraphs']:5d} para "
              f"completes {len(m['completesIfAllPass'])}: "
              f"{', '.join(m['completesIfAllPass'])[:110]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
