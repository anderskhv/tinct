#!/usr/bin/env python3
"""Every collision row touching one Book, with a disposition on every one.

**Records finding R-2 and blind spot 8 of `book07/review/findings-v1.md`.**
Book 7's `README.md` and `review-instructions.md` said the collision check
*"found eleven rows touching this Book"*. It returns **seventy-two**. Eleven
were acted on — seven repaired, four handed to the reviewer — and **sixty-one
were dismissed with no record of having been read**, which is how `walls` <-
`precincts` (M-1) passed through: a sense change, in a Book whose walls are
literally bronze, printed by the tool and never triaged.

The reviewer's diagnosis is the right one and it is not about the instrument:

> *"This is not a gap in an instrument; it is a gap between an instrument and a
> record... the next reviewer cannot tell a judged row from an unread one."*

So this script is the record, and it is generated rather than typed. It fails
non-zero when any row touching the Book has no disposition, which makes the
triage impossible to skip in the way it was skipped.

**The disposition vocabulary.** Five classes are decided mechanically and three
are ruled by hand and enumerated in `RULINGS` with a reason apiece.

Mechanical, in the order they are applied:

* `variant` — every rendering in the row reduces to one form once inflection,
  D9 British/American spelling and D15 compound spacing are normalized. One
  rendering in two surface forms is not two renderings.
* `kept` — **every** entry this Book contributes to the row is Butler's own
  word carried through unchanged. The Book made no rendering decision here;
  whatever the row shows belongs to whichever Book did. This is the class the
  three upheld rows fall in (`lighted`, `endowed`, `luscious`) and it is why
  they are upheld: Book 7 kept Butler's word and another Book moved.
* `common-rendering` — arrow B, where the key is a word Butler himself uses in
  eight or more paragraphs across seven Books. Arrow B is deliberately NOT
  gated on the rendering's side, so that accepted B04-P010 could be caught, and
  ~31 rows a Book are the price. **The class is dismissible only because arrow
  C carries the residue** — arrow C tests the same defect inside one paragraph
  with no frequency gate at all. That is D18's `declare_blind` shape applied to
  a triage rather than to a measure, and it is stated here for the same reason:
  a dismissal whose carrier is not named is a dismissal nobody can audit.
* `common-word` — arrow C, where the rendering is an ordinary high-frequency
  word (`said`, `nothing`) and the two uses are unrelated clauses.
* `artifact` — the diff paired two spans across a recast; there is no rendering
  pair to rule on.

Ruled by hand, in `RULINGS`:

* `repair` — live. Fixed in the Book's next version, named there.
* `discrimination` — two lexemes or two senses deliberately kept apart.
* `homograph` — **a new class, and the review asked for it by name.** One
  Butler spelling, two unrelated senses, therefore two different words that
  happen to be spelled alike: `issue` is *outcome* at B03-P007 and *offspring*
  at B07-P007. It is not a collision at all, and the reviewer's point is that
  it will recur (`issue`, `state`, `will`, `fair`, `want`) and costs a reviewer
  the same work from scratch every time unless the class has a name.
* `same-referent` — the rendering is Butler's own other word **for the same
  thing**, which is precision rather than flattening.
* `unavoidable-merge` — two Butler words with one plain modern equivalent. The
  merge is the correct reading and the alternative is a register distinction
  the text does not support.
* `phrase-not-word` — the rendering is a multiword idiom whose head coincides
  with a token kept elsewhere; there is no second referent.
* `divergence-recorded` — this Book is right and another accepted Book is out
  of step. Recorded with its reason, not repaired: repairing costs a successor
  for no reading gain.

Run: `python3 scripts/collision_triage.py 7`
"""
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from rendering_collisions import (ACCEPTED, build, build_c, load,   # noqa: E402
                                  toks)

COMMON_RENDERING_MIN = 8      # paragraphs of Butler's own, across seven Books
COMMON_WORD_MIN = 20          # arrow C only, where precision is already high

BRITISH = {"harbours": "harbors", "honours": "honors", "honoured": "honored",
           "favourite": "favorite", "travelled": "traveled",
           "traveller": "traveler", "councillors": "councilors",
           "woollen": "woolen", "amongst": "among", "whilst": "while",
           "grey": "gray", "colour": "color", "neighbours": "neighbors",
           "staid": "stayed", "whatsoever": "whatever", "forwards": "forward",
           "backwards": "backward"}


