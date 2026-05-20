#!/usr/bin/env python3
"""Parse Walden (PG #205) into Tinct edition JSON.

Walden chapter titles aren't standard 'CHAPTER N' format, so we hardcode them.
We slice the file between two known anchors:
- Start: line 55 ('Economy' header)
- End: line 9395 ('ON THE DUTY OF CIVIL DISOBEDIENCE') — excluded
"""
import json
import re
from pathlib import Path

CHAPTERS = [
    "Economy",
    "Where I Lived, and What I Lived For",
    "Reading",
    "Sounds",
    "Solitude",
    "Visitors",
    "The Bean-Field",
    "The Village",
    "The Ponds",
    "Baker Farm",
    "Higher Laws",
    "Brute Neighbors",
    "House-Warming",
    "Former Inhabitants and Winter Visitors",
    "Winter Animals",
    "The Pond in Winter",
    "Spring",
    "Conclusion",
]

RAW = Path("/Users/andershvelplund/Documents/Projects/Tinct/books/raw/walden/raw.txt")
OUT = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions/walden-original-en.json")

def main():
    text = RAW.read_text(encoding="utf-8")
    lines = text.split("\n")

    # Find start of Walden body: first 'Economy' line that occurs ALONE
    # then find 'ON THE DUTY OF CIVIL DISOBEDIENCE' (the second occurrence — first is in TOC)
    # Anchor on line numbers from grep:
    # 55: Economy (start)
    # 9395: ON THE DUTY OF CIVIL DISOBEDIENCE (end)

    # Indices are 0-based; line numbers are 1-based
    start_idx = 54  # line 55
    end_idx = 9394  # line 9395 (exclusive)

    body_lines = lines[start_idx:end_idx]

    # Build a list of (chapter_title, start_line_in_body)
    # Each chapter title appears as a line alone (no leading space typically).
    chapter_positions = []
    body_text = "\n".join(body_lines)
    body_text_lines = body_text.split("\n")

    # For each chapter title, find the line index where it appears alone.
    # Use a strict match: the entire line equals the title (after strip).
    for title in CHAPTERS:
        for i, line in enumerate(body_text_lines):
            if line.strip() == title:
                # Check this isn't already used
                if chapter_positions and chapter_positions[-1][1] >= i:
                    continue
                chapter_positions.append((title, i))
                break

    # Build chapter ranges
    chapters = []
    for idx, (title, start_line) in enumerate(chapter_positions):
        end_line = chapter_positions[idx + 1][1] if idx + 1 < len(chapter_positions) else len(body_text_lines)
        # Skip the title line itself; content starts at start_line + 1
        content_lines = body_text_lines[start_line + 1:end_line]
        # Strip leading/trailing blank lines
        while content_lines and not content_lines[0].strip():
            content_lines.pop(0)
        while content_lines and not content_lines[-1].strip():
            content_lines.pop()

        # Reflow into paragraphs: blank lines = paragraph break
        paragraphs = []
        current = []
        for line in content_lines:
            if line.strip():
                current.append(line.strip())
            else:
                if current:
                    paragraphs.append(" ".join(current))
                    current = []
        if current:
            paragraphs.append(" ".join(current))

        # Clean up: collapse multiple spaces
        paragraphs = [re.sub(r"\s+", " ", p).strip() for p in paragraphs]
        # Remove empty
        paragraphs = [p for p in paragraphs if p]

        chapters.append({
            "number": idx + 1,
            "title": title,
            "paragraphs": paragraphs,
        })

    out = {"chapters": chapters}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")

    total_paras = sum(len(c["paragraphs"]) for c in chapters)
    print(f"Wrote {OUT}")
    print(f"{len(chapters)} chapters, {total_paras} paragraphs")
    for c in chapters:
        print(f"  Ch{c['number']:>2}: {c['title']:<45} {len(c['paragraphs']):>4} paragraphs")

if __name__ == "__main__":
    main()
