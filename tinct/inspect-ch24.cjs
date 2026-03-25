const data = require('./src/data/editions/odyssey-original-en.json');
const ch24 = data.chapters.find(c => c.number === 24);
console.log('Chapter 24 title:', ch24.title);
console.log('Total paragraphs:', ch24.paragraphs.length);

// Show paragraphs 30-35 and last 5 to see where content ends
console.log('\nParagraphs 28-35:');
for (let i = 28; i < Math.min(35, ch24.paragraphs.length); i++) {
  console.log(`  [${i}]: ${ch24.paragraphs[i].substring(0, 120)}`);
}

console.log('\nLast 5 paragraphs:');
for (let i = ch24.paragraphs.length - 5; i < ch24.paragraphs.length; i++) {
  console.log(`  [${i}]: ${ch24.paragraphs[i].substring(0, 120)}`);
}

// Find where actual story content likely ends
for (let i = 0; i < ch24.paragraphs.length; i++) {
  const p = ch24.paragraphs[i].toLowerCase();
  if (p.includes('footnote') || p.includes('preparer') || p.includes('transcriber') || p.includes('[') || p.includes('page ') || /^\d+$/.test(p.trim())) {
    console.log(`\nPossible non-content at [${i}]: ${ch24.paragraphs[i].substring(0, 120)}`);
    if (i > 30) break;
  }
}
