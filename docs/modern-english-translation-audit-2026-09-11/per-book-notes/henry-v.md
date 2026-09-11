# henry-v — Henry V (William Shakespeare)

Batch B5. Reviewed 2026-09-11. Scope: **public**.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `c66a930a2d877fc7` | 23 | 883 | 26,750 | Shakespeare (1600) |
| modern-en | `f2b9cab47fef45f6` | 23 | 883 | 27,135 | Modern English |
| modern-da | `a31bc433de6026f9` | 23 | 883 | 26,991 | Moderne Dansk |

`en_editions_aligned: true`. Mean weighted similarity 0.6929; identical long paragraphs 1.8%;
no truncation, no empty paragraphs, no paragraph-count mismatches, last chapter not short.

(Registry `wordCount` says ~22,000; actual is ~26,750. Cosmetic metadata drift, noted not audited.)

## Provenance / completeness of the core English text — **one confirmed omission**

`original-en` is the Early Modern English original, from Project Gutenberg's "modernized"
Shakespeare series — almost certainly **PG #1521**, whose text I downloaded and compared: same curly
apostrophes, same scene headings with locations, same `[_Exeunt._]` convention, same `KATHARINE`
spelling. Public domain (PG lists #1521 as PD in the USA).

23 chapters = the play's 23 Act/Scene units, titled correctly
(`Act 4, Scene 1 — The English camp at Agincourt`). But:

> **The Act 1 Prologue — the Chorus's `O for a Muse of fire, that would ascend / The brightest
> heaven of invention` … `this wooden O` — is absent from BOTH `original-en` and `modern-en`.**

Verified three ways: (a) the strings `Muse of fire`, `wooden O`, `vasty fields` and `girdle of these
walls` return zero hits in either edition file; (b) ch1 begins directly with
`Enter the Archbishop of Canterbury and the Bishop of Ely.` and Canterbury's `My lord, I'll tell you,
that self bill is urg'd`; (c) the PG source #1521 **does** contain it —
`PROLOGUE.` / `Enter Chorus.` / `CHORUS. O for a Muse of fire…` sits between the dramatis personae
and `ACT I`.

So this is a **Tinct ingestion bug, not a source defect**: the chapteriser evidently keys on
`ACT n. SCENE n.` headers and discarded everything before `ACT I`, taking the Prologue with the
front matter. ~34 lines / ~270 words lost — and it is the play's framing device and its most
famous speech.

Related structural quirk (not an omission): the Act 2–5 Choruses survive but are appended to the
**end of the preceding scene's chapter** rather than heading their act — ch2 p39 (Act 2 Chorus),
ch6 p28 (Act 3), ch13 p79 (Act 4), ch21 p48 (Act 5). The Epilogue Chorus is at ch23 p87–89.

## Passages inspected (8)

### 1. Act 1, Scene 1 (ch1) — opening; lowest-similarity chapter (wsim 0.495)
Opens correctly at Canterbury/Ely, but see the Prologue omission above.

### 2. Act 1, Scene 2 (ch2) para 9 — Canterbury's Salic-law speech (478 words, the book's longest)
Source: `…nor did the French possess the Salic land Until four hundred one and twenty years After defunction of King Pharamond…`
Modern: `…nor did the French even possess the Salic land until four hundred and twenty-one years after the death of King Pharamond…`

Complete, clause by clause: every name (Pharamond, Blithild, Clothair, Childeric, Pepin, Hugh
Capet, Lingare, Charlemain, Lewis, Ermengare, Isabel), every date (426, 805) and the whole
inheritance chain survive, and the modern keeps Shakespeare's own confusion (`Charlemain` distinct
from `Charles the Great`) instead of tidying it. **Finding: strong — the hardest expository passage
in the play, handled with real restraint.**

### 3. Act 3, Scene 1 (ch7) para 1 — "Once more unto the breach"; high-register verse
Source: `Let it pry through the portage of the head Like the brass cannon; let the brow o'erwhelm it As fearfully as does a galled rock O'erhang and jutty his confounded base`
Modern: `let it pry through the gun-port of the head like the brass cannon; let the brow overhang it as fearfully as a weather-worn rock overhangs and juts above its battered base`

`portage` → `gun-port`, `galled` → `weather-worn`, `for lack of argument` → `for lack of opponents`:
each is a familiar accurate equivalent, not an explanation replacing an image. **Finding: strong.**

### 4. Act 4, Scene 3 (ch16) — St Crispin's Day; verse
`Perish the man whose mind is backward now!` → `…whose mind is hanging back now!`; Montjoy's
`so near the gulf, Thou needs must be englutted` → `so near the abyss that you must be swallowed
up`. **Finding: strong.**

### 5. Act 3, Scene 2 (ch8) paras 18–33 — the four captains (Fluellen / MacMorris / Jamy / Gower)
**This is the batch brief's dialect test, and the edition fails it.**

