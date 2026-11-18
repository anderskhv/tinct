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

.opening {{ position: relative; background: url("scene-phone.jpg") center top / cover no-repeat }}
.opening::after {{ content: ""; position: absolute; inset: auto 0 0; height: 180px; background: linear-gradient(transparent, var(--room)); pointer-events: none }}
.bar {{ display: flex; align-items: center; justify-content: space-between; padding-block: 14px; position: relative; z-index: 1 }}
.logo {{ font: 26px var(--book) }}
.bar nav {{ display: flex; gap: 18px; align-items: center; font: 14px var(--book); color: var(--dim) }}
.bar nav a:hover {{ color: var(--text) }}
@media (max-width: 599px) {{ .bar nav .wide {{ display: none }} }}

.lead {{ position: relative; z-index: 1; padding-block: 18px 36px; display: grid; gap: 26px }}
h1 {{ font: 600 clamp(34px, 6vw, 60px)/1.06 var(--display); margin: 0; text-wrap: balance; max-width: 15ch }}
.sub {{ font: clamp(19px, 2.2vw, 22px)/1.45 var(--book); color: var(--dim); margin: 14px 0 0; max-width: 34ch }}
.acts {{ display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px }}
.btn {{ display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 20px; border-radius: 23px; font: 500 15px var(--ui) }}
.btn.main {{ background: var(--paper); color: var(--paper-ink) }}
.btn.quiet {{ box-shadow: inset 0 0 0 1px rgba(239,232,219,0.4); color: var(--text) }}
.btn:focus-visible, .card a:focus-visible, .switch button:focus-visible {{ outline: 2px solid var(--text); outline-offset: 3px }}

