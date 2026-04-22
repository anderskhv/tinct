#!/usr/bin/env python3
"""Parse Candide (Fleming 1901, Gutenberg #19942) into Tinct edition JSON."""
import re, json
from pathlib import Path

SRC = '/Users/andershvelplund/Documents/Projects/Tinct/books/raw/candide/raw.txt'
OUT = '/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions/candide-original-en.json'

text = Path(SRC).read_text()

# Chapter headers: Roman numeral on its own line (may have trailing whitespace)
ch_re = re.compile(r'^([IVXL]+)[ \t]*$', re.MULTILINE)
matches = list(ch_re.finditer(text))
# Skip any before the real text (TOC). Real chapters start after line ~315 (I at line 316).
# Filter: keep ones that have a blank line + CAPS TITLE line following.
real = []
for m in matches:
    after = text[m.end():m.end()+400]
    # Title may wrap: match anything ending with .\n\n (blank line terminator)
    if re.match(r'\n\n[A-Z][A-Z .,\-;:!?\[\]0-9\'\n]+\.(\[\d+\])?\n\s*\n', after):
        real.append(m)

assert len(real) == 30, f"expected 30 chapters, got {len(real)}"

ROMAN = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10,
         'XI':11,'XII':12,'XIII':13,'XIV':14,'XV':15,'XVI':16,'XVII':17,'XVIII':18,'XIX':19,'XX':20,
         'XXI':21,'XXII':22,'XXIII':23,'XXIV':24,'XXV':25,'XXVI':26,'XXVII':27,'XXVIII':28,'XXIX':29,'XXX':30}

# End boundary — cut at FOOTNOTES: or *** END OF, whichever is first
end_pos = len(text)
for marker in [r'^FOOTNOTES:', r'^\*\*\* END OF']:
    mm = re.search(marker, text, re.MULTILINE)
    if mm:
        end_pos = min(end_pos, mm.start())

def clean_body(body):
    """Split into paragraphs."""
    # Split by blank lines
    blocks = re.split(r'\n\s*\n', body)
    paragraphs = []
    for b in blocks:
        b = b.strip()
        if not b:
            continue
        # Collapse internal newlines to spaces (prose)
        b = re.sub(r'\s*\n\s*', ' ', b)
        b = re.sub(r' +', ' ', b).strip()
        if len(b) < 5:
            continue
        paragraphs.append(b)
    return paragraphs

# Smart title-case
SMALL = {'a','an','and','or','of','the','in','on','at','to','for','with','by','from','as','is','but'}
def titlecase(s):
    words = s.split()
    cased = []
    for j, w in enumerate(words):
        wl = w.lower()
        if j > 0 and wl in SMALL:
            cased.append(wl)
        else:
            cased.append(w.capitalize())
    return ' '.join(cased)

chapters = []
for i, m in enumerate(real):
    roman = m.group(1)
    num = ROMAN[roman]
    after = text[m.end():m.end()+400]
    # Title line — may span multiple lines until blank line
    title_m = re.match(r'\n\n([A-Z][A-Z .,\-;:!?\[\]0-9\'\n]+?)\.(?:\[\d+\])?\n\s*\n', after)
    if title_m:
        title = title_m.group(1).replace('\n', ' ').strip()
        body_start = m.end() + title_m.end()
    else:
        title = ''
        body_start = m.end()

    body_end = real[i+1].start() if i+1 < len(real) else end_pos
    body = text[body_start:body_end]
    paragraphs = clean_body(body)

    title_clean = titlecase(title)
    title_full = f"Chapter {roman} — {title_clean}"

    chapters.append({
        "number": num,
        "title": title_full,
        "paragraphs": paragraphs,
    })

total_paras = sum(len(c['paragraphs']) for c in chapters)
total_words = sum(len(p.split()) for c in chapters for p in c['paragraphs'])
print(f"Chapters: {len(chapters)}")
for c in chapters:
    w = sum(len(p.split()) for p in c['paragraphs'])
    print(f"  ch{c['number']:2}: {c['title'][:60]:60} — {len(c['paragraphs']):3} paras, {w:5,}w")
print(f"\nTotal: {total_paras} paragraphs, {total_words:,} words")

with open(OUT, 'w') as f:
    json.dump({"chapters": chapters}, f, indent=2, ensure_ascii=False)
print(f"\nWrote {OUT}")
