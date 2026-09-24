# R1 fidelity review, Part C (ch4 Preliminary Expectoration, ¶0–11)

- **Reviewer:** an independent fidelity reviewer, Danish to English. I did not write the draft.
- **Draft reviewed:** `drafts/C-ch4.json`.
- **Source:** `source/original-da-final.json`, chapter 4, ¶0–11.
- **Method:** I compared each paragraph and footnote with the Danish, sentence by sentence. I consulted no English translation.

## Summary

| ¶ | Verdict | Findings |
|---|---|---|
| 0 | PASS (1 MINOR) | 0.1 ADDITION (optional) |
| 1 | PASS | — |
| 2 + n4.2a | PASS (2 MINOR) | 2.1 ADDITION, 2.2 ADDITION. The note text and anchor pass. |
| 3 | PASS | — |
| 4 | PASS (2 MINOR) | 4.1 MEANING SHIFT, 4.2 foreign-insertion consistency |
| 5 | PASS | — |
| 6 | PASS (1 MINOR) | 6.1 ADDITION (acceptable; optional) |
| 7 | PASS (2 MINOR) | 7.1 MEANING SHIFT, 7.2 DISTINCTION (fear) |
| 8 | PASS | — |
| 9 | PASS (1 MINOR) | 9.1 ENGLISH (referent) |
| 10 | PASS (1 MINOR) | 10.1 definition placement |
| 11 | PASS (5 MINOR) | 11.1 MEANING SHIFT (connective), 11.2 MEANING SHIFT, 11.3 ENGLISH, 11.4 ENGLISH, 11.5 clarity (*Kongereise*) |

- **Totals:** 0 BLOCKER, 0 MAJOR, 15 MINOR.
- **Structure:**
  - There are 12 slots, with indices 0–11, one for each printed paragraph.
  - `sectionHeading` and `dividerBefore` are null throughout, which matches the source.
  - No note text or markers leak into the main text, and there are no archaisms.
- **Footnote n4.2a:**
  - The note is translated completely and correctly. It keeps the paired "It is a pity … / Fortunately …" and the closing "at least a little meaning … none at all" (*dog lidt Mening … slet ingen*).
  - The anchor passes. `anchorAfterEn` "things in the world do not go as the pastor preaches." ends the paragraph, as the Danish anchor *til i Verden som Præsten prædiker.* does.
- **"Mediation" at ¶2 (confirmed):**
  - The Danish has *den Mediterende … under Meditationen*, which is *meditere* (to meditate).
  - I searched the whole source. *mediere* and *Mediation* do not occur anywhere in chapter 4. The first occurrence is ch5 ¶4 (*lader sig ikke mediere*), where the accepted pilot already glosses it.
  - The brief's table is wrong on this point, and the drafter was right not to introduce "mediation".
- **First-use definitions:**
  - **Spiritual trial (¶7):** "a spiritual trial — an inner assault on a person" is brief. It uses the pilot wording and is supported by the sense of *anfægte* (to assail).
  - **Incommensurable (¶10):** "not measurable by any common standard" is brief and matches the dictionary sense. Its placement is the problem; see 10.1.
  - **Paradox (¶9), the absurd (¶10), the tragic hero (¶11) and the infinite movement (¶11)** are bare, as the brief requires.
- **Terminology:** everything was checked and conforms.
  - *Angest* / *Angst* is "anxiety" (¶0, 2, 4).
  - *Prøve* is "test"; *forsøges* is "put to the proof"; *Anfægtelse* is "spiritual trial" (¶7).
  - *Troens Bevægelse(r)* is "movement(s) of faith"; *den uendelige Bevægelse* is "the infinite movement".
  - *det Absurde* is "the absurd"; *Nød* is "distress"; *latterlig* is "ridiculous"; *salig* is "blessed" / "attain blessedness".
  - *Timeligheden* is "temporality"; *Virkelighed* is "actuality"; *Philosophien gaaer videre* is "Philosophy goes further".
  - *gaae ud over* is correctly kept distinct from *gaae videre*.
  - *tie* is "keep silent". *en Enkelt* and *det Enkelte* are correctly **not** rendered "the single individual".
  - The crucial *men jeg troer ikke* in ¶10 ("But I do not have faith") is right.
