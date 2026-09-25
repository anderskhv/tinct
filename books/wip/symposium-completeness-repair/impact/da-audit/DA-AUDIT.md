# Danish Symposium (`symposium-modern-da.json`): alignment and omission audit

Audit date: 2026-09-25. This was a read-only audit. No repository file was changed and no Danish text was written.

- **Inputs:** `app/public/data/editions/symposium-{original-en,modern-en,modern-da}.json`. Each file has 8 chapters and 217 paragraphs, split 40/8/12/10/18/13/115/1.
- **Per-paragraph record:** `da-paragraph-audit.json`, one object for each of the 217 Danish paragraphs. Besides the fields you asked for, each object also has `en_original_words`, `omission_severity` (none/minor/moderate/major), `other_type` where it applies, and `notes` (typos, artifacts and boundary smoothing).

## Method

- I read every Danish paragraph in full against the English modern and Jowett paragraphs at the same coordinate `c.i`. Word ratios were used only to decide reading order.
- **Severity scale:**
  - *minor*: one phrase, detail, name or low-weight sentence is missing.
  - *moderate*: a sentence-level argument step, example or image is missing, or several details are.
  - *major*: several sentences, or a claim that defines the paragraph, are missing.
- **Trivial losses** are logged as `trivial:` but do not change an `aligned-full` verdict. Examples: vocatives, speaker tags, redundant intensifiers.
- **Boundary smoothing** is logged in `notes` and is **not** counted as misalignment. It covers clause-level adjustments where no content moves to another coordinate: 1.11, 1.36, 6.3 and 7.20.

## Results

| Ch. | Danish title | aligned-full | aligned-condensed | misaligned | other | DA/EN-modern words |
|---|---|---|---|---|---|---|
| 1 | Sammenkomsten | 33 | 7 | 0 | 0 | 0.77 |
| 2 | Faidros' tale | 4 | 3 | 0 | 1 | 0.72 |
| 3 | Pausanias' tale | 3 | 2 | **7** | 0 | 0.56 |
| 4 | Eryximachos' tale | 8 | 2 | 0 | 0 | 0.70 |
| 5 | Aristofanes' tale | 13 | 5 | 0 | 0 | 0.65 |
| 6 | Agathons tale | 11 | 2 | 0 | 0 | 0.73 |
| 7 | Sokrates og Diotima | 103 | 12 | 0 | 0 | 0.78 |
| 8 | Alkibiades | 1 | 0 | 0 | 0 | 0.97 |
| **Total** | | **176** | **33** | **7** | **1** | **0.73** |

The 33 condensed paragraphs break down as **3 major** (3.1, 5.3, 5.4), **7 moderate** (3.2, 4.2, 4.4, 5.6, 7.60, 7.62, 7.105) and **23 minor**.

### Key findings

1. **The only structural misalignment is chapter 3, Danish 3.3–3.9.** All other paragraphs are index-aligned, including all 115 in chapter 7.
2. **A paragraph-count check cannot see the chapter-3 problem.** Danish merges English 3.3 and 3.4 into 3.3, then spreads English 3.8 and 3.9 across Danish 3.7–3.9. The two effects cancel, so the chapter still has 12 paragraphs.
3. **Omissions cluster in the Pausanias and Aristophanes speeches** (chapter ratios 0.56 and 0.65). They are skewed towards the dialogue's explicit statements about love of youths and male–male desire (see *Omission pattern* below).
4. **One outright meaning error.** Danish 2.7 reverses the lover and beloved roles of Achilles and Patroclus, and the paragraph then contradicts itself.
5. **Danish reproduces all three known English structural defects exactly:** the missing opening, Alcibiades inside chapter 7, and the 7.69/7.70 mid-utterance split.

## Answers to questions (1)–(4)

1. **Is the same opening missing? Yes.** Danish 1.0, "APOLLODOROS: Ja, ven, og grunden til, at folk kalder mig skør og fra forstanden …", matches English 1.0, "APOLLODORUS: Yes, friend, and the reason people say I'm crazy and out of my mind …". Nothing from the Apollodorus–Glaucon opening appears anywhere in the Danish. Danish 1.0–1.39 correspond 1:1 in content to English 1.0–1.39.
2. **Is the chapter 7/8 boundary the same? Yes.** Danish chapter 7 has 115 paragraphs:
   - Danish 7.69, "Da Sokrates var færdig, applauderede alle … voldsom banken på hoveddøren", begins Alcibiades's arrival exactly where English 7.69 does.
   - The Alcibiades material runs through 7.114, "'Den sædvanlige historie,' sukkede Alkibiades …".
   - Danish chapter 8 is only the closing paragraph, 8.0: "Agathon var ved at rejse sig …".

   All 46 Danish paragraphs from 7.69 to 7.114 correspond 1:1 in content to the English.
