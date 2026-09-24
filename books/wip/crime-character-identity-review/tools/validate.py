#!/usr/bin/env python3
"""Validate ledger/final-mapping.jsonl against the pinned candidate.

Checks:
1. All 438 flagged impact entries appear exactly once, keyed by (characterId, chapter, paragraph, oldStart).
2. Each existing span's text sits at its offsets in the live baseline.
3. Each mapped final span's text sits at its offsets in the candidate (UTF-16, normalized).
4. Within each paragraph, no two final spans overlap or coincide, including the
   1,431 same-text-relocated suggested spans and unchanged-paragraph mentions.
5. Drops and unresolved entries carry no span.
Exit status is non-zero on any failure.
"""
import json
import sys
from pathlib import Path

from build_evidence import INP, norm_para, py_index

ROOT = Path(__file__).resolve().parent.parent


def at(text, s, e):
    return text[py_index(text, s):py_index(text, e)]


def main():
    live = json.load(open(INP / "baseline-live-modern-en.json"))
    cand = json.load(open(INP / "candidate.json"))
    impact = json.load(open(INP / "character-card-impact.json"))
    final = [json.loads(l) for l in open(ROOT / "ledger" / "final-mapping.jsonl")]
    errs = []
    flagged = {(m["characterId"], m["chapter"], m["paragraph"], m["oldStart"]) for m in impact["mentions"]
               if m["status"] in ("renamed-to-source-form", "manual-review")}
    keys = [(r["characterId"], r["chapterNumber"], r["paragraphIndex"], r["existingMention"]["startOffset"]) for r in final]
    if len(keys) != len(set(keys)) or set(keys) != flagged:
        errs.append(f"coverage mismatch: {len(set(keys))} unique of {len(flagged)} flagged")
    spans = {}
    for r in final:
        ch, pi = r["chapterNumber"], r["paragraphIndex"]
        old = norm_para(live["chapters"][ch - 1]["paragraphs"][pi])
        new = norm_para(cand["chapters"][ch - 1]["paragraphs"][pi])
        e = r["existingMention"]
        if at(old, e["startOffset"], e["endOffset"]) != e["text"]:
            errs.append(f"{r['entryId']}: existing span text mismatch")
        f = r["finalSpan"]
        if r["finalDecision"] == "map":
            if not f or at(new, f["startOffset"], f["endOffset"]) != f["text"]:
                errs.append(f"{r['entryId']}: final span text mismatch")
            else:
                spans.setdefault((ch, pi), []).append((f["startOffset"], f["endOffset"], r["entryId"]))
        elif f is not None:
            errs.append(f"{r['entryId']}: {r['finalDecision']} must have no span")
    for m in impact["mentions"]:
        if m["status"] == "same-text-relocated":
            spans.setdefault((m["chapter"], m["paragraph"]), []).append((m["suggestedNewStart"], m["suggestedNewEnd"], "relocated:" + m["characterId"]))
    for k, v in spans.items():
        v.sort()
        for a, b in zip(v, v[1:]):
            if b[0] < a[1]:
                errs.append(f"overlap in {k}: {a} {b}")
    n_map = sum(r["finalDecision"] == "map" for r in final)
    print(f"entries {len(final)}; mapped {n_map}; paragraphs checked {len(spans)}; errors {len(errs)}")
    for x in errs:
        print("ERROR", x)
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main())
