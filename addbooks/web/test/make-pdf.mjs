// Writes small PDFs for tests, with no dependencies: text in the standard fonts (WinAnsi),
// optional document info (Title, Author), an outline (bookmarks) and grey raster images.
//   makePdf({ info, pages: [{ size, lines: [{ x, y, size, font, text }], images: [{ x, y, w, h, pw?, ph?, data? }], draw }], outline })
// `draw`: raw PDF content operators for vector figures (see figurePaper).
// Fonts: Helvetica, Helvetica-Bold, Helvetica-Oblique, Times-Roman, Times-Bold, Times-Italic,
// and Symbol (its own encoding: '\xe5' is ∑, '\xf2' ∫, '\xb6' ∂), added only to a PDF that uses it.
// Outline items: { title, page (1-based), children? }.
// The fixtures the PDF scan, its default edition and the Tinct text are tested on (pdfFixtures) are built here too.

import { deflateSync } from 'node:zlib';

const FONTS = ['Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Times-Roman', 'Times-Bold', 'Times-Italic'];
// The few non-ASCII characters the fixtures use, as WinAnsi bytes.
const WIN = { '—': 0x97, '–': 0x96, '“': 0x93, '”': 0x94, '‘': 0x91, '’': 0x92, '…': 0x85, 'é': 0xe9, 'ü': 0xfc, '\u00ad': 0xad };
const textBytes = s => {
  let out = '';
  for (const ch of s) {
    const code = WIN[ch] ?? ch.charCodeAt(0);
    const c = String.fromCharCode(code > 255 ? 63 : code);
    out += c === '(' || c === ')' || c === '\\' ? '\\' + c : c;
  }
  return '(' + out + ')';
};
// Document strings (info, outline titles) as UTF-16BE hex with a byte-order mark.
const utf16 = s => '<FEFF' + [...s].map(ch => { const c = ch.codePointAt(0); return c > 0xffff ? '003F' : c.toString(16).padStart(4, '0').toUpperCase() }).join('') + '>';

