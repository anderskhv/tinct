#!/usr/bin/env node
/**
 * Convert butler.js and pope.js raw text files into paragraph-array JSON
 * for the new edition system.
 *
 * Output: src/data/editions/odyssey-original-en.json (Butler)
 *         src/data/editions/odyssey-verse-en.json (Pope)
 */

const fs = require('fs');
const path = require('path');

process.chdir(path.dirname(process.argv[1]));

const ROMANS = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV'];
const ROMAN_MAP = {};
ROMANS.forEach((r,i) => { if(r) ROMAN_MAP[r] = i; });

function extractText(raw) {
  // The JS files store text as a single string assignment
  const start = raw.indexOf('"') + 1;
  const end = raw.lastIndexOf('"');
  return JSON.parse('"' + raw.substring(start, end) + '"').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function stripGutenberg(text) {
  const startM = '*** START OF THE PROJECT GUTENBERG EBOOK';
  const endM = '*** END OF THE PROJECT GUTENBERG EBOOK';
  let si = text.indexOf(startM);
  si = si !== -1 ? text.indexOf('\n', si) + 1 : 0;
  let ei = text.indexOf(endM);
  if (ei === -1) ei = text.length;
  return text.slice(si, ei).trim();
}

function parseChapters(body) {
  const bookPattern = /\nBOOK\s+([IVXLC]+)\.?\s*\n/gi;
  const matches = [...body.matchAll(bookPattern)];
  const chapters = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const next = matches[i + 1];
    const startPos = (match.index || 0) + match[0].length;
    const endPos = next ? (next.index || body.length) : body.length;
    const chText = body.slice(startPos, endPos).trim();
    const roman = match[1].toUpperCase();
    const num = ROMAN_MAP[roman] || (i + 1);
    const lines = chText.split('\n');

    let title = 'Book ' + roman;
    let textStart = 0;
    let titleParts = [];

    for (let j = 0; j < Math.min(8, lines.length); j++) {
      const line = lines[j].trim();
      if (line.length === 0) {
        if (titleParts.length > 0) { textStart = j + 1; break; }
        textStart = j + 1;
        continue;
      }
      if (line === line.toUpperCase() && line.length < 120 && !/^BOOK\s/.test(line)) {
        titleParts.push(line);
        textStart = j + 1;
      } else break;
    }

    if (titleParts.length > 0) {
      const fullTitle = titleParts.join(' ').replace(/\s+/g, ' ');
      title = 'Book ' + roman + ' \u2014 ' + fullTitle.charAt(0) + fullTitle.slice(1).toLowerCase();
    }

    while (textStart < lines.length && lines[textStart].trim() === '') textStart++;
    const chapterText = lines.slice(textStart).join('\n').trim();

    // Split into paragraphs (double newline separated)
    let paragraphs = chapterText.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);

    // Strip footnotes, endnotes, and appendix material
    const footnoteIdx = paragraphs.findIndex(p =>
      /^FOOTNOTES?:?\s*$/i.test(p) ||
      /^ENDNOTES?:?\s*$/i.test(p) ||
      /^\[1\]\s/.test(p)
    );
    if (footnoteIdx > 0) {
      paragraphs = paragraphs.slice(0, footnoteIdx);
    }

    // Also strip inline footnote references like [123]
    paragraphs = paragraphs.map(p => p.replace(/\[\d+\]/g, '').trim()).filter(p => p.length > 0);

    chapters.push({ number: num, title, paragraphs });
  }

  return chapters;
}

// Convert Butler (prose)
console.log('Converting Butler (prose)...');
const butlerRaw = fs.readFileSync('data/butler.js', 'utf8');
const butlerText = extractText(butlerRaw);
const butlerBody = stripGutenberg(butlerText);
const butlerChapters = parseChapters(butlerBody);
console.log(`  ${butlerChapters.length} chapters`);
butlerChapters.forEach(ch => console.log(`  Book ${ROMANS[ch.number]}: ${ch.paragraphs.length} paragraphs`));

const butlerJson = JSON.stringify({ chapters: butlerChapters }, null, 2);
fs.writeFileSync('src/data/editions/odyssey-original-en.json', butlerJson);
console.log(`  Saved odyssey-original-en.json (${(butlerJson.length / 1024).toFixed(0)} KB)\n`);

// Convert Pope (verse)
console.log('Converting Pope (verse)...');
const popeRaw = fs.readFileSync('data/pope.js', 'utf8');
const popeText = extractText(popeRaw);
const popeBody = stripGutenberg(popeText);
const popeChapters = parseChapters(popeBody);
console.log(`  ${popeChapters.length} chapters`);
popeChapters.forEach(ch => console.log(`  Book ${ROMANS[ch.number]}: ${ch.paragraphs.length} paragraphs`));

const popeJson = JSON.stringify({ chapters: popeChapters }, null, 2);
fs.writeFileSync('src/data/editions/odyssey-verse-en.json', popeJson);
console.log(`  Saved odyssey-verse-en.json (${(popeJson.length / 1024).toFixed(0)} KB)\n`);

// Print paragraph count comparison
console.log('=== Paragraph Count Comparison ===');
console.log('Chapter | Butler | Pope');
for (let i = 0; i < Math.max(butlerChapters.length, popeChapters.length); i++) {
  const b = butlerChapters[i];
  const p = popeChapters[i];
  const bCount = b ? b.paragraphs.length : '-';
  const pCount = p ? p.paragraphs.length : '-';
  const match = bCount === pCount ? '' : ' ← DIFFERENT';
  console.log(`  ${ROMANS[i + 1].padEnd(6)} | ${String(bCount).padEnd(6)} | ${pCount}${match}`);
}

console.log('\nDone! Butler and Pope converted to paragraph-array JSON.');
