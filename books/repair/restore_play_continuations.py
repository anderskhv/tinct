#!/usr/bin/env python3
"""Restore play speeches the original parser dropped.

The parser that built some play editions kept a speech only when its block
began with a speaker label (`MACBETH.`). A speech that continues after a stage
direction, without the label repeated, was silently dropped:

    MACBETH.
    Go bid thy mistress, when my drink is ready, ...
     [_Exit Servant._]
    Is this a dagger which I see before me,        <- dropped
    ...

This tool walks the Gutenberg source and the served original edition in step,
finds every continuation block missing from the edition, and restores it
verbatim from the source (never retyped), attributed to the last speaker:

  - after a stage direction: a NEW paragraph `SPEAKER. <text>`;
  - directly after the same speaker's speech (no direction between):
    APPENDED to that paragraph, like modern-en already does for Macbeth 1.5.

    python3 books/repair/restore_play_continuations.py macbeth books/raw/macbeth/raw.txt
    python3 books/repair/restore_play_continuations.py macbeth books/raw/macbeth/raw.txt --apply \
        --modern books/repair/macbeth-modern-inserts.json

Without --apply it only writes the plan. With --apply it rewrites
original-en (and modern-en when --modern is given), and writes the
old->new paragraph index map that saved positions, highlights and every
paragraph-keyed sidecar must be migrated with.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
EDITIONS = REPO / "app" / "public" / "data" / "editions"
HERE = Path(__file__).resolve().parent

SPEAKER = re.compile(r"^[A-Z][A-Z .,’'&-]*\.$")
HEADING = re.compile(r"^(ACT|SCENE) [IVXL]+\b")
WORDS = re.compile(r"[a-z’']+")


def words(text: str) -> list[str]:
    return WORDS.findall(text.lower().replace("_", ""))


def source_blocks(raw: str) -> list[dict]:
    """Blocks of the play body (after the contents list), classified."""
    raw = raw.replace("\r", "")
    start = raw.find("*** START")
    end = raw.find("*** END")
    body = raw[start:end]
    # The body proper starts at the second "ACT I" (the first is the contents list).
    first = body.find("\nACT I\n")
    second = body.find("\nACT I\n", first + 1)
    offset_line = raw[:start].count("\n") + body[:second].count("\n") + 1
    body = body[second:]
    blocks, line_no = [], offset_line
    for chunk in re.split(r"\n\s*\n", body):
        lines = [ln for ln in chunk.split("\n")]
        first_line = next((i for i, ln in enumerate(lines) if ln.strip()), None)
        if first_line is None:
            line_no += chunk.count("\n") + 2
            continue
        text_lines = [ln.rstrip() for ln in lines[first_line:] if ln.strip()]
        lead = text_lines[0]
        start_line = line_no + first_line
        if HEADING.match(lead.strip()):
            kind = "heading"
        elif lead.startswith(" "):
            kind = "direction"
        elif SPEAKER.match(lead.strip()):
            kind = "speech"
        else:
            kind = "continuation"
        blocks.append({"kind": kind, "lines": text_lines, "line": start_line})
        line_no += chunk.count("\n") + 2
    return blocks


def as_edition_text(block: dict, speaker: str | None) -> str:
    lines = [ln.strip() for ln in block["lines"]]
    if block["kind"] == "direction":
        text = " ".join(lines)
        text = re.sub(r"^\[_(.*)_\]$", r"\1", text)
        return f"[{text}]" if not text.startswith("[") else text
    if block["kind"] == "speech":
        return f"{lines[0]} {' '.join(lines[1:])}".strip()
    return f"{speaker} {' '.join(lines)}"


def plan(book: str, raw_path: Path) -> dict:
    edition = json.loads((EDITIONS / f"{book}-original-en.json").read_text())
    flat = [(c["number"], i, p) for c in edition["chapters"] for i, p in enumerate(c["paragraphs"])]
    flat_words = [words(p) for _, _, p in flat]
    blocks = source_blocks(raw_path.read_text(encoding="utf-8"))

    def find(target: list[str], cursor: int, window: int = 40) -> int | None:
        """Edition paragraph at/after cursor whose words start with target's."""
        probe = target[: min(len(target), 12)]
        for k in range(cursor, min(len(flat), cursor + window)):
            if flat_words[k][: len(probe)] == probe:
                return k
        return None

    def contained(target: list[str], k: int) -> bool:
        """Is `target` (a continuation) already inside edition paragraph k?"""
        joined = " ".join(flat_words[k])
        return " ".join(target[:12]) in joined

    inserts, cursor, last = [], 0, None  # last = (flat index, source block kind, speaker)
    speaker = None
    for block in blocks:
        if block["kind"] == "heading":
            continue
        if block["kind"] == "speech":
            speaker = block["lines"][0].strip()
        target = words(as_edition_text(block, speaker))
        if not target:
            continue
        if block["kind"] == "continuation":
            if last is not None and contained(words(" ".join(block["lines"])), last[0]):
                continue  # already merged into the previous paragraph
            k = find(target, cursor, window=3)
            if k is not None:
                cursor, last = k + 1, (k, block["kind"], speaker)
                continue
            after = flat[last[0]] if last else None
            mode = "append" if last and last[1] == "speech" else "insert"
            inserts.append({
                "id": f"{book}-{block['line']}",
                "mode": mode,
                "afterChapter": after[0],
                "afterIndex": after[1],
                "afterText": after[2][:80],
                "speaker": speaker,
                "sourceLine": block["line"],
                "words": len(words(" ".join(block["lines"]))),
                "text": " ".join(ln.strip() for ln in block["lines"]) if mode == "append"
                        else as_edition_text(block, speaker),
            })
            continue
        k = find(target, cursor)
        if k is None:
            continue  # heading-like or apparatus the edition omits on purpose
        cursor, last = k + 1, (k, block["kind"], speaker)
    return {
        "bookId": book,
        "source": str(raw_path.relative_to(REPO)) if raw_path.is_relative_to(REPO) else str(raw_path),
        "sourceSha256": hashlib.sha256(raw_path.read_bytes()).hexdigest(),
        "editionSha256": hashlib.sha256((EDITIONS / f"{book}-original-en.json").read_bytes()).hexdigest(),
        "inserts": inserts,
    }


