# Batch B — Modern English rendering notes (chapters 13–24)

## Verification (programmatic, not eyeball)

Ran a script comparing `bk-batchB-source.json` and `bk-batchB-modern-en.json`:

- 12/12 chapters present, same `number` values, same order.
- Paragraph counts match **exactly**, chapter by chapter:
  - 13: 55, 14: 14, 15: 6, 16: 47, 17: 33, 18: 72, 19: 32, 20: 41, 21: 81, 22: 81, 23: 88, 24: 43
  - Total: 593 paragraphs in source and in output.
- No empty paragraphs.
- Word-count ratio (output words / source words) per chapter ranges 0.98–1.03 — well above the 75% floor in the translation rules; nothing was condensed.
- `python3 -m json.tool` confirms valid JSON.

## Approach

This is a full paragraph-by-paragraph modern-English rendering of the Garnett translation, not a word-swap pass. Each source paragraph was rewritten sentence-by-sentence for contemporary clarity and natural rhythm while preserving every claim, beat of dialogue, digression, and piece of description. Distinct character registers were kept:

- **Fyodor Pavlovitch**: crude, buffoonish, mocking, drunk and rambling in ch. 21.
- **Dmitri (Mitya)**: passionate, volatile, prone to long confessional monologues (ch. 16–18) — kept the poetry recitations (Schiller) as verse, not folded into prose.
- **Ivan**: cold, ironic, intellectual.
- **Alyosha**: gentle, direct, often monosyllabic under stress.
- **Smerdyakov**: the theological hair-splitting monologues (ch. 20) were kept intact and in full — this is some of the most argumentatively dense material in the batch and nothing was trimmed.

## Judgment calls

1. **Name spelling**: kept Garnett's own forms throughout for consistency with the source batch — "Fyodor Pavlovitch," "Dmitri," "Ivan," "Alyosha/Alexey," "Katerina Ivanovna," "Grushenka," "Miusov" (dropped the diaeresis from "Miüsov" since modern English doesn't use it — rendered consistently as "Miusov" everywhere), "Paissy" (dropped diaeresis from "Païssy"), "Smerdyakov," "Grigory," "Marfa," "Agafya Ivanovna," "Kalganov," "Lizaveta," "Lise," "Mitya," "Katya."
2. **Poem stanzas** (Schiller's "Ode to Joy," rendered by Garnett as English verse in ch. 16): left as-is in verse form rather than modernized, since it's a translated quotation within the text, not Dostoevsky's/Garnett's own prose — modernizing Schiller-via-Garnett verse would misrepresent it as new prose. Paragraph breaks were kept exactly where Garnett breaks them (several stanzas and refrain lines are separate JSON paragraphs, sometimes splitting mid-thought — this was preserved paragraph-for-paragraph rather than reflowed, per the non-negotiable one-in/one-out rule).
3. **French/Latin phrases** (Miusov's "plus de noblesse que de sincérité," "Il y a du Piron là-dedans," "Credo, but I don't know in what," "Tout cela c'est de la cochonnerie"): kept in the original language, as the rules require preserving quotations and allusions; did not translate them into English since Dostoevsky/Garnett didn't either.
4. **"Aesop" as Dmitri's nickname for his father**: kept as-is (it's Dmitri's own recurring epithet for Fyodor Pavlovitch, tied to the "buffoon" theme established earlier in the book — not a translation artifact).
5. **Crude/theologically provocative content**: rendered faithfully, not softened — Fyodor Pavlovitch's stories about his dead wife, the graphic von Sohn murder anecdote, Smerdyakov's "sin" casuistry about renouncing Christianity under torture, and the Lizaveta rape backstory are all kept at full explicitness and length.
6. **"He sends his compliments"**: preserved as Dmitri's exact chosen phrase (repeated verbatim several times by different speakers), since the plot hinges on Katerina Ivanovna parsing that specific word choice.
7. Chapter 24's final line, "PART II", is a structural marker in the source (its own one-line "paragraph" ending Book III) — kept unchanged as its own paragraph rather than translated, since it isn't prose.

## Scope discipline

Only these two files were written:
- `/home/user/tinct/books/wip/brothers-karamazov-repair/bk-batchB-modern-en.json`
- `/home/user/tinct/books/wip/brothers-karamazov-repair/bk-batchB-notes.md`

No other files touched; nothing committed or pushed.
