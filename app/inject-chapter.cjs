// Usage: node inject-chapter.cjs <chapter_number> <paragraphs_json_file>
// Reads the modern-en JSON, replaces paragraphs for the given chapter, writes back
const fs = require('fs');
const path = require('path');

const chapterNum = parseInt(process.argv[2]);
const paraFile = process.argv[3];

if (!chapterNum || !paraFile) {
  console.error('Usage: node inject-chapter.cjs <chapter_number> <paragraphs_json_file>');
  process.exit(1);
}

const outputPath = path.join(__dirname, 'src/data/editions/bible-modern-en.json');
const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

const paragraphs = JSON.parse(fs.readFileSync(paraFile, 'utf8'));

const chIdx = data.chapters.findIndex(ch => ch.number === chapterNum);
if (chIdx === -1) {
  console.error('Chapter not found:', chapterNum);
  process.exit(1);
}

// Verify paragraph count matches KJV
const kjvPath = path.join(__dirname, 'src/data/editions/bible-kjv-en.json');
const kjv = JSON.parse(fs.readFileSync(kjvPath, 'utf8'));
const kjvCh = kjv.chapters[chIdx];
if (paragraphs.length !== kjvCh.paragraphs.length) {
  console.error(`Paragraph count mismatch! KJV has ${kjvCh.paragraphs.length}, got ${paragraphs.length}`);
  process.exit(1);
}

data.chapters[chIdx].paragraphs = paragraphs;
fs.writeFileSync(outputPath, JSON.stringify(data));
console.log(`Injected ${paragraphs.length} paragraphs for chapter ${chapterNum} (${data.chapters[chIdx].title})`);
