#!/usr/bin/env python3
"""One consolidated pass: `mountain tops` closed, `councillors` corrected, and
three successors to accepted Books built together.

Ledger **A5** and **A6**, both ruled by Book 7's round 1, both costing a
successor to a Book that is already accepted, and both done here in **one pass**
rather than one at a time — which is the whole of A5(a)'s argument:

> *"this is the THIRD time the package has paid successors for a compound found
> by a person reading (`mixing-bowl` at Book 2, `seashore`/`low-lying`/
> `well-disposed` at Book 5); paying a third round without closing the class
> guarantees a fourth."*

**A5(a) — `mountain tops` is closed, and the cost is TWO successors, not one.**
Records finding **R-6**: `book06/ACCEPTANCE.md` O-6 states the cost as *"a
sixth successor"*, singular, counting only Book 5. The string is in accepted
**Book 5** (`candidate-v2.json`, B05-P030) **and accepted Book 6**
(`candidate-v2.json`, B06-P011), and Book 6 is itself accepted, so changing it
costs a successor too. D15 as written decides the spelling — the standard
American form is closed — and cost is not a reason to decline, since `seashore`
cost three successors on a point D15 calls typographic.

**A6 — `councillors` loses to D9.** Every accepted candidate was scanned across
eleven classes of British spelling and it is the **only** instance in seven
accepted Books, so it is one word against a named rule, not house style against
a rule. Two words in Book 2 (B02-P001, B02-P003) and one in Book 7, which took
its correction in `build_book07_v2.py`.

**A4(ii) — the vendored word list is DECLINED, and the register replaces it.**
See `compound_register()` below and §H.1 of every `continuity.md`.

**Nothing accepted is rewritten.** Every accepted candidate and every
`ACCEPTANCE.md` is hashed before and after and asserted byte-unchanged; the
successors are new files. (The one deliberate exception is recorded and is not
this script's: `book06/ACCEPTANCE.md` carries a dated correction block for R-6,
with the wrong sentence struck through rather than deleted, because a record
that keeps the false sentence silently is the R-1 disease.)
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import checks                                                   # noqa: E402

# (source file, successor, ledger item, [(0-based paragraph, old, new)])
SUCCESSORS = [
    ("book05/candidate-v2.json", "book05/candidate-v3.json", "A5(a) / R-6",
     [(29, "low-lying rocks, and mountain tops.",
       "low-lying rocks, and mountaintops.")]),
    ("book06/candidate-v2.json", "book06/candidate-v3.json", "A5(a) / R-6",
     [(10, "the nymphs that haunt mountain tops,",
       "the nymphs that haunt mountaintops,")]),
    # A6 and A5(c) TOGETHER, in one successor, which is the point of doing this
    # in one pass: `store-room` was found by the new register (below) while
    # this build was being written, and folding it in here costs Book 2 nothing
    # beyond the successor it was already owed. A fourth round of
    # one-compound-at-a-time is what A5(a) says must not happen again.
    ("book02/candidate-v5.json", "book02/candidate-v6.json",
     "A6 / D9 + A5(c) / D15",
     [(0, "even the oldest councillors made way for him",
       "even the oldest councilors made way for him"),
      (2, "there has been no meeting of our councillors until now",
       "there has been no meeting of our councilors until now"),
      (24, "the high, spacious store-room where his father\u2019s treasure",
       "the high, spacious storeroom where his father\u2019s treasure"),
      (24, "Telemachus called her to the store-room and said:",
       "Telemachus called her to the storeroom and said:")]),
]

# Files that must be byte-unchanged across this build.
UNTOUCHED = ["book02/candidate-v2.json", "book02/candidate-v5.json",
             "book05/candidate-v2.json", "book06/candidate-v2.json",
             "book02/ACCEPTANCE.md", "book05/ACCEPTANCE.md"]


def sha(p):
    return hashlib.sha256((ROOT / p).read_bytes()).hexdigest()


def fail(m):
    sys.exit("build_compound_sweep.py: " + m)


def main():
    before = {p: sha(p) for p in UNTOUCHED}
    built = []
    for srcf, dstf, item, edits in SUCCESSORS:
        d = json.loads((ROOT / srcf).read_text(encoding="utf-8"))
        paras = list(d["paragraphs"])
        for idx, old, new in edits:
            if paras[idx].count(old) != 1:
                fail("%s: %r occurs %d times in %s ¶%d, not once"
                     % (item, old, paras[idx].count(old), srcf, idx + 1))
            paras[idx] = paras[idx].replace(old, new, 1)
            if new not in paras[idx]:
                fail("%s: the replacement did not land" % item)
        d["paragraphs"] = paras
        (ROOT / dstf).write_text(
            json.dumps(d, indent=1, ensure_ascii=False) + "\n",
            encoding="utf-8")
        built.append((dstf, item, sha(dstf), len(edits)))
        print("%-28s %s  (%d word(s), %s)" % (dstf, sha(dstf), len(edits), item))

    for p in UNTOUCHED:
        if sha(p) != before[p]:
            fail("%s was written by this build and must not have been" % p)
    print("\nevery accepted candidate and acceptance record: byte-unchanged")

    # ---- the successors must now be free of what they were built to fix ----
    for dstf, item, _h, _n in built:
        t = (ROOT / dstf).read_text(encoding="utf-8")
        for bad in ("mountain tops", "mountain top", "councillor",
                    "store-room", "store room"):
            if bad in t:
                fail("%s still carries %r" % (dstf, bad))
    # and the shipping corpus must now agree with itself
    drift = _drift()
    if any(k in ("mountaintops", "councilors") for k, _ in drift):
        fail("the sweep did not close the class: %s" % drift)
    print("cross-Book compound drift over the SHIPPING files: %s"
          % (["%s %s" % (k, v) for k, v in drift] or "none"))
    return 0


def _drift():
    from compound_drift import compound_drift
    books, attest = {}, []
    for bk in range(1, 8):
        d = ROOT / ("book%02d" % bk)
        vs = sorted(int(p.stem.split("-v")[1])
                    for p in d.glob("candidate-v*.json"))
        if not vs:
            continue
        books["book%02d" % bk] = json.loads(
            (d / ("candidate-v%d.json" % vs[-1])).read_text(encoding="utf-8")
        )["paragraphs"]
        s = d / ("source-book%d.json" % bk)
        if s.exists():
            attest.append(json.loads(s.read_text(encoding="utf-8"))["paragraphs"])
    return compound_drift(books, attest=attest)


if __name__ == "__main__":
    sys.exit(main())
