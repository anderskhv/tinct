#!/usr/bin/env python3
"""Modern-edition similarity classifier and QA gate.

Rebuild of the audit instrument that caught the 2026-05 mechanical-modernization
failure (539 chapters shipped as "modern-en" that were regex cleanup of the
original). See books/MODERN-EN-REPAIR-STATUS.md for the methodology and
calibration evidence.

Per-chapter similarity between a baseline edition (default original-en) and a
target edition (default modern-en), weighted by paragraph length. Buckets:

  MECHANICAL  sim >= 0.97  virtually unchanged (comma swaps, quote styles)
  LIGHT       0.85 - 0.97  dictionary lemma replacement, still not modern
  REAL        0.50 - 0.85  genuine sentence-level rewrites
  REAL-HEAVY  sim <  0.50  heavy paragraph-by-paragraph modernization

Usage:
  python3 books/classify-modern-en.py <book-id>                    report
  python3 books/classify-modern-en.py <book-id> --gate             QA gate (exit 1 on fail)
  python3 books/classify-modern-en.py <book-id> --chapters 1-8     restrict to a batch
  python3 books/classify-modern-en.py <book-id> --per-chapter      chapter-level detail

Gate criteria (a modern edition is publication-grade only if ALL hold):
  1. length-weighted mean chapter similarity <= 0.75
  2. LIGHT + MECHANICAL chapters <= 5% of chapters checked
  3. byte-identical long paragraphs (>= 80 chars) <= 5%

Similarity here is word-token SequenceMatcher ratio — the scale runs HIGHER
than the character-level metric in the 2026-05 audit (do not compare numbers
across the two). Calibration on this metric, 2026-06-10:
  wealth-of-nations (known mechanical)  0.997, 80% identical   -> FAIL
  don-quixote (partial repair)          0.831, 47% light+mech  -> FAIL
  anna-karenina (verified repair)       0.705, 0.4% identical  -> PASS
  essays-montaigne (repaired)           0.696                  -> PASS
  leviathan (verified repair)           0.619                  -> PASS
A faithful modernization of an already-readable Victorian translation
(Garnett-style) lands ~0.65-0.75; early-modern prose lands lower.

The gate MUST pass on modern-en before modern-da or audio work starts
(books/AGENTS.md, "Modern English"). Run it per-batch with --chapters during
rendering, and on the whole book before handing off.
"""
import argparse
import json
import sys
from difflib import SequenceMatcher
from pathlib import Path

EDITIONS_DIR = Path(__file__).resolve().parent.parent / "app/public/data/editions"


def load(book_id, edition):
    path = EDITIONS_DIR / f"{book_id}-{edition}.json"
    if not path.exists():
        sys.exit(f"missing edition file: {path}")
    return json.loads(path.read_text())


def para_similarity(a, b):
    if a == b:
        return 1.0
    return SequenceMatcher(None, a.split(), b.split()).ratio()


def chapter_similarity(base_ch, target_ch):
    """Length-weighted mean paragraph similarity for one chapter."""
    pairs = list(zip(base_ch.get("paragraphs", []), target_ch.get("paragraphs", [])))
    if not pairs:
        return 1.0
    total_w = 0.0
    acc = 0.0
    for a, b in pairs:
        w = max(len(a.split()), 1)
        acc += para_similarity(a, b) * w
        total_w += w
    return acc / total_w


def bucket(sim):
    if sim >= 0.97:
        return "MECHANICAL"
    if sim >= 0.85:
        return "LIGHT"
    if sim >= 0.50:
        return "REAL"
    return "REAL-HEAVY"


def parse_range(spec, n):
    if not spec:
        return range(1, n + 1)
    lo, _, hi = spec.partition("-")
    return range(int(lo), int(hi or lo) + 1)


def is_wrapped(s):
    """True if a paragraph still carries leaked JSON-list scaffolding,
    e.g. ["...verse / verse..."] (modern-en) or [»...«] (modern-da)."""
    s = s.strip()
    return (s.startswith('["') and s.endswith('"]')) or \
           (s.startswith("[»") and s.endswith("«]"))


