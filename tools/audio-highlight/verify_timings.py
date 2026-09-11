"""Validate published word-timing sidecars against production truth.

Presence of a words.json proves nothing. This checks, for each published
chapter sidecar, the five things that actually have to hold:

  identity  the sidecar names the book/edition/chapter it is stored under
  mapping   every timed paragraph corresponds to a real spoken paragraph
            recording in the chapter manifest, by index AND by file name
  coverage  every spoken paragraph in the manifest has timings
  bounds    timestamps are finite, ordered, and fit inside the recording
  text      the timed words match the published edition text for that
            paragraph at or above the existing 0.85 acceptance threshold

The threshold is the one already in force; this tool never lowers it and never
invents a timestamp or a confidence value. A chapter passes only if every check
passes for every paragraph.

Read-only. Runs anywhere with outbound HTTPS; needs no credentials.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import difflib
import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import prodapi  # noqa: E402

MIN_PARAGRAPH_RATIO = 0.85
# A recording's trailing silence is real; allow a little slack past the stated
# duration before calling a timestamp out of bounds.
DURATION_SLACK_SECONDS = 0.75

_TOKEN = re.compile(r"[a-z0-9]+(?:['’-][a-z0-9]+)*")


def tokenize(text: str) -> list[str]:
    return _TOKEN.findall(text.lower().replace("’", "'"))


def paragraph_texts(edition: dict, chapter_number: int) -> list[str] | None:
    for chapter in edition.get("chapters") or []:
        if chapter.get("number") == chapter_number:
            paragraphs = chapter.get("paragraphs")
            if isinstance(paragraphs, list):
                return [p if isinstance(p, str) else (p or {}).get("text", "") for p in paragraphs]
            return None
    return None


def check_chapter(book_id: str, edition_key: str, chapter: int, edition_text: dict) -> dict:
    result = {
        "bookId": book_id,
        "edition": edition_key,
        "chapter": chapter,
        "ok": False,
        "failures": [],
        "paragraphsChecked": 0,
        "wordsChecked": 0,
        "worstParagraphRatio": None,
    }
    fail = result["failures"].append

    status, manifest = prodapi.chapter_manifest(book_id, edition_key, chapter)
    if status != 200 or not manifest:
        fail(f"manifest unavailable (HTTP {status})")
        return result
    status, words, raw = prodapi.chapter_words(book_id, edition_key, chapter)
    if status != 200 or not words:
        fail(f"sidecar unavailable or unparseable (HTTP {status})")
        return result
    result["sidecarBytes"] = len(raw)

    # identity
    if words.get("bookId") != book_id:
        fail(f"identity: sidecar bookId {words.get('bookId')!r} != path {book_id!r}")
    if words.get("editionKey") != edition_key:
        fail(f"identity: sidecar editionKey {words.get('editionKey')!r} != path {edition_key!r}")
    if words.get("chapter") != chapter:
        fail(f"identity: sidecar chapter {words.get('chapter')!r} != path {chapter}")

    # manifest spoken paragraphs (index -1 is the chapter title track, not body text)
    spoken = {}
    for entry in manifest.get("paragraphs") or []:
        index = entry.get("paragraph")
        if isinstance(index, int) and index >= 0:
            spoken[index] = entry
    if not spoken:
        fail("manifest lists no spoken paragraphs")
        return result

    timed = {}
    for paragraph in words.get("paragraphs") or []:
        index = paragraph.get("paragraph")
        if not isinstance(index, int):
            fail(f"mapping: sidecar paragraph with non-integer index {index!r}")
            continue
        if index in timed:
            fail(f"mapping: paragraph {index} appears twice in the sidecar")
        timed[index] = paragraph

    # mapping + coverage
    for index in sorted(set(timed) - set(spoken)):
        fail(f"mapping: paragraph {index} has timings but no spoken recording in the manifest")
    for index in sorted(set(spoken) - set(timed)):
        fail(f"coverage: spoken paragraph {index} has no timings")

    texts = paragraph_texts(edition_text, chapter)
    if texts is None:
        fail("edition text has no chapter with this number")

    worst = None
    for index in sorted(set(timed) & set(spoken)):
        paragraph = timed[index]
        entry = spoken[index]

        expected_file = entry.get("file")
        actual_file = paragraph.get("file")
        if expected_file and actual_file and expected_file != actual_file:
            fail(f"mapping: paragraph {index} points at {actual_file!r}, manifest records {expected_file!r}")

        word_list = paragraph.get("words")
        if not isinstance(word_list, list) or not word_list:
            fail(f"bounds: paragraph {index} has no words")
            continue
        result["paragraphsChecked"] += 1
        result["wordsChecked"] += len(word_list)

        duration = entry.get("duration")
        limit = (duration + DURATION_SLACK_SECONDS) if isinstance(duration, (int, float)) else None
        previous_end = 0.0
        for position, word in enumerate(word_list):
            start, end = word.get("start"), word.get("end")
            if not isinstance(start, (int, float)) or not isinstance(end, (int, float)) \
                    or not math.isfinite(start) or not math.isfinite(end):
                fail(f"bounds: paragraph {index} word {position} has a non-finite timestamp")
                break
            if start < -0.01:
                fail(f"bounds: paragraph {index} word {position} starts before the recording ({start})")
                break
            if end < start:
                fail(f"bounds: paragraph {index} word {position} ends before it starts ({start} > {end})")
                break
            if start + 1e-6 < previous_end:
                fail(f"bounds: paragraph {index} word {position} starts before the previous word ended")
                break
            if limit is not None and end > limit:
                fail(f"bounds: paragraph {index} word {position} ends at {end}s, past the {duration}s recording")
                break
            previous_end = end

        if texts is not None:
            if index >= len(texts):
                fail(f"text: paragraph {index} is timed but the edition chapter has only {len(texts)} paragraphs")
                continue
            expected = tokenize(texts[index])
            actual = tokenize(" ".join(str(w.get("text", "")) for w in word_list))
            if not expected:
                # A non-spoken ornament (scene separator, rule) carries no tokens.
                # Timings against it are meaningless, so flag rather than score it.
                if actual:
                    fail(f"text: paragraph {index} is a non-spoken separator in the edition but carries {len(actual)} timed words")
                continue
            ratio = difflib.SequenceMatcher(a=expected, b=actual, autojunk=False).ratio()
            worst = ratio if worst is None else min(worst, ratio)
            if ratio < MIN_PARAGRAPH_RATIO:
                fail(f"text: paragraph {index} matches the edition text at {ratio:.3f}, below {MIN_PARAGRAPH_RATIO}")

    result["worstParagraphRatio"] = None if worst is None else round(worst, 4)
    result["ok"] = not result["failures"]
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--targets", required=True,
                        help="JSON file: [{bookId, edition, chapter}, ...]")
    parser.add_argument("--out", required=True, help="where to write the JSON report")
    parser.add_argument("--workers", type=int, default=8)
    args = parser.parse_args()

    targets = json.loads(Path(args.targets).read_text())
    editions: dict[tuple[str, str], dict] = {}
    for target in targets:
        key = (target["bookId"], target["edition"])
        if key not in editions:
            status, text = prodapi.edition_text(*key)
            editions[key] = text if status == 200 and text else {}

    results: list[dict] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [
            pool.submit(check_chapter, t["bookId"], t["edition"], int(t["chapter"]),
                        editions[(t["bookId"], t["edition"])])
            for t in targets
        ]
        for done, future in enumerate(concurrent.futures.as_completed(futures), 1):
            results.append(future.result())
            if done % 50 == 0:
                print(f"  checked {done}/{len(targets)}", file=sys.stderr, flush=True)

    results.sort(key=lambda r: (r["bookId"], r["edition"], r["chapter"]))
    passed = [r for r in results if r["ok"]]
    failed = [r for r in results if not r["ok"]]
    report = {
        "threshold": MIN_PARAGRAPH_RATIO,
        "checked": len(results),
        "passed": len(passed),
        "failed": len(failed),
        "results": results,
    }
    Path(args.out).write_text(json.dumps(report, indent=1))

    print(f"checked {len(results)} chapters: {len(passed)} pass, {len(failed)} fail")
    causes: dict[str, int] = {}
    for result in failed:
        for failure in result["failures"]:
            causes[failure.split(":")[0]] = causes.get(failure.split(":")[0], 0) + 1
    for cause, count in sorted(causes.items(), key=lambda kv: -kv[1]):
        print(f"  {cause}: {count}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
