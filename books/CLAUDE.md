# Book Factory — Tinct

This is the Book Factory for Tinct. When Anders opens Claude from this folder, he can say "add [book name]" and this CLAUDE.md guides the full pipeline from source text to finished, registered, audio-ready book.

**Parent project:** `../CLAUDE.md` (Tinct project CEO) — see it for overall context, design principles, and the API cost rule.

---

## HARD RULES

1. **ZERO Anthropic API spend.** All translations generated via CLI conversation. Never run scripts that call `api.anthropic.com`. See parent CLAUDE.md for full explanation.
2. **Always discuss structure BEFORE downloading.** Step 1 is mandatory and requires human approval.
3. **Maintain paragraph alignment** across all editions. Same number of paragraphs per chapter in every edition.
4. **Verify JSON validity** after every file write (`python3 -c "import json; json.load(open('file.json'))"`)
5. **No kids editions.** Standard set is: original-en, modern-en, modern-da. Special editions (verse-en, web-en) only when discussed.
6. **Track progress.** Large books take multiple sessions. Always update the progress tracker below.

---

## The Pipeline

### Step 1: Structure Discussion (ALWAYS first — requires approval)

Before downloading anything, discuss with Anders:

- **Chapter division:** How should the book be split? Examples:
  - Novel: existing chapter structure (Chapter 1, 2, 3...)
  - Epic poem: books/cantos (Book I, Book II...)
  - Bible: each biblical book = 1 chapter (66 total)
  - Play: acts and scenes
- **Hierarchical sections?** Some books need a section tree for the ToC:
  ```json
  "sections": [
    { "title": "Part One", "sections": [
      { "title": "Book One", "chapters": [1, 2, 3] }
    ]}
  ]
  ```
  Most novels don't need this. Bible, Divine Comedy, Canterbury Tales do.