def normal(s):
    """One rendering, stripped to its form: infinitive marker, D9 spelling,
    D15 compound spacing and ordinary inflection all removed."""
    out = []
    for w in s.split():
        if w == "to":
            continue
        w = BRITISH.get(w, w)
        for suf in ("ing", "ed", "es", "s"):
            if w.endswith(suf) and len(w) - len(suf) >= 3:
                w = w[:-len(suf)]
                break
        out.append(w)
    return "".join(out)


# ---------------------------------------------------------------- the rulings
# Keyed by (arrow, key) for arrows A and B, and by (book, paragraph, Butler's
# span, the rendering) for arrow C. Every entry carries a class and a reason.
RULINGS = {
    ("A", "faring"): ("artifact",
        "Butler writes `sea-faring` with a hyphen and the tokenizer splits it, "
        "so `faring` is not a word either text uses. D15 closes it to "
        "`seafaring`, matching accepted B06-P021. There is no rendering pair."),
    ("A", "harbours"): ("variant",
        "D9, `harbours` -> `harbors`. The trailing `their` in the row is the "
        "parallel possessive Butler dropped and B07-P005 restores, recorded in "
        "`continuity.md`; the diff attached it to the same span."),
    ("A", "issue"): ("homograph",
        "**Not a collision.** Butler's `issue` is *outcome* at B03-P007 and "
        "*offspring* at B07-P007 — two words spelled alike. Both uses are "
        "archaic and both had to move, in different directions because they "
        "are different words. `without a son` is exact: Rhexenor left a "
        "daughter and no son. Upheld at findings-v1 \\u00a75.2, and this is the "
        "class that gets a name here so the next `state`, `will`, `fair` or "
        "`want` does not cost a reviewer the same work from scratch."),
    ("B", "talked"): ("unavoidable-merge",
        "`talked` carries Butler's `converse` (B04-P052, B07-P028) and his own "
        "`talked` (B02-P025). `converse` as an intransitive verb is archaic and "
        "`talk` is its only plain modern equivalent; the alternative is a "
        "register difference Butler does not make. B07-P028 matches accepted "
        "B04-P052 word for word, which is the consistency the package asks for."),
    ("B", "traveler"): ("repair",
        "**O-7.** `wayfarer` -> `traveler` at B07-P018 lands on the rendering "
        "of Butler's `traveller` at accepted B03-P011 and B04-P027. `wayfarer` "
        "is genuinely archaic and had to move; `lone traveler` keeps Butler's "
        "solitary sense without the merge. Applied in v2."),
    ("B", "until"): ("phrase-not-word",
        "`hitherto` -> `until now` at B07-P018, beside Butler's own `until` "
        "elsewhere. `until now` is a fixed adverbial phrase, not a second use "
        "of the preposition, and there is no second referent. Upheld."),
    ("B", "walls"): ("repair",
        "**M-1, and the row nobody ruled on.** `precincts` -> `walls` at "
        "B07-P012, three paragraphs from B07-P009's literal bronze walls and "
        "B07-P005's city walls. It is a sense change as well as a collision: "
        "`precincts` is the enclosure, and the next sentence has Odysseus "
        "going straight through the court, so `inside the walls of the house` "
        "puts him inside the building. Repaired in v2 to `inside the "
        "courtyard of the house`."),
    ("B", "wrapped"): ("unavoidable-merge",
        "`wrapped` carries Butler's `enveloped` (B05-P030, B07-P012) and his "
        "own `wrapped` (B03-P035). `envelop` is not plain modern English of a "
        "mist, `wrap` is, and the two Books render it identically, which is "
        "the consistency the package asks for."),

    (7, 7, "male issue", "son"): ("same-referent",
        "Butler's `issue` here IS the son — Rhexenor left a daughter and no "
        "son, which the same paragraph states. Using Butler's own `son` for "
        "his `male issue` is precision, not flattening. Upheld at \\u00a75.2."),
    (7, 9, "abode", "house"): ("repair",
        "**M-2.** Butler writes `the abode of Erechtheus` and, eleven words "
        "later, `the house of Alcinous`; the candidate writes `house` twice. "
        "This is the B06-P019 shape the drafter identified and repaired at "
        "B07-P021 and did not apply here. Repaired in v2 to `the home of "
        "Erechtheus` (and `his own home` at B07-P020, the same shape again)."),
    (7, 10, "fashioned expressly", "made"): ("repair",
        "**Unreported by round 1 — arrow C's own finding.** In one paragraph "
        "Butler writes that Hephaestus `fashioned` the mastiffs and that the "
        "women of the house `made` the hangings. The candidate writes `made` "
        "for both, and the distinction it loses is between a god's craft and "
        "household work, in the paragraph whose whole subject is the wonder of "
        "the palace. Repaired in v2 to `had fashioned specially`; `fashion` is "
        "current English and needed no change."),
    (7, 10, "persons", "men"): ("repair",
        "**M-10.** `chief persons` -> `chief men`, against the candidate's own "
        "`chief people` two paragraphs later at B07-P012 rendering the same "
        "Butler phrase. In a Book whose argument turns on Arete it narrows a "
        "word Butler chose to be open. Repaired in v2 to `chief people`."),
    (7, 11, "nor", "never"): ("repair",
        "Butler: `The fruits never rot nor fail all the year round`. The "
        "candidate writes `never rot and never fail`, doubling a word Butler "
        "used once and pointing a parallel he pointed with `nor`. Repaired in "
        "v2 to `never rot or fail`."),
    (7, 15, "and bid", "tell"): ("repair",
        "**Unreported by round 1 — arrow C's own finding.** Echeneus says "
        "`tell him, then, to rise` and, in the same speech, `bid your servants "
        "mix some wine`. The candidate writes `tell` for both. `bid` is a "
        "command through an intermediary and `tell` is not. Repaired in v2 to "
        "`have your servants mix some wine`."),
    (7, 18, "hitherto", "now"): ("phrase-not-word",
        "`until now` again — see (B, until). Butler's other `now` is the "
        "discourse adverb in `so now go home to bed`, a different clause and a "
        "different part of speech."),
    (7, 19, "itself", "nothing"): ("artifact",
        "`dwell only on the due replenishing of itself` was recast to `think "
        "of nothing but being refilled`, a sound collision repair against "
        "accepted B04-P016's `filling`. The diff paired `itself` with "
        "`nothing` across the recast; Butler's other `nothing` is nine "
        "sentences away in `I have nothing of the immortal about me`."),
    (7, 19, "sup", "eat"): ("repair",
        "**M-5.** `let me sup in spite of sorrow` and, thirty words later, "
        "Butler's own `that I shall eat and drink`. The candidate writes `eat` "
        "for both, at a supper, where `sup` is the meal in front of the "
        "speaker and not decoration. Repaired in v2 to `let me have my supper "
        "in spite of sorrow`."),
    (7, 20, "his saying", "said"): ("common-word",
        "`Every one approved his saying` -> `Everyone approved what he said`, "
        "beside `so she said` in a different clause two sentences later. "
        "`said` is one of the commonest words in the corpus and the two uses "
        "share no referent."),
    (7, 22, "bade", "told"): ("repair",
        "**Unreported by round 1 — arrow C's own finding, and the sharpest of "
        "the three.** Butler: `she bade me depart of her own free will, either "
        "because Jove had told her she must, or because she had changed her "
        "mind`. The sentence turns on the difference between Calypso's own "
        "bidding and Zeus's telling; the candidate writes `told` for both and "
        "flattens exactly the distinction the sentence exists to pose. "
        "Repaired in v2 to `she sent me on my way`."),
}


