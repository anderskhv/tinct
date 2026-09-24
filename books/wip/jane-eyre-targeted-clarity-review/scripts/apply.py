#!/usr/bin/env python3
"""Apply the Jane Eyre targeted-clarity patch to a pinned modern-en edition.

Byte-level: the old paragraph's JSON string literal is replaced exactly once, so
serialization (indent=2, UTF-8, no trailing newline) is preserved without re-dumping.

Usage (repo root):
  python3 books/wip/jane-eyre-targeted-clarity-review/scripts/apply.py [--base corrected|accepted|live] [--out PATH]
Default base is `corrected` (the featured-source-cleanup candidate).
"""
import argparse, hashlib, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PATCH = json.load(open(os.path.join(HERE, "..", "PATCH.json"), encoding="utf-8"))


def sha(b):
    return hashlib.sha256(b).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="corrected", choices=sorted(PATCH["bases"]))
    ap.add_argument("--out")
    a = ap.parse_args()
    base = PATCH["bases"][a.base]
    raw = subprocess.run(["git", "show", f"{base['commit']}:{base['path']}"],
                         check=True, capture_output=True).stdout
    assert sha(raw) == base["sha256"], f"base drift: {sha(raw)} != {base['sha256']}"
    text = raw.decode("utf-8")
    for ch in PATCH["changes"]:
        c = ch["coordinates"][a.base]
        d = json.loads(text)
        cur = d["chapters"][c["chapter"] - 1]["paragraphs"][c["paragraph"]]
        assert cur == ch["old"], f"{a.base} {c}: text mismatch"
        assert sha(cur.encode()) == ch["oldParagraphSha256"]
        old_lit = json.dumps(ch["old"], ensure_ascii=False)
        new_lit = json.dumps(ch["new"], ensure_ascii=False)
        assert text.count(old_lit) == 1, "old paragraph literal not unique"
        text = text.replace(old_lit, new_lit, 1)
        d2 = json.loads(text)
        assert d2["chapters"][c["chapter"] - 1]["paragraphs"][c["paragraph"]] == ch["new"]
        assert sha(ch["new"].encode()) == ch["newParagraphSha256"]
    out = text.encode("utf-8")
    exp = base.get("patchedSha256")
    print(f"{a.base}: {base['sha256']} -> {sha(out)}")
    if exp:
        assert sha(out) == exp, f"output {sha(out)} != recorded {exp}"
    if a.out:
        open(a.out, "wb").write(out)
        print("wrote", a.out)


if __name__ == "__main__":
    sys.exit(main())
