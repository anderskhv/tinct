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

**WHAT THIS PROOF DOES NOT PROVE, so the next worker starts where this one
stopped.**

* **It cannot grade a reason.** Every gate in the package has a declared
  escape — `DECLARED` — and a defect can still be legalized by declaring it
  and re-running `--write-manifest`. Attack A9 does exactly that and passes,
  because it must: that is the workflow. What the repair buys is that the
  declaration has to exist, be evaluated (`--declarations`), carry a written
  reason, and appear in a diff.
* **It proves nothing about the CONTENT gates themselves** — only that they
  are put to the files the package claims they were put to. Whether
  byte-identity, thinness, growth and compound drift are the right four
  measures is a different question and this file does not touch it.
* **`SUPERSEDED` is a list of files nothing evaluates, by design.** They are
  rejected drafts. If one of them were ever revived, nothing here would
  notice that it had never been gated; reviving a superseded file means moving
  its row into `DECLARED`, and only a person can do that.
* **The package digest excludes `prove_manifest-output.txt`.** A defect
  written only into that file would not be seen by the before/after hash.

Run: `python3 scripts/prove_manifest.py`  (**about twenty minutes**: every
attack works on a fresh copy of the package, and several run the full gates
over twenty declared files across nine Books)
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
    expect("checks.py 7 passes on the accepted candidate", rc == 0 and
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
    edit_json(w / "book07/candidate-v2.json",
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
    edit_json(w / "book07/candidate-v2.json", plant)
    rc, out = run(w, "7", "--no-write")
    expect("checks.py 7 fails the planted candidate", rc != 0 and
           "GATES FAILED" in out, out[-400:])
    rc, out = run(w, "7", "--version", "2", "--write-manifest")
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
    print("\n6. S-3 and R-5 — the enumerations, both directions")
    cases = [
        ("byte-identical: an UNDECLARED instance appears (Book 7 declares none)",
         "book07/candidate-v2.json",
         lambda d, s: d["paragraphs"].__setitem__(1, s["paragraphs"][1]),
         7, "but book07/candidate-v2.json declares []"),
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
    ]
    for name, rel, fn, book, needle in cases:
        w = fresh()
        s = json.loads((w / ("book%02d/source-book%d.json" % (book, book)))
                       .read_text(encoding="utf-8"))
        edit_json(w / rel, lambda d: fn(d, s))
        rc, out = run(w, str(book), "--no-write", "--version",
                      rel.split("-v")[1][0])
        expect(name, rc != 0 and needle in out,
               "\n".join(l for l in out.splitlines() if "✗" in l))
        shutil.rmtree(w.parent)

    # ---- 6b. R-5, against DECLARED itself and not against a local Counter. -
    #
    # **The fifth enumerated case above used to be DEAD CODE.** It was written
    # `("growth: a SECOND growth identical to a declared one — the R-5 hole",
    # ..., lambda d, s: None,  # filled in below ...)` and the loop that ran
    # the cases read `cases[:4]`. It was never filled in and never run, and
    # what stood in its place was an assertion over two hand-built
    # `collections.Counter`s — a demonstration that multisets behave like
    # multisets, which is true of Python and says nothing about this package.
    # **R-5 is a claim about `DECLARED` and the gate that reads it**, so it is
    # proved against those, end to end, through the command line.
    #
    # The hole was that the comparison used to be MEMBERSHIP, so a second
    # growth *in the same paragraph* identical to a declared one was absorbed
    # by the declaration of the first. That needs a Book with two identical
    # growths in one paragraph; no accepted Book has such a pair, so one is
    # built — a synthetic Book 99, inside the throwaway copy, with two
    # sentences in its single paragraph each grown 50 -> 51.
    print("\n6b. R-5 — a SECOND identical growth, against DECLARED end to end")
    filler_a, filler_b = " ".join(["alpha"] * 47), " ".join(["bravo"] * 47)

    def plant_book99(w, declared_growths):
        (w / "book99").mkdir(exist_ok=True)
        (w / "book99/source-book99.json").write_text(json.dumps(
            {"paragraphs": ["He said %s now. She said %s now."
                            % (filler_a, filler_b)]}, indent=1) + "\n",
            encoding="utf-8")
        (w / "book99/candidate-v1.json").write_text(json.dumps(
            {"paragraphs": ["He said %s then indeed. She said %s then indeed."
                            % (filler_a, filler_b)]}, indent=1) + "\n",
            encoding="utf-8")
        cp = w / "scripts/checks.py"
        cp.write_text(cp.read_text(encoding="utf-8").replace(
            "DECLARED = {",
            'DECLARED = {\n    "book99/candidate-v1.json": _decl(growth=%r, '
            'reason="planted by prove_manifest.py"),' % (declared_growths,),
            1), encoding="utf-8")

    needle = "a sentence grew past 50 words — P001 50→51"
    w = fresh()
    plant_book99(w, [(1, 50, 51), (1, 50, 51)])          # both declared
    rc, out = run(w, "99", "--no-write")
    control_silent = needle not in out
    shutil.rmtree(w.parent)
    w = fresh()
    plant_book99(w, [(1, 50, 51)])                       # only ONE declared
    rc, out = run(w, "99", "--no-write")
    fires_once = out.count(needle) == 1
    expect("R-5: two identical growths in one paragraph, ONE declared — the "
           "gate fires exactly once; both declared — it is silent",
           control_silent and fires_once and rc != 0,
           "control silent=%s; one-declared fires once=%s"
           % (control_silent, fires_once))
    shutil.rmtree(w.parent)

    # ---- 7. THE ATTACKS. --------------------------------------------------
    #
    # **This mechanism has been claimed fixed twice and been wrong twice**, and
    # both times for the same reason: the proof exercised the paths the
    # implementation happens to take. A proof of that shape cannot fail. So
    # this section is written the other way round — as attacks, each one the
    # cheapest next move available to somebody who wants a defective candidate
    # to pass, and each one run against the repair rather than alongside it.
    #
    # The attack that actually landed, found by Book 8's round 1 and
    # reproduced here before anything was changed: plant a gate-failing defect
    # in an accepted candidate, then edit **one field** of the manifest —
    # `checks.candidate_sha256` — so the bytes-moved clause is satisfied.
    # `checks.py --manifests` exited 0 while `checks.py 7` exited 1. The
    # `all_gates_passed` clause was guarded on `gate is not None`, and
    # `--manifests` never passed one, so on the path most people run the clause
    # did not exist.
    print("\n7. the attacks — each is the cheapest next move after the last")

    def defect(w, rel="book07/candidate-v2.json", book=7):
        """Plant a gate-failing defect: a paragraph left byte-identical to
        Butler in a Book that declares none."""
        s = json.loads((w / ("book%02d/source-book%d.json" % (book, book)))
                       .read_text(encoding="utf-8"))
        edit_json(w / rel, lambda d: d["paragraphs"].__setitem__(
            1, s["paragraphs"][1]))

    def rehash(w, **fields):
        mp = w / "book07/manifest.json"
        m = json.loads(mp.read_text(encoding="utf-8"))
        m["checks"].update(fields)
        cf = w / m["checks"]["candidate_file"]
        m["checks"]["candidate_sha256"] = hashlib.sha256(
            cf.read_bytes()).hexdigest()
        mp.write_text(json.dumps(m, indent=1, ensure_ascii=False) + "\n",
                      encoding="utf-8")

    def attack(name, build, mode="--manifests"):
        w = fresh()
        build(w)
        rc, out = run(w, mode)
        expect(name, rc != 0,
               "\n".join(l for l in out.splitlines() if "✗" in l)[:400]
               or out[-300:])
        shutil.rmtree(w.parent)

    # A1 — the reviewer's attack verbatim.
    attack("A1  defect + rewrite candidate_sha256 (the attack that landed)",
           lambda w: (defect(w), rehash(w)))
    # A2 — withdraw the claim instead of backing it. If `all_gates_passed` is
    #      what triggers the check, simply do not claim it.
    attack("A2  the same, with all_gates_passed withdrawn (false)",
           lambda w: (defect(w), rehash(w, all_gates_passed=False)))
    # A3 — leave the defect where it is and point the manifest somewhere clean.
    #      This is the move the repair of A1 creates, and it needed clause (b2).
    attack("A3  defect left in place, candidate_file repointed at a clean file",
           lambda w: (defect(w),
                      rehash(w, candidate_file="book07/candidate-v1.json")))
    # A4 — drop the block that carries the claim.
    attack("A4  the whole `checks` block deleted",
           lambda w: edit_json(w / "book07/manifest.json",
                               lambda m: m.pop("checks", None)))
    # A5 — the figures beside the hashes. The hashes prove the bytes did not
    #      move; nothing used to prove the NUMBERS, which is what is read.
    attack("A5  a figure edited in the manifest, every hash left sound",
           lambda w: edit_json(w / "book07/manifest.json",
                               lambda m: m["checks"].__setitem__(
                                   "retention", 0.99999)))
    # A6 — THE DECLARED SHAPE, which is the same attack one layer down: put the
    #      defect in a file no invocation reaches. This is not hypothetical —
    #      it is what `book02/candidate-v3/v4/v5.json` were actually doing.
    attack("A6  defect planted in book02/candidate-v3.json, which no "
           "invocation used to reach",
           lambda w: defect(w, "book02/candidate-v3.json", 2),
           mode="--declarations")
    # A7 — and its complement: a new candidate file that declares nothing.
    attack("A7  a new candidate file appears in neither table",
           lambda w: shutil.copy(w / "book07/candidate-v2.json",
                                 w / "book07/candidate-v3.json"),
           mode="--declarations")
    # A8 — a successor written and the shipping column left pointing behind it.
    #      This is how `compound_drift.py` came to read Book 7's rejected v1.
    def a8(w):
        shutil.copy(w / "book02/candidate-v6.json", w / "book02/candidate-v7.json")
        cp = w / "scripts/checks.py"
        cp.write_text(cp.read_text(encoding="utf-8").replace(
            '"book02/candidate-v6.json": _decl(',
            '"book02/candidate-v7.json": _decl(growth=[(19, 49, 50), '
            '(28, 57, 58)], reason="planted"),\n    '
            '"book02/candidate-v6.json": _decl(', 1), encoding="utf-8")
    attack("A8  a successor written, ACCEPTED's shipping column left stale",
           a8, mode="--declarations")
    # A10 — THE CLASS THIS SCRIPT'S OWN CONTROL FOUND, at Book 9. Accepting
    #       Book 8 added a ninth row to the cross-Book table every
    #       `checks-vN.md` prints, so every earlier Book's checks file stopped
    #       reproducing from the code that writes it — and `--manifests`
    #       passed, because the recorded hash and the file on disk were the
    #       same stale pair and nothing compared either against the CODE.
    #       Found because section 1 here re-runs `checks.py 7` in a fresh copy
    #       and the rewritten file no longer matched, which is the one thing
    #       this script does that no instrument does.
    def a10(w):
        cp = w / "scripts/checks.py"
        cp.write_text(cp.read_text(encoding="utf-8").replace(
            '"| bag retention (order-blind) | %.5f |" % f["bag"],',
            '"| bag retention (order-blind, revised) | %.5f |" % f["bag"],'),
            encoding="utf-8")
    attack("A10 the renderer changes and the generated checks file no longer "
           "reproduces — no candidate touched, every hash internally "
           "consistent", a10)

    # A9 — the residue, found by attacking the repair and being WRONG about
    #      it. The first form of this attack — declare the defect, rewrite the
    #      candidate hash — still EXITS 1, because clause (b3) recomputes the
    #      figures and a declared byte-identical paragraph moves them. So
    #      legalizing a defect now costs the full ceremony: declare it with a
    #      written reason, and re-run `--write-manifest`, which re-runs the
    #      gates. That is the intended workflow, and it passes, as it must.
    #      **The residue is not a hole in the mechanism; it is that no
    #      mechanism can grade a reason.** What the repair buys is that the
    #      reason has to exist, in a table that is evaluated, in a diff.
    w = fresh()
    defect(w)
    cp = w / "scripts/checks.py"
    cp.write_text(cp.read_text(encoding="utf-8").replace(
        '"book07/candidate-v2.json": _decl(',
        '"book07/candidate-v2.json": _decl(byte_identical=[2], ', 1),
        encoding="utf-8")
    rc_before, _ = run(w, "--manifests")
    # The full ceremony, and it is larger than it was: A10's clause compares
    # the RENDERED checks file against the manifest, and every Book's checks
    # file prints the cross-Book table, so changing one Book's retention makes
    # every other Book's generated file stop reproducing. Legalizing a defect
    # therefore costs a regeneration of every Book that has a checks block —
    # which is a large, visible diff, and that is the point.
    for book, ver in ((6, 2), (7, 2), (8, 2), (9, 1)):
        run(w, str(book), "--version", str(ver), "--write-manifest")
    rc_after, out = run(w, "--manifests")
    expect("A9  the residue: DECLARING the defect is not enough (exit 1 — the "
           "figures and every generated checks file move); declaring it AND "
           "regenerating EVERY Book's manifest passes, as the intended "
           "workflow must",
           rc_before != 0 and rc_after == 0,
           "declared only -> exit %d;  declared + the full ceremony -> exit %d"
           % (rc_before, rc_after))
    shutil.rmtree(w.parent)

    # ---- 8. nothing in the package was written. ---------------------------
    after = package_digest(ROOT)
    expect("the package itself is byte-unchanged by this proof",
           before == after, "%s == %s" % (before[:16], after[:16]))

    print("\n%d assertions, %d passed."
          % (len(RESULTS), sum(1 for _, ok, _ in RESULTS if ok)))
    return 0 if all(ok for _, ok, _ in RESULTS) else 1


if __name__ == "__main__":
    sys.exit(main())
