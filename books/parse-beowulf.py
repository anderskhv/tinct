#!/usr/bin/env python3
"""Parse Beowulf (Hall 1892, Gutenberg #16328) into Tinct edition JSON."""
import re, json
from pathlib import Path

SRC = '/Users/andershvelplund/Documents/Projects/Tinct/books/raw/beowulf/raw.txt'
OUT = '/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions/beowulf-original-en.json'

text = Path(SRC).read_text()

# Find all fitt headers (Roman numeral followed by period at start of line)
# Lines like "I.", "II.", ... "XLIII." standalone
fitt_re = re.compile(r'^([IVXL]+)\.$', re.MULTILINE)
matches = [m for m in fitt_re.finditer(text)]
# Filter: real fitt headers are followed by a blank line and then a TITLE LINE in caps
real = []
for m in matches:
    after = text[m.end():m.end()+200]
    # Real fitts have blank line then ALL CAPS title
    if re.match(r'\n\n[A-Z][A-Za-zÆæÞþÐð _\(\)\.,\'\-]+\.\n', after):
        real.append(m)

assert len(real) == 43, f"expected 43 fitts, got {len(real)}"

ROMAN = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10,
         'XI':11,'XII':12,'XIII':13,'XIV':14,'XV':15,'XVI':16,'XVII':17,'XVIII':18,'XIX':19,'XX':20,
         'XXI':21,'XXII':22,'XXIII':23,'XXIV':24,'XXV':25,'XXVI':26,'XXVII':27,'XXVIII':28,'XXIX':29,'XXX':30,
         'XXXI':31,'XXXII':32,'XXXIII':33,'XXXIV':34,'XXXV':35,'XXXVI':36,'XXXVII':37,'XXXVIII':38,'XXXIX':39,'XL':40,
         'XLI':41,'XLII':42,'XLIII':43}

# End boundary: Project Gutenberg license starts after fitt XLIII
end_m = re.search(r'\*\*\* END OF', text)
end_pos = end_m.start() if end_m else len(text)
# "ADDITIONAL NOTES" / "GLOSSARY" only matters if AFTER last fitt — front matter has same headers
last_fitt_pos = real[-1].start()
for marker in [r'^ADDITIONAL NOTES', r'^ADDENDA\.', r'^GLOSSARY OF PROPER NAMES', r'^FOOTNOTES?:']:
    mm = re.search(marker, text[last_fitt_pos:], re.MULTILINE)
    if mm:
        end_pos = min(end_pos, last_fitt_pos + mm.start())

def clean_fitt_body(body):
    """Strip {margin notes}, footnotes, line numbers; group into stanzas."""
    # Remove {multiline curly brace notes}
    body = re.sub(r'\{[^}]*\}', '', body, flags=re.DOTALL)
    # Remove footnote definitions at end (block of lines starting with `    [N]`)
    # Find first such line and cut everything after
    fn_m = re.search(r'\n    \[\d+\]', body)
    if fn_m:
        body = body[:fn_m.start()]
    # Remove inline footnote markers [N]
    body = re.sub(r'\[\d+\]', '', body)
    # Remove line numbers — pattern is whitespace + digits + space at start of line
    body = re.sub(r'^\s*\d+\s', '          ', body, flags=re.MULTILINE)
    # Remove asterisk-separator lines (lacuna markers)
    body = re.sub(r'^\s*\*[\s\*]+\*\s*$', '', body, flags=re.MULTILINE)

    # Split into stanzas by blank lines, keep verse lines as-is within stanza
    raw_blocks = re.split(r'\n\s*\n', body)
    stanzas = []
    for b in raw_blocks:
        b = b.strip('\n')
        if not b.strip():
            continue
        # Dedent each line
        lines = [ln.strip() for ln in b.split('\n') if ln.strip()]
        if not lines:
            continue
        stanza = '\n'.join(lines)
        stanzas.append(stanza)
    return stanzas

chapters = []
for i, m in enumerate(real):
    roman = m.group(1)
    num = ROMAN[roman]
    # Title is the next non-blank line after the header
    after = text[m.end():m.end()+200]
    title_m = re.match(r'\n\n([A-Z][A-Za-zÆæÞþÐð _\(\)\.,\'\-]+)\.\n', after)
    title = title_m.group(1).strip() if title_m else ''
    # Strip underscores (used for italic markup in source) and clean
    title_clean = title.replace('_', '').replace('  ', ' ').strip()
    # Convert ".--" to " — " (common subtitle separator)
    title_clean = title_clean.replace('.--', ' — ').replace('--', ' — ')
    # Smart title-case: keep small words lowercase
    SMALL = {'a','an','and','or','of','the','in','on','at','to','for','with','by','from','as','is'}
    parts = title_clean.split(' — ')
    fixed_parts = []
    for part in parts:
        words = part.split()
        cased = []
        for j, w in enumerate(words):
            wl = w.lower()
            if j > 0 and wl in SMALL:
                cased.append(wl)
            else:
                cased.append(w.capitalize())
        fixed_parts.append(' '.join(cased))
    title_clean = ' — '.join(fixed_parts).replace("'S", "'s")
    title_full = f"Fitt {roman} — {title_clean}"

    body_start = m.end() + (title_m.end() if title_m else 0)
    body_end = real[i+1].start() if i+1 < len(real) else end_pos
    body = text[body_start:body_end]

    paragraphs = clean_fitt_body(body)
    if not paragraphs:
        print(f"WARN fitt {num} has no paragraphs!")
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
    print(f"  fitt{c['number']:2}: {c['title'][:50]:50} — {len(c['paragraphs']):3} paras, {w:5,}w")
print(f"\nTotal: {total_paras} stanzas, {total_words:,} words")

with open(OUT, 'w') as f:
    json.dump({"chapters": chapters}, f, indent=2, ensure_ascii=False)
print(f"\nWrote {OUT}")