export function makePdf({ info = {}, pages = [], outline = [] } = {}) {
  const objs = []; // [index] = body (string or Buffer), objects numbered from 1
  const add = body => { objs.push(body); return objs.length };
  const reserve = () => add(null);
  const catalogId = reserve(), pagesId = reserve();
  // Symbol only when a line is set in it, so every other PDF is written exactly as before.
  const fonts = pages.some(pg => (pg.lines || []).some(l => l.font === 'Symbol')) ? [...FONTS, 'Symbol'] : FONTS;
  const fontIds = Object.fromEntries(fonts.map(f => [f, add(f === 'Symbol' ? '<< /Type /Font /Subtype /Type1 /BaseFont /Symbol >>' : `<< /Type /Font /Subtype /Type1 /BaseFont /${f} /Encoding /WinAnsiEncoding >>`)]));
  const fontRes = fonts.map((f, i) => `/F${i + 1} ${fontIds[f]} 0 R`).join(' ');
  const pageIds = [];
  for (const pg of pages) {
    const [w, h] = pg.size || [612, 792];
    const xobjs = [];
    let ops = '';
    (pg.images || []).forEach((im, i) => {
      const iw = im.pw || 48, ih = im.ph || 48;
      // `data`: the image's own grey pixels (a page drawn as a scan), kept deflated; else a grey pattern.
      let px = im.data ? Buffer.from(im.data) : Buffer.alloc(iw * ih);
      // `noise`: pseudo-random grey (seeded), so a large file stays large (the long book's 73 MB stand-in).
      if (im.data) { /* the scan's own pixels */ }
      else if (im.noise) { let r = im.noise >>> 0 || 1; for (let k = 0; k < px.length; k++) { r = (Math.imul(r, 1664525) + 1013904223) >>> 0; px[k] = 60 + (r >>> 25) } }
      else for (let y = 0; y < ih; y++) for (let x = 0; x < iw; x++) px[y * iw + x] = 90 + ((x * 7 + y * 13) % 120);
      const filter = im.data ? ' /Filter /FlateDecode' : '';
      if (im.data) px = deflateSync(px);
      const id = add(Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${iw} /Height ${ih} /ColorSpace /DeviceGray /BitsPerComponent 8${filter} /Length ${px.length} >>\nstream\n`, 'latin1'), px, Buffer.from('\nendstream', 'latin1')]));
      xobjs.push(`/Im${i + 1} ${id} 0 R`);
      ops += `q ${im.w} 0 0 ${im.h} ${im.x} ${im.y} cm /Im${i + 1} Do Q\n`;
    });
    // Vector drawing (`draw`: raw content operators, such as lines, boxes and circles), under the text.
    if (pg.draw) ops += pg.draw + '\n';
    for (const l of pg.lines || []) {
      const f = fonts.indexOf(l.font || 'Times-Roman') + 1;
      if (f < 1) throw new Error('unknown font ' + l.font);
      ops += `BT /F${f} ${l.size || 11} Tf ${l.x ?? 72} ${l.y} Td ${textBytes(l.text)} Tj ET\n`;
    }
    const content = Buffer.from(ops, 'latin1');
    const contentId = add(Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`, 'latin1'), content, Buffer.from('\nendstream', 'latin1')]));
    pageIds.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /Font << ${fontRes} >>${xobjs.length ? ` /XObject << ${xobjs.join(' ')} >>` : ''} >> /Contents ${contentId} 0 R >>`));
  }
  objs[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => id + ' 0 R').join(' ')}] /Count ${pageIds.length} >>`;
  let outlinesRef = '';
  if (outline.length) {
    const outlinesId = reserve();
    const build = (items, parentId) => {
      const ids = items.map(() => reserve());
      let count = 0;
      items.forEach((it, i) => {
        const kids = it.children?.length ? build(it.children, ids[i]) : null;
        const page = pageIds[(it.page || 1) - 1];
        objs[ids[i] - 1] = `<< /Title ${utf16(it.title)} /Parent ${parentId} 0 R${i ? ` /Prev ${ids[i - 1]} 0 R` : ''}${i < ids.length - 1 ? ` /Next ${ids[i + 1]} 0 R` : ''} /Dest [${page} 0 R /XYZ 0 ${(pages[(it.page || 1) - 1]?.size || [612, 792])[1]} 0]${kids ? ` /First ${kids.first} 0 R /Last ${kids.last} 0 R /Count ${kids.count}` : ''} >>`;
        count += 1 + (kids ? kids.count : 0);
      });
      return { first: ids[0], last: ids.at(-1), count };
    };
    const top = build(outline, outlinesId);
    objs[outlinesId - 1] = `<< /Type /Outlines /First ${top.first} 0 R /Last ${top.last} 0 R /Count ${top.count} >>`;
    outlinesRef = ` /Outlines ${outlinesId} 0 R /PageMode /UseOutlines`;
  }
  objs[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R${outlinesRef} >>`;
  const infoKeys = Object.entries(info).filter(([, v]) => v != null);
  const infoId = infoKeys.length ? add(`<< ${infoKeys.map(([k, v]) => `/${k} ${utf16(String(v))}`).join(' ')} >>`) : 0;

  const chunks = [Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'latin1')];
  let offset = chunks[0].length;
  const offsets = [];
  objs.forEach((body, i) => {
    const b = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`, 'latin1'), Buffer.isBuffer(body) ? body : Buffer.from(body, 'latin1'), Buffer.from('\nendobj\n', 'latin1')]);
    offsets.push(offset); offset += b.length; chunks.push(b);
  });
  const xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${objs.length + 1} /Root ${catalogId} 0 R${infoId ? ` /Info ${infoId} 0 R` : ''} >>\nstartxref\n${offset}\n%%EOF\n`;
  chunks.push(Buffer.from(xref, 'latin1'));
  return Buffer.concat(chunks);
}

// Body text: wrapped lines of public-domain prose (Hume, An Enquiry Concerning Human
// Understanding, 1748), set from the top of the text block down.
const PROSE = 'All the objects of human reason or enquiry may naturally be divided into two kinds, to wit, Relations of Ideas, and Matters of Fact. Of the first kind are the sciences of Geometry, Algebra, and Arithmetic; and in short, every affirmation which is either intuitively or demonstratively certain. That the square of the hypothenuse is equal to the square of the two sides, is a proposition which expresses a relation between these figures. Propositions of this kind are discoverable by the mere operation of thought, without dependence on what is anywhere existent in the universe. Matters of fact, which are the second objects of human reason, are not ascertained in the same manner; nor is our evidence of their truth, however great, of a like nature with the foregoing.';
export function prose(top, count, { x = 72, size = 11, font = 'Times-Roman', width = 84, from = 0 } = {}) {
  const words = PROSE.split(' ');
  const lines = [];
  let i = from % words.length, y = top;
  for (let n = 0; n < count; n++) {
    let line = '';
    while ((line + ' ' + words[i]).trim().length < width) { line = (line + ' ' + words[i]).trim(); i = (i + 1) % words.length }
    lines.push({ x, y, size, font, text: line }); y -= size * 1.35;
  }
  return lines;
}

// Words of public-domain prose (Hume, 1748, as above) for longer fixtures: paragraph i of a
// book, deterministic, ending in a full stop. "self-evident" stands in some of them. The words
// are taken in a stride that changes from paragraph to paragraph, so no two lines are the same
// (a line printed on several pages is taken for a running head).
const BOOK_WORDS = (PROSE + ' It is self-evident that the understanding demonstratively perceives the relations which are discoverable among ideas, and that experience alone instructs us concerning matters of fact and existence.').split(' ');
function paragraphText(i, words) {
  const out = [];
  const stride = [1, 3, 7, 11, 13][i % 5];
  for (let k = 0; k < words; k++) out.push(BOOK_WORDS[(i * 53 + k * stride + Math.floor(k / 17)) % BOOK_WORDS.length]);
  const text = out.join(' ').replace(/[.,;:]+$/, '') + '.';
  return text[0].toUpperCase() + text.slice(1);
}
// A paragraph set in lines of at most `width` characters (the first indented by `indent`
// points and `indentChars` shorter). A long word that does not fit is broken with a hyphen
// (every fifth break a soft hyphen, U+00AD, as some typesetters leave them), a hyphenated
// word at its own hyphen.
let breaks = 0;
function setParagraph(text, { x = 72, indent = 18, width = 86, indentChars = 4, size = 11, font = 'Times-Roman' } = {}) {
  const words = text.split(' ');
  const lines = [];
  let line = '', first = true;
  const limit = () => first ? width - indentChars : width;
  const push = () => { lines.push({ x: first ? x + indent : x, size, font, text: line }); line = ''; first = false };
  for (const w of words) {
    const next = line ? line + ' ' + w : w;
    if (next.length <= limit()) { line = next; continue }
    const room = limit() - line.length - 2;
    const dash = w.indexOf('-');
    if (dash > 0 && dash + 1 <= room) { line += ' ' + w.slice(0, dash + 1); push(); line = w.slice(dash + 1); continue }
    const letters = /^[A-Za-z]+[,.;:]?$/.test(w) ? w.replace(/[,.;:]$/, '').length : 0;
    if (line && letters >= 8 && room >= 4 && letters - room >= 3) {
      const mark = ++breaks % 5 === 2 ? '­' : '-';
      line += ' ' + w.slice(0, room) + mark; push(); line = w.slice(room); continue;
    }
    push(); line = w;
  }
  if (line) push();
  return lines;
}

// 5. A book of prose: a title page, five chapters (each on a new page, in the outline), first
//    lines indented, running heads and page numbers, words broken at line ends, paragraphs
//    running over page breaks, and a footnote at the foot of chapter 2's first page.
//    proseBook({ text: true }) also returns each chapter's paragraphs as written; `paragraphs`
//    sets chapter 1's length (each later chapter has two more), so a longer book can be made.
export function proseBook({ text = false, paragraphs = 18 } = {}) {
  breaks = 0;
  const written = [];
  const titles = ['Chapter 1. Of Ideas', 'Chapter 2. Of Impressions', 'Chapter 3. Of Custom', 'Chapter 4. Of Belief', 'Chapter 5. Of Necessity'];
  const pages = [{ lines: [
    { x: 150, y: 560, size: 24, font: 'Times-Bold', text: 'A Treatise of Small Things' },
    { x: 250, y: 520, size: 14, font: 'Times-Roman', text: 'Ann Example' },
  ] }];
  const outline = [];
  let para = 0;
  const TOP = 700, FOOT = 90, PITCH = 15;
  titles.forEach((title, c) => {
    outline.push({ title, page: pages.length + 1 });
    let page = { lines: [{ x: 72, y: 680, size: 16, font: 'Times-Bold', text: title }] };
    let y = 640;
    const opening = () => page.lines[0]?.text === title;
    written.push({ title, paragraphs: [] });
    for (let k = 0; k < paragraphs + c * 2; k++) {
      const words = paragraphText(para, 45 + ((para * 37) % 70));
      written.at(-1).paragraphs.push(words);
      for (const l of setParagraph(words)) {
        if (y < (c === 1 && opening() ? 150 : FOOT)) {
          if (c === 1 && opening()) page.lines.push(
            { x: 72, y: 110, size: 8, font: 'Times-Roman', text: '1 Hume first printed this argument in 1748, and he revised it for the edition' },
            { x: 72, y: 100, size: 8, font: 'Times-Roman', text: 'that appeared after his death.' });
          pages.push(page); page = { lines: [] }; y = TOP;
        }
        page.lines.push({ ...l, y }); y -= PITCH;
      }
      para++;
    }
    pages.push(page);
  });
  // Running heads (the book's title on even pages, the chapter's on odd) and page numbers.
  pages.forEach((pg, i) => {
    if (i === 0) return;
    const chapter = titles[outline.filter(o => o.page <= i + 1).length - 1];
    pg.lines.push({ x: 72, y: 750, size: 9, font: 'Helvetica', text: (i % 2 ? chapter : 'A Treatise of Small Things').toUpperCase() });
    pg.lines.push({ x: 300, y: 50, size: 9, font: 'Helvetica', text: String(i + 1) });
  });
  const bytes = makePdf({ info: { Title: 'A Treatise of Small Things', Author: 'Ann Example' }, outline, pages });
  return text ? { bytes, chapters: written } : bytes;
}

// 6. A two-column paper: title, authors, abstract and a DOI across the page, then two
//    columns; figures across both columns with captions, display equations in Symbol,
//    tables, numbered section headings and a references list on the last page.
export function twoColumnPaper() {
  breaks = 0;
  const col = (x, top, bottom, from) => {
    const lines = [];
    let y = top, i = from;
    while (y > bottom) {
      for (const l of setParagraph(paragraphText(i, 40 + ((i * 29) % 50)), { x, indent: 10, width: 54, indentChars: 2, size: 9.5 })) {
        if (y <= bottom) break;
        lines.push({ ...l, y }); y -= 12.5;
      }
      i++;
    }
    return lines;
  };
  // Each equation its own (a line printed the same on several pages is a running head).
  const equation = (x, y, n) => ({ x: x + 60, y, size: 10, font: 'Symbol', text: `\xe5 r(t) = \xf2 a(t) dt + ${n}` });
  const table = (x, y) => [['Chapter', 'Words', 'Return', 'Rate'], ['1', '4,210', '0.81', '62%'], ['2', '6,980', '0.74', '55%'], ['3', '3,115', '0.88', '71%'], ['4', '9,402', '0.52', '38%'], ['5', '5,560', '0.79', '60%']]
    .flatMap((row, r) => row.map((cell, k) => ({ x: x + k * 62, y: y - r * 13, size: 9, font: 'Times-Roman', text: cell })));
  const pages = [{ lines: [
    { x: 95, y: 720, size: 17, font: 'Times-Bold', text: 'Attention and Return in Long-Form Reading' },
    { x: 235, y: 698, size: 10, font: 'Times-Roman', text: 'A. Researcher and B. Scholar' },
    { x: 48, y: 672, size: 10, font: 'Times-Bold', text: 'Abstract' },
    ...setParagraph(paragraphText(900, 90), { x: 48, indent: 0, width: 118, indentChars: 0, size: 9.5 }).map((l, i) => ({ ...l, y: 658 - i * 12 })),
    { x: 48, y: 586, size: 9, font: 'Times-Roman', text: 'doi:10.5555/tinct.2026.001' },
    { x: 48, y: 562, size: 11, font: 'Times-Bold', text: '1 Introduction' },
    ...col(48, 545, 80, 0), ...col(315, 562, 80, 30),
  ] }];
  for (let n = 2; n <= 7; n++) {
    const lines = [];
    const images = [];
    let top = 720;
    // A figure across both columns, with its caption, on every other page.
    if (n % 2 === 0) {
      images.push({ x: 56, y: 470, w: 500, h: 250, pw: 50, ph: 25 });
      lines.push({ x: 56, y: 455, size: 8, font: 'Times-Italic', text: `Figure ${n / 2}. Return rates across chapters of different lengths, by week of reading.` });
      top = 435;
    }
    let left = col(48, top, 80, n * 40), right = col(315, top, 80, n * 40 + 20);
    // A table in the left column, an equation in each column.
    if (n === 3 || n === 5) left = [...left.filter(l => l.y > 400 || l.y < 300), ...table(48, 390)];
    left = left.filter(l => Math.abs(l.y - 270) > 12); right = right.filter(l => Math.abs(l.y - 220) > 12);
    if (n === 4) { left = left.filter(l => l.y < top - 20); left.unshift({ x: 48, y: top, size: 11, font: 'Times-Bold', text: '2 Method' }) }
    lines.push(...left, equation(48, 270, n), ...right, equation(315, 220, n + 10));
    pages.push({ lines, images });
  }
  pages.push({ lines: [
    { x: 48, y: 720, size: 11, font: 'Times-Bold', text: 'References' },
    ...Array.from({ length: 12 }, (_, i) => ({ x: 48, y: 700 - i * 22, size: 8.5, font: 'Times-Roman', text: `[${i + 1}] A. Author. On reading at length, part ${i + 1}. Journal of Reading ${10 + i}, ${2000 + i}.` })),
  ] });
  pages.forEach((pg, i) => pg.lines.push({ x: 300, y: 40, size: 9, font: 'Times-Roman', text: String(i + 1) }));
  return makePdf({ info: { Title: 'Attention and Return in Long-Form Reading' }, pages });
}

// 7. A paper of figures (FIXES-2026-10-15 items 4–7), for the margin's figure checks:
//    p. 1 a network diagram of three rows of small circles joined only by their labels (TD-Gammon's
//    Figure 16.1: no row is a figure by itself), its caption below; p. 2 a block diagram at the page's
//    left edge with labels inside its boxes and body text beside it (ResNet's Figure 2); p. 3 a table
//    of bare cells under its caption; p. 4 a figure larger than half the page, under running text.
const circle = (x, y, r) => { const k = r * 0.5523; return `${x + r} ${y} m ${x + r} ${y + k} ${x + k} ${y + r} ${x} ${y + r} c ${x - k} ${y + r} ${x - r} ${y + k} ${x - r} ${y} c ${x - r} ${y - k} ${x - k} ${y - r} ${x} ${y - r} c ${x + k} ${y - r} ${x + r} ${y - k} ${x + r} ${y} c S` };
export function figurePaper() {
  breaks = 0;
  const label = (x, y, text) => ({ x, y, size: 8, font: 'Helvetica', text });
  const row = (n, y, x0, x1) => Array.from({ length: n }, (_, i) => circle(Math.round(x0 + (n > 1 ? (i * (x1 - x0)) / (n - 1) : (x1 - x0) / 2)), y, 5)).join(' ');
  const pages = [
    { draw: `0.8 w ${row(3, 545, 286, 326)} ${row(8, 509, 236, 376)} ${row(14, 473, 206, 406)}`, lines: [
      { x: 72, y: 720, size: 15, font: 'Times-Bold', text: 'Figures in the Margin' },
      ...prose(690, 6, { from: 3 }),
      label(246, 527, 'predicted probability of winning'), label(262, 491, 'hidden units (40-80)'), label(230, 455, 'backgammon position (198 input units)'),
      { x: 160, y: 425, size: 9, font: 'Times-Italic', text: 'Figure 1. A network of three layers of units that rates a position.' },
      ...prose(395, 22, { from: 40 }),
    ] },
    { draw: '0.9 w 12 600 110 20 re S 12 548 110 20 re S 67 640 m 67 620 l S 67 600 m 67 568 l S 67 548 m 67 520 l S ' + circle(67, 512, 7) + ' 67 505 m 67 482 l S 122 610 m 145 610 l 145 512 l 74 512 l S', lines: [
      ...prose(720, 5, { from: 11 }),
      label(36, 606, 'weight layer'), label(36, 554, 'weight layer'), label(72, 580, 'relu'), label(72, 488, 'relu'), label(130, 560, 'x'), label(100, 530, 'F(x) + x'),
      ...prose(640, 14, { x: 178, width: 62, from: 60 }),
      { x: 12, y: 466, size: 8, font: 'Times-Italic', text: 'Figure 2. Residual learning:' },
      { x: 12, y: 456, size: 8, font: 'Times-Italic', text: 'a building block.' },
      ...prose(430, 24, { from: 90 }),
    ] },
    { lines: [
      ...prose(720, 8, { from: 120 }),
      { x: 72, y: 600, size: 9, font: 'Times-Italic', text: 'Table 1. Error rates on the test set, by depth of the network.' },
      ...[['Depth', 'Plain', 'Residual'], ['18', '27.94', '27.88'], ['34', '28.54', '25.03'], ['50', '-', '22.85'], ['101', '-', '21.75'], ['152', '-', '21.43']]
        .flatMap((r, i) => r.map((cell, k) => ({ x: 190 + k * 90, y: 580 - i * 16, size: 9, font: 'Times-Roman', text: cell }))),
      ...prose(470, 24, { from: 150 }),
    ] },
    { images: [{ x: 60, y: 170, w: 492, h: 520, pw: 60, ph: 64 }], lines: [
      ...prose(730, 2, { from: 180 }),
      { x: 60, y: 150, size: 9, font: 'Times-Italic', text: 'Figure 3. Training on ImageNet: thin curves are training error, bold curves validation error.' },
      ...prose(125, 3, { from: 200 }),
    ] },
  ];
  pages.forEach((pg, i) => pg.lines.push({ x: 300, y: 40, size: 9, font: 'Times-Roman', text: String(i + 1) }));
  return makePdf({ info: { Title: 'Figures in the Margin' }, pages });
}

// 8. A long book, the stand-in for Sutton and Barto's "Reinforcement Learning" (docs/margin/gloss-test/
//    edge.html): about 590 pages with an outline of parts, chapters and sections (as that book's: the
//    top-level entries are the front matter, chapter 1, three parts and the back matter); front matter
//    (title, Contents, Preface, Summary of Notation) numbered in roman; chapters printed from 1 at file
//    page 23, so the printed number is the file page less 22; running heads that carry the printed
//    number at the top, and the number at the foot of each chapter's first page; no page labels.
//    Chapter 6 introduces Sarsa (section 6.4; later chapters name it again), chapter 16 has the
//    TD-Gammon figure with text wrapped beside it (labels inside, a caption); then References and an
//    Index. longBook({ meta: true }) also returns where things are; `bigImages` adds that many
//    one-megabyte pictures (70 make a file of about 73 MB, as the test's book) for the reopen timing.
export const LONG_BOOK_OFFSET = 22
export function longBook({ bigImages = 0, meta = false } = {}) {
  breaks = 0;
  const TOP = 700, FOOT = 90, PITCH = 15;
  const parts = [
    { title: null, chapters: ['Introduction'] },
    { title: 'I Tabular Solution Methods', chapters: ['Multi-armed Bandits', 'Finite Markov Decision Processes', 'Dynamic Programming', 'Monte Carlo Methods', 'Temporal-Difference Learning', 'n-step Bootstrapping', 'Planning and Learning with Tabular Methods'] },
    { title: 'II Approximate Solution Methods', chapters: ['On-policy Prediction with Approximation', 'On-policy Control with Approximation', 'Off-policy Methods with Approximation', 'Eligibility Traces', 'Policy Gradient Methods'] },
    { title: 'III Looking Deeper', chapters: ['Psychology', 'Neuroscience', 'Applications and Case Studies', 'Frontiers'] },
  ];
  const SPECIAL = { '6.4': 'Sarsa: On-policy TD Control', '6.5': 'Q-learning: Off-policy TD Control', '10.1': 'Episodic Semi-gradient Control', '12.7': 'Sarsa(lambda)', '16.1': 'TD-Gammon' };
  const TOPIC = { '6.4': 'We turn now to the use of TD prediction methods for the control problem. The first step is to learn an action-value function rather than a state-value function. Each transition is from one state-action pair to the next, and the update uses every element of the quintuple of events, state, action, reward, next state, next action, that make up a transition. This quintuple gives rise to the name Sarsa for the algorithm, which we introduce here.',
    '10.1': 'The extension of the semi-gradient prediction methods to action values is straightforward. The example of episodic semi-gradient Sarsa on the mountain car task shows the control version of the method introduced in the tabular case.',
    '12.7': 'How can eligibility traces be used not just for prediction but for control? The answer is Sarsa(lambda), the action-value form of the TD(lambda) method, which reuses the Sarsa update of the tabular chapters with a trace on each pair.',
    '16.1': 'One of the most impressive applications of reinforcement learning is the backgammon program TD-Gammon. It learned to play the game at the level of the best human players from self-play alone, and TD-Gammon 0.0 matched the best earlier programs.' };
  const pages = [];
  const page = () => { const pg = { lines: [], images: [], head: null, foot: null }; pages.push(pg); return pg };
  // Front matter: title page (file 1), a blank (2), Contents (3-6), Preface (7-14), Notation (15-18), blanks to 22.
  page().lines.push({ x: 150, y: 560, size: 24, font: 'Times-Bold', text: 'Learning from Reward' }, { x: 220, y: 520, size: 14, font: 'Times-Roman', text: 'Ann Example and Bo Sample' });
  page();
  const roman = n => ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx', 'xxi', 'xxii'][n - 1];
  const frontPage = (title, from) => { const pg = page(); pg.foot = roman(pages.length); if (title) pg.lines.push({ x: 72, y: 680, size: 18, font: 'Times-Bold', text: title }); let y = title ? 640 : TOP, k = from; while (y > FOOT) { for (const l of setParagraph(paragraphText(k++, 60))) { if (y <= FOOT) break; pg.lines.push({ ...l, y }); y -= PITCH } } return pg };
  const contentsPages = [page(), page(), page(), page()];
  contentsPages.forEach(pg => { pg.foot = roman(pages.indexOf(pg) + 1) });
  for (let i = 0; i < 8; i++) frontPage(i ? null : 'Preface', 5000 + i * 30);
  for (let i = 0; i < 4; i++) frontPage(i ? null : 'Summary of Notation', 6000 + i * 30);
  while (pages.length < LONG_BOOK_OFFSET) page();
  const outline = [{ title: 'Contents', page: 3 }, { title: 'Preface', page: 7 }, { title: 'Summary of Notation', page: 15 }];
  const chapters = [];
  let para = 0, number = 0, sarsaPage = 0, figurePage = 0;
  const body = (pg, y, k) => { for (const l of setParagraph(paragraphText(k, 50 + ((k * 37) % 60)))) { if (y <= FOOT) return { y, done: false }; pg.lines.push({ ...l, y }); y -= PITCH } return { y, done: true } };
  const fill = (pg, y, lead = null, width = 86) => {
    if (lead) for (const l of setParagraph(lead, { width })) { pg.lines.push({ ...l, y }); y -= PITCH }
    while (y > FOOT + PITCH) { const r = body(pg, y, para++); y = r.y - 4 }
  };
  for (const part of parts) {
    const entry = part.title ? { title: part.title, page: pages.length + 1, children: [] } : null;
    if (entry) outline.push(entry);
    for (const name of part.chapters) {
      number++;
      const title = `${number} ${name}`;
      const opener = page(); opener.foot = String(pages.length - LONG_BOOK_OFFSET); opener.chapter = number;
      opener.lines.push({ x: 72, y: 660, size: 11, font: 'Times-Roman', text: `Chapter ${number}` }, { x: 72, y: 630, size: 20, font: 'Times-Bold', text: name });
      fill(opener, 590, `This chapter takes up ${name.toLowerCase()}, the subject of the sections that follow.`);
      const ch = { title, page: pages.indexOf(opener) + 1, children: [] };
      (entry ? entry.children : outline).push(ch);
      for (let k = 1; k <= 5; k++) {
        const id = `${number}.${k}`, sec = `${id} ${SPECIAL[id] || `${name}, part ${k}`}`;
        for (let n = 0; n < 6; n++) {
          const pg = page(); pg.chapter = number; pg.section = sec;
          if (n === 0) { ch.children.push({ title: sec, page: pages.length }); pg.lines.push({ x: 72, y: 690, size: 13, font: 'Times-Bold', text: sec }) }
          if (id === '6.4' && n === 0) sarsaPage = pages.length;
          if (id === '16.1' && n === 1) {
            // Text wrapped beside a figure: narrow body lines on the left, the figure's labels and caption on the right.
            figurePage = pages.length;
            pg.images.push({ x: 360, y: 430, w: 180, h: 230, pw: 36, ph: 46 });
            let y = TOP;
            const wrapped = 'The network has a total of 198 input units that encode the backgammon position, a layer of hidden units, and one output unit that estimates the probability of winning from that position. The weights were set to small random values at the start, and each move was chosen by evaluating every possible next position with the network and taking the best one. TD-Gammon learned by playing against itself, updating the weights after every move by the TD error between successive predictions.';
            for (const l of setParagraph(wrapped, { width: 48, indent: 0, indentChars: 0 })) { pg.lines.push({ ...l, y }); y -= PITCH }
            while (y > 400) { for (const l of setParagraph(paragraphText(para++, 40), { width: 48, indent: 0, indentChars: 0 })) { if (y <= 400) break; pg.lines.push({ ...l, y }); y -= PITCH } }
            pg.lines.push(
              { x: 380, y: 650, size: 8, font: 'Helvetica', text: 'predicted probability' }, { x: 398, y: 640, size: 8, font: 'Helvetica', text: 'of winning' },
              { x: 470, y: 600, size: 8, font: 'Helvetica', text: 'TD error' },
              { x: 372, y: 560, size: 8, font: 'Helvetica', text: 'hidden units (40-80)' },
              { x: 380, y: 470, size: 8, font: 'Helvetica', text: 'backgammon position' }, { x: 384, y: 460, size: 8, font: 'Helvetica', text: '(198 input units)' },
              { x: 360, y: 412, size: 8, font: 'Times-Italic', text: 'Figure 16.1: The TD-Gammon neural' }, { x: 360, y: 402, size: 8, font: 'Times-Italic', text: 'network.' });
            fill(pg, 380);
            // In the order a typesetter's figure often lands in the content stream: the labels between the body lines.
            pg.lines.sort((a, b) => b.y - a.y);
            continue;
          }
          fill(pg, n === 0 ? 660 : TOP, n === 0 ? (TOPIC[id] || `This section takes up ${(SPECIAL[id] || name).toLowerCase()} in more detail.`) : null);
        }
      }
      chapters.push({ title, from: ch.page, to: pages.length });
    }
  }
  const refsFrom = pages.length + 1;
  outline.push({ title: 'References', page: refsFrom });
  for (let i = 0; i < 20; i++) {
    const pg = page(); pg.section = 'REFERENCES'; let y = i ? TOP : 660;
    if (!i) pg.lines.push({ x: 72, y: 690, size: 18, font: 'Times-Bold', text: 'References' });
    for (let r = 0; y > FOOT; r++, y -= 26) {
      const k = i * 24 + r;
      pg.lines.push({ x: 72, y, size: 9, font: 'Times-Roman', text: `${['Barto', 'Sutton', 'Watkins', 'Tesauro', 'Samuel', 'Bellman', 'Howard', 'Minsky', 'Klopf', 'Dayan'][k % 10]}, A. B., Writer, C. (${1950 + (k % 70)}). On learning from reward, study ${k + 1}. Journal of Learning, ${k % 40}:${10 + k}-${20 + k}.` });
    }
  }
  const indexFrom = pages.length + 1;
  outline.push({ title: 'Index', page: indexFrom });
  const TERMS = ['action-value function', 'actor-critic', 'backgammon', 'bandit problem', 'Bellman equation', 'bootstrapping', 'discounting', 'dynamic programming', 'eligibility trace', 'exploration', 'function approximation', 'greedy policy', 'Markov property', 'Monte Carlo', 'policy gradient', 'Q-learning', 'reward signal', 'Sarsa', 'semi-gradient', 'TD error', 'TD-Gammon', 'value function'];
  for (let i = 0; i < 16; i++) {
    const pg = page(); pg.section = 'INDEX'; let y = i ? TOP : 660;
    if (!i) pg.lines.push({ x: 72, y: 690, size: 18, font: 'Times-Bold', text: 'Index' });
    for (let r = 0; y > FOOT; r++, y -= 13) { const k = i * 46 + r; pg.lines.push({ x: 72, y, size: 9, font: 'Times-Roman', text: `${TERMS[k % TERMS.length]}${k >= TERMS.length ? `, case ${Math.floor(k / TERMS.length)}` : ''}, ${(k * 7) % 500 + 1}, ${(k * 11) % 500 + 3}` }) }
  }
  // The Contents pages: every chapter with its printed page.
  const rows = outline.flatMap(e => e.children ? [{ title: e.title, page: e.page }, ...e.children] : [e]).filter(e => e.page > LONG_BOOK_OFFSET);
  rows.forEach((e, i) => { const pg = contentsPages[Math.floor(i / 6)] || contentsPages[3]; const y = 680 - (i % 6) * 40; pg.lines.push({ x: 72, y, size: 11, font: 'Times-Roman', text: `${e.title} . . . . . . . . ${e.page - LONG_BOOK_OFFSET}` }) });
  contentsPages[0].lines.push({ x: 72, y: 720, size: 18, font: 'Times-Bold', text: 'Contents' });
  // Running heads with the printed number (even pages: number left; odd: right), the foot's number on openers and front matter.
  pages.forEach((pg, i) => {
    const file = i + 1, printed = file - LONG_BOOK_OFFSET;
    if (pg.foot) pg.lines.push({ x: 300, y: 50, size: 9, font: 'Times-Roman', text: pg.foot });
    else if (printed >= 1 && (pg.chapter || pg.section)) {
      const head = pg.section && !pg.chapter ? pg.section : file % 2 ? (pg.section || '').toUpperCase() : `CHAPTER ${pg.chapter}. ${parts.flatMap(p => p.chapters)[pg.chapter - 1].toUpperCase()}`;
      if (file % 2) pg.lines.push({ x: 300, y: 750, size: 9, font: 'Times-Roman', text: head }, { x: 520, y: 750, size: 9, font: 'Times-Roman', text: String(printed) });
      else pg.lines.push({ x: 72, y: 750, size: 9, font: 'Times-Roman', text: String(printed) }, { x: 110, y: 750, size: 9, font: 'Times-Roman', text: head });
    }
  });
  // Large pictures for a large file, spread over the chapters' pages (drawn under their text).
  const spots = pages.map((pg, i) => i).filter(i => pages[i].chapter && i + 1 !== figurePage);
  for (let k = 0; k < bigImages; k++) pages[spots[Math.floor(k * spots.length / bigImages)]].images.push({ x: 72, y: 100, w: 468, h: 60, pw: 1024, ph: 1024, noise: k + 1 });
  const bytes = makePdf({ info: { Title: 'Learning from Reward', Author: 'Ann Example and Bo Sample' }, outline, pages: pages.map(pg => ({ lines: pg.lines, images: pg.images })) });
  return meta ? { bytes, meta: { offset: LONG_BOOK_OFFSET, pages: pages.length, sarsaPage, figurePage, chapters, refsFrom, indexFrom } } : bytes;
}

export function pdfFixtures() {
  // 1. A report with document info and bookmarks, under an unhelpful file name; a picture on page 4.
  const report = makePdf({
    info: { Title: 'Notes on Natural Philosophy', Author: 'Mary Somerville', Creator: 'Tinct tests' },
    outline: [
      { title: 'Preface', page: 1 },
      { title: 'Part One: Motion', page: 2, children: [{ title: 'Chapter 1. Of Force', page: 2 }, { title: 'Chapter 2. Of Gravity', page: 3 }] },
      { title: 'Part Two: Light', page: 4, children: [{ title: 'Chapter 3. Of Refraction', page: 4 }] },
    ],
    pages: [1, 2, 3, 4].map(n => ({ images: n === 4 ? [{ x: 206, y: 70, w: 200, h: 180, pw: 40, ph: 36 }] : [], lines: [
      ...(n === 1 ? [{ y: 700, size: 22, font: 'Times-Bold', text: 'Notes on Natural Philosophy' }] : []),
      ...prose(n === 1 ? 660 : 720, 30, { from: n * 17 }),
      { x: 300, y: 40, size: 9, font: 'Times-Roman', text: String(n) },
    ] })),
  });
  // 2. A short essay from a collection: no info, no bookmarks; a title, its author, an
  //    epigraph with an attribution, running heads and page numbers, two real sections.
  const head = n => [
    { x: 72, y: 750, size: 9, font: 'Helvetica', text: 'POSSIBLE MINDS' },
    { x: 470, y: 750, size: 9, font: 'Helvetica', text: 'DAVID DEUTSCH' },
    { x: 300, y: 36, size: 9, font: 'Helvetica', text: String(n + 40) },
  ];
  const essay = makePdf({
    pages: [
      { lines: [
        ...head(1).slice(2),
        { y: 690, size: 20, font: 'Times-Bold', text: 'Beyond Reward and Punishment' },
        { y: 662, size: 13, font: 'Times-Roman', text: 'David Deutsch' },
        { x: 150, y: 618, size: 11, font: 'Times-Italic', text: '“Tomorrow, and tomorrow, and tomorrow,' },
        { x: 150, y: 603, size: 11, font: 'Times-Italic', text: 'Creeps in this petty pace from day to day.”' },
        { x: 250, y: 584, size: 14, font: 'Times-Roman', text: '— William Shakespeare, Macbeth' },
        ...prose(550, 28, { from: 3 }),
      ] },
      { lines: [...head(2), ...prose(720, 31, { from: 40 })] },
      { lines: [...head(3), ...prose(720, 12, { from: 80 }), { y: 520, size: 14, font: 'Times-Bold', text: 'Misconceptions of Thinking' }, ...prose(495, 17, { from: 9 })] },
      { lines: [...head(4), ...prose(720, 31, { from: 22 })] },
      { lines: [...head(5), ...prose(720, 6, { from: 61 }), { y: 615, size: 14, font: 'Times-Bold', text: 'What It Means to Think' }, ...prose(590, 24, { from: 30 })] },
    ],
  });
  // 3. Two scanned pages: a page-sized picture each, no text at all.
  const scan = makePdf({ pages: [1, 2].map(() => ({ images: [{ x: 0, y: 0, w: 612, h: 792, pw: 64, ph: 82 }] })) });
  // 4. A short note with neither headings nor info: page navigation only.
  const note = makePdf({ pages: [1, 2].map(n => ({ lines: [{ x: 72, y: 750, size: 9, font: 'Helvetica', text: 'Lecture notes, week 3' }, ...prose(720, 31, { from: n * 11 }), { x: 300, y: 36, size: 9, font: 'Helvetica', text: `Page ${n} of 2` }] })) });
  return {
    'scan_0042.pdf': report,
    'PossibleMinds Deutsch (1).pdf': essay,
    'IMG_20240512_scan.pdf': scan,
    'week3_notes_final-v2.pdf': note,
    // 5 and 6 (above): the default edition is the Tinct text for the book, the pages for the paper.
    'prose_book.pdf': proseBook(),
    'two_column_paper.pdf': twoColumnPaper(),
  };
}

// node addbooks/web/test/make-pdf.mjs <dir>: writes the fixtures there.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { writeFileSync, mkdirSync } = await import('node:fs');
  const { join } = await import('node:path');
  const dir = process.argv[2] || 'addbooks/web/test/pdf-fixtures';
  mkdirSync(dir, { recursive: true });
  for (const [name, bytes] of Object.entries(pdfFixtures())) { writeFileSync(join(dir, name), bytes); console.log(join(dir, name), bytes.length) }
}
