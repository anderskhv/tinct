# jane-eyre — Jane Eyre (Charlotte Brontë, 1847)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (English-originals batch)

## Edition snapshot (from Phase 1 `mechanical/jane-eyre.json`)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en (Original (1847)) | `055aad5e04c0c9db` | 38 | 4047 | 184,364 |
| modern-en (Modern English) | `bbfe4c30163ecf07` | 38 | 4047 | 175,639 |
| modern-da (Moderne Dansk) | `2c2fad5c5aff97de` | 38 | 4047 | 176,107 |

`en_editions_aligned: true`, no count mismatches, mean weighted similarity **0.6753**,
**0.9 % identical long paragraphs**, **17 truncation candidates**, 0 empty paragraphs, last
chapter not flagged short.

## Provenance / completeness of the core English text

- `original-en` is Brontë's own 1847 English. No translator. Registry (`bookRegistry.ts`,
  `JANE_EYRE`) records `label: 'Original (1847)'`, `year: 1847`, no source attribution.
- 38 chapters, Chapter 1 through "Chapter 38 — Conclusion". Complete; no missing or merged
  chapters, no Gutenberg boilerplate observed in the sampled text.

## Shape of the modern-en edition

Per-chapter word overlap runs a fairly tight 0.66–0.81 for 36 of 38 chapters, with length ratios
0.87–1.04. Two departures matter:

- **Chapter 34 is an outlier at 0.937 overlap, ratio 1.03** — i.e. essentially *unmodernized*.
- **Chapters 35, 36, 37, 38 drop to ratios 0.87 / 0.84 / 0.84 / 0.83** and carry 21 of the 24
  paragraphs in the book where the modern text is under 70 % of the source length. The final act
  of the novel is where the edition breaks down.

My own truncation scan (src ≥ 50 w, ratio < 0.70) returns 24 paragraphs: 3 in ch 27, 1 in ch 35,
3 in ch 36, **14 in ch 37**, 3 in ch 38.

## Samples inspected (8)

### 1. Opening — Chapter 1, paras 0–2 — STRONG

- SRC p1: `dreadful to me was the coming home in the raw twilight, with nipped fingers and toes`
- MOD p1: `I dreaded coming home in the raw twilight with frozen fingers and toes`

Complete, natural, Jane's retrospective register intact. Mrs. Reed's indirect-speech verdict in
p2 survives whole, including the fussy triad `something lighter, franker, more natural`.

### 2. Chapter 12, paras 3–4 — STRONG

The novel's most-quoted argument is rendered complete and with its force preserved.

- SRC p4: `Women are supposed to be very calm generally: but women feel just as men feel; they need
  exercise for their faculties, and a field for their efforts, as much as their brothers do`
- MOD p4: `Women are supposed to be very calm, as a rule. But women feel exactly as men feel. They
  need exercise for their minds, and a field for their efforts, just as much as their brothers do.`

Every clause of the source is present. `exercise for their faculties` → `exercise for their minds`
narrows "faculties" slightly; that is the only quibble I have in 305 words. p3 keeps the
"tale that was never ended" passage in full.

### 3. Chapter 23 (Rochester's proposal), para 66 — STRONG

- SRC: `Do you think, because I am poor, obscure, plain, and little, I am soulless and heartless?
  You think wrong!—I have as much soul as you,—and full as much heart!`
- MOD: `Do you think, because I am poor, obscure, plain, and small, I am soulless and heartless?
  You think wrong! I have as much soul as you—and fully as much heart!`

162 → 159 words; the whole speech including `it is my spirit that addresses your spirit … we stood
at God's feet, equal,—as we are!` is intact.

### 4. Chapter 27, para 160 (402 → 110 words, ratio 0.27) — **SEVERE OMISSION + INVENTION**

Jane's flight from Thornfield. The mechanical flag on this paragraph is the single worst ratio in
the book and it is entirely justified.

- SRC (after the scaffold simile): `…and I thought of drear flight and homeless wandering—and oh!
  with agony I thought of what I left. … I longed to be his; I panted to return: it was not too
  late; I could yet spare him the bitter pang of bereavement. … It was a barbed arrow-head in my
  breast; it tore me when I tried to extract it; it sickened me when remembrance thrust it farther
  in. … I had injured—wounded—left my master. I was hateful in my own eyes. … I fell: I lay on the
  ground some minutes, pressing my face to the wet turf. I had some fear—or hope—that here I should
  die…`
- MOD (in full, after the same simile): `I thought of a drain deep and dark through which a torrent
  of blood was pouring, from which no dam could stop the flow.`

About 300 words of Jane's interior crisis — the temptation to go back, the barbed arrow, the
self-hatred, the collapse on the turf, the fear-or-hope of dying there — are deleted, and the
replacement sentence (`a drain deep and dark through which a torrent of blood was pouring`) is
**not in Brontë anywhere**. This is invention, not compression.

