#!/usr/bin/env python3
"""Per-edition sidecars for the Bible character package.

The canonical, reviewed package is books/wip/bible-characters-full/package/
bible.v1.json (16.5 MB, four editions). A reader only needs the edition it has
open, so the app serves one file per edition:

    app/public/data/characters/bible.v1.<edition>.json

Each sidecar has exactly the canonical schema with a single entry in `editions`,
serialised compactly, so verifyCharacters() accepts it unchanged. Python is used
(not Node) because the slice hashes in MANIFEST.json are defined over Python's
insertion-ordered serialisation; JS would reorder the integer-like chapter keys
of paragraphHashes.

    python3 app/scripts/split-bible-characters.py           write the sidecars
    python3 app/scripts/split-bible-characters.py --check   fail if they differ
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PKG = ROOT / "books/wip/bible-characters-full/package"
OUT = ROOT / "app/public/data/characters"


def dumps(value) -> bytes:
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    check = "--check" in sys.argv
    canonical = (PKG / "bible.v1.json").read_bytes()
    manifest = json.loads((PKG / "MANIFEST.json").read_text("utf-8"))
    if sha(canonical) != manifest["sha256"]:
        raise SystemExit("canonical package does not match MANIFEST.json")
    asset = json.loads(canonical.decode("utf-8"))
    stale = False
    for key in manifest["editions"]:
        piece = asset["editions"][key]
        if sha(dumps(piece)) != manifest["editionSlices"]["sha256"][key]:
            raise SystemExit(f"slice hash mismatch: {key}")
        header = {k: v for k, v in asset.items() if k != "editions"}
        data = dumps({**header, "editions": {key: piece}}) + b"\n"
        target = OUT / f"bible.v1.{key}.json"
        if check:
            if not target.exists() or target.read_bytes() != data:
                print(f"stale sidecar: {target.relative_to(ROOT)}", file=sys.stderr)
                stale = True
        else:
            target.write_bytes(data)
            print(f"{target.relative_to(ROOT)} {len(data)} bytes sha256 {sha(data)}")
    return 1 if stale else 0


sys.exit(main())
