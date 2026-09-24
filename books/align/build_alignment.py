#!/usr/bin/env python3
"""Segment-level alignment between two paragraph-aligned editions.

Writes a render-time sidecar; the served edition JSON is NEVER modified:

    books/align/data/{bookId}-align.json

Contract: see books/align/README.md (format version 1). In short, every long
paragraph gets an ordered list of segments that tile both paragraphs exactly:

    ["m", s0, s1, t0, t1]   source words [s0,s1) correspond to target [t0,t1)
    ["s", s0, s1]           source-only material (omitted in target)
    ["t", t0, t1]           target-only material (added in target)
    ["u", s0, s1, t0, t1]   unresolved block: these spans belong together, but
                            the correspondence inside them is not known

Word offsets are indices into a plain whitespace split of the served paragraph.
Segments are never forced: anything the aligner or a reviewer is unsure of is
"u". Every paragraph carries a review status ("auto" = first pass, not reviewed;
"auto-flagged" = first pass with weak spots marked "u"; "model" = resolved by a
model reviewer; "human" = checked by a person). The file-level `approved` field
is null until a person signs a book off; consumers must ignore unapproved files.

Pass 1 (this script, deterministic, zero spend) aligns sentences with a
monotonic DP scored on shared content words and length ratio. Weak segments
become "u" and the paragraph is written to the review file (--review-out).
Pass 2 (a helper agent) writes overrides/{bookId}.json; this script validates
and merges them on the next run. A rejected override is reported and the
first-pass result is kept.
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

FORMAT = "tinct-edition-align"
VERSION = 1
LONG_PARAGRAPH_WORDS = 100  # below ~one phone page, the paragraph anchor suffices
MAX_SENTENCES = 160  # DP guard: longer paragraphs are chunked at strong anchors
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
KINDS = {"m": 5, "u": 5, "s": 3, "t": 3}
STATUSES = ("auto", "auto-flagged", "model", "human")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


# Tokens whose final period is an abbreviation, not a sentence end.
ABBREV = re.compile(r"^[\"'“‘(\[]*(mr|mrs|messrs|dr|st|mt|sr|jr|rev|gen|col|capt|lt|gov|hon|prof|vol|ch|no|viz|cf|etc|i\.e|e\.g|[a-hj-z])\.$", re.I)


def sentences(words: list[str]) -> list[int]:
    """Word indices where sentences start (always includes 0)."""
    starts = [0]
    for i, w in enumerate(words[:-1]):
        if STRONG_STOP.search(w) and not ABBREV.match(w):
            starts.append(i + 1)
    return starts


def stem(w: str) -> str:
    w = ARCHAIC.get(w, w)
    for suf in ("eth", "est", "ing", "ed", "es", "s", "'d"):
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


def spans(words: list[str]) -> list[tuple[int, int]]:
    starts = sentences(words)
    return list(zip(starts, starts[1:] + [len(words)]))


BEADS = [(1, 1), (1, 2), (2, 1), (2, 2), (1, 3), (3, 1), (2, 3), (3, 2), (1, 0), (0, 1)]


def align(sw: list[str], tw: list[str]) -> list[dict]:
    """Monotonic DP over sentence beads. Returns beads with scores."""
    ss, ts = spans(sw), spans(tw)
    ratio = max(1e-6, len(tw) / max(1, len(sw)))
    n, m = len(ss), len(ts)
    sbags = [bag(sw[a:b]) for a, b in ss]
    tbags = [bag(tw[a:b]) for a, b in ts]
    # Band the DP around the diagonal: aligned sentences never drift far.
    band = max(12, abs(n - m) + 8)
    INF = float("inf")
    cost: dict[tuple[int, int], float] = {(0, 0): 0.0}
    back: dict[tuple[int, int], tuple[int, int, int, int]] = {}

    def score(i, j, di, dj):
        if di == 0 or dj == 0:
            return 3.0, 0.0
        la = ss[i + di - 1][1] - ss[i][0]
        lb = ts[j + dj - 1][1] - ts[j][0]
        ba = set().union(*sbags[i:i + di])
        bb = set().union(*tbags[j:j + dj])
        sim = len(ba & bb) / math.sqrt(max(1, len(ba)) * max(1, len(bb)))
        lr = abs(math.log(max(1, lb) / (max(1, la) * ratio)))
        c = (1.0 - sim) * 2.0 + lr * 0.9 + (0.25 if (di, dj) != (1, 1) else 0.0) + 0.1 * (di + dj - 2)
        return c, sim

    for i in range(n + 1):
        centre = round(i * m / max(1, n))
        for j in range(max(0, centre - band), min(m, centre + band) + 1):
            here = cost.get((i, j), INF)
            if here == INF:
                continue
            for di, dj in BEADS:
                if i + di > n or j + dj > m:
                    continue
                c, _ = score(i, j, di, dj)
                if here + c < cost.get((i + di, j + dj), INF):
                    cost[(i + di, j + dj)] = here + c
                    back[(i + di, j + dj)] = (i, j, di, dj)
    if (n, m) not in cost:
        return [{"s": [0, len(sw)], "t": [0, len(tw)], "cost": 9.0, "sim": 0.0}]
    path = []
    i, j = n, m
    while (i, j) != (0, 0):
        pi, pj, di, dj = back[(i, j)]
        path.append((pi, pj, di, dj))
        i, j = pi, pj
    path.reverse()
    beads = []
    for pi, pj, di, dj in path:
        c, sim = score(pi, pj, di, dj)
        s0 = ss[pi][0] if pi < n else len(sw)
        t0 = ts[pj][0] if pj < m else len(tw)
        s1 = ss[pi + di - 1][1] if di else s0
        t1 = ts[pj + dj - 1][1] if dj else t0
        beads.append({"s": [s0, s1], "t": [t0, t1], "cost": round(c, 3), "sim": round(sim, 3)})
    return beads


def weak(bead) -> bool:
    if bead["s"][0] == bead["s"][1] or bead["t"][0] == bead["t"][1]:
        return True  # the DP's one-sided guesses are never trusted unreviewed
    return bead["sim"] < 0.12 or bead["cost"] > 2.2


def segments_from_beads(beads) -> list[list]:
    """Confident beads -> "m"; runs of weak beads -> one "u" block."""
    out: list[list] = []
    pending = None  # [s0, s1, t0, t1] of a weak run
    for b in beads:
        s0, s1, t0, t1 = b["s"][0], b["s"][1], b["t"][0], b["t"][1]
        if weak(b):
            pending = [pending[0], s1, pending[2], t1] if pending else [s0, s1, t0, t1]
            continue
        if pending:
            out.append(["u", *pending])
            pending = None
        out.append(["m", s0, s1, t0, t1])
    if pending:
        out.append(["u", *pending])
    # A "u" must have words on both sides; a one-sided weak run is folded into
    # its neighbour, which then becomes "u" as well.
    fixed: list[list] = []
    for seg in out:
        if seg[0] == "u" and (seg[1] == seg[2] or seg[3] == seg[4]):
            if fixed:
                prev = fixed.pop()
                seg = ["u", prev[1], seg[2], prev[3], seg[4]]
            else:
                fixed.append(seg)
                continue
        if fixed and fixed[-1][0] == "u" and (fixed[-1][1] == fixed[-1][2] or fixed[-1][3] == fixed[-1][4]):
            first = fixed.pop()
            seg = ["u", first[1], seg[2], first[3], seg[4]]
        if fixed and fixed[-1][0] == "u" and seg[0] == "u":
            prev = fixed.pop()
            seg = ["u", prev[1], seg[2], prev[3], seg[4]]
        fixed.append(seg)
    return fixed


def pairs_to_segments(pairs, ns: int, nt: int) -> list[list]:
    """Legacy override format ([[s,t],...] start pairs) -> "m" segments."""
    bounds = [tuple(p) for p in pairs] + [(ns, nt)]
    return [["m", a, c, b, d] for (a, b), (c, d) in zip(bounds, bounds[1:])]


def validate(segments, ns: int, nt: int) -> str | None:
    """Structure only: kinds, arity, exact tiling of both paragraphs, order.

    This never judges meaning. Tiling is satisfiable without forcing a match,
    because "u", "s" and "t" exist for anything uncertain or one-sided.
    """
    if not isinstance(segments, list) or not segments:
        return "no segments"
    s_pos = t_pos = 0
    for k, seg in enumerate(segments):
        if not isinstance(seg, list) or not seg or seg[0] not in KINDS or len(seg) != KINDS[seg[0]]:
            return f"segment {k}: bad shape {seg!r}"
        if not all(isinstance(x, int) for x in seg[1:]):
            return f"segment {k}: non-integer offset"
        kind = seg[0]
        if kind in ("m", "u", "s"):
            a, b = seg[1], seg[2]
            if a != s_pos or b <= a:
                return f"segment {k}: source gap/overlap/empty at {a} (expected {s_pos})"
            s_pos = b
        if kind in ("m", "u", "t"):
            a, b = (seg[3], seg[4]) if kind in ("m", "u") else (seg[1], seg[2])
            if a != t_pos or b <= a:
                return f"segment {k}: target gap/overlap/empty at {a} (expected {t_pos})"
            t_pos = b
    if s_pos != ns:
        return f"source covered to {s_pos}, paragraph has {ns} words"
    if t_pos != nt:
        return f"target covered to {t_pos}, paragraph has {nt} words"
    return None


def load_overrides(book: str) -> dict:
    path = OVERRIDES / f"{book}.json"
    if not path.exists():
        return {}
    data = json.loads(path.read_text())
    return data.get("chapters", {})


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("book")
    ap.add_argument("--source", default="original-en")
    ap.add_argument("--target", default="modern-en")
    ap.add_argument("--min-words", type=int, default=LONG_PARAGRAPH_WORDS)
    ap.add_argument("--review-out", help="write paragraphs for review as compact tasks (JSON)")
    ap.add_argument("--review-select", default="flagged",
                    help='"flagged" (default), "all" long paragraphs, or a list like "3/2,10/9"')
    args = ap.parse_args()

    sp = EDITIONS / f"{args.book}-{args.source}.json"
    tp = EDITIONS / f"{args.book}-{args.target}.json"
    src, tgt = json.loads(sp.read_text()), json.loads(tp.read_text())
    overrides = load_overrides(args.book)

    chapters: dict = {}
    review = []
    counts = {s: 0 for s in STATUSES}
    stats = {"long": 0, "words_long": 0, "words_flagged": 0, "overrides_rejected": 0}
    for cs, ct in zip(src["chapters"], tgt["chapters"]):
        num = str(cs["number"])
        if len(cs["paragraphs"]) != len(ct["paragraphs"]):
            print(f"skip chapter {num}: paragraph counts differ", file=sys.stderr)
            continue
        for pi, (a, b) in enumerate(zip(cs["paragraphs"], ct["paragraphs"])):
            sw, tw = a.split(), b.split()
            if max(len(sw), len(tw)) < args.min_words:
                continue
            stats["long"] += 1
            stats["words_long"] += len(sw) + len(tw)
            beads = align(sw, tw)
            draft = segments_from_beads(beads)
            err = validate(draft, len(sw), len(tw))
            if err:
                print(f"{num}/{pi}: first pass produced invalid segments: {err}", file=sys.stderr)
                return 1
            status = "auto-flagged" if any(seg[0] == "u" for seg in draft) else "auto"
            entry = {"status": status, "segments": draft}

            ov = overrides.get(num, {}).get(str(pi))
            if ov is not None:
                segs = ov.get("segments") if isinstance(ov, dict) else pairs_to_segments(ov, len(sw), len(tw))
                ov_status = ov.get("status", "model") if isinstance(ov, dict) else "model"
                err = validate(segs, len(sw), len(tw)) or (None if ov_status in ("model", "human") else f"bad status {ov_status}")
                if err:
                    stats["overrides_rejected"] += 1
                    print(f"override {num}/{pi} rejected, keeping first pass: {err}", file=sys.stderr)
                else:
                    entry = {"status": ov_status, "segments": segs}
                    if isinstance(ov, dict) and ov.get("note"):
                        entry["note"] = ov["note"]

            counts[entry["status"]] += 1
            chapters.setdefault(num, {})[str(pi)] = entry
            if entry["status"] == "auto-flagged":
                stats["words_flagged"] += len(sw) + len(tw)
            sel = args.review_select
            if (sel == "all" or (sel == "flagged" and entry["status"] == "auto-flagged")
                    or f"{num}/{pi}" in sel.split(",")):
                review.append({
                    "chapter": num, "paragraph": pi,
                    "O": [[s, " ".join(sw[s:e])] for s, e in spans(sw)],
                    "M": [[s, " ".join(tw[s:e])] for s, e in spans(tw)],
                    "draft": draft,
                })

    reviewed = counts["model"] + counts["human"]
    out = {
        "format": FORMAT,
        "version": VERSION,
        "bookId": args.book,
        "source": {"edition": args.source, "sha256": sha(sp)},
        "target": {"edition": args.target, "sha256": sha(tp)},
        "offsets": "word index into a whitespace split of the served paragraph; segments are half-open [from, to)",
        "location": "chapters[chapter.number][0-based paragraph index]",
        "minWords": args.min_words,
        "reviewState": "first-pass" if counts["auto"] + counts["auto-flagged"] else "reviewed",
        "counts": counts,
        "approved": None,
        "chapters": chapters,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{args.book}-align.json").write_text(json.dumps(out, separators=(",", ":")) + "\n")
    if args.review_out:
        Path(args.review_out).write_text(json.dumps(review, ensure_ascii=False, indent=0))
    print(json.dumps({**stats, **counts, "reviewed": reviewed}))
    return 1 if stats["overrides_rejected"] else 0


if __name__ == "__main__":
    sys.exit(main())
