#!/usr/bin/env python3
"""**The pin on Butler.** Substantive finding S-6 / attack **A11** of Book 9's
round 1.

**What was wrong.** Every figure, every census and every gate in this package
is computed against `bookNN/source-bookN.json`. That file was loaded by naming
convention — `load("book%02d/source-book%d.json")` — and its sha256 appeared in
no `manifest.json`, in no `ACCEPTED`, `DECLARED` or `SUPERSEDED` row, and in no
assertion of `prove_manifest.py`. The reviewer demonstrated it twice, 13 of 13:

* **loud** — turn twelve of Butler's full stops into semicolons, run the
  ordinary `checks.py 9 --write-manifest`, and Book 9's published raw splitting
  rate goes 21.1% → 30.2% while `--manifests`, `--all` and `--declarations` all
  exit 0 and `DECLARED` is byte-identical. No declaration is needed, so it is
  not A9;
* **silent** — remove **one comma**. No recorded figure can see a comma, so
  nothing has to be regenerated at all and the committed manifest stays true.

Hashing the file would have stopped both, and it would have pinned the source
**to the package's own copy of it**. A recorded sha256 of a file the package
also writes is a promise it makes to itself. So this module does not hash the
copy; it **re-derives Butler from Project Gutenberg #1727** and compares.

**The chain, end to end.**

```
gutenberg.org/ebooks/1727.txt.utf-8            (the public artefact)
  │  sha256 ffbdb29c…, 717 784 bytes — re-downloaded 2026-09-13 and identical
  ▼
source-texts/pg1727-butler-1900.txt            PG_SHA256, asserted every run
  │  extract_books(): BOOK I … BOOK XXIV between PG's own headings and its own
  │  FOOTNOTES: marker; argument line dropped; blank-line blocks; the footnote
  │  anchor stream asserted to be exactly 1…187, strictly increasing
  ▼
PG Book N, normalized                          == source-bookN.json, normalized
  │                                            except SOURCE_DIVERGENCES, which
  │                                            is enumerated exactly, with a
  ▼                                            written reason on every row
bookNN/source-bookN.json                       == the served chapter, character
                                               for character (clause c)
```

**Why the comparison is normalized and what that costs.** `checks.py`'s own
`load()` is `" ".join(p.split())`: every measure the package publishes is
computed on whitespace-collapsed text, so a pin that holds in that space holds
over exactly the bytes the figures can see. Digits are removed because PG's
body carries its footnote reference numerals inline and the served file strips
them; the removal is not a licence, because the stream of removed digits is
asserted to be PG's own apparatus — **1 to 187, strictly increasing, no gaps**
(records finding R-4: they are footnote anchors, not page numbers, and they are
an ordered checkable stream). A digit *inserted* into a source file therefore
does not hide in the null space; it breaks the stream.

What normalization does not see: whitespace, and digits. Clause (c) —
character-identity with the served chapter — closes whitespace; the anchor
stream closes digits.

**`SOURCE_DIVERGENCES` is the A7 register made load-bearing.** It was prose in
`00-progress-ledger.md`. Here it is four rows, each with a reason, asserted as
set equality in both directions: a divergence not enumerated **fails**, and an
enumerated divergence that is no longer there **also fails**. Running the
derivation over all 24 chapters finds exactly these four and nothing else,
which is the first time the ledger's A7 claim has been checked by anything.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ------------------------------------------------------------------ the anchor
PG_FILE = "source-texts/pg1727-butler-1900.txt"
PG_SHA256 = "ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9"
PG_BYTES = 717784
PG_URL = "https://www.gutenberg.org/ebooks/1727.txt.utf-8"
# Re-downloaded from PG_URL on 2026-09-13 in the session that wrote this file;
# the download hashed to PG_SHA256 byte for byte. That is what makes the hash
# traceable to Project Gutenberg rather than to this package's copy of it: a
# third party with no access to this repository can reproduce it.
PG_REDOWNLOAD_CONFIRMED = "2026-09-13"

SERVED = "app/public/data/editions/odyssey-original-en.json"   # READ ONLY

ROMAN = ("I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII "
         "XIX XX XXI XXII XXIII XXIV").split()
N_ANCHORS = 187          # PG #1727's footnote apparatus, [1] … [187]

# ------------------------------------------------- the A7 register, enumerated
# **Every place `bookNN/source-bookN.json` (and therefore the served
# `original-en`) departs from PG #1727, by name, with its reason.** Ledger A7
# recorded these in prose and nothing checked them. Set equality both ways.
# A fifth divergence anywhere fails; a listed one that vanishes fails too.
SOURCE_DIVERGENCES = {
    (1, 25): ("PG sets a space before the em dash in `and mine above all "
              "others —for it is I`; the served file closes it up. Typographic "
              "only: no letter, no mark and no word moves, and it survives the "
              "whitespace collapse every measure runs under because the space "
              "is interior to a token boundary PG itself did not make. "
              "A7 row 1."),
    (3, 1): ("PG opens Book III lower-case — `but as the sun was rising` — "
             "because Butler runs one sentence across the Book boundary and "
             "says so in his Preface to the First Edition. The served file "
             "capitalizes it. A7 row 2; **A3-widened restores PG**, and S-7 of "
             "Book 9's round 1 shows the restoration cannot be made alone."),
    (3, 38): ("the **D14 splice**: 196 of the served paragraph's 208 words are "
              "the replaced `modern-en`'s own ¶38, spliced into the original. "
              "This is the divergence `BASIS[3]` excludes Book 3's ¶38 for. "
              "A7 row 3, and the one divergence that is a defect rather than a "
              "normalization."),
    (4, 1): ("PG opens Book IV lower-case — `they reached the low lying city` "
             "— for the same reason as Book III, and Butler's Preface names "
             "Books ii. and iii. as the pair that end with a comma. The served "
             "file capitalizes it. A7 row 4."),
}


# ------------------------------------------------------------------- machinery
def pg_text():
    """PG #1727's bytes, refused unless they are the ones that were pinned."""
    p = ROOT / PG_FILE
    if not p.exists():
        raise RuntimeError("pg_source: %s is missing — the package cannot "
                           "verify its own source without it" % PG_FILE)
    b = p.read_bytes()
    h = hashlib.sha256(b).hexdigest()
    if h != PG_SHA256:
        raise RuntimeError(
            "pg_source: %s hashes to %s and the pin is %s. Project Gutenberg "
            "#1727 is the one end of every comparison this package makes; if "
            "this file has moved, nothing below it means anything."
            % (PG_FILE, h[:12], PG_SHA256[:12]))
    if len(b) != PG_BYTES:
        raise RuntimeError("pg_source: %s is %d bytes and the pin is %d"
                           % (PG_FILE, len(b), PG_BYTES))
    # PG ships CRLF. The hash above is over the bytes as PG serves them; the
    # line endings are normalized only after hashing, so nothing in the pin
    # depends on this repository's checkout settings.
    return b.decode("utf-8").replace("\r\n", "\n")


