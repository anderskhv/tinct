# iliad — The Iliad (Homer)

Batch B1 · audit date 2026-09-11 · reviewer: batch agent B1

## Edition snapshot (from Phase 1 `mechanical/iliad.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `3ba331f36cb935cb` | 24 | 1137 | 152,639 | Butler (1898), tr. Samuel Butler |
| modern-en | `d424a2e68fd2e302` | 24 | 1137 | 151,096 | Modern English |
| modern-da | `07123206c3467abd` | 24 | 1137 | 143,164 | Moderne Dansk |

`en_editions_aligned: true`, no count mismatches, 0 truncated, 0 empty,
**mean weighted similarity 0.9217**, **pct_identical_long_paragraphs 5.0**.

## Core English text — provenance and completeness

Samuel Butler's 1898 prose *Iliad*. Complete, 24 books. Public domain
worldwide (Butler d. 1902).

## Headline finding

**The `modern-en` edition of the Iliad is not a modern English edition.** It is
Samuel Butler's 1898 prose with (a) Roman god-names replaced by Greek, (b)
British spellings Americanized, and (c) a scattering of single-word swaps. The
word ratio is 1.00 in fourteen of twenty-four books. This holds across the
whole poem, not in patches.

Per-chapter weighted similarity, recomputed from the files:

```
ch 1 0.824   ch 7 0.971   ch13 0.774   ch19 0.903
ch 2 0.919   ch 8 0.965   ch14 0.852   ch20 0.917
ch 3 0.924   ch 9 0.981   ch15 0.869   ch21 0.930
ch 4 0.958   ch10 0.970   ch16 0.882   ch22 0.942
ch 5 0.963   ch11 0.981   ch17 0.896   ch23 0.950
ch 6 0.965   ch12 0.983   ch18 0.894   ch24 0.960
```

Even the *most* worked chapters (13 at 0.774, 14 at 0.852) are copyedits, not
modernizations — see sample 5 below.

## Phase 1 flags — confirmed / disconfirmed

- **mean similarity 0.9217 — CONFIRMED and it is the correct read.** Unlike the
  Odyssey, the number is not concealing a split; the whole book is near-identical.
- **pct_identical_long_paragraphs 5.0 — CONFIRMED.** My own count: **34
  paragraphs of ≥200 characters are byte-identical** between `original-en` and
  `modern-en`. Fifteen of them are in Book 2 (the Catalogue of Ships), two each
  in Books 3, 4, 6, 7, 8, 9, 12, 24, five in Book 10, seven in Book 11.
  Example, Book 2 para 67, identical byte for byte in both editions:
  > "Now there is a high mound before the city, rising by itself upon the plain.
  > Men call it Batieia, but the gods know that it is the tomb of lithe Myrine.
  > Here the Trojans and their allies divided their forces."
- **0 truncated paragraphs — CONFIRMED.** My 72%-length sweep across all 1,137
  paragraph pairs found **zero** paragraphs where modern-en drops below 72% of
  the source length. Nothing is omitted, because nothing is rewritten.
- **last_chapter_suspiciously_short: false — CONFIRMED.** Book 24 ends properly
  at Hector's funeral (8,309 words).

## Samples inspected (8)

### 1. Book 1, paras 0–3 (invocation, plague of Apollo)

> **SRC** "Sing, O goddess, the anger of Achilles son of Peleus, that brought
> countless ills upon the Achaeans. Many a brave soul did it send hurrying down
> to Hades… for so were the counsels of Jove fulfilled"
>
> **MOD** "Sing, O goddess, of the anger of Achilles son of Peleus, the anger
> that brought countless troubles upon the Achaeans. It sent many a brave soul
> hurrying down to Hades… for so were the plans of Zeus fulfilled"

The heaviest intervention in the poem's opening is un-inverting one clause and
"counsels"→"plans". "Sing, O goddess", "many a brave soul", "fell out with one
another" all stand.

### 2. Book 2, paras 48, 67, 70, 71 (Catalogue of Ships) — byte-identical

Fifteen long Catalogue paragraphs are byte-for-byte identical (quoted above).
The Catalogue is precisely the passage a modern reader most needs help with —
two hundred unexplained place-names — and it received no edit whatsoever.

### 3. Book 6, paras 30–31 (Hector and Andromache)

