#!/usr/bin/env python3
"""**Attacking the repair of A11**, from the outside, through the command line.

This mechanism has been claimed sound three times and defeated three times —
A1's one-field rewrite, A10's non-reproducing renderer, A11's unheld source —
so the repair is not asserted here, it is attacked. Every attack below runs
the real `scripts/checks.py` on a fresh copy of the whole package, as a fifth
worker would.

**The ordering is the point.** Each attack is the cheapest next move once the
one above it has failed, which is how A1 → A2 → A3 was found and how A11 was
found after A10. The last one PASSES, and is named rather than hidden.

Run: `python3 scripts/attack_source_pin.py`  (a few minutes)
"""
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

PKG = Path(__file__).resolve().parent.parent
PY = sys.executable
RESULTS = []


def fresh():
    """A copy of the package **in its own tree shape**.

    `pg_source.py` reaches the served `original-en` at
    `../../../app/public/data/editions/`, so a copy dropped anywhere else
    cannot find it — and the first run of this script proved why that matters:
    every attack was "rejected", and control 0 was rejected too, which means
    they were all being rejected for a reason that had nothing to do with the
    attack. That is the failure D18 clause (a) exists for and the one this
    package has hit five times. So the copy reproduces the three directories
    above the package as well."""
    d = Path(tempfile.mkdtemp(prefix="odyssey-pin-"))
    w = d / "books/staged-replacements/odyssey"
    w.parent.mkdir(parents=True)
    shutil.copytree(PKG, w, ignore=shutil.ignore_patterns("__pycache__"))
    served = PKG.parent.parent.parent / "app/public/data/editions/odyssey-original-en.json"
    dest = d / "app/public/data/editions"
    dest.mkdir(parents=True, exist_ok=True)
    shutil.copy2(served, dest / "odyssey-original-en.json")
    return w


def run(work, *args):
    r = subprocess.run([PY, str(work / "scripts" / "checks.py")] + list(args),
                       capture_output=True, text=True, cwd=work)
    return r.returncode, r.stdout + r.stderr


def rewrite_source(w, book, fn):
    p = w / ("book%02d/source-book%d.json" % (book, book))
    d = json.loads(p.read_text(encoding="utf-8"))
    d["paragraphs"] = fn(d["paragraphs"])
    p.write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n",
                 encoding="utf-8")
    return p


def rewrite_served(w, book, fn):
    p = w.parents[2] / "app/public/data/editions/odyssey-original-en.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    d["chapters"][book - 1]["paragraphs"] = fn(
        d["chapters"][book - 1]["paragraphs"])
    p.write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n",
                 encoding="utf-8")


def one_comma(ps):
    out = list(ps)
    for i, para in enumerate(out):
        if ", " in para:
            out[i] = para.replace(", ", " ", 1)
            return out
    raise AssertionError


def twelve_stops(ps):
    out, n = list(ps), 0
    for i, para in enumerate(out):
        while n < 12 and ". " in out[i]:
            out[i] = out[i].replace(". ", "; ", 1)
            n += 1
        if n >= 12:
            break
    assert n == 12
    return out


def expect(name, rejected, detail=""):
    RESULTS.append((name, rejected))
    print(("  ✓ REJECTED  " if rejected else "  ✗ PASSES    ") + name)
    for line in str(detail).strip().splitlines()[:2]:
        print("        | " + line.strip()[:112])


