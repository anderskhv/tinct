#!/usr/bin/env python3
"""Independent checks for the targeted-clarity patch (shares no code with apply.py).

Usage (repo root): python3 books/wip/jane-eyre-targeted-clarity-review/scripts/verify.py PATCHED.json [corrected|accepted]
Checks: patched hash, same chapters/titles/counts as base and as the matching original-en,
exactly one paragraph differs, at the recorded coordinate, with the recorded old/new text,
and the difference is the single recorded insertion.
"""
import hashlib, json, subprocess, sys

PIN = {
    "corrected": ("7994156f131a0c382e3f1372518dcb55a44eaade",
                  "books/wip/featured-source-cleanup/jane-eyre/jane-eyre-modern-en.json",
                  "books/wip/featured-source-cleanup/jane-eyre/jane-eyre-original-en.json",
                  (34, 139), "0488dac58943afde5be0b7e1105206429e2fc0a887462ff753057081e096dff6"),
    "accepted": ("d47d80f8e849819c67b4879f925d1493619478e3",
                 "books/wip/green-jane-eyre/candidate.json",
                 "books/wip/green-jane-eyre/source.json",
                 (34, 140), "dbf47f1399830208fd1b3e25457ff7f573b1ea1c3b0c47c37924ebbb679b7d61"),
}
path, which = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "corrected")
commit, mpath, spath, (C, P), want = PIN[which]
git = lambda p: subprocess.run(["git", "show", f"{commit}:{p}"], check=True, capture_output=True).stdout
raw = open(path, "rb").read()
assert hashlib.sha256(raw).hexdigest() == want, "patched hash mismatch"
assert not raw.endswith(b"\n")
new, base, src = json.loads(raw), json.loads(git(mpath)), json.loads(git(spath))
shape = lambda d: [(c["number"], c["title"], len(c["paragraphs"])) for c in d["chapters"]]
assert shape(new) == shape(base) == shape(src), "structure/alignment changed"
diffs = [(ci + 1, pi) for ci, c in enumerate(base["chapters"])
         for pi, t in enumerate(c["paragraphs"]) if new["chapters"][ci]["paragraphs"][pi] != t]
assert diffs == [(C, P)], diffs
o, n, s = (d["chapters"][C - 1]["paragraphs"][P] for d in (base, new, src))
assert o == s, "baseline paragraph is no longer source-identical"
assert o.startswith("“Very well,” I said shortly;") and n == "“We can be together very" + o[len("“Very"):]
print(f"OK {which}: {C}.{P} only; {len(o)} -> {len(n)} chars; structure {sum(x[2] for x in shape(new))} paragraphs aligned with original-en")
