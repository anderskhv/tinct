# cymbeline — Cymbeline (William Shakespeare)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (Shakespeare batch B5)

## Edition snapshot (from Phase 1 `mechanical/cymbeline.json`)

| edition | label | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|---|
| original-en | Shakespeare (1623) | `5f25167f50db13c8` | 29 | 1133 | 28,441 |
| modern-en | Modern English | `9fbacf6307e227a6` | 29 | 1133 | 29,610 |
| modern-da | Moderne Dansk | `0ed7dbb0a97f3921` | 29 | 1133 | 30,097 |

`en_editions_aligned: true`. Mean weighted similarity 0.645,
`pct_identical_long_paragraphs` 0.2%, zero truncations, zero empty paragraphs,
zero paragraph-count mismatches, last chapter not flagged (4,298 words).

## Provenance / completeness of the core English text

- English original; no translator. Registry label **"Shakespeare (1623)"**.
- Same **provenance labelling issue** as the rest of the set. Note also that
  `cymbeline-original-en.json` uses a *different* source-text style from
  `richard-iii` and `coriolanus`: it preserves metrical elisions
  (`banish'd`, `purpos'd`, `receiv'd`, `mov'd`) where the other two spell out
  (`banished`, `purposed`). So the three plays were not all parsed from the same
  Gutenberg text family. Harmless for reading, but worth knowing if anyone
  normalises the set later.
- **Completeness: confirmed complete.** 29 scenes = 7+5+8+4+5, the Folio-based
  division (with 1.7 and 3.8 present, as in Folio-following editions rather than
  the 6+5+7+4+5 modern conflation). All chapter titles are real Act/Scene +
  location labels (`Act 1, Scene 1 — Britain. The garden of Cymbeline's palace`
  … `Act 5, Scene 5 — Britain. Cymbeline's tent`). No apparatus debris. I read
  5.5 through the full recognition sequence; it is whole.

## Per-scene similarity — the key structural finding

My own per-paragraph recomputation (long paragraphs only) by act:

| scene | sim | | scene | sim |
|---|---|---|---|---|
| 1.1 | 0.141 | | 3.6 | 0.213 |
| 1.4 | 0.168 | | 4.1 | 0.039 |
| 2.2 | 0.081 | | 4.2 | 0.497 |
| 2.5 | 0.053 | | 5.1 | 0.127 |
| 3.3 | 0.239 | | 5.2 | 0.420 |
| 3.4 | 0.362 | | **5.3** | **0.677** |
| | | | **5.4** | **0.681** |
| | | | **5.5** | **0.652** |

Acts 1–4 average roughly 0.30. **Scenes 5.3, 5.4 and 5.5 — 6,692 source words,
23.5% of the play — sit at 0.65–0.68**, three to four times closer to the source
than the rest of the book. This is a real, localisable drift, and it is the
central finding for this title: the modernisation gets noticeably lighter exactly
where a romance plot does its untangling. (Richard III and Coriolanus show no
such act-level drift; I checked.)

## Samples inspected (11 locations, ~3,400 source words)

### 1. Act 1, Scene 1, paras 1–14 — the expository opening (STRONG, but one CONFIRMED OMISSION)

Source (para 5): `FIRST GENTLEMAN. He that hath lost her too. So is the Queen,
That most desir'd the match. But not a courtier, Although they wear their faces
to the bent Of the King's looks, hath a heart that is not Glad at the thing they
scowl at.`
Modern (para 5): `FIRST GENTLEMAN. The Queen too — she most wanted the match. And
the courtiers, although they wear their faces to match the King's looks, have
hearts that are secretly glad about the very thing they scowl at.`

**Finding — confirmed substantive omission.** The Second Gentleman has just
asked "None but the King?" The source answers with *two* names: Cloten
(`He that hath lost her too`) **and** the Queen. The modern drops Cloten's
clause entirely, so the answer to a direct question loses half its content, and
the reader never learns in this exchange that the rejected suitor is also
grieving. 46 → 37 words. This is the only outright omission I found in the play,
but it is an omission, not a compression: one clause of substance, gone.

Also in this scene:
- Para 9: `I do extend him, sir, within himself; Crush him together rather than
  unfold His measure duly.` → `I describe him only within his own measure, sir.
  If anything I understate rather than overstate him.` — image (crushing
  together vs unfolding) replaced by a flat explanation. Mild.
- Para 13: `His only child.` → `His only child now.` — "now" is added. Correct
  in fact (the sons were stolen) but it is a supplied inference, and it slightly
  pre-empts the reveal the next line makes.
