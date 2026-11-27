#!/usr/bin/env python3
"""Re-anchor the Bible character package after the WEB Romans 14 verse-number repair.

Approved by Anders on 27 Nov 2026 (books/wip/romans-14-verse-numbers/HANDOFF.md).
The World English Bible numbers the doxology at the end of Romans 14 as verses
24-26. The edition wrote those numbers as text, "(14:24)", "(14:25)", "(14:26)";
they are now the edition's own superscript verse numbers. One paragraph changes
(chapter 1060, paragraph 4): three whitespace words are replaced one for one, so
word indexes are unchanged, and each replacement is five UTF-16 units shorter.

The character package pins the exact bytes of the edition file (`sourceSha256`),
the hash of every paragraph and the UTF-16 offsets of every link, so the web-en
slice is re-anchored here by exact projection: the six links after the first
number move left by 5, 10 or 15; nothing else in the package changes.

    python3 app/scripts/reanchor-bible-web-romans-14.py           re-anchor and write
    python3 app/scripts/reanchor-bible-web-romans-14.py --check   verify the committed result

Then: python3 app/scripts/split-bible-characters.py (writes the four sidecars).
"""
import gzip
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EDITION = ROOT / "app/public/data/editions/bible-web-en.json"
PKG = ROOT / "books/wip/bible-characters-full/package"

EDITION_KEY = "web-en"
CHAPTER, PARAGRAPH = 1060, 4
BEFORE_SHA = "b0f491656782257e7b20f4a80add615cb363b8f324e54a4c1c457648328762aa"
AFTER_SHA = "884892a850e2969989655fae0f9a8262c5e792433659d5f5504ef7f68f46c5c2"
PARAGRAPH_BEFORE_SHA = "4d1b5c0fca097dc1dfd36fe32d690c88de3f92b02cf3aebf551b80f852ff4c1d"
PARAGRAPH_AFTER_SHA = "b28a9251b5a8588ee1abc4246dd4f39343581a363476ad6a85e8889645d1fe4d"
REPLACEMENTS = (("(14:24)", "²⁴"), ("(14:25)", "²⁵"), ("(14:26)", "²⁶"))
PREVIOUS_VERSION = "2026-10-21.1"
VERSION = "2026-11-27.1"


def sha(data) -> str:
    return hashlib.sha256(data if isinstance(data, bytes) else data.encode("utf-8")).hexdigest()


def compact(value) -> bytes:
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def utf16(text: str) -> int:
    return len(text.encode("utf-16-le")) // 2


def normalize(text: str) -> str:
    """normalizeParagraph in app/src/services/characters/characterCards.ts."""
    text = text.replace("\n", " ")
    while "  " in text:
        text = text.replace("  ", " ")
    return text


