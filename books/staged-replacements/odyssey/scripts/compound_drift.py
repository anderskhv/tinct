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

# The accepted text of each Book, newest accepted successor first. Successors
# exist precisely because this check found something; the check reads the file
# the edition would actually ship.
ACCEPTED = [("book01", "book01/candidate-v3.json"),
            ("book02", "book02/candidate-v4.json"),
            ("book03", "book03/candidate-v3.json"),
            ("book04", "book04/candidate-v3.json")]

# Keys that are two different words, not two settings of one compound. Each is
# named with its reason; the list is closed and short on purpose, because a
# long exemption list is how a check stops being one.
NOT_COMPOUNDS = {
    # `may be` (modal + verb) against `maybe`; `in to` against `into`; etc.
    # Populated only when the report actually raises one, with the reason here.
}


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

    def control(name, mutated, expect_key):
        if mutated == base:                                   # clause (a)
            sys.exit("control %s: the mutation did not change the input" % name)
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
    # and a control on the BLIND SPOT, declared rather than waved away: a
    # compound open in Butler and open in every Book is invisible to this
    # check, because there is no disagreement to see. Clause (b) CANNOT be made
    # to hold for it, so it is named here and carried by a different
    # instrument -- a reader (findings-v1.md, section H.1).
    blind = {"A": ["he slept on the river bed"], "B": ["the riverbed was dry"]}
    if run(blind) != []:
        sys.exit("the declared blind spot behaves unexpectedly")
    print("compound_drift self-test: 3 controls fire on both clauses; "
          "1 blindness declared (no hyphen attests the pair)")


def main():
    _self_test()
    books = {}
    for label, rel in ACCEPTED:
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