- Para 11 (219 → 219 words) — Posthumus's whole genealogy is carried faithfully:
  Sicilius, Cassibelan, Tenantius, the *Leonatus* surname, two brothers dead in
  the wars, the father dying of grief, the mother dying in childbirth, the King's
  wardship. Plot spine intact.

### 2. Act 1, Scene 5, paras 36–52 — the wager (STRONG; plot logic exact)

Source: `IACHIMO. … I will lay you ten thousand ducats to your ring that, commend
me to the court where your lady is, with no more advantage than the opportunity
of a second conference, and I will bring from thence that honour of hers which
you imagine so reserv'd.`
Modern: `IACHIMO. … I'll bet you ten thousand ducats against your ring that, if
you give me a letter of introduction to the court where your lady is, with no
advantage beyond the opportunity for a second meeting, I'll bring back from there
that honor of hers you think so well guarded.`

Finding: the terms of the wager — the two-sided stake, the "provided I have your
commendation" clause, and the fallback duel condition in para 50 — are all
delivered precisely and in the right order. This is the plot device the whole
play hangs on and it is not garbled. `commend me to the court` → `give me a
letter of introduction` is an accurate gloss (mildly interpretive; the source is
vaguer). `You are a friend, and therein the wiser` → `You're prudent, and that's
wise of you` silently takes a side on a disputed reading (F "friend" vs. emended
"afraid"); defensible.

### 3. Act 2, Scene 2, paras 5–15 — Iachimo in the bedchamber (STRONG)

Source: `IACHIMO. … On her left breast A mole cinque-spotted, like the crimson
drops I' th' bottom of a cowslip. Here's a voucher Stronger than ever law could
make … She hath been reading late The tale of Tereus; here the leaf's turn'd down
Where Philomel gave up.`
Modern: `IACHIMO. … On her left breast — a mole with five spots, like the crimson
drops at the bottom of a cowslip. Here's a proof stronger than any law could make
… She has been reading late — the tale of Tereus; here the page is folded down
where Philomel gave up.`

Finding: every element of the forged evidence chain survives — the Tarquin
allusion, the chamber inventory (pictures, window, tapestry and its story), the
bracelet, the mole, the Philomel book. Similarity 0.081 for this scene, i.e.
heavily and successfully rewritten. Exemplary.

### 4. Act 2, Scene 4, paras 40–58 — the proof scene (STRONG, one archaic clause left)

Source: `POSTHUMUS. … Her attendants are All sworn and honourable:—they induc'd to
steal it! And by a stranger!`
Modern: `POSTHUMUS. … Her attendants are all sworn and honorable. — They induced
to steal it! And by a stranger!`

Finding — **light-touch miss.** The source's elliptical `they induc'd to steal
it!` (= "*they*, induced to steal it?! — and by a stranger?!") is left exactly as
is. Modern readers will parse "They induced to steal it" as a transitive verb
missing an object. One sentence; easy fix.

Otherwise the scene is correct and complete, and — importantly — the modern does
**not** "fix" Shakespeare's own inconsistency between `On her left breast` (2.2)
and `under her breast` (2.4). Correct restraint.

### 5. Act 2, Scene 5, para 1 — Posthumus's misogyny soliloquy (STRONG)

Source: `POSTHUMUS. Is there no way for men to be, but women Must be
half-workers? … Be it lying, note it, The woman's; flattering, hers; deceiving,
hers; Lust and rank thoughts, hers, hers; revenges, hers; Ambitions, covetings,
change of prides, disdain, Nice longing, slanders, mutability, All faults that
man may name, nay, that hell knows, Why, hers, in part or all; but rather all`
Modern: `POSTHUMUS. Is there no way for men to come into being but that women
must be half the work? … Be it lying — note it — the woman's; flattering, hers;
deceiving, hers; lust and rank thoughts, hers, hers; revenges, hers; ambitions,
covetings, changing prides, disdain, nice longings, slanders, mutability — all
faults that man can name, no, that hell knows — why, hers, in part or all; but
rather all`

Finding: 284 → 303 words with the entire catalogue intact, including the
repetition `hers, hers` and the ugly boar image. Similarity 0.053 — the
single most-rewritten long paragraph in the play, and among the best work in it.

### 6. Act 3, Scene 3, paras 1–8 — Belarius's cave (STRONG, one INVERTED RELATION)

Source: `BELARIUS. … prouder than rustling in unpaid-for silk: Such gain the cap
of him that makes him fine, Yet keeps his book uncross'd. No life to ours!`
Modern: `BELARIUS. … prouder than rustling in unpaid-for silk. Such gain bows to
the man who outfits him, yet keeps his account open. No life like ours!`

