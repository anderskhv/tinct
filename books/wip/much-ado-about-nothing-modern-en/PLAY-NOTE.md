# Much Ado About Nothing — PLAY-NOTE (supplements SHAKESPEARE-BRIEF.md; this note wins on Much Ado points)

TARGETED repair. Only chapters 15, 16 and 17 (Act 5 sc.2, 3, 4) are re-rendered; chapters 1-14 are already modernized and must not be touched. Ids are chapter:paragraph, 0-based. Slices: ch015_p000-039 (40 paragraphs), ch016_p000-016 (17), ch017_p000-069 (70). Paragraph count stays 1:1 with the served edition.

## 1. KEEP the served live_modern form of stage directions and speaker labels (overrides the brief)

This play is the reverse of Henry V / Coriolanus: the served live_modern form is the house form (chapters 1-14 use it consistently), so renderers copy it, not the source form. Compare against `served-live-modern-en.json`, never `served-original-en.json`, for every paragraph below.

- **Speaker prefixes:** identical in source and live_modern in all 17 chapters (BENEDICK., MARGARET., CLAUDIO., A LORD., FRIAR., LEONATO., ANTONIO., DON PEDRO., HERO., BEATRICE., URSULA., MESSENGER.). Copy exactly. A prefix-only paragraph (16:3 `CLAUDIO.`) stays prefix-only.
- **Bare "Enter ..." directions get brackets, no underscores:** 15:0, 15:15, 15:35, 16:0, 17:0, 17:18, 17:28, 17:66 are written `[Enter Beatrice.]`, `[Re-enter Antonio, with the ladies masked.]` etc. Copy the live_modern paragraph character for character (it also adds the serial comma: `[Enter Don Pedro, Claudio, and Attendants, with music and tapers.]`).
- **Exeunt becomes Exit:** 15:39 and 16:16 are `[Exit.]`, 17:6 `[Exit Ladies.]`, 17:69 `[Dance. Exit.]`. Not `[Exeunt.]`, not `[_Exeunt._]`.
- **Other bracketed directions** (15:12 `[Exit Margaret.]`, 16:4 `[Reads from a scroll.]`, 17:23 `[Exit Antonio.]`) are already the same in both; copy verbatim.
- **Leading inline directions inside speech paragraphs** (17:35 `[Unmasking.] ...`, 17:43 `[Unmasking.] ...`): keep the bracket exactly, then render the speech after it.
- Bare song/epitaph headings `Epitaph.` (16:5) and `Song.` (16:9) stay exactly as written (no brackets, no underscores).
- Straight apostrophes and quotes; no ellipses the source lacks. The renderer should open the live_modern paragraph, keep every stage-direction paragraph untouched and change only speech text.

## 2. Names (identical in source and live_modern; keep them all through chapters 15-17)

Benedick (never "Benedict"), Beatrice, Claudio, Hero, Don Pedro ("the Prince" is a title, kept: "the Prince and Claudio"), Leonato, Antonio, Margaret, Ursula, Friar Francis, Borachio, Don John. Dogberry and Verges do not speak in these three scenes (they exit in 5.1); if either is named, keep the name. Addresses stay: "signior", "my lord", "brother" (Antonio and Leonato), "Signior Leonato", "Mistress Margaret", "niece". Keep "Hero" even in the epitaph ("the Hero that here lies").

## 3. What was wrong and how far to move

Live_modern for 15-17 changed little beyond thou/thee, contractions and "hath" (e.g. 15:10 "has legs", 17:8 "steady countenance", 17:9 "ask your help"). The repair must go further, to the Hamlet / Julius Caesar register: short speakable sentences (about 13 words), unpack figures and name who is meant, nothing omitted, nothing invented. Do not leave a speech where only pronouns changed. Verse speeches run together into one paragraph, and each rhymed couplet becomes plain sentences.

## 4. Hardest passages

