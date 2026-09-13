#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""A11 — the third defeat of `prove_manifest.py`: **nothing pins Butler.**

`scripts/prove_manifest.py` is nine attacks and twenty-five assertions, and
every one of them moves the CANDIDATE or the MANIFEST.  A1-A5 edit a manifest
field; A6-A8 move a candidate file in or out of the tables; A10 changes the
renderer.  A9 declares a defect and regenerates, and is accepted because no
mechanism can grade a reason.

**No attack moves the SOURCE, and no clause pins it.**

    figures(book, load("book%02d/source-book%d.json" % (book, book)),
            load(ck["candidate_file"]))

Clause (b3) recomputes the figures from `bookNN/source-bookN.json` — a file
loaded by NAMING CONVENTION, whose sha256 appears in no manifest, in no
`DECLARED` row, in no `ACCEPTED` row and in no assertion of
`prove_manifest.py`.  Retention, the splitting rate, the semicolon and
dividing-mark censuses, MOVE-GAP, the sixty-word gate, the thinness gate, the
growth gate and the byte-identity gate are all computed **against that file**.
It is the one end of every comparison the package makes, and it is unheld.

The `verify_source_bookN.py` scripts do tie it to PG #1727 — but they are
standalone, `--all` does not call them, `--manifests` does not call them,
`build_book_package.py` does not call them, and `prove_manifest.py` does not
call them.  Their output is a committed `.txt` that no clause re-derives.

Two forms are demonstrated:

**A11(a) — the LOUD form.**  Edit the source so a figure moves, then re-run
`checks.py N --write-manifest`, which is the ordinary workflow.  Every hash is
internally consistent afterwards and the whole package exits 0.  It needs no
declaration, so it is not A9: A9 at least leaves a `DECLARED` row and a
written reason in the diff, and this leaves a changed Butler.

**A11(b) — the SILENT form, and it is the worse one.**  Remove one comma from
Butler's source.  No token changes, no sentence boundary changes, no dividing
mark changes — so not one of the sixteen recorded figures moves, the
`checks-vN.md` the code would write is byte-identical, and **nothing has to be
regenerated at all**.  `--all`, `--manifests` and `--declarations` pass over a
corrupted base text with the committed manifest untouched.

