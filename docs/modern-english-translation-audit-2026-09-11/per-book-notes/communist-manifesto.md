# The Communist Manifesto — Karl Marx & Friedrich Engels

- **Book ID:** `communist-manifesto`
- **Scope:** public
- **Core English text:** `original-en` = **Samuel Moore, 1888, edited by Friedrich Engels** (registry records both translator and editor). Translated from German (1848). Provenance documented in `books/raw/communist-manifesto/SOURCE.md`: Project Gutenberg eBook #61, https://www.gutenberg.org/cache/epub/61/pg61.txt, retrieved 2026-04-23. Fully public domain. Complete: 5 chapters (Preamble + Parts I–IV), 213 paragraphs.

This is the single most authoritative English Manifesto — Moore's translation was revised and annotated by Engels himself, making it effectively an authorised text.

## Edition snapshot (Phase 1)

| Edition | sha256_16 | Chapters | Paragraphs | Words |
|---|---|---|---|---|
| original-en | `8b5b839176167eef` | 5 | 213 | 11,395 |
| modern-en | `909c7496f66b1314` | 5 | 213 | 11,282 |
| modern-da | `6c4fafb667b40f26` | 5 | 213 | 10,021 |

Phase 1 mechanical: mean weighted similarity **0.9108**; identical long paragraphs **13.9%**; truncated 0; empty 0; alignment clean.

Word ratio modern/original = **0.990** — essentially unchanged length.

## Headline result: the modern edition is a light copyedit of Moore, and that is probably correct

Per-chapter character-level similarity (my own computation, paragraphs ≥30 words, weighted by length):

| Chapter | Title | Char-sim | Identical long paras |
|---|---|---|---|
| 1 | Preamble | 0.545 | 0 / 3 |
| 2 | I. Bourgeois and Proletarians | 0.520 | 2 / 43 |
| 3 | II. Proletarians and Communists | 0.703 | 2 / 47 |
| 4 | III. Socialist and Communist Literature | **0.887** | 2 / 40 |
| 5 | IV. Position of the Communists… | 0.740 | 0 / 5 |

The project's own gate, `python3 books/classify-modern-en.py communist-manifesto`:

```
communist-manifesto original-en -> modern-en  (5 chapters)
  weighted similarity : 0.911   (gate: <= 0.75)          FAIL
  light+mechanical    : 4/5 = 80.0%   (gate: <= 5%)      FAIL
  identical long paras: 27/194 = 13.9%   (gate: <= 5%)   FAIL
  buckets: REAL-HEAVY 0  REAL 1  LIGHT 4  MECHANICAL 0
```

The gate fails. **But unlike Confessions, this is not an abandoned job — it is an appropriate editorial response to an already-modern source, recorded by a gate that cannot tell the two apart.** Moore's 1888 English is 140 years old but reads as contemporary prose: no archaic pronouns, no obsolete word senses, no inverted syntax. There was very little for a modernisation to do, and the edition sensibly did very little.

The consequence is that `modern-en` **duplicates the source at ~0.91 similarity while adding almost nothing**, which raises a different question — not "is it bad?" but "is it worth having?".

## Samples inspected (6)

Given the work's length (~11,000 words), I read the complete Preamble and the complete closing section, plus targeted passages from each of Parts I–III.

### 1. Ch1 (Preamble), paras 0–5 — **complete section, including the iconic opening**

> **SOURCE (Moore):** "A spectre is haunting Europe—the spectre of Communism. All the Powers of old Europe have entered into a holy alliance to exorcise this spectre: Pope and Czar, Metternich and Guizot, French Radicals and German police-spies."

> **MODERN:** "A spectre is haunting Europe—the spectre of communism. All the powers of old Europe have entered into a holy alliance to exorcise this spectre: Pope and Czar, Metternich and Guizot, French radicals and German police-spies."

**Finding: iconic line PRESERVED, verbatim but for decapitalisation.** The only changes in the entire six-paragraph Preamble are decapitalisation and four word swaps: "decried as Communistic" → "smeared as communist", "hurled back the branding reproach" → "flung the same branding charge back", "meet this nursery tale" → "answer this nursery tale", "sketched the following Manifesto" → "drafted the following Manifesto".

