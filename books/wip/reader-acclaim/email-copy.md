# "Your next book" email: copy and rules

Content for the lifecycle email that suggests a next book. The email code reads `pairings.json` and `cards.json`; this file holds the template and the voice rules. Content only; no code lives here.

## When it is sent

- After a reader finishes a book (the *finished* opening), or
- after two "Continue where you left off" emails for the same book went unanswered (the *stalled* opening).
- Never to someone who read in the last 48 hours, and at most one lifecycle email every 3 days.

## Template

**From:** Anders at Tinct
**Subject:** `pairing.subject`. It must match the card actually used as the lead. If the lead card is not verified and the email falls back to the classic quote, use `{Classic person} on {Target}: "{short fragment}"`.
**Preheader:** the target book's hook (library introduction `hook.text`).

> *Finished opening:* You finished *{Source}*.
> *Stalled opening:* Not every book suits every moment. If *{Source}* has stalled, this one may be the better fit for now.
>
> ## {Target title}
> {Author}
>
> "{lead card quote}"
> **{lead card person}**, {short context, e.g. "The Tim Ferriss Show, 2015"}
>
> {pairing.reason}
>
> *{Target hook}*
>
> "{classic acclaim quote}" (**{classic source}**, {classic context})
>
> **[Start reading]** → opens the target at chapter 1 in the reader's default edition
>
> *Why we suggest this: {label} {person}. Their words are about the book, not about Tinct.*

## Card presentation rules

- Put the label before the name, exactly as in `cards.json`: "Recommended by", "Rated highly by", "Read by", "Discussed by" or "Kept by".
- Quote exactly. Never shorten a quote without an ellipsis, and never paraphrase inside quotation marks.
- Every `qualification` in `cards.json` is binding. For example: del Toro is "on his Frankenstein film"; Plutarch reports Alexander; Darwin's "Formerly" stays in; Collison's line is a bookshelf rating.
- `use: "listen-only"` (the Musk Iliad card) may appear only next to a Listen button or in narration promotion, never as the lead of a general email.
- No photos, portraits or likenesses of the people quoted. Show the book's own library art only.
- Nothing may imply that the person uses, knows or recommends Tinct or its Modern E edition.

## Voice rules (from the Book Onboarding v2 calibration)

- Declarative and book-focused. Use "deals with", "asks", "follows".
- No aphorisms, no first-person-plural commentary, no parallel-rhythm sentences.
- No spoilers beyond the target book's opening premise. The source book may be referred to freely, since the reader finished it.

## Example, rendered

**Subject:** Helen Keller: "the Iliad made Greece my paradise"
**Preheader:** What is your anger worth to you?

> You finished *The Odyssey*.
>
> ## The Iliad
> Homer
>
> "It was the Iliad that made Greece my paradise."
> **Helen Keller**, *The Story of My Life*, 1903
>
> The Iliad covers a few weeks in the war that the Odyssey looks back on. It follows the anger of Achilles and what that anger costs both armies.
>
> *What is your anger worth to you?*
>
> "The true hero, the true subject, the center of the Iliad is force." (**Simone Weil**, *The Iliad, or the Poem of Force*, 1939)
>
> **[Start reading]**
