# Prompt for Book CEO — Content Truncation Audit & Fix

Copy-paste this into a new Claude Code session opened in the Tinct project directory.

---

## The Prompt

```
Read CONTENT-AUDIT-BRIEF.md — it's your full brief for this work.

Summary: An audit found 2,513 paragraphs across 28 books where translated editions (modern English and modern Danish) are significantly truncated compared to their source text. Real content — sentences, speeches, descriptions — was silently dropped during generation. This affects reading quality and breaks the Compare view sync.

Your job: fix the truncated paragraphs, one book at a time.

Start with the Odyssey (18 truncated paragraphs — small enough to complete in one session and validate the workflow).

For each book:
1. Run the audit script from the brief to get the exact list of truncated paragraphs
2. For each truncated paragraph:
   a. Read the SOURCE paragraph (original-en for modern-en fixes, modern-en for modern-da fixes)
   b. Read the CURRENT truncated paragraph
   c. Identify what content was dropped
   d. Generate the complete, faithful translation preserving ALL source content
   e. Write it back to the JSON file at the exact same paragraph index
3. Run the validation script to confirm zero truncated paragraphs remain
4. Commit: "Fix truncated paragraphs in {book} ({N} paragraphs)"

Rules:
- Fix modern-en first, THEN modern-da (DA is translated from EN, so EN must be correct first)
- Never change paragraph count — only replace paragraph content
- Don't summarize or condense — translate faithfully, every sentence
- Don't touch paragraphs with ratio > 0.65 — those are natural compression, not truncation
- All work through CLI conversation, zero API spend
- After all text is fixed for a book, note which paragraphs changed (for later audio regeneration)

After Odyssey, continue with: crime-and-punishment, jane-eyre, divine-comedy, ulysses, then the rest per the priority order in the brief.
```