def main() -> int:
    check = "--check" in sys.argv
    edition_raw = EDITION.read_bytes()
    if sha(edition_raw) != AFTER_SHA:
        raise SystemExit("bible-web-en.json is not the accepted repaired text")
    after = normalize(json.loads(edition_raw)["chapters"][CHAPTER - 1]["paragraphs"][PARAGRAPH])
    assert json.loads(edition_raw)["chapters"][CHAPTER - 1]["number"] == CHAPTER
    assert sha(after) == PARAGRAPH_AFTER_SHA

    # The old paragraph, rebuilt from the new one, and where each old marker sat (UTF-16 units).
    before, spans = after, []
    for old, new in REPLACEMENTS:
        assert before.count(new + " ") == 1 and old not in before
        at = utf16(before[: before.index(new + " ")])
        before = before.replace(new + " ", old + " ")
        spans.append((at, at + utf16(old), utf16(old) - utf16(new)))
    assert sha(before) == PARAGRAPH_BEFORE_SHA
    # One word for one word: the reader's word indexes are unchanged.
    assert len(before.split()) == len(after.split())

    def project(offset: int) -> int:
        shift = 0
        for start, end, shrink in spans:
            if offset >= end:
                shift += shrink
            elif offset > start:
                raise SystemExit(f"offset {offset} lies inside a replaced verse number")
        return offset - shift

    canonical = (PKG / "bible.v1.json").read_bytes()
    manifest = json.loads((PKG / "MANIFEST.json").read_text("utf-8"))
    asset = json.loads(canonical.decode("utf-8"))
    piece = asset["editions"][EDITION_KEY]

    if piece["sourceSha256"] == AFTER_SHA:
        # Already re-anchored: verify, never rewrite.
        assert asset["contentVersion"] == VERSION == manifest["contentVersion"]
        assert sha(canonical) == manifest["sha256"] and len(canonical) == manifest["bytes"]
        assert sha(compact(piece)) == manifest["editionSlices"]["sha256"][EDITION_KEY]
        assert manifest["perEdition"][EDITION_KEY]["sourceSha256"] == AFTER_SHA
        assert piece["paragraphHashes"][str(CHAPTER)][PARAGRAPH] == PARAGRAPH_AFTER_SHA
        for m in piece["mentions"]:
            if m["chapterNumber"] == CHAPTER and m["paragraphIndex"] == PARAGRAPH:
                unit = after.encode("utf-16-le")[m["startOffset"] * 2 : m["endOffset"] * 2].decode("utf-16-le")
                assert unit == m["text"], m
        print("already re-anchored: package, manifest and Romans 14 links verified")
        return 0
    if check:
        raise SystemExit("the character package is not re-anchored to the repaired text")

    assert sha(canonical) == manifest["sha256"]
    assert asset["contentVersion"] == PREVIOUS_VERSION
    assert piece["sourceSha256"] == BEFORE_SHA
    assert piece["paragraphHashes"][str(CHAPTER)][PARAGRAPH] == PARAGRAPH_BEFORE_SHA
    other_slices = {key: sha(compact(value)) for key, value in asset["editions"].items() if key != EDITION_KEY}

    moved = []
    for m in piece["mentions"]:
        if m["chapterNumber"] != CHAPTER or m["paragraphIndex"] != PARAGRAPH:
            continue
        old_unit = before.encode("utf-16-le")[m["startOffset"] * 2 : m["endOffset"] * 2].decode("utf-16-le")
        assert old_unit == m["text"], m
        start, end = project(m["startOffset"]), project(m["endOffset"])
        new_unit = after.encode("utf-16-le")[start * 2 : end * 2].decode("utf-16-le")
        assert new_unit == m["text"] and end - start == m["endOffset"] - m["startOffset"], m
        if start != m["startOffset"]:
            moved.append((m["characterId"], m["text"], m["startOffset"], start))
        m["startOffset"], m["endOffset"] = start, end

    # Reveal points (first mention, role, snapshots) are offsets too.
    points = 0
    for character in piece["characters"]:
        for point in [character["firstMention"], character["roleVisibleAt"], *[s["availableAt"] for s in character["snapshots"]]]:
            if point["chapterNumber"] == CHAPTER and point["paragraphIndex"] == PARAGRAPH:
                point["offset"] = project(point["offset"])
                points += 1

    piece["sourceSha256"] = AFTER_SHA
    piece["paragraphHashes"][str(CHAPTER)][PARAGRAPH] = PARAGRAPH_AFTER_SHA
    asset["contentVersion"] = VERSION
    for key, value in asset["editions"].items():
        if key != EDITION_KEY:
            assert sha(compact(value)) == other_slices[key] == manifest["editionSlices"]["sha256"][key]

    out = compact(asset)
    manifest["bytes"] = len(out)
    manifest["sha256"] = sha(out)
    manifest["contentVersion"] = VERSION
    manifest["editionSlices"]["sha256"][EDITION_KEY] = sha(compact(piece))
    manifest["perEdition"][EDITION_KEY]["sourceSha256"] = AFTER_SHA
    manifest["gzipBytesApprox"] = len(gzip.compress(out, 9))
    assert manifest["perEdition"][EDITION_KEY]["mentions"] == len(piece["mentions"])
    (PKG / "bible.v1.json").write_bytes(out)
    (PKG / "MANIFEST.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n", "utf-8")
    print(f"package {manifest['sha256']} {len(out)} bytes, contentVersion {VERSION}")
    print(f"web-en slice {manifest['editionSlices']['sha256'][EDITION_KEY]}")
    print(f"links moved in Romans 14, paragraph {PARAGRAPH}: {len(moved)}; reveal points moved: {points}")
    for row in moved:
        print("  %s %r %d -> %d" % row)
    return 0


sys.exit(main())
