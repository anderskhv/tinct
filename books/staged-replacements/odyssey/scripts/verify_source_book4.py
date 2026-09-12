#!/usr/bin/env python3
"""Step 1 for Book 4: verify the served `original-en` Book 4 IS Butler's text,
by a fourth kind of rule — different in kind from the three already used in
this package, so that agreement between them is evidence rather than repetition.

The three already used:
  * Book 2 drafter  — anchored positionally on PG's footnote-entry list.
  * Book 3 drafter  — anchored structurally on the `BOOK III` / `BOOK IV`
                      headings, read bytes, diffed with the apparatus still in.
  * Book 3 reviewer — anchorless and digit-blind: asked whether the served Book
                      occurs as one contiguous letter-token block in PG, once.

THIS rule is **needle-located and character-exact**:

  1. It uses **no heading, no Book number, no `FOOTNOTES:` line and no digit**
     to find Book 4. It takes two needles out of the SERVED text itself — the
     opening letter-tokens of its first paragraph and the closing letter-tokens
     of its last — locates each in PG's letter-token stream, and REQUIRES EACH
     TO OCCUR EXACTLY ONCE. The region is therefore an *output* of the served
     file's own content, not an assumption about PG's layout.
  2. Inside that region it cuts paragraphs mechanically on blank lines, with
     **PG's apparatus left in**, and joins each paragraph's hard-wrapped lines
     with single spaces. The paragraph count is an OUTPUT; 81 is asserted
     afterwards, never used to steer the cut.
  3. It then diffs served-vs-PG **character by character, paragraph by
     paragraph, with the apparatus still in**, and requires every difference to
     be CLASSIFIED before anything is removed. A dropped word, a normalised
     quotation mark, a joined line or a silently repaired bracket all show up
     here as an unclassified difference.
  4. Only then are the classified footnote markers removed, and the two texts
     compared word for word.

Run from `books/staged-replacements/odyssey`. Read-only. No network.
"""
import hashlib
import json
import os
import re
import sys
import difflib

HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(PKG, "..", "..", ".."))
PG = os.path.join(PKG, "source-texts", "pg1727-butler-1900.txt")
SERVED = os.path.join(REPO, "app", "public", "data", "editions",
                      "odyssey-original-en.json")
PG_SHA = "ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9"
SERVED_SHA = "da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07"

FAILURES = []


def check(cond, msg):
    print(("  ok   " if cond else "  FAIL ") + msg)
    if not cond:
        FAILURES.append(msg)


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def letters(text):
    """Lowercase letter-only tokens. PG's footnote markers are bare digit runs
    glued to a word's end, so a marker CANNOT become a token and cannot be
    'stripped' — but the digits also cannot hide a lost letter, because the
    letters on either side of them are still tokenised."""
    return re.findall(r"[a-z]+", text.lower())


