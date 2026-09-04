#!/usr/bin/env python3
"""Audit production word-timing sidecars and emit a resumable RunPod job.

The source of truth is the same Worker/R2 surface the reader uses:

    /api/audio-manifest?path={book}/{edition}/ch{N}/manifest.json
    /api/audio-file?path={book}/{edition}/ch{N}/words.json

By default this checks public registry editions marked ``hasAudio: true`` in
English or Danish. Missing audio is reported separately; RunPod word-timing
jobs include only editions that have audio chapters without sidecars.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Callable, Iterable


BOOKS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BOOKS_DIR.parent
REGISTRY = PROJECT_ROOT / "app" / "src" / "data" / "bookRegistry.ts"
EDITIONS_DIR = PROJECT_ROOT / "app" / "public" / "data" / "editions"
MANIFEST_API = "https://tinct.app/api/audio-manifest"
FILE_API = "https://tinct.app/api/audio-file"
UA = {"User-Agent": "TinctWordsCoverage/1.0"}


@dataclass(frozen=True)
class EditionTarget:
    book_id: str
    edition: str
    language: str
    scope: str
    has_audio: bool
    chapters: tuple[int, ...]


@dataclass
class EditionAudit:
    book_id: str
    edition: str
    language: str
    scope: str
    chapters: int
    audio_ok: int
    audio_missing: list[int]
    sidecars_ok: int
    sidecars_missing: list[int]
    errors: list[tuple[int, str, str]]

    @property
    def needs_sidecars(self) -> bool:
        return bool(self.sidecars_missing)


def find_matching(text: str, start: int, open_ch: str, close_ch: str) -> int:
    depth = 0
    in_string: str | None = None
    escape = False
    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == in_string:
                in_string = None
            continue
        if char in ("'", '"', "`"):
            in_string = char
        elif char == open_ch:
            depth += 1
        elif char == close_ch:
            depth -= 1
            if depth == 0:
                return index
    raise ValueError(f"unmatched {open_ch}")


def parse_editions(block: str) -> list[tuple[str, str, bool]]:
    marker = re.search(r"editions:\s*\[", block)
    if not marker:
        return []
    start = marker.end() - 1
    end = find_matching(block, start, "[", "]")
    editions_block = block[start + 1 : end]
    editions: list[tuple[str, str, bool]] = []
    cursor = 0
    while cursor < len(editions_block):
        object_start = editions_block.find("{", cursor)
        if object_start < 0:
            break
        object_end = find_matching(editions_block, object_start, "{", "}")
        edition_block = editions_block[object_start : object_end + 1]
        key_match = re.search(r"key:\s*'([^']+)'", edition_block)
        language_match = re.search(r"language:\s*'([^']+)'", edition_block)
        if key_match and language_match:
            editions.append((
                key_match.group(1),
                language_match.group(1),
                bool(re.search(r"hasAudio:\s*true", edition_block)),
            ))
        cursor = object_end + 1
    return editions


def load_chapter_numbers(book_id: str, edition: str) -> tuple[int, ...]:
    path = EDITIONS_DIR / f"{book_id}-{edition}.json"
    if not path.exists():
        return ()
    data = json.loads(path.read_text(encoding="utf-8"))
    return tuple(int(chapter["number"]) for chapter in data.get("chapters", []))


def parse_registry_targets() -> list[EditionTarget]:
    text = REGISTRY.read_text(encoding="utf-8")
    constants: dict[str, tuple[str, list[tuple[str, str, bool]]]] = {}
    for match in re.finditer(r"export const (\w+): Book = \{", text):
        name = match.group(1)
        start = match.end() - 1
        end = find_matching(text, start, "{", "}")
        block = text[start : end + 1]
        id_match = re.search(r"id:\s*'([^']+)'", block)
        if id_match:
            constants[name] = (id_match.group(1), parse_editions(block))

    books_match = re.search(r"export const BOOKS: Book\[\] = \[([^\]]+)\]", text, re.S)
    if not books_match:
        raise RuntimeError("Could not parse public BOOKS array")
    public_names = [value.strip() for value in books_match.group(1).split(",") if value.strip()]
    public_ids = {constants[name][0] for name in public_names if name in constants}

    targets: list[EditionTarget] = []
    for _name, (book_id, editions) in constants.items():
        scope = "public" if book_id in public_ids else "staged"
        for edition, language, has_audio in editions:
            targets.append(EditionTarget(
                book_id=book_id,
                edition=edition,
                language=language,
                scope=scope,
                has_audio=has_audio,
                chapters=load_chapter_numbers(book_id, edition),
            ))
    return targets


def select_targets(
    scope: str,
    languages: set[str],
    editions: set[str],
    include_unflagged: bool,
) -> list[EditionTarget]:
    targets = parse_registry_targets()
    return [
        target
        for target in targets
        if (scope == "all" or target.scope == scope)
        and (not languages or target.language in languages)
        and (not editions or target.edition in editions)
        and (include_unflagged or target.has_audio)
        and target.chapters
    ]


def artifact_url(book_id: str, edition: str, chapter: int, artifact: str) -> str:
    filename = "manifest.json" if artifact == "manifest" else "words.json"
    base = MANIFEST_API if artifact == "manifest" else FILE_API
    path = urllib.parse.quote(f"{book_id}/{edition}/ch{chapter}/{filename}", safe="")
    return f"{base}?path={path}"


def check_artifact(
    book_id: str,
    edition: str,
    chapter: int,
    artifact: str,
) -> tuple[str, str, int, str, bool, str]:
    request = urllib.request.Request(
        artifact_url(book_id, edition, chapter, artifact),
        method="HEAD",
        headers=UA,
    )
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            return book_id, edition, chapter, artifact, response.status == 200, ""
    except urllib.error.HTTPError as exc:
        if exc.code in (403, 404):
            return book_id, edition, chapter, artifact, False, ""
        return book_id, edition, chapter, artifact, False, f"HTTP {exc.code}"
    except Exception as exc:
        return book_id, edition, chapter, artifact, False, f"{type(exc).__name__}: {str(exc)[:80]}"


def audit(
    targets: list[EditionTarget],
    workers: int,
    checker: Callable[[str, str, int, str], tuple[str, str, int, str, bool, str]] = check_artifact,
) -> list[EditionAudit]:
    manifest_tasks = [
        (target.book_id, target.edition, chapter, "manifest")
        for target in targets
        for chapter in target.chapters
    ]
    manifest_ok: set[tuple[str, str, int]] = set()
    errors: dict[tuple[str, str], list[tuple[int, str, str]]] = {}

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for book_id, edition, chapter, artifact, ok, error in pool.map(
            lambda task: checker(*task), manifest_tasks,
        ):
            if ok:
                manifest_ok.add((book_id, edition, chapter))
            elif error:
                errors.setdefault((book_id, edition), []).append((chapter, artifact, error))

    sidecar_tasks = [(*key, "words") for key in sorted(manifest_ok)]
    sidecar_ok: set[tuple[str, str, int]] = set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for book_id, edition, chapter, artifact, ok, error in pool.map(
            lambda task: checker(*task), sidecar_tasks,
        ):
            if ok:
                sidecar_ok.add((book_id, edition, chapter))
            elif error:
                errors.setdefault((book_id, edition), []).append((chapter, artifact, error))

    results: list[EditionAudit] = []
    for target in targets:
        pair = (target.book_id, target.edition)
        audio_chapters = [
            chapter for chapter in target.chapters
            if (target.book_id, target.edition, chapter) in manifest_ok
        ]
        word_chapters = [
            chapter for chapter in audio_chapters
            if (target.book_id, target.edition, chapter) in sidecar_ok
        ]
        results.append(EditionAudit(
            book_id=target.book_id,
            edition=target.edition,
            language=target.language,
            scope=target.scope,
            chapters=len(target.chapters),
            audio_ok=len(audio_chapters),
            audio_missing=sorted(set(target.chapters) - set(audio_chapters)),
            sidecars_ok=len(word_chapters),
            sidecars_missing=sorted(set(audio_chapters) - set(word_chapters)),
            errors=sorted(errors.get(pair, [])),
        ))
    return results


def compact_ranges(values: Iterable[int]) -> str:
    ordered = sorted(set(values))
    if not ordered:
        return ""
    ranges: list[str] = []
    start = previous = ordered[0]
    for value in ordered[1:]:
        if value == previous + 1:
            previous = value
            continue
        ranges.append(str(start) if start == previous else f"{start}-{previous}")
        start = previous = value
    ranges.append(str(start) if start == previous else f"{start}-{previous}")
    return ", ".join(ranges)


def print_report(results: list[EditionAudit]) -> None:
    total_chapters = sum(result.chapters for result in results)
    total_audio = sum(result.audio_ok for result in results)
    total_sidecars = sum(result.sidecars_ok for result in results)
    total_errors = sum(len(result.errors) for result in results)
    jobs = [result for result in results if result.needs_sidecars]
    print(
        f"edition_targets={len(results)} chapters={total_chapters} "
        f"audio={total_audio} sidecars={total_sidecars} "
        f"sidecars_missing={total_audio - total_sidecars} errors={total_errors}",
    )
    print(f"runpod_edition_jobs={len(jobs)}")
    for result in results:
        if not result.needs_sidecars and not result.audio_missing and not result.errors:
            continue
        details: list[str] = []
        if result.sidecars_missing:
            details.append(
                f"words missing {len(result.sidecars_missing)}/{result.audio_ok}: "
                f"{compact_ranges(result.sidecars_missing)}",
            )
        if result.audio_missing:
            details.append(f"audio missing {len(result.audio_missing)}/{result.chapters}")
        if result.errors:
            details.append(f"errors {len(result.errors)}")
        print(f"{result.scope}\t{result.book_id}/{result.edition}\t" + "; ".join(details))


def runpod_targets(results: list[EditionAudit]) -> list[str]:
    return [
        f"{result.book_id}/{result.edition}"
        for result in results
        if result.needs_sidecars
    ]


def print_runpod_command(results: list[EditionAudit]) -> None:
    jobs = [result for result in results if result.needs_sidecars]
    if not jobs:
        print("echo 'No missing words.json sidecars found for audio present on R2.'")
        return
    print("cd /workspace/tinct/repo")
    model_groups = [
        ("small.en", [result for result in jobs if result.language == "en"]),
        ("small", [result for result in jobs if result.language != "en"]),
    ]
    for model, group in model_groups:
        if not group:
            continue
        print("python3 app/tts/generate-words-sidecar.py \\")
        for result in group:
            print(f"  --target {result.book_id}/{result.edition} \\")
        print(f"  --model {model} \\")
        print("  --upload")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scope", choices=["public", "staged", "all"], default="public")
    parser.add_argument("--languages", default="en,da", help="comma-separated languages")
    parser.add_argument("--editions", default="", help="optional comma-separated edition keys")
    parser.add_argument("--include-unflagged", action="store_true")
    parser.add_argument("--workers", type=int, default=32)
    parser.add_argument("--runpod-command", action="store_true", help="print only the resumable job")
    parser.add_argument("--json", type=Path, help="write machine-readable audit results")
    parser.add_argument("--require-complete", action="store_true", help="exit nonzero on missing sidecars/errors")
    args = parser.parse_args(argv)

    languages = {value.strip() for value in args.languages.split(",") if value.strip()}
    editions = {value.strip() for value in args.editions.split(",") if value.strip()}
    targets = select_targets(args.scope, languages, editions, args.include_unflagged)
    started = time.time()
    results = audit(targets, workers=max(1, args.workers))

    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(
            json.dumps([asdict(result) for result in results], indent=2) + "\n",
            encoding="utf-8",
        )

    if args.runpod_command:
        print_runpod_command(results)
    else:
        print_report(results)
        print(f"elapsed={time.time() - started:.1f}s")
        print()
        print("RunPod command:")
        print_runpod_command(results)

    incomplete = any(result.needs_sidecars or result.errors for result in results)
    return 1 if args.require_complete and incomplete else 0


if __name__ == "__main__":
    raise SystemExit(main())