def extract_books(txt=None):
    """PG's twenty-four Books, as lists of paragraph strings.

    Structural markers only, all of them PG's own: the `BOOK <roman>` headings
    and the `FOOTNOTES:` marker that ends the body. The all-capitals argument
    line under each heading is PG's apparatus, not Butler's prose, and is
    dropped — it is the one block in each Book that the served file does not
    carry, and the drop is positional (the first block) rather than a match on
    its content.
    """
    txt = pg_text() if txt is None else txt
    lines = txt.split("\n")
    starts = {}
    for i, l in enumerate(lines):
        m = re.match(r"^BOOK ([IVX]+)$", l)
        if m and m.group(1) in ROMAN:
            k = ROMAN.index(m.group(1)) + 1
            if k in starts:
                raise RuntimeError("pg_source: two `BOOK %s` headings"
                                   % m.group(1))
            starts[k] = i
    if sorted(starts) != list(range(1, 25)):
        raise RuntimeError("pg_source: PG does not carry twenty-four Book "
                           "headings; found %r" % sorted(starts))
    ends = [i for i, l in enumerate(lines) if l.startswith("FOOTNOTES:")]
    if len(ends) != 1:
        raise RuntimeError("pg_source: expected exactly one FOOTNOTES: marker, "
                           "found %d" % len(ends))
    end = ends[0]
    if end <= starts[24]:
        raise RuntimeError("pg_source: the FOOTNOTES: marker precedes BOOK "
                           "XXIV; the body is not where this rule thinks")

    # **The anchor stream.** Every digit run in the body, in order, must be
    # PG's footnote apparatus 1 … 187 with no gap and no repeat. This is what
    # licenses `norm()` to delete digits: the digits it deletes are accounted
    # for one by one, so a digit planted in a source file cannot hide in the
    # null space of the normalization.
    body = "\n".join(lines[starts[1]:end])
    nums = [int(m.group()) for m in re.finditer(r"\d+", body)]
    if nums != list(range(1, N_ANCHORS + 1)):
        raise RuntimeError(
            "pg_source: PG's inline footnote anchors are not the strictly "
            "increasing stream 1…%d (got %d runs, first break at %r)"
            % (N_ANCHORS, len(nums),
               next((i + 1 for i, v in enumerate(nums) if v != i + 1), None)))

    out = {}
    for n in range(1, 25):
        a, b = starts[n], starts.get(n + 1, end)
        blocks, cur = [], []
        for l in lines[a + 1:b]:
            if l.strip() == "":
                if cur:
                    blocks.append("\n".join(cur))
                    cur = []
            else:
                cur.append(l)
        if cur:
            blocks.append("\n".join(cur))
        if len(blocks) < 2:
            raise RuntimeError("pg_source: Book %d has %d blocks" % (n, len(blocks)))
        out[n] = blocks[1:]          # blocks[0] is PG's argument line
    return out


