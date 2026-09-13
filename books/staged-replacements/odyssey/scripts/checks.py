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


_WORD = re.compile(r"[A-Za-z]+(?:['\u2019][A-Za-z]+)?")
# How strong a mark is, for picking Butler's pointing out of a span.
_MARK_RANK = {";": 3, ".": 2, ":": 2, "!": 2, "?": 2, ",": 1, "\u2014": 1, "": 0}


def _marked(t):
    """(normalized word, the three characters that follow it) for every word."""
    out = []
    for m in _WORD.finditer(t):
        w = m.group(0).lower().replace("\u2019", "'").split("'")[0]
        out.append((NAME_MAP.get(w, w), t[m.end():m.end() + 4]))
    return out


def _mark_of(tail):
    for ch in tail:
        if ch in ";,.:!?\u2014":
            return ch
        if ch in "\u201d\"\u2019')":
            continue
        break
    return ""


# ------------------------------------------------- D27: the dividing marks
# **Substantive finding S-1 of Book 8's round 1.** D20 clause (a) adds each
# text's own SEMICOLON count to its own sentence count, so that cashing a
# semicolon for a period is worth exactly zero. Book 8's mark census showed
# what the clause leaves free: of 52 new sentence boundaries, **44 were marks
# Butler had already written** — 40 semicolons, **1 colon and 3 em dashes** —
# and only 8 divided his prose. The colon and the sentence-internal em dash
# bind clauses exactly as the semicolon does, a period separates them at the
# same nil cost in recasting, and D20 priced both at a full division.
#
# So clause (a) is widened to all three: `;`, `:`, and an em dash with a word
# on each side **inside one sentence**. A dash that opens or closes a sentence
# is not a divider and is not counted.
#
# This is D27. It changes no published raw figure, and it changes the
# COMPARED figure for every Book, which is republished on the stated basis
# (R-1) rather than mixed with the old one.

DIVIDING = (";", ":", "\u2014")


def internal_dash_offsets(t):
    """Character offsets of the sentence-internal em dashes of one paragraph.

    `sentences()` splits on `.!?` only, so every em dash is inside some
    sentence; what makes one a DIVIDER is having a word on each side of it
    within that sentence. Butler's interrupted-speech dashes and the
    paragraph-final dash are not dividers and are not counted."""
    out, base = set(), 0
    for sent in sentences(t):
        i = t.find(sent, base)
        if i < 0:
            continue
        base = i + len(sent)
        for m in re.finditer("\u2014", sent):
            if re.search(r"\w", sent[:m.start()]) \
                    and re.search(r"\w", sent[m.end():]):
                out.add(i + m.start())
    return out


def dividing_marks(paragraphs):
    """D27's count: `;` + `:` + sentence-internal em dashes."""
    return sum(p.count(";") + p.count(":") + len(internal_dash_offsets(p))
               for p in paragraphs)


def _provenance(src, cand, marks):
    """For every mark of `marks` in the candidate, what Butler pointed at the
    same place. Returns (paragraph, the candidate's mark, Butler's mark).

    **The alignment is not a four-word anchor** — see `semicolon_provenance`
    below, which is this function restricted to `;` and which reproduces the
    package's published kept/added figures exactly."""
    rows = []
    wordre = _WORD
    for i, (s, c) in enumerate(zip(src, cand), 1):
        S, C = _marked(s), _marked(c)
        sw = [w for w, _ in S]
        cw = [w for w, _ in C]
        sm = difflib.SequenceMatcher(a=cw, b=sw, autojunk=False)
        c2s = {}
        for a, b, n in sm.get_matching_blocks():
            for k in range(n):
                c2s[a + k] = b + k
        idash = internal_dash_offsets(c) if "\u2014" in marks else set()
        ends = [m.end() for m in wordre.finditer(c)]
        for j, (w, tail) in enumerate(C):
            mk = _mark_of(tail)
            if mk not in marks:
                continue
            if mk == "\u2014":
                pos = c.find("\u2014", ends[j], ends[j] + 5)
                if pos not in idash:
                    continue
            before = [c2s[k] for k in range(j, -1, -1) if k in c2s]
            after = [c2s[k] for k in range(j + 1, len(C)) if k in c2s]
            A = before[0] if before else 0
            B = after[0] if after else len(S) - 1
            span = [_mark_of(S[k][1])
                    for k in range(max(A, 0), min(B, len(S) - 1) + 1)]
            best = max(span, key=lambda m: _MARK_RANK.get(m, 0)) if span else ""
            rows.append((i, mk, best, " ".join(cw[max(0, j - 3):j + 1])))
    return rows


def kept_added_div(src, cand):
    """(dividing marks of Butler's the candidate still carries, dividing marks
    the candidate added where Butler wrote something weaker). D27's half of
    D21."""
    rows = _provenance(src, cand, DIVIDING)
    kept = sum(1 for r in rows if r[2] in DIVIDING)
    return kept, len(rows) - kept


def norm_rate_ext(src, cand):
    """**D27 — NORM RATE with every dividing mark normalized**, not the
    semicolon alone. Both sides count their own `;` `:` and sentence-internal
    `\u2014`. Returns (src_norm, cand_norm, pct)."""
    sn, _ = sentence_profile(src)
    cn, _ = sentence_profile(cand)
    a = sn + dividing_marks(src)
    b = cn + dividing_marks(cand)
    return a, b, 100.0 * (b - a) / a


def norm_rate_butler_ext(src, cand):
    """**D27 + D21 — the figure that is COMPARED from Book 8 forward.**

    Every dividing mark normalized, and on the candidate's side only the marks
    of Butler's it KEPT, so that raising a comma to a semicolon — or to a
    colon, or to a dash — is worth nothing. Returns (src_norm, cand_norm,
    pct)."""
    sn, _ = sentence_profile(src)
    cn, _ = sentence_profile(cand)
    kept, _added = kept_added_div(src, cand)
    a = sn + dividing_marks(src)
    b = cn + kept
    return a, b, 100.0 * (b - a) / a


def semicolon_provenance(src, cand):
    """**Substantive finding S-1 of Book 7's round 1, made mechanical.**

    D20 clause (a) adds each text's own semicolon count to its own sentence
    count so that converting a semicolon into a period is worth exactly zero.
    The corollary was never stated and nobody had tested it: **converting a
    comma into a semicolon is worth a full division.** It adds nothing to the
    sentence count, adds one to the candidate's semicolon count, and therefore
    scores exactly what a real period scores — while leaving the clause chain
    inside one sentence, which is the thing D17, D19 and D20 exist to detect
    the absence of. It is the mirror of the operation D20 was written to price
    out, and it is *cheaper*: a period costs a recast, a semicolon costs a
    keystroke.

    So D19's count is split into the two things it was conflating. For every
    semicolon in the candidate, find what Butler pointed at the same place and
    return `(paragraph, anchor, butler's mark)`.

    **The alignment is not a four-word anchor.** The review's table was built
    by anchoring on the four words before each mark, and that method silently
    misses the case where the candidate changed those very words — B07-P007,
    where Butler's `without male issue;` became `without a son;`, has no
    four-word anchor in the source at all. Here the candidate's word stream is
    aligned to the source's with `SequenceMatcher`, the semicolon is located
    between the last source token aligned before it and the first aligned
    after, and the strongest mark Butler wrote inside that span is his pointing
    there. That reproduces the review's fourteen rows exactly and gets P007
    right: **8 kept, 6 added.**"""
    rows = []
    for i, (s, c) in enumerate(zip(src, cand), 1):
        S, C = _marked(s), _marked(c)
        sw = [w for w, _ in S]
        cw = [w for w, _ in C]
        sm = difflib.SequenceMatcher(a=cw, b=sw, autojunk=False)
        c2s = {}
        for a, b, n in sm.get_matching_blocks():
            for k in range(n):
                c2s[a + k] = b + k
        for j, (w, tail) in enumerate(C):
            if _mark_of(tail) != ";":
                continue
            before = [c2s[k] for k in range(j, -1, -1) if k in c2s]
            after = [c2s[k] for k in range(j + 1, len(C)) if k in c2s]
            A = before[0] if before else 0
            B = after[0] if after else len(S) - 1
            span = [_mark_of(S[k][1])
                    for k in range(max(A, 0), min(B, len(S) - 1) + 1)]
            best = max(span, key=lambda m: _MARK_RANK.get(m, 0)) if span else ""
            rows.append((i, " ".join(cw[max(0, j - 3):j + 1]), best))
    return rows


def kept_added(src, cand):
    """(semicolons of Butler's the candidate still carries, semicolons the
    candidate added where Butler wrote something weaker). D19's numerator was
    always meant to be the first of these."""
    rows = semicolon_provenance(src, cand)
    kept = sum(1 for r in rows if r[2] == ";")
    return kept, len(rows) - kept


