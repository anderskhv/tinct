> **Provenance note (lead auditor):** the G01 subagent's own file write was blocked by the harness, so it returned this report as text. The lead auditor saved it here verbatim; the companion `G01-shakespeare-a.findings.json` was written by the subagent itself. All defects below were `PROPOSED` at the time of writing. See `../CONFIRMED-DEFECTS.md` for the independently verified status.

# Source-completeness audit: G01-shakespeare-a (12 Shakespeare plays)

- **Group:** G01-shakespeare-a
- **Books (priority order):** macbeth, julius-caesar (featured), henry-v, as-you-like-it, hamlet, midsummer, romeo-and-juliet, the-tempest, othello, comedy-of-errors, merchant-of-venice, winters-tale
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (read-only)
- **Date:** 2026-09-25
- **Status of every defect:** `PROPOSED`
- **Companion file:** `G01-shakespeare-a.findings.json`

## Method, tools, caveats

For each play:
1. Identified the source matching the served `original-en`. Candidates (each fetched once, cached in scratch):
   - the current individual PG #15xx file;
   - PG #100, sliced per play;
   - the World Library etext;
   - MIT.

   Where a local raw exists, I compared it with the current authoritative file.
2. Ran `align.py` (k=6) over the whole play body, excluding Dramatis Personae and licence text. I inspected every MISSING and EXTRA run down to 1 token.
3. Used two group tools:
   - `gaps.py`: line-level gaps with source line ranges.
   - `contcheck.py`: enumerates every speech block that continues after a stage direction or a paragraph break without a new speaker heading, finds it in the served text, and classifies it as absent, labelled, unlabelled, or bracket-wrapped.
4. Structural checks:
   - chapter titles against the source scene headings;
   - prologues, choruses and epilogues;
   - bracket-led, speaker-only and merged-speaker paragraphs;
   - dropped inline stage directions;
   - song attribution.
5. Checked modern-en and modern-da at every defect coordinate, and ran a modern-en ratio scan (below 0.6×, or above 1.6× with more than 20 extra words).
6. Checked prior packages with `git show`.

Caveats:
- Sources were normalised CRLF→LF; line numbers are unchanged. The hashes quoted are of the files as downloaded.
- Scene headings become chapter titles, so every play shows small heading-only "missing" runs. These are explained, not defects.
- Translations were checked by inspection at each coordinate, not by token alignment.
- The inventory title `winters-tale` is an `inv.py` regex artefact: the registry title is double-quoted.

## Summary

