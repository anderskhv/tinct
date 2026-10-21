// Writes a small EPUB (stored ZIP, no dependencies) for tests: optional DRM marker and a
// chapter with markup the reader must strip; and a book with pictures (makeFigureEpub).
import { crc32, deflateSync, deflateRawSync } from 'node:zlib';

// Entries are [name, content] or [name, content, { deflate, utf8 }]: `deflate` compresses the
// entry (method 8); `utf8: false` leaves the UTF-8 name flag unset (as many zip tools do,
// even for names written in UTF-8).
export function zip(files) {
  const enc = new TextEncoder(), locals = [], centrals = [];
  let offset = 0;
  for (const [name, content, opts = {}] of files) {
    const raw = typeof content === 'string' ? enc.encode(content) : content, nameB = enc.encode(name);
    const method = opts.deflate ? 8 : 0, flag = opts.utf8 === false ? 0 : 0x800;
    const data = method ? deflateRawSync(raw) : raw;
    const crc = crc32(raw) >>> 0;
    const local = Buffer.alloc(30 + nameB.length);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(flag, 6); local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(raw.length, 22); local.writeUInt16LE(nameB.length, 26);
    Buffer.from(nameB).copy(local, 30);
    const central = Buffer.alloc(46 + nameB.length);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(flag, 8); central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(raw.length, 24); central.writeUInt16LE(nameB.length, 28);
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
const JPEG_240x150 = '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';
const WEBP_240x150 = 'UklGRjAFAABXRUJQVlA4WAoAAAAgAAAA7wAAlQAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggQgMAADAdAJ0BKvAAlgA+tVCkS6cko6Gmsxxo4BaJY27hbnDPIbrx99QZfSVtwOeAfRn0DKB4M6VxoEMJ/Adl6QhjR2hTOpwDm1UgmnYZglu83x5nZL/hIT7Dsf/I4L//Mvz7ZQU074FtT/AwenGKuDVZk7rORqccDj3H4PSKIGQGRJ7LMKj6Wu5VQbWyzs9XSOu0d2eGncOwbpm4U6cPP2ShrA/eZOln/X9trfLcdDxF/l4/XczOUdirGOwj4PyqP8tJ2JPQy51i9F5v+CVXCKpnljiNGjs/nNTgHNqvESXMgf1rK7O0Azc2e47Ex/CSToA6dAz8AOd/e2BIFJ8YNg/sVzmxirwCXDEVgr1ee6bVzTyhbIkMPnv2JbtAA471GDE774Sw4icnmqdTKkWwqiKep01HxbvH8Lm8AB4N8GA+pA2EXwWzt5Kr9IukDKWV0mRQypjzD9vju/mFVQsQvO/4ocgxDL0iwSPbLciJOYxg4i5CD38wy77G23lI9XOO1N0V3kzJzch6tznqVxKIgHKhbGWYi5KQoZRpOlFS1dpX+WjmFj6no2iKYQg7hTV/3MT/wBfcr+yTptYRe8e/Ix7QNRLpNK5QrhI/AASWomUE4i1Zh6thKv7Lr6ShBk6RJqd76cFg+dmF1OCEjOXd94sVIhEv+3EleIy9nwu3tBOpfo3Us0E3GxiBF07+363fXoIwtcbuYLNCNg8p5oXMXS7Qe1r2LeGGraeZul4jWVy3D6ENgHqIf7i6VZG95JdTDDpc+Lr7gwDTzL1cd4aLjeLSmZzcQmU5TXOLoVKZhHdB+JsdqxVbv2Pu9GiWYVQvjLgjfxXfCQdIqZOaGcsb4UwyhdysJSmTko0eeB39/Q+OQpx1Z+7l/FMiy83XAZoOmQyAa4FetTmi8fh/Zbb4KIfvuIjq/7TxVSzmF7kGnhsd45SyL11t823lkQr7Q+JRL9pZsTeD+8LDK6SVGUCWNcbtfff2wZLoIsZStJwqY0E2qwkaVA+QtxTQcND8gAAgTp4mfP7F4Lb10+EqI1f0J21Dt6Nqn7k9lTRaOjfrb6vZFfxUdp2xMEPGtIYwLxFe3T958vLoGfQc9/HnHZ56DE4zBNgAAA==';
// (Above: two small synthetic pictures, 240x150, drawn on a canvas and saved as JPEG and WebP.)

// The same banded picture as png(), as other formats a book may carry. Synthetic.
function pixels(width, height, [r, g, b]) {
  const out = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const band = ((x + y) >> 4) & 1, edge = x < 4 || y < 4 || x >= width - 4 || y >= height - 4;
    const k = edge ? 0.35 : band ? 1 : 0.75, o = (y * width + x) * 3;
    out[o] = r * k; out[o + 1] = g * k; out[o + 2] = b * k;
  }
  return out;
}
// 24-bit BMP, bottom-up rows padded to 4 bytes.
export function bmp(width, height, colour = [120, 90, 150]) {
  const rgb = pixels(width, height, colour), row = Math.ceil(width * 3 / 4) * 4, size = 54 + row * height;
  const out = Buffer.alloc(size);
  out.write('BM', 0, 'ascii'); out.writeUInt32LE(size, 2); out.writeUInt32LE(54, 10); out.writeUInt32LE(40, 14);
  out.writeInt32LE(width, 18); out.writeInt32LE(height, 22); out.writeUInt16LE(1, 26); out.writeUInt16LE(24, 28); out.writeUInt32LE(row * height, 34);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = ((height - 1 - y) * width + x) * 3, o = 54 + y * row + x * 3;
    out[o] = rgb[i + 2]; out[o + 1] = rgb[i + 1]; out[o + 2] = rgb[i];
  }
  return out;
}
// Baseline TIFF: little-endian, RGB, uncompressed, one strip.
export function tiff(width, height, colour = [90, 140, 110]) {
  const rgb = pixels(width, height, colour), tags = [[256, 3, 1, width], [257, 3, 1, height], [258, 3, 3, 0], [259, 3, 1, 1], [262, 3, 1, 2], [273, 4, 1, 0], [277, 3, 1, 3], [278, 3, 1, height], [279, 4, 1, rgb.length], [284, 3, 1, 1]];
  const ifd = 8, bps = ifd + 2 + tags.length * 12 + 4, data = bps + 6;
  const out = Buffer.alloc(data + rgb.length);
  out.write('II', 0, 'ascii'); out.writeUInt16LE(42, 2); out.writeUInt32LE(ifd, 4); out.writeUInt16LE(tags.length, ifd);
  tags.forEach(([tag, kind, count, value], n) => {
    const at = ifd + 2 + n * 12;
    out.writeUInt16LE(tag, at); out.writeUInt16LE(kind, at + 2); out.writeUInt32LE(count, at + 4);
    const v = tag === 258 ? bps : tag === 273 ? data : value;
    if (kind === 3 && count === 1) out.writeUInt16LE(v, at + 8); else out.writeUInt32LE(v, at + 8);
  });
  out.writeUInt16LE(8, bps); out.writeUInt16LE(8, bps + 2); out.writeUInt16LE(8, bps + 4);
  rgb.copy(out, data);
  return out;
}
// GIF with a 128-colour palette, written without compression: a clear code every
// 120 pixels keeps every code 8 bits wide, which any decoder reads.
export function gif(width, height, colour = [170, 120, 60]) {
  const rgb = pixels(width, height, colour), palette = Buffer.alloc(128 * 3), index = new Map(), px = [];
  for (let i = 0; i < rgb.length; i += 3) {
    const key = (rgb[i] >> 4) << 8 | (rgb[i + 1] >> 4) << 4 | rgb[i + 2] >> 4;
    if (!index.has(key) && index.size < 128) { palette[index.size * 3] = rgb[i]; palette[index.size * 3 + 1] = rgb[i + 1]; palette[index.size * 3 + 2] = rgb[i + 2]; index.set(key, index.size) }
    px.push(index.get(key) ?? 0);
  }
  const codes = [];
  for (let i = 0; i < px.length; i++) { if (i % 120 === 0) codes.push(128); codes.push(px[i]) }
  codes.push(129);
  const lzw = Buffer.from(codes), blocks = [];
  for (let i = 0; i < lzw.length; i += 255) { const part = lzw.subarray(i, i + 255); blocks.push(Buffer.from([part.length]), part) }
  const head = Buffer.alloc(13); head.write('GIF89a', 0, 'ascii'); head.writeUInt16LE(width, 6); head.writeUInt16LE(height, 8); head[10] = 0xf6;
  const image = Buffer.alloc(10); image[0] = 0x2c; image.writeUInt16LE(width, 5); image.writeUInt16LE(height, 7);
  return Buffer.concat([head, palette, image, Buffer.from([7]), ...blocks, Buffer.from([0, 0x3b])]);
}
export const jpeg = () => Buffer.from(JPEG_240x150, 'base64');
export const webp = () => Buffer.from(WEBP_240x150, 'base64');

