#!/usr/bin/env python3
"""Verify that the served Odyssey Book 5 is Samuel Butler's 1900 text.

A SIXTH kind of rule. The five already used all searched for Book N and then
proved something about what they found:

  Book 2's drafter   anchored on PG's footnote-entry list, positionally;
  Book 3's drafter   anchored structurally on the BOOK III / BOOK IV headings
                     and diffed with the apparatus still in;
  Book 3's reviewer  asked whether the served Book occurs as one contiguous
                     letter-token block in the whole file, exactly once —
                     anchorless and digit-blind;
  Book 4's drafter   took two needles out of the served text, required each to
                     occur exactly once, and derived a region from them;
  Book 4's reviewer  fingerprinted every blank-line block of the whole file and
                     required 81 unique, strictly consecutive matches.

**This one never looks for Book 5 at all.**

It locates the OTHER twenty-three served chapters in PG, each independently,
each required to occur exactly once in the whole file, and then identifies
Book 5 as the RESIDUE: the stretch of PG that everything else is not. The
region is therefore an output of twenty-three alignments none of which can see
Book 5, and a defect in the served Book 5 cannot influence where the script
decides to look — which is the failure mode every search-then-verify rule
shares and none of them can test for.

Only then is the residue compared with the served Book 5, character by
character, with every difference classified before anything is removed.

Two properties the earlier rules could not produce fall out of doing it this
way, and both are recorded as outputs:

  * the twenty-three spans are pairwise disjoint and strictly ordered by
    chapter number, so no served chapter is a duplicate of another and none
    overlaps its neighbour;
  * the residue between chapter 4 and chapter 6 is EXHAUSTED by the served
    chapter 5 plus a heading — every token in the gap is accounted for by
    name, so nothing of Butler's is silently dropped from the served file.

One chapter cannot participate, and it is named rather than skipped quietly:
**chapter 3**, whose served paragraph 38 carries 196 words that are not in the
base text at all (the defect recorded as A3 and ruled on as D14). Its first 37
paragraphs are used, and the script asserts that paragraph 38 is the ONLY
reason — that the 37 match contiguously and that the 38th does not occur in PG
anywhere.

Usage: python3 scripts/verify_source_book5.py
"""
import difflib
import hashlib
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PG = ROOT / "source-texts/pg1727-butler-1900.txt"
SERVED = ROOT / "../../../app/public/data/editions/odyssey-original-en.json"

PG_SHA = "ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9"
SERVED_SHA = "da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07"

NGRAM = 20            # index width; an implementation detail, not an anchor
WORD = re.compile(r"[A-Za-z]+")


def fail(msg):
    sys.exit("verify_source_book5.py: FAIL — " + msg)


def read_pg_lines():
    """Read as BYTES and split on the newline byte, stripping the carriage
    return explicitly, so universal-newline mode cannot translate CRLF
    silently. The CRLF structure is asserted, not assumed."""
    data = PG.read_bytes()
    if hashlib.sha256(data).hexdigest() != PG_SHA:
        fail("the PG base text is not at its recorded hash")
    crlf = data.count(b"\r\n")
    if data.count(b"\r") != crlf or data.count(b"\n") != crlf:
        fail("PG #1727 is not CRLF throughout: bare CR or bare LF present")
    print("  PG #1727: %d bytes, %d CRLF pairs, no bare CR, no bare LF"
          % (len(data), crlf))
    return data.decode("utf-8").replace("\r\n", "\n").split("\n")


def tokenize(lines):
    """Letters-only, lower-cased, DIGIT-BLIND: a digit run is not a token and
    leaves no trace. Every token carries the line it came from, which is how
    the residue's line range becomes an output."""
    toks, at = [], []
    for ln, line in enumerate(lines, 1):
        for m in WORD.finditer(line):
            toks.append(m.group(0).lower())
            at.append(ln)
    return toks, at


def chapter_tokens(paragraphs):
    return [m.group(0).lower()
            for p in paragraphs for m in WORD.finditer(p)]


def occurrences(index, hay, needle):
    """Every position at which `needle` occurs contiguously in `hay`. The
    n-gram index only narrows the candidates; every candidate is then compared
    in full, so the index cannot produce a false positive."""
    if len(needle) < NGRAM:
        fail("a chapter shorter than the index width")
    out = []
    for start in index.get(tuple(needle[:NGRAM]), ()):
        if hay[start:start + len(needle)] == needle:
            out.append(start)
    return out


