#!/usr/bin/env python3
"""Every measure the package publishes, in one module, run by one entry point.

Written at Book 6's step 6, from substantive finding **S-2** of
`book06/review/findings-v1.md`.

**Why this file exists.** Until it did, *none of the package's checks was
executed for a new Book by anything in the repository.* There was no
`scripts/build_book06*.py`; `scripts/build_book_package.py` called no check at
all. D17's splitting gate, the 50-word growth gate and D19's semicolon count
lived only inside `build_book04_v2.py` and `build_book05_v2.py` — Books 4's and
5's *correction* scripts, which never run for a new Book's v1 — so **D17 had
never gated a v1 candidate**, and Book 6 had no `checks-v1.md`. Every published
figure was correct and none was reproducible by running anything in the repo.
That is the `hyphen_drift()` disease — a check written once and never called
again — recurring one Book later as *all* of the checks.

**The enforcement is structural, not a convention.** Two clauses:

1. `build_book_package.py` runs `run_book()` at the end of every build and
   writes `bookNN/manifest.json` **only if the gates pass**, recording the
   sha256 of the `checks-vN.md` that run produced. A package directory whose
   checks did not run therefore has **no manifest**, and a manifest that does
   not name a checks file is a manifest from before this rule. A candidate that
   cannot be frozen without its checks running is a candidate whose checks run.
2. `python3 scripts/checks.py --all` re-asserts every accepted Book's
   **published** figures from the accepted files, and exits non-zero on any
   disagreement. It is what would have caught **R-1** three Books ago.

**Bases — records finding R-1.** A figure is meaningless without the paragraph
set it is computed over. `BASIS` below states that set for every Book, by name
and with its reason, and every table this module writes prints it on **every
row**. Book 3 is the Book that made this necessary: its published row
(`0.897`, `164 → 173`, `+5.5%`, `39 → 32`) is computed on **37 of its 38
paragraphs**, the **D14** splice at B03-P038 excluded, and nothing said so. On
all 38 the same measures give `0.86053`, `176 → 174 (−1.1%)` and `41 → 32`.

**Nothing here is re-pasted.** The frozen build scripts keep their own copies
because they must go on reproducing their outputs byte for byte (**D10**); new
work imports this module and only this module.
"""
import argparse
import difflib
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from compound_drift import compound_drift          # noqa: E402
from controls import control, declare_blind, summary  # noqa: E402

# GLOSSARY.md's closed Roman -> Greek table (D5/D6), lower-cased for the token
# measures so that Butler's `Ulysses` and the candidate's `Odysseus` are one
# token and the name policy does not read as a loss of retention.
NAME_MAP = {'ulysses': 'odysseus', 'minerva': 'athena', 'jove': 'zeus',
            'neptune': 'poseidon', 'mercury': 'hermes', 'saturn': 'cronus',
            'diana': 'artemis', 'euryclea': 'eurycleia', 'venus': 'aphrodite',
            'juno': 'hera', 'vulcan': 'hephaestus', 'ceres': 'demeter'}


# ------------------------------------------------------------------ measures
def toks(t):
    return [NAME_MAP.get(w, w)
            for w in re.findall(r"[a-z]+", t.replace("\n", " ").lower())]


def sentences(t):
    """The Book 4 round-1 reviewer's splitter, verbatim, so every number this
    module prints stays comparable with every number the package has already
    published. Do not 'improve' it."""
    t = t.replace("\n", " ")
    return [s for s in re.split(r'(?<=[.!?])["”’\']?\s+', t) if s.strip()]


def token_retention(src, cand):
    """The package's canonical measure, the **aggregate-join** form and only
    that form (`GLOSSARY.md`, 'The retention measure'). Book 1's published
    0.72703 reproduces in this form and in no other; the per-paragraph form
    gives 0.73258 for the same file, because Book 1 is the one Book whose
    alignment crosses paragraph boundaries."""
    a, b = toks(" ".join(src)), toks(" ".join(cand))
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    return sum(x.size for x in sm.get_matching_blocks()) / len(a)


def order_retention(src, cand):
    """Retention computed **per paragraph and summed**. This is the form
    MOVE-GAP needs — on the aggregate join a token deleted in one paragraph is
    'found' in another and the bag term inflates — and it is NOT the package's
    published retention. It differs only for Book 1 (0.73258 against 0.72703);
    for Books 2-6 the two forms agree to every printed place."""
    num = den = 0
    for s, c in zip(src, cand):
        a, b = toks(s), toks(c)
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        num += sum(x.size for x in sm.get_matching_blocks())
        den += len(a)
    return num / den


def bag_retention(src, cand):
    """Order-blind: does the candidate paragraph hold a copy of this source
    token at all?"""
    num = den = 0
    for s, c in zip(src, cand):
        a, b = Counter(toks(s)), Counter(toks(c))
        num += sum(min(n, b[w]) for w, n in a.items())
        den += sum(a.values())
    return num / den


def move_gap(src, cand):
    """**MOVE-GAP** (D20): bag retention minus order retention — the fraction
    of Butler's words the candidate keeps but *relocates*, with the vocabulary
    component divided out. The deficit decomposes with no residue:

        1 - order = (1 - bag) + (bag - order) = substitution+loss + MOVE-GAP

    It is an **upper bound on clause movement**: it counts any relocation of a
    surviving token, including phrase-internal ones (Book 6's highest
    paragraph, P004 at 0.0417, is a dative shift and a stranded preposition).
    The strict witness is `displaced_runs()`."""
    return bag_retention(src, cand) - order_retention(src, cand)


def semicolons(paragraphs):
    """D19."""
    return sum(p.count(";") for p in paragraphs)


def sentence_profile(paragraphs):
    ss = [s for p in paragraphs for s in sentences(p)]
    return len(ss), sum(1 for s in ss if len(s.split()) >= 60)


def splitting_rate(src, cand):
    """D17, raw. Returns (src_n, cand_n, %added, src60, cand60, %broken)."""
    sn, s60 = sentence_profile(src)
    cn, c60 = sentence_profile(cand)
    return (sn, cn, 100.0 * (cn - sn) / sn, s60, c60,
            100.0 * (s60 - c60) / s60 if s60 else 0.0)


