#!/usr/bin/env python3
"""Replace single paragraphs in a candidate file without rewriting the whole array.

    python3 books/wip/modern-en-repair/patch.py <candidate.json> <index> <<'TEXT'
    The new paragraph text.
    TEXT

Or several at once from a JSON object of {index: text}:

    python3 books/wip/modern-en-repair/patch.py <candidate.json> --json <patch.json>

A drafter fixing 4 failing paragraphs in a 74-paragraph chapter should send
4 short patches, not re-emit 14,000 words. Validates that the array length
does not change.
"""
import json, sys
from pathlib import Path

def main():
    path = Path(sys.argv[1])
    arr = json.loads(path.read_text())
    n = len(arr)
    if sys.argv[2] == "--json":
        patch = json.loads(Path(sys.argv[3]).read_text())
        items = [(int(k), v) for k, v in patch.items()]
    else:
        items = [(int(sys.argv[2]), sys.stdin.read().rstrip("\n"))]
    for i, text in items:
        if not 0 <= i < n:
            sys.exit(f"ABORT: index {i} out of range 0..{n-1}")
        if not isinstance(text, str) or not text.strip():
            sys.exit(f"ABORT: empty text for index {i}")
        arr[i] = text
    if len(arr) != n:
        sys.exit("ABORT: array length changed")
    path.write_text(json.dumps(arr, ensure_ascii=False, indent=1) + "\n")
    print(f"patched {len(items)} paragraph(s) in {path.name}; {n} paragraphs intact")

if __name__ == "__main__":
    main()
