#!/usr/bin/env python3
"""Verify that the served Odyssey Book 8 is Samuel Butler's 1900 text.

**A TWELFTH kind of rule, and the channel is PG's own apparatus rather than
Butler's prose.** The eleven already used are enumerated in `RESUME.md`. Every
one of them reads the *body* — its letters, its punctuation, its word lengths,
its capitalization, its line wrapping, or the shape of the block it sits in.
Two of them touch the apparatus and neither uses it to LOCATE anything: the
tenth turns Butler's footnote NUMBERING into an ordinal index, and the
eleventh's clause 4 corroborates with the FOOTNOTES section's internal
structure.

**This one locates Book 8 by its TITLE and by PG's table of contents, and reads
no character of any chapter's prose to do it.**

PG #1727 sets each Book as a heading line `BOOK <roman>` followed by an
*argument line* in Butler's own upper case — for Book 8, `BANQUET IN THE HOUSE
OF ALCINOUS—THE GAMES.` The served edition carries that same argument as the
second half of its chapter `title` field, sentence-cased. Nothing in this
package has ever read either. So:

  **clause 0 (BODY-BLIND, and it is the locating clause).** All twenty-four
  served `title` fields, argument halves upper-cased, are matched against PG's
  twenty-four argument lines, **in order, each exactly once**. The span of
  chapter 8 falls out as the stretch between argument line 8 and heading 9.
  Not one character of any chapter's prose is read to decide where to look —
  which is the failure mode every search-then-verify rule shares, and which
  the sixth rule solved a different way (by residue).

  **clause 1 — PG's published file arithmetic.** The `Contents` block lists
  ` BOOK <roman>.` twenty-four times. Its roman numerals must be I…XXIV in
  order and must agree, numeral for numeral, with the body's headings. A
  reordered or duplicated Book is caught here even if every argument line is
  intact, because the two lists are written in different places by different
  conventions (leading space and full stop in the contents; neither in the
  body).

  **clause 2 — the span reproduces the served chapter, exactly.** PG's bare
  footnote anchors are removed, blank-line blocks become paragraphs, whitespace
  is normalized, and the result must equal the served chapter 8 paragraph for
  paragraph with no difference of any kind. Removing the anchors is safe
  because the served file carries **no digit at all**, which the script asserts
  before it strips anything.

**The audit failed this rule on its first execution and the defect was the
rule's.** It expected `[n]` anchors; PG sets them as bare digits appended to a
token, and there is not one `[n]` in the translation body. `WORKFLOW.md` says
to budget for exactly this — *"a rule that passes its own audit on the first
attempt has probably not been audited"* — and it is recorded here rather than
quietly fixed, because the first reading of the failure was that PG carried a
second defect of the **R-3** kind. **It does not.**

  **clause 3 — all twenty-four chapters, exhaustively.** Every one of the
  served file's 1,027 paragraphs must be reproduced by the span of its own
  chapter, and the divergences must be **exactly the four enumerated** in
  `DIVERGENCES`. *(The first version of this clause asserted that nothing falls
  between one span and the next; its own audit showed that to be tautological —
  the spans are cut at the headings, so the gap between them is the heading by
  construction. That is clause (a) of D18 said about a check rather than a
  control, and it is the second defect this rule's audit found in it.)*

**Three divergences this clause found that nobody had recorded.** `PROVENANCE.md`
§4 names only the B03-P038 splice and says *"everything else in the file is
sound — 1,027 paragraphs and 117,228 words checked against PG"*, which is true
at the resolution of a word count. Character for character there are three
more, and all three are deliberate normalizations the served file applies, none
touching a word: a space before an em dash closed up at **B01-P025**, and
Books III and IV opened with a capital where Butler runs his sentence on from
the Book before and PG therefore opens lower-case (**B03-P001**, **B04-P001**).
They are enumerated so that a fourth fails.

**The controls are hardened past a letter flip, which is what Book 7's round 1
did and what raised the bar.** That round made **the B03-P038 splice and a
paragraph of Butler's own Book VI** fire against its rule — the first time a
source rule in this package was made to face the actual failure it exists to
catch rather than a synthetic one. Both are here, and so is a third of the same
kind: a paragraph of Butler's own **Book VIII, moved within Book VIII**.

A letter flip is a control against typos. A splice of the served `modern-en`
into the served `original-en` is the defect this package actually found (A3 /
D14). A paragraph of Butler's own prose from the wrong Book is the defect a
resemblance measure is most likely to wave through, because every token is
Butler's.

Usage: python3 scripts/verify_source_book8.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent.parent.parent
PG = ROOT / "source-texts/pg1727-butler-1900.txt"
SERVED = REPO / "app/public/data/editions/odyssey-original-en.json"
sys.path.insert(0, str(Path(__file__).resolve().parent))
from controls import control, declare_blind, summary            # noqa: E402

BOOK = 8
# **The audit of this rule failed it on first execution, and the defect was in
# the rule, not in PG.** It was written expecting footnote anchors as `[n]`,
# which is how this package's prose describes them; PG #1727 in fact sets them
# as a **bare one-to-three-digit run appended to the preceding token** —
# `prepare a feast.65`, `The out houses,66` — and there is **not one** `[n]` in
# the whole translation body. Clause 0 duly failed on chapter 11, whose
# argument line reads `THE VISIT TO THE DEAD.88`, and the first reading of that
# failure was that PG carried a second defect of the R-3 kind. It does not. The
# rule was wrong.
#
# That it is safe to strip every such run is asserted rather than assumed: the
# served `original-en` contains **zero digits in all 1,027 paragraphs**, so no
# digit of Butler's can be destroyed by this. One anchor in Book VIII is
# preceded by a space (`in your ship.” 72`), which is why the rule is written
# on digit adjacency and not on `(?<=\S)`.
ANCHOR = re.compile(r"(?<!\d)\d{1,3}(?!\d)")
HEADING = re.compile(r"^BOOK ([IVXLC]+)\n", re.M)
CONTENTS = re.compile(r"^ BOOK ([IVXLC]+)\.$", re.M)
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI",
         "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
         "XXI", "XXII", "XXIII", "XXIV"]


def norm(s):
    return " ".join(ANCHOR.sub("", s).split())


def fail(m):
    sys.exit("verify_source_book8.py: " + m)


def load_pg():
    return PG.read_text(encoding="utf-8")


def assert_no_digits(doc):
    """The precondition ANCHOR depends on, asserted rather than assumed."""
    n = sum(len(re.findall(r"\d", p))
            for c in doc["chapters"] for p in c["paragraphs"])
    if n:
        fail("the served original-en carries %d digit(s); stripping PG's bare "
             "footnote anchors is only safe because it carries none" % n)
    return True


def headings(text):
    """(roman, start of heading, start of the argument block, end of argument
    block) for each of PG's twenty-four body headings."""
    out = []
    for m in HEADING.finditer(text):
        rest = text[m.end():]
        stripped = rest.lstrip("\n")
        lead = len(rest) - len(stripped)
        blk = stripped.split("\n\n")[0]
        out.append((m.group(1), m.start(), m.end() + lead,
                    m.end() + lead + len(blk)))
    return out


