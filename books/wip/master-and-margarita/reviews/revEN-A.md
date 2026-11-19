# Independent review revEN-A: modern-en, chapters 1–9

- **Scope:** `editions/master-and-margarita-modern-en.json`, chapters 1–9 (1,025 paragraphs). Every paragraph was read against `editions/master-and-margarita-original-ru.json`.
- **Reviewer:** an independent session. I did not write this translation and consulted no published translation.
- **Findings:** `reviews/revEN-A.json`, with 18 entries (1 major, 17 minor). Each `old` occurs exactly once in its paragraph, so the fixes can be applied mechanically. No edition file was edited.
- **Not reopened (approved by Anders):** the style; the glossary; "mulatto" / "Black men"; "Bezdomny" untranslated; «?..» / «!..».

## Method

1. Reading against the Russian, paragraph by paragraph. I checked for omissions and additions, sense, speaker and referent, tense and negation, register and English grammar.
2. Mechanical screens:
   - EN/RU word ratio below 1.05. All 47 flags were short dialogue lines and are complete.
   - Digits compared between RU and EN. No mismatch.
   - «?..» / «!..» counts per paragraph. These match everywhere.
   - Curly-quote balance; straight quotes; spaced or en dashes; Unicode ellipses. Clean, apart from the epigraph's spaced dash, which the sample uses.
3. Glossary spot checks: names, institutions, Patriarch's, rouble/kopeck, checked, Primus stove, messire/hegemon, house management, the Entertainment Commission, the foreigners' bureau/Intourist, and the Annushka and Pilate echoes (1:106 → 4:10 / 8:53, 1:144 → 2:1, 2:261 → 3:1). All are consistent.

## Counts per chapter

| Ch. | Paragraphs | Major | Minor | Verdict |
|---|---|---|---|---|
| 1 | 144 | 0 | 1 | accept |
| 2 | 261 | 0 | 2 | accept with fixes |
| 3 | 50 | 0 | 6 | accept with fixes |
| 4 | 65 | 1 | 1 | accept with fixes |
| 5 | 104 | 0 | 1 | accept |
| 6 | 105 | 0 | 1 | accept |
| 7 | 104 | 0 | 2 | accept with fixes |
| 8 | 97 | 0 | 3 | accept with fixes |
| 9 | 95 | 0 | 0 | accept |
| **Total** | **1,025** | **1** | **17** | |

I found no omitted or invented clause, name, number or aside in chapters 1–9. The defects are local: wording, referents and consistency.

## The five most serious problems

1. **4:36, wrong sense (major).** «тотчас убедился, что догнать их будет очень трудно» is rendered "at once made sure that it would be very hard to catch up". This says Ivan ensured the chase would fail. Fix: "realized".
2. **3:48, probable mistranslation.** «алую повязку» on the tram driver is rendered "scarlet armband". She is the "Komsomol girl" of Woland's prophecy (1:100), and the red kerchief seen with her white face is that emblem. Fix: "scarlet kerchief".
3. **2:71, Banga's gender.** «пожаловаться ей» agrees grammatically with «собака», but Banga is male, and ch. 26 of the same edition calls him "he". Fix: "complain to him".
4. **7:11, referent.** «гражданки Беломут» (the wife) is rendered "Citizen Belomut". Since the husband vanished one paragraph earlier, the reader takes it to mean him. Fix: "Citizeness Belomut", as at 3:3 and 4:49.
5. **8:61, calque that inverts the sense.** «на редкость умные» is rendered "rarely clever", which reads as "seldom clever". Fix: "exceptionally clever".

## Systematic patterns

- **«убедиться» rendered as "made sure".** Three times in this range it should read "saw" or "realized": 3:15, 4:17, 4:36. 8:2 and 9:69 ("made sure it did not ache", "made sure that it contained…") are acceptable English as "checked" and are left alone. The edition has 10 uses of "made sure" in all. **Chapters 10–33 should be screened for the same calque.**
- **Russian grammatical gender carried into English pronouns:** the illness as "her" (2:3) and Banga as "her" (2:71).
- **Capitalisation of "Professor" in direct address.** Ch. 1 has "Professor" (1:73, 1:126, 1:141), like "Procurator". Ch. 3 lowercases it (3:7, 3:21, 3:32), and so does 18:198, which is outside this range. A one-line house rule in GLOSSARY.md would settle it. "doctor" in address is lower case throughout (ch. 6, 17), and I did not flag it.
- **Observation only, not logged as defects:** Koroviev's epithet «длинный» is "long" at 1:18, 5:82, 7:87 and 9:12, but "lanky" at 8:59. "Long" is a deliberate literalism, so I treated it as taste. Unify it if you want one form.

## Verdict

Chapters 1–9 are a faithful, complete and readable translation. They keep Bulgakov's irony, his narrator's asides and the solemn register of chapter 2. Apply the 18 fixes in `revEN-A.json`; no chapter needs rework.
