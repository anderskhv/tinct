# Independent Review — `faust-part-1-modern-en.json`

**Reviewer:** independent pass, formed before reading any existing release-packet or source-decision docs in this package.

**Verdict: ACCEPT**

## Method

Compared `books/wip/faust-part-1-english-repair/editions/faust-part-1-modern-en.json` (28 chapters, 1060 paragraphs) against the already-accepted `faust-part-1-original-en.json` baseline, paragraph by paragraph and programmatically for structure/word-count, then read closely against the raw source (`books/raw/faust-part-1/raw-en.txt`, Bayard Taylor's PG #14591 translation) for the highest-priority scenes.

## 1. Structural parity (chapters/paragraphs/titles)

Verified programmatically across all 28 chapters:
- Chapter count: 28 / 28, matching.
- Paragraph counts: identical 1:1 per chapter (e.g. ch8 Auerbach's Cellar 134/134, ch24 Walpurgis-Night 84/84, ch28 Dungeon 58/58). No mismatches anywhere.
- Chapter titles: identical string-for-string in all 28 chapters (Dedication, Prelude on the Stage, Prologue in Heaven, Night, Before the Gate, The Study Part 1/2, Auerbach's Cellar in Leipzig, Witch's Kitchen, Street, Evening, Promenade, The Neighbour's House, Street (II), Garden, A Summer House, Forest and Cavern, Margaret's Room, Martha's Garden, At the Well, Zwinger, Night. Street before Margaret's Door, Cathedral, Walpurgis-Night, Walpurgis-Night's Dream, A Gloomy Day. Open Country, Night. Open Field, Dungeon).
- No empty/null paragraphs found anywhere in the modern edition.

## 2. Word-count ratios (modern/original), per chapter

All 28 chapters land between 1.01 and 1.19 (modern is consistently slightly *longer* than original-en, as expected — 19th-century verse is being unpacked into flowing modern prose sentences, not compressed). Overall ratio 1.12 (39,313 words modern vs. 35,220 words original). No chapter is suspiciously short or truncated; nothing flags under a 0.5 or over a 1.6 threshold. This is consistent with a genuine sentence-level modernization rather than a summary or mechanical pass-through.

Per-chapter ratios (word_modern/word_original):
```
ch1 Dedication 1.10 | ch2 Prelude 1.18 | ch3 Prologue in Heaven 1.16 | ch4 Night 1.17
ch5 Before the Gate 1.13 | ch6 Study Pt1 1.15 | ch7 Study Pt2 1.10 | ch8 Auerbach's 1.08
ch9 Witch's Kitchen 1.05 | ch10 Street 1.05 | ch11 Evening 1.05 | ch12 Promenade 1.10
ch13 Neighbour's House 1.11 | ch14 Street II 1.07 | ch15 Garden 1.09 | ch16 Summer House 1.01
ch17 Forest and Cavern 1.06 | ch18 Margaret's Room 1.07 | ch19 Martha's Garden 1.08
ch20 At the Well 1.14 | ch21 Zwinger 1.13 | ch22 Night/Door 1.12 | ch23 Cathedral 1.15
ch24 Walpurgis-Night 1.14 | ch25 Walpurgis Dream 1.19 | ch26 Gloomy Day 1.07
ch27 Night. Open Field 1.17 | ch28 Dungeon 1.11
```

## 3. Close reading against original-en, weighted toward priority passages

Read in full and compared line-by-line:

- **Ch3 Prologue in Heaven** — full close read. Archangel speeches (Raphael/Gabriel/Michael/"All Three") rendered as fluent modern prose while preserving the theological content and the Lord/Mephistopheles wager framing. No omissions, no invented lines.
- **Ch6/7 "In the Beginning was the Word" passage** (ch6, para 1) — the entire four-stage translation attempt (Word → Thought → Power → Act/Deed) is intact and correctly sequenced, including Faust's reasoning for rejecting each candidate translation. This is the single passage most vulnerable to error in a modernization pass, and it is faithful.
- **Ch8 Auerbach's Cellar** — spot-checked opening, the flea song (paras 53–60) in full, the "burning wine" trick and its aftermath (paras 100–133). All bawdy/carousing content and the "miracles" punchline preserved.
- **Ch9 Witch's Kitchen** — the witch's nonsense arithmetic verse ("Make ten of one... this is the witch's once-one's-one," para 70) rendered as coherent modern nonsense-math verse without losing the wordplay's logic.
- **Ch18 Gretchen's "Meine Ruh ist hin" song** — full read. Desperation and longing preserved ("My poor, weak mind is racked and crazed... unless he's near me").
- **Ch22 Valentine's death curse** — full read, paras 31 and 34 (the curse proper) quoted and compared word-for-word. The brutal misogynistic content ("now that you're truly a whore, well then, be one outright," "you slut," "you'll live out a damned existence") is fully preserved, not softened or euphemized.
- **Ch23 Cathedral scene** — full read, all 13 paragraphs. Evil Spirit/Margaret/Chorus alternation intact; Latin *Dies Irae* text correctly normalized (macron/diacritic cleanup, e.g. "Diesira" → "Dies irae") without altering meaning; Margaret's panic attack and swoon preserved.
- **Ch24 Walpurgis-Night** — sampled across the chapter (opening ascent, Mephistopheles' storm-monologue, half-witch, the "seduced so easily" line). Faithful throughout, no invented content, no dropped grotesquerie.
- **Ch25 Walpurgis-Night's Dream** — sampled opening and middle (paras 0–5, 40–44), including the tricky "Manager/Herald/Oberon/Puck/Ariel" rapid-fire epigram structure and the orchestra stage direction ("pianissimo") — correctly folded into a parenthetical without losing the direction.
- **Ch28 Dungeon (full ending)** — read in full. Confirmed:
  - Margaret's confession of matricide ("I've put my own mother to death," para 29) intact.
  - Confession of infanticide/drowning the baby (para 29, and the hallucinated rescue-the-child scene, para 39) intact and undiminished.
  - The final line — `'VOICE (from within, fading away). Henry! Henry!'` — is present, intact, and unsoftened, matching the original's `'VOICE (from within, dying away). Henry! Henry!'` exactly in effect (only "dying away" → "fading away" as a direct synonym swap, not a softening of the ending's ambiguity/damnation-or-salvation tension).
  - Mephistopheles' "She is judged!" and the offstage "She is saved!" are both preserved verbatim in force.

No dark content — Gretchen's madness, the murder of her brother (Valentine), the infant's death, her ultimate fate/execution setup — was found summarized, trimmed, or sanitized anywhere sampled.

## 4. Speaker tags and stage directions

Speaker tags (`RAPHAEL.`, `MEPHISTOPHELES (to FAUST).`, `MARGARET.`, etc.) and bracketed stage directions (`[The Lord, the Heavenly Host; Mephistopheles (afterwards).]`, `[Dies.]`, `[He disappears with FAUST.]`) are preserved as their own paragraphs in the modern edition, in the same position and count as original-en, in every sampled chapter. Stage-direction wording is modernized in-place (e.g. "afterwards" → "enters later," "jails" [OCR error in original for "falls"] → not applicable here since original-en already carries the corrected form) without merging directions into dialogue paragraphs or vice versa.

## 5. Invented content

None found. Every paragraph sampled maps 1:1 in content to its corresponding original-en paragraph; no added sentences, no new stage business, no expanded dialogue beyond what the source paragraph supports.

## 6. Leftover archaisms

Ran a full-corpus regex scan for `thee|thou|thy|thine|hast|hath|dost|doth|art|'tis|'twas|o'er|ne'er|wilt|shalt|whence|wherefore|prithee|verily|mayst|didst` across all 1060 modern-en paragraphs.

Result: 9 paragraphs flagged, all false positives — every hit is the modern noun "art" (as in "the art of medicine," "practicing the art," "Art is long, and life... is short" — itself a Latin-tag idiom kept deliberately in ch4/ch7, which is correct: "ars longa, vita brevis" is a known aphorism, not a leftover archaism, and Wagner/Mephistopheles's lines using it read as modern English around it). No instances of genuine second-person archaic pronouns, verb endings, or contractions like `'tis`/`o'er` survived into the modern edition.

## Overall assessment

This reads as a genuine, careful, sentence-level modernization: idiomatic modern English throughout, syntax reordered and clause structure naturalized (not just word-swapped), consistently ~5–19% longer than the source per chapter (expected direction for verse→prose unpacking), with zero structural drift and zero content softening in the passages that matter most. I found no paragraph-level defects to report.

**Verdict: ACCEPT** — no blocking issues found; no fixes required before this replaces the live `modern-en` edition.