**Finding — confirmed altered logical relation.** In the source the silk-wearer
*receives* the cap (the doffed-hat salute) of the tailor who dressed him and
whose bill is still unpaid: the courtier is bowed *to*. The modern reverses the
direction — "Such gain bows to the man who outfits him" — so the satire points
the wrong way. Local, one sentence.

Also: `the sharded beetle` → `the lowly beetle` replaces a specific image
(scaly-winged dung beetle) with a generic adjective. Mild.

The rest of the scene (Belarius's court-vs-cave argument, Guiderius's and
Arviragus's complaints, the tree-stripped-in-one-night image) is complete and
well handled.

### 7. Act 3, Scene 4, paras 24–38 — Imogen becomes "Fidele" (STRONG; plot logic exact)

Source: `PISANIO. … You must forget to be a woman; change Command into obedience;
fear and niceness … into a waggish courage … First, make yourself but like one.
Fore-thinking this, I have already fit ('Tis in my cloak-bag) doublet, hat, hose,
all That answer to them.`
Modern: `PISANIO. … You must forget to be a woman; change command into obedience;
fear and fastidiousness … into a roguish courage … First, just make yourself like
one. Foreseeing this, I have already ready (it is in my cloak-bag) doublet, hat,
hose, all that matches them.`

Finding: the whole disguise mechanism is delivered in the right sequence — the
fake death report and bloody token, the Lucius timing at Milford Haven, the
boy's clothes in the cloak-bag, the service pitch, and the Queen's drug box
(which pays off in 4.2 and 5.5). Nothing garbled. Small nit: `I have already
ready` is clumsy English for `I have already fit`.

### 8. Act 4, Scene 2, paras 108–122 — Belarius on Cloten's burial + the dirge (STRONG, one presentation loss)

Source: `GUIDERIUS. _    Fear no more the heat o' th' sun, Nor the furious
winter's rages; Thou thy worldly task hast done, Home art gone, and ta'en thy
wages. Golden lads and girls all must, As chimney-sweepers, come to dust._`
Modern: `GUIDERIUS. Fear no more the heat of the sun, nor the furious winter's
rages; your worldly task is done, home you've gone, and taken your wages. Golden
lads and girls all must, as chimney-sweepers, come to dust.`

Finding: the dirge is complete and keeps its rhymes and its plainness. **One
presentation regression:** the source marks the song with Gutenberg italic
delimiters (`_ … _`); the modern strips them, so the song is typographically
indistinguishable from surrounding dialogue except for the bare `SONG` line. Not
a meaning loss, but the *original* edition renders the song as set-apart verse
and the modern does not — an inconsistency between the two panes in split view.

### 9. Act 4, Scene 2, paras 133–157 — Imogen wakes beside the headless body (STRONG, one garbled clause)

Source: `IMOGEN. … A headless man? The garments of Posthumus? I know the shape
of's leg; this is his hand, His foot Mercurial, his Martial thigh, The brawns of
Hercules; but his Jovial face— Murder in heaven! … O! Give colour to my pale
cheek with thy blood, That we the horrider may seem to those Which chance to find
us.`
Modern: `IMOGEN. … A headless man? The garments of Posthumus? I know the shape of
his leg; this is his hand, his Mercurial foot, his Martial thigh, the brawn of
Hercules; but his Jove-like face — Murder in heaven! … O! Give color to my pale
cheek with your blood, so that we, the more horrible, may seem to those who
chance to find us.`

Findings:
- The 312-word recognition-by-body-parts and the misattribution to Pisanio and
  Cloten — the hinge of the whole mistaken-identity strand — are carried
  completely and in the right order. The drug/Queen's-box inference is kept.
- **Confirmed clarity defect:** `That we the horrider may seem` → `so that we,
  the more horrible, may seem` reads as an appositive and leaves the sentence
  without a complement — the source means "so that we may seem the more
  horrid." One clause.
- `'tis pregnant, pregnant!` → `it is clear, clear!` — accurate, slightly flat.
- Para 157: `Come, arm him.` → `Come, take up his arms.` — **small
  mistranslation.** "Arm him" = take him up in your arms / bear him. The modern
  turns it into weapons, which contradicts the stage business (they are carrying
  a corpse to burial).
- The "Fidele" / "Richard du Champ" naming sequence with Lucius is exact, and
  Lucius's `Thy name well fits thy faith` wordplay survives.

### 10. Act 5, Scene 4, paras 4–14 — the prison and the apparition (LIGHT/MECHANICAL — the core defect)

Source: `SICILIUS. Great Nature like his ancestry Moulded the stuff so fair That
he deserv'd the praise o' th' world As great Sicilius' heir.`
Modern: `SICILIUS. Great Nature, like his ancestry, molded the stuff so fair that
he deserved the praise of the world as great Sicilius' heir.`

Source: `FIRST BROTHER. When once he was mature for man, In Britain where was he
That could stand up his parallel, Or fruitful object be In eye of Imogen, that
best Could deem his dignity?`
Modern: `FIRST BROTHER. When once he was mature for man, in Britain where was he
that could stand up his parallel, or fruitful object be in the eye of Imogen, who
best could deem his dignity?`

Source: `SECOND BROTHER. For this from stiller seats we came, Our parents and us
twain, That, striking in our country's cause, Fell bravely and were slain`
Modern: `SECOND BROTHER. For this from quieter seats we came, our parents and us
two, that, striking in our country's cause, fell bravely and were slain`

**Finding — the clearest recurring defect in this book.** Across the apparition
sequence the "modernisation" is essentially *orthographic only*: `thou`→`you`,
`-'d`→`-ed`, `moulded`→`molded`, `stiller`→`quieter`, `geck`→`dupe`. Inverted
verse syntax is left untouched — `in Britain where was he that could stand up his
parallel, or fruitful object be in the eye of Imogen` is not modern English by
any reading, and the ballad-metre word order is exactly what a modern reader
needs help with. Posthumus's 225-word prison soliloquy (para 4, the debtor/coin
conceit) is likewise only lightly retouched: `take no stricter render from me
than my all`, `they do not weigh every stamp; though light, they take pieces for
the figure's sake` are left as-is.