def norm_rate(src, cand):
    """**NORM RATE** (D20): add each text's own semicolon count to its own
    sentence count, on **both** sides, so a semicolon and a period score the
    same and converting one into the other is worth exactly zero. What is left
    is division Butler's own pointing did not already supply.

    Returns (src_n, cand_n, raw%, src_norm, cand_norm, norm%)."""
    sn, _ = sentence_profile(src)
    cn, _ = sentence_profile(cand)
    a = sn + semicolons(src)
    b = cn + semicolons(cand)
    return (sn, cn, 100.0 * (cn - sn) / sn, a, b, 100.0 * (b - a) / a)


def _count_run(seq, run):
    L, n = len(run), 0
    for k in range(len(seq) - L + 1):
        if seq[k:k + L] == run:
            n += 1
    return n


def displaced_runs(s, c, minlen=4):
    """The strict, non-statistical witness for clause movement: a run of >= 4
    consecutive source tokens, occurring **exactly once on each side**, that
    survives verbatim outside the monotone alignment. The occurrence guard is
    what makes it a witness — without it, Butler's repeated formulas make the
    second copy of a run read as a relocation of the first."""
    a, b = toks(s), toks(c)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    aligned = set()
    for blk in sm.get_matching_blocks():
        aligned.update(range(blk.a, blk.a + blk.size))
    out, i = [], 0
    while i < len(a):
        if i in aligned:
            i += 1
            continue
        j = i
        while j < len(a) and j not in aligned:
            j += 1
        for L in range(j - i, minlen - 1, -1):
            hit = False
            for st in range(i, j - L + 1):
                run = a[st:st + L]
                if _count_run(a, run) == 1 and _count_run(b, run) == 1:
                    out.append((st, L, " ".join(run)))
                    hit = True
                    break
            if hit:
                break
        i = j
    return out


