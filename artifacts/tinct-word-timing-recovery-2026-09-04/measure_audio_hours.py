#!/usr/bin/env python3
"""Sum published audio duration from the production manifests already audited."""

from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


BASE = Path(__file__).resolve().parent
SOURCE = BASE / "production-presence-by-edition.json"
OUTPUT = BASE / "production-audio-hours.json"


def fetch(item: tuple[str, str, str, int]) -> tuple[tuple[str, str, str, int], float]:
    book, edition, language, chapter = item
    path = urllib.parse.quote(f"{book}/{edition}/ch{chapter}/manifest.json", safe="")
    url = f"https://tinct.app/api/audio-manifest?path={path}"
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "TinctWordsSidecarAudit/1.0"})
            with urllib.request.urlopen(req, timeout=30) as response:
                manifest = json.load(response)
            seconds = sum(
                float(entry.get("duration") or 0)
                for entry in manifest.get("paragraphs", [])
                if isinstance(entry, dict) and int(entry.get("paragraph", -1)) >= 0
            )
            return item, seconds
        except Exception as error:  # report bounded read-only failures in the artifact
            last_error = error
            time.sleep(0.25 * (attempt + 1))
    raise RuntimeError(f"{book}/{edition}/ch{chapter}: {last_error}")


def main() -> None:
    rows = json.loads(SOURCE.read_text(encoding="utf-8"))
    jobs: list[tuple[str, str, str, int]] = []
    for row in rows:
        missing_audio = set(row.get("audio_missing", []))
        for chapter in range(1, int(row["chapters"]) + 1):
            if chapter not in missing_audio:
                jobs.append((row["book_id"], row["edition"], row["language"], chapter))

    by_target: dict[str, float] = defaultdict(float)
    by_book: dict[str, float] = defaultdict(float)
    by_language: dict[str, float] = defaultdict(float)
    failures: list[str] = []

    with ThreadPoolExecutor(max_workers=32) as pool:
        futures = [pool.submit(fetch, job) for job in jobs]
        for future in as_completed(futures):
            try:
                (book, edition, language, _chapter), seconds = future.result()
                by_target[f"{book}/{edition}"] += seconds
                by_book[book] += seconds
                by_language[language] += seconds
            except Exception as error:
                failures.append(str(error))

    payload = {
        "source": "production /api/audio-manifest responses",
        "manifestsRequested": len(jobs),
        "manifestsMeasured": len(jobs) - len(failures),
        "failures": sorted(failures),
        "totalSeconds": round(sum(by_target.values()), 3),
        "totalHours": round(sum(by_target.values()) / 3600, 3),
        "byLanguageHours": {
            key: round(value / 3600, 3) for key, value in sorted(by_language.items())
        },
        "byTargetHours": {
            key: round(value / 3600, 3) for key, value in sorted(by_target.items())
        },
        "byBookHours": {
            key: round(value / 3600, 3) for key, value in sorted(by_book.items())
        },
    }
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: payload[key] for key in (
        "manifestsRequested", "manifestsMeasured", "totalHours", "byLanguageHours", "failures"
    )}, indent=2))


if __name__ == "__main__":
    main()
