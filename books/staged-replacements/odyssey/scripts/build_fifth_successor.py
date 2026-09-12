#!/usr/bin/env python3
"""The fifth successor — accepted Book 4's rendering collision (ledger A4(i)).

**The defect.** `book04/candidate-v2.json`, the accepted text, renders Butler's
`doubted whether` at **B04-P010** as `was in two minds` — **Butler's own other
phrase** — one paragraph before his real `thus in two minds` at B04-P011 is
rendered `still undecided`. So one rendering carries two Butler words, which is
the package's characteristic defect; and `in two minds`, which the edition has
otherwise reserved as *Butler's phrase*, is spent on a different phrase of his,
immediately before the reader meets the real one under another name.

**It was found by a check, not by a reader**, which is the point: arrow B of
`scripts/rendering_collisions.py` — one *rendering* carrying two Butler words,
the arrow that did not exist in the package until Book 6's round 1. The
reviewer's own audit of that check had to be fixed twice before it could see
this row: arrow B had been gated on Butler's rarity on *both* sides, and
Butler's `in two minds` is common.

**Book 6 must not be changed to match it.** B06-P012's `he did not know what to
do` is the better of the two renderings and stands. The repair is here, in the
accepted Book that carries the defect.

**What this script must not touch.** `book04/candidate-v2.json` is the accepted
file and `book04/ACCEPTANCE.md` is the record of what was accepted; both are
asserted **byte-unchanged** before and after, exactly as
`scripts/build_seashore_successors.py` does for the three successors before
this one. The successor is a new file, `book04/candidate-v4.json`, built from
`candidate-v3.json` — which is itself the successor that carries the `seashore`
and compound corrections, so the fifth successor carries all of them.
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import checks                                                   # noqa: E402
from rendering_collisions import build, report, load as rc_load, newest  # noqa: E402

BOOK = ROOT / "book04"

# Asserted byte-unchanged, before and after.
UNTOUCHED = ["book04/candidate-v2.json", "book04/ACCEPTANCE.md"]

BASE = "book04/candidate-v3.json"
OUT = "book04/candidate-v4.json"

OLD = ("When Menelaus saw this he was in two minds whether to let him choose "
       "his own time for speaking, or to ask him at once and find out what it "
       "was all about.")
NEW = ("When Menelaus saw this he did not know whether to let him choose his "
       "own time for speaking, or to ask him at once and find out what it was "
       "all about.")
IDX = 9          # B04-P010, 0-based


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def dump_json(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


def fail(m):
    sys.exit("build_fifth_successor.py: " + m)


def main():
    before = {f: sha(ROOT / f) for f in UNTOUCHED}

    d = json.loads((ROOT / BASE).read_text(encoding="utf-8"))
    paras = list(d["paragraphs"])
    if paras[IDX].count(OLD) != 1:
        fail("B04-P010 does not carry the collision exactly once")
    if NEW in paras[IDX]:
        fail("the repair is already present")
    paras[IDX] = paras[IDX].replace(OLD, NEW)

    joined = "\n".join(paras)
    # The repair, and the two things it must NOT do.
    if "did not know whether to let him choose his own time" not in paras[IDX]:
        fail("the repair did not land")
    if "in two minds" in paras[IDX]:
        fail("B04-P010 still carries `in two minds`")
    # Butler's real `thus in two minds` at B04-P011 keeps its own rendering.
    if "While he was still undecided, Helen came down" not in paras[10]:
        fail("B04-P011's `still undecided` must be untouched — it is the "
             "rendering reserved for Butler's own `thus in two minds`")
    # `in two minds` must now be absent from Book 4 altogether: Butler's two
    # instances are `doubted whether` (repaired here) and `thus in two minds`
    # (rendered `still undecided`), and neither should print the phrase.
    if "in two minds" in joined:
        fail("`in two minds` survives somewhere in Book 4")
    # And the repair must not collide with anything else: `did not know` is
    # Book 6's rendering of the same Butler phrase, which is the point.
    src = json.loads((ROOT / "book04/source-book4.json")
                     .read_text(encoding="utf-8"))["paragraphs"]
    if len(paras) != len(src):
        fail("paragraph alignment broken")

    doc = {"number": d["number"], "title": d["title"], "paragraphs": paras}
    (ROOT / OUT).write_text(dump_json(doc), encoding="utf-8")

    after = {f: sha(ROOT / f) for f in UNTOUCHED}
    for f in UNTOUCHED:
        if before[f] != after[f]:
            fail("%s changed — the accepted file and its record are "
                 "byte-frozen" % f)

    # ---- the check that found it must now be silent about it ---------------
    books = [(n, rc_load("book%02d/source-book%d.json" % (n, n)),
              rc_load(newest(n))) for n in (1, 2, 3, 4, 5, 6)]
    _, back = build(books)
    rows = {w: {x for x, _ in v} for w, v in back.items()}
    if "doubted" in rows.get("minds", set()):
        fail("arrow B still reports `minds ← doubted`: the successor did not "
             "close the collision it was built for")

    # ---- and the successor must still pass every gate ----------------------
    figs, gate = checks.run_book(4, version=4)
    if gate.failures:
        fail("%d gate(s) failed for the successor" % len(gate.failures))

    print()
    print("fifth successor written: %s" % OUT)
    print("  sha256                    %s" % sha(ROOT / OUT))
    print("  built from                %s (sha256 %s)" % (BASE, sha(ROOT / BASE)))
    for f in UNTOUCHED:
        print("  byte-unchanged            %s  %s" % (f, after[f]))
    print("  arrow B `minds ← doubted` CLOSED")


if __name__ == "__main__":
    main()
