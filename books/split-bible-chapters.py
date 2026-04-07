import json
import re
import sys
import os

EDITIONS_DIR = os.path.join(os.path.dirname(__file__), '..', 'app', 'public', 'data', 'editions')

SUPERSCRIPT_MAP = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹', '0123456789')

CANONICAL_CHAPTERS = [
    50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10,
    42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3,
    2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4,
    3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22
]


def parse_superscript_number(text):
    m = re.match(r'^([⁰¹²³⁴⁵⁶⁷⁸⁹]+)', text.strip())
    if m:
        return int(m.group(1).translate(SUPERSCRIPT_MAP))
    return None


def find_chapter_boundaries_kjv(paragraphs):
    boundaries = [0]
    for i, p in enumerate(paragraphs):
        m = re.search(r'\[Chapter \d+\]', p)
        if m:
            if m.start() == 0:
                boundaries.append(i)
            else:
                boundaries.append(i)
    return boundaries


def find_chapter_boundaries_v1(paragraphs):
    boundaries = [0]
    for i, p in enumerate(paragraphs):
        if i == 0:
            continue
        if p.strip().startswith('¹ ') or p.strip().startswith('¹\u00a0'):
            boundaries.append(i)
    return boundaries


def strip_chapter_markers(text):
    return re.sub(r'\[Chapter \d+\]\s*', '', text)


def split_book_paragraphs(paragraphs, boundaries):
    chapters = []
    for idx in range(len(boundaries)):
        start = boundaries[idx]
        end = boundaries[idx + 1] if idx + 1 < len(boundaries) else len(paragraphs)
        ch_paragraphs = paragraphs[start:end]
        chapters.append(ch_paragraphs)
    return chapters


def build_new_sections(old_sections, old_chapters, book_chapter_counts):
    chapter_number = 1
    book_idx = 0

    def process_section(section):
        nonlocal chapter_number, book_idx
        if 'chapters' in section and section['chapters']:
            new_sub_sections = []
            for old_ch_num in section['chapters']:
                old_ch = old_chapters[old_ch_num - 1]
                book_title = old_ch['title']
                num_biblical_chapters = book_chapter_counts[book_idx]

                if num_biblical_chapters == 1:
                    ch_numbers = [chapter_number]
                    chapter_number += 1
                else:
                    ch_numbers = list(range(chapter_number, chapter_number + num_biblical_chapters))
                    chapter_number += num_biblical_chapters

                new_sub_sections.append({
                    'title': book_title,
                    'chapters': ch_numbers
                })
                book_idx += 1

            return {
                'title': section['title'],
                'sections': new_sub_sections
            }
        elif 'sections' in section and section['sections']:
            return {
                'title': section['title'],
                'sections': [process_section(s) for s in section['sections']]
            }
        else:
            return section

    return [process_section(s) for s in old_sections]


