#!/usr/bin/env python3
"""Pinned, fail-closed Gutenberg HTML -> Tinct reader edition. Python stdlib only."""
import hashlib
import json
import re
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = 'https://www.gutenberg.org/cache/epub/35/pg35-images.html'
SOURCE_SHA256 = 'c2749206d5faf4213d6a0c204d5ae1419d8642f34ca0b32d10f793278b80b584'

class Chapters(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.chapters = []
        self.depth = 0
        self.capture = None
        self.parts = []
        self.italics = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'div':
            if self.depth:
                self.depth += 1
            elif attrs.get('class') == 'chapter':
                self.depth = 1
                self.chapters.append({'number': len(self.chapters) + 1, 'title': '', 'paragraphs': []})
        if not self.depth:
            return
        if tag in ('h2', 'p'):
            if self.capture:
                raise ValueError('Unexpected nested reading block')
            self.capture, self.parts = tag, []
        elif tag == 'br' and self.capture:
            self.parts.append(' ')
        elif tag == 'i':
            self.italics += 1
        elif tag not in ('a', 'div'):
            raise ValueError(f'Unsupported chapter element: {tag}')

    def handle_endtag(self, tag):
        if not self.depth:
            return
        if tag == self.capture:
            text = re.sub(r'\s+', ' ', ''.join(self.parts)).strip()
            if not text:
                raise ValueError('Empty reading block')
            if tag == 'h2':
                self.chapters[-1]['title'] = text
            else:
                self.chapters[-1]['paragraphs'].append(text)
            self.capture = None
        if tag == 'div':
            self.depth -= 1

    def handle_data(self, text):
        if self.capture:
            self.parts.append(text)
        elif self.depth and text.strip():
            raise ValueError(f'Uncaptured text inside chapter: {text!r} at {self.getpos()}')

def build():
    cached = ROOT / 'addbooks/.cache/pg35.html'
    cached.parent.mkdir(parents=True, exist_ok=True)
    if not cached.exists():
        with urllib.request.urlopen(SOURCE, timeout=45) as response:
            raw = response.read(2_000_001)
        if len(raw) > 2_000_000:
            raise ValueError('Source exceeds pilot size limit')
        cached.write_bytes(raw)
    raw = cached.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != SOURCE_SHA256:
        raise ValueError('Source changed; inspect it and explicitly update the pinned checksum before rebuilding')
    html = raw.decode('utf-8')
    assert '<strong>Title</strong>: The Time Machine' in html
    assert '<strong>Author</strong>: H. G. Wells' in html
    assert '<strong>Language</strong>: English' in html
    parser = Chapters()
    # Pinned source has one literal stray ">" after chapter IV's heading.
    artifact = 'Time Travelling</h2>&gt;'
    assert html.count(artifact) == 1
    parser.feed(html.replace(artifact, 'Time Travelling</h2>'))
    chapters = parser.chapters
    assert len(chapters) == 17 and chapters[-1]['title'] == 'Epilogue'
    assert all(c['title'] and c['paragraphs'] for c in chapters)
    text = '\n'.join(p for c in chapters for p in c['paragraphs'])
    assert text.startswith('The Time Traveller (for so it will be convenient to speak of him)')
    assert text.endswith('gratitude and a mutual tenderness still lived on in the heart of man.')
    assert not re.search(r'Project Gutenberg|START OF|END OF|<[^>]+>', text)
    data = (json.dumps({'chapters': chapters}, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
    destination = ROOT / 'app/public/data/editions/pd-35-original-en.json'
    destination.write_bytes(data)
    report = {
        'bookId': 'pd-35', 'title': 'The Time Machine', 'author': 'H. G. Wells',
        'sourceId': '35', 'source': SOURCE, 'catalogue': 'https://www.gutenberg.org/ebooks/35',
        'rights': 'Public domain in the USA (Gutenberg catalogue); original English text, 1895. H. G. Wells died in 1946.',
        'sourceSha256': digest, 'editionSha256': hashlib.sha256(data).hexdigest(),
        'chapters': len(chapters), 'paragraphs': sum(len(c['paragraphs']) for c in chapters),
        'words': len(text.split()), 'bytes': len(data),
        'paragraphsPerChapter': [len(c['paragraphs']) for c in chapters],
        'limitations': [f'{parser.italics} italic spans flattened to plain text; words retained.',
                         'Title page, cover image, duplicate contents and Gutenberg boilerplate excluded from reading text.',
                         'Removed one stray greater-than sign after chapter IV heading in the pinned source.',
                         'Source-specific converter; not a general HTML/EPUB importer.'],
    }
    (ROOT / 'app/public/data/imports/pd-35-provenance.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    build()
