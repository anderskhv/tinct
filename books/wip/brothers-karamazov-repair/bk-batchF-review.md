# Independent Review — Batch F (chapters 61–72), modern-en rendering

Reviewer: independent adversarial pass, not the drafting agent. Verified against
`bk-batchF-source.json` (Garnett) and `bk-batchF-modern-en.json`. Notes file
(`bk-batchF-notes.md`) treated as an unverified claim set, checked line by line
below.

## Verdict: **Accept as-is**

This is a genuine, high-quality modernization. Structural integrity is
perfect, fidelity holds up under close paragraph-by-paragraph reading of all
12 chapters (not just the drafter's flagged spots), and the prose is
substantively restructured, not a lemma-swap over Garnett. One trivial
formatting bug found (see below) — worth a one-line fix, not a re-draft.

---

## 1. Structural integrity (programmatic verification)

Ran an independent Python diff of both files, chapter by chapter:

- All 12 chapters present in both files, same order, same `number`/`title`.
- Paragraph counts match **exactly**, 1:1, for all 12 chapters (793 total).
  The drafter's table in `bk-batchF-notes.md` is correct in every row.
- JSON is valid (`python3 -m json.tool` clean).

No merges, splits, drops, or invented paragraphs anywhere in the batch.

## 2. Word-count ratio claim

Drafter claims: source 37,686 words → modern-en 36,924 words, ratio 0.98.

Independently recomputed via `str.split()` word counts on all 793 paragraph
pairs: **source 37,686 / modern-en 36,924 = 0.9798.** Confirmed exactly.

## 3. "No paragraph below 75%" — **claim is not accurate, but not a real problem**

The notes only explicitly claim "no paragraph fell below 60%" (true — verified,
0 paragraphs below 60%). The task brief asked me to also check the 75%
threshold from the project's own translation-rules floor (`books/AGENTS.md`
/ CLAUDE.md: "paragraph N ... should normally remain at least 75% of the
source paragraph's word count"). Independently computed: **6 paragraphs are
below 75%** (closest 0.73, furthest 0.64). All six are extremely short,
single-line dialogue beats where the shorter modern phrasing loses no content:

| Ch | Para | Source | Modern-en | Ratio |
|---|---|---|---|---|
| 64 | 36 | "Give me a little shot," he asked in an imploring voice. | "Give me a little shot," he begged. | 0.64 |
| 65 | 14 | "They are rogues." | "They're rogues." | 0.67 |
| 65 | 15 | "Who are rogues?" | "Who's rogues?" | 0.67 |
| 65 | 63 | "I am so glad it's Marya. Good-by!" | "I'm glad it's Marya. Goodbye!" | 0.71 |
| 69 | 43 | "I will certainly come in the evening." | "I will, certainly, this evening." | 0.71 |
| 71 | 3 | Alyosha made haste to thank her, and said that he had only just had coffee. | Alyosha hurried to thank her, saying he'd only just had coffee. | 0.73 |

None of these drop any content — they're just terser modern phrasing of a
one-clause line, which is exactly what "genuine modernization" should look
like on short dialogue. Flagging this only because the task asked me to
check the specific claim; it does not affect the verdict.

## 4. Fidelity — read in full, all 12 chapters

I read every chapter's full source/modern-en pairing (not just the drafter's
highlighted spots). No dropped clauses, no invented content, no meaning
inversions, no factual distortions found anywhere in the batch. Specific
checks:

- **Character-name spelling consistency**: counted all major name-spelling
  occurrences across the batch (Dmitri Fyodorovitch, Mitya, Grushenka/
  Agrafena Alexandrovna, Kolya/Krassotkin, Ilusha, Hohlakov, Mussyalovitch,
  Vrublevsky, Alyosha, Lise, Rakitin, Katerina Ivanovna, Kalganov, Smurov,
  Kartashov, Perezvon, Zhutchka, Snegiryov). All spelled consistently
  throughout; no drift within the batch.
- **Register / no softening**: Ch. 72 (Lise) — the blood-libel passage (a
  Jewish man on trial for crucifying and mutilating a four-year-old child),
  the pineapple-compote sadism dialogue, and the self-harm/"I want to
  destroy myself" material are rendered in full, unsoftened, matching tone
  and content exactly (checked paragraph-for-paragraph, ch. 72 paras
  43–49, 63–68, 77–78). Ch. 70 (Grushenka/Mitya jealousy) — fully rendered,
  no toning down.
