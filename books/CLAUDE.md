# Book Factory — Tinct

This is the Book Factory for Tinct. When Anders opens Claude from this folder, he can say "add [book name]" and this CLAUDE.md guides the full pipeline from source text to finished, registered, audio-ready book.

**Parent project:** `../CLAUDE.md` (Tinct project CEO) — see it for overall context, design principles, and the API cost rule.

---

## Permissions & Paths

The Tinct project settings (`.claude/settings.json`) already allow `python3`, `cp`, `mkdir`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, and git commands. No special flags needed when launching from this folder.

**Always use absolute paths** instead of `cd`. The working directory is `/Users/andershvelplund/Documents/Projects/Tinct/books`. Key absolute paths:
- TTS script (Kokoro, for ALL English audio): `/Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-audio-kokoro.py`
- TTS script (Edge, for Danish audio ONLY): `/Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-audio-edge.py`
- TTS script (Kokoro, Odyssey-only legacy): `/Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-odyssey-audio.py`
- Manifest script: `/Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-manifests-edge.py`
- Edition files: `/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions/`
- Public audio: `/Users/andershvelplund/Documents/Projects/Tinct/app/public/audio/`
- Staging audio: `/Users/andershvelplund/Documents/Projects/Tinct/app/tts/audio/`

---

## HARD RULES

1. **ZERO Anthropic API spend.** All translations generated via CLI conversation. Never run scripts that call `api.anthropic.com`. See parent CLAUDE.md for full explanation.
2. **Always discuss structure BEFORE downloading.** Step 1 is mandatory and requires human approval.
3. **Maintain paragraph alignment** across all editions. Same number of paragraphs per chapter in every edition.
4. **Verify JSON validity** after every file write (`python3 -c "import json; json.load(open('file.json'))"`)
5. **No kids editions.** Standard text set is: original-en, modern-en, modern-da. Special editions (verse-en, web-en) only when discussed. Audio is English-only (see rule 14).
6. **Track progress.** Large books take multiple sessions. Always update the progress tracker below.
7. **Never flag scale as a problem.** Don't say "this is a huge task" or "this will be very difficult." Break every task into agent-sized chunks and execute. The architecture handles scale — just decompose and go.
8. **Use parallel agents.** Translations, audio generation, and threads are independent per book×language. Spin up background agents for each chunk. Typical agent unit = 1 book × 1 language × 10-20 chapters.
9. **Agent permissions.** Agents must use the Read tool (not Bash/python3) to read source JSON files, and the Write tool to write output JSON files. Do NOT use Bash heredocs (`python3 << 'EOF'`) — they may not match permission patterns. Use `python3 -c "..."` for validation only.
9b. **Avoid security prompt triggers.** Three patterns cause hardcoded security warnings that Anders must manually approve — avoid all of them:
   - **`cd <path> && git ...`** — use `git -C <path> ...` instead.
   - **Multiline Bash with `#` comments** — strips comments from inline Python, or use the Write tool to create a `/tmp/script.py` file then `python3 /tmp/script.py` via Bash.
   - **Heredocs (`cat << 'EOF'`)** — use the Write tool to create the file, then Bash to run it. Two tool calls, zero prompts.
10. **Self-direct on bottlenecks.** While a conversation is open, continuously monitor what's blocked and what can be unblocked. After completing any task or while waiting for a background process, immediately ask: "What is the current bottleneck? Can I start working on it now?" Don't wait for Anders to notice or ask — proactively identify the next constraint, communicate what you're doing, and start. If multiple things are blocked, work the dependency chain: unblock translations before audio, unblock parsing before translations. If you launched an agent that failed, retry with a different approach immediately — don't wait for the next prompt.
11. **Never stop on permission failures.** If a tool call is denied or a permission error blocks progress, do NOT give up and report "I need permission." Instead: (a) try an alternative tool that achieves the same result (e.g., Read/Write instead of Bash, or `python3 -c` instead of a script), (b) restructure the approach to avoid the blocked tool, (c) if truly stuck after 2 alternative attempts, explain to Anders what you tried, what failed, and ask him to grant the specific permission or suggest a workaround. The same applies to subagents — if an agent can't use Bash, it should use Read/Write/Glob/Grep tools instead, not stop and report failure.
12. **Bible translation: fresh conversation required.** Both subagents and bloated main conversations hit Anthropic's content filter on Bible text. The filter triggers when accumulated context + output is too large. **Start a dedicated fresh conversation** for Bible translation work — open Claude from the `books/` folder and say "continue Bible modern-da translation." Process one book at a time: read source → translate → write into `bible-modern-da.json` → validate → next book. For large books (100+ paragraphs): read source in 50-paragraph chunks. When context gets large, start a new conversation.
13. **Update status before ending.** Before ending any session that generated content (translations, audio, threads), run `python3 check-status.py` and update the Current Status table at the bottom of this file to match. This has caused major confusion — the status table said Bible modern-en was 12/66 when it was actually 66/66 complete.
14. **Audio engine rules — NEVER MIX THESE UP.**
    - **English audio → Kokoro** (`generate-audio-kokoro.py`). NEVER use Edge TTS for English.
    - **Danish audio → Edge TTS** (`generate-audio-edge.py` with `--voice da-DK-ChristelNeural` and rate `-8%`). Kokoro does not support Danish.
    - This mistake was made once and affected 8 books. Do not repeat it.