def norm_rate_butler(src, cand):
    """**NORM RATE scored on Butler's own pointing** — the candidate's added
    semicolons counted as the commas Butler actually wrote there.

    This is the figure that is COMPARED from Book 7 forward. The published
    NORM RATE credits a comma raised to a semicolon with a full division; this
    one does not, which is what D20 clause (a) meant on the other side of the
    ledger. Returns (src_norm, cand_norm, pct)."""
    sn, _ = sentence_profile(src)
    cn, _ = sentence_profile(cand)
    kept, _added = kept_added(src, cand)
    a = sn + semicolons(src)
    b = cn + kept
    return a, b, 100.0 * (b - a) / a


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
    8: (None, "all 50 paragraphs"),
    9: (None, "all 44 paragraphs"),
}

# The accepted file of each Book, and its successor where one exists. The
# *accepted* file is what the published figures are computed on; the successor
# carries the compound corrections and is what the edition would ship.
ACCEPTED = {
    1: ("book01/source-book1.json", "book01/candidate-v2.json",
        "book01/candidate-v4.json"),
    2: ("book02/source-book2.json", "book02/candidate-v2.json",
        "book02/candidate-v6.json"),
    3: ("book03/source-book3.json", "book03/candidate-v2.json",
        "book03/candidate-v3.json"),
    4: ("book04/source-book4.json", "book04/candidate-v2.json",
        "book04/candidate-v5.json"),
    5: ("book05/source-book5.json", "book05/candidate-v2.json",
        "book05/candidate-v3.json"),
    6: ("book06/source-book6.json", "book06/candidate-v2.json",
        "book06/candidate-v3.json"),
    7: ("book07/source-book7.json", "book07/candidate-v2.json", None),
    8: ("book08/source-book8.json", "book08/candidate-v2.json", None),
}

# Every figure the package publishes for an accepted Book, on that Book's own
# basis. `--all` recomputes each from the accepted file and fails on any
# disagreement. Keys: retention (5 dp), sentences src, sentences cand, sixty
# src, sixty cand, semicolons src, semicolons cand, norm rate (1 dp),
# MOVE-GAP (5 dp). **D27** adds `div` (dividing marks, source -> candidate),
# `kept_added_div`, `norm_ext` (D20 widened to every dividing mark) and
# `norm_butler_ext` (that, on Butler's own pointing — the figure COMPARED from
# Book 8 forward).
PUBLISHED = {
    1: dict(retention=0.72703, sent=(132, 159), sixty=(10, 0), semi=(47, 13),
            norm=-3.9, movegap=0.05088, norm_butler=-4.5, kept_added=(12, 1),
            div=(55, 39), kept_added_div=(20, 19), norm_ext=+5.9,
            norm_butler_ext=-4.3),
    2: dict(retention=0.90232, sent=(137, 159), sixty=(7, 4), semi=(36, 21),
            norm=+4.0, movegap=0.01632, norm_butler=+1.2, kept_added=(16, 5),
            div=(58, 61), kept_added_div=(36, 25), norm_ext=+12.8,
            norm_butler_ext=+0.0),
    3: dict(retention=0.89641, sent=(164, 173), sixty=(9, 6), semi=(39, 32),
            norm=+1.0, movegap=0.02156, norm_butler=-2.0, kept_added=(26, 6),
            div=(53, 47), kept_added_div=(39, 8), norm_ext=+1.4,
            norm_butler_ext=-2.3),
    4: dict(retention=0.95872, sent=(281, 306), sixty=(17, 3), semi=(68, 50),
            norm=+2.0, movegap=0.00431, norm_butler=+2.0, kept_added=(50, 0),
            div=(103, 81), kept_added_div=(80, 0), norm_ext=+0.8,
            norm_butler_ext=+0.5),
    5: dict(retention=0.93808, sent=(153, 189), sixty=(9, 1), semi=(34, 13),
            norm=+8.0, movegap=0.00891, norm_butler=+7.5, kept_added=(12, 1),
            div=(64, 35), kept_added_div=(34, 1), norm_ext=+3.2,
            norm_butler_ext=+2.8),
    6: dict(retention=0.93408, sent=(116, 148), sixty=(7, 1), semi=(27, 5),
            norm=+7.0, movegap=0.01156, norm_butler=+5.6, kept_added=(3, 2),
            div=(38, 16), kept_added_div=(14, 2), norm_ext=+6.5,
            norm_butler_ext=+5.2),
    7: dict(retention=0.93438, sent=(103, 138), sixty=(7, 0), semi=(30, 7),
            norm=+9.0, movegap=0.01217, norm_butler=+7.5, kept_added=(5, 2),
            div=(42, 18), kept_added_div=(14, 4), norm_ext=+7.6,
            norm_butler_ext=+4.8),
    8: dict(retention=0.93862, sent=(192, 235), sixty=(11, 1), semi=(42, 7),
            norm=+3.4, movegap=0.00692, norm_butler=+3.4, kept_added=(7, 0),
            div=(62, 31), kept_added_div=(24, 7), norm_ext=+4.7,
            norm_butler_ext=+2.0),
}


# ------------------------------------------------- THE DECLARATIONS (S-3, R-1)
# **What an accepted file carries that a gate would otherwise fire on, keyed by
# the FILE and enumerated exactly.**
#
# Three things converged on this table.
#
# * **Substantive finding S-3 of Book 7's round 1.** `MIN_PARA_RATIO = {1: 0.86}`
#   was a lowered threshold wearing an enumeration's name: Book 1 carried five
#   paragraphs under 0.90, and a sixth, a seventh and a tenth, anywhere in the
#   Book, at any depth down to 0.86, would have passed in silence — in the one
#   place the package's own disposition said the door was shut.
# * **Records finding R-5.** `LEGACY_GROWTH`'s comparison was membership rather
#   than multiplicity, so a second identical growth in the same paragraph was
#   excluded by the declaration of the first.
# * **Records finding R-1, found here by making `--all` evaluate the gates
#   (R-4).** `LEGACY_GROWTH[4]` declared `(18, 53, 54)`. **That is the figure of
#   Book 4's SUCCESSOR**, `candidate-v3.json`; the accepted `candidate-v2.json`,
#   which is the file `PUBLISHED` is computed over and the file `--all` scores,
#   carries `(18, 53, 55)`. A book-keyed table cannot say which file it
#   enumerates, so it silently mixed two, and nothing could notice while the
#   gates ran for no accepted Book. Book 1's thin ratios differ between v1 and
#   v2 in the same way.
#
# So the key is the file, the equality is exact in both directions, and every
# comparison is a multiset. A file absent from this table declares nothing and
# therefore gets every gate **at full strength** — which is what a new
# candidate must get.
#
# Repairing any declared instance costs a successor to an accepted Book and is
# a coordinator matter, not a drafter's (ledger R-6).

MIN_PARA_FLOOR = 0.90        # for every Book. No Book has a lowered threshold.
MIN_PARA_TOL = 0.0002


def _decl(byte_identical=(), thin=(), growth=(), compound=(), reason=""):
    return dict(byte_identical=list(byte_identical), thin=list(thin),
                growth=list(growth), compound=list(compound), reason=reason)


