# Content Audit & Fix Brief — Translation Truncation

**Author:** Group CEO, April 17, 2026
**For:** Book CEO (Tinct project CLAUDE.md)
**Priority:** High — affects both reading quality and core sync feature

---

## The Problem

An audit of all 31 books has found **2,513 paragraphs** where translated editions are significantly truncated compared to their source text. This means real content — sentences, speeches, descriptions — was silently dropped during generation. Readers are getting incomplete books.

This has two consequences:

### 1. Reading Quality (the obvious one)
When a reader opens Crime and Punishment in modern English and paragraph 22 of chapter 35 is 144 words instead of 743, they're reading a summary, not a translation. The worst cases are catastrophic: Ulysses Ch8 P255 has 625 English words reduced to 7 Danish words. The Aeneid has 465 truncated paragraphs in modern English alone. These aren't usable editions.

### 2. Read/Compare Sync (the technical one)
Tinct's Compare view lets readers view two editions side-by-side (e.g., English + Danish). The sync mechanism aligns the two views so you see the same content. But when the Danish paragraph is 40% the length of the English one, no sync algorithm can align them — the content literally doesn't exist in one edition. This is causing visible mismatches that users have reported.

Even a perfect paragraph-level sync (which we're about to implement) can't fix this — if you're on page 3 of a 5-page English paragraph, and the Danish version of that paragraph is only 2 pages, there's nothing to show.

**The content must be fixed before the sync will work reliably.**

---

## Scope

### Full audit results (paragraphs where target < 75% of source word count)

```
Book                      ModEN vs Orig   ModDA vs ModEN  Total
-----------------------------------------------------------------
the-aeneid                465             -               465
meditations               237             1               238
the-republic              214             6               220
ulysses                   -               214             214
moby-dick                 210             no DA           210
paradise-lost             169             -               169
the-histories             147             no DA           147
war-and-peace             34              82              116
jane-eyre                 62              18              80
phaedo                    59              8               67
the-art-of-war            61              5               66
crime-and-punishment      11              43              54
divine-comedy             21              32              53
bible                     -               267             267
apology                   26              -               26
jerusalem                 25              no DA           25
symposium                 24              -               24
enchiridion               19              -               19
odyssey                   2               16              18
frankenstein              11              -               11
the-manual                7               -               7
gilgamesh                 4               2               6
great-expectations        4               no DA           4
macbeth                   -               2               2
pride-and-prejudice       1               1               2
hamlet                    1               -               1
romeo-and-juliet          -               1               1
the-awakening             -               1               1
-----------------------------------------------------------------
TOTAL                     1,814           699             2,513

CLEAN: midsummer, the-tempest, imitation-of-christ
```

### Two layers of truncation
1. **Modern EN vs Original** (1,814 paragraphs): The "modernization" step lost content. The original text is the ground truth — the modern English should preserve ALL content, just in contemporary language.
2. **Modern DA vs Modern EN** (699 paragraphs): The Danish translation lost additional content on top of whatever the English modernization already lost.

This means for some paragraphs, content was lost *twice* — first in EN modernization, then again in DA translation.

---

## Root Cause

The editions were generated via CLI conversation with Claude, chapter by chapter. Long paragraphs were likely truncated due to:
- Output token limits during generation (Claude stopping mid-paragraph)
- Implicit summarization instead of faithful translation (Claude condensing instead of translating)
- Batch processing pressure (moving fast through many chapters, not catching truncation)

---

## Fix Strategy

### Tiering by severity

**Tier 1 — Critical (fix first):**
Books that readers are actively reading + books with the worst truncation. Focus on paragraphs where ratio < 0.50 (less than half the content).

**Tier 2 — Important:**
All remaining books with > 20 truncated paragraphs.

**Tier 3 — Minor:**
Books with < 10 truncated paragraphs, or where the truncation is mild (ratio 0.65-0.75). These may be natural compression rather than content loss.

### Fix order within each book

For each book:
1. **Fix Modern EN vs Original first.** The modern English is the source for the Danish translation. If the English is truncated, the Danish will inherit that truncation. Fix the English, then fix the Danish.
2. **Then fix Modern DA vs the corrected Modern EN.**

### How to fix each paragraph

For each truncated paragraph:
1. Read the **original** (source) paragraph in full
2. Read the **current truncated** paragraph
3. Identify exactly what content was dropped
4. Generate the complete translation, preserving ALL content from the source
5. Write it back to the JSON file

**Critical rules:**
- The fix must have the **same number of paragraphs** as before (paragraph alignment must be preserved)
- Every sentence in the source must have a corresponding sentence in the target
- Do NOT summarize, condense, or "improve" — translate faithfully
- The tone/style should match the rest of the edition (modern accessible language for modern-en, same for modern-da)
- Watch for Danish quality pitfalls: false cognates, dropped verb prefixes, translationese (see `feedback_danish_quality.md` in memory)

### Validation

After fixing a book, run this check to confirm no truncated paragraphs remain:

```python
import json

def audit_book(source_path, target_path, threshold=0.75):
    with open(source_path) as f: source = json.load(f)
    with open(target_path) as f: target = json.load(f)
    issues = []
    for ci in range(min(len(source['chapters']), len(target['chapters']))):
        for pi in range(min(len(source['chapters'][ci]['paragraphs']), len(target['chapters'][ci]['paragraphs']))):
            sw = len(source['chapters'][ci]['paragraphs'][pi].split())
            tw = len(target['chapters'][ci]['paragraphs'][pi].split())
            if sw > 20 and tw/sw < threshold:
                issues.append((ci+1, pi, sw, tw, tw/sw))
    return issues
```

The book is clean when this returns an empty list.

---

## Structuring the Work

This is ~2,500 paragraphs across 28 books. You cannot do this in one session. Here's how to structure it:

### Session structure
- **One book per session** (or one large book across multiple sessions)
- Start each session by running the audit script for that book to get the exact list of truncated paragraphs
- Fix all truncated paragraphs for that book
- Run the validation script at the end
- Commit with message: `Fix truncated paragraphs in {book} ({N} paragraphs)`

### Prioritized order
Start with the books Anders is most likely reading or demoing:

1. **odyssey** (18 fixes) — flagship book, actively used for testing
2. **crime-and-punishment** (54 fixes) — popular book, visible to users
3. **jane-eyre** (80 fixes) — actively read
4. **divine-comedy** (53 fixes)
5. **ulysses** (214 fixes) — large but important
6. **the-aeneid** (465 fixes) — worst affected, bulk work
7. **paradise-lost** (169 fixes)
8. **meditations** (238 fixes)
9. **the-republic** (220 fixes)
10. Everything else

### Important: the Bible is special
The Bible has 267 truncated DA paragraphs, but Bible content has its own generation pipeline and considerations. Flag it but handle it separately.

---

## What NOT to Do

- **Don't regenerate entire chapters.** Only fix the specific truncated paragraphs. Regenerating everything risks introducing new issues in paragraphs that are currently fine.
- **Don't change paragraph structure.** The fix is always: replace the content of paragraph N with a complete translation. Never split, merge, add, or remove paragraphs.
- **Don't use the generation script (generate-editions.cjs).** All fixes must be done through CLI conversation. Zero API spend. This is a CLAUDE.md rule.
- **Don't fix paragraphs that are only mildly shorter (ratio 0.75-0.85).** Danish and modern English are naturally more concise than Victorian/ancient originals. Only fix genuine truncation where content is missing.

---

## Phase 2: Audio Regeneration

Every paragraph that gets re-translated will have stale audio on R2. This must be fixed — but **after** all text is stable, not in parallel.

### Why after, not during
If you regenerate audio for a paragraph and then tweak the text again during review, you've wasted a generation. Fix all the words first, then fix all the sound.

### Scope
Audio exists per-paragraph, so only the changed paragraphs need regeneration — not entire chapters. The impact is a subset of the 2,513 text fixes (only paragraphs that have audio generated).

### How to identify which paragraphs need new audio
After all text fixes for a book are committed, compare the fixed paragraphs against the audio manifests on R2:

```
# For each book+edition that was fixed, check which paragraphs have audio
# Audio path pattern: audio/{bookId}/{editionKey}/chapter-{N}/paragraph-{N}.mp3
# If a paragraph was changed and has audio → it needs regeneration
```

Keep a running list per book: `{bookId}, {editionKey}, chapter {N}, paragraph {N}` for every changed paragraph that has existing audio.

### How to regenerate
- **English audio:** Edge TTS (free, local)
- **Danish audio:** Google Cloud TTS premium (small cost, but per-paragraph so manageable)
- Generate the new audio file, upload to R2, replacing the old file at the same path
- The manifest doesn't change (same paragraph index, same file path) — only the audio content changes

### When to do this
After Phase 1 is complete for a book (all text fixes committed and validated). Can be done book-by-book — no need to wait for all 28 books.

### Estimated scope
Not all books have audio generated yet. Check which books have audio manifests on R2 before planning regeneration work. Books without audio can skip this phase entirely.

---

## Success Criteria

1. All books pass the audit with zero paragraphs below 0.65 ratio (hard threshold for genuine truncation)
2. Paragraph counts unchanged in every edition file
3. Read/Compare sync shows matching content at all positions (to be verified after the sync code fix is also deployed)
4. All changed paragraphs with existing audio have been regenerated and uploaded to R2
5. Spot-check: listen to 5 random regenerated paragraphs per book to confirm audio matches text

---

## Reminder: Zero API Cost Rule

All content fixes happen through CLI conversation. Read the original paragraph, generate the fix, write it to the file. This is the established pattern. The API key is for production user-facing features only. Audio generation via Edge TTS / Google Cloud TTS is permitted (that's infrastructure, not Anthropic API).
