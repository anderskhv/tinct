# medea — Medea (Euripides)

Batch B11 (Greek tragedy) · audit date 2026-09-11 · reviewer: batch agent B11

## Edition snapshot (from Phase 1 `mechanical/medea.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `6e6e27372c778b45` | 7 | 241 | 14,167 | Murray (1906), tr. Gilbert Murray |
| modern-en | `2d30ac0eb7fa802a` | 7 | 241 | 14,719 | Modern English |
| modern-da | `37e6cf0812bb8bb7` | 7 | 241 | 14,522 | Moderne Dansk |

`en_editions_aligned: true`. chapter_count_mismatch false, para_count_mismatch_total 0,
truncated 0, empty 0, last_chapter_suspiciously_short false (3,103 words).
**mean_weighted_similarity 0.4948** — the second-lowest in the batch, i.e. the
most thoroughly rewritten. **pct_identical_long_paragraphs 0.0**.

(Note: the batch brief estimated ~11,000 words; the file is 14,167. The larger
figure is correct.)

Structure is 7 chapters (Prologue, Parodos, Episodes 1–4, Exodos) rather than the
11-chapter template used for the Sophocles plays — and unlike those, these titles
do broadly match their contents.

## ⚠ Core English text — provenance, completeness, and an UNRESOLVED RIGHTS QUESTION

**Gilbert Murray, *The Medea of Euripides*, translated into English rhyming verse
(1906; reprinted 1910).** Complete: from the Nurse's "Would God no Argo e'er had
winged the seas" to the Chorus's closing tag on the treasuries of Zeus.

**Gilbert Murray: born 2 January 1866, died 20 May 1957.**

- **United States:** published 1906 → public domain (pre-1929). No issue.
- **EU / Denmark:** term is author's life + 70 (Directive 2006/116/EC). Murray
  died 1957 → **his translations appear to remain in copyright in Denmark until
  31 December 2027, entering the public domain on 1 January 2028.**

Tinct operates from Denmark and sells a paid Premium tier. `medea-original-en.json`
is a verbatim reproduction of Murray labelled as such in the registry, and
`medea-modern-en.json` is a 241-paragraph, one-to-one derivative of it. I am
flagging both as **unresolved**, not as a legal conclusion — I am not qualified to
give one, and the derivative-work question in particular needs a real opinion.

This is identical to the issue in `bacchae` (same translator). It affects **only**
those two books in this batch: Storr (d. 1919) and Morshead (d. 1912) are PD
everywhere. A rights-clear substitute source exists — see Phase 3.

## Phase 1 flags — confirmed / disconfirmed

No Phase 1 flags. Independently re-verified:

- **0 truncated / 0 empty — CONFIRMED.** My own sweep of all 241 paragraph pairs
  (source ≥30 words, modern <72% of source length) returned **zero** hits; nothing
  exceeded 1.40× expansion; every chapter sat inside a 0.92–1.30 word-ratio band.
- **0 identical long paragraphs — CONFIRMED.**
- **similarity 0.4948 — CONFIRMED and it reads that way.** This is the freest and
  most idiomatic of the six modernizations in the batch ("Betrayed to the bone",
  "her heart torn open", "true love sickens like a poisoned thing"), and the
  freedom is earned rather than loose — see the compression findings below, which
  are the cost side of it.
- **Archaism residue (my own metric):** `original-en` 51.1 hits/1,000 words;
  `modern-en` **0.07** — a single instance (`forsooth`, ch 3 para 0). The cleanest
  de-archaising pass in the batch.

