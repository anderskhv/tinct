# odyssey — The Odyssey (Homer)

Batch B1 · audit date 2026-09-11 · reviewer: batch agent B1

## Edition snapshot (from Phase 1 `mechanical/odyssey.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `da03f6ac9dfd5a19` | 24 | 1027 | 117,228 | Butler (Prose, 1900), tr. Samuel Butler |
| modern-en | `813127d77b4041f6` | 24 | 1027 | 104,916 | Modern English |
| modern-da | `0b8a114304427d3e` | 24 | 1027 | 101,339 | Moderne Dansk |

`en_editions_aligned: true`, no chapter/paragraph count mismatches, 0 truncated
paragraphs, 0 empty paragraphs, 0 identical long paragraphs, mean weighted
similarity 0.6946.

## Core English text — provenance and completeness

Samuel Butler's 1900 prose *Odyssey*, "rendered into English prose for the use
of those who cannot read the original." Complete, 24 books. Public domain
worldwide (Butler d. 1902; first published 1900). Butler's own editorial
square brackets around lines he judged interpolated are present in
`original-en` (e.g. Book 12 p7 `[A large fig tree in full leaf grows upon it]`).

## Phase 1 flags — confirmed / disconfirmed

- **Mean similarity 0.69 reported as a whole-book figure — DISCONFIRMED as
  uniform.** I recomputed per chapter. The book splits sharply:
  - Books 1, 5, 10–13, 16–18, 20, 22, 23: weighted similarity 0.54–0.67 —
    genuinely rewritten.
  - **Books 9 (0.903), 14 (0.815), 19 (0.962), 2 (0.835)**: essentially
    unmodernized Butler. Book 19 is the extreme case (word ratio 1.00).
  This is the single most important finding and the whole-book mean conceals it.
- **0 truncated paragraphs — CONFIRMED**, but a 72%-length sweep I ran found 7
  paragraphs below 0.72 ratio (ch5 p15, ch5 p32, ch16 p23–24, ch20 p2, p17,
  p32). I inspected ch5 p15 and ch20 p2: local compression of Butler's
  Victorian padding, not substantive omission.
- **0 identical long paragraphs — CONFIRMED.** Even in Book 19 the edition
  substitutes names and Americanizes spelling, so nothing is byte-identical.
  The mechanical `pct_identical_long_paragraphs` metric therefore **misses** the
  unmodernized books entirely; per-chapter similarity is the check that catches
  them.