DECLARED = {
    "book01/candidate-v2.json": _decl(
        thin=[(1, 0.8850), (9, 0.8889), (11, 0.8659), (16, 0.8878),
              (17, 0.8621)],
        growth=[(5, 49, 50), (30, 48, 52)],
        reason="Book 1 is the most heavily rewritten Book in the package "
               "(retention 0.72703) and its acceptance record states the "
               "shallowest of its five thin paragraphs by name: 'minimum "
               "paragraph ratio 0.8621 at B01-P017, which the round-1 reviewer' "
               "examined. Both growths are 1-4 words on a sentence Butler "
               "already wrote at or near 50."),
    "book01/candidate-v3.json": _decl(
        thin=[(1, 0.8850), (9, 0.8889), (11, 0.8659), (16, 0.8878),
              (17, 0.8621)],
        growth=[(5, 49, 50), (30, 48, 52)],
        reason="the compound successor; identical to v2 on all four measures."),
    "book01/candidate-v4.json": _decl(
        thin=[(1, 0.8850), (9, 0.8889), (11, 0.8659), (16, 0.8878),
              (17, 0.8621)],
        growth=[(5, 49, 50), (30, 48, 52)],
        reason="the collision-backlog successor (five repairs). Its five "
               "word-for-word substitutions move no sentence past 50 and no "
               "paragraph across the 0.90 floor, so it declares exactly what "
               "v2 and v3 declare."),
    "book02/candidate-v2.json": _decl(
        growth=[(19, 49, 50), (28, 57, 58)],
        compound=["mixingbowls", "seashore", "storeroom", "waterside"],
        reason="the three compounds are what the SUCCESSORS v3-v5 exist to "
               "correct, so the accepted file necessarily disagrees with the "
               "shipping corpus; that is the successor working, not drift "
               "arriving. Both growths are on sentences Butler wrote at 49 "
               "and 57."),
    # **The three rows Book 8's round 1 found wrong, corrected against a run.**
    # All three declared `compound=[]` and all three carried drift; nothing in
    # the package reached them, so nothing could say so. Read down the three
    # and the successor chain is legible: v3 repairs `sea shore`, v4 repairs
    # `water side`, v5 repairs `store-room`, and each intermediate file is out
    # of step with the corpus on exactly the compounds its successors had not
    # yet reached. `--declarations` now evaluates each of them.
    "book02/candidate-v3.json": _decl(
        growth=[(19, 49, 50), (28, 57, 58)],
        compound=["seashore", "storeroom", "waterside"],
        reason="the FIRST of four successors to accepted Book 2, and an "
               "intermediate file: it carries `sea shore` open, `store-room` "
               "hyphenated and `water side` open against the corpus's closed "
               "forms. v4, v5 and v6 close them one at a time. The two growths "
               "are inherited from the accepted v2, on sentences Butler wrote "
               "at 49 and 57."),
    "book02/candidate-v4.json": _decl(
        growth=[(19, 49, 50), (28, 57, 58)],
        compound=["storeroom", "waterside"],
        reason="`seashore` is closed here; `store-room` and `water side` are "
               "not yet. Same inherited growths."),
    "book02/candidate-v5.json": _decl(
        growth=[(19, 49, 50), (28, 57, 58)],
        compound=["storeroom"],
        reason="only `store-room` remains, and v6 (ledger A5(c)) closes it. "
               "Same inherited growths."),
    "book02/candidate-v6.json": _decl(
        growth=[(19, 49, 50), (28, 57, 58)],
        reason="ledger A6 (`councillors` -> `councilors`, two words, D9) and "
               "A5(c) (`store-room` -> `storeroom`, two words, D15) in ONE "
               "successor. `store-room` was found by "
               "`scripts/compound_register.py` the first time it ran and had "
               "never been named by a reader, a review round or a check."),
    "book03/candidate-v2.json": _decl(
        growth=[(11, 64, 66), (13, 69, 72), (24, 56, 58), (24, 73, 74)],
        compound=["seashore"],
        reason="`seashore` is corrected in the successor v3. Every growth is "
               "on a sentence Butler already wrote between 56 and 73 words."),
    "book03/candidate-v3.json": _decl(
        growth=[(11, 64, 66), (13, 69, 72), (24, 56, 58), (24, 73, 74)],
        reason="the `seashore` successor. `compound` is empty BECAUSE the "
               "successor worked; the four growths are inherited unchanged "
               "from the accepted v2, each on a sentence Butler already wrote "
               "between 56 and 73 words."),
    "book04/candidate-v2.json": _decl(
        byte_identical=[39, 54, 61, 63, 70, 79, 80],
        growth=[(18, 53, 55), (28, 54, 56), (76, 61, 62)],
        compound=["lowlying", "seashore", "welldisposed"],
        reason="the seven byte-identical paragraphs were examined one by one "
               "and left because they are already plain modern English in "
               "Butler (`book04/continuity.md` \u00a76). P018's growth is "
               "**53 \u2192 55 in this file**; the 53 \u2192 54 the old "
               "book-keyed table declared is the successor's figure."),
    "book04/candidate-v3.json": _decl(
        byte_identical=[39, 54, 61, 63, 70, 79, 80],
        growth=[(18, 53, 54), (28, 54, 56), (76, 61, 62)],
        reason="the compound successor. The seven byte-identical paragraphs "
               "are inherited from the accepted v2 and examined there "
               "(`book04/continuity.md` \u00a76). **P018 is 53 \u2192 54 in "
               "this file and 53 \u2192 55 in v2** — the divergence records "
               "finding R-1 was found by: the old book-keyed table declared "
               "the successor's figure for the accepted file."),
    "book04/candidate-v4.json": _decl(
        byte_identical=[39, 54, 61, 63, 70, 79, 80],
        growth=[(18, 53, 54), (28, 54, 56), (76, 61, 62)],
        reason="the fifth successor (ledger A4(i)); the arrow-B repair at "
               "B04-P010 moves no sentence length."),
    "book04/candidate-v5.json": _decl(
        byte_identical=[39, 54, 61, 63, 70, 79, 80],
        growth=[(18, 53, 54), (28, 54, 56), (76, 61, 62)],
        reason="the collision-backlog successor (two repairs, B04-P017 "
               "`forenoon` and B04-P040 `holy hecatombs`). Same declaration "
               "as v4; neither repair changes a length."),
    "book05/candidate-v2.json": _decl(
        compound=["mountaintops"],
        reason="ledger A5(a): `mountain tops` is corrected in the successor "
               "v3, so the accepted file necessarily disagrees with the "
               "shipping corpus. That is the successor working, not drift "
               "arriving — the same shape Books 2, 3 and 4 already declare."),
    "book05/candidate-v3.json": _decl(
        reason="ledger A5(a): `mountain tops` -> `mountaintops`, one word, D15."),
    "book06/candidate-v2.json": _decl(
        compound=["mountaintops"],
        reason="records finding R-6: the SECOND instance, which "
               "`book06/ACCEPTANCE.md` O-6 did not count. Corrected in the "
               "successor v3."),
    "book06/candidate-v3.json": _decl(
        reason="ledger A5(a) and records finding R-6: the SECOND successor the "
               "record said was one. Same one-word change as Book 5's."),
    "book09/candidate-v1.json": _decl(
        reason="the frozen draft. **Declares nothing**, which is the point: no "
               "byte-identical paragraph, no paragraph under 0.90 of its "
               "source's length, no sentence grown past 50 words, no compound "
               "drift against the other eight Books — and, under D27, no "
               "dividing mark that is not Butler's own. A file absent from "
               "this table gets every gate at full strength; a file present "
               "with an empty declaration says so out loud."),
    "book08/candidate-v2.json": _decl(
        byte_identical=[33],
        growth=[(47, 80, 81)],
        reason="**the accepted file.** B08-P033 is declared, not edited, and "
               "the declaration is inherited unchanged from v1 below: two "
               "short sentences of Butler's that are already plain modern "
               "English. No paragraph falls under 0.90, no sentence grows past "
               "50, and no compound drifts. Round 1's corrections restore "
               "marks and change nine words. **The one growth is Butler's "
               "own sentence handed back.** Round 1's worst finding (S-2/M-1) "
               "is that the em dash closing the weeping-woman simile was "
               "cashed for a period, severing a 48-word protasis from its "
               "apodosis; restoring the dash rejoins Butler's own 80-word "
               "sentence, and the candidate's is 81. The gate is reporting "
               "that the draft now carries the sentence Butler wrote, which "
               "is the repair, not a defect — and the alternative is to leave "
               "the correlative severed in order to keep a number under a "
               "threshold, which is the shape M-9 of Book 7's round 1 named."),
    "book07/candidate-v2.json": _decl(
        reason="the accepted file. Declares nothing: no byte-identical "
               "paragraph, no paragraph under 0.90, no sentence grown past 50, "
               "no compound drift."),
}


# ------------------------------------- THE OTHER HALF OF THE TABLE (Book 8 S-3)
# **A declaration keyed to a file nothing evaluates is a declaration that
# cannot be wrong.**
#
# Book 8's round 1 found the shape recurring: `book02/candidate-v3.json`,
# `-v4.json` and `-v5.json` each declare `compound=[]` while each carries
# `seashore`, `storeroom` and `waterside` drift. Sixteen of the nineteen rows
# were sound and the three wrong ones were **exactly the three that nothing
# runs** — `ACCEPTED` names Book 2's accepted v2 and its successor v6, and
# `run_book()` without `--version` takes the highest-numbered file, so v3, v4
# and v5 were reachable by no invocation anybody makes. They were not wrong by
# accident; they were wrong because being wrong had no consequence.
#
# Absence was the wrong repair — correcting three rows leaves the twentieth
# free to go the same way. So the table is closed against the directory
# instead:
#
# * **`--declarations` puts the full gates to EVERY key of `DECLARED`**, over
#   that exact file. A row that is not evaluated by any other invocation is
#   evaluated by this one, by construction. It is folded into `--all`.
# * **Every `bookNN/candidate-v*.json` on disk must be in `DECLARED` or in
#   `SUPERSEDED`, and in exactly one**, asserted as set equality in both
#   directions. A new candidate file cannot appear undeclared, a declaration
#   cannot name a file that is not there, and a file cannot be quietly moved
#   out of reach of the gates by writing a higher-numbered successor.
# * **A row that declares anything must say why.** The three wrong rows carried
#   no `reason` between them. A declaration is a licence to fail a gate; a
#   licence with no reason on it is the same defect one step earlier.
#
# `SUPERSEDED` is the round-1 drafts. They are kept in the package because the
# review rounds and the change logs refer to them by name, and they are NOT
# evaluated: every one of them is a file a reviewer rejected, and putting the
# gates to a rejected draft would only assert that it is still rejected.

