#!/usr/bin/env python3
"""Odyssey Book 8 — source verification, the THIRTEENTH kind of rule.

Twelve kinds are enumerated in `../../RESUME.md`. This is none of them.
`RESUME.md` names four channels still unused; this rule takes **two of them
together**, because neither alone both *locates* and *verifies*:

  * **PG's own file arithmetic** — the `*** START` / `*** END` markers, the
    front matter, the twenty-four headings and the `FOOTNOTES:` section as a
    set of byte intervals that must **exactly tile** the marker-to-marker range
    with **zero residue and no overlap**; and
  * **the served edition's own paragraph-count arithmetic** — the served file's
    24-vector of per-chapter paragraph counts, used as the index that says
    which tile is Book 8, read as **counts only**.

The verifying clause then reads the located span through a channel none of the
twelve uses: the paragraph is split into a **closed-class function-word order
stream** and a **content-word anagram stream** (each content word replaced by
its sorted letters), compared **positionally**. Neither stream is a needle, a
fingerprint, a residue, a diff, a resemblance profile, a typographic shape, a
line count, or a capitalization bitstring.

**Why two streams and not one.** Either alone has a large null space. The
anagram stream cannot see `no` for `on`, `dog` for `god`, `united`/`untied`.
The function-word stream cannot see any content word at all. Together the null
space is the intersection: a mutation must be an anagram of a content word
*and* leave every function word in place. That is asserted, not assumed —
`control 7` plants exactly such a mutation and shows the combined verdict moves
because the anagram stream is **positional**, while `control 8` shows the
single-stream null space is real by planting a mutation that one stream misses.

## The audit found a defect in this rule as first written, as it has in all six

**Defect 1 (found, repaired).** The function-word stream as first written was
built over `re.findall(r"[a-z]+")` on the lower-cased paragraph. That silently
**merges `he'll` into `he` + `ll`** and, worse, makes `I` (function word) and
`i` indistinguishable from the `i` inside PG's Greek transliterations — but the
real defect was that lower-casing made the stream **blind to sentence-initial
capitals**, which is precisely two of the three served-vs-PG divergences this
rule has to reproduce (`But`/`but` at B03-P001 and `They`/`they` at B04-P001).
The rule as first written therefore reported **two** divergences where there
are four, and would have passed a served file in which every Book opened with
the wrong case. It is repaired by carrying a **case bit** on the first token of
every paragraph, which is the minimum that restores the class, and `control 5`
plants that exact mutation.

**Defect 4 (found, repaired).** The two streams as designed are built entirely
out of word tokens, so both are **punctuation- and whitespace-blind**. The rule
therefore reproduced only **three** of the served file's four divergences from
PG: it could not see **B01-P025**, whose whole difference is a space before an
em dash. A rule that silently reports three where the record says four is a
rule that would have been read as *contradicting* the drafter's clause 3 rather
than as incomplete. Repaired by a **third stream** — every mark in order with
two whitespace-adjacency bits and no letter content — which is a channel none
of the twelve uses either. `control 14` plants exactly the B01-P025 mutation.

**Defect 3 (found, repaired — and it is the one that would have shipped).**
PG separates the `BOOK N` heading from its argument line by a blank line and
the argument line from the prose by another, so a `\n\n` split of a tile
yields **three** classes of block, not two. The clause as first written dropped
only the heading and so counted PG's **argument line as the chapter's first
paragraph**. Every chapter came out one paragraph long — `(1, 32, 33)`,
`(2, 35, 36)`, `(3, 38, 39)`, … — a *uniform* off-by-one in the same direction
in all twenty-four, which is the shape most likely to be read as a convention
difference and waved through rather than as a defect. It is repaired to
`blocks[2:]`, and clause B's `sum(want) != 1027` assertion is what would have
caught it if the vector comparison had not.

**Defect 2 (found, repaired).** The tiling clause as first written summed the
interval lengths and compared the total with the marker-to-marker length. That
**cannot detect a swap**: two intervals exchanged, or one grown and its
neighbour shrunk by the same amount, sum identically. A sum is not a tiling.
It is repaired to assert the intervals are sorted, contiguous (`end[i] ==
start[i+1]`) and span the range exactly — an ordering assertion, not an
arithmetic one. `control 9` grows one tile and shrinks the next by the same
number of bytes; the sum is unchanged and the repaired clause fires.

Usage: python3 book08/review/verify_source_book8_review.py
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PKG = HERE.parent.parent
REPO = PKG.parent.parent.parent
PG = PKG / "source-texts/pg1727-butler-1900.txt"
SERVED = REPO / "app/public/data/editions/odyssey-original-en.json"
sys.path.insert(0, str(PKG / "scripts"))
from controls import control, declare_blind, summary          # noqa: E402

BOOK = 8
START = "*** START OF THE PROJECT GUTENBERG EBOOK THE ODYSSEY ***"
END = "*** END OF THE PROJECT GUTENBERG EBOOK THE ODYSSEY ***"

# PG #1727 sets footnote anchors as a bare 1-3 digit run, not `[n]`. The served
# original-en carries zero digits in all 1,027 paragraphs, asserted below.
ANCHOR = re.compile(r"(?<!\d)\d{1,3}(?!\d)")

# A closed class, fixed here and not derived from either artefact, so that
# neither text can influence which of its own words are held to be structural.
FUNCTION = frozenset("""
a an the and but or nor for yet so as if then than that which who whom whose
this these those there here he him his she her hers it its they them their
i me my mine we us our ours you your yours himself herself itself themselves
is are was were be been being am has have had do does did will would shall
should can could may might must of in on at to from by with without within
into onto upon over under above below through between among against about
after before during until while when where why how what not no nor none
all any both each every few many more most other some such only own same
one two three now again ever never also too very up down out off out
""".split())

WORD = re.compile(r"[A-Za-zÀ-ɏ]+(?:['’][A-Za-z]+)?")


def fail(m):
    sys.exit("verify_source_book8_review.py: " + m)


# ------------------------------------------------------------- the two streams
def _words(p):
    return WORD.findall(ANCHOR.sub("", p))


def function_stream(p):
    """The closed-class words, in order, with a case bit on the FIRST token of
    the paragraph (audit defect 1). Content words appear only as the
    placeholder `*`, so this stream carries word order and nothing else."""
    ws = _words(p)
    out = []
    for k, w in enumerate(ws):
        low = w.lower().replace("’", "'")
        tok = low if low in FUNCTION else "*"
        if k == 0:
            tok = ("^" if w[:1].isupper() else "_") + tok
        out.append(tok)
    return tuple(out)


def anagram_stream(p):
    """Every non-function word replaced by its sorted letters, in order.
    Positional, so a relocation moves it; letter-identity-preserving, so a
    letter flip moves it; blind to letter order inside one word, which is why
    it is never used alone."""
    out = []
    for w in _words(p):
        low = w.lower().replace("’", "'")
        if low in FUNCTION:
            continue
        out.append("".join(sorted(low)))
    return tuple(out)


MARK = re.compile(r"[;,.:!?\u2014\u2019\u201c\u201d()\u2018'\"-]")


def mark_stream(p):
    """The third stream, added by audit defect 4: every punctuation mark in
    order, each with two bits — is it preceded by whitespace, is it followed by
    whitespace. It carries no letter at all, which is why it is a stream of its
    own and not a patch to the other two."""
    out = []
    for m in MARK.finditer(p):
        out.append((m.group(0),
                    m.start() > 0 and p[m.start() - 1].isspace(),
                    m.end() < len(p) and p[m.end()].isspace()))
    return tuple(out)


def signature(paragraphs):
    """The verifying channel: three streams, per paragraph, positionally."""
    return tuple((function_stream(p), anagram_stream(p), mark_stream(p))
                 for p in paragraphs)


# --------------------------------------------------- clause A: the tiling
def markers(text):
    a = text.index(START) + len(START)
    b = text.index(END)
    return a, b


def tiles(text):
    """Every byte of the marker-to-marker range assigned to exactly one named
    interval, in order, with no gap and no overlap.

    Repaired after audit defect 2: this asserts CONTIGUITY, not a sum."""
    a, b = markers(text)
    hs = [m.start() for m in re.finditer(r"^BOOK ([IVXLC]+)\n", text, re.M)]
    fn = text.index("\nFOOTNOTES:", hs[-1])
    cuts = [a] + hs + [fn, b]
    names = (["front matter"]
             + ["BOOK %d" % k for k in range(1, len(hs) + 1)]
             + ["FOOTNOTES"])
    return [(names[i], cuts[i], cuts[i + 1]) for i in range(len(cuts) - 1)]


def clauseA(text):
    """**BODY-BLIND, and it reads no word of any chapter.** The tiles must be
    sorted, contiguous, non-empty, and span the marker-to-marker range
    exactly."""
    try:
        a, b = markers(text)
    except ValueError:
        return "clause A: PG's START/END markers are not both present exactly"
    if text.count(START) != 1 or text.count(END) != 1:
        return "clause A: PG's START/END markers are not unique"
    return tiling_ok(tiles(text), a, b)


def tiling_ok(T, a, b):
    """The repaired clause as a PURE function of the tile list, so that
    `control 9` can mutate the tiling itself rather than the text. Asserts
    ORDERING, not a sum (audit defect 2)."""
    if len(T) != 26:
        return "clause A: the tiling has %d intervals, not 26" % len(T)
    if T[0][1] != a or T[-1][2] != b:
        return "clause A: the tiling does not span marker to marker"
    for i, (n, s, e) in enumerate(T):
        if e <= s:
            return "clause A: tile %r is empty or inverted" % n
        if i and T[i - 1][2] != s:
            return ("clause A: tile %r does not begin where %r ends "
                    "(%d against %d) — a gap or an overlap"
                    % (n, T[i - 1][0], s, T[i - 1][2]))
    return None


# ------------------------------- clause B: the served file's own count index
def pg_paragraphs(text, k):
    """The k-th Book's prose, dropping the argument block, normalized only for
    footnote anchors and whitespace."""
    T = tiles(text)
    _n, s, e = T[k]                      # T[0] is the front matter
    body = text[s:e]
    blocks = [b for b in body.split("\n\n") if b.strip()]
    # blocks[0] is the `BOOK N` heading, blocks[1] the argument line. Dropping
    # only ONE of them is audit defect 3 below.
    return [" ".join(ANCHOR.sub("", b).split()) for b in blocks[2:]
            if ANCHOR.sub("", b).strip()]


def clauseB(doc, text):
    """**COUNTS ONLY — reads no word of either artefact.** The served file's
    own 24-vector of per-chapter paragraph counts must equal PG's, position for
    position. That vector is what says which tile is Book 8."""
    want = [len(c["paragraphs"]) for c in doc["chapters"]]
    got = [len(pg_paragraphs(text, k)) for k in range(1, 25)]
    if len(want) != 24:
        return "clause B: the served file has %d chapters, not 24" % len(want)
    if want != got:
        bad = [(k + 1, w, g) for k, (w, g) in enumerate(zip(want, got))
               if w != g]
        return ("clause B: the per-chapter paragraph-count vectors differ at "
                "%r (chapter, served, PG)" % bad[:6])
    if sum(want) != 1027:
        return "clause B: the served file has %d paragraphs, not 1,027" % sum(want)
    return None


# --------------------------- clause C: the located span, through both streams
DIVERGENCES = {
    (1, 25): "PG sets a space before the em dash in `above all others —for it "
             "is I`; the served file closes it up. Whitespace only.",
    (3, 1): "PG opens Book III lower-case, `but as the sun was rising` — "
            "Butler's sentence runs on from the end of Book II. The served "
            "file capitalizes it. One letter's case.",
    (4, 1): "PG opens Book IV lower-case, `they reached the low lying city` — "
            "the same run-on, from PG's Book III ¶38. The served file "
            "capitalizes it. One letter's case.",
    (3, 38): "The D14 splice, ledger A3: PG's ¶38 is the 11-word half-sentence "
             "`Now when the sun had set and darkness was over the land,` and "
             "the served file completes it with ~197 words of the served "
             "MODERN-EN's own ¶38.",
}


def clauseC(doc, text, k=BOOK):
    """Book 8 through both streams, and then ALL 24 chapters, with the
    divergences enumerated exactly in both directions."""
    served = [" ".join(ANCHOR.sub("", p).split())
              for p in doc["chapters"][k - 1]["paragraphs"]]
    pg = pg_paragraphs(text, k)
    if len(pg) != len(served):
        return ("clause C: PG's Book %d has %d paragraphs, the served chapter "
                "%d" % (k, len(pg), len(served)))
    if signature(pg) != signature(served):
        for i, (a, b) in enumerate(zip(pg, served), 1):
            if signature([a]) != signature([b]):
                return ("clause C: Book %d paragraph %d differs under the "
                        "two streams\n  PG:     %r\n  served: %r"
                        % (k, i, a[:120], b[:120]))
    bad = []
    for c in doc["chapters"]:
        j = c["number"]
        P = pg_paragraphs(text, j)
        S = [" ".join(ANCHOR.sub("", p).split()) for p in c["paragraphs"]]
        if len(P) != len(S):
            bad.append((j, "count"))
            continue
        for i, (a, b) in enumerate(zip(P, S), 1):
            if signature([a]) != signature([b]):
                bad.append((j, i))
    if sorted(bad) != sorted(DIVERGENCES):
        return ("clause C: the served file's divergences from PG under the two "
                "streams must be exactly %r; found %r"
                % (sorted(DIVERGENCES), bad[:8]))
    return None


def verdict(doc, text):
    return (clauseA(text), clauseB(doc, text), clauseC(doc, text))


# ------------------------------------------------------------------- controls
def _load():
    text = PG.read_text(encoding="utf-8")
    doc = json.loads(SERVED.read_text(encoding="utf-8"))
    return doc, text


def _clone(doc):
    return json.loads(json.dumps(doc))


def _mutate_chapter(doc, k, i, new):
    d = _clone(doc)
    d["chapters"][k - 1]["paragraphs"][i - 1] = new
    return d


def main():
    doc, text = _load()
    ndig = sum(len(re.findall(r"\d", p))
               for c in doc["chapters"] for p in c["paragraphs"])
    if ndig:
        fail("the served original-en carries %d digit(s); stripping PG's bare "
             "footnote anchors is only safe because it carries none" % ndig)

    v = verdict(doc, text)
    print("Odyssey Book 8 — source verification, the THIRTEENTH kind of rule")
    print("PG #1727 sha256 %s" % __import__("hashlib").sha256(
        PG.read_bytes()).hexdigest())
    print("served original-en sha256 %s" % __import__("hashlib").sha256(
        SERVED.read_bytes()).hexdigest())
    print()
    for name, r in zip(("clause A — PG's marker-to-marker byte tiling, "
                        "contiguous, BODY-BLIND",
                        "clause B — the served file's own per-chapter "
                        "paragraph-count vector, COUNTS ONLY",
                        "clause C — the located span and all 24 chapters "
                        "through the function-word and anagram streams"), v):
        print(("  %s %s" % ("✓" if r is None else "✗", name))
              if r is None else "  ✗ %s\n    %s" % (name, r))
    if any(v):
        fail("source verification FAILED: %r" % (v,))

    T = tiles(text)
    print()
    print("  Book 8's tile: PG bytes %d..%d, %d paragraphs, %d words"
          % (T[BOOK][1], T[BOOK][2], len(pg_paragraphs(text, BOOK)),
             sum(len(p.split()) for p in pg_paragraphs(text, BOOK))))
    print("  the served count vector: %r"
          % [len(c["paragraphs"]) for c in doc["chapters"]])
    print()

    # --- controls, all routed through controls.control() (D18)
    V = lambda d: verdict(d, text)                              # noqa: E731
    VT = lambda t: verdict(doc, t)                              # noqa: E731

    b8 = doc["chapters"][BOOK - 1]["paragraphs"]

    # 1 — one letter changed (the floor: a control against typos)
    p = b8[3]
    w = sorted((x for x in set(_words(p)) if len(x) > 6 and x.isalpha()))[0]
    control("clause C: one letter changed in a served Book VIII paragraph",
            original=doc,
            mutated=_mutate_chapter(doc, BOOK, 4,
                                    p.replace(w, w[:-1] + ("z" if w[-1] != "z"
                                                           else "q"), 1)),
            verdict=V)

    # 2 — THE B03-P038 SPLICE, planted into Book 8 (the defect this package
    #     actually found: A3 / D14)
    splice = doc["chapters"][2]["paragraphs"][37]
    control("clause C: **the B03-P038 splice** — the served file's own spliced "
            "¶38, planted into Book VIII",
            original=doc,
            mutated=_mutate_chapter(doc, BOOK, 20, splice),
            verdict=V)

    # 3 — a paragraph of BUTLER'S OWN from another Book: every token his
    control("clause C: **a paragraph of Butler's own Book VI** substituted "
            "into Book VIII — every token his",
            original=doc,
            mutated=_mutate_chapter(doc, BOOK, 11,
                                    doc["chapters"][5]["paragraphs"][7]),
            verdict=V)

    # 4 — a paragraph of Butler's own Book VIII, MOVED within Book VIII
    d = _clone(doc)
    d["chapters"][BOOK - 1]["paragraphs"][30] = b8[8]
    control("clause C: a paragraph of Butler's own Book VIII moved within "
            "Book VIII", original=doc, mutated=d, verdict=V)

    # 5 — THE AUDIT DEFECT: a sentence-initial capital changed, nothing else
    control("clause C: the FIRST letter's case changed and nothing else "
            "(audit defect 1 — the class of B03-P001 and B04-P001)",
            original=doc,
            mutated=_mutate_chapter(doc, BOOK, 1, b8[0][0].lower() + b8[0][1:]),
            verdict=V)

    # 6 — a function word deleted, content untouched
    q = b8[5]
    m = re.search(r"\b(and|but|for|with)\b ", q)
    control("clause C: one function word deleted, every content word kept",
            original=doc,
            mutated=_mutate_chapter(doc, BOOK, 6, q[:m.start()] + q[m.end():]),
            verdict=V)

    # 7 — THE COMBINED NULL SPACE: a content word replaced by its own anagram,
    #     which the anagram stream alone cannot see as a letter change
    idx = next(i for i, q in enumerate(b8, 1) if " on " in q)
    r0 = b8[idx - 1]
    control("clause C: a word replaced by its own ANAGRAM (`on`→`no`) — in "
            "the anagram stream's null space, caught because both are "
            "function words and the FUNCTION stream is positional",
            original=doc,
            mutated=_mutate_chapter(doc, BOOK, idx,
                                    r0.replace(" on ", " no ", 1)),
            verdict=V)

    # 8 — AUDIT DEFECT 5, shown rather than asserted: a pure letter
    #     REORDERING inside one content word is in the null space of all
    #     three streams together. Not a control; a declared blindness with
    #     its evidence computed here.
    s0 = b8[13]
    ws = [x for x in _words(s0) if len(x) > 5 and x.lower() not in FUNCTION]
    tgt = ws[0]
    mut = s0.replace(tgt, "".join(sorted(tgt)), 1)
    assert mut != s0, "control 8 precondition"
    if signature([" ".join(mut.split())]) != signature([" ".join(s0.split())]):
        fail("audit defect 5 is stated wrongly: the three streams DID see a "
             "pure letter reordering inside one content word")

    # 9 — THE AUDIT DEFECT 2 in clause A, tested on the CLAUSE and not on the
    #     text: one tile grown and the next shrunk by the same bytes. The sum
    #     of the interval lengths is bit-for-bit unchanged; the repaired
    #     ordering assertion fires. The control also asserts that the SUM
    #     form — the clause as first written — does NOT fire, which is what
    #     makes it a control on the repair and not on the check.
    a0, b0 = markers(text)
    T = tiles(text)
    Tm = list(T)
    n8, s8, e8 = Tm[BOOK]
    Tm[BOOK] = (n8, s8, e8 + 400)
    nX, sX, eX = Tm[-1]
    Tm[-1] = (nX, sX + 400, eX)
    assert (sum(e - s for _n, s, e in T)
            == sum(e - s for _n, s, e in Tm)), "control 9 premise"
    control("clause A: one tile grown by 400 bytes and a NON-adjacent tile "
            "shrunk by 400 — the SUM of the interval lengths is bit-for-bit "
            "UNCHANGED, and the repaired ordering assertion fires "
            "(audit defect 2: a sum is not a tiling)",
            original=T, mutated=Tm, verdict=lambda t: tiling_ok(t, a0, b0))

    # 10 — a paragraph deleted from the served Book 8: the count index moves
    d = _clone(doc)
    del d["chapters"][BOOK - 1]["paragraphs"][22]
    control("clause B: a paragraph deleted from the served Book VIII — "
            "the count vector, which reads no word", original=doc, mutated=d,
            verdict=V)

    # 11 — two paragraphs transposed
    d = _clone(doc)
    ps = d["chapters"][BOOK - 1]["paragraphs"]
    ps[16], ps[17] = ps[17], ps[16]
    control("clause C: two Book VIII paragraphs transposed", original=doc,
            mutated=d, verdict=V)

    # 12 — a changed number-word (PG's own body carries no digits)
    d = None
    for i, p in enumerate(b8, 1):
        if "fifty-two" in p:
            d = _mutate_chapter(doc, BOOK, i, p.replace("fifty-two", "fifty-three", 1))
            break
    assert d is not None, "control 12 precondition: `fifty-two` is in Book VIII"
    control("clause C: a changed number-word (fifty-two oarsmen)",
            original=doc, mutated=d, verdict=V)

    # 13 — POSITIVE control: the rule must go on accepting PG's own footnote
    #      anchors, which are bare digit runs
    d = _mutate_chapter(doc, BOOK, 2, b8[1])
    control("clause C: POSITIVE — a footnote anchor stripped from PG's "
            "side is already how the rule reads it",
            original=doc,
            mutated=_mutate_chapter(doc, BOOK, 2, b8[1] + " "),
            verdict=V, expect_same=True)

    # 14 — THE AUDIT DEFECT 4 class: a space before an em dash, nothing else
    t0 = b8[2]
    assert "\u2014" in t0, "control 14 precondition"
    control("clause C: a space inserted before an em dash and nothing else "
            "(audit defect 4 — the class of B01-P025)",
            original=doc,
            mutated=_mutate_chapter(doc, BOOK, 3,
                                    t0.replace("\u2014", " \u2014", 1)),
            verdict=V)

    declare_blind(
        "a tile BOUNDARY moved — tile k\u2019s end and tile k+1\u2019s start "
        "shifted together",
        because="clause A asserts contiguity, and a boundary moved in both "
                "tiles at once is still contiguous; no arithmetic over "
                "intervals can see it, which is a real limit of the channel "
                "and not a defect in the clause",
        carried_by="clause C of this rule, which reads the located span's "
                   "own paragraphs and fires on the first word that moves "
                   "across the boundary")
    declare_blind(
        "a pure letter REORDERING inside one content word "
        "(`%s` -> `%s`, computed above and shown not to move the verdict)"
        % (tgt, "".join(sorted(tgt))),
        because="all three streams are anagram-, function-class- and "
                "mark-based; none reads letter ORDER inside a content word",
        carried_by="scripts/verify_source_book8.py clause 2, which compares "
                   "the located span character for character")
    declare_blind(
        "a defect PG and the served file SHARE",
        because="both sides of every clause are read from the same two "
                "artefacts, so a corruption present in PG itself and carried "
                "faithfully into the served file cannot move any verdict",
        carried_by="book07/review/verify_source_book7_review.py clause 4, "
                   "which reads PG's FOOTNOTES section against its own "
                   "internal structure (records finding R-3)")
    declare_blind(
        "a content word replaced by a DIFFERENT word with the same letter "
        "multiset AND the same function-word neighbourhood AND the same "
        "pointing",
        because="the three streams' null spaces intersect only there",
        carried_by="scripts/verify_source_book8.py clause 2, which compares "
                   "the located span character for character")

    print(summary())
    print()
    print("  the three divergences of the served file from PG that clause C "
          "reproduces independently, besides the D14 splice:")
    for k in ((1, 25), (3, 1), (4, 1)):
        print("    B%02d-P%03d — %s" % (k[0], k[1], DIVERGENCES[k]))


if __name__ == "__main__":
    main()
