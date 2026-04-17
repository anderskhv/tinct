#!/usr/bin/env python3
"""
Print a source paragraph and the current target paragraph for inspection.
Minimal output — designed to keep conversation context small.

Usage:
    python3 show-paragraph.py <book-id> <source-key> <target-key> <chapter> <paragraph-idx>

Example:
    python3 show-paragraph.py the-awakening modern-en modern-da 3 12
    python3 show-paragraph.py odyssey original-en modern-en 5 2
"""
import json
import sys
from pathlib import Path

EDITIONS_DIR = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions")


def load(book_id, key):
    path = EDITIONS_DIR / f"{book_id}-{key}.json"
    with open(path) as f:
        return json.load(f)


def main():
    if len(sys.argv) != 6:
        print(__doc__)
        sys.exit(1)
    book_id, src_key, tgt_key, ch, pi = sys.argv[1:]
    ch = int(ch)
    pi = int(pi)

    src = load(book_id, src_key)
    tgt = load(book_id, tgt_key)

    src_para = src["chapters"][ch - 1]["paragraphs"][pi]
    tgt_para = tgt["chapters"][ch - 1]["paragraphs"][pi]

    ch_title = src["chapters"][ch - 1].get("title", "")

    print(f"=== {book_id} | ch{ch} ({ch_title}) | paragraph index {pi} ===")
    print(f"\n--- SOURCE ({src_key}) | {len(src_para.split())} words ---")
    print(src_para)
    print(f"\n--- CURRENT TARGET ({tgt_key}) | {len(tgt_para.split())} words ---")
    print(tgt_para)
    print()


if __name__ == "__main__":
    main()