- **Character voicing**: verified against the notes' specific claims —
  Kolya's pedantic/showing-off affectations (Latin/French tags, "sine qua
  non," political posturing about Christ-as-revolutionary and Byelinsky,
  the Troy-founders subplot) all land with the same self-important tone in
  modern phrasing (ch. 65, 67, 68). Grushenka's headlong, run-on emotional
  speech is preserved (ch. 61 testimony, ch. 70 jealousy monologue — "Am I
  blind? Don't I see?..."). Madame Hohlakov's rambling ch. 71 monologue is
  kept as a single ~3,650-character paragraph exactly matching the source's
  paragraph boundary, self-interrupting structure intact, genuinely
  rewritten sentence-by-sentence rather than lightly touched (full text
  compared side-by-side, matches).
- **Dostoevsky's Fyodor Pavlovitch absence claim**: confirmed — he does not
  appear as a speaking character in this batch (already dead by ch. 61);
  claim in notes is accurate.

## 5. Spot-checked specific judgment-call claims

- **French/Latin left untranslated**: confirmed — `_sine qua non_` (ch. 67),
  `_cette charmante personne_` / `_cette affaire_` (ch. 71), `Les femmes
  tricottent` (ch. 68), `_Ici_, Perezvon` (throughout ch. 64–69) all appear
  unmodernized in both source and modern-en, as claimed.
- **Verse fragments left unmodernized**: "Astounding news has reached the
  class, Kolbasnikov has been an ass" (ch. 67 para 85) and the Chain-bridge
  couplet (ch. 68 para 32) are reproduced verbatim in modern-en, as claimed.
- **Bible quotation** ("If I forget thee, Jerusalem...", Psalm 137, ch. 69
  paras 40/45): kept in traditional English, as claimed.
- **"PART IV" structural marker** (end of ch. 62): kept as-is, as claimed.
- **Footnote `[7]` after "Perezvon"** (ch. 69 para 16, Garnett's translator
  footnote): confirmed dropped from modern-en, while the joke content itself
  ("He hears the bell, but where it is he cannot tell. Good-by, we shall
  meet in Syracuse" — ch. 69 para 17) is fully preserved immediately after.
  Matches the notes' claim exactly.

All of the drafter's judgment-call claims in the notes file check out against
the actual text.

## 6. Genuine-modernization quality (the harder bar)

This is the part that matters most given this batch exists because the
previous modern-en was 77% mechanical/light. Assessed by reading dozens of
paragraphs the drafter did *not* flag as noteworthy, across all 12 chapters,
plus targeted markers:

- **Archaic-construction sweep**: grepped the whole batch for classic
  period-translation tells. Results: `I daresay` (1→0), `hither` (4→0),
  `whom` (12→5, and every remaining instance is a natural modern use —
  "jealous of whom," "with whom he could have left the children" — not
  archaic leftovers), `ejaculated`/`Pray`/`shan't`/`betwixt`/`forsooth`/
  `methinks` etc. — zero in both source and output (Garnett doesn't use
  these in this batch, so no test signal there, but nothing was
  reintroduced either).
- **Sentence restructuring, not word-swap**: representative example, ch. 65
  para 8 (Dardanelov's backstory) — Garnett's long subordinate-clause chain
  ("who had once already, about a year previously, ventured, trembling with
  fear and the delicacy of his sentiments, to offer her most respectfully
  his hand in marriage") becomes "had once already, about a year before,
  ventured — trembling with fear and the delicacy of his feelings — to
  offer her, most respectfully, his hand in marriage" — dashes replace the
  comma-chain, "sentiments" → "feelings," genuinely re-punctuated for
  contemporary readability, not just re-spelled.
- **Contraction discipline**: dialogue is consistently contracted
  ("wouldn't," "isn't," "I'll," "I've") throughout all 12 chapters — this is
  the single biggest, most consistent marker separating this from a
  Garnett-with-synonyms pass, and it holds up everywhere I checked, not just
  in the flagged paragraphs.
- **Register-appropriate word choices**: "abashed" → "intimidated," "flew
  into a terrible rage" → "flew into a towering rage" (kept, still natural),
  "old wives' tales" retained where idiomatic, "pseudo-great man" retained
  (still natural modern usage), "condescended" for "deigned" — these are
  real lexical modernization choices, not blind synonym substitution.
- Spot-checked several long expository/narrator paragraphs the drafter did
  not call out (ch. 61 opening, ch. 63 Kolya backstory, ch. 64 opening) —
  all show the same sentence-level restructuring quality as the flagged
  passages. This is not a case of the drafter polishing a few showcase
  paragraphs and leaving the rest mechanical.

**Conclusion**: this reads as natural, contemporary English throughout, not
period translation-ese with cosmetic changes. The distinction the project
exists to catch (77% mechanical/light in the prior pass) does not apply
here.

## 7. Issues found

1. **Minor formatting bug** — ch. 70, para 22: missing space/punctuation
   glitch — `"...so now I will!Ah, here's Fenya with a letter!..."` — should
   read `"...so now I will! Ah, here's Fenya with a letter!..."`. This is the
   only instance of this pattern found in a full-file regex sweep
   (`[a-z][.!?][A-Z]` with no space) across all 793 paragraphs. Trivial,
   one-character fix, does not affect content or register.
2. No other issues — no dropped content, no invented content, no character
   voice collapse, no softened/sanitized material, no name-spelling drift.

## Recommendation

**Accept.** Fix the single missing-space typo in ch. 70 para 22 before
publication (does not require re-drafting or a new review pass). No other
changes needed. The paragraph-count parity, word-ratio, judgment-call, and
character-voicing claims in `bk-batchF-notes.md` are all substantively
accurate (the one overstated claim — implying no paragraph fell under 75% —
is immaterial, since the six short paragraphs it would apply to lose no
content).
