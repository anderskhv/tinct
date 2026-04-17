#!/usr/bin/env python3
"""
Replace a whole chapter's paragraphs in an edition JSON file.

Input: a JSON file containing a list of paragraph strings (one per paragraph).
The length must match the source chapter's paragraph count exactly.

Usage:
    python3 write-chapter.py <book-id> <edition-key> <chapter-num> --file <path-to-json-list>
    python3 write-chapter.py the-aeneid modern-en 1 --file /tmp/aeneid-ch1.json

The file at --file should contain a JSON array of strings, e.g.:
    ["Paragraph one text.", "Paragraph two text.", ...]

Guarantees:
- Paragraph count unchanged (if mismatch, aborts with error)
- JSON validated before and after write
- Chapter count unchanged
- All other chapters untouched
"""
import json
import sys
from pathlib import Path

EDITIONS_DIR = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions")


def main():
    args = sys.argv[1:]
    if "--file" not in args:
        print(__doc__)
        sys.exit(1)
    fi = args.index("--file")
    book_id = args[0]
    edition_key = args[1]
    chapter = int(args[2])
    src_path = args[fi + 1]

    target = EDITIONS_DIR / f"{book_id}-{edition_key}.json"
    if not target.exists():
        print(f"ERROR: {target} not found", file=sys.stderr)
        sys.exit(1)

    with open(src_path) as f:
        new_paragraphs = json.load(f)
    if not isinstance(new_paragraphs, list) or not all(isinstance(p, str) for p in new_paragraphs):
        print("ERROR: source file must contain a JSON array of strings", file=sys.stderr)
        sys.exit(1)

    with open(target) as f:
        data = json.load(f)

    orig_chapter_count = len(data["chapters"])
    orig_para_counts = [len(ch["paragraphs"]) for ch in data["chapters"]]

    if chapter < 1 or chapter > orig_chapter_count:
        print(f"ERROR: chapter {chapter} out of range (1..{orig_chapter_count})", file=sys.stderr)
        sys.exit(1)

    current = data["chapters"][chapter - 1]["paragraphs"]
    if len(new_paragraphs) != len(current):
        print(f"ERROR: paragraph count mismatch for ch{chapter}: "
              f"current={len(current)} new={len(new_paragraphs)}", file=sys.stderr)
        print("Refusing to write — would break paragraph alignment.", file=sys.stderr)
        sys.exit(1)

    # Check for empty/stub paragraphs
    stub_warnings = [i for i, p in enumerate(new_paragraphs) if len(p.strip()) < 10]
    if stub_warnings:
        print(f"WARNING: {len(stub_warnings)} paragraphs are very short (< 10 chars): "
              f"indices {stub_warnings[:5]}", file=sys.stderr)

    data["chapters"][chapter - 1]["paragraphs"] = new_paragraphs

    # Invariants
    assert len(data["chapters"]) == orig_chapter_count
    new_para_counts = [len(ch["paragraphs"]) for ch in data["chapters"]]
    assert new_para_counts == orig_para_counts, "paragraph count changed in another chapter!"

    with open(target, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(target) as f:
        json.load(f)

    print(f"OK  {book_id} {edition_key} ch{chapter}: {len(new_paragraphs)} paragraphs written")


if __name__ == "__main__":
    main()
