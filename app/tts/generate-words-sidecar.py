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

Env:
  CLOUDFLARE_API_TOKEN — wrangler r2 object put (RunPod R2 token or Workers token)
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
    AUDIO_API_FILE,
    align_tokens,
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
DEFAULT_MODEL = "small.en"
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


def transcribe_words(model, audio_path: Path) -> List[HeardWord]:
    segments, _ = model.transcribe(
        str(audio_path),
        word_timestamps=True,
        vad_filter=True,
        language="en",
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
) -> Tuple[List[dict[str, Any]], float]:
    expected = chapter_words_from_text(clean_text(paragraph_text.replace("\n", " ")))
    heard = transcribe_words(model, mp3_path)
    words = align_tokens(expected, heard)
    coverage = len(words) / max(1, len(expected))
    return words, coverage


def ensure_mp3(
    book: str,
    edition: str,
    chapter: int,
    filename: str,
    local_dir: Path,
) -> Path:
    dest = local_dir / filename
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    url = audio_file_url(book, edition, chapter, filename)
    log(f"  Download {filename}")
    data = http_get_bytes(url)
    dest.write_bytes(data)
    return dest


def generate_chapter(
    book: str,
    edition: str,
    chapter_number: int,
    out_dir: Path,
    model,
    local_mp3_dir: Optional[Path] = None,
    skip_existing: bool = True,
) -> Tuple[bool, str]:
    if skip_existing and (out_dir / "words.json").exists():
        return True, "local words.json exists"

    chapter = load_chapter_text(book, edition, chapter_number)
    paragraphs = chapter.get("paragraphs", [])
    title = chapter.get("title", f"Chapter {chapter_number}")

    manifest = fetch_manifest(book, edition, chapter_number)
    manifest_by_index = {
        entry["paragraph"]: entry
        for entry in manifest.get("paragraphs", [])
        if isinstance(entry.get("paragraph"), int)
    }

    mp3_dir = local_mp3_dir or out_dir
    results: List[Tuple[int, str, List[dict[str, Any]]]] = []

    for pindex, para_text in enumerate(paragraphs):
        entry = manifest_by_index.get(pindex)
        if not entry or pindex < 0:
            continue
        filename = entry.get("file") or f"p{pindex}.mp3"
        if pindex < 0:
            continue
        mp3_path = mp3_dir / filename
        if not mp3_path.exists():
            ensure_mp3(book, edition, chapter_number, filename, mp3_dir)
        if not mp3_path.exists():
            return False, f"missing {mp3_path}"

        words, coverage = process_paragraph(model, mp3_path, para_text)
        if coverage < 0.85:
            log(f"  WARN ch{chapter_number} p{pindex}: alignment coverage {coverage:.0%}")
        results.append((pindex, para_text, words))

    sidecar = build_sidecar(book, edition, chapter_number, title, results)
    expected_tokens = [
        chapter_words_from_text(clean_text(t.replace("\n", " ")))
        for t in paragraphs
    ]
    ok, errors = validate_sidecar(sidecar, expected_tokens)
    if not ok:
        return False, "; ".join(errors[:5])

    write_json(out_dir / "words.json", sidecar)
    return True, f"{len(results)} paragraphs"


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate words.json sidecars from MP3s")
    parser.add_argument("book", help="book id, e.g. bible")
    parser.add_argument("edition", help="edition key, e.g. kjv-en")
    parser.add_argument("--chapter", type=int, help="single chapter number")
    parser.add_argument("--start-ch", type=int, help="batch start chapter (inclusive)")
    parser.add_argument("--end-ch", type=int, help="batch end chapter (inclusive)")
    parser.add_argument("--out", type=Path, help="output base dir (default app/tts/audio/{book}/{edition})")
    parser.add_argument("--local-dir", type=Path, help="read MP3s from this chapter dir")
    parser.add_argument("--upload", action="store_true", help="upload words.json to R2 after generation")
    parser.add_argument("--force", action="store_true", help="regenerate even if words.json exists on R2")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--device", default=DEFAULT_DEVICE)
    parser.add_argument("--compute-type", default=DEFAULT_COMPUTE)
    return parser.parse_args(argv)


def chapter_range(args: argparse.Namespace) -> List[int]:
    if args.chapter is not None:
        return [args.chapter]
    if args.start_ch is not None and args.end_ch is not None:
        return list(range(args.start_ch, args.end_ch + 1))
    raise SystemExit("Specify --chapter or --start-ch and --end-ch")


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    chapters = chapter_range(args)
    audio_base = args.out or (REPO_ROOT / "app/tts/audio" / args.book / args.edition)

    log(f"Loading whisper model {args.model} ({args.device}/{args.compute_type})")
    model = load_whisper_model(args.model, args.device, args.compute_type)

    wrangler_cmd = resolve_wrangler_cmd() if args.upload else None
    if args.upload and not wrangler_cmd:
        log("ERROR: wrangler not found; cannot --upload")
        return 1

    ok_count, fail_count, skip_count = 0, 0, 0

    for ch in chapters:
        out_dir = audio_base / f"ch{ch}"
        if args.local_dir and len(chapters) == 1:
            mp3_dir = args.local_dir
        else:
            mp3_dir = out_dir

        if not args.force and words_on_r2(args.book, args.edition, ch):
            log(f"ch{ch}: skip (words.json already on R2)")
            skip_count += 1
            continue

        log(f"ch{ch}: generating words.json")
        try:
            success, detail = generate_chapter(
                args.book,
                args.edition,
                ch,
                out_dir,
                model,
                local_mp3_dir=mp3_dir if mp3_dir.exists() else None,
                skip_existing=not args.force,
            )
        except Exception as exc:
            log(f"ch{ch}: FAIL {exc}")
            fail_count += 1
            continue

        if not success:
            log(f"ch{ch}: FAIL {detail}")
            fail_count += 1
            continue

        log(f"ch{ch}: OK {detail}")

        if args.upload and wrangler_cmd:
            key = f"{args.book}/{args.edition}/ch{ch}/words.json"
            success, err = r2_put(out_dir / "words.json", key, wrangler_cmd)
            if success:
                log(f"ch{ch}: uploaded {key}")
                ok_count += 1
            else:
                log(f"ch{ch}: upload FAIL {err}")
                fail_count += 1
        else:
            ok_count += 1

    log(f"Done: ok={ok_count} fail={fail_count} skip={skip_count}")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