def is_truncation(base_p, target_p):
    """True if the rendering elided source content with an ellipsis: the
    target has ... / … the baseline lacks AND is materially shorter. Catches
    summarized quotations (the rules forbid condensing quoted passages)."""
    def ell(x):
        return "..." in x or "…" in x
    if not ell(target_p) or ell(base_p):
        return False
    return len(target_p.split()) < len(base_p.split()) * 0.92


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("book_id")
    ap.add_argument("--baseline", default="original-en")
    ap.add_argument("--edition", default="modern-en")
    ap.add_argument("--chapters", default=None, help="e.g. 1-8")
    ap.add_argument("--per-chapter", action="store_true")
    ap.add_argument("--gate", action="store_true", help="exit 1 unless gate criteria pass")
    args = ap.parse_args()

    base = load(args.book_id, args.baseline)["chapters"]
    target = load(args.book_id, args.edition)["chapters"]

    if len(base) != len(target):
        sys.exit(f"GATE FAIL (structure): chapter count {len(base)} vs {len(target)}")
    misaligned = [
        c.get("number", i + 1)
        for i, (a, b) in enumerate(zip(base, target))
        if len(a.get("paragraphs", [])) != len(b.get("paragraphs", []))
    ]
    if misaligned:
        sys.exit(f"GATE FAIL (alignment): paragraph counts differ in chapters {misaligned[:10]}")

    wanted = set(parse_range(args.chapters, len(base)))
    counts = {"MECHANICAL": 0, "LIGHT": 0, "REAL": 0, "REAL-HEAVY": 0}
    weighted_acc = 0.0
    weighted_total = 0.0
    identical = 0
    long_paras = 0
    wrapped_hits = []
    trunc_hits = []

    for i, (a, b) in enumerate(zip(base, target), 1):
        if i not in wanted:
            continue
        sim = chapter_similarity(a, b)
        words = sum(len(p.split()) for p in a.get("paragraphs", []))
        weighted_acc += sim * words
        weighted_total += words
        counts[bucket(sim)] += 1
        for pi, (p, q) in enumerate(zip(a["paragraphs"], b["paragraphs"])):
            if len(p) >= 80:
                long_paras += 1
                if p == q:
                    identical += 1
            if is_wrapped(q):
                wrapped_hits.append(f"ch{i} p{pi}")
            if is_truncation(p, q):
                trunc_hits.append(f"ch{i} p{pi}")
        if args.per_chapter:
            print(f"  ch {i:>4}  sim {sim:.3f}  {bucket(sim):<10}  {a.get('title','')[:50]}")

    n = sum(counts.values())
    if n == 0:
        sys.exit("no chapters in range")
    mean_sim = weighted_acc / weighted_total if weighted_total else 1.0
    ident_rate = identical / long_paras if long_paras else 0.0
    light_mech_rate = (counts["LIGHT"] + counts["MECHANICAL"]) / n

    print(f"{args.book_id} {args.baseline} -> {args.edition}  ({n} chapters)")
    print(f"  weighted similarity : {mean_sim:.3f}   (gate: <= 0.75)")
    print(f"  light+mechanical    : {counts['LIGHT'] + counts['MECHANICAL']}/{n} = {light_mech_rate:.1%}   (gate: <= 5%)")
    print(f"  identical long paras: {identical}/{long_paras} = {ident_rate:.1%}   (gate: <= 5%)")
    print(f"  buckets: REAL-HEAVY {counts['REAL-HEAVY']}  REAL {counts['REAL']}  "
          f"LIGHT {counts['LIGHT']}  MECHANICAL {counts['MECHANICAL']}")
    print(f"  wrapped scaffolding : {len(wrapped_hits)}   (gate: 0)"
          + (f"   e.g. {', '.join(wrapped_hits[:8])}" if wrapped_hits else ""))
    print(f"  truncated quotations: {len(trunc_hits)}   (gate: 0)"
          + (f"   e.g. {', '.join(trunc_hits[:8])}" if trunc_hits else ""))

    if args.gate:
        ok = (mean_sim <= 0.75 and light_mech_rate <= 0.05 and ident_rate <= 0.05
              and not wrapped_hits and not trunc_hits)
        print("GATE PASS" if ok else "GATE FAIL")
        sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
