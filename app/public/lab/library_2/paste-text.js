// A private, local-only text source. The generated EPUB goes through the existing own-book
// file/ownership/export/deletion path. No pasted URL or image is fetched while preparing it.
const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const allowedUrl = value => /^https?:\/\//i.test(value) || /^mailto:/i.test(value) || /^#[^#]/.test(value);
const BLOCK = new Set(['p', 'div', 'section', 'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'br']);
const INLINE = new Set(['span', 'em', 'i', 'strong', 'b', 'u', 's', 'sub', 'sup', 'small', 'cite', 'q', 'abbr', 'code', 'mark', 'a', 'del', 'ins']);
const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea', 'noscript', 'video', 'audio', 'canvas', 'template', 'link', 'meta', 'head', 'base', 'source', 'track', 'svg', 'math']);

/** Preserve source text and useful structure, discard executable markup and remote resources. */
export function sanitizeHtml(source) {
 // Template content is inert. Parsing into a document can start remote image loads
 // before the sanitizer gets a chance to remove those nodes.
 const template = document.createElement('template');
 template.innerHTML = source;
 function walk(node) {
  if (node.nodeType === 3) return escape(node.nodeValue);
  if (node.nodeType !== 1) return '';
  const tag = node.localName.toLowerCase();
  if (DROP.has(tag)) return '';
  if (tag === 'img') return `<span>[Image${node.getAttribute('alt') ? ': ' + escape(node.getAttribute('alt')) : ''}]</span>`;
  // Full-text archives copy prose inside one preformatted element. Preserve its
  // paragraph and line boundaries instead of importing a whole book as one block.
  // Explicit code samples retain their preformatted structure.
  if (tag === 'pre' && !node.querySelector('code')) {
   return (node.textContent || '').replace(/\r\n?/g, '\n').split(/\n\s*\n/)
    .filter(part => part.trim()).map(part => `<p>${part.split('\n').map(escape).join('<br/>')}</p>`).join('\n');
  }
  const inner = [...node.childNodes].map(walk).join('');
  if (!BLOCK.has(tag) && !INLINE.has(tag)) return inner;
  if (tag === 'br' || tag === 'hr') return `<${tag}/>`;
  let attrs = '';
  if (tag === 'a') {
   const href = (node.getAttribute('href') || '').trim();
   if (allowedUrl(href)) attrs = ` href="${escape(href)}"`;
  }
  if (tag === 'ol' && /^\d{1,5}$/.test(node.getAttribute('start') || '')) attrs = ` start="${node.getAttribute('start')}"`;
  return `<${tag}${attrs}>${inner}</${tag}>`;
 }
 return [...template.content.childNodes].map(walk).join('');
}

function inline(source) {
 // Escape first: Markdown never becomes executable HTML. Only safe absolute URLs are linked.
 let result = '', last = 0;
 const pattern = /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`/g;
 for (const m of source.matchAll(pattern)) {
  result += escape(source.slice(last, m.index));
  if (m[1] !== undefined) result += allowedUrl(m[2]) ? `<a href="${escape(m[2])}">${escape(m[1])}</a>` : escape(m[0]);
  else if (m[3] !== undefined) result += `<strong>${escape(m[3])}</strong>`;
  else if (m[4] !== undefined) result += `<em>${escape(m[4])}</em>`;
  else result += `<code>${escape(m[5])}</code>`;
  last = m.index + m[0].length;
 }
 return result + escape(source.slice(last));
}

export function markdownHtml(source) {
 const lines = source.replace(/\r\n?/g, '\n').split('\n');
 const out = []; let i = 0;
 while (i < lines.length) {
  const line = lines[i];
  if (!line.trim()) { i++; continue; }
  const fence = /^\s*(`{3,}|~{3,})/.exec(line);
  if (fence) { const body = []; i++; while (i < lines.length && !new RegExp('^\\s*' + fence[1][0] + '{' + fence[1].length + ',}\\s*$').test(lines[i])) body.push(lines[i++]); if (i < lines.length) i++; out.push(`<pre><code>${escape(body.join('\n'))}</code></pre>`); continue; }
  const heading = /^(#{1,6})\s+(.+)$/.exec(line);
  if (heading) { out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); i++; continue; }
  if (/^\s*>/.test(line)) { const parts = []; while (i < lines.length && /^\s*>/.test(lines[i])) parts.push(lines[i++].replace(/^\s*> ?/, '')); out.push(`<blockquote><p>${parts.map(inline).join('<br/>')}</p></blockquote>`); continue; }
  const list = /^(\s*)([-+*]|\d+[.)])\s+(.+)$/.exec(line);
  if (list) { const ordered = /^\d/.test(list[2]), parts = []; const rx = ordered ? /^\s*\d+[.)]\s+(.+)$/ : /^\s*[-+*]\s+(.+)$/; while (i < lines.length && rx.test(lines[i])) parts.push(`<li>${inline(rx.exec(lines[i++])[1])}</li>`); const tag = ordered ? 'ol' : 'ul'; const start = ordered && /^\d+/.exec(list[2])[0] !== '1' ? ` start="${Number.parseInt(list[2], 10)}"` : ''; out.push(`<${tag}${start}>${parts.join('')}</${tag}>`); continue; }
  const para = []; while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*>|\s*[-+*]\s|\s*\d+[.)]\s|\s*`{3,}|\s*~{3,})/.test(lines[i])) para.push(lines[i++]);
  // A single unrecognised line still advances the parser.
  if (!para.length) para.push(lines[i++]);
  out.push(`<p>${para.map(inline).join('<br/>')}</p>`);
 }
 return out.join('\n');
}

export function trimSource(source, start = 0, end = 0) {
 const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
 if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < 0 || start + end >= lines.length) throw new Error('Trim leaves no text.');
 return lines.slice(start, lines.length - end).join('\n');
}

export function detectFormat(source) {
 const first=String(source).trimStart();
 if(/^<(?:!doctype\s+html|html|body|p|h[1-6]|div|section|blockquote|ul|ol|figure)\b/i.test(first))return 'html';
 // Incidental numbered lines or OCR punctuation later in a book are source text.
 // Infer Markdown only when its opening declares that structure.
 if(/^(?:#{1,6}\s+|\s*[-+*]\s+|\s*\d+[.)]\s+|\s*>\s+|\s*`{3,}|\s*~{3,})/.test(first))return 'markdown';
 return 'plain';
}
export function suggestedTitle(source, format='auto') {
 if(format==='auto')format=detectFormat(source);
 if(format==='markdown')return /^#\s+([^\n]+)$/m.exec(source)?.[1]?.replace(/[*_`]/g,'').trim().slice(0,200)||'';
 if(format==='html'){
  const template=document.createElement('template');template.innerHTML=source;
  return (template.content.querySelector('h1')?.textContent||'').trim().slice(0,200);
 }
 return '';
}