SUPERSEDED = {
    "book01/candidate-v1.json": "round-1 draft, superseded by v2 (accepted).",
    "book02/candidate-v1.json": "round-1 draft, superseded by v2 (accepted).",
    "book03/candidate-v1.json": "round-1 draft, superseded by v2 (accepted).",
    "book04/candidate-v1.json": "round-1 draft, superseded by v2 (accepted).",
    "book05/candidate-v1.json": "round-1 draft, superseded by v2 (accepted).",
    "book06/candidate-v1.json": "round-1 draft, superseded by v2 (accepted).",
    "book08/candidate-v1.json":
        "the frozen round-1 draft, superseded by v2 (accepted 2026-09-13). "
        "Its published figures are in `book08/ACCEPTANCE.md` and in the "
        "ledger's comparability table, on both the old and the D27 basis.",
    "book07/candidate-v1.json":
        "round-1 draft, superseded by v2 (accepted). **It used to sit in "
        "`DECLARED` with an empty declaration** — a licence issued to a "
        "rejected file — and `compound_drift.py` named it as Book 7's "
        "accepted text in a second, stale copy of the accepted-file list. "
        "Both are repaired: the list is derived from `ACCEPTED` now, and this "
        "file is declared for what it is.",
}


def candidate_files_on_disk():
    return sorted(str(p.relative_to(ROOT))
                  for p in ROOT.glob("book[0-9][0-9]/candidate-v*.json"))


def declaration_coverage():
    """Set equality, both directions, between the declarations and the
    directory. Returns a list of failure messages."""
    bad = []
    disk = set(candidate_files_on_disk())
    decl, sup = set(DECLARED), set(SUPERSEDED)
    for rel in sorted(disk - decl - sup):
        bad.append("coverage: %s is on disk and is in neither DECLARED nor "
                   "SUPERSEDED — every candidate file is one or the other"
                   % rel)
    for rel in sorted((decl | sup) - disk):
        bad.append("coverage: %s is declared but is not on disk" % rel)
    for rel in sorted(decl & sup):
        bad.append("coverage: %s is in DECLARED and in SUPERSEDED; it must be "
                   "in exactly one" % rel)
    # **The staleness class, closed.** `ACCEPTED`'s successor column is the
    # file the edition would ship and the file `compound_drift` reads. Writing
    # a successor and forgetting to point the column at it is how
    # `compound_drift.py` came to read Book 7's REJECTED v1: the fault is not
    # that a list was copied, it is that nothing said which file is latest.
    for bk, (_src, acc, succ) in sorted(ACCEPTED.items()):
        vs = [int(r.split("-v")[1].split(".")[0]) for r in decl
              if r.startswith("book%02d/" % bk)]
        if not vs:
            continue
        top = "book%02d/candidate-v%d.json" % (bk, max(vs))
        if (succ or acc) != top:
            bad.append("coverage: ACCEPTED[%d] ships %s, but the highest "
                       "declared candidate for that Book is %s — the "
                       "successor column is stale"
                       % (bk, succ or acc, top))
    for rel in sorted(decl):
        d = DECLARED[rel]
        if any(d[k] for k in ("byte_identical", "thin", "growth", "compound")) \
                and not d["reason"].strip():
            bad.append("coverage: %s declares a gate exception and gives no "
                       "reason — a licence with no reason on it is the shape "
                       "this table exists to prevent" % rel)
    return bad


def run_declarations(quiet=False):
    """`--declarations`: put the full gates to **every key of `DECLARED`**, so
    that no row of the table is a claim nothing tests."""
    bad = declaration_coverage()
    if not quiet:
        print("checks.py --declarations — every declared file gets the gates, "
              "and the table is closed against the directory\n")
        for m in bad:
            print("  \u2717 %s" % m)
    for rel in sorted(DECLARED):
        book = int(rel[4:6])
        if not (ROOT / rel).exists():
            continue
        try:
            _f, g = run_book(book, write=False, quiet=True, candidate=rel)
        except Exception as e:                                # noqa: BLE001
            bad.append("declarations: %s — the gates could not run: %s"
                       % (rel, e))
            if not quiet:
                print("  \u2717 %-32s gates could not run" % rel)
            continue
        msgs = ["declarations: %s — %s" % (rel, m) for m in g.failures]
        bad += msgs
        if not quiet:
            if msgs:
                print("  \u2717 %-32s %d gate failure(s)" % (rel, len(msgs)))
                for m in g.failures:
                    print("        | %s" % m)
            else:
                print("  \u2713 %-32s every gate passes against its "
                      "declaration" % rel)
    if not quiet:
        print()
        if bad:
            print("%d declaration failure(s)." % len(bad))
        else:
            print("%d declared files, %d superseded, %d on disk: every "
                  "declaration is evaluated and the table is exactly the "
                  "directory." % (len(DECLARED), len(SUPERSEDED),
                                  len(candidate_files_on_disk())))
    return bad


def declared(cand_rel):
    return DECLARED.get(str(cand_rel), _decl())


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
    nb = norm_rate_butler(s, c)
    ne = norm_rate_ext(s, c)
    nbe = norm_rate_butler_ext(s, c)
    return dict(basis=BASIS[book][1], n=len(s),
                retention=token_retention(s, c),
                order=order_retention(s, c), bag=bag_retention(s, c),
                movegap=move_gap(s, c),
                sent=(sn, cn), raw=raw, sixty=(s60, c60), broken=broken,
                semi=(semicolons(s), semicolons(c)),
                kept_added=kept_added(s, c),
                norm=nr[5], normpair=(nr[3], nr[4]),
                norm_butler=nb[2], norm_butler_pair=(nb[0], nb[1]),
                # D27 — every dividing mark, not the semicolon alone.
                div=(dividing_marks(s), dividing_marks(c)),
                kept_added_div=kept_added_div(s, c),
                norm_ext=ne[2], norm_ext_pair=(ne[0], ne[1]),
                norm_butler_ext=nbe[2],
                norm_butler_ext_pair=(nbe[0], nbe[1]))


# ------------------------------------------------------------------- the gates
class Gate:
    """The gates, and the token that says they ran.

    `evaluated` is False until `run_book()` has put every gate to the
    candidate. It is the difference between *"nothing failed"* and *"nothing
    was asked"*, and it is what makes the manifest unwriteable by anything
    that did not actually evaluate: `manifest_checks_block()` refuses a Gate
    whose `evaluated` is False, so an empty failure list is not by itself a
    licence to write. **Substantive finding S-2 of Book 7's round 1.**"""

    def __init__(self):
        self.failures = []
        # Manifest-consistency failures are kept APART from the content gates,
        # and the reason is a real one rather than tidiness: a stale manifest
        # must not be able to block its own repair. `manifest_checks_block()`
        # refuses on `failures` — what the candidate itself did — while
        # `--write-manifest` is precisely the operation that fixes
        # `manifest_failures`. Both are printed, and both make `checks.py N`
        # exit non-zero, so neither is quiet.
        self.manifest_failures = []
        self.evaluated = False

    def check(self, ok, msg):
        if not ok:
            self.failures.append(msg)
        return ok

    @property
    def passed(self):
        return self.evaluated and not self.failures


# ------------------------------------------------------- the manifest (S-2)
# **Substantive finding S-2 of Book 7's round 1: the manifest was write-only,
# and it was already wrong.** `build_book_package.py` wrote `manifest.json`
# only when the gates passed and recorded the sha256 of the `checks-vN.md`
# that run produced, and the package described that as structural enforcement:
# *"a package directory whose checks did not run has no manifest."*
#
# Two things were false about it as implemented.
#
# 1. **Nothing ever read a manifest**, so the record decayed into a claim about
#    the past. It had already decayed on the first Book it was ever built for:
#    `book07/manifest.json` recorded `checks.sha256 = 88952e2b…` while the
#    frozen `book07/checks-v1.md` hashed to `6ecfeeb4…`, at the working tree,
#    at HEAD and at trunk, because a later commit changed how the file renders,
#    regenerated it, and did not rebuild the manifest.
# 2. **A manifest survived a candidate that fails the gates.** `checks.py` did
#    not touch the manifest; only `build_book_package.py` removed it, and only
#    when re-run — which it refuses for a frozen Book without `--force`. So a
#    directory could carry `all_gates_passed: true` beside a candidate failing
#    two gates, which is exactly the state the mechanism existed to forbid.
#
# The repair has two halves and they are the same size:
#
# * **Unwriteable unless the gates evaluated and passed.** `manifest_checks_block()`
#   is the only thing in the package that composes a `checks` block, and it
#   raises unless it is handed a `Gate` whose `evaluated` token is set AND
#   whose failure list is empty. An empty failure list on its own is not a
#   licence: a Gate that was never asked anything has one too.
# * **Verifiable after the fact.** `verify_manifest()` runs on EVERY
#   `checks.py N`, and `--manifests` runs it for every Book at once. It fails
#   on a stale checks hash, on a candidate whose bytes have moved under the
#   manifest, on `all_gates_passed: true` beside a non-empty gate list, and on
#   a Book that should carry a `checks` block and does not.

