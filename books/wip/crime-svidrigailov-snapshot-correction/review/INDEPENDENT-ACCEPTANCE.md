# Independent acceptance review: Svidrigaïlov snapshot correction

Reviewer: independent editorial reviewer (content only). Date: 2026-09-24.
Subject: `PATCH.json` applied to `inputs/crime-and-punishment.v1.json` (sha256 `2125526c…6d98`), character `svidrigailov`, editions `original-en` (Garnett, `inputs/source.json`) and `modern-en` (`inputs/baseline-live-modern-en.json`), with `candidateCoordinates` checked against `inputs/candidate.json` (sha256 `18be4155…88eb`).

## Verdict: ACCEPT WITH NOTES

The patch is correct and does exactly what its scope says. "Recently widowed" and the St. Petersburg arrival sentence are premature at 3.38, and the patch removes both from the first-encounter card. The new snapshot 2 releases at a point where every clause is supported. No materially earlier point is equally good. All mechanics are correct, and the patched sha256 matches the author's figure. Notes 1 to 3 are outside the owner's scope or optional. None of them blocks acceptance.

## Method

- I wrote my own helpers in `review/tools/`, not `tools/apply_patch.py` or `tools/make_patch.py`:
  - `common.py`: loads the editions, applies the prose normalization `text.replace(/\n/g,' ').replace(/ {2,}/g,' ')`, and measures UTF-16 lengths.
  - `show.py` and `mentions.py`: print paragraphs and find keywords across the whole text.
  - `verify_patch.py`: applies the patch by hand, checks it, and writes `review/patched-crime-and-punishment.v1.json`.
- I read 3.38 in full in both editions and searched the whole text for `Svidriga`, `Marfa`, death words (`widow|funeral|died|dead`) and wealth words (`rich|wealth|well off|estate|debt|rouble|money|landowner`). I then read 16.66–80, 17.44–66, 20.66–68, 21.0–30 and 22.0–6 / 22.28–46 in full, in the original, the live modern-en and the candidate.
- Integrity checks: each edition's `sourceSha256` equals the sha256 of its input file. `paragraphHashes` equal sha256(normalized text) at 3.38, 16.73, 22.31, 22.34 and 22.37. The baseline card re-serializes byte for byte with `json.dumps(indent=2, ensure_ascii=False)+"\n"`.

## a. What the reader knows at the first mention (3.38)

**Before 3.38.** Chapters 1–3 never mention Svidrigaïlov or Marfa Petrovna in any of the three texts. Every `Svidriga`/`Marfa` hit before chapter 4 is in 3.38.

**Up to the first mention.** The first mention is at original-en offset 2855, ending "At first indeed Mr. Svidrigaïlov", and at modern-en offset 2530, ending "At first, indeed, Mr. Svidrigailov". Before that point the letter says only three things about him:
- Dounia "had a great deal to put up with in the Svidrigaïlovs’ house" (original 3.38 @1631).
- She "took the place as governess in their family", with a hundred-rouble advance.
- The family has "concealed" what happened from Rodya.

**The rest of 3.38.** He treated her rudely and "under the influence of Bacchus" he "relapsed into his old regimental habits". He "had conceived a passion for Dounia" and made "an open and shameful proposal… to take her to another estate of his, or even abroad". Modern-en has "take her to another estate or even abroad". He is "the father of a family", and "Marfa Petrovna, Mr. Svidrigaïlov’s wife" is **alive** and active: she strikes Dounia, spreads the scandal and then rehabilitates her. The paragraph ends the affair with "the whole ignominy of this affair rested as an indelible disgrace upon her husband".

Clause by clause for the **new** snapshot 1 body:

| Clause | Classification at 3.38 |
|---|---|
| "Wealthy" | Acceptable baseline. He is a landowner with more than one estate ("another estate of his"). Rodya calls him "that landowner" at 22.2. It is the ordinary social setting. The modern-en wording ("another estate") is weaker but still implies landed means. See note 3 on how later text complicates this. |
| "unsettling" | Acceptable. The text before the mention is only "a great deal to put up with". The same paragraph then describes rudeness, jeering, drinking and a shameful proposal. This is a fair character summary within the paragraph. |
| "pursued Dunya while she worked in his household" | Acceptable baseline. Before the mention the reader knows she was his family's governess and suffered in the house. The pursuit is told a few sentences later in the same paragraph, and it is his defining relationship in the opening setting. It is not a concealed identity or a later plot development. |
| "rumored to be responsible for terrible things" | **Premature (outside the patch scope; see note 1).** 3.38 contains no rumour about him beyond the Dounia affair itself. The town's gossip is about *Dounia*. His "disgrace" is for the harassment. The first rumour of other terrible deeds is at **17.49**: "that awful man seems to have been the cause of her death. They say he beat her dreadfully." It is repeated at 21.16 ("You have got rid of Marfa Petrovna, too, so they say?") and developed at 22.36–22.43 (the hushed-up criminal case, the Resslich girl, the servant Philip). So from 3.38 to 17.49 the card hints at material the book has not yet raised. The hint is vague, but it is still a hint. |