def main():
    print(__doc__.split("Run:")[0].strip()[:0] or "", end="")
    print("attack_source_pin.py — attacking the repair of A11\n")

    print("0. control — the package as committed")
    w = fresh()
    rc, out = run(w, "--manifests")
    expect("the untouched package still exits 0 (if this fails, every verdict "
           "below is meaningless)", rc == 0,
           out.strip().splitlines()[-1] if out.strip() else "")
    shutil.rmtree(w.parents[2])

    # ---------------------------------------------------------------- P1
    print("\n1. A11(b) re-run — ONE COMMA removed from Butler, nothing "
          "regenerated\n   (the attack that held 13 of 13 before the repair)")
    w = fresh()
    rewrite_source(w, 8, one_comma)
    rc1, o1 = run(w, "8")
    rc2, o2 = run(w, "--manifests")
    rc3, o3 = run(w, "--all")
    expect("checks.py 8", rc1 != 0,
           [l for l in o1.splitlines() if "SOURCE" in l or "source:" in l][:2])
    expect("--manifests", rc2 != 0,
           [l for l in o2.splitlines() if "source:" in l][:1])
    expect("--all", rc3 != 0)
    shutil.rmtree(w.parents[2])

    # ---------------------------------------------------------------- P2
    print("\n2. A11(a) re-run — twelve full stops rewritten as semicolons, "
          "then\n   the ordinary `checks.py 9 --write-manifest`")
    w = fresh()
    rewrite_source(w, 9, twelve_stops)
    rc1, o1 = run(w, "9", "--write-manifest")
    expect("--write-manifest refuses to regenerate the package's consistency "
           "around an edited Butler", rc1 != 0,
           [l for l in o1.splitlines() if "SOURCE" in l or "edited Butler" in l][:2])
    rc2, o2 = run(w, "--manifests")
    expect("--manifests", rc2 != 0)
    shutil.rmtree(w.parents[2])

    # ---------------------------------------------------------------- P3
    print("\n3. the obvious next move once a hash exists — edit the source AND "
          "\n   write the new sha256 into the manifest")
    w = fresh()
    p = rewrite_source(w, 8, one_comma)
    mp = w / "book08/manifest.json"
    m = json.loads(mp.read_text(encoding="utf-8"))
    m["checks"]["source_sha256"] = hashlib.sha256(p.read_bytes()).hexdigest()
    mp.write_text(json.dumps(m, indent=1, ensure_ascii=False) + "\n",
                  encoding="utf-8")
    rc, out = run(w, "--manifests")
    expect("--manifests — the hash agrees and the DERIVATION does not; a "
           "recorded hash of a file the package also writes is a promise it "
           "makes to itself", rc != 0,
           [l for l in out.splitlines() if "does not reproduce from PG" in l][:1])
    shutil.rmtree(w.parents[2])

    # ---------------------------------------------------------------- P4
    print("\n4. edit the source, the manifest hash AND the served original-en, "
          "\n   so that clause (c) is satisfied too")
    w = fresh()
    p = rewrite_source(w, 8, one_comma)
    rewrite_served(w, 8, one_comma)
    mp = w / "book08/manifest.json"
    m = json.loads(mp.read_text(encoding="utf-8"))
    m["checks"]["source_sha256"] = hashlib.sha256(p.read_bytes()).hexdigest()
    mp.write_text(json.dumps(m, indent=1, ensure_ascii=False) + "\n",
                  encoding="utf-8")
    rc, out = run(w, "--manifests")
    expect("--manifests — clause (d) still refuses: PG #1727 is a third file "
           "and it does not agree", rc != 0,
           [l for l in out.splitlines() if "not an enumerated divergence" in l][:1])
    shutil.rmtree(w.parents[2])

    # ---------------------------------------------------------------- P5
    print("\n5. and edit PG's own text to match — three files now agree")
    w = fresh()
    p = rewrite_source(w, 8, one_comma)
    rewrite_served(w, 8, one_comma)
    src = json.loads(p.read_text(encoding="utf-8"))["paragraphs"]
    pgp = w / "source-texts/pg1727-butler-1900.txt"
    raw = pgp.read_text(encoding="utf-8")
    orig = json.loads((PKG / "book08/source-book8.json").read_text(
        encoding="utf-8"))["paragraphs"]
    i = next(i for i, (a, b) in enumerate(zip(orig, src)) if a != b)
    # the same comma, in PG's own wrapping
    frag = orig[i].split(", ")[0][-28:]
    assert frag in raw.replace("\r\n", "\n")
    raw = raw.replace(frag + ",", frag, 1)
    pgp.write_text(raw, encoding="utf-8", newline="")
    mp = w / "book08/manifest.json"
    m = json.loads(mp.read_text(encoding="utf-8"))
    m["checks"]["source_sha256"] = hashlib.sha256(p.read_bytes()).hexdigest()
    mp.write_text(json.dumps(m, indent=1, ensure_ascii=False) + "\n",
                  encoding="utf-8")
    rc, out = run(w, "--manifests")
    expect("--manifests — PG_SHA256 refuses; the anchor is hashed and the hash "
           "is not in a file the attacker was already editing", rc != 0,
           [l for l in out.splitlines() if "hashes to" in l or "pin is" in l][:1])
    shutil.rmtree(w.parents[2])

    # ---------------------------------------------------------------- P6
    print("\n6. declare it instead — add a row to SOURCE_DIVERGENCES licensing "
          "\n   the edit, which is A9's shape applied to the new register")
    w = fresh()
    rewrite_source(w, 8, one_comma)
    rewrite_served(w, 8, one_comma)
    ps = w / "scripts/pg_source.py"
    t = ps.read_text(encoding="utf-8")
    src = json.loads((w / "book08/source-book8.json").read_text(
        encoding="utf-8"))["paragraphs"]
    orig = json.loads((PKG / "book08/source-book8.json").read_text(
        encoding="utf-8"))["paragraphs"]
    i = next(i for i, (a, b) in enumerate(zip(orig, src)) if a != b) + 1
    t = t.replace("SOURCE_DIVERGENCES = {",
                  'SOURCE_DIVERGENCES = {\n    (8, %d): ("a typographic '
                  'normalization of PG, recorded here for completeness and '
                  'entirely routine, exactly like the four rows below."),' % i)
    ps.write_text(t, encoding="utf-8")
    rc, out = run(w, "--manifests")
    expect("--manifests — the BOUND refuses: four is the number the served "
           "file carries and a fifth row is an escalation, not a row",
           rc != 0,
           [l for l in out.splitlines() if "bound is 4" in l][:1])
    shutil.rmtree(w.parents[2])

    # ---------------------------------------------------------------- P7
    print("\n7. THE RESIDUE — edit the source, the served file, PG's text AND "
          "\n   `PG_SHA256` in `pg_source.py`. Four files, one commit.")
    w = fresh()
    p = rewrite_source(w, 8, one_comma)
    rewrite_served(w, 8, one_comma)
    src = json.loads(p.read_text(encoding="utf-8"))["paragraphs"]
    orig = json.loads((PKG / "book08/source-book8.json").read_text(
        encoding="utf-8"))["paragraphs"]
    i = next(i for i, (a, b) in enumerate(zip(orig, src)) if a != b)
    pgp = w / "source-texts/pg1727-butler-1900.txt"
    raw = pgp.read_text(encoding="utf-8")
    frag = orig[i].split(", ")[0][-28:]
    raw = raw.replace(frag + ",", frag, 1)
    pgp.write_text(raw, encoding="utf-8", newline="")
    newh = hashlib.sha256(pgp.read_bytes()).hexdigest()
    ps = w / "scripts/pg_source.py"
    t = ps.read_text(encoding="utf-8")
    old_h = [l for l in t.splitlines() if l.startswith("PG_SHA256")][0]
    t = t.replace(old_h, 'PG_SHA256 = "%s"' % newh)
    t = t.replace("PG_BYTES = 717784", "PG_BYTES = %d" % pgp.stat().st_size)
    ps.write_text(t, encoding="utf-8")
    mp = w / "book08/manifest.json"
    m = json.loads(mp.read_text(encoding="utf-8"))
    m["checks"]["source_sha256"] = hashlib.sha256(p.read_bytes()).hexdigest()
    m["checks"]["pg_sha256"] = newh
    mp.write_text(json.dumps(m, indent=1, ensure_ascii=False) + "\n",
                  encoding="utf-8")
    rc, out = run(w, "--manifests")
    expect("--manifests — THIS PASSES, and it is the residue. See the note "
           "below.", rc != 0, out.strip().splitlines()[-1:])
    shutil.rmtree(w.parents[2])

    print("\n" + "-" * 72)
    bad = [n for n, ok in RESULTS if not ok]
    for n, ok in RESULTS:
        if not ok:
            print("PASSES: %s" % n)
    print("""
**What attack 7 costs an attacker, and why it is named rather than claimed
shut.** It is A9's shape: a licence a person granted. But where A9 needs one
`DECLARED` row and a sentence, this needs FOUR files changed in one commit —
`bookNN/source-bookN.json`, the served `original-en` **which this package is
forbidden to write**, the 718 KB vendored Project Gutenberg text, and the
`PG_SHA256` constant. Three of the four show in a diff as something no content
change has any reason to touch, and the fourth is a public artefact: the
constant is `sha256(https://www.gutenberg.org/ebooks/1727.txt.utf-8)`, which
anybody can recompute without this repository. The pin cannot make the anchor
unfalsifiable; it can make falsifying it require editing a number whose true
value is published by somebody else. That is the most a hash can ever buy, and
saying otherwise would be the fourth false claim of soundness in this file's
history.""")
    print("\n%d of %d attacks rejected." % (len(RESULTS) - len(bad),
                                            len(RESULTS)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
