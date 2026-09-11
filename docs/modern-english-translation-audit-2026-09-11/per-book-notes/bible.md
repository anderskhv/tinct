# bible — "The Bible" (Various)

Audit batch **B3** (dedicated batch). Reviewer: audit agent, 2026-09-11.
Snapshot commit `cdb6d8b9ee90f0c1d2e6cbab1f4c55b371cd0611`.

**Review work only.** No file under `app/public/data/editions/`, `app/src/`, or
`books/` was modified.

---

## 1. Edition snapshot (from Phase 1 `mechanical/bible.json`)

| edition | label | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|---|
| `kjv-en` (core) | King James Version (1611) | `53823ea3d19a3d7b` | 1189 | 6704 | 820,729 |
| `web-en` | World English Bible | `46d206635dc79214` | 1189 | 6704 | 797,787 |
| `modern-en` | Modern English | `1e0c8eae139ce08e` | 1189 | 6704 | 753,765 |
| `modern-da` | Moderne Dansk | `141efc6a8d57f702` | 1189 | 6704 | 666,507 |

Phase 1 comparison (kjv-en → modern-en): chapter counts match, **0** paragraph-count
mismatches, `en_editions_aligned: true`, mean weighted similarity **0.424** (lowest of
all 101 books), **71** truncated paragraphs, 0 identical long paragraphs, 0 empty
paragraphs, last chapter not suspiciously short.

Stray files `bible-modern-en-ch2/3/4/5/34/37.json` are dead batch-generation artifacts
(already recorded by the orchestrator). Ignored throughout; only the four real editions
above were compared.

## 2. Canon scope — confirmed

Walked the `sections` tree of `bible-kjv-en.json` in code. It contains exactly **66
books**, Genesis → Revelation, 1189 chapters, arranged Old Testament (Pentateuch /
Historical / Wisdom & Poetry / Prophets) + New Testament. **This is the Protestant
canon.** No Tobit, Judith, Wisdom, Sirach, Baruch, 1–2 Maccabees, or the Greek additions
to Esther/Daniel. `web-en`, `modern-en` and `modern-da` carry the identical 66-book
structure.

This is a legitimate canon choice, **not** an omission bug. But it *is* a real,
user-facing scope limitation: a Catholic reader expects 73 books, an Eastern Orthodox
reader more still. `bookRegistry.ts` `BIBLE.description` currently reads:

> "The foundational text of Western civilization. **66 books** spanning creation, law,
> history, poetry, prophecy, gospels, and revelation …"

So the count is disclosed but the tradition is not named. A reader has to know that
"66 books" means "Protestant" to decode it. **Recommended (cheap, non-blocking):** say
"the 66-book Protestant canon" explicitly in the description and/or the onboarding
About text. Logged as a content/scope item, not a defect.

Note the upstream WEB project at ebible.org *does* publish a Deuterocanon/Apocrypha
edition alongside the 66-book variant, so a future Catholic/Orthodox scope expansion has
a rights-clear source available if Tinct ever wants it.

---

## 3. THE HEADLINE FINDING — `modern-en` is the NIV (2011), verbatim

The single most important result of this review is not an editorial one.

Tinct's `bible-modern-en.json` is not an independent modernisation of the KJV. In every
complete passage I sampled, it reproduces the **New International Version (2011)**
word for word, including renderings that are distinctive to the NIV and found in no
public-domain translation. I verified the NIV wording against Bible Gateway rather than
from memory.

