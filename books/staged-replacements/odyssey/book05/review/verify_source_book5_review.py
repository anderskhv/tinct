#!/usr/bin/env python3
"""
Book 5 source verification — the REVIEWER's rule, a seventh kind.

The six rules already used in this package:
  1. Book 2 drafter   — PG's footnote-entry list, positionally.
  2. Book 3 drafter   — the BOOK III / BOOK IV headings, bytes, apparatus-in diff.
  3. Book 3 reviewer  — anchorless, digit-blind, one contiguous token block.
  4. Book 4 drafter   — occurrence-unique needles and a derived region.
  5. Book 4 reviewer  — global per-paragraph fingerprint alignment.
  6. Book 5 drafter   — identification by residue (locate the other 23, subtract).

THIS RULE (the seventh): ONE GLOBAL MONOTONE DIFF OF THE WHOLE EDITION AGAINST
THE WHOLE FILE.

  Concatenate all 24 served chapters into a single ordered token stream.
  Take the WHOLE PG file as a single ordered token stream — front matter,
  preface, footnotes, transcriber's notes, licence and all; no region is
  selected, trimmed or chosen by anybody.  Run one order-preserving
  (monotone) sequence alignment between the two, with no anchors, no needles,
  no fingerprints and no arithmetic on chapter lengths.  Then read off,
  after the fact, where the tokens that happen to belong to chapter 5 landed.

Why it is not any of the six:
  * Nothing is searched FOR.  The aligner is never told that chapter 5 exists,
    where it might be, or what it contains; it is handed 118,031 tokens and
    132,902 tokens and asked for the maximal order-preserving correspondence.
  * Chapter 5's coordinates in PG are therefore pinned from BOTH sides at once
    by the 23 other chapters, through monotonicity alone: an alignment cannot
    place chapter 5's tokens before chapter 4's or after chapter 6's.  The
    residue rule (6) gets its region by subtraction and must assume the
    remainder is contiguous and exhausted; this rule never assumes contiguity —
    it reports whatever span the aligner produces, including holes.
  * It is not fingerprint alignment (5): no per-paragraph unit, no hashing.
    The unit is the single token, and a paragraph that had been merged, split,
    reordered or half-deleted would still align token for token.
  * A corruption inside served chapter 5 does not move the window, because the
    window is not a window — it is wherever the aligner put those tokens, and
    the 23 neighbours hold it in place.

AUDIT.  The rule is audited before it is trusted (negative controls below).
Every control asserts that its mutation ACTUALLY CHANGED THE TEXT before the
control is run — the defect the Book 5 drafter found in its own script.
"""

import json, re, sys, difflib, hashlib, os

HERE = os.path.dirname(os.path.abspath(__file__))
PKG  = os.path.abspath(os.path.join(HERE, "..", ".."))
REPO = os.path.abspath(os.path.join(PKG, "..", "..", ".."))

PG_PATH     = os.path.join(PKG, "source-texts", "pg1727-butler-1900.txt")
SERVED_PATH = os.path.join(REPO, "app", "public", "data", "editions",
                           "odyssey-original-en.json")
SOURCE_PATH = os.path.join(PKG, "book05", "source-book5.json")

TARGET = 5


def tok(s):
    s = s.replace("’", "'").replace("‘", "'")
    s = s.replace("“", '"').replace("”", '"')
    return re.findall(r"[a-z']+", s.lower())


def load():
    pg = open(PG_PATH, encoding="utf-8").read()
    served = json.load(open(SERVED_PATH, encoding="utf-8"))["chapters"]
    assert len(served) == 24, len(served)
    return pg, served


def build_streams(served):
    """One ordered token stream for the whole edition, plus an index that
    records, for each token position, which chapter and paragraph it came
    from.  The index is READ AFTER the alignment, never before it."""
    stream, owner = [], []
    for c in served:
        for pi, p in enumerate(c["paragraphs"]):
            for t in tok(p):
                stream.append(t)
                owner.append((c["number"], pi))
    return stream, owner


def align(pg_tokens, ed_tokens):
    sm = difflib.SequenceMatcher(None, pg_tokens, ed_tokens, autojunk=False)
    return sm.get_matching_blocks()


