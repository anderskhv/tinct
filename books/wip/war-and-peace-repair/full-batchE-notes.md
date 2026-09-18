# War and Peace — Batch E Fidelity Check (Chapters 104–125)

Close-read of all 20 chapters (source: Maude translation vs. current modern-en), paragraph by paragraph.

## Summary

- **Sound (no changes): 17 / 20** — 104, 105, 106, 109, 110, 112, 113, 114, 115, 117, 118, 119, 121, 122, 123, 124, 125
- **Defective (fixed): 3 / 20** — 111, 116, 120

## Paragraph-count verification (script-verified)

| Chapter | Source paragraphs | Corrected paragraphs | Match |
|---|---|---|---|
| 104 | 35 | 35 | ✅ |
| 105 | 43 | 43 | ✅ |
| 106 | 2 | 2 | ✅ |
| 109 | 10 | 10 | ✅ |
| 110 | 25 | 25 | ✅ |
| 111 | 41 | 41 | ✅ |
| 112 | 14 | 14 | ✅ |
| 113 | 20 | 20 | ✅ |
| 114 | 12 | 12 | ✅ |
| 115 | 9 | 9 | ✅ |
| 116 | 15 | 15 | ✅ |
| 117 | 20 | 20 | ✅ |
| 118 | 15 | 15 | ✅ |
| 119 | 43 | 43 | ✅ |
| 120 | 46 | 46 | ✅ |
| 121 | 20 | 20 | ✅ |
| 122 | 14 | 14 | ✅ |
| 123 | 14 | 14 | ✅ |
| 124 | 23 | 23 | ✅ |
| 125 | 6 | 6 | ✅ |

Verified with a script comparing `len(paragraphs)` per chapter number between `full-batchE-source.json` and `full-batchE-corrected.json`: all 20 chapters match exactly. No paragraph was merged, split, reordered, or dropped.

---

## Chapter-by-chapter findings

### Chapter 104 (Book Five, Ch. 20) — SOUND
Rostov's attempt to petition the Emperor for Denisov at Tilsit. Checked every paragraph against source; all content, dialogue, and sequence of events preserved faithfully. No changes.

### Chapter 105 (Book Five, Ch. 21) — SOUND
The Tilsit ceremony, Napoleon's decoration of Lazarev, Rostov's crisis of doubt. All content matches; no omissions, inventions, or distortions. No changes.

### Chapter 106 (Book Six, Ch. 22) — SOUND
Short two-paragraph chapter on the Napoleon–Alexander rapprochement. Matches source exactly in substance. No changes.

### Chapter 109 (Book Six, Ch. 3) — SOUND
Prince Andrew's return journey and the oak tree. Faithful throughout, including the "Princess Mary" naming (already correctly normalized in source translation). No changes.

### Chapter 110 (Book Six, Ch. 4) — SOUND
Prince Andrew's arrival in Petersburg and audience with Arakcheev. Content, the garbled memo text, and dialogue all match. No changes.

### Chapter 111 (Book Six, Ch. 5) — DEFECTIVE (fixed)

**Defect: omission of Speransky's specific role ("reporter to the Emperor").**

- Source: *"This was Speránski, Secretary of State, reporter to the Emperor and his companion at Erfurt, where he had more than once met and talked with Napoleon."*
- Candidate (before fix): *"This was Speransky, Secretary of State, the Emperor's constant companion and counselor at Erfurt, where he had met and talked with Napoleon on more than one occasion."*

The candidate dropped Speransky's specific office — "reporter to the Emperor" (the State Secretary's role of briefing/reporting directly to the Tsar) — and replaced it with an invented, vaguer characterization ("constant companion and counselor at Erfurt"), collapsing two distinct facts (his role as the Emperor's reporter, and his separate role as companion at Erfurt) into one blurred claim.

**Fix applied:** restored the distinct role:
> "This was Speransky, Secretary of State, the Emperor's reporter, and his companion at Erfurt, where he had met and talked with Napoleon more than once."

All other content in this chapter (the Montesquieu/French exchange, Kochubey's dinner, the old courtier's questions) was checked and is faithful. No other changes.

### Chapter 112 (Book Six, Ch. 6) — SOUND
Prince Andrew's growing admiration for and doubts about Speransky. Long analytical paragraphs all check out faithfully against source (the metaphysics-device passage, the mirror-gaze image, the Rosenkampf anecdote). No changes.

### Chapter 113 (Book Six, Ch. 7) — SOUND
Pierre's rise in the Petersburg Freemasons and his speech to the lodge. Checked the full speech text (four long paragraphs) against source — faithful, no dropped clauses. The Illuminati footnote direction ("substitute republican for monarchical institutions" → "replace monarchical institutions with republican ones") preserves the correct sense, not inverted. No changes.

### Chapter 114 (Book Six, Ch. 8) — SOUND
Pierre's depression, his wife's letter, and the two diary entries (Moscow 17th Nov / Petersburg 23rd Nov) about Joseph Alexeevich and the reconciliation with Hélène. Checked in full; faithful. No changes.

### Chapter 115 (Book Six, Ch. 9) — SOUND
Hélène's social ascendancy and Pierre's discomfort with Boris's presence in his wife's circle. Content matches (including the Napoleon "superb animal/creature" quote and footnotes). No changes.

### Chapter 116 (Book Six, Ch. 10) — DEFECTIVE (fixed)

**Defect: the 27th November diary entry was replaced with a duplicate of the 3rd December entry, dropping its real content.**

This is the most serious defect found in the batch. Pierre's diary contains dated entries; the candidate's paragraph for "27th November" is not a translation of the source's 27th‑November entry at all — it is instead a near-duplicate (in different wording) of the *3rd December* entry (the one about remembering Dolokhov's taunt and quarreling with Boris Drubetskoy). Confirmed by direct comparison: candidate paragraph 5 ("27th November" entry) and candidate paragraph 9 (the correctly-translated "3rd December" entry) both render the same source content — Dolokhov, the quarrel with Boris, "My God, I cannot get along with him," the voice saying "Your day!"

