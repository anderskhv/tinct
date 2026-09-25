# Symposium — accessibility assessment of the accepted Tinct Modern English (assessor brief)

You are an independent assessor. You did not write this text.

## Background

The Symposium completeness repair is accepted. It restored the missing opening, fixed the chapter-7/8 boundary and made three corrections in chapter 3. Its Modern English (`modern-en`, sha256 `1e970b7b…`) still fails the repository's similarity gate: weighted similarity 0.866, with chapters 2 and 4–8 rated LIGHT at 0.90–0.95. Much of it is Benjamin Jowett's 1871 translation with light punctuation changes.

**That score is only a screening signal.** It does not prove that every paragraph needs rewriting. Your job is to decide, paragraph by paragraph, whether the current Modern English works for today's reader and listener.

The Tinct target is a modern reading edition. A curious, intelligent 16-year-old, or an adult hearing it read aloud, should follow the argument without footnotes. It must stay faithful to Jowett: every claim, example, qualification, name, quotation and step of argument, in sequence, with Plato's tone. A light spelling or punctuation pass is not enough where Victorian wording obstructs understanding. But plain passages that already work should be kept, not rewritten for the sake of change.

## Packet

Your packet is `assess-<ID>.md`. It gives every paragraph as JOWETT (the corrected source, original-en `3521a12d…`) next to MODERN (the current modern-en).

- Paragraphs marked `PROTECTED` were accepted in the completeness repair: 1.0–1.8 and 3.3, 3.7 and 3.8. Assess them, but propose no rewrite unless you find a genuine defect.
- `pg1600.txt` is the full Gutenberg source. Use the packet; the source is there only for context.

## For every paragraph, decide

- `KEEP`: the modern text already reads as clear present-day English, by eye and by ear, and is faithful. Short conversational lines usually qualify.
- `REPAIR`: the paragraph has one or more of these problems:
  - `opaque-syntax`: Victorian periodic sentences, inversions, or stacked relative clauses that a modern reader loses track of;
  - `archaic-wording`: for example fain, herein, adduce, flexile, verily, "of a truth", "I dare say" used oddly, "say rather";
  - `historical-sense`: a word or reference whose meaning has shifted or needs a few words of explanation to be understood, such as "vulgar" meaning common or popular, Pandemus/Urania, the lover and the beloved, or a myth or person named without context;
  - `unclear-argument`: the logical step is hard to follow as written;
  - `misleading`: modern readers would take it to mean something else, a false friend, or an error against Jowett.

For each REPAIR, quote the specific phrases that cause the problem and say in one line what the fix needs to do. Do not write the full rendering.

## Output

Write JSON to `/tmp/claude-0/-home-user-tinct/781378ba-275b-5897-8531-920676c586a7/scratchpad/out/symp-assess-<ID>.json`:

```json
{"assessor": "<ID>", "chapters": [..], "paragraphs": [
 {"id": "2.4", "verdict": "REPAIR", "issues": ["opaque-syntax", "archaic-wording"],
  "evidence": ["\"For the principle which ought to guide men who would live nobly — that principle, I say, neither kindred...\""],
  "fix": "one line on what the repair must achieve"},
 {"id": "8.10", "verdict": "KEEP", "note": "plain dialogue line"}
]}
```

Give **every** paragraph in your chapters one entry. Your final message should report KEEP and REPAIR counts per chapter, the dominant problem types, and your judgment on whether substantive repairs are needed. Do not edit any other file.
