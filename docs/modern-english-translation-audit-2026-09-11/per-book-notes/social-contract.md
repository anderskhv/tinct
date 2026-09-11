# social-contract — *The Social Contract*, Jean-Jacques Rousseau (1762)

Reviewer: batch agent, Enlightenment/liberal political philosophy batch, 2026-09-11.
Scope: `public`. Translated work (French original).

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | sections |
|---|---|---|---|---|---|
| original-en "Cole (1913)", tr. G. D. H. Cole | `7bf5ababb7c4dfe1` | 48 | 491 | 44,073 | 4 |
| modern-en "Modern English" | `cf7facb77bfc5baf` | 48 | 491 | 43,231 | 4 |
| modern-da "Moderne Dansk" | `2b6fcfad924735d9` | 48 | 491 | 40,640 | 0 |

`en_editions_aligned: true`; no count mismatches, no truncation, no empty paragraphs;
`pct_identical_long_paragraphs: 1.0`, `mean_weighted_similarity: 0.8425`;
**`last_chapter_suspiciously_short: true`, `last_chapter_word_count: 84`.**

## Core English text — provenance and completeness

G. D. H. Cole's 1913 translation (Everyman's Library), the standard public-domain English
*Social Contract*. Public domain in the US (published before 1931) and in the EU/Denmark
(Cole died 1959; life+70 expired 2030 — **note: Cole d. 14 Jan 1959, so EU copyright in the
translation runs to 31 Dec 2029**; see rights note below).

Structure verified complete: Book 1 (9 chapters), Book 2 (12), Book 3 (18), Book 4 (9) = 48,
matching Rousseau. `sections` metadata correctly groups them into the four Books.

**Completeness defect (affects all editions equally, inherited from the source ingest):**
`original-en` contains **47 footnote reference markers of the form `[1]`…`[n]` but no footnote
text anywhere** — no paragraph in any chapter begins with a bracketed number, and there is no
"Appendix"/"Notes" section. Rousseau's own footnotes are substantive (e.g. the notes on Grotius
in Bk 1, the notes on the Roman comitia in Bk 4 ch. 4) and Cole reproduces them. As shipped,
readers see dangling reference marks — e.g. ch. 47 (Bk 4 ch. 8) para 11: "Wherever the clergy
is a corporate body,**[3]** it is master and legislator in its own country" — pointing at
nothing. Cole's preface and his appendix material are also absent.

## Phase 1 flags — confirmed / disconfirmed

- **`last_chapter_suspiciously_short: true` (84 words) — DISCONFIRMED as truncation. This is
  real structure.** Chapter 48 is Book 4, Chapter 9, "Conclusion", and Rousseau's conclusion
  genuinely is a single short paragraph. I read it in full in both editions; the modern ends
  "…I ought, throughout, to have kept to a more limited sphere," which is the true end of the
  work. Nothing is missing.
- `mean_weighted_similarity: 0.8425` — confirmed as a *genuine* modernisation. Word-level
  measurement: only **23 of 381** long paragraphs ≥0.97 identical (6%, 5% of words); median
  word-similarity **0.882**. This is the most evenly-worked edition in the batch.
- Per-chapter median word-similarity is flat through Books 1–3 (0.79–0.90) and rises in Book 4
  (ch. 41 = 0.92, ch. 42 = 0.95, ch. 43 = 0.91, ch. 47 = 0.93, ch. 48 = 0.95). The heaviest
  untouched cluster is ch. 47 (Civil Religion), 8 of 40 long paragraphs cosmetic-only.
- `truncated_paragraphs_total: 0` / `empty_paragraphs_total: 0` — disconfirmed as problems.

## Samples inspected (7 passages, ~800 source words, spread across all four Books)

### 1. Bk 1 ch. 1, paras 0–4 — Foreword and the famous opening. *Strong; polemical edge kept.*
- source (p3): "Man is born free; and everywhere he is in chains. One thinks himself the
  master of others, and still remains a greater slave than they."
