# War and Peace — Tail Batch A (Chapters 333–340) — Independent Fidelity Review

Reviewer: independent (did not draft this batch).
Source of truth: `tail-batchA-source.json` (Maude).
Candidate: `tail-batchA-candidate.json`.
Drafter's notes under audit: `tail-batchA-notes.md`.

---

## 1. Structural verification (independently re-run)

All checks run programmatically against both JSON files, not taken from the notes.

| Chapter | Title match | Source ¶ | Cand ¶ | ¶ match | "?" per-¶ parity | "?" total |
|---|---|---|---|---|---|---|
| 333 | exact | 31 | 31 | ✅ | ✅ (all 31 ¶ identical) | 8 / 8 |
| 334 | exact | 56 | 56 | ✅ | ✅ | 16 / 16 |
| 335 | exact | 59 | 59 | ✅ | ✅ | 35 / 35 |
| 336 | exact | 9 | 9 | ✅ | ✅ | 6 / 6 |
| 337 | exact | 21 | 21 | ✅ | ✅ | 8 / 8 |
| 338 | exact | 17 | 17 | ✅ | ✅ | 4 / 4 |
| 339 | exact | 11 | 11 | ✅ | ✅ | 3 / 3 |
| 340 | exact | 16 | 16 | ✅ | ✅ | 0 / 0 |

- 8/8 chapters, chapter numbers match in order, titles byte-identical.
- 220/220 paragraphs. No merge, split, reorder, drop, or insertion.
- Question-mark parity verified **per paragraph**, not just per chapter total. All 220 paragraphs match exactly. The drafter's parity claim is confirmed.
- Word-count ratio per paragraph: all within 0.69–1.75, with only four paragraphs outside 0.75–1.45, and all four are very short paragraphs (3–13 source words) where the ratio is statistically meaningless. No paragraph shows compression consistent with summarizing.
- Proper-noun audit: every capitalized proper noun in every source paragraph is present in the corresponding candidate paragraph. Zero named figures, places, regiments, or battles dropped anywhere in the batch.
- Punctuation style: candidate uses straight quotes/apostrophes throughout (270 `'`, 330 `"`, zero curly). This matches the existing `modern-en-name-normalized.json` house style exactly (0 curly / 7906 straight). Correct.

**Structural verdict: PASS, no exceptions.**

---

## 2. Character-name consistency

| Check | Result |
|---|---|
| "Andrei" | 0 occurrences ✅ (6 × "Andrew") |
| "Nikolai" | 0 ✅ (4 × "Nicholas") |
| "Marya" | 0 ✅ ("Mary" / "Princess Mary" throughout, 30 occurrences) |
| "Kutúzov" / accented Kutuzov | 0 ✅ (Kutuzov does not appear in this batch at all — confirmed against source, 0 occurrences there too) |
| "Hélène" | 0 ✅ → "Helene" (1, Ch. 336 ¶1) |
| Residual non-ASCII | Only `ë` (Staël), `ä` (Auerstädt), `é` (fiancée) — all correct and intentional |
| Cyrillic-transliteration accents (á, ó, ë-as-yo) | fully stripped: Natásha→Natasha, Savélich→Savelich, Orël→Oryol, Sukharev, Semënov→Semyonov, Semënovna→Semyonovna, Karatáev→Karataev, Borodinó→Borodino, Yaroslávl→Yaroslavl, Vasíli→Vasili |

**Name verdict: PASS.** No violations.

---

## 3. Narrative chapters 333–337 — findings

### Ch. 333 (31 ¶)
Read in full against source. Faithful throughout; register is warm, modern, and keeps Tolstoy's rhythm. No dropped clauses, no inversions.

