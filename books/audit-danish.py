#!/usr/bin/env python3
"""
Danish Translation Audit Tool — Tinct Book Factory

Two-layer audit:
  Layer 1: Hunspell spellcheck (catches misspellings, broken words)
  Layer 2: Outputs text for LLM review pass (catches wrong register,
           invented compounds, translationese, semantic errors)

Usage:
    python3 audit-danish.py                    # spellcheck all books
    python3 audit-danish.py odyssey            # spellcheck one book
    python3 audit-danish.py --download         # force re-download dictionary
    python3 audit-danish.py --review odyssey   # generate LLM review input for a book

Requires: pip3 install spylls
Dictionary files (da_DK.dic + da_DK.aff) auto-downloaded from LibreOffice.
"""

import json
import re
import sys
import urllib.request
from collections import defaultdict
from pathlib import Path

EDITIONS_DIR = Path(__file__).parent / "../app/public/data/editions"
DICT_DIR = Path(__file__).parent
DICT_DIC = DICT_DIR / "da_DK.dic"
DICT_AFF = DICT_DIR / "da_DK.aff"
DIC_URL = "https://cgit.freedesktop.org/libreoffice/dictionaries/plain/da_DK/da_DK.dic"
AFF_URL = "https://cgit.freedesktop.org/libreoffice/dictionaries/plain/da_DK/da_DK.aff"

ALLOWLIST_FILE = Path(__file__).parent / "danish-allowlist.txt"


def download_dictionaries():
    """Download LibreOffice Danish hunspell dictionaries."""
    for url, path in [(DIC_URL, DICT_DIC), (AFF_URL, DICT_AFF)]:
        if not path.exists():
            print(f"  Downloading {path.name}...")
            req = urllib.request.urlopen(url, timeout=30)
            path.write_bytes(req.read())
            print(f"  Saved {path.name}")


def load_allowlist():
    """Load user-maintained allowlist."""
    words = set()
    if ALLOWLIST_FILE.exists():
        for line in ALLOWLIST_FILE.read_text().strip().split("\n"):
            line = line.strip().lower()
            if line and not line.startswith("#"):
                words.add(line)
    return words


def tokenize(text):
    """Extract words from text."""
    text = re.sub(r'[«»"""\'\(\)\[\]\{\},\.;:!\?/\\@&\*\+=#\d…–—\-]', ' ', text)
    return [w for w in text.split() if len(w) >= 3]


def is_proper_noun(word):
    """Check if word starts with uppercase (likely a name)."""
    return word[0].isupper() if word else False


def spellcheck_edition(filepath, dictionary, allowlist):
    """Layer 1: Hunspell spellcheck. Returns {word: [(ch, para_idx, context)]}."""
    with open(filepath) as f:
        data = json.load(f)

    flagged = defaultdict(list)

    for chapter in data.get("chapters", []):
        ch_num = chapter.get("number", "?")
        for p_idx, para in enumerate(chapter.get("paragraphs", [])):
            seen_in_para = set()
            for raw_word in tokenize(para):
                word_lower = raw_word.lower()

                if word_lower in seen_in_para:
                    continue
                seen_in_para.add(word_lower)

                if word_lower in allowlist:
                    continue
                if is_proper_noun(raw_word):
                    continue

                if not dictionary.lookup(raw_word) and not dictionary.lookup(word_lower):
                    # Get context snippet
                    idx = para.find(raw_word)
                    if idx == -1:
                        idx = para.lower().find(word_lower)
                    start = max(0, idx - 30)
                    end = min(len(para), idx + len(raw_word) + 30)
                    ctx = para[start:end].replace("\n", " ")
                    if start > 0:
                        ctx = "..." + ctx
                    if end < len(para):
                        ctx = ctx + "..."

                    flagged[word_lower].append((ch_num, p_idx, ctx))

    return flagged


def generate_review_input(filepath, en_filepath):
    """Layer 2: Generate side-by-side DA/EN paragraphs for LLM review.

    Outputs chunks of ~20 paragraphs with both languages for the LLM
    to check for invented compounds, wrong register, translationese, etc.
    """
    with open(filepath) as f:
        da_data = json.load(f)
    with open(en_filepath) as f:
        en_data = json.load(f)

    da_chapters = da_data.get("chapters", [])
    en_chapters = en_data.get("chapters", [])

    output_dir = Path(__file__).parent / "review-input"
    output_dir.mkdir(exist_ok=True)

    book_id = filepath.stem.replace("-modern-da", "")
    chunk_size = 20  # paragraphs per review chunk
    chunk_num = 0
    current_chunk = []

    for ch_idx, (da_ch, en_ch) in enumerate(zip(da_chapters, en_chapters)):
        ch_num = da_ch.get("number", ch_idx + 1)
        da_paras = da_ch.get("paragraphs", [])
        en_paras = en_ch.get("paragraphs", [])

        for p_idx, (da_p, en_p) in enumerate(zip(da_paras, en_paras)):
            current_chunk.append({
                "chapter": ch_num,
                "paragraph": p_idx + 1,
                "english": en_p,
                "danish": da_p
            })

            if len(current_chunk) >= chunk_size:
                chunk_num += 1
                chunk_file = output_dir / f"{book_id}-review-{chunk_num:03d}.json"
                with open(chunk_file, "w") as f:
                    json.dump(current_chunk, f, ensure_ascii=False, indent=2)
                current_chunk = []

    # Write remaining
    if current_chunk:
        chunk_num += 1
        chunk_file = output_dir / f"{book_id}-review-{chunk_num:03d}.json"
        with open(chunk_file, "w") as f:
            json.dump(current_chunk, f, ensure_ascii=False, indent=2)

    return chunk_num


