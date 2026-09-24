# Independent acceptance v3: Svidrigaïlov snapshot correction

Reviewer: fresh independent editorial reviewer. Date: 2026-09-24.
This review does not rely on `review/INDEPENDENT-ACCEPTANCE.md` or `review/tools/`, and I did not read either. Everything below comes from my own code and my own reading of the pinned texts.

## Verdict

**ACCEPT WITH NOTES. This covers both patch files:**

| File | sha256 | Applies to | Patched sha256 (my own apply) |
|---|---|---|---|
| `PATCH.json` | `f8cc73ef…a945` | live card `2125526c…` (original-en = `source.json`, modern-en = `baseline-live-modern-en.json`) | `9c50ea4c2edd372daed83c24db0b9e2c9914e5972d71923a0e5bc20562ff7205`, which matches the author |
| `PATCH-staged-01963b24.json` | `cf4be5a3…c2d6` | staged card `b4e2217d…` (modern-en = `candidate.json`) | `4a840fffe7f4fdd83a90fee767900938661d7f1098d63437ad8627c3bbdf6bec`, which matches the author |

- Every claim in the three snapshots is supported at its release point in all three texts: Garnett, live modern-en and the candidate.
- Both new release points are the earliest paragraph ends at which every claim of the snapshot is supported.
- No snapshot leaks a surprise, a later development or an unestablished fact.
- The mechanics are exact.

The notes below are non-blocking wording and citation refinements. None of them is required for release.

## Method

1. **Hashes.** I pinned the hashes of all inputs.
2. **Tools.** I wrote my own loader (`tools/texts.py`). It uses the runtime normalization `text.replace(/\n/g,' ').replace(/ {2,}/g,' ')` and UTF-16 lengths. I also wrote a regex finder (`tools/find.py`).
3. **Reading.** I read 3.38 in full in Garnett and modern-en. I then read every paragraph that names Svidrigaïlov or Marfa Petrovna from 3.38 through 22.40, in each edition. `tools/find.py` gives the full mention list.
4. **Wealth scan.** `tools/wealth_scan.py` covers every Svidrigaïlov-bearing paragraph, all of chapter 21, and 22.0–22.34. It looks for wealth and poverty terms: rich, fortune, estate, property, money, thousand, debt, prison, revenue, landowner, and so on.
5. **Mechanics.** `tools/verify.py` does the following:
   - applies both patches with an independent path resolver to fresh copies of the two baseline cards;
   - checks `old` values, `after` and `absentBefore`;
   - diffs the whole card structurally to prove that only declared fields change;
   - recomputes every offset as a paragraph-end UTF-16 length on the edition each card is bound to;
   - confirms each card's `paragraphHashes` for 3.38, 16.73, 17.49, 22.31 and 22.34 against that edition, which proves the card and text pairing;
   - checks snapshot order, bounds, the firstMention gate and evidence not after availableAt;
   - simulates the runtime rule ("latest snapshot with availableAt ≤ C; nothing before firstMention") at 13 positions per edition;
   - serializes with `json.dumps(indent=2, ensure_ascii=False)+"\n"`.
   Full output is in `verify-output.txt`: 163 checks, 0 failures.
6. **EVIDENCE.md.** `tools/check_evidence_md.py` checks all 51 quotes in `EVIDENCE.md` against the stated text and coordinates.

Patched copies are in this folder: `patched-crime-and-punishment.v1.json` and `patched-crime-and-punishment.v1.staged-01963b24.json`.

## A key textual fact that shapes item 1

The bound first mention is not the first occurrence of the surname. At 3.38@1639 (Garnett), the phrase "in the Svidrigaïlovs’ house" occurs unbound. The card's `firstMention` is the end of **"Mr. Svidrigaïlov"** in "At first indeed Mr. Svidrigaïlov ⟦2855⟧ treated her very rudely". I confirmed that its span in the card matches the text: [2843, 2855) in Garnett, ending at 2530 in modern-en and at 2536 in the candidate.

So the reader has already read about 2,850 characters of the letter when the card unlocks. That is more context than "the first mention" suggests.

## 1. svidrigailov-1 at the end of the name (3.38 @2855 / @2530 / @2536)

**Text before the name.** Garnett: "your sister has been living with me for the last six weeks … Thank God, her sufferings are over … you had heard that Dounia had a great deal to put up with in the Svidrigaïlovs’ house … Dounia received a hundred roubles in advance when she took the place as governess in their family … At first indeed Mr. Svidrigaïlov". Modern-en and the candidate: "your sister has been living with me these last six weeks … her suffering is over … you'd heard Dunya [Dounia] was having a hard time at the Svidrigailovs' [Svidrigaïlovs'] … she took the governess position … At first, indeed, Mr. Svidrigailov [Svidrigaïlov]".

