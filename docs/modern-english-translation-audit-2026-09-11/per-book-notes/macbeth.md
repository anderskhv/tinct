# macbeth — Macbeth (William Shakespeare, 1606)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (Shakespeare batch)

## Edition snapshot (from Phase 1 `mechanical/macbeth.json`)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en (Original Text) | `2650bcc666428a80` | 28 | 806 | 16,520 |
| modern-en (Modern English) | `0c85273086804fdd` | 28 | 806 | 17,683 |
| modern-da (Moderne Dansk) | `c10696221af2265d` | 28 | 806 | 17,616 |

`en_editions_aligned: true`, no paragraph-count mismatches, mean weighted similarity 0.4438
(real-rewrite range), 2.5 % identical long paragraphs, 0 truncations, 0 empty paragraphs, last
chapter not flagged.

modern-en runs **+1,163 words (+7.0 %)** over the source, the healthy direction for a
modernization that unpacks compressed Early Modern syntax.

## Provenance / completeness of the core English text

- Core key `original-en`; English original, no translator. Registry
  (`app/src/data/bookRegistry.ts` L239-272) records no source attribution — **provenance
  undocumented**.
- Same source family as hamlet / midsummer / romeo-and-juliet: curly apostrophes (543), em dashes
  (119), `[_Aside._]` underscore-emphasis bracket style.
- Complete: all 28 scenes, Act 1 Scene 1 ("A Desert Place") through Act 5 Scene 8.
- As with the rest of the batch, verse is **not lineated** — each speech is one prose paragraph
  with capitalised line-starts in original-en; modern-en drops the capitals.

## Structure check (books/AGENTS.md Shakespeare failure mode)

Apparatus scan: **0 apparatus/stub suspects** in either English edition. All 28 titles are clean
reader-facing labels (`Act 2, Scene 3 — Macbeth's Castle`, `Act 4, Scene 1 — A Dark Cave. In the
Middle, a Cauldron Boiling`). Sections `Act 1`…`Act 5`. No editorial-collation debris.
**Disconfirmed** for this book.

Speaker tags / stage directions: **convention followed.** `MACBETH.`, `[Thunder and Lightning.
Enter three Witches.]`, `[Exeunt.]` and inline `[_Aside._]`, `[_Within._]`, `[_Knocking._]` all
preserved verbatim in modern-en.

One regex false positive worth recording so it is not re-flagged later: ch27 p19
`SIWARD. Enter, sir, the castle.` is a **real Shakespeare line** ("Sir, enter the castle"), not a
mis-tagged stage direction. modern-en correctly renders it `SIWARD. Enter the castle, sir.`

## Samples inspected (6)

### 1. Act 1 Scene 1, paras 0–11 — the witches (complete scene, 87 source words)

**Finding (paradox resolved into a plain statement), p2:**
- SRC: `SECOND WITCH. When the hurlyburly’s done, When the battle’s lost and won.`
- MOD: `SECOND WITCH. When the chaos of battle is over. When one side has lost and the other has won.`

The source line is deliberately paradoxical — *the same* battle is both lost and won — and it is
the first statement of the play's governing figure, completed eight lines later by
`Fair is foul, and foul is fair`. modern-en resolves it into an unremarkable observation about two
armies. The companion line survives (`What's fair is foul, and what's foul is fair`, p10), which
makes the loss more conspicuous: the reader now sees one paradox where Shakespeare set two.

**Finding (proper noun dropped, inconsistently), p7/p8:**
- SRC p7: `FIRST WITCH. I come, Graymalkin!` → MOD: `FIRST WITCH. I'm coming, Graymalkin!`
- SRC p8: `SECOND WITCH. Paddock calls.` → MOD: `SECOND WITCH. My toad is calling.`

Both are named familiars. The first name is kept, the second is replaced by its gloss. Whatever
the policy is, it should be the same for both (`books/AGENTS.md` L146: "Preserve proper nouns").

### 2. Act 1 Scene 7, paras 0–9 — "If it were done when 'tis done" (high-register verse)

Complete and accurate; every clause of the soliloquy is accounted for. But this is where the
image-flattening is clearest.

