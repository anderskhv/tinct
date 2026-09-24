# R3 — Whole-book consistency review

Reviewer: independent consistency reviewer (R3). Scope: inconsistencies **between** parts A–J and the pilot P, checked against `source/original-da-final.json`. This is not a sentence-level style review. Drafts were not edited.

## Summary

The book reads as one translation. The core vocabulary holds across all fourteen draft files: the universal, the single individual, spiritual trial, temptation, test, put to the proof, anxiety, passion, inwardness, expression, movement, the absurd, by virtue of the absurd (all 33 instances of *i Kraft af* line up), actuality and reality, the knights, the tragic hero, the demonic and disclosure/concealment. The structure is complete, and the refrains in Problema I–III and the Epilogue are stable. Most of the defects are in the accepted pilot (P, ch5–6). It was drafted before the 2026-09-24 rulings and before the book-level first-use table.

The MAJOR findings:

1. **F1.** P-ch5 and P-ch6 use **straight quotes and apostrophes** (124 characters). Every other part uses typographic quotes, so the mix is visible on the page. The fix is a mechanical conversion; a verified script is given below.
2. **F2.** The **Genesis 22:2 command** is worded differently in the Attunement (ch2 ¶3) and the Eulogy (ch3 ¶5), although the Danish is identical: "the one you love … go into" against "whom you love … go to".
3. **F3.** In ch6 ¶2, *gaaet videre, langt videre* is "gone beyond it, far beyond it", and *blive staaende derved* is "remain there". Both break the **go further / stop at** ruling on the book's main refrain.
4. **F4.** The **Spidse** ruling: this review rules for "extreme point" throughout. ch4 ¶13 (D) and ch5 ¶19 (P) change from "summit".
5. **F5.** The pilot **repeats first-use glosses** at ch5 ¶0 (spiritual trial), ¶2 (incommensurable) and ¶4 (mediation). All three should be removed.
6. **F6.** The pilot renders ***en (anden) / enhver Enkelt*** as "another / every single individual" in ch6 ¶6, ¶14 and ¶20. The ruling reserves "single individual" for *den Enkelte* only.
7. **F7.** ***fatte* is rendered "grasp"** in ch6 ¶6 and ¶20, and ***gribe* is rendered "took hold of"** in ch4 ¶16. This breaks the comprehend/grasp split.
8. **F8.** ***tør* is rendered "ventures"** in ch5 ¶25.
9. **F9.** ***pine* is rendered "torment"** in ch7 ¶33 and ¶36. "Torment" is reserved for *Qval*.

F8 and F9 break §C rulings but are unlikely to be noticed by a reader. The table at the end lists 34 exact edits. Each old string has been machine-checked to occur exactly once in its paragraph, and no footnote anchor is disturbed.

**How to apply:**

1. Apply the table.
2. Run the F1 quote conversion on the two P files.
3. Re-run `assemble.py`.

The P old strings contain no quote characters, so step 2 can run after step 1 without conflict.

---

## Findings

### F1 — Typography: straight quotes in the pilot · **MAJOR**
- **Where:** all of P-ch5.json and P-ch6.json, in the texts and in n5.31a and n6.24a. There are 36 `"` and 34 `'` in P-ch5, and 32 `"` and 22 `'` in P-ch6.
- **Current:** `"the Good and Conscience,"`, `people's`, `κατ' ἀναλογίαν`, `'a test.'`.
- **Everywhere else:** in all other parts there are 0 straight quotes in the English. Only the German verse copied from the source has straight elisions (`dreh'nden`, `kniet'`), which is correct. The brief requires typographic quotes.
- **Recommended:** convert mechanically. The following has been verified on both files: every paragraph balances, the nested `‘a test.’` in ch6 ¶15 comes out right, and the Greek elision in ch6 ¶8 becomes `κατ’`, as in F ch7 ¶3. No anchorAfterEn contains a quote. The conversion changes no string lengths, so the UTF-16 offsets are unaffected.

