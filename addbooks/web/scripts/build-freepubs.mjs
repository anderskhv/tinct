#!/usr/bin/env node
// Builds freepubs.fyi: a static site of free public-domain EPUBs for search engines and
// readers, powered by the same catalogue and ranking as tinct.app/lab/addbook. Every page
// is plain HTML; only the search box needs JavaScript. Output: addbooks/web/dist/freepubs/
//   node addbooks/web/scripts/build-freepubs.mjs [--catalog <index.json[.gz]>]
//        [--origin https://freepubs.fyi] [--tinct https://tinct.app/lab/addbook/]
//        [--max-files 19000] [--max-books 12000]
// Cloudflare Pages serves at most 20,000 files per deployment, so the most-read books get
// their own page within --max-files; every book stays findable through search.
import { mkdirSync, rmSync, writeFileSync, cpSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { REPO, loadFullIndex, slimWork, obtainable } from './catalog.mjs';

const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback };
const ORIGIN = opt('--origin', 'https://freepubs.fyi').replace(/\/$/, '');
const TINCT = opt('--tinct', 'https://tinct.app/lab/addbook/');
const MAX_FILES = Number(opt('--max-files', 19000));
const MAX_BOOKS = Number(opt('--max-books', 12000));
const WEB = join(REPO, 'addbooks/web');
const OUT = join(WEB, 'dist/freepubs');
const SITE = 'freepubs.fyi';

/* ---------- Helpers ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slugify = s => String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').replace(/[æÆ]/g, 'ae').replace(/[øØ]/g, 'o').replace(/[đð]/g, 'd').replace(/ł/g, 'l')
  .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const idToken = id => String(id).toLowerCase().replace(/[^a-z0-9]+/g, '');
const langName = (() => { const dn = new Intl.DisplayNames(['en'], { type: 'language' }); return c => { try { return dn.of(c) || c } catch { return c } } })();
const SOURCE = { Gutenberg: 'Project Gutenberg', 'Standard Ebooks': 'Standard Ebooks' };
const sourceName = s => SOURCE[s] || s;
const life = p => p?.birthYear || p?.deathYear ? `${p.birthYear ?? '?'}–${p.deathYear ?? ''}` : '';
const plural = (n, one, many = one + 's') => `${n.toLocaleString('en')} ${n === 1 ? one : many}`;
const topicLabel = b => b.replace(/^Category:\s*/, '').replace(/\s+-\s+/, ': ');
const hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h };
const jsonLd = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
// "Dickens, Charles" -> "Charles Dickens", "Wells, H. G. (Herbert George)" -> "H. G. Wells".
const displayName = n => { const parts = (n || '').replace(/\s*\([^)]*\)/g, '').split(/,\s*/); if (parts.length < 2 || /\bof\b|^(Emperor|King|Queen|Saint|St\.|Pope|Duke|Earl|Lord|Lady|Baron|Count|Prince|Princess|Sir)\b/.test(parts[1])) return parts[0] || ''; const suffix = /^(Jr\.?|Sr\.?|[IVX]+)$/.test(parts[2] || '') ? ' ' + parts[2] : ''; return `${parts[1]} ${parts[0]}${suffix}` };

/* ---------- Catalogue ---------- */
const full = loadFullIndex(opt('--catalog'));
const works = full.works.filter(obtainable).filter(w => w.title).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
const builtAt = (full.builtAt || new Date().toISOString()).slice(0, 10);
const total = works.length;

