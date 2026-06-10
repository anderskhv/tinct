#!/usr/bin/env python3
"""
Book Factory status checker — reads actual files and prints ground truth.
Run from books/ folder: python3 check-status.py

Checks: editions on disk, audio in staging, hasAudio flags in registry,
R2 coverage (ch1 + last chapter), missing hasAudio vs R2, threads files.

Usage:
  python3 check-status.py          # Local checks only (fast, no network)
  python3 check-status.py --r2     # Also check R2 audio availability
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

EDITIONS_DIR = Path(__file__).parent / "../app/public/data/editions"
STAGING_AUDIO = Path(__file__).parent / "../app/tts/audio"
REGISTRY = Path(__file__).parent / "../app/src/data/bookRegistry.ts"
AUDIO_API_BASE = "https://tinct.app/api/audio-manifest"

# Books where threads are not expected (treatises/journals)
NO_THREADS_EXPECTED = {
    "the-art-of-war", "meditations", "the-manual", "enchiridion",
    "apology", "nicomachean-ethics", "the-prince", "beyond-good-and-evil",
    # Single-voice treatises / memoirs where the Cast UI adds little value.
    "utilitarianism", "discourse-on-inequality", "walden",
    "vindication-rights-of-woman",
}


def get_public_books():
    """Read the public BOOKS array from bookRegistry.ts and return ordered list of IDs."""
    try:
        text = REGISTRY.read_text()
    except FileNotFoundError:
        return []

    # Extract the BOOKS = [...] export
    m = re.search(r'export const BOOKS[^=]*=\s*\[([^\]]+)\]', text)
    if not m:
        return []
    const_names = re.findall(r'\b([A-Z][A-Z_]+)\b', m.group(1))

    # Map const name → book id by parsing each const block
    id_map = {}
    for block_m in re.finditer(r'(?:export\s+)?const\s+([A-Z][A-Z_]*)\s*(?::\s*Book)?\s*=\s*\{', text):
        const_name = block_m.group(1)
        after = text[block_m.start():]
        id_m = re.search(r"id:\s*'([^']+)'", after[:300])
        if id_m:
            id_map[const_name] = id_m.group(1)

    return [id_map[c] for c in const_names if c in id_map]


def get_registry_info(book_id):
    """Return {edition_key: has_audio_bool} for a book."""
    try:
        text = REGISTRY.read_text()
    except FileNotFoundError:
        return {}

    # Find the const block for this book
    pattern = r'(?:export\s+)?const\s+[A-Z][A-Z_]*\s*(?::\s*Book)?\s*=\s*\{'
    blocks = list(re.finditer(pattern, text))
    target_start = None
    for i, bm in enumerate(blocks):
        after = text[bm.start():bm.start() + 300]
        if f"id: '{book_id}'" in after:
            target_start = bm.start()
            target_end = blocks[i + 1].start() if i + 1 < len(blocks) else len(text)
            break

    if target_start is None:
        return {}

    block = text[target_start:target_end]
    result = {}
    for eb in re.findall(r'\{([^{}]+)\}', block):
        key_m = re.search(r"key:\s*'([^']+)'", eb)
        if key_m:
            result[key_m.group(1)] = 'hasAudio: true' in eb
    return result


def count_edition(filepath):
    try:
        with open(filepath) as f:
            data = json.load(f)
        chapters = data.get("chapters", [])
        filled = sum(1 for ch in chapters if len(ch.get("paragraphs", [])) > 0)
        return filled, len(chapters)
    except (FileNotFoundError, json.JSONDecodeError):
        return 0, 0


def find_editions(book_id):
    editions = {}
    for f in sorted(EDITIONS_DIR.glob(f"{book_id}-*.json")):
        name = f.stem
        if any(x in name for x in ["threads", "batch", "part", " ", "onboarding"]):
            continue
        if "-ch" in name and name.split("-ch")[-1].isdigit():
            continue
        key = name[len(book_id) + 1:]
        filled, total = count_edition(f)
        editions[key] = (filled, total)
    return editions


def get_chapter_count_from_edition(book_id, edition_key="modern-en"):
    """Get total chapter count from edition file."""
    path = EDITIONS_DIR / f"{book_id}-{edition_key}.json"
    try:
        with open(path) as f:
            data = json.load(f)
        return len(data.get("chapters", []))
    except (FileNotFoundError, json.JSONDecodeError):
        return 0


def check_r2_chapter(book_id, edition_key, chapter):
    path = f"{book_id}/{edition_key}/ch{chapter}/manifest.json"
    url = f"{AUDIO_API_BASE}?path={path}"
    try:
        result = subprocess.run(
            ["curl", "-sf", "-o", "/dev/null", "-w", "%{http_code}", url],
            capture_output=True, text=True, timeout=10
        )
        return result.stdout.strip() == "200"
    except Exception:
        return False


def check_r2_full(book_id, edition_key):
    """Check ch1 AND last chapter. Returns (ch1_ok, last_ok, total_chapters)."""
    total = get_chapter_count_from_edition(book_id, edition_key)
    if total == 0:
        # Try from original-en
        total = get_chapter_count_from_edition(book_id, "original-en")
    ch1 = check_r2_chapter(book_id, edition_key, 1)
    last = check_r2_chapter(book_id, edition_key, total) if total > 1 else ch1
    return ch1, last, total


def count_staging(book_id, edition_key):
    staging = STAGING_AUDIO / book_id / edition_key
    if not staging.exists():
        return 0, 0
    chapters = len([d for d in staging.iterdir() if d.is_dir() and d.name.startswith("ch")])
    manifests = sum(1 for d in staging.iterdir() if d.is_dir() and (d / "manifest.json").exists())
    return chapters, manifests


def check_threads(book_id):
    path = EDITIONS_DIR / f"{book_id}-threads.json"
    if not path.exists():
        return None
    try:
        with open(path) as f:
            data = json.load(f)
        return len(data.get("characters", []))
    except (json.JSONDecodeError, KeyError):
        return 0


def r2_label(ch1, last, total):
    if not ch1 and not last:
        return "[R2:MISS]"
    if ch1 and last:
        return f"[R2:OK/{total}ch]"
    if ch1 and not last:
        return f"[R2:PARTIAL ch1 only of {total}]"
    return "[R2:?]"


def main():
    check_r2_flag = "--r2" in sys.argv
    books = get_public_books()

    print("=" * 110)
    print("TINCT BOOK FACTORY — STATUS CHECK")
    if check_r2_flag:
        print("(including R2 checks — may take ~30s)")
    print(f"Tracking {len(books)} public books from bookRegistry.ts")
    print("=" * 110)

    print(f"\n{'Book':<28} {'Editions':<12} {'EN Audio (staging→R2)':<32} {'hasAudio flag':<14} {'Threads':<10}")
    print("─" * 100)

    issues = []

    for book_id in books:
        editions = find_editions(book_id)
        all_complete = all(f == t and t > 0 for f, t in editions.values())
        edition_str = f"{len(editions)} eds" + (" OK" if all_complete else " GAPS")

        en_ch, en_m = count_staging(book_id, "modern-en")
        staging_str = f"{en_ch}ch/{en_m}m" if en_ch > 0 else "—"

        registry = get_registry_info(book_id)
        en_has_audio = registry.get("modern-en", False)
        flag_str = "✓" if en_has_audio else "MISSING"

        if check_r2_flag:
            ch1_ok, last_ok, total = check_r2_full(book_id, "modern-en")
            r2_str = r2_label(ch1_ok, last_ok, total)
            audio_str = f"{staging_str} {r2_str}"

            if not ch1_ok:
                issues.append(f"  ! {book_id}: no modern-en audio on R2 at all")
            elif not last_ok:
                issues.append(f"  ! {book_id}: modern-en audio on R2 is PARTIAL (ch1 OK, ch{total} missing)")

            if (ch1_ok and last_ok) and not en_has_audio:
                issues.append(f"  ! {book_id}: audio complete on R2 but hasAudio flag MISSING in registry")
                flag_str = "*** MISSING ***"
        else:
            audio_str = staging_str

        thread_count = check_threads(book_id)
        if thread_count is not None:
            thread_str = f"{thread_count} chars"
        elif book_id in NO_THREADS_EXPECTED:
            thread_str = "N/A"
        else:
            thread_str = "MISSING"
            issues.append(f"  ! {book_id}: missing threads file")

        print(f"{book_id:<28} {edition_str:<12} {audio_str:<32} {flag_str:<14} {thread_str:<10}")

    # Junk files
    junk = [
        f.name for f in sorted(EDITIONS_DIR.iterdir())
        if " " in f.name or "batch" in f.name or ("part" in f.name and f.name.endswith(".json"))
    ]
    if junk:
        print(f"\n{'─' * 60}")
        print(f"  JUNK FILES ({len(junk)})")
        print(f"{'─' * 60}")
        for j in junk[:10]:
            print(f"    {j}")
        if len(junk) > 10:
            print(f"    ... and {len(junk) - 10} more")

    if issues:
        print(f"\n{'─' * 60}")
        print(f"  ISSUES ({len(issues)})")
        print(f"{'─' * 60}")
        for issue in issues:
            print(issue)
    else:
        if check_r2_flag:
            print(f"\n  All {len(books)} public books: editions OK, audio complete on R2, hasAudio flags set.")

    print()


if __name__ == "__main__":
    main()
