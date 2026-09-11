# faust-part-1 — reconciliation of the 2026-09-11 audit finding

**Book:** Faust, Part One (Goethe) · `faust-part-1`
**Reconciling:** `docs/modern-english-translation-audit-2026-09-11/per-book-notes/faust-part-1.md` (verdict: BLOCKED)
**Method:** direct paragraph-level read of the shipped JSON files + ground-truth comparison against Project Gutenberg #14591
**Date:** 2026-09-11
**Scope:** read-only. No file under `app/` was modified.

---

## Headline

The independent reviewer is right, and the correction matters.

**The prior audit's claim that "Faust's famous opening monologue is missing" and "is simply not in the file" is imprecise and overstated.** The monologue is present from its 27th line onward — including its single most-quoted line. What is actually missing is a **bounded, contiguous 26-line block at the very top of the scene** (plus the scene's stage heading and speaker tag).

The audit's *other* three findings — misattribution to Bayard Taylor, raw German inside the English editions, and duplicated speech in "Forest and Cavern" — are **all confirmed**, and the German/duplication findings are structurally worse than the audit characterised them: they share a single root cause the audit did not identify.

The verdict does not change. It changes *reason*.

---

## 1. Ground truth — Bayard Taylor, 1870/71

Source: Project Gutenberg ebook #14591, *Faust: A Tragedy. Translated in the Original Metres*, Bayard Taylor.
URL: <https://www.gutenberg.org/files/14591/14591-h/14591-h.htm> (retrieved 2026-09-11)

Taylor's Scene I, in full through the point where our file begins:

> **NIGHT**
>
> *(A lofty-arched, narrow, Gothic chamber. FAUST, in a chair at his desk, restless.)*
>
> **FAUST**
>
> I've studied now Philosophy
> And Jurisprudence, Medicine,—
> And even, alas! Theology,—
> From end to end, with labor keen;
> And here, poor fool! with all my lore
> I stand, no wiser than before:
> I'm Magister—yea, Doctor—hight,
> And straight or cross-wise, wrong or right,
> These ten years long, with many woes,
> I've led my scholars by the nose,—
> And see, that nothing can be known!
> That knowledge cuts me to the bone.
> I'm cleverer, true, than those fops of teachers,
> Doctors and Magisters, Scribes and Preachers;
> Neither scruples nor doubts come now to smite me,
> Nor Hell nor Devil can longer affright me.
>
> For this, all pleasure am I foregoing;
> I do not pretend to aught worth knowing,
> I do not pretend I could be a teacher
> To help or convert a fellow-creature.
> Then, too, I've neither lands nor gold,
> Nor the world's least pomp or honor hold—
> No dog would endure such a curst existence!
> Wherefore, from Magic I seek assistance,
> That many a secret perchance I reach
> Through spirit-power and spirit-speech,
> **And thus the bitter task forego**
> **Of saying the things I do not know,—**
> **That I may detect the inmost force**
> **Which binds the world, and guides its course;**
> **Its germs, productive powers explore,**
> **And rummage in empty words no more!**
>
> O full and splendid Moon, whom I
> Have, from this desk, seen climb the sky
> So many a midnight,—would thy glow
> For the last time beheld my woe! …

(Bold added by me to mark the join point — see §3.)

Corresponding German, from our own `faust-part-1-original-de.json`, ch 4 "Nacht", para 1, which carries the speech **complete**:

> FAUST. Habe nun, ach! Philosophie, / Juristerey und Medicin, / Und leider auch Theologie! / Durchaus studirt, mit heißem Bemühn. / Da steh' ich nun, ich armer Thor! … / Drum hab' ich mich der Magie ergeben, / Ob mir durch Geistes Kraft und Mund / Nicht manch Geheimniß würde kund; / **Daß ich nicht mehr mit sauerm Schweiß, / Zu sagen brauche, was ich nicht weiß; / Daß ich erkenne, was die Welt / Im Innersten zusammenhält, / Schau' alle Wirkenskraft und Samen, / Und thu' nicht mehr in Worten kramen.** / O sähst du, voller Mondenschein, …