---

## The Pipeline

The pipeline is fully automated after Step 1. Anders says "add [book name]", approves the structure in Step 1, then everything runs without stops through to publication.

### Step 1: Structure Discussion (REQUIRES approval — the ONLY manual stop)

Before downloading anything, discuss with Anders:

- **Chapter division:** Novel = chapters. Epic = books/cantos. Bible = biblical books. Play = acts/scenes.
- **Hierarchical sections?** Most novels: no. Bible, Divine Comedy, Canterbury Tales: yes.
- **Which editions?** Standard: original-en, modern-en, modern-da. Discuss extras (verse-en, web-en).
- **Paragraph grouping:** Prose = natural paragraphs. Verse = stanzas. Bible = verse ranges.
- **Book metadata:** title, author, year, wordCount, coverColor, coverAccent, description

**After approval, everything through Step 6 runs without stopping.**

### Step 2: Download & Parse Source Text (automated)

1. Download English original from Project Gutenberg / Standard Ebooks / Internet Archive (public domain only)
2. Save to `books/raw/{book-id}/raw.txt` and source URL to `books/raw/{book-id}/SOURCE.md`
3. Parse into edition JSON at `../app/public/data/editions/{book-id}-original-en.json`
4. Validate: `python3 -c "import json; d=json.load(open('file.json')); print(f'{len(d[\"chapters\"])} chapters, {sum(len(c[\"paragraphs\"]) for c in d[\"chapters\"])} paragraphs')"`
5. Run source quality check (stray numbers, Gutenberg boilerplate, short paragraphs, title repeats) — fix any issues found

**Target format:**
```json
{
  "chapters": [
    { "number": 1, "title": "Chapter Title", "paragraphs": ["First paragraph...", "Second..."] }
  ],
  "sections": []
}
```

### Step 3: Generate Modern English + QA (automated)

Translate original → modern-en via CLI conversation. ZERO API spend.

- Natural, contemporary English. Accessible but not dumbed down.
- Paragraph count must match original exactly.
- Sentence length: target max ~25 words. Break long sentences at natural clause boundaries.
- Two-pass: Sonnet generates, Opus reviews and corrects.
- Write to `../app/public/data/editions/{book-id}-modern-en.json`

**Modern English QA (automated, mandatory — this edition is the foundation for everything else):**

After generating modern-en, run these checks before proceeding:

1. **Paragraph alignment:** Verify every chapter has identical paragraph count to original-en.
   ```python
   orig = json.load(open('{book-id}-original-en.json'))
   mod = json.load(open('{book-id}-modern-en.json'))
   for o, m in zip(orig['chapters'], mod['chapters']):
       if len(o['paragraphs']) != len(m['paragraphs']):
           print(f"MISMATCH ch{o['number']}: orig={len(o['paragraphs'])} modern={len(m['paragraphs'])}")
   ```
2. **Empty/stub paragraphs:** Flag any paragraph under 20 characters (likely a generation failure).
3. **Name consistency:** Extract all proper nouns from ch1 and ch_last. Verify the same characters use the same names throughout (no mid-book switches between e.g., "Natasha" and "Natalya").
4. **Sentence length audit:** Sample 5 random chapters, check average sentence length stays under 25 words. Flag any sentence over 50 words.
5. **Spot-read:** Read the first 3 paragraphs of chapters 1, middle, and last. Do they read like a contemporary novel or a Wikipedia summary? If the latter, rewrite.

**If any QA check fails, fix before proceeding.** Modern-en errors cascade into Danish translation and audio.

### Step 4: Generate English Audio (automated)

Run immediately after modern-en QA passes.

```bash
python3 /Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-odyssey-audio.py {book-id} modern-en 1 {end_ch}
python3 /Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-manifests-edge.py {book-id} modern-en
```

Uses Kokoro TTS (Bella voice) by default. Use Edge TTS only if Kokoro is unavailable or if instructed. Audio is English-only — do not generate Danish audio (see Hard Rule 14).

### Step 5: Generate Modern Danish + QA (automated)

Translate from **modern-en** (NOT original). ZERO API spend.

- Translate the MEANING, not the words. No translationese.
- Paragraph count must match modern-en exactly.
- Two-pass: Sonnet generates, Sonnet reviews in a fresh pass.
- Character names must match threads/cast. Greek names stay Greek, not Roman.
- Write to `../app/public/data/editions/{book-id}-modern-da.json`

**Translation quality rules:**
- No false cognates / wrong register
- No dropped/wrong verb prefixes
- No English grammar leaking through
- No invented compound words
- Re-read asking: "Would a Danish native speaker actually write it this way?"

**Reader aids:** On first occurrence per chapter, clarify non-obvious name variants in parentheses. Keep short.

**Danish QA (automated, mandatory):**