The named targets (Pope, Czar, Metternich, Guizot), the six publication languages, and the numbered "I. / II." structure all survive exactly. Nothing is lost; nothing much is gained either.

### 2. Ch2 (Part I), para 15 — the bourgeoisie's achievements

> **SOURCE:** "It has accomplished wonders far surpassing Egyptian pyramids, Roman aqueducts, and Gothic cathedrals; it has conducted expeditions that put in the shade all former Exoduses of nations and crusades."

> **MODERN:** "It has accomplished wonders that far surpass the Egyptian pyramids, the Roman aqueducts, and the Gothic cathedrals; it has carried out expeditions that put every former exodus of nations and every crusade in the shade."

**Finding:** Good. The triad of monuments and the Exodus/crusade comparison survive; "put in the shade" is kept rather than explained away. Marx's rhetorical escalation is intact.

### 3. Ch2 (Part I), para 16 — "All that is solid melts into air"

> **SOURCE:** "Constant revolutionising of production, uninterrupted disturbance of all social conditions, everlasting uncertainty and agitation distinguish the bourgeois epoch from all earlier ones. All fixed, fast-frozen relations, with their train of ancient and venerable prejudices and opinions, are swept away, all new-formed ones become antiquated before they can ossify. All that is solid melts into air, all that is holy is profaned, and man is at last compelled to face with sober senses, his real conditions of life, and his relations with his kind."

> **MODERN:** "Constant revolutionising of production, uninterrupted disturbance of all social conditions, everlasting uncertainty and agitation—these distinguish the bourgeois epoch from all earlier ones. All fixed, fast-frozen relations, with their train of ancient and venerable prejudices and opinions, are swept away; all newly formed ones become antiquated before they can ossify. All that is solid melts into air, all that is holy is profaned, and man is at last compelled to face with sober senses his real conditions of life and his relations with his kind."

**Finding: Strong — the book's most quoted sentence is preserved word for word.** The only interventions are a resumptive dash and punctuation. Exactly the right restraint: this is a passage where any rewriting would be vandalism.

### 4. Ch3 (Part II), paras 18–19 — property and wage-labour

> **SOURCE:** "When, therefore, capital is converted into common property, into the property of all members of society, personal property is not thereby transformed into social property. It is only the social character of the property that is changed. It loses its class-character." / "Let us now take wage-labour."

> **MODERN:** "When, therefore, capital is converted into common property, into the property of all members of society, personal property is not thereby transformed into social property. It is only the social character of the property that is changed. It loses its class character." / "Let us now take wage-labour."

**Finding:** Byte-identical but for a hyphen. **This is one of the 27 identical-flagged paragraphs, and it is a correct outcome** — the passage carries a precise technical distinction (personal vs. social property, class-character) stated in already-plain English. Any "modernising" here would risk the argument. Flag disconfirmed as a defect.

### 5. Ch4 (Part III), paras 8–11 — **the 0.887 chapter, the highest-similarity section**

> **SOURCE:** "What they upbraid the bourgeoisie with is not so much that it creates a proletariat, as that it creates a _revolutionary_ proletariat."
> **MODERN:** "What they reproach the bourgeoisie with is not so much that it creates a proletariat, as that it creates a _revolutionary_ proletariat."

> **SOURCE:** "…and in ordinary life, despite their high falutin phrases, they stoop to pick up the golden apples dropped from the tree of industry, and to barter truth, love, and honour for traffic in wool, beetroot-sugar, and potato spirits."
> **MODERN:** "…and in ordinary life, despite their high-flown phrases, they stoop to pick up the golden apples dropped from the tree of industry, and to barter truth, love, and honour for traffic in wool, beetroot-sugar, and potato spirits."

> **SOURCE:** "As the parson has ever gone hand in hand with the landlord, so has Clerical Socialism with Feudal Socialism."
> **MODERN:** "Just as the parson has always gone hand in hand with the landlord, so has Clerical Socialism with Feudal Socialism."

