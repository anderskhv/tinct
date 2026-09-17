#!/usr/bin/env python3
"""Fail-closed validation for a mutable, exact-trigger audio batch."""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://tinct.app"
UA = "tinct-active-audio-batch/1.0"
ACTIVE_PATH = "artifacts/audio-highlight-cloud-resume-2026-09-16/active-batch.json"
RUNNER_PATHS = (".github/workflows/audio-align-canary.yml", "tools/audio-highlight")
MAX_TARGETS = 20
MAX_AUDIO_SECONDS = 7200.0


def request(url: str, headers: dict[str, str] | None = None) -> tuple[int, bytes, dict]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            return response.status, response.read(), dict(response.headers)
    except urllib.error.HTTPError as error:
        return error.code, b"", dict(error.headers or {})


def api_file(route: str, path: str, headers: dict[str, str] | None = None):
    return request(f"{BASE}{route}?path={urllib.parse.quote(path, safe='')}", headers)


def validate_rows(rows: object) -> list[dict]:
    if not isinstance(rows, list) or not 1 <= len(rows) <= MAX_TARGETS:
        raise ValueError(f"active batch must contain 1..{MAX_TARGETS} targets")
    clean, seen = [], set()
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or set(row) != {"bookId", "edition", "chapter"}:
            raise ValueError(f"target {index} must contain only bookId, edition, chapter")
        book, edition, chapter = row["bookId"], row["edition"], row["chapter"]
        if not isinstance(book, str) or not book or not isinstance(edition, str) or not edition:
            raise ValueError(f"target {index} has invalid identity")
        if not isinstance(chapter, int) or chapter < 1:
            raise ValueError(f"target {index} has invalid chapter")
        key = (book, edition, chapter)
        if key in seen:
            raise ValueError(f"duplicate target {key}")
        seen.add(key)
        clean.append(dict(bookId=book, edition=edition, chapter=chapter))
    return clean


def validate_spend(ledger: object) -> float:
    if not isinstance(ledger, dict):
        raise ValueError("spend ledger must be an object")
    prior = float(ledger.get("priorEstimate", -1))
    attempts = ledger.get("attempts")
    carry = float(ledger.get("guardCarryForward", -1))
    budget = float(ledger.get("aggregateBudget", -1))
    if prior < 0 or not isinstance(attempts, list) or carry < 0 or budget <= 0:
        raise ValueError("spend ledger fields are invalid")
    exact = prior + sum(float(row["estimatedCost"]) for row in attempts)
    recorded = float(ledger.get("exactConservativeTotal", -1))
    if abs(exact - recorded) > 0.0001:
        raise ValueError(f"spend ledger does not reconcile: {exact:.4f} != {recorded:.4f}")
    if carry + 1e-9 < exact or carry >= budget:
        raise ValueError("spend carry-forward is not conservative or exhausts the budget")
    return carry


def verify_trigger_integrity(reviewed: str) -> dict:
    changed = subprocess.check_output(["git", "diff", "--name-only", f"{reviewed}..HEAD"], text=True).splitlines()
    if set(changed) - {ACTIVE_PATH}:
        raise ValueError("trigger commit may change only active-batch.json: " + ", ".join(changed))
    runner_diff = subprocess.run(["git", "diff", "--quiet", reviewed, "HEAD", "--", *RUNNER_PATHS])
    if runner_diff.returncode != 0:
        raise ValueError("runner/tool tree differs from reviewed runner")
    return {
        "reviewedRunnerCommit": reviewed,
        "triggerCommit": subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip(),
        "changedPaths": changed,
    }


def check_target(row: dict) -> dict:
    book, edition, chapter = row["bookId"], row["edition"], row["chapter"]
    key = f"{book}/{edition}/ch{chapter}"
    words_status, _, _ = api_file("/api/audio-file", f"{key}/words.json")
    if words_status != 404:
        raise ValueError(f"{key}: words sidecar status is {words_status}, expected 404")
    manifest_status, manifest_body, _ = api_file("/api/audio-manifest", f"{key}/manifest.json")
    if manifest_status != 200:
        raise ValueError(f"{key}: manifest status {manifest_status}")
    manifest = json.loads(manifest_body)
    edition_status, edition_body, _ = request(f"{BASE}/data/editions/{book}-{edition}.json")
    if edition_status != 200:
        raise ValueError(f"{key}: edition status {edition_status}")
    edition_data = json.loads(edition_body)
    chapters = edition_data.get("chapters", [])
    if chapter > len(chapters):
        raise ValueError(f"{key}: chapter absent from current edition")
    entries = []
    total_seconds = 0.0
    for item in manifest.get("paragraphs", []):
        paragraph, filename = item.get("paragraph"), item.get("file")
        if not isinstance(paragraph, int) or not filename:
            continue
        status, _, headers = api_file("/api/audio-file", f"{key}/{filename}", {"Range": "bytes=0-0"})
        size = None
        content_range = headers.get("Content-Range")
        if content_range and "/" in content_range:
            size = int(content_range.rsplit("/", 1)[1])
        if status not in (200, 206) or not size:
            raise ValueError(f"{key}: unavailable recording p{paragraph} {filename} HTTP {status}")
        duration = float(item.get("duration") or 0)
        if duration <= 0:
            raise ValueError(f"{key}: missing duration for p{paragraph}")
        total_seconds += duration
        entries.append(dict(paragraph=paragraph, file=filename, bytes=size, duration=duration))
    if not entries:
        raise ValueError(f"{key}: manifest has no referenced recordings")
    source_chapter = chapters[chapter - 1]
    paragraphs = source_chapter.get("paragraphs", []) if isinstance(source_chapter, dict) else []
    return {
        **row,
        "key": key,
        "wordsStatus": words_status,
        "manifestSha256": hashlib.sha256(manifest_body).hexdigest(),
        "editionSha256": hashlib.sha256(edition_body).hexdigest(),
        "sourceParagraphs": len(paragraphs),
        "recordings": len(entries),
        "audioSeconds": round(total_seconds, 3),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=Path, required=True)
    parser.add_argument("--ledger", type=Path, required=True)
    parser.add_argument("--reviewed-commit", required=True)
    parser.add_argument("--evidence", type=Path, required=True)
    parser.add_argument("--github-env", type=Path)
    args = parser.parse_args()
    integrity = verify_trigger_integrity(args.reviewed_commit)
    rows = validate_rows(json.loads(args.batch.read_text()))
    carry = validate_spend(json.loads(args.ledger.read_text()))
    results = [check_target(row) for row in rows]
    audio_seconds = round(sum(row["audioSeconds"] for row in results), 3)
    if audio_seconds > MAX_AUDIO_SECONDS:
        raise ValueError(f"batch audio {audio_seconds}s exceeds {MAX_AUDIO_SECONDS}s")
    report = {
        **integrity,
        "batchSha256": hashlib.sha256(args.batch.read_bytes()).hexdigest(),
        "targets": results,
        "targetCount": len(results),
        "audioSecondsIncludingTitles": audio_seconds,
        "guardCarryForward": carry,
    }
    args.evidence.parent.mkdir(parents=True, exist_ok=True)
    args.evidence.write_text(json.dumps(report, indent=2) + "\n")
    if args.github_env:
        with args.github_env.open("a") as handle:
            handle.write(f"TINCT_GPU_SPENT={carry:.2f}\n")
    print(json.dumps({"targets": len(results), "audioSeconds": audio_seconds, "spent": carry}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
