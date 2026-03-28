# Book Factory — Tinct

This is the Book Factory for Tinct. When Anders opens Claude from this folder, he can say "add [book name]" and this CLAUDE.md guides the full pipeline from source text to finished, registered, audio-ready book.

**Parent project:** `../CLAUDE.md` (Tinct project CEO) — see it for overall context, design principles, and the API cost rule.

---

## Permissions & Paths

The Tinct project settings (`.claude/settings.json`) already allow `python3`, `cp`, `mkdir`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, and git commands. No special flags needed when launching from this folder.

**Always use absolute paths** instead of `cd`. The working directory is `/Users/andershvelplund/Documents/Projects/Tinct/books`. Key absolute paths:
- TTS script: `/Users/andershvelplund/Documents/Projects/Tinct/tinct/tts/generate-audio-edge.py`
- Manifest script: `/Users/andershvelplund/Documents/Projects/Tinct/tinct/tts/generate-manifests-edge.py`
- Edition files: `/Users/andershvelplund/Documents/Projects/Tinct/tinct/public/data/editions/`
- Public audio: `/Users/andershvelplund/Documents/Projects/Tinct/tinct/public/audio/`
- Staging audio: `/Users/andershvelplund/Documents/Projects/Tinct/tinct/tts/audio/`

---

## HARD RULES

1. **ZERO Anthropic API spend.** All translations generated via CLI conversation. Never run scripts that call `api.anthropic.com`. See parent CLAUDE.md for full explanation.
2. **Always discuss structure BEFORE downloading.** Step 1 is mandatory and requires human approval.
3. **Maintain paragraph alignment** across all editions. Same number of paragraphs per chapter in every edition.
4. **Verify JSON validity** after every file write (`python3 -c "import json; json.load(open('file.json'))"`)
5. **No kids editions.** Standard set is: original-en, modern-en, modern-da. Special editions (verse-en, web-en) only when discussed.
6. **Track progress.** Large books take multiple sessions. Always update the progress tracker below.
7. **Never flag scale as a problem.** Don't say "this is a huge task" or "this will be very difficult." Break every task into agent-sized chunks and execute. The architecture handles scale — just decompose and go.
8. **Use parallel agents.** Translations, audio generation, and threads are independent per book×language. Spin up background agents for each chunk. Typical agent unit = 1 book × 1 language × 10-20 chapters.
9. **Agent permissions.** Agents must use the Read tool (not Bash/python3) to read source JSON files, and the Write tool to write output JSON files. Do NOT use Bash heredocs (`python3 << 'EOF'`) — they may not match permission patterns. Use `python3 -c "..."` for validation only.
10. **Self-direct on bottlenecks.** While a conversation is open, continuously monitor what's blocked and what can be unblocked. After completing any task or while waiting for a background process, immediately ask: "What is the current bottleneck? Can I start working on it now?" Don't wait for Anders to notice or ask — proactively identify the next constraint, communicate what you're doing, and start. If multiple things are blocked, work the dependency chain: unblock translations before audio, unblock parsing before translations. If you launched an agent that failed, retry with a different approach immediately — don't wait for the next prompt.
11. **Never stop on permission failures.** If a tool call is denied or a permission error blocks progress, do NOT give up and report "I need permission." Instead: (a) try an alternative tool that achieves the same result (e.g., Read/Write instead of Bash, or `python3 -c` instead of a script), (b) restructure the approach to avoid the blocked tool, (c) if truly stuck after 2 alternative attempts, explain to Anders what you tried, what failed, and ask him to grant the specific permission or suggest a workaround. The same applies to subagents — if an agent can't use Bash, it should use Read/Write/Glob/Grep tools instead, not stop and report failure.
12. **Bible translation: fresh conversation required.** Both subagents and bloated main conversations hit Anthropic's content filter on Bible text. The filter triggers when accumulated context + output is too large. **Start a dedicated fresh conversation** for Bible translation work — open Claude from the `books/` folder and say "continue Bible modern-da translation." Process one book at a time: read source → translate → write into `bible-modern-da.json` → validate → next book. For large books (100+ paragraphs): read source in 50-paragraph chunks. When context gets large, start a new conversation.
13. **Update status before ending.** Before ending any session that generated content (translations, audio, threads), run `python3 check-status.py` and update the Current Status table at the bottom of this file to match. This has caused major confusion — the status table said Bible modern-en was 12/66 when it was actually 66/66 complete.

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
python3 books/parse-gutenberg.py books/raw/{book-id}/raw.txt --book-id {book-id} --output ../app/src/data/editions/{book-id}-original-en.json
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

