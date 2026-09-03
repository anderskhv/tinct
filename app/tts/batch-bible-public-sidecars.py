#!/usr/bin/env python3
"""Generate bible-kjv-en-ch{N}-words.json for all KJV chapters into app/public/.

Uses faster-whisper (same as generate-words-sidecar.py). Skips chapters that
already have a valid committed sidecar in public/. Deletes paragraph MP3s after
each chapter to limit disk use.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import shutil
import sys
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = REPO_ROOT / "app/public"
AUDIO_BASE = REPO_ROOT / "app/tts/audio/bible/kjv-en"

_gen_path = Path(__file__).resolve().parent / "generate-words-sidecar.py"
_spec = importlib.util.spec_from_file_location("generate_words_sidecar_mod", _gen_path)
assert _spec and _spec.loader
_gen = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_gen)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from words_sidecar_lib import validate_sidecar  # noqa: E402

DEFAULT_MODEL = _gen.DEFAULT_MODEL
DEFAULT_DEVICE = _gen.DEFAULT_DEVICE
DEFAULT_COMPUTE = _gen.DEFAULT_COMPUTE
generate_chapter = _gen.generate_chapter
load_whisper_model = _gen.load_whisper_model
log = _gen.log


def public_sidecar_path(chapter: int) -> Path:
    return PUBLIC_DIR / f"bible-kjv-en-ch{chapter}-words.json"


def public_sidecar_valid(path: Path) -> bool:
    if not path.is_file() or path.stat().st_size < 100:
        return False
    try:
        sidecar = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False
    ok, _ = validate_sidecar(sidecar, expected_paragraphs=None)
    return ok


def cleanup_mp3s(ch_dir: Path) -> None:
    for mp3 in ch_dir.glob("*.mp3"):
        mp3.unlink(missing_ok=True)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--start-ch", type=int, default=1)
    p.add_argument("--end-ch", type=int, default=1189)
    p.add_argument("--model", default=DEFAULT_MODEL)
    p.add_argument("--device", default=DEFAULT_DEVICE)
    p.add_argument("--compute-type", default=DEFAULT_COMPUTE)
    p.add_argument("--force", action="store_true", help="regenerate even if public sidecar exists")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    chapters = range(args.start_ch, args.end_ch + 1)

    log(f"Batch public sidecars ch{args.start_ch}..{args.end_ch} ({args.device}/{args.compute_type})")
    log(f"Loading whisper model {args.model}")
    model = load_whisper_model(args.model, args.device, args.compute_type)

    ok, skip, fail = 0, 0, 0
    t0 = time.time()

    for ch in chapters:
        dest = public_sidecar_path(ch)
        if not args.force and public_sidecar_valid(dest):
            log(f"ch{ch}: skip (valid public sidecar)")
            skip += 1
            continue

        out_dir = AUDIO_BASE / f"ch{ch}"
        out_dir.mkdir(parents=True, exist_ok=True)

        log(f"ch{ch}: generating")
        try:
            success, detail = generate_chapter(
                "bible",
                "kjv-en",
                ch,
                out_dir,
                model,
                local_mp3_dir=out_dir if any(out_dir.glob("*.mp3")) else None,
                skip_existing=args.force is False,
            )
        except Exception as exc:
            log(f"ch{ch}: FAIL {exc}")
            fail += 1
            continue

        if not success:
            log(f"ch{ch}: FAIL {detail}")
            fail += 1
            continue

        src = out_dir / "words.json"
        if not src.is_file():
            log(f"ch{ch}: FAIL missing words.json")
            fail += 1
            continue

        shutil.copy2(src, dest)
        cleanup_mp3s(out_dir)
        log(f"ch{ch}: OK -> {dest.name} ({detail})")
        ok += 1

        if ok and ok % 10 == 0:
            elapsed = time.time() - t0
            log(f"Progress: ok={ok} skip={skip} fail={fail} elapsed={elapsed/60:.1f}m")

    elapsed = time.time() - t0
    log(f"Done: ok={ok} skip={skip} fail={fail} elapsed={elapsed/60:.1f}m")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