This is Goethe lines 354–385. The German edition we ship is **not** damaged here.

---

## 2. What our `original-en` chapter 4 actually contains — verbatim

`app/public/data/editions/faust-part-1-original-en.json` → `chapters[3]` (`number: 4`, `title: "Night"`), 27 paragraphs.

**Paragraph 0 begins, character-for-character:**

> `bitter sweat, be obliged to speak of what I do no know; that I may learn what holds the world togethe in its inmost core, see all the springs and seeds of production, and rummage no longer in empty words. Oh! would that thou, radiant moonlight, wert looking for the last time upon my misery; thou, for whom I have sat watching so many a midnight at this desk ; …`

There is no scene heading, no `FAUST.` speaker tag, and no capital letter. The file opens on a lower-case fragment of a subordinate clause.

`modern-en` `chapters[3].paragraphs[0]` mirrors it, and the generator visibly *flagged* the break with an ellipsis it invented:

> `FAUST. ... with bitter sweat, be forced to speak of what I do not know; that I may learn what holds the world together in its inmost core, …`

`modern-da` inherits the same break:

> `FAUST. ... med bitter sved tvinges til at tale om det, jeg ikke kender; at jeg må lære, hvad der holder verden sammen i dens inderste kerne, …`

---

## 3. The gap, precisely bounded

Our fragment `"bitter sweat, be obliged to speak of what I do no know"` is a prose rendering of Goethe 380–381 (`Daß ich nicht mehr mit sauerm Schweiß, / Zu sagen brauche, was ich nicht weiß`), i.e. Taylor's `And thus the bitter task forego / Of saying the things I do not know,—`.

| | |
|---|---|
| **Missing** | The scene heading *(A lofty-arched, narrow, Gothic chamber…)*, the `FAUST` speaker tag, and Goethe **lines 354–379** — 26 consecutive verse lines, `"I've studied now Philosophy"` → `"Through spirit-power and spirit-speech,"` — plus the lead-in words of line 380 (`"That I may no longer, with…"`). |
| **Surviving** | From mid-line 380 onward: `"…bitter sweat, be obliged to speak of what I do no know; that I may learn what holds the world togethe in its inmost core, see all the springs and seeds of production, and rummage no longer in empty words."` (= Goethe 380b–385) |
| **Then** | Goethe 386 onward — `"Oh! would that thou, radiant moonlight, wert looking for the last time upon my misery"` (= `"O sähst du, voller Mondenschein"` / Taylor `"O full and splendid Moon"`) — and the remainder of the scene: the Macrocosm sign, the Earth-Spirit, Wagner, the Easter chorus. All present, in the same damaged prose, but **continuous**. |

**Quantified.** Faust's opening speech runs Goethe 354–417 (64 lines, up to `"Ihr schwebt, ihr Geister … antwortet mir!"`). Of that, **26.5 lines (≈41%) are lost and 37.5 lines (≈59%) survive.** Measured against the first verse paragraph alone (354–385, 32 lines), **26.5 of 32 lines are lost (≈83%)**.

**Correcting the audit.** The prior note said the speech `"is simply not in the file."` That is wrong. Notably, the line most often quoted from the entire play — *was die Welt im Innersten zusammenhält* — **is in the file**, at ch 4 para 0, as `"what holds the world togethe in its inmost core"` (with the OCR typo `togethe`).

