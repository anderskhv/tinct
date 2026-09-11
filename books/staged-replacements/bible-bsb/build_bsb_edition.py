#!/usr/bin/env python3
"""
Build a staged bible-bsb-en.json edition from the raw Berean Standard Bible
text, matching Tinct's existing bible-kjv-en.json chapter identifiers and
paragraph-chunking convention (groups of 5 verses per paragraph, inline
superscript verse numbers), so Compare/position mapping against kjv-en and
web-en stays intact.

Source: bereanbible.com/bsb.txt (downloaded 2026-09-11; see PROVENANCE.md
in this folder for the rights statement and source verification).

This script is STAGING ONLY. It reads app/public/data/editions/bible-kjv-en.json
for chapter identifiers/order/titles and the paragraph-chunking convention
ONLY (read-only) and writes nowhere under app/. Output goes to
books/staged-replacements/bible-bsb/bible-bsb-en.staged.json and a
validation report.

Usage: python3 build_bsb_edition.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
KJV_PATH = ROOT / "app/public/data/editions/bible-kjv-en.json"
BSB_TXT = Path(__file__).resolve().parent / "bsb.txt"
OUT_JSON = Path(__file__).resolve().parent / "bible-bsb-en.staged.json"
OUT_REPORT = Path(__file__).resolve().parent / "validation-report.md"

SUP_DIGITS = "⁰¹²³⁴⁵⁶⁷⁸⁹"

def to_superscript(n: int) -> str:
    return "".join(SUP_DIGITS[int(d)] for d in str(n))

BSB_TO_KJV_BOOK = {"Psalm": "Psalms"}
SINGLE_CHAPTER_BOOKS = {"Obadiah", "Philemon", "2 John", "3 John", "Jude"}


def parse_bsb_txt():
    """Returns dict[(book, chapter)] -> list[(verse_num, text)] in file order."""
    data = {}
    header_lines_skipped = 0
    with open(BSB_TXT, encoding="utf-8-sig") as f:
        for line in f:
            line = line.rstrip("\r\n")
            if not line:
                continue
            if "\t" not in line:
                continue
            ref, text = line.split("\t", 1)
            m = re.match(r"^(.+) (\d+):(\d+)$", ref)
            if not m:
                if header_lines_skipped < 5:
                    header_lines_skipped += 1
                    continue
                raise ValueError(f"Unparseable BSB line: {line!r}")
            book, ch, vs = m.group(1), int(m.group(2)), int(m.group(3))
            book = BSB_TO_KJV_BOOK.get(book, book)
            data.setdefault((book, ch), []).append((vs, text.strip()))
    return data


def parse_kjv_chapter_title(title: str):
    if title in SINGLE_CHAPTER_BOOKS:
        return title, 1
    m = re.match(r"^(.*) (\d+)$", title)
    if not m:
        raise ValueError(f"Unparseable KJV chapter title: {title!r}")
    return m.group(1), int(m.group(2))


def chunk_verses_to_paragraphs(verses):
    """verses: list[(num, text)] sorted by num. Returns list[str] paragraphs,
    5 verses per paragraph (last paragraph may be shorter), matching the
    kjv-en.json convention verified across all 1189 chapters."""
    paras = []
    for i in range(0, len(verses), 5):
        group = verses[i : i + 5]
        parts = [f"{to_superscript(n)} {t}" for n, t in group]
        paras.append(" ".join(parts))
    return paras


def main():
    kjv = json.loads(KJV_PATH.read_text())
    bsb = parse_bsb_txt()

    out_chapters = []
    issues = []
    total_verses_bsb = 0
    total_verses_kjv = 0
    chapters_ok = 0

    for c in kjv["chapters"]:
        book, chnum = parse_kjv_chapter_title(c["title"])
        kjv_verse_count = sum(
            len(re.findall(r"[¹²³⁴⁵⁶⁷⁸⁹⁰]+", p)) for p in c["paragraphs"]
        )
        total_verses_kjv += kjv_verse_count

        key = (book, chnum)
        if key not in bsb:
            issues.append(
                {"chapter": c["number"], "title": c["title"], "issue": "MISSING_IN_BSB",
                 "detail": f"No BSB verses found for {book} {chnum}"}
            )
            out_chapters.append({"number": c["number"], "title": c["title"], "paragraphs": []})
            continue

        verses = sorted(bsb[key], key=lambda x: x[0])
        bsb_verse_count = len(verses)
        total_verses_bsb += bsb_verse_count

        # check sequential 1..N with no gaps/dupes
        nums = [v[0] for v in verses]
        expected = list(range(1, bsb_verse_count + 1))
        if nums != expected:
            issues.append(
                {"chapter": c["number"], "title": c["title"], "issue": "NON_SEQUENTIAL_VERSES",
                 "detail": f"BSB verse numbers for {book} {chnum}: {nums[:15]}{'...' if len(nums)>15 else ''}"}
            )

        if bsb_verse_count != kjv_verse_count:
            issues.append(
                {"chapter": c["number"], "title": c["title"], "issue": "VERSE_COUNT_MISMATCH",
                 "detail": f"KJV has {kjv_verse_count} verses, BSB has {bsb_verse_count} verses for {book} {chnum}"}
            )
        else:
            chapters_ok += 1

        paragraphs = chunk_verses_to_paragraphs(verses)
        out_chapters.append({"number": c["number"], "title": c["title"], "paragraphs": paragraphs})

    out = {"chapters": out_chapters, "sections": kjv["sections"]}
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=1))

    # word counts
    def word_count(edition):
        return sum(len(p.split()) for c in edition["chapters"] for p in c["paragraphs"])

    bsb_words = word_count(out)
    kjv_words = word_count(kjv)

    h = hashlib.sha256(OUT_JSON.read_bytes()).hexdigest()

    report = []
    report.append("# BSB staged-edition build validation report\n")
    report.append(f"Source file: `bsb.txt` (bereanbible.com, downloaded 2026-09-11)")
    report.append(f"Source file sha256 (first 16): `{hashlib.sha256(BSB_TXT.read_bytes()).hexdigest()[:16]}`")
    report.append(f"Output file: `bible-bsb-en.staged.json`")
    report.append(f"Output file sha256 (first 16): `{h[:16]}`\n")
    report.append(f"Chapters written: {len(out_chapters)} (kjv-en.json has {len(kjv['chapters'])})")
    report.append(f"Chapters with exact verse-count match to KJV: {chapters_ok} / {len(out_chapters)}")
    report.append(f"Total BSB verses placed: {total_verses_bsb}")
    report.append(f"Total KJV verses (reference): {total_verses_kjv}")
    report.append(f"BSB word count: {bsb_words}")
    report.append(f"KJV word count (reference): {kjv_words}\n")
    report.append(f"## Issues found: {len(issues)}\n")
    for iss in issues:
        report.append(f"- **ch{iss['chapter']} {iss['title']}** [{iss['issue']}]: {iss['detail']}")
    if not issues:
        report.append("(none — every chapter matched KJV's verse count exactly, sequential 1..N, no gaps/dupes)")

    OUT_REPORT.write_text("\n".join(report) + "\n")
    print("\n".join(report))


if __name__ == "__main__":
    main()
