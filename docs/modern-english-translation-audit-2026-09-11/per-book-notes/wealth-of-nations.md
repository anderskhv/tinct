# The Wealth of Nations — Adam Smith

- **Book ID:** `wealth-of-nations`
- **Scope:** public
- **Core English text:** `original-en` = Smith's own 1776 English (label "Smith (1776)"). English original, not a translation. 32 chapters spanning all five Books (chapter `title` fields restart numbering per Book — ch12 is titled "Chapter 1" because it opens Book II, etc.).

## Edition snapshot (Phase 1)

| Edition | sha256_16 | Chapters | Paragraphs | Words |
|---|---|---|---|---|
| original-en | `986785410f5c74e8` | 32 | 2173 | 379,438 |
| modern-en | `d894aec39397bf2a` | 32 | 2173 | 352,310 |
| modern-da | `0aaf422e8430f357` | 32 | 2173 | 336,669 |

Phase 1 mechanical: mean weighted similarity **0.6676**; identical long paragraphs **1.0%**; truncated 0; empty 0; para-count mismatches 0; `en_editions_aligned: true`; last chapter 16,667 words.

Word ratio modern/original = **0.929** — a 27,128-word reduction. Investigated below; almost entirely legitimate tightening, but it does conceal one real truncation.

## Headline result: the May 2026 finding is OBSOLETE

`books/MODERN-EN-REPAIR-STATUS.md` (2026-05-23) recorded Wealth of Nations as "1 REAL-HEAVY (ch1), 4 REAL (ch2–5), 5 LIGHT (ch6–10), **22 MECHANICAL (ch11–32)**, 27 chapters needing regen", and singled out ch6 as a chapter whose only change was a single comma swap. That is no longer true.

Re-running the project's own gate, `python3 books/classify-modern-en.py wealth-of-nations`:

```
wealth-of-nations original-en -> modern-en  (32 chapters)
  weighted similarity : 0.667   (gate: <= 0.75)
  light+mechanical    : 0/32 = 0.0%   (gate: <= 5%)
  identical long paras: 20/2107 = 0.9%   (gate: <= 5%)
  buckets: REAL-HEAVY 1  REAL 31  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
```

**PASSES every gate. Zero LIGHT and zero MECHANICAL chapters.** On my independent per-chapter character-similarity metric (the family the May buckets were calibrated on), all 32 chapters fall between **0.023 and 0.252** — REAL-HEAVY territory throughout. The specifically-flagged range scores: ch6 0.140, ch10 0.138, ch11 0.219, ch13 0.125, ch21 0.105, ch25 0.159, ch27 0.137, ch30 0.146, ch31 0.147, ch32 0.187.

**Chapters 11–32 are now genuinely rendered.** I confirmed this by reading, with 8 of my 13 samples drawn from ch11 and beyond.

## Samples inspected (13)

### 1. Ch1 para 1 — opening, the division of labour

> **SOURCE:** "It is commonly supposed to be carried furthest in some very trifling ones; not perhaps that it really is carried further in them than in others of more importance: but in those trifling manufactures which are destined to supply the small wants of but a small number of people, the whole number of workmen must necessarily be small; and those employed in every different branch of the work can often be collected into the same workhouse, and placed at once under the view of the spectator."

> **MODERN:** "People commonly suppose it is carried furthest in some very trivial trades—not perhaps because it really is taken further in them than in more important ones, but because, in those small trades meant to supply the minor wants of only a small number of people, the total number of workers must necessarily be small, so that those employed in every branch of the work can often be gathered into the same workshop and placed all at once before the observer's eyes."

**Finding:** Strong. The "not perhaps that… but" concessive structure is preserved rather than flattened — this is exactly the kind of logical qualification the standard protects.

### 2. Ch5 para 1 — "labour is the real measure"

> **SOURCE:** "Every man is rich or poor according to the degree in which he can afford to enjoy the necessaries, conveniencies, and amusements of human life. … The value of any commodity, therefore, to the person who possesses it, and who means not to use or consume it himself, but to exchange it for other commodities, is equal to the quantity of labour which it enables him to purchase or command. Labour therefore, is the real measure of the exchangeable value of all commodities."

