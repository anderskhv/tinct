# To the Lighthouse — Tinct Modern E editorial brief

Applies to `to-the-lighthouse-modern-en`. Source and fidelity anchor: `editions/to-the-lighthouse-original-en.json` (Woolf, 1927 Hogarth Press text via Standard Ebooks; see `SOURCE.md`). Rules follow `books/AGENTS.md` → Modern English and `books/README.md` → Edition selection.

## Reader and purpose

A first-time adult reader, and a listener hearing the text narrated aloud. Tinct Modern E is the **default primary** edition; Woolf's original is the default Compare edition beside it. The modern edition must let a reader follow *who is thinking what, and where we are*, without losing what makes the book Woolf's: the drift of consciousness, images, rhythm, repetition and deliberate uncertainty.

## Structure (non-negotiable)

- 42 sections in three parts: The Window (1–19), Time Passes (20–29), The Lighthouse (30–42). 495 paragraphs.
- Exactly one output paragraph per source paragraph, same order. Never merge, split, drop, reorder or invent paragraphs.
- Paragraph N begins with content equivalent to source paragraph N's opening.

## What to change

- **Syntax.** Woolf's long, suspended sentences may be broken into several sentences, and embedded clauses brought forward, so each step can be followed on one reading or hearing. Keep the order of thoughts and images.
- **Referents.** Where a pronoun's antecedent is merely hard to track syntactically, name the person ("Mrs. Ramsay", "Lily", "James"). Where the source is *deliberately* uncertain — whose perception this is, whether something is said or only thought, what a feeling means — keep the uncertainty.
- **Vocabulary and idiom.** Replace dated or class-marked words where a present-day reader would stumble (e.g. "shan't" → "won't", "bade", "tiresome", "odious", "by way of being") with plain contemporary equivalents of the same register and force. The generic "one" may become "you" in narration when it is truly generic; keep it where it marks a character's voice in dialogue.
- **Spelling.** American spelling (color, honor, gray), consistent with other Tinct modern editions. Keep "Mr." / "Mrs." with periods.
- **Brief glosses** only where the reference would otherwise block understanding, woven into narration (not into dialogue) and kept short and accurate: e.g. the Army and Navy Stores catalogue, Balliol (an Oxford college), the Reform Bill, the Grisons (in Switzerland), "Someone had blundered" (Tennyson's "The Charge of the Light Brigade"), Cowper's "The Castaway". Do not gloss on every mention.

## What to preserve

- Every image, object, detail, action, name, number, quotation and allusion. No condensing. Output should normally be at least 75% of the source paragraph's word count; most paragraphs land at 90–115%.
- **Free indirect discourse**: keep thoughts in the characters' idiom and in the third person where Woolf does; do not convert into "she thought that…" reports everywhere, and do not add explanations of what a moment "means".
- **Motifs and refrains** (keep recognizable wherever they recur): "if it's fine tomorrow" / "it won't be fine"; "Someone had blundered"; "We perished, each alone"; "Women can't paint, women can't write"; "Life stand still here"; "the fisherman's wife"; "the thing is made that remains forever after"; "I have had my vision"; the three strokes of the Lighthouse beam; "the long steady stroke"; "the Lighthouse" (capital L).
- **Quoted verse** — Tennyson, Cowper, Shakespeare's Sonnet 98, Browne's "Steer, hither steer", "Luriana Lurilee", the Grimm tale's rhyme, "Damn your eyes": keep the verse lines **verbatim** with their line breaks (`\n`); they are quotations. Modernize the prose around them.
- The **square-bracketed** paragraphs in Time Passes stay bracketed and stay as flat, factual reports. Parentheses stay parentheses where they mark an aside or a shift of speaker.
- Italic emphasis marked `_like this_` keeps its underscores around the corresponding word(s).
- Dialogue: modernize lightly so it sounds natural now, keep who says what, the tone (curt, teasing, formal) and the speech tags. Very short lines ("Yes," "No") may stay as they are.
- Punctuation style: curly quotes “ ” ‘ ’, em dashes —, ellipsis …, as in the source.
- The ending: "I have had my vision." stays word for word.

## Not allowed

- Summaries, bulk regex, word-swap or spelling-only passes, or copying whole long source sentences unchanged. Long paragraphs (80+ characters) must be genuinely rendered.
- Resolving the book's ambiguities, adding interpretation, softening Mr. Ramsay's harshness or Mrs. Ramsay's contradictions, modern slang, or anachronisms.

## Mechanical gate

Every batch must pass `books/classify-modern-en.py` criteria (weighted similarity ≤ 0.75, no LIGHT/MECHANICAL chapters, ≤ 5% identical long paragraphs, no wrapped scaffolding, no ellipsis truncation). The gate is necessary, not sufficient: fidelity and readability reviews decide acceptance.

## Calibration sample (lead-authored; shows the target register)

Source 1.1 (opening): *To her son these words conveyed an extraordinary joy, as if it were settled the expedition were bound to take place, and the wonder to which he had looked forward, for years and years it seemed, was, after a night's darkness and a day's sail, within touch. …*

Modern: “To her son these words brought an extraordinary joy. It was as if the trip were settled and bound to happen, as if the wonder he had looked forward to for years and years, it seemed, were now within reach, after just one night of darkness and one day's sail. He belonged, even at the age of six, to that great clan who cannot keep one feeling separate from another, but must let their hopes for the future, with all its joys and sorrows, cloud what is actually in front of them. For people like this, even in earliest childhood, any turn of the wheel of sensation can crystallize and fix the moment on which its gloom or radiance falls. So James Ramsay, sitting on the floor cutting pictures out of the illustrated catalogue of the Army and Navy Stores, a London department store, gave the picture of a refrigerator a heavenly bliss as his mother spoke. It was fringed with joy. …”

Source 1.2: *“But,” said his father, stopping in front of the drawing-room window, “it won't be fine.”*
Modern: *“But,” said his father, stopping in front of the drawing-room window, “it won't be fine.”* — a short, iconic line: unchanged.

Source 1.7: *She turned with severity upon Nancy. He had not chased them, she said. He had been asked.*
Modern: *She turned sternly on Nancy. He had not chased them, she said. He had been invited.*