def apply(book: str, the_plan: dict, modern_path: Path | None) -> dict:
    """Rewrite editions; return {chapter: {old: new}} for changed chapters."""
    modern_inserts = json.loads(modern_path.read_text())["inserts"] if modern_path else {}
    index_map: dict[str, dict[str, int]] = {}
    by_chapter: dict[int, list[dict]] = {}
    for ins in the_plan["inserts"]:
        by_chapter.setdefault(ins["afterChapter"], []).append(ins)

    for edition_key in ("original-en", "modern-en"):
        path = EDITIONS / f"{book}-{edition_key}.json"
        data = json.loads(path.read_text())
        for chapter in data["chapters"]:
            todo = by_chapter.get(chapter["number"])
            if not todo:
                continue
            paras = chapter["paragraphs"]
            out, mapping = [], {}
            for old, para in enumerate(paras):
                here = [ins for ins in todo if ins["afterIndex"] == old]
                for ins in here:
                    if ins["mode"] == "append" and edition_key == "original-en":
                        para = f"{para} {ins['text']}"
                    # modern-en: an append is expected to be present already
                    # (Macbeth 1.5) and is verified, not re-added.
                mapping[str(old)] = len(out)
                out.append(para)
                for ins in here:
                    if ins["mode"] != "insert":
                        continue
                    if edition_key == "original-en":
                        out.append(ins["text"])
                    else:
                        modern = modern_inserts.get(ins["id"])
                        if not modern:
                            raise SystemExit(f"missing modern-en text for {ins['id']}")
                        out.append(modern)
            chapter["paragraphs"] = out
            if edition_key == "original-en":
                index_map[str(chapter["number"])] = mapping
        # Match the served files byte-for-byte: 2-space indent, UTF-8, no trailing newline.
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    return index_map


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("book")
    ap.add_argument("source")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--modern", help="JSON {inserts: {id: modern paragraph}} for new paragraphs")
    args = ap.parse_args()
    the_plan = plan(args.book, Path(args.source).resolve())
    (HERE / f"{args.book}-restore-plan.json").write_text(json.dumps(the_plan, ensure_ascii=False, indent=1) + "\n")
    for ins in the_plan["inserts"]:
        print(f"{ins['mode']:6s} after ch{ins['afterChapter']}¶{ins['afterIndex']:<3d} "
              f"src line {ins['sourceLine']:<5d} {ins['words']:4d} words  {ins['text'][:70]}")
    print(f"{len(the_plan['inserts'])} continuations missing")
    if args.apply:
        index_map = apply(args.book, the_plan, Path(args.modern) if args.modern else None)
        (HERE / f"{args.book}-paragraph-map.json").write_text(json.dumps({
            "bookId": args.book,
            "note": "old->new 0-based paragraph index per chapter number, same for every edition; chapters not listed are unchanged",
            "beforeSha256": {"original-en": the_plan["editionSha256"]},
            "chapters": index_map,
        }, indent=1) + "\n")
        print("applied; paragraph map written")
    return 0


if __name__ == "__main__":
    sys.exit(main())
