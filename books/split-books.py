#!/usr/bin/env python3
"""Split extracted chapters into individual book files."""
import json
import os

with open('/Users/andershvelplund/Documents/Projects/Tinct/books/extracted-chapters.json', 'r') as f:
    data = json.load(f)

out_dir = '/Users/andershvelplund/Documents/Projects/Tinct/books/raw-books'
os.makedirs(out_dir, exist_ok=True)

for chapter in data['chapters']:
    num = chapter['number']
    title = chapter['title'].lower().replace(' ', '-')
    filename = f'{out_dir}/ch{num:02d}-{title}.json'
    with open(filename, 'w') as f:
        json.dump(chapter, f, ensure_ascii=False, indent=2)
    print(f"Written: ch{num:02d}-{title}.json ({len(chapter['paragraphs'])} paragraphs)")
