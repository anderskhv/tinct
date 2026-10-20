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

  // The package: DRM refused, then the OPF and its title, authors and language.
  async function readPackage(zip, opts) {
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
    const spine = byLocal(opf, 'itemref').length;
    if (!spine) throw fail('bad_epub', 'This EPUB has no readable chapters.');
    return { opfPath, opf, meta, title, authors, language };
  }

  // Title, authors and language (the Tinct reader converts the book itself), and the
  // book's own cover as a JPEG data: URL for Your books and the library (empty when it
  // has none), with its width.
  async function metadata(buffer, opts = {}) {
    const zip = openZip(buffer);
    const { opfPath, opf, meta, title, authors, language } = await readPackage(zip, opts);
    let cover = { url: '', width: 0 };
    try { cover = await coverImage(zip, opfPath, opf, meta) } catch { cover = { url: '', width: 0 } }
    if (cover.url) cover.url = await trimmedImage(cover.url);
    return { title, authors, language, cover: cover.url, coverWidth: cover.width };
  }
  // The cover image (cover-image, else <meta name="cover">) at its own size, up to
  // COVER_MAX_WIDTH px wide: the library's reading table shows it large. Same rule as
  // the Tinct reader's (src/lab/userBook/userBookCover.ts).
  const COVER_MAX_WIDTH = 900;
  async function coverImage(zip, opfPath, opf, meta) {
    const items = byLocal(opf, 'item').map(item => ({ id: item.getAttribute('id'), href: resolve(opfPath, item.getAttribute('href') || ''), type: item.getAttribute('media-type') || '', props: (item.getAttribute('properties') || '').split(/\s+/) }));
    const coverId = byLocal(meta, 'meta').find(m => m.getAttribute('name') === 'cover')?.getAttribute('content');
    const item = items.find(i => i.props.includes('cover-image')) || items.find(i => i.id === coverId);
    const none = { url: '', width: 0 };
    if (!item || !/^image\/(png|jpeg|gif|webp)$/.test(item.type) || typeof createImageBitmap !== 'function') return none;
    const bytes = await zip.read(item.href);
    if (!bytes || bytes.length > 8000000) return none;
    const bmp = await createImageBitmap(new Blob([bytes], { type: item.type }));
    // Not a cover's shape (a long strip, a sliver): none.
    if (!bmp.width || !bmp.height || bmp.height > bmp.width * 3 || bmp.width > bmp.height * 2) { bmp.close?.(); return none }
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(COVER_MAX_WIDTH, bmp.width); canvas.height = Math.max(1, Math.round(canvas.width * bmp.height / bmp.width));
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close?.();
    return { url: canvas.toDataURL('image/jpeg', 0.88), width: canvas.width };
  }

  async function parse(buffer, opts = {}) {
    const zip = openZip(buffer);
    const { opfPath, opf, meta, title, authors, language } = await readPackage(zip, opts);
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

    // The book's own stylesheets, read for the few intents a reader keeps (small caps, capitals, centring, italics):
    // nothing of them is applied as CSS (bookStyles).
    const sheets = new Map();
    const sheetText = path => { if (!sheets.has(path)) sheets.set(path, zip.readText(path).catch(() => null).then(t => t || '')); return sheets.get(path) };
    const coverItem = [...manifest.values()].find(m => m.props.includes('cover-image')) || manifest.get(byLocal(meta, 'meta').find(m => m.getAttribute('name') === 'cover')?.getAttribute('content'));
    const chapters = [];
    for (let i = 0; i < spine.length; i++) {
      const item = spine[i];
      const src = await zip.readText(item.href);
      chapters.push(await buildChapter(src, item.href, i, imageUrl, spine, sheetText));
      opts.onProgress?.((i + 1) / spine.length);
    }
    const toc = await readToc(zip, manifest, spineEl, spine, chapters);
    const marks = await landmarks(zip, opf, manifest, spine);
    const start = classify(chapters, spine, marks, toc, coverItem);
    // A cover with a black strip down one side (a print cover's bleed; Anders's "Bold Conjectures", 20 Oct 2026): trimmed.
    let cover = '';
    if (coverItem && coverItem.type.startsWith('image/')) cover = await trimmedImage(await imageUrl(coverItem.href));
    for (const c of chapters) if (c.role === 'cover') for (const img of c.node.querySelectorAll('img')) { if (img.src) img.src = await trimmedImage(img.src) }
    // The book's own contents page is not in Tinct's chapter menu (the menu does its job).
    const shown = toc.filter(e => chapters[e.page - 1]?.role !== 'toc');
    return { title, authors, language, chapters, toc: shown.length >= 2 ? shown : toc, cover, start };
  }

  /* ---------- What each spine file is: cover, front matter, the book's own contents, or the text ----------
     From the EPUB's own words first (EPUB 3 nav landmarks, the EPUB 2 guide, the nav document in the spine, a file's
     epub:type, a non-linear itemref), then its shape: before the first section that opens on a heading and runs on
     in prose, short files with no such text are front matter; a file that is mostly links into the book is a
     contents page. `start`: the first section of the text (0-based), where a first open begins (Anders, 20 Oct 2026). */
  const FRONT_TYPES = /^(?:cover|titlepage|halftitlepage|half-title|title-page|copyright-page|copyright|dedication|epigraph|frontispiece|imprint|imprimatur|colophon|seriespage|other-credits|contributors|acknowledgments|errata)$/;
  const TOC_TYPES = /^(?:toc|contents|loi|lot|landmarks)$/;
  async function landmarks(zip, opf, manifest, spine) {
    const out = new Map(); // spine path -> type
    const put = (path, type) => { if (path && type && !out.has(path)) out.set(path, String(type).toLowerCase().replace(/^.*:/, '')) };
    const navItem = [...manifest.values()].find(m => m.props.includes('nav'));
    if (navItem) {
      put(navItem.href, 'toc');
      const text = await zip.readText(navItem.href).catch(() => null);
      if (text) {
        const doc = new DOMParser().parseFromString(text, 'application/xhtml+xml');
        for (const nav of byLocal(doc, 'nav')) {
          const t = nav.getAttribute('epub:type') || nav.getAttributeNS('http://www.idpf.org/2007/ops', 'type') || '';
          if (!/landmarks/.test(t)) continue;
          for (const a of byLocal(nav, 'a')) put(splitHash(resolve(navItem.href, a.getAttribute('href') || ''))[0], (a.getAttribute('epub:type') || a.getAttributeNS('http://www.idpf.org/2007/ops', 'type') || '').split(/\s+/)[0]);
        }
      }
    }
    for (const ref of byLocal(opf, 'reference')) {
      const type = (ref.getAttribute('type') || '').toLowerCase(), href = ref.getAttribute('href') || '';
      const path = [...manifest.values()].find(m => m.href.endsWith(splitHash(href)[0].replace(/^(\.\.\/)+/, '')))?.href;
      put(path, { 'title-page': 'titlepage', 'copyright-page': 'copyright-page', text: 'bodymatter' }[type] || type);
    }
    return out;
  }
  function classify(chapters, spine, marks, toc, coverItem) {
    const kindOf = c => marks.get(spine[c.index].href) || c.type || '';
    const linkShare = c => {
      const links = [...c.node.querySelectorAll('a[data-chapter]')];
      const words = links.reduce((n, a) => n + a.textContent.trim().length, 0);
      return links.length >= 3 ? words / Math.max(1, c.text.length) : 0;
    };
    const coverSrc = coverItem?.href || '';
    for (const c of chapters) {
      const k = kindOf(c);
      if (TOC_TYPES.test(k) || (linkShare(c) >= 0.45 && c.text.length < 8000)) c.role = 'toc';
      else if (k === 'cover' || (c.index === 0 && c.images > 0 && c.text.length < 40) || (coverSrc && c.coverRef === coverSrc && c.text.length < 40)) c.role = 'cover';
    }
    // The first section of the text: a file that opens on a heading and runs on in prose (or the bodymatter landmark,
    // when it comes earlier), never a cover, a contents page or a file the book calls front matter.
    const prose = c => !c.role && !FRONT_TYPES.test(kindOf(c)) && c.headed && c.text.length >= 600;
    let start = chapters.findIndex(prose);
    const body = chapters.findIndex(c => kindOf(c) === 'bodymatter' && !c.role);
    if (body >= 0 && (start < 0 || body < start)) start = body;
    if (start < 0) start = chapters.findIndex(c => !c.role && c.text.length >= 600);
    if (start < 0) start = Math.max(0, chapters.findIndex(c => !c.role));
    for (const c of chapters) {
      if (c.role) continue;
      if (FRONT_TYPES.test(kindOf(c)) && c.index < start + 1 && c.text.length < 3000) c.role = 'front';
      else if (c.index < start && c.text.length < 1500) c.role = 'front';
      else c.role = 'text';
    }
    if (chapters[start]?.role !== 'text') start = Math.max(0, chapters.findIndex(c => c.role === 'text'));
    return start;
  }
  /** A cover picture without a dark (or empty) strip down one of its sides: the trimmed picture's data: URL, or the same URL. */
  async function trimmedImage(url) {
    if (!url || typeof createImageBitmap !== 'function' || typeof document === 'undefined') return url;
    try {
      const blob = await (await fetch(url)).blob();
      const bmp = await createImageBitmap(blob);
      const w = bmp.width, h = bmp.height;
      const scale = Math.min(1, 400 / Math.max(w, h)), sw = Math.max(1, Math.round(w * scale)), sh = Math.max(1, Math.round(h * scale));
      const probe = document.createElement('canvas'); probe.width = sw; probe.height = sh;
      const g = probe.getContext('2d', { willReadFrequently: true }); g.drawImage(bmp, 0, 0, sw, sh);
      const px = g.getImageData(0, 0, sw, sh).data;
      const dark = (x, y) => { const o = (y * sw + x) * 4; return px[o + 3] < 16 || Math.max(px[o], px[o + 1], px[o + 2]) < 22 };
      const colDark = x => { let n = 0; for (let y = 0; y < sh; y++) if (dark(x, y)) n++; return n >= sh * 0.97 };
      const rowDark = y => { let n = 0; for (let x = 0; x < sw; x++) if (dark(x, y)) n++; return n >= sw * 0.97 };
      const run = (count, test) => { let k = 0; while (k < count && test(k)) k++; return k };
      const L = run(sw, x => colDark(x)), R = run(sw, x => colDark(sw - 1 - x)), T = run(sh, y => rowDark(y)), B = run(sh, y => rowDark(sh - 1 - y));
      // Only a strip on one side (a black cover is black all round): at least 2% and at most a quarter of the side.
      const strip = (a, b, size) => (a >= size * 0.02 && a <= size * 0.25 && b < a / 3 ? a : 0);
      const cut = { l: strip(L, R, sw), r: strip(R, L, sw), t: strip(T, B, sh), b: strip(B, T, sh) };
      if (!cut.l && !cut.r && !cut.t && !cut.b) { bmp.close?.(); return url }
      const x0 = Math.round((cut.l + (cut.l ? 1 : 0)) / scale), y0 = Math.round((cut.t + (cut.t ? 1 : 0)) / scale);
      const x1 = w - Math.round((cut.r + (cut.r ? 1 : 0)) / scale), y1 = h - Math.round((cut.b + (cut.b ? 1 : 0)) / scale);
      const out = document.createElement('canvas'); out.width = Math.max(1, x1 - x0); out.height = Math.max(1, y1 - y0);
      out.getContext('2d').drawImage(bmp, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
      bmp.close?.();
      return out.toDataURL(/^data:image\/png/.test(url) ? 'image/png' : 'image/jpeg', 0.9);
    } catch { return url }
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

  /* The book's styles, read (never applied): for each class (or tag.class, or tag) the intents kept, from rules whose
     selector ends in it. -> Map(key -> { sc, asc, upper, lower, center, right, italic }) */
  function bookStyles(css) {
    const out = new Map();
    const text = String(css || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/@media[^{]*\{([\s\S]*?\})\s*\}/g, '$1');
    for (const m of text.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
      const d = m[2].toLowerCase(), flags = {};
      const variant = /font-variant(?:-caps)?\s*:\s*([^;]+)/.exec(d)?.[1] || '';
      if (/all-small-caps/.test(variant)) flags.asc = true; else if (/small-caps/.test(variant)) flags.sc = true;
      const transform = /text-transform\s*:\s*([a-z-]+)/.exec(d)?.[1];
      if (transform === 'uppercase') flags.upper = true; else if (transform === 'lowercase') flags.lower = true;
      const align = /text-align\s*:\s*([a-z-]+)/.exec(d)?.[1];
      if (align === 'center') flags.center = true; else if (align === 'right') flags.right = true;
      if (/font-style\s*:\s*italic/.test(d)) flags.italic = true;
      if (!Object.keys(flags).length) continue;
      for (const sel of m[1].split(',')) {
        const last = sel.trim().split(/[\s>+~]+/).pop() || '';
        const k = /^([a-z0-9]*)((?:\.[\w-]+)+)$/i.exec(last), t = /^([a-z][a-z0-9]*)$/i.exec(last);
        const keys = k ? k[2].slice(1).split('.').map(c => (k[1] ? k[1].toLowerCase() + '.' : '.') + c.toLowerCase()) : t ? [t[1].toLowerCase()] : [];
        for (const key of keys) out.set(key, { ...(out.get(key) || {}), ...flags });
      }
    }
    return out;
  }

  async function buildChapter(src, path, index, imageUrl, spine, sheetText = null) {
    let doc = new DOMParser().parseFromString(src || '', 'application/xhtml+xml');
    if (doc.getElementsByTagName('parsererror').length) doc = new DOMParser().parseFromString(src || '', 'text/html');
    const body = byLocal(doc, 'body')[0] || doc.documentElement;
    // The book's own styles for this file: its linked stylesheets, then its <style> blocks.
    let css = '';
    if (sheetText) for (const link of byLocal(doc, 'link')) if (/stylesheet/i.test(link.getAttribute('rel') || '') && link.getAttribute('href')) css += '\n' + await sheetText(resolve(path, link.getAttribute('href')));
    for (const st of byLocal(doc, 'style')) css += '\n' + (st.textContent || '');
    const styles = bookStyles(css);
    const OPS = 'http://www.idpf.org/2007/ops';
    const typeOf = el => (el?.getAttribute?.('epub:type') || el?.getAttributeNS?.(OPS, 'type') || '').toLowerCase();
    const fileType = (typeOf(body) || typeOf([...body.children].find(c => typeOf(c))) || '').split(/\s+/).map(t => t.replace(/^.*:/, '')).find(Boolean) || '';
    const out = document.createElement('div');
    out.className = 'epub-body';
    const pending = [], covers = [];
    const anchorId = id => 'c' + index + '-' + String(id).replace(/[^\w-]/g, '_');
    function attrsFor(src, el, name) {
      const id = src.getAttribute('id');
      if (id) el.id = anchorId(id);
      if (name === 'ol' && /^\d+$/.test(src.getAttribute('start') || '')) el.setAttribute('start', src.getAttribute('start'));
      if ((name === 'td' || name === 'th')) for (const a of ['colspan', 'rowspan']) if (/^\d{1,3}$/.test(src.getAttribute(a) || '')) el.setAttribute(a, src.getAttribute(a));
      if (name === 'abbr' && src.getAttribute('title')) el.title = src.getAttribute('title').slice(0, 200);
      const cls = (src.getAttribute('class') || '').toLowerCase(), style = (src.getAttribute('style') || '').toLowerCase();
      // The book's stylesheet's intents for this element (bookStyles), then its own style attribute's.
      const f = {};
      for (const key of [src.localName.toLowerCase(), ...cls.split(/\s+/).filter(Boolean).flatMap(c => ['.' + c, src.localName.toLowerCase() + '.' + c])]) Object.assign(f, styles.get(key) || {});
      Object.assign(f, bookStyles(`x{${style}}`).get('x') || {});
      // Keep a few presentational intents that carry meaning in books.
      if (/center|centre/.test(cls) || f.center) el.classList.add('ep-center');
      if (/right/.test(cls) && /align|right/.test(cls) || f.right) el.classList.add('ep-right');
      // Small caps as the book sets them (Anders, 20 Oct 2026: "BOLD CONJECTURES" in full capitals on one page, small
      // capitals on the next): font-variant small-caps, or all-small-caps (capitals typed in small caps read as small
      // capitals too, never as full ones); capitals by text-transform only where the book does not set small caps.
      const sc = f.sc || f.asc || /smallcaps|small-caps|sc\b/.test(cls);
      if (sc) {
        const letters = (src.textContent || '').replace(/[^\p{L}]/gu, '');
        el.classList.add(f.asc || (letters.length >= 2 && letters === letters.toUpperCase() && letters !== letters.toLowerCase()) ? 'ep-asc' : 'ep-sc');
      } else if (f.upper) el.classList.add('ep-upper');
      if (/italic/.test(cls) || f.italic) el.classList.add('ep-i');
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
          if (href) covers.push(resolve(path, href));
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
          if (href) covers.push(resolve(path, href));
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
    // Opens on a heading: the first block with words is a heading (a section of the text, not a title page).
    const firstBlock = [...out.querySelectorAll('h1, h2, h3, h4, p, li, blockquote, div')].find(el => el.textContent.trim() && !el.querySelector('p, h1, h2, h3, h4, li, div'));
    const headed = !!firstBlock && /^H[1-4]$/.test(firstBlock.tagName);
    const images = out.querySelectorAll('img').length;
    const coverRef = covers[0] || '';
    return { index, href: path, title: (heading?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140), node: out, text, type: fileType, headed, images, coverRef };
  }

  global.TinctEpub = { parse, metadata, openZip, resolve, bookStyles, trimmedImage };
})(typeof window !== 'undefined' ? window : globalThis);
