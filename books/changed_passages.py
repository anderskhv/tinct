#!/usr/bin/env python3
"""Emit changed-passage records between two versions of an edition, for downstream audio invalidation.

Usage:
  python3 books/changed_passages.py <book-id> --edition modern-en --old <ref-or-path> --new <ref-or-path> [--out path.json]

<ref-or-path> is either a git ref (e.g. origin/main) — the edition file is read from that ref — or a path to a JSON file.
Record shape matches the pending_audio_regen key (book_id, edition_key, chapter_number, paragraph_index) plus patched_text,
with old_sha256/new_sha256 of the paragraph text added. Audio is not touched here; this only records what changed.
"""
import argparse, hashlib, json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_version(book, edition, ref):
    rel = f'app/public/data/editions/{book}-{edition}.json'
    p = Path(ref)
    if p.exists():
        raw = p.read_bytes()
    else:
        raw = subprocess.check_output(['git', '-C', str(ROOT), 'show', f'{ref}:{rel}'])
    d = json.loads(raw)
    return d['chapters'] if isinstance(d, dict) else d


def h(s):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('book'); ap.add_argument('--edition', default='modern-en')
    ap.add_argument('--old', required=True); ap.add_argument('--new', required=True)
    ap.add_argument('--out')
    a = ap.parse_args()
    old, new = load_version(a.book, a.edition, a.old), load_version(a.book, a.edition, a.new)
    if len(old) != len(new):
        sys.exit(f'chapter count differs: {len(old)} vs {len(new)}')
    recs, structural = [], []
    for o, n in zip(old, new):
        if len(o['paragraphs']) != len(n['paragraphs']):
            structural.append({'chapter_number': n['number'], 'old_count': len(o['paragraphs']), 'new_count': len(n['paragraphs'])})
            continue
        for i, (x, y) in enumerate(zip(o['paragraphs'], n['paragraphs'])):
            if x != y:
                recs.append({'book_id': a.book, 'edition_key': a.edition, 'chapter_number': n['number'],
                             'paragraph_index': i, 'old_sha256': h(x), 'new_sha256': h(y), 'patched_text': y})
    out = {'book_id': a.book, 'edition_key': a.edition, 'old': a.old, 'new': a.new,
           'changed_paragraphs': len(recs), 'changed_chapters': len({r['chapter_number'] for r in recs}),
           'structural_changes': structural, 'records': recs}
    if a.out:
        Path(a.out).write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(json.dumps({k: v for k, v in out.items() if k != 'records'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
