// Writes small PDFs for tests, with no dependencies: text in the standard fonts (WinAnsi),
// optional document info (Title, Author), an outline (bookmarks) and grey raster images.
//   makePdf({ info, pages: [{ size, lines: [{ x, y, size, font, text }], images: [{ x, y, w, h }] }], outline })
// Fonts: Helvetica, Helvetica-Bold, Helvetica-Oblique, Times-Roman, Times-Bold, Times-Italic.
// Outline items: { title, page (1-based), children? }.
// The three fixtures the PDF scan is tested on (pdfFixtures) are built here too.

const FONTS = ['Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Times-Roman', 'Times-Bold', 'Times-Italic'];
// The few non-ASCII characters the fixtures use, as WinAnsi bytes.
const WIN = { '—': 0x97, '–': 0x96, '“': 0x93, '”': 0x94, '‘': 0x91, '’': 0x92, '…': 0x85, 'é': 0xe9, 'ü': 0xfc };
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
  const fontIds = Object.fromEntries(FONTS.map(f => [f, add(`<< /Type /Font /Subtype /Type1 /BaseFont /${f} /Encoding /WinAnsiEncoding >>`)]));
  const fontRes = FONTS.map((f, i) => `/F${i + 1} ${fontIds[f]} 0 R`).join(' ');
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
    for (const l of pg.lines || []) {
      const f = FONTS.indexOf(l.font || 'Times-Roman') + 1;
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
function prose(top, count, { x = 72, size = 11, font = 'Times-Roman', width = 84, from = 0 } = {}) {
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