> **MODERN:** "Every person is rich or poor depending on how far he can afford to enjoy the necessities, comforts, and pleasures of human life. … The value of any commodity, then, to the person who owns it and who does not mean to use or consume it himself but to trade it for other commodities, is equal to the quantity of labour it lets him buy or command. Labour, therefore, is the real measure of the exchangeable value of all commodities."

**Finding:** Strong. The book's central thesis sentence is preserved almost verbatim (correctly — it is already clear), while "necessaries, conveniencies, and amusements" is modernised without losing the tripartite structure. "purchase **or command**" — the crucial distinction — survives.

### 3. Ch8 para 4 — **the only paragraph in the book shrinking below 0.70× source length**

> **SOURCE:** "But this original state of things, in which the labourer enjoyed the whole produce of his own labour, could not last beyond the first introduction of the appropriation of land and the accumulation of stock. It was at an end, therefore, long before the most considerable improvements were made in the productive powers of labour; and it would be to no purpose to trace further what might have been its effects upon the recompence or wages of labour." (78 words)

> **MODERN:** "But this original condition, in which the worker kept everything his labour produced, could not survive once people began to own land and accumulate capital. It was over, in other words, long before the great gains in productivity ever appeared. So there is no point tracing further what it might have meant for wages." (54 words)

**Finding: flag investigated, largely benign.** No claim is lost; this is legitimate compression of a verbose sentence. Two nits: "in other words" is a connective not in the source (the source has "therefore", which is causal, not restating), and "the recompence or wages of labour" collapses to "wages", losing Smith's doublet. Both trivial. Worth noting only because this was the single largest shrinkage in 2,173 paragraphs.

### 4. Ch10 para 106 — Doctor Burn quotation (char-sim 0.992, near-identical)

> **SOURCE:** "“After all,” says Doctor Burn, “this kind of settlement, by continuing forty days after publication of notice in writing, is very seldom obtained; …”"

> **MODERN:** `"After all," says Doctor Burn, "this kind of settlement, by continuing forty days after publication of notice in writing, is very seldom obtained; …"`

**Finding: near-identity is defensible but is a missed opportunity.** Only the curly quotes changed. This is a quoted legal authority, so leaving it is a reasonable editorial choice — but Burn's legal prose is *harder* than Smith's own, so a reader hits the densest sentence in the chapter unmodernised. Minor.

### 5. Ch11 paras 276–289 — **Phase 1 mechanical outlier: the 14 identical paragraphs**

These are the price tables in the Digression on the Value of Silver, e.g. ch11 p283: `PRICES OF THE QUARTER OF NINE BUSHELS OF THE BEST OR HIGHEST PRICED WHEAT AT WINDSOR MARKET…`, followed by long runs of `1637  2 13 0 / 1638  2 17 4 / 1639  2 4 10 …`.

**Finding: flag DISCONFIRMED as a defect.** Of the 20 identical long paragraphs the classifier counts, the large majority are numeric tables (ch11 p276–p289, ch25 p75, ch29 p56). Leaving price tables byte-identical is correct — there is nothing to modernise, and rewriting them would risk corrupting the figures. The `pct_identical_long_paragraphs: 1.0` flag is an artefact of Smith's statistical appendices, not evidence of a mechanical pass.

### 6. Ch11 para 135 — short prose at char-sim 0.964

> **SOURCE:** "This, however, is the effect, not of the real cheapness of silver, but of the real dearness of corn. It does not cost less labour to bring silver to the great town than to the remote parts of the country; but it costs a great deal more to bring corn."

> **MODERN:** "This, however, is the effect not of the real cheapness of silver but of the real dearness of corn. It costs no less labour to bring silver to the great town than to the remote parts of the country; but it costs a great deal more to bring corn."

**Finding: near-identity disconfirmed as a defect.** Smith's sentence is already perfectly modern; the only available edit was punctuation and "does not cost less" → "costs no less". Correct restraint.

### 7. Ch11 para 207 — **CONFIRMED DEFECT: mid-word truncation, content lost**