| Claim | Support before the name (Garnett / modern-en & candidate) | Status |
|---|---|---|
| Subtitle: Dunya's **employer** | "in the Svidrigaïlovs’ house … took the place as governess in their family" / "at the Svidrigailovs' … took the governess position" | Supported by text |
| Subtitle: **former** | "has been living with me for the last six weeks … her sufferings are over" / "living with me these last six weeks … her suffering is over" | Supported by text |
| Body: Dunya worked **as a governess** | "took the place as governess in their family" / "took the governess position" | Supported by text |
| Body: **in his household** | "the Svidrigaïlovs’ house", then "Mr. Svidrigaïlov" names the master of that house | Text, plus the ordinary-identity allowance (he is the head of the employing household). Not concealed. |
| Body: **where she had a hard time** | "had a great deal to put up with in the Svidrigaïlovs’ house" / "was having a hard time at the Svidrigailovs'". The modern wording is verbatim. | Supported by text |

**The rest of 3.38.** Nothing later in the paragraph is leaked. The card says nothing of:
- his rudeness or drinking;
- his concealed passion or the proposal;
- the garden scene;
- Marfa Petrovna's slander and retraction;
- his disgrace;
- Luzhin.

Nothing in the card contradicts 3.38 either. The old "recently widowed" did contradict it: Marfa Petrovna is "Mr. Svidrigaïlov’s wife", alive, later in 3.38.

**Were the removals correct under the policy?**

- **"pursued Dunya": correctly removed.**
  - The author's argument holds. Garnett stages it as a disclosure: "And how do you think it was all explained later on? Would you believe that the crazy fellow had conceived a passion for Dounia from the beginning, but had concealed it under a show of rudeness and contempt." Modern-en and the candidate have "how do you think it all turned out? Would you believe…".
  - The passion was also concealed within the story. The letter opens by promising "all that we have hitherto concealed from you".
  - Before the name, Raskolnikov (and so the reader) knows only that Dunya had "a great deal to put up with". That is mistreatment, not pursuit.
  - This is a "relationship revealed as a surprise" under EDITORIAL-POLICY.md, so it must stay gated.
- **"unsettling": correctly removed, but for a slightly different reason than the author's.**
  - His rudeness is not staged as a surprise. It is stated in the very sentence of the name: "treated her very rudely and used to make disrespectful and jeering remarks at table".
  - It is still a characterization drawn from text after the name, not ordinary identity. The README rule is that full reminders unlock at paragraph end.
  - So it belongs at the end of 3.38, not at the name. EVIDENCE.md's "3.38 (reveal)" note groups "unsettling" with the surprise. See note N3.
- **"rumored to be responsible for terrible things" and "with a dark reputation": correctly removed.**
  - Nothing before the name, and nothing in 3.38 at all, reports a rumor of terrible deeds.
  - 3.38 ends with a local scandal: "the whole ignominy of this affair rested as an indelible disgrace upon her husband". That is disgrace over this affair, not a sinister reputation.
  - The first rumor is at 17.49 (see item 3).
- **"Wealthy": correctly removed.** See item 4.

## 2. svidrigailov-2 at the end of 3.38 (15515 / 13544 / candidate 13789)

| Claim | Support by the end of 3.38 | Earliest paragraph end? |
|---|---|---|
| Subtitle: Dunya's former employer | as in item 1 | carried over |
| "Unsettling" | Garnett: "treated her very rudely and used to make disrespectful and jeering remarks at table", "relapsing into his old regimental habits, was under the influence of Bacchus", "the crazy fellow", "had the face to make Dounia an open and shameful proposal". Modern-en: "mocking remarks at the table", "had been drinking", "this ridiculous man" (candidate: "the crazy fellow"), "open and shameless proposal". | Yes. It is first supported inside 3.38, after the name. |
| "he pursued Dunya" | "conceived a passion for Dounia … make Dounia an open and shameful proposal … overheard her husband imploring Dounia in the garden … secret interviews, for which he was entreating her". Modern-en: "in love with Dunya … open and shameless proposal … overheard her husband begging Dunya … private meetings … he had been begging for". | Yes |
| "while she worked in his household" | "To leave her situation at once was impossible" / "She couldn't leave at once … escape that awful house for another six weeks" | Yes |

No earlier paragraph end is possible, because every one of these facts first appears inside 3.38.