def rows_for(book):
    """Every row of every arrow that touches this Book, with its disposition."""
    books = [(n, load("book%02d/source-book%d.json" % (n, n)), load(f))
             for n, f in ACCEPTED]
    freq = defaultdict(int)
    for _, s, _ in books:
        for p in s:
            for w in set(toks(p)):
                freq[w] += 1
    fwd, back = build(books)
    tag = "B%d-P" % book
    out = []

    for arrow, D in (("A", fwd), ("B", back)):
        for key, v in sorted(D.items()):
            if len({x for x, _ in v}) < 2:
                continue
            mine = sorted((x, p) for x, p in v if p.startswith(tag))
            if not mine:
                continue
            rends = sorted({x for x, _ in v})
            row = dict(arrow=arrow, key=key, rends=rends, mine=mine,
                       freq=freq[key])
            if (arrow, key) in RULINGS:
                row["klass"], row["why"] = RULINGS[(arrow, key)]
            elif len({normal(x) for x in rends}) == 1:
                row["klass"], row["why"] = "variant", (
                    "every rendering in the row reduces to `%s` once "
                    "inflection, D9 spelling and D15 compound spacing are "
                    "normalized" % normal(rends[0]))
            elif all(x == key for x, _ in mine):
                row["klass"], row["why"] = "kept", (
                    "every entry Book %d contributes is Butler's own `%s` "
                    "carried through unchanged; the decision in this row "
                    "belongs to whichever Book moved" % (book, key))
            elif arrow == "B" and freq[key] >= COMMON_RENDERING_MIN:
                row["klass"], row["why"] = "common-rendering", (
                    "`%s` is a word Butler himself uses in %d paragraphs "
                    "across seven Books, so its reuse as a rendering is not a "
                    "decision; arrow B is ungated on this side on purpose and "
                    "arrow C carries the residue" % (key, freq[key]))
            else:
                row["klass"], row["why"] = None, None
            out.append(row)

    for n, i, span, rend in build_c(books):
        if n != book:
            continue
        row = dict(arrow="C", key=rend, rends=[span], mine=[(span, "B%d-P%03d"
                                                             % (n, i))],
                   freq=freq[rend])
        k = (n, i, span, rend)
        if k in RULINGS:
            row["klass"], row["why"] = RULINGS[k]
        elif freq[rend] >= COMMON_WORD_MIN:
            row["klass"], row["why"] = "common-word", (
                "`%s` is an ordinary word Butler uses in %d paragraphs and the "
                "two uses share no referent" % (rend, freq[rend]))
        else:
            row["klass"], row["why"] = None, None
        out.append(row)
    return out