/* Web-page chrome (4 Nov 2026). An article copied from a web page brings the site with it: its menu,
 like and comment counters, a paywall prompt, teasers for other articles and the footer. They are left
 out before the book is made, and only where they clearly are the site's: a run of short menu or footer
 labels at either end, counters beside their numbers, the site's own paywall and "Continue reading"
 lines with what follows them, and an image caption repeated in the prose. A sentence of the article is
 never taken, and the same article pasted without them comes out the same. */
const folded = text => String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();
const wordsOf = text => (folded(text).match(/\S+/g) || []).length;
const MENU = /^(?:home|menu|search|subscribe(?: now)?|sign ?in|sign ?up|log ?in|log ?out|register|my account|newsletters?|archive|take archive|about(?: us)?|contact(?: us)?|careers|jobs|store|shop|donate|advertise|gift a sub(?:scription)?|give a gift subscription|skip to (?:main )?content|podcasts?|writers|authors|events|explore|powered by \S+(?: \S+)?|get the app|start writing|upgrade to paid|share)$/i;
const FOOTER_LINK = /^(?:terms(?: of (?:use|service))?|terms (?:&|and) conditions|privacy(?: policy)?|privacy ∙ terms ∙ collection notice|cookie (?:policy|settings|preferences)|collection notice|accessibility|sitemap|rss|newsletters?|advertise|contact(?: us)?|careers|about(?: us)?|facebook|instagram|x(?: \(twitter\))?|twitter|linkedin|youtube|tiktok|threads|bluesky|mastodon|reddit|get the app|start writing)$/i;
// A copyright line closes a site's footer, but a book may end on one too: never a footer alone.
const LEGAL = /^(?:.*\ball rights reserved\b.*|(?:©|\(c\)|copyright ©?) ?\d{4}.*)$/i;
const COUNTER = /^(?:\d[\d,.]*[km]?\s*)?(?:likes?|comments?|restacks?|shares?|replies)$/i;
const NUMBER = /^\d[\d,.]*[km]?$/i;
const BUTTON = /^(?:share|subscribe|subscribe now|leave a comment|share this post|upgrade to paid)$/i;
// The site's own prompt where its free text ends; what follows it is the site's, not the article's.
const PAYWALL = /^(?:enter your email to (?:continue|keep) reading|this post is for (?:paid|paying) subscribers(?: only)?|keep reading with a \d+-day free trial|subscribe to (?:continue|keep) reading|continue reading this post for free.*|create a free account to (?:continue|keep) reading.*|you(?:'|’)ve reached your (?:free )?article limit.*)$/i;
const RELATED = /^(?:continue reading|read (?:more|next)|more (?:from|in|by) .{1,40}|related(?: (?:posts|articles|stories|reading|content))?|recommended(?: for you)?|you (?:may|might) also (?:like|enjoy)|ready for more\??|discussion about this post|more stories|up next|popular(?: posts| now)?|most (?:popular|read))$/i;
const label = text => { const t = folded(text); return !!t && wordsOf(t) <= 6 && t.length <= 60 && !/[.?!;,:]$/.test(t); };

/** Which of an article's units (lines, or blocks of HTML) are the site's: their indexes. */
export function chromeUnits(units) {
 const texts = units.map(unit => folded(typeof unit === 'string' ? unit : unit.text));
 const caption = units.map(unit => typeof unit === 'object' && !!unit.caption);
 const drop = new Set();
 const filled = texts.map((t, i) => t ? i : -1).filter(i => i >= 0);
 if (!filled.length) return drop;
 const wordsBetween = (from, to) => filled.filter(i => i >= from && i < to).reduce((n, i) => n + wordsOf(texts[i]), 0);
 const total = wordsBetween(0, texts.length);
 // The site's menu: a run of short labels opening the paste, up to its last menu label.
 { const menus = new Set(), seen = new Set(); let last = -1;
  for (const i of filled) {
   if (!label(texts[i])) break;
   const key = texts[i].toLowerCase();
   if (MENU.test(texts[i])) { menus.add(key); last = i; } else if (seen.has(key)) last = i;
   seen.add(key);
  }
  // Three different menu labels at least, and most of what they close.
  const before = filled.filter(i => i <= last);
  if (menus.size >= 3 && before.filter(i => MENU.test(texts[i]) || texts.slice(0, i).includes(texts[i])).length * 2 >= before.length) before.forEach(i => drop.add(i));
 }
 // Where the site's paywall or its teasers for other articles begin, the article has ended.
 let end = texts.length;
 for (const i of filled) {
  if (PAYWALL.test(texts[i]) && wordsBetween(0, i) >= wordsBetween(i, texts.length)) { end = i; break; }
  const t = texts[i].replace(/:$/, '');
  if (RELATED.test(t) && wordsBetween(0, i) >= total * 0.4 && wordsBetween(i, texts.length) < wordsBetween(0, i)
   && filled.filter(j => j > i).every(j => wordsOf(texts[j]) <= 80)) { end = i; break; }
 }
 for (const i of filled) if (i >= end) drop.add(i);
 // The site's footer: a run of short labels closing the paste, from its first footer label.
 { const links = new Set(); let first = -1;
  for (const i of [...filled].reverse()) {
   if (i >= end) continue;
   if (FOOTER_LINK.test(texts[i])) { links.add(texts[i].toLowerCase()); first = i; continue; }
   if (LEGAL.test(texts[i])) { first = i; continue; }
   if (!label(texts[i])) break;
  }
  if (links.size >= 2) for (const i of filled) if (i >= first) drop.add(i);
 }
 // Like and comment counters ("202", "Likes", "31", "Comments", "Share"), and a lone share button in the prose.
 for (let k = 0; k < filled.length; k++) {
  let m = k;
  while (m < filled.length && (NUMBER.test(texts[filled[m]]) || COUNTER.test(texts[filled[m]]) || BUTTON.test(texts[filled[m]]))) m += 1;
  const run = filled.slice(k, m);
  if (run.some(i => COUNTER.test(texts[i]))) run.forEach(i => drop.add(i));
  else if (run.length === 1 && BUTTON.test(texts[run[0]])) {
   const before = filled[k - 1], after = filled[m];
   if ((before === undefined || wordsOf(texts[before]) > 15) && (after === undefined || wordsOf(texts[after]) > 15)) drop.add(run[0]);
  }
  if (m > k) k = m - 1;
 }
 // An image caption set again in the prose (the same picture placed twice): a figure's caption in HTML;
 // in plain text, a line on its own among a web page's paragraphs (one to a line, see plainHtml).
 const lines = !units.some(unit => typeof unit === 'object');
 const webLine = i => {
  let from = i, to = i;
  while (from > 0 && texts[from - 1]) from -= 1;
  while (to < texts.length - 1 && texts[to + 1]) to += 1;
  return texts.slice(from, to + 1).some(t => t.length > 240) && [texts[i - 1], texts[i + 1]].every(near => !near || wordsOf(near) > 20);
 };
 filled.forEach((i, at) => {
  if (drop.has(i) || wordsOf(texts[i]) < 5 || wordsOf(texts[i]) > 60) return;
  const earlier = filled.slice(0, at).find(j => !drop.has(j) && texts[j] === texts[i]);
  if (earlier === undefined) return;
  if (caption[i] ? caption[earlier] : lines && webLine(i)) drop.add(i);
 });
 return drop;
}

/** A pasted HTML page without the site around its article (chromeUnits). */
function withoutHtmlChrome(html) {
 const template = document.createElement('template');
 template.innerHTML = html;
 const leaves = [...template.content.querySelectorAll('p,div,section,article,h1,h2,h3,h4,h5,h6,blockquote,pre,li,dt,dd,figcaption,td,th,caption')]
  .filter(el => !el.querySelector('p,div,section,article,h1,h2,h3,h4,h5,h6,blockquote,pre,ul,ol,li,dl,dt,dd,figure,figcaption,table,td,th,caption'));
 const drop = chromeUnits(leaves.map(el => ({ text: el.textContent || '', caption: el.localName === 'figcaption' })));
 if (!drop.size) return html;
 for (const i of drop) {
  const el = leaves[i];
  const gone = el.localName === 'figcaption' && el.parentElement?.localName === 'figure' ? el.parentElement : el;
  let parent = gone.parentElement;
  gone.remove();
  while (parent && !folded(parent.textContent)) { const up = parent.parentElement; parent.remove(); parent = up; }
 }
 return template.innerHTML;
}

/** A number opening a short line that stands between paragraphs: a section heading ("IV. Signs of the times"), a sub-section ("ii. …"). */
const SECTION = /^(?:[IVXLC]{1,7}|\d{1,2})[.)]\s+\S/;
const SUBSECTION = /^(?:[ivxlc]{1,7}|[a-h])[.)]\s+\S/;
function plainHtml(text) {
 return text.split(/\n\s*\n/).filter(part => part.trim()).map(part => {
  const lines = part.split('\n');
  // Text copied from a web page sets a paragraph on each line; printed text wraps its lines.
  if (lines.length < 2 || !lines.some(line => line.trim().length > 240)) return `<p>${lines.map(escape).join('<br/>')}</p>`;
  const filled = lines.map(line => line.trim()).filter(Boolean);
  return filled.map((line, i) => {
   const between = [filled[i - 1], filled[i + 1]].every(near => near === undefined || near.length > 160);
   const heading = between && line.length <= 90 && wordsOf(line) <= 12 && !/[.,;:]$/.test(line);
   if (heading && SECTION.test(line)) return `<h2>${escape(line)}</h2>`;
   if (heading && SUBSECTION.test(line)) return `<h3>${escape(line)}</h3>`;
   return `<p>${escape(line)}</p>`;
  }).join('\n');
 }).join('\n');
}

