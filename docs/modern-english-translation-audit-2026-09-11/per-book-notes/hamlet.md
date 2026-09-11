# hamlet — Hamlet (William Shakespeare, 1600)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (Shakespeare batch)

## Edition snapshot (from Phase 1 `mechanical/hamlet.json`)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en (Original Text) | `77f9bf6e33516a71` | 20 | 1391 | 31,621 |
| modern-en (Modern English) | `b355830766b69681` | 20 | 1391 | 30,903 |
| modern-da (Moderne Dansk) | `fea31e2b8d327f0f` | 20 | 1391 | 31,375 |

`en_editions_aligned: true`, no paragraph-count mismatches, mean weighted similarity 0.3864
(solidly in real-rewrite range), 0.0 % identical long paragraphs, 1 truncation candidate
(ch7 p4), 0 empty paragraphs, last chapter not flagged short.

## Provenance / completeness of the core English text

- Core key is `original-en` — Shakespeare's own text, an English original. No translator.
- Registry (`app/src/data/bookRegistry.ts` L202-235) carries no `translator`, `year`, or source
  attribution for the original-en text. **Provenance is undocumented.** Typographic evidence
  (curly apostrophes `’`, 144 em dashes, `Ff`-free text, `[Aside.]` bracket style) puts it in the
  same source family as macbeth / midsummer / romeo-and-juliet, and distinct from the-tempest.
