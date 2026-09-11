# midsummer — A Midsummer Night's Dream (William Shakespeare, 1595)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (Shakespeare batch)

## Edition snapshot (from Phase 1 `mechanical/midsummer.json`)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en (Original Text) | `9ddba0b7d8617c6c` | 9 | 641 | 17,017 |
| modern-en (Modern English) | `f9eca722e0488f7a` | 9 | 641 | 17,813 |
| modern-da (Moderne Dansk) | `5b516f16b544ccb0` | 9 | 641 | 17,596 |

`en_editions_aligned: true`, no paragraph-count mismatches, mean weighted similarity 0.3873
(real-rewrite range), 0.7 % identical long paragraphs, 0 truncations, 0 empty paragraphs, last
chapter not flagged. modern-en runs **+796 words (+4.7 %)** over the source.

## Provenance / completeness of the core English text

- Core key `original-en`; English original, no translator. Registry
  (`app/src/data/bookRegistry.ts` L276-309) records no source attribution — **provenance
  undocumented**.
- Same source family as hamlet / macbeth / romeo-and-juliet: curly apostrophes (347), em dashes
  (28), `[Waking.]` / `[Reads]` bracket style, `blessèd` / `unearnèd` grave accents preserved.
- Complete: all 9 scenes, Act 1 Scene 1 through Act 5 Scene 1 (including Puck's epilogue, which
  sits inside ch9 rather than as a separate unit — correct for this play).
- Verse is **not lineated**: each speech is one prose paragraph in original-en with capitalised
  line-starts; modern-en drops the capitals. This is the edition format for the whole batch.

## Structure check (books/AGENTS.md Shakespeare failure mode)

Apparatus scan: **0 apparatus/stub suspects.** All 9 titles are clean reader-facing labels
(`Act 2, Scene 1 — A Wood near Athens`, `Act 4, Scene 2 — Athens. A Room in Quince's House`).
Sections `Act 1`…`Act 5`. **Disconfirmed** for this book.

Speaker tags / stage directions: **convention followed.** `BOTTOM.`, `[Enter Quince, Snug, Bottom,
Flute, Snout  and Starveling.]`, `[Exeunt.]`, and inline `[Waking.]`, `[Starting.]`, `[Reads]`,
`[Sings.]` all preserved verbatim. Note a pre-existing double space inside the Act 1 Scene 2
entrance direction, identical in both editions — cosmetic, inherited from source.

## Samples inspected (5)

### 1. Act 1 Scene 2, paras 0–23 — the mechanicals casting the play (low-register comic prose)

Prose stays prose and the comedy works. Flute's beard, Bottom's demand to play every part,
Quince's list — all intact. The Ercles rant even **keeps its rhyme**:

- SRC p12: `The raging rocks And shivering shocks Shall break the locks Of prison gates`
- MOD p12: `The raging rocks and shivering shocks shall break the locks of prison gates`

That matters for the verdict below: rhyme preservation is clearly within this edition's ability.

**Finding (characterizing malapropisms erased), p12 — twice in one speech:**
- SRC: `I could play **Ercles** rarely… And **Phibbus’ car** Shall shine from far… This is **Ercles’** vein, a tyrant’s vein`
- MOD: `I could play **Hercules** brilliantly… and the **sun god's chariot** shall shine from far… That was the **Hercules** style — a tyrant's style`