- **Which editions?** Standard: original-en, modern-en, modern-da. Discuss extras:
  - `verse-en` — for books with a notable verse translation (like Pope's Odyssey)
  - `web-en` — for Bible (World English Bible, a modern public domain translation)
- **Paragraph grouping:** How should source text be chunked? For prose, natural paragraphs. For verse, stanzas or verse groups. For Bible, verse ranges.
- **Book metadata:** title, author, year, wordCount, coverColor, coverAccent, description

**NEVER proceed past this step without explicit approval from Anders.**

### Step 2: Download Source Text

- **Primary sources:** Project Gutenberg (gutenberg.org), Standard Ebooks (standardebooks.org), Internet Archive (archive.org)
- **Public domain only.** Check copyright status.
- Download the English original as plain text
- Save to `books/raw/{book-id}/raw.txt`
- Also save the source URL in `books/raw/{book-id}/SOURCE.md`

### Step 3: Parse into Edition JSON

Use the parse helper script or do it manually:

```bash
python3 books/parse-gutenberg.py books/raw/{book-id}/raw.txt --book-id {book-id} --output ../tinct/src/data/editions/{book-id}-original-en.json
```

Or for complex books, write a custom `parse.cjs` in the book's prep folder (like `books/war-and-peace/parse.cjs`).

**Target format:**
```json
{
  "chapters": [
    {
      "number": 1,
      "title": "Chapter Title",
      "paragraphs": ["First paragraph...", "Second paragraph..."]
    }
  ],
  "sections": []
}
```

The `sections` field is optional — only include for hierarchical books.

After writing, verify:
```bash
python3 -c "import json; d=json.load(open('file.json')); print(f'{len(d[\"chapters\"])} chapters, {sum(len(c[\"paragraphs\"]) for c in d[\"chapters\"])} paragraphs')"
```

### Step 4: Generate Translations (via CLI — ZERO API spend)

This is the most time-consuming step. For each chapter:

1. Read the original chapter text
2. Generate **modern-en**: Natural, contemporary English. Accessible but not dumbed down. Preserve the author's meaning and structure. Keep paragraph count identical.
3. Generate **modern-da**: Natural modern Danish. Same rules.
4. Write each edition to `../tinct/src/data/editions/{book-id}-{edition-key}.json`

**For large books (100+ chapters):** Work in batches. Do 5-10 chapters per session. Update the progress tracker after each batch.

**For very large books (War and Peace, Bible):** May need batch files: `{book-id}-modern-en-batch01.json` etc., later merged.

**Translation quality guidelines:**
- Modern English should read like a contemporary novel, not a Wikipedia summary
- Preserve dialogue, drama, humor, and emotional tone
- Keep proper nouns consistent across chapters
- Danish translations should feel native, not translated-from-English

### Step 5: Register in bookRegistry.ts

Add the book to `../tinct/src/data/bookRegistry.ts`:

```typescript
export const BOOK_NAME: Book = {
  id: 'book-id',
  title: 'Book Title',
  author: 'Author Name',
  description: 'One-sentence description.',
  year: 1900,
  wordCount: 100000,
  coverColor: '#hex',
  coverAccent: '#hex',
  editions: [
    { key: 'original-en', language: 'en', style: 'original', label: 'Label (Year)', translator: 'Name', year: 1900, aligned: true },
    { key: 'modern-en', language: 'en', style: 'modern', label: 'Modern English', aligned: true },
    { key: 'modern-da', language: 'da', style: 'modern', label: 'Moderne Dansk', aligned: true },
  ],
}
```

Add to the `BOOKS` array. Then verify: `cd ../tinct && npx tsc --noEmit`

### Step 6: Generate Audio (Edge TTS)

Uses free Microsoft Edge TTS voices. No API key needed.

**Generate audio:**
```bash
cd ../tinct/tts
python3 generate-audio-edge.py {book-id} {edition-key} {start_ch} {end_ch} --voice {voice}
```

**Common voices:**
| Voice | Language | Gender | Notes |
|-------|----------|--------|-------|
| `en-US-AriaNeural` | English | Female | Clear, warm — good default |
| `en-US-GuyNeural` | English | Male | Calm, natural |
| `en-GB-SoniaNeural` | English | Female | British accent |
| `en-GB-RyanNeural` | English | Male | British accent |
| `da-DK-ChristelNeural` | Danish | Female | Only Danish female option |
| `da-DK-JeppeNeural` | Danish | Male | Only Danish male option |

**Generate manifests (after audio):**
```bash
python3 generate-manifests-edge.py {book-id} {edition-key}
```

**Copy to public:**
```bash
cp -r audio/{book-id}/{edition-key} ../public/audio/{book-id}/{edition-key}
```

**Mark edition as audio-ready** in bookRegistry.ts: add `hasAudio: true` to the edition.

### Step 7: Visual QA

1. Start dev server: `cd ../tinct && npm run dev`
2. Open in browser
3. Select the new book
4. Navigate through every chapter in every edition
5. Verify: text renders, chapters load, edition switching works, split pane aligns
6. Check dark mode
7. Report any issues

---

## Reference Paths

| What | Path (relative to this folder) |
|------|------|
| Edition JSON files | `../tinct/src/data/editions/` |
| Book registry | `../tinct/src/data/bookRegistry.ts` |
| Type definitions | `../tinct/src/types/index.ts` |
| TTS generation script | `../tinct/tts/generate-audio-edge.py` |
| TTS manifest script | `../tinct/tts/generate-manifests-edge.py` |
| Generated audio (staging) | `../tinct/tts/audio/` |
| Public audio | `../tinct/public/audio/` |
| Raw source texts | `raw/` |
| Parse helper | `parse-gutenberg.py` |

---

## Edition JSON Format Reference

### Standard (flat chapters)
```json
{
  "chapters": [
    {
      "number": 1,
      "title": "Book I — Athena Inspires the Prince",
      "paragraphs": [
        "First paragraph text...",
        "Second paragraph text..."
      ]
    }
  ]
}
```

### Hierarchical (with sections)
```json
{
  "sections": [
    {
      "title": "Old Testament",
      "sections": [
        {
          "title": "The Pentateuch",
          "sections": [
            { "title": "Genesis", "chapters": [1] },
            { "title": "Exodus", "chapters": [2] }
          ]
        }
      ]
    }
  ],
  "chapters": [
    {
      "number": 1,
      "title": "Genesis",
      "section": "Old Testament — The Pentateuch",
      "paragraphs": ["..."]
    }
  ]
}
```

### Key rules
- `number` must be sequential starting from 1
- `paragraphs` is an array of strings — each string is one paragraph
- Paragraph count must match across all aligned editions
- `section` on a chapter is a display string for breadcrumbs (e.g., "Part One — Book Three")
- `sections` at the top level is the hierarchical ToC tree — `chapters` arrays reference chapter numbers

---

## Progress Tracker

Copy this template when starting a new book:

```markdown
## Current Book: [name]
**Book ID:** [id]
**Total chapters:** [n]
**Started:** [date]

### Pipeline
- [ ] Structure discussed and approved
- [ ] Source text downloaded
- [ ] Original parsed to JSON ([n] chapters, [n] paragraphs)
- [ ] Registered in bookRegistry.ts
- [ ] Modern English: 0/[n] chapters
- [ ] Modern Danish: 0/[n] chapters
- [ ] Audio generated (English)
- [ ] Audio generated (Danish)
- [ ] Audio manifests created
- [ ] Audio copied to public/
- [ ] Visual QA passed

### Session Log
| Date | What was done | Chapters completed |
|------|--------------|-------------------|
```

---

## Existing Books

| Book | ID | Chapters | Editions | Audio | Status |
|------|----|----------|----------|-------|--------|
| The Odyssey | `odyssey` | 24 | original-en, verse-en, modern-en, modern-da | modern-en, original-en | Complete |
| Ulysses | `ulysses` | 18 | original-en, modern-en, modern-da | — | Complete |
| War and Peace | `war-and-peace` | 239 | original-en, modern-en (in progress) | — | In progress |
