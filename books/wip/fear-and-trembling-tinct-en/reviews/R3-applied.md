# R3 applied: whole-book consistency

Lead editor. The source is `reviews/R3-consistency.md`. All **34 edits** from its table were applied mechanically: each old string was asserted to occur exactly once in its paragraph. The F1 typographic-quote conversion was then run on P-ch5 and P-ch6. Pre-edit copies are in `drafts/history/*.r4pre-R3.json`, and the diffs are in `reviews/R3-diff-*.md`.

## Accepted rulings

- **F4 *Spidse*:** "extreme point" throughout (ch4 ¶13, ch5 ¶19). §C is amended to match.
- **F5:** the pilot's repeated glosses of spiritual trial (ch5 ¶0), incommensurable (ch5 ¶2) and mediation (ch5 ¶4) are removed. The first-use glosses in ch4 and n4.22a stand. §C is amended to match.
- **F6–F9:** the *en Enkelt*, *fatte*/*gribe*, *tør* and *pine* rulings are now applied in the pilot and in parts D and I.
- **F2, F3, F12–F14, F16:** repeated passages and refrains are harmonized. These are Genesis 22:2, "go further" and "stop there", "God's chosen one", "chop the firewood", "the only marvel", "what is great", the closing formula "or else", "by virtue of", "in turn the divine", "the beloved son of ethics", "renounce", "terrible" and "sacrifice".
- **F10:** "in real life" for the idiom *i Virkeligheden* (ch7 ¶22).
- **F11:** the verse bracket goes on its own line in ch7 ¶46, as in ¶29.
- **F15:** generic *man* is rendered "one" in ch4 ¶15–16.
- **F17:** US spelling for "afterward", "unrivaled" and "compendia".

## Checks after applying

- `assemble.py`: PASS. That covers 184 paragraphs, 18 notes and every anchor.
- Book-wide quote check: every paragraph's double quotes balance. The only straight apostrophes left are the German elisions in the Shakespeare quotations (ch7 ¶29 *dreh'nden*, *hink'*; ¶46 *kniet'*), which the source prints.
- Independent re-verification: `reviews/R3-reverify.md`.
