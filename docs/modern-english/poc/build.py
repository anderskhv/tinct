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

def era(b):
    y = b.get('ySort') or 0
    return 'ancient' if y < 500 else 'medieval' if y < 1500 else 'early' if y < 1700 else '1700s' if y < 1800 else '1800s' if y < 1900 else '1900s'

def card(b, big=False):
    q = esc((b['title'] + ' ' + b['author']).lower())
    hook = f'<span class="hook">{esc(b.get("blurb"))}</span>' if big and b.get('blurb') else ''
    return (f'<li class="card{" big" if big else ""}" data-q="{q}" data-era="{era(b)}"><a href="{link(b)}">'
            f'<img src="covers/{b["id"]}.webp" alt="{esc(b["title"])} by {esc(b["author"])}" width="300" height="450" loading="lazy">'
            f'<span class="t">{esc(b["title"])}</span>{hook}'
            f'<span class="s">{esc(source(b))}</span></a></li>')

reels = ''.join(
    f'<section class="shelf" data-shelf data-house="{hid}"><h2>{esc(title)} <span>{len(groups[hid])}</span></h2><ul class="reel">{"".join(card(b) for b in groups[hid])}</ul></section>'
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

.opening {{ position: relative; overflow: hidden }}
.bg {{ position: absolute; inset: -40px; background: url("scenes/meditations-phone.jpg") center / cover no-repeat; filter: blur(14px) brightness(0.8) }}
.opening::before {{ content: ""; position: absolute; inset: 0; z-index: 0; background: linear-gradient(90deg, rgba(10,8,6,0.85), rgba(10,8,6,0.35)); pointer-events: none }}
.opening::after {{ content: ""; position: absolute; inset: auto 0 0; height: 120px; background: linear-gradient(transparent, var(--room)); pointer-events: none }}
.bar, .top {{ position: relative; z-index: 1 }}
.bar {{ padding-block: 14px }}
.logo {{ font: 26px var(--book) }}
.top {{ display: grid; gap: 28px; padding-block: 40px 48px; align-items: center }}
h1 {{ font: 600 clamp(32px, 5vw, 54px)/1.06 var(--display); margin: 0; text-wrap: balance; max-width: 16ch }}
.sub {{ font: clamp(18px, 2vw, 21px)/1.4 var(--book); color: var(--dim); margin: 10px 0 0 }}
.claim {{ min-width: 0 }}
.sr {{ position: absolute; left: -9999px }}
.search {{ position: relative; margin-top: 22px; max-width: 480px; z-index: 3 }}
.search svg {{ position: absolute; left: 18px; top: 16px; color: var(--dim); z-index: 1; pointer-events: none }}
.search input {{ width: 100%; height: 52px; border-radius: 26px; border: 0; padding: 0 20px 0 50px; font: 18px var(--book); color: var(--text);
  background: rgba(20,17,13,0.62); box-shadow: inset 0 0 0 1px rgba(239,232,219,0.28); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px) }}
