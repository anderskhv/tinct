# Independent Review — Faust Part I, `modern-da` full replacement

Reviewer: independent pass, formed before reading `RELEASE-PACKET.md`.

## Verdict: ACCEPT

Two minor, cosmetic defects found (listed below), neither of which
constitutes dropped, invented, or softened content. Recommend fixing
both before/at publication, but neither blocks acceptance of the
translation itself.

## Structural checks (all pass)

- **Chapter/paragraph counts**: exactly 28 chapters, 1,060 total
  paragraphs, and every one of the 28 per-chapter counts matches
  `faust-part-1-modern-en.json` exactly (verified programmatically,
  chapter by chapter — no mismatches).
- **Valid JSON**: loads cleanly, single top-level `chapters` key, same
  shape as the English file.
- **No empty paragraphs** anywhere in the 1,060.
- **No leftover English / placeholders**: scanned for `TODO`,
  `TRANSLATE`, `FIXME`, `XXX`, `[EN]`, and a stopword-ratio heuristic
  across every paragraph — no leakage found (six heuristic hits were all
  false positives, short idiomatic Danish sentences).
- **No length-ratio outliers**: computed `len(da)/len(en)` for all 1,060
  paragraph pairs; every single one falls in a normal range (no
  truncation, no padding/invention at scale).
- **No duplicate consecutive paragraphs** (a common copy-paste artifact
  in multi-batch merges) — none found.
- **Stage-direction formatting** is uniform across all 28 chapters and
  all 5 batch boundaries: `[...]` for free-standing stage directions,
  `(...)` for inline parentheticals attached to a speaker tag — matching
  the English source's own convention throughout, with no drift between
  batches.

## Content sampling (weighted across all 5 batches)

Checked in full against the English, side by side, paragraph by
paragraph:

- **Ch 3, Prologue in Heaven** (batch 1-6): complete, faithful, wager
  dialogue intact.
- **Ch 6/7 boundary, "In the Beginning was the Word" passage** (batch
  1-6 / 7-8 split point): the full four-line progression is present and
  correct — "I begyndelsen var **Ordet**" → "**Tanken**" →
  "**Kraften**" → "**Gerningen**" — matching Word→Thought→Power→Deed
  exactly, in one unbroken paragraph as in the English.
- **Ch 8, Auerbach's Cellar** (batch 7-8): drinking songs, the rat song
  and chorus, all present and lively; nothing dropped.
- **Ch 9, Witch's Kitchen nonsense verse** (batch 9-13): the witch's
  arithmetic rhyme ("Gør ti af en, og lad to gå...") is complete and
  matches the English's numeric sequence exactly.
- **Ch 17, Faust's Earth-Spirit monologue** (batch 14-19): complete.
- **Ch 18, "Meine Ruh ist hin"** (batch 14-19): full song present,
  all three refrains and both verses, faithfully rendered.
- **Ch 19, the Gretchen Question** (batch 14-19): full religious
  dialogue present, faithful.
- **Ch 22, Valentine's death curse** (batch 20-28): **unsoftened**.
  "en luder" (a whore) is used exactly where the English has "a whore";
  Martha is called "din berygtede alfons" (you infamous pimp), matching
  the English's "infamous pimp" without euphemism.
- **Ch 23, Cathedral scene** (batch 20-28): complete, including the
  untranslated Latin choral lines (`Dies irae...`, `Judex ergo...`)
  preserved verbatim as in the English.
- **Ch 24, Walpurgis-Night** (batch 20-28): bawdy witch/wizard verses
  checked directly — "barnet kvæles, moderen sprænges" (the child is
  smothered, the mother bursts open) and the "thousand steps"
  couplet are present unsoftened; the beautiful-witch dance scene and
  the Perseus/severed-head exchange are intact.
- **Ch 25, Walpurgis-Night's Dream** (batch 20-28): complete, all named
  cameo speakers present (Oberon, Titania, Puck, Ariel, etc.).
- **Ch 26, "Gloomy Day"** (batch 20-28): correctly rendered as prose (not
  verse), matching the English's own prose formatting for this scene.