# --- LLM Review Prompt Template ---

REVIEW_PROMPT = """You are a Danish language quality reviewer. Review the following Danish translations
against their English source. Your ONLY job is to find errors in these specific categories:

1. **Invented compound words**: Danish allows productive compounding, but the result must be
   a word a native speaker would actually use. Flag compounds that sound plausible but aren't
   real Danish (e.g., "guldflakke" instead of "guldflaske" or "guldkande").

2. **Misspellings / near-miss words**: Words that are close to a real word but wrong
   (e.g., "splitterøgen" instead of "splitternøgen").

3. **Wrong register**: Archaic or overly formal words where modern Danish has a common
   alternative (e.g., "gesims" instead of "krans" or "liste").

4. **False cognates**: Danish words that exist but don't mean what the English word means
   in this context (e.g., translating "elder" as "ældst" when it means a community leader).

5. **Translationese**: Sentences that follow English word order or idiom instead of natural
   Danish phrasing. Danish subordinate clauses put the verb differently than English.

6. **Nonsense geography/terminology**: Invented place descriptions or technical terms that
   don't exist (e.g., "strandtungerne" instead of "sandtunger").

7. **Tense shifts in narrative**: The English source sometimes uses present tense for
   geographic descriptions, similes, and general truths. In Danish narrative prose, this is
   jarring — all narrative should stay in past tense. Only direct dialogue may use present
   tense. Example: "Øen er oversvømmet af geder" should be "Øen var oversvømmet af geder"
   when the surrounding narrative is past tense. Check for: er→var, har→havde, kan→kunne,
   vil→ville, går→gik, kommer→kom, ser→så, ligger→lå, står→stod, giver→gav.

For each error found, output EXACTLY this format:
```
CHAPTER: [number]
PARAGRAPH: [number]
CATEGORY: [1-6 from above]
CURRENT: "[the problematic word or phrase]"
SUGGESTED: "[your correction]"
REASON: [brief explanation]
```

If a paragraph has no errors, skip it silently. Do NOT comment on style preferences,
alternative phrasings that are equally valid, or paragraphs that are fine.

Here are the paragraphs to review:

"""


def main():
    force_download = "--download" in sys.argv
    review_mode = "--review" in sys.argv
    book_filter = None
    for arg in sys.argv[1:]:
        if not arg.startswith("-"):
            book_filter = arg

    if force_download:
        for p in [DICT_DIC, DICT_AFF]:
            if p.exists():
                p.unlink()

    download_dictionaries()
    allowlist = load_allowlist()

    if review_mode:
        # Layer 2: Generate LLM review input
        pattern = f"{book_filter}-modern-da.json" if book_filter else "*-modern-da.json"
        files = sorted(EDITIONS_DIR.glob(pattern))
        for filepath in files:
            book_id = filepath.stem.replace("-modern-da", "")
            en_path = EDITIONS_DIR / f"{book_id}-modern-en.json"
            if not en_path.exists():
                print(f"  Skipping {book_id}: no modern-en file")
                continue
            print(f"\nGenerating review input for {book_id}...")
            chunks = generate_review_input(filepath, en_path)
            print(f"  Created {chunks} review chunks in review-input/")

        print(f"\n--- LLM REVIEW PROMPT ---")
        print(REVIEW_PROMPT)
        print("--- END PROMPT ---")
        print("\nFeed each chunk file + the prompt above to Claude for review.")
        return

    # Layer 1: Hunspell spellcheck
    print("Loading Danish dictionary (spylls)...")
    from spylls.hunspell import Dictionary
    dictionary = Dictionary.from_files(str(DICT_DIR / "da_DK"))
    print("  Dictionary loaded")

    if allowlist:
        print(f"  {len(allowlist)} allowlisted words")

    pattern = f"{book_filter}-modern-da.json" if book_filter else "*-modern-da.json"
    files = sorted(EDITIONS_DIR.glob(pattern))
    if not files:
        print(f"No files matching {pattern}")
        return

    total_flagged = 0
    for filepath in files:
        book_id = filepath.stem.replace("-modern-da", "")
        print(f"\n{'=' * 70}")
        print(f"  {book_id.upper().replace('-', ' ')} — SPELLCHECK")
        print(f"{'=' * 70}")

        flagged = spellcheck_edition(filepath, dictionary, allowlist)

        if not flagged:
            print("  No misspelled words found!")
            continue

        sorted_words = sorted(flagged.items(), key=lambda x: -len(x[1]))
        print(f"\n  {len(sorted_words)} misspelled words found:\n")

        for word, locations in sorted_words:
            count = len(locations)
            chapters = sorted(set(loc[0] for loc in locations))
            ch_str = ", ".join(str(c) for c in chapters[:5])
            if len(chapters) > 5:
                ch_str += f" (+{len(chapters) - 5} more)"

            print(f"  [{count:3d}x]  {word:30s}  ch: {ch_str}")
            # Show first context
            _, _, ctx = locations[0]
            print(f"          \"{ctx}\"")
            print()

        total_flagged += len(sorted_words)

    print(f"\n{'=' * 70}")
    print(f"  TOTAL: {total_flagged} misspelled words across {len(files)} edition(s)")
    print(f"{'=' * 70}")
    print(f"\nTo suppress false positives, add words to: {ALLOWLIST_FILE}")
    print(f"For semantic/register review, run: python3 audit-danish.py --review [book]")


if __name__ == "__main__":
    main()
