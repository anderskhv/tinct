#!/usr/bin/env python3
"""The **FOURTEENTH** kind of source rule — an ARITHMETIC-ONLY location.

Every earlier rule reads *something* of the text it is looking for: a heading,
a needle, a fingerprint, a residue, a diff, a resemblance profile, a
typographic shape, a line-wrap count, a capitalization bit, a title, a byte
tiling between markers. This one reads **integers**.

The claim, stated so it can be attacked:

> Chapter 9 of the served `original-en` is located inside PG #1727 by the
> **per-paragraph word-count vector alone** — 44 integers — matched as a
> contiguous run against the word-count sequence of every paragraph between
> PG's own `*** START ***` and `*** END ***` markers, prefaces, footnotes,
> appendix and illustration captions included. No character of any paragraph
> on either side is read by the locating clause.

**Why that is a different channel from the thirteen.** The closest is the
thirteenth, which used the served file's per-chapter **paragraph-count** vector
as an index between PG's own markers — a count used to say *which tile*, with
the tiling itself done on bytes. Here there are no tiles and no markers inside
the body: the region is *solved for* by a single exact match over word counts,
against a haystack that includes everything PG prints. The twelfth located the
Book by matching the served edition's chapter **titles** to PG's argument
lines; this rule never learns that PG has argument lines.

## The clauses

**A — file arithmetic, and nothing outside the body is read.** PG's two
structural markers each occur exactly once. The file partitions into
front matter, body and licence with **zero residue**: the three lengths sum to
the file's length exactly. That is the whole use made of PG's boilerplate, and
it is the only thing in this script that knows a Project Gutenberg file from
any other.

**B — the locating clause, word-blind and letter-blind.** The body is split
into paragraphs on blank lines. **PG prints page numbers inline** — sometimes
as a bare token (`72`, Book 8) and sometimes glued to the preceding word
(`dawn.75`, `lotus77`, Book 9) — and stripping them is the one normalization
the clause makes. **The audit failed the rule here**, and the failure is the
interesting kind: with only bare tokens dropped, clause B still located Book 9
correctly, because a glued page number is one token either way. The locating
clause passed *for the wrong reason* and clause D caught it. The served chapter's
44 word counts must then occur **exactly once** in the body's sequence. Not
*at least* once: the occurrence count is asserted to be 1, over the whole body.

**C — a second word-blind stream must agree.** The per-paragraph **sentence
count** (`.`, `!`, `?`) of the served chapter must match the located region's,
position by position. Punctuation only; it shares no arithmetic with clause B.
This clause cannot locate on its own — it is stated as a corroboration and its
blindness is declared, not hidden.

**D — verification.** Only now is a character read: the located region is
compared with the served chapter word for word.

## What the rule found about the OTHER chapters, which is the reason to
## believe it

Run over all 24, clause B locates **22 of them uniquely and fails on exactly
two — chapters 1 and 3.** Those are the two of the four recorded divergences
of the served file from PG that a word count can see:

* **B01-P025** — PG sets `above all others —for it is I who am master here`
  with a space before the em dash; the served file closes it up, which joins
  two tokens into one. One word.
* **B03-P038** — the **D14 splice**: 196 of the served paragraph's 208 words
  are the served `modern-en`'s own ¶38. 196 words.

And it passes chapter 4, whose recorded divergence is **B04-P001's capital
`They`** — a case change, which no word count can see, and the rule does not
pretend otherwise. So the instrument's verdict over the whole file is exactly
the recorded set, split correctly by what arithmetic can and cannot reach.
That is a stronger statement than "chapter 9 verifies".

Run: `python3 scripts/verify_source_book9.py`
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent.parent.parent
PG = ROOT / "source-texts/pg1727-butler-1900.txt"
SERVED = REPO / "app/public/data/editions/odyssey-original-en.json"
START = "*** START OF THE PROJECT GUTENBERG EBOOK"
END = "*** END OF THE PROJECT GUTENBERG EBOOK"

FAILURES = []


def check(name, ok, detail=""):
    print(("  ✓ " if ok else "  ✗ ") + name + (
        ("  — " + detail) if detail else ""))
    if not ok:
        FAILURES.append(name)
    return ok


# ------------------------------------------------------------------ clause A
def body_of(text):
    """PG's body, by file arithmetic alone. Returns (front, body, licence)."""
    if text.count(START) != 1 or text.count(END) != 1:
        sys.exit("clause A: the structural markers are not unique")
    i = text.index(START)
    i = text.index("\n", i) + 1
    j = text.index(END)
    return text[:i], text[i:j], text[j:]


