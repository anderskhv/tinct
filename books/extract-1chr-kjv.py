#!/usr/bin/env python3
"""Extract 1 Chronicles paragraphs 150-198 from KJV JSON."""
import json

with open('/Users/andershvelplund/Documents/Projects/Tinct/tinct/public/data/editions/bible-kjv-en.json') as f:
    data = json.load(f)

# Find 1 Chronicles by index 12
ch = data['chapters'][12]
print(f"Chapter index 12: {ch['title']}")
print(f"Total paragraphs: {len(ch['paragraphs'])}")
print()

# Extract paragraphs 150-198
paragraphs = ch['paragraphs'][150:199]
print(f"Paragraphs 150-198 ({len(paragraphs)} paragraphs):")
print()
for i, p in enumerate(paragraphs):
    print(f"[{150+i}] {p}")
    print()

# Save extracted paragraphs
with open('/Users/andershvelplund/Documents/Projects/Tinct/books/1chr-kjv-p150-198.json', 'w') as f:
    json.dump(paragraphs, f, ensure_ascii=False, indent=2)

print("Saved to 1chr-kjv-p150-198.json")