```python
import re, json
def curl(t):
    t = re.sub(r'(^|[\s(\[—])"', lambda m: m.group(1) + '“', t); t = t.replace('"', '”')
    t = re.sub(r"(^|[\s(\[—“])'", lambda m: m.group(1) + '‘', t); t = t.replace("'", '’')
    return t
for f in ['drafts/P-ch5.json', 'drafts/P-ch6.json']:
    d = json.load(open(f))
    for s in d['slots']:
        s['text'] = curl(s['text'])
        for n in s.get('notes') or []:
            n['text'] = curl(n['text']); n['anchorAfterEn'] = curl(n['anchorAfterEn'])
    json.dump(d, open(f, 'w'), ensure_ascii=False, indent=2)
```

### F2 — Refrain: the Genesis 22:2 command · **MAJOR**
- **Danish:**
  - ch2 ¶3: „Og Gud fristede Abraham og sagde til ham, tag Isaak, Din eneste Søn, som Du elsker, og gaae hen i det Land Morija og offer ham der til et Brændoffer paa et Bjerg, som jeg vil vise Dig.“
  - ch3 ¶5: identical except *gaa hen* (no *og*) and *til Brændoffer*.
- **Current:**
  - ch2 ¶3 (A): "And God tempted Abraham**,** and said to him: Take Isaac, your only son, **the one you love, and go into** the land of Moriah, and there sacrifice him as a burnt offering on a mountain I will show you."
  - ch3 ¶5 (B): "And God tempted Abraham and said to him: Take Isaac, your only son, **whom you love; go to** the land of Moriah, and there sacrifice him as a burnt offering on a mountain I will show you."
  - ch3 ¶7 (B) quotes the phrase back as "the son **whom you love**".
- **Recommended:** make ch2 ¶3 read "…And God tempted Abraham and said to him: Take Isaac, your only son, whom you love, and go to the land of Moriah, and there sacrifice him…". Keep B's semicolon in ch3 ¶5, since that Danish lacks *og*.
- **Also checked, consistent:**
  - "And God tempted Abraham and said: Abraham, Abraham, where are you? … Here I am" (ch3 ¶10);
  - the Attunement's "It was early morning" (×4), "Abraham rose early", "saw Mount Moriah far off" (ch2 ¶0 and ¶4), and "Happy the one who …" (×3, plus "Happy the child");
  - "he bound Isaac … drew the knife";
  - the two quotations of Gen. 22:8 in ch7 ¶50 and ¶57, which are word for word the same.
  - The one remaining divergence, "firewood", is F13.

### F3 — Terminology: *gaae videre* and *blive staaende ved* in ch6 ¶2 · **MAJOR**
- **Danish:** "Forsaavidt kan Philosophien have Ret i, at man ikke bør **blive staaende derved**." … "saa er allerede Socrates **gaaet videre, langt videre**".
- **Current (P):**
  - "philosophy may have a point when it says one should not **remain there**";
  - "then Socrates had already **gone beyond it, far beyond it**".
- **Rest of the book:** every other *gaae/komme videre* is "go/get further" and every *blive staaende ved* is "stop at". That holds across ch1 ¶0–1, ch4 ¶9, ¶13–15 and ¶27, ch5 ¶0, ch7 ¶12, ¶13, ¶17 and ¶48, and ch8 ¶0–3. "Beyond" is used only where the Danish has *ud over* (ch2 ¶1, ch4 ¶9, ch5 ¶7, ch6 ¶18, ch7 ¶23, ¶54) or *hisset*.
- **Why it matters:** this passage is ironic about philosophy "going further" than faith, so it is exactly where the refrain has to be heard.
- **Recommended:** "one should not **stop there**"; "Socrates had already **gone further, much further**".

### F4 — Terminology ruling: *Spidse* · **MAJOR (ruling)**
- **Danish and current:**

| Location | Danish | Current English |
|---|---|---|
| ch4 ¶13 (D) | *Paa denne **Spidse** staaer Abraham* | "Abraham stands at this **summit**." |
| ch5 ¶19 (P) | *det Paradox, ved hvilket han bliver **paa Spidsen*** | "the paradox that keeps him at the **summit**" |
| ch7 ¶13 (F) | *holder jeg dem **paa Spidsen*** | "I keep them at the **extreme point**" |
| ch7 ¶23 (H) | *Havmanden staaer paa en dialektisk **Spidse*** | "The merman stands at a dialectical **extreme point**" |

