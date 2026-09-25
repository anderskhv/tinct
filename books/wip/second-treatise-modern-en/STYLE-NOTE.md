# Second Treatise — Tinct Modern English: style note

Assignment: repair `second-treatise` `modern-en` (content only). Baseline: served
`original-en` at main `8a50db7d` (identical to `0a306caf`), SHA-256
`efbd7cabd14ed99f98aabae7a95f48e8102db75f0b7aaae0054d0ffe4675b0d0`, from
Project Gutenberg #7370 (see `books/raw/second-treatise/SOURCE.md`). Prior
served `modern-en` SHA-256
`177b364414c437af89fe5d09b8922d71ff772ccf7da6ec2e64c710ed061269bf`.

## Aim

A genuine modern English reading edition of Locke's own English. A present-day
reader should be able to follow every step of the argument without the 1689
syntax, while every claim, condition, qualification, example, and
cross-reference remains. This is a rendering, not a summary and not a spelling
pass.

## Structure (non-negotiable)

- 19 chapters, 301 paragraphs, exactly 1:1 with served `original-en`. Paragraph
  N renders paragraph N and begins with the content of its first sentence. No
  merges, splits, reordering, or moving material across paragraph boundaries.
- Chapter titles are unchanged from the served editions (they are identity
  labels in the reader).
- **Section numbering.** The served editions strip Locke's section labels
  (§1–§243) from the paragraph text; the parser missed two (`Sect, 10.` at
  ch2 p8 and `Sec. 219.` at ch19 p12 in `original-en`). Every section boundary
  falls at a paragraph boundary, and `SECTION-MAP.json` records the paragraph
  where each § starts. The rendering keeps every § boundary exactly where it is
  (no section content moves into a neighbouring paragraph) and does not carry
  the two leaked labels, so modern-en is consistent with the other 241
  sections. Whether the reader should display § numbers is an integration
  decision for Codex (the map makes it possible for both editions at once).
- Locke's internal references to his own sections (for example "sect. 6." in
  the Hooker footnote) and his citations are kept.

## Sentences

- Break long periodic sentences into two or more sentences where that helps.
  Keep the order of the steps. Where Locke builds a chain ("and so", "for",
  "whereby", "which being so"), make the logical connective explicit: *so,
  because, which means, therefore, in that case*.
- Keep every condition and qualification: *unless, only if, as far as, in some
  cases, for the most part, I think, it seems, at least*. Keep hedges as hedges
  and certainties as certainties. Never turn "may" into "must" or "is".
- Keep negations and double negations accurate (resolve them into plain
  positive form only when the meaning is unchanged).
- Keep Locke's first person, rhetorical questions, irony against Filmer and
  his opponents, exclamations and emphasis.
- Modernize vocabulary and grammar: *hath/doth → has/does; whilst → while;
  wherein/whereby/thereof → in which/by which/of it; shew → show;
  betwixt → between; viz. → namely; 'tis → it is; amongst → among*. Replace
  dead or shifted senses: *prejudice* (= harm), *indifferent* (= impartial),
  *curious* (= careful), *want* (= lack), *several* (= separate/different),
  *doubtless*, *countenance*, *mischief* (= harm/danger), *event*
  (= outcome), *nice* (= fine/precise), *let* (= hinder), *vulgar*
  (= common) — using the present-day word that carries Locke's meaning.
- Gender: keep Locke's "man/men" and "he" for persons generally. It is his
  historical usage and his argument is about "mankind"; changing it would
  intrude.
- Keep proper names, biblical references and places exactly (Adam, Filmer,
  Hooker, Barclay, Bilson, Jephthah, Joash, Jehoshaphat, Hezekiah, the
  Spartans, Palantus, Rome and Venice, Soldania, Peru, Nero, Caligula,
  William the Conqueror, the Normans and Saxons, the Swiss and Dutch, etc.).

## Technical terms (keep stable and recognizable)

| Locke | Modern-en choice | Note |
|---|---|---|
| state of nature | **state of nature** | always, never "natural condition" |
| state of war | **state of war** | always |
| law of nature | **law of nature** | "natural law" only where Locke says it |
| property | **property** | Locke's broad sense = "lives, liberties and estates" (§123). Keep "property" wherever he means that broad sense or the preservation of property as the end of government. Use "possessions"/"goods"/"estate" only where Locke himself narrows to things owned. Never flatten "property" into "possessions" in the broad sense. |
| lives, liberties and estates | **lives, liberties and estates** | fixed phrase, kept as written |
| estate(s) | **estate(s)** where paired with life/liberty; otherwise "goods, land", as fits | |
| consent (express / tacit) | **consent (express / tacit)** | "tacit consent" kept |
| commonwealth | **commonwealth** | Locke's own gloss (ch 10) is kept; not "state" |
| civil / political society, body politic | **civil society, political society, body politic** | kept |
| the legislative | **the legislative** (noun) | Locke's noun; not "the legislature" except where the text needs a helper ("the legislative power") |
| the executive (power) | **the executive (power)** | |
| federative power | **federative power** | Locke's coinage; his gloss (war, peace, leagues, alliances) kept |
| prerogative | **prerogative** | "power to act according to discretion for the public good, without the prescription of the law, and sometimes even against it" kept in full |
| tyranny / usurpation / conquest | **tyranny / usurpation / conquest** | |
| dissolution (of society / of government) | **dissolution** | the society/government distinction kept |
| appeal to heaven | **appeal to heaven** | always; Jephthah's example kept |
| trust / fiduciary power / forfeit | **trust / fiduciary power / forfeit** | the trust relationship is central to ch 13 and 19 |
| supreme power | **supreme power** | |
| magistrate | **magistrate** | where Locke means the civil ruler; "ruler" only where he does |
| paternal / parental power | **paternal / parental power** | Locke's point in ch 6 about the word itself depends on it |
| despotical power | **despotic power** | spelling only |
| political power | **political power** | Locke's definition (§3) kept in full |
| executive power of the law of nature | **executive power of the law of nature** | Locke's "strange doctrine" (§9, §13) |
| inconveniences (of the state of nature) | **inconveniences** | Locke's term of art; add "drawbacks" only as helper, not replacement |
| the people / the community | **the people / the community** | |
| waste / spoil (ch 5) | **waste / spoil** | spoilage limit kept |
| labour, the common, enclosure, money | **labour** (British spelling kept for the term), **the common / common land, enclose, money** | |
| municipal law, positive law | **municipal law, positive law** | |
| "rebellare" / rebels (ch 19) | **rebels, rebellion**; the Latin etymology kept | |

