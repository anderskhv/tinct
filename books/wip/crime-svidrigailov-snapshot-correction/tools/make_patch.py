#!/usr/bin/env python3
"""Declare the Svidrigaïlov snapshot correction and write PATCH.json.

Content-only, offline and deterministic. The editorial wording is declared
here. Anchors are computed from the pinned editions: paragraph-end offsets are
UTF-16 lengths of the prose-reader-v1 normalized paragraph, as the runtime's
validPoint requires.

Principle: every claim in a snapshot must be supported by the text at that
snapshot's availableAt, subject only to the card policy's ordinary-identity
allowance for first-encounter cards (no surprises or later developments).

Per edition (original-en and modern-en), against the pinned baseline card
(sha256 2125526c...), character `svidrigailov`:
  1. svidrigailov-1 (first mention, 3.38 at the end of the name):
     replace `subtitle` and `body` with claims established before the name.
  2. insert svidrigailov-2 at the end of 3.38 (the letter's reveal of his pursuit).
  3. insert svidrigailov-3 at the end of 22.34 (widowhood, rumor, arrival, alarm).
Names, IDs, snapshot-1 anchors/evidence/editorialBasis, mentions, paragraph
hashes, other characters, coverage and contentVersion stay as they are.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INP = ROOT / "inputs"

OLD_SUBTITLE = "Dunya's former employer, with a dark reputation"
OLD_BODY = ("Wealthy, unsettling, and recently widowed, he pursued Dunya while she worked in his household and is rumored "
            "to be responsible for terrible things. His arrival in St. Petersburg alarms the whole Raskolnikov family.")

# Snapshot 1: only what the letter says before the name.
S1_SUBTITLE = "Dunya's former employer"
S1_BODY = "Dunya worked as a governess in his household, where she had a hard time."
# Snapshot 2: end of 3.38; wording taken from the original body, minus unsupported words.
S2_SUBTITLE = "Dunya's former employer"
S2_BODY = "Unsettling, he pursued Dunya while she worked in his household."
S2_POINT = (3, 38)
S2_EVIDENCE = [(3, 38)]
S2_BASIS = ("Added by the 2026-09-24 correction; wording taken from the original first-encounter body. "
            "The mother's letter, after the first mention, reveals as a surprise that he had hidden a passion for Dunya "
            "behind rudeness and drunken mockery and made her an open, shameless proposal. "
            "Released at the end of the reviewed source paragraph 3.38.")
# Snapshot 3: end of 22.34; the original subtitle, and the original body without the unsupported "Wealthy".
S3_SUBTITLE = OLD_SUBTITLE
S3_BODY = ("Unsettling and recently widowed, he pursued Dunya while she worked in his household and is rumored "
           "to be responsible for terrible things. His arrival in St. Petersburg alarms the whole Raskolnikov family.")
S3_POINT = (22, 34)
S3_EVIDENCE = [(16, 73), (17, 49), (22, 31), (22, 34)]
S3_BASIS = ("Deferred from svidrigailov-1 by the 2026-09-24 correction; the original first-encounter text without \"Wealthy\", "
            "which the text never establishes. Marfa Petrovna's death (so his widowhood) is established at 16.73; the rumor "
            "that he caused it (\"They say he beat her dreadfully\") at 17.49, which also supports the dark-reputation subtitle; "
            "the family learns he has come to St. Petersburg, and is alarmed, at 22.31-22.34 (the reader first sees him there "
            "at 20.62 and learns his name at 20.68). Released at the end of the reviewed source paragraph 22.34, the earliest point at which every clause is supported.")
EDITIONS = {"original-en": "source.json", "modern-en": "baseline-live-modern-en.json"}


def norm(t):
    return re.sub(r" {2,}", " ", t.replace("\n", " "))


def u16len(t):
    return len(t.encode("utf-16-le")) // 2


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def snapshot(sid, point, evidence, subtitle, body, basis, name, plen):
    c, p = point
    return {"id": sid, "availableAt": {"chapterNumber": c, "paragraphIndex": p, "offset": plen(c, p)},
            "name": name, "subtitle": subtitle, "body": body,
            "evidence": [{"chapterNumber": c2, "paragraphIndex": p2, "throughOffset": plen(c2, p2)} for c2, p2 in evidence],
            "editorialBasis": basis}


def build(card_file, editions, label, target_desc):
    base = json.loads((INP / card_file).read_text())
    ops = []
    for ed, fname in editions.items():
        chapters = json.loads((INP / fname).read_text())["chapters"]
        plen = lambda c, p, ch=chapters: u16len(norm(ch[c - 1]["paragraphs"][p]))
        e = base["editions"][ed]
        assert e["sourceSha256"] == sha(INP / fname), (label, ed)
        ch = next(c for c in e["characters"] if c["id"] == "svidrigailov")
        assert [s["id"] for s in ch["snapshots"]] == ["svidrigailov-1"]
        s1 = ch["snapshots"][0]
        assert (s1["subtitle"], s1["body"]) == (OLD_SUBTITLE, OLD_BODY), (label, ed)
        path = ["editions", ed, "characters", {"id": "svidrigailov"}, "snapshots"]
        ops.append({"edition": ed, "op": "replace", "path": path + [{"id": "svidrigailov-1"}, "subtitle"], "old": OLD_SUBTITLE, "new": S1_SUBTITLE})
        ops.append({"edition": ed, "op": "replace", "path": path + [{"id": "svidrigailov-1"}, "body"], "old": OLD_BODY, "new": S1_BODY})
        ops.append({"edition": ed, "op": "insert-after", "path": path, "after": "svidrigailov-1", "absentBefore": "svidrigailov-2",
                    "value": snapshot("svidrigailov-2", S2_POINT, S2_EVIDENCE, S2_SUBTITLE, S2_BODY, S2_BASIS, s1["name"], plen)})
        ops.append({"edition": ed, "op": "insert-after", "path": path, "after": "svidrigailov-2", "absentBefore": "svidrigailov-3",
                    "value": snapshot("svidrigailov-3", S3_POINT, S3_EVIDENCE, S3_SUBTITLE, S3_BODY, S3_BASIS, s1["name"], plen)})
    patch = {
        "schema": "tinct-card-field-patch/1",
        "bookId": "crime-and-punishment",
        "purpose": "Make every claim in Svidrigaïlov's cards supported at its release point: trim the first-encounter card to what is known at the name, and release his pursuit of Dunya (end of 3.38) and his widowhood, reputation and arrival (end of 22.34) where the text supports them.",
        "baseline": target_desc,
        "targets": ["app/public/data/characters/crime-and-punishment.v1.json",
                    "books/characters/crime-and-punishment/characters.v1.json"],
        "baselineSha256": sha(INP / card_file),
        "baselineInput": card_file,
        "editionInputs": editions,
        "serialization": "json.dumps(indent=2, ensure_ascii=False) + '\\n' (matches the baseline byte for byte)",
        "operations": ops,
    }
    if editions["modern-en"] != "candidate.json":
        # Coordinates of the new snapshots in the accepted candidate (18be4155...), for re-anchoring.
        cand = json.loads((INP / "candidate.json").read_text())["chapters"]
        clen = lambda c, p: u16len(norm(cand[c - 1]["paragraphs"][p]))
        cc = {}
        for sid, point, ev in (("svidrigailov-2", S2_POINT, S2_EVIDENCE), ("svidrigailov-3", S3_POINT, S3_EVIDENCE)):
            cc[sid] = {"availableAt": {"chapterNumber": point[0], "paragraphIndex": point[1], "offset": clen(*point)},
                       "evidence": [{"chapterNumber": c, "paragraphIndex": p, "throughOffset": clen(c, p)} for c, p in ev]}
        patch["candidateCoordinates"] = {"edition": "modern-en", "appliesTo": "accepted candidate sha256 18be4155...", "snapshots": cc}
    (ROOT / label).write_text(json.dumps(patch, indent=2, ensure_ascii=False) + "\n")
    print(label, sha(ROOT / label))


def main():
    build("crime-and-punishment.v1.json", {"original-en": "source.json", "modern-en": "baseline-live-modern-en.json"},
          "PATCH.json", "live card on main 1bd1bfb3 / e1bf66a9 (unchanged), bound to live modern-en 914bcdfa")
    build("crime-and-punishment.v1.staged-01963b24.json", {"original-en": "source.json", "modern-en": "candidate.json"},
          "PATCH-staged-01963b24.json", "Codex staged card on codex/crime-reviewed-release-20260924 @ 01963b24, bound to accepted candidate 18be4155")


if __name__ == "__main__":
    main()