// Fixed pages: home, search, about, 404, plus assets and sitemaps (reserve 40).
const topics = new Map(), langs = new Map(), authors = new Map();
const authorKey = p => `${p.name}|${p.birthYear ?? ''}`;
for (const w of works) {
  for (const b of w.bookshelves || []) if (b.startsWith('Category: ')) (topics.get(b) || topics.set(b, []).get(b)).push(w);
  for (const l of w.language || []) if (l && l !== 'und') (langs.get(l) || langs.set(l, []).get(l)).push(w);
  for (const p of w.authors || []) { if (!p.name || /^(anonymous|unknown|various)$/i.test(p.name)) continue; const k = authorKey(p); const a = authors.get(k) || authors.set(k, { person: p, works: [], score: 0 }).get(k); a.works.push(w); a.score += w.popularity || 0 }
}
const topicList = [...topics].filter(([, l]) => l.length >= 5).map(([name, list]) => ({ name, label: topicLabel(name), slug: slugify(topicLabel(name)), works: list }));
const langList = [...langs].filter(([, l]) => l.length >= 3).map(([code, list]) => ({ code, label: langName(code), slug: slugify(langName(code)) || code, works: list })).sort((a, b) => b.works.length - a.works.length);
let budget = MAX_FILES - 40 - topicList.length - langList.length;
const bookCount = Math.min(MAX_BOOKS, works.length, Math.floor(budget * 0.75));
const paged = works.slice(0, bookCount);
budget -= paged.length;
const pageOf = new Map(paged.map(w => [w.id, `/books/${(slugify(w.title).slice(0, 70).replace(/-+$/, '') || slugify(w.authors?.[0]?.name || '').slice(0, 40) || 'book')}-${idToken(w.id)}/`]));
const authorList = [...authors.values()].filter(a => a.works.some(w => pageOf.has(w.id))).sort((a, b) => b.score - a.score).slice(0, Math.max(0, budget));
const authorPage = new Map();
const usedAuthorSlugs = new Set();
for (const a of authorList) {
  let slug = slugify(displayName(a.person.name)) || 'author';
  if (usedAuthorSlugs.has(slug)) slug += a.person.birthYear ? `-${a.person.birthYear}` : '';
  while (usedAuthorSlugs.has(slug)) slug += '-x';
  usedAuthorSlugs.add(slug);
  authorPage.set(authorKey(a.person), `/authors/${slug}/`);
}
const topicPage = t => `/topics/${t.slug}/`, langPage = l => `/languages/${l.slug}/`;
const topicsByName = new Map(topicList.map(t => [t.name, t]));
const langsByCode = new Map(langList.map(l => [l.code, l]));