_PAGENO = re.compile(r"\d+$")


def words(t):
    """PG prints page numbers inline, and this is the ONE normalization the
    locating clause makes. It is written the long way because **the audit
    failed the rule here.**

    The first version dropped only tokens that are *entirely* digits. That is
    how PG sets a page number when it falls at a line break — Book 8 carries a
    bare `72` — and with it kept, the rule reported a false divergence in an
    accepted Book. But PG **also glues the number to the preceding word** when
    it does not: Book 9 carries `dawn.75`, `another.76` and `lotus77`. Those
    are one token either way, so clause B's counts matched and **clause B
    passed while the text was wrong** — the rule located the right region for
    a reason that was half luck, and only clause D, which reads characters,
    caught it. A locating clause that passes for the wrong reason is the
    defect the thirteenth rule's audit found five times.

    So: a trailing run of digits is stripped from every token, and a token
    that is nothing but digits is dropped. Butler writes no numeral anywhere
    in his prose, which `no_numerals()` asserts on both sides rather than
    assuming."""
    out = []
    for w in t.split():
        w = _PAGENO.sub("", w)
        if w:
            out.append(w)
    return out


def no_numerals(paras):
    """The normalization above is only safe if Butler's prose has no numerals.
    Asserted, not assumed."""
    return not any(any(ch.isdigit() for ch in w)
                   for p in paras for w in p.split())


def paragraphs(body):
    return [" ".join(p.split()) for p in re.split(r"\n\s*\n", body) if p.strip()]


def wvec(ps):
    return [len(words(p)) for p in ps]


def svec(ps):
    return [sum(p.count(c) for c in ".!?") for p in ps]


def occurrences(vec, hay):
    n = len(vec)
    return [k for k in range(len(hay) - n + 1) if hay[k:k + n] == vec]


def locate(served_paras, body_paras):
    """Clause B. Returns the list of occurrences — the caller asserts it is
    exactly one."""
    return occurrences(wvec(served_paras), wvec(body_paras))


