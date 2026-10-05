// freepubs.fyi search: the Add-a-book catalogue worker and ranking, rendered as links to
// each book's page here (or to its library when the book has no page of its own).
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const names = new Intl.DisplayNames(['en'], { type: 'language' });
const langName = c => { try { return names.of(c) || c } catch { return c } };
const displayName = n => { const parts = (n || '').replace(/\s*\([^)]*\)/g, '').split(/,\s*/); if (parts.length < 2 || /\bof\b|^(Emperor|King|Queen|Saint|St\.|Pope|Duke|Earl|Lord|Lady|Baron|Count|Prince|Princess|Sir)\b/.test(parts[1])) return parts[0] || ''; const suffix = /^(Jr\.?|Sr\.?|[IVX]+)$/.test(parts[2] || '') ? ' ' + parts[2] : ''; return `${parts[1]} ${parts[0]}${suffix}` };
const hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h };
const params = new URLSearchParams(location.search);
let query = params.get('q') || '', limit = 24, request = 0, ready = false;
$('q').value = query;
const worker = new Worker('/js/search-worker.js', { type: 'module' });
function card(w) {
  const e = w.editions[0] || {}, own = !!w.page, href = w.page || e.sourceUrl || e.epubUrl;
  const by = (w.authors || []).map(p => displayName(p.name)).join(', ') || 'Anonymous';
  const lang = (w.language || []).filter(l => l !== 'und').map(langName).join(', ');
  const title = w.title.length > 70 ? w.title.slice(0, 68) + '…' : w.title;
  return `<li class="card"><span class="cover h${hue(w.title) % 12}" aria-hidden="true"><span class="ct">${esc(title)}</span><span class="ca">${esc(displayName(w.authors?.[0]?.name || ''))}</span></span><div><a class="t" href="${esc(href)}"${own ? '' : ' rel="nofollow noopener" target="_blank"'}>${esc(w.title)}</a><span class="by">${esc(by)}</span><span class="m">${esc([lang, w.firstPublishedYear].filter(Boolean).join(' · '))}</span></div></li>`;
}
function run() {
  if (!ready) return;
  if (!query.trim()) { $('status').textContent = 'Search by title, author or subject.'; $('results').innerHTML = ''; $('more').hidden = true; return }
  worker.postMessage({ type: 'search', query, filters: {}, limit, request: ++request });
}
worker.onmessage = ({ data }) => {
  if (data.type === 'ready') { ready = true; run() }
  else if (data.type === 'results' && data.request === request) {
    $('status').textContent = data.total ? `${data.total.toLocaleString('en')} free book${data.total === 1 ? '' : 's'} for “${query}”` : `No free books match “${query}”. Try fewer words, or an author's surname.`;
    $('results').innerHTML = data.results.map(card).join('');
    $('more').hidden = data.results.length >= data.total;
  } else if (data.type === 'error') $('status').textContent = 'The catalogue could not be loaded. Reload the page to try again.';
};
worker.postMessage({ type: 'load' });
$('find').addEventListener('submit', e => { e.preventDefault(); query = $('q').value; limit = 24; history.replaceState(null, '', query ? `?q=${encodeURIComponent(query)}` : location.pathname); run() });
let typing;
$('q').addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(() => { query = $('q').value; limit = 24; history.replaceState(null, '', query ? `?q=${encodeURIComponent(query)}` : location.pathname); run() }, 180) });
$('more').addEventListener('click', () => { limit += 24; run() });
