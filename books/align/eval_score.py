#!/usr/bin/env python3
"""Score an evaluation batch: how often is the free first pass wrong?

    python3 books/align/eval_score.py a

Reads eval/batch-<x>-input.json (drafts) and eval/batch-<x>-result.json
(model labels + corrected segments). Error rate counts `shift` + `wrong`
over first-pass `m` segments. `refine` is not an error. These labels are
model review, not human verification.
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build_alignment import validate  # noqa: E402

M_LABELS = {"ok", "refine", "shift", "wrong"}
U_LABELS = {"u-needed", "u-resolvable"}


def para_len(sentences) -> int:
    last_start, text = sentences[-1]
    return last_start + len(text.split())


def main() -> int:
    batch = sys.argv[1]
    inputs = json.loads((HERE / "eval" / f"batch-{batch}-input.json").read_text())
    result = json.loads((HERE / "eval" / f"batch-{batch}-result.json").read_text())
    drafts = {(x["book"], str(x["chapter"]), str(x["paragraph"])): x for x in inputs}
    per_book: dict[str, Counter] = {}
    rejected = 0
    seen = set()
    for item in result["items"]:
        key = (item["book"], str(item["chapter"]), str(item["paragraph"]))
        x = drafts.get(key)
        err = None if x else "not in input"
        if x:
            labels = item.get("labels", [])
            if len(labels) != len(x["draft"]):
                err = f"{len(labels)} labels for {len(x['draft'])} draft segments"
            else:
                for seg, lab in zip(x["draft"], labels):
                    ok = M_LABELS if seg[0] == "m" else U_LABELS if seg[0] == "u" else M_LABELS | U_LABELS
                    if lab not in ok:
                        err = f"label {lab!r} not valid for a {seg[0]!r} segment"
                        break
            err = err or validate(item.get("segments"), para_len(x["O"]), para_len(x["M"]))
        if err:
            rejected += 1
            print(f"rejected {key}: {err}", file=sys.stderr)
            continue
        seen.add(key)
        c = per_book.setdefault(key[0], Counter())
        c["paragraphs"] += 1
        for seg, lab in zip(x["draft"], item["labels"]):
            c[lab] += 1
            if seg[0] == "m":
                c["m_segments"] += 1
                c["m_words"] += seg[2] - seg[1]
    missing = [k for k in drafts if k not in seen]
    total = Counter()
    for book, c in sorted(per_book.items()):
        total.update(c)
        errs = c["shift"] + c["wrong"]
        print(f"{book:22s} paras {c['paragraphs']:2d}  m-segments {c['m_segments']:3d}  "
              f"ok {c['ok']} refine {c['refine']} shift {c['shift']} wrong {c['wrong']}  "
              f"u-needed {c['u-needed']} u-resolvable {c['u-resolvable']}  "
              f"error rate {errs / max(1, c['m_segments']):.1%}")
    errs = total["shift"] + total["wrong"]
    print(f"SUMMARY batch {batch}: {total['paragraphs']} paragraphs, {total['m_segments']} first-pass matches, "
          f"{total['shift']} shift + {total['wrong']} wrong = {errs / max(1, total['m_segments']):.1%} error rate "
          f"(model review); rejected {rejected}; missing {len(missing)}")
    return 1 if rejected else 0


if __name__ == "__main__":
    sys.exit(main())
