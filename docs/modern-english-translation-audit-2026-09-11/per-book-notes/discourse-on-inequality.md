# discourse-on-inequality — *Discourse on the Origin of Inequality*, Jean-Jacques Rousseau (1755)

Reviewer: batch agent, Enlightenment/liberal political philosophy batch, 2026-09-11.
Scope: `public`. Translated work (French original; `original-fr` also shipped).

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-fr "Original (1755)" | `6d62dac119c1f5ce` | 4 | 170 | 30,142 |
| original-en "Cole (1913)", tr. G. D. H. Cole | `d3e7e7975ac634b9` | 4 | 170 | 31,639 |
| modern-en "Modern English" | `78356e4ffdf62ec2` | 4 | 170 | 30,692 |
| modern-da "Moderne Dansk" | `383db95bbf30559d` | 4 | 170 | 30,253 |

`en_editions_aligned: true`; no count mismatches, no truncation, no empty paragraphs;
`pct_identical_long_paragraphs: 0.0`, `mean_weighted_similarity: 0.7982` (the lowest — i.e.
most transformed — in this batch); `last_chapter_suspiciously_short: false`.

Structure: ch1 Dedication (26 paras) · ch2 Preface (25) · ch3 Part 1 (52) · ch4 Part 2 (67).

## Core English text — provenance and completeness

G. D. H. Cole's 1913 translation (the *Social Contract and Discourses* Everyman volume), the
standard PD English text. PD in the US (pre-1931). **EU/Denmark caveat: Cole died 14 January
1959, so under life+70 the translation is under copyright in the EU until 31 December 2029.**
Tinct operates from Denmark. Flagging as an **unresolved jurisdictional question**, not a
finding of infringement.

### Completeness defect — confirmed, substantive

**Rousseau's own endnotes ("Notes" / the Appendix to the Second Discourse) are entirely
absent from every edition of this book in Tinct.**

