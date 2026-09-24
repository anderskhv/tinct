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
            sid, field = op["path"][-2]["id"], op["path"][-1]
            s = next(x for x in ch["snapshots"] if x["id"] == sid)
            if s[field] != op["old"]:
                sys.exit(f"old value mismatch in {op['edition']} {sid}.{field}")
            s[field] = op["new"]
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
    ap.add_argument("--patch", default="PATCH.json")
    ap.add_argument("--card")
    ap.add_argument("--out")
    a = ap.parse_args()
    patch = json.loads((ROOT / a.patch).read_text())
    raw = Path(a.card or INP / patch["baselineInput"]).read_bytes()
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
    eds = {ed: json.loads((INP / f).read_text())["chapters"] for ed, f in patch["editionInputs"].items()}
    for ed, chs in eds.items():
        errs += validate_edition(new["editions"][ed], chs, f"{ed}@{patch['editionInputs'][ed]}")
    # Against the accepted candidate: apply the declared candidate coordinates to the new snapshots
    # (snapshot 1 and other characters' anchors are the separate re-anchoring task in the identity review).
    cand_ed = copy.deepcopy(new["editions"]["modern-en"])
    cc = patch.get("candidateCoordinates", {}).get("snapshots", {})
    ch = next(c for c in cand_ed["characters"] if c["id"] == "svidrigailov")
    for x in ch["snapshots"]:
        if x["id"] in cc:
            x["availableAt"], x["evidence"] = cc[x["id"]]["availableAt"], cc[x["id"]]["evidence"]
    ch["snapshots"] = [x for x in ch["snapshots"] if x["id"] in cc]
    ch["firstMention"] = {"chapterNumber": 3, "paragraphIndex": 38, "offset": 2536}  # accepted mention R025
    cand_ed["characters"] = [ch]
    errs += validate_edition(cand_ed, json.loads((INP / "candidate.json").read_text())["chapters"], "modern-en@candidate-18be4155")
    for sid, v in cc.items():
        print(f"candidate coordinates for {sid}:", json.dumps(v["availableAt"]), json.dumps(v["evidence"]))

    # Reading-position simulation.
    print("released snapshot by reading position:")
    expect = {}
    for ed in ("original-en", "modern-en"):
        ch = next(c for c in new["editions"][ed]["characters"] if c["id"] == "svidrigailov")
        ids = [x["id"] for x in ch["snapshots"]]
        if ids != ["svidrigailov-1", "svidrigailov-2", "svidrigailov-3"]:
            errs.append(f"{ed}: snapshot order {ids}")
        a2, a3 = ch["snapshots"][1]["availableAt"], ch["snapshots"][2]["availableAt"]
        points = [("before first mention", {**ch["firstMention"], "offset": ch["firstMention"]["offset"] - 1}, None),
                  ("first mention 3.38", ch["firstMention"], "svidrigailov-1"),
                  ("3.38 one unit before end", {**a2, "offset": a2["offset"] - 1}, "svidrigailov-1"),
                  ("3.38 end", a2, "svidrigailov-2"),
                  ("end of 16.73 (Marfa dead)", {"chapterNumber": 16, "paragraphIndex": 73, "offset": 10**6}, "svidrigailov-2"),
                  ("21.2 (he introduces himself)", {"chapterNumber": 21, "paragraphIndex": 2, "offset": 0}, "svidrigailov-2"),
                  ("22.34 one unit before end", {**a3, "offset": a3["offset"] - 1}, "svidrigailov-2"),
                  ("22.34 end", a3, "svidrigailov-3"),
                  ("41.7 (late)", {"chapterNumber": 41, "paragraphIndex": 7, "offset": 0}, "svidrigailov-3")]
        for label, pt, want in points:
            got = released(ch, pt)
            print(f"  {ed:12} {label:32} -> {got}")
            if got != want:
                errs.append(f"{ed}: {label} released {got}, expected {want}")

    # Claims that must not appear before their release point.
    snap = lambda ed, i: next(c for c in new["editions"][ed]["characters"] if c["id"] == "svidrigailov")["snapshots"][i]
    banned = {0: ["widow", "Petersburg", "rumor", "terrible", "Wealthy", "wealthy", "nsettling", "pursued", "dark reputation"],
              1: ["widow", "Petersburg", "rumor", "terrible", "Wealthy", "wealthy", "dark reputation"],
              2: ["Wealthy", "wealthy"]}
    for ed in eds:
        for i, words in banned.items():
            text = snap(ed, i)["subtitle"] + " " + snap(ed, i)["body"]
            for w in words:
                if w in text:
                    errs.append(f"{ed}: '{w}' in {snap(ed, i)['id']}")

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
