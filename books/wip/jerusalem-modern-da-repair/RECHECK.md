# Re-verification of 12 Danish repair fixes — Jerusalem, Book Two ch. 4/6/7/8

**File checked:** `books/wip/jerusalem-modern-da-repair/editions/jerusalem-modern-da.json` (post-fix)
**Ground truth:** `books/wip/jerusalem-completeness-repair/editions/jerusalem-modern-en.json`

## Structural sanity check

- Chapters: 17 in both files. ✅
- Total paragraphs: 1787 in both files. ✅
- Chapter 4 ("Karin, Ingmars datter" / "Karin, Daughter Of Ingmar") paragraph count: 202 in both DA and EN. ✅
- Note: the task's "Chapter N" numbering refers to the `number` field on each chapter object, not its zero-based array position (chapter 4 lives at array index 3, since the book starts numbering at 1). Confirmed both files use the same numbering/title scheme chapter-for-chapter, so the 12 indices below are directly comparable paragraph-for-paragraph.

## The 12 targeted fixes

All 12 were read at their exact index in both files and compared sentence-by-sentence. All are correct, complete, and free of new seams/duplication.

1. **Ch.4 idx6 — Karin/Halvor engagement break-BEFORE-death.** ✅ Confirmed. DA now correctly narrates: prior summer, while Big Ingmar still alive, Halvor courted Karin; family hesitant over his father's drinking; engagement set, banns requested; Falun ring-buying trip; Karin breaks it off fearing Halvor might become like his drunkard father; Big Ingmar respects her judgment and Halvor is sent away. Matches EN exactly, no trace of the fabricated "father died, she must run farm" version.

2. **Ch.4 idx130 — practical spring-workload dread.** ✅ Confirmed. DA: "hun tænkte på alt det arbejde, der ventede hende — såning og høslæt, forårsbagning og hovedrengøring, vævning og syning." Matches EN's "sowing and haymaking, spring baking and spring cleaning, weaving and sewing" — no invented despair monologue (the monologue that follows in idx131 is separate, pre-existing text, not conflated in).

3. **Ch.4 idx172 — two closing sentences restored.** ✅ Confirmed. DA now ends with "Hvorfor har han sådan travlt? undrede hun sig. Han må da vide, at jeg ikke vil have nogen anden end ham." matching EN's "Why does he have to be in such a rush? ... Surely he must know I don't want anyone but him." Paragraph boundary with idx173 is clean, no duplication.

4. **Ch.4 idx191 — real quoted family motto.** ✅ Confirmed. DA ends "Ingmarssønnerne behøver ikke at frygte noget menneske; de skal blot vandre på Guds veje." matching EN's "The Ingmarssons need fear no man; they need only walk in the ways of God." Fabricated "drunkard's bedside" line is gone.

5. **Ch.4 idx39 — two missing sentences (sits down, sighs).** ✅ Confirmed. DA ends "Ingmar stod der et øjeblik, satte sig så ned ved bordet. Han sukkede flere gange, ligesom Karin havde gjort den dag, hun var der." matching EN's "Ingmar stood there a moment, then went and sat down at the table. He sighed several times, just as Karin had done the day she was there."

6. **Ch.4 idx116 — Elof amused, not jealous.** ✅ Confirmed. DA: "Han undte slet ikke Halvor klenodiet noget ondt; han syntes bare, det var komisk at se ham og alle de andre stå så højtidelige over ikke andet end et forslidt gammelt sølvur." matches EN's "He didn't begrudge Halvor his keepsake; he just found it funny... over nothing but a battered old silver watch." No jealousy motivation present.

7. **Ch.4 idx196 — Karin's final quoted line.** ✅ Confirmed. DA ends "Sig, hvad I vil om det, men Halvor og jeg har ikke gjort noget forkert." matching EN's "Say what you like about it, but Halvor and I have done nothing wrong." Preceding "steadying her voice" beat ("Hun tav et øjeblik for at samle sin stemme") is present too.

8. **Ch.6 idx0 — "sole trustee" + both money rumors.** ✅ Confirmed. DA: "Ingmar Ingmarssons tyve tusind kroner, som Elof havde været eneforvalter af, var forsvundet sporløst. Nogle mente, at Elof havde gravet pengene ned; andre mente, at han havde foræret dem væk." matches EN's "of which Elof had been sole trustee... Some people thought Elof had buried the money; others thought he had given it away."

9. **Ch.7 idx72 — mid-sentence cutoff restored.** ✅ Confirmed. DA now ends "...og andre igen helbreder de syge—" mirroring EN's deliberate em-dash cutoff "...and others still heal the sick--". The fabricated tongues/interpretation passage is gone; next paragraph (idx73, Halvor's interruption "Kan du helbrede de syge?") follows cleanly with no duplicated content.

10. **Ch.8 idx49 — old man's closing line.** ✅ Confirmed. DA ends "Jeg ville gerne give dem en ordentlig endefuld!« sagde den gamle mand." matching EN's "I'd like to give them both a good beating!" said the old man." (Danish omits "both," a trivial and acceptable simplification — meaning is intact.)

11. **Ch.4 idx54 — closing sentence about never returning to Falun.** ✅ Confirmed. DA ends "Men jeg nåede aldrig tilbage til Falun, og nu ved jeg ikke, hvad jeg skal gøre ved det." matching EN's "But I never made it back to Falun, and now I don't know what to do about it."

12. **Ch.4 idx38 — causal "ever since Karin had thrown him over."** ✅ Confirmed. DA ends "...sådan som han havde for vane at gøre, lige siden Karin havde forkastet ham." matching EN's "...the way he'd been in the habit of doing ever since Karin had thrown him over." Generic "the way unhappy people do" phrasing is gone; causal detail restored.

## Broader chapter-4 spot-check (outside the 12 fixed indices)

Checked indices 0, 1, 2, 10, 20, 50, 70, 90, 100, 140, 150, 160, 180, 200, 201 against English — all are faithful, unaltered translations with no drift, no stray fabrication, no accidental edits introduced during the fix pass. Chapter 4 paragraph count (202) matches EN exactly, so nothing was added, dropped, or merged elsewhere in the chapter.

## Verdict

**ACCEPT.**

All 12 flagged defects are now correctly and completely fixed, each verified against the English ground truth at the exact paragraph index, with no new seams, duplication, or collateral damage introduced. The broader chapter-4 sanity spot-check and the file-wide chapter/paragraph-count check found nothing else altered. The repair package is ready to proceed per the original reviewer's recommendation.