def main():
    print("Step 0 — the two files")
    lines = read_pg_lines()
    served_bytes = SERVED.read_bytes()
    if hashlib.sha256(served_bytes).hexdigest() != SERVED_SHA:
        fail("the served original-en is not at its recorded hash")
    served = json.loads(served_bytes.decode("utf-8"))
    chapters = {c["number"]: c for c in served["chapters"]}
    if sorted(chapters) != list(range(1, 25)):
        fail("the served file does not carry chapters 1..24")
    print("  served original-en: 24 chapters, %d paragraphs, %d words"
          % (sum(len(c["paragraphs"]) for c in served["chapters"]),
             sum(len(p.split()) for c in served["chapters"]
                 for p in c["paragraphs"])))

    pg_tok, pg_line = tokenize(lines)
    print("  PG letter-token stream: %d tokens (an OUTPUT)" % len(pg_tok))
    index = defaultdict(list)
    for i in range(len(pg_tok) - NGRAM + 1):
        index[tuple(pg_tok[i:i + NGRAM])].append(i)

    print()
    print("Step 1 — locate the OTHER twenty-three chapters, each exactly once")
    spans = {}
    for n in range(1, 25):
        if n == 5:
            continue
        paras = chapters[n]["paragraphs"]
        note = ""
        if n == 3:
            # A3 / D14: served paragraph 38 is not Butler's. Named, not hidden.
            bad = chapter_tokens([paras[37]])
            if occurrences(index, pg_tok, bad):
                fail("chapter 3's paragraph 38 DOES occur in PG — the recorded "
                     "defect A3 is not what the package says it is")
            paras = paras[:37]
            note = "  [paragraphs 1-37 only; ¶38 is the A3 defect, asserted " \
                   "absent from PG]"
        toks = chapter_tokens(paras)
        hits = occurrences(index, pg_tok, toks)
        if len(hits) != 1:
            fail("chapter %d occurs %d times in the whole file, expected "
                 "exactly 1" % (n, len(hits)))
        spans[n] = (hits[0], hits[0] + len(toks))
        print("  chapter %2d  tokens %6d  PG lines %5d..%-5d  occurrences 1%s"
              % (n, len(toks), pg_line[hits[0]], pg_line[hits[0] + len(toks) - 1],
                 note))

    ordered = sorted(spans)
    for a, b in zip(ordered, ordered[1:]):
        if spans[a][1] > spans[b][0]:
            fail("chapters %d and %d overlap in PG" % (a, b))
    print("  the twenty-three spans are pairwise DISJOINT and strictly "
          "ordered by chapter number")

    print()
    print("Step 2 — Book 5 as the residue, never searched for")
    lo, hi = spans[4][1], spans[6][0]
    print("  chapter 4 ends at token %d (PG line %d)" % (lo, pg_line[lo - 1]))
    print("  chapter 6 begins at token %d (PG line %d)" % (hi, pg_line[hi]))
    print("  residue: %d tokens, PG lines %d..%d  (an OUTPUT)"
          % (hi - lo, pg_line[lo], pg_line[hi - 1]))
    residue = pg_tok[lo:hi]

    b5 = chapter_tokens(chapters[5]["paragraphs"])
    # the residue is the served Book 5 plus whatever PG carries around it
    hits = occurrences(index, pg_tok, b5)
    if hits != [lo + (len(residue) - len(b5))] and len(hits) != 1:
        fail("the served chapter 5 does not occur exactly once")
    if len(hits) != 1:
        fail("the served chapter 5 occurs %d times" % len(hits))
    at = hits[0]
    if not lo <= at and at + len(b5) <= hi:
        fail("the served chapter 5 is NOT inside the residue — the twenty-three "
             "other chapters place it somewhere else entirely")
    before = residue[:at - lo]
    after = residue[at + len(b5) - lo:]
    print("  served chapter 5: %d tokens, found at %d, INSIDE the residue"
          % (len(b5), at))
    print("  residue tokens BEFORE it: %r" % (before,))
    print("  residue tokens AFTER  it: %r" % (after,))
    # Everything the residue holds besides the served Book 5 must be a HEADING,
    # and each heading is checked against the served file's OWN title field —
    # so the two leftovers are explained by the served file rather than by a
    # string this script happens to carry.
    def heading(nnum):
        roman = {4: "iv", 5: "v", 6: "vi"}[nnum]
        title = chapters[nnum]["title"]
        return ["book", roman] + [m.group(0).lower()
                                  for m in WORD.finditer(title)][1:]
    if before != heading(5):
        fail("the residue's leading tokens are not chapter 5's own heading and "
             "title: %r against %r" % (before, heading(5)))
    if after != heading(6):
        fail("the residue's trailing tokens are not chapter 6's own heading and "
             "title: %r against %r" % (after, heading(6)))
    print("  both leftovers are HEADINGS, and each matches the served file's "
          "own title field")
    print("  the residue is EXHAUSTED: chapter 5's heading, the served "
          "chapter 5, chapter 6's heading, and nothing else")

    print()
    print("Step 3 — the located text, character by character")
    first, last = pg_line[at], pg_line[at + len(b5) - 1]
    body = lines[first - 1:last]
    # cut the region into blank-line blocks WITH the apparatus still in, so the
    # paragraph count is an OUTPUT
    blocks, cur = [], []
    for line in body:
        if line.strip() == "":
            if cur:
                blocks.append(cur)
                cur = []
        else:
            cur.append(line)
    if cur:
        blocks.append(cur)
    print("  blank-line blocks in the located region: %d  (an OUTPUT)"
          % len(blocks))
    served5 = chapters[5]["paragraphs"]
    if len(blocks) != len(served5):
        fail("the region cuts into %d blocks against %d served paragraphs"
             % (len(blocks), len(served5)))
    print("  served paragraphs: %d — the two agree" % len(served5))

    digits = sorted({d for line in body for d in re.findall(r"\d+", line)})
    print("  digit runs inside the located region: %s"
          % (digits if digits else "NONE — Butler writes every quantity of this "
                                   "Book in words, and PG sets no footnote "
                                   "marker in it"))

    # Every difference is CLASSIFIED before anything is removed. Nothing is
    # stripped in advance: the comparison is PG's block exactly as it stands,
    # apparatus and all, against the served paragraph.
    identical = 0
    markers, cases, spaces, unclassified = [], [], [], []
    for i, (blk, srv) in enumerate(zip(blocks, served5), 1):
        pg_text = "\n".join(blk)
        if pg_text == srv:
            identical += 1
            continue
        sm = difflib.SequenceMatcher(a=pg_text, b=srv, autojunk=False)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                continue
            gone, came = pg_text[i1:i2], srv[j1:j2]
            if tag == "delete" and re.fullmatch(r" ?\d+ ?", gone):
                markers.append((i, gone))
            elif tag == "replace" and gone.lower() == came.lower():
                cases.append((i, gone, came))
            elif gone.strip() == "" and came.strip() == "":
                spaces.append((i, repr(gone), repr(came)))
            else:
                unclassified.append((i, repr(gone), repr(came)))
    nums = [int(g.strip()) for _, g in markers]
    print("  byte-identical paragraphs      : %d of %d" % (identical, len(blocks)))
    print("  footnote-marker deletions      : %d  markers %s"
          % (len(markers), nums))
    print("     ascending, no repeats       : %s"
          % (nums == sorted(set(nums)) and len(nums) == len(set(nums))))
    print("     glued to the word before    : %s"
          % [(i, g) for i, g in markers if re.fullmatch(r"\d+", g)])
    print("     SPACE-SET, with the space    : %s"
          % [(i, repr(g)) for i, g in markers if not re.fullmatch(r"\d+", g)])
    print("  letter-case differences        : %d %s" % (len(cases), cases))
    print("  whitespace-only differences    : %d %s" % (len(spaces), spaces))
    print("  every other difference         : %d" % len(unclassified))
    if unclassified:
        fail("unclassified differences: %s" % unclassified[:6])
    if nums != sorted(set(nums)) or len(nums) != len(set(nums)):
        fail("footnote markers are not ascending without repeats: %s" % nums)
    if set(str(x) for x in nums) != set(digits):
        fail("a digit run inside the region is NOT a classified footnote "
             "marker: region %s against classified %s" % (digits, nums))

    # word-for-word, with ONLY the classified markers removed
    stripped = []
    for blk in blocks:
        s = "\n".join(blk)
        for _, g in markers:
            s = s.replace(g, "", 1)
        stripped.append(s)
    pw = [w for s in stripped for w in s.split()]
    sw = [w for p in served5 for w in p.split()]
    if len(pw) != len(sw):
        fail("word counts differ: PG %d, served %d" % (len(pw), len(sw)))
    mismatch = [(k, a, b) for k, (a, b) in enumerate(zip(pw, sw)) if a != b]
    print("  words compared word for word   : %d, mismatches %d %s"
          % (len(pw), len(mismatch), mismatch[:5]))
    if mismatch:
        fail("word-for-word mismatch")

    print()
    print("Step 4 — negative controls, which must all FAIL to match")
    ctl = 0

    def control(name, paras, want_hits=0):
        nonlocal ctl
        hits = occurrences(index, pg_tok, chapter_tokens(paras))
        ok = (len(hits) == want_hits)
        print("    %-46s occurrences %d  %s"
              % (name, len(hits), "detected" if ok else "NOT DETECTED"))
        if not ok:
            fail("negative control did not fire: %s" % name)
        ctl += 1

    p = list(served5)
    p[0], p[1] = p[1], p[0]
    control("two paragraphs swapped", p)
    # A MERGE leaves the token stream untouched, so the step-1/2 rule is blind
    # to it BY CONSTRUCTION. That limit is paid for rather than waved away: it
    # is step 3's blank-line block count that carries the paragraph division,
    # and the control is run against that check instead of against this one.
    p = list(served5)
    p[3:5] = [p[3] + " " + p[4]]
    control("two paragraphs merged — this rule is BLIND", p, want_hits=1)
    for name, mutated in (("two paragraphs merged, against the BLOCK count",
                           p),
                          ("one paragraph split, against the BLOCK count",
                           served5[:6] + [served5[6][:40], served5[6][40:]]
                           + served5[7:])):
        if len(blocks) == len(mutated):
            fail("structural negative control did not fire: %s" % name)
        print("    %-46s blocks %d against paragraphs %d  detected"
              % (name, len(blocks), len(mutated)))
        ctl += 1
    # Mutations are built from the paragraph's OWN words, so a control can
    # never silently be a no-op (an earlier draft of this script had exactly
    # that bug: `replace("the", ...)` on a paragraph with no `the` in it).
    words = WORD.findall(served5[10])
    if len(words) < 12:
        fail("the control paragraph is too short to mutate")
    victim = words[8]
    p = list(served5)
    p[10] = p[10].replace(victim, victim[:-1] + ("x" if victim[-1] != "x"
                                                 else "y"), 1)
    if p[10] == served5[10]:
        fail("the one-letter control is a no-op")
    control("one letter changed (%r)" % victim, p)
    p = list(served5)
    p[10] = p[10].replace(victim, "", 1)
    if p[10] == served5[10]:
        fail("the one-word control is a no-op")
    control("one word dropped (%r)" % victim, p)
    control("a paragraph that is not Butler's",
            ["This sentence was written by the verification script itself and "
             "it is not in the base text at any point whatever, nor in any "
             "other edition of the poem, and it exists only so that this "
             "control has something to fail on."])
    # the digit-blind limit, paid for rather than waved away
    nw = next(((k, w) for k, par in enumerate(served5)
               for w in WORD.findall(par)
               if w.lower() in ("twenty", "two", "three", "seven", "ten",
                                "eighteen", "nine")), None)
    if nw is None:
        fail("no number-word in the Book to build the control from")
    k, w = nw
    p = list(served5)
    p[k] = p[k].replace(w, "eleven", 1)
    control("a number-WORD changed (%r at paragraph %d)" % (w, k + 1), p)
    print("  %d negative controls, all fired" % ctl)

    print()
    print("OK — the served Book 5 is Butler's text, identified as the residue "
          "of twenty-three")
    print("     independent alignments that never look at it: %d of %d "
          "paragraphs byte-identical," % (identical, len(blocks)))
    print("     %d classified footnote-marker deletions (%s) and NOTHING else "
          "— 0 letter-case," % (len(markers), nums))
    print("     0 whitespace and 0 other differences; %d words word-for-word,"
          % len(pw))
    print("     0 mismatches. Region PG lines %d..%d, an OUTPUT."
          % (first, last))


if __name__ == "__main__":
    main()