/* ---------- Layout ---------- */
const tinctUrl = (w, medium) => {
  const tid = w.onTinct && w.tinctIds?.[0];
  const base = tid ? new URL(`/read/${encodeURIComponent(tid)}`, TINCT) : new URL(TINCT);
  if (!tid) base.searchParams.set('work', w.id);
  base.searchParams.set('utm_source', 'freepubs'); base.searchParams.set('utm_medium', medium);
  return base.href;
};
const tinctPlain = medium => { const u = new URL(TINCT); u.searchParams.set('utm_source', 'freepubs'); u.searchParams.set('utm_medium', medium); return u.href };
function layout({ path, title, description, body, noindex, head = '', scripts = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${ORIGIN}${path}">`}
<meta property="og:site_name" content="${SITE}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${ORIGIN}${path}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#f4efe3">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/site.css">
${head}</head>
<body>
<header class="top"><div class="wrap">
  <a class="mark" href="/">free<b>epubs</b><span>.fyi</span></a>
  <form class="find" action="/search/" method="get" role="search"><label class="sr" for="q-top">Search free books</label><input id="q-top" name="q" type="search" placeholder="Search ${total.toLocaleString('en')} free books" autocomplete="off"><button type="submit">Search</button></form>
</div></header>
<main class="wrap">
${body}
</main>
<footer class="foot"><div class="wrap">
  <p><b>${SITE}</b> lists public-domain books you can download free as EPUB, from the libraries that publish them. Nothing here is hosted or sold.</p>
  <p class="links"><a href="/">Home</a> · <a href="/topics/">Topics</a> · <a href="/languages/">Languages</a> · <a href="/authors/">Authors</a> · <a href="/about/">About</a> · <a href="${esc(tinctPlain('footer'))}">Read with Tinct</a></p>
  <p class="fine">Public domain: every author died at least 70 years ago, or the text is anonymous and older than 1900. Copyright differs by country, so check yours before you download. Catalogue updated ${builtAt}.</p>
</div></footer>
${scripts}</body>
</html>
`;
}
const cover = (w, big) => { const a = displayName(w.authors?.[0]?.name || ''); return `<span class="cover h${hue(w.title) % 12}${big ? ' big' : ''}" aria-hidden="true"><span class="ct">${esc(w.title.length > 70 ? w.title.slice(0, 68) + '…' : w.title)}</span>${a ? `<span class="ca">${esc(a)}</span>` : ''}</span>` };
const byline = w => (w.authors || []).map(p => { const href = authorPage.get(authorKey(p)); const n = esc(displayName(p.name)); return href ? `<a href="${href}">${n}</a>` : n }).join(', ') || 'Anonymous';
const bookLink = w => pageOf.get(w.id) || w.editions[0]?.sourceUrl || w.editions[0]?.epubUrl;
function card(w) {
  const href = bookLink(w), own = pageOf.has(w.id);
  const lang = (w.language || []).filter(l => l !== 'und').map(langName).join(', ');
  return `<li class="card">${cover(w)}<div><a class="t" href="${esc(href)}"${own ? '' : ' rel="nofollow noopener" target="_blank"'}>${esc(w.title)}</a><span class="by">${esc((w.authors || []).map(p => displayName(p.name)).join(', ') || 'Anonymous')}</span><span class="m">${esc([lang, w.firstPublishedYear].filter(Boolean).join(' · '))}</span></div></li>`;
}
const grid = list => `<ol class="grid">${list.map(card).join('')}</ol>`;

/* ---------- Pages ---------- */
const files = new Map();
const put = (path, html) => files.set(path.endsWith('/') ? path + 'index.html' : path, html);

function bookPage(w) {
  const path = pageOf.get(w.id);
  const e = w.editions[0] || {};
  const authorsTxt = (w.authors || []).map(p => displayName(p.name)).join(', ');
  const lead = w.authors?.[0];
  const lang = (w.language || []).filter(l => l !== 'und');
  const shelves = (w.bookshelves || []).filter(b => b.startsWith('Category: '));
  const kind = shelves.map(topicLabel).find(t => /^(Novels|Poetry|Short Stories|Plays|Essays|Biographies|Journals)/.test(t));
  const kindWord = kind ? { 'Novels': 'novel', 'Poetry': 'book of poetry', 'Short Stories': 'collection of short stories', 'Plays/Films/Dramas': 'play', 'Essays, Letters & Speeches': 'book of essays, letters or speeches', 'Biographies': 'biography', 'Journals': 'journal' }[kind] || 'book' : 'book';
  const from = sourceName(e.source);
  const translators = (w.translators || []).map(p => displayName(p.name));
  const year = w.firstPublishedYear;
  const intro = `<i>${esc(w.title)}</i> is a ${esc(kindWord)}${authorsTxt ? ` by ${esc(authorsTxt)}${lead && life(lead) ? ` (${life(lead)})` : ''}` : ''}${year ? `, first published in ${year}` : ''}${lang.length ? `, in ${esc(lang.map(langName).join(' and '))}` : ''}${translators.length ? `, translated by ${esc(translators.join(', '))}` : ''}. It is in the public domain, so ${esc(from)} publishes it free: download the EPUB and read it on an e-reader, phone, tablet or computer.`;
  const editions = (w.editions || []).filter(x => x.epubUrl || x.sourceUrl).slice(0, 6);
  const more = (lead ? authors.get(authorKey(lead))?.works || [] : []).filter(x => x !== w).slice(0, 8);
  const topic = shelves.map(s => topicsByName.get(s)).find(Boolean);
  const alike = topic ? topic.works.filter(x => x !== w && !more.includes(x) && pageOf.has(x.id)).slice(0, 8) : [];
  const description = `Download ${w.title}${authorsTxt ? ` by ${authorsTxt}` : ''} as a free EPUB from ${from}. Public domain${year ? `, first published ${year}` : ''}. Read it on any e-reader, Kindle, phone or computer.`.slice(0, 300);
  const ld = { '@context': 'https://schema.org', '@type': 'Book', name: w.title, url: ORIGIN + path, inLanguage: lang, isAccessibleForFree: true,
    author: (w.authors || []).map(p => ({ '@type': 'Person', name: displayName(p.name), ...(p.birthYear ? { birthDate: String(p.birthYear) } : {}), ...(p.deathYear ? { deathDate: String(p.deathYear) } : {}) })),
    ...(year ? { datePublished: String(year) } : {}), ...(w.subjects?.length ? { keywords: w.subjects.slice(0, 6).join(', ') } : {}),
    ...(translators.length ? { translator: translators.map(name => ({ '@type': 'Person', name })) } : {}),
    sameAs: editions.map(x => x.sourceUrl).filter(Boolean),
    workExample: editions.filter(x => x.epubUrl).map(x => ({ '@type': 'Book', bookFormat: 'https://schema.org/EBook', url: x.sourceUrl || x.epubUrl, publisher: { '@type': 'Organization', name: sourceName(x.source) }, isAccessibleForFree: true })) };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Free EPUBs', item: ORIGIN + '/' }, ...(topic ? [{ '@type': 'ListItem', position: 2, name: topic.label, item: ORIGIN + topicPage(topic) }] : []), { '@type': 'ListItem', position: topic ? 3 : 2, name: w.title, item: ORIGIN + path }] };
  const tid = w.onTinct && w.tinctIds?.[0];
  const body = `
<nav class="crumbs"><a href="/">Free EPUBs</a>${topic ? ` › <a href="${topicPage(topic)}">${esc(topic.label)}</a>` : ''}</nav>
<article class="book">
  ${cover(w, true)}
  <div class="book-main">
    <h1>${esc(w.title)}${w.subtitle ? `<small>${esc(w.subtitle)}</small>` : ''}</h1>
    <p class="by">by ${byline(w)}${lead && life(lead) ? ` <span class="life">(${life(lead)})</span>` : ''}</p>
    <div class="get">
      ${e.epubUrl ? `<a class="btn go" href="${esc(e.epubUrl)}" rel="nofollow">Download free EPUB</a>` : ''}
      ${e.sourceUrl ? `<a class="btn" href="${esc(e.sourceUrl)}" rel="noopener">${e.epubUrl ? 'All formats' : 'Get it'} at ${esc(from)} ↗</a>` : ''}
    </div>
    <p class="intro">${intro}</p>
    <dl class="facts">
      ${authorsTxt ? `<dt>Author</dt><dd>${byline(w)}</dd>` : ''}
      ${translators.length ? `<dt>Translator</dt><dd>${esc(translators.join(', '))}</dd>` : ''}
      ${lang.length ? `<dt>Language</dt><dd>${lang.map(l => langsByCode.has(l) ? `<a href="${langPage(langsByCode.get(l))}">${esc(langName(l))}</a>` : esc(langName(l))).join(', ')}</dd>` : ''}
      ${year ? `<dt>First published</dt><dd>${year}</dd>` : ''}
      ${shelves.length ? `<dt>Topics</dt><dd>${shelves.map(s => topicsByName.get(s)).filter(Boolean).map(t => `<a href="${topicPage(t)}">${esc(t.label)}</a>`).join(', ')}</dd>` : ''}
      ${w.subjects?.length ? `<dt>Subjects</dt><dd>${esc(w.subjects.slice(0, 5).join('; '))}</dd>` : ''}
      <dt>Rights</dt><dd>${esc((e.copyright || 'Public domain').replace(/^Public domain: /, 'Public domain: '))}</dd>
      <dt>Source</dt><dd>${e.sourceUrl ? `<a href="${esc(e.sourceUrl)}" rel="noopener">${esc(from)}</a>` : esc(from)}</dd>
    </dl>
    <aside class="tinct">
      <p><b>Reading it for a class or a book club?</b> ${tid ? 'Tinct has its own edition of this book, with a modern English version alongside the original and a reading companion that explains hard passages.' : 'Open the EPUB in Tinct, a free reader with a companion that explains hard passages, answers questions about the book and keeps your highlights and notes.'}</p>
      <a class="btn tint" href="${esc(tinctUrl(w, 'book'))}">${tid ? 'Read it on Tinct' : 'Read it with Tinct'} →</a>
    </aside>
    ${editions.length > 1 ? `<h2>Other editions</h2><ul class="eds">${editions.slice(1).map(x => `<li>${esc(x.title || w.title)} · ${x.sourceUrl ? `<a href="${esc(x.sourceUrl)}" rel="nofollow noopener">${esc(sourceName(x.source))}</a>` : esc(sourceName(x.source))}${x.epubUrl ? ` · <a href="${esc(x.epubUrl)}" rel="nofollow">EPUB</a>` : ''}</li>`).join('')}</ul>` : ''}
  </div>
</article>
${more.length ? `<section><h2>More by ${esc(displayName(lead.name))}</h2>${grid(more)}${authorPage.has(authorKey(lead)) && (authors.get(authorKey(lead)).works.length > 9) ? `<p><a href="${authorPage.get(authorKey(lead))}">All ${plural(authors.get(authorKey(lead)).works.length, 'book')} by ${esc(displayName(lead.name))} →</a></p>` : ''}</section>` : ''}
${alike.length ? `<section><h2>More ${esc(topic.label)}</h2>${grid(alike)}</section>` : ''}
<section class="how"><h2>How to read a free EPUB</h2><p>EPUB is the standard ebook format. Kobo, PocketBook, Apple Books, Google Play Books and most reading apps open it directly. On a Kindle, use Amazon's <i>Send to Kindle</i>, which accepts EPUB files. On a computer, open it in a reader app or in <a href="${esc(tinctUrl({ id: w.id, onTinct: false }, 'howto'))}">Tinct</a>.</p></section>`;
  return layout({ path, title: `${w.title}${authorsTxt ? ` by ${authorsTxt.split(', ')[0]}` : ''}: free EPUB download`, description, body, head: jsonLd(ld) + '\n' + jsonLd(crumbs) + '\n' });
}

function listPage({ path, h1, intro, list, title, description, extra = '' }) {
  const shown = list.slice(0, 400);
  const body = `<nav class="crumbs"><a href="/">Free EPUBs</a></nav>
<h1>${h1}</h1><p class="lede">${intro}</p>${extra}
${grid(shown)}
${list.length > shown.length ? `<p class="more">Showing the ${shown.length} most-read of ${plural(list.length, 'book')}. <a href="/search/">Search</a> to find the rest.</p>` : ''}`;
  return layout({ path, title, description, body, head: jsonLd({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: ORIGIN + path, mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: shown.slice(0, 50).filter(w => pageOf.has(w.id)).map((w, i) => ({ '@type': 'ListItem', position: i + 1, url: ORIGIN + pageOf.get(w.id), name: w.title })) } }) + '\n' });
}

