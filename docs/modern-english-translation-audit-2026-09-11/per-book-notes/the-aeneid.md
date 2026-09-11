# the-aeneid — The Aeneid (Virgil)

Batch B1 · audit date 2026-09-11 · reviewer: batch agent B1

## Edition snapshot (from Phase 1 `mechanical/the-aeneid.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `4a763d99af704695` | 12 | 544 | 107,470 | Dryden Translation (1697), tr. John Dryden |
| modern-en | `1e9b6dd64911f963` | 12 | 544 | 109,977 | Modern English |
| modern-da | `ed6ef13cbfdd8670` | 12 | 544 | **38,520** | Moderne Dansk |

`en_editions_aligned: true`, no count mismatches, 0 truncated, 0 empty,
0 identical long paragraphs, mean weighted similarity 0.6503.

> **Out-of-scope flag for the orchestrator:** `modern-da` is **38,520 words
> against 107,470** in the source — a 64% shortfall, by far the largest
> source/target ratio gap of any book in this batch. The Danish scan in
> `books/scan-report.md` gives the-aeneid a severity of only 20 and a "book
> ratio" of 1.00, which cannot both be true. Whichever number is wrong, the
> Danish Aeneid needs its own look. Not my scope; flagging it because nobody
> else in this batch will see it.

## Core English text — provenance and completeness

John Dryden's 1697 verse *Aeneid*, complete, 12 books, with Dryden's own prose
argument prefixed to each book (present as paragraph 0 of each chapter). Public
domain worldwide.

**Provenance caveat that matters for every finding below.** Dryden's *Aeneid*
is a free heroic-couplet paraphrase, not a close translation: it expands,
compresses, adds ornament and rhyme-driven filler, and imposes Augustan English
rhetoric on Virgil. Fidelity assessments in this note are fidelity **to
Dryden**, which is the only thing the modern-en could be faithful to. Fidelity
to Virgil is a separate and worse question, and it is a defect inherited from
the choice of core text, not introduced by the modernization.

## Headline finding — this is de-versified Dryden, not modern English

The `modern-en` edition is Dryden's verse **reflowed into prose paragraphs**,
with three mechanical operations applied:

1. Elisions expanded (`forc'd`→`forced`, `heav'n`→`heaven`, `tow'rs`→`towers`,
   `sev'nfold`→`sevenfold`, `thro'`→`through`).
2. Second-person archaisms normalized (`thou/thee/thy`→`you/your`,
   `mak'st`→`are doing`, `dost thou`→`do you`).
3. *Some* inversions un-inverted (`Frantic with fear… she roves the city round`
   → `she roved round the city`).

What is **not** done is the actual work: the diction stays 17th-century
throughout. The weighted similarity of 0.65 is depressed almost entirely by the
line-break removal and the apostrophe expansion, not by rewriting — which is
why the *chapter-level* numbers are so uniform (0.53–0.72 across all twelve
books, no outliers in either direction). Uniformity here is a symptom, not a
reassurance: the same mechanical transform was applied everywhere.

## Phase 1 flags — confirmed / disconfirmed

- **0 truncated paragraphs — CONFIRMED and strongly so.** My own 72%-length
  sweep across all 544 paragraph pairs returned **zero** hits. Word ratios run
  1.02–1.04 in every book — the modern is consistently slightly *longer* than
  the source, which is what de-versification does (elisions restored, ellipses
  filled out).
- **0 identical long paragraphs — CONFIRMED.** Byte-identity is impossible here
  because every paragraph has line breaks removed. This metric carries **no
  information** for a verse→prose edition and should not be read as evidence of
  editorial work. Flag for the methodology note.
- **mean similarity 0.6503 — CONFIRMED numerically, but it badly overstates the
  amount of rewriting.** See sample 3 below: a passage at 0.705 similarity is
  word-for-word Dryden with the line breaks pulled out.
- **last_chapter_suspiciously_short: false — CONFIRMED.** Book 12 is the longest
  chapter (11,174 words) and ends correctly at Turnus' death.
- **No chapter or paragraph count mismatch — CONFIRMED.**

## Samples inspected (8)

### 1. Book 1, para 1 (the invocation) — one of the better passages

> **SRC** "Arms, and the man I sing, who, forc'd by fate, / And haughty Juno's
> unrelenting hate, / Expell'd and exil'd, left the Trojan shore."
>
> **MOD** "I sing of arms and of the man who, forced by fate and by the
> unrelenting hatred of haughty Juno, was expelled and exiled from the Trojan
> shore."

Genuinely handled: the couplet is unpacked into a correct English sentence and
nothing is lost. This is the standard the rest of the edition does not meet.