> **SRC** "May I lie dead under the barrow that is heaped over my body **ere** I
> hear your cry as they carry you into bondage."
>
> **MOD** "May I lie dead under the barrow that is heaped over my body
> **before** I hear your cry as they carry you into bondage."

A 246-word speech at 0.974 similarity. "ere"→"before", "for ever"→"forever",
"task-master"→"taskmaster", "On this"→"At this" is the complete diff. "with
what face should I look upon the Trojans", "I know nothing save to fight
bravely in the forefront of the Trojan host", "ply the loom", "put away the day
of captivity from you" all remain.

### 4. Book 9, paras 4–6 (the Embassy to Achilles) — 0.981 similarity

> **SRC** "no one of the Achaeans can make light of what you say nor **gainsay**
> it… for he that **foments civil discord** is a clanless, hearthless outlaw."
>
> **MOD** "no one of the Achaeans can make light of what you say nor **gainsay**
> it… for he that **foments civil discord** is a clanless, hearthless outlaw."

Identical. In the following paragraph the entire modernization of a 164-word
Nestor speech is `wherewith`→`with which` and `got together`→`gathered
together`; "let us obey the behests of night", "the foe has lit his watchfires
hard by our ships", "Who can be other than dismayed?" survive untouched.

### 5. Book 13, para 10 (Poseidon rallies the Achaeans) — the *most*-edited passage found

> **SRC** "Of a truth my eyes behold a great and terrible portent which I had
> never thought to see—the Trojans at our ships—they, who were **heretofore**
> like panic-stricken **hinds**… **Hitherto** the Trojans dared not for one
> moment face the attack"
>
> **MOD** "Truly, my eyes behold a great and terrible portent that I never
> thought to see—the Trojans at our ships—they, who were **always** like
> panic-stricken **deer**… **Until now**, the Trojans never dared face the
> attack"

This is the deepest edit I found anywhere in the *Iliad*, and it is still
Butler: "sallied far from their city", "You do ill to be thus remiss", "the
hazard of the fight is extreme" → "the danger is extreme" is as far as it goes.
310 → 299 words, similarity 0.683.

### 6. Book 16, paras 30–32 (death of Sarpedon)

> **SRC** "He fell like some oak or silver poplar or tall pine to which
> **woodmen** have laid their axes upon the mountains… now if ever **quit**
> yourself like a valiant soldier"
>
> **MOD** "He fell like some oak, silver poplar, or tall pine to which
> **woodcutters** have laid their axes upon the mountains… now if ever
> **acquit** yourself like a valiant soldier"

239-word paragraph, 0.903 similarity. The great Sarpedon similes survive
completely — which is a genuine fidelity strength — but nothing is clarified.

### 7. Book 22, paras 25–27 (death of Hector)

> **SRC** "When he had thus said the shrouds of death enfolded him, **whereon**
> his soul went out of him… whensoever Jove and the other gods see fit"
>
> **MOD** "When he had thus said, the shrouds of death enfolded him,
> **whereupon** his soul went out of him… whenever Zeus and the other gods see
> fit"

### 8. Book 24, paras 54–56 (ending, Hector's funeral)

> **SRC** "**Forthwith** they yoked their oxen and mules… Then when the child of
> morning, rosy-fingered dawn, appeared on the eleventh day"
>
> **MOD** "**At once** they yoked their oxen and mules… Then when the child of
> morning, rosy-fingered dawn, appeared on the eleventh day"

190-word paragraph at 0.976. The closing line differs only by a comma.

## What this means against the reading standard

Judged as a *translation*, this text is flawless: it is Butler, so nothing is
omitted, nothing invented, no image replaced, no joke flattened, no name
inconsistent. Judged as a *modern English edition* — which is what it is
labelled and sold as, and what the reader picking "Modern English" in the
edition switcher expects — it fails almost completely. Butler's 1898 register
survives intact: *gainsay, behests, wherewith, vouchsafed, forthwith, of a
truth, heretofore, hitherto, ere, hard by, foments civil discord, remiss,
smote, whereon.*

A reader who switches from "Butler (1898)" to "Modern English" gets a page that
is, in fourteen books out of twenty-four, exactly the same length and
substantially the same sentences. That is a product-integrity problem as much
as an editorial one.

## Phase 3 — human-edition research

Same candidate landscape as the Odyssey; details and URLs are in
`per-book-notes/odyssey.md` and are not repeated at length.