- **The collision:** "summit" also renders a different word in ch4 ¶10, *naar jeg har naaet **Høiden***.
- **Ruling:** *Spidse* in the abstract, dialectical sense is "**extreme point**" everywhere. ch5 ¶19 ("keeps him on the point") and ch7 ¶13 ("holds them on the point") are the same image: a figure held on a dialectical point. In ch4 ¶13 "summit" is also used for *Høiden* three paragraphs earlier, so there it merges two Danish words.
- **Change:** ch4 ¶13 and ch5 ¶19 become "extreme point". The literal mountain peak in ch5 ¶18 (*med sin Spidse rager himmelhøit*, "whose peak towers") stays. "Summit" then renders *Høiden* (ch4 ¶10) and *Lykkens Tinde* (ch7 ¶4) only.

### F5 — Glosses: repeats of first-use definitions · **MAJOR**
The prescribed first uses are all present and correct:

| Term | First use (location, part) | Gloss |
|---|---|---|
| spiritual trial | ch4 ¶7 (C) | "an inner assault on him" |
| incommensurable | ch4 ¶10 (C) | "not measurable by any common standard" |
| infinite resignation | ch4 ¶13 (D) | |
| philistine | ch4 ¶15 (D) | |
| mediation | n4.22a (D) | "Hegel’s term for reconciling opposites in a higher unity" |
| the aesthetic | ch4 ¶22 (E) | "the aesthetic being the sphere of immediate feeling" |
| telos | ch5 ¶0 (P) | |
| ethical life | ch5 ¶1 (P) | |
| concealment | ch7 ¶0 (F) | |
| disclosure | ch7 ¶1 (F) | |
| the interesting | ch7 ¶2 (F) | |

The repeats are all in the pilot:

| Location | Danish | Repeated gloss | Recommendation |
|---|---|---|---|
| ch5 ¶0 | *da er han i Anfægtelse* | "he is in a spiritual trial **— an inner assault on him —**" | **Remove.** It is a word-for-word duplicate of the ch4 ¶7 gloss, 32 paragraphs later, and would read as an editing slip. |
| ch5 ¶2 | *der intet Incommensurabelt bliver tilbage* | "nothing incommensurable remains in a human being **(nothing that cannot be measured by that common standard)**" | **Remove.** It paraphrases ch4 ¶10, and the sentence reads cleanly without it. |
| ch5 ¶4 | *Dette Standpunkt lader sig ikke mediere; thi al Mediation skeer netop i Kraft af det Almene* | "cannot be mediated **— that is, it cannot be brought under the universal —** for all mediation takes place precisely by means of the universal" | **Remove.** It is redundant with the clause that follows it, which already gives the reader the contextual sense. That also holds for readers or narration that skip n4.22a. (The NIT on "by means of" is under F16.) |

- **Checked, no gloss anywhere:** the demonic (ch7 ¶12 on, used bare), the absurd (ch4 ¶10 on, defined only by the text in ch4 ¶21), and paradox (ch4 ¶9). These comply.
- **ch7 parts:** none of the ch7 parts re-glosses spiritual trial, incommensurable, mediation or the aesthetic (ch7 ¶1 "The first immediacy is the aesthetic" is bare). They comply.

### F6 — Terminology: *en Enkelt* rendered "single individual" · **MAJOR (ruling)**
- **Danish:**
  - ch6 ¶6: *for **en anden Enkelt**, der er i samme Casus*;
  - ch6 ¶14: *og at **enhver Enkelt**, der forstaaer ham*;
  - ch6 ¶20: *at forsaavidt **en anden Enkelt** skal gaae den samme Vei, maa han … blive **den Enkelte***.
- **Current (P):** "another single individual", "every single individual", "another single individual".
- **Other parts:** C ch4 ¶6 "someone", G ch7 ¶17 "Any individual", H ch7 ¶25 "many an individual", I ch7 ¶31 "an individual". These follow the ruling.
- **Why it matters:** in ch6 ¶20 the Danish contrasts *en anden Enkelt* with *blive den Enkelte*, and the current English flattens that into a tautology.
- **Recommended:** "another individual", "every individual", "another individual".

