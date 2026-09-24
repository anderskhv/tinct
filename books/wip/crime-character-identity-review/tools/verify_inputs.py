#!/usr/bin/env python3
"""Verify the pinned inputs: sha256 of each local copy, and byte identity with
the git object at its pinned commit. Run from anywhere inside the checkout.
Requires the pinned commits to be fetched:
  git fetch origin claude/awesome-euler-pjc7jv main
"""
import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = "debcc8c2b48f352c3e143e5e3aca84de73c6f7b8"
LIVE = "1bd1bfb3a1cbd03ed070ca733cbcd442a40bae27"
PKG = "books/wip/green-crime-and-punishment"
PINS = [
    ("candidate.json", PACKAGE, f"{PKG}/candidate.json", "18be4155497ebdf78013d1a26ce2fad86839aaa00c036cf9970954af550888eb"),
    ("baseline-live-modern-en.json", PACKAGE, f"{PKG}/baseline-live-modern-en.json", "914bcdfae396792477d90f788ce30ed684732dc89eb4abc76d4c126a9c963834"),
    ("source.json", PACKAGE, f"{PKG}/source.json", "6609777b2dfca00fa10c7d0f4d2599b2b617f029f8a1689714ce96c60627a978"),
    ("character-card-impact.json", PACKAGE, f"{PKG}/character-card-impact.json", "19f0f80201f5f02833317bfb559dc1e7d09402cfb0f8c679734a3aa493962c07"),
    ("changes.jsonl", PACKAGE, f"{PKG}/ledger/changes.jsonl", "f06da82c23d45a3eb2724a7509d944e892c8ecca68ed6ecf405aa5567c4959ec"),
    ("crime-and-punishment.v1.json", LIVE, "app/public/data/characters/crime-and-punishment.v1.json", "2125526c56769e4f09be387f6d5dc2e974dc9aca7fb931115fb893da34706d98"),
    ("crime-and-punishment-threads.json", LIVE, "app/public/data/editions/crime-and-punishment-threads.json", "3dc0295ca969cec7d36050aeea21cbc80831f6f95b2cc3c2dee8fdd323f2d9b9"),
    # Live served files that must equal the pinned baseline/source (checked at the live commit).
    (None, LIVE, "app/public/data/editions/crime-and-punishment-modern-en.json", "914bcdfae396792477d90f788ce30ed684732dc89eb4abc76d4c126a9c963834"),
    (None, LIVE, "app/public/data/editions/crime-and-punishment-original-en.json", "6609777b2dfca00fa10c7d0f4d2599b2b617f029f8a1689714ce96c60627a978"),
]


def main():
    ok = True
    for local, commit, path, want in PINS:
        blob = subprocess.run(["git", "show", f"{commit}:{path}"], capture_output=True, cwd=ROOT).stdout
        g = hashlib.sha256(blob).hexdigest()
        line = f"{commit[:8]}:{path} {g[:16]}"
        if local:
            h = hashlib.sha256((ROOT / "inputs" / local).read_bytes()).hexdigest()
            line += f" | inputs/{local} {h[:16]}"
            ok &= h == want
        ok &= g == want
        print(("OK  " if g == want and (not local or h == want) else "BAD ") + line)
    print("ALL PINS OK" if ok else "PIN MISMATCH")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
