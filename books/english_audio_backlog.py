#!/usr/bin/env python3
"""Audit and generate missing local English audio for public Tinct books.

Offline pipeline:
1. Read public books and English editions from app/src/data/bookRegistry.ts.
2. Compare edition paragraph counts with local files under app/tts/audio.
3. Generate missing WAVs with Kokoro.
4. Convert WAVs to MP3 and write chapter manifests.
5. Generate local title.mp3 files and update manifests.

The script does not upload to R2 and does not require network access once Kokoro's
model files are already cached locally.
"""

from __future__ import annotations

import argparse
import json
import os
import platform
import re
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path


BOOKS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BOOKS_DIR.parent
APP_DIR = PROJECT_ROOT / "app"
REGISTRY = APP_DIR / "src" / "data" / "bookRegistry.ts"
EDITIONS_DIR = APP_DIR / "public" / "data" / "editions"
TTS_DIR = APP_DIR / "tts"
AUDIO_DIR = TTS_DIR / "audio"
LOG_DIR = BOOKS_DIR / "logs"


@dataclass
class EditionTarget:
    book_id: str
    edition_key: str
    title: str
    expected_chapters: int
    expected_paragraphs: int
    existing_mp3: int
    existing_wav: int
    manifests: int
    titles: int
    missing_chapters: list[int]
    has_audio_flag: bool

    @property
    def complete(self) -> bool:
        return (
            not self.missing_chapters
            and self.manifests >= self.expected_chapters
            and self.titles >= self.expected_chapters
        )


def find_matching_brace(text: str, open_index: int) -> int:
    depth = 0
    in_string: str | None = None
    escape = False
    for i in range(open_index, len(text)):
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
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i
    raise ValueError("unmatched brace")


def find_matching_bracket(text: str, open_index: int) -> int:
    depth = 0
    in_string: str | None = None
    escape = False
    for i in range(open_index, len(text)):
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
        elif ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                return i
    raise ValueError("unmatched bracket")


def parse_edition_keys(block: str) -> list[tuple[str, bool]]:
    marker = re.search(r"editions:\s*\[", block)
    if not marker:
        return []
    start = marker.end() - 1
    end = find_matching_bracket(block, start)
    editions_block = block[start + 1 : end]

    keys: list[tuple[str, bool]] = []
    cursor = 0
    while cursor < len(editions_block):
        obj_start = editions_block.find("{", cursor)
        if obj_start == -1:
            break
        obj_end = find_matching_brace(editions_block, obj_start)
        edition = editions_block[obj_start : obj_end + 1]
        key_match = re.search(r"key:\s*'([^']+)'", edition)
        language_match = re.search(r"language:\s*'([^']+)'", edition)
        if key_match and language_match and language_match.group(1) == "en":
            keys.append((key_match.group(1), bool(re.search(r"hasAudio:\s*true", edition))))
        cursor = obj_end + 1
    return keys


def parse_registry() -> dict[str, list[tuple[str, bool]]]:
    text = REGISTRY.read_text()
    consts: dict[str, tuple[str, list[tuple[str, bool]]]] = {}

    for match in re.finditer(r"export const (\w+): Book = \{", text):
        const_name = match.group(1)
        start = match.end() - 1
        end = find_matching_brace(text, start)
        block = text[start : end + 1]

        id_match = re.search(r"id:\s*'([^']+)'", block)
        if not id_match:
            continue
        book_id = id_match.group(1)

        edition_keys = parse_edition_keys(block)
        consts[const_name] = (book_id, edition_keys)

    books_match = re.search(r"export const BOOKS: Book\[\] = \[([^\]]+)\]", text, re.S)
    if not books_match:
        raise RuntimeError("Could not parse public BOOKS array from bookRegistry.ts")

    result: dict[str, list[str]] = {}
    for raw_name in books_match.group(1).split(","):
        const_name = raw_name.strip()
        if not const_name or const_name not in consts:
            continue
        book_id, edition_keys = consts[const_name]
        result[book_id] = edition_keys
    return result


def load_edition(book_id: str, edition_key: str) -> tuple[str, list[dict]]:
    path = EDITIONS_DIR / f"{book_id}-{edition_key}.json"
    if not path.exists():
        return f"MISSING: {path}", []
    data = json.loads(path.read_text())
    return "", data.get("chapters", [])


