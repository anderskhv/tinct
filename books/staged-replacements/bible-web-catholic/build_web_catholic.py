#!/usr/bin/env python3
"""
Parse the World English Bible (Catholic Edition) USFM package into a
validated, structured JSON for staging. This is a SEPARATE package from the
BSB replacement — Catholic 73-book canon, not merged or appended to BSB in
any way.

Source: https://ebible.org/Scriptures/eng-web-c_usfm.zip (downloaded 2026-09-11).

This does NOT attempt to fit Tinct's existing 1189-chapter Protestant Bible
numbering (bible-kjv-en.json) — the Catholic canon has 7 additional books
(and expanded Esther/Daniel) that do not exist in that scheme at all, and
inserting them would renumber every subsequent chapter. This script instead
builds a self-contained, internally consistent chapter numbering (1..N) in
correct Catholic canonical book order, clearly NOT meant to be a drop-in
edition of the existing "bible" book entry. See PROVENANCE.md and
INTEGRATION-NOTES.md in this folder for what the app agent needs to decide.

Usage: python3 build_web_catholic.py
"""
import hashlib
import json
import re
from pathlib import Path

SRC_DIR = Path(__file__).resolve().parent / "usfm"
OUT_JSON = Path(__file__).resolve().parent / "bible-catholic-en.staged.json"
OUT_REPORT = Path(__file__).resolve().parent / "validation-report.md"

# Catholic canonical order (book code -> display title), OT then NT.
CATHOLIC_ORDER = [
    ("GEN", "Genesis"), ("EXO", "Exodus"), ("LEV", "Leviticus"), ("NUM", "Numbers"),
    ("DEU", "Deuteronomy"), ("JOS", "Joshua"), ("JDG", "Judges"), ("RUT", "Ruth"),
    ("1SA", "1 Samuel"), ("2SA", "2 Samuel"), ("1KI", "1 Kings"), ("2KI", "2 Kings"),
    ("1CH", "1 Chronicles"), ("2CH", "2 Chronicles"), ("EZR", "Ezra"), ("NEH", "Nehemiah"),
    ("TOB", "Tobit"), ("JDT", "Judith"), ("ESG", "Esther (Greek)"),
    ("JOB", "Job"), ("PSA", "Psalms"), ("PRO", "Proverbs"), ("ECC", "Ecclesiastes"),
    ("SNG", "Song of Solomon"), ("WIS", "Wisdom"), ("SIR", "Sirach"),
    ("ISA", "Isaiah"), ("JER", "Jeremiah"), ("LAM", "Lamentations"), ("BAR", "Baruch"),
    ("EZK", "Ezekiel"), ("DAG", "Daniel (Greek)"),
    ("HOS", "Hosea"), ("JOL", "Joel"), ("AMO", "Amos"), ("OBA", "Obadiah"),
    ("JON", "Jonah"), ("MIC", "Micah"), ("NAM", "Nahum"), ("HAB", "Habakkuk"),
    ("ZEP", "Zephaniah"), ("HAG", "Haggai"), ("ZEC", "Zechariah"), ("MAL", "Malachi"),
    ("1MA", "1 Maccabees"), ("2MA", "2 Maccabees"),
    ("MAT", "Matthew"), ("MRK", "Mark"), ("LUK", "Luke"), ("JHN", "John"), ("ACT", "Acts"),
    ("ROM", "Romans"), ("1CO", "1 Corinthians"), ("2CO", "2 Corinthians"), ("GAL", "Galatians"),
    ("EPH", "Ephesians"), ("PHP", "Philippians"), ("COL", "Colossians"),
    ("1TH", "1 Thessalonians"), ("2TH", "2 Thessalonians"), ("1TI", "1 Timothy"),
    ("2TI", "2 Timothy"), ("TIT", "Titus"), ("PHM", "Philemon"), ("HEB", "Hebrews"),
    ("JAS", "James"), ("1PE", "1 Peter"), ("2PE", "2 Peter"), ("1JN", "1 John"),
    ("2JN", "2 John"), ("3JN", "3 John"), ("JUD", "Jude"), ("REV", "Revelation"),
]

DEUTEROCANONICAL = {"TOB", "JDT", "ESG", "WIS", "SIR", "BAR", "1MA", "2MA", "DAG"}