- **Voice:** Johannes's first person, his confessions (¶8, ¶10, ¶11) and the satire of the pastor (¶2) are intact.
- **Bible:**
  - **Matt 5:45 (¶0)** is freshly rendered in Kierkegaard's negated form ("does not rain on the just and the unjust alike").
  - **Matt 3:9, Isa 26:18, Matt 19, Gen 3:24 and Heb 4:12** are all short and not KJV wholesale.

## Per-paragraph findings

### ¶0 — PASS

- **0.1 ADDITION, MINOR (optional).**
  - Danish: *her gjælder det, at kun den, der arbeider, faaer Brødet*.
  - English: "Here the saying holds: only the one who works gets bread".
  - *det* is impersonal ("it holds that"). The draft ties the clause to the "saying", which is defensible because the same saying is being re-applied. Strictly, though, it is an addition.
  - Fix, if wanted: "Here it holds true that only the one who works gets bread; …"
- Everything else is exact:
  - *Ihændehaverens*, rendered "belongs to whoever holds it";
  - *kjelen, ikke modig*;
  - *17 Ahner*;
  - "brings forth his own father".

### ¶1 — PASS

- The Miltiades clause and the sleeplessness question are exact.
- The Themistocles referent is correctly left implicit.
- *Der var talløse Slægter*, rendered "There have been", is a trivial tense shift and acceptable.

### ¶2 (with n4.2a) — PASS

- **2.1 ADDITION, MINOR.**
  - Danish: *men dog gjælder det atter her, om man vil arbeide og være besværet*.
  - English: "Yet here, too, it holds true that everything depends on whether one is willing to work".
  - "everything depends on" intensifies the Danish, which says only that the issue is whether one is willing. *atter* ("again") echoes ¶0.
  - Fix: "Yet here again the question is whether one is willing to work and to be burdened."
- **2.2 ADDITION, MINOR.**
  - Danish: *uagtet han offrede det Bedste*.
  - English: "even though he sacrificed the best he had".
  - The whole passage turns on *det Bedste* as a vague, fixed formula ("'the best' is a vague expression"; "Isaac and the best"). Adding "he had" breaks the repeated token that the satire depends on.
  - Fix: "even though he sacrificed the best."
- **Checked and correct:**
  - *den Mediterende … Meditationen* is "meditates … meditation", with no mediation.
  - The pastor anecdote keeps the Danish tense shift.
  - *Jeg er Taler* is "I am an orator".
  - *Fias og Tant* is "frippery and nonsense".
  - The unfinished final conditional is resolved as "Or suppose …" with no added content.

### ¶3 — PASS

- The paragraph is exact.
- *i en anden Forstand tænker jeg vel* is "In another sense, I rather think", which keeps the hedge.

### ¶4 — PASS

- **4.1 MEANING SHIFT, MINOR.**
  - Danish: *Kan Troen ikke gjøre det til en hellig Handling at ville myrde sin Søn*.
  - English: "If faith cannot make the will to murder one's son a holy act".
  - "The will to murder" suggests murderous desire. *at ville* here is the same willingness/intent that the paragraph then renders "was willing to murder … was willing to sacrifice". Keeping the parallel matters for the ethical/religious contradiction.
  - Fix: "If faith cannot make it a holy act to be willing to murder one's son".
- **4.2 Foreign-insertion consistency, MINOR (policy).**
  - Danish: *ved at blive til Nul og Nichts*.
  - English: "reduced to nil and nothing".
  - The German *Nichts* is dropped as a Danish idiom. Yet ¶10 keeps the German-Danish *Schäfer-Historier* as a foreign insertion with a gloss.
  - Both calls are defensible, but they are inconsistent. The lead should choose one policy for Danicized German. Either render both outright (my preference: "nil and nothing", "pastoral idylls") or keep both with a gloss.
- **Checked and correct:**
  - *Hævd* is "prescriptive right".
  - *himmelraabende* is "cries to heaven".
  - "the ethical forgetting of the fact that Isaac was the son" keeps the parallel.
  - The closing "the faith that makes it hard for him" is right.

### ¶5 — PASS

