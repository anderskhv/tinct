#!/usr/bin/env python3
"""Sample alignment data into a readable review report (Markdown).

    python3 books/align/review_report.py hamlet macbeth ... > books/align/review/report.md

Per book it shows, with original text, modern text and the proposed
correspondence:
  - a random automatically accepted paragraph ("auto");
  - the hardest automatically accepted segments (lowest shared-word score
    among segments the first pass accepted), so review is not limited to what
    was flagged;
  - model-corrected paragraphs, with the first-pass draft for comparison;
  - every unresolved ("u") and one-sided ("s"/"t") segment.
It also reports how close each modern edition is to its original, since near-
identical editions make alignment trivially easy and are not evidence that
genuinely modernised prose will align as cheaply.
"""
from __future__ import annotations

import json
import random
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build_alignment import EDITIONS, OUT, align, bag, segments_from_beads  # noqa: E402

CLIP = 420


def clip(text: str) -> str:
    if len(text) <= CLIP:
        return text
    half = CLIP // 2 - 3
    return text[:half] + " … " + text[-half:]


def words_for(book: str, edition: str):
    data = json.loads((EDITIONS / f"{book}-{edition}.json").read_text())
    return {str(c["number"]): [p.split() for p in c["paragraphs"]] for c in data["chapters"]}


def seg_text(seg, sw, tw):
    kind = seg[0]
    if kind in ("m", "u"):
        return " ".join(sw[seg[1]:seg[2]]), " ".join(tw[seg[3]:seg[4]])
    if kind == "s":
        return " ".join(sw[seg[1]:seg[2]]), "—"
    return "—", " ".join(tw[seg[1]:seg[2]])


LABEL = {"m": "match", "u": "UNRESOLVED", "s": "SOURCE-ONLY", "t": "TARGET-ONLY"}


def render_segments(lines, segs, sw, tw, only=None):
    for k, seg in enumerate(segs):
        if only is not None and k not in only:
            continue
        o, m = seg_text(seg, sw, tw)
        lines.append(f"- **{LABEL[seg[0]]}** `{seg}`")
        lines.append(f"  - O: {clip(o)}")
        lines.append(f"  - M: {clip(m)}")


def seg_sim(seg, sw, tw) -> float:
    if seg[0] != "m":
        return 1.0
    a, b = bag(sw[seg[1]:seg[2]]), bag(tw[seg[3]:seg[4]])
    return len(a & b) / max(1.0, (max(1, len(a)) * max(1, len(b))) ** 0.5)


def closeness(sw, tw) -> float:
    a, b = set(w.lower() for w in sw), set(w.lower() for w in tw)
    return len(a & b) / max(1, len(a | b))


def book_section(book: str, rng: random.Random) -> list[str]:
    data = json.loads((OUT / f"{book}-align.json").read_text())
    src, tgt = words_for(book, data["source"]["edition"]), words_for(book, data["target"]["edition"])
    entries = [(c, p, e) for c, ps in data["chapters"].items() for p, e in ps.items()]
    lines = [f"## {book}", ""]
    lines.append(f"- reviewState: `{data['reviewState']}`, approved: `{data['approved']}`, counts: `{data['counts']}`")
    close = [closeness(src[c][int(p)], tgt[c][int(p)]) for c, p, _ in entries]
    if close:
        mean = sum(close) / len(close)
        note = " — near-identical editions; alignment here is easy and says little about modernised prose" if mean > 0.6 else ""
        lines.append(f"- modern-vs-original word overlap (Jaccard, long paragraphs): {mean:.2f}{note}")
    lines.append("")

    autos = [(c, p, e) for c, p, e in entries if e["status"] == "auto"]
    if autos:
        c, p, e = rng.choice(autos)
        sw, tw = src[c][int(p)], tgt[c][int(p)]
        lines += [f"### Auto-accepted, random — chapter {c}, paragraph {p}", ""]
        render_segments(lines, e["segments"], sw, tw, only=set(range(min(4, len(e["segments"])))))
        if len(e["segments"]) > 4:
            lines.append(f"- … {len(e['segments']) - 4} more segments")
        lines.append("")

        hard = []
        for c, p, e in autos:
            sw, tw = src[c][int(p)], tgt[c][int(p)]
            for k, seg in enumerate(e["segments"]):
                hard.append((seg_sim(seg, sw, tw), c, p, k))
        hard.sort()
        lines += ["### Auto-accepted, hardest segments (lowest shared-word score)", ""]
        for score, c, p, k in hard[:3]:
            e = data["chapters"][c][p]
            sw, tw = src[c][int(p)], tgt[c][int(p)]
            lines.append(f"Chapter {c}, paragraph {p}, segment {k} (score {score:.2f}), with neighbours:")
            render_segments(lines, e["segments"], sw, tw, only={k - 1, k, k + 1})
            lines.append("")

    corrected = []
    for c, p, e in entries:
        if e["status"] != "model":
            continue
        sw, tw = src[c][int(p)], tgt[c][int(p)]
        draft = segments_from_beads(align(sw, tw))
        if draft != e["segments"]:
            corrected.append((c, p, e, draft))
    if corrected:
        lines.append(f"Model-corrected paragraphs: {len(corrected)} — "
                     + ", ".join(f"{c}/{p}" for c, p, _, _ in corrected) + f" (showing {min(3, len(corrected))}).")
        lines.append("")
    for c, p, e, draft in rng.sample(corrected, min(3, len(corrected))):
        sw, tw = src[c][int(p)], tgt[c][int(p)]
        lines += [f"### Model-corrected — chapter {c}, paragraph {p}", ""]
        lines.append(f"First-pass draft had {len(draft)} segments "
                     f"({sum(1 for d in draft if d[0] == 'u')} unresolved); model review has {len(e['segments'])}.")
        if e.get("note"):
            lines.append(f"Reviewer note: {e['note']}")
        render_segments(lines, e["segments"], sw, tw, only=set(range(min(6, len(e["segments"])))))
        if len(e["segments"]) > 6:
            lines.append(f"- … {len(e['segments']) - 6} more segments")
        lines.append("")

    odd = [(c, p, e, k) for c, p, e in entries for k, seg in enumerate(e["segments"]) if seg[0] != "m"]
    lines += [f"### Unresolved and one-sided segments ({len(odd)})", ""]
    for c, p, e, k in odd:
        sw, tw = src[c][int(p)], tgt[c][int(p)]
        lines.append(f"Chapter {c}, paragraph {p} ({e['status']}):" + (f" note: {e['note']}" if e.get("note") else ""))
        render_segments(lines, e["segments"], sw, tw, only={k})
    if not odd:
        lines.append("None.")
    lines.append("")
    return lines


def main() -> int:
    books = sys.argv[1:]
    rng = random.Random(20260924)
    out = [
        "# Alignment review report",
        "",
        "Checks in this report are **model review** (Claude), not human verification.",
        "`O` = original edition, `M` = modern edition. Segment arrays are",
        "`[kind, s0, s1, t0, t1]` in whitespace-word offsets (see README).",
        "",
    ]
    for book in books:
        out += book_section(book, rng)
    print("\n".join(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
