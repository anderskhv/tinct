"""Build a trial.py cohort from production, with no local evidence and no S3 keys.

`cohort.py` cannot run in the cloud: it imports its S3 client from
`output/audio-recovery-publication-2026-09-09/recover.py` and reads the pilot's
`diagnosis-ledger.json`, neither of which is in any branch — both live on the
Mac. This builds the same cohort shape from the published read routes instead,
so the validated aligner runs unmodified against any chapter the readiness
splitter called `ready`.

Inputs are the published bytes the reader itself renders:

  text      /data/editions/{bookId}-{edition}.json
  manifest  /api/audio-manifest
  audio     /api/audio-file

Paragraph durations come from decoding the recording with PyAV rather than
shelling to ffprobe, so no ffmpeg binary is required. A recording that does not
decode is an error, never a guess: the chapter is dropped and recorded.

Read-only against production. Writes only the cohort directory it is given.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import sys
from pathlib import Path

import av

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import prodapi  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parent))
from spoken_policy import is_scene_separator, validate_map  # noqa: E402


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def decoded_duration(path: Path) -> float:
    """Seconds of actual decodable audio. Raises if the file does not decode."""
    with av.open(str(path)) as container:
        if not container.streams.audio:
            raise ValueError(f"no audio stream: {path}")
        stream = container.streams.audio[0]
        end = 0.0
        for frame in container.decode(stream):
            if frame.pts is None:
                continue
            end = max(end, float(frame.pts * frame.time_base) + (frame.samples / frame.sample_rate))
        if end <= 0:
            raise ValueError(f"decoded no audio: {path}")
        return end


def paragraph_list(edition: dict, chapter_number: int):
    for chapter in edition.get("chapters") or []:
        if chapter.get("number") == chapter_number:
            paragraphs = chapter.get("paragraphs")
            if not isinstance(paragraphs, list):
                return None, None
            texts = [p if isinstance(p, str) else (p or {}).get("text", "") for p in paragraphs]
            return texts, chapter.get("title")
    return None, None


def build(target: dict, out: Path, group: str, editions: dict) -> dict:
    book, edition, chapter = target["bookId"], target["edition"], int(target["chapter"])
    key = f"{book}/{edition}/ch{chapter}"

    cached = editions.get((book, edition))
    if cached is None:
        status, text = prodapi.edition_text(book, edition)
        if status != 200 or not text:
            return {"key": key, "dropped": f"edition text HTTP {status}"}
        editions[(book, edition)] = text
        cached = text

    texts, title = paragraph_list(cached, chapter)
    if texts is None:
        return {"key": key, "dropped": "edition has no such chapter"}

    status, manifest = prodapi.chapter_manifest(book, edition, chapter)
    if status != 200 or not manifest:
        return {"key": key, "dropped": f"manifest HTTP {status}"}

    entries = {p["paragraph"]: p for p in manifest.get("paragraphs", []) if p.get("paragraph", -1) >= 0}
    extra = sorted(set(entries) - set(range(len(texts))))
    if extra:
        return {"key": key, "dropped": f"manifest indexes outside the text: {extra}"}

    # Paragraphs the manifest omits are admissible only under the documented
    # narrow rule: standalone scene ornaments carry no words to time.
    omitted = sorted(set(range(len(texts))) - set(entries))
    nonspoken = [{"index": i, "text": texts[i]} for i in omitted]
    unexplained = [i for i in omitted if not is_scene_separator(texts[i])]
    if unexplained:
        return {"key": key, "dropped": f"manifest omits spoken paragraphs: {unexplained[:8]}"}

    row = {
        "key": key,
        "group": group,
        "title": title or "",
        "text_paragraph_count": len(texts),
        "paragraphs": [],
    }
    if nonspoken:
        row["nonspoken"] = nonspoken

    for index in sorted(entries):
        item = entries[index]
        name = item["file"]
        destination = out / "audio" / key / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        if not destination.exists():
            code, body = prodapi.audio_object(f"{key}/{name}")
            if code != 200 or not body:
                return {"key": key, "dropped": f"{name} HTTP {code}"}
            destination.write_bytes(body)
        raw = destination.read_bytes()
        try:
            duration = decoded_duration(destination)
        except Exception as error:
            return {"key": key, "dropped": f"{name} does not decode: {error}"}
        row["paragraphs"].append({
            "index": index,
            "file": name,
            "path": str(destination.relative_to(out)),
            "sha256": sha(raw),
            "bytes": len(raw),
            "duration": duration,
            "manifest_duration": item.get("duration"),
            "text": texts[index],
        })

    row["paragraphs"].sort(key=lambda p: p["index"])
    if not validate_map(row):
        return {"key": key, "dropped": "incomplete paragraph map"}
    return row


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--targets", type=Path, required=True, help="JSON: [{bookId, edition, chapter}, ...]")
    parser.add_argument("--out", type=Path, required=True, help="cohort directory; cohort.json is written inside it")
    parser.add_argument("--group", default="alignment")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--limit", type=int)
    arguments = parser.parse_args()

    targets = json.loads(arguments.targets.read_text())
    if arguments.limit:
        targets = targets[:arguments.limit]
    arguments.out.mkdir(parents=True, exist_ok=True)

    editions: dict = {}
    # Edition text is fetched once per edition and shared, so chapters of the
    # same edition must not race for it.
    for book, edition in sorted({(t["bookId"], t["edition"]) for t in targets}):
        status, text = prodapi.edition_text(book, edition)
        if status == 200 and text:
            editions[(book, edition)] = text

    cohort, dropped = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=arguments.workers) as pool:
        for row in pool.map(lambda t: build(t, arguments.out, arguments.group, editions), targets):
            (dropped if "dropped" in row else cohort).append(row)
            print(f"  {len(cohort) + len(dropped)}/{len(targets)}", end="\r", file=sys.stderr)

    cohort.sort(key=lambda r: r["key"])
    (arguments.out / "cohort.json").write_text(json.dumps(cohort, indent=2, ensure_ascii=False))
    (arguments.out / "cohort-dropped.json").write_text(json.dumps(dropped, indent=2, ensure_ascii=False))

    hours = sum(p["duration"] for r in cohort for p in r["paragraphs"]) / 3600
    files = sum(len(r["paragraphs"]) for r in cohort)
    print(f"cohort {len(cohort)} chapters, {files} recordings, {hours:.2f} audio hours", file=sys.stderr)
    print(f"dropped {len(dropped)} chapters", file=sys.stderr)
    for row in dropped:
        print(f"  {row['key']}: {row['dropped']}", file=sys.stderr)


if __name__ == "__main__":
    main()
