#!/usr/bin/env python3
"""Build candidate-v3.json for Odyssey Book 1 from the accepted candidate-v2.json.

Book 1 was accepted at v2 on 2026-09-12. It is reopened here for exactly one
word, on Book 2's round-1 finding **11.1**, which the Book 2 reviewer ruled on
rather than deferring a third time:

    Butler: "all the marriage gifts that so dear a daughter may expect"
    v2:     "all the marriage gifts a beloved daughter deserves"
    v3:     "all the marriage gifts a beloved daughter may expect"

The phrase is a cross-Book formula (B01-P019 and B02-P011), so it changes in
both Books at once or in neither. It is Eurymachus who speaks it in Book 2,
mid-threat; "deserves" is a moral judgement neither Butler nor Eurymachus
makes.

Following the Meditations package's practice, an accepted Book is never
reopened informally: v2 and its ACCEPTANCE.md are left untouched on disk, and
v3 is a **recorded successor** with its own hash, its own change list
(book01/changes-v2-to-v3.md) and pointers from book01/README.md,
book01/provenance.json and book01/manifest.json.

Deterministic and idempotent. Asserts v2 is at its accepted hash before
touching it, and re-asserts every GLOSSARY.md hazard and every PUNCTUATION.md
standard afterwards, so that a one-word successor cannot silently disturb
anything else.

Usage: python3 scripts/build_book01_v3.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / "book01"

V2_SHA = "f28a13264288079781a8c8c6cf044ae41d288847dc5d7f23378851a44ba7df45"
SOURCE_SHA = "fd364c78c4e87d0c93e529aeaa42e13bc3677f21cc3b7143d1d43df76e64f1c4"

CORRECTIONS = [
    (18, "11.1 (Book 2 round 1; cross-Book formula)",
     "all the marriage gifts a beloved daughter deserves",
     "all the marriage gifts a beloved daughter may expect"),
]


def fail(msg):
    sys.exit("build_book01_v3.py: " + msg)


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def count(word, text):
    return len(re.findall(r"\b" + re.escape(word) + r"\b", text))


def main():
    v2_bytes = (BOOK / "candidate-v2.json").read_bytes()
    if sha256_bytes(v2_bytes) != V2_SHA:
        fail("candidate-v2.json is not at its accepted hash %s" % V2_SHA)
    src_bytes = (BOOK / "source-book1.json").read_bytes()
    if sha256_bytes(src_bytes) != SOURCE_SHA:
        fail("source-book1.json is not at its recorded hash")

    v2 = json.loads(v2_bytes.decode("utf-8"))
    src = json.loads(src_bytes.decode("utf-8"))
    paras = list(v2["paragraphs"])

    # ---- the single correction --------------------------------------------
    for idx, finding, old, new in CORRECTIONS:
        p = paras[idx]
        if p.count(old) != 1:
            fail("B01-P%03d / %s: old string occurs %d times, expected 1"
                 % (idx + 1, finding, p.count(old)))
        if new in p:
            fail("B01-P%03d / %s: new string already present" % (idx + 1, finding))
        paras[idx] = p.replace(old, new)

    joined = "\n".join(paras)

    # exactly one paragraph differs
    diffs = [i for i in range(len(paras)) if paras[i] != v2["paragraphs"][i]]
    if diffs != [18]:
        fail("expected exactly B01-P019 to differ, got %s" % diffs)
    if count("deserves", joined) != 0:
        fail("'deserves' survives somewhere in Book 1")
    if "all the marriage gifts a beloved daughter may expect" not in paras[18]:
        fail("the correction did not land")

    # ---- every hazard and standard re-asserted, unchanged ------------------
    for name, n in (("Odysseus", 17), ("Athena", 12), ("Zeus", 6),
                    ("Poseidon", 6), ("Hermes", 3), ("Cronus", 2)):
        if count(name, joined) != n:
            fail("name count changed: %s" % name)
    for roman in ("Ulysses", "Minerva", "Jove", "Neptune", "Mercury",
                  "Saturn", "Diana", "Euryclea", "Rhea", "Helios", "Cronos"):
        if count(roman, joined) != 0:
            fail("forbidden form appeared: %s" % roman)
    if count("Ops", joined) != 1 or "daughter of Ops, son of Pisenor" not in joined:
        fail("hazard 1: Ops or his genealogy disturbed")
    if joined.count("son of Cronus, king of kings") != 2:
        fail("hazard 2: the fixed epithet count changed")
    if len(re.findall("Odysseus’s", joined)) != 3 or re.search("Odysseus’(?!s)", joined):
        fail("hazard 3: the possessive standard was disturbed")
    if "Dulichium, Same, and wooded Zacynthus" not in joined:
        fail("hazard 4: the island list was disturbed")
    if count("heaven", joined) != 10:
        fail("hazard 5: the 'heaven' count changed")
    if count("Hyperion", joined) != 1 or count("Eurycleia", joined) != 1:
        fail("hazard 6 / D8: Hyperion or Eurycleia disturbed")
    if "'" in joined or '"' in joined or joined.count("’") != 22:
        fail("PUNCTUATION.md §1: the apostrophe standard was disturbed")
    if (sum(p.count("“") for p in paras), sum(p.count("”") for p in paras)) != (30, 29):
        fail("quotation balance changed")
    if paras[17].rstrip().endswith("”") or not paras[18].lstrip().startswith("“"):
        fail("D4: the unclosed-quotation convention was disturbed")
    if any("\n" in p for p in paras) or len(paras) != 32 or len(src["paragraphs"]) != 32:
        fail("alignment broken")
    if "woolen" not in paras[31] or "draughts" not in paras[7]:
        fail("spelling standard disturbed")

    src_words = sum(len(p.split()) for p in src["paragraphs"])
    cand_words = sum(len(p.split()) for p in paras)
    ratio = cand_words / src_words
    if ratio < 0.90:
        fail("word ratio %.4f below 0.90" % ratio)

    doc = {"number": v2["number"], "title": v2["title"], "paragraphs": paras}
    out = BOOK / "candidate-v3.json"
    out.write_text(dump_json(doc), encoding="utf-8")

    lines = [
        "# The Odyssey, Book 1 — modern English (candidate v3, readable copy)",
        "",
        "Generated by `scripts/build_book01_v3.py` from the accepted",
        "`candidate-v2.json`. One paragraph differs, B01-P019, on Book 2's",
        "round-1 finding 11.1. Paragraph IDs are outside the prose; the text",
        "itself is byte-identical to `candidate-v3.json`.",
        "",
        "**" + doc["title"] + "**",
        "",
    ]
    for i, p in enumerate(paras):
        lines.append("**B01-P%03d**" % (i + 1))
        lines.append("")
        lines.append(p)
        lines.append("")
    (BOOK / "candidate-v3-readable.md").write_text("\n".join(lines), encoding="utf-8")

    print("OK — candidate-v3.json written")
    print("  corrections applied        1 (finding 11.1) in 1 paragraph")
    print("  paragraphs differing v2→v3 1 (B01-P019)")
    print("  word ratio                 %.4f (v2 was 0.9462)" % ratio)
    print("  candidate-v3.json sha256   %s" % sha256_bytes(out.read_bytes()))
    print("  candidate-v2.json sha256   %s  (untouched)" % V2_SHA)


if __name__ == "__main__":
    main()
