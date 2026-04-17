#!/usr/bin/env python3
"""
Deep Danish QA scan — catches issues beyond word-count truncation.

Checks per book:
  1. Character-ratio distribution (EN→DA). Natural range ~0.85-1.15.
     Book-wide ratio below 0.8 = systemic compression.
     Paragraph-level ratio below 0.55 flagged separately.
  2. Sentence-count parity per paragraph.
     Flag paragraphs where |EN_sentences - DA_sentences| >= 3.
  3. Named entity preservation.
     Proper nouns (capitalized non-sentence-start words) in EN should
     appear in the corresponding DA chapter.
  4. Dialogue line parity.
     Count dialogue paragraphs (starting with quote). Should match.
  5. Empty/stub paragraphs (< 20 chars).
  6. Spot sample: 3 random paragraphs per book for a side-by-side report.

Output:
  - Summary table per book (overall ratio, systemic flags)
  - Detail section for books with red flags
  - Spot sample saved to scan-report.md

Usage:
    python3 qa-danish-deep.py              # all books with DA
    python3 qa-danish-deep.py odyssey      # one book
"""
import json
import re
import sys
import random
from pathlib import Path

EDITIONS_DIR = Path("/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions")
REPORT_PATH = Path("/Users/andershvelplund/Documents/Projects/Tinct/books/scan-report.md")


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


def sentence_count(text):
    # Count sentence terminators — naive but consistent
    return sum(1 for c in text if c in ".!?")


def proper_nouns(text):
    # Capitalized words not at start of sentence.
    # Match: token starts with capital and contains a lowercase letter (excludes ALL-CAPS artifacts).
    # Also skip words right after period/question/exclamation (sentence start).
    out = set()
    tokens = re.findall(r"\b([A-ZÆØÅÉÈÊËÄÖÜÀÁÍÓÚÑÇ][a-zæøåéèêëäöüàáíóúñç]+)\b", text)
    for t in tokens:
        # Strip very common sentence-start words that aren't proper nouns
        if t in {"The", "A", "An", "He", "She", "They", "We", "I", "It", "This",
                "That", "These", "Those", "There", "Then", "And", "But", "Or",
                "So", "For", "Yet", "Why", "What", "When", "Where", "Who", "How",
                "As", "Her", "His", "My", "Your", "Their", "Our", "Its",
                "Now", "Here", "One", "Two", "Three", "Perhaps", "Indeed", "After",
                "Before", "During", "Though", "Although", "Even", "Just", "Only",
                "Still", "Yes", "No", "Well", "Oh", "Ah", "Yet", "Yes", "Of",
                "On", "In", "At", "By", "To", "From", "With", "Without",
                "De", "Den", "Det", "Han", "Hun", "Jeg", "Vi", "Du", "I",
                "Men", "Og", "Eller", "Så", "For", "Til", "Fra", "Med", "Uden",
                "Hvad", "Hvor", "Hvorfor", "Hvordan", "Hvornår", "Hvem",
                "Der", "Her", "Nu", "Ja", "Nej", "Åh", "Ah", "Kunne", "Ville",
                "Skulle", "Måtte", "Sådan", "Således", "Dette", "Disse",
                "En", "Et", "Som"}:
            continue
        out.add(t)
    return out


