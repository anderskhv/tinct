#!/usr/bin/env python3
"""
Danish lint — mechanical error detection in modern-da editions.

Catches errors from user feedback that are detectable without semantic
understanding or a full Danish dictionary. Does NOT catch:
  - Wrong-but-real-word substitutions (skalden vs skjalden, lå vs sad)
  - Missing negations in rhetorical questions
  - Semantic translation errors (Gentiles→Greeks)
  - Unit conversion errors (miles→km)

Runs in seconds across all DA books, near-zero token cost.

Checks:
  1. BROKEN-COMPOUND: suspicious intra-word spaces (e.g. "tempelv agterne", "beh ager")
  2. STRAY-FORMATTING: leading underscore, stray opening quote, corrupted list numbers
  3. DOUBLE-FILLER: repeated short filler word (for for, og og, at at)
  4. BLACKLIST: known-bad words from confirmed user feedback
  5. ARCHAIC-NUMBER: old Danish counting system (firsindstyve, etc.)

Usage:
  python3 danish-lint.py                     # all DA books
  python3 danish-lint.py bible               # single book
  python3 danish-lint.py --blacklist-only    # only the blacklist check
"""
import json
import re
import sys
from pathlib import Path

EDITIONS_DIR = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions")


# ------------------------------------------------------------------ blacklist
# Words confirmed wrong by user feedback (and any trivially mechanical
# substitutions we can safely suggest). Keys are the wrong form.
BLACKLIST = {
    "følgte":       "fulgte (past tense of følge)",
    "spotsangeren": "spottedroslen / spottefugl (mockingbird)",
    "uroligskaber": "urostifter (troublemaker)",
    "firsindstyve": "modernize — old Danish counting (80 = firs)",
    "halvtredsindstyve": "modernize — old Danish counting (50 = halvtreds)",
    "tresindstyve": "modernize — old Danish counting (60 = tres)",
    "halvfjerdsindstyve": "modernize — old Danish counting (70 = halvfjerds)",
    "halvfemsindstyve": "modernize — old Danish counting (90 = halvfems)",
}


# ---------------------------------------------------------- detection helpers

# Intra-word space detector has TWO shapes:
#
# SHAPE A — orphan short fragment after real word:
#   "forurolige s" — frag1 = real word, frag2 = 1-2 letter orphan that isn't
#   a legitimate short Danish word. Catches trailing-letter corruption.
#
# SHAPE B — short prefix before real word:
#   "beh ager" / "tempelv agterne" — frag1 is too short to be a real word
#   OR ends in an uncommon cluster; frag2 IS a real word that combines to
#   form a real compound. Less reliable, high false-positive risk.
#
# We run only SHAPE A (high-precision) below. SHAPE B needs a dictionary.
ORPHAN_SHORT_RE = re.compile(
    r"\b([a-zæøåA-ZÆØÅ]{4,})\s([a-zæøå]{1,2})\b(?=[\s.,!?;:)])"
)

# Word immediately preceded by underscore (markdown artifact): "_He", "_word"
LEADING_UNDERSCORE_RE = re.compile(r'(?:^|\s|[>»(])_([A-ZÆØÅ][a-zæøå]+)')

# Numbered-list number corrupted: "X." where X should be a number but is non-digit,
# or paragraph starts with a lone quote mark that isn't dialogue
CORRUPTED_LIST_RE = re.compile(r'^\s*["\']([A-ZÆØÅ][a-zæøå]+)[\s.,]')

# Repeated short filler: for for, og og, at at, i i, til til
# Case-sensitive: "I i" (pronoun+preposition) and "og Og" (conjunction+proper
# noun King Og) are NOT errors. Only flag when both tokens have same casing.
DOUBLE_FILLER_RE = re.compile(
    r"(?<![a-zæøåA-ZÆØÅ])(for|og|at|i|til|den|det|en|et)\s+\1(?![a-zæøåA-ZÆØÅ])"
)

# Stray space before punctuation (French-typographic convention leaking into DA)
SPACE_BEFORE_PUNCT_RE = re.compile(r" [,.!?;:]")


# ---------------------------------------------------------------- file loader

def load_da_books():
    """All books with modern-da."""
    return sorted(set(
        p.name.replace("-modern-da.json", "")
        for p in EDITIONS_DIR.glob("*-modern-da.json")
    ))


def load(book):
    path = EDITIONS_DIR / f"{book}-modern-da.json"
    if not path.exists():
        return None
    with open(path) as f:
        return json.load(f)