### 2. Book 1, para 2 (Juno's grievances) — the most-rewritten passage found (0.414)

> **SRC** "Deep graven in her heart the doom remain'd / Of partial Paris, and
> her form disdain'd; / The grace bestow'd on ravish'd Ganymed, / Electra's
> glories, and her injur'd bed."
>
> **MOD** "deep in her heart lay the verdict of partial Paris, her own beauty
> disdained, the grace bestowed on ravished Ganymede, the glories of Electra,
> and her own wronged bed."

Correct and complete (all four grievances survive, in order), but note how
little has actually changed even at the lowest similarity in the book:
"partial Paris", "ravished Ganymede", "grace bestowed" all stand. `doom`→
`verdict` and `form`→`beauty` are the real glosses, and both are good.

### 3. Book 4, para 20 (Mercury's rebuke to Aeneas) — typical of the whole edition

> **SRC** "Then thus, with winged words, the god began, / Resuming his own
> shape: 'Degenerate man, / Thou woman's property, what mak'st thou here, /
> These foreign walls and Tyrian tow'rs to rear, / Forgetful of thy own?…
> If glory cannot move a mind so mean, / Nor future praise from flitting
> pleasure wean, / Regard the fortunes of thy rising heir'"
>
> **MOD** "Then thus, with winged words, the god began, resuming his own shape:
> 'Degenerate man, woman's property, what are you doing here, raising these
> foreign walls and Tyrian towers, forgetful of your own?… If glory cannot move
> a mind so mean, nor future praise wean you from flitting pleasure, regard the
> fortunes of your rising heir'"

Sixteen lines of Dryden; the entire modernization is the thou-forms, one
un-inverted clause, and the apostrophes. **"Then thus, with winged words, the
god began" survives verbatim** into an edition labelled Modern English. So do
"a mind so mean", "flitting pleasure", "regard the fortunes of thy rising
heir", "the Ausonian scepter… is owed by fate".

### 4. Book 4, para 22 (Dido's reproach) — 432 words, 0.696

> **SRC** "Frantic with fear, impatient of the wound, / And impotent of mind,
> she roves the city round. / Less wild the Bacchanalian dames appear, / When,
> from afar, their nightly god they hear, / And howl about the hills, and shake
> the wreathy spear. / At length she finds the dear perfidious man; / Prevents
> his form'd excuse, and thus began"
>
> **MOD** "Frantic with fear, impatient of the wound, and helpless of mind, she
> roved round the city. Less wild appear the Bacchanalian dames, when, from
> afar, they hear their nightly god, and howl about the hills, and shake the
> wreathed spear. At length she found the dear perfidious man; she prevented
> his formed excuse, and thus began"

"impatient of the wound", "the Bacchanalian dames", "their nightly god", "the
wreathed spear", "the dear perfidious man", "**prevented his formed excuse**"
(= *forestalled the excuse he had prepared* — opaque to any modern reader) all
survive. Later in the same speech: "by these my prayers, if prayers may yet
have place", "plighted vows", "his proffered bed", "bereft of honor, and
exposed to shame". Nothing is lost; nothing is clarified either.

### 5. Book 2, paras 3–4 (Sinon's lie) — a better passage

> **SRC** "Accus'd and sentenc'd for pretended crimes, / Because these fatal
> wars he would prevent… Till Calchas was by force and threat'ning wrought"
>
> **MOD** "accused and sentenced for imaginary crimes because he sought to
> prevent these fatal wars… until at last he forced Calchas to speak"

Real work here: `pretended`→`imaginary` (correct — Dryden's "pretended" means
*alleged*, a false friend), and the opaque "Calchas was by force and threat'ning
wrought" is properly unpacked. Also "insatiate Ithacus" → "the insatiable man
of Ithaca" is a sound gloss of a proper-name periphrasis. **This shows the
edition knows how to do the job when it chooses to** — it simply chooses to
about one sentence in twenty.

### 6. Book 6, paras 15–16 (Cerberus; the Mournful Fields)

> **SRC** "The keeper charm'd, the chief without delay / Pass'd on, and took th'
> **irremeable** way."
>
> **MOD** "The keeper charmed, the chief without delay passed on, and took the
> **irremeable** way."

"Irremeable" (= from which there is no return) is a Dryden Latinism that
appears in essentially no other English text, and it is passed through
untouched into "Modern English". Also surviving: "Nor do they lack lots",
"Minos, the strict inquisitor… hears lives and crimes, with his assessors", "he
rolls the blended balls round in his urn", "fools, who, repining at their
wretched state… **suborned** their fate", "a foul incestuous pair", "Caeneus,
once a woman, and once a man, but ending in the sex she first began".

