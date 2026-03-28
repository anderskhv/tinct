#!/usr/bin/env python3
"""Extract Psalms paragraphs 92-183 from KJV for translation."""
import json

kjv_path = '/Users/andershvelplund/Documents/Projects/Tinct/tinct/public/data/editions/bible-kjv-en.json'
output_path = '/Users/andershvelplund/Documents/Projects/Tinct/books/psalms-kjv-p92-183.json'

with open(kjv_path, 'r') as f:
    data = json.load(f)

# Find Psalms chapter (index 18)
psalms = None
for ch in data['chapters']:
    if ch.get('title') == 'Psalms':
        psalms = ch
        break

if not psalms:
    print("ERROR: Psalms not found")
    exit(1)

total = len(psalms['paragraphs'])
print(f"Psalms total paragraphs: {total}")

# Extract paragraphs 92-183 (0-indexed)
target = psalms['paragraphs'][92:184]
print(f"Extracting {len(target)} paragraphs (indices 92-183)")

with open(output_path, 'w') as f:
    json.dump({'paragraphs': target}, f, ensure_ascii=False, indent=2)

print(f"Written to {output_path}")
for i, p in enumerate(target):
    print(f"P{92+i}: {p[:100]}")
