#!/usr/bin/env python3
"""Step 1 for Odyssey Book 3: verify the staged original independently.

Re-done from scratch for this Book, not inherited from Books 1 or 2.

METHOD — the Book 2 reviewer's, not the Book 2 drafter's, and deliberately so.

The Book 2 drafter's rule identified PG's apparatus in advance (bare-digit
runs, used positionally) and then stripped it. It is a good rule, but a
reconstruction that begins by deciding what the apparatus is shares that
decision's blind spot: it cannot see a difference of a class nobody thought of.

So this script **decides nothing in advance and strips nothing up front**:

  1. It finds the Book's boundaries *structurally*, on the `BOOK III` and
     `BOOK IV` headings, never on `FOOTNOTES:` — which occurs TWICE in
     PG #1727 (line 75, indented, inside the table of contents; and line
     10843, the real section). Anchoring on the first would make the body
     empty and any apparatus check vacuously true. Both occurrences are
     asserted here so the trap is recorded rather than avoided by luck.
  2. It cuts paragraphs *mechanically* — maximal runs of non-blank lines. The
     paragraph count is an OUTPUT of the rule, not an input.
  3. It audits the raw range before trusting anything, and prints the audit.
  4. It diffs against the staged original **with PG's apparatus still in**,
     character by character, printing EVERY difference with context, and
     requires each one to be classified before anything is removed. A rule
     that strips apparatus before diffing can hide a dropped word; this one
     cannot, because a dropped word would appear in the same opcode list as
     a non-apparatus difference.
  5. Only then does it remove exactly what the diff justified, re-diff, and
     compare word-for-word.
  6. Two negative controls prove the check can fail.

Usage: python3 scripts/verify_source_book3.py
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

BOOK = 3
THIS, NEXT = "BOOK III", "BOOK IV"


def fail(msg):
    sys.exit("verify_source_book3.py: FAILED — " + msg)


def check(cond, msg):
    if not cond:
        fail(msg)


def paragraphs_from(lines):
    """Maximal runs of non-blank lines, joined with a newline — the served
    original's own paragraph shape. Nothing about content is assumed."""
    out, cur = [], []
    for line in lines:
        if line.strip():
            cur.append(line)
        elif cur:
            out.append("\n".join(cur))
            cur = []
    if cur:
        out.append("\n".join(cur))
    return out


