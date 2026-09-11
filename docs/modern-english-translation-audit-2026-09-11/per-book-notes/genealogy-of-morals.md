# genealogy-of-morals — *On the Genealogy of Morals*, Friedrich Nietzsche (1887)

Audit date: 2026-09-11 · Scope: public · Reviewer: batch agent (early-modern/modern continental philosophy)

**Headline: `modern-en` is not a modern edition. It is Horace B. Samuel's 1913 translation with
`--` replaced by ` — ` and British spellings Americanised. 97.9% of Samuel's word-tokens survive
verbatim and in sequence across the whole book; the Third Essay is 99.0%.**

## Edition snapshot (from Phase 1 `mechanical/genealogy-of-morals.json`)

| edition | label / translator | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|---|
| original-en | Samuel (1913), tr. Horace B. Samuel | `2377b4157b8e28c2` | 4 | 124 | 51,776 |
| modern-en | Modern English | `72ca79453b9a485f` | 4 | 124 | 52,860 |
| modern-da | Moderne Dansk | `4e1dc72f97f6c9ac` | 4 | 124 | 49,435 |

`core_key_en = original-en`; `en_editions_aligned = true`; no mismatches, no truncations, no
empty paragraphs; `last_chapter_suspiciously_short = false` (Third Essay, 24,192 words).
Phase 1 mean weighted similarity **0.945** — the orchestrator flagged this as "near the
mechanical threshold." **Confirmed, and it is worse than 0.945 suggests.**

## Provenance of the core English text

Horace Barnett Samuel's 1913 translation (Boni & Liveright; volume 13 of Oscar Levy's *Complete
Works*). Complete: Preface plus three essays. Samuel's English is notably stiff even for 1913 —
"in point of fact," "of us holds good to all eternity the motto," "the breeding of an animal that
can promise," "social strait-waistcoats."

## Phase 1 flags: confirmed / disconfirmed

- `pct_identical_long_paragraphs = 1.7` — **this metric badly under-reports.** It counts exact
  string equality, and the modern edition changes `--` to ` — ` in nearly every paragraph, so
  almost nothing registers as "identical." Recomputing with a word-token sequence match:

| file ch | section | % of Samuel's word-tokens retained verbatim, in sequence |
|---|---|---|
| 1 | Preface | 86.6 |
| 2 | First Essay | 97.4 |
| 3 | Second Essay | 98.5 |
| 4 | Third Essay | **99.0** |
| — | **whole book** | **97.9** |

  33 paragraphs of ≥30 words are ≥0.97 character-similar to the source, including single
  paragraphs of 1,135, 934, 911, 682 and 679 words.
- `last_chapter_suspiciously_short = false` — correct; the Third Essay is the longest section.
- No truncation or empty-paragraph flags — correct.

## Samples inspected (8 locations, ~4,300 source words)

### 1. Opening — Preface (file ch1), para 0 — **this is the good part**
Source: "We are unknown, we knowers, ourselves to ourselves: this has its own good reason. We
have never searched for ourselves--how should it then come to pass, that we should ever find
ourselves?"
Modern: "We are unknown to ourselves, we knowers — and for good reason. We have never searched
for ourselves, so how could we ever find ourselves?"
**Finding:** a real, skilful modernization. Faithful, sharper, keeps the "hives/honey" image.

### 2. Opening — Preface (file ch1), para 1
Source: "…so do we at times rub afterwards, as it were, our puzzled ears, and ask in complete
astonishment and complete embarrassment, 'Through what have we in point of fact just lived?'
further, 'Who are we in point of fact?'"
Modern: "…In the same way we sometimes rub our puzzled ears afterward and ask, in complete
astonishment and embarrassment, 'What have we just lived through?' And further: 'Who in fact are
we?'"
**Finding:** also good. Samuel's "in point of fact" tic is cleaned up, the noon-bell image is
intact, the miscounting is intact. The Preface is the only section that received this treatment.