| # | Severity | Source | Candidate | Proposed correction |
|---|---|---|---|---|
| 333-a | minor | "I will order supper." | "I'll have supper brought up." | "brought up" adds an unstated spatial fact (the source's next line is "Go downstairs"). Prefer "I'll order supper." |

### Ch. 334 (56 ¶)

| # | Severity | Source | Candidate | Proposed correction |
|---|---|---|---|---|
| **334-a** | **moderate** | ¶7: "his decision to pay his wife's debts and to rebuild **his** houses" | "his decision to pay off his wife's debts and rebuild **her** houses" | Referent inverted. The houses Pierre is rebuilding are his own (Ch. 334 ¶9–10, "And are you building?" / "Savelich says I must!" — Savelich is Pierre's serf on Pierre's estates). Change "her houses" → "his houses". |
| 334-b | minor | ¶23: "something..." / "something fine?" | "something..." / "something brave?" | "fine" in Maude means morally fine/noble; "brave" narrows it to physical courage, which slightly misreads Natasha's characterization of Pierre. Prefer "something good?" or "something fine?". |
| 334-c | minor | ¶5: "you lost two millions in Moscow" | "you lost two million rubles in Moscow" | Unit added, not in source. Harmless clarification; acceptable, but flagged as an addition. |
| 334-d | minor | ¶21: "the amused and mild irony now customary with him" | "the mild, amused irony that had become his habit" | Fine. No action. |

Everything else in 334 checks out, including the long ¶22 (the child-and-woman incident, with "children abandoned, some in the flames," the earrings, and the patrol arresting every non-looting man) and ¶30 (the full two-branch "clever women" digression — both branches present, uncompressed).

### Ch. 335 (59 ¶)

| # | Severity | Source | Candidate | Proposed correction |
|---|---|---|---|---|
| **335-a** | **MAJOR** | ¶19: `"I have seen **the princess**," she replied. "I heard that they were arranging a match for **her** with young Rostóv."` | `"I've seen **the young countess**," she replied. "I heard they were arranging a match for **her** with young Rostov."` | **Meaning-destroying substitution.** In the source, Pierre's cousin answers about the wrong woman — she has seen *Princess Mary* (whom Pierre mentioned visiting), and the match she has heard of is the Princess Mary ↔ Nicholas Rostov match, a live plot thread. That is precisely why Pierre has to ask again in ¶20: "No; I mean do you know Natásha Rostóva?" The candidate changes the referent to Natasha, which (a) makes Pierre's follow-up question in ¶20 non-sequitur, and (b) has Natasha Rostova being matched with "young Rostov" — i.e. her own brother. Restore: `"I've seen the princess," she replied. "I heard they were arranging a match for her with young Rostov. It would be a very good thing for the Rostovs—they say the family's utterly ruined."` |
| **335-b** | **moderate** | ¶57 ends: `"...as familiar to me as I am to myself?... **No, that's impossible!...**"` | ends at `"...as familiar to me as I am to myself?..."` | **Dropped clause.** The closing refrain "No, that's impossible!" is dropped. It matters: it is the third beat of the chapter's "Is it possible? / No, it can't be" motif that then recurs verbatim in ¶52 and ¶55. Note this slipped past the question-mark parity check because the dropped sentence ends in "!", not "?" — a demonstration that "?"-parity alone is not a sufficient drop-detector. Restore: append `No, that's impossible!...` |
| 335-c | minor | ¶56: "holding it a little longer in his own" | "holding it a little longer than he should have" | Adds a judgment ("than he should have") not present in Tolstoy, who states the physical fact only. Prefer "a little longer in his own." |
| 335-d | minor | ¶3: "Evidently it has to be so" | "It's clearly meant to be" | "meant to be" imports a providential/romantic idiom slightly stronger than Tolstoy's flat "evidently it has to be so." Low priority; consider "Clearly it has to be this way." |

The rest of 335 is accurate, including the Savelich freedom exchange, the Faceted Palace / Chief of Police passage (with the full bribe meditation intact), and the burned-Moscow "Rhine and the Colosseum" description.

### Ch. 336 (9 ¶)
Read in full. Clean. Includes the full "Je vous aime" recollection, the imagined Natasha speech, the Prince Vasili passage, and the closing definition of Pierre's madness — all intact.

| # | Severity | Source | Candidate | Proposed correction |
|---|---|---|---|---|
| 336-a | minor | ¶2: "whether what he had undertaken was right **or wrong**" | "was right" | Trivially elided; meaning unaffected. Optional restore. |

### Ch. 337 (21 ¶)
Read in full. Clean; no findings of substance.

| # | Severity | Source | Candidate | Proposed correction |
|---|---|---|---|---|
| 337-a | minor | ¶21: "Yes, Mary, **He** must...." | "Yes, Mary, **he** has to...." | Maude capitalizes "He" here (likely a typesetting artifact rather than intent). Candidate's lowercase is defensible; no change needed. Logged for completeness. |

---

## 4. Essay chapters 338–340 — full-detail review

These were read paragraph-by-paragraph against the source, with particular attention to (a) enumerations, (b) named figures, (c) the "X claims / but in fact Y" argumentative skeleton that the prior defective run is documented to have inverted.

### Ch. 338 — "Seven years had passed" / the historians judging Alexander I (17 ¶)

**No findings at moderate or major severity. This chapter is fully translated, not summarized.**

Verified in detail:

- **¶3** — the whole "sea of history" development survives, including the *specific contrast* that historic figures no longer move from shore to shore but "seemed to rotate on one spot," and that the same restless movement is now expressed through "political and diplomatic combinations, laws, and treaties." A summarizer would have cut the second half. It is present.
- **¶4–5** — the argumentative frame is correct: historians *call* this "the reaction," and they *condemn* the figures they hold responsible. Candidate: "they pass stern judgment on the historical figures they hold responsible for what they call the reaction." Attribution preserved, not flattened into Tolstoy's own voice. ✅
- **¶6** — the paradox is preserved intact and not softened: the same man the historians blame for the reaction is, *by their own account*, the chief cause of the liberal movement and the savior of Russia. This is exactly the shape of claim the prior run was inverting; here it is correct.
- **¶8** — the historians' catalogue, quoted. See §5 below: complete.
- **¶11** — the pivotal rhetorical question ("Don't the very same actions the historians praise Alexander I for... flow from the very same sources...") retains *both* lists in full: the praised set (liberal attempts, struggle with Napoleon, firmness in 1812, campaign of 1813) and the blamed set (Holy Alliance, restoration of Poland, reaction of 1820 and after), and keeps the three-part causal source ("birth, education, and life"). Kept as a single sentence, one "?", matching the source. ✅
- **¶13** — the long periodic sentence. Split into modern units but **every** clause survives in order: highest pinnacle of human power; blinding light of history; the intrigue/flattery/self-deception triad "inseparable from power"; responsibility for all Europe at every moment; "not a fictitious but a live character"; habits, passions, impulses toward goodness/beauty/truth; the parenthetical concession that the historians do not accuse him of lacking virtue; and the closing present-day-professor comparison with its sting ("books and lectures and taking notes on them"). Nothing generalized away. ✅
- **¶14** — the reflexive turn (the historian judging Alexander will himself be judged mistaken) is intact, as is the concrete illustration that the *same* two acts — Poland's constitution and the Holy Alliance — are simultaneously counted praiseworthy by some and blameworthy by others. That double-use of the same examples is the load-bearing move of the paragraph and it is preserved.
- **¶15** — the full seven-item catalogue of competing goods survives in source order: father's house in Moscow / glory of Russian arms / prosperity of the Petersburg and other universities / freedom of Poland / greatness of Russia / balance of power in Europe / "a certain kind of European culture called 'progress'". ✅ Prime summarization target; uncompressed.
- **¶16** — the extended hypothetical. All four program terms present and in order ("nationality, freedom, equality, progress"), the aside "these, I think, cover the ground" preserved, and — critically — the conclusion is **not** inverted: "That activity simply would not have existed. There would have been no life at all. There would have been nothing." Matches source exactly in force and direction. ✅
- **¶17** — the epigram lands correctly: "If we accept that human life can be governed by reason, then the very possibility of life is destroyed." Direction correct (accepting reason *destroys* life's possibility), not reversed.

Minor stylistic notes only (no action required): ¶13 renders the parenthetical as "even the historians don't deny him that" for Maude's "the historians do not accuse him of that" — logically equivalent; ¶14 shifts "what once seemed good, ten years later seems bad" to "what looked good ten years ago looks bad now" — same claim, tense re-anchored.

### Ch. 339 — chance and genius / the ram (11 ¶)

**No findings at moderate or major severity.**

- **¶1–2** — the four-branch reductio is complete and in source order: aggrandizement of Russia (achievable without the preceding wars and the invasion) / aggrandizement of France (without the Revolution and the Empire) / dissemination of ideas (printing press better than warfare) / progress of civilization (better ways than destroying wealth and lives). All four branches present with their specific counterfactuals attached. ✅
- **¶4** — the quoted maxim is preserved as a quotation attributed to history: `"Chance created the situation; genius made use of it," says history.` Attribution intact.
- **¶6** — the two definitions are kept as parallel first-person confessions with their internal mechanics: *I don't know why → I decide I can't know → I stop trying → I call it chance*, and *I see a force beyond ordinary human power → I don't understand → I call it genius.* The three-step structure of the first is what makes the paragraph an argument rather than an assertion; it is present.
- **¶7 — the ram.** The drafter's notes claim the full mechanism was kept. **Confirmed.** Every step is present: the single ram singled out; driven *every evening* by the herdsman; into a *separate* enclosure; *to be fed*; grows *twice as fat* as the rest; appears to the others a *genius*; the separate pen is specifically *full of oats*; and the punchline — the ram, *bursting with fat*, is *slaughtered for meat*. The "astonishing coincidence of genius with a whole run of extraordinary chances" framing is also retained. Nothing compressed. ✅
- **¶8** — the resolution is not inverted: the rams need only *stop assuming* everything serves their sheepish aims and *admit* purposes beyond their understanding; then they perceive unity; and crucially the source's concession is preserved — *even without knowing the purpose*, they would know nothing happened by accident. That concession is what keeps the argument honest, and a summarizer would drop it. It is present.
- **¶10** — the geographic list of "the murders" is complete and in source order: France, Italy, Africa, Prussia, Austria, Spain, Russia. ✅ Both directional movements (west→east, east→west) retained.
- **¶11** — the plant/blossom/seed analogy and the conclusion about Napoleon and Alexander being "perfectly fitted, down to the smallest detail, for the purpose they had to fulfil" is preserved, including "with everything that made them who they were" for Maude's "with all their antecedents."

One stylistic note (no action): ¶7 renders "herd of rams / herdsman" as "flock of rams / shepherd." Defensible modernization; "herd" is the odder, more Tolstoyan word but the sense is unchanged.

### Ch. 340 — the westward movement / Napoleon's rise (16 ¶)

**No findings at moderate or major severity. This is the densest enumerative chapter in the batch and it survives intact.**

- **¶1 — the three preconditions.** All three present, numbered, in source order, with their qualifiers:
  1. form into a military group *of a size able to withstand a collision with the warlike military group of the east* — the size-relative-to-the-east qualifier is kept, not reduced to "a big army";
  2. *throw off all established traditions and customs*;
  3. have at their head *a man who could justify to himself and to them* the lies, robberies, and murders the march would require — the dual justification (to himself *and* to them) is preserved, and all three crimes are named.
  The candidate adds the scaffold phrase "three things had to happen," which is not in the source but is an accurate reading aid and does not alter content. Acceptable; logged as an addition.
- **¶3** — all five negations retained: no convictions, no habits, no traditions, no name of his own, not even a Frenchman. Plus "without attaching himself to any one of them."
- **¶4** — the rise-to-command chain, complete: ignorance of his colleagues / weakness and insignificance of his opponents / frankness (rendered "bluntness") of his lies / his dazzling self-confident limitations → head of the army. Then: the brilliant qualities of the soldiers *sent to Italy*, his opponents' reluctance to fight, his childish audacity → military fame. Then the "so-called chances": falling out of favor with France's rulers turning to his advantage; **refusal from the Russian service**; **the failed Turkish appointment**; near-destruction in Italy *several times*, each time saved unexpectedly; and the Russian armies — "the very ones that might have destroyed his reputation" — arriving only after he is gone, *owing to diplomatic considerations*. All eleven beats present. ✅
- **¶5** — the Egyptian chain, complete: the Paris government dissolving and destroying everyone in it; the "aimless and senseless expedition to Africa"; **impregnable Malta surrendering without a shot**; the most reckless schemes succeeding; **the enemy fleet — which afterward would not let a single boat pass — letting his entire army through**; the outrages against a nearly unarmed population; and the self-justification **"it resembles Caesar, it resembles Alexander the Great, and so it must be good."** All present. ✅
- **¶6** — the ideal-of-glory definition is preserved with its *two* stages (not merely seeing nothing wrong, but *taking pride in* every crime and ascribing supernatural significance to it) — a distinction a summarizer collapses. Then: plague doesn't touch him; **murdering prisoners not imputed as a fault**; the shameful abandonment of his comrades credited to him; **the enemy fleet letting him past twice**; the republican collapse at its extreme limit; his party-free newcomer status exalting him; and the closing "no plan, but quite ready for his new role." ✅
- **¶10** — the legislature scene retained in full, including the feigned swoon, the senseless words "that should have destroyed him," and — importantly — the *reason the rulers fail to act*: they sense their own part is played out and are more bewildered than he is. Causal explanation intact, not reduced to "they failed to stop him."
- **¶11 — the chance catalogue.** All eight beats present, in sequence, none merged:
  1. chance shapes the characters of France's rulers, who submit;
  2. chance shapes the character of **Paul I of Russia**, who recognizes his government;
  3. a plot against him that *confirms* rather than harms his power;
  4. the **Duc d'Enghien** put in his hands and killed — with the reasoning preserved: it convinces the mob "that he had the right, because he had the might";
  5. the **England expedition** prepared but never carried out, with the parenthetical that it "would certainly have ruined him";
  6. the unexpected fall on **Mack and the Austrians**, who **surrender without a fight**;
  7. **"Chance and genius together hand him victory at Austerlitz"** — both nouns retained;
  8. all Europe **except England, which takes no part in the events about to unfold**, recognizing his authority, his self-given title, and his ideal, despite their former horror at his crimes.
  ✅ Complete. This is the single highest-risk paragraph in the batch and it is fully rendered.
- **¶12 — the 1805–1811 buildup.** All years present and in order: **1805, 1806, 1807, 1809**, then **1811** for the union with Central Europe. The named self-abasements are all present and correctly attributed: the **King of Prussia** sending his wife to beg for mercy; the **Emperor of Austria** counting it a favor that Napoleon takes "a daughter of the Caesars" into his bed; the **Pope**, "guardian of everything the nations hold sacred," putting religion to work glorifying him. The ten-year preparatory period, the inversion ("it isn't so much Napoleon preparing himself... as everyone around him preparing him"), the "no step, no crime, no petty fraud" that isn't dressed up as a great deed, **Jena and Auerstädt** as the Germans' chosen celebration, the list of also-great relations (ancestors, brothers, stepsons, brothers-in-law), and the closing "everything possible is done to strip him of whatever reason he has left." ✅ Nothing generalized.
- **¶13** — the reversal. **Austerlitz to Wagram** retained as the comparison span; the **head cold at Borodino**, **the sparks that set Moscow ablaze**, and **the frosts** all three named as the inverse chances. ✅ These three specifics are exactly what a summarizer drops.
- **¶15** — the symmetry paragraph. The counter-movement years **1805, 1807, 1809** are retained, along with all four parallel features (coalescence into an enormous group / adhesion of Central Europe / hesitation midway / increasing rapidity near the goal). ✅
- **¶16** — the Elba coda. The full argument survives: the allies detest him; stripped of power with crimes exposed, he *should* have appeared to them what he appeared "ten years earlier and would look again a year later — an outlaw, a brigand"; "but by some strange chance, no one sees him that way"; "his part is not finished yet"; and the three concrete absurdities of the settlement — an island **two days' sail from France**, presented to him as his **dominion**, with **guards** and **millions of money**. ✅

**Argumentative-inversion audit (338–340):** I checked every attribution-and-rebuttal construction in the three essay chapters — 338 ¶4, ¶5, ¶6, ¶8, ¶9, ¶11, ¶14, ¶16, ¶17; 339 ¶1, ¶4, ¶6, ¶8, ¶9, ¶10; 340 ¶1, ¶6, ¶10, ¶16. **Zero inversions found.** Every "historians say X" is still attributed to the historians rather than asserted in Tolstoy's own voice, and every "but in fact Y" points in the source's direction. In particular, none of the failure signatures documented for the prior run appear: no "historians have no answer" flattening (338 ¶4–6 keeps the reply), no dropped counterfactual branches (339 ¶2 keeps all four), no collapsed enumerations (340 ¶1, ¶11, ¶12 all complete).

---

## 5. Audit of the drafter's specific claims

Each claim independently re-verified against the source.

| # | Drafter's claim | Verdict |
|---|---|---|
| 1 | Exact paragraph-count match per chapter, 220/220 | **CONFIRMED** (re-run independently) |
| 2 | Question-mark parity enforced **per paragraph**, not just per chapter | **CONFIRMED** (all 220 ¶ match exactly). Caveat: this check is not a drop-detector — finding 335-b is a dropped sentence ending in "!", which parity cannot see. |
| 3 | Ch. 338 ¶8 — full list of Alexander's "bad" decisions preserved | **CONFIRMED.** All eight items present in source order: Poland's constitution / Holy Alliance / power to Arakcheev / favoring Golitsyn and mysticism / later Shishkov / and Photius / meddling in the active army / disbanding the Semyonov regiment. Nothing dropped, nothing reordered. |
| 4 | Ch. 338 ¶5 — named roll call complete | **CONFIRMED.** Alexander, Napoleon, Madame de Staël, Photius, Schelling, Fichte, Chateaubriand — all seven, in source order, with "and the rest" retained. |
| 5 | Ch. 340 ¶1 — three numbered invasion preconditions, numbered and in order | **CONFIRMED**, with qualifiers intact (see 340 ¶1 above). Note: the candidate adds the non-source scaffold "three things had to happen"; accurate but an addition. |
| 6 | Ch. 340 ¶4–6 — Napoleon's rise chain, item by item | **CONFIRMED.** Every item the notes list was found in place: ignorance of colleagues, weakness of opponents, bluntness of lies, self-confident limitations, the army sent to Italy, opponents' reluctance, refusal from Russian service, failed Turkish appointment, repeated near-destruction in Italy, Russian armies arriving too late, dissolution of the Paris government, the African expedition, Malta without a shot, the fleet letting the army through, the atrocities, the Caesar / Alexander-the-Great self-comparison. |
| 7 | Ch. 340 ¶11 — all eight Consulate/Austerlitz "chance" beats intact | **CONFIRMED.** Enumerated above; all eight present, in sequence, unmerged. |
| 8 | Ch. 340 ¶12 — years, named heads of state, Jena and Auerstädt | **CONFIRMED.** 1805/1806/1807/1809/1811, King of Prussia, Emperor of Austria, the Pope, Jena and Auerstädt all present and specifically attributed. |
| 9 | Ch. 339 ram metaphor mechanism kept whole | **CONFIRMED.** Every step present (see 339 ¶7 above). |
| 10 | "Hélène" → "Helene", 1 occurrence, Ch. 336 | **CONFIRMED** (1 in source, 1 normalized). |
| 11 | "Marya Abrámovna" → "Mary Abramovna", applying the project's Marya→Mary rule | **PARTIALLY INCORRECT.** The source already reads "**Mary** Abrámovna" — there is no "Marya" anywhere in the source for this batch. The only change actually made was stripping the diacritic (Abrámovna → Abramovna). The result is correct; the *description* of what was done is wrong, and mischaracterizes a diacritic strip as a name normalization. Minor, but notes should be accurate. |
| 12 | No "Andrei"/"Nikolai"/accented Kutuzov introduced; Kutuzov absent from 333–340 | **CONFIRMED**, including the absence claim — Kutuzov appears 0 times in the source for this batch. |
| 13 | Word-count ratio 0.99–1.06 per chapter, consistent with full rendering | **CONFIRMED** at chapter level; per-paragraph spread is wider (0.69–1.75) but only on very short paragraphs, which is expected and benign. |
| 14 | "No named historical figure, numbered item, or concrete illustration found in the source was cut, generalized, or merged" | **CONFIRMED** for named figures and enumerations (verified by automated proper-noun diff across all 220 paragraphs plus manual read of all three essay chapters). **One qualification:** finding 335-b is a dropped sentence in a narrative chapter — not a named figure or a list item, so the claim is literally true as worded, but the blanket "nothing was cut" impression it creates is not quite right. |

---

## 6. Whole-batch coherence

Read end-to-end as a continuous reading experience.

**Narrative arc (333–337)** flows well. The Pierre/Natasha thread builds correctly across the four chapters: the first evening's confession (333), the supper and the story of captivity (334), the sleepless night and Princess Mary's brokering (335), Pierre's "blissful insanity" (336), and Natasha's reawakening seen from Princess Mary's side (337). The recurring "Russian bath" image is carried across the 334 ¶49 → 337 ¶1 seam consistently ("bathhouse" in both), which matters because 337 opens by quoting 334. The "Is it possible? / No, it can't be" refrain is consistent in 335 ¶52 and ¶55 — and its third instance in ¶57 is where finding 335-b bites; restoring it also restores the motif.

The one genuine coherence break in the whole batch is **335-a**, which makes the ¶19→¶20 exchange read as a non-sequitur and introduces an accidental brother-sister match. A reader will stumble there.

**Essay arc (338–340)** is coherent as an argument, sentence to sentence, and this is the important result. The three chapters build properly:

- 338 establishes that the historians' judgments of Alexander presuppose a standard of good they cannot have, and closes on the reductio that a life governed by reason would be no life at all.
- 339 picks up exactly where 338 left off: *if* you keep the historians' premise (great men steering toward ends), you are forced into "chance" and "genius" as explanatory words — which the ram shows to be names for our own ignorance rather than descriptions of anything. The pivot from 338's "standard of good" to 339's "chance and genius" is intact, and the candidate's rendering makes the hinge clear rather than blurring it.
- 340 then *applies* 339's conclusion: having discarded chance and genius, Tolstoy narrates the entire Napoleonic rise and fall as a chain of necessity, which only works rhetorically because every single "chance" is named and piled up. This is why the enumeration-preservation matters so much here, and it holds.

Crucially, the essays do not read as a précis. The modern English is genuinely modern — contractions, shorter units, "let's grant, for argument's sake" — but the periodic accumulation that *is* Tolstoy's argument is intact, and the long catalogues still land as catalogues. The prior defect's signature (an essay that states conclusions without the examples that earn them) is absent.

---

## 7. Summary verdict

**Findings by severity:**

| Severity | Count | Findings |
|---|---|---|
| **Major** | **1** | 335-a (referent substitution "the princess" → "the young countess", breaks ¶19–20 logic and creates a brother-sister match) |
| **Moderate** | **2** | 334-a ("his houses" → "her houses"); 335-b (dropped closing sentence "No, that's impossible!...") |
| **Minor** | **7** | 333-a, 334-b, 334-c, 334-d, 335-c, 335-d, 336-a (+337-a logged, no action) |
| Notes inaccuracy | 1 | Claim #11 mischaracterizes a diacritic strip as a Marya→Mary normalization |

**Essay-chapter content preservation (338–340): PASS, with no findings at moderate or above.** All four content claims under specific audit are confirmed — Alexander I's numbered decisions list (all eight items), the named-figures roll call (all seven), the three numbered invasion preconditions (all three, with qualifiers), and Napoleon's rise-to-power chain (Italy, Egypt/Malta, Brumaire, Duc d'Enghien, Mack's surrender, Austerlitz — all present, plus the 1805–1811 buildup and the reversal specifics). Zero argumentative inversions across all nineteen attribution-and-rebuttal constructions checked. The documented defect from the prior generation run does **not** recur in this batch.

**Recommendation: ACCEPT after three corrections.** Apply 335-a (major), 334-a and 335-b (moderate); the seven minor items are optional polish. None of the three required corrections touches chapters 338–340, and none affects paragraph counts or question-mark parity — all are within-paragraph edits, so re-running the structural check after the fix should still pass clean. Also correct claim #11 in the drafter's notes.

One process note worth carrying to batches B and C: the per-paragraph question-mark parity check is a good structural guard but gave false comfort here, since the one dropped sentence in the batch ended in "!" rather than "?". A per-paragraph terminal-punctuation-count check (`.`, `!`, `?` together) or a sentence-count band would have caught 335-b automatically.