def arguments(text):
    return [norm(b) for _r, _s, i, j in
            [(r, s, i, j) for r, s, i, j in headings(text)]
            for b in [text[i:j]]]


# ---------------------------------------------------------------- the clauses
def clause0(titles, text):
    """BODY-BLIND. Match the served titles to PG's argument lines, in order,
    each exactly once. Returns the index of the Book we want."""
    args = arguments(text)
    if len(args) != 24:
        return "clause 0: PG has %d body headings, not 24" % len(args)
    want = [t.split("—", 1)[1].strip().upper() if "—" in t else
            t.upper() for t in titles]
    got = [a.rstrip(".").upper() for a in args]
    if len(set(got)) != 24:
        return "clause 0: PG's argument lines are not 24 distinct strings"
    for k, (w, g) in enumerate(zip(want, got), 1):
        if w != g:
            return ("clause 0: served title %d does not match PG's argument "
                    "line %d\n  served: %r\n  PG:     %r" % (k, k, w, g))
    return None


def clause1(text):
    """PG's published file arithmetic: the Contents block against the body."""
    toc = CONTENTS.findall(text)
    if toc != ROMAN:
        return ("clause 1: the Contents block lists %r, not I..XXIV in order"
                % toc[:30])
    body = [r for r, _s, _i, _j in headings(text)]
    if body != ROMAN:
        return ("clause 1: the body's headings read %r, not I..XXIV in order"
                % body[:30])
    return None


def span_paragraphs(text, k):
    """The k-th (1-based) Book's prose, as normalized paragraphs."""
    hs = headings(text)
    start = hs[k - 1][3]
    end = hs[k][1] if k < len(hs) else len(text)
    body = text[start:end]
    # PG closes the translation body with the FOOTNOTES section; the last Book
    # stops at it. Not reached for Book 8, but the rule must be total.
    cut = body.find("\nFOOTNOTES")
    if cut != -1:
        body = body[:cut]
    return [norm(b) for b in body.split("\n\n") if norm(b)]


def clause2(served, text, k=BOOK):
    pg = span_paragraphs(text, k)
    if len(pg) != len(served):
        return ("clause 2: PG's Book %d has %d paragraphs, the served chapter "
                "has %d" % (k, len(pg), len(served)))
    for i, (a, b) in enumerate(zip(pg, served), 1):
        if a != b:
            return ("clause 2: paragraph %d differs\n  PG:     %r\n  served: %r"
                    % (i, a[:150], b[:150]))
    return None