def chapter_audio_complete(chapter_dir: Path, expected_paragraphs: int) -> bool:
    if expected_paragraphs == 0:
        return True
    mp3s = [p for p in chapter_dir.glob("p*.mp3") if p.stat().st_size > 0]
    return len(mp3s) >= expected_paragraphs


def audit_targets(include_complete: bool = False, has_audio_only: bool = False) -> list[EditionTarget]:
    registry = parse_registry()
    targets: list[EditionTarget] = []

    for book_id, edition_keys in registry.items():
        for edition_key, has_audio_flag in edition_keys:
            if has_audio_only and not has_audio_flag:
                continue
            error, chapters = load_edition(book_id, edition_key)
            if error:
                print(error)
                continue

            audio_root = AUDIO_DIR / book_id / edition_key
            missing_chapters: list[int] = []
            expected_paragraphs = 0
            for chapter in chapters:
                number = int(chapter["number"])
                paragraphs = chapter.get("paragraphs", [])
                expected_paragraphs += len(paragraphs)
                if not chapter_audio_complete(audio_root / f"ch{number}", len(paragraphs)):
                    missing_chapters.append(number)

            target = EditionTarget(
                book_id=book_id,
                edition_key=edition_key,
                title=f"{book_id}/{edition_key}",
                expected_chapters=len(chapters),
                expected_paragraphs=expected_paragraphs,
                existing_mp3=sum(1 for p in audio_root.glob("ch*/p*.mp3") if p.stat().st_size > 0)
                if audio_root.exists()
                else 0,
                existing_wav=sum(1 for p in audio_root.glob("ch*/p*.wav") if p.stat().st_size > 0)
                if audio_root.exists()
                else 0,
                manifests=sum(1 for _ in audio_root.glob("ch*/manifest.json")) if audio_root.exists() else 0,
                titles=sum(1 for p in audio_root.glob("ch*/title.mp3") if p.stat().st_size > 0)
                if audio_root.exists()
                else 0,
                missing_chapters=missing_chapters,
                has_audio_flag=has_audio_flag,
            )
            if include_complete or not target.complete:
                targets.append(target)

    return targets


def print_audit(targets: list[EditionTarget]) -> None:
    if not targets:
        print("All public English editions have complete local MP3s, manifests, and title audio.")
        return

    print("| Book / edition | Flag | Ch | Para | MP3 | WAV | Manifests | Titles | Missing chapters |")
    print("|---|---|---:|---:|---:|---:|---:|---:|---|")
    for target in targets:
        missing = compact_ranges(target.missing_chapters) if target.missing_chapters else "manifest/title only"
        print(
            f"| {target.title} | {'hasAudio' if target.has_audio_flag else ''} | "
            f"{target.expected_chapters} | {target.expected_paragraphs} | "
            f"{target.existing_mp3} | {target.existing_wav} | {target.manifests} | "
            f"{target.titles} | {missing} |"
        )


def print_summary(targets: list[EditionTarget]) -> None:
    missing = [t for t in targets if not t.complete]
    flagged = [t for t in missing if t.has_audio_flag]
    unflagged = [t for t in missing if not t.has_audio_flag]
    missing_chapters = sum(len(t.missing_chapters) for t in missing)
    missing_paragraphs = 0
    for t in missing:
        error, chapters = load_edition(t.book_id, t.edition_key)
        if error:
            continue
        wanted = set(t.missing_chapters)
        missing_paragraphs += sum(len(ch.get("paragraphs", [])) for ch in chapters if int(ch["number"]) in wanted)

    print("Summary:")
    print(f"- Missing/incomplete English edition targets: {len(missing)}")
    print(f"- With `hasAudio: true` in registry: {len(flagged)}")
    print(f"- Not yet flagged as audio editions: {len(unflagged)}")
    print(f"- Missing chapter directories or MP3 coverage: {missing_chapters}")
    print(f"- Paragraph MP3s still to generate locally: about {missing_paragraphs}")


