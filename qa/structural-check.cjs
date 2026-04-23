/**
 * Tinct QA — Structural Check
 *
 * Validates all book editions for:
 * - Paragraph alignment (translations must match original paragraph count)
 * - Length ratios (flag suspiciously short/long translations)
 * - Empty content (empty paragraphs, chapters, missing chapters)
 * - Chapter count consistency across editions
 * - Missing edition files
 * - Encoding issues (mojibake, HTML entities, Gutenberg boilerplate)
 * - Duplicate content (consecutive identical paragraphs)
 *
 * Usage:
 *   node structural-check.cjs              # Check all books
 *   node structural-check.cjs --book odyssey  # Check single book
 *   node structural-check.cjs --verbose       # Show all paragraphs, not just issues
 */

const fs = require('fs');
const path = require('path');

const EDITIONS_DIR = path.join(__dirname, '..', 'app', 'public', 'data', 'editions');
const REPORTS_DIR = path.join(__dirname, 'reports');

// Book registry — must match app/src/data/bookRegistry.ts
const BOOKS = [
  { id: 'odyssey', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'flagship' },
  { id: 'ulysses', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'war-and-peace', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'bible', originalEdition: 'kjv-en', editions: ['kjv-en', 'web-en', 'modern-en', 'modern-da'], tier: 'flagship' },
  { id: 'gilgamesh', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'hamlet', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'flagship' },
  { id: 'macbeth', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'midsummer', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'romeo-and-juliet', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'the-tempest', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'the-art-of-war', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'pride-and-prejudice', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'flagship' },
  { id: 'crime-and-punishment', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'the-republic', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'meditations', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'flagship' },
  { id: 'divine-comedy', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'jane-eyre', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'the-aeneid', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'paradise-lost', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
  { id: 'frankenstein', originalEdition: 'original-en', editions: ['original-en', 'modern-en', 'modern-da'], tier: 'library' },
];

// Thresholds
const MIN_LENGTH_RATIO_VERSE = 0.30;  // Verse→prose compression expected — 30% is warning
const MIN_LENGTH_RATIO_PROSE = 0.40;  // Prose→prose < 40% is truncation — error, not warning
const MAX_LENGTH_RATIO = 3.00;  // Translation paragraph > 300% of original = suspiciously long
const MIN_PARAGRAPH_LENGTH = 10; // Characters — shorter than this is likely an error

// Books where verse→prose compression is expected (short paragraphs in translation are normal)
const VERSE_BOOKS = new Set([
  'hamlet', 'macbeth', 'midsummer', 'romeo-and-juliet', 'the-tempest',
  'paradise-lost', 'the-aeneid', 'divine-comedy', 'odyssey', 'gilgamesh',
]);

// Encoding/boilerplate patterns
const MOJIBAKE_PATTERNS = [
  /\xc3[\x80-\xbf]/,  // UTF-8 decoded as Latin-1
  /\xe2\x80[\x98\x99\x9c\x9d]/, // Smart quotes mangled
  /\xc2[^\s]/,        // Stray control chars from encoding issues
];
const GUTENBERG_PATTERNS = [
  /Project Gutenberg/i,
  /\*\*\* START OF/,
  /\*\*\* END OF/,
  /produced by/i,
  /distributed proofreading/i,
];
const HTML_ENTITY_PATTERN = /&(amp|lt|gt|quot|nbsp|mdash|ndash|rsquo|lsquo|rdquo|ldquo|hellip);/;

function loadEdition(bookId, editionKey) {
  const filePath = path.join(EDITIONS_DIR, `${bookId}-${editionKey}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return { _parseError: e.message };
  }
}

function checkBook(bookDef) {
  const issues = [];
  const editionsData = {};
  const editionsFound = [];
  const editionsMissing = [];
  const chapterCounts = {};

  // Load all editions
  for (const edKey of bookDef.editions) {
    const data = loadEdition(bookDef.id, edKey);
    if (!data) {
      editionsMissing.push(edKey);
      issues.push({ severity: 'error', check: 'missing-edition', edition: edKey, message: `Edition file missing: ${bookDef.id}-${edKey}.json` });
    } else if (data._parseError) {
      editionsMissing.push(edKey);
      issues.push({ severity: 'error', check: 'parse-error', edition: edKey, message: `JSON parse error: ${data._parseError}` });
    } else {
      editionsFound.push(edKey);
      editionsData[edKey] = data;
      chapterCounts[edKey] = data.chapters ? data.chapters.length : 0;
    }
  }

  // Check chapter count consistency
  const counts = Object.values(chapterCounts);
  if (counts.length > 1 && new Set(counts).size > 1) {
    issues.push({
      severity: 'error',
      check: 'chapter-count-mismatch',
      message: `Chapter counts differ across editions: ${JSON.stringify(chapterCounts)}`
    });
  }

  // Get original edition for comparison
  const original = editionsData[bookDef.originalEdition];
  if (!original) {
    issues.push({ severity: 'error', check: 'no-original', message: `Original edition (${bookDef.originalEdition}) not loaded — cannot compare translations` });
    return { status: 'fail', editionsFound, editionsMissing, chapterCounts, issues };
  }

  // Per-chapter, per-edition checks
  const isVerse = VERSE_BOOKS.has(bookDef.id);
  for (const edKey of editionsFound) {
    if (edKey === bookDef.originalEdition) {
      // Still check original for encoding/empty issues
      checkEditionContent(bookDef.id, edKey, editionsData[edKey], null, issues, isVerse);
    } else {
      checkEditionContent(bookDef.id, edKey, editionsData[edKey], original, issues, isVerse);
    }
  }

  // Determine status
  const hasErrors = issues.some(i => i.severity === 'error');
  const hasWarnings = issues.some(i => i.severity === 'warning');
  const status = hasErrors ? 'fail' : hasWarnings ? 'warn' : 'pass';

  return { status, editionsFound, editionsMissing, chapterCounts, issues, tier: bookDef.tier };
}

function checkEditionContent(bookId, editionKey, edition, original, issues, isVerse) {
  if (!edition.chapters || !Array.isArray(edition.chapters)) {
    issues.push({ severity: 'error', check: 'no-chapters', edition: editionKey, message: 'No chapters array found' });
    return;
  }

  for (let ci = 0; ci < edition.chapters.length; ci++) {
    const chapter = edition.chapters[ci];
    const chNum = chapter.number || ci + 1;

    // Empty chapter
    if (!chapter.paragraphs || chapter.paragraphs.length === 0) {
      issues.push({ severity: 'error', check: 'empty-chapter', edition: editionKey, chapter: chNum, message: `Chapter ${chNum} has no paragraphs` });
      continue;
    }

    // Paragraph alignment check (only for translations)
    if (original && original.chapters[ci]) {
      const origParaCount = original.chapters[ci].paragraphs.length;
      const transParaCount = chapter.paragraphs.length;
      if (origParaCount !== transParaCount) {
        issues.push({
          severity: 'error',
          check: 'paragraph-misalignment',
          edition: editionKey,
          chapter: chNum,
          message: `Paragraph count mismatch: original has ${origParaCount}, ${editionKey} has ${transParaCount}`
        });
      }
    }

    // Per-paragraph checks
    let prevParagraph = '';
    for (let pi = 0; pi < chapter.paragraphs.length; pi++) {
      const para = chapter.paragraphs[pi];
      const paraRef = `ch${chNum}/p${pi + 1}`;

      // Empty paragraph
      if (!para || para.trim().length === 0) {
        issues.push({ severity: 'warning', check: 'empty-paragraph', edition: editionKey, location: paraRef, message: 'Empty paragraph' });
        continue;
      }

      // Very short paragraph
      if (para.trim().length < MIN_PARAGRAPH_LENGTH) {
        issues.push({ severity: 'warning', check: 'short-paragraph', edition: editionKey, location: paraRef, message: `Very short paragraph (${para.trim().length} chars): "${para.trim()}"` });
      }

      // Duplicate consecutive paragraphs
      if (para === prevParagraph && para.length > 50) {
        issues.push({ severity: 'error', check: 'duplicate-paragraph', edition: editionKey, location: paraRef, message: `Duplicate of previous paragraph (${para.substring(0, 60)}...)` });
      }
      prevParagraph = para;

      // Length ratio check (only for translations, only if aligned)
      if (original && original.chapters[ci] && original.chapters[ci].paragraphs[pi]) {
        const origLen = original.chapters[ci].paragraphs[pi].length;
        const transLen = para.length;
        if (origLen > 0) {
          const ratio = transLen / origLen;
          const minRatio = isVerse ? MIN_LENGTH_RATIO_VERSE : MIN_LENGTH_RATIO_PROSE;
          if (ratio < minRatio) {
            // Prose truncation below 40% is an error (real content loss).
            // Verse compression below 30% is a warning (expected for verse→prose).
            const severity = isVerse ? 'warning' : 'error';
            const label = isVerse ? 'Possibly compressed (verse→prose)' : 'Likely truncated (prose→prose)';
            issues.push({
              severity,
              check: 'length-ratio-low',
              edition: editionKey,
              location: paraRef,
              message: `Translation is ${Math.round(ratio * 100)}% of original length (${transLen} vs ${origLen} chars). ${label}.`,
              preview: para.substring(0, 80)
            });
          } else if (ratio > MAX_LENGTH_RATIO) {
            issues.push({
              severity: 'warning',
              check: 'length-ratio-high',
              edition: editionKey,
              location: paraRef,
              message: `Translation is ${Math.round(ratio * 100)}% of original length (${transLen} vs ${origLen} chars). Possibly hallucinated content.`,
              preview: para.substring(0, 80)
            });
          }
        }
      }

      // Encoding issues
      for (const pattern of MOJIBAKE_PATTERNS) {
        if (pattern.test(para)) {
          issues.push({ severity: 'error', check: 'mojibake', edition: editionKey, location: paraRef, message: `Possible encoding issue (mojibake)`, preview: para.substring(0, 80) });
          break;
        }
      }

      // HTML entities
      if (HTML_ENTITY_PATTERN.test(para)) {
        issues.push({ severity: 'warning', check: 'html-entities', edition: editionKey, location: paraRef, message: `Raw HTML entities found`, preview: para.substring(0, 80) });
      }

      // Gutenberg boilerplate
      for (const pattern of GUTENBERG_PATTERNS) {
        if (pattern.test(para)) {
          issues.push({ severity: 'warning', check: 'gutenberg-boilerplate', edition: editionKey, location: paraRef, message: `Possible Gutenberg boilerplate`, preview: para.substring(0, 80) });
          break;
        }
      }
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const bookFilter = args.includes('--book') ? args[args.indexOf('--book') + 1] : null;
  const verbose = args.includes('--verbose');

  const booksToCheck = bookFilter ? BOOKS.filter(b => b.id === bookFilter) : BOOKS;

  if (bookFilter && booksToCheck.length === 0) {
    console.error(`Unknown book: ${bookFilter}`);
    console.error(`Available: ${BOOKS.map(b => b.id).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n  Tinct QA — Structural Check`);
  console.log(`  ${new Date().toISOString()}`);
  console.log(`  Checking ${booksToCheck.length} book(s)...\n`);

  const report = {
    timestamp: new Date().toISOString(),
    summary: { total_books: booksToCheck.length, passed: 0, warnings: 0, failed: 0 },
    books: {}
  };

  for (const bookDef of booksToCheck) {
    const result = checkBook(bookDef);
    report.books[bookDef.id] = result;

    if (result.status === 'pass') report.summary.passed++;
    else if (result.status === 'warn') report.summary.warnings++;
    else report.summary.failed++;

    // Console output
    const icon = result.status === 'pass' ? 'PASS' : result.status === 'warn' ? 'WARN' : 'FAIL';
    const tierLabel = `[${result.tier}]`;
    console.log(`  ${icon}  ${bookDef.id} ${tierLabel}`);
    console.log(`       Editions: ${result.editionsFound.join(', ')}${result.editionsMissing.length ? ` | Missing: ${result.editionsMissing.join(', ')}` : ''}`);
    console.log(`       Chapters: ${JSON.stringify(result.chapterCounts)}`);

    if (result.issues.length > 0) {
      const errors = result.issues.filter(i => i.severity === 'error');
      const warnings = result.issues.filter(i => i.severity === 'warning');
      console.log(`       Issues: ${errors.length} errors, ${warnings.length} warnings`);

      // Show errors always, warnings if verbose or few
      const toShow = verbose ? result.issues : errors.concat(warnings.length <= 5 ? warnings : []);
      for (const issue of toShow) {
        const loc = issue.location ? ` [${issue.location}]` : '';
        const ed = issue.edition ? ` (${issue.edition})` : '';
        console.log(`         ${issue.severity === 'error' ? 'ERR' : 'WRN'} ${issue.check}${ed}${loc}: ${issue.message}`);
        if (issue.preview) {
          console.log(`             "${issue.preview}..."`);
        }
      }
      if (!verbose && warnings.length > 5) {
        console.log(`         ... and ${warnings.length - 5} more warnings (use --verbose to see all)`);
      }
    } else {
      console.log(`       No issues found`);
    }
    console.log();
  }

  // Summary
  console.log(`  ─────────────────────────────────`);
  console.log(`  Summary: ${report.summary.passed} passed, ${report.summary.warnings} warnings, ${report.summary.failed} failed`);
  console.log();

  // Write JSON report
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(REPORTS_DIR, 'structural-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`  Report saved to: ${reportPath}\n`);
}

main();