| Book | Matched source | Src cov | Ed cov | Verdict | Findings |
|---|---|---|---|---|---|
| macbeth | PG #1533 (= local raw = PG #100) | 91.52% | 99.87% | **DEFECTS** | 34 blocks / 1,300 words missing: 5×S1, 7×S3, 1×S2 group |
| julius-caesar | PG #1522 (= PG #100) | 99.33% | 100.00% | COMPLETE-VS-SOURCE | 1×S4 |
| henry-v | PG #1521 (= PG #100) | 98.53% | 100.00% | **DEFECTS** | Prologue S1; Choruses 2–5 misplaced S3; Epilogue S4 |
| as-you-like-it | World Library etext (orig. PG Etext #1121, 1997; archive.org `1ws2510`) | 93.45% | 99.92% | **DEFECTS** | Act 1 Sc 1 S1; end boilerplate S1; mislabelling S2; mid-text boilerplate S3; headings as text S4 |
| hamlet | PG #1524 (= local raw) | 99.49% | 99.76% | COMPLETE-VS-SOURCE | 1×S4 |
| midsummer | PG #1514 (= local raw body) | 99.56% | 99.90% | COMPLETE-VS-SOURCE | 1×S4 |
| romeo-and-juliet | PG #1513 (= local raw) | 99.27% | 99.79% | COMPLETE-VS-SOURCE | 2×S4 |
| the-tempest | MIT (= local raw) | 99.51% | 99.75% | **DEFECTS** | Ariel's songs misattributed S3 |
| othello | PG #1531 (= PG #100) | 99.42% | 100.00% | **DEFECTS** | 43 bracketed speeches with no speaker S3 (known); ~30 inline stage directions incl. 8 asides dropped S4 |
| comedy-of-errors | PG #1504 | 99.63% | 100.00% | COMPLETE-VS-SOURCE | 1×S4 |
| merchant-of-venice | PG #1515 | 99.33% | 100.00% | COMPLETE-VS-SOURCE | 1×S4 |
| winters-tale | PG #1539 | 99.48% | 100.00% | COMPLETE-VS-SOURCE | 1×S4 |

## The Macbeth failure pattern tested across the group

| Play | Continuation blocks | Absent | Re-labelled | No label (as in the printed source) | Bracket-wrapped / label split off |
|---|---|---|---|---|---|
| macbeth | 41 | **34** | 7 | 0 | 0 |
| julius-caesar | 42 | 0 | 0 | 34 | 8 |
| henry-v | 14 | 0 | 0 | 14 | 0 |
| hamlet | 105 | 0 | 100 | 3 (long stage directions) | 2 |
| midsummer | 37 | 0 | 23 | 13 (PG speaker lines lack a period) | 1 (6.123) |
| romeo-and-juliet | 42 | 0 | 35 | 0 | 7 + 25.58 |
| othello | 74 | 0 | 23 | 1 | **47**, plus 3 with the inline stage direction dropped |
| comedy-of-errors | 10 | 0 | 0 | 7 | 3 |
| merchant-of-venice | 29 | 0 | 0 | 21 | 8 |
| winters-tale | 50 | 0 | 0 | 34 | 16 |

The World Library layout (AYLI) and the MIT layout (Tempest) cannot go through `contcheck.py`. Alignment shows no continuation loss in either, and the MIT layout causes the Tempest song misattribution. **Text-dropping happens only in Macbeth.**

---

## macbeth — Macbeth

**Served editions**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `2650bcc666428a80` | Original Text |
| modern-en | `0c85273086804fdd` | Modern English |
| modern-da | `c10696221af2265d` | Moderne Dansk |

**Source.** PG #1533, Macbeth (PG Shakespeare Team; updated 2025-09-19).
- URL: https://www.gutenberg.org/cache/epub/1533/pg1533.txt
- Retrieved: 2026-09-25T11:53:24Z
- sha256: `1371a47e68246197f7f57017a83386fed75dbfebfd0ff51b4524921a3b38ff5e`

**Local raw.** `books/raw/macbeth/raw.txt` (sha256 `03fa4dc2…`) is identical to the current file except for a 3-byte BOM. The imported raw is complete, so the loss happened in parsing. The PG #100 slice (pg100.txt lines 96022–100171) aligns identically.

**Body.** pg1533.txt lines 126–4198 (`ACT I` to the final `[_Flourish. Exeunt._]`).

**Metrics.**
- 18,788 source tokens against 17,216 edition tokens.
- Source covered 91.52%; edition covered 99.87%.
- 24 MISSING runs of 10 or more tokens (1,389 tokens), 11 of them 25 or more.
- 0 EXTRA, 0 ORDER, 0 DUPLICATE.

This reproduces the lead's result. At `--min 1`, all 28 non-heading runs correspond exactly to the 34 blocks below.

**Structure.** 28/28 scenes, matching PG. First and last paragraphs match. Chapter 1 is titled "A Desert Place" where PG has "An open Place."; that is a VARIANT, not a defect.

**Root cause.** Every blank-line-separated speech block that lacks its own speaker heading is dropped, while the stage directions around it are kept. The dagger site shows it: 8.19 `[Exit Servant.]` → 8.20 `[A bell rings.]` → 8.21 `[Exit.]`, with the whole soliloquy gone. The same rule also drops paragraph breaks inside a speech: after the letter at 5.1, and at 15.6.

**All 34 gaps (1,300 words).**

| Finding | Sev | Served location | Act.Sc | Speaker | Words | pg1533.txt lines | Missing text (start … end) | modern-en | modern-da |
|---|---|---|---|---|---|---|---|---|---|
| m01 | S1 | after 5.1 | 1.5 | Lady Macbeth | 134 | 692-707 | “Glamis thou art, and Cawdor; and shalt be …” … “… seem To have thee crown’d withal.” | present (appended to 5.1) | present (appended to 5.1) |
| m02 | S1 | after 5.7 | 1.5 | Lady Macbeth | 129 | 733-749 | “The raven himself is hoarse That croaks the …” … “… the dark To cry, “Hold, hold!”” | absent | absent |
| m02 | S1 | after 5.8 | 1.5 | Lady Macbeth | 30 | 753-757 | “Great Glamis, worthy Cawdor! Greater than both, by …” … “… now The future in the instant.” | absent | absent |
| m03 | S1 | after 8.19 | 2.1 | Macbeth | 239 | 1070-1098 | “Is this a dagger which I see before …” … “… of deeds too cold breath gives.” | absent | absent |
| m03 | S1 | after 8.20 | 2.1 | Macbeth | 27 | 1102-1104 | “I go, and it is done. The bell …” … “… thee to heaven or to hell.” | absent | absent |
| m04 | S1 | after 12.20 | 3.1 | Macbeth | 206 | 1772-1796 | “To be thus is nothing, But to be …” … “… champion me to th’ utterance!—Who’s there?—” | absent | absent |
| m04 | S1 | after 12.21 | 3.1 | Macbeth | 11 | 1800-1800 | “Now go to the door, and stay there …” … “… and stay there till we call.” | absent | absent |
| m04 | S1 | after 12.22 | 3.1 | Macbeth | 7 | 1804-1804 | “Was it not yesterday we spoke together?” | absent | absent |
| m05 | S1 | after 23.9 | 5.3 | Macbeth | 82 | 3709-3719 | “Seyton!—I am sick at heart, When I behold—Seyton, …” … “… fain deny, and dare not. Seyton!—” | absent | absent |
| m06 | S3 | after 4.4 | 1.4 | Duncan | 62 | 606-613 | “O worthiest cousin! The sin of my ingratitude …” … “… than more than all can pay.” | absent | absent |
| m07 | S3 | after 10.34 | 2.3 | Macduff | 50 | 1406-1413 | “Awake, awake!— Ring the alarum bell.—Murder and treason! …” … “… like sprites To countenance this horror!” | absent | absent |
| m08 | S3 | after 10.59 | 2.3 | Banquo | 51 | 1521-1527 | “And when we have our naked frailties hid, …” … “… pretence I fight Of treasonous malice.” | absent | absent |
| m09 | S3 | after 12.16 | 3.1 | Macbeth | 32 | 1754-1757 | “Let every man be master of his time …” … “… while then, God be with you.” | absent | absent |
| m09 | S3 | after 12.17 | 3.1 | Macbeth | 10 | 1761-1762 | “Sirrah, a word with you. Attend those men …” … “… you. Attend those men Our pleasure?” | absent | absent |
| m10 | S3 | after 13.7 | 3.2 | Lady Macbeth | 40 | 1948-1952 | “How now, my lord, why do you keep …” … “… without regard: what’s done is done.” | absent | absent |
| m11 | S3 | after 18.40 | 4.1 | Macbeth | 23 | 2711-2714 | “What is this, That rises like the issue …” … “… the round And top of sovereignty?” | absent | absent |
| m12 | S3 | after 21.7 | 5.1 | Gentlewoman | 20 | 3493-3494 | “Lo you, here she comes! This is her …” … “… fast asleep. Observe her; stand close.” | absent | absent |
| m13 | S2 | after 2.10 | 1.2 | Duncan | 3 | 242-242 | “Who comes here?” | absent | absent |
| m13 | S2 | after 5.2 | 1.5 | Lady Macbeth | 4 | 711-711 | “What is your tidings?” | absent | absent |
| m13 | S2 | after 7.2 | 1.7 | Macbeth | 4 | 891-891 | “How now! what news?” | absent | absent |
| m13 | S2 | after 8.6 | 2.1 | Banquo | 6 | 1014-1014 | “Give me my sword.—Who’s there?” | absent | absent |
| m13 | S2 | after 10.11 | 2.3 | Macduff | 8 | 1320-1320 | “Our knocking has awak’d him; here he comes.” | absent | absent |
| m13 | S2 | after 10.39 | 2.3 | Macduff | 7 | 1432-1433 | “O Banquo, Banquo! Our royal master’s murder’d!” | absent | absent |
| m13 | S2 | after 11.7 | 2.4 | Ross | 6 | 1607-1607 | “How goes the world, sir, now?” | absent | absent |
| m13 | S2 | after 12.39 | 3.1 | Macbeth | 16 | 1916-1917 | “It is concluded. Banquo, thy soul’s flight, If …” … “… heaven, must find it out tonight.” | absent | absent |
| m13 | S2 | after 15.6 | 3.4 | Macbeth | 17 | 2133-2134 | “Be large in mirth; anon we’ll drink a …” … “… round. There’s blood upon thy face.” | present (15.6) | present (15.6) |
| m13 | S2 | after 15.41 | 3.4 | Macbeth | 10 | 2299-2300 | “To all, and him, we thirst, And all …” … “… we thirst, And all to all.” | present, moved into 15.40 | present (end of 15.40) |
| m13 | S2 | after 15.46 | 3.4 | Macbeth | 13 | 2329-2330 | “Why, so;—being gone, I am a man again.—Pray …” … “… a man again.—Pray you, sit still.” | absent | absent |
| m13 | S2 | after 16.3 | 3.5 | Hecate | 17 | 2446-2447 | “Hark! I am call’d; my little spirit, see, …” … “… foggy cloud and stays for me.” | absent | absent |
| m13 | S2 | after 19.45 | 4.2 | First Murderer | 4 | 3027-3027 | “Young fry of treachery!” | absent | absent |
| m13 | S2 | after 23.2 | 5.3 | Macbeth | 15 | 3683-3684 | “The devil damn thee black, thou cream-fac’d loon! …” … “… Where gott’st thou that goose look?” | absent | absent |
| m13 | S2 | after 25.2 | 5.5 | Macbeth | 4 | 3861-3861 | “What is that noise?” | absent | absent |
| m13 | S2 | after 25.6 | 5.5 | Macbeth | 4 | 3879-3879 | “Wherefore was that cry?” | absent | absent |
| m13 | S2 | after 25.9 | 5.5 | Macbeth | 9 | 3900-3900 | “Thou com’st to use thy tongue; thy story …” … “… use thy tongue; thy story quickly.” | absent | absent |

**Findings.** `m01`–`m13` map to `G01-macbeth-01` … `-13`.

| ID | Sev | Words | Summary | Existing record |
|---|---|---|---|---|
| G01-macbeth-01 | S1 | 134 | "Glamis thou art" (original-en only; the modern editions have it) | none |
| G01-macbeth-02 | S1 | 159 | "The raven himself is hoarse… unsex me here" and "Great Glamis, worthy Cawdor!" | green-macbeth/PARKED.md (friendly-albattani `66dda6f41`). It misattributes "Great Glamis" to Macbeth; the line is Lady Macbeth's. |
| G01-macbeth-03 | S1 | 266 | Dagger soliloquy and "I go, and it is done" | PARKED.md |
| G01-macbeth-04 | S1 | 224 | "To be thus is nothing" soliloquy and 2 lines to the murderers | new |
| G01-macbeth-05 | S1 | 82 | "my way of life Is fall'n into the sere, the yellow leaf" | new |
| G01-macbeth-06…12 | S3 | 278 in total | Duncan, Macduff, Banquo, Macbeth, Lady Macbeth ("what's done is done"), the third apparition, the Gentlewoman | new |
| G01-macbeth-13 | S2 | 147 | 17 short lines (modern editions have 2) | only "Who comes here?" is recorded, in staged-replacements/macbeth/PROVENANCE.md §3 (`5608dfa81`) |

**Successors.**
- green-macbeth `candidate.json` inherits every gap.
- staged-replacements/macbeth covers ch1–2 only and was drafted against the served text, so it inherits the gaps. It calls "Who comes here?" unattributed; in PG it continues Duncan's speech.

**Note.** modern-en carries text that original-en lacks (5.1, 15.6, 15.40), so the Compare view will show those passages without an original counterpart.

**Verdict: DEFECTS.** Restoring the blocks as new paragraphs would shift paragraph indices in 16 chapters.

---

## julius-caesar — Julius Caesar (featured)

**Served editions:**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `5368eeed76705533` | Shakespeare (1623) |
| modern-en | `95a3e5b7516276f7` | Modern English |
| modern-da | `977a7ebb2044578e` | Moderne Dansk |

**Source.** PG #1522 (PG Shakespeare Team; updated 2025-09-19). The PG #100 slice (lines 80258–84904) is identical. No local raw.
- URL: https://www.gutenberg.org/cache/epub/1522/pg1522.txt
- Retrieved: 2026-09-25T11:53:27Z
- sha256: `795e5480b3ce816a78657aefddad4cfb624882c5b7034de26ea65db02a2766cf`

**Metrics.**
- 21,223 source tokens against 21,080 edition tokens.
- Source covered 99.33%; edition covered **100%**.
- At `--min 1` the 18 missing runs are exactly the 18 scene headings (143 tokens).
- 0 EXTRA, 0 ORDER, 0 DUPLICATE.

**Structure.** 18/18 scenes; first and last paragraphs match. "Et tu, Brute" is at 8.41 and "Friends, Romans, countrymen" at 9.35.

**Finding G01-julius-caesar-01 (S4, MISLABELED).** Where a speech line opens with `[_Aside._]`, `[_Within._]` or `[_Above._]`, the speaker label becomes its own paragraph and the speech continues unlabelled, sometimes split mid-sentence.
- Speaker-only paragraphs: 5.44, 8.90, 8.93, 13.50, 13.53, 13.55, 16.13, 16.16.
- Splits: 5.45|46, 7.4|5, 7.24|25, 8.88|89, 16.17|18.
- modern-en and modern-da inherit this. The text is complete.

**Not defects.** The 34 unlabelled continuation paragraphs match the printed layout. "VARRO. CLAUDIUS." is verbatim from PG.

**Packages.** green-julius-caesar (friendly-albattani `656fdbfe2`; lucid-turing `c287c609f`) uses the same structure and records no completeness issue.

**Verdict: COMPLETE-VS-SOURCE** (PG #1522).

---

## henry-v — Henry V

**Served editions:**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `c66a930a2d877fc7` | Shakespeare (1600) |
| modern-en | `f2b9cab47fef45f6` | Modern English |
| modern-da | `a31bc433de6026f9` | Moderne Dansk |

**Source.** PG #1521 (updated 2025-09-19); PG #100 identical. No local raw.
- URL: https://www.gutenberg.org/cache/epub/1521/pg1521.txt
- Retrieved: 2026-09-25T11:53:28Z
- sha256: `e660d11f3eb5fabbbe86dd0c3181a8d8062052bee6a32b8def9c20bf79f4ebf1`

**Metrics.**
- Source covered 98.53%; edition covered **100%**.
- The only non-heading missing run is the Prologue.
- 0 EXTRA, 0 ORDER, 0 DUPLICATE.
- 23/23 scenes.

**Non-scene units:**

| Unit (pg1521.txt lines) | Words | Served at | Served under chapter title |
|---|---|---|---|
| Prologue (138–178) | 246 | **absent** | — |
| Act 2 Chorus (730–779) | 320 | 2.38–2.40 | "Act 1, Scene 2" |
| Act 3 Chorus (1569–1614) | 264 | 6.27–6.31 | "Act 2, Scene 4" |
| Act 4 Chorus (2679–2739) | 389 | 13.78–13.80 | "Act 3, Scene 7" |
| Act 5 Chorus (4257–4309) | 354 | 21.47–21.49 | "Act 4, Scene 8" |
| Epilogue (4943–4963) | 113 | 23.87–23.90 (`EPILOGUE.` as a body paragraph) | "Act 5, Scene 2" |

**Findings.**

| ID | Type | Sev | Summary | modern-en / modern-da | Existing record |
|---|---|---|---|---|---|
| G01-henry-v-01 | MISSING | S1 | Prologue "O for a Muse of fire…" through "…Gently to hear, kindly to judge, our play." is absent before 1.0 | absent / absent | green-henry-v/PARKED.md (`99336c6ac`) |
| G01-henry-v-02 | MISPLACED | S3 | Choruses 2–5 (1,327 words) sit as the tail of the previous act's last scene | same / same | PARKED.md accepts this as "convention" |
| G01-henry-v-03 | MISLABELED | S4 | The Epilogue sits inside Act 5 Scene 2, with its heading as a body paragraph | same / same | — |

**Notes.**
- The "(1600)" label is the first-quarto date. The served text is the conflated modern text, which includes the Folio choruses.
- Long modern-en paragraphs 17.19–17.27 and 23.46 add English glosses to the French dialogue; not a completeness issue.

**Verdict: DEFECTS.**

---

## as-you-like-it — As You Like It

**Served editions:**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `2c04249b4ea52861` | Shakespeare (1623) |
| modern-en | `df270fa2b6059509` | Modern English |
| modern-da | `80064e115bd31f19` | Moderne Dansk |

**Source identification.** The served text is the World Library (1990–93) etext. Today's PG files are different editions:
- PG #1523: 90.22% source coverage, 94.51% edition coverage.
- PG #1121 and #2244 as served now: First Folio transcriptions.

The matching text is the original December 1997 release of Etext #1121, preserved on archive.org:
- URL: https://archive.org/download/1ws2510/1ws2510.txt
- Retrieved: 2026-09-25T12:04:58Z
- sha256: `b30b9db29fe670195ccb182bdeabddefb5af705fb985ba40c485dc2defb6f39a` (archive.org's sha1 `4c0de98d…` matches)

No local raw.

**Metrics.**
- Body: `1ws2510.txt` lines 547–7573.
- 23,660 source tokens against 22,044 edition tokens.
- Source covered 93.45%; edition covered 99.92%.
- The only missing text is Act 1 Scene 1 (475 + 1,025 tokens).
- 0 ORDER, 0 DUPLICATE.

**Act 1 Scene 1: exact extent.**
- Source: `1ws2510.txt` lines 547–1002 (`ACT I. SCENE I.` / `Orchard of OLIVER'S house` … Oliver's `Exit`), **1,493 words**. The same scene is pg1523.txt lines 116–346 (1,484 words).
- Starts: "ORLANDO. As I remember, Adam, it was upon this fashion bequeathed me by will but poor a thousand crowns"
- Ends: "Nothing remains but that I kindle the boy thither, which now I'll go about. Exit"
- The book now opens at 1.0 `A lawn before the DUKE'S palace`.
- Absent from all three editions.

**Chapter → actual scene map** (all three editions; every chapter's `section` is "Act 1"):

| Ch | Served title | Actual content |
|---|---|---|
| 1 | Act 1, Scene 2 | Act 1 Sc 2 (correct) |
| 2 | Act 1, Scene 3 | 1.3 (2.0–2.50) + notice (2.51–2.54) + `ACT II. SCENE I.` (2.55) + **2.1** (2.56–2.66) |
| 3–7 | Act 1, Scenes 2–6 | Acts 2 Sc 2–6 |
| 8 | Act 1, Scene 7 | 2.7 (8.0–8.42) + `ACT III. SCENE I.` (8.43) + **3.1** (8.44–8.47) |
| 9–11 | Act 1, Scenes 2–4 | Act 3 Sc 2–4 |
| 12 | Act 1, Scene 5 | 3.5 (12.0–12.26) + notice (12.27–12.30) + heading (12.31) + **4.1** (12.32–12.114) |
| 13 | Act 1, Scene 2 | 4.2 |
| 14 | Act 1, Scene 3 | 4.3 (14.0–14.60) + notice (14.61–14.64) + heading (14.65) + **5.1** (14.66–14.97) |
| 15–16 | Act 1, Scenes 2–3 | Act 5 Sc 2–3 |
| 17 | Act 1, Scene 4 | 5.4 (17.0–17.66) + `EPILOGUE`/`EPILOGUE.` + epilogue (17.67–17.69) + `THE END` (17.70) + notice (17.71–17.74) + `End of this Etext…` (17.75) |

The parser recognised only bare `SCENE N.` headings and never advanced the act.

**Findings.**

| ID | Type | Sev | Summary | modern-en / modern-da |
|---|---|---|---|---|
| G01-as-you-like-it-01 | MISSING | S1 | Act 1 Scene 1 absent (1,493 words) | absent / absent |
| G01-as-you-like-it-02 | MISLABELED | S2 | 15 of 17 chapter titles wrong; Scene 1 of Acts 2–5 merged into the previous chapter | same / same |
| G01-as-you-like-it-03 | EXTRANEOUS | S1 | Licence notice plus "End of this Etext" served at the book's end (17.71–17.75, 91 words; `1ws2510.txt` lines 7551–7573) | English / **translated into Danish** |
| G01-as-you-like-it-04 | EXTRANEOUS | S3 | Licence notice served 3× mid-text (2.51–2.54, 12.27–12.30, 14.61–14.64; 228 words) | English / 2× English, 1× Danish |
| G01-as-you-like-it-05 | MISLABELED | S4 | Location lines, act/scene headings, `EPILOGUE` and `THE END` served as body text | same |

**Notes.** The MOD_DUP_ADJ and DUP_ADJ flags are authentic repetitions. No prior package exists for this book.

**Open question.** Replacing the text means re-basing to another edition, since PG #1523 has only 90% token overlap.

**Verdict: DEFECTS.**

---

## hamlet — Hamlet

**Served editions:** original-en `77f9bf6e33516a71`; modern-en `b355830766b69681`; modern-da `fea31e2b8d327f0f`.

**Source.** PG #1524 (Credits: Dianne Bean; updated 2025-09-19). The local raw is identical except for the BOM.
- URL: https://www.gutenberg.org/cache/epub/1524/pg1524.txt
- Retrieved: 2026-09-25T11:53:30Z
- sha256: `31584c19795779431b5933499a45b9cecb03e8c246b6ea7e245a2b6d65e8e784`

**Metrics.**
- Source covered 99.49%; edition covered 99.76%.
- Only headings are missing; 0 EXTRA, 0 ORDER, 0 DUPLICATE.
- 20/20 scenes; all 105 continuation blocks are present.

**Finding G01-hamlet-01 (S4).** 14 short replies are merged into the preceding speaker's paragraph with the label inline: 2.3, 2.54, 2.69, 5.22, 5.36, 5.45, 7.110, 9.12, 10.4, 13.1, 16.52, 16.69, 17.1, 20.149. Most are joint labels ("MARCELLUS and BARNARDO."), plus DANES and SERVANT lines.

**Packages.** The staged package (hamlet-modern-en-20260911, `121d8c718`, ch1 only) confirms PG #1524 and records no issue.

**Verdict: COMPLETE-VS-SOURCE.**

---

## midsummer — A Midsummer Night's Dream

**Served editions:** original-en `9ddba0b7d8617c6c`; modern-en `f9eca722e0488f7a`; modern-da `5b516f16b544ccb0`.

**Source.** PG #1514 (updated 2025-09-18). The local raw is exactly PG's body (header, contents and Dramatis Personae trimmed).
- URL: https://www.gutenberg.org/cache/epub/1514/pg1514.txt
- Retrieved: 2026-09-25T11:53:32Z
- sha256: `e8626a628112990c8505dd1098276e6f75040cc268690d018ee6694c71888ea4`

**Metrics.** Source covered 99.56%; edition covered 99.90%; only headings are missing. 9/9 scenes. Puck's epilogue is at 9.132 inside 5.1, as in PG, which gives it no heading.

**Finding G01-midsummer-01 (S4).** 6.123: Lysander's couplet after `[Lies down.]` is unlabelled and has malformed brackets.

**Verdict: COMPLETE-VS-SOURCE.**

---

## romeo-and-juliet — Romeo and Juliet

**Served editions:** original-en `d7be46edc32ddbb1`; modern-en `47fdf4f9a1b309f6`; modern-da `bed47cb3281aa1e9`.

**Source.** PG #1513 (updated 2025-09-18). The local raw is identical except for the BOM.
- URL: https://www.gutenberg.org/cache/epub/1513/pg1513.txt
- Retrieved: 2026-09-25T11:53:33Z
- sha256: `5a2037a19e60cccb67b3f5fc93a12cb65c58694ce6a1dc61d0d67d0d2502b3b4`

**Metrics.** Source covered 99.27%; edition covered 99.79%. The Prologue is chapter 1; 24/24 scenes.

**Findings.**
- **G01-romeo-and-juliet-01 (S4).** 8 speech lines that open with an inline stage direction are served as `[Within.] Madam.]`: bracket-wrapped, with the speaker label lost or moved to the next paragraph.
  - Locations: 6.29 (Romeo, "If I profane with my unworthiest hand"), 8.42, 8.44, 13.28, 13.32, 15.29, 17.23, 25.58. 46 words.
  - Source: pg1513.txt lines 1301, 1758, 1765, 2689, 2702, 3251, 3563, 5063.
  - modern-en and modern-da inherit this.
- **G01-romeo-and-juliet-02 (S4).** The Act 2 Chorus (7.0–7.1, 114 words) is correctly placed but unlabelled, and its `Enter Chorus.` direction is dropped.

**Cosmetic, not counted.** A stage direction is split across 5.0/5.1. 10.76 merges the Nurse's and Romeo's speeches because PG prints both on one line.

**Packages.** green-romeo-and-juliet (`90493e721`) claims all attributions are correct, but it compared against the served source.

**Verdict: COMPLETE-VS-SOURCE.**

---

## the-tempest — The Tempest

**Served editions:** original-en `c7b057ac30de314a`; modern-en `ddbade7e7141e485`; modern-da `82dcfbf3e42e6ebd`.

**Source.** MIT Complete Works (Moby text). The local raw is byte-identical. Against PG #1540 coverage is only 95.84%, a different edition.
- URL: https://shakespeare.mit.edu/tempest/full.html
- Retrieved: 2026-09-25T12:06:41Z
- sha256: `c3ed4bec5e1f07801ac9ef0ee0ae93e892ded38796bda443d51a5c78b76c3440`

**Metrics.** Source covered 99.51%; edition covered 99.75%. The only non-heading difference is a `[To ARIEL]` direction served as its own paragraph (2.168). 9/9 scenes plus the Epilogue as chapter 10.

**Finding G01-the-tempest-01 (S3, MISLABELED, 153 words).** Ariel's songs are served under the wrong speaker:
- "Come unto these yellow sands" (2.116/2.118/2.120) as PROSPERO;
- "Full fathom five thy father lies" (2.123/2.125) as FERDINAND, directly after `[ARIEL sings]`;
- "Where the bee sucks" (9.15) as PROSPERO.

Cause: MIT nests the songs inside Prospero's and Ferdinand's speech blocks after an "ARIEL sings" direction, and the parser prefixed the enclosing speaker. modern-en and modern-da inherit this. It is new: green-the-tempest (`0252b80db`) checked only that the songs are present. A reviewer may prefer S2.

**Verdict: DEFECTS.**

---

## othello — Othello

**Served editions:** original-en `a8e8ae40b054bce1`; modern-en `5beb0f0093ef10f1`; modern-da `048b82fecf563ec7`.

**Source.** PG #1531 (updated 2025-09-19); PG #100 identical. No local raw.
- URL: https://www.gutenberg.org/cache/epub/1531/pg1531.txt
- Retrieved: 2026-09-25T11:53:36Z
- sha256: `340a08eb95d6404c0834906eb7b899ec6503c609ca76eb5b7430bb100cd1e462`

**Metrics.** Source covered 99.42%; edition covered **100%**. 15/15 scenes.

**Findings.**
- **G01-othello-01 (S3, MISLABELED).** 43 speech continuations (1,062 words) are served inside `[...]` as if they were stage directions, with no speaker label.
  - Paragraph ids: 3.4, 3.28, 3.43, 4.31, 4.37, 4.47, 4.79, 6.29, 6.30, 6.39, 6.40, 6.76, 6.78, 6.95, 6.99, 6.126, 6.130, 7.23, 7.29, 9.109, 9.130, 9.132, 10.68, 10.78, 10.93, 11.28, 11.34, 11.46, 11.48, 11.157, 12.15, 12.47, 12.88, 12.91, 13.26, 13.28, 13.30, 13.33, 14.80, 14.84, 15.4, 15.66, 15.146.
  - They include Iago's napkin soliloquy (9.130), 11.46, and Othello's "O, balmy breath" (15.4).
  - Narration still voices them.
  - **Known:** listed in origin/claude/cool-galileo-tyen9m `books/wip/othello-modern-en/HANDOFF.md`, open issue 1 (`15d3d67e5`). The staged successor keeps the bracket shape.
- **G01-othello-02 (S4, new).** About 30 of 35 inline stage directions in speech lines are dropped, including all 8 aside markers (4.77, 4.89, 6.57, 6.74, 10.22, 11.52, 11.55, 14.95). Iago's and Othello's asides therefore read as spoken aloud. modern-en and modern-da inherit this.

**Verdict: DEFECTS**, although all speech text is served.

---

## comedy-of-errors, merchant-of-venice, winters-tale

In all three, only scene headings are missing, edition coverage is 100%, the scene lists match the source, first and last paragraphs match, and there is no local raw.

**comedy-of-errors.** Source PG #1504 (sha256 `bfaaac3d…`, retrieved 11:53:37Z). Source covered 99.63%; 11/11 scenes. Hashes: `84bba3a2afd91e5f`, `6319d77729e29c7b`, `8c099fc4f43b2bd2`.
- **G01-comedy-of-errors-01 (S4):** speaker labels split off before `[_Within._]` lines at 5.13, 5.26, 5.44.

**merchant-of-venice.** Source PG #1515 (sha256 `9389e97b…`). Source covered 99.33%; 20/20 scenes; "quality of mercy" at 18.57. Hashes: `4897042eb4453562`, `a15d3a630dbfe538`, `17d56d29af1104af`.
- **G01-merchant-of-venice-01 (S4):** speaker labels split off at 3.18, 5.4, 5.18, 14.14, 19.9, 20.59, 20.69.

**winters-tale.** Source PG #1539 (sha256 `c6a3e762…`). Source covered 99.48%; 15/15 scenes. Time the Chorus is its own chapter 9 (4.1). "Exit, pursued by a bear" is at 8.11. Hashes: `e725492b2ca705fc`, `b85a81abca26b0a3`, `dc48224cf47bdced`.
- **G01-winters-tale-01 (S4):** 18 speaker labels split off (2.37, 3.59, 7.5, 7.24, 11.10, 11.13, 12.12, 12.87, 12.103, 12.105, 12.146, 12.197, 12.200, 12.221, 12.237, 12.240, 12.244, 15.35).

**Verdicts:** all three **COMPLETE-VS-SOURCE**. green-comedy-of-errors (`2dd323bd2`), green-merchant-of-venice (`0de2cf96c`) and green-winters-tale (`9cf18e066`) record no completeness issue.

## Cross-cutting notes

- **Dramatis Personae.** No play serves its list of characters. This is SCOPE.
- **"Shakespeare (YEAR)" labels.** They give first-publication dates, while the served texts are modern-spelling editions. A labelling note, not a completeness defect.
- **Songs in the other plays** are attributed correctly.
- **modern-en ratio scan.** There are no modern-en drops below 0.6× and no count mismatches in any of the 12 plays.
