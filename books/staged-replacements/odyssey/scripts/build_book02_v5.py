#!/usr/bin/env python3
"""Build candidate-v5.json for Odyssey Book 2 — the `waterside` successor.

Book 2 was accepted at `candidate-v2.json` on 2026-09-12 and has been reopened
twice since, each time for one word and each time by the same mechanism:

    v3  finding 27.1 (Book 3 round 1)       `mixing bowls` → `mixing-bowls`
    v4  ruling 1     (Book 5 round 1)       `sea shore`    → `seashore`
    v5  compound_drift (Book 6 step 2)      `water side`   → `waterside`

**Why this one is different, and why it matters.** The first two were found by
a check that keys compounds on a **hyphen**: Butler prints `mixing-bowls` and
`sea-shore` somewhere, so the pair is attested as a compound and the drift is
visible. `water-side` **occurs nowhere in PG #1727** — Butler always sets it
open — so the hyphen test could not see `waterside` against `water side` at
all. That is blind spot 1 of Book 5's round 1 (section H), the one the
reviewer said only a reader could catch.

So `compound_drift()` was extended again at Book 6 to a **closed-word axis**: a
pair is also admitted as a compound when its concatenation is printed as a
single word somewhere in the corpus. Guarded by a function-word stoplist and a
three-letter minimum — without which `any one`, `on to`, `up on` and `her a`
flood the report — it now raises this pair, and the successor answers it. The
blind spot is narrowed, not closed: a compound Butler sets open everywhere and
every Book renders open is still invisible, and that blindness is declared in
`scripts/compound_drift.py`'s own self-test.

**D15 decides the direction, not precedent.** `waterside` is the modern
standard closed form; the change does not alter what a reader says aloud, so it
passes D15's typographic test and is made silently. Book 6 prints `waterside`
twice at B06-P009 and accepted Book 2 printed `water side` once at B02-P033.

Following D10 and `scripts/build_book02_v3.py`: v2, v3 and v4 and Book 2's
`ACCEPTANCE.md` are left **byte-unchanged** on disk.

Deterministic and idempotent. Usage: python3 scripts/build_book02_v5.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from compound_drift import compound_drift            # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / "book02"

V4_SHA = "3aa8c4f27f7f6b3fabd1447a32852f1507ead3a9710efc6373f43416428773fc"

CORRECTIONS = [
    (32, "compound_drift(), closed-word axis (Book 6 step 2) — D15, the "
         "modern standard form; `water-side` occurs nowhere in PG, so the "
         "hyphen test could not see this pair",
     "found the crew waiting by the water side",
     "found the crew waiting by the waterside"),
]

ROMAN = ("Ulysses", "Minerva", "Jove", "Neptune", "Mercury", "Saturn",
         "Diana", "Euryclea", "Venus", "Juno", "Vulcan", "Ceres")
BRITISH = ("grey", "honour", "harbour", "marvelled", "woollen", "travelled",
           "sceptre", "towards")


def fail(msg):
    sys.exit("build_book02_v5.py: " + msg)


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def main():
    src_path = BOOK / "candidate-v4.json"
    raw = src_path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != V4_SHA:
        fail("candidate-v4.json is not at its recorded hash")
    doc = json.loads(raw.decode("utf-8"))
    paras = list(doc["paragraphs"])
    before = list(paras)

    for idx, finding, old, new in CORRECTIONS:
        if paras[idx].count(old) != 1:
            fail("B02-P%03d / %s: old string occurs %d times, expected 1"
                 % (idx + 1, finding, paras[idx].count(old)))
        paras[idx] = paras[idx].replace(old, new)
    for idx, finding, old, new in CORRECTIONS:
        if new not in paras[idx] or old in paras[idx]:
            fail("B02-P%03d: correction did not land" % (idx + 1))

    joined = "\n".join(paras)
    if len(paras) != 35:
        fail("paragraph count changed")
    if [i for i in range(35) if before[i] != paras[i]] != [32]:
        fail("a paragraph changed that no correction names")
    if "water side" in joined.lower() or "water-side" in joined.lower():
        fail("an open or hyphenated water side survives")
    if "seashore" not in joined.lower() or "sea shore" in joined.lower():
        fail("the v4 seashore ruling was disturbed")
    if "mixing-bowls" not in joined or "mixing bowls" in joined:
        fail("the v3 finding 27.1 row was disturbed")
    if "'" in joined or '"' in joined:
        fail("an ASCII quote appeared")
    for roman in ROMAN:
        if re.search(r"\b%s\b" % roman, joined):
            fail("a Roman form appeared: %s" % roman)
    for brit in BRITISH:
        if re.search(r"\b%s\b" % brit, joined):
            fail("a British spelling appeared: %s" % brit)
    if (sum(p.count("“") for p in paras), sum(p.count("”") for p in paras)) != (29, 28):
        fail("D4: quotation balance changed")
    if [i for i, p in enumerate(paras) if p.count("“") != p.count("”")] != [5]:
        fail("D4: the only unbalanced paragraph must be B02-P006")

    out = BOOK / "candidate-v5.json"
    out.write_text(dump_json({"number": doc["number"], "title": doc["title"],
                              "paragraphs": paras}), encoding="utf-8")
    lines = ["# The Odyssey, Book 2 — modern English (candidate v5, readable "
             "copy)", "",
             "Generated by `scripts/build_book02_v5.py` from `candidate-v4.json`,",
             "which is left byte-unchanged (**D10**). One paragraph differs,",
             "B02-P033. Paragraph IDs are outside the prose; the text itself is",
             "byte-identical to `candidate-v5.json`.", "",
             "**" + doc["title"] + "**", ""]
    for i, p in enumerate(paras):
        lines += ["**B02-P%03d**" % (i + 1), "", p, ""]
    (BOOK / "candidate-v5-readable.md").write_text("\n".join(lines),
                                                   encoding="utf-8")
    (BOOK / "changes-v4-to-v5.md").write_text("\n".join(
        ["# Book 2 — every change from `candidate-v4.json` to `candidate-v5.json`",
         "", "Written by `../scripts/build_book02_v5.py`. `candidate-v4.json`",
         "and Book 2's `ACCEPTANCE.md` are left **byte-unchanged** (**D10**).",
         "", "One substitution, on the closed-word extension of",
         "`compound_drift()` made at Book 6's step 2. `water-side` occurs",
         "**nowhere** in PG #1727, so the hyphen-keyed check that produced v3",
         "and v4 was blind to this pair — it is blind spot 1 of Book 5's round",
         "1, and the extension narrows it.", "",
         "| # | paragraph | finding | from | to |", "|---|---|---|---|---|"] +
        ["| %d | B02-P%03d | %s | `%s` | `%s` |"
         % (k + 1, idx + 1, f, o, n)
         for k, (idx, f, o, n) in enumerate(CORRECTIONS)] + [""]),
        encoding="utf-8")

    if src_path.read_bytes() != raw:
        fail("candidate-v4.json was written to")

    books, attest = {}, []
    for label, rel in (("book01", "book01/candidate-v3.json"),
                       ("book02", "book02/candidate-v5.json"),
                       ("book03", "book03/candidate-v3.json"),
                       ("book04", "book04/candidate-v3.json"),
                       ("book05", "book05/candidate-v2.json"),
                       ("book06", "book06/candidate-v1.json")):
        pth = ROOT / rel
        if pth.exists():
            books[label] = json.loads(pth.read_bytes().decode("utf-8"))["paragraphs"]
    for i in range(1, 7):
        pth = ROOT / ("book%02d/source-book%d.json" % (i, i))
        if pth.exists():
            attest.append(json.loads(pth.read_bytes().decode("utf-8"))["paragraphs"])
    drift = compound_drift(books, attest=attest)

    print("OK — candidate-v5.json written")
    print("  corrections applied        1 in 1 paragraph (B02-P033)")
    print("  candidate-v4.json sha256   %s  (untouched)" % V4_SHA)
    print("  candidate-v5.json sha256   %s"
          % hashlib.sha256(out.read_bytes()).hexdigest())
    print("  compound_drift over %s: %s"
          % (", ".join(sorted(books)),
             "silent" if not drift else "; ".join("%s %s" % (k, v)
                                                  for k, v in drift)))
    if drift:
        fail("drift remains")


if __name__ == "__main__":
    main()