### F7 — Terminology: *fatte* against *gribe* · **MAJOR (ruling)**
| Location | Danish | Current | Recommended |
|---|---|---|---|
| ch6 ¶6 (P) | *hvilket jeg endnu bedre kan **fatte*** | "which I can grasp even better" | "which I can **comprehend** even better" |
| ch6 ¶20 (P) | *Han **fatter** slet ikke, hvorom Talen er* | "He does not grasp at all what is at issue" | "He does not **comprehend** at all what is at issue" |
| ch4 ¶16 (D) | *og da **greb** han Alt igjen i Kraft af det Absurde* | "then he took hold of everything again" | "then he **grasped** everything again" |

- **Why it matters:** ch4 ¶16 is the knight of faith's own act, the *gribe* of faith that §C singles out. The same act is "grasped" in ch4 ¶20, ¶21, ¶24 and ¶27.
- **Checked, correct:** every other *fatte* is comprehend or understand (ch3 ¶2, ch4 ¶18, ¶27, ch7 ¶22, ¶27, ¶58), and every other *gribe* is grasp or seize.

### F8 — Terminology: *tør* rendered "ventures" · **MAJOR (ruling; low visibility)**
- **Danish, ch5 ¶25:** *at han da **tør** sige: Græder over ham … at Digteren **tør** holde Mængden i Ave … at Troens Ridder **tør** sige*.
- **Current (P):** "and **ventures** to say" … "the poet's **daring** to keep" … "the knight of faith **dares** to say".
- **Why it matters:** the paragraph builds from the poet who *tør* to the knight who *tør*, and the verb should match.
- **Recommended:** "and **dares** to say".
- **Checked, correct:** every other *tør/turde* is "dare", and ch7 ¶35's "you may not have pity on the universal" is the permitted prohibition. ch7 ¶14's *turde han vel nok regne paa* ("could surely count on") is the epistemic *turde*, not "dare"; leave it.

### F9 — Terminology: *pine* rendered "torment" · **MAJOR (ruling; low visibility)**
- **Danish:**
  - ch7 ¶33: *naar det gjælder om at **pine** Heltene* (just after *tortor heroum*);
  - ch7 ¶36: *thi det Almene vil bestandig **pine** ham*.
- **Current (I):** "where **tormenting** heroes is concerned"; "will keep **tormenting** him".
- **Why it matters:** §C reserves "torment" for *Qval*, and I uses "torments" for *Qvaler* in ch7 ¶25. In ch7 ¶33 the fix also makes the sentence echo "torturer of heroes".
- **Recommended:** "**torturing** heroes"; "keep **torturing** him".

### F10 — Terminology: the idiom *i Virkeligheden* rendered "in reality" · MINOR
- **Danish, ch7 ¶22:** *at det kunde forekomme **i Virkeligheden***.
- **Current (H):** "it could happen **in reality**".
- **Why it matters:** the ruling allows an idiomatic rendering of the idiom. But "reality" is the reserved rendering of *Realitet*, and H uses it in that sense a paragraph later (n7.34a, ¶23). F renders the same idiom "in actuality" (ch7 ¶10) and I does too (ch7 ¶32).
- **Recommended:** "in **real life**".

### F11 — Structure: verse-bracket format · MINOR
- **I, ch7 ¶29:** the German lines, then `\n[… I, that am rudely stamp’d … halt by them.]`, with the bracket on its own line.
- **J, ch7 ¶46:** `Wer sprach von Liebe. [Who sued to me for him? …]`, with the bracket on the same line as the last German line.
- **Recommended:** follow I and insert a newline before `[` in ¶46. The n7.67a anchor "Wer sprach von Liebe." ends before the inserted newline, so its offset is unchanged.
- **Checked, consistent:** both parts use square brackets, ` / ` separators and matching line counts (8/8 and 3/3). Both give Shakespeare's own English lines rather than a fresh rendering of the Schlegel–Tieck German, so the approach is consistent. Note this for the editor, since §B asks for a "rendering".

