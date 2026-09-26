# Acceptance — Jerusalem character-card mention fixes

**Status: ACCEPTED.** Independent review found the Gertrude replacement
correct on the first pass and one off-by-one offset error in the Hellgum
replacement (endOffset 143, included a trailing comma). Corrected to 142
and re-verified directly by this session: `paragraph[102:142]` exactly
equals `"married a Swede there named John Hellgum"`.

Both replacements are now final in `CHARACTER-CARD-MENTIONS-FIX.json`.
Codex applies these two mention updates to
`app/public/data/characters/jerusalem.v1.json`'s `modern-en` edition; no
other mention in that card is affected by this fix.
