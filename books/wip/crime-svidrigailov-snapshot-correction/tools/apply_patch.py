#!/usr/bin/env python3
"""Apply PATCH.json to a card file and validate the result.

Usage:
  python3 apply_patch.py [--card PATH] [--out PATH]

Defaults: --card inputs/crime-and-punishment.v1.json, --out a temporary file.
Refuses to apply unless the input's sha256 equals PATCH.json baselineSha256
and every operation's old value / absence matches. It then:
  - checks the only differences from the baseline are the declared ones;
  - mirrors the runtime asset checks in app/src/services/characters/characterCards.ts
    (valid points, availableAt >= firstMention, string fields) for both editions
    against the pinned live editions, and for modern-en also against the accepted
    candidate (so the new anchor survives the candidate integration);
  - simulates releasedCard at the reading positions that matter;
  - prints the sha256 of the patched file.
Never writes to the live card unless --out names it explicitly.
"""
import argparse
import copy
import hashlib
import json
import re
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INP = ROOT / "inputs"


def norm(t):
    return re.sub(r" {2,}", " ", t.replace("\n", " "))


def u16len(t):
    return len(t.encode("utf-16-le")) // 2


def cmp(a, b):
    x = (a["chapterNumber"], a["paragraphIndex"], a["offset"])
    y = (b["chapterNumber"], b["paragraphIndex"], b["offset"])
    return (x > y) - (x < y)


def released(ch, cutoff):
    if cmp(ch["firstMention"], cutoff) > 0:
        return None
    s = [x for x in ch["snapshots"] if cmp(x["availableAt"], cutoff) <= 0]
    return max(s, key=lambda x: (x["availableAt"]["chapterNumber"], x["availableAt"]["paragraphIndex"], x["availableAt"]["offset"]))["id"] if s else None


def apply(card, patch):
    out = copy.deepcopy(card)
    for op in patch["operations"]:
        ch = next(c for c in out["editions"][op["edition"]]["characters"] if c["id"] == "svidrigailov")
        ids = [s["id"] for s in ch["snapshots"]]
        if op["op"] == "replace":
            s = next(x for x in ch["snapshots"] if x["id"] == "svidrigailov-1")
            if s["body"] != op["old"]:
                sys.exit(f"old value mismatch in {op['edition']}")
            s["body"] = op["new"]
        else:
            if op["absentBefore"] in ids:
                sys.exit(f"{op['absentBefore']} already present in {op['edition']}")
            ch["snapshots"].insert(ids.index(op["after"]) + 1, op["value"])
    return out


