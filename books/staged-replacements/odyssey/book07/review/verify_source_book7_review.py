#!/usr/bin/env python3
"""Source verification for Book 7 — the ELEVENTH kind of rule.

**Primary instrument: the capitalization bitstring.  Corroborating channel:
the FOOTNOTES section's own internal structure.**

Ten rules have been used (`RESUME.md`).  Every one of them reads one of five
channels: Butler's letters (1, 3, 4, 5, 6, 7, 8), his pointing and word
lengths (9), PG's transcriber line-wrapping (10), his headings in bytes (2),
or his footnote numerals as an ordinal index (10 clause 4, 4's needles).

This rule reads **none of them**.  Each whitespace token of the text is
reduced to a single bit — `1` if its first *letter* is upper case, `0` if it
is lower case; a token containing no letter emits nothing at all.  Letter
identity is destroyed, word length is destroyed, every punctuation mark is
destroyed, every line break is destroyed, every digit is destroyed.  What
survives is the text's **case shape**: where the proper nouns and the sentence
openings fall, and nothing else.  3,3xx bits for a chapter this size.

Two unlike rules are evidence; two rules reading the same channel are one rule
twice.  This one is unlike the nine that read the text and unlike the tenth
that read the artefact.

**Clause 4 is the new channel the package has never used as an instrument**:
the FOOTNOTES section's own internal structure — its entry numbering as a
self-consistent sequence, and Butler's cross-references *between notes*
(`[72] [ see note [64] : ]`).  `RESUME.md` names it as unused.  It is
corroborating and is reported as such, not as the locating clause.

---

## The audit — what actually failed, and what did not

**One clause failed on first execution, and its cause was a defect in PG
#1727 rather than in this rule.**  Clause 4 asserted that the FOOTNOTES
section's entries are numbered 1…N contiguously.  It fired: 186 entries
matched where the maximum is 187, and **note 29 was missing**.  Note 29's
opener is **transposed** — `29[] [ The geography of the Ægean…` where all 186
others read `[29] [ …`.  That is a real transcription defect in the published
file (**R-3** of `findings-v1.md`); it is harmless to this package
because the served editions carry no apparatus, but it is the first thing
anyone has found by reading the FOOTNOTES section's own structure, which is
the channel `RESUME.md` names as unused.  **The fix is not a tolerant parse.**
A tolerant parse would have swallowed the defect and licensed a second one.
The malformed opener is matched *explicitly*, counted, asserted to be exactly
`[29]`, and printed by name, so this clause fails again the day PG's next
revision changes it in either direction.

**Clauses 0–3 passed on first execution, and that is worth stating plainly
rather than claiming a failure that did not happen.**  Six audits before this
one failed the rule as first written and the last two failed three times each,
so a clean first run needs an explanation.  It has one, and it is not luck:
each of the three traps the package's own record names was designed against
*before* the first run, having been read out of the record rather than
rediscovered.

  * **A count of zero reported as a pass** — the ninth and tenth rules' shared
    failure, and the shape the brief names.  Clause 1's verdict is the **pair**
    `(occurrences, last recovered token index)`, and the clause **exits** on
    any count that is not exactly 1.  The proximate cause of both earlier
    zeroes was PG's footnote numerals set flush against a word, so this rule
    emits a bit only from a token's **first letter** and a trailing numeral
    cannot reach it; clause 0 then asserts the served chapter carries no digit
    of its own, so clause 2's marker-stripping cannot destroy a real number.
  * **"The chapter nearly matches itself"** — the tenth rule's clause-2 failure.
    Clause 3 excises a **guard band of the chapter's own full length** on each
    side of the located span before measuring the neighbourhood, so no
    alignment of the chapter against itself can survive.  The answer, 114 bits
    against 3,347, is the real second-best.
  * **A control that cannot fail** — D18 clause (a).  `lower_a_capital` raises
    rather than returning unchanged if the chapter has no interior capital.

**The controls were then made harder, because four letter-flips are not an
audit.**  The two added controls plant the defect this whole family of rules
exists to catch and which none of the eleven had ever been made to face: the
**B03-P038 splice** (a paragraph replaced by the served *modern* edition's own
paragraph for the same position — same events, same proper nouns) and a
paragraph of Butler's **own Book VI** moved into Book VII.  Both fire.  A rule
that catches a lowered capital and not a spliced paragraph would have been
answering the easy question.

**Two blindnesses are declared**, both carried by clause 2 and one of them
independently by the ninth rule.

"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from controls import control, declare_blind, summary          # noqa: E402

PG = ROOT / "source-texts" / "pg1727-butler-1900.txt"
SERVED = ROOT.parents[2] / "app" / "public" / "data" / "editions" / "odyssey-original-en.json"
SOURCE = ROOT / "book07" / "source-book7.json"

LETTER = re.compile(r"[^\W\d_]", re.UNICODE)


# ---------------------------------------------------------------- the channel

def case_bits(text):
    """The capitalization bitstring, and the token list it indexes.

    A token emits a bit only if it CONTAINS a letter — see the audit note above.  The bit is
    taken from the token's FIRST letter, wherever in the token it falls, so
    `“Queen` and `Queen` give the same bit and a trailing footnote numeral
    (`god.57`) cannot change one.
    """
    bits, toks = [], []
    for tok in text.split():
        m = LETTER.search(tok)
        if not m:
            continue
        bits.append("1" if m.group(0).isupper() else "0")
        toks.append(tok)
    return "".join(bits), toks


def count_all(hay, needle):
    """Every occurrence, not the first — and the END index of each."""
    out, i = [], hay.find(needle)
    while i != -1:
        out.append(i)
        i = hay.find(needle, i + 1)
    return len(out), out


def strip_marker(tok):
    """PG's footnote numerals are set flush against the token they follow
    (`god.57`, `island,55`).  The served edition strips them.  Remove a
    trailing run of digits, and nothing else."""
    return re.sub(r"\d+$", "", tok)


# ---------------------------------------------------------- clause 4, the new channel

def footnotes_block(raw):
    """The FOOTNOTES section: from the LAST line that is exactly `FOOTNOTES:`
    (there are two — the PREFACE has its own) to PG's end marker."""
    lines = raw.split("\n")
    starts = [i for i, l in enumerate(lines) if l.strip() == "FOOTNOTES:"]
    assert len(starts) == 2, "expected two FOOTNOTES: lines, found %d" % len(starts)
    end = next(i for i, l in enumerate(lines) if l.startswith("*** END"))
    return "\n".join(lines[starts[-1] + 1:end]), starts[-1]


