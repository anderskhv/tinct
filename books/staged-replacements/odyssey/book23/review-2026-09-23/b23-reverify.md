# Odyssey Book 23 — independent re-verification (v1 → v2)

**Verdict: VERIFIED CLEAN**

## Replay
- candidate-v2.json sha256 = 024f1358258e262095bc9123dabdd4c8d2a554b78587eafbba90cb231843dcee (matches).
- All 19 edits from b23-v1-edits.json applied in order to candidate-v1; every `old` present exactly once in its paragraph at time of application.
- Result byte-identical to candidate-v2 paragraphs (29/29). `number` and `title` unchanged. Changed paragraphs: 0, 1, 2, 4, 5, 10, 11, 15, 16, 17, 22, 24, 26 — exactly the edited set.

## Per-paragraph checks (v2 vs Butler)
Curly quote counts (“ / ”) match source in every changed paragraph; extra ’ are contractions only. No spaced dashes, no new colons/semicolons/dashes replacing Butler commas, American spelling throughout.

- ¶0 "Her old knees became young again" — restores Butler's "became"; fine.
- ¶1 "for you always used to be a reasonable person" — verbatim Butler sense. Reordered question ("Why are you mocking me, talking such nonsense and waking me … and closed them, when I already have enough troubles?") keeps every element of Butler's clause, reads cleanly aloud; the trailing "when" clause is unambiguous.
- ¶2 "It's quite true, as I tell you, that Odysseus has come home again." — faithful.
- ¶4 "and don't know." / "You would have enjoyed it if you could have seen him" / "so come with me, and you can both be happy together after all, for now at last your heart's desire has been fulfilled" — all faithful ("after all", "at last" restored; causal "for" kept); grammatical.
- ¶5 "It is some god" (Butler's certainty restored); "wrongdoing" for "iniquity" — accurate, not softened.
- ¶10 "come to understand one another better in time" — "in time" = "by and by"; faithful.
- ¶11 "When one man has killed another, even if the dead man would leave few friends to take up his quarrel, the killer must still say goodbye…" — Butler's "he was not one who would leave many friends" refers to the slain man; "the dead man" makes that explicit and correct; "few" = "not many"; "the killer" = "the man who has killed him". Commas replace Butler's parenthetical dashes (allowed; not replacing a Butler comma). Sentence continues cleanly into "But we have been killing…". Blocking issue resolved.
- ¶15 "The upper servant Eurynome" — Butler's term; matches book10 accepted usage.
- ¶16 "put on airs, nor to belittle you" — "set myself up" = affect superiority; "put on airs" is accurate; "belittle" = "depreciate". Fine.
- ¶17 "marvelous piece of work" — acceptable for Butler's "marvellous curiosity" (a wondrous made thing), no loss. "made the trunk the center post of my bed" — correct referent: Butler's "it" is the stump (v2 "left the trunk standing") dressed into the bed-prop, then bored and made the centre-post; "the trunk" names that same object. "I worked at it until I had finished it, inlaying it with gold and silver." — split from Butler's "at which I worked till…"; the object of work is the bed, as in Butler, whose own "it" is equally general; not a new ambiguity worth flagging.
- ¶22 "He gave me this sure sign, which…" — matches book11 ¶8 accepted "sure sign".
- ¶24 "So they talked." — plain equivalent of "Thus did they converse"; fine.
- ¶26 "sun-god" — Butler's form; majority convention in accepted books (book12 ×7, book19 ×2). "so that all his men perished together, and he alone was left alive." — faithful, grammatical, closes the sentence cleanly before "He told how at last…".

## Defects
None. b23-reverify.json is `[]`.
