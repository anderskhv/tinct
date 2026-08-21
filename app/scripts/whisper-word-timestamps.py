#!/usr/bin/env python3
"""Emit Whisper word timestamps for one audio file as JSON on stdout.

Production helper for align-paragraph-words. Tries faster-whisper first,
then openai-whisper. Does not interpolate. Exits 2 if no Whisper install
is available.

Usage:
  python3 app/scripts/whisper-word-timestamps.py /path/to/p0.mp3 --language en
"""

from __future__ import annotations

import argparse
import json
import sys


def words_from_faster_whisper(path: str, language: str) -> list[dict]:
    from faster_whisper import WhisperModel

    model = WhisperModel("base", device="cpu", compute_type="int8")
    segments, _info = model.transcribe(path, language=language, word_timestamps=True)
    words: list[dict] = []
    for segment in segments:
        for word in segment.words or []:
            text = (word.word or "").strip()
            if not text:
                continue
            words.append({"text": text, "start": float(word.start), "end": float(word.end)})
    return words


def words_from_openai_whisper(path: str, language: str) -> list[dict]:
    import whisper

    model = whisper.load_model("base")
    result = model.transcribe(path, language=language, word_timestamps=True)
    words: list[dict] = []
    for segment in result.get("segments") or []:
        for word in segment.get("words") or []:
            text = (word.get("word") or "").strip()
            if not text:
                continue
            words.append({
                "text": text,
                "start": float(word["start"]),
                "end": float(word["end"]),
            })
    return words


def main() -> int:
    parser = argparse.ArgumentParser(description="Whisper word timestamps → JSON")
    parser.add_argument("audio")
    parser.add_argument("--language", default="en")
    args = parser.parse_args()

    errors: list[str] = []
    for name, fn in (
        ("faster-whisper", words_from_faster_whisper),
        ("openai-whisper", words_from_openai_whisper),
    ):
        try:
            words = fn(args.audio, args.language)
            json.dump(words, sys.stdout, ensure_ascii=False)
            sys.stdout.write("\n")
            return 0
        except ImportError as exc:
            errors.append(f"{name} missing ({exc})")
        except Exception as exc:  # pragma: no cover - backend-specific
            errors.append(f"{name} failed: {exc}")
            break

    print(
        "No usable Whisper install. On Anders's Mac:\n"
        "  python3 -m pip install faster-whisper\n"
        "Linear interpolation is not a fallback.\n"
        + "\n".join(errors),
        file=sys.stderr,
    )
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
