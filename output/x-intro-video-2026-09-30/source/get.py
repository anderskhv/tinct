import re, urllib.request, os
css = open('fonts.css').read()
blocks = re.findall(r'/\* ([a-z-]+) \*/\s*(@font-face \{.*?\})', css, re.S)
out = []
for subset, b in blocks:
    if subset not in ('latin','latin-ext'): continue
    url = re.search(r'url\((.*?)\)', b).group(1)
    name = url.split('/')[-1]
    if not os.path.exists(name):
        urllib.request.urlretrieve(url, name)
    out.append(b.replace(url, name))
open('local.css','w').write('\n'.join(out))
print(len(out), 'faces')