- **last_chapter_suspiciously_short: false — CONFIRMED** (Book 24, 4,896 words,
  ends correctly at Athena's covenant of peace).

## Samples inspected (8)

### 1. Book 1, paras 0–5 (opening / council of the gods)

> **SRC** "Tell me, O Muse, of that ingenious hero who travelled far and wide
> after he had sacked the famous town of Troy… they perished through their own
> sheer folly in eating the cattle of the Sun-god Hyperion"
>
> **MOD** "Tell me, Muse, of that clever hero who wandered far and wide after
> he destroyed the famous city of Troy… they died through their own reckless
> folly when they ate the cattle of the sun god Helios."

Good modernization. Note the edition applies a **consistent Roman→Greek name
policy** (Jove→Zeus, Minerva→Athena, Neptune→Poseidon, Mercury→Hermes,
Ulysses→Odysseus, Saturn→Cronos). That is a defensible improvement and matches
every modern translation, so I do **not** count it as an alteration.

**Finding (minor):** `Hyperion` → `Helios` is a different kind of change — it
substitutes one deity name for another rather than Latinised-for-Greek. Butler
writes Hyperion; Homer's formula is *Helios Hyperion*. Local, defensible, but
it is a content substitution, not a transliteration fix.

**Finding (minor):** Book 1 p4, Butler's "You, sir, take no heed of this" →
"Yet you pay no attention to this." The mode of address (Athena addressing Zeus
as "sir") is dropped. Trivial.

### 2. Book 5, paras 12–15 (Calypso releases Odysseus)

> **SRC** "so the pair, goddess and man, went on and on till they came to
> Calypso's cave"
>
> **MOD** "and Odysseus followed until they reached Calypso's cave"

**Finding:** "the pair, goddess and man" — a deliberate Homeric pairing formula
— and the iterative "went on and on" are both dropped. Same paragraph drops
"and they laid their hands on the good things that were before them" down to
"They ate the good food set before them." Local compression of formula. Not an
omission of substance, but it is the kind of loss the reading standard's
"meaningful repetition must survive" clause is aimed at. 91 → 55 words.

### 3. Book 9, paras 10–12 (Cyclops' cave) — **unmodernized chapter**

> **SRC** "I went on board, bidding my men to do so also and loose the hawsers;
> so they took their places and smote the grey sea with their oars… It was a
> station for a great many sheep and goats"
>
> **MOD** "I went on board, telling my men to do so also and loose the cables;
> so they took their places and struck the gray sea with their oars… It was a
> shelter for a great many sheep and goats"

Butler's sentence architecture, semicolon chains and Victorian register are
untouched. "hoggets"→"yearlings", "my mind misgave me"→"my mind warned me",
"wallet"→"bag" are the entire intervention. 211-word paragraphs come through at
0.94 similarity. **This is a LIGHT/MECHANICAL false modern chapter.**

### 4. Book 11, paras 2–4 (Nekyia — Elpenor)

> **SRC** "I was lying asleep on the top of Circe's house, and never thought of
> coming down again by the great staircase but fell right off the roof"
>
> **MOD** "I was sleeping on the roof of Circe's house and forgot to use the
> long staircase **when I woke**. I fell straight off the roof"

**Finding (invention, minor):** "when I woke" is not in the source. It closes a
gap Butler leaves open. Also "this limbo" → "this underworld" is a reasonable
gloss; "make a barrow" → "build a burial mound" is good.

### 5. Book 12, paras 6–8 (Scylla and Charybdis)

> **SRC** "fishing for dolphins or dogfish or any larger monster that she can
> catch, of the thousands with which **Amphitrite teems**"
>
> **MOD** "fishing for dolphins, sharks, or any larger sea creature she can
> catch from the thousands that **swarm in these waters**"

**Finding (image replaced by explanation):** Amphitrite — the sea-goddess whose
name *is* the sea in Homeric idiom — is replaced by a flat locative. The
mythological image is converted into geography.

**Finding (apparatus loss):** Butler's editorial brackets `[A large fig tree in
full leaf grows upon it]` are silently removed in modern-en ("A large fig tree
grows on it in full leaf"). Butler's judgement about the line's authenticity is
erased with no note. Systematic — worth a global check if Butler's brackets are
used elsewhere.

Otherwise this passage is a strong sample: "turned towards Erebus" → "facing
west toward the underworld" is exactly the right kind of gloss, and Scylla's
twelve feet, six necks, three rows of teeth all survive intact.

### 6. Book 19, paras 0–3 and 20–22 (recognition of the scar) — **unmodernized chapter**

> **SRC** "Ulysses was left in the cloister, pondering on the means whereby with
> Minerva's help he might be able to kill the suitors."
>
> **MOD** "Odysseus was left in the courtyard, pondering on the means whereby
> with Athena's help he might be able to kill the suitors."

> **SRC** "I shall not let any of the young hussies about your house touch my
> feet… let me say this moreover, which pray attend to"
>
> **MOD** "I shall not let any of the young hussies about your house touch my
> feet… let me say this moreover, which pray attend to"

Identical but for name swaps and "armour"→"armor", "store-room"→"storeroom",
"got"→"gotten", "hecatombs"→"sacrifices". A 246-word Euryclea speech comes
through at 0.972 similarity with "gibing", "I make bold to say", "hussies" and
"which pray attend to" all left standing. **Book 19 — the recognition scene, one
of the two or three most important books in the poem — is not modernized at
all.** Chapter word ratio 1.00.

### 7. Book 20, paras 0–3 (Odysseus sleepless) — most-rewritten chapter

> **SRC** "His heart growled within him, and as a bitch with puppies growls and
> shows her teeth when she sees a stranger, so did his heart growl with anger
> **at the evil deeds that were being done**"
>
> **MOD** "His heart growled within him like a mother dog **protecting** her
> puppies, baring her teeth at a stranger."

**Finding (omission + invention, local):** the object of the anger — "at the
evil deeds that were being done" — is dropped, and "protecting" is added (the
source says only that the dog growls). The formal Homeric simile (*as X … so
Y*) is collapsed into a compressed comparison. 203 → 158 words.

Elsewhere in this chapter the rewriting is good: "the women who had been in the
habit of misconducting themselves with them" → "the servant women who had been
sleeping with the suitors" is the right call.

### 8. Book 24, paras 41–44 (ending)

> **SRC** "Then the son of Saturn sent a **thunderbolt of fire** that fell just
> in front of Minerva"
>
> **MOD** "Then the son of Cronus sent a **thunderbolt** that fell just in front
> of Athena"

Minor loss ("of fire"). "pray to the blue-eyed damsel" → "pray to the gray-eyed
maiden" correctly restores Homer's γλαυκῶπις. Ending complete; the covenant of
peace, the eagle simile and Athena-as-Mentor all present.

## Phase 3 — human-edition research

The core English text is itself a translation, so this is in scope.

| Candidate | Translator / date | Completeness | Rights | URL | Verdict |
|---|---|---|---|---|---|
| **Current core** | Samuel Butler, 1900, prose | Complete, 24 books | **Public domain** (US: pre-1930; worldwide: author d. 1902) | https://www.gutenberg.org/files/1727/1727-h/1727-h.htm · https://en.wikisource.org/wiki/The_Odyssey_(Butler) | Best PD option found. Read and compared directly. |
| Butcher & Lang, 1879 prose | S. H. Butcher & Andrew Lang | Complete | Public domain (US) | https://archive.org/details/iliadodysseydone00homeuoft | **Rejected on accessibility.** Deliberately archaising King-James pastiche; strictly harder than Butler. |
| A. T. Murray, Loeb, 1919 prose | A. T. Murray | Complete | 1919 original PD in US; **later Loeb revisions (Dimock 1995) are in copyright** | https://archive.org/details/odysseywithengli02home | Not better than Butler for a first read; the accessible-looking Loeb texts online are usually the revised, copyrighted ones. Flag for care. |
| William Cullen Bryant blank verse (Standard Ebooks) | W. C. Bryant, 1871 | Complete | Standard Ebooks releases **CC0 1.0** for its own production work; underlying text PD | https://standardebooks.org/ebooks?query=homer | Verse; Victorian diction. Useful as a second edition, not as an accessibility upgrade. |
| Ian Johnston modern verse | Ian Johnston (Vancouver Island Univ.), 2000s, revised | Complete | **Permission required / unclear.** Site states materials are free "other than for commercial book publication"; Johnston also sells print editions via Richer Resources Publications. Tinct is a paid subscription product, so this is not settled. Primary site `johnstoniatexts.x10host.com` returned "Account Suspended" during this audit — **text not read, accessibility unverified.** | (site down at audit time) | The only genuinely *modern* English Homer found in this search that is even arguably reusable. Worth a direct permission request. |
| Emily Wilson, Lattimore, Fagles, Fitzgerald | — | — | **Fully in copyright** | — | Out of scope. |

**Conclusion:** no public-domain human translation of the *Odyssey* is more
accessible than Butler. Butler is already the best PD option and is also the
edition Tinct ships. So the modernization work is genuinely worth doing — a
modern-English layer over Butler adds real value — and the existing one mostly
does its job. "No suitable *better* PD edition found in this search"; I am not
claiming none exists.

## Ratings

| Dimension | Weight | Score | Reason |
|---|---|---|---|
| Fidelity / completeness | 40% | **4** | No substantive omission found in 8 samples; several small local losses (Amphitrite, "at the evil deeds", "the pair, goddess and man", "thunderbolt of fire", Butler's brackets). |
| First-read clarity | 25% | **3** | Good where rewritten, but Books 2, 9, 14, 19 (~20k words, ~19% of the poem) are unmodernized Victorian Butler. Inconsistent. |
| Literary voice | 20% | **4** | Similes, epithets and images largely survive; the Greek-name policy is an improvement. |
| Restraint / no invention | 10% | **4** | Two small additions found ("when I woke", "protecting"). |
| Naturalness | 5% | **4** | Natural contemporary prose where rewritten. |

**Weighted score: 3.8** · **Band: Good with fixes**

## Recommendation

**LIGHT EDIT** · confidence **medium-high** · correction scope **local**

The defect is not a quality defect, it is a **coverage** defect with a precise
boundary: four books (2, 9, 14, 19) received names-and-spelling treatment only
while the other twenty were properly modernized. Fixing it means redoing those
four books to the standard already demonstrated in Books 1, 12 and 20 —
bounded, well-specified work with an in-house model to copy. Add to that a
half-dozen local repairs named above.

**Do not retranslate the whole book.** Twenty of twenty-four books are good.

## Limitations of this review

- 8 of 1,027 paragraph-pairs read closely (~3,500 source words of 117,228,
  roughly 3%). "Strong in samples" is not "the whole book is verified."
- Per-chapter similarity was computed across all 24 books, so the *coverage*
  finding (which books are unmodernized) is whole-book evidence; the *quality*
  finding is sample evidence only.
- I did **not** check: modern-da at all (Danish is out of my scope; note that
  `books/scan-report.md` gives odyssey a DA severity of 33 with 24 chapters
  flagged for entity loss); audio alignment; the threads/cast JSON; whether
  Butler's editorial brackets appear elsewhere in the text; onboarding content.
- Rights conclusions about Butler are high-confidence. The Ian Johnston rights
  question is **unresolved**, not resolved-negative.
