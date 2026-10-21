# tiny-paragraph — notes

One sentence, `text/plain` only (37 words).

Rules tested:

- R32a A tiny paste is accepted (no minimum length) and becomes one section with one paragraph. Primer and quiz should be skipped or reduced below a threshold (open question Q12: what is the minimum for a primer/quiz?).
- R31a Title fallback when there is no heading: the first clause of the first sentence, cut at the first comma/verb boundary if longer than 8 words, never more than 12 words, no trailing punctuation → "The best time to read a long novel". The full sentence stays in the body (the title is not removed from the text when it was derived, only when it was a heading).
- R31b Author empty; language detected as `en` even from 37 words (stop-word ratio).
- The trailing newline in the clipboard is not an empty paragraph.
