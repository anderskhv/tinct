# Source-completeness audit: G04, Greek drama and early epic

- **Group:** `G04-greek-drama-early-epic`
- **Books:** oedipus-rex, antigone, oedipus-at-colonus, oresteia, medea, bacchae, gilgamesh, beowulf, the-aeneid
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (the local checkout is at this commit and was treated as read-only)
- **Date:** 2026-09-25. **Auditor:** subagent G04 (Claude Opus 5.5). Every finding has status **PROPOSED** until a reviewer confirms it.
- **Machine-readable file:** `G04-greek-drama-early-epic.findings.json`. Scratch scripts and outputs are in the session scratchpad at `groups/G04-greek-drama-early-epic/`.

## Checks performed (all nine books)

1. I fetched the current authoritative source once and cached it: Project Gutenberg #31, #8604, #35451, #35173, #16328, #228, and the Colavito Gilgamesh page. I compared each with the local raw under `books/raw/<id>/`.
2. I ran `align.py` on every served source edition (`original-en`) against its delimited work body, at `--min 12` and at `--min 1`. I inspected every uncovered run.
3. **Checks beyond `align.py`.** `align.py` matches word sequences regardless of order and ignores extra copies of repeated text, so I added four checks:
   - **Dropped repeats:** counted every 10-word sequence in the source and compared the count in the edition (`repcheck.py`), to catch a missing second copy of a refrain or catch-line.
   - **Stage-direction placement:** compared the words before and after each stage direction in the source and in the edition (`sdcheck.py`, `sdtable.py`).
   - **Gilgamesh paragraphs:** diffed the edition against the source paragraph by paragraph, tablet by tablet.
   - **Beowulf apparatus:** stripped Hall's side-notes, footnotes and line numbers from the source before aligning (`prep_beowulf.py`).
4. **Structure.** I checked the opening and ending of every work. For the six plays I mapped every chapter onto the standard units (prologue, parodos, each episode and stasimon, exodos; Jebb line numbering for Sophocles). I also checked chapter boundaries for duplicated text and looked for stray or merged speaker labels.
5. **Dropped continuations.** I tested for the Macbeth failure class, where the parser dropped speech that continues after an inline stage direction. It occurs in none of the six plays: no play has an uncovered run of 12 or more tokens other than documented apparatus.
6. **modern-en.** I ran a ratio sweep on each paragraph against its original-en paragraph (flagging below 0.6× or above 2.2×) and checked neighbouring paragraphs for near-duplicates. For every defect I also checked whether modern-en and modern-da have it.
7. **Existing packages.** I checked the green packages on `origin/claude/friendly-albattani-qgyqfi` (tip `0252b80dbc3d`). Each package's `source.json` is byte-identical to the live original-en.

**Verdict convention.**
- **DEFECTS:** at least one proposed S1–S3 finding.
- **COMPLETE-VS-SOURCE:** the whole text aligned at ≥ 97%, every gap is explained, and there are at most S4 cosmetic findings, which are listed.
- For every book, the JSON also records `text_completeness`.

## Group summary

| Book | Source (served edition) | Source covered | Edition covered | Verdict | Most severe finding |
|---|---|---|---|---|---|
| oedipus-rex | PG #31 Storr | 99.56% | 99.99% | DEFECTS | G04-oedipus-rex-01 S3: unit labels ch4–ch9 |
| antigone | PG #31 Storr | 99.33% | 100% | DEFECTS | G04-antigone-01 S3: "Third Stasimon" has no ode |
| oedipus-at-colonus | PG #31 Storr | 99.57% | 99.81% | DEFECTS | G04-oedipus-at-colonus-01 S3: labels ch2–ch9 |
| oresteia | PG #8604 Morshead | 99.58% | 99.96% | DEFECTS | G04-oresteia-01 S3: Libation Bearers / Eumenides labels |
| medea | PG #35451 Murray | 99.69% | 99.72% | DEFECTS | **G04-medea-01 S2: 32 of 34 stage directions one speech early** |
| bacchae | PG #35173 Murray | 99.54% | 99.79% | COMPLETE-VS-SOURCE | S4 only (boundary duplicates, merged speakers) |
| gilgamesh | Colavito web adaptation | 99.82% | 99.95% | DEFECTS | G04-gilgamesh-01 S3: label hides a copyrighted modern adaptation |
| beowulf | PG #16328 Hall | 98.96%* | 100% | COMPLETE-VS-SOURCE | none |
| the-aeneid | PG #228 Dryden | 99.96% | 100% | COMPLETE-VS-SOURCE | S4: Arguments unlabelled |

