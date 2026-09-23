#!/usr/bin/env python3
"""Independent verification of the staged Odyssey Book 2 against raw PG #1727.

This is NOT a re-run of whatever produced the served `original-en`. It is a
separate reconstruction, written to a rule devised here, and it is only
trusted after the rule has been audited against the raw lines. It then diffs
word-for-word against the staged file, so that a difference has to be
explained rather than assumed away.

The rule exploits the property the Book 1 reviewer established — that this
translation's one real apparatus class is **bare-digit footnote references
glued to the text**, and that the property is derivable from PG's own
numbered footnote-entry list rather than from indentation — but derives it
again here, for the whole body, and uses it **positionally** rather than as a
pattern:

    The translation body contains exactly 187 digit runs, and read in order
    they are the sequence 1, 2, 3 … 187 with no repeats and no gaps, against
    186 bracketed entries in PG's FOOTNOTES: list numbered up to 187 (entry
    29 is absent from PG's list; the gap is in Book III). The two counts
    reconcile. So every digit run in the body is a footnote reference and
    Butler's body contains no digits of its own — he writes "twenty men",
    "twelve months" in words throughout.

A pattern rule ("delete any digit run") would accept a body digit silently.
This rule asserts that the k-th digit run removed **is** the k-th marker, so
a stray body digit breaks the arithmetic instead of vanishing.

Usage: python3 scripts/verify_source_book2.py
"""
import json
import re
import sys
from pathlib import Path as _P

sys.path.insert(0, str(_P(__file__).resolve().parent))
from controls import control, declare_blind, summary   # noqa: E402
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = ROOT.parent.parent.parent
PG = ROOT / "source-texts/pg1727-butler-1900.txt"
ORIGINAL_EN = REPO_ROOT / "app/public/data/editions/odyssey-original-en.json"

BOOK = 2
ROMAN = {1: "I", 2: "II", 3: "III", 4: "IV", 5: "V"}


def fail(msg):
    print("FAIL: " + msg, file=sys.stderr)
    sys.exit(1)


