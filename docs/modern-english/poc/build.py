"""Builds docs/modern-english/poc/index.html (proof of concept for tinct.app/modern-english).

Look borrowed from the library (dark room, scene, covers in reels by house) and the Try page
(the real page as the centrepiece). Run: python3 docs/modern-english/poc/build.py
"""
import json, html, os
HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'books.json')))
OUT = os.path.join(HERE, 'index.html')
SITE = 'https://tinct.app'
REF = 'ref=modern-english'

books = [b for b in D['books'] if b['modernEn']]
by_id = {b['id']: b for b in books}
shelf_house = {}
for h in D['houses']:
    for s in h['shelves']:
        shelf_house.setdefault(s, h['id'])
HOUSES = [(h['id'], h['title']) for h in D['houses']]  # the library's own order and names
groups = {hid: [] for hid, _ in HOUSES}
for b in books:
    hid = next((shelf_house[s] for s in b['shelves'] if s in shelf_house), None)
    if hid: groups[hid].append(b)
for g in groups.values():
    g.sort(key=lambda b: (b.get('ySort') or 0))
FORM = {'novel': 'Fiction', 'drama': 'Drama', 'epic': 'Poetry', 'philosophy': 'Philosophy', 'politics': 'Politics',
        'history': 'History', 'scripture': 'Scripture', 'strategy': 'Strategy'}

def esc(s): return html.escape(s or '', quote=True)
def source(b):
    if b.get('translator'):
        return f"from {b['translator']}, {b['trYear']}" if b.get('trYear') else f"from {b['translator']}"
    return 'from the original'
def hours(b):
    w = b.get('words')
    if not w: return ''
    m = w / 230
    return f'{round(m)}\u00a0min' if m < 60 else f'~{round(m / 60)}\u00a0h'
def meta(b):
    return ' · '.join(x for x in [FORM.get(b.get('form'), (b.get('form') or '').capitalize()), b.get('year') or '', hours(b)] if x)
def link(b): return f'{SITE}/read/{b["id"]}?{REF}'

START = ['meditations', 'hamlet', 'crime-and-punishment', 'pride-and-prejudice', 'odyssey', 'frankenstein']
# The library's signature books: their own painted scenes and the library's own questions (public/lab/library_2/app.js).
FEATURED = [
    ('meditations', 'Marcus Aurelius\u2019s', 'How do we stay steady in a world we cannot control?'),
    ('odyssey', 'Homer\u2019s', 'How far must we travel to find home?'),
    ('crime-and-punishment', 'Fyodor Dostoevsky\u2019s', 'Can an idea make a crime right?'),
    ('pride-and-prejudice', 'Jane Austen\u2019s', 'How far can we trust a first impression?'),
    ('the-prince', 'Niccol\u00f2 Machiavelli\u2019s', 'Can a ruler afford to be good?'),
    ('frankenstein', 'Mary Shelley\u2019s', 'What do we owe to the intelligence we create?'),
]

def card(b, big=False):
    q = esc((b['title'] + ' ' + b['author']).lower())
    hook = f'<span class="hook">{esc(b.get("blurb"))}</span>' if big and b.get('blurb') else ''
    return (f'<li class="card{" big" if big else ""}" data-q="{q}"><a href="{link(b)}">'
            f'<img src="covers/{b["id"]}.webp" alt="{esc(b["title"])} by {esc(b["author"])}" width="300" height="450" loading="lazy">'
            f'<span class="t">{esc(b["title"])}</span>{hook}'
            f'<span class="m">{esc(meta(b))}</span><span class="s">Modern English {esc(source(b))}</span></a></li>')

reels = ''.join(
    f'<section class="shelf" data-shelf><h2>{esc(title)} <span>{len(groups[hid])}</span></h2><ul class="reel">{"".join(card(b) for b in groups[hid])}</ul></section>'
    for hid, title in HOUSES if groups.get(hid))