### 7. Book 12, paras 77–80 (the ending — Turnus' death)

> **SRC** "The Latian chiefs have seen me beg my life; / Thine is the conquest,
> thine the royal wife: / Against a yielded man, 'tis mean ignoble strife."
>
> **MOD** "The Latian chiefs have seen me beg for my life; yours is the
> conquest, yours the royal wife. To strive against a yielded man is mean,
> ignoble strife."

> **SRC** "And the disdainful soul came rushing through the wound."
>
> **MOD** "And the disdainful soul came rushing out through the wound."

The famous closing line is preserved (correctly — it is Dryden's best line and
close to Virgil's *vita… fugit indignata sub umbras*). But "a yielded man",
"mean, ignoble strife", "void of breath", "his sworn revenge pursues my death"
are all 1697 English in a 2026 modern edition.

### 8. Cross-check: Dryden's prose arguments (Book 1, para 0)

> **SRC** "Jupiter comforts her, and sends Mercury to **procure** him a kind
> reception among the Carthaginians… Dido, by **device** of Venus, begins to
> have a **passion** for him, and, after some **discourse** with him,
> **desires** the history of his adventures"
>
> **MOD** "Jupiter comforts her, and sends Mercury to **secure** him a kind
> reception among the Carthaginians… Dido, by a **device** of Venus, begins to
> **feel** a passion for him, and, after some **conversation**, **asks to hear**
> the history of his adventures"

The arguments get the lightest touch of all (0.919 similarity) — a handful of
verbs. Note `procure`→`secure` is a slight sense-shift (Dryden's *procure* =
*obtain for him*).

## Assessment against the reading standard

- **Missing substance:** none found. 544/544 paragraphs above the 72% threshold;
  every sampled passage complete.
- **Invention:** none found anywhere. This is the edition's real strength.
- **Old language left essentially unchanged:** yes, pervasively. This is a
  **LIGHT/MECHANICAL** edition by the audit's own category.
- **Images replaced by explanations:** no — the opposite problem; images are
  passed through untranslated.
- **Voice:** ambiguous outcome. Dryden's power is *in the couplet* — the
  rhyme, the caesura, the closing epigram. Stripping the lineation removes the
  form while keeping the diction, so the reader gets Augustan vocabulary in
  prose that no longer scans. It reads as neither verse nor natural prose.

## Phase 3 — human-edition research

The core English text is a translation and a very old one, so this is squarely
in scope. Two serious public-domain candidates, both read.

### Candidate A — J. W. Mackail, *The Aeneid of Virgil* (prose), Macmillan, London, 1885

- **Completeness:** complete, all 12 books.
- **Rights:** **public domain.** Published 1885 (US: pre-1930). Mackail d. 1945,
  so life+70 expired 2016 — PD in the EU/Denmark and the UK as well. Project
  Gutenberg eBook #22456, released 2007, under the Project Gutenberg Licence.
- **URL:** https://www.gutenberg.org/files/22456/22456-h/22456-h.htm
- **Text sample read (Book I opening):** *"I sing of arms and the man who of old
  from the coasts of Troy came, an exile of fate, to Italy and the shore of
  Lavinium; hard driven on land and on the deep by the violence of heaven, for
  cruel Juno's unforgetful anger, and hard bestead in war also, ere he might
  found a city and carry his gods into Latium… Muse, tell me why, for what
  attaint of her deity, or in what vexation, did the Queen of heaven drive one
  so excellent in goodness to circle through so many afflictions"*
- **Assessment:** a close, complete, honest prose rendering — far nearer to
  Virgil than Dryden, and prose rather than couplets. But it is *Victorian*
  prose: "hard bestead in war also, ere he might found a city", "for what
  attaint of her deity" are not modern English either. **Better base text than
  Dryden; not a drop-in accessible edition.**

### Candidate B — Theodore C. Williams, *The Aeneid of Virgil, Translated into English Verse*, Houghton Mifflin, 1908 (Perseus dates its text 1910)

- **Completeness:** complete, all 12 books.
- **Rights:** **public domain worldwide.** Wikisource states: *"This work was
  published before January 1, 1931, and is in the public domain worldwide
  because the author died at least 100 years ago."* (Williams d. 1915.) The
  Perseus digital edition adds a **CC BY-SA 3.0 US** licence over its own markup
  — so use the Wikisource/Gutenberg PD text if share-alike is unwanted.
- **URLs:** https://en.wikisource.org/wiki/The_Aeneid_of_Virgil_(Williams_1908) ·
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0054
- **Text sample read (Book 6, the Cerberus passage — direct counterpart to
  sample 6 above):** *"Here Cerberus, with triple-throated roar, / Made all the
  region ring, as there he lay / At vast length in his cave. The Sibyl then, /
  Seeing the serpents writhe around his neck, / Threw down a loaf with honeyed
  herbs imbued / And drowsy essences: he, ravenous, / Gaped wide his three
  fierce mouths and snatched the bait"*
- **Assessment:** blank verse, much closer to Virgil than Dryden, notably
  clearer than Dryden — but still period diction ("with honeyed herbs imbued").

### Rejected / not pursued

- Fagles, Fitzgerald, Mandelbaum, Ruden, Bartsch, Heaney (Bk VI): **fully in
  copyright**, commercial licence required. Out of scope.
- Charles J. Billson (1906, verse) and Gutenberg #18466 (Christopher Pearse
  Cranch, 1872, blank verse): PD, not read in this audit — **unverified**.