**But the loss is not trivial, and should not be downgraded.** What is gone is the play's *first 26 lines*: the four-faculties catalogue (Philosophy, Jurisprudence, Medicine, Theology), "no wiser than before", "led my scholars by the nose", "no dog would endure such a curst existence", and `Drum hab' ich mich der Magie ergeben` — Faust's stated **motive** for turning to magic. Every reader entering the play at its first real scene lands mid-clause, in lower case, with the causal premise of the entire plot deleted. It is a bounded defect, not a vague one, and it is at the single worst possible location in the book.

---

## 4. Re-verification of the other three claims

### 4a. "`original-en` is not Bayard Taylor" — **CONFIRMED**

`bookRegistry.ts` lines 2072–2079 declare `key: 'original-en'`, `label: 'Bayard Taylor (1870)'`, `translator: 'Bayard Taylor'`, `year: 1870`.

Measured directly:

- **Prose, not verse.** Across all 895 paragraphs of `original-en` there are **zero newline characters**. Taylor's defining feature is verse in Goethe's original metres, with lineation. Ours has no lineation anywhere. (`modern-en` has 104 newlines — the generator *restored* lineation in a couple of songs; the source has none.)
- **No Taylor phrasing survives anywhere.** Searched `original-en` and `modern-en` for eight distinctive Taylor lines: `"I've studied now Philosophy"`, `"poor fool! with all my lore"`, `"led my scholars by the nose"`, `"No dog would endure such a curst existence"`, `"O full and splendid Moon"`, `"Such is my world: and what a world"`, `"The spirit-world no closures fasten"`, `"Disciple, up! untiring, hasten"`. **All eight absent from both.**
- **Diagnostic divergence at the join point.** Taylor renders `saurem Schweiß` idiomatically as `"the bitter task"`. Ours renders it literally as `"bitter sweat"` — the mark of a literal prose crib, not of a metrical verse translation.
- **Register.** Ours is second-person-archaic prose with bracketed stage business and footnote markers (`"Am I a god? All grows so bright!"`, `"[He contemplates the sign.]"`, `"from Nostradamus' own hand,”"` with a stray footnote quote-mark). Hayward/Bohn-tradition, not Taylor.

The attribution in `bookRegistry.ts` is false. We are crediting a named translator for text he did not write.

### 4b. "Raw untranslated German in the English edition" — **CONFIRMED**

My detector (German function-word ratio >10% on paragraphs >12 words, or ≥3 umlauts) flags **44 of 895 paragraphs** in `original-en`. The audit said 49; different threshold, same phenomenon. Distribution by chapter: ch 2 (2), 6 (3), 7 (6), 9 (7), 10 (2), 11 (4), 14 (2), 16 (1), 17 (7), 21 (1), 25 (2), 26 (5), 27 (2).

Three verbatim examples:

**ch 6 ("The Study, Part 1"), para 12** — labelled FAUST, entirely German, with a running-head/page-number artefact `Too: 10k` embedded:

> `FAUST. Du kannst im Groszen nichts vernichten Mephistopheles, Und freilich ist nicht viel damit gethan. Was sich dem Nichts entgegenstellt, Das Etwas, diese plumpe Welt, So viel als ich schon unternommen, Ich wuszte nicht ihr beizukommen, Geruhig bleibt am Ende Meer und Land! Too: 10k Und dem verdammten Zeug, der Thier- und Menschen. brut, …`

**ch 7 ("The Study, Part 2"), para 26** — German, with a second speaker's cue (`Mephistopheles.`) swallowed inside a paragraph attributed to FAUST:

> `FAUST. Auch was Geschriebnes forderst du, Pedant? Hast du noch. keinen Mann, nicht Manneswort gekannt ? Ist's nicht genug, dasz mein gesprochnes Wort Auf ewig soll mit meinen Tagen schalten ? … Soll ich mit Griffel, Meiszel, Feder schreiben ? Ich gebe jede Wahl, dir frei. + Mephistopheles. Wie magst du deine Rednerei`

**ch 27 ("Night. Open Field"), para 6** — the audit's example, verified verbatim, complete with running head `KERKER`, line number `4050`, and OCR debris `BB`:

> `MEPHISTOPHELES. On! on! BB KERKER. '1 Der Menschheit ganzer Jammer faszt mich an. Hier wohnt sie, hinter dieser feuchten Mauer, 4050 Und ihr Verbrechen war ein guter Wahn! Du zauderst, zu ihr zu gehen !`

Also note `ch 27 para 7` — a *stage direction left in German*: `[Er ergreift das Schloss. Es singt inwendig.]` — and `ch 27 para 8`, Gretchen's song entirely in German. And `ch 2 para 4`, where the running head of the German critical edition is inlined mid-sentence: `"MANAGER. But, most particularly, let thete be incident enoug 8 " VORSPIEL AUF DEM THEATER. Man kommt, zu schau'n, man will am liebsten sehn. … 60 … 65 …"`.

