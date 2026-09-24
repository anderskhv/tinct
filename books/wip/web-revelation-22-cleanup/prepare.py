#!/usr/bin/env python3
"""Prepare the WEB Revelation 22 boilerplate cleanup (content-only).

Reads the live web-en edition and its chapter shard READ-ONLY, verifies their
pinned hashes, proves the appended text is exactly the Project Gutenberg
trailer of eBook #8294, removes only that trailer, and writes candidate bytes
plus mapping and impact records into ./out. Live files are never written.

Usage: python3 prepare.py --gutenberg-txt PATH   (pg8294.txt, pinned below)
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"
REPO = HERE.parents[2]
LIVE_EDITION = REPO / "app/public/data/editions/bible-web-en.json"
LIVE_SHARD = REPO / "app/public/data/editions-chapters/bible-web-en/ch1189.json"
LIVE_CHARACTERS = REPO / "app/public/data/characters/bible.v1.json"

PIN = {
    "edition": "46d206635dc79214cb29a8b27f392f3d4a5f856bdedb3441315973f542c4eeae",
    "gutenberg": "abf7c2da851fc68e770a5f88d3dcea650115c0daa0f0a56f54418d282d4afe7d",
}
CHAPTER, PARA = 1189, 4
END_MARKER = "*** END OF THE PROJECT GUTENBERG EBOOK THE WORLD ENGLISH BIBLE (WEB), COMPLETE ***"
SUP = str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹")


def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def u16(s: str) -> int:
    return len(s.encode("utf-16-le")) // 2


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def fail(msg):
    sys.exit(f"FAIL: {msg}")


def gutenberg_rev22(text: str) -> tuple[dict[int, str], str]:
    head = text[:2000]
    if "Title: The World English Bible (WEB), Complete" not in head or "[eBook #8294]" not in text[:3000]:
        fail("Gutenberg header does not identify eBook #8294, The World English Bible (WEB), Complete")
    end = text.index(END_MARKER)
    body, trailer = text[:end], text[end:]
    start = body.rindex("022:001 ")
    verses = {}
    for m in re.finditer(r"022:(\d{3}) (.*?)(?=\n022:\d{3} |\Z)", body[start:], re.S):
        raw = norm(m.group(2))
        # The Gutenberg file carries inline {...} apparatus (textual variants,
        # cross references); the live web-en import removed them.
        verses[int(m.group(1))] = (norm(re.sub(r"\{[^}]*\}", " ", raw)).replace(" ,", ",").replace(" .", "."), re.findall(r"\{[^}]*\}", raw))
    return verses, trailer


def verse_spans(para: str) -> list[tuple[int, int, int, int]]:
    """(verse, labelStart, textStart, textEnd) in UTF-16 units."""
    out = []
    marks = list(re.finditer(r"(?:^| )([⁰¹²³⁴⁵⁶⁷⁸⁹]+) ", para))
    back = str.maketrans("⁰¹²³⁴⁵⁶⁷⁸⁹", "0123456789")
    for i, m in enumerate(marks):
        text_start = m.end()
        text_end = marks[i + 1].start() if i + 1 < len(marks) else len(para)
        label_start = m.start(1)
        out.append((int(m.group(1).translate(back)), u16(para[:label_start]), u16(para[:text_start]), u16(para[:text_end])))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gutenberg-txt", required=True)
    args = ap.parse_args()

    ed_bytes, shard_bytes = LIVE_EDITION.read_bytes(), LIVE_SHARD.read_bytes()
    g_bytes = Path(args.gutenberg_txt).read_bytes()
    if sha(ed_bytes) != PIN["edition"]:
        fail(f"live edition hash {sha(ed_bytes)} is not the pinned baseline; re-review before changing anything")
    if sha(g_bytes) != PIN["gutenberg"]:
        fail("Gutenberg text differs from the pinned download")
    ed = json.loads(ed_bytes)
    shard = json.loads(shard_bytes)
    ch = ed["chapters"][CHAPTER - 1]
    if ch["number"] != CHAPTER or ch["title"] != "Revelation 22" or shard != ch:
        fail("chapter 1189 is not Revelation 22 or the shard differs from the edition")

    old = ch["paragraphs"][PARA]
    g_verses, g_trailer = gutenberg_rev22(g_bytes.decode("utf-8-sig"))
    if sorted(g_verses) != list(range(1, 22)):
        fail(f"Gutenberg Revelation 22 verses {sorted(g_verses)}")

    # The cut point: end of verse 21 text, immediately followed by the marker.
    if old.count(END_MARKER) != 1:
        fail("END marker is not unique in the paragraph")
    cut = old.index(" " + END_MARKER)
    kept, removed = old[:cut], old[cut + 1:]
    if not kept.endswith("be with all the saints. Amen."):
        fail("kept text does not end at the close of verse 21")
    if norm(removed) != norm(g_trailer):
        fail("removed text is not exactly the Gutenberg #8294 trailer (normalised whitespace)")
    if any(ord(c) in (0x2070, 0x00B9, 0x00B2, 0x00B3) or 0x2074 <= ord(c) <= 0x2079 for c in removed):
        fail("removed text contains a verse label")

    new_ch = dict(ch, paragraphs=list(ch["paragraphs"]))
    new_ch["paragraphs"][PARA] = kept

    # Every verse in the chapter, baseline and candidate, against Gutenberg.
    mapping, seen = [], set()
    for pi, para in enumerate(new_ch["paragraphs"]):
        base_para = ch["paragraphs"][pi]
        for (v, ls, ts, te), base in zip(verse_spans(para), verse_spans(base_para)):
            if pi == PARA and v == 21:
                # Baseline verse 21 "ends" at the paragraph end, inside the trailer.
                base = (base[0], base[1], base[2], u16(kept))
            if (v, ls, ts, te) != base:
                fail(f"verse {v} span moved: {base} -> {(v, ls, ts, te)}")
            text = para.encode("utf-16-le")[ts * 2:te * 2].decode("utf-16-le")
            if norm(text) != g_verses[v][0]:
                fail(f"verse {v} wording differs from Gutenberg: {text!r} vs {g_verses[v][0]!r}")
            seen.add(v)
            mapping.append({"ref": f"REV.22.{v}", "chapterNumber": CHAPTER, "paragraphIndex": pi,
                            "labelStart": ls, "start": ts, "end": te, "unchangedFromBaseline": True,
                            "textSha256": sha(text.encode("utf-8")),
                            "gutenbergApparatusNotStaged": g_verses[v][1]})
    if seen != set(range(1, 22)) or len(mapping) != 21:
        fail(f"verses found {sorted(seen)}")

    # Candidate bytes: replace the one encoded string, then prove equivalence.
    old_enc, new_enc = json.dumps(old, ensure_ascii=False).encode(), json.dumps(kept, ensure_ascii=False).encode()
    for name, raw in (("edition", ed_bytes), ("shard", shard_bytes)):
        if raw.count(old_enc) != 1:
            fail(f"{name}: paragraph encoding is not unique")
    cand_ed = ed_bytes.replace(old_enc, new_enc)
    cand_shard = shard_bytes.replace(old_enc, new_enc)
    exp = json.loads(ed_bytes)
    exp["chapters"][CHAPTER - 1]["paragraphs"][PARA] = kept
    if json.loads(cand_ed) != exp or json.loads(cand_shard) != exp["chapters"][CHAPTER - 1]:
        fail("candidate differs from baseline beyond the one paragraph")
    if (json.dumps(exp, ensure_ascii=False, indent=2) + "\n").encode() not in (cand_ed, cand_ed + b"\n") and \
            json.dumps(exp, ensure_ascii=False, indent=2).encode() != cand_ed:
        fail("candidate edition is not in the baseline serialisation")
    if (json.dumps(exp["chapters"][CHAPTER - 1], ensure_ascii=False, separators=(",", ":")) + "\n").encode() != cand_shard:
        fail("candidate shard is not in the baseline shard serialisation")

    # Character-card impact.
    chars = json.loads(LIVE_CHARACTERS.read_bytes())["editions"]["web-en"]
    if chars["sourceSha256"] != PIN["edition"]:
        fail("character data is not pinned to the baseline edition")
    old_hashes = chars["paragraphHashes"][str(CHAPTER)]
    if old_hashes[PARA] != sha(old.encode("utf-8")):
        fail("character paragraph hash convention differs (expected sha256 of UTF-8 paragraph)")
    mentions = [m for m in chars["mentions"] if m["chapterNumber"] == CHAPTER]
    for m in mentions:
        p = new_ch["paragraphs"][m["paragraphIndex"]].encode("utf-16-le")
        if p[m["startOffset"] * 2:m["endOffset"] * 2].decode("utf-16-le") != m["text"]:
            fail(f"mention no longer resolves: {m}")

    OUT.mkdir(exist_ok=True)
    (OUT / "bible-web-en.candidate.json").write_bytes(cand_ed)
    (OUT / "ch1189.candidate.json").write_bytes(cand_shard)
    (OUT / "baseline-ch1189.json").write_bytes(shard_bytes)
    (OUT / "removed-text.txt").write_text(removed, encoding="utf-8")
    record = {
        "scope": "Remove the Project Gutenberg #8294 trailer appended to web-en Revelation 22 paragraph 4. No other byte changes.",
        "baseline": {"edition": {"path": "app/public/data/editions/bible-web-en.json", "sha256": sha(ed_bytes), "bytes": len(ed_bytes)},
                     "shard": {"path": "app/public/data/editions-chapters/bible-web-en/ch1189.json", "sha256": sha(shard_bytes), "bytes": len(shard_bytes)}},
        "candidate": {"edition": {"file": "out/bible-web-en.candidate.json", "sha256": sha(cand_ed), "bytes": len(cand_ed)},
                      "shard": {"file": "out/ch1189.candidate.json", "sha256": sha(cand_shard), "bytes": len(cand_shard)}},
        "source": {"gutenberg": {"ebook": 8294, "title": "The World English Bible (WEB), Complete",
                                 "url": "https://www.gutenberg.org/cache/epub/8294/pg8294.txt", "sha256": PIN["gutenberg"]}},
        "change": {
            "chapterNumber": CHAPTER, "title": "Revelation 22", "paragraphIndex": PARA,
            "oldParagraph": {"sha256": sha(old.encode()), "utf16Length": u16(old), "chars": len(old)},
            "newParagraph": {"sha256": sha(kept.encode()), "utf16Length": u16(kept), "chars": len(kept), "text": kept},
            "removed": {"utf16Start": u16(kept), "utf16End": u16(old), "sha256": sha(removed.encode()), "chars": len(removed),
                        "file": "out/removed-text.txt",
                        "rule": "the single separator space and everything from the Gutenberg END marker to the end of the paragraph"},
            "paragraphsInChapter": len(ch["paragraphs"]), "paragraphCountChanged": False,
            "otherParagraphsChanged": 0,
        },
        "verseMapping": mapping,
        "characterCards": {
            "file": "app/public/data/characters/bible.v1.json", "edition": "web-en",
            "sourceSha256": {"old": PIN["edition"], "new": sha(cand_ed)},
            "paragraphHash": {"chapter": CHAPTER, "paragraphIndex": PARA, "old": old_hashes[PARA], "new": sha(kept.encode())},
            "mentionsInChapter": mentions, "mentionsNeedingOffsetChange": 0,
        },
    }
    (OUT / "change-record.json").write_text(json.dumps(record, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(json.dumps({k: record[k] for k in ("baseline", "candidate")}, indent=1))
    print("removed chars", len(removed), "kept tail:", kept[-70:])


if __name__ == "__main__":
    main()
