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
 if(/^(?:#{1,6}\s+|\s*[-+*]\s+|\s*\d+[.)]\s+|\s*>\s+|\s*`{3,}|\s*~{3,})/m.test(first))return 'markdown';
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

export function preview(source, format = 'auto', start = 0, end = 0) {
 const text = trimSource(source, start, end);
 if (!text.trim()) throw new Error('Paste some text to add.');
 if(format==='auto')format=detectFormat(text);
 if (format === 'html') return sanitizeHtml(text);
 if (format === 'markdown') return markdownHtml(text);
 return text.replace(/\r\n?/g, '\n').split(/\n\s*\n/).map(part => `<p>${part.split('\n').map(escape).join('<br/>')}</p>`).join('\n');
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

export function pasteEpub({source, format = 'auto', title, author = '', start = 0, end = 0}) {
 title = String(title || suggestedTitle(source,format) || 'Pasted text').trim(); author = String(author || '').trim();
 if (!title) throw new Error('Give this text a title.');
 // XML 1.0 cannot carry these characters verbatim. Refuse instead of silently
 // changing a reader's text when UTF-8 encodes an unmatched surrogate as U+FFFD.
 if ([source,title,author].some(s=>/[\u0000-\u0008\u000b\u000c\u000e-\u001f\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(String(s)))) throw new Error('This text contains a character EPUB cannot preserve. Remove it and try again.');
 const body = preview(source, format, start, end);
 const x = value => escape(value);
 const chapter = `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${x(title)}</title></head><body><h1>${x(title)}</h1>${body}</body></html>`;
 const opf = `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">urn:uuid:${crypto.randomUUID()}</dc:identifier><dc:title>${x(title)}</dc:title><dc:creator>${x(author)}</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/></spine></package>`;
 const bytes = zip([['mimetype', 'application/epub+zip'], ['META-INF/container.xml', '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'], ['OEBPS/content.opf', opf], ['OEBPS/chapter.xhtml', chapter]]);
 const filename = (title.replace(/[\\/:*?"<>|\x00-\x1f]/g, '').slice(0, 100).trim() || 'Pasted text') + '.epub';
 return new File([bytes], filename, {type: 'application/epub+zip'});
}