def audit_book(book_id):
    orig = load(book_id, "original-en")
    mod = load(book_id, "modern-en")
    da = load(book_id, "modern-da")

    result = {"book_id": book_id}

    if not mod or not da:
        result["status"] = "missing_edition"
        return result

    # Character ratio, book-wide
    mod_chars = sum(len(p) for ch in mod["chapters"] for p in ch["paragraphs"])
    da_chars = sum(len(p) for ch in da["chapters"] for p in ch["paragraphs"])
    result["book_ratio"] = round(da_chars / mod_chars, 2) if mod_chars else 0

    # Paragraph-level signals
    severe_compression = 0  # para ratio < 0.55
    sentence_mismatch = 0   # |n_sent_en - n_sent_da| >= 3
    empty_stub = 0          # DA paragraph < 20 chars
    dialogue_mismatch_chapters = 0

    n_chapters = min(len(mod["chapters"]), len(da["chapters"]))
    chapter_entity_loss = []

    for ci in range(n_chapters):
        mod_ch = mod["chapters"][ci]
        da_ch = da["chapters"][ci]

        # Dialogue line parity per chapter
        mod_dia = sum(1 for p in mod_ch["paragraphs"] if p.lstrip().startswith(("\u201c", '"')))
        da_dia  = sum(1 for p in da_ch["paragraphs"]  if p.lstrip().startswith(("\u00bb", '"')))
        if mod_dia >= 5 and abs(mod_dia - da_dia) / max(mod_dia, 1) > 0.2:
            dialogue_mismatch_chapters += 1

        # Entity preservation per chapter (sampled)
        mod_text = " ".join(mod_ch["paragraphs"])
        da_text = " ".join(da_ch["paragraphs"])
        mod_ents = proper_nouns(mod_text)
        da_ents = proper_nouns(da_text)
        # Only flag entities appearing 2+ times in EN (recurring characters)
        mod_counts = {e: mod_text.count(e) for e in mod_ents}
        recurring = {e for e, c in mod_counts.items() if c >= 2}
        lost = recurring - da_ents - {e.lower() for e in da_ents}
        # Also accept genitive forms (e.g., "Edna" in EN → "Ednas" in DA)
        lost = {e for e in lost if not any(e + "s" in da_text or e + "'s" in da_text for _ in [1])}
        if len(lost) >= 5:
            chapter_entity_loss.append((ci + 1, len(lost), sorted(lost)[:5]))

        # Per-paragraph signals
        n_paras = min(len(mod_ch["paragraphs"]), len(da_ch["paragraphs"]))
        for pi in range(n_paras):
            mp = mod_ch["paragraphs"][pi]
            dp = da_ch["paragraphs"][pi]
            if len(mp) < 40:
                continue
            if len(dp) < 20 and len(mp) >= 40:
                empty_stub += 1
            # paragraph-level compression ratio
            if len(dp) / max(len(mp), 1) < 0.55:
                severe_compression += 1
            # sentence count mismatch
            sm = sentence_count(mp)
            sd = sentence_count(dp)
            if sm >= 4 and abs(sm - sd) >= 3:
                sentence_mismatch += 1

    result["severe_compression"] = severe_compression
    result["sentence_mismatch"] = sentence_mismatch
    result["empty_stub"] = empty_stub
    result["dialogue_mismatch_chapters"] = dialogue_mismatch_chapters
    result["entity_loss_chapters"] = len(chapter_entity_loss)
    result["entity_loss_detail"] = chapter_entity_loss[:3]

    # Severity score
    score = 0
    if result["book_ratio"] < 0.80:
        score += 30
    elif result["book_ratio"] < 0.85:
        score += 10
    score += min(50, severe_compression)  # 1pt per severe compressed paragraph, cap 50
    score += min(30, sentence_mismatch // 3)
    score += min(30, empty_stub * 2)
    score += min(20, dialogue_mismatch_chapters * 2)
    score += min(20, len(chapter_entity_loss) * 2)
    result["severity"] = score

    return result


def pick_spot_samples(book_id, n=3):
    """Pick 3 random paragraphs ≥ 60 words and return EN+DA pair."""
    mod = load(book_id, "modern-en")
    da = load(book_id, "modern-da")
    if not (mod and da):
        return []

    candidates = []
    for ci in range(min(len(mod["chapters"]), len(da["chapters"]))):
        mps = mod["chapters"][ci]["paragraphs"]
        dps = da["chapters"][ci]["paragraphs"]
        for pi in range(min(len(mps), len(dps))):
            if len(mps[pi].split()) >= 60:
                candidates.append((ci + 1, pi, mps[pi], dps[pi]))

    if not candidates:
        return []

    random.seed(hash(book_id) & 0xFFFF)  # deterministic per-book
    return random.sample(candidates, min(n, len(candidates)))


def write_report(reports):
    lines = [
        "# Danish Translation Deep Scan",
        "",
        f"Generated by `qa-danish-deep.py`. Books ranked by severity score.",
        "",
        "## Severity table",
        "",
        "| Book | Book ratio | Severe compression | Sentence mismatch | Empty stubs | Entity loss chs | Dialogue mismatch chs | Severity |",
        "|------|-----------:|-------------------:|------------------:|------------:|----------------:|----------------------:|---------:|",
    ]

    ranked = sorted([r for r in reports if "severity" in r], key=lambda r: -r["severity"])

    for r in ranked:
        lines.append(
            f"| {r['book_id']} | {r['book_ratio']:.2f} | {r['severe_compression']} | "
            f"{r['sentence_mismatch']} | {r['empty_stub']} | {r['entity_loss_chapters']} | "
            f"{r['dialogue_mismatch_chapters']} | **{r['severity']}** |"
        )

    lines.append("")
    lines.append("Severity ≥ 50 = investigate closely. Severity ≥ 100 = likely regeneration candidate.")
    lines.append("")

    # Detail for top 5
    lines.append("## Top candidates — entity loss detail")
    lines.append("")
    for r in ranked[:8]:
        if r["entity_loss_detail"]:
            lines.append(f"### {r['book_id']}")
            for ci, n, names in r["entity_loss_detail"]:
                lines.append(f"- ch{ci}: {n} recurring names missing in DA, e.g. {', '.join(names)}")
            lines.append("")

    # Spot samples
    lines.append("## Spot samples (3 paragraphs per book, ≥60 words)")
    lines.append("")
    lines.append("Read these side-by-side. Judge whether the DA reads as natural Danish and preserves meaning.")
    lines.append("")

    for r in ranked:
        book_id = r["book_id"]
        samples = pick_spot_samples(book_id, 3)
        if not samples:
            continue
        lines.append(f"### {book_id} (severity {r['severity']})")
        lines.append("")
        for ci, pi, mp, dp in samples:
            lines.append(f"**Ch{ci} p{pi}**")
            lines.append("")
            lines.append(f"> EN: {mp}")
            lines.append("")
            lines.append(f"> DA: {dp}")
            lines.append("")

    REPORT_PATH.write_text("\n".join(lines))
    print(f"\nReport written to: {REPORT_PATH}")
    print(f"Total books: {len(ranked)}")
    print(f"Severity ≥ 100 (regenerate candidates): {sum(1 for r in ranked if r['severity'] >= 100)}")
    print(f"Severity 50-99 (investigate): {sum(1 for r in ranked if 50 <= r['severity'] < 100)}")
    print(f"Severity < 50 (likely clean): {sum(1 for r in ranked if r['severity'] < 50)}")


def main():
    if len(sys.argv) > 1:
        ids = [sys.argv[1]]
    else:
        ids = books_with_da()

    reports = [audit_book(b) for b in ids]
    write_report(reports)

    # Also print short summary to stdout
    ranked = sorted([r for r in reports if "severity" in r], key=lambda r: -r["severity"])
    print("\nTop 15 by severity:")
    for r in ranked[:15]:
        print(f"  {r['book_id']:<22}  severity={r['severity']:<5}  ratio={r['book_ratio']:.2f}  "
              f"sev_comp={r['severe_compression']:<4}  sent_mm={r['sentence_mismatch']:<4}  "
              f"ent_loss_chs={r['entity_loss_chapters']}")


if __name__ == "__main__":
    main()