\* The only uncovered source tokens in Beowulf are the 43 fitt headings. They are served as chapter titles.

**Group-level conclusions**

- **No authorial text is missing from any of the nine served source editions.** There is no loss of the Symposium or Macbeth kind. Every play's prologue, parodos, all odes (strophe, antistrophe and epode) and final lines are present, and every epic's opening and ending are present.
- **All five Sophocles and Aeschylus play files carry wrong unit labels, as does Medea.** A fixed chapter template was imposed, with boundaries at entrances and exits rather than at the odes. The template is Prologue / Parodos / Episodes / Stasima / Exodos: 11 units for Sophocles, 7 for Medea, and Tinct's 10/8/8 split for the Oresteia. As a result, famous odes sit under wrong or episode headings, for example:
  - Oedipus Rex "My lot be still to lead" is under "Third Stasimon".
  - Antigone's Ode to Eros is under "Fourth Episode".
  - The Colonus ode is under "Second Stasimon".
  - Oedipus at Colonus "Not to be born" is under "Fourth Episode".
  - The Eumenides Binding Song is under "First Episode".

  The Bacchae is the only play labelled essentially correctly. The text order is correct everywhere, so this is navigation and labelling damage, not text loss.
- **Medea is the one play with order damage.** Murray's stage directions are shifted one speech early throughout.
- **The green packages lock and inherit all of the above, and in three cases they entrench import artefacts:**
  - green-medea cleared the Creon exit/speech inversion because it "exists in source.json itself".
  - green-oresteia re-added brackets at 23.3, on the claim that the source brackets these lines. PG prints them in italics.
  - green-gilgamesh "restored" the corrupted spelling `Niir`.

  In addition, green-oedipus-rex records the source as a "R.C. Jebb-lineage translation". It is Storr's 1912 translation.

---

## oedipus-rex — Oedipus Rex

- **Served editions.**
  - `original-en`: `44edb377baee3bf5`, "Storr (1912)".
  - `modern-en`: `f96170b779e2c9fa`.
  - `modern-da`: `bd607d8644de54d1`.

  All three have 11 chapters and 474 paragraphs.
- **Source.** https://www.gutenberg.org/cache/epub/31/pg31.txt, retrieved 2026-09-25T11:53:32Z, sha256 `be8419a2713178f45584eb7421760ff3e5b1a1af4a002cb5c53483ed37041794`.
  - Title: "Plays of Sophocles: Oedipus the King; Oedipus at Colonus; Antigone". Translator: Francis Storr (Loeb 1912). eBook #31, released 2006-03-08.
  - Local raw `books/raw/sophocles/raw.txt` (sha256 `af8ca7c8…`) is the PG file plus a leading UTF-8 BOM, and is otherwise byte-identical.
- **Body delimitation.** pg31 lines 105–3016, from the opening stage direction to the final Chorus.
  - Excluded: Storr's Argument (l.61–84), Dramatis Personae and the "Scene: Thebes" line (l.85–100), and FOOTNOTES (l.3017–3037).
- **Alignment.**
  - Source 12,717 tokens; edition 12,662.
  - Source covered 99.56%; edition covered 99.992%.
  - No MISSING or EXTRA runs of 12 or more tokens; 0 order anomalies; 0 duplicates.
  - The uncovered tokens are 28 strophic markers "(Str. 1)"/"(Ant. 1)" and 2 footnote markers.
  - Storr's single bracketed lacuna line, at 5.40 "[None but a fool would credit such as thou.]" (footnote 3), is served.
- **Structure.** The opening (1.0 suppliants) and ending (11.55 "Look ye, countrymen and Thebans…") are correct. Chapter boundaries:

