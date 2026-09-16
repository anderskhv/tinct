#!/usr/bin/env python3
"""Library-wide screening pass: for every published book's characters.v1.json,
find capitalized words appearing frequently in the source text that are not
covered by any existing character's mentions (by literal surface text).

This is a *screening* tool, not a completeness certifier: it flags likely
gaps (high-frequency uncarded proper nouns) for prioritization. It cannot
detect wrong bindings, homonym conflations, or genuinely rare-but-important
single-mention figures the way the book-specific deep passes did.
"""
import json, re, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHAR_DIR = ROOT / 'app/public/data/characters'
ED_DIR = ROOT / 'app/public/data/editions'

STOP = set("""The But And If When Then Now There This That These Those His Her Their Our Your My I We You He She
It They Not No Yes For As So In On At By With From Or Nor Do Does Did Will Would Can Could Should Shall
May Might Must Have Has Had Is Are Was Were Be Been Being A An Well Certainly True Very Perhaps Suppose
Let Consider Observe Again Neither Either Even Still Yet Also Some Any All None Each Both Many Few More
Most Less Least Such What Who Whom Which How Why Where Here Come Says Said Yes Nay O Oh Chapter Book
Part One Two Three Four Five Six Seven Eight Nine Ten""".split())


def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n', ' '))


def scan_book(book_id):
    char_path = CHAR_DIR / f'{book_id}.v1.json'
    pkg = json.loads(char_path.read_text())
    results = {}
    for ek, ed in pkg['editions'].items():
        ed_path = ED_DIR / f'{book_id}-{ek}.json'
        if not ed_path.exists():
            continue
        src = json.loads(ed_path.read_bytes())
        full = '\n'.join(normalized(p) for c in src['chapters'] for p in c['paragraphs'])
        words = re.findall(r"\b[A-Z][a-zA-Z'’-]+\b", full)
        counts = collections.Counter(w for w in words if w not in STOP and len(w) > 2)
        covered_text = set()
        for m in ed['mentions']:
            covered_text.add(m['text'])
        # A candidate is "covered" if the bare word appears as a substring of
        # some covered alias text (handles "Prince Andrew" covering "Andrew").
        def is_covered(w):
            return any(w == t or (' ' + w) in (' ' + t) for t in covered_text)
        gaps = [(w, n) for w, n in counts.most_common(400) if n >= 8 and not is_covered(w)]
        results[ek] = gaps[:25]
    return results


def main():
    skip = {'bible', 'the-republic', 'war-and-peace'}  # already deep-passed
    books = sorted(p.stem[:-3] for p in CHAR_DIR.glob('*.v1.json'))
    report = {}
    for b in books:
        if b in skip:
            continue
        try:
            r = scan_book(b)
        except Exception as e:
            report[b] = {'error': str(e)}
            continue
        # Merge gap lists across editions, keep if flagged in ANY edition.
        merged = {}
        for ek, gaps in r.items():
            for w, n in gaps:
                merged[w] = max(merged.get(w, 0), n)
        if merged:
            report[b] = sorted(merged.items(), key=lambda x: -x[1])
    (Path(__file__).resolve().parent / 'library_scan_report.json').write_text(json.dumps(report, ensure_ascii=False, indent=1))
    total_flags = sum(len(v) for v in report.values() if isinstance(v, list))
    print(f'{len(report)} books with flagged candidates, {total_flags} total flagged words')


if __name__ == '__main__':
    main()