### 5. Chapter 34, paras 84–87 — **UNMODERNIZED (LIGHT/MECHANICAL FALSE "MODERN")**

At 9,217 source words this is the longest chapter in the book, and its modern-en is the source with
cosmetic touches only.

- SRC p86: `He looked up the pass and down the hollow; his glance wandered away with the stream,
  and returned to traverse the unclouded heaven which coloured it: he removed his hat, let the
  breeze stir his hair and kiss his brow. He seemed in communion with the genius of the haunt: with
  his eye he bade farewell to something.`
- MOD p86: byte-identical to the above, British spelling `coloured` and all.

Across the chapter the only changes are `beck` → `stream`, `meantime` → `meanwhile`, `to their very
core` → `into their very core`, and semicolon-to-comma tweaks. `minutely enamelled`, `raiment`,
`crag for gem`, `the genius of the haunt` all stand. 6 of the book's 8 identical long paragraphs
are in this chapter. A reader who switches to "Modern English" here gets 1847 prose under a 2026
label.

### 6. Chapter 36, para 48 (351 → 184 words) — **HALLUCINATED ALTERNATIVE PLOT**

The innkeeper's account of the Thornfield fire — the passage that tells the reader what happened
to Bertha, to Mrs. Fairfax, to Adèle, and to Rochester.

- SRC: `…on this night, she set fire first to the hangings of the room next her own, and then she
  got down to a lower storey, and made her way to the chamber that had been the governess's—(she
  was like as if she knew somehow how matters had gone on, and had a spite at her)—and she kindled
  the bed there; but there was nobody sleeping in it, fortunately. The governess had run away two
  months before; and for all Mr. Rochester sought her as if she had been the most precious thing he
  had in the world, he never could hear a word of her; and he grew savage… He sent Mrs. Fairfax, the
  housekeeper, away to her friends at a distance; but he did it handsomely, for he settled an
  annuity on her for life… Miss Adèle, a ward he had, was put to school. He broke off acquaintance
  with all the gentry, and shut himself up like a hermit at the Hall.`
- MOD: `…But this time she went up to the third floor and set the governess's old room on fire—the
  room directly above. Then she went down to a lower floor and set fire to the hangings in the room
  where her husband was sleeping. But he had already woken—the whole floor was blazing. He got up
  and managed to save the servants. Then he went back for her.`

The order of the fires is reversed, Rochester is placed asleep in a burning room (he is not, in
Brontë), and **every piece of plot information the paragraph exists to deliver** — Rochester's
search for Jane, his savagery, Mrs. Fairfax's annuity, Adèle sent to school, the hermit at the Hall
— is gone. A reader of modern-en simply never learns these things.

### 7. Chapter 37 (Ferndean), paras 63, 85–86, 91–92 — **RECURRING OMISSION + MEANING REVERSAL**

Fourteen paragraphs in this chapter fall below 70 % of source length. Four representative cases:

- **p63 (130 → 44 w), meaning reversed.** SRC: Jane fears *she* has been improper — `Perhaps I had
  too rashly over-leaped conventionalities; and he, like St. John, saw impropriety in my
  inconsiderateness` — and begins to withdraw from his arms, `but he eagerly snatched me closer`.
  MOD: `I felt a kind of panic stir in me. I began to wonder if he was going to refuse me.` Different
  emotion, different cause, and the physical beat is cut.
- **p85 (119 → 50 w).** Deleted: `in his presence I thoroughly lived; and he lived in mine. Blind as
  he was, smiles played over his face, joy dawned on his forehead`. Replaced with an invented
  sentence about Rochester being `astonished, even a little overwhelmed`.
- **p86 (96 → 46 w).** Deleted: `I wished to touch no deep-thrilling chord—to open no fresh well of
  emotion in his heart` and `If a moment's silence broke the conversation, he would turn restless,
  touch me, then say, "Jane."` — the detail that carries his blindness.
