#!/usr/bin/env python3
"""Fail-closed validation for a mutable, exact-trigger audio batch."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://tinct.app"
UA = "tinct-active-audio-batch/1.0"
ACTIVE_PATH = "artifacts/audio-highlight-cloud-resume-2026-09-16/active-batch.json"
LEDGER_PATH = "artifacts/audio-highlight-cloud-resume-2026-09-16/runpod-spend-ledger.json"
QUARANTINE_PATH = "artifacts/audio-highlight-cloud-resume-2026-09-16/quarantine.json"
RUNNER_PATHS = (".github/workflows/audio-align-canary.yml", "tools/audio-highlight")
MAX_TARGETS = 20
MAX_AUDIO_SECONDS = 7200.0
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "aligner"))
from spoken_policy import is_scene_separator  # noqa: E402


def request(url: str, headers: dict[str, str] | None = None) -> tuple[int, bytes, dict]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            return response.status, response.read(), dict(response.headers)
    except urllib.error.HTTPError as error:
        return error.code, b"", dict(error.headers or {})


def api_file(route: str, path: str, headers: dict[str, str] | None = None):
    return request(f"{BASE}{route}?path={urllib.parse.quote(path, safe='')}", headers)


def quarantine_keys(payload: object | None = None, root: Path | None = None) -> set[tuple[str, str, int]]:
    if payload is None:
        path = (root or Path(__file__).resolve().parents[3]) / QUARANTINE_PATH
        payload = json.loads(path.read_text())
    if not isinstance(payload, dict) or not isinstance(payload.get("chapters"), list):
        raise ValueError("quarantine file must contain a chapters list")
    keys: set[tuple[str, str, int]] = set()
    for index, row in enumerate(payload["chapters"]):
        if not isinstance(row, dict):
            raise ValueError(f"quarantine row {index} is not an object")
        book, edition, chapter = row.get("bookId"), row.get("edition"), row.get("chapter")
        if not isinstance(book, str) or not book or not isinstance(edition, str) or not edition:
            raise ValueError(f"quarantine row {index} has invalid identity")
        if not isinstance(chapter, int) or chapter < 1:
            raise ValueError(f"quarantine row {index} has invalid chapter")
        keys.add((book, edition, chapter))
    if not keys:
        raise ValueError("quarantine file has no chapters")
    return keys


def validate_rows(rows: object, quarantined: set[tuple[str, str, int]] | None = None) -> list[dict]:
    if not isinstance(rows, list) or not 1 <= len(rows) <= MAX_TARGETS:
        raise ValueError(f"active batch must contain 1..{MAX_TARGETS} targets")
    blocked = quarantined if quarantined is not None else quarantine_keys()
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
        if key in blocked:
            raise ValueError(f"quarantined target {book}/{edition}/{chapter}")
        seen.add(key)
        clean.append(dict(bookId=book, edition=edition, chapter=chapter))
    return clean


def validate_spend(ledger: object, reviewed: object | None = None) -> float:
    if not isinstance(ledger, dict):
        raise ValueError("spend ledger must be an object")
    prior = float(ledger.get("priorEstimate", -1))
    attempts = ledger.get("attempts")
    carry = float(ledger.get("guardCarryForward", -1))
    budget = float(ledger.get("aggregateBudget", -1))
    if prior < 0 or not isinstance(attempts, list) or carry < 0 or budget <= 0:
        raise ValueError("spend ledger fields are invalid")
    if reviewed is not None:
        if not isinstance(reviewed, dict):
            raise ValueError("reviewed spend ledger is invalid")
        for field in ("policy", "priorEstimate", "aggregateBudget"):
            if ledger.get(field) != reviewed.get(field):
                raise ValueError(f"spend ledger rewrites reviewed {field}")
        baseline = reviewed.get("attempts")
        if not isinstance(baseline, list) or attempts[:len(baseline)] != baseline:
            raise ValueError("spend ledger rewrites or removes reviewed attempts")
        if carry < float(reviewed.get("guardCarryForward", 0)):
            raise ValueError("spend carry-forward rolled back")
        appended = attempts[len(baseline):]
        for index, row in enumerate(appended, len(baseline)):
            if not isinstance(row, dict):
                raise ValueError(f"spend attempt {index} is invalid")
            cost = float(row.get("estimatedCost", -1))
            if not math.isfinite(cost) or cost < 0:
                raise ValueError(f"spend attempt {index} has invalid estimatedCost")
            if not row.get("pod") or row.get("status") != "EXITED" or row.get("terminateHttp") != 204:
                raise ValueError(f"spend attempt {index} lacks pod identity or proven teardown")
    costs = []
    for index, row in enumerate(attempts):
        if not isinstance(row, dict):
            raise ValueError(f"spend attempt {index} is invalid")
        cost = float(row.get("estimatedCost", -1))
        if not math.isfinite(cost) or cost < 0:
            raise ValueError(f"spend attempt {index} has invalid estimatedCost")
        costs.append(cost)
    exact = prior + sum(costs)
    recorded = float(ledger.get("exactConservativeTotal", -1))
    if not math.isfinite(recorded) or abs(exact - recorded) > 0.0001:
        raise ValueError(f"spend ledger does not reconcile: {exact:.4f} != {recorded:.4f}")
    if not math.isfinite(carry) or carry + 1e-9 < exact or carry >= budget:
        raise ValueError("spend carry-forward is not conservative or exhausts the budget")
    return carry


def verify_trigger_integrity(reviewed: str) -> dict:
    changed = subprocess.check_output(["git", "diff", "--name-only", f"{reviewed}..HEAD"], text=True).splitlines()
    expected = {ACTIVE_PATH, LEDGER_PATH}
    if set(changed) != expected or len(changed) != len(expected):
        raise ValueError("trigger commit must change exactly active-batch.json and runpod-spend-ledger.json: " + ", ".join(changed))
    runner_diff = subprocess.run(["git", "diff", "--quiet", reviewed, "HEAD", "--", *RUNNER_PATHS])
    if runner_diff.returncode != 0:
        raise ValueError("runner/tool tree differs from reviewed runner")
    return {
        "reviewedRunnerCommit": reviewed,
        "triggerCommit": subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip(),
        "changedPaths": changed,
    }


def validate_manifest(manifest: object, paragraphs: list) -> list[dict]:
    if not isinstance(manifest, dict) or not isinstance(manifest.get("paragraphs"), list):
        raise ValueError("manifest paragraphs must be a list")
    entries, paragraph_ids, filenames = [], set(), set()
    for index, item in enumerate(manifest["paragraphs"]):
        if not isinstance(item, dict):
            raise ValueError(f"manifest row {index} is not an object")
        paragraph, filename = item.get("paragraph"), item.get("file")
        if not isinstance(paragraph, int) or not isinstance(filename, str) or not filename:
            raise ValueError(f"manifest row {index} has invalid paragraph/file")
        if paragraph in paragraph_ids or filename in filenames:
            raise ValueError(f"manifest row {index} duplicates paragraph or file")
        duration = item.get("duration")
        if not isinstance(duration, (int, float)) or duration <= 0:
            raise ValueError(f"manifest row {index} has invalid duration")
        paragraph_ids.add(paragraph);filenames.add(filename);entries.append(item)
    source_ids = set(range(len(paragraphs)))
    extra = sorted(p for p in paragraph_ids if p >= 0 and p not in source_ids)
    if extra:
        raise ValueError(f"manifest indexes outside current source: {extra}")
    missing = sorted(source_ids - {p for p in paragraph_ids if p >= 0})
    unexplained = [p for p in missing if not is_scene_separator(paragraphs[p])]
    if unexplained:
        raise ValueError(f"manifest omits spoken source paragraphs: {unexplained}")
    if not entries:
        raise ValueError("manifest has no referenced recordings")
    return entries


def resolve_chapter(chapters: object, chapter_number: int) -> dict:
    if not isinstance(chapters, list):
        raise ValueError("edition chapters must be a list")
    matches = [chapter for chapter in chapters if isinstance(chapter, dict) and chapter.get("number") == chapter_number]
    if len(matches) != 1:
        raise ValueError(f"edition chapter number {chapter_number} matched {len(matches)} records")
    return matches[0]


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
    source_chapter = resolve_chapter(chapters, chapter)
    raw_paragraphs = source_chapter.get("paragraphs", [])
    paragraphs = [p if isinstance(p, str) else (p or {}).get("text", "") for p in raw_paragraphs]
    manifest_entries = validate_manifest(manifest, paragraphs)
    entries, total_seconds = [], 0.0
    for item in manifest_entries:
        paragraph, filename = item["paragraph"], item["file"]
        status, audio, _ = api_file("/api/audio-file", f"{key}/{filename}")
        if status != 200 or not audio:
            raise ValueError(f"{key}: unavailable recording p{paragraph} {filename} HTTP {status}")
        duration = float(item["duration"])
        total_seconds += duration
        entries.append(dict(
            paragraph=paragraph,
            file=filename,
            bytes=len(audio),
            duration=duration,
            sha256=hashlib.sha256(audio).hexdigest(),
        ))
    return {
        **row,
        "key": key,
        "wordsStatus": words_status,
        "manifestSha256": hashlib.sha256(json.dumps(manifest, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
        "editionSha256": hashlib.sha256(json.dumps(edition_data, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
        "sourceParagraphs": len(paragraphs),
        "recordings": len(entries),
        "audioSeconds": round(total_seconds, 3),
        "audioObjects": entries,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=Path, required=True)
    parser.add_argument("--ledger", type=Path, required=True)
    parser.add_argument("--reviewed-commit", required=True)
    parser.add_argument("--evidence", type=Path, required=True)
    parser.add_argument("--resolved-batch", type=Path, required=True)
    parser.add_argument("--github-env", type=Path)
    args = parser.parse_args()
    integrity = verify_trigger_integrity(args.reviewed_commit)
    rows = validate_rows(json.loads(args.batch.read_text()))
    reviewed_ledger = json.loads(subprocess.check_output(
        ["git", "show", f"{args.reviewed_commit}:{LEDGER_PATH}"], text=True
    ))
    carry = validate_spend(json.loads(args.ledger.read_text()), reviewed_ledger)
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
    resolved = [
        {
            "bookId": row["bookId"],
            "edition": row["edition"],
            "chapter": row["chapter"],
            "expectedEditionSha256": row["editionSha256"],
            "expectedManifestSha256": row["manifestSha256"],
            "expectedAudioSha256": {item["file"]: item["sha256"] for item in row["audioObjects"]},
        }
        for row in results
    ]
    args.resolved_batch.write_text(json.dumps(resolved, indent=2) + "\n")
    if args.github_env:
        with args.github_env.open("a") as handle:
            handle.write(f"TINCT_GPU_SPENT={carry:.2f}\n")
    print(json.dumps({"targets": len(results), "audioSeconds": audio_seconds, "spent": carry}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