3. **Is the 7.69/7.70 split the same? Yes.** Danish 7.69 ends "Men først, sig mig: på disse betingelser, må jeg komme ind?". Danish 7.70 is the fragment "Vil I drikke med mig eller ej?'", which corresponds to English 7.70, "Will you drink with me or not?'".
4. **Are the chapter titles consistent? Yes, with modern-en.** All eight Danish titles are faithful translations of the modern-en titles, and the Danish possessive forms are correct.
   - The only mismatch is chapter 5 in original-en, currently "Agathon & Aristophanes". The candidate in `books/wip/symposium-completeness-repair/` renames it "Aristophanes's Speech", after which all three editions agree.
   - The Danish titles inherit the English content mismatches. "Sokrates og Diotima" currently also holds Alcibiades (7.69–7.114), and "Alkibiades" holds only the ending. "Aristofanes' tale" also holds the Agathon–Socrates exchange (5.8–5.17), as in English.

## Misaligned paragraphs: chapter 3, Pausanias

| Danish | Renders English | Evidence (Danish → English) | Lost relative to what it renders |
|---|---|---|---|
| 3.3 | **3.3 + 3.4** (merge) | Its first five sentences are English 3.3 (Elis/Boeotia, Ionia, "Aristogeitons og Harmodios' kærlighed … styrte de athenske tyranner"). From "Så hvor kærlighed fordømmes, falder skylden på fordømmernes egen moralske svigt — herskernes egoisme eller undersåtternes fejhed" onward it is English 3.4 ("attributed to the bad character of those who condemn them — … the self-seeking of the rulers and the cowardice of the ruled"). | **Major.** "here in Athens, and in Lacedaemon"; "no one, young or old, says a word against them"; "subjects be poor in spirit"; "he is not thought to be doing anything dishonorable"; "that philosophy would bitterly condemn if they were done from any motive of profit, or desire for office, or power". |
| 3.4 | **3.5** | "En elsker må bede, trygle, sværge eder, sove ved dørtrin" = English 3.5 "He may pray, beg, supplicate, swear oaths, sleep on a mat at the door". At this coordinate English 3.4 begins "And so the ill repute …". | **Moderate.** "no friend will be ashamed of him or admonish him, and no enemy will accuse him of meanness or flattery"; "custom has decided they are highly commendable and bring no loss of character". |
| 3.5 | **3.6** | "om kærlighed er ærefuld eller skamfuld er ikke et simpelt spørgsmål" = English 3.6 "whether such practices are honorable or dishonorable is not a simple question". | **Moderate.** The mechanism of the custom: "have us yield to the one sort of lover and avoid the other … encourages some to pursue and others to flee … in contests and trials". |
| 3.6 | **3.7** | "Derfor er en hurtig overgivelse skamfuld — tiden er den sande prøve … Kun én vej forbliver ærefuld for den elskede: dydens vej" = English 3.7 "a hasty attachment is considered dishonorable: time is the true test … only one honorable way for the beloved to yield — the way of virtue". This is the paragraph the brief flagged. Against English 3.6 its ratio is 0.30. | **Moderate.** English 3.7's final sentence is not rendered anywhere in Danish: "For just as we granted that any service the lover renders … is not … flattery …, so the beloved has one … form of voluntary service that is not dishonorable: namely, virtuous service." |
| 3.7 | **3.8, first half** | "Vores skik siger, at når nogen tjener en anden i håb om at blive bedre … hverken vanærende eller smiger … da, og kun da, kan den elskede med ære give efter" = English 3.8 "For we have a custom according to which, if someone serves another … not open to the charge of flattery … and only then, may the beloved yield honorably". | None of note. |
| 3.8 | **3.8, second half + 3.9, first half** | "Med uegennyttig kærlighed er der ingen skam i at blive bedraget … elskeren er rig … vanæres" = English 3.8. Then "Men den, der giver efter i troen på, at elskeren er god … Intet kunne være ædlere" = English 3.9 "a man who gives himself to a lover because he believes him to be a good man … nothing can be nobler than that". | **Minor.** "for any base use"; "equal disgrace in being deceived or not" is mis-rendered as "bedrageri [bringer] lige stor vanære". |
| 3.9 | **3.9, second half** | "Så det er ædelt i alle tilfælde at acceptere en elsker for dydens skyld … Dette, Faidros, er mit offer til Eros" = English 3.9 "Noble, then, in every case … To you, Phaedrus, I offer this contribution". Alignment resumes at 3.10. | None. |

