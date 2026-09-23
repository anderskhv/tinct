# b02 — Verifier (source-based), chapters 7–9

## Coverage
- `view.py changed 7 9` reports 71 changed paragraphs. All 71 were checked against the source and baseline:
  - Ch 7: 20
  - Ch 8: 36
  - Ch 9: 15
- Results: 68 verified clean and 3 non-blocking defects.
- The P0-names normalizations were confirmed (Petrovitch, Fomitch, Razumihin, Heruvimov, Tchebarov, Ekaterininsky, Vassilyevsky, Alexandr Grigorievitch).
- 8.120: removing the duplicate was confirmed. Source 8.121 (the contemptuous glance and the list of scandals) is fully rendered in candidate 8.121, and 8.120 now matches its source.
- Accessibility items screened: 13 of 13.

## Defects
All three are non-blocking and minimal. Each is a small grammar slip left by an otherwise correct fidelity repair.
1. **7.6:** "he thought he would have run away from her" follows "if she kept staring". Change to "he thought he would run away from her". This keeps the hedge and fixes the tense.
2. **7.23:** "it must be for some kind of strongbox, and that perhaps everything was hidden there" has a dangling "that". Drop "that". This folds in accessibility item 0.
3. **8.83:** "said a couple of words in French with a foreigner". Use "to a foreigner", as the source does.

`apply.py ... check --dry`:
- Defects: applied 3, rejected 0.
- Accepted and modified accessibility items: applied 11, rejected 0. None overlap a defect.

## Accessibility verdict summary
- **Accept (9):**
  - 1: Gambrinus's tavern
  - 2: odd (the source has "queer")
  - 4: both sexes (source wording)
  - 5: without the slightest interest (source wording)
  - 6: the gentleman (the source's "his honour" is her honorific for the writer)
  - 7: in front of Ilya Petrovitch (the source has "before")
  - 8: Raskolnikov came to
  - 9: "to throw it all in the water" (grounded in 9.3 and 9.12)
  - 12: Radishchev gloss. Checked for accuracy: A. N. Radishchev (1749–1802), author of *A Journey from St. Petersburg to Moscow* (1790), was condemned and then exiled to Siberia, and is the standard "first Russian radical". He was himself a Rousseau admirer, which is what makes "Rousseau was a kind of Radishchev" backwards and comic. "Our Russian radical" is accurate.
- **Modify (2):**
  - 3 → "That fellow's been on a spree!" The source's "he has been going it" means drinking: he is taken for a drunk. "Hard at it" suggests work.
  - 10 → "Why, I've come to Razumihin's without meaning to!" The source makes an exclamatory assertion ("why, I have not come ... of my own accord!"), and his doubt only follows it.
- **Reject (2):**
  - 0: folded into the 7.23 defect.
  - 11: "the day _after it_". Garnett's bare italic "_after_" is a deliberate veiled reference. Adding "it" interprets the veil and moves the stress.
- Not flagged by A and deliberately left alone: the time discrepancies in 8.55, 8.92 and 8.27. 8.92 now correctly reads "now it's twelve", as the source does.

## Verdict
**CLEAN AFTER CORRECTIONS** (3 non-blocking syntax corrections).