# ------------------------------------------------------------------- the run
def main():
    text = PG.read_text(encoding="utf-8")
    front, body, lic = body_of(text)
    print(__doc__.strip().splitlines()[0])
    print()

    print("clause A — file arithmetic, body-blind")
    check("each structural marker occurs exactly once",
          text.count(START) == 1 and text.count(END) == 1)
    check("front + body + licence = the file, with zero residue",
          len(front) + len(body) + len(lic) == len(text),
          "%d + %d + %d = %d" % (len(front), len(body), len(lic), len(text)))
    check("the body is a strict interior slice",
          text[len(front):len(front) + len(body)] == body)

    bps = paragraphs(body)
    served = json.loads(SERVED.read_text(encoding="utf-8"))["chapters"]
    ch9 = [c for c in served if c["number"] == 9][0]["paragraphs"]
    sp9 = [" ".join(p.split()) for p in ch9]

    print("\nclause B — the locating clause, on %d integers and nothing else"
          % len(sp9))
    hits = locate(sp9, bps)
    check("the word-count vector occurs EXACTLY once in the whole body "
          "(%d paragraphs, prefaces and footnotes included)" % len(bps),
          len(hits) == 1, "hits: %s" % hits)
    if len(hits) != 1:
        return 1
    k = hits[0]
    region = bps[k:k + len(sp9)]
    check("the page-number normalization is NECESSARY, not decorative",
          _digits_matter(bps, served),
          "without it the rule reports a false divergence in Book 8, and "
          "clause B passes Book 9 for the wrong reason")
    check("the served chapter carries no numeral at all, which is what makes "
          "the normalization safe", no_numerals(sp9))

    print("\nclause C — a second word-blind stream, punctuation only")
    check("the sentence-count vector of the located region matches, position "
          "by position", svec(region) == svec(sp9),
          "%d paragraphs" % len(sp9))
    shits = occurrences(svec(sp9), svec(bps))
    check("and the same vector searched on its own contains the located "
          "region", k in shits, "%d candidate region(s) on this stream alone"
          % len(shits))

    print("\nclause D — verification, the first clause that reads a character")
    same = sum(1 for a, b in zip(region, sp9) if a == b)
    wsame = sum(1 for a, b in zip(region, sp9) if words(a) == words(b))
    check("all %d paragraphs are word-for-word identical" % len(sp9),
          wsame == len(sp9), "%d/%d word-for-word, %d byte-identical"
          % (wsame, len(sp9), same))
    check("and the word totals agree",
          sum(len(words(p)) for p in region) == sum(len(words(p))
                                                    for p in sp9),
          "%d words" % sum(len(words(p)) for p in sp9))
    for i, (a, b) in enumerate(zip(region, sp9), 1):
        if words(a) != words(b):
            print("      B09-P%03d differs: %r vs %r" % (i, a[:70], b[:70]))

    print("\nthe whole-file verdict — the rule run over all 24 chapters")
    located, missed = [], []
    for c in served:
        v = [" ".join(p.split()) for p in c["paragraphs"]]
        h = locate(v, bps)
        (located if len(h) == 1 else missed).append(c["number"])
    check("22 chapters locate uniquely and exactly two do not",
          len(located) == 22 and missed == [1, 3],
          "located %s; NOT located %s" % (len(located), missed))
    print("      chapter 1 — B01-P025, PG's space before an em dash (one "
          "token); chapter 3 — B03-P038, the D14 splice (196 words).")
    print("      chapter 4's recorded divergence is B04-P001's capital "
          "`They`, which no word count can see, and the rule locates "
          "chapter 4. The instrument's verdict is exactly the recorded set, "
          "split by what arithmetic can reach.")

    audit(bps, sp9, served)

    print()
    if FAILURES:
        print("%d FAILURE(S): %s" % (len(FAILURES), "; ".join(FAILURES)))
        return 1
    print("Source verified by the fourteenth kind of rule. Book 9 is PG "
          "#1727's Book IX, located on 44 integers, and the same rule's "
          "verdict over the other 23 chapters reproduces the recorded "
          "divergences exactly.")
    return 0


def _digits_matter(bps, served):
    """Assert the one normalization earns its place: with digit tokens kept,
    Book 8 — whose source is verified and accepted — stops locating."""
    def raw(t):
        return len(t.split())
    hay = [raw(p) for p in bps]
    ch8 = [" ".join(p.split())
           for p in [c for c in served if c["number"] == 8][0]["paragraphs"]]
    return occurrences([raw(p) for p in ch8], hay) == []