**Re-segmentation recipe (existing Danish text only, split at sentence boundaries):**

- New 3.3 = Danish 3.3 sentences 1–5, through "…styrte de athenske tyranner."
- New 3.4 = Danish 3.3 sentences 6–12, from "Så hvor kærlighed fordømmes …"
- New 3.5 = Danish 3.4; new 3.6 = Danish 3.5; new 3.7 = Danish 3.6.
- New 3.8 = Danish 3.7 + Danish 3.8 sentences 1–3, through "…sælge sig selv for penge."
- New 3.9 = Danish 3.8 sentences 4–6, from "Men den, der giver efter i troen på, at elskeren er god …", + Danish 3.9.
- 3.0–3.2, 3.10 and 3.11 are unchanged, and the chapter stays at 12 paragraphs.

Re-segmenting fixes the alignment but not the missing content. English 3.7's last sentence still has no Danish equivalent.

## Meaning error ("other")

**Danish 2.7 reverses the lover and beloved roles.**

- Danish says "Achilleus var elskeren, ikke den elskede" (Achilles was the lover, not the beloved).
- English says "toward his lover Patroclus — his lover and not his love". Patroclus is the lover and Achilles the beloved, "the fairer … beardless and younger".
- The next Danish clause, "idéen om, at Patroklos var den elskede, er en tåbelig fejl hos Aischylos", contradicts the Danish sentence before it.
- The reversal also undermines the paragraph's point that the gods reward "den elskedes hengivenhed mod elskeren".
- Danish also calls Patroclus "sin ven" where the English says "his lover".
- Otherwise the paragraph is complete.

## Condensed paragraphs

**Major**

- **3.1:**
  - Missing whole sentence: "This is the love that is directed toward youths, and because the goddess is older, there is nothing of wantonness in her."
  - Also missing: "turn to the male"; "and so it does good and evil quite indiscriminately"; the Common goddess "is far younger"; the closing "anyone can recognize the pure enthusiasts by the very character of their attachments".
- **5.3:**
  - Missing: "adulterers are generally of this breed, and also adulterous women who lust after men"; "the female companions are of this sort".
  - The whole closing sentence about the male halves is missing: "while they are young … they hang about men and embrace them, and they are themselves the best of boys and youths, because they have the most manly nature".
  - The paragraph borrows the line "Kærlighed er navnet på længslen efter og jagten på helhed" from 5.5, where it appears again.
- **5.4 (confirms the brief):**
  - Missing whole sentence: "When they reach manhood they are lovers of youth, and are not naturally inclined to marry or beget children; if they do so at all, it is only in obedience to the law, but they are satisfied if they may be allowed to live with one another unwedded."
  - Missing whole sentence: "And such a nature is prone to love and ready to return love, always embracing that which is akin to him."
  - Also missing: "manly countenance". "whether he be a lover of youth or a lover of another sort" becomes "af enhver type".
  - Word ratio 0.42.

**Moderate**

- **3.2:** Missing "they may turn out good or bad, in body or soul, and much noble enthusiasm may be wasted on them", the "freeborn women" analogy, and "because they see the impropriety and evil in them". "forbidden by law" is weakened to "bør frarådes".
- **4.2:** Missing the argument "harmony is a symphony, and symphony is an agreement; but an agreement of disagreements while they disagree there cannot be". Also missing "love which has not yet become double" and "(which latter is called education)".
- **4.4:** Missing the closing "Such is the great and mighty — or rather omnipotent — force of love in general" and "working by a knowledge of the religious or irreligious tendencies …".
- **5.6:** Missing Aristophanes's aside that Pausanias and Agathon "are both of the manly nature, and belong to the class which I have been describing". Also missing "like tallies" and "sculptured on monuments".
- **7.60:** Missing "naturally embraces the beautiful rather than the deformed body … he embraces the two in one person", "he tries to educate him", and "ever present to his memory, even when absent".
- **7.62:** Missing a ladder step, "how foolish would he be not to recognize that the beauty in every form is one and the same!". Only the weaker "beslægtet" is kept. Also missing "which he will despise and deem a small thing".
- **7.105:**
  - Missing "how superior he was to Laches in presence of mind".
  - Missing "most of his ways might perhaps be paralleled in another man, but his absolute unlikeness to any human being … is perfectly astonishing". Danish reduces this to "Jeg så mange bemærkelsesværdige ting om Sokrates den dag".
  - Also missing "served among the heavy-armed" and "better opportunity of seeing him than at Potidaea".

