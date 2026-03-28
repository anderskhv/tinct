#!/usr/bin/env python3
"""Extract NT chapters at indices 58, 59, 60, 61, 65 from KJV JSON."""
import json

kjv_path = '/Users/andershvelplund/Documents/Projects/Tinct/tinct/public/data/editions/bible-kjv-en.json'
output_path = '/Users/andershvelplund/Documents/Projects/Tinct/books/nt-5-source.json'

with open(kjv_path, 'r') as f:
    data = json.load(f)

chapters = data['chapters']
print(f"Total chapters: {len(chapters)}")

# Extract by index
for idx in [58, 59, 60, 61, 65]:
    ch = chapters[idx]
    print(f"Index {idx}: title={ch['title']}, number={ch['number']}, paragraphs={len(ch['paragraphs'])}")
    # Print first paragraph for verification
    print(f"  First para: {ch['paragraphs'][0][:100]}")

# Save the 5 chapters
target = [chapters[i] for i in [58, 59, 60, 61, 65]]
with open(output_path, 'w') as f:
    json.dump({'chapters': target}, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(target)} chapters to {output_path}")
