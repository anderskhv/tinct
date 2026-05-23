#!/usr/bin/env python3
"""Find English edition audio missing on production R2 and emit a RunPod job.

This audits the actual reader audio source:

    https://tinct.app/api/audio-manifest?path={book}/{edition}/ch{N}/manifest.json

It is intentionally separate from english_audio_backlog.py, which audits local
Mac files under app/tts/audio. Use this script when deciding what RunPod should
generate and upload.

Default scope:
- every public registry book
- every staged registry book
- loose edition JSON files not in the registry
- English editions: original-en and modern-en
- Bible exception: kjv-en and web-en are treated as original-English targets

The generated RunPod command calls app/tts/run-kokoro-cloud.py. That cloud script
is idempotent and skips chapters already present on R2, so edition-level jobs are
safe even when only one chapter is missing.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path


BOOKS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BOOKS_DIR.parent
REGISTRY = PROJECT_ROOT / "app" / "src" / "data" / "bookRegistry.ts"
EDITIONS_DIR = PROJECT_ROOT / "app" / "public" / "data" / "editions"
AUDIO_MANIFEST_BASE = "https://tinct.app/api/audio-manifest?path="
UA = {"User-Agent": "Mozilla/5.0 (TinctMissingAudioAudit)"}
ORIGINAL_EQUIVALENTS = {
    "bible": ["kjv-en", "web-en"],
}


@dataclass(frozen=True)
class BookRecord:
    book_id: str
    title: str
    scope: str


@dataclass
class EditionAudit:
    book_id: str
    edition: str
    scope: str
    chapters: int
    ok: int
    missing: list[int]
    errors: list[tuple[int, str]]

    @property
    def needs_runpod(self) -> bool:
        return bool(self.missing or self.errors)


def find_matching(text: str, start: int, open_ch: str, close_ch: str) -> int:
    depth = 0
    in_string: str | None = None
    escape = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_string:
                in_string = None
            continue
        if ch in ("'", '"', "`"):
            in_string = ch
        elif ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                return i
    raise ValueError(f"unmatched {open_ch}")


def parse_registry() -> tuple[list[BookRecord], list[BookRecord]]:
    text = REGISTRY.read_text()
    consts: dict[str, tuple[str, str]] = {}
    for match in re.finditer(r"export const (\w+): Book = \{", text):
        const_name = match.group(1)
        start = match.end() - 1
        end = find_matching(text, start, "{", "}")
        block = text[start : end + 1]
        id_match = re.search(r"id:\s*'([^']+)'", block)
        title_match = re.search(r"title:\s*'((?:\\'|[^'])*)'", block)
        if not id_match:
            continue
        book_id = id_match.group(1)
        title = title_match.group(1).replace("\\'", "'") if title_match else book_id
        consts[const_name] = (book_id, title)

    books_match = re.search(r"export const BOOKS: Book\[\] = \[([^\]]+)\]", text, re.S)
    if not books_match:
        raise RuntimeError("Could not parse public BOOKS array")
    public_names = [x.strip() for x in books_match.group(1).split(",") if x.strip()]
    public_ids = {consts[name][0] for name in public_names if name in consts}

    public = [
        BookRecord(book_id=consts[name][0], title=consts[name][1], scope="public")
        for name in public_names
        if name in consts
    ]
    staged = [
        BookRecord(book_id=book_id, title=title, scope="staged")
        for book_id, title in consts.values()
        if book_id not in public_ids
    ]
    return public, staged


def loose_books(known_ids: set[str]) -> list[BookRecord]:
    ids = set()
    for path in EDITIONS_DIR.glob("*-modern-en.json"):
        book_id = path.name[: -len("-modern-en.json")]
        if book_id.endswith(" 2") or book_id.endswith(".bak"):
            continue
        if book_id not in known_ids:
            ids.add(book_id)
    for path in EDITIONS_DIR.glob("*-original-en.json"):
        book_id = path.name[: -len("-original-en.json")]
        if book_id.endswith(" 2") or book_id.endswith(".bak"):
            continue
        if book_id not in known_ids:
            ids.add(book_id)
    return [BookRecord(book_id=book_id, title=book_id, scope="loose") for book_id in sorted(ids)]


def load_chapter_numbers(book_id: str, edition: str) -> list[int]:
    path = EDITIONS_DIR / f"{book_id}-{edition}.json"
    if not path.exists():
        return []
    data = json.loads(path.read_text())
    return [int(ch["number"]) for ch in data.get("chapters", [])]


def check_manifest(book_id: str, edition: str, chapter: int) -> tuple[str, str, int, bool, str]:
    url = AUDIO_MANIFEST_BASE + f"{book_id}/{edition}/ch{chapter}/manifest.json"
    request = urllib.request.Request(url, method="HEAD", headers=UA)
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return book_id, edition, chapter, response.status == 200, ""
    except urllib.error.HTTPError as exc:
        if exc.code in (403, 404):
            return book_id, edition, chapter, False, ""
        return book_id, edition, chapter, False, f"HTTP {exc.code}"
    except Exception as exc:
        return book_id, edition, chapter, False, f"{type(exc).__name__}: {str(exc)[:80]}"


def compact_ranges(values: list[int]) -> str:
    if not values:
        return ""
    values = sorted(set(values))
    ranges = []
    start = prev = values[0]
    for value in values[1:]:
        if value == prev + 1:
            prev = value
            continue
        ranges.append(str(start) if start == prev else f"{start}-{prev}")
        start = prev = value
    ranges.append(str(start) if start == prev else f"{start}-{prev}")
    return ", ".join(ranges)


def select_records(scope: str) -> list[BookRecord]:
    public, staged = parse_registry()
    known = {record.book_id for record in public + staged}
    loose = loose_books(known)
    if scope == "public":
        return public
    if scope == "staged":
        return staged
    if scope == "loose":
        return loose
    if scope == "unpublished":
        return staged + loose
    return public + staged + loose


def editions_for_book(book_id: str, editions: list[str]) -> list[str]:
    result: list[str] = []
    for edition in editions:
        if edition == "original-en" and book_id in ORIGINAL_EQUIVALENTS:
            result.extend(ORIGINAL_EQUIVALENTS[book_id])
        else:
            result.append(edition)
    return list(dict.fromkeys(result))


def audit(records: list[BookRecord], editions: list[str], workers: int) -> list[EditionAudit]:
    edition_targets: list[tuple[BookRecord, str, list[int]]] = []
    manifest_tasks: list[tuple[str, str, int]] = []
    scope_by_pair: dict[tuple[str, str], str] = {}
    chapters_by_pair: dict[tuple[str, str], list[int]] = {}

    for record in records:
        for edition in editions_for_book(record.book_id, editions):
            chapters = load_chapter_numbers(record.book_id, edition)
            if not chapters:
                continue
            edition_targets.append((record, edition, chapters))
            scope_by_pair[(record.book_id, edition)] = record.scope
            chapters_by_pair[(record.book_id, edition)] = chapters
            manifest_tasks.extend((record.book_id, edition, chapter) for chapter in chapters)

    ok_by_pair: dict[tuple[str, str], int] = {pair: 0 for pair in chapters_by_pair}
    missing_by_pair: dict[tuple[str, str], list[int]] = {pair: [] for pair in chapters_by_pair}
    errors_by_pair: dict[tuple[str, str], list[tuple[int, str]]] = {pair: [] for pair in chapters_by_pair}

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for book_id, edition, chapter, ok, error in pool.map(lambda t: check_manifest(*t), manifest_tasks):
            pair = (book_id, edition)
            if ok:
                ok_by_pair[pair] += 1
            elif error:
                errors_by_pair[pair].append((chapter, error))
            else:
                missing_by_pair[pair].append(chapter)

    results = []
    for record, edition, chapters in edition_targets:
        pair = (record.book_id, edition)
        results.append(
            EditionAudit(
                book_id=record.book_id,
                edition=edition,
                scope=scope_by_pair[pair],
                chapters=len(chapters),
                ok=ok_by_pair[pair],
                missing=sorted(missing_by_pair[pair]),
                errors=sorted(errors_by_pair[pair]),
            )
        )
    return results


def print_report(results: list[EditionAudit]) -> None:
    total_chapters = sum(r.chapters for r in results)
    total_ok = sum(r.ok for r in results)
    total_missing = sum(len(r.missing) for r in results)
    total_errors = sum(len(r.errors) for r in results)
    missing_editions = [r for r in results if r.needs_runpod]

    print(f"edition_targets={len(results)} checked={total_chapters} ok={total_ok} missing={total_missing} errors={total_errors}")
    print(f"runpod_edition_jobs={len(missing_editions)}")
    for result in missing_editions:
        parts = []
        if result.missing:
            parts.append(f"missing {len(result.missing)}/{result.chapters}: {compact_ranges(result.missing)}")
        if result.errors:
            parts.append(f"errors {len(result.errors)}")
        print(f"{result.scope}\t{result.book_id}/{result.edition}\t" + "; ".join(parts))


def print_runpod_command(results: list[EditionAudit]) -> None:
    jobs = [(r.book_id, r.edition) for r in results if r.needs_runpod]
    if not jobs:
        print("echo 'No missing English audio found on R2.'")
        return
    print("cd /workspace/tinct/scripts")
    print("python3 run-kokoro-cloud.py \\")
    for index, (book_id, edition) in enumerate(jobs):
        suffix = " \\" if index < len(jobs) - 1 else ""
        print(f"  {book_id} {edition}{suffix}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--scope",
        choices=["all", "public", "staged", "loose", "unpublished"],
        default="all",
        help="which books to audit",
    )
    parser.add_argument(
        "--editions",
        default="original-en,modern-en",
        help="comma-separated edition keys to audit",
    )
    parser.add_argument("--workers", type=int, default=24)
    parser.add_argument("--runpod-command", action="store_true", help="print only the RunPod command")
    args = parser.parse_args()

    records = select_records(args.scope)
    editions = [edition.strip() for edition in args.editions.split(",") if edition.strip()]
    start = time.time()
    results = audit(records, editions, workers=args.workers)
    elapsed = time.time() - start

    if args.runpod_command:
        print_runpod_command(results)
    else:
        print_report(results)
        print(f"elapsed={elapsed:.1f}s")
        print()
        print("RunPod command:")
        print_runpod_command(results)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