def main():
    print("Book 4 source verification — needle-located, character-exact\n")

    print("Inputs")
    check(sha(PG) == PG_SHA, "PG #1727 sha256 %s" % PG_SHA)
    check(sha(SERVED) == SERVED_SHA, "served original-en sha256 %s" % SERVED_SHA)

    raw = open(PG, "rb").read()                  # bytes: no newline translation
    # PG #1727 is CRLF throughout — 12,246 CRLF pairs, one per line, and no bare
    # CR or bare LF anywhere. Read as BYTES and split on "\n" ourselves, then
    # strip the "\r": universal-newline mode would translate the pairs silently,
    # and a rule that never looks cannot say whether it was reading Butler's
    # line structure or Python's.
    check(raw.count(b"\r\n") == raw.count(b"\r") == raw.count(b"\n") == 12246,
          "PG is CRLF throughout: 12,246 pairs, no bare CR, no bare LF")
    pg_text = raw.decode("utf-8")
    pg_lines = [l.rstrip("\r") for l in pg_text.split("\n")]

    served_all = json.load(open(SERVED, encoding="utf-8"))
    ch = next(c for c in served_all["chapters"] if c["number"] == 4)
    served = ch["paragraphs"]
    print("\nServed chapter 4: %d paragraphs, %d words, title %r"
          % (len(served), sum(len(p.split()) for p in served), ch["title"]))

    # ---- 1. locate the region from the SERVED text's own words -------------
    print("\n1. Region located by two needles taken from the served text")
    pg_tokens = letters(pg_text)
    head_needle = letters(served[0])[:8]
    tail_needle = letters(served[-1])[-8:]
    print("   head needle: %s" % " ".join(head_needle))
    print("   tail needle: %s" % " ".join(tail_needle))

    def occurrences(needle):
        n, hits = len(needle), []
        for i in range(len(pg_tokens) - n + 1):
            if pg_tokens[i:i + n] == needle:
                hits.append(i)
        return hits

    head_hits, tail_hits = occurrences(head_needle), occurrences(tail_needle)
    check(len(head_hits) == 1, "head needle occurs exactly once in PG (%d)" % len(head_hits))
    check(len(tail_hits) == 1, "tail needle occurs exactly once in PG (%d)" % len(tail_hits))
    if not (head_hits and tail_hits):
        return report()
    check(tail_hits[0] > head_hits[0], "tail needle follows head needle")

    # translate token offsets back to line numbers, without any heading anchor
    def line_of_token(target):
        seen = 0
        for ln, line in enumerate(pg_lines, 1):
            k = len(letters(line))
            if seen + k > target:
                return ln
            seen += k
        return None

    first_line = line_of_token(head_hits[0])
    last_line = line_of_token(tail_hits[0] + len(tail_needle) - 1)
    print("   region: PG lines %d..%d  (an OUTPUT, not an assumption)"
          % (first_line, last_line))
    check(first_line is not None and last_line is not None, "region resolved to line numbers")

    # ---- 2. mechanical paragraph cut, apparatus left in --------------------
    print("\n2. Paragraphs cut mechanically on blank lines, apparatus left in")
    region = pg_lines[first_line - 1:last_line]
    paras, cur = [], []
    for line in region:
        if line.strip() == "":
            if cur:
                paras.append(" ".join(l.strip() for l in cur))
                cur = []
        else:
            cur.append(line)
    if cur:
        paras.append(" ".join(l.strip() for l in cur))
    print("   paragraphs cut: %d  (an OUTPUT)" % len(paras))
    check(len(paras) == len(served),
          "PG paragraph count %d equals the served count %d" % (len(paras), len(served)))
    check(len(served) == 81, "and that count is 81")
    if len(paras) != len(served):
        return report()

    # ---- 3. character diff, every difference classified BEFORE removal -----
    print("\n3. Character-level diff with the apparatus still in")
    marker_diffs, other_diffs, case_diffs, spaced_markers = [], [], [], []
    for i, (a, b) in enumerate(zip(paras, [p.replace("\n", " ") for p in served]), 1):
        if a == b:
            continue
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                continue
            pg_bit, served_bit = a[i1:i2], b[j1:j2]
            if tag == "delete" and re.fullmatch(r"\d+", pg_bit):
                marker_diffs.append((i, pg_bit, pg_bit))      # glued marker
            elif tag == "delete" and re.fullmatch(r"\d+ ", pg_bit):
                # A marker set off by spaces rather than glued to the word
                # before it. The served file removes the marker AND one space.
                spaced_markers.append((i, pg_bit.strip()))
                marker_diffs.append((i, pg_bit.strip(), pg_bit))
            elif (tag == "replace" and len(pg_bit) == len(served_bit) == 1
                  and pg_bit.lower() == served_bit.lower()):
                case_diffs.append((i, pg_bit, served_bit))
            else:
                other_diffs.append((i, tag, pg_bit, served_bit))
    print("   footnote-marker deletions : %d" % len(marker_diffs))
    print("   of those, SPACE-SET rather than glued to the previous word: %d %s"
          % (len(spaced_markers), spaced_markers))
    print("   letter-case differences   : %d %s"
          % (len(case_diffs), [(("B04-P%03d" % i), x, y) for i, x, y in case_diffs]))
    print("   every other difference    : %d" % len(other_diffs))
    for i, tag, x, y in other_diffs:
        print("     B04-P%03d %-7s PG=%r served=%r" % (i, tag, x, y))
    check(not other_diffs,
          "every difference is a footnote marker or a letter-case change — "
          "nothing else of any kind")
    check(len(case_diffs) == 1 and case_diffs[0][0] == 1
          and case_diffs[0] == (1, "t", "T"),
          "the ONE case difference is B04-P001's `they` -> `They`: PG opens "
          "Book IV mid-sentence, as it opens Book III")

    nums = [int(n) for _, n, _ in marker_diffs]
    check(nums == sorted(nums), "markers ascend through the Book")
    check(len(nums) == len(set(nums)), "no marker number repeats")
    print("   markers: %s" % (nums,))

    # ---- 4. word-for-word comparison after removing ONLY those markers -----
    print("\n4. Word-for-word comparison after removing only the classified markers")
    cleaned = list(paras)
    for i, _num, chunk in marker_diffs:
        cleaned[i - 1] = cleaned[i - 1].replace(chunk, "", 1)
    # and the one classified capitalization, applied explicitly rather than by
    # comparing case-insensitively, so nothing else can hide behind it
    cleaned[0] = "T" + cleaned[0][1:]
    identical = sum(1 for a, b in zip(cleaned, served) if a == b.replace("\n", " "))
    words = mismatch = 0
    for a, b in zip(cleaned, served):
        aw, bw = a.split(), b.replace("\n", " ").split()
        words += len(aw)
        for x, y in zip(aw, bw):
            if x != y:
                mismatch += 1
        mismatch += abs(len(aw) - len(bw))
    check(identical == len(served),
          "%d of %d paragraphs byte-identical" % (identical, len(served)))
    check(mismatch == 0, "%d words compared word-for-word, %d mismatches"
          % (words, mismatch))

    # ---- the rule audits itself --------------------------------------------
    print("\n5. Negative controls — the rule must be able to FAIL")

    def diffs_against(mod):
        out = 0
        for a, b in zip(cleaned, mod):
            if a != b.replace("\n", " "):
                out += 1
        return out

    swapped = list(served)
    swapped[0], swapped[1] = swapped[1], swapped[0]
    check(diffs_against(swapped) > 0, "control A: two paragraphs swapped is detected")
    typo = list(served)
    typo[40] = typo[40].replace("the", "teh", 1)
    check(diffs_against(typo) > 0, "control B: one letter changed is detected")
    dropped = list(served)
    dropped[9] = " ".join(dropped[9].split()[:-1])
    check(diffs_against(dropped) > 0, "control C: one word dropped is detected")
    check(len(occurrences(letters("this sentence is not in the odyssey at all"))) == 0,
          "control D: a needle that is not in PG occurs zero times")

    # ---- what the served file carries that Butler's brackets explain --------
    print("\n6. Butler's square brackets in this Book (D12), reported not touched")
    for i, p in enumerate(served, 1):
        if "[" in p or "]" in p:
            flat = p.replace("\n", " ")
            for m in re.finditer(r"[\[\]]", flat):
                s = max(0, m.start() - 40)
                print("   B04-P%03d %-1s …%s…" % (i, m.group(0), flat[s:m.start() + 40]))
    opens = sum(p.count("[") for p in served)
    closes = sum(p.count("]") for p in served)
    print("   opening brackets %d, closing brackets %d" % (opens, closes))
    check((opens, closes) == (2, 1),
          "two opening brackets and one closing: PG 1552 never closes (D12 class C)")

    return report()


def report():
    print()
    if FAILURES:
        print("FAILED — %d check(s):" % len(FAILURES))
        for f in FAILURES:
            print("  - " + f)
        return 1
    print("OK — the served Book 4 is Butler's text. The region was located from "
          "the served file's\n     own words, the paragraph count is an output, "
          "every difference was classified before\n     anything was removed, "
          "and four negative controls fail as they should.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
