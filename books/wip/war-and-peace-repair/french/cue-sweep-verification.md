Model: opus

# French cue sweep — independent verification (ch18, ch115, ch38) — 2026-09-18

Verifier is not the editor. These three edits were made **in place**, so the predecessor for each file is
`git -C /home/user/tinct show HEAD~3:books/wip/war-and-peace-repair/french/<file>` (HEAD~3 = `4ab98bc87`,
the last commit before `ffe492124` "French cue sweep (ch18, ch115)" and `41cc35d34` "ch38 Buonaparte pun").
Each predecessor was extracted to a scratch file and diffed against the working file with Python, paragraph
by paragraph. The logs' `Before` strings were then checked against the extracted predecessors independently —
both routes agree.

Convention applied: `books/prompts/modern-en-repair/french-pass.md` rules 1–5.

---

## Summary

| File | Changed indices (computed) | Logged indices | Match | number/title | paras | BLOCK |
|---|---|---|---|---|---|---|
| `french/ch18-french-r2.json` | [3] | p3 | yes | 18 / Book One (1805) — Chapter 18, unchanged | 37 → 37 (src 37) | 0 |
| `french/ch115-french.json` | [1, 3] | p1, p3 | yes | 115 / Book Six (1808 - 10) — Chapter 9, unchanged | 9 → 9 (src 9) | 0 |
| `french/ch38-french-r2.json` | [33] | p33 | yes | 38 / Book Two (1805) — Chapter 10, unchanged | 44 → 44 (src 44) | 0 |

No unlogged paragraph changed in any of the three files; no logged change is missing from any file. No empty
paragraphs. Top-level keys unchanged (`number`, `title`, `paragraphs`). Chapter-level `?` / `!` totals
unchanged in all three (ch18 11/8, ch115 0/0, ch38 20/17), and per-paragraph parity with the source holds for
every changed paragraph (see each section).

---

## ch18 — `french/ch18-french-r2.json`, p3 (cue added mid-sentence)

Log section: `## Cue sweep` in `french/ch18-french-r2-log.md`. Its `Before`/`After` are byte-identical to the
HEAD~3 and working paragraphs.

**Change:** `...make your fortune off the government—you want...` → `...make your fortune off the government
(in French)—you want...`

**Source (p3):** `"Well, then, old chap, mon très honorable Alphonse Kárlovich," said Shinshín, ... "Vous
comptez vous faire des rentes sur l'état; * you want to make something out of your company?"`

**Justified.** Maude gives the first clause of the speech in French and the rest in English within the same
quoted sentence — a mid-paragraph switch. Rule 2 requires the cue once per paragraph; the `tag-no-slot` /
mid-sentence guidance puts it **at the switch point**, which is exactly where the em dash falls. Placing it
after the speech verb (`said Shinshin`) or at the closing quote would have marked the whole speech as French,
which is false: the second clause is Maude's English. The cue is a bare `(in French)`, never a bracket tag.

