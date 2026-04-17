#!/usr/bin/env python3
"""
Full QA diagnostic across all books with Danish editions.

Checks:
  EN (modern-en vs original-en):
    - Truncation (paragraphs < 0.75 ratio, source >= 20 words)
    - Missing circumflex / accent drops in proper nouns
    - Exclamation mark drop rate
  DA (modern-da vs modern-en):
    - Truncation
    - Quote style (straight " vs »« guillemets)
    - Anglicism blacklist (pretentioner, etc.)
    - Calque patterns
    - Inherited encoding bugs

Output: one row per book, per edition, with counts.

Usage:
    python3 qa-diagnostic.py             # all books
    python3 qa-diagnostic.py odyssey     # one book
"""
import json
import re
import sys
from pathlib import Path
from collections import defaultdict

EDITIONS_DIR = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions")


def load(book_id, key):
    path = EDITIONS_DIR / f"{book_id}-{key}.json"
    if not path.exists():
        return None
    with open(path) as f:
        return json.load(f)


def books_with_da():
    return sorted(set(
        p.name.replace("-modern-da.json", "")
        for p in EDITIONS_DIR.glob("*-modern-da.json")
    ))


def flatten(book):
    return [p for ch in book["chapters"] for p in ch["paragraphs"]]


def count_truncation(source, target):
    if not source or not target:
        return 0, 0
    flagged = 0
    total_eligible = 0
    n_chapters = min(len(source["chapters"]), len(target["chapters"]))
    for ci in range(n_chapters):
        sp = source["chapters"][ci]["paragraphs"]
        tp = target["chapters"][ci]["paragraphs"]
        for pi in range(min(len(sp), len(tp))):
            sw = len(sp[pi].split())
            tw = len(tp[pi].split())
            if sw >= 20:
                total_eligible += 1
                if tw / sw < 0.75:
                    flagged += 1
    return flagged, total_eligible


# --- English checks ---

PROPER_NOUN_ACCENT_CHECKS = [
    # (misspelled_form, correct_form)
    ("Chêniere", "Chênière"),
    ("Cheniere", "Chênière"),
    ("Leonce", "Léonce"),
    ("chenier", "chênière"),  # catches variants
]


def en_issues(book_id, orig, mod):
    out = {}
    if not (orig and mod):
        return out

    orig_text = " ".join(flatten(orig))
    mod_text = " ".join(flatten(mod))

    # Accent drop: proper noun present in orig with accent, corrupted in mod
    drops = 0
    for bad, good in PROPER_NOUN_ACCENT_CHECKS:
        if good in orig_text and mod_text.count(bad) > mod_text.count(good):
            drops += mod_text.count(bad)
    out["accent_drops"] = drops

    # Exclamation retention (rough): if orig has >20 !, check mod kept at least 60%
    orig_excl = orig_text.count("!")
    mod_excl = mod_text.count("!")
    out["excl_orig"] = orig_excl
    out["excl_mod"] = mod_excl
    out["excl_drop_pct"] = round(100 * (1 - mod_excl / orig_excl), 1) if orig_excl > 0 else 0

    return out


# --- Danish checks ---

# Anglicism / calque blacklist — patterns that are *almost always* errors in DA
DA_ANGLICISM_PATTERNS = {
    "pretentioner (should be prætentioner)": r"\bpretentioner\b",
    "til en sprøde (calque of 'to a crisp')": r"til en sprøde",
    "musk- compound (should be moskus-)": r"\bmusk-",
    "'sådan en ting' (calque of 'such a thing')": r"\bsådan en ting\b",
    "'det her faktum' (calque)": r"det her faktum",
    "'et stykke tid siden' (wrong — should be 'for et stykke tid siden')": r"^et stykke tid siden",
    "'baseret på' (often anglicism)": r"\bbaseret på\b",
    "'have været i stand til' (calque of 'been able to')": r"have været i stand til",
    "'ikke desto mindre' twice in same para (overuse)": r"ikke desto mindre.*ikke desto mindre",
}


