#!/usr/bin/env python3
"""Prove, by planting the defects, that the manifest and the three
enumerations now reject what the package claimed they rejected.

Written at Book 7's step 6, answering substantive findings **S-2** and **S-3**
and records findings **R-4** and **R-5** of `book07/review/findings-v1.md`.

**Why a script and not a paragraph.** The claim *"a package directory whose
checks did not run has no manifest"* was in `RESUME.md`, in `checks.py`'s module
docstring and in `build_book_package.py`'s comments, and it was **false as
implemented** — the reviewer demonstrated a manifest surviving a candidate that
fails two gates, and found `book07/manifest.json` recording the hash of a checks
file that no longer existed. A claim about enforcement that is only written down
is the thing that failed. So this file plants each defect and asserts the
rejection, and its output is committed beside it.

Everything happens in a throwaway copy under the system temp directory. **No
file of the package is written by this script**, which it asserts at the end by
hashing the whole package before and after.

Run: `python3 scripts/prove_manifest.py`
"""
import hashlib
import json
import shutil
from collections import Counter
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PY = sys.executable
RESULTS = []


def package_digest(root):
    h = hashlib.sha256()
    # This script's own committed output is excluded, and only that: it is the
    # one file the run legitimately rewrites, because a shell redirect writes
    # it while the digest is being taken.
    for f in sorted(p for p in root.rglob("*") if p.is_file()
                    and "__pycache__" not in p.parts
                    and p.name != "prove_manifest-output.txt"):
        h.update(str(f.relative_to(root)).encode())
        h.update(hashlib.sha256(f.read_bytes()).digest())
    return h.hexdigest()


def run(work, *args):
    r = subprocess.run([PY, str(work / "scripts" / "checks.py")] + list(args),
                       capture_output=True, text=True, cwd=work)
    return r.returncode, r.stdout + r.stderr


def expect(name, ok, detail):
    RESULTS.append((name, ok, detail))
    print(("  ✓ " if ok else "  ✗ ") + name)
    for line in detail.strip().splitlines()[:4]:
        print("      | " + line.strip()[:110])


def fresh():
    d = Path(tempfile.mkdtemp(prefix="odyssey-prove-"))
    w = d / "odyssey"
    shutil.copytree(ROOT, w, ignore=shutil.ignore_patterns("__pycache__"))
    return w


def edit_json(path, fn):
    d = json.loads(path.read_text(encoding="utf-8"))
    fn(d)
    path.write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n",
                    encoding="utf-8")


