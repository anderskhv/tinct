# Book 21 re-verification (candidate-v1 → candidate-v2)

**Verdict: DEFECTS FOUND** (2 non-blocking; 0 blocking). Findings: `b21-reverify.json`.

## 1. Replay
- candidate-v2.json sha256 af7ffcdb66abe3d93aa4416b76b8945b0709da06d2aa7f835e6a98d384f6d3ec (matches).
- All 17 edits applied to candidate-v1: each `old` exact and unique. Result == candidate-v2 paragraph-for-paragraph; number/title unchanged; no other differences.

## 2. Changed paragraphs against Butler (with neighbours)
- ¶0 maids / “though Iphitus was his guest”: faithful. The name resolves the pronouns in that clause. But the next sentence's bare “He feared neither…” now points first to Iphitus, reads “feared neither … nor respected” (faulty parallelism), and has lost Butler's “for”. Non-blocking fix in the JSON.
- ¶1 maids: correct (“maidens”; “a maid on either side” is Butler's own).
- ¶9 “hands the wine around”: faithful (“handing round the wine”).
- ¶10 “sacrificial priest”, “weak”, “Someone among us … he”: faithful; the antecedent now works.
- ¶13/¶14 “lard”: Butler's word; the repetition is kept.
- ¶20 “Let this also be our signal; the suitors…”: Butler's semicolon and “moreover” are restored; faithful.
- ¶26 “Lapithae”: Butler's spelling; the name appears in no other Book's candidate.
- ¶27 “the mighty bow of Odysseus”: matches Butler and ¶2.
- ¶31: the first sentence is byte-identical to accepted B01-P026 (book01/candidate-v4 ¶25), “She went back into the house in wonder, and kept her son’s words in her heart.”, as GLOSSARY line 504 requires. The rest is faithful (“handmaids”, Athena, sleep).
- ¶32 “boarhounds”: Butler's word.
- ¶33 “better man” / “as I am stronger than you”: Butler's better/stronger contrast is restored; the second “stronger” is a legitimate aloud repair.
- ¶39 arrow sequence: every element is present (arrow from the table, laid on the grip, the rest in the quiver, “the Achaeans … taste”). The action reads as one movement and is easy to picture. Two problems:
  - The semicolon is added; Butler uses dashes.
  - Butler's causal “for” (why the arrow came from the table) is gone. Voice and form requires cause to survive a restructure.

  The semicolon is readable but unnecessary. Book 7 precedent (M-6) turns added semicolons into periods. Fix: “; the rest” → “, for the rest”. This restores Butler's word, needs no semicolon, and keeps the action uninterrupted.
- Grammar and punctuation in the changed text: curly quotes throughout; no straight quotes, spaced dashes or double spaces anywhere in v2. No changed sentence is longer than Butler's.

## 3. Structure
42 paragraphs (source 42), none empty, order and indices aligned.

---

# Re-verification of candidate-v3 (v2 + the two findings above)

**Verdict: VERIFIED CLEAN**

- candidate-v3.json sha256 32251019456dd6b6d73dd945d4229200b31a620e819feda0d970b319636b87dc.
- Applying the two findings in b21-reverify.json to v2 gives exactly v3. Only ¶0 and ¶39 differ from v2; number, title and keys are unchanged.
- ¶0: "…though Iphitus was his guest, for Heracles neither feared heaven’s vengeance nor respected his own table that he had set before Iphitus, but killed him despite everything and kept the mares for himself."
  - This follows Butler: "though he was his guest, for he feared not heaven’s vengeance, nor yet respected his own table…".
  - Butler's "for" is back, the pronouns are clear, and the parallelism is correct.
  - The sentence covers the same span as Butler's and is no longer than it. The following sentence ("It was while claiming these mares…") still reads correctly.
- ¶39: "He took an arrow that was lying on the table and laid it on the center grip of the bow, for the rest, which the Achaeans would soon taste, were all inside the quiver."
  - Butler's "for", "Achaeans" and "taste" are kept, and no semicolon was added.
  - The action reads as one movement and is easy to follow aloud. It flows correctly from ¶38 (Zeus's omen) into the shot and on into ¶40.
- Structure: 42 paragraphs (the source has 42), none empty, same order and indices as the source.