### Step 3b: Source Text Quality Check (MANDATORY before translations)

Before generating any translations or audio, run a quality check on the parsed original text. Gutenberg texts often contain artifacts: page numbers, printer marks, OCR errors, repeated headers, or metadata that leaked into the body text. These errors propagate into every translation and every audio file, making them expensive to fix later.

**Checks to run:**
```python
import json, re
d = json.load(open('{book-id}-original-en.json'))
for ch in d['chapters']:
    for i, p in enumerate(ch['paragraphs']):
        # 1. Stray numbers (page/line numbers from Gutenberg)
        nums = re.findall(r'(?:^|\s)(\d{1,5})(?:\s|$)', p)
        if nums:
            print(f'STRAY NUMBER ch{ch["number"]}/p{i}: {nums}')
        # 2. Gutenberg boilerplate
        if any(x in p.lower() for x in ['project gutenberg', 'end of the project', 'small print', 'public domain']):
            print(f'BOILERPLATE ch{ch["number"]}/p{i}')
        # 3. Very short paragraphs that might be artifacts
        if len(p.strip()) < 10 and not p.strip() == '':
            print(f'SHORT ch{ch["number"]}/p{i}: "{p.strip()}"')
        # 4. Repeated content (headers leaking in)
        if p.strip() == ch.get('title', ''):
            print(f'TITLE REPEAT ch{ch["number"]}/p{i}')
```

**Fix any issues found before proceeding to Step 4.** Every error in the original cascades into 2+ translations and 3+ audio editions.

**Lesson learned (Odyssey, March 2026):** 9 Gutenberg page numbers leaked into `odyssey-original-en.json`, propagated into audio, and required per-paragraph audio regeneration to fix.

### Step 4: Generate Translations (via CLI — ZERO API spend)

This is the most time-consuming step. For each chapter:

1. Read the original chapter text
2. Generate **modern-en**: Natural, contemporary English. Accessible but not dumbed down. Preserve the author's meaning and structure. Keep paragraph count identical.
3. Generate **modern-da** (and any future non-English languages): Translate from **modern-en**, NOT from original-en. The modern English edition is the source for all non-English translations. This prevents archaic phrasing, Victorian sentence structures, and wrong name conventions from leaking through.
4. Write each edition to `../app/public/data/editions/{book-id}-{edition-key}.json`

**Sentence length rule:** Target max ~25 words per sentence in modern editions. Break long sentences at natural clause boundaries. The whole point of modern editions is readability — a 60-word sentence defeats the purpose. Prefer two clear sentences over one complex one.

**Model tiering (token budget optimization):**
- **Modern English:** Two-pass — Sonnet generates (`claude --model sonnet`), then Opus reviews and corrects. English is the primary reading experience and warrants the Opus quality check.
- **Modern Danish (and any future languages):** Two-pass — Sonnet generates, Sonnet reviews in a fresh pass. Two different passes catch attention errors (wrong word sense, register drift, compound words) without the Opus token cost.
- **Review pass instructions:** Read the source text and the first-pass translation together. Fix: wrong word sense, register drift, unnatural phrasing, translationese, dropped/wrong verb prefixes, invented compounds. Preserve paragraph alignment. Only output corrected paragraphs — skip paragraphs that need no changes.
- **Reserve Opus for:** writing (books), architectural decisions, complex debugging. Not bulk translation.

**For large books (100+ chapters):** Work in batches. Do 5-10 chapters per session. Update the progress tracker after each batch.

**For very large books (War and Peace, Bible):** May need batch files: `{book-id}-modern-en-batch01.json` etc., later merged.

**Translation quality guidelines:**
- Modern English should read like a contemporary novel, not a Wikipedia summary
- Preserve dialogue, drama, humor, and emotional tone
- Keep proper nouns consistent across chapters
- **All non-English translations: translate the MEANING, not the words.** Claude's default behavior is "translationese" — mapping English words to target-language cognates instead of expressing the meaning naturally. This produces text that looks correct but reads wrong to native speakers. Specific pitfalls:
  - **False cognates / wrong register:** Don't pick the cognate — pick the word a native speaker would use in context. Example (Danish): "guilds" meaning groups → "grupper" or "hold", NOT "gilder" (archaic/wrong context)
  - **Dropped/wrong verb prefixes:** Many languages have essential verb prefixes. Don't truncate them. Example (Danish): "forankrede" NOT "ankrede" (not a word)
  - **English grammar leaking through:** Article placement, word order, preposition choice must follow target language patterns, not English. Example (Danish): "skibet" NOT "der skib"
  - **Invented compound words:** Don't create plausible-looking but non-existent words. If unsure, use a simpler phrasing