| Candidate | Completeness | Rights | Verdict |
|---|---|---|---|
| **Samuel Butler, 1898 prose** (current core) | Complete | **Public domain** worldwide — https://www.gutenberg.org/ebooks/2199 · https://en.wikisource.org/wiki/The_Iliad_of_Homer_(Butler) | Still the most readable PD *Iliad* found. Direct, brisk, novelistic. |
| Lang, Leaf & Myers, 1883/1911 prose | Complete | Public domain (US) — https://www.gutenberg.org/files/3059/3059-h/3059-h.htm | **Read and rejected on accessibility.** Opening: *"Sing, goddess, the wrath of Achilles Peleus' son, the ruinous wrath that brought on the Achaians woes innumerable, and hurled down into Hades many strong souls of heroes."* Deliberately archaising; materially harder than Butler. |
| William Cullen Bryant blank verse, Standard Ebooks | Complete | Underlying text PD; Standard Ebooks' production released **CC0 1.0** — https://standardebooks.org/ebooks?query=homer | Verse, Victorian. Not an accessibility upgrade. |
| A. T. Murray, Loeb 1924 | Complete | 1924 original PD in US; **Wyatt's 1999 revision in copyright** | Care needed; not better than Butler. |
| Ian Johnston, modern verse | Complete | **Permission required / unclear** — "free … other than for commercial book publication", but Johnston sells print editions commercially; Tinct is a paid product. Site `johnstoniatexts.x10host.com` was returning "Account Suspended" during this audit, so **text unread, accessibility unverified.** | The only modern-English Homer in reach. Worth a direct permission approach. |
| Lattimore / Fagles / Fitzgerald / Wilson / Green | — | **Fully in copyright** | Out of scope. |

**Conclusion:** Butler remains the best public-domain *Iliad*. This means a
genuine modern-English layer over Butler is worth building — it is the only way
to get a truly modern *Iliad* into a commercial product without licensing.
"None better found in this search," not "none exists."

## Ratings

| Dimension | Weight | Score | Reason |
|---|---|---|---|
| Fidelity / completeness | 40% | **5** | Nothing lost — it is the source text. Zero omissions in a full-book length sweep. |
| First-read clarity | 25% | **2** | Fails its purpose. 1898 Victorian prose throughout; 34 long paragraphs byte-identical; the Catalogue of Ships untouched. |
| Literary voice | 20% | **4** | Butler's voice fully intact; nothing flattened. |
| Restraint / no invention | 10% | **5** | No invention anywhere — nothing was written. |
| Naturalness | 5% | **3** | Natural as Victorian prose; not natural as contemporary English. |

**Weighted score: 4.0** — but see the caveat.

**Band: Mixed.**

> **Caveat on the number.** The weighted formula rewards a verbatim copy: an
> unedited source text scores 5 on fidelity (40%) and 5 on restraint (10%) by
> construction. The 4.0 here is an artefact and must not be read as "this
> edition is good." The band, not the score, is the honest summary. If this
> figure is used to sort the master queue, the Iliad should be sorted by the
> clarity score, not the composite.

## Recommendation

**RETRANSLATE** · confidence **high** · correction scope **substantial**

The defect is the opposite of local: it is the entire book. There is nothing to
"light edit" because almost no editorial decision has been made yet. A genuine
modern-English *Iliad* over Butler needs to be produced from scratch, to the
standard the Odyssey already demonstrates in its Books 1, 12 and 20.

**Runner-up, if resources are tight: SOURCE + GLOSSES** — retire `modern-en`
and ship Butler alone with a gloss layer (the Catalogue of Ships, the epithets,
the god-name key). That is strictly more honest than shipping a near-duplicate
edition under a "Modern English" label, and it is the cheaper of the two fixes.
What should not continue is the present state, where the toggle promises
something it does not deliver.

## Limitations of this review

- 8 passages read closely (~1,600 source words of 152,639, ~1%). But the
  coverage finding rests on a **whole-book** computation — per-chapter
  similarity, a full byte-identical scan (34 hits), and a full 72%-length
  sweep (0 hits) — so the "this is not a modernization" conclusion is
  whole-book evidence, not sampling.
- I did **not** check: modern-da; audio; threads/cast JSON; onboarding content;
  whether any single book was modernized and later overwritten (the git history
  of the edition file was not examined and might explain how this happened).
- Rights findings for Butler and Lang/Leaf/Myers are high-confidence (texts
  read). Ian Johnston is **unverified** on both accessibility and rights.