def strip_usfm(text: str) -> str:
    # Drop footnotes and cross-references entirely (content + markers).
    text = re.sub(r"\\f\s*\+.*?\\f\*", "", text, flags=re.S)
    text = re.sub(r"\\x\s*\+.*?\\x\*", "", text, flags=re.S)
    # Strip character-style markers but keep their text content.
    text = re.sub(r"\\(wj|add|nd|bk|it|bd|sc|qs|tl|em)\*?", "", text)
    # Remove any remaining backslash-tag tokens (\p, \q1, \q2, \m, \b, etc.)
    text = re.sub(r"\\[a-zA-Z0-9]+\*?", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def find_book_file(code: str) -> Path | None:
    matches = list(SRC_DIR.glob(f"*{code}eng-web-c.usfm"))
    return matches[0] if matches else None


def parse_book(path: Path):
    """Returns dict[chapter_num] -> list[(verse_num, text)]"""
    raw = path.read_text(encoding="utf-8")
    chapters = {}
    cur_chapter = None
    cur_verse = None
    buf = []

    def flush():
        nonlocal buf, cur_verse
        if cur_chapter is not None and cur_verse is not None:
            txt = strip_usfm(" ".join(buf))
            if txt:
                chapters.setdefault(cur_chapter, []).append((cur_verse, txt))
        buf = []

    for line in raw.split("\n"):
        m_c = re.match(r"\\c\s+(\d+)", line)
        m_v = re.match(r"\\v\s+(\d+)\b(.*)", line)
        if m_c:
            flush()
            cur_chapter = int(m_c.group(1))
            cur_verse = None
            continue
        if m_v:
            flush()
            cur_verse = int(m_v.group(1))
            buf = [m_v.group(2)]
            continue
        if cur_verse is not None:
            buf.append(line)
    flush()
    return chapters


def main():
    out_chapters = []
    issues = []
    chnum = 0
    book_summaries = []
    missing_books = []

    for code, title in CATHOLIC_ORDER:
        path = find_book_file(code)
        if not path:
            missing_books.append((code, title))
            continue
        chapters = parse_book(path)
        if not chapters:
            issues.append(f"{title} ({code}): parsed zero chapters — check USFM structure")
            continue
        n_chapters = max(chapters.keys())
        total_verses = 0
        for cnum in range(1, n_chapters + 1):
            chnum += 1
            verses = sorted(chapters.get(cnum, []), key=lambda x: x[0])
            if not verses:
                issues.append(f"{title} {cnum}: no verses parsed (gap in chapter sequence)")
                out_chapters.append({"number": chnum, "title": f"{title} {cnum}", "paragraphs": []})
                continue
            nums = [v[0] for v in verses]
            if nums != list(range(1, len(nums) + 1)):
                issues.append(f"{title} {cnum}: non-sequential verse numbers {nums[:10]}")
            total_verses += len(verses)
            # 5-verse paragraph chunking, same convention as the BSB package
            paras = []
            for i in range(0, len(verses), 5):
                group = verses[i : i + 5]
                sup = lambda n: "".join("⁰¹²³⁴⁵⁶⁷⁸⁹"[int(d)] for d in str(n))
                paras.append(" ".join(f"{sup(n)} {t}" for n, t in group))
            out_chapters.append({"number": chnum, "title": f"{title} {cnum}", "paragraphs": paras})
        book_summaries.append((code, title, n_chapters, total_verses, code in DEUTEROCANONICAL))

    out = {"chapters": out_chapters, "sections": []}  # section tree left for app agent / follow-up content pass
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    h = hashlib.sha256(OUT_JSON.read_bytes()).hexdigest()

    total_verses_all = sum(b[3] for b in book_summaries)
    report = []
    report.append("# World English Bible (Catholic Edition) — staged build validation\n")
    report.append(f"Source: `usfm/` (73 book files from `eng-web-c_usfm.zip`, ebible.org, downloaded 2026-09-11)")
    report.append(f"Output: `bible-catholic-en.staged.json`, sha256 (first 16): `{h[:16]}`\n")
    report.append(f"Books found: {len(book_summaries)} / 73 expected")
    if missing_books:
        report.append(f"**MISSING BOOKS: {missing_books}**")
    report.append(f"Total chapters: {chnum}")
    report.append(f"Total verses: {total_verses_all}")
    report.append(f"Deuterocanonical books present: {sum(1 for b in book_summaries if b[4])} / 9 expected (Tobit, Judith, Esther-Greek, Wisdom, Sirach, Baruch, Daniel-Greek, 1 Maccabees, 2 Maccabees)\n")
    report.append("## Per-book chapter/verse counts\n")
    report.append("| code | title | chapters | verses | deuterocanonical |")
    report.append("|---|---|---|---|---|")
    for code, title, nch, nv, deutero in book_summaries:
        report.append(f"| {code} | {title} | {nch} | {nv} | {'yes' if deutero else ''} |")
    report.append(f"\n## Issues found: {len(issues)}\n")
    for iss in issues[:60]:
        report.append(f"- {iss}")
    if len(issues) > 60:
        report.append(f"...and {len(issues)-60} more")
    if not issues:
        report.append("(none)")

    OUT_REPORT.write_text("\n".join(report) + "\n")
    print("\n".join(report))


if __name__ == "__main__":
    main()