# Books whose manifest predates the rule and carries no `checks` key. ENUMERATED
# for the same reason `BYTE_IDENTICAL` is: so that a NEW Book cannot quietly
# join them. A Book not in this list must carry a `checks` block.
MANIFEST_PREDATES_CHECKS = frozenset({1, 2, 3, 4, 5})


def manifest_checks_block(figs, gate):
    """The only writer of a manifest `checks` block in the package.

    Refuses unless the gates were actually **evaluated** and actually
    **passed**. This is the half of S-2 that makes the claim true as
    implemented rather than as described."""
    if not gate.evaluated:
        raise RuntimeError(
            "manifest_checks_block: the gates were never evaluated for this "
            "candidate. A manifest may not be written from a Gate that was "
            "not asked anything — an empty failure list is not a pass.")
    if gate.failures:
        raise RuntimeError(
            "manifest_checks_block: %d gate(s) FAILED; no manifest may be "
            "written.\n  " % len(gate.failures) + "\n  ".join(gate.failures))
    return {
        "written_by": "scripts/checks.py",
        "file": figs["checks_md"],
        "sha256": figs["checks_md_sha256"],
        "candidate_file": figs["candidate_file"],
        "candidate_sha256": figs["candidate_sha256"],
        "basis": figs["basis"],
        "retention": round(figs["retention"], 5),
        "sentences": list(figs["sent"]),
        "splitting_rate_raw_pct": round(figs["raw"], 1),
        "norm_rate_pct": round(figs["norm"], 1),
        "norm_rate_butler_pct": round(figs["norm_butler"], 1),
        "sixty_word": list(figs["sixty"]),
        "semicolons": list(figs["semi"]),
        "semicolons_kept_added": list(figs["kept_added"]),
        "dividing_marks": list(figs["div"]),
        "dividing_marks_kept_added": list(figs["kept_added_div"]),
        "norm_rate_ext_pct": round(figs["norm_ext"], 1),
        "norm_rate_butler_ext_pct": round(figs["norm_butler_ext"], 1),
        "move_gap": round(figs["movegap"], 5),
        "all_gates_passed": True,
    }


def verify_manifest(book, figs=None, gate=None):
    """The read side. Returns a list of failure messages, empty when sound.

    `figs` is the figures of the run that just happened, when there was one;
    without it the manifest is checked against the files on disk alone, which
    is what `--manifests` does."""
    bad = []
    mp = ROOT / ("book%02d/manifest.json" % book)
    if not mp.exists():
        return ["manifest: book%02d has no manifest.json — a package whose "
                "checks did not run has no manifest, so this directory is not "
                "frozen" % book]
    try:
        m = json.loads(mp.read_text(encoding="utf-8"))
    except Exception as e:                                   # noqa: BLE001
        return ["manifest: book%02d/manifest.json does not parse: %s" % (book, e)]

    ck = m.get("checks")
    if ck is None:
        if book not in MANIFEST_PREDATES_CHECKS:
            bad.append("manifest: book%02d carries no `checks` block and is "
                       "not declared in MANIFEST_PREDATES_CHECKS" % book)
        return bad
    if book in MANIFEST_PREDATES_CHECKS:
        bad.append("manifest: book%02d is declared as predating the checks "
                   "rule but now carries a `checks` block — remove it from "
                   "MANIFEST_PREDATES_CHECKS" % book)

    # (a) the checks file it names must exist and hash to what it recorded.
    cf = ROOT / ck.get("file", "")
    if not ck.get("file") or not cf.exists():
        bad.append("manifest: book%02d names a checks file that does not "
                   "exist: %r" % (book, ck.get("file")))
    else:
        actual = hashlib.sha256(cf.read_bytes()).hexdigest()
        if actual != ck.get("sha256"):
            bad.append("manifest: book%02d records checks.sha256 %s but %s "
                       "hashes to %s — STALE"
                       % (book, str(ck.get("sha256"))[:8], ck["file"],
                          actual[:8]))

    # (b) the candidate it was computed over must not have moved underneath it.
    if ck.get("candidate_file"):
        cp = ROOT / ck["candidate_file"]
        if not cp.exists():
            bad.append("manifest: book%02d names a candidate that does not "
                       "exist: %r" % (book, ck["candidate_file"]))
        else:
            actual = hashlib.sha256(cp.read_bytes()).hexdigest()
            if actual != ck.get("candidate_sha256"):
                bad.append("manifest: book%02d records candidate_sha256 %s but "
                           "%s hashes to %s — the candidate moved under the "
                           "manifest"
                           % (book, str(ck.get("candidate_sha256"))[:8],
                              ck["candidate_file"], actual[:8]))
    else:
        bad.append("manifest: book%02d's checks block names no candidate, so "
                   "it asserts nothing about what was scored" % book)

    # (b2) **the candidate it names must be the candidate the Book stands
    # behind.** Found by attacking the repair of (c): once `--manifests` runs
    # the gates over `ck["candidate_file"]`, the obvious next move is to leave
    # the defect where it is and point the manifest at a *different, clean*
    # file — one field again, and the gates then truthfully pass over a file
    # nobody ships. The manifest must name the accepted file of an accepted
    # Book, and otherwise the highest-numbered declared candidate.
    if ck.get("candidate_file"):
        if book in ACCEPTED:
            want = ACCEPTED[book][1]
        else:
            vs = [int(r.split("-v")[1].split(".")[0]) for r in DECLARED
                  if r.startswith("book%02d/" % book)]
            want = ("book%02d/candidate-v%d.json" % (book, max(vs))) if vs else None
        if want and ck["candidate_file"] != want:
            bad.append("manifest: book%02d names %s, but the file this Book "
                       "stands behind is %s — a manifest may not vouch for a "
                       "file the package does not ship"
                       % (book, ck["candidate_file"], want))

    # (b3) **the figures it records must reproduce from that candidate.** The
    # hashes prove the bytes did not move; they prove nothing about the numbers
    # written beside them, which are the part a reader actually reads. They
    # were typed once by a writer that is no longer the only writer.
    if ck.get("candidate_file") and (ROOT / ck["candidate_file"]).exists() \
            and book in BASIS:
        try:
            fr = figures(book, load("book%02d/source-book%d.json" % (book, book)),
                         load(ck["candidate_file"]))
        except Exception as e:                               # noqa: BLE001
            bad.append("manifest: book%02d — its figures could not be "
                       "recomputed: %s" % (book, e))
        else:
            for key, got, want in (
                    ("retention", round(fr["retention"], 5), ck.get("retention")),
                    ("sentences", list(fr["sent"]), ck.get("sentences")),
                    ("splitting_rate_raw_pct", round(fr["raw"], 1),
                     ck.get("splitting_rate_raw_pct")),
                    ("norm_rate_pct", round(fr["norm"], 1),
                     ck.get("norm_rate_pct")),
                    ("norm_rate_butler_pct", round(fr["norm_butler"], 1),
                     ck.get("norm_rate_butler_pct")),
                    ("sixty_word", list(fr["sixty"]), ck.get("sixty_word")),
                    ("semicolons", list(fr["semi"]), ck.get("semicolons")),
                    ("semicolons_kept_added", list(fr["kept_added"]),
                     ck.get("semicolons_kept_added")),
                    ("dividing_marks", list(fr["div"]),
                     ck.get("dividing_marks")),
                    ("dividing_marks_kept_added", list(fr["kept_added_div"]),
                     ck.get("dividing_marks_kept_added")),
                    ("norm_rate_ext_pct", round(fr["norm_ext"], 1),
                     ck.get("norm_rate_ext_pct")),
                    ("norm_rate_butler_ext_pct",
                     round(fr["norm_butler_ext"], 1),
                     ck.get("norm_rate_butler_ext_pct")),
                    ("move_gap", round(fr["movegap"], 5), ck.get("move_gap"))):
                if want is not None and got != want:
                    bad.append("manifest: book%02d records %s = %s, and %s "
                               "gives %s" % (book, key, want,
                                             ck["candidate_file"], got))

    # (c) `all_gates_passed: true` must be BACKED BY AN EVALUATION.
    #
    # **The defeat, found by Book 8's round 1 (S-3) and reproduced here before
    # it was repaired.** This clause used to read `if gate is not None and
    # ck.get("all_gates_passed") and gate.failures`. `--manifests` never
    # passes a gate, so on that path the clause was dead: plant a gate-failing
    # defect in `book07/candidate-v2.json`, edit **one field** —
    # `checks.candidate_sha256` — so clause (b) is satisfied, and
    # `--manifests` exits 0 while `checks.py 7` exits 1. Two of the package's
    # own instruments disagreed about the same bytes and the quiet one was the
    # one people ran.
    #
    # The guard is inverted: **absence of evidence is now a failure.** A
    # manifest asserting `all_gates_passed` and handed no evaluated Gate does
    # not get the benefit of the doubt, so a caller that forgets to supply one
    # is caught by this function rather than trusted by it. `run_manifests()`
    # supplies the evidence the only way it can be supplied — by putting the
    # gates to the candidate the manifest names.
    if ck.get("all_gates_passed"):
        if gate is None:
            bad.append("manifest: book%02d asserts all_gates_passed: true and "
                       "this caller supplied no evaluated Gate, so the "
                       "assertion is unchecked — an unbacked claim is a "
                       "failure, not a pass" % book)
        elif not gate.evaluated:
            bad.append("manifest: book%02d asserts all_gates_passed: true "
                       "beside a Gate that was never evaluated" % book)
        elif gate.failures:
            bad.append("manifest: book%02d asserts all_gates_passed: true, and "
                       "%d gate(s) just failed" % (book, len(gate.failures)))
    if figs is not None and ck.get("sha256") and figs.get("checks_md_sha256") \
            and ck["sha256"] != figs["checks_md_sha256"]:
        bad.append("manifest: book%02d records a checks hash that this run did "
                   "not produce (%s vs %s)"
                   % (book, str(ck["sha256"])[:8],
                      figs["checks_md_sha256"][:8]))
    return bad


