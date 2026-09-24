#!/usr/bin/env python3
"""Supplementary cross-check (outside the 438-entry decision scope).

Runs the same folded-token alignment as build_evidence.py over all 1,869 live
mentions in changed paragraphs, including the 1,431 `same-text-relocated`
suggestions, and reports every mention whose aligned candidate span disagrees
with the script-suggested span or does not align at all. It also lists
candidate occurrences of a bound character's name forms, in the reviewed
paragraphs, that no live mention maps to (new, unbound occurrences created by
restored omissions or access-reference edits).

Writes evidence/crosscheck.json. Offline and deterministic.
"""
import json
import re
from pathlib import Path

from build_evidence import INP, OUT, align, fold, norm_para, py_index, tokens, u16

ROOT = Path(__file__).resolve().parent.parent


def main():
    live = json.load(open(INP / "baseline-live-modern-en.json"))
    cand = json.load(open(INP / "candidate.json"))
    impact = json.load(open(INP / "character-card-impact.json"))
    cards = json.load(open(INP / "crime-and-punishment.v1.json"))["editions"]["modern-en"]["mentions"]

    disagreements, mapped_targets = [], {}
    for m in impact["mentions"]:
        ch, pi = m["chapter"], m["paragraph"]
        old = norm_para(live["chapters"][ch - 1]["paragraphs"][pi])
        new = norm_para(cand["chapters"][ch - 1]["paragraphs"][pi])
        s = py_index(old, m["oldStart"])
        a = align(old, new, s, s + len(m["text"]))
        got = (u16(new, a["start"]), u16(new, a["end"])) if "start" in a else None
        if got:
            mapped_targets.setdefault((ch, pi), set()).add(got)
        want = (m.get("suggestedNewStart"), m.get("suggestedNewEnd")) if "suggestedNewStart" in m else None
        if m["status"] == "manual-review":
            continue
        if got != want:
            disagreements.append({"characterId": m["characterId"], "chapter": ch, "paragraph": pi,
                                  "status": m["status"], "text": m["text"], "oldStart": m["oldStart"],
                                  "suggested": want, "aligned": got, "method": a["method"]})

    # Unbound new occurrences in paragraphs of the 438 reviewed entries.
    reviewed = {(m["chapter"], m["paragraph"]) for m in impact["mentions"]
                if m["status"] in ("renamed-to-source-form", "manual-review")}
    by_para = {}
    for m in cards:
        by_para.setdefault((m["chapterNumber"], m["paragraphIndex"]), []).append(m)
    additions = []
    for (ch, pi) in sorted(reviewed):
        new = norm_para(cand["chapters"][ch - 1]["paragraphs"][pi])
        nt = tokens(new)
        forms = {}
        for m in by_para.get((ch, pi), []):
            seq = tuple(t[2] for t in tokens(m["text"]))
            forms[seq] = m["characterId"]
        for seq, cid in forms.items():
            n = len(seq)
            for j in range(len(nt) - n + 1):
                if tuple(t[2] for t in nt[j:j + n]) == seq:
                    span = (u16(new, nt[j][0]), u16(new, nt[j + n - 1][1]))
                    # Skip spans inside a longer mapped span (e.g. "Pyotr Petrovitch" inside "Pyotr Petrovitch Luzhin").
                    if any(a <= span[0] and span[1] <= b for a, b in mapped_targets.get((ch, pi), ())):
                        continue
                    a0, b0 = nt[j][0], nt[j + n - 1][1]
                    additions.append({"characterId": cid, "chapter": ch, "paragraph": pi,
                                      "startOffset": span[0], "endOffset": span[1], "text": new[a0:b0],
                                      "context": new[max(0, a0 - 90):a0] + "⟦" + new[a0:b0] + "⟧" + new[b0:b0 + 60]})
    out = {"mentionsChecked": len(impact["mentions"]),
           "nonManualChecked": sum(1 for m in impact["mentions"] if m["status"] != "manual-review"),
           "disagreements": disagreements, "unboundNewOccurrencesInReviewedParagraphs": additions}
    (OUT / "crosscheck.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    print(out["mentionsChecked"], out["nonManualChecked"], "disagreements:", len(disagreements), "additions:", len(additions))


if __name__ == "__main__":
    main()
