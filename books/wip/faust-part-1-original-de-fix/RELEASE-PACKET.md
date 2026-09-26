# Release Packet — Faust Part I, original-de transcriber's-note removal

Status: candidate, small and independent of the larger English-source
decision (`books/wip/faust-part-1-source-decision/DECISION.md`). Not
published.

## What this fixes

`CONFIRMED-DEFECTS.md` G07-faust-part-1-14 (S1): the Project Gutenberg
#21000 transcriber's note (German + English, ~95 words, explaining that the
text follows the 1808 first edition and describing typographic
conventions) was appended directly onto the play's final line, "Heinrich!
Heinrich!", inside the same served paragraph (28.69).

## Candidate

| Item | Value |
|---|---|
| `editions/faust-part-1-original-de.json` | sha256 `0dff98ddf2336b64769fe76e1658b61abfe178dd1c5b121c54927296afdd7d65` — 28 chapters, same paragraph count/structure as live; only the last paragraph's trailing transcriber's-note text is removed |
| Replaces live sha256 | `edb0081f759c0eb256ed303711932af743784a87f1cc6716dab7d15365bc83e5` (matches the audit's reported prefix) |
| Change | Chapter 28 (Kerker/Dungeon), paragraph 69 (0-based, last paragraph): trimmed from `"STIMME. Heinrich! Heinrich!\n[Anmerkungen zur Transkription: ...]\n[Transcriber's Note: ...]"` to `"STIMME. Heinrich! Heinrich!"` — the play's actual final line, matching the German original's ending. |

## Verification

- Valid JSON.
- No other paragraph touched; chapter/paragraph counts unchanged (no
  reading-position or character-card remap needed).
- Checked `app/public/data/characters/faust-part-1.v1.json` for any mention
  anchored to chapter 28 paragraph 69 — none found, so no character-card
  impact.
- No threads file exists for this book.

## What independent review should check

Confirm the removed text is genuinely PG boilerplate (not part of the play)
and that nothing else in the paragraph was altered.