def main():
    check(hashlib.sha256(PG.read_bytes()).hexdigest() == PG_SHA,
          "PG #1727 is not at its recorded hash")
    check(hashlib.sha256(ORIGINAL_EN.read_bytes()).hexdigest() == ORIG_SHA,
          "the served original-en is not at its recorded hash")
    # Read BYTES and decode, so the line ending is visible rather than
    # silently translated by universal-newline mode — the kind of normalization
    # this whole method exists to refuse to take on trust.
    text = PG.read_bytes().decode("utf-8")
    raw_lines = text.split("\n")
    crlf = sum(1 for l in raw_lines[:-1] if l.endswith("\r"))
    print("  line endings: %d of %d lines end CRLF" % (crlf, len(raw_lines) - 1))
    if crlf != len(raw_lines) - 1:
        fail("the file is not uniformly CRLF; the carriage-return strip is unsafe")
    print("    -> uniformly CRLF. Carriage returns are a transport artefact and")
    print("       are stripped; no word changes. (The served original has none.)")
    lines = [l.rstrip("\r") for l in raw_lines]

    print("=" * 74)
    print("AUDIT OF MY OWN RULES, BEFORE ANY OF THEM IS TRUSTED")
    print("=" * 74)

    # --- the FOOTNOTES: trap, recorded rather than avoided by luck ----------
    fn = [i + 1 for i, l in enumerate(lines) if l.strip() == "FOOTNOTES:"]
    print("  'FOOTNOTES:' occurs at lines %s" % fn)
    check(len(fn) == 2, "expected exactly two 'FOOTNOTES:' lines, got %d" % len(fn))
    check(lines[fn[0] - 1].startswith(" "), "the first FOOTNOTES: should be the "
          "indented table-of-contents entry")
    check(not lines[fn[1] - 1].startswith(" "), "the second FOOTNOTES: should be "
          "the real section heading")
    print("    -> line %d is the indented table-of-contents entry; line %d is the"
          % (fn[0], fn[1]))
    print("       real section. THIS SCRIPT ANCHORS ON NEITHER.")

    # --- boundaries, structurally ------------------------------------------
    here = [i for i, l in enumerate(lines) if l.strip() == THIS]
    there = [i for i, l in enumerate(lines) if l.strip() == NEXT]
    print("  '%s' on lines %s; '%s' on lines %s"
          % (THIS, [i + 1 for i in here], NEXT, [i + 1 for i in there]))
    check(len(here) == 1 and len(there) == 1,
          "the Book headings are not unique; the boundary rule is unsafe")
    lo, hi = here[0], there[0]
    check(lo < hi, "BOOK IV precedes BOOK III")
    block = lines[lo:hi]
    print("  range: PG lines %d..%d (%d raw lines)" % (lo + 1, hi, len(block)))

    # --- paragraphs, mechanically ------------------------------------------
    paras_raw = paragraphs_from(block)
    # Drop leading blocks for as long as they are entirely upper-case. Butler's
    # chapter opening is two such blocks here — the Book number and the chapter
    # summary — separated by a blank line, so a fixed "drop one" would be wrong
    # and a fixed "drop two" would be an assumption. The *stopping condition*
    # is the rule; how many it drops is an output.
    n_head = 0
    while n_head < len(paras_raw):
        flat = paras_raw[n_head].replace("\n", " ").strip()
        if flat != flat.upper():
            break
        n_head += 1
    print("  leading all-caps blocks dropped as the chapter opening: %d" % n_head)
    for h in paras_raw[:n_head]:
        for l in h.split("\n"):
            print("      " + l)
    check(n_head == 2, "expected the Book number and the chapter summary")
    check(paras_raw[0].strip() == THIS, "the first dropped block is not the Book heading")
    orig = json.loads(ORIGINAL_EN.read_text(encoding="utf-8"))
    chapter = next(c for c in orig["chapters"] if c["number"] == BOOK)
    summary = paras_raw[1].replace("\n", " ").strip().rstrip(".")
    served_tail = chapter["title"].split("—", 1)[1].strip()
    check(summary.upper() == served_tail.upper(),
          "the dropped summary %r is not the served chapter title's tail %r"
          % (summary, served_tail))
    print("  it matches the served chapter title's tail, case aside: %r" % served_tail)
    body = paras_raw[n_head:]
    print("  paragraph blocks after the heading: %d   <- an OUTPUT of the rule"
          % len(body))

    # --- audit of the raw range, before anything is removed ----------------
    raw = "\n".join(block)
    counts = {
        "indented lines": sum(1 for l in block if l.startswith(" ") and l.strip()),
        "[Illustration": raw.count("[Illustration"),
        "in-text Greek (non-ASCII Greek block)": len(re.findall(r"[Ͱ-Ͽἀ-῿]", raw)),
        "daggers": raw.count("†"),
        "underscores": raw.count("_"),
        "square brackets '['": raw.count("["),
        "square brackets ']'": raw.count("]"),
    }
    print("  audit of the raw range:")
    for k, v in counts.items():
        print("      %-40s %d" % (k, v))
    runs = re.findall(r"\d+", raw)
    print("      %-40s %d -> %s" % ("digit runs", len(runs), runs))
    # Are they PG footnote markers, and are they all GLUED to the preceding
    # character? Both matter: the removal rule below only removes glued runs,
    # and in OTHER Books PG separates some markers with a space (Books 1, 4, 5,
    # 8, 15, 17, 21, 22 — verified over the whole file), where a glued-only
    # rule would leave a digit behind. Here the clause is a no-op, as it was in
    # Book 2, and that is asserted rather than assumed.
    spaced = re.findall(r"(?<=\s)\d+", raw)
    print("      %-40s %d" % ("digit runs preceded by whitespace", len(spaced)))
    check(not spaced, "a digit run is space-separated; the glued-only removal "
                      "rule would leave part of it behind")
    check([int(r) for r in runs] == list(range(24, 24 + len(runs))),
          "the digit runs do not read in order as a contiguous footnote range; "
          "they may not all be markers")
    print("      -> they read in order as %d..%d, contiguous: consistent with"
          % (int(runs[0]), int(runs[-1])))
    print("         PG's own numbered footnote entries, and a stray body digit")
    print("         would break the arithmetic instead of vanishing.")
    for m in re.finditer(r"\[[^\]]*\]?", raw):
        print("      bracket in range: %r" % m.group(0)[:90])

    # --- the staged original ------------------------------------------------
    staged = chapter["paragraphs"]
    print("  staged original-en chapter %d: %d paragraphs" % (BOOK, len(staged)))
    check(len(body) == len(staged),
          "reconstruction has %d paragraphs, staged has %d" % (len(body), len(staged)))

    print()
    print("=" * 74)
    print("DIFF WITH PG's APPARATUS STILL IN — every difference classified")
    print("=" * 74)
    diffs = []
    for i, (mine, theirs) in enumerate(zip(body, staged)):
        sm = difflib.SequenceMatcher(a=mine, b=theirs, autojunk=False)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                continue
            diffs.append((i, tag, mine[i1:i2], theirs[j1:j2],
                          mine[max(0, i1 - 28):i2 + 28]))
    for i, tag, a, b, ctx in diffs:
        print("  B%02d-P%03d %-7s raw=%-6r staged=%-6r ctx=%r"
              % (BOOK, i + 1, tag, a, b, ctx))
    print("  total differences: %d, in %d paragraphs"
          % (len(diffs), len(set(d[0] for d in diffs))))

    # CLASSIFICATION — every difference is put in a named class before anything
    # is removed. An unclassified difference stops the run.
    #
    #   apparatus   a pure deletion of a bare digit run: a PG footnote marker.
    #   D-A1        the staged file capitalizes the Book's first word, which PG
    #               prints lower case because Butler's sentence runs on across
    #               the Book boundary. A normalization, no word changed.
    #   D-A2        the staged file's LAST paragraph carries ~190 words that are
    #               not in PG at all. A defect; see below.
    #
    apparatus, d_a1, d_a2, unexplained = [], [], [], []
    for d in diffs:
        i, tag, a, b, ctx = d
        if tag == "delete" and b == "" and a.isdigit():
            apparatus.append(d)
        elif i == 0 and tag == "replace" and a.lower() == b.lower() and len(a) == 1:
            d_a1.append(d)
        elif i == len(staged) - 1 and tag == "insert" and a == "":
            d_a2.append(d)
        else:
            unexplained.append(d)
    if unexplained:
        print("  UNEXPLAINED differences — nothing may be removed until these are")
        print("  classified by a person:")
        for d in unexplained:
            print("      %r" % (d,))
        fail("a difference of a class this script cannot account for.")

    print("  classified: %d apparatus (bare digit runs), %d D-A1 (Book-opening"
          % (len(apparatus), len(d_a1)))
    print("  capitalization), %d D-A2 (text in the staged file that is not in PG)."
          % len(d_a2))
    check(len(d_a1) == 1 and len(d_a2) == 1,
          "expected exactly one D-A1 and one D-A2")
    print()
    print("  ---- D-A1 --------------------------------------------------------")
    print("  B03-P001: PG prints %r, the staged file %r."
          % (d_a1[0][2], d_a1[0][3]))
    print("  PG opens Book III lower case because Butler's Book openings run on")
    print("  from the previous Book's printing; the staged file capitalizes.")
    print("  No word changes. The same normalization is in the staged Book 4.")
    print()
    print("  ---- D-A2 — A DEFECT IN THE STAGED ORIGINAL, NOT IN PG ------------")
    spliced = d_a2[0][3]
    print("  B03-P%03d carries %d characters (%d words) that PG does not have."
          % (len(staged), len(spliced), len(spliced.split())))
    print("  PG's Book III ends with a bare half-sentence at line %d:" % (hi - 4))
    print("      %r" % body[-1])
    nxt = next(l for l in lines[hi + 1:hi + 14] if l.strip() and l[:1].islower())
    print("  and PG's BOOK IV opens with its other half, lower case:")
    print("      %r…" % nxt[:62])
    check(nxt.startswith("they reached"),
          "PG's Book IV does not open with the half-sentence's completion")
    print("  The staged original-en completes that half-sentence with text taken")
    print("  VERBATIM from the served odyssey-modern-en.json's own paragraph 38")
    print("  (its only divergence is the opening clause the splice replaced), and")
    print("  the text it supplies DUPLICATES the staged paragraph 37 — the same")
    print("  chariot, housekeeper, Pherae, Diocles, Dawn and corn lands, twice.")
    print("  It is recorded in book03/continuity.md as this Book's one base-text")
    print("  defect and is flagged for the coordinator. Nothing here modifies the")
    print("  served file.")

    # --- only now, the removal ---------------------------------------------
    print()
    print("=" * 74)
    print("REMOVAL, BY THE ONE RULE THE DIFF ITSELF JUSTIFIED, THEN RE-DIFF")
    print("=" * 74)
    # The staged file preserves PG's own line breaks inside a paragraph, so the
    # reconstruction joins with "\n" and nothing else. (Negative control 1
    # below proves this matters.)
    strip = lambda p: re.sub(r"(?<=\S)\d+", "", p)
    rebuilt = [strip(p) for p in body]
    staged_flat = list(staged)

    mismatch = [i for i in range(len(staged)) if rebuilt[i] != staged_flat[i]]
    check(mismatch == [0, len(staged) - 1],
          "after removing only the apparatus, the paragraphs that still differ "
          "should be exactly B03-P001 (D-A1) and B03-P%03d (D-A2); got %s"
          % (len(staged), [i + 1 for i in mismatch]))
    print("  %d of %d paragraphs byte-identical, zero diffs"
          % (len(staged) - 2, len(staged)))
    print("  the 2 that differ are exactly the two classified above, and nothing")
    print("  else: B03-P001 (D-A1) and B03-P%03d (D-A2)." % len(staged))

    # D-A1 costs one character of case; D-A2 is an insertion. Both are asserted
    # to be exactly what was classified, so neither can hide a third difference.
    check(rebuilt[0][0].lower() == staged_flat[0][0].lower()
          and rebuilt[0][1:] == staged_flat[0][1:],
          "D-A1 is more than the first character's case")
    check(staged_flat[-1].startswith(rebuilt[-1]),
          "D-A2 is not a pure suffix insertion on Butler's half-sentence")

    # Word-for-word over the 36 paragraphs that are Butler in both files, plus
    # B03-P001 with its one capital normalized.
    cmp_mine = [rebuilt[0][0].upper() + rebuilt[0][1:]] + rebuilt[1:-1]
    cmp_them = staged_flat[:-1]
    mine_words = " ".join(cmp_mine).split()
    their_words = " ".join(cmp_them).split()
    check(len(mine_words) == len(their_words),
          "word counts differ: %d vs %d" % (len(mine_words), len(their_words)))
    bad = [k for k in range(len(mine_words)) if mine_words[k] != their_words[k]]
    check(not bad, "%d word-level mismatches" % len(bad))
    print("  %d words compared word-for-word over B03-P001..P%03d, 0 mismatches"
          % (len(mine_words), len(staged) - 1))
    tail = rebuilt[-1].split()
    print("  B03-P%03d: Butler's %d words are a prefix of the staged paragraph's"
          % (len(staged), len(tail)))
    print("            %d; the remaining %d are the D-A2 splice."
          % (len(staged_flat[-1].split()),
             len(staged_flat[-1].split()) - len(tail)))

    # --- negative controls: the check must be able to fail ------------------
    print()
    print("=" * 74)
    print("NEGATIVE CONTROLS — the check can fail")
    print("=" * 74)
    joined_with_space = [re.sub(r"\s*\n\s*", " ", strip(p)) for p in body]
    n1 = sum(1 for i in range(len(staged)) if joined_with_space[i] != staged_flat[i])
    print("  join a paragraph's lines with a space:     %d of %d differ"
          % (n1, len(staged)))
    check(n1 > 0, "negative control 1 did not fail")
    markers_left = list(body)
    n2 = sum(1 for i in range(len(staged)) if markers_left[i] != staged_flat[i])
    print("  leave the footnote markers in:             %d of %d differ"
          % (n2, len(staged)))
    check(n2 > 0, "negative control 2 did not fail")
    check(n2 == len(set(d[0] for d in diffs)),
          "control 2 should differ in exactly the paragraphs the diff named")

    print()
    print("OK — %d of %d paragraphs byte-identical after removing PG's 12 footnote"
          % (len(staged) - 2, len(staged)))
    print("     markers; %d words compared word-for-word over B03-P001..P%03d, 0"
          % (len(mine_words), len(staged) - 1))
    print("     mismatches. The 2 paragraphs that differ are classified, not")
    print("     unexplained: B03-P001 is a capitalization (D-A1) and B03-P%03d"
          % len(staged))
    print("     carries 196 words the base text does not have (D-A2, a DEFECT in")
    print("     the staged original — see book03/continuity.md).")
    print("     staged original-en sha256 %s" % ORIG_SHA)
    print("     PG #1727 sha256           %s" % PG_SHA)


if __name__ == "__main__":
    main()
