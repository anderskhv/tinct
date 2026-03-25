#!/usr/bin/env node
/**
 * Generate AI editions for The Odyssey using Claude API.
 * Editions: modern-en, kids-en, modern-da, kids-da
 *
 * Reads from: src/data/editions/odyssey-original-en.json (Butler, paragraph arrays)
 * Outputs to: src/data/editions/odyssey-{edition}.json
 *
 * Each chapter is translated paragraph-by-paragraph to maintain alignment
 * with the source text for split-pane display.
 *
 * Usage: ANTHROPIC_API_KEY=sk-... node generate-editions.cjs [edition]
 *        e.g. node generate-editions.cjs modern-en
 *        or   node generate-editions.cjs          (all editions)
 */

const fs = require('fs');
const path = require('path');

process.chdir(path.dirname(process.argv[1]));

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable not set.');
  process.exit(1);
}

// Load source text (Butler prose)
const source = JSON.parse(fs.readFileSync('src/data/editions/odyssey-original-en.json', 'utf8'));
console.log(`Source: ${source.chapters.length} chapters loaded.\n`);

const EDITION_PROMPTS = {
  'modern-en': {
    system: `You are a literary translator. Rewrite the given text in clear, contemporary English. Modern vocabulary, natural dialogue, no archaisms. Keep all meaning, drama, and narrative detail. Write in flowing prose.`,
    instruction: `Rewrite this passage from Homer's Odyssey in modern English. CRITICAL: You will receive paragraphs separated by |||PARAGRAPH|||. You MUST return the EXACT same number of paragraphs, separated by |||PARAGRAPH|||. Each output paragraph corresponds to the same input paragraph. Do not merge, split, add, or remove paragraphs. Return ONLY the rewritten text with |||PARAGRAPH||| separators, nothing else.`,
  },
  'kids-en': {
    system: `You are a children's book author who makes classic literature accessible for ages 10-14. Simple, vivid language. Keep the excitement and adventure.`,
    instruction: `Rewrite this passage from Homer's Odyssey for young readers (ages 10-14). CRITICAL: You will receive paragraphs separated by |||PARAGRAPH|||. You MUST return the EXACT same number of paragraphs, separated by |||PARAGRAPH|||. Each output paragraph corresponds to the same input paragraph. Add brief explanations of mythology and ancient customs where needed. Return ONLY the rewritten text with |||PARAGRAPH||| separators, nothing else.`,
  },
  'modern-da': {
    system: `Du er en litterær oversætter. Omskriv den givne tekst til klart, moderne dansk. Moderne ordforråd, naturlig dialog, ingen arkaismer. Behold al mening, dramatik og narrativ detalje.`,
    instruction: `Oversæt denne passage fra Homers Odyssé til moderne dansk. VIGTIGT: Du modtager afsnit adskilt af |||PARAGRAPH|||. Du SKAL returnere det PRÆCIST samme antal afsnit, adskilt af |||PARAGRAPH|||. Hvert output-afsnit svarer til det samme input-afsnit. Du må ikke sammenlægge, opdele, tilføje eller fjerne afsnit. Returner KUN den oversatte tekst med |||PARAGRAPH||| separatorer, intet andet.`,
  },
  'kids-da': {
    system: `Du er en børnebogsforfatter der gør klassisk litteratur tilgængelig for børn i alderen 10-14 år. Enkelt, levende sprog. Behold spændingen og eventyret.`,
    instruction: `Oversæt denne passage fra Homers Odyssé til dansk for unge læsere (10-14 år). VIGTIGT: Du modtager afsnit adskilt af |||PARAGRAPH|||. Du SKAL returnere det PRÆCIST samme antal afsnit, adskilt af |||PARAGRAPH|||. Hvert output-afsnit svarer til det samme input-afsnit. Tilføj korte forklaringer af mytologi og antikke skikke hvor det er nødvendigt. Returner KUN den oversatte tekst med |||PARAGRAPH||| separatorer, intet andet.`,
  },
};

async function callClaude(system, userMessage, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600000); // 10 min timeout
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 16384,
          system,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.error) {
        if (data.error.type === 'overloaded_error' || data.error.type === 'rate_limit_error') {
          console.log(`    Rate limited (attempt ${attempt}/${retries}), waiting 30s...`);
          await new Promise(r => setTimeout(r, 30000));
          continue;
        }
        throw new Error(data.error.message);
      }
      const tokenCount = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
      return { text: data.content?.[0]?.text || '', tokenCount };
    } catch (e) {
      if (attempt < retries) {
        console.log(`    Attempt ${attempt} failed: ${e.message}. Retrying in 10s...`);
        await new Promise(r => setTimeout(r, 10000));
      } else {
        throw e;
      }
    }
  }
}

async function generateBatch(paragraphs, chapterTitle, editionKey, batchLabel) {
  const config = EDITION_PROMPTS[editionKey];
  const inputText = paragraphs.join('\n|||PARAGRAPH|||\n');
  const prompt = `${config.instruction}\n\nChapter: ${chapterTitle} (${batchLabel})\nExpected paragraph count: ${paragraphs.length}\n\n"""\n${inputText}\n"""`;
  const { text, tokenCount } = await callClaude(config.system, prompt);
  const outputParagraphs = text.split('|||PARAGRAPH|||').map(p => p.trim()).filter(p => p.length > 0);
  return { paragraphs: outputParagraphs, tokenCount };
}

const MAX_PARAGRAPHS_PER_BATCH = 25;

