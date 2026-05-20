# Book Factory — Tinct

This is the Book Factory for Tinct. When Anders opens Claude from this folder, he can say "add [book name]" and this CLAUDE.md guides the full pipeline from source text to finished, registered, audio-ready book.

**Parent project:** `../CLAUDE.md` (Tinct project CEO) — see it for overall context, design principles, and the API cost rule.

---

## Permissions & Paths

The Tinct project settings (`.claude/settings.json`) already allow `python3`, `cp`, `mkdir`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, and git commands. No special flags needed when launching from this folder.

**Always use absolute paths** instead of `cd`. Working directory: `/Users/andershvelplund/Documents/Projects/Tinct/books`.

| What | Absolute path |
|------|---------------|
| Edition JSON files | `/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions/` |
| Book registry | `/Users/andershvelplund/Documents/Projects/Tinct/app/src/data/bookRegistry.ts` |
| Type definitions | `/Users/andershvelplund/Documents/Projects/Tinct/app/src/types/index.ts` |
| TTS — Kokoro (English) | `/Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-audio-kokoro.py` |
| TTS — Chirp (Danish only) | `/Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-audio-chirp.py` |
| TTS — chapter title audio | `/Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-title-audio.py` |
| TTS — manifests | `/Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-manifests-edge.py` |
| Audio staging | `/Users/andershvelplund/Documents/Projects/Tinct/app/tts/audio/` |
| Audio public | `/Users/andershvelplund/Documents/Projects/Tinct/app/public/audio/` |
| Raw source texts | `/Users/andershvelplund/Documents/Projects/Tinct/books/raw/` |
| Parse helper | `/Users/andershvelplund/Documents/Projects/Tinct/books/parse-gutenberg.py` |

---

## HARD RULES

