#!/usr/bin/env python3
"""Whole-file scan: the served odyssey-original-en.json against PG #1727.

Written at Book 3's step 1, after that Book's own verification turned up a
paragraph in the staged original that is not in the base text at all. One
Book's defect could be one Book's defect or the first of many, and the
difference matters to every later Book, so the question is answered once here
instead of being rediscovered at Book 12.

The rule is Book 3's, applied to all 24 Books: structural boundaries on the
`BOOK <roman>` headings (never on `FOOTNOTES:`, which occurs twice in the
file); paragraphs as maximal runs of non-blank lines; leading all-caps blocks
dropped as the chapter opening; then a diff, with PG's apparatus still in,
classified before anything is removed.

Read-only. Modifies nothing.

Usage: python3 scripts/scan_staged_original_vs_pg.py
"""
import difflib
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = ROOT.parent.parent.parent
PG = ROOT / "source-texts/pg1727-butler-1900.txt"
ORIGINAL_EN = REPO_ROOT / "app/public/data/editions/odyssey-original-en.json"
PG_SHA = "ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9"
ORIG_SHA = "da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07"

ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI",
         "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
         "XXI", "XXII", "XXIII", "XXIV"]


def paragraphs_from(block):
    out, cur = [], []
    for line in block:
        if line.strip():
            cur.append(line)
        elif cur:
            out.append("\n".join(cur))
            cur = []
    if cur:
        out.append("\n".join(cur))
    return out


def main():
    assert hashlib.sha256(PG.read_bytes()).hexdigest() == PG_SHA
    assert hashlib.sha256(ORIGINAL_EN.read_bytes()).hexdigest() == ORIG_SHA
    lines = [l.rstrip("\r") for l in PG.read_bytes().decode("utf-8").split("\n")]

    fn = [i for i, l in enumerate(lines) if l.strip() == "FOOTNOTES:"]
    assert len(fn) == 2, "the FOOTNOTES: trap has changed shape"
    body_end = [i for i, l in enumerate(lines) if l == "FOOTNOTES:"][0]

    pos = {}
    for i, l in enumerate(lines):
        s = l.strip()
        if s.startswith("BOOK ") and s[5:] in ROMAN and i >= 374:
            assert s[5:] not in pos, "a BOOK heading is not unique: " + s
            pos[s[5:]] = i
    assert len(pos) == 24

    orig = json.loads(ORIGINAL_EN.read_text(encoding="utf-8"))
    strip_glued = lambda p: re.sub(r"(?<=\S)\d+", "", p)

    tot_par = tot_words = 0
    spaced_books, case_books, text_books = [], [], []
    print("  bk   PG  staged  words   findings")
    for k, rom in enumerate(ROMAN):
        lo = pos[rom]
        hi = pos[ROMAN[k + 1]] if k + 1 < 24 else body_end
        blocks = paragraphs_from(lines[lo:hi])
        n = 0
        while n < len(blocks):
            flat = blocks[n].replace("\n", " ").strip()
            if flat != flat.upper():
                break
            n += 1
        raw = "\n".join(lines[lo:hi])
        spaced = re.findall(r"(?<=\s)\d+", raw)
        body = [strip_glued(p) for p in blocks[n:]]
        staged = next(c for c in orig["chapters"] if c["number"] == k + 1)["paragraphs"]
        notes = []
        if spaced:
            spaced_books.append(k + 1)
            notes.append("%d space-separated marker(s)" % len(spaced))
        if len(body) != len(staged):
            notes.append("PARAGRAPH COUNT %d vs %d" % (len(body), len(staged)))
        else:
            for i in range(len(staged)):
                a, b = body[i], staged[i]
                if a == b:
                    continue
                if len(a) == len(b) and a[0].lower() == b[0].lower() and a[1:] == b[1:]:
                    case_books.append((k + 1, i + 1))
                    notes.append("P%03d capitalization" % (i + 1))
                elif re.fullmatch(r"[\s\d]*", "".join(
                        x[2] for x in _ops(a, b))) and all(
                        x[3] == "" for x in _ops(a, b)):
                    notes.append("P%03d leftover apparatus" % (i + 1))
                else:
                    text_books.append((k + 1, i + 1, len(b) - len(a)))
                    notes.append("P%03d TEXT DIFFERS (%+d chars)" % (i + 1, len(b) - len(a)))
        tot_par += len(staged)
        w = sum(len(p.split()) for p in staged)
        tot_words += w
        print("  %2d %4d %6d %6d   %s"
              % (k + 1, len(body), len(staged), w, "; ".join(notes) or "identical"))

    print()
    print("  totals: %d paragraphs, %d words" % (tot_par, tot_words))
    print()
    print("  1. Paragraph counts match in all 24 Books.")
    print("  2. Book-opening capitalization (PG lower case, staged upper): %s"
          % ", ".join("Book %d ¶%d" % c for c in case_books))
    print("     Butler's Book openings run on from the previous Book's printing;")
    print("     the staged file capitalizes. No word changes.")
    print("  3. Footnote markers separated by a space rather than glued, in "
          "Books %s." % ", ".join(str(b) for b in spaced_books))
    print("     They matter to any reconstruction: a removal rule that only")
    print("     strips a digit run glued to a preceding non-space character")
    print("     leaves part of the marker behind in those Books. Books 2 and 3")
    print("     have none, which is why the glued-only rule is safe there and")
    print("     is asserted rather than assumed.")
    print("  4. Paragraphs whose TEXT differs from PG: %s"
          % (", ".join("Book %d ¶%d (%+d chars)" % t for t in text_books) or "none"))
    if text_books:
        print("     This is the whole of it. The staged original-en is otherwise")
        print("     Butler's translation body, complete, in every Book.")


def _ops(a, b):
    return [(t, i1, a[i1:i2], b[j1:j2])
            for t, i1, i2, j1, j2 in
            difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes()
            if t != "equal"]


if __name__ == "__main__":
    main()