- modern (p3): "Man is born free, and everywhere he is in chains. One man thinks himself the
  master of others, yet remains more enslaved than they are."
- source (p4): "…for, regaining its liberty by the same right as took it away, either it is
  justified in resuming it, or there was no justification for those who took it away."
- modern (p4): "…for in regaining its liberty by the same right that took it away, either the
  people is justified in taking it back, or there was no justification for those who took it in
  the first place."
- Finding: faithful, and the disjunctive structure ("either… or…") is preserved exactly. The
  quotation marks around the hypothetical force-only position are kept, which matters — it is
  a position Rousseau is *rejecting*.
- One small drift at p2: Cole "to find my inquiries always furnish me with new reasons for
  loving that of my own country" → modern "…new reasons to love the one I was born under."
  "the government of my own country" and "the one I was born under" are not quite the same
  claim. Trivial in isolation; worth listing.

### 2. Bk 1 ch. 6 (The Social Compact), para 8. *Strong.*
- source: "If then we discard from the social compact what is not of its essence, we shall find
  that it reduces itself to the following terms--"
- modern: "If, then, we strip away from the social compact what is not essential to it, we find
  it reduces to these terms:"

### 3. Bk 2 ch. 3 (Whether the General Will Is Fallible), para 2 — **argument-chain check. One real slip.**
- source: "But when factions arise, and partial associations are formed **at the expense of**
  the great association, the will of each of these associations becomes general in relation to
  its members, while it remains particular in relation to the State"
- modern: "But when factions arise, and partial associations form **within** the great
  association, the will of each of these smaller associations becomes general in relation to
  its own members, while remaining particular in relation to the State"
- **Finding: "at the expense of" → "within" is a substantive weakening.** Rousseau's French is
  *aux dépens de la grande* — the sub-associations grow *at the cost of* the general
  association; that antagonism is the whole mechanism by which the general will is corrupted.
  "within" is merely locative and drops the causal claim. This is a **local fidelity defect in
  an argument-critical sentence.**
- Everything else in the paragraph is precise, including the three-stage escalation
  (no communication → factions → one association prevails) and the conclusion "in that case,
  there is no general will any more, and the prevailing opinion is purely particular."

### 4. Bk 4 ch. 4 (The Roman Comitia), para 12. *Strong; fixes a source typo.*
- source: "the whole Roman people… consisted of thirty _curia_, each with its temples, its
  gods, its officers, its priests and its festivals"
- modern: "the entire Roman people… consisted of thirty _curiæ_, each with its temples, gods,
  officers, priests, and festivals"