**No drift.** Nothing else in the paragraph moved; word count 48 vs source 49, `?` 1 / `!` 0 in both.
The footnote slot p4 is `* Vous comptez vous faire des rentes sur l'état;` — rule 4 satisfied (slot carries the
source's foreign wording, prefixed `* `), and it is untouched by this edit.

**Reads well:** the reader sees which half of the sentence was French without a tag interrupting the voice.

---

## ch115 — `french/ch115-french.json`, p1 (cue added) and p3 (slot `(2) ` prefix dropped)

Log section: `## Cue sweep` in `french/ch115-french-log.md`. Both `Before`/`After` pairs are byte-identical to
the HEAD~3 and working paragraphs.

### p1 — cue added

**Change:** `...had somehow acquired the reputation of being as charming and witty as she was beautiful.` →
`...had somehow acquired the reputation (in French) of being as charming and witty as she was beautiful.`

**Source (p1):** `...his wife had succeeded in gaining the reputation "d' une femme charmante, aussi
spirituelle que belle." *(2)`

**Justified.** Maude prints this phrase in French with a numbered footnote; the modern-en had already
translated it inline but carried no cue, so the reader could not tell that the salon's verdict on Hélène was
delivered *in French* — the point of the whole paragraph, whose first French phrase (`C'est un superbe animal`)
already carries `(in French)` at p1's earlier switch. The cue is placed at the switch point, immediately before
the translated phrase, matching the ch18 treatment and rule 2's once-per-paragraph limit. Two cues in one
paragraph is correct here because the paragraph contains two separate French quotations, each footnoted
separately in Maude (slots p2 and p3).

**No drift.** Only the three cue words were inserted in a 297-word paragraph (source 301); `?` 0 / `!` 0 in
source and candidate.

### p3 — slot normalised

**Change:** `* (2) D'une femme charmante, aussi spirituelle que belle.` → `* D'une femme charmante, aussi
spirituelle que belle.`

**Justified.** Rule 4: the slot carries the source's foreign wording prefixed `* `, and nothing else. The
`(2) ` was Maude's typographic footnote numbering carried over by mistake; in modern-en the slots are not
numbered — sibling slot p2 (`* C'est un superbe animal.`) never had one, so the file was internally
inconsistent before the fix. The French wording itself is unchanged and still matches Maude's dialogue
paragraph. Rule 4 applies rather than rule 5 because Maude's footnote here is a translation, not a gloss, so
the slot holds the French.

---

## ch38 — `french/ch38-french-r2.json`, p33 (first `Bonaparte?` → `Buonaparte?`)

Log section: `## Cue sweep` in `french/ch38-french-r2-log.md`. Its `Before`/`After` are byte-identical to the
HEAD~3 and working paragraphs.

**Change:** `"Bonaparte?" said Bilibin inquiringly...` → `"Buonaparte?" said Bilibin inquiringly...`

**Source (p33):** `"Buonaparte?" said Bilíbin inquiringly, puckering up his forehead to indicate that he was
about to say something witty. "Buonaparte?" he repeated, accentuating the u: "I think, however, now that he
lays down laws for Austria at Schönbrunn, il faut lui faire grâce de l'u! * I shall certainly adopt an
innovation and call him simply Bonaparte!"`

**Justified — and this was a real fidelity bug, not a style tweak.** Maude has `Buonaparte?` **both** times.
Bilíbin's whole joke is a three-beat move on one letter: say the Italianate *Buonaparte* twice, announce that
the u must be pardoned, then adopt the French *Bonaparte*. With the first instance spelled `Bonaparte`, the
repetition "accentuating the u" had no antecedent, the single closing `Bonaparte!` was no longer a change of
anything, and the French tag `il faut lui faire grâce de l'u` glossed a joke the paragraph had not made.
Restoring Maude's spelling restores the pun. The fix is exactly one character, at exactly the logged place.

**No drift.** Word count 59 vs source 56; `?` 2 / `!` 2 in source and candidate — parity holds, i.e. the
restored token did not disturb the sentence structure. Rule 5 handling in the same paragraph is untouched and
correct: the French tag stays inline with its English immediately after (`— we really must drop the 'u.'`), and
the footnote slot p34 keeps Maude's **English** footnote `* "We must let him off the u!"` rather than
reprinting the French — precisely what rule 5 requires.

---

## Mechanical checks

`python3 /home/user/tinct/books/edition_checks.py war-and-peace --candidate <file>` on each of the three files:

| File | blocks | chapter-scoped flags |
|---|---|---|
| `french/ch18-french-r2.json` | 0 | `long-sentence ch18 p11 (71w)`, `long-sentence ch18 p35 (53w)` |
| `french/ch115-french.json` | 0 | `long-sentence ch115 p1 (73w)`, `long-sentence ch115 p4 (55w)` |
| `french/ch38-french-r2.json` | 0 | `long-sentence ch38 p41 (61w)` |

**0 BLOCK on all three.** No `bracket-tag`, no `footnote-slot-bare`, no `footnote-orphan-marker`, no
`inline-marker-with-slot` flag for ch18, ch115 or ch38. The `long-sentence` flags are pre-existing Tolstoy
sentence length in paragraphs other than the edited ones (ch115 p1 is long in the source too, 301 words, and
was long before the cue). All other flags emitted by the tool (`title-sequence`, `title-duplicate`,
`name-variant`) are book-wide properties of the assembled 361-chapter edition and are identical whichever
chapter is passed as `--candidate`; none is attributable to these three files.

## New findings

None blocking. One out-of-scope item for a later pass, **pre-existing and not touched by this sweep**:
`french/ch18-french-r2.json` p15 reads `(Hors d'oeuvres.)` where rule 4 as amended (2026-09-18) calls for
`* Hors d'oeuvres.` — a gloss slot that still carries parentheses and has lost its `* ` prefix. Source p15 is
`* Hors d'oeuvres.` The checker does not flag it (without the `* ` prefix it is not recognised as a slot at
all, which is itself why it slipped through). It is identical in the HEAD~3 predecessor, so it is not a
regression from the cue sweep and does not affect acceptance of p3. Recommend folding it into the next ch18
touch.

Verification: ACCEPT
sha256: french/ch18-french-r2.json af1c474bcbcb816710dbc9236bce7a3627a468911e8b278faf1e4d1491d105a7
sha256: french/ch115-french.json 7f300f420a8db4437f08a9998a6e56ada7a2c667bbc39c0fbae90bcfcd0a186c
sha256: french/ch38-french-r2.json 2125e39ba9fd662ceb29d9fa1d9d82b8f673b6ac27581602fe32783a930d1c77
