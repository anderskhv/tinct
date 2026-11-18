import json, html
import os
D = json.load(open(os.path.join(os.path.dirname(__file__), 'books.json')))
OUT = os.path.join(os.path.dirname(__file__), 'index.html')
SITE = 'https://tinct.app'
REF = 'ref=modern-english'

books = [b for b in D['books'] if b['modernEn']]
by_id = {b['id']: b for b in books}
shelf_house = {}
for h in D['houses']:
    for s in h['shelves']:
        shelf_house.setdefault(s, h['id'])
HOUSE_ORDER = ['novel', 'drama', 'epic', 'philosophy', 'politics', 'history', 'strategy', 'scripture']
HOUSE_TITLE = {h['id']: h['title'] for h in D['houses']}
HOUSE_TITLE['novel'] = 'Novels and stories'
HOUSE_TITLE['epic'] = 'Poetry and epic'
HOUSE_TITLE['politics'] = 'Politics and the state'
HOUSE_TITLE['strategy'] = 'War and strategy'
HOUSE_TITLE['scripture'] = 'Faith and devotion'
groups = {k: [] for k in HOUSE_ORDER + ['more']}
for b in books:
    hid = next((shelf_house[s] for s in b['shelves'] if s in shelf_house), 'more')
    groups.setdefault(hid, []).append(b)
HOUSE_TITLE['more'] = 'More'
for g in groups.values():
    g.sort(key=lambda b: (b.get('ySort') or 0))

def esc(s): return html.escape(s or '', quote=True)
def source(b):
    if b.get('translator'):
        return f"from {b['translator']}’s {b['trYear']} translation" if b.get('trYear') else f"from {b['translator']}’s translation"
    return 'from the original English'
def hours(b):
    w = b.get('words')
    if not w: return ''
    m = w / 230
    return f'{round(m)} min' if m < 60 else f'{round(m / 60)} h'
def link(b): return f'{SITE}/read/{b["id"]}?{REF}'

START = [
    ('hamlet', 'Shakespeare’s English, scene by scene in today’s words.'),
    ('meditations', 'A Roman emperor’s notes to himself, in plain sentences.'),
    ('pride-and-prejudice', 'Austen’s long sentences, easy to follow.'),
    ('crime-and-punishment', 'Dostoevsky without the 1914 phrasing.'),
    ('odyssey', 'Homer’s journey home, as a story you can simply read.'),
    ('frankenstein', 'The 1831 novel in today’s English.'),
]

def start_card(i, line):
    b = by_id[i]
    return (f'<li><a class="pick" href="{link(b)}"><img src="covers/{i}.webp" alt="" width="180" height="270" loading="lazy">'
            f'<span class="pick-title">{esc(b["title"])}</span><span class="pick-author">{esc(b["author"])}</span>'
            f'<span class="pick-line">{esc(line)}</span></a></li>')

def row(b):
    meta = ' · '.join(x for x in [esc(b['author']), hours(b)] if x)
    return (f'<li class="row" data-q="{esc((b["title"] + " " + b["author"]).lower())}"><a href="{link(b)}">'
            f'<img src="covers/{b["id"]}.webp" alt="" width="44" height="66" loading="lazy">'
            f'<span class="row-text"><span class="row-title">{esc(b["title"])}</span>'
            f'<span class="row-meta">{meta}</span><span class="row-src">Modern English, {source(b)}</span></span></a></li>')

sections = ''
for hid in HOUSE_ORDER + ['more']:
    g = groups.get(hid) or []
    if not g: continue
    sections += (f'<section class="house" data-house><h3>{esc(HOUSE_TITLE.get(hid, hid))} <span class="count">{len(g)}</span></h3>'
                 f'<ul class="rows">{"".join(row(b) for b in g)}</ul></section>')

N = len(books)
ORIG = 'Begin the morning by saying to thyself, I shall meet with the busybody, the ungrateful, arrogant, deceitful, envious, unsocial. All these things happen to them by reason of their ignorance of what is good and evil.'
MOD = 'Begin each morning by telling yourself: today I shall meet people who are meddling, ungrateful, arrogant, deceitful, envious, and careless of others. They are like this because they do not know what is good and what is bad.'