- *hidtil har jeg ingen frygtet* is "Until now I have feared no thought".
- *tiet dermed* is "kept silent about it".
- *Blendværk* is "illusion".
- *sovet sig til* is "win … in his sleep".
- *veed jeg ikke, om* is rendered "I am not sure", a slight softening of "I do not know whether" that is acceptable.

### ¶6 — PASS

- **6.1 ADDITION, MINOR (acceptable; optional).**
  - Danish: *En forbigaaende Bevægelse har vel Enhver*.
  - English: "Everyone, no doubt, has a passing movement of feeling".
  - "of feeling" is added. It is justified by the preceding *Stemning* / *Rørelse* and keeps the obligatory "movement". I would keep it. It is recorded only because it is an addition.
- **Checked and correct:**
  - *ɔ: til det, den er* is "that is, what it is".
  - *extravagerer i Troen* is "runs to excess in faith".
  - *en Enkelt* is "someone", correctly not "the single individual".

### ¶7 — PASS

- **7.1 MEANING SHIFT, MINOR.**
  - Danish: *jeg har kjendt et Menneske, der engang kunde have frelst mit Liv*.
  - English: "I once knew a person who could have saved my life".
  - *engang* belongs to the saving ("who once could have saved my life"), not to the knowing. The English also turns "I have known" into a past acquaintance.
  - Fix: "I have known a person who once could have saved my life, if he had been magnanimous."
- **7.2 DISTINCTION, MINOR.**
  - Danish: *jeg frygter, at jeg senere skal mangle Kraft*.
  - English: "I am afraid that later I will lack the strength".
  - This is not an anxiety/fear blur, but the standard maps *frygte* to "fear". Given the book's title and the fear/anxiety policy, keep the lexeme visible.
  - Fix: "I fear that later I will lack the strength".
- **Spiritual trial definition.** "would be a spiritual trial — an inner assault on a person" is supported and brief.
- **The referent of *han*.** The draft resolves *Men elskede han ikke som Abraham* to "a father". That is grammatically right (the antecedent is *mangen Fader*) and acceptable.
- **Checked and correct:**
  - *Prøve* is "test"; *forsøges* is "put to the proof".
  - *i Tiden bliver han det ikke* is "but not in time", kept terse.
  - *Kongens Riger og Lande* is kept.
  - *Paa hver Station* is "At every stage".

**Cross-chapter note (not a Part C defect).** The accepted pilot's ch5 ¶0 also glosses spiritual trial ("in a spiritual trial — an inner assault on him"). Now that the first use is ch4 ¶7, that gloss is a second definition. §A5 of the standard says pilot text stays as accepted unless the book-level review finds a defect. Flag this for the book-level pass.

### ¶8 — PASS

- The compressed closing clause is rendered correctly: "as if overcoming it brought the shrewd head any further than the point that the simplest and most simple-hearted person reaches more easily".
- The relative clause *der bragte … videre … end til det Punkt* is hypothetical, and the "as if" framing captures it without distortion.
- *holde i Skjøderne* is "hold on to his coat-tails".

### ¶9 — PASS

- **9.1 ENGLISH (referent), MINOR.**
  - Danish: *beiler til dens Gunst, falbyder sin Deilighed til Philosophien*.
  - English: "courting philosophy's favor and offering her charms for sale to it".
  - Coming straight after "philosophy's", "her" can be misread as philosophy's charms. The reflexive *sin* makes them theology's own. The shift from "her" to "it" is also awkward.
  - Fix: "courting philosophy's favor and offering her own beauty for sale to philosophy".
- **Checked and correct:**
  - *Det skal være vanskeligt* is "is said to be hard", which keeps the reportative sense.
  - "Going beyond Hegel / getting beyond Abraham" is kept distinct from "go further".
  - "monstrous paradox" is bare, as required.
  - *Vuet* is "a view of it".

### ¶10 — PASS

- **10.1 Definition placement, MINOR (ENGLISH).**
  - Danish: *incommensurabel for hele Virkeligheden*.
  - English: "incommensurable with the whole of actuality — not measurable by any common standard".
  - Because the gloss comes after "actuality", it can read as describing actuality. The brief asks for the definition inside the sentence, at the term.
  - Fix: "God's love is, for me, in both a direct and an inverse sense, incommensurable — not measurable by any common standard — with the whole of actuality."