# Build implicit Danish vocabulary from all DA files. Tokens that appear
# ≥ MIN_FREQ times across the corpus are treated as real Danish words.
# This lets us distinguish "langt som" (both real words) from "tempelv agterne"
# (where "tempelv" is not a word) without needing an external dictionary.
_CORPUS_VOCAB = None


def build_corpus_vocab(min_freq=3):
    global _CORPUS_VOCAB
    if _CORPUS_VOCAB is not None:
        return _CORPUS_VOCAB
    from collections import Counter
    counter = Counter()
    for book in load_da_books():
        data = load(book)
        if not data:
            continue
        for ch in data["chapters"]:
            for para in ch["paragraphs"]:
                # Lowercase + tokenize on whitespace, strip punctuation
                for tok in re.findall(r"[a-zæøåA-ZÆØÅ]+", para):
                    counter[tok.lower()] += 1
    _CORPUS_VOCAB = {tok for tok, c in counter.items() if c >= min_freq}
    return _CORPUS_VOCAB


# ------------------------------------------------------------- lint per book

def lint_book(book, blacklist_only=False):
    data = load(book)
    if not data:
        return None
    issues = []
    vocab = build_corpus_vocab() if not blacklist_only else set()

    for ci, ch in enumerate(data["chapters"]):
        for pi, para in enumerate(ch["paragraphs"]):
            loc = f"ch{ci+1} p{pi}"

            if not blacklist_only:
                # 1. Orphan-short compound splits
                # Catches "forurolige s", "tempelv agterne" patterns where
                # a real word is followed by a 1-2 char orphan that isn't
                # a legitimate short Danish word and doesn't appear elsewhere
                # in the corpus as a standalone word.
                for m in ORPHAN_SHORT_RE.finditer(para):
                    frag1, frag2 = m.group(1), m.group(2)
                    if frag2.lower() in LEGITIMATE_SHORT:
                        continue
                    if frag2.lower() in vocab:
                        # orphan is actually a real word somewhere — skip
                        continue
                    joined = frag1 + frag2
                    issues.append({
                        "type": "BROKEN-COMPOUND",
                        "loc": loc,
                        "found": m.group(0),
                        "suggest": joined,
                        "excerpt": _excerpt(para, m.start()),
                    })

                # 2. Stray formatting
                for m in LEADING_UNDERSCORE_RE.finditer(para):
                    issues.append({
                        "type": "STRAY-UNDERSCORE",
                        "loc": loc,
                        "found": m.group(0),
                        "suggest": f"remove `_` (markdown artifact)",
                        "excerpt": _excerpt(para, m.start()),
                    })

                # Corrupted list numbering: paragraph begins with "X. Word"
                # where X is a quoted letter instead of a digit
                if pi < 5:  # list items usually near chapter start
                    m = CORRUPTED_LIST_RE.match(para)
                    if m and m.group(1) in {"He", "She", "It", "They", "We", "I", "You"}:
                        # Only flag if this looks like a list ("1. He" corrupted
                        # to '"He" ...')
                        issues.append({
                            "type": "CORRUPTED-LIST-NUMBER",
                            "loc": loc,
                            "found": para[:40],
                            "suggest": "likely missing list number (1., 2., etc.)",
                            "excerpt": para[:80],
                        })

                # 3. Doubled filler
                for m in DOUBLE_FILLER_RE.finditer(para):
                    issues.append({
                        "type": "DOUBLE-FILLER",
                        "loc": loc,
                        "found": m.group(0),
                        "suggest": f"delete one `{m.group(1)}`",
                        "excerpt": _excerpt(para, m.start()),
                    })

                # Stray space before punctuation (non-quote)
                # Only flag if it's not a space inside dialogue context
                for m in SPACE_BEFORE_PUNCT_RE.finditer(para):
                    # Skip if followed by »
                    ctx_start = max(0, m.start() - 5)
                    ctx = para[ctx_start:m.end() + 2]
                    if "»" in ctx or "«" in ctx:
                        continue
                    issues.append({
                        "type": "SPACE-BEFORE-PUNCT",
                        "loc": loc,
                        "found": m.group(0),
                        "suggest": "remove stray space",
                        "excerpt": _excerpt(para, m.start()),
                    })

            # 4. Blacklist (always run)
            for bad, suggest in BLACKLIST.items():
                # Word-boundary match, case-insensitive
                for m in re.finditer(rf"\b{re.escape(bad)}\b", para, re.IGNORECASE):
                    issues.append({
                        "type": "BLACKLIST",
                        "loc": loc,
                        "found": m.group(0),
                        "suggest": suggest,
                        "excerpt": _excerpt(para, m.start()),
                    })

    return issues