function withoutPlainChrome(text) {
 const lines = text.replace(/\r\n?/g, '\n').split('\n');
 const drop = chromeUnits(lines);
 return drop.size ? lines.filter((_, i) => !drop.has(i)).join('\n') : text;
}

export function preview(source, format = 'auto', start = 0, end = 0) {
 const text = trimSource(source, start, end);
 if (!text.trim()) throw new Error('Paste some text to add.');
 if(format==='auto')format=detectFormat(text);
 if (format === 'html') return withoutHtmlChrome(sanitizeHtml(text));
 if (format === 'markdown') return withoutHtmlChrome(markdownHtml(text));
 return plainHtml(withoutPlainChrome(text));
}

const utf8 = new TextEncoder();
function crc32(bytes) { let crc = -1; for (const byte of bytes) { crc ^= byte; for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); } return (crc ^ -1) >>> 0; }
function zip(files) {
 const parts = [], centers = []; let offset = 0;
 for (const [name, content] of files) {
  const nameBytes = utf8.encode(name), data = utf8.encode(content), crc = crc32(data);
  const local = new Uint8Array(30 + nameBytes.length), lh = new DataView(local.buffer);
  lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x800, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, nameBytes.length, true); local.set(nameBytes, 30);
  const central = new Uint8Array(46 + nameBytes.length), ch = new DataView(central.buffer);
  ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x800, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, nameBytes.length, true); ch.setUint32(42, offset, true); central.set(nameBytes, 46);
  parts.push(local, data); centers.push(central); offset += local.length + data.length;
 }
 const size = centers.reduce((n, x) => n + x.length, 0), end = new Uint8Array(22), eh = new DataView(end.buffer);
 eh.setUint32(0, 0x06054b50, true); eh.setUint16(8, files.length, true); eh.setUint16(10, files.length, true); eh.setUint32(12, size, true); eh.setUint32(16, offset, true);
 const bytes = new Uint8Array(offset + size + end.length); let at = 0;
 for (const part of [...parts, ...centers, end]) { bytes.set(part, at); at += part.length; }
 return bytes;
}