| Standard unit (Jebb ll.) | Served under | Coordinates |
|---|---|---|
| First Stasimon 463–512 | ch4 "First Stasimon" | 4.0–4.2 ✓ |
| Second Episode 513–862 (kommos 649–697) | ch4 "First Stasimon", ch5 "Second Episode", ch6 "**Second Stasimon**", ch7 "**Third Episode**" | 4.3–4.8, 5.0–5.70, 6.0–6.8, 7.0–7.43 |
| Second Stasimon 863–910 | ch8 "**Third Stasimon**" | 8.0–8.3 |
| Third Episode 911–1085 | ch8 "Third Stasimon", ch9 "Fourth Episode" | 8.4–8.18, 9.0–9.87 |
| Third Stasimon 1086–1109 | ch9 "**Fourth Episode**" | 9.88–9.89 |
| Fourth Episode 1110–1185 | ch9 | 9.90–9.146 |
| Fourth Stasimon 1186–1222; Exodos | ch10, ch11 ✓ | |

- **Verdict: DEFECTS.** The text is complete against the source.

| ID | Type | Sev | Editions | Location | Summary |
|---|---|---|---|---|---|
| G04-oedipus-rex-01 | MISLABELED | S3 | original-en, modern-en, modern-da | ch4–ch9 | Labels do not match units. "Second Stasimon" (ch6) is the kommos antistrophes: "Lady, lead indoors thy consort…" (pg31 l.1356). The real 2nd stasimon (l.1702) is at 8.0 under "Third Stasimon". The real 3rd stasimon "If my soul prophetic err not" (l.2231) is at 9.88 inside "Fourth Episode". |

- **Inheritance.** modern-en and modern-da inherit the labels. green-oedipus-rex (`@81da10b5e`) inherits them, and its ACCEPTANCE-RECORD.md l.5 misnames the translation as "R.C. Jebb-lineage".
- **Scope.** Storr's Argument, Dramatis Personae, footnotes and strophic markers are not served (SCOPE).
- **Open question.** Should Storr's strophic markers be restored as structure cues?

## antigone — Antigone

- **Served editions.**
  - `original-en`: `628086763bedd01d`, "Storr (1912)".
  - `modern-en`: `923ec3c1b9bcc3e1`.
  - `modern-da`: `5bfac8c577539e95`.

  All three have 11 chapters and 318 paragraphs.
- **Source.** PG #31, as for Oedipus Rex; the local raw is the same file.
- **Body.** pg31 l.6668–8857. Excluded: the Argument (l.6634–6651) and Dramatis Personae (l.6652–6667).
- **Alignment.**
  - Source 10,326 tokens; edition 10,257.
  - Source covered 99.33%; edition covered 100%.
  - 0 runs; 0 order anomalies; 0 duplicates.
  - The uncovered tokens are the play heading and 35 strophic markers.
- **Structure.** The opening ("ANTIGONE and ISMENE before the Palace gates.") and ending ("Wisdom brings to age at last.") are correct.

| Standard unit | Served under | Coordinates |
|---|---|---|
| end of Second Episode 574–581 | ch6 "Second Stasimon" | 6.0–6.3 (minor) |
| end of Third Episode 766–780 | ch8 "**Third Stasimon**" (no ode at all) | 8.0–8.5 |
| Third Stasimon 781–800 (Ode to Eros) | ch9 "**Fourth Episode**" | 9.0–9.1 |
| Fourth Episode 801–943 | ch9 | 9.2–9.19 |
| Fourth Stasimon 944–987 (Danae) | ch9 "**Fourth Episode**" | 9.20–9.23 |
| Fifth Episode 988–1114 (Teiresias) | ch9, ch10 "**Fourth Stasimon**" | 9.24–9.52, 10.0–10.10 |
| Fifth Stasimon 1115–1154 (Hymn to Dionysus) | ch10 | 10.11–10.17 |

- **Verdict: DEFECTS.** The text is complete against the source.

| ID | Type | Sev | Editions | Location | Summary |
|---|---|---|---|---|---|
| G04-antigone-01 | MISLABELED | S3 | all three | ch8–ch10 | "Third Stasimon" opens with "Thy son has gone, my liege, in angry haste." (l.7951) and contains no ode. The Ode to Eros "Love resistless in fight" (l.7986) is at 9.0 under "Fourth Episode". |

- **Inheritance.** modern-en and modern-da inherit the labels. green-antigone (`@a6c39aaa4`) verified that its titles are an "exact match to source" and so inherits them.

## oedipus-at-colonus — Oedipus at Colonus

