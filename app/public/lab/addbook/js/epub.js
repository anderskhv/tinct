// Reads an EPUB in the browser: a small ZIP reader on the platform's DecompressionStream,
// the package (OPF), the reading order (spine), the table of contents (EPUB 3 nav or
// EPUB 2 NCX) and each chapter's XHTML, rebuilt from an allow-list of elements. Nothing
// from the book runs: no scripts, styles, event handlers, forms or embedded frames.
// DRM-protected books are refused; font obfuscation (IDPF/Adobe) is allowed.
(function (global) {
  'use strict';

  const fail = (code, message) => Object.assign(new Error(message), { code });

  /* ---------- ZIP ---------- */
  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === 'undefined') throw fail('unsupported', 'This browser cannot open EPUB files. Try a current version of Chrome, Safari, Firefox or Edge.');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  function openZip(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    // End of central directory: scan back over a possible archive comment.
    let eocd = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
    if (eocd < 0) throw fail('not_zip', 'This file is not a valid EPUB (it is not a ZIP archive).');
    const count = view.getUint16(eocd + 10, true), cdOffset = view.getUint32(eocd + 16, true);
    if (cdOffset === 0xffffffff) throw fail('zip64', 'This EPUB is too large to open here.');
    const entries = new Map(), utf8 = new TextDecoder('utf-8'), latin1 = new TextDecoder('latin1');
    let p = cdOffset;
    for (let n = 0; n < count; n++) {
      if (p + 46 > bytes.length || view.getUint32(p, true) !== 0x02014b50) throw fail('bad_zip', 'This EPUB is damaged (its file list is unreadable).');
      const flags = view.getUint16(p + 8, true), method = view.getUint16(p + 10, true);
      const compSize = view.getUint32(p + 20, true), size = view.getUint32(p + 24, true);
      const nameLen = view.getUint16(p + 28, true), extraLen = view.getUint16(p + 30, true), commentLen = view.getUint16(p + 32, true);
      const local = view.getUint32(p + 42, true);
      const name = ((flags & 0x800) ? utf8 : latin1).decode(bytes.subarray(p + 46, p + 46 + nameLen));
      entries.set(name, { name, method, compSize, size, local, encrypted: !!(flags & 1) });
      p += 46 + nameLen + extraLen + commentLen;
    }
    async function read(name) {
      const e = entries.get(name);
      if (!e) return null;
      if (e.encrypted) throw fail('drm', 'This book is password-protected and cannot be opened.');
      if (view.getUint32(e.local, true) !== 0x04034b50) throw fail('bad_zip', 'This EPUB is damaged.');
      const start = e.local + 30 + view.getUint16(e.local + 26, true) + view.getUint16(e.local + 28, true);
      const data = bytes.subarray(start, start + e.compSize);
      if (e.method === 0) return data;
      if (e.method === 8) return inflateRaw(data);
      throw fail('bad_zip', 'This EPUB uses an unsupported compression method.');
    }
    const readText = async name => { const b = await read(name); return b ? utf8.decode(b) : null };
    return { entries, read, readText, has: name => entries.has(name) };
  }

  /* ---------- Paths ---------- */
  function resolve(base, href) {
    if (!href) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return href;
    const dir = base.includes('/') ? base.slice(0, base.lastIndexOf('/') + 1) : '';
    const parts = [];
    for (const seg of (href.startsWith('/') ? href.slice(1) : dir + href).split('/')) {
      if (seg === '..') parts.pop(); else if (seg !== '.' && seg !== '') parts.push(seg);
    }
    let out = parts.join('/');
    try { out = decodeURIComponent(out) } catch {}
    return out;
  }
  const splitHash = h => { const i = h.indexOf('#'); return i < 0 ? [h, ''] : [h.slice(0, i), h.slice(i + 1)] };
  const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp' };

  /* ---------- Package ---------- */
  const xml = text => {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw fail('bad_epub', 'This EPUB is damaged (its package file cannot be read).');
    return doc;
  };
  const byLocal = (root, name) => [...root.getElementsByTagName('*')].filter(el => el.localName === name);
  const textOf = (root, name) => (byLocal(root, name)[0]?.textContent || '').replace(/\s+/g, ' ').trim();

  const ALLOWED_ENCRYPTION = new Set(['http://www.idpf.org/2008/embedding', 'http://ns.adobe.com/pdf/enc#RC']);

  async function parse(buffer, opts = {}) {
    const zip = openZip(buffer);
    if (zip.has('META-INF/rights.xml')) throw fail('drm', 'This book is protected by DRM (copy protection), so it cannot be opened here. Books you buy from many stores are protected; DRM-free EPUBs open fine.');
    const enc = await zip.readText('META-INF/encryption.xml');
    if (enc) {
      const algos = byLocal(xml(enc), 'EncryptionMethod').map(m => m.getAttribute('Algorithm'));
      if (algos.some(a => !ALLOWED_ENCRYPTION.has(a))) throw fail('drm', 'This book is protected by DRM (copy protection), so it cannot be opened here. Books you buy from many stores are protected; DRM-free EPUBs open fine.');
    }
    const container = await zip.readText('META-INF/container.xml');
    if (!container) throw fail('bad_epub', 'This file is not an EPUB (it has no container file).');
    const opfPath = byLocal(xml(container), 'rootfile')[0]?.getAttribute('full-path');
    const opfText = opfPath && await zip.readText(opfPath);
    if (!opfText) throw fail('bad_epub', 'This EPUB is damaged (its package file is missing).');
    const opf = xml(opfText);
    const meta = byLocal(opf, 'metadata')[0] || opf;
    const title = textOf(meta, 'title') || opts.fallbackTitle || 'Untitled book';
    const authors = byLocal(meta, 'creator').map(c => c.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const language = textOf(meta, 'language') || '';
    const manifest = new Map();
    for (const item of byLocal(opf, 'item')) manifest.set(item.getAttribute('id'), { id: item.getAttribute('id'), href: resolve(opfPath, item.getAttribute('href') || ''), type: item.getAttribute('media-type') || '', props: (item.getAttribute('properties') || '').split(/\s+/) });
    const spineEl = byLocal(opf, 'spine')[0];
    const spine = byLocal(opf, 'itemref').map(r => manifest.get(r.getAttribute('idref'))).filter(it => it && /x?html/.test(it.type) && zip.has(it.href));
    if (!spine.length) throw fail('bad_epub', 'This EPUB has no readable chapters.');

    // Images become data: URLs (the page allows no blob: images), made once per file.
    const images = new Map();
    async function imageUrl(path) {
      if (images.has(path)) return images.get(path);
      const p = (async () => {
        const bytes = await zip.read(path).catch(() => null); if (!bytes) return '';
        const ext = path.split('.').pop().toLowerCase();
        const type = [...manifest.values()].find(m => m.href === path)?.type || MIME[ext] || 'application/octet-stream';
        if (!type.startsWith('image/') || bytes.length > 8_000_000) return '';
        let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        return 'data:' + type + ';base64,' + btoa(bin);
      })();
      images.set(path, p);
      return p;
    }

    const chapters = [];
    for (let i = 0; i < spine.length; i++) {
      const item = spine[i];
      const src = await zip.readText(item.href);
      chapters.push(await buildChapter(src, item.href, i, imageUrl, spine));
      opts.onProgress?.((i + 1) / spine.length);
    }
    const toc = await readToc(zip, manifest, spineEl, spine, chapters);
    let cover = '';
    const coverItem = [...manifest.values()].find(m => m.props.includes('cover-image')) || manifest.get(byLocal(meta, 'meta').find(m => m.getAttribute('name') === 'cover')?.getAttribute('content'));
    if (coverItem && coverItem.type.startsWith('image/')) cover = await imageUrl(coverItem.href);
    return { title, authors, language, chapters, toc, cover };
  }

  /* ---------- Contents ---------- */
  async function readToc(zip, manifest, spineEl, spine, chapters) {
    const chapterOf = path => spine.findIndex(s => s.href === path);
    const out = [];
    const navItem = [...manifest.values()].find(m => m.props.includes('nav'));
    if (navItem) {
      const navText = await zip.readText(navItem.href);
      if (navText) {
        const doc = new DOMParser().parseFromString(navText, 'application/xhtml+xml');
        const navs = byLocal(doc, 'nav');
        const nav = navs.find(n => (n.getAttribute('epub:type') || n.getAttributeNS('http://www.idpf.org/2007/ops', 'type') || '').includes('toc')) || navs[0];
        const walk = (ol, depth, parent) => {
          for (const li of [...ol.children].filter(c => c.localName === 'li')) {
            const a = [...li.children].find(c => c.localName === 'a' || c.localName === 'span');
            const sub = [...li.children].find(c => c.localName === 'ol');
            const [path, anchor] = splitHash(resolve(navItem.href, a?.getAttribute('href') || ''));
            const entry = { id: 'n' + out.length, label: (a?.textContent || '').replace(/\s+/g, ' ').trim(), page: chapterOf(path) + 1, anchor, depth, parent };
            if (entry.label) out.push(entry);
            if (sub && depth < 3) walk(sub, depth + 1, entry.label ? entry.id : parent);
          }
        };
        const ol = nav && [...nav.getElementsByTagName('*')].find(e => e.localName === 'ol');
        if (ol) walk(ol, 0, null);
      }
    }
    if (!out.length) {
      const ncxItem = manifest.get(spineEl?.getAttribute('toc')) || [...manifest.values()].find(m => m.type === 'application/x-dtbncx+xml');
      const ncxText = ncxItem && await zip.readText(ncxItem.href);
      if (ncxText) {
        const doc = xml(ncxText);
        const walk = (parentEl, depth, parent) => {
          for (const np of [...parentEl.children].filter(c => c.localName === 'navPoint')) {
            const label = textOf(byLocal(np, 'navLabel')[0] || np, 'text');
            const [path, anchor] = splitHash(resolve(ncxItem.href, byLocal(np, 'content')[0]?.getAttribute('src') || ''));
            const entry = { id: 'n' + out.length, label, page: chapterOf(path) + 1, anchor, depth, parent };
            if (label) out.push(entry);
            if (depth < 3) walk(np, depth + 1, label ? entry.id : parent);
          }
        };
        const map = byLocal(doc, 'navMap')[0];
        if (map) walk(map, 0, null);
      }
    }
    let entries = out.filter(e => e.page > 0);
    // Without a usable contents, every chapter gets an entry named by its first heading.
    if (entries.length < 2) entries = chapters.map((c, i) => ({ id: 's' + i, label: c.title || 'Section ' + (i + 1), page: i + 1, anchor: '', depth: 0, parent: null }));
    for (const e of entries) e.kind = entries.some(c => c.parent === e.id) ? 'part' : 'chapter';
    return entries;
  }

  /* ---------- Chapters: an allow-list rebuild ---------- */
  const BLOCK = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'br']);
  const INLINE = new Set(['span', 'em', 'i', 'strong', 'b', 'u', 's', 'sub', 'sup', 'small', 'cite', 'q', 'abbr', 'code', 'dfn', 'var', 'kbd', 'samp', 'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'a', 'img', 'del', 'ins']);
  const RENAME = { section: 'div', article: 'div', aside: 'div', header: 'div', footer: 'div', main: 'div', nav: 'div', center: 'div', big: 'span', font: 'span', tt: 'code', strike: 's', address: 'div', hgroup: 'div' };
  const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea', 'noscript', 'video', 'audio', 'canvas', 'template', 'link', 'meta', 'title', 'head', 'base', 'source', 'track', 'map', 'area', 'frame', 'frameset', 'applet', 'dialog', 'portal']);
  const MATH = new Set(['math', 'mi', 'mn', 'mo', 'ms', 'mrow', 'msup', 'msub', 'msubsup', 'mfrac', 'msqrt', 'mroot', 'mtext', 'mspace', 'mtable', 'mtr', 'mtd', 'munder', 'mover', 'munderover', 'mstyle', 'mpadded', 'menclose', 'mphantom', 'mfenced', 'mmultiscripts', 'mprescripts', 'none']);
  const MATHNS = 'http://www.w3.org/1998/Math/MathML';
  const XLINK = 'http://www.w3.org/1999/xlink';

  async function buildChapter(src, path, index, imageUrl, spine) {
    let doc = new DOMParser().parseFromString(src || '', 'application/xhtml+xml');
    if (doc.getElementsByTagName('parsererror').length) doc = new DOMParser().parseFromString(src || '', 'text/html');
    const body = byLocal(doc, 'body')[0] || doc.documentElement;
    const out = document.createElement('div');
    out.className = 'epub-body';
    const pending = [];
    const anchorId = id => 'c' + index + '-' + String(id).replace(/[^\w-]/g, '_');
    function attrsFor(src, el, name) {
      const id = src.getAttribute('id');
      if (id) el.id = anchorId(id);
      if (name === 'ol' && /^\d+$/.test(src.getAttribute('start') || '')) el.setAttribute('start', src.getAttribute('start'));
      if ((name === 'td' || name === 'th')) for (const a of ['colspan', 'rowspan']) if (/^\d{1,3}$/.test(src.getAttribute(a) || '')) el.setAttribute(a, src.getAttribute(a));
      if (name === 'abbr' && src.getAttribute('title')) el.title = src.getAttribute('title').slice(0, 200);
      const cls = (src.getAttribute('class') || '').toLowerCase(), style = (src.getAttribute('style') || '').toLowerCase();
      // Keep a few presentational intents that carry meaning in books.
      if (/center|centre/.test(cls) || /text-align:\s*center/.test(style)) el.classList.add('ep-center');
      if (/right/.test(cls) && /align|right/.test(cls) || /text-align:\s*right/.test(style)) el.classList.add('ep-right');
      if (/smallcaps|small-caps|sc\b/.test(cls) || /small-caps/.test(style)) el.classList.add('ep-sc');
      if (/italic/.test(cls) || /font-style:\s*italic/.test(style)) el.classList.add('ep-i');
      if (/\b(epigraph|poem|verse|stanza|line)\b/.test(cls)) el.classList.add('ep-verse');
      if (/\bfootnote|\bnote\b|endnote/.test(cls) || /(footnote|endnote|rearnote)/.test(src.getAttribute('epub:type') || '')) el.classList.add('ep-note');
    }
    function walk(src, parent) {
      for (const node of [...src.childNodes]) {
        if (node.nodeType === 3) { parent.appendChild(document.createTextNode(node.nodeValue)); continue }
        if (node.nodeType !== 1) continue;
        const name = node.localName.toLowerCase();
        if (DROP.has(name)) continue;
        if (node.namespaceURI === MATHNS || MATH.has(name)) { parent.appendChild(mathCopy(node)); continue }
        if (name === 'svg') { // a cover page: <svg><image xlink:href="..."/></svg>
          const image = byLocal(node, 'image')[0];
          const href = image && (image.getAttributeNS(XLINK, 'href') || image.getAttribute('href'));
          if (href) { const img = document.createElement('img'); img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; pending.push(imageUrl(resolve(path, href)).then(u => { if (u) img.src = u; else img.remove() })); parent.appendChild(img) }
          continue;
        }
        const tag = RENAME[name] || name;
        if (!BLOCK.has(tag) && !INLINE.has(tag)) { walk(node, parent); continue }
        const el = document.createElement(tag);
        attrsFor(node, el, tag);
        if (tag === 'img') {
          const href = node.getAttribute('src') || node.getAttributeNS(XLINK, 'href');
          el.alt = (node.getAttribute('alt') || '').slice(0, 500); el.loading = 'lazy'; el.decoding = 'async';
          if (href) pending.push(imageUrl(resolve(path, href)).then(u => { if (u) el.src = u; else el.remove() }));
          parent.appendChild(el); continue;
        }
        if (tag === 'a') {
          const href = node.getAttribute('href') || node.getAttributeNS(XLINK, 'href') || '';
          if (/^https?:\/\//i.test(href)) { el.href = href; el.target = '_blank'; el.rel = 'noopener noreferrer' }
          else if (href && !/^[a-z][a-z0-9+.-]*:/i.test(href)) {
            const [p, frag] = splitHash(href.startsWith('#') ? path + href : resolve(path, href));
            const target = spine.findIndex(s => s.href === p);
            if (target >= 0) { el.href = '#'; el.dataset.chapter = String(target); if (frag) el.dataset.anchor = 'c' + target + '-' + frag.replace(/[^\w-]/g, '_') }
          }
        }
        walk(node, el);
        parent.appendChild(el);
      }
    }
    function mathCopy(node) {
      const name = node.localName;
      if (name === 'semantics') { const first = [...node.children][0]; return first ? mathCopy(first) : document.createTextNode('') }
      if (!MATH.has(name)) return document.createTextNode(node.textContent || '');
      const el = document.createElementNS(MATHNS, name);
      for (const a of ['display', 'mathvariant', 'stretchy', 'fence', 'separator', 'accent', 'linethickness']) if (node.getAttribute(a) !== null) el.setAttribute(a, node.getAttribute(a).slice(0, 40));
      for (const c of node.childNodes) { if (c.nodeType === 3) el.appendChild(document.createTextNode(c.nodeValue)); else if (c.nodeType === 1) el.appendChild(mathCopy(c)) }
      return el;
    }
    walk(body, out);
    await Promise.all(pending);
    // Empty wrappers and stray whitespace-only blocks add nothing.
    for (const el of [...out.querySelectorAll('div, span, p')]) if (!el.children.length && !el.textContent.trim() && !el.querySelector('img')) el.remove();
    const heading = out.querySelector('h1, h2, h3');
    const text = out.textContent.replace(/\s+/g, ' ').trim();
    return { index, href: path, title: (heading?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140), node: out, text };
  }

  global.TinctEpub = { parse, openZip, resolve };
})(typeof window !== 'undefined' ? window : globalThis);
