#!/usr/bin/env python3
"""Extract specific chapters from KJV JSON for review."""
import json
import sys

kjv_path = '/Users/andershvelplund/Documents/Projects/Tinct/tinct/src/data/editions/bible-kjv-en.json'
output_path = '/Users/andershvelplund/Documents/Projects/Tinct/books/extracted-chapters.json'

with open(kjv_path, 'r') as f:
    data = json.load(f)

# Extract chapters 23-39
target_chapters = [c for c in data['chapters'] if 23 <= c['number'] <= 39]

with open(output_path, 'w') as f:
    json.dump({'chapters': target_chapters}, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(target_chapters)} chapters:")
for c in target_chapters:
    print(f"  Ch {c['number']}: {c['title']} — {len(c['paragraphs'])} paragraphs")