/** The words of an HTML fragment, its blocks kept apart (a paragraph's last word never runs into the next). */
export function htmlText(html) {
 const template = document.createElement('template');
 template.innerHTML = String(html).replace(/<\/(?:p|div|h[1-6]|li|blockquote|pre|dt|dd|figcaption|td|th|caption)>|<br\s*\/?>/gi, '$& ');
 return (template.content.textContent || '').replace(/\s+/g, ' ').trim();
}
export const wordCount = html => (htmlText(html).match(/\S+/g) || []).length;

// A byline: two to four capitalised names or initials ("G. B. Rango", "By Mary Shelley"), nothing else on the line.
const BYLINE = /^(?:[Bb]y\s+)?((?:\p{Lu}[\p{L}'’-]*\.?|\p{Lu}\.)(?:\s+(?:(?:van|von|de|da|del|der|le|la|du)\s+)?(?:\p{Lu}[\p{L}'’-]*\.?|\p{Lu}\.)){1,3})$/u;
/**
 * A paste as the reader will see it in the text box and in the book (approved paste flow, 5 Nov 2026):
 * the cleaned HTML (preview: sanitised, the site's menus, counters and paywall lines left out), its
 * title (an opening heading or short first line, taken out of the text because it becomes the
 * heading), and a byline when one opens the text (it stays in the text). Rich clipboard HTML is
 * preferred; plain text is read as plain, Markdown or HTML as before.
 */