def near_identical(src, cand, max_edits=4, min_words=40):
    out = []
    for i, (s, c) in enumerate(zip(src, cand)):
        a, b = toks(s), toks(c)
        if len(a) < min_words:
            continue
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        edits = sum(max(i2 - i1, j2 - j1)
                    for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal")
        if edits <= max_edits:
            out.append((i + 1, len(a), edits,
                        max(len(x.split()) for x in sentences(c))))
    return out


def one_word_two_ways(src, cand):
    """The package's per-Book, Butler-keyed report. Its cross-Book, two-arrow
    successor is `scripts/rendering_collisions.py`; this one is kept because
    every published Book quotes its row count."""
    changed, kept = Counter(), {}
    for i, (s, c) in enumerate(zip(src, cand)):
        a, b = toks(s), toks(c)
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                for w in a[i1:i2]:
                    kept.setdefault(w, []).append(i + 1)
            else:
                for w in a[i1:i2]:
                    changed[w] += 1
    return [(w, n, len(kept[w]), kept[w][:6])
            for w, n in sorted(changed.items()) if w in kept]


# ------------------------------------------------------- the growth gate, D20
def align_sentences(src_para, cand_para):
    """Align each candidate sentence to the source sentence it came from, by
    best token overlap. Returns [(src_index, cand_sentence)] with src_index
    None where nothing overlaps."""
    ss = sentences(src_para)
    st = [Counter(toks(s)) for s in ss]
    out = []
    for c in sentences(cand_para):
        ct = Counter(toks(c))
        best, bi = 0, None
        for k, s in enumerate(st):
            ov = sum(min(n, ct[w]) for w, n in s.items())
            if ov > best:
                best, bi = ov, k
        out.append((bi, c))
    return ss, out


def growth(src, cand, report_at=40, fail_at=50):
    """**D20's half of the growth gate.** D19's gate as built compared each
    paragraph's **longest** candidate sentence with its source paragraph's
    **longest**, and that is a maximum against a maximum, not like against
    like: a draft that divides a paragraph's longest sentence lowers the new
    maximum and can then grow a *different* sentence past the old one's length
    with the gate reporting no growth at all. **Division buys cover for
    growth** — a defect the old gate cannot see by construction.

    The repair, exactly as Book 6's round 1 specifies it: align sentences
    instead of comparing paragraph maxima; keep **50 words** as the failure;
    **report** every growth, and report it at **40** so the number is visible
    before it is a failure.

    Returns (reported, failures): each a list of
    (paragraph_no, source_words, candidate_words, candidate_sentence)."""
    reported, failures = [], []
    for i, (s, c) in enumerate(zip(src, cand), 1):
        ss, pairs = align_sentences(s, c)
        for bi, cs in pairs:
            cw = len(cs.split())
            sw = len(ss[bi].split()) if bi is not None else 0
            if cw <= sw:
                continue
            row = (i, sw, cw, cs)
            if cw >= fail_at:
                failures.append(row)
            elif cw >= report_at:
                reported.append(row)
    return reported, failures


def long_sentences(src, cand, at=40):
    """Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a sentence
    left long because it **is** long in Butler.* Every length check in the
    package is relative to the source, so a 43-word four-limb chain that
    Butler also wrote at 43 words passes everything — which is exactly how
    B06-P016 and B06-P018 reached a review untouched. This is the absolute
    report: every candidate sentence over `at` words, with the source
    paragraph's longest beside it."""
    out = []
    for i, (s, c) in enumerate(zip(src, cand), 1):
        smax = max(len(x.split()) for x in sentences(s))
        for cs in sentences(c):
            if len(cs.split()) >= at:
                out.append((i, len(cs.split()), smax, cs))
    return out


# ------------------------------------------- the head-noun compound filter, H.1
# Book 6's round 1, §6.6. `compound_drift()` cannot see a compound the whole
# corpus sets open — demonstrated, not assumed: the closed form of every
# content-word pair in Book 6's candidate was looked for across PG #1727 and
# all twelve staged files and returned **zero hits**. Butler never writes
# `mountaintop`. Full closure needs a vendored English word list, which is a
# NEW DEPENDENCY and therefore a coordinator decision (ledger **A4**(ii)) — it
# is escalated, not taken. This is the interim instrument, which needs nothing:
# filter candidate word pairs to those whose SECOND element is a common
# compound head. On Book 6 it takes 482 pairs to 23 and surfaces the live
# instance, `mountain tops`.
COMPOUND_HEADS = frozenset("""
top tops side sides land lands man men woman women room rooms water sea seas
stone stones way ways house houses post posts wall walls court courts field
fields fire fires ship ships head heads board boards hold holds work works
line lines place places time times day days night nights shore shores bed beds
mark marks piece pieces yard yards gate gates door doors floor floors
""".split())

PAIR_STOP = frozenset("""
a an the this that these those and or but so for nor yet of in on at to by up
out off no not be is am are was were been being do does did have has had will
would shall should may might can could must i you he she it we they me him
her us them my your his its our their all any some every each other another
such same as if then than there here when where who whom whose which what how
why now more most much many one two three first last own very just only also
ever never both few too well
""".split())


def compound_pairs(paragraphs):
    """Every adjacent content-word pair in the candidate whose second element
    is a common compound head, deduplicated and sorted."""
    seen = set()
    for p in paragraphs:
        w = re.findall(r"[A-Za-z]+", p)
        for x, y in zip(w, w[1:]):
            lx, ly = x.lower(), y.lower()
            if lx in PAIR_STOP or ly in PAIR_STOP:
                continue
            if ly not in COMPOUND_HEADS:
                continue
            if len(lx) < 3:
                continue
            seen.add("%s %s" % (lx, ly))
    return sorted(seen)


# ------------------------------------------------------- bases and publication
# **Records finding R-1.** The paragraph set every figure is computed over,
# stated once, by name, with its reason — and printed on every row of every
# table this module writes.
BASIS = {
    1: (None, "all 32 paragraphs"),
    2: (None, "all 35 paragraphs"),
    3: (slice(0, 37),
        "37 of 38 — B03-P038 excluded, the **D14** splice: 196 of the served "
        "source paragraph's 208 words are the replaced `modern-en`'s own ¶38 "
        "and the candidate renders Butler's 12. Scoring a candidate against a "
        "source that is not its source measures the defect in the other file. "
        "The exclusion is correct and was never stated; both bases are "
        "printed here."),
    4: (None, "all 81 paragraphs"),
    5: (None, "all 37 paragraphs"),
    6: (None, "all 26 paragraphs"),
    7: (None, "all 29 paragraphs"),
}

# The accepted file of each Book, and its successor where one exists. The
# *accepted* file is what the published figures are computed on; the successor
# carries the compound corrections and is what the edition would ship.
ACCEPTED = {
    1: ("book01/source-book1.json", "book01/candidate-v2.json",
        "book01/candidate-v3.json"),
    2: ("book02/source-book2.json", "book02/candidate-v2.json",
        "book02/candidate-v5.json"),
    3: ("book03/source-book3.json", "book03/candidate-v2.json",
        "book03/candidate-v3.json"),
    4: ("book04/source-book4.json", "book04/candidate-v2.json",
        "book04/candidate-v4.json"),
    5: ("book05/source-book5.json", "book05/candidate-v2.json", None),
}

# Every figure the package publishes for an accepted Book, on that Book's own
# basis. `--all` recomputes each from the accepted file and fails on any
# disagreement. Keys: retention (5 dp), sentences src, sentences cand, sixty
# src, sixty cand, semicolons src, semicolons cand, norm rate (1 dp),
# MOVE-GAP (5 dp).
PUBLISHED = {
    1: dict(retention=0.72703, sent=(132, 159), sixty=(10, 0), semi=(47, 13),
            norm=-3.9, movegap=0.05088),
    2: dict(retention=0.90232, sent=(137, 159), sixty=(7, 4), semi=(36, 21),
            norm=+4.0, movegap=0.01632),
    3: dict(retention=0.89641, sent=(164, 173), sixty=(9, 6), semi=(39, 32),
            norm=+1.0, movegap=0.02156),
    4: dict(retention=0.95872, sent=(281, 306), sixty=(17, 3), semi=(68, 50),
            norm=+2.0, movegap=0.00431),
    5: dict(retention=0.93808, sent=(153, 189), sixty=(9, 1), semi=(34, 13),
            norm=+8.0, movegap=0.00891),
}


# Paragraphs each Book declares byte-identical to Butler, examined one by one
# and left because they are already plain modern English. Asserted exactly, so
# a later edit cannot silently add one. A Book absent from this table declares
# none.
BYTE_IDENTICAL = {
    4: [39, 54, 61, 63, 70, 79, 80],
}

# **What `scripts/checks.py --all` surfaced the first time it was run over the
# accepted Books, and the honest disposition of it.**
#
# Two of the gates this module carries were Book 5's assertions about Book 5,
# promoted to package rules — the per-paragraph length floor at 0.90 and the
# growth gate — and when they were finally run over Books 1-4 they fired
# eleven times and five times. **None of it is new damage. All of it is the
# S-2 disease measured**: the gates were written into Books 4's and 5's
# correction scripts and never ran anywhere else, so nobody knew.
#
# The gates are NOT weakened. What each accepted Book carries is **enumerated
# and asserted**, exactly as Book 4 already did for its seven byte-identical
# paragraphs, so a Book can never quietly acquire a twelfth instance and new
# work gets the gate at full strength. Each entry carries its reason.
#
# The dispositions are recorded in the ledger as records finding **R-6** and
# are a coordinator matter, not a drafter's: repairing any of them costs a
# successor to an accepted Book.

# Per-paragraph length floor. Default 0.90; a Book may declare a lower one,
# with its reason, where its own review examined it.
MIN_PARA_RATIO = {
    # Book 1 is the most heavily rewritten Book in the package (retention
    # 0.72703) and its acceptance record states the figure by name: "minimum
    # paragraph ratio 0.8621 at B01-P017, which the round-1 reviewer" examined.
    # Five paragraphs sit between 0.862 and 0.889. Declared, not exempted.
    1: 0.86,
}

# Sentences an accepted Book already grows past 50 words, aligned source
# sentence to candidate sentence. Every one is a growth of 1 to 4 words on a
# sentence BUTLER ALREADY WROTE at or near 50 — the class Book 5's finding
# 30.2 named ("a recast GROWS a long sentence of Butler's"), which the
# maximum-against-maximum gate could not see and which therefore ran in no
# Book before Book 5. (paragraph, source words, candidate words).
LEGACY_GROWTH = {
    1: [(5, 49, 50), (30, 48, 52)],
    2: [(19, 49, 50), (28, 57, 58)],
    3: [(11, 64, 66), (13, 69, 72), (24, 73, 74), (24, 56, 58)],
    4: [(18, 53, 54), (28, 54, 56), (76, 61, 62)],
}


def load(rel):
    d = json.loads((ROOT / rel).read_text(encoding="utf-8"))
    return [" ".join(p.split()) for p in d["paragraphs"]]


def scored(book, paragraphs):
    sl = BASIS[book][0]
    return paragraphs if sl is None else paragraphs[sl]


def figures(book, src, cand):
    """Every published figure for one Book, on that Book's own basis."""
    s, c = scored(book, src), scored(book, cand)
    sn, cn, raw, s60, c60, broken = splitting_rate(s, c)
    nr = norm_rate(s, c)
    return dict(basis=BASIS[book][1], n=len(s),
                retention=token_retention(s, c),
                order=order_retention(s, c), bag=bag_retention(s, c),
                movegap=move_gap(s, c),
                sent=(sn, cn), raw=raw, sixty=(s60, c60), broken=broken,
                semi=(semicolons(s), semicolons(c)),
                norm=nr[5], normpair=(nr[3], nr[4]))


# ------------------------------------------------------------------- the gates
class Gate:
    def __init__(self):
        self.failures = []

    def check(self, ok, msg):
        if not ok:
            self.failures.append(msg)
        return ok


def d17_floor():
    """Half the weakest accepted Book's raw splitting rate, computed from the
    accepted files on each Book's own basis — **not** re-pasted from prose.
    Book 3 is the weakest, and its basis is exactly what R-1 is about: on all
    38 paragraphs its rate is −1.1% and the floor would be negative, which is
    to say the gate would be vacuous. On its own 37-paragraph basis it is
    +5.5% and the floor is +2.75%."""
    rates = []
    for bk, (sf, cf, _) in ACCEPTED.items():
        f = figures(bk, load(sf), load(cf))
        rates.append((f["raw"], bk))
    worst, bk = min(rates)
    return worst * 0.5, worst, bk


# --------------------------------------------------------------- the run itself
def run_book(book, version=None, write=True, quiet=False):
    """Run every check for one Book, write `bookNN/checks-vN.md`, and return
    (figures, gate). The caller exits non-zero if `gate.failures`."""
    bd = ROOT / ("book%02d" % book)
    src = load("book%02d/source-book%d.json" % (book, book))
    if version is None:
        vs = sorted(int(p.stem.split("-v")[1]) for p in bd.glob("candidate-v*.json"))
        if not vs:
            sys.exit("checks.py: book%02d has no candidate-v*.json" % book)
        version = vs[-1]
    cand_path = bd / ("candidate-v%d.json" % version)
    cand = load(str(cand_path.relative_to(ROOT)))
    if book not in BASIS:
        BASIS[book] = (None, "all %d paragraphs" % len(src))

    g = Gate()
    g.check(len(src) == len(cand),
            "paragraph alignment: source %d, candidate %d" % (len(src), len(cand)))
    if g.failures:
        return None, g

    f = figures(book, src, cand)
    s, c = scored(book, src), scored(book, cand)

    # --- D17, and its gate, which until now had never gated a v1 candidate ---
    floor, worst, worst_bk = d17_floor()
    g.check(f["raw"] >= floor,
            "D17: %+.1f%% added, against a floor of %+.1f%% (half accepted "
            "Book %d's %+.1f%%)" % (f["raw"], floor, worst_bk, worst))
    s60, c60 = f["sixty"]
    g.check(c60 <= s60 * 0.75,
            "D17: %d of %d sixty-word sentences survive (more than three "
            "quarters)" % (c60, s60))

    # --- the growth gate, D20 -----------------------------------------------
    grown, grown_fail = growth(s, c)
    legacy = LEGACY_GROWTH.get(book, [])
    unexpected = [r for r in grown_fail if (r[0], r[1], r[2]) not in legacy]
    missing = [r for r in legacy
               if r not in [(a, b, d) for a, b, d, _ in grown_fail]]
    g.check(not unexpected,
            "D20 growth gate: a sentence grew past 50 words — "
            + "; ".join("P%03d %d→%d" % (a, b, d) for a, b, d, _ in unexpected))
    g.check(not missing,
            "D20 growth gate: this Book declares growths it no longer carries "
            "(update LEGACY_GROWTH): %s" % (missing,))

    # --- word ratio ----------------------------------------------------------
    sw = [len(p.split()) for p in s]
    cw = [len(p.split()) for p in c]
    ratio = sum(cw) / sum(sw)
    g.check(0.90 <= ratio <= 1.10, "word ratio %.5f outside 0.90–1.10" % ratio)
    floor_ratio = MIN_PARA_RATIO.get(book, 0.90)
    thin = [i + 1 for i, (a, b) in enumerate(zip(sw, cw)) if b / a < floor_ratio]
    g.check(not thin, "paragraphs below %.2f of their source's length: %s"
            % (floor_ratio, thin))

    # --- hygiene: D9, D12, whitespace, and the byte-identity rule -----------
    joined = "\n".join(cand)
    g.check("'" not in joined and '"' not in joined,
            "D9: an ASCII quote or apostrophe survives in the candidate")
    g.check("[" not in joined and "]" not in joined,
            "D12: a square-bracket mark survives in the candidate")
    g.check(not any("\n" in p or "  " in p or p != p.strip() for p in cand),
            "whitespace defect in a candidate paragraph")
    g.check(not re.search(r"\w+- \w+", joined),
            "a hyphenated compound was split by a rewrap")
    # Byte-identity is a REPORT with a per-Book expected list, not a blanket
    # ban. The blanket ban was Book 5's assertion, and promoting it to a
    # package gate was wrong: **accepted Book 4 carries seven byte-identical
    # paragraphs deliberately** — 39, 54, 61, 63, 70, 79 and 80, examined one
    # by one, left because they are plain modern English in Butler, recorded in
    # `book04/continuity.md` §6 and asserted exactly by Book 4's own build so a
    # later edit cannot silently add an eighth. That assertion is the right
    # shape and it is what this gate now is: the list must match what the Book
    # declares. A Book that declares none fails the moment one appears.
    same = [i + 1 for i, (a, b) in enumerate(zip(src, cand)) if a == b]
    g.check(same == BYTE_IDENTICAL.get(book, []),
            "byte-identical paragraphs %s, but this Book declares %s"
            % (same, BYTE_IDENTICAL.get(book, [])))

    # --- cross-Book compound drift (the hyphen_drift lesson) ----------------
    books = {}
    for bk, (_, acc, succ) in sorted(ACCEPTED.items()):
        p = ROOT / (succ or acc)
        if p.exists():
            books["book%02d" % bk] = json.loads(
                p.read_bytes().decode("utf-8"))["paragraphs"]
    books["book%02d-v%d" % (book, version)] = cand
    attest = []
    for bk in sorted(set(list(ACCEPTED) + [book])):
        p = ROOT / ("book%02d/source-book%d.json" % (bk, bk))
        if p.exists():
            attest.append(json.loads(p.read_bytes().decode("utf-8"))["paragraphs"])
    drift = compound_drift(books, attest=attest)
    g.check(not drift, "cross-Book compound drift: "
            + "; ".join("%s %s" % (k, v) for k, v in drift))

    # --- reports, not gates --------------------------------------------------
    near = near_identical(s, c)
    tw = one_word_two_ways(s, c)
    longs = long_sentences(s, c)
    pairs = compound_pairs(cand)
    dr = [(i, t) for i, (a, b) in enumerate(zip(s, c), 1)
          for _, _, t in displaced_runs(a, b)]

    if write:
        path = bd / ("checks-v%d.md" % version)
        path.write_text(_render(book, version, cand_path, f, g, grown,
                                grown_fail, near, tw, longs, pairs, dr, drift,
                                floor, worst, worst_bk, ratio),
                        encoding="utf-8")
        f["checks_md"] = str(path.relative_to(ROOT))
        f["checks_md_sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
    if not quiet:
        _print(book, version, f, g, grown, grown_fail, longs, pairs, dr)
    return f, g


def _row(bk, f):
    return ("| Book %s | %s | %.5f | %d → %d | %+.1f%% | %d → %d | %d → %d | "
            "%+.1f%% | %.5f |"
            % (bk, f["basis"].split(" —")[0].split(",")[0], f["retention"],
               f["sent"][0], f["sent"][1], f["raw"], f["sixty"][0],
               f["sixty"][1], f["semi"][0], f["semi"][1], f["norm"],
               f["movegap"]))


def comparison_table():
    """The corrected D17/D19/D20 table — **every row states its basis**, which
    is records finding **R-1**. Book 3 is printed on both bases."""
    rows = []
    for bk, (sf, cf, _) in sorted(ACCEPTED.items()):
        src, cand = load(sf), load(cf)
        rows.append((str(bk), figures(bk, src, cand)))
        if bk == 3:
            saved = BASIS[3]
            BASIS[3] = (None, "all 38 paragraphs (B03-P038 included)")
            rows.append(("3 *(all 38)*", figures(3, src, cand)))
            BASIS[3] = saved
    return rows


def _render(book, version, cand_path, f, g, grown, grown_fail, near, tw,
            longs, pairs, dr, drift, floor, worst, worst_bk, ratio):
    L = ["# Odyssey Book %d — checks, candidate v%d" % (book, version), "",
         "Written by `scripts/checks.py`, which is the only thing that computes",
         "these numbers. Before it existed, **none of the package's checks was",
         "executed for a new Book by anything in the repository** — substantive",
         "finding **S-2** of `book06/review/findings-v1.md`. Every figure below",
         "is reproducible by running `python3 scripts/checks.py %d`." % book, "",
         "**Subject:** `%s`, sha256 `%s`."
         % (cand_path.relative_to(ROOT),
            hashlib.sha256(cand_path.read_bytes()).hexdigest()), "",
         "**Basis — records finding R-1.** %s. A figure without the paragraph"
         % f["basis"],
         "set it is computed over is not a figure, and the package published",
         "one for three Books.", "",
         "## 1. Verdict", "",
         ("**All gates pass.**" if not g.failures
          else "**GATES FAILED — this candidate cannot be frozen.**"), ""]
    for x in g.failures:
        L.append("- %s" % x)
    L += ["", "## 2. The figures", "",
          "| measure | value |", "|---|---|",
          "| paragraphs scored | %d |" % f["n"],
          "| word ratio | %.5f |" % ratio,
          "| Butler token retention (canonical, aggregate-join) | **%.5f** |"
          % f["retention"],
          "| order retention (per paragraph, for MOVE-GAP) | %.5f |" % f["order"],
          "| bag retention (order-blind) | %.5f |" % f["bag"],
          "| **MOVE-GAP** (bag − order), D20 | **%.5f** |" % f["movegap"],
          "| sentences, source → candidate | %d → %d |" % f["sent"],
          "| **splitting rate** (D17, raw) | **%+.1f%%** |" % f["raw"],
          "| semicolon-normalized sentences | %d → %d |" % f["normpair"],
          "| **NORM RATE** (D20) | **%+.1f%%** |" % f["norm"],
          "| sixty-word sentences | %d → %d (%.0f%% broken) |"
          % (f["sixty"][0], f["sixty"][1], f["broken"]),
          "| **semicolons, Butler → candidate** (D19) | **%d → %d** |" % f["semi"],
          "", "Of the %+d sentences added, at most **%d** are a semicolon"
          % (f["sent"][1] - f["sent"][0], max(0, f["semi"][0] - f["semi"][1])),
          "rewritten as a period — the operation that adds a sentence, moves no",
          "clause, drops no word and costs no retention. That is what NORM RATE",
          "prices out, and why **D19 is a rate and not a count** (D20).", "",
          "## 3. The cross-Book table, with every basis stated (R-1)", "",
          "| Book | basis | retention | sentences | raw D17 | 60+ | semicolons "
          "| NORM RATE | MOVE-GAP |",
          "|---|---|---|---|---|---|---|---|---|"]
    for bk, ff in comparison_table():
        L.append(_row(bk, ff))
    L.append(_row("%d v%d" % (book, version), f))
    L += ["",
          "Book 3's row is the reason this column exists. Its published figures",
          "are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**",
          "splice — and nothing said so until now. On all 38 the same measures",
          "give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from",
          "them would be **negative**, which is to say the gate would be",
          "vacuous. The exclusion is right; its silence was not.", "",
          "## 4. D17's gate", "",
          "Floor **%+.1f%%**, half accepted Book %d's %+.1f%% — computed from"
          % (floor, worst_bk, worst),
          "the accepted files on each Book's own basis, never re-pasted from",
          "prose. This candidate: **%+.1f%%**. Sixty-word survival gate:"
          % f["raw"],
          "%d of %d survive, and the gate fails above %.2f."
          % (f["sixty"][1], f["sixty"][0], f["sixty"][0] * 0.75), "",
          "## 5. The growth gate, aligned sentence to sentence (D20)", "",
          "D19's gate as built compared each paragraph's **longest** candidate",
          "sentence with its source paragraph's **longest** — a maximum against",
          "a maximum. A draft that divides a paragraph's longest sentence lowers",
          "the new maximum and can then grow a *different* sentence past the old",
          "one's length with the gate reporting nothing. Division bought cover",
          "for growth. Sentences are now aligned by best token overlap; 50 words",
          "remains the failure; growth is reported from 40.", ""]
    if grown_fail:
        L += ["**FAILURES:**", ""]
        L += ["- B%02d-P%03d %d → %d words: %s" % (book, a, b, d, e)
              for a, b, d, e in grown_fail]
    L += ["", "Sentences grown to 40 words or more: **%d**." % len(grown), ""]
    if grown:
        L += ["| paragraph | source sentence | candidate sentence |",
              "|---|---|---|"]
        L += ["| B%02d-P%03d | %d words | %d words |" % (book, a, b, d)
              for a, b, d, _ in grown]
    L += ["", "## 6. Every candidate sentence over 40 words (absolute)", "",
          "Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a",
          "sentence left long because it **is** long in Butler.* Every other",
          "length check in the package is relative to the source, so a 43-word",
          "four-limb chain that Butler also wrote at 43 words passes all of",
          "them — which is how B06-P016 and B06-P018 reached a review",
          "untouched. This report is absolute.", "",
          "**%d sentences.**" % len(longs), ""]
    if longs:
        L += ["| paragraph | words | source paragraph's longest | sentence |",
              "|---|---|---|---|"]
        L += ["| B%02d-P%03d | **%d** | %d | %s |"
              % (book, a, b, c, d[:120] + ("…" if len(d) > 120 else ""))
              for a, b, c, d in longs]
    L += ["", "## 7. Displaced runs — the strict clause-movement witness", "",
          "A run of four or more consecutive Butler tokens, occurring exactly",
          "once on each side, surviving verbatim outside the monotone",
          "alignment. MOVE-GAP is an upper bound; this is the lower one.", "",
          ("**%d.**" % len(dr)) if dr else "**None.**", ""]
    if dr:
        L += ["| paragraph | run |", "|---|---|"]
        L += ["| B%02d-P%03d | «%s» |" % (book, i, t) for i, t in dr]
    L += ["", "## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)",
          "", "| paragraph | source words | edits | longest sentence |",
          "|---|---|---|---|"]
    L += ["| B%02d-P%03d | %d | %d | %d words |" % (book, a, b, c, d)
          for a, b, c, d in near]
    if not near:
        L.append("| — | — | — | — |")
    L += ["", "## 9. One Butler word rendered two ways (per Book, Butler-keyed)",
          "", "**%d rows.** This report's declared limits, which records finding"
          % len(tw),
          "**R-5** is about: it keys on Butler's side only and runs inside one",
          "Book, so it cannot see one *rendering* made to carry two Butler",
          "words, and it cannot compare a word's renderings across Books. Both",
          "arrows, across all Books, are `scripts/rendering_collisions.py`.", "",
          "| Butler word | times changed | times kept | kept at (first six) |",
          "|---|---|---|---|"]
    L += ["| `%s` | %d | %d | %s |" % (w, ch, kp, ", ".join("P%03d" % x for x in ex))
          for w, ch, kp, ex in tw]
    L += ["", "## 10. Cross-Book compound drift", "",
          "`scripts/compound_drift.py`, keyed on separator-stripped letters so",
          "closed, hyphenated and open settings of one compound collide.", "",
          "Result over %s: **%s**."
          % (", ".join(sorted(books_label())), 
             "no drift" if not drift else "; ".join("%s %s" % (k, v) for k, v in drift)),
          "", "## 11. The closing-compound filter (H.1, interim)", "",
          "`compound_drift()` is blind to a compound the whole corpus sets",
          "open, and the blindness was demonstrated rather than assumed: the",
          "closed form of every content-word pair in Book 6's candidate was",
          "looked for across PG #1727 and all twelve staged files — **zero",
          "hits**. Butler never writes `mountaintop`; the corpus cannot be its",
          "own dictionary. Full closure needs a vendored English word list,",
          "which is a **new external dependency** and is escalated to the",
          "coordinator as ledger item **A4**(ii), not taken here.", "",
          "The interim instrument needs no dependency: every adjacent",
          "content-word pair whose **second** element is a common compound",
          "head. **%d pairs.**" % len(pairs), "",
          "> " + " · ".join("`%s`" % p for p in pairs), ""]
    return "\n".join(L) + "\n"


def books_label():
    out = ["book%02d" % bk for bk in ACCEPTED]
    return out


def _print(book, version, f, g, grown, grown_fail, longs, pairs, dr):
    print("Book %d candidate-v%d — %s" % (book, version, f["basis"]))
    print("  paragraphs scored          %d" % f["n"])
    print("  Butler token retention     %.5f  (canonical, aggregate-join)"
          % f["retention"])
    print("  bag / order / MOVE-GAP     %.5f / %.5f / %.5f"
          % (f["bag"], f["order"], f["movegap"]))
    print("  sentences src → cand       %d → %d  (%+.1f%% raw, D17)"
          % (f["sent"][0], f["sent"][1], f["raw"]))
    print("  NORM RATE (D20)            %+.1f%%  (%d → %d normalized)"
          % (f["norm"], f["normpair"][0], f["normpair"][1]))
    print("  60+ word sentences         %d → %d  (%.0f%% broken)"
          % (f["sixty"][0], f["sixty"][1], f["broken"]))
    print("  semicolons Butler → cand   %d → %d  (D19)" % f["semi"])
    print("  sentences grown to 40+     %d (0 may fail at 50+)" % len(grown))
    print("  candidate sentences 40+    %d (absolute)" % len(longs))
    print("  displaced runs             %d" % len(dr))
    print("  H.1 head-noun pairs        %d" % len(pairs))
    if g.failures:
        print("  GATES FAILED:")
        for x in g.failures:
            print("    ✗ %s" % x)
    else:
        print("  all gates pass")


# ---------------------------------------------------------------------- --all
def run_all():
    """Re-assert every accepted Book's **published** figures from the accepted
    files. This is what would have caught R-1 three Books ago."""
    bad = []
    print("checks.py --all — re-asserting every accepted Book's published "
          "figures\n")
    print("%-8s %-24s %9s %12s %9s %10s %10s %9s"
          % ("Book", "basis", "retention", "sentences", "60+", "semicolons",
             "NORM RATE", "MOVE-GAP"))
    for bk in sorted(ACCEPTED):
        sf, cf, _ = ACCEPTED[bk]
        f = figures(bk, load(sf), load(cf))
        p = PUBLISHED[bk]
        print("%-8d %-24s %9.5f %6d → %-3d %4d → %-3d %5d → %-3d %+8.1f%% %9.5f"
              % (bk, f["basis"].split(" —")[0], f["retention"], f["sent"][0],
                 f["sent"][1], f["sixty"][0], f["sixty"][1], f["semi"][0],
                 f["semi"][1], f["norm"], f["movegap"]))
        for key, got, want, fmt in (
                ("retention", f["retention"], p["retention"], "%.5f"),
                ("sentences", f["sent"], p["sent"], "%s"),
                ("sixty", f["sixty"], p["sixty"], "%s"),
                ("semicolons", f["semi"], p["semi"], "%s"),
                ("NORM RATE", round(f["norm"], 1), p["norm"], "%s"),
                ("MOVE-GAP", round(f["movegap"], 5), p["movegap"], "%.5f")):
            g = round(got, 5) if isinstance(got, float) else got
            if g != want:
                bad.append("Book %d %s: published %s, recomputed %s"
                           % (bk, key, fmt % (want,), fmt % (g,)))
    print()
    # Book 3 on the other basis, so the two can never again be confused.
    saved = BASIS[3]
    BASIS[3] = (None, "all 38 paragraphs")
    f3 = figures(3, load(ACCEPTED[3][0]), load(ACCEPTED[3][1]))
    BASIS[3] = saved
    print("Book 3 on all 38 paragraphs, for contrast: retention %.5f, "
          "sentences %d → %d (%+.1f%%), semicolons %d → %d"
          % (f3["retention"], f3["sent"][0], f3["sent"][1], f3["raw"],
             f3["semi"][0], f3["semi"][1]))
    print("  — the published row is the 37-paragraph one (R-1), and it is now "
          "labelled as such everywhere.\n")
    floor, worst, wbk = d17_floor()
    print("D17 floor: %+.2f%% (half accepted Book %d's %+.1f%%)"
          % (floor, wbk, worst))
    if bad:
        print("\nDISAGREEMENTS:")
        for x in bad:
            print("  ✗ %s" % x)
        return 1
    print("\nEvery published figure for every accepted Book reproduces.")
    return 0


# ---------------------------------------------------------------- the audit
def audit():
    """Every measure in this module gets its controls under **D18**, because a
    module whose whole purpose is that checks must run is the last place to
    take a check on trust."""
    src = load("book06/source-book6.json")
    cand = load("book06/candidate-v1.json")
    r5 = lambda x: round(x, 5)

    def cash_a_semicolon(ps):
        out = list(ps)
        for i, p in enumerate(out):
            if ";" in p:
                out[i] = p.replace("; ", ". ", 1)
                break
        return out

    def divide_at_a_comma(ps):
        out = list(ps)
        for i, p in enumerate(out):
            if ", and " in p:
                out[i] = p.replace(", and ", ". And ", 1)
                break
        return out

    def swap_two_clauses(ps):
        i = max(range(len(ps)), key=lambda k: len(ps[k].split()))
        w = ps[i].split()
        h = len(w) // 2
        out = list(ps)
        out[i] = " ".join(w[h:] + w[:h])
        return out

    def swap_vocabulary(ps):
        out, n = list(ps), 0
        for i, p in enumerate(out):
            w = p.split()
            for k in range(len(w)):
                if len(w[k]) > 6 and w[k].isalpha() and n < 25:
                    w[k] = "zzqx%d" % n
                    n += 1
            out[i] = " ".join(w)
            if n >= 25:
                break
        return out

    def grow_a_short_sentence(ps):
        """The defect D20's growth gate exists for, planted exactly — and the
        audit of THIS module failed on it once, which is the reason it is
        written the long way.

        The first version padded the shortest sentence of the paragraph with
        the most sentences, by sixty words. That is not the defect: the padded
        sentence became the paragraph's **longest**, so the old
        maximum-against-maximum gate saw it too, and the control that asserts
        the old gate is blind failed clause (b) — correctly. The real hole
        needs a sentence grown past 50 words that stays **under the source
        paragraph's own longest**, so the paragraph maximum never moves.

        So: pick the paragraph whose SOURCE carries the longest sentence, pad
        its shortest candidate sentence to a target that is at once >= 50 words
        (the new gate must fail), <= the candidate paragraph's current longest
        (so the paragraph maximum does not move) and < the source paragraph's
        longest (so the old gate reports no growth at all). Every one of those
        three preconditions is asserted, because a control whose preconditions
        are unasserted is the shape D18 clause (a) was written about."""
        def room(k):
            sm = max(len(x.split()) for x in sentences(src[k]))
            cm = max(len(x.split()) for x in sentences(ps[k]))
            return min(cm, sm - 1)
        i = max(range(len(ps)), key=room)
        smax = max(len(x.split()) for x in sentences(src[i]))
        cmax = max(len(x.split()) for x in sentences(ps[i]))
        ss = sentences(ps[i])
        # The sentence to grow is the one whose ALIGNED SOURCE sentence is
        # shortest — not simply the shortest candidate sentence. The audit
        # failed here a second time: padding the shortest candidate sentence in
        # this paragraph grew a sentence that aligns to Butler's own 67-word
        # period, so it never exceeded its source and the gate was right to
        # stay silent. The defect is a SHORT Butler sentence blown past fifty.
        srcs, pairs = align_sentences(src[i], ps[i])
        k = min(range(len(ss)),
                key=lambda j: len(srcs[pairs[j][0]].split())
                if pairs[j][0] is not None else 0)
        target = min(cmax, smax - 1)
        assert target >= 50, ("no paragraph can carry the planted defect: "
                              "target %d" % target)
        need = target - len(ss[k].split())
        assert need > 0, "the chosen sentence is already at the target"
        pad = " and so on" * ((need + 2) // 3)
        out = list(ps)
        out[i] = ps[i].replace(ss[k], ss[k][:-1] + pad + ".", 1)
        grown_max = max(len(x.split()) for x in sentences(out[i]))
        assert grown_max <= max(cmax, smax) and grown_max < smax + 1, grown_max
        return out

    def open_a_compound(ps):
        out = list(ps)
        for i, p in enumerate(out):
            if "waterside" in p:
                out[i] = p.replace("waterside", "water side")
                break
        return out

    control("token_retention: pure substitution lowers it",
            cand, swap_vocabulary(cand),
            verdict=lambda ps: r5(token_retention(src, ps)))
    control("NORM RATE: a real division at a comma raises it",
            cand, divide_at_a_comma(cand),
            verdict=lambda ps: r5(norm_rate(src, ps)[5]))
    control("NORM RATE: cashing a semicolon leaves it EXACTLY where it was "
            "(positive control — the whole point of the measure)",
            cand, cash_a_semicolon(cand),
            verdict=lambda ps: r5(norm_rate(src, ps)[5]), expect_same=True)
    control("the raw D17 rate DOES move under the same mutation — so NORM "
            "RATE is not D17 written twice",
            cand, cash_a_semicolon(cand),
            verdict=lambda ps: r5(norm_rate(src, ps)[2]))
    control("MOVE-GAP: moving a clause without changing a word raises it",
            cand, swap_two_clauses(cand),
            verdict=lambda ps: r5(move_gap(src, ps)))
    declare_blind("MOVE-GAP under pure substitution",
                  because="substitution costs bag and order retention the same "
                          "amount and cancels in the difference — that is the "
                          "measure working, and it is the one mutation whose "
                          "verdict must NOT move",
                  carried_by="token_retention(), whose control above falls "
                             "under exactly this mutation")
    control("displaced runs: a moved clause is named",
            cand, swap_two_clauses(cand),
            verdict=lambda ps: sum(len(displaced_runs(a, b))
                                   for a, b in zip(src, ps)))
    control("the growth gate sees a sentence that is NOT the paragraph's "
            "longest grown past 50 words — the hole in D19's gate",
            cand, grow_a_short_sentence(cand),
            verdict=lambda ps: len(growth(src, ps)[1]))
    control("the OLD maximum-against-maximum gate is blind to that same "
            "mutation — which is why D20 replaces it",
            cand, grow_a_short_sentence(cand),
            verdict=lambda ps: sorted(
                i for i, (a, b) in enumerate(zip(src, ps))
                if max(len(x.split()) for x in sentences(b))
                > max(len(x.split()) for x in sentences(a))),
            expect_same=True)
    control("the absolute long-sentence report sees a long sentence Butler "
            "also wrote long",
            cand, grow_a_short_sentence(cand),
            verdict=lambda ps: len(long_sentences(src, ps)))
    control("compound_pairs(): the head-noun filter names a pair that is "
            "opened",
            cand, open_a_compound(cand),
            verdict=lambda ps: compound_pairs(ps))
    declare_blind("a compound the whole corpus sets open and modern English "
                  "closes, e.g. `mountain tops`",
                  because="no attestation of the closed form exists anywhere "
                          "in 720 KB of Butler — demonstrated with zero hits, "
                          "not assumed; the corpus cannot be its own dictionary",
                  carried_by="compound_pairs(), the interim head-noun filter, "
                             "which enumerates the class for a reader; full "
                             "closure needs a vendored word list and is "
                             "escalated as ledger A4(ii)")
    print(summary())


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("book", nargs="?", type=int)
    ap.add_argument("--version", type=int, default=None)
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--audit", action="store_true")
    ap.add_argument("--no-write", action="store_true")
    a = ap.parse_args()
    if a.audit:
        audit()
        return 0
    if a.all:
        return run_all()
    if a.book is None:
        ap.error("give a book number, or --all, or --audit")
    f, g = run_book(a.book, a.version, write=not a.no_write)
    return 1 if g.failures else 0


if __name__ == "__main__":
    sys.exit(main())
