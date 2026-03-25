#!/usr/bin/env python3
"""Parse a Project Gutenberg plain text file into Tinct edition JSON format.

Handles common Gutenberg formatting: headers/footers, chapter detection,
line wrapping, paragraph assembly.

Usage:
  python3 parse-gutenberg.py <input.txt> --book-id <id> [--output <path>] [--pattern <regex>]

Examples:
  python3 parse-gutenberg.py raw/odyssey/raw.txt --book-id odyssey
  python3 parse-gutenberg.py raw/divine-comedy/raw.txt --book-id divine-comedy --pattern "^CANTO \\w+"
  python3 parse-gutenberg.py raw/pride/raw.txt --book-id pride-and-prejudice --output ../tinct/src/data/editions/pride-and-prejudice-original-en.json

Options:
  --book-id ID       Required. The book identifier (e.g., 'odyssey', 'pride-and-prejudice')
  --output PATH      Output JSON path. Default: ../tinct/src/data/editions/{book-id}-original-en.json
  --pattern REGEX    Custom chapter heading regex. Default: auto-detect from common patterns.
  --min-paragraphs N Minimum paragraphs for a chapter to be kept (default: 1)
  --dry-run          Show detected chapters without writing JSON
  --help             Show this help message
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional, List


# Common chapter heading patterns (ordered by specificity)
CHAPTER_PATTERNS = [
    # "BOOK I" / "Book I" / "BOOK 1"
    re.compile(r'^BOOK\s+([IVXLCDM]+|\d+)\.?\s*$', re.IGNORECASE),
    # "CHAPTER I" / "Chapter 1" / "CHAPTER I."
    re.compile(r'^CHAPTER\s+([IVXLCDM]+|\d+)\.?\s*$', re.IGNORECASE),
    # "CHAPTER I — Title" / "Chapter 1: Title"
    re.compile(r'^CHAPTER\s+([IVXLCDM]+|\d+)[\.:\s—–-]+\s*.+', re.IGNORECASE),
    # "BOOK I — Title"
    re.compile(r'^BOOK\s+([IVXLCDM]+|\d+)[\.:\s—–-]+\s*.+', re.IGNORECASE),
    # "I." or "I" at start of line (Roman numeral chapters, common in older texts)
    re.compile(r'^([IVXLCDM]+)\.\s*$'),
    # "CANTO I" (Divine Comedy, etc.)
    re.compile(r'^CANTO\s+([IVXLCDM]+|\d+)\.?\s*$', re.IGNORECASE),
    # "ACT I" (plays)
    re.compile(r'^ACT\s+([IVXLCDM]+|\d+)\.?\s*$', re.IGNORECASE),
    # "PART I" / "Part One"
    re.compile(r'^PART\s+([IVXLCDM]+|\d+|\w+)\.?\s*$', re.IGNORECASE),
    # Numbered: "1." or "1" alone on a line
    re.compile(r'^(\d{1,3})\.\s*$'),
]


def strip_gutenberg_header_footer(text: str) -> str:
    """Remove Project Gutenberg header and footer boilerplate."""
    lines = text.split('\n')

    # Find start of actual text (after "*** START OF" line)
    start_idx = 0
    for i, line in enumerate(lines):
        if re.match(r'\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG', line, re.IGNORECASE):
            start_idx = i + 1
            break

    # Find end of actual text (before "*** END OF" line)
    end_idx = len(lines)
    for i in range(len(lines) - 1, -1, -1):
        if re.match(r'\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG', lines[i], re.IGNORECASE):
            end_idx = i
            break

    # Skip blank lines after header marker
    while start_idx < end_idx and not lines[start_idx].strip():
        start_idx += 1

    return '\n'.join(lines[start_idx:end_idx])


def detect_chapter_pattern(text: str) -> Optional[re.Pattern]:
    """Try each pattern and return the one with the most matches (minimum 2)."""
    lines = text.split('\n')
    best_pattern = None
    best_count = 0

    for pattern in CHAPTER_PATTERNS:
        count = sum(1 for line in lines if pattern.match(line.strip()))
        if count >= 2 and count > best_count:
            best_count = count
            best_pattern = pattern

    return best_pattern


def roman_to_int(s: str) -> int:
    """Convert Roman numeral to integer."""
    roman_values = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    s = s.upper()
    result = 0
    for i in range(len(s)):
        if i + 1 < len(s) and roman_values.get(s[i], 0) < roman_values.get(s[i + 1], 0):
            result -= roman_values.get(s[i], 0)
        else:
            result += roman_values.get(s[i], 0)
    return result


def lines_to_paragraphs(lines: List[str]) -> List[str]:
    """Convert a block of lines into paragraphs.

    Gutenberg texts use blank lines between paragraphs. Lines within a
    paragraph are joined with spaces (unwrapping the hard line wraps).
    """
    paragraphs = []
    current = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            if current:
                paragraphs.append(' '.join(current))
                current = []
        else:
            current.append(stripped)

    if current:
        paragraphs.append(' '.join(current))

    return [p for p in paragraphs if p]


def extract_title_from_heading(heading: str) -> str:
    """Extract a clean chapter title from a heading line.

    'CHAPTER I — The Beginning' -> 'Chapter I — The Beginning'
    'BOOK 3' -> 'Book 3'
    'CHAPTER XII.' -> 'Chapter XII'
    """
    # Clean up trailing periods
    title = heading.strip().rstrip('.')

    # Title-case if all caps
    if title == title.upper() and len(title) > 3:
        # Capitalize first letter of each word, but keep Roman numerals uppercase
        words = title.split()
        result = []
        for word in words:
            clean = word.strip('—–-:.')
            if re.match(r'^[IVXLCDM]+$', clean):
                result.append(word)
            else:
                result.append(word.capitalize())
        title = ' '.join(result)

    return title


def parse_text(text: str, pattern: Optional[re.Pattern], min_paragraphs: int = 1) -> List[dict]:
    """Parse text into chapters using the given pattern."""
    if pattern is None:
        # No chapters detected — treat whole text as one chapter
        paragraphs = lines_to_paragraphs(text.split('\n'))
        return [{'number': 1, 'title': 'Full Text', 'paragraphs': paragraphs}]

    lines = text.split('\n')
    chapters = []
    current_title = None
    current_lines = []

    for line in lines:
        stripped = line.strip()
        if pattern.match(stripped):
            # Save previous chapter
            if current_title is not None:
                paragraphs = lines_to_paragraphs(current_lines)
                if len(paragraphs) >= min_paragraphs:
                    chapters.append({
                        'title': current_title,
                        'paragraphs': paragraphs,
                    })
            current_title = extract_title_from_heading(stripped)
            current_lines = []
        else:
            current_lines.append(line)

    # Save last chapter
    if current_title is not None:
        paragraphs = lines_to_paragraphs(current_lines)
        if len(paragraphs) >= min_paragraphs:
            chapters.append({
                'title': current_title,
                'paragraphs': paragraphs,
            })

    # Number chapters sequentially
    for i, ch in enumerate(chapters):
        ch['number'] = i + 1

    return chapters


def main():
    parser = argparse.ArgumentParser(
        description='Parse Project Gutenberg text into Tinct edition JSON.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument('input', help='Path to raw text file')
    parser.add_argument('--book-id', required=True, help='Book identifier (e.g., odyssey)')
    parser.add_argument('--output', help='Output JSON path (default: auto)')
    parser.add_argument('--pattern', help='Custom chapter heading regex')
    parser.add_argument('--min-paragraphs', type=int, default=1, help='Min paragraphs per chapter (default: 1)')
    parser.add_argument('--dry-run', action='store_true', help='Show detected chapters without writing')

    args = parser.parse_args()

    # Read input
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: {input_path} not found")
        sys.exit(1)

    text = input_path.read_text(encoding='utf-8', errors='replace')

    # Strip Gutenberg boilerplate
    text = strip_gutenberg_header_footer(text)

    # Determine chapter pattern
    if args.pattern:
        pattern = re.compile(args.pattern, re.MULTILINE)
    else:
        pattern = detect_chapter_pattern(text)
        if pattern:
            print(f"Auto-detected chapter pattern: {pattern.pattern}")
        else:
            print("Warning: no chapter pattern detected. Treating as single chapter.")

    # Parse
    chapters = parse_text(text, pattern, args.min_paragraphs)

    # Report
    total_paras = sum(len(c['paragraphs']) for c in chapters)
    print(f"\nFound {len(chapters)} chapters, {total_paras} total paragraphs")
    print()
    for ch in chapters:
        print(f"  Ch {ch['number']:3d}: {ch['title'][:60]:<60s}  ({len(ch['paragraphs'])} paragraphs)")

    if args.dry_run:
        print("\n(dry run — no file written)")
        return

    # Build output
    edition = {
        'chapters': chapters,
    }

    # Determine output path
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = Path(__file__).parent.parent / 'tinct' / 'src' / 'data' / 'editions' / f'{args.book_id}-original-en.json'

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(edition, f, indent=2, ensure_ascii=False)

    print(f"\nWritten to: {output_path}")
    print(f"File size: {output_path.stat().st_size:,} bytes")

    # Verify
    with open(output_path) as f:
        verify = json.load(f)
    print(f"Verified: {len(verify['chapters'])} chapters, {sum(len(c['paragraphs']) for c in verify['chapters'])} paragraphs")


if __name__ == '__main__':
    main()