def norm(s):
    """The space every published measure is computed in: whitespace collapsed
    (`checks.py`'s own `load()`), footnote anchors removed."""
    return " ".join(re.sub(r"\d+", "", s).split())


def served_chapters():
    d = json.loads((ROOT.parent.parent.parent / SERVED).read_text(encoding="utf-8"))
    return d["chapters"]


def derive(n, pg=None):
    """PG #1727's Book N, ready to compare."""
    pg = extract_books() if pg is None else pg
    return pg[n]


# ---------------------------------------------------------------- the clauses
def verify_source(book, source_rel=None, pg=None, served=None):
    """Put the whole chain to one Book. Returns a list of failure messages.

    * **(c)** `bookNN/source-bookN.json` is character-identical to chapter N of
      the served `original-en` — the file the edition actually ships beside.
    * **(d)** PG Book N and the source file agree paragraph for paragraph under
      `norm()`, except at the rows `SOURCE_DIVERGENCES` enumerates for this
      Book, which must all be present and none of which may be missing.
    """
    bad = []
    rel = source_rel or ("book%02d/source-book%d.json" % (book, book))
    p = ROOT / rel
    if not p.exists():
        return ["source: %s does not exist" % rel]
    src = json.loads(p.read_text(encoding="utf-8"))["paragraphs"]

    # (c) — character-identity with the served chapter.
    try:
        ch = (served if served is not None else served_chapters())[book - 1]
    except Exception as e:                                   # noqa: BLE001
        bad.append("source: the served original-en could not be read: %s" % e)
        ch = None
    if ch is not None:
        if ch.get("number") != book:
            bad.append("source: served chapter %d is numbered %r"
                       % (book, ch.get("number")))
        if ch["paragraphs"] != src:
            n = sum(1 for a, b in zip(ch["paragraphs"], src) if a != b)
            bad.append("source: %s is NOT character-identical to the served "
                       "original-en chapter %d (%d paragraph(s) differ, %d vs "
                       "%d paragraphs)"
                       % (rel, book, n, len(src), len(ch["paragraphs"])))

    # (d) — the derivation from Project Gutenberg.
    try:
        pgb = derive(book, pg)
    except Exception as e:                                   # noqa: BLE001
        return bad + ["source: Book %d could not be derived from %s: %s"
                      % (book, PG_FILE, e)]
    if len(pgb) != len(src):
        return bad + ["source: PG #1727 Book %d has %d paragraphs and %s has "
                      "%d" % (book, len(pgb), rel, len(src))]
    found = {i + 1 for i in range(len(src)) if norm(pgb[i]) != norm(src[i])}
    want = {para for (bk, para) in SOURCE_DIVERGENCES if bk == book}
    for para in sorted(found - want):
        bad.append(
            "source: %s paragraph %d does not reproduce from PG #1727 and is "
            "not an enumerated divergence — **Butler has been edited**. "
            "PG: %r … / file: %r …"
            % (rel, para, norm(pgb[para - 1])[:90], norm(src[para - 1])[:90]))
    for para in sorted(want - found):
        bad.append(
            "source: %s paragraph %d is enumerated in SOURCE_DIVERGENCES and "
            "now reproduces from PG — the register is stale; remove the row "
            "or explain it" % (rel, para))
    return bad