Bottom mangling classical names is one of the two things that characterize him (the other is
mangling abstract nouns). `Ercles` for *Hercules* and `Phibbus* for *Phoebus* are his mistakes,
not the text's archaism. modern-en silently corrects them, so the modern reader meets a Bottom who
speaks correctly and is therefore simply boastful rather than funny. `books/AGENTS.md` L144 —
"Do not soften period language or add editorial corrections" — and L146 — "Preserve proper nouns,
allusions" — both point the other way.

(For contrast, modern-en *does* keep Bottom's scrambled-senses joke at ch7 p66 —
`No human eye has heard, no human ear has seen, no human hand can taste` — so the failure is
specific to the names, not to his voice generally.)

### 2. Act 2 Scene 1, paras 20–31 — Oberon and Puck; Helena and Demetrius (high-register verse)

The mermaid/Cupid speech is complete and accurate; `love-in-idleness` is kept and the
milk-white-to-purple flower survives.

**Finding (two distinct epithets merged), p23:**
- SRC: `a certain aim he took At a **fair vestal**, thronèd by the west… And the **imperial votress** passed on, In maiden meditation, fancy-free.`
- MOD: `He took careful aim at a **beautiful, royal maiden** seated in the west… and the **royal maiden** passed on untouched, lost in innocent thoughts, free from love.`

The source names her twice, differently — *vestal* (virgin priestess) then *imperial votress*
(a crowned woman under a vow) — and the escalation is the point of the compliment. modern-en uses
the same three words both times. Both the variation and the religious register are gone.

**Finding (metaphor demoted to simile, specific image made generic), p31:**
- SRC: `**I am your spaniel**; and, Demetrius, The more you beat me, I will fawn on you. Use me but as your spaniel, spurn me, strike me…`
- MOD: `**I'm like your dog**, Demetrius. The more you beat me, the more I'll be devoted to you. Treat me like your dog — push me away, kick me…`

Helena *is* the spaniel, she does not say she is like one; and a spaniel is specifically the
fawning breed, which is why the insult to herself lands. "Dog" twice is generic.

**Good:** `you hard-hearted adamant` → `you hard-hearted magnet` (p29) is exactly the right kind of
gloss — the iron/steel conceit that follows still works.

### 3. Act 3 Scene 2, paras 88–103 — the four lovers' quarrel (mixed register)

Accurate and lively; Hermia's height insults and Helena's exit joke all land.

**Finding (unglossed dead allusion), p92:**
- SRC: `Get you gone, you dwarf; You minimus, of **hind’ring knot-grass** made; You bead, you acorn.`
- MOD: `Get out of here, you dwarf! You tiny thing, made from **knotgrass**! You bead! You acorn!`

Knotgrass was believed to *stunt growth* — that is the whole insult. Dropping `hind'ring` without
substituting a gloss leaves the modern reader with a plant name and no joke. This is the inverse
of the over-explanation problem: a place where a brief gloss was genuinely needed and is absent.

### 4. Act 4 Scene 1, paras 60–67 — Bottom's dream (prose)

Excellent, and the best single paragraph in the book:

- SRC p66: `The eye of man hath not heard, the ear of man hath not seen, man’s hand is not able to taste, his tongue to conceive, nor his heart to report, what my dream was.`
- MOD p66: `No human eye has heard, no human ear has seen, no human hand can taste, no human tongue can imagine, and no human heart can express what my dream was.`

The scrambled-senses joke is fully preserved. `Man is but an ass` → `a complete donkey` loses the
pun with Bottom's ass-head, but "donkey" at least keeps the animal.

**Finding (small over-explanation), p66:** `because it hath no bottom` → `because it has no
bottom — no explanation`. The added gloss explains the pun on his own name and thereby kills it.

### 5. Act 5 Scene 1, paras 30–51 and 126–133 — Pyramus and Thisbe, and Puck's epilogue

**This is the book's largest defect and the reason for the voice rating.**

The Pyramus-and-Thisbe interlude is written in deliberately terrible rhymed doggerel. *The bad
verse is the joke.* Theseus, Hippolyta and Lysander spend the surrounding lines explicitly
commenting on its metrics ("He hath rid his prologue like a rough colt; he knows not the stop").
modern-en renders the entire interlude as **unrhymed prose**, so the running gag has nothing to
attach to:

- SRC p43: `O grim-look’d night! O night with hue so black! O night, which ever art when day is not! O night, O night, alack, alack, alack, I fear my Thisbe’s promise is forgot!`
- MOD p43: `Oh, grim-looking night! Oh, night so black! Oh, night, which always comes when day does not! Oh, night, oh night — alas, alas, alas! I'm afraid my Thisbe has forgotten her promise!`

- SRC p49: `My cherry lips have often kiss’d **thy stones**, Thy stones with lime and hair knit up in **thee**.`
- MOD p49: `My cherry lips have often kissed **your stones** — your stones held together with plaster and mortar.`