| location | Tinct `modern-en` | NIV 2011 (biblegateway.com) |
|---|---|---|
| Psalm 23:1 | "The LORD is my shepherd; I lack nothing." | "The Lord is my shepherd, I lack nothing." |
| Psalm 23:3–4 | "he refreshes my soul. He guides me along the right paths for his name's sake. Even though I walk through the darkest valley…" | identical |
| Psalm 23:6 | "Surely your goodness and love will follow me all the days of my life…" | identical |
| Amos 5:11 | "You levy a **straw tax** on the poor and impose a tax on their grain. Therefore, though you have built **stone mansions**… though you have planted **lush vineyards**…" | identical |
| 1 Cor 13:3 | "If I give all I possess to the poor and **give over my body to hardship that I may boast**…" | identical |
| 1 Cor 13:5 | "It does not dishonor others, it is not self-seeking, it is not easily angered, **it keeps no record of wrongs**." | identical |
| Luke 15:20 | "…he ran to his son, **threw his arms around him** and kissed him." | identical |
| Lev 23:36–38 | "For seven days present food offerings to the LORD… on the eighth day hold a sacred assembly…" | identical |
| Gen 1:26 | "Let us make mankind in our image, in our likeness, so that they may rule over…" | identical |
| Gen 22:17 | "Your descendants will take possession of the **cities** of their enemies" | NIV "cities"; KJV/WEB have "gate" |
| Ex 20:6 | "showing love to a thousand generations of those who love me" | identical |

Proper-name spellings follow NIV 2011's idiosyncratic transliterations rather than the
KJV source it is nominally aligned to: **Milkah, Kesed, Maakah, Tahash** (Gen 22:21–24);
**Serah** (Num 26:46); **Hakilah** (1 Sam 26:1). KJV/WEB have Milcah, Chesed, Maachah,
Thahash, Sarah, Hachilah.

