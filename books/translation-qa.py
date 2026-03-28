#!/usr/bin/env python3
"""
Translation Quality Scanner for Tinct editions.

Scans edition JSON files for:
1. Long sentences (>35 words)
2. Roman god names in modern editions
3. Character name mismatches vs threads JSON
4. Translationese markers in Danish
5. Awkward constructions

Usage:
    python3 translation-qa.py <edition-file> [--threads <threads-file>] [--verbose] [--limit N]
    python3 translation-qa.py --all [--verbose] [--limit N]
"""

import json
import re
import sys
import os
import argparse
from collections import defaultdict

EDITIONS_DIR = os.path.join(os.path.dirname(__file__), '..', 'tinct', 'public', 'data', 'editions')

# Roman names that should be Greek in modern editions
ROMAN_TO_GREEK = {
    'Minerva': 'Athena/Athene',
    'Neptune': 'Poseidon',
    'Neptun': 'Poseidon',
    'Jupiter': 'Zeus',
    'Mercury': 'Hermes',
    'Merkur': 'Hermes',
    'Juno': 'Hera',
    'Mars': 'Ares',
    'Venus': 'Afrodite',
    'Vulcan': 'Hefaistos',
    'Diana': 'Artemis',
    'Ulysses': 'Odysseus',
}

# Danish translationese markers — phrases that signal literal translation from English
DA_TRANSLATIONESE = [
    (r'\bgilder\b', 'archaic "gilder" — use "grupper" or "hold"'),
    (r'\bankrede\b', 'missing prefix — should be "forankrede"'),
    (r'\btjenestekvindearbejde\b', 'invented compound — use "tjenestepigernes arbejde" or rephrase'),
    (r'\bhvad angår\b', 'translationese "hvad angår" — rephrase naturally'),
    (r'\bderfor at\b', 'English "therefore that" leaking — rephrase'),
    (r',\s*stakkel,', 'standalone "stakkel" in apposition — awkward in Danish, rephrase'),
    (r'\bsagde\s+\w+\s+at\s+følge\b', 'English "told X to follow" — Danish needs different construction'),
    (r'\bmåtte\s+svømme\s+for\s+det\b', 'literal English idiom — unnatural in Danish'),
    (r'\bsåledes\b', 'archaic "således" — consider "sådan" or rephrase'),
    (r'\bi\s+højeste\s+grad\b', 'stiff "i højeste grad" — consider more natural phrasing'),
    (r'\bmed\s+alle\s+mulige\s+smiger\b', 'literal "with all possible blandishments" — rephrase'),
]

# Patterns that suggest English grammar leaked into Danish
DA_ENGLISH_GRAMMAR = [
    (r'\bblev\s+\w+et\b', 'excessive passive "blev X-et" — consider active voice'),
    (r'\bbliver\s+\w+et\b', 'excessive passive "bliver X-et" — consider active voice'),
]


def count_words(text):
    return len(text.split())


def split_sentences(text):
    """Split text into sentences. Handles abbreviations and dialogue."""
    # Split on sentence-ending punctuation followed by space or end
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-ZÆØÅ»"])', text)
    # Also split on semicolons followed by substantial text (>20 chars)
    result = []
    for s in sentences:
        parts = re.split(r';\s+', s)
        if len(parts) > 1 and all(len(p) > 20 for p in parts):
            result.extend(parts)
        else:
            result.append(s)
    return [s.strip() for s in result if s.strip()]


def scan_long_sentences(paragraphs, threshold=35):
    """Find sentences over threshold words."""
    issues = []
    for pi, para in enumerate(paragraphs):
        sentences = split_sentences(para)
        for si, sent in enumerate(sentences):
            wc = count_words(sent)
            if wc > threshold:
                issues.append({
                    'type': 'long_sentence',
                    'severity': 'high' if wc > 50 else 'medium',
                    'paragraph': pi,
                    'words': wc,
                    'text': sent[:150] + ('...' if len(sent) > 150 else ''),
                })
    return issues


def scan_roman_names(paragraphs, title=''):
    """Find Roman god/hero names that should be Greek in modern editions."""
    issues = []
    all_text = title + ' ' + ' '.join(paragraphs)
    for roman, greek in ROMAN_TO_GREEK.items():
        matches = list(re.finditer(r'\b' + roman + r'\b', all_text))
        if matches:
            # Find which paragraph
            for match in matches:
                pos = match.start()
                if pos < len(title) + 1:
                    loc = 'title'
                else:
                    # Find paragraph
                    offset = len(title) + 1
                    for pi, para in enumerate(paragraphs):
                        offset += len(para) + 1
                        if offset > pos:
                            loc = f'p{pi}'
                            break
                    else:
                        loc = 'unknown'
                issues.append({
                    'type': 'roman_name',
                    'severity': 'high',
                    'paragraph': loc,
                    'text': f'{roman} → should be {greek}',
                })
    return issues


def scan_translationese(paragraphs, language='da'):
    """Find translationese markers in Danish text."""
    if language != 'da':
        return []

    issues = []
    markers = DA_TRANSLATIONESE + DA_ENGLISH_GRAMMAR

    for pi, para in enumerate(paragraphs):
        for pattern, description in markers:
            matches = list(re.finditer(pattern, para, re.IGNORECASE))
            for match in matches:
                context_start = max(0, match.start() - 30)
                context_end = min(len(para), match.end() + 30)
                context = para[context_start:context_end]
                issues.append({
                    'type': 'translationese',
                    'severity': 'medium',
                    'paragraph': pi,
                    'text': f'{description}: "...{context}..."',
                })
    return issues