The same happens to Puck's rhymed epilogue:
- SRC p132: `If we shadows have offended, Think but this, and all is mended, That you have but slumber’d here While these visions did appear.`
- MOD p132: `If we actors have offended you, just think of it this way, and everything will be fine: you were only sleeping here while these visions appeared.`

Given that macbeth's cauldron chants and this book's own Ercles rant both keep their rhyme, this
is **inconsistent application**, not a stated policy.

**Finding (meaning changed), p30:**
- SRC: `A good moral, my lord: it is not enough to speak, but to **speak true**.`
- MOD: `A good lesson, my lord: it's not enough to speak — you have to **speak clearly**.`
  → `true` is not `clearly`. Lysander's line is about honesty; modern-en makes it about diction.

**Finding (pun flattened), p40:**
- SRC: `It is the wittiest **partition** that ever I heard discourse, my lord.`
- MOD: `It's the wittiest **wall** I've ever heard speak, my lord.`
  → *partition* means both a wall and a section of a speech; that is the entire joke.

**Good:** `I see a voice; now will I to the chink, To spy an I can hear my Thisbe’s face`
(p50) is kept verbatim in sense — `I see a voice! … see if I can hear my Thisbe's face` — the one
scrambled-senses joke in the interlude that does survive.

## Phase 1 flags: confirmed vs disconfirmed

| flag | verdict |
|---|---|
| `pct_identical_long_paragraphs: 0.7` | **No defect found.** My ≥15-word normalised scan returned zero identical long paragraphs; the flagged ones are short exclamations and character-name lines (`PEASEBLOSSOM. Peaseblossom.`) that need no change. |
| `truncated_paragraphs_total: 0` | Confirmed. |
| `empty_paragraphs_total: 0` | Confirmed. |
| `last_chapter_suspiciously_short: false` | Confirmed — Act 5 Scene 1 is 3,451 modern words and contains the epilogue. |
| `en_editions_aligned: true` | Confirmed — 641 = 641 paragraphs across 9 scenes. |
| Shakespeare apparatus-debris failure mode | **Disconfirmed** — 0 suspects, all 9 titles clean. |

## Phase 3 — human-edition research

**Does the source already meet the reading standard?** No — and less obviously than for the
tragedies, which is the trap. The plot is easy, so a reader glides past `wode within this wood`,
`hind'ring knot-grass`, `condole`, `aby it`, `cheek by jole`, `coil is long of you` without
noticing what they missed. A modern edition is justified.

**Rights-clear human modernization?** Same corpus-level answer as the rest of the batch:

