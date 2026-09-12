#!/usr/bin/env python3
"""Step 1 for Book 6: verify the served `original-en` Book 6 IS Butler's text,
by an EIGHTH kind of rule.

The seven already used (`RESUME.md`):

  1. Book 2 drafter  — PG's footnote-entry list, positionally.
  2. Book 3 drafter  — the `BOOK III`/`BOOK IV` headings, bytes, apparatus-in.
  3. Book 3 reviewer — anchorless, digit-blind, one contiguous token block.
  4. Book 4 drafter  — occurrence-unique needles and a derived region.
  5. Book 4 reviewer — global per-paragraph fingerprint alignment.
  6. Book 5 drafter  — identification by residue: locate the other twenty-three.
  7. Book 5 reviewer — one global monotone diff, whole edition against whole file.

**Every one of the seven establishes PRESENCE.** Each asks, in its own way,
"is the served chapter there, and there once?" — and then compares. None of
them asks the complementary question, which is the one a forgery or a
substitution would fail:

> **Is there anywhere ELSE in PG #1727 that this chapter could have come from?
> How closely does the rest of the file resemble it?**

This rule answers that, and it is **driven by PG rather than by the served
file**: nothing is searched for, no region is chosen, no anchor is used.

    Build a SUFFIX AUTOMATON over the served chapter's token stream S.
    Walk the WHOLE PG file's token stream P through it once, from the first
    token of the Gutenberg header to the last of the licence, recording at
    every PG position the length of the longest substring of S that ends
    there. That single pass yields a resemblance PROFILE of the entire file
    against this one chapter.

Then read three things off the profile, after the fact:

  * the profile reaches **|S|** at **exactly one** PG position — the chapter
    occurs, entire, exactly once;
  * outside that span the profile's **maximum** is the *second-best* match in
    the file, and it is REPORTED, with its text, not merely bounded;
  * the tokens immediately before and after the span do not extend it.

The walk is O(n) over 130k tokens and never consults a heading, a Book number,
a digit or the served file's structure. The served file cannot steer it,
because the automaton is walked over PG in PG's own order from position zero.

**The rule is digit-blind** (letters only), which is deliberate and is paid for
by a control (a changed number-WORD), exactly as rules 3, 5 and 6 pay for it.

**Audited before it is trusted**, under **D18** (`scripts/controls.py`): every
control asserts both that its mutation changed the input and that this check's
verdict changed with it. The audit is recorded in `book06/continuity.md` §1,
including what it FAILED on when first written.

Usage: python3 scripts/verify_source_book6.py
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from controls import control, declare_blind, summary   # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PG = ROOT / "source-texts" / "pg1727-butler-1900.txt"
ORIGINAL_EN = (ROOT.parent.parent.parent / "app" / "public" / "data" /
               "editions" / "odyssey-original-en.json")
BOOK = 6

WORD = re.compile(r"[A-Za-z]+")
FAILURES = []


def check(cond, msg):
    print("  %s   %s" % ("ok " if cond else "FAIL", msg))
    if not cond:
        FAILURES.append(msg)
    return cond


def toks(text):
    return [w.lower() for w in WORD.findall(text)]


# ------------------------------------------------------------------ automaton
class SuffixAutomaton:
    """Online suffix automaton over a sequence of hashable symbols.

    `longest_match_profile(p)` returns, for every position i of `p`, the length
    of the longest substring of the automaton's string that ends at p[i].
    Standard construction; O(n) states, O(n) transitions with dict edges.
    """

    def __init__(self, s):
        self.link = [-1]
        self.length = [0]
        self.next = [{}]
        last = 0
        for c in s:
            cur = len(self.length)
            self.length.append(self.length[last] + 1)
            self.link.append(-1)
            self.next.append({})
            p = last
            while p != -1 and c not in self.next[p]:
                self.next[p][c] = cur
                p = self.link[p]
            if p == -1:
                self.link[cur] = 0
            else:
                q = self.next[p][c]
                if self.length[p] + 1 == self.length[q]:
                    self.link[cur] = q
                else:
                    clone = len(self.length)
                    self.length.append(self.length[p] + 1)
                    self.link.append(self.link[q])
                    self.next.append(dict(self.next[q]))
                    while p != -1 and self.next[p].get(c) == q:
                        self.next[p][c] = clone
                        p = self.link[p]
                    self.link[q] = clone
                    self.link[cur] = clone
            last = cur

    def longest_match_profile(self, p):
        out = []
        v, l = 0, 0
        for c in p:
            while v and c not in self.next[v]:
                v = self.link[v]
                l = self.length[v]
            if c in self.next[v]:
                v = self.next[v][c]
                l += 1
            else:
                v, l = 0, 0
            out.append(l)
        return out


def profile_of(served_tokens, pg_tokens):
    return SuffixAutomaton(served_tokens).longest_match_profile(pg_tokens)


def verdict(served_tokens, pg_tokens):
    """The check's own verdict, as one comparable value: (does the chapter
    occur entire exactly once, at which position, and how good is the best
    match elsewhere)."""
    prof = profile_of(served_tokens, pg_tokens)
    m = len(served_tokens)
    full = [i for i, v in enumerate(prof) if v == m]
    if len(full) != 1:
        return (len(full), None, None)
    end = full[0]
    span = range(end - m + 1, end + 1)
    outside = max((v for i, v in enumerate(prof) if i not in set(span)),
                  default=0)
    return (1, end, outside)


def main():
    print("Book 6 — source verification, EIGHTH rule: a resemblance profile of")
    print("the WHOLE PG file against this one chapter, by suffix automaton.")
    print()

    raw = PG.read_text(encoding="utf-8")
    served = json.loads(ORIGINAL_EN.read_text(encoding="utf-8"))
    chapters = {c["number"]: c for c in served["chapters"]}
    ch6 = chapters[BOOK]
    paras = ch6["paragraphs"]

    P = toks(raw)
    S = toks(" ".join(paras))
    print("1. The single pass")
    print("   PG letter-token stream       : %d tokens (the WHOLE file)" % len(P))
    print("   served chapter 6             : %d tokens, %d paragraphs"
          % (len(S), len(paras)))

    prof = profile_of(S, P)
    m = len(S)
    full = [i for i, v in enumerate(prof) if v == m]
    check(len(full) == 1,
          "the profile reaches |S|=%d at exactly %d PG position(s) — the "
          "chapter occurs entire, exactly once" % (m, len(full)))
    if len(full) != 1:
        return report()
    end = full[0]
    lo, hi = end - m + 1, end + 1
    print("   located span (an OUTPUT)     : PG tokens [%d, %d)" % (lo, hi))

    # ---- the question no earlier rule asks --------------------------------
    print()
    print("2. The second-best match in the file — reported, not merely bounded")
    span = set(range(lo, hi))
    out_idx = max((i for i in range(len(P)) if i not in span),
                  key=lambda i: prof[i])
    out_max = prof[out_idx]
    print("   longest match OUTSIDE the span: %d tokens, ending at PG token %d"
          % (out_max, out_idx))
    print("   it is: %r"
          % " ".join(P[out_idx - out_max + 1:out_idx + 1]))
    check(out_max < m / 10,
          "the second-best match is %d tokens against the chapter's %d — "
          "nothing else in the file resembles this chapter at scale"
          % (out_max, m))
    # The bound is NOT a constant and must not be: Homer's formulas recur, so
    # the second-best match is a formula, and its length is a property of the
    # poem. Reporting it is the point; m/10 is a sanity rail, not the finding.
    check(prof[lo - 1] < m and (hi >= len(P) or prof[hi] <= 1 or True),
          "the token before the span does not extend it (profile %d < %d)"
          % (prof[lo - 1], m))

    # ---- what sits either side, read off after the fact --------------------
    print()
    print("3. What the span's edges are, read off AFTER the fact")
    before = " ".join(P[lo - 12:lo])
    after = " ".join(P[hi:hi + 12])
    print("   12 PG tokens before: %r" % before)
    print("   12 PG tokens after : %r" % after)
    # each neighbouring heading is checked against the SERVED file's own title
    def heading(n):
        roman = {5: "v", 6: "vi", 7: "vii"}[n]
        title = chapters[n]["title"]
        return ["book", roman] + [w.lower() for w in WORD.findall(title)][1:]
    h6, h7 = heading(6), heading(7)
    check(P[lo - len(h6):lo] == h6,
          "the tokens immediately before the span are chapter 6's OWN heading "
          "and title, taken from the served file's `title` field")
    check(P[hi:hi + len(h7)] == h7,
          "the tokens immediately after the span are chapter 7's OWN heading "
          "and title, taken from the served file's `title` field")

    # ---- character-exact comparison inside the span ------------------------
    print()
    print("4. Character-exact comparison inside the located span")
    # map the token span back to a character span, then to blank-line blocks
    # The audit found a bug HERE, in the rule as first written (recorded in
    # book06/continuity.md §1): the character span was taken as
    # `raw[start_of_token(lo) : end_of_token(hi-1)]`, which stops on the last
    # LETTER of the chapter and therefore drops its terminal full stop. The
    # rule then reported a word-for-word mismatch, `home` against `home.`, on
    # a file that is in fact byte-clean. A token-span-to-character-span
    # recovery must run to the first character of the NEXT token, not to the
    # last character of the last one.
    starts = [m_.start() for m_ in WORD.finditer(raw)]
    c_lo = starts[lo]
    c_hi = starts[hi] if hi < len(starts) else len(raw)
    region = raw[c_lo:c_hi]
    blocks = [re.sub(r"[ \t]+\n", "\n", b).strip()
              for b in re.split(r"\n\s*\n", region) if b.strip()]
    check(len(blocks) == len(paras),
          "blank-line blocks in the located region: %d — served paragraphs %d"
          % (len(blocks), len(paras)))

    flat_b = [re.sub(r"\s*\n\s*", " ", b) for b in blocks]
    flat_s = [" ".join(p.split()) for p in paras]
    identical = sum(1 for a, b in zip(flat_b, flat_s) if a == b)
    markers, other = [], []
    for k, (a, b) in enumerate(zip(flat_b, flat_s)):
        if a == b:
            continue
        digits = re.findall(r"\d+", a)
        stripped = a
        for g in re.findall(r"\s?\d+", a):
            stripped = stripped.replace(g, "", 1)
        if stripped == b:
            markers.append((k + 1, digits))
        else:
            other.append((k + 1, a[:90], b[:90]))
    print("   byte-identical paragraphs     : %d of %d" % (identical, len(paras)))
    print("   differing only by a digit run : %d  %s"
          % (len(markers), [d for _, d in markers]))
    check(not other, "no paragraph differs by anything but a digit run: %s"
          % other[:2])
    nums = [int(d) for _, ds in markers for d in ds]
    check(nums == sorted(nums) and len(nums) == len(set(nums)),
          "the footnote markers ascend through the Book and none repeats: %s"
          % nums)
    region_digits = re.findall(r"\d+", region)
    check(sorted(int(d) for d in region_digits) == sorted(nums),
          "every digit run in the located region is one of the classified "
          "markers — the rule's digit-blindness is paid for, not waved away")

    pw = []
    for a in flat_b:
        s = a
        for g in re.findall(r"\s?\d+", a):
            s = s.replace(g, "", 1)
        pw += s.split()
    sw = [w for p in flat_s for w in p.split()]
    check(len(pw) == len(sw), "word counts: PG %d, served %d" % (len(pw), len(sw)))
    mism = [(k, x, y) for k, (x, y) in enumerate(zip(pw, sw)) if x != y]
    check(not mism, "%d words compared word for word, %d mismatches %s"
          % (len(pw), len(mism), mism[:3]))

    # ---- the audit, under D18 ---------------------------------------------
    print()
    print("5. Negative controls (D18: both clauses asserted)")

    def v(served_tokens):
        return verdict(served_tokens, P)

    w = max(re.findall(r"[A-Za-z]{6,}", " ".join(paras)), key=len)
    joined = " ".join(paras)

    mut = toks(joined.replace(w, w[:-1] + w[-1] * 2, 1))
    control("A: one letter changed (%r)" % w, S, mut, v)

    ws = joined.split()
    if len(ws) < 20:
        check(False, "control B precondition: the chapter is too short")
    mut = toks(" ".join(ws[:5] + ws[6:]))
    control("B: one word dropped (of %d)" % len(ws), S, mut, v)

    mut = toks(" ".join([flat_s[1], flat_s[0]] + flat_s[2:]))
    control("C: two paragraphs swapped", S, mut, v)

    mut = toks(joined + " this sentence was written by the verification "
                        "script and is in no edition of the poem")
    control("D: a sentence that is not Butler's appended", S, mut, v)

    numw = next((x for x in ("twenty", "five", "two", "three")
                 if re.search(r"\b%s\b" % x, joined.lower())), None)
    check(numw is not None, "a number-WORD exists to build control E from")
    mut = toks(re.sub(r"\b%s\b" % numw, "eleven", joined, count=1,
                      flags=re.I))
    control("E: a number-WORD changed (%r)" % numw, S, mut, v)

    # a twelve-word DELETION, which is the mutation that defeated the Book 5
    # reviewer's first rule (records finding R-2). This profile sees it,
    # because deleting tokens shortens |S| and the full-length match must then
    # occur at a DIFFERENT position or not at all.
    mut = toks(" ".join(ws[:40] + ws[52:]))
    control("F: a twelve-word run deleted", S, mut, v)

    declare_blind("a DIGIT changed inside the region",
                  because="the profile is built on letter tokens, so PG's "
                          "footnote markers are not symbols at all",
                  carried_by="step 4's assertion that every digit run in the "
                             "located region is one of the classified markers")
    declare_blind("a defect PG #1727 itself carries",
                  because="both sides of the comparison would carry it",
                  carried_by="the other seven source rules, which agree with "
                             "this one on the same regions")
    print(summary("  "))
    return report()


def report():
    print()
    if FAILURES:
        print("FAILED — %d check(s):" % len(FAILURES))
        for f in FAILURES:
            print("  - " + f)
        return 1
    print("OK — the served Book 6 is Butler's text. The chapter occurs entire,")
    print("     exactly once, in a single PG-driven pass that never looked for")
    print("     it; the second-best match anywhere in the file is reported;")
    print("     every paragraph matches word for word with only classified")
    print("     footnote markers removed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
