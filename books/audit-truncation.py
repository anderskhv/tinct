#!/usr/bin/env python3
"""
Audit a book for truncated paragraphs (target < threshold * source word count).
Outputs a compact list, one line per truncated paragraph.

Usage:
    python3 audit-truncation.py <book-id>                # both pairs
    python3 audit-truncation.py <book-id> en             # modern-en vs original-en only
    python3 audit-truncation.py <book-id> da             # modern-da vs modern-en only
"""
import json
import sys
from pathlib import Path

EDITIONS_DIR = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions")
THRESHOLD = 0.75
MIN_SOURCE_WORDS = 20  # ignore tiny paragraphs (titles, single lines)


def load(book_id, key):
    path = EDITIONS_DIR / f"{book_id}-{key}.json"
    if not path.exists():
        return None
    with open(path) as f:
        return json.load(f)


def audit_pair(book_id, source_key, target_key):
    source = load(book_id, source_key)
    target = load(book_id, target_key)
    if source is None or target is None:
        print(f"  [skip] missing edition: {source_key if source is None else target_key}")
        return []

    issues = []
    n_chapters = min(len(source["chapters"]), len(target["chapters"]))
    for ci in range(n_chapters):
        sp = source["chapters"][ci]["paragraphs"]
        tp = target["chapters"][ci]["paragraphs"]
        n_paras = min(len(sp), len(tp))
        for pi in range(n_paras):
            sw = len(sp[pi].split())
            tw = len(tp[pi].split())
            if sw >= MIN_SOURCE_WORDS and (tw / sw) < THRESHOLD:
                issues.append({
                    "chapter": ci + 1,
                    "paragraph": pi,
                    "src_words": sw,
                    "tgt_words": tw,
                    "ratio": round(tw / sw, 2),
                })
    return issues


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    book_id = sys.argv[1]
    which = sys.argv[2] if len(sys.argv) > 2 else "both"

    if which in ("both", "en"):
        print(f"== {book_id}: modern-en vs original-en ==")
        en_issues = audit_pair(book_id, "original-en", "modern-en")
        for i in en_issues:
            print(f"  ch{i['chapter']:>3} p{i['paragraph']:>4}  "
                  f"src={i['src_words']:>4}w tgt={i['tgt_words']:>4}w  ratio={i['ratio']}")
        print(f"  TOTAL: {len(en_issues)}")

    if which in ("both", "da"):
        print(f"== {book_id}: modern-da vs modern-en ==")
        da_issues = audit_pair(book_id, "modern-en", "modern-da")
        for i in da_issues:
            print(f"  ch{i['chapter']:>3} p{i['paragraph']:>4}  "
                  f"src={i['src_words']:>4}w tgt={i['tgt_words']:>4}w  ratio={i['ratio']}")
        print(f"  TOTAL: {len(da_issues)}")


if __name__ == "__main__":
    main()