- **Checked and correct:**
  - *jam tua res agitur* is kept, with an accurate gloss.
  - *men jeg troer ikke, dette Mod mangler mig* is "But I do not have faith; this is the courage I lack". This is the central confession and it is exact.
  - *det Enkelte* is "particular things".
  - *viet til venstre Haand* is "married with the left hand". It is a period reference, understandable from the contrast with the right hand, so no gloss is needed.
  - *Jeg har seet det under Øinene* is "I have looked the terrible in the eye", a legitimate pronoun resolution.
  - "the absurd" is bare, as the brief requires.
- **A conflict between the standard and the brief (for the lead, not a draft defect).** §A5 of the standard says the absurd gets a short definition at its new first use. The brief says it is "defined by the text itself; do not gloss beyond it". The drafter followed the brief, and here the text itself does define it: "shut my eyes and plunge trustingly into the absurd … an impossibility".

### ¶11 — PASS

- **11.1 MEANING SHIFT (connective), MINOR.**
  - Danish: *Jeg kunde da heller ikke gjøre mere end den uendelige Bevægelse …*
  - English: "For I could do no more than make the infinite movement …"
  - *da heller ikke* ("nor, then") begins a series of negations that continues in the next sentence (*Jeg havde da heller ikke elsket Isaak* / "Nor would I have loved Isaac"). The draft replaces it with a causal "For", which drops the series and adds a justification.
  - Fix: "Nor, then, could I do more than make the infinite movement, so as to find myself and to rest in myself again."
- **11.2 MEANING SHIFT, MINOR.**
  - Danish: *maaskee var jeg snarere kommen for tidlig*.
  - English: "perhaps I would even have come too early".
  - *snarere* means "rather" (it contrasts with being late), not "even".
  - Fix: "perhaps I would rather have come too early".
- **11.3 ENGLISH, MINOR.**
  - Danish: *havde heller ikke ligget og drevet paa Landeveien*.
  - English: "I would not have lain dawdling on the highway either".
  - *ligge og drive* is an idiom for loitering. "Lain dawdling" is a literal calque.
  - Fix: "I would not have dawdled along the highway either".
- **11.4 ENGLISH, MINOR.**
  - Danish: *i Qvalitet af tragisk Helt*.
  - English: "in the capacity of tragic hero".
  - The English needs an article.
  - Fix: "in the capacity of a tragic hero". This is the term's first use and stays unglossed.
- **11.5 Clarity, MINOR.**
  - Danish: *tilsagt til en saadan extraordinair Kongereise*.
  - English: "summoned for such an extraordinary royal journey".
  - *Kongereise* is a journey in the king's service that one is summoned to provide. "Royal journey" reads as a journey *by* a king.
  - Fix: "summoned to such an extraordinary journey in the king's service as the one to Mount Moriah". This adds no gloss.
- **Checked and correct:**
  - *ɔ: det Ufuldkomne* is "namely, the imperfect".
  - "my enormous resignation" is bare, with the definition deferred to ¶13.
  - *Surrogatet for Troen* is "the substitute for faith".
  - *thi i Timeligheden …* is left outside the quoted self-address, which is ambiguous in the Danish as well.
  - *proprio motu et propriis auspiciis* is kept and glossed.
  - *beholder kun Isaak i Smerten* is "keeps Isaac only in pain".

## Overall judgment

- **Verdict.** The draft is a faithful, complete and well-controlled rendering. There are no omissions, no sentence-level additions of interpretation, no leaked notes and no terminology violations. The first-use definitions are right, and the drafter was right to leave "mediation" out of ¶2.
- **Recommendation.** Accept after the MINOR fixes, especially:
  - 4.1 (the willing-to-murder parallel);
  - 7.1 (the scope of *engang*);
  - 10.1 (placement of the definition);
  - 11.1 (the *heller ikke* series);
  - 11.2 (*snarere*).
- **Items for the lead:**
  - the pilot ch5 ¶0 double gloss of spiritual trial;
  - the conflict between the standard and the brief over glossing "the absurd";
  - a single policy on Danicized German (*Nul og Nichts* vs *Schäfer-Historier*).
