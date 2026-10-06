// Writes a small EPUB (stored ZIP, no dependencies) for tests: optional DRM marker and a
// chapter with markup the reader must strip; and a book with pictures (makeFigureEpub).
import { crc32, deflateSync } from 'node:zlib';

export function zip(files) {
  const enc = new TextEncoder(), locals = [], centrals = [];
  let offset = 0;
  for (const [name, content] of files) {
    const data = typeof content === 'string' ? enc.encode(content) : content, nameB = enc.encode(name);
    const crc = crc32(data) >>> 0;
    const local = Buffer.alloc(30 + nameB.length);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6); local.writeUInt16LE(0, 8);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(nameB.length, 26);
    Buffer.from(nameB).copy(local, 30);
    const central = Buffer.alloc(46 + nameB.length);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(nameB.length, 28);
    central.writeUInt32LE(offset, 42); Buffer.from(nameB).copy(central, 46);
    locals.push(local, Buffer.from(data)); centrals.push(central);
    offset += local.length + data.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

export function makeEpub({ title = 'Test Book', drm = false } = {}) {
  const files = [
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">test</dc:identifier><dc:title>${title}</dc:title><dc:creator>Test Author</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="c2.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>`],
    ['OEBPS/nav.xhtml', '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="c1.xhtml">One</a></li><li><a href="c2.xhtml#s2">Two</a></li></ol></nav></body></html>'],
    ['OEBPS/c1.xhtml', '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><style>p{color:red}</style><script>window.__pwned=1</script></head><body><h1>One</h1><p onclick="window.__pwned=2">First chapter <a href="c2.xhtml#s2">link</a> <img src="x.png" onerror="window.__pwned=3"/></p><iframe src="https://example.com"></iframe></body></html>'],
    ['OEBPS/c2.xhtml', '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body><h1 id="s2">Two</h1><p>Second chapter.</p><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>x</mi><mo>=</mo><mn>2</mn></math></body></html>'],
  ];
  if (drm) files.push(['META-INF/encryption.xml', '<?xml version="1.0"?><encryption xmlns="urn:oasis:names:tc:opendocument:xmlns:container" xmlns:enc="http://www.w3.org/2001/04/xmlenc#"><enc:EncryptedData><enc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes128-cbc"/><enc:CipherData><enc:CipherReference URI="OEBPS/c1.xhtml"/></enc:CipherData></enc:EncryptedData></encryption>']);
  return zip(files);
}

// A real PNG (RGB, no dependencies): a tinted ground with diagonal bands and a frame, so a
// picture is visibly a picture in screenshots. Synthetic: nothing here comes from a book.
export function png(width, height, [r, g, b] = [96, 120, 150]) {
  const row = width * 3 + 1, raw = Buffer.alloc(row * height);
  for (let y = 0; y < height; y++) {
    raw[y * row] = 0;
    for (let x = 0; x < width; x++) {
      const band = ((x + y) >> 5) & 1, edge = x < 6 || y < 6 || x >= width - 6 || y >= height - 6;
      const k = edge ? 0.35 : band ? 1 : 0.8, o = y * row + 1 + x * 3;
      raw[o] = r * k; raw[o + 1] = g * k; raw[o + 2] = b * k;
    }
  }
  const chunk = (type, data) => {
    const head = Buffer.alloc(8); head.writeUInt32BE(data.length, 0); head.write(type, 4, 'ascii');
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])) >>> 0, 0);
    return Buffer.concat([head, data, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// A book with every kind of picture the reader handles (invented text):
//   cover          the cover image (cover-image), shown by Add a book, never a chapter or a figure
//   inline         <figure> with <figcaption>, landscape: drawn inline, caption beneath
//   tall           portrait: on a phone it would take more than 45% of the page, so a strip
//   large          a detailed plate (1800x1000): always a strip
//   in a sentence  <img> inside a paragraph: stands after that paragraph
//   class caption  <img> then <p class="caption">
//   svg            an SVG drawing set in the page
//   decoration     an ornament (by name) and a tiny icon: left out
export function makeFigureEpub({ title = 'Lanterns Illustrated' } = {}) {
  const para = n => `<p>Paragraph ${n}. The lantern-maker kept a ledger of every lamp he sold, and of every evening it had lit: the wedding in the square, the long vigil at the harbour, the winter the canal froze and the skaters needed light until midnight. Customers came back to tell him how their lamps had fared, and he wrote it all down in a careful hand.</p>`;
  const paras = (from, n) => Array.from({ length: n }, (_, i) => para(from + i)).join('');
  const x = body => `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>x</title></head><body><section epub:type="chapter">${body}</section></body></html>`;
  const docs = [
    ['cover', '<section epub:type="cover"><img src="images/cover.png" alt="Cover"/></section>'],
    ['c1', `<h1>The Workshop</h1>${paras(1, 2)}<figure><img src="images/bench.png" alt="A workbench"/><figcaption>The workbench, with lamps in every stage of making.</figcaption></figure>${paras(3, 2)}<p class="orn"><img src="images/ornament.png" alt=""/></p><p>A small mark <img src="images/icon.png" alt="lamp icon"/> sat on every label, and the lamps were sorted <img src="images/shelf.png" alt="The shelf"/> by size before they were sold.</p>${paras(5, 3)}`],
    ['c2', `<h1>The Ledger</h1>${paras(8, 3)}<figure><img src="images/tall.png" alt="A tall lamp-post"/><figcaption>A lamp-post on the quay, drawn to scale.</figcaption></figure>${paras(11, 2)}<div class="figcenter"><img src="images/plate.png" alt="Map"/><p class="caption">Plate I. A map of the harbour and every lamp on it.</p></div>${paras(13, 3)}`],
    ['c3', `<h1>The Shape of a Flame</h1>${paras(16, 2)}<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect x="10" y="10" width="380" height="280" fill="#f3e3b5" stroke="#5a4a2a" stroke-width="4"/><path d="M200 250 C120 180 170 110 200 40 C230 110 280 180 200 250 Z" fill="#d98b2b"/></svg><p class="caption">The shape of a flame, drawn from life.</p>${paras(18, 4)}`],
  ];
  const images = [
    ['cover', png(600, 900, [140, 90, 60])],
    ['bench', png(800, 500, [90, 120, 160])],
    ['ornament', png(300, 40, [80, 80, 80])],
    ['icon', png(40, 40, [80, 80, 80])],
    ['shelf', png(400, 300, [110, 140, 90])],
    ['tall', png(600, 1000, [150, 110, 140])],
    ['plate', png(1800, 1000, [70, 110, 120])],
  ];
  const nav = `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="cover.xhtml">Cover</a></li><li><a href="c1.xhtml">The Workshop</a></li><li><a href="c2.xhtml">The Ledger</a></li><li><a href="c3.xhtml">The Shape of a Flame</a></li></ol></nav></body></html>`;
  const files = [
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">figures</dc:identifier><dc:title>${title}</dc:title><dc:creator>Ada Lampwright</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${docs.map(([id]) => `<item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`).join('')}${images.map(([id]) => `<item id="img-${id}" href="images/${id}.png" media-type="image/png"${id === 'cover' ? ' properties="cover-image"' : ''}/>`).join('')}</manifest><spine>${docs.map(([id]) => `<itemref idref="${id}"/>`).join('')}</spine></package>`],
    ['OEBPS/nav.xhtml', nav],
    ...docs.map(([id, body]) => [`OEBPS/${id}.xhtml`, x(body)]),
    ...images.map(([id, bytes]) => [`OEBPS/images/${id}.png`, bytes]),
  ];
  return zip(files);
}