| candidate | what it is | rights | verdict |
|---|---|---|---|
| **Play On Shakespeare / ACMRS Press** — *A Midsummer Night's Dream*, modern-verse translation by **Jeff Whitty** | Complete line-by-line modern verse; would very likely solve exactly this book's rhyme problem, since the commission brief required preserving "rhyme, rhythm, metaphor, meter" | **Permission required.** playonshakespeare.org: "© 2026 Play On Shakespeare. All Rights Reserved."; obtainable only via script request. ACMRS Press states no CC licence. | **Rejected — rights.** Worth noting as the single most relevant unavailable candidate in this batch. |
| **Folger Shakespeare** digital text | Modern **spelling** + notes, not modern English | **CC BY-NC 3.0**; commercial use prohibited | **Rejected** — NC blocks a paid product; not a modernization. |
| **Standard Ebooks** — *A Midsummer Night's Dream* | Original language, modern spelling, clean; SE additions CC0, source US-PD | **Public domain / CC0** | **Not a modern-en candidate**; viable `original-en` replacement. |
| Lamb (1807, PG #20657), Nesbit (1907, PG #1430) | Abridged narrative retellings; both include this play | Public domain | **Rejected — incomplete.** Lamb verified: narrative prose, no speeches. |
| No Fear Shakespeare, Shakescleare, NoSweatShakespeare, Shakespeare Retold | Complete modern parallel texts, free to read | All-rights-reserved | **Rejected — rights.** |

**Conclusion:** none found in this search; for the public-domain corpus this is effectively "none
exists".

**Sources:** https://playonshakespeare.org/our-translations/ · https://www.folger.edu/copyright-policy/ ·
https://standardebooks.org/ebooks/william-shakespeare · https://www.gutenberg.org/files/20657/20657-h/20657-h.htm ·
https://playbill.com/article/36-playwrights-named-to-translate-shakespeare-plays-into-modern-english-see-whos-doing-midsummer-nights-dream-com-364827

## Phase 4 — ratings

| dimension | weight | score | reasoning |
|---|---|---|---|
| fidelity / completeness | 40 % | **4** | No scene, speech or paragraph missing; +4.7 % word count. Docked for one changed meaning (`speak true` → `speak clearly`), two merged epithets (`vestal` / `imperial votress`), and dropped modifiers (`hind'ring`, `spaniel`). All local. |
| first-read clarity | 25 % | **5** | Very clear. The lovers' quarrel and the mechanicals' prose are easier to follow here than in most annotated print editions. |
| literary voice | 20 % | **2** | The lowest voice score in the batch, and deservedly. The play-within-the-play — the comic climax, ~40 paragraphs — loses the rhymed doggerel that *is* its joke, while the surrounding characters keep mocking its versification. Puck's rhymed epilogue goes the same way. Bottom's malapropisms are corrected away. Two puns flattened (`partition`, `bottom`). This is a pattern across samples, not one bad passage. |
| restraint / no invention | 10 % | **4** | No invented facts or motives. One over-explaining gloss (`no bottom — no explanation`). |
| naturalness | 5 % | **5** | Fluent contemporary English throughout. |

**Weighted score: 3.9** · **Band: Good with fixes**

## Recommendation

**LIGHT EDIT** · confidence **medium** · correction scope **local**

Reasoning: fidelity and clarity are genuinely good and the prose comedy is well handled, so
RETRANSLATE would throw away real work. But the voice defect is a *pattern*, not a one-off, and it
is concentrated in the single most important comic sequence in the play — so KEEP is not
available. I call the scope **local** because the damage is bounded to an identifiable block
(Act 5 Scene 1's interlude plus the epilogue) and about six scattered lines elsewhere, not because
the block is small; re-rhyming ~40 paragraphs is a real piece of work.

Scoped fix list, in priority order:
1. **Re-render the Pyramus-and-Thisbe interlude (ch9, roughly paras 34–125) in rhyme.** Deliberately clumsy rhyme — the target is doggerel, not good verse. Without this the surrounding mockery of the verse is unmotivated.
2. Re-render Puck's epilogue (ch9 p132) and the fairies' blessing (ch9 p127–130) in rhyme.
3. Restore Bottom's malapropisms `Ercles` and `Phibbus` (ch2 p12), with a light in-line signal rather than a correction.
4. Fix ch9 p30 `speak true` (currently `speak clearly`).
5. Restore the `partition` pun (ch9 p40) and remove the name-pun gloss at ch7 p66.
6. Restore `vestal` / `imperial votress` as two distinct epithets (ch3 p23) and `spaniel` as a metaphor (ch3 p31).
7. Gloss `hind'ring knot-grass` (ch6 p92) so the insult means something.

## Limitations of this review

- I inspected **5 of 9 scenes** (ch2, ch3, ch6, ch7, ch9) — roughly 2,400 of 17,017 source words
  read closely — plus mechanical coverage of all 9 scenes for alignment, titles, apparatus,
  identical paragraphs and typography. Act 1 Scene 1 (Theseus/Egeus/Hermia, 1,997 source words),
  Act 2 Scene 2, Act 3 Scene 1 (the rehearsal and Bottom's transformation — likely to contain more
  malapropisms of the kind flagged above) and Act 4 Scene 2 were **not** read line by line.
  **Act 3 Scene 1 should be checked first in any follow-up**, since it is the other Bottom-heavy
  scene and the malapropism finding probably repeats there.
- `modern-da` and `midsummer-threads.json` not audited (out of scope).
- App integration, split-pane alignment and audio not checked.
- Rights research is desk research on published licence statements, not legal advice; no rights
  holder contacted. Danish/EU vs US analysis not performed — all candidates fail on plain
  all-rights-reserved or NonCommercial terms, so the jurisdictional question does not arise.
- I did not verify the Jeff Whitty attribution against a primary ACMRS/Play On page; it comes from
  a Playbill report of the commission announcement. Treat the translator name as
  **reported, not primary-verified**. The rights conclusion does not depend on it.