def main():
    lines = [l.rstrip("\r")
             for l in PG.read_text(encoding="utf-8").split("\n")]

    # ---------------------------------------------------------------- anchors
    # NOTE, and this is the first thing the audit caught: "FOOTNOTES:" occurs
    # TWICE in the file. The first (line 75) is the table of contents. Taking
    # the first would have made the translation body empty and the whole
    # marker relation vacuously true. Take the last.
    foot_hits = [i for i, l in enumerate(lines) if l.strip() == "FOOTNOTES:"]
    if len(foot_hits) != 2:
        fail("expected exactly two 'FOOTNOTES:' lines, found %d" % len(foot_hits))
    FOOT = foot_hits[-1]
    heads = {l: i for i, l in enumerate(lines) if re.fullmatch(r"BOOK [IVXL]+", l)}
    body_lo = heads["BOOK I"]
    body = lines[body_lo:FOOT]

    # --------------------------------------------- the marker relation, derived
    entries = []
    for l in lines[FOOT:]:
        m = re.match(r"\s*\[(\d+)\]", l)
        if m:
            entries.append(int(m.group(1)))
    if len(entries) != 186 or entries[-1] != 187:
        fail("PG footnote list is not 186 entries numbered to 187")
    absent = [n for n in range(1, 188) if n not in entries]
    if absent != [29]:
        fail("unexpected gaps in PG's footnote list: %s" % absent)

    runs = []
    for i, l in enumerate(body):
        for m in re.finditer(r"\d+", l):
            runs.append((body_lo + i, m.start(), m.end(), int(m.group(0))))
    if [r[3] for r in runs] != list(range(1, len(runs) + 1)):
        fail("digit runs in the body are not the sequence 1..N in order")
    if len(runs) != 187:
        fail("expected 187 digit runs in the body, found %d" % len(runs))
    print("relation holds: 187 digit runs = 1..187 in order; "
          "186 PG entries numbered to 187, only 29 absent (Book III)")

    # -------------------------------------------------- this Book's line range
    lo = heads["BOOK %s" % ROMAN[BOOK]]
    nxt = heads.get("BOOK %s" % ROMAN.get(BOOK + 1, ""), FOOT)
    seg_lines = list(range(lo, nxt))

    # ------------------------------------------------- APPARATUS AUDIT, first
    # Enumerated before any reconstruction is trusted. Every class the
    # Meditations family of failures is built on is checked, plus the classes
    # Book 1's audit turned up.
    seg = lines[lo:nxt]
    audit = {
        "indented lines": [lo + i + 1 for i, l in enumerate(seg)
                           if l[:1] in (" ", "\t")],
        "Illustration markers": [lo + i + 1 for i, l in enumerate(seg)
                                 if "Illustration" in l],
        "in-text Greek": [lo + i + 1 for i, l in enumerate(seg)
                          if "Greek:" in l],
        "daggers": [lo + i + 1 for i, l in enumerate(seg) if "†" in l],
        "underscores": [lo + i + 1 for i, l in enumerate(seg) if "_" in l],
        "square brackets": [lo + i + 1 for i, l in enumerate(seg)
                            if "[" in l or "]" in l],
        "digit runs": [lo + i + 1 for i, l in enumerate(seg)
                       if re.search(r"\d", l)],
    }
    for k, v in audit.items():
        print("  audit %-22s %d %s" % (k, len(v), v if len(v) <= 8 else ""))
    if audit["indented lines"] or audit["Illustration markers"] or \
            audit["in-text Greek"] or audit["daggers"] or audit["underscores"]:
        fail("an apparatus class this rule does not handle is present")
    # The one square bracket is Butler's own, inside a sentence of the
    # translation, and the staged file keeps it. It is NOT PG apparatus.
    if audit["square brackets"] != [802]:
        fail("unexpected square brackets: %s" % audit["square brackets"])
    if "[do not] hold" not in lines[801]:
        fail("the expected bracket at PG line 802 is not '[do not]'")

    # Short standalone flush-left lines: a running head or page number would
    # look like body text to the paragraph rule, so every one is listed.
    shorts = [(lo + i + 1, l) for i, l in enumerate(seg)
              if 0 < len(l) <= 24 and not re.fullmatch(r"BOOK [IVXL]+", l)]
    print("  audit short lines (<=24 chars, excl. heading): %d" % len(shorts))
    for n, l in shorts:
        nxt_blank = (lines[n] == "") if n < len(lines) else True
        if not nxt_blank:
            fail("short line %d is not paragraph-final: %r" % (n, l))
    print("    all are paragraph-final wrapped lines, not apparatus")

    # -------------------------------------------------------- reconstruction
    # Heading block: the BOOK line, then blanks, then the all-caps title run,
    # then blanks. Body starts at the first line after that.
    i = 1
    while i < len(seg) and seg[i] == "":
        i += 1
    while i < len(seg) and seg[i] != "":      # the all-caps title run
        if seg[i] != seg[i].upper():
            fail("heading block line is not all caps: %r" % seg[i])
        i += 1
    title_end = i

    paragraphs, cur = [], []
    for j in range(title_end, len(seg)):
        l = seg[j]
        if l == "":
            if cur:
                paragraphs.append(cur)
                cur = []
        else:
            cur.append((lo + j, l))
    if cur:
        paragraphs.append(cur)

    # Markers expected in this Book, from the global positional sequence.
    in_book = [r for r in runs if lo <= r[0] < nxt]
    expected = [r[3] for r in in_book]
    print("  markers expected in Book %d: %s" % (BOOK, expected))

    seen = []
    out = []
    for para in paragraphs:
        rebuilt = []
        for lineno, text in para:
            def take(m):
                seen.append(int(m.group(0)))
                return ""
            # remove the marker AND any spaces immediately before it, and
            # nothing else
            text = re.sub(r" *(\d+)", lambda m: take(re.match(r"\d+", m.group(1))) or "", text)
            rebuilt.append(text)
        out.append("\n".join(rebuilt))

    if seen != expected:
        fail("markers removed %s != markers expected %s" % (seen, expected))

    # ------------------------------------------------------------------ diff
    ch = next(c for c in json.loads(ORIGINAL_EN.read_text(encoding="utf-8"))["chapters"]
              if c["number"] == BOOK)
    staged = ch["paragraphs"]
    print("\nreconstructed %d paragraphs; staged has %d"
          % (len(out), len(staged)))
    if len(out) != len(staged):
        fail("paragraph count differs")

    bad = [i for i in range(len(out)) if out[i] != staged[i]]
    if bad:
        for i in bad[:3]:
            a, b = out[i].split(), staged[i].split()
            print("  P%03d differs; first differing word:" % (i + 1))
            for k in range(max(len(a), len(b))):
                if k >= len(a) or k >= len(b) or a[k] != b[k]:
                    print("    mine=%r staged=%r" % (a[k:k+4], b[k:k+4]))
                    break
        fail("%d of %d paragraphs differ" % (len(bad), len(out)))

    # word-for-word, explicitly, as well as byte-for-byte
    mine_words = [w for p in out for w in p.split()]
    staged_words = [w for p in staged for w in p.split()]
    if mine_words != staged_words:
        fail("word streams differ")

    # ------------------------------------------------- negative controls, D18
    # Round 1 of Book 5 observed that this script's only controls were
    # PROSE-DESCRIBED process controls -- effective by construction, but never
    # executed. D18 (`scripts/controls.py`) asks for both clauses to be
    # asserted, so three real controls are run here: each asserts (a) that its
    # mutation changed the reconstruction and (b) that the verdict -- the
    # number of paragraphs differing from the staged file -- changed with it.
    print("\nnegative controls — the rule must be able to FAIL")

    def verdict(ps):
        return sum(1 for i in range(len(staged)) if ps[i] != staged[i])

    swapped = list(out)
    swapped[0], swapped[1] = swapped[1], swapped[0]
    control("A: two paragraphs swapped", out, swapped, verdict)

    typo = list(out)
    w = max(re.findall(r"[A-Za-z]{6,}", typo[10]), key=len)  # its OWN letters
    typo[10] = typo[10].replace(w, w[:-1] + w[-1] * 2, 1)
    control("B: one letter changed", out, typo, verdict)

    if len(out[20].split()) < 2:
        fail("control C's precondition: P021 has nothing to drop")
    dropped = list(out)
    dropped[20] = " ".join(dropped[20].split()[:-1])
    control("C: one word dropped", out, dropped, verdict)

    # declared blindness: this rule compares the RECONSTRUCTION against the
    # staged file, so a defect PG and the staged file share is invisible to it
    # -- both sides would carry it. Clause (b) cannot be made to hold.
    declare_blind("a defect present in PG #1727 itself",
                  because="both sides of the diff would carry it",
                  carried_by="the four unlike source rules used across "
                             "Books 2-5, which agree on the same region")
    print(summary())

    print("OK — all %d paragraphs byte-identical, zero diffs; "
          "%d words compared word-for-word" % (len(out), len(mine_words)))
    print("staged title: %s" % ch["title"])


if __name__ == "__main__":
    main()