> **SOURCE (tail):** "…new methods of feeding are commonly fallen upon, which enable the farmer to raise upon the same quantity of ground a much greater quantity of that particular sort of animal food. **The plenty not only obliges him to sell cheaper, but, in consequence of these improvements, he can afford to sell cheaper; for if he could not afford it, the plenty would not be of long continuance. It has been probably in this manner that the introduction of clover, turnips, carrots, cabbages, etc. has contributed to sink the common price of butcher's meat in the London market, somewhat below what it was about the beginning of the last century.**" (499 words total)

> **MODERN (tail):** "…new methods of feeding are commonly hit upon that let the farmer raise on the same quantity of ground a much greater quantity of that particular kind of animal food. **The plenty not only forces him to sell cheaper but, as a result of these im**" (426 words total)

**Finding: a genuine substantive omission.** The modern paragraph stops mid-word at "these im[provements]". Roughly **73 words are lost**, including (a) Smith's whole point that the farmer *can afford* to sell cheaper and that otherwise the plenty would not last, and (b) the entire closing sentence naming clover, turnips, carrots and cabbages as the cause of falling meat prices in London — a concrete, memorable example.

I verified the content is **not** recovered in ch11 p208, which begins a new topic ("The hog, which finds its food among filth…"). This is loss, not displacement.

**The Phase 1 screen missed this.** `truncated_paragraphs_total: 0`, and the paragraph retains 85% of its source length, so no shrinkage threshold catches it. I found it with a targeted scan for paragraphs where the source ends in terminal punctuation and the modern does not. That scan over the whole book returned exactly **three** hits: this one, plus ch23 p0 and ch29 p0, which are chapter-title headings (benign).

**This is the only confirmed content defect in Wealth of Nations, and it is local.**

### 8. Ch13 para 20 (Book II ch2, banks and paper money)

> **SOURCE:** "The whole revenue of all of them taken together is evidently not equal to both the money and the consumable goods, but only to one or other of those two values, and to the latter more properly than to the former."

> **MODERN:** "The whole income of all of them together is clearly not equal to both the money and the consumable goods, but only to one or the other of those two values, and more properly to the second than to the first."

**Finding:** Strong. "the latter… the former" — a construction that reliably trips modern readers — is resolved to "the second… the first" without changing the claim.

### 9. Ch21 para 40 (Book IV ch1, the mercantile system)

> **SOURCE:** "Exportation was encouraged sometimes by drawbacks, sometimes by bounties, sometimes by advantageous treaties of commerce with foreign states, and sometimes by the establishment of colonies in distant countries."

> **MODERN:** "Exports were encouraged sometimes by drawbacks, sometimes by bounties, sometimes by favourable trade treaties with foreign states, and sometimes by founding colonies in distant countries."

**Finding:** Good, but illustrates the book's main remaining clarity gap: **"drawbacks" and "bounties" are 18th-century commercial terms of art and are left entirely unglossed.** The standard says to "explain essential unfamiliar terms briefly at the point of need". A modern reader will not know that a drawback is a duty refund on re-export. Recurring across Books IV and V.

### 10. Ch22 para 9 (Book IV ch2) — **the invisible hand**

> **SOURCE:** "…and he is in this, as in many other cases, led by an invisible hand to promote an end which was no part of his intention. Nor is it always the worse for the society that it was no part of it. … I have never known much good done by those who affected to trade for the public good. It is an affectation, indeed, not very common among merchants, and very few words need be employed in dissuading them from it."

> **MODERN:** "…In this, as in many other cases, he is led by an invisible hand to promote an end that was no part of his intention. And it is not always worse for society that this was no part of it. … I have never known much good done by people who claimed to trade for the public good. It is an affectation, in fact, not very common among merchants, and very few words are needed to talk them out of it."

**Finding:** Strong, and the most important passage in the book to get right. The image is preserved (not replaced with an explanation), the careful hedges survive — "**not always** the worse", "**frequently** promotes" (not "always") — and Smith's closing deadpan lands in modern English ("very few words are needed to talk them out of it"). No invention, no over-explanation of what the invisible hand "means".