**Minor**

| Paragraph | Missing |
|---|---|
| 1.4 | "his victory sacrifice" |
| 1.16 | "a comical thing happened" |
| 1.24 | "I have never left you to yourselves" |
| 1.32 | "the Myrrhinusian" |
| 1.35 | "Melanippe" |
| 1.37 | "If you agree with me, there will be no lack of conversation" |
| 1.38 | "Nor will anyone disagree of those whom I see around me" |
| 2.2 | "of Generation" |
| 2.4 | "or submitting through cowardice when any dishonor is done to him"; "a state or"; "of their own city" |
| 2.6 | "son of Oeagrus"; "he was only a harp-player" |
| 5.0 | "unlike that of either Pausanias or Eryximachus" |
| 5.8 | "after the world of things which have been said already" |
| 6.3 | "the love of Aphrodite … the master is stronger than the servant" |
| 6.10 | "I must beg to be absolved from the promise"; "I will not make myself ridiculous by entering into any rivalry with you" |
| 7.0 | "and the answer would be right". Danish instead asks early "er Eros så kærlighed til noget?", the question that belongs to 7.8. |
| 7.45 | Socrates's reply "Certainly" |
| 7.48 | "he is always plotting against the fair and good" |
| 7.52 | "unless perchance there be some one who calls what belongs to him the good …" |
| 7.56 | "unlike the divine, which is always the same and not another" |
| 7.97 | "whether with boys, or without them" |
| 7.99 | "hear, O judges; for judges you shall be of the haughty virtue of Socrates" |
| 7.106 | "he clothes himself in language that is like the skin of the wanton satyr" |
| 7.107 | "son of Glaucon", "son of Diocles" |

**Omission pattern.** Many of the larger omissions remove the text's explicit references to love of boys and youths and to male–male desire:

- 3.1: "directed toward youths", "turn to the male"
- 3.2: "freeborn women"
- 5.3: "hang about men and embrace them … best of boys and youths"
- 5.4: "lovers of youth … not inclined to marry"
- 5.6: "both of the manly nature"
- 7.60: the body half of "the two in one person"
- 7.65: "fair boys and youths" is softened to "smukke unge mennesker"
- 7.97: "whether with boys"

This reads as systematic softening, not random compression.

## Non-structural defects noticed

- **Text artifact in 3.0:** the paragraph ends with a stray closing quote and comma, "…hvordan de udføres.',". This also closes Pausanias's quotation, although his speech runs on to 3.9.
- **Typos and grammar:**

  | Paragraph | Problem |
  |---|---|
  | 1.34 | "fløjteninepigen" |
  | 4.6 | "harmonisans" |
  | 6.6 and 7.65 | "fortrolder" (should be "fortryller") |
  | 7.92 | "fortrylles" (should be "fortrylle") |
  | 7.95 | "medsdrikkere" |
  | 7.96 | "brydede" |
  | 6.2 | "Altid lejret de blødeste …" (missing "i") |
  | 1.31 | redundant "heldigt … heldige" |
  | 7.98 | untranslated English word "coy" |

- **Smaller meaning slips:**
  - 7.51: "Men vi kalder dem ikke alle skabere" should logically be *digtere*.
  - 7.110: "læg dig under mig" drops "on the couch".
  - 1.14–1.15: the Homeric "Two going together" becomes the proverb "To hoveder er bedre end ét", which Danish then calls "et citat fra Homer".
  - 3.10: "bytte plads" where English has "switch turns".
- **Benign boundary smoothing (not counted as misalignment):**
  - 1.11 completes the sentence that English leaves open, repeating the content of 1.12's verse.
  - 1.36 takes "which I am about to speak" from English 1.37.
  - 6.3 takes "no one can give … or teach …" from English 6.4.
  - 7.20 anticipates the conclusion of 7.22.
