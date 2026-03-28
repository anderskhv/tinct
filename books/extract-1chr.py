import json

with open('/Users/andershvelplund/Documents/Projects/Tinct/tinct/public/data/editions/bible-kjv-en.json') as f:
    data = json.load(f)

ch = data['chapters'][12]
print(f"Chapter: {ch['title']}, Total paragraphs: {len(ch['paragraphs'])}")
paragraphs = ch['paragraphs'][150:199]
print(json.dumps(paragraphs, indent=2, ensure_ascii=False))