Source: `MACMORRIS. By Chrish, la! 'tish ill done! The work ish give over, the trompet sound the retreat. By my hand I swear, and my father's soul, the work ish ill done; it ish give over.`
Modern: `MACMORRIS. By Christ, indeed! It is ill done! The work is given over, the trumpet sounds the retreat. By my hand I swear, and by my father's soul, the work is ill done; it is given over.`

Source: `JAMY. It sall be vary gud, gud feith, gud captains bath: and I sall quit you with gud leve, as I may pick occasion; that sall I, marry.`
Modern: `JAMY. It shall be very good, good faith, good captains both—and I shall return the favor with your good leave, as I may pick the occasion. That I shall, by Mary.`

Source: `FLUELLEN. By Cheshu, he is an ass, as in the world.`
Modern: `FLUELLEN. By Jesu, he is as great an ass as any in the world.`

The Irish, Scots and Welsh voices are normalised into a single standard modern English. The scene
exists *only* for that collision of accents; Gower still says `an Irishman` and Fluellen still says
`there are not many of your nation`, so the reader is told these men are Irish, Scots and Welsh and
hears no difference whatsoever. The reading standard's requirement to preserve "distinctive voice"
and "meaningful differences in… cultural setting" is not met here.

### 6. Act 4, Scene 7 (ch20) paras 1–11 and Act 5, Scene 1 (ch22) — Fluellen, sustained
Source: `FLUELLEN. Ay, he was porn at Monmouth, Captain Gower. What call you the town's name where Alexander the Pig was born?`
Modern: `FLUELLEN. Aye, he was born at Monmouth, Captain Gower. What do you call the town where Alexander the Pig was born?`

Source: `FLUELLEN. I peseech you heartily, scurfy, lousy knave… God pless you, Anchient Pistol!` (ch22 p5,7)
Modern: `FLUELLEN. I beseech you heartily, scurvy, lousy knave… God bless you, Ensign Pistol!`

Every Welsh consonant substitution is removed (`porn`→`born`, `poys`→`boys`, `pread`→`bread`,
`prings`→`brought`, `pless`→`bless`, `peseech`→`beseech`, `petter`→`better`, `pragging`→`bragging`,
`prains`→`brain`, `sall`→`shall`, `'orld`→`world`, `ass my friend`→`as my friend`) — **except**
`Alexander the Pig`, which is kept, and Gower's answering joke `is not "pig" "great"?`, which is
kept. The result is a Fluellen who speaks standard English and then inexplicably says "Pig": the
joke is stranded because its mechanism has been deleted from every other line. This is the clearest
single symptom of the problem.

Fluellen has 68 speeches; MacMorris 10; Jamy 4. The flattening is **recurring, not local**, but it
is confined to identifiable speakers.

### 7. Act 3, Scene 4 (ch10) — Katherine's English lesson; mechanical outlier (wsim 0.218, lowest in the book)
Source: `KATHARINE. _Je te prie, m'enseignez; il faut que j'apprenne à parler. Comment appelez-vous la main en anglais?_`
Modern: `KATHERINE. _Please, teach me; I must learn to speak it. What do you call_ la main _—the hand—in English?_`

All of Katherine's and Alice's French is **replaced** by English in italics; the mangled English
words she is learning (`de hand`, `de fingres`, `d'elbow`, `de nick`, `de sin`, `de foot`, `de coun`)
are kept. The lesson still works mechanically, but the scene's bilingual texture is gone.

And at the punchline the edition breaks character to explain itself:

Source: `KATHARINE. De foot _et_ de coun! _O Seigneur Dieu! ils sont les mots de son mauvais, corruptible, gros, et impudique…_`
Modern: `KATHERINE. De foot _and_ de coun! _O Lord God!_—[the English words sound like crude French]—_they are words of evil sound, corrupt, vulgar, immodest…_`

**Finding: confirmed invention.** The bracketed clause is an editor's footnote dropped into a
character's line. Nothing corresponding exists in the source. (A gloss is defensible; putting it
inside the speech is not.)

### 8. Act 4, Scene 4 (ch17) — Pistol and Monsieur Le Fer; mechanical outlier (word ratio 1.29)
Source: `FRENCH SOLDIER. _Je pense que vous êtes le gentilhomme de bonne qualité._`
Modern: `FRENCH SOLDIER. _Je pense que vous êtes le gentilhomme de bonne qualité._—I think you are a gentleman of good quality.`

Here the French is **kept and followed by a translation**, which explains the 1.29 expansion ratio
and is the better solution. But it is the opposite policy from 3.4 forty minutes earlier in the same
play. **Finding: internal inconsistency in handling the play's French.** Pistol's own jargon
(`Signieur Dew`, `Moy shall not serve`, `I'll fer him, and firk him, and ferret him`) is preserved.

## Phase 1 flags: confirmed vs disconfirmed

- `truncated_paragraphs_total: 0`, `empty_paragraphs_total: 0`, `para_count_mismatch_total: 0` —
  **confirmed at the paragraph level**, and precisely why the Prologue omission was invisible to
  Phase 1: it is missing from *both* English editions, so they stay perfectly aligned. Mechanical
  source-vs-modern comparison cannot catch a unit dropped at ingestion.