- **p91 (123 → 48 w).** Deleted: `Yes: for her restoration I longed, far more than for that of my
  lost sight.` Rochester's decisive line. Replaced with the invented `I stretch my hand and touch
  what I dreamed would never be real again.`
- **p92 (59 → 22 w).** The eyebrows — `I passed my finger over his eyebrows, and remarked that they
  were scorched, and that I would apply something which would make them grow as broad and black as
  ever` — deleted entirely.

### 8. Chapter 38 "Conclusion", para 13 (196 → 102 words) — **OMISSION AT THE BOOK'S LAST BEAT**

- SRC (deleted half): `Never did I weary of reading to him; never did I weary of conducting him
  where he wished to go: of doing for him what he wished to be done. And there was a pleasure in my
  services, most full, most exquisite, even though sad—because he claimed these services without
  painful shame or damping humiliation. He loved me so truly, that he knew no reluctance in
  profiting by my attendance: he felt I loved him so fondly, that to yield that attendance was to
  indulge my sweetest wishes.`
- MOD: stops at `And impressing by sound on his ear what light could no longer stamp upon his eyes.`

The passage that resolves the whole marriage — that his dependence humiliates neither of them — is
simply absent.

## Phase 1 flags: confirmed / disconfirmed

| flag | verdict |
|---|---|
| 17 truncation candidates (ch 27 ×2, 35 ×2, 36, 37 ×11, 38) | **CONFIRMED, and understated** — my scan at a looser threshold returns 24, same distribution. Every one I opened (27/150, 27/160, 36/48, 37/63, 37/85, 37/86, 37/91, 37/92, 38/13) is real content loss, several with invented replacement text. None is legitimate compression. |
| mean similarity 0.6753 | **Confirmed and, for chs 1–33, healthy** — this is real-rewrite range and the rewrites are good. The number does not reveal the ch 34 anomaly or the ch 35–38 collapse. |
| 0.9 % identical long paragraphs | **CONFIRMED and localised**: 8 paragraphs ≥ 25 words are byte-identical, 6 of them in ch 34 — the signature of the unmodernized chapter. |
| alignment / no count mismatch | **Confirmed clean.** |
| last chapter short | **Disconfirmed** — ch 38 is a short conclusion by design, though its content *is* partly missing (see sample 8). |

## Human-edition research (Phase 3)

English original; no translation-rights question.

- **Original, public domain.** 1847; Brontë died 1855. Public domain in the US and the EU/Denmark.
  Standard Ebooks publishes a proofed edition dedicated to the public domain under **CC0 1.0**
  (https://standardebooks.org/ebooks/charlotte-bronte/jane-eyre), with the usual caveat that it
  makes no representation about copyright status outside the United States.
- **Is the original already accessible enough to stand alone?** Partly. Brontë's syntax is less of a
  barrier than Melville's or Dickens's, but *Jane Eyre* carries untranslated French (Adèle, Mme
  Pierrot), heavy scriptural and Bunyan allusion, and period vocabulary that a glossing layer
  handles better than a rewrite. A good modern-en earns its place here — and chapters 1–33 of the
  current one demonstrate that.
- **Human modern-English editions: none rights-clear found.** Searching surfaced only modern
  *retellings/adaptations* (e.g. contemporary-setting novels) and commercial learner editions, all
  in copyright and several abridged. Recording as "none found in this search", not "none exists".

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40 % | **2** |
| first-read clarity | 25 % | **4** |
| literary voice | 20 % | **3** |
| restraint / no invention | 10 % | **2** |
| naturalness | 5 % | **4** |

**Weighted score 2.8 — band: Poor.**

This score is a whole-book average and it undersells chapters 1–33, which would rate 4–5 on every
dimension. It is dragged down by five chapters (27, 34, 35–38) in which the edition is either
unmodernized or actively wrong — and those five include the novel's entire final act.

## Recommendation

**RETRANSLATE** (regionally scoped) — confidence **high**, correction scope **substantial**.

Concretely: regenerate **chapters 27, 34, 35, 36, 37 and 38** against the source, and spot-check
chapters 10 and 11 (the next-lowest length ratios, 0.89 and 0.91, not yet inspected). Chapters
1–26 and 28–33 should be left alone — they meet the standard and re-generating them would risk
what is currently good work.

I am calling this RETRANSLATE rather than LIGHT EDIT because the defects in the affected chapters
are not local touch-ups: ch 36 p48 and ch 27 p160 contain hallucinated content that has to be
thrown away and redone, ch 34 was never modernized at all, and ch 37 has fourteen separate
under-length paragraphs. That is re-generation work, not editing.

**Reader impact ranking (for triage):** ch 36 p48 (plot information a reader never receives) >
ch 27 p160 (invented image at the novel's emotional crisis) > ch 37 (the reunion) > ch 38 p13
(the ending) > ch 34 (false "modern" label, no information lost).

## Limitations of this review

- 8 sampled locations out of 38 chapters; ~15 paragraph pairs read in full. Length-ratio and
  word-overlap statistics were computed for all 4,047 paragraph pairs, so the damage *distribution*
  is reliable, but chapters 2–11, 13–22, 24–26 and 28–33 were not read.
- I did not inspect `modern-da`.
- I did not verify the transcription source of `original-en`.
- The claim that the ch 27/36/37 replacement sentences are "not in Brontë anywhere" is based on
  reading the aligned source paragraphs, not on a full-text search of the novel for those images.
