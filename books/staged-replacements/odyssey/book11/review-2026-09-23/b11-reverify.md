# Book 11 v2 / Book 10 v4: independent re-verification (2026-09-23)

## A) Book 11: candidate-v1 → candidate-v2. **DEFECTS FOUND** (1 blocking, 3 non-blocking)

**Replay.** candidate-v2.json sha256 is `1f9320759bb3db21c40f6cf874f70d8b3e5a473ef30d8941d73d0ede405ee443`. I applied all 31 edits in b11-v1-edits.json to v1 in order. Every `old` string was exact and unique at the time it was applied. The result equals v2's `paragraphs` exactly, and `number`, `title` and the keys are unchanged. Twenty paragraphs changed (0, 1, 2, 3, 8, 11, 13, 17, 19, 21, 23, 25, 29, 32, 35, 36, 39, 42, 46, 53). Nothing outside the edits changed.

**Structure.** There are 54 paragraphs, the same as the source, and none is empty. The file has no straight quotes and no spaced or en dashes. Names in the whole of v2: Teiresias 0 and Tiresias 7; Pollux 0 and Polydeuces 1; no Roman forms remain. Other checks: "mixing-bowl" 1, "cloister" 0, "gallery" 2, "With that" 0.

**Quotation structure.** ¶7 opens “‘You want to know and stays unclosed at the paragraph break, as in Butler. ¶8 now opens “‘When you get home and closes with …will come true.’ as in Butler (D12 removes the bracket but keeps the mark). ¶9 opens “‘This must be. This is correct.

**Fidelity.** Every changed paragraph was read in full against Butler with its neighbours. Edits 0–22 are faithful and each restores Butler's wording: bless you, crossed in love, Polydeuces, At this, gallery/mixing-bowl, gorgeous banquet, would have, whom I longed to see, wept, screaming, too, handsome, on and on, Zeus himself, twins, carrying off, haunted, at their longest, the aged hero Echeneus. The accessibility edits for ¶0, ¶8 (ships/oars), ¶13, ¶35 ("my wife, Clytemnestra"), ¶39 and the split of the horse sentence in ¶42 are accurate and read aloud well.

**The ¶42 Eurypylus gloss.** The content is accurate and not interpretive. Homer's "γυναίων εἵνεκα δώρων" is traditionally explained this way: Priam bribed Eurypylus's mother Astyoche, with a golden vine, to send him to Troy. The gloss is brief and adds no interpretation. **Defect (blocking, reference):** the adjusted wording replaced v1's "around Eurypylus" with "around him". In this paragraph "he/him" has meant Neoptolemus throughout, and Odysseus has just said he brought Neoptolemus from Scyros to the war. A listener can therefore take "his mother, bribed with gifts to send him to the war" to mean Neoptolemus's mother. The wording also repeats itself ("took bribes … bribed"). The fix restores the name. See the JSON.

**Non-blocking:**
- ¶3: edit 24 turned Butler's "Now I beseech" into "So I beg you" directly after "…so my soul came down…", which gives a "so … So" echo aloud. Restore "Now".
- ¶11 and ¶53: "At this, Tiresias’s…" and "At this, Heracles…" add a comma. In the accepted Books, sentential "At this" takes no comma 16 times out of 17. In ¶53 the same paragraph also has "At this I hurried" with no comma.

**Observations, not defects:**
- ¶13: "and everyone invites him out as well" now gives the invitations as an extra fact instead of Butler's reason ("considering … and how every one invites him"). The sense is kept, so this is acceptable.
- ¶29: "Echeneus spoke, one of the oldest men among them:" leaves the appositive after the verb. It is grammatical, so this is a style preference.
- ¶9, unchanged since v1 and not part of this change set: it reduces Butler's deliberate "tell me and tell me and tell me true" to "tell me truly".

## B) Book 10: candidate-v3 (accepted) → candidate-v4. **VERIFIED CLEAN**

candidate-v3.json and candidate-accepted.json are identical, both sha256 `529e49dd…a151`. candidate-v4.json has sha256 `49cd316c…7935`. Replacing every "Teiresias" with "Tiresias" in v3's raw bytes gives a file byte-identical to v4. There are exactly 4 replacements, at ¶40, ¶43, ¶44 and ¶47. `number`, `title` and the paragraph count (49) are unchanged. The Cast (odyssey-threads.json, characters[21]) has the English display name "Tiresias", so D8 applies.

Findings JSON: b11-reverify.json (4 entries, and every `old` string was checked to be exact and unique in v2).

## A2) Book 11: candidate-v2 → candidate-v3. **VERIFIED CLEAN**

**Replay.** candidate-v3.json sha256 is `ab36f39b519dcc5ff8bfb122b0fcf122731ca68ffaa9a3004d94edb5c6651d96`. I applied the 4 findings in b11-reverify.json to v2. The result equals v3's `paragraphs` exactly. `number`, `title` and the keys are unchanged, and the file layout is the same as v2's. Only ¶3, ¶11, ¶42 and ¶53 changed.

**Structure.** 54 paragraphs, none empty. The file has no straight quotes and no spaced dashes. "At this," appears 0 times and "Teiresias" 0 times.

**Reading against Butler.**
- ¶3 now reads "Now I beg you", which follows Butler's "And now I beseech you". The "so … So" echo is gone.
- ¶11 and ¶53 now read "At this Tiresias’s…", "At this Heracles…" and "At this I hurried", consistent with the accepted Books.
- ¶42 now reads "fell around Eurypylus, all because of a woman’s bribes: his mother had been bribed with gifts to send him to the war." Every "his" and "him" in that sentence now refers to Eurypylus, the gloss is accurate and brief, and it follows Butler's "by reason of a woman's bribes". The next sentence ("Moreover … I never once saw him turn pale") returns cleanly to Neoptolemus, the subject of the paragraph as a whole.
- The neighbouring paragraphs (¶2/¶4, ¶10/¶12, ¶41/¶43 and ¶52) did not change, and the joins with them read correctly.

No defects.