- SRC p1: `…that but this blow Might be the be-all and the end-all—here, But here, upon this bank and shoal of time, We’d jump the life to come.`
- MOD p1: `…if this one blow could be the beginning and the end of it, right here, right now, on this side of eternity, we'd risk the life to come.`
  → `this bank and shoal of time` — one of the play's best images — becomes the flat
  "right here, right now, on this side of eternity". Explanation replaces image.

- SRC p1: `And pity, like a naked new-born babe, Striding the blast, or heaven’s cherubin, hors’d Upon the sightless couriers of the air, Shall blow the horrid deed in every eye, That tears shall drown the wind.`
- MOD p1: `And pity, like a naked newborn babe riding the storm, or like heaven's angels mounted on the invisible winds, will blow the news of this horrible deed into every eye until tears flood like rain.`
  → The babe and the cherubim survive (good). But `sightless couriers of the air` → `invisible
  winds` loses the couriers, and `tears shall drown the wind` — tears *drowning* the wind — is
  replaced by an invented simile, `tears flood like rain`. That is a changed image, not a gloss.

**Finding (added gloss), p7:**
- SRC: `Letting “I dare not” wait upon “I would,” Like the poor cat i’ th’ adage?`
- MOD: `letting "I don't dare" follow "I want to," like the cat in the old saying that wanted fish but wouldn't get its paws wet?`
  → `that wanted fish but wouldn't get its paws wet` is not in the source. Defensible under
  "explain essential unfamiliar terms briefly at the point of need" — the adage is genuinely dead
  to a modern reader — but it should be logged as a deliberate editorial addition, and `poor` is
  dropped in exchange.

### 3. Act 2 Scene 3, paras 0–21 — the Porter (low-register comic prose)

**The strongest comic handling in the batch.** Prose stays prose; register is unmistakably
different from the surrounding verse; the jokes are clarified rather than deleted.

- SRC p1: `Here’s a farmer that hanged himself on the expectation of plenty`
- MOD p1: `Here's a farmer who hanged himself because he expected prices to drop after a good harvest`
  → correctly unpacked; a modern reader now gets the joke.
- SRC p1: `here you may roast your goose` → MOD p1: `here you can heat your pressing iron` (the
  tailor's "goose" is a pressing iron — correct primary sense; the venereal second sense is lost
  but that is an acceptable trade).
- SRC p1: `I pray you, remember the porter.` → MOD p1: `Please, remember to tip the porter.`
  → good, invisible-custom gloss.
- SRC p7 equivocator riff: `it makes him, and it mars him; it sets him on, and it takes him off;
  it persuades him, and disheartens him; makes him stand to, and not stand to` →
  MOD p7: `it builds a man up and tears him down; it eggs him on and holds him back; it persuades
  him and then defeats him; it props him up and then lets him down`
  → all four antithetical pairs kept, innuendo intact.

**Finding (minor):** `Who’s there, i’ th’ name of Belzebub?` → `Who's there, in the name of the
devil?`, which then collides with the next line `in the other devil's name`. Beelzebub should stay
so the "other devil" joke still has a first devil to be other than.

### 4. Act 4 Scene 1, paras 4–15 — the cauldron chants (**the 2.5 % identical-paragraph flag**)

The flagged identical long paragraph is p10:
- SRC = MOD: `SECOND WITCH. Cool it with a baboon’s blood. Then the charm is firm and good.`

**Verdict: disconfirmed as a defect.** The line is already plain modern English and already
rhymes; changing it would be gratuitous. Leaving it identical is the correct call.

More importantly, this scene shows that **modern-en can and does preserve rhyme**: `go`/`throw`,
`stone`/`thirty-one`, `snake`/`bake`, `frog`/`dog`, `sting`/`wing`, `trouble`/`bubble`,
`thumbs`/`comes`, `locks`/`knocks` all survive. That matters for the batch verdict — where rhyme
is lost elsewhere (midsummer ch9, romeo-and-juliet ch1) it is an inconsistency, not a stated
policy.

**Finding (silent softening of source content), p8:**
- SRC: `Witch’s mummy, maw and gulf Of the ravin’d salt-sea shark, Root of hemlock digg’d i’ th’ dark, **Liver of blaspheming Jew**, Gall of goat…`
- MOD: `dried flesh of a witch, stomach and gullet of a ravenous shark from the salt sea, root of hemlock dug up in the dark, **liver of a blasphemer**, gall of goat…`

