#!/usr/bin/env python3
"""
Book Factory status checker — reads actual files and prints ground truth.
Run from books/ folder: python3 check-status.py
"""

import json
import os
from pathlib import Path

EDITIONS_DIR = Path(__file__).parent / "../app/public/data/editions"
STAGING_AUDIO = Path(__file__).parent / "../app/tts/audio"
PUBLIC_AUDIO = Path(__file__).parent / "../app/public/audio"
REGISTRY = Path(__file__).parent / "../app/src/data/bookRegistry.ts"

BOOKS = ["odyssey", "ulysses", "war-and-peace", "bible"]


def count_edition(filepath):
    """Returns (chapters_with_content, total_chapters)."""
    try:
        with open(filepath) as f:
            data = json.load(f)
        chapters = data.get("chapters", [])
        filled = sum(1 for ch in chapters if len(ch.get("paragraphs", [])) > 0)
        return filled, len(chapters)
    except (FileNotFoundError, json.JSONDecodeError):
        return 0, 0


def count_audio_chapters(audio_dir):
    """Count chapter folders in an audio directory."""
    if not audio_dir.exists():
        return 0
    return len([d for d in audio_dir.iterdir() if d.is_dir() and d.name.startswith("ch")])


def check_threads(book_id):
    """Check if threads file exists and has characters."""
    path = EDITIONS_DIR / f"{book_id}-threads.json"
    if not path.exists():
        return None
    try:
        with open(path) as f:
            data = json.load(f)
        chars = data.get("characters", [])
        return len(chars)
    except (json.JSONDecodeError, KeyError):
        return 0


def check_registry(book_id):
    """Parse registry for hasAudio flags."""
    try:
        text = REGISTRY.read_text()
    except FileNotFoundError:
        return {}

    results = {}
    # Simple text scanning — find edition blocks for this book
    in_book = False
    for line in text.split("\n"):
        if f"id: '{book_id}'" in line:
            in_book = True
        elif in_book and "id: '" in line and f"'{book_id}'" not in line:
            in_book = False
        if in_book and "key: '" in line:
            key = line.split("key: '")[1].split("'")[0]
        if in_book and "hasAudio:" in line:
            has = "true" in line
            results[key] = has
    return results


def find_editions(book_id):
    """Find all edition files for a book."""
    editions = {}
    for f in sorted(EDITIONS_DIR.glob(f"{book_id}-*.json")):
        name = f.stem
        # Skip threads, batch files, part files, duplicates with spaces, chapter fragments
        if "threads" in name or "batch" in name or "part1" in name or " " in name:
            continue
        # Skip per-chapter fragment files (e.g., bible-modern-en-ch2)
        if "-ch" in name and name.split("-ch")[-1].isdigit():
            continue
        # Extract edition key: everything after book_id-
        key = name[len(book_id) + 1:]
        filled, total = count_edition(f)
        editions[key] = (filled, total)
    return editions


def main():
    print("=" * 80)
    print("TINCT BOOK FACTORY — STATUS CHECK")
    print("=" * 80)

    for book_id in BOOKS:
        print(f"\n{'─' * 60}")
        print(f"  {book_id.upper().replace('-', ' ')}")
        print(f"{'─' * 60}")

        # Editions
        editions = find_editions(book_id)
        print(f"\n  Editions:")
        for key, (filled, total) in editions.items():
            status = "Complete" if filled == total and total > 0 else f"{filled}/{total}"
            print(f"    {key:20s}  {status}")

        # Audio staging
        staging_path = STAGING_AUDIO / book_id
        if staging_path.exists():
            print(f"\n  Audio (staging):")
            for ed_dir in sorted(staging_path.iterdir()):
                if ed_dir.is_dir():
                    count = count_audio_chapters(ed_dir)
                    print(f"    {ed_dir.name:20s}  {count} chapters")
        else:
            print(f"\n  Audio (staging):     None")

        # Audio public
        public_path = PUBLIC_AUDIO / book_id
        if public_path.exists():
            print(f"\n  Audio (public):")
            for ed_dir in sorted(public_path.iterdir()):
                if ed_dir.is_dir():
                    count = count_audio_chapters(ed_dir)
                    print(f"    {ed_dir.name:20s}  {count} chapters")
        else:
            print(f"\n  Audio (public):      None")

        # Registry
        registry = check_registry(book_id)
        if registry:
            print(f"\n  Registry (hasAudio):")
            for key, has in registry.items():
                print(f"    {key:20s}  {'true' if has else 'false'}")

        # Threads
        thread_count = check_threads(book_id)
        if thread_count is not None:
            print(f"\n  Threads:             {thread_count} characters")
        else:
            print(f"\n  Threads:             None")

    # Junk files
    print(f"\n{'─' * 60}")
    print(f"  JUNK FILES (should clean up)")
    print(f"{'─' * 60}")
    junk = []
    for f in sorted(EDITIONS_DIR.iterdir()):
        if " " in f.name:
            junk.append(f.name)
        if "batch" in f.name or "part1" in f.name:
            junk.append(f.name)
    if junk:
        for j in junk:
            print(f"    {j}")
    else:
        print("    None")

    print()


if __name__ == "__main__":
    main()