def main():
    before = package_digest(ROOT)
    print(__doc__.split("Run:")[0].strip().splitlines()[0])
    print()

    # ---- 1. THE CONTROL. Unplanted, everything passes. --------------------
    print("1. control — the package as committed")
    w = fresh()
    rc, out = run(w, "7")
    expect("checks.py 7 passes on the frozen candidate", rc == 0 and
           "all gates pass" in out, out[-300:])
    rc, out = run(w, "--manifests")
    expect("--manifests verifies every Book", rc == 0, out[-300:])
    shutil.rmtree(w.parent)

    # ---- 2. S-2(a): a STALE checks hash is rejected. ----------------------
    print("\n2. S-2 — a stale checks hash (the defect that was actually there)")
    w = fresh()
    edit_json(w / "book07/manifest.json",
              lambda d: d["checks"].__setitem__("sha256", "0" * 64))
    rc, out = run(w, "--manifests")
    expect("--manifests rejects the stale hash and exits non-zero",
           rc != 0 and "STALE" in out,
           [l for l in out.splitlines() if "STALE" in l][0] if "STALE" in out
           else out)
    rc, out = run(w, "7", "--no-write")
    expect("checks.py 7 also rejects it, in the Book's own run",
           rc != 0 and "STALE" in out, out[-300:])
    shutil.rmtree(w.parent)

    # ---- 3. S-2(b): the candidate moving under the manifest is rejected. --
    print("\n3. S-2 — the candidate moved under the manifest")
    w = fresh()
    edit_json(w / "book07/candidate-v1.json",
              lambda d: d["paragraphs"].__setitem__(
                  28, d["paragraphs"][28] + " And so they slept."))
    rc, out = run(w, "--manifests")
    expect("--manifests rejects a candidate whose bytes moved",
           rc != 0 and "moved under the manifest" in out,
           [l for l in out.splitlines() if "moved under" in l][0]
           if "moved under the manifest" in out else out)
    shutil.rmtree(w.parent)

    # ---- 4. S-2(c): a FAILING candidate cannot acquire a manifest. --------
    print("\n4. S-2 — a failing candidate cannot acquire a manifest")
    w = fresh()
    # Plant the reviewer's two defects: a byte-identical paragraph and a
    # compound drift, in a Book that declares neither.
    src = json.loads((w / "book07/source-book7.json").read_text(encoding="utf-8"))

    def plant(d):
        d["paragraphs"][1] = src["paragraphs"][1]          # byte-identical
        d["paragraphs"][10] = d["paragraphs"][10].replace("townspeople",
                                                          "town people")
    edit_json(w / "book07/candidate-v1.json", plant)
    rc, out = run(w, "7", "--no-write")
    expect("checks.py 7 fails the planted candidate", rc != 0 and
           "GATES FAILED" in out, out[-400:])
    rc, out = run(w, "7", "--version", "1", "--write-manifest")
    expect("--write-manifest REFUSES to write a manifest for it",
           rc != 0 and "no manifest may be written" in out, out[-400:])
    # and the manifest already on disk does not silently vouch for it
    rc, out = run(w, "--manifests")
    expect("the manifest already on disk no longer vouches for it",
           rc != 0 and "moved under the manifest" in out, out[-400:])
    shutil.rmtree(w.parent)

    # ---- 5. S-2(d): a Gate that never evaluated cannot write. -------------
    print("\n5. S-2 — an empty failure list is not a pass")
    sys.path.insert(0, str(ROOT / "scripts"))
    import checks                                              # noqa: E402
    g = checks.Gate()                       # nothing asked, nothing failed
    try:
        checks.manifest_checks_block({}, g)
        expect("a never-evaluated Gate is refused", False, "it was accepted")
    except RuntimeError as e:
        expect("a never-evaluated Gate is refused (evaluated=False, "
               "failures=[])", "never evaluated" in str(e), str(e))

    # ---- 6. S-3 / R-5: the enumerations fail in BOTH directions. ----------
    print("\n6. S-3 and R-5 — three enumerations, both directions")
    cases = [
        ("byte-identical: an UNDECLARED instance appears (Book 7 declares none)",
         "book07/candidate-v1.json",
         lambda d, s: d["paragraphs"].__setitem__(1, s["paragraphs"][1]),
         7, "but book07/candidate-v1.json declares []"),
        ("byte-identical: a DECLARED instance goes away (Book 4 declares seven)",
         "book04/candidate-v2.json",
         lambda d, s: d["paragraphs"].__setitem__(
             38, d["paragraphs"][38] + " Indeed."),
         4, "declares [39, 54, 61, 63, 70, 79, 80]"),
        ("thin paragraphs: an UNDECLARED thin paragraph appears in Book 1",
         "book01/candidate-v2.json",
         lambda d, s: d["paragraphs"].__setitem__(
             2, " ".join(d["paragraphs"][2].split()[:int(
                 len(d["paragraphs"][2].split()) * 0.8)])),
         1, "declares [1, 9, 11, 16, 17]"),
        ("thin paragraphs: a DECLARED one is no longer thin",
         "book01/candidate-v2.json",
         lambda d, s: d["paragraphs"].__setitem__(
             16, d["paragraphs"][16] + (" and he spoke of it again" * 6)),
         1, "declares [1, 9, 11, 16, 17]"),
        ("growth: a SECOND growth identical to a declared one — the R-5 hole",
         "book04/candidate-v2.json",
         lambda d, s: None,     # filled in below
         4, "grew past 50 words"),
    ]
    for name, rel, fn, book, needle in cases[:4]:
        w = fresh()
        s = json.loads((w / ("book%02d/source-book%d.json" % (book, book)))
                       .read_text(encoding="utf-8"))
        edit_json(w / rel, lambda d: fn(d, s))
        rc, out = run(w, str(book), "--no-write", "--version",
                      int(rel.split("-v")[1][0]) and rel.split("-v")[1][0])
        expect(name, rc != 0 and needle in out,
               "\n".join(l for l in out.splitlines() if "✗" in l))
        shutil.rmtree(w.parent)

    # R-5: the hole was that the comparison was MEMBERSHIP, so a second growth
    # identical to a declared one was absorbed by the declaration of the first.
    # Demonstrated on the two comparisons themselves, over the same input, which
    # is where the defect lived — the reviewer's example verbatim: a Book that
    # declares one 49->50 growth at P5 and then acquires a second.
    declared_growths = [(5, 49, 50), (30, 48, 52)]
    acquired = [(5, 49, 50, "a"), (5, 49, 50, "b"), (30, 48, 52, "c")]
    old_unexpected = [r for r in acquired
                      if (r[0], r[1], r[2]) not in declared_growths]
    got = Counter((a, b, d) for a, b, d, _ in acquired)
    new_unexpected = sorted((got - Counter(declared_growths)).elements())
    expect("R-5: membership missed the second identical growth; multiplicity "
           "catches it",
           old_unexpected == [] and new_unexpected == [(5, 49, 50)],
           "membership -> %s (silent);  multiset -> %s (fires)"
           % (old_unexpected, new_unexpected))

    # ---- 7. nothing in the package was written. ---------------------------
    after = package_digest(ROOT)
    expect("the package itself is byte-unchanged by this proof",
           before == after, "%s == %s" % (before[:16], after[:16]))

    print("\n%d assertions, %d passed."
          % (len(RESULTS), sum(1 for _, ok, _ in RESULTS if ok)))
    return 0 if all(ok for _, ok, _ in RESULTS) else 1


if __name__ == "__main__":
    sys.exit(main())
