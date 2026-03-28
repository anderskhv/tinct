#!/usr/bin/env python3
"""Extract 5 NT books from KJV JSON at indices 58,59,60,61,65 and save to separate files."""
import json

kjv_path = '/Users/andershvelplund/Documents/Projects/Tinct/tinct/public/data/editions/bible-kjv-en.json'

with open(kjv_path, 'r') as f:
    data = json.load(f)

chapters = data['chapters']
print(f"Total chapters: {len(chapters)}")

indices = [58, 59, 60, 61, 65]
for idx in indices:
    ch = chapters[idx]
    print(f"\nIndex {idx}: title='{ch['title']}', number={ch['number']}, paragraphs={len(ch['paragraphs'])}")
    out_path = f"/Users/andershvelplund/Documents/Projects/Tinct/books/kjv-ch{idx}-source.json"
    with open(out_path, 'w') as f:
        json.dump(ch, f, ensure_ascii=False, indent=2)
    print(f"  -> Saved to {out_path}")
    # Print first paragraph
    if ch['paragraphs']:
        print(f"  First para: {ch['paragraphs'][0][:150]}")
