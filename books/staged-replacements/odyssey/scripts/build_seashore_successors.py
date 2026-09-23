#!/usr/bin/env python3
"""Build the three successors ruling 1 of Book 5's round 1 costs.

    book02/candidate-v4.json   from the accepted book02/candidate-v3.json
    book03/candidate-v3.json   from the accepted book03/candidate-v2.json
    book04/candidate-v3.json   from the accepted book04/candidate-v2.json

**The ruling.** `sea shore` → **`seashore`**. D15 is about the *form*, not
about precedent: the modern standard form of the compound is closed, in every
current dictionary, and the change does not alter what a reader would say
aloud, so it passes D15's own typographic test and is made silently. Keeping
the open form inside a Book that closes `seagull`, `goatskin`, `homesickness`,
`daytime`, `foothold`, `hillside`, `sandalwood` and `yardarm` is not
consistency; it is D15 applied to eight neighbours and suspended for the ninth.
The package has already ruled that a settled-but-wrong form gets a successor
rather than tenure — Book 3's finding 27.1 produced `book02/candidate-v3.json`
for one hyphen.

**The cost is three successors, not one.** `RESUME.md`,
`book05/review-instructions.md` and `PUNCTUATION.md` §4 each state that
accepted **Book 4** asserts the open form. Accepted Books **2, 3 and 4** all
print it, one instance each (records finding **R-3**). All three documents are
corrected; all three Books get a successor.

**And the extended check found two more while it was looking.** Running
`compound_drift()` (the closed/open extension, `scripts/compound_drift.py`)
across the five Books surfaced two cross-Book drifts nobody had raised:

    low-lying        hyphenated in Book 5, open `low lying` in Book 4
    well-disposed    hyphenated in Books 2 and 5, open `well disposed` in Book 4

Butler sets both ways himself; the modern standard is hyphenated for both, and
Books 2 and 5 already print them hyphenated, so Book 4's two open instances
move. **These two are in the class the ORIGINAL `hyphen_drift()` could already
see.** It was written at Book 3 and never run again — Book 4's build script
does not call it. That is the finding behind the finding: an unrun check is
worth what an absent one is worth, and `scripts/compound_drift.py` is therefore
runnable on its own and is run by `build_book05_v2.py`.

Following D10 and `scripts/build_book02_v3.py`: each accepted candidate and its
`ACCEPTANCE.md` are left **byte-unchanged** on disk, and each successor is a
recorded file with its own hash.

Deterministic and idempotent. Usage:
    python3 scripts/build_seashore_successors.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from compound_drift import compound_drift            # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

# (book dir, accepted file, its accepted sha256, successor file, corrections)
JOBS = [
    ("book02", "candidate-v3.json",
     "dcf1e301d63f2ef462565a66950bcfa51794662080a460c6b9f46846f24088ac",
     "candidate-v4.json",
     [(16, "Ruling 1 (Book 5 round 1) — D15, the modern standard form",
       "all alone along the sea shore, washed his hands",
       "all alone along the seashore, washed his hands")]),
    ("book03", "candidate-v2.json",
     "7095ef4f9925f284d3a31937d298b39766d619d8d5f2a01b61508c434989b905",
     "candidate-v3.json",
     [(0, "Ruling 1 (Book 5 round 1) — D15, the modern standard form",
       "were gathered on the sea shore to offer a sacrifice",
       "were gathered on the seashore to offer a sacrifice")]),
    ("book04", "candidate-v2.json",
     "b3bef2f3570009ef875a41567ecea85628b7883e3678e2bb226a51b49674c446",
     "candidate-v3.json",
     [(0, "compound_drift() — `low-lying` is hyphenated in Book 5 and was "
          "open here; Butler sets it both ways and the modern standard is "
          "hyphenated",
       "They reached the low lying city of Lacedaemon",
       "They reached the low-lying city of Lacedaemon"),
      (17, "compound_drift() — `well-disposed` is hyphenated in accepted "
           "Book 2 and in Book 5, and was open here",
       "with sons about him who are both well disposed and valiant",
       "with sons about him who are both well-disposed and valiant"),
      (37, "Ruling 1 (Book 5 round 1) — D15, the modern standard form",
       "to bask on the sea shore, till at noon",
       "to bask on the seashore, till at noon")]),
]

# The invariants every successor must still satisfy. Nothing here is specific
# to the ruling; they are the package's standing assertions, re-run so that a
# one-word successor cannot quietly break something else.
ROMAN = ("Ulysses", "Minerva", "Jove", "Neptune", "Mercury", "Saturn",
         "Diana", "Euryclea", "Venus", "Juno", "Vulcan", "Ceres")
BRITISH = ("grey", "honour", "harbour", "marvelled", "woollen", "travelled",
           "favour", "neighbour", "colour", "sceptre", "towards", "armour",
           "splendour", "humour", "skilfully", "ploughed")


def fail(msg):
    sys.exit("build_seashore_successors.py: " + msg)


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def build(book, accepted, accepted_sha, successor, corrections):
    src_path = ROOT / book / accepted
    raw = src_path.read_bytes()
    if sha256_bytes(raw) != accepted_sha:
        fail("%s/%s is not at its accepted hash" % (book, accepted))
    doc = json.loads(raw.decode("utf-8"))
    paras = list(doc["paragraphs"])
    n_before = len(paras)

    for idx, finding, old, new in corrections:
        if paras[idx].count(old) != 1:
            fail("%s P%03d / %s: old string occurs %d times, expected 1"
                 % (book, idx + 1, finding, paras[idx].count(old)))
        if new in paras[idx]:
            fail("%s P%03d: new string already present" % (book, idx + 1))
        paras[idx] = paras[idx].replace(old, new)
    for idx, finding, old, new in corrections:
        if new not in paras[idx] or old in paras[idx]:
            fail("%s P%03d: correction did not land" % (book, idx + 1))

    joined = "\n".join(paras)
    low = joined.lower()
    if len(paras) != n_before:
        fail("%s: paragraph count changed" % book)
    if "sea shore" in low or "sea-shore" in low:
        fail("%s: an open or hyphenated sea shore survives" % book)
    if "low lying" in low or "well disposed" in low:
        fail("%s: an open low lying / well disposed survives" % book)
    if "'" in joined or '"' in joined:
        fail("%s: an ASCII quote appeared" % book)
    for roman in ROMAN:
        if re.search(r"\b%s\b" % roman, joined):
            fail("%s: a Roman form appeared: %s" % (book, roman))
    for brit in BRITISH:
        if re.search(r"\b%s\b" % brit, joined):
            fail("%s: a British spelling appeared: %s" % (book, brit))
    if "[" in joined or "]" in joined:
        fail("%s: D12, a bracket mark appeared" % book)
    if any("\n" in p for p in paras) or any("  " in p for p in paras):
        fail("%s: whitespace defect" % book)
    # the ONLY difference from the accepted file is the corrections
    before = json.loads(raw.decode("utf-8"))["paragraphs"]
    diff = [i for i in range(n_before) if before[i] != paras[i]]
    if diff != sorted({idx for idx, _, _, _ in corrections}):
        fail("%s: paragraphs changed that no correction names: %s"
             % (book, diff))

    out = ROOT / book / successor
    doc = {"number": doc["number"], "title": doc["title"], "paragraphs": paras}
    out.write_text(dump_json(doc), encoding="utf-8")

    tag = book[-2:].lstrip("0")
    lines = ["# The Odyssey, Book %s — modern English (%s, readable copy)"
             % (tag, successor[:-5]), "",
             "Generated by `scripts/build_seashore_successors.py` from the",
             "accepted `%s`, which is left byte-unchanged (**D10**)." % accepted,
             "%d paragraph(s) differ. Paragraph IDs are outside the prose; the"
             % len(diff),
             "text itself is byte-identical to `%s`." % successor, "",
             "**" + doc["title"] + "**", ""]
    for i, p in enumerate(paras):
        lines += ["**B%02d-P%03d**" % (int(tag), i + 1), "", p, ""]
    (ROOT / book / (successor[:-5] + "-readable.md")).write_text(
        "\n".join(lines), encoding="utf-8")

    note = ROOT / book / ("changes-%s-to-%s.md"
                          % (accepted[10:-5], successor[10:-5]))
    note.write_text("\n".join(
        ["# Book %s — every change from `%s` to `%s`" % (tag, accepted, successor),
         "",
         "Written by `../scripts/build_seashore_successors.py`. The accepted",
         "`%s` and its `ACCEPTANCE.md` are left **byte-unchanged**" % accepted,
         "(**D10**); this successor is a recorded file with its own hash, on",
         "the precedent of Book 3's finding 27.1 → `book02/candidate-v3.json`.",
         "",
         "Ruling 1 of Book 5's round 1 (`book05/review/findings-v1.md`) and",
         "the cross-Book drift the extended `compound_drift()` surfaced with",
         "it. %d substitution(s) in %d paragraph(s)." % (len(corrections), len(diff)),
         "",
         "| # | paragraph | finding | from | to |", "|---|---|---|---|---|"] +
        ["| %d | B%02d-P%03d | %s | `%s` | `%s` |"
         % (k + 1, int(tag), idx + 1, f, o, nw)
         for k, (idx, f, o, nw) in enumerate(corrections)] + [""]),
        encoding="utf-8")

    # the accepted file must still be exactly as it was
    if src_path.read_bytes() != raw:
        fail("%s: the accepted file was written to" % book)
    return out, diff


def main():
    made = []
    for book, accepted, sha, successor, corrections in JOBS:
        out, diff = build(book, accepted, sha, successor, corrections)
        made.append((book, accepted, sha, successor,
                     sha256_bytes(out.read_bytes()), diff, len(corrections)))

    books = {}
    for label, rel in (("book01", "book01/candidate-v3.json"),
                       ("book02", "book02/candidate-v4.json"),
                       ("book03", "book03/candidate-v3.json"),
                       ("book04", "book04/candidate-v3.json"),
                       ("book05", "book05/candidate-v2.json")):
        p = ROOT / rel
        if p.exists():
            books[label] = json.loads(p.read_bytes().decode("utf-8"))["paragraphs"]
    attest = [json.loads((ROOT / ("book0%d/source-book%d.json" % (i, i)))
                         .read_bytes().decode("utf-8"))["paragraphs"]
              for i in range(1, 6)]
    drift = compound_drift(books, attest=attest)

    print("OK — three successors written")
    for book, accepted, sha, successor, new_sha, diff, k in made:
        print("  %s/%s  %d correction(s), paragraph(s) %s"
              % (book, successor, k, ", ".join("P%03d" % (i + 1) for i in diff)))
        print("      accepted %s  %s  (untouched)" % (accepted, sha))
        print("      successor        %s" % new_sha)
    print()
    print("  compound_drift over %s:" % ", ".join(sorted(books)))
    if drift:
        for key, found in drift:
            print("    %-16s %s" % (key, "; ".join(
                "%s in %s" % (s, "/".join(v)) for s, v in found.items())))
        fail("drift remains after the successors")
    print("    silent — no compound carries more than one setting")


if __name__ == "__main__":
    main()