### F12 — Proper phrase: *Guds Udvalgte* · MINOR
- **Current:**
  - ch3 ¶2, ¶3 and ¶6 (B): "the one God had chosen";
  - ch4 ¶7 (C): "worthy to be called **God’s elect**";
  - ch7 ¶24 (H): "the righteous man, **God’s chosen one**".
- **Why it matters:** ch7 ¶24 deliberately recalls the Eulogy, so "God’s elect" is the odd one out.
- **Recommended:** ch4 ¶7 → "God’s chosen one". B's clause-form paraphrase can stay.

### F13 — Refrain: *kløve Brændet* · MINOR
- **Current:** ch3 ¶8 "chopped the firewood" and ch3 ¶10 "He chopped the firewood" (B, the Genesis quotation); ch4 ¶30 (E) "to **split** the firewood".
- **Recommended:** ch4 ¶30 → "to chop the firewood".

### F14 — Echoed sentences with identical Danish · MINOR
- **The "only marvel" sentence:**
  - ch4 ¶12 (D): *men derfor siger jeg ikke, at det er noget Ringe, da det tværtimod er det eneste Vidunder* = "Yet I do not say for that reason that it is something **lowly**; on the contrary, it is **the only marvel**." (ch4 ¶16 also ends "the only marvel".)
  - ch7 ¶58 (J): *men derfor siger jeg ingenlunde, at det er noget Ringe, da det tværtimod er det eneste Vidunderlige* = "…that it is something **slight**; on the contrary, it is **the one thing that is wondrous**."
  - **Recommended:** J ¶58 → "something lowly; on the contrary, it is the only marvel."
- **The "speak inhumanly" sentence:**
  - ch4 ¶11 (C): *Det er min Sjæl imod … at tale umenneskeligt om det Store* = "to speak inhumanly about **what is great**".
  - ch5 ¶23 (P): *Det er min Sjæl imod, at tale umenneskeligt om det Store* = "to speak inhumanly about **greatness**".
  - **Recommended:** ch5 ¶23 → "about what is great". Only this echo sentence changes; P's other uses of "greatness" can stay.

### F15 — Voice: generic *man* rendered "you" · MINOR
- **Current:** Johannes's generic *man* is "one" throughout, except in D:
  - ch4 ¶15: *Naar man vil lære at gjøre Svømmebevægelserne, da kan man …* = "If **you** want … **you** can have **yourself** hung … **you** may well describe … **you** do not swim";
  - ch4 ¶16: *naar man seer ham, skulde man sværge* = "**you** would swear". The same paragraph also has "one would think" (×2).
- **Recommended:** use "one" in both paragraphs.
- **Not changed:** "you" is fine for Johannes's direct address to his listener (ch3 ¶10, ¶13), for Shakespeare (ch5 ¶18) and in quoted speech.

### F16 — Refrain formulas and small harmonizations · NIT
- **Problema II's closing formula (ch6 ¶21):** Danish *eller ogsaa har der aldrig været Tro til … eller ogsaa er Abraham tabt, eller ogsaa maa man*. Current: "or … ; or Abraham is lost; or one must".
  - ch5 ¶4 renders the identical *eller ogsaa* formula "or else … or else Abraham is lost".
  - **Recommended:** "or else" throughout ch6 ¶21.
  - Plain *eller Abraham er tabt* (ch7 ¶43 and ¶60) is fine as "or". ch7 ¶43's "or else" is acceptable English and needs no change.
- **ch5 ¶4:** *i Kraft af det Almene* = "by means of the universal". This is the only *i Kraft af* in the book not rendered "by virtue of". Recommended: "by virtue of the universal".
- **Problemata openings:** ch6 ¶0 *og som saadant igjen det Guddommelige* = "also the divine", while ch7 ¶0 renders the same *igjen* "in turn". Recommended: "in turn the divine".
- ***Ethikens elskelige Søn*:** ch7 ¶10 (F) "the beloved son of ethics", but ch7 ¶42 (J) "ethics’ beloved son". Recommended: J → "the beloved son of ethics".
- **ch4 ¶24 (E):** *Ved Troen gav Abraham ikke Afkald paa Isaak* = "did not give Isaac up". Every other *give Afkald* in the paragraph is "renounce", and "give up" is reserved for *opgive*. Recommended: "did not renounce Isaac".
- **ch5 ¶26 (P):** *forfærdeligt* ×2 = "terrifying". Recommended: "terrible", the book's rendering of *forfærdelig*.
- **ch5 ¶8 (P):** *at han … vilde offre hende* = "offer her up". Recommended: "sacrifice her", per §C *offre* = sacrifice.