def print_runpod_command(targets: list[EditionTarget]) -> None:
    jobs = [(t.book_id, t.edition_key) for t in targets if not t.complete]
    if not jobs:
        print("No incomplete English audio targets.")
        return
    print("cd /workspace/tinct/scripts")
    print("python3 run-kokoro-cloud.py \\")
    for index, (book, edition) in enumerate(jobs):
        suffix = " \\" if index < len(jobs) - 1 else ""
        print(f"  {book} {edition}{suffix}")


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
        ranges.append(f"{start}" if start == prev else f"{start}-{prev}")
        start = prev = value
    ranges.append(f"{start}" if start == prev else f"{start}-{prev}")
    return ", ".join(ranges)


def require_tool(name: str) -> None:
    if shutil.which(name) is None:
        raise RuntimeError(f"Required tool not found on PATH: {name}")


def preflight() -> None:
    require_tool("ffmpeg")
    require_tool("ffprobe")
    for module in ("numpy", "soundfile", "kokoro"):
        subprocess.run(
            [sys.executable, "-c", f"import {module}"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def ensure_caffeinated(args: argparse.Namespace) -> None:
    if args.no_caffeinate or os.environ.get("TINCT_AUDIO_CAFFEINATED") == "1":
        return
    if platform.system() != "Darwin" or shutil.which("caffeinate") is None:
        return

    env = os.environ.copy()
    env["TINCT_AUDIO_CAFFEINATED"] = "1"
    cmd = ["caffeinate", "-dimsu", sys.executable, str(Path(__file__).resolve()), *sys.argv[1:]]
    print("Restarting under caffeinate: " + " ".join(cmd))
    os.execvpe("caffeinate", cmd, env)


def run_command(
    cmd: list[str],
    cwd: Path,
    log_file: Path,
    dry_run: bool,
    timeout: int | None = None,
    keep_going: bool = False,
) -> bool:
    print("$ " + " ".join(cmd))
    if dry_run:
        return True
    with log_file.open("a") as log:
        log.write("\n$ " + " ".join(cmd) + "\n")
        log.flush()
        try:
            subprocess.run(cmd, cwd=cwd, check=True, stdout=log, stderr=subprocess.STDOUT, timeout=timeout)
            return True
        except subprocess.TimeoutExpired:
            message = f"TIMEOUT after {timeout}s: {' '.join(cmd)}"
            print(message)
            log.write(message + "\n")
            if keep_going:
                return False
            raise
        except subprocess.CalledProcessError as exc:
            message = f"FAILED with exit {exc.returncode}: {' '.join(cmd)}"
            print(message)
            log.write(message + "\n")
            if keep_going:
                return False
            raise


def generate_target(target: EditionTarget, args: argparse.Namespace, log_file: Path) -> None:
    chapters = target.missing_chapters or list(range(1, target.expected_chapters + 1))
    print(f"\n=== {target.title} ===")
    print(f"Missing chapters: {compact_ranges(chapters) if chapters else 'none'}")

    for chapter in chapters:
        run_command(
            [
                sys.executable,
                "generate-audio-kokoro.py",
                target.book_id,
                target.edition_key,
                str(chapter),
                str(chapter),
            ],
            TTS_DIR,
            log_file,
            args.dry_run,
            timeout=args.chapter_timeout,
            keep_going=True,
        )

    run_command(
        [sys.executable, str(BOOKS_DIR / "english_audio_backlog.py"), "--convert-one", target.book_id, target.edition_key],
        BOOKS_DIR,
        log_file,
        args.dry_run,
    )

    run_command(
        [sys.executable, "generate-title-audio.py", target.book_id, target.edition_key],
        TTS_DIR,
        log_file,
        args.dry_run,
    )


def mp3_duration(mp3_path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "quiet",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(mp3_path),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 0.0


def convert_one(book_id: str, edition_key: str, delete_wav: bool = False) -> None:
    audio_root = AUDIO_DIR / book_id / edition_key
    if not audio_root.exists():
        raise RuntimeError(f"Audio root not found: {audio_root}")

    error, chapters = load_edition(book_id, edition_key)
    if error:
        raise RuntimeError(error)
    titles = {int(ch["number"]): ch.get("title", f"Chapter {ch['number']}") for ch in chapters}

    chapter_dirs = sorted(
        [p for p in audio_root.iterdir() if p.is_dir() and p.name.startswith("ch")],
        key=lambda p: int(p.name[2:]),
    )
    for chapter_dir in chapter_dirs:
        chapter_num = int(chapter_dir.name[2:])
        wavs = sorted(chapter_dir.glob("p*.wav"), key=lambda p: int(p.stem[1:]))
        mp3s = sorted(chapter_dir.glob("p*.mp3"), key=lambda p: int(p.stem[1:]))
        for wav in wavs:
            mp3 = wav.with_suffix(".mp3")
            if not mp3.exists() or mp3.stat().st_mtime < wav.stat().st_mtime:
                subprocess.run(
                    ["ffmpeg", "-y", "-i", str(wav), "-b:a", "128k", "-loglevel", "error", str(mp3)],
                    check=True,
                )
            if delete_wav and mp3.exists():
                wav.unlink()

        mp3s = sorted(chapter_dir.glob("p*.mp3"), key=lambda p: int(p.stem[1:]))
        paragraphs = []
        for mp3 in mp3s:
            para = int(mp3.stem[1:])
            paragraphs.append({"paragraph": para, "duration": round(mp3_duration(mp3), 3), "file": mp3.name})

        if paragraphs:
            manifest = {
                "chapter": chapter_num,
                "title": titles.get(chapter_num, f"Chapter {chapter_num}"),
                "paragraphs": sorted(paragraphs, key=lambda p: p["paragraph"]),
            }
            (chapter_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))
            print(f"  {book_id}/{edition_key}/ch{chapter_num}: {len(paragraphs)} MP3s")


def main() -> None:
    os.environ.setdefault("HF_HUB_OFFLINE", "1")
    os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run", action="store_true", help="generate missing audio; default is audit only")
    parser.add_argument("--dry-run", action="store_true", help="print commands without running them")
    parser.add_argument("--include-complete", action="store_true", help="show complete editions in the audit")
    parser.add_argument("--summary", action="store_true", help="show totals only")
    parser.add_argument("--runpod-command", action="store_true", help="print a pasteable run-kokoro-cloud.py job command")
    parser.add_argument("--has-audio-only", action="store_true", help="only include registry editions with hasAudio: true")
    parser.add_argument("--book", help="limit to one book id")
    parser.add_argument("--edition", help="limit to one edition key, e.g. modern-en")
    parser.add_argument("--limit", type=int, help="limit number of edition targets to generate")
    parser.add_argument("--no-caffeinate", action="store_true", help="do not relaunch through macOS caffeinate")
    parser.add_argument("--skip-preflight", action="store_true", help="skip dependency checks")
    parser.add_argument("--chapter-timeout", type=int, default=3600, help="seconds before skipping a stuck Kokoro chapter")
    parser.add_argument("--convert-one", nargs=2, metavar=("BOOK", "EDITION"), help=argparse.SUPPRESS)
    args = parser.parse_args()

    if args.convert_one:
        preflight()
        convert_one(args.convert_one[0], args.convert_one[1])
        return

    if args.run:
        ensure_caffeinated(args)
    if (args.run or args.convert_one) and not args.skip_preflight:
        preflight()

    targets = audit_targets(include_complete=args.include_complete, has_audio_only=args.has_audio_only)
    if args.book:
        targets = [t for t in targets if t.book_id == args.book]
    if args.edition:
        targets = [t for t in targets if t.edition_key == args.edition]

    if args.runpod_command:
        print_runpod_command(targets)
    elif args.summary:
        print_summary(targets)
    else:
        print_audit(targets)

    runnable = [t for t in targets if not t.complete]
    if args.limit is not None:
        runnable = runnable[: args.limit]

    if not args.run:
        print("\nAudit only. Add --run to generate missing local English audio.")
        return

    LOG_DIR.mkdir(exist_ok=True)
    log_file = LOG_DIR / f"english-audio-backlog-{time.strftime('%Y%m%d-%H%M%S')}.log"
    print(f"\nWriting generation log to {log_file}")
    for target in runnable:
        generate_target(target, args, log_file)

    print("\nRe-auditing after generation:")
    final_targets = audit_targets(include_complete=False, has_audio_only=args.has_audio_only)
    if args.book:
        final_targets = [t for t in final_targets if t.book_id == args.book]
    if args.edition:
        final_targets = [t for t in final_targets if t.edition_key == args.edition]
    if args.summary:
        print_summary(final_targets)
    else:
        print_audit(final_targets)


if __name__ == "__main__":
    main()