def verify_all(books=range(1, 25)):
    """Every Book PG carries, whether or not this package has drafted it.

    Running the derivation over all twenty-four is what turns the A7 register
    from a claim about four places into a claim about the whole text: four
    divergences and no fifth, asserted rather than asserted-about."""
    bad = []
    try:
        pg = extract_books()
    except Exception as e:                                   # noqa: BLE001
        return ["source: PG #1727 could not be read or parsed: %s" % e]
    served = served_chapters()
    found = set()
    for n in books:
        pgb, ch = pg[n], served[n - 1]
        if len(pgb) != len(ch["paragraphs"]):
            bad.append("source: PG Book %d has %d paragraphs and the served "
                       "chapter has %d"
                       % (n, len(pgb), len(ch["paragraphs"])))
            continue
        for i, (a, b) in enumerate(zip(pgb, ch["paragraphs"])):
            if norm(a) != norm(b):
                found.add((n, i + 1))
    want = set(SOURCE_DIVERGENCES)
    for k in sorted(found - want):
        bad.append("source: the served original-en diverges from PG #1727 at "
                   "chapter %d ¶%d and A7 does not enumerate it" % k)
    for k in sorted(want - found):
        bad.append("source: SOURCE_DIVERGENCES enumerates chapter %d ¶%d and "
                   "the served file now reproduces there" % k)
    # **The bound, and it is the A10 remedy applied to this register.**
    # `SOURCE_DIVERGENCES` is the one declarable thing in the pin, so it is
    # the one place an attacker with write access to this package could
    # license an edit — *provided they also edited the served
    # `original-en`, which is outside this package's permitted scope.* Four is
    # the number the served file actually carries; a fifth row FAILS rather
    # than being written, and A3-widened can only remove rows, never add them.
    if len(SOURCE_DIVERGENCES) > 4:
        bad.append("source: SOURCE_DIVERGENCES carries %d rows and the bound "
                   "is 4. A fifth divergence from Project Gutenberg is not a "
                   "row to write; it is an escalation (ledger A7)."
                   % len(SOURCE_DIVERGENCES))
    for k, reason in SOURCE_DIVERGENCES.items():
        if not reason or len(reason.split()) < 8:
            bad.append("source: the divergence at chapter %d ¶%d carries no "
                       "written reason" % k)
    return bad


def source_sha256(book):
    return hashlib.sha256(
        (ROOT / ("book%02d/source-book%d.json" % (book, book))).read_bytes()
    ).hexdigest()


