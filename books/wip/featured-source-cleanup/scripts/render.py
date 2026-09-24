#!/usr/bin/env python3
"""Render <book>/CHANGES.md (exact before/after text + Gutenberg evidence) from CHANGES.json.
Evidence line numbers are located in the Gutenberg files at run time, not typed by hand."""
import json, os, subprocess

ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True, check=True).stdout.strip()
PKG = os.path.join(ROOT, 'books/wip/featured-source-cleanup')
S = json.load(open(os.path.join(PKG, 'build-summary.json')))
MAIN = S['pins']['main']

def gut(book):
    if book == 'odyssey':
        b = subprocess.run(['git', '-C', ROOT, 'show', S['pins']['odyssey'] + ':books/staged-replacements/odyssey/source-texts/pg1727-butler-1900.txt'], capture_output=True, check=True).stdout
        return 'PG #1727 (`books/staged-replacements/odyssey/source-texts/pg1727-butler-1900.txt` @ ' + S['pins']['odyssey'][:8] + ')', b.decode('utf-8-sig').replace('\r', '').split('\n')
    b = subprocess.run(['git', '-C', ROOT, 'show', f'{MAIN}:books/raw/{book}/raw.txt'], capture_output=True, check=True).stdout
    return f'`books/raw/{book}/raw.txt` @ main {MAIN[:8]}', b.decode('utf-8-sig').replace('\r', '').split('\n')

def excerpt(L, n, before=3, after=3):
    lo, hi = max(0, n - 1 - before), min(len(L), n + after)
    return '\n'.join(f'{k + 1:>6}  {L[k]}' for k in range(lo, hi))

def find(L, needle, start=0):
    for k in range(start, len(L)):
        if needle in L[k]:
            return k + 1
    raise SystemExit(f'evidence not found: {needle!r}')

def q(s):
    return '\n'.join('> ' + line for line in s.split('\n'))

def main():
    for book in S['books']:
        recs = json.load(open(os.path.join(PKG, book, 'CHANGES.json')))
        label, L = gut(book)
        out = [f'# {book} — change records', '',
               f'Coordinates are `chapter.index` (chapter number 1-based, paragraph index 0-based) in the pinned input. Gutenberg evidence: {label}.', '']
        seen = set()
        for r in sorted(recs, key=lambda r: (int(r['at'].split('.')[0]), int(r['at'].split('.')[1].split('+')[0]), r['edition'] != 'original-en')):
            key = r['at']
            if key not in seen:
                seen.add(key)
                out += [f'## {r["at"]} — {r["op"]}', '']
                # evidence
                if book == 'jane-eyre' and r['op'] == 'delete' and r['edition'] == 'original-en':
                    first = r['before'].split('\n')[0][:45]
                    hits = [k + 1 for k in range(len(L)) if first in L[k]]
                    cap = [h for h in hits if L[h - 2] == '' and L[h - 3] == '']
                    out += ['Evidence: the caption is set off by two blank lines and has no closing punctuation; the narrative line it repeats is nearby.', '', '```', excerpt(L, cap[-1], 5, 2), '```', '']
                if book == 'pride-and-prejudice' and r['edition'] == 'original-en':
                    needle = ' '.join(r['before'][0].split()[-3:])
                    n = [k + 1 for k in range(len(L)) if L[k].rstrip().endswith(needle) and '[Illustration' in '\n'.join(L[k:k + 4])][0]
                    out += ['Evidence: Gutenberg inserts a George Allen illustration inside one paragraph; the sentence continues after it.', '', '```', excerpt(L, n, 1, 8), '```', '']
                if book == 'jane-eyre' and r['op'] == 'edit':
                    n = find(L, 'she yelled and gave a spring, and the next minute she lay')
                    out += ['Evidence: the source sentence runs through to the fall inside 36.52; the modern text had stopped at the leap and relied on caption 36.53 for the rest.', '', '```', excerpt(L, n, 2, 2), '```', '']
                if book == 'odyssey':
                    n = find(L, 'Now when the sun had set and darkness was over the land,')
                    out += ['Evidence: Butler ends Book III on this clause (his Preface: "Books ii. and iii. end with a comma"); Book IV opens lower-case on its apodosis.', '', '```', excerpt(L, n, 4, 12), '```', '']
            out += [f'**{r["edition"]}** — {r["reason"]}' + (f' (duplicates `{r["duplicate_of"]}`)' if r.get('duplicate_of') else ''), '']
            if isinstance(r['before'], list):
                out += ['Before (two paragraphs):', '', q(r['before'][0]), '', q(r['before'][1]), '']
            else:
                out += ['Before:', '', q(r['before']), '']
            out += ['After:', '', q(r['after']) if r['after'] is not None else '> *(paragraph removed)*', '']
        open(os.path.join(PKG, book, 'CHANGES.md'), 'w').write('\n'.join(out))
        print(book, len(recs), 'records rendered')

if __name__ == '__main__':
    main()