Every German block is transliterated `ß → sz` (`dasz`, `groszen`, `musz`, `faszt`) and carries Goethe line numbers in multiples of five. This is an OCR of a **bilingual German-text-with-English-prose-crib school edition**, not of an English translation at all.

### 4c. "Duplicated speech in Forest and Cavern" — **CONFIRMED, and the root cause is now clear**

The audit found the duplication but attributed it to "the generator trying to cope with a broken source". The real mechanism is visible in `original-en` ch 17 itself: **the source alternates German and English renderings of the same passages**, because the OCR flattened a parallel-text page into one stream.

`original-en` ch 17 sequence:

| paras | language | content |
|---|---|---|
| 0 | English (tail runs into German mid-sentence) | Faust's "Sublime spirit!" monologue |
| 1–4 | **German** | Mephistopheles/Faust exchange, lines 2900–2915 |
| 5–10 | **English** | *the same exchange again* |
| 18–21 | **German** | "twin-pair" jibe + Faust's cataract speech, lines 2980–3000 |
| 22–25 | **English** | *the same passage again* |
| 26 | **German** | Mephistopheles' closing jibe, line 3015 |
| 27 | **English** | *the same speech again* |

The generator translated the German blocks into English, so what was German/English redundancy in the source became **visible English duplication** in `modern-en`:

- `modern-en` para 19 and para 23 are the **same line, twice**:
  - p19: `MEPHISTOPHELES. Very well, my friend! I have often envied you the twin pair that grazes among the roses.`
  - p23: `MEPHISTOPHELES. Very well, my friend! I have often envied you the twin pair which feeds among roses.`
- `modern-en` para 20 and para 24 are **identical**: `FAUST. Pander, be gone!`
- `modern-en` para 22 and para 26 are two renderings of Faust's central speech:
  - p22: `Am I not the **fugitive**, the homeless one, the monster without purpose or rest, who, like a cataract, **raged** from rock to rock … Hell, **you had to have** this sacrifice!`
  - p26: `Am I not the **outcast** — the homeless one — the monster without aim or rest, who, like a cataract, **dashed** from rock to rock … Hell, **you could not rest without** this sacrifice!`
- `modern-da` inherits it exactly: ch 17 p19 and p23 are both `MEPHISTOPHELES. Udmærket, min ven! Jeg har ofte misundt dig det tvillingepar, der græsser blandt roserne.`; p20 and p24 are both `FAUST. Rufferknægt, forsvind!`

**One correction to the audit here.** It reported the mislabelled speaker at `modern-en` p5 (`MEPHISTOPHELES. — whom I already cannot do without…`, which is Faust speaking) as a generator fault. It is **inherited, not invented**: `original-en` p4 already carries that text under `MEPHISTOPHELES.`, because the OCR merged the German block with the English tail of Faust's speech. Compare `original-en` ch 17 p0's tail, which breaks into German mid-clause: `"…thou gavest me the companion, Entbehren kann, wenn er gleich kalt und frech Mich vor mir selbst erniedrigt … [MeErHistoPHELes tritt auf.)"`. The generator repaired that break by reconstructing the English at p5 — reasonably — but kept the wrong speaker tag.

---

## 5. Corrected findings vs. the original audit

| Original claim | Status | Correction |
|---|---|---|
| "Chapter 4 opens mid-sentence" | **Confirmed** | Exact: mid-clause at Goethe line 380, lower-case, no scene heading, no speaker tag. |
| "Faust's famous opening monologue is missing" / "is simply not in the file" | **Corrected — overstated** | ≈59% of the opening speech survives, including `what holds the world … in its inmost core`. The loss is a bounded 26-line block, Goethe 354–379, plus the heading and the first words of 380. |
| "`original-en` is not Bayard Taylor" | **Confirmed** | Zero newlines in 895 paragraphs; all 8 tested Taylor phrases absent; `"bitter sweat"` vs Taylor's `"bitter task"`. |
| "49/895 paragraphs contain raw German / OCR debris" | **Confirmed** | 44 by my detector; chapter distribution matches. |
| "Duplicated speech in Forest and Cavern" | **Confirmed, cause corrected** | Not a generator artefact of a "broken source" generally — the source is a **parallel German/English crib** whose two columns were flattened into one stream; the generator then translated the German half, producing English duplicates. `modern-da` inherits the duplicates verbatim. |
| "Speaker mislabelled MEPHISTOPHELES in ch 17" | **Confirmed, cause corrected** | Inherited from `original-en` p4, not introduced by the generator. |
| "`aligned: true` on English editions is dishonest" | **Partly corrected** | `bookRegistry.ts` line 2078 already sets `aligned: false` on `original-en`. `modern-en` and `modern-da` are `aligned: true`, which is true *to each other* but means split-pane against `original-en` is already not offered as aligned. |

