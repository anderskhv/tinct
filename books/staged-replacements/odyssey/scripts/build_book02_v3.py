#!/usr/bin/env python3
"""Build candidate-v3.json for Odyssey Book 2 from the accepted candidate-v2.json.

Book 2 was accepted at v2 on 2026-09-12. It is reopened here for exactly one
character, on Book 3's round-1 finding **27.1** — the package's first
cross-Book typographic drift:

    Butler:      "mixing-bowls" (B01-P008, B01-P012, B03-P027)
                 "mixing bowls" (B02-P034)
    edition v2:  "mixing-bowls" in Book 1, "mixing bowls" in Book 2
    edition v3:  "mixing-bowls" everywhere

Butler is inconsistent; on D7's principle the edition is not. Book 1 is
accepted with the hyphenated form twice, so the hyphenated form is the
edition's, and Book 2's single open instance moves to it.

The drift was found by the generalized check `hyphen_drift()` added to
`scripts/build_book3_v2.py` at records finding R5 — the reviewer named the
Book 1 / Book 3 pair; the generalized check found that **Book 2 is the third
member of it**, which no check in the package could previously see.

Following the package's practice (D10, and `scripts/build_book01_v3.py`), an
accepted Book is never reopened informally: v2 and its `ACCEPTANCE.md` are
left untouched on disk, and v3 is a **recorded successor** with its own hash
and its own change note.

Deterministic and idempotent. Asserts v2 is at its accepted hash first, and
re-asserts every GLOSSARY.md hazard and PUNCTUATION.md standard afterwards.

Usage: python3 scripts/build_book02_v3.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / "book02"

V2_SHA = "71816de3e761932c43a5bc3d5699e5dd2cb8811d0024b1048ca17e76b3445126"
SOURCE_SHA = "3cc4f38c171e0e1d72ad741e75c745b31c7f330dfb3ed79910832ae4d04714c7"

CORRECTIONS = [
    (33, "27.1 (Book 3 round 1; cross-Book typographic drift)",
     "filled the mixing bowls to the brim",
     "filled the mixing-bowls to the brim"),
]


def fail(msg):
    sys.exit("build_book02_v3.py: " + msg)


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
    src_bytes = (BOOK / "source-book2.json").read_bytes()
    if sha256_bytes(src_bytes) != SOURCE_SHA:
        fail("source-book2.json is not at its recorded hash")

    v2 = json.loads(v2_bytes.decode("utf-8"))
    src = json.loads(src_bytes.decode("utf-8"))
    paras = list(v2["paragraphs"])

    for idx, finding, old, new in CORRECTIONS:
        p = paras[idx]
        if p.count(old) != 1:
            fail("B02-P%03d / %s: old string occurs %d times, expected 1"
                 % (idx + 1, finding, p.count(old)))
        if new in p:
            fail("B02-P%03d / %s: new string already present" % (idx + 1, finding))
        paras[idx] = p.replace(old, new)

    joined = "\n".join(paras)

    diffs = [i for i in range(len(paras)) if paras[i] != v2["paragraphs"][i]]
    if diffs != [33]:
        fail("expected exactly B02-P034 to differ, got %s" % diffs)
    if "mixing bowls" in joined or joined.count("mixing-bowls") != 1:
        fail("27.1: Book 2 must print mixing-bowls, once")
    # Butler's own open form is still there in the source, and stays there.
    if "mixing bowls" not in src["paragraphs"][33].replace("\n", " "):
        fail("27.1: Butler's open form must remain in the source, untouched")

    # ---- every hazard and standard re-asserted, unchanged ------------------
    for name, n in (("Odysseus", 17), ("Athena", 8), ("Zeus", 6),
                    ("Eurycleia", 2)):
        if count(name, joined) != n:
            fail("name count changed: %s" % name)
    for roman in ("Ulysses", "Minerva", "Jove", "Neptune", "Mercury",
                  "Saturn", "Diana", "Euryclea", "Rhea", "Helios", "Cronos"):
        if count(roman, joined) != 0:
            fail("forbidden form appeared: %s" % roman)
    if count("Ops", joined) != 1 or "daughter of Ops, son of Pisenor" not in joined:
        fail("hazard 1: Ops or his genealogy disturbed")
    if count("Ilius", joined) != 1 or count("Troy", joined) != 1:
        fail("Butler's two forms Ilius/Troy must both survive, once each")
    if count("Mycene", joined) != 1 or count("Mycenae", joined) != 0:
        fail("D13: Book 2's Mycene is the woman and keeps Butler's spelling")
    if "[" in joined or "]" in joined:
        fail("D12: a bracket mark survives")
    if "councils: do not hold back, my friends" not in paras[3]:
        fail("D12 class A: the supplied words were disturbed")
    if "the Erinyes—the spirits of vengeance—to avenge her" not in paras[7]:
        fail("the Erinyes gloss was disturbed")
    if "'" in joined or '"' in joined:
        fail("an ASCII quote survives")
    if (sum(p.count("“") for p in paras), sum(p.count("”") for p in paras)) != (29, 28):
        fail("quotation balance changed")
    unbal = [i for i, p in enumerate(paras) if p.count("“") != p.count("”")]
    if unbal != [5]:
        fail("D4: the only unbalanced paragraph must be B02-P006")
    if not paras[6].lstrip().startswith("“") or not paras[5].rstrip().endswith("’"):
        fail("D4: the unclosed-quotation convention was disturbed")
    for brit in ("grey", "honour", "harbour", "marvelled", "woollen",
                 "travelled", "sceptre", "towards"):
        if count(brit, joined) != 0:
            fail("British spelling survives: %s" % brit)
    if "gray-eyed daughter of Zeus" not in paras[33]:
        fail("the Athena epithet row was disturbed")
    if any("\n" in p for p in paras) or len(paras) != 35 or len(src["paragraphs"]) != 35:
        fail("alignment broken")

    src_words = sum(len(p.split()) for p in src["paragraphs"])
    ratio = sum(len(p.split()) for p in paras) / src_words
    if not 0.90 <= ratio <= 1.10:
        fail("word ratio %.4f outside 0.90-1.10" % ratio)

    doc = {"number": v2["number"], "title": v2["title"], "paragraphs": paras}
    out = BOOK / "candidate-v3.json"
    out.write_text(dump_json(doc), encoding="utf-8")

    lines = [
        "# The Odyssey, Book 2 — modern English (candidate v3, readable copy)",
        "",
        "Generated by `scripts/build_book02_v3.py` from the accepted",
        "`candidate-v2.json`. One paragraph differs, B02-P034, on Book 3's",
        "round-1 finding 27.1. Paragraph IDs are outside the prose; the text",
        "itself is byte-identical to `candidate-v3.json`.",
        "",
        "**" + doc["title"] + "**",
        "",
    ]
    for i, p in enumerate(paras):
        lines.append("**B02-P%03d**" % (i + 1))
        lines.append("")
        lines.append(p)
        lines.append("")
    (BOOK / "candidate-v3-readable.md").write_text("\n".join(lines), encoding="utf-8")

    print("OK — candidate-v3.json written")
    print("  corrections applied        1 (finding 27.1) in 1 paragraph")
    print("  paragraphs differing v2→v3 1 (B02-P034)")
    print("  word ratio                 %.4f (unchanged from v2)" % ratio)
    print("  candidate-v3.json sha256   %s" % sha256_bytes(out.read_bytes()))
    print("  candidate-v2.json sha256   %s  (untouched)" % V2_SHA)


if __name__ == "__main__":
    main()