- **Served editions.**
  - `original-en`: `72f7f95bf433c0ba`, "Storr (1912)".
  - `modern-en`: `5c18460809bf2eac`.
  - `modern-da`: `04a3c0a06f626a65`.

  All three have 11 chapters and 566 paragraphs.
- **Source.** PG #31, as above.
- **Body.** pg31 l.3103–6593. Excluded: the Argument (l.3051–3085), Dramatis Personae (l.3086–3102) and FOOTNOTES (l.6594–6620).
- **Alignment.**
  - Source 13,820 tokens; edition 13,787.
  - Source covered 99.57%; edition covered 99.81%.
  - 0 MISSING runs of 12 or more tokens.
  - 1 EXTRA run of 14 tokens: Tinct's "[Text lost in manuscript.]" placeholders at 2.18–2.22. They stand for Storr's asterisk lacuna rows (l.3462–3477); this is faithful and documented in SOURCE.md (VARIANT).
- **Structure.** The opening ("Enter the blind OEDIPUS…") and ending ("Wail no more, let sorrow rest…") are correct.

| Standard unit | Served under | Coordinates |
|---|---|---|
| First Episode 254–667 (incl. kommos 510–548) | ch2 "Parodos" tail, ch3, ch4 "**First Stasimon**", ch5 "**Second Episode**" | 2.62–2.76, ch3, 4.0–4.64 (kommos 4.26), 5.0–5.51 |
| First Stasimon 668–719 (Colonus ode) | ch6 "**Second Stasimon**" | 6.0–6.3 |
| Second Episode 720–1043 | ch6 tail, ch7 "Third Episode", ch8 "Third Stasimon" | 6.4–6.7, 7.0–7.83, 8.0–8.10 |
| Second Stasimon 1044–1095 | ch8 | 8.11–8.14 |
| Third Episode 1096–1210 | ch9 "**Fourth Episode**" | 9.0–9.38 |
| Third Stasimon 1211–1248 ("Not to be born") | ch9 "**Fourth Episode**" | 9.39–9.40 |
| Fourth Episode 1249–1446; kommos 1447–1499; Exodos | ch9, ch10, ch11 | 9.41–9.73 ✓ |

- **Verdict: DEFECTS.** The text is complete against the source.

| ID | Type | Sev | Editions | Location | Summary |
|---|---|---|---|---|---|
| G04-oedipus-at-colonus-01 | MISLABELED | S3 | all three | ch2–ch9 | "First Stasimon" (4.0, "Our pity, Oedipus…", l.4080) holds no stasimon. The Colonus ode (l.4666) is labelled "Second Stasimon". "Not to be born at all" (l.5679) is inside "Fourth Episode". |

- **Inheritance.** modern-en and modern-da inherit the labels, as does green-oedipus-at-colonus (`@63fd17792`).
- **Needs investigation.** PG #31 itself mislabels speakers at 3.32–3.34 (OEDIPUS where ISMENE speaks) and 5.25–5.26 (THESEUS twice). The edition serves this faithfully, and the package documented it. A check against the Loeb print could correct it.

## oresteia — The Oresteia

- **Served editions.**
  - `original-en`: `c6189c462535c358`, "Morshead (1881)". 26 chapters and 771 paragraphs, grouped into 3 sections.
  - `modern-en`: `861b154ade471832`.
  - `modern-da`: `c131aa0ae927e741`.
- **Source.** https://www.gutenberg.org/cache/epub/8604/pg8604.txt, retrieved 2026-09-25T11:53:33Z, sha256 `45a053562a54a4cd710a045029189de7e8d785d394064ffa048c26e509a5abaf`.
  - Title: "The House of Atreus; Being the Agamemnon, the Libation bearers, and the Furies". Translator: E. D. A. Morshead.
  - The local raw is the PG file plus a BOM.
- **Body.** l.118–5941. Excluded: the editorial Introductory Note (l.58–105).
- **Alignment.**
  - Source 35,286 tokens; edition 35,155.
  - Source covered 99.58%; edition covered 99.96%.
  - 4 MISSING runs of 12 or more tokens (3 of them 25 or more):
    - Dramatis Personae plus the opening scene-settings of the three plays (24, 36 and 52 tokens). SOURCE.md says these were stripped deliberately (SCOPE).
    - The Eumenides scene change (27 tokens; see G04-oresteia-03).
  - 0 EXTRA runs; 0 order anomalies; 0 duplicates.
  - The Eumenides refrains (25.1 and 25.5) are repeated in the source too.