page = f'''<title>Classics in Modern English</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap">
<style>
/* Layout: one reading column for the pitch, a wide shelf grid below; phone first. Tinct tokens (docs/design-system.md). */
:root {{
  --paper: #ece7db; --surface: #e2d8c4; --card: #f4efe4; --ink: #0b0b0b; --muted: #5f574b; --faint: #7a7163;
  --line: #cfc6b3; --accent: #1f4a5c; --accent-ink: #f4efe4;
  --display: 'Playfair Display', Georgia, serif;
  --book: 'EB Garamond', Georgia, 'Times New Roman', serif;
  --ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --paper: #171411; --surface: #211d18; --card: #1d1915; --ink: #e4dccf; --muted: #a99f92; --faint: #8f857a;
  --line: #3f382f; --accent: #8fbccd; --accent-ink: #12100d; color-scheme: dark }} }}
:root[data-theme="dark"] {{
  --paper: #171411; --surface: #211d18; --card: #1d1915; --ink: #e4dccf; --muted: #a99f92; --faint: #8f857a;
  --line: #3f382f; --accent: #8fbccd; --accent-ink: #12100d; color-scheme: dark }}
* {{ box-sizing: border-box }}
body {{ background: var(--paper); color: var(--ink); font: 16px/1.5 var(--ui); -webkit-font-smoothing: antialiased }}
a {{ color: inherit }}
.wrap {{ max-width: 1080px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)) }}
header.top .wrap {{ display: flex; align-items: center; justify-content: space-between; padding-block: 14px }}
.logo {{ font: 28px var(--book); text-decoration: none }} .logo span {{ color: #c8942e }}
.top-link {{ font: 500 14px var(--ui); text-decoration: none; padding: 8px 14px; border-radius: 18px; box-shadow: inset 0 0 0 1px var(--line) }}
.hero {{ padding-block: 28px 8px }}
h1 {{ font: 600 clamp(32px, 6.4vw, 56px)/1.08 var(--display); margin: 0; text-wrap: balance; max-width: 20ch }}
.lede {{ font: clamp(19px, 2.4vw, 22px)/1.45 var(--book); color: var(--muted); margin: 14px 0 0; max-width: 36ch }}
.facts {{ display: flex; flex-wrap: wrap; gap: 8px 18px; margin: 16px 0 0; padding: 0; list-style: none; font: 14px var(--ui); color: var(--muted) }}
.facts li::before {{ content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 3px; background: var(--accent); margin-right: 8px; vertical-align: 2px }}
.search {{ margin-top: 22px; position: relative; max-width: 520px }}
.search input {{ width: 100%; height: 48px; border-radius: 24px; border: 0; padding: 0 18px 0 44px; font: 16px var(--ui); color: var(--ink); background: var(--card); box-shadow: inset 0 0 0 1px var(--line) }}
.search input:focus {{ outline: 2px solid var(--accent); outline-offset: 1px }}
.search svg {{ position: absolute; left: 16px; top: 15px; color: var(--faint) }}
h2 {{ font: 600 13px var(--ui); color: var(--muted); margin: 0 0 12px; letter-spacing: 0.02em }}
.block {{ padding-block: 28px 0 }}
.picks {{ list-style: none; margin: 0; padding: 0 0 6px; display: grid; grid-auto-flow: column; grid-auto-columns: 132px; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory }}
.pick {{ display: flex; flex-direction: column; gap: 4px; text-decoration: none; scroll-snap-align: start }}
.pick img {{ width: 132px; height: 198px; object-fit: cover; border-radius: 4px; box-shadow: 0 6px 16px rgba(0,0,0,0.18); background: var(--surface) }}
.pick-title {{ font: 500 18px/1.2 var(--book); margin-top: 6px }}
.pick-author {{ font: 13px var(--ui); color: var(--muted) }}
.pick-line {{ font: 15px/1.35 var(--book); color: var(--muted) }}
.pick:hover .pick-title, .row a:hover .row-title {{ color: var(--accent) }}
.pick:focus-visible, .row a:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 6px }}
.specimen {{ display: grid; grid-template-columns: 1fr; gap: 12px; background: var(--card); border-radius: 14px; padding: 18px; box-shadow: inset 0 0 0 1px var(--line) }}
.specimen figure {{ margin: 0; min-width: 0 }}
.specimen figcaption {{ font: 13px var(--ui); color: var(--muted); margin-bottom: 6px }}
.specimen blockquote {{ margin: 0; font: 19px/1.5 var(--book) }}
.specimen .old blockquote {{ color: var(--muted) }}
.specimen-foot {{ font: 13px var(--ui); color: var(--muted); grid-column: 1 / -1; border-top: 1px solid var(--line); padding-top: 10px }}
.houses {{ display: grid; grid-template-columns: 1fr; gap: 28px }}
.house h3 {{ font: 600 16px var(--ui); margin: 0 0 6px; padding-bottom: 8px; border-bottom: 1px solid var(--line) }}
.count {{ font-weight: 400; color: var(--faint); font-variant-numeric: tabular-nums }}
.rows {{ list-style: none; margin: 0; padding: 0 }}
.row a {{ display: flex; gap: 12px; align-items: center; padding: 8px 0; text-decoration: none; border-bottom: 1px solid var(--line) }}
.row img {{ flex: none; width: 44px; height: 66px; object-fit: cover; border-radius: 3px; background: var(--surface) }}
.row-text {{ display: flex; flex-direction: column; min-width: 0 }}
.row-title {{ font: 500 18px/1.25 var(--book) }}
.row-meta {{ font: 13px var(--ui); color: var(--muted) }}
.row-src {{ font: 13px var(--ui); color: var(--faint) }}
.empty {{ font: 17px var(--book); color: var(--muted) }}
.how {{ display: grid; gap: 14px; margin: 0; padding: 0; list-style: none }}
.how li {{ font: 18px/1.45 var(--book); max-width: 62ch }}
.how strong {{ font-weight: 500 }}
.close {{ margin-top: 40px; background: var(--accent); color: var(--accent-ink); border-radius: 16px; padding: 26px 22px; display: flex; flex-wrap: wrap; gap: 14px 24px; align-items: center; justify-content: space-between }}
.close p {{ margin: 0; font: 600 clamp(24px, 4vw, 32px)/1.15 var(--display) }}
.close a {{ font: 600 15px var(--ui); text-decoration: none; background: var(--accent-ink); color: var(--accent); padding: 12px 18px; border-radius: 22px }}
footer {{ padding-block: 28px 36px; font: 14px var(--ui); color: var(--muted) }}
footer .wrap {{ display: flex; flex-wrap: wrap; gap: 8px 20px }}
@media (min-width: 760px) {{
  .hero {{ padding-block: 56px 8px }}
  .picks {{ grid-auto-flow: row; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-columns: auto; overflow: visible }}
  .pick img {{ width: 100%; height: auto; aspect-ratio: 2 / 3 }}
  .specimen {{ grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px }}
  .houses {{ grid-template-columns: 1fr 1fr; gap: 36px 40px }}
}}
@media (prefers-reduced-motion: no-preference) {{ .pick img {{ transition: transform .2s }} .pick:hover img {{ transform: translateY(-3px) }} }}
</style>

<header class="top"><div class="wrap">
  <a class="logo" href="{SITE}/">Tinct<span>.</span></a>
  <a class="top-link" href="{SITE}/try">How Tinct works</a>
</div></header>

<main>
<div class="wrap hero">
  <h1>The classics, in plain modern English. Free.</h1>
  <p class="lede">Every page rewritten in today’s English with AI, with the original text one tap away.</p>
  <ul class="facts"><li>{N} books</li><li>No sign-up to read</li><li>Original beside every page</li></ul>
  <form class="search" role="search" onsubmit="return false">
    <label for="q" class="sr" style="position:absolute;left:-9999px">Find a book</label>
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
    <input id="q" type="search" placeholder="Find a book or author" autocomplete="off">
  </form>
</div>

<div class="wrap block" id="start">
  <h2>Start here</h2>
  <ul class="picks">{"".join(start_card(i, l) for i, l in START)}</ul>
</div>

<div class="wrap block">
  <h2>The same page, two ways</h2>
  <div class="specimen">
    <figure class="old"><figcaption>Meditations, Book 2 · George Long’s 1862 translation</figcaption><blockquote>{ORIG}</blockquote></figure>
    <figure><figcaption>Modern English, made with AI</figcaption><blockquote>{MOD}</blockquote></figure>
    <p class="specimen-foot">In the reader you switch between the two at the same line. On a computer you can read them side by side.</p>
  </div>
</div>

<div class="wrap block" id="all">
  <h2>All {N} books</h2>
  <div class="houses">{sections}</div>
  <p class="empty" id="empty" hidden>No book matches that. Try an author’s name.</p>
</div>

<div class="wrap block">
  <h2>How these editions are made</h2>
  <ul class="how">
    <li><strong>Made with AI,</strong> page by page, from the original text or from the older translation named on each book. It is a reading aid, not a scholarly translation.</li>
    <li><strong>The original stays with you.</strong> One tap switches back to it at the same line, so you can always check a passage.</li>
    <li><strong>Free to read, no account needed.</strong> Highlight any passage to have it explained, simplified, or to ask about it.</li>
  </ul>
  <div class="close"><p>No text is beyond you.</p><a href="{SITE}/try">See how Tinct works</a></div>
</div>
</main>

<footer><div class="wrap"><span>Tinct</span><a href="{SITE}/privacy">Privacy</a><a href="{SITE}/terms">Terms</a><a href="{SITE}/credits">Credits</a></div></footer>

<script>
(function () {{
  var q = document.getElementById('q');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.row'));
  var houses = Array.prototype.slice.call(document.querySelectorAll('[data-house]'));
  var empty = document.getElementById('empty');
  q.addEventListener('input', function () {{
    var t = q.value.trim().toLowerCase();
    var shown = 0;
    rows.forEach(function (r) {{ var on = !t || r.getAttribute('data-q').indexOf(t) >= 0; r.hidden = !on; if (on) shown++; }});
    houses.forEach(function (h) {{ h.hidden = !h.querySelector('.row:not([hidden])'); }});
    empty.hidden = shown > 0;
    if (t && shown) document.getElementById('all').scrollIntoView({{ block: 'start', behavior: 'smooth' }});
  }});
}})();
</script>
'''
open(OUT, 'w').write(page)
print('ok', N, {k: len(v) for k, v in groups.items() if v})
