# Jane Eyre — Chapter 36 modern-en repair notes

## Scope of change (script-verified)

Diffed `ch36-corrected.json` against `ch36-current-modern-en.json` programmatically
(index-by-index comparison of the `paragraphs` array, both 80 entries, `number: 36`).

**Exactly one paragraph changed: index 48 (0-based).** This matches the audit's
"paragraph 48" reference and is the innkeeper's account of the Thornfield fire
(source paragraph 48 — same 0-based index in `ch36-source.json`).

No other paragraph (0–47, 49–79) differs by a single character from
`ch36-current-modern-en.json`. Neighboring paragraph 49 ("What! He didn't leave
England?") was checked and left untouched — see continuity note below.

## What was wrong (paragraph 48)

1. **Fire geography inverted.** Current text had Bertha going *up* to the third
   floor to burn the governess's old room, then *down* to burn "the hangings in
   the room where her husband was sleeping." Source has the opposite and correct
   sequence: she fires the hangings of the room **next to her own** first, then
   goes **down** to the governess's old chamber and fires the (empty) bed there.
   Rochester was never in the room she burned — the current text put him there
   and had him "already woken" in it, which is not in the source.
2. **Invented continuation removed.** The fabricated material about Rochester
   waking to a blazing floor, saving the servants, then going back for his wife
   was cut — none of this is in the source paragraph (it belongs, in a different
   form, later in the chapter, but not here and not phrased this way).
3. **~150 words of omitted content restored:** Rochester's desperate, futile
   search for Jane ("sought her as if she had been the most precious thing he
   had in the world"), his growing savagery and withdrawal after failing to find
   her, Mrs. Fairfax being pensioned off with a lifetime annuity, Adèle being
   sent to school, and Rochester breaking off with the local gentry and shutting
   himself up like a hermit at the Hall.
4. **Modernization quality**: rewritten in the same natural, contemporary voice
   as the rest of the chapter (matching the innkeeper's register already
   established in neighboring paragraphs), not archaic-with-swapped-vocabulary.
   Straight-quote style (`'`/`"`) matched to the rest of the file rather than
   curly Unicode quotes, so the paragraph is typographically consistent with
   its neighbors.

Word count check: source paragraph 48 is 351 words; the corrected rendering is
312 words (89% of source), comfortably above the 75% floor and appropriate for
a modern-English condensation that drops no clauses or claims.

## Continuity check (item 4 in the task)

Paragraph 49 in the current file reads: **"What! He didn't leave England?"**

With the "hermit" detail restored at the end of paragraph 48 ("He broke off
with all the local gentry and shut himself up at the Hall like a hermit"),
paragraph 49's question now follows naturally — the reader/narrator is
reacting to hearing that Rochester shut himself away rather than leaving the
country, which is exactly the premise the question tests ("What! He didn't
leave England?" = surprise that a man in that state of withdrawal stayed put
rather than fleeing abroad). This matches the source, where the same question
follows the same "hermit" sentence verbatim.

**No change was needed to paragraph 49 or any other neighboring paragraph.**
The flow is restored purely by fixing paragraph 48.

## Files

- Corrected chapter: `/home/user/tinct/books/wip/jane-eyre-repair/ch36-corrected.json`
- These notes: `/home/user/tinct/books/wip/jane-eyre-repair/ch36-repair-notes.md`