export function cleanPaste({html = '', plain = ''} = {}) {
 const rich = !!String(html).trim();
 const cleaned = rich ? preview(html, 'html') : preview(plain, 'auto');
 const template = document.createElement('template');
 template.innerHTML = cleaned;
 const blocks = () => [...template.content.querySelectorAll('p,div,h1,h2,h3,h4,h5,h6,blockquote,pre,li')].filter(el => !el.querySelector('p,div,h1,h2,h3,h4,h5,h6,blockquote,pre,li') && folded(el.textContent));
 let title = '';
 const first = blocks()[0];
 const short = text => text.length <= 140 && wordsOf(text) <= 18 && !/[.,;:]$/.test(text);
 const lines = el => el.innerHTML.split(/<br\s*\/?>/i);
 const lineText = part => { const t = document.createElement('template'); t.innerHTML = part; return folded(t.content.textContent); };
 if (first && /^h[1-3]$/.test(first.localName) && blocks().length > 1) {
  title = folded(first.textContent).slice(0, 200);
  let parent = first.parentElement; first.remove();
  while (parent && !folded(parent.textContent)) { const up = parent.parentElement; parent.remove(); parent = up; }
 } else if (first && !rich && first.localName === 'p') {
  // Plain text: a short opening line is its title ("Title\nBy line\n\nText…" or a line of its own).
  const parts = lines(first), head = lineText(parts[0]);
  if (head && short(head) && (parts.length > 1 || blocks().length > 1)) {
   title = head.slice(0, 200);
   if (parts.length > 1) first.innerHTML = parts.slice(1).join('<br/>').replace(/^\s+/, ''); else first.remove();
  }
 }
 if (!title) title = (rich ? suggestedTitle(html, 'html') : suggestedTitle(plain)) || '';
 let author = '';
 for (const el of blocks().slice(0, 2)) {
  if (/^h[1-6]$/.test(el.localName)) continue;
  const found = BYLINE.exec(lineText(lines(el)[0]));
  if (found && found[1].length <= 48) { author = found[1]; break; }
 }
 return {html: template.innerHTML.trim(), title, author};
}