- **15 (Benedick and Margaret, 15:1-14; Beatrice, 15:15-34; Ursula, 15:35-38).** Bawdy double meanings; keep both senses. "Come over it" (surpass / get on top of), "keep below stairs" (Margaret's reply, the bawdy sense stays at full strength), "greyhound's mouth ... it catches", "fencer's foils ... hit but hurt not", swords and bucklers, "put in the pikes with a vice" (the pike set in a buckler's centre, a pun), "legs". Keep the sexual innuendo as strong as the original, no softer and no coarser. In Beatrice's exchange keep the wit-fight about "foul words", "a kiss" and "the bad breath"; keep every jest in the paragraph, and check the source paragraph itself for any herb or name pun before rendering. Ursula's news ("Madam, you must come to your uncle") is plain prose.
- **16 (Claudio's epitaph, hymn and farewell).** 16:6 is the **epitaph** (six lines of rhymed verse): render plainly, keep "slanderous tongues", "Hero", "life that died with shame / lives in death with glorious fame" (guerdon = reward, payment). 16:7 and 16:8 are the hanging of the scroll on the tomb ("Hang thou there upon the tomb, praising her when I am dumb"): keep that; the hymn instruction ends with "Now, music, sound, and sing your solemn hymn". 16:10 is the **song** to Diana, goddess of the night, who is asked to pardon those who killed "thy virgin knight" (Hero, slain by slander). Render the words plainly; keep the refrains "Heavily, heavily", "Midnight, assist our moan", "Graves, yawn and yield your dead"; keep sentence count close and do not force rhymes. 16:11 and the Don Pedro dawn speech (16:12 "put your torches out", the wolves have preyed, Phoebus's wheels, "dapples the drowsy East") keep the dawn image and name Phoebus (the sun god's chariot wheels). 16:14 "Hymen now with luckier issue speed's": Hymen, god of marriage, and the "luckier ending" sense, naming the wedding they will have at Leonato's.
- **17 (the reconciliation, Hero unmasked, the double wedding).** The long speeches (Leonato 17:2 and 17:5; Benedick's request 17:11; Leonato and Claudio's exchange 17:19-27) keep every plain step. The masked brides (17:28 onward): keep the reveal staged exactly as the directions give it, no added stage business. 17:35 "And when you lov'd, you were my other husband" (Hero's two "other" lines, 17:35 and the one before) keep the paired "wife / husband" sense. Beatrice and Benedick's confession scene (about 17:43-62): the "halting" sonnets, "I yield upon great persuasion" and "for I was told you were in a consumption": keep each joke, make the proof of love ("pulse", "heart") audible. Kisses and "peace, I will stop your mouth" (Benedick, near 17:60-62; famous, near-clear line: keep "Peace! I will stop your mouth" and its kiss). Benedick's closing "Come, come, we are friends ... let's have a dance ere we are married" (about 17:63-65) and "Think not on him till tomorrow" (about 17:67-68): keep a playful tone; the Messenger's news that Don John is captured (17:66-68) is plain prose.

## 5. Prose and verse mix

Prose: Benedick and Margaret, Beatrice and Benedick, banter generally (15, the second half of 17). Verse: Claudio's epitaph, the song, Don Pedro's dawn speech (16), Leonato and the Friar at the start of 17. Render both as sentences a person would say aloud; verse may keep a more measured cadence, banter must be quick and playful.

## 6. Wordplay and Dogberry's malapropisms

Dogberry's malapropisms ("comprehended two auspicious persons", "redemption" for damnation, "senseless", "suspect our ears") live in chapters 1-14 and are already rendered; leave them. If any appear in 15-17 they stay malapropisms, the way the Hostess's errors were kept in Henry V: the wrong word kept (or its equal in modern speech), never silently corrected, with the sense still understandable from context. The rest of the wordplay here is Beatrice and Benedick's: keep each jest ("Benedick the married man", "I will live in thy heart, die in thy lap", and the scorn that turns into love).

## 7. Oddities

- Continuations: 17:7 (`You know your office, brother ...`) has no prefix because it follows `[Exit Ladies.]` and continues Leonato; do not add one.
- 16:5 `Epitaph.` and 16:9 `Song.` are heading paragraphs, kept verbatim; the italic `_..._` markers used elsewhere in the play are absent in these songs, so add none.