.search input::placeholder {{ color: var(--dim) }}
.search input:focus {{ outline: 2px solid var(--text); outline-offset: 2px }}
.results {{ position: absolute; left: 0; right: 0; top: 60px; list-style: none; margin: 0; padding: 6px; border-radius: 16px; background: #1b1814; box-shadow: 0 18px 50px rgba(0,0,0,0.6), inset 0 0 0 1px var(--rule); max-height: 420px; overflow-y: auto }}
.results a {{ display: flex; gap: 12px; align-items: center; padding: 7px 8px; border-radius: 10px }}
.results a:hover, .results a[aria-selected="true"] {{ background: rgba(239,232,219,0.08) }}
.results img {{ width: 36px; height: 54px; object-fit: cover; border-radius: 2px; flex: none }}
.results .rt {{ font: 500 17px/1.2 var(--book); display: block }} .results .rs {{ font: italic 13px var(--book); color: var(--faint); display: block }}
.results .empty {{ padding: 10px; font: 16px var(--book); color: var(--dim) }}
.pills {{ display: flex; flex-wrap: nowrap; gap: 6px; margin-top: 10px; overflow-x: auto; scrollbar-width: none; max-width: 100% }}
.pills::-webkit-scrollbar {{ display: none }}
.search + .pills {{ margin-top: 16px }}
.pills button {{ flex: none; height: 30px; padding: 0 12px; border-radius: 15px; border: 0; background: rgba(20,17,13,0.55); color: var(--dim); font: 13px var(--ui); box-shadow: inset 0 0 0 1px rgba(239,232,219,0.22); cursor: pointer }}
.pills button:hover {{ color: var(--text) }}
.pills button[aria-pressed="true"] {{ background: var(--text); color: var(--room); box-shadow: none }}
.pills button:focus-visible {{ outline: 2px solid var(--text); outline-offset: 2px }}
.pills .sep {{ flex-basis: 100%; height: 0 }}
.pile {{ list-style: none; margin: 0; padding: 0; display: flex; gap: 10px; overflow-x: auto }}
.pile li {{ flex: none }}
.pile img {{ width: 92px; height: auto; aspect-ratio: 2 / 3; object-fit: cover; border-radius: 3px; box-shadow: 0 14px 30px rgba(0,0,0,0.6); display: block }}
.pile a:focus-visible, .card a:focus-visible, .results a:focus-visible {{ outline: 2px solid var(--text); outline-offset: 3px }}
@media (min-width: 900px) {{
  .bg {{ background-image: url("scenes/meditations-wide.jpg") }}
  .top {{ grid-template-columns: minmax(400px, 5fr) minmax(0, 6fr); padding-block: 80px 90px }}
  .pile {{ overflow: visible; padding-right: 20px; gap: 0 }}
  .pile li {{ flex: 1 1 0; min-width: 0; margin-left: -4% }} .pile li:first-child {{ margin-left: 0 }}
  .pile li:nth-child(odd) {{ transform: translateY(18px) rotate(-2deg) }} .pile li:nth-child(even) {{ transform: rotate(2deg) }}
  .pile img {{ width: 100%; max-width: 170px }}
  @media (prefers-reduced-motion: no-preference) {{ .pile li {{ transition: transform .2s }} .pile li:hover {{ transform: translateY(-8px); z-index: 2; position: relative }} }}
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

.note {{ font: 17px/1.5 var(--book); color: var(--faint); max-width: 60ch; border-top: 1px solid var(--rule); margin: 34px 0 0; padding-top: 22px }}
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

<div class="opening">
  <div class="bg" aria-hidden="true"></div>
  <div class="pad"><div class="inner top">
    <div class="claim">
      <h1>100+ classics in modern translation. Free.</h1>
      <p class="sub">The original, or its classic human translation, is always one tap away.</p>
      <div class="search" role="search">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <label for="q" class="sr">Search the books</label>
        <input id="q" type="search" placeholder="Search by title or author" autocomplete="off" aria-controls="results" aria-expanded="false">
        <ul id="results" class="results" hidden></ul>
      </div>
      <div class="pills" role="group" aria-label="Category">
        {"".join(f'<button type="button" data-k="house" data-v="{hid}">{esc(t)}</button>' for hid, t in [('philosophy','Philosophy'),('drama','Drama'),('novel','Fiction'),('epic','Poetry'),('politics','Politics')])}
      </div>
      <div class="pills" role="group" aria-label="Period">
        {"".join(f'<button type="button" data-k="era" data-v="{v}">{t}</button>' for v, t in [('ancient','Ancient, before 500'),('medieval','Medieval, 500–1500'),('early','1500s–1600s'),('1700s','1700s'),('1800s','1800s'),('1900s','1900s')])}
      </div>
    </div>
    <ul class="pile">{"".join(f'<li><a href="{link(by_id[i])}"><img src="covers/{i}.webp" alt="{esc(by_id[i]["title"])}" width="300" height="450"></a></li>' for i in START)}</ul>
  </div></div>
</div>

<main class="pad"><div class="inner">
  <div class="shelves" id="shelves">
    {reels}
    <p class="none" id="none" hidden>Nothing on the shelves by that name. Try the author.</p>
  </div>

  <p class="note" id="about">Made with AI from the original, or from the older translation named under each book. A way in, not a scholarly translation. Free to read, in both versions.</p>

</div></main>

<footer class="pad"><div class="inner"><span>tinct</span><a href="{SITE}/privacy">Privacy</a><a href="{SITE}/terms">Terms</a><a href="{SITE}/credits">Credits</a><a href="{SITE}/try">About Tinct</a></div></footer>


'''
SCRIPT = r'''<script>
var BOOKS = BOOKS_JSON;
(function () {
  var q = document.getElementById('q'), list = document.getElementById('results'), sel = -1;
  function esc(t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function render() {
    var t = q.value.trim().toLowerCase();
    if (!t) { list.hidden = true; q.setAttribute('aria-expanded', 'false'); return; }
    var hits = BOOKS.filter(function (b) { return b.q.indexOf(t) >= 0; });
    hits.sort(function (a, b) { return (a.t.toLowerCase().indexOf(t) === 0 ? 0 : 1) - (b.t.toLowerCase().indexOf(t) === 0 ? 0 : 1); });
    sel = hits.length ? 0 : -1;
    list.innerHTML = hits.length ? hits.slice(0, 8).map(function (b, k) {
      return '<li><a href="' + b.href + '"' + (k === 0 ? ' aria-selected="true"' : '') + '><img src="covers/' + b.id + '.webp" alt=""><span><span class="rt">' + esc(b.t) + '</span><span class="rs">' + esc(b.a) + ' \u00b7 ' + esc(b.s) + '</span></span></a></li>';
    }).join('') : '<li class="empty">No book by that name. Try the author.</li>';
    list.hidden = false; q.setAttribute('aria-expanded', 'true');
  }
  q.addEventListener('input', render);
  q.addEventListener('focus', render);
  q.addEventListener('keydown', function (e) {
    var links = list.querySelectorAll('a'); if (!links.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach(function (l, k) { l.setAttribute('aria-selected', String(k === sel)); }); }
    if (e.key === 'Enter' && sel >= 0) { window.open(links[sel].href, '_blank'); }
    if (e.key === 'Escape') { q.value = ''; render(); }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.search')) list.hidden = true; });
  var pick = { house: null, era: null };
  var pills = Array.prototype.slice.call(document.querySelectorAll('.pills button'));
  var shelves = Array.prototype.slice.call(document.querySelectorAll('[data-shelf]'));
  pills.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', function () {
    var k = b.dataset.k, v = b.dataset.v; pick[k] = pick[k] === v ? null : v;
    pills.forEach(function (o) { o.setAttribute('aria-pressed', String(pick[o.dataset.k] === o.dataset.v)); });
    var any = false;
    shelves.forEach(function (sh) {
      var n = 0, houseOk = !pick.house || sh.dataset.house === pick.house;
      sh.querySelectorAll('.card').forEach(function (c) { var on = houseOk && (!pick.era || c.dataset.era === pick.era); c.hidden = !on; if (on) n++; });
      sh.hidden = n === 0; if (n) any = true;
    });
    document.getElementById('none').hidden = any;
    if (pick.house || pick.era) document.getElementById('shelves').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }); });
})();
</script>'''
page = page + SCRIPT
page = page.replace('BOOKS_JSON', json.dumps(SEARCH_DATA))
open(OUT, 'w').write(page)
print('ok', N, {hid: len(g) for hid, g in groups.items() if g})