### F17 — Spelling (US standard) · NIT
The book is consistently US ("honor", "armor", "gray", "judgment", "toward", "offense", "fulfill"). Three outliers:

| Location | Current | Recommended |
|---|---|---|
| A ch2 ¶10 | "afterwards" | "afterward", as in the other six uses |
| G ch7 ¶16 | "unrivalled" | "unrivaled" |
| E ch4 ¶28 | "compendiums" | "compendia", as in F n7.15a |

"Cancelled" is used uniformly (P, G, H, J), so leave it.

### F18 — Checked; no edit recommended · NIT
- **Contractions:** none in Johannes's narration anywhere. They occur only inside quoted speech: ch4 ¶13 (the caricatures), ch7 ¶30 (ethics addressing Sarah) and ch8 ¶1 (the children). This is consistent.
- **Dashes:** spaced em dashes throughout. There are no en dashes and no double hyphens.
- **Latin re-glossed at later uses:** *eo ipso* (ch7 ¶3 F; ch7 ¶23 H) and *publici juris* (ch6 ¶15 P; ch7 ¶17 G). §A6 glosses foreign insertions where they occur, and the glosses are identical, so keep them.
- **Gloss punctuation:** both dashes and parentheses are used, as §A5 allows.
- **Unquoted speech in ch4 ¶25 (E):** "by faith you will get her" has no quotation marks, while E quotes the knight in ¶21 and ¶24. The Danish quotes none of them, so leave it; an editor may harmonize.
- **Cross-references resolve correctly:**
  - ch6 ¶6 "as noted above" points to ch5 ¶15 (test/temptation);
  - ch6 ¶1 "an expression used earlier" points to ch5 ¶20 (the odd number);
  - ch6 ¶14 "As was said";
  - ch4 ¶16 "As I said" points to ¶16's own opening;
  - ch4 ¶31 recalls the sleepless sinner and "last Sunday" of ch4 ¶2;
  - ch7 ¶1 "Here we stand once again at the same point";
  - ch7 ¶10 "like Jephthah’s daughter, two months" points to ch5 ¶11;
  - ch7 ¶17 "publici juris — public property" echoes ch6 ¶15;
  - ch7 ¶39 "as I have said, Abraham I cannot understand" points to ch4 ¶14 and ch5 ¶6;
  - ch7 ¶49 "as has been sufficiently shown earlier, makes two movements" points to ch4 ¶12 (the double movement);
  - ch7 ¶56 "as was developed above" and ch7 ¶57 "as it has been described in what went before";
  - n7.34a "In the foregoing".
- **Names are uniform:** Abraham, Isaac, Sarah (34), Eliezer (6), Hagar, Moriah / Mount Moriah (23), Agamemnon, Iphigenia, Clytemnestra, Achilles, Calchas, Jephthah (5), Brutus, Agnete (42) and the merman, Tobias, Tobit, Raguel, Edna, Faust, Margaret, Gloucester / Richard III, Elizabeth / Essex. Aristotle's bridegroom is "the bridegroom" throughout ch7 ¶14–17.

---

## Verified consistent (no finding)

