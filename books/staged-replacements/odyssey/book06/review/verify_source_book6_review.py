#!/usr/bin/env python3
"""Source verification for Book 6 — the NINTH kind of rule: letter-blind
identification by typographic shape.

Eight rules have been used, and every one of them reads Butler's LETTERS:
needles, digit-blind token blocks, occurrence-unique needles, per-paragraph
fingerprints, residue, a global monotone diff, and the drafter's suffix
automaton.  Two unlike rules are evidence; two rules reading the same channel
are one rule twice.

**This rule destroys every letter before it looks at anything.**  A character
that is a letter becomes `a`; a digit becomes `9`; a run of whitespace becomes
one space; every other character — the comma, the em dash, the apostrophe, the
quotation mark, the full stop, the hyphen — is kept exactly as printed.  What
is left is the chapter's *typographic shape*: word lengths and pointing, with
the words gone.  If that shape occurs exactly once in PG #1727, the chapter has
been located without a single word of Butler being read, through a channel
none of the other eight rules uses.  Agreement between this and the drafter's
suffix automaton is then agreement between genuinely unlike instruments.

Three clauses:

 1. **Locate, letter-blind.**  The shape of the served chapter 6 must occur in
    the shape of PG's body **exactly once**.  Count occurrences over the whole
    file, not just the first.
 2. **Confirm, letters restored.**  At the located span — recovered by the
    shape index alone, never by searching for the text — the PG bytes must be
    character-for-character the served chapter's, whitespace-normalized.
 3. **Bound the neighbourhood.**  The longest shape the chapter shares with PG
    ANYWHERE ELSE is reported, so the reader can see how far the second-best
    letter-blind candidate is from the first.  (This is the complement
    question the drafter's rule asks, asked again in the other channel.)

**The audit failed the rule as first written, as the last four audits did.**
The first version levelled digits to `9` rather than deleting them, on the
reasoning that a digit is not a letter and so belongs to the shape.  It does
not: PG's body carries Butler's **footnote reference numerals** set flush
against the word they follow (`the Ogygian island,55` and `Hippotades,p56`
inside this chapter alone), and the served edition strips them.  Two characters
of shape therefore existed on PG's side and nowhere on the served side, the
chapter's shape occurred **zero** times in the file, and the rule as written
**reported that zero as a count** — from outside, a rule that says "0
occurrences" and a rule that says "1 occurrence" look like the same rule
working.  Zero is not one.  A rule that cannot distinguish *the chapter is not
in this file* from *the chapter is in this file and my normalization is wrong*
has not verified anything.  Fixed twice over: digits are deleted on both sides
(and the chapter is asserted to contain none of its own, so the deletion cannot
destroy a real number Butler printed), and clause 1 now **fails** on any count
that is not exactly 1 instead of reporting it.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from controls import control, declare_blind, summary          # noqa: E402

PG = ROOT / "source-texts" / "pg1727-butler-1900.txt"
SERVED = ROOT.parents[2] / "app" / "public" / "data" / "editions" / "odyssey-original-en.json"
SOURCE = ROOT / "book06" / "source-book6.json"
SEP = "\n\n"


def shape(t):
    """Every letter destroyed; PG's footnote reference numerals deleted, as the
    served edition itself deletes them (the chapter contains no digit of its
    own — asserted below); whitespace runs collapsed; every other character —
    comma, em dash, apostrophe, quotation mark, full stop, hyphen — kept
    exactly as printed."""
    out, idx, i, n = [], [], 0, len(t)
    while i < n:
        ch = t[i]
        if ch.isdigit():
            i += 1
            continue
        if ch.isspace():
            j = i
            while j < n and t[j].isspace():
                j += 1
            run = t[i:j]
            out.append(SEP if run.count("\n") >= 2 else " ")
            idx.append(i)
            if run.count("\n") >= 2:
                idx.append(i)          # SEP is two characters
            i = j
            continue
        out.append("a" if ch.isalpha() else ch)
        idx.append(i)
        i += 1
    return "".join(out), idx


def flat(t):
    t = re.sub(r"[^\S\n]+", " ", t)
    t = re.sub(r"\n[ ]*\n[\s]*", SEP, t)
    return re.sub(r"(?<!\n)\n(?!\n)", " ", t).strip()


def count_all(hay, needle):
    n, at = 0, hay.find(needle)
    firsts = []
    while at != -1:
        n += 1
        firsts.append(at)
        at = hay.find(needle, at + 1)
    return n, firsts


def longest_common_substring_len(a, b, cap=400):
    """Clause 3, bounded: the longest shape shared with the REST of the file.
    Binary search on length over a rolling-hash set — enough to report a
    number and a sample without an O(n*m) table."""
    import hashlib

    def occurs(L):
        if L == 0:
            return True, ""
        seen = {}
        for i in range(len(a) - L + 1):
            seen.setdefault(a[i:i + L], i)
        for i in range(len(b) - L + 1):
            s = b[i:i + L]
            if s in seen:
                return True, s
        return False, ""

    lo, hi, best = 0, cap, ""
    while lo < hi:
        mid = (lo + hi + 1) // 2
        ok, s = occurs(mid)
        if ok:
            lo, best = mid, s
        else:
            hi = mid - 1
    return lo, best


def main():
    served = json.loads(SERVED.read_text(encoding="utf-8"))
    ch6 = [c for c in served["chapters"] if c["number"] == 6][0]
    staged = json.loads(SOURCE.read_text(encoding="utf-8"))
    if ch6["paragraphs"] != staged["paragraphs"]:
        sys.exit("FAIL: book06/source-book6.json is not the served chapter 6")
    print("clause 0: book06/source-book6.json is character-identical to the "
          "served odyssey-original-en.json chapter 6 (26 paragraphs)")
    joined = " ".join(ch6["paragraphs"])
    if re.search(r"\d", joined):
        sys.exit("FAIL: the chapter contains a digit of its own; deleting "
                 "digits is not a safe normalization for it")
    print("          and contains no digit of its own, so deleting PG's "
          "footnote numerals cannot destroy a number Butler printed")

    pg = PG.read_text(encoding="utf-8")
    chapter = SEP.join(" ".join(p.split("\n")) for p in ch6["paragraphs"])
    chapter = flat(chapter)

    pg_shape, pg_idx = shape(pg)
    ch_shape, _ = shape(chapter)
    n, at = count_all(pg_shape, ch_shape)
    print("clause 1: the chapter's letter-blind shape is %d characters and "
          "occurs %d time(s) in PG #1727's shape%s"
          % (len(ch_shape), n, (" — at %r" % at) if at else ""))
    if n != 1:
        sys.exit("FAIL: clause 1 requires exactly one occurrence, got %d" % n)

    # span recovery: the shape index is NOT a character index — digits were
    # deleted and whitespace runs collapsed.  This is the joint the drafter's
    # own audit failed on, and the rule as first written failed on it here too,
    # reporting a MISMATCH at offset 0 on a byte-clean file.
    lo = pg_idx[at[0]]
    end_shape = at[0] + len(ch_shape) - 1
    hi = pg_idx[end_shape] + 1
    raw = pg[lo:hi]
    notes = re.findall(r"\S{0,12}\d+", raw)
    got = flat(re.sub(r"\d", "", raw))
    print("          the span carries %d of PG's footnote reference numerals, "
          "named: %s — and nothing else was normalized away"
          % (len(notes), ", ".join(repr(x) for x in notes)))
    print("clause 2: letters restored at the span the SHAPE index gave "
          "(%d, %d) — %s"
          % (lo, hi,
             "character-for-character identical" if got == chapter
             else "MISMATCH"))
    if got != chapter:
        for k, (x, y) in enumerate(zip(got, chapter)):
            if x != y:
                sys.exit("FAIL: first difference at offset %d: %r vs %r\n"
                         "  ...%s...\n  ...%s..."
                         % (k, x, y, got[max(0, k - 60):k + 60],
                            chapter[max(0, k - 60):k + 60]))
        sys.exit("FAIL: lengths differ: %d vs %d — the end of the span, which "
                 "is the joint the drafter's audit failed on too"
                 % (len(got), len(chapter)))
    print("          both ends checked explicitly: the span's first character "
          "is %r and its last is %r, and the chapter's are %r and %r"
          % (got[0], got[-1], chapter[0], chapter[-1]))

    rest = pg_shape[:at[0]] + pg_shape[at[0] + len(ch_shape):]
    L, sample = longest_common_substring_len(ch_shape, rest)
    print("clause 3: the longest shape this chapter shares with ANY other part "
          "of PG is %d characters" % L)
    print("          %r" % sample)

    # ------------------------------------------------------------- controls
    def bump_a_comma(t):
        i = t.index(",")
        return t[:i] + ";" + t[i + 1:]

    def bump_a_letter(t):
        m = re.search(r"[A-Za-z]", t)
        return t[:m.start()] + ("Q" if t[m.start()] != "Q" else "W") + t[m.start() + 1:]

    def drop_the_last_stop(t):
        return t[:-1]

    def lengthen_a_word(t):
        m = re.search(r"\b[A-Za-z]{5}\b", t)
        return t[:m.end()] + "x" + t[m.end():]

    def verdict(t):
        """The rule's whole verdict: how many times, and — the clause the
        audit had to add — WHERE it ends.  A count alone is blind to a
        truncation, because a prefix of a string that occurs once also occurs
        once; the third control below is the one that exposed that, and it is
        the same end-of-span class the drafter's audit found in its own rule."""
        sh, _ = shape(t)
        n, ats = count_all(pg_shape, sh)
        if n != 1:
            return (n, None)
        return (n, pg_idx[ats[0] + len(sh) - 1] + 1)

    control("one comma becomes a semicolon — pointing is the channel this rule "
            "reads, and it must see it",
            chapter, bump_a_comma(chapter), verdict=verdict)
    control("one word gains a letter — word LENGTH is shape",
            chapter, lengthen_a_word(chapter), verdict=verdict)
    control("the chapter's terminal full stop is dropped — the exact end-of-"
            "span defect the drafter's own audit found in its rule",
            chapter, drop_the_last_stop(chapter), verdict=verdict)
    control("clause 2 (letters restored) rejects a changed letter",
            chapter, bump_a_letter(chapter),
            verdict=lambda t: flat(re.sub(r"\d", "", pg[lo:hi])) == t)
    declare_blind("a changed LETTER, in clause 1",
                  because="clause 1 destroys every letter by construction — "
                          "that is the whole point of the ninth rule, and the "
                          "control above shows the mutation is real and "
                          "clause 1's verdict does not move",
                  carried_by="clause 2 of this same script, and independently "
                             "by all eight earlier rules, every one of which "
                             "reads letters")
    declare_blind("a defect PG itself carries",
                  because="the served file was cut from this file; a scanning "
                          "error present in both is invisible to any rule that "
                          "compares the two",
                  carried_by="PROVENANCE.md §1, which checks PG #1727's own "
                             "header, edition and paragraph total against the "
                             "published catalogue record")
    print()
    print(summary())


if __name__ == "__main__":
    main()