for (const w of paged) put(pageOf.get(w.id), bookPage(w));
for (const a of authorList) {
  const name = displayName(a.person.name), path = authorPage.get(authorKey(a.person));
  put(path, listPage({ path, h1: `${esc(name)}${life(a.person) ? ` <span class="life">(${life(a.person)})</span>` : ''}`, list: a.works,
    intro: `${plural(a.works.length, 'free public-domain book')} by ${esc(name)}, as EPUBs you can download and keep.`,
    title: `${name}: free EPUB books`, description: `Download ${a.works.length === 1 ? 'a free EPUB' : `${a.works.length} free EPUBs`} by ${name}${life(a.person) ? ` (${life(a.person)})` : ''}, including ${a.works.slice(0, 3).map(w => w.title).join(', ')}. Public domain.`.slice(0, 300) }));
}
for (const t of topicList) put(topicPage(t), listPage({ path: topicPage(t), h1: esc(t.label), list: t.works,
  intro: `${plural(t.works.length, 'free public-domain book')} in ${esc(t.label)}, most-read first.`,
  title: `Free ${t.label} EPUBs: ${t.works.length.toLocaleString('en')} public-domain books`, description: `Download free ${t.label} ebooks in EPUB: ${t.works.slice(0, 4).map(w => w.title).join(', ')} and ${(t.works.length - 4).toLocaleString('en')} more public-domain books.` }));