- **Structure.**
  - The opening (the Watchman) and ending (the final chant, then "[Exeunt omnes]") are present.
  - Agamemnon's labels are broadly correct. Clytemnestra's return (1035–1068) sits at 8.10–8.16 under "Third Stasimon", which is minor.
  - Libation Bearers:
    - "Kommos" (ch14, "Yea, and my heart o'erflows…", l.2967) is the recognition scene. The real kommos starts at 15.1 (l.3154) under "Second Episode".
    - "Second Stasimon" (ch16, l.3594) is the first stasimon.
    - "Third Episode" (ch17, 105 paragraphs) also holds the 2nd stasimon (17.33, l.3868), the 4th episode, the 3rd stasimon (17.88, l.4128) and most of the exodos (17.91–17.104, l.4183).
    - "Exodos" (ch18) holds only the final chorus.
  - Eumenides:
    - The Binding Song, the true first stasimon, is at 21.6–21.13 (l.4820), inside "First Episode".
    - "First Stasimon" (ch23, l.5097) is the second stasimon.
    - "Parodos" (ch20) opens with the Ghost scene.
- **Verdict: DEFECTS.** The text is complete against the source.

| ID | Type | Sev | Editions | Location | Summary / evidence |
|---|---|---|---|---|---|
| G04-oresteia-01 | MISLABELED | S3 | all three | Libation Bearers ch14–18; Eumenides ch20–25 | As above. green-oresteia (`@2677b9a8c`) ACCEPTANCE-RECORD.md l.49: "All 26 are real Act/Scene-equivalent reading units". |
| G04-oresteia-02 | MISLABELED | S4 | all three | 6.14, 10.2, 17.16, 23.3, 26.31 | Five italic verse lines (34 words) are served as bracketed stage-direction paragraphs that split their stanzas (pg8604 l.1230, 2077, 3767, 5123, 5933). They include the trilogy's **final line**, served at 26.31 as "[Ring out your chant, ring out your joy's acclaim!]". modern-en and modern-da inherit this except at 23.3. green-oresteia l.167–172 claims "the source sets … cries inside square brackets" and re-bracketed 23.3 in its candidate. |
| G04-oresteia-03 | MISSING | S4 | all three | after 20.37 | The scene change is absent. Served before: "[Exeunt omnes]". Missing: "The scene changes to Athens. … Orestes is seen clinging to it." (27 words, l.4714–4716). Served after: "ORESTES. Look on me, queen Athena". It is absent from modern-en and modern-da and present in the local raw. No other marker of the move to Athens is served. |
| G04-oresteia-04 | EXTRANEOUS | S4 | original-en | 17.1 | A stray "CHORUS." label is prefixed to "ORESTES (knocking at the palace gate)". The source has the stage direction at l.3658 followed by the ORESTES heading, with no CHORUS label. The modern renderings drop the stray label. |

- **Scope.** The Introductory Note, Dramatis Personae and opening scene-settings are not served (SCOPE).
- **Variants.** Speaker labels are normalised: KILISSA becomes "A NURSE" and CHORUS OF FURIES becomes "CHORUS". The drop-cap splits "L ord" (11.0) and "F irst" (19.0) are in the PG file itself.

## medea — Medea

- **Served editions.**
  - `original-en`: `6e6e27372c778b45`, "Murray (1906)".
  - `modern-en`: `2d30ac0eb7fa802a`.
  - `modern-da`: `37e6cf0812bb8bb7`.

  All three have 7 chapters and 241 paragraphs.
- **Source.** https://www.gutenberg.org/cache/epub/35451/pg35451.txt, retrieved 2026-09-25T11:53:36Z, sha256 `e428f259d7b438517e01deeb05a4cac06645ff1a90e4e650a4a5cde84779264e`.
  - Title: "Medea of Euripides". Translator: Gilbert Murray.
  - The local raw is the PG file plus a BOM.
- **Body.** l.297–2918. Excluded: Murray's Introduction (l.81–260), the Characters list and production note, NOTES TO MEDEA (l.2919ff), and the Transcriber's note.
- **Alignment.**
  - Source 14,130 tokens; edition 14,126.
  - Source covered 99.69%; edition covered 99.72%.
  - 0 runs of 12 or more tokens; 0 order anomalies.
  - The residual short runs are all stage-direction junctions (see below).
  - All odes and the ending ("Great treasure halls hath Zeus in heaven…") are present.