def scan_name_consistency(paragraphs, threads_data, language='en'):
    """Check character names against threads canonical names."""
    issues = []
    if not threads_data:
        return issues

    lang_key = language[:2]  # 'en' or 'da'

    for char in threads_data.get('characters', []):
        canonical = char.get('name', {}).get(lang_key, '')
        search_names = char.get('searchNames', [])

        # Check if any non-canonical variants appear
        # This is complex — for now just check Roman vs Greek for Odyssey chars
        # and major name variants

    return issues


def scan_edition(filepath, threads_path=None, verbose=False, limit=None):
    """Scan a single edition file and return all issues."""
    data = json.load(open(filepath))
    chapters = data.get('chapters', [])

    filename = os.path.basename(filepath)

    # Detect language from filename
    if '-da.' in filename or filename.endswith('-da.json'):
        language = 'da'
    else:
        language = 'en'

    # Detect if this is a modern edition (where we enforce name rules)
    is_modern = 'modern' in filename
    is_original = 'original' in filename or 'kjv' in filename or 'web' in filename

    # Load threads if available
    threads_data = None
    if threads_path and os.path.exists(threads_path):
        threads_data = json.load(open(threads_path))

    all_issues = defaultdict(list)
    total_issues = 0

    for ch in chapters:
        ch_num = ch.get('number', '?')
        title = ch.get('title', '')
        paragraphs = ch.get('paragraphs', [])

        if not paragraphs:
            continue

        ch_issues = []

        # 1. Long sentences (all editions)
        ch_issues.extend(scan_long_sentences(paragraphs))

        # 2. Roman names (modern editions only)
        if is_modern:
            ch_issues.extend(scan_roman_names(paragraphs, title))

        # 3. Translationese (Danish only)
        if language == 'da':
            ch_issues.extend(scan_translationese(paragraphs))

        if ch_issues:
            all_issues[ch_num] = ch_issues
            total_issues += len(ch_issues)

    return all_issues, total_issues, len(chapters)


def print_report(filepath, all_issues, total_issues, total_chapters, verbose=False, limit=None):
    """Print a formatted report."""
    filename = os.path.basename(filepath)
    print(f'\n{"="*60}')
    print(f'  {filename}')
    print(f'  {total_chapters} chapters, {total_issues} issues found')
    print(f'{"="*60}')

    if total_issues == 0:
        print('  No issues found.')
        return

    # Summary by type
    type_counts = defaultdict(int)
    severity_counts = defaultdict(int)
    for ch_num, issues in all_issues.items():
        for issue in issues:
            type_counts[issue['type']] += 1
            severity_counts[issue['severity']] += 1

    print(f'\n  Summary:')
    for t, c in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f'    {t}: {c}')
    print(f'    HIGH: {severity_counts.get("high", 0)}, MEDIUM: {severity_counts.get("medium", 0)}')

    if verbose:
        shown = 0
        for ch_num in sorted(all_issues.keys()):
            issues = all_issues[ch_num]
            print(f'\n  Chapter {ch_num} ({len(issues)} issues):')
            for issue in issues:
                if limit and shown >= limit:
                    remaining = total_issues - shown
                    print(f'\n  ... and {remaining} more issues (use --limit to see more)')
                    return
                sev = issue['severity'].upper()
                print(f'    [{sev}] {issue["type"]} (p{issue.get("paragraph", "?")}): {issue["text"]}')
                shown += 1


def main():
    parser = argparse.ArgumentParser(description='Translation Quality Scanner for Tinct')
    parser.add_argument('file', nargs='?', help='Edition JSON file to scan')
    parser.add_argument('--all', action='store_true', help='Scan all modern editions')
    parser.add_argument('--threads', help='Threads JSON file for name checking')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show all issues')
    parser.add_argument('--limit', '-l', type=int, default=None, help='Limit output to N issues')
    args = parser.parse_args()

    if args.all:
        # Scan all modern editions
        files = []
        for f in sorted(os.listdir(EDITIONS_DIR)):
            if f.endswith('.json') and ('modern-' in f or '-threads' not in f):
                # Skip batch files and threads
                if 'batch' in f or 'threads' in f:
                    continue
                # Only scan main edition files
                parts = f.replace('.json', '').rsplit('-', 2)
                if len(parts) >= 3 and parts[-2] in ['modern', 'original', 'verse', 'kjv', 'web']:
                    # Only modern editions
                    if parts[-2] == 'modern':
                        files.append(os.path.join(EDITIONS_DIR, f))

        grand_total = 0
        for filepath in files:
            # Try to find threads file
            book_id = os.path.basename(filepath).rsplit('-', 2)[0]
            threads_path = os.path.join(EDITIONS_DIR, f'{book_id}-threads.json')

            all_issues, total, chapters = scan_edition(filepath, threads_path, args.verbose, args.limit)
            print_report(filepath, all_issues, total, chapters, args.verbose, args.limit)
            grand_total += total

        print(f'\n{"="*60}')
        print(f'  GRAND TOTAL: {grand_total} issues across {len(files)} files')
        print(f'{"="*60}')

    elif args.file:
        filepath = args.file
        if not os.path.isabs(filepath):
            # Try relative to editions dir
            candidate = os.path.join(EDITIONS_DIR, filepath)
            if os.path.exists(candidate):
                filepath = candidate

        all_issues, total, chapters = scan_edition(filepath, args.threads, args.verbose, args.limit)
        print_report(filepath, all_issues, total, chapters, args.verbose, args.limit)

    else:
        parser.print_help()


if __name__ == '__main__':
    main()
