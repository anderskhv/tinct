#!/usr/bin/env python3
"""Publish accepted text-only modern-en repairs with character-card compatibility.

usage: prepare-modern-en-repairs.py <staged-dir> <revision> <before-dir> <book> [<book> ...]

<staged-dir> holds <book>-modern-en.json (the accepted candidates). Each book is
checked against the live edition (same metadata, chapters and paragraph counts),
the live file is copied to <before-dir> (input for build-text-change-migration.py),
the candidate replaces it byte for byte, the character package is re-anchored with
prepare-reviewed-editions.reanchor (exact projection only; ambiguous mentions are
dropped and reported), and the characterReleases revision in characterCards.ts is
bumped. Writes <staged-dir>/report.json. No prose is generated or changed.
"""
import importlib.util
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("pre", ROOT / "app/scripts/prepare-reviewed-editions.py")
pre = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pre)


def main():
    staged, revision, before_dir, *books = sys.argv[1:]
    staged, before_dir = Path(staged), Path(before_dir)
    before_dir.mkdir(parents=True, exist_ok=True)
    service = ROOT / "app/src/services/characters/characterCards.ts"
    service_text = service.read_text()
    reports = []
    for book in books:
        target = ROOT / f"app/public/data/editions/{book}-modern-en.json"
        before_raw = target.read_bytes()
        accepted_raw = (staged / f"{book}-modern-en.json").read_bytes()
        before, accepted = json.loads(before_raw), json.loads(accepted_raw)
        if {k: v for k, v in before.items() if k != "chapters"} != {k: v for k, v in accepted.items() if k != "chapters"}:
            raise SystemExit(f"{book}: edition metadata changed")
        changed = 0
        for old_ch, new_ch in zip(before["chapters"], accepted["chapters"], strict=True):
            if {k: v for k, v in old_ch.items() if k != "paragraphs"} != {k: v for k, v in new_ch.items() if k != "paragraphs"}:
                raise SystemExit(f"{book}: chapter identity changed")
            if len(old_ch["paragraphs"]) != len(new_ch["paragraphs"]):
                raise SystemExit(f"{book}: paragraph count changed")
            changed += sum(a != b for a, b in zip(old_ch["paragraphs"], new_ch["paragraphs"]))
        asset_path = ROOT / f"app/public/data/characters/{book}.v1.json"
        asset_raw = asset_path.read_text()
        asset, report = pre.reanchor(json.loads(asset_raw), before_raw, accepted_raw, revision)
        compact = asset_raw.startswith('{"')
        text = json.dumps(asset, ensure_ascii=False, separators=(",", ":")) if compact else json.dumps(asset, ensure_ascii=False, indent=2)
        pattern = r"((?:'" + re.escape(book) + r"'|" + re.escape(book) + r"):\s*\{\s*editions:\s*EN,\s*revision:\s*)'[^']+'"
        service_text, count = re.subn(pattern, lambda m: m.group(1) + repr(revision), service_text)
        if count != 1:
            raise SystemExit(f"{book}: expected one character release entry")
        shutil.copyfile(target, before_dir / f"{book}-modern-en.before.json")
        target.write_bytes(accepted_raw)
        asset_path.write_text(text + "\n")
        old_block = json.loads(asset_raw)["editions"]["modern-en"]
        reports.append({"book": book, "changedParagraphs": changed, "beforeSha256": pre.digest(before_raw), "afterSha256": pre.digest(accepted_raw),
                        "mentionsBefore": len(old_block["mentions"]), **report})
    service.write_text(service_text)
    (staged / "report.json").write_text(json.dumps(reports, ensure_ascii=False, indent=2) + "\n")
    for r in reports:
        print(r["book"], "changed", r["changedParagraphs"], "mentions", r["mentionsBefore"], "->", r["retainedMentions"], "dropped", len(r["droppedMentions"]), "relocated", len(r["relocatedExactNames"]))


if __name__ == "__main__":
    main()