- `original-en` runs Dedication → Preface → Part 1 → Part 2, ending at ch. 4 para 66 ("I have
  endeavoured to trace the origin and progress of inequality…"). There is no Appendix chapter,
  no paragraph beginning with a bracketed number, and the string "Appendix" does not occur.
- 8 dangling `[n]` footnote markers remain in the body with no note text to point at.
- Project Gutenberg #46333 (the Cole volume Tinct's text comes from) lists **"Appendix"** as a
  distinct division following *A Discourse on the Origin of Inequality* — verified by fetching
  and reading its table of contents:
  https://www.gutenberg.org/files/46333/46333-h/46333-h.htm
- The missing material is not incidental. Rousseau's notes to the Second Discourse are long and
  substantive (they contain the discussion of the orangutan/anthropoid apes, the material on
  Carib society, the note on the state of nature and property). In Cole's edition they are on
  the order of 40% again of the length of the Discourse itself.
- `original-fr` (30,142 words) is likewise short of the notes, so the gap is in the ingest of
  both languages, not in the modernisation.

### Second defect — `original-fr` is not paragraph-aligned with the English

Paragraph counts match (170/170) but the *content* does not line up in the Dedication and the
Preface. Verified by index-wise word-count comparison and by reading:

- French ch2 ¶11 = *"En considérant la société humaine d'un regard tranquille et
  désintéressé…"*; English ch2 ¶11 = *"In proceeding thus, we shall not be obliged to make man
  a philosopher before he is a man."* The French ¶11 actually corresponds to **English ¶13–14**
  (the English splits it in two).
- Index-wise word-count ratio outside 0.6–1.7: **ch1 (Dedication) 5 mismatches of 26; ch2
  (Preface) 10 mismatches of 25**; ch3 (Part 1) 2 of 52; ch4 (Part 2) 4 of 67.
- So the split-pane French↔English comparison is broken for the Dedication and Preface and
  broadly correct for Parts 1 and 2. (Phase 1's `en_editions_aligned: true` only checked the
  English pair, so this was not flagged.)

## Phase 1 flags — confirmed / disconfirmed

- `mean_weighted_similarity: 0.7982` — **confirmed as genuine, deep modernisation.** Word-level
  measurement: only **5 of 160** long paragraphs ≥0.97 identical (3%, 2% of words); median
  word-similarity **0.869** — the deepest transformation in this batch after *Utilitarianism*.
- Per-chapter median word-similarity: `ch1 (Dedication) = 0.74 · ch2 (Preface) = 0.70 ·
  ch3 (Part 1) = 0.86 · ch4 (Part 2) = 0.93`. Effort falls off toward the end; all 5
  cosmetic-only paragraphs are in Part 2, clustered at ¶¶35, 45, 46, 50, 56, 58, 62, 64.
- `pct_identical_long_paragraphs: 0.0` — confirmed.
- `truncated_paragraphs_total: 0` / `empty_paragraphs_total: 0` — confirmed as *mechanically*
  clean; the real completeness problem (missing Appendix) is invisible to that check because
  the ingest is internally consistent.

## Samples inspected (6 passages, ~1,200 source words)

### 1. Dedication, para 1 (129 → 110 words) — the ideal republic. *Strong; deepest rewrite in the book (0.49).*
- source: "If I had had to make choice of the place of my birth, I should have preferred a
  society which had an extent proportionate to the limits of the human faculties; that is, to
  the possibility of being well governed: in which every person being equal to his occupation,
  no one should be obliged to commit to others the functions with which he was entrusted"
- modern: "If I had been able to choose where to be born, I would have chosen a society sized
  to the limits of human capacity—that is, to what can actually be well governed; one where
  each person can match his own role, so that no one is forced to delegate the duties entrusted
  to him"
- Finding: faithful and much clearer; the four-part list survives intact and ends on Rousseau's
  point exactly ("would make love of country mean love of fellow citizens rather than love of
  the land"). Note the **unspaced em-dash** here vs. spaced em-dashes elsewhere in the same
  edition — typographic inconsistency.

### 2. Preface, para 3 (108 → 85 words) — the biggest shrink in the book (ratio 0.79). *Strong; no loss.*
- source: "It is, in fact, not to be conceived that these primary changes, however they may
  have arisen, could have altered, all at once and in the same manner, every individual of the
  species. It is natural to think that, while the condition of some of them grew better or
  worse, and they were acquiring various good or bad qualities not inherent in their nature,
  there were others who continued a longer time in their original condition."
- modern: "It is not, in fact, conceivable that these primary changes, however they arose,
  altered every individual of the species at the same time and in the same way. Naturally, while
  some grew better or worse, acquiring various good or bad qualities not inherent in their
  nature, others remained longer in their original condition."
- Finding: I checked this specifically because the 21% word reduction looked like an omission.
  It is not — every claim, including the "not inherent in their nature" qualification and the
  closing "much easier to demonstrate in these general terms than to assign with any precision
  to its actual causes", survives. The shrink is Cole's Victorian padding coming out.

### 3. Preface, para 11 (217 → 200 words) — animals and natural law. *Strong, but one added hedge.*
- source: "as they partake, however, in some measure of our nature, in consequence of the
  sensibility with which they are endowed, **they ought to partake of natural rights** so that
  mankind is subjected to a kind of obligation even toward the brutes."
- modern: "but since they share something of our nature through their capacity to feel, **we may
  judge that** they too ought to participate in natural rights, and that human beings owe them
  some sort of duty."
- **Finding: "we may judge that" is an epistemic hedge not present in Cole (or in Rousseau's
  *ils doivent participer du droit naturel*).** Rousseau asserts; the modern edition softens the
  assertion into a permission to infer. Small, but it is an addition, and it weakens a claim in
  a passage that is one of the earliest arguments for animal moral standing. Local defect.
- Also in this paragraph: "make man a philosopher before he is a man" → "make a person into a
  philosopher before he is a person", which de-genders *man* while keeping *he*, and loses
  Rousseau's pointed repetition of the same word. Minor voice loss.

### 4. Part 1, para 0 (282 → 259 words) — the opening of the argument proper. *Strong.*
- source: "I shall not ask whether his long nails were at first, as Aristotle supposes, only
  crooked talons; whether his whole body, like that of a bear, was not covered with hair; or
  whether the fact that he walked upon all fours, with his looks directed toward the earth,
  confined to a horizon of a few paces, did not at once point out the nature and limits of his
  ideas."
- modern: "I will not ask whether his long nails were at first, as Aristotle supposes, only
  crooked talons; whether his whole body, like that of a bear, was covered with hair; or whether
  his walking on all fours, with his gaze fixed on the ground and limited to a horizon of a few
  paces, did not at once mark out the character and the limits of his ideas."
- Finding: images kept as images (bear, talons, horizon of a few paces), not converted to
  explanation. "his organisation" → "his anatomy" is a correct period-sense gloss.

### 5. Part 2, para 0 (148 → 147 words) — **the famous opening on private property.** *Strong; polemical edge largely kept. Checked against the French.*
- Cole: "The first man who, having enclosed a piece of ground, bethought himself of saying This
  is mine, and found people simple enough to believe him, was **the real founder** of civil
  society. **From how many crimes, wars and murders**, from how many horrors and misfortunes
  **might not any one have saved mankind, by** pulling up the stakes… 'Beware of listening to
  this impostor; **you are undone** if you once forget that the fruits of the earth, belong to
  us all, and the earth itself to nobody.'"
- modern: "The first man who, having enclosed a piece of ground, took it into his head to say
  This is mine, and found people simple enough to believe him, was **the true founder** of civil
  society. **How many crimes, wars, and murders**, how many horrors and misfortunes **might
  mankind have been spared if someone had** pulled up the stakes… 'Beware of listening to this
  impostor; **you are ruined** if you forget that the fruits of the earth belong to all and the
  earth itself to no one.'"
- French (`original-fr` ch4 ¶0): *"fut **le vrai fondateur** de la société civile… **vous êtes
  perdus**, si vous oubliez que les fruits sont à tous, et que la terre n'est à personne !"*
- Finding: the modern is actually **closer to Rousseau than Cole is** — *le vrai fondateur* is
  "the true founder", *vous êtes perdus* is "you are ruined". The one cost: Cole's active
  rhetorical construction ("might not any one have saved mankind, by pulling up the stakes")
  becomes a passive ("might mankind have been spared if someone had pulled up the stakes"),
  which softens the imagined agent slightly. Mild flattening; the polemical force survives.

### 6. Part 2, para 46 (123 words) — the mechanical outlier at the untouched end. *Near-verbatim.*
- Word-similarity **0.992**; only punctuation and one connective differ. Part 2's closing third
  is materially less worked than the Dedication and Preface.

## What I did NOT find

No omissions inside the text that is present, no chapter-bleed, no name/term inconsistency, no
invented historical facts or motives, no smoothing of Rousseau into neutral academic prose. The
polemical register is preserved. The only invention found in six samples is the "we may judge
that" hedge in the Preface.

## Phase 3 — human-edition research

Core English text is itself an old translation, so a better human translation is the right
target.

1. **G. D. H. Cole (1913)** — the incumbent. Complete *apart from Tinct's own ingest gap*.
   Project Gutenberg #46333 has the full text **including the Appendix of Rousseau's notes**:
   https://www.gutenberg.org/files/46333/46333-h/46333-h.htm — the direct fix for the
   completeness defect. Standard Ebooks also publishes Cole (CC0 for their production work).
   US: public domain. EU/Denmark: see the Cole-died-1959 caveat above — **unresolved**.
2. **The 1761 anonymous English translation** (*A Discourse Upon the Origin and Foundation of
   the Inequality Among Mankind*, London: Dodsley) — unambiguously PD in every jurisdiction,
   but 18th-century English, so it would make readability *worse*, not better. Not pursued.
3. **Jonathan Bennett, *Early Modern Texts*** — I checked the catalogue at
   https://www.earlymoderntexts.com/texts and **the Discourse on Inequality is NOT among the
   Rousseau texts offered** (the Social Contract is). So the usual fallback does not even exist
   here; and it would in any case be rights-blocked (*"Permission is not and will not be given
   for the texts to be put to any commercial use"*, https://www.earlymoderntexts.com/faqs/rights).
4. Modern scholarly translations — Maurice Cranston (Penguin 1984), Victor Gourevitch
   (Cambridge 1997), Donald Cress (Hackett 1992), Judith Bush/Roger Masters (Dartmouth/UPNE) —
   are all **in copyright, permission required**.

Conclusion: **no rights-clear human modern-English translation found in this search.** The
current AI modern-en is the best modern-English option available to Tinct, and it is good; the
real work is restoring the missing Appendix and fixing the French alignment.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 3 |
| first-read clarity | 25% | 5 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 4 |
| naturalness | 5% | 5 |

Weighted score **3.9** — band: **Good with fixes**.

Fidelity 3 is driven almost entirely by the missing Appendix of Rousseau's notes — a
substantive omission, even though it originates in the ingest rather than the translation. On
the text that *is* present, fidelity would rate 5. Restraint 4 for the "we may judge that"
hedge. Clarity 5: this is the clearest-reading modern edition in the batch.

## Recommendation

**LIGHT EDIT** — the translation itself needs almost nothing; the *edition* needs completing.

1. **Ingest Rousseau's notes (the Appendix in Cole / Gutenberg #46333) into `original-en` and
   `original-fr`, then produce them in `modern-en` and `modern-da`.** Until this is done, the
   book is incomplete and the 8 dangling `[n]` markers are visible to readers.
2. Re-align `original-fr` against `original-en` for the Dedication and Preface (the French
   Preface ¶11 is split across English ¶13–14; ~15 of 51 paragraphs across ch1–ch2 are off).
3. Preface ¶11: drop the added "we may judge that"; restore Rousseau's assertion.
4. Normalise em-dash spacing (ch1 ¶1 uses unspaced, elsewhere spaced).
5. Optionally deepen Part 2's closing third (¶¶45–66, median 0.93).

- Confidence: **medium-high** on translation quality (6 passages across all four divisions,
  including two checked against the French); **high** on the completeness and alignment findings,
  which are mechanical.
- Correction scope: **substantial** — not because the translation is bad, but because ~12–14k
  words of Rousseau's notes have to be sourced, ingested and rendered in three editions.

## Limitations of this review

Six passages, ~1,200 source words of 31,639. I read the French only for two paragraphs
(ch4 ¶0 and ch2 ¶11) — the other fidelity judgements are Cole-relative. I did not check
`modern-da`. I did not read the 1761 translation or any in-copyright modern translation. I did
not measure the exact word count of Cole's missing Appendix (I verified its existence in the
Gutenberg table of contents but did not fetch and count the text). I did not verify Cole's EU
rights position with anyone qualified.
