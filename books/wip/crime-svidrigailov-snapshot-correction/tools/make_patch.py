#!/usr/bin/env python3
"""Declare the Svidrigaïlov snapshot correction and write PATCH.json.

Content-only, offline and deterministic. The editorial wording is declared
here. Anchors are computed from the pinned editions: paragraph-end offsets are
UTF-16 lengths of the prose-reader-v1 normalized paragraph, as the runtime's
validPoint requires.

Operations per edition (original-en and modern-en), both against the pinned
baseline card, sha256 2125526c...:
  1. replace characters[svidrigailov].snapshots[svidrigailov-1].body
  2. insert snapshot svidrigailov-2 directly after svidrigailov-1
No other field changes: names, subtitles, IDs, anchors of snapshot 1, mentions,
paragraph hashes, coverage and contentVersion stay as they are.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INP = ROOT / "inputs"

OLD_BODY = ("Wealthy, unsettling, and recently widowed, he pursued Dunya while she worked in his household and is rumored "
            "to be responsible for terrible things. His arrival in St. Petersburg alarms the whole Raskolnikov family.")
# Removal only: "recently widowed" and the arrival sentence are deleted; nothing else is reworded.
NEW_BODY_1 = ("Wealthy and unsettling, he pursued Dunya while she worked in his household and is rumored "
              "to be responsible for terrible things.")
# Deferred snapshot: the original first-encounter body, verbatim, released where every clause is supported.
BODY_2 = OLD_BODY
EDITIONS = {"original-en": "source.json", "modern-en": "baseline-live-modern-en.json"}
# (chapter, paragraph) evidence points, each released at paragraph end.
EVIDENCE_POINTS = [(16, 73), (17, 49), (22, 31), (22, 34)]
RELEASE_POINT = (22, 34)
BASIS_2 = ("Deferred from svidrigailov-1 by the 2026-09-24 correction; body is the original first-encounter text, unchanged. "
           "Marfa Petrovna's death (so his widowhood) is established at 16.73; the rumor that he caused it (\"They say he beat her dreadfully\") at 17.49; "
           "the family learns he has come to St. Petersburg, and is alarmed, at 22.31-22.34 (the reader first meets him there at 20.68). "
           "Released at the end of the reviewed source paragraph 22.34, the earliest point at which every clause is supported.")


def norm(t):
    return re.sub(r" {2,}", " ", t.replace("\n", " "))


def u16len(t):
    return len(t.encode("utf-16-le")) // 2


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def main():
    base = json.loads((INP / "crime-and-punishment.v1.json").read_text())
    ops = []
    for ed, fname in EDITIONS.items():
        chapters = json.loads((INP / fname).read_text())["chapters"]
        plen = lambda c, p: u16len(norm(chapters[c - 1]["paragraphs"][p]))
        e = base["editions"][ed]
        assert e["sourceSha256"] == sha(INP / fname), ed
        ch = next(c for c in e["characters"] if c["id"] == "svidrigailov")
        assert [s["id"] for s in ch["snapshots"]] == ["svidrigailov-1"]
        s1 = ch["snapshots"][0]
        assert s1["body"] == OLD_BODY, ed
        c, p = RELEASE_POINT
        snap2 = {
            "id": "svidrigailov-2",
            "availableAt": {"chapterNumber": c, "paragraphIndex": p, "offset": plen(c, p)},
            "name": s1["name"],
            "subtitle": s1["subtitle"],
            "body": BODY_2,
            "evidence": [{"chapterNumber": c2, "paragraphIndex": p2, "throughOffset": plen(c2, p2)} for c2, p2 in EVIDENCE_POINTS],
            "editorialBasis": BASIS_2,
        }
        ops.append({"edition": ed, "op": "replace", "path": ["editions", ed, "characters", {"id": "svidrigailov"}, "snapshots", {"id": "svidrigailov-1"}, "body"],
                    "old": OLD_BODY, "new": NEW_BODY_1})
        ops.append({"edition": ed, "op": "insert-after", "path": ["editions", ed, "characters", {"id": "svidrigailov"}, "snapshots"],
                    "after": "svidrigailov-1", "absentBefore": "svidrigailov-2", "value": snap2})
    # Candidate (accepted modern-en 18be4155) coordinates for the new snapshot, for use when
    # Codex re-anchors the card to the candidate. Same paragraphs, paragraph-end offsets.
    cand = json.loads((INP / "candidate.json").read_text())["chapters"]
    clen = lambda c, p: u16len(norm(cand[c - 1]["paragraphs"][p]))
    c, p = RELEASE_POINT
    cand_equiv = {"edition": "modern-en", "appliesTo": "accepted candidate sha256 18be4155...",
                  "availableAt": {"chapterNumber": c, "paragraphIndex": p, "offset": clen(c, p)},
                  "evidence": [{"chapterNumber": c2, "paragraphIndex": p2, "throughOffset": clen(c2, p2)} for c2, p2 in EVIDENCE_POINTS]}
    patch = {
        "schema": "tinct-card-field-patch/1",
        "bookId": "crime-and-punishment",
        "purpose": "Remove premature facts from Svidrigaïlov's first-encounter card and defer them to the end of 22.34.",
        "targets": ["app/public/data/characters/crime-and-punishment.v1.json",
                    "books/characters/crime-and-punishment/characters.v1.json"],
        "baselineSha256": sha(INP / "crime-and-punishment.v1.json"),
        "serialization": "json.dumps(indent=2, ensure_ascii=False) + '\\n' (matches the baseline byte for byte)",
        "operations": ops,
        "candidateCoordinates": cand_equiv,
    }
    (ROOT / "PATCH.json").write_text(json.dumps(patch, indent=2, ensure_ascii=False) + "\n")
    print("PATCH.json", sha(ROOT / "PATCH.json"))


if __name__ == "__main__":
    main()
