"""Cut wave-2 pod batches from the production survey, editions closest to complete first.

Same sizing rule as build_batches.py (paragraph count first, audio hours as a
second cap), but the measurements come from survey.json instead of re-probing
production. Editions are ordered by how few chapters they still need, so the
spend that fits inside the envelope buys as many *completed editions* as possible.
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
PARAGRAPH_BUDGET = 1000
AUDIO_HOUR_BUDGET = 6.5


def main() -> int:
    survey = {(r["bookId"], r["edition"], r["chapter"]): r
              for r in json.loads((HERE / "survey.json").read_text())}
    targets = json.loads((HERE / "wave2-targets.json").read_text())

    by_edition = defaultdict(list)
    for target in targets:
        row = survey[(target["bookId"], target["edition"], target["chapter"])]
        by_edition[(target["bookId"], target["edition"])].append(row)
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
        path = HERE / f"wave2-batch-{index}.json"
        path.write_text(json.dumps([{k: r[k] for k in ("bookId", "edition", "chapter")} for r in batch], indent=1))
        manifest.append({"batch": index, "file": path.name, "chapters": len(batch),
                         "editions": sorted({r["bookId"] for r in batch}),
                         "paragraphs": sum(r["spokenParagraphs"] for r in batch),
                         "audioHours": round(sum(r["durationSeconds"] for r in batch) / 3600, 2)})
    (HERE / "wave2-manifest.json").write_text(json.dumps(manifest, indent=1))
    print(f"{len(batches)} batches, {sum(m['chapters'] for m in manifest)} chapters")
    for row in manifest[:14]:
        print(row)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