def report(pg_tokens, ed_tokens, owner, blocks, label, verbose=True):
    """Read off where the TARGET chapter's tokens landed."""
    lo = min(i for i, o in enumerate(owner) if o[0] == TARGET)
    hi = max(i for i, o in enumerate(owner) if o[0] == TARGET) + 1
    n = hi - lo

    matched = 0
    pg_hits = []
    per_par_total, per_par_ok = {}, {}
    for i in range(lo, hi):
        per_par_total[owner[i][1]] = per_par_total.get(owner[i][1], 0) + 1

    for a, b, size in blocks:
        if size == 0:
            continue
        s, e = max(b, lo), min(b + size, hi)
        if s < e:
            matched += e - s
            pg_hits.append((a + (s - b), a + (e - b)))
            for i in range(s, e):
                per_par_ok[owner[i][1]] = per_par_ok.get(owner[i][1], 0) + 1

    frac = matched / n
    span = (min(x for x, _ in pg_hits), max(y for _, y in pg_hits)) if pg_hits else (0, 0)
    # TWO statistics, not one.  `frac` is edition-side: the fraction of the
    # chapter's own tokens that aligned.  It is BLIND TO DELETION — drop a run
    # of Butler's words and every surviving token still aligns, frac stays
    # 1.00000.  The audit below caught exactly that, so the rule carries a
    # second, PG-side statistic: how many of PG's tokens inside the span were
    # left unclaimed.  A deletion opens a hole there; nothing else does.
    gap = (span[1] - span[0]) - matched
    if verbose:
        print(f"  [{label}] chapter {TARGET}: {n} tokens, "
              f"{matched} aligned ({frac:.5f}), "
              f"PG span [{span[0]}, {span[1]}), length {span[1]-span[0]}, "
              f"unclaimed PG tokens inside the span: {gap}")
    return (frac, gap), span, per_par_total, per_par_ok


def neighbours_pin(owner, blocks):
    """The property the rule rests on: chapter 5's aligned PG span lies
    strictly between chapter 4's and chapter 6's.  Computed from the SAME
    single alignment."""
    spans = {}
    pos = {}
    for a, b, size in blocks:
        for k in range(size):
            pos[b + k] = a + k
    for i, (ch, _) in enumerate(owner):
        if i in pos:
            lo, hi = spans.get(ch, (10 ** 9, -1))
            spans[ch] = (min(lo, pos[i]), max(hi, pos[i]))
    return spans


# ---------------------------------------------------------------------------
# controls
# ---------------------------------------------------------------------------

def mutate_swap_two_words(paras, pi):
    """Swap the 5th and 6th words of paragraph pi."""
    w = paras[pi].split(" ")
    assert len(w) > 8, "control needs a paragraph of at least 9 words"
    w[4], w[5] = w[5], w[4]
    out = list(paras); out[pi] = " ".join(w)
    assert out[pi] != paras[pi], "CONTROL IS A NO-OP: swap changed nothing"
    return out


def mutate_delete_run(paras, pi, k=12):
    w = paras[pi].split(" ")
    assert len(w) > k + 4
    out = list(paras); out[pi] = " ".join(w[:2] + w[2 + k:])
    assert out[pi] != paras[pi], "CONTROL IS A NO-OP: deletion changed nothing"
    return out


def mutate_replace_own_word(paras, pi):
    """Replace the paragraph's own longest word with a token that is absent
    from the whole PG file.  Built from the paragraph's own words, never from
    a guessed string like 'the'."""
    w = paras[pi].split(" ")
    j = max(range(len(w)), key=lambda k: len(re.sub(r"[^A-Za-z]", "", w[k])))
    assert re.sub(r"[^A-Za-z]", "", w[j]), "control found no alphabetic word"
    w[j] = "zqxjkvwmb"
    out = list(paras); out[pi] = " ".join(w)
    assert out[pi] != paras[pi], "CONTROL IS A NO-OP: replacement changed nothing"
    return out


def mutate_reverse_paragraph_order(paras, pi):
    """Reverse the order of two adjacent paragraphs — a pure order defect that
    leaves the multiset of tokens untouched."""
    assert pi + 1 < len(paras)
    assert paras[pi] != paras[pi + 1], "CONTROL IS A NO-OP: adjacent paragraphs identical"
    out = list(paras)
    out[pi], out[pi + 1] = out[pi + 1], out[pi]
    assert out != paras, "CONTROL IS A NO-OP: swap changed nothing"
    return out


