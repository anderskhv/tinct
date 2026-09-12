"""Re-cut run-3 batches by *completability*, not by gap alone.

Ordering editions by "fewest chapters missing" put the 24 one-chapter-short
editions first — and the replay says 12 of those single chapters still fail
under v3 for reasons outside any normalisation class (Latin passages, a looped
sentence, plain recognition misses). Aligning them again mostly buys nothing.

So: an edition is *completable* when every chapter it still needs either was
never attempted, or the replay of run 2's own recognition says v3 passes it.
Those editions come first, smallest first; the rest follow as a cheap second
attempt (fresh recognition is a new sample and sometimes clears a near miss).

Batch numbering starts at 101 so the already-launched batch-1 is untouched.
"""
import json
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
PARAGRAPH_BUDGET = 1000
AUDIO_HOUR_BUDGET = 6.5
START = 101


def main() -> int:
    rows = json.loads((HERE / "targets.json").read_text())
    launched = {(r["bookId"], r["edition"], r["chapter"])
                for r in json.loads((HERE / "batch-1.json").read_text())}
    decisions = json.loads((HERE / "replay-run2.json").read_text())["chapter_decisions"]

    def verdict(r):
        d = decisions.get(f"{r['bookId']}/{r['edition']}/ch{r['chapter']}")
        return "new" if d is None else ("v3pass" if d["v3"] else "v3fail")

    by = defaultdict(list)
    for r in rows:
        by[(r["bookId"], r["edition"])].append(r)

    tier = {}
    for key, chapters in by.items():
        counts = Counter(verdict(r) for r in chapters)
        tier[key] = 0 if counts["v3fail"] == 0 else 1

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
        completes = sorted(e for e in editions
                           if tier[tuple(e.split("/"))] == 0
                           and sum(1 for r in batch if f"{r['bookId']}/{r['edition']}" == e)
                           == sum(1 for r in by[tuple(e.split("/"))]
                                  if (r["bookId"], r["edition"], r["chapter"]) not in launched))
        manifest.append({"batch": index, "chapters": len(batch),
                         "paragraphs": sum(r["spokenParagraphs"] for r in batch),
                         "audioHours": round(sum(r["durationSeconds"] for r in batch) / 3600, 2),
                         "tier": min(tier[tuple(e.split("/"))] for e in editions),
                         "editions": sorted(editions), "completesIfAllPass": completes})
    (HERE / "batch-manifest.json").write_text(json.dumps(manifest, indent=1))
    (HERE / "pending.json").write_text(json.dumps([m["batch"] for m in manifest]))
    completable = [k for k in by if tier[k] == 0]
    print(f"{len(batches)} batches from {sum(m['chapters'] for m in manifest)} chapters; "
          f"{len(completable)} completable editions "
          f"({sum(r['spokenParagraphs'] for k in completable for r in by[k])} paragraphs)")
    for m in manifest[:16]:
        print(f"  {m['batch']} t{m['tier']} {m['chapters']:4d} ch {m['paragraphs']:5d} para "
              f"{m['audioHours']:5.2f} h  completes {len(m['completesIfAllPass'])}: "
              f"{','.join(e.split('/')[0] for e in m['completesIfAllPass'])[:70]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