N = len(books)
ORIG = ('1. Begin the morning by saying to thyself, I shall meet with the busybody, the ungrateful, arrogant, deceitful, envious, unsocial. '
        'All these things happen to them by reason of their ignorance of what is good and evil. But I who have seen the nature of the good '
        'that it is beautiful, and of the bad that it is ugly, and the nature of him who does wrong, that it is akin to me; not [only] of the '
        'same blood or seed, but that it participates in [the same] intelligence and [the same] portion of the divinity, I can neither be '
        'injured by any of them, for no one can fix on me what is ugly, nor can I be angry with my kinsman, nor hate him.')
MOD = ('1. Begin each morning by telling yourself: today I shall meet people who are meddling, ungrateful, arrogant, deceitful, envious, '
       'and careless of others. They are like this because they do not know what is good and what is bad. But I have seen what the good is, '
       'and that it is noble; and what the bad is, and that it is shameful. And I have seen what the wrongdoer himself is: he is my kin—not '
       'only because we share the same blood or seed, but because we share the same intelligence and the same portion of the divine. So none '
       'of them can harm me, since none of them can drag me into anything shameful. Nor can I be angry with my kinsman or hate him.')

FEAT_DATA = [{'id': i, 'kicker': k, 'q': q, 'title': by_id[i]['title'], 'meta': meta(by_id[i]) + ' \u00b7 Modern English ' + source(by_id[i]), 'href': link(by_id[i])} for i, k, q in FEATURED]
SEARCH_DATA = [{'id': b['id'], 't': b['title'], 'a': b['author'], 's': source(b), 'q': (b['title'] + ' ' + b['author']).lower(), 'href': link(b)} for b in books]
page = f'''<title>Classics in Modern English</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap">
<style>
/* Layout: the library's dark room. A scene behind the opening, the real page as the centrepiece, then the shelves as reels. */
:root {{
  --room: #110f0c; --room-2: #1a1713; --text: #efe8db; --dim: #b9b0a2; --faint: #8c8478; --rule: rgba(239,232,219,0.14);
  --paper: #ece7db; --paper-ink: #1a1612; --paper-dim: #6a6256; --chip: #e2d8c4;
  --display: 'Playfair Display', Georgia, serif; --book: 'EB Garamond', Georgia, 'Times New Roman', serif;
  --ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color-scheme: dark;
}}
* {{ box-sizing: border-box }}
body {{ background: var(--room); color: var(--text); font: 15px/1.5 var(--ui); -webkit-font-smoothing: antialiased }}
a {{ color: inherit; text-decoration: none }}
.pad {{ padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)) }}
.inner {{ max-width: 1240px; margin: 0 auto }}

.opening {{ position: relative; background: #000 center / cover no-repeat; transition: background-image .4s }}
.opening::before {{ content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(10,8,6,0.82) 0%, rgba(10,8,6,0.45) 55%, rgba(10,8,6,0.15) 100%); pointer-events: none }}
.opening::after {{ content: ""; position: absolute; inset: auto 0 0; height: 160px; background: linear-gradient(transparent, var(--room)); pointer-events: none }}
.bar, .claim, .feature {{ position: relative; z-index: 1 }}
.bar {{ display: flex; align-items: center; justify-content: space-between; padding-block: 14px }}
.logo {{ font: 26px var(--book) }}
.bar nav {{ display: flex; gap: 18px; align-items: center; font: 14px var(--book); color: var(--dim) }}
.bar nav a:hover {{ color: var(--text) }}
@media (max-width: 599px) {{ .bar nav .wide {{ display: none }} }}
.claim {{ padding-block: 14px 0; z-index: 3 }}
h1 {{ font: 600 clamp(30px, 5vw, 50px)/1.08 var(--display); margin: 0; text-wrap: balance; max-width: 18ch }}
.sub {{ font: clamp(18px, 2vw, 21px)/1.45 var(--book); color: var(--dim); margin: 10px 0 0; max-width: 40ch }}
.sr {{ position: absolute; left: -9999px }}
.search {{ position: relative; margin-top: 20px; max-width: 540px }}
.search svg {{ position: absolute; left: 18px; top: 16px; color: var(--dim); z-index: 1; pointer-events: none }}
.search input {{ width: 100%; height: 52px; border-radius: 26px; border: 0; padding: 0 20px 0 50px; font: 18px var(--book); color: var(--text);
  background: rgba(20,17,13,0.62); box-shadow: inset 0 0 0 1px rgba(239,232,219,0.28); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px) }}
.search input::placeholder {{ color: var(--dim) }}
.search input:focus {{ outline: 2px solid var(--text); outline-offset: 2px }}
.results {{ position: absolute; left: 0; right: 0; top: 60px; list-style: none; margin: 0; padding: 6px; border-radius: 16px; background: #1b1814; box-shadow: 0 18px 50px rgba(0,0,0,0.6), inset 0 0 0 1px var(--rule); z-index: 5; max-height: 420px; overflow-y: auto }}
.results a {{ display: flex; gap: 12px; align-items: center; padding: 7px 8px; border-radius: 10px }}
.results a:hover, .results a[aria-selected="true"] {{ background: rgba(239,232,219,0.08) }}
.results img {{ width: 36px; height: 54px; object-fit: cover; border-radius: 2px; flex: none }}
.results .rt {{ font: 500 17px/1.2 var(--book); display: block }} .results .ra {{ font: 13px var(--ui); color: var(--faint) }}
.results .rs {{ font: italic 13px var(--book); color: var(--faint); display: block }}
.results .empty {{ padding: 10px; font: 16px var(--book); color: var(--dim) }}
.feature {{ display: grid; grid-template-columns: 1fr; gap: 18px; padding-block: 34px 40px; align-items: end }}
.kicker {{ font: italic 17px var(--book); color: var(--dim); margin: 0 }}
.f-title {{ font: 600 clamp(34px, 5.4vw, 56px)/1.04 var(--display); margin: 2px 0 0 }}
.f-q {{ font: clamp(18px, 2vw, 21px)/1.4 var(--book); margin: 8px 0 0; max-width: 30ch }}
.f-meta {{ font: 13px var(--ui); color: var(--dim); margin: 10px 0 0 }}
.acts {{ display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px }}
.btn {{ display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 20px; border-radius: 23px; font: 500 15px var(--ui) }}
.btn.main {{ background: var(--paper); color: var(--paper-ink) }}
.btn.quiet {{ box-shadow: inset 0 0 0 1px rgba(239,232,219,0.4); color: var(--text) }}
.btn:focus-visible, .card a:focus-visible, .dots button:focus-visible, .results a:focus-visible {{ outline: 2px solid var(--text); outline-offset: 3px }}
.dots {{ display: flex; gap: 8px; margin-top: 22px }}
.dots button {{ width: 8px; height: 8px; border-radius: 4px; border: 0; padding: 0; background: rgba(239,232,219,0.35); cursor: pointer }}
.dots button[aria-selected="true"] {{ width: 22px; background: var(--text) }}
.f-cover {{ order: -1; justify-self: center }}
.f-cover img {{ width: 150px; height: auto; aspect-ratio: 2 / 3; object-fit: cover; border-radius: 3px; box-shadow: 0 24px 50px rgba(0,0,0,0.7) }}
@media (min-width: 900px) {{
  .feature {{ grid-template-columns: 1fr auto; padding-block: 60px 80px }}
  .f-cover {{ order: 0; margin-right: 6% }}
  .f-cover img {{ width: 230px }}
}}
.shelves {{ padding-block: 8px 20px }}
.find {{ display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--rule); max-width: 420px; margin: 0 0 6px }}
.find label {{ font: 14px var(--ui); color: var(--faint); flex: none }}
.find input {{ flex: 1; min-width: 0; background: transparent; border: 0; color: var(--text); font: 18px var(--book); height: 44px; outline: none }}
.shelf {{ padding-top: 26px }}
.shelf h2 {{ font: 600 22px var(--display); margin: 0 0 12px }}
.shelf h2 span {{ font: 400 14px var(--ui); color: var(--faint); font-variant-numeric: tabular-nums }}
.reel {{ list-style: none; margin: 0; padding: 0 0 8px; display: grid; grid-auto-flow: column; grid-auto-columns: 124px; gap: 14px; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: thin }}
.card a {{ display: flex; flex-direction: column; gap: 3px; scroll-snap-align: start }}
.card img {{ width: 100%; aspect-ratio: 2 / 3; height: auto; object-fit: cover; border-radius: 3px; background: var(--room-2); box-shadow: 0 8px 20px rgba(0,0,0,0.5); margin-bottom: 6px }}
.card .t {{ font: 500 16px/1.2 var(--book) }}
.card .m {{ font: 12px var(--ui); color: var(--faint) }}
.card .s {{ font: italic 13px/1.3 var(--book); color: var(--faint) }}
.card .hook {{ font: 15px/1.35 var(--book); color: var(--dim) }}
.reel.start {{ grid-auto-columns: 148px }}
.card a:hover .t {{ text-decoration: underline; text-underline-offset: 3px }}
.none {{ font: 18px var(--book); color: var(--dim); padding-top: 20px }}

.colophon {{ border-top: 1px solid var(--rule); margin-top: 34px; padding-block: 34px 10px; display: grid; gap: 14px; max-width: 640px }}
.colophon h2 {{ font: 600 22px var(--display); margin: 0 }}
.colophon p {{ font: 18px/1.55 var(--book); color: var(--dim); margin: 0 }}
.end {{ padding-block: 40px 30px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px }}
.end p {{ font: 600 clamp(26px, 4vw, 36px)/1.1 var(--display); margin: 0 }}
footer {{ border-top: 1px solid var(--rule); padding-block: 22px 32px; font: 14px var(--ui); color: var(--faint) }}
footer .inner {{ display: flex; flex-wrap: wrap; gap: 8px 20px }}

@media (min-width: 900px) {{
  .reel {{ grid-auto-columns: 150px; gap: 18px }}
  .reel.start {{ grid-auto-columns: 196px }}
}}
</style>

<div class="opening" id="opening">
  <div class="pad"><div class="inner bar">
    <a class="logo" href="{SITE}/library">tinct</a>
    <nav><a href="#shelves">Every book</a><a class="wide" href="#about">About these editions</a></nav>
  </div></div>
  <div class="pad"><div class="inner claim">
    <h1>The classics, in plain modern English.</h1>
    <p class="sub">Free to read. Made with AI, with the original one tap away.</p>
    <div class="search" role="search">
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <label for="q" class="sr">Search the books</label>
      <input id="q" type="search" placeholder="Search {N} books or authors" autocomplete="off" aria-controls="results" aria-expanded="false">
      <ul id="results" class="results" hidden></ul>
    </div>
  </div></div>
  <div class="pad"><div class="inner feature" id="feature">
    <div class="feature-text">
      <p class="kicker" id="f-kicker"></p>
      <p class="f-title" id="f-title"></p>
      <p class="f-q" id="f-q"></p>
      <p class="f-meta" id="f-meta"></p>
      <div class="acts"><a class="btn main" id="f-read" href="#">Read in modern English <span aria-hidden="true">\u2192</span></a></div>
      <div class="dots" role="tablist" aria-label="Featured books">{"".join(f'<button type="button" role="tab" aria-label="{esc(by_id[i]["title"])}" data-i="{n}"></button>' for n, (i, _, _) in enumerate(FEATURED))}</div>
    </div>
    <a class="f-cover" id="f-cover-link" href="#"><img id="f-cover" src="covers/meditations.webp" alt="" width="300" height="450"></a>
  </div></div>
</div>

<main class="pad"><div class="inner">
  <div class="shelves" id="shelves">
    {reels}
    <p class="none" id="none" hidden>Nothing on the shelves by that name. Try the author.</p>
  </div>

  <section class="colophon" id="about">
    <h2>About these editions</h2>
    <p>Each modern-English edition is made with AI, page by page, from the original text or from the older translation named under the book. It is a way into the book, not a scholarly translation, so the original stays with it: in the reader, one tap switches back at the same line, and on a computer the two sit side by side.</p>
    <p>Every book here stays free to read, in both versions. No account, no trial, nothing to unlock.</p>
  </section>

</div></main>

<footer class="pad"><div class="inner"><span>tinct</span><a href="{SITE}/privacy">Privacy</a><a href="{SITE}/terms">Terms</a><a href="{SITE}/credits">Credits</a><a href="{SITE}/try">About Tinct</a></div></footer>


'''
SCRIPT = r'''<script>
var FEATURED = FEAT_JSON;
var BOOKS = BOOKS_JSON;
(function () {
  var op = document.getElementById('opening'), i = 0;
  var wide = window.matchMedia('(min-width: 900px)');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dots button'));
  function show(n) {
    i = n; var f = FEATURED[n];
    op.style.backgroundImage = 'url("scenes/' + f.id + (wide.matches ? '-wide' : '-phone') + '.jpg")';
    document.getElementById('f-kicker').textContent = f.kicker;
    document.getElementById('f-title').textContent = f.title;
    document.getElementById('f-q').textContent = f.q;
    document.getElementById('f-meta').textContent = f.meta;
    document.getElementById('f-read').href = f.href;
    document.getElementById('f-cover-link').href = f.href;
    var img = document.getElementById('f-cover'); img.src = 'covers/' + f.id + '.webp'; img.alt = f.title;
    dots.forEach(function (d, k) { d.setAttribute('aria-selected', String(k === n)); });
  }
  dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); }); });
  wide.addEventListener('change', function () { show(i); });
  show(0);

  var q = document.getElementById('q'), list = document.getElementById('results'), sel = -1;
  function esc(t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function render() {
    var t = q.value.trim().toLowerCase();
    if (!t) { list.hidden = true; q.setAttribute('aria-expanded', 'false'); return; }
    var hits = BOOKS.filter(function (b) { return b.q.indexOf(t) >= 0; });
    hits.sort(function (a, b) { return (a.t.toLowerCase().indexOf(t) === 0 ? 0 : 1) - (b.t.toLowerCase().indexOf(t) === 0 ? 0 : 1); });
    sel = hits.length ? 0 : -1;
    list.innerHTML = hits.length ? hits.slice(0, 8).map(function (b, k) {
      return '<li><a href="' + b.href + '"' + (k === 0 ? ' aria-selected="true"' : '') + '><img src="covers/' + b.id + '.webp" alt=""><span><span class="rt">' + esc(b.t) + '</span><span class="ra">' + esc(b.a) + '</span><span class="rs">Modern English ' + esc(b.s) + '</span></span></a></li>';
    }).join('') : '<li class="empty">No book by that name yet. Try the author.</li>';
    list.hidden = false; q.setAttribute('aria-expanded', 'true');
  }
  q.addEventListener('input', render);
  q.addEventListener('keydown', function (e) {
    var links = list.querySelectorAll('a'); if (!links.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach(function (l, k) { l.setAttribute('aria-selected', String(k === sel)); }); }
    if (e.key === 'Enter' && sel >= 0) { window.open(links[sel].href, '_blank'); }
    if (e.key === 'Escape') { q.value = ''; render(); }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.search')) { list.hidden = true; } });
  q.addEventListener('focus', render);
})();
</script>'''
page = page + SCRIPT
page = page.replace('FEAT_JSON', json.dumps(FEAT_DATA)).replace('BOOKS_JSON', json.dumps(SEARCH_DATA))
open(OUT, 'w').write(page)
print('ok', N, {hid: len(g) for hid, g in groups.items() if g})