def main():
    book = int(sys.argv[1])
    rows = rows_for(book)
    unruled = [r for r in rows if r["klass"] is None]
    counts = defaultdict(int)
    for r in rows:
        counts[r["klass"] or "UNRULED"] += 1

    L = ["# Odyssey Book %d — the collision report, dispositioned" % book, "",
         "Written by `scripts/collision_triage.py`. Every row of every arrow "
         "that touches", "this Book, with a disposition on each. **Records "
         "finding R-2 and blind spot 8**", "of `book07/review/findings-v1.md`: "
         "the check returned seventy-two rows touching",
         "Book 7, eleven were acted on, and sixty-one were dismissed with no "
         "record of",
         "having been read. This file is that record, and it is generated, not "
         "typed.", "",
         "**%d rows touch Book %d.**" % (len(rows), book), "",
         "| disposition | rows |", "|---|---|"]
    for k in sorted(counts):
        L.append("| `%s` | %d |" % (k, counts[k]))
    L += ["", "The vocabulary is defined in the script's docstring. `homograph`,",
          "`same-referent`, `unavoidable-merge` and `phrase-not-word` are new "
          "here;",
          "`homograph` is the one the review asked for by name.", ""]

    for arrow, title in (("A", "ARROW A — one Butler word, two or more "
                                "renderings, across Books"),
                         ("B", "ARROW B — one rendering, two or more Butler "
                                "words, across Books"),
                         ("C", "ARROW C — one paragraph, one rendering ← a "
                                "word Butler keeps in that same paragraph")):
        rs = [r for r in rows if r["arrow"] == arrow]
        L += ["## %s" % title, "", "%d rows." % len(rs), "",
              "| key | this Book's entries | disposition | reason |",
              "|---|---|---|---|"]
        for r in rs:
            mine = ", ".join("`%s` (%s)" % (x, p) for x, p in r["mine"])
            L.append("| `%s` | %s | **`%s`** | %s |"
                     % (r["key"], mine, r["klass"] or "UNRULED",
                        (r["why"] or "").replace("\n", " ")))
        L.append("")

    path = ROOT / ("book%02d/collisions.md" % book)
    path.write_text("\n".join(L) + "\n", encoding="utf-8")
    print("%s: %d rows" % (path.relative_to(ROOT), len(rows)))
    for k in sorted(counts):
        print("  %-20s %d" % (k, counts[k]))
    if unruled:
        print("\n%d row(s) have NO disposition. Every row touching a Book must "
              "be ruled or dismissed with a reason." % len(unruled))
        for r in unruled:
            print("  ✗ %s %-14s %s" % (r["arrow"], r["key"], r["mine"]))
        return 1
    print("\nEvery row touching Book %d has a disposition." % book)
    return 0


if __name__ == "__main__":
    sys.exit(main())