- **Stage-direction check.** Of Murray's 34 stage directions, **32 are attached to the paragraph before the speech they follow.** The total is 327 words. Locations: 1.0, 1.5, 1.16, 1.18, 2.4, 2.6, 3.21, 4.3, 4.20, 4.23, 5.5 (×2), 6.0 (×3), 6.11 (×2), 6.13, 6.16, 6.28 (×4), 6.30, 7.5, 7.8, 7.10, 7.17, 7.19, 7.28, 7.49, 7.64.
- **Structure.** Murray's own `* * *` separators (l.1376, 1823, 2091) mark the 2nd, 3rd and 4th stasima. Tinct's chapters ignore them:
  - "Second Episode" (ch4) spans the 1st stasimon (4.0), the Jason agon, the 2nd stasimon (4.23) and the Aegeus scene (4.25–4.78).
  - "Third Episode" (ch5) is Medea's plan plus the 3rd stasimon (5.7).
  - "Fourth Episode" (ch6) spans the 4th episode, the 4th stasimon (6.15), the Attendant and the great monologue (6.18–6.29), and the anapaests (6.30).
  - "Exodos" (ch7) includes the Messenger scene and the murder stasimon (7.10–7.20).
- **Verdict: DEFECTS.** The text is complete against the source; the damage is to order and labels.

| ID | Type | Sev | Editions | Location | Summary / evidence |
|---|---|---|---|---|---|
| **G04-medea-01** | MISPLACED | **S2** | all three | 32 places (list above) | Stage directions come one speech early. Examples: "[Exit MESSENGER.]" ends 7.5, but the Messenger speaks at 7.6 ("When thy two children, hand in hand entwined…"); the source puts the exit after his speech (l.2483). "[She rises on the chariot and is slowly borne away]" ends 7.49, before Medea's last speech at 7.50 (l.2823). "[A cry is heard within]" comes a stanza early (7.10, l.2562). "[Exit CREON with his suite]" ends 3.21, before Creon's reply at 3.22 (l.950). All the stage business of the great monologue is served at 6.28, before it begins. modern-en and modern-da inherit this. green-medea (`@bd06d1791`) fidelity-review-1.md l.105–111 cleared 3.21/3.22 because it "exists in source.json itself"; its candidate inherits all 32. |
| G04-medea-02 | MISLABELED | S3 | all three | ch4–ch7 | The 7-chapter scheme gives no stasimon a unit of its own and misnumbers the episodes (above). SOURCE.md claims the chapters follow "classical Greek dramatic structure". |
| G04-medea-03 | MISLABELED | S4 | all three | 1.17, 1.18, 2.1, 2.2, 3.21, 4.25 | Speaker headings with a parenthetical direction are merged into the previous speech. Example: 4.25 "AEGEUS. Have joy, Medea! … MEDEA (_looking up, surprised_). Oh, joy on thee, too". |

## bacchae — The Bacchae

- **Served editions.**
  - `original-en`: `fd89db94d47b8a03`, "Murray (1906)".
  - `modern-en`: `9d205d8b021e5028`.
  - `modern-da`: `0b34847e60f068f0`.

  All three have 11 chapters and 336 paragraphs.
- **Source.** https://www.gutenberg.org/cache/epub/35173/pg35173.txt, retrieved 2026-09-25T11:53:34Z, sha256 `0394fd09ceb66b21c00b96d68be38fbeaa1408d2e30fd8128b8db7bbd708e83f`.
  - Title: "The Bacchae of Euripides". Translator: Gilbert Murray.
  - The local raw is the PG file plus a BOM.