`Nose of Turk, and Tartar's lips` is kept intact two lines later, so this is not a consistent
policy of removing ethnic references — it is a one-off softening. `books/AGENTS.md` L144 is
explicit: "Do not soften period language or add editorial corrections." Whichever way Anders wants
this handled (restore, or restore-with-a-note), it should be a decision, not an unlogged edit.

### 5. Act 5 Scene 1, paras 14–27 — the sleepwalking scene (prose, Lady Macbeth)

Excellent. `Out, damned spot!`, `who would have thought the old man had so much blood in him?`,
`All the perfumes of Arabia will not sweeten this little hand` all preserved. No omissions.

**Finding (two distinct phrases collapsed to one), p19/p24:**
- SRC p19: `DOCTOR. Go to, go to. You have known what you should not.` → MOD p19: `DOCTOR. Well, well, well. You have come to know things you should not have known.`
- SRC p24: `DOCTOR. Well, well, well.` → MOD p24: `DOCTOR. Well, well, well.`

The Doctor says two different things five lines apart; modern-en gives him the same line twice.
Trivial in isolation but it is a real loss of variation.

### 6. Act 5 Scene 5, paras 0–16 — "Tomorrow, and tomorrow, and tomorrow"

Complete and very good. `Out, out, brief candle!`, `a poor actor who struts and frets his hour
upon the stage`, `full of sound and fury, signifying nothing` all preserved; `Life's but a walking
shadow` correctly kept as an image rather than explained.

**Finding (ambiguity resolved), p8:**
- SRC: `MACBETH. She should have died hereafter. There would have been a time for such a word.`
- MOD: `MACBETH. She would have died eventually. There would have been a time for such news.`

`should have died hereafter` is famously two-ways ambiguous — *she would have died sometime anyway*
or *she ought to have died at a later, better moment*. modern-en commits to the first. The
standard asks that ambiguity be preserved; a phrasing like "Her death should have come later"
holds both.

## Phase 1 flags: confirmed vs disconfirmed