Nothing is premature. The snapshot says nothing of widowhood, rumor or St. Petersburg, and it does not contradict the later text: it does not say he is married.

## 3. svidrigailov-3 at the end of 22.34 (87 in all three texts)

| Claim | First support | Supported by the end of 22.34? |
|---|---|---|
| Subtitle "with a dark reputation" | 17.49. Garnett: "that awful man seems to have been the cause of her death. They say he beat her dreadfully." Modern-en and candidate: "that terrible man … They say he beat her dreadfully." Repeated at 21.16: "You have got rid of Marfa Petrovna, too, so they say?" | Yes (17.49) |
| "Unsettling" | 3.38. Reinforced by 21.x and 22.2: "I don't know why I'm afraid of that man … He is very strange." | Yes |
| "recently widowed" | 16.73: "Marfa Petrovna’s dead!" (candidate: "Marfa Petrovna's dead!"; live modern-en: "Marfa Petrovna is dead!"). His wife per 3.38 and 17.47 ("Marfa Petrovna Svidrigaïlov"). Recency at 17.49: "On the very day I was sending you that letter!" Also 22.2 and 22.31: "after his wife’s funeral". | Yes (16.73, with recency by 17.49) |
| "he pursued Dunya while she worked in his household" | 3.38. Restated at 22.2: "Through his persecuting her with his attentions". | Yes |
| "is rumored to be responsible for terrible things" | 17.49 (quoted above). It is a rumor, attributed by "They say". 21.16 has "so they say". | Yes |
| "His arrival in St. Petersburg alarms the whole Raskolnikov family" | Rodya: 22.2, "I don’t know why I’m afraid of that man. He came here at once after his wife’s funeral… We must guard Dounia from him". The family learns of the arrival at 22.31, where Luzhin says he "set off in haste for Petersburg immediately after his wife’s funeral". Dounia: 22.32, "asked in alarm". Pulcheria: 22.34, "Good heavens! won’t he leave Dounia in peace even here?" | Yes. Complete only at 22.34. |

- **Is 22.34 the earliest?** Yes. The "whole family" clause needs Pulcheria's alarm, and that is first at 22.34. At 22.29 she is "anxious" only about the awkward silence.
- **Is anything premature?**
  - No. Nothing depends on 22.35 or later.
  - The fuller accusations come after the gate: Pulcheria's conviction at 22.36, Luzhin's hushed-up "criminal charge … of fantastic and homicidal brutality" at 22.37, and Resslich at 22.40. They only corroborate.
  - At one unit before the end of 22.34, the reader still sees svidrigailov-2.

## 4. "Wealthy"

I scanned the text myself (`tools/wealth_scan.py`, Garnett; I checked the modern texts by reading). I applied the owner's rule: no wealth from the ten-thousand offer, and no poverty from "I am not rich".

| Passage | What it says | Establishes wealth? |
|---|---|---|
| 3.38 @~4007 | Garnett: "take her to another estate **of his**, or even abroad". Modern-en and candidate: "take her to another estate or even abroad". The possessive is absent. | No. At most, landowning (Garnett only), made in a proposal of inducements. |
| 4.6 | "They borrow from the Svidrigaïlovs" (Rodya, about the advance) | No. It shows only that the household could advance 100 roubles. |
| 21.33 | "I am well dressed and reckoned not a poor man; … my property consists chiefly of forests and water meadows. The revenue has not fallen off". Modern-en: "not considered poor … the income hasn't dropped". | No. It is his own self-report, in litotes ("not a poor man"). It is neither the offer nor the later claim, so the owner's rule does not exclude it by name. But the passages below immediately undercut it. |
| 21.37 | "I did get into prison for debt … she … bought me off for thirty thousand … (I owed seventy thousand) … she held a document over me, the IOU" | It points the other way: he depended on her. |
| 21.43 | "made me a present of a considerable sum of money … **She** had a fortune, you know." | No. The fortune is hers. |
| 21.101 | "I have taken nothing but what Marfa Petrovna gave me a year ago." | No |
| 21.101–21.108 | The ten-thousand offer, "though I am not rich" | Excluded by the owner's rule |
| 22.2 | "that landowner" | Status, not wealth |
| 22.37 (after the gate; corroboration only) | Luzhin: "I do not know whether he is well off now, and precisely what Marfa Petrovna left him" | The text itself leaves it open |

**Conclusion.** No passage up to 22.34 establishes that he is wealthy. The evidence is his own contested self-description, set against debtors' prison and dependence on his wife's fortune. Omitting "Wealthy" from every snapshot is correct.