#: Entry openers.  The second alternative is not defensive programming — it is
#: a transcription defect in PG #1727 that this clause found (records finding R-3 of
#: `findings-v1.md`): note 29 opens `29[] [ The geography of the Ægean…` where
#: every other one of the 187 opens `[29] [ …`.  The brackets are transposed.
#: It is matched EXPLICITLY and counted, so the clause reports the malformation
#: by name rather than parsing tolerantly and licensing it in silence.
ENTRY = re.compile(r"(?m)^(?:\[(\d+)\]|(\d+)\[\])")


def apparatus(raw):
    """Parse the apparatus: (numbers, cross-reference edges, malformed)."""
    block, _ = footnotes_block(raw)
    nums, malformed = [], []
    for m in ENTRY.finditer(block):
        n = int(m.group(1) or m.group(2))
        nums.append(n)
        if m.group(2):
            malformed.append(n)
    # every `note [m]` reference that occurs INSIDE a note body
    entries = ENTRY.split(block)[1:]
    edges = []
    for i in range(0, len(entries), 3):
        n = int(entries[i] if entries[i] is not None else entries[i + 1])
        for mm in re.finditer(r"note\s*\[(\d+)\]", entries[i + 2]):
            edges.append((n, int(mm.group(1))))
    return nums, edges, malformed


