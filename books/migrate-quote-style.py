#!/usr/bin/env python3
"""
Migrate Danish dialogue quotes from straight `"..."` to guillemets `»...«`.

Safety:
  - Per paragraph, count straight `"`. If odd, SKIP paragraph and warn.
  - Walk the paragraph, toggle state: 1st `"` -> `»`, 2nd -> `«`, 3rd -> `»`, ...
  - Validate JSON before and after write.
  - Preserve all other content.

Applies to modern-da of every book EXCEPT odyssey and the-manual (already done).

Usage:
    python3 migrate-quote-style.py                # dry run, report stats
    python3 migrate-quote-style.py --apply        # actually write
    python3 migrate-quote-style.py odyssey        # single book dry-run
    python3 migrate-quote-style.py odyssey --apply
"""
import json
import sys
from pathlib import Path

EDITIONS_DIR = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions")

EXCLUDE = {"odyssey", "the-manual"}


def books_with_da():
    return sorted(set(
        p.name.replace("-modern-da.json", "")
        for p in EDITIONS_DIR.glob("*-modern-da.json")
    ))


def migrate_chapter(paragraphs):
    """Convert straight `"` to `»`/`«` with state tracked across paragraphs.
    Returns (new_paragraphs, swapped, balanced)."""
    total_quotes = sum(p.count('"') for p in paragraphs)
    if total_quotes == 0:
        return paragraphs, 0, True
    if total_quotes % 2 != 0:
        return paragraphs, 0, False  # chapter has odd total — skip

    new_paragraphs = []
    open_next = True
    swapped = 0
    for p in paragraphs:
        out = []
        for ch in p:
            if ch == '"':
                out.append("\u00bb" if open_next else "\u00ab")
                open_next = not open_next
                swapped += 1
            else:
                out.append(ch)
        new_paragraphs.append("".join(out))
    return new_paragraphs, swapped, True


def migrate_book(book_id, apply=False):
    path = EDITIONS_DIR / f"{book_id}-modern-da.json"
    if not path.exists():
        return {"skip": "missing"}

    with open(path) as f:
        data = json.load(f)

    orig_para_counts = [len(ch["paragraphs"]) for ch in data["chapters"]]

    total_swapped = 0
    unbalanced_chapters = []

    for ci, ch in enumerate(data["chapters"]):
        new_paras, swapped, balanced = migrate_chapter(ch["paragraphs"])
        if not balanced:
            unbalanced_chapters.append((ci + 1, sum(p.count('"') for p in ch["paragraphs"])))
            continue
        ch["paragraphs"] = new_paras
        total_swapped += swapped

    assert [len(ch["paragraphs"]) for ch in data["chapters"]] == orig_para_counts

    result = {
        "total_swapped": total_swapped,
        "unbalanced_chapters": unbalanced_chapters,
    }

    if apply and total_swapped > 0:
        with open(path, "w") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        with open(path) as f:
            json.load(f)
        result["written"] = True

    return result


def main():
    args = sys.argv[1:]
    apply = "--apply" in args
    book_arg = [a for a in args if not a.startswith("--")]

    if book_arg:
        ids = [book_arg[0]]
    else:
        ids = [b for b in books_with_da() if b not in EXCLUDE]

    print(f"Mode: {'APPLY' if apply else 'DRY RUN'}  Books: {len(ids)}")
    print(f"{'BOOK':<24} {'SWAP':>7} {'UNBAL':>6}  NOTE")
    print("-" * 60)

    total_swap = 0
    total_unbal = 0
    for b in ids:
        r = migrate_book(b, apply=apply)
        if r.get("skip"):
            print(f"{b:<24}  SKIP ({r['skip']})")
            continue
        sw = r["total_swapped"]
        ub = len(r["unbalanced_chapters"])
        total_swap += sw
        total_unbal += ub
        note = "written" if r.get("written") else ("no change" if sw == 0 else "")
        print(f"{b:<24} {sw:>7} {ub:>6}  {note}")
        for ci, cnt in r["unbalanced_chapters"][:5]:
            print(f"    ch{ci}: {cnt} quotes (odd, chapter skipped)")

    print("-" * 60)
    print(f"TOTAL swapped: {total_swap}")
    print(f"TOTAL unbalanced chapters skipped: {total_unbal}")


if __name__ == "__main__":
    main()
