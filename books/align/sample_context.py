#!/usr/bin/env python3
"""Freeze a reviewed human sample and show each item with its neighbours.

    # once: freeze items from the commit the reviewer saw
    python3 books/align/sample_context.py freeze review/human-sample-hamlet-douglass-2026-09-24.md 02e6a13f
    # any time: expand each frozen item with the current alignment data
    python3 books/align/sample_context.py expand review/human-sample-hamlet-douglass-2026-09-24.items.json

`freeze` reads the sample's item headers ("### N. book ch/p segment k ...") and
looks the segments up in books/align/data/*-align.json AS OF <commit>, storing
exact word ranges, so the sample stays reproducible after the data changes.
`expand` prints, for every item, the current segments overlapping its ranges
plus one neighbour on each side, with the reviewer's verdict if recorded.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
sys.path.insert(0, str(HERE))
from review_report import seg_text, words_for  # noqa: E402

HEAD = re.compile(r"^### (\d+)\. (\S+) (\d+)/(\d+) segment (\d+) — ([\w-]+), `(\w)`")


def freeze(sample: str, commit: str) -> None:
    items, cache = [], {}
    for line in (HERE / sample).read_text().splitlines():
        m = HEAD.match(line)
        if not m:
            continue
        n, book, ch, p, k, status, kind = m.groups()
        if book not in cache:
            cache[book] = json.loads(subprocess.run(
                ["git", "-C", str(REPO), "show", f"{commit}:books/align/data/{book}-align.json"],
                check=True, capture_output=True, text=True).stdout)
        seg = cache[book]["chapters"][ch][p]["segments"][int(k)]
        assert seg[0] == kind, (n, seg)
        s = seg[1:3] if kind in "mus" else None
        t = seg[3:5] if kind in "mu" else seg[1:3] if kind == "t" else None
        items.append({"n": int(n), "book": book, "chapter": ch, "paragraph": p,
                      "statusThen": status, "kind": kind, "source": s, "target": t})
    out = HERE / sample.replace(".md", ".items.json")
    out.write_text(json.dumps({"sample": sample, "frozenAt": commit, "items": items}, indent=1) + "\n")
    print(f"froze {len(items)} items -> {out.relative_to(REPO)}")


def overlaps(seg, item) -> bool:
    def hit(a, b):
        return a is not None and b is not None and a[0] < b[1] and b[0] < a[1]
    s = seg[1:3] if seg[0] in "mus" else None
    t = seg[3:5] if seg[0] in "mu" else seg[1:3] if seg[0] == "t" else None
    return hit(s, item["source"]) or hit(t, item["target"])


def expand(frozen: str) -> None:
    data = json.loads((HERE / frozen).read_text())
    verdicts = data.get("verdicts", {})
    cache = {}
    lines = [f"# Context for {data['sample']} (frozen at {data['frozenAt']})", "",
             "Each item: the current segments covering the reviewed ranges (>>), plus one",
             "neighbour either side. Checks recorded here are model review unless marked human.", ""]
    for it in data["items"]:
        book = it["book"]
        if book not in cache:
            d = json.loads((HERE / "data" / f"{book}-align.json").read_text())
            cache[book] = (d, words_for(book, d["source"]["edition"]), words_for(book, d["target"]["edition"]))
        d, src, tgt = cache[book]
        e = d["chapters"][it["chapter"]][it["paragraph"]]
        segs = e["segments"]
        hits = [k for k, seg in enumerate(segs) if overlaps(seg, it)]
        show = range(max(0, hits[0] - 1), min(len(segs), hits[-1] + 2))
        v = verdicts.get(str(it["n"]), "")
        lines.append(f"## {it['n']}. {book} {it['chapter']}/{it['paragraph']} — then `{it['statusThen']}`, now `{e['status']}`"
                     + (f" — verdict: {v}" if v else ""))
        if e.get("note"):
            lines.append(f"Note: {e['note']}")
        lines.append("")
        sw, tw = src[it["chapter"]][int(it["paragraph"])], tgt[it["chapter"]][int(it["paragraph"])]
        for k in show:
            o, m = seg_text(segs[k], sw, tw)
            mark = ">>" if k in hits else "  "
            lines.append(f"- {mark} `{segs[k]}`")
            lines.append(f"  - O: {o}")
            lines.append(f"  - M: {m}")
        lines.append("")
    out = HERE / frozen.replace(".items.json", ".context.md")
    out.write_text("\n".join(lines) + "\n")
    print(f"wrote {out.relative_to(REPO)}")


if __name__ == "__main__":
    {"freeze": lambda: freeze(sys.argv[2], sys.argv[3]), "expand": lambda: expand(sys.argv[2])}[sys.argv[1]]()
