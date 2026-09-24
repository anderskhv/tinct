#!/usr/bin/env python3
"""Verify this package's pinned inputs against their git commits and hashes.
Requires: git fetch origin claude/awesome-euler-pjc7jv main
"""
import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PKG = ("debcc8c2b48f352c3e143e5e3aca84de73c6f7b8", "books/wip/green-crime-and-punishment")
LIVE = "1bd1bfb3a1cbd03ed070ca733cbcd442a40bae27"
PINS = [
    ("crime-and-punishment.v1.json", LIVE, "app/public/data/characters/crime-and-punishment.v1.json", "2125526c56769e4f09be387f6d5dc2e974dc9aca7fb931115fb893da34706d98"),
    ("crime-and-punishment.v1.json", LIVE, "books/characters/crime-and-punishment/characters.v1.json", "2125526c56769e4f09be387f6d5dc2e974dc9aca7fb931115fb893da34706d98"),
    ("source.json", LIVE, "app/public/data/editions/crime-and-punishment-original-en.json", "6609777b2dfca00fa10c7d0f4d2599b2b617f029f8a1689714ce96c60627a978"),
    ("baseline-live-modern-en.json", LIVE, "app/public/data/editions/crime-and-punishment-modern-en.json", "914bcdfae396792477d90f788ce30ed684732dc89eb4abc76d4c126a9c963834"),
    ("candidate.json", PKG[0], PKG[1] + "/candidate.json", "18be4155497ebdf78013d1a26ce2fad86839aaa00c036cf9970954af550888eb"),
]
ok = True
for local, commit, path, want in PINS:
    g = hashlib.sha256(subprocess.run(["git", "show", f"{commit}:{path}"], capture_output=True, cwd=ROOT).stdout).hexdigest()
    h = hashlib.sha256((ROOT / "inputs" / local).read_bytes()).hexdigest()
    good = g == want == h
    ok &= good
    print(("OK  " if good else "BAD ") + f"{commit[:8]}:{path} = inputs/{local} {want[:16]}")
print("ALL PINS OK" if ok else "PIN MISMATCH")
sys.exit(0 if ok else 1)