// A book laid out the way commercial EPUBs often are (invented text, synthetic pictures):
// chapters in Text/, pictures in a sibling Images/ folder referenced as ../Images/…, and
// every way a picture's reference or file can go astray. Each picture has a caption
// "Figure N: …" naming what it tests, in reading order:
//   1  a file name with spaces, referenced URL-encoded (%20), alt "Image"
//   2  a non-ASCII name (Schrödinger.png), the zip's UTF-8 flag unset, referenced %-encoded
//   3  the reference's case differs from the file's (../images/Wave.PNG -> Images/wave.png)
//   4  an SVG wrapper: <svg><image xlink:href="../Images/plate.jpg"/></svg> (deflated entry)
//   5  an SVG drawing set in the page, in <figure> with <figcaption>
//   6  <img> with a 1-pixel placeholder src, the real picture in data-src and srcset (WebP)
//   7  a GIF
//   8  an SVG file the manifest calls image/jpeg, with an undeclared prefix and an HTML
//      entity (it draws only once repaired), and a picture placed in it (inset.png)
//   9  a BMP
//  10  a TIFF (drawn where the browser decodes TIFF, otherwise its caption and a placeholder)
//  11  a very large PNG (5000x3200), redrawn smaller for phones
//  12  referenced from a chapter in a deeper folder (Text/part2/…: ../../Images/deep.png)
//  13  a file the book does not contain: its caption and a placeholder
// `epub2`: an EPUB 2 package with an NCX contents instead of EPUB 3's nav.
export function makeCommercialEpub({ title = 'Quiet Experiments', epub2 = false } = {}) {
  const para = n => `<p class="body">Paragraph ${n}. The apparatus on the bench was simple enough to describe in a sentence and difficult enough to build that it took the workshop a whole winter: a lamp, a screen with two narrow openings, and a sheet of paper far enough away that the light had room to spread before it landed.</p>`;
  const paras = (from, n) => Array.from({ length: n }, (_, i) => para(from + i)).join('');
  const cap = (n, text) => `<p class="caption">Figure ${n}: ${text}</p>`;
  const x = body => `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>x</title><link rel="stylesheet" href="../Styles/style.css"/></head><body>${body}</body></html>`;
  const docs = [
    ['cover', 'Text/cover.xhtml', '<div class="cover"><img src="../Images/cover.jpg" alt="Cover"/></div>'],
    ['ch1', 'Text/ch01.xhtml', `<h1 class="chapter-title">One: Two Openings</h1>${paras(1, 2)}<div class="figure"><img class="fig" src="../Images/fig%201%20double%20slit.jpg" alt="Image"/></div>${cap(1, 'Double slit experiment, a file name with spaces.')}${paras(3, 2)}<div class="figure"><img src="../Images/Schr%C3%B6dinger.png" alt="Image"/></div>${cap(2, 'A non-ASCII file name.')}${paras(5, 2)}<div class="figure"><img src="../images/Wave.PNG" alt="Image"/></div>${cap(3, 'A reference whose case differs from the file.')}${paras(7, 2)}`],
    ['ch2', 'Text/ch02.xhtml', `<h1 class="chapter-title">Two: Plates</h1>${paras(9, 2)}<div class="figure"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" viewBox="0 0 240 150" preserveAspectRatio="xMidYMid meet"><image width="240" height="150" xlink:href="../Images/plate.jpg"/></svg></div>${cap(4, 'An SVG wrapper around a JPEG.')}${paras(11, 2)}<figure><svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect x="8" y="8" width="384" height="224" fill="#efe6cf" stroke="#2a4a5c" stroke-width="4"/><path d="M40 200 Q200 20 360 200" fill="none" stroke="#b5562b" stroke-width="6"/></svg><figcaption>Figure 5: An SVG drawing set in the page.</figcaption></figure>${paras(13, 2)}<figure><img src="../Images/blank.gif" data-src="../Images/lazy.webp" srcset="../Images/lazy.webp 2x" alt="Image"/><figcaption>Figure 6: A lazy-loaded WebP.</figcaption></figure>${paras(15, 2)}`],
    ['ch3', 'Text/ch03.xhtml', `<h1 class="chapter-title">Three: Formats</h1>${paras(17, 2)}<div class="figure"><img src="../Images/sparks.gif" alt="Image"/></div>${cap(7, 'A GIF.')}${paras(19, 2)}<div class="figure"><img src="../Images/chart.svg" alt="Image"/></div>${cap(8, 'An SVG file declared as a JPEG that needs repairing.')}${paras(21, 2)}<div class="figure"><img src="../Images/scan.bmp" alt="Image"/></div>${cap(9, 'A BMP.')}${paras(23, 2)}<div class="figure"><img src="../Images/scan.tif" alt="Image"/></div>${cap(10, 'A TIFF.')}${paras(25, 2)}<div class="figure"><img src="../Images/huge.png" alt="Image"/></div>${cap(11, 'A very large PNG.')}${paras(27, 2)}`],
    ['ch4', 'Text/part2/ch04.xhtml', `<h1 class="chapter-title">Four: Elsewhere</h1>${paras(29, 2)}<div class="figure"><img src="../../Images/deep.png" alt="Image"/></div>${cap(12, 'Referenced from a deeper folder.')}${paras(31, 2)}<div class="figure"><img src="../../Images/lost.jpg" alt="Image"/></div>${cap(13, 'A picture the book does not contain.')}${paras(33, 2)}`],
  ];
  const chartSvg = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="200" viewBox="0 0 300 200" sodipodi:docname="chart.svg"><rect width="300" height="200" fill="#f4ecd8"/><rect x="30" y="60" width="50" height="120" fill="#2a4a5c"/><rect x="120" y="30" width="50" height="150" fill="#b5562b"/><image x="200" y="40" width="80" height="60" xlink:href="inset.png"/><text x="30" y="30" font-size="14">Counts&nbsp;per&nbsp;slit</text></svg>';
  // [manifest id, path under OEBPS, bytes, declared media-type, zip options]
  const images = [
    ['cover', 'Images/cover.jpg', jpeg(), 'image/jpeg'],
    ['f1', 'Images/fig 1 double slit.jpg', jpeg(), 'image/jpeg'],
    ['f2', 'Images/Schrödinger.png', png(320, 200, [90, 110, 150]), 'image/png', { utf8: false }],
    ['f3', 'Images/wave.png', png(300, 180, [60, 130, 120]), 'image/png'],
    ['f4', 'Images/plate.jpg', jpeg(), 'image/jpeg', { deflate: true }],
    ['blank', 'Images/blank.gif', gif(1, 1), 'image/gif'],
    ['f6', 'Images/lazy.webp', webp(), 'image/webp'],
    ['f7', 'Images/sparks.gif', gif(240, 150), 'image/gif'],
    ['f8', 'Images/chart.svg', chartSvg, 'image/jpeg'],
    ['inset', 'Images/inset.png', png(160, 120, [150, 60, 60]), 'image/png'],
    ['f9', 'Images/scan.bmp', bmp(240, 150), 'image/bmp'],
    ['f10', 'Images/scan.tif', tiff(240, 150), 'image/tiff'],
    ['f11', 'Images/huge.png', png(5000, 3200, [100, 100, 140]), 'image/png'],
    ['f12', 'Images/deep.png', png(320, 200, [140, 120, 70]), 'image/png'],
  ];
  const labels = ['One: Two Openings', 'Two: Plates', 'Three: Formats', 'Four: Elsewhere'];
  const chapterDocs = docs.slice(1);
  const nav = `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="cover.xhtml">Cover</a></li>${chapterDocs.map(([, path], i) => `<li><a href="${path.slice('Text/'.length)}">${labels[i]}</a></li>`).join('')}</ol></nav></body></html>`;
  const ncx = `<?xml version="1.0" encoding="UTF-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="quiet"/></head><docTitle><text>${title}</text></docTitle><navMap><navPoint id="np0" playOrder="1"><navLabel><text>Cover</text></navLabel><content src="Text/cover.xhtml"/></navPoint>${chapterDocs.map(([, path], i) => `<navPoint id="np${i + 1}" playOrder="${i + 2}"><navLabel><text>${labels[i]}</text></navLabel><content src="${path}"/></navPoint>`).join('')}</navMap></ncx>`;
  const enc = path => path.split('/').map(encodeURIComponent).join('/');
  const manifest = [
    epub2 ? '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>' : '<item id="nav" href="Text/nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="css" href="Styles/style.css" media-type="text/css"/>',
    ...docs.map(([id, path]) => `<item id="${id}" href="${path}" media-type="application/xhtml+xml"/>`),
    ...images.map(([id, path, , type]) => `<item id="img-${id}" href="${enc(path)}" media-type="${type}"${id === 'cover' && !epub2 ? ' properties="cover-image"' : ''}/>`),
  ].join('');
  const opf = `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="${epub2 ? '2.0' : '3.0'}" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf"><dc:identifier id="id">quiet-experiments</dc:identifier><dc:title>${title}</dc:title><dc:creator>Iris Fieldwork</dc:creator><dc:language>en</dc:language>${epub2 ? '<meta name="cover" content="img-cover"/>' : ''}</metadata><manifest>${manifest}</manifest><spine${epub2 ? ' toc="ncx"' : ''}>${docs.map(([id]) => `<itemref idref="${id}"/>`).join('')}</spine></package>`;
  const files = [
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', opf],
    epub2 ? ['OEBPS/toc.ncx', ncx] : ['OEBPS/Text/nav.xhtml', nav],
    ['OEBPS/Styles/style.css', 'p.caption{font-style:italic}', { deflate: true }],
    ...docs.map(([, path, body]) => [`OEBPS/${path}`, x(body), { deflate: true }]),
    ...images.map(([, path, bytes, , opts]) => [`OEBPS/${path}`, bytes, opts || {}]),
  ];
  return zip(files);
}

