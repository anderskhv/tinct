# b07 verification: chapters 21–23

## Coverage

- Chapter 21: 37 changed paragraphs checked
- Chapter 22: 28 changed paragraphs checked
- Chapter 23: 22 changed paragraphs checked
- Total: 87, which matches the `view.py changed 21 23` count. 83 are verified clean. 4 paragraphs have defects, with 5 corrections between them.
- Accessibility items screened: 14 (A.json indices 0–13)

I checked every restored ellipsis, stammer and repetition against the source at the same point. Each one is in the source, including "!..." and four-dot "...." where Garnett uses them. No hesitation was invented. The restored italics (_et nihil humanum_, _bonne guerre_, _Age_, _j'ai le vin mauvais_, _pour vous plaire_, _Madonna_, _should_/_will_, _whole_/_little_, _don't leave_) all match source spans. Names follow the Garnett forms. "Razsudkin" in 22.72 is Luzhin's deliberate misnaming from the source, and "Hay Market" is correct.

## Defects (all non-blocking)

1. **21.27**: "No, I'm only wondering that you're too adaptable." The sentence is ungrammatical, and "a man" from the source is still missing. The correction is "No, I'm only surprised that you're too adaptable a man." Source: "wondering at your being too adaptable a man".
2. **21.35** (flagged judgement call): "or progress, maybe, perhaps". The source says "or progress, indeed, maybe". It has one hedge, and "indeed" is an intensifier, not a second hedge. The doubled "maybe, perhaps" adds a stutter the source does not have. The correction is "or even progress, maybe".
3. **21.122**: "instead of traveling" becomes "instead of the journey". "Journey" is Svidrigaïlov's code word for suicide. 21.121 and the opening of this paragraph use it, so "traveling" breaks the echo. This wording was carried over from the baseline, inside a changed paragraph.
4. **23.0** (flagged judgement call): "smug foolishness" is a good rendering of "fatuity", and I keep it. The problem is "bordered on", kept from the baseline, which softens the source's "a conceit *to the point of* fatuity". The correction is "a conceit carried to the point of smug foolishness".
5. **23.0**: "all sorts of schemes" becomes "all sorts of devices" (source: "by all sorts of devices"). "Schemes" suggests dishonesty that the source leaves open.

`apply.py ... check --dry` on the defects: 5 applied, 0 rejected. The accepted and modified accessibility items also dry-run cleanly (8 applied, 0 rejected), and none of them overlaps a defect.

## Accessibility verdict summary

| # | Where | Verdict | Note |
|---|---|---|---|
| 0 | 21.10 | reject | The gloss is not in the source. He truncates the tag on purpose, and foreign phrases stay unglossed (b10 precedent). |
| 1 | 21.15 | reject | Added gloss (bonne guerre). |
| 2 | 21.35 | modify | New text: "restaurants like Dussaut's,". The source uses a generic plural. |
| 3 | 21.37 | accept | "thirty thousand in silver". |
| 4 | 21.39 | reject | Added gloss. "and I hate drinking" already carries the sense. |
| 5 | 21.49 | reject | Added gloss. |
| 6 | 21.68 | accept | "make one like this". |
| 7 | 22.37 | reject | The source has the same two flat sentences, and "though" imposes a reading. |
| 8 | 22.40 | reject | The source says "a foreigner". |
| 9 | 22.69 | accept | "you or him" matches Dounia's line. |
| 10 | 23.17 | modify | New text: "just to avoid borrowing from that man Luzhin until he offered help." This keeps her disdain. "himself" is dropped. |
| 11 | 23.26 | accept | Fixes the stacked dashes. |
| 12 | 23.33 | accept | The source says "your watch". |
| 13 | 23.40 | accept | "Oh, I really have to..." The source means necessity. |

Totals: 7 accept, 2 modify, 5 reject.

## Verdict

**CLEAN AFTER CORRECTIONS**. The 5 corrections are all non-blocking.
