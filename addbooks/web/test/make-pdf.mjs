// Writes small PDFs for tests, with no dependencies: text in the standard fonts (WinAnsi),
// optional document info (Title, Author), an outline (bookmarks) and grey raster images.
//   makePdf({ info, pages: [{ size, lines: [{ x, y, size, font, text }], images: [{ x, y, w, h }], draw }], outline })
// `draw`: raw PDF content operators for vector figures (see figurePaper).
// Fonts: Helvetica, Helvetica-Bold, Helvetica-Oblique, Times-Roman, Times-Bold, Times-Italic,
// and Symbol (its own encoding: '\xe5' is ∑, '\xf2' ∫, '\xb6' ∂), added only to a PDF that uses it.
// Outline items: { title, page (1-based), children? }.
// The fixtures the PDF scan, its default edition and the Tinct text are tested on (pdfFixtures) are built here too.

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
      const px = Buffer.alloc(iw * ih);
      for (let y = 0; y < ih; y++) for (let x = 0; x < iw; x++) px[y * iw + x] = 90 + ((x * 7 + y * 13) % 120);
      const id = add(Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${iw} /Height ${ih} /ColorSpace /DeviceGray /BitsPerComponent 8 /Length ${px.length} >>\nstream\n`, 'latin1'), px, Buffer.from('\nendstream', 'latin1')]));
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