// A cover picture as some publishers ship it (synthetic): a navy ground with a pale panel, and a pure black strip
// down its left side `strip` of its width (the bleed of a print cover, Anders's "Bold Conjectures", 20 Oct 2026).
export function stripCover(width = 600, height = 900, strip = 0.08) {
  const row = width * 3 + 1, raw = Buffer.alloc(row * height), cut = Math.round(width * strip);
  for (let y = 0; y < height; y++) {
    raw[y * row] = 0;
    for (let x = 0; x < width; x++) {
      const o = y * row + 1 + x * 3, panel = x > width * 0.2 && x < width * 0.9 && y > height * 0.35 && y < height * 0.55;
      const c = x < cut ? [0, 0, 0] : panel ? [236, 226, 160] : [16 + ((x * 7 + y * 3) % 9), 40 + ((x + y) % 7), 78 + ((x * 3 + y) % 11)];
      raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2];
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

// An essay collection shaped like Anders's "Bold Conjectures, Volume II" (20 Oct 2026; invented text, no book's words):
// a cover (an SVG wrapper round a picture with a black strip), a half title and a title page set in small caps by the
// book's own stylesheet (one typed in capitals and set in all-small-caps), a copyright page with a logo, a dedication,
// a supporters page, the book's own contents page (the nav document, in the spine, mostly links, with author lines),
// a preface, then essays each with its author line, a section heading, small caps in the text and a note link.
// EPUB 3 nav with landmarks (toc, bodymatter at the first essay) and an EPUB 2 guide.
// `figure` (20 Oct 2026, D6): the second essay carries a picture with its caption ("Figure 2: …") as calibre sets one, a
// paragraph after it, and a paragraph that only starts "Figure 3" in running text (no picture before it: not a caption).
export function makeEssayEpub({ title = 'Lamplit Conjectures, Volume II', essays = 4, figure = false } = {}) {
  const sentence = [
    'Every theory of the evening begins with the lamp, because the lamp is the one thing in the room that explains itself while it explains everything else.',
    'Yet the lamp does not merely describe a distinct, non-overlapping domain: the room and the light are a single, unified whole, and it is unsurprising that the two accounts of them overlap.',
    'What, exactly, stands in the way of a single account? Why do the wick and the shade fail to work together naturally, and why has the question outlived so many careful attempts?',
    'To understand this we must first study both accounts and see what each tells us about the room, and then ask what would have to change for them to agree.',
  ];
  const para = (n, k = 0) => `<p class="calibre6">${sentence[(n + k) % 4]} ${sentence[(n + k + 1) % 4]} ${sentence[(n + k + 2) % 4]}</p>`;
  const paras = (from, count) => Array.from({ length: count }, (_, i) => para(from + i)).join('');
  const names = ['The Fate of Lamplight', 'Controversial Candles', 'Can the Wick Be Tested?', 'Another Triumph of the Shade', 'The Patient Moth', 'Wax as Information'];
  const authors = ['Ada Example', 'Ben Placeholder', 'Cleo Sample', 'Dov Instance', 'Eli Fixture', 'Fay Mock'];
  const x = (body, type = '') => `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>x</title><link rel="stylesheet" type="text/css" href="../Styles/book.css"/><style>.calibre9{font-variant:small-caps}</style></head><body${type ? ` epub:type="${type}"` : ''}>${body}</body></html>`;
  const essayDocs = Array.from({ length: essays }, (_, i) => [`e${i + 1}`, `Text/essay${i + 1}.xhtml`,
    `<section epub:type="chapter"><h1 class="calibre4">${i + 1} ${names[i]}</h1><p class="calibre7">${authors[i]}</p>${paras(i * 3, 3)}<p class="calibre6">As <span class="calibre9">Ada Lovelamp</span> observed, the <span class="calibre8">ncr</span> of a flame is its own best witness.<a href="notes.xhtml#n${i + 1}" id="r${i + 1}"><sup>${i + 1}</sup></a></p><h2 class="calibre5">The Shade</h2>${figure && i === 1 ? `<div class="calibre1"><img src="../Images/logo.png" alt="Two overlapping circles"/></div><p class="calibre6">Figure 2: The lamp and the shade, drawn as two overlapping circles; where they meet, the room is lit.</p>${para(9)}<p class="calibre6">Figure 3 of the earlier essay drew the same two circles apart, and the room between them stayed dark for most of the evening.</p>` : ''}${paras(i * 3 + 1, 4)}<blockquote class="calibre10"><p class="calibre6">${sentence[i % 4]}</p></blockquote>${paras(i * 3 + 2, 4)}</section>`]);
  const docs = [
    ['cover', 'Text/cover.xhtml', '<div class="calibre1"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid meet"><image width="600" height="900" xlink:href="../Images/cover.png"/></svg></div>', 'cover'],
    ['halftitle', 'Text/halftitle.xhtml', '<p class="calibre2">Lamplit Conjectures</p>', 'halftitlepage'],
    ['title', 'Text/title.xhtml', '<p class="calibre3">LAMPLIT CONJECTURES</p><p class="calibre3">VOLUME II</p><p class="calibre6">Essays Across the Evening</p><p class="calibre6">Edited by Gale Editor</p><p class="calibre6">Conjecture Lamp Press</p>', 'titlepage'],
    ['copyright', 'Text/copyright.xhtml', '<div class="calibre1"><img src="../Images/logo.png" alt="Lamp Institute"/></div><p class="calibre2">Copyright © 2026 Lamp Institute</p><p class="calibre6">All rights reserved.</p><p class="calibre2">First Edition</p><p class="calibre6">Digital ISBN: 000-0-0000000-0-0</p>', 'copyright-page'],
    ['dedication', 'Text/dedication.xhtml', '<p class="calibre6">Dedicated to the Moth and the Wick,<br/>who kept the evening going.</p>', 'dedication'],
    ['supporters', 'Text/supporters.xhtml', '<p class="calibre6">Major support for this volume<br/>was provided by the Lantern Fund.</p><p class="calibre6">Additional support by Several Kind Patrons.</p>', ''],
    ['nav', 'Text/nav.xhtml', null, ''],
    ['preface', 'Text/preface.xhtml', `<section epub:type="preface"><h1 class="calibre4">Preface</h1>${paras(0, 4)}</section>`, ''],
    ...essayDocs.map(([id, path, body]) => [id, path, body, '']),
    ['notes', 'Text/notes.xhtml', `<section epub:type="endnotes"><h1 class="calibre4">Notes</h1>${essayDocs.map((_, i) => `<p class="calibre6" id="n${i + 1}"><a href="essay${i + 1}.xhtml#r${i + 1}">${i + 1}</a> A note on the flame, in a smaller voice.</p>`).join('')}</section>`, ''],
  ];
  const tocItems = [['preface.xhtml', 'Preface'], ...essayDocs.map(([, path], i) => [path.slice('Text/'.length), `${i + 1} ${names[i]}`, authors[i]]), ['notes.xhtml', 'Notes']];
  const nav = `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title><link rel="stylesheet" type="text/css" href="../Styles/book.css"/></head><body><nav epub:type="toc" id="toc"><h1 class="calibre4">Contents</h1><ol class="calibre11">${tocItems.map(([href, label, by]) => `<li><a href="${href}">${label}</a>${by ? `<p class="calibre7">${by}</p>` : ''}</li>`).join('')}</ol></nav><nav epub:type="landmarks" hidden=""><ol><li><a epub:type="cover" href="cover.xhtml">Cover</a></li><li><a epub:type="toc" href="nav.xhtml">Contents</a></li><li><a epub:type="bodymatter" href="essay1.xhtml">Start</a></li></ol></nav></body></html>`;
  const css = '.calibre2{font-variant:small-caps;text-align:center}.calibre3{font-variant-caps:all-small-caps;text-align:center;letter-spacing:.1em}.calibre4{font-size:1.6em;text-align:left}.calibre6{text-align:justify}.calibre7{font-style:italic;text-align:left}.calibre8{text-transform:uppercase;font-variant:small-caps}.calibre1{text-align:center}.calibre10{margin:1em 2em}';
  const manifest = [
    '<item id="css" href="Styles/book.css" media-type="text/css"/>',
    ...docs.map(([id, path]) => `<item id="${id}" href="${path}" media-type="application/xhtml+xml"${id === 'nav' ? ' properties="nav"' : id === 'cover' ? ' properties="svg"' : ''}/>`),
    '<item id="img-cover" href="Images/cover.png" media-type="image/png" properties="cover-image"/>',
    '<item id="img-logo" href="Images/logo.png" media-type="image/png"/>',
  ].join('');
  const opf = `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">lamplit-conjectures-2</dc:identifier><dc:title>${title}</dc:title><dc:creator>Gale Editor</dc:creator><dc:language>en</dc:language></metadata><manifest>${manifest}</manifest><spine>${docs.map(([id]) => `<itemref idref="${id}"/>`).join('')}</spine><guide><reference type="cover" href="Text/cover.xhtml" title="Cover"/><reference type="toc" href="Text/nav.xhtml" title="Contents"/><reference type="text" href="Text/essay1.xhtml" title="Start"/></guide></package>`;
  return zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', opf],
    ['OEBPS/Styles/book.css', css],
    ...docs.map(([id, path, body, type]) => [`OEBPS/${path}`, id === 'nav' ? nav : x(body, type), { deflate: true }]),
    ['OEBPS/Images/cover.png', stripCover()],
    ['OEBPS/Images/logo.png', png(240, 220, [235, 235, 235])],
  ]);
}
