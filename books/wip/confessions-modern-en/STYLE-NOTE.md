# Confessions — Tinct Modern English: style note

Assignment: repair `confessions` `modern-en` (Augustine, *Confessions*, 13 books).
Baseline: `original-en` = E. B. Pusey's translation (1838), as served in
`app/public/data/editions/confessions-original-en.json`
(sha256 `64b39a8ae77d7175c904625fcc0bf3de13cb59e346e964b37ec8f5e47d95a6d7`).
Latin reference (checking only, not an edition): James J. O'Donnell's text as
hosted by The Latin Library, `https://www.thelatinlibrary.com/augustine/conf{1..13}.shtml`.

These decisions were made once, before rendering, and apply to all 13 books.

## 1. How God is addressed — **You**, capitalized

- Direct address to God uses **You / Your / Yours / Yourself**, capitalized
  everywhere, including mid-sentence. Never *Thou / Thee / Thy / Thine*.
- Third-person pronouns for God (and for Christ as God) are capitalized:
  **He / Him / His / Himself**. Pronouns for people, angels, the soul, etc.
  stay lowercase.
- Why *You* and not *Thou*: *Thou* is exactly the register that made the old
  "modern" edition unreadable, and modern readers hear it as distance, whereas
  Augustine's Latin *tu* is the intimate, ordinary second person. Why
  capitalized: the *Confessions* is a single long address to God that keeps
  turning aside to speak about Monica, friends, Manichees and readers; the
  capital marks at a glance who is being spoken to, and it matches the
  convention already used in the previously modernized Books 1, 2, 7 and 11
  and Pusey's own capitalization, so the reader sees no change of convention
  between editions.
- Verbs follow: *You are, You know, You have made*. No *-est / -eth* forms.

## 2. Register

- Contemporary, literate English prose. Short-to-medium sentences where Pusey
  stacks clauses, but keep Augustine's rhetoric: his questions, exclamations,
  antitheses, repetitions and prayers stay as they are in shape and number.
- No archaic morphology (*hath, doth, art, wert, knoweth, ye, whence, whither,
  wherefore, hither, thereof, aught, naught* used archaically, *fain, wont,
  ere, lo*, etc.). *Behold* may be kept only inside a scripture quotation.
- Do not summarize, condense, explain, gloss, or add editorial commentary.
  Every clause, image, example, name and argument step of Pusey's paragraph
  must appear. Aim for 85–115% of Pusey's word count per paragraph; below 75%
  is a defect to investigate.
- Keep exclamation marks and questions. Keep first-person confessional voice.

## 3. Doctrinal and philosophical terms — keep precise, do not paraphrase away