- **Refrains:**
  - "the single individual as the single individual is higher than the universal" (ch5 ¶4, ¶20; ch6 ¶21; ch7 ¶1 ×2, ¶22) and its variants;
  - "stands in an absolute relation to the absolute";
  - "Abraham is lost" in every closing formula (ch5 ¶2, ¶4; ch6 ¶4, ¶21; ch7 ¶43, ¶60);
  - "or else there has never been faith, because there has always been faith" (ch5 ¶4; ch7 ¶1);
  - "Taken in his immediacy — as a being of senses and soul —" (ch5 ¶0 = ch7 ¶0);
  - "The ethical as such is the universal" (ch5 ¶0 = ch7 ¶0);
  - "the distress, the anxiety, the paradox" (ch5 ¶22, ¶24, ¶26; ch6 ¶11, ¶14; ch7 ¶44–45, ¶56);
  - "anxiety and trembling" (ch1 ¶1 = ch6 ¶13);
  - "got no further than faith" (ch3 ¶13), "get no further than the tragic hero" (ch7 ¶17) and "getting any further" (ch7 ¶48);
  - the Preface / Epilogue "go further" and "stop at faith";
  - Heraclitus (ch8 ¶3 only);
  - "a test, a temptation" (ch5 ¶15; ch6 ¶6, ¶12; ch7 ¶49 "a test … the ethical is the temptation");
  - "The tragic hero still stays within the ethical" (ch5 ¶13, its only occurrence).
- **Terminology:**
  - *Virkelighed* is "actuality" and *Realitet* is "reality" (ch4 ¶17 and n4.21a "the whole reality of actuality"; ch6 ¶11; ch7 ¶15–16, ¶23). The one idiom collision is F10.
  - The *Angest* family is "anxiety" in every instance, with no "fear" or "dread".
  - *Qval* is "torment". *martre* is "torture", apart from the *pine* cases in F9.
  - movement / movements; movement of faith; the movement of infinity against "the infinite movement"; the double movement; the leap.
  - infinite resignation; knight of infinite resignation; knight of resignation; knight of infinity; knight of faith.
  - the System; philistine; the lecturers; *forsøges* is "put to the proof" in every passive use, with *en forsøgt Mand* "a tried man" in ch7 ¶32.
  - *Fristelse* is "temptation" and *Prøvelse* is "test".
  - *Guddommen* is "the deity".
  - "the demonic" is never glossed.
- **Structure:**
  - all 184 paragraphs are present (4 / 15 / 14 / 35 / 29 / 22 / 61 / 4);
  - all 18 notes have English text in `candidate/footnotes.json`, every anchorAfterEn is found, and every `anchorOffsetUtf16` is verified correct;
  - the 11 structural fields (Attunement I.–IV., asterisms and rules; ch3 ¶13 asterism; ch7 ¶39 rule) match the source, the drafts and `candidate/structure.json`;
  - `candidate/review/*.md` matches the current drafts;
  - no Danish is left untranslated (no *ɔ:*, *o. s. v.*, *f. Ex.* or *Cfr.*);
  - no drafter comments or markers, and no `*` or note text in the main text;
  - `front-matter.json` is consistent with ch1 ¶3 ("Johannes de silentio").

---

## Edits table

- **Source and uniqueness:** every "old" string was taken from `drafts/*.json` as they currently stand. A script checked that each one occurs exactly once in the named paragraph's `text`, and that no footnote anchor is affected.
- **Typography in the table:** `⏎` stands for a literal newline character (U+000A) in the JSON string. Curly apostrophes (’) are exactly as they are in the files.
- **Order and scope:** apply this table before the F1 conversion. After the conversion, only the P rows with apostrophes would differ, and none of the P old strings contains a quote.