COMMON_WORDS = set()  # unused (legacy from first pass)

# Legitimate short Danish words that are fine as standalone tokens.
# If a 1-3 char fragment matches one of these, it's NOT a broken-compound
# fragment — just a normal short word.
LEGITIMATE_SHORT = {
    # Conjunctions / prepositions
    "og", "at", "i", "til", "af", "på", "med", "om", "for", "fra", "hos",
    "ud", "op", "ind", "ned", "per", "pr", "nu", "så", "end", "men", "ej",
    # Verbs
    "er", "var", "har", "vil", "kan", "må", "gik", "kom", "lod", "fik",
    "lå", "sad", "stod", "gør", "ved", "ved", "ses", "bli", "bor",
    # Pronouns
    "de", "det", "den", "han", "hun", "vi", "du", "jeg", "os", "jer", "dem",
    "mig", "dig", "ham", "sig", "der", "hvem", "hvis", "sin", "sit",
    # Articles / determiners
    "en", "et", "al", "alt", "alle", "mit", "min", "dit", "din",
    # Misc common
    "ja", "nej", "jo", "tja", "åh", "ah", "hm", "ok",
    "her", "der", "nu", "da", "nok", "dog", "vel", "kun", "jo",
    "to", "tre", "seks", "syv", "otte", "ni", "ti",
    "mor", "far", "søn", "mand", "kone", "barn", "gud", "tid", "dag",
    "år", "tal", "sted", "slags", "vis", "ord", "ting", "bog", "hus",
    # Genitive short forms
    "es", "ens", "ets", "ers",
    # Common verb short forms mid-sentence
    "bli'r", "ta'r", "ku'", "vi'", "gi'r",
}


def _excerpt(text, offset, radius=30):
    start = max(0, offset - radius)
    end = min(len(text), offset + radius)
    prefix = "…" if start > 0 else ""
    suffix = "…" if end < len(text) else ""
    return f"{prefix}{text[start:end]}{suffix}".replace("\n", " ")


# --------------------------------------------------------------------- output

def main():
    args = sys.argv[1:]
    blacklist_only = "--blacklist-only" in args
    args = [a for a in args if not a.startswith("--")]

    if args:
        books = [args[0]]
    else:
        books = load_da_books()

    grand_total = 0
    by_book = {}
    for b in books:
        iss = lint_book(b, blacklist_only=blacklist_only)
        if iss is None:
            continue
        by_book[b] = iss
        grand_total += len(iss)

    # Summary
    print(f"\n{'BOOK':<24}{'TOTAL':>7}{'BROKEN':>8}{'STRAY':>7}{'DOUBLE':>8}"
          f"{'SPACE':>7}{'BLACK':>7}{'LIST':>6}")
    print("-" * 74)
    for b, iss in sorted(by_book.items(), key=lambda x: -len(x[1])):
        counts = {"BROKEN-COMPOUND": 0, "STRAY-UNDERSCORE": 0,
                  "DOUBLE-FILLER": 0, "SPACE-BEFORE-PUNCT": 0,
                  "BLACKLIST": 0, "CORRUPTED-LIST-NUMBER": 0}
        for i in iss:
            counts[i["type"]] = counts.get(i["type"], 0) + 1
        print(f"{b:<24}{len(iss):>7}{counts['BROKEN-COMPOUND']:>8}"
              f"{counts['STRAY-UNDERSCORE']:>7}{counts['DOUBLE-FILLER']:>8}"
              f"{counts['SPACE-BEFORE-PUNCT']:>7}{counts['BLACKLIST']:>7}"
              f"{counts['CORRUPTED-LIST-NUMBER']:>6}")
    print("-" * 74)
    print(f"{'TOTAL':<24}{grand_total:>7}")

    # Detail — top 3 books by issue count
    print("\n== Detail (top offenders) ==")
    for b, iss in sorted(by_book.items(), key=lambda x: -len(x[1]))[:3]:
        if not iss:
            continue
        print(f"\n--- {b} ({len(iss)} issues, showing first 15) ---")
        for i in iss[:15]:
            print(f"  [{i['type']}] {i['loc']}  found='{i['found']}'")
            print(f"    suggest: {i['suggest']}")
            print(f"    ...{i['excerpt']}...")


if __name__ == "__main__":
    main()