- Complete: all 20 scenes, Act 1 Scene 1 through Act 5 Scene 2, present in all three editions.
- **Verse is not lineated.** The original-en edition already collapses each speech into a single
  prose paragraph with capitalised line-starts ("For this relief much thanks. ’Tis bitter cold,
  And I am sick at heart."). modern-en drops even those capitals. So neither edition presents
  Hamlet as verse. This is an edition-format constraint, not a modern-en defect, but it caps how
  much "verse rhythm" any modern-en can preserve.

## Structure check (books/AGENTS.md Shakespeare failure mode)

Ran the apparatus scan from `books/AGENTS.md`: **0 apparatus/stub suspects** in either English
edition. All 20 chapter titles are clean reader-facing labels of the form
`Act 1, Scene 1 — Elsinore. A Platform Before the Castle`. Sections are `Act 1`…`Act 5`.
No `] SCENE 6. Pope`, `SCENA QUARTA Ff`, `Capell`, `conj.`, `om.` or bracket debris.
**Disconfirmed** for this book.

Speaker-tag / stage-direction convention (books/AGENTS.md L152): **followed**. modern-en keeps
`HAMLET.`, `[Enter Horatio and Marcellus]`, `[Exeunt.]`, and inline modifiers
`[Aside.]`, `[Within.]`, `[Behind.]`, `[Reads.]`, `[To the King.]`, `[Scattering flowers.]`,
`[Grappling with him.]` verbatim.

## Samples inspected (6)

### 1. Opening — Act 1 Scene 1, paras 0–25

Strong. Register and rhythm survive; the sentry exchange is crisp.

- SRC p2: `FRANCISCO. Nay, answer me. Stand and unfold yourself.`
- MOD p2: `FRANCISCO. No — you answer me first. Stop and identify yourself.`

**Finding (minor voice loss), p22:**
- SRC: `HORATIO. A piece of him.`
- MOD: `HORATIO. More or less.`

The source line is a small joke (Horatio is so cold that only part of him turned up). "More or
less" is idiomatic modern English but it is a generic filler that erases the image. A rendering
like "Part of me, anyway." would keep both.

### 2. Act 2 Scene 2, paras 0–11 — **the Phase 1 truncation flag (ch7 p4)**

Flagged pair:
- SRC p4: `GUILDENSTERN. We both obey, And here give up ourselves, in the full bent, To lay our service freely at your feet To be commanded.` (24 words)
- MOD p4: `GUILDENSTERN. We both obey. We're completely at your service, ready to be commanded.` (13 words)

**Verdict: the truncation flag is disconfirmed as a truncation.** No clause of substance is lost;
the "lay our service at your feet" image is compressed into "completely at your service". A
length ratio of 0.54 here is compression, not omission.

However, the surrounding paragraphs show the real pattern — **small dropped elements**:

- SRC p2: `…As to expend your time with us awhile, For the supply and profit of our hope, Your visitation shall receive such thanks…`
- MOD p2: `…If you'd be kind enough to spend some time with us, your visit will receive the kind of thanks…`
  → `For the supply and profit of our hope` (Gertrude's motive clause) is gone.

- SRC p7: `GUILDENSTERN. Heavens make our presence and our practices Pleasant and helpful to him.`
- MOD p7: `GUILDENSTERN. May heaven make our presence helpful to him.`
  → `and our practices` and `Pleasant` both dropped; two of the four elements survive.

This is consistent with modern-en running **718 words shorter than the source** (30,903 vs
31,621) — the only book in this batch where the modern edition is shorter than the original. In
the other four plays modern-en runs 2–7 % longer, which is what an honest modernization normally
does.

### 3. Act 3 Scene 1, paras 20–33 — "To be, or not to be" (high-register verse)

The soliloquy is rendered completely and accurately; no line is skipped.

- SRC p23: `…And enterprises of great pith and moment, With this regard their currents turn awry And lose the name of action.`
- MOD p23: `…and plans of great importance lose their momentum and never become action.`
  → The `currents turn awry` image is replaced by an explanation, and `With this regard`
  (i.e. *because of this consideration*) is dropped, breaking the logical link back to the
  "pale cast of thought".

- SRC p23: `Soft you now, The fair Ophelia! Nymph, in thy orisons Be all my sins remember’d.`
- MOD p23: `But wait — here comes the beautiful Ophelia! — In your prayers, remember all my sins.`
  → `Nymph` (Hamlet's form of address to Ophelia) is dropped entirely.

**Finding (pun resolved to one sense), p29/p33:**
- SRC p29: `HAMLET. Ha, ha! Are you honest?` / p33: `…if you be honest and fair, your honesty should admit no discourse to your beauty.`
- MOD p29: `HAMLET. Ha! Are you virtuous?` / p33: `…if you're both virtuous and beautiful, your virtue should have nothing to do with your beauty.`

"Honest" in this scene means both *truthful* and *chaste*, and the whole nunnery exchange turns on
the double sense. modern-en picks "virtuous" and the reader loses the truth-telling half. This is
the kind of now-invisible wordplay the brief says a modern edition should *clear up*, not
silently resolve.

### 4. Act 4 Scene 5, paras 10–23 — Ophelia's mad songs

Adequate. Rhyme partly survives (`gone`/`stone` at p16) and partly does not (`one`/`shoon`
becomes `one`/`sandals` at p12). `cockle hat and staff` is correctly glossed to
`pilgrim's hat and his walking staff`. No omission.

### 5. Act 5 Scene 1, paras 0–29 — the gravediggers (low-register comic prose)

Best-handled comic scene in the batch structurally: prose stays prose, the `argal` syllogisms
survive, `se offendendo` is kept, `gallows-maker … outlives a thousand tenants` lands.

**Finding (flattened joke — the scene's opening line), p1:**
- SRC: `FIRST CLOWN. Is she to be buried in Christian burial, when she wilfully seeks her own salvation?`
- MOD: `FIRST CLOWN. Is she getting a Christian burial when she deliberately went and drowned herself?`

The Clown's malapropism — *salvation* for *damnation* — is the joke that establishes his whole
mode of speech, and modern-en replaces it with a plain literal statement. Nothing signals to the
reader that a joke was there.

**Finding (proper noun dropped), p26:**
- SRC: `Go, get thee to Yaughan; fetch me a stoup of liquor.`
- MOD: `Now go — get yourself to the pub and fetch me some beer.`
  → `Yaughan` (the named alehouse keeper) is erased. `books/AGENTS.md` L146 says
  "Preserve proper nouns, allusions, quotations".

### 6. Act 5 Scene 2, paras 150–175 — ending

Complete through the final stage direction. `[A dead march.]` and
`[Exeunt, bearing off the bodies, after which a peal of ordnance is shot off.]` both present.
Horatio's "flights of angels" and Hamlet's "The rest is silence" preserved intact.

**Finding (pun resolved), p151:**
- SRC: `Here, thou incestuous, murderous, damned Dane, Drink off this potion. Is thy union here?`
- MOD: `Here, you incestuous, murderous, damned Dane — drink this potion! Is your precious pearl in there?`
  → `union` means both *the pearl Claudius dropped in the cup* and *the marriage to Gertrude*.
  modern-en keeps only the pearl, so Hamlet's jab at the marriage vanishes.

**Finding (small over-explanation), p173:**
- SRC: `Such a sight as this Becomes the field, but here shows much amiss.`
- MOD: `A sight like this belongs on a battlefield, not here — it looks terribly wrong in a court.`
  → `in a court` is added; the source says only "here".

## Phase 1 flags: confirmed vs disconfirmed

| flag | verdict |
|---|---|
| `truncated_paragraphs` ch7 p4 (ratio 0.54) | **Disconfirmed as truncation.** Compression of an image, no clause of substance lost. |
| `pct_identical_long_paragraphs: 0.0` | Confirmed. My own scan (≥15 words, normalised quotes) found zero identical long paragraphs. |
| `last_chapter_suspiciously_short: false` | Confirmed — Act 5 Scene 2 is 3,467 modern words. |
| `en_editions_aligned: true` | Confirmed — 1391 = 1391 paragraphs, every scene index matches. |
| Shakespeare apparatus-debris failure mode | **Disconfirmed** — 0 suspects, all 20 titles clean. |

## Phase 3 — human-edition research

**Question for an English original:** does the source already meet the reading standard?
**No.** Early Modern English in Hamlet is a genuine barrier — `argal`, `crowner's quest law`,
`fardels`, `bare bodkin`, `quietus`, `orisons`, `sith`, second-person `thou/thee` inflection.
A thoughtful modern adult without annotation loses real content. A modern edition is justified.

**Is there a rights-clear human edition that already does the modernization?**

| candidate | what it is | rights | verdict |
|---|---|---|---|
| **Play On Shakespeare / ACMRS Press** — *Hamlet*, modern-verse translation by **Lisa Peterson** (commissioned 2015-, published by ACMRS Press) | The best human modernization that exists: complete, line-by-line, in verse, by a working playwright | **Permission required.** playonshakespeare.org footer: "© 2026 Play On Shakespeare. All Rights Reserved."; access is by per-production script request. ACMRS Press page states no CC licence and directs rights questions to acmrs@asu.edu. | **Rejected — rights.** Not usable without a negotiated licence. |
| **Folger Shakespeare** (Folger Digital Texts) | Modern **spelling** + notes, not modern English. Shakespeare's own words. | **CC BY-NC 3.0** — folger.edu/copyright-policy: "you may not use the material from Folger Digital Texts for commercial purposes". | **Rejected — twice.** NC blocks a paid product ($3/mo Premium), and it is not a modernization anyway. |
| **Standard Ebooks** — *Hamlet*, from Clark & Wright's 1887 Victoria/Globe text | Original language, modern spelling, clean typography, no apparatus. SE's own additions are **CC0**; source text US-PD. | **Public domain / CC0.** | **Not a modern-en candidate** — it is original-language. **But it is a strong candidate to replace `original-en`**, which currently has undocumented provenance. |
| **Lamb, *Tales from Shakespeare*** (1807, PG #20657) | Narrative prose retelling. Verified opening: "There was a certain island in the sea…" — no speeches, heavily abridged. | Public domain. | **Rejected — incomplete.** Fails "every scene, joke and image must survive". |
| **Nesbit, *Beautiful Stories from Shakespeare*** (1907, PG #1430) | Same category — retelling for young readers. | Public domain. | **Rejected — incomplete.** |
| No Fear Shakespeare (SparkNotes), Shakescleare (LitCharts), NoSweatShakespeare, Shakespeare Retold, Fluid Shakespeare | Complete line-by-line modern-English parallel texts, free to read | All commercial sites, all-rights-reserved. Free online reading does **not** grant reuse. | **Rejected — rights.** |
| PlayShakespeare.com | Original-language edited texts + notes; search results indicate GFDL | Rights page returned HTTP 403 to WebFetch — **unverified**. Not a modernization regardless. | Not applicable. |

**Conclusion:** *no complete, rights-clear, human modern-English Hamlet exists in this search.*
This is "none found in this search" **and**, for the public-domain corpus specifically, close to
"none exists" — every modernization of Shakespeare into contemporary English was made after 1930
and is in copyright. The AI modern-en is filling a real gap, not duplicating available work.

**Sources:** https://www.folger.edu/copyright-policy/ · https://playonshakespeare.org/play/hamlet/ ·
https://acmrspress.com/series/play-on-shakespeare/ · https://standardebooks.org/ebooks/william-shakespeare/hamlet ·
https://www.gutenberg.org/files/20657/20657-h/20657-h.htm

## Phase 4 — ratings

| dimension | weight | score | reasoning |
|---|---|---|---|
| fidelity / completeness | 40 % | **4** | Nothing structural missing; all 20 scenes and every stage direction present. But confirmed small dropped elements (`For the supply and profit of our hope`, `and our practices`, `Pleasant`, `Nymph`, `Yaughan`, `With this regard`) and a net −718 words against the source. Local, repeatable, not systemic. |
| first-read clarity | 25 % | **5** | Consistently clear on first pass. Archaic vocabulary and syntax genuinely resolved; no residual Early Modern English in inspected passages. |
| literary voice | 20 % | **3** | Register differentiation works (Porter-class prose vs. court verse). But three named jokes/puns flattened — the gravedigger's *salvation/damnation* malapropism, *honest*, *union* — and images replaced by explanation in the soliloquy. Recurring across samples. |
| restraint / no invention | 10 % | **4** | No invented motives or facts. One small unsupported addition (`in a court`, ch20 p173). |
| naturalness | 5 % | **5** | Reads as contemporary English prose without tics or mechanically short sentences. |

**Weighted score: 4.1** · **Band: Good with fixes**

## Recommendation

**LIGHT EDIT** · confidence **medium** · correction scope **local**

Reasoning: the defects are individually identifiable and bounded — roughly a dozen lines across
30,900 words. Retranslation is not warranted; the prose quality is high and the rewrite is real
(similarity 0.3864). A confirmed omission of substance would rule out an unqualified KEEP, and the
dropped clauses at ch7 p2/p7 plus the dropped proper noun at ch19 p26 are exactly that, so KEEP is
not available either.

Scoped fix list:
1. Restore dropped clauses: ch7 p2 `For the supply and profit of our hope`; ch7 p7 `and our practices` / `Pleasant`; ch8 p23 `Nymph` and `With this regard`.
2. Restore proper noun `Yaughan` (ch19 p26).
3. Re-render three wordplay points so the double sense is visible to a modern reader rather than resolved away: ch19 p1 (*salvation* for *damnation*), ch8 p29/p33 (*honest*), ch20 p151 (*union*).
4. Drop the added `in a court` at ch20 p173.
5. Separately, consider re-basing `original-en` on the Standard Ebooks / Clark & Wright text so the source edition has documented provenance. Not required to fix modern-en.

## Limitations of this review

- I inspected **6 of 20 scenes** (ch1, ch7, ch8, ch16, ch19, ch20) — roughly 1,400 of 31,621
  source words read closely, plus full mechanical coverage of paragraph alignment, chapter titles,
  apparatus debris, identical-paragraph scan, and typographic scan across all 20 scenes.
  "Strong in samples" is not "the whole book is verified." Scenes 2–6, 9–15, 17, 18 were **not**
  read line by line.
- I did **not** audit `modern-da` (out of scope for this batch) or `hamlet-threads.json`.
- I did **not** verify the app-integration checklist (chapter nav, split-pane alignment in the
  reader, audio manifests).
- Rights research is desk research on published licence statements, not legal advice. I did not
  contact ACMRS, Folger, or any rights holder. Danish/EU vs US jurisdictional differences for
  post-1930 translations were not separately analysed — the candidates all fail on plain
  all-rights-reserved terms, so the jurisdictional question does not arise.
- PlayShakespeare.com's licence page returned HTTP 403; its GFDL status is **unverified** (it is
  an original-language edition regardless).