This is a *systematic* light touch across a defined region (5.3–5.5, 23.5% of
the play), not a scattering of local misses.

### 11. Act 5, Scene 5, paras 60–136 — Iachimo's confession and the recognitions (LIGHT/MECHANICAL + plot logic OK)

Source (para 63, 235 words): `IACHIMO. … whereat I, wretch, Made scruple of his
praise, and wager'd with him Pieces of gold 'gainst this which then he wore Upon
his honour'd finger … and would so, had it been a carbuncle Of Phoebus' wheel;
and might so safely, had it Been all the worth of's car. … averring notes Of
chamber-hanging, pictures, this her bracelet … I having ta'en the forfeit.`
Modern: `IACHIMO. … whereat I, wretch, made a scruple of his praise, and wagered
with him pieces of gold against this ring which he then wore upon his honored
finger … and would so, had it been a carbuncle of Phoebus' wheel; and might so
safely, had it been all the worth of his chariot. … averring marks of
chamber-hangings, pictures, this her bracelet … I having taken the forfeit.`

Finding: this is the speech in which the audience is *told how the plot worked*,
and it is one of the hardest in the play — and it receives almost no help.
`made a scruple of his praise`, `a carbuncle of Phoebus' wheel`, `averring marks
of chamber-hangings`, `I having taken the forfeit` are all still opaque.
Similarity 0.48 on a 235-word paragraph.

Same pattern through the recognitions:
- Para 127: `It was wise nature's end in the donation, To be his evidence now.` →
  `It was wise nature's purpose in granting it, to be his evidence now.`
- Para 134: `This fierce abridgement Hath to it circumstantial branches, which
  Distinction should be rich in.` → `This fierce abridgment has circumstantial
  branches to it, which distinction should be rich in.` — unchanged and
  unparseable. `the counterchange Is severally in all` → `the exchange of looks
  is severally in all` — "severally" left standing.

**Plot logic itself is preserved correctly**, which matters for a romance: the
wager, the mole/bracelet evidence, Belarius's confession, Euriphile the nurse,
the mantle, Guiderius's neck mole, Imogen's "two worlds", the Queen's drug — all
present, all in order, all consistent with the earlier acts. The failure here is
*clarity*, not fidelity.

## Phase 1 flags: confirmed vs disconfirmed