### 11. Ch27 para 100 (Book IV ch7, colonies)

> **SOURCE:** "The Greek colonies sometimes furnished a military force, but seldom any revenue. They seldom acknowledged themselves subject to the dominion of the mother city. They were generally her allies in war, but very seldom her subjects in peace."

> **MODERN:** "The Greek colonies sometimes supplied a military force but seldom any revenue. They rarely admitted themselves subject to the rule of the mother city. They were generally her allies in war but very seldom her subjects in peace."

**Finding:** Strong. The Roman/Greek contrast and the allies-in-war/subjects-in-peace antithesis are preserved. Note: preserving a source-derived antithesis is correct and must not be read as an "AI tell".

### 12. Ch30 para 120 (Book V ch1, joint-stock companies / South Sea Company)

> **SOURCE:** "But the loss occasioned by the negligence, profusion, and malversation of the servants of the company, had probably been a tax much heavier than all those duties."

> **MODERN:** "But the loss caused by the negligence, extravagance, and malversation of the company's servants had probably been a far heavier tax than all those duties."

**Finding:** Strong. Place names corrected ("Carthagena" → "Cartagena"), the three-item indictment kept, and the technical "malversation" retained — arguably it should have been glossed, consistent with the gap noted in sample 9.

### 13. Ch31 para 200 (Book V ch2, taxes on malt, beer and ale)

> **SOURCE:** "In the porter brewery, therefore, the different taxes upon malt, beer, and ale, amount to between twenty-six and thirty shillings upon the produce of a quarter of malt. … But by taking off all the different duties upon beer and ale, and by trebling the malt tax, or by raising it from six to eighteen shillings upon the quarter of malt, a greater revenue, it is said, might be raised by this single tax…"

> **MODERN:** "In the porter brewery, then, the various taxes on malt, beer, and ale come to between twenty-six and thirty shillings on the produce of a quarter of malt. … But it is said that by removing all the various duties on beer and ale, and trebling the malt tax—raising it from six to eighteen shillings a quarter of malt—this single tax could raise more revenue than is now drawn from all those heavier taxes."

**Finding:** Strong on fidelity — I checked every figure (six, eight, two and a half, three, twenty-six, thirty, twenty-three and fourpence, one and fourpence, twenty-four, twenty-five, eighteen shillings) and all are preserved exactly. The attribution hedge "it is said" is kept rather than converted into Smith's own assertion. Again, "quarter", "porter", "small beer" go unglossed.

## Phase 1 flags: confirmed vs. disconfirmed

| Flag | Verdict |
|---|---|
| `pct_identical_long_paragraphs: 1.0` (20 paragraphs) | **Disconfirmed as a defect.** Predominantly numeric price tables (ch11 p276–289, ch25 p75, ch29 p56) plus short already-modern sentences. Correct to leave. |
| `truncated_paragraphs_total: 0` | **DISCONFIRMED — the screen is wrong.** ch11 p207 is truncated mid-word with ~73 words lost (sample 7). |
| `empty_paragraphs_total: 0` | Confirmed. |
| `para_count_mismatches: 0` / `en_editions_aligned: true` | Confirmed. |
| `last_chapter_suspiciously_short: false` | Confirmed — ch32 is 16,667 words. |
| Historical `MODERN-EN-REPAIR-STATUS.md` claim: ch11–32 MECHANICAL, ch6–10 LIGHT | **DISCONFIRMED.** 0/32 LIGHT or MECHANICAL on the project's own classifier; confirmed by reading 8 samples from ch11 onward, including the specifically-cited ch6 region. |

Whole-book scans that came back clean: no bracketed editorial insertions (0), no paragraphs starting mid-sentence in prose, only one paragraph below 0.70× source length (sample 3, benign).

## Phase 3 — human-edition research

**Is Smith's own 1776 English already accessible?** Substantially, yes — more so than any other book in my batch. Smith writes long but lucid sentences with modern syntax; samples 4, 6 and 12 show passages where the modern edition could barely improve on him. The genuine barriers are (a) sentence length in the denser Book IV/V argument, and (b) 18th-century commercial and fiscal vocabulary — *bounty, drawback, quarter, busses, malversation, small beer, conveniencies, recompence*.