No mechanical outlier existed, so my difficult-passage samples are the Nurse's
prologue (a 470-word block of Murray's rhymed couplets) and Medea's great
monologue before the killing (the longest paragraph in the play).

## Samples inspected (6)

### Sample 1 — opening. Chapter 1 (Prologue), paras 0–3

Source (para 1):
> "No shaft of riven pine in Pelion's glen / Shaped that first oar-blade in the
> hands of men / Valiant, who won, **to save King Pelias' vow**, / The fleece
> All-golden!"

Modern:
> "If only no pine had ever been split in the glens of Pelion to shape that first
> oar in the hands of brave men, who sailed to win the All-Golden Fleece **for King
> Pelias**."

Finding: **strong overall, with two small losses and one small addition.**

(a) **Loss:** "to save King Pelias' vow" becomes "for King Pelias" — the *vow*,
which is the reason the whole voyage happens, is dropped.

(b) **Loss:** "Or slay the bridegroom and the king, / And win herself **God knows
what** direr thing?" → "Or will she kill the bridegroom and the king, and bring
some worse thing on herself?" The Nurse's dread — her refusal to name what she
fears — is compressed out.

(c) **Addition:** "Mine own princess, her spirit wounded sore / With love of
Jason" → "my own princess, **Medea**, her heart torn open by love for Jason." The
name is supplied where Murray withholds it. Confirmed by whole-file count and
diff: `Medea` appears 9× in source and 10× in modern, and this paragraph is the
sole extra. (`Creon` also goes 9× → 10×, but that one is benign — ch 1 para 10
repeats an already-present name for clarity: "it is Creon's will — Creon being
lord of all this land".)

(d) One logical wobble: "Not to be quite shut out from home . . . alas, / She
knoweth now how rare a thing that was!" → "Now, locked out from any home — alas,
she knows now how rare a thing that was." The source's abstract *blessing* becomes
Medea's present *state*; what "that" refers to gets muddier.

Against this, everything substantive is present and the voice is excellent: the
ship-of-state framing, "when husband and wife move in one music", the catalogue
of Medea's abandonments, the sharpened blade, "Few, I think, will rouse her hatred
and walk away unhurt."

### Sample 2 — Medea and Creon. Chapter 3 (First Episode), paras 2–4

Source:
> "CREON. What crime? I fear thee, woman--little need / To cloak my reasons--lest
> thou work some deed / Of darkness on my child… Thou comest here / **A wise-woman
> confessed**, and full of lore / In unknown ways of evil."

Modern:
> "CREON. What crime? I fear you, woman — there is no need to disguise my reasons —
> I am afraid you will work some dark deed against my child… You come here **a known
> witch**, full of strange knowledge in the arts of evil."

Finding: **strong.** Creon's whole reasoning survives, including the confession
that he is choosing hatred deliberately over regret ("I choose to earn your hate
now, deliberately, rather than soften with mercy and weep tears of blood later
on"). "A wise-woman confessed" → "a known witch" sharpens the connotation, which
is arguably closer to the Greek but is a change in register.

### Sample 3 — Medea to the women of Corinth. Chapter 3, para 0

The play's central speech, 450 source words. Source:
> "Of all things upon earth that bleed and grow, / A herb most bruised is woman. We
> must pay / Our store of gold, hoarded for that one day, / To buy us some man's
> love; and lo, they bring / A master of our flesh!"

Modern:
> "Of all things on earth that bleed and grow, woman is the most bruised herb. We
> must pay our hoard of gold, saved up for that one day, to buy ourselves a man's
> love — and what they bring us is a master of our flesh."

Finding: **strong.** The whole argument survives in order: the dowry, the master,
the impossibility of refusal, the foreign laws, the husband who goes out while
the wife waits, and the hammer-line "I would rather stand three times to face
their battles, shield in hand, than bear one child." So does the turn to Corinth
("your story and mine cannot be the same") and the closing threat — Medea's
terrifying rationality is intact, with no editorial framing added to it.

Two small issues in the same speech: **`forsooth` survives** untranslated (the
book's only residual archaism), and "they tell us" is inserted where the source
has only "'tis they that face the call / Of war" — a mild addition, though
arguably just unpacking implied reported speech. Also "if he but **stays his
suit**" (= puts her aside) is rendered "if he so much as **hesitates in his
courtship**", which misses the divorce sense.

### Sample 4 — hardest passage: the monologue. Chapter 6 (Fourth Episode), para 29

Medea's ~700-word speech before killing the children. Source:
> "And yet, / What is it with me? Would I be a thing / Mocked at, and leave mine
> enemies to sting / Unsmitten? It must be. O coward heart, / Ever to harbour such
> soft words!"

Modern:
> "And yet — what is happening to me? Will I be a thing to be mocked, and leave my
> enemies to sting on, unsmitten? It must be. O coward heart, ever to harbor such
> soft words."

Finding: **strong, and this is the passage that matters most.** Every oscillation
of the speech survives in sequence — the farewell to the children, the collapse
("I cannot do it"), the recovery, the second collapse ("Down, down, you tortured
thing, and spare my children"), the final refusal ("Too late, too late"), and the
closing statement of the play's thesis: "I know what bad things I am going to. But
louder than all thought, Anger cries — Anger, which makes man's worst misery."
Nothing is smoothed, nothing is explained, and no moral judgement is added around
a speech that invites one. The ellipses and broken syntax that mark the
oscillation are preserved as ellipses and breaks.

### Sample 5 — the Chorus on childlessness. Chapter 6, para 30

Source:
> "And thus my thought would speak: that she / Who ne'er hath borne a child nor
> known / Is nearer to felicity: / Unlit she goeth and alone"

Modern:
> "And so my thought would speak: she who has never borne a child, and never known
> one, is closer to happiness. She walks unlit and alone"

Finding: **strong, and the choral mode is preserved as a distinct register.** The
ode keeps its detached, meditative, generalising voice — visibly different from
the surrounding speech — and keeps its bleak arithmetic intact, including the
closing question: "what gain does this bring to man, whose cup was already full,
that God should send this one thing more?"

### Sample 6 — ending. Chapter 7 (Exodos), paras 58–66

Source:
> "MEDEA. Not thine, but mine . . . / JASON. . . . Who slew them! / MEDEA. Yes: to
> torture thee."

Modern:
> "MEDEA. Not yours — mine. / JASON. — Who slew them. / MEDEA. Yes — to torture
> you."

Finding: **strong.** The split line is preserved as a split line across speakers,
which is the whole effect. Jason's final appeal to Zeus is complete, and the play
ends correctly on the Chorus tag. "Daemons of the air" is glossed to "powers of
the air" — reasonable.

## A shared structural defect (both editions)

In chapter 6, the stage directions have been collapsed into the wrong paragraph
in `original-en`. Paragraph 28 (the Attendant's two-line speech) carries a stack
of four directions, including "[She has kept them hitherto at arm's length: but at
the touch of their hands, her resolution breaks down…]" and "[She follows the
CHILDREN into the house]" — both of which belong *after* Medea's monologue in
paragraph 29, which itself ends with "[MEDEA comes out alone from the house]".
The sequence as stored is impossible to stage.

`modern-en` reproduces the misplacement faithfully (and helpfully supplies the
missing subject: "**MEDEA** has kept them hitherto at arm's length"). This is a
**source-parsing defect, not a translation defect** — it should be a separate
housekeeping ticket against `medea-original-en.json`.

## Phase 3 — human-edition research

Shared with `bacchae` (same translator, same corpus); the full candidate table is
in `per-book-notes/bacchae.md`. In brief:

| Candidate | Rights | Verdict |
|---|---|---|
| **E. P. Coleridge**, *The Plays of Euripides* incl. *Medea* (1891; 1910 reprint), complete prose | **PD in the US and EU.** Coleridge 1863–1936 → EU life+70 expired **2007**; US PD (pub. pre-1931). Wikisource tags it PD worldwide; complete text on Wikisource and MIT Classics. | **The rights-clear substitute source.** Opening read: *"Ah! would to Heaven the good ship Argo ne'er had sped its course to the Colchian land through the misty blue Symplegades…"* Still lightly archaic ("ne'er", "would to Heaven"), so not a modern reading edition on its own — but complete, accurate, prose rather than rhyme, and unambiguously free for commercial use from Denmark. |
| Arthur S. Way (Loeb, 1912), complete verse | PD (Way 1847–1930; EU term expired 2001) | **Unverified.** Reputationally more archaic than Murray. |
| T. A. Buckley (c. 1850), complete prose | PD (Buckley 1825–1856) | **Unverified.** |
| Augusta Webster (1868), C. B. Heberden (1886), Robert Potter (1781) | PD | **Unverified**; identified from the Wikisource Medea index only. |
| **Ian Johnston** (VIU), *Medea* | **Permission required** — "No commercial publishing of these materials is permitted, without the written permission of Ian Johnston." | Best-reading modern candidate; not rights-clear for a paid product. |
| George Theodoridis (Bacchicstage), *Medea* | Non-commercial reproduction only; theatrical/educational/cinematic use needs permission. | Rejected on rights. |

## Ratings (editorial quality only — rights handled separately)

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 4 |
| First-read clarity | 25% | 5 |
| Literary voice | 20% | 5 |
| Restraint / no invention | 10% | 4 |
| Naturalness | 5% | 5 |

**Weighted score 4.5 — band: Good with fixes.**

Fidelity is the one dimension below 5 in this book, and it is 4 rather than 5
because the compression losses ("King Pelias' vow", "God knows what", "stays his
suit") all cluster on the same axis: this is the freest rendering in the batch,
and the freedom occasionally costs a qualification. Nothing lost is structural,
and no scene, image or argument is missing.

## Recommendation

**BLOCKED.** Confidence in the blocking issue: **medium-high** on the facts
(Murray's dates and the EU life+70 term are not disputed), **low** on the legal
consequence.

**What is unresolved, exactly:** whether Tinct may, from Denmark, commercially
distribute (a) `medea-original-en.json`, a verbatim copy of Gilbert Murray's 1906
translation, and (b) `medea-modern-en.json`, a paragraph-aligned derivative of
it, given that Murray died in 1957 and the EU/Danish copyright term is life + 70
years, expiring 31 December 2027.

**Were that resolved, the editorial verdict would be LIGHT EDIT** — restore
"King Pelias' vow" and the "God knows what" hedge, fix "stays his suit", replace
the surviving "forsooth", and consider dropping the supplied name "Medea" in the
Nurse's prologue. Six passages sampled (~2,400 source words) covering the
prologue, the Creon scene, the central manifesto, the infanticide monologue, a
choral ode and the ending. No scene, argument or image is missing anywhere; all
241 paragraph pairs mechanically verified. Medea's cold rationality is preserved
with no added commentary, which is the specific thing this play is easiest to get
wrong.

**Next action:** get a rights opinion on the Murray texts (this book and
`bacchae`). If the EU term is confirmed, the cheapest clean path is to re-derive
both editions from **E. P. Coleridge's 1891 prose** (PD in US and EU, complete,
on Wikisource and MIT Classics) rather than wait until 2028 or negotiate — which
would also mean re-generating `modern-da`.

**Correction scope: unknown** — "local" if the rights question comes back clean
(five named fixes); "substantial" if the source must be swapped and both derived
editions re-generated and re-aligned.

## Limitations of this review

- I read 4 of 7 chapters closely (1, 3, 6, 7). Chapters 2 (Parodos), 4 (Second
  Episode — the Jason agon, 79 paragraphs / 3,602 words, the longest in the play)
  and 5 (the Aegeus scene) were checked mechanically only. **The Jason agon is the
  biggest unread block in this book** and is the passage I would sample next.
- `modern-da` not evaluated; out of scope.
- No comparison against the Greek — fidelity claims are fidelity to Murray.
- **The rights analysis is mine, not a lawyer's.** I verified Murray's death year
  (1957) against multiple sources and applied the standard EU life+70 rule. I did
  **not** check for Danish-specific exceptions, rules for works first published
  abroad, the status of the specific 1906 versus 1910 printing, or whether Tinct
  already holds a licence. Treat it as a flag needing professional review, not a
  finding of infringement.
- Coleridge was verified by reading its opening lines only; Way, Buckley, Webster,
  Heberden and Potter are unverified.
- No in-app rendering check.
