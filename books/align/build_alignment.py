#!/usr/bin/env python3
"""Sentence-level alignment between two paragraph-aligned editions.

Writes a render-time sidecar; the served edition JSON is NEVER modified:

    books/align/data/{bookId}-align.json

Editions are already aligned paragraph-for-paragraph. Inside a long paragraph
the reader's compare flip can only guess (proportional position), which lands
lines away in drama and long-paragraph prose. This tool records, per long
paragraph, the word indices where corresponding sentence groups begin:

    "chapters": {"3": {"5": [[0, 0], [14, 11], [41, 30], ...]}}

Each pair is [sourceWordIndex, targetWordIndex] — the start of an aligned
segment in each edition. Word indices use the app's tokenization: a plain
whitespace split of the served paragraph (underscore-emphasis stripping never
changes token count; see app/src/lab/labEmphasis.tsx). Pairs are strictly
increasing in both columns and always start with [0, 0], so the mapping is
invertible and monotonic.

Pass 1 (this script, deterministic, zero spend): sentence split + monotonic
dynamic-programming alignment scored on shared content words and length ratio.
Segments whose score is weak are listed in `review` for pass 2 (an agent
resolves only those, writing `overrides/{bookId}.json`, which this script
merges and validates on the next run).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
EDITIONS = REPO / "app" / "public" / "data" / "editions"
HERE = Path(__file__).resolve().parent
OUT = HERE / "data"
OVERRIDES = HERE / "overrides"

LONG_PARAGRAPH_WORDS = 100  # below ~one phone page, the paragraph anchor suffices
STRONG_STOP = re.compile(r"[.!?;:][\"'”’)\]]*$")
WORD = re.compile(r"[a-z]+")
STOP = set("""a an the and or but nor so yet for of to in on at by with from as is are was were be been
being am do does did have has had not no it its this that these those he him his she her they them their
we us our you your i me my mine thy thee thou thine ye what which who whom whose when where why how all
any some such very too than then there here if than more most shall will would should can could may might
must o oh let now up out into upon unto over again one own same other only just even well yes lord""".split())
# Early-modern forms -> modern stem, so shared-word scoring survives modernisation.
ARCHAIC = {"doth": "does", "hath": "has", "art": "are", "thy": "your", "thee": "you", "thou": "you",
           "ere": "before", "oft": "often", "nay": "no", "ay": "yes", "hither": "here", "whither": "where"}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def tokens(text: str) -> list[str]:
    return text.split()


def sentences(words: list[str]) -> list[int]:
    """Word indices where sentences start (always includes 0)."""
    starts = [0]
    for i, w in enumerate(words[:-1]):
        if STRONG_STOP.search(w):
            starts.append(i + 1)
    return starts


def stem(w: str) -> str:
    w = ARCHAIC.get(w, w)
    for suf in ("eth", "est", "ing", "ed", "es", "s", "'d", "’d"):
        if len(w) > len(suf) + 3 and w.endswith(suf):
            w = w[: -len(suf)]
            break
    return w[:6]


def bag(words: list[str]) -> set[str]:
    out = set()
    for w in words:
        for m in WORD.findall(w.lower().replace("’", "'")):
            if len(m) > 2 and m not in STOP:
                out.add(stem(m))
    return out


def segs(words: list[str], starts: list[int]) -> list[tuple[int, int]]:
    ends = starts[1:] + [len(words)]
    return list(zip(starts, ends))


BEADS = [(1, 1), (1, 2), (2, 1), (2, 2), (1, 3), (3, 1), (2, 3), (3, 2), (1, 0), (0, 1)]


def align(sw: list[str], tw: list[str]):
    """Monotonic DP over sentence beads. Returns (pairs, beads_with_scores)."""
    ss, ts = segs(sw, sentences(sw)), segs(tw, sentences(tw))
    ratio = max(1e-6, len(tw) / max(1, len(sw)))
    n, m = len(ss), len(ts)
    INF = float("inf")
    cost = [[INF] * (m + 1) for _ in range(n + 1)]
    back: list[list[tuple | None]] = [[None] * (m + 1) for _ in range(n + 1)]
    cost[0][0] = 0.0

    def span(sg, a, b):
        return (sg[a][0], sg[b - 1][1]) if b > a else None

    def bead_cost(i, j, di, dj):
        if di == 0 or dj == 0:
            return 3.0, 0.0
        a, b = span(ss, i, i + di), span(ts, j, j + dj)
        la, lb = a[1] - a[0], b[1] - b[0]
        ba, bb = bag(sw[a[0]:a[1]]), bag(tw[b[0]:b[1]])
        sim = len(ba & bb) / math.sqrt(max(1, len(ba)) * max(1, len(bb)))
        lr = abs(math.log(max(1, lb) / (max(1, la) * ratio)))
        c = (1.0 - sim) * 2.0 + lr * 0.9 + (0.25 if (di, dj) != (1, 1) else 0.0) + 0.1 * (di + dj - 2)
        return c, sim

    for i in range(n + 1):
        for j in range(m + 1):
            if cost[i][j] == INF:
                continue
            for di, dj in BEADS:
                if i + di > n or j + dj > m:
                    continue
                c, _ = bead_cost(i, j, di, dj)
                if cost[i][j] + c < cost[i + di][j + dj]:
                    cost[i + di][j + dj] = cost[i][j] + c
                    back[i + di][j + dj] = (i, j, di, dj)
    path = []
    i, j = n, m
    while (i, j) != (0, 0):
        pi, pj, di, dj = back[i][j]
        path.append((pi, pj, di, dj))
        i, j = pi, pj
    path.reverse()
    beads = []
    for pi, pj, di, dj in path:
        c, sim = bead_cost(pi, pj, di, dj)
        s0 = ss[pi][0] if pi < n else len(sw)
        t0 = ts[pj][0] if pj < m else len(tw)
        s1 = ss[pi + di - 1][1] if di else s0
        t1 = ts[pj + dj - 1][1] if dj else t0
        beads.append({"s": [s0, s1], "t": [t0, t1], "cost": round(c, 3), "sim": round(sim, 3)})
    return beads


def pairs_from_beads(beads) -> list[list[int]]:
    pairs = []
    for b in beads:
        s0, t0 = b["s"][0], b["t"][0]
        if b["s"][0] == b["s"][1] or b["t"][0] == b["t"][1]:
            continue  # insertion/deletion bead: absorbed into its neighbour
        if pairs and (s0 <= pairs[-1][0] or t0 <= pairs[-1][1]):
            continue
        pairs.append([s0, t0])
    if not pairs or pairs[0] != [0, 0]:
        pairs = [[0, 0]] + [p for p in pairs if p != [0, 0] and p[0] > 0 and p[1] > 0]
    return pairs


def validate(pairs, ns: int, nt: int) -> str | None:
    if not pairs or pairs[0] != [0, 0]:
        return "must start at [0,0]"
    for (a, b), (c, d) in zip(pairs, pairs[1:]):
        if not (c > a and d > b):
            return f"not strictly increasing at {[c, d]}"
    if pairs[-1][0] >= ns or pairs[-1][1] >= nt:
        return "index out of range"
    return None


def weak(bead) -> bool:
    s_len, t_len = bead["s"][1] - bead["s"][0], bead["t"][1] - bead["t"][0]
    if s_len == 0 or t_len == 0:
        return True
    return bead["sim"] < 0.12 or bead["cost"] > 2.2


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("book")
    ap.add_argument("--source", default="original-en")
    ap.add_argument("--target", default="modern-en")
    ap.add_argument("--min-words", type=int, default=LONG_PARAGRAPH_WORDS)
    ap.add_argument("--review-out", help="write weak paragraphs as compact review tasks (JSON)")
    args = ap.parse_args()

    sp = EDITIONS / f"{args.book}-{args.source}.json"
    tp = EDITIONS / f"{args.book}-{args.target}.json"
    src, tgt = json.loads(sp.read_text()), json.loads(tp.read_text())
    overrides_path = OVERRIDES / f"{args.book}.json"
    overrides = json.loads(overrides_path.read_text()).get("chapters", {}) if overrides_path.exists() else {}

    chapters, review, stats = {}, [], {"long": 0, "weak": 0, "overridden": 0, "words_long": 0, "words_weak": 0}
    for cs, ct in zip(src["chapters"], tgt["chapters"]):
        num = str(cs["number"])
        if len(cs["paragraphs"]) != len(ct["paragraphs"]):
            print(f"skip chapter {num}: paragraph counts differ", file=sys.stderr)
            continue
        for pi, (a, b) in enumerate(zip(cs["paragraphs"], ct["paragraphs"])):
            sw, tw = tokens(a), tokens(b)
            if max(len(sw), len(tw)) < args.min_words:
                continue
            stats["long"] += 1
            stats["words_long"] += len(sw) + len(tw)
            ov = overrides.get(num, {}).get(str(pi))
            if ov is not None:
                err = validate(ov, len(sw), len(tw))
                if err:
                    print(f"override {num}/{pi} rejected: {err}", file=sys.stderr)
                else:
                    stats["overridden"] += 1
                    if len(ov) > 1:
                        chapters.setdefault(num, {})[str(pi)] = ov
                    continue
            beads = align(sw, tw)
            pairs = pairs_from_beads(beads)
            err = validate(pairs, len(sw), len(tw))
            if err:
                print(f"{num}/{pi}: {err}", file=sys.stderr)
                return 1
            if len(pairs) > 1:
                chapters.setdefault(num, {})[str(pi)] = pairs
            if any(weak(bd) for bd in beads):
                stats["weak"] += 1
                stats["words_weak"] += len(sw) + len(tw)
                ss, ts = segs(sw, sentences(sw)), segs(tw, sentences(tw))
                review.append({
                    "chapter": num, "paragraph": pi,
                    "O": [[s, " ".join(sw[s:e])] for s, e in ss],
                    "M": [[s, " ".join(tw[s:e])] for s, e in ts],
                    "draft": pairs,
                })

    OUT.mkdir(parents=True, exist_ok=True)
    out = {
        "bookId": args.book, "version": 1, "source": args.source, "target": args.target,
        "sourceSha256": sha(sp), "targetSha256": sha(tp),
        "minWords": args.min_words, "chapters": chapters,
    }
    (OUT / f"{args.book}-align.json").write_text(json.dumps(out, separators=(",", ":")) + "\n")
    if args.review_out:
        Path(args.review_out).write_text(json.dumps(review, ensure_ascii=False, indent=0))
    print(json.dumps(stats))
    return 0


if __name__ == "__main__":
    sys.exit(main())
