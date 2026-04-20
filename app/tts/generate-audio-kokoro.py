"""Generate audiobook using Kokoro TTS (Bella voice). Works for any book.

Usage:
  python3 generate-audio-kokoro.py <book-id> <edition-key> [start_ch] [end_ch]

Examples:
  python3 generate-audio-kokoro.py pride-and-prejudice modern-en 1 61
  python3 generate-audio-kokoro.py bible modern-en 1 66
"""
import json
import os
import sys
import numpy as np
import soundfile as sf
import kokoro


ROMAN_TO_ARABIC = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7,
    'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12, 'XIII': 13,
    'XIV': 14, 'XV': 15, 'XVI': 16, 'XVII': 17, 'XVIII': 18,
    'XIX': 19, 'XX': 20, 'XXI': 21, 'XXII': 22, 'XXIII': 23, 'XXIV': 24,
}


def clean_text(text):
    """Prepare a paragraph for TTS. Handles:
      - Bible superscript verse markers: '¹ In the beginning' → 'In the beginning'
      - Roman numerals after Act/Scene/Book/Chapter/Part: 'Act II' → 'Act 2'
      - ALL-CAPS speaker tags and character names: 'BANQUO' → 'Banquo'
        (Shakespeare plays use ALL-CAPS which Kokoro spells out letter-by-letter)
    """
    import re

    # Remove superscript digits (Bible verse markers)
    superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹'
    text = re.sub(f'[{re.escape(superscripts)}]+', '', text)

    # Convert Roman numerals after heading words to Arabic
    def _replace_roman(m):
        prefix, roman = m.group(1), m.group(2)
        if roman in ROMAN_TO_ARABIC:
            return f'{prefix} {ROMAN_TO_ARABIC[roman]}'
        return m.group(0)

    text = re.sub(
        r'\b(Act|Scene|Book|Chapter|Part|Canto|Volume)\s+([IVX]+)\b',
        _replace_roman,
        text,
    )

    # Convert ALL-CAPS words (2+ letters) to Title Case so Kokoro reads them
    # as names instead of spelling each letter. E.g. 'BANQUO' → 'Banquo',
    # 'LADY MACBETH' → 'Lady Macbeth', '[Enter MACBETH]' → '[Enter Macbeth]'.
    # Skip single-letter 'I' (standard English pronoun).
    text = re.sub(r'\b([A-Z]{2,})\b', lambda m: m.group(1).title(), text)

    # Collapse multiple spaces left behind
    text = re.sub(r'  +', ' ', text).strip()
    return text


def generate_chapter(pipeline, edition_data, chapter_num, output_dir):
    """Generate audio for a single chapter, one file per paragraph.
    Set generate_chapter.overwrite = True to force-regenerate existing files."""
    chapter = next((c for c in edition_data['chapters'] if c['number'] == chapter_num), None)
    if not chapter:
        print(f"  Chapter {chapter_num} not found")
        return False

    ch_dir = os.path.join(output_dir, f"ch{chapter_num}")
    os.makedirs(ch_dir, exist_ok=True)

    for i, para in enumerate(chapter['paragraphs']):
        out_file = os.path.join(ch_dir, f"p{i}.wav")
        if os.path.exists(out_file) and not generate_chapter.overwrite:
            continue  # Skip already generated

        text = clean_text(para.replace('\n', ' '))
        if not text:
            sf.write(out_file, np.zeros(2400, dtype=np.float32), 24000)
            continue

        try:
            chunks = []
            for result in pipeline(text, voice='af_bella', speed=1.0):
                chunks.append(result.audio.numpy())
            if chunks:
                audio = np.concatenate(chunks)
                sf.write(out_file, audio, 24000)
        except Exception as e:
            print(f"  ERROR on ch{chapter_num}/p{i}: {e}")
            sf.write(out_file, np.zeros(2400, dtype=np.float32), 24000)

        if (i + 1) % 20 == 0:
            print(f"    ch{chapter_num}: {i + 1}/{len(chapter['paragraphs'])} paragraphs")

    print(f"  Chapter {chapter_num}: {len(chapter['paragraphs'])} paragraphs done")
    return True


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = [a for a in sys.argv[1:] if a.startswith('--')]

    if len(args) < 2:
        print("Usage: python3 generate-audio-kokoro.py <book-id> <edition-key> [start_ch] [end_ch] [--overwrite]")
        sys.exit(1)

    book = args[0]
    edition_key = args[1]
    start_ch = int(args[2]) if len(args) > 2 else 1
    end_ch = int(args[3]) if len(args) > 3 else None
    generate_chapter.overwrite = '--overwrite' in flags

    base_dir = os.path.dirname(os.path.abspath(__file__))
    editions_dir = os.path.join(base_dir, '..', 'public', 'data', 'editions')
    output_dir = os.path.join(base_dir, 'audio', book, edition_key)

    json_file = os.path.join(editions_dir, f'{book}-{edition_key}.json')
    print(f"Loading {json_file}...")
    with open(json_file) as f:
        edition_data = json.load(f)

    if end_ch is None:
        end_ch = max(c['number'] for c in edition_data['chapters'])

    print(f"Initializing Kokoro TTS (Bella voice)...")
    pipeline = kokoro.KPipeline(lang_code='a')

    if generate_chapter.overwrite:
        print("(--overwrite mode: re-generating existing files)")
    print(f"Generating {book}/{edition_key} chapters {start_ch}-{end_ch}...")
    for ch_num in range(start_ch, end_ch + 1):
        generate_chapter(pipeline, edition_data, ch_num, output_dir)

    print(f"Done! Now generate manifests:")
    print(f"  python3 generate-manifests-edge.py {book} {edition_key}")


if __name__ == '__main__':
    main()