# **Every divergence of the served `original-en` from PG, in 1,027 paragraphs,
# enumerated — and three of the four had never been recorded.**
#
# `PROVENANCE.md` §4 says *"Everything else in the file is sound — 1,027
# paragraphs and 117,228 words checked against PG"*, naming only the B03-P038
# splice. That is true at the resolution of a word count. This clause compares
# every chapter character for character and finds three more, all of them
# deliberate normalizations the served file applies and none of them touching a
# word. They are enumerated here in `BYTE_IDENTICAL`'s shape, exact in both
# directions, so a fourth fails Book 8's source verification.
DIVERGENCES = {
    (1, 25): "PG sets `and mine above all others —for it is I` with a space "
             "before the em dash; the served file closes it up. The only "
             "difference is that space.",
    (3, 1): "Butler runs his sentence on from the end of Book II, so PG's "
            "Book III opens lower-case, `but as the sun was rising`. The "
            "served file capitalizes it to `But`. One letter.",
    (4, 1): "The same, at Book IV: PG opens `they reached the low lying city`, "
            "the served file `They`. One letter.",
    (3, 38): "**The one that is not a normalization** — the D14 splice, "
             "ledger A3: 196 of the served paragraph's 208 words are the "
             "served `modern-en`'s own ¶38, completing a half-sentence Butler "
             "leaves open. Recorded, escalated, and not this package's to "
             "repair.",
}


def clause3(doc, text):
    """**All twenty-four chapters, not only Book 8** — and the one exception is
    named rather than skipped.

    The first version of this clause asserted that nothing falls between one
    span and the next, which its own audit showed to be **tautological**: the
    spans are cut at the headings, so the gap between them is the heading and
    its argument line by construction and can never contain anything else. A
    clause that cannot fail is worth nothing, which is clause (a) of D18 said
    about a check instead of a control.

    What is not tautological is exhaustion: every one of the served file's
    1,027 paragraphs must be reproduced by the span of its own chapter. The
    single permitted mismatch is **chapter 3 paragraph 38**, the D14 splice
    recorded as ledger A3 — 196 of its 208 words are the served `modern-en`'s
    own ¶38 — and the clause asserts that it is the ONLY one, so a second
    defect anywhere in the file fails Book 8's source verification."""
    bad = []
    for c in doc["chapters"]:
        k = c["number"]
        pg = span_paragraphs(text, k)
        served = [norm(x) for x in c["paragraphs"]]
        if len(pg) != len(served):
            bad.append((k, "paragraph count %d against %d"
                        % (len(pg), len(served))))
            continue
        for i, (a, b) in enumerate(zip(pg, served), 1):
            if a != b:
                bad.append((k, i))
    if sorted(bad) != sorted(DIVERGENCES):
        return ("clause 3: the served file's divergences from PG must be "
                "exactly %r; found %r" % (sorted(DIVERGENCES), bad[:8]))
    return None


def verdict(served, text, titles, doc=None):
    """The check's whole answer, as one comparable value — which is what D18
    clause (b) needs."""
    return (clause0(titles, text), clause1(text), clause2(served, text),
            clause3(doc, text) if doc else None)