- **Ch 28, full Dungeon ending** (batch 20-28): Gretchen's infanticide
  confession is unsoftened — "Jeg har slået min egen mor ihjel; jeg har
  druknet barnet" (I've put my own mother to death; I've drowned the
  baby) — matching the English exactly, no euphemism substituted. The
  scene runs complete through her madness and the final fading cry,
  ending on "STEMME (indefra, der dør hen). Henrik! Henrik!" — matching
  the English's "Henry! Henry!" precisely.

Also spot-checked (secondary sample, no defects): ch 13 (Naboens hus),
ch 15 (Have), ch 20 (Ved brønden) — opening, midpoint, and closing
paragraphs of each checked against the English; all faithful.

## Speaker-tag / naming consistency across batch boundaries

Extracted every distinct all-caps speaker tag in the document (100+
distinct tags) and did full-document, case-insensitive substring counts
for the main and side-character names. Result: **no spelling variants
found anywhere**.

- `MEFISTOFELES` — 223 speaker-tag occurrences, spelled identically
  every time; zero occurrences of `MEPHISTOFELES` or any other variant.
- `MARGRETE` — 80 speaker-tag occurrences, zero `GRETCHEN`/`GRETE`
  variants in dialogue or speaker tags.
- `MARTHE` — 30 speaker-tag occurrences, zero `MARTHA` variants.
- `FAUST`, `WAGNER`, `SIEBEL`, `FROSCH`, `BRANDER`, `ALTMAYER`,
  `VALENTIN`, `LISBETH`, `HEKSEN` and every Walpurgis-Night's-Dream
  cameo name (`OBERON`, `PUCK`, `ARIEL`, `TITANIA`, `BAUBO`, etc.) each
  appear with exactly one spelling throughout, including across the
  ch9/10, ch13/14, ch19/20 and ch24/25 batch-scope boundaries.
- Faust's nickname at the ch28 ending is `Henrik` throughout (6
  occurrences), used consistently in both Gretchen's and the closing
  voice's lines — no `Henrich`/`Heinrich` variant crept in.

## Defects found (both minor, cosmetic)

1. **Chapter-title spelling drift** (not a body-text/dialogue issue):
   Chapter 18's title is `"Margaretes værelse"` and chapter 22's title is
   `"Nat. Gaden foran Margaretes dør"` — both use the literal-translation
   genitive `Margaretes` (from the English "Margaret's"), while the
   character is consistently `Margrete`/`Margretes` everywhere in the
   body text, including within chapter 22 itself ("Margretes bror" in
   the stage direction one line into the same chapter whose title says
   "Margaretes"). This looks like the chapter titles were translated
   independently from the English titles rather than drawn from the
   body's established spelling. Recommend normalizing both titles to
   `Margretes værelse` / `Nat. Gaden foran Margretes dør` before
   publication.
   - Location: `chapters[17].title`, `chapters[21].title`.

2. **Minor grammatical glitch, one paragraph**: chapter 6, paragraph
   index 1 (Faust's "In the Beginning was the Word" monologue) contains
   the clause `"hvor meget stærkere end min vilje end bliver"` — the
   word `end` appears twice in a way that doesn't parse correctly in
   Danish (idiomatic word order would be `"hvor meget stærkere min
   vilje end bliver"`, using `end` only once, in its "no matter how"
   sense). This is a local grammar slip, not a content or fidelity
   problem — the surrounding translation of this same paragraph (all
   four Word/Thought/Power/Deed lines) is otherwise complete and
   accurate.
   - Location: `chapters[5].paragraphs[1]`.

## Summary

This is a large, freshly-produced, unreviewed translation, and the
5-batch merge process held up well: paragraph counts are exact
chapter-by-chapter, no content was dropped or invented anywhere I
sampled (spread deliberately across all 5 batches and weighted to the
darkest/most important scenes), the required dark content (Valentine's
insults, the infanticide confession, the Walpurgis-Night bawdiness) is
preserved unsoftened, and cross-batch naming consistency — including
side characters the original author's own spot-check didn't call out by
name — held up under a full-document search. The only issues found are
the two minor items above, both easy fixes, neither affecting content
fidelity.

**Recommendation: ACCEPT**, with the two listed fixes applied before or
at publication.
