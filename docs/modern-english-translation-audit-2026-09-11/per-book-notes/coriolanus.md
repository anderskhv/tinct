# coriolanus — Coriolanus (William Shakespeare)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (Shakespeare batch B5)

## Edition snapshot (from Phase 1 `mechanical/coriolanus.json`)

| edition | label | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|---|
| original-en | Shakespeare (1623) | `d0381f3053901dbb` | 29 | 1379 | 28,925 |
| modern-en | Modern English | `cb7175962445184e` | 29 | 1379 | 29,795 |
| modern-da | Moderne Dansk | `187cf22c3daab3d6` | 29 | 1379 | 30,556 |

`en_editions_aligned: true`. Mean weighted similarity 0.6788,
`pct_identical_long_paragraphs` 0.4%, zero truncations, zero empty paragraphs,
zero paragraph-count mismatches, last chapter not flagged (1,435 words).

## Provenance / completeness of the core English text

- English original; no translator. Registry label **"Shakespeare (1623)"**.
- Same **provenance labelling issue** as the rest of the Shakespeare set: this is
  not the 1623 Folio text (F1 reads *"Enter a Company of Mutinous Citizens, with
  Staues, Clubs, and other weapons"*); it is a modern-spelling editorial text
  with Project Gutenberg conventions. "1623" is the play's first-publication
  year, not the edition in the file. Minor, non-blocking.
- **Completeness: confirmed complete.** 29 scenes = 10+3+3+7+6, which is the
  standard Folio-based division for this play (Act 1 runs to 1.10). All chapter
  titles are real Act/Scene + location labels (`Act 1, Scene 1 — Rome. A street`
  … `Act 5, Scene 6 — Antium. A public place`). No editorial-apparatus debris.
  I read 5.6 through to Aufidius's last line; the ending is whole.

## Per-scene similarity (my own recomputation, long paragraphs only)

Range 0.166 (1.10) to 0.976 (5.5, a 42-word scene). Mean ≈0.46. The three
scenes richest in political argument — 3.1 (0.496), 3.3 (0.527), 5.3 (0.506) —
sit mid-range, i.e. they were genuinely reworked rather than skimmed. **No
act-level light-touch drift**: Act 5's long scenes (5.3 0.506, 5.6 0.557) are as
worked-over as Act 1's. Contrast Cymbeline, which does drift.

## Samples inspected (10 locations, ~3,100 source words)

### 1. Act 1, Scene 1, paras 0–14 — the mutinous citizens (STRONG; register)

Source: `FIRST CITIZEN. We are accounted poor citizens, the patricians good. What
authority surfeits on would relieve us. … Let us revenge this with our pikes ere
we become rakes; for the gods know I speak this in hunger for bread, not in
thirst for revenge.`
Modern: `FIRST CITIZEN. We're counted as poor citizens, the patricians as good.
What the authorities gorge themselves on would relieve us. … Let's avenge this
with our pikes before we waste away to rakes; for the gods know I say this
hungry for bread, not thirsty for revenge.`

Finding: excellent. The plebeian register is carried by contraction and plain
diction (`We're`, `Let's`, `He's an absolute dog to the common people`,
`Hold on, who's coming here?`, `You're taking forever about it`). The
pike/rake pun is kept as an image with a minimal gloss ("waste away to rakes")
rather than being explained away. 95 → 94 words.

### 2. Act 1, Scene 1, paras 21–45 — Menenius and the belly fable (STRONG; register contrast)

Source: `MENENIUS. Either you must confess yourselves wondrous malicious Or be
accused of folly. I shall tell you A pretty tale. … since it serves my purpose,
I will venture To stale't a little more.`
Modern: `MENENIUS. Either you must confess yourselves astonishingly malicious,
or be accused of stupidity. I'll tell you a pretty tale. … since it serves my
purpose, I'll venture to wear it out a little more.`

Finding: the patrician register is audibly different from the citizens' —
`astonishingly malicious`, `incorporate friends`, `the storehouse and the shop
of the whole body` — so the class contrast the play is built on survives.
The full fable is present: the members' accusation, the belly's smile, the
rivers of blood, the flour and the bran. `muniments` → `defences` is a defensible
gloss.

### 3. Act 1, Scene 1, paras 49–59 — Martius's contempt (STRONG, two small image losses)

Source: `MARTIUS. … Would the nobility lay aside their ruth And let me use my
sword, I'd make a quarry With thousands of these quartered slaves as high As I
could pick my lance.`
Modern: `MARTIUS. … If the nobility would lay aside their pity and let me use my
sword, I'd make a heap with thousands of these butchered slaves as high as I
could pile my lance.`

Findings:
- The 188-word tirade is complete: lions/hares, foxes/geese, coal on ice,
  hailstone in the sun, sick man's appetite, fins of lead, oaks with rushes,
  crows pecking eagles. Nothing summarised.
- **Image loss:** `quarry` (a heap of slain game) → `heap` loses the hunting
  frame, and with it the `quarry`/`quartered` chime.
- **Small error:** `as high As I could pick my lance` → `as high as I could pile
  my lance`. "Pick" here = pitch/throw; "pile my lance" is not English. Local.

### 4. Act 2, Scene 3, paras 0–14 — plebeians before the election (STRONG)

Source: `THIRD CITIZEN. We have power in ourselves to do it, but it is a power
that we have no power to do; … Ingratitude is monstrous, and for the multitude to
be ingrateful were to make a monster of the multitude, of the which we being
members, should bring ourselves to be monstrous members.`
Modern: `THIRD CITIZEN. We have the power in ourselves to do it, but it's a
power we have no right to use. … Ingratitude is monstrous, and for the multitude
to be ungrateful would make a monster of the multitude — and since we are
members of it, we'd make ourselves into monstrous members.`

Finding: the many-headed-multitude joke and the compass joke survive intact
(`the only direction they'd all agree on at once would be every point of the
compass`). Good.

### 5. Act 2, Scene 3, paras 84–92 — "your voices" (RECURRING TERMINOLOGY DEFECT)

Source: `THIRD CITIZEN. … "I would be consul," says he; "aged custom, But by your
voices, will not so permit me; Your voices therefore." When we granted that, Here
was "I thank you for your voices. Thank you. Your most sweet voices! Now you have
left your voices, I have no further with you."`
Modern: `THIRD CITIZEN. … "I would be consul," says he; "ancient custom won't
permit me without your votes; your votes therefore." When we granted that, here
was "I thank you for your votes. Thank you. Your most sweet votes! Now that you
have given your votes, I have nothing further to do with you."`

Finding — **the most consequential defect in this book, and it is recurring
rather than local.** *Voice* is Coriolanus's keyword: it means both the physical
utterance of a mouth Coriolanus despises and the vote that mouth casts, and the
play rubs the two senses together for whole scenes. Rendering it flatly as
`votes` throughout kills the pun and produces `Your most sweet votes!`, which is
simply odd English where `Your most sweet voices!` is contemptuous and exact.

The substitution is also **internally inconsistent**:
- 2.3 p91: `I'll have five hundred voices of that sound` → `five hundred votes
  of that opinion` — the `voices/sound` pairing goes too.
- 2.3 p89: `Bestow your sued-for tongues?` → `given your sought-for **voices**` —
  here the modern uses "voices" for a word that wasn't "voices" in the source,
  while translating the real "voices" away.

Not a completeness failure — the meaning is delivered — but a real loss of the
play's central verbal figure, and it repeats across 2.1, 2.2, 2.3 and 3.3.

### 6. Act 3, Scene 1, paras 60–70 — the case against the tribunate (STRONG, one garbled clause)

Source: `CORIOLANUS. … and wish To jump a body with a dangerous physic That's
sure of death without it—at once pluck out The multitudinous tongue`
Modern: `CORIOLANUS. … and wish to dose a body with dangerous medicine that's
sure to die without it — at once pluck out the multitudinous tongue`

Finding — **confirmed clarity defect / altered logical relation.** In the source
it is the *body* that is sure of death without the physic. In the modern the
relative clause attaches to *medicine*: "medicine that's sure to die without it"
is nonsense, and it destroys the point of the metaphor (drastic remedy for a
patient who dies otherwise). Local but squarely in the play's central political
argument. Fix: "…to dose a body with a dangerous medicine — a body that is sure
to die without it".

Otherwise this 167 → 181-word speech is fully carried, including
`This double worship` → `This double sovereignty` (a fair gloss of "worship" =
dignity/office) and `unstable slightness` → `unstable triviality`.

### 7. Act 3, Scene 3, paras 55–69 — banishment (STRONG, one garbled clause)

Source: `COMINIUS. Let me speak. I have been consul and can show for Rome Her
enemies' marks upon me.`
Modern: `COMINIUS. Let me speak. I have been consul and can show on me her
enemies' marks for Rome.`

Finding — **confirmed clarity defect.** The modern reorders the line so that
"her" now has no antecedent (Rome has been pushed to the end of the phrase and
reads as "marks for Rome"). The source means: *I can show on my body the marks
made by Rome's enemies.* Local, one sentence, easily fixed.

`CORIOLANUS. You common cry of curs … I banish you! … There is a world
elsewhere.` is rendered completely and with full force.

### 8. Act 4, Scene 5, paras 55–60 — Coriolanus and Aufidius (STRONG)

Source: `AUFIDIUS. … Let me twine Mine arms about that body, whereagainst My
grained ash an hundred times hath broke And scarred the moon with splinters. Here
I clip The anvil of my sword…`
Modern: `AUFIDIUS. … Let me twine my arms about that body, against which my
grained ash has broken a hundred times and scarred the moon with its splinters.
Here I clip the anvil of my sword…`

Finding: the erotic-martial charge of Aufidius's welcome is fully preserved,
including the wedding-night comparison and the twelve dreamed wrestlings. The
304-word and 274-word speeches come across at 318 and 281 with nothing dropped.
`thy target from thy brawn` → `your shield from your shoulder` loses "brawn"
(muscled arm) for a body part; trivial.

### 9. Act 4, Scene 5, paras 75–90 — the servingmen (STRONG, register + malapropism)

Source: `THIRD SERVINGMAN. Do't? He will do't! For look you, sir, he has as many
friends as enemies, which friends, sir, as it were, durst not, look you, sir,
show themselves, as we term it, his friends whilest he's in directitude.`
Modern: `THIRD SERVINGMAN. Do it? He will do it! For look you, sir, he has as
many friends as enemies — which friends, sir, as it were, did not, look you, sir,
dare to show themselves, as we put it, his friends while he was in directitude.`

Finding: correctly leaves the malapropism `directitude` untranslated (it is
*meant* to be nonsense). The comic prose register holds; `scotched him and
notched him like a carbonado` survives as an image with the lightest gloss.

### 10. Act 5, Scene 3, paras 36–46 and Act 5, Scene 6, paras 44–60 — Volumnia's plea and the death (STRONG)

Source: `VOLUMNIA. … thou shalt no sooner March to assault thy country than to
tread— Trust to't, thou shalt not—on thy mother's womb That brought thee to this
world.`
Modern: `VOLUMNIA. … you shall no sooner march to assault your country than you
shall tread — trust to it, you shall not — on your mother's womb that brought you
into this world.`

Finding: both of Volumnia's great speeches (261 and 340 source words) come over
whole, including the chronicle-epitaph, the "poor hen" image, the kneeling, and
the boy's silent kneeling. The catastrophe in 5.6 is complete through Aufidius's
`Assist.` One word to watch: `noble memory` → `noble memorial` shifts
remembrance toward monument. Trivial.

## Phase 1 flags: confirmed vs disconfirmed

| Phase 1 signal | Verdict |
|---|---|
| `truncated_paragraphs_total: 0` | **Confirmed** by independent scan (0 hits at ≥40 source words, ratio < 0.62). |
| `empty_paragraphs_total: 0` | **Confirmed.** |
| `para_count_mismatch_total: 0`, `chapter_count_mismatch: false` | **Confirmed.** Paragraph-for-paragraph alignment held in every scene I opened (10 of 29). |
| `last_chapter_suspiciously_short: false` (1,435 w) | **Confirmed** — 5.6 is a full 61-paragraph closing scene. |
| `pct_identical_long_paragraphs: 0.4%` | **Confirmed and benign.** The near-identical long paragraphs (4.6 p54 at 0.998; 5.1 p9; 2.3 p44; 1.7 p0) are short reports and stage business already in plain English. No light-touch pocket. |
| `mean_weighted_similarity: 0.6788` | **Disconfirmed as a quality signal**, same as for Richard III — my long-paragraph recomputation gives ≈0.46. Do not read 0.68 as "barely changed". |
| *(No flag existed for the "voices"→"votes" terminology loss — that is a Phase 2 finding only.)* | New. |

## Phase 3 — human-edition research

**Step 1: does the original already meet the reading standard?** No — less than
for almost any other play in the canon. Coriolanus has the densest, most
knotted syntax of the late tragedies (`Being pressed to th' war, Even when the
navel of the state was touched, They would not thread the gates`), plus heavy
Roman political vocabulary (aediles, tribunes, the *gown of humility*, *voices*
as votes). Of the three plays in this batch it is the one where a modern
companion edition earns its keep most clearly.

**Step 2: candidate human modern-English editions.** Same landscape as the rest
of the Shakespeare set; researched per title.

| Candidate | What it is | Complete? | Rights | Verdict |
|---|---|---|---|---|
| **Standard Ebooks — Coriolanus** (Clark & Wright *Victoria* 1887, from the Globe text) — https://standardebooks.org/ebooks/william-shakespeare/coriolanus | **Original language**; modernised spelling/punctuation only. Confirmed by fetching the page: *"This Standard Ebooks edition is based on William George Clark and William Aldis Wright's 1887 Victoria edition, which is taken from the Globe edition."* | Complete | *"Content produced by or for Standard Ebooks L³C is dedicated to the public domain via the CC0 1.0 Universal Public Domain Dedication"*; *"This ebook is thought to be free of copyright restrictions in the United States."* Underlying Clark/Wright text PD in DK/EU too (Wright d. 1914). | **Rights-clear, but not a modern-en substitute.** Useful only as an alternative/cleaner *source* text. |
| **Play On Shakespeare / ACMRS Press — *Coriolanus*, modern verse translation by Sean San José** (ISBN 9780866986823) — https://acmrspress.com/9780866986823/coriolanus/ | A complete professional modern-English verse translation (Oregon Shakespeare Festival Play On! commission, 39 plays). The strongest editorial candidate in existence for this title. | Complete | **Permission required.** In print via ACMRS Press, distributed by University of Chicago Press; site carries "© 2026 ACMRS Press. All Rights Reserved." The series index shows a "Read open access" route via ASU Pressbooks for *some* volumes; **I could not confirm any CC licence for this title.** | **Rejected for reuse on rights grounds.** Open-access status of this specific volume: **unverified**. |
| **Folger Shakespeare digital texts** — https://www.folger.edu/copyright-policy/ | Modern-spelling scholarly edition with glosses; not a translation. | Complete | **CC BY-NC 3.0 Unported.** Fetched directly: *"You may not use the material from Folger Digital Texts for commercial purposes."* | **Rejected** — noncommercial clause is fatal to a paid product, and it isn't a modern rendering. |
| **Internet Shakespeare Editions (UVic)** — https://internetshakespeare.uvic.ca/Library/Texts/Cor/ | Folio and modern-*spelling* texts. | Complete | "Free… for educational, non-profit purposes; for all other uses contact the Coordinating Editor." | **Rejected** — noncommercial, not a translation. |
| **Open Source Shakespeare** — https://www.opensourceshakespeare.org/ | Original text + concordance. | Complete | Database licensed **CC BY-NC 4.0**. | **Rejected** — noncommercial; original language anyway. |
| **Lamb, *Tales from Shakespeare*** | Prose retelling. | **Excludes Coriolanus** — the Lambs covered no Roman plays. | PD | **Not applicable.** |

**Conclusion:** *no complete, readable, rights-clear human modern-English
edition of Coriolanus was found in this search* — "none found", not "none
exists". Every freely-licensed text in this space is a modernised-spelling
edition of the original language, and the one true modern translation (Play On /
San José) is under active commercial copyright.

**Jurisdiction note:** Shakespeare's text is PD in DK/EU and the US; the risk is
entirely in the translation layer. CC BY-NC (Folger, Open Source Shakespeare)
and "non-profit only" (ISE) both bar Tinct's commercial use in every
jurisdiction we serve. No unresolved jurisdictional question here.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | **4** |
| first-read clarity | 25% | **4** |
| literary voice | 20% | **4** |
| restraint / no invention | 10% | **5** |
| naturalness | 5% | **5** |

**Weighted score: 4.2** — band **Good with fixes**.

Justification: no omissions and no inventions found in 10 samples — restraint is
the edition's real strength (it adds almost nothing). Fidelity is 4 rather than 5
because of the systematic `voices` → `votes` flattening of the play's keyword
plus two clauses whose logical relations were altered (3.1 p64, 3.3 p58). Clarity
4 for those same two garbles. Voice 4 for the `voices` loss and a couple of
image-to-word reductions (`quarry`, `brawn`).

## Recommendation

**LIGHT EDIT** · confidence **medium-high** · correction scope **local**
(bounded: one global find-and-review pass on a single word, plus ~4 sentences).

Scoped fix list:
1. **`voices` pass.** Revisit every rendering of "voices"/"voice" in 2.1, 2.2,
   2.3, 3.1 and 3.3. Keep "voices" where the pun is doing work (`Your most sweet
   voices!`, `five hundred voices of that sound`) and gloss on first use
   ("your voices — your votes") rather than substituting globally. Also fix
   2.3 p89, where `sued-for tongues` was turned *into* "voices".
2. 3.1 p64 — reattach the relative clause: "a dangerous medicine — a body that
   is sure to die without it".
3. 3.3 p58 — restore the antecedent: "I can show on me the marks of Rome's
   enemies".
4. 1.1 p55 — `pile my lance` → `pitch my lance`; consider restoring `quarry`.
5. 5.6 p59 — `noble memorial` → `noble memory`.

Do **not** retranslate: the defects are a single lexical policy plus three
sentences, against 10 samples of otherwise complete, restrained, register-aware
work. Do **not** replace with a human edition — none is rights-clear.

## Limitations of this review

- I inspected **10 locations across all five acts** (1.1 ×3, 2.3 ×2, 3.1, 3.3,
  4.5 ×2, 5.3, 5.6), roughly 3,100 source words of 28,925 — about **11% of the
  play**. Strong in samples ≠ whole book verified.
- I did **not** read 1.2–1.10 (the Corioles battle sequence), 2.1, 2.2, 3.2
  (Volumnia persuading Coriolanus to return to the marketplace), 4.1–4.4, 4.6,
  4.7, 5.1, 5.2, 5.4 or 5.5 line by line — only through the mechanical and
  similarity screens.
- The `voices`→`votes` finding is confirmed in 2.3 and inferred to recur in
  2.1/2.2/3.3 from the similarity profile and spot checks; I did not enumerate
  every occurrence in the file.
- I did **not** audit `modern-da`, audio, `coriolanus-threads.json`, or
  onboarding JSON.
- Verse lineation is flattened to prose in **both** English editions — a
  pre-existing property of the edition set, not scored against this
  modernisation, but it does erase Shakespeare's deliberate verse/prose register
  switch, which matters unusually much in a class-conflict play.
- Rights research reflects publicly stated licences as of 2026-09-11; not legal
  advice.
