#!/usr/bin/env python3
"""
Content verification — detect fabricated paragraphs.

For each substantial paragraph (≥40 words):
1. Extract distinctive proper nouns from source (capitalized tokens ≥4 chars).
2. Check how many appear in the corresponding target paragraph.
3. If source has ≥2 proper nouns and target has ZERO, flag as fabrication suspect.

Proper nouns survive between editions (names don't translate, mostly — Odysseus
stays Odysseus in modern-en AND modern-da). So zero matches across the
paragraph = the target text is not about the same thing as the source.

This catches the jane-eyre ch34 / crime-and-punishment ch36 / moby-dick ch132
pattern: paragraph-at-index contains fabricated content instead of the
corresponding source.

Caveat: won't catch fabrication in paragraphs with no proper nouns (short
dialogue, philosophical passages). Combine with truncation audit for coverage.

Usage:
    python3 content-verify.py <book-id>                     # default modern-en vs original-en
    python3 content-verify.py <book-id> modern-en modern-da # custom pair
    python3 content-verify.py <book-id> original-en modern-da  # skip EN middle
"""
import json
import re
import sys
from pathlib import Path

ED = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions")

COMMON_CAPS = {
    "The", "A", "An", "He", "She", "They", "We", "I", "It", "This", "That",
    "These", "Those", "There", "Then", "And", "But", "Or", "So", "For", "Yet",
    "Why", "What", "When", "Where", "Who", "How", "As", "Her", "His", "My",
    "Your", "Their", "Our", "Its", "Now", "Here", "One", "Two", "Three",
    "Perhaps", "Indeed", "After", "Before", "During", "Though", "Although",
    "Even", "Just", "Only", "Still", "Yes", "No", "Well", "Oh", "Ah",
    "Of", "On", "In", "At", "By", "To", "From", "With", "Without",
    "Chapter", "Book", "Part", "Section", "Mr", "Mrs", "Miss", "Dr",
    "Lord", "Lady", "Sir", "Madam", "Father", "Mother", "Brother", "Sister",
    "God", "Lord", "Christ",
    # Danish common caps
    "De", "Den", "Det", "Han", "Hun", "Jeg", "Vi", "Du", "Men", "Og",
    "Eller", "Så", "Til", "Fra", "Med", "Uden", "Hvad", "Hvor", "Hvorfor",
    "Hvordan", "Hvornår", "Hvem", "Der", "Her", "Kunne", "Ville",
    "Skulle", "Måtte", "Sådan", "Således", "Dette", "Disse",
    "En", "Et", "Som", "Nej", "Ja", "Fru", "Hr", "Frøken",
}


def load(book, key):
    p = ED / f"{book}-{key}.json"
    if not p.exists():
        return None
    with open(p) as f:
        return json.load(f)


def proper_nouns(text):
    """Extract likely proper nouns: capitalized ≥4 chars, not in stoplist."""
    out = set()
    for m in re.finditer(
        r"\b([A-ZÆØÅÉÈÊËÀÁÂÃÄÇÍÎÏÑÓÔÕÖÙÚÛÜÝ]"
        r"[a-zæøåéèêëàáâãäçíîïñóôõöùúûüý]{3,})\b",
        text,
    ):
        tok = m.group(1)
        if tok not in COMMON_CAPS:
            out.add(tok)
    return out


def audit_book(book, src_key, tgt_key):
    src = load(book, src_key)
    tgt = load(book, tgt_key)
    if not src or not tgt:
        return None, "missing edition"

    n_chapters = min(len(src["chapters"]), len(tgt["chapters"]))
    if len(src["chapters"]) != len(tgt["chapters"]):
        print(f"  WARNING: chapter count mismatch "
              f"(src={len(src['chapters'])}, tgt={len(tgt['chapters'])})")

    suspects = []
    total_checked = 0

    for ci in range(n_chapters):
        sps = src["chapters"][ci]["paragraphs"]
        tps = tgt["chapters"][ci]["paragraphs"]
        for pi in range(min(len(sps), len(tps))):
            s, t = sps[pi], tps[pi]
            if len(s.split()) < 40:
                continue
            nouns = proper_nouns(s)
            if len(nouns) < 2:
                continue
            total_checked += 1
            matched = sum(1 for n in nouns if n in t)
            if matched == 0:
                suspects.append({
                    "chapter": ci + 1,
                    "paragraph": pi,
                    "src_words": len(s.split()),
                    "tgt_words": len(t.split()),
                    "src_nouns": sorted(nouns),
                    "src_first": s[:100].replace("\n", " "),
                    "tgt_first": t[:100].replace("\n", " "),
                })

    return suspects, f"checked {total_checked} eligible paragraphs"


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    book = sys.argv[1]
    src_key = sys.argv[2] if len(sys.argv) > 2 else "original-en"
    tgt_key = sys.argv[3] if len(sys.argv) > 3 else "modern-en"

    print(f"== Content verification: {book} | {src_key} vs {tgt_key} ==")
    suspects, meta = audit_book(book, src_key, tgt_key)
    print(f"  {meta}")

    if not suspects:
        print("  CLEAN: no fabrication suspects")
        return

    print(f"  {len(suspects)} suspect paragraphs (source has ≥2 proper nouns, "
          f"target has NONE)\n")

    # Group by chapter to show clustering
    by_chapter = {}
    for s in suspects:
        by_chapter.setdefault(s["chapter"], []).append(s)

    print("  Chapter clustering (top 10 chapters with most suspects):")
    ranked = sorted(by_chapter.items(), key=lambda x: -len(x[1]))
    for ch, items in ranked[:10]:
        print(f"    ch{ch}: {len(items)} suspects")

    print(f"\n  Detail for top 15 suspects:")
    for s in suspects[:15]:
        print(f"\n  ch{s['chapter']:>3} p{s['paragraph']:>4}  "
              f"src={s['src_words']}w tgt={s['tgt_words']}w")
        print(f"    src nouns: {s['src_nouns'][:6]}")
        print(f"    src: {s['src_first']}...")
        print(f"    tgt: {s['tgt_first']}...")

    if len(suspects) > 15:
        print(f"\n  ... and {len(suspects) - 15} more suspects")


if __name__ == "__main__":
    main()
