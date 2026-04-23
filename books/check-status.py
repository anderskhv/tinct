#!/usr/bin/env python3
"""
Book Factory status checker — reads actual files and prints ground truth.
Run from books/ folder: python3 check-status.py

Checks: editions on disk, audio in staging, hasAudio flags in registry,
threads files, and (optionally) R2 availability.

Usage:
  python3 check-status.py          # Local checks only (fast, no network)
  python3 check-status.py --r2     # Also check R2 audio availability
"""

import json
import os
import sys
from pathlib import Path

EDITIONS_DIR = Path(__file__).parent / "../app/public/data/editions"
STAGING_AUDIO = Path(__file__).parent / "../app/tts/audio"
PUBLIC_AUDIO = Path(__file__).parent / "../app/public/audio"
REGISTRY = Path(__file__).parent / "../app/src/data/bookRegistry.ts"
R2_BASE = "https://pub-c34df89c93284423a39b03537595c2e2.r2.dev"

# All 21 books in the library
BOOKS = [
    "odyssey", "ulysses", "war-and-peace", "bible",
    "gilgamesh", "hamlet", "macbeth", "midsummer",
    "romeo-and-juliet", "the-tempest", "pride-and-prejudice",
    "the-art-of-war", "crime-and-punishment", "the-republic",
    "meditations", "divine-comedy", "jane-eyre", "the-aeneid",
    "paradise-lost", "frankenstein", "the-manual",
]

# Books where threads are not expected (treatises/journals)
NO_THREADS_EXPECTED = {"the-art-of-war", "meditations", "the-manual"}


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


def count_audio_manifests(audio_dir):
    """Count manifest.json files in chapter subdirs."""
    if not audio_dir.exists():
        return 0
    count = 0
    for d in audio_dir.iterdir():
        if d.is_dir() and d.name.startswith("ch") and (d / "manifest.json").exists():
            count += 1
    return count


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
    """Parse registry for hasAudio flags per edition."""
    try:
        text = REGISTRY.read_text()
    except FileNotFoundError:
        return {}

    results = {}
    in_book = False
    current_key = None
    for line in text.split("\n"):
        if f"id: '{book_id}'" in line:
            in_book = True
        elif in_book and "id: '" in line and f"'{book_id}'" not in line:
            in_book = False
        if in_book and "key: '" in line:
            current_key = line.split("key: '")[1].split("'")[0]
        if in_book and "hasAudio:" in line and current_key:
            results[current_key] = "true" in line
    return results


def find_editions(book_id):
    """Find all edition files for a book."""
    editions = {}
    for f in sorted(EDITIONS_DIR.glob(f"{book_id}-*.json")):
        name = f.stem
        if "threads" in name or "batch" in name or "part" in name or " " in name:
            continue
        if "-ch" in name and name.split("-ch")[-1].isdigit():
            continue
        key = name[len(book_id) + 1:]
        filled, total = count_edition(f)
        editions[key] = (filled, total)
    return editions


def check_r2(book_id, edition_key):
    """Check if a book/edition has audio on R2 by fetching ch1 manifest."""
    import subprocess
    url = f"{R2_BASE}/{book_id}/{edition_key}/ch1/manifest.json"
    try:
        result = subprocess.run(
            ["curl", "-sf", "-o", "/dev/null", "-w", "%{http_code}", url],
            capture_output=True, text=True, timeout=10
        )
        return result.stdout.strip() == "200"
    except Exception:
        return False


def find_staging_editions(book_id):
    """Find all edition dirs in staging audio."""
    staging = STAGING_AUDIO / book_id
    if not staging.exists():
        return {}
    result = {}
    for d in sorted(staging.iterdir()):
        if d.is_dir() and not d.name.startswith("."):
            chapters = count_audio_chapters(d)
            manifests = count_audio_manifests(d)
            result[d.name] = (chapters, manifests)
    return result


def main():
    check_r2_flag = "--r2" in sys.argv

    print("=" * 100)
    print("TINCT BOOK FACTORY — STATUS CHECK")
    if check_r2_flag:
        print("(including R2 checks — may take a few seconds)")
    print("=" * 100)

    # Summary table
    print(f"\n{'Book':<22} {'Editions':<12} {'EN Audio':<18} {'DA Audio':<18} {'hasAudio flags':<30} {'Threads':<12}")
    print("─" * 112)

    issues = []

    for book_id in BOOKS:
        # Editions
        editions = find_editions(book_id)
        edition_keys = list(editions.keys())
        all_complete = all(f == t and t > 0 for f, t in editions.values())
        edition_str = f"{len(editions)} eds" + (" OK" if all_complete else " GAPS")

        # Audio staging
        staging = find_staging_editions(book_id)
        en_staging = staging.get("modern-en", (0, 0))
        da_staging = staging.get("modern-da", (0, 0))
        en_audio_str = f"{en_staging[0]}ch/{en_staging[1]}m" if en_staging[0] > 0 else "None"
        da_audio_str = f"{da_staging[0]}ch/{da_staging[1]}m" if da_staging[0] > 0 else "None"

        # R2 check
        if check_r2_flag:
            en_on_r2 = check_r2(book_id, "modern-en")
            da_on_r2 = check_r2(book_id, "modern-da")
            if en_on_r2:
                en_audio_str += " [R2:Y]"
            elif en_staging[0] > 0:
                en_audio_str += " [R2:N]"
                issues.append(f"{book_id}: modern-en audio in staging but NOT on R2")
            if da_on_r2:
                da_audio_str += " [R2:Y]"
            elif da_staging[0] > 0:
                da_audio_str += " [R2:N]"

        # Registry hasAudio
        registry = check_registry(book_id)
        audio_true = [k for k, v in registry.items() if v]
        audio_str = ", ".join(audio_true) if audio_true else "none"

        # Threads
        thread_count = check_threads(book_id)
        if thread_count is not None:
            thread_str = f"{thread_count} chars"
        elif book_id in NO_THREADS_EXPECTED:
            thread_str = "N/A"
        else:
            thread_str = "MISSING"
            issues.append(f"{book_id}: missing threads file (narrative book)")

        # Check for hasAudio mismatches
        if en_staging[0] > 0 and "modern-en" not in audio_true:
            issues.append(f"{book_id}: has modern-en audio but hasAudio flag not set")

        print(f"{book_id:<22} {edition_str:<12} {en_audio_str:<18} {da_audio_str:<18} {audio_str:<30} {thread_str:<12}")

    # Junk files
    junk = []
    for f in sorted(EDITIONS_DIR.iterdir()):
        if " " in f.name or "batch" in f.name or ("part" in f.name and f.name.endswith(".json")):
            junk.append(f.name)

    if junk:
        print(f"\n{'─' * 60}")
        print(f"  JUNK FILES ({len(junk)} files — should clean up)")
        print(f"{'─' * 60}")
        for j in junk[:10]:
            print(f"    {j}")
        if len(junk) > 10:
            print(f"    ... and {len(junk) - 10} more")

    # Issues summary
    if issues:
        print(f"\n{'─' * 60}")
        print(f"  ISSUES ({len(issues)})")
        print(f"{'─' * 60}")
        for issue in issues:
            print(f"  ! {issue}")

    print()


if __name__ == "__main__":
    main()