for (const l of langList) put(langPage(l), listPage({ path: langPage(l), h1: `Free books in ${esc(l.label)}`, list: l.works,
  intro: `${plural(l.works.length, 'public-domain book')} in ${esc(l.label)}, free to download as EPUB.`,
  title: `Free ${l.label} EPUB books: ${l.works.length.toLocaleString('en')} public-domain titles`, description: `Download free ebooks in ${l.label} as EPUB: ${l.works.slice(0, 4).map(w => w.title).join(', ')} and more public-domain books.` }));

const index = (path, h1, intro, items) => put(path, layout({ path, title: `${h1}: free EPUB books | ${SITE}`, description: intro, body: `<nav class="crumbs"><a href="/">Free EPUBs</a></nav><h1>${h1}</h1><p class="lede">${esc(intro)}</p><ul class="tags">${items.join('')}</ul>` }));
index('/topics/', 'Topics', `Browse ${total.toLocaleString('en')} free public-domain EPUBs by topic.`, [...topicList].sort((a, b) => a.label.localeCompare(b.label)).map(t => `<li><a href="${topicPage(t)}">${esc(t.label)} <span>${t.works.length.toLocaleString('en')}</span></a></li>`));
index('/languages/', 'Languages', `Free public-domain EPUBs in ${langList.length} languages.`, langList.map(l => `<li><a href="${langPage(l)}">${esc(l.label)} <span>${l.works.length.toLocaleString('en')}</span></a></li>`));
index('/authors/', 'Authors', `The ${authorList.length > 1000 ? '1,000 most-read' : authorList.length} authors with free public-domain EPUBs here.`, authorList.slice(0, 1000).map(a => `<li><a href="${authorPage.get(authorKey(a.person))}">${esc(displayName(a.person.name))} <span>${a.works.length}</span></a></li>`));

