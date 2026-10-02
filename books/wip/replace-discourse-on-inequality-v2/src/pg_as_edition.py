import re, json, os
here = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(here, 'pg11136.txt'), encoding='utf-8').read()
a = t.index('A DISCOURSE UPON THE ORIGIN AND THE FOUNDATION OF THE INEQUALITY AMONG\nMANKIND')
b = t.index('*** END')
paras = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', t[a:b]) if p.strip()]
json.dump({'chapters': [{'number': 1, 'title': 'pg', 'paragraphs': paras}]}, open(os.path.join(here, 'pg11136-as-edition.json'), 'w'))
print(len(paras))