### Conclusion

No public-domain human *Aeneid* meets a modern reading standard on its own.
But **both Mackail and Williams are materially better base texts than Dryden**
— closer to Virgil, less paraphrastic, and less archaic — and both are
rights-clear in the US and the EU/Denmark. The right fix is not to swap Dryden
for one of them and stop; it is to rebase the modern edition on one of them.

## Ratings

| Dimension | Weight | Score | Reason |
|---|---|---|---|
| Fidelity / completeness | 40% | **4** | Nothing omitted (0/544 below the length threshold), nothing invented, all of Dryden's content and ordering preserved. Held to 4 rather than 5 only because fidelity here is fidelity to a free 1697 paraphrase, which is itself several steps from Virgil. |
| First-read clarity | 25% | **2** | De-versified but not de-archaized. *Irremeable, suborned, prevented his formed excuse, impatient of the wound, void of breath, mean ignoble strife, Bacchanalian dames, the wreathy/wreathed spear* all survive into "Modern English". |
| Literary voice | 20% | **3** | Dryden's rhetorical energy largely survives, but removing the couplet form while keeping the couplet diction produces a hybrid that works as neither. |
| Restraint / no invention | 10% | **5** | No invention found in any sample; no added transitions, motives or glosses. |
| Naturalness | 5% | **2** | Reads as neither verse nor natural contemporary prose. |

**Weighted score: 3.3** · **Band: Mixed**

## Recommendation

**RETRANSLATE** · confidence **medium-high** · correction scope **substantial**

The defect is uniform across all twelve books, so it is not local and a light
edit cannot reach it. But the more important point is that the *base text* is
wrong for the purpose: producing a modern English Aeneid by paraphrasing
Dryden means paraphrasing a paraphrase, and Virgil is two removes away before
the work starts.

Recommended sequence:
1. **Rebase** the English core on **J. W. Mackail's 1885 prose** (PD worldwide,
   complete, Gutenberg #22456) for a prose-reading product, or **Theodore C.
   Williams' 1908 blank verse** (PD worldwide, complete, Wikisource) if verse
   form matters for the Aeneid the way it does for Paradise Lost.
2. Produce a genuine modern-English edition from that base.
3. Keep **Dryden as a third edition** — labelled as what it is, a great English
   poem in its own right. Dryden's *Aeneid* is worth having on Tinct; it is
   just not a suitable base for "Modern English", and it is not suitable as the
   only way in.
4. Alignment work will be required — Mackail and Williams do not share Dryden's
   544-paragraph structure. Per the brief, this is scoped work, **not** a
   quality strike against either candidate.

Separately and urgently: **the Danish edition's 64% word shortfall** (see the
snapshot table) needs its own investigation.

## Limitations of this review

- 8 passages read closely (~2,400 source words of 107,470, ~2%). Books 3, 5,
  7, 8, 9, 10, 11 were measured but not read at passage level.
- The *mechanical-edition* finding rests on whole-book computation (uniform
  0.53–0.72 similarity, uniform 1.02–1.04 word ratio, 0/544 length outliers),
  so the "this is de-versified Dryden" conclusion is not sampling-dependent.
- I did **not** compare any passage against the Latin. Every fidelity statement
  in this note is fidelity to Dryden.
- I did **not** review modern-da beyond noting the word-count anomaly; did not
  check audio, threads/cast JSON, or onboarding content.
- Mackail and Williams rights findings are high-confidence (PD statements read
  directly at Gutenberg and Wikisource). Billson and Cranch are **unverified**.
  I read one sample passage from each of Mackail and Williams, not whole books
  — "readable in the sample I read" is not "verified readable throughout".