const homeTopics = ['Category: Novels', 'Category: Science-Fiction & Fantasy', 'Category: Crime, Thrillers and Mystery', 'Category: Philosophy & Ethics', 'Category: Poetry', 'Category: Classics of Literature', 'Category: Children & Young Adult Reading', 'Category: History - Ancient'].map(n => topicsByName.get(n)).filter(Boolean);
put('/', layout({ path: '/', title: `Free EPUB books: ${total.toLocaleString('en')} public-domain classics to download | ${SITE}`,
  description: `Search and download ${total.toLocaleString('en')} free EPUB ebooks: public-domain classics from Project Gutenberg and other libraries. No sign-up, no ads, straight from the source.`,
  head: jsonLd({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE, url: ORIGIN + '/', potentialAction: { '@type': 'SearchAction', target: `${ORIGIN}/search/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }) + '\n',
  body: `<section class="hero">
  <h1>Free EPUB books</h1>
  <p class="lede">${total.toLocaleString('en')} public-domain classics, from Project Gutenberg and other libraries. Find a book, then download the EPUB straight from the library that publishes it.</p>
  <form class="big-find" action="/search/" method="get" role="search"><label class="sr" for="q">Title, author or subject</label><input id="q" name="q" type="search" placeholder="Title, author or subject" autocomplete="off" autofocus><button type="submit">Search</button></form>
  <p class="try">Try <a href="/search/?q=pride+and+prejudice">Pride and Prejudice</a>, <a href="/search/?q=dostoevsky">Dostoevsky</a>, <a href="/search/?q=sherlock+holmes">Sherlock Holmes</a>, <a href="/search/?q=meditations">Meditations</a></p>
</section>
<section><h2>Most downloaded</h2>${grid(works.slice(0, 24))}</section>
${homeTopics.map(t => `<section><h2><a href="${topicPage(t)}">${esc(t.label)}</a></h2>${grid(t.works.slice(0, 6))}<p><a href="${topicPage(t)}">All ${plural(t.works.length, 'book')} →</a></p></section>`).join('\n')}
<section><h2>Browse</h2><p><a href="/topics/">All ${topicList.length} topics</a> · <a href="/languages/">${langList.length} languages</a> · <a href="/authors/">Authors</a></p></section>` }));

put('/search/', layout({ path: '/search/', noindex: true, title: `Search free EPUB books | ${SITE}`, description: `Search ${total.toLocaleString('en')} free public-domain EPUBs by title, author or subject.`,
  body: `<h1 class="sr">Search</h1><form class="big-find" id="find" action="/search/" method="get" role="search"><label class="sr" for="q">Title, author or subject</label><input id="q" name="q" type="search" placeholder="Title, author or subject" autocomplete="off"><button type="submit">Search</button></form>
<p id="status" class="lede" role="status" aria-live="polite">Loading the catalogue…</p><ol id="results" class="grid"></ol><button id="more" class="btn" type="button" hidden>Show more</button>
<noscript><p>Search needs JavaScript. You can <a href="/topics/">browse by topic</a> instead.</p></noscript>`, scripts: '<script type="module" src="/js/find.js"></script>\n' }));

put('/about/', layout({ path: '/about/', title: `About ${SITE}`, description: `${SITE} is a free, ad-free index of public-domain EPUB books, linking to the libraries that publish them.`, body: `<h1>About</h1>
<p class="lede">${SITE} is an index of free ebooks that are in the public domain. It doesn't host, sell or change any books. Each download link goes to the library that publishes the book, such as Project Gutenberg.</p>
<h2>What counts as public domain here</h2><p>A book is listed only if every author, translator and illustrator died at least 70 years ago, or the text is anonymous and older than 1900. That is the rule in the EU, the UK and many other countries. Some countries use different terms, so check yours before you download.</p>
<h2>Who makes it</h2><p>${SITE} is made by <a href="${esc(new URL('/', TINCT).href)}">Tinct</a>, a reading app for classic books. Tinct's companion explains hard passages and answers questions while you read. You can <a href="${esc(tinctPlain('about'))}">open any EPUB from here in Tinct</a> for free.</p>
<h2>Libraries</h2><ul>${Object.entries(full.sources || {}).map(([s, n]) => `<li>${esc(sourceName(s))}: ${n.toLocaleString('en')} books</li>`).join('')}</ul>` }));

put('/404.html', layout({ path: '/404.html', noindex: true, title: `Not found | ${SITE}`, description: 'This page does not exist.', body: `<h1>Page not found</h1><p class="lede">That page doesn't exist, or the book has moved. Try a search.</p><form class="big-find" action="/search/" method="get" role="search"><label class="sr" for="q">Title, author or subject</label><input id="q" name="q" type="search" placeholder="Title, author or subject"><button type="submit">Search</button></form>` }));

/* ---------- Write ---------- */
rmSync(OUT, { recursive: true, force: true });
for (const [path, html] of files) { const file = join(OUT, path); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, html) }

// Search: the same worker and ranking as the Add-a-book page, plus each book's page path.
mkdirSync(join(OUT, 'js'), { recursive: true }); mkdirSync(join(OUT, 'data'), { recursive: true });
cpSync(join(REPO, 'addbooks/site/search.js'), join(OUT, 'js/search.js'));
cpSync(join(WEB, 'src/js/search-worker.js'), join(OUT, 'js/search-worker.js'));
cpSync(join(WEB, 'freepubs/find.js'), join(OUT, 'js/find.js'));
cpSync(join(WEB, 'freepubs/site.css'), join(OUT, 'site.css'));
cpSync(join(WEB, 'freepubs/favicon.svg'), join(OUT, 'favicon.svg'));
const slim = works.map(w => { const s = slimWork(w); const p = pageOf.get(w.id); if (p) s.page = p; return s });
writeFileSync(join(OUT, 'data/catalog.json.gz'), gzipSync(Buffer.from(JSON.stringify({ version: 1, builtAt: full.builtAt, works: slim })), { level: 9 }));

// Sitemaps (50,000 URLs each), robots, headers.
const urls = [...files.keys()].filter(p => !/^\/(search|404)/.test(p)).map(p => ORIGIN + p.replace(/index\.html$/, ''));
const maps = [];
for (let i = 0; i < urls.length; i += 45000) {
  const name = `sitemap-${maps.length + 1}.xml`; maps.push(name);
  writeFileSync(join(OUT, name), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.slice(i, i + 45000).map(u => `<url><loc>${esc(u)}</loc><lastmod>${builtAt}</lastmod></url>`).join('\n')}\n</urlset>\n`);
}
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps.map(m => `<sitemap><loc>${ORIGIN}/${m}</loc><lastmod>${builtAt}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>\n`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /search/\nDisallow: /data/\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
writeFileSync(join(OUT, '_headers'), `/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: interest-cohort=()
/data/*
  Cache-Control: public, max-age=86400
  Content-Type: application/octet-stream
/js/*
  Cache-Control: public, max-age=3600
/site.css
  Cache-Control: public, max-age=3600
`);
let sha = 'local';
try { sha = execSync('git rev-parse --short HEAD', { cwd: REPO }).toString().trim() } catch {}
writeFileSync(join(OUT, 'build.json'), JSON.stringify({ site: SITE, origin: ORIGIN, commit: sha, catalogueBuiltAt: full.builtAt, works: total, bookPages: paged.length, authorPages: authorList.length, topicPages: topicList.length, languagePages: langList.length, htmlFiles: files.size }, null, 2) + '\n');
const fileCount = Number(execSync(`find "${OUT}" -type f | wc -l`).toString().trim());
console.log(`Built ${OUT}\n  ${total.toLocaleString('en')} works; pages: ${paged.length} books, ${authorList.length} authors, ${topicList.length} topics, ${langList.length} languages\n  ${fileCount} files (limit ${MAX_FILES})`);
if (fileCount > 20000) { console.error('Over the Cloudflare Pages limit of 20,000 files. Lower --max-files.'); process.exit(1) }
