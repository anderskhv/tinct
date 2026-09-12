#!/usr/bin/env python3
"""Recover verse lineation for Shakespeare editions as a render-time sidecar.

The served edition JSON is NEVER modified. Character-card packages, audio
word-highlight sidecars and stored paragraph positions all anchor to the
served bytes, so this tool only records WHERE the line breaks fall:

    app/public/data/editions/{bookId}-lines.json

Each entry is a list of character offsets into the served paragraph. Splitting
the paragraph at those offsets and rejoining the pieces with a single space
reproduces the served paragraph byte for byte -- asserted here for every
paragraph emitted, and re-asserted by the app's test suite.

Lines come from the Project Gutenberg source text that the served edition was
transcribed from; never from a model.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from typing import NamedTuple
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
EDITIONS = REPO / "app" / "public" / "data" / "editions"

# A source line that is only a speaker name: the served edition keeps it inline
# with the speech's first line, so no break is recorded after it.
SPEAKER_LABEL = re.compile(r"^[^a-z]+$")


def source_lines(text: str) -> list[str]:
    """Body lines of a Gutenberg play, whitespace-trimmed, blanks dropped.

    Deliberately RAW: `_..._` emphasis markup and Gutenberg's own bracketing
    are left alone here. The served editions normalise both, differently
    (Macbeth keeps emphasis inside speeches, Hamlet drops it everywhere), but
    the prose/verse test below has to measure the line at the width the
    Gutenberg typesetter wrapped it at, markup included -- normalising first
    shortens lines and turns wrapped prose into false verse.
    """
    body = text.replace("\r\n", "\n")
    start = body.index("*** START OF THE PROJECT GUTENBERG EBOOK")
    start = body.index("\n", start) + 1
    end = body.index("*** END OF THE PROJECT GUTENBERG EBOOK")
    out = []
    for raw in body[start:end].split("\n"):
        line = raw.strip()
        if line:
            out.append(line)
    return out


class Line(NamedTuple):
    """One source line in both shapes that matter."""

    raw: str
    """As Gutenberg set it -- the width its wrapping was measured at."""
    served: str
    """As the served edition prints it -- what the offsets are counted in."""


def as_direction(text: str) -> str:
    """A stage direction reduced to the shape both files agree on.

    Gutenberg prints entrances unbracketed and italicised (` Enter Ross and
    Angus.`, ` [_Exeunt._]`); the served editions bracket every standalone
    direction, drop the italics, and -- in Hamlet -- drop the full stop
    (`[Enter Ghost]`). Directions are single sentences, never verse, so this
    only has to keep the paragraph stream in sync: it never yields a break.
    """
    inner = text.replace("_", "").strip()
    if inner.startswith("["):
        inner = inner[1:]
    if inner.endswith("]"):
        inner = inner[:-1]
    return "[" + inner.strip().rstrip(".") + "]"


def is_direction(text: str) -> bool:
    return text.startswith("[") and text.endswith("]")


def match_direction(served: str, lines: list[str], start: int) -> list[Line] | None:
    """Match a standalone stage direction, which may wrap across source lines."""
    target = as_direction(served)
    used: list[Line] = []
    acc = ""
    i = start
    while i < len(lines) and len(used) < 10:
        acc = lines[i] if not acc else acc + " " + lines[i]
        used.append(Line(lines[i], lines[i]))
        i += 1
        candidate = as_direction(acc)
        if candidate == target:
            return used
        if not target.startswith(candidate[:-1]):
            return None
    return None


def match_from(served: str, lines: list[str], start: int, plain: bool) -> list[Line] | None:
    """Greedily consume source lines from `start`, joined by one space.

    Returns the consumed lines only on an exact, complete match of `served`.
    Any divergence -- a line that is not the next prefix, or running out of
    text -- returns None rather than a guess.
    """
    used: list[Line] = []
    acc = ""
    i = start
    while i < len(lines) and len(acc) < len(served):
        raw = lines[i]
        forms = [raw]
        if plain and "_" in raw:
            # Hamlet's served edition drops Gutenberg's emphasis markup.
            forms.append(raw.replace("_", ""))
        # Gutenberg drops the full stop after a handful of speaker names
        # ("BARNARDO\nIt would be spoke to."); the served editions always
        # print one. Restoring it is confined to the label line.
        if not used and SPEAKER_LABEL.match(raw) and not raw.endswith("."):
            forms.append(raw + ".")
        # A direction set on its own line inside a speech ("[_Sings._]",
        # "[_The cock crows._]") is sometimes reprinted by the served edition
        # in its normalised shape and sometimes dropped. Take whichever the
        # served text actually shows; a dropped one simply closes up, and the
        # verse lines around it stay separate lines.
        direction = is_direction(raw.replace("_", ""))
        if direction:
            forms.append(as_direction(raw))
        chosen = None
        for form in forms:
            cand = form if not acc else acc + " " + form
            if served.startswith(cand):
                chosen = (form, cand)
                break
        if chosen is None:
            if direction:
                i += 1  # the served edition dropped this direction
                continue
            return None
        acc = chosen[1]
        used.append(Line(raw, chosen[0]))
        i += 1
        if acc == served:
            return used
    return used if acc == served else None


# Gutenberg sets PROSE speeches as a paragraph hard-wrapped to a fixed column.
# Those wraps are typography, not lineation, and must never become line breaks
# -- Shakespeare mixes verse and prose deliberately, and Hamlet's "What a piece
# of work is a man" is prose.
#
# 71 is not a guess. Greedily re-wrapping a known prose speech's own words
# reproduces its source lines EXACTLY at 71 characters and at no other width;
# checked independently against the Porter's speech (Macbeth II.iii) and
# Hamlet's "What a piece of work" (II.ii), in both files. A few blocks sit one
# column wider (Hamlet's "God's bodikin, man" reproduces only at 72), so both
# are tried -- each still has to reproduce the block exactly, which verse
# cannot do at any width.
WRAP_COLUMNS = (71, 72)

# A kept break preceded by a line at least this long is worth a human look:
# below it, no greedy wrap at the source's width could have produced it.
SUSPECT_LINE = 62


def greedy_wrap(text: str, width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split(" "):
        candidate = word if not current else current + " " + word
        if current and len(candidate) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def is_wrapped_prose(run: list[str]) -> bool:
    """True when `run` is exactly what re-wrapping its own words produces.

    This is the discriminator between prose and verse, and it proves itself:
    a prose speech's line division is entirely determined by the wrap width,
    so re-deriving it reproduces the source byte for byte. Verse lineation is
    chosen by the poet and a greedy wrapper cannot reproduce it -- a metrical
    line runs ~40 characters and would have taken the next line's first word.
    """
    if len(run) < 2:
        return False
    return any(greedy_wrap(" ".join(run), width) == run for width in WRAP_COLUMNS)


def prose_runs(body: list[str]) -> list[tuple[int, int]]:
    """Maximal [start, end) spans of `body` that are wrapped prose.

    A single speech can be both: Polonius reads a verse quatrain out of a
    prose letter, Hamlet quotes twenty lines of verse in the middle of a
    prose speech to the players. Classifying the whole paragraph one way or
    the other breaks one half of it, so each run is tested on its own, taking
    the longest exact wrap at each position. Ties go to prose: a missed verse
    break reads exactly as the book does today, an invented break inside
    prose is the visible defect this change exists to remove.
    """
    runs: list[tuple[int, int]] = []
    start = 0
    while start < len(body):
        best = 0
        for end in range(len(body), start + 1, -1):
            if is_wrapped_prose(body[start:end]):
                best = end
                break
        if best:
            runs.append((start, best))
            start = best
        else:
            start += 1
    return runs


def speaker_labels(lines: list[str]) -> set[str]:
    """Every speaker name the source sets on a line of its own."""
    return {line for line in lines if SPEAKER_LABEL.match(line) and line.endswith(".")}


def served_label(text: str, labels: set[str]) -> str | None:
    """The speaker label a served paragraph opens with, if any."""
    head = text.split(" ", 3)
    for take in (3, 2, 1):
        candidate = " ".join(head[:take])
        if candidate in labels and len(text) > len(candidate) + 1:
            return candidate
    return None


def speech_body(used: list[Line]) -> list[Line]:
    """The speech without its speaker label.

    The label is its own source line but stays inline in the served paragraph,
    so it never earns a break and never joins the prose test.
    """
    return used[1:] if used and SPEAKER_LABEL.match(used[0].raw) else used


def breaks_for(served: str, used: list[Line], shift: int = 0) -> list[int]:
    """Offsets into `served` where a new verse line begins."""
    body = speech_body(used)
    if len(body) < 2:
        return []
    wrapped = set()
    for start, end in prose_runs([line.raw for line in body]):
        wrapped.update(range(start, end - 1))  # breaks INSIDE a prose run
    offsets = []
    cursor = shift + sum(len(line.served) + 1 for line in used[: len(used) - len(body)])
    for index, line in enumerate(body[:-1]):
        cursor += len(line.served)
        if index not in wrapped:
            offsets.append(cursor + 1)  # skip the joining space
        cursor += 1
    return offsets


def verify(served: str, offsets: list[int]) -> None:
    """Splitting at `offsets` and rejoining with spaces must be a no-op."""
    pieces = []
    prev = 0
    for off in offsets:
        pieces.append(served[prev : off - 1])
        prev = off
    pieces.append(served[prev:])
    rebuilt = " ".join(pieces)
    if rebuilt != served:
        raise AssertionError(f"round-trip failed: {served!r} != {rebuilt!r}")
    for piece in pieces:
        if not piece or piece != piece.strip():
            raise AssertionError(f"bad line piece {piece!r} in {served!r}")


def build(book_id: str, source: Path, resync: int) -> dict:
    edition = EDITIONS / f"{book_id}-original-en.json"
    served = json.loads(edition.read_text(encoding="utf-8"))
    # Macbeth's served edition keeps Gutenberg's emphasis markup inside
    # speeches; Hamlet's drops it everywhere. Read which off the served file
    # rather than assuming.
    plain = not any(
        "_" in text for chapter in served["chapters"] for text in chapter["paragraphs"]
    )
    lines = source_lines(source.read_text(encoding="utf-8"))
    labels = speaker_labels(lines)

    chapters: dict[str, dict[str, list[int]]] = {}
    cursor = 0
    stats = {
        "paragraphs": 0,
        "verse": 0,
        "prose": 0,
        "mixed": 0,
        "singleLine": 0,
        "stageDirection": 0,
        "unmatched": 0,
    }
    unmatched: list[str] = []
    suspect: list[str] = []

    for chapter in served["chapters"]:
        number = str(chapter["number"])
        per_paragraph: dict[str, list[int]] = {}
        for index, text in enumerate(chapter["paragraphs"]):
            stats["paragraphs"] += 1
            direction = is_direction(text)
            used = None
            for start in range(cursor, min(cursor + resync, len(lines))):
                used = (match_direction(text, lines, start) if direction
                        else match_from(text, lines, start, plain))
                if used is not None:
                    cursor = start + len(used)
                    break
            shift = 0
            if used is None and not direction:
                # The served editions sometimes break one source speech into
                # several paragraphs, re-printing the speaker label on each.
                # That label is not in the source at that point, so match the
                # remainder and shift the recovered offsets past it.
                label = served_label(text, labels)
                if label:
                    rest = text[len(label) + 1 :]
                    for start in range(cursor, min(cursor + resync, len(lines))):
                        used = match_from(rest, lines, start, plain)
                        if used is not None:
                            cursor = start + len(used)
                            shift = len(label) + 1
                            break
            if used is None:
                stats["unmatched"] += 1
                unmatched.append(f"ch{number} p{index}: {text[:70]}")
                continue
            if direction:
                stats["stageDirection"] += 1
                continue
            body = [line.raw for line in speech_body(used)]
            if len(body) < 2:
                stats["singleLine"] += 1
                continue
            offsets = breaks_for(text, used, shift)
            runs = prose_runs(body)
            wrapped = sum(end - start - 1 for start, end in runs)
            if wrapped and offsets:
                stats["mixed"] += 1
            elif offsets:
                stats["verse"] += 1
            else:
                stats["prose"] += 1
            # A kept break is doubtful only when the line before it is long
            # enough that a wrap could plausibly have produced it. Everything
            # in that band is listed for human review.
            inside = {i for start, end in runs for i in range(start, end - 1)}
            if any(i not in inside and len(piece) >= SUSPECT_LINE for i, piece in enumerate(body[:-1])):
                suspect.append(f"ch{number} p{index}: " + " / ".join(body))
            if offsets:
                verify(text, offsets)
                per_paragraph[str(index)] = offsets
        if per_paragraph:
            chapters[number] = per_paragraph

    return {
        "sidecar": {
            "bookId": book_id,
            "edition": "original-en",
            "source": source.name,
            "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            "editionSha256": hashlib.sha256(edition.read_bytes()).hexdigest(),
            "chapters": chapters,
        },
        "stats": stats,
        "unmatched": unmatched,
        "suspect": suspect,
    }


def render(sidecar: dict) -> str:
    """One chapter per line, one paragraph per entry: small, and diffable."""
    head = {key: value for key, value in sidecar.items() if key != "chapters"}
    parts = [json.dumps(head, ensure_ascii=False)[:-1]]
    parts.append(',"chapters":{')
    chapters = []
    for number, paragraphs in sidecar["chapters"].items():
        body = ",".join(f'"{index}":{json.dumps(offsets)}' for index, offsets in paragraphs.items())
        chapters.append(f'\n"{number}":{{{body}}}')
    parts.append(",".join(chapters))
    parts.append("}}\n")
    return "".join(parts)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("book_id")
    parser.add_argument("source", type=Path)
    parser.add_argument("--resync", type=int, default=400)
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--report", choices=["unmatched", "suspect"])
    args = parser.parse_args()

    result = build(args.book_id, args.source, args.resync)
    print(json.dumps(result["stats"], indent=2))
    print("suspect classifications:", len(result["suspect"]))
    if args.report:
        for line in result[args.report]:
            print(args.report.upper(), line, file=sys.stderr)
    if args.write:
        out = EDITIONS / f"{args.book_id}-lines.json"
        out.write_text(render(result["sidecar"]), encoding="utf-8")
        print("wrote", out, out.stat().st_size, "bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