def mutate_foreign_paragraph(paras, pi, served, donor_ch):
    """Replace a chapter-5 paragraph with a paragraph of another chapter —
    text that IS in PG, but in the wrong place.  Monotonicity should reject it
    even though every token of it occurs in the file."""
    donor = served[donor_ch - 1]["paragraphs"][3]
    assert donor != paras[pi], "CONTROL IS A NO-OP: donor equals the original"
    out = list(paras); out[pi] = donor
    assert out != paras, "CONTROL IS A NO-OP"
    return out


def main():
    pg, served = load()
    pg_tokens = tok(pg)
    ed_tokens, owner = build_streams(served)

    print("seventh rule — one global monotone diff, whole edition vs whole file")
    print(f"  PG file tokens      : {len(pg_tokens)}")
    print(f"  served edition tokens: {len(ed_tokens)}")
    print(f"  PG sha256           : {hashlib.sha256(open(PG_PATH,'rb').read()).hexdigest()[:16]}…")
    print()

    blocks = align(pg_tokens, ed_tokens)
    (frac, gap), span, tot, ok = report(pg_tokens, ed_tokens, owner, blocks, "as served")

    spans = neighbours_pin(owner, blocks)
    print()
    print("  monotone pinning (same alignment, read per chapter):")
    for ch in (3, 4, 5, 6, 7):
        print(f"    chapter {ch:2d}: PG tokens [{spans[ch][0]}, {spans[ch][1]}]")
    assert spans[4][1] < spans[5][0], "chapter 5 not after chapter 4"
    assert spans[5][1] < spans[6][0], "chapter 5 not before chapter 6"
    print("    -> chapter 5's span lies strictly between chapter 4's and chapter 6's.")

    print()
    print("  per-paragraph alignment of chapter 5 (37 paragraphs):")
    bad = []
    for pi in sorted(tot):
        f = ok.get(pi, 0) / tot[pi]
        if f < 1.0:
            bad.append((pi, tot[pi], ok.get(pi, 0), f))
    if not bad:
        print("    all 37 paragraphs aligned token for token, 100%.")
    else:
        for pi, t, o, f in bad:
            print(f"    B05-P{pi+1:03d}: {o}/{t} = {f:.4f}")

    # cross-check: source-book5.json is the served chapter 5 verbatim
    src = json.load(open(SOURCE_PATH, encoding="utf-8"))
    sp = src["paragraphs"] if isinstance(src, dict) else src
    print()
    print("  source-book5.json vs served chapter 5:")
    cp = served[TARGET - 1]["paragraphs"]
    print(f"    paragraphs {len(sp)} vs {len(cp)}; "
          f"byte-identical: {sp == cp}")

    print()
    print("  negative controls (each asserts its own mutation changed the text):")
    base_paras = served[TARGET - 1]["paragraphs"]
    controls = [
        ("swap two adjacent words, P014", lambda p: mutate_swap_two_words(p, 13)),
        ("delete a 12-word run, P019",    lambda p: mutate_delete_run(p, 18)),
        ("replace longest word, P030",    lambda p: mutate_replace_own_word(p, 29)),
        ("reverse two paragraphs, P007/8",lambda p: mutate_reverse_paragraph_order(p, 6)),
        ("import a Book 9 paragraph, P022",
         lambda p: mutate_foreign_paragraph(p, 21, served, 9)),
    ]
    failures = []
    for name, f in controls:
        mutated = f(base_paras)
        alt = [dict(c) for c in served]
        alt[TARGET - 1] = dict(alt[TARGET - 1]); alt[TARGET - 1]["paragraphs"] = mutated
        et, ow = build_streams(alt)
        bl = align(pg_tokens, et)
        (fr, gp), sp2, t2, o2 = report(pg_tokens, et, ow, bl, name)
        if fr >= frac and gp <= gap:
            failures.append(name)
            print(f"    !! CONTROL DID NOT FAIL: {name}")
        else:
            why = []
            if fr < frac: why.append(f"alignment {fr:.5f} < clean {frac:.5f}")
            if gp > gap:  why.append(f"{gp} PG tokens left unclaimed (clean {gap})")
            print("    control detected (" + "; ".join(why) + ")")

    print()
    if failures:
        print("VERDICT: RULE IS NOT TRUSTWORTHY — controls that did not fire:", failures)
        return 1
    if frac < 1.0 or gap != 0:
        print(f"VERDICT: chapter 5 does NOT align token for token "
              f"(edition side {frac:.5f}, {gap} PG tokens unclaimed).")
        return 1
    print("VERDICT: served chapter 5 is Butler's PG #1727 text, token for token,")
    print("         located by an alignment that was never told it existed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
