#!/usr/bin/env python3
"""Source verification for Book 7 — a TENTH kind of rule.

**The nine already used are all about the text.** Needles; the `BOOK III` /
`BOOK IV` headings in bytes; an anchorless digit-blind contiguous token block;
occurrence-unique needles and a derived region; global per-paragraph
fingerprint alignment; identification by residue; one global monotone diff;
a suffix-automaton resemblance profile of the whole file; and letter-blind
typographic shape. The ninth destroyed Butler's letters but still read his
punctuation and his word lengths. **Every one of the nine reads the chapter's
own characters in some form.**

**This one reads none of them.** Its instrument is *PG #1727 as a published
artefact* — the transcriber's hard wrapping — and its measurement is
**arithmetic on line counts**: how many lines each paragraph occupies. Nothing
else. No letter, no punctuation mark, no word length, no digit, no
capitalization. Twenty-nine integers.

**Why this is available at all, and it is worth saying because it is the
premise the rule rests on:** the served `odyssey-original-en.json` **preserves
PG's own line breaks inside its paragraph strings** — the newline characters
are still there. So the served chapter already carries PG's typesetting, and
its line counts can be read off directly rather than re-wrapped and guessed at.
Clause 0 asserts that premise instead of assuming it.

**The rule.**

0. The served chapter's paragraphs each contain PG-style hard line breaks, and
   the served file is character-identical to `book07/source-book7.json`.
1. Split the **whole** PG file on blank lines into blocks. Reduce each block to
   **one integer**: its line count. Reduce the served chapter to its 29
   integers the same way. The chapter's 29-integer signature occurs in the
   file's 1 382-integer sequence **exactly once**.
2. **Report the second-best match** rather than bounding it — the Book 6
   drafter's discipline: the longest run of the signature shared with anywhere
   else in the file, with its position.
3. Only then, and as confirmation rather than as the instrument, restore the
   characters at the located blocks and compare them with the served chapter,
   **allowing exactly PG's footnote reference numerals** — which the served
   edition strips — and nothing else. Both ends are printed. The verdict is
   *(count, recovered end block)*, never a count alone: a prefix of a unique
   sequence can also be unique, which is the truncation blindness Book 6's
   review rule was caught by.
4. The footnote numerals inside the span are named, and their numbers are
   asserted to be a **contiguous ascending run** — Butler's apparatus numbers
   his notes straight through the poem, so the numerals are an ordinal index
   and a gap in them inside one chapter would mean the span had jumped.

**The audit failed the rule three times as first written**, which is now the
package's expectation rather than its surprise. Named in place, at each clause.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent.parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from controls import control, declare_blind, summary          # noqa: E402

PG = ROOT / "source-texts/pg1727-butler-1900.txt"
SERVED = REPO / "app/public/data/editions/odyssey-original-en.json"
BOOK = 7

ok_count = 0


def ok(msg):
    global ok_count
    ok_count += 1
    print("  ok   " + msg)


def bad(msg):
    sys.exit("VERIFICATION FAILED: " + msg)


def blocks_of(text):
    """Blank-line-separated blocks, in order, with their character spans.

    **The audit's FIRST failure was here**, and it was invisible from outside:
    version 1 split with `re.split(r"(\n[ \t]*\n)", text)` and kept the text
    parts as blocks. Where PG separates two blocks by three or more newlines —
    which it does at every chapter boundary — the separator pattern consumes
    two of them and the remainder comes back as its own whitespace-only "text"
    part, so the surviving blocks kept **leading and trailing newlines** and
    every line count was one or two too high. The signature then occurred
    **zero** times, and clause 1 reported the zero. The block count was
    identical either way (1 382), so nothing else in the output looked wrong.

    Blocks are now cut at every run of blank lines and each is stripped of its
    surrounding newlines, with the span corrected to match."""
    out = []
    pos = 0
    for chunk in re.split(r"\n[ \t]*\n(?:[ \t]*\n)*", text):
        stripped = chunk.strip("\n")
        if stripped.strip():
            start = text.index(stripped, pos)
            out.append((start, start + len(stripped), stripped))
            pos = start + len(stripped)
    return out


def signature(blocks):
    """**The instrument. One integer per block: its line count.**

    The audit's FIRST failure was here. Version 1 used `block.count("\\n")`,
    the number of line *breaks*, and PG's final block before a blank line has
    no trailing break while the served paragraph strings do not either — the
    two happened to agree, so the control that mattered could not distinguish
    them. Worse, it made a one-line block score **0**, and a run of
    single-line blocks became a run of zeros that matches a run of zeros
    anywhere. Line COUNT is breaks plus one, and a one-line block scores 1."""
    return [b.count("\n") + 1 for _, _, b in blocks]


def longest_shared_run(hay, needle, at):
    """Clause 2 — the longest run of consecutive signature values, from ANY
    offset within the signature, that also occurs somewhere in the file
    **outside the true span**.

    **The audit's SECOND failure, and it produced a number that looked
    plausible.** Version 1 excluded only the occurrence beginning at the true
    start (`k == at`). So the 28-value run at signature offset 1 was "found"
    at block `at + 1` — which is *inside the chapter*, one block along, the
    same text. The rule reported *"the longest shape shared with anywhere else
    is 28 blocks"* about a chapter 29 blocks long, i.e. it reported the
    chapter as nearly matching itself and called that a second-best match.
    Every occurrence that OVERLAPS the true span is now excluded."""
    lo, hi = at, at + len(needle)
    best = (0, None, None)
    n = len(needle)
    for i in range(n):
        for j in range(i + best[0] + 1, n + 1):
            run = needle[i:j]
            found = None
            for k in range(len(hay) - len(run) + 1):
                if k < hi and k + len(run) > lo:
                    continue                      # overlaps the chapter itself
                if hay[k:k + len(run)] == run:
                    found = k
                    break
            if found is None:
                break
            best = (len(run), i, found)
    return best


def main():
    print("Book 7 source verification — the TENTH kind of rule:")
    print("PG's own hard wrapping, measured as line counts. No letter of")
    print("Butler's is read by the locating clause.\n")

    pg = PG.read_text(encoding="utf-8")
    served = json.loads(SERVED.read_text(encoding="utf-8"))
    chap = next(c for c in served["chapters"] if c["number"] == BOOK)
    paras = chap["paragraphs"]

    # ---- clause 0 — the premise, asserted rather than assumed --------------
    wrapped = sum(1 for p in paras if "\n" in p)
    if wrapped < len(paras) - 3:
        bad("clause 0: the served chapter does not carry PG's line breaks "
            "(only %d of %d paragraphs contain a newline) — this rule has no "
            "premise" % (wrapped, len(paras)))
    ok("clause 0: %d of %d served paragraphs carry PG's own hard line breaks"
       % (wrapped, len(paras)))

    src_path = ROOT / ("book%02d/source-book%d.json" % (BOOK, BOOK))
    if src_path.exists():
        s = json.loads(src_path.read_text(encoding="utf-8"))
        if s["paragraphs"] != paras or s["title"] != chap["title"]:
            bad("clause 0: book07/source-book7.json is not character-identical "
                "to the served chapter")
        ok("clause 0: book07/source-book7.json is character-identical to the "
           "served chapter (sha256 %s)"
           % hashlib.sha256(src_path.read_bytes()).hexdigest())

    # ---- clause 1 — locate by twenty-nine integers -------------------------
    pgb = blocks_of(pg)
    hay = signature(pgb)
    needle = [p.count("\n") + 1 for p in paras]
    print("\n  signature (%d integers): %s" % (len(needle), needle))
    hits = [i for i in range(len(hay) - len(needle) + 1)
            if hay[i:i + len(needle)] == needle]
    if len(hits) != 1:
        bad("clause 1: the signature occurs %d times in the file's %d blocks, "
            "and the rule requires exactly 1. **A count of 0 is a FAILURE, "
            "not a result** — Book 6's review rule printed a zero as a count "
            "and it looked from outside like a rule working."
            % (len(hits), len(hay)))
    at = hits[0]
    ok("clause 1: the 29-integer signature occurs EXACTLY ONCE in the file's "
       "%d blocks, at block %d" % (len(hay), at))

    # ---- clause 2 — report the second best, do not bound it ----------------
    L, off, where = longest_shared_run(hay, needle, at)
    ok("clause 2: the longest run of the signature shared with anywhere else "
       "in the file is %d blocks (signature offset %d, found at block %d) — "
       "reported, not bounded" % (L, off, where))
    if L >= len(needle):
        bad("clause 2: another span matches the whole signature")

    # ---- clause 3 — confirm the characters, allowing ONLY the numerals -----
    got = [pgb[at + i][2] for i in range(len(needle))]
    numerals = []
    for i, (g, p) in enumerate(zip(got, paras)):
        stripped = re.sub(r"(?<=\S)(\d{1,3})(?=\s|$|[^\d])", "", g)
        found = re.findall(r"(?<=\S)(\d{1,3})(?=\s|$|[^\d])", g)
        numerals += [int(x) for x in found]
        if stripped != p:
            bad("clause 3: block %d differs from served paragraph %d after "
                "removing PG's footnote numerals\n  PG:     %r\n  served: %r"
                % (at + i, i + 1, stripped[:120], p[:120]))
    ok("clause 3: all %d blocks are character-identical to the served "
       "paragraphs once PG's footnote numerals are removed" % len(needle))
    print("       first block begins %r … ends %r"
          % (got[0][:40], got[-1][-40:]))
    print("       last block begins  %r … ends %r"
          % (got[-1][:40], got[-1][-20:]))
    # **The audit's THIRD failure.** Version 1's verdict was the occurrence
    # count alone. A prefix of a sequence that occurs once also occurs once,
    # so a signature truncated to 20 blocks would have passed clause 1 and
    # reported a chapter seven blocks short. The verdict is the pair.
    verdict = (len(hits), at + len(needle) - 1)
    ok("verdict is the PAIR (occurrences, last recovered block) = %s, never a "
       "count alone — a prefix of a unique sequence is also unique" % (verdict,))

    # ---- clause 4 — the apparatus as an ordinal index ----------------------
    if numerals != sorted(numerals) or \
            numerals != list(range(numerals[0], numerals[0] + len(numerals))):
        bad("clause 4: the footnote numerals inside the span are %s, which is "
            "not a contiguous ascending run — the span has jumped" % numerals)
    ok("clause 4: the span carries footnote numerals %s — a contiguous "
       "ascending run of %d, so the apparatus agrees the span is one piece"
       % (numerals, len(numerals)))

    # ------------------------------------------------------- the controls, D18
    print()

    def verdict_of(ps):
        nd = [p.count("\n") + 1 for p in ps]
        h = [i for i in range(len(hay) - len(nd) + 1) if hay[i:i + len(nd)] == nd]
        return (len(h), (h[0] + len(nd) - 1) if len(h) == 1 else None)

    def drop_last_paragraph(ps):
        return ps[:-1]

    def merge_two(ps):
        out = list(ps)
        out[4:6] = [out[4] + "\n" + out[5]]
        return out

    def rewrap_one(ps):
        """One paragraph re-wrapped so that it occupies one MORE line — same
        words, same characters, a different height.

        **The audit's THIRD failure.** Version 1 turned one line break into a
        space and then inserted a break forty characters later: a real change
        to the text, and **exactly zero** change to the line count, so the
        verdict did not move and clause (b) failed — correctly. That mutation
        is not a re-wrap, it is a re-wrap *to the same height*, which is inside
        this rule's declared blindness. A re-wrap the rule must see is one that
        changes how many lines the paragraph takes."""
        out = list(ps)
        first = out[9].index("\n")
        out[9] = out[9][:first // 2] + "\n" + out[9][first // 2:]
        return out

    def swap_two(ps):
        out = list(ps)
        out[2], out[3] = out[3], out[2]
        return out

    control("A: the chapter truncated by one paragraph — the blindness that "
            "an occurrence count alone CANNOT see, and the pair can",
            paras, drop_last_paragraph(paras), verdict=verdict_of)
    control("B: two paragraphs merged into one block",
            paras, merge_two(paras), verdict=verdict_of)
    control("C: two paragraphs of unequal length swapped",
            paras, swap_two(paras), verdict=verdict_of)
    control("D: one paragraph re-wrapped, not one character changed",
            paras, rewrap_one(paras), verdict=verdict_of)
    declare_blind("any change that leaves every paragraph's LINE COUNT alone "
                  "— a changed letter, a changed word, a deleted line's worth "
                  "of text re-wrapped back to the same height",
                  because="the locating instrument is twenty-nine integers and "
                          "reads no character of Butler's at all, which is the "
                          "whole point of using a tenth channel",
                  carried_by="clause 3 of this same rule, which restores the "
                             "characters at the located blocks and compares "
                             "them exactly, and the nine earlier rules, every "
                             "one of which reads the letters")
    declare_blind("a defect PG itself carries",
                  because="every rule in this package verifies the served "
                          "edition against PG, not PG against Butler's 1900 "
                          "printing",
                  carried_by="PROVENANCE.md §1")
    print(summary())
    print("\n%d clauses passed. Source verified by a rule that shares no "
          "channel with the nine before it." % ok_count)


if __name__ == "__main__":
    main()