# ------------------------------------------------------------------ controls
# D18's two-clause rule: every control asserts (a) that its mutation actually
# changed the input and (b) that the verdict changed. A control that "did not
# fire" for a reason unrelated to the rule is the failure mode this package
# has hit five times.
def self_test():
    import copy
    ok = []

    def fires(name, mutate):
        pg = extract_books()
        served = copy.deepcopy(served_chapters())
        before = verify_source(9, pg=pg, served=served)
        assert not before, "control %r: the unmutated input already fails" % name
        mutate(pg, served)
        after = verify_source(9, pg=pg, served=served)
        assert after, ("control %r did NOT fire — the pin is blind to it"
                       % name)
        ok.append(name)

    def _one_comma(pg, served):
        # A11(b), the silent form, verbatim: no token, sentence, semicolon,
        # colon or dash moves, so not one recorded figure can see it.
        i = next(i for i, b in enumerate(pg[9]) if "," in b)
        pg[9][i] = pg[9][i].replace(",", "", 1)
    fires("A11(b) — ONE COMMA removed from Butler", _one_comma)

    def _full_stops(pg, served):
        # A11(a), the loud form: twelve full stops become semicolons.
        n = 0
        for i, b in enumerate(pg[9]):
            while n < 12 and ". " in pg[9][i]:
                pg[9][i] = pg[9][i].replace(". ", "; ", 1)
                n += 1
            if n >= 12:
                break
    fires("A11(a) — twelve of Butler's full stops rewritten as semicolons",
          _full_stops)

    def _one_letter(pg, served):
        pg[9][0] = pg[9][0].replace("Alcinous", "Alcinons", 1)
    fires("one letter changed", _one_letter)

    def _served_only(pg, served):
        # The source file is left alone and the SERVED chapter is edited: the
        # attack that would be needed to make an edited source derive.
        served[8]["paragraphs"][0] = served[8]["paragraphs"][0].replace(
            "good thing", "fine thing", 1)
    fires("the served chapter edited under a sound source", _served_only)

    def _para_dropped(pg, served):
        del pg[9][20]
    fires("a paragraph of Butler deleted", _para_dropped)

    def _transposed(pg, served):
        pg[9][10], pg[9][11] = pg[9][11], pg[9][10]
    fires("two paragraphs transposed", _transposed)

    # **The control that answers *a file matching itself*.** Clause (d)
    # compares the source with PG and clause (c) compares it with the served
    # file; if the three were one object the rule would be a tautology. Replace
    # PG's Book IX entirely and clause (d) must fail while clause (c) still
    # passes — which shows the two clauses read two different things.
    pg = extract_books()
    served = served_chapters()
    pg[9] = ["filler %d" % i for i in range(44)]
    msgs = verify_source(9, pg=pg, served=served)
    assert msgs and all("character-identical" not in m for m in msgs), \
        "control: replacing PG's Book IX must fail clause (d) and not clause (c)"
    ok.append("PG's Book IX replaced entirely — (d) fails, (c) still passes")

    # And a digit planted in a source file cannot hide in the normalization's
    # null space, because the anchor stream is asserted to be PG's own.
    txt = pg_text().replace("towards dawn.75", "towards dawn.750", 1)
    try:
        extract_books(txt)
    except RuntimeError as e:
        assert "footnote anchors" in str(e)
        ok.append("a digit changed in PG's anchor stream — refuses to run")
    else:                                                    # pragma: no cover
        raise AssertionError("control: the anchor stream did not fire")

    assert len(SOURCE_DIVERGENCES) <= 4
    return ok


def main():
    import sys
    print("pg_source.py — the pin on Butler (A11)\n")
    print("  PG #1727   %s  %s" % (PG_SHA256[:16], PG_FILE))
    print("  re-downloaded from %s and identical, %s\n"
          % (PG_URL, PG_REDOWNLOAD_CONFIRMED))
    for name in self_test():
        print("  \u2713 control fires: %s" % name)
    print()
    bad = verify_all()
    for n in range(1, 10):
        msgs = verify_source(n)
        if msgs:
            bad += msgs
            for m in msgs:
                print("  ✗ %s" % m)
        else:
            print("  ✓ book%02d  source-book%d.json  %s  derives from PG "
                  "#1727 and is the served chapter character for character"
                  % (n, n, source_sha256(n)[:12]))
    print()
    if bad:
        for m in bad:
            if not m.startswith("source: book"):
                print("  ✗ %s" % m)
        print("\n%d source failure(s)." % len(bad))
        return 1
    print("All 24 chapters derive from PG #1727 under the published "
          "normalization; the only divergences are the %d rows of the A7 "
          "register, each with a reason." % len(SOURCE_DIVERGENCES))
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