- `ch10 wsim 0.218` (the lowest per-chapter figure in the batch) — **confirmed and explained**: it
  is the French-lesson scene, where the French was replaced by English. A real editorial decision,
  not corruption.
- `ch17 word ratio 1.29` — **confirmed and explained**: French retained *plus* appended English.
- `pct_identical_long_paragraphs: 1.8` (7 paragraphs) — **partly a defect**. Five are harmless
  already-clear lines, but two are Fluellen speeches left verbatim (`FLUELLEN. Gower is a good
  captain, and is good knowledge and literatured in the wars.`; `FLUELLEN. Eat, I pray you. Will
  you have some more sauce to your leek?…`) — which makes the surrounding normalisation of his
  dialect look even more arbitrary.
- `last_chapter_suspiciously_short: false` — **confirmed** (5.2 is 3,538 words).

## Phase 3 — human-edition research

English original; the original does not already meet the reading standard (the Salic-law speech, the
Chorus's compressed verse, and four competing dialects are all barriers).

1. **Play On Shakespeare / ACMRS Press — *Henry V*, tr. Lloyd Suh.** Complete modern-verse
   translation, in print from ACMRS Press. https://acmrspress.com/series/play-on-shakespeare/
   **Rights: permission required** (in copyright, living playwright; performance rights licensed via
   Play On; no open-access edition found — ACMRS's OA platform covers scholarly titles). Text
   **unverified**: I found no free sample to read.
2. **Folger Shakespeare digital texts** — **CC BY-NC 3.0**, commercial use excluded
   (https://www.folger.edu/copyright-policy/). Blocked; also not a modern-English rendering.
3. **Lamb, *Tales from Shakespeare*** — public domain but **does not include Henry V at all**
   (verified against the PG #573 table of contents), and is an abridged prose retelling regardless.
4. **No Fear Shakespeare / NoSweatShakespeare** — free to read, fully copyrighted. Rejected.
5. **PG #1521 / #100** — public domain, and the right place to re-ingest the source from (it has the
   Prologue). But it is modern-*spelling* Shakespeare, i.e. our `original-en`, not a substitute for
   a modern-English edition.

**Conclusion: no complete, readable, rights-clear human modern-English edition found in this
search** (not: none exists).

## Ratings

| dimension | score |
|---|---|
| fidelity / completeness (40%) | 4 |
| first-read clarity (25%) | 5 |
| literary voice (20%) | 3 |
| restraint / no invention (10%) | 4 |
| naturalness (5%) | 5 |

**Weighted score 4.1 — band: Good with fixes.**

Fidelity is 4 rather than 5 because of one precisely-identified missing unit (the Prologue) against
otherwise complete text; voice is 3 because the dialect flattening is recurring across ~80 speeches.

## Recommendation

**LIGHT EDIT** — confidence **medium-high** (8 passages, ~2,900 source words, all five acts, plus
whole-book mechanical checks for the Prologue, Choruses, `Exeunt` handling and speaker tags).

Correction scope: **substantial** — scoped, but not one-line. Three jobs:

1. **Re-ingest the source** from PG #1521 so the Act 1 Prologue is restored (and decide whether the
   Act 2–5 Choruses should head their acts rather than tail the previous scene). This also fixes
   `modern-da`, which has the same hole.
2. **Re-do the dialect speakers.** Fluellen (68 speeches), MacMorris (10), Jamy (4) need a modern
   rendering that keeps a marked voice — the Welsh p/b substitution is what makes "Alexander the
   Pig" work at all. This is a targeted re-translation of ~80 speeches, *not* a retranslation of the
   play; the verse and the expository prose are excellent and should not be touched.
3. **Remove the bracketed gloss** inside Katherine's speech at 3.4 p33 and make the French policy
   consistent with 4.4 (keep the French, append the English).

I deliberately did **not** recommend RETRANSLATE: the defects are recurring but confined to
identifiable speakers and one ingestion bug, and a full retranslation would throw away genuinely
first-rate work on the Choruses, the Salic-law speech, Agincourt and the wooing scene.

## Limitations of this review

- 8 of 883 paragraphs read closely (~11% of the book by words). Act 2 (the Eastcheap scenes,
  Bardolph/Nym/Pistol, the Southampton conspiracy) and Act 4 Scene 1 (Henry in disguise with
  Williams and Bates) were scanned mechanically but not read line by line against the source.
- I did not read the full wooing scene (5.2), only its opening and its mechanical outliers.
- `modern-da` not reviewed, though it certainly shares the Prologue omission (883 aligned paragraphs).
- The claim that the Prologue loss is an ingestion bug rests on comparing our file with PG #1521; I
  did not inspect Tinct's actual ingestion script.
- Rights research is desk research; no legal opinion, no EU/Denmark-specific counsel.