Meanwhile the actual 27th‑November entry in the source — a substantively different and important passage — was entirely dropped. It covers: Brother Urusov's visit and talk of the Emperor's new projects; Pierre catching himself criticizing the Emperor and reining himself in per his benefactor's teaching; being assigned the duty of Rhetor; the lodge's discussion of the seven pillars/sciences/virtues/vices/gifts of the Holy Spirit; and, most importantly, **the admission of Boris Drubetskoy into the lodge**, during which Pierre — alone with Boris in the dark initiation chamber — is seized by an unwanted feeling of hatred toward him and even the impulse to "stab his bare breast with the sword I held to it." This is a significant plot/characterization beat (Pierre's suppressed hostility toward Boris, later relevant to their strained relationship) that was completely missing from the candidate text.

**Fix applied:** replaced the erroneous duplicate with a proper modern-English rendering of the actual source 27th‑November entry (Brother Urusov, the Emperor's projects, the Rhetor duty, the seven-pillars discussion, and Boris's admission with Pierre's hatred/near-violent impulse). The correctly-placed 3rd‑December entry (candidate paragraph 9) was left untouched, since it already faithfully renders the source's Dec‑3 entry.

Rest of the chapter's diary entries (24th Nov, the undated Brother-V entry, the dog-pack dream, 7th Dec Joseph Alexeevich dream, 9th Dec dream) were checked and are faithful. No other changes.

### Chapter 117 (Book Six, Ch. 11) — SOUND
The Rostovs' finances, Berg's courtship of Vera, and the dowry negotiation. All figures (eighty thousand, twenty/thirty thousand rubles) and the sequence of Berg's bargaining match source exactly. No changes.

### Chapter 118 (Book Six, Ch. 12) — SOUND
Natasha and Boris's reunion in Petersburg. Faithful throughout, including Boris's calculation about marrying an heiress and his repeated, unresolved visits to the Rostovs. No changes.

### Chapter 119 (Book Six, Ch. 13) — SOUND
Natasha's late-night talk with her mother about Boris. Long dialogue-heavy chapter checked in full; faithful, including the color associations Natasha gives to Boris/Pierre/Nicholas. No changes.

### Chapter 120 (Book Six, Ch. 14) — DEFECTIVE (fixed)

**Defect: broken/non-standard word "grande" for "grandee" (placeholder-style text corruption).**

- Source: *"an old grandee of Catherine's day was giving a ball..."* / *"The grandee's well-known mansion on the English Quay glittered..."*
- Candidate (before fix): *"a grande of Catherine's era was hosting a ball..."* / *"The grande's famous mansion on the English Quay blazed..."*

"Grande" is not a standard English noun for a person of rank (it reads as a stray dropped letter from "grandee," or an accidental borrowing from Spanish/French). It occurs twice, both referring to the same host of the New Year's ball. Left as-is, it reads as a typo/broken word to an English reader.

**Fix applied:** restored "grandee" in both occurrences:
> "an old grandee of Catherine's era was hosting a ball..." / "The grandee's famous mansion on the English Quay blazed with countless lights."

Rest of the elaborate ball-preparation chapter (dresses, dowry-adjacent detail, Peronskaya) was checked and is faithful. No other changes.

### Chapter 121 (Book Six, Ch. 15) — SOUND
Natasha's entrance to the ball, Peronskaya's commentary on the guests (Hélène, Anatole Kuragin, Bolkonsky). Faithful, including the "he is all the rage" footnote. No changes.

### Chapter 122 (Book Six, Ch. 16) — SOUND
The Emperor's entrance, the polonaise, Natasha's anxiety about not being asked to dance, Hélène's waltz, and Pierre bringing Prince Andrew to Natasha. Checked the full long paragraphs; faithful. No changes.

### Chapter 123 (Book Six, Ch. 17) — SOUND
The waltz and cotillion, Prince Andrew's growing interest in Natasha, and Pierre's first pang of humiliation over Hélène's court status. Faithful throughout. No changes.

### Chapter 124 (Book Six, Ch. 18) — SOUND
Prince Andrew's disillusioning dinner at Speransky's — the anecdotes, the forced gaiety, Speransky's laugh. Checked the full chapter; content, sequence, and tone all faithful (including Stolypin's near-serious outburst and Magnitsky's recitation). No changes.

### Chapter 125 (Book Six, Ch. 19) — SOUND
Prince Andrew's visit to the Rostovs the following day, Natasha singing, and his sleepless night of renewed hope. Faithful throughout. No changes.

---

## Files

- Corrected output: `/home/user/tinct/books/wip/war-and-peace-repair/full-batchE-corrected.json`
- Source: `/home/user/tinct/books/wip/war-and-peace-repair/full-batchE-source.json`
- Original candidate: `/home/user/tinct/books/wip/war-and-peace-repair/full-batchE-current-modern-en.json`
