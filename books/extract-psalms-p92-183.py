#!/usr/bin/env python3
"""Extract Psalms paragraphs 92-183 from KJV JSON for translation."""
import json

kjv_path = '/Users/andershvelplund/Documents/Projects/Tinct/tinct/public/data/editions/bible-kjv-en.json'
output_path = '/Users/andershvelplund/Documents/Projects/Tinct/books/psalms-kjv-p92-183.json'

with open(kjv_path, 'r') as f:
    data = json.load(f)

# Find Psalms chapter (index 18, should be title "Psalms")
psalms = None
for i, ch in enumerate(data['chapters']):
    if ch.get('title') == 'Psalms':
        psalms = ch
        psalms_idx = i
        break

if not psalms:
    print("ERROR: Psalms not found")
    exit(1)

total = len(psalms['paragraphs'])
print(f"Chapter index {psalms_idx}: {psalms['title']}")
print(f"Total paragraphs: {total}")

# Extract paragraphs 92-183 (0-indexed, inclusive)
target = psalms['paragraphs'][92:184]
print(f"Extracting {len(target)} paragraphs (indices 92-183)")
print()

for i, p in enumerate(target):
    print(f"--- P{92+i} ---")
    print(p)
    print()

# Save to JSON with indentation for readability
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(target, f, ensure_ascii=False, indent=2)

print(f"\nSaved to {output_path}")