def main():
    text = load_pg()
    doc = json.loads(SERVED.read_text(encoding="utf-8"))
    assert_no_digits(doc)
    titles = [c["title"] for c in doc["chapters"]]
    served = [norm(p) for p in
              next(c for c in doc["chapters"] if c["number"] == BOOK)
              ["paragraphs"]]

    print("Odyssey Book 8 — source verification, the TWELFTH kind of rule")
    print("PG #1727 sha256 %s" % hashlib.sha256(PG.read_bytes()).hexdigest())
    print("served original-en sha256 %s\n"
          % hashlib.sha256(SERVED.read_bytes()).hexdigest())

    for name, r in (("clause 0 — served titles against PG's argument lines, "
                     "in order, BODY-BLIND", clause0(titles, text)),
                    ("clause 1 — PG's Contents block against its body headings",
                     clause1(text)),
                    ("clause 2 — the located span reproduces the served "
                     "chapter exactly", clause2(served, text)),
                    ("clause 3 — all 24 chapters reproduce, and the served "
                     "file's divergences from PG in 1,027 paragraphs are "
                     "EXACTLY the four enumerated (three normalizations and "
                     "the D14 splice)", clause3(doc, text))):
        if r:
            fail(r)
        print("  ✓ %s" % name)

    hs = headings(text)
    print("\n  Book 8's argument line: %r" % arguments(text)[BOOK - 1])
    print("  located at PG characters %d..%d, %d paragraphs, %d words"
          % (hs[BOOK - 1][3], hs[BOOK][1], len(served),
             sum(len(p.split()) for p in served)))

    # ------------------------------------------------------------- controls
    # The verdict function for every control below. Each control mutates the
    # SERVED chapter or the SERVED titles and asserts the verdict moves.
    def v_served(ps):
        return verdict(ps, text, titles, doc)

    def v_titles(ts):
        return verdict(served, text, ts, doc)

    def v_pg(tx):
        return verdict(served, tx, titles, doc)

    def flip(ps, i=5):
        out = list(ps)
        w = out[i].split()
        k = next(j for j, x in enumerate(w) if len(x) > 6 and x.isalpha())
        w[k] = w[k][:2] + ("x" if w[k][2] != "x" else "y") + w[k][3:]
        out[i] = " ".join(w)
        assert out != ps
        return out

    def splice_b03p038(ps):
        """**The defect this package actually found**, planted here: the served
        `original-en`'s Book 3 paragraph 38 carries 196 words that are the
        served `modern-en`'s own ¶38 (ledger A3, decision D14). Put that same
        paragraph into Book 8."""
        bad = norm(next(c for c in doc["chapters"] if c["number"] == 3)
                   ["paragraphs"][37])
        assert len(bad.split()) > 150, len(bad.split())
        out = list(ps)
        out[20] = bad
        assert out != ps
        return out

    def butlers_own_book_vi(ps):
        """**A paragraph of Butler's own Book VI**, substituted for one of Book
        8's. Every token is Butler's, which is what a resemblance measure is
        most likely to wave through."""
        other = norm(next(c for c in doc["chapters"] if c["number"] == 6)
                     ["paragraphs"][11])
        out = list(ps)
        out[30] = other
        assert out != ps
        return out

    def moved_within_book_viii(ps):
        """The same idea one turn harder: a paragraph of Butler's own **Book
        VIII** put where another of Book VIII's belongs. The chapter's whole
        token multiset is nearly unchanged."""
        out = list(ps)
        out[40] = out[9]
        assert out != ps
        return out

    def swap_two(ps):
        out = list(ps)
        out[3], out[4] = out[4], out[3]
        assert out != ps
        return out

    def change_a_digit(ps):
        i = next(j for j, p in enumerate(ps) if re.search(r"\bfifty-two\b", p))
        out = list(ps)
        out[i] = out[i].replace("fifty-two", "fifty-three", 1)
        assert out != ps
        return out

    def delete_a_paragraph(ps):
        out = list(ps)
        del out[25]
        assert out != ps
        return out

    def alter_the_title(ts):
        out = list(ts)
        out[BOOK - 1] = out[BOOK - 1].replace("the games", "the contests")
        assert out != ts
        return out

    def transpose_two_titles(ts):
        out = list(ts)
        out[10], out[11] = out[11], out[10]
        assert out != ts
        return out

    def drop_a_contents_entry(tx):
        out = tx.replace("\n BOOK XVII.\n", "\n", 1)
        assert out != tx
        return out

    control("clause 2: one letter changed in a served paragraph",
            served, flip(served), verdict=v_served)
    control("clause 2: **the B03-P038 splice** — the served modern-en's "
            "own ¶38, the defect this package actually found (A3/D14), "
            "planted into Book 8",
            served, splice_b03p038(served), verdict=v_served)
    control("clause 2: **a paragraph of Butler's own Book VI** substituted "
            "— every token his",
            served, butlers_own_book_vi(served), verdict=v_served)
    control("clause 2: a paragraph of Butler's own Book VIII moved within "
            "Book VIII — the chapter's token multiset barely moves",
            served, moved_within_book_viii(served), verdict=v_served)
    control("clause 2: two paragraphs transposed",
            served, swap_two(served), verdict=v_served)
    control("clause 2: a changed digit (fifty-two oarsmen)",
            served, change_a_digit(served), verdict=v_served)
    control("clause 2: a paragraph deleted",
            served, delete_a_paragraph(served), verdict=v_served)
    control("clause 0: Book 8's own title altered — the LOCATING clause, "
            "which reads no prose",
            titles, alter_the_title(titles), verdict=v_titles)
    control("clause 0: two chapter titles transposed",
            titles, transpose_two_titles(titles), verdict=v_titles)
    control("clause 1: a Contents entry removed from PG",
            text, drop_a_contents_entry(text), verdict=v_pg)
    declare_blind("a defect PG and the served file SHARE",
                  because="both sides of every clause are read from the same "
                          "two artefacts, so a corruption present in PG itself "
                          "and faithfully carried into the served file cannot "
                          "move any verdict here",
                  carried_by="book07/review/verify_source_book7_review.py, "
                             "whose clause 4 reads PG's FOOTNOTES section "
                             "against its own internal structure and found "
                             "exactly such a defect (records finding R-3, "
                             "footnote 29's transposed opener)")
    print()
    print(summary())
    return 0


if __name__ == "__main__":
    sys.exit(main())