1. **Paragraph alignment:** Verify every chapter matches modern-en paragraph count.
2. **Empty/stub paragraphs:** Flag any paragraph under 20 characters.
3. **Name consistency:** Verify character names match across all chapters and match the threads/cast file.
4. **Translationese scan:** Sample 5 chapters. Grep for common Danish translationese markers:
   - English word order in subordinate clauses
   - Overuse of "der" (relative pronoun) where Danish would use different constructions
   - Cognate words that exist in Danish but aren't the natural choice
5. **Spot-read:** First 3 paragraphs of chapters 1, middle, and last. Does it read like natural Danish?

### Step 6: Register in bookRegistry.ts (automated)

Add book to `../app/src/data/bookRegistry.ts` with all editions. Verify: `npx tsc --noEmit`

### Step 7: Upload Audio to R2 (MANDATORY — autonomous after generation)

**Every time audio generation completes for a book×edition, immediately upload to R2.** Do not wait for Anders to ask. Do not wait for all editions to be done. Upload as soon as manifests are generated.

```bash
cd /Users/andershvelplund/Documents/Projects/Tinct/app/tts
bash /Users/andershvelplund/Documents/Projects/Tinct/app/scripts/upload-audio-r2.sh {book-id} {edition-key}
```

If the upload script doesn't support per-book arguments, upload the specific files directly:

```bash
cd /Users/andershvelplund/Documents/Projects/Tinct/app/tts
find audio/{book-id}/{edition-key} -type f \( -name "*.mp3" -o -name "manifest.json" \) | \
  xargs -P 20 -I {} bash -c 'npx wrangler r2 object put "tinct-audio/${1#audio/}" --file="$1" --content-type="$(case "$1" in *.mp3) echo audio/mpeg;; *.json) echo application/json;; esac)" 2>/dev/null' _ {}
```

**Verify after upload:** `curl -sf "https://pub-c34df89c93284423a39b03537595c2e2.r2.dev/{book-id}/{edition-key}/ch1/manifest.json" | head -c 50`

**This step is non-negotiable.** Audio that exists only in `tts/audio/` (staging) is invisible to users. The app loads from R2.

### Step 8: Visual QA (automated)

1. Start dev server, open in browser
2. Navigate every chapter in every edition
3. Verify: text renders, chapters load, edition switching works, split pane aligns
4. Check dark mode
5. Report any issues

### Step 9: Publish (autonomous — no approval needed)

A book is fully complete when ALL of the following are true:

- [ ] All 3 standard editions exist and are paragraph-aligned (original-en, modern-en, modern-da)
- [ ] English audio generated with manifests and uploaded to R2
- [ ] Book is registered in `bookRegistry.ts` with all editions and `hasAudio: true` on English editions
- [ ] Threads file exists with characters
- [ ] Visual QA passed

**Policy:** Never publish a partially complete book.

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

**Policy:** Never publish a partially complete book. A book with modern-en but no modern-da text is NOT ready. A book with editions but no English audio is NOT ready. The reader should never encounter a book that's missing pieces.

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
| TTS generation script (Kokoro) | `../app/tts/generate-odyssey-audio.py` |
| TTS generation script (Edge, fallback) | `../app/tts/generate-audio-edge.py` |
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
- [ ] English audio generated
- [ ] English audio manifests created
- [ ] English audio uploaded to R2
- [ ] Visual QA passed

### Session Log
| Date | What was done | Chapters completed |
|------|--------------|-------------------|
```

---

## Current Status

**Last verified:** 2026-03-30 (manual update)
**To refresh:** Run `python3 check-status.py` from this folder. Always trust the script over this table.

**Note:** Danish audio has been discontinued. Edge TTS Danish quality is insufficient for production. Audio is English-only going forward. All Danish audio files have been deleted from staging. Danish audio on R2 still needs manual deletion (see R2 cleanup note below).

| Book | Editions | Modern EN | Modern DA | EN Audio (staging) | EN Audio (R2) | Threads |
|------|----------|-----------|-----------|-------------------|---------------|---------|
| **Odyssey** (24 ch) | Complete (4: original, verse, modern-en, modern-da) | Complete | Complete | Complete (24 ch) | On R2 | 26 chars |
| **Ulysses** (18 ch) | Complete (3: original, modern-en, modern-da) | Complete | Complete | Complete (18 ch) | On R2 | 20 chars |
| **W&P** (365 ch) | Complete (3: original, modern-en, modern-da) | Complete | Complete | modern-en: 365, original-en: 113 | modern-en: 365 | 30 chars |
| **Bible** (66 ch) | 3 originals (kjv, web, modern-en) + modern-da partial | Complete (66/66) | 46/66 (20 remaining) | None | None | None |

### R2 Danish audio cleanup (manual)

The following R2 paths contain obsolete Danish audio that should be deleted from the `tinct-audio` bucket:
- `odyssey/modern-da/`
- `ulysses/modern-da/`
- `war-and-peace/modern-da/`

### What's left to do

| Task | Status | Notes |
|------|--------|-------|
| Bible modern-da translation | 46/66 books done (20 remaining) | Biggest remaining effort. Fresh conversations from books/ folder. |
| Bible modern-en audio | Not started | All 66 books ready for TTS generation |
| Bible threads | Not started | Need character list |
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
