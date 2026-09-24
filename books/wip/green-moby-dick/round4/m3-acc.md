# m3 accessibility review, round 4 (candidate only)

Scope: all 96 ids in `M-TARGETS.json` → `batches.m3` (64.11–91.49), each read with the paragraph before and after it. I also ran mechanical checks on every target: no doubled words, curly quotes, underscores, double spaces, odd quote counts or leftover archaic pronouns or verb forms.

**Verdict:** the batch passes. The re-rendered paragraphs read as modern English, and their tone and terms fit the neighbouring paragraphs. Nothing is blocking. I propose six small non-blocking fixes for read-aloud flow in `m3-acc.json`:
- 71.1: its opening repeats "before long" from the end of 71.0.
- 71.17: a clause has no verb.
- 71.18: the tenses in one sentence don't match.
- 72.5: "the sharks" is left without a verb.
- 90.20: the adverb "humorously" floats between commas.
- 91.1: "smell could be smelled" sounds like a slip. The fidelity checker should decide whether Melville's "smelt" tautology is deliberate.

## Questions / notes for the lead
1. **73.0 is not a target. It is context only.** It reads only "over Him.". This looks like a fragment of the chapter title ("...and Then Have a Talk over Him.") that was split off into a paragraph. Please check whether the source/live data has the same artifact.
2. **67.2 "the mates scarfing":** a modern reader will probably take "scarfing" to mean eating fast. I did not propose a gloss because I'm not sure one would be accurate. Consider a short gloss if the source context supports one.
3. **68.6:** the paragraph uses both "Oh, man!" and "O man". It is elevated apostrophe, so I left it alone.
