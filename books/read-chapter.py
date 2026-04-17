#!/usr/bin/env python3
"""
Print a single chapter's paragraphs as a JSON array — for feeding to an agent
without pulling the whole book into context.

Usage:
    python3 read-chapter.py <book-id> <edition-key> <chapter-num>
    python3 read-chapter.py the-aeneid original-en 1

Output: JSON array of strings, indented. Includes chapter title at top as a comment.
"""
import json
import sys
from pathlib import Path

EDITIONS_DIR = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions")


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)
    book_id, edition_key, chapter = sys.argv[1], sys.argv[2], int(sys.argv[3])
    path = EDITIONS_DIR / f"{book_id}-{edition_key}.json"
    with open(path) as f:
        data = json.load(f)
    if chapter < 1 or chapter > len(data["chapters"]):
        print(f"ERROR: chapter out of range", file=sys.stderr)
        sys.exit(1)
    ch = data["chapters"][chapter - 1]
    title = ch.get("title", "")
    paras = ch["paragraphs"]
    print(f"// {book_id} | ch{chapter} | {title} | {len(paras)} paragraphs")
    print(json.dumps(paras, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
