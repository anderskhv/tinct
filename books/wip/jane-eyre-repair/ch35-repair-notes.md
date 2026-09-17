# Jane Eyre — Chapter 35 — Modern English Repair Notes

## Defect

**Paragraph index: 83 (0-based array index), i.e. the 84th paragraph in the chapter.**
(The diagnostic audit's "paragraph 83" reference used 0-based indexing, consistent
with this index.)

### Source (ground truth, `ch35-source.json`, paragraph 83)

> "...I felt veneration for St. John—veneration so strong that its impetus
> thrust me at once to the point I had so long shunned. I was tempted to
> cease struggling with him—to rush down the torrent of his will into the
> gulf of his existence, and there lose my own. I was almost as hard beset
> by him now as I had been once before, in a different way, by another. I
> was a fool both times. To have yielded then would have been an error of
> principle; to have yielded now would have been an error of judgment. So I
> think at this hour, when I look back to the crisis through the quiet
> medium of time: I was unconscious of folly at the instant."

Jane is genuinely tempted to surrender her will to St. John's — torn between
two different failures (yielding to Rochester earlier would have been a
moral/principled error — bigamy; yielding to St. John now would be an error
of judgment). She is self-critical, conflicted, and explicitly says she was
"a fool both times." This is the psychological crux of the chapter.

### Defect in `ch35-current-modern-en.json` (paragraph 83)

The paragraph's first two-thirds (the setup about St. John's hand on her
head, the "guardian angel" comparison, "moments of mastery") was rendered
faithfully. But the final sentences — the actual temptation passage — were
**replaced with invented text asserting the opposite**:

> "I felt reverence for St. John. I felt his power. But the power was not
> mine to submit to. I would follow him to the ends of the earth. I would
> not give him my hand."

This is a **meaning inversion**: it turns Jane's admitted temptation to yield
into confident, resolved refusal. It also directly contradicts the very next
paragraph (paragraph 84, untouched, already correct), which reads: "My
refusals were forgotten—my fears overcome—my resistance paralyzed. The
impossible—my marriage to St. John—was rapidly becoming possible." A reader
hit a hard contradiction: firm refusal in one paragraph, inexplicable
capitulation in the next, with no bridge.

## Fix

Re-rendered the paragraph's final sentences faithfully from source, restoring:
- The temptation itself ("tempted to stop struggling... swept down the
  torrent of his will into the gulf of his existence, and lose my own
  there").
- The parallel to the earlier crisis with Rochester ("almost as hard
  pressed... by someone else").
- The self-critical "I was a fool both times."
- The two distinct categories of error (principle vs. judgment) — preserved
  exactly, not merged or flattened.
- The retrospective framing ("So I think at this hour, looking back...")
  and the closing admission that she was unaware of her own folly "at the
  moment."

Kept the already-sound modernized opening of the paragraph (St. John's hand
on her head, the guardian-angel simile, "moments of mastery") unchanged in
spirit and phrasing style, since that portion was not defective.

Full corrected paragraph 83 (0-based) now reads:

> "He laid his hand on my head as he spoke these last words. He had spoken
> earnestly, gently. His look was not that of a lover gazing at his beloved,
> but that of a pastor calling back his wandering sheep—or better, a
> guardian angel watching over the soul in his care. All men of talent,
> whether they feel deeply or not—whether they are zealots, aspirants, or
> despots—if only they are sincere—have their moments of mastery, when they
> command and rule. I felt reverence for St. John—reverence so strong that
> its force drove me at once toward the point I had so long avoided. I was
> tempted to stop struggling with him—to be swept down the torrent of his
> will into the gulf of his existence, and lose my own there. I was almost
> as hard pressed by him now as I had once been, in a different way, by
> someone else. I was a fool both times. To have yielded then would have
> been an error of principle; to yield now would be an error of judgment.
> So I think at this hour, looking back on the crisis through the calm
> distance of time. At the moment, I was unaware of my own folly."

## Verification

- Diffed `ch35-corrected.json` against `ch35-current-modern-en.json`
  programmatically (script-based paragraph-by-paragraph comparison).
- **Exactly one paragraph changed: index 83 (0-based), the 84th
  paragraph.** All other 97 paragraphs are byte-identical to
  `ch35-current-modern-en.json`.
- Paragraph count confirmed at 98 in both source and corrected files.
- Output JSON validated with `python3 -m json.tool`.
- Read the corrected paragraph 83 together with the untouched paragraph 84
  ("My refusals were forgotten—my fears overcome—my resistance
  paralyzed...") — the sequence now reads as a coherent psychological
  collapse: reverence → temptation to yield → self-critical framing ("I was
  a fool both times") → paralysis of resistance → the impossible marriage
  becoming possible. The prior hard contradiction (confident refusal
  immediately followed by unexplained capitulation) is resolved.

## Files

- Corrected chapter: `/home/user/tinct/books/wip/jane-eyre-repair/ch35-corrected.json`
- This note: `/home/user/tinct/books/wip/jane-eyre-repair/ch35-repair-notes.md`