| Phase 1 signal | Verdict |
|---|---|
| `truncated_paragraphs_total: 0` | **Confirmed** by independent scan (0 hits at ≥40 source words, ratio < 0.62). The 1.1 p5 omission is a *clause*, below the truncation threshold — this is exactly the class of defect the mechanical screen cannot see. |
| `empty_paragraphs_total: 0` | **Confirmed.** |
| `para_count_mismatch_total: 0`, `chapter_count_mismatch: false` | **Confirmed.** Alignment exact in all 11 scenes opened. |
| `last_chapter_suspiciously_short: false` (4,298 w) | **Confirmed** — 5.5 is a genuine 163-paragraph finale and is complete. |
| `pct_identical_long_paragraphs: 0.2%` | **Confirmed numerically but MISLEADING.** Only 0.2% of long paragraphs are byte-identical, yet 5.4 p6 sits at 0.997 and a whole 6,700-word region sits at 0.65–0.68. The "identical paragraph" test misses light-touch modernisation that changes `thou`→`you` and nothing else. |
| `mean_weighted_similarity: 0.645` | **Confirmed as a warning sign here**, unlike the other two plays. My long-paragraph recomputation shows the Acts 1–4 / Act 5 split described above; the single mean number hides it. **Recommend the Phase 1 tool emit per-chapter similarity** — the act-level drift is invisible without it. |
| *(No flag existed for act-level modernisation drift, or for the 1.1 clause omission.)* | New Phase 2 findings. |

## Phase 3 — human-edition research

**Step 1: does the original already meet the reading standard?** No, and less so
than for the other two plays in this batch. Late-Shakespeare syntax at its most
compressed, plus a plot with four intertwined strands (the wager, the disguise,
the lost princes, the Roman invasion) that a reader can lose track of if the
language stalls them. A modern companion is clearly warranted.

**Step 2: candidate human modern-English editions.**

| Candidate | What it is | Complete? | Rights | Verdict |
|---|---|---|---|---|
| **Standard Ebooks — Cymbeline** (Clark & Wright *Victoria* 1887, from the Globe text) — https://standardebooks.org/ebooks/william-shakespeare/cymbeline | **Original language**; modernised spelling/punctuation only. | Complete | Standard Ebooks' own contributions **CC0 1.0**; underlying Clark/Wright text PD in the US and in DK/EU (Wright d. 1914 → PD since 1985). | **Rights-clear but not a modern-en substitute.** Candidate for a cleaner *source* text only. |
| **Play On Shakespeare / ACMRS Press — *Cymbeline*, modern verse translation by Andrea Thome** — https://acmrspress.com/series/play-on-shakespeare/ | Complete professional modern-English verse translation (Oregon Shakespeare Festival Play On! commission). Editorially the strongest human candidate for this title. | Complete | **Permission required.** ACMRS Press, distributed by University of Chicago Press; "© 2026 ACMRS Press. All Rights Reserved." Some series volumes link to an ASU Pressbooks open-access reading edition; **no CC licence confirmed for this title.** | **Rejected on rights grounds.** Open-access status of this volume: **unverified**. |
| **Folger Shakespeare digital texts** — https://www.folger.edu/copyright-policy/ | Modern-spelling scholarly edition with glosses; not a translation. | Complete | **CC BY-NC 3.0 Unported**: *"You may not use the material from Folger Digital Texts for commercial purposes."* | **Rejected** — noncommercial. |
| **Internet Shakespeare Editions (UVic) — Cymbeline (Modern), ed. Jennifer Forsyth** — https://internetshakespeare.uvic.ca/doc/Cym_M/index.html | Modern-**spelling** scholarly edition, not a translation. | Complete | Copyright Jennifer Forsyth; "may be freely used for educational, non-profit purposes; for all other uses, contact the Editor." | **Rejected** — noncommercial, and not a modern-English rendering. |
| **Lamb, *Tales from Shakespeare* (1807) — "Cymbeline"** — https://www.gutenberg.org/ebooks/573 | **The one PD human prose rendering of this specific play.** Clear, readable early-19th-c prose. | **Abridged.** A ~10-page children's retelling: no dialogue as such, Cloten's death and much of Act 5 compressed, the Roman war reduced to a sentence or two. | Public domain worldwide (Charles Lamb d. 1834, Mary Lamb d. 1847). | **Rejected as a reading edition** — it is a summary, not a text; using it as "modern-en" would violate the completeness requirement outright. Possibly useful as *onboarding* / plot-orientation content for this notoriously tangled plot, which is a separate product question. |

**Conclusion:** *no complete, readable, rights-clear human modern-English edition
of Cymbeline was found in this search* — "none found in this search", not "none
exists". Lamb is rights-clear but abridged; Play On is complete but copyrighted;
everything else freely licensed is the original language with modern spelling.