**Finding: flag CONFIRMED as near-mechanical — one or two word swaps per paragraph (`upbraid`→`reproach`, `high falutin`→`high-flown`, `As`→`Just as`). But the defect is not the one the metric implies.**

Part III is the *hardest* part of the Manifesto for a modern reader, and the difficulty is not vocabulary — it is **reference**. The section is a running polemic against 1840s German and French sectarian factions: Feudal Socialism, Petty-Bourgeois Socialism, "True" Socialism, Conservative or Bourgeois Socialism, Critical-Utopian Socialism, plus Sismondi, Proudhon, Saint-Simon, Fourier, Owen. The golden-apples image and the "wool, beetroot-sugar, and potato spirits" jab both land only if you know they are aimed at the German landed aristocracy.

So Part III is simultaneously **the chapter that most needs help and the chapter that received the least** — and no amount of sentence-level rewriting would fix it. It needs notes, not new prose.

### 6. Ch5 (Part IV), paras 9–11 — **complete closing, including the iconic final lines**

> **SOURCE:** "Finally, they labour everywhere for the union and agreement of the democratic parties of all countries." / "The Communists disdain to conceal their views and aims. They openly declare that their ends can be attained only by the forcible overthrow of all existing social conditions. Let the ruling classes tremble at a Communistic revolution. The proletarians have nothing to lose but their chains. They have a world to win." / "WORKING MEN OF ALL COUNTRIES, UNITE!"

> **MODERN:** "Finally, they labour everywhere for the union and agreement of the democratic parties of all countries." / "The communists disdain to conceal their views and aims. They openly declare that their ends can be attained only by the forcible overthrow of all existing social conditions. Let the ruling classes tremble at a communist revolution. The proletarians have nothing to lose but their chains. They have a world to win." / "WORKING MEN OF ALL COUNTRIES, UNITE!"

**Finding: iconic closing PRESERVED.** "Nothing to lose but their chains… a world to win" is verbatim. The final rallying cry is byte-identical, correctly left in Moore's canonical form rather than modernised to "Workers of the world, unite!" — which is the better-known phrasing but is *not* what Moore/Engels wrote. Preserving the authorised wording here is the right call and I would not change it.

**Verdict on the specific brief:** both iconic lines and the polemical, ironic tone are fully intact. Nothing is garbled and nothing is genericised.

## Phase 1 flags: confirmed vs. disconfirmed

| Flag | Verdict |
|---|---|
| `pct_identical_long_paragraphs: 13.9` (27 paragraphs) | **Confirmed as fact, disconfirmed as defect.** I inspected identical paragraphs in Parts II, III and IV (samples 4, 5, 6). All are short, technically precise, or canonically fixed passages where identity is the right outcome. |
| `mean_weighted_similarity: 0.9108` / 4 of 5 chapters LIGHT | **Confirmed as fact.** The modern edition is a light copyedit throughout. Whether this is a defect is the substantive question — see recommendation. |
| `truncated_paragraphs_total: 0` | **Confirmed.** My independent scans found zero truncations, zero paragraphs below 0.70× source length, zero paragraphs starting mid-sentence, zero unterminated paragraphs, and zero bracketed editorial insertions. This is the cleanest file in my batch by every structural measure. |
| `empty_paragraphs_total: 0` | Confirmed. |
| `para_count_mismatches: 0` / `en_editions_aligned: true` | Confirmed. |
| `last_chapter_suspiciously_short: false` | Confirmed — Part IV is genuinely short (457 words) in the source too. |

## Phase 3 — human-edition research

**Does the core English already meet the reading standard? Yes.** This is the clearest "SOURCE is already fine" case in my batch. Moore's 1888 prose, as sampled above, is direct, forceful, and free of the features that make Pusey or Hobbes hard: no `thee/thou`, no obsolete senses, no periodic syntax. The passages a reader will struggle with — Part III's factional taxonomy, the Hegelian vocabulary in Part II, references like Guizot and Metternich — are **not** fixable by modernising the English, because the difficulty is historical reference, not language.