def process_edition(filepath, kjv_boundaries, is_kjv_or_web=False, force_kjv_boundaries=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    old_chapters = data['chapters']
    old_sections = data['sections']
    new_chapters = []
    chapter_number = 1
    book_chapter_counts = []

    for book_idx, old_ch in enumerate(old_chapters):
        book_title = old_ch['title']
        paragraphs = old_ch['paragraphs']
        expected = CANONICAL_CHAPTERS[book_idx]

        if force_kjv_boundaries:
            boundaries = kjv_boundaries[book_idx]
        elif is_kjv_or_web:
            boundaries = find_chapter_boundaries_kjv(paragraphs)
        else:
            boundaries = find_chapter_boundaries_v1(paragraphs)

        if len(boundaries) != expected:
            if len(kjv_boundaries[book_idx]) == expected:
                boundaries = kjv_boundaries[book_idx]
            else:
                print(f"  WARNING: {book_title} in {os.path.basename(filepath)}: "
                      f"found {len(boundaries)} chapters, expected {expected}. Using KJV boundaries.")
                boundaries = kjv_boundaries[book_idx]

        book_chapter_counts.append(len(boundaries))
        split_paras = split_book_paragraphs(paragraphs, boundaries)

        for ch_idx, ch_paras in enumerate(split_paras):
            if is_kjv_or_web:
                ch_paras = [strip_chapter_markers(p) for p in ch_paras]

            if expected == 1:
                title = book_title
            else:
                title = f"{book_title} {ch_idx + 1}"

            new_chapters.append({
                'number': chapter_number,
                'title': title,
                'paragraphs': ch_paras
            })
            chapter_number += 1

    new_sections = build_new_sections(old_sections, old_chapters, book_chapter_counts)

    return {
        'sections': new_sections,
        'chapters': new_chapters
    }, book_chapter_counts


def validate(data, filepath, all_editions_data=None):
    chapters = data['chapters']
    total = len(chapters)
    errors = []

    if total != 1189:
        errors.append(f"Total chapters: {total}, expected 1189")

    for i, ch in enumerate(chapters):
        if not ch['paragraphs']:
            errors.append(f"Chapter {ch['number']} ({ch['title']}): empty paragraphs")
        for j, p in enumerate(ch['paragraphs']):
            if not p.strip():
                errors.append(f"Chapter {ch['number']} ({ch['title']}), paragraph {j}: empty/whitespace")
            if '[Chapter ' in p:
                errors.append(f"Chapter {ch['number']} ({ch['title']}), paragraph {j}: residual [Chapter] marker")

    def collect_chapter_numbers(sections):
        nums = []
        for s in sections:
            if 'chapters' in s and s['chapters']:
                nums.extend(s['chapters'])
            if 'sections' in s and s['sections']:
                nums.extend(collect_chapter_numbers(s['sections']))
        return nums

    section_nums = sorted(collect_chapter_numbers(data['sections']))
    expected_nums = list(range(1, total + 1))
    if section_nums != expected_nums:
        missing = set(expected_nums) - set(section_nums)
        extra = set(section_nums) - set(expected_nums)
        if missing:
            errors.append(f"Sections missing chapter numbers: {sorted(missing)[:10]}...")
        if extra:
            errors.append(f"Sections have extra chapter numbers: {sorted(extra)[:10]}...")

    basename = os.path.basename(filepath)
    if errors:
        print(f"\n  VALIDATION ERRORS for {basename}:")
        for e in errors:
            print(f"    - {e}")
        return False
    else:
        print(f"  {basename}: {total} chapters, all valid")
        return True


def main():
    kjv_path = os.path.join(EDITIONS_DIR, 'bible-kjv-en.json')
    web_path = os.path.join(EDITIONS_DIR, 'bible-web-en.json')
    men_path = os.path.join(EDITIONS_DIR, 'bible-modern-en.json')
    da_path = os.path.join(EDITIONS_DIR, 'bible-modern-da.json')

    print("Loading KJV to extract authoritative chapter boundaries...")
    with open(kjv_path, 'r', encoding='utf-8') as f:
        kjv_data = json.load(f)

    if len(kjv_data['chapters']) != 66:
        print(f"ERROR: KJV has {len(kjv_data['chapters'])} chapters — expected 66 (original format).")
        print("Files appear already transformed. Restore from git first:")
        print("  git checkout -- app/public/data/editions/bible-*.json")
        sys.exit(1)

    kjv_boundaries = []
    for book_idx, ch in enumerate(kjv_data['chapters']):
        boundaries = find_chapter_boundaries_kjv(ch['paragraphs'])
        expected = CANONICAL_CHAPTERS[book_idx]
        if len(boundaries) != expected:
            print(f"  WARNING: KJV {ch['title']}: found {len(boundaries)} chapters, expected {expected}")
        kjv_boundaries.append(boundaries)

    total_kjv = sum(len(b) for b in kjv_boundaries)
    print(f"  KJV boundaries: {total_kjv} chapters across 66 books (expected 1189)")

    editions = [
        (kjv_path, True, 'KJV'),
        (web_path, True, 'WEB'),
        (men_path, False, 'Modern EN'),
        (da_path, False, 'Modern DA'),
    ]

    results = {}
    for filepath, is_kjv_web, label in editions:
        print(f"\nProcessing {label}...")
        new_data, counts = process_edition(filepath, kjv_boundaries, is_kjv_or_web=is_kjv_web,
                                           force_kjv_boundaries=True)
        results[filepath] = new_data

    print("\n--- Validation ---")
    all_valid = True
    for filepath, _, label in editions:
        if not validate(results[filepath], filepath):
            all_valid = False

    print("\n--- Cross-edition paragraph alignment ---")
    kjv_new = results[kjv_path]
    for filepath, _, label in editions[1:]:
        other = results[filepath]
        mismatches = 0
        for i in range(min(len(kjv_new['chapters']), len(other['chapters']))):
            kjv_count = len(kjv_new['chapters'][i]['paragraphs'])
            other_count = len(other['chapters'][i]['paragraphs'])
            if kjv_count != other_count:
                mismatches += 1
                if mismatches <= 5:
                    print(f"  MISMATCH ch{i+1} ({kjv_new['chapters'][i]['title']}): "
                          f"KJV={kjv_count}, {label}={other_count}")
        if mismatches == 0:
            print(f"  KJV vs {label}: all aligned")
        else:
            print(f"  KJV vs {label}: {mismatches} mismatches")
            all_valid = False

    if not all_valid:
        print("\nValidation failed. Not writing files.")
        sys.exit(1)

    print("\n--- Writing output files ---")
    for filepath, _, label in editions:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(results[filepath], f, ensure_ascii=False, indent=2)
        size_mb = os.path.getsize(filepath) / (1024 * 1024)
        print(f"  {label}: {filepath} ({size_mb:.1f} MB)")

    print("\n--- Spot checks ---")
    men_new = results[men_path]
    spot_checks = [
        ('Genesis 1', 1),
        ('Numbers 16', None),
        ('Psalms 23', None),
        ('Matthew 1', None),
        ('Revelation 22', None),
    ]
    for title, expected_num in spot_checks:
        found = [ch for ch in men_new['chapters'] if ch['title'] == title]
        if found:
            ch = found[0]
            first_para = ch['paragraphs'][0][:80] if ch['paragraphs'] else '(empty)'
            print(f"  {title} = chapter #{ch['number']}, {len(ch['paragraphs'])} paragraphs: {first_para}...")
        else:
            print(f"  {title}: NOT FOUND")

    print("\nDone!")


if __name__ == '__main__':
    main()