| Part file | ¶ | Finding | Old string (exact) | New string |
|---|---|---|---|---|
| A-ch2.json | 3 | F2 | `“And God tempted Abraham, and said to him: Take Isaac, your only son, the one you love, and go into the land of Moriah,` | `“And God tempted Abraham and said to him: Take Isaac, your only son, whom you love, and go to the land of Moriah,` |
| P-ch6.json | 2 | F3 | `then Socrates had already gone beyond it, far beyond it` | `then Socrates had already gone further, much further` |
| P-ch6.json | 2 | F3 | `when it says one should not remain there` | `when it says one should not stop there` |
| D-ch4.json | 13 | F4 | `Abraham stands at this summit.` | `Abraham stands at this extreme point.` |
| P-ch5.json | 19 | F4 | `keeps him at the summit` | `keeps him at the extreme point` |
| P-ch5.json | 0 | F5 | `he is in a spiritual trial — an inner assault on him — and he can` | `he is in a spiritual trial, and he can` |
| P-ch5.json | 2 | F5 | `remains in a human being (nothing that cannot be measured by that common standard) except` | `remains in a human being except` |
| P-ch5.json | 4 | F5 | `This position cannot be mediated — that is, it cannot be brought under the universal — for all mediation` | `This position cannot be mediated; for all mediation` |
| P-ch6.json | 6 | F6 | `by another single individual who is in the same position` | `by another individual who is in the same position` |
| P-ch6.json | 14 | F6 | `and every single individual who understands him` | `and every individual who understands him` |
| P-ch6.json | 20 | F6/7 | `He does not grasp at all what is at issue: that if another single individual is to walk` | `He does not comprehend at all what is at issue: that if another individual is to walk` |
| P-ch6.json | 6 | F7 | `which I can grasp even better` | `which I can comprehend even better` |
| D-ch4.json | 16 | F7 | `and then he took hold of everything again by virtue of the absurd` | `and then he grasped everything again by virtue of the absurd` |
| P-ch5.json | 25 | F8 | `and ventures to say` | `and dares to say` |
| I-ch7.json | 33 | F9 | `where tormenting heroes is concerned` | `where torturing heroes is concerned` |
| I-ch7.json | 36 | F9 | `will keep tormenting him` | `will keep torturing him` |
| H-ch7.json | 22 | F10 | `it could happen in reality that` | `it could happen in real life that` |
| J-ch7.json | 46 | F11 | `Wer sprach von Liebe. [Who sued` | `Wer sprach von Liebe.⏎[Who sued` |
| C-ch4.json | 7 | F12 | `worthy to be called God’s elect` | `worthy to be called God’s chosen one` |
| E-ch4.json | 30 | F13 | `to split the firewood` | `to chop the firewood` |
| J-ch7.json | 58 | F14 | `that it is something slight; on the contrary, it is the one thing that is wondrous.` | `that it is something lowly; on the contrary, it is the only marvel.` |
| P-ch5.json | 23 | F14 | `to speak inhumanly about greatness` | `to speak inhumanly about what is great` |
| D-ch4.json | 15 | F15 | `If you want to learn the movements of swimming, you can have yourself hung in a harness from the ceiling; you may well describe the movements, but you do not swim.` | `If one wants to learn the movements of swimming, one can have oneself hung in a harness from the ceiling; one may well describe the movements, but one does not swim.` |
| D-ch4.json | 16 | F15 | `to look at him, you would swear` | `to look at him, one would swear` |
| P-ch6.json | 21 | F16 | `— or there has never been faith, because there has always been faith; or Abraham is lost; or one must` | `— or else there has never been faith, because there has always been faith; or else Abraham is lost; or else one must` |
| P-ch5.json | 4 | F16 | `precisely by means of the universal` | `precisely by virtue of the universal` |
| P-ch6.json | 0 | F16 | `and as such it is also the divine` | `and as such it is in turn the divine` |
| J-ch7.json | 42 | F16 | `in being disclosed he is ethics’ beloved son` | `in being disclosed he is the beloved son of ethics` |
| E-ch4.json | 24 | F16 | `By faith Abraham did not give Isaac up;` | `By faith Abraham did not renounce Isaac;` |
| P-ch5.json | 26 | F16 | `Was it not terrifying that this human being walking among the others was God, terrifying to share a meal with him?` | `Was it not terrible that this human being walking among the others was God, terrible to share a meal with him?` |
| P-ch5.json | 8 | F16 | `that he was willing to offer her up for the common good` | `that he was willing to sacrifice her for the common good` |
| A-ch2.json | 10 | F17 | `and afterwards still rested` | `and afterward still rested` |
| G-ch7.json | 16 | F17 | `an unrivalled virtuosity` | `an unrivaled virtuosity` |
| E-ch4.json | 28 | F17 | `German-Danish compendiums` | `German-Danish compendia` |

After the edits and the F1 conversion, re-run `python3 assemble.py`. The footnote offsets in the edited paragraphs are unchanged, but the review copies need to be regenerated.