I disagree with the old README's "Open decisions" line that "Wealthy" is "supported at 3.38 by his estates". In modern-en the estate is not even said to be his, and landowning is not wealth. That README section predates this patch and does not affect it. See N4.

## 5. Mechanics (all pass; details in `verify-output.txt`)

- **PATCH.json hash change.**
  - Removing `baseline`, `baselineInput` and `editionInputs` from the current `PATCH.json` and re-serializing gives exactly **`323e2f5c…7bc28`**. So `operations` and `candidateCoordinates` are unchanged from the version under review, including key order.
  - The metadata is accurate: `baselineSha256` = `2125526c…`, and the edition inputs are as stated.
- **Offsets (paragraph-end UTF-16 lengths, recomputed):**

| Coordinate | Garnett | live modern-en | candidate |
|---|---|---|---|
| 3.38 end (svidrigailov-2 availableAt and evidence) | 15515 ✓ | 13544 ✓ | 13789 ✓ |
| 16.73 end | 317 ✓ | 314 ✓ | 312 ✓ |
| 17.49 end | 265 ✓ | 264 ✓ | 264 ✓ |
| 22.31 end | 266 ✓ | 237 ✓ | 237 ✓ |
| 22.34 end (svidrigailov-3 availableAt) | 87 ✓ | 87 ✓ | 87 ✓ |
| firstMention (unchanged) | 2855 ✓ | 2530 ✓ | 2536 ✓ (staged card) |

  `candidateCoordinates` in PATCH.json matches the candidate column exactly. It also equals the modern-en coordinates in `PATCH-staged-01963b24.json`.
- **`old` values.** All four `replace` operations per patch match the baseline exactly: the subtitle "Dunya's former employer, with a dark reputation", and the full old body.
- **Declared-only change.** In both cards, the full structural diff shows exactly these six changes, and nothing else:
  - `…/svidrigailov/snapshots` ids go from `[1]` to `[1,2,3]`, in both editions;
  - `svidrigailov-1.subtitle` and `svidrigailov-1.body`, in both editions.
  Everything else is unchanged: other characters, mentions, paragraph hashes, firstMention, roleVisibleAt, snapshot-1 availableAt, evidence and editorialBasis, contentVersion and reviewStatus.
  Both baselines round-trip byte-for-byte under the stated serialization.
- **Names.** Each edition keeps one display name across all three snapshots: "Svidrigaïlov" in original-en and "Svidrigailov" in modern-en. They are unchanged.
- **Runtime validity** (both cards, both editions):
  - availableAt ascends strictly;
  - each availableAt lies within its paragraph and is not before firstMention;
  - svidrigailov-2 and svidrigailov-3 sit exactly at paragraph end;
  - every evidence point lies within its paragraph and is not after its snapshot's availableAt.
  - Each card's `paragraphHashes` match the text it is paired with: the live card ↔ `baseline-live-modern-en`, and the staged card ↔ `candidate`.
- **Staged patch.**
  - Its original-en operations are identical to PATCH.json.
  - Its modern-en wording, names and editorialBasis are identical.
  - Only modern-en availableAt and evidence differ, and they equal `candidateCoordinates`.
  - The staged card's original-en edition equals the live card's.
- **Simulation.** The result is the same for PATCH.json on (Garnett, live modern-en) and for the staged patch on (Garnett, candidate):

| Position | Garnett | live modern-en | candidate | Shown |
|---|---|---|---|---|
| firstMention − 1 | 3.38@2854 | @2529 | @2535 | no card |
| first mention | @2855 | @2530 | @2536 | svidrigailov-1 |
| end of 3.38 − 1 | @15514 | @13543 | @13788 | svidrigailov-1 |
| end of 3.38 | @15515 | @13544 | @13789 | svidrigailov-2 |
| 3.39 start | | | | svidrigailov-2 |
| 16.73 end, 17.49 end, 21.2 end, 22.2 end | | | | svidrigailov-2 |
| end of 22.34 − 1 | @86 | @86 | @86 | svidrigailov-2 |
| end of 22.34 | @87 | @87 | @87 | svidrigailov-3 |
| 22.35 start, 41.7 end | | | | svidrigailov-3 |

  For comparison, the baseline shows its single snapshot everywhere from the first mention onward.
- **Patched hashes.**
  - PATCH.json on the live card gives `9c50ea4c2edd372daed83c24db0b9e2c9914e5972d71923a0e5bc20562ff7205` ✓.
  - The staged patch on the staged card gives `4a840fffe7f4fdd83a90fee767900938661d7f1098d63437ad8627c3bbdf6bec` ✓.
  - Applying PATCH.json and then overlaying `candidateCoordinates` gives snapshots 2–3 identical to the staged result.