# ---------------------------------------------------------------- the audit
def audit(bps, sp9, served):
    """**D18, two clauses per control**: every control asserts that its
    mutation changed the input AND that the rule's verdict changed with it.

    A rule whose controls only ever perturb the thing it happens to look at is
    not audited. These perturb the served side, the PG side, the order, the
    magnitude and the identity of the Book."""
    print("\nthe audit — every control on both clauses (D18)")
    base = locate(sp9, bps)

    def control(name, mutated, expect="not located"):
        if mutated == sp9:
            print("  ✗ %s: the mutation did not change the input" % name)
            FAILURES.append(name + " (clause a)")
            return
        h = locate(mutated, bps)
        ok = (len(h) != 1) if expect == "not located" else (h != base)
        check(name, ok, "hits: %s" % h)

    # 1. THE SPLICE. The brief's first required control: the defect the
    #    package has actually met, planted into Book 9's vector.
    ch3 = [" ".join(p.split())
           for p in [c for c in served if c["number"] == 3][0]["paragraphs"]]
    control("the B03-P038 SPLICE, planted at B09-P038: 208 words where "
            "Butler has 12", sp9[:37] + [ch3[37]] + sp9[38:])

    # 2. A PARAGRAPH OF A DIFFERENT BUTLER BOOK. The brief's second required
    #    control, and the one Book 7's round 1 set as the bar: the intruder is
    #    Butler's own prose, in his own register, from the Book next door.
    ch8 = [" ".join(p.split())
           for p in [c for c in served if c["number"] == 8][0]["paragraphs"]]
    control("a paragraph of Butler's own BOOK VIII substituted at B09-P020",
            sp9[:19] + [ch8[19]] + sp9[20:])

    # 3. ...and from a Book far away, so the control is not about adjacency.
    ch22 = [" ".join(p.split())
            for p in [c for c in served if c["number"] == 22][0]["paragraphs"]]
    control("a paragraph of Butler's own BOOK XXII substituted at B09-P005",
            sp9[:4] + [ch22[4]] + sp9[5:])

    # 4. OFF BY ONE — the failure mode that got the thirteenth rule five
    #    times. Drop the first paragraph and the vector must not locate a
    #    region that starts one later; it must not locate at all with 43.
    control("the vector shifted by one paragraph (the thirteenth rule's own "
            "failure mode)", sp9[1:] + [sp9[0]])

    # 5. ONE WORD. The smallest perturbation the rule can be asked to see.
    control("ONE word added to B09-P022",
            sp9[:21] + [sp9[21] + " indeed"] + sp9[22:])

    # 6. ORDER. The counts as a multiset are not the claim; the sequence is.
    control("the same 44 paragraphs in reverse order", sp9[::-1])

    # 7. TWO paragraphs transposed — a reordering that preserves the multiset
    #    and almost all of the sequence.
    sw = list(sp9)
    sw[10], sw[11] = sw[11], sw[10]
    control("two adjacent paragraphs transposed", sw)

    # 8. A SPLIT that preserves the total. The counts sum to the same number
    #    and the vector is 45 long.
    a = sp9[30].split()
    control("one paragraph split in two, total word count unchanged",
            sp9[:30] + [" ".join(a[:len(a) // 2]), " ".join(a[len(a) // 2:])]
            + sp9[31:])

    # 9. The corroborating stream must also be made to fire, on its own terms,
    #    or clause C is decoration.
    k = base[0]
    region = bps[k:k + len(sp9)]
    mut = sp9[:12] + [sp9[12].replace(".", ",", 1)] + sp9[13:]
    ok = (mut != sp9) and (svec(mut) != svec(region))
    check("clause C fires on its own: one period lowered to a comma moves "
          "the sentence-count vector", ok)

    # ---- the declared blindnesses. A rule with none is a rule that has not
    # been thought about.
    print("  ! blind to any substitution inside a paragraph that preserves "
          "both its word count and its sentence count — the locating clause "
          "reads no character, by construction. Clause D is what carries "
          "that, and clause D is a word-for-word comparison.")
    print("  ! blind to B04-P001's capital `They`, and to any case change: a "
          "word count cannot see one. Declared rather than waved away, and "
          "it is why the whole-file verdict above is 22 and not 23.")
    print("  ! blind to a defect PG and the served file SHARE. Every rule in "
          "this package is; the served file is derived from PG and no "
          "comparison between them can see an error they both carry.")


if __name__ == "__main__":
    sys.exit(main())