async function generateChapter(chapter, editionKey) {
  let allParagraphs = [];
  let totalTokens = 0;

  if (chapter.paragraphs.length <= MAX_PARAGRAPHS_PER_BATCH) {
    // Small enough for single call
    const result = await generateBatch(chapter.paragraphs, chapter.title, editionKey, 'full');
    allParagraphs = result.paragraphs;
    totalTokens = result.tokenCount;
  } else {
    // Split into batches
    const batches = [];
    for (let i = 0; i < chapter.paragraphs.length; i += MAX_PARAGRAPHS_PER_BATCH) {
      batches.push(chapter.paragraphs.slice(i, i + MAX_PARAGRAPHS_PER_BATCH));
    }
    console.log(`    Splitting into ${batches.length} batches: ${batches.map(b => b.length).join(' + ')} paragraphs`);

    for (let i = 0; i < batches.length; i++) {
      const label = `part ${i + 1}/${batches.length}`;
      console.log(`    Generating ${label} (${batches[i].length} paragraphs)...`);
      const result = await generateBatch(batches[i], chapter.title, editionKey, label);
      allParagraphs.push(...result.paragraphs);
      totalTokens += result.tokenCount;
      if (i < batches.length - 1) {
        await new Promise(r => setTimeout(r, 2000)); // pause between batches
      }
    }
  }

  const outputParagraphs = allParagraphs;

  // Validate paragraph count
  if (outputParagraphs.length !== chapter.paragraphs.length) {
    console.warn(`    WARNING: Expected ${chapter.paragraphs.length} paragraphs, got ${outputParagraphs.length}`);
  }

  return { paragraphs: outputParagraphs, tokenCount: totalTokens };
}

async function generateEdition(editionKey) {
  console.log(`=== Generating ${editionKey} ===\n`);

  const cacheDir = path.join('data', 'gen', editionKey);
  fs.mkdirSync(cacheDir, { recursive: true });

  const chapters = [];
  let totalTokens = 0;

  for (const srcChapter of source.chapters) {
    const cacheFile = path.join(cacheDir, `ch${srcChapter.number}.json`);

    // Resume from cache
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        if (cached.paragraphs && cached.paragraphs.length > 0) {
          console.log(`  Book ${srcChapter.number}: cached (${cached.paragraphs.length} paragraphs)`);
          chapters.push(cached);
          continue;
        }
      } catch { /* re-generate */ }
    }

    console.log(`  Book ${srcChapter.number}: generating (${srcChapter.paragraphs.length} paragraphs)...`);
    try {
      const { paragraphs, tokenCount } = await generateChapter(srcChapter, editionKey);
      totalTokens += tokenCount;

      const chapterData = {
        number: srcChapter.number,
        title: srcChapter.title,
        paragraphs,
      };

      // Cache individual chapter
      fs.writeFileSync(cacheFile, JSON.stringify(chapterData, null, 2));
      chapters.push(chapterData);
      console.log(`  Book ${srcChapter.number}: done (${paragraphs.length} paragraphs, ${tokenCount} tokens)`);

      // Rate limit protection
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`  Book ${srcChapter.number}: FAILED - ${e.message}`);
      console.error(`  Re-run to retry failed chapters.`);
      chapters.push({
        number: srcChapter.number,
        title: srcChapter.title,
        paragraphs: srcChapter.paragraphs.map(() => '[Generation failed. Re-run generate-editions.cjs to retry.]'),
      });
    }
  }

  // Write combined JSON
  const outputPath = `src/data/editions/odyssey-${editionKey}.json`;
  const json = JSON.stringify({ chapters }, null, 2);
  fs.writeFileSync(outputPath, json);
  const sizeKB = (json.length / 1024).toFixed(0);
  console.log(`\nSaved ${outputPath} (${sizeKB} KB, ${totalTokens} tokens)\n`);
}

// Validate paragraph alignment after generation
function validateAlignment(editionKey) {
  const editionPath = `src/data/editions/odyssey-${editionKey}.json`;
  const edition = JSON.parse(fs.readFileSync(editionPath, 'utf8'));
  let mismatches = 0;

  for (const ch of source.chapters) {
    const edCh = edition.chapters.find(c => c.number === ch.number);
    if (!edCh) {
      console.log(`  MISSING: Chapter ${ch.number}`);
      mismatches++;
      continue;
    }
    if (edCh.paragraphs.length !== ch.paragraphs.length) {
      console.log(`  MISMATCH Ch${ch.number}: source=${ch.paragraphs.length}, ${editionKey}=${edCh.paragraphs.length}`);
      mismatches++;
    }
  }

  if (mismatches === 0) {
    console.log(`  All ${source.chapters.length} chapters aligned.`);
  } else {
    console.log(`  ${mismatches} mismatches found.`);
  }
  return mismatches;
}

async function main() {
  const requestedEdition = process.argv[2];
  const editions = requestedEdition
    ? [requestedEdition]
    : Object.keys(EDITION_PROMPTS);

  for (const key of editions) {
    if (!EDITION_PROMPTS[key]) {
      console.error(`Unknown edition: ${key}. Options: ${Object.keys(EDITION_PROMPTS).join(', ')}`);
      process.exit(1);
    }
  }

  for (const key of editions) {
    await generateEdition(key);
  }

  console.log('=== Validation ===\n');
  for (const key of editions) {
    console.log(`${key}:`);
    validateAlignment(key);
    console.log('');
  }

  console.log('Done!');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
