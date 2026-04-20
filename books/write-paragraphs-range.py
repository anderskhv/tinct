#!/usr/bin/env python3
"""
Replace a contiguous range of paragraphs in an edition chapter.

Usage:
    python3 write-paragraphs-range.py <book-id> <edition-key> <chapter-num> <start-idx> --file <path>

The file at --file must contain a JSON array of strings representing the
paragraphs starting at <start-idx>. The array length determines how many
paragraphs are replaced.

Example: to replace paragraphs 0-359 of ulysses modern-da ch15:
    python3 write-paragraphs-range.py ulysses modern-da 15 0 --file /tmp/ep15-part1.json

This is the chunked counterpart to write-chapter.py (whole chapter) and
write-paragraph.py (single paragraph). Useful when multiple agents work
on disjoint ranges of a huge chapter in parallel.

Guarantees:
  - Paragraph count unchanged (array length must fit within chapter bounds)
  - JSON validated before and after write
  - Only the specified range replaced; other paragraphs untouched
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
    start_idx = int(args[3])
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
        print(f"ERROR: chapter {chapter} out of range", file=sys.stderr)
        sys.exit(1)

    current = data["chapters"][chapter - 1]["paragraphs"]
    end_idx = start_idx + len(new_paragraphs)
    if end_idx > len(current):
        print(f"ERROR: range {start_idx}..{end_idx - 1} out of bounds "
              f"(chapter has {len(current)} paragraphs)", file=sys.stderr)
        sys.exit(1)

    # Replace
    for i, new_p in enumerate(new_paragraphs):
        current[start_idx + i] = new_p

    # Invariants
    assert len(data["chapters"]) == orig_chapter_count
    new_para_counts = [len(ch["paragraphs"]) for ch in data["chapters"]]
    assert new_para_counts == orig_para_counts

    with open(target, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(target) as f:
        json.load(f)

    print(f"OK  {book_id} {edition_key} ch{chapter} p{start_idx}..p{end_idx-1}: "
          f"{len(new_paragraphs)} paragraphs written")


if __name__ == "__main__":
    main()