Keep these as terms (modern spelling, but the same concept): *grace, sin,
original sin (where stated), salvation, mercy, the Word, the Son, the Holy
Spirit / Spirit, Trinity, Mediator, flesh* (in the Pauline sense — not
"body"), *spirit, soul, mind, substance, essence, nature, incorruptible,
corruptible, immutable / unchangeable, eternal, eternity, time, creature*
(= created thing), *Creator, form / formless matter, heaven of heaven,
continence, concupiscence* (may be rendered "lust" or "sinful desire" only
where Pusey's context is plainly sexual or general desire and the Latin is
*concupiscentia*; keep *concupiscence* in Book 10's triad), *lust of the
flesh, lust of the eyes, pride of life, catechumen, baptism, the Catholic
Church, the faith, Scripture, the Law and the Prophets, the Apostle* (= Paul),
*Manichees* (Pusey's form), *astrologers, Platonists / books of the
Platonists, Academics*.

Do not convert *the flesh* into *the body*, *continence* into *abstinence*
generally, *creature* into *animal*, or *substance* into *stuff*. Do not
introduce later theological vocabulary Augustine does not use.

## 4. Scripture and quotations

- Scripture quotations stay **recognizable**: modernize archaic pronouns and
  verb forms, but keep the familiar cadence and key words
  (e.g. "Great is the Lord, and greatly to be praised"; "Take up and read";
  "Make me chaste and continent, but not yet"; "not in rioting and
  drunkenness…").
- Do not add citations, verse references, or quotation marks that Pusey does
  not have. Keep the quotation marks Pusey has.
- Where a phrase is so famous that modernizing it would make it
  unrecognizable, Pusey's wording may be kept; each such case is recorded in
  the book's NOTES file under "Pusey kept on purpose".

## 5. Structure (non-negotiable)

- Chapter N = Book N, titled `Book N` exactly as served.
- Paragraph i of each book corresponds 1:1 to paragraph i of `original-en`.
  Never merge, split, reorder, drop or insert paragraphs. Paragraph i must
  begin with the content of Pusey's paragraph i.
- Final paragraph of Book 13, `GRATIAS TIBI DOMINE`, is kept verbatim (a
  Latin colophon carried by the served original; see open issues).

## 6. Where Pusey is unclear

Check the Latin. Render Augustine's meaning as Pusey intended it; if Pusey
misreads or is ambiguous, follow the Latin and record the paragraph in the
book NOTES under "Latin consulted". Do not consult or echo copyrighted modern
translations (Chadwick, Boulding, Ruden, Pine-Coffin, Outler, Warner, etc.).

## 7. Names

Use Pusey's name forms exactly as the served original has them (Patricius,
Adeodatus, Alypius, Nebridius, Ambrose, Simplicianus, Victorinus, Pontitianus,
Faustus, Firminus, Vindicianus, Romanianus, Verecundus, Hierius, Hortensius,
Manichees / Manichaeus / Manichaean, Tully and Cicero where Pusey has each,
Thagaste, Madaura, Carthage, Milan, Rome, Ostia, Cassiacum). Do not add names
Pusey does not use — Augustine's mother appears by name in Book 9 only if and
where Pusey names her.

## 8. Decisions made during rendering (apply to all books)

- **caritas: "love" by default** (not "charity"), since modern "charity" means
  almsgiving. **Exception (revised after review):** "charity" is kept where
  Augustine uses *caritas* as a named principle ("the end of the commandment
  is charity", 1 Tim 1:5; "the two precepts of charity"; "mother Charity"; the
  invocation "O Love … O Charity, my God", where *amor* and *caritas* stand
  side by side), and where "love" would collide with *amor*/*dilectio* in the
  same sentence. Each kept "charity" is checked in the fix pass.
- **Pusey's plain errors and gaps.** Pusey is followed for meaning. Where he
  mistranslates, has a misprint, or leaves out words of Augustine's that the
  Latin plainly has (e.g. Book 6 ¶23 "to open Your hand", Ps 145:16), the Latin
  is followed. Each case is logged in the book's NOTES under "Latin consulted".
- **Period terms are not softened.** Book 6 ¶24 keeps "concubine".
- **"Holy Ghost" → "Holy Spirit"** throughout.
- **Pusey's "mathematicians"** (meaning astrologers) is kept as "mathematicians"
  wherever Augustine's usage is in view, without a gloss.
- **creatura as a collective** ("the spiritual and corporeal creature" = the
  whole created order) → "creation"; a single created thing stays
  "creature". Accepted in Book 12; apply the same way elsewhere.
- **Pusey's capitals for human addressees** (e.g. Book 6 ¶9, ¶11; Book 12 ¶33) are
  corrected: capitals only for God.
- **Genesis 1:1 "In the beginning".** Lowercase in the plain verse and wherever
  the reading "at first" is in view. "Beginning" is capitalized only where
  Augustine identifies the Beginning with the Son / Wisdom. Book 12 is
  harmonized to this rule in review.
- **Lost words in the served Pusey text** (e.g. Book 10 ¶45, where the subject
  "John" dropped out before "locusts") are restored from the Latin.
- **concubitus → "sexual union"**, not "concubinage" (Book 10 ¶40, ¶46).
- **Spelling: American**, matching Tinct's other modern-en editions
  (honor, neighbor, theater, Savior, offense, defense). The few British forms
  that came over from Pusey were normalized in one spelling-only pass after
  rendering.
