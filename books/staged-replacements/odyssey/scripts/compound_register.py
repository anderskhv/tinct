#!/usr/bin/env python3
"""One disposition line per H.1 compound pair, in every Book — ledger **A5(c)**,
and the answer to **A4(ii)** in the negative.

**The vendored word list is declined.** Book 7's round 1 recommends against it
and the reasoning is right on both halves:

* *Unnecessary.* `app/public/data/editions/*-modern-en.json` is **100
  modern-English editions, 151 MB on disk, 75,231 distinct word types**, already
  in this repository and already a product dependency. It attests
  `mountaintop`, `mountaintops`, `seashore`, `hilltop`, `bedchamber`,
  `storeroom`, `townspeople`, `gatehouse`, `nightfall`, `daybreak` and
  `wineskin`, and correctly attests none of `landingplace`, `outercourt`,
  `chiefmen`, `ninedays`, `winetubs`.
* *Insufficient.* A word list answers *"is `mountaintop` a word?"* **D15 asks
  which of two forms**, and a list of single words cannot represent the open
  form at all. A corpus can, and its answer here is the one worth having:
  `mountaintop` leads `mountain top` about ten to one, but **`mountaintops`
  against `mountain tops` is close**, which is exactly what a binary list would
  have flattened into a false verdict.

**A correction to A5(c)'s own claim for this register, with its evidence.**
A5(c) says the register *"would have caught `mountain tops` at Book 5 before a
successor was owed"*. **It would not have.** `PROBES` keeps `mountain tops` in
the evidence file after the Books that carried it stopped carrying it, exactly
so this can be checked rather than asserted, and the corpus gives **closed 7 in
7 editions against 9 open** — short of the margin on both counts, so this
register rules it `kept open, standard` and says nothing. The ruling that closed
it was the coordinator's, on D15's own words, and no corpus instrument produced
it. What the register **would** have caught is `sea shore` (**closed 56 in 17
editions against 0 open**), which cost the package three successors, and
`bed chamber` (28 in 11). And what it did catch, the first time it ran: **`store-room`
in accepted Book 2** (closed 31 in 9 editions against 1 hyphenated and 1 open) —
a live compound no reader, no review round and no check had ever named, folded
into the successor Book 2 was already owed for `councillors` so that it cost
nothing extra.

So the instrument is the corpus, with the margin A5(b) states — **the closed
form must lead the open form three to one AND appear in at least three distinct
editions** — and the corpus is never a sole authority: the caveat A5(b) records
stands, that it is machine-generated and a commit on the default branch reports
nine of the hundred editions are largely the original text.

**And the real fix is the register, not the instrument.** Blind spot 8 of Book
7's round 1: *twenty-three H.1 compound pairs are printed and none is
dispositioned* — the check did its work and the record does not say what a
reader decided. Twenty-odd lines a Book, no dependency, and it would have caught
`mountain tops` at Book 5 before two successors were owed.

Dispositions:

* `closed` — the corpus puts the closed form ahead by the margin. **Live**: the
  Book must close it, and the script exits non-zero so it cannot be printed and
  ignored.
* `kept open, standard` — the closed form is attested but does not lead by the
  margin, so the open form stands. `mountain tops` was here before A5 ruled it.
* `not a compound` — the closed form has no attestation anywhere in 100
  editions. These are two ordinary words the head-noun filter paired.

The served editions are **read only**. Nothing under `app/public/data/` is
written by this package, ever.

Run: `python3 scripts/compound_register.py` (writes §H.1 into every
`bookNN/continuity.md` and `compound-corpus.json`).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent.parent.parent
EDITIONS = REPO / "app/public/data/editions"
CACHE = ROOT / "scripts/compound-corpus.json"
sys.path.insert(0, str(Path(__file__).resolve().parent))
from checks import compound_pairs, load                         # noqa: E402

LEAD = 3.0          # the closed form must lead the open form this many times
MIN_EDITIONS = 3    # and appear in at least this many distinct editions

# ---------------------------------------------------- M-8: count the LEXEME
# **Book 8's round 1, minor finding M-8.** The register was keyed on the
# inflected surface bigram, and one lexeme therefore got two opposite verdicts:
#
#     mountain top    closed 10 in 6 editions against 1 open   -> `closed`, LIVE
#     mountain tops   closed  7 in 7 editions against 9 open   -> `kept open`
#
# It would have told a Book to close the singular and leave the plural, in the
# same paragraph. English compounding is a property of the LEXEME, not of the
# inflected form, and the plural's 7-against-9 is thin data being read as a
# contrary verdict where the singular's 10-against-1 is decisive.
#
# So singular and plural are merged before the margin is applied, and **both
# figures are reported** — merged and split — because the case where they
# disagree is exactly the case a reader needs to see. The review's own
# arithmetic is confirmed by the merge rather than rescued by it: 17 closed
# against 10 open is 1.7x, still short of the margin. What the evidence says
# is that the corpus attests `mountaintop` decisively and `mountaintops`
# weakly, and no arithmetic over these counts closes `mountain tops`.


def siblings(pair):
    """The pair's other number. `mountain top` <-> `mountain tops`; `sea
    shore` <-> `sea shores`. Head-noun inflection only: the modifier is not
    pluralized in English compounds."""
    a, b = pair.split()
    out = set()
    if b.endswith("ies") and len(b) > 4:
        out.add("%s %sy" % (a, b[:-3]))
    elif b.endswith("es") and b[-3:-2] in "sxzh":
        out.add("%s %s" % (a, b[:-2]))
    elif b.endswith("s") and not b.endswith("ss"):
        out.add("%s %s" % (a, b[:-1]))
    else:
        out.add("%s %ss" % (a, b))
        if b.endswith("y"):
            out.add("%s %sies" % (a, b[:-1]))
        if b[-1:] in "sxzh":
            out.add("%s %ses" % (a, b))
    return {q for q in out if q != pair}


def merged(ev, pair):
    """Evidence for the LEXEME: this pair plus whichever of its siblings the
    corpus was scanned for. Returns (counts, the sibling pairs folded in)."""
    tot = {k: [ev[pair][k][0], ev[pair][k][1]] for k in ev[pair]}
    folded = []
    for q in sorted(siblings(pair)):
        if q in ev:
            folded.append(q)
            for k in tot:
                tot[k][0] += ev[q][k][0]
                # editions are counted per form and are not disjoint across
                # the two numbers, so the merged edition count is the LARGER
                # of the two rather than the sum. Understating it is the safe
                # direction for a margin that gates on it.
                tot[k][1] = max(tot[k][1], ev[q][k][1])
    return tot, folded


# ------------------------------------- the disposition the register lacked
# **Book 8's round 1, §6.3's second condition.** `mountain tops` was closed by
# ledger **A5(a)**, on D15's own words, across two successors — and the
# register, which knows nothing of the ledger, ruled it `kept open, standard`
# and printed a margin that quietly contradicted an accepted decision. Neither
# verdict was wrong on its own terms and the pair of them was unreadable.
#
# `RULED` is the missing disposition. A pair in it has been decided by a
# coordinator ruling that is not the corpus's to overturn; the register
# reports the ruling, prints the corpus evidence beside it, and says which
# way the evidence goes. It is short and every row names its decision.
RULED = {
    "mountain tops": "ledger **A5(a)**, on D15's own words (the standard "
                     "American form is closed), across `book05/candidate-v3` "
                     "and `book06/candidate-v3`. The corpus does NOT reach "
                     "the margin either split or merged, and A5(c)'s claim "
                     "that this register would have caught it is withdrawn "
                     "in the ledger. The ruling stands on the rule, not on "
                     "the count.",
    "mountain top": "the singular of a pair ruled closed at ledger **A5(a)**; "
                    "here the corpus agrees decisively.",
}


def newest(bk):
    d = ROOT / ("book%02d" % bk)
    vs = sorted(int(p.stem.split("-v")[1]) for p in d.glob("candidate-v*.json"))
    return "book%02d/candidate-v%d.json" % (bk, vs[-1])


def books():
    return {bk: newest(bk) for bk in range(1, 25)
            if (ROOT / ("book%02d" % bk)).is_dir()}


def scan(pairs):
    """Count each pair's closed, hyphenated and open forms across the served
    modern-English editions. **READ ONLY** — nothing under `app/public/data/`
    is ever written by this package.

    One tokenizing pass per edition, not one regex per form per edition. The
    first version ran 162 pairs x 3 forms x 100 files of `re.findall` over
    1.5 MB apiece, which is tens of gigabytes of scanning and did not finish.
    Here each file is tokenized once; closed and hyphenated forms are looked up
    in a token counter, and open forms in a bigram counter restricted to the
    first words any pair needs."""
    from collections import Counter
    need = sorted(pairs)
    firsts = {q.split()[0] for q in need}
    closed = {q: [0, 0] for q in need}      # [occurrences, editions]
    hyph = {q: [0, 0] for q in need}
    open_ = {q: [0, 0] for q in need}
    files = sorted(EDITIONS.glob("*-modern-en.json"))
    if not files:
        sys.exit("compound_register.py: no served modern-en editions found at "
                 "%s" % EDITIONS)
    tok = re.compile(r"[a-z]+(?:-[a-z]+)*")
    for k, f in enumerate(files, 1):
        words = tok.findall(f.read_text(encoding="utf-8").lower())
        uni = Counter(words)
        bi = Counter()
        prev = None
        for w in words:
            if prev in firsts:
                bi[(prev, w)] += 1
            prev = w
        for q in need:
            a, b = q.split()
            for cnt, table in ((uni.get(a + b, 0), closed),
                               (uni.get(a + "-" + b, 0), hyph),
                               (bi.get((a, b), 0), open_)):
                if cnt:
                    table[q][0] += cnt
                    table[q][1] += 1
        sys.stdout.write("  scanned %3d/%d\r" % (k, len(files)))
        sys.stdout.flush()
    sys.stdout.write(" " * 40 + "\r")
    return {q: dict(closed=closed[q], hyphenated=hyph[q], open=open_[q])
            for q in need}, len(files)


# Pairs always scanned and recorded even when no Book still carries them, so
# the evidence file says what the instrument WOULD have ruled. `mountain tops`
# is here for a reason that corrects the ledger — see A5(c) in the docstring.
PROBES = ["mountain tops", "sea shore", "store room", "bed chamber"]


def candidate_form(text, pair):
    """Which of the three forms this Book's candidate actually writes."""
    a, b = pair.split()
    for form, name in ((a + b, "closed"), (a + "-" + b, "hyphenated"),
                       (a + " " + b, "open")):
        if re.search(r"(?<![a-z-])" + re.escape(form) + r"(?![a-z-])",
                     text, re.I):
            return name, form
    return "open", a + " " + b


def disposition(ev, mine, pair=None, allev=None):
    """`mine` is (form-name, the literal form) the candidate writes.

    The margin is applied to the LEXEME (M-8), and the split figures are
    printed beside the merged ones whenever the two disagree."""
    split = ev
    note = ""
    if pair is not None and allev is not None:
        ev, folded = merged(allev, pair)
        if folded:
            note = (" — merged with %s for the lexeme (M-8): split, this form "
                    "alone is closed %d in %d against %d open"
                    % (", ".join("`%s`" % q for q in folded),
                       split["closed"][0], split["closed"][1],
                       split["open"][0]))
    c, ce = ev["closed"]
    h, _he = ev["hyphenated"]
    o, _oe = ev["open"]
    other = max(h, o)
    if pair in RULED:
        return ("ruled closed against the corpus",
                "**%s** Corpus (lexeme): closed %d in %d editions against %d "
                "hyphenated and %d open — %s the margin.%s"
                % (RULED[pair], c, ce, h, o,
                   "reaching" if (c >= LEAD * max(other, 1)
                                  and ce >= MIN_EDITIONS) else "SHORT of",
                   note))
    if c == 0:
        return ("not a compound",
                "the closed form is attested nowhere in 100 editions")
    if mine[0] == "closed":
        return ("closed",
                "the candidate already writes the closed form; corpus closed "
                "%d in %d editions against %d hyphenated and %d open%s"
                % (c, ce, h, o, note))
    if c >= LEAD * max(other, 1) and ce >= MIN_EDITIONS:
        return ("closed",
                "the candidate writes `%s`; corpus closed %d in %d editions "
                "against %d hyphenated and %d open — the closed form leads by "
                "the margin%s" % (mine[1], c, ce, h, o, note))
    return ("kept open, standard",
            "the candidate writes `%s`; corpus closed %d in %d editions "
            "against %d hyphenated and %d open — the closed form is attested "
            "but does not lead by the margin (%.0fx and %d editions required)"
            % (mine[1], c, ce, h, o, LEAD, MIN_EDITIONS))


def main():
    bs = books()
    allpairs = {}
    for bk, f in bs.items():
        allpairs[bk] = compound_pairs(load(f))
    texts = {bk: (ROOT / f).read_text(encoding="utf-8")
             for bk, f in bs.items()}
    need = {p for v in allpairs.values() for p in v} | set(PROBES)
    # M-8: the lexeme needs both numbers scanned, whether or not any Book
    # carries both.
    need = sorted(need | {q for p in need for q in siblings(p)})
    if CACHE.exists():
        blob = json.loads(CACHE.read_text(encoding="utf-8"))
        if sorted(blob["evidence"]) == need:
            ev, nfiles = blob["evidence"], blob["editions"]
            print("corpus evidence read from %s (%d pairs, %d editions)"
                  % (CACHE.name, len(ev), nfiles))
        else:
            ev = None
    else:
        ev = None
    if ev is None:
        print("scanning %d served modern-English editions for %d pairs "
              "(READ ONLY)..." % (len(list(EDITIONS.glob('*-modern-en.json'))),
                                  len(need)))
        ev, nfiles = scan(need)
        CACHE.write_text(json.dumps(
            {"note": "Evidence for ledger A5(c), read from "
                     "app/public/data/editions/*-modern-en.json. Those files "
                     "are never written by this package. Regenerate by "
                     "deleting this file and running "
                     "scripts/compound_register.py.",
             "editions": nfiles, "lead": LEAD, "min_editions": MIN_EDITIONS,
             "evidence": ev}, indent=1, sort_keys=True) + "\n",
            encoding="utf-8")

    live = []
    for bk, pairs in sorted(allpairs.items()):
        rows = []
        for p in pairs:
            mine = candidate_form(texts[bk], p)
            klass, why = disposition(ev[p], mine, p, ev)
            rows.append((p, klass, why))
            if klass == "closed" and mine[0] != "closed":
                live.append((bk, p, why))
        write_section(bk, bs[bk], rows, nfiles)
        counts = {}
        for _p, k, _w in rows:
            counts[k] = counts.get(k, 0) + 1
        print("book%02d  %2d pairs  %s" % (bk, len(rows), counts))

    if live:
        print("\n%d pair(s) the corpus says should be CLOSED and are open:"
              % len(live))
        for bk, p, why in live:
            print("  ✗ book%02d  %-22s %s" % (bk, p, why))
        return 1
    print("\nEvery H.1 pair in every Book has a disposition, and none is live.")
    # **The ruled pairs, printed whether or not a Book still carries them.**
    # This is the half §6.3 asked for: the register used to rule
    # `mountain tops` `kept open, standard` and print a margin that
    # contradicted ledger A5(a), an accepted decision that cost two
    # successors, and nothing on the page said the two were talking about the
    # same pair.
    print("\nruled against the corpus (ledger decisions the corpus does not "
          "reach):")
    for q in sorted(RULED):
        if q not in ev:
            print("  %-16s (not scanned)" % q)
            continue
        tot, folded = merged(ev, q)
        sp = ev[q]
        print("  %-16s lexeme: closed %d in %d editions | hyphenated %d | "
              "open %d   %s"
              % (q, tot["closed"][0], tot["closed"][1], tot["hyphenated"][0],
                 tot["open"][0],
                 "(merged with %s)" % ", ".join(folded) if folded
                 else "(no sibling scanned)"))
        print("  %-16s   this form alone: closed %d in %d | open %d"
              % ("", sp["closed"][0], sp["closed"][1], sp["open"][0]))
        lead = tot["closed"][0] / max(max(tot["hyphenated"][0],
                                          tot["open"][0]), 1)
        print("  %-16s   lead %.1fx against a required %.0fx, %d editions "
              "against a required %d — %s"
              % ("", lead, LEAD, tot["closed"][1], MIN_EDITIONS,
                 "REACHES the margin" if (lead >= LEAD
                                          and tot["closed"][1] >= MIN_EDITIONS)
                 else "SHORT of the margin; the ruling stands on D15's words, "
                      "not on the count"))

    print("\nprobes (recorded even where no Book still carries them):")
    for q in PROBES:
        e = ev[q]
        print("  %-16s closed %d in %d editions | hyphenated %d | open %d"
              % (q, e["closed"][0], e["closed"][1], e["hyphenated"][0],
                 e["open"][0]))
    return 0


HEAD = "## H.1 — the compound register"


def write_section(bk, cand, rows, nfiles):
    path = ROOT / ("book%02d/continuity.md" % bk)
    t = path.read_text(encoding="utf-8")
    body = [HEAD, "",
            "Ledger **A5(c)**, and the answer to **A4(ii)** in the negative: "
            "one disposition",
            "line per H.1 compound pair, so the class is a checklist somebody "
            "went through",
            "rather than a blind spot. Generated by "
            "`scripts/compound_register.py` from",
            "`%s`; the evidence is **%d served modern-English editions**, read "
            "only, and" % (cand, nfiles),
            "a pair is `closed` only when the closed form leads the open form "
            "**3x** and",
            "appears in at least **3 distinct editions**. The corpus is "
            "machine-generated and",
            "is never a sole authority (ledger A5(b)).", "",
            "**%d pairs.**" % len(rows), "",
            "| pair | disposition | corpus evidence |", "|---|---|---|"]
    for p, klass, why in rows:
        body.append("| `%s` | **`%s`** | %s |" % (p, klass, why))
    body.append("")
    new = "\n".join(body)
    if HEAD in t:
        i = t.index(HEAD)
        j = t.find("\n## ", i + 1)
        t = t[:i] + new + (t[j + 1:] if j != -1 else "")
    else:
        t = t.rstrip("\n") + "\n\n" + new
    path.write_text(t, encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
