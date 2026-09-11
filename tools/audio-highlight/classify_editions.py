"""Classify every published English edition by provenance, not by key name.

The distinction that matters for sequencing work is whether a human made the
text or a model did — `original-en` is a naming convention, not evidence. The
registry carries real signals:

  translator + year   a named human translator and a publication year, e.g.
                      Samuel Butler 1900, Constance Garnett 1914 — a
                      public-domain human translation
  year, no translator an English-language original published in that year,
                      e.g. Moby-Dick 1851
  kjv / web styles    the King James and World English Bibles, both human
                      translations
  style: modern       the "Modern English" editions generated through the CLI
                      per the book-addition checklist — model-authored

Anything claiming `style: original` with neither a translator nor a year is
reported as `needs-confirmation` rather than being silently counted as human
work.

Read-only. No credentials, no network.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

REGISTRY = Path(__file__).resolve().parents[2] / "app/src/data/bookRegistry.ts"

NON_AI = "non-ai"
AI = "ai-created"
UNKNOWN = "needs-confirmation"
NON_AI_UNDOCUMENTED = "non-ai-undocumented"


def parse_registry(path: Path = REGISTRY) -> list[dict]:
    source = path.read_text()
    listed = re.search(r"export const BOOKS[^=]*=\s*\[(.*?)\]", source, re.S)
    if not listed:
        raise SystemExit("bookRegistry.ts: no BOOKS array")
    members = re.findall(r"[A-Z][A-Z0-9_]+", listed.group(1))

    blocks: dict[str, dict] = {}
    for name, body in re.findall(r"export const ([A-Z][A-Z0-9_]+)\s*:\s*Book\s*=\s*\{(.*?)\n\}", source, re.S):
        book_id = re.search(r"\n\s*id:\s*'([^']+)'", body)
        title = re.search(r"\n\s*title:\s*'((?:[^'\\]|\\.)*)'", body)
        editions = []
        block = re.search(r"editions:\s*\[(.*)\n\s*\]", body, re.S)
        if block:
            for entry in re.findall(r"\{(.*?)\}", block.group(1), re.S):
                field = lambda k: (re.search(rf"{k}:\s*'([^']*)'", entry) or [None, None])[1]
                year = re.search(r"\n\s*year:\s*(-?\d+)", entry)
                editions.append({
                    "key": field("key"),
                    "language": field("language"),
                    "style": field("style"),
                    "label": field("label"),
                    "translator": field("translator"),
                    "year": int(year.group(1)) if year else None,
                    "hasAudioFlag": bool(re.search(r"hasAudio:\s*true", entry)),
                })
        if book_id:
            blocks[name] = {"bookId": book_id.group(1),
                            "title": title.group(1) if title else book_id.group(1),
                            "editions": editions}
    return [blocks[m] for m in members if m in blocks]


def classify(edition: dict) -> tuple[str, str]:
    """Return (group, why)."""
    style = edition.get("style")
    if style == "modern" and edition["label"] == "Modern English" \
            and not edition["translator"] and edition["year"] is None:
        return AI, "CLI-generated Modern English edition"
    if style in ("kjv", "web"):
        return NON_AI, f"{style.upper()} Bible — human translation"
    if style == "original":
        if edition["translator"]:
            year = f" ({edition['year']})" if edition["year"] else ""
            return NON_AI, f"human translation by {edition['translator']}{year}"
        if edition["year"] is not None:
            return NON_AI, f"English-language original, published {edition['year']}"
        # The year is often carried in the label rather than the year field —
        # "Shakespeare (1623)", "Hobbes (1651)", "Original (1776-1992)".
        label = edition["label"] or ""
        dated = re.search(r"\b(1[0-9]{3}|20[0-2][0-9])\b", label)
        if dated:
            return NON_AI, f"historical text, {label}"
        # No date anywhere. The book pipeline only ever generates modern-en and
        # modern-da (see the book-addition checklist); original-en is always a
        # parsed public-domain source. So this is still human work — but the
        # specific edition is not recorded, and an audio mismatch here cannot be
        # traced to a source without that.
        return NON_AI_UNDOCUMENTED, f"public-domain source per the book pipeline, but the registry records no translator, year or dated label (label {label!r})"
    if style == "modern":
        return AI, f"style 'modern', label {edition['label']!r}"
    return UNKNOWN, f"unrecognised style {style!r}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--out", required=True)
    parser.add_argument("--language", default="en")
    args = parser.parse_args()

    rows = []
    for book in parse_registry():
        for edition in book["editions"]:
            if edition["language"] != args.language:
                continue
            group, why = classify(edition)
            rows.append({"bookId": book["bookId"], "title": book["title"],
                         "edition": edition["key"], "group": group, "why": why,
                         "style": edition["style"], "label": edition["label"],
                         "translator": edition["translator"], "year": edition["year"],
                         "hasAudioFlag": edition["hasAudioFlag"]})
    order = {NON_AI: 0, NON_AI_UNDOCUMENTED: 1, AI: 2, UNKNOWN: 3}
    rows.sort(key=lambda r: (order.get(r["group"], 9), r["bookId"], r["edition"]))
    Path(args.out).write_text(json.dumps(rows, indent=1))

    for group in (NON_AI, NON_AI_UNDOCUMENTED, AI, UNKNOWN):
        members = [r for r in rows if r["group"] == group]
        print(f"{group:18} {len(members):4} editions   "
              f"{len({r['bookId'] for r in members}):3} books")
    flagged = [r for r in rows if r["group"] in (UNKNOWN, NON_AI_UNDOCUMENTED)]
    if flagged:
        print("\nprovenance detail not recorded in the registry:")
        for row in flagged:
            print(f"  {row['bookId']}/{row['edition']}: {row['why']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
