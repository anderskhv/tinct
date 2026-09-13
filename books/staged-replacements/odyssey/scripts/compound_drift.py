#!/usr/bin/env python3
"""compound_drift() — the cross-Book compound check, on the closed/open axis.

Ruling 1 of Book 5's round 1 (`book05/review/findings-v1.md`). The package's
original check, `hyphen_drift()` in `scripts/build_book3_v2.py`, compares a
compound printed **hyphenated** in one accepted Book against the **open** form
in another. It is blind to **closed against open**: `seashore` in one Book
beside `sea shore` in another passes it silently, and that is exactly the pair
the package was carrying — Butler's `sea-shore` rendered open in Books 2, 3 and
4 while every neighbouring compound was being closed.

The generalization is one idea: **key each compound on its letters with the
separator stripped**, so `seashore`, `sea-shore` and `sea shore` all key to
`seashore`; collect the *set of settings* observed per key across the Books;
fail on any key carrying more than one setting. That subsumes the
hyphenated-vs-open comparison the old function did, and adds closed-vs-open and
hyphenated-vs-closed. Run over Books 1-4 as they stood before this ruling, it
raises `sea shore` — which is to say it would have raised it at Book 3, two
Books before a reader did.

`hyphen_drift()` is kept where it is, unchanged, for one reason only: Book 3's
build script must go on reproducing its frozen `candidate-v2.json` byte for
byte (**D10**). Nothing new should call it.

Two-clause control rule (**D18**): the self-test at the bottom asserts, for
every control, both that the mutation changed the input **and** that the
verdict changed. Run `python3 scripts/compound_drift.py` to execute it and to
print the cross-Book report.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# The accepted text of each Book — the successor where one exists, because
# successors exist precisely because this check found something and the check
# must read the file the edition would actually ship.
#
# **It is DERIVED, not written here.** Book 8's round 1 (M-6) found this list
# kept as a second, independent copy of `checks.ACCEPTED`, and found it stale
# in six of its seven rows: it named `book01/candidate-v3.json` after v4
# existed, `book02/candidate-v5.json` after v6, `book04/candidate-v4.json`
# after v5, Books 5 and 6 at v2 after both had v3 successors, and — the one
# that matters — **`book07/candidate-v1.json`, which is the REJECTED file**.
# So the cross-Book compound report every session is told to run was being run
# over a Book 7 no reviewer accepted. One fact written twice is one fact
# updated once; it is now written once, in `checks.ACCEPTED`, and read from
# there. `checks.declaration_coverage()` asserts that column is not itself
# stale.
sys.path.insert(0, str(Path(__file__).resolve().parent))


def _accepted():
    import checks
    return [("book%02d" % bk, succ or acc)
            for bk, (_src, acc, succ) in sorted(checks.ACCEPTED.items())]

# Keys that are two different words, not two settings of one compound. Each is
# named with its reason; the list is closed and short on purpose, because a
# long exemption list is how a check stops being one.
NOT_COMPOUNDS = {
    # Closed, short, and every entry carries its reason. A long exemption list
    # is how a check stops being one.
    "sunset": "`the sun set` is a verb and its subject; `sunset` is a noun. "
              "Two different constructions, not two settings of one compound.",
}

# A pair is not a compound if either element is a closed-class function word.
# This is what makes the CLOSED axis usable at all: without it, `any one`,
# `every one`, `some one`, `on to`, `up on`, `a long`, `a broad` and `her a`
# are all "compounds" that drift, and the report is noise.
STOPWORDS = frozenset("""
a an the this that these those and or but so for nor yet of in on at to by up
out off no not one ones two be is am are was were been being do does did have
has had will would shall should may might can could must i you he she it we
they me him her us them my your his its our their s t re ve ll d m all any
some every each other another such same as if then than there here when where
who whom whose which what how why now new own more most much many well ill
too very just only also ever never both few own way
""".split())


def compound_drift(books, attest=()):
    """`books` is {label: [paragraphs]} -- the accepted editions to compare.
    A pair bounded by a further hyphen is not a pair: `well-to-do` must not
    decompose into `well-to` and `to-do`, or the ubiquitous open `to do` and
    `well to` turn a three-part compound into two phantom drifts.

    `attest` is extra texts (Butler's own source paragraphs) used ONLY to
    discover which word pairs are compounds at all. Returns a list of
    (key, {setting: sorted labels}) for every key observed with more than one
    setting across `books`.

    **Key discovery is the whole difficulty.** Keying on separator-stripped
    letters alone makes every adjacent word pair in English a candidate
    compound: `any one`/`anyone`, `on to`/`onto`, `sun set`/`sunset`, `up on`/
    `upon`, `her a`/`Hera`. So a pair is admitted as a compound only when a
    **hyphen** attests it somewhere in the corpus, Butler's own text included.
    Butler's `sea-shore` is what licenses `sea shore` and `seashore` to be
    compared; it is also, in the package's experience, present for every
    compound that has ever drifted here, because the Victorian setting of a
    compound is usually the hyphen.

    The declared consequence: a compound Butler sets open everywhere and every
    Book renders open is invisible (`half way`, `river bed`, `mid ocean`,
    `sweet smelling` -- section H.1 of Book 5's round 1, all four found by
    reading). This check catches DRIFT between Books; it does not know modern
    English.
    """
    text = {k: " ".join(v).lower() for k, v in books.items()}
    corpus = list(text.values()) + [" ".join(a).lower() for a in attest]

    parts = {}
    for t in corpus:
        for m in re.finditer(r"(?=(?<!-)\b([a-z]+)-([a-z]+)\b(?!-))", t):
            parts.setdefault(m.group(1) + m.group(2), set()).add(
                (m.group(1), m.group(2)))

    # The CLOSED axis, added at Book 6. A hyphen is the strongest evidence that
    # a pair is a compound, but it is not the only one: `seashore` printed
    # closed in one Book beside `sea shore` open in another is the same defect,
    # and `water-side` appears nowhere in PG #1727, so the hyphen test alone
    # cannot see `waterside` against `water side`. So a pair is ALSO admitted
    # when its concatenation is printed as a single word somewhere in the
    # corpus -- guarded by STOPWORDS and a three-letter minimum, without which
    # `any one`, `on to`, `up on` and `her a` flood the report.
    closed_words = set()
    for t in corpus:
        closed_words |= set(re.findall(r"\b[a-z]{6,}\b", t))
    for t in corpus:
        for m in re.finditer(r"(?=\b([a-z]{3,}) ([a-z]{3,})\b)", t):
            a, b = m.group(1), m.group(2)
            if a in STOPWORDS or b in STOPWORDS:
                continue
            if a + b in closed_words:
                parts.setdefault(a + b, set()).add((a, b))

    out = []
    for key in sorted(parts):
        if key in NOT_COMPOUNDS:
            continue
        found = {}
        for label, t in text.items():
            for a, b in parts[key]:
                if re.search(r"(?<!-)\b%s-%s\b(?!-)" % (re.escape(a), re.escape(b)), t):
                    found.setdefault("hyphenated", set()).add(label)
                # lookahead, so adjacent pairs OVERLAP: "the sea shore" must
                # yield `sea shore` and not be eaten by `the sea`.
                if re.search(r"\b%s %s\b" % (re.escape(a), re.escape(b)), t):
                    found.setdefault("open", set()).add(label)
            if re.search(r"\b%s\b" % re.escape(key), t):
                found.setdefault("closed", set()).add(label)
        if len(found) > 1:
            out.append((key, {s: sorted(v) for s, v in sorted(found.items())}))
    return out


# ---------------------------------------------------------------- self-test
# D18, the two-clause control rule: every control asserts (a) that its mutation
# changed the input, and (b) that the check's own verdict changed. Clause (b)
# is what R-2 of Book 5's round 1 showed to be the load-bearing half -- the
# reviewer had a control that changed the text, asserted it, and still did not
# fire, because the measure was blind to what it had changed.

def _self_test():
    base = {"A": ["they walked by the sea shore at dawn"],
            "B": ["the sea shore was empty"]}
    att = [["butler wrote sea-shore and low-lying here"]]

    def run(bk):
        return compound_drift(bk, attest=att)

    if run(base):
        sys.exit("compound_drift self-test: the clean corpus must not drift")

    def control(name, original_or_mutated, *rest):
        """control(name, mutated, key) against `base`, or
        control(name, original, mutated, key) against an explicit original."""
        if len(rest) == 1:
            original, mutated, expect_key = base, original_or_mutated, rest[0]
        else:
            original, mutated, expect_key = original_or_mutated, rest[0], rest[1]
        if mutated == original:                               # clause (a)
            sys.exit("control %s: the mutation did not change the input" % name)
        if compound_drift(original, attest=att):
            sys.exit("control %s: the unmutated corpus already drifts" % name)
        got = run(mutated)
        if not any(k == expect_key for k, _ in got):          # clause (b)
            sys.exit("control %s: the verdict did not change (%r)" % (name, got))

    control("closed against open",
            {"A": ["they walked by the seashore at dawn"], "B": base["B"]},
            "seashore")
    control("hyphenated against open",
            {"A": ["they walked by the sea-shore at dawn"], "B": base["B"]},
            "seashore")
    control("hyphenated against closed",
            {"A": ["they walked by the sea-shore at dawn"],
             "B": ["the seashore was empty"]},
            "seashore")
    # the CLOSED axis, added at Book 6: no hyphen anywhere, and the drift is
    # still seen, because one Book prints the pair as a single word.
    control("closed-word axis, no hyphen in the corpus",
            {"A": ["they walked by the water side"],
             "B": ["the water side was empty"]},
            {"A": ["they walked by the waterside"],
             "B": ["the water side was empty"]},
            "waterside")

    # and a control on what REMAINS blind, declared rather than waved away: a
    # compound open in Butler and open in EVERY Book, with no hyphenated and no
    # closed form anywhere in the corpus. There is no disagreement to see, and
    # nothing here knows modern English. Clause (b) cannot be made to hold, so
    # it is named and carried by a different instrument -- a reader
    # (book05/review/findings-v1.md, section H.1, which found `half way`,
    # `river bed`, `mid ocean` and `sweet smelling` that way).
    blind = {"A": ["he slept on the river bed"], "B": ["down by the river bed"]}
    if run(blind) != []:
        sys.exit("the declared blind spot behaves unexpectedly")
    print("compound_drift self-test: 4 controls fire on both clauses; "
          "1 blindness declared (open everywhere, no closed or hyphenated "
          "form in the corpus)")


def main():
    _self_test()
    books = {}
    for label, rel in _accepted():
        p = ROOT / rel
        if p.exists():
            books[label] = json.loads(p.read_bytes().decode("utf-8"))["paragraphs"]
        else:
            print("  (%s not present: %s)" % (label, rel))
    for extra in sys.argv[1:]:
        books[Path(extra).parent.name] = json.loads(
            Path(extra).read_bytes().decode("utf-8"))["paragraphs"]
    drift = compound_drift(books)
    print("compound_drift over %s" % ", ".join(sorted(books)))
    if not drift:
        print("  no compound carries more than one setting across the Books")
    for key, found in drift:
        print("  %-18s %s" % (key, "; ".join(
            "%s in %s" % (s, "/".join(v)) for s, v in found.items())))
    return 1 if drift else 0


if __name__ == "__main__":
    sys.exit(main())