export function pasteEpub({source, format = 'auto', title, author = '', start = 0, end = 0, uid = ''}) {
 title = String(title || suggestedTitle(source,format) || 'Pasted text').trim(); author = String(author || '').trim();
 if (!title) throw new Error('Give this text a title.');
 // XML 1.0 cannot carry these characters verbatim. Refuse instead of silently
 // changing a reader's text when UTF-8 encodes an unmatched surrogate as U+FFFD.
 if ([source,title,author].some(s=>/[\u0000-\u0008\u000b\u000c\u000e-\u001f\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(String(s)))) throw new Error('This text contains a character EPUB cannot preserve. Remove it and try again.');
 const body = preview(source, format, start, end);
 const x = value => escape(value);
 const chapter = `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${x(title)}</title></head><body><h1>${x(title)}</h1>${body}</body></html>`;
 const opf = `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">urn:uuid:${/^[0-9a-f-]{36}$/i.test(uid) ? uid : crypto.randomUUID()}</dc:identifier><dc:title>${x(title)}</dc:title><dc:creator>${x(author)}</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/></spine></package>`;
 const bytes = zip([['mimetype', 'application/epub+zip'], ['META-INF/container.xml', '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'], ['OEBPS/content.opf', opf], ['OEBPS/chapter.xhtml', chapter]]);
 const filename = (title.replace(/[\\/:*?"<>|\x00-\x1f]/g, '').slice(0, 100).trim() || 'Pasted text') + '.epub';
 return new File([bytes], filename, {type: 'application/epub+zip'});
}