def da_issues(book_id, mod_en, mod_da):
    out = {}
    if not mod_da:
        return out

    da_text = " ".join(flatten(mod_da))

    # Quote style
    out["straight_quotes"] = da_text.count('"')
    out["guillemet_open"] = da_text.count("\u00bb")  # »
    out["guillemet_close"] = da_text.count("\u00ab")  # «
    out["low_quotes"] = da_text.count("\u201e")  # „

    # Anglicisms
    anglicisms = {}
    for label, pat in DA_ANGLICISM_PATTERNS.items():
        matches = re.findall(pat, da_text, flags=re.IGNORECASE)
        if matches:
            anglicisms[label] = len(matches)
    out["anglicisms"] = anglicisms

    # Inherited encoding: any "Chêniere" etc in DA that shouldn't be
    encoding_bugs = 0
    for bad, good in PROPER_NOUN_ACCENT_CHECKS:
        encoding_bugs += da_text.count(bad)
    out["encoding_bugs"] = encoding_bugs

    # Mrs./Mr. consistency check (informational only, we're keeping these)
    out["mrs_count"] = len(re.findall(r"\bMrs\.", da_text))
    out["mr_count"] = len(re.findall(r"\bMr\.", da_text))
    out["fru_count"] = len(re.findall(r"\bfru\b", da_text))

    # Total Danish words (for context)
    out["total_words"] = len(da_text.split())

    return out


def audit_book(book_id):
    orig = load(book_id, "original-en")
    mod = load(book_id, "modern-en")
    da = load(book_id, "modern-da")

    report = {"book_id": book_id}

    # Truncation
    en_flagged, en_total = count_truncation(orig, mod)
    da_flagged, da_total = count_truncation(mod, da)
    report["en_truncation"] = (en_flagged, en_total)
    report["da_truncation"] = (da_flagged, da_total)

    # EN quality
    report["en_quality"] = en_issues(book_id, orig, mod)

    # DA quality
    report["da_quality"] = da_issues(book_id, mod, da)

    return report


def print_summary(reports):
    # Header
    print(f"\n{'BOOK':<22} {'EN trunc':>10} {'DA trunc':>10} {'EN acc':>7} "
          f"{'EN !drop':>9} {'DA style':>9} {'DA angl':>8} {'DA enc':>8}")
    print("-" * 100)

    for r in reports:
        b = r["book_id"]
        en_t = f"{r['en_truncation'][0]}/{r['en_truncation'][1]}"
        da_t = f"{r['da_truncation'][0]}/{r['da_truncation'][1]}"
        en_acc = r["en_quality"].get("accent_drops", 0)
        en_excl = r["en_quality"].get("excl_drop_pct", 0)

        da_q = r["da_quality"]
        # style summary: S=straight, G=guillemets, L=low-9 quotes
        sq = da_q.get("straight_quotes", 0)
        gq = da_q.get("guillemet_open", 0) + da_q.get("guillemet_close", 0)
        lq = da_q.get("low_quotes", 0)
        if sq > gq and sq > lq:
            style = f"straight({sq})"
        elif gq > 0:
            style = f"»«({gq})"
        elif lq > 0:
            style = f"„\"({lq})"
        else:
            style = "-"

        angl = sum(da_q.get("anglicisms", {}).values())
        enc = da_q.get("encoding_bugs", 0)

        flag_en_trunc = "!" if r["en_truncation"][0] > 20 else " "
        flag_da_trunc = "!" if r["da_truncation"][0] > 20 else " "

        print(f"{b:<22} {en_t:>9}{flag_en_trunc} {da_t:>9}{flag_da_trunc} {en_acc:>7} "
              f"{en_excl:>8}% {style:>9} {angl:>8} {enc:>8}")

    print("-" * 100)

    # Detail: anglicism breakdown for books with any
    print("\n== Anglicism detail (only books with hits) ==")
    for r in reports:
        angl = r["da_quality"].get("anglicisms", {})
        if angl:
            print(f"\n  {r['book_id']}:")
            for label, count in sorted(angl.items(), key=lambda x: -x[1]):
                print(f"    {count:>3}  {label}")


def main():
    if len(sys.argv) > 1:
        ids = [sys.argv[1]]
    else:
        ids = books_with_da()

    reports = [audit_book(b) for b in ids]
    print_summary(reports)


if __name__ == "__main__":
    main()