- **Quality check:** After generating any non-English translation, re-read the output asking: "Would a native speaker of this language actually write it this way?" If a phrase sounds like translated English, rewrite it
- **Character name consistency across editions and cast.** All modern translations (every language) must use the same character names as the Threads/Cast feature. Original editions keep their own names (e.g., Butler's Odyssey uses "Ulysses"), but all modern editions and the cast must align. For Greek works: use Greek names (Odysseus, Athena, Poseidon, Zeus, Hermes), not Roman (Ulysses, Minerva, Neptune, Jupiter, Mercury). For Russian works: use consistent transliterations across all editions. When in doubt, the threads JSON file is the authority for character names.

**Reader aids in parentheses (name clarifications):**
- On **first occurrence per chapter only**, clarify non-obvious name variants in parentheses
- **Do clarify:** diminutives → full name ("Natashka (Natasha)"), patronymic-only → first name ("Ilyinichna (Natasha's mother)"), ambiguous titles ("the old count (Count Rostov)"), epithets → name ("the grey-eyed goddess (Athena)"), name changes ("Abram (later Abraham)", "Simon (later called Peter)")
- **Don't clarify:** obvious first name ↔ surname pairs where context is clear, names already established earlier in the same chapter
- **Keep it short:** just the name — `(Natasha)` not `(this is the diminutive form of Natalia Rostova)`
- **Format:** simple parenthetical inline. No brackets, no footnotes, no italics
- This applies to all modern editions (EN and DA). Original editions are never modified.

### Step 5: Register in bookRegistry.ts

Add the book to `../app/src/data/bookRegistry.ts`:

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
cd ../app/tts
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

**Chapter titles in audio:** Every audiobook must include chapter title audio. When the reader transitions to a new chapter, the title should be read aloud before the chapter text begins. Generate a separate audio file for each chapter title (e.g., `ch{N}/title.mp3`) using the same voice as the chapter text. Include the title file in the manifest so the player knows to play it first. This applies to ALL books, ALL editions with audio.

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

### Step 8: Publish (autonomous — no approval needed)

When a book is **fully complete**, publish it immediately. Do not ask Anders. A book is fully complete when ALL of the following are true:

- [ ] All 3 standard editions exist and are paragraph-aligned (original-en, modern-en, modern-da)
- [ ] All editions have audio generated, manifests created, and copied to `public/audio/`
- [ ] Book is registered in `bookRegistry.ts` with all editions and `hasAudio: true`
- [ ] Threads file exists with characters
- [ ] Visual QA passed (Step 7)

**Publish sequence:**
```bash
cd /Users/andershvelplund/Documents/Projects/Tinct/app

# 1. Build
npx vite build

# 2. Verify build passes
echo "BUILD: $?"

# 3. Commit all new/changed files for this book
git add src/data/editions/{book-id}-*.json
git add src/data/editions/{book-id}-threads.json
git add src/data/bookRegistry.ts
git add public/audio/{book-id}/
git commit -m "Add {book title} to library (all editions + audio + threads)"

# 4. Deploy
npx wrangler deploy

# 5. Verify production
curl -s https://tinct.ahvelplund.workers.dev/ | head -5
```

**Policy:** Never publish a partially complete book. A book with modern-en but no modern-da is NOT ready. A book with editions but no audio is NOT ready. The reader should never encounter a book that's missing pieces.

**After publishing:** Update the Current Status table in this file to mark the book as Complete across all columns.

---

### Pipeline: Add a New Language (across existing books)

When adding a language (e.g., Spanish) to all books that already have original-en parsed:

1. For each book, generate `{book-id}-modern-{lang}.json` — run as parallel agents (one per book)
2. Add edition entry to each book in `bookRegistry.ts`
3. Generate audio for each book×language (parallel agents)
4. Update audio manifests and copy to public/
5. Visual QA

This skips Steps 1-3 of the main pipeline since the original is already parsed.

### Agent Chunking for Translations

Each translation agent handles one self-contained batch:
- **Small books (< 30 chapters):** 1 agent = entire book
- **Medium books (30-100 chapters):** 1 agent = 20-30 chapters
- **Large books (100+ chapters):** 1 agent = 10-15 chapters

All agents for a book×language can run in parallel. All book×language pairs are independent.

```
Example: "Add Spanish to everything"
→ Agent 1: odyssey modern-es ch1-24 (all)
→ Agent 2: ulysses modern-es ch1-18 (all)
→ Agent 3: war-and-peace modern-es ch1-15
→ Agent 4: war-and-peace modern-es ch16-30
→ ... (etc)
→ Agent N: bible modern-es ch60-66
All run in parallel.
```

---

## Status Format

When Anders asks for "status" / "overview" / "where are we", present a **single table**:

| Book | Editions | Modern EN | Modern DA | Audio | Threads |
|------|----------|-----------|-----------|-------|---------|

- **Editions complete = 3** (original + modern-en + modern-da). Bonus editions (verse-en, web-en, kjv-en) don't change the threshold.
- Every cell: **Complete** or **Not complete** (with short note on gap).
- As more languages are added, add columns.

---

## Target Library

Books to add (from STRATEGY.md / BACKLOG.md). No fixed order — follows the fun criterion:

| # | Book | Author | Era | Notes |
|---|------|--------|-----|-------|
| 1 | The Odyssey | Homer | ~800 BC | **Done** |
| 2 | Ulysses | James Joyce | 1922 | **Done** |
| 3 | War and Peace | Leo Tolstoy | 1869 | **In progress** |
| 4 | The Bible | Various | — | **In progress** |
| 5 | Inferno (or full Divine Comedy) | Dante | 1320 | Hierarchical sections needed |
| 6 | Crime and Punishment (or Brothers Karamazov) | Dostoevsky | 1866/1880 | TBD which one |
| 7 | Pride and Prejudice | Jane Austen | 1813 | |
| 8 | The Republic | Plato | ~380 BC | Philosophical text |
| 9 | Hamlet (or Macbeth) | Shakespeare | ~1600 | Play format |
| 10 | Jane Eyre (or Wuthering Heights) | Brontë | 1847/1847 | TBD which one |
| 11 | The Aeneid | Virgil | ~19 BC | From canon suggestion |
| 12 | Paradise Lost | Milton | 1667 | Epic poem |

Target: 10-20 books total. List is not locked — Anders decides.

---

## Reference Paths

| What | Path (relative to this folder) |
|------|------|
| Edition JSON files | `../app/public/data/editions/` |
| Book registry | `../app/src/data/bookRegistry.ts` |
| Type definitions | `../app/src/types/index.ts` |
| TTS generation script | `../app/tts/generate-audio-edge.py` |
| TTS manifest script | `../app/tts/generate-manifests-edge.py` |
| Generated audio (staging) | `../app/tts/audio/` |
| Public audio | `../app/public/audio/` |
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

## Current Status

**Last verified:** 2026-03-28 via `python3 check-status.py`
**To refresh:** Run `python3 check-status.py` from this folder. Always trust the script over this table.

| Book | Editions | Modern EN | Modern DA | Audio (staging) | Audio (public/R2) | Threads |
|------|----------|-----------|-----------|-----------------|-------------------|---------|
| **Odyssey** (24 ch) | Complete (4: original, verse, modern-en, modern-da) | Complete | Complete | Complete (all 4 editions, 24 ch each) | On R2 (not in public/) | 26 chars |
| **Ulysses** (18 ch) | Complete (3: original, modern-en, modern-da) | Complete | Complete | Complete (all 3 editions, 18 ch each) | On R2 (not in public/) | 20 chars |
| **W&P** (365 ch) | Complete (3: original, modern-en, modern-da) | Complete | Complete | modern-en: 365, modern-da: 51, original-en: 113 | modern-en: 365, modern-da: 40 | 30 chars |
| **Bible** (66 ch) | 3 originals (kjv, web, modern-en) + modern-da partial | Complete (66/66) | 4/66 (Gen, Prov, Eccl, Song) | None | None | None |

### What's left to do

| Task | Status | Notes |
|------|--------|-------|
| Bible modern-da translation | 4/66 books done | Biggest remaining effort. Fresh conversations from books/ folder. |
| Bible modern-en audio | Not started | All 66 books ready for TTS generation |
| Bible modern-da audio | Blocked | Needs modern-da translations first |
| Bible threads | Not started | Need character list |
| W&P modern-da audio | 51/365 in staging, 40 in public | Need to complete remaining 314 chapters |
| W&P original-en audio | 113/365 in staging | Not published, not marked hasAudio |

### Bible translation session instructions (modern-da)
To continue, start a fresh conversation from `books/` and say "continue Bible modern-da translation." The CEO will:
1. Run `python3 check-status.py` or read `bible-modern-da.json` to check which books have content
2. Pick the next untranslated book
3. Read modern-en source, translate to modern Danish, write paragraphs directly into the main file
4. Validate paragraph count matches modern-en source
5. Repeat until context gets large, then start a new conversation
6. **Before ending:** run `python3 check-status.py` and update this status table

**Important:** Edition files are at `public/data/editions/`, NOT `src/data/editions/`.
