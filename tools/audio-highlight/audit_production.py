"""Inventory every English edition's audio and word-timing coverage on production.

Walks the published chapter manifests for each English edition in the book
registry and records, per chapter, whether a recording manifest exists and
whether a word-timing sidecar has been published alongside it.

This is a coverage census, not a quality judgement: a chapter counted as
covered here has a sidecar present, nothing more. Run verify_timings.py over
the covered set to find out whether those sidecars are actually correct.

Read-only, credential-free, and independent of any local machine.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import prodapi  # noqa: E402

REGISTRY = Path(__file__).resolve().parents[2] / "app/src/data/bookRegistry.ts"
# Stop probing a chapter range after this many consecutive missing manifests,
# so a gap in the middle of a book does not truncate the walk.
MISS_RUN_LIMIT = 3
MAX_CHAPTER = 1200


def read_registry(path: Path = REGISTRY) -> list[dict]:
    """Parse the published BOOKS list and their editions out of the registry."""
    source = path.read_text()
    listed = re.search(r"export const BOOKS[^=]*=\s*\[(.*?)\]", source, re.S)
    if not listed:
        raise SystemExit("bookRegistry.ts: no BOOKS array")
    members = re.findall(r"[A-Z][A-Z0-9_]+", listed.group(1))

    blocks = {}
    for name, body in re.findall(r"export const ([A-Z][A-Z0-9_]+)\s*:\s*Book\s*=\s*\{(.*?)\n\}", source, re.S):
        book_id = re.search(r"\n\s*id:\s*'([^']+)'", body)
        title = re.search(r"\n\s*title:\s*'((?:[^'\\]|\\.)*)'", body)
        editions = []
        block = re.search(r"editions:\s*\[(.*)\n\s*\]", body, re.S)
        if block:
            for entry in re.findall(r"\{(.*?)\}", block.group(1), re.S):
                key = re.search(r"key:\s*'([^']+)'", entry)
                language = re.search(r"language:\s*'([^']+)'", entry)
                if key:
                    editions.append({
                        "key": key.group(1),
                        "language": language.group(1) if language else None,
                        "hasAudio": bool(re.search(r"hasAudio:\s*true", entry)),
                    })
        if book_id:
            blocks[name] = {"bookId": book_id.group(1),
                            "title": title.group(1) if title else book_id.group(1),
                            "editions": editions}
    return [blocks[m] for m in members if m in blocks]


def walk_edition(book_id: str, edition: str) -> list[dict]:
    chapters: list[dict] = []
    misses = 0
    for chapter in range(1, MAX_CHAPTER + 1):
        status, manifest = prodapi.chapter_manifest(book_id, edition, chapter)
        if status != 200 or not manifest:
            misses += 1
            if misses >= MISS_RUN_LIMIT:
                break
            chapters.append({"chapter": chapter, "manifest": status})
            continue
        misses = 0
        entries = manifest.get("paragraphs") or []
        spoken = [e for e in entries if isinstance(e.get("paragraph"), int) and e["paragraph"] >= 0]
        words_status, words_bytes = prodapi.audio_object_size(f"{book_id}/{edition}/ch{chapter}/words.json")
        chapters.append({
            "chapter": chapter,
            "manifest": 200,
            "spokenParagraphs": len(spoken),
            "titleTrack": len(entries) - len(spoken),
            "durationSeconds": round(sum(e.get("duration") or 0 for e in entries), 2),
            "words": words_status,
            "wordsBytes": words_bytes,
        })
    # trim the trailing probe misses that ended the walk
    while chapters and chapters[-1].get("manifest") != 200:
        chapters.pop()
    return chapters


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--out", required=True)
    parser.add_argument("--language", default="en")
    parser.add_argument("--workers", type=int, default=12)
    parser.add_argument("--targets-out", help="write the missing-timing chapter list here")
    parser.add_argument("--covered-out", help="write the published-sidecar chapter list here")
    args = parser.parse_args()

    books = read_registry()
    editions = [
        {"bookId": b["bookId"], "title": b["title"], "edition": e["key"], "hasAudioFlag": e["hasAudio"]}
        for b in books for e in b["editions"] if e["language"] == args.language
    ]

    done = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(walk_edition, e["bookId"], e["edition"]): e for e in editions}
        for future in concurrent.futures.as_completed(futures):
            futures[future]["chapters"] = future.result()
            done += 1
            if done % 10 == 0:
                print(f"  {done}/{len(editions)} editions", file=sys.stderr, flush=True)

    editions.sort(key=lambda e: (e["bookId"], e["edition"]))
    missing, covered = [], []
    covered_count = audio_seconds = missing_seconds = 0
    chapter_count = 0
    for edition in editions:
        for chapter in edition["chapters"]:
            if chapter.get("manifest") != 200:
                continue
            chapter_count += 1
            audio_seconds += chapter.get("durationSeconds") or 0
            row = {"bookId": edition["bookId"], "edition": edition["edition"], "chapter": chapter["chapter"]}
            if chapter.get("words") in (200, 206):
                covered_count += 1
                covered.append(row)
            else:
                missing_seconds += chapter.get("durationSeconds") or 0
                missing.append({**row, "durationSeconds": chapter.get("durationSeconds"),
                                "spokenParagraphs": chapter.get("spokenParagraphs")})

    summary = {
        "language": args.language,
        "books": len({e["bookId"] for e in editions}),
        "editions": len(editions),
        "editionsWithAudioFlag": sum(1 for e in editions if e["hasAudioFlag"]),
        "editionsWithAnyAudio": sum(1 for e in editions if e["chapters"]),
        "chaptersWithAudio": chapter_count,
        "chaptersWithTimings": covered_count,
        "chaptersMissingTimings": chapter_count - covered_count,
        "audioHoursTotal": round(audio_seconds / 3600, 2),
        "audioHoursMissingTimings": round(missing_seconds / 3600, 2),
    }
    Path(args.out).write_text(json.dumps({"summary": summary, "editions": editions}, indent=1))
    if args.targets_out:
        Path(args.targets_out).write_text(json.dumps(missing, indent=1))
    if args.covered_out:
        Path(args.covered_out).write_text(json.dumps(covered, indent=1))

    for key, value in summary.items():
        print(f"{key:26} {value}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