The current modern-en addresses (a) well and **(b) not at all**. That is the shape of the remaining opportunity: glossing, not further rewriting.

**Candidates for a human modern-English Wealth of Nations:**

1. **Jonathan Bennett, *Early Modern Texts*** — Smith is listed among the site's 47 authors and a modernised version is offered.
   **Rights: NONCOMMERCIAL — RULED OUT,** on the same verbatim terms quoted in the Leviathan note: *"Permission is not and will not be given for the texts to be put to any commercial use."*
   Source: https://www.earlymoderntexts.com/faqs/rights

2. **Edwin Cannan's edition (1904)** — public domain, the scholarly standard, widely available (Liberty Fund, Gutenberg). But Cannan is an *annotated edition of Smith's own text*, not a modernisation. Useful as a source of **notes and glosses** (which is precisely the gap identified above) rather than as replacement prose. Worth a follow-up look specifically for Cannan's explanatory footnotes on bounties/drawbacks, whose PD status is clean.

3. **Modern abridgements and "condensed" Wealth of Nations editions** — all in copyright, and abridged, so they fail completeness regardless of rights.

**Conclusion:** no rights-clear complete human modernisation exists. Keeping the in-house modern-en is right; the highest-value addition is a glossary of 18th-century commercial terms, for which Cannan (PD) is a legitimate source.

## Ratings

| Dimension | Weight | Score | Note |
|---|---|---|---|
| Fidelity / completeness | 40% | **4** | One confirmed mid-word truncation losing ~73 words (ch11 p207); everything else complete, all numeric data exact across 13 samples. Local, not recurring. |
| First-read clarity | 25% | **4** | Sentence-level clarity is good; 18th-c. technical vocabulary left unglossed throughout Books IV–V |
| Literary voice | 20% | **4** | Smith's irony and hedging survive (invisible hand passage); occasional flattening of doublets ("recompence or wages" → "wages") |
| Restraint / no invention | 10% | **5** | No invented facts, motives or interpretations found; one mild added connective ("in other words") |
| Naturalness | 5% | **5** | Connected, unmechanical prose |

**Weighted score: 4.2 — band: Good with fixes.**

## Recommendation

**LIGHT EDIT.** Confidence: **medium-high**. Correction scope: **local**.

Two scoped fixes:
1. **Repair ch11 para 207** — restore the truncated tail (the "can afford to sell cheaper" clause and the clover/turnips/carrots/cabbages sentence). This is a one-paragraph fix.
2. **Add glosses for 18th-century commercial terms** at first use — *bounty, drawback, quarter (of malt/wheat), busses, malversation, small beer*. This is the difference between "readable sentences" and "readable book" for Books IV and V, and Cannan's PD notes are a legitimate source.

Also: **retire the 2026-05-23 "ch11–32 MECHANICAL" finding** in `books/MODERN-EN-REPAIR-STATUS.md`. It is stale and would otherwise cause a future session to re-render 22 chapters unnecessarily.

## Limitations of this review

- I read **13 of 2,173 paragraphs** (~0.6%) — the thinnest sampling ratio in my batch, because this is the longest book. Editorial quality claims are sample-level only.
- Mechanical coverage is whole-book (similarity, truncation-pattern, shrinkage, near-identity, bracket scans all ran over all 2,173 paragraphs), so the absence of *mechanical-failure patterns* is well established everywhere; the ch11 p207 truncation was found by exactly such a whole-book scan, which raises my confidence that no second instance of that class exists.
- I did **not** verify Smith's statistics against external sources, only that the modern edition reproduces the source's figures faithfully.
- I did **not** assess `modern-da`. Given it was generated from `modern-en` and `modern-en` was substantially regenerated after 2026-05-23, the Danish may predate the repair and needs its own check.
- I did not check the price tables' rendering in the reader (they are whitespace-formatted plain text and may display poorly, but that is a UI question, not a translation one).