- **English-side defects, seen in passing:**
  - original-en 5.16 reads "saying: not answer him" ("Do" is missing).
  - modern-en 1.24 has doubled quote marks around Agathon's words ("''I may touch you,' … sought.''").

## Implications for keeping Danish aligned after the English repair

**What the English repair does** (from `books/wip/symposium-completeness-repair/mapping/MAPPING.md`):

- New English 1.0–1.8 are inserted, and old 1.0–1.39 become 1.9–1.48.
- Old 7.0–7.68 keep their coordinates.
- Old 7.69–7.114 move to 8.0–8.45, and old 8.0 becomes 8.46.
- No paragraph is merged or split, so the 7.69/7.70 split is kept.
- The total goes from 217 to 226 paragraphs.

**1. Chapters 7 and 8: mechanical and safe.**

- Danish 7.69–7.114 and 8.0 correspond 1:1 in content to the English rows being moved, including the identical 7.69/7.70 split.
- The same `move` and `renumber` rows therefore apply to Danish unchanged, with no text edits and all character offsets preserved. This gives Danish chapter 7 69 paragraphs and chapter 8 47.
- "Sokrates og Diotima" and "Alkibiades" then describe their content correctly.
- Danish audio is keyed by index: `app/tts/regen-symposium-da.py` writes one `p{i}.mp3` per paragraph plus a per-chapter `manifest.json`. Chapter 7 p69–p114 and chapter 8 p0 would need re-keying to chapter 8 p0–p46, and the manifests rebuilt. The clips themselves can be reused.
- If the English repair ever merged 7.69 and 7.70, Danish would have to merge the same pair. Concatenating them reads cleanly.

**2. Chapter 1: blocked on text.**

Danish has no text for the 9 inserted paragraphs (627 modern-English words, 648 Jowett). Without them:

- Danish chapter 1 has 40 paragraphs against English's 49.
- Every Danish chapter-1 paragraph sits 9 slots early in Compare. For example, Danish 1.0 would sit beside English 1.0, "Concerning the things…".

Options:

- **(a) Translate the 9 paragraphs.** This is new Danish text, outside the 2026-09-21 English-only language scope, so it is Anders's decision.
- **(b) Insert 9 placeholder slots.** Put them at Danish 1.0–1.8 and renumber Danish 1.0–1.39 to 1.9–1.48. This restores index alignment without new text, but a Danish-only reader would see empty or non-Danish paragraphs. I did not assess how the reader handles that.
- **(c) Set modern-da `aligned: false`**, or keep it out of Compare, until someone decides.
- **(d) Leave it as is.** This breaks the `aligned: true` claim in `bookRegistry.ts`.

**3. Chapter 3: needed regardless of the English repair.**

- Chapter 3 is misaligned today (7 of 12 paragraphs), so `aligned: true` is already inaccurate there.
- The recipe above fixes it without new text.
- Unlike the chapter 7/8 move, it splits and merges paragraphs:
  - Any Danish highlights, notes or positions in Danish 3.3 and 3.7–3.9 need offset-shifted migration.
  - Four Danish audio clips need re-synthesis: new 3.3, 3.4, 3.8 and 3.9.
  - New 3.5–3.7 are plain renumbers of p4–p6.
- `IMPACT.md` §1 and §6 say Danish data and audio are unaffected "unless Danish is restructured". Both would be affected by this fix.

**4. Omissions do not affect index alignment,** but in Compare view the Danish is visibly shorter. The worst cases are 3.1, 5.3, 5.4 and 3.3, plus the meaning error in 2.7. Fixing them needs new Danish text, so it falls under the same scope decision as option 2(a).

**5. Validation.**

- Chapter 3 passes per-chapter count parity, so structural checks need more than counts.
- A per-paragraph length-ratio screen catches the region: at or below 0.45 it flags Danish 3.6 (0.30), 3.8 (0.36) and 3.9 (0.37).
- It also flags genuine omissions such as 5.4 (0.42), while 3.3 (0.76) and 3.7 (0.71) look normal. Ratios are only a screen, and the text still has to be read.

**Note:** `IMPACT.md` §7 points to `impact/modern-da-report.md`, which does not exist yet. This audit can serve as its input. Nothing was written to the repository.
