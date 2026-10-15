import pymupdf, re, html
def body(path):
    t = open(path, encoding='utf-8').read().replace('\r', '')
    s = t.index('***', t.index('*** START')) ; s = t.index('\n', t.index('*** START')) + 1
    e = t.index('*** END')
    return t[s:e].strip()
def paras(txt):
    return [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', txt) if p.strip()]
def build(out, title, author, sections, paper='a5'):
    css = "body{font-family:serif;font-size:11pt;line-height:1.45} h1{font-size:20pt;text-align:center;margin-bottom:4pt} .au{text-align:center;font-style:italic;margin-bottom:18pt} h2{font-size:14pt;text-align:center;margin-top:16pt} p{text-indent:1.2em;margin:0 0 4pt 0;text-align:justify}"
    h = f"<h1>{html.escape(title)}</h1><p class='au'>{html.escape(author)}</p>"
    for head, ps in sections:
        if head: h += f"<h2>{html.escape(head)}</h2>"
        h += ''.join(f"<p>{html.escape(p)}</p>" for p in ps)
    story = pymupdf.Story(html=h, user_css=css)
    w = pymupdf.DocumentWriter(out); mb = pymupdf.paper_rect(paper); where = mb + (50, 50, -50, -60)
    more = 1
    while more:
        dev = w.begin_page(mb); more, _ = story.place(where); story.draw(dev); w.end_page()
    w.close()
    d = pymupdf.open(out)
    toc = []
    for head, _ in sections:
        if not head: continue
        for i, pg in enumerate(d):
            if pg.search_for(head) and any(l.strip() == head for l in pg.get_text().split('\n')):
                toc.append([1, head, i + 1]); break
    for i, pg in enumerate(d):  # page numbers
        pg.insert_text((mb.width / 2 - 6, mb.height - 30), str(i + 1), fontsize=9, fontname='tiro')
    if toc: d.set_toc(toc)
    d.saveIncr(); print(out, d.page_count, 'pages, toc', toc)
yw = body('yw.txt'); yp = paras(yw)
i0 = next(i for i, p in enumerate(yp) if p.startswith('It is very seldom'))
build('yellow-wallpaper.pdf', 'The Yellow Wallpaper', 'Charlotte Perkins Gilman', [(None, yp[i0:])], 'letter')
mt = body('meta.txt'); parts = re.split(r'\n\s*(I|II|III)\s*\n', '\n' + mt)
secs = []
for k in range(1, len(parts), 2): secs.append(('Part ' + parts[k], paras(parts[k + 1])))
build('metamorphosis.pdf', 'Metamorphosis', 'Franz Kafka · translated by David Wyllie', secs)