**Is there a better human English translation?**
- **Moore (1888) is already the best-positioned option**: complete, canonical, revised by Engels himself, and unambiguously public domain (PG #61). Any alternative would have to beat an author-authorised text.
- Later translations (e.g. Terrell Carver's, Samuel Moore-derived Penguin/Verso editions with modern apparatus) are in copyright and would add scholarly notes rather than clearer prose.
- **No search was warranted beyond confirming Moore's status**, since the existing core text already satisfies the standard. Recording this as "English core text already accessible" rather than "none found".

**What would actually help readers** is annotation, not translation: brief glosses on Metternich, Guizot, the June 1848 context, and — most of all — a short orienting note at the head of Part III explaining that the factions being attacked are real contemporary movements. That is onboarding/notes work, not edition work.

## Ratings

| Dimension | Weight | Score | Note |
|---|---|---|---|
| Fidelity / completeness | 40% | **5** | Nothing lost anywhere; word ratio 0.99; zero truncations, omissions or shifts across the whole 213-paragraph file; both iconic passages verbatim |
| First-read clarity | 25% | **4** | Genuinely clear — but that is mostly Moore's doing, and the real barrier (Part III's references) is untouched |
| Literary voice | 20% | **5** | Polemic, irony and rhetorical escalation fully preserved; the canonical closing correctly left alone |
| Restraint / no invention | 10% | **5** | Nothing added; notably resisted "improving" the final rallying cry into its more famous misquotation |
| Naturalness | 5% | **5** | Reads as forceful modern prose |

**Weighted score: 4.8 — band: Strong.**

Note the tension worth stating plainly: this scores Strong *and* fails the project's mechanical gate. The gate is measuring distance from the source, which for an already-modern source is the wrong proxy. This book is the clearest evidence in my batch that the 0.75 similarity gate should not be applied to post-1880 English translations.

## Recommendation

**SOURCE + GLOSSES.** Confidence: **high**. Correction scope: **none** (to the existing text).

Reasoning: the reading standard says a separate modern edition "is worthwhile only when it removes a substantial reader barrier", and that "for English originals that are already accessible, source + occasional glosses may be the best result." Moore/Engels 1888 is accessible. The current `modern-en` is faithful and well-judged but sits at 0.91 similarity to its source — it is a second copy of the Manifesto that differs mainly in capitalisation, and it costs maintenance, storage, audio generation and a Danish translation downstream for very little reader gain.

Concretely:
1. **Do not retranslate or rewrite.** Any deeper rewrite of this text would damage it — see sample 3.
2. **Keep `modern-en` as it stands if it is cheaper to keep than to remove** — it is harmless and faithful. But deprioritise it: it should never consume another rendering pass.
3. **Invest instead in glosses/notes**, concentrated on Part III and on the named figures. This is where the actual reading barrier is, and it is the one intervention that would measurably help completion.
4. **Exempt this book from the 0.75 similarity gate**, or the gate will keep flagging it forever and inviting an unnecessary re-render.

## Limitations of this review

- Sampling here is unusually strong for its size: I read the **complete Preamble (6 paragraphs) and complete Part IV closing**, plus four targeted passages — but that is still roughly **20 of 213 paragraphs** read closely, concentrated in the famous sections. Parts of the middle of Part I and Part II were not read line by line.
- Mechanical coverage **is** whole-file: similarity, truncation, shrinkage, fragmentation, near-identity and bracket scans all ran over all 213 paragraph pairs and came back clean, so I am confident there are no hidden structural defects.
- I did **not** verify Moore's 1888 English against Marx and Engels's German. The audit compares modern-en against the core English text; whether Moore renders the German well is a separate question I did not open.
- I did **not** assess `modern-da` (10,021 words vs 11,282 — a plausible ratio, unlike Confessions).
- I did not check the reader's rendering of the italic markup (`_revolutionary_`) which appears as literal underscores in the JSON and may or may not render as emphasis.
