"""Split chapters that lack timings into a processing queue and a repair queue.

The full missing-timing count is not the work queue. A chapter can lack timings
because nobody has aligned it yet — that is processable now — or because its
recording is absent, empty, or does not match the edition text, which cannot be
fixed by alignment at all and needs a recording repaired or regenerated.

Per chapter this establishes:

  text      the edition has this chapter, and how many paragraphs carry words
  mapping   the manifest's spoken paragraph count against the edition's
  audio     the sampled paragraph recordings exist and are not empty

and assigns one outcome:

  ready             alignment can run against this chapter today
  separator-gap     manifest omits exactly the paragraphs that carry no words
                    (scene rules, ornaments). Processable under the documented
                    narrow rule; recorded separately so it is never silent.
  repair:map        spoken-paragraph counts disagree — the recording does not
                    correspond to the text as published
  repair:audio      a sampled paragraph recording is missing or empty
  repair:text       the edition has no such chapter

Sampling is first/middle/last spoken paragraph by default: enough to catch a
chapter whose recordings never landed, not a guarantee that every paragraph is
sound. That limit is recorded in the output rather than glossed.

Read-only. No credentials.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import prodapi  # noqa: E402

_TOKEN = re.compile(r"[a-z0-9]+(?:['’-][a-z0-9]+)*")
MIN_PLAUSIBLE_MP3_BYTES = 512


def paragraph_texts(edition: dict, chapter_number: int) -> list[str] | None:
    for chapter in edition.get("chapters") or []:
        if chapter.get("number") == chapter_number:
            paragraphs = chapter.get("paragraphs")
            if isinstance(paragraphs, list):
                return [p if isinstance(p, str) else (p or {}).get("text", "") for p in paragraphs]
            return None
    return None


def assess(book_id: str, edition_key: str, chapter: int, edition_text: dict, samples: int) -> dict:
    row = {"bookId": book_id, "edition": edition_key, "chapter": chapter}

    texts = paragraph_texts(edition_text, chapter)
    if texts is None:
        return {**row, "outcome": "repair:text", "detail": "edition has no chapter with this number"}
    spoken_text = [i for i, t in enumerate(texts) if _TOKEN.findall(t.lower())]
    row["textParagraphs"] = len(texts)
    row["textParagraphsWithWords"] = len(spoken_text)

    status, manifest = prodapi.chapter_manifest(book_id, edition_key, chapter)
    if status != 200 or not manifest:
        return {**row, "outcome": "repair:audio", "detail": f"no chapter manifest (HTTP {status})"}
    entries = [e for e in (manifest.get("paragraphs") or [])
               if isinstance(e.get("paragraph"), int) and e["paragraph"] >= 0]
    row["manifestSpokenParagraphs"] = len(entries)
    row["durationSeconds"] = round(sum(e.get("duration") or 0 for e in entries), 2)

    if len(entries) == len(texts):
        outcome = "ready"
        detail = "manifest matches the edition paragraph count"
    elif len(entries) == len(spoken_text):
        outcome = "separator-gap"
        detail = (f"manifest covers the {len(spoken_text)} paragraphs that carry words; "
                  f"{len(texts) - len(spoken_text)} non-spoken paragraph(s) have no recording")
    else:
        return {**row, "outcome": "repair:map",
                "detail": f"manifest has {len(entries)} spoken paragraphs, edition has "
                          f"{len(texts)} ({len(spoken_text)} with words)"}

    # Sample recordings: first, last, and evenly spaced between.
    if entries:
        if samples >= len(entries):
            picked = entries
        else:
            step = (len(entries) - 1) / max(1, samples - 1)
            picked = [entries[round(i * step)] for i in range(samples)]
        checked = []
        for entry in picked:
            name = entry.get("file") or f"p{entry['paragraph']}.mp3"
            code, size = prodapi.audio_object_size(f"{book_id}/{edition_key}/ch{chapter}/{name}")
            checked.append({"file": name, "status": code, "bytes": size})
            if code not in (200, 206):
                return {**row, "outcome": "repair:audio",
                        "detail": f"{name} is not served (HTTP {code})", "sampled": checked}
            if (size or 0) < MIN_PLAUSIBLE_MP3_BYTES:
                return {**row, "outcome": "repair:audio",
                        "detail": f"{name} is {size} bytes — empty or truncated", "sampled": checked}
        row["sampled"] = checked
    return {**row, "outcome": outcome, "detail": detail}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--targets", required=True, help="JSON: [{bookId, edition, chapter}, ...]")
    parser.add_argument("--out", required=True)
    parser.add_argument("--samples", type=int, default=3, help="paragraph recordings sampled per chapter")
    parser.add_argument("--workers", type=int, default=12)
    args = parser.parse_args()

    targets = json.loads(Path(args.targets).read_text())
    editions: dict[tuple[str, str], dict] = {}
    for target in targets:
        key = (target["bookId"], target["edition"])
        if key not in editions:
            status, text = prodapi.edition_text(*key)
            editions[key] = text if status == 200 and text else {}

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(assess, t["bookId"], t["edition"], int(t["chapter"]),
                               editions[(t["bookId"], t["edition"])], args.samples)
                   for t in targets]
        for done, future in enumerate(concurrent.futures.as_completed(futures), 1):
            results.append(future.result())
            if done % 200 == 0:
                print(f"  assessed {done}/{len(targets)}", file=sys.stderr, flush=True)

    results.sort(key=lambda r: (r["bookId"], r["edition"], r["chapter"]))
    Path(args.out).write_text(json.dumps(
        {"sampledParagraphsPerChapter": args.samples, "results": results}, indent=1))

    from collections import Counter
    counts = Counter(r["outcome"] for r in results)
    total_hours = lambda pred: round(sum(r.get("durationSeconds") or 0 for r in results if pred(r)) / 3600, 1)
    print(f"assessed {len(results)} chapters that lack timings")
    for outcome, count in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {outcome:16} {count:5}   {total_hours(lambda r: r['outcome'] == outcome):7} audio hours")
    processable = [r for r in results if r["outcome"] in ("ready", "separator-gap")]
    print(f"\nPROCESSING QUEUE {len(processable)} chapters, "
          f"{total_hours(lambda r: r['outcome'] in ('ready', 'separator-gap'))} audio hours")
    print(f"REPAIR QUEUE     {len(results) - len(processable)} chapters, "
          f"{total_hours(lambda r: r['outcome'].startswith('repair'))} audio hours")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