### 3. Early — First Essay (file ch2), para 0 (section 1, the English psychologists)
Source: "…the *partie honteuse* of our inner world… in the *vis inertiæ* of habit…"
Modern: "…the *partie honteuse* of our inner world… in the *vis inertiæ* of habit…"
**Finding:** sentence-splitting only ("Is it an instinct for human disparagement somewhat
sinister, vulgar, and malignant" → "Is it some sinister, vulgar, malignant instinct for human
disparagement"). The untranslated French and Latin are left unglossed. This is already mostly
Samuel.

### 4. Early — First Essay (file ch2), para 12 (section 8, "sub hoc signo", 471 words)
Source: "It is at least certain that *sub hoc signo* Israel, with its revenge and transvaluation
of all values, has up to the present always triumphed again over all other ideals, over all more
aristocratic ideals."
Modern: "It is at least certain that *sub hoc signo* Israel, with its revenge and transvaluation
of all values, has up to the present always triumphed again over all other ideals, over all more
aristocratic ideals."
**Finding:** **byte-identical** for the whole final third of a 471-word paragraph. Only change in
the paragraph: "But you understand this not?" → "But you do not understand this?" and `--` → ` — `.
The Latin tag and "transvaluation of all values" are left unglossed for a first-time reader.

### 5. Middle — Second Essay (file ch3), para 0 (section 1, "an animal that can promise", 560 words)
Source: "Forgetfulness is no mere *vis inertiæ*, as the superficial believe, rather is it a power
of obstruction… The temporary shutting of the doors and windows of consciousness, the relief
from the clamant alarums and excursions, with which our subconscious world of servant organs
works in mutual co-operation and antagonism…"
Modern: "Forgetfulness is no mere *vis inertiæ*, as the superficial believe; rather it is a power
of obstruction… The temporary shutting of the doors and windows of consciousness, the relief
from the clamant alarms and excursions with which our subconscious world of servant organs works
in mutual cooperation and antagonism…"
**Finding:** the single change of substance in a 560-word paragraph is "alarums" → "alarms" —
which *breaks* the allusion (Samuel's "alarums and excursions" is the Shakespearean stage
direction; "alarms and excursions" reads as an error). "clamant," "manifold," "oligarchic model,"
"once indented impression" all survive.

### 6. Middle — Second Essay (file ch3), para 1 (section 2, the sovereign individual, 587 words)
Source: "…man, with the help of the morality of customs and of social strait-waistcoats, was made
genuinely calculable."
Modern: "…man, with the help of the morality of customs and of social strait-waistcoats, was made
genuinely calculable."
**Finding:** identical. "strait-waistcoats" (Edwardian for straitjackets) untouched and unglossed.
The internal cross-reference "(cp. Dawn of Day, Aphs. 9, 14, and 16)" is preserved — correct — but
also untouched.

### 7. Late — Third Essay (file ch4), para 1 (section 1, "What is the meaning of ascetic ideals?")
Source: "…in women, at best an additional seductive fascination, a little *morbidezza* on a fine
piece of flesh… in saints, finally a pretext for hibernation, their *novissima gloriæ cupido*,
their peace in nothingness ('God'), their form of madness."
Modern: "…in women, at best an additional seductive fascination, a little *morbidezza* on a fine
piece of flesh… in saints, finally a pretext for hibernation, their *novissima gloriæ cupido*,
their peace in nothingness ('God'), their form of madness."
**Finding:** identical except "favourable" → "favorable". Two untranslated tags (Italian, Latin)
left unglossed in the opening sentence of the book's longest and most-assigned essay.

### 8. Ending — Third Essay (file ch4), para 40 (section 28, the last paragraph of the book)
Source: "…all this means--let us have the courage to grasp it--a will for Nothingness, a will
opposed to life, a repudiation of the most fundamental conditions of life, but it is and remains
a will!--and to say at the end that which I said at the beginning--man will wish Nothingness
rather than not wish at all."
Modern: "…all this means — let us have the courage to grasp it — a will for Nothingness, a will
opposed to life, a repudiation of the most fundamental conditions of life, but it is and remains
a will! — and to say at the end that which I said at the beginning — man will wish Nothingness
rather than not wish at all."
**Finding:** the closing paragraph of the book — 460 words — is **Samuel verbatim**, dash
substitution only. It still carries "he was in the main a diseased animal," "in point of fact,"
and "*faute de mieux* par excellence."

## Summary of confirmed defects

- **The defect is global, not local.** Outside the ~3,000-word Preface, this edition performs no
  modernization at all. A reader toggling from "Marriott/Samuel (1913)" to "Modern English" in
  the reader will see the same text with different dashes for ~49,000 of 52,000 words.
- Consequence: the edition inherits every barrier the source has — untranslated *partie
  honteuse*, *vis inertiæ*, *sub hoc signo*, *morbidezza*, *novissima gloriæ cupido*, *faute de
  mieux*; Edwardian idiom ("strait-waistcoats," "clamant," "in point of fact"); 400–1,100-word
  paragraphs left unbroken.
- One change actively *hurts*: "alarums and excursions" → "alarms and excursions" loses the
  Shakespearean allusion.
- **Fidelity and restraint are perfect for the trivial reason that the text is the source.** There
  are no inventions, no omissions, no chapter-shifted content — there is also no work.
- Nietzsche's rhetorical intensity is not flattened here (unlike `beyond-good-and-evil`): Samuel's
  text carries no ALL-CAPS emphasis markers, so there was none to lose.

## Phase 3 — human-edition research

| candidate | date | completeness | rights | evidence |
|---|---|---|---|---|
| Horace B. Samuel (current core) | 1913 | complete | PD US; **EU/DK unresolved** | Standard Ebooks ships this exact translation: https://standardebooks.org/ebooks/friedrich-nietzsche/the-genealogy-of-morals/horace-b-samuel — page fetched; states "This ebook is thought to be free of copyright restrictions in the United States. It may still be under copyright in other countries," and gives no translator dates. Samuel was **born 1883**; his death date is not established in the sources I could reach, so the EU life+70 term cannot be computed. **This is an unresolved rights question for a text we already ship.** |
| Ian Johnston (Vancouver Island University) | 2014 rev. | complete (Prologue + 3 essays) | **noncommercial only — not usable** | https://web.viu.ca/johnstoi/nietzsche/genealogytofc.htm (fetched; the ToC page itself says the translation "has certain copyright restrictions"), and the copyright page https://web.viu.ca/johnstoi/copyright.htm (fetched) reads: "All general readers, teachers, students, and performing artists may download any material… without permission and without charge, **provided they do not use the material in a commercial publication**." Johnston licenses a print edition commercially through Richer Resources Publications. Several third-party pages describe Johnston's translations as "public domain"; **the translator's own copyright page contradicts them**, so those secondhand claims should not be relied on. Status: **permission required**. Johnston's English is genuinely modern and would be an excellent fit if permission were obtained — worth an email. |
| Walter Kaufmann & R.J. Hollingdale | 1967, Vintage | complete | **in copyright** | Kaufmann d. 1980, Hollingdale d. 2001 → EU terms to 2050/2071; US 95-year term to 2062. |
| Douglas Smith | 1996, Oxford World's Classics | complete | **in copyright** | Living translator, commercial edition. |
| Carol Diethe (ed. Ansell-Pearson) | 1994/2006, Cambridge | complete | **in copyright** | Commercial edition. |
| Maudemarie Clark & Alan Swensen | 1998, Hackett | complete | **in copyright** | Commercial edition. |

**Conclusion:** the only *free-and-clear* human English *Genealogy* is Samuel — the text we already
have. The one genuinely modern free-to-read human translation (Johnston) is noncommercial-only.
So a Tinct-made modern edition is the correct instrument; it simply has not been made yet for this
book. **Actionable alternative worth considering before retranslating: write to Ian Johnston /
Vancouver Island University for commercial-use permission.** His copyright page invites contact
for uses outside the noncommercial grant, and VIU hosts the texts. I did not attempt this.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 2 |
| literary voice | 20% | 3 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 2 |

Weighted score **3.7** — band **Mixed**.

The weighted score is misleading here and should only be used for queue ordering. Fidelity 5 and
restraint 5 are free points earned by copying. Judged on *what the edition is for* — removing a
reader barrier — this edition fails almost completely. The plain-language band is Mixed only
because the text a reader gets is at least complete and accurate; it is simply the 1913 text.

## Recommendation

**RETRANSLATE** — confidence **high**, correction scope **substantial**.

This is the clearest RETRANSLATE in my batch. The defect is not local and not repairable by
editing: ~95% of the book was never modernized. Roughly 49,000 words of real modernization work
are required (Preface excepted — that part is done and is good, and should be kept as the voice
calibration for the rest).

Sequencing note: **do `genealogy-of-morals` before `beyond-good-and-evil`.** BGE's problems are
mechanically fixable (restore emphasis, finish six chapters); this book has no modern edition at
all behind a label that says it does.

Specific standard for the retranslation, derived from the samples above: translate or gloss the
French/Latin/Italian tags at point of need; break the 400–1,100-word paragraphs only where
Nietzsche's own sectioning allows (do **not** invent section breaks); preserve the polemical
register, the exclamations and the interrogative barrages — the Preface shows this is achievable;
and restore "alarums and excursions."

Also: resolve Horace B. Samuel's death date before the next rights review, since our `original-en`
depends on it for EU distribution.

## Limitations of this review

Eight passage locations (~4,300 source words of 51,776, ~8.3%) plus whole-book mechanical
analysis (per-paragraph and per-chapter word-token retention, near-identical-paragraph census).
I read the Preface sections 1–2, First Essay sections 1 and 8, Second Essay sections 1–2, Third
Essay sections 1 and 28. I did **not** read the Second Essay's middle sections or Third Essay
sections 2–27 in connected prose; did not check the Danish edition; did not verify Samuel's
section numbering against Nietzsche's German; and did not attempt to contact Johnston's rights
holder (that is a recommendation, not a completed step).