def run_manifests():
    """`--manifests`: the read side for every Book at once."""
    print("checks.py --manifests — verifying every Book's manifest against the "
          "files it names\n")
    bad = []
    for bkdir in sorted((ROOT).glob("book[0-9][0-9]")):
        book = int(bkdir.name[4:])
        # **The repair of the defeat.** `--manifests` used to call
        # `verify_manifest(book)` with no Gate, which made clause (c) dead on
        # the one path most people run. A manifest that asserts
        # `all_gates_passed` is a claim about the CONTENT of the candidate it
        # names, and the only way to check a claim about content is to put the
        # gates to that content. So this loop runs them, over the candidate
        # the MANIFEST names rather than the latest file on disk — which is
        # also what makes the edit-one-field attack fail: moving
        # `candidate_sha256` to match a defective candidate now points the
        # gates straight at the defect.
        gate = None
        mp = bkdir / "manifest.json"
        named = None
        if mp.exists():
            try:
                named = (json.loads(mp.read_text(encoding="utf-8"))
                         .get("checks") or {}).get("candidate_file")
            except Exception:                                # noqa: BLE001
                named = None
        fr = None
        if named and (ROOT / named).exists():
            try:
                fr, gate = run_book(book, write=False, quiet=True,
                                    candidate=named)
            except Exception as e:                           # noqa: BLE001
                bad.append("manifest: book%02d — the gates could not be put to "
                           "%s: %s" % (book, named, e))
                print("  \u2717 book%02d  gates could not run over %s"
                      % (book, named))
                continue
        msgs = verify_manifest(book, gate=gate)
        if fr is not None and fr.get("render_sha256") and named:
            ck = (json.loads(mp.read_text(encoding="utf-8")).get("checks")
                  or {})
            if ck.get("sha256") and ck["sha256"] != fr["render_sha256"]:
                msgs = msgs + [
                    "manifest: book%02d records checks.sha256 %s, and the "
                    "checks file the CODE would write now hashes to %s — the "
                    "generated file no longer reproduces (re-run "
                    "`checks.py %d --write-manifest`)"
                    % (book, str(ck["sha256"])[:8], fr["render_sha256"][:8],
                       book)]
        if gate is not None and gate.failures:
            msgs = msgs + ["manifest: book%02d — the candidate its manifest "
                           "names fails a content gate: %s" % (book, m)
                           for m in gate.failures]
        if msgs:
            bad += msgs
            for m in msgs:
                print("  \u2717 %s" % m)
        else:
            mm = json.loads((bkdir / "manifest.json").read_text(encoding="utf-8"))
            ck = mm.get("checks")
            print("  \u2713 book%02d  %s" % (
                book, "checks %s over %s, gates re-run and passing"
                % (ck["sha256"][:8], ck.get("candidate_file", "?"))
                if ck else "no checks block (predates the rule, declared)"))
    print()
    if bad:
        print("%d manifest failure(s)." % len(bad))
        return 1
    print("Every manifest names files that exist and hash to what it recorded, "
          "and every `all_gates_passed` is backed by a gate run that was made "
          "to happen here.")
    return 0


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
def run_book(book, version=None, write=True, quiet=False, candidate=None):
    """Run every check for one Book, write `bookNN/checks-vN.md`, and return
    (figures, gate). The caller exits non-zero if `gate.failures`."""
    bd = ROOT / ("book%02d" % book)
    src = load("book%02d/source-book%d.json" % (book, book))
    if version is None:
        vs = sorted(int(p.stem.split("-v")[1]) for p in bd.glob("candidate-v*.json"))
        if not vs:
            sys.exit("checks.py: book%02d has no candidate-v*.json" % book)
        version = vs[-1]
    cand_path = (ROOT / candidate) if candidate else bd / ("candidate-v%d.json" % version)
    if candidate:
        version = int(cand_path.stem.split("-v")[1])
    cand = load(str(cand_path.relative_to(ROOT)))
    if book not in BASIS:
        BASIS[book] = (None, "all %d paragraphs" % len(src))

    cand_rel = str(cand_path.relative_to(ROOT))
    D = declared(cand_rel)

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
    # **Records finding R-5 of Book 7's round 1.** The comparison used to be
    # membership — `r not in legacy` — so a Book that declares one 49→50 growth
    # at P5 and then acquires a SECOND 49→50 growth in the same paragraph had
    # both excluded. Multisets, so multiplicity is asserted too, and the two
    # directions are one equality.
    legacy = Counter(D["growth"])
    got = Counter((a, b, d) for a, b, d, _ in grown_fail)
    unexpected = sorted((got - legacy).elements())
    missing = sorted((legacy - got).elements())
    g.check(not unexpected,
            "D20 growth gate: a sentence grew past 50 words — "
            + "; ".join("P%03d %d→%d" % r for r in unexpected))
    g.check(not missing,
            "D20 growth gate: this Book declares growths it no longer carries "
            "(update DECLARED[%r]['growth']): %s" % (cand_rel, missing))

    # --- word ratio ----------------------------------------------------------
    sw = [len(p.split()) for p in s]
    cw = [len(p.split()) for p in c]
    ratio = sum(cw) / sum(sw)
    g.check(0.90 <= ratio <= 1.10, "word ratio %.5f outside 0.90–1.10" % ratio)
    # S-3: exact-list equality in both directions, on indices AND ratios.
    thin = sorted((i + 1, round(b / a, 4))
                  for i, (a, b) in enumerate(zip(sw, cw))
                  if b / a < MIN_PARA_FLOOR)
    thin_declared = sorted(D["thin"])
    g.check([i for i, _ in thin] == [i for i, _ in thin_declared],
            "paragraphs below %.2f of their source's length: %s, but %s "
            "declares %s" % (MIN_PARA_FLOOR, [i for i, _ in thin], cand_rel,
                             [i for i, _ in thin_declared]))
    if [i for i, _ in thin] == [i for i, _ in thin_declared]:
        moved = ["P%03d %.4f declared %.4f" % (i, got, want)
                 for (i, got), (_, want) in zip(thin, thin_declared)
                 if abs(got - want) > MIN_PARA_TOL]
        g.check(not moved, "a declared thin paragraph's ratio has moved: %s"
                % "; ".join(moved))

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
    g.check(same == sorted(D["byte_identical"]),
            "byte-identical paragraphs %s, but %s declares %s"
            % (same, cand_rel, sorted(D["byte_identical"])))

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
    # Exact-list equality, both directions, like every other declaration: an
    # undeclared drift fails, and a declared drift that has been repaired fails
    # too, so a successor cannot be built without its declaration being updated.
    seen = sorted(k for k, _ in drift)
    g.check(seen == sorted(D["compound"]),
            "cross-Book compound drift %s, but %s declares %s — %s"
            % (seen, cand_rel, sorted(D["compound"]),
               "; ".join("%s %s" % (k, v) for k, v in drift)))

    # --- reports, not gates --------------------------------------------------
    near = near_identical(s, c)
    tw = one_word_two_ways(s, c)
    longs = long_sentences(s, c)
    pairs = compound_pairs(cand)
    dr = [(i, t) for i, (a, b) in enumerate(zip(s, c), 1)
          for _, _, t in displaced_runs(a, b)]

    g.evaluated = True                       # every gate above has now run

    rendered = _render(book, version, cand_path, f, g, grown, grown_fail, near,
                       tw, longs, pairs, dr, drift, floor, worst, worst_bk,
                       ratio)
    # **The staleness class `--manifests` could not see, found by
    # `prove_manifest.py`'s own CONTROL at Book 9.** Accepting Book 8 put a
    # ninth row in the cross-Book table every `checks-vN.md` prints, so every
    # earlier Book's checks file stopped reproducing from the code that writes
    # it — while its recorded hash and the file on disk still agreed, because
    # both were the stale pair. `f["render_sha256"]` is the hash of what this
    # run WOULD write, so the manifest can be checked against the code rather
    # than against a file that was written once.
    f["render_sha256"] = hashlib.sha256(rendered.encode("utf-8")).hexdigest()
    if write:
        path = bd / ("checks-v%d.md" % version)
        path.write_text(rendered, encoding="utf-8")
        f["checks_md"] = str(path.relative_to(ROOT))
        f["checks_md_sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
    f["candidate_sha256"] = hashlib.sha256(cand_path.read_bytes()).hexdigest()
    f["candidate_file"] = str(cand_path.relative_to(ROOT))

    # --- THE MANIFEST READ SIDE (S-2) ---------------------------------------
    # The manifest is checked against the files it names, on every run, so a
    # manifest that has decayed fails here and not three Books later.
    g.manifest_failures = verify_manifest(book, f if write else None, g)

    if not quiet:
        _print(book, version, f, g, grown, grown_fail, longs, pairs, dr)
    return f, g


def _row(bk, f):
    return ("| Book %s | %s | %.5f | %d → %d | %+.1f%% | %d → %d | %d → %d | "
            "%d + %d | %+.1f%% | **%+.1f%%** | %.5f |"
            % (bk, f["basis"].split(" —")[0].split(",")[0], f["retention"],
               f["sent"][0], f["sent"][1], f["raw"], f["semi"][0],
               f["semi"][1], f["div"][0], f["div"][1],
               f["kept_added_div"][0], f["kept_added_div"][1], f["norm"],
               f["norm_butler_ext"], f["movegap"]))


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
          "| NORM RATE as published (D20) | %+.1f%% |" % f["norm"],
          "| semicolon-normalized, on Butler's pointing | %d → %d |"
          % f["norm_butler_pair"],
          "| **NORM RATE on Butler's own pointing** (D20, S-1) | **%+.1f%%** |"
          % f["norm_butler"],
          "| sixty-word sentences | %d → %d (%.0f%% broken) |"
          % (f["sixty"][0], f["sixty"][1], f["broken"]),
          "| **semicolons, Butler → candidate** (D19) | **%d → %d** |" % f["semi"],
          "| **of which KEPT of Butler's / ADDED by the draft** (S-1) | "
          "**%d kept + %d added** |" % f["kept_added"],
          "| **dividing marks, Butler → candidate** (D27: `;` `:` "
          "sentence-internal `—`) | **%d → %d** |" % f["div"],
          "| **of which KEPT / ADDED** (D27) | **%d kept + %d added** |"
          % f["kept_added_div"],
          "| dividing-mark-normalized sentences | %d → %d |"
          % f["norm_ext_pair"],
          "| NORM RATE, every dividing mark (D27) | %+.1f%% |" % f["norm_ext"],
          "| dividing-mark-normalized, on Butler's pointing | %d → %d |"
          % f["norm_butler_ext_pair"],
          "| **NORM RATE, dividing marks on Butler's pointing** — "
          "**the compared figure from Book 8 forward** (D27+D21) | "
          "**%+.1f%%** |" % f["norm_butler_ext"],
          "", "Of the %+d sentences added, at most **%d** are a semicolon"
          % (f["sent"][1] - f["sent"][0], max(0, f["semi"][0] - f["semi"][1])),
          "rewritten as a period — the operation that adds a sentence, moves no",
          "clause, drops no word and costs no retention. That is what NORM RATE",
          "prices out, and why **D19 is a rate and not a count** (D20).", "",
          "**And the mirror operation, which is the one D20 never priced.**",
          "Substantive finding **S-1** of Book 7's round 1: a comma raised to a",
          "semicolon adds nothing to the sentence count, adds one to the",
          "candidate's semicolon count, and therefore scores under D20 exactly",
          "what a real period scores — while leaving the clause chain inside one",
          "sentence. A period costs a recast; a semicolon costs a keystroke.",
          "**%d of this candidate's %d semicolons are its own**, and the figure"
          % (f["kept_added"][1], f["semi"][1]),
          "that is COMPARED from Book 7 forward is **NORM RATE on Butler's own",
          "pointing**, %+.1f%% here against the %+.1f%% the unsplit measure gives."
          % (f["norm_butler"], f["norm"]), "",
          "## 3. The cross-Book table, with every basis stated (R-1)", "",
          "| Book | basis | retention | sentences | raw D17 | semicolons "
          "| dividing marks (D27) | kept + added | NORM RATE (D20) "
          "| **NORM RATE, D27 on Butler's pointing** | MOVE-GAP |",
          "|---|---|---|---|---|---|---|---|---|---|---|"]
    rows = comparison_table()
    for bk, ff in rows:
        L.append(_row(bk, ff))
    # Do not print the subject twice: once a Book is accepted it appears in the
    # table above, and a second identical row headed "6 v2" reads as a second
    # Book. The subject row is for a candidate the table does not yet carry.
    if not any(abs(ff["retention"] - f["retention"]) < 5e-6
               and ff["sent"] == f["sent"] for _, ff in rows):
        L.append(_row("%d v%d — **this candidate**" % (book, version), f))
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
    print("  NORM RATE on Butler's own  %+.1f%%  (%d → %d normalized, S-1)"
          % (f["norm_butler"], f["norm_butler_pair"][0],
             f["norm_butler_pair"][1]))
    print("  dividing marks (D27)       %d → %d  (`;` `:` internal `—`)"
          % f["div"])
    print("  of which kept / added      %d kept + %d added  (D27)"
          % f["kept_added_div"])
    print("  NORM RATE, D27             %+.1f%%  (%d → %d normalized)"
          % (f["norm_ext"], f["norm_ext_pair"][0], f["norm_ext_pair"][1]))
    print("  ** NORM RATE, D27 on Butler's pointing  %+.1f%%  (%d → %d) — "
          "THE COMPARED FIGURE"
          % (f["norm_butler_ext"], f["norm_butler_ext_pair"][0],
             f["norm_butler_ext_pair"][1]))
    print("  semicolons Butler → cand   %d → %d  (D19)" % f["semi"])
    print("  of which kept / added      %d kept + %d added  (S-1)"
          % f["kept_added"])
    print("  sentences grown to 40+     %d (0 may fail at 50+)" % len(grown))
    print("  candidate sentences 40+    %d (absolute)" % len(longs))
    print("  displaced runs             %d" % len(dr))
    print("  H.1 head-noun pairs        %d" % len(pairs))
    if g.manifest_failures:
        print("  MANIFEST FAILED (S-2 read side):")
        for m in g.manifest_failures:
            print("    \u2717 %s" % m)
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
    print("%-8s %-20s %9s %12s %10s %11s %9s %9s"
          % ("Book", "basis", "retention", "sentences", "semicolons",
             "div marks", "NORM D27", "MOVE-GAP"))
    for bk in sorted(ACCEPTED):
        sf, cf, _ = ACCEPTED[bk]
        f = figures(bk, load(sf), load(cf))
        p = PUBLISHED[bk]
        print("%-8d %-20s %9.5f %6d → %-3d %5d → %-3d %5d → %-3d %+8.1f%% %9.5f"
              % (bk, f["basis"].split(" —")[0], f["retention"], f["sent"][0],
                 f["sent"][1], f["semi"][0], f["semi"][1], f["div"][0],
                 f["div"][1], f["norm_butler_ext"], f["movegap"]))
        for key, got, want, fmt in (
                ("retention", f["retention"], p["retention"], "%.5f"),
                ("sentences", f["sent"], p["sent"], "%s"),
                ("sixty", f["sixty"], p["sixty"], "%s"),
                ("semicolons", f["semi"], p["semi"], "%s"),
                ("NORM RATE", round(f["norm"], 1), p["norm"], "%s"),
                ("NORM RATE (Butler's pointing)",
                 round(f["norm_butler"], 1), p["norm_butler"], "%s"),
                ("semicolons kept+added", f["kept_added"], p["kept_added"], "%s"),
                ("dividing marks (D27)", f["div"], p["div"], "%s"),
                ("dividing marks kept+added (D27)", f["kept_added_div"],
                 p["kept_added_div"], "%s"),
                ("NORM RATE, every dividing mark (D27)",
                 round(f["norm_ext"], 1), p["norm_ext"], "%s"),
                ("NORM RATE, dividing marks on Butler's pointing (D27+D21)",
                 round(f["norm_butler_ext"], 1), p["norm_butler_ext"], "%s"),
                ("MOVE-GAP", round(f["movegap"], 5), p["movegap"], "%.5f")):
            g = round(got, 5) if isinstance(got, float) else got
            if g != want:
                bad.append("Book %d %s: published %s, recomputed %s"
                           % (bk, key, fmt % (want,), fmt % (g,)))
    # **Records finding R-4 of Book 7's round 1: `--all` re-asserted FIGURES
    # and never evaluated the GATES.** Every entry of `DECLARED` and
    # `DECLARED` lived only inside `run_book()`, which `--all` did not
    # call, so a change that preserved all six pinned figures to the printed
    # precision while adding a byte-identical paragraph passed `--all` in
    # silence. Now every accepted Book's gates are put to it, and its manifest
    # with them.
    # Every key of DECLARED gets the gates too, so `--all` can no longer pass
    # while a row of the table is a claim nothing tests.
    print("\ndeclarations — every file DECLARED names, gated:")
    dbad = run_declarations(quiet=True)
    bad += dbad
    print("  %s %d declared files evaluated, %d superseded, %d on disk; "
          "%d failure(s)"
          % ("\u2717" if dbad else "\u2713", len(DECLARED), len(SUPERSEDED),
             len(candidate_files_on_disk()), len(dbad)))

    print("\ngates and manifests, for every accepted Book:")
    for bk in sorted(ACCEPTED):
        _f, gg = run_book(bk, version=None, write=False, quiet=True,
                          candidate=ACCEPTED[bk][1])
        msgs = ["Book %d gate: %s" % (bk, m) for m in gg.failures] + \
               ["Book %d %s" % (bk, m) for m in gg.manifest_failures]
        if msgs:
            bad += msgs
            print("  \u2717 Book %d — %d failure(s)" % (bk, len(msgs)))
        else:
            print("  \u2713 Book %d — every gate passes, manifest verifies" % bk)

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

    def raise_a_comma_to_a_semicolon(ps):
        """**The mutation substantive finding S-1 turns on, and the control the
        audit did not have.** The suite had *"cashing a semicolon leaves NORM
        RATE exactly where it was"* and *"the raw rate DOES move under the same
        mutation"*, and nothing at all in the other direction — so the one
        operation that moves a published figure without moving anything a
        reader experiences was untested. It is the mirror of the positive
        control already there and it costs three lines.

        Precondition asserted under D18 clause (a): the paragraph chosen must
        actually contain `, and ` and the mutation must change the text."""
        out = list(ps)
        for i, para in enumerate(out):
            if ", and " in para:
                out[i] = para.replace(", and ", "; and ", 1)
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

    # ---- D27's mutations. Book 8's round 1 (S-1): D20 prices the semicolon
    # and nothing else, so a COLON or a sentence-internal EM DASH cashed for a
    # period is free division under every measure the package had. Each gets
    # the pair of controls the semicolon has — the positive one (the extended
    # measure does not move) and its negative (the raw rate does).
    def cash_a_colon(ps):
        out = list(ps)
        for i, para in enumerate(out):
            if ": " in para:
                head, tail = para.split(": ", 1)
                out[i] = head + ". " + tail[0].upper() + tail[1:]
                return out
        raise AssertionError("no colon to cash in this candidate")

    def cash_an_internal_dash(ps):
        out = list(ps)
        for i, para in enumerate(out):
            for off in sorted(internal_dash_offsets(para)):
                tail = para[off + 1:]
                if tail[:1].isalpha():
                    out[i] = (para[:off].rstrip() + ". " + tail[0].upper()
                              + tail[1:])
                    return out
        raise AssertionError("no sentence-internal em dash to cash")

    def raise_a_comma_to_a_colon(ps):
        out = list(ps)
        for i, para in enumerate(out):
            if ", and " in para:
                out[i] = para.replace(", and ", ": and ", 1)
                return out
        raise AssertionError("no `, and ` to raise")

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
    control("NORM RATE as published MOVES when a comma is raised to a "
            "semicolon — the S-1 defect, priced at a full division for one "
            "keystroke",
            cand, raise_a_comma_to_a_semicolon(cand),
            verdict=lambda ps: r5(norm_rate(src, ps)[5]))
    control("NORM RATE on Butler's own pointing does NOT move under that same "
            "mutation (positive control — this is why it is the figure that is "
            "compared from Book 7 forward)",
            cand, raise_a_comma_to_a_semicolon(cand),
            verdict=lambda ps: r5(norm_rate_butler(src, ps)[2]),
            expect_same=True)
    control("semicolon provenance names the added mark: kept stays, added "
            "rises by one",
            cand, raise_a_comma_to_a_semicolon(cand),
            verdict=lambda ps: kept_added(src, ps))
    control("and it does NOT mistake a semicolon of Butler's cashed for a "
            "period as an addition — kept falls, added stays",
            cand, cash_a_semicolon(cand),
            verdict=lambda ps: kept_added(src, ps))
    control("D27: cashing a COLON for a period leaves the extended NORM RATE "
            "EXACTLY where it was (the positive control S-1 asked for)",
            cand, cash_a_colon(cand),
            verdict=lambda ps: r5(norm_rate_ext(src, ps)[2]), expect_same=True)
    control("and the raw D17 rate DOES move under that same mutation — so a "
            "cashed colon was free division before D27",
            cand, cash_a_colon(cand),
            verdict=lambda ps: r5(splitting_rate(src, ps)[2]))
    control("D20 as it stood — semicolons only — ALSO moves under it, which "
            "is the defect D27 repairs",
            cand, cash_a_colon(cand),
            verdict=lambda ps: r5(norm_rate(src, ps)[5]))
    control("D27: cashing a sentence-internal EM DASH leaves the extended "
            "NORM RATE exactly where it was",
            cand, cash_an_internal_dash(cand),
            verdict=lambda ps: r5(norm_rate_ext(src, ps)[2]), expect_same=True)
    control("and the raw D17 rate DOES move under that one too",
            cand, cash_an_internal_dash(cand),
            verdict=lambda ps: r5(splitting_rate(src, ps)[2]))
    control("D27 + D21: raising a comma to a COLON does not move the compared "
            "figure — the S-1 corollary, on the marks D27 adds",
            cand, raise_a_comma_to_a_colon(cand),
            verdict=lambda ps: r5(norm_rate_butler_ext(src, ps)[2]),
            expect_same=True)
    control("...and the unguarded extended measure DOES move under it, which "
            "is why the compared figure is the Butler-pointed one",
            cand, raise_a_comma_to_a_colon(cand),
            verdict=lambda ps: r5(norm_rate_ext(src, ps)[2]))
    control("dividing-mark provenance names the added mark: kept stays, added "
            "rises by one",
            cand, raise_a_comma_to_a_colon(cand),
            verdict=lambda ps: kept_added_div(src, ps))
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
    ap.add_argument("--declarations", action="store_true",
                    help="put the full gates to every key of DECLARED, and "
                         "assert the table is exactly the candidate files on "
                         "disk (Book 8 round 1, S-3's second half)")
    ap.add_argument("--manifests", action="store_true",
                    help="verify every Book's manifest against the files it "
                         "names (the S-2 read side)")
    ap.add_argument("--write-manifest", action="store_true",
                    help="run the gates for one Book and, ONLY if they "
                         "evaluated and passed, write its manifest `checks` "
                         "block. The only writer in the package.")
    ap.add_argument("--no-write", action="store_true")
    a = ap.parse_args()
    if a.audit:
        audit()
        return 0
    if a.declarations:
        return 1 if run_declarations() else 0
    if a.manifests:
        return run_manifests()
    if a.all:
        return run_all()
    if a.book is None:
        ap.error("give a book number, or --all, or --audit, or --manifests")
    if a.write_manifest:
        f, g = run_book(a.book, a.version, write=True)
        block = manifest_checks_block(f, g)     # raises unless evaluated+passed
        mp = ROOT / ("book%02d/manifest.json" % a.book)
        m = json.loads(mp.read_text(encoding="utf-8")) if mp.exists() else {}
        m["checks"] = block
        mp.write_text(json.dumps(m, indent=1, ensure_ascii=False) + "\n",
                      encoding="utf-8")
        print("\nbook%02d/manifest.json: checks block written over %s"
              % (a.book, block["candidate_file"]))
        return 0
    f, g = run_book(a.book, a.version, write=not a.no_write)
    return 1 if (g.failures or g.manifest_failures) else 0


if __name__ == "__main__":
    sys.exit(main())