Run: `python3 book09/review/attack_manifest_a11.py`   (about six minutes)
"""
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

PKG = Path(__file__).resolve().parent.parent.parent
PY = sys.executable
RESULTS = []


def fresh():
    d = Path(tempfile.mkdtemp(prefix="odyssey-a11-"))
    w = d / "odyssey"
    shutil.copytree(PKG, w, ignore=shutil.ignore_patterns("__pycache__"))
    return w


def run(work, *args):
    r = subprocess.run([PY, str(work / "scripts" / "checks.py")] + list(args),
                       capture_output=True, text=True, cwd=work)
    return r.returncode, r.stdout + r.stderr


def expect(name, ok, detail=""):
    RESULTS.append((name, ok))
    print(("  ✓ " if ok else "  ✗ ") + name)
    for line in str(detail).strip().splitlines()[:3]:
        print("      | " + line.strip()[:110])


def main():
    print("A11 — the source file is the unheld end of every comparison")
    print()

    # ---- 0. the control: the package as committed ------------------------
    print("0. control — the package as committed")
    w = fresh()
    rc, out = run(w, "--manifests")
    expect("--manifests exits 0 on the untouched package", rc == 0,
           out.strip().splitlines()[-1] if out.strip() else "")
    shutil.rmtree(w.parent)

    # ---- 1. A11(b), the SILENT form -------------------------------------
    print("\n1. A11(b) — one comma removed from Butler, nothing regenerated")
    w = fresh()
    p = w / "book08/source-book8.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    tgt = None
    for i, para in enumerate(d["paragraphs"]):
        if ", " in para:
            tgt = i
            before = para
            d["paragraphs"][i] = para.replace(", ", " ", 1)
            break
    assert tgt is not None
    p.write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n",
                 encoding="utf-8")
    print("      | B08-P%03d: %r -> %r"
          % (tgt + 1, before[:60], d["paragraphs"][tgt][:60]))
    # the manifest is NOT touched and NOTHING is regenerated.
    rc1, o1 = run(w, "8")
    rc2, o2 = run(w, "--manifests")
    rc3, o3 = run(w, "--all")
    expect("checks.py 8 still passes over a corrupted Butler", rc1 == 0,
           [l for l in o1.splitlines() if "gate" in l][-1:])
    expect("--manifests still exits 0", rc2 == 0)
    expect("--all still exits 0 — every published figure 'reproduces'",
           rc3 == 0)
    # and prove the corruption really is there
    q = json.loads((w / "book08/source-book8.json").read_text(encoding="utf-8"))
    r = json.loads((PKG / "book08/source-book8.json").read_text(encoding="utf-8"))
    expect("and the source on disk really did change",
           q["paragraphs"] != r["paragraphs"])
    shutil.rmtree(w.parent)

    # ---- 2. A11(a) on BOOK 9, the Book under review -----------------------
    print("\n2. A11(a) — Butler rewritten to flatter the candidate, on the Book\n"
          "   under review, then the ordinary workflow: "
          "`checks.py 9 --write-manifest`")
    w = fresh()
    p = w / "book09/source-book9.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    joins = 0
    for i, para in enumerate(d["paragraphs"]):
        while ". " in para and joins < 12:
            para = para.replace(". ", "; ", 1)
            joins += 1
        d["paragraphs"][i] = para
        if joins >= 12:
            break
    p.write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n",
                 encoding="utf-8")
    print("      | %d of Butler's full stops turned into semicolons" % joins)
    rc0, o0 = run(w, "--manifests")
    expect("BEFORE regenerating, --manifests catches it — clause (b3) "
           "recomputes the figures", rc0 != 0,
           [l for l in o0.splitlines() if "book09 records" in l][:2])
    rc1, o1 = run(w, "9", "--write-manifest")
    rc2, o2 = run(w, "--manifests")
    rc3, o3 = run(w, "--all")
    rc4, o4 = run(w, "--declarations")
    expect("after --write-manifest, checks.py 9 passes", rc1 == 0)
    expect("--manifests exits 0 over a rewritten Butler", rc2 == 0,
           o2.strip().splitlines()[-1])
    expect("--all exits 0", rc3 == 0)
    expect("--declarations exits 0", rc4 == 0)
    newm = json.loads((w / "book09/manifest.json").read_text(encoding="utf-8"))
    oldm = json.loads((PKG / "book09/manifest.json").read_text(encoding="utf-8"))
    print("      | published raw D17 %s%% -> %s%%"
          % (oldm["checks"]["splitting_rate_raw_pct"],
             newm["checks"]["splitting_rate_raw_pct"]))
    print("      | published retention %s -> %s"
          % (oldm["checks"]["retention"], newm["checks"]["retention"]))
    expect("and no declaration was needed — checks.py is byte-identical",
           (w / "scripts/checks.py").read_bytes()
           == (PKG / "scripts/checks.py").read_bytes())
    shutil.rmtree(w.parent)

    # ---- 2b. the same on an ACCEPTED Book, and why it is caught ------------
    print("\n2b. the same attack on ACCEPTED Book 8 — caught, but not by any\n"
          "    clause about the source")
    w = fresh()
    p = w / "book08/source-book8.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    joins = 0
    for i, para in enumerate(d["paragraphs"]):
        while ". " in para and joins < 12:
            para = para.replace(". ", "; ", 1)
            joins += 1
        d["paragraphs"][i] = para
        if joins >= 12:
            break
    p.write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n",
                 encoding="utf-8")
    rc1, o1 = run(w, "8", "--write-manifest")
    rc2, o2 = run(w, "--manifests")
    expect("checks.py 8 --write-manifest passes over a rewritten Butler",
           rc1 == 0)
    expect("--manifests then FAILS — and the failures name book01..book07, "
           "not book08", rc2 != 0,
           [l for l in o2.splitlines() if "\u2717" in l][:3])
    print("      | it is the A10 clause: Book 8 is ACCEPTED, so its figures are")
    print("      | printed in every other Book's cross-Book table, and those")
    print("      | generated files stop reproducing. An accidental coupling —")
    print("      | and Book 9 is not in that table, which is why step 2 lands.")
    print("      | The documented remedy (re-run `checks.py N --write-manifest`")
    print("      | for every Book) is also the attacker's next move.")
    shutil.rmtree(w.parent)

    # ---- 3. the hash nobody keeps ---------------------------------------
    print("\n3. what would close it")
    for bk in range(1, 10):
        f = PKG / ("book%02d/source-book%d.json" % (bk, bk))
        if f.exists():
            print("      | book%02d/source-book%d.json  sha256 %s"
                  % (bk, bk, hashlib.sha256(f.read_bytes()).hexdigest()[:16]))
    print("      | none of these appears in any manifest, in ACCEPTED, in "
          "DECLARED,")
    print("      | in SUPERSEDED or in any assertion of prove_manifest.py.")

    print()
    bad = [n for n, o in RESULTS if not o]
    print("%d/%d assertions held." % (len(RESULTS) - len(bad), len(RESULTS)))
    if bad:
        for n in bad:
            print("  unexpected: %s" % n)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