/* The page itself: a spread of the reader, original on the left, modern on the right. On a phone one page and the switch. */
.spread {{ background: var(--paper); color: var(--paper-ink); border-radius: 6px; box-shadow: 0 30px 80px rgba(0,0,0,0.6); overflow: hidden; min-width: 0 }}
.spread-bar {{ display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-bottom: 1px solid #d6cdbb }}
.spread-title {{ font: 600 16px var(--display) }} .spread-title i {{ font: italic 15px var(--book); color: var(--paper-dim); font-weight: 400 }}
.switch {{ display: inline-flex; padding: 2px; border-radius: 15px; background: var(--chip) }}
.switch button {{ border: 0; background: transparent; color: var(--paper-dim); font: italic 15px var(--book); height: 28px; padding: 0 12px; border-radius: 13px; cursor: pointer }}
.switch button[aria-pressed="true"] {{ background: #f6f1e7; color: var(--paper-ink); box-shadow: 0 1px 2px rgba(0,0,0,0.15) }}
.pages {{ display: grid; grid-template-columns: 1fr }}
.page {{ padding: 20px 22px 18px; min-width: 0 }}
.page h3 {{ font: 500 13px var(--ui); color: var(--paper-dim); margin: 0 0 8px }}
.page p {{ font: 18px/1.55 var(--book); margin: 0; hyphens: auto; text-align: justify }}
.page[hidden] {{ display: none }}
.spread-foot {{ font: 13px var(--ui); color: var(--paper-dim); padding: 0 22px 16px }}

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
  .opening {{ background-image: url("scene-wide.jpg") }}
  .lead {{ grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); align-items: center; gap: 48px; padding-block: 36px 70px }}
  .pages {{ grid-template-columns: 1fr 1fr }}
  .pages .page[hidden] {{ display: block }}
  .page + .page {{ border-left: 1px solid #d6cdbb }}
  .spread .switch {{ display: none }}
  .reel {{ grid-auto-columns: 150px; gap: 18px }}
  .reel.start {{ grid-auto-columns: 196px }}
}}
</style>

<div class="opening">
  <div class="pad"><div class="inner bar">
    <a class="logo" href="{SITE}/library">tinct</a>
    <nav><a class="wide" href="#shelves">Every book</a><a class="wide" href="{SITE}/try">How Tinct works</a><a href="{SITE}/app">Sign in or join</a></nav>
  </div></div>
  <div class="pad"><div class="inner lead">
    <div>
      <h1>The classics, in plain modern English.</h1>
      <p class="sub">Free to read, no sign-up. Every page rewritten in today’s English with AI, with the original one tap away.</p>
      <div class="acts">
        <a class="btn main" href="{link(by_id['meditations'])}">Start with Meditations <span aria-hidden="true">→</span></a>
        <a class="btn quiet" href="#shelves">Every book ({N})</a>
      </div>
    </div>
    <figure class="spread" style="margin:0">
      <div class="spread-bar">
        <span class="spread-title">Meditations <i>· Book 2</i></span>
        <div class="switch" role="group" aria-label="Edition">
          <button type="button" id="b-mod" aria-pressed="true">Modern</button><button type="button" id="b-orig" aria-pressed="false">Original</button>
        </div>
      </div>
      <div class="pages">
        <div class="page" id="p-orig" hidden><h3>George Long’s translation, 1862</h3><p>{ORIG}</p></div>
        <div class="page" id="p-mod"><h3>Modern English, made with AI</h3><p>{MOD}</p></div>
      </div>
      <figcaption class="spread-foot">Marcus Aurelius · the same passage, two ways</figcaption>
    </figure>
  </div></div>
</div>

<main class="pad"><div class="inner">
  <section class="shelf">
    <h2>Start here</h2>
    <ul class="reel start">{"".join(card(by_id[i], True) for i in START)}</ul>
  </section>

  <div class="shelves" id="shelves">
    <div class="find"><label for="q">Find</label><input id="q" type="search" placeholder="a book or an author" autocomplete="off"></div>
    {reels}
    <p class="none" id="none" hidden>Nothing on the shelves by that name. Try the author.</p>
  </div>

  <section class="colophon">
    <h2>About these editions</h2>
    <p>Each modern-English edition is made with AI, page by page, from the original text or from the older translation named under the book. It is a way into the book, not a scholarly translation, so the original stays with it: in the reader, one tap switches back at the same line, and on a computer the two sit side by side.</p>
    <p>Select any passage to have it explained, simplified, or to ask about it.</p>
  </section>

  <div class="end"><p>No text is beyond you.</p><a class="btn quiet" href="{SITE}/try">See how Tinct works <span aria-hidden="true">→</span></a></div>
</div></main>

<footer class="pad"><div class="inner"><span>tinct</span><a href="{SITE}/privacy">Privacy</a><a href="{SITE}/terms">Terms</a><a href="{SITE}/credits">Credits</a></div></footer>

<script>
(function () {{
  var bm = document.getElementById('b-mod'), bo = document.getElementById('b-orig');
  var pm = document.getElementById('p-mod'), po = document.getElementById('p-orig');
  function show(mod) {{ pm.hidden = !mod; po.hidden = mod; bm.setAttribute('aria-pressed', String(mod)); bo.setAttribute('aria-pressed', String(!mod)); }}
  bm.addEventListener('click', function () {{ show(true); }});
  bo.addEventListener('click', function () {{ show(false); }});
  var q = document.getElementById('q'), none = document.getElementById('none');
  var shelves = Array.prototype.slice.call(document.querySelectorAll('[data-shelf]'));
  q.addEventListener('input', function () {{
    var t = q.value.trim().toLowerCase(), any = false;
    shelves.forEach(function (s) {{
      var n = 0;
      s.querySelectorAll('.card').forEach(function (c) {{ var on = !t || c.getAttribute('data-q').indexOf(t) >= 0; c.hidden = !on; if (on) n++; }});
      s.hidden = n === 0; if (n) any = true;
    }});
    none.hidden = any;
  }});
}})();
</script>
'''
open(OUT, 'w').write(page)
print('ok', N, {hid: len(g) for hid, g in groups.items() if g})
