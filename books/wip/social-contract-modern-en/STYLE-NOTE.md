# Style note: Rousseau, *The Social Contract*, Tinct Modern English

- **Book:** `social-contract`
- **Edition:** `modern-en`
- **Date:** 2026-10-05

This note governs every renderer, reviser and reviewer on this candidate.

**Fidelity anchor:** `source-original-en.json`. It is byte-identical to the served `original-en` (sha256 `7bf5abab…54157`), G. D. H. Cole's 1913 English translation of Rousseau's *Du contrat social* (1762). Cole's translation is public domain, and it is the only text this edition renders. No other English translation was consulted or copied. Key terms may be checked against Rousseau's French.

## What this edition is

A sentence-by-sentence modernization of Cole's English into plain contemporary English that a general reader follows on one read. It is **not** a new translation and **not** a summary. It keeps every step of the argument, every example, qualification, rhetorical question and irony.

- **Register.** Everyday modern English. Rousseau is direct, urgent and often sharp; keep that. No contractions in the narrator's voice (they are unnecessary in this argumentative prose), but plain words and short sentences.
- **Sentence length.** Break long periodic sentences where it helps. Keep the logical connectives (therefore, for, but, yet, since) so the steps of the argument stay visible.
- **Do not reword clear sentences** just to lower the similarity score. Change what is archaic, stiff, inverted, ambiguous or misleading today. Where Cole's sentence is already plain, keep it (with spelling and typography brought into line).
- **No additions.** No modern commentary, bracketed notes, headings or framing. A period reference (Sparta, Lycurgus, Rome, the decemvirs, Calvin, Grotius, Hobbes, Caligula, the Ephors…) may be clarified only in a few words **inside the sentence**, and only where the surrounding text supports it. Never add facts the passage does not already imply.
- **Force.** Do not soften Rousseau's claims or sharpen them. Keep his own qualifiers ("almost", "perhaps", "in general", "I think", "it seems").
- **Spelling and typography.** American spelling, as in the edition currently served. Curly quotation marks “ ” ‘ ’ and apostrophe ’. Spaced em dash ` — ` (never `--`). Source `_italic_` markers and `[1]`-style footnote markers are kept exactly where the source places them (the footnote texts themselves are not in the source paragraphs).

## Structure: 1:1 with the served editions

- 48 chapters, 491 paragraphs. Chapter `number`, `title` (including the "Book N, Chapter M — …" form), `section` and per-chapter paragraph counts are copied from the source unchanged. Top-level `sections` is copied unchanged.
- Output paragraph N renders source paragraph N and begins with equivalent content. Never merge, split, reorder, drop or invent paragraphs.
- **Source paragraph fragments.** Cole's served text has several paragraphs that are the tail of a sentence cut off from the previous paragraph (for example ch 22 p23, ch 26 p10, ch 30 p4, ch 31 p15, ch 45 p11, ch 46 p8 and p9). Keep each fragment a separate paragraph, starting and ending where the source does. Render only the words that are there. Do not complete the sentence by borrowing words from the neighbouring paragraph.
- Output length is normally at least 75% of the source paragraph's word count.
- Latin (and any other non-English) quoted text is kept verbatim. Bracketed English renderings of it, as in Cole, are modernized like the rest.

## Key terms (fixed for the whole book)

| Term in Cole | Use | Notes |
|---|---|---|
| the general will (*volonté générale*) | **the general will** | Never "common will", "public will", "popular will". |
| the will of all (*volonté de tous*) | **the will of all** | A deliberate contrast with the general will (ch 12): the sum of private wills vs. the common interest. Do not blur them. |
| particular will / private will | **particular will** / **private will** | As in Cole. |
| the Sovereign (*le souverain*) | **the Sovereign** | The people as law-making body. Keep the capital. Never "the ruler", "the king" or "the government". |
| sovereignty | **sovereignty** | |
| the State | **the State** | Capital, as Cole. Also "body politic", "city", "Republic" as in Cole. |
| the government / prince / magistrates | **government**, **prince**, **magistrates** | Government is the intermediary body that executes the general will. "Prince" is Rousseau's term for the body that holds executive power (ch 22: "the whole body bears the name prince"). Keep "prince" with this sense and never merge government into the Sovereign. |
| subject / citizen / people | **subjects**, **citizens**, **the people** | Rousseau's definition (ch 6): collectively the people; individually *citizens* as sharing in sovereign authority, *subjects* as bound by the laws. Keep them distinct. |
| the social compact (*pacte social*) | **social compact** | Matches the served chapter heading "The Social Compact". "Social pact" is the same term; use "compact" throughout. |
| convention | **convention** (agreement) | Technical sense: an agreement establishing right (ch 1, 4, 5). Keep "convention" for the term; "agreement" may stand in where Cole's "convention" is an ordinary agreement. |
| civil liberty | **civil liberty** | Distinct from **natural liberty** and **moral liberty** (ch 8). Keep each exact. |
| natural liberty / state of nature | **natural liberty** / **state of nature** | |
| legislator | **legislator** | The extraordinary founder (ch 7). Not "lawmaker" in the ordinary sense; the Sovereign makes laws, the legislator drafts them. |
| law | **law** | |
| alienate / inalienable | **give away** or **transfer**; **inalienable** | "Inalienable" is kept (chapter heading). |
| civil religion / civil profession of faith | **civil religion**; **civil profession of faith** | Ch 47. Keep distinct from the religion of man and the religion of the citizen as Cole names them. |
| right / force / power | **right**, **force**, **power** | Rousseau's contrast between right and force is central; never swap them. |
| *mœurs* (Cole: morals, manners) | **morals**, **manners**, **customs** | As Cole chooses by context. |
| the right of the strongest | **the right of the strongest** | |
| despotism / tyranny | as Cole | Ch 31 defines tyrant and despot; keep both words. |

Roman and other institutional terms stay as named (comitia, curiae, centuries, tribes, tribunes, consuls, decemvirs, dictator, censors, Ephors, Senate, Parliament, Diet), with an in-sentence gloss only where the text itself supports one.

## Quotations and names

- Rousseau's renderings of Grotius, Hobbes, Aristotle, Plato, Tacitus, Machiavelli, Montesquieu and others are Rousseau's text as Cole renders it; modernize them like the rest of the prose, keeping the sense and attribution.
- Latin quotations stay verbatim; bracketed translations are modernized.
- Names are normalized to current English spelling (Machiavelli, Cæsar kept as Cole prints it unless plainly clearer as Caesar; use one form book-wide: **Caesar**).
- Bracketed or parenthetical citations keep all their data (titles, books, chapters).

## Source artifacts handled in modern-en only

- Mid-sentence paragraph fragments are kept as fragments (see above) and listed in the acceptance record.
- Where the source drops a full stop or has a plain typo, the modern-en edition corrects it silently. Anything that is more than punctuation is recorded in the acceptance record.