**The removed details were premature (confirmed).**
- "recently widowed" is not just premature at 3.38. It **contradicts** the paragraph, where Marfa Petrovna is his living wife. Her death is first reported at 16.73.
- "His arrival in St. Petersburg alarms the whole Raskolnikov family": in 3.38 he is in the provinces. The only person bound for Petersburg in the letter is Luzhin ("in a great hurry to get to Petersburg"). Svidrigaïlov first appears in Petersburg at 20.68/21.8, and the family's alarm is at 22.2/22.32/22.34.

## b. Earliest support for each deferred detail

Original-en coordinates are given below. Modern-en and the candidate have the same content at the same paragraph indices; I checked each one.

| Detail | First support | Quote (original-en) |
|---|---|---|
| Marfa Petrovna dead, so he is a widower | **16.73** (end 317; modern 314; candidate 312) | "You don’t know, Dmitri Prokofitch, that Marfa Petrovna’s dead!" Repeated to Rodya at 17.45. Her marriage to him is known from 3.38 and 17.47 ("Marfa Petrovna Svidrigaïlov"). |
| Rumours of terrible deeds | **17.49** | "that awful man seems to have been the cause of her death. They say he beat her dreadfully." Then 17.53 ("he’s an awful man!"), 21.16, 22.36, 22.37 ("a criminal charge, involving an element of fantastic and homicidal brutality… was hushed up") and 22.40–22.42. |
| He is in St. Petersburg | **20.68** (he introduces himself in Raskolnikov's room). Explicit at **21.8** ("I only arrived myself the day before"). | 22.2: "He came here at once after his wife’s funeral." 22.31: "set off in haste for Petersburg immediately after his wife’s funeral." |
| The whole family's alarm | Rodya: 21.2/21.11, and explicitly **22.2** ("I don’t know why I’m afraid of that man… We must guard Dounia from him"). Dounia: **22.32** ("To Petersburg? here?” Dounia asked in alarm"). Mother: **22.34** ("Good heavens! won’t he leave Dounia in peace even here?"). | The whole family is alarmed only by the **end of 22.34**. |

**Release point.** The earliest point at which every clause of the snapshot 2 body is supported is the **end of 22.34**, because "whole family" needs the mother's reaction. The patch releases at the end of **22.37**. That is three paragraphs later in the same exchange: 22.35 is 244 units, 22.36 is 240 and 22.37 is 1063 in the original. This is not a material delay. It also gains the strongest support for "terrible things", Luzhin's account of a hushed-up homicidal case at 22.37. No materially earlier point is equally supported. 21.8 has the arrival and Rodya's hostility but not Dunya's or the mother's alarm. 22.2 has Rodya's fear only.

Nothing in snapshot 2 is premature at 22.37. "Recently widowed" is supported from 16.73, the arrival and family alarm from 22.34, the Dunya pursuit from 3.38 and the rumours from 17.49 onward. All of these are attributed as rumour, as EDITORIAL-POLICY requires.

**"Wealthy" at 22.37** is a judgment call, and the text leans against it. See note 3. By 22.37 the reader has read:
- 21.37: he was in debtor's prison, and Marfa held a 30,000-rouble IOU over him.
- 21.43: "She had a fortune."
- 21.103: "though I am not rich, this ten thousand roubles is perfectly free".
- 22.37 itself: "I do not know whether he is well off now… if he has any pecuniary resources… to pay his debts eight years ago".

22.44 (debtor's prison "again") and 22.52 ("he said that he wasn’t rich and all the estate was left to his children") follow soon after. So the word is not a spoiler, but it is questionable as a description from Part 4 on. It is outside the patch scope, since snapshot 2 deliberately repeats the original body verbatim.

## c. Mechanics

**Paragraph-end UTF-16 offsets (recomputed):**

| Paragraph | original-en | live modern-en | candidate | PATCH.json |
|---|---|---|---|---|
| 16.73 | 317 | 314 | 312 | 317 / 314 / 312 ✓ |
| 22.31 | 266 | 237 | 237 | 266 / 237 / 237 ✓ |
| 22.34 | 87 | 87 | 87 | 87 / 87 / 87 ✓ |
| 22.37 (evidence and availableAt) | 1063 | 973 | 973 | 1063 / 973 / 973 ✓ |

`candidateCoordinates.appliesTo` ("18be4155…") matches the candidate's sha256.

**Independent application.** I applied the patch in `verify_patch.py` with explicit, path-checked edits and no generic path walker. The result is `review/patched-crime-and-punishment.v1.json`.
- `old` equals the baseline `svidrigailov-1.body` exactly in **both** editions.
- The two cards are identical except for `svidrigailov-1.body` and the inserted `svidrigailov-2` in each edition. I checked this with a whole-document structural comparison after masking those two items. `firstMention`, `roleVisibleAt`, `kind`, `storyRole`, names, subtitles, mentions, coverage and all other characters are unchanged.
- In snapshot 2, the name and subtitle equal snapshot 1's ("Svidrigaïlov" in original-en, "Svidrigailov" in modern-en). The body equals the old snapshot 1 body verbatim, and the key set is identical to snapshot 1's.
- Runtime validity holds in both editions:
  - availableAt 3.38.x < 22.37.end, so snapshots are strictly ordered.
  - Every availableAt is ≥ firstMention.
  - Every offset is within 0..paragraph length.
  - Every evidence point is ≤ its snapshot's availableAt.
- Patched sha256 = **`1edc7e5a76d05a6970430473f442dbbee8913ddcc6cb6686ffb21a81481c9701`**. This matches the author's figure.

## d. editorialBasis citations

| Claim | Check |
|---|---|
| "Marfa Petrovna's death (so his widowhood) is established at 16.73" | Accurate. This is the first report in all three texts. |
| "his arrival in St. Petersburg and the family's alarm at 22.31-22.34" | Accurate for the family learning of it and reacting: Luzhin at 22.31, Dounia at 22.32, the mother at 22.34. The reader actually meets him in Petersburg at 20.68/21.8. The citation is not wrong, because the card's clause is about the family's alarm, but it is not the first point for "arrival". |
| "the rumors of a hushed-up criminal case of homicidal brutality at 22.36-22.37" | Slightly loose. The hushed-up case is only in 22.37. 22.36 is Pulcheria's conviction that he caused Marfa's death, which is a different rumour. The evidence list cites 22.37 but not 22.36. The basis also leaves out the earlier rumour at 17.49 and 21.16, which is fine because it lists support, not first occurrence. |
| "Released at the end of the reviewed source paragraph" | Accurate: 22.37 end, 1063 in the original and 973 in modern-en. |

The same basis text is used in modern-en. The paragraph indices refer to the same content there, so the citations hold in both editions.

## Notes and disagreements (non-blocking)

1. **Snapshot 1 still says "rumored to be responsible for terrible things". I disagree with keeping it, but it is outside this patch's scope.** It is not supported at 3.38 and first becomes true at 17.49. It hints at plot material 14 chapters early. Recommended follow-up, which is a one-field change in both editions, e.g.:
   "Wealthy and unsettling, he pursued Dunya while she worked in his household, and the scandal ended in his public disgrace."
   This is supported within 3.38: "the whole ignominy of this affair rested as an indelible disgrace upon her husband". Snapshot 2 already carries the rumour clause from 22.37, so nothing is lost.
2. **editorialBasis wording (optional):** "…Pulcheria's conviction that he caused Marfa Petrovna's death (22.36) and Luzhin's report of a hushed-up criminal case of homicidal brutality (22.37)." Adding 22.36 to the evidence list would also make it consistent.
3. **"Wealthy" in snapshot 2** conflicts with 21.37, 21.103 and 22.37 (and later 22.44 and 22.52). A future content pass could replace it with something like "Marfa Petrovna's widower, of uncertain means". This is outside the current scope.
4. **Informational, candidate rebinding:** in `candidate.json`, the 3.38 name reads "Mr. Svidrigaïlov" and ends at offset **2536**, not 2530. So snapshot 1, firstMention, roleVisibleAt and the mention spans will need the candidate rebinding when the candidate goes live. `candidateCoordinates` covers only snapshot 2. The 3.38 possessive "Svidrigaïlovs’ house" (@1631 original) comes before the bound first mention. That is acceptable, since it names the household, and it is not a concern of this patch.

## Files

- `review/tools/common.py`, `show.py`, `mentions.py`, `verify_patch.py`: review scripts. Run `python3 review/tools/verify_patch.py`.
- `review/patched-crime-and-punishment.v1.json`: independently patched copy, sha256 `1edc7e5a…9701`.