def main():
    raw = PG.read_text(encoding="utf-8")
    chapter = " ".join(json.load(open(SOURCE))["paragraphs"])

    # clause 0 — premises, asserted rather than assumed
    served = json.load(open(SERVED))
    ch7 = [c for c in served["chapters"] if c["number"] == 7][0]
    assert [" ".join(p.split()) for p in ch7["paragraphs"]] == \
           [" ".join(p.split()) for p in json.load(open(SOURCE))["paragraphs"]], \
           "source-book7.json is not the served chapter 7"
    assert not re.search(r"\d", chapter), \
        "clause 0: the served chapter contains a digit; the marker-stripping " \
        "of clause 2 would then be able to destroy a number Butler printed"
    print("clause 0: source-book7.json IS the served chapter 7 (29 paragraphs, "
          "whitespace-normalized), and carries no digit of its own")

    body_end = footnotes_block(raw)[1]
    body = "\n".join(raw.split("\n")[:body_end])

    pg_bits, pg_toks = case_bits(body)
    ch_bits, ch_toks = case_bits(chapter)

    # ---- clause 1: locate, reading case and nothing else
    n, ats = count_all(pg_bits, ch_bits)
    # the verdict is the PAIR, and any count but 1 is a failure.
    verdict1 = (n, (ats[0] + len(ch_bits) - 1) if n == 1 else None)
    print("clause 1: the chapter's case shape is %d bits (%.1f%% capitalized) "
          "and occurs %d time(s) in PG #1727's body; verdict pair %r"
          % (len(ch_bits), 100.0 * ch_bits.count("1") / len(ch_bits), n, verdict1))
    if n != 1:
        sys.exit("clause 1 FAILED: %d occurrences, not 1. Zero is not one." % n)

    # ---- clause 2: confirm with the characters restored, at the span the
    #      BIT INDEX gives — never by searching for the text
    lo, hi = ats[0], ats[0] + len(ch_bits)
    got = [strip_marker(t) for t in pg_toks[lo:hi]]
    want = ch_toks
    assert len(got) == len(want)
    bad = [(i, a, b) for i, (a, b) in enumerate(zip(got, want)) if a != b]
    print("clause 2: characters restored at tokens %d…%d — %d of %d tokens "
          "differ from the served chapter after trailing footnote numerals "
          "are removed" % (lo, hi - 1, len(bad), len(want)))
    if bad:
        for i, a, b in bad[:10]:
            print("    token %d: PG %r  served %r" % (lo + i, a, b))
        sys.exit("clause 2 FAILED")

    # ---- clause 3: the neighbourhood, with a GUARD BAND (the guard band)
    band = len(ch_bits)
    rest = pg_bits[:max(0, lo - band)] + pg_bits[min(len(pg_bits), hi + band):]
    best = 0
    lo_, hi_ = 0, len(ch_bits)
    while lo_ <= hi_:                       # binary search on shared run length
        mid = (lo_ + hi_ + 1) // 2
        if any(ch_bits[i:i + mid] in rest for i in range(0, len(ch_bits) - mid + 1, 1)):
            best, lo_ = mid, mid + 1
        else:
            hi_ = mid - 1
    print("clause 3: the longest case shape this chapter shares with any part "
          "of PG outside a guard band of its own length on each side is "
          "**%d bits**, against the chapter's %d — reported, not bounded"
          % (best, len(ch_bits)))

    # ---- clause 4: the FOOTNOTES section's own internal structure
    nums, edges, malformed = apparatus(raw)
    assert nums == list(range(1, len(nums) + 1)), \
        "the apparatus is not numbered 1..N contiguously: %r" % nums[:5]
    assert malformed == [29], \
        "the set of malformed entry openers moved from [29] to %r" % malformed
    assert all(1 <= b <= len(nums) and a != b for a, b in edges), \
        "a note cross-references a note that does not exist, or itself"
    markers = sorted(int(m) for m in re.findall(r"\d+", " ".join(pg_toks[lo:hi])))
    contiguous = markers == list(range(markers[0], markers[-1] + 1))
    print("clause 4: the apparatus numbers 1…%d contiguously — but note %d's "
          "opener is transposed, `29[]` for `[29]`, the only one of the %d "
          "(R-3). It carries %d note-to-note cross-references, every "
          "target in range and none self-referential (%s). The markers inside "
          "the located span are %d…%d, %s — a gap would mean the span had "
          "jumped a Book."
          % (len(nums), malformed[0], len(nums), len(edges),
             ", ".join("%d→%d" % e for e in edges),
             markers[0], markers[-1],
             "contiguous and ascending" if contiguous else "NOT CONTIGUOUS"))
    assert contiguous

    # ------------------------------------------------------------- the audit
    def verdict(paras):
        b, _ = case_bits(" ".join(paras))
        k, a = count_all(pg_bits, b)
        return (k, (a[0] + len(b) - 1) if k == 1 else None)

    paras = json.load(open(SOURCE))["paragraphs"]

    def lower_a_capital(ps):
        ps = list(ps)
        for i, p in enumerate(ps):
            toks = p.split()
            for j, t in enumerate(toks):
                m = LETTER.search(t)
                if m and m.group(0).isupper() and j > 0:
                    toks[j] = t[:m.start()] + m.group(0).lower() + t[m.start() + 1:]
                    ps[i] = " ".join(toks)
                    return ps
        raise AssertionError("no interior capital to lower — control is a no-op")

    def drop_a_token(ps):
        ps = list(ps)
        toks = ps[3].split()
        assert len(toks) > 5
        ps[3] = " ".join(toks[:4] + toks[5:])
        return ps

    def swap_paragraphs(ps):
        ps = list(ps)
        ps[0], ps[1] = ps[1], ps[0]
        assert ps != list(json.load(open(SOURCE))["paragraphs"])
        return ps

    def swap_two_words(ps):
        """A capitalized word and a lower-case one exchange places — the
        clause-movement shape, which the case channel DOES see."""
        ps = list(ps)
        toks = ps[0].split()
        i = next(k for k, t in enumerate(toks)
                 if LETTER.search(t) and LETTER.search(t).group(0).isupper() and k > 0)
        j = next(k for k, t in enumerate(toks)
                 if LETTER.search(t) and not LETTER.search(t).group(0).isupper())
        toks[i], toks[j] = toks[j], toks[i]
        ps[0] = " ".join(toks)
        return ps

    def splice_a_modern_paragraph(ps):
        """**The B03-P038 defect, planted.**  The served `original-en`'s Book 3
        ¶38 is 196 words of the served `modern-en`'s own ¶38 (ledger A3).  That
        is the failure this whole family of rules exists to catch, and every
        rule in the package should be made to face it rather than only
        letter-flips.  Paragraph 5 is replaced by the served MODERN edition's
        own chapter-7 paragraph 5 — a paragraph about the same events, with the
        same proper nouns, in the same position."""
        modern = json.load(open(SERVED.with_name("odyssey-modern-en.json")))
        mp = [c for c in modern["chapters"] if c["number"] == 7][0]["paragraphs"]
        ps = list(ps)
        assert ps[4] != mp[4]
        ps[4] = mp[4]
        return ps

    def borrow_a_neighbouring_chapter(ps):
        """A paragraph of Butler's own Book VI put into Book VII — same author,
        same translator, same printing, adjacent in the file."""
        served_ = json.load(open(SERVED))
        ch6 = [c for c in served_["chapters"] if c["number"] == 6][0]["paragraphs"]
        ps = list(ps)
        ps[10] = ch6[10]
        return ps

    control("a paragraph replaced by the served MODERN edition's own "
            "paragraph — the B03-P038 splice, planted",
            paras, splice_a_modern_paragraph(paras), verdict)
    control("a paragraph of Butler's own Book VI put into Book VII",
            paras, borrow_a_neighbouring_chapter(paras), verdict)
    control("a capital inside a sentence is lowered — case IS the channel",
            paras, lower_a_capital(paras), verdict)
    control("one token deleted — the bit count changes",
            paras, drop_a_token(paras), verdict)
    control("two paragraphs swapped — ORDER is in the bitstring",
            paras, swap_paragraphs(paras), verdict)
    control("a capitalized and a lower-case word exchange places",
            paras, swap_two_words(paras), verdict)

    declare_blind("one lower-case word replaced by another lower-case word"
                  ""
                  ,
                  because="the bit is taken from the token's first letter's "
                          "case alone, so any lower-for-lower substitution of "
                          "any length leaves the bitstring identical",
                  carried_by="clause 2, which restores the characters at the "
                             "located span and compares them token for token")
    declare_blind("a punctuation mark changed, added or removed",
                  because="punctuation is destroyed before a bit is emitted, "
                          "and a token containing no letter emits none at all",
                  carried_by="clause 2, and independently by the NINTH rule, "
                             "whose whole instrument is the pointing")
    print(summary())
    print("\nBook 7's source is verified by an eleventh kind of rule: the case "
          "shape locates it uniquely, the characters confirm it, the "
          "neighbourhood is reported, and the apparatus's own internal "
          "structure corroborates the span.")


if __name__ == "__main__":
    main()
