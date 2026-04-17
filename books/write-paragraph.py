#!/usr/bin/env python3
"""
Replace a paragraph in an edition JSON file by chapter + paragraph index.

The replacement text is read from stdin or from a file. This avoids putting
the full paragraph into the command line (and bypasses shell quoting issues).

Usage (file mode):
    python3 write-paragraph.py <book-id> <target-key> <chapter> <paragraph-idx> --file <path>

Usage (stdin mode):
    cat newtext.txt | python3 write-paragraph.py <book-id> <target-key> <chapter> <paragraph-idx>

Guarantees:
- Paragraph count in every chapter is UNCHANGED.
- Total chapter count is UNCHANGED.
- Only paragraphs[<paragraph-idx>] in chapter <chapter> is replaced.
- The file is validated as JSON before AND after the write.
"""
import json
import sys
from pathlib import Path

EDITIONS_DIR = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions")


def main():
    args = sys.argv[1:]
    if len(args) < 4:
        print(__doc__)
        sys.exit(1)

    book_id = args[0]
    target_key = args[1]
    chapter = int(args[2])
    para_idx = int(args[3])

    # Read replacement text
    if len(args) >= 6 and args[4] == "--file":
        with open(args[5]) as f:
            new_text = f.read().rstrip("\n")
    else:
        new_text = sys.stdin.read().rstrip("\n")

    if not new_text.strip():
        print("ERROR: replacement text is empty", file=sys.stderr)
        sys.exit(1)

    path = EDITIONS_DIR / f"{book_id}-{target_key}.json"
    if not path.exists():
        print(f"ERROR: {path} does not exist", file=sys.stderr)
        sys.exit(1)

    with open(path) as f:
        data = json.load(f)

    # Capture invariants
    orig_chapter_count = len(data["chapters"])
    orig_para_counts = [len(ch["paragraphs"]) for ch in data["chapters"]]

    # Bounds check
    if chapter < 1 or chapter > orig_chapter_count:
        print(f"ERROR: chapter {chapter} out of range (1..{orig_chapter_count})", file=sys.stderr)
        sys.exit(1)
    paras = data["chapters"][chapter - 1]["paragraphs"]
    if para_idx < 0 or para_idx >= len(paras):
        print(f"ERROR: paragraph index {para_idx} out of range for ch{chapter} "
              f"(0..{len(paras) - 1})", file=sys.stderr)
        sys.exit(1)

    old_text = paras[para_idx]
    old_words = len(old_text.split())
    new_words = len(new_text.split())

    paras[para_idx] = new_text

    # Verify invariants
    assert len(data["chapters"]) == orig_chapter_count, "chapter count changed!"
    for i, ch in enumerate(data["chapters"]):
        assert len(ch["paragraphs"]) == orig_para_counts[i], f"para count changed in ch{i+1}!"

    with open(path, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Validate JSON by reloading
    with open(path) as f:
        json.load(f)

    print(f"OK  {book_id} {target_key} ch{chapter} p{para_idx}: "
          f"{old_words}w -> {new_words}w")


if __name__ == "__main__":
    main()