- Finding: Latin technical terms kept in italics, not glossed away; Cole's inconsistent
  *curia*/*curiæ* silently corrected.

### 5. Bk 4 ch. 8 (Civil Religion), para 11 (90 words). *Cosmetic only.*
- Word-similarity **1.000**. The only change in the paragraph is one colon → semicolon.
- Finding: the book's densest and most controversial chapter has the least modernisation.

### 6. Bk 4 ch. 8, para 14 (163 words). *Very light.*
- Word-similarity 0.988; changes are comma→em-dash and "which is codified"→"codified".
  "natural divine right or law" / "civil or positive divine right or law" left unglossed —
  defensible (they are technical), but an unmodernised reader barrier.

### 7. Bk 4 ch. 9 (Conclusion), para 0 — the whole chapter (83 words). *Light, complete.*
- source: "But all this forms a new subject that is far too vast for my narrow scope. I ought
  throughout to have kept to a more limited sphere."
- modern: "But all this forms a new subject far too vast for my narrow scope. I ought,
  throughout, to have kept to a more limited sphere."

## What I did NOT find

No inventions, no content shifted between chapters, no name/term inconsistency, no
over-glossing. Rousseau's rhetorical register survives; nothing is smoothed into neutral
academic prose. Apart from the ch. 12 (Bk 2 ch. 3) slip above, logical connectives, scope
quantifiers and conditional structures were exact in all seven samples.

## Phase 3 — human-edition research

The core English text is itself an old translation (Cole 1913), so a better human translation
is the right thing to look for.

1. **G. D. H. Cole (1913)** — the incumbent. Complete. Standard Ebooks publishes exactly this
   translation, cleaned: https://standardebooks.org/ebooks/jean-jacques-rousseau/the-social-contract/g-d-h-cole
   Standard Ebooks' production work is CC0; the underlying Cole text is PD in the US.
   Full text also at Project Gutenberg #46333
   (https://www.gutenberg.org/files/46333/46333-h/46333-h.htm) — **and that Gutenberg edition
   contains the footnote text and appendix material Tinct's ingest dropped.** This is the
   cheapest fix available for the completeness defect.
   *Rights caveat:* PD in the **US** (pre-1931). Cole died 1959, so in the **EU/Denmark** the
   translation is under life+70 copyright until **31 December 2029**. Tinct operates from
   Denmark. I am flagging this as an **unresolved jurisdictional question**, not asserting
   infringement — many EU sources treat Cole as freely reusable and Standard Ebooks (a US
   entity) distributes it — but it should be checked by someone qualified before it is treated
   as settled.
2. **Henry J. Tozer (1895, Sonnenschein; later editions to 1909)** — a complete PD alternative,
   safely PD in both jurisdictions (Tozer d. 1916, so EU term expired 1987). Listed on
   Wikisource's *The Social Contract* disambiguation page as an available English translation.
   **Status: unverified.** I could not open a clean full text — Wikisource has no transcription
   under `The_Social_Contract_(tr._Tozer)` (404), and HathiTrust holds page images only
   (https://catalog.hathitrust.org/Record/011714044). I have **not** read a sample, so I cannot
   say whether it reads better or worse than Cole.
3. **Jonathan Bennett, *Early Modern Texts* — "The Social Contract (1762)"**, a complete
   plain-English version. **Rights: not usable.**
   https://www.earlymoderntexts.com/faqs/rights: *"Permission is not and will not be given for
   the texts to be put to any commercial use."*
4. Modern scholarly translations (Cranston/Penguin 1968; Gourevitch/Cambridge 1997;
   Cress/Hackett; Bondanella/Norton) are all **in copyright — permission required**.

Conclusion: **no rights-clear human *modern-English* translation found in this search.** Cole
remains the best available core text, and the Gutenberg #46333 copy of Cole is a strictly
better ingest than what Tinct currently has.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 4 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 5 |

Weighted score **4.2** — band: **Good with fixes**.

Fidelity is 4, not 5, for two reasons: the confirmed "at the expense of" → "within" slip, and
the missing footnote corpus.

## Recommendation

**LIGHT EDIT**

1. Fix Bk 2 ch. 3 (chapter 12) para 2: restore "at the expense of the great association".
2. Re-ingest Cole's footnotes from Gutenberg #46333 so the 47 `[n]` markers resolve, in all
   three editions. This is a prerequisite: as shipped, the reader sees dead reference marks.
3. Optionally deepen Bk 4 ch. 8 (Civil Religion), the least-modernised chapter.

- Confidence: **medium-high** for the translation quality (7 passages across all four Books,
  covering opening, argument core, a technical/antiquarian chapter, and the ending);
  **high** for the structural findings, which are measured over the whole text.
- Correction scope: **local** for the translation itself; the footnote restoration is a
  separate, bounded ingest job.

## Limitations of this review

Seven passages, ~800 source words of 44,073 — thin coverage by word count, though spread
across all four Books. I did not check `modern-da`. I did not compare against Rousseau's French
(there is no `original-fr` edition for this title in Tinct), so all fidelity judgements are
Cole-relative except where I could reason from known French phrasing. I did not read Tozer.
I did not verify the EU copyright status of Cole's translation with a rights professional.
