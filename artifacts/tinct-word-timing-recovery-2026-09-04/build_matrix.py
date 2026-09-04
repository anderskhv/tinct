#!/usr/bin/env python3
"""Build a chapter-level production audio/word-sidecar matrix.

Inputs are the fresh presence scan and the structural KJV audit. Existing KJV
sidecars are fetched again and checked with the exact semantic token rules used
by the deployed reader. This script is read-only with respect to production.
"""

from __future__ import annotations

import csv
import json
import math
import re
import unicodedata
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


ROOT = Path("/Users/andershvelplund/.codex/artifacts/tinct-word-timing-recovery-2026-09-04")
PRESENCE = Path("/private/tmp/tinct-audio-word-timing-coverage-2026-09-04.json")
KJV_AUDIT = Path("/private/tmp/tinct-bible-kjv-word-sidecar-validity-2026-09-04.json")
EDITION = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions/bible-kjv-en.json")
BASE = "https://tinct.app/api/audio-file?path="
UA = {"User-Agent": "TinctWordsRecoveryAudit/1.0"}


def semantic_token(token: str) -> str:
    value = unicodedata.normalize("NFKC", token).lower().replace("‘", "'").replace("’", "'")
    return "".join(char for char in value if char.isalnum() or char == "'")


def reader_spoken_tokens(text: str) -> list[str]:
    return [
        token
        for token in re.split(r"\s+", text.strip())
        if token and not re.fullmatch(r"[⁰¹²³⁴⁵⁶⁷⁸⁹]+", token)
    ]


def fetch_json(book: str, edition: str, chapter: int, filename: str) -> dict:
    path = urllib.parse.quote(f"{book}/{edition}/ch{chapter}/{filename}", safe="")
    request = urllib.request.Request(BASE + path, headers=UA)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def validate_kjv_reader_compatibility(chapter: dict) -> dict:
    number = chapter["number"]
    sidecar = fetch_json("bible", "kjv-en", number, "words.json")
    entries = {entry.get("paragraph"): entry for entry in sidecar.get("paragraphs", [])}
    errors: list[str] = []
    words = 0
    for index, text in enumerate(chapter.get("paragraphs", [])):
        expected = reader_spoken_tokens(text)
        entry = entries.get(index)
        if not entry:
            errors.append(f"p{index}:missing")
            continue
        actual = entry.get("words")
        if not isinstance(actual, list):
            errors.append(f"p{index}:words-invalid")
            continue
        words += len(actual)
        if len(actual) != len(expected):
            errors.append(f"p{index}:count:{len(actual)}!={len(expected)}")
            continue
        for word_index, (timed, source) in enumerate(zip(actual, expected)):
            if not isinstance(timed, dict):
                errors.append(f"p{index}:w{word_index}:invalid")
                break
            start, end = timed.get("start"), timed.get("end")
            if (
                not isinstance(start, (int, float))
                or isinstance(start, bool)
                or not isinstance(end, (int, float))
                or isinstance(end, bool)
                or not math.isfinite(start)
                or not math.isfinite(end)
                or start < 0
                or end < start
            ):
                errors.append(f"p{index}:w{word_index}:timing")
                break
            if word_index and start < actual[word_index - 1]["start"]:
                errors.append(f"p{index}:w{word_index}:nonmonotonic")
                break
            if semantic_token(timed.get("text", "")) != semantic_token(source):
                errors.append(f"p{index}:w{word_index}:semantic")
                break
    return {"chapter": number, "readerCompatible": not errors, "timedWords": words, "errors": errors}


def main() -> None:
    presence = json.loads(PRESENCE.read_text(encoding="utf-8"))
    kjv_audit = json.loads(KJV_AUDIT.read_text(encoding="utf-8"))
    strict_by_chapter = {item["chapter"]: item for item in kjv_audit["chapters"]}
    bible = json.loads(EDITION.read_text(encoding="utf-8"))
    presence_kjv = next(item for item in presence if item["book_id"] == "bible" and item["edition"] == "kjv-en")
    available = set(range(1, presence_kjv["chapters"] + 1)) - set(presence_kjv["sidecars_missing"])
    chapter_data = {chapter["number"]: chapter for chapter in bible["chapters"]}

    reader_results: dict[int, dict] = {}
    with ThreadPoolExecutor(max_workers=32) as executor:
        futures = {executor.submit(validate_kjv_reader_compatibility, chapter_data[number]): number for number in available}
        for future in as_completed(futures):
            number = futures[future]
            try:
                reader_results[number] = future.result()
            except Exception as exc:
                reader_results[number] = {
                    "chapter": number,
                    "readerCompatible": False,
                    "timedWords": 0,
                    "errors": [f"fetch:{type(exc).__name__}:{exc}"],
                }

    rows: list[dict] = []
    for edition in presence:
        audio_missing = set(edition["audio_missing"])
        sidecars_missing = set(edition["sidecars_missing"])
        for chapter in range(1, edition["chapters"] + 1):
            audio = chapter not in audio_missing
            sidecar = audio and chapter not in sidecars_missing
            strict = strict_by_chapter.get(chapter) if edition["book_id"] == "bible" and edition["edition"] == "kjv-en" else None
            normalized = reader_results.get(chapter) if sidecar and edition["book_id"] == "bible" and edition["edition"] == "kjv-en" else None
            rows.append({
                "scope": edition["scope"],
                "book_id": edition["book_id"],
                "edition_key": edition["edition"],
                "language": edition["language"],
                "chapter": chapter,
                "audio_manifest": "present" if audio else "missing",
                "words_sidecar": "present" if sidecar else ("missing" if audio else "n/a-no-audio"),
                "structural_timing": (
                    "pass" if strict and not any(issue["code"] not in {"word_text_mismatch", "observed_alignment_unavailable"} for issue in strict.get("issues", []))
                    else ("n/a-missing-sidecar" if not sidecar else "not-audited")
                ),
                "reader_normalized_tokens": (
                    "pass" if normalized and normalized["readerCompatible"]
                    else ("fail" if normalized else "n/a-missing-sidecar")
                ),
                "observed_asr_provenance": (
                    "unavailable-legacy" if sidecar else "n/a-missing-sidecar"
                ),
                "timed_words": normalized["timedWords"] if normalized else 0,
                "notes": ";".join(normalized["errors"]) if normalized else "",
            })

    with (ROOT / "chapter-coverage-matrix.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    summary = {
        "source": "production APIs used by the reader",
        "targets": len(presence),
        "chapters": len(rows),
        "audioManifestsPresent": sum(row["audio_manifest"] == "present" for row in rows),
        "wordSidecarsPresent": sum(row["words_sidecar"] == "present" for row in rows),
        "wordSidecarsMissingWithAudio": sum(row["words_sidecar"] == "missing" for row in rows),
        "audioManifestsMissing": sum(row["audio_manifest"] == "missing" for row in rows),
        "readerCompatibleSidecars": sum(row["reader_normalized_tokens"] == "pass" for row in rows),
        "readerIncompatibleSidecars": sum(row["reader_normalized_tokens"] == "fail" for row in rows),
        "legacySidecarsWithoutObservedAsrProvenance": sum(row["observed_asr_provenance"] == "unavailable-legacy" for row in rows),
        "kjvValidationFetchFailures": [value for value in reader_results.values() if not value["readerCompatible"]],
    }
    (ROOT / "coverage-summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    (ROOT / "kjv-reader-compatibility.json").write_text(
        json.dumps([reader_results[key] for key in sorted(reader_results)], indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