**Jurisdiction note:** the underlying play is PD in DK/EU and the US. Lamb is PD
in both. The Folger CC BY-NC and ISE non-profit terms bar commercial use
everywhere Tinct sells; the Play On volumes are under live commercial copyright
in both jurisdictions. No unresolved jurisdictional question.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | **4** |
| first-read clarity | 25% | **3** |
| literary voice | 20% | **4** |
| restraint / no invention | 10% | **4** |
| naturalness | 5% | **4** |

**Weighted score: 3.8** — band **Good with fixes**.

Justification: fidelity 4 (not 5) because of one **confirmed substantive
omission** (1.1 p5, Cloten's grief) and one **inverted logical relation** (3.3
p4) — this rules out an unqualified KEEP. Clarity is the real problem and takes
the 3: a defined 23.5% of the play (5.3–5.5) receives only orthographic
modernisation, plus four individual garbled or untouched clauses elsewhere
(2.4 p46, 4.2 p137, 4.2 p157, 5.5 p134). Restraint 4 for a handful of supplied
inferences (`His only child now`, `a letter of introduction`, `worth pressing
one's lips to`). Voice 4 — Acts 1–4 are genuinely good (2.5 and 2.2 are
excellent), so the average holds up.

## Recommendation

**LIGHT EDIT** · confidence **medium** · correction scope **substantial**.

I am deliberately *not* recommending RETRANSLATE. The defect is recurring but it
is **regional, not diffuse**: Acts 1–4 (76% of the play) are complete,
well-voiced and genuinely modernised, and the plot chain — wager, evidence,
disguise, false death, recognitions — tracks correctly end to end. What is needed
is a second pass over a bounded region plus a short list of line fixes. Scope it
honestly as substantial, because that region is ~6,700 words.

Scoped fix list:
1. **Re-modernise 5.3, 5.4 and 5.5 to the same depth as Acts 1–4.** Priority
   order: 5.5 p63 (Iachimo's confession — the plot explanation), 5.4 pp4–14
   (Posthumus's soliloquy and the apparition ballad), 5.5 p134 (Cymbeline's
   "fierce abridgement"), 5.4 p6 (sim 0.997), 5.3.
2. **1.1 p5 — restore the omitted clause.** "He that hath lost her too" must come
   back: "So is the man who lost her. So is the Queen, who most wanted the
   match…"
3. 3.3 p4 — reverse the inverted relation: "Such men get the doffed cap of the
   tailor who dresses them, and leaves the bill unpaid."
4. 4.2 p137 — "so that we may seem the more horrid to whoever chances to find us."
5. 4.2 p157 — `Come, take up his arms` → `Come, lift him.`
6. 2.4 p46 — unpack `They induced to steal it!`
7. Restore the song delimiters in 4.2 pp117–124 so the dirge reads as verse in
   the modern pane as it does in the source pane.
8. 3.4 p34 — `I have already ready` → `I have already prepared`.

Do **not** replace with a human edition: Lamb is abridged, Play On needs a
licence, everything else is noncommercial or not a translation.

## Limitations of this review

- I inspected **11 locations across all five acts** (1.1, 1.5, 2.2, 2.4, 2.5,
  3.3, 3.4, 4.2 ×3, 5.4, 5.5 ×2), roughly 3,400 source words of 28,441 — about
  **12% of the play**. Strong in samples ≠ whole book verified.
- The Act 5 light-touch finding is based on **two scenes read line by line (5.4,
  5.5) plus the per-scene similarity profile for 5.3**; I did not read 5.3
  (0.677, 864 words) line by line. I am confident in the pattern, less so in its
  exact boundaries.
- I did **not** read 1.2, 1.3, 1.4, 1.6, 1.7 (Iachimo's first assault on
  Imogen), 2.1, 2.3, 3.1, 3.2, 3.5–3.8, 4.1, 4.3, 4.4, 5.1 or 5.2 line by line.
- The 1.1 p5 omission is the only one I found; I did **not** run a systematic
  clause-level completeness check across the book, and the mechanical screen
  cannot detect defects at that size. There may be others.
- I did **not** audit `modern-da`, audio, `cymbeline-threads.json`, or
  onboarding JSON.
- Verse lineation is flattened to prose in **both** English editions —
  pre-existing across the Shakespeare set, not scored here.
- Rights research reflects publicly stated licences as of 2026-09-11; not legal
  advice. The open-access status of the individual Play On volumes on ASU
  Pressbooks is **unverified**, not resolved.