| flag | verdict |
|---|---|
| `pct_identical_long_paragraphs: 2.5` | **Confirmed present, disconfirmed as a defect.** My ≥15-word scan found exactly one (ch18 p10, the baboon's-blood couplet) — already modern, already rhymed, correctly left alone. |
| `truncated_paragraphs_total: 0` | Confirmed. |
| `empty_paragraphs_total: 0` | Confirmed. |
| `last_chapter_suspiciously_short: false` | Confirmed — Act 5 Scene 8 is 717 modern words. |
| `en_editions_aligned: true` | Confirmed — 806 = 806 paragraphs across 28 scenes. |
| Shakespeare apparatus-debris failure mode | **Disconfirmed** — 0 suspects, all 28 titles clean. |

## Phase 3 — human-edition research

**Does the source already meet the reading standard?** No. Macbeth is denser than Hamlet in spots
(`trammel up the consequence`, `the ingredience of our poison'd chalice`, `my fell of hair`,
`I have supp'd full with horrors`, `Direness`, `unback'd`, `harness`). A modern edition is
justified.

**Rights-clear human modernization?** Same corpus-level answer as the rest of this batch:

| candidate | what it is | rights | verdict |
|---|---|---|---|
| **Play On Shakespeare / ACMRS Press** — *Macbeth*, modern-verse translation by **Migdalia Cruz** | Complete line-by-line modern verse by a working playwright; the best human modernization that exists | **Permission required.** playonshakespeare.org/play/macbeth footer: "© 2026 Play On Shakespeare. All Rights Reserved."; text obtainable only via script-request form. | **Rejected — rights.** |
| **Folger Shakespeare** digital text of Macbeth | Modern **spelling** + notes; Shakespeare's own words | **CC BY-NC 3.0**; folger.edu/copyright-policy: "you may not use the material from Folger Digital Texts for commercial purposes" | **Rejected** — NC blocks a paid product, and it is not a modernization. |
| **Standard Ebooks** — *Macbeth*, from Clark & Wright 1887 Victoria/Globe | Original language, modern spelling, clean, no apparatus; SE additions CC0, source US-PD | **Public domain / CC0** | **Not a modern-en candidate.** Viable replacement for `original-en` if provenance is ever tidied. |
| Lamb (1807, PG #20657) and Nesbit (1907, PG #1430) | Abridged narrative retellings, both include Macbeth | Public domain | **Rejected — incomplete.** |
| No Fear Shakespeare, Shakescleare, NoSweatShakespeare, Shakespeare Retold | Complete modern-English parallel texts, free to read | All-rights-reserved commercial sites | **Rejected — rights.** |

**Conclusion:** none found in this search, and for the public-domain corpus specifically this is
close to "none exists" — line-by-line modernizations of Shakespeare are all post-1930 and in
copyright.

**Sources:** https://playonshakespeare.org/play/macbeth/ · https://www.folger.edu/copyright-policy/ ·
https://standardebooks.org/ebooks/william-shakespeare/macbeth · https://acmrspress.com/series/play-on-shakespeare/

## Phase 4 — ratings

| dimension | weight | score | reasoning |
|---|---|---|---|
| fidelity / completeness | 40 % | **4** | All 28 scenes complete, no omissions of substance found in six samples, +7 % word count. Docked for two changed images (`tears shall drown the wind` → `tears flood like rain`), one softened source element (`blaspheming Jew`), one dropped proper noun (`Paddock`), and two collapsed distinct lines (ch21 p19/p24). |
| first-read clarity | 25 % | **5** | Uniformly clear. The Porter's jokes are *more* legible than in most print editions; the soliloquies read cleanly at first pass. |
| literary voice | 20 % | **4** | Best voice work in the batch: rhyme kept in the chants, prose/verse register distinction maintained, the sleepwalking scene's broken rhythm survives. Docked for the 1.1 paradox, the `bank and shoal of time` flattening, and the `should have died hereafter` ambiguity. |
| restraint / no invention | 10 % | **4** | One added gloss (the cat adage) and one invented simile (`tears flood like rain`). No invented motives or facts. |
| naturalness | 5 % | **5** | Reads as contemporary English throughout; no mechanical short-sentence tic. |

**Weighted score: 4.3** · **Band: Good with fixes**

Highest-scoring book in this batch.

## Recommendation

**LIGHT EDIT** · confidence **medium** · correction scope **local**

Reasoning: this is a genuinely good modern edition. No substantive omission was found in six
samples, so the bar for KEEP is nearly met — but the softened `blaspheming Jew` line is an
unlogged content change against an explicit house rule, and that rules out an unqualified KEEP.
Every other defect is a single line.

Scoped fix list:
1. **Escalate then fix** ch18 p8 `Liver of blaspheming Jew` → currently `liver of a blasphemer`. This is a product/content decision for Anders, not an agent call.
2. Restore the paradox at ch1 p2 (`When the battle's lost and won`).
3. Restore the proper noun `Paddock` (ch1 p8) and `Belzebub` (ch10 p1).
4. Restore the image at ch7 p1: `bank and shoal of time`, `sightless couriers of the air`, and especially `tears shall drown the wind` (currently an invented simile).
5. Re-render ch25 p8 so `should have died hereafter` keeps both readings.
6. Give the Doctor back his two distinct lines at ch21 p19 / p24.
7. Leave ch18 p10 identical — that is correct, not a bug.

## Limitations of this review

- I inspected **6 of 28 scenes** (ch1, ch7, ch10, ch18, ch21, ch25) — roughly 3,000 of 16,520
  source words read closely — plus mechanical coverage of all 28 scenes for paragraph alignment,
  chapter titles, apparatus debris, identical paragraphs and typography. Scenes 2–6, 8, 9, 11–17,
  19, 20, 22–24, 26–28 were **not** read line by line. "Strong in samples" is not "verified".
- Act 4 Scene 3 (England / Malcolm's testing of Macduff, 2,106 modern words — the play's longest
  scene) was **not** sampled. It is the most argumentative passage in the play and the likeliest
  remaining site of compression; it should be first in any follow-up.
- `modern-da` and `macbeth-threads.json` not audited (out of scope).
- App integration, audio manifests and reader rendering not checked.
- Rights research is desk research on published licence statements, not legal advice; no rights
  holder was contacted. Danish/EU vs US differences were not separately analysed because all
  candidates fail on plain all-rights-reserved or NonCommercial terms.
