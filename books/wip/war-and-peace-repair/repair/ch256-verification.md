Model: opus

# Chapter 256 — Book Eleven (1812), Chapter 27 — independent verification

Files verified: `ch256-candidate.json` (pre-correction), `ch256-corrected.json`, `ch256-corrections-log.md`, `ch256-source.json`. Fidelity review `ch256-fidelity.md` read for context only; every verdict below was re-derived from the source, not from the log.

## 1. Diff vs log

Python diff of the two candidates, paragraph by paragraph (0-based indices):

| ¶ | Changed in file? | Logged? |
|---|---|---|
| 2 | yes | yes |
| 4 | yes | yes |
| 11 | yes | yes |

Three paragraphs changed; three logged. No logged change is absent from the file, no changed paragraph is absent from the log. **No mismatch.**

Non-paragraph structure (`number` 256, `title` "Book Eleven (1812) — Chapter 27", key set) is byte-identical between candidate and corrected.

## 2. Per-change verdicts (re-derived from source)

**¶2 — MODERATE (invented gloss) + MINOR (intention/intentions).**
Source: "…the idea that had previously occurred to him of the cabalistic significance of his name in connection with Bonaparte's more than once vaguely presented itself"; and earlier "confiding to him his intentions of remaining…".
Corrected: "…the idea that had previously occurred to him of the hidden meaning he had found in his own name set against Bonaparte's more than once vaguely presented itself"; "had confided his intentions of remaining…".
Verdict: **correct.** The fabricated em-dash clause ("the number of the Beast he had once worked out from the letters of his own name") is gone. No numeric claim, no "letters", no restriction to his own name alone survives; "set against Bonaparte's" preserves the source's pairing. "he had found" restates what the source itself carries with "the idea that had previously occurred to him", so it adds no new claim. "intentions" matches the source plural. The following sentence's "the power of the Beast" is untouched and still verbatim from source.
New finding (MINOR, non-blocking): "cabalistic" is rendered as "hidden meaning", which drops the Kabbalah allusion that "the power of the Beast" in the next sentence leans on. The reviewer's own proposal kept the word ("of the cabalistic significance of his name in connection with Bonaparte's"), and the log describes the change as "per editor's wording" when the editor's wording retained "cabalistic". This is a loss of an allusion, not an addition of meaning, so it does not block; worth a one-word restoration on any later pass.

**¶4 — MODERATE (severed callback to *they*).**
Source: "with the sole idea of not sparing himself and not lagging in any way behind them".
Corrected: "focused solely on not sparing himself and not lagging behind them".
Verdict: **correct.** "anyone" → "them" restores the pronoun link to "the class of men he mentally classed as 'they'" in ¶2, which the corrected ¶2 still carries. The MODERATE finding is fully answered.
Residual (MINOR, non-blocking): the intensifier "in any way" is still absent. The reviewer folded it into the same MODERATE entry; the substantive half — agency and the callback — is fixed, and the omission of an intensifier carries no claim.

**¶11 — MINOR (archaic register).**
Source: "'It is not I but the hand of Providence that punishes thee,' I shall say".
Corrected: same, with "thee".
Verdict: **correct and exact.** Matches the source word for word inside the inner quotation.

## 3. New-reader pass on the changed paragraphs

¶2 reads cleanly: the sentence no longer stalls on a parenthetical the reader has no context for, and "the hidden meaning he had found in his own name set against Bonaparte's" is intelligible on first pass without back-reference to chapter 186. ¶4 "not lagging behind them" is unambiguous in context — "them" is established two paragraphs earlier and is the only plural antecedent in play. ¶11 "punishes thee" is archaic by design and reads as the solemn declaration Pierre is rehearsing; no comprehension cost.

## 4. Structure and punctuation

- Paragraph count: source 28, candidate 28, corrected 28. Order unchanged; no paragraph merged, split or reordered.
- No empty or whitespace-only paragraphs.
- No paragraph falls below 75% of its source paragraph's word count.
- Question-mark parity with source: exact in all 28 paragraphs.
- Exclamation-mark parity: exact in 27 of 28. ¶17 has 3 vs the source's 2 — source "No, you shan't get it," he yelled" becomes "No, you shan't have it!" he yelled." This is a genuine restructuring of the quoted shout, it is present in the pre-correction candidate and was not introduced by this round, and the fidelity review did not raise it. Not blocking.

## 5. Findings for the record

- No MAJOR finding existed. Both MODERATE findings (¶2, ¶4) are addressed.
- Three MINOR findings the corrector declined — ¶0 ("The absorption of the French by Moscow" → "The spread of the French through Moscow", which reverses the figure's agent), ¶16 ("frowning with exertion" → "straining with effort"), ¶21 (Makar Alexeevich's mock-heroic archaism modernised) — are not recorded anywhere in the corrections log. The log format ("one entry per changed paragraph") does not require it, so this is not a diff/log mismatch, but the declines are undocumented. Process note, non-blocking. ¶0 is the one worth revisiting: it is the only declined MINOR that alters agency rather than register.
- No new drift was introduced by any of the three corrections.

Verification: ACCEPT
sha256: e2efb39eef58a071f958e88f208d90a2fca9be86fbc8d8b6f8bf2e2e9f985ac1