Deviations from NIV exist but are cosmetic (Gen 1:28 "Be fruitful and multiply" where
NIV has "Be fruitful and increase in number"; Isa 53:8 "who among his generation even
cared?" where NIV has "who of his generation protested?"). The base text is the NIV.

### Rights consequence

Biblica's published NIV permission policy (quoted on Bible Gateway's own copyright line
and in Biblica's permissions terms) allows quotation **up to 500 verses**, provided the
quoted verses **do not amount to a complete book of the Bible** and **do not account for
25% or more of the work** in which they appear. The NIV copyright line reads: "Holy
Bible, New International Version®, NIV® Copyright ©1973, 1978, 1984, 2011 by Biblica,
Inc.® Used by permission. **All rights reserved worldwide.**"

`bible-modern-en.json` is ~31,000 verses, all 66 books, 100% of the edition, shipped
inside a paid commercial product ($3/mo Premium) and served publicly at tinct.app. It
exceeds every one of the three limits by orders of magnitude. Commercial NIV licensing
in the US/Canada runs through HarperCollins Christian Publishing; nothing in this repo
records any such licence.

I am not a lawyer and this note is not legal advice, but this is not a marginal call:
verbatim reproduction of an entire in-copyright translation is the clearest possible
form of the problem, and it is live in production in both the US and the EU/Denmark. It
is also the reason the "editorial quality" verdict below is close to irrelevant — the
edition cannot be kept in any repaired form, because the thing that makes it read well
is precisely the thing that cannot be shipped.

`bible-modern-da.json` appears to be a Danish translation *of the NIV-derived English*
(the scan-report samples in `books/scan-report.md` show the same NIV English feeding the
Danish), so it likely carries derivative exposure too. Danish text was out of scope for
this English audit; flagged for the orchestrator.

---

## 4. Phase 2 — editorial sampling

22 passages inspected across 8 literary genres (the brief asked for a genre-diverse
minimum of ~12–14; the extra samples were cheap once the two failure patterns were
identified mechanically).

I also ran two whole-corpus checks of my own beyond Phase 1, because Phase 1's
paragraph-count-based alignment check reported `aligned: true` while both defects below
were present. Scripts were throwaway, in the scratchpad, and touched nothing in the repo.

**Check A — verse-marker coverage.** Every paragraph carries superscript verse numbers.
Comparing the set of verse numbers per chapter, KJV has 31,102 verse markers;
`web-en` reproduces **all 31,102** (zero missing); `modern-en` is missing **200**;
`modern-da` is missing **1,067**.

**Check B — per-paragraph verse deficit.** Because paragraph *i* of chapter *c* is
aligned across editions, comparing verse-marker counts within each of the 6,704 aligned
paragraph pairs isolates real content loss. Result: **141 paragraphs** carry fewer verses
than their KJV counterpart, total deficit **228 verses**. Excluding the 32 chapters
caught in the boundary-shift runs (§4.2, where alignment itself is displaced), the clean
figure is **166 dropped verses across 92 chapters**.

### 4.1 Defect 1 — dropped verses (confirmed, recurring, not local)

These are whole verses simply absent, concealed by fluent surrounding prose. The
paragraph reads smoothly; nothing signals a gap.

**Leviticus 23, paragraph 7 (law).** Phase 1 truncation flag ch113 para7, ratio 0.51 —
**confirmed as real loss, not list compression.**
- KJV: "… ³⁸ Beside the sabbaths of the LORD … ³⁹ **Also in the fifteenth day of the seventh month, when ye have gathered in the fruit of the land, ye shall keep a feast unto the LORD seven days** … ⁴⁰ **And ye shall take you on the first day the boughs of goodly trees, branches of palm trees, and the boughs of thick trees, and willows of the brook; and ye shall rejoice before the LORD your God seven days.**"
- modern-en: "… ³⁸ These offerings are in addition to those for the LORD's Sabbaths and in addition to your gifts and whatever you have vowed and all the freewill offerings you give to the LORD.'"
- The paragraph stops at v38. The founding instruction for the Feast of Booths — the
  palm branches, the seven days of rejoicing — is gone. This is one of the most
  consequential ritual texts in Leviticus.

**Isaiah 1, paragraph 1 (major prophet).**
- KJV vv.6–10; modern-en has v6 only. Missing: v7 "Your country is desolate, your cities
  are burned with fire", v8 "the daughter of Zion is left as a cottage in a vineyard, as
  a lodge in a garden of cucumbers", v9 the Sodom/Gomorrah remnant, and v10 **"Hear the
  word of the LORD, ye rulers of Sodom; give ear unto the law of our God, ye people of
  Gomorrah."** The Sodom address is the rhetorical hinge of the entire chapter and of
  Isaiah's opening indictment. Its absence is not recoverable by context.

**Psalm 119, paragraph 19 (Torah psalm).**
- KJV vv.96–100; modern-en has v96 only. Missing vv.97–100, including **"O how I love
  thy law! it is my meditation all the day"** — the best-known line in the psalm.

**1 Samuel 26, paragraph 0 (narrative).** Phase 1 flag ch262 para0, ratio 0.30 —
**confirmed as real loss.**
- KJV vv.1–5; modern-en has vv.1–2. Missing: Saul pitching on the hill of Hachilah,
  David sending out spies to confirm Saul had really come, and David going to the camp
  and seeing where Saul and Abner lay. The entire staging of the night raid is deleted;
  paragraph 1 then opens with David proposing to go down into a camp the reader has
  never been shown.

**1 Samuel 10, paragraph 2 (narrative).** Phase 1 flag ch246 para2, ratio 0.27 —
**confirmed as real loss, and it breaks the narrative.**
- KJV vv.11–15; modern-en has v11 only. Missing: v12's "But who is their father?" and
  the explicit **"Therefore it became a proverb, Is Saul also among the prophets?"**,
  v13, and vv.14–15 where Saul's uncle asks him where he has been.
- Consequence: the next paragraph opens "¹⁶ Saul told his uncle, 'He assured us the
  donkeys had been found.'" — Saul answers a question the reader never saw asked, by an
  uncle who has not been introduced.

**2 Samuel 17, paragraph 3 (narrative).** Phase 1 flag ch284 para3, ratio 0.40 —
**confirmed as real loss.**
- KJV vv.16–20; modern-en has vv.15–16 (and v15 is duplicated from the preceding
  paragraph). Missing vv.17–20 entirely: Jonathan and Ahimaaz waiting at En-rogel, the
  boy who spots them, the well at Bahurim, and **the woman who spreads a covering over
  the well's mouth and scatters ground corn on it** to hide them from Absalom's servants.
  A complete, famous, self-contained scene is gone.

**Job 17, paragraphs 0–1 (poetry).** vv.5 and 10 dropped — single-verse losses inside
otherwise good poetry.

**1 Chronicles 3, paragraph 2 (genealogy).** v10 dropped, breaking the Davidic line:
modern-en runs "…⁹ These were all the sons of David… ¹¹ Joram his son", so Rehoboam,
Abijah, Asa and Jehoshaphat vanish from the royal chain.

Concentration by book (166 clean-count verses): Jeremiah 21, Job 18, 1 Chronicles 16,
Isaiah 15, 1 Samuel 13, 2 Chronicles 13, Acts 13, 2 Samuel 10, Ezekiel 7, Hosea 7,
Proverbs 5, Psalms 4, 1 John 4, Leviticus 3, Nehemiah 3, Zechariah 3, and singles
elsewhere.

### 4.2 Defect 2 — content displaced across chapter boundaries (confirmed, structural)

26 chapters contain an internal verse-number reset, i.e. two different biblical chapters'
content glued into one reading unit; 25 chapters do not begin at verse 1; 25 chapters end
before the KJV's last verse. `web-en` has **zero** of all three. `modern-da` reproduces
the identical pattern (26 / 25 / 25), confirming a shared broken pipeline rather than a
one-off.

Five runs account for nearly all of it:

| run | chapters affected | shape |
|---|---|---|
| Jeremiah 16 → 25 | 10 | each reading unit = previous chapter vv.6–end, then current chapter vv.1–5 |
| Revelation 14 → 22 | 9 | same shape, offsets vary (5, 10, 15, 18, 20, 21, 24…) |
| 1 Chronicles 6 → 12 | 7 | stray leading chapter-number marker, offset grows 7→12 |
| Acts 19 → 20 | 2 | Acts 20 is renumbered ⁴¹–⁴⁵ continuing Acts 19's count, then resets to ⁶ |
| Psalm 78 → 79 | 2 | Ps 79:1 is printed as "⁷²" |
| Philippians 3 → 4 | 2 | Phil 4:1 bleeds onto the end of Phil 3 |

Worked example — **`modern-en` "Jeremiah 17"**:
- paragraph 0 opens at Jer **17:6** ("That person will be like a bush in the wastelands…"),
  so Jer 17:1–5 (the famous "The sin of Judah is written with a pen of iron, and with the
  point of a diamond") is not in this chapter at all — it is at the end of the
  "Jeremiah 16" unit;
- the last paragraph of "Jeremiah 17" is **Jeremiah 18:1–5** — the potter's house.
- A reader who opens Jeremiah 17 gets the tail of 16 and the head of 18, and misses the
  chapter's own opening image. This repeats for ten consecutive chapters.

Worked example — **`modern-en` "Revelation 21"**:
- paragraph 0 is Revelation **20:11–15**, the great white throne judgment;
- paragraphs 1–5 are Rev 21:1–23;
- Rev 21:24–27 (the kings of the earth bringing their glory into the city) is not here.

Important distinction: in these runs the *content* is mostly present somewhere in the
edition — it is misfiled, not deleted. But because Tinct's reading unit **is** the
biblical chapter (chapter nav, TOC labels, Cast per-chapter summaries, chat context,
position persistence, audio manifests all key off the chapter), misfiling is a
user-visible correctness failure, not a cosmetic one. Verse numbers displayed to the
reader are also simply wrong in these ~32 chapters.

Sub-class worth separating for anyone doing repair triage: Acts 20, Psalm 79 and
1 Chronicles 7–12 are **renumbering-only** — the prose is correct and complete, only the
superscript numbers are wrong. Jeremiah 16–25 and Revelation 14–22 are **genuine
displacement**. My raw "200 missing verse markers" figure mixes the two; the
alignment-based 166 figure does not.

### 4.3 What is good (this is not a uniformly bad file)

Roughly 1,065 of 1,189 chapters (≈90%) show neither defect, and where the text is
complete it is excellent — because it is the NIV.

- **Genesis 1** (creation narrative) — complete, all 31 verses, fluent.
- **Genesis 22** (Abraham and Isaac) — complete, including the Nahor genealogy tail.
- **Exodus 20** (Decalogue) — complete and clear.
- **Numbers 26** (census lists) — complete; numerals rendered as digits ("53,400"),
  clan formulas tightened without dropping a single clan. Good list handling.
- **1 Chronicles 6** (the hardest genealogy in the book, 81 verses) — complete. Name
  chains (p4) stay near-identical to KJV, which is correct for a name list, not a
  "mechanical false-modern" failure; the Levitical city allotments (p12) are genuinely
  and sensibly compressed with every allotment preserved.
- **Psalm 23**, **Psalm 88** — complete; Psalm 88's lament keeps its full emotional
  movement to "darkness is my closest companion".
- **Isaiah 53**, **Amos 5:11–15**, **Luke 15** (prodigal son), **1 Corinthians 13** —
  complete and strong.

I found **no inventions** — no added motives, diagnoses, glosses, or explanatory
transitions — in any sampled passage. The failure mode is exclusively subtraction.

### 4.4 Phase 1 flags: confirmed vs. disconfirmed

| Phase 1 signal | verdict |
|---|---|
| mean similarity 0.424 (lowest of 101 books) | **Disconfirmed as a defect.** Expected and good: KJV Jacobean English vs. contemporary English should score low. Not evidence of a problem. |
| 71 truncated paragraphs | **Confirmed as real, and an undercount.** 4 inspected directly (Lev 23 p7, 1 Sam 10 p2, 1 Sam 26 p0, 2 Sam 17 p3) plus 1 Chr 6 p12 as control — all four flagged narrative/law cases are genuine verse deletions, not compression of repetitive listing language. The control (1 Chr 6 p12) *is* legitimate compression. My own verse-level check finds 141 deficient paragraphs, roughly double the mechanical flag count. |
| `en_editions_aligned: true`, 0 paragraph-count mismatches | **Confirmed mechanically, misleading in substance.** Paragraph counts match exactly (6704 = 6704) while 32 chapters carry displaced content. The Phase 1 alignment check cannot see this class; worth noting in the executive report as a screening-methodology gap. |
| 0 identical long paragraphs, 0 empty paragraphs | Confirmed. |
| last chapter not suspiciously short | Confirmed — but Revelation 22 is the tail of a 9-chapter displacement run and opens at Rev 21:24, so "not short" is not "not broken". |

---

## 5. Phase 3 — human-edition research

The brief asked to prioritise a complete human edition here and to "recheck earlier
BSB/WEB research". **No prior BSB or WEB research exists anywhere in this repo** —
`books/MODERN-EN-REPAIR-STATUS.md`, `books/TRANSLATION_PROTOCOL.md`,
`books/TRANSLATION-PIPELINE-SPEC.md` and `books/scan-report.md` contain no mention of
BSB, Berean, NIV or the World English Bible. Treated as a fresh search.

### Candidate A — World English Bible (WEB) — already shipped as `web-en`

- **Translator/provenance:** Michael Paul Johnson / eBible.org; a modern revision of the
  American Standard Version (1901), itself public domain. The registry labels it
  "World English Bible", year 2000; the WEB is under continuing revision, so the year
  field is approximate — a metadata nit, not a defect.
- **Completeness in our file:** verified complete. All 1,189 chapters, **all 31,102 KJV
  verse markers present, zero missing, zero chapter-boundary displacement, zero
  renumbering errors.** It is the only one of the four editions with a clean bill of
  structural health.
- **Rights — verified at primary source**, https://ebible.org/web/copyright.htm:
  > "The World English Bible is in the Public Domain. That means that it is not
  > copyrighted. However, 'World English Bible' is a Trademark of eBible.org."
  and
  > "All we ask is that if you CHANGE the actual text of the World English Bible in any
  > way, you not call the result the World English Bible any more."
  **Public domain.** Commercial use, redistribution and adaptation permitted. The only
  live condition for Tinct: we may re-paragraph and re-mark up freely (that is not
  changing the text), but if we ever *edit the wording* we must drop the "World English
  Bible" label. Our current file is unmodified WEB, so the label is correct as shipped.
- **Readability assessment — from the actual shipped file, not reputation.** WEB is a
  genuine formal-equivalence translation, clearly more modern than KJV, but it is not
  fully contemporary English and it is not a paraphrase. Retained archaisms and
  awkwardness in my samples: "David abode in the wilderness" and "Saul was come of a
  certainty" (1 Sam 26:3–4); "doesn't behave itself inappropriately", "if I dole out all
  my goods" (1 Cor 13:3,5); "Forasmuch therefore as you trample on the poor" (Amos 5:11);
  "as a lamb that is led to the slaughter… so he didn't open his mouth" (Isa 53:7); and
  the bracketed textual-supplement convention "Aren't you a [valiant] man?" (1 Sam 26:15)
  which will read as a typo to a general reader. It also uses **"Yahweh"** throughout
  rather than "the LORD" — a defensible scholarly choice that will be unfamiliar and
  jarring to most readers coming to the Bible as literature.
- **Verdict:** rights-perfect, complete, structurally clean, moderately modern. A good
  *second* column. Not the best "modern English" reading edition on offer.

### Candidate B — Berean Standard Bible (BSB) — **recommended**

- **Translator/provenance:** Berean Bible Translation Committee, coordinated by the
  Bible Hub and Discovery Bible teams; advisory committee including Dr. Eugene H. Merrill
  (OT lead) and Dr. Grant Osborne (NT lead). Complete Bible; printings 2016, 2020, 2022
  (renamed from "Berean Study Bible" to "Berean Standard Bible" in early 2022), 2025.
  Protestant 66-book canon — same scope as our current files, so **no canon change**.
- **Rights — verified at primary source**, https://berean.bible/terms.htm and
  https://berean.bible/licensing.htm:
  > "The Berean Bible and Majority Bible texts are officially dedicated to the public
  > domain as of April 30, 2023. All uses are freely permitted."
  > "all public domain materials may be freely reproduced, integrated, and adapted for
  > both free and commercial resources."
  > "Licensing is not required for any use."
  The terms link to the **CC0 1.0 Public Domain Dedication**. Attribution is requested
  but not required. One condition, parallel to WEB's: *"For derivative works that vary
  from the official text, we respectfully request that the Berean name is not used."*
  → Same rule as WEB: re-paragraphing and verse markup are fine under the BSB name;
  editing the wording means dropping the name. **Public domain / CC0 — commercial use,
  redistribution and adaptation all permitted, in the US and in the EU/Denmark alike.**
- **Data availability for our concrete need:** official downloads at
  https://berean.bible/downloads.htm include **USFM, USJ (JSON), USX**, plus .xlsx/.tsv
  translation tables and plain text. `github.com/BSB-publishing/bsb2usfm` publishes
  USFM/USJ/USX release ZIPs; `github.com/usfm-bible/examples.bsb` carries it as a USFM
  exemplar; a full copy is mirrored on archive.org. USJ is per-verse JSON, so producing
  Tinct's `{chapters:[{number,title,paragraphs:[...]}]}` shape is a deterministic
  transform, not a translation job.
- **Readability — verified by fetching and reading actual BSB text**, deliberately
  including the two passages where our `modern-en` fails:
  - *Leviticus 23:39–41* (which `modern-en` drops): "On the fifteenth day of the seventh
    month, after you have gathered the produce of the land, you are to celebrate a feast
    to the LORD for seven days… On the first day you are to gather the fruit of majestic
    trees, the branches of palm trees, and the boughs of leafy trees and of willows of
    the brook. And you are to rejoice before the LORD your God for seven days." Complete
    and clear.
  - *Isaiah 1:7–10* (which `modern-en` drops): "Your land is desolate; your cities are
    burned with fire… And the Daughter of Zion is abandoned like a shelter in a vineyard,
    like a shack in a cucumber field, like a city besieged… Hear the word of the LORD,
    you rulers of Sodom; listen to the instruction of our God, you people of Gomorrah!"
    Complete; the images are preserved rather than explained away.
  - *1 Corinthians 13:1–7*: "If I speak in the tongues of men and of angels, but have not
    love, I am only a ringing gong or a clanging cymbal… Love is patient, love is kind.
    It does not envy, it does not boast, it is not proud. It is not rude, it is not
    self-seeking, it is not easily angered, it keeps no account of wrongs."
  - *Psalm 23*: "The LORD is my shepherd; I shall not want… Even though I walk through
    the valley of the shadow of death, I will fear no evil."
- **Assessment against our reading standard:** natural contemporary English; noticeably
  more modern than WEB (no "Yahweh", no "doesn't behave itself inappropriately", no
  bracket conventions); it deliberately retains a few high-literary KJV cadences where
  they still read well ("I shall not want", "the valley of the shadow of death"), which
  suits Tinct's warm-literary positioning better than a flatter functional-equivalence
  text would. Formal-equivalence discipline means images are kept as images. Complete,
  by a named human committee, with no omissions to repair.

### Candidate C — King James Version (`kjv-en`) — keep as the classic column

- **Rights:** public domain in the United States and almost everywhere else. The one
  genuine caveat, worth recording rather than hand-waving: in the **United Kingdom** the
  KJV remains under perpetual Crown letters patent (administered via Cambridge University
  Press / Oxford University Press / Collins, commonly cited as running to 2039 in
  reference sources). This does not affect Danish or US distribution and no action is
  proposed; noted so nobody later "discovers" it. I did not attempt to resolve whether
  the UK patent is enforceable against a Danish-operated website serving UK readers —
  **that specific question is unresolved and I am not asserting an answer.**
- **Fit:** 1611 English is by design not modern English. It stays as the original/classic
  edition regardless of what happens to `modern-en` — it is the *reason* a modern column
  is needed, not a substitute for one.

### Candidates considered and not pursued

- **NIV / ESV / NRSV / NLT / CSB** — all in copyright, all requiring commercial licences.
  Not viable for full-text distribution in a paid product. (This is exactly what the
  current `modern-en` is doing without a licence.)
- **ASV (1901), YLT, Douay-Rheims** — public domain but *less* modern than WEB; no reason
  to prefer them.
- **NET Bible** — free to access with generous terms, but the licence has conditions and
  I did not verify them; recording as **unverified**, not as rejected. BSB's unconditional
  CC0 makes it unnecessary to pursue.
- **Catholic/Orthodox deuterocanon** — not researched beyond noting that ebible.org's WEB
  Deuterocanon edition exists and is public domain, should Tinct ever expand canon scope.

---

## 6. Phase 4 — rating and decision

Rating the **existing `modern-en`** on the inspected passages:

| dimension | weight | rating | note |
|---|---|---|---|
| fidelity / completeness | 40% | **2** | ~166 verses deleted across 92 chapters, including whole scenes and the rhetorical hinge of Isaiah 1; 32 further chapters carry displaced content and wrong verse numbers. ≈10% of chapters affected. |
| first-read clarity | 25% | **5** | Outstanding where complete — it is the NIV. |
| literary voice | 20% | **4** | Strong, but it is a borrowed voice, and the deletions break rhythm and narrative logic at the failure points. |
| restraint / no invention | 10% | **5** | No inventions, glosses, added motives or explanatory padding found in any sample. Failure is purely subtractive. |
| naturalness | 5% | **5** | Native contemporary English throughout. |

**Weighted score: 3.6 — band: Mixed.**

The numeric score overstates the edition's usability. It is a queue-sorting number only;
the rights finding in §3 is dispositive on its own and is not represented in the
dimensions.

### Recommendation: **USE HUMAN EDITION — Berean Standard Bible (BSB)**

Replace `bible-modern-en.json` wholesale with the BSB as the modern reading column.
Rationale:

1. The current `modern-en` **cannot be kept, light-edited, or repaired**, because the
   property that makes it read well is that it is the copyrighted NIV. Fixing the 166
   dropped verses would mean restoring more NIV text; fixing the chapter shifts would
   mean re-filing NIV text. Every repair path makes the rights exposure worse.
2. A retranslation is unnecessary work: BSB is a complete, committee-produced, genuinely
   modern human translation, CC0/public domain, with per-verse JSON already published.
3. BSB is a *better* modern column than WEB for a general literary reader, while WEB is
   already in place and can stay as a rights-clear structural safety net and a second
   English column.
4. Final edition set would be: `kjv-en` (classic/original) + `bsb-en` (modern) +
   `web-en` (optional second modern-literal) + a re-derived `modern-da`.

**Fallback if the team disputes the NIV identification:** the recommendation becomes
**BLOCKED** pending a provenance review of how `bible-modern-en.json` was generated —
that is the only unresolved question, and it is unresolved only in the sense that I
cannot see the generation logs, not in the sense that the textual evidence is ambiguous.

**Confidence: high** on the rights finding (verbatim matches verified against Bible
Gateway across 6 books and 4 genres, with distinctive NIV-only renderings and NIV-only
name spellings). **High** on the two structural defects (whole-corpus programmatic checks
plus direct inspection of 22 passages). **Medium-high** on the BSB recommendation (rights
verified at primary source; readability verified on 4 fetched passages including two
hard ones, but I have not read BSB at length).

**Correction scope: substantial** — full replacement of the modern English edition, plus
re-derivation of `modern-da`, plus re-cutting the English audio for the modern column,
plus deletion of the stray `bible-modern-en-ch*.json` artifacts.

### Suggested next actions, in order

1. **Urgent, independent of this audit's timeline:** get a second opinion on the NIV
   finding and decide whether to pull or replace `bible-modern-en.json` in production.
   This is the only item in this note with a clock on it.
2. Import BSB from USJ/USFM into Tinct's chapter/paragraph JSON shape, aligned
   paragraph-for-paragraph with `kjv-en` and `web-en` (all three already share the same
   6,704-paragraph skeleton, so the target structure is known).
3. Re-derive `modern-da` from a rights-clear English base (BSB) or from a public-domain
   Danish source; the current Danish file inherits both the NIV provenance and the same
   32 chapter-boundary breaks (26 resets / 25 head / 25 tail — identical counts).
4. Add "the 66-book Protestant canon" to `BIBLE.description` in `bookRegistry.ts`.
5. Delete the six stray `bible-modern-en-ch*.json` artifacts.
6. Feed the chapter-boundary check (verse-number reset / head / tail) back into the
   Phase 1 mechanical screening script — it caught a whole defect class that
   paragraph-count alignment is structurally blind to.

---

## 7. Limitations of this review — what I did NOT check

- **Sampling coverage.** 22 of 1,189 chapters read in full (≈1.9%). The whole-corpus
  verse-marker and boundary checks are programmatic and cover 100% of chapters, but they
  detect *structural* loss only. A paragraph that quietly drops a clause, softens a
  logical relation, or flattens an image while keeping all its verse numbers would not be
  caught by either check and would not appear in my 22 samples. The true rate of
  fine-grained fidelity error is **unknown**.
- **Extent of NIV dependence not quantified.** I verified verbatim NIV identity at 11
  verse-groups across 6 biblical books and 4 genres. I did not (and should not) download
  the full NIV to compute a corpus-wide match rate. "The base text is the NIV" is an
  inference from a consistent sample, not a measured percentage.
- **No legal opinion.** §3 states facts about published licence terms and about what is
  in our file. Whether Tinct's specific use infringes, in which jurisdictions, and what
  remedy applies are legal questions I am not qualified to answer.
- **`modern-da` not audited.** Danish was out of scope; I report only the structural
  counts my scripts produced (1,067 missing verse markers, same 32 boundary breaks) and
  the derivative-provenance concern. A Danish-language editorial review is still owed.
- **KJV source text not verified against a reference KJV.** I treated `bible-kjv-en.json`
  as the source of truth for verse inventory. It has 31,102 verse markers, matching the
  standard KJV total, which is reassuring but not a full collation.
- **`web-en` spot-checked, not read at length.** Structural completeness is machine-
  verified across all 1,189 chapters; readability judgements rest on 6 passages.
- **BSB not read at length**, and not checked for its own chapter/paragraph structure
  against ours — §5 flags the import as an alignment task without estimating its cost.
- **Audio, Cast/threads (`bible-threads.json`), and onboarding JSON not examined** for
  knock-on effects of the chapter displacement, though per-chapter Cast summaries keyed
  to displaced chapters are a likely secondary casualty.
- I did not run the app, the dev server, or any build.

---

## 8. Review-packet contributions

- `review-packet/pairs/bible.json` — 4 neutral-labelled pairs: Leviticus 23 p7 (law,
  dropped vv.39–40), 1 Samuel 26 p0 (narrative, dropped vv.3–5), Psalm 88 p1 (lament
  poetry, complete and strong), Isaiah 1 p1 (prophecy, dropped vv.7–10). Source/modern
  label order randomised per pair.
- `review-packet/mapping/bible.json` — answer key, same order.