## 6. editorialBasis citations

- **svidrigailov-2.**
  - "The mother's letter, after the first mention, reveals as a surprise that he had hidden a passion for Dunya behind rudeness and drunken mockery and made her an open, shameless proposal": accurate for 3.38. The passion is "concealed … under a show of rudeness and contempt". The mockery and the drinking are adjacent, not literally one "drunken mockery", which is acceptable paraphrase.
  - "Released at the end of … 3.38": accurate.
- **svidrigailov-3.**
  - 16.73 (death): ✓.
  - 17.49 ("They say he beat her dreadfully", verbatim in all three texts), which also supports the subtitle: ✓.
  - 22.31–22.34 (the family learns he has come and is alarmed): ✓.
  - "the original first-encounter text without 'Wealthy'": ✓. It is the verbatim old body, with "Wealthy, unsettling, and" becoming "Unsettling and".
  - "the reader first meets him there at 20.68": **slightly imprecise**. He appears in person, unnamed, at **20.62** ("a man whom he had never seen stood in the doorway watching him intently"). He is identified at 20.68. See N1.
  - "the earliest point at which every clause is supported": ✓.

## 7. EVIDENCE.md

I checked all 51 quoted excerpts across 17 sections, in all three texts, with `tools/check_evidence_md.py`. Every one is a verbatim substring of the stated paragraph, and every stated `end` equals the recomputed paragraph length. The 3.38 first-mention excerpts end exactly at 2855, 2530 and 2536.

The prose glosses are accurate, with one qualification: N3.

## Notes and proposed fixes (all non-blocking)

- **N1. The editorialBasis citation, both editions, both patch files.** Replace "(the reader first meets him there at 20.68)" with "(the reader first sees him at 20.62 and learns his name at 20.68)". This is metadata only and does not change the reader-visible card.
- **N2. Continuity of identity (optional).** svidrigailov-2 and svidrigailov-3 drop "as a governess" from snapshot 1. The policy says a later reminder "must not lose the identity supplied at first encounter".
  - The subtitle keeps his identity ("Dunya's former employer"), so this is not a violation.
  - If the owner wants it kept, the exact wording would be:
    - svidrigailov-2 body: "Unsettling, he pursued Dunya while she worked as a governess in his household."
    - svidrigailov-3 body: "Unsettling and recently widowed, he pursued Dunya while she worked as a governess in his household and is rumored to be responsible for terrible things. His arrival in St. Petersburg alarms the whole Raskolnikov family."
  - Every clause stays supported at the same gates.
- **N3. EVIDENCE.md, "3.38 (reveal)".** "Unsettling" (his rudeness) is not staged as a surprise. It is stated in the same sentence as the name. It is still correctly gated to the end of 3.38 by the paragraph-end rule for non-identity characterization. Suggested gloss: "'pursued Dunya' is gated as a relationship revealed as a surprise; 'unsettling' is post-name characterization, released at paragraph end."
- **N4. README.md is stale.** It describes the earlier two-snapshot version: release of snapshot 2 at 22.34, "Wealthy" kept in snapshot 1, and patched sha `c641a049…`. Its "Open decisions" section says "Wealthy" is supported at 3.38. Update it to the three-snapshot design and the new hashes: PATCH.json `f8cc73ef…` → `9c50ea4c…`, and staged `cf4be5a3…` → `4a840fff…`. Also drop the "Wealthy is supported" claim.
- **N5. Release step (for Codex).** Neither patch touches `contentVersion`. As the README notes, bump the `characterReleases` revision in `characterCards.ts` when shipping, because card assets are immutably cached. This is outside the patch.
- **N6. Observation, pre-existing and out of scope.** The modern-en display name is "Svidrigailov", while the candidate text (and most chapters of live modern-en, e.g. 21.x and 22.x) spells it "Svidrigaïlov". The brief requires names to be unchanged, and they are.

## Files

- `review/v3/ACCEPTANCE.md`: this report.
- `review/v3/verify-output.txt`: full verification log (163 ok, 0 FAIL).
- `review/v3/patched-crime-and-punishment.v1.json`: PATCH.json applied to the live card (sha `9c50ea4c…`).
- `review/v3/patched-crime-and-punishment.v1.staged-01963b24.json`: the staged patch applied to the staged card (sha `4a840fff…`).
- `review/v3/tools/`: `texts.py`, `find.py`, `wealth_scan.py`, `verify.py`, `check_evidence_md.py`. All run offline and deterministically. Run `python3 review/v3/tools/verify.py`.
