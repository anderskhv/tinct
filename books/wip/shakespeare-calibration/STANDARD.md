# Tinct Modern English for Shakespeare: proposed standard

**Status:** proposed. Not yet adopted house-wide.

- It was established on Othello (`books/wip/othello-modern-en-acceptance/`) and tested on nine calibration passages from King Lear, Twelfth Night and The Merchant of Venice (this folder).
- It governs **future** replacements. It does not by itself authorize re-rendering any live play.

## Target

A first-time **listener** understands what each speaker means and wants, while imagery, dramatic voice, qualifications and deliberate ambiguity survive.

Tinct narrates the text aloud, so every sentence must be speakable and clear on one hearing.

## Rules

### 1. Faithful and complete

Carry every clause, image, argument, oath, joke, insult and qualification. Omit nothing and add nothing.

- Do not summarize or moralize.
- Do not add motives, facts or emotions that the original does not state or clearly imply.
- A few words that only unpack the original's meaning are allowed. Examples: "cloudbursts and waterspouts" for *cataracts and hurricanoes*; "the holy water of court flattery" for *court holy-water*.

### 2. Rewrite hard lines; keep clear lines clear

Never leave any of these untranslated with only the pronouns modernized:

- a hard image;
- an archaic idiom;
- a false friend (*knave*, *presently*, *owe* meaning own, *gall*, *convenient* meaning proper, *foppish* meaning foolish).

Keep the image and make its point in the same sentence. Famous lines that are already clear stay recognizable.

### 3. Fold glosses into the sentence

Where a word needs help, choose modern wording that carries the gloss ("the holy water of court flattery"). Blind readers said an appended aside ("— having sex —", "willow, the tree of rejected lovers") sounds like an editor talking.

- Use an appositive only when nothing else works, and keep it to a few words.
- Never use brackets, slashes or footnotes.

### 4. Natural modern sentences, mapped by units of meaning

Do not force one modern line per original verse line.

- Within a sentence or clause group, use natural modern word order.
- The alignment unit is a **short corresponding unit of meaning**. It is usually one sentence or clause, covering about one to four verse lines.
- Each modern unit contains the content of its original lines, and nothing from the neighboring units.
- Record the units as data (see `books/wip/othello-modern-en-acceptance/alignment/`) so that Compare can pair them.

### 5. Puns and double meanings

Keep both senses where one English word can carry them (*praise/appraise*, *head-piece*, *grace* as the King's title). Where it cannot, word the line so that the listener hears the joke.

- **Set up, then land.** Build the line so the setup is intelligible and the punch comes last. The blind readers' most common complaint about the proposals was jokes explained *before* they land ("a sponge that soaks up drink", "as giddy and witless as a young horse").
- Never quietly drop a pun, or replace it with its explanation alone.

### 6. Songs, rhymes and sayings

Songs, rhymed couplets, proverbs and the Fool's rhymes keep rhyme, or at least a regular beat, wherever that costs no sense.

- Blind readers found flattened rhymes "misfire" (King Lear 1.4), and "[Singing.]" lines that no longer sound like songs.
- Where rhyme and sense conflict, sense wins, and the line keeps the song's shape: short lines and a refrain.

### 7. Bawdy, insults and prejudice at the original's strength

Make them understandable. Do not soften them, and do not coarsen them beyond the original.

- This matters most in the Christian characters' antisemitism towards Shylock, and his replies (The Merchant of Venice 3.1).
- It also matters in the racism aimed at Othello, and in period prejudice about color and beauty. A modern listener will hear it. It stays as strong as written, and is neither spelled out more bluntly nor hidden.

### 8. Register and voice

- Formal speakers stay formal. Clowns and servants stay colloquial.
- Grand verse still sounds grand in plain words.
- Keep the play of rank in forms of address (*sirrah*, *nuncle*), translated by function, not flattened.
- Avoid anachronistic slang ("sucker", "cool", "OK", "guys") and modern idioms that change the meaning ("hats off to him", "What's up").

### 9. Who is speaking to whom

Where the ear cannot sort out pronouns, name the person meant. Two examples:

- Othello 9.67, "betraying your friend — me —";
- Lear, "His Grace".

Do not add names where the original withholds them on purpose.

### 10. Deliberate ambiguity and cruxes

- Where the original is deliberately ambiguous, keep an equally open wording.
- Where it is a textual crux, choose the reading of the standard annotators (Schmidt, Onions, the Furness *Variorum*) and **record the choice**. See Othello's `review/GLOSS-DECISIONS.md`.

### 11. Conventions

- Speaker prefixes are verbatim.
- Stage directions are **byte-identical** to the edition (the Hamlet and Macbeth convention).
- Straight apostrophes, spaced em dashes, no ellipses.
- One double-quote style per play. Othello v2 uses curly double quotes, and Macbeth uses straight ones; the house-wide choice is Anders's.
- The live plays currently differ:

  | Play | Apostrophes | Em dashes |
  |---|---|---|
  | Hamlet | straight | spaced |
  | Twelfth Night | curly (508) | spaced |
  | King Lear | straight | 111 unspaced and 97 spaced |
  | The Merchant of Venice | straight | unspaced (237) |

  A full replacement normalizes its own play.
- `_…_` song italics stay in the same places.
- *thou*, *thee* and *thy* become *you* and *your*.
- Oaths stay oaths.
- American spelling throughout ("honor", "molds", "sulfur"), as in the calibrated Hamlet.

### 12. Structure is not wording

Some obstacles cannot be fixed by wording and must not be papered over with added words. Report them for a structural proposal to **both** editions instead. They are parser defects of the served editions:

- speech bracketed as stage directions;
- stripped inline directions;
- lost speaker prefixes;
- speeches split mid-sentence.

The Othello Part A and Part B proposals are the model. The calibration passages found the same defect class in King Lear (4.80–4.82, 1.22–1.23) and Twelfth Night (9.36).

### 13. Sources

Work from the public-domain original and public-domain annotation only:

- Schmidt's *Shakespeare-Lexicon* (1902, on Perseus);
- Onions's *A Shakespeare Glossary* (1911);
- the Furness *New Variorum* volumes.

**Never consult, recall or imitate a copyrighted modernization or translation.** That includes No Fear Shakespeare, Shakespeare Made Easy, SparkNotes and LitCharts.

## Required evidence for a play

Before a play's replacement is accepted, it needs:

1. **The similarity gate passed** (`books/classify-modern-en.py --gate`), with no waiver.
2. **A whole-play independent fidelity review** against the original, with every finding triaged.
3. **An independent validation of the meaning units** (Compare alignment).
4. **Blind comprehension reads of complete representative scenes**, by readers with no access to the original, with triage.
5. **Independent resolution of the contested glosses**, from public-domain annotation.
6. **An independent re-check of every edit** made after review.
7. **A verified character-card re-anchor**, the changed-paragraph list, and final hashes.
