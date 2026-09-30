const $ = id => document.getElementById(id);
let worker;
let ready = false, request = 0, limit = 24, timer;
const languageNames = new Intl.DisplayNames(['en'], {type:'language'});
const languageLabel = code => { try { return languageNames.of(code); } catch { return code; } };
const filters = () => ({language:$('language').value, subject:$('subject').value, standardOnly:$('standard-only').checked});
function query({more = false} = {}) {
  if (!ready) return;
  if (!more) limit = 24;
  const f = filters(), q = $('query').value.trim();
  $('reset').hidden = f.language === 'en' && !f.subject && !f.standardOnly;
  const empty = !q && !f.subject && !f.standardOnly && f.language === 'en';
  $('empty').hidden = !empty;
  $('no-results').hidden = true;
  $('show-more').hidden = true;
  $('sort-label').hidden = empty;
  $('sort-label').textContent = q ? 'Best match' : 'Most downloaded';
  request++;
  if (empty) {
    $('results').replaceChildren();
    $('status').textContent = 'Search the catalogue';
    document.querySelector('.results-panel').setAttribute('aria-busy', 'false');
    return;
  }
  document.querySelector('.results-panel').setAttribute('aria-busy', 'true');
  worker.postMessage({type:'search', request, query:q, filters:f, limit});
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function renderCard(work) {
  const edition = work.editions[0];
  const card = element('article', 'card');
  card.dataset.workId = work.id;
  const cover = element('div', 'cover');
  cover.setAttribute('aria-hidden', 'true');
  const palette = ['#304c54','#674c42','#3e4c3d','#514654','#695936'];
  cover.style.setProperty('--cover', palette[[...work.id].reduce((n,c) => n+c.charCodeAt(0), 0) % palette.length]);
  const coverType = element('div', 'cover-type');
  coverType.append(element('span','cover-title',work.title), element('span','cover-author',work.authors.map(a=>a.name).join(' · ')));
  cover.append(coverType);
  if (edition.coverUrl && /^https:\/\//.test(edition.coverUrl)) {
    const img = element('img'); img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
    img.addEventListener('load', () => { img.style.opacity = '1'; }, {once:true});
    img.addEventListener('error', () => img.remove(), {once:true});
    img.src = edition.coverUrl; cover.append(img);
  }
  const content = element('div','card-content'), badges = element('div','badges');
  badges.append(element('span', 'badge' + (work.quality === 'clean' ? ' clean' : ''), edition.source));
  if (work.onTinct) badges.append(element('span','badge tinct','On Tinct'));
  content.append(badges, element('h2','',work.title), element('p','author',work.authors.map(a=>a.name).join(' · ') || 'Author unknown'));
  const year = work.firstPublishedYear ? (work.firstPublishedYear < 0 ? Math.abs(work.firstPublishedYear) + ' BCE' : work.firstPublishedYear) : 'Year unknown';
  content.append(element('p','metadata', [year, ...work.language.map(languageLabel)].join(' · ')));
  if (edition.translators.length) content.append(element('p','metadata','Translated by ' + edition.translators.map(t=>t.name).join(' · ')));
  const bottom = element('div','card-bottom');
  bottom.append(element('span','edition-count',work.editions.length + (work.editions.length === 1 ? ' edition' : ' editions')));
  const add = element('button','add'); add.type = 'button'; add.disabled = true; add.title = 'Coming soon'; add.setAttribute('aria-label','Add ' + work.title + ' — Coming soon');
  add.append(element('span','','Add +'),element('small','','Coming soon')); bottom.append(add); content.append(bottom);
  card.append(cover,content); return card;
}
function onWorkerMessage({data}) {
  if (data.type === 'ready') {
    ready = true;
    $('catalog-count').textContent = data.total.toLocaleString() + ' works';
    $('language').replaceChildren(new Option('All languages',''), ...data.languages.map(([code]) => new Option(languageLabel(code), code)));
    $('language').value = 'en';
    for (const [subject] of data.subjects) $('subject').add(new Option(subject.replace(/^Category: /,''),subject));
    document.querySelectorAll('input,select,.suggestions button').forEach(el=>el.disabled=false);
    $('coverage').textContent = data.coverage.startsWith('partial') ? 'US public domain · SE: 15 recent releases' : 'US public-domain catalogue';
    $('offline-status').textContent = 'Ready';
    if ('caches' in window) caches.match('./data/index.json.gz').then(cached => {
      $('offline-status').textContent = cached ? 'Available offline' : 'Ready · session only';
    }).catch(() => {});
    query();
  } else if (data.type === 'results' && data.request === request) {
    $('empty').hidden = true;
    $('results').replaceChildren(...data.results.map(renderCard));
    $('status').textContent = data.total.toLocaleString() + (data.total === 1 ? ' book' : ' books');
    $('status').dataset.searchMs = data.elapsedMs;
    $('no-results').hidden = data.total !== 0;
    $('show-more').hidden = data.total <= limit;
    document.querySelector('.results-panel').setAttribute('aria-busy','false');
  } else if (data.type === 'error') {
    $('empty').hidden = true; $('error').hidden = false;
    $('error-message').textContent = data.message;
    $('status').textContent = 'Catalogue unavailable'; $('offline-status').textContent = 'Not loaded';
    document.querySelector('.results-panel').setAttribute('aria-busy','false');
  }
};
$('search-form').addEventListener('submit', e=>{e.preventDefault();clearTimeout(timer);query();});
$('query').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(query,80);});
for (const id of ['language','subject','standard-only']) $(id).addEventListener('change',()=>query());
function reset() { $('language').value='en';$('subject').value='';$('standard-only').checked=false; }
$('reset').addEventListener('click',()=>{reset();query();});
$('clear-search').addEventListener('click',()=>{reset();$('query').value='';query();$('query').focus();});
$('reload').addEventListener('click',()=>location.reload());
$('show-more').addEventListener('click',()=>{limit+=24;query({more:true});});
document.querySelectorAll('[data-query]').forEach(button=>button.addEventListener('click',()=>{$('query').value=button.dataset.query;query();$('query').focus();}));
document.addEventListener('keydown',event=>{
  if (event.key === '/' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)) {event.preventDefault();$('query').focus();}
});
async function start() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) await Promise.race([
        new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})),
        new Promise(resolve=>setTimeout(resolve,2500))
      ]);
    } catch { /* In-memory search still works when persistence is unavailable. */ }
  }
  // Create only after the page is controlled: workers inherit the controller at creation.
  worker = new Worker('./search-worker.js', {type: 'module'});
  worker.onmessage = onWorkerMessage;
  worker.onerror = () => { $('status').textContent = 'Search could not start. Reload to try again.'; };
  worker.postMessage({type:'load'});
}
start();