def validate_edition(e, chapters, label):
    paras = {i + 1: [norm(p) for p in c["paragraphs"]] for i, c in enumerate(chapters)}
    ok = lambda p: isinstance(p.get("offset"), int) and p["offset"] >= 0 and p["paragraphIndex"] < len(paras.get(p["chapterNumber"], [])) \
        and p["offset"] <= u16len(paras[p["chapterNumber"]][p["paragraphIndex"]])
    errs = []
    for c in e["characters"]:
        for s in c["snapshots"]:
            if not ok(s["availableAt"]) or cmp(s["availableAt"], c["firstMention"]) < 0 or not all(isinstance(s[k], str) for k in ("name", "subtitle", "body")):
                errs.append(f"{label}: {s['id']} invalid")
            for ev in s.get("evidence", []):
                pt = {"chapterNumber": ev["chapterNumber"], "paragraphIndex": ev["paragraphIndex"], "offset": ev["throughOffset"]}
                if not ok(pt) or cmp(pt, s["availableAt"]) > 0:
                    errs.append(f"{label}: {s['id']} evidence {pt} invalid or after availableAt")
    return errs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--card", default=str(INP / "crime-and-punishment.v1.json"))
    ap.add_argument("--out")
    a = ap.parse_args()
    patch = json.loads((ROOT / "PATCH.json").read_text())
    raw = Path(a.card).read_bytes()
    if hashlib.sha256(raw).hexdigest() != patch["baselineSha256"]:
        sys.exit("baseline sha256 mismatch: reconcile against the newer card before applying")
    card = json.loads(raw)
    new = apply(card, patch)

    # Only declared differences.
    for ed in card["editions"]:
        a_ed, b_ed = copy.deepcopy(card["editions"][ed]), copy.deepcopy(new["editions"][ed])
        for x in (a_ed, b_ed):
            for c in x["characters"]:
                if c["id"] == "svidrigailov":
                    c["snapshots"] = None
        assert a_ed == b_ed, f"undeclared change in {ed}"
    assert {k: v for k, v in card.items() if k != "editions"} == {k: v for k, v in new.items() if k != "editions"}

    errs = []
    eds = {"original-en": json.loads((INP / "source.json").read_text())["chapters"],
           "modern-en": json.loads((INP / "baseline-live-modern-en.json").read_text())["chapters"]}
    for ed, chs in eds.items():
        errs += validate_edition(new["editions"][ed], chs, ed + "@live")
    # Against the accepted candidate: apply the declared candidate coordinates to the new snapshot
    # (evidence in changed paragraphs is re-derived at integration, like every other anchor).
    cand_ed = copy.deepcopy(new["editions"]["modern-en"])
    cc = patch["candidateCoordinates"]
    s2 = next(c for c in cand_ed["characters"] if c["id"] == "svidrigailov")["snapshots"][1]
    if s2["availableAt"] != cc["availableAt"]:
        print("note: candidate availableAt differs from live:", s2["availableAt"], "->", cc["availableAt"])
    s2["availableAt"], s2["evidence"] = cc["availableAt"], cc["evidence"]
    cand_ed["characters"] = [c for c in cand_ed["characters"] if c["id"] == "svidrigailov"]  # other characters' anchors are the separate re-anchoring task
    for c in cand_ed["characters"]:
        c["snapshots"] = [x for x in c["snapshots"] if x["id"] == "svidrigailov-2"]
        c["firstMention"] = {"chapterNumber": 3, "paragraphIndex": 38, "offset": 0}
    errs += validate_edition(cand_ed, json.loads((INP / "candidate.json").read_text())["chapters"], "modern-en@candidate-18be4155")
    print("candidate coordinates for svidrigailov-2:", json.dumps(cc["availableAt"]), json.dumps(cc["evidence"]))

    # Reading-position simulation.
    print("released snapshot by reading position:")
    for ed in ("original-en", "modern-en"):
        ch = next(c for c in new["editions"][ed]["characters"] if c["id"] == "svidrigailov")
        s2 = ch["snapshots"][1]["availableAt"]
        points = [("first mention 3.38", ch["firstMention"]),
                  ("end of 16.73 (Marfa dead)", {"chapterNumber": 16, "paragraphIndex": 73, "offset": 10**6}),
                  ("21.2 (he introduces himself)", {"chapterNumber": 21, "paragraphIndex": 2, "offset": 0}),
                  ("22.37 one unit before end", {**s2, "offset": s2["offset"] - 1}),
                  ("22.37 end", s2),
                  ("41.7 (late)", {"chapterNumber": 41, "paragraphIndex": 7, "offset": 0})]
        for label, pt in points:
            print(f"  {ed:12} {label:32} -> {released(ch, pt)}")

    body = lambda ed, i: next(c for c in new["editions"][ed]["characters"] if c["id"] == "svidrigailov")["snapshots"][i]["body"]
    for ed in eds:
        if "widowed" in body(ed, 0) or "Petersburg" in body(ed, 0):
            errs.append(f"{ed}: premature detail still in svidrigailov-1")

    out = json.dumps(new, indent=2, ensure_ascii=False).encode() + b"\n"
    dest = Path(a.out) if a.out else Path(tempfile.gettempdir()) / "crime-and-punishment.v1.patched.json"
    dest.write_bytes(out)
    for e in errs:
        print("ERROR", e)
    print("errors", len(errs))
    print("patched sha256", hashlib.sha256(out).hexdigest(), "->", dest)
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main())