- **Body.** l.165–3027. Excluded: the title pages, Characters list and NOTES ON THE BACCHAE (l.3028ff).
- **Alignment.**
  - Source 13,727 tokens; edition 13,743.
  - Source covered 99.54%; edition covered 99.79%.
  - 0 runs; 0 order anomalies.
  - 1 DUPLICATE run of 27 tokens (Teiresias's entrance).
- **Structure and completeness.**
  - The manuscript lacuna after 11.87 is served faithfully: the asterisk rows plus Murray's note "[A page or more has here been torn out of the MS…" at 11.88.
  - Stage directions are placed correctly, unlike Medea.
  - Labels match the units, except that "Exodos" also holds the 5th episode and 5th stasimon, and "Second Stasimon" includes the palace miracle.
- **Verdict: COMPLETE-VS-SOURCE**, with S4 findings only.

| ID | Type | Sev | Editions | Location | Summary / evidence |
|---|---|---|---|---|---|
| G04-bacchae-01 | EXTRANEOUS | S4 | all three | 2.8/3.0, 4.3/5.0, 10.7/11.0; 9.29, 11.11 | Entrance directions are duplicated across chapter boundaries: Teiresias (27 words, l.407), the first line of the guards' entrance (l.821), and the Messenger (l.2212). Paragraphs 9.29 and 11.11 end with a stray "CHORUS." label. The green-bacchae candidate inherits this. |
| G04-bacchae-02 | MISLABELED | S4 | all three | 21 merged paragraphs; about 35 part-labels | Murray's parenthetical speaker headings are merged into the previous speech. For example, 7.37 holds three speeches. Murray's choral part-labels (A MAIDEN, SOME MAIDENS, OTHERS, A BACCHANAL, A VOICE WITHIN) are replaced by "CHORUS." or "THE VOICE.". |
| G04-bacchae-03 | MISLABELED | S4 | all three | ch6, ch11 | "Exodos" also contains the Fifth Episode (the Second Messenger) and the Fifth Stasimon (11.12–11.14). |

## gilgamesh — The Epic of Gilgamesh

- **Served editions.**
  - `original-en`: `1c9886e2b341187c`, "Prose Compilation", translator null.
  - `modern-en`: `419a43b05bfcbf84`.
  - `modern-da`: `70a40c3d7e96da38`.

  All three have 12 chapters and 253 paragraphs.
- **Source.** https://www.jasoncolavito.com/epic-of-gilgamesh.html, retrieved 2026-09-25T11:53:59Z, sha256 `be5fbeff9bc5a55fc3d51b6bd5b96061cee5115f8462907e6ef2949117d19417`.
  - The text is Jason Colavito's reading version, "adapted and modernized from the translation of William Muss-Arnolt" (1901), with Jastrow/Clay (1920) and King (1903) material added.
  - The page footer reads "© 2010–2026 Jason Colavito. All rights reserved."
  - The local raw (`books/raw/gilgamesh/raw.txt`, the page HTML from 2026-03-31, sha256 `be5bedc7…`) has epic text identical to the current page. The differences are only in site navigation.
- **Body.** From "TABLET I" to "Sources:". Excluded: Colavito's introduction and the Sources list.
- **Alignment.**
  - Source 19,096 tokens; edition 19,037.
  - Source covered 99.82%; edition covered 99.95%.
  - 0 runs.
  - The paragraph-by-paragraph diff per tablet is identical except for two points:
    1. Colavito prints the Enkidu/Shamhat paragraph twice, at the end of Tablet I and the start of Tablet II (a catch-line). It is served once, at 2.0; this is a defensible de-duplication. The Tablet VI/VII catch-line is served twice.
    2. "Niṣir" is served as "Niir".
  - The source's lacuna marks (43 ellipses) are carried over unchanged, since the paragraph diff is otherwise identical.
- **Verdict: DEFECTS.** The text is complete against the source.

| ID | Type | Sev | Editions | Location | Summary |
|---|---|---|---|---|---|
| G04-gilgamesh-01 | MISLABELED | S3 | all three | edition label | The label "Prose Compilation" with translator null hides that the served text is a named modern adapter's copyrighted adaptation. SOURCE.md treats it as public domain through its base translations. |
| G04-gilgamesh-02 | MISSING | S4 | original-en | 11.14 | The character "ṣ" was dropped at import: "Mount Niṣir" is served as "Mount Niir" (5×). modern-en and modern-da have it right ("Nisir"). green-gilgamesh (`@356b3696d`) fidelity-review-1.md l.87–89 "restored" Niir in its candidate. |

- **Needs investigation.** A rights and provenance decision on the Colavito text.
- **modern-en.** 9.12 compresses the formulaic "double-hour" march (ratio 0.59) but keeps every beat (VARIANT). The near-duplicates at 12.5–12.7 are repetitions in the source.

## beowulf — Beowulf

- **Served editions.**
  - `original-en`: `18c82694331e87f4`, "Hall (1892)".
  - `modern-en`: `e015cde16836f30d`.
  - `modern-da`: `3f0b1ff0518a7476`.

  All three have 43 chapters (the fitts) and 375 paragraphs.
- **Source.** https://www.gutenberg.org/cache/epub/16328/pg16328.txt, retrieved 2026-09-25T11:53:37Z, sha256 `8909085dc48daf123d29c40ecbb3837b16ba7f96bf0cbb9fe72de133a2d35348`.
  - Title: "Beowulf: An Anglo-Saxon Epic Poem". Translator: J. Lesslie Hall, D.C. Heath, ©1892.
  - The label is correct: this is Hall's translation, not Gummere's (#981).
  - There is no local raw; only SOURCE.md exists.
- **Body.** l.937–6560, with Hall's apparatus stripped: 448 `{side-notes}`, footnotes (including multi-paragraph notes) and line numbers.
- **Alignment.**
  - Source 26,267 tokens; edition 25,995.
  - Source covered 98.96%; edition covered 100%.
  - The only uncovered tokens are the 43 fitt headings, which are served as chapter titles. All 43 fitt boundaries match.
  - 0 EXTRA runs; 0 order anomalies; 0 duplicates.
  - Opening ("Lo! the Spear-Danes' glory…") and ending ("…fondest of honor.") are correct.
- **Scope.** Hall's dedication, Preface, Abbreviations, Bibliography, Glossary, word list, side-notes, footnotes and Addenda are editorial apparatus and are not served.
- **modern-en.** The 390 MIDSPLIT flags are verse enjambment. The ratio sweep is clean.
- **Verdict: COMPLETE-VS-SOURCE.** No findings.

## the-aeneid — The Aeneid

- **Served editions.**
  - `original-en`: `4a763d99af704695`, "Dryden Translation (1697)".
  - `modern-en`: `1e9b6dd64911f963`.
  - `modern-da`: `ed6ef13cbfdd8670`.

  All three have 12 chapters and 544 paragraphs.
- **Source.** https://www.gutenberg.org/cache/epub/228/pg228.txt, retrieved 2026-09-25T11:53:39Z, sha256 `398117fc34d7876e681e1feae1ebabfc72485be17f819779796d3dcfe886a504`.
  - Title: "The Aeneid". Translator: John Dryden.
  - The local raw is the PG file plus a BOM.
- **Body.** l.70–14521.
- **Alignment.**
  - Source 113,581 tokens; edition 113,533.
  - Source covered 99.96%; edition covered 100%.
  - 0 runs; 0 order anomalies.
  - The only uncovered tokens are the 12 "BOOK N" and "THE ARGUMENT." headings.
- **Scope decision (recorded).** PG #228 contains no Dryden Dedication, Postscript or notes. Dryden's per-book Arguments are his own framing, and they are served.
- **Verdict: COMPLETE-VS-SOURCE**, with one S4 finding.

| ID | Type | Sev | Editions | Location | Summary |
|---|---|---|---|---|---|
| G04-the-aeneid-01 | MISLABELED | S4 | all three | 1.0 … 12.0 | Dryden's prose Argument is served as each book's first paragraph with the heading "THE ARGUMENT." dropped (l.72, 1199, … 13053). The editorial summary therefore reads as the opening of the poem. |

- **Needs investigation (low priority under the English-only scope).** modern-da has 38,520 words against 107,470 in the original: 36%, and 24% in Book 10. It is a condensed retelling, so whole passages are absent in Danish.

## Tool caveats

- **`align.py` misses dropped repeats.** It does not see a missing second copy of repeated text. The 10-word repeat check covered this and found only the Gilgamesh catch-line.
- **`align.py` misses small displacements.** It reports order anomalies only when text moves backwards by more than 50 tokens. Stage-direction displacement was therefore measured separately.
- **Parenthetical merges are counted by regex.** Murray's parenthetical headings merge in 20 places in the Bacchae source and 7 in Medea; the edition coordinates were counted by regex. The part-label count for the Bacchae (about 35) is approximate.
- **Standard unit boundaries** come from the conventional divisions: Jebb for Sophocles; standard Aeschylus and Euripides line numbers. Coordinates were verified phrase by phrase against pg31, pg8604 and pg35451.
