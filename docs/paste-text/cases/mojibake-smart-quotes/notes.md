# mojibake-smart-quotes — notes

Synthetic `text/plain` (UTF-8, CRLF, with BOM). Inspect the input with `cat -A` or a hex viewer: several characters are invisible.

Rules tested:

- R02a BOM (`U+FEFF`) at the start removed; CRLF → LF.
- R02b Mojibake repair, run per text run, only where it is unambiguous: sequences that are UTF-8 bytes decoded as Windows-1252/Latin-1 (`â€™` → `’`, `â€”` → `—`, `â€œ` → `“`, `â€¦` → `…`, `Ã£` → `ã`, `Ã¡` → `á`) are re-decoded. Double-encoded `Ã¢â‚¬â„¢` → `’` (apply twice while the result gets shorter and every step is valid UTF-8).
- R02c Lost byte: `â€` + U+FFFD (the `0x9D` of `”` has no Windows-1252 character and became the replacement character) → `”` when an unmatched `“` precedes it in the same sentence. This is the one heuristic repair; anything else with U+FFFD is left alone.
- R02d Correct text is untouched: the second "São Paulo", "Zürich", the real em dashes and the curly apostrophe in the last paragraph. A repair must never be applied to text that already decodes as sensible UTF-8 (test: the repaired string must contain fewer of `Ã â Â` than the original).
- R02e `U+00A0` no-break space → normal space; `U+00AD` soft hyphen removed ("type­setter" → "typesetter"); `U+200B` zero-width space removed (and the doubled space it leaves collapses).
- R02f No typographic "smartening": straight quotes, `'`, `--` and `...` stay as the writer typed them. (Q13 asks whether `--` should become an em dash.)
- R31a Title from a short first line with no end punctuation followed by a blank line.
