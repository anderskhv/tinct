#!/usr/bin/env python3
"""Generate words.json sidecars from existing R2 paragraph MP3s via faster-whisper.

Aligns whisper word timestamps to edition paragraph tokens (same whitespace split
as the reader). Upload with --upload (Workers deploy token or R2 upload token).

Examples:
  # One chapter, local MP3s already on disk:
  python3 generate-words-sidecar.py bible kjv-en --chapter 768 \\
    --local-dir app/tts/audio/bible/kjv-en/ch768

  # Download MP3s from production, write sidecar locally:
  python3 generate-words-sidecar.py bible kjv-en --chapter 768 --out app/tts/audio/bible/kjv-en/ch768

  # Batch + upload to R2:
  python3 generate-words-sidecar.py bible kjv-en --start-ch 768 --end-ch 768 --upload

  # Skip chapters that already have words.json on R2:
  python3 generate-words-sidecar.py bible kjv-en --start-ch 1 --end-ch 50 --upload

  # One GPU/model load for many production editions (all chapters):
  python3 generate-words-sidecar.py \
    --target odyssey/original-en --target odyssey/modern-en \
    --target bible/web-en --upload

Env:
  CLOUDFLARE_API_TOKEN — wrangler r2 object put (RunPod R2 token or Workers token)
  CLOUDFLARE_ACCOUNT_ID — Cloudflare account that owns the tinct-audio bucket
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, List, Optional, Sequence, Tuple

from words_sidecar_lib import (
    AlignmentStats,
    align_tokens_with_stats,
    audio_file_url,
    build_sidecar,
    chapter_words_from_text,
    clean_text,
    HeardWord,
    load_chapter_text,
    manifest_url,
    validate_sidecar,
    write_json,
    REPO_ROOT,
)

R2_BUCKET = "tinct-audio"
DEFAULT_EN_MODEL = "small.en"
DEFAULT_MULTILINGUAL_MODEL = "small"
DEFAULT_DEVICE = "cuda"
DEFAULT_COMPUTE = "float16"


def ts() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S")


def log(msg: str) -> None:
    print(f"[{ts()}] {msg}", flush=True)


def resolve_wrangler_cmd() -> Optional[List[str]]:
    env_bin = __import__("os").environ.get("WRANGLER_BIN")
    candidates = [env_bin] if env_bin else []
    candidates += ["wrangler", "/usr/local/bin/wrangler", "/usr/local/node/bin/npx"]
    for candidate in candidates:
        if not candidate:
            continue
        if candidate == "npx" or "/" not in candidate:
            resolved = shutil.which(candidate)
            if resolved:
                return [resolved, "-y", "wrangler"] if candidate == "npx" else [resolved]
        elif Path(candidate).exists():
            return [candidate]
    npx = shutil.which("npx")
    return [npx, "-y", "wrangler"] if npx else None


def http_head_ok(url: str, timeout: float = 12.0) -> bool:
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "TinctWordsSidecar/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return res.status == 200
    except Exception:
        return False


def http_get_bytes(url: str, timeout: float = 120.0) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "TinctWordsSidecar/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def fetch_manifest(book: str, edition: str, chapter: int) -> dict[str, Any]:
    raw = http_get_bytes(manifest_url(book, edition, chapter))
    return json.loads(raw.decode("utf-8"))


def words_on_r2(book: str, edition: str, chapter: int) -> bool:
    url = audio_file_url(book, edition, chapter, "words.json")
    return http_head_ok(url)


def sidecar_on_r2_is_valid(book: str, edition: str, chapter_number: int) -> bool:
    """Keep an existing sidecar only when it still matches current text/audio."""
    try:
        chapter = load_chapter_text(book, edition, chapter_number)
        expected_tokens = [
            chapter_words_from_text(clean_text(text.replace("\n", " ")))
            for text in chapter.get("paragraphs", [])
        ]
        manifest = fetch_manifest(book, edition, chapter_number)
        manifest_by_index = {
            entry["paragraph"]: entry
            for entry in manifest.get("paragraphs", [])
            if isinstance(entry, dict) and isinstance(entry.get("paragraph"), int)
            and entry["paragraph"] >= 0
        }
        sidecar = json.loads(http_get_bytes(
            audio_file_url(book, edition, chapter_number, "words.json"),
        ).decode("utf-8"))
        valid, _errors = validate_sidecar(sidecar, expected_tokens, manifest_by_index)
        return valid and (
            sidecar.get("bookId") == book
            and sidecar.get("editionKey") == edition
            and sidecar.get("chapter") == chapter_number
        )
    except (OSError, ValueError, KeyError, TypeError, urllib.error.URLError):
        return False


def manifest_on_r2(book: str, edition: str, chapter: int) -> bool:
    return http_head_ok(manifest_url(book, edition, chapter))


def r2_put(local: Path, key: str, wrangler_cmd: List[str]) -> Tuple[bool, str]:
    for attempt in range(1, 6):
        try:
            r = subprocess.run(
                [
                    *wrangler_cmd, "r2", "object", "put", f"{R2_BUCKET}/{key}",
                    "--file", str(local),
                    "--content-type", "application/json",
                    "--remote",
                ],
                capture_output=True,
                text=True,
                cwd=str(REPO_ROOT / "app"),
                timeout=90,
            )
            if r.returncode == 0:
                return True, ""
            err = (r.stderr or r.stdout or "")[:300]
            transient = any(x in err for x in ("503", "500", "502", "504", "timeout", "ECONNRESET"))
        except subprocess.TimeoutExpired:
            err = "timeout"
            transient = True
        if not transient or attempt == 5:
            return False, err
        time.sleep(2 ** attempt)
    return False, "max attempts"


def load_whisper_model(model_size: str, device: str, compute_type: str):
    from faster_whisper import WhisperModel  # noqa: PLC0415

    return WhisperModel(model_size, device=device, compute_type=compute_type)


def transcribe_words(model, audio_path: Path, language: str) -> List[HeardWord]:
    segments, _ = model.transcribe(
        str(audio_path),
        word_timestamps=True,
        vad_filter=True,
        language=language,
    )
    heard: List[HeardWord] = []
    for segment in segments:
        if not segment.words:
            continue
        for word in segment.words:
            if word.start is None or word.end is None:
                continue
            text = (word.word or "").strip()
            if not text:
                continue
            heard.append(HeardWord(raw=text, start=float(word.start), end=float(word.end)))
    return heard


def process_paragraph(
    model,
    mp3_path: Path,
    paragraph_text: str,
    language: str,
) -> Tuple[List[dict[str, Any]], AlignmentStats]:
    expected = chapter_words_from_text(clean_text(paragraph_text.replace("\n", " ")))
    heard = transcribe_words(model, mp3_path, language)
    return align_tokens_with_stats(expected, heard)


def ensure_mp3(
    book: str,
    edition: str,
    chapter: int,
    filename: str,
    local_dir: Path,
) -> Tuple[Path, bool]:
    local_dir.mkdir(parents=True, exist_ok=True)
    dest = local_dir / filename
    if dest.exists() and dest.stat().st_size > 0:
        return dest, False
    url = audio_file_url(book, edition, chapter, filename)
    log(f"  Download {filename}")
    data = http_get_bytes(url)
    dest.write_bytes(data)
    return dest, True


def generate_chapter(
    book: str,
    edition: str,
    chapter_number: int,
    out_dir: Path,
    model,
    model_name: str,
    language: str,
    min_alignment: float,
    local_mp3_dir: Optional[Path] = None,
    skip_existing: bool = True,
    keep_downloads: bool = False,
) -> Tuple[bool, str]:
    chapter = load_chapter_text(book, edition, chapter_number)
    paragraphs = chapter.get("paragraphs", [])
    title = chapter.get("title", f"Chapter {chapter_number}")
    expected_tokens = [
        chapter_words_from_text(clean_text(text.replace("\n", " ")))
        for text in paragraphs
    ]
    manifest = fetch_manifest(book, edition, chapter_number)
    manifest_by_index = {
        entry["paragraph"]: entry
        for entry in manifest.get("paragraphs", [])
        if isinstance(entry, dict) and isinstance(entry.get("paragraph"), int)
        and entry["paragraph"] >= 0
    }

    existing_path = out_dir / "words.json"
    if skip_existing and existing_path.exists():
        try:
            existing = json.loads(existing_path.read_text(encoding="utf-8"))
            valid, _errors = validate_sidecar(existing, expected_tokens, manifest_by_index)
            paragraph_quality = [
                entry.get("alignment", {}).get("matchRatio")
                for entry in existing.get("paragraphs", [])
                if isinstance(entry, dict)
            ]
            quality_ok = bool(paragraph_quality) and all(
                isinstance(ratio, (int, float)) and ratio >= min_alignment
                for ratio in paragraph_quality
            )
            identity_ok = (
                existing.get("bookId") == book
                and existing.get("editionKey") == edition
                and existing.get("chapter") == chapter_number
            )
            if valid and quality_ok and identity_ok:
                return True, "validated local words.json exists"
            log(f"  Ignore stale or unverified local {existing_path}")
        except (OSError, ValueError, TypeError):
            log(f"  Ignore unreadable local {existing_path}")

    mp3_dir = local_mp3_dir or out_dir
    results: List[Tuple[int, str, List[dict[str, Any]]]] = []
    alignments: dict[int, AlignmentStats] = {}
    low_alignment: List[str] = []

    for pindex, para_text in enumerate(paragraphs):
        entry = manifest_by_index.get(pindex)
        if not entry or pindex < 0:
            continue
        filename = entry.get("file") or f"p{pindex}.mp3"
        if pindex < 0:
            continue
        mp3_path = mp3_dir / filename
        downloaded = False
        if not mp3_path.exists():
            mp3_path, downloaded = ensure_mp3(
                book,
                edition,
                chapter_number,
                filename,
                mp3_dir,
            )
        if not mp3_path.exists():
            return False, f"missing {mp3_path}"

        try:
            words, stats = process_paragraph(model, mp3_path, para_text, language)
        finally:
            if downloaded and not keep_downloads:
                mp3_path.unlink(missing_ok=True)
        alignments[pindex] = stats
        if stats.match_ratio < min_alignment:
            low_alignment.append(
                f"p{pindex} {stats.match_ratio:.0%} ({stats.matched_words}/{stats.expected_words})",
            )
        results.append((pindex, para_text, words))

    if low_alignment:
        return False, "low observed alignment: " + ", ".join(low_alignment[:8])

    sidecar = build_sidecar(book, edition, chapter_number, title, results)
    total_expected = sum(stats.expected_words for stats in alignments.values())
    total_heard = sum(stats.heard_words for stats in alignments.values())
    total_matched = sum(stats.matched_words for stats in alignments.values())
    sidecar["language"] = language
    sidecar["model"] = model_name
    sidecar["alignment"] = {
        "expectedWords": total_expected,
        "heardWords": total_heard,
        "matchedWords": total_matched,
        "matchRatio": round(total_matched / max(1, total_expected), 4),
        "minimumParagraphRatio": min_alignment,
    }
    for entry in sidecar["paragraphs"]:
        stats = alignments.get(entry["paragraph"])
        if not stats:
            continue
        entry["alignment"] = {
            "expectedWords": stats.expected_words,
            "heardWords": stats.heard_words,
            "matchedWords": stats.matched_words,
            "matchRatio": round(stats.match_ratio, 4),
        }
    ok, errors = validate_sidecar(sidecar, expected_tokens, manifest_by_index)
    if not ok:
        return False, "; ".join(errors[:5])

    write_json(out_dir / "words.json", sidecar)
    ratio = total_matched / max(1, total_expected)
    return True, f"{len(results)} paragraphs, observed alignment {ratio:.1%}"


def target_language(edition: str) -> str:
    suffix = edition.rsplit("-", 1)[-1].lower()
    return {"en": "en", "da": "da"}.get(suffix, suffix)


def parse_target(value: str) -> Tuple[str, str]:
    if "/" not in value:
        raise argparse.ArgumentTypeError("target must be BOOK/EDITION")
    book, edition = value.split("/", 1)
    if not book or not edition or "/" in edition:
        raise argparse.ArgumentTypeError("target must be BOOK/EDITION")
    return book, edition


def resolve_targets(args: argparse.Namespace) -> List[Tuple[str, str]]:
    targets = list(args.target or [])
    if args.book or args.edition:
        if not args.book or not args.edition:
            raise SystemExit("Provide both positional BOOK and EDITION")
        targets.insert(0, (args.book, args.edition))
    targets = list(dict.fromkeys(targets))
    if not targets:
        raise SystemExit("Provide BOOK EDITION or one or more --target BOOK/EDITION")
    if (args.out or args.local_dir) and len(targets) != 1:
        raise SystemExit("--out and --local-dir can only be used with one target")
    return targets


def edition_chapter_numbers(book: str, edition: str) -> List[int]:
    full_path = REPO_ROOT / "app/public/data/editions" / f"{book}-{edition}.json"
    if full_path.exists():
        data = json.loads(full_path.read_text(encoding="utf-8"))
        return [int(chapter["number"]) for chapter in data.get("chapters", [])]
    manifest_path = (
        REPO_ROOT
        / "app/public/data/editions-chapters"
        / f"{book}-{edition}"
        / "manifest.json"
    )
    if manifest_path.exists():
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        return [int(chapter["number"]) for chapter in data.get("chapters", [])]
    raise FileNotFoundError(f"No edition data for {book}/{edition}")


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate words.json sidecars from MP3s")
    parser.add_argument("book", nargs="?", help="book id, e.g. bible")
    parser.add_argument("edition", nargs="?", help="edition key, e.g. kjv-en")
    parser.add_argument(
        "--target",
        action="append",
        type=parse_target,
        help="repeatable BOOK/EDITION target; loads Whisper only once",
    )
    parser.add_argument("--chapter", type=int, help="single chapter number")
    parser.add_argument("--start-ch", type=int, help="batch start chapter (inclusive)")
    parser.add_argument("--end-ch", type=int, help="batch end chapter (inclusive)")
    parser.add_argument("--out", type=Path, help="output base dir (default app/tts/audio/{book}/{edition})")
    parser.add_argument("--local-dir", type=Path, help="read MP3s from this chapter dir")
    parser.add_argument("--upload", action="store_true", help="upload words.json to R2 after generation")
    parser.add_argument("--force", action="store_true", help="regenerate even if words.json exists on R2")
    parser.add_argument(
        "--keep-local",
        action="store_true",
        help="keep MP3 downloads and uploaded words.json files (debugging only)",
    )
    parser.add_argument(
        "--model",
        help="faster-whisper model (default small.en for English-only, small otherwise)",
    )
    parser.add_argument(
        "--min-alignment",
        type=float,
        default=0.85,
        help="minimum observed Whisper/edition token match per paragraph before upload",
    )
    parser.add_argument("--device", default=DEFAULT_DEVICE)
    parser.add_argument("--compute-type", default=DEFAULT_COMPUTE)
    return parser.parse_args(argv)


def chapter_range(args: argparse.Namespace, book: str, edition: str) -> List[int]:
    if args.chapter is not None:
        return [args.chapter]
    chapters = edition_chapter_numbers(book, edition)
    if args.start_ch is not None:
        chapters = [chapter for chapter in chapters if chapter >= args.start_ch]
    if args.end_ch is not None:
        chapters = [chapter for chapter in chapters if chapter <= args.end_ch]
    return chapters


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    if not 0 <= args.min_alignment <= 1:
        raise SystemExit("--min-alignment must be between 0 and 1")
    targets = resolve_targets(args)
    if args.upload and not __import__("os").environ.get("CLOUDFLARE_API_TOKEN"):
        log("ERROR: CLOUDFLARE_API_TOKEN is required for --upload")
        return 1
    wrangler_cmd = resolve_wrangler_cmd() if args.upload else None
    if args.upload and not wrangler_cmd:
        log("ERROR: wrangler not found; cannot --upload")
        return 1

    languages = {target_language(edition) for _book, edition in targets}
    model_name = args.model or (
        DEFAULT_EN_MODEL if languages == {"en"} else DEFAULT_MULTILINGUAL_MODEL
    )

    log(f"Targets: {len(targets)} edition(s); languages={','.join(sorted(languages))}")
    log(f"Loading whisper model {model_name} ({args.device}/{args.compute_type})")
    model = load_whisper_model(model_name, args.device, args.compute_type)

    ok_count, fail_count, skip_count = 0, 0, 0

    for book, edition in targets:
        language = target_language(edition)
        chapters = chapter_range(args, book, edition)
        audio_base = args.out or (REPO_ROOT / "app/tts/audio" / book / edition)
        log(f"═══ {book}/{edition}: {len(chapters)} chapters, language={language} ═══")

        for ch in chapters:
            out_dir = audio_base / f"ch{ch}"
            if args.local_dir and len(chapters) == 1:
                mp3_dir = args.local_dir
            else:
                mp3_dir = out_dir

            if not manifest_on_r2(book, edition, ch) and not (mp3_dir / "manifest.json").exists():
                log(f"{book}/{edition} ch{ch}: skip (audio manifest missing)")
                skip_count += 1
                continue
            if not args.force and words_on_r2(book, edition, ch):
                if sidecar_on_r2_is_valid(book, edition, ch):
                    log(f"{book}/{edition} ch{ch}: skip (validated words.json already on R2)")
                    skip_count += 1
                    continue
                log(f"{book}/{edition} ch{ch}: existing words.json failed validation; regenerating")

            log(f"{book}/{edition} ch{ch}: generating words.json")
            try:
                success, detail = generate_chapter(
                    book,
                    edition,
                    ch,
                    out_dir,
                    model,
                    model_name,
                    language,
                    args.min_alignment,
                    local_mp3_dir=mp3_dir if mp3_dir.exists() else None,
                    skip_existing=not args.force,
                    keep_downloads=(
                        args.keep_local
                        or args.out is not None
                        or args.local_dir is not None
                    ),
                )
            except Exception as exc:
                log(f"{book}/{edition} ch{ch}: FAIL {exc}")
                fail_count += 1
                continue

            if not success:
                log(f"{book}/{edition} ch{ch}: FAIL {detail}")
                fail_count += 1
                continue

            log(f"{book}/{edition} ch{ch}: OK {detail}")

            if args.upload and wrangler_cmd:
                key = f"{book}/{edition}/ch{ch}/words.json"
                success, err = r2_put(out_dir / "words.json", key, wrangler_cmd)
                if success:
                    log(f"{book}/{edition} ch{ch}: uploaded {key}")
                    ok_count += 1
                    if not args.keep_local and args.out is None:
                        (out_dir / "words.json").unlink(missing_ok=True)
                else:
                    log(f"{book}/{edition} ch{ch}: upload FAIL {err}")
                    fail_count += 1
            else:
                ok_count += 1

    log(f"Done: ok={ok_count} fail={fail_count} skip={skip_count}")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