**New finding not in the original audit:** the provenance is now positively characterisable, not merely negatively. `original-en` is the OCR of an **English prose crib printed alongside the German text** (Goethe line numbers at 5-line intervals, German running heads such as `VORSPIEL AUF DEM THEATER` and `KERKER`, `ß` transliterated as `sz`, footnote markers). That is why German appears *inside* it in 44 places, and why whole passages appear twice.

---

## 6. Recommendation

### **Replace edition.** Confidence: high.

Justification, and why the softer options do not hold:

- **Not `retain`.** The book's first 26 lines are absent, 44 paragraphs of the English edition are in German, and the Danish edition ships the same speech twice in two scenes. This is not shippable as a translation of anything.
- **Not `patch content`.** I considered this seriously, because the chapter-4 defect *is* local and bounded, and could be repaired by splicing Taylor's lines 354–379 in. But patching chapter 4 fixes one of at least three independent defect classes. The German contamination is spread across 13 of 28 scenes, and the duplication is structural — it arises from the source being a flattened parallel text, so a local edit at ch 17 would leave the same failure latent wherever else the two columns interleaved. Patching also cannot fix the attribution: the file would still not be Bayard Taylor, and the registry would still say it is.
- **Not `temporarily withhold modern edition`.** The modern editions are the *least* damaged link in the chain — `modern-en` is a competent English repair job that even flagged the ch-4 truncation with an ellipsis. Withholding them would leave readers with the OCR crib, which is worse.
- **Not `temporarily withhold book`** as the terminal action, though see the interim note below.

**Action, in order:**

1. Replace `faust-part-1-original-en.json` with the real Bayard Taylor text from Project Gutenberg #14591 — verse, complete, public domain, and already what `bookRegistry.ts` promises. Re-parse into the 28 scenes.
2. Regenerate `modern-en`, then `modern-da`, from the clean source. Do not attempt to patch the current modern files — the duplication and the ch-17 ordering are source-shaped defects a local edit will not reach.
3. Re-check `original-de` paragraph segmentation (1056 paras vs 895) so `aligned` is honest for the DE/EN pair.
4. **Escalate to Anders before step 1.** This is a source replacement for a live public book, which is outside routine content work per `CLAUDE.md`.

**Interim, pending that work:** the single highest-value stopgap, if the replacement cannot land quickly, is to withhold `faust-part-1` from the library rather than ship a book whose first page begins with a lower-case sentence fragment. If that is judged too heavy, the minimum acceptable interim is to correct the false `translator: 'Bayard Taylor'` attribution in `bookRegistry.ts` — that is an attribution problem independent of the text quality, and it is a one-line fix.

---

## Limitations

- Danish edition sampled at ch 4 and ch 17 only, to confirm inheritance of the two headline defects. Not reviewed on its own merits.
- German contamination counted by heuristic (function-word ratio + umlauts); paragraphs with one or two German words are below threshold, so 44 is a floor, not a ceiling.
- I read ch 1–4, 17, 26–27 closely and sampled ch 18. I did not re-read the 7 scenes the prior audit covered beyond those.
- Taylor's public-domain status taken from publication date (1870–71), translator's death (1878), and Project Gutenberg's own licence statement. US renewal records not examined directly.
- No rendering, audio, onboarding, or `faust-part-1-threads.json` checks.