0. **SCOPE — content only, never site code.** The Book Factory adds books to the library. It MUST NOT modify any application code, components, hooks, styles, the worker, the build config, or any non-book file. Touching site code from this CEO has repeatedly broken production (today: wiped CSP fixes, position-sync, chat fixes, settings sheet, threads loader — all overwritten by an old bundle the books CEO built and shipped).

   **Allowed write paths — exactly these and nothing else:**
   - `app/public/data/editions/{book-id}-*.json` (edition text + threads)
   - `app/public/data/onboarding/{book-id}.json` (onboarding content)
   - `app/public/audio/{book-id}/**` (audio files + manifests)
   - `app/src/data/bookRegistry.ts` (single-purpose: register/unregister the book — do NOT change the file's structure, types, or unrelated entries)
   - `books/**` (raw sources, scripts, logs — your own working directory)
   - `books/CLAUDE.md` itself (status table updates only)
   - **When SEO work is explicitly requested**: `app/scripts/seo/{book-id}.cjs` (per-book SEO data file) + `app/public/read/{book-id}/**` (generator output). See the SEO Page Pipeline section below.

   **Forbidden:**
   - Anything in `app/src/components/`, `app/src/hooks/`, `app/src/services/`, `app/src/utils/`, `app/src/contexts/`, `app/src/styles/`, `app/src/index.css`, `app/src/App.tsx`, `app/src/main.tsx`, `app/src/worker.ts`, `app/src/types/index.ts` (except *adding* a new book-related type if needed — discuss first), `app/vite.config.ts`, `app/wrangler.jsonc`, `app/package.json`, `app/scripts/**`, `app/public/landing.html`, `app/public/app.html`, `app/public/about.html`.
   - The site CEO (Anders working in the parent CLAUDE.md context) owns all of those.

   If a book add genuinely requires a site-code change (new edition style, new metadata field, new feature), STOP and ask Anders to handle it via the site CEO. Do not edit those files yourself.

1. **ZERO Anthropic API spend.** All translations generated via CLI conversation. Never run scripts that call `api.anthropic.com`. See parent CLAUDE.md for full explanation.
2. **Always discuss structure BEFORE downloading.** Step 1 is mandatory and requires human approval.
3. **Maintain paragraph alignment** across all editions. Same number of paragraphs per chapter in every edition.
4. **Verify JSON validity** after every file write (`python3 -c "import json; json.load(open('file.json'))"`)
5. **Publishing minimum = original-en + modern-en.** Modern Danish is **optional**, generated on an occasional basis, never required for launch. A book without modern-en MUST NOT appear in the public `BOOKS` array in `bookRegistry.ts`. No kids editions — ever. Special editions (verse-en, web-en) only when discussed. Audio is English-only by default; Danish audio only when modern-da exists (see rule 14).
6. **Track progress.** Large books take multiple sessions. Always update the progress tracker below.
7. **Never flag scale as a problem.** Don't say "this is a huge task" or "this will be very difficult." Break every task into agent-sized chunks and execute. The architecture handles scale — just decompose and go.
8. **Use parallel agents.** Translations, audio generation, and threads are independent per book×language. Spin up background agents for each chunk. Typical agent unit = 1 book × 1 language × 10-20 chapters.
8b. **Model allocation — preserve Opus quota.** Opus tokens are shared across all of Anders's projects. Non-translation work MUST run on Sonnet via `Agent(model: "sonnet", ...)`. This is not optional.
   - **Sonnet (`model: "sonnet"`):** Threads generation, source text parsing, QA/structural checks, file operations, status checks, any mechanical/rule-following work.
   - **Opus (main conversation, no model flag):** Translation (EN and DA), translation review, complex editorial judgment, bug diagnosis.
   - **No model cost:** Audio generation (local TTS), R2 uploads, git operations, `python3` scripts.
   - **Why:** Anders's "All models" quota covers Opus. "Sonnet only" is a separate, unused pool. Every threads generation or parsing job run on Opus wastes premium quota on work Sonnet handles fine. `/fast` mode does NOT help — it's still Opus.
   - **Bulk regeneration exception:** For severely broken books, parallel Opus agents via `Agent(model: "opus", ...)` are permitted. Each agent regenerates one book end-to-end using `read-chapter.py` + `write-chapter.py`, self-audits with `audit-truncation.py`, and retries any paragraph flagged <0.75. Main conversation does a post-hoc quality gate (spot-sample 3 paragraphs per book, run full audit). If quality fails, re-launch with tightened constraints.
9. **Agent file writes.** Subagents' Write tool is often blocked by permissions. **Always write files via python scripts instead:** use `Write` to create `/tmp/scriptname.py`, then `Bash(python3 /tmp/scriptname.py)` to execute. Both tools are pre-approved. This pattern is mandatory for all agents that produce JSON output (threads, editions, etc.). Agents can use Read/Glob/Grep freely.
9b. **Avoid security prompt triggers.** These patterns cause security warnings Anders must manually approve — avoid all of them:
   - **`cd <path> && git ...`** — use `git -C <path> ...` instead.
   - **Multiline Bash with `#` comments** — strips comments from inline Python, or use the Write tool to create a `/tmp/script.py` file then `python3 /tmp/script.py` via Bash.
   - **Heredocs (`cat << 'EOF'`)** — use the Write tool to create the file, then Bash to run it. Two tool calls, zero prompts.
9c. **Never use Explore/subagents for status checks.** Run `python3 check-status.py` directly via Bash — it's pre-approved and zero-permission. Subagents trigger their own permission prompts for every tool call. Direct Bash is always faster and quieter.
9d. **R2 uploads require `--remote` flag.** Without it, `npx wrangler r2 object put` writes to a local emulator and silently "succeeds." Always use `--remote`.
10. **Self-direct on bottlenecks.** While a conversation is open, continuously monitor what's blocked and what can be unblocked. After completing any task or while waiting for a background process, immediately ask: "What is the current bottleneck? Can I start working on it now?" Don't wait for Anders to notice or ask — proactively identify the next constraint, communicate what you're doing, and start. If multiple things are blocked, work the dependency chain: unblock translations before audio, unblock parsing before translations. If you launched an agent that failed, retry with a different approach immediately — don't wait for the next prompt.
11. **Never stop on permission failures.** If a tool call is denied or a permission error blocks progress, do NOT give up and report "I need permission." Instead: (a) try an alternative tool that achieves the same result (e.g., Read/Write instead of Bash, or `python3 -c` instead of a script), (b) restructure the approach to avoid the blocked tool, (c) if truly stuck after 2 alternative attempts, explain to Anders what you tried, what failed, and ask him to grant the specific permission or suggest a workaround. The same applies to subagents — if an agent can't use Bash, it should use Read/Write/Glob/Grep tools instead, not stop and report failure.
12. **Bible translation: fresh conversation required.** Both subagents and bloated main conversations hit Anthropic's content filter on Bible text. The filter triggers when accumulated context + output is too large. **Start a dedicated fresh conversation** for Bible translation work — open Claude from the `books/` folder and say "continue Bible modern-da translation." Process one book at a time: read source → translate → write into `bible-modern-da.json` → validate → next book. For large books (100+ paragraphs): read source in 50-paragraph chunks. When context gets large, start a new conversation.
13. **Update status before ending.** Before ending any session that generated content (translations, audio, threads), run `python3 check-status.py` and update the Current Status table at the bottom of this file to match. This has caused major confusion — the status table said Bible modern-en was 12/66 when it was actually 66/66 complete.
14. **Audio engine rules — NEVER MIX THESE UP.**
    - **English audio → Kokoro** (`generate-audio-kokoro.py`). NEVER use Chirp for English.
    - **Danish audio → Google Chirp** (`generate-audio-chirp.py`). Kokoro does not support Danish.
    - This mistake was made once and affected 8 books. Do not repeat it.
15. **Truncation audit after every chapter batch.** Run `python3 books/audit-truncation.py {book-id}` after generating any batch of chapters (EN or DA). Every paragraph flagged must be inspected by eye — genuine content loss is fixed on the spot, natural compression is skipped. Never ship a chapter batch without running the audit. This caught 2,513 truncated paragraphs across 28 books in April 2026 — a failure that cost weeks of rework. The filter is conservative; the judgment is human. Use `show-paragraph.py` to inspect and `write-paragraph.py` to fix individual paragraphs without loading whole edition files.

---

## SEO Page Pipeline

Two tiers of SEO landing pages at `app/public/read/{book-id}/`:
- **Stub tier**: just `summary.html`. Generated by `node app/scripts/build-seo-stub.cjs <book-id>` from `app/public/data/onboarding/{book-id}.json` + `bookRegistry.ts`.
- **Full tier**: `summary.html` + `chapters.html` + `themes.html` + `cast.html` + `chapter-{N}.html` per chapter + `_tour.js`. Generated by `node app/scripts/build-seo-pages.cjs <book-id>` from `app/scripts/seo/{book-id}.cjs`.

### .cjs schema (canonical: `app/scripts/seo/hamlet.cjs`)

Top-level fields the generator references: `id` (NOT `bookId`), `title`, `author`, `byline` (e.g., `'1859 · Victorian political philosophy'`), `titleAccent` (e.g., `'a guided tour'`), `hook` (~60w pitch), `genre[]`, `themesBlurb`, `castBlurb`, `castDesc`, `castSubtitle`, `chapterLabel: n => '...'`, `about[]` (3 paragraphs ~200w each), `chaptersSubtitle`, `chaptersLead` (HTML), `themesByline`, `themesLead`, `castLead` (HTML), `groups[]` (chapter ranges by section), `themes[]` (each `{slug, title, preview, essay: [~4 paragraphs ~120w each], where: [{n, label}]}`), `keyFigures[]` (optional), `cast[]`, `castGroups[]`, `chapters[]`.

Each chapter entry: `{n, title, tourTitle, hook, tour (~150w), blurb (~50w), summary: [3 paragraphs ~250w each], appears: [{id, name}], themes: [{slug, label}]}`.

### Chunked architecture (REQUIRED for books > ~30 chapters)

Single-agent .cjs generation fails on big books — 32K output token limit and stream idle timeouts. Reliable pattern (validated against 60 books in May 2026):

1. **Wave A: chunk writers.** Parallel agents per book (chunks of 20-30 chapters each). Each writes a JSON array of chapter entries (no top-level fields) to `/tmp/{book-id}-chunk-{N}.json`.
2. **Wave B: finisher.** ONE agent per book. Merges chunks via python to `/tmp/{book-id}-chapters-merged.json`. Reads existing stub .cjs for themes/cast prose + tone. Writes new-schema .cjs that does **`chapters: require('/tmp/{book-id}-chapters-merged.json')`** — do NOT inline 100K+ char arrays; that re-triggers the timeout. Runs `build-seo-pages.cjs`.

For big books (50+ chapters), tighten per-chapter targets: `tour` ~80-100w, `blurb` ~30-40w, `summary` 3 × ~120-150w each.

### Field migration from older drafts

Earlier draft .cjs files (the 36 stubs of May 2026 + the 30 `bible-*` drafts) use an older schema. Migrate:
- `bookId` → `id`
- `year: 1859` → `byline: '1859 · Victorian political philosophy'` (formatted string)
- Top-level `blurb`/`summary`/`tour` → reorganize into `hook`, `about[]`, `chaptersLead`, etc.
- `themes: [{title, body}]` → `themes: [{slug, title, preview, essay: [paragraphs], where: [{n, label}]}]`
- `cast: [{name, role, body}]` → preserve + add `castGroups: [{label, members or characters: [...]}]`
- Add new fields: `chapterLabel`, `groups`, `keyFigures`

### Generator gotchas

- Apostrophes in single-quoted JS strings (`'Lorenzo de' Medici'`) break parsing — use template literals or escape.
- Curly quotes in titles inside JS strings — escape or convert.
- `book.chapters.length` is referenced without null check — chapters array MUST exist.
- For groups with many chapters, use `Array.from({length: b-a+1}, (_, i) => a+i)` (or a `range()` helper) instead of inlining `[1,2,3,...,50]`.

### Voice

Declarative, opinionated, factually exact. Cite specifics (named characters, exact lines, events). No AI-isms ("Let's explore", "In conclusion"). Match the existing stub's tone in `blurb`/`summary` where it exists.

### Bible-specific (per-book SEO at the `bible-{book}` level)

Bible SEO is organized per Bible book (`bible-genesis`, `bible-1-samuel`, etc.), NOT as one giant `bible/` page. The 30 bible-*.cjs files in `app/scripts/seo/` cover the major books. The reader uses bookId `bible` and global chapter numbers (Genesis 1 = ch 1, Exodus 1 = ch 51, etc.) — see chapter-to-book mapping by parsing chapter `title` ("Genesis 1", "Exodus 1", …). SEO pages are SEO-only HTML at `app/public/read/bible-{book}/` — they link INTO the reader with `?ch=N` query params for the global chapter number.

**Bible chunk-agent risk:** Bible content can trigger Anthropic's content filter when accumulated context is large. Mitigations: use scholarly/historical framing, neutral description of events, keep chunks small. If a chunk agent fails on filter, retry with tighter neutral phrasing.

---

## Anti-Patterns from the May 2026 Multi-Book Wave

May 2026 added 3 new books (jungle-book, treasure-island, around-the-world-80-days) plus Faust Part 1. The agent orchestration regressed: parallel translation agents overwrote each other, deploy operations raced with active edition writes, agent reports of "committed" were unverified and frequently false. The book-addition pipeline must regain its prior reliability — verification gates between every stage are non-negotiable.

### 16. Translation agents lie about commits

**Rule:** Never trust an agent's "committed: yes" report. Always verify with a byte-identity audit against the source edition AFTER the agent claims success.

**Why:** Multiple Danish-translation agents in May 2026 reported "all chapters committed" but the actual modern-da file had 70% (around-the-world-80-days) or 45% (faust-part-1) of paragraphs still byte-identical to modern-en — i.e. still English. They had committed only partial chunks; other chunks were left as the scaffold copy (which is modern-en). The `[untranslated]` stub check is insufficient — a file scaffolded from modern-en doesn't contain `[untranslated]` markers, it contains English.

**How to apply:** After any translation wave, run the byte-identity audit before proceeding:
```python
import json
en = json.load(open('{book-id}-modern-en.json'))
da = json.load(open('{book-id}-modern-da.json'))
en_paras = [p for ch in en['chapters'] for p in ch['paragraphs']]
da_paras = [p for ch in da['chapters'] for p in ch['paragraphs']]
identical = sum(1 for d, e in zip(da_paras, en_paras) if d == e and len(d.split()) > 15)
pct = identical / max(len(da_paras), 1) * 100
print(f"{identical} identical long paragraphs ({pct:.1f}%)")
```
If >5% of long paragraphs are byte-identical, the translation has gaps. Spot-check those chapters and re-translate before audio generation.

---

### 17. Race condition: parallel agents writing the same edition file

**Rule:** Never run multiple translation agents that each commit to the same `{book}-modern-en.json` (or `-modern-da.json`) file in parallel.

**Why:** One agent's "Bootstrapped fresh treasure-island-modern-da.json" overwrote sister agents' completed work mid-session. Sister agents that had already committed Ch1-22 lost their work when the Ch23-34 agent bootstrapped fresh from modern-en and only filled Ch23-34.

**How to apply:** Translation agents write to `/tmp/{book}-ch{N}-modern-{lang}-paras.json` files only. A separate finisher agent (single, sequential) commits all `/tmp` files in order via `write-chapter.py`. The "Bootstrap-from-scaffold" step happens once at the beginning, before any agents are launched — not concurrently with them.

---

### 18. Deploy + active edition-writes race condition

**Rule:** Never run `git stash --keep-index` (or any deploy step) during an active translation pass.

**Why:** A deploy agent's stash wiped an in-progress committed Jungle Book Ch1 translation in May 2026. A sibling agent found `jungle-book-modern-en.json` missing (stashed) and re-created it from scratch, dropping the existing Ch1.

**How to apply:** Deploy and translation are mutually exclusive operations. Sequence them: deploy first, then translate — or translate to completion, then deploy. NEVER overlap these two workstreams in the same session.

---

### 19. Kokoro silently hangs on specific paragraphs

**Rule:** Use a subprocess-per-paragraph pattern with a 30-60s timeout — never run raw `generate-audio-kokoro.py` for large books without a timeout wrapper.

**Why:** Kokoro hangs on certain paragraphs (long sentences, unusual whitespace, or stochastic failures). The native script doesn't time out — it sits with full CPU indefinitely. Detected only when WAV count stops advancing for >10 minutes.

**How to apply:** Use `subprocess.run()` with a per-paragraph Python invocation and `SIGALRM`-based timeout. On timeout: write a silent placeholder WAV and continue. After all paragraphs are done, audit which are placeholders and decide whether to accept or re-generate by hand.

**macOS-specific:** Do NOT use `multiprocessing.Process` with spawn mode on macOS — it re-imports kokoro in the subprocess in a way that produces silent WAVs for ALL paragraphs. Use `subprocess.run()` per paragraph instead.

---

### 20. Chirp generates English-language audio when the text is still English

**Rule:** Run the byte-identity audit (rule 16) BEFORE kicking off any TTS generation run. Audio of English text in a Danish voice is unusable and must be deleted and re-generated.

**Why:** The around-the-world-80-days modern-da Chirp run produced 1,613 mp3 files, but ~70% of them voiced English content (in a Danish accent) because the underlying text was untranslated. All those mp3s had to be deleted and the audio re-generated from scratch after gap-fill.

**How to apply:** Translation complete and byte-identity audit passes (<5% identical long paragraphs) → THEN start TTS. No exceptions.

---

### 21. R2 bulk uploads at -P 20 trigger Cloudflare rate-limits

**Rule:** Use `-P 8` for R2 bulk uploads. Fall back to sequential (with `sleep 1` between each) for retry passes.

**Why:** Parallel `wrangler r2 object put` at `-P 20` caused "Failed to fetch /accounts/..." errors for ~30% of uploads in May 2026. `-P 8` succeeded reliably.

**How to apply:** First upload pass at `-P 8`. If any failures appear in output, re-run the specific failed files sequentially:
```bash
for f in <failed-files>; do
  npx wrangler r2 object put "tinct-audio/${f#audio/}" --file="$f" --content-type="audio/mpeg" --remote
  sleep 1
done
```

---

### 22. ScheduleWakeup chains multiply uncontrollably

**Rule:** Use ScheduleWakeup only when a single agent has one specific condition to check. Never schedule an agent that itself schedules another wakeup — chains grow exponentially.

**Why:** A "consolidated audio finisher" agent rescheduled itself ~10 times in May 2026. Each fired in parallel because the main conversation kept launching new wakeup variants. The result was duplicate agents running simultaneously against the same files.

**How to apply:** If you launch a self-rescheduling background agent, you own that chain — track it and kill duplicates immediately. The preferred pattern is: main conversation polls directly via Bash (`python3 check-status.py`), no rescheduling loops.

---

### 23. "No [untranslated] stubs" is necessary but not sufficient

**Rule:** Always run BOTH checks: (a) no `[untranslated]` placeholders, AND (b) <5% byte-identical long paragraphs to the source-language edition.

**Why:** The scaffold step copies modern-en verbatim. If a translation agent skips translating, the file looks clean (no stubs) but the content is still English. The stub check catches only explicit placeholders — it is blind to untranslated scaffold content.

**How to apply:** Both checks must pass before the edition is considered complete. See rule 16 for the byte-identity audit script.

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
3. **VALIDATE THE DOWNLOADED TEXT MATCHES THE EXPECTED BOOK BEFORE PARSING.** Every Project Gutenberg `.txt` file has `Title:` and `Author:` headers in the first ~30 lines. After download, grep them out and fail loud if either doesn't match the expected book. This rule exists because of an actual incident (2026-04-27): `books/raw/enchiridion-augustine/SOURCE.md` pointed to PG#9231 (which is "Earth's Holocaust" by Hawthorne, NOT Augustine). The wrong book downloaded silently. The parser saw nothing recognizable, the slot got filled with Epictetus content from the *correct* `enchiridion/` directory, and the registry shipped "Augustine's Enchiridion" with Epictetus's text for weeks. **A wrong Gutenberg ID must fail loud, not silently substitute.**
   - Example check (paste this after every download):
     ```bash
     head -30 books/raw/{book-id}/raw.txt | grep -E "^(Title|Author):"
     ```
   - Compare against the expected book's metadata. If `Title:` doesn't contain the expected work's name OR `Author:` doesn't match the expected author, STOP — re-source from the correct ID.
4. Parse into edition JSON at `../app/public/data/editions/{book-id}-original-en.json`
5. Validate: `python3 -c "import json; d=json.load(open('file.json')); print(f'{len(d[\"chapters\"])} chapters, {sum(len(c[\"paragraphs\"]) for c in d[\"chapters\"])} paragraphs')"`
6. Run source quality check (stray numbers, Gutenberg boilerplate, short paragraphs, title repeats) — fix any issues found

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
- Generate in the main Opus conversation (translation quality requires Opus — do NOT delegate to Sonnet agents).
- Write to `../app/public/data/editions/{book-id}-modern-en.json`

**HOUSE STYLE — locked decisions (April 2026):**
- **Preserve all exclamation marks** from the source unless the sentence is restructured. Don't silently soften emphatic punctuation to periods.
- **Preserve proper noun accents verbatim**: `Chênière`, `Léonce`, `Chätelet`, etc. Never strip diacritics.
- **Quote style: curly `"..."`** matches the original Gutenberg typography across the existing 22 books — keep using curly.
- **Translate the COMPLETE content of every paragraph.** If a paragraph below 75% of the source word count, you have dropped content — re-translate. Paragraph-level summarization is the single biggest failure mode.
- **Do NOT soften, edit out, or flag period-appropriate content based on modern ethics.** 19th-century racial language, religious language, gendered language, and other historical content stays as-is in translation. Tinct's editorial stance is faithful preservation of the historical text. Don't add editorial notes suggesting softening. Don't replace charged terms with neutral ones. Translate what's there.
- **Shakespeare and other play texts: keep the ALL-CAPS speaker tag + period convention** (`MACBETH.`, `LADY MACBETH.`, `FIRST WITCH.`). Stage directions in brackets with character names also in ALL CAPS: `[Enter MACBETH]`. The Kokoro audio pipeline handles this transparently in `clean_text()` — Roman numerals in titles and ALL-CAPS words are converted for TTS. Don't use Title Case or prose-dialogue format for plays.

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

6. **Content alignment spot-check (not just counts):** For 3 randomly selected chapters, compare the first sentence of each paragraph in the translation against the first sentence of the corresponding original paragraph. If they don't match, the content has drifted — the paragraph contains content from a neighboring original paragraph. This is the most common failure mode for verse-to-prose conversions and is invisible to count checks.
7. **Truncation audit (MANDATORY, automated):** Run `python3 books/audit-truncation.py {book-id} en` after every chapter batch. Every paragraph flagged (ratio < 0.75, source ≥ 20 words) must be inspected by eye. Genuine truncation (sentences, clauses, or named entities missing) MUST be fixed before moving on. Natural modernization compression (same content, fewer words) is acceptable — the human judges, the script only filters. Zero tolerance for ratios below 0.5: those are ALWAYS content loss, never compression.
8. **Preserve allusions verbatim:** For allusion-heavy texts (Ulysses, Divine Comedy, Paradise Lost, The Republic), the generation prompt must include: "If the original contains a quotation, allusion, or proper name you are uncertain about, preserve it verbatim from the original rather than paraphrasing or replacing it." After generation, grep for proper nouns in the original that don't appear in the translation.

**If any QA check fails, fix before proceeding.** Modern-en errors cascade into Danish translation and audio.

**Generation prompt must include these anti-truncation instructions (non-negotiable):**
1. "Translate the COMPLETE content of each paragraph. Do not summarize, condense, or omit any arguments, examples, dialogue, or descriptive detail. If a paragraph contains five sentences in the source, your translation must contain five semantically equivalent sentences."
2. "Preserve every quotation, allusion, proper noun, place name, and specific detail verbatim. If uncertain, copy from the source rather than paraphrase."
3. "Paragraph N must start with content equivalent to the first sentence of source paragraph N. Do not merge content across paragraph boundaries."
4. "Output length per paragraph should be ≥75% of the source word count. If your draft falls below that, you have dropped content — re-translate before outputting."

**Verse-to-prose books are highest risk.** Generate chapter by chapter (not in bulk) with an explicit anchor instruction: "Translate paragraph N of N. The first words of the original paragraph are: '...'. Your translation must start with equivalent content."

### Step 4: Generate English Audio (automated)

Run immediately after modern-en QA passes. **Three sub-steps — all mandatory:**

**4a. Paragraph audio (Kokoro):**
```bash
python3 /Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-audio-kokoro.py {book-id} modern-en 1 {end_ch}
```

**4b. Convert WAV → MP3 + generate manifests:**
```bash
python3 /Users/andershvelplund/Documents/Projects/Tinct/app/tts/convert-and-manifest.py
```
Or use the per-book convert script pattern (see `/tmp/convert_and_upload.py` for reference).

**4c. Chapter title audio (Kokoro) — MANDATORY, do NOT skip:**
```bash
python3 /Users/andershvelplund/Documents/Projects/Tinct/app/tts/generate-title-audio.py {book-id} modern-en --upload
```
This reads chapter titles from the edition JSON, generates `title.mp3` per chapter, prepends it to the manifest as `paragraph: -1`, and uploads both `title.mp3` and updated `manifest.json` to R2. Without this step, audiobook chapters start abruptly without announcing the chapter name.

Uses Kokoro TTS (Bella voice). Danish audio uses Google Chirp (`generate-audio-chirp.py`). See Rule 14.

### Step 5: Generate Modern Danish + QA (automated)

Translate from **modern-en** (NOT original). ZERO API spend.

- Translate the MEANING, not the words. No translationese.
- Paragraph count must match modern-en exactly.
- Generate in the main Opus conversation (Danish quality requires Opus — do NOT delegate to Sonnet agents).
- Character names must match threads/cast. Greek names stay Greek, not Roman.
- Write to `../app/public/data/editions/{book-id}-modern-da.json`

**HOUSE STYLE — locked decisions (April 2026):**
- **Honorifics from 19th-century Anglo sources (`Mrs.`, `Mr.`) stay in English form** — not translated to `fru` / `hr.`. This is the convention across all Tinct Danish editions.
- **Dialogue quotes use guillemets `»...«`** (pointing inward at the text). Never straight `"..."`. Never the low-9 form `„..."`.
- **Apostrophes in possessives/contractions use straight `'`**, not curly `'`.
- **Em dashes `—` for interruptions and parentheticals.** Matches source typography.
- **Proper nouns preserve source accents** — `Chênière` not `Chêniere`, `Léonce` not `Leonce`, `Zürich` not `Zurich`. Never strip diacritics.
- **Do NOT soften period-appropriate content based on modern ethics.** 19th-century racial/religious/gendered language translates faithfully. No editorial notes suggesting softening. No substitution of neutral terms.

**Translation quality rules:**
- No false cognates / wrong register (e.g. `pretentioner` is English-as-Danish — use `prætentioner` or rephrase)
- No dropped/wrong verb prefixes
- No English grammar leaking through
- No invented compound words
- No verbatim calques of English idioms (`til en sprøde`, `sådan en ting`, `have været i stand til`)
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
6. **Content alignment spot-check:** Same as Step 3 rule 6 — compare first sentences of 3 random chapters against modern-en to verify content hasn't drifted between paragraphs.
7. **Truncation audit (MANDATORY, automated):** Run `python3 books/audit-truncation.py {book-id} da` after every chapter batch. Every paragraph flagged (ratio < 0.75, source ≥ 20 words) must be inspected by eye. Genuine truncation must be fixed; natural Danish compression (genitive compounds like "havets stemme" for "the voice of the sea" naturally shed words) is acceptable. Zero tolerance for ratios below 0.5: those are ALWAYS content loss. The generation prompt must include the same anti-truncation instructions listed in Step 3.
8. **Hallucination check for allusion-heavy texts:** Grep for proper nouns and quotations in modern-en that don't appear in the DA translation. The model may replace uncertain allusions with fabricated content — this is the most dangerous error because it's invisible to structural checks.

### Audio implications of text fixes

**Any time a paragraph is changed in an edition that has audio generated from it, the corresponding audio paragraph(s) are stale.** After fixing text:
1. Note which book/edition/chapter/paragraphs changed
2. Re-generate audio for those specific paragraphs
3. Re-generate the chapter manifest
4. Re-upload to R2

For small fixes (1-5 paragraphs), regenerate just those files. For full re-generations, regenerate the entire book's audio.

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
  xargs -P 20 -I {} bash -c 'ct="audio/mpeg"; case "$1" in *.json) ct="application/json";; esac; npx wrangler r2 object put "tinct-audio/${1#audio/}" --file="$1" --content-type="$ct" --remote 2>/dev/null' _ {}
```

**CRITICAL: Always use `--remote` flag.** Without it, wrangler writes to a local emulator and silently "succeeds." This has caused entire uploads to be lost.

**Verify after upload:** `curl -sf "https://tinct.app/api/audio-manifest?path={book-id}/{edition-key}/ch1/manifest.json" | head -c 50`

**This step is non-negotiable.** Audio that exists only in `tts/audio/` (staging) is invisible to users. The app loads from R2.

### Step 8: Visual QA (automated)

1. Start dev server, open in browser
2. Navigate every chapter in every edition
3. Verify: text renders, chapters load, edition switching works, split pane aligns
4. Check dark mode
5. Report any issues

### Step 9: Publish (autonomous — no approval needed)

A book is ready to publish when ALL of the following are true:

- [ ] **original-en + modern-en** exist and are paragraph-aligned (publishing minimum)
- [ ] English audio generated with manifests and uploaded to R2
- [ ] Book is registered in `bookRegistry.ts` with all editions, `hasAudio: true` on English, AND **listed in the public `BOOKS` array**
- [ ] Threads file exists with characters (narrative/dialogue books only — skip for treatises and journals like Art of War, Meditations)
- [ ] Visual QA passed

**Optional (not required to publish):**
- `modern-da` text + Danish Chirp audio — generated on an occasional basis when we have time and budget. Never a blocker for launch.

**Policy:** Never publish a book that lacks modern-en. A book with only `original-en` stays out of the public `BOOKS` array until modern-en is done. The `Book` constant may live in `bookRegistry.ts` as a staged definition, but must not reach production until modern-en exists.

**Publish sequence:**
```bash
cd /Users/andershvelplund/Documents/Projects/Tinct/app

# 1. Commit all new/changed files for this book
git -C /Users/andershvelplund/Documents/Projects/Tinct add app/public/data/editions/{book-id}-*.json
git -C /Users/andershvelplund/Documents/Projects/Tinct add app/public/data/editions/{book-id}-threads.json
git -C /Users/andershvelplund/Documents/Projects/Tinct add app/src/data/bookRegistry.ts
git -C /Users/andershvelplund/Documents/Projects/Tinct add app/public/audio/{book-id}/
git -C /Users/andershvelplund/Documents/Projects/Tinct commit -m "Add {book title} to library (all editions + audio + threads)"

# 2. Deploy via the safe script — chains build → verify-bundle → wrangler deploy.
#    This is the ONLY allowed deploy command. Do NOT use `npx vite build` or
#    `npx wrangler deploy` directly — those skip the env-var check, the
#    landing/app.html swap, and the bundle verification, and have caused
#    repeated production outages (auth-not-configured, stale CSP, missing
#    cookie redirect). If `npm run deploy` fails, STOP and ask Anders.
npm run deploy

# 3. Verify production
curl -s https://tinct.app/ | head -5
```

**Policy:** Never publish a partially complete book. A book with editions but no English audio is NOT ready. The reader should never encounter a book that's missing pieces.

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

---

## Status Format

When Anders asks for "status" / "overview" / "where are we", present a **single table**:

| Book | Editions | Modern EN | Modern DA | Audio | Threads |
|------|----------|-----------|-----------|-------|---------|

- **Publishing threshold = original-en + modern-en** (2 editions). Modern-da is optional. Bonus editions (verse-en, web-en, kjv-en) don't change the threshold.
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
| 13 | The Histories | Herodotus | ~440 BC | Rawlinson 1858 translation (public domain). 9 books ~200 chapters |
| 14 | Niels Lyhne | J.P. Jacobsen | 1880 | Original Danish (public domain). EN: Larsen 1919 translation. First Danish-origin book in library |
| 15 | Symposium | Plato | ~385 BC | On love & beauty. Jowett 1871 translation. Short dialogue |
| 16 | Phaedo | Plato | ~385 BC | On the soul & death. Jowett 1871 translation. Medium dialogue |
| 17 | Apology | Plato | ~399 BC | Socrates' trial & defense. Jowett 1871 translation. Short |

Target: 10-20 books total. List is not locked — Anders decides.

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

## How to Check Status — IMPORTANT

**The single source of truth is the `check-status.py` script.** Never trust this table over the script output.

```bash
# Fast local check (no permissions needed, runs in 1 second):
python3 check-status.py

# Full check including R2 verification (takes ~10 seconds, uses curl):
python3 check-status.py --r2
```

**For Claude sessions:** Always use `python3 check-status.py` via Bash — it runs from the `books/` working directory and requires only the `python3` permission (already allowed in project settings). Do NOT use subagents or Explore agents for status checks — they trigger unnecessary permission prompts. Direct Bash + the script = zero permission prompts.

**The script checks:** All 20 books, editions on disk, audio in staging (chapters + manifests), hasAudio flags in registry, threads files, junk files, and (with `--r2`) actual R2 availability via curl. It auto-detects issues and prints them at the bottom.

**After any session that generates content:** Run the script and update the table below to match.

---

## Current Status

**Last verified:** 2026-04-23 (via `check-status.py`) — table is partial, see `python3 check-status.py` for the full 39-book picture

| Book | Editions | EN Audio | DA Audio | hasAudio flags | Threads |
|------|----------|----------|----------|----------------|---------|
| **Odyssey** (24 ch) | 3 eds OK | R2 OK | R2 OK | original-en, modern-en, modern-da | 26 chars |
| **Ulysses** (18 ch) | 3 eds OK | R2 OK | R2 OK | original-en, modern-en | 20 chars |
| **W&P** (365 ch) | 3 eds OK | R2 OK | 51ch staging, not on R2 | modern-en | 30 chars |
| **Bible** (1189 ch) | 4 eds OK | 1173ch staging (no manifests for 91-1189) | None | modern-en | 30 chars |
| **Gilgamesh** (12 ch) | 3 eds OK | R2 OK | None | modern-en | 16 chars |
| **Hamlet** (28 ch) | 3 eds OK | R2 OK | None | modern-en | 13 chars |
| **Macbeth** (56 ch) | 3 eds OK | R2 OK | None | modern-en | 13 chars |
| **Midsummer** (10 ch) | 3 eds OK | R2 OK | None | modern-en | 16 chars |
| **Romeo & Juliet** (50 ch) | 3 eds OK | R2 OK | None | modern-en | 15 chars |
| **The Tempest** (18 ch) | 3 eds OK | R2 OK | None | modern-en | 12 chars |
| **Pride & Prejudice** (61 ch) | 3 eds OK | R2 OK | None | modern-en | 15 chars |
| **Art of War** (13 ch) | 3 eds OK | R2 OK | None | modern-en | N/A |
| **Crime & Punishment** (44 ch) | 3 eds OK | R2 OK (41 manifests) | None | modern-en | 14 chars |
| **The Republic** (10 ch) | 3 eds OK | R2 OK | None | modern-en | 6 chars |
| **Meditations** (12 ch) | 3 eds OK | R2 OK | None | modern-en | N/A |
| **Divine Comedy** (100 ch) | 3 eds OK | R2 OK | None | modern-en | 22 chars |
| **Jane Eyre** (38 ch) | 3 eds OK | R2 OK | None | modern-en | 16 chars |
| **The Aeneid** (12 ch) | 3 eds OK | R2 OK | None | modern-en | 15 chars |
| **Paradise Lost** (12 ch) | 3 eds OK | R2 OK | None | modern-en | 15 chars |
| **Frankenstein** (28 ch) | 3 eds OK | R2 OK | None | modern-en | 12 chars |
| **The Manual** (52 ch) | 3 eds OK | R2 OK | None | modern-en | N/A |
| **Apology** (3 ch) | 3 eds OK | 3ch staging (mp3+manifests) | None | modern-en | N/A |
| **Symposium** (8 ch) | 3 eds OK | Staging (mp3+manifests) | None | modern-en | None |
| **Phaedo** (9 ch) | 3 eds OK | Staging (original-en, wavs) | None | None | None |
| **Moby Dick** (136 ch) | 1 ed (orig-en) | None | None | None | None |
| **Great Expectations** (59 ch) | 1 ed (orig-en) | None | None | None | None |
| **The Histories** (1525 ch) | 2 eds OK | R2 OK | None | modern-en | 7 chars |
| **Niels Lyhne** (14 ch) | 4 eds OK | R2 OK | None | modern-en | 11 chars |
| **Imitation of Christ** (114 ch) | 2 eds OK | R2 OK | None | modern-en | 2 chars |
| **Jerusalem** (18 ch) | 3 eds OK | R2 OK | None | modern-en | 5 chars |
| **Beowulf** (43 ch) | 3 eds OK | R2 OK | None | modern-en | 9 chars |
| **Candide** (30 ch) | 3 eds OK | R2 OK | None | modern-en | 7 chars |
| **Oresteia** (26 ch) | 1 ed (orig-en) | None | None | None | None |

### Open Issues

| Issue | Details |
|-------|---------|
| Bible audio manifests | 1173+ chapters of wav audio, only ch1-90 have manifests. Need wav→mp3 conversion + manifests for ch91-1189 |
| Bible audio still generating | ~16 chapters remaining (Kokoro running in background) |
| Crime & Punishment audio | 44ch but only 41 manifests |
| Junk files | the-manual-modern-da 2.json |
| Moby Dick modern-en partial | Ch1-2 translated (27/2432, 1%). Temp files at /tmp/moby_en_ch{1,2}.json |
| 4 new books need translations | Moby Dick (1% en), Great Expectations, The Histories, Niels Lyhne all need modern-en + modern-da |
| Apology audio needs R2 upload | mp3 + manifests in staging, not on R2 yet |
| Symposium audio generating | Kokoro running, ch5/8 in progress |
| Bible audio needs R2 upload | 1189 chapters with mp3+manifests in staging, need R2 upload for ch91-1189 |

### Notes
- 28 total books (21 existing + 7 new from 2026-04-10 session)
- First 21 books: all editions complete, all have EN audio on R2
- 7 new books: originals parsed, registered in bookRegistry.ts
- **Apology is the first fully complete new book** (3 editions + audio with manifests)
- Symposium modern-en translation 47% done (102/217 paras, only Ch7 remains)
- Bible audio generation went from 90→1173+ chapters this session
- **Edition files are at `public/data/editions/`, NOT `src/data/editions/`**
- **R2 uploads require `--remote` flag** with wrangler r2 object put
- Translated chapter files for Symposium saved in /tmp/sym_ch{1-6,8}.json

## Current Book: Oresteia (Aeschylus)
**Book ID:** oresteia
**Total chapters:** 26
**Started:** 2026-04-23

### Pipeline
- [x] Structure discussed and approved (one book, 3 plays as sections, 26 chapters)
- [x] Source text downloaded (PG #8604, Morshead 1881 translation)
- [x] Original parsed to JSON (26 chapters, 771 paragraphs)
- [ ] Registered in bookRegistry.ts
- [ ] Modern English: 0/26 chapters
- [ ] Modern Danish: 0/26 chapters
- [ ] English audio generated
- [ ] English audio manifests created
- [ ] English audio uploaded to R2
- [ ] Visual QA passed

### Session Log
| Date | What was done | Chapters completed |
|------|--------------|-------------------|
| 2026-04-23 | Downloaded PG #8604 (Morshead 1881), parsed all 3 plays to oresteia-original-en.json. 26 chapters, 771 paragraphs, 3 sections. Full speaker attribution, stage direction formatting, source quality check passed. | Ch1-26 (original-en complete) |

## Current Book: A Vindication of the Rights of Woman (Wollstonecraft)
**Book ID:** vindication-rights-of-woman
**Total chapters:** 15 (Dedication, Introduction, Ch1-13)
**Started:** 2026-05-20

### Pipeline
- [x] Structure discussed and approved (flat 15-chapter, Dedication + Intro + Ch1-13)
- [x] Source text downloaded (PG #3420, Title/Author headers validated)
- [x] Original parsed to JSON (15 chapters, 778 paragraphs, ~84k words)
- [x] Registered in bookRegistry.ts as VINDICATION_RIGHTS_OF_WOMAN (NOT in public BOOKS array — translations incomplete)
- [ ] Modern English: 3/15 chapters (Ch1 Dedication, Ch2 Introduction, Ch3 The Rights and Involved Duties — committed via write-chapter.py; truncation audit passes)
- [ ] Modern Danish: 0/15 chapters (scaffold bootstrapped from original-en — all paragraphs still English; needs full translation)
- [ ] English audio (not yet — skip per instructions)
- [ ] Visual QA

### Session Log
| Date | What was done | Chapters completed |
|------|--------------|-------------------|
| 2026-05-20 | Downloaded PG #3420, parsed to 15 chapters (Dedication, Introduction, Ch1-13). Bootstrapped modern-en + modern-da scaffolds. Registered in bookRegistry.ts (not in BOOKS array yet). Translated modern-en Ch1-3 (21+17+31 = 69 paragraphs, ~7.4k words). Truncation audit clean. | modern-en Ch1-3 |

### Continuation instructions for next agent
- 12 modern-en chapters remain: Ch4 (76 paras), Ch5 (52), Ch6 (86), Ch7 (172 — the largest), Ch8 (20), Ch9 (42), Ch10 (33), Ch11 (33), Ch12 (8), Ch13 (20), Ch14 (84), Ch15 (83). Total ~77k words.
- 15 modern-da chapters remain (full translation).
- Pattern: `python3 read-chapter.py vindication-rights-of-woman original-en N` → write `/tmp/vrw-chN-modern-en.json` as JSON array of strings → `python3 write-chapter.py vindication-rights-of-woman modern-en N --file /tmp/vrw-chN-modern-en.json`. Same for `modern-da` (translate FROM modern-en, not original).
- Verify with the byte-identity audit after each chapter: `python3 -c "import json; ..."` (see books/CLAUDE.md rule 16). Target: <5% identical long paragraphs vs source.
- After ALL editions are stub-free, add `VINDICATION_RIGHTS_OF_WOMAN` to the public `BOOKS` array in bookRegistry.ts.
- Do not start audio generation until BOTH modern-en and modern-da are stub-free and the byte-identity audit passes (rule 20).
