"""Flag chapters whose recordings are too short for the text they should speak.

`audio_readiness.py` establishes that a recording exists, is not empty, and that
the manifest's paragraph count matches the edition's. It cannot see a recording
that exists, decodes cleanly, and contains only **part** of its paragraph — and
those are expensive, because alignment has to run before anything notices.

Three such paragraphs cost a CPU hour each to discover the slow way:

    odyssey/original-en ch3 p37    208 words in   4.1 s   51.1 words/second
    iliad/original-en  ch14 p34    204 words in  16.4 s   12.5 words/second
    iliad/original-en  ch14 p33    213 words in  32.8 s    6.5 words/second

Measured over 806 paragraphs of real Tinct narration, speech runs at a median
**2.80 words/second**, with the 5th and 95th percentiles at 2.03 and 3.31. A
paragraph demanding 51 words per second is not narration; the recording stops
early. So the ratio of expected words to recorded seconds separates truncated
recordings from sound ones without running any recognition.

This reads the published manifest for durations and the published edition text
for word counts. **No audio is downloaded and no model is loaded**, so the whole
Priority-1 queue can be screened in minutes rather than discovered over GPU
hours.

What it is not: a guarantee. A recording can be complete and still wrong, and a
paragraph slightly over the threshold may simply be read briskly. This finds the
class where the text cannot physically fit in the audio. Treat a flag as "send to
repair", not as proof of any particular defect, and treat a pass as "worth
aligning", not as proof the recording is sound.

Read-only. No credentials.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent / "aligner"))
import prodapi  # noqa: E402
import pinned_words_sidecar_lib as lib  # noqa: E402

# Measured over 806 paragraphs of published Tinct narration.
OBSERVED_MEDIAN_WPS = 2.80
DEFAULT_LIMIT = OBSERVED_MEDIAN_WPS * 1.6  # 4.48 w/s — well clear of the 3.31 p95
MIN_WORDS = 8  # below this, a short recording says nothing reliable


def paragraph_texts(edition: dict, chapter: int) -> list[str] | None:
    for entry in edition.get("chapters") or []:
        if entry.get("number") == chapter:
            paragraphs = entry.get("paragraphs")
            if not isinstance(paragraphs, list):
                return None
            return [p if isinstance(p, str) else (p or {}).get("text", "") for p in paragraphs]
    return None


def screen(target: dict, editions: dict, limit: float) -> dict:
    book, edition, chapter = target["bookId"], target["edition"], int(target["chapter"])
    key = f"{book}/{edition}/ch{chapter}"
    text = editions.get((book, edition))
    if not text:
        return {"key": key, "outcome": "unknown", "detail": "edition text unavailable"}

    texts = paragraph_texts(text, chapter)
    if texts is None:
        return {"key": key, "outcome": "unknown", "detail": "edition has no such chapter"}

    status, manifest = prodapi.chapter_manifest(book, edition, chapter)
    if status != 200 or not manifest:
        return {"key": key, "outcome": "unknown", "detail": f"manifest HTTP {status}"}

    flagged, checked = [], 0
    for entry in manifest.get("paragraphs", []):
        index = entry.get("paragraph", -1)
        duration = entry.get("duration") or 0
        if index < 0 or index >= len(texts) or duration <= 0:
            continue
        words = len(lib.chapter_words_from_text(lib.clean_text(texts[index].replace("\n", " "))))
        if words < MIN_WORDS:
            continue
        checked += 1
        rate = words / duration
        if rate > limit:
            flagged.append({"paragraph": index, "file": entry.get("file"), "words": words,
                            "seconds": round(duration, 2), "wordsPerSecond": round(rate, 2)})

    flagged.sort(key=lambda f: -f["wordsPerSecond"])
    return {
        "key": key, "bookId": book, "edition": edition, "chapter": chapter,
        "paragraphsChecked": checked,
        "outcome": "repair:truncated-audio" if flagged else "plausible",
        "flagged": flagged[:12], "flaggedCount": len(flagged),
        "worstWordsPerSecond": flagged[0]["wordsPerSecond"] if flagged else None,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--targets", type=Path, required=True,
                        help="JSON: [{bookId, edition, chapter}, ...], or the finish-queue shape with a chapters list")
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--limit", type=float, default=DEFAULT_LIMIT,
                        help=f"words per second above which a recording is too short (default {DEFAULT_LIMIT:.2f})")
    parser.add_argument("--workers", type=int, default=8)
    arguments = parser.parse_args()

    raw = json.loads(arguments.targets.read_text())
    targets = []
    for entry in raw:
        if isinstance(entry.get("chapters"), list):
            targets += [{"bookId": entry["bookId"], "edition": entry["edition"], "chapter": c}
                        for c in entry["chapters"]]
        else:
            targets.append({"bookId": entry["bookId"], "edition": entry["edition"], "chapter": entry["chapter"]})

    editions: dict = {}
    pairs = sorted({(t["bookId"], t["edition"]) for t in targets})
    with concurrent.futures.ThreadPoolExecutor(max_workers=arguments.workers) as pool:
        def load(pair):
            status, text = prodapi.edition_text(*pair)
            return pair, (text if status == 200 else None)
        for pair, text in pool.map(load, pairs):
            if text:
                editions[pair] = text

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=arguments.workers) as pool:
        for row in pool.map(lambda t: screen(t, editions, arguments.limit), targets):
            results.append(row)
            print(f"  screened {len(results)}/{len(targets)}", end="\r", file=sys.stderr)

    arguments.out.write_text(json.dumps(
        {"limitWordsPerSecond": arguments.limit, "observedMedianWordsPerSecond": OBSERVED_MEDIAN_WPS,
         "minWords": MIN_WORDS, "results": results}, indent=1))

    truncated = [r for r in results if r["outcome"] == "repair:truncated-audio"]
    unknown = [r for r in results if r["outcome"] == "unknown"]
    print(f"screened {len(results)} chapters", file=sys.stderr)
    print(f"  plausible               {len(results) - len(truncated) - len(unknown)}", file=sys.stderr)
    print(f"  repair:truncated-audio  {len(truncated)}", file=sys.stderr)
    print(f"  unknown                 {len(unknown)}", file=sys.stderr)
    for row in sorted(truncated, key=lambda r: -(r["worstWordsPerSecond"] or 0))[:20]:
        worst = row["flagged"][0]
        print(f"    {row['key']}: {row['flaggedCount']} paragraph(s), worst p{worst['paragraph']} "
              f"{worst['words']} words in {worst['seconds']}s = {worst['wordsPerSecond']} w/s", file=sys.stderr)


if __name__ == "__main__":
    main()
