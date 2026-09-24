#!/usr/bin/env python3
"""Draw a stratified random sample of alignment segments for a human check.

    python3 books/align/human_sample.py > books/align/review/human-sample-<date>.md

Per book it draws segments at random from each review status present:
first-pass accepted ("auto"), model-reviewed ("model"), and every non-match
("u"/"s"/"t") up to a cap. Random, not hardest: the point is an unbiased
estimate. The reviewer ticks one box per item. Signing off samples is
evidence about a book, not a statement that every passage was verified.
"""
from __future__ import annotations

import json
import random
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build_alignment import OUT  # noqa: E402
from review_report import seg_text, words_for  # noqa: E402

PLAN = {  # book: {status: count}
    "hamlet": {"auto": 3, "model": 4, "odd": 1},
    "macbeth": {"model": 5, "odd": 2},
    "frederick-douglass": {"auto": 5, "model": 3, "odd": 1},
}
SEED = 20260924


def main() -> int:
    rng = random.Random(SEED)
    out = [
        "# Alignment human sample — 2026-09-24",
        "",
        "Random segments (not the hardest ones) from each book, stratified by how they",
        "were produced: `auto` = free first pass, never reviewed; `model` = corrected",
        "by a helper agent; `u`/`s`/`t` = unresolved or one-sided.",
        "",
        "For each item tick one box. **Correct** = the modern text is the counterpart",
        "of the original text, no more and no less. **Off by a sentence** = right place,",
        "but a sentence belongs in the neighbouring item. **Wrong** = not the",
        "counterpart. Signing off these samples is evidence about each book, not a",
        "statement that every passage was checked.",
        "",
        "Macbeth's edition is being repaired (13 dropped speeches), so its alignment",
        "will be regenerated; its samples still measure how accurate the model review is.",
        "",
    ]
    n = 0
    for book, plan in PLAN.items():
        data = json.loads((OUT / f"{book}-align.json").read_text())
        src = words_for(book, data["source"]["edition"])
        tgt = words_for(book, data["target"]["edition"])
        pools: dict[str, list] = {"auto": [], "model": [], "odd": []}
        for c, ps in data["chapters"].items():
            for p, e in ps.items():
                for k, seg in enumerate(e["segments"]):
                    if seg[0] == "m" and e["status"] in ("auto", "model"):
                        # skip speaker labels and one-word items: trivially right
                        if seg[2] - seg[1] > 2:
                            pools[e["status"]].append((c, p, k, e["status"]))
                    elif seg[0] != "m":
                        pools["odd"].append((c, p, k, e["status"]))
        out += [f"## {book}", ""]
        for stratum, count in plan.items():
            for c, p, k, status in rng.sample(pools[stratum], min(count, len(pools[stratum]))):
                n += 1
                seg = data["chapters"][c][p]["segments"][k]
                o, m = seg_text(seg, src[c][int(p)], tgt[c][int(p)])
                out.append(f"### {n}. {book} {c}/{p} segment {k} — {status}, `{seg[0]}`")
                out.append("")
                out.append(f"**Original:** {o}")
                out.append("")
                out.append(f"**Modern:** {m}")
                out.append("")
                out.append("- [ ] Correct  - [ ] Off by a sentence  - [ ] Wrong  — note:")
                out.append("")
    print("\n".join(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