## Quotations

**Hooker (Ecclesiastical Polity).** Decision: *modernize, kept recognizable
and attributed.* Hooker's words are evidence in Locke's argument, and in 1594
English they are the hardest passages in the book; the verbatim text stays
available in the original-en Compare edition. So each Hooker quotation is
rendered into modern English by the same rules, with every clause kept, set in
quotation marks, and followed by its citation. The citation is kept but
de-abbreviated consistently as: `Hooker, Ecclesiastical Polity, book I,
section 10` (roman book numeral, arabic section; e.g. "Eccl. Pol. l. i.
sect. 10" → "Hooker, Ecclesiastical Polity, book I, section 10"; "l. iii. sect.
9" → "book III, section 9"). Footnote paragraphs keep their `(*` … `)` /
`(**` … `)` markers so their link to the note mark in the main text stays
visible. Where Locke's main text marks a note with `*`, the mark is kept.

**Barclay and other Latin.** Latin quotations (Barclay, ch 19; the Juvenal
lines in the `/*[4] … */` note) are kept **verbatim**, untranslated and
unmodernized, because they are foreign-language text and Locke supplies his
own English. Locke's own English translations of Barclay ("In English thus",
"Which in English runs thus") are Locke's prose and are modernized under the
Hooker rule, in quotation marks.

**Other quotations and Scripture** (e.g. "Honour the king", "he that resists
the power resists the ordinance of God", Jephthah's "the Lord the Judge be
judge", 2 Kings 18:7 "Hezekiah rebelled against the king of Assyria") keep
their wording recognizable; archaic pronoun forms may be modernized only where
the phrase is Locke's paraphrase, not a direct Scripture quotation.

## Source corrections

- §2 (ch1 p6): Gutenberg #7370 is corrupt ("distinguish these powers one from
  wealth, a father of a family…"). Rendered from the standard reading ("one
  from another, and show the difference between a ruler of a commonwealth, a
  father of a family, and a captain of a galley"). The existing modern-en had
  already done this; kept.
- Other suspected source corruptions are listed in `REVIEW-RECORD.md` rather
  than silently corrected.

## Revising the existing REAL chapters (1–5, 10)

Revise, don't discard: keep sentences that are already clear, accurate modern
English. Change only archaisms left in place, fidelity problems, inconsistent
terms, Hooker handling, and sentences still in 1689 syntax.

## Decisions added during rendering and review (2026-09-25)

- **Latin phrases inside Locke's English** (*jure divino, caeteris paribus,
  pro tempore, de facto, ipso facto, Salus populi suprema lex, in vacuis
  locis, amor sceleratus habendi, rebellare*) stay in Latin, in Locke's word
  order, with **no added English gloss** unless Locke supplies one. Where
  Locke gives his own English beside the Latin ("in vacuis locis, in any part
  of the world they can find free and unpossessed"; "amor sceleratus habendi,
  evil concupiscence"), his English is kept, modernized ("evil craving for
  possession"). Glosses the renderers added were removed after review.
- **Scripture.** Direct quotations keep King James wording, including archaic
  pronouns and verb forms ("the Lord hath sought him a man", "remaineth").
  References keep **Locke's own abbreviated form** ("Judg. xi. 11",
  "2 Kings xviii. 7", "Exod. xx. 12"), not converted to chapter:verse.
- **Spellings.** "Jephthah" throughout (source varies "Jephtha"/"Jeptha").
  "Melchizedec", "Mispah", "Salmanasser", "Josephus Acosta", "Drawcansirs",
  "wampompeke" kept as Locke spells them.
- **"possessions"** appears only where Locke himself writes "possession(s)"
  (checked by every reviewer, paragraph by paragraph). Broad-sense
  "property" is never replaced.
- **"legislature"** appears once (ch7 p19), because Locke himself writes it
  there. Everywhere else: "the legislative".
- **"councils" → "counsels"** (ch18 p14): Locke means designs/plans; modern
  "councils" would mislead.
- **Money** "5l." → "£5"; "50l. or 500l. per ann." → "£50 or £500 a year".
- **Hooker "ibid." citations** in ch11 stay "Ibid." as in Locke; ch7's
  truncated "Hooker, ib[id.]" is completed as the full citation (book I,
  section 10), which is what the ibid. points to.
- **Man/men, he** kept as Locke's generic usage; "brethren" (ch16 p16) is
  rendered "brothers and sisters" because Locke's inheritance argument there
  covers all the children.
